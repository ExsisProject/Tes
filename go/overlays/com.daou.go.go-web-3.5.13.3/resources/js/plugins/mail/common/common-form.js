function addMailList(txtObj, selObj, maxCnt, myEmail, onlyEmail, type) {	
	var address = txtObj.val().toLowerCase();
	var name = get_name(address);
	var email = get_email(address);
	myEmail = myEmail.toLowerCase();

	if(!validateInputValue(txtObj,0,255,"onlyBack")) {
		return;
	}
	
	if (email == myEmail) {
		jQuery.goMessage(mailMsg.common_form_001);
		txtObj.select();
		return ;
	}
	
	if (selObj.length >= maxCnt) {
		jQuery.goMessage(msgArgsReplace(mailMsg.common_form_002,[maxCnt]));
		txtObj.select();
		return;
	}
	
	if (trim(txtObj.val()) == "") {
        jQuery.goMessage(mailMsg.common_form_003);
        txtObj.select();
        return;
    }
	
	if (!onlyEmail) {
		if(!isEmail(email) && !isMailDomain(email)){
			jQuery.goMessage(mailMsg.common_form_004);
			txtObj.select();
	        return;
		}
	} else {
		if(!isEmail(email)){
			jQuery.goMessage(mailMsg.common_form_004);
			txtObj.select();
	        return;
		}
	}
	
	if (dupCheck(txtObj.val(), selObj)) {
		jQuery.goMessage(mailMsg.common_form_005);
		txtObj.select();
		return;
	}
		
	if (type == "w") {
		jQuery("#whiteList").append("<tr id = 'whiteList_txt'><td class='txt'>"+
				email+"</td><td class='align_r'>" +
				"<span class='btn_fn7' evt-rol = 'mail-white-delete'><span class='txt_caution'>"+mailMsg.comn_del+"</span></span></td></tr>");			
	} else if (type == "b") {
		jQuery("#blackList").append("<tr id = 'blackList_txt'><td class='txt'>"+
				email+"</td><td class='align_r'>" +
				"<span class='btn_fn7' evt-rol = 'mail-black-delete'><span class='txt_caution'>"+mailMsg.comn_del+"</span></span></td></tr>");			
	} else if (type == "f") {		
		jQuery("#forwardMailList").append("<tr id='forward_mail_list'><td class='forwardMailList'>"+
				email+"</td><td class='align_r'>" +
				"<span class='btn_fn7' evt-rol = 'forward-mail-delete'><span class='txt_caution'>"+mailMsg.comn_del+"</span></span></td></tr>");
	}  else if (type == "e") {		
		jQuery("#defineForwardingList").append("<li><input type='checkbox' />&nbsp;<span class='txt'>"+email+"</span></li>");
	} else if (type == "r") {
		jQuery("#mail_add_list").append("<tr id='reply_mail_list'><td class='reply_address'>"+
				email+ "</td><td class='align_r'>" +
				"<span class='btn_fn7' evt-rol='reply-mail-delete'><span class='txt_caution'>"+mailMsg.comn_del+"</span></span></td></tr>");
	}
}

function dupCheck(txtObj, selObj) {
	var isDup = false;	
	for (var i = 0; i < selObj.length; i++) {
		if (txtObj == selObj[i].value) {
			isDup = true;
			break;
		}
	}	
	return isDup;
}

function addList(txtObj, selObj, maxCnt,myEmail,onlyEmail) {
	var address = txtObj.value.toLowerCase();
	var name = get_name(address);
	var email = get_email(address);
	
	if(!checkInputLength("", txtObj, "", 0, 255, true)) {
		return;
	}
	
	if (email == myEmail) {
		alert(mailMsg.common_form_001);
		txtObj.select();
		return ;
	}
	
	if (selObj.length >= maxCnt) {
		alert(msgArgsReplace(mailMsg.common_form_002,[maxCnt]));
		txtObj.select();
		return;
	}
	
	if (trim(txtObj.value) == "") {
        alert(mailMsg.common_form_003);
        txtObj.select();
        return;
    }
	
	if (!onlyEmail) {
		if(!isEmail(email) && !isMailDomain(email)){
			alert(mailMsg.common_form_004);
			txtObj.select();
	        return;
		}
	} else {
		if(!isEmail(email)){
			alert(mailMsg.common_form_004);
			txtObj.select();
	        return;
		}
	}
	
	if (dup_check(txtObj, selObj)) {
		alert(mailMsg.common_form_005);
		txtObj.select();
		return;
	}
	
	selObj.options[selObj.length] = new Option(email, email);

    txtObj.value = "";
}

function searchList(txtObj, selObj) {
	var address = txtObj.value.toLowerCase();

	clearSelObj(selObj);

	var isPattern = false;
	
	if (trim(txtObj.value) == "") {
        alert(mailMsg.common_form_006);
        return;
    }

	for (var i = 0; i < selObj.length; i++) {
		if (selObj.options[i].text.indexOf(address) >= 0) {
			selObj.options[i].selected = true;
			isPattern = true;
		}
	}

}

function clearSelObj(selObj) {
	for (var i = 0; i < selObj.length; i++) {
		selObj.options[i].selected = false;
	}
}

function selectAll(list,select) {
	
	var bool = true;
	
	for (i=0; i < list.length; i++) {
        list.options[i].selected = bool;
    }
}

function deleteList(selObj) {
	move = new Array();
	var count=0;
	for(i=0;i<selObj.options.length;i++){
		if(selObj.options[i].selected){
			move[count] = selObj.options[i].text;
			 count++;
		}
	}
	
	if (count == 0) {
		alert(mailMsg.common_form_007);
		return;
	}
	else if (count > 0) {
		if(!confirm(mailMsg.common_form_009)) {
			return;
		}
	}
	
	for(i=0;i<move.length;i++){
		for(j=0;j<selObj.options.length;j++){
			if(selObj.options[j].text==move[i]) {
				if(getBrowserType() == "ie" || getBrowserType() == "opera")
				selObj.options.remove(j);
				else if(getBrowserType() == "nav" || getBrowserType() == "gecko")
				selObj.options[j] = null;
			}
		}
	}
}

function initBirthday(formatId, yearMsg, monthMsg, dayMsg) {
	var dformat ='yy'+yearMsg+' mm'+monthMsg+' dd'+dayMsg;
	if (LOCALE == "en") dformat="yymmdd";
	
	var date = new Date();
	var end = date.getFullYear();
	date.setFullYear(end - 100);
	var start = date.getFullYear();
	jQuery("#"+formatId).datepick({dateFormat:dformat, yearRange:start+":"+end});
}

function setupBirthday(formatId, valueId, yearMsg, monthMsg, dayMsg) {
	var birthday = jQuery.trim(jQuery("#"+valueId).val());
	if (birthday != "" && birthday.length == 8) {
		var year = birthday.substring(0,4)+yearMsg;
		var month = birthday.substring(4,6)+monthMsg;
		var day = birthday.substring(6,8)+dayMsg;
		if (LOCALE != "en") {
			birthday = year+" "+month+" "+day;
		} 
		jQuery("#"+formatId).val(birthday);
	}
}

function settingBirthday(formatId, valueId) {
	var birthdayText = jQuery.trim(jQuery("#"+formatId).val());
	if (birthdayText != "" && LOCALE != "en") {
		var birthData = birthdayText.split(" ");
		var year = birthData[0].substring(0,4);
		var month = birthData[1].substring(0,2);
		var day = birthData[2].substring(0,2);

		birthdayText = year+""+month+""+day;
	}
	jQuery("#"+valueId).val(birthdayText);
}

function moveSelectList(sourceId, targetId) {
	
	var selectedIndex = $(sourceId).selectedIndex;
	var searchListOptions = $(sourceId).options;
	var targetListOptions = $(targetId).options;
	if(selectedIndex < 0){
		alert(mailMsg.error_noselect);
		return;
	}
	
	var uid, text, suid;	
	for (var i = 0; i < searchListOptions.length ; i++) {
		if (searchListOptions[i].selected) {
			uid = searchListOptions[i].value;
			text = searchListOptions[i].text;
			var isExist = false;
			for ( var j = 0; j < targetListOptions.length; j++) {
				suid = targetListOptions[j].value;
				if(uid == suid){
					isExist = true;
					break;
				}
			}	
			
			if(!isExist){
				var option = jQuery("<option></option>").attr("value",uid).attr("title",text).append(text);
				jQuery("#"+targetId).append(option);
			}
			searchListOptions[i] = null;
			i--;
		}
	}
}

function checkSelectDup(selectId, value){
	var selectOption = jQuery("#"+selectId+" option");
	var isExist = false;
	for ( var i = 0; i < selectOption.length; i++) {
		if(value == jQuery(selectOption[i]).attr("value")){
			isExist = true;
			break;
		}
	}
	return isExist;
}

function removeSelectList(selectId){
	var selectListOptions = $(selectId).options;
	
	for (var i = 0; i < selectListOptions.length;) {
		if (selectListOptions[i].selected) {
			if(getBrowserType() == "ie" || getBrowserType() == "opera")
				$(selectId).options.remove(i);
			else if(getBrowserType() == "nav" || getBrowserType() == "gecko")
				$(selectId).options[i] = null;
		} else {
			i++;
		}
	}
}