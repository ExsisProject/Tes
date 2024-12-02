define("timeline/views/mobile/user/day", function(require){

    var Backbone = require("backbone");
    var GO = require("app");
    
    var DailyModel = require("timeline/models/daily_stat");

    var TimelineView = require("timeline/views/mobile/user/timeline");

    var Tmpl = require("hgn!timeline/templates/mobile/user/day");
    
    var TimelineLang = require("i18n!timeline/nls/timeline");

    var DayView = Backbone.View.extend({
        className : "daily",
        events : {
            "click" : "showTimeline"
        },

        initialize : function(){
            this.model = new DailyModel(this.options.data);
            this.targetUserId = this.options.targetUserId;
            this.timeLineView = null;
            GO.EventEmitter.on('timeline', 'reset:timeline', _.bind(function () {
                this.removeTimeline();
            }, this));
        },

        render : function() {
            var self = this;
            this.$el.html(Tmpl({
                data : this.model.toJSON(),
                clockOut: function () {
                    return self.model.getClockOutTime();
                },
                totalWorkingTime : function(){
                    if(self.model.hasTotalWorkingTime()){
                        return self.model.getTotalWorkingTime();
                    }

                    return "";
                },
                workingTimeDetail : function(){
                    if(self.model.hasTotalWorkingTime()){
                        return self.model.getWorkingTimeDetail();
                    }

                    return "";
                },
                isEditedWorkInTime : function(){
                    return self.model.isEditedWorkInTime();
                },
                isEditedWorkOutTime : function(){
                    return self.model.isEditedWorkOutTime();
                },
                isEmptyCheckTime : function() {
                	if(this.data.clockInTime || this.data.clockOutTime){
                		return false;
                	}else {
                		return true;
                	}
                },
                approvals : function(){
                    return self.model.getApprovals();
                },
                dayOfWeek : function(){
                    return TimelineLang[self.model.get("detailDay").dayOfWeek];
                }
            }));

            this.addDayOfWeekCss();
            this.addTodayCssIfToday();
        },

        addTodayCssIfToday : function(){
            if(!this.model.isToday()){
                return;
            }
            this.$el.find(".date_l").addClass("today");
            $(this.$el).parents("li#week").addClass("active");
            $(this.$el).parents("li#week").attr("data-active", true);
        },

        addDayOfWeekCss : function(){
            var dayOfWeek = this.model.getDayOfWeek();
            var className = "";

            if(dayOfWeek == "SUNDAY"){
                className = "sun";
            }else if(dayOfWeek == "SATURDAY"){
                className = "sat";
            }else if(this.model.get("holiDay")){
            	className = "holiday";
            }

            this.$el.addClass(className);
        },

        showTimeline : function(e){
            e.stopPropagation();

            if(this.timeLineView){
                this.removeTimeline();
                return;
            }
            GO.EventEmitter.trigger('timeline', 'reset:timeline', this);
            this.$el.addClass("active");
            this.$el.find(".date_l").removeClass("today");
            this.timeLineView = new TimelineView({targetUserId: this.targetUserId, data : this.model.toJSON()});
            this.$el.after(this.timeLineView.$el);
            this.timeLineView.render();
        },

        removeTimeline : function(){
            if(_.isEmpty(this.timeLineView)){
                return;
            }

            this.timeLineView.remove();
            this.timeLineView = null;
            this.$el.removeClass("active");
            this.addTodayCssIfToday();
        }
    });

    return DayView;
});