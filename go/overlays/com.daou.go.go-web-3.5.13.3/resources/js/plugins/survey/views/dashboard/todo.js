(function() {
    define([
        "underscore", 
        "backbone", 
        "app",
        "survey/collections/surveys", 
        "views/card_item", 
        "survey/helpers/html", 
        "i18n!nls/commons", 
        "i18n!survey/nls/survey", 
        "jquery.ajaxmock"
    ], 
    
    function(
        _, 
        Backbone,
        GO,
        SurveyCollection, 
        CardItemView, 
        HtmlHelper, 
        CommonLang,
        SurveyLang
    ) {
        
        var DashboardTodoListView = Backbone.View.extend({
            tagName: 'div', 
            className: 'dr_wrapper',  
            
            events: {
                
            }, 
            
            initialize: function() {
                if(!this.collection) {
                    this.collection = new SurveyCollection();
                }
                this.collection.pageOptions.offset = 6;
            }, 
            
            render: function() {
                
                this.$el.append(makeTemplate());
                
                this.collection
                    .setFilter('todo')
                    .fetch({
                        success: _.bind(renderCardViewList, this)
                    });
            }
        });
        
        function makeTemplate() {
            var html = [];
            
            html.push('<h1 class="s_title">' + SurveyLang["진행중인 설문"]);
                html.push('<span class="btn_wrap">');
                    html.push('<span class="ic ic_info btn-toggle-desc">');
                        html.push('<span class="layer_tail tooltip-desc" style="display:none;">');
                            html.push('<i class="ic ic_tail"></i>');
                            html.push('<div>' + SurveyLang["대시보드 진행중 설문 설명"] + '</div>');
                        html.push('</span>');
                    html.push('</span>');
                html.push('</span>');
            html.push('</h1>');
            html.push('<div class="dashboard_box">');
                html.push('<div class="card_item_wrapper"></div>');
            html.push('</div>');
            
            return html.join("\n");
        }
        
        function renderCardViewList(collection) {
            if(collection.length > 0) {
            	collection.each(function(model, i) {
                    var view = new CardItemView();
                    this.$el.find('.card_item_wrapper').append(view.el);
                    view.setHeader(makeCardViewHeader(model, i + 1));
                    view.setSubject(makeCardViewSubject(model));
                    view.setContent(makeCardViewContent(model));
                    
                    if(isHideButton(model)) {
                        ;
                    } else {
                    	var btnLabel = '', 
                    		btnUrl = '/survey/' + model.id;
                    	
                    	if(model.isResponseDone()) {
                    		// 설문등록자가 아니며 설문결과 비공개, 설문응답 수정가능한 상태이면 "응답수정" 버튼을 보이도록 처리...
                    		if(!model.isCreator(GO.session('id')) && model.isPrivate() && model.editable()) {
                    			btnLabel = SurveyLang["응답 수정"];
                    			btnUrl = btnUrl + '/response/edit';
                    		} else {
                    			btnLabel = SurveyLang["결과 보기"];
                    		}
                    		
                    	} else if(model.isResponseTemp()) {
                    		btnLabel = SurveyLang["계속 참여"];
                    	} else if(model.isIncludedReferrer(GO.session('id')) && !model.isResponsible()){
                    		btnLabel = SurveyLang['결과 보기'];
                    	} else {
                    		btnLabel = SurveyLang["설문 참여"];
                    	}
                    	
                        view.addButtons({
                            name: "apply_survey", 
                            label: btnLabel, 
                            onClick: function(e, el, view) {
                                GO.router.navigate(btnUrl, {trigger: true, pushState: true});
                            }
                        });
                    }
                    
                    view.$el.addClass('survey_home_card');
                    view.render();
                }, this);
            } else {
            	this.$el.find('.card_item_wrapper').replaceWith('<p class="desc">'+SurveyLang["진행중 설문 없음 메시지"]+'</p>');
            }
        }
        
        /**
         * 버튼을 숨겨야하는 유일한 조건
         * 1. 설문등록자가 아니면서
         * 2. 설문참여자이고 설문에 참여완료하였으며,
         * 3. 설문결과가 비공개이며,
         * 4. 설문응답 후 수정할 수 없는경우.
         */
        function isHideButton(model) {
        	return !model.isCreator(GO.session('id')) && model.isResponseDone() && model.isPrivate() && !model.editable();
        }
        
        function makeCardViewHeader(model, seq) {
            var html = [];
            
            html.push('<span class="number">No.'+seq+'</span>');
            
            if(model.isResponsible()) {                                        
            	html.push(HtmlHelper.getStatusTagByResponse(model.getResponseStatus()));
            } else if(model.isIncludedReferrer(GO.session('id'))) {
            	html.push(HtmlHelper.getStatusTag('read', SurveyLang["열람"]));
            }
            
            if(model.isIncludedReferrer(GO.session('id'))) {
            	html.push(HtmlHelper.getReferTag(model.getResponseStatus()));
            }
            
            return html.join("\n");
        }
        
        function makeCardViewSubject(model) {
            var html = [], 
            	// 8.3에서는 종일 설문만 지원
                // startDt = GO.util.toMoment(model.get('startTime')).format('YYYY-MM-DD HH:mm'), 
                // endDt = GO.util.toMoment(model.get('endTime')).format('YYYY-MM-DD HH:mm');
            	startDt = moment(model.get('startTime'),'YYYY-MM-DD').format('YYYY-MM-DD'),
            	endDt = moment(model.get('endTime'),'YYYY-MM-DD').format('YYYY-MM-DD');
            
            html.push('<span class="title">'+ _.escape(model.get('title')) + '</span>');
            html.push('<span class="date">' + startDt + '~' + endDt + '</span>');
            
            return html.join("\n");
        }
        
        function makeCardViewContent(model) {
            var html = [], 
                publicText = model.isPrivate() ? SurveyLang["비공개"] : SurveyLang["공개"],
                displayName = model.getCreatorName();
            
            html.push('<table class="form_s">');
                html.push('<tbody>');
                    html.push('<tr>');
                        html.push('<th>' + SurveyLang["작성자"] + '</th>');
                        html.push('<td>' + displayName + '</th>');
                    html.push('</tr>');
                    html.push('<tr>');
                        html.push('<th>' + SurveyLang["설문 결과"] + '</th>');
                        html.push('<td>' + publicText + '</th>');
                    html.push('</tr>');
                html.push('</tbody>');
            html.push('</table>');
            
            return html.join("\n");
        }
        
        return DashboardTodoListView;
        
    });
})();