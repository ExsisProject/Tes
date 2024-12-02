(function() {
    define([
        "backbone", 
        "app", 
        "survey/views/list", 
        "i18n!survey/nls/survey"
    ], 
    
    function(
        Backbone, 
        GO,
        SurveyListView, 
        SurveyLang
    ) {
        
        var DashboardCreatedListView = SurveyListView.extend({
            tagName: 'div', 
            className: 'dr_wrapper', 
            
            initialize: function(options) {
            	SurveyListView.prototype.initialize.apply(this, arguments);
            	_.extend(this.options, options || {});
            	
            	// 아래 옵션은 강제로 설정해준다.
            	this.filterName = 'latest';
            	this.options.usePage = false;
            	this.options.useToolbar = false;
            	this.options.showSeq = false;
            }, 
            
            render: function() {
            	this.$el.before(makeHeaderTemplate());
            	SurveyListView.prototype.render.apply(this, arguments);
            }
        });
        
        function makeHeaderTemplate() {
        	var html = [];
            html.push('<h1 class="s_title">' + SurveyLang["최근 생성된 설문"]);
                html.push('<span class="btn_wrap">');
                    html.push('<span class="ic ic_info btn-toggle-desc">');
                        html.push('<span class="layer_tail tooltip-desc" style="display:none;">');
                            html.push('<i class="ic ic_tail"></i>');
                            html.push('<div>' + SurveyLang["대시보드 최근 생성된 설문 설명"] + '</div>');
                        html.push('</span>');
                    html.push('</span>');
                html.push('</span>');
            html.push('</h1>');

        	return html.join("\n");
        }
        
        return DashboardCreatedListView;
        
    });
})();