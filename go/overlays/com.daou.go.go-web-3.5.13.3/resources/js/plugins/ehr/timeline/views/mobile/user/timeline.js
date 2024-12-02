define("timeline/views/mobile/user/timeline", function(require){

    var Backbone = require("backbone");

    var DailyModel = require("timeline/models/daily_stat");
    var AuthModel = require("timeline/models/auth");

    var Tmpl = require("hgn!timeline/templates/mobile/user/timeline");
    var EmptyTmpl = require("hgn!timeline/templates/mobile/user/timeline_empty");
    var TimelineApprovalTmpl = require("hgn!timeline/templates/mobile/user/timeline_approval_item");
    
    var TimelineItemView = require("timeline/views/mobile/user/timeline_item");

    var TimelineLang = require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var RegistTmpl = require("hgn!timeline/templates/mobile/user/timeline_regist");

    var lang = {
        "regist": [TimelineLang["근무"], TimelineLang["상태"], TimelineLang["등록"]].join(" ")
    };
    var TimelineView = Backbone.View.extend({
        className : "daily_status",
        events : {
            "vclick #registTimeline" : "registTimeline"
        },

        initialize : function(){
            this.model = new DailyModel(this.options.data);
            this.targetUserId = this.options.targetUserId;
        },

        render : function() {
            this.$el.html(Tmpl({}));
            var approvalTargetDiv = "";

            if(_.isEmpty(this.model.getTimelineHistories())){
                if(this.editableTimelineHistory()) {
                    this.$el.find(".list_timeline").append(RegistTmpl({
                        regist : lang['regist']
                    }));
                    approvalTargetDiv = ".time_add";
                } else {
                    this.renderEmptyTmpl();
                    approvalTargetDiv = ".data_null_s";
                }
            } else {
                this.renderTimelineItemView();
            	this.$el.find(".list_timeline div.timeline_de:first").addClass("first");
            	this.$el.find(".list_timeline div.timeline_de:last").addClass("last");
            	approvalTargetDiv = ".list_timeline div.timeline_de:last";
                if(this.editableTimelineHistory()) {
                    this.$el.find(approvalTargetDiv).after(RegistTmpl({
                        regist : lang['regist']
                    }));
                    approvalTargetDiv = ".time_add"
                }
            }

            if(!_.isEmpty(this.model.getApprovals())) {
            	this.$el.find(approvalTargetDiv).after(TimelineApprovalTmpl({
            		TimelineLang : TimelineLang,
            		approvals : this.model.getApprovals()
            	}));
            }
        },

        isTimelineSuperUser: function(){
            var authModel = new AuthModel(GO.util.store.get("timeline.auth"));
            return (authModel.isSuperUser());
        },

        editableTimelineHistory: function(){
            return this.isTimelineSuperUser() && (GO.util.isBeforeToday(this.model.day) || GO.util.isToday(this.model.day));
        },

        renderEmptyTmpl: function() {
            this.$el.find(".list_timeline").append(EmptyTmpl({
                empty : CommonLang["데이터가 없습니다."]
            }));
        },

        renderTimelineItemView: function(){
            _.each(this.model.getTimelineHistoriesSortByCheckTime(), function(history){
                var itemView = new TimelineItemView({
                    targetUserId : this.targetUserId,
                    dayInfo : this.options.data.detailDay,
                    data : _.extend(history, {checkType: history.historyType.toLowerCase()})
                });
                this.$el.find(".list_timeline").append(itemView.$el);
                itemView.render();
            }, this);
        },

        registTimeline: function(e){
            GO.router.navigate("ehr/timeline/history/new/update/" +this.targetUserId+ "/" + this.model.detailDay.day, {
                trigger: true,
                pushState: true
            });
        }
    });

    return TimelineView;
});