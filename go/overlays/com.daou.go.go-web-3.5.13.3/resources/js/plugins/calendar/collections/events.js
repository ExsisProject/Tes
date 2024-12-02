(function() {
    
    define([
        "jquery",
        "underscore", 
        "backbone", 
        "moment", 
        "app", 
        "calendar/models/event"
    ], 

    function(
        $, 
        _, 
        Backbone, 
        moment, 
        GO, 
        CalendarEvent
    ) {
    	var FORMAT_ISO8601 = "YYYY-MM-DDThh:mm:ssZZ";
        var CalendarEvents;
        var __super__ = GO.BaseCollection.prototype; 
        var _slice = Array.prototype.slice;
        var toMoment = GO.util.toMoment;
        var now = GO.util.now(); 
        // 조회할 시작시간(기본값, 오늘 0시)
        var bStartTime = now.clone().startOf('day').format(FORMAT_ISO8601); 
        // 조희할 종료 시간(기본값, 오늘 자정)
        var bEndTime = now.clone().endOf('day').format(FORMAT_ISO8601);

        CalendarEvents = GO.BaseCollection.extend({
            model: CalendarEvent, 
            
            /**
            캘린더 ID

            @property calendarId
            @type Integer
            @default -1
            */
            calendarId: -1, 

            /**
            경계조건들

            @attributes conditions
            @type Object
            */
            conditions: {
                "timeMin": bStartTime, 
                "timeMax": bEndTime, 
                "maxResult": 1000
            }, 

            initialize: function() {
                this.__dateslots__ = [];
                this.resetConditions();
            }, 

            url: function() {
                if(!this.isValidBoundary()) throw new Error("Invalid boundary conditions.");
                return "/api/calendar/" + this.calendarId + "/event?" + $.param(this.conditions);
            }, 

            /**
            캘린더 ID 반환

            @method getCalendarId
            @return {Integer} 캘린더 ID
            */
            getCalendarId: function() {
                return this.calendarId;
            }, 

            setCalendarId: function(newId) {
                if(newId < 0) throw new Error("Invalid Calendar ID");
                this.calendarId = newId;
                return this;
            }, 

            setBoundaryTime: function(timeMin, timeMax) {
                this.setTimeMin(timeMin);
                this.setTimeMax(timeMax);
                return this;
            }, 

            setTimeMin: function(newTime) {
                this.conditions.timeMin = toMoment(newTime).format(FORMAT_ISO8601);
                return this;
            }, 

            setTimeMax: function(newTime) {
                this.conditions.timeMax = toMoment(newTime).format(FORMAT_ISO8601);
                return this;
            }, 

            /**
            일정 패치 최대 갯수 설정

            @method setMaxResult
            @chainable
            */
            setMaxResult: function(max) {
                this.conditions.maxResult = max;
                return this;
            }, 
            
            // 경계조건이 무결한가?
            isValidBoundary: function() {
                var result = true;
                if(this.calendarId < 0) result &= false;
                if(toMoment(this.conditions.timeMin).diff(toMoment(this.conditions.timeMax), 'seconds') > 0) result &= false;
                return result;
            }, 

            // 경계조건들 내에 있는가?
            isInBoundary: function(timeMin, timeMax) {
                var _mstart = toMoment(timeMin), 
                    _mend = toMoment(timeMax), 
                    _cstart = toMoment(this.conditions.timeMin), 
                    _cend = toMoment(this.conditions.timeMax), 
                    result = true;

                // 캘린더 id가 신규이면 가져와야 한다.
                result &= !(Math.floor(_mstart.diff(_cstart, 'seconds', true)) < 0);
                result &= !(Math.floor(_mend.diff(_cend, 'seconds', true)) > 0);

                return result;
            }, 

            resetConditions: function() {
                this.calendarId = -1;
                this.__needFetch__ = false;
                this.conditions = {
                    "timeMin": bStartTime, 
                    "timeMax": bEndTime, 
                    "maxResult": 1000
                }
            }
        }, {
            __instance__: null
        });

        return CalendarEvents;
    });

}).call(this);