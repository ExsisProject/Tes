// 모바일전용.
(function() {
    // TODO: calendar 내의 다국어를 common으로 이동
    define([
        "jquery", 
        "hogan", 
        "app", 
        "i18n!calendar/nls/calendar", 
        
        "jquery.ui"
    ], 

    function(
        $, 
        Hogan, 
        GO, 
        calLang
    ) {
        var // 상수 정의
            DEFAULT_STEP_MINUTES = 30,
            FORM_TYPE = {regist: "regist", detail: "detail"}, 
            FORMAT_DATETIME = "YYYY-MM-DD HH:mm", 
            FORMAT_DATE = "YYYY-MM-DD", 
            FORMAT_TIME = "HH:mm",
            compiledOptTimeTpl, 
            PeriodPicker;
        
        function compileOptionTimeTpl() {
            var html = [], compiled;
            html.push('<option value="{{option_value}}"{{#selected?}} selected="selected"{{/selected?}}{{#disabled?}} disabled="disabled"{{/disabled?}}>');
            html.push('{{option_label}}{{duration}}');
            html.push('</option>');
            
            return Hogan.compile(html.join("\n"));
        }
        compiledOptTimeTpl = compileOptionTimeTpl();

        PeriodPicker = (function() {
            var contsturctor = function(startDate, startTime, endDate, endTime, options) {
                console.log("[DatepickerHelper#constructor] called");
                
				this.options = options || {};
                this.startDate = startDate; 
                this.startTime = startTime; 
                this.endDate = endDate;
                this.endTime = endTime;
                
                this.stepOfMinutes = this.options.stepOfMinutes || DEFAULT_STEP_MINUTES;
                
                // TODO 임시(시작일, 종료일 연관되어 변경될 때 종료일이 변경되기 전에 데이터를 받아가는 현상에 대한 임시조치
                this.afterChangeCallbacks = $.Callbacks();

                this._initData();
                this._bindDatepicker();
                this.delegateEvents();
                
                this.sourceData = {
                    'startDate': this.startDate.val(), 
                    'startTime': this.startTime.val(), 
                    'endDate': this.endDate.val(), 
                    'endTime': this.endTime.val()
                };                
            };

            contsturctor.prototype = {
                /**
                이벤트 바인딩(delegate)

                @method delegateEvents
                */ 
               delegateEvents: function() {
                   this.undelegateEvents();
                   this.startDate.on("change:startdate", $.proxy(this._bindChangeStartDate, this));
                   this.startTime.on("change.datepicker", $.proxy(this._bindChangeStartTime, this));
                   this.endDate.on("change:enddate", $.proxy(this._bindChangeEndDate, this));
                   this.endTime.on("change.datepicker", $.proxy(this._bindChangeEndTime, this));
                   return this;
                },
                
                undelegateEvents: function() {
                    this.startDate.off("change:startdate");
                    this.startTime.off(".datepicker");
                    this.endDate.off("change:enddate");
                    this.endTime.off(".datepicker");
                    return this;
                }, 
                
                /**
                시간 선택옵션 분당 간격 설정(기본값: 30분)

                @method setStepOfMinutes
                */                
                setStepOfMinutes: function(newStep) {
                    this.stepOfMinutes = newStep;
                    return this;
                }, 
                
                /**
                시간 선택박스 업데이트

                @method updateSelectedTime
                @private
                @chainable
                */ 
                updateSelectedTime: function( startTime, endTime ) {
                    var newStartTime = GO.util.getIntervalTime(startTime, this.stepOfMinutes);
                    if(typeof endTime === 'undefined') {
                        endTime = newStartTime.clone().add('hours', 1);
                    }
                    
                    this.startTime.attr("data-prev", newStartTime.format(FORMAT_TIME));
                    this.startTime.empty().html(this._buildStartTimeOptions());
                    this.endTime.empty().html(this._buildEndTimeOptions(endTime));
                    
                    return this;
                }, 
                
                getCurrentTimeInfo: function() {
                    return {
                        "startTime": this.startDate.val() + 'T' + this.startTime.val() + ':00', 
                        "endTime": this.endDate.val() + 'T' + this.endTime.val() + ':00'
                    };
                }, 
                
                reset: function() {
                    this.startDate.val(this.sourceData.startDate);
                    this.startTime.val(this.sourceData.startTime);
                    this.endDate.val(this.sourceData.endDate);
                    this.endTime.val(this.sourceData.endTime);

                    this.startDate.attr('data-prev', this.sourceData.startDate);
                    this.startTime.attr('data-prev', this.sourceData.startTime);
                    this.endDate.attr('data-prev', this.sourceData.endDate);
                    this.endTime.attr('data-prev', this.sourceData.endTime);
                }, 
                
                afterChanged: function(callback) {
                    this.afterChangeCallbacks.add(callback);
                }, 

                /**
                데이터 초기화

                @method _initData
                @private
                @chainable
                */ 
                _initData: function() {
                    var valueOfEndDate = this.endDate.val(), 
                        valueOfEndTime = this.endTime.attr("data-prev"), 
                        endDatetime = GO.util.toMoment([valueOfEndDate, valueOfEndTime].join(" "), FORMAT_DATETIME);

                    this.startTime.empty().html(this._buildStartTimeOptions());
                    this.endTime.empty().html(this._buildEndTimeOptions(endDatetime));
                    return this;
                }, 

                /**
                timeslots 생성 함수
                    시간 선택박스 생성을 위해 지정된 스텝 간격(분 기준)으로 타입스롯을 생성한다.

                @method _buildTimeSlots
                @private
                */ 
                _buildTimeSlots: function(selectedTime) {
                    var cursorTime = GO.util.now().startOf('days'), 
                        timeslots = new Array(60 / this.stepOfMinutes * 24);
                    var term = selectedTime.split(":")[1];
                    cursorTime.add("minutes", parseInt(term));
                    
                    for(var i=0, len = timeslots.length; i<len; i++) {
                        timeslots[i] = { "time": cursorTime.format(FORMAT_TIME) };
                        cursorTime.add('minutes', this.stepOfMinutes);
                    }

                    if(!_.where(timeslots, {"time" : selectedTime}).length) {
                        timeslots.push({"time": selectedTime});
                        timeslots = _.sortBy(timeslots, function(obj) {
                            return parseInt(('' + obj.time).replace(":", ""));
                        });
                    }
                    
                    return timeslots;
                }, 

                /**
                Datepicker 연결

                @method _bindDatepicker
                @private
                */ 
                _bindDatepicker: function() {
                    var $from = this.startDate, 
                        $to = this.endDate;

                    $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
                    $from.datepicker({
                        dateFormat: "yy-mm-dd", 
                        changeMonth: true,
                        changeYear: true,
                        minDate: this.options.minDate ? this.options.minDate : null,
                        yearSuffix: "",
                        onClose: function( selectedDate ) {
                            if(selectedDate) $from.trigger("change:startdate", [selectedDate]);
                        }
                    });

                    $to.datepicker({
                        dateFormat: "yy-mm-dd",
                        changeMonth: true,
                        changeYear: true,
                        minDate: $from.val(), 
                        yearSuffix: "",
                        onClose: function( selectedDate ) {
                            if(selectedDate) $to.trigger("change:enddate", [selectedDate]);
                        }
                    });
                }, 

                /**
                시작일자와 종료일자 제약조건에 따라 설정

                @method _processDateConstraint
                @private
                @chainable
                */
                _processDateConstraint: function() {
                    var valueOfStartDate = this.startDate.val(), 
                        valueOfEndDate = this.endDate.val(), 
                        prevStartDate = this.startDate.attr("data-prev"), 
                        maxStartDate = '', 
                        changedEndtime = null;
                    
                    if(valueOfEndDate) {
                        var startDatetime = GO.util.toMoment(valueOfStartDate + " " + this.startTime.find('option:selected').val(), FORMAT_DATETIME), 
                            prevStartDatetime = GO.util.toMoment(prevStartDate + " " + this.startTime.attr('data-prev'), FORMAT_DATETIME), 
                            endDatetime = moment(valueOfEndDate + " " + this.endTime.find('option:selected').val(), FORMAT_DATETIME), 
                            diffMinutes = endDatetime.diff(prevStartDatetime, 'minutes');

                        changedEndtime = startDatetime.clone().add('minutes', diffMinutes);
                        maxStartDate = changedEndtime.format(FORMAT_DATE);
                    } else {
                        maxStartDate = GO.util.toMoment(valueOfStartDate).format(FORMAT_DATE);
                    }

                    // 종료일자 변경
                    this.endDate.datepicker('setDate', maxStartDate);
                    // 종료시간 선택 옵션 변경
                    this.endTime.empty().html(this._buildEndTimeOptions(changedEndtime));
                    // 종료일자 minDate 옵션 변경
                    this.endDate.datepicker('option', 'minDate', valueOfStartDate);
                    
                    return this;
                }, 
                
                /**
                시작일자 변경
                    변경된 시작일자에 따라 시작일시 선택옵션이 변경된다.
                        - 시작일자가 오늘이면 현재 시간을 기준으로 제일 가까운 STEP 값 선택(현재는 30분 간격)
                        - 시작일자가 오늘이 아니면 00:00 분 선택
                    시작일자가 변경되면 종료일자가 조건에 따라 변경되어야 한다.
                        - 종료일자가 지정되지 않았으면 시작일자에 +1시간 된 값을 종료일자로 설정
                        - 종료일자가 지정되어 있으면 이전 시작일자와 종료일자의 기간을 구하여 변경된 시작일자를 기준으로 종료일자 계산하여 설정
                    duration 표시는 시작일자와 종료일자가 같을 경우에만 해당되며, 시작시간 이후의 시간부터 표시된다.

                @method _bindChangeStartDate
                @private
                */
                _bindChangeStartDate: function(e, selectedDate) {
                    // 선택된 시작일자에 따라 시작시간 선택옵션 변경
                    this.startTime.empty().html(this._buildStartTimeOptions());
                    this._processDateConstraint();
                    this.startDate.attr('data-prev', this.startDate.val());
                    this.afterChangeCallbacks.fire();
                    return this;
                }, 
                
                /**
                시작시간 변경 이벤트 콜백

                @method _bindChangeStartTime
                @private
                @chainable
                */
                _bindChangeStartTime: function(e) {
                    var $target = $(e.currentTarget);
                    this._processDateConstraint();
                    $target.attr("data-prev", $target.find("option:selected").val());
                    this.afterChangeCallbacks.fire();
                    return this;
                }, 

                /**
                종료일자 변경

                @method _bindChangeEndDate
                @private
                */
                _bindChangeEndDate: function(e, selectedDate) {
                    var selectedDatetime = moment(selectedDate + " " + this.endTime.find("option:selected").val(), FORMAT_DATETIME);
                    // 종료시간 선택 옵션 변경
                    this.endTime.empty().html(this._buildEndTimeOptions(selectedDatetime));
                    // memoise
                    this.endDate.attr('data-prev', selectedDate);
                    this.afterChangeCallbacks.fire();
                    return this;
                }, 
                
                /**
                종료시간 변경 이벤트 콜백

                @method _bindChangeEndTime
                @private
                @chainable
                */
                _bindChangeEndTime: function(e) {
                    this.afterChangeCallbacks.fire();
                    return this;
                }, 

                /**
                시작시간 select options html 생성 함수

                @method _buildStartTimeOptions
                @private
                */
                _buildStartTimeOptions: function() {
                    var timeOpts = [], 
                        prevTime = this.startTime.attr('data-prev'), 
                        timeslots = this._buildTimeSlots(prevTime);
                    
                    for(var i=0,len=timeslots.length; i<len; i++) {
                        if(!timeslots[i]) continue;

                        var curTime = timeslots[i].time;
                        
                        timeOpts.push(compiledOptTimeTpl.render({
                            "option_value": curTime, 
                            "option_label": curTime, 
                            "selected?": !!(curTime === prevTime)
                        }));
                    }
                    return timeOpts.join("\n");
                }, 

                /**
                종료시간 select options html 생성 함수

                @method _buildStartTimeOptions
                @private
                */
                _buildEndTimeOptions: function(selectedDate) {
                    var timeOpts = [], 
                        startDate = this.startDate.val(), 
                        startTime = this.startTime.find("option:selected").val(), 
                        startDatetime = GO.util.toMoment(startDate + " " + startTime, FORMAT_DATETIME), 
                        endDate = this.endDate.val(), 
                        isSameDate = GO.util.isSameDate(startDate, endDate), 
                        selectedTime = selectedDate.format(FORMAT_TIME), 
                        timeslots = this._buildTimeSlots(selectedTime);
                    
                    for(var i=0,len=timeslots.length; i<len; i++) {
                        var curTime = timeslots[i].time, 
                            endDatetime = GO.util.toMoment(endDate + " " + curTime, FORMAT_DATETIME), 
                            diffHours = Math.floor(endDatetime.diff(startDatetime, 'hours', true) * 10) / 10, 
                            duration = null, 
                            disabled = false;

                        if(isSameDate && diffHours >= 0) duration = '(' + diffHours + calLang["시간"] + ')';
                        if(isSameDate && diffHours < 0) disabled = true;
                        
                        var markup = compiledOptTimeTpl.render({ 
                            "option_value": curTime, 
                            "option_label": curTime, 
                            "selected?": selectedTime === curTime, 
                            "disabled?": disabled, 
                            "duration": duration
                        });

                        timeOpts.push(markup);
                    }

                    return timeOpts.join("\n");
                }, 
                
                _getClosestSteppedTime: function(datetime, offset) {
                    return GO.util.getIntervalTime(datetime, this.stepOfMinutes);
                }
            };
            
            return contsturctor;
            
        })();

        return PeriodPicker;
    });

}).call(this);