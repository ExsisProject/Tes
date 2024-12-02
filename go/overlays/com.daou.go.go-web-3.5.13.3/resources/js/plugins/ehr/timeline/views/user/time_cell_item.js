define("timeline/views/user/time_cell_item", function (require) {

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/user/time_cell_item");
    var PopupView = require("timeline/views/user/history_popup");
    var TimelineGroup = require("timeline/models/timeline_group");
    var AuthModel = require("timeline/models/auth");
    var HistoryModel= require("timeline/models/history");
    var TimelineLang= require("i18n!timeline/nls/timeline");
    var GO = require("app");


    var CellView = Backbone.View.extend({
        className: 'min',
        events: {
            "click": "showCreatePopup",
            "click .time_schedule" : "showEditPopup"
        },
        initialize: function (opt, hour, min, history) {
            this.options = opt;
            this.hour = hour;
            this.min = min;
            this.history = history;

            this.authModel = new AuthModel(GO.util.store.get("timeline.auth"));
            this.createable = this.authModel.isCreatable();

            if(!this.createable){
                this.$el.css("cursor", "auto")
            }

            this.targetUserId = this.options.targetUserId;
            this.dayInfo = this.options.dayInfo;
            this.splitMin = this.options.splitMin;

            this.group = this.options.group;
            this.timelineGroup = new TimelineGroup(this.group);
            this.restTime = this.timelineGroup.isRestTime(this.hour, this.min);

            this.dutyStartTime = this.timelineGroup.isDutyStartTime(this.hour, this.min);
            this.dutyEndTime = this.timelineGroup.isDutyEndTime(this.hour, this.min);

            this.includeHistory = this.history && this.history.isAfter(this.hour, this.min, 0) && this.history.isBefore(this.hour, this.min + 9, 59);
            if( this.includeHistory){
                this.statusName = this.history.getStatusName();
                this.statusTime = this.history.checkTimeHour() +":" + this.history.checkTimeMinute();
            }

        },
        render: function () {
            this.$el.html(Tmpl({
                includeHistory:this.includeHistory,
                statusName:this.statusName,
                statusTime:this.statusTime

            }));
            if (this.restTime) {
                this.$el.addClass('break');
            }
            if (this.dutyStartTime) {
                this.$el.addClass('coretime_s')
                this.$el.attr('title', TimelineLang['의무 근로 시작 시간'])
            } else if (this.dutyEndTime) {
                this.$el.addClass('coretime_s')
                this.$el.attr('title', TimelineLang['의무 근로 종료 시간'])
            }
        },
        showCreatePopup: function (e) {
            e.stopPropagation();
            if (!this.createable) {
                return;
            }

            var checkTime = GO.util.toMoment(this.dayInfo.day).add("hours", this.hour).add('minutes', this.min).format();
            var popupView = new PopupView({
                targetUserId: this.targetUserId,
                dayInfo: this.dayInfo,
                data: {checkTime: checkTime}
            });
            popupView.render();
        },
        showEditPopup : function(e){
            e.stopPropagation();

            if(!this.authModel.isEditable()){
                return;
            }

            var popupView = new PopupView({targetUserId : this.targetUserId,dayInfo : this.dayInfo,  data : this.history.attributes});
            popupView.render();

        },

    });


    return CellView;
});