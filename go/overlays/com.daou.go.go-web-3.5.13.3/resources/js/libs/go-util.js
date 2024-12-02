(function (_, moment, undefined) {

    var global = this,
        GO = global.GO = (global.GO || {}),
        _slice = Array.prototype.slice;

    GO.util = _.extend(GO.util || {}, {

        defaultLocale: 'ko',

        /**
         입력된 폼 데이터를 hash로 반환

         @method serializeForm
         @return {Object} JSON 데이터
         @private
         */
        serializeForm: function (form, encode) {
            encode = encode || false;
            var arr = form.serializeArray(),
                h = {};
            _.each(arr, function (obj) {
                var tval = encode ? encodeURIComponent(obj.value) : obj.value;
                if (obj.name in h) {
                    if (!(h[obj.name] instanceof Array)) h[obj.name] = [h[obj.name]];
                    h[obj.name].push(tval);
                } else {
                    h[obj.name] = tval;
                }
            });
            return h;
        },

        /**
         moment 객체 변환 함수
         - moment 객체이면 이미 통과
         - String or Date 객체이면 정합성 검사

         @method toMoment
         @return moment 객체
         */
        toMoment: function () {
            var args = _slice.call(arguments),
                datetime = args[0];
            if (!moment.isMoment(datetime)) {
                if (typeof datetime == 'string' && parseInt(datetime).toString().length == 8) {
                    args[0] = this.toYyyymmddWithDash(datetime);
                }
                if (!moment.apply(moment, args).isValid()) throw new Error("Invalid Date Format");
                datetime = moment.apply(moment, args);
            }
            return datetime;
        },
        /**
         * dash가 붙여진 형태로 변환
         * @param dateStr (ex.'20210930')
         * @returns {string} yyyy-mm-dd (ex. '2021-09-30')
         */
        toYyyymmddWithDash: function (dateStr) {
            return [dateStr.slice(0, 4), "-", dateStr.slice(4, 6), "-", dateStr.slice(6, 8)].join('');
        },

        /**
         현재 시간 moment 객체 반환
         - 서버시간 기준 현재 시간을 계산하기 위해 유틸함수로 분리

         @method now
         @return moment 객체
         */
        now: function () {
            return this.toMoment(new Date());
        },

        /**
         *
         * @param {String} unit 날짜 단위 (일: days, 주: weeks, ...)
         * @param {Number} value 날짜 값 (오늘부터 3일뒤면 unit에 days, value에 3 입력)
         */
        fromNow: function (unit, value) {
            return this.now().add(unit, value);
        },

        error: function (code, options) {
            options = options || {};

            var url = 'error/' + code,
                params = {},
                qs;

            if (typeof (code) == "number") {
                code = code + "";
            }

            if (!_.contains(["403", "404", "500"], code)) {
                throw new Error('Unsupported Error Code');
            }

            if (options["retUrl"]) {
                params.url = options["retUrl"];
            }
            if (options["msgCode"]) {
                params.msgcode = options["msgCode"];
            }

            qs = $.param(params);

            if (qs) {
                url += '?' + qs;
            }

            if (window.history.replaceState) {
                // history API를 지원하는 브라우저만 에서 나타나는 오류.
                // 처음 URL을 입력하고 들어올때는 Backbone.router에 replace 옵션을 주고 이동시켜도 history에 남음
                // history API에 있는 오류난 URL에 대한 데이터를 직접 지워줘야 함
                // html5에서는 history.replaceState(null, null, {지울 URL})로 호출하면 가능(IE 9이하는 replaceState를 지원안함)
                history.replaceState(null, null, location.href);
            }
            GO.router.navigate(url, {trigger: true, replace: true});
        },

        /**
         그룹오피스 기본 날짜 포맷 반환

         @method basicDate
         @return {String} 날짜 포맷 문자열
         */
        timeZoneOffset: function () {
            return this.formatDatetime(this.now(), null, "Z");
        },

        basicDate: function (datetime, locale) {
            return this.formatDatetime(datetime, locale, "YYYY-MM-DD(ddd) HH:mm");
        },

        basicDate2: function (datetime, locale) {
            return this.formatDatetime(datetime, locale, "YYYY-MM-DD(ddd)");
        },

        basicDate3: function (datetime, locale) {
            return this.formatDatetime(datetime, locale, "YYYY-MM-DD HH:mm");
        },

        customDate: function (datetime, format, locale) {
            return this.formatDatetime(datetime, locale, format);
        },

        byteToMega: function (size) {
            return (parseInt(size) / 1024 / 1024).toFixed(1);
        },

        dateWithoutTimeZone: function (datetime) {
            return moment(datetime, "YYYY-MM-DD").clone().startOf('days');
        },

        dateFormatWithoutTimeZone: function (datetime) {
            return this.dateWithoutTimeZone(datetime).format("YYYY-MM-DD");
        },

        customDateFormatWithoutTimeZone: function (datetime, format) {
            //전달 받은 format으로 변환하여 반환
            return moment(datetime, format).clone().format(format);
        },

        dateToRFC2445: function (datetime, clientOffset, serverOffset) {
            //20150501T000000+00:00
            var serverDate = this.toISO8601(datetime.zone(serverOffset).startOf('days'));
            return this.formatDatetime(moment(serverDate).zone(clientOffset).format(), null, "YYYY-MM-DD");
        },

        /**
         sns 형태에서 사용하기 위한 날짜 포맷 변환
         @method snsDate
         @param {Object} datetime 날짜 데이터(String, moment, Date 객체)
         @param {String} locale 로케일 코드
         @return {String} 날짜 포맷 문자열
         */
        snsDate: function (datetime, locale) {
            locale = this._decideLocale(locale);
            var now = this.now(),
                input = this.toMoment(datetime),
                diff = now.diff(input),
                seconds = {
                    oneMinute: 60 * 1000,
                    oneHour: 60 * 60 * 1000,
                    twelveHour: 12 * 60 * 60 * 1000
                };

            // 작년
            if (input.year() != now.year()) {
                return this.formatDatetime(input, locale, "YYYY-MM-DD(ddd) HH:mm");
            }
            // 1분 미만
            if (diff < seconds.oneMinute) {
                return this.snsDateLang[locale]["방금 전"];
            }
            // 1분 ~ 56분 59초
            if (diff < seconds.oneHour) {
                return now.diff(input, 'minutes') + this.snsDateLang[locale]["분 전"];
            }
            // 1시간 ~ 11시간 59분 59초
            if (diff < seconds.twelveHour) {
                return now.diff(input, 'hours') + this.snsDateLang[locale]["시간 전"];
            }
            // 12시간 이후 ~ 올해
            return this.formatDatetime(input, locale, "MM-DD HH:mm");
        },

        /**
         일반 게시물 시간 표현 방식
         @method boardDate
         @param {Object} datetime 날짜 데이터(String, moment, Date 객체)
         @param {String} locale 로케일 코드
         @return {String} 날짜 포맷 문자열
         */
        boardDate: function (datetime, locale) {
            locale = this._decideLocale(locale);
            var now = this.now(),
                input = this.toMoment(datetime);

            // 작년
            if (input.year() != now.year()) {
                return this.formatDatetime(input, locale, "YY/MM/DD");
            }

            // 어제 ~ 올해
            if (input.month() != now.month() || input.date() != now.date()) {
                return this.formatDatetime(input, locale, "MM-DD");
            }
            // 오늘
            return this.formatDatetime(input, locale, "HH:mm");
        },

        // TODO: 추후 다국어 결합 필요. (chogh1211 현재는 require 종속 문제 있어 연결 안함)
        snsDateLang: {
            'ko': {
                "방금 전": "방금 전",
                "분 전": "분 전",
                "시간 전": "시간 전"
            },
            'en': {
                "방금 전": "Just a moment ago",
                "분 전": " mins ago",
                "시간 전": " hours ago"
            },
            'ja': {
                "방금 전": "先ほど",
                "분 전": "分前",
                "시간 전": "時間前"
            },
            'zh_CN': {
                "방금 전": "刚才",
                "분 전": "分钟前",
                "시간 전": "小时前"
            },
            'zh_TW': {
                "방금 전": "剛才",
                "분 전": "分鐘前",
                "시간 전": "小時前"
            },
            'vi': {
                "방금 전": "Ngay trước đó",
                "분 전": "phút trước",
                "시간 전": "giờ trước"
            }
        },

        /**
         그룹오피스 날짜 포맷 반환

         @method shortDate
         @param {Object} datetime 날짜 데이터(String, moment, Date 객체)
         @param {String} locale 로케일 코드
         @return {String} 날짜 포맷 문자열
         */
        firstDate: function (datetime, locale) {
            return this.formatDatetime(datetime, locale, "YYYY-MM-01");
        },
        shortDate: function (datetime, locale) {
            return this.formatDatetime(datetime, locale, "YYYY-MM-DD");
        },

        shortDate2: function (datetime, locale) {
            return this.formatDatetime(datetime, locale, "YYYY-MM-DD(ddd)");
        },

        shortDateMonth: function (datetime, locale) {
            return this.formatDatetime(datetime, locale, "YYYY-MM");
        },

        shortDateCalenderFormat: function (datetime, locale) {
            return this.formatDatetime(datetime, locale, "YYYY/MM/DD");
        },

        monthDateDay: function (datetime, locale) {
            return this.formatDatetime(datetime, locale, "M.D ddd");
        },

        hourMinute: function (datetime, locale) {
            return this.formatDatetime(datetime, locale, "HH:mm");
        },

        hourMinuteWithDataTimeZone: function (datetime, locale) {
            return this.hourMinute(this.convertWithDataTimeZone(datetime), locale);
        },

        // 타임존을 data의 타임존으로 변경 (클라이언트 타임존을 따라가지 않음)
        convertWithDataTimeZone: function (datatime) {
            return this.toMoment(datatime).zone(datatime);
        },

        formatDatetime: function (datetime, locale, pattern) {
            return this.toMoment(datetime).format(pattern);
        },

        // getDefaultLocaleIfEmpty 제목과 비교.
        _decideLocale: function (locale) {
            return locale || (GO.config && GO.config('locale')) || this.defaultLocale;
        },

        /**
         입력받은 날짜 데이터를 ISO8601 형태로 반환

         @method toISO8601
         @param {Object} datetime 날짜 데이터(String, moment, Date 객체)
         @return {String} 날짜 포맷 문자열
         */
        toISO8601: function (datetime) {
            //2012-01-01T12:00:00+09:00
            return this.toMoment(datetime).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        },

        /**
         기준 날짜로부터 계산된 날짜를 ISO8601 형태로 반환

         @method calDate
         @param {Object} datetime 날짜 데이터(String, moment, Date 객체)
         @param {String} key 계산 기준(minutes,hours,days,weeks,months,years)[moment.add 함수 참조]
         @param {Object} amount 계산할 값[moment.add 함수 참조]
         @return {String} 날짜 포맷 문자열
         */
        calDate: function (datetime, key, amount) {
            return this.toISO8601(this.toMoment(datetime).clone().add(key, amount));
        },

        tomorrow: function (date) {
            return new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000);
        },

        searchEndDate: function (date) {
            return this.toISO8601(this.toMoment(date).clone().add('days', 1).subtract('seconds', 1));
        },

        searchStartDate: function (date) {
            return this.toISO8601(this.toMoment(date).clone().startOf('days'));
        },

        /**
         입력된 두 날짜가 같은 날짜인가? (20150427.CCH 날짜만 비교해야하는데, 시간까지 비교하여 이슈 수정함)

         @method isSameDate
         @param {Object} date1 날짜 데이터(String, moment, Date 객체)
         @param {Object} date2 날짜 데이터(String, moment, Date 객체)
         @return {boolean} 같은 날 여부
         */
        isSameDate: function (date1, date2) {
            var _d1 = this.toMoment(date1).clone().startOf('days'),
                _d2 = this.toMoment(date2).clone().startOf('days');
            return Math.floor(_d1.diff(_d2)) === 0;
        },

        /**
         같거나 더 이후의 날짜인가?

         @method isAfterOrSameDate
         @param {Object} before 이전 이기를 기대하는 날짜 데이터(String, moment, Date 객체)
         @param {Object} after 이후 이기를 기대하는 날짜 데이터(String, moment, Date 객체)
         @return {boolean} 같은 날 여부
         */
        isAfterOrSameDate: function (before, after) {
            var b = this.toMoment(before).clone().startOf('day'),
                a = this.toMoment(after).clone().startOf('day');
            return a.diff(b, 'days') >= 0;
        },

        /**
         최근 날짜인가 ?
         @method  isCurrentDate
         @param {Object} date 24시간 이내 인지 check. 초단위 까지 체크하도록 개선.(String, moment, Date 객체)
         @param  {integer} days 최근의 기준 날짜  (기본값 1)
         @return {boolean} 최근 여부
         * */
        isCurrentDate: function (date, days) {
            days = days || 1;
            var before = moment().add('days', days > 0 ? -days : days);
            var after = date;
            var b = this.toMoment(before).clone();
            var a = this.toMoment(after).clone();
            return a.diff(b, 'seconds') > 0;
        },
        /**
         더 이후의 날짜인가?

         @method isAfter
         @param {Object} before 이전 이기를 기대하는 날짜 데이터(String, moment, Date 객체)
         @param {Object} after 이후 이기를 기대하는 날짜 데이터(String, moment, Date 객체)
         @return {boolean} 이후 여부
         */
        isAfter: function (before, after) {
            var b = this.toMoment(before).clone().startOf('day'),
                a = this.toMoment(after).clone().startOf('day');
            return a.diff(b, 'days') > 0;
        },
        /**
         *
         * @param {Object} date 사이에 존재하는지 검사할 날짜(대상)
         * @param {Object} start 시작 날짜
         * @param {Object} end 종료 날짜
         * @returns {boolean}
         */
        isBetween: function (date, start, end) {
            return this.toMoment(date).clone().isAfter(this.toMoment(start).clone()) && this.toMoment(date).clone().isBefore(this.toMoment(end).clone());
        },

        /**
         입력된 날짜가 오늘 이전인가?

         @method isBeforeToday
         @param {Object} date 날짜 데이터(String, moment, Date 객체)
         @return {boolean} 오늘 이전 여부
         */
        isBeforeToday: function (date) {
            return this.isAfter(date, new Date());
        },

        /**
         입력된 날짜가 오늘인가?

         @method isToday
         @param {Object} date 날짜 데이터(String, moment, Date 객체)
         @return {boolean} 오늘 여부
         */
        isToday: function (date) {
            return this.isSameDate(date, new Date());
        },

        /**
         입력된 날짜가 그달의 몇번째 요일인가?

         @method getNthDay
         @param {Object} date 날짜 데이터(String, moment, Date 객체)
         @return {Number}
         */
        getNthDayOfMonth: function (date) {
            var basedate = this.toMoment(date).clone(),
                mstart = basedate.clone().startOf('months'),
                dayOfWeek = basedate.day(),
                startDay = mstart.day(),
                offsetWeek = parseInt(basedate.format('w')) - parseInt(mstart.format('w'));

            return (dayOfWeek < startDay ? offsetWeek : offsetWeek + 1);
        },

        /**
         이번주인가?

         @method isThisWeek
         @param {Object} date 날짜 데이터(String, moment, Date 객체)
         @return {boolean} 이번주 여부
         */
        isThisWeek: function (date) {
            var today = moment(),
                mdate = this.toMoment(date);

            if (today.year() !== mdate.year()) return false;
            return (today.format("ww") === mdate.format("ww"));
        },

        /**
         이번달인가?

         @method isThisMonth
         @param {Object} date 날짜 데이터(String, moment, Date 객체)
         @return {boolean} 이번달 여부
         */
        isThisMonth: function (date) {
            var today = moment(),
                mdate = this.toMoment(date);

            return today.year() === mdate.year() && today.month() === mdate.month();
        },

        /**
         일주일 시작일자 계산

         @method getStartDateOfWeek
         @param {Object} date 날짜 데이터(String, moment, Date 객체)
         @param {integer} startday 시작요일 인덱스(기본값 0)
         @return {Date} 이번주 시작일
         */
        getStartDateOfWeek: function (date, startday) {
            startday = startday || 0;
            var mdate = this.toMoment(date).clone(),
                day = mdate.day(),
                offset = day - startday;

            // if(offset < 0) offset = 7 - offset;
            return mdate.add('days', -1 * offset).toDate();
        },

        /**
         일주일 종료일자 계산

         @method getEndDateOfWeek
         @param {Object} date 날짜 데이터(String, moment, Date 객체)
         @param {integer} startday 시작요일 인덱스(기본값 0)
         @return {Date} 이번주 종료일
         */
        getEndDateOfWeek: function (date, startday) {
            startday = startday || 0;
            var mdate = this.toMoment(date).clone(),
                day = mdate.day(),
                offset = 6 - day + startday;
            return mdate.add('days', offset).toDate();
        },

        /**
         입력된 시간을 기준으로 가장 가까운 시간 선택옵션값을 찾는 함수

         @method _getClosestSteppedTime
         @param {Object} datetime 입력 시간(Date 객체, String, epoch 시간)
         @param {integer} interval 계산 시간 간격(분단위, 기본값: 30분)
         @return {Object} moment 객체
         @private
         */
        getIntervalTime: function (datetime, interval) {
            interval = interval || 30;
            var mbasedate = this.isToday(datetime) ? this.toMoment(datetime) : this.toMoment(datetime).clone().startOf('days'),
                baseSec = 60 * interval;

            return this.toMoment((Math.ceil(Math.floor(mbasedate.valueOf() / 1000) / baseSec) * baseSec) * 1000);
        },

        /**
         입력된 시간을 기준으로 그날의 자정을 리턴한다.
         */
        getMidNightTime: function (datetime) {
            return this.toMoment(datetime).clone().startOf('days');
        },

        /**
         * 현재시간으로 부터 입력된시간까지의 D-Day 일수를 반환한다.
         * @param date string : yyyy-mm-dd
         *
         * */
        getDdayDiff: function (date) {
            var arr = date.split('-');
            var today = new Date();
            var targetDate = new Date(arr[0], parseInt(arr[1]) - 1, arr[2]);
            var toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            var diff = targetDate - toDate;
            var currDay = 24 * 60 * 60 * 1000;// 시 * 분 * 초 * 밀리세컨
            return parseInt(diff / currDay)
        },

        /**
         어드민 탑메뉴 롤오버 유지
         @method setTopMenu
         @param {String} id 해당메뉴 ID (baseTopMenu : 기본설정, accountsTopMenu : 계정관리, deptTopMenu: 부서관리,
         mailTopMenu : 메일, addrTopMenu: 주소록, apprTopMenu : 전자결재, calendarTopMenu : 캘린더, boardTopMenu : 게시판
         communityTopMenu : 커뮤니티)

         */
        setTopMenu: function (id) {
            $('#adminTopMenu li').removeClass('on');
            $("#" + id).addClass('on');
        },

        /**
         * csv 다운로드
         */
        downloadCsvFile: function (url) {
            window.location.href = GO.contextRoot + url;
        },

        downloadCsvFilePreventDuplicate: function (url) {
            this.debounceDownloadCsv(url)
        },

        debounceDownloadCsv: _.debounce(function (url) {
            this.downloadCsvFile(url);
        }, 3000),

        jsonToUrlParam: function (json) {
            return $.param(json);
        },

        urlParam: function (name) {
            var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
            if (results) {
                return results[1] || undefined;
            } else {
                return undefined;
            }
        },

        /**
         문자열 중 하이퍼링크를 검색하여 <a>태그로 변환

         @method autolink
         @param {String} str 문자열
         @param {String} attrs a 태그 추가 속성
         @return {String} 변환된 문자열
         */
        autolink: function (str, attrs) {
            var pattern = /(\b(http[s]?:\/\/|ftp:\/\/|www\.)[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig,
                sbuff = [];

            _.each(attrs, function (val, key) {
                sbuff.push([key, '="', val, '"'].join(""));
            });

            // www.abc.com 같은 경우 a 태그의 href로 들어갈 경우 현재 url을 기준으로 상대경로로 해석해버린다. 따라서, http://를 자동으로 추가해주어야 한다.
            return str.replace(pattern, function (matched, $1) {
                var p2 = /(\b(http[s]?:\/\/|ftp:\/\/))/ig;
                return ["<a href='", p2.test($1) ? $1 : "http://" + $1, "'", (sbuff.length > 0 ? " " + sbuff.join(" ") : ""), ">", matched, "</a>"].join("");
            });
        },

        /**
         문자열 중 하이퍼링크를 검색하여 <a>태그로 변환

         @method autolink
         @param {String} str 문자열
         @param {String} attrs a 태그 추가 속성
         @return {String} 변환된 문자열
         */
        applink: function (str, attrs) {
            var pattern = /(\b(http[s]?:\/\/|ftp:\/\/|www\.)[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig,
                sbuff = [];

            _.each(attrs, function (val, key) {
                sbuff.push([key, '="', val, '"'].join(""));
            });

            // www.abc.com 같은 경우 a 태그의 href로 들어갈 경우 현재 url을 기준으로 상대경로로 해석해버린다. 따라서, http://를 자동으로 추가해주어야 한다.
            return str.replace(pattern, function (matched, $1) {
                var p2 = /(\b(http[s]?:\/\/|ftp:\/\/))/ig;
                return ["<span data-type='externalUrl' data-url='", p2.test($1) ? $1 : "http://" + $1, "'", (sbuff.length > 0 ? " " + sbuff.join(" ") : ""), ">", matched, "</span>"].join("");
            });
        },

        /**
         <!--[if !supportLists]--> <!--[endif]--> 같은 문자열을 공백으로 치환(ie버그)

         @method convertCommentText
         @param {String} content 문자열
         @return {String} 문자열
         @private
         **/
        convertMSWordTag: function (content) {
            var ua = window.navigator.userAgent.toLowerCase();
            if (ua.indexOf("msie 8.0") > -1 || ua.indexOf("msie 9.0") > -1) {
                var tcontent = '' + content;
                tcontent = tcontent.replace(/&lt;!--\[[^-->]*\]--&gt;/gi, '');
                tcontent = tcontent.replace(/<!--\[[^-->]*\]-->/gi, '');
                return tcontent;
            }
            return content;
        },

        /**
         출력용 문자열 변환

         @method convertRichText
         @param {String} content 문자열
         @return {String} 문자열
         @private
         **/
        convertRichText: function (content) {
            var tcontent = '' + content;
            tcontent = this.autolink(tcontent, {"data-bypass": "true", "target": "_blank"});
            tcontent = tcontent.replace(/\n/gi, '<br />');

            return tcontent;
        },
        /**
         모바일용 문자열 변환
         **/
        convertMobileRichText: function (content) {
            var tcontent = '' + content;

            tcontent = tcontent.replace(/</gi, "&lt;");
            tcontent = tcontent.replace(/>/gi, "&gt;");
            tcontent = tcontent.replace(/ /gi, "&nbsp;");
            tcontent = tcontent.replace(/\n/gi, '<br />');
            tcontent = this.applink(tcontent, {"data-bypass": "true", "target": "_blank"}); //http 링크 추후개선
            return tcontent;
        },
        /**
         * 외부 url 브릿지 호출
         */
        externalUrl: function (url) {

            if (!this.isMobileApp()) {
                window.open(url);
            } else {
                try {
                    if (this.checkOS() == "android") {
                        window.GOMobile.externalUrl(url);
                    } else {
                        window.location = "gomobile://externalUrl?" + url;
                    }
                } catch (e) {
                }
            }

        },

        previewTempFile: function (option) {
            var previewURL = "app/preview/temp/";
            var url = [
                GO.config("trustCertification") ? "https://" : "http://",
                window.location.hostname,
                window.location.port ? ":" + window.location.port : window.location.port,
                GO.contextRoot,
                previewURL,
                encodeURIComponent(option.fileName),
                option.filePath
            ].join("");

            // TODO : 모바일폰 지원 여부 확인
            window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
        },

        preview: function (encrypt) {
            var previewURL = "app/preview/";
            var url = [
                GO.config("trustCertification") ? "https://" : "http://",
                window.location.hostname,
                window.location.port ? ":" + window.location.port : window.location.port,
                GO.contextRoot,
                previewURL,
                encrypt
            ].join("");

            if (this.isMobileApp()) {
                if (this.checkOS() == "android") {
                    window.GOMobile.attachView(url);
                } else {
                    window.location = "gomobile://attachView?" + url;
                }
            } else {
                window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
            }
        },
        /**
         * jQuery.printElement 를 이용한 화면 인쇄 기능 (마크업의 일부만 인쇄하거나, 인쇄에 최적화된 css 를 사용하려는 경우)
         * @param $el 인쇄하려는 jQuery 객체
         * @param options jQuery.printElement 실행옵션 (참조: http://projects.erikzaadi.com/jQueryPlugins/jQuery.printElement/)
         */
        print: function ($el, options) {

            /*
            문제현상 :
            ie8 인쇄시 스타일 깨짐 현상. html5shiv 도 프린트 영역에선 적용되지 않는다.

            해결 방법 :
            html5 태그들을 div 로 치환한다.
            html5 태그들이 div 로 치환 되어도 스타일이 깨지지 않도록
            html5 태그가 사용하는 클래스를 div 가 동일하게 사용 할 수 있도록 CSS 에 정의 한다.
            html5 태그가 중첩되어 있을 수 있으므로 하위노드에서 상위노드로 치환을 진행한다.
            */
            _.each($el.find("header, section, article, footer").get().reverse(), function (el) {
                var div = $("<div></div>");
                var $el = $(el);
                div.html($el.html());
                div.addClass($el.attr("class"));
                div.attr('id', $el.attr('id'));
                div.attr('style', $el.attr('style'));
                $el.replaceWith(div);
            });

            // 현재 인쇄용 팝업창이 뜨는 구조라서 현재페이지를 바로인쇄해도 될듯합니다.
            if (this.msie()) {
                try {
                    //웹 브라우저 컨트롤 생성
                    var webBrowser = '<OBJECT ID="previewWeb" WIDTH=0 HEIGHT=0 CLASSID="CLSID:8856F961-340A-11D0-A96B-00C04FD705A2"></OBJECT>';
                    //웹 페이지에 객체 삽입
                    document.body.insertAdjacentHTML('beforeEnd', webBrowser);
                    //ExexWB 메쏘드 실행 (7 : 미리보기 , 8 : 페이지 설정 , 6 : 인쇄하기(대화상자))
                    document.getElementById("previewWeb").ExecWB(7, 1);
                    //객체 해제
                    document.getElementById("previewWeb").outerHTML = "";
                } catch (e) {
                    window.print();
                }
            } else {
                window.print();
            }

        },
        br2nl: function (content) {
            if (!content) return content;
            var tcontent = '' + content;
            tcontent = tcontent.replace(/<br\s*\/?>/mg, "\n");
            return tcontent;
        },

        /**
         fancy-box 이미지 다운로드 커스터마이징

         */
        fancyBoxImageDownLoad: function () {
            var image = $('div.fancybox-outer .fancybox-inner .fancybox-image');
            // GO-12315 대용량 파일 중복 ajax 요청시 엑박 문제. 중복 ajax 를 보장해 주기 위해 iframe 추가
            $("body").append('<iframe id="attachDownload" width="0px" height="0px" name="attachDownload" src="' + image.attr('src') + '" style="border:0;"></iframe>');
        },
        /**
         textarea 늘림
         */
        textAreaExpand: function (e) {
            this.textAreaExpandByNode(e.currentTarget);
        },
        /**
         textarea 늘림
         */
        textAreaExpandByNode: function (node) {
            //var maxH = 150;
            var newH = node.clientHeight;
            var marginHeight = 2;

            //if ( !maxH || maxH > newH ) {
            newH = Math.max(node.scrollHeight, newH);
            //if ( maxH ) newH = Math.min(maxH, newH);
            if (newH > node.clientHeight) {
                $(node).attr("style", "height:" + (newH + marginHeight) + "px !important");
            }
        },
        /**
         * file progress bar
         */
        fileProgressBar: function (self, target, file, bytesLoaded) {

            var progressBarOpt = {
                boxImage: GO.contextRoot + 'resources/images/progressbar.gif',
                barImage: GO.contextRoot + 'resources/images/progressbg_green_100.gif',
                width: 100,
                showText: false
            };

            var _this = self;
            $('span[data-btntype="uploadCancelButton"]').click(function () {
                $(_this).swfupload('cancelUpload', file.id);
                $(target).parent().html('');
            });

            var fileSize = file.size;
            var fileUploadPercent = Math.ceil(bytesLoaded / fileSize * 100);
            $(target).progressBar(fileUploadPercent, progressBarOpt);
            if (fileUploadPercent >= 100) {
                $(target).parent().html('');
            }
        },

        /*
         * mobile check
         */
        callMetaTagDevice: function () {
            if (GO.config('deviceType') === 'mobile') {
                return GO.config('deviceType');
            } else {
                return GO.config('instanceType');
            }
        },
        isMobileApp: function () {
            var isMobileApplication;
            var ua = $('meta[name="goAgent"]').attr('content');
            ua = ua ? ua.toLowerCase() : "";
            isMobileApplication = ua.indexOf("go-android") > -1 || ua.indexOf("go-iphone") > -1;
            if (!isMobileApplication) {
                ua = window.navigator.userAgent.toLowerCase();
                isMobileApplication = ua.indexOf("go-android") > -1 || ua.indexOf("go-iphone") > -1;
            }
            return isMobileApplication;
        },
        getGoAgent: function () {
            return $('meta[name="goAgent"]').attr('content') || '';
        },
        checkOS: function () {
            var ua = window.navigator.userAgent.toLowerCase();
            if (ua.indexOf("android") > -1) {
                return "android";
            } else if (ua.indexOf("iphone") > -1) {
                return "iphone";
            } else if (ua.indexOf("ipad") > -1) {
                return "ipad";
            } else {
                return -1;
            }
        },

        isMobilePC: function () {
            // 모바일 pc 버전은 mobile_default 를 수행하지않으므로 공백이다.
            return this.getGoAgent() === '';
        },

        isMobile: function () {
            return this.checkOS() != -1;
        },

        isAndroidApp: function () {
            return this.isMobileApp() && this.checkOS() === 'android';
        },

        isIosApp: function () {
            return this.isMobileApp() && (this.checkOS() === 'iphone' || this.checkOS() === 'ipad');
        },

        textToHtml: function (content) {
            if (!content) return content;
            content = _.escape(content);
            content = content.replace(/(\n)/gi, "<br>");
            content = content.replace(/ /gi, "&nbsp;");
            return content;
        },

        textToHtmlWithHyperLink: function (content) {
            return this.makeHyperLinkHtml(this.textToHtml(content));
        },

        htmlToText: function (content) {
            if (!content) return content;
            content = _.unescape(content);
            content = content.replace(/<br>/gi, "\n");
            content = content.replace(/&nbsp;/gi, " ");
            return content;
        },

        /*******************************************************************************
         *
         * XSS 대응 Util - Start
         *
         ********************************************************************************/
        /**
         * XSS대응
         * 컨텐츠에 대해 HTML escape 처리 (예: '<script>' -> '&lt;script&gt')
         */
        escapeHtml: function (content) {
            if (!content) return content;
            if (typeof (content) != "string") return content;
            content = content.replace(/</gi, "&lt;");
            content = content.replace(/>/gi, "&gt;");
            content = content.replace(/(\n)/gi, "<br>");
            content = content.replace(/ /gi, "&nbsp;");
            return content;
        },

        escapeToLtGt: function(content) {
            if (!content) return content;
            if (typeof (content) != "string") return content;
            content = content.replace(/</gi, "&lt;");
            content = content.replace(/>/gi, "&gt;");
            return content;
        },

        escapeEditorContent: function(content) {
            if (!content) return content;
            if (typeof (content) != "string") return content;
            content = content.replace(/<script>/gi, "&lt;script&gt;");
            content = content.replace(/<\/script>/gi, "&lt;/script&gt;");
            return content;
        },

        escapeHtmlWithHyperLink: function (content) {
            return this.makeHyperLinkHtml(this.escapeHtml(content));
        },

        makeHyperLinkHtml: function (content) {
            if (!content) {
                return;
            }
            return content.replace(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/, function (x) {
                return '<a class="user_link" href="' + (_.startsWith(x.toLowerCase(), 'www') ? ('http://' + x) : (x)) + '">' + x + '</a>';
            })
        },
        /**
         * XSS대응
         * 컨텐츠에 대해 HTML unescape 처리 (예: '&lt;script&gt' -> '<script>')
         */
        unescapeHtml: function (content) {
            if (!content) return content;
            content = content.replace(/&lt;/gi, "<");
            content = content.replace(/&gt;/gi, ">");
            content = content.replace(/<br>/gi, "\n");
            content = content.replace(/&nbsp;/gi, " ");
            return content;
        },
        /**
         * XSS대응
         * 캘린더 컨텐츠 : escape -> unescape 처리
         */
        calendarStrParse: function (content) {
            if (!content) return content;
            content = content.replace(/&lt;/gi, "<");
            content = content.replace(/&gt;/gi, ">");
            return content;
        },
        /**
         * XSS 필터
         */
        XSSFilter: function (str) {
            if (!str) return str;

            str = str.replace(/[\"\'][\s]*javascript:(.*)[\"\']/gi, "\"\"");
            str = str.replace(/[<]*[\s]*script(.*)/gi, "");
            str = str.replace(/eval\((.*)\)/gi, "");

            if (!!str) {
                str = str.replace(/</gi, "&lt;");
                str = str.replace(/>/gi, "&gt;");
            }

            return str;
        },

        escapeXssFromHtml: function (content) {
            function escapeXssProperty(tag) {
                var value = tag[0];

                value = value.replace(/(javascript:)/ig, "x-$1");
                /*GO-27463 피드형게시판에서 이미지 첨부시 img태그에 onload가 들어가기때문에 막을 수 없다.
                 *브라우저 사이즈에 따라 첨부이미지 사이즈를 조절하는 스크립트가 들어간듯하나 추후에 css로 개선 해야할듯 함.*/
                //value = value.replace(/[^controls](on[a-z]+=)/ig, "x-$1");

                value = value.replace(/(onabort+=)/ig, "x-$1")
                    .replace(/(onactivate+=)/ig, "x-$1")
                    .replace(/(onafterprint+=)/ig, "x-$1")
                    .replace(/(onafterupdate+=)/ig, "x-$1")
                    .replace(/(onbeforeactivate+=)/ig, "x-$1")
                    .replace(/(onbeforecopy+=)/ig, "x-$1")
                    .replace(/(onbeforecut+=)/ig, "x-$1")
                    .replace(/(onbeforedeactivate+=)/ig, "x-$1")
                    .replace(/(onbeforeeditfocus+=)/ig, "x-$1")
                    .replace(/(onbeforepaste+=)/ig, "x-$1")
                    .replace(/(onbeforeprint+=)/ig, "x-$1")
                    .replace(/(onbeforeunload+=)/ig, "x-$1")
                    .replace(/(onbeforeupdate+=)/ig, "x-$1")
                    .replace(/(onblur+=)/ig, "x-$1")
                    .replace(/(onbounce+=)/ig, "x-$1")
                    .replace(/(oncellchange+=)/ig, "x-$1")
                    .replace(/(onchange+=)/ig, "x-$1")
                    .replace(/(onclick+=)/ig, "x-$1")
                    .replace(/(oncontextmenu+=)/ig, "x-$1")
                    .replace(/(oncontrolselect+=)/ig, "x-$1")
                    .replace(/(oncopy+=)/ig, "x-$1")
                    .replace(/(oncut+=)/ig, "x-$1")
                    .replace(/(ondataavailable+=)/ig, "x-$1")
                    .replace(/(ondatasetchanged+=)/ig, "x-$1")
                    .replace(/(ondatasetcomplete+=)/ig, "x-$1")
                    .replace(/(ondblclick+=)/ig, "x-$1")
                    .replace(/(ondeactivate+=)/ig, "x-$1")
                    .replace(/(ondrag+=)/ig, "x-$1")
                    .replace(/(ondragend+=)/ig, "x-$1")
                    .replace(/(ondragenter+=)/ig, "x-$1")
                    .replace(/(ondragleave+=)/ig, "x-$1")
                    .replace(/(ondragover+=)/ig, "x-$1")
                    .replace(/(ondragstart+=)/ig, "x-$1")
                    .replace(/(ondrop+=)/ig, "x-$1")
                    .replace(/(onerror+=)/ig, "x-$1")
                    .replace(/(onerrorupdate+=)/ig, "x-$1")
                    .replace(/(onfilterchange+=)/ig, "x-$1")
                    .replace(/(onfinish+=)/ig, "x-$1")
                    .replace(/(onfocus+=)/ig, "x-$1")
                    .replace(/(onfocusin+=)/ig, "x-$1")
                    .replace(/(onfocusout+=)/ig, "x-$1")
                    .replace(/(onhelp+=)/ig, "x-$1")
                    .replace(/(onkeydown+=)/ig, "x-$1")
                    .replace(/(onkeypress+=)/ig, "x-$1")
                    .replace(/(onkeyup+=)/ig, "x-$1")
                    .replace(/(onlayoutcomplete+=)/ig, "x-$1")
                    .replace(/(onload+=)/ig, "x-$1")
                    .replace(/(onlosecapture+=)/ig, "x-$1")
                    .replace(/(onmousedown+=)/ig, "x-$1")
                    .replace(/(onmouseenter+=)/ig, "x-$1")
                    .replace(/(onmouseleave+=)/ig, "x-$1")
                    .replace(/(onmousemove+=)/ig, "x-$1")
                    .replace(/(onmouseout+=)/ig, "x-$1")
                    .replace(/(onmouseover+=)/ig, "x-$1")
                    .replace(/(onmouseup+=)/ig, "x-$1")
                    .replace(/(onmousewheel+=)/ig, "x-$1")
                    .replace(/(onmove+=)/ig, "x-$1")
                    .replace(/(onmoveend+=)/ig, "x-$1")
                    .replace(/(onmovestart+=)/ig, "x-$1")
                    .replace(/(onpaste+=)/ig, "x-$1")
                    .replace(/(onpropertychange+=)/ig, "x-$1")
                    .replace(/(onreadystatechange+=)/ig, "x-$1")
                    .replace(/(onreset+=)/ig, "x-$1")
                    .replace(/(onresize+=)/ig, "x-$1")
                    .replace(/(onresizeend+=)/ig, "x-$1")
                    .replace(/(onresizestart+=)/ig, "x-$1")
                    .replace(/(onrowenter+=)/ig, "x-$1")
                    .replace(/(onrowexit+=)/ig, "x-$1")
                    .replace(/(onrowsdelete+=)/ig, "x-$1")
                    .replace(/(onrowsinserted+=)/ig, "x-$1")
                    .replace(/(onscroll+=)/ig, "x-$1")
                    .replace(/(onselect+=)/ig, "x-$1")
                    .replace(/(onselectionchange+=)/ig, "x-$1")
                    .replace(/(onselectstart+=)/ig, "x-$1")
                    .replace(/(onstart+=)/ig, "x-$1")
                    .replace(/(onstop+=)/ig, "x-$1")
                    .replace(/(onsubmit+=)/ig, "x-$1")
                    .replace(/(onunload+=)/ig, "x-$1")
                    .replace(/(onsubmit+=)/ig, "x-$1")
                    .replace(/(onunload+=)/ig, "x-$1")
                    .replace(/(onwebkitanimationiteration+=)/ig, "x-$1");

                return value;
            }

            if (!content) {
                return content;
            }

            value = content;
            value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
            // 유투브 영상을 삽입하는 등, 고객사에서 iframe 태그를 사용하고 있어 정책적으로 막기는 힘들다.
            // iframe을 사용할 수 있도록 기본 정책을 가져가야 할 듯...
            // value = value.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
            // value = value.replace(/<iframe\b[^<>]*>/gi, "");

            var regex = /(<[^\/]([^>]+)>)/ig;
            var tag;
            var result = '';
            var cursor = 0;
            while ((tag = regex.exec(value)) !== null) {
                // console.log("Found " + tag[0] + ". Next match starts at " + regex.lastIndex);
                result = result + value.substring(cursor, tag.index);
                result = result + escapeXssProperty(tag);
                cursor = regex.lastIndex;
            }
            result = result + value.substring(cursor);

            return result;
        },

        /**
         * 입력항목에 금지해야할 자바스크립트 함수들이 포함되어 있는지 검사 (XSS)
         *
         * 함수는 항상 `func(`로 시작하므로 이런 패턴을 잡아내는 방식으로 처리.
         *
         * [ 방어대상 함수 ]
         * - Execute (
         * - MsgBox (
         * - expression (
         * - alert (
         * - setInterval (
         * - setTimeout (
         * -  $.
         * - _.
         * - GO.
         * - document.
         * - window.
         * - .cookie
         * - <marquee b[^<]*(?:(?!< /marquee>)<[^<]*)*< /marquee>
         * - <script b[^<]*(?:(?!< /script>)<[^<]*)*< /script>
         * - [java|vb]*script :
         *
         * @param str
         * @returns {boolean}
         * @private
         */
        isXSSPettern: function (str) {
            if (!str) return false;
            var pattern = /alert\(|setInterval\(|setTimeout\(|\$\.|_\.|GO\.|Execute\(|MsgBox\(|expression\(|document\.|window\.|\.cookie|<marquee\b[^<]*(?:(?!<\/marquee>)<[^<]*)*<\/marquee>|<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|[java|vb]*script\:/gi;
            return pattern.test(str);
        },

        escapeXssToBlank: function (content) {

            function escapeXssProperty(tag) {
                var value = tag[0];

                value = value.replace(/(javascript:)/ig, "x-$1");
                value = value.replace(/(on[a-z]+=)/ig, "x-$1");

                return value;
            }

            if (!content) {
                return content;
            }

            value = content;
            value = value.replace(/alert\(|setInterval\(|setTimeout\(|\$\.|_\.|GO\.|Execute\(|MsgBox\(|expression\(|.cookie/gi, "");
            value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
            value = value.replace(/<marquee\b[^<]*(?:(?!<\/marquee>)<[^<]*)*<\/marquee>/gi, "");
            value = value.replace(/[java|vb]*script\:/gi, "x-script:");

            var regex = /(<[^\/]([^>]+)>)/ig;
            var tag;
            var result = '';
            var cursor = 0;
            while ((tag = regex.exec(value)) !== null) {
                // console.log("Found " + tag[0] + ". Next match starts at " + regex.lastIndex);
                result = result + value.substring(cursor, tag.index);
                result = result + escapeXssProperty(tag);
                cursor = regex.lastIndex;
            }
            result = result + value.substring(cursor);

            return result;
        },

        /*******************************************************************************
         * XSS 대응 - END
         ********************************************************************************/


        /**
         * Editor 치환 Util
         */
        removeDataAttribute: function (content) {

            if (!content) {
                return content;
            }
            //에디터 안에 불필요한 data-attribute들을 제거함.
            //웹페이지의 데이터를 복사 후 에디터에 붙여넣기 하면 마크업까지 복사된다.
            //이때 전자결재의 data-dsl 내용까지 들어가면서 데이터가 꼬인다. GO-26364
            var dataAttributes = new Array();
            dataAttributes.push(/(data-dsl="[^"]*")/ig);
            dataAttributes.push(/(data-type="[^"]*")/ig);
            //dataAttributes.push(/(data-id="[^"]*")/ig); --> 인라인 이미지때 사용하는 attribute임. data-id는 공백으로 치환하면 안됨.
            dataAttributes.push(/(data-name="[^"]*")/ig);
            dataAttributes.push(/(data-value="[^"]*")/ig);
            dataAttributes.push(/(data-require="[^"]*")/ig);
            dataAttributes.push(/(data-maxlength="[^"]*")/ig);
            dataAttributes.push(/(data-width="[^"]*")/ig);
            dataAttributes.push(/(data-defaultstr="[^"]*")/ig);
            dataAttributes.push(/(data-editable="[^"]*")/ig);
            dataAttributes.push(/(data-select="[^"]*")/ig);

            var result = content;
            $.each(dataAttributes, function (k, v) {
                result = result.replace(v, "");
            });

            return result;
        },

        /**
         윈도우 리사이즈시 특정 엘리먼트의 크기를 조절
         - 주의: 한페이지에 한가지에만 적용됨(개선 필요)

         @method windowResizer
         */
        windowResizer: function (e, callback) {
            // 윈도우 객체가 아니라면 이벤트를 발생시키지 않는다.
            if (e.target !== window) {
                return;
            }

            if (typeof (window['GO_ignoreWindowResize']) === 'undefined') {
                window['GO_ignoreWindowResize'] = 0;
            }
            if (typeof (window['GO_resizeUID']) === 'undefined') {
                window['GO_resizeUID'] = 0;
            }

            var args = Array.prototype.slice.call(arguments, 1);

            if (!window['GO_ignoreWindowResize']) {
                var uid = ++window['GO_resizeUID'];
                setTimeout(function () {
                    if (uid == window['GO_resizeUID'] && !window['GO_ignoreWindowResize']) {
                        window['GO_ignoreWindowResize']++;
                        callback.apply(undefined, args);
                        window['GO_ignoreWindowResize']--;
                    }
                }, 200);
            }
        },

        checkUploadFileType: function (event, file, commonLang) {
            var type = $(event.currentTarget).attr('data-btntype');
            return this.checkFileType(file, commonLang, type);
        },

        checkFileType: function (file, commonLang, type) {
            var reExt = new RegExp("(jpeg|jpg|gif|png|bmp)", "gi");
            var fileType = file.type;
//			var fileExt = file.name.substr(file.name.lastIndexOf('.')+1).toLowerCase();
            if (type == "img") {
                if (!reExt.test(fileType)) {
                    $.goMessage(commonLang["포멧 경고"]);
                    return false;
                }
            } else {
                if (reExt.test(fileType)) {
                    $.goMessage(commonLang["포멧 경고2"]);
                    return false;
                }
            }
            return true;
        },

        isImage: function (extension) {
            var re = new RegExp("(jpeg|jpg|gif|png|bmp)", "gi");
            return re.test(extension);
        },

        getSearchParam: function (searchParam) {
            var hash = {};
            _.each(searchParam.split("&"), function (token) {
                var matched2 = token.split('=');
                hash[matched2[0]] = decodeURIComponent(matched2[1]);
            }, this);
            return (typeof key !== "undefined" ? hash[key] : hash);
        },

        fileUploadErrorCheck: function (data) {
            var serverData = {};

            if (typeof data == "string") {
                serverData = $.parseJSON(data);
            } else {
                serverData = data;
            }

            return serverData.code != "200";
        },

        serverMessage: function (data) {
            var serverData = {};

            if (typeof data == "string") {
                serverData = $.parseJSON(data);
            } else {
                serverData = data;
            }

            return serverData.message;
        },

        isFileSizeZero: function (data) {
            var serverData = {};

            if (typeof data == "string") {
                serverData = $.parseJSON(data);
            } else {
                serverData = data;
            }

            return serverData.data.fileSize == "0" || serverData.data.size == "0";
        },

        getDay: function (date) {
            return this.toMoment(date).clone().day();
        },
        dateDiff: function (startTime, endTime) {
            var a = this.toMoment(startTime);
            var b = this.toMoment(endTime);
            return b.diff(a);
        },

        daysDiff: function (startTime, endTime) {
            var a = this.toMoment(startTime);
            var b = this.toMoment(endTime);

            return b.diff(a, 'days');
        },

        /*
         * Mobile App Bridge
         * */
        //홈화면으로 이동
        goHome: function () {
            if (this.isMobileApp()) {
                if (this.checkOS() == "android") {
                    window.GOMobile.goHome();
                } else {
                    window.location = "gomobile://goHome";
                }
            } else {
                GO.router.navigate('home', {trigger: true});
            }
        },

        goAppHome: function () {
            if (this.isMobileApp()) {
                if (this.checkOS() == "android") {
                    window.GOMobile.goHome();
                } else {
                    window.location = "gomobile://goHome";
                }
            } else {
                GO.router.navigate(GO.router.getPackageName(), {trigger: true});
            }
        },

        callServerCheck: function (responseData) {
            if (this.isMobileApp()) {
                if (this.checkOS() == "android") {
                    window.GOMobile.callServerCheck(responseData.message);
                } else {
                    window.location = "gomobile://callServerCheck?" + responseData.message;
                }
            }
        },

        //redirection
        callSessionTimeout: function () {
            if (this.isMobileApp()) {
                if (GO.util.checkOS() == "android") {
                    window.GOMobile.callSessionTimeout('redirection', '401');
                } else {
                    window.location = "gomobile://callSessionTimeout?redirection&401";
                }
            } else {
                GO.router.navigate('home', {trigger: true, replace: true});
            }
        },

        editorConfirm: function (callback) {
            if (GO.util.hasActiveEditor() && GO.util.isEditorWriting()) {
                var deferred = $.Deferred();

                GO.util.editorWritingPopup(deferred);

                deferred.done(function () {
                    callback();
                });
            } else {
                callback();
            }
        },

        hasActiveEditor: function () {
            try {
                var activeEditorCount = 0;
                _.each(GO.Editor.getInstanceMap(), function (instance) {
                    if ($(document).find("#" + instance.idAttr).length) activeEditorCount++;
                });
                return activeEditorCount > 0;
            } catch (e) {
                return false;
            }
        },

        isEditorWriting: function () {
            if (!GO.Editor) return false;

            var editors = GO.Editor.getInstanceMap();
            var writing = false;
            $.each(editors, function (k, editor) {
                if (!editor.isVisible()) return true; // toggle(false) 된 에디터는 무시한다.
                if (!$('#' + editor.idAttr).length) return true; // ghost 에디터는 무시한다.
                var content = editor.getHTMLContent();
                if (hasContent(content)) {
                    writing = true;
                    return false;
                }
            });

            function hasContent(orinalContent) {
                // activeDesigner는 태그가 대문자로 들어간다.
                // activeDesigner의 태그는 폰트사이즈 및 글꼴 스타일이 들어갈 수 있다.
                var content = orinalContent.toLowerCase().replace(/ style=".*?"/, "");
                return content != ""
                    && $.trim(content).replace(/<br>/g, "") != ""
                    && $.trim(content).replace(/<p>&nbsp;<\/p>/g, "") != ""
                    && $.trim(content).replace(/<p><br><\/p>/g, "") != ""
                    && $.trim(content).replace(/<p><\/p>/g, "") != "";
            }

            return writing;
        },

        editorWritingPopup: function (deferred) {
            var commonLang = require("i18n!nls/commons");
            $.goPopup({
                title: '',
                message: commonLang["내용 작성 중 이동 경고 메시지"],
                modal: true,
                buttons: [{
                    'btext': commonLang["확인"],
                    'btype': 'confirm',
                    'callback': function () {

                        //메일쓰기 페이지일 경우
                        if ($("#mail-viewer").length > 0) {
                            var $mailFrame = $("#mail-viewer")[0].contentWindow;
                            $mailFrame.destroyBasicUploadControl();
                            $mailFrame.destroyMassUploadControl();
                            $mailFrame.destoryEditorControl();
                            $mailFrame.hideAutoComplate();
                        }

                        deferred.resolve();
                    }
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'normal',
                    'callback': function () {
                        deferred.reject();
                    }
                }]
            });

            return deferred;
        },

        isOrgAccessUser: function (userId, isAdmin) {
            var flag = null;
            $.ajax(GO.contextRoot + (isAdmin ? 'ad/' : '') + 'api/organization/access/user/' + userId, {
                type: 'GET',
                async: false,
                contentType: 'application/json'
            })
                .done(function (response) {
                    flag = response.code == "200";
                });
            return flag;
        },

        isUseOrgService: function (isAdmin) {
            var flag = null;
            $.ajax(GO.contextRoot + (isAdmin ? 'ad/' : '') + 'api/organization/use/service', {
                type: 'GET',
                async: false,
                contentType: 'application/json'
            })
                .done(function (response) {
                    flag = response.code == "200";
                });
            return flag;
        },

        /**
         파일 사이즈를 가독성있게 변경하는 함수

         @method getHumanizedFileSize
         @param {Number} bytesize 파일 사이즈
         @return {String} 변환된 문자열
         */
        getHumanizedFileSize: function (bytesize) {
            var orgSize = parseInt(bytesize) || 0,
                UNIT = {
                    'B': 1,
                    'K': 1024,
                    'M': 1048576,
                    'G': 1.0737e+9,
                    'T': 1.0995e+12
                }, baseByte = 0, postfix = 'B';


            if (orgSize > UNIT.T) {
                baseByte = UNIT.T;
                postfix = 'T' + postfix;
            } else if (orgSize > UNIT.G) {
                baseByte = UNIT.G;
                postfix = 'G' + postfix;
            } else if (orgSize > UNIT.M) {
                baseByte = UNIT.M;
                postfix = 'M' + postfix;
            } else if (orgSize > UNIT.K) {
                baseByte = UNIT.K;
                postfix = 'K' + postfix;
            } else {
                baseByte = UNIT.B;
                postfix = 'Byte';
            }

            return (orgSize / baseByte).toFixed(1) + postfix;
        },

        /**
         첨부파일의 확장자에 맞는 아이콘 CSS 클래스명을 반환

         @param {Object} attachData AttachModel 첨부파일 모델
         @return {String} CSS 클래스명
         */
        getFileIconStyle: function (attachData) {
            var extension = attachData.extention.toLowerCase(),
                reExt = new RegExp("(zip|doc|docx|ppt|pptx|xls|xlsx|hwp|pdf|txt|html|htm|jpg|jpeg|png|gif|tif|tiff|bmp|exe|avi|mp3|mp4|mov|mpg|mpeg|lzh|xml|log|csv|eml)", "gi");

            return 'ic_' + (reExt.test(extension) ? extension : 'def');
        },

        /**
         첨부파일의 확장자가 정의한 확장자들에 포함되어 있는지 여부

         @method fileExtentionCheck
         @param {String} extension 파일확장자
         @return {boolean} 정규식에 포함되어있는 확장자인지 여부
         */
        fileExtentionCheck: function (extension) {
            var reExt = new RegExp("(zip|doc|docx|ppt|pptx|xls|xlsx|hwp|pdf|txt|html|htm|jpg|jpeg|png|gif|tif|tiff|bmp|exe|avi|mp3|mp4|mov|mpg|mpeg|lzh|xml|log|csv|eml)", "gi");
            return reExt.test(extension);
        },

        setDefaultFont: function (locale, editor) {
            if (locale == "ja_JP" || locale == "ja") {
                editor.setDefaultFont("MS PGothic");
                setTimeout(function () {
                    editor.exec("MSG_STYLE_CHANGED", ["fontFamily", "'MS PGothic'"]);
                }, 500);
            }
        },
        toBoolean: function (str) {
            if (str == "true") {
                return true;
            } else if (str == "false") {
                return false;
            } else {
                return undefined;
            }
        },
        /**
         * 모바일 앱에서 하단 탭이동 브릿지 호출
         */
        moveTab: function () {
            try {
                if (this.checkOS() == "android") {
                    window.GOMobile.moveTab();
                } else {
                    // window.location 의 연속 호출시 무효화 되는 이슈로 대기 처리함.
                    setTimeout(function () {
                        window.location = "gomobile://moveTab";
                    }, 300);
                }
            } catch (e) {
            }
        },

        /**
         * 모바일 앱에서 하단 탭이동 브릿지 호출(moveTab)에 대한
         * 응답 반환 브릿지 호출
         */
        moveTabReturn: function () {
            try {
                if (this.checkOS() == "android") {
                    window.GOMobile.moveTabReturn();
                } else {
                    window.location = "gomobile://moveTabReturn";
                }
            } catch (e) {
            }
        },

        /**
         * 영문 숫자를 서수로 변경하는 함수(로케일이 영문(en) 일 경우에만 동작함)
         * @param {value} value int 영문 기수
         * @param {locale} locale String 저장된 로케일.
         */
        parseOrdinaryNumber: function (value, locale) {
            var intVal = parseInt(value),
                postfix = 'th';

            // 영문이 아닌 경우 그대로 통과시킨다.
            if (locale !== 'en') return value;

            if (!_.contains([11, 12, 13], intVal % 100)) {
                var mod = '' + (intVal % 10);
                postfix = {"1": "st", "2": "nd", "3": "rd"}[mod] || 'th';
            }

            return value + postfix;
        },

        /**
         * brand name 반환
         */
        getBrandName: function () {
            return $('meta[name="brandName"]').attr('content');
        },

        /**
         * 클라우드 서비스 여부 반환
         * service type : install(설치 버전), cloud(클라우드)
         */
        getServiceType: function () {
            return $('meta[name="serviceType"]').attr('content');
        },

        setBrowserTitle: function () {
            var pkgName = GO.router.getPackageName(),
                locale = GO.config('locale').toLowerCase().replace('_', ''),
                filtered,
                titleBuff = [GO.config('webTitle')];

            if (GO.config("instanceType") !== GO.constant("system", "INSTANCETYPE_APP")) return false;

            if (locale === 'ja') locale = 'jp';

            filtered = _.filter(GO.config('menuList'), function (app) {
                var result = false;

                if (app.subMenuType) return false;
                if (!app.appName) return false;

                if (pkgName === 'sitelink') {
                    var url = decodeURIComponent(GO.router.getSearch('url'));
                    result = (url === app.url);
                } else {
                    result = (app.appName === pkgName);
                }

                return result;
            }).pop();

            if ((filtered != undefined) && filtered[(locale || 'ko') + 'Name']) {
                titleBuff.unshift(filtered[(locale || 'ko') + 'Name']);
            }

            $(document).attr('title', titleBuff.join(' - '));
            sessionStorage.setItem('browserTitle', titleBuff.join(' - '));
        },

        getInitMenu: function (menus) {
            menus = menus || GO.config('menuList');

            var findInitial = _.find(menus, function (menu) {
                return menu.initial && menu.appName && !menu.subMenuType;
            });

            if (!findInitial) {
                _.each(menus, function (menu) {
                    if (menu.appName && !menu.subMenuType) {
                        findInitial = menu;
                        return false;
                    }
                });
            }

            return findInitial;
        },

        splitBrContent: function (content) {
            var re = content.split('<br>');
            content = re[0];

            for (var i = 1; i < 7; i++) {
                content = content + "<br>" + re[i];
            }
            return content;
        },

        ckeckBrCnt: function (content) {
            if (!content) {
                return;
            }
            var re = content.split('<br>');
            return re.length;
        },

        escapePlaceholder: function (context) {
            // placeholder 를 지원하지 않는 구버전 ie 에 대한 체크만 해주면 된다.
            if ($.browser.msie && context.attr("placeholder") == context.val()) {
                return "";
            } else {
                return context.val();
            }
        },
        //이메일 보내기 관련(리팩토링 해야함)
        makeFormatEmail: function (addressArray) {
            var newAddressArray = [];
            var newAddressIndex = 0;
            var firstDoubleQuote = false;
            var secDoubleQuote = false;
            for (var i = 0; i < addressArray.length; i++) {
                if (addressArray[i].indexOf("\"") > -1) {
                    firstDoubleQuote = true;
                    for (var j = i + 1; j < addressArray.length; j++) {
                        if (addressArray[j]
                            .indexOf("\"") > -1) {
                            secDoubleQuote = true;
                            for (var k = i; k <= j; k++) {
                                if (k == i) {
                                    newAddressArray[newAddressIndex] = addressArray[k]
                                        + ",";
                                } else if (k == j) {
                                    newAddressArray[newAddressIndex] = newAddressArray[newAddressIndex]
                                        + addressArray[k];
                                } else {
                                    newAddressArray[newAddressIndex] = newAddressArray[newAddressIndex]
                                        + addressArray[k]
                                        + ",";
                                }

                            }
                            newAddressIndex++;
                            break;
                        }
                    }

                    if (!secDoubleQuote) {
                        newAddressArray[newAddressIndex] = addressArray[i];
                    }
                    i = j;
                } else {
                    newAddressArray[newAddressIndex] = addressArray[i];
                    newAddressIndex++;
                }
            }
            return newAddressArray;
        },

        getFormatName: function (emailFormat) {
            var name = this.get_name(emailFormat);
            var email = this.get_email(emailFormat);
            name = this.trim(name);
            email = this.trim(email);
            if (!email || email == "") {
                return "";
            } else if (name == "") {
                return email;
            } else {
                if (email.indexOf("$") == 0) {
                    return "주소록 그룹" + "[" + name + "]";
                } else if (email.indexOf("#") == 0) {
                    return "조직도" + "[" + name + "]";
                } else if (email.indexOf("!") == 0) {
                    return "커뮤니티 멤버" + "[" + name + "]";
                } else {
                    return name + " <" + email + ">";
                }
            }
        },

        getEmailFormatName: function (emailFormat) {
            var name = this.get_name(emailFormat);
            var email = this.get_email(emailFormat);
            name = this.trim(name);
            email = this.trim(email);
            if (!email || email == "") {
                return "";
            } else if (name == "") {
                return email;
            } else {
                return "\"" + name + "\" <" + email + ">";
            }

        },
        makeEditFormatUnit: function (inputObj, value) {
            if ($.trim(value) == "") return;
            var isValid = this.checkEmailFormat(value);
            var displayName = (isValid) ? this.getFormatName(value) : value;
            var dataName = (isValid) ? this.getEmailFormatName(value) : value;
            var nameField = $('<span class="name" evt-rol="select-field" onselectstart="return false"></span>').attr("title", displayName).data("email", dataName).data("select", false).text(displayName);
            inputObj.before(nameField);
            //inputObj.closest("li").removeClass("invalid invalid_on on").addClass((!isValid && !isRcptModeNoneAC) ? "invalid" : "");
            inputObj.closest("li").removeClass("invalid invalid_on on").addClass((!isValid) ? "invalid" : "");
            inputObj.closest("li").find("span.btn_wrap").show();
            inputObj.unautocomplete();
            inputObj.remove();

        },

        checkEmailFormat: function (emailFormat) {
            var _isId = function (str) {
                var regExp = /^([0-9a-zA-Z_\-~!#$*+.\/=\?\{\}\'\^\|\`])+$/;
                return (str == "" || !regExp.test(str)) ? 1 : 0;
            };
            var _isDomain = function (val) {
                var re1 = /^[0-9a-zA-Z-]+([\.0-9a-zA-Z-]*)$/;

                if (val.length > 128) return false;
                if (!re1.test(val)) return false;
                if (val.indexOf(".") < 0) return false;

                var domainItems = val.split(".");
                for (var i = 0; i < domainItems.length; i++) {
                    var item = domainItems[i];
                    if (item == "" ||
                        item == null ||
                        item.length < 1 ||
                        item.length > 64) {

                        return false;
                    }
                }

                if (val.charAt(0) == "." ||
                    val.charAt(0) == "-" ||
                    val.charAt(val.length - 1) == "." ||
                    val.charAt(val.length - 1) == "-") {
                    return false;
                }

                if (val.indexOf(".-") > 0 ||
                    val.indexOf("-.") > 0 ||
                    val.indexOf("--") > 0) {
                    return false;
                }

                return true;
            };
            var _isEmail = function (val) {
                if (val.indexOf("@") < 0) return false;
                if (val.length > 255) return false;

                var strMember = val.split("@");
                if (strMember.length > 2) {
                    return false;
                }
                return (_isId(strMember[0]) == 0) && _isDomain(strMember[1]);
            };
            var emailValue = this.get_email(emailFormat);
            var isValid = false;
            if (_isEmail(emailValue)) {
                isValid = true;
            }
            return isValid;
        },

        get_name: function (email) {
            if (email.indexOf('<') < 0) {
                return "";
            }

            var s = 0;
            var e = email.indexOf('<');
            var name = email.substr(s, e);
            return this.trim(name.replace(/[\"]/g, ""));
        },

        get_email: function (email) {
            if (email.indexOf('<') < 0) {
                return email;
            }

            var e = (email.length - 1);
            if (email.lastIndexOf('>') < 0 || email.lastIndexOf('>') != email.length - 1) {
                e = email.length;
            }
            var s = email.indexOf('<') + 1;
            return email.substr(s, (e - s));
        },

        trim: function (str) {
            if (!str) return "";
            return str.replace(/^\s*|\s*$/g, "");
        },

        jsonToQueryString: function (obj) {
            var str = [];
            _.each(obj, function (val, key) {
                str.push(encodeURIComponent(key) + "=" + encodeURIComponent(val));
            });

            return str.join("&");
        },

        preloader: function (deferred) {
            require(["jquery.go-preloader"], function () {
                var preloader = $.goPreloader();

                deferred.progress(function () {
                    preloader.render();
                });

                deferred.always(function () {
                    preloader.release();
                });

                deferred.fail(function () {
                    preloader.release();
                });
            });

            return deferred;
        },

        /**
         * 각 앱별 사용자 언어 설정에 맞는 name을 반환한다.
         *
         */
        getAppName: function (appName) {
            var name = "";
            _.each(GO.config("menuList"), function (menu) {
                if (menu.appName == appName) {
                    name = menu.name;
                }
            }, this);

            return name;
        },

        initCap: function (string, keepCamel) {
            var returnValue = '';
            if (keepCamel) {
                returnValue = string.charAt(0).toUpperCase() + string.slice(1); // 이걸로 통일 시켜도 될 것 같은데,, 혹시 모르니까 기존것 유지
            } else {
                return string.toLowerCase().replace(/(?:^|\s)[a-z]/g, function (m) {
                    return m.toUpperCase();
                });
            }

            return returnValue;
        },

        //compactObject : function(o) {
        //	var clone = _.clone(o);
        //   _.each(clone, function(v, k) {
        //       if (!v) {
        //       	delete clone[k];
        //       }
        //   });
        //   return clone;
        //},

        /**
         * 객체 복사(깊은 복사 지원)
         * @param {Object} obj 복사 대상 객체(모든 형태 가능)
         * @param {Boolean} deep 깊은 복사 여부 설정
         */
        clone: function (obj, deep) {
            var result;

            if (typeof deep === 'undefined') deep = false;

            // array와 function은 object 체크보다 먼저 이뤄져야 한다.
            if (_.isArray(obj) && deep) {
                if (!result) result = [];
                for (var _i = 0, _len = obj.length; _i < _len; _i++) {
                    result[_i] = this.clone(obj[_i], deep);
                }
            } else if (_.isFunction(obj)) {
                result = obj;
            } else if (_.isObject(obj) && deep) {
                if (!result) result = {};
                for (var key in obj) {
                    result[key] = _.isObject(obj[key]) ? this.clone(obj[key], deep) : obj[key];
                }
            } else if (_.isNumber(obj)) {
                result = +obj;
            } else if (_.isString(obj)) {
                result = '' + obj;
            } else if (_.isBoolean(obj)) {
                result = !!obj;
            } else {
                result = obj;
            }

            return result;
        },

        numberWithCommas: function (x) {
            x = x || x === 0 ? x : '';
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        },

        formatNumber: function (value, options) {
            var option = _.extend({}, {
                "decimalPoints": 2,
                "thousandComma": true,
                "useTableAutoAggr": false,
                "tableAggrType": ''
            }, options || {});

            function _processValidNumber(value) {
                var clonedAsStr = '' + value;
                clonedAsStr = clonedAsStr.replace(/[^0-9.-]/gi, '');
                return _hasValidSign(clonedAsStr) ? clonedAsStr : GO.util.numberWithCommas(parseFloat(clonedAsStr));
            }

            function _hasValidSign(clonedAsStr) {
                if (clonedAsStr.length < 2) {
                    return true;
                }
                var validSign = ['.', '-'];
                var numberOfComma = [];
                var numberOfMinus = [];
                for (var i = 0; i < validSign.length; i++) {
                    var pos = clonedAsStr.indexOf(validSign[i]);
                    while (pos > -1) {
                        if (validSign[i] == '.') {
                            numberOfComma.push(pos);
                        } else if (validSign[i] == '-') {
                            numberOfMinus.push(pos);
                        }
                        pos = clonedAsStr.indexOf(validSign[i], pos + 1);
                    }
                }
                if (numberOfComma.length > 1 || numberOfMinus.length > 1) {
                    return false;
                } else {
                    if (numberOfMinus.length > 0 && clonedAsStr.indexOf('-') != 0) {
                        return false;
                    }
                    if (numberOfComma.length > 1) {
                        return false;
                    }
                }
                return true;
            }

            function _processDecimalPoint(value) {
                var clonedAsStr = '' + value;
                var decimalPoints = option.decimalPoints;
                var parts = clonedAsStr.split(".");

                // 정수.소수자리 형태가 아닌건 이상한 포맷이 들어온것이다. 일단 통과
                if (parts.length !== 2) {
                    return clonedAsStr;
                }

                // 소수점 자리수가 0이하이면 parseInt 수행
                if (decimalPoints < 1) {
                    return parseInt(clonedAsStr);
                }

                // 정수부분이 없는 것도 이상한 것이다. 그냥 통과시킴
                if (_.isUndefined(parts[1])) {
                    return clonedAsStr;
                }

                // toFixed 함수를 쓰지 않은 이유는 toFixed() 를 사용하면 정수인것도 실수로 변경해버리기 때문.
                if (parts[1].length > decimalPoints) {
                    clonedAsStr = parts[0] + '.' + parts[1].substring(0, decimalPoints);
                }

                return clonedAsStr;
            }

            function _processPrecision(value) {
                var clonedAsStr = '' + value;
                clonedAsStr = clonedAsStr.replace(/,/gi, '');

                if (clonedAsStr.length > 15) {
                    clonedAsStr = clonedAsStr.substring(0, 15);
                }

                return clonedAsStr;
            }

            function _processThousandComma(value) {
                var clonedAsStr = '' + value;

                if (option.thousandComma) {
                    var parts = clonedAsStr.toString().split(".");
                    var n = parts[0].replace(/,/gi, '');
                    parts[0] = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    clonedAsStr = parts.join(".");
                }

                return clonedAsStr;
            }

            var clonedAsStr = '' + value;

            clonedAsStr = _processValidNumber(clonedAsStr);
            clonedAsStr = _processDecimalPoint(clonedAsStr);
            clonedAsStr = _processPrecision(clonedAsStr);
            clonedAsStr = _processThousandComma(clonedAsStr);

            return clonedAsStr;
        },

        /**
         *  width에 맞게 number 앞에 0 추가
         * @param number
         * @param width
         */
        numberPad: function (number, width) {
            number = number + "";
            return number.length >= width ? number : new Array(width - number.length + 1).join('0') + number;
        },

        msie: function () {
            return (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (navigator.userAgent.toLowerCase().indexOf("msie") != -1);
        },

        isIE8: function () {
            var ua = window.navigator.userAgent.toLowerCase();
            return ua.indexOf("msie 8.0") > -1;
        },

        isIE9: function () {
            var rv = -1; // Return value assumes failure.
            if (navigator.appName == 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1);
            }
            return rv === 9;
        },

        useButtonWindow: function () {// ie9 이면서 flash 버튼을 사용할 경우 파일첨부 버튼 mode를 바꾼다. DOCUSTOM-5963
            return $.browser.flash && this.isIE9();
        },

        /**
         * from backbone.js
         */
        extendClass: function (parent, protoProps, staticProps) {
            var child;

            if (protoProps && _.has(protoProps, 'constructor')) {
                child = protoProps.constructor;
            } else {
                child = function () {
                    return parent.apply(this, arguments);
                };
            }

            _.extend(child, parent, staticProps);

            var Surrogate = function () {
                this.constructor = child;
            };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate;

            if (protoProps) _.extend(child.prototype, protoProps);

            child.__super__ = parent.prototype;

            return child;
        },

        flash: function () {
            return false;
        },

        /**
         * firefox 한글 키 이벤트 유틸
         */
        bindVirtualKeyEvent: function ($el) {
            if (!($.browser.mozilla || $.browser.opera)) return;
            $el.each(function () {
                var Observe = function (oEl) {
                    this._o = oEl;
                    this._value = oEl.value;
                    this._bindEvents();
                };

                Observe.prototype._bindEvents = function () {
                    var self = this;
                    var bind = function (oEl, sEvent, pHandler) {
                        if (oEl.attachEvent) oEl.attachEvent('on' + sEvent, pHandler);
                        else oEl.addEventListener(sEvent, pHandler, false);
                    };
                    bind(this._o, 'focus', function () {
                        if (self._timer) clearInterval(self._timer);
                        self._timer = setInterval(function () {

                            if (self._value != self._o.value) {
                                self._value = self._o.value;
                                self._fireEvent();
                            }
                        }, 50);
                    });
                    bind(this._o, 'blur', function () {
                        if (self._timer) clearInterval(self._timer);
                        self._timer = null;
                    });
                };

                Observe.prototype._fireEvent = function () {
                    var e;
                    if (document.createEvent) {
                        if (window.KeyEvent) {
                            e = document.createEvent('KeyEvents');
                            e.initKeyEvent('keyup', true, true, window, false, false, false, false, 65, 0);
                        } else {
                            e = document.createEvent('UIEvents');
                            e.initUIEvent('keyup', true, true, window, 1);
                            e.keyCode = 65;
                        }
                        this._o.dispatchEvent(e);
                    } else {
                        e = document.createEventObject();
                        e.keyCode = 65;
                        this._o.fireEvent('onkeyup', e);
                    }
                };
                new Observe(this);
            });
        },

        setRouterStorage: function (key, value) {
            GO.util.store.set(GO.session('id') + '-storedParam-cycle1', null, {type: 'session'});
            GO.util.store.set(GO.session('id') + '-storedParam-cycle2', null, {type: 'session'});
            var object = GO.util.store.get(GO.session('id') + '-storedParam-cycle3') || {};
            var extendedObject = _.extend(object, {
                path: location.pathname
            });
            extendedObject[key] = value;
            GO.util.store.set(GO.session('id') + '-storedParam-cycle3', extendedObject, {type: 'session'});
        },

        getRouterStorage: function () {
            var storedParam = null;

            if (storedParam = GO.util.store.get(GO.session('id') + '-storedParam-cycle1'))
                return storedParam;
            if (storedParam = GO.util.store.get(GO.session('id') + '-storedParam-cycle2'))
                return storedParam;
            if (storedParam = GO.util.store.get(GO.session('id') + '-storedParam-cycle3'))
                return storedParam;

            return storedParam;
        },

        fixFloatingPoint: function (number, decimal) { // null -> 0, undefined -> NaN
            number = Math.round((number) * 1e12) / 1e12;
            if (decimal) number = parseFloat(number.toFixed(decimal));
            return number;
        },

        userLabel: function (user) {
            return user.name + ' ' + (user.position || '');
        },

        leftPad: function (str, size, padChar) {
            return makePadChar(str, size, padChar) + str;
        },

        rightPad: function (str, size, padChar) {
            return str + makePadChar(str, size, padChar);
        },

        getQueryParam: function (key) {
            return GO.router.getSearch(key);
        },

        /**
         * 메일과 자료실의 iframe memory leak 현상 대응
         */
        purgeMailAndWebFolder: function () {
            $('#mail-viewer, #webfolder-viewer').each(function (index, iframe) {
                iframe.src = 'about:blank';
            });
        },

        ocxUploadVisible: function (visible) {
            if (GO.router.getPackageName() != "mail") {
                return;
            }
            var value = "hidden";
            if (visible && !$("#gpopupLayer").is(":visible")) {
                value = "visible";
            }
            $("#mail-viewer").contents().find('object[name=powerupload]').css("visibility", value);
        },

        replaceBrackets: function (str) {
            str = str.replace("\[\g", "\\[");
            str = str.replace("\]\g", "\\]");
            str = str.replace("\{\g", "\\{");
            str = str.replace("\}\g", "\\}");
            str = str.replace("\(\g", "\\(");
            str = str.replace("\)\g", "\\)");
            return str;
        },

        /**
         * IE 10 이하 에서 location.origin 지원하지 않음.
         */
        locationOrigin: function () {
            if (location.origin) {
                return location.origin;
            }
            return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
        },

        // byte 단위의 파라미터
        displayHumanizedAttachSizeStatus: function (current) {
            var c = current == 0 ? "0MB" : this.getHumanizedFileSize(current);
            return "( " + c + " )";
        },
        isValidValue: function (value) {
            return !_.isNull(value) && !_.isUndefined(value);
        },
        isInvalidValue: function (value) {
            return _.isNull(value) || _.isUndefined(value)
        },
        removeItem: function (key) {
            localStorage.removeItem(key);
        },
        setLocalStorage: function (key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },
        getLocalStorage: function (key) {
            var item = localStorage.getItem(key);
            try {
                return JSON.parse(localStorage.getItem(key));
            } catch (e) {
                return item;
            }
        },
        setClipboard: function (url) {
            var commonLang = require("i18n!nls/commons");

            if (window.clipboardData) {
                window.clipboardData.setData('Text', url);
            } else {
                try {
                    navigator.clipboard.writeText(url).then(function () {
                        $.goMessage(commonLang["URL 복사 문구"]);
                    }, function () {
                        $.goMessage(commonLang["URL 복사 실패"]);
                    });
                } catch (e) {
                    var tempElement = document.createElement('textarea');
                    document.body.appendChild(tempElement);
                    tempElement.value = url
                    tempElement.select();
                    document.execCommand('copy');
                    $.goMessage(commonLang["URL 복사 문구"]);
                    document.body.removeChild(tempElement);
                }
            }
        }
    });

    function makePadChar(str, size, padChar) {
        var value = str;
        if (_.isNumber(str)) {
            value = value.toString();
        }

        var length = value.length;

        var padChars = [];

        for (var i = 0; i < size - length; i++) {
            padChars.push(padChar);
        }

        return padChars.join("");
    }

    if (!!window.amplify) {
        GO.util.store = (function () {
            function getStorage(type/*,key, val, options*/) {
                var storeType = type || 'local',
                    args = Array.prototype.slice.apply(arguments),
                    rargs = args.slice(1),
                    func = ((storeType === 'session' && !!window.sessionStorage && (typeof amplify.store.sessionStorage == "function")) ? amplify.store.sessionStorage : amplify.store);

                return func.apply(amplify, rargs);
            }

            return {
                get: function (key) {
                    var result = getStorage('local', key);
                    if (_.isUndefined(result)) {
                        result = getStorage('session', key);
                    }
                    return result;
                },

                set: function (key, val, options) {
                    var opts = _.defaults(options || {}, {type: 'local'});
                    return getStorage(opts.type, key, val, _.omit(opts, 'type'));
                }
            };
        })();
    }

}).call(this, _, moment);
