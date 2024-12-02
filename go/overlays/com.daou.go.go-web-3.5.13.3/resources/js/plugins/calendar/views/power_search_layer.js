(function() {
    define([
        "jquery", 
        "underscore", 
        "app", 
        "calendar/libs/util", 
        "hgn!calendar/templates/power_search",
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar", 
        "jquery.ui", 
        "jquery.go-popup",
		"jquery.go-validation"
    ], 

    function(
        $, 
        _, 
        GO, 
        CalUtil, 
        Template, 
        commonLang, 
        calLang
    ) {
        var now = GO.util.toMoment(new Date), 
            tvars = {
                "maxlength": 200, 
                "label": {
                    "summary": calLang["일정명"], 
                    "category": calLang["일정 구분"], 
                    "all": calLang["전체"], 
                    "my_calendar": calLang["내 일정"], 
                    "follower": calLang["관심 캘린더"], 
                    "company_calendar": calLang["전사일정"], 
                    "attendee": calLang["참석자"], 
                    "period": calLang["기간"], 
                    "week": calLang["주일"], 
                    "month": calLang["개월"], 
                    "custom": calLang["직접선택"], 
                    "show_datepicker": calLang["달력보기"]
                }, 
                "msg": {
                    "attendee_input_rule": calLang["복수일 경우 콤마(,)로 구분"]
                }
            };

        var CalendarPowerSearchLayer = (function() {
            var constructor = function(options) {
                this.template = Template(_.extend({
                    start_date: GO.util.shortDate(now),
                    end_date: GO.util.shortDate(now)
                }, tvars));
                this.render(options);
                this.delegateEvents();
            };

            constructor.prototype = {
                render: function(poptions) {
                    var options = {
                        width: -1, 
                        modal: true, 
                        header: commonLang["상세검색"], 
                        pclass: "address_search_wrap", 
                        contents: this.template, 
                        closeCallback: $.proxy(this._release, this), 
                        callback : $.proxy(this._requestSearch, this)
                    }
                    if('offset' in poptions) options.offset = poptions.offset;
                    this.el = $.goSearch(options);
                    this.$el = $(this.el);
                    this._prepareDatepicker();

                    return this;
                }, 

                delegateEvents: function() {
                    this.undelegateEvents();
                    this.$el.on("keydown.calendar-power-search", "input.enable_enter", $.proxy(this._bindKeyboardEvent, this));
                    CalUtil.bindDatepickerIcon(this.$el, 'calendar-power-search');
                }, 

                undelegateEvents: function() {
                    this.$el.off(".calendar-power-search");
                }, 

                close: function() {
                    this.el.close($.proxy(this._release, this));
                }, 
                
                _bindKeyboardEvent: function(e) {
                    if(e.which === 13) { this._requestSearch(); }
                    return this;
                }, 

                _prepareDatepicker: function() {
                    var startDate = this.$el.find("#custom-start-date"), 
                        endDate = this.$el.find("#custom-end-date");

                    startDate.datepicker({
                        dateFormat: "yy-mm-dd", 
                        changeMonth: true,
                        changeYear: true,
                        yearSuffix: "",
                        onClose: function( selectedDate ) {
                            endDate.datepicker( "option", "minDate", selectedDate );
                        }
                    });
                    endDate.datepicker({ 
                        dateFormat: "yy-mm-dd",
                        changeMonth: true,
                        changeYear: true,
                        yearSuffix: "",
                        minDate: startDate.val()
                    });

                    return this;
                }, 

                _requestSearch: function() {
                    var reqData = GO.util.serializeForm(this.$el.find("#power-search"), false);
                    
                    _.map(reqData, function(val, key) {
                    	if(key === 'attendees') {
                    		val = val.replace(/(,\s*)/g, ",");
                    		val = val.replace(/(\s*,)/g, ",");
                    		reqData[key] = val;
                    	}
                    });

                    if(this.validate(reqData))  {
                        GO.router.navigate("calendar/search?" + GO.util.jsonToQueryString(reqData), {trigger: true, pushState: true});
                        this.close();
                    }
                    return this;
                }, 

                validate: function(data) {
                    var self = this, 
                        checkAllEmpty = true,
                        isInvalidChar = false; 

                    _.map(data, function(val, key) {
                        if(key !== 'stype' && !!val) checkAllEmpty &= false;
                        
                        // 날짜의 경우 ISO포맷으로 변환하여 설정한다.
                        if(key === 'fromDate' && val) {
                            data[key] = GO.util.toISO8601(GO.util.toMoment(val).startOf('day'));
                        }
                        if(key === 'toDate' && val) {
                            data[key] = GO.util.toISO8601(GO.util.toMoment(val).endOf('day'));
                        }
                        if($.goValidation.isInValidEmailChar(decodeURIComponent(val || ''))){
                        	isInvalidChar = true;
        				}
                    });
                    
                    // 모든 항목에 검색어가 없으면 검색되지 않도록 한다.
                    if(checkAllEmpty) {
                        $.goSlideMessage(commonLang["검색어를 입력하세요."],"caution");
                        return false;
                    }
                    
                    if(data.summary > 200) {
                        $.goMessage(GO.i18n(calLang["{{max}}자 이하로 입력해 주십시오"], {'max': 200}));
                        this.$el.find("#keyword-summary").focus();
                        return false;
                    }
                    
                    if(isInvalidChar){
                    	$.goMessage(commonLang['메일 사용 불가 문자']);
                    	return false;
                    }
                    
                    return true;
                }, 

                _release: function() {
                    this.undelegateEvents();
                }, 

                _showDatepicker: function(e) {
                    var $target = $(e.currentTarget);
                    if($target.val() === "custom") {
                        this.$el.find('#datepicker').show();    
                    } else {
                        this.$el.find('#datepicker').hide();
                    }
                    return this; 
                }                
            }; 

            return constructor;
        })();

        return CalendarPowerSearchLayer;
    });
}).call(this);