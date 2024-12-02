var HistoryControl = function(callbackFunc) {
	this.historyIdx = 0;
	this.History = window.History;
	this.History.Adapter.bind(window,'statechange',function() {
		callbackFunc(this.History.getState());
	});
	this.setHistory = function(data) {
		data.state = this.historyIdx;
		this.historyIdx++;
		this.History.pushState(data, TITLENAME, "?state="+this.historyIdx);
	};
	this.getHistoryIndex = function() {
		return this.historyIdx;
	};
};

var ActionLoader = {};
ActionLoader.postLoadAction = function(action,param,afterFunc,dataType){
	jQuery.post(action,param,function(data,textStatus){		
		afterFunc(data,textStatus);		
	},dataType);	
};
ActionLoader.getLoadAction = function(action,param,afterFunc,dataType){
	jQuery.get(action,param,function(data,textStatus){		
		afterFunc(data,textStatus);		
	},dataType);	
};

ActionLoader.requestGoLoadAction = function(type, contentType,async,action,param,afterFunc,dataType,errorFunc){
	ActionLoader.isloadAction = true;
	jQuery.ajax({
		type:type,
		contentType : contentType,
		url : action,
		data: param,
		async: async,
		success : function(result) {
			afterFunc(result.data);
		},
		error: function(xhr) {
			var respObj = JSON.parse(xhr.responseText);
			if (respObj.code == "401") {
				if(BASECONFIG.data.useOtp || BASECONFIG.data.useCert){
					var url = xhr.getResponseHeader('Location');
					if(url == null){
						window.location = window.location.href;
					}else{
						window.location = url;
					}
		    	}else{
		    		window.location = "/";
		    	}
			} else {
				if (errorFunc) {
					errorFunc(respObj);
				} else {
					alert(respObj.message);					
				}
			}
		}, 
		dataType: dataType
	});	
};

var formContentType = "application/x-www-form-urlencoded; charset=UTF-8";
var jsonContentType = "application/json; charset=UTF-8";
ActionLoader.getGoLoadAction = function(action,param,afterFunc,dataType,errorFunc){
	ActionLoader.requestGoLoadAction("GET",formContentType,true,action,param,afterFunc,dataType,errorFunc);
};

ActionLoader.getSyncGoLoadAction = function(action,param,afterFunc,dataType,errorFunc){
	ActionLoader.requestGoLoadAction("GET",formContentType,false,action,param,afterFunc,dataType,errorFunc);
};

ActionLoader.postGoLoadAction = function(action,param,afterFunc,dataType,errorFunc){
	ActionLoader.requestGoLoadAction("POST",formContentType,true,action,param,afterFunc,dataType,errorFunc);
};

ActionLoader.postGoJsonLoadAction = function(action,param,afterFunc,dataType,errorFunc){
	ActionLoader.requestGoLoadAction("POST",jsonContentType,true,action,JSON.stringify(param),afterFunc,dataType,errorFunc);
};

ActionLoader.postSyncGoLoadAction = function(action,param,afterFunc,dataType,errorFunc){
	ActionLoader.requestGoLoadAction("POST",formContentType,false,action,param,afterFunc,dataType,errorFunc);
};

ActionLoader.postSyncGoJsonLoadAction = function(action,param,afterFunc,dataType,errorFunc){
	ActionLoader.requestGoLoadAction("POST",jsonContentType,false,action,JSON.stringify(param),afterFunc,dataType,errorFunc);
};

ActionLoader.putGoJsonLoadAction = function(action,param,afterFunc,dataType,errorFunc){
	ActionLoader.requestGoLoadAction("PUT",jsonContentType,true,action,JSON.stringify(param),afterFunc,dataType,errorFunc);
};

function makeTopMenuTitle(title) {
	jQuery("#top_menu_title").text(title);
}

function initLayoutSize() {
	var wH = jQuery(window).height();
	var dH = jQuery(document).height();
    var hOH = jQuery("header.go_header div.nav").height();
//	jQuery("#go_body").css({"height":"auto","min-height":wH-hOH-3});
	jQuery("#go_body").css({"height":"auto","min-height":wH-hOH});

	var wH = jQuery(window).height();
	var hOH = jQuery("header.go_header div.nav").height();
	if (MOBILE_WEB) {
		var hOF = jQuery("footer").height();
		wH = (isAndroid()) ? wH - hOF - hOH : wH - hOH;
		jQuery("#mail_folder_side").css({"top" : hOH+"px","height" : wH+"px"});
	} else {
		jQuery("#mail_folder_side").css({"top" : hOH+"px","height" : dH-hOH-1+"px"});
	}
	
	jQuery("#top_menu_title").on("click",function() {
		gotoMailHome();
	});
}

var IscrollControl = function(id, opt) {
	var _this = this;
	this.topOffset = (opt.topOffset) ? opt.topOffset : 0;
	this.mainTop = (opt.mainTop) ? opt.mainTop : 88;
	this.pullUpDownUse = (opt.pullUpDownUse) ? opt.pullUpDownUse : false;
	this.bounce = (opt.bounceBlock) ? false : true;
	this.clickStyle = (opt.clickStyle) ? true : false;
	this.zoom = (opt.zoom) ? true : false;
	this.$obj = jQuery("#"+id);
	this.myScroll = null;
	this.pullUpEl = null;
	this.pullDownEl = null;
	this.pullDownOffset = 0;
	this.pullUpOffset = 0;
	
	this.makeIscroll = function() {
		_this.destroyIscroll();
		_this.$obj.css({
			'position' : 'absolute',
			'top' : _this.mainTop+'px',
			'bottom' : '15px',
			'left' : '0',
			'padding-bottom' : '10px',
			'width' : '100%',
			'overflow' : 'hidden'
		});
		
		this.makePullUpDownTmpl();
		
		this.myScroll = new iScroll(id, {
			useTransition: true,
			topOffset: _this.topOffset || 0,
			bounce: _this.bounce,
			clickStyle: _this.clickStyle,
			zoom:_this.zoom,
			onBeforeScrollStart: function (e) {
		        var target = e.target;
		        while (target.nodeType != 1) target = target.parentNode;
		        if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
		        e.preventDefault();
		    },
			onRefresh: function () {
				if(_this.pullUpDownUse){
					/*
	    			if (_this.pullDownEl.hasClass("loading")) {
	    				_this.pullDownEl.removeClass("loading");
	    				_this.pullDownEl.find('span.pullDownLabel').text(mailMsg.mail_mobile_pulldown_touchstart);
	    			} else */if (_this.pullUpEl.hasClass("loading")) {
	    				_this.pullUpEl.removeClass("loading");
	    				_this.pullUpEl.find('span.pullUpLabel').text(mailMsg.mail_mobile_pullup_touchstart);
	    			}
				}
			},        	 
			onScrollMove: function () {
				if(_this.pullUpDownUse){
					/*
	    			if (this.y > 5 && !_this.pullDownEl.hasClass('flip')) {
	    				_this.pullDownEl.addClass('flip');
	    				_this.pullDownEl.find('span.pullDownLabel').text(mailMsg.mail_mobile_pulldown_touchend);
	    				this.minScrollY = 0;
	    			} else if (this.y < 5 && _this.pullDownEl.hasClass('flip')) {
	    				_this.pullDownEl.removeClass("flip");
	    				_this.pullDownEl.find('span.pullDownLabel').text(mailMsg.mail_mobile_pulldown_touchstart);
	    				this.minScrollY = -_this.pullDownOffset;
	    			} else*/ if (this.y < (this.maxScrollY - 5) && !_this.pullUpEl.hasClass('flip')) {
	    				_this.pullUpEl.addClass('flip');
	    				_this.pullUpEl.find('span.pullUpLabel').text(mailMsg.mail_mobile_pullup_touchend);
	    				this.maxScrollY = this.maxScrollY;            				
	    			} else if (this.y > (this.maxScrollY + 5) && _this.pullUpEl.hasClass('flip')) {
	    				_this.pullUpEl.removeClass("flip");
	    				_this.pullUpEl.find('span.pullUpLabel').text(mailMsg.mail_mobile_pullup_touchstart);
	    				this.maxScrollY = _this.pullUpOffset;
	    			}
				}
			},
			onScrollEnd: function () {
				if(_this.pullUpDownUse){
					/*
	    			if (_this.pullDownEl.hasClass('flip')) {
	    				_this.pullDownEl.removeClass('flip').addClass('loading');
	    				_this.pullDownEl.find('span.pullDownLabel').text(mailMsg.mail_mobile_loading);				
	    				if (opt.downAction) opt.downAction();
	    			} else*/ if (_this.pullUpEl.hasClass('flip')) {
	    				_this.pullUpEl.removeClass('flip').addClass('loading');
	    				_this.pullUpEl.find('span.pullUpLabel').text(mailMsg.mail_mobile_loading);				
	    				if (opt.upAction) opt.upAction();
	    			}
				}
			}
		});
		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
	};
	this.scrollToTop = function() {
		if (this.myScroll)  {
			this.myScroll.scrollTo(0, 0, 0);
		}
    },
    this.scrollToBottom = function() {
    	if (this.myScroll)  {
    		this.myScroll.scrollTo(0, this.myScroll.maxScrollY, 0);
    	}
    },
	this.refreshIscroll = function() {
		if (this.myScroll)  {
			this.makePullUpDownTmpl();
			this.myScroll.refresh();
		} else {
			this.makeIscroll();
		}
	};
	this.destroyIscroll = function() {
		if (this.myScroll)  {
			this.myScroll.destroy();
			this.myScroll = null;
			/*
			jQuery("#"+id+"_pullDown").remove();
			*/
			jQuery("#"+id+"_pullUp").remove();
			_this.$obj.removeAttr("style");
		}
	};
	this.getIscrollObj = function() {
		return this.myScroll;
	};
	this.getPullUpObj = function() {
		return jQuery("#"+id+"_pullUp");
	};
	this.makePullUpDownTmpl = function() {
		if(_this.pullUpDownUse){
			/*
			if(!jQuery("#"+id+"_pullDown").length) {
				_this.$obj.find("div.iscroll").prepend('<div id="'+id+'_pullDown" class="pullDown"><span class="pullDownIcon"></span><span class="pullDownLabel">'+mailMsg.mail_mobile_pulldown_touchstart+'</span></div>');
			}
			_this.pullDownEl = jQuery("#"+id+"_pullDown");
			_this.pullDownOffset = _this.pullDownEl && _this.pullDownEl.length > 0 ? _this.pullDownEl[0].offsetHeight : 0;
	    	*/
	    	if(!jQuery("#"+id+"_pullUp").length) {
	    		_this.$obj.find("div.iscroll").append('<div id="'+id+'_pullUp" class="pullUp" style="display:none"><span class="pullDownIcon"><span class="pullUpIcon"></span><span class="pullUpLabel">'+mailMsg.mail_mobile_pullup_touchstart+'</span></div>');
			}
	    	_this.pullUpEl = jQuery("#"+id+"_pullUp");
	    	_this.pullUpOffset = _this.pullUpEl && _this.pullUpEl.length > 0 ? _this.pullUpEl[0].offsetHeight : 0;
		}
	};
};

jQuery.fn.refreshIscroll = function(scrollObj) {
	if (scrollObj) {
		scrollObj.refresh();
	} else {
		var opt = jQuery(this).data("opt");
		scrollObj = jQuery(this).makeIscroll(opt);
	}
	return scrollObj;
};

function isAndroid() {
	return checkOS() == "android";
}

function isIphone() {
	return checkOS() == "iphone";
}

function isIpad() {
	return checkOS() == "ipad";
}

function checkOS(){
    var ua = window.navigator.userAgent.toLowerCase();
    if(ua.indexOf("android") > -1)
        return "android";
    else if (ua.indexOf("iphone") > -1)
        return "iphone";
    else if(ua.indexOf("ipad") > -1)
        return "ipad";
    else
        return -1;
}

function isAndroidApp(){
    return isMobileApp() && checkOS() == 'android';
}

function isIphoneApp(){
    return isMobileApp() && (checkOS() == "iphone" || checkOS() == "ipad");
}

function isMobileApp() {
    var goAgent_device = sessionStorage.getItem("GO-Agent-mail");
    return (goAgent_device == "GO-Android" || goAgent_device == "GO-iPhone");
}
