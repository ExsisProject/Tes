define([
    "jquery",
    "underscore",
    "backbone",
    "hgn!approval/templates/document/apprflow_history",
    "hgn!approval/templates/document/apprflow_history_view",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
    $, 
    _, 
    Backbone, 
    ApprFlowHistoryTpl,
    AppFlowHistoryViewTpl,
    commonLang,
    approvalLang
) {
    var lang = {
            "변경이력이 없습니다." : approvalLang['변경이력이 없습니다.'],
            "보기" : approvalLang['보기']
    };
    var ApprFlowHistoryView = Backbone.View.extend({
        
        tagName: 'div',
        className: 'aside_wrapper_body',
        
        initialize: function(options) {
            this.options = options || {};
            this.flowHistories = this.options.apprFlowHistories;
        },
        
        render: function() {
            var data = _.map(this.flowHistories, function(history) {
                var modifier = history.modifier;
                return {
                    date: GO.util.basicDate3(history.createdAt),
                    modifier: modifier.name + " " + modifier.position,
                    version: history.version
                };
            });

            var index = 0;
            this.$el.html(ApprFlowHistoryTpl({
                index : function() { return index++; },
                flowHistories : data,
                lang : lang
            }));
            
            return this;
        },
        
        showApprChangeLog: function(e){
            var targetEl = $(e.currentTarget);
            var arrIndex = $(targetEl).parent().find('[data-index]').attr('data-index');
            
            if ( $(targetEl).hasClass('ic_open')) { 
                $(targetEl).removeClass('ic_open').addClass('ic_close');
                $(targetEl).attr("title",approvalLang['닫기']);
                var viewTpl = AppFlowHistoryViewTpl({
                    lang : lang,
                    flowHistoriesView : this.flowHistories[arrIndex].apprActivites,
                    index : function(){
                        return this.seq+1;
                    }
                });
                
                $(targetEl).parent().closest('tr').after(viewTpl);
            } else {
                $(targetEl).removeClass('ic_close').addClass('ic_open');
                $(targetEl).attr("title",approvalLang['보기']);
                $(targetEl).closest('tr').next().remove();
            };
        }
    });

    return ApprFlowHistoryView;
});