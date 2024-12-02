define("timeline/views/user/day", function (require) {

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/user/day");
    var DailyModel = require("timeline/models/daily_stat");
    var TimelineView = require("timeline/views/user/timeline");
    var TimelineLang = require("i18n!timeline/nls/timeline");
    var GO = require("app");
    var LocalStorage = require("timeline/helpers/user/local_storage");
    var BackdropView = require('components/backdrop/backdrop');

    var DayView = Backbone.View.extend({
        className: "tb_attend_list",
        events: {
            "click": "showTimeline",
            "click .gps_link": "moveLocation",
            "click .attend .wrap_tool_tip": "showAttendToolTip",
            "click .leave .wrap_tool_tip": "showLeaveToolTip",
            "click .tool_tip" : "clickToolTip"
        },

        clickToolTip : function(e){
            e.stopPropagation();
        },

        initialize: function () {
            this.model = new DailyModel(this.options.data);
            this.targetUserId = this.options.targetUserId;
            this.timeLineView = null;
            GO.EventEmitter.on('timeline', 'reset:timeline', _.bind(function () {
                this.removeTimeline();
            }, this));
        },

        render: function () {
            var self = this;
            this.$el.html(Tmpl({
                data: this.model.toJSON(),
                clockInBy : function() {
                    return self.model.get("clockInHistory").historyType.toLowerCase();
                },
                clockOutBy : function() {
                    return self.model.get("clockOutHistory").historyType.toLowerCase();
                },
                totalWorkingTime: function () {
                    if (self.model.hasTotalWorkingTime()) {
                        return self.model.getTotalWorkingTime();
                    }

                    return "";
                },
                workingTimeDetail: function () {
                    if (self.model.hasTotalWorkingTime()) {
                        return self.model.getWorkingTimeDetail();
                    }

                    return "";
                },

                isEditedWorkInTime: function () {
                    return self.model.isEditedWorkInTime();
                },

                isEditedWorkOutTime: function () {
                    return self.model.isEditedWorkOutTime();
                },

                approvals: function () {
                    return self.model.getApprovals();
                },

                clockOut: function () {
                    return self.model.getClockOutTime();
                },

                dayOfWeek: function () {
                    return TimelineLang[self.model.get("detailDay").dayOfWeek];
                },

                autoLang : TimelineLang['자동퇴근Auto']
            }));

            this.addDayOfWeekCss();
            this.addTodayCssIfToday();

            if (GO.util.store.get('timeline.selectedDay') == this.model.get("detailDay").day) {

                this.showTimeline();
            }
        },

        addTodayCssIfToday: function () {
            if (!this.model.isToday()) {
                return;
            }
            this.$el.addClass("today");
        },

        addDayOfWeekCss: function () {
            var dayOfWeek = this.model.getDayOfWeek();
            var className = "";

            if (dayOfWeek == "SUNDAY") {
                className = "day_sun";
            } else if (dayOfWeek == "SATURDAY") {
                className = "day_sat";
            } else if (this.model.get("holiDay")) {
                className = "day_holiday";
            }

            this.$el.addClass(className);
        },

        showTimeline: function (e) {
            if (!_.isUndefined(e) && $(e.target).hasClass("wrap_tool_tip")) {
                return;
            }
            if (this.timeLineView) {
                this.removeTimeline();
                return;
            }

            GO.util.store.set("timeline.selectedDay", this.model.get("detailDay").day, {type: "local"});

            GO.EventEmitter.trigger('timeline', 'reset:timeline', this);
            this.$el.addClass("tb_attend_select");
            this.timeLineView = new TimelineView({targetUserId: this.targetUserId, data: this.model.toJSON()});
            this.$el.after(this.timeLineView.$el);
            this.timeLineView.render();
        },

        showAttendToolTip: function (e) {
            var $currentTarget = $(e.currentTarget);
            $currentTarget.toggleClass("active");
            if (!this.attendBackdropView) {
                this.attendBackdropView = this._bindBackdrop($currentTarget);
            }

        },

        showLeaveToolTip: function (e) {
            var $currentTarget = $(e.currentTarget);
            $currentTarget.toggleClass("active");
            if (!this.leaveBackdropView) {
                this.leaveBackdropView = this._bindBackdrop($currentTarget);
            }
        },

        _bindBackdrop: function ($currentTarget) {
            var backdropView = new BackdropView();
            backdropView.backdropToggleEl = $currentTarget.find(".tool_tip");
            backdropView.linkBackdrop($currentTarget);
            return backdropView;
        },

        removeTimeline: function () {
            if (_.isEmpty(this.timeLineView)) {
                return;
            }

            this.timeLineView.remove();
            this.timeLineView = null;
            this.$el.removeClass("tb_attend_select");
        },
        moveLocation:function(e){
            console.log(this.model)
            var currentTarget = $(e.currentTarget);
            var id = currentTarget.attr('id');

            var link =  id === 'clock_in_link' ? this.model.getClockInGpsLink() : this.model.getClockOutGpsLink();
            window.open( link, "", "");
        }
    });

    return DayView;
});