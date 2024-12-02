(function() {
    
    define([
        "survey/views/base/detail", 
        
        "app", 
        "survey/views/detail/response", 
        "survey/views/detail/result",
        "attach_file",
        "views/profile_card", 
        "comment",
        "components/backdrop/backdrop",
        "survey/helpers/html",
        "survey/libs/util", 
        "hgn!survey/templates/detail", 
        "text!survey/templates/detail_toolbar.html", 
        "i18n!nls/commons",
        "i18n!survey/nls/survey",
        
        "jquery.go-popup"
    ], 
    
    function(
		SurveyDetailBaseView, 
		
        GO, 
        DetailResponseView, 
        DetailResultView, 
        AttachFilesView,
        ProfileView, 
        CommentListView,
        BackdropView,
        HtmlHelper, 
        SurveyUtil,
        DetailTemplate, 
        ToolbarTemplate, 
        CommonLang,
        SurveyLang
    ) {
        var __super__ = SurveyDetailBaseView.prototype, 
        	SurveyDetailPcView;
        
        SurveyDetailPcView = SurveyDetailBaseView.extend({
            className: 'content_page', 
            
            events: {
                "click #btn-down-result": "_downloadResult",
                "click #btn-send-mail": "_sendMail", 
                'click .creator-info' : '_showProfileCard',
                "click .btn_more" : "_showMore",
                "click .toggle_detail" : "_toggleDetail"
            }, 
 
            initialize: function(options) {
            	_.extend(this.events, __super__.events);
            	__super__.initialize.apply(this, arguments);
                
                this.ResponseView = DetailResponseView;
                this.ResultView = DetailResultView;
            },
            
            render: function() {
            	var self = this; 
                
                this.model.fetch({
                    success: function(model) {
                    	if(model.isStopped() && !model.isCreator(GO.session("id"))) {
			            	$.goAlert(SurveyLang['중지된 설문'], SurveyLang['중지된 설문 안내문'], function() {
			            		GO.router.navigate('survey', {trigger: true});
							}, CommonLang["확인"]);
							return;
			            }
                        model.previewMode = self.previewMode;
                        renderSurveyContainer(self, model);
                        self._renderDetailSubView(model);
                    }, 
                    error: function() {
                    	GO.util.error('500');
                    }, 
                    statusCode: {
                        403: function() { GO.util.error('403', { "msgCode": '400-survey'} ); }, 
                        404: function() { GO.util.error('404', { "msgCode": '400-survey'} ); }, 
                        500: function() { GO.util.error('500'); }
                    }
                });
            }, 

            _downloadResult: function() {
            	GO.util.downloadCsvFile('api/survey/' +this.model.id + '/result/download');
            },
            
            _sendMail: function() {
            	var url = GO.contextRoot+ 'api/survey/' + this.model.id + '/sendmail';
            	$.goConfirm(CommonLang["메일 보내기"], SurveyLang["미참여자에게 알림"], function() {
					$.ajax(url, {
	            		async: false, 
	            		contentType: 'application/json', 
	            		error: function() {
	            			SurveyUtil.raiseRequestError();
	            		}
	            	});
				});
            
            },
            
            _showProfileCard: function(e) {
            	var userId = $(e.currentTarget).attr('data-userid');
				if(userId){
					ProfileView.render(userId, e.currentTarget);
				}
				return false;
            },

            _showMore: function (e) {
                if(!this.backdropView) {
                    this.backdropView = new BackdropView();
                    this.backdropView.backdropToggleEl = $("div[el-backdrop]");
                    this.backdropView.linkBackdrop($(e.currentTarget));
                }
            },

            _toggleDetail: function () {
                var openCloseBtn = this.$el.find(".toggle_detail > span");
                if(openCloseBtn.hasClass("ic_arrow_up_type4")) {
                    openCloseBtn.removeClass("ic_arrow_up_type4").addClass("ic_arrow_down_type4").attr("title", CommonLang["열기"]);
                } else {
                    openCloseBtn.removeClass("ic_arrow_down_type4").addClass("ic_arrow_up_type4").attr("title", CommonLang["닫기"]);
                }
                this.$el.find(".sub_report").toggle();
            }
        });
        
        function renderSurveyContainer(view, model) {
            view.$el.append(DetailTemplate({
                "context_root": GO.config('contextRoot'), 
                "survey_id": model.id, 
                "title": model.get('title'),
                "status": model.get('status'),
                "previewMode": view.previewMode,
                "creator?": model.isCreator(GO.session("id")),
                "creator": {
                	"id": model.get('creator').id,
                    "display_name": model.getCreatorName(), 
                    "thumbnail": (model.hasDeptName() ? null : model.get('creator').thumbnail)
                }, 
                "availableResultDownload" : model.isCreator(GO.session("id")) || model.isReferrer(GO.session("id")),
                "updated_at": GO.util.basicDate(model.get('updatedAt')), 
                "private_text": model.isPrivate() ? SurveyLang["비공개"]: SurveyLang["공개"], 
                "editable_text": model.get('editable') ? SurveyLang["허용"]: SurveyLang["허용안함"], 
                "survey_period": HtmlHelper.getSurveyPeriod(model), 
                "target_count": model.getTargetCount(),
                "response_count": model.getResponseCount(), 
                "no_response_count": model.getNoResponseCount(),
                "guidance": model.getGuidance(),
                "before_start?": model.isBeforeStart(),
                "isReady?" : model.isReady(), 
                "started?": model.isStarted(),
                "progressing?": model.isProgressing(),
                "stopped?": model.isStopped(),
                "finished?": model.isFinished(), 
                "isAvailableMail?": GO.isAvailableApp('mail'),
                "accessible?": view.accessible(), 
                "responded?": model.isResponseDone(), 
                "editable?": model.editable(), 
                "use_comment?": model.commentable(), 
                "label": {
                    "close": CommonLang["닫기"],
                    "result": SurveyLang["설문 결과"], 
                    "editable": SurveyLang["참여 후 수정"],
                    "previous": CommonLang["이전"], 
                    "next": CommonLang["다음"], 
                    "list": CommonLang["목록"],
                    "copy": CommonLang["URL 복사"],
                    "reply": CommonLang["댓글"],
                    "creator": CommonLang["작성자"],
                    'created_date' : CommonLang["작성일"],
                    "period": SurveyLang["설문 기간"], 
                    "download_result": SurveyLang["설문결과 다운로드"], 
                    "send_mail": SurveyLang["미참여자에게 알림 보내기"], 
                    "target_all": SurveyLang["전체 참여자"], 
                    "respondent": SurveyLang["참여완료"], 
                    "no_respondent": SurveyLang["미참여"], 
                    "modify_survey": CommonLang["수정"], 
                    "start_survey": CommonLang["진행"],
                    "stop_survey": CommonLang["중지"],
                    "finished_survey": SurveyLang["마감"],
                    "remove_survey": CommonLang["삭제"],
                    "copy_survey": CommonLang["복사"],
                    "modify_response": SurveyLang["응답 수정"],
                    "go_home": SurveyLang["설문 홈으로"],
                    "send_mail_desc" : SurveyLang["메일알림 설명"]
                }, 
                "msg": {
                    "responded": SurveyLang["설문 완료 메시지"], 
                    "not_accessible": SurveyLang["설문 상세 접근권한 없음 메시지"]
                }
            }, {
                "toolbar": ToolbarTemplate
            }));
            
            if(model.isStopped()) {
            	$('#btn-send-mail').hide();
            }
            
            if(model.hasDeptName()) {
            	view.$el.find('.article_header .info').css('margin-left', '0px');
            }
            
            AttachFilesView.create('#survey-attach-placeholder', model.getAttaches(), function(item) {
                return GO.config('contextRoot') + 'api/survey/' + view.model.id + '/download/' + item.id;
            });
            
            if(model.commentable()) {
            	attachCommentView(view, model);
            }
        }
        
        // TODO: 리팩토링
        function attachCommentView(view, model) {
        	var commentListView = CommentListView.render({
            	"el": view.$el.find('#comment-placeholder'), 
            	"typeUrl": 'survey', 
            	"typeId": view.model.id, 
            	"onAfterRender": function(commentListView) {
            		view.$el.find('.reply-count').text(commentListView.collection.length);
            	}
            });
            
            commentListView.$el.on('comment:change', function(e, type, count) {
            	view.$el.find('.reply-count').text(count);
            });
            
//            commentListView.$el.on('comment:delete', function(e, type, count) {
//            	view.$el.find('.reply-count').text(count);
//            });
        }
        
        function goToLastList() {
            return SurveyUtil.goToLastList();
        }
        
        return SurveyDetailPcView;
        
    });
    
})();