define("calendar/views/alarm_popup_layer", function(require){
    var $ = require("jquery");
    var _= require("underscore");
	var Backbone = require("backbone");
	
	var Tmpl = require("hgn!calendar/templates/alarm_popup_layer");
	
	var commonLang = require("i18n!nls/commons");
	var calLang= require("i18n!calendar/nls/calendar");
		
	var EventAlarmLayerView,
		contentTmpl = Hogan.compile(Tmpl),
		lang = {
			"pushNoti" : calLang["푸시알림"],
			"mailNoti" : calLang["메일알림"]
		};
	
	var EventAlarmLayerView = Backbone.View.extend({
    	
    	initialize : function() {   		
            this.callbacks = {
                "confirm" : { func: function() {}, context: this }, 
                "cancel"  : { func: function() {}, context: this }, 
                "close"   : { func: function() {}, context: this }
            };
    	},
    	
    	render : function(options) {
    		this._renderPopup(options);
    		this._bindEvents();
    		
    		return this.popupEl;
    	},
    	
    	/**
    	 * CallBack 관련 Function
    	 */
        setConfirmCallback: function(callback, context) {
            return this._setCallback("confirm", callback, context);
        }, 
        
        setCancelCallback: function(callback, context) {
            return this._setCallback("cancel", callback, context);
        }, 
        
        setCloseCallback: function(callback, context) {
            return this._setCallback("close", callback, context);
        }, 
        
        _confirm: function(popupEl) {
        	var callback = this._getCallback("confirm");
        	callback["func"].call(callback["context"], this);
        	return this;
        },
        
        _cancel: function() {
            var callback = this._getCallback("cancel");
            callback["func"].call(callback["context", this]);
            return this;
        },
        
        _close: function() {
        	if (this.popupEl) {
        		var callback = this._getCallback("close");
        		callback["func"].call(callback["context"]);
            }
            return this;
        },   	    	
        
        _getCallback: function(category) {
            return this.callbacks[category] || { func: function() {}, context: this };
        },
        
        _setCallback: function(category, callback, context) {
            if(!_.has(this.callbacks, category)) this.callbacks[category];
            this.callbacks[category]["func"] = callback;
            this.callbacks[category]["context"] = context || this;
            return this;
        },         

		_bindEvents : function() {
			this.popupEl.off("click", "input#chkbox_push");
			this.popupEl.off("click", "input#chkbox_mail");
			this.popupEl.on("click", "input#chkbox_push", $.proxy(this._checkNoti, this));
			this.popupEl.on("click", "input#chkbox_mail", $.proxy(this._checkNoti, this));
		},
    	
		_renderPopup: function(options) {
			var self = this,
				type = options.type || "web",
				pclass = undefined,
				headerText = undefined,
				titleText = undefined,
				width = "";
		
			if (type == "mobile") {
				pclass = "layer_transition";
				width = "320px";
				headerText = calLang["일정등록 알림 확인"];
			} else {
				pclass = "";
				width = "400px";
				titleText = calLang["일정등록 알림 확인"];
			}

			this.popupEl = $.goPopup({
				pclass : pclass,
				header : headerText,
				title : titleText,
    			modal : true,
                width : width,
                contents : this._evnetAlarmTmpl(type),
                message : "<br/><span class='txt'>" + calLang["일정등록에 대한 알림을 참석자에게 보냅니다."] + "</span>",
                closeCallback: $.proxy(this._close, this), 
                buttons : [
                    { btype : "confirm", btext : commonLang["보내기"], callback : $.proxy(this._confirm, this), autoclose : true},
                    { btype : "normal",  btext : calLang["보내지 않음"], callback : $.proxy(this._cancel, this), autoclose : true}
                ]    				
			});

			this.popupEl.find("input:checkbox[id='chkbox_push']").attr('checked', true);
		},
		
		_evnetAlarmTmpl : function(type) {
			var self = this,
				ptype = (type == "mobile") ? true : false;
			
			var tmplInfo = Tmpl({
				lang : lang,
				mobile : ptype
            });
			
            return tmplInfo;
		},
		
		_checkNoti : function() {
			var self = this,
				isPushChecked = this.popupEl.find("input:checkbox[id='chkbox_push']").is(":checked"),
				isMailChecked = this.popupEl.find("input:checkbox[id='chkbox_mail']").is(":checked");

			if (isPushChecked || isMailChecked) {
				this.popupEl.find(".btn_major_s").show();
			} else {
				this.popupEl.find(".btn_major_s").hide();
			}
		}, 

		
	});
	
	return EventAlarmLayerView;
});