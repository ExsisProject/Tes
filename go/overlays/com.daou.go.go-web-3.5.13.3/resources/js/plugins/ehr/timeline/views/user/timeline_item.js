define("timeline/views/user/timeline_item", function(require){
    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/user/timeline_item");
    var PopupView = require("timeline/views/user/history_popup");
    var HistoryModel = require("timeline/models/history");
    var TimelineGroup= require("timeline/models/timeline_group");
    var AuthModel = require("timeline/models/auth");
    var GO = require("app");

    var TimelineHitoryCollection = Backbone.Collection.extend({
        model : HistoryModel,
        totalPx:100,
        initialize : function(data, dayInfo, splitMin) {
            this.dayInfo = dayInfo;
            this.splitMin = splitMin;
            this.rate = this.splitMin / 60;
            this.px = this.totalPx * this.rate;
        },
        getData : function(){
            var self = this;
            return _.chain(this.models)
                .map(function (model) {
                    return {
                        id : model.get("id"),
                        name : model.getStatusName(),
                        time : model.checkTimeHourMinuteSecond(),
                        timeZone : model.get('timezoneInfo'),
                        content : model.getContent(),
                        editedCheckTime : model["editedCheckTime"],
                        nextDayWork : function(){
                            return self.dayInfo.day != model.checkTimeDate();
                        },
                        leftPadding : function(){
                            var minute = model.checkTimeMinute();
                            var minRate =  minute % self.splitMin ;
                            var leftPadding =  (( minRate / self.splitMin) * self.px);
                            return leftPadding;
                        }
                    }
                }).value();
        }
    });

    var TimelineItemView = Backbone.View.extend({
        events : {
            "click div.time_schedule" : "showEditPopup",
            "click" : "showCreatePopup"
        },

        className : "tb_cell",

        initialize : function(){

            this.authModel = new AuthModel(GO.util.store.get("timeline.auth"));

            if(!this.authModel.isEditable()){
                this.$el.css("cursor", "auto")
            }

            this.targetUserId = this.options.targetUserId;
            this.dayInfo = this.options.dayInfo;
            this.hour = this.options.hour;
            this.min= this.options.min;
            this.splitMin = this.options.splitMin;
            this.group = this.options.group;
            this.collection = new TimelineHitoryCollection(this.options.data, this.dayInfo, this.splitMin);
            this.timelineGroup = new TimelineGroup(this.group);
            this.restTime = this.timelineGroup.isRestTime(this.hour, this.min);
            this.workTime= this.timelineGroup.isWorkTime(this.hour, this.min);
            this.nightTime= this.timelineGroup.isNightTime(this.hour, this.min);
            this.dutyTime = this.timelineGroup.isDutyTime(this.hour, this.min);
        },
        getClassName:function(){
            if(this.restTime){
               return 'restTime' ;
            }else if(this.nightTime){
                return 'nightTime';
            }else if( this.dutyTime){
                return 'dutyTime';
            }else if( this.workTime){
                return 'workTime';
            }
            return '';
        },
        render : function(){
            var self = this;
            var viewHour = this.min < 1 ;
            this.$el.html(Tmpl({
                hour : this.leftPaddingZero(this.hour),
                min : this.min,
                viewHour: viewHour,
                data : this.collection.getData(),
                auth : this.authModel.toJSON(),
                cName : this.getClassName()
            }));
        },
        leftPaddingZero : function(hour){
            return hour.toString().length > 1 ? hour : "0" + hour;
        },

        showEditPopup : function(e){
            e.stopPropagation();

            if(!this.authModel.isEditable()){
                return;
            }

            var $target = $(e.currentTarget);
            var id = $target.data("id");

            var popupView = new PopupView({targetUserId : this.targetUserId,dayInfo : this.dayInfo,  data : this.collection.findWhere({"id" : id}).toJSON()});
            popupView.render();

        },

        showCreatePopup : function () {
            if(!this.authModel.isCreatable()){
                return;
            }

            var checkTime = GO.util.toMoment(this.dayInfo.day).add("hours", this.hour).add('minutes', this.min).format();
            var popupView = new PopupView({targetUserId : this.targetUserId, dayInfo : this.dayInfo, data : {checkTime : checkTime}});
            popupView.render();
        }
    });

    return TimelineItemView;
});