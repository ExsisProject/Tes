define([
        "underscore",
        "moment",
        "app",
        "i18n!calendar/nls/calendar"
    ],

    function (
        _,
        moment,
        GO,
        calLang
    ) {

        var // 상수 정의
            FREQ = GO.constant("calendar", "RECURRENCE_FREQ"),
            DAY_STR = {
                "SU": calLang["일요일"], "MO": calLang["월요일"], "TU": calLang["화요일"], "WE": calLang["수요일"],
                "TH": calLang["목요일"], "FR": calLang["금요일"], "SA": calLang["토요일"]
            },
            WEEK_STR = {
                "1": calLang["첫째주"], "2": calLang["둘째주"], "3": calLang["셋째주"],
                "4": calLang["넷째주"], "5": calLang["다섯째주"], "-1": calLang["마지막 주"]
            },
            recurreceKeys = [
                "FREQ", "UNTIL", "COUNT", "INTERVAL", "BYSECOND",
                "BYMINUTE", "BYHOUR", "BYDAY", "BYMONTHDAY", "BYYEARDAY",
                "BYWEEKNO", "BYMONTH", "BYSETPOS", "WKST"
            ];

        /**
         Recurrece Parser Class

         [rfc2445:Recurrence 문자열 포맷]
         recur = "FREQ"=freq *(

         ; either UNTIL or COUNT may appear in a 'recur',
         ; but UNTIL and COUNT MUST NOT occur in the same 'recur'

         ( ";" "UNTIL" "=" enddate )                 /
         ( ";" "COUNT" "=" 1*DIGIT )                 /

         ; the rest of these keywords are optional,
         ; but MUST NOT occur more than once

         *( ";" "INTERVAL" "=" 1*DIGIT )             /
         ( ";" "BYSECOND" "=" byseclist )            /
         ( ";" "BYMINUTE" "=" byminlist )            /
         ( ";" "BYHOUR" "=" byhrlist )               /
         *( ";" "BYDAY" "=" bywdaylist )             /
         *( ";" "BYMONTHDAY" "=" bymodaylist )       /
         ( ";" "BYYEARDAY" "=" byyrdaylist )         /
         ( ";" "BYWEEKNO" "=" bywknolist )           /
         *( ";" "BYMONTH" "=" bymolist )             /
         ( ";" "BYSETPOS" "=" bysplist )             /
         ( ";" "WKST" "=" weekday )                  /

         @class RecurreceParser
         */
        var RecurreceParser = (function () {
            /**
             @class RecurreceParser
             @constructor
             */
            var constructor = function (options) {
                this.options = options || {};
                // FREQ 값은 필수이다(기본값: DAILY)
                this.__recurrence__ = {"FREQ": FREQ.daily}
            }

            constructor.prototype = {
                /**
                 속성 설정

                 @method set
                 @param {String or Object} keyOrHash 설정 키 혹은 설정 내용을 담은 JSON 객체
                 @param {String} 설정 값
                 @return RecurreceParser 객체
                 @chainable
                 */
                set: function (keyOrHash, val) {
                    if (_.isObject(keyOrHash)) {
                        this._setHash(keyOrHash);
                    } else {
                        this.__recurrence__[keyOrHash] = val;
                    }
                    return this;
                },

                /**
                 키에 대한 속성값 반환

                 @method get
                 @return {Object} RecurreceParser 객체
                 @chainable
                 */
                get: function (key) {
                    return this.__recurrence__[key];
                },

                /**
                 해당 키 속성을 가지고 있는가?

                 @method has
                 @return {Boolean} 속성 정의 여부 반환
                 */
                has: function (key) {
                    return _.has(this.__recurrence__, key);
                },

                /**
                 Recurrence 포맷의 문자열 파싱

                 @method parse
                 @return {Object} RecurreceParser 객체
                 @chainable
                 */
                parse: function (code) {
                    var temp = code.split(";");
                    _.each(temp, function (item) {
                        var tarr = item.split("=");
                        this.__recurrence__[tarr[0]] = tarr[1];
                    }, this);

                    return this;
                },

                /**
                 파싱된 결과 반환

                 @method toString
                 @return {String} 파싱된 결과
                 */
                toString: function () {
                    var buffer = [];
                    if (this.validate()) {
                        _.each(this.__recurrence__, function (val, key) {
                            if (val) buffer.push(key + "=" + val);
                        });
                    }
                    return buffer.join(";");
                },

                /**
                 반복일정 포맷을 출력형태로 변환

                 @method humanize
                 @return {String} 파싱된 결과
                 */
                humanize: function (timeZoneOffset, serverTZOffset) {
                    return GO.i18n(calLang["{{frequecy}}마다 {{interval_options}}({{until_or_count}}, {{timeZone}} 기준)"], {
                        "frequecy": this._humanizeFrequency(),
                        "interval_options": this._humanizeIntervalOption(),
                        "until_or_count": this._humanizeUntil(timeZoneOffset, serverTZOffset) || this._humanizeCount() || false,
                        "timeZone": this.timeZoneInfo(timeZoneOffset)
                    });
                },

                /**
                 반복일정 설정값 검증

                 @method toString
                 @return {String} 파싱된 결과
                 */
                validate: function () {
                    if (!this.__recurrence__["FREQ"]) throw new Error("FREQ 값은 필수입니다.");
                    if (!this._validateCountOrUntil(this.__recurrence__)) throw new Error("UNTIL과 COUNT 값은 중복될 수 없습니다.");

                    // 기타 검증은 추후에....
                    return true;
                },

                /**
                 매일 반복일정인가?

                 @method isDailyOfFreq
                 @return {Boolean} 매일 반복 일정 여부
                 */
                isDailyOfFreq: function () {
                    return !!(this.get("FREQ") === FREQ.daily);
                },

                /**
                 매주 반복일정인가?

                 @method isWeeklyOfFreq
                 @return {Boolean} 매주 반복 일정 여부
                 */
                isWeeklyOfFreq: function () {
                    return !!(this.get("FREQ") === FREQ.weekly);
                },

                /**
                 매월 반복일정인가?

                 @method isMonthlyOfFreq
                 @return {Boolean} 매주 반복 일정 여부
                 */
                isMonthlyOfFreq: function () {
                    return !!(this.get("FREQ") === FREQ.monthly);
                },

                /**
                 매년 반복일정인가?

                 @method isYearlyOfFreq
                 @return {Boolean} 매주 반복 일정 여부
                 */
                isYearlyOfFreq: function () {
                    return !!(this.get("FREQ") === FREQ.yearly);
                },

                /**
                 반복 일정 타임존 적용

                 @method _timeZoneInfo
                 @returns +09:00 Asia/Seoul
                 */
                timeZoneInfo: function (offset) {
                    var timeZone = offset || GO.util.timeZoneOffset(),
                        tzInfo = ["GMT", timeZone, calLang["기준"]].join("");
                    return tzInfo;
                },

                /**
                 반복 주기 출력형태 반환

                 @method _humanizeFrequency
                 @return {String} 파싱된 결과
                 @private
                 */
                _humanizeFrequency: function () {
                    var interval = this.get("INTERVAL") || 1,
                        temp = {};

                    temp[FREQ.daily] = (interval === 1 ? calLang["매일"] : GO.i18n(calLang["{{monthday}}일마다"], "monthday", interval));
                    temp[FREQ.weekly] = (interval === 1 ? calLang["매주"] : GO.i18n(calLang["{{week}}주마다"], "week", interval));
                    temp[FREQ.monthly] = (interval === 1 ? calLang["매월"] : GO.i18n(calLang["{{month}}개월마다"], "month", interval));
                    temp[FREQ.yearly] = (interval === 1 ? calLang["매년"] : GO.i18n(calLang["{{year}}년마다"], "year", interval));

                    return temp[this.get("FREQ")];
                },

                /**
                 반복 주기 옵션값 출력형태 반환

                 @method _humanizeIntervalOption
                 @return {String} 파싱된 결과
                 @private
                 */
                _humanizeIntervalOption: function () {
                    var intervalOpts = _.compact([this._humanizeBymonthString(), this._humanizeBymonthdayString(), this._humanizeBydayString()]);
                    return intervalOpts.length > 0 ? intervalOpts.join(" ") : undefined;
                },

                /**
                 반복 주기 만료일자 출력 형태 반환

                 @method _humanizeUntil
                 @return {String} 파싱된 결과
                 @private
                 */
                _humanizeUntil: function (timeZoneOffset, serverTZOffset) {
                    if (!this.get("UNTIL")) return;

                    var offset = timeZoneOffset || GO.util.store.get("timeZoneOffset"),
                        serverOffset = serverTZOffset || GO.session().timeZone.serverTZOffset,
                        clientTZOffset = offset || GO.util.timeZoneOffset();

                    var mdate = moment(this.get("UNTIL"), "YYYYMMDD");

                    var displayDate = GO.util.dateToRFC2445(mdate, clientTZOffset, serverOffset);
                    return GO.i18n(calLang["{{date}} 까지"], "date", displayDate);
                },

                /**
                 반복 주기 만료회수 출력 형태 반환

                 @method _humanizeCount
                 @return {String} 파싱된 결과
                 @private
                 */
                _humanizeCount: function () {
                    if (!this.get("COUNT")) return;
                    return GO.i18n(calLang["{{count}}회"], "count", this.get("COUNT"));
                },

                /**
                 반복 주기 요일옵션 출력형태 반환

                 @method _humanizeBydayString
                 @return {String} 파싱된 결과
                 @private
                 */
                _humanizeBydayString: function () {
                    if (!this.get("BYDAY")) return;
                    var temp = this.get("BYDAY").split(","),
                        buffer = [],
                        self = this;

                    _.each(temp, function (daystr) {
                        var matched = /([0-9]*)(SU|MO|TU|WE|TH|FR|SA)?$/.exec(daystr),
                            nth = matched[1] ? parseOrdinaryNumber(matched[1], GO.config('locale')) : undefined,
                            weekdayShort = matched[2];

                        if (self.get("BYSETPOS")) {
                            nth = self.get("BYSETPOS");
                        }

                        if (nth === "-1") {
                            buffer.push(calLang['마지막'] + ' ' + DAY_STR[matched[2]]);
                        } else {
                            buffer.push(GO.i18n(calLang["{{nth}}번째 {{weekday}}"], {
                                "nth": nth,
                                "weekday": DAY_STR[weekdayShort]
                            }));
                        }
                    });
                    return buffer.join(",");
                },

                /**
                 반복 주기 일옵션 출력형태 반환

                 @method _humanizeBymonthdayString
                 @return {String} 파싱된 결과
                 @private
                 */
                _humanizeBymonthdayString: function () {
                    if (!this.get("BYMONTHDAY")) return;
                    var buffer = [],
                        tarr = this.get("BYMONTHDAY").split(",");

                    _.each(tarr, function (monthday) {
                        buffer.push(GO.i18n(calLang["{{monthday}}일"], "monthday", monthday));
                    });
                    return buffer.join(",");
                },

                /**
                 반복 주기 월옵션 출력형태 반환

                 @method _humanizeBymonthString
                 @return {String} 파싱된 결과
                 @private
                 */
                _humanizeBymonthString: function () {
                    if (!this.get("BYMONTH")) return;
                    var buffer = [],
                        tarr = this.get("BYMONTH").split(",");

                    _.each(tarr, function (monthday) {
                        buffer.push(GO.i18n(calLang["{{month}}월"], "month", monthday));
                    });
                    return buffer.join(",");
                },

                /**
                 해시로 들오온 반복일정 설정값들을 검증하고 설정하는 함수

                 @method _setHash
                 @return RecurreceParser 객체
                 @private
                 @chainable
                 */
                _setHash: function (hash) {
                    var args = recurreceKeys.unshift(hash),
                        // 허용 가능한 값만 가지고 온다.
                        picked = _.pick.apply(_, args);

                    // COUNT와 UNTIL은 둘중 하나만 있어야 하므로 오류 발생
                    if (!this._validateCountOrUntil(picked)) throw new Error("UNTIL과 COUNT 값은 중복될 수 없습니다.");
                    this.__recurrence__ = _.extend(this.__recurrence__, picked);
                    return this;
                },

                /**
                 UNTIL과 COUNT 검증
                 - UNTIL과 COUNT는 둘 중 하나만 존재해야 함

                 @method _validateCountOrUntil
                 @return {Boolean} 통과 여부
                 @private
                 */
                _validateCountOrUntil: function (hash) {
                    if (!_.has(hash, "COUNT") && !_.has(hash, "UNTIL")) return true;
                    return !!(_.has(hash, "COUNT") & _.has(hash, "UNTIL"));
                },
                _getWeekStr: function () {
                    return WEEK_STR;
                },
                _getDayStr: function () {
                    return DAY_STR;
                }
            }

            return constructor;
        })();

        function parseOrdinaryNumber(value, locale) {
            return GO.util.parseOrdinaryNumber(value, locale);
        }

        RecurreceParser.FREQ_DAILY = FREQ.daily;
        RecurreceParser.FREQ_WEEKLY = FREQ.weekly;
        RecurreceParser.FREQ_MONTHLY = FREQ.monthly;
        RecurreceParser.FREQ_YEARLY = FREQ.yearly;

        return RecurreceParser;
    });
