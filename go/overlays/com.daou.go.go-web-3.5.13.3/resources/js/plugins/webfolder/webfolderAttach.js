var progressBarOpt = {
	boxImage: '/resources/images/progressbar.gif',
	barImage: '/resources/images/progressbg_green_50.gif',
	width: 100
};
var MAX_ATTACH_SIZE;
var MAX_QUOTA_SIZE;
var EXCLUDE_EXTENSION;
var today = new Date(1234227867105);
var expiredate = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
var quotausage = 0;
var userquota = 0;

function chgAttachMod(type)
{
	var ocxCrtBtn 			= jQuery("#att_btn_ocx");
	var ocxChageBtn 		= jQuery("#ocx_chage");
	var ocxIncFrame 		= jQuery("#att_ocx_area");
	var ocxQuotaInfo 		= jQuery("#att_ocx_quota_info");
	var simpleCrtBtn 		= jQuery("#att_btn_simple");	
	var simpleChageBtn 		= jQuery("#simple_chage");	
	var simpleIncFrame 		= jQuery("#att_simple_area");
	var simpleQuotaInfo 	= jQuery("#att_simple_quota_info");	
	var simpleFileObj 		= jQuery("#simpleFileInit");
	
	try {			
		// POWER UPLOAD or FILE UPLOAD
		if (type == 'ocx') {
			if (!isOcxUploadDownModule) {
				makeNormalUploadOcx("ocxCompL", LOCALE);
				try {
					if (isMsie) {
						var ocx = document.uploadForm.powerupload;
						ocx.SetUrlData("UPFIELD", "theFile");
						isOcxUploadDownModule = true;
					}
				} catch (e) {
					isOcxUploadDownModule = false;
				}
			}
			if (isOcxUploadDownModule) {
				ocx_init();
				var ocx = document.uploadForm.powerupload;
				ocxCrtBtn.show();
				ocxIncFrame.show();
				ocxQuotaInfo.show();
				ocxChageBtn.show();
				simpleCrtBtn.hide();
				simpleIncFrame.hide();
				simpleQuotaInfo.hide();
				simpleChageBtn.hide();
				simpleFileObj.hide();
				isOcxUpload = true;
				basicAttachUploadControl.emptyFileList();
			}
		} else {
			var flashInstalled = hasFlashPlayer();
			ocxCrtBtn.hide();
			ocxIncFrame.hide();
			ocxQuotaInfo.hide();
			ocxChageBtn.hide();

			if (flashInstalled) {
				simpleFileObj.hide();
				jQuery("#basicUploadControl").show();
				simpleCrtBtn.show();
			} else {
				jQuery("#basicUploadControl").hide();
				simpleFileObj.show();
				simpleCrtBtn.hide();

				var $dropZone = jQuery("#webfolderFilePopup");
				var timer = null;
				$dropZone.unbind();

				jQuery('#mailSimpleFileUpload').fileupload({
					url: "/api/webfolder/file/upload",
					formData: {
						uploadType: 'flash',
						uploadApp: 'webfolder',
						maxAttachFileSize: MAX_ATTACH_SIZE
					},
					dataType: 'json',
					pasteZone: null,
					dropZone: $dropZone,
					done: function (e, data) {
						var result = data.result;
						var size = result.fileSize;
						if (result.uploadResult == "success") {
							addlist(result.fileName, result.fileSize, result.filePath, result.hostId, "");
						} else {
							if (size == "0") {
								jQuery.goAlert(mailMsg.comn_upload_title, mailMsg.file_size_zero);
							} else {
								jQuery.goAlert(mailMsg.comn_upload_title, mailMsg.error_fileupload);
							}
						}
					}
				});

				$dropZone.bind('dragleave', function (e) {
					clearTimeout(timer);
					timer = setTimeout(function () {
						$dropZone.removeClass('drag_file');
					}, 100);
				});

				$dropZone.bind('dragover', function (e) {
					e.preventDefault();
					e.stopPropagation();
					e.originalEvent.dataTransfer.dropEffect = 'move';
					jQuery(this).addClass('drag_file');
					clearTimeout(timer);
				});

				$dropZone.bind('drop', function (e) {
					e.preventDefault();
					e.stopPropagation();
					jQuery(this).removeClass('drag_file');
				});
			}

			simpleIncFrame.show();
			simpleQuotaInfo.show();
			simpleChageBtn.show();

			isOcxUpload = false;

			basic_init();

			if (!isMsie || !activeXMake) {
				jQuery("#crtBtnPower").hide();
			}
		}
	} catch (e) {
	    alert(e.message);
	}
}

function deletefile() {
	if (!isOcxUpload) {
		var checkObjIds = basicAttachUploadControl.getCheckAttachFileIds();
		if (checkObjIds.length > 0) {
			for (var i = 0; i < checkObjIds.length; i++) {
				if (checkObjIds[i] == "basicAttachChkAll") {
					continue;
				}
				basicAttachUploadControl.deleteAttachList(checkObjIds[i]);
			}

			var quota = basicAttachUploadControl.getAttachQuotaInfo();
			if (MAX_QUOTA_SIZE > quota.normalUse) {
				jQuery("#quotaMax").hide();
				jQuery("#webfolderFilePopup .btn_major_s").show();

			}
			updateAttachQuota(null, quota.normalUse);
			jQuery("#basicAttachChkAll").attr("checked", false);
		}
	} else {
		var ocx = document.uploadForm.powerupload;
		ocx.DetachFile(-1);
	}
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

            if(isInValidExtension(uploadedFile[i].name)) {
                return "invalidExtension";
            };

			pstr += uploadedFile[i].path + "\t"
				+ uploadedFile[i].name + "\t"
				+ uploadedFile[i].size + "\t"
				+ uploadedFile[i].hostId + "\t"
				+ uploadedFile[i].uid + "\n";
		}
	}

	return pstr;
}

function isInValidExtension(fileName) {
    var extensionIdx = fileName.lastIndexOf(".");

    if(extensionIdx == -1) {
        return true;
    }

    var extension = fileName.substr(extensionIdx + 1).toLowerCase();
    if(_.contains(EXCLUDE_EXTENSION, extension)) {
        return true;
    }
}

function writeInit(mode) {
	if (isOcxUpload) {
		ocx_init();
	}
}

function ocx_file() {
	var ocx = document.uploadForm.powerupload;
	ocx.AttachFile();
}

function ocx_init() {
	var ocx = document.uploadForm.powerupload;
	jQuery("#ocx_normal_size").innerHTML = printSize(0);
	ocx.SetAttachMaxSize("NORMAL", 1024 * 1024 * MAX_ATTACH_SIZE);
	ocx.SetUrlData("UPLOAD", goHostInfo + "/api/webfolder/file/upload");
	ocx.SetUrlData("UPFIELD", "theFile");
}

function deleteOcxFileAll() {
	var ocx = document.uploadForm.powerupload;
	var count = ocx.GetAttachedFileCount();
	for (var i = 0; i < count; i++) {
		ocx.DetachFile(0);
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
	ocx.SetUploadParam("uploadApp", "webfolder");
	ocx.SetUploadParam("regdate", today.getTime());
	return ocx.UploadFiles();
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
		if (MAX_QUOTA_SIZE > quota.normalUse) {
			jQuery("#quotaMax").hide();
			jQuery("#webfolderFilePopup .btn_major_s").show();

		}
		updateAttachQuota(null, quota.normalUse);
		jQuery("#basicAttachChkAll").attr("checked", false);
	} else {
		var ocx = document.uploadForm.powerupload;
		ocx.DetachFile(-1);
	}
}

function ocx_info() {
	return "";
}

var uploadAttachFilesError = false;
var uploadAttachFilesComplete = false;
var basicUploadListeners = {
	swfuploadLoaded: function (event) {
	},
	fileQueued: function (event, file) {
		var size = file.size;
		var quota = basicAttachUploadControl.getAttachQuotaInfo();
		if ((size > quota.normalMax)) {
			jQuery.goMessage(msgArgsReplace(mailMsg.error_upload_over, [MAX_ATTACH_SIZE]));
			jQuery("#basicUploadControl").swfupload("cancelUpload", file.id);
			return;
		}

		jQuery("#basicUploadControl").swfupload("addFileParam", file.id, "attachtype", "normal");

		updateAttachQuota(null, size + quota.normalUse);
		basicAttachUploadControl.addAttachWebfolderList(file);
		basicAttachUploadControl.addUploadQueueFile(file);
	},
	fileQueueError: function (event, file, errorCode, message) {
		if (errorCode == "-120") {
			jQuery.goMessage(mailMsg.ocx_virtxt_failquest);
		} else {
			jQuery.goMessage(mailMsg.error_fileupload + "[" + errorCode + "]");
		}
	},
	fileDialogStart: function (event) {
	},
	fileDialogComplete: function (event, numFilesSelected, numFilesQueued) {
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
			jQuery("#progress_" + file.id).html("<img src=''>");
		}
	},
	uploadSuccess: function (event, file, serverData) {
		var data = eval("(" + serverData + ")");
		if (data.uploadResult == "success" && parseInt(data.uid, 10) > -1) {
			basicAttachUploadControl.setUploadCompleteFile(file.id, data);
			jQuery("#progress_" + file.id).html('<span class="ic state_complete"></span>');
		} else {
			if (!uploadAttachFilesError) {
				jQuery.goAlert("", mailMsg.error_fileupload);
			}
			jQuery("#" + file.id).attr("checked", true);
			deletefile();
		}
	},
	uploadComplete: function (event, file) {
		if (!basicAttachUploadControl.isNextUploadQueue(file.id)) {
			uploadAttachFilesComplete = true;
			var attr = getAttachString();
			webfolderControl.fileUpload(attr);

		}
	},
	uploadError: function (event, file, errorCode, message) {
		if (errorCode != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED) {
			jQuery("#attachUploadProgress").jQpopup("close");
			if (!uploadAttachFilesError) {
				jQuery.goMessage(mailMsg.error_fileupload);
				basic_init();
				uploadAttachFilesError = true;
			}
		}
	}
}

function updateAttachQuota(type, size) {
	jQuery("#basic_normal_size").text(printSize(size));
	basicAttachUploadControl.setAttachSize("normalUse", size);
	if (MAX_QUOTA_SIZE < size) {
		jQuery("#quotaMax").show();
		jQuery("#webfolderFilePopup .btn_major_s").hide();
	}
}

function basic_init() {
	basicAttachUploadControl.init();
	basicAttachUploadControl.makeBtnControl();
	basicAttachUploadControl.makeListWebFolderControl();
	basicAttachUploadControl.setAttachSize("normalMax", (MAX_ATTACH_SIZE * 1024 * 1024));
	updateAttachQuota(null,0);
}

function startUploadAttach() {
	if (!isOcxUpload) {
		if (hasFlashPlayer()) {
			var fileLists = basicAttachUploadControl.getUploadQueueFile();
			uploadAttachFilesError = false;
			uploadAttachFilesComplete = false;

			if (fileLists.length > 0) {
				basicAttachUploadControl.startUpload();
			} else {
				jQuery.goMessage(mailMsg.alert_noupload);
				return false;
			}
		} else {
			var attr = getAttachString();
			if (attr == "") {
				jQuery.goMessage(mailMsg.alert_noupload);
				return false;
			}
			if (attr == "invalidExtension") {
                jQuery.goMessage(msgArgsReplace(mailMsg.alert_invalid_extension, [EXCLUDE_EXTENSION]));
                return false;
            }
			webfolderControl.fileUpload(attr);
		}
	} else {
		var ret = ocx_upload();
		if (!ret || uploadAttachFilesError) {
			if (!ret) {
				jQuery.goMessage(mailMsg.error_fileupload);
				deleteOcxFileAll();
				ocx_init();
			}
			uploadAttachFilesError = false;
			return;
		}

		var attstr = getAttachString();
		if (typeof (attstr) == "undefined") {
			if (isOcxUpload) {
				setTimeout("resetUploader()", 1000);
				return;
			}
		}
		webfolderControl.fileUpload(attstr);
	}
}

function resetUploader() {
	var ocx = document.uploadForm.powerupload;
	var attachCount = ocx.GetAttachedFileCount();

	if (attachCount && attachCount > 0) {
		for (i = 0; i < attachCount; i++) {
			ocx.DetachFile(0);
		}
	}
}

function addlist(n, s, p, uid, hostId, type) {
	var atype = "normal";
	var normalSize;
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
	}

	// OCX POWER UPLOAD
	if (jQuery.browser.msie && isOcxUpload) {
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
			jQuery("#ocx_normal_size").html(printSize(attsize));
		} catch (e) {
		}
	} else {
		var file = {
			"path": p, "size": s, "name": n,
			"uid": uid, "hostId": hostId, "type": atype, "notChage": true,
			"id": "SWFUpload_0_a" + makeRandom()
		};
		basicAttachUploadControl.addAttachWebfolderList(file);
		updateAttachQuota(null, attsize);
	}

	return true;
}