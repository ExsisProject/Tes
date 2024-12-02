var POPUPDATA = {};

function getPopupData() {
	return POPUPDATA;
}

var progressBarOpt = {
	boxImage: '/resources/images/progressbar.gif',
	barImage: '/resources/images/progressbg_green_50.gif',
	width: 100
};

function ocx_file() {
	var ocx = document.uploadForm.powerupload;
	ocx.AttachFile();
}

function ocx_init() {
	var ocx = document.uploadForm.powerupload;
	ocx.SetAttachDuedate(Math.floor(BIGATTACH_EXPIRE_DATE.getTime() / 1000));
	ocx.SetAttachMaxSize("HUGE", MAX_BIG_ATTACH_SIZE);
	ocx.SetAttachMaxSize("NORMAL", 1024 * 1024 * MAX_ATTACH_SIZE);
	ocx.SetUrlData("UPLOAD", goHostInfo + "/api/mail/file/upload");
	ocx.SetUrlData("UPFIELD", "theFile");

	jQuery("#ocx_normal_size").html(printSize(0));
	jQuery("#ocx_huge_size").html(printSize(0));
	jQuery("#ocx_huge_quota").html(printSize(BIG_ATTACH_QUOTA));
}

function deleteOcxFileAll() {
	var ocx = document.uploadForm.powerupload;
	var count = ocx.GetAttachedFileCount();
	for (var i = 0; i < count; i++) {
		ocx.DetachFile(0);
	}
}

function updateHugeQuota(useageQuota) {
	BIG_ATTACH_QUOTA = MAX_BIG_ATTACH_QUOTA - useageQuota;
	BIG_ATTACH_QUOTA = (BIG_ATTACH_QUOTA < 0) ? 0 : BIG_ATTACH_QUOTA;
	if (isOcxUpload) {
		var ocx = document.uploadForm.powerupload;
		jQuery("#ocx_huge_quota").html(printSize(BIG_ATTACH_QUOTA));
		ocx.SetAttachMaxSize("HUGE", MAX_BIG_ATTACH_SIZE);
	} else {
		jQuery("#basic_huge_quota").html(printSize(BIG_ATTACH_QUOTA));
		basicAttachUploadControl.setAttachSize("hugeMax", BIG_ATTACH_QUOTA);
	}
}

function ocx_upload() {
	var ocx = document.uploadForm.powerupload;
	ocx.SetUploadParam("type", "ocx");
	ocx.SetUploadParam("writeFile", "true");
	ocx.SetUploadParam("upldtype", "upld");
	ocx.SetUploadParam("attfile", "true");
	ocx.SetUploadParam("userId", "mailadm");
	ocx.SetUploadParam("queryValue", "Successful");
	ocx.SetUploadParam("text", "text");
	ocx.SetUploadParam("uploadType", "power");
	ocx.SetUploadParam("regdate", today.getTime());
	return ocx.UploadFiles();
}

function makeBigAttachContent() {
	var bigAttachInfo = {};
	var html;
	var linkArray = null;
	var big_cnt = 0;
	var bigAttachInfos = [];
	var type, size, filename, filepath, uid, link;
	var bigAttachInfo;

	if (isOcxUpload) {
		var ocx = document.uploadForm.powerupload;
		var cnt = ocx.GetAttachedFileCount();

		for (var i = 0; i < cnt; i++) {
			type = ocx.GetAttachedFileAttr(i, "TYPE");
			upkey = ocx.GetAttachedFileAttr(i, "UPKEY");
			size = ocx.GetAttachedFileAttr(i, "SIZE");
			filename = ocx.GetAttachedFileAttr(i, "FILENAME2");
			filepath = ocx.GetAttachedFileAttr(i, "FILEPATH");
			uid = ocx.GetAttachedFileAttr(i, "UID");

			filename = Base64TMS.decode(filename);
			if (type == "huge") {
				bigAttachInfos.push({"size": size, "fileName": filename, "uid": uid});
			}
		}
	} else {
		var hugeFiles = basicAttachUploadControl.getFileList("huge");
		for (var i = 0; i < hugeFiles.length; i++) {
			size = hugeFiles[i].size;
			filename = hugeFiles[i].name;
			uid = hugeFiles[i].uid;
			bigAttachInfos.push({"size": size, "fileName": filename, "uid": uid});
		}
	}

	var redirectUrl = "";
	var port = (window.location.port) ? ':' + window.location.port : '',
		redirectUrl = window.location.protocol + '//' + window.location.hostname + port;
	/*var big_str = '<br><br>'
		+ '<table class="tb_attachFile" width="100%" style="table-layout:fixed; border:1px solid #e6e6e6; margin:10px 0 20px; padding:0; font-size: 12px" cellspacing="0" cellpadding="0">'
		+ '<thead>'
		+ '<tr>'
		+ '<th style="padding:8px; text-align:left; background-color:#F7F7F7; border-bottom:1px solid #e6e6e6; cursor: default">'
		+ '<img src="'+redirectUrl+'/mail/design/images/ic_clip.png" style="vertical-align:middle; height:16px; margin-right:5px" />'
		+ '<span style="display:inline-block; vertical-align:middle;"> ' + mailMsg.bigattach_06+ '</span>' 
		+ '<span style="display:inline-block; vertical-align:middle; color:#2EACB3; font-weight:normal; font-size: 12px">&nbsp;&nbsp;'+bigAttachInfos.length+'</span>'
		+ '<span style="display:inline-block; vertical-align:middle; font-weight:normal; font-size: 12px">' +mailMsg.mail_unit_count+'</span>'										
		+ '</th>'									
		+ '</tr>'
		+ '</thead>'
		+ '<tbody>';*/
	var big_str_eng = '<table class="tb_attachFile" width="100%" style="table-layout:fixed; border:1px solid #e6e6e6; margin:10px 0 20px; padding:0; font-size: 12px" cellspacing="0" cellpadding="0">'
		+ '<thead>'
		+ '<tr>'
		+ '<th style="padding:8px; text-align:left; background-color:#F7F7F7; border-bottom:1px solid #e6e6e6; cursor: default">'
		+ '<img src="'+redirectUrl+'/resources/images/ic_clip.png" style="vertical-align:middle; height:16px; margin-right:5px" />'
		+ '<span style="display:inline-block; vertical-align:middle;"> ' + mailMsg.bigattach_06+ '</span>' 
		+ '<span style="display:inline-block; vertical-align:middle; color:#2EACB3; font-weight:normal; font-size: 12px">&nbsp;&nbsp;'+bigAttachInfos.length+'</span>'
		+ '<span style="display:inline-block; vertical-align:middle; font-weight:normal; font-size: 12px">' +mailMsg.mail_unit_count+'</span>'
		//+ '<span style="display:inline-block; vertical-align:middle; color:#2EACB3; font-weight:normal; font-size: 12px">&nbsp;&nbsp;'+bigAttachInfos.length+'</span>'
		//+ '<span style="display:inline-block; vertical-align:middle; font-weight:normal; font-size: 12px;font-family:AppleGothic,arial,Helvetica,sans-serif"></span>'										
		+ '</th>'									
		+ '</tr>'
		+ '</thead>'
		+ '<tbody>';
	var big_str = '<table class="tb_attachFile" width="100%" style="table-layout:fixed; border:1px solid #e6e6e6; margin:10px 0 20px; padding:0; font-size: 12px" cellspacing="0" cellpadding="0">'
		+ '<thead>'
		+ '<tr>'
		+ '<th style="padding:8px; text-align:left; background-color:#F7F7F7; border-bottom:1px solid #e6e6e6; cursor: default">'
		+ '<img src="'+redirectUrl+'/resources/images/ic_clip.png" style="vertical-align:middle; height:16px; margin-right:5px" />'
		+ '<span style="display:inline-block; vertical-align:middle;"> ' + mailMsg.bigattach_06+ '</span>' 
		+ '<span style="display:inline-block; vertical-align:middle; color:#2EACB3; font-weight:normal; font-size: 12px">&nbsp;&nbsp;'+bigAttachInfos.length+'</span>'
		+ '<span style="display:inline-block; vertical-align:middle; font-weight:normal; font-size: 12px">' +mailMsg.mail_unit_count+'</span>'
		+ '<span style="display:inline-block; vertical-align:middle;font-family:AppleGothic,arial,Helvetica,sans-serif">&nbsp;&nbsp;(Large Attachment <span style="display:inline-block; vertical-align:middle; color:#2EACB3; font-weight:normal; font-size: 12px">&nbsp;&nbsp;' + bigAttachInfos.length + '</span> ) </span>'
		//+ '<span style="display:inline-block; vertical-align:middle; color:#2EACB3; font-weight:normal; font-size: 12px">&nbsp;&nbsp;'+bigAttachInfos.length+'</span>'
		//+ '<span style="display:inline-block; vertical-align:middle; font-weight:normal; font-size: 12px;font-family:AppleGothic,arial,Helvetica,sans-serif"></span>'										
		+ '</th>'									
		+ '</tr>'
		+ '</thead>'
		+ '<tbody>';

	if (bigAttachInfos.length > 0) {
		linkArray = [];
		for (var i = 0; i < bigAttachInfos.length; i++) {
			bigAttachInfo = bigAttachInfos[i];
			size = bigAttachInfo.size;
			filename = bigAttachInfo.fileName;
			linkArray.push("email=" + USEREMAIL + "&uid=" + bigAttachInfo.uid);
			
	       	big_str_eng += '<tr>'
	       		+ '<td style="padding: 8px; box-sizing: border-box; border-bottom: 1px solid #e6e6e6; background-color: #f7f7f7;">'
	       		+ '<a href="{tims_bigattach_link_' +i+'}" style="vertical-align: middle; line-height: 22px; text-decoration: none; color: #333; margin-right: 3px;font-family:AppleGothic,arial,Helvetica,sans-serif">' + filename + '</a>'
				+ '<span style="font-family: tahoma, dotum; color: #999; font-size: 11px; margin-right: 5px;font-family:AppleGothic,arial,Helvetica,sans-serif">(' +printSize(size)+ ')</span>'												
				+ '<a target="_self" href="{tims_bigattach_link_' +i+'}" ><img src="'+redirectUrl+'/resources/images/ic_mail_download.gif" style="vertical-align: middle; margin-top: -2px; padding: 4px; border-style: none" title="download"></a>'
				+ '</td>'
				+ '</tr>';
	       	
	       	big_str += '<tr>'
	       		+ '<td style="padding: 8px; box-sizing: border-box; border-bottom: 1px solid #e6e6e6; background-color: #f7f7f7;">'
	       		+ '<a href="{tims_bigattach_link_' +i+'}" style="vertical-align: middle; line-height: 22px; text-decoration: none; color: #333; margin-right: 3px;font-family:AppleGothic,arial,Helvetica,sans-serif">' + filename + '</a>'
				+ '<span style="font-family: tahoma, dotum; color: #999; font-size: 11px; margin-right: 5px;font-family:AppleGothic,arial,Helvetica,sans-serif">(' +printSize(size)+ ')</span>'												
				+ '<a target="_self" href="{tims_bigattach_link_' +i+'}" ><img src="'+redirectUrl+'/resources/images/ic_mail_download.gif" style="vertical-align: middle; margin-top: -2px; padding: 4px; border-style: none" title="download"></a>'
				+ '</td>'
				+ '</tr>';

			big_cnt++;
		}
	}
	
	big_str_eng += '<tr>'
		+ '<td style="background-color:#F7F7F7; padding:9px 8px; font-family:AppleGothic,arial,Helvetica,sans-serif; line-height: 16px"><span style="color:#3b3b3b">'+mailMsg.bigattach_17+' </span>'+msgArgsReplace(mailMsg.bigattach_16,[BIGATTACH_EXPIRE,BIGATTACH_DOWNCNT])+ ' : <span style="color:red">'+" ~ "+BIGATTACH_EXPIRE_DATE.getFullYear()+"-"+(BIGATTACH_EXPIRE_DATE.getMonth()+1)+"-"+BIGATTACH_EXPIRE_DATE.getDate()+'</span><span style="padding-left:5px">'+BIGATTACH_TIMEZONE+'</span></td>'
		+ '</tr>'
		+ '</tbody>'
		+ '</table>';
	
	big_str += '<tr>'
		+ '<td style="background-color:#F7F7F7; padding:9px 8px; font-family:AppleGothic,arial,Helvetica,sans-serif; line-height: 16px"><span style="color:#3b3b3b">'+mailMsg.bigattach_17+' - </span>'+msgArgsReplace(mailMsg.bigattach_16,[BIGATTACH_EXPIRE,BIGATTACH_DOWNCNT])+'<span style="color:#3b3b3b;"> (Download available for ' + BIGATTACH_EXPIRE + 'days) : <span style="color:red">'+" ~ "+BIGATTACH_EXPIRE_DATE.getFullYear()+"-"+(BIGATTACH_EXPIRE_DATE.getMonth()+1)+"-"+BIGATTACH_EXPIRE_DATE.getDate()+'</span></span><span style="padding-left:5px">'+BIGATTACH_TIMEZONE+'</span></td>'
		+ '</tr>'
		+ '</tbody>'
		+ '</table>';

	if (big_cnt > 0) {
		bigAttachInfo.mode = true;
		if (LOCALE == "en") {
			bigAttachInfo.html = big_str_eng;
		} else {
			bigAttachInfo.html = big_str;
		}
		bigAttachInfo.links = linkArray;
	} else {
		bigAttachInfo.mode = false;
		bigAttachInfo.html = "";
		bigAttachInfo.links = linkArray;
	}

	return bigAttachInfo;
}

function hugeMailCheck() {
	var hugeSize;
	if (isOcxUpload) {
		var ocx = document.uploadForm.powerupload;
		hugeSize = ocx.GetAttachedSize("HUGE");
	} else {
		hugeSize = basicAttachUploadControl.getAttachSize("hugeUse");
	}

	var chkReserve = jQuery("#reservation").attr("checked");
	var reserverdObj = jQuery('#reservation');
	var securemailObj = jQuery('#securemail');

	if (hugeSize > 0 && chkReserve) {
		if (securemailObj && securemailObj.attr("disabled")) {
			chkSecureMail(true);
		}
		jQuery.goAlert("", mailMsg.write_alert006);
		chkReservedMail(false);
	} else if (hugeSize > 0 && securemailObj && securemailObj.attr("checked")) {
		if (reserverdObj.attr("disabled")) {
			chkReservedMail(true);
		}
		jQuery.goAlert("", mailMsg.write_alert005);
		chkSecureMail(false);
	} else if (hugeSize == 0) {
		if (reserverdObj.attr("disabled")) {
			chkReservedMail(true);
		} else if (securemailObj && securemailObj.attr("disabled")) {
			chkSecureMail(true);
		}
	}
}

function basic_init() {
	basicAttachUploadControl.setAttachSize("hugeMax", BIG_ATTACH_QUOTA);
	basicAttachUploadControl.setAttachSize("hugeUse", 0);
	basicAttachUploadControl.setAttachSize("normalMax", 1024 * 1024 * MAX_ATTACH_SIZE);
	basicAttachUploadControl.setAttachSize("normalUse", 0);
	jQuery("#basic_normal_size").html(printSize(0));
	jQuery("#basic_huge_size").html(printSize(0));
	jQuery("#basic_huge_quota").html(printSize(BIG_ATTACH_QUOTA));
}

function updateAttachQuota(type, size) {
	if (type == "hugeUse") {
		jQuery("#basic_huge_size").html(printSize(size));
		basicAttachUploadControl.setAttachSize("hugeUse", size);
	} else if (type == "normalUse") {
		jQuery("#basic_normal_size").html(printSize(size));
		basicAttachUploadControl.setAttachSize("normalUse", size);
	}
}

var uploadAttachFilesError = false;
var uploadAttachFilesComplete = true;
var basicUploadListeners = {
	swfuploadLoaded: function (event) {
		setTitleBar(TITLENAME);
	},
	fileQueued: function (event, file) {
		var size = file.size;
		var quota = basicAttachUploadControl.getAttachQuotaInfo();
		var isNormalOver = ((size + quota.normalUse) > quota.normalMax) ? true : false;
		var isAllowBigAttach = jQuery("#bigAttachFlagCheck").attr("checked");
		if ((isAllowBigAttach || (size > quota.normalMax) || isNormalOver)
			&& basicAttachUploadControl.getHugeUploadUse()) {

			file.type = "huge";
			if ((size + quota.hugeUse) > quota.hugeMax) {
				if (isNormalOver) jQuery.goAlert(mailMsg.comn_upload_title, mailMsg.ocx_upalert_size);
				else jQuery.goAlert(mailMsg.comn_upload_title, printSize(quota.hugeMax) + " " + mailMsg.ocx_upalert_size);
				jQuery("#basicUploadControl").swfupload("cancelUpload", file.id);
				return;
			}

			if (size > MAX_BIG_ATTACH_SIZE) {
				jQuery.goAlert(mailMsg.comn_upload_title, msgArgsReplace(mailMsg.bigattach_18, [printSize(MAX_BIG_ATTACH_SIZE)]));
				jQuery("#basicUploadControl").swfupload("cancelUpload", file.id);
				return;
			}

			jQuery("#basicUploadControl").swfupload("addFileParam", file.id, "attachtype", "huge");
			jQuery("#basicUploadControl").swfupload("addFileParam", file.id, "regdate", today.getTime());
			updateAttachQuota("hugeUse", size + quota.hugeUse);
			hugeMailCheck();
		} else {
			file.type = "normal";
			if ((size + quota.normalUse) > quota.normalMax) {
				jQuery.goAlert(mailMsg.comn_upload_title, printSize(quota.normalMax) + " " + mailMsg.ocx_upalert_size);
				jQuery("#basicUploadControl").swfupload("cancelUpload", file.id);
				return;
			}
			jQuery("#basicUploadControl").swfupload("addFileParam", file.id, "attachtype", "normal");
			updateAttachQuota("normalUse", size + quota.normalUse);
		}
		file.directUpload = true;
		basicAttachUploadControl.addAttachList(file);
		basicAttachUploadControl.addUploadQueueFile(file);
		showAttachBoxDisplay(true);
	},
	fileQueueError: function (event, file, errorCode, message) {
		if (errorCode == SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE) {
			jQuery.goAlert(mailMsg.comn_upload_title, mailMsg.ocx_virtxt_failquest);
		} else if (errorCode == SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT) {
			jQuery.goAlert(mailMsg.comn_upload_title, mailMsg.ocx_upalert_size);
		} else {
			jQuery.goAlert(mailMsg.comn_upload_title, mailMsg.error_fileupload + "[" + errorCode + "]");
		}
	},
	fileDialogStart: function (event) {
	},
	fileDialogComplete: function (event, numFilesSelected, numFilesQueued) {
		startUploadAttach();
	},
	uploadStart: function (event, file) {
		jQuery("#progress_" + file.id).progressBar(0, progressBarOpt);
	},
	uploadProgress: function (event, file, bytesLoaded) {
		var fileSize = file.size;
		var fileUploadPercent = Math.ceil(bytesLoaded / fileSize * 100);
		fileUploadPercent = (fileUploadPercent >= 100) ? 100 : fileUploadPercent;
		jQuery("#progress_" + file.id).hide();
		jQuery("#progress_" + file.id).progressBar(fileUploadPercent, progressBarOpt);
		jQuery("#progress_" + file.id).show();
		if (fileUploadPercent == 100) {
			jQuery("#progress_" + file.id).html("<img src='/resources/images/img_loader_s.gif' align='absmiddle'>");
		}
	},
	uploadSuccess: function (event, file, serverData) {
		var data = eval("(" + serverData + ")");
		if (data.uploadResult == "success" && parseInt(data.uid, 10) > -1) {
			basicAttachUploadControl.setUploadCompleteFile(file.id, data);
			jQuery("#progress_" + file.id).html('<span style="color:red">[' + mailMsg.comn_upload_complete + ']</span>');
			var totalUploadFileCount = jQuery("#basicAttachItemList tr").length;
			var queueSize = basicAttachUploadControl.getUploadQueueSize();
			jQuery("#basicAttachItemList").animate({scrollTop: ((totalUploadFileCount - queueSize + 1) * 24)}, 'slow');
		} else {
			if (!uploadAttachFilesError) {
				jQuery.goAlert(mailMsg.comn_upload_title, mailMsg.error_fileupload);
			}
			jQuery("#" + file.id).attr("checked", true);
			deletefile();
		}
	},
	uploadComplete: function (event, file) {
		if (!basicAttachUploadControl.isNextUploadQueue(file.id)) {
			uploadAttachFilesComplete = true;
		}
	},
	uploadError: function (event, file, errorCode, message) {
		if (errorCode != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED) {
			if (!uploadAttachFilesError) {
				jQuery.goAlert(mailMsg.comn_upload_title, mailMsg.error_fileupload);
				basic_init();
				uploadAttachFilesError = true;
			}
		}
	}
};

var basicAttachUploadControl;

function chgAttachMod(type, isInit) {
	var _type = type;
	var func = function () {
		var ocxCrtBtn = jQuery("#att_btn_ocx");
		var ocxChgBtn = jQuery("#crtBtnSimple");
		var ocxIncFrame = jQuery("#att_ocx_area");
		var ocxQuotaInfo = jQuery("#att_ocx_quota_info");
		var simpleCrtBtn = jQuery("#att_btn_simple");
		var simpleChgBtn = jQuery("#crtBtnPower");
		var simpleIncFrame = jQuery("#att_simple_area");
		var simpleQuotaInfo = jQuery("#att_simple_quota_info");
		var simpleFileObj = jQuery("#simpleFileInit");
		var simpleFileSubObj = jQuery("#simpleFileInitSub");

		// TODO 접근권한 적용후 show 여부 결정해야함.
		//if(MENU_STATUS.webfolder && MENU_STATUS.webfolder == "on")jQuery("#writeWebfolderBtn").show();
		//else jQuery("#writeWebfolderBtn").hide();

		if (USE_WEBFOLDER == true) jQuery("#writeWebfolderBtn").show();
		else jQuery("#writeWebfolderBtn").hide();

		try {
			// POWER UPLOAD or FILE UPLOAD
			if (_type == 'ocx') {
				isOcxUploadDownModule = false;
				if (!isOcxUploadDownModule) {
					if (USE_BIGATTACH_MODE) {
						makePoweruploadOcx("ocxCompL", LOCALE);
					} else {
						makeNormalUploadOcx("ocxCompL", LOCALE);
					}
					try {
						if (isMsie) {
							var ocx = document.uploadForm.powerupload;
							ocx.SetUrlData("UPFIELD", "theFile");
							isOcxUploadDownModule = true;
						}
					} catch (e) {
						console.log(e);
						isOcxUploadDownModule = false;
						if (isMsie9) {
							setTimeout(function () {
								chgAttachMod("ocx", true);
								jQuery("#crtBtnSimple").hide();
							}, 1000)
						}
					}
				}

				if (isOcxUploadDownModule) {
					ocx_init();
					var ocx = document.uploadForm.powerupload;
					simpleCrtBtn.hide();
					simpleChgBtn.hide();
					simpleIncFrame.hide();
					simpleQuotaInfo.hide();
					simpleFileObj.hide();
					simpleFileSubObj.hide();
					ocx.SetChangeUpMode("true");
					ocxCrtBtn.show();
					ocxChgBtn.show();
					ocxIncFrame.show();
					ocxQuotaInfo.show();
					showAttachBoxDisplay(true);
					setCookie("OcxUpload", "on", 365);
					isOcxUpload = true;
					if (jQuery("span[evt-rol='attach-area-toggle']").hasClass("ic_arrow_down_type4")) {
						jQuery("span[evt-rol='attach-area-toggle']").trigger("click");
					}
					basicAttachUploadControl.emptyFileList();
					if (USE_BIGATTACH_MODE) {
						jQuery("#basic_bigattach_size").show();
						jQuery("#bigAttachMgn").show();
						jQuery("#bigattachMessageSpanBtn").show();
					}
				}
			} else {
				ocxCrtBtn.hide();
				ocxChgBtn.hide();
				ocxIncFrame.hide();
				ocxQuotaInfo.hide();

				simpleFileObj.show();
				simpleFileSubObj.show();

				jQuery("#basicUploadControl").hide();

				if (USE_BIGATTACH_MODE) {
					jQuery("#basic_bigattach_size").show();
					jQuery("#bigattachMngBtn").show();
					jQuery("#bigattachMessageSpanBtn").show();
				} else {
					jQuery("#basic_bigattach_size").hide();
					jQuery("#bigattachMngBtn").hide();
					jQuery("#bigattachMessageSpanBtn").hide();
				}

				simpleCrtBtn.show();
				simpleChgBtn.show();
				simpleIncFrame.show();
				simpleQuotaInfo.show();
				showAttachBoxDisplay(false);

				if (activeXMake && isMsie && isOcxUpload) {
					var ocx = document.uploadForm.powerupload;
					var count = ocx.GetAttachedFileCount();
					var id;
					for (var i = count - 1; i >= 0; i--) {
						id = ocx.GetAttachedFileAttr(i, "attachid");
						ocx.RemoveAttachFile(id);
					}
					ocx.Reset();
				}

				setCookie("OcxUpload", "off", 365);
				isOcxUpload = false;
				basicAttachUploadControl.init();
				basicAttachUploadControl.makeBtnControl();
				basicAttachUploadControl.makeListControl();

				basic_init();

				if (!isMsie || !activeXMake) {
					ocxChgBtn.hide();
					simpleChgBtn.hide();
				}
			}
		} catch (e) {
			throw e
		}
	}

	if (!isInit && getAttachTotalCount() > 0) {
		jQuery.goConfirm(mailMsg.mail_write, mailMsg.mail_attach_change_mode_is_exsit_title, function () {
			func();
		});
	} else {
		func();
	}
}

function checkUploadfile(attaches) {
	var name, size, upkey, uid, hostId, atype;

	if (attaches && attaches.length > 0) {
		for (var i = 0; i < attaches.length; i++) {
			upkey = attaches[i].upkey;
			name = attaches[i].name;
			size = attaches[i].size;
			hostId = attaches[i].hostId;
			uid = (attaches[i].uid) ? attaches[i].uid : "";
			atype = "normal";
			var normalAttachSize = getAttachNormalSize();
			if ((parseInt(normalAttachSize, 10) + parseInt(size, 10)) > (MAX_ATTACH_SIZE * 1024 * 1024)) {
				atype = "huge";
			}
			addlist(name, size, upkey, hostId, uid, atype);
		}
		fileCheck = true;
		jQuery('#att_simple_area').show().closest("tr")
			.find('[evt-rol=attach-area-toggle]')
			.toggleClass('ic_arrow_down_type4').toggleClass('ic_arrow_up_type4');
	} else {
		fileCheck = true;
	}
}

function deleteAllHugeFile() {
	var uids = getHugeFileUidList();
	if (uids.length > 0) {
		deleteBigAttachFile(uids);
	}
}

function getHugeFileUidList() {
	var uids = [];
	if (isOcxUpload) {
		var ocx = document.uploadForm.powerupload;
		var cnt = ocx.GetAttachedFileCount();
		var type, uid;
		for (var i = 0; i < cnt; i++) {
			type = ocx.GetAttachedFileAttr(i, "TYPE");
			uid = ocx.GetAttachedFileAttr(i, "UID");
			if (type == "huge" && (uid && uid != "")) {
				uids.push(uid);
			}
		}
	} else {
		var hugeFiles = basicAttachUploadControl.getFileList("huge");
		var uid;
		if (hugeFiles) {
			for (var i = 0; i < hugeFiles.length; i++) {
				uid = hugeFiles[i].uid;
				if ((uid && uid != "" && uid != "0")) {
					uids.push(uid);
				}
			}
		}
	}
	return uids;
}

function deleteUpoladBarList(messageUid) {
	if (!isOcxUpload) {
		var hugeFiles = basicAttachUploadControl.getFileList("huge");
		for (var j = 0; j < hugeFiles.length; j++) {
			if (messageUid == hugeFiles[j].uid) {
				jQuery("#" + hugeFiles[j].id).attr("checked", true);
				break;
			}
		}
		deletefile();
	}
}

function deletefile(isDeleteAll) {
	isDeleteAll = isDeleteAll || false;
	if (!isOcxUpload) {
		var hugeUidArray = [];
		var checkObjIds = [];
		if (isDeleteAll) {
			jQuery("input[name=basicAttachFileEl]").each(function () {
				checkObjIds.push(jQuery(this).attr("id"));
			});
		} else {
			checkObjIds = basicAttachUploadControl.getCheckAttachFileIds();
		}

		if (checkObjIds.length > 0) {
			var hugeFiles = basicAttachUploadControl.getFileList("huge");
			for (var i = 0; i < checkObjIds.length; i++) {
				if (hugeFiles) {
					for (var j = 0; j < hugeFiles.length; j++) {
						if (checkObjIds[i] == hugeFiles[j].id) {
							hugeUidArray.push(hugeFiles[j].uid);
							break;
						}
					}
				}
				basicAttachUploadControl.deleteAttachList(checkObjIds[i]);
			}

			if (hugeUidArray.length > 0) {
				deleteBigAttachFile(hugeUidArray);
			}

			var quota = basicAttachUploadControl.getAttachQuotaInfo();
			updateAttachQuota("hugeUse", quota.hugeUse);
			updateAttachQuota("normalUse", quota.normalUse);
			jQuery("#basicAttachChkAll").attr("checked", false);

			if (getAttachTotalCount() == 0) {
				showAttachBoxDisplay(false);
			}
		}
	} else {
		var ocx = document.uploadForm.powerupload;
		ocx.DetachFile(-1);
	}
}

function deletefileById(id) {
	if (!isOcxUpload) {
		var hugeUidArray = [];
		var hugeFiles = basicAttachUploadControl.getFileList("huge");
		if (hugeFiles) {
			for (var j = 0; j < hugeFiles.length; j++) {
				if (id == hugeFiles[j].id) {
					hugeUidArray.push(hugeFiles[j].uid);
					break;
				}
			}
		}

		basicAttachUploadControl.deleteAttachList(id);

		if (hugeUidArray.length > 0) {
			deleteBigAttachFile(hugeUidArray);
		}
		var quota = basicAttachUploadControl.getAttachQuotaInfo();
		updateAttachQuota("hugeUse", quota.hugeUse);
		updateAttachQuota("normalUse", quota.normalUse);
		jQuery("#basicAttachChkAll").attr("checked", false);

		if (getAttachTotalCount() == 0) {
			showAttachBoxDisplay(false);
		}
	} else {
		var ocx = document.uploadForm.powerupload;
		ocx.DetachFile(-1);
	}
}

function previewTempFile(id) {
	var attachFileInfo = basicAttachUploadControl.getAttachFileInfo('normal', id);
	var param = {"fileName": attachFileInfo.name, "filePath": attachFileInfo.path, "hostId": attachFileInfo.hostId};
	param.action = "previewAttachTempFile";
	POPUPDATA = param;

	window.open("/app/mail/popup", "", "resizable=yes,scrollbars=yes,status=yes,width=800,height=640");
}

function downloadTempFile(id) {
	var attachFileInfo = basicAttachUploadControl.getAttachFileInfo('normal', id);
	var param = {
		"fileName": attachFileInfo.name,
		"filePath": attachFileInfo.path,
		"fileSize": attachFileInfo.size,
		"hostId": attachFileInfo.hostId
	};

	if (TABLET || MOBILE) {
		var host = location.protocol + "//" + window.location.host;
		url = "/api/mail/file/temp/download?" + jQuery.param(param);
		window.location = host + url;
	} else {
		document.getElementById("reqFrame").src = "/api/mail/file/temp/download?" + jQuery.param(param);
	}
}

function getAttachTotalCount() {
	var totalCnt = 0;
	if (!isOcxUpload) {
		var normalFile = basicAttachUploadControl.getFileList("normal");
		var hugeFile = basicAttachUploadControl.getFileList("huge");
		var normalCnt = (!normalFile || !normalFile.length || normalFile.length < 1) ? 0 : normalFile.length;
		var hugeCnt = (!hugeFile || !hugeFile.length || hugeFile.length < 1) ? 0 : hugeFile.length;
		totalCnt = normalCnt + hugeCnt;
	} else {
		var ocx = document.uploadForm.powerupload;
		totalCnt = ocx.GetAttachedFileCount();
	}
	return totalCnt;
}

function addWebfolderAttach(attachList) {
	var name, size, upkey, hostId, uid, atype;
	var isFail = false;
	for (var i = 0; i < attachList.length; i++) {
		upkey = attachList[i][0];
		name = attachList[i][1];
		size = attachList[i][2];
		hostId = attachList[i][3];
		atype = ((size > MAX_ATTACH_SIZE * 1024 * 1024)) ? "huge" : "normal";
		if (!addlist(name, size, upkey, hostId, "", atype)) {
			isFail = true;
			break;
		}
	}
	if (!isFail) jQuery.goPopup.close();
	webfolderAttachProcess = false;
}

function addlistForJQuery(name, size, path, hostId, uid, type, fileId) {
	var text = name + " (" + size + " bytes)";
	var atype = "normal";
	if (USE_BIGATTACH_MODE) {
		atype = (type) ? type : "normal";
	}
	var normalSize;
	var hugeSize;

	var upldtype = path.substring((path.length - 1), path.length);
	if (upldtype == "r") {
		document.massmail.rcptsfile.value = path;
		jQuery("#filename").html(text);
	} else {
		showAttachBoxDisplay(true);
		var file = {
			"path": path, "size": size,
			"name": name, "hostId": hostId,
			"uid": uid, "type": atype, "notChage": true
		};
		if (fileId) {
			file.id = fileId;
			basicAttachUploadControl.updateAttachFile(file);
		} else {
			file.id = "SWFUpload_0_a" + makeRandom();
			basicAttachUploadControl.addAttachList(file);
		}

	}
	return true;
}

function addlist(n, s, p, hostId, uid, type, fileId) {
	var text = n + " (" + s + " bytes)";
	var atype = "normal";
	if (USE_BIGATTACH_MODE) {
		atype = (type) ? type : "normal";
	}
	var normalSize;
	var hugeSize;
	var upldtype = p.substring((p.length - 1), p.length);
	if (upldtype == "r") {
		document.massmail.rcptsfile.value = p;
		jQuery("#filename").html(text);
		//alert("upload mass rcpt file!!");
	} else {
		var attsize = parseInt(s);
		if (atype == "normal") {
			if (isOcxUpload) {
				var ocx = document.uploadForm.powerupload;
				normalSize = ocx.GetAttachedSize("NORMAL");
			} else {
				normalSize = basicAttachUploadControl.getAttachSize("normalUse");
			}
			// HTML UPLOAD
			attsize = normalSize + parseInt(s);

			if (attsize > (MAX_ATTACH_SIZE * 1024 * 1024)) {
				jQuery.goAlert(mailMsg.comn_upload_title, MAX_ATTACH_SIZE + "MB " + mailMsg.ocx_upalert_size);
				return false;
			}
		} else if (atype == "huge") {
			if (isOcxUpload) {
				var ocx = document.uploadForm.powerupload;
				hugeSize = ocx.GetAttachedSize("HUGE");
			} else {
				hugeSize = basicAttachUploadControl.getAttachSize("hugeUse");
			}

			if ((hugeSize + attsize) > BIG_ATTACH_QUOTA) {
				jQuery.goAlert(mailMsg.comn_upload_title, printSize(BIG_ATTACH_QUOTA) + " " + mailMsg.ocx_upalert_size);
				return false;
			}
		}
		showAttachBoxDisplay(true);

		// OCX POWER UPLOAD
		if (isMsie && isOcxUpload) {
			try {
				var ocx = document.uploadForm.powerupload;
				var id = ocx.AddAttachedFile(n, s, atype);

				ocx.SetAttachedFileAttr2(id, "FILEPATH", p);
				ocx.SetAttachedFileAttr2(id, "UPKEY", p);
				ocx.SetAttachedFileAttr2(id, "FILENAME2", Base64TMS.encode(n));
				ocx.SetAttachedFileAttr2(id, "SIZE", s);
				ocx.SetAttachedFileAttr2(id, "HOSTID", hostId);
				ocx.SetAttachedFileAttr2(id, "TYPE", atype);
				ocx.SetAttachedFileAttr2(id, "RESULT", "OK");

				if (atype == "huge") jQuery("#ocx_huge_size").html(printSize(ocx.GetAttachedSize("HUGE")));
				else jQuery("#ocx_normal_size").html(printSize(attsize));

			} catch (e) {
			}
		} else {
			var fileIndex = basicAttachUploadControl.generatorFileIndex();
			var file = {
				"path": p, "size": s, "name": n, "hostId": hostId,
				"uid": uid, "type": atype, "notChage": true, "index": fileIndex
			};

			if (fileId) {
				file.id = fileId;
				basicAttachUploadControl.updateAttachFile(file);
			} else {
				file.id = "SWFUpload_0_a" + makeRandom();
				basicAttachUploadControl.addAttachList(file);
			}

			if (atype == "huge") {
				updateAttachQuota("hugeUse", hugeSize + attsize);
			} else {
				updateAttachQuota("normalUse", attsize);
			}
		}
	}
	return true;
}

function getAttachNormalSize() {
	var normalSize = 0;
	if (isOcxUpload) {
		var ocx = document.uploadForm.powerupload;
		normalSize = ocx.GetAttachedSize("NORMAL");
	} else {
		normalSize = basicAttachUploadControl.getAttachSize("normalUse");
	}
	return normalSize;
}

function getPreviewAttachString() {
	var pstr = "";

	if (isOcxUpload) {
		var ocx = document.uploadForm.powerupload;
		var cnt = ocx.GetAttachedFileCount();

		for (var i = 0; i < cnt; i++) {
			var type = ocx.GetAttachedFileAttr(i, "TYPE");

			//메일쓰기페이지에서 미리보기일 경우
			if (type != "normal") {
				//ocx에서 파일정보를 추출하는 함수중 서버에 올리기전에는 파일명 밖에 알 수 없음.
				pstr += "temp\t"
					+ Base64TMS.decode(ocx.GetAttachedFileAttr(i, "FILENAME2")) + "\t"
					+ "0\t"
					+ "unknown\t"
					+ "0\n";
			} else {
				pstr += ocx.GetAttachedFileAttr(i, "UPKEY") + "\t"
					+ Base64TMS.decode(ocx.GetAttachedFileAttr(i, "FILENAME2")) + "\t"
					+ ocx.GetAttachedFileAttr(i, "SIZE") + "\t"
					+ ocx.GetAttachedFileAttr(i, "HOSTID") + "\t"
					+ ocx.GetAttachedFileAttr(i, "UID") + "\n";
			}
		}
	} else {
		var uploadedFile = basicAttachUploadControl.getFileList("normal");
		for (var i = 0; i < uploadedFile.length; i++) {
			pstr += uploadedFile[i].path + "\t"
				+ uploadedFile[i].name + "\t"
				+ uploadedFile[i].size + "\t"
				+ uploadedFile[i].hostId + "\t"
				+ uploadedFile[i].uid + "\n";
		}
	}

	return pstr;
}

function getAttachString() {
	var pstr = "";

	if (isOcxUpload) {
		var ocx = document.uploadForm.powerupload;
		var cnt = ocx.GetAttachedFileCount();

		for (var i = 0; i < cnt; i++) {
			var type = ocx.GetAttachedFileAttr(i, "TYPE");

			if (type != "normal") {
				continue;
			}

			pstr += ocx.GetAttachedFileAttr(i, "UPKEY") + "\t"
				+ Base64TMS.decode(ocx.GetAttachedFileAttr(i, "FILENAME2")) + "\t"
				+ ocx.GetAttachedFileAttr(i, "SIZE") + "\t"
				+ ocx.GetAttachedFileAttr(i, "HOSTID") + "\t"
				+ ocx.GetAttachedFileAttr(i, "UID") + "\n";
		}
	} else {
		var uploadedFile = basicAttachUploadControl.getFileList("normal");
		for (var i = 0; i < uploadedFile.length; i++) {
			pstr += uploadedFile[i].path + "\t"
				+ uploadedFile[i].name + "\t"
				+ uploadedFile[i].size + "\t"
				+ uploadedFile[i].hostId + "\t"
				+ uploadedFile[i].uid + "\n";
		}
	}

	return pstr;
}

function chgAttachFileType(fid) {
	var fileChkObj = jQuery("#" + fid);
	var type = fileChkObj.attr("atttype");
	var size = Number(fileChkObj.attr("attsize"));
	var useSize, maxSize;
	var quota = basicAttachUploadControl.getAttachQuotaInfo();
	if (type == "huge") {
		if ((size > quota.normalMax) ||
			(size + quota.normalUse > quota.normalMax)) {
			jQuery.goAlert(mailMsg.comn_upload_title, printSize(quota.normalMax) + " " + mailMsg.ocx_upalert_size);
			return;
		}
		updateAttachQuota("hugeUse", quota.hugeUse - size);
		updateAttachQuota("normalUse", size + quota.normalUse);
	} else {
		if ((size > quota.hugeMax) ||
			(size + quota.hugeUse > quota.hugeMax)) {
			jQuery.goAlert(mailMsg.comn_upload_title, printSize(quota.hugeMax) + " " + mailMsg.ocx_upalert_size);
			return;
		}
		updateAttachQuota("normalUse", quota.normalUse - size);
		updateAttachQuota("hugeUse", size + quota.hugeUse);
	}
	basicAttachUploadControl.chageAttachType(fid);
	hugeMailCheck();
}

function startUploadAttach(param) {
	var file;
	var fileLists = basicAttachUploadControl.getUploadQueueFile();
	uploadAttachFilesError = false;
	if (fileLists.length > 0) {
		uploadAttachFilesComplete = false;
		for (var i = 0; i < fileLists.length; i++) {
			file = fileLists[i];
			jQuery("#progress_" + file.id).progressBar(progressBarOpt);
		}
		basicAttachUploadControl.startUpload();
	}
}

function showAttachBoxDisplay(show) {
	if (show) {
		jQuery("#attach_area").show();
	} else {
		jQuery("#attach_area").hide();
	}
}

function deleteBigAttachFile(uids) {
	var param = {"messageUids": uids};
	mailControl.deleteBigAttach(param);
}

function destroyBasicUploadControl() {
	if (isOcxUpload) {
		jQuery("#att_ocx_area").hide();
	}
	if (basicAttachUploadControl) {
		var isExistBasicButton = jQuery("#att_btn_simple object").length == 0 ? false : true;
		if (isExistBasicButton) {
			if (isOcxUpload) {
				jQuery("#att_btn_simple").height("0px").show().css("visibility", "hidden");
			}
			try {
				basicAttachUploadControl.stopUpload();
				basicAttachUploadControl.cancelUpload();
				basicAttachUploadControl.destroy();
			} catch (e) {
			}
		}
	}
}

function destroyMassUploadControl() {
	if (massAttachUploadControl) {
		var isExistMassButton = jQuery("#massUploadControl object").length == 0 ? false : true;
		if (isExistMassButton) {
			try {
				massAttachUploadControl.stopUpload();
				massAttachUploadControl.cancelUpload();
				massAttachUploadControl.destroy();
			} catch (e) {
			}
		}
	}
}

function uploadOcxFile() {
	var uploadSuccess = true;
	var ret = ocx_upload();
	if (!ret || uploadAttachFilesError) {
		if (!ret) {
			jQuery.goAlert(mailMsg.error_fileupload);
			deleteOcxFileAll();
			ocx_init();
		}
		uploadAttachFilesError = false;
		uploadSuccess = false;
	}

	return uploadSuccess;
}
