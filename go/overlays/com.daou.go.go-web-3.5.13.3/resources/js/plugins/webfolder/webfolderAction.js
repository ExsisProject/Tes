function initWebFolderFunction(){
	webfolderControl = new WebfolderControl();
}
function initService() {
	webfolderControl.loadWebfolderList();
	webfolderControl.loadShareWebfolderList();
	webfolderControl.loadPublicWebfolderList();

    var param = {"path": "/", "fullPath": "/", "currentPage": "1", "offset": 20};

    if (sideTop === "company") {
        param.type = "public";
    }

    if (sideTop === "private"){
        param.type = "user"
    }

    if (searchFolder == "user") {
        delete param.type;
    }

    if (type == "share") {
        param.type = type;
        param.sroot = sroot;
        param.userSeq = userSeq;
        param.fullPath = fullPath;
        param.path = path;
    }

    webfolderControl.loadViewWebFolder(param);

    webfolderControl.makeLeftEvent();
    webfolderControl.makeContentEvent();
    webfolderControl.makeSearchEvent();
    initWebfolderDisplay();

    jQuery("#webfolderInput").placeholder();
}
function initWebfolderDisplay(){
    var privateWebfolderDisplay = getCookie("PRW");
    privateWebfolderDisplay = (!privateWebfolderDisplay) ? "show" : privateWebfolderDisplay;
    toggleWebfolderList("webfolderLeft", privateWebfolderDisplay);

    var publicWebfolderDisplay = getCookie("PUW");
    publicWebfolderDisplay = (!publicWebfolderDisplay) ? "show" : publicWebfolderDisplay;
    toggleWebfolderList("publicFolderLeft", publicWebfolderDisplay);
}
function toggleWebfolderList(type, displayType){
    var displayFlag = "show";
    var $toggleType = jQuery("a[type='"+type+"']");
    var $toggleArea = jQuery("ul."+type);
    if ($toggleType.closest("h1").hasClass("folded") || (displayType && displayType=="show")){
        $toggleArea.slideDown();
        $toggleType.closest("h1").removeClass("folded").attr("title", mailMsg.common_menu_hide);
    }else{
        $toggleArea.slideUp();
        $toggleType.closest("h1").addClass("folded").attr("title", mailMsg.common_menu_show);
        displayFlag = "hide";
    }

    setWebfolderListCookie(type, displayFlag);

}
function setWebfolderListCookie(type,displayFlag){
    var cookieName = "PRW";
    if (type.indexOf("public") > -1) {
        cookieName = "PUW";
    }
    setCookie(cookieName, displayFlag, 365);
}

function goFolder(param) {

    if (param.fullPath) {
        param.path = getBeHindWebfolderRootPath();
    }
    webfolderControl.loadViewWebFolder(param);

    function getBeHindWebfolderRootPath() {
        return param.fullPath.substring(14);
    }
}
function previewFile(param) {
	param.action = "webfolderPreviewFile";
	POPUPDATA = param;
	window.open("/app/webfolder/popup","","resizable=yes,scrollbars=yes,status=yes,width=800,height=640");
}

function toggleDetailSearchLayer() {
	if (jQuery("#detailSearchLayerWrap").css("display") == "none") {
		makeDetailUnifiedSearchLayer();
    } else {
        closeDetailSearchLayer();
    }
}

//상세 통합 검색
function makeDetailUnifiedSearchLayer() {
	webfolderControl.getUnifiedSearchFolderList();
	var isMailAttachSearch = webfolderControl.isMailAttachSearch();
	if(isMailAttachSearch){
    	jQuery('#searchAttachContentsWrap').parents('div.vertical_wrap').show();
    }
    jQuery("#detailSearchLayerWrap").on("click", "input,span,a", function(e) {
        var type = jQuery(this).attr("evt-rol");
        if (!type) return;

        var term = jQuery("input:radio[name='searchPeriod']:checked").val();
        var currentDate = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        var fromDate = moment('1970/01/01').format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        var toDate = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        var searchTerm = "all";

        if (term == "-1") {
        	fromDate = moment(moment(currentDate).clone().add("weeks", term)).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        	searchTerm = "1w";
        } else if(term == "-2") {
        	fromDate = moment(moment(currentDate).clone().add("weeks", term)).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        	searchTerm = "2w";
        } else if (term == "month") {
        	fromDate = moment(moment(currentDate).clone().add("months", -1)).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        	searchTerm = "1w";
        } else if (term == "directly") {
        	fromDate =moment(jQuery("#fromDate").val()).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        	toDate = moment(moment(jQuery("#toDate").val()).clone().add('days',1).subtract('seconds',1)).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        	searchTerm = "";
        }

        if(type == "search-period"){
        	jQuery("#fromDate").attr("disabled",true);
        	jQuery("#toDate").attr("disabled",true);
        } else if(type=="search-directly") {
        	jQuery("#fromDate").attr("disabled",false);
        	jQuery("#toDate").attr("disabled",false);
        } else if (type == "close-unified-search-folder") {
            closeDetailSearchLayer();
        } else if (type == "detail-unified-search") {

        	var keyword = jQuery.trim(jQuery("#keyword").val());
            if(keyword == ""){
                jQuery.goSlideMessage(mailMsg.alert_search_nostr, "caution");
                return false;
            }
        	 if (!validateInputValue(jQuery("#keyword"), 2, 64, "searchMail")) {
             	return false;
             }
             if(jQuery("#fromDate").val() != "" || jQuery("#toDate").val() !== ""){
             	if(!checkDatePeriod(jQuery("#fromDate").val(),jQuery("#toDate").val())){
             		return false;
             	}
             }
            window.top.window.location = "/app/" + (isMsie8 ?  "#" : "") + "unified/search?offset=5&page=0&stype=detail&keyword=" + encodeURIComponent(jQuery("#keyword").val()) + "&searchAttachContents=" + jQuery("#searchAttachContents").is(":checked") + "&fromDate=" + fromDate + "&toDate=" + toDate + "&searchTerm=" + searchTerm;
        	jQuery("#searchType").val('appSearch');
        	jQuery("#keyword").val('');
        }
    });
    jQuery("#detailSearchLayerWrap").on("change", "select", function(e) {
        var type = jQuery(this).attr("evt-rol");
        if (type == "select-search-folder") {
            var selectBox = jQuery(this).val();
            if (selectBox == "all") {
                jQuery("#searchIncludeExtFolderWrap").show();
            } else {
                jQuery("#searchIncludeExtFolderWrap").hide();
                jQuery("#searchIncludeExtFolder").attr("checked",false);
            }
        }
    });
    jQuery("#detailSearchLayerWrap").on("keypress", "input", function(e) {
       if(e.which==13){
           adSearchMessage();
       }
    });
    makeProcessLoader("mask");
}

function closeDetailSearchLayer() {
    ocxUploadVisible(true);
    jQuery("#detailSearchLayerWrap").hide();
    jQuery("#detailSearchLayerWrap").off();
    removeProcessLoader();
}

function toggleSearchType(){
	var searchType = jQuery("#searchType").val();
	if (searchType == "appSearch") {
		jQuery("#fileDetailSearchBtn").hide();
    } else {
    	jQuery("#fileDetailSearchBtn").show();
    }
}

function setWebfolderAppName() {
	jQuery("#webfolderAppNameLink").text(currentAppName);
}
