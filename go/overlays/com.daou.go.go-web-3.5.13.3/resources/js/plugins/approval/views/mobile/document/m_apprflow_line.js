define([
    "jquery",
    "backbone",
    "app",
    "hgn!approval/templates/mobile/document/m_apprflow_line",
    "i18n!approval/nls/approval"
],
function(
    $,
    Backbone,
    App,
    ApprFlowLineTpl,
    approvalLang
) {

    var lang = {
            "보류": approvalLang['보류'],
            "부서": approvalLang['부서']
    };

    var ApprFlowLineView = Backbone.View.extend({
        events: {
        },
        initialize: function(options) {
            this.options = options || {};
            this.apprLineModel = this.options.apprLineModel;
        },
        render: function() {
            var self = this;
            this.$el.html(ApprFlowLineTpl({
                dataset: this.apprLineModel.activityGroups,
                lang : lang,
                isComplete : function(){
                    return (typeof this.status != 'undefined' && this.status == "COMPLETE")? true : false;
                },
                statusType : function(){
                    var type = {
                        "undefined": "etc",
                        "COMPLETE": "finished",
                        "SKIP": "finished",
                        "RETURN": "return",
                        "WAIT": "ongoing",
                        "APPROVAL": "ongoing"
                    };
                    if (type[this.status] == '') {
                        return "etc";
                    }
                    if (this.status == "COMPLETE" && this.action == "RETURN") {
                        return "notyet";
                    }
                    return type[this.status];
                },
                formattedCompletedAt : function(){
                    return GO.util.basicDate(this.completedAt);
                },
                activityStatusName : function(){
                    if(!this.holdingActivity){
                        return;
                    }
                    return "("+this.name + " " + this.statusName+")";
                }
            }));
            return this;
        }
    });
    return {
        render: function(option) {
            var apprFlowLineView = new ApprFlowLineView(option);
            return apprFlowLineView.render();
        }
    };
});
