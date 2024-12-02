(function() {
    
    define([
        "backbone", 
        "survey/models/query", 
        "helpers/form", 
        "survey/libs/util", 
        "survey/helpers/html", 
        "i18n!nls/commons", 
        "i18n!survey/nls/survey", 
        "jquery.go-popup"
    ], 
    
    function(
        Backbone, 
        QueryModel,
        FormHelper, 
        SurveyUtil, 
        SurveyHtmlHelper, 
        CommonLang,
        SurveyLang
    ) {
       
        var QueryResponseView = Backbone.View.extend({
            tagName: 'li', 
            className: 'query-response', 
            
            events: {
            	"click input[type=checkbox]": "_checkSelectedMax"
            }, 
            
            initialize: function() {
                if(!this.model) {
                    this.model = new QueryModel();
                }
                
                this.template = makeTemplate(this.model);
                this.$el.data('instance', this);
            }, 
            
            render: function() {
                this.$el.append(this.template);

                if(this.model.isScoreType()) {
                    this.$el.find('.wrap_answer').addClass('ranking');
                }
                
                _.each(this.model.getCases(), function(item, idx) {
                    $(makeQueryCase(this.model.get('type'), this.model.id, item))
                        .data('model', item)
                        .appendTo(this.$el.find('.wrap_answer'));
                }, this);
            },
            
            updateQueryCase: function() {
                var caseList = [], 
                	queryAnswered = false;
                
                this.$el.find('.wrap_answer li').each(_.bind(function(i, li) {
                    var item = $(li).data('model'), 
                    	answer = $(li).find('input[type=text], textarea').val(), 
                        isGroupOfText = this.model.isGroupOfText();
                    
                    if(isGroupOfText) {
                        item.selected = true;
                        queryAnswered = !!(answer.length > 0);
                    } else {
                        item.selected = $(li).find('input').is(':checked');
                        if(item.selected) queryAnswered = true;
                    }
                    
                    item.answer = answer;
                    
                    caseList.push(item);
                }, this));
                                
                this.model.set('cases', caseList);
                this.model.set('answered', queryAnswered);
                return this;
            }, 
            
            getUpdatedModel: function() {
            	this.updateQueryCase();
                return this.model;
            }, 
            
            validate: function() {
            	return formValidatePolicy(this);
            }, 
            
            _checkSelectedMax: function(e) {
            	var maxOfSelectable = this.model.getMaxOfSelectable();
            	
            	if(!this.model.isMultiSelectType()) return true;
            	// 0은 제한없음...
            	if(maxOfSelectable <= 0) return true;
            	
            	if(this.$el.find('input[type=checkbox]:checked').length > maxOfSelectable) {
            		SurveyUtil.alert('', GO.i18n(SurveyLang["복수 선택 최대선택 초과 오류 메시지"], {"max": maxOfSelectable}), CommonLang['닫기']);
            		return false;
            	}
            	
            	return true;
            }, 
            
            /**
             * 모바일에서는 alert() 함수를 쓰기 때문에 이 함수만 override해서 사용하도록 별도로 분리
             */
            _alert: function(title, msg) {
            	$.goAlert('', SurveyLang["필수질문 미응답 메시지"], '' , CommonLang['닫기']);
            }
        });
        
        function formValidatePolicy(view) {
        	var MAX_OF_TEXT = 255, 
        		MAX_OF_TEXTAREA = 1000;
        	
        	function selectValidatePolicy(view) {
            	if(!_selectTypeRequiredPolicy(view)) return false;
            	
            	return true;
            }
            
            function multiSelectValidatePolicy(view) {
            	var maxOfSelectable = view.model.getMaxOfSelectable();
            	if(!_selectTypeRequiredPolicy(view)) return false;
            	
            	if(maxOfSelectable > 0) {
                    if(view.$el.find('input:checked').length > maxOfSelectable) {
                    	_requiredAlert(view);
                    	return false;
                    }
                }
            	
            	return true;
            }
                        
            function textValidatePolicy(view) {
	        	return _textTypeValidatePolicy.call(view, 'input[type=text]', MAX_OF_TEXT);
            }
            
            function textareaValidatePolicy(view) {
	        	return _textTypeValidatePolicy.call(view, 'textarea', MAX_OF_TEXTAREA);
            }
            
            function _selectTypeRequiredPolicy(view) {
            	var $checkedEl = view.$el.find('input:checked');
            	if(view.model.isRequired() && $checkedEl.length < 1) {
            		_requiredAlert(view);
            		return false;
            	}
            	
            	return true;
            }
            
            function _textTypeValidatePolicy(selector, maxLength) {            	
            	var $el = this.$el.find(selector), 
            		respText = $el.val(), 
            		required = this.model.isRequired();
	    	
	        	if(required && !respText) {
	        		_requiredAlert(view);
	        		return false;
	        	}
	        	
	        	if(respText && respText.length > maxLength) {
	        		FormHelper.printError($el, SurveyUtil.getStringLengthError(1, maxLength));
	        		$el.focus();
	        		return false;
	        	}
	        	
	        	return true;
            }
            
            function _requiredAlert(view) {
            	SurveyUtil.alert(SurveyLang["필수질문 미응답 타이틀"], SurveyLang["필수질문 미응답 메시지"], CommonLang['닫기']);
            	scrollToView.call(view);
            }
        	
        	if(view.model.isSelectType()) return selectValidatePolicy(view);
			if(view.model.isMultiSelectType()) return multiSelectValidatePolicy(view);
			if(view.model.isTextType()) return textValidatePolicy(view);
			if(view.model.isTextareaType()) return textareaValidatePolicy(view);
			if(view.model.isScoreType()) return selectValidatePolicy(view);
			
			return false;
        };
        
        function scrollToView() {
        	var pos = this.$el.position(), 
        		winHeight = $(window).innerHeight(), 
        		offset = pos.top - (winHeight / 2);
        	
        	$(document).scrollTop(offset);
        }
        
        function makeTemplate(model) {
            return SurveyHtmlHelper.getQueryViewTemplate(model);
        }
        
        function makeQueryCase(type, queryId, caseData) {
            var body = [], 
                name = 'query_' + queryId, 
                answer = caseData.answer || '', 
                selected = caseData.selected || false, 
                inputType = {"select": "radio", "mselect": "checkbox", "text": 'text', 'score': 'radio'}[type], 
                startLi = '<li>';
            
            switch(type) {
            case 'select':
            case 'mselect':                
                if(caseData.caseType === 'input') {
                    startLi = '<li class="etc">';
                    body.push(SurveyHtmlHelper.getSelectUserInput(inputType, name, caseData));
                } else {
                    body.push(FormHelper[inputType].call(FormHelper, name, caseData.id, {"label": caseData.description, "checked": selected}));
                }
                
                break;
            case 'text':
                body.push('<div class="wrap_txt"><input class="txt w_max" type="'+inputType+'" name="' + name + '" value="' + answer + '"></div>');
                break
            case 'textarea':
                body.push('<div class="wrap_txtarea"><textarea class="txtarea w_max" name="'+ name +'" rows="5">' + answer + '</textarea></div>');
                break;
            case 'score':
                body.push(FormHelper[inputType].call(FormHelper, name, caseData.id, {"label": caseData.description, "checked": selected}));
                break;
            }

            return startLi + "\n" + body.join("\n") + "\n" + '</li>';
        }
        
        return QueryResponseView;
        
    });
    
})();