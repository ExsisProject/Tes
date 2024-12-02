define('works/views/app/doc_detail/doc_activity', function(require) {
	// dependency
	var when = require('when');
	var WorksUtil = require('works/libs/util');

	// models
	var ActivityCollection = require('works/collections/applet_activities');
	var ActivityModel = require('works/models/applet_activity');

	// views
	var ActivityItemView = require('works/views/app/doc_detail/doc_activity_item');

	// templates
	var renderActivityTpl = require('hgn!works/templates/app/doc_detail/doc_activity');
	var renderAttachItemTpl = require('hgn!works/templates/app/doc_detail/doc_attacth');

	// languages
	var taskLang = require("i18n!task/nls/task");
	var worksLang = require("i18n!works/nls/works");
	var commonLang = require('i18n!nls/commons');

	var FileUpload = require("file_upload");

	require("go-webeditor/jquery.go-webeditor");
	require("jquery.go-preloader");
	require('go-fancybox');
	
	var lang = {
		"activity" : taskLang["활동기록"],
		"attach" : commonLang["첨부파일"],
		"writeActivity" : taskLang["활동기록 쓰기"],
		"addAttach" : commonLang["파일 첨부"],
		"regist" : commonLang["등록"],
		"cancel" : commonLang["취소"],
		"save" : commonLang["다운로드"],
		"preview" : commonLang["미리보기"], 
		"fold": worksLang['접기'], 
		'unfold': worksLang['펼치기']
	};
	
	var _savingFlag = false;

    var TAB_TYPE= {
        "ACTIVITY" : "activity",
        "ATTACH" : "attach"
    };

	var DocActivityView = Backbone.View.extend({
		id: 'activityView',
		initialize: function (options) {
			this.docId = options.docId;
			this.appletId = options.appletId;
			this.reqAppletId = options.reqAppletId;
			this.collection = new ActivityCollection({
				docId: options.docId,
				appletId: options.appletId,
				reqAppletId: this.reqAppletId
			});
			this.isSaaS = GO.session().brandName == "DO_SAAS";
			this.totalAttachSize = 0;
			this.totalAttachCount = 0;
		},

		events: {
			"click #fileWrap span.ic_del": "attachDelete",
			"click #writeActivity": "writeActivity",
			"click #editorToggle": "editorToggleListener",
			"click #closeEditor": "editorToggleListener",
			"click li[data-tag=activityTab]": "activityTabToggleAction",
			"click #activityAttachArea a.btn-preview": "preview",
			"click span[data-tag='toggle']": "toggleView"
		},

		toggleView: function (e) {
			var target = $(e.currentTarget);
			var activeTab = $("li[data-tag=activityTab]").filter(".active");
			var tabType = activeTab.attr("data-type");

			if (tabType == TAB_TYPE.ACTIVITY) {
				var activeArea = this.$('#activity-container');
			} else {
				var activeArea = this.$('#activityAttachArea');
			}
			if (activeArea.css('display') == 'none') {
				this.showActivityTabByType(tabType);
			} else {
				activeArea.hide();
			}

			toggleFoldingButton(target);
		},

		render: function () {
			var self = this;
			this.$el.addClass("activity_type");
			this.$el.html(renderActivityTpl({
				lang: lang,
				fileCount: this.getAttachCount(this.collection.models),
				activityPresent: this.collection.length > 0,
				activityCount: this.collection.length
			}));

			initFileUpload.call(this);

			//활동기록이 하나도 없을땐 에디터를 호출한다.
			if (this.collection.length == 0) {
				initSmartEditor.call(this);
			} else {
				this.$("div[data-area=editor]").hide();
			}

			this.$el.on("change:attach", function (e, param) {
				self.isChangeAttach = true;
				changeAttachCount.call(self, param);
			});

			return renderActivities.call(this);
		},

        getAttachCount: function (collection) {
            var totalAttachCount = 0;
            _.each(collection, function (model) {
                totalAttachCount += model.get("attaches").length;
                var comments = model.get("comments");
                _.each(comments, function (comment) {
                    totalAttachCount += comment.attaches.length;
                });
            });
            return totalAttachCount;
        },

		dataFetch: function () {
			var deferred = when.defer();
			var fetchActivity = this.collection.fetch();

			$.when(fetchActivity).done(function () {
				deferred.resolve();
			});

			return deferred.promise;
		},

		attachDelete: function (e) {
			$(e.target).parents("li").remove();
		},

		editorToggleListener: function (param) {
			//활동기록 쓰기 버튼을 눌렀을때 접혀져 있는 상태면 펼쳐준다.
			if (this.isActivityTabFolded()) {
				this.$("span[data-tag='toggle']").trigger('click');
			}
			var display = typeof (param) == "object" ? GO.util.toBoolean($(param.currentTarget).attr("data-display")) : param;
			this.toggleEditor(display);
		},

		toggleEditor: function (display) {
			var editorArea = $("div[data-area=editor]");
			var editorToggleBtn = $("#editorToggle");

			if (!this.editor) {
				initSmartEditor.call(this);
			}

			if (display) {
				editorToggleBtn.hide();
				editorArea.show();
				var activityTab = $("li[data-type=activity]");
				this.toggleActivityTab(activityTab);
			} else {
				editorToggleBtn.show();
				editorArea.hide();
			}
		},

		activityTabToggleAction: function (e) {
			var target = $(e.currentTarget);
			this.toggleActivityTab(target);
		},

		preview: function (e) {
			GO.util.preview($(e.currentTarget).attr("data-id"));
		},

		writeActivity: function () {
			if (!GO.Editor.getInstance("editor").validate()) {
				$.goError(commonLang['마임 사이즈 초과']);
				return false;
			}

			var self = this;
			var content = this.getContent();
			if (!GO.util.isEditorWriting()) {
				$.goMessage(GO.i18n(commonLang['{{portlet_title}}이 없습니다.'], 'portlet_title', commonLang['내용']));
				return;
			}

			if (_savingFlag) {
				return;
			}
			_savingFlag = true;

			var activity = new ActivityModel({appletId: this.appletId, docId: this.docId});
			activity.set({
				content: content,
				attaches: this.getActivityAttaches(),
				writer: _.pick(GO.session(), "id", "name", "email", "position", "thumbnail")
			});

			activity.save({}, {
				/*beforeSend: function() {
                    _savingFlag = true;
                },*/
				success: function (activity) {
					self.collection.fetch({
						success: function () {
							self.isChangeAttach = true;
							self.$el.trigger("change:log");
							_savingFlag = false;
							renderActivity.call(self, activity);
						}
					});
				},
				complete: function () {

				},
				error: function (model, resp) {
					_savingFlag = false;
					$.goError(resp.responseJSON.message);
				}
			});
		},

		getActivityAttaches: function () {
			var attaches = [];
			_.each(this.$("#fileWrap").find("li:not(.attachError)"), function (attach) {
				attaches.push({
					path: $(attach).attr("data-path"),
					name: $(attach).attr("data-name"),
					hostId: $(attach).attr("data-hostId")
				});
			});
			return attaches;
		},

		getContent: function () {
			var content = GO.Editor.getInstance("editor").getContent();
			return (content == "" || $.trim(content) == "<br>") ? "" : content;
		},

		isActivityTabFolded: function () {
			return this.$("span[data-tag='toggle']").find('.icon-arrow').hasClass('on');
		},

		showActivityTabByType: function (type) {
			var self = this;
			if (type == TAB_TYPE.ACTIVITY) {
				$("#activity-container").show();
				if (!this.collection.length) {
					$("div[data-area=editor]").show();
					$("#editorToggle").hide();
				}
				$("#activityArea").show();
				$("#activityAttachArea").hide();
			} else {
				$("#activityAttachArea").show();
				$("#editorToggle").show();
				$("div[data-area=editor]").hide();
				$("#activity-container").hide();
				$("#activityArea").hide();
				if (this.isChangeAttach) {
					this.collection.fetch().done(function () {
						renderAttach.call(self);
					});
				} else {
					renderAttach.call(this);
				}
			}
		},

		toggleActivityTab: function (target) {
			var type = target.attr("data-type");
			if (this.activityTab == type) {
				return;
			}

			this.activityTab = type;
			$("li[data-tag=activityTab]").removeClass("active");
			target.addClass("active");

			if (this.isActivityTabFolded()) {
				return;
			}

			this.showActivityTabByType(type);
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

	function toggleFoldingButton($button) {
		if ($button.find('.icon-arrow').hasClass('on')) {
			$button.find('.icon-arrow').removeClass('on');
			$button.find('.txt').text(lang.fold);
		} else {
			$button.find('.icon-arrow').addClass('on');
			$button.find('.txt').text(lang.unfold);
		}
	}

	function initSmartEditor() {
		$(this.el).find("#editor").goWebEditor({
			contextRoot: GO.config('contextRoot'),
			lang: GO.session('locale')
		});
		this.editor = GO.Editor;
	}

    function renderAttach() {
        var attachElementList = [];
        this.$("#attachList").find("li").remove();

        _.each(this.collection.models, function (activity) {
            addAttachElement(activity.attributes, attachElementList);
            _.each(activity.get("comments"), function (comment) {
                addAttachElement(comment, attachElementList);
            });
        });

        sortCreatedAtDesc(attachElementList);

        _.each(attachElementList, function (attach) {
            this.$("#attachList").append(renderAttachItemTpl(attach));
        }, this);

        initFancyBox.call(this);
    }

    function addAttachElement(item, attachElementList) {
        var downloadUrl = item.commentCount >= 0 ? item.id : item.ownerId + '/comment/' + item.id;
        _.each(item.attaches, function (file) {
            attachElementList.push({
                lang: lang,
                file: file,
                fileSize: GO.util.getHumanizedFileSize(file.size),
                style: GO.util.getFileIconStyle(file),
                downloadPath: GO.contextRoot + "api/works/activity/" + downloadUrl + "/download/" + file.id,
                imageGroupId: this.cid,
                isPreviewable: file.preview && file.encrypt,
                isImage: GO.util.isImage(file.extention)
            });
        }, this);
    }

    function sortCreatedAtDesc(attachElementList) {
        attachElementList.sort(function(attach, targetAttach){
            return new Date(attach.file.createdAt) >= new Date(targetAttach.file.createdAt) ? -1 : 1;
        });
    }

	function initFileUpload(options) {
		var self = this;
		var options = {
			el: "#file-control",
			context_root: GO.contextRoot,
			button_text: "<span class='buttonText'>" + lang.addAttach + "</span>",
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

				var currentTotalAttachCount = $('#fileWrap').find("li").size() + self.totalAttachCount + 1;
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
			var attachEl = self.$("#fileWrap");
			var area = isImage ? "ul.img_wrap" : "ul.file_wrap";

			if (GO.util.fileUploadErrorCheck(resp)) {
				fileItemEl.find(".item_file").append("<strong class='caution'>" + GO.util.serverMessage(resp) + "</strong>");
				fileItemEl.addClass("attachError");
			} else {
				if (GO.util.isFileSizeZero(resp)) {
					$.goAlert(GO.util.serverMessage(resp));
					return false;
				}
			}

			fileItemEl.attr("data-hostId", resp.data.hostId);
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

	function fetchActivity() {
		var defer = when.defer();
		this.collection.fetch({
			success: defer.resolve,
			error: defer.reject
		});
		return defer.promise;
	}

	function renderActivities() {
		_.each(this.collection.models, function (activity) {
			var activityItem = initActivityItem.call(this, activity);
			$(this.$el).find("#activityList").append(activityItem.el);
			activityItem.render();
		}, this);

		WorksUtil.giveHoverEventAtIE(this, '#activityList', 'div.article', 'div.article iframe', ".item");

		return this;
	}

	function initActivityItem(activity) {
		var activityItem = new ActivityItemView({
			model: activity,
			appletId: this.appletId,
			docId: this.docId
		});

		var self = this;
		activityItem.on("change:activity", function () {
			fetchActivities.call(self);
		});
		activityItem.on("change:attach", function (param) {
			self.isChangeAttach = true;
			changeAttachCount.call(self, param);
		});

		return activityItem;
	}

	function fetchActivities() {
		var self = this;
		this.collection.fetch({
			success: function () {
				var activityCount = parseInt(self.$("#activityCount").text()) - 1;
				self.$("#activityCount").text(activityCount);
				if (!activityCount) {
					self.toggleEditor(true);
				}
			}
		});
	}

	function renderActivity(activity) {
		var activityItem = initActivityItem.call(this, activity);
		var count = this.collection.length || 0;
		this.$("#activityList").prepend(activityItem.el);
		activityItem.render();

		this.$("#activityCount").show().text(count);
		this.$("#attachCount").text(parseInt(this.$("#attachCount").text()) + activity.get("attaches").length);

		GO.Editor.getInstance("editor").setContent(" ");
		this.$("#fileWrap").find("li").remove();
		this.toggleEditor(false);
	}

	function changeAttachCount(count) {
		var attachArea = this.$el.find("#attachCount");
		var attacCount = parseInt(attachArea.text());
		attachArea.text(attacCount + count);
	}

	function initFancyBox() {
		$('.fancybox-thumbs').goFancybox();
	}
	
	return DocActivityView;
});