define('works/views/app/doc_detail/doc_activity_item', function(require) {
	var ActivityItemTpl = require('hgn!works/templates/app/doc_detail/doc_activity_item');
	var taskLang = require("i18n!task/nls/task");
	var commonLang = require('i18n!nls/commons');
	var FileUpload = require("file_upload");
	var AttachView = require("attach_file");
	var ContentViewer = require("content_viewer");
	var CommentView = require("comment");
	var ProfileView = require("views/profile_card");

	require("go-webeditor/jquery.go-webeditor");
	require("jquery.go-preloader");

	var lang = {
		"commentWrite": taskLang["댓글쓰기"],
		"edit": commonLang["수정"],
		"attach": commonLang["파일 첨부"],
		"save": commonLang["저장"],
		"cancel": commonLang["취소"],
		"count": taskLang["개"],
		"comment": commonLang["댓글"],
		"showAll": taskLang["모두 보기"],
		"fold": commonLang["접기"]
	};

	var _savingFlag = false;

	var ActivityItemView = Backbone.View.extend({
		initialize: function (options) {
			this.model = options.model;
			this.appletId = options.appletId;
			this.docId = options.docId;
			this.model.set('appletId', this.appletId);
			this.model.set('docId', this.docId);
			this.editorId = "activityEditor" + this.model.get("id");
			this.isSaaS = GO.session().brandName == "DO_SAAS";
			this.totalAttachSize = 0;
			this.totalAttachCount = 0;
		},
		tagName: "li",
		events: {
			"click span.ic_del": "attachDelete",
			"click #editActivity": "showEditForm",
			"click #closeEditorBnt": "closeEditForm",
			"click #deleteActivity": "confirmDelete",
			"click #editActivityBtn": "submitActivity",
			"click #showAllComment": "showAllComment",
			"click #foldComment": "foldComment",
			//"click #toggleComment" : "toggleComment",
			"click a[data-userid]": "showProfileCard",
			"click span[data-tag=profile]": "showProfileCard"
		},

		render: function () {
			var self = this;
			this.$el.html(ActivityItemTpl({
				lang: lang,
				data: this.model.toJSON(),
				snsDate: {
					date: GO.util.snsDate(this.model.modifyTime()),
					modifyFlag: this.model.isModify()
				},
				commentCount: this.model.get("commentCount"),
				commentPresent: this.model.commentPresent(),
				isDisplayComment: this.model.commentPresent(),
				hasMoreComment: this.model.hasMoreComment(),
				content: this.model.get("content")
			}));

			renderContentViewer.call(this);
			renderAttaches.call(this, true);

			this.commentView = CommentView.init({
				el: this.$el.find("#activityReply"),
				typeUrl: "works/activity",
				typeId: this.model.get("id"),
				isPrintMode: false,
				rootId: this.model.get("id"),
				rootUrl: "works/activity",
				isReply: false,
				isWritable: true
			});
			this.commentView.render();
			this.commentView.setComments(this.model.get("comments"));
			this.commentView.renderList();
			this.$el.on("comment:change", function (e, type, count) {
				var hasFoldComment = count > 3;
				self.$("#foldComment").toggle(hasFoldComment);
				self.$("#showAllComment").hide();
				self.$("span.num").text(count ? count : "");
			});
		},

		getContent: function () {
			var content = this.editor.getInstance(this.editorId).getContent();
			return (content == "" || $.trim(content) == "<br>") ? "" : content;
		},

		attachDelete: function (e) {
			$(e.target).parents("li[data-name]").hide();
		},

		showEditForm: function () {
			var content = this.contentViewer.getContent();

			if (!this.editor) {
				initSmartEditor.call(this, content);
				initFileUpload.call(this);
			} else {
				this.editor.getInstance(this.editorId).setContent(content);
			}

			this.$el.find("div[data-type=edit]").show();
			this.$el.find("div[data-type=view]").hide();
			renderAttaches.call(this, false);
			this.contentViewer.hide();
		},

		submitActivity: function () {
			if (!GO.Editor.getInstance(this.editorId).validate()) {
				$.goError(commonLang['마임 사이즈 초과']);
				return false;
			}

			var self = this;
			var attachCount = this.model.get("attaches").length;
			var content = this.getContent();

			if (_savingFlag) {
				return;
			}
			_savingFlag = true;

			this.model.set({
				content: content,
				attaches: this.getAttaches()
			});
			this.model.save({}, {
				success: function (model) {
					self.$el.trigger("change:log");
					self.trigger("change:attach", model.get("attaches").length - attachCount);
					self.contentViewer.setContent(model.get("content"));
					self.contentViewer.render();
					self.closeEditForm();
					_savingFlag = false;
					renderAttaches.call(self, true);
				},
				complete: function () {

				},
				error: function (model, resp) {
					_savingFlag = false;
					$.goError(resp.responseJSON.message);
				}
			});
		},

		closeEditForm: function () {
			this.$el.find("div[data-type=edit]").hide();
			this.$el.find("div[data-type=view]").show();
			this.$el.find("div.tool_bar").css("display", "");
			this.contentViewer.show();
			this.editor.getInstance(this.editorId).setContent(" ");
			this.$el.find("#editModeFileWrap").find("li:hidden").show();
			renderAttaches.call(this, true);
		},

		getAttaches: function () {
			var attaches = [];
			_.each(this.$el.find("#editModeAttachArea").find("li:not(.attachError)"), function (attach) {
				if ($(attach).is(":hidden")) {
					$(attach).remove();
					return;
				}
				attaches.push({
					id: $(attach).attr("data-id") || null,
					path: $(attach).attr("data-path"),
					name: $(attach).attr("data-name"),
					hostId: $(attach).attr("data-hostId")
				});
			});
			return attaches;
		},

		confirmDelete: function () {
			var self = this;
			$.goPopup({
				title: taskLang["활동기록 삭제"],
				message: taskLang["활동기록 삭제 설명"],
				buttons: [{
					btype: "confirm",
					btext: commonLang["확인"],
					callback: function () {
						self.destroyActivity();
					}
				}, {
					btext: commonLang["취소"],
					callback: function () {
					}
				}]
			});
		},

		destroyActivity: function () {
			var self = this;
			var attachCount = this.model.get("attaches").length;
			this.model.destroy({
				success: function () {
					self.$el.trigger("change:log");
					self.trigger("change:attach", 0 - attachCount);
					self.trigger("change:activity", true);
					self.$el.remove();
				},
				error: function (model, resp) {
					$.goError(resp.responseJSON.message);
				}
			});
		},

		showAllComment: function () {
			if (this.commentView.isAll) {
				this.$("#activityReply").find("li").show();
				this.$("#foldComment").show();
				this.$("#showAllComment").hide();
			} else {
				var self = this;
				this.commentView.fetchComments(true).done(function (collection) {
					if (collection.data.length > 3) self.$("#foldComment").show();
					self.$el.find("#showAllComment").hide();
					self.commentView.isAll = true;
				});
			}
		},

		foldComment: function () {
			var count = this.commentView.collection.length - 3;
			this.$("#activityReply").find("li:lt(" + count + ")").hide();
			this.$("#foldComment").hide();
			this.$("#showAllComment").show();
		},

		showProfileCard: function (e) {
			var userId = $(e.currentTarget).attr("data-userid");
			ProfileView.render(userId, e.currentTarget);
		},

		getViewedTotalAttachSize: function (element) {
			var viewedTotalAttachSize = 0;
			$(element).find("li").each(function (index, element) {
				viewedTotalAttachSize += parseInt(element.getAttribute('data-size'), 0);
			});
			return viewedTotalAttachSize;
		},

		resetAttachSizeAndCount: function () {
			if (this.isSaaS) {
				this.totalAttachSize = 0;
				this.totalAttachCount = 0;
			}
		}
	});
	
	function renderContentViewer(){
		this.contentViewer = ContentViewer.init({
			$el : this.$("#activityContent"),
			content : this.model.get("content")
		});
	}

	function renderAttaches(isViewMode) {
		var self = this;
		var id = isViewMode ? "viewModeAttachArea" : "editModeAttachArea";
		var attachView = null;

		if (isViewMode) {
			attachView = AttachView.create(null, this.model.get("attaches"), function (attach) {
				return GO.contextRoot + "api/works/activity/" + self.model.id + "/download/" + attach.id;
			});
		} else {
			attachView = AttachView.create(null, this.model.get("attaches"), null, "edit");
		}

		attachView.done(function (view) {
			self.$("#" + id).replaceWith(view.el);

			view.$el.addClass(isViewMode ? "feed origin" : "");
			view.$el.attr({
				id: id,
				"data-type": isViewMode ? "view" : ""
			});
		});
	}

	function initFileUpload(options) {
		var self = this;
		var options = {
			el: "#file-control-activity-" + this.model.get('id'),
			context_root: GO.contextRoot,
			button_text: "<span class='buttonText'>" + lang.attach + "</span>",
			url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie')
		};

		var maxAttachSize = parseInt(GO.config('commonAttachConfig').maxAttachSize);
		var maxAttachByteSize = maxAttachSize * 1024 * 1024;
		var maxAttachNumber = parseInt(GO.config('commonAttachConfig').maxAttachNumber);

		(new FileUpload(options))
		.queue(function (e, data) {

		})
		.start(function (e, data) {
			if (!GO.config('attachFileUpload')) {
				$.goAlert(commonLang['파일첨부용량초과']);
				return false;
			}

			if (self.isSaaS) {
				if (maxAttachByteSize < data.size) {
					$.goMessage(GO.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
					return false;
				} else {
					self.totalAttachSize += data.size;
				}

				var currentTotalAttachCount = $('#editModeAttachArea').find("li").size() + self.totalAttachCount + 1;
				if (maxAttachNumber < currentTotalAttachCount) {
					$.goMessage(GO.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
					return false;
				} else {
					self.totalAttachCount++;
				}
			}
		})
		.progress(function (e, data) {

		})
		.success(function (e, resp, fileItemEl) {
			var isImage = GO.util.isImage(resp.data.fileExt);
			var attachEl = self.$("#editModeAttachArea");
			var area = isImage ? "ul.img_wrap" : "ul.file_wrap";

			fileItemEl.attr("data-hostId", resp.data.hostId);
			fileItemEl.attr("data-size", resp.data.fileSize);

			if (GO.util.fileUploadErrorCheck(resp)) {
				fileItemEl.find(".item_file").append("<strong class='caution'>" + GO.util.serverMessage(resp) + "</strong>");
				fileItemEl.addClass("attachError");
			} else {
				if (GO.util.isFileSizeZero(resp)) {
					$.goAlert(GO.util.serverMessage(resp));
					return false;
				}
			}

			attachEl.find(area).show().append(fileItemEl);
			self.resetAttachSizeAndCount();
		})
		.complete(function (e, data) {

		})
		.error(function (e, data) {
			if(data.jqXHR) {
				if(data.jqXHR.statusText == "abort") {
					$.goAlert(commonLang['취소되었습니다.']);
				} else {
					$.goAlert(commonLang['업로드에 실패하였습니다.']);
				}
				self.resetAttachSizeAndCount();
			}
		});
	}

	function initSmartEditor(content) {
		$("#" + this.editorId).goWebEditor({
			contextRoot: GO.config("contextRoot"),
			lang: GO.session('locale'),
			editorValue: content
		});

		this.editor = GO.Editor;
	}
	
	return ActivityItemView;
});