define("calendar/views/event_form", function(require){
	
	var $ = require("jquery");
	var _ = require("underscore");
	var Backbone = require("backbone");
	var GO = require("app");
	var FormTemplate = require("hgn!calendar/templates/form.html"); 

    var EventForm = Backbone.View.extend({
        className: 'content_page schedule_form go_renew',  
        type: 'regist', 
        
        variables: {}, 
        
        events: {
            "click #all_day": "toggleAllday", 
            "click #check-recurrence": "showHideRecurrenceSetupLayer",
            "click recurrence-wrap .recur_delete": "removeRecurrence", 
            "click #recurrence-wrap .recur_edit": "editRecurrence", 
            "click #check-company-event": "checkCompanyEvent", 
            "click #attendee-list > li.creat": "showOrgSlider", 
            "keyup textarea": "textAreaExpand", 
            "change .date-changable": "changeEventTime"
        }, 
        
        initialize: function(options) {
        	this.options = options || {};
        	
        	this.type = this.options.type || 'regist';
            this.variables = getDefaultTemplateVariables();
            
            $.extend( true, this.variables, this.options.variables || {} );
            this.initRender();
        }, 
        
        initRender: function() {
            this.$el
                .empty()
                .append(FormTemplate(this.variables));
        }, 
        
        render: function() {
            
        }, 
        
        // Event Callbacks
        toggleAllday: function(e) {
            var $target = $(e.target);
            $selectDate = this.el.find("select.select_date");

            if($target.is(":checked")) {
                $selectDate.hide();
            } else {
                this.datepickerHelper.updateSelectedTime(new Date());
                $selectDate.show();
            }
        }, 
        
        showHideRecurrenceSetupLayer: function(e) {
            if( $('.reserved-asset-item').length > 0 ) {
                var self = this;
                this.removeReservedAssetItems({
                    confirm: function() {
                        $('.asset-reservation').each(function(i, el) {
                            var assetView = $(el).data('asset-view');
                            assetView.loadItems( true );
                        });
                        self.showHideAssetViews();
                        showLayer.call(self);
                    }, 
                    cancel: function() {
                        $(e.currentTarget).prop("checked", false);
                    }
                })
            } else {
                showLayer.call(this);
                this.showHideAssetViews();
            }
            
            function showLayer() {
                if(this.getRecurrenceCheckbox().is(":checked")) {
                    var startDate = $("#startDate").val(), 
                        recurHelper = new RecurrenceLayerHelper(startDate, this._getRecurrenceField().val()), 
                        offset = this.getRecurrenceCheckbox().offset();

                    offset["top"] = parseInt(offset["top"]) + 30;
                    
                    recurHelper.setConfirmCallback(function(code, text) {
                        this.getRecurrenceWrap().text('');
                        this.getRecurrenceTextWrap().text('');
                    }, this);
                    recurHelper.setCancelCallback(this._cancelUpdateRecurrence, this);
                    recurHelper.setCloseCallback(this._cancelUpdateRecurrence, this);
                    recurHelper.render(offset);
                } else {
                    this._removeRecurrence();
                }
            }
        }, 
        
        removeReservedAssetItems: function(callbacks) {
            var self = this;
            
            if(typeof callbacks.confirm !== 'function') {
                callbacks.confirm = function() {};
            }
            
            if(typeof callbacks.cancel !== 'function') {
                callbacks.cancel = function() {};
            }
            
            $.goPopup({
                "title": calLang["예약 취소"],
                "message": calLang["일정 변경시 자산 예약 취소 메시지"], 
                "modal": true, 
                "buttons": [{
                    "btext": commonLang["확인"],
                    "btype": "confirm", 
                    "callback": function() {
                        require( ["calendar/views/asset"], function( Asset ) {
                            Asset.cancelReservationAll().done(function() {
                                callbacks.confirm.call(self);
                            });
                        });
                    }
                }, {
                    "btext": commonLang["취소"],
                    "btype": "cancel", 
                    "callback": $.proxy(callbacks.cancel, this)
                }]
            });
        }, 
        
        showHideAssetViews: function() {                    
            if(!GO.isAvailableApp("asset")) return;
            
            if(isReservableAsset.call(this)) {
                $('#asset-list-row').show();
            } else {
                $('#asset-list-row').hide();
            }
            
            function isReservableAsset(timeInfo) {
                var timeInfo = this.datepickerHelper.getCurrentTimeInfo();
                if(!GO.util.isSameDate(timeInfo.startTime, timeInfo.endTime)) return false;
                if(this.el.find('#all_day').is(":checked")) return false;
                if(this.el.find('#check-recurrence').is(":checked")) return false;
                
                return true;
            }
        }, 
        
        getRecurrenceCheckbox: function() {
            return $('#check-recurrence');
        }, 
        
        getRecurrenceWrap: function() {
            return $('#recurrence-wrap input[name=recurrence]');
        }, 
        
        getRecurrenceTextWrap: function() {
            return $('#recurrence-text');
        }
    });
   
    function getDefaultTemplateVariables() {
        var formatToday = GO.util.toMoment(new Date).format("YYYY-MM-DD");
        
        return {
            "start_date": formatToday,  
            "start_time": "00:00", 
            "end_date": formatToday, 
            "end_time": "00:00", 
            "recurrence_code": "",
            "regist?": true, 
            "editable?": true, 
            "removable?": false, 
            "private?" : false, 
            "recurrence?": false, 
            "show_visibility?": true, 
            "show_attendees?": true, 
            "show_location?": true, 
            "show_description?": true, 
            "show_reminder?": true,
            "allday_event?": false, 
            "calendar_manager?": false, 
            "use_asset?": GO.isAvailableApp("asset"), 
            
            "label": {
                "title": calLang["일정명"], 
                "privacy": commonLang["비공개"], 
                "datetime": calLang["일시"], 
                "allday": calLang["종일"], 
                "recurrence": calLang["반복"], 
                "remove": commonLang["삭제"], 
                "public_event": calLang["전사일정"], 
                "attendees": calLang["참석자"], 
                "select_attendees": calLang["참석자 선택"], 
                "location": calLang["장소"], 
                "desc": commonLang["내용"], 
                "reminder": calLang["알람"], 
                "modify": commonLang["수정"], 
                "add_reminder": calLang["알람 추가"], 
                "confirm": commonLang["확인"], 
                "cancel": commonLang["취소"],
                "remove": commonLang["삭제"], 
                "goto_list": calLang["캘린더로 돌아가기"], 
                "leave_attendee": calLang["참석자에서 빠지기"], 
                "remove_event": calLang["일정 삭제하기"], 
                "reserving_asset": calLang["예약하기"],
                "comment" : commonLang["댓글"],
                "history" : commonLang["변경이력"]
            }, 
            
            "msg": {
                "private_event_info": calLang["비공개 일정은 참석자만 확인 가능합니다."], 
                "public_event_info": calLang["전사일정은 사용자 전체에게 보여집니다."]
            }
        };
    }
    
    return EventForm;
});