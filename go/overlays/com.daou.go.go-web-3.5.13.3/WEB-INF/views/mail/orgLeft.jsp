<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%-- <aside id="organogram" class="go_organogram" style="${isPcVersionViewFromMobile ? 'bottom:-184px; height:300px' : 'height:50px'}">
	<h1>
		<ins class="ic"></ins>
		<span class="txt"><tctl:msg key="comn.top.org" /></span>
		<span class="btn_wrap">
			<span title="" data-slide="true" class="ic_side ic_hide_up" id="orgToggle"></span>
		</span>
	</h1>
	<div class="search_wrap">
		<form onsubmit="return false;" name="orgSearch">
			<input type="text" placeholder="<tctl:msg key="register.032" />, <tctl:msg key="addr.info.label.033" />" class="search">
			<input type="submit" value="<tctl:msg key="comn.search" />" class="btn_search">
		</form>
	</div>
	<div class="tab_wrap"></div>
</aside> --%>

<script type="text/javascript">
function orgLeftInit() {
	var orgPullUp = false;
	jQuery.ajax({
		type:"GET",
		url : "/api/displayconfig",
		async : false,
		success : function(result) {
			if (result.code == "200") {
				orgPullUp = result.data.orgPullUp;
			}
		}
	});


	if(useOrgAccess && orgPullUp){
		var orgOptions = {};                // DOCUSTOM-5000 [대한제당] 조직도 표기방식 개선
        createDisplayFormatOption(orgOptions, 'orgTreeMasterFormat');
        createDisplayFormatOption(orgOptions, 'orgTreeModeratorFormat');
        createDisplayFormatOption(orgOptions, 'orgTreeMemberFormat');
        
		var organogram = jQuery.goOrg(_.extend(orgOptions, {el : '#organogram' , contextRoot : "/",lang:GO_LOCALE, isOrgServiceOn : useOrgAccess}));
		organogram.on("show:profile", function(e, data) {
			showMemberCard(e, data.id);
	    });
		organogram.on("show:dept_profile", function(e, data) {
			showdeptMemberCard(e, data.id);
	    });
	    organogram.on("show:sendmail", function(e, data) {
	    	var param ={};
	    	var toAddr = "";
	    	if(data.rel=="org"){
	    		toAddr ="\""+data.name+"\" <#"+data.id+">";
	    	}else{
	    		toAddr = "\""+data.name+"\" <"+data.email+">";
	    	}
	    	param.to = toAddr;
			goWrieLoad(param);
	    });
	    organogram.on("show:calendar", function(e, data) {
	    	window.location = "/app/calendar/user/"+data.id;
	    });
	}else{
		jQuery("#organogram").hide();
	}
}

function showMemberCard(event, id) {
	offset = {
			top : jQuery(event.target).offset().top - 22,
			left : jQuery(event.target).offset().left+190
	};
	jQuery.get("/api/user/profile/"+id,"",function(result) {
		if (result.code != "200") return;
		result.data.isOrgServiceOn = useOrgAccess;
		result.data.isAvailableMail = USE_MAIL;
		result.data.isAvailableCal = USE_CALENDAR;
		result.data.isDepartmentInfoVisible = isDepartmentInfoVisible(result.data);
		result.data.contact = getSubContactInfo(result.data);
		result.data.rightSpaceItems = getRightSpaceItems(result.data);
		result.data.displayRightSpace = getRightSpaceStatus(result.data.rightSpaceItems);
		result.data.isSessionId = (result.data.id == SESSION_ID) ? true : false;
		result.data.mailExposure = MAIL_EXPOSURE;
		result.data.deptName = jQuery.isEmptyObject(result.data.deptMembers[0]) ? "" : result.data.deptMembers[0].deptName;
		var width = result.data.displayRightSpace ? 482 : 200;

		var handlebarsTemplate = getHandlebarsTemplate("mail_member_card_tmpl",result.data);
		jQuery.goPopup({
			id: 'mail_member_card_popup',
			pclass: 'layer_member_card_type2',
			modal:false,
			width:width,
			offset:offset,
			isDrag:true,
			handle : ".handle",
			contents: handlebarsTemplate,
			openCallback : function(){
				if(result.data.rootDept){
	            	jQuery(".company").hide();
            	}
				jQuery("#mail_member_card_popup header").remove();
				jQuery("#mail_member_card_popup").css("z-index","99");
				jQuery("#mail_member_card_popup div.content").on("click","a", function(event) {

					var type = jQuery(this).attr("evt-rol");
					if (!type) return;
					event.preventDefault();
					if (type == "write-mail") {
						var email = jQuery(this).data("email");
						var name = jQuery(this).data("name");
						var title = jQuery(this).data("title");
						var deptName = jQuery(this).data("dept-name");

						if(CURRENTMENU == "file") {
							var toAddr = name;
							if(title){
								toAddr+="/"+title;
							}
							if(deptName){
								toAddr+="/"+deptName;
							}
							toAddr += " <"+email+">";
							var param = {"to":toAddr};
							window.open(BASEURL + "app/mail/popup/process?data=" + encodeURIComponent(JSON.stringify(param)),"popupRead"+Math.floor(Math.random()*1000000)+1,"scrollbars=yes,resizable=yes,width=940,height=790");
						} else {
							var toAddr = "\""+name;
							if(title){
								toAddr+="/"+title;
							}
							if(deptName){
								toAddr+="/"+deptName;
							}
							toAddr += "\" <"+email+">";
							var param = {"to":toAddr};
							//goWrieLoad(param);
							popupWriteLoad(param);
						}
					} else if (type == "view-schedule") {
						window.location = "/app/calendar/user/"+id;
					} else if (type == "view-photo") {
						var image = jQuery(this).data("path");
						var name = jQuery(this).data("name");
						jQuery.fancybox({
							'padding'		: 0,
							'href'			: image,
							'title'   		: name,
							'transitionIn'	: 'elastic',
							'transitionOut'	: 'elastic'
						});
					}
				});

				jQuery("#mail_member_card_popup div.content").on("click","span", function(event) {

					var type = jQuery(this).attr("evt-rol");
					if (!type) return;
					event.preventDefault();
					if (type == "modify-profile") {
						window.location = "/app/my/profile";
					} else if (type == "close-profile") {
						jQuery.goPopup.close();
					}
				});
			},
			closeCallback : function(){
				jQuery("#mail_member_card_popup div.content").off();
			}
		});
	},"json");
}

function createDisplayFormatOption(orgOptions, key) {
    if(!orgOptions.hasOwnProperty('displayFormats')) {
    	orgOptions['displayFormats'] = {};
    }
    var value = BASECONFIG.data.displayConfigModel[key];
    if(_.isString(value) && value.length > 0) {
        orgOptions.displayFormats[key] = convertDisplayFormat(value);
    }
}

function convertDisplayFormat(displayFormat) {
    var result = (displayFormat || '');

    result = result.replace(/\{\{/g, '{');
    result = result.replace(/\}\}/g, '}');

    return result;
}


function isDepartmentInfoVisible(data) {

	return !jQuery.isEmptyObject(data.deptMembers) && data.profileExposureInfoModel.duty
}

function getRightSpaceItems(data) {

	var rightSpaceItems = [];
	rightSpaceItems.push({
		"isHeader": true,
		"display": (!_.isEmpty(data.selfInfo) && data.profileExposureInfoModel.selfInfo),
		"class": "",
		"value": data.selfInfo
	});
	rightSpaceItems.push({
		"isHeader": false,
		"display": (!_.isEmpty(data.employeeNumber) && data.profileExposureInfoModel.employeeNumber),
		"class": "ic_profile ic_profile_num",
		"value": data.employeeNumber
	});
	rightSpaceItems.push({
		"isHeader": false,
		"display": (!_.isEmpty(data.job) && data.profileExposureInfoModel.job),
		"class": "ic_profile ic_profile_job",
		"value": data.job
	});
	rightSpaceItems.push({
		"isHeader": false,
		"display": (!_.isEmpty(data.location) && data.profileExposureInfoModel.location),
		"class": "ic_profile ic_profile_position",
		"value": data.location
	});
	rightSpaceItems.push({
		"isHeader": false,
		"display": (!_.isEmpty(data.homePage) && data.profileExposureInfoModel.homePage),
		"class": "ic_profile ic_profile_homepage",
		"value": data.homePage
	});
	rightSpaceItems.push({
		"isHeader": false,
		"display": (!_.isEmpty(data.messanger) && data.profileExposureInfoModel.messanger),
		"class": "ic_profile ic_profile_msn",
		"value": data.messanger
	});
	rightSpaceItems.push({
		"isHeader": false,
		"display": (!_.isEmpty(data.birthday) && data.profileExposureInfoModel.birthday),
		"class": "ic_profile ic_profile_birth",
		"value": moment(data.birthday).format("YYYY-MM-DD")
	});
	rightSpaceItems.push({
		"isHeader": false,
		"display": (!_.isEmpty(data.anniversary) && data.profileExposureInfoModel.anniversary),
		"class": "ic_profile ic_profile_spacial",
		"value": moment(data.anniversary).format("YYYY-MM-DD")
	});
	rightSpaceItems.push({
		"isHeader": false,
		"display": (!_.isEmpty(data.address) && data.profileExposureInfoModel.address),
		"class": "ic_profile ic_profile_address",
		"value": data.address
	});
	rightSpaceItems.push({
		"isHeader": false,
		"display": (!_.isEmpty(data.memo) && data.profileExposureInfoModel.memo),
		"class": "ic_profile ic_profile_meno",
		"value": data.memo
	});

	return rightSpaceItems;
}

function getRightSpaceStatus(rightSpaceItems) {

	var displayRightSpace = false;

	jQuery.each(rightSpaceItems, function(index, item) {
		displayRightSpace = displayRightSpace || item.display;
	});

	return displayRightSpace;
}

function getSubContactInfo(data) {
	var contact = [];
	if (data.mobileNo && data.profileExposureInfoModel.mobileNo) {
		contact.push({
			isTop: contact.length % 2 == 0 ? true : false,
			isMobile: true,
			number: data.mobileNo
		});
	}
	if (data.repTel && data.profileExposureInfoModel.repTel) {
		contact.push({
			isTop: contact.length % 2 == 0 ? true : false,
			isRepTel: true,
			number: data.repTel
		});
	}
	if (data.directTel && data.profileExposureInfoModel.directTel) {
		contact.push({
			isTop: contact.length % 2 == 0 ? true : false,
			isDirectTel: true,
			number: data.directTel
		});
	}
	if (data.fax && data.profileExposureInfoModel.fax) {
		contact.push({
			isTop: contact.length % 2 == 0 ? true : false,
			isFax: true,
			number: data.fax
		});
	}
	return contact;
}

function showdeptMemberCard(event, id) {
    offset = {
            top : jQuery(event.target).offset().top+100,
            left : jQuery(event.target).offset().left+190
    };
    jQuery.get("/api/department/profile/"+id,"",function(result) {
        if (result.code != "200") return;
        result.data.email = (result.data.emailId != "" ? result.data.email:false) || false;
        result.data.masterName = result.data.masterName == "" ? " -" : result.data.masterName;
		result.data.isAvailableMail = USE_MAIL; //메일을 사용할수 없는 사용자는 메일 보내기가 되면 안된다.
        jQuery.goPopup({
            id: 'mail_dept_card_popup',
            pclass: 'layer_card',
            width:220,
            modal:false,
            isDrag:true,
			handle : ".handle",
            offset:offset,
            contents: getHandlebarsTemplate("mail_dept_card_tmpl",result.data),
            openCallback : function(){

            	if(result.data.parentCode == undefined){
	            	jQuery(".company").hide();
            	}
            	if(result.data.childrenCount <= 0 || result.data.memberCount <= 0) {
            		jQuery("#noChildren").show();
            		jQuery("#hasChildren").hide();
            	}else{
            		jQuery("#noChildren").hide();
            		jQuery("#hasChildren").show();
            	}

            	jQuery("#mail_dept_card_popup").css("z-index","99");
                jQuery("#mail_dept_card_popup div.content").on("click","a", function(event) {
                    var type = jQuery(this).attr("evt-rol");
                    if (!type) return;
                    event.preventDefault();
                    if (type == "write-mail") {
                        var name = jQuery(this).data("name");
                        var email = jQuery(this).data("email");
						if(CURRENTMENU == "file") {
							var toAddr = name+" <"+email+">";
							var param = {"to":toAddr};
							window.open(BASEURL + "app/mail/popup/process?data=" + encodeURIComponent(JSON.stringify(param)),"popupRead"+Math.floor(Math.random()*1000000)+1,"scrollbars=yes,resizable=yes,width=940,height=790");
						} else {
							var toAddr ="\""+name+"\" <"+email+">";
	                        var param = {"to":toAddr};
                        	//goWrieLoad(param);
                        	popupWriteLoad(param);
						}
                    }
                });
            },
            closeCallback : function(){
                jQuery("#mail_dept_card_popup div.content").off();
            }
        });
    },"json");
}
</script>

<script id="mail_member_card_tmpl" type="text/x-handlebars-template">
{{#if name}}
<div style="position: absolute; top: 0; left: 0; width: 100%; display: inline-block; height: 100%; cursor: move; z-index: -1" class="handle"></div>


<div class="info_main">
	<span class="ic_profile ic_close" evt-rol="close-profile" data-type="close" data-bypass></span>

	{{#if isSessionId}}
	<span class="ic_profile ic_modify" evt-rol="modify-profile" data-type="modify" data-bypass></span>
	{{/if}}

	<span class="wrap_photo" evt-rol="photo"><img alt="{{name}}" src="{{thumbSmall}}" title="{{name}}"></span>
	<div class="wrap_list_info">
		<ul class="list_info">
			<li>
				<span class="name">{{name}} {{#if profileExposureInfoModel.position}}{{position}}{{/if}}</span>
			</li>
			{{#if mailExposure}}
			{{#if profileExposureInfoModel.email}}
			<li>
				<span class="mail">{{email}}</span>
			</li>
			{{/if}}
			{{/if}}
			<li>
				<p class="company">{{companyName}}</p>
			</li>
			{{#if isOrgServiceOn}}
			<li>
				<p class="department">
						{{#each deptMembers}}
							{{#if isDepartmentInfoVisible}} {{deptName}} {{dutyName}} {{/if}} {{#if profileExposureInfoModel.grade}} {{grade}} {{/if}} {{#if isDepartmentInfoVisible}}{{#if parentsDeptPath}} <span class="ic_v2 ic_profile ic_profile_tooltip" title="{{parentsDeptPath}}" ></span> {{/if}}{{/if}}<br/>
						{{/each}}
				</p>
			</li>
			{{/if}}
		</ul>
		<ul class="list_info list_phone">
		{{#each contact}}
			<li {{#if isTop}}class="first"{{/if}}>
				<span class="tit">
					{{#if isMobile}}
					<tctl:msg key="common.org.mobileno" />
					{{/if}}
					{{#if isDirectTel}}
					<tctl:msg key="common.org.directtel" />
					{{/if}}
					{{#if isRepTel}}
					<tctl:msg key="common.org.reptel" />
					{{/if}}
					{{#if isFax}}
					<tctl:msg key="common.org.fax" />
					{{/if}}
				</span>
			<span class="num_phone">{{number}}</span>
			</li>
		{{/each}}
		</ul>
	</div>
	<div class="btn_func">
		{{#if isAvailableMail}}
		<a class="btn_v2_normal btn_v2_mail" evt-rol="write-mail" data-type="mail" data-name="{{name}}" data-email="{{email}}" data-dept-name="{{deptName}}" data-title="{{position}}" target="_blank" data-bypass>
			<span class="ic_v2 ic_v2_mail"></span>
			<span class="txt"><tctl:msg key="common.org.email" /></span>
		</a>
		{{/if}}
		{{#if isAvailableCal}}
		<a class="btn_v2_normal btn_v2_calendar" evt-rol="view-schedule" data-type="calendar" data-bypass>
			<span class="ic_v2 ic_v2_calendar"></span>
			<span class="txt"><tctl:msg key="common.org.schedule" /></span>
		</a>
		{{/if}}
	</div>
</div>


<div class="info_more" {{#if displayRightSpace}}style="display:"{{else}}style="display:none"{{/if}}>

	{{#each rightSpaceItems}}

		{{#if isHeader}}

			{{#if display}}
				<p class="indroduce">{{value}}</p>
			{{/if}}

		{{else}}
			<ul class="list_info_more">
			{{#if display}}
			<li>
				<span class="{{class}}"></span>
				<span class="item">{{value}}</span>
			</li>
			{{/if}}
			</ul>
		{{/if}}
	{{/each}}

</div>

<%--<div style="position: absolute; bottom: 0; left: 0; width: 100%; display: inline-block; height: 15px" class="handle"></div>--%>
{{else}}
<div class="member_wrap">
    <span class="photo">
        <img src="/resources/images/photo_profile_sample.jpg">
    </span>
    <div class="info_noti">
        <p class="desc"><tctl:msg key="common.deleted.account" /></p>
    </div>
</div>
{{/if}}
</script>
<script id="mail_dept_card_tmpl" type="text/x-handlebars-template">
<div style="position: absolute; top: 0; left: 0; width: 89%; display: inline-block; height: 100%; cursor: move; z-index: -1" class="handle"></div>
	<div class="member_wrap">
            <div class="info">
				<p class="company">{{companyName}}</p>
                <span href="#" class="name">{{name}}</span>
                <span class="department">
                  {{#each_with_index ancestors}}
                    {{name}}{{#unless isLast}} > {{/unless}} 
                  {{/each_with_index}}
                </span>
            </div>
        <div class="info_meta">
            <span class="meta"><tctl:msg key="common.org.dept.manager" /> : {{masterName}} {{masterPosition}}</span>
            <span id="noChildren" class="meta"><tctl:msg key="common.org.dept.staff" /> : {{subDeptMemberCount}}<tctl:msg key="common.person.unit" /></span>
			<span id="hasChildren" class="meta"><tctl:msg key="common.org.dept.staff" /> : {{subDeptMemberCount}}<tctl:msg key="common.person.unit" /> ({{memberCount}} <tctl:msg key="common.person.unit" />)</span>
        </div>
</div>
        {{#if email}}
        <ul class="menber_menu">
			{{#if isAvailableMail}}
            <li class="mail"><a href="#" evt-rol="write-mail" data-name="{{name}}" data-email="{{email}}"><span class="ic"></span><tctl:msg key="comn.org.send.mail.title" /></a></li>
			{{/if}}
        </ul>
        {{/if}}
<%--<div style="position: absolute; bottom: 0; left: 0; width: 100%; display: inline-block; height: 15px" class="handle"></div>--%>
</script>
