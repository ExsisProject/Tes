(function() {
    
    define([
        "backbone", 
        "app", 
        "survey/models/survey_response", 
        "survey/collections/queries",
        "survey/views/query/response", 
        "survey/libs/util", 
        "i18n!survey/nls/survey", 
        "jquery.go-popup"
    ], 
    
    function(
        Backbone,
        GO,
        SurveyResponseModel, 
        QueryCollection, 
        QueryResponseView,
        SurveyUtil, 
        SurveyLang
    ) {
    	var _savingFlag = false;
        
        var DetailResponseView = Backbone.View.extend({
            tagName: 'div',
            id: 'query-resp-form', 
            
            events: {
                "click .btn-complete": '_compelteSurvey', 
                "click .btn-tempsave": '_tempSave'
            }, 
            
            initialize: function() {
                if(!this.model) {
                    this.model = new SurveyResponseModel();
                }
                
                this.template = makeTemplate(this.model);
            }, 
            
            render: function() {
                var self = this;
                this.$el.append(this.template);
                this.model.getQueryList({
                    previewMode: self.model.previewMode,
                    success: function(collection) {
                        renderQueryList(self, collection);
                    }
                });
            }, 
            
            addQueryView: function(model) {
                var qrView = new QueryResponseView({ "model": model });
                this.$el.find('.survey_box .survey').append(qrView.el);
                qrView.render();
            }, 
            
            save: function(isTempsave) {
            	if(_savingFlag) {
	                return;
	            }
            	
                isTempsave = isTempsave || false;
                
                var self = this, 
                    queryList = [], 
                    respList = this.$el.find('.query-response'), 
                    confirmMsg = isTempsave ? SurveyLang["설문 응답 임시저장 확인 메시지"]: SurveyLang["설문 제출 확인 메시지"];
                
                for(var i=0, len=respList.length; i<len; i++) {
                    var qrView = $(respList[i]).data('instance');
                    
                    if(isTempsave || qrView.validate()) {	//임시 저장시 통과를 못해 isTempsave조건 추가
                        queryList.push(qrView.getUpdatedModel().toJSON());
                    } else {
                        queryList = [];
                        return false;
                    }
                }
                
                this._confirm(confirmMsg, function() {
                	GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
                	_savingFlag = true;
                	$.ajax(getRequestUrl(this.model, isTempsave), {
                    	//survey/{id}/response PUT요청은 응답 완료 후 수정시 호출하는 API입니다.
                        method: this.model.isResponseNone() || this.model.isResponseTemp() ? 'POST': 'PUT', 
                        data: JSON.stringify({"surveyQueryModels": queryList}), 
                        dataType: 'json',
                        contentType: 'application/json'
                    }).done(function(data) {
                        self.model.set('responseStatus', isTempsave ? 'temp': 'done');
                        GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                        GO.router.navigate('survey/' + self.model.id, {trigger: true, pushState: true});
                        _savingFlag = false;
                    }).fail(function(jqXHR) {
                    	
                    	GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);

                    	var errorJson = jqXHR.error().responseJSON;
                    	if(errorJson.name == "DuplicateRequestException") {
                    		var message = errorJson.message.split(",");
                    		SurveyUtil.raiseRequestError(message[0], message[1]);
                    	}else{
                    		SurveyUtil.raiseRequestError();
                    	}
                    	_savingFlag = false;
                    });
                });                
                _savingFlag = false;
                return true;
            }, 
            
            complete: function() {
                this.save(false);
            }, 
            
            tempsave: function() {
                this.save(true);
            },
            
            _compelteSurvey: function(e) {
                this.complete();
                
                return false;
            }, 
            
            _tempSave: function(e) {
                this.tempsave();
                
                return false;
            }, 
            
            _confirm: function(msg, callback) {
            	SurveyUtil.confirm(msg, '', _.bind(callback, this));
            }
        });
        
        function renderQueryList(view, collection) {
            collection.each(function(model, i) {
                this.addQueryView(model);
           }, view);
        }
        
        function makeTemplate(model) {
            var html = [];
            
            html.push('<div class="survey_box">');
                html.push('<ul class="survey"></ul>');
            html.push('</div>');

            if(model.isStarted() && !model.previewMode) {
                html.push('<div class="survey_action">');
                    html.push('<a href="#" class="btn-complete btn_major" data-role="button"><span class="txt">'+SurveyLang["설문 제출"]+'</span></a>');
                    if(!model.isResponseDone()) {
                    	html.push('<a href="#" class="btn-tempsave btn_minor" data-role="button"><span class="txt">'+SurveyLang["임시저장"]+'</span></a>');
                    }
                html.push('</div>');
            }
            
            return html.join("\n");
        }
        
        function getRequestUrl(surveyModel, isTempsave) {
            isTempsave = isTempsave || false;
            return GO.config('contextRoot') + 'api/survey/' + surveyModel.id + '/response' + (isTempsave ? '/tempsave' : '');
        }
        
        return DetailResponseView;
    });
    
})();