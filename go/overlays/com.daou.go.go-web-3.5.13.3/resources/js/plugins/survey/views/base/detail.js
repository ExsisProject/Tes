(function() {
	
	define([
        "backbone", 
        "app", 
        "survey/models/survey_response", 
        "survey/libs/util", 
        "i18n!nls/commons", 
        "i18n!survey/nls/survey"
    ], 
    
    function(
		Backbone, 
		GO, 
		SurveyResponseModel, 
		SurveyUtil, 
		CommonLang,
		SurveyLang
	) {
		
		var SurveyDetailBaseView = Backbone.View.extend({
			
			className: 'content_page', 
			
			events: {
                "click .btn-change-status": "_changeStatus", 
                "click .btn-remove-survey": "_removeSurvey",
                "click .btn-copy-survey": "copySurvey",
                "click .btn-list": "_goToList",
                "click .btn-modify-resp": "_modifyResponse"
            }, 
            
            // 모바일과 PC의 버튼 텍스트가 차이나므로...
            lang: {
            	"start_survey": CommonLang["진행"],
            	"stop_survey": CommonLang["중지"],
            	"finished_survey": SurveyLang["마감"]
            }, 
            
            ResponseView: null, 
            DetailResultView: null, 
            forceResponseView: null, 
            
            initialize: function(options) {
            	this.options = options || {};
            	
            	this.forceResponseView = this.options.forceResponseView || false;
                this.previewMode = this.options.previewMode;
                if(!this.model) {
                    this.model = new SurveyResponseModel();
                }
            }, 
            
            setResponseView: function() {
        		this.forceResponseView = true;
            }, 
            
            accessible: function() {
            	var userId = GO.session('id');
                
                // 등록자와 참조자는 무조건 볼 수 있다.
                if(this.model.isCreator(userId) || this.model.isIncludedReferrer(userId)) return true;
                // 참여자일 경우...
                if(this.model.isResponsible()) {
                    //설문이 끝나고 미참여인 상태에서 결과값이 보이지 않게하기위해
                    if(this.model.isResponseNone() && this.model.attributes.status == "finished" && this.model.attributes.visible == false ) return false;
                	// 아직 참여전이거나 임시저장 상태면 볼수 있다.(응답해야하니까...)
                	if(this.model.isResponseNone() || this.model.isResponseTemp()) return true;
                	// 응답했지만, 설문을 수정할 수 있으면 볼 수 있다.(응답 수정해야 하니까..)
                	if(this.model.isResponseDone() && this.model.isPublic()) return true;
                	// 응답했지만, 설문을 수정하러 들어온 경우는 볼수 있다...(응답 수정해야 하니까..)
                	if(this.model.isResponseDone() && this.forceResponseView === true) return true;
                }
                // 겸직자가 설문 미리보기 시
                if(this.previewMode && GO.session('integratedCompanies').length > 1) return true;

                // 그외는 안내문 표시
                return false;
            }, 
            
            // 설문 변경 테스트 스타일
            getConfirmTextClass: function() {
            	return 'txt_caution';
            },
            
            removeSurvey: function() {
            	this.model.destroy({
                    success: _.bind(function() {
                        this.remove();
                        SurveyUtil.goToLastList();
                    }, this), 
                    
                    error: function() {
                    	SurveyUtil.raiseRequestError();
                    }
                });
            },

            copySurvey: function() {
                var self = this;
                $.goConfirm(SurveyLang["설문을 복사하시겠습니까?"], SurveyLang["설문 복사 알림"], function(){
                    var url =  GO.contextRoot + "api/survey/" + self.model.id + "/copy";
                    $.ajax(url, {method: 'POST'}).done(function(resp) {
                        var editUrl = 'survey/' + resp.data.id + '/copied/edit';
                        if(self.previewMode) {
                            var redirectUrl = GO.contextRoot + 'app/' + editUrl;
                            window.close();
                            window.opener.location.href = redirectUrl;
                        } else {
                            GO.router.navigate(editUrl, {trigger: true, pushState: true});
                        }
                    });
                });
            },

            _confirmSuvey : function(fn,currentStatus, confirmMsg) {
                SurveyUtil.confirm(confirmMsg, _.bind(function() {
                    this.model[fn].call(this.model, {
                        success: _.bind(function(model) {
                            //진행중 또는 중지된 설문을 수정할때
                            if(currentStatus =='modify_progress'){
                                GO.router.navigate('survey/' + this.model.id +'/edit' , { trigger: true, pushState: true });
                            }
                            else{
                                GO.router.navigate('survey/' + this.model.id , { trigger: true, pushState: true });
                            }
                        }, this),

                        error: function() {
                            SurveyUtil.raiseRequestError();
                        }
                    });
                }, this));
            },

            _changeStatusForMobile : function(currentStatus) {
                var confirmMsg, fn, nextStatus, text;
                switch(currentStatus) {
                    case 'progress':
                        fn = 'stop';
                        nextStatus = 'stop';
                        text = this.lang.start_survey;
                        confirmMsg =  SurveyLang["설문 중지 안내 메시지"];
                        break;
                    case 'temp':
                        fn = 'start';
                        nextStatus = 'progress';
                        text = this.lang.stop_survey;
                        confirmMsg =  SurveyLang["설문 시작 안내 메시지"];
                        break;
                }
                this._confirmSuvey(fn,currentStatus,confirmMsg)
            },

            _changeStatus: function(e) {
                var $btn = $(e.currentTarget),
                	currentStatus = $btn.attr('data-status'),
                	// TODO: 디자인팀과 협의해서 클래스명을 맞추어서 더 간결하게 하자.
                	txtClass = this.getConfirmTextClass(), 
                	confirmMsg,
                    fn, nextStatus, text;

                switch(currentStatus) {
                case 'progress':
                    fn = 'stop';
                    nextStatus = 'stop';
                    text = this.lang.start_survey;
                    confirmMsg =  SurveyLang["설문 중지 안내 메시지"];
                    break;
                case 'modify_progress':
                    fn = 'stop';
                    confirmMsg =  SurveyLang["진행중 설문 수정 알림"];
                    break;    
                case 'stop':
                case 'temp':
                    fn = 'start';
                    nextStatus = 'progress';
                    text = this.lang.stop_survey;
                    confirmMsg =  SurveyLang["설문 시작 안내 메시지"];
                    break;
                case 'finished':
                	fn = 'finished';
                	nextStatus = 'finished';
                	text = this.lang.finished_survey;
                	confirmMsg = SurveyLang["설문 마감 확인 타이틀"];
                	break;
                }
                this._confirmSuvey(fn,currentStatus,confirmMsg)
            },
            
            _modifyResponse: function(e) {
            	GO.router.navigate('survey/' + this.model.id + '/response/edit', { trigger: true, pushState: true });
            }, 
            
            /**
             * 설문 삭제(설문 등록자만 가능)
             * 	- 설문 삭제시에는 URL이 다르므로 별도로 보낸다.
             * @param e
             */
            _removeSurvey: function(e) {
            	SurveyUtil.confirm(SurveyLang["설문 삭제 확인 타이틀"], SurveyLang["설문 삭제 확인 메시지"], _.bind(this.removeSurvey, this));
            }, 
            
            _goToList: function(e) {
            	SurveyUtil.goToLastList();
            }, 
            
            _renderDetailSubView: function(model) {
            	return renderDetailSubView(this, model);
            }
		});
		
		/**
         * ===== 뷰 결정 조건 정의 ======
         * 1. 응답 수정 모드일 경우: DetailResponseView 렌더링
         * 2. 설문 진행중 여부 조사
         *  - 진행중이면, 
         *      - 참여자 여부 조사
         *          - 참여자이면, 
         *              - 설문 응답 완료(responseStatus == 'done') 이면, DetailResultView 렌더링
         *                  - 등록자이거나, 참여자가 설문결과를 볼수 있으면, DetailResultView 뷰의 결과 렌더링
         *                  - 그외에는 DetailResultView의 설문 완료 페이지 렌더링
         *              - 응답 전(responseStatus == 'none') 혹은 임시저장(responseStatus == 'temp')이면, DetailResponseView 렌더링
         *      - 참여자가 아니면, 
         *          - 등록자이거나 참조자이면, DetailResultView 렌더링
         *          - 그외에는 접근 불가
         *  - 준비상태이거나 임시저장 상태이면,
         *      - 등록자이면, DetailResponseView 렌더링
         *      - 그외에는 접근 불가
         *  - 완료상태이면,
         *      - DetailResultView 렌더링
         *      
         */
        function renderDetailSubView(view, model) {
            var klass, subview, 
                userId = GO.session('id'), 
                isCreator = model.isCreator(userId);
            
            if(view.forceResponseView) {
            	klass = view.ResponseView;
            } else {
            	if(model.isProgressing()) {
                    if(model.isResponsible()) {
                        if(model.isResponseDone()) {
                            klass = view.ResultView;
                        } else {
                            klass = view.ResponseView;
                        }
                    } else if(isCreator || model.isIncludedReferrer(userId)) {
                        klass = view.ResultView;
                    } 
                    
                } else if(model.isBeforeStart() && isCreator) {
                    klass = view.ResponseView;
                } else if(model.isFinished()) {
                    klass = view.ResultView;
                }
            }

            subview = new klass({"model": model, "previewMode": model.previewMode});
            view.$el.find('.queryview-placeholder').replaceWith(subview.el);
            subview.render();
        }
		
		return SurveyDetailBaseView;
	});
	
})();