define("admin/views/ehr/timeline/group/rest_time_range", function(require){
    var Backbone = require("backbone");
    var Tmpl = require("hgn!admin/templates/ehr/timeline/group/rest_time_range");

    var MAX_HOUR = 24;
    var MAX_MINUTE = 60;
    var MAX_SECOND = 60;
    var HOUR = _.range(0,MAX_HOUR).map(function(num){ return num < 10 ? "0"+num : num });
    var MINUTE = _.range(0,MAX_MINUTE).map(function(num){return num < 10 ? "0"+num : num });
    var SECOND = _.range(0,MAX_SECOND).map(function(num){return num < 10 ? "0"+num : num });

    var Model = Backbone.Model.extend({
        defaults : {
            "startTime" : "12:00:00",
            "endTime" : "13:00:00"
        },

        getTime : function(HHMMSS){
            var timeArr = HHMMSS.split(":");
            return {
                hour : timeArr[0],
                minute : timeArr[1],
                second : timeArr[2]
            }
        },

        isStartHour : function(hour){
            return this.getTime(this.get("startTime")).hour == hour;
        },
        isStartMinute : function(minute){
            return this.getTime(this.get("startTime")).minute == minute;
        },
        isStartSecond : function(second){
            return this.getTime(this.get("startTime")).second == second;
        },
        isEndHour : function(hour){
            return this.getTime(this.get("endTime")).hour == hour;
        },
        isEndMinute : function(minute){
            return this.getTime(this.get("endTime")).minute == minute;
        },
        isEndSecond : function(second){
            return this.getTime(this.get("endTime")).second == second;
        }
    });

    var RestTimeRangeView = Backbone.View.extend({
        events : {
            "click #add" : "add",
            "click #remove" : "remove"
        },

        initialize : function() {
            this.model = new Model(this.options.data)
        },

        render : function(deletable) {
            var self = this;
            this.$el.html(Tmpl({
                data : this.model.toJSON(),
                HOUR : HOUR,
                MINUTE : MINUTE,
                SECOND : SECOND,
                isStartHour : function () {return self.model.isStartHour(this)},
                isStartMinute : function() {return self.model.isStartMinute(this)},
                isStartSecond : function() {return self.model.isStartSecond(this)},
                isEndHour :  function () {return self.model.isEndHour(this)},
                isEndMinute : function () {return self.model.isEndMinute(this)},
                isEndSecond : function () {return self.model.isEndSecond(this)},
                deletable : deletable
            }));
        },

        add : function(){
            this.trigger("add", this);
        },

        remove : function() {
            this.trigger("remove", this);
            this.$el.remove();
        },

        getVariable : function(){
            var $el = this.$el;

            return {
                name : $el.find("#name").val(),
                startTime : $el.find("#startHour").val() + ":" + $el.find("#startMinute").val()+ ":" + $el.find("#startSecond").val(),
                endTime : $el.find("#endHour").val() + ":" + $el.find("#endMinute").val() + ":" + $el.find("#endSecond").val()
            }
        }
    });

    return RestTimeRangeView;
});