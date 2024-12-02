// 스트림형 게시판 글목록
;(function() {
	define([
	    "jquery",
	    "backbone",
	    'i18n!nls/commons', 
	    "i18n!board/nls/board",
	    "app",
	    
	    "hgn!board/templates/post_stream",
	    "hgn!board/templates/post_link",
	    "board/collections/post_stream",
	    "board/views/post_attaches",
	    
	    "views/profile_card",
	    "board/models/post",
	    "file_upload",
	    
	    'board/models/board_config',
	    "board/views/post_stream_unit",
	    
	    "json",
	    "json2",
	    "jquery.fancybox-buttons",
	    "jquery.fancybox-thumbs",
	    
	    "jquery.fancybox",
	    "jquery.go-validation",
	    "jquery.placeholder",
	    "jquery.progressbar",
	    'go-fancybox'
	], 
	function(
		$,
		Backbone,
		commonLang,
		boardLang,
		App,
		
		TplPostStream,
		TplPostLink,
		Posts,
		postAttachesView,
		
		ProfileView,
		writeModel,
		FileUpload,
		
		BoardModel,
		PostStreamUnit
	) {
		var lang = {
			'link_input' : boardLang['링크입력'],
			'이야기 하기' : boardLang['이야기 하기'],
			'notice_clear' : boardLang['공지 해제'],
			'notice_register' : boardLang['공지 등록'],
			'img_attach' : commonLang['이미지 첨부'],
			'file_attach' : commonLang['파일 첨부'],
			'link_add' : boardLang['링크 추가'],
			'vote' : boardLang['투표'],
			'range' : boardLang['정렬'],
			'sort_create' : boardLang['글 등록 기준'],
			'sort_update' : boardLang['댓글 등록 기준'],
			'past_feed' : boardLang['예전 피드 보기'],
			'today' : boardLang['오늘로'],
			'week_before' : boardLang['주 전으로'],
			'month_before' : boardLang['달 전으로'],
			'term_custom' : boardLang['사용자 지정'],
			'before_post' : boardLang['이전 글'],
			'portrait' : boardLang['초상화'],
			'meta_img' : boardLang['메타정보 이미지'],
			'link_meta' : boardLang['링크 메타정보 타이틀'],
			'save' : commonLang['저장'],
			'preview' : commonLang['미리보기'],
			'cancel' : commonLang['취소'],
			'sample_img' : boardLang['샘플이미지'],
			'modify' : commonLang['수정'],
			'del' : commonLang['삭제'],
			'comment' : boardLang['개의 덧글'],
			'all_view' : boardLang['모두 보기'],
			'comment_modify' : boardLang['덧글 수정'],
			'comment_delete' : boardLang['덧글 삭제'],
			'comment_save' : boardLang['댓글 작성'],
			'close' : commonLang['닫기'],
			'plus_list' : boardLang['Plus 1 한 사람들'],
			'more_view' : boardLang['더 보기'],
			'more_content' : boardLang['더보기'],
			'content_fold' : commonLang['접기'],
			'no_content' : boardLang['아직 등록된 글이 없습니다. 글을 등록해 주세요.'],
			'alert_max_attach_cnt' : boardLang['최대 첨부 갯수는 0개 입니다.'],
			'alert_max_attach_size' : boardLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'],
			'alert_exclude_extension' : boardLang['확장자가 땡땡인 것들은 첨부 할 수 없습니다.'],
			'confirm_delete' : boardLang['게시글을 삭제 하시겠습니까?'],
			'confirm_comment_delete' : boardLang['댓글을 삭제 하시겠습니까?'],
			'confirm_delete_message' : boardLang['삭제확인메세지'],
			'confirm_comment_delete_message' : boardLang['댓글삭제확인메세지'],
			'alert_content' : boardLang['입력된 내용이 없습니다.'],
			'alert_length' : boardLang['0자이상 0이하 입력해야합니다.'],
			'input_placeholder' : boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.'],
			'comment_placeholder' : boardLang['댓글을 입력해주세요.'],
			'alert_url' : boardLang['잘못된 url입니다.'],
			'alert_fail' : commonLang['실패했습니다.'],
			'title_recommend' : commonLang['좋아요 하기'],
			'title_recommend_cancel' : commonLang['좋아요 취소'],
			'title_open' : commonLang['펼치기'],
			'title_close' : commonLang['접기'],
			'link_meta_delete' : boardLang['메타 데이터 삭제'],
			'link_meta_title' : boardLang['링크 메타정보 타이틀'],
			'link_meta_img' : boardLang['메타정보 이미지'],
			'link_content_delete' : boardLang['내용 삭제'],
			'link_img_delete' : boardLang['이미지 삭제'],
			'post_comment' : boardLang['댓글'],
			'count' : boardLang['개'],
			'back' : commonLang['이전'],
			'download' : commonLang['다운로드'],
			'alim_mail' : commonLang['메일알림'],
			'alim_push' : commonLang['푸시알림'],
			'alim_alert' : commonLang['관리자 설정으로 하나의 알림은 반드시 선택되어야 합니다.'],
			'alim_tooltip' : commonLang['해당 게시판에 접근 가능한 임직원에게만 알림이 발송됩니다.'],
			'mail_push_desc' : boardLang['메일알림안내'],
			'이 곳에 파일을 드래그 하세요': commonLang['이 곳에 파일을 드래그 하세요'],
			'public_writer' : boardLang['작성자 공개']
		};
		
		
		var PostStream = Backbone.View.extend({
			manage : false,
			initialize: function(options) {
				console.log("PostStream initialize");
				this.options = options || {};
				this.boardId = this.options.boardId;
				this.boardModel =  BoardModel.get(this.boardId);
				this.bbsWritable = this.options.bbsWritable;
				this.owner = this.options.owner || {};
				this.isCommunity = this.options.isCommunity;
				this.isCompany = this.owner.ownerType == 'Company';
				this.commentFlag = this.options.commentFlag;
				this.sendMailFlag = this.options.sendMailFlag;
				this.recommendFlag = false;
				this.isMoreComment = false;
				this.commentViewFlag = false;
				this.page = 0;
				this.streamFromDate = "";
				this.streamToDate = "";
				this._bindEvents();

				this.posts = new Posts([], {boardId: this.boardId});
				this.posts.on("sync", $.proxy(function() {
					this._renderList();
				}, this));
				this.posts.fetch({
					data: {
						"page": 0,
						"offset" : "10",						
					   	"sorts" : "createdAt desc"
					}
				});
				this.isSaaS = GO.session().brandName == "DO_SAAS";
				this.totalAttachSize = 0;
				this.totalAttachCount = 0;
			},
			
			events: {
				'change select#postSort': 'changePostSort',
				'change select#termSort': 'changeTermSort',
				'keyup #feedContent': 'streamKeyCheck',
				'keyup textarea.w_max': 'expandTextarea',
				'keyup textarea#feedContent': 'expandTextarea',
				'keyup textarea.txt_mini': 'expandTextarea',
				'keyup textarea.edit': 'expandTextarea',
				'click input[id=post_stream_mail_noti]': 'writeNoti',
				'click input[id=post_stream_push_noti]': 'writeNoti',
				'click span[id=sFeedWrite]': 'feedWrite',
				'click li.file span.ic_del': 'attachDelete',
				'click #moreButton': 'listMore',
				'click div.article_wrap div.info a.name': 'showProfileCardTrigger',
				'click span.ic_link_up': 'linkShow',
				'click div#linkWrap span.txt': 'linkInsert',
				'click input[id=link_img_delete]': 'linkImageDelete',
				'click input[id=link_description_delete]': 'linkDescriptionDelete',
				'click li.url span.ic_del': 'linkDelete',
				'click span#beforeCalendarIcon': 'beforeCalendarIcon',

				'dragover #dropZone': '_dragOver',
				'dragleave #dropZone': '_dragLeave',
				'drop #dropZone': '_drop'
			},
			
			render : function() {
				this.page = 0;
				this.streamFromDate = "";
				this.streamToDate = "";
				this.$el.html(this.makeTemplete({
					collection : this.posts.toJSON(),
					boardId : this.boardId,
					bbsWritable : this.bbsWritable
				}));
				
				this.feedInputFocus();
				this.initUpload("#steam_image_upload", "img");
				this.pluginInit();
				this.setViewedTotalAttachSize();

				$('.fancybox-thumbs').goFancybox();
				$('#content').addClass("go_renew");
				
				if(this.boardModel.toJSON().notificationFlag){
                    this.changeNotiStatus(true, $('#post_stream_push_noti'));
                }
				return this;
			},

			_dragOver: function (e) {
				e.preventDefault();
				e.stopPropagation();
				e.originalEvent.dataTransfer.dropEffect = 'move';
				$("#dropZone").addClass('drag_file');
			},

			_dragLeave: function (e) {
				e.preventDefault();
				e.stopPropagation();
				$("#dropZone").removeClass('drag_file');
			},

			_drop: function (e) {
				this._dragLeave(e);
			},
			
			_toggleStreamOption: function(flag) {
				this.$('#streamOption').toggle(flag);
			},
			
			_renderList: function() {
				var hasPosts = this.posts.length > 0;
				this.$('li[el-no-content]').toggle(!hasPosts);
				this.moreBtnHide(this.posts.page.lastPage);
				if (!hasPosts) return;
				if (this.posts.page.page == 0) this.$('li[data-postid]').remove();
				
				this.posts.each(function(model) {
					this.initItemView(model);
				}, this);
				
				this._postAttachResize();
				this._toggleStreamOption(hasPosts);
 			},
			
			_bindEvents: function() {
				var _this = this;
				$(window).unbind('scroll.board');
				$(window).bind('scroll.board', $.proxy(function (ev) {
					 if (($(document).height() - $(window).height() - $(document).scrollTop()) < 2) 
						 this.listMore();						
				}, this));
				
				$('div.article textarea.edit').live('keyup', function(e) {
					_this.postUpdateKeycheck(e);
				});
				
				$('div.reply_wrap textarea.edit').live('keyup', function(e) {
					_this.commentUpdateKeycheck(e);
				});
			},
			
			beforeCalendarIcon : function(){
				$("#beforePicker").focus();
			},
			
			streamKeyCheck : function(e){
				if(e.shiftKey && e.keyCode == 13){
					this.feedWrite();
				}
			},
			
			postUpdateKeycheck : function(e){
				if(e.shiftKey && e.keyCode == 13){
					$(e.currentTarget).parents('div.article').first().find('span[data-btntype="postUpdate"]').trigger('click');
				}
			},
			
			commentUpdateKeycheck : function(e){
				if(e.shiftKey && e.keyCode == 13){
					$(e.currentTarget).parents('div.msg_wrap').first().find('span[data-btntype="commentUpdate"]').trigger('click');
				}
			},
			
			expandTextarea : function(e){
				GO.util.textAreaExpand(e);
			},
			
			feedInputFocus : function(e){
				this.$("#feedWriteSmall").hide();
				this.$("#feedWriteLarge").show();
			},
			
			linkDelete : function(e){
				$('#metaWrap').children().remove();
				$('#linkWrap').css('display','none');
				if($("#optionDisplay").find('li').length < 1){
					$("#optionDisplay").removeClass("option_display");
					$("#optionDisplay").css("height","1px");
				}				
			},
			
			linkDescriptionDelete : function(e){
				var target = $(e.target);
				if(target.is(':checked')){
					$("#metaWrap .meta_contents").hide();
				}else{
					$("#metaWrap .meta_contents").show();
				}
			},

			linkImageDelete: function (e) {
				var target = $(e.target);
				if (target.is(':checked')) {
					$("#metaWrap .thumb").hide();
				} else {
					$("#metaWrap .thumb").show();
				}
			},

			linkInsert: function (linkURL) {
				var boardId = this.boardId;
				var target = encodeURIComponent(linkURL);

				if ($.trim(target) == "") {
					$.goMessage(boardLang['링크를 입력하세요.']);
					return;
				}

				var url = GO.contextRoot + "api/board/" + boardId + "/html/parser?url=" + target;

				$.go(url, '', {
					async: false,
					qryType: 'GET',
					contentType: 'application/json',
					responseFn: function (rs) {
						if (rs.code == 200) {
							var tplPostLink = TplPostLink({dataset: rs.data, lang: lang});
							$("#metaWrap").html(tplPostLink);
							$("#linkUrl").val('');
						} else {
							$.goMessage(lang.alert_url);
						}
					},
					error: function (error) {
						$.goMessage(lang.alert_url);
					}
				});
			},
			
			linkShow : function(e){
				this.feedInputFocus();
				$("#optionDisplay").addClass("option_display");
				$("#linkWrap").show();
				$("#linkUrl").focus();
				$("#optionDisplay").css("height","auto");
				this.openAttachPart($("#metaWrap"));
			},
			
			moreBtnHide : function(islastpage){
				$('#moreButton img').hide();
				$('#moreButton a').toggle(!islastpage);
			},
			
			listMore : function(){
				if (this.posts.page.lastPage) return;
				
				this.$('#moreButton img').show();
				this.$('#moreButton a').hide();
				
				this.page += 1;
				var data = {
					"page": this.page,
					"offset" : "10",						
				   	"sorts" : "createdAt desc"
				};
				
				if (this.streamFromDate != "") data.fromDate = this.streamFromDate;
				if(this.streamToDate != "") data.toDate = this.streamToDate;
								
				this.posts.fetch({data: data});
			},
			
			showProfileCardTrigger : function(e) {
				var userId = $(e.currentTarget).parents('.article').find('a[data-userid]').attr('data-userid');
				if(userId || userId != "") {
					ProfileView.render(userId, e.currentTarget);
				}
			},
			
			sortCalDate : function(){
				var sortOrder = $("#postSort option:selected");
				var select = $("#termSort option:selected");
				var startAt;
				var endAt;
				
				if (select.val() == "today") {
					$("#stream_customInput").hide();
					startAt = GO.util.toISO8601('1970/01/01');
					endAt = GO.util.toISO8601(new Date());
				} else if (select.val() == "before") {
					$("#stream_customInput").hide();
					var currentDate = new Date();
					var target = $("#termSort option:selected");
					var key = target.attr('data-key');
					var amount = target.attr('data-amount');
					
					startAt = GO.util.toISO8601('1970/01/01');
					endAt =  GO.util.calDate(currentDate,key,amount);
				}else {  //사용자 지정
					$("#stream_customInput").show();
					return null;
				}
				
				return {'startAt':startAt,'endAt':endAt,'selectOrder':sortOrder.val()};
			},
			
			changeTermSort : function(e){
				var sort = this.sortCalDate();
				if (sort == null) return;
				
				this.page = 0;
				var data = {
					"page": "0",
					"offset" : "10", 
					"fromDate" : sort.startAt,
					"toDate" : sort.endAt,
				   	"sorts" : sort.selectOrder + " desc"
				};
				
				this.streamFromDate = sort.startAt;
				this.streamToDate = sort.endAt;
				this.posts.fetch({data: data});
			},
			
			changePostSort : function(e){
				var sort = this.sortCalDate();
				if (sort == null) return;
				
				this.page = 0;
				var data = {
					"page":"0",
					"offset" : "10", 
					"fromDate" : sort.startAt,
					"toDate" : sort.endAt,
				   	"sorts" : sort.selectOrder + " desc"
				};
				
				this.streamFromDate = sort.startAt;
				this.streamToDate = sort.endAt;
				this.posts.fetch({data: data});
			},
			
			attachDelete : function(e){
				$(e.target).parents('li').first().remove();
				if($("#optionDisplay").find('li').length < 1){
					$("#optionDisplay").removeClass("option_display");
					$("#optionDisplay").css("height","1px");
					$("#linkWrap").hide();
					$(".meta_info_wrap").hide();
				}
				this.setViewedTotalAttachSize();
			},
			
			feedWrite : function(){
				if($("#progressbar").length > 0){					
					$.goMessage(commonLang['현재 파일 업로드 중입니다.']);
					return false;
				}

				var isPublicWriter = $('#isPublicWriter').is(':checked');
				var notiMail = $('#post_stream_mail_noti').is(':checked');
				var notiPush = $('#post_stream_push_noti').is(':checked');
				var content = $('#feedContent').val();
				
				if($.trim(content) == "" || content == lang.input_placeholder){
					$.goMessage(lang['alert_content']);
					return;
				}

				var matches = content.match(/\bhttps?:\/\/\S+/gi);
				if(matches && matches.length > 0) {
					this.linkInsert(matches[0]);
				}

				var attaches = [];
				var attachPart = $("#imgWrap,#fileWrap").find('li:not(.attachError)');
				
				attachPart.each(function(){
					attaches.push({path:$(this).attr("data-tmpname"),name:$(this).attr("data-name"),hostId:$(this).attr("data-hostid")});					
				});
				
				var linkPart = $("#metaWrap li");
				var links = [];
				if(linkPart.length > 0){
					var url = $("#metaWrap a.url_type").html();
					var videoSrc = $("#metaWrap a.url_type").attr('data-video');
					var thumb = this.$("#link_img_delete").is(":checked") ? null : $("#metaWrap .thumb img").attr("src");
					var title = $("#metaWrap .title").html();
					var description = this.$("#link_description_delete").is(":checked") ? null : $("#metaWrap .meta_contents").html();
					
					links.push({url:url,title:title,description:description,imageSrc:thumb,videoSrc:videoSrc}); 
				}
				
				var boardId = this.boardId;
				var _this = this;
				this.writemodel = new writeModel();
				this.writemodel.set({boardId : boardId, postId : ''}, {silent: true});
				this.writemodel.save({content:content,status:'OPEN', notiMailFlag:notiMail, notiPushFlag:notiPush, attaches:attaches,links:links, publicWriter:isPublicWriter}, {
					success : function(model, response) {
						_this.initItemView(model, true, true);
						_this._postAttachResize();
												
						$("#optionDisplay").find('li').remove();
						$("#optionDisplay").removeClass("option_display");
						$("#linkWrap").css("display","none");
						$("#optionDisplay").css("height","1px");
						$("#feedContent").val('').attr('style', 'height:80px');
						$(".commentAttachPart ul").css("margin-top","0px");	
						$("#post_stream_push_noti").attr('checked', false).parent().removeClass('action_on').addClass('action_off');
						$("#post_stream_mail_noti").attr('checked', false).parent().removeClass('action_on').addClass('action_off');
						$("div #mail_push_desc").hide();
						if(_this.boardModel.toJSON().notificationFlag){
							_this.changeNotiStatus(true, $('#post_stream_push_noti'));
		                }
						_this.nullTempleteDelete();
						
						GO.EventEmitter.trigger('board', 'change:boardInfo', _this.boardId);
						GO.EventEmitter.trigger(_this.isCommunity ? 'community' : 'board', 'changed:lastPostedAt', _this.boardId);
					},
					error : function(model, response) {
						var responseData = JSON.parse(response.responseText);
						if(responseData.message) $.goMessage(responseData.message);
						else $.goMessage(lang.alert_fail);						
					}
				});
			},
			
			_postAttachResize : function() {
				postAttachesView.resize(this.$el);
			},
			
			nullTempleteDelete : function(){
				this.$el.find('p.data_null').parent().remove();
			},
			
			changeNotiStatus : function(status,target){
				target.prop('checked', status);
				var targetId = target.attr("id");
				if(status){
					target.siblings("label").parent().removeClass('action_off').addClass('action_on');
					if(targetId.indexOf("mail") > 0) {
						$("div #mail_push_desc").show();
					}
				}else{
					target.siblings("label").parent().removeClass('action_on').addClass('action_off');
					if(targetId.indexOf("mail") > 0) {
						$("div #mail_push_desc").hide();
					}
				}
			},
			
			writeNoti : function(e){
				var notiPart = $(e.target);
				this.changeNotiStatus(notiPart.is(':checked'), notiPart);
				
				if(this.boardModel.toJSON().notificationFlag) {
                	// 사이트 어드민에서 '알림보내기' 설정되어 있으면  둘중하나는 무조건 체크 되어 있어야 한다. 
                	if( !$('#post_stream_mail_noti').is(':checked') && !$('#post_stream_push_noti').is(':checked') ){
                		$.goError(lang['alim_alert']);
                		this.changeNotiStatus(true, $('#post_stream_push_noti'));
                	}
                }
			},

			openAttachPart: function (obj) {
				obj.parent().css('display', '');
			},

			initUpload: function (id) {
                var self = this,
                options = {
                    el : id,
                    context_root : GO.contextRoot ,
                    button_text : "",
                    button_width : 70,
                    button_height : 23,
                    progressUse : true,
                    progressEl : "#progress_bar",
                    url : "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
                    mode : "IMAGE",
					dropZone: "#dropZone",
					imgTmpl : [
						"<span class='wrap_btn wrap_file_upload'>",
							"<span class='fileinput-button'>",
								"<span class='ic ic_file_s'></span>",
								"<input type='file' name='file' title='{title}' style='height:inherit;' multiple=''/>",
							"</span>",
							"<div class='progress' style='display:none;margin-top:5px'></span>",
						"</span>"].join("")
                };

				var maxAttachSize = (GO.config('attachSizeLimit')) ?
					parseInt(GO.config('maxAttachSize')) : parseInt(GO.config('commonAttachConfig').maxAttachSize);
				var maxAttachByteSize = maxAttachSize * 1024 * 1024;
				var maxAttachNumber = (GO.config('attachNumberLimit')) ?
					parseInt(GO.config('maxAttachNumber')) : parseInt(GO.config('commonAttachConfig').maxAttachNumber);

                (new FileUpload(options))
                .queue(function(e, data){
                    
                })
				.start(function (e, data) {
					if (!GO.config('attachFileUpload')) {
						$.goAlert(commonLang['파일첨부용량초과']);
						self.$("#dropZone").removeClass('drag_file');
						return false;
					}

					self.feedInputFocus();

					if ($('input[name=disabled]:checked', this).length) {
						e.preventDefault();
					}

					if (GO.config('excludeExtension') != "") {
						var test = $.inArray(data.type.substr(1).toLowerCase(), GO.config('excludeExtension').split(','));
						if (test >= 0) {
							$.goMessage(App.i18n(lang['alert_exclude_extension'], "arg1", GO.config('excludeExtension')));
							self.$("#dropZone").removeClass('drag_file');
							return false;
						}
					}

					if (self.isSaaS || GO.config('attachSizeLimit')) {
						if (maxAttachByteSize < data.size) {
							$.goMessage(App.i18n(lang['alert_max_attach_size'], "arg1", maxAttachSize));
							self.$("#dropZone").removeClass('drag_file');
							return false;
						} else {
							self.totalAttachSize += data.size;
						}
					}

					if (self.isSaaS || GO.config('attachNumberLimit')) {
						var currentTotalAttachCount = $("#imgWrap").find('li').length + $("#fileWrap").find('li').length + self.totalAttachCount + 1;
						if (maxAttachNumber < currentTotalAttachCount) {
							$.goMessage(App.i18n(lang['alert_max_attach_cnt'], "arg1", maxAttachNumber));
							self.$("#dropZone").removeClass('drag_file');
							return false;
						} else {
							self.totalAttachCount++;
						}
					}

					var fileProgressWrap =
						'<span class="btn_wrap">' +
							'<span class="txt" data-btntype="uploadCancelButton" class="ic_classic ic_del" title="' + lang.cancel + '"></span>' +
						'</span>';

					$('#progress_file').html(fileProgressWrap);
					$('#progress_file').show();
				})
				.progress(function (e, data) {
                    
                })
				.success(function (e, data, fileItemEl) {
					$('#progress_file').hide();
					var alertMessage = "";
					var attachClass = "file";
					if (GO.util.fileUploadErrorCheck(data)) {
						alertMessage = "<strong class='caution'>" + GO.util.serverMessage(data) + "</strong>";
						attachClass = "attachError";
					} else {
						if (GO.util.isFileSizeZero(data)) {
							$.goAlert(GO.util.serverMessage(data));
							return false;
						}
					}

					self.feedInputFocus();

                    if(!$("#optionDisplay").hasClass("option_display")){
                        $("#optionDisplay").addClass("option_display");
                        $("#optionDisplay").css("height","auto");
                    }
                    
                    var data = data.data;
                    var tmpName = data.filePath;
                    var name = data.fileName;
                    var extention = data.fileExt;
                    var size = GO.util.getHumanizedFileSize(data.fileSize);
                    var thumbnail = data.thumbnail;
                    var hostId = data.hostId;
                    var templete = "";

					if (GO.util.isImage(extention)) {
						templete =
							'<li class="' + attachClass + '" data-tmpname="' + tmpName + '" data-name="' + name + '" data-hostid="' + hostId + '" data-size="' + data.fileSize + '">' +
								'<span class="item_image">' +
									'<span class="thumb"><img src="' + thumbnail + '" alt="' + name + '" /></span>' +
									'<span class="name">' + name + '</span>' +
									'<span class="size">(' + size + ')</span>' +
								'</span>' +
								'<span class="btn_wrap">' +
									'<span class="ic_classic ic_del" title="' + lang['del'] + '"></span>' +
								'</span>' +
							'</li>';
						self.openAttachPart($('#imgWrap'));
                        $("#imgWrap").append(templete);

					} else {
						var fileType = "def";
						if (GO.util.fileExtentionCheck(extention)) {
							fileType = extention;
						}
						templete =
							'<li class="' + attachClass + '" data-tmpname="' + tmpName + '" data-name="' + name + '" data-hostid="' + hostId + '" data-size="' + data.fileSize + '">' +
								'<span class="item_file">' +
									'<span class="btn_bdr">' +
										'<span class="ic_classic ic_del" title="' + lang['del'] + '"></span>' +
									'</span>' +
									'<span class="ic_file ic_' + fileType + '"></span>' +
									'<span class="name">' + name + '</span>' +
									'<span class="size">(' + size + ')</span>' +
									alertMessage +
								'</span>' +
							'</li>';
						self.openAttachPart($('#fileWrap'));
                        $("#fileWrap").append(templete);
                    }
                    
                    $('#progressBarWrap').html("");

					self.setViewedTotalAttachSize();
					self.resetAttachSizeAndCount();
                })
				.complete(function (e, data) {

                })
				.error(function (e, data) {
					$('#progress_file').html("");
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
			
			makeTemplete : function(opt){
				var _this = this,
					anonymFlag = _this.boardModel.toJSON().anonymFlag;
				var availableAnonymousWriterOptionInPost = _this.boardModel.toJSON().availableAnonymousWriterOptionInPost;
				var tplData = {
					dataset : opt.collection,
					isListNull: opt.collection.length == 0 ? '' : 'none',
					lang:lang,
					bbsWritable:_this.bbsWritable,
					isCommunity : _this.isCommunity,
					isCompany : _this.isCompany,
					anonymFlag : anonymFlag,
					availableAnonymousWriterOptionInPost: availableAnonymousWriterOptionInPost
				};
				
				return TplPostStream(tplData);
			},
			
			pluginInit : function(){
				$('input[placeholder], textarea[placeholder]').placeholder();
				$(".commentAttachPart ul").css("margin-top","0px");				
				
				var beforePicker = $("#beforePicker");
				$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
				beforePicker.datepicker({
		            defaultDate: "+1w",
		            dateFormat : "yy-mm-dd",
		            changeMonth: true,
		            changeYear : true,
		            yearSuffix: "",
		            onSelect: $.proxy(function( selectedDate ) {
		            	var sortOrder = $("#postSort option:selected");
		            	var startAt = GO.util.toISO8601('1970/01/01');
						var endAt = GO.util.searchEndDate($("#beforePicker").val());
						var data = {
							"page": "0",
							"offset" : "10", 
							"fromDate" : startAt, 
							"toDate" : endAt,
						   	"sorts" : sortOrder.val() + " desc"
						};
						
						this.page = 0;
		            	this.streamFromDate = startAt;
						this.streamToDate = endAt;
		            	this.posts.fetch({data: data});
		            }, this)
		        });
			},
			
			initItemView : function(model, isPrepend, isDetail) {
				var view = new PostStreamUnit({
					el : $("<li></li>"),
					model : model,
					boardId : this.boardId,
					postId : model.id,
					boardModel : this.boardModel,
					isDetail : isDetail ? true : false,
					sendMailFlag : this.sendMailFlag,
					isCommunity : this.isCommunity
				});
				
				isPrepend ? this.$("ul.feed_type").prepend(view.render().el) : this.$("ul.feed_type").append(view.render().el); 
				$('.fancybox-thumbs').goFancybox();
			},

			getViewedTotalAttachSize: function () {
				var viewedTotalAttachSize = 0;
				$("#fileWrap, #imgWrap").find('li').each(function () {
					viewedTotalAttachSize += parseInt(this.getAttribute('data-size'), 0);
				});
				return viewedTotalAttachSize;
			},

			setViewedTotalAttachSize: function () {
				if (this.isSaaS || GO.config('attachSizeLimit')) {
					var current = this.getViewedTotalAttachSize();
					this.$el.find("#total_size").html(GO.util.displayHumanizedAttachSizeStatus(current));
				}
			},

			resetAttachSizeAndCount: function () {
				if (this.isSaaS || GO.config('attachSizeLimit')) {
					this.totalAttachSize = 0;
					this.totalAttachCount = 0;
				}
			}
		});
		
		return {
			render: function(opt) {
				var postStream = new PostStream({
					boardId: opt.boardId, 
					bbsWritable: opt.writable,
					isCommunity:opt.isCommunity,
					owner : opt.owner,
					commentFlag : opt.commentFlag || false,
					sendMailFlag : opt.sendMailFlag || false
				});
				/**
				 * 전역 selector 를 사용하고 있으므로 체인렌더링은 사용 할 수 없다.
				 */
				$('#content #postContents').html(postStream.el);
				postStream.render();
			}
		};
	});
}).call(this);