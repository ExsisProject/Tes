// 클래식형 게시판 글목록
(function() {
	define([
	    "jquery",
	    "backbone", 	
	    "app",
		'when',
	    "board/models/board_config",
		'board/models/post_mail',
	    'i18n!nls/commons',
	    
	    "i18n!board/nls/board",
	    "board/views/post_attaches",
	    "hgn!board/templates/post_stream_unit",
	    "board/collections/post_recommend",
	    
	    "hgn!board/templates/stream_recommend_list",
	    'hgn!board/templates/post_recommend_list',
	    "views/profile_card",
	    "board/models/post_more_content",
	    "board/models/post",
	    
	    "hgn!board/templates/board_youtube_video",
	    "file_upload",
	    "comment",
	    "email_send_layer",
	    'lottie',
	    
	    "swfupload",
		"swfupload.plugin",
	    "jquery.fancybox-buttons",
	    "jquery.fancybox-thumbs",
	    "jquery.fancybox",
	    "jquery.go-validation",
	    "jquery.placeholder",
	    "GO.util",
	    'go-fancybox',
		"jquery.go-grid",
	], 
	function(
		$,
		Backbone,
		App,
		When,
		BoardConfig,
		PostMailModel,
		commonLang,
		
		boardLang,
		postAttachesView,
		TplStreamUnit,
		postRecommendCollection,
		
		TplStreamRecommendList,
		tplPostRecommendList,
		ProfileView,
		postMoreContentModel,
		Post,
		
		TplYouTube,
		FileUpload,
		CommentView,
		EmailSendLayer,
        Lottie
	) {
		var lang = {
			'ok': commonLang['확인'],
			'portrait': boardLang['초상화'],
			'meta_img': boardLang['메타정보 이미지'],
			'link_meta': boardLang['링크 메타정보 타이틀'],
			'save': commonLang['저장'],
			'preview': commonLang['미리보기'],
			'cancel': commonLang['취소'],
			'sample_img': boardLang['샘플이미지'],
			'modify': commonLang['수정'],
			'del': commonLang['삭제'],
			'copy_url': commonLang['URL 복사'],
			'comment': boardLang['개의 덧글'],
			'all_view': boardLang['모두 보기'],
			'comment_modify': boardLang['덧글 수정'],
			'comment_delete': boardLang['덧글 삭제'],
			'comment_save': boardLang['댓글 작성'],
			'close': commonLang['닫기'],
			'plus_list': boardLang['Plus 1 한 사람들'],
			'more_view': boardLang['더 보기'],
			'more_content': boardLang['더보기'],
			'content_fold': commonLang['접기'],
			'no_content': boardLang['아직 등록된 글이 없습니다. 글을 등록해 주세요.'],
			'alert_exclude_extension': boardLang['확장자가 땡땡인 것들은 첨부 할 수 없습니다.'],
			'alert_max_attach_cnt': boardLang['최대 첨부 갯수는 0개 입니다.'],
			'alert_max_attach_size': boardLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'],
			'confirm_delete': boardLang['게시글을 삭제 하시겠습니까?'],
			'confirm_delete_message': boardLang['삭제확인메세지'],
			'comment_placeholder': boardLang['댓글을 입력해주세요.'],
			'alert_length': boardLang['0자이상 0이하 입력해야합니다.'],
			'title_recommend': commonLang['좋아요 하기'],
			'title_recommend_cancel': commonLang['좋아요 취소'],
			'title_open': commonLang['펼치기'],
			'title_close': commonLang['접기'],
			'post_comment': boardLang['댓글'],
			'count': boardLang['개'],
			'download': commonLang['다운로드'],
			'send_mail': commonLang['메일발송'],
			'user_count': commonLang['명'],
			'plus_user': commonLang['좋아요 누른 사람'],
			'reomment_list_tab': boardLang['좋아요'],
			'public_writer' :boardLang['작성자 공개']
		};

		var Promise = function () {
			return When.promise.apply(this, arguments);
		};

		var streamView = Backbone.View.extend({
			tagName : "li",
			
			initialize: function(options) {
				this.options = options || {};
				this.boardModel =  options.boardModel || BoardConfig.get(this.model.get("boardId"), true);
				this.boardMaster = this.model.get("boardMasterOwner")
				this.isDetail = options.isDetail || false;
				this.commentFlag = this.boardModel.get('commentFlag');
				this.recommendFlag = false;
				this.isMoreComment = false;
				this.commentViewFlag = false;
				this.sendMailFlag = options.sendMailFlag || this.boardModel.get("sendMailFlag");
				this.isCommunity = options.isCommunity;
				this.isSaaS = GO.session().brandName == "DO_SAAS";
				this.totalAttachSize = 0;
				this.totalAttachCount = 0;
				this.anonymFlag = this.boardModel.get("anonymFlag");
				this.availableAnonymousWriterOptionInPostComment = this.boardModel.get("availableAnonymousWriterOptionInPostComment");
			},
			
			events : {
				'click div.article_wrap span.photo a' : 'showProfileCard',
				'click span.recommendPrifile a' : 'showProfileCard',
				'click span[data-btntype="recommend"]':'postRecommend',
				'click span[data-btntype="recommendlist"]':'postRecommendListToggle',
				'click span[data-btntype="postmodify"]':'postModify',
				'click span[data-btntype="postdelete"]':'postDelete',
				'click span[data-btntype="postsendmail"]':'postSendMail',
				'click span[data-btntype="stream_postUpdateCancel"]':'postUpdateCancel',
				'click span[data-btntype="stream_postUpdate"]':'postUpdate',
				'click span.btn_set_next':'moveRecommendList',
				'click span.btn_set_prev':'moveRecommendList',
				'click div.postFileModifyPart span.ic_del' : 'attachDeleteByModify',
				'click a.btn_viewAll':'moreComment',
				'click span[data-btntype="closeBtn"]':'contentCloseAction',
                'click li a.preview' : "preview",
                'click span[data-btntype="moreBtn"]':'contentMoreAction',
                'keyup textarea.edit' : 'expandTextarea',
                'click span.metaInfoDelete' : 'metaInfoDelete',
                'click a#listPostRecommend' : 'showPostRecommend',

				// 'dragover div.dropZone': '_dragOver',
				// 'dragleave div.dropZone': '_dragLeave',
				// 'drop div.dropZone': '_drop',
			},

			_dragOver: function (e) {
				e.preventDefault();
				e.stopPropagation();
				e.originalEvent.dataTransfer.dropEffect = 'move';
			},

			_dragLeave: function (e) {
				e.preventDefault();
				e.stopPropagation();
			},

			_drop: function (e) {
				this._dragLeave(e);
			},

			expandTextarea: function (e) {
				GO.util.textAreaExpand(e);
			},

			youtubeBack: function (e) {
				var target = $(e.currentTarget);
				target.parents('div.meta_info_wrap').first().find('ul').show();
				target.parents('div.meta_info_wrap').first().find('a.youtube_thum').show();
				target.parents('div.meta_info_wrap').first().find('div.youtube').remove();

			},

			playVideo: function (e) {
				e.preventDefault();
				var target = $(e.currentTarget);
				var videoUrl = target.attr('data-videourl');
				console.log(videoUrl);
				var playTpl = TplYouTube({
					videoUrl: videoUrl
				});
				target.parent().append(playTpl);
				target.parent().find('ul').hide();
				target.hide();
			},

			contentMoreAction: function (e) {
				var target = $(e.currentTarget);
//				var url = GO.contextRoot + "api/board/" + this.model.get("boardId") + "/post/" + this.model.id + "/content";

				if (!this.model.moreContent) {
					this.model.getMoreContent();
				}

				target.parent().find('span.expander').hide();
				target.parent().find('span[data-btntype="moreBtn"]').hide();
				target.before('<span class="contentMore">' + GO.util.escapeHtml(this.model.moreContent) + '</span>');
				target.parent().find('span[data-btntype="closeBtn"]').show();
			},

			preview: function (e) {
				var currentEl = $(e.currentTarget);
				GO.util.preview(currentEl.attr("data-id"));

				return false;
			},

			contentCloseAction: function (e) {
				var target = $(e.currentTarget);
				target.parent().find('span.expander').show();
				target.parent().find('span.contentMore').remove();
				target.parent().find('span[data-btntype="moreBtn"]').show();
				target.parent().find('span[data-btntype="closeBtn"]').hide();

			},

			commentToggle: function (e) {
				var comments = this.$("ul.reply").children();
				var commentsLength = comments.length > 3 ? comments.length - 4 : -1;
				var dataComment = $(e.currentTarget).find('span.commentFold');
				if (dataComment.attr('data-comment') == "part") {
					comments.show();
					dataComment.text(lang.content_fold).attr('data-comment', 'all');
				} else {
					_.each(comments, function (el, idx) {
						if (idx > commentsLength) {
							return false;
						}
						$(el).hide();
					});
					dataComment.text(lang.all_view).attr('data-comment', 'part');
				}
			},

			moreComment: function (e) {
				var commentTarget = $(e.currentTarget).find('span.commentFold');
				if (commentTarget.attr('data-loading') == "true") {
					this.commentToggle(e);
				} else {
					commentTarget.text(lang.content_fold).attr({'data-comment': 'all', 'data-loading': 'true'});
					this.moreCommentDraw(e, this.model.get("boardId"), this.model.id);
				}
			},

			moreCommentDraw: function (e, boardId, postId) {
				this.commentView.fetchComments();
			},

			attachDeleteByModify: function (e) {
				var target = $(e.target);
				if (target.parents('div.option_display').first().find('li').length == 1) {
					target.parents('div.option_display').removeClass("option_display");
				}
				target.parents('li').first().remove();
				this.setViewedTotalAttachSize(this.model.id);
			},

			moveRecommendList: function (e) {
				var page = $(e.currentTarget).attr('data-page');

				this.postRecommendListDraw({
					boardId: this.model.get("boardId"),
					postId: this.model.id,
					page: page
				});
			},
			
			showProfileCard : function(e) {
				var userId = $(e.currentTarget).attr('data-userid');
				if(userId != ""){
					ProfileView.render(userId, e.currentTarget);
				}
			},

			postDelete: function (e) {
				var _this = this;
				$.goCaution(lang['confirm_delete'], lang['confirm_delete_message'], function () {
					_this.postDeleteAction(e);
				});
			},

			postDeleteAction: function (e) {
				var url = GO.contextRoot + "api/board/" + this.model.get("boardId") + "/post/" + this.model.id;

				$.go(url, {}, {
					qryType: 'DELETE',
					contentType: 'application/json',
					responseFn: function (rs) {
						$(e.currentTarget).parents('li').first().remove();
					}
				});
			},

			postSendMail: function (e) {
				var boardId = this.model.get("boardId");
				var postId = this.model.id;

				this.postMailModel = new PostMailModel({"boardId": boardId, "postId": postId});
				this.asyncFetch(this.postMailModel)
					.then(_.bind(function () {

						var data = this.postMailModel.toJSON();

						var content = data.body;
						var attlists = _.map(data.attachList, function (attachFile) {
							var attachString = attachFile.path + ":"
								+ attachFile.name + ":"
								+ attachFile.size + ":"
								+ attachFile.id + "\n";
							return attachString;
						});

						this.openEmailPopup(content, attlists);

					}, this))
					.otherwise(function printError(err) {
						console.log(err.stack);
					})
			},

			openEmailPopup: function (content, attlists) {

				var windowName = Math.floor(Math.random() * 10000);
				var windowFeatures = "scrollbars=yes,resizable=yes,width=1280,height=760";

				window.open("", windowName, windowFeatures);

				var form = document.createElement("form");
				var hiddenData = document.createElement("input");
				hiddenData.type = "hidden";
				hiddenData.name = "data";

				var param = {};
				param.content = content;

				var attachFiles = [];
				_.each(attlists, function (attr) {
					attachFiles.push(attr);
				});
				param.attachFiles = attachFiles;
				hiddenData.value = JSON.stringify(param);

				form.appendChild(hiddenData);

				form.action = GO.contextRoot + "app/mail/popup/process";
				form.method = "post";
				form.target = windowName;

				// IE 환경에서 Popup으로 Form submit을 못하는 현상 처리
				document.body.appendChild(form);
				form.submit();
				document.body.removeChild(form);
			},

			asyncFetch: function (model) {
				return new Promise(function (resolve, reject, notify) {
					model.fetch({
						success: resolve,
						error: reject,
						statusCode: {
							400: function () {
								GO.util.error('400', {"msgCode": "400-works"});
							},
							403: function () {
								GO.util.error('403', {"msgCode": "400-works"});
							},
							404: function () {
								GO.util.error('404', {"msgCode": "400-works"});
							},
							500: function () {
								GO.util.error('500');
							}
						}
					});
				});
			},

			metaInfoDelete: function (e) {
				var target = $(e.currentTarget);
				target.parents('div.meta_info_wrap').hide().find('span.metaInfoDelete').hide();
			},
			
			setModifyPart: function (e, originContent) {
				var boardId = this.model.get("boardId");
				var postId = this.model.id;
				var target = $(e.target).parent().parent();
				var contentPart = target.siblings('p');

				contentPart.find('span[data-btntype="moreBtn"]').hide();
				contentPart.find('span[data-btntype="closeBtn"]').hide();
				contentPart.find('span.contentMore').remove();
				contentPart.append('<span class="textarea_edit"><textarea class="edit w_max">' + originContent + '</textarea></span>');
				contentPart.find('span').first().hide();

				GO.util.textAreaExpandByNode(contentPart.find('textarea.w_max')[0]);

				var fileLen = target.parent().find('ul.file_wrap li').length;
				var imgLen = target.parent().find('ul.feed_img li').length;
				var option_display = "";

				if (fileLen > 0 || imgLen > 0) {
					option_display = "option_display";
				}

				var fileTemplete;

				fileTemplete = "<div class='" + option_display + " temp postFileModifyPart' id='postFileModifyWrap_" + postId + "'>";
				fileTemplete += "<ul class='file_wrap'>";
				target.parent().find('ul.file_wrap li').each(function () {
					fileTemplete +=
						"<li data-name='" + $(this).attr('data-name') + "' data-id='" + $(this).attr('data-id') + "' data-size='" + $(this).attr('data-size') + "'>" +
							"<span class='item_file'>" +
								"<span class='btn_wrap'><span class='ic_classic ic_del' data-postid='" + postId + "'></span></span>" +
								$(this).find('span.item_file').html() +
							"</span>" +
						"</li>";
				});
				fileTemplete += "</ul>";

				fileTemplete += "<ul class='img_wrap'>";
				target.parent().find('ul.feed_img li').each(function () {
					fileTemplete +=
						"<li data-name='" + $(this).attr('data-name') + "' data-id='" + $(this).attr('data-id') + "' data-size='" + $(this).attr('data-size') + "'>" +
							"<span class='item_file'>" +
								"<span class='item_image'>" +
									"<span class='thumb'>" +
										"<img src='" + $(this).find('img').attr('src') + "' alt='" + $(this).attr('data-name') + "'>" +
									"</span>" +
									"<span class='btn_wrap'>" +
										"<span class='ic_classic ic_del' data-postid='" + postId + "'></span>" +
									"</span>" +
									"<span class='name'>" + $(this).attr('data-name') + "</span>" +
									"<span class='size'>" + GO.util.getHumanizedFileSize($(this).attr('data-size')) + "</span>" +
								"</span>" +
							"</span>" +
						"</li>";
				});
				fileTemplete += "</ul>";
				fileTemplete += "</div>";

				contentPart.after(fileTemplete);
				var publicWriterCheckText = '';
				if (this.model.get('publicWriter')) {
					publicWriterCheckText = 'checked="checked"';
				}
				var writerText = '';
				if (this.anonymFlag) {
					writerText = '<span class="btn_action action_off">' +
									 '<label>' +
								 		 '<input type="checkbox" data-name="modifyOpenWriter" disabled="disabled" '+ publicWriterCheckText +'>' +
										 lang.public_writer +
									 '</label>' +
								 '</span>'
				}
				target.parent().find('div.origin').hide();
				target.parent().append(
					'<div class="article_edit" data-boardId="' + boardId + '" data-postId="' + postId + '">' +
						writerText +
						'<span class="optional">' +
							'<span class="file_progressive_warp" id="postFileModifyProgress_' + postId + '_file" style="display:none"></span>' +
							'<span class="size total_size"></span>' +
							'<span class="btn_ic24">' +
								'<span class="wrap_btn wrap_file_upload">' +
									'<span class="fileinput-button postFileModifyWrap_' + postId + '" id="postFileModifyWrap_' + postId + '" data-initattach="false">' +
										'<span class="ic ic_file_s" id="postFileModifyWrap_' + postId + '_file" title="' + commonLang['파일 첨부'] + '"></span>' +
									'</span>' +
								'</span>' +
							'</span>' +
						'</span>' +
						'<span class="btn_major_s" data-btntype="stream_postUpdate">' + lang['save'] + '</span>&nbsp;' +
						'<span class="btn_minor_s" data-btntype="stream_postUpdateCancel">' + lang['cancel'] + '</span>' +
					'</div>'
				);
				target.hide();

				$(e.currentTarget).parents('div.article_wrap').first().find('div.meta_info_wrap span.metaInfoDelete').show();

				this.initPostUpload(postId, "file");
			},

			initPostUpload: function (postId, type) {
				var self = this;
				var options = {
					el: "#postFileModifyWrap_" + postId + "_" + type,
					context_root: GO.contextRoot,
					button_text: "",
					button_width: 36,
					button_height: 26,
					url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
					mode: "COMMENT",
					progressBarUse: true,
					progressEl: "#postFileModifyProgress_" + postId + "_" + type,
					commentTmpl: [
						'<span class="ic ic_file_s" id="postFileModifyWrap_' + postId + '_file" title="{title}"></span>',
						'<input type="file" name="file" title="{title}" style="height:inherit;" multiple=""/>',
					].join("")
				};

				var maxAttachSize = (GO.config('attachSizeLimit')) ?
					parseInt(GO.config('maxAttachSize')) : parseInt(GO.config('commonAttachConfig').maxAttachSize);
				var maxAttachByteSize = maxAttachSize * 1024 * 1024;
				var maxAttachNumber = (GO.config('attachNumberLimit')) ?
					parseInt(GO.config('maxAttachNumber')) : parseInt(GO.config('commonAttachConfig').maxAttachNumber);

                (new FileUpload(options))
				.queue(function (e, data) {
                    
                })
				.start(function (e, data) {
					if (!GO.config('attachFileUpload')) {
						$.goAlert(commonLang['파일첨부용량초과']);
						$("#postFileModifyWrap_" + postId).closest('.dropZone').removeClass('drag_file');
						return false;
					}

					if ($('input[name=disabled]:checked', this).length) {
						e.preventDefault();
					}

					if (GO.config('excludeExtension') != "") {
						var index = $.inArray(data.type.substr(1).toLowerCase(), GO.config('excludeExtension').split(','));
						if (index >= 0) {
							$.goMessage(App.i18n(lang['alert_exclude_extension'], "arg1", GO.config('excludeExtension')));
							$("#postFileModifyWrap_" + postId).closest('.dropZone').removeClass('drag_file');
							return false;
						}
					}

					if (self.isSaaS || GO.config('attachSizeLimit')) {
						if (maxAttachByteSize < data.size) {
							$.goMessage(App.i18n(lang['alert_max_attach_size'], "arg1", maxAttachSize));
							$("#postFileModifyWrap_" + postId).closest('.dropZone').removeClass('drag_file');
							return false;
						} else {
							self.totalAttachSize += data.size;
						}
					}

					if (self.isSaaS || GO.config('attachNumberLimit')) {
						var currentTotalAttachCount = $("#postFileModifyWrap_" + postId).find('li').length + self.totalAttachCount + 1;
						if (maxAttachNumber < currentTotalAttachCount) {
							$.goMessage(App.i18n(lang['alert_max_attach_cnt'], "arg1", maxAttachNumber));
							$("#postFileModifyWrap_" + postId).closest('.dropZone').removeClass('drag_file');
							return false;
						} else {
							self.totalAttachCount++;
						}
					}
                })
				.progress(function (e, data) {
                    
                })
				.success(function (e, serverData, fileItemEl) {
					var alertMessage = "";
					var attachClass = "";
					if (GO.util.fileUploadErrorCheck(serverData)) {
						alertMessage = "<strong class='caution'>" + GO.util.serverMessage(serverData) + "</strong>";
						attachClass = "attachError";
					} else {
						if (GO.util.isFileSizeZero(serverData)) {
							$.goAlert(GO.util.serverMessage(serverData));
							return false;
						}
					}

					if (!$("#postFileModifyWrap_" + postId).hasClass("option_display")) {
						$("#postFileModifyWrap_" + postId).addClass("option_display");
					}
                    
                    var data = serverData.data;
                    var tmpName = data.filePath;
                    var name = data.fileName;
                    var extention = data.fileExt;
					var size = data.fileSize;
                    var humanSize = GO.util.getHumanizedFileSize(size);
                    var thumbnail = data.thumbnail;
                    var hostId = data.hostId;
                    var templete = "";

					if (GO.util.isImage(extention)) {
						templete =
							'<li class="' + attachClass + '" data-tmpname="' + tmpName + '" data-name="' + name + '" data-hostid="' + hostId + '" data-size="' + size + '">' +
								'<span class="item_image">' +
									'<span class="thumb">' +
										'<img src="' + thumbnail + '" alt="' + name + '" />' +
									'</span>' +
									'<span class="btn_wrap">' +
										'<span class="ic_classic ic_del" title="' + commonLang["삭제"] + '" data-postid=' + postId + '></span>' +
									'</span>' +
									'<span class="name">' + name + '</span>' +
									'<span class="size">(' + humanSize + ')</span>' +
								'</span>' +
							'</li>';

						if ($("#postFileModifyWrap_" + postId).find("ul.img_wrap").length == 0) {
							$("#postFileModifyWrap_" + postId).append('<ul class="img_wrap"></ul>');
						}
						$("#postFileModifyWrap_" + postId).find("ul.img_wrap").append(templete);
					} else {
						var fileType = (GO.util.fileExtentionCheck(extention)) ? extention : "def";

						templete =
							'<li class="' + attachClass + '" data-tmpname="' + tmpName + '" data-name="' + name + '" data-hostid="' + hostId + '" data-size="' + size + '">' +
								'<span class="item_file">' +
									'<span class="btn_wrap" title="' + commonLang["삭제"] + '">' +
										'<span class="ic_classic ic_del" data-postid=' + postId + '></span>' +
									'</span>' +
									'<span class="ic_file ic_' + fileType + '"></span>' +
									'<span class="name">' + name + '</span>' +
									'<span class="size">(' + humanSize + ')</span>' + alertMessage +
								'</span>' +
							'</li>';

						if ($("#postFileModifyWrap_" + postId).find("ul.file_wrap").length == 0) {
							$("#postFileModifyWrap_" + postId).append('<ul class="file_wrap"></ul>');
						}
						$("#postFileModifyWrap_" + postId).find("ul.file_wrap").append(templete);
					}

					self.setViewedTotalAttachSize(postId);
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
			},

			postModify: function (e) {
				var _this = this;
				var existMoreContent = this.model.summarizedFlag();
				var originContent = "";

				if (existMoreContent) {
					this.moreContentModel = new postMoreContentModel();
					this.moreContentModel.clear();
					this.moreContentModel.set({
						boardId: this.model.get("boardId"),
						postId: this.model.id
					}, {
						silent: true
					});

					this.moreContentModel.fetch({
						success: function (data) {
							originContent = data.toJSON().content;
							_this.setModifyPart(e, originContent);
						},
						error: function (data, res) {
							console.log(res);
						}
					});
				} else {
					originContent = this.contentToEscape(this.model.get("summary"));
					this.setModifyPart(e, originContent);
				}

				_this.setViewedTotalAttachSize(this.model.id);
			},

			// 저장
			postUpdate: function (e) {
				var self = this;
				var boardId = this.model.get("boardId");
				var postId = this.model.id;
				var content = $(e.target).parent().siblings('p').find('textarea.edit').val();
				var data = {content: content};
				var attachPart = $("#postFileModifyWrap_" + postId).find('li:not(.attachError)');
				var attaches = [];
				var attachOpt;
				var isPublicWriter = $(e.target).siblings('span').find('input[data-name="modifyOpenWriter"]').is(':checked');
				data.publicWriter = isPublicWriter;

				attachPart.each(function () {
					attachOpt = {};
					if ($(this).attr("data-tmpname")) {
						attachOpt.path = $(this).attr("data-tmpname");
					}
					if ($(this).attr("data-name")) {
						attachOpt.name = $(this).attr("data-name");
					}
					if ($(this).attr("data-id")) {
						attachOpt.id = $(this).attr("data-id");
					}
					if ($(this).attr("data-hostid")) {
						attachOpt.hostId = $(this).attr("data-hostid");
					}
					if ($(this).attr("data-size")) {
						attachOpt.size = $(this).attr("data-size");
					}
					attaches.push(attachOpt);
				});

				if (attaches.length > 0) {
					data.attaches = attaches;
				}

				var metaInfoWrap = $(e.currentTarget).parents('div.article_wrap').first().find('div.meta_info_wrap');

				if (!metaInfoWrap.is(':visible')) {
					data.links = [];
				} else {
					var links = [];
					var url = metaInfoWrap.find('a.url_type').html();
					var videoSrc = metaInfoWrap.find("a.url_type").attr('data-video');
					var thumb = metaInfoWrap.find(".thumb img").attr("src");
					var title = metaInfoWrap.find(".title").html();
					var description = metaInfoWrap.find(".meta_contents").html();
					var linkId = metaInfoWrap.attr("data-linkid");

					links.push({
						id: linkId,
						url: url,
						title: title,
						description: description,
						imageSrc: thumb,
						videoSrc: videoSrc
					});
					data.links = links;
				}

				this.post = new Post();
				this.post.set({boardId : boardId, postId : postId , writeType : "edit"}, {silent: true});
				this.post.save(data, {
					type : 'PUT',
					success : function(model, rs) {
						var targetWrap = $(e.target).parent().siblings('p');
						targetWrap.find('span.expander').html(GO.util.escapeHtml(content)).show();
						targetWrap.find('span.textarea_edit').remove();
						$('#toolbar_'+boardId+"_"+postId).css('display','');
						
						var metaInfoWrap = $(e.currentTarget).parents('div.article_wrap').find('div.meta_info_wrap');
						if(rs.data.links.length > 0){
							metaInfoWrap.show().find('span.metaInfoDelete').hide();
						}else{
							metaInfoWrap.remove();
						}

						$(e.target).parent().parent().find('div.option_display').remove();
						$(e.target).parent().parent().find('div.origin').remove();
						$(e.target).parent().parent().find('span.btn_fn7').remove();

						if(rs.data.attaches){
							$(e.target).parent().parent().append(postAttachesView.render({
								attaches : rs.data.attaches,
								postId : rs.data.id,
								boardId : boardId
							}));
							
						}
						
						$(e.target).parent().remove();
						$('.fancybox-thumbs').goFancybox();

						self.model.set('summary', model.get('summary'));
					},
					error : function(model, rs) {
						console.log('update fail.');
					}
				});
			},

			postUpdateCancel: function (e) {
				var targetWrap = $(e.target).parent().siblings('p');
				targetWrap.find('span.expander').show();
				targetWrap.find('span.textarea_edit').remove();
				var boardId = $(e.target).parent().attr('data-boardId');
				var postId = $(e.target).parent().attr('data-postId');
				$('#toolbar_' + boardId + "_" + postId).css('display', '');

				$(e.target).parent().parent().find('div.option_display').remove();
				$(e.target).parent().parent().find('span.btn_fn7').remove();
				$(e.target).parent().parent().find('div.origin').show();
				$(e.currentTarget).parents('div.article_wrap').find('div.meta_info_wrap').show().find('span.metaInfoDelete').hide();

				$("#postFileModifyWrap_" + postId).remove();
				$(e.target).parent().remove();
				$(e.currentTarget).parents('div.article_wrap').find('div.meta_info_wrap').show();
			},

			contentToEscape: function (content) {
			    if(!content) {
			        return;
                }
				content = content.replace(/<br\>/gi, "\n");
				content = content.replace(/&nbsp;/gi, " ");
				return content;
			},

			postRecommend: function (e) {
				this.recommendFlag = true;
				var isRecommend = $(e.currentTarget).hasClass('on');
				var queryType = isRecommend ? "DELETE" : "POST";
				var url = GO.contextRoot + "api/board/" + this.model.get("boardId") + "/post/" + this.model.id + "/recommend";
				var _this = this;

				$.go(url, '', {
					qryType: queryType,
					contentType: 'application/json',
					responseFn: function (rs) {
						if (rs.code == 200) {
							var countEl = _this.$el.find('#listPostRecommend'),
								recommendCount = rs.data.recommendCount || 0;
							countEl.html(recommendCount);
							if (!isRecommend) {
								$(e.currentTarget).addClass('on').attr('title', lang['title_recommend_cancel']);
								$(e.currentTarget).find("span.txt").html(recommendCount);
							} else {
								$(e.currentTarget).removeClass('on').attr('title', lang['title_recommend']);
								$(e.currentTarget).find("span.txt").html(recommendCount);
							}
						}
					}
				});
			},

			postRecommendListToggle: function (e) {
				var isClose = $(e.target).hasClass('ic_close_s');

				if (isClose) {
					$("#recommendList_" + this.model.id).hide();
					$(e.target).removeClass('ic_close_s').addClass('ic_open_s').attr('title', lang.title_open);
					return;
				}

				$("#recommendList_" + this.model.id).show();
				this.postRecommendListDraw({
					boardId: this.model.get("boardId"),
					postId: this.model.id,
					page: "0"
				});
				$(e.target).removeClass('ic_open_s').addClass('ic_close_s').attr('title', lang.title_close);
			},

			postRecommendListDraw: function (opt) {
				var data = {
					"page": opt.page,
					"offset": "10"
				};

				var recommendList = postRecommendCollection.getCollection({
					boardId: opt.boardId,
					postId: opt.postId,
					data: data
				});

				var templete = TplStreamRecommendList({
					dataset: recommendList.toJSON(),
					isNext: recommendList.isNext(),
					isPrev: recommendList.isPrev(),
					prePage: recommendList.prePage(),
					nextPage: recommendList.nextPage()
				});

				$("#recommendList_" + opt.postId).html(templete);
			},

			getAttachView: function () {
				return postAttachesView.render({
					attaches: this.model.get("attaches"),
					postId: this.model.get('id'),
					boardId: this.model.get("boardId")
				});
			},

			streamDetailMakeTemplete: function (model) {
				_.each(model.links, function (link) {
					if (link.url) {
						link.url = link.url.replace(/&amp;/gi, "&");
					}
				});

				var tplPostStream = TplStreamUnit({
					lang: lang,
					dataset: model,
					postAttachFiles: this.model.hasAttach() ? this.getAttachView() : "",
					boardId: this.model.get("boardId"),
					isZero: this.model.isZero(),
					commentCheck: this.model.commentCheck(),
					isRecommend: this.model.isRecommend(),
					directUrl: this.directUrl(),
					dateParse: this.model.dateParse(),
					contentParse: this.isDetail ? this.model.detailContent() : this.model.simpleContent(),
					isSummarized: this.isDetail ? false : this.model.summarizedFlag(),
					hasComment: this.commentFlag || this.model.hasComment(),
					isActiveDept: this.boardModel.get("status") == "ACTIVE",
					isCommunity: this.isCommunity,
					sendMailFlag: this.sendMailFlag,
					anonymFlag: this.boardModel.get('anonymFlag'),
					isAlimPost: function () {
						if (this.notiMailFlag || this.notiPushFlag) {
							return true;
						} else {
							return false;
						}
					}
				});

				return tplPostStream;
			},

			showPostRecommend: function (e) {
				var tplPopupHeader = ['<ul class="tab_nav tab_nav2"><li class="last on"><span>', lang['reomment_list_tab'], '</span></li></ul>'];

				var popup = $.goPopup({
					pclass: 'layer_normal layer_reader',
					headerHtml: tplPopupHeader.join(''),
					contents: tplPostRecommendList(),
					buttons: [{
						btype: 'confirm',
						btext: lang['ok']
					}]
				});

				$.goGrid({
					el: '#recommendList',
					url: GO.contextRoot + 'api/board/' + this.model.get("boardId") + '/post/' + this.model.id + '/recommend',
					displayLength: 5,
					displayLengthSelect: false,
					emptyMessage: boardLang['좋아요 목록이 없습니다.'],
					numbersShowPages: 5,
					method: 'GET',
					defaultSorting: [],
					sDom: 'rt<"tool_bar"<"critical custom_bottom">p>',
					bProcessing: false,
					columns: [{
						"mData": null,
						"sWidth": "150px",
						"bSortable": false,
						"sClass": "align_l",
						"fnRender": function (obj) {
							var data = obj.aData;
							var displayName = [data.recommender.name, ' ', data.recommender.positionName].join('');
							if (data.recommender.otherCompanyUser) {
								displayName = '<span class="multi_user">' + displayName + '</span>';
							}
							returnArr = [displayName, '&nbsp;<span class="date">', GO.util.basicDate(data.updatedAt), '</span>'];
							return returnArr.join('');
						}
					}],
					fnDrawCallback: function (tables, oSettings, listParams) {
						var toolBar = popup.find('.tool_bar');
						if (oSettings._iRecordsTotal < oSettings._iDisplayLength) {
							$(this.el).find('tr:last-child>td').css('border-bottom', 0);
							toolBar.hide();
						} else {
							toolBar.show();
							toolBar.find('div.dataTables_paginate').css('margin-top', 0);
						}

						//self.$el.find('#listPostRecommend span.num').html(oSettings._iRecordsTotal);
						popup.find('.dataTables_wrapper').css('margin-bottom', 0);
						popup.reoffset();
					}
				});
			},

			render: function () {
				var data = this.model.toJSON();
				this.$el.html(this.streamDetailMakeTemplete(data));
				//이미지 첨부EL 높이 설정 
				postAttachesView.resize(this.$el);

				$('input[placeholder], textarea[placeholder]').placeholder();
				$('#content').addClass("go_renew");

				this.initCommentView();
				this.$el.attr({
					"data-boardId": this.model.get("boardId"),
					"data-postId": this.model.id
				});

				$('.fancybox-thumbs').goFancybox();

				this.setHeartbeatAnimation(this.$el.find(".heartbeat"));

				return this;
			},

			setHeartbeatAnimation: function ($heartbeat) {
				var heartbeatAnimation = Lottie.loadAnimation({
					container: $heartbeat[0],
					render: "svg",
					loop: false,
					autoplay: false,
					path: window.location.protocol + "//" + window.location.host + GO.contextRoot
						+ "resources/js/vendors/lottie/heartbeat.json"
				});

				if ($heartbeat.hasClass('on')) {
					heartbeatAnimation.play();
				} else {
					heartbeatAnimation.stop();
				}

				$heartbeat.on("click", function () {
					if ($(this).hasClass('on')) {
						heartbeatAnimation.stop();
					} else {
						heartbeatAnimation.play();
					}
				});
			},

			initCommentView: function () {
				this.commentView = CommentView.init({
					el: this.$("#replyArea"),
					typeUrl: "board/" + this.model.get("boardId") + "/post",
					typeId: this.model.id,
					isWritable: this.commentFlag,
					anonymFlag: this.anonymFlag,
					availableAnonymousWriterOptionInPostComment: this.availableAnonymousWriterOptionInPostComment,
					isReply: false
				});
				this.commentView.render();
				this.commentView.setComments(this.model.get("comments"));
				this.commentView.renderList();

				var self = this;
				this.commentView.$el.on("comment:change", function (e, type, count) {
					var target = self.$('#commentCount');
					target.html(count);
					target.find('span.commentFold').text(lang.content_fold).attr('data-comment', 'all');
					self.commentCount = count;
				});
			},

			getViewedTotalAttachSize: function (postId) {
				var viewedTotalAttachSize = 0;
				$("#postFileModifyWrap_" + postId).find('li').each(function () {
					viewedTotalAttachSize += parseInt(this.getAttribute('data-size'), 0);
				});
				return viewedTotalAttachSize;
			},

			directUrl: function () {
				var communityId = this.boardMaster.ownerId
				var boardId = this.model.get("boardId");
				var postId = this.model.id;
				var url = App.router.getRootUrl();

				if (this.isCommunity) {
					url += 'community/' + communityId + '/board/' + boardId + '/post/' + postId + '/stream';
				} else {
					url += 'board/' + boardId + '/post/' + postId + '/stream';
				}
				return url;
			},

			setViewedTotalAttachSize: function (postId) {
				if (this.isSaaS || GO.config('attachSizeLimit')) {
					var current = this.getViewedTotalAttachSize(postId);
					$("#postFileModifyWrap_" + postId)
						.closest(".dropZone")
						.find(".total_size")
						.html(GO.util.displayHumanizedAttachSizeStatus(current));
				}
			},

			resetAttachSizeAndCount: function () {
				if (this.isSaaS || GO.config('attachSizeLimit')) {
					this.totalAttachSize = 0;
					this.totalAttachCount = 0;
				}
			}
		});
		
		return streamView;
	});
}).call(this);
