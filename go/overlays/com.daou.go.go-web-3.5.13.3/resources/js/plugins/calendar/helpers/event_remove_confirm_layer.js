(function() {
    define([
        "jquery",
        "underscore", 
        "calendar/libs/util", 
        "hgn!calendar/templates/_event_remove", 
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar", 
        "jquery.go-popup",
        "jquery.go-preloader"
        ],

    function(
        $,
        _, 
        CalUtil, 
        Template, 
        commonLang, 
        calLang
    ) {
        var EventRemoveConfirmLayer = (function() {
            var constructor = function(model, type, forceRecur) {
                if(!_.contains(['leave', 'remove', 'update'], type)) throw new Error("잘못된 인자입니다.");
                
                this.model = model;
                this.isRecurrence = typeof forceRecur === 'undefined' ? !!this.model.get("recurrence") || false : forceRecur;
                this.type =  type;
                this.callbacks = {};
                
                this.removeDescMsg = calLang["일정을 삭제하시면 모든 참석자의 일정에서 사라집니다. 참석자에서 빠지고 싶다면, 참석자 정보를 수정하세요"];
                if(this.model.isCompanyEvent()){
                	this.removeDescMsg = calLang["전사일정 삭제 메시지"];	
                } else if(this.model.isAlone()) {
                	this.removeDescMsg = calLang["나혼자 일정 삭제 메시지"];
                }
                
                this.template = Template({
                    "recurrence?": this.isRecurrence, 
                    "remove?": this.isRemoveType(), 
                    "leave?": this.isLeaveType(),
                    "update?": this.isUpdateType(), 
                    "label": {
                        "remove_only": this.isRemove ? calLang["이 일정만 삭제"]: calLang["이 일정만 수정"],
                        "remove_after": this.isRemove ? calLang["이 일정부터 이후 일정 모두 삭제"]: calLang["이 일정부터 이후 일정 모두 수정"],
                        "remove_all": this.isRemove ? calLang["전체 반복 일정 삭제"]: calLang["전체 반복 일정 수정"]
                    }, 
                    "msg": {
                        "remove_desc": this.removeDescMsg, 
                        "leave_desc": calLang["참석자에서 빠지면 내 일정에서 노출되지 않습니다. 하지만, 다른 참석자의 일정에서는 해당 일정이 계속 보여집니다.위 일정의 참석자에서 빠지시겠습니까?"], 
                        "recurrence_notice": calLang["현재 '반복일정'으로 등록되어 있습니다."]
                    }
                });
            };

            constructor.prototype = {
                render: function() {
                    var classname = {'leave': "layer_entry", 'remove': "layer_schedule_del", 'update': "layer_schedule_repeat"}[this.type],  
                        headerTitle = {'leave': calLang["참석자에서 빠지기"], 'remove': calLang["일정 삭제"], 'update': calLang['반복 일정 수정']}[this.type];
                        
                    this.popupEl = $.goPopup({
                        pclass: 'layer_normal ' + classname,
                        width: -1, 
                        header: headerTitle,
                        contents: this.template,
                        closeCallback: $.proxy(this._close, this), 
                        buttons : [
                            { btype : 'confirm', btext : commonLang["확인"], callback: $.proxy(this._confirm, this), autoclose : false }, 
                            { btype : 'cancel', btext : commonLang["취소"], callback: $.proxy(this._cancel, this) }
                        ]
                    });
                }, 

                setRecurrence: function(bool) {
                    this.isRecurrence = bool;
                    return this;
                }, 
                
                setCallbacks: function(obj) {
                    $.extend(true, this.callbacks, obj || {});
                }, 
                
                isRemoveType: function() {
                    return this.type === 'remove';
                }, 
                
                isLeaveType: function() {
                    return this.type === 'leave';
                }, 
                
                isUpdateType: function() {
                    return this.type === 'update';
                }, 

                _confirm: function() {
                    var preloader = $.goPreloader();
                    preloader.render();
                    var self = this,
                    	options = $.extend(true, {
	                        success: function(model, resp) {
                                preloader.release();
                                self.popupEl.close();
	                            CalUtil.goToCalendar();
	                        },
                            error:function() {
                                preloader.release();
                            }
	                    }, this.callbacks);
                    
                    if(this.isRecurrence) { 
                        var checkedOpt = $(this.popupEl).find("input[name=remove_option]:checked"), 
                            checkedOptVal = checkedOpt.val();
                        
                        if(checkedOpt.length <= 0) { 
                            $.goError(calLang["수정(삭제) 옵션을 선택해 주십시오"]);
                            return this;
                        }
                                                
                        this.model.setRecurChangeType(checkedOptVal);
                    }
                    
                    if(this.isRemoveType()) {
                        this.model.destroy(options);
                    } else {
                        this.model.save({}, options);
                    }
                    
                    return this;
                }, 
                
                _cancel: function() {
                    if(this.callbacks.hasOwnProperty('complete')) {
                        this.callbacks.complete.call(this);
                    }
                }
            };

            return constructor;
        })();

        return EventRemoveConfirmLayer;
    });
}).call(this);