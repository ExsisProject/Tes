(function() {

    define([
        "jquery", 
        "underscore",
        "hogan", 
        "moment", 
        "calendar/libs/recurrence_parser",
        "asset/collections/asset_unreserved_date_list",
        "text!calendar/templates/_recurrence_content.html",
        "text!calendar/templates/_recurrence_tab.html", 
        "i18n!nls/commons",
        "i18n!calendar/nls/calendar", 
        "i18n!asset/nls/asset",
        "jquery.go-popup",
        "jquery.ui"
    ], 

    function(
        $, 
        _, 
        Hogan, 
        moment, 
        RecurrenceParser,
        UnreservedDates,
        ContentTpl,
        TabTpl, 
        commonLang, 
        calLang,
        assetLang
    ) {
        var // 상수 정의, 
            WEEKDAY = {
                'sun': calLang["일요일"], 
                'mon': calLang["월요일"], 
                'tue': calLang["화요일"], 
                'wed': calLang["수요일"], 
                'thu': calLang["목요일"], 
                'fri': calLang["금요일"], 
                'sat': calLang["토요일"]
            },              
            WEEKDAY_SHORT = {
                'sun': calLang["일"], 
                'mon': calLang["월"], 
                'tue': calLang["화"], 
                'wed': calLang["수"], 
                'thu': calLang["목"], 
                'fri': calLang["금"], 
                'sat': calLang["토"]
            },  
            WEEKDAY_VERY_SHORT = {'sun': "SU", 'mon': "MO", 'tue': "TU", 'wed': "WE", 'thu': "TH", 'fri': "FR", 'sat': "SA"}, 
            INTERVAL_POSTFIX = {"DAILY": calLang["일마다"], "WEEKLY": calLang["주마다"], "MONTHLY": calLang["월마다"], "YEARLY": calLang["년마다"]}, 
            DEFAULT_INTERVAL = 1, 
            DEFAULT_REPEAT_COUNT = 30,
            MIN_REPEAT_COUNT = 1, 
            MAX_REPEAT_COUNT = 10000000000000000,
            HOR_SPACER = '<span class="horspace1"></span>', 

            headerTpl = Hogan.compile(TabTpl), 
            contentTpl = Hogan.compile(ContentTpl), 
            RecurrenceLayerHelper, 
            labels = {
                "everyday"          : calLang["매일"], 
                "everyweek"         : calLang["매주"], 
                "everymonth"        : calLang["매월"], 
                "everyyear"         : calLang["매년"],
                "per_date"          : calLang["일마다"], 
                "start_date"        : calLang["시작일"], 
                "recurrence"        : calLang["반복"], 
                "end_recurrence"    : calLang["반복종료"], 
                "recurence_count"   : calLang["회 반복"], 
                "infinit_recurrence": calLang["무한반복"],
                "dates"             : assetLang["예약불가 일자"]
            };

        /**
        Recurrence Layer Helper

        @class RecurrenceLayerHelper   
        */
        RecurrenceLayerHelper = (function() {
            var constructor = function(startDate, isCalendar, code, day, itemModel) {
                if (!_.isEmpty(itemModel)) {
                    this.repeatCount = itemModel.attributes.limitRecurrence === 'NOT_USE' ?
                        DEFAULT_REPEAT_COUNT : itemModel.attributes.limitRecurrenceCount;
                    this.itemModel = itemModel;
                } else {
                    this.repeatCount = DEFAULT_REPEAT_COUNT;
                }
                if (_.isEmpty(code)) {
                    code = "COUNT=" + (this.repeatCount ? this.repeatCount : DEFAULT_REPEAT_COUNT);
                }

                this.hasUnreservedDate = false;
                this.popupEl = null; 
                this.startDate = GO.util.toMoment(startDate);
                this.templates = {};
                this.recurrenceCode = code || "";
                this.day = day;
                this.callbacks = {
                    "confirm"   : { func: function() {}, context: this }, 
                    "cancel"    : { func: function() {}, context: this }, 
                    "close"     : { func: function() {}, context: this }
                };
                
                // datepicker 기본값 설정
                $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );

                this.recurrenceParser = new RecurrenceParser();
                this._parseFromCode(this.recurrenceCode);
                this._prepareTemplates(isCalendar);
            }

            constructor.prototype = {
                /**
                팝업창 렌더링

                @method render
                @return {Object} 팝업 엘리먼트 객체
                **/                
                render: function(offset) {
                    this.popupEl = $.goPopup({
                    	width : 440,
                        pclass: 'layer_normal layer_repeat_schedule go_renew',
                        headerHtml : this.templates["header"],
                        contents: this.templates["content"],
                        closeCallback: $.proxy(this._close, this),
                        offset: offset,
                        modal: true,
                        buttons : [
                            { btype : 'confirm', btext : commonLang["확인"], callback: $.proxy(this._confirm, this), autoclose : false },
                            { btype : 'cancel', btext : commonLang["취소"], callback: $.proxy(this._cancel, this) }
                        ]
                    });

                    this.undelegateEvents();
                    this.delegateEvents();
                    this._bindDatepicker();

                    this._setRecurrencePeriodOptions(this.recurrenceParser.get("FREQ"));
                    this._generateRecurrenceText();
                    
                    this._resetFocus();

                    return this.popupEl;
                }, 
                /**
                자바스크립트 이벤트 바인딩

                @method delegateEvents
                @private
                **/
                delegateEvents: function() {
                    this.popupEl.on("click.recurrence" , "ul.tab_nav li", $.proxy(this._changeTab, this));
                    this.popupEl.on("click.recurrence" , "input[type=radio][name^=repeat_]", $.proxy(this._changeRepeatType, this));
                    this.popupEl.on("change.recurrence", "input[name=repeat_date]", $.proxy(this._generateRecurrenceText, this));
                    this.popupEl.on("change.recurrence", "input[name=repeat_date]", $.proxy(this._assetValidateYear, this));
                    this.popupEl.on("change.recurrence" , "select[name=recurrence_interval]", $.proxy(this._changeInterval, this));
                    this.popupEl.on("keyup.recurrence" , "input[name=repeat_count]", _.isEmpty(this.itemModel) ? $.proxy(this._validateRepeatCount, this) : $.proxy(this._assetValidateCount, this));
                    this.popupEl.on("blur.recurrence" , "input[name=repeat_count]", _.isEmpty(this.itemModel) ? $.proxy(this._validateRepeatCount, this) : $.proxy(this._assetValidateCount, this));
                    this.popupEl.on("click.recurrence" , "input[type=checkbox][name^=week_byday_]", $.proxy(this._generateRecurrenceText, this));
                    this.popupEl.on("click.recurrence" , "#date-of-startdate", $.proxy(this._generateRecurrenceText, this));
                    this.popupEl.on("click.recurrence" , "#weekday-of-startdate", $.proxy(this._generateRecurrenceText, this));
                },                 

                /**
                자바스크립트 이벤트 해제

                @method undelegateEvents
                @private
                **/
                undelegateEvents: function() {
                    this.popupEl.off(".recurrence");
                }, 

                /**
                확인 버튼 클릭시 호출되는 콜백 설정

                @method setConfirmCallback
                @return {Object} RecurrenceLayerHelper 객체
                @chainable
                **/  
                setConfirmCallback: function(callback, context) {
                    return this._setCallback("confirm", callback, context);
                }, 

                /**
                취소 버튼 클릭시 호출되는 콜백 설정

                @method setCancelCallback
                @return {Object} RecurrenceLayerHelper 객체
                @chainable
                **/  
                setCancelCallback: function(callback, context) {
                    return this._setCallback("cancel", callback, context);
                }, 

                /**
                닫기 버튼 클릭시 호출되는 콜백 설정

                @method setCloseCallback
                @return {Object} RecurrenceLayerHelper 객체
                @chainable
                **/  
                setCloseCallback: function(callback, context) {
                    return this._setCallback("close", callback, context);
                }, 

                /**
                FREQ 값 반환

                @method getFreq
                **/
                getFreq: function() {
                    return this.popupEl.find("ul.tab_nav li.on").attr("data-freq");
                }, 

                /**
                INTERVAL 입력 엘리먼트 반환

                @method getIntervalElement
                @return {Object} INTERVAL 입력 엘리먼트
                **/
                getIntervalElement: function() {
                    return this.popupEl.find("select[name=recurrence_interval]");
                }, 

                /**
                INTERVAL 값 환

                @method getInterval
                @return {String} INTERVAL 값 반환
                **/
                getInterval: function() {
                    var interval = this.getIntervalElement().find('option:selected').val();
                    return parseInt(interval) > 1 ? interval : undefined;
                }, 

                /**
                COUNT 입력 엘리먼트 값 반환

                @method getRepeatCountElement
                @return {Object} COUNT 입력 엘리먼트
                **/
                getRepeatCountElement: function() {
                    return this.popupEl.find("input[type=text][name=repeat_count]");
                }, 

                /**
                반복횟수 반환

                @method getRepeatCount
                **/
                getRepeatCount: function() {
                    var el = this.getRepeatCountElement();
                    return el.is(":disabled") ? undefined : el.val();
                }, 

                /**
                UNTIL 입력 엘리먼트 값 반환

                @method getUntilDateElement
                @return {Object} UNTIL 입력 엘리먼트
                **/
                getUntilDateElement: function() {
                    return this.popupEl.find("input[type=text][name=repeat_date]");
                }, 

                /**
                반복종료일 반환

                @method getUntilDate
                **/
                getUntilDate: function() {
                    var el = this.getUntilDateElement();
                    return (el.is(":disabled") || !el.val()) ? undefined : GO.util.toMoment(el.val()).format("YYYYMMDD"); //   GO.util.dateToRFC2445OfISO8601(el.val())
                },

                /**
                매월 XX일 선택되었을 경우 반환

                @method getMonthdayPerMonth
                @return {String}
                **/
                getMonthdayPerMonth: function() {
                    return this.popupEl.find("#date-of-startdate:checked").val();
                }, 

                /**
                매월 X번째 Y요일 선택되었을 경우 반환

                @method getDayPerMonth
                @return {String}
                **/
                getDayPerMonth: function() {
                    return this.popupEl.find("#weekday-of-startdate:checked").val();
                }, 

                /**
                매주탭의 요일 체크박스 엘리먼트 반환

                @method getWeekdayCheckboxElement
                @return {Object} 요일 체크박스 엘리먼트들
                **/
                getWeekdayCheckboxElement: function() {
                    return this.popupEl.find("input[type=checkbox][name^=week_byday_]:checked");
                }, 

                /**
                매주 반복 요일 스트링 반환

                @method getWeekdayString
                return {String} 콤마(,)로 구분된 요일(2자리 약어) 문자열
                **/
                getWeekdayString: function() {
                    var el = this.getWeekdayCheckboxElement(), 
                        bydayBuff = [];

                    el.each(function(i, cEl) {
                        if($(cEl).is(":checked")) bydayBuff.push(WEEKDAY_VERY_SHORT[$(cEl).val()]);
                    });
                    return bydayBuff.length > 0 ? bydayBuff.join(",") : undefined;
                }, 

                /**
                최종 Recurrence Code 문자열 반환

                @method getRecurrenceCode
                return {String} 최종 Recurrence Code 문자열
                **/
                getRecurrenceCode: function() {
                    return this.recurrenceCode;
                }, 

                /**
                확인 콜백 함수

                @method _confirm
                @return {Function} 콜벡 함수
                @private
                @chainable
                **/ 
                _confirm: function(popupEl) {
                    if(this._validate()) {
                        var callback = this._getCallback("confirm");
                        callback["func"].call(callback["context"], this.getRecurrenceCode(), this.recurrenceParser.humanize(), this.hasUnreservedDate);
                        popupEl.close();
                    }
                    return this;
                }, 

                /**
                확인 콜백시 데이터 검증 후 결과 반환

                @method _validate
                @return {Boolean} 데이터 정합성 여부 반환
                @private
                @chainable
                **/ 
                _validate: function() {
                    if(this.getFreq() === "WEEKLY" && !this.getWeekdayCheckboxElement().length) {
                        window.alert(calLang["요일을 선택해주세요"]);
                        return false;
                    }

                    return true;
                }, 

                /**
                취소 콜백 함수

                @method _confirm
                @return {Object} RecurrenceLayerHelper 객체
                @private
                @chainable
                **/ 
                _cancel: function() {
                    var callback = this._getCallback("cancel");
                    callback["func"].call(callback["context"]);
                    return this;
                }, 

                /**
                닫기 콜백 함수

                @method _close
                @return {Object} RecurrenceLayerHelper 객체
                @private
                @chainable
                **/ 
                _close: function() {
                    var callback = this._getCallback("close");
                    callback["func"].call(callback["context"]);
                    return this;
                }, 

                /**
                해당 콜백 가져오기

                @method _getCallback
                @return {Object} RecurrenceLayerHelper 객체
                @private
                @chainable
                **/ 
                _getCallback: function(category) {
                    return this.callbacks[category] || { func: function() {}, context: this };
                }, 

                /**
                콜백 함수 설정

                @method _setCallback
                @return {Object} RecurrenceLayerHelper 객체
                @chainable
                **/
                _setCallback: function(category, callback, context) {
                    if(!_.has(this.callbacks, category)) this.callbacks[category];
                    this.callbacks[category]["func"] = callback;
                    this.callbacks[category]["context"] = context || this;
                    return this;
                }, 

                /**
                datepicker 바인딩

                @method _bindDatepicker
                @return {Object} 팝업 엘리먼트 객체
                **/ 
                _bindDatepicker: function() {
                    this.getUntilDateElement().datepicker({
                        yearSuffix: "",
                        dateFormat: "yy-mm-dd", 
                        changeMonth: true,
                        changeYear: true,
                        minDate: this.startDate.format("YYYY-MM-DD")
                    });
                }, 

                /**
                선택된 탭에 따라 반복주기 옵션 HTML 생성

                @method _setRecurrencePeriodOptions
                @chainable
                **/
                _setRecurrencePeriodOptions: function(type) {
                    var $wrap = this.popupEl.find(".tab-option"), 
                        funcname = {"WEEKLY": "_buildWeeklyPeriodOptTpl", "MONTHLY": "_buildMonthlyPeriodOptTpl"}[type], 
                        html = '';
                    $wrap.empty();
                    // 매주, 매월만 해당
                    if(!_.contains(["WEEKLY", "MONTHLY"], type)) return;
                    html = this[funcname].call(this);

                    $wrap.html(html);
                    
                    return this;
                }, 

                _isUnLimited: function(type) {
                    var val = this.itemModel.attributes.limitRecurrence;
                    switch (type) {
                        case 'COUNT':
                            return val === 'COUNT' || val === 'NOT_USE';
                        case 'YEAR':
                            return val === 'YEAR'  || val === 'NOT_USE';
                        case 'NOT_USE':
                            return val === 'NOT_USE' || val === 'NONE';
                    }
                    return false;
                },
                /**
                팝업창 렌더링

                @method _prepareTemplates
                @chainable
                **/
                _prepareTemplates: function(isCalendar) {
                    var FREQ = GO.constant("calendar", "RECURRENCE_FREQ"),
                        curFreq = this.recurrenceParser.get("FREQ"),
                        hasUntil = this.recurrenceParser.has("UNTIL"), 
                        hasCount = this.recurrenceParser.has("COUNT"),
                        dateOn = isCalendar ? false : this._isUnLimited("YEAR"),
                        countOn = isCalendar ? false : this._isUnLimited("COUNT"),
                        notLimit = isCalendar ? false : this._isUnLimited("NOT_USE"),
                        current = new Date();
                    current.setFullYear(current.getFullYear() + this.repeatCount);

                    this.templates["header"] = headerTpl.render({
                        "is_freq_daily?": curFreq === FREQ.daily, 
                        "is_freq_weekly?": curFreq === FREQ.weekly, 
                        "is_freq_monthly?": curFreq === FREQ.monthly, 
                        "is_freq_yearly?": curFreq === FREQ.yearly, 
                        "label": labels,
                    });
                    
                    this.templates["content"] = contentTpl.render({ 
                        "label": labels,
                        "interval_options": createRecurIntervalOptions(this.recurrenceParser.has("INTERVAL") ? this.recurrenceParser.get("INTERVAL") : 1), 
                        "interval": this.recurrenceParser.has("INTERVAL") ? this.recurrenceParser.get("INTERVAL") : 1, 
                        "interval_postfix": INTERVAL_POSTFIX[this.recurrenceParser.get("FREQ")], 
                        "start_date": this.startDate.format("YYYY-MM-DD"), 
                        "has_end_date?": hasUntil,
                        "end_date": hasUntil ? GO.util.toMoment(this.recurrenceParser.get("UNTIL"), "YYYYMMDD").format("YYYY-MM-DD") : "", 
                        "has_repeat_count?": hasCount, 
                        "repeat_count": hasCount ? this.recurrenceParser.get("COUNT") : "", 
                        "is_infinite?": (!hasUntil && !hasCount),
                        "is_calendar?": isCalendar,
                        "dateOn": dateOn,
                        "dateOnAttr": notLimit ? false : dateOn,
                        "countOn": countOn,
                        "countOnAttr": notLimit ? true : countOn,
                        "init_date": notLimit ? "" : GO.util.shortDate(current)
                    });
                    return this;
                },

                /**
                선택된 상황에 따라 Recurrence 코드값 생성

                @method _parseFromForm
                **/
                _parseFromForm: function() {
                    console.log("[RecurrencLayer#_parseFromForm] converting....");

                    this.recurrenceParser.set("FREQ", this.getFreq());
                    this.recurrenceParser.set("INTERVAL", this.getInterval());
                    this.recurrenceParser.set("COUNT", this.getRepeatCount());
                    this.recurrenceParser.set("UNTIL", this.getUntilDate());
                    this.recurrenceParser.set("BYDAY", this.getWeekdayString() || this.getDayPerMonth());
                    this.recurrenceParser.set("BYMONTHDAY", this.getMonthdayPerMonth());

                    this.recurrenceCode =  this.recurrenceParser.toString();
                    return this.recurrenceCode;
                }, 

                _parseFromCode: function(code) {
                    this.recurrenceParser.parse(code);
                }, 

                /**
                반복 주기 입력 이벤트 콜백

                @method _changeInterval
                @private
                **/
                _changeInterval: function(e) {
                    var $target = (typeof(e) === "undefined" ? $("select[name=recurrence_interval]"): $(e.target)), 
                        value = $target.find("option:selected").val();
                    
                    this._generateRecurrenceText();
                }, 

                /**
                반복횟수 입력 이벤트 콜백

                @method _validateRepeatCount
                @private
                **/
                _validateRepeatCount: function(e) {
                    var $target = $target = (typeof(e) === "undefined" ? $("input[name=repeat_count]"): $(e.target)), 
                        value = $target.val();
                    if(
                        value.length > 0 && 
                        (!/^(\d)+$/.test(value) || parseInt(value) < MIN_REPEAT_COUNT || parseInt(value) > MAX_REPEAT_COUNT)
                    ) {
                        $target.val(this.repeatCount);
                    }
                    this._generateRecurrenceText();
                }, 

                /**
                Recurrence 코드의 파싱 결과 출력

                @method delegateEvents
                @private
                **/
                _generateRecurrenceText: function() {
                    this._parseFromForm();
                    this.popupEl.find(".recurrence-text").html(labels.recurrence + " : " + this.recurrenceParser.humanize());
                    this._getAssetUnreservedDates();
                },


                /**
                 * 날짜 제약사항에 따른 유효성 체크
                 */
                _assetValidateYear: function () {
                    if (_.isEmpty(this.itemModel))
                        return;

                    var type = this.itemModel.attributes.limitRecurrence;
                    if (type === "NOT_USE" || type !== "YEAR") {
                        this._generateRecurrenceText();
                        return;
                    }

                    var value = new Date($("input[name=repeat_date]").val());
                    var current = new Date();
                    current.setFullYear(current.getFullYear() + this.repeatCount);
                    if (this._isExceedYear(value, current)) {
                        $("input[name=repeat_date]").val(GO.util.shortDate(current));
                        this._generateRecurrenceText();
                        $.goMessage(GO.i18n(assetLang["반복 예약 가능 최대 기간 0년을 초과하였습니다"], {
                            "count": this.repeatCount
                        }));
                    }
                    this._generateRecurrenceText();
                },

                _isExceedYear: function (value, me) {
                    var _base = moment(value).clone(),
                        _me = moment(me).clone();
                    return _me < _base;
                },

                /**
                 * 예약 반복카운트 유효성 체크
                 */
                _assetValidateCount: function () {
                    if (_.isEmpty(this.itemModel))
                        return;

                    var value = $("input[name=repeat_count]").val();
                    if (!this._validateCount(value)) {
                        $("input[name=repeat_count]").val(this.repeatCount);
                        this._generateRecurrenceText();
                        return;
                    }

                    var type = this.itemModel.attributes.limitRecurrence;
                    if (type === "NOT_USE" || type !== "COUNT") {
                        this._generateRecurrenceText();
                        return;
                    }

                    if (value > this.repeatCount) {
                        $("input[name=repeat_count]").val(this.repeatCount);
                        this._generateRecurrenceText();
                        $.goMessage(GO.i18n(assetLang["반복 예약 최대 횟수 0회를 초과하였습니다"], {
                            "count": this.repeatCount
                        }));
                    }
                    this._generateRecurrenceText();
                },

                _validateCount: function (value) {
                    return !(value.length > 0 && (!/^(\d)+$/.test(value) || parseInt(value) < MIN_REPEAT_COUNT));

                },

                /**
                 * 예약불가 날짜
                 * @private
                 */
                _getAssetUnreservedDates: function() {
                    if (_.isEmpty(this.itemModel))
                        return;

                    var startDate = $('#startDate').val(),
                        startTime = $('#startTime').val(),
                        endDate = $('#endDate').val(),
                        endTime = $('#endTime').val();
                    var format = "YYYY-MM-DD HH:mm";
                    var startDateTime = GO.util.toISO8601(GO.util.toMoment(startDate + " " + startTime, format));
                    var endDateTime = GO.util.toISO8601(GO.util.toMoment(endDate + " " + endTime, format));
                    var list = UnreservedDates.getCollection({data : {
                            'assetItem' : this.itemModel.itemId,
                            'recurrence' : this.recurrenceParser.toString(),
                            'startTime' : startDateTime,
                            'endTime' : endDateTime
                        }
                    });
                    if (!_.isEmpty(list)) {
                        $("#unreserve-dates").removeClass("dsp_none");
                        $("#dates").empty();
                        _.each(list, function(list) {
                            $("#dates").append("<li>" + list + "</li>");
                        });
                        this.hasUnreservedDate = true;
                    } else {
                        this.hasUnreservedDate = false;
                        $("#unreserve-dates").addClass("dsp_none");
                    }
                },

                /**
                반복형태 변경 콜백

                @method _changeRepeatType
                @private
                **/
                _changeRepeatType: function(e, pIsReset) {
                    var isReset = pIsReset || true, 
                        $target = (e instanceof $.Event ? $(e.target) : $(e)), 
                        repeatType = $target.val(), 
                        textInputs = this.popupEl.find('input[type=text][name^=repeat_]'),
                        targetInput = this.popupEl.find('input[type=text][name=repeat_' + repeatType + ']');
                    
                    if(isReset) textInputs.val("");
                    textInputs.attr("disabled", true);

                    if(targetInput.length > 0) {
                        targetInput.attr("disabled", false);
                        this._resetRepeatInputField(repeatType);
                    }

                    this._generateRecurrenceText();
                }, 

                /**
                반복형태 기본값 설정

                @method _resetRepeatInputField
                @param {String} repeatType 반복 형태(date: 반복종료일 지정, count: 반복횟수 지정, infinite: 무한반복)
                @private
                **/
                _resetRepeatInputField: function(repeatType) {
                    var func = {"date": "_resetRepeatEndDate", "count": "_resetRepeatCount", "infinite": ""}[repeatType];
                    if(func && func in this) this[func].call(this);
                    return this;
                }, 

                /**
                반복종료일자 reset

                @method _resetRepeatEndDate
                @private
                **/
                _resetRepeatEndDate: function() {
                    console.log("[RecurrenceLayerHelper#_resetRepeatEndDate]");
                    var startDate = this.startDate, 
                        converter = {}, 
                        repeatEnd = "";

                    converter[RecurrenceParser.FREQ_DAILY] = startDate.clone().add('months', 2);
                    converter[RecurrenceParser.FREQ_WEEKLY] = startDate.clone().add('months', 2);
                    converter[RecurrenceParser.FREQ_MONTHLY] = startDate.clone().add('years', 1);
                    converter[RecurrenceParser.FREQ_YEARLY] = startDate.clone().add('years', 5);

                    repeatEnd = converter[this.recurrenceParser.get("FREQ")].format("YYYY-MM-DD");

                    this.getUntilDateElement().val(repeatEnd);
                    return this;
                }, 

                /**
                반복횟수 reset

                @method _resetRepeatCount
                @private
                **/
                _resetRepeatCount: function() {
                    console.log("[RecurrenceLayerHelper#_resetRepeatCount]");
                    this.getRepeatCountElement().val(this.repeatCount);
                    return this;
                }, 


                /**
                탭 변경 이벤트 콜백

                @method _changeTab
                @private
                **/
                _changeTab: function(e) {
                    var $target = $(e.currentTarget), 
                        type = $target.attr("data-freq");

                    if($target.hasClass("on")) return;
                    
                    // datepicker가 열린채로 탭이 변경될때 datepicker의 포커스가 영구적으로 해제되지 않아 
                    // datepicker가 다시 호출되지 않아서 강제로 포커스 초기화해야 함.
                    this._resetFocus();
                    this._toggleTabs(type);
                    this._changeIntervalPostfix(type);
                    this._setRecurrencePeriodOptions(type);
                    this._changeInterval();
                },
                
                /**
                포커스 초기화
                    
                @method _resetFocus
                @private
                **/
                _resetFocus: function() {
                    this.getUntilDateElement().blur();
                    this.getIntervalElement().focus();
                    return this;
                }, 

                _changeIntervalPostfix: function(type) {
                    this.popupEl.find("#recurrence-interval-postfix").text(INTERVAL_POSTFIX[type]);
                }, 

                /**
                탭 on/off 설정

                @method _toggleTabs
                @private
                **/
                _toggleTabs: function(freq) {
                    var selectorLI = "div.go_popup ul.tab_nav li";
                    $(selectorLI).removeClass("on");
                    $(selectorLI).each(function(i, element) {
                        if($(element).attr("data-freq") === freq) $(element).addClass("on");
                    });
                }, 

                /**
                매주마다 체크박스 HTML 반환

                @method _buildWeeklyPeriodOptTpl
                @return {String} 체크박스 HTML 반환
                @private
                **/
                _buildWeeklyPeriodOptTpl: function() {
                    var html = [], 
                        compiledTpl = '', 
                        dayOfstartDate = this.startDate.day();

                    compiledTpl = Hogan.compile([
                        '<span class="wrap_option">', 
                        '<input id="week-byday-{{code}}" name="week_byday_{{code}}" type="checkbox" value="{{code}}"{{#checked?}} checked="checked"{{/checked?}}>', 
                        '<label for="week-byday-{{code}}">{{label}}</label>', 
                        '</span>'
                    ].join("\n"));

                    _.each(_.pairs(WEEKDAY_SHORT), function(weekhash, indexOfday) {
                        var markup = "", 
                            checked = false;

                        if(this.recurrenceParser.get("BYDAY")) {
                            var regexp = new RegExp(WEEKDAY_VERY_SHORT[weekhash[0]]);
                            if (!_.isUndefined(this.day)) {
                            	if (indexOfday == dayOfstartDate) {
                            		checked = true;
                            	} else {
                            		checked = false;
                            	}                            	
                            } else {
                            	checked = regexp.test(this.recurrenceParser.get("BYDAY"));                            	
                            }
                        } else {
                            checked = !!(dayOfstartDate === indexOfday);
                        }

                        markup = compiledTpl.render({
                            "code": weekhash[0], 
                            "label": weekhash[1], 
                            "checked?": checked
                        });
                        html.push(markup);
                    }, this);

                    return html.join(HOR_SPACER);
                }, 

                /**
                매월마다 라디오버튼 HTML 반환

                @method _buildMonthlyPeriodOptTpl
                @return {String} 라디오박스 HTML 반환
                @private
                **/
                _buildMonthlyPeriodOptTpl: function() {
                    var markup = '', 
                        compiledTpl = '', 
                        monthday = this.startDate.format("D"), 
                        nthDayOfMonth = GO.util.getNthDayOfMonth(this.startDate), 
                        weekdayVeryShort = _.values(WEEKDAY_VERY_SHORT)[this.startDate.day()], 
                        strday = _.values(WEEKDAY)[this.startDate.day()];

                    compiledTpl = Hogan.compile([
                        '<span class="wrap_option">', 
                        '<input id="date-of-startdate" name="month_byday" type="radio" value="{{dateOfstartDate}}"{{#date_checked?}} checked="checked"{{/date_checked?}}>', 
                        '<label for="date-of-startdate">{{label.date_of_startdate}}</label>', 
                        '</span>',
                        HOR_SPACER,
                        '<span class="wrap_option">', 
                        '<input id="weekday-of-startdate" name="month_byday" type="radio" value="{{weekday_code}}"{{#weekday_checked?}} checked="checked"{{/weekday_checked?}}>', 
                        '<label for="weekday-of-startdate">{{label.nth_weekday}}</label>',
                        '</span>'
                    ].join("\n"));

                    markup = compiledTpl.render({
                        "dateOfstartDate": monthday, 
                        "date_checked?": this.recurrenceParser.has("BYMONTHDAY"), 
                        "weekday_code": nthDayOfMonth + weekdayVeryShort, 
                        "weekday_checked?": this.recurrenceParser.has("BYDAY"), 
                        "label": {
                            "date_of_startdate": GO.i18n(calLang["{{monthday}}일"], "monthday", monthday), 
                            "nth_weekday": GO.i18n(calLang["{{nth}}번째 {{weekday}}"], {"nth": nthDayOfMonth, "weekday": strday})
                        }
                    });

                    return markup;
                }
            }

            return constructor;
        })();

        function createRecurIntervalOptions( selected ) {
            var html = [];
            for( var i = 1; i < 31; i++ ) {
                html.push('<option value="' + i + '"');
                if( i === parseInt(selected) ) {
                    html.push(' selected="selected"');
                }
                html.push('>' + i + '</option>' + "\n");
            }
            
            return html.join('');
        }
        
        return RecurrenceLayerHelper;
    });

}).call();