jQuery.fn.makeUploadFrame = function(name){	
	var hframe = jQuery(this);
	hframe.empty();
	hframe.html("<iframe name='"+name+"' id='"+name+"' src='about:blank' frameborder='0' width='1' height='1' style='width:1px;height:1px;'></iframe>");
};

function innerHtml(el, html) {
	if( el ) {
        var oldEl = (typeof el === "string" ? document.getElementById(el) : el);
        var newEl = document.createElement(oldEl.nodeName);

        // Preserve any properties we care about (id and class in this example)
        newEl.id = oldEl.id;
        newEl.className = oldEl.className;

        //set the new HTML and insert back into the DOM
        newEl.innerHTML = html;
        if(oldEl.parentNode)
	        oldEl.parentNode.replaceChild(newEl, oldEl);
        else
        oldEl.innerHTML = html;

        //return a reference to the new element in case we need it
        return newEl;
	}
};

var PageMainLoadingManager = {	
	processLoadStack:[],
	processCompleteStack:[],
	isWork:false,
	isFirst:true,	
	initLoadView : function(){		
		jQuery("#mbodyLoadMask").show();
		jQuery("#mbodyLoadContent").show();
		PageMainLoadingManager.isWork = true;
		jQuery("#mainWorkProgressBar").css("width","0%");
		
	},
	startLoad:function(jobStack){		
		if(PageMainLoadingManager.isFirst){			
			PageMainLoadingManager.processLoadStack = jobStack;
			setTimeout(PageMainLoadingManager.checkProgress,100);
		}		
		PageMainLoadingManager.isFirst = false;
	},
	checkProgress:function(){
		var totalWorkCnt = PageMainLoadingManager.processLoadStack.length;		
		var completeWorkCnt = PageMainLoadingManager.processCompleteStack.length;
		
		var percent = (completeWorkCnt/totalWorkCnt) * 100;		
		if(percent >= 100){
			percent = 100;
		}
		jQuery("#mainWorkProgressBar").css("width",percent+"%");		
		if(percent == 100){
			setTimeout(PageMainLoadingManager.clearLoad,2000);
		} else {
			setTimeout(PageMainLoadingManager.checkProgress,100);
		}		
	},
	clearLoad:function(){		
		jQuery("#mbodyLoadMask").hide();
		jQuery("#mbodyLoadContent").hide();		
		PageMainLoadingManager.isWork = false;
		PageMainLoadingManager.processLoadStack = [];
		PageMainLoadingManager.processCompleteStack = [];
	},
	completeWork:function(name){
		if(PageMainLoadingManager.isWork){
			PageMainLoadingManager.processCompleteStack.push(name);			
		}
	}	
};


var bodyMaskIsShown = false;
var bodtMaskPaneId = "";
function addEvent(obj, evType, fn){
 if (obj.addEventListener){
    obj.addEventListener(evType, fn, false);
    return true;
 } else if (obj.attachEvent){
    var r = obj.attachEvent("on"+evType, fn);
    return r;
 } else {
    return false;
 }
}

function addEventAttach(id, evType, fn, exceptObjName){	
	var obj = document.getElementById(id);
	if (obj.addEventListener){
	    obj.addEventListener(evType, function(event){ 
	    	var eventTarget = (event.target) ? event.target : event.srcElement;
	    	if(eventTarget.nodeName != exceptObjName)eval(fn);	    	
	    }, false);
	    return true;
	 } else if (obj.attachEvent){
	    var r = obj.attachEvent("on"+evType, function(event){
	    	var eventTarget = (event.target) ? event.target : event.srcElement;
	    	if(eventTarget.nodeName != exceptObjName)eval(fn);	    	
	    });
	    return r;
	 } else {
	    return false;
	 }
}

function getViewportHeight() {
	if (window.innerHeight!=window.undefined) return window.innerHeight;
	if (document.compatMode=='CSS1Compat') return document.documentElement.clientHeight;
	if (document.body) return document.body.clientHeight; 

	return window.undefined; 
}
function getViewportWidth() {
	var offset = 17;
	var width = null;
	if (window.innerWidth!=window.undefined) return window.innerWidth; 
	if (document.compatMode=='CSS1Compat') return document.documentElement.clientWidth; 
	if (document.body) return document.body.clientWidth; 
}

function setBodyMaskSize() {
	if(bodyMaskIsShown){
		var theBody = document.getElementsByTagName("BODY")[0];
		
		var fullHeight = getViewportHeight();
		var fullWidth = getViewportWidth();
		
		// Determine what's bigger, scrollHeight or fullHeight / width
		if (fullHeight > theBody.scrollHeight) {
			popHeight = fullHeight;
		} else {
			popHeight = theBody.scrollHeight;
		}
		
		if (fullWidth > theBody.scrollWidth) {
			popWidth = fullWidth;
		} else {
			popWidth = theBody.scrollWidth;
		}
		
		jQuery("#"+bodtMaskPaneId).css("height",popHeight + "px");
		if(!jQuery.browser.mozilla){
			jQuery("#"+bodtMaskPaneId).css("width",popWidth + "px");
		}
	}
	
}

addEvent(window, "resize", setBodyMaskSize);

jQuery.makeBodyMask = function(maskId,isTtransparent){
	bodyMaskIsShown = true;
	var id = "smask";
	if(maskId){
		id = maskId;
	}
	
	bodtMaskPaneId = id;	
	jQuery("body").append(jQuery("<div>").attr("id",id).addClass((isTtransparent)?"subMaskW":"subMask"));
	
	setBodyMaskSize();	
};

var loadTimeout;
jQuery.makeProcessBodyMask = function(setTime){	
	jQuery("#mbodyLoadMask").show();
	var width = jQuery(window).width();
	var height = jQuery(window).height();
	jQuery("#mbodyLoadMask").css({width:width+"px",height:height+"px"});
	if(isMsie){
		window.document.body.scroll = "no";
	}
	var msgFrame = jQuery("<div id='contentLoadMask'>");
	msgFrame.css("display","none");	
	msgFrame.addClass("TM_c_loadding");	
	jQuery("#mbodyLoadMask").append(msgFrame);	
	var ctop = (height/2 - msgFrame.height()/2);
	var cleft = (width/2 - msgFrame.width()/2);	
	jQuery("#contentLoadMask").css({top:ctop+"px",left:cleft+"px"});
	setTimeout(function(){
		jQuery("#contentLoadMask").show();
	},1);	
	jQuery("object").hide();
	var time = (typeof(setTime) == 'undefined')?5000:setTime;
	if(time > 0){
		loadTimeout = setTimeout(function(){
			document.location.reload();
		},time);
	}
};

jQuery.removeProcessBodyMask = function(){	
	jQuery("#mbodyLoadMask").remove();
	clearTimeout(loadTimeout);
	if(isMsie){
		window.document.body.scroll = "auto";
		jQuery("object").show();
	}
};

jQuery.removeBodyMask = function(maskId){
	bodyMaskIsShown = false;
	var id = "smask";
	if(maskId){
		id = maskId;
	}
	bodtMaskPaneId = "";
	jQuery("#"+id).remove();
};

function resizeMask(resizeObject,id){		
	var cheight = jQuery(resizeObject).height();	
	jQuery("#"+id).css("height",cheight+"px");			
}

jQuery.fn.makeMask = function(maskId,isWhite){
	var id = "smask";
	if(maskId){
		id = maskId;
	}
	var maskArea = jQuery(this);	
	maskArea.append(jQuery("<div>").attr("id",id).addClass((isWhite)?"subMaskW":"subMask"));
	var cheight = maskArea.children().height();
	var mheight = jQuery("#"+id).height();

	if(cheight > mheight){
		jQuery("#"+id).css("height",cheight);
	}	
	jQuery(maskArea).bind("resize", function(event){
		var resizeObject = jQuery(this);
			resizeMask(resizeObject,id);
		});
	jQuery(maskArea).css("overflow","hidden");	
};
jQuery.fn.removeMask = function(maskId){
	var id = "smask";
	if(maskId){
		id = maskId;
	}
	
	jQuery("#"+id).remove();
	var maskArea = jQuery(this);	
	jQuery(maskArea).unbind("resize", function(event){
		var resizeObject = (event.target) ? jQuery(event.target) : jQuery(event.srcElement);
			resizeMask(resizeObject,id);
		});
	jQuery(maskArea).css("overflow","auto");	
		
};

jQuery.fn.makeModal = function(maskID,top,left){	
	
	var bodyFrame =  jQuery("body");
	var modalFrame = jQuery(this);
	var stop = (top)?top:-1;
	var sleft = (left)?left:-1;
	
	
	function centerModalWin() {	
		var bHeight = jQuery(window).height();		
		var bWidth = jQuery(window).width();
		
		var ctop = (stop > 0)?top:(bHeight/2 - modalFrame.height()/2);
		var cleft = (sleft > 0)?left:(bWidth/2 -modalFrame.width()/2);		
		
		modalFrame.css("top",  ctop+ "px");
		modalFrame.css("left", cleft+ "px");			
	}
	
	var id = modalFrame.attr("id");
	modalFrame.show();
	jQuery.makeBodyMask(maskID);	
	jQuery("object:not(div#"+id+" object)").hide();
	jQuery("select:not(div#"+id+" select)").hide();
	bodyFrame.bind("resize",centerModalWin);		
	centerModalWin();		
};
jQuery.fn.removeModal = function(maskID){
	var bodyFrame =  jQuery("body");
	var modalFrame = jQuery(this);
	
	function centerModalWin() {					
	}
	
	modalFrame.hide();	
	jQuery.removeBodyMask(maskID);
	bodyFrame.unbind("resize",centerModalWin);
	jQuery("object").show();
	jQuery("select").show();
	
};

jQuery.fn.loadbar = function(hid){
	if(hid){
		jQuery("#"+hid).css("overflow","hidden");
	}
	var loadPane = jQuery(this);
	loadPane.empty();
	var wrapper = jQuery("<div><div>");
	wrapper.css("text-align","center");		
	wrapper.append("<img src=''  >");
	loadPane.append(wrapper);	
};


jQuery.fn.loadWorkMaskOnly = function(isMessage,isPopup){
	var loadPane = jQuery(this);	
	var msgFrame = jQuery("<div id='contentLoadMask'>");
	msgFrame.addClass("TM_c_loadding");
    
	jQuery("object").each(function(){
		var id = jQuery(this).attr("id");
		if(id.indexOf("SWFUpload") < 0){
			jQuery(this).hide();
		}
	});
	jQuery("select").hide();
	loadPane.makeMask("contentBodyMask",true);	
	
	if(isMessage){
		jQuery("#contentBodyMask").after(msgFrame);		
		
		var bHeight = loadPane.outerHeight(true);		
		var bWidth = loadPane.outerWidth();
		var cHeight = loadPane.children().outerHeight(true);
		var scrollTop = loadPane.scrollTop();
		
		if(bWidth == 0){				
			jQuery("#contentBodyMask").css("width",jQuery(window).width()+"px");
		}
		
		if(bHeight == 0 ){				
			jQuery("#contentBodyMask").css("height",jQuery(window).height()+"px");
		}			
		bHeight = (bHeight == 0)?jQuery(window).height():bHeight;
		bWidth = (bWidth == 0)?jQuery(window).width():bWidth;
		
		var ctop = (bHeight/2 - msgFrame.height()/2);
		var cleft = (bWidth/2 -msgFrame.width()/2);		
		if(bHeight < cHeight && scrollTop > 0){
			var size = (cHeight - bHeight);
			if(size > scrollTop){
				size = size - scrollTop;
			}
			ctop = ctop + size;
		}		
		msgFrame.css({"top":ctop + "px","left":cleft + "px"});
	}
};

jQuery.fn.loadWorkMask = function(isMessage,loadParam){	
	//if(!PageMainLoadingManager.isWork){		
		var loadPane = jQuery(this);
		var id = loadPane.attr("id");
		var msgFrame = jQuery("<div id='contentLoadMask'>");		
		msgFrame.addClass("TM_c_loadding");				
		loadPane.makeMask("contentBodyMask",true);		
		jQuery("object").hide();		
		
		if(isMessage){
			jQuery("#contentBodyMask").after(msgFrame);	
			
			var bHeight = loadPane.outerHeight(true);		
			var bWidth = loadPane.outerWidth(true);
			var cHeight = loadPane.children().outerHeight(true);
			var scrollTop = loadPane.scrollTop();
			
			if(bWidth == 0){				
				jQuery("#contentBodyMask").css("width",jQuery(window).width()+"px");
			}
			
			if(bHeight == 0){				
				jQuery("#contentBodyMask").css("height",jQuery(window).height()+"px");
			}			
			bHeight = (bHeight == 0)?jQuery(window).height():bHeight;
			bWidth = (bWidth == 0)?jQuery(window).width():bWidth;
			
			var ctop = (bHeight/2 - msgFrame.height()/2);
			var cleft = (bWidth/2 -msgFrame.width()/2);		
			if(bHeight < cHeight && scrollTop > 0){
				var size = (cHeight - bHeight);
				if(size > scrollTop){
					size = size - scrollTop;
				}
				ctop = ctop + size;
			}		
			msgFrame.css({"top":ctop + "px","left":cleft + "px"});
		}
	//}
	
	if(loadParam){		
		jQuery("#"+loadParam.cid).load(loadParam.url,loadParam.param,function(){		
			if(loadParam.exeFunction){
				loadParam.exeFunction();
			}
			jQuery("#"+loadParam.cid).removeWorkMask();
			jQuery("object").show();
			setTimeout(function(){
				ActionLoader.isloadAction = false;
			},1000);
		});
	} else {
		ActionLoader.isloadAction = false;
	}
};

jQuery.fn.removeWorkMask = function(){
	var loadPane = jQuery(this);
	loadPane.removeMask("contentBodyMask");
	jQuery("#contentLoadMask").remove();
};

jQuery.fn.makeSubMenu = function(opt,funcList,param){
	
	var parentFrame = jQuery(this);
	parentFrame.css("position","relative");			
	
	var menuL = jQuery("<div>");
	menuL.addClass("sub_menu_wrapper");
	var width = "";
	if(opt.width > 0){
		menuL.css("width",(opt.width+8)+"px");
		width = opt.width +"px";
	}
	
	parentFrame.append(menuL);
	
	var i = 1;
	var len = funcList.length;
	var linkTag,contents,menuItemPane;
	jQuery.each(funcList, function(){
		var name = this.name;
		var link = this.link;
		menuItemPane = jQuery("<div>");				
		menuItemPane.css("cursor","pointer");
		menuItemPane.css("z-index","5");
		menuItemPane.css("position","relative");		
		menuItemPane.addClass("sub_item");		
		
		linkTag = jQuery("<a href='javascript:;'></a>");
		contents = jQuery("<span class='item_body jpf'></span>").append(name);
		if(opt.width > 0){
			contents.css("width",width);
		}
		
		linkTag.addClass("sitem");		
		linkTag.append(contents.hover(function(){jQuery(this).addClass("item_body_over");},
				function(){jQuery(this).removeClass("item_body_over");}));										
		linkTag.click(function(event){
						jQuery(event.target).parent().parent().parent().hide();
						link(param);
						});
		menuItemPane.append(linkTag);						
		menuL.append(menuItemPane);
		i++;
	});	
};

var ActionLoader = {};
ActionLoader.isloadAction = false;
ActionLoader.loadAction = function(canvarsID,url,param,isMessage,exeFunction){
	ActionLoader.isloadAction = true;
	var lparam = {};
	var efunc = false;
	if(param){
		lparam = param; 
	}
	
	if(exeFunction){
		efunc = exeFunction;
	}
	var loadParam = {"cid":canvarsID,"url":url,"param":lparam,"exeFunction":efunc};	
	jQuery("#"+canvarsID).loadWorkMask(isMessage, loadParam);	
};

ActionLoader.postLoadAction = function(action,param,afterFunc,dataType){
	ActionLoader.isloadAction = true;
	jQuery.post(action,param,function(data,textStatus){		
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
            removeProcessLoader();
			var respObj = JSON.parse(xhr.responseText);
			if (respObj.code == "401") {
				/* WEB-INF/views/mail/header.jsp 에서 중복으로 처리하고 있어서 주석처리함.
				 * 혹시 다른 부분에도 있을지 몰라 코드는 남겨놓음. */
				/*if(BASECONFIG.data.useOtp || BASECONFIG.data.useCert){
					var url = xhr.getResponseHeader('Location');
					if(url == null){
						window.location = window.location.href;
					}else{
						window.location = url;
					}
		    	}else{
		    		var type = xhr.originalRequestOptions.type;
		    		var contentRoot = BASECONFIG.data.contextRoot ? BASECONFIG.data.contextRoot : "/";
		            url = contentRoot + "simplelogin?type="+type;
		            window.top.window.open(window.location.protocol + "//" + window.location.host + url,"simpleLogin","width=490,height=320 top="+((screen.height/2)-200)+" left="+((screen.width/2)-180));
		    	}*/
			} else {
				if (errorFunc) {
					errorFunc(respObj);
				} else {
					jQuery.goAlert(respObj.message);					
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
ActionLoader.postSyncGoLoadAction = function(action,param,afterFunc,dataType,errorFunc){
	ActionLoader.requestGoLoadAction("POST",formContentType,false,action,param,afterFunc,dataType,errorFunc);
};

ActionLoader.postGoJsonLoadAction = function(action,param,afterFunc,dataType,errorFunc){
	ActionLoader.requestGoLoadAction("POST",jsonContentType,true,action,JSON.stringify(param),afterFunc,dataType,errorFunc);
};

ActionLoader.postSyncGoJsonLoadAction = function(action,param,afterFunc,dataType,errorFunc){
	ActionLoader.requestGoLoadAction("POST",jsonContentType,false,action,JSON.stringify(param),afterFunc,dataType,errorFunc);
};

ActionLoader.putGoJsonLoadAction = function(action,param,afterFunc,dataType,errorFunc){
	ActionLoader.requestGoLoadAction("PUT",jsonContentType,true,action,JSON.stringify(param),afterFunc,dataType,errorFunc);
};

var ActionNotMaskLoader = {};
ActionNotMaskLoader.loadAction = function(canvarsID,url,param,exeFunction){
	ActionLoader.isloadAction = true;
	var lparam = {};	
	if(param){
		lparam = param; 
	}
	$(canvarsID).scrollTop = 0;	
	jQuery("#"+canvarsID).load(url,lparam,function(){		
		if(exeFunction){
			exeFunction();
		}
		ActionLoader.isloadAction = false;				
	});
};

var ActionBasicLoader = {};
ActionBasicLoader.loadAction = function(canvarsID,url,param){	
	jQuery("#"+canvarsID).load(url,param);
};

jQuery.fn.selectboxSetIndex = function(idx){
	var selectPane = jQuery(this);
	var sid = selectPane.attr("id");
	var inputId = jQuery("#"+sid+"_selectMain").data("selectId");
	
	var optionList = selectPane.find(".selectItem");
	var option,val;
	for ( var i = 0; i < optionList.length; i++) {
		option = jQuery(optionList[i]).removeClass("jselect_listselect");
		val = option.attr("selectValue");		
		if(i == idx){
			option.addClass("jselect_listselect");
			jQuery("#"+inputId).val(val);
			jQuery("#"+sid+"_selectText").html(option.html());	
		}		
	}	
};

jQuery.fn.selectboxSetValue = function(value){
	var selectPane = jQuery(this);
	var sid = selectPane.attr("id");
	var inputId = jQuery("#"+sid+"_selectMain").data("selectId");	
	
	var optionList = selectPane.find(".selectItem");
	var option,val;
	for ( var i = 0; i < optionList.length; i++) {
		option = jQuery(optionList[i]).removeClass("jselect_listselect");
		val = option.attr("selectValue");
		
		if(val == value){
			option.addClass("jselect_listselect");
			jQuery("#"+inputId).val(value);
			jQuery("#"+sid+"_selectText").html(option.html());	
		}		
	}	
};

jQuery.fn.selectboxGetText = function(value){
	var selectPane = jQuery(this);
	var sid = selectPane.attr("id");
	var inputId = jQuery("#"+sid+"_selectMain").data("selectId");	
	
	var optionList = selectPane.find(".selectItem");
	var option,val;
	var returnValue = "";
	for ( var i = 0; i < optionList.length; i++) {
		option = jQuery(optionList[i]);
		val = option.attr("selectValue");
		if(val == value){
			returnValue = option.html();
			break;
		}
	}
	return returnValue;
};

jQuery.fn.selectboxGetOptionsCount = function(){
	var selectPane = jQuery(this);
	var sid = selectPane.attr("id");
	var inputId = jQuery("#"+sid+"_selectMain").data("selectId");
	
	var optionList = selectPane.find(".selectItem");
	if (!optionList || !optionList.length) {
		return 0;
	} else {
		return optionList.length;
	}
};

jQuery.fn.selectboxDisable = function(){
	var selectPane = jQuery(this);
	var sid = selectPane.attr("id");
	selectPane.data("use","F");	
	jQuery("#"+sid+"_selectMain").css("background","#EFEFEF");
};

jQuery.fn.selectboxEnable = function(){
	var selectPane = jQuery(this);
	var sid = selectPane.attr("id");
	selectPane.data("use","T");
	jQuery("#"+sid+"_selectMain").css("background","#FFFFFF");	
};
jQuery.fn.selectbox = function(opt,selectValue,selectOptionList){
	var selectId = opt.selectId;		
	var selectFunc = opt.selectFunc;
	var isIE6 = (jQuery.browser.msie && jQuery.browser.version < 7);
	
	var selectPane = jQuery(this);	
	var sid = selectPane.attr("id");
	var toggleFlag = "off";	
	function toggleList(){
		if("F" != selectPane.data("use")){
			var listHeight = jQuery("#"+sid+"_selectList").height();
			var sList = jQuery("#"+sid+"_selectList");
			
			if(opt.height) {
				listHeight = opt.height;
			} else {
				if(listHeight > 150){
					listHeight = 150;				
				}
			}
			
			sList.css("height",listHeight+"px");			
	
			if(toggleFlag == "off"){
				toggleFlag = "on";
				if(isIE6){
					jQuery("#"+sid+"_sbgFrame").show();					
				}				
				sList.show();				
			} else {
				toggleFlag = "off";
				if(isIE6){
					jQuery("#"+sid+"_sbgFrame").hide();					
				}
				sList.hide();
			}
			
			if(isIE6){
				jQuery("#"+sid+"_sbgFrame").css("height",(listHeight-1)+"px");				
			}
		
		}
		
	}
	
	function showSelectList(){	
		if(toggleFlag == "on"){
			jQuery("#"+sid+"_selectList").show();
			if(isIE6){
				jQuery("#"+sid+"_sbgFrame").show();
				
			}
		}
	}
	
	function hideSelectList(){
		toggleFlag = "off";
		jQuery("#"+sid+"_selectList").hide();
		if(isIE6){
			jQuery("#"+sid+"_sbgFrame").hide();			
		}
	}
	
	function selectItem(text,val,iid){
		var li = jQuery("#"+sid+"_selectList div.selectItem").removeClass("jselect_listselect");
		jQuery("#"+iid).addClass("jselect_listselect");
		jQuery("#"+sid+"_selectText").html(text).attr("title",unescape_tag_title(text));
		jQuery("#"+selectId).val(val);
		
		if(selectFunc){
			selectFunc(val);
		}	
		
	}
	selectPane.data("use","T");
	var selectMain = jQuery("<div class='jselect'>").attr("id",sid+"_selectMain")
					.hover(function(){
								clearTimeout(selectPane.data("timeout"));
								showSelectList();
							},
							function(){
								selectPane.data("timeout",setTimeout(function(){hideSelectList();},100));
							});
	var selectContent = jQuery("<div class='selectContent jpf'>").attr("id",sid+"_selectText")
						.click(function(){
		toggleList();		
	});
	var selectIcon = jQuery("<div class='selectIcon'></div>").attr("id",sid+"_selectIcon").click(function(){
		toggleList();			
	});
	
	selectMain.append(selectContent).append(selectIcon);
	var selectListWrapper = jQuery("<div style='position:relative;' id='"+sid+"_listWraaper'></div>");
	
	if(isIE6){
		selectListWrapper.append("<iframe frameborder='0' tabindex='-1' class='bgFrame' id='"+sid+"_sbgFrame'></iframe>");		
	}
	
	var selectList = jQuery("<div class='selectList jpf'>").attr("id",sid+"_selectList");
					
	if(opt.width){
		selectList.css("width",opt.width+"px");
	}
	
	var selectStyle = "";
	var selectText = "";
	var isSelected = false;
	var selectIndexText;
	for(var i = 0 ; i < selectOptionList.length ; i++){
		selectStyle = "";
		if(i == 0){
			selectText = selectOptionList[i].index;
			if(!selectValue || selectValue == ""){
				selectValue = selectOptionList[i].value;
				isSelected = true;
			}
		}
		if(selectOptionList[i].value == selectValue){
			selectStyle = "jselect_listselect";
			selectText = selectOptionList[i].index;
			isSelected = true;
		}
		
		selectIndexText = selectOptionList[i].index;
		if(opt.textMaxLength){
			if(opt.textMaxLength < selectIndexText.length){
				selectIndexText = selectIndexText.substring(0,opt.textMaxLength);
				selectIndexText += "...";
			}
		}
		
		selectList
		.append(jQuery("<div class='selectItem jpf'></div>").attr("id",sid+"_sList_Item_"+i)
		.attr("selectValue",selectOptionList[i].value).addClass(selectStyle)
		.hover(function(){
			showSelectList();
			jQuery(this).addClass("jselect_listover");
			},function(){jQuery(this).removeClass("jselect_listover");})
		.click(function(){hideSelectList(); selectItem(escape_tag(jQuery(this).text()),jQuery(this).attr("selectValue"),jQuery(this).attr("id"));})
		.attr("title", unescape_tag_title(selectOptionList[i].index))
		.append((opt.unescape)?selectIndexText:escape_tag(selectIndexText)));
	}
	
	selectListWrapper.append(selectList);
	selectMain.append(jQuery("<div class='cls'></div>"));
	selectMain.append(selectListWrapper);
	selectPane.append(selectMain);
	selectPane.append(jQuery("<input type='hidden' name='"+selectId+"' id='"+selectId+"' value='"+selectValue+"'>"));
	selectMain.data("selectId",selectId);	
	
	if(!isSelected){
		jQuery("#"+sid+"_sList_Item_0").addClass("jselect_listselect");
		selectValue = jQuery("#"+sid+"_sList_Item_0").attr("selectValue");
		jQuery("#"+selectId).val(selectValue);
	}
	
	if(opt.textMaxLength){
		if(opt.textMaxLength < selectText.length){
			selectText = selectText.substring(0,opt.textMaxLength);
			selectText += "...";
		}
	}
	jQuery("#"+sid+"_selectText").html(escape_tag(selectText)).attr("title",selectText);
	
	var listWidth;
	if(opt.width){
		var listWidth = opt.width;		
		jQuery("#"+sid+"_selectList").css("width",listWidth+"px");		
		jQuery("#"+sid+"_selectMain").css("width",listWidth+"px");
		jQuery("#"+sid+"_selectText").css("width",(listWidth-27)+"px");		
		
		
	} else {	
		var mainWidth = jQuery("#"+sid+"_selectMain").width();
		listWidth = jQuery("#"+sid+"_selectList").width();
		
		listWidth = listWidth +17;	
		
		jQuery("#"+sid+"_selectList").css("width",listWidth+"px");
			
		if(listWidth > mainWidth){		
			jQuery("#"+sid+"_selectMain").css("width",listWidth+"px");
			jQuery("#"+sid+"_selectText").css("width",(listWidth-jQuery("#"+sid+"_selectIcon").width()-10)+"px");		
		}
	}
	if(isIE6){
		jQuery("#"+sid+"_sbgFrame").css("width",(listWidth-1)+"px");
	}
	
	jQuery("#"+sid+"_listWraaper").css("width",listWidth+"px");
	
	jQuery("#"+sid+"_selectList").css("overflow-X","hidden");
	jQuery("#"+sid+"_selectList").css("overflow-Y","auto");
};

function makeForm(name,action,method,param){
	var form = 	jQuery("<div id='"+name+"FormLayer'><form name='"+name+"' id='"+name+"' method='"+method+"' action='"+action+"'></form></div>");
	jQuery("body").append(form);
	if(param){
		jQuery.each(param,function(key, val){				
				if(jQuery.isArray(val)){
					for ( var i = 0; i < val.length; i++) {
						jQuery("#"+name).append(jQuery("<input type='hidden' name='"+key+"' id='"+name+key+i+"'/>"));
					}
				} else {
					jQuery("#"+name).append(jQuery("<input type='hidden' name='"+key+"' id='"+name+key+"'/>"));
				}
		});		
	}
	if(param){
		jQuery.each(param,function(key, val){				
				if(key && val){
					if(jQuery.isArray(val)){						
						for ( var i = 0; i < val.length; i++) {
							$(name+key+i).value = val[i];
						}
					} else {
						$(name+key).value = val;
					}
				}
		});		
	}	
	
	return $(name);
}

function showPopupDialog(id, opt) {
	jQuery("#"+id).dialog(opt);
	jQuery("#"+id).dialog("open");
}

function hidePopupDialog(id) {
	jQuery("#"+id).dialog("close");
}


jQuery.fn.dropDownMenu = function(option) {
	option = (!option) ? {} : option;
	var timeout = (!option.timeout) ? 1000 : option.timeout;
	var selecter = (!option.selecter) ? "li" : option.selecter;
	var closeTimer;
	var menuItem;
	var _this = this;
	function menuOpen() {
		menuTimerClear();
		menuItem = jQuery(_this).show();
	}
	function menuClose() {
		if (menuItem) menuItem.hide();
		jQuery(option.clickObj).unbind("mouseover");
		jQuery(option.clickObj).unbind("mouseout");
		jQuery(_this).find(selecter).unbind("mouseover");
		jQuery(_this).find(selecter).unbind("mouseout");
	}
	function menuTimer() {
		closeTimer = window.setTimeout(menuClose, timeout);
	}
	function menuTimerClear() {
		window.clearTimeout(closeTimer);
		closeTimer = null;
	}
	if (option.clickObj) {
		jQuery(option.clickObj).bind("mouseover",menuTimerClear);
		jQuery(option.clickObj).bind("mouseout",menuTimer);
	}
	jQuery(_this).find(selecter).bind("mouseover",menuOpen);
	jQuery(_this).find(selecter).bind("mouseout",menuTimer);
	
	menuOpen();
};

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

var EventControl = function(selector, event, target, options) {
	var self = this;
	this.events = {};
	this.options = options || {}; 
	this.eventKey = this.options.eventKey || "evt-rol";
	
	jQuery(selector).on(event, target, function(evt) {
		var type = jQuery(this).attr(self.eventKey);
        if (!type) return;
        if(evt.stopPropagation) {
        	evt.stopPropagation();
        } else {
        	evt.cancelBubble = true;
        }
        if(self.options.everyPreFunc) {
        	self.options.everyPreFunc();
        }
        self.trigger(type, this);
	});
	
	if (this.options.initFunc) {
		this.options.initFunc();
	}

	this.add = function(eventName, func) {
		this.events[eventName] = func;
	};
	
	this.trigger = function(eventName, target) {
		var func = this.events[eventName];
		if (!func) return;
		if(typeof func === 'function') {
			func(target);
		}else if (typeof func === 'string') {
			window[func](target);
		}
	};
};