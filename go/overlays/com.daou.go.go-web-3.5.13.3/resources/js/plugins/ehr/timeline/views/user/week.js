define("timeline/views/user/week", function(require){

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/user/week");
    var TimelineLang= require("i18n!timeline/nls/timeline");
    var DayView = require("timeline/views/user/day");
    var LocalStorage = require("timeline/helpers/user/local_storage");

    var WeekView = Backbone.View.extend({
        events : {
            "click #weekToggle" : "toggle"
        },

        initialize : function(){
            this.model = this.options.model;
            this.targetUserId = this.options.targetUserId;
            this.index = this.options.index;
        },

        render : function() {
            this.$el.html(Tmpl({
                TimelineLang : TimelineLang,
                index : this.index,
                totalWorkingTime : this.model.getTotalWorkingTime(),
                extensionWorkingTime : this.model.getExtensionWorkingTimeStr(),
                isOverTotalWorkingTime : this.model.isOverTotalWorkingTime()
            }));

            var $dayList = this.$el.find("#day_list");
            var includeToday = false;
            _.each(this.model.get("dailyList"), function(day){
                var dayView = new DayView({targetUserId : this.targetUserId, data: day});
                $dayList.append(dayView.$el);
                dayView.render();

                if(LocalStorage.isSelectedDay(day.detailDay.day)){
                    includeToday = true;
                }
            }, this);

            if (includeToday || LocalStorage.isContainWeek(this.index)) {
                this.show();
            }
        },

        toggle : function(){
            var $target = this.$el.find("#weekToggle");

            if($target.hasClass("ic_open")){
                this.show();
            }else if($target.hasClass("ic_close")){
                this.hide();
            }
        },

        show : function(){
            var $target = this.$el.find("#weekToggle");
            $target.removeClass("ic_open");
            $target.addClass("ic_close");
            this.$el.find("#day_area").show();
            LocalStorage.addWeek(this.index);
        },

        hide : function () {
            var $target = this.$el.find("#weekToggle");
            $target.removeClass("ic_close");
            $target.addClass("ic_open");
            this.$el.find("#day_area").hide();
            LocalStorage.removeWeek(this.index);
        }

    });
    return WeekView;
});