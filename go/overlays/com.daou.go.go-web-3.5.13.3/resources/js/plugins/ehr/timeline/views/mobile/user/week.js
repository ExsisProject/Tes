define("timeline/views/mobile/user/week", function(require){

    var Backbone = require("backbone");
    
    var Tmpl = require("hgn!timeline/templates/mobile/user/week");

    var DayView = require("timeline/views/mobile/user/day");
    
    var TimelineLang= require("i18n!timeline/nls/timeline");

    var WeekView = Backbone.View.extend({
    	events : {
            "click div[name=toggle]" : "toggle"
        },

        initialize : function(){
            this.model = this.options.model;
            this.targetUserId = this.options.targetUserId;
            this.index = this.options.index;
            this.lastWeek = this.options.lastWeek
        },

        render : function(isStat) {
            this.$el.html(Tmpl({
                TimelineLang : TimelineLang,
                index : this.index,
                lastWeek : this.lastWeek,
                totalWorkingTime : this.model.getTotalWorkingTime(),
                extensionWorkingTime : this.model.getExtensionWorkingTimeStr(),
                isOverTotalWorkingTime : this.model.isOverTotalWorkingTime()
            }));

            var $dayList = this.$el.find("#day_list");
            _.each(this.model.get("dailyList"), function(day){
                var dayView = new DayView({targetUserId : this.targetUserId, data: day});
                $dayList.append(dayView.$el);
                dayView.render();
            }, this);
            
            var $weekList = this.$el.find("#week");
            _.each($weekList, function(weekEl) {
            	var dataActive = $(weekEl).attr("data-active");
            	var arrowEl = $(weekEl).find("#arrow"),
            		dayListEl = $(weekEl).find("#day_list");
            	if(dataActive||isStat) {
            		arrowEl.removeClass("ic_arrow_down1");
            		arrowEl.addClass("ic_arrow_up1");
            	} else {
            		dayListEl.toggle();
            	}
            });
        },
        toggle : function(e){
            e.stopPropagation();
            var $target = $(e.currentTarget).find("#arrow");
            if($target.hasClass("ic_arrow_up1")){
                $target.removeClass("ic_arrow_up1");
                $target.addClass("ic_arrow_down1");
                this.$el.find("#day_list").parent("#week").removeClass("active");
            }else if($target.hasClass("ic_arrow_down1")){
                $target.removeClass("ic_arrow_down1");
                $target.addClass("ic_arrow_up1");
                this.$el.find("#day_list").parent("#week").addClass("active");
            }

            this.$el.find("#day_list").toggle();
        }
    });

    return WeekView;
});