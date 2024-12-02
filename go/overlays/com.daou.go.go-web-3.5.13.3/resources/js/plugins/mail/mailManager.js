var msgProgressBarOpt = {
		boxImage: '/resources/images/progressbar.gif',
		barImage: '/resources/images/progressbg_green_50.gif',
		width: 60,
		showText: false
};
var basicMsgUploadListeners = {
	swfuploadLoaded: function(event){},
	fileQueued: function(event, file){			
		var size = file.size;
		var quota = basicMsgUploadControl.getAttachQuotaInfo();
		if((size > quota.normalMax) || 
				(size+quota.normalUse > quota.normalMax)){				
			jQuery.goMessage(mailMsg.error_upload_quota);
			setTimeout(function(){
				closeUploadModal();
			},1000);
			return;
		}
		basicMsgUploadControl.addUploadQueueFile(file);
	},
	fileQueueError: function(event, file, errorCode, message){
		if(errorCode == "-120"){
			jQuery.goMessage(mailMsg.ocx_virtxt_failquest);
		} else {
			jQuery.goMessage(mailMsg.error_fileupload + "["+errorCode+"]");
		}
	},
	fileDialogStart: function(event){},
	fileDialogComplete: function(event, numFilesSelected, numFilesQueued){
		if (numFilesSelected == 0) {
			return;
		}
		/*if(numFilesSelected < 100){
			uploadMailMessage();
		} else {
			jQuery.goMessage(msgArgsReplace(mailMsg.error_upload_mail,["100"]));
			closeUploadModal();
		}*/
		uploadMailMessage();
	},
	uploadStart: function(event, file){
		jQuery("#msg_progress_"+file.id).progressBar(0,msgProgressBarOpt);
	},
	uploadProgress: function(event, file, bytesLoaded){	
		var fileSize = file.size;
		var fileUploadPercent = Math.ceil(bytesLoaded / fileSize * 100);
		fileUploadPercent = (fileUploadPercent >= 100) ? 100 : fileUploadPercent;
		jQuery("#msg_progress_"+file.id).hide();
		jQuery("#msg_progress_"+file.id).progressBar(fileUploadPercent,msgProgressBarOpt);
		jQuery("#msg_progress_"+file.id).show();
		if (fileUploadPercent == 100) {
			jQuery("#msg_progress_"+file.id).html("<img src='/resources/images/img_loader_s.gif' align='absmiddle'>");
		}
	},
	uploadSuccess: function(event, file, serverData){			
		var data = JSON.parse(serverData);
		var isError = false;
		switch(data.resultMessage) {
		case "success" : 
			jQuery("#msg_progress_"+file.id).html('<span style="color:red">['+mailMsg.comn_upload_complete+']</span>');
    		break;
		case "overQuota" :	
			jQuery.goAlert(mailMsg.comn_upload_title,mailMsg.error_upload_quota);
			setTimeout(function(){
				closeUploadModal();
			},1000);
			break;
		case "sizeZero" :	
			jQuery.goAlert(mailMsg.comn_upload_title,mailMsg.file_size_zero);
			break;
		default :
			jQuery.goMessage(mailMsg.comn_upload_title,mailMsg.error_fileupload);
			jQuery("#msg_progress_"+file.id).addClass("failUpload").html('<span style="color:red">['+mailMsg.comn_cancel+']</span>');
		}
	},
	uploadComplete: function(event, file){
		if(!basicMsgUploadControl.isNextUploadQueue(file.id)){
			jQuery.goMessage(mailMsg.alert_messageupload);
			setTimeout(function(){
				var failList = [];
				jQuery("#messageUploadListWrap span.failUpload").each(function(i) {
					failList.push({"name":jQuery(this).closest("tr").find("span.name").text()});
				});
				if (failList.length == 0) {
					closeUploadModal(function() {
						if (mailMenuStatus == "setting") {
							reloadViewFolderManage();
						} else {
							reloadMessageList();						
						}
					});
				} else {
					jQuery("#mail_message_upload_popup a.btn_minor_s span.txt").text(mailMsg.comn_close);
					jQuery("#messageUploadFailListWrap").html(getHandlebarsTemplate("mail_message_upload_fail_tmpl", failList)).show();
					if (mailMenuStatus == "setting") {
						reloadViewFolderManage();
					} else {
						reloadMessageList();						
					}
				}	
			},1000);
		}
	},
	uploadError: function(event, file, errorCode, message){
		if(errorCode != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED){
			jQuery.goMessage(mailMsg.error_fileupload);
			setTimeout(function(){
				closeUploadModal();
			},1000);
			return;
		}
	}
};
var basicMsgUploadOpt = {
	controlType:"normal",
	btnId:"basicMsgUploadControl",
	btnCid:"basicMsgUploadBtn",
	formName:"theFile",
	param:{"uploadType":"flash","email":USEREMAIL},
	url:"/api/mail/message/upload",
	maxFileSize:1024 * 1024 * 100,
	fileType:"*.eml",		
	btnText:mailMsg.comn_file_select,
	width:(LOCALE == "jp") ? 90 : 73,
	debug:false,		
	handler:basicMsgUploadListeners
};
var basicMsgUploadControl = null;
var upfolderName = "";
if (hasFlashPlayer()) {
	basicMsgUploadControl = new UploadBasicControl(basicMsgUploadOpt);
} else {
	basicMsgUploadControl = new UploadSimpleBasicControl(basicMsgUploadOpt);
}

function uploadMailMessage(){
	if(upfolderName == "" || upfolderName.length ==0){
		upfolderName = mailControl.getCurrentFolder();
	}
	startUploadMsg(upfolderName);	
	upfolderName = "";
}

function startUploadMsg(folderName){
	var fileLists = basicMsgUploadControl.getUploadQueueFile();
	jQuery("#basicMsgUploadControl").swfupload("addPostParam","folderName",folderName);
	
	jQuery("#messageUploadListTable").append(getHandlebarsTemplate("mail_message_upload_items_tmpl", fileLists));
	jQuery("#messageUploadListWrap").show();
	
	basicMsgUploadControl.startUpload();
}

function closeUploadModal(func) {
	basicMsgUploadControl.cancelUpload();
	basicMsgUploadControl.destroy();
	jQuery.goPopup.close();
	if (func) func();
}

// GO-29817 파일 사이즈와 변경시간이 동일한 경우 한개만 첨부되는 현상
function generatorFileIndex() {
    var index=0;

    // 첨부된 파일이 있으면 마지막 index+1
    var attachedNum = jQuery("#basicAttachList > li").size();
    if(attachedNum > 0) {
        var lastIndex = jQuery("#basicAttachList li:last").attr("data-index");
        if (lastIndex) {
            index = parseInt(lastIndex) + 1;
        }
    }

    return index;
}

function openUploadMessageLayer() {
	var index = 0;
	var param = {"useFlash":hasFlashPlayer()};
	jQuery.goPopup({
		id: 'mail_message_upload_popup',
		pclass: 'layer_normal',
		header: mailMsg.menu_uploadmsg,
		width:500,
		contents: getHandlebarsTemplate("mail_message_upload_tmpl", param),
		openCallback : function(){
			if(!hasFlashPlayer()) {
				if(upfolderName == "" || upfolderName.length ==0){
					upfolderName = mailControl.getCurrentFolder();
				}
				jQuery('#mailSimpleMessageUpload').fileupload({
					url:"/api/mail/message/upload",
					sequentialUploads:true,
					formData: {
						uploadType:'flash',
						folderName:upfolderName
					},
			        dataType: 'json',
			        pasteZone:null
			    });
				
				jQuery('#mailSimpleMessageUpload')
				.bind('fileuploadadd', function (e, data) {
					var size = data.files[0].size;
					var name = data.files[0].name;
                    var fileIndex = index++;
                    var fileId = "file_index_" + fileIndex;
                    data.files[0].id = fileId;
                    data.files[0].index = fileIndex;
					
					if (!isFileExt(name, "eml")) {
						jQuery.goMessage(msgArgsReplace(mailMsg.error_nofileext,["eml"]) + " ["+data.files[0].name+"]");
	        			return false;
					}
					
					if (size > 1024 * 1024 * 100) {
						jQuery.goMessage(mailMsg.ocx_upalert_size + " ["+data.files[0].name+"]");
						return false;
					}

					var file = {
						id : fileId,
                        index : fileIndex,
						name : name
					};
					jQuery("#messageUploadListTable").append(getHandlebarsTemplate("mail_message_upload_item_tmpl", file));
					jQuery("#messageUploadListWrap").show();
				})
				.bind('fileuploadprogress',function(e,result){ 	
			    	var file = result.files[0];
			    	var progressId = file.id;
	                var fileUploadPercent = Math.ceil( result.loaded / result.total * 100);
	    			fileUploadPercent = (fileUploadPercent >= 100) ? 100 : fileUploadPercent;
	    			
	    			jQuery("#msg_progress_"+progressId).hide();
	    			jQuery("#msg_progress_"+progressId).progressBar(fileUploadPercent,msgProgressBarOpt);
	    			jQuery("#msg_progress_"+progressId).show();
	    			if (fileUploadPercent == 100) {
	    				jQuery("#msg_progress_"+progressId).html("<img src='/resources/images/img_loader_s.gif' align='absmiddle'>");
	    			}
			    })
			    .bind('fileuploadsubmit', function (e, data) {
			    })
			    .bind('fileuploadsend', function (e, data) {
			    })
			    .bind('fileuploaddone', function (e, data) {
			    	var result = data.result;
			    	var file = data.files[0];
			    	var fileId = file.id;
			    	
			    	switch(result.resultMessage) {
					case "success" : 
						jQuery("#msg_progress_"+fileId).html('<span style="color:red">['+mailMsg.comn_upload_complete+']</span>');
			    		break;
					case "overQuota" :	
						jQuery.goAlert(mailMsg.comn_upload_title,mailMsg.error_upload_quota);
						setTimeout(function(){
							closeUploadModal();
						},1000);
						break;
					case "sizeZero" :	
						jQuery.goAlert(mailMsg.comn_upload_title,mailMsg.file_size_zero);
						break;
					default :
						jQuery.goMessage(mailMsg.comn_upload_title,mailMsg.error_fileupload);
						jQuery("#msg_progress_"+fileId).addClass("failUpload").html('<span style="color:red">['+mailMsg.comn_cancel+']</span>');
					}
			    })
			    .bind('fileuploadstop', function (e) {
			    	jQuery.goPopup.close();
	        		if (isFolderManageMenu()) {
	                    mailSettingControl.loadViewFolderManage();
	                } else {
	                	mailControl.reloadMessageList();			                	
	                }
				})
			    .bind('fileuploadfail', function (e, data) {
			    	jQuery.goAlert(mailMsg.comn_upload_title,mailMsg.error_fileupload);
			    })
			    .bind('fileuploadchunkalways', function (e, data){});
			} else {
				msgUploadInit();
			}
			
		},
		closeCallback : function(){
		},
		buttons : [{btype : 'cancel',btext : mailMsg.comn_cancel,callback:function(){
			closeUploadModal();
		}}]
	});
}

function msgUploadInit(){
	basicMsgUploadControl.init();
	basicMsgUploadControl.makeBtnControl();
	basicMsgUploadControl.setAttachSize("normalMax",1024 * 1024 * 100);
	basicMsgUploadControl.setAttachSize("normalUse",0);
	isOcxMsgUploadMode = false;
}