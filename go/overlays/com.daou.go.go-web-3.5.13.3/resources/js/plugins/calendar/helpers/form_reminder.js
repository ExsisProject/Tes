(function() {

    define([
        "jquery", 
        "app", 
        "hgn!calendar/templates/_regist_reminder", 
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar",
        
        "jquery.go-popup"
    ], 
    function(
        $,
        GO, 
        ReminderListTpl, 
        commonLang, 
        calLang
    ) {
        var // 상수 정의
            REMINDER_MAX_LENGTH = 5, 
            DEFAULT_VALUE = 30, 
            MAX_VALUE = 10000,
            REMINDER_TYPE = {"minute": "minute", "hour": "hour", "day": "day", "week": "week" }, 
            REMINDER_METHOD = {"noti": "notification", "email": "email"}, 
            aslice = Array.prototype.slice;

        var FormReminderHelper = (function() {

            var constructor = function(obj, reminders, editable) {
                this.reminders = reminders || [];
                this.editable = typeof editable === 'undefined' ? true: editable;

                this.el = obj;
                this.$el = $(this.el);
                this.count = 0;

                this.delegateEvents();
                this._initReminder(this.reminders);
            }

            constructor.prototype = {
                delegateEvents: function() {
                    this.$el.on("click.form-reminder", "li > .btn_wrap", $.proxy(this.removeReminder, this));
                    this.$el.on("keyup.form-reminder", "input[name^=reminder_value_]", $.proxy(this._validateTime, this));
                },
                    
                addReminder: function(value, type, method) {
                    var markup = "";

                    if(this.count >= REMINDER_MAX_LENGTH) {
                        $.goAlert(GO.i18n(calLang["알람 설정은 {{max}}개까지 가능합니다"], "max", REMINDER_MAX_LENGTH));
                        return;
                    }

                    markup = ReminderListTpl({
                        "reminder_index": this.count, 
                        "reminder_value": (value || "30"),
                        "editable?": this.editable, 
                        "type_minute?"  : !!(type === REMINDER_TYPE["minute"]), 
                        "type_hour?"    : !!(type === REMINDER_TYPE["hour"]), 
                        "type_day?"     : !!(type === REMINDER_TYPE["day"]), 
                        "type_week?"    : !!(type === REMINDER_TYPE["week"]), 
                        "method_noti?"  : !!(method === REMINDER_METHOD["noti"]), 
                        "method_email?" : !!(method === REMINDER_METHOD["email"]),

                        "label": {
                            "remove"        : commonLang["삭제"]  , 
                            "add_reminder"  : calLang["알람 추가"],
                            "type_minute"   : calLang["분전"]     , 
                            "type_hour"     : calLang["시간전"]   , 
                            "type_day"      : calLang["일전"]     , 
                            "type_week"     : calLang["주전"]     , 
                            "method_noti"   : calLang["푸시 알람"], 
                            "method_email"  : calLang["메일 알람"]
                        }
                    });
                    this.$el.append(markup);

                    this.calculateCount();
                    return this.$el.find(":last-child");
                }, 
                
                /**
                알람 갯수 계산
                    - this.count를 증가 혹은 감소하는 방식으로 했을 경우, 랜덤하게 계산오차가 발생하는 현상이 있어서 만든 함수

                @method calculateCount
                */ 
                calculateCount: function() {
                    this.count = this.$el.find('li').length;
                }, 

                getIndex: function(obj) {
                    return parseInt(this._getReminderLIElement(obj).attr("data-index"));
                }, 

                removeReminder: function(e) {
                    var liEl = this._getReminderLIElement(e.target);

                    $(liEl).remove();
                    this.calculateCount();
                    
                    this.$el.trigger("removed:reminder", [liEl, this.getIndex(e.target)]);
                }, 

                getReminderCount: function() {
                    return this.count;
                }, 

                on: function() {
                    var args = aslice.call(arguments);
                    return $.fn.on.apply(this.el, args);
                }, 

                off: function() {
                    var args = aslice.call(arguments);
                    return $.fn.off.apply(this.el, args);
                }, 

                _initReminder: function(reminders) {
                    for(var _i=0, len = reminders.length;_i<len; _i++) {    
                        var value = reminders[_i].time || "", 
                            type = reminders[_i].type || "", 
                            method = reminders[_i].method || "";
                        this.addReminder(value, type, method);
                    }
                },

                _getReminderLIElement: function(obj) {
                    return $(obj).parents('li');
                }, 
                
                _validateTime: function(e) {
                    var $target = $(e.currentTarget),
                        val = $target.val(), 
                        intVal = parseInt(val);

                    if(!/^[\-\+]?[\d\,]*\.?[\d]*$/.test(val) || intVal < 0) {
                        $target.val(DEFAULT_VALUE);
                        return false;
                    }
                    
                    if(intVal > MAX_VALUE) {
                        $target.val(MAX_VALUE);
                        return false;
                    }
                    
                    return true;
                }
            }
            
            constructor.DEFAULT_VALUE = DEFAULT_VALUE;
            constructor.MAX_VALUE = MAX_VALUE;
            constructor.REMINDER_MAX_LENGTH = REMINDER_MAX_LENGTH;
            constructor.REMINDER_TYPE = REMINDER_TYPE; 
            constructor.REMINDER_METHOD = REMINDER_METHOD;

            return constructor;
        })();

        return FormReminderHelper
    });
}).call(this);