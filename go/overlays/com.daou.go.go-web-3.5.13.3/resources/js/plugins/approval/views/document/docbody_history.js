define([
    "jquery",
    "underscore",
    "backbone",
    "hgn!approval/templates/document/docbody_history",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
    $, 
    _, 
    Backbone, 
    DocBodyHistoryTpl,
    commonLang,
    approvalLang
) {
    var lang = {
        "변경이력이 없습니다." : approvalLang['변경이력이 없습니다.'],
        "보기" : approvalLang["보기"]
    };
    var DocBodyHistoryView = Backbone.View.extend({
        
        tagName: 'div',
        className: 'reply_wrap',
        initialize: function(options) {
            this.options = options || {};
            this.docHistories = this.options.actionLogs;
            this.isSiteAdmin = this.options.isSiteAdmin;
        },
        
        render: function() {
        	var self = this;
            var data = _.map(this.docHistories, function(history) {
                var modifier = history.modifier;
                return {
                    date: GO.util.basicDate3(history.createdAt),
                    actor: history.actor.name + " " + history.actor.position,
                    actionLogTypeName : history.actionLogTypeName,
                    hasDocVersion :  history.documentVersionModel ? true : false,
            		isSiteAdmin : self.isSiteAdmin
                };
            });
            
            var index = 0;
            this.$el.html(DocBodyHistoryTpl({
                index : function(){ return index++; },
                docHistories : data,
                lang : lang
            }));
            
            return this;
        },
        
        showApprChangeLog: function(e){
            var targetEl = $(e.currentTarget);
            return this.docHistories[$(targetEl).closest('tr').attr('data-index')].documentVersionModel;
        }
    });
    
    return DocBodyHistoryView;
});