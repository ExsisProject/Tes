(function () {
    define([
            "jquery",
            "underscore",
            "backbone",
            "moment",
            "app"
        ],
        function (
            $,
            _,
            Backbone,
            moment,
            GO
        ) {
            var FORMAT_ISO8601 = "YYYY-MM-DDThh:mm:ssZZ";
            var toMoment = GO.util.toMoment;
            var now = GO.util.now();
            // 조회할 시작시간(기본값, 오늘 0시)
            var bStartTime = now.clone().startOf('day').format(FORMAT_ISO8601);
            // 조희할 종료 시간(기본값, 오늘 자정)
            var bEndTime = now.clone().endOf('day').format(FORMAT_ISO8601);

            var CalendarEvents = GO.BaseCollection.extend({
                periodId: -1,

                conditions: {
                    "timeMin": bStartTime,
                    "timeMax": bEndTime,
                    "maxResult": 1000
                },

                initialize: function () {
                    this.resetConditions();
                },

                getPeriodId: function () {
                    return this.periodId;
                },

                setPeriodId: function (newId) {
                    if (newId < 0) throw new Error("Invalid Period ID");
                    this.periodId = newId;
                    return this;
                },

                setBoundaryTime: function (timeMin, timeMax) {
                    this.setTimeMin(timeMin);
                    this.setTimeMax(timeMax);
                    return this;
                },

                setTimeMin: function (newTime) {
                    this.conditions.timeMin = toMoment(newTime);
                    return this;
                },

                setTimeMax: function (newTime) {
                    this.conditions.timeMax = toMoment(newTime);
                    return this;
                },

                /**
                 일정 패치 최대 갯수 설정

                 @method setMaxResult
                 @chainable
                 */
                setMaxResult: function (max) {
                    this.conditions.maxResult = max;
                    return this;
                },

                resetConditions: function () {
                    this.periodId = -1;
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