var isBackup = false;
var isBackupComplete = false;
var backupWork = false;
var backupStatusId = "";
var backupInterval;
var backupFolderName = "";
var backupFolderEncName = "";
var maxForwaringCount = 0;
var installLocale="";
var MailSettingControl = function() {
	var _this = this;
	this.basicSettingAction = "/api/mail/setting/basic";
	
	// 명함관리
	this.vcardAction = "/api/mail/setting/vcard";	
	
	// 스팸관리
	this.spamRuleAction = "/api/mail/setting/spam";
	
	// 서명관리
	this.signAction = "/api/mail/setting/sign";
	this.signDataAction = "/api/mail/setting/sign/data";
	this.defaultSignAction = "/api/mail/setting/sign/default";
	this.deleteSignDataAction = "/api/mail/setting/sign/data/delete";
	this.deleteAllSignDataAction = "/api/mail/setting/sign/data/delete/all";
	
	 // 자동 분류 
	this.filterAction = "/api/mail/setting/filter"
	this.saveFilterApplyAction = "/api/mail/setting/filter/apply";
	this.deleteFilterAction = "/api/mail/setting/filter/delete";
	this.selectFilterAction = "/api/mail/setting/filter/cond";
	
	// 자동 전달
	this.forwardAction = "/api/mail/setting/forward";
	// 자동 전달(예외 자동전달 규칙 추가)
	this.saveDefineForwardAction = "/api/mail/setting/forward/ext";
	
	// 부재중 응답
	this.autoReplyAction = "/api/mail/setting/autoreply";
	
	// 외부메일 설정 
	this.extMailAction = "/api/mail/setting/extmail";
	this.extMailsAction = "/api/mail/setting/extmails";
	this.deleteExtMailAction = "/api/mail/setting/extmail/delete";
	this.deleteAllExtMailAction = "/api/mail/setting/extmail/delete/all";
	
	//메일함 관리
	this.folderManageAction = "/api/mail/setting/folder";
	this.changeUserFolderAgingAction = "/api/mail/setting/folder/aging";
	this.startBackupFolderAction = "/api/mail/setting/folder/backup/start";
	this.statusBackupFolderAction = "/api/mail/setting/folder/backup/status";
	this.downloadBackupFolderAction = "/api/mail/setting/folder/backup/download";
	this.deleteBackupFolderAction = "/api/mail/setting/folder/backup/delete";	
	
	//최근 메일주소
	this.lastRcptAction = "/api/mail/setting/lastrcpt";    
	
	this.makeMailEvent = function() {
		var settingEvent = new EventControl("#mailSettingContent", "click", "a, span, ins, input, select");
		settingEvent.add("save-basic-setting", function(target) {
			saveBasicInfo();
		});
		settingEvent.add("basic-setting-cancel", function(target) {
			_this.loadBasicSetting();
		});
		settingEvent.add("default-basic-setting", function(target) {
			defaultUserSetting();
		});
		settingEvent.add("save-spam-setting", function(target) {
			saveSpamInfo();
		});
		settingEvent.add("spam-setting-cancel", function(target) {
			_this.loadViewSapmRule();
		});
		settingEvent.add("save-auto-filter", function(target) {
			saveFilterInfo();
		});
		settingEvent.add("save-auto-forward", function(target) {
			saveAllForwardInfo();
		});
		settingEvent.add("auto-forward-cancel", function(target) {
			_this.loadViewForward();
		});
		settingEvent.add("auto-filter-cancel", function(target) {
			_this.loadViewFilter();
		});
		settingEvent.add("view-vcard", function(target) {
			_this.loadManageVcard();
		});
		settingEvent.add("mail-white-add", function(target) {
			addWhiteMailList();
		});
		settingEvent.add("mail-black-add", function(target) {
			addBlackMailList();
		});
		settingEvent.add("mail-white-delete", function(target) {
			jQuery(target).parent().parent().remove();
			deleteMailList("w");
		});
		settingEvent.add("mail-black-delete", function(target) {
			jQuery(target).parent().parent().remove();
			deleteMailList("b");
		});
		settingEvent.add("all-white-delete", function(target) {
			deleteAllMailList("w");
		});
		settingEvent.add("all-black-delete", function(target) {
			deleteAllMailList("b");
		});
		settingEvent.add("modify-signData", function(target) {
			var signSeq = jQuery(target).parent().data("sign_seq");
			_this.loadModifySignData(signSeq);
		});
		settingEvent.add("write-signData", function(target) {
			_this.addSignData();
		});
		settingEvent.add("delete-signData", function(target) {
			var signSeq = jQuery(target).parent().data("sign_seq");
			deleteGetSignData(signSeq);
		});
		settingEvent.add("delete-AllsignData", function(target) {
			deleteGetAllSignData();
		});
		settingEvent.add("setting-defaultSign", function(target) {
			var signSeq = jQuery(target).parent().data("sign_seq");
			setDefaultSign(signSeq);
		});
		settingEvent.add("save-sign-setting", function(target) {
			saveSignSetting();
		});
		settingEvent.add("cancel-sign-setting", function(target) {
			_this.loadViewSign();
		});
		settingEvent.add("auto-filter-add", function(target) {
			_this.loadFilterManager();
		});
		settingEvent.add("delete-filter", function(target) {
			var condSeq = jQuery(target).attr("condSeq");
			deleteFilter(condSeq);	
		});
		settingEvent.add("all-filter-delete", function(target) {
			deleteAllFilters();
		});
		settingEvent.add("modify-filter", function(target) {
			var condSeq = jQuery(target).attr("condseq");
			var param = {};
			param.condSeq = condSeq;
			_this.modifyFilterManager(param);
		});
		settingEvent.add("forward-mail-add", function(target) {
			addForwardMailList();
		});
		settingEvent.add("forward-mail-delete", function(target) {
			jQuery(target).parent().parent().remove();
			deleteForwardMailList("f");
		});
		settingEvent.add("forward-all-delete", function(target) {
			deleteAllForwardMailList("f");
		});
		settingEvent.add("exception-forward-add", function(target) {
			var param = {};
			var forward_list_num = jQuery("#defineForwardList").attr("data-forward_list_num") ;
			var selectObj = new Array(); 
			jQuery("#defineForwardList .defineRuleValue").each(function(){
				selectObj.push({
					didSaveDefineValue:jQuery(target).text()
				});
			});
			param.forward_list_num = forward_list_num++;
			param.defineList = selectObj;
			_this.forwardExcept(param);
		});
		settingEvent.add("delete-ext-rule", function(target) {
			jQuery(target).parent().parent().remove();		
			var index = jQuery(target).data("index");
			jQuery("#removeDefineForwardList").append("<option value=" + index + ">" + index +"</option>");
		});
		settingEvent.add("exception-forward-delete-all", function(target) {
			jQuery("#removeAllDefineForward").val("true");
			deleteAllForwardMailList("d");
		});
		settingEvent.add("modify-ext-rule", function(target) {
			var param = {};			
		    var defineForwardingSeq = jQuery(target).data("index");
		    var mail = jQuery(target).data("address");
		    var domain = jQuery(target).data("domain");
		    
		    if (mail == "") {
		    	param.defineType = "domain";
		    	param.defineValue = domain;
		    } else {
		    	param.defineType = "mail";
		    	param.defineValue = mail;
		    }		 
		    
		    var f_list = new Array();
		    jQuery("#seq"+defineForwardingSeq + " " + "label").each(function(){
		    	f_list.push({
		    		forwarding_address_list:jQuery(this).text()
		    	});
		    });
		    
			param.forwarding_address_list = f_list;			
			param.defineForwardingSeq = defineForwardingSeq;			
			_this.forwardModifyExcept(param);
		});
		settingEvent.add("mail-add", function(target) {
			addMailList();
		});
		settingEvent.add("mail-delete", function(target) {
			deleteMailList();
		});
		settingEvent.add("start-time", function(target) {
			setStartTime();
		});
		settingEvent.add("end-time", function(target) {
			setEndTime();
		});
		settingEvent.add("reply-mail-add", function(target) {
			_this.addReplyMail();
		});
		settingEvent.add("reply-mail-delete", function(target) {
			jQuery(target).parent().parent().remove();
			deleteReplyMail();
		});
		settingEvent.add("reply-mail-delete-all", function(target) {
			deleteReplyMailAll();
		});
		settingEvent.add("ext-mail-add", function(target) {
			_this.popupExtMailManager();
		});
		settingEvent.add("ext-mail-delete", function(target) {
			var pop3Host = jQuery(target).attr("pop3host");
			var pop3Id = jQuery(target).attr("pop3id");
			deleteExtList(pop3Host, pop3Id);
		});
		settingEvent.add("ext-mail-modify", function(target) {
			var pop3Host = jQuery(target).attr("pop3host");	
			var pop3Id = jQuery(target).attr("pop3id");
			var param = {};	
			param.pop3Host = pop3Host;
			param.pop3Id = pop3Id;
			_this.modifyExtMailManager(param);
		});
		settingEvent.add("ext-mail-delete-all", function(target) {
			deleteAllExtList();
		});
		settingEvent.add("add-folder", function(target) {
			addFolder();
		});
		settingEvent.add("folder", function(target) {
			var folder = jQuery(target).attr("fname");
			goFolder(folder);
		});
		settingEvent.add("modify-folderName", function(target) {
			closeModifyFolderArea();
			var $folderNameTr = jQuery(target).closest("tr");
			if($folderNameTr.hasClass("edit")) {
				$folderNameTr.removeClass("edit");
			} else {
				$folderNameTr.addClass("edit");
			}
			jQuery(target).parent().parent().hide();
			jQuery(target).parent().parent().next().show();
		});
		settingEvent.add("modify-folder", function(target) {
			var fid = jQuery(target).parent().attr("fid");
			var inputObj = jQuery("#modify_folder_"+fid);
			
			if (!validateInputValue(inputObj, 2, 32, "folderName")) {
				return;
			}
			var preFolder = inputObj.attr("previous_name");
			var newFolder = jQuery.trim(inputObj.val());
			var preFolderName = jQuery("#modify_folder_"+fid).data("folder-name");
	        if(newFolder == preFolderName){
	            var fid = jQuery(target).parent().attr("fid");
	            var previousName = jQuery("#modify_folder_"+fid).attr("previous_name");
	            jQuery("#modify_folder_"+fid).val(preFolderName);
	            closeModifyFolderArea();
	            return;
	        }
	    	var parentFolder = "";
			if (preFolder.indexOf(".") > 0) {
				parentFolder = preFolder.substring(0, preFolder.lastIndexOf(".")+1);			
			}			
			newFolder = parentFolder+""+newFolder;
			if (isDefaultBoxCheck(newFolder)) {
				jQuery.goMessage(mailMsg.alert_systemfolder);
				return;
			}

		    var param = {"previousName":preFolder, "newName":newFolder};
			folderControl.modifyFolder(param, function() {
				_this.loadViewFolderManage();
			});
		});
		settingEvent.add("modify-folder-cancel", function(target) {
			var fid = jQuery(target).parent().attr("fid");
			var preFolderName = jQuery("#modify_folder_"+fid).data("folder-name");
			var previousName = jQuery("#modify_folder_"+fid).attr("previous_name");
			jQuery("#modify_folder_"+fid).val(preFolderName);
			closeModifyFolderArea();
		});
		settingEvent.add("add-tag", function(target) {
			addMailTag();
		});
		settingEvent.add("delete-folder", function(target) {
			var folderName = jQuery(target).parent().attr("fname");
			deleteFolder(folderName);
		});
		settingEvent.add("move-folder", function(target) {
			var folderName = jQuery(target).parent().attr("fname");
			moveFolder(folderName,true);
		});
		settingEvent.add("empty-folder", function(target) {
			var folderName = jQuery(target).parent().attr("fname");
			emptyFolder(folderName);
		});
		settingEvent.add("modify-tagName", function(target) {
			var tagName = jQuery(target).attr("tagname");
            var tagColor = jQuery(target).attr("tagcolor");
            var tagId = jQuery(target).attr("tagid");
            var data = {"id":tagId,"name":tagName,"color":tagColor,"type":"modify"};
            addMailTag(data);
		});
		settingEvent.add("modify-tag-cancel", function(target) {
			var oldId = jQuery(target).parent().attr("fid");
			jQuery("#mailTagPallete").remove();
			jQuery("#tag_row_"+oldId).show();
			jQuery("#tag_modify_area_"+oldId).hide().empty();
		});
		settingEvent.add("delete-tag", function(target) {
			var tagId = jQuery(target).attr("tagid");
			deleteMailTag(tagId);
		});
		settingEvent.add("backup-folder", function(target) {
			var folderName = jQuery(target).parent().attr("fname");
			var fid = jQuery(target).parent().attr("fid");
			startBackupFolderExcute(folderName, fid);
		});
		settingEvent.add("download-backup", function(target) {
			_this.downloadBackupFolder();
		});
		settingEvent.add("delete-backup", function(target) {
			_this.deleteBackupFolder();	
			jQuery("#empty_org").hide();
		});
		settingEvent.add("lastrcpts-delete", function(target) {
			jQuery(target).closest("tr").remove();
			var rcptSeq = jQuery(target).data("seq");
			deleteLastRcptExcute(rcptSeq);
		});
		settingEvent.add("lastrcpts-delete-all", function(target) {
			deleteAllLastRcptExcute();
		});
		settingEvent.add("share-folder", function(target) {
			var folderName = jQuery(target).parent().attr("fname");
			openShareFolderSettingLayer(folderName, function() {
				_this.loadViewFolderManage();
			});
			var isShare = ("on" == jQuery(target).parent().data("share"));
            if (isShare) {
                var shareSeq = jQuery(target).parent().data("shareseq");
                jQuery("#orgShareFlag").attr("checked",true);
                jQuery("#orgShareFlag").data("shareSeq",shareSeq);
                var param = {"folderUid":shareSeq};
                folderControl.getSharringReaderList(param);
            }
		});
		settingEvent.add("save-auto-reply", function(target) {
			saveAutoReply();
		});
		settingEvent.add("auto-reply-cancel", function(target) {
			_this.loadViewAutoReply();
		});
		settingEvent.add("rcpt-setting-cancel", function(target) {
			_this.loadViewLastRcpt();
		});
		settingEvent.add("save-rcpt", function(target) {
			saveLastRcptExcute();
		});
		settingEvent.add("upload-folder", function(target) {
			upfolderName = jQuery(target).parent().attr("fname");
        	openUploadMessageLayer();
		});
		settingEvent.add("add-sender-email", function(target) {
			validateAddSenderEmail();
			if(jQuery("#mailSenderListTbody tr").length > 1) {
				jQuery("#myEmailDefault").show();
			}
		});
		settingEvent.add("delete-sender-item", function(target) {
			if(jQuery(target).closest("tr").find('#defaultEmail').length > 0){
				jQuery('.senderItem').first().after('<span id="defaultEmail">('+mailMsg.conf_userinfo_sender_email_default+')</span>');
			}
			jQuery(target).closest("tr").remove();
			if (jQuery("#mailSenderListTbody tr").length == 0) {
				jQuery("#mailSenderListWrap").hide();
			}else if(jQuery("#mailSenderListTbody tr").length == 1) {
				jQuery("#myEmailDefault").hide();
			}
		});
		settingEvent.add("default-sender-email", function(target) {
			jQuery("#defaultEmail").remove();
			jQuery(target).closest("tr").find(".senderItem").after('<span id="defaultEmail">('+mailMsg.conf_userinfo_sender_email_default+')</span>');
		});
		
		var settingMenuEvent = new EventControl("#mailSettingWrap", "click", "a, span, ins, li");
		settingMenuEvent.add("basic-setting", function(target) {
			selectSettingMenu("basic");
		});
		settingMenuEvent.add("sign-setting", function(target) {
			selectSettingMenu("sign");
		});
		settingMenuEvent.add("folder-setting", function(target) {
			selectSettingMenu("folder");
		});
		settingMenuEvent.add("spam-setting", function(target) {
			selectSettingMenu("spam");
		});
		settingMenuEvent.add("auto-filter", function(target) {
			selectSettingMenu("filter");
		});
		settingMenuEvent.add("auto-forward", function(target) {
			selectSettingMenu("forward");
		});
		settingMenuEvent.add("auto-reply", function(target) {
			selectSettingMenu("autoreply");
		});
		settingMenuEvent.add("extMail-setting", function(target) {
			selectSettingMenu("extmail");
		});
		settingMenuEvent.add("last-rcpt", function(target) {
			selectSettingMenu("lastrcpt");
		});
		
		var settingChangeEvent = new EventControl("#mailSettingWrap", "change", "select");
		settingChangeEvent.add("spam-policy", function(target) {
			checkSpamMode();
		});
		settingChangeEvent.add("spam-level", function(target) {	
		});
		settingChangeEvent.add("spam-handle", function(target) {
		});
		settingChangeEvent.add("pop3-server-select", function(target) {
			setPOP3Server();
		});
		settingChangeEvent.add("change-UserFolderAging", function(target) {
			var folderName = jQuery(target).data("name");
			var preAgingDay = jQuery(target).data("preaging");
			var newAgingDay = jQuery(target).val();
			var selectIdx = jQuery(target).data("index");
			var param = {"folderName":folderName, "preAgingDay":preAgingDay, "agingDay":newAgingDay, "selectIdx":selectIdx };
			changeUserFolderAgingDayExcute(param,jQuery(target));
		});
		settingChangeEvent.add("reply-mode", function(target) {
			changeReplyMode();
		});
	};
	
	// 기본 설정
	this.loadBasicSetting = function() {	
		changeMailContainer("setting");
		ActionLoader.getGoLoadAction(this.basicSettingAction, null, _this.printBasicSetting, "json");
		google.sendPageView(this.basicSettingAction);
	};
	
	this.printBasicSetting = function(data) {
		setSchedulerTab('0');
		var myEmail = USERLOGINEMAIL;
		data.myEmail = '"'+data.senderName+'" <'+myEmail+'>';
		data.mailExposure = MAIL_EXPOSURE;
		if(data.useMailSender){
			var isMyEmailDefault = true;
			var senderList = data.senderList;
			if(senderList){
				for(var i = 0;i<senderList.length;i++){
					if(senderList[i].defaultMail){
						isMyEmailDefault = false;
					}
				}
			}
			
			data.myEmailDefault=isMyEmailDefault;
		}
		
		jQuery("#mailSettingContent").handlebars("mail_setting_basic_tmpl", data);
		jQuery.ajax({
			type: "GET",
			url: "/api/user/available/emails",
			data: null,
			async: false,
			success: function(resultData,textStatus){
				var targetEl = jQuery('#availableEmails');
				jQuery(resultData.data).each(function(i,item) {
					targetEl.append("<option value="+ item.email +" data-type="+item.userType+">"+ item.email +"</option>");
				});
			},
			dataType: "json"
		});
		_this.initTabScroll();
	};
	
	// 기본 설정 저장
	this.saveBasicInfo = function(param) {
		ActionLoader.postGoJsonLoadAction(this.basicSettingAction, param, function(data) {
			if (jQuery("#searchallfolder").attr("checked")) {
				searchAllFolder = "on";
			} else {
				searchAllFolder = "off";
			}
			isPopupWrite = ("popup" == jQuery("#composeModeSelect").val());
			isWriteNoti = (jQuery("#writeNoti").attr("checked"));
			isMailBadgeUse = (jQuery("#mailBadgeUse").attr("checked"));
			makeMailBadgeCount();
			jQuery.goSlideMessage(mailMsg.save_ok);
		}, "json");
	};
	
	this.saveBasciPopupInfo = function(param) {
		ActionLoader.postGoJsonLoadAction(this.vcardAction, param, _this.messageAlert, "json");
	};
	
	
	this.savePopupVcardInfo = function(param) {		
		ActionLoader.postGoJsonLoadAction(this.vcardAction, param, _this.vcardMessagevAlert, "json");
	};	
	
	this.saveSpamInfo = function(param) {
		ActionLoader.postGoJsonLoadAction(this.spamRuleAction, param, function(data) {
			jQuery.goSlideMessage(mailMsg.save_ok);
		}, "json");
	};
	
	
	//기본설정, 서명관리, 스팸, 최근메일주소, 자동전달, 부재중응답 결과 상태 메시지 
	this.resultDialog = function(data){
		if(data.isSuccess){
			/*jQuery.goAlert(data.isSuccess);*/
			jQuery.goSlideMessage(data.isSuccess);
		}else{
			/*jQuery.goAlert(data.isFail);*/
			jQuery.goSlideMessage(data.isFail,"caution");
		}
	};
	
	// 기본 설정 상태 메시지
	this.filterMessageAlert = function(data) {
		if (data.result) {			
			if (data.msg){						
				/*jQuery.goAlert(data.msg);*/
				jQuery.goSlideMessage(data.msg);
			} else {
				/*jQuery.goAlert(mailMsg.common_job_success);*/
				jQuery.goSlideMessage(mailMsg.common_job_success);
			}
		} else {
			if (data.msg){
				/*jQuery.goAlert(data.msg);*/
				jQuery.goSlideMessage(data.msg,"caution");
			}
		}
		_this.loadViewFilter();
	};
	
	// 기본 설정 상태 메시지
	this.messageAlert = function(data) {
		if (data.result) {			
			if (data.msg){								
				jQuery.goAlert(data.msg);
			} else {
				jQuery.goAlert(mailMsg.common_job_success);
			}
		} else {
			if (data.msg)
				jQuery.goAlert(data.msg);
		}			
	};

	this.extMessageAlert = function(data) {
		if (data.isSuccess) {			
			if (data.msg){								
				jQuery.goAlert(data.msg);
			} else {
				jQuery.goAlert(mailMsg.common_job_success);
			}
			jQuery.goPopup.close();
		} else {
			if (data.msg) {				
				jQuery.goAlert(data.msg);
				return false;
			}				
		}			
	};
	
	this.vcardMessagevAlert = function(data) {
		jQuery.goAlert(mailMsg.save_ok);		
		//jQuery.goPopup.close();
	};
	
	// 기본 설정 상태 메시지
	this.saveForwardMessageAlert = function(data) {
		if (data.result) {
			/*jQuery.goAlert(data.msg);*/	
			jQuery.goSlideMessage(data.msg);
		} else {			
			if (data.msg){			
				/*jQuery.goAlert(data.msg);*/
				jQuery.goSlideMessage(data.msg,"caution");
			}
		}
		_this.loadViewForward();
	};

	// 서명 관리
	this.settingDefaultSign = function(param) {
		ActionLoader.postGoLoadAction(this.defaultSignAction, param, function (data){
			jQuery.goSlideMessage(mailMsg.save_ok);
			_this.loadViewSign();
		}, "json");
	};
	this.modifySign = function(param) {
		ActionLoader.postGoLoadAction(this.signAction, param, function (data){
			_this.loadViewSign();
			jQuery.goSlideMessage(mailMsg.save_ok);
		}, "json");
	};
	this.deleteSignData = function(param) {
		ActionLoader.postGoLoadAction(this.deleteSignDataAction, param, function (data){
			_this.loadViewSign();
			jQuery.goSlideMessage(mailMsg.del_ok);
		}, "json");
	};
	this.deleteAllSignData = function() {
		ActionLoader.postGoLoadAction(this.deleteAllSignDataAction, null, function (data){
			_this.loadViewSign();
			jQuery.goSlideMessage(mailMsg.del_ok);
		}, "json");
	};
	this.addSignData = function() {
		var param = {"useFlash":hasFlashPlayer()};
		var modal_chk = jQuery("#mail_setting_modify_sign_modal").length;
		if (!modal_chk) {
			jQuery.goPopup({
				id : 'mail_setting_modify_sign_modal',
				width : 700,
				isLock : true,
				offset:{top:"10px",left : '25%'},
				pclass : 'layer_normal layer_sign',
				header : mailMsg.conf_profile_66,
				contents : getHandlebarsTemplate("mail_setting_modify_sign_modal_tmpl", param),
				openCallback : function() {
					settingEditorBoxScript();
					jQuery("#signSelectMode").show();
					jQuery("#registSignImage").show();
					jQuery("#signText").hide();
					jQuery("#signHtml").show();
					jQuery("#signImgSizeText").show();
					jQuery("#onlySignImgSize").hide();

					jQuery("#signWriteType").val("write");
					
					var layerHeight = jQuery(window).height() - 200;
					jQuery("#mail_setting_modify_sign_modal .content").css({"height":layerHeight+"px","overflow-y":"scroll"});
					
					jQuery("#mail_setting_modify_sign_modal table.form_type").on("change","select, input, span", function(evnet) {
						var type = jQuery(this).attr("evt-rol");
						if (!type)
							return;
						if (type == "change-SignMode") {
							changeSignMode();
						} else if (type == "change-onlyImageSignMode") {
							changeOnlyImageSignMode();
						} else if (type == "changeImgSize") {
							changeImgSize();
						}
					});

					jQuery("#mail_setting_modify_sign_modal table.form_type").on("click", "span", function(evnet) {
						var type = jQuery(this).attr("evt-rol");
						if (!type)
							return;
						if (type == "upload-SignImage") {
							selectSignImage();
						}
					});
					
					jQuery("#sign_img_delete").on("click", function(){
						deleteThumbnailImage();
						jQuery("#sign_img_delete").hide();
					});
//					simpleBasicControl = new SimpleBasicControl();
//			        simpleBasicControl.makeBtnControl();
			        
					var signSettingOpt = {
							locale:LOCALE
					};
					if (hasFlashPlayer()) {
						signSettingControl = new SignSettingControl(signSettingOpt);						
					} else {
						signSettingControl = new SignSimpleSettingControl(signSettingOpt);
						
						jQuery('#mailSimpleSignImageUpload').fileupload({
	    					url:"/api/mail/image/upload",
	    					formData: {
	    						uploadType:'flash',
	    						maxImageSize: jQuery("#maxImageSize").val()
	    					},
	    			        dataType: 'json',
	    			        pasteZone:null,
	    			        done: function (e, data) {
	    			        	var result = data.result;
	    			        	if (result.errorMessage == "") {
	    	                    	jQuery("#thumbnail_image").attr("src", result.fileURL).attr("img-data",result.filePath).attr("img-name",result.fileName);
	    			        		jQuery("#sign_img_delete").show();
	    			        	} else {
	    			        		jQuery.goSlideMessage(result.errorMessage, "caution");
	    			        	}
	    			        }
	    			    });
					}
					signSettingControl.makeBtnControl();
				},
				closeCallback : function() {
				    settingEditorBoxDestroy();
				    _this.destroySignAttach();
					jQuery("#mail_setting_modify_sign_modal div.content").off();
				},
				buttons : [ {btype : 'confirm', btext : mailMsg.comn_confirm, autoclose:false, callback : saveSign}, {
							btype : 'cancel', btext : mailMsg.comn_cancel} ],
				toggleTrigger : false
			});
		}
	};
	this.destroySignAttach = function() {
		if(signSettingControl) {
			var isExistBasicButton =jQuery("#registSignImage object").length==0?false:true;
			if(isExistBasicButton){
	    		try {
	    			signSettingControl.destroy();
	    		} catch(e){}
	        }
	    }
	};
	this.saveSignData = function(param) {
		ActionLoader.postGoJsonLoadAction(this.signDataAction, param,function(data){
			_this.loadViewSign();
			jQuery.goSlideMessage(mailMsg.save_ok);
		}, "json");
	};
	this.loadViewSign = function() {
		changeMailContainer("setting");
		ActionLoader.getGoLoadAction(this.signAction, null, _this.printViewSign, "json");
		google.sendPageView(this.signAction);
	};
	this.printViewSign = function(data) {		
		setSchedulerTab('1');
		jQuery("#mailSettingContent").handlebars("mail_setting_sign_tmpl", data);
		_this.initTabScroll();
	};
	this.printViewSignData = function(data) {		
		setSchedulerTab('1');
		jQuery("#mailSettingContent").handlebars("mail_setting_sign_data_tmpl", data);
	};
	this.loadWriteSignData = function(){
		ActionLoader.postLoadAction(this.writeSignDataAction, null, _this.printSignDataAction, "json");
	};
	this.loadModifySignData = function(signSeq) {
		ActionLoader.getGoLoadAction(this.signDataAction, {'signSeq':signSeq}, _this.modifySignData, "json");
	};
	this.modifySignData = function(data) {
		data.useFlash = hasFlashPlayer();
		var modal_chk = jQuery("#mail_setting_modify_sign_modal").length;
		
		if(!modal_chk){
			jQuery.goPopup({
				id: 'mail_setting_modify_sign_modal',
				width: 700,
				isLock : true,
				offset:{top:"10px",left : '25%'},
				pclass: 'layer_normal layer_sign',
				header: mailMsg.conf_sign_edit,
				contents: getHandlebarsTemplate("mail_setting_modify_sign_modal_tmpl", data),
				openCallback : function() {
					var chk_signType = data.signType;

					if(chk_signType == 'image' || chk_signType == 'image_full'){
						jQuery("#signText").hide();
						jQuery("#signHtml").hide();
						jQuery("#signSelectMode").hide();
						jQuery("#signImgSizeText").hide();
						jQuery("#onlySignImgSize").show();
						
						jQuery("#thumbnail_image").removeAttr("width");
						jQuery("#thumbnail_image").removeAttr("height")
						
						jQuery("#thumbnailImageWrap").height("170px");
						if(chk_signType == 'image') {
							jQuery("#thumbnail_image").css({"width":"350px","height":"170px"});
							jQuery("#signImageSizeDesc").text("350 x 170");
						}
						
						jQuery("#sign_only_image").attr("checked", "checked");
					}else{
						jQuery("#signSelectMode").show();
						jQuery("#registSignImage").show();
						var signMode = jQuery("#sign_mode").val();
						if(signMode == "html"){
							jQuery("#signText").hide();
							jQuery("#signHtml").show();
							settingEditorBoxScript(null, data.signText);
						}else{
							jQuery("#signText").show();
							jQuery("#signHtml").hide();
						}
						jQuery("#onlySignImgSize").hide();
						jQuery("#thumbnailImageWrap").height("120px");
						jQuery("#thumbnail_image").css({"width":"100px","height":"120px"});
						jQuery("#signImageSizeDesc").text("100 x 120");
					}
					
					jQuery("#signWriteType").val("modify");
					
					var layerHeight = jQuery(window).height() - 200;
					jQuery("#mail_setting_modify_sign_modal .content").css({"height":layerHeight+"px","overflow-y":"scroll"});
					
					jQuery("#mail_setting_modify_sign_modal table.form_type").on("change", "select, input, span", function(evnet) {
							var type = jQuery(this).attr("evt-rol");
							if (!type)
								return;
							if (type == "change-SignMode") {
								changeSignMode();
							} else if (type == "change-onlyImageSignMode") {
								changeOnlyImageSignMode(data.signText);
							} else if (type == "changeImgSize") {
								changeImgSize();
							}
					});

					jQuery("#mail_setting_modify_sign_modal table.form_type").on("click", "span", function(evnet) {
							var type = jQuery(this).attr("evt-rol");
							if (!type)
								return;
							if (type == "upload-SignImage") {
								selectSignImage();
							}
					});
					
					jQuery("#sign_img_delete").on("click", function(){
						deleteThumbnailImage();
						jQuery("#sign_img_delete").hide();
					});
					
					
					var signSettingOpt = {     
                            width:(LOCALE == "jp") ? 90 : 73,                       
                    };
					//signSettingControl = new SignSettingControl(signSettingOpt);
					
					if (hasFlashPlayer()) {
						signSettingControl = new SignSettingControl(signSettingOpt);						
					} else {
						signSettingControl = new SignSimpleSettingControl(signSettingOpt);
						
						jQuery('#mailSimpleSignImageUpload').fileupload({
	    					url:"/api/mail/image/upload",
	    					formData: {
	    						uploadType:'flash',
	    						maxImageSize: jQuery("#maxImageSize").val()
	    					},
	    			        dataType: 'json',
	    			        pasteZone:null,
	    			        done: function (e, data) {
	    			        	var result = data.result;
	    			        	if (result.errorMessage == "") {
	    	                    	jQuery("#thumbnail_image").attr("src", result.fileURL).attr("img-data",result.filePath).attr("img-name",result.fileName);
	    			        		jQuery("#sign_img_delete").show();
	    			        	} else {
	    			        		jQuery.goSlideMessage(result.errorMessage, "caution");
	    			        	}
	    			        }
	    			    });
					}
					signSettingControl.makeBtnControl();
					
				},
				closeCallback : function() {
				    settingEditorBoxDestroy();
				    signSettingControl.destroy();
					jQuery("#mail_setting_modify_sign_modal div.content").off();
				},
				buttons : [ {btype : 'confirm', btext : mailMsg.comn_confirm, autoclose:false, callback : saveSign}, 
				            {btype : 'cancel', btext : mailMsg.comn_cancel} 
				],
				toggleTrigger : false
			});
		}
	};
	this.printSavaSignDataResult = function(data) {
		if(data.isSuccess == 'success'){
			jQuery.goAlert("success");
		}
	};
	
	// 메일함 관리
	this.loadViewFolderManage = function() {		
		changeMailContainer("setting");
		ActionLoader.getGoLoadAction(_this.folderManageAction, null, _this.viewFolderSetting, "json");
		google.sendPageView(this.folderManageAction);
	};
	this.viewFolderSetting = function(data) {		
		setSchedulerTab('2');
		jQuery("#mailSettingContent").handlebars("mail_setting_folder_tmpl", data.folderListModel);
		if(!useSharedfolder){
			jQuery("#folderManageWrap .shareFolder").hide();
		}
		if(data.backupModel && data.backupModel.folderName) {
			backupStatusId = data.backupModel.folderName;
		}
		_this.checkBackup(data.backupModel);
		_this.printBackupFolderInfo(data.backupModel);
		_this.processBackupFolder();
		_this.initTabScroll();
		
		
	};
	this.initTabScroll = function(){
	    jQuery("#mailSettingContent").css({
	    		"overflow-y":"auto",
	    		"height": (jQuery(window).height() - 175) + "px"
	    	});
	};
	this.messageResult = function(data){
		if(data.msg == "success"){
			jQuery.goAlert("success");
		}else{
			jQuery.goAlert(data.msg);
		}
	};
	this.changeUserFolderAgingDay = function(param) {
		ActionLoader.postLoadAction(this.changeUserFolderAgingAction, param, 
		function(data){
			jQuery.goMessage(mailMsg.common_job_change);
		}, function() {
			jQuery.goMessage(mailMsg.conf_pop_56);
		},"json");
	};
	////////////////////////////////메일함 관리 > 백업 ////////////////////////////////////
	this.startBackupFolder = function(param) {
	    param.type="start";
	    _this.printBackupFolderInfo(param);
		ActionLoader.postGoLoadAction(this.startBackupFolderAction, param, _this.resultStartBackupProcess, "json");
	};
	this.resultStartBackupProcess = function(data) {
		isBackup = false;
        if(!data.error){
            isBackup = true;
            backupFolderName = data.folderName;
            backupFolderEncName = data.folderEncName;
             _this.processBackupFolder();
        }
        _this.printBackupFolderInfo(data);
        backupWork = false;
	};
	
	this.processBackupFolder = function(){
		if(isBackup){
			backupInterval = setTimeout(function() {
				_this.statusBackupFolder();
			},3000);
		}
	};
	this.checkBackup = function(backupStatus){
		if(backupStatus.processing){
			isBackup = true;
		} else {
			isBackup = false;
		}
		if(backupStatus.complate){
			isBackupComplete = true;
		} else {
			isBackupComplete = false;
		}
		if(backupStatus.folderName){
		    backupFolderName = backupStatus.folderName;
		    backupFolderEncName = backupStatus.folderEncName;
		}
	};
	this.statusBackupFolder = function() {
		ActionLoader.getGoLoadAction(this.statusBackupFolderAction, null, function(data){
			if(data.error){
			     isBackup = false;
			     data.folderEncName = backupFolderEncName;
			}else {
			    if(data.complate){
                    isBackup = false;
                    isBackupComplete = true;    
                }
			   _this.processBackupFolder(); 
			}
    		_this.printBackupFolderInfo(data);
		}, "json");
	};
	this.printBackupFolderInfo = function(info) {
		var convertedStatusId = getFolderNameId(info.folderEncName);
		if(!info.error && info.type=="start"){
		    jQuery("#startBackup_graph_"+convertedStatusId).parent().show();
			jQuery("#startBackup_graph_"+convertedStatusId).css("width","0%");
			jQuery("#startBackup_"+convertedStatusId+" span.desc").text(mailMsg.mail_backup_process);
			jQuery("#startBackup_"+convertedStatusId).show();
		}else if(info.type=="start"){
		     jQuery("#startBackup_graph_"+convertedStatusId).parent().hide();
		     jQuery("#startBackup_"+convertedStatusId+" span.desc").text(mailMsg.mail_backup_start);  
		     jQuery("#startBackup_"+convertedStatusId).show();
		} else if(info.error){
		    jQuery("#startBackup_graph_"+convertedStatusId).parent().hide();
			jQuery("#startBackup_"+convertedStatusId+" span.desc").text(mailMsg.mail_backup_error);	
		} else if(info.complate){
			var folderNameArray = info.folderName.split(".");
			var folderName = folderNameArray[folderNameArray.length-1];
			var complateMsg = "\"" + folderName + "\" " + mailMsg.mail_backup_complete + " ("+info.fileSizeFormat+")";
			if(jQuery("#startBackup_graph_"+convertedStatusId).length == 0) {
				jQuery("#empty_org").show();
				jQuery("#empty_msg").append(complateMsg);
			} else {
				jQuery("#startBackup_graph_"+convertedStatusId).css("width","100%");
				jQuery("#startBackup_"+convertedStatusId).hide();
				jQuery("#completeBackup_"+convertedStatusId+" span.desc").text(complateMsg);
				jQuery("#completeBackup_"+convertedStatusId).show();
			}
		}else if(info.processing){
			jQuery("#startBackup_" + convertedStatusId).show();
			jQuery("#startBackup_graph_"+convertedStatusId).css("width",info.percent+"%");			
		} else {
			jQuery("#startBackup_"+convertedStatusId).hide();
			jQuery("#completeBackup_"+convertedStatusId).hide();
		}
	};
	this.downloadBackupFolder = function() {
		isBackup = false;
		isBackupComplete = false;
		_this.printBackupFolderInfo({"folderName":backupFolderName,"folderEncName":backupFolderEncName});
		jQuery("#reqFrame").attr("src",this.downloadBackupFolderAction);
	};
	this.deleteBackupFolder = function() {
		isBackup = false;
		isBackupComplete = false;
		_this.printBackupFolderInfo({"folderName":backupFolderName,"folderEncName":backupFolderEncName});
		ActionLoader.postGoLoadAction(this.deleteBackupFolderAction, null, function(data) {
			if(!data.error){
				jQuery.goAlert(mailMsg.alert_backup_delete_success);				
			} else {
				jQuery.goAlert(mailMsg.alert_backup_delete_error);
			}
			isBackup = false;
			isBackupComplete = false;
			_this.processBackupFolder();
			backupWork = false;
		}, "json");
	};
	
	// 스팸 관리
	this.loadViewSapmRule = function() {		
		changeMailContainer("setting");
		ActionLoader.getGoLoadAction(this.spamRuleAction, null, _this.viewSpamRuleSetting, "json");
		google.sendPageView(this.spamRuleAction);
	};
	
	this.viewSpamRuleSetting = function(data) {
		setSchedulerTab('3');
		var spamPolicy = getSpamPolicy(data);
		data.spamPolicyValue = spamPolicy; 
		jQuery("#mailSettingContent").handlebars("mail_setting_spam_tmpl", data);
		checkSpamMode();
		_this.initTabScroll();
	};
	
	// 스팸 설정 저장
	this.saveSpamInfo = function(param) {
		ActionLoader.postGoJsonLoadAction(this.spamRuleAction, param, function(data) {
			jQuery.goSlideMessage(mailMsg.save_ok);
		}, "json");
	};
	
	// 자동 분류
	this.loadViewFilter = function() {		
		changeMailContainer("setting");				
		ActionLoader.getGoLoadAction(this.filterAction, null, _this.viewFilterSetting, "json");
		google.sendPageView(this.filterAction);
	};
	
	this.viewFilterSetting = function(data) {
		setSchedulerTab('4');
		data.smartFilter = smartFilter;
		jQuery("#mailSettingContent").handlebars("mail_setting_filter_tmpl", data);
		_this.initTabScroll();
	};
	
	// 자동 분류 저장 
	this.saveFilterInfo = function(param) {		
		ActionLoader.postGoJsonLoadAction(this.saveFilterApplyAction, param, function() {
			jQuery.goSlideMessage(mailMsg.save_ok);
		}, "json");
	};
	
	// 자동 전달
	this.loadViewForward = function() {		
		changeMailContainer("setting");
		ActionLoader.getGoLoadAction(this.forwardAction, null, _this.viewForwardSetting, "json");
	};
	
	// 자동 전달 저장  
	this.saveForwardInfo = function(param) {		
		ActionLoader.postGoJsonLoadAction(this.forwardAction, param, function(data) {
			jQuery.goSlideMessage(mailMsg.save_ok);
			_this.loadViewForward();
		}, "json");
	};
	
	// 예외 자동 전달 저장
	this.saveDefineForwardInfo = function(param) {
		ActionLoader.postGoJsonLoadAction(this.saveDefineForwardAction, param, function(data) {
			jQuery.goSlideMessage(mailMsg.save_ok);
			_this.loadViewForward();
			/*_this.resultDialog(data);*/		
		}, "json");
	};

	this.viewForwardSetting = function(data) {
		setSchedulerTab('5');
		maxForwaringCount = data.maxForwaringCount;
		jQuery("#mailSettingContent").handlebars("mail_setting_forward_tmpl", data);
		_this.initTabScroll();
	};	
	
	// 자동 분류 룰 삭제	
	this.deleteFilterRule = function(param) {
		ActionLoader.postGoLoadAction(this.deleteFilterAction, param, function() {
			jQuery.goSlideMessage(mailMsg.del_ok);
			_this.loadViewFilter();
		}, "json");		
	};
	
	// 부재중 응답
	this.loadViewAutoReply = function() {		
		changeMailContainer("setting");
		ActionLoader.getGoLoadAction(this.autoReplyAction, null, _this.viewAutoReplySetting, "json");
		google.sendPageView(this.autoReplyAction);
	};
	
	this.addReplyMail = function() {
		var modal_chk = jQuery("#mail_setting_mailadd").length;
		if (!modal_chk) {
			jQuery.goPopup({
				id : 'mail_setting_mailadd',
				pclass : 'layer_normal layer_add_mailbox',
				header : mailMsg.conf_spamrule_47,
				contents : getHandlebarsTemplate("mail_setting_mailadd_tmpl"),
				openCallback : function() {

				},
				closeCallback : function() {
					jQuery("#mail_setting_mailadd div.content").off();
				},
				buttons : [ {btype : 'confirm', btext : mailMsg.comn_confirm, autoclose:false, callback : saveMailAdd}, {
							btype : 'cancel', btext : mailMsg.comn_cancel} ] 
			});
		}		
	};
	
	this.viewAutoReplySetting = function(data) {
		setSchedulerTab('6');
		jQuery("#mailSettingContent").handlebars("mail_setting_reply_tmpl", data);
		jQuery("#startTime").datepicker({
			dateFormat : "yy-mm-dd",
			changeMonth: true,
	        changeYear: true,
            yearSuffix: ""
	    });
		jQuery("#endTime").datepicker({
			dateFormat : "yy-mm-dd",
			changeMonth: true,
	        changeYear: true,
            yearSuffix: ""
	    });
		_this.initTabScroll();
	};
	
	this.saveAutoReply = function(param) {
		ActionLoader.postGoJsonLoadAction(this.autoReplyAction, param, function() {
			jQuery.goSlideMessage(mailMsg.save_ok);
		}, "json");
	};
	
	// 외부메일설정
	this.loadViewExtMail = function() {		
		changeMailContainer("setting");
		ActionLoader.getGoLoadAction(this.extMailsAction, null, _this.viewExtMailSetting, "json");
		google.sendPageView(this.extMailsAction);
	};

	this.viewExtMailSetting = function(data) {
		setSchedulerTab('7');
		installLocale = data.installLocale;
		jQuery("#mailSettingContent").handlebars("mail_setting_ext_tmpl", data);
		_this.initTabScroll();
	};
	
	// 외부메일설정 삭제
	this.deleteExtRule = function(param) {
		ActionLoader.postGoJsonLoadAction(this.deleteExtMailAction, param, function(data) {
			jQuery.goSlideMessage(mailMsg.del_ok);
			_this.loadViewExtMail();
		}, "json");
	};
	
	// 외부메일설정 전체 삭제
	this.deleteAllExtRule = function() {
		ActionLoader.postGoJsonLoadAction(this.deleteAllExtMailAction, null, function(data) {
			jQuery.goSlideMessage(mailMsg.del_ok);
			_this.loadViewExtMail();
		}, "json");
	};
	
	// 최근 메일주소
	this.loadViewLastRcpt = function() {		
		changeMailContainer("setting");
		ActionLoader.getGoLoadAction(this.lastRcptAction, null, _this.viewLastRcptSetting, "json");
		google.sendPageView(this.lastRcptAction);
	};

	this.viewLastRcptSetting = function(data) {
		setSchedulerTab('8');
		data.mailExposure = MAIL_EXPOSURE;
		data.companyDomainList = companyDomainList;
		jQuery("#mailSettingContent").handlebars("mail_setting_rcpt_tmpl", data);
		_this.initTabScroll();
	};
	
	this.deleteLastRcpt = function(param) {
		ActionLoader.postGoLoadAction(this.lastRcptAction,param,function(data){
			jQuery.goSlideMessage(mailMsg.save_ok);
			_this.loadViewLastRcpt();
		}, "json");
	};
		
	this.loadManageVcard = function() {		
		ActionLoader.getGoLoadAction(this.vcardAction, null, _this.manageVcard ,"json");					
	};
	

	this.manageVcard = function(data) {
		data.useFlash = hasFlashPlayer();
		var popupEl = jQuery.goPopup({
			id: 'mail_setting_modal_popup',
			width: 700,
			pclass: 'layer_normal layer_nameCard',
			header: mailMsg.conf_sign_13,
			contents: getHandlebarsTemplate("mail_setting_modal_tmpl", data),
			openCallback : function() {
				jQuery("#mail_setting_modal_popup div.content").on("click","input, span, a", function(e) {
					var type = jQuery(this).attr("evt-rol");
					if (type == "add-folder-select-parent") {
						if (jQuery(this).attr("checked")) {
							jQuery("#addFolderParentSelect").attr("disabled", false);
						} else {
							jQuery("#addFolderParentSelect").attr("disabled", true);
						}
					} else if (type == "basic-upload-photo") {												
						selectPicture();
					} else if (type == "delete-photo") {
						deleteThumbnailImage();
						jQuery("#vcard_img_delete").hide();
					} else if (type == "detail-addr") {				
						toggleAddressLayer('office');
					} else if (type == "detail-home-addr") {						
						toggleAddressLayer('home');
					}					
				});			
				
				jQuery("#mail_setting_modal_popup div.content").on("change","select", function(event) {
					var type = jQuery(this).attr("evt-rol");
					if (type == "select-item") {
						var selecetdItem = jQuery(this).find("option:selected");		                 
		    			var itemId = selecetdItem.val();		    			
		    			if (itemId && itemId !="") {
		    				var itemName = selecetdItem.text();		    				
		    				var data = {"itemName":itemName, "itemId":itemId};
		    				var isExistItem = jQuery("#tbody #" + itemId).length == 0 ? true:false;		    				
		    				if (isExistItem)		    				
		    					jQuery("#selectAddItem").before(getHandlebarsTemplate("addr_member_view_add_item_tmpl",data));
		    				
		    				selecetdItem.remove();		    				
		    			}		    			
		    		}	
				});
				
				var simpleBasicOpt = {"locale":LOCALE};
				
				if (hasFlashPlayer()) {
					simpleBasicControl = new SimpleBasicControl(simpleBasicOpt);						
				} else {
					simpleBasicControl = new UploadSimpleBasicControl(simpleBasicOpt);
					
					jQuery('#mailSimpleVcardImageUpload').fileupload({
    					url:"/api/mail/image/upload",
    					formData: {
    						uploadType:'flash',
    						maxImageSize: jQuery("#maxImageSize").val()
    					},
    			        dataType: 'json',
    			        pasteZone:null,
    			        done: function (e, data) {
    			        	var result = data.result;
    			        	if (result.errorMessage == "") {
    	                    	jQuery("#thumbnail_image").attr("src", result.fileURL).attr("img-data",result.filePath).attr("img-name",result.fileName);
    			        		jQuery("#vcard_img_delete").show();
    			        	} else {
    			        		jQuery.goSlideMessage(result.errorMessage, "caution");
    			        	}
    			        }
    			    });
				}
				simpleBasicControl.makeBtnControl();
			},
			closeCallback : function(){
				jQuery("#mail_setting_modal_popup div.content").off();
			},
			buttons : [
			           {btype : 'confirm',btext : mailMsg.comn_confirm, autoclose:false, callback:modifyVcardInfo},
			           {btype : 'cancel',btext : mailMsg.comn_cancel}
			]
		});	
		popupEl.reoffset();
		jQuery("#mail_setting_modal_popup").css("margin-left" ,'-350px'); 	
	};
		
	// [자동 전달 > 예외 자동 전달 규칙 > 추가]
	this.forwardExcept = function(data) {		
		jQuery.goPopup({
			id: 'mail_forward_except_modal_popup',
			width: 700,
			pclass: 'layer_normal layer_except',
			header: mailMsg.conf_forward_38,
			contents: getHandlebarsTemplate("mail_forward_except_modal_tmpl",data),
			openCallback : function() {				
				jQuery("#defineForwardingSeq").attr("value",data.forward_list_num);
				jQuery("#mail_forward_except_modal_popup div.content").on("click","input, span, a", function(e) {					
					var type = jQuery(this).attr("evt-rol");				
					if (type == "forward-except-add") {								
						addExceptForwardList();						
					} else if (type == "forward-except-delete") {						
						deleteSelectList();
					} else if (type == "forward-except-all-delete") {
						deleteAllList();
					}
				});
			},
			closeCallback : function(){
				jQuery("#mail_forward_except_modal_popup div.content").off();
			},
			buttons : [
			           {btype : 'confirm',btext : mailMsg.comn_confirm, autoclose:false, callback:saveDefineForwardInfo},
			           {btype : 'cancel',btext : mailMsg.comn_cancel}
			]
		});		
	};
	
	// [자동 전달 > 수정]
	this.forwardModifyExcept = function(data) {		
		jQuery.goPopup({
			id: 'mail_forward_except_modify_modal_popup',
			width: 700,
			pclass: 'layer_normal layer_except',
			header: mailMsg.conf_forward_39,
			contents: getHandlebarsTemplate("mail_forward_except_modal_tmpl", data),
			openCallback : function() {				
				jQuery("#mail_forward_except_modify_modal_popup div.content").on("click","input, span, a", function(e) {					
					var type = jQuery(this).attr("evt-rol");				
					if (type == "forward-except-add") {						
						var email = jQuery("#defineForwardingAddressText").val();						
						addExceptForwardList(email);						
						//addExtForwardMailList();
					} else if (type == "forward-except-delete") {						
						deleteSelectList();
					} else if (type == "forward-except-all-delete") {
						deleteAllList();
					}
				});
			},
			closeCallback : function(){
				jQuery("#mail_forward_except_modify_modal_popup div.content").off();
			},
			buttons : [
			           {btype : 'confirm',btext : mailMsg.comn_confirm,autoclose:false, callback:saveDefineForwardInfo},
			           {btype : 'cancel',btext : mailMsg.comn_cancel}
			]
		});		
	};
	
	// [자동 분류 > 추가] 
	this.loadFilterManager = function() {
		var data = {};
		_this.filterManager(data);
	};
	
	this.filterManager = function(data) {				
		var folderList = folderControl.getUserFolderList();
		var tagList = folderControl.getTagData();
		data.folderList = folderList;
		data.tagList = tagList;
		
		jQuery.goPopup({
			id: 'mail_setting_modal_filter',	
			width : 600,
			pclass: 'layer_normal layer_autoSort',
			header: mailMsg.menu_conf_filter,
			contents: getHandlebarsTemplate("mail_setting_modal_filter_tmpl", data),
			openCallback : function() {
			    jQuery("#mail_setting_modal_filter input[placeholder]").placeholder();				
				jQuery("#mail_setting_modal_filter div.content").on("click", "input, a", function(e) {									
					var type = jQuery(this).attr("evt-rol");
					var filterSaveFolderObj = jQuery("#settingFilterSaveFolder");
					var filterSaveNewFolderObj = jQuery("#settingFilterSaveNewFolder");
					var settingFilterInputBoxNameObj = jQuery("#settingFilterInputBoxName");
					var settingFilterTagListObj = jQuery("#settingFilterTagList");
					var settingFilterNewTagNameObj = jQuery("#settingFilterNewTagName");
					if (type == "move-folder") {
						filterSaveFolderObj.attr("disabled", false);
						filterSaveNewFolderObj.attr("disabled", true);
						settingFilterInputBoxNameObj.attr("disabled", true);
						settingFilterTagListObj.attr("disabled", true);						
						settingFilterNewTagNameObj.attr("disabled", true);
					} else if (type == "move-newFolder") {
						filterSaveFolderObj.attr("disabled", true);
						filterSaveNewFolderObj.attr("disabled", false);
						settingFilterInputBoxNameObj.attr("disabled", false);
						settingFilterTagListObj.attr("disabled", true);
						settingFilterNewTagNameObj.attr("disabled", true);						
					} else if (type == "set-tag") {
						filterSaveFolderObj.attr("disabled", true);
						filterSaveNewFolderObj.attr("disabled", true);
						settingFilterInputBoxNameObj.attr("disabled", true);
						settingFilterTagListObj.attr("disabled", false);
						settingFilterNewTagNameObj.attr("disabled", true);
					} else if (type == "set-new-tag") {						
						filterSaveFolderObj.attr("disabled", true);
						filterSaveNewFolderObj.attr("disabled", true);
						settingFilterInputBoxNameObj.attr("disabled", true);
						settingFilterTagListObj.attr("disabled", true);
						settingFilterNewTagNameObj.attr("disabled", false);						
					}			
				});
				
				bindFilterInputEvent();
				
				jQuery("#mail_setting_modal_filter div.layer_pallete").on("click", "a", function(e) {
					jQuery("#mail_setting_modal_filter div.layer_pallete a").removeClass("active");
					jQuery(this).addClass("active");
				});
				
				if (data.policy) {
					if (!data.tagPolicy) {
						jQuery("#settingFilterTagList").attr("disabled", true);
						jQuery("#settingFilterSaveFolder").val(data.policy.replace("move ", ""));
						jQuery("#settingFilterFolderSave").attr("checked", "checked");
					} else if (data.tagPolicy) {
						jQuery("#settingFilterSaveFolder").attr("disabled", true);
						jQuery("#settingFilterTagList").attr("disabled", false).val(data.policy.replace("tag ", ""));
						jQuery("#settingFilterSetTag").attr("checked", "checked");
					}					
				}
				
				if (data.subcondList && data.subcondList.length > 1) {
					jQuery("#settingFilterCondOperationWrap").show();
				}
			},
			closeCallback : function(){
				unbindFilterInputEvent();
				jQuery("#mail_setting_modal_filter div.layer_pallete").off();
			},
			buttons : [
			           {btype:'confirm', btext:mailMsg.comn_confirm, autoclose:false, callback:saveFilter},
			           {btype:'cancel', btext:mailMsg.comn_cancel}
			]
		});	
		var filterMarginTop = jQuery("#mail_setting_modal_filter").css("margin-top");
		filterMarginTop =  Number(filterMarginTop.substring(0,filterMarginTop.indexOf("px")));
		jQuery("#mail_setting_modal_filter").css("margin-top",(filterMarginTop+55)+"px");
	};
	
	/**
	 * [자동 분류 > 자동분류 규칙 수정]
	 */
	this.modifyFilterManager = function(param) {
		ActionLoader.getGoLoadAction(this.selectFilterAction, param, _this.filterManager, "json");
	};
	
	this.saveAutoFilter = function(param) {
		ActionLoader.postGoJsonLoadAction(_this.filterAction, param, function(data) {
			jQuery.goPopup.close();
			jQuery.goMessage(mailMsg.save_ok);
			_this.loadViewFilter();
			folderControl.getFolderInfo();
			folderControl.getTagList();
		},"json", function(data) {
			if (data.name == "DuplicatedException") {
				jQuery.goMessage(mailMsg.conf_filter_exist);				
			} else {
				jQuery.goMessage(mailMsg.save_fail);
			}
		});	
	};
	
	// [외부메일 설정 > 추가 > 저장]
	this.saveExtMailSetting = function(param) {
		ActionLoader.postGoJsonLoadAction(this.extMailAction, param, function(data) {
			jQuery.goPopup.close();
			jQuery.goSlideMessage(mailMsg.save_ok);
			_this.loadViewExtMail(); 
			folderControl.getFolderInfo();
		}, "json");		
	};
	
	// [외부메일설정 > 외부메일 목록 > 추가] 
	this.popupExtMailManager = function() {
		var data = {pop3Port:""};
		_this.extMailManager(data);
	};
	
	// [외부메일설정 > 추가 > 저장]
	this.extMailManager = function(data) {
		data.folderList = folderControl.getUserFolderList();
	    data.locale=installLocale;
	    
		jQuery.goPopup({
			id: 'mail_ext_setting_modal',	
			width : 650,
			pclass: 'layer_normal layer_outMail',
			header: mailMsg.conf_pop_9,
			contents: getHandlebarsTemplate("mail_ext_setting_modal_tmpl", data),
			openCallback : function() {
				if (data.pop3Boxname) {
					jQuery("#saveFolder").val(data.pop3Boxname.replace("move ", ""));
				}
				if(installLocale=="jp"){
				    jQuery("#pop3Id").attr("disabled", false);
                            jQuery("#pop3Port").attr("disabled", false);                            
                            jQuery("#pop3Host").attr("disabled", false);
                            jQuery("#sslCheck").attr("disabled", false);
                            jQuery("#pop3Pw").attr("disabled", false);
                            jQuery("pop3Del1").attr("disabled", false);
                            jQuery("pop3Del2").attr("disabled", false);
                            setPOP3Server();    
				}
				jQuery("#mail_ext_setting_modal div.content").on("change", "select, input", function(e) {
					var type = jQuery(this).attr("evt-rol");			
					if (!type) return;
					if (type == "pop3-server-select") {
						var name = jQuery("#pop3List option:selected").val();						
						if (name != "none") {							
							jQuery("#pop3Id").attr("disabled", false);
							jQuery("#pop3Port").attr("disabled", false);							
							jQuery("#pop3Host").attr("disabled", false);
							jQuery("#sslCheck").attr("disabled", false);
							jQuery("#pop3Pw").attr("disabled", false);
							jQuery("pop3Del1").attr("disabled", false);
							jQuery("pop3Del2").attr("disabled", false);
							setPOP3Server();							
						} else {							
							jQuery("#pop3Id").attr("disabled", true);
							jQuery("#pop3Id").val("");
							
							jQuery("#pop3Port").attr("disabled", true);
							jQuery("#pop3Port").val("");
							
							jQuery("#pop3Host").attr("disabled", true);
							jQuery("#pop3Host").val("");
							
							jQuery("#sslCheck").attr("disabled", true);														
							jQuery("#sslCheck").attr("checked", false);
							
							jQuery("#pop3Pw").attr("disabled", true);
							jQuery("#pop3Pw").val("");
						}						
						
					} else if(type == "ssl-check"){
						changeSslSelect();
					}
				});	
				
				jQuery("#mail_ext_setting_modal div.content").on("click", "input", function(e) {					
					var type = jQuery(this).attr("evt-rol");			
					if (!type) return;
					if (type == "create-new-folder") {
						checkBox();						
					}					
				});								
			},
			
			closeCallback : function(){
				jQuery("#mail_filter_modal_popup div.content").off();
			},
			buttons : [
			           {btype : 'confirm',btext : mailMsg.comn_confirm,autoclose:false, callback:saveExtMailManager},
			           {btype : 'cancel',btext : mailMsg.comn_cancel}
			]
		});	
	};
	/**
	 * [외부메일설정 > 수정]
	 */	
	this.modifyExtMailManager = function(param) {
		ActionLoader.getGoLoadAction(this.extMailAction, param, _this.extMailManager, "json");
	};
};

function selectSettingMenu(type) {
	checkEscapeWriteMode(function() {
		changeMailContainer("setting");
		currentMenu = "setting";
		currentMenuType = type;
		selectCurrentFolderName("");
		var data = {"type":"setting","name":mailMsg.location_conf};
		makeMailHeaderMessege(data);
		switch (type) {
			case "basic":
				mailSettingControl.loadBasicSetting();
				break;
			case "sign":
				mailSettingControl.loadViewSign();
				break;
			case "folder":
				mailSettingControl.loadViewFolderManage();
				break;
			case "spam":
				mailSettingControl.loadViewSapmRule();
				break;
			case "filter":
				mailSettingControl.loadViewFilter();
				break;
			case "forward":
				mailSettingControl.loadViewForward();
				break;
			case "autoreply":
				mailSettingControl.loadViewAutoReply();
				break;
			case "extmail":
				mailSettingControl.loadViewExtMail();
				break;
			case "lastrcpt":
				mailSettingControl.loadViewLastRcpt();
				break;
		};
	});
	
}

function toggleAddressLayer(viewLayerType){	
    if (jQuery("#detail"+viewLayerType+"AddressLayerWrap").css("display") == "none") {
        makeAddressLayer(viewLayerType);
    } else {
        closeAddressLayer(viewLayerType);
    }
}

function makeAddressLayer(viewLayerType){
    jQuery("#detail"+viewLayerType+"AddressLayerWrap").show();
    jQuery("#detail"+viewLayerType+"AddressLayerWrap").handlebars("addr_address_layer_view_tmpl",{"type":viewLayerType});
    jQuery("#detail"+viewLayerType+"AddressLayerWrap").on("click", "a,span", function(e) {
      e.preventDefault();
        var type = jQuery(this).attr("evt-rol");
        if (type=="closeDetailAddress") {
            closeAddressLayer(viewLayerType);
        } else if (type=="inputDetailAddress") {        	
            if (!setAddressData(viewLayerType)) {
                return;   
            }  
            closeAddressLayer(viewLayerType);
        }           
    });
}

function closeAddressLayer(viewLayerType){
    jQuery("#detail"+viewLayerType+"AddressLayerWrap").hide();
    jQuery("#detail"+viewLayerType+"AddressLayerWrap").off();
}

function addExtForwardInfo() {
	saveForwardInfo();
}

function saveDefineForwardInfo() {
	saveDefineForwardInfo();
}

function filterTagToolbar() {
	var tagList = mailSettingControl.getTagData();
	mailSettingControl.makeToolbarTagList(tagList);
}

function initSettingFunction() {
	initSettingMenuDispaly();
    
	mailSettingControl = new MailSettingControl();
	initSettingService();
}
function initSettingMenuDispaly(){
	if(!useGroupForwarding){
        jQuery("#auto-forward-menu").hide();
    }
	if(!useExternal){
		 jQuery("#auto-extMail-setting").hide();
		 jQuery("#extmail-download-menu").hide();
	}
	if(!useAutoreply){
		 jQuery("#auto-reply-menu").hide();
	}
}
function initSettingService() {
	mailSettingControl.makeMailEvent();
}

function setSchedulerTab(index) {
	jQuery('.tab_menu_wrap li').removeClass();
	jQuery('.tab_menu_wrap li:eq('+index+')').addClass('active');	
}

function defaultUserSetting() {			
	jQuery("#hiddenimg").attr("checked", true);
	jQuery("#hiddentag").attr("checked", true);
	jQuery("#searchallfolder").attr("checked", false);
	
	jQuery("#saveSendBox").attr("checked", true);
	jQuery("#notSaveSendBox").attr("checked", false);
	
	jQuery("#receiveNoti").attr("checked", true);
	jQuery("#notUseReceiveNoti").attr("checked", false);
	
	jQuery("#wmodeSelect").val("HTML");
	jQuery("#composeModeSelect").val("normal");
	jQuery("#encodingSelect").val("UTF-8");	
	
	jQuery("#writeNoti").attr("checked", false);
	jQuery("#notUseWriteNoti").attr("checked", true);
	
	var senderName = jQuery("#senderName").val();	
	jQuery("#senderNameInfo").val(senderName);
	
	var senderName = jQuery("#senderEmail").val();	
	jQuery("#senderEmailInfo").val(senderName);
	
	jQuery("#vcardAttach").attr("checked", true);
	jQuery("#mailBadgeUse").attr("checked", false);
	jQuery("#listViewCc").attr("checked", false);
    if(jQuery('#replyToSameMail').is(':visible')){
        jQuery("#replyToSameMail").attr("checked", true);
        jQuery("#senderEmailInfo").attr("disabled", true);
    }
	jQuery("#defaultEmail").remove();
	jQuery("#myEmailDefault").closest("tr").find(".senderItem").after('<span id="defaultEmail">('+mailMsg.conf_userinfo_sender_email_default+')</span>');
}

function modifyUserInfo() {
	var param = getUserInfo();	
	mailSettingControl.saveBasciPopupInfo(param);
}

function modifyVcardInfo() {
	var param = getUserInfo();
	if (!isValidAddressInfo(param)){
		return;
	};	
	mailSettingControl.savePopupVcardInfo(param);
}

function modifyUserAddrInfo() {
	var param = getUserAddrInfo();
	mailSettingControl.saveBasciPopupInfo(param);
}

function setAddressData(type) {	
	var country = jQuery("#" + type + "Country").val();		
	var state = jQuery("#" + type + "State").val();
	var city = jQuery("#" + type + "City").val();
	var post = jQuery("#" + type + "PostalCode").val();
	var extAddress = jQuery("#" + type + "Street").val();
	
	if (!checkInputLength("jQuery", jQuery("#" + type + "Country"), "", 0, 128, true)) {
		jQuery("#" + type + "Country").focus();
        return false;
    }
	
    if (!checkInputValidate("jQuery", jQuery("#" + type + "Country"), "onlyBack")) {
    	jQuery("#" + type + "Country").focus();
        return false;
    }
    
    if (!checkInputLength("jQuery", jQuery("#" + type + "State"), "", 0, 128, true)) {
		jQuery("#" + type + "State").focus();
        return false;
    }
	
    if (!checkInputValidate("jQuery", jQuery("#" + type + "State"), "onlyBack")) {
    	jQuery("#" + type + "State").focus();
        return false;
    }
    
    if (!checkInputLength("jQuery", jQuery("#" + type + "City"), "", 0, 128, true)) {
		jQuery("#" + type + "City").focus();
        return false;
    }
	
    if (!checkInputValidate("jQuery", jQuery("#" + type + "City"), "onlyBack")) {
    	jQuery("#" + type + "City").focus();
        return false;
    }
		
    if (!checkInputLength("jQuery", jQuery("#" + type + "Street"), "", 0, 128, true)) {
		jQuery("#" + type + "Street").focus();
        return false;
    }
	
    if (!checkInputValidate("jQuery", jQuery("#" + type + "Street"), "onlyBack")) {
    	jQuery("#" + type + "Street").focus();
        return false;
    }
    
    if (jQuery("#" + type + "PostalCode").val() != "") {
        /*if (!checkInputLength("jQuery", jQuery("#" + type + "PostalCode"), "", 0, 6,true)) {        
        	jQuery("#officePostalCode").focus();
            return false;
        }*/
        
        if (!checkInputValidate("jQuery", jQuery("#" + type + "PostalCode"), "number")) {
            return false;
        }
    }
    
    var address="";
    if (country) {    	
    	jQuery("#" + type + "Country").val(country);
        address += country+" ";
    }
    
    if (state) {
    	jQuery("#" + type + "State").val(state);
        address += state+" ";
    }
    
    if (city) {
    	jQuery("#" + type + "City").val(city);
        address += city+" ";
    }
    
    if (post) {
    	jQuery("#" + type + "PostalCode").val(post);
        address += post+" ";
    }
    
    if (extAddress) {
    	jQuery("#" + type + "Street").val(extAddress);
        address += extAddress;
    }
     
    if (type == 'office') {
    	jQuery("#officeBasicAddress").val(address);    	
    } else if (type == 'home') {    	
    	jQuery("#homeAddress").val(address);
    } 
    
    jQuery("#" + type + "AddressTemp").val(address);    	
    return true;
}

function getUserInfo() {
	var param = {};

	var firstName = jQuery('#firstName').val();
	var lastName = jQuery('#lastName').val();	
	var memberName = jQuery('#memberName').val();
	
	var memberEmail = jQuery('#memberEmail').val();
	var titleName = jQuery('#titleName').val();
	var companyName = jQuery('#companyName').val();
	var departmentName = jQuery('#departmentName').val();
	var memberEmail = jQuery('#memberEmail').val();
	var mobileNo = jQuery('#mobileNo').val();
	var officeTel = jQuery('#officeTel').val();
	//var officeBasicAddress = jQuery('#officeBasicAddress').val();
	var description = jQuery('#description').val();
	
	var homeCountry = jQuery('#homeCountry').val();
	var homePostalCode = jQuery('#homePostalCode').val();
	var homeState = jQuery('#homeState').val();
	var homeCity = jQuery('#homeCity').val();
	var homeStreet = jQuery('#homeStreet').val();
	
	var officeCountry = jQuery('#officeCountry').val();
	var officePostalCode = jQuery('#officePostalCode').val();
	var officeState = jQuery('#officeState').val();
	var officeCity = jQuery('#officeCity').val();
	var officeStreet = jQuery('#officeStreet').val();
	
	var homeTel = jQuery('#homeTel').val();	
	var officeHomepage = jQuery('#officeHomepage').val();
	var messenger = jQuery('#messenger').val();
	var photoPath = jQuery("#thumbnail_image").attr("img-data");
	
	if (firstName)
		param.firstName = firstName;
	
	if (lastName)
		param.lastName = lastName;
	
	if (memberName) 
		param.memberName = memberName;
	
	if (memberEmail)
		param.memberEmail = memberEmail;
	
	if (titleName)
		param.titleName = titleName;
	
	if (companyName)
		param.companyName = companyName;
	
	if (departmentName)
		param.departmentName = departmentName;
	
	if (memberEmail)
		param.memberEmail = memberEmail;
	
	if (mobileNo)
		param.mobileNo = mobileNo;
	
	if (officeTel)
		param.officeTel = officeTel;
	
	if (homeTel)
		param.homeTel = homeTel;
	
	if(messenger)
		param.messenger = messenger;
	
	if (officeHomepage)
		param.officeHomepage = officeHomepage;
	
	
	var homeAddressTemp = jQuery("#homeAddressTemp").val();
    var homeAddress = jQuery("#homeAddress").val();
    if (homeAddressTemp == "") {
       if (homeAddress)
    	   param.homeExtAddress = homeAddress;
       
       param.homeCountry = "";
       param.homePostalCode = "";
       param.homeCity = ""; 
       param.homeState = "";
    }
    
    if (homeAddressTemp == homeAddress) {
        if (homeCountry)
        	param.homeCountry = homeCountry;
        
        if (homePostalCode)
        	param.homePostalCode = homePostalCode;
        
        if (homeState)
        	param.homeState = homeState;
        
        if (homeCity)
        	param.homeCity = homeCity;
    }
    
    var officeAddressTemp = jQuery("#officeAddressTemp").val();
	var officeAddress = jQuery("#officeBasicAddress").val();
	if (officeAddressTemp == "") {
	   if (officeAddress)
		   param.officeExtAddress = officeAddress;
	}
	
	if (officeAddressTemp != "" && officeAddressTemp!=officeAddress) {
		   if (officeAddress)
			   param.officeExtAddress = officeAddress;
		}
	
	if (officeAddressTemp==officeAddress) {
	   if (officeCountry)
		   param.officeCountry = officeCountry;
	   
       if (officePostalCode)
    	   param.officePostalCode = officePostalCode;
       
       if (officeState)
    	   param.officeState = officeState;
       
       if (officeCity)
    	   param.officeCity = officeCity;
       	
       if (officeStreet)
    	   param.officeStreet = officeStreet;              
  	}
	
	//if (officeBasicAddress)
	//	param.officeBasicAddress = officeBasicAddress;
	
	if (description)
		param.description = description;
		
	if (photoPath)
		param.photoPath = photoPath;
	
	return param;
}

function isValidAddressInfo(){
	
	if (!validateInput(jQuery("#lastName"), 1, 128, "userName")) {
		return false;
	}
	
	if (!validateInput(jQuery("#firstName"), 1, 128, "userName")) {
		return false;
	}
	
	if (!validateInput(jQuery("#memberName"), 2, 512, "userName")) {
        return false;
	}
	
	if (!checkInputLength("jQuery", jQuery("#memberName"), "", 0, 128)) {
		jQuery("#memberName").focus();
		return false;
	}
	
	if (!validateInput(jQuery("#titleName"), 2, 256, "userName")) {
        return false;
	}
	
	if (!checkInputLength("jQuery", jQuery("#titleName"), "", 0, 128)) {
		jQuery("#titleName").focus();
		return false;
	}
	
	if (!validateInput(jQuery("#companyName"), 2, 256, "userName")) {
        return false;
	}
	
	if (!checkInputLength("jQuery", jQuery("#companyName"), "", 0, 128)) {
		jQuery("#companyName").focus();
		return false;
	}
	
	if (!validateInput(jQuery("#departmentName"), 2, 256, "userName")) {
        return false;
	}
	
	if (!checkInputLength("jQuery", jQuery("#departmentName"), "", 0, 128)) {
		jQuery("#departmentName").focus();
		return false;
	}

	if (!checkInputLength("jQuery", jQuery("#memberEmail"), "", 0, 256, true)) {
        jQuery("#memberEmail").focus();
        return false;
    }
	
	if (jQuery("#memberEmail").val() != "") {
    	if(!isEmail(jQuery("#memberEmail").val())){
    		jQuery.goAlert(mailMsg.error_email);
    		jQuery("#memberEmail").focus();
    		return false;
    	}
	}
	
	if (!checkInputLength("jQuery", jQuery("#mobileNo"), "", 0, 32)) {
		jQuery("#mobileNo").focus();
		return false;
	}
	
	if (!checkInputValidate("jQuery", jQuery("#mobileNo"), "onlyBack")) {
		jQuery("#mobileNo").focus();
		return false;
	}
	
	if (!checkInputLength("jQuery", jQuery("#officeTel"), "", 0, 32)) {
		jQuery("#officeTel").focus();
		return false;
	}
	
	if (!checkInputValidate("jQuery", jQuery("#officeTel"), "onlyBack")) {
		jQuery("#officeTel").focus();
		return false;
	}
	
	if (!validateInput(jQuery("#officeAddress"), 0, 1024, "onlyBack")) {
        return false;
    }
	
	if (!checkInputLength("jQuery", jQuery("#homeTel"), "", 0, 64)) {
		jQuery("#homeTel").focus();
		return false;
	}
	
	if (!checkInputValidate("jQuery", jQuery("#homeTel"), "onlyBack")) {
		jQuery("#homeTel").focus();
		return false;
	}
	
	if (!validateInputValue(jQuery("#officeHomepage"), 0, 512, "onlyBack")) {
        return false;
    }
	
	if(!checkInputLength("jQuery", jQuery("#homeCountry"), "", 0, 64)) {
		jQuery("#homeCountry").focus();
		return false;
	}
	if(!checkInputValidate("jQuery", jQuery("#homeCountry"), "onlyBack")) {
		jQuery("#homeCountry").focus();
		return false;
	}

	if(!checkInputLength("jQuery", jQuery("#homeState"), "", 0, 64)) {
		jQuery("#homeState").focus();
		return false;
	}
	if(!checkInputValidate("jQuery", jQuery("#homeState"), "onlyBack")) {
		jQuery("#homeState").focus();
		return false;
	}
	
	if(!checkInputLength("jQuery", jQuery("#homeCity"), "", 0, 64)) {
		jQuery("#homeCity").focus();
		return false;
	}
	if(!checkInputValidate("", jQuery("#homeCity"), "onlyBack")) {
		jQuery("#homeCity").focus();
		return false;
	}
	
	if(!checkInputLength("jQuery", jQuery("#homeStreet"), "", 0, 64)) {
		jQuery("#homeStreet").focus();
		return false;
	}
	if(!checkInputValidate("jQuery", jQuery("#homeStreet"), "onlyBack")) {
		jQuery("#homeStreet").focus();
		return false;
	}
	
	if (!validateInput(jQuery("#homeAddress"), 0, 1024, "onlyBack")) {
        return false;
    }

	if (!checkInputLength("jQuery", jQuery("#homePostalCode"), "", 0, 64)) {
		jQuery("#homePostalCode").focus();
		return false;
	}
	
	if(!checkInputValidate("jQuery", jQuery("#homePostalCode"), "onlyBack")) {
		jQuery("#homePostalCode").focus();
		return false;
	}
	
	if(!checkInputLength("jQuery", jQuery("#officeCountry"), "", 0, 64)) {
		jQuery("#officeCountry").focus();
		return false;
	}
	if(!checkInputValidate("jQuery", jQuery("#officeCountry"), "onlyBack")) {
		jQuery("#officeCountry").focus();
		return false;
	}
	
	if(!checkInputLength("jQuery", jQuery("#officeState"), "", 0, 64)) {
		jQuery("#officeState").focus();
		return false;
	}
	if(!checkInputValidate("jQuery", jQuery("#officeState"), "onlyBack")) {
		jQuery("#officeState").focus();
		return false;
	}

	if(!checkInputLength("jQuery", jQuery("#officeCity"), "", 0, 64)) {
		jQuery("#officeCity").focus();
		return false;
	}
	if(!checkInputValidate("jQuery", jQuery("#officeCity"), "onlyBack")) {
		jQuery("#officeCity").focus();
		return false;
	}
	
	if(!checkInputLength("jQuery", jQuery("#officeStreet"), "", 0, 64)) {
		jQuery("#officeStreet").focus();
		return false;
	}
	if(!checkInputValidate("jQuery", jQuery("#officeStreet"), "onlyBack")) {
		jQuery("#officeStreet").focus();
		return false;
	}
	
	if (!validateInput(jQuery("#officAddress"), 0, 1024, "onlyBack")) {
        return false;
    }
	
	if (!checkInputLength("jQuery", jQuery("#officPostalCode"), "", 0, 64)) {
		jQuery("#homePostalCode").focus();
		return false;
	}
	
	if(!checkInputValidate("jQuery", jQuery("#officPostalCode"), "onlyBack")) {
		jQuery("#homePostalCode").focus();
		return false;
	}
	return true;
}



var viewTime = null;

function menuLayerOut(id) {
	// menuLayerClose(id);
	viewTime = setTimeout("menuLayerClose('"+id+"')",300);
}

function menuLayerClose(id) {
	if ( viweStatus != 'out' ) {
		return;
	}
	document.getElementById(id).style.display='none';
}

function menuLayerOpen(id) {	
	if ( viweStatus == 'out' || viweStatus != id ) {
		return;
	}
	
	if ( viweStatus == 'ly_etc_dn1') {
		
		if(isMsie){
			var height = findPosY(document.getElementById("etc_dn_sp"));
			document.getElementById(id).style.pixelTop = height+20;
		}
		else {
			var height = findPosY(document.getElementById("etc_dn_sp"));
			document.getElementById(id).style.top = height+13+"px";
		}
	}

	//clearTimeout(viewTime);
	document.getElementById(id).style.display='inline';
}

function selPFolder(fName, rName, b, target) {			
	if (rName.indexOf(".") != -1) {
		fName = rName.replace(/\./g, "/");
	}

	if (target == 'new') {
		jQuery('#parentFolder_new').text(fName);
		jQuery('#parentFolder').val(rName);
	
		if (b) {
			viweStatus='out'; menuLayerOut('newPfBox');
			jQuery('#newPfBox').hide();
		}
	}
	else {
		jQuery('#parentFolder_default').text(fName);
		if (rName != '') {
			jQuery('#policy').val("move "+rName);
		}
		else {
			jQuery('#policy').val('');
		}

		if (b) {
			viweStatus='out'; menuLayerOut('pfBox');
			jQuery('#pfBox').hide();
		}
	}
}

function getUserAddrInfo() {
	var param = {};

	var officeCountry = jQuery('#officeCountry').val();
	var officePostalCode = jQuery('#officePostalCode').val();
	var officeState = jQuery('#officeState').val();
	var officeCity = jQuery('#officeCity').val();
	var officeStreet = jQuery('#officeStreet').val();
		
	if (officeCountry)
		param.officeCountry = officeCountry;
	
	if (officePostalCode)
		param.officePostalCode = officePostalCode;
	
	if (officeState)
		param.officeState = officeState;
	
	if (officeCity)
		param.officeCity = officeCity;
	
	if (officeStreet)
		param.officeStreet = officeStreet;
	
	return param;
}

function closeViewSignLayer() {
	jQuery("#viewSignWrap").hide();
	jQuery("#viewSignWrap").off();
}

function saveBasicInfo() {
	var param = getUserBasicInfoData();
	if (param) {
		mailSettingControl.saveBasicInfo(param);
	}
}

function getUserBasicInfoData() {
	var ON = "on";
	var OFF = "off";

	var senderEmail = jQuery("#senderEmailInfo");
	var senderEmailValue = senderEmail.val();
	var senderNameInfo = jQuery("#senderNameInfo");

	if (!checkInputLength("jQuery", senderNameInfo, mailMsg.conf_userinfo_msg_01, 0, 128)) {
		return;
	}

	if (!checkInputValidate("jQuery", senderNameInfo, "userName")) {
		return;
	}

	if (trim(senderEmailValue) != "") {
		if (!isEmail(senderEmailValue)) {
			jQuery.goAlert(mailMsg.common_2);
			senderEmail.focus();
			return;
		}
	}


	var saveSent = jQuery("input[name='saveSendBoxFalg']:checked").val();
	var receiveNoti = jQuery("input[name='receiveNotiFalg']:checked").val();
	var wmode = jQuery("#wmodeSelect").val();

	if (wmode == 'text' && receiveNoti == ON && notiMode == 'link') {
		jQuery.goAlert(mailMsg.conf_alert_userinfo_receivenoti_wmode);
		return;
	}

	if (saveSent == OFF && receiveNoti == ON && wmode == "html") {
		if (confirm(mailMsg.conf_alert_userinfo_receivenoti)) {
			jQuery("#receiveNoti").attr("checked", "checked");
			jQuery("#saveSendBox").attr("checked", "checked");
		} else {
			return;
		}
	}


	var param = {};

	param.addressVisible = getOnOffIfChecked(jQuery("input[name='addressVisible']:checked").val() == ON);
	param.hiddenImg = getOnOffIfChecked(jQuery("#hiddenimg").is(":checked"));
	param.hiddenTag = getOnOffIfChecked(jQuery("#hiddentag").is(":checked"));
	param.searchAllFolder = getOnOffIfChecked(jQuery("#searchallfolder").is(":checked"));
	param.saveSendBox = getOnOffIfChecked(jQuery("input[name='saveSendBoxFalg']:checked").val() == ON);
	param.receiveNoti = getOnOffIfChecked(jQuery("input[name='receiveNotiFalg']:checked").val() == ON);
	param.writeNoti = getOnOffIfChecked(jQuery("input[name='writeNotiFalg']:checked").val() == ON);
	param.vcardAttach = getOnOffIfChecked(jQuery("#vcardattach").is(":checked"));
	param.writeMode = jQuery("#wmodeSelect").val();
	param.composeMode = jQuery("#composeModeSelect").val();
	param.charSet = jQuery("#encodingSelect").val();
	param.senderName = senderNameInfo.val();
	param.senderEmail = senderEmailValue;
	param.pageLineCnt = jQuery("#pageLineCntVal").val();
	param.mailBadgeUse = getOnOffIfChecked(jQuery("#mailBadgeUse").is(":checked"));
	param.listViewCc = getOnOffIfChecked(jQuery("#listViewCc").is(":checked"));
	param.nationView = getOnOffIfChecked(jQuery("#nationView").is(":checked"));
	param.useMailSender = jQuery("#mailSenderUse").val() === ON;
	var senderList = [];
	if (!!param.useMailSender) {
		jQuery("#mailSenderListTbody .senderItem").each(function () {
			var myEmail = USERLOGINEMAIL;
			if (jQuery(this).data("email").indexOf(myEmail) <= 0) {
				var sender = {};
				sender.email = jQuery(this).data("email");
				sender.aliasUser = !!jQuery(this).data("alias");
				sender.defaultMail = jQuery(this).closest("tr").find('#defaultEmail').length > 0;
				senderList.push(sender);
			}
		});
	}
	param.senderList = senderList;

	if (jQuery('#replyToSameMail').is(':visible')) {
		param.replyToSameMail = getOnOffIfChecked(jQuery('#replyToSameMail').is(':checked'));
	}

	param.rcptMode = jQuery("input[name='rcptMode']:checked").val();
	param.sendConfirm = jQuery("input[name='sendConfirm']:checked").val();

	return param;
}

function getOnOffIfChecked(value) {
	if (!_.isBoolean(value)){
		return
	}
	return  value ? "on": "off";
}

function init(){
	jQuery("#signApplySelect").selectbox({selectId:"signApply",selectFunc:""},
			"${fn:escapeXml(signVo.signApply)}",
			[{index:signMsg.conf_sign_3,value:"T"},
			 {index:signMsg.conf_sign_4,value:"F"}]);
}

/**
 * 스팸관리 - 스팸 차단 정책에 다른 UI 변경 코드
 */
function checkSpamMode() {
	var ruleMode = jQuery("#spamPolicy").val();
	if (ruleMode == 1) {
		jQuery("#spamLevel").show();        
		jQuery("#blackAndWhiteTr").show();
		jQuery("#spamHandleTr").show();
		jQuery("#blackListTr").show();
	}
	else if (ruleMode == 2) {
		jQuery("#spamLevel").hide();    
		jQuery("#blackAndWhiteTr").show();
		jQuery("#spamHandleTr").show();
		jQuery("#blackListTr").show();		
	}
	else if (ruleMode == 3) {
		jQuery("#spamLevel").hide();        
		jQuery("#blackAndWhiteTr").hide();
		jQuery("#spamHandleTr").hide();
		jQuery("#blackListTr").hide();	
	}
	else if (ruleMode == 4) {
		jQuery("#spamLevel").hide();     
		jQuery("#blackAndWhiteTr").show();
		jQuery("#spamHandleTr").show();
		jQuery("#blackListTr").hide();
	}
}

/**
 * 스팸 관리 - 스팸 차단 정책을 결정
 */
function getSpamPolicy(data) {	
	var applyAllowedlistOnly = data.applyAllowedlistOnly;
	var applyRuleLevel = data.applyRuleLevel;
	var applyBlacklist = data.applyBlacklist;
	var applyWhitelist = data.applyWhitelist;
	
	if (applyAllowedlistOnly == "off" && applyRuleLevel == "on" &&
		applyBlacklist == "on" && applyWhitelist == "on") {		
		return 1;
	}
		
	else if (applyAllowedlistOnly == "off" && applyRuleLevel == "off" &&
		applyBlacklist == "on" && applyWhitelist == "on") {		
		return 2;
	}
		
	else if (applyAllowedlistOnly == "off" && applyRuleLevel == "off" &&
		applyBlacklist == "off" && applyWhitelist == "on") {		
		return 3;
	}
		
	else if (applyAllowedlistOnly == "on" && applyRuleLevel == "off" &&
		applyBlacklist == "off" && applyWhitelist == "on") {		
		return 4;
	}
}

function addWhiteMailList() {	
	jQuery.goPopup({
		id: 'spam_mail_add_popup', 
	    pclass: 'layer_normal layer_add_mailbox',
	    header: mailMsg.conf_spamrule_47,
	    contents: getHandlebarsTemplate("mail_setting_spam_modal_white_tmpl"),
		buttons : [
		           {btype : 'confirm', btext : mailMsg.comn_confirm, autoclose:false, callback : addWhiteRuleList},
		           {btype : 'cancel', btext : mailMsg.comn_cancel}
		]	    
	});	
};

function addBlackMailList() {	
	jQuery.goPopup({
		id: 'spam_mail_add_popup', 
	    pclass: 'layer_normal layer_add_mailbox',
	    header: mailMsg.conf_spamrule_47,
	    contents: getHandlebarsTemplate("mail_setting_spam_modal_black_tmpl"),
		buttons : [
		           {btype : 'confirm', btext : mailMsg.comn_confirm, autoclose:false ,callback : addBlackRuleList},
		           {btype : 'cancel', btext : mailMsg.comn_cancel}
		]	    
	});	
};

function addForwardMailList() {	
	jQuery.goPopup({
		id: 'forward_mail_add_popup', 
	    pclass: 'layer_normal layer_add_mailbox',
	    header: mailMsg.conf_spamrule_47,
	    contents: getHandlebarsTemplate("mail_setting_spam_modal_white_tmpl"),
		buttons : [
		           {btype : 'confirm', btext : mailMsg.comn_confirm,autoclose:false, callback : addForwardList},
		           {btype : 'cancel', btext : mailMsg.comn_cancel}
		]	    
	});	
};

function addWhiteRuleList() {	
	var inputObj, selectObj, compareObj;
	var chk = false;
	var myEmail = USEREMAIL;
	
	inputObj = jQuery("#addWhiteMail").val().toLowerCase();
	selectObj = jQuery('#whiteList td.txt').map(function () {
		return jQuery(this).text();
	}).get();
		
	compareObj = jQuery('#blackList td.txt').map(function () {
		return jQuery(this).text();
	}).get();
		
	if(selectObj && selectObj.length > 0 ){
		for(var i=0; i< selectObj.length ; i++){
			if(selectObj[i] == inputObj){
				jQuery.goAlert(mailMsg.conf_spam_14);
				chk=true;
				return;
			}
		}
	}
	
	if(compareObj && compareObj.length > 0 ){
		for(var i = 0 ; i < compareObj.length ; i++){
			if(inputObj == compareObj[i]){
				jQuery.goAlert(mailMsg.conf_spam_15);
				chk = true;				
				return;						
			}
		}	
	}
	if(incNotAllowSpecialChar(inputObj)){
		jQuery.goAlert(mailMsg.common_form_004);
		return;
	}
	
	if(!chk){		
		if (!checkInputSearchAddr(inputObj, 2, 255, true)) {			
			return;
		}
		addMailList(jQuery("#addWhiteMail"), selectObj, '1000', myEmail, false, "w");
		jQuery("#whiteList_empty").hide();
	}
	
	jQuery.goPopup.close();
}

function addBlackRuleList() {	
	var inputObj, selectObj, compareObj;
	var chk = false;
	var myEmail = USEREMAIL;
			
	inputObj = jQuery("#addBlackMail").val().toLowerCase();
	selectObj = jQuery('#blackList td.txt').map(function () {
		return jQuery(this).text();
	}).get();
	
	compareObj = jQuery('#whiteList td.txt').map(function () {
		return jQuery(this).text();
	}).get();
	
	if(selectObj && selectObj.length > 0 ){
		for(var i=0; i< selectObj.length ; i++){
			if(selectObj[i] == inputObj){
				jQuery.goAlert(mailMsg.conf_spam_15);
				chk=true;
				return;
			}
		}
	}
	
	if(compareObj && compareObj.length > 0 ){
		for(var i = 0 ; i < compareObj.length ; i++){
			if(inputObj == compareObj[i]){
				jQuery.goAlert(mailMsg.conf_spam_14);
				chk = true;				
				return;
			}
		}	
	}
	
	if(incNotAllowSpecialChar(inputObj)){
		jQuery.goAlert(mailMsg.common_form_004);
		return;
	}
	
	if (!chk) {
		if (!checkInputSearchAddr(inputObj, 2, 255, true)) {			
			return;
		}
		addMailList(jQuery("#addBlackMail"), selectObj, '1000', myEmail, false, "b");
		jQuery("#blackList_empty").hide();
	}
	
	jQuery.goPopup.close();
}

function addForwardList() {	
	var inputObj, selectObj;
	jQuery("#forwardMailList_empty_area").hide();
	
	var myEmail = USEREMAIL;
	inputObj = jQuery("#addWhiteMail").val().toLowerCase();
	
	selectObj = jQuery('#forwardMailList td.forwardMailList').map(function () {
		return jQuery(this).text();
		}).get();
	
	if(selectObj && selectObj.length > 0 ){
		for(var i = 0 ; i < selectObj.length ; i++){
			if(inputObj == selectObj[i]){
				jQuery.goMessage(mailMsg.common_form_005);
				return;
			}
		}	
	}
	if(maxForwaringCount<=selectObj.length){
	    jQuery.goMessage(msgArgsReplace(mailMsg.conf_forward_15,[maxForwaringCount]));
	    return;
	}
	addMailList(jQuery("#addWhiteMail"), selectObj, '1000', myEmail, false, "f");
	jQuery.goPopup.close();
}

/**
 * [스팸관리 > 수신허용 목록 > 삭제]
 */
function deleteMailList(type) {
	var count = 0;
	
	if (type == "w") {
		var chk_whiteList_area = jQuery("#whiteList_txt").length;
		if(chk_whiteList_area == 0){
			jQuery("#whiteList_empty").show();
		}
		
	} else if (type == "b") {
		var chk_blackList_area = jQuery("#blackList_txt").length;
		if(chk_blackList_area == 0){
			jQuery("#blackList_empty").show();
		}		
	}	
}

/**
 * [스팸관리 > 수신허용 목록 > 전체삭제]
 */
function deleteAllMailList(type) {
	var count = 0;
	if (type == "w") {
		jQuery("#whiteList #whiteList_txt").each(function() {
			jQuery(this).remove();					
		});
		jQuery("#whiteList_empty").show();
	} else if (type == "b") {
		jQuery("#blackList #blackList_txt").each(function() {
			jQuery(this).remove();					
		});
		jQuery("#blackList_empty").show();
	}	
	jQuery.goAlert(mailMsg.del_ok);
}

/**
 * [자동분류 > 자동분류 규칙 > 전체 삭제]
 */
function deleteAllFilters() {
	
	var $autoFilterList = jQuery("#autoFilter span[evt-rol='delete-filter']");
	if ($autoFilterList.length == 0) {
		return;
	}
	
	jQuery.goConfirm(mailMsg.alert_remove_all, "", function() {
		var param = {};
		var condSeqs = [];
		$autoFilterList.each(function() {					
			condSeqs.push(jQuery(this).attr("condseq"));
		});	
			
		param.condSeqs = condSeqs;
		mailSettingControl.deleteFilterRule(param);
	});
}

/**
 * [자동전달 > 예외 자동전달 규칙 > 추가 > 추가]
 * 
 */
function addExceptForwardList() {
	var inputObj, selectObj, chk;
	var myEmail = USEREMAIL;	
	chk = false;
	inputObj = jQuery("#defineForwardingAddressText").val().toLowerCase();
	selectObj = jQuery('#defineForwardingList li span').map(function () {
		return jQuery(this).text();
		}).get();
	if(selectObj && selectObj.length > 0){
		for(var i=0; i<selectObj.length; i++){
			if(inputObj == selectObj[i]){
				jQuery.goMessage(mailMsg.conf_forward_2);
				chk=true;
				return;
			}
		}
	}
	if(!chk){
		addMailList(jQuery("#defineForwardingAddressText"), selectObj, '1000', myEmail, false, "e");
		jQuery("#defineForwardingAddressText").attr("value", "");
	}
}

/**
 * [자동전달 > 예외 자동전달 규칙 > 삭제]
 */
function deleteSelectList() {
	var count = 0;	
	
	jQuery("#defineForwardingList li input:checkbox").each(function() {	
		if (jQuery(this).attr("checked")) {
			count++;			
		}		
	});
		
	if (count == 0) {
		jQuery.goMessage(mailMsg.common_form_007);
		return;
	} 
		
	jQuery("#defineForwardingList li input:checkbox").each(function() {	
		if (jQuery(this).attr("checked")) {
			jQuery(this).closest("li").remove();			
		}
	});		
}

/**
 * [자동전달 > 예외 자동전달 규칙 > 전체삭제]
 */
function deleteAllList() {
	var count = 0;	
	
	jQuery("#defineForwardingList li input:checkbox").each(function() {
		count++;				
	});
	
	if (count == 0) {
		jQuery.goAlert(mailMsg.common_form_007);
		return;
	} else if (count > 0) {
		jQuery("#defineForwardingList li input:checkbox").each(function() {
			jQuery(this).attr("checked", true);
							
		});
	}
	
	jQuery("#defineForwardingList li input:checkbox").each(function() {
		jQuery(this).closest("li").remove();					
	});		
}

function saveSpamInfo() {
	var param = getSpamInfo();
	mailSettingControl.saveSpamInfo(param);
}

function getSpamInfo() {
	var param = {};
	
	var spamPolicy = jQuery("#spamPolicy").val();
	if (spamPolicy == "1") {
		param.applyAllowedlistOnly = "off";
		param.applyRuleLevel = "on";
		param.applyBlacklist = "on";
		param.applyWhitelist = "on";
	} else if (spamPolicy == "2") {
		param.applyAllowedlistOnly = "off";
		param.applyRuleLevel = "off";
		param.applyBlacklist = "on";
		param.applyWhitelist = "on";		
	} else if (spamPolicy == "3") {
		param.applyAllowedlistOnly = "off";
		param.applyRuleLevel = "off";
		param.applyBlacklist = "off";
		param.applyWhitelist = "on";
	} else if (spamPolicy == "4") {
		param.applyAllowedlistOnly = "on";
		param.applyRuleLevel = "off";
		param.applyBlacklist = "off";
		param.applyWhitelist = "on";
	}	
	
	var ruleLevel = jQuery("#spamLevel").val();
	if (ruleLevel == "1") {
		param.pspamRuleLevel = "3";
	} else if (ruleLevel == "2") {
		param.pspamRuleLevel = "2";
	} else if (ruleLevel == "3") {
		param.pspamRuleLevel = "1";
	}	
	
	var policy = jQuery("#spamHandle").val();
	if (policy == "move Spam") {
		param.pspamPolicy = "move Spam";
	} else if (policy == "move Trash") {
		param.pspamPolicy = "move Trash";
	} else if (policy == "delete") {
		param.pspamPolicy = "delete";
	}
	
	var whiteList = new Array();
	jQuery("#whiteList #whiteList_txt .txt").each(function() {		
		whiteList.push(jQuery(this).text());		
	});
	
	var blackList = new Array();
	jQuery("#blackList #blackList_txt .txt").each(function() {		
		blackList.push(jQuery(this).text());		
	});
	
	param.whiteList = whiteList;
	param.blackList = blackList;
	return param;
}

/**
 * [자동 분류 > 추가 > 저장]
 */
function saveFilter() {
	var param = {};
	var subcondList = [];
	var makeFolder = false;
	var makeFolderName = "";
	var makeTag = false;
	var makeTagName = "";
	var makeTagColor = "";

	var from = jQuery("#setting_filter_sender").val().trim().toLowerCase();
	var to = jQuery("#setting_filter_receiver").val().trim().toLowerCase();
	var subject = jQuery("#setting_filter_subject").val().trim();
	if (from == "" && to == "" && subject == "") {
		jQuery.goMessage(mailMsg.conf_filter_1);
		jQuery("#setting_filter_sender").focus();
		isSuccess = false;
		return;
	}
	
	if (from != "") {
		subcondList.push({"field":"FROM", "pattern":from})
	}
	
	if (to != "") {
		subcondList.push({"field":"TO", "pattern":to})
	}
	
	if (subject != "") {
		if (!validateInputValue(jQuery("#setting_filter_subject"),0,255,"onlyBack")) {
            jQuery("#setting_filter_subject").focus();
            isSuccess = false;
            return;
        }
		subcondList.push({"field":"SUBJECT", "pattern":subject})	
	}
	param.condSeq = jQuery("#filterCondSeq").val();
	param.subcondList = subcondList;
	
	var filterOperation = jQuery("#mail_setting_modal_filter input[name=filterOperation]:checked").val();
    param.operation = filterOperation;
		
	var autoFilterSelect = jQuery("input[name='autoFilterSelect']:checked").val();
	if (autoFilterSelect == "folder") {
		var policy = jQuery("#settingFilterSaveFolder option:selected").val();	
		if (policy == "") {
			jQuery.goMessage(mailMsg.conf_alert_mailbox_select);
			return;
		}
		param.policy = "move " + policy;
	} else if (autoFilterSelect == "newFolder") {    // 새 메일함으로 이동
		var newBoxObj = jQuery("#settingFilterInputBoxName");
		var newBox = jQuery.trim(newBoxObj.val());
		if (newBox == "" || newBoxObj.hasClass("placeholder")) {
			jQuery.goMessage(mailMsg.conf_filter_37);
			newBoxObj.focus();
			return;
		}
		if (!validateInputValue(newBoxObj, 2, 32, "folderName")) {
          return;
        }
		
		var newPolicy = jQuery("#settingFilterSaveNewFolder option:selected").val();
		if (newPolicy == "") {
			makeFolderName = newBox;
		} else {		
			makeFolderName = newPolicy + "." + newBox;													
		}		
		makeFolder = true;
	} else if (autoFilterSelect == "tag") {	
		var tagId = jQuery("#settingFilterTagList option:selected").val();
		if (tagId == "") {
			jQuery.goMessage(mailMsg.mail_tag_select_msg);
			return;
		}
		param.policy = "tag " + tagId;
	} else if (autoFilterSelect == "newTag") {
		var newTagNameObj = jQuery("#settingFilterNewTagName");
		var tagName = jQuery.trim(newTagNameObj.val());
		
		if(tagName == "" || newTagNameObj.hasClass("placeholder")){
			jQuery.goMessage(mailMsg.mail_tag_add_msg);
			newTagNameObj.focus();
			return;			
		}
		
		if (!checkInputLength("jQuery",newTagNameObj,mailMsg.conf_filter_1,2,32)) {
			return;
		}
		
		if (isExistTagName(tagName)) {
            jQuery.goSlideMessage(mailMsg.alert_tag_samename,"caution");
            return;
        }
		
		var tagList = folderControl.getTagData();
        if(tagList && tagList.length >= 300) {
          jQuery.goMessage(mailMsg.mail_tag_insert_limit);
            return;
        }
        makeTag = true;
        makeTagName = tagName;
        
        var tagColor = jQuery("#mail_setting_modal_filter div.layer_pallete a.active").attr("color");		        
    	makeTagColor = tagColor;	
	} else {
		jQuery.goMessage(mailMsg.conf_filter_1);
		return;
	}
	
	if (makeFolder) {
		folderControl.addFolderAfterFunc(makeFolderName, function() {
			param.policy = "move " + makeFolderName;
			mailSettingControl.saveAutoFilter(param);
		});
	} else if (makeTag) {
		var tagParam = {"tagName":makeTagName,"tagColor":makeTagColor};
        folderControl.addTagAfterFunc(tagParam, function() {
            folderControl.getTagListAfterFunc(function(data) {
                folderControl.makeTagList(data);
                var tagId = "";
                for (var i=0; i<data.length; i++) {
                    if (data[i].name == tagName) {
                        tagId = data[i].id;
                        break;
                    }
                }
                param.policy = "tag "+tagId;
                mailSettingControl.saveAutoFilter(param);          
            });
        });
	} else {
		mailSettingControl.saveAutoFilter(param);
	}
}

function saveExtMailManager(type) {
	var param = {};
	var makeFolder = false;
	var makeFolderName = "";
	
	var $pop3Host = jQuery("#pop3Host");
	if (!validateInputValue($pop3Host, 2, 255, "onlyBack")) {
        return;
    }
	
	var pop3Host = $pop3Host.val().trim();
	if (!validateIP(pop3Host) && !isDomain(pop3Host)) {
		jQuery.goMessage(mailMsg.conf_pop_37);
		$pop3Host.select();
		return false;
	}	
	
	var pop3Port = jQuery("#pop3Port").val().trim();
	if(pop3Port == ""){
        jQuery.goMessage(mailMsg.conf_pop_40);
        jQuery("#pop3Port").select();
        return false;
    } else {
		if (!isPort(pop3Port)) {
			jQuery.goMessage(mailMsg.conf_pop_43);
			return false;
		}
	}
	
	var $pop3Id = jQuery("#pop3Id");
	if (!validateInputValue($pop3Id, 2, 255, "onlyBack")) {
        return;
    }
	
	var pop3Id = $pop3Id.val().trim();
	if(pop3Id == ""){
        jQuery.goMessage(mailMsg.conf_pop_2);
        $pop3Id.select();
        return false;
    }

	if((!isLocal(pop3Id)) && (!isEmail(pop3Id))){
		jQuery.goMessage(mailMsg.conf_pop_52);
		$pop3Id.select();
		return false;
	}

	var $pop3Pw = jQuery("#pop3Pw");
	if (!validateInputValue($pop3Pw, 1, 64, "onlyBack")) {
        return;
    }

	if (jQuery("#mbox").attr("checked")) {
		var newbox = trim(jQuery("#inputBoxName").val());
		
		if(!checkInputLength("jQuery", jQuery("#inputBoxName"), mailMsg.conf_filter_37, 2, 32)) {
			return;
		}
		if(!checkInputValidate("jQuery", jQuery("#inputBoxName"), "folderName")) {
			return;
		}
		
		if (trim(jQuery("#saveNewFolder option:selected").val()) == "noChoiceParentFolder") {
			makeFolderName = newbox;
		} else {
			var oldbox = jQuery("#saveNewFolder option:selected").val();			
			oldbox = oldbox.split(' ').join("");
			oldbox = oldbox.replace(/>/gi, ".");			
			makeFolderName = oldbox + "." + newbox;
		}
		makeFolder = true;
    } else {
		var policy = jQuery("#saveFolder option:selected").val();     // Trash
    	if (policy == "noChoiceParentFolder") {
			jQuery.goMessage(mailMsg.conf_alert_mailbox_select);
			return false;
		}
    	    	
    	if (policy.indexOf('>') > 0) {
    		policy = policy.split(' ').join("");
    		policy = policy.replace(/>/gi, ".");			    		
    	} 
		param.policy = "move " + policy;
    }	
	
	param.pop3Host = pop3Host;
	param.pop3Port = pop3Port;	
	param.pop3Id = pop3Id;
	param.pop3Pw = $pop3Pw.val().trim();
	
	param.sslCheck = jQuery("#sslCheck").attr("checked") ? true : false;
	param.pop3Del = jQuery("#pop3Del1").attr("checked") ? true : false;
	
	if (makeFolder) {
		folderControl.addFolderAfterFunc(makeFolderName, function() {
			param.policy = "move " + makeFolderName;
			mailSettingControl.saveExtMailSetting(param);
		});
	} else {
		mailSettingControl.saveExtMailSetting(param);
	}
}

function isEmailCheck(email) {
    if(email.indexOf("@")> -1 && !isEmail(email) && !isMailDomain(email) && !isMailSubDomain(email)){
        return false;
    }
    return true ;
}

/**
 * [자동분류 > 저장]
 */
function saveFilterInfo() {	
	var param = getFilterInfo();
	mailSettingControl.saveFilterInfo(param);
}

/**
 * [자동전달 > 추가 > 저장]
 */
function saveForwardInfo() {
	if (validationCheck()) {
		var chk = false;
		var param = getForwardInfo();	
		var defineValue = jQuery("#defineValue").val().toLowerCase();
		
		jQuery("#defineForwardingList input[dlist=defineList]").each(function(){
			if(defineValue == jQuery.trim(jQuery(this).val())){
				jQuery.goAlert(mailMsg.conf_forward_31);
				chk = true;
			}
		});
		if(!chk){
			mailSettingControl.saveForwardInfo(param);		
			jQuery.goPopup.close();
		}
	} else {
		return;
	}
}

/**
 * [자동전달 > 전체 저장]
 */
function saveAllForwardInfo() {
	getForwardInfo();
	mailSettingControl.saveForwardInfo(param);
}

/**
 * [자동전달 > 예외 자동전달 규칙 > 추가 > 확인]
 */
function saveDefineForwardInfo() {
	if (validationCheck()) {
		var chk = false;
		var param = getDefineForwardInfo();
		var defineValue = jQuery("#defineValue").val().toLowerCase();
		var targetDefineForwardingSeq = param.defineForwardingSeq;

		jQuery("#defineForwardList tr .defineRuleValue").each(function() {
			var tmpDefineForwardingSeq = jQuery(this).parents().attr("data-index");
			if (targetDefineForwardingSeq != tmpDefineForwardingSeq && 
					defineValue == jQuery.trim(jQuery(this).text())) {
				jQuery.goAlert(mailMsg.conf_forward_31);
				chk = true;
			}
		});

		if (!chk) {
			mailSettingControl.saveDefineForwardInfo(param);
			jQuery.goPopup.close();
		}
	} else {
		return;
	}
}

/**
 * [부재중응답 > 저장]
 */
function saveAutoReply() {
	
	var startValue = jQuery("#startTime").val();
	var endValue = jQuery("#endTime").val();
	
	if (jQuery("#reply_apply").attr("checked")){
		//Validation Check
		if(!checkInputLength("jQuery", jQuery("#autoReplySubject"), "", 0, 255)) {
	        return;
		}
		if (jQuery.trim(jQuery("#autoReplyText").val()).length > 2048) {
			jQuery.goAlert(msgArgsReplace(mailMsg.error_inputlength_over,[2048]));
	        return;
	    }
			
		if (trim(startValue) == "") {
			jQuery.goAlert(mailMsg.conf_autoreply_29);
			return;
		}

		if (trim(endValue) == "") {
			jQuery.goAlert(mailMsg.conf_autoreply_30);
			return;
		}
	    
		 var startDate = startValue.split('-');
		 var endDate = endValue.split('-');
		
		 var start = new Date(startDate[0],startDate[1]-1, startDate[2]);
		 var end = new Date(endDate[0],endDate[1]-1,endDate[2]);
		 var today = new Date();
		 today.setHours(0,0,0,0);

		 if (today.getTime() > start.getTime()) {
			 jQuery.goAlert(mailMsg.conf_autoreply_28);
			 return;
		 }

		 if (start.getTime() > end.getTime()) {
			 jQuery.goAlert(mailMsg.conf_autoreply_8);
			 return;
		 }

		 if (today.getTime() > end.getTime()) {
			 jQuery.goAlert(mailMsg.conf_autoreply_7);
			 return;
		 }	
	}
	
	//Parameter Setting
	var param = {};
	param.useAutoReply = jQuery("#reply_apply").attr("checked") ? true : false;
	var replyAddressList = new Array();
	jQuery("#mail_add_list tr .reply_address").each(function() {
		replyAddressList.push(jQuery(this).text());		
	});
	
	if (trim(startValue) != "") {
		startValue += "-00-00-00";
		startValue = moment(startValue, "YYYY-MM-DD-HH-mm-ss").utc().format();
	}
	
	if (trim(endValue) != "") {
		endValue += "-23-59-59";
		endValue = moment(endValue, "YYYY-MM-DD-HH-mm-ss").utc().format();
	}
	
	param.startTime = startValue;
	param.endTime = endValue;
	
	param.subject = jQuery("#autoReplySubject").val();
	param.content = jQuery("#autoReplyText").val();
	
	param.replyMode = jQuery("#replyMode").val();
	param.replyAddressList = replyAddressList;
	mailSettingControl.saveAutoReply(param);
}

/**
 * [자동전달 > 자동전달 메일주소> 삭제]
 */
function deleteForwardMailList(type) {
	var count = 0;
	
	if (type == "f") {
		var chk_forward_mail_list_area = jQuery("#forward_mail_list").length;
		if(chk_forward_mail_list_area == 0){
			jQuery("#forwardMailList_empty_area").show();
		}
//		var forwardingAddress = new Array();
//		jQuery("#forwardMailList tr .txt").each(function() {
//			forwardingAddress.push(jQuery(this).text());
//		});
		
		
//		if (count == 0) {
//			jQuery.goAlert(mailMsg.common_form_007);
//			return;
//		} else if (count > 0) {
//			if(!confirm(mailMsg.common_form_009)) {
//				return;
//			}
//		}
		
//		jQuery("#forwardMailList li input:checkbox").each(function() {
//			if (jQuery(this).attr("checked")) {
//				jQuery(this).closest("li").remove();			
//			}
//		});		
	} else if (type == "e") {
		jQuery("#blackList li input:checkbox").each(function() {
			if (jQuery(this).attr("checked")) {
				count++;			
			}		
		});
		
		if (count == 0) {
			jQuery.goAlert(mailMsg.common_form_007);
			return;
		} else if (count > 0) {
			if(!confirm(mailMsg.common_form_009)) {
				return;
			}
		}
		
		jQuery("#blackList li input:checkbox").each(function() {
			if (jQuery(this).attr("checked")) {
				jQuery(this).closest("li").remove();			
			}
		});		
	}	
}

/**
 * [스팸관리 > 수신허용 목록 > 전체삭제]
 */
function deleteAllForwardMailList(type) {
	var count = 0;
	if (type == "f") {
		
		var chk_forwardMailList_prev = jQuery("#forwardMailList_empty_area").prev().html();
		var chk_forwardMailList_next = jQuery("#forwardMailList_empty_area").next().html();
				
		while(chk_forwardMailList_prev || chk_forwardMailList_next){
			jQuery("#forward_mail_list").remove();
			chk_forwardMailList_prev = jQuery("#forwardMailList_empty_area").prev().html();
			chk_forwardMailList_next = jQuery("#forwardMailList_empty_area").next().html();
		}
		
		jQuery("#forwardMailList_empty_area").show();

//		jQuery("#forwardMailList li input:checkbox").each(function() {
//			count++;				
//		});
//		
//		if (count == 0) {
//			jQuery.goAlert(mailMsg.common_form_007);
//			return;
//		} else if (count > 0) {
//			jQuery("#forwardMailList li input:checkbox").each(function() {
//				jQuery(this).attr("checked", true);
//								
//			});
//			if (!confirm(mailMsg.common_form_009)) {
//				return;
//			}
//		}
//		
//		jQuery("#forwardMailList li input:checkbox").each(function() {
//			jQuery(this).closest("li").remove();					
//		});		
	} else if (type == "e") {
		jQuery("#blackList li input:checkbox").each(function() {
			count++;				
		});
		
		if (count == 0) {
			jQuery.goAlert(mailMsg.common_form_007);
			return;
		} else if (count > 0) {
			jQuery("#blackList li input:checkbox").each(function() {
				jQuery(this).attr("checked", true);
								
			});
			if (!confirm(mailMsg.common_form_009)) {
				return;
			}
		}
		
		jQuery("#blackList li input:checkbox").each(function() {
			jQuery(this).closest("li").remove();					
		});
	} else if (type == "d") {		
		jQuery(".defineForwarList_value").hide();
		jQuery("#defineForwarList_empty_area").show();
	}		
}

function getFilterInfo() {
	param = {};
	var filterApplyChecked = jQuery("input[name='filterApplyFlg']:checked").val();	
	var billboxApply = jQuery("input[name='billbox']:checked").val();
	var advboxApply = jQuery("input[name='advbox']:checked").val();
	var snsboxApply = jQuery("input[name='snsbox']:checked").val();
	
	param.filter = (filterApplyChecked == "on") ? true : false;
	if(smartFilter) {
		param.billbox = (billboxApply == "on") ? true : false;
		param.advbox = (advboxApply == "on") ? true : false;
		param.snsbox = (snsboxApply == "on") ? true : false;
	}
	return param;
}

/**
 * [자동전달 > 저장]
 * 
 * @returns
 */
function getForwardInfo() {
	param = {};
	
	// 메일 전달 후 처리
	var forwardModeChecked = jQuery("input[name='forwardApplyFlag']:checked").val();	
	if (forwardModeChecked == "on") {
		var forwardMode = jQuery("#forwardMode").val();					
		if (forwardMode == "forwarding") {			
			param.forwardMode = "forwarding";
		} else if (forwardMode == "forwardingonly") {
			param.forwardMode = "forwardingonly";
		}
	} else {		
		param.forwardMode = "none";
	}

	// 자동전달 메일 주소
	var forwardingAddress = new Array();
	jQuery("#forwardMailList tr .forwardMailList").each(function() {
		forwardingAddress.push(jQuery(this).text());
	});

	// 예외 자동전달 seq 주소
	var defineForwardingSeqList = new Array();
	var isRemoveAllDefineForward = jQuery("#removeAllDefineForward").val();
	if(isRemoveAllDefineForward != "true") {
		jQuery("#defineForwardList").find("tr[data-index]").each(function() {
			defineForwardingSeqList.push(jQuery(this).data("index"));
		});
	}
	
	param.forwardingAddress = forwardingAddress;
	param.defineForwardingSeqList = defineForwardingSeqList;

	var index = jQuery("#defineForwardingSeq").val();
	param.defineForwardingSeq = index;

	return param;
}

/**
 * [자동전달 > 예외 자동전달 규칙 > 추가 > 저장]
 * 
 * @returns
 */
function getDefineForwardInfo() {
	param = {};

	// 메일 전달 후 처리
	var forwardModeChecked = jQuery("input[name='forwardApplyFlag']:checked")
			.val();
	if (forwardModeChecked == "on") {
		var forwardMode = jQuery("#forwardMode").val();
		if (forwardMode == "forwarding") {
			param.forwardMode = "forwarding";
		} else if (forwardMode == "forwardingonly") {
			param.forwardMode = "forwardingonly";
		}
	} else {
		param.forwardMode = "none";
	}

	// 자동전달 메일 주소
	var forwardingAddress = new Array();
	jQuery("#forwardMailList tr .forwardMailList").each(function() {
		forwardingAddress.push(jQuery(this).text());
	});
	param.forwardingAddress = forwardingAddress;

	var defineType = jQuery("#defineType").val();
	if (defineType == "mail") {
		param.defineType = "mail";
	} else if (defineType == "domain") {
		param.defineType = "domain";
	}

	var defineValue = jQuery("#defineValue").val();
	if (defineValue) {
		defineValue = defineValue.toLowerCase();
	}
	param.defineValue = defineValue;
	// 예외 자동전달 주소
	var defineForwardingAddress = new Array();
	jQuery("#defineForwardingList li .txt").each(function() {		
		defineForwardingAddress.push(jQuery(this).text());		
	});	
	
	param.defineForwardingAddress = defineForwardingAddress;
	
	var index = jQuery("#defineForwardingSeq").val();	
	param.defineForwardingSeq = index;
	return param;	
}

function validationCheck() {
	var defineType = jQuery("#defineType").val();		
	var defineValue = jQuery("#defineValue").val().toLowerCase();
	// 예외 자동전달 주소
	var defineForwardingAddress = new Array();
	jQuery("#defineForwardingList li .txt").each(function() {		
		defineForwardingAddress.push(jQuery(this).text());		
	});	
	
	if (defineForwardingAddress.length > 0) {
		if (defineType == 'mail') {
			if (!isMail(defineValue)) {
				jQuery.goMessage(mailMsg.common_2);				
				jQuery("#defineValue").focus();
				return false;
			}
		} else if (defineType == 'domain') {
			if (!isDomain(defineValue)){
				jQuery.goMessage(mailMsg.error_domain);
				jQuery("#defineValue").focus();
				return false;
			}
		}
	} else {
		jQuery.goMessage(mailMsg.conf_forward_empty_msg);
		return false;
	}
	return true;
}

function deleteFilter(condSeq) {
	var param = {};
	param.condSeqs = [condSeq];	
	mailSettingControl.deleteFilterRule(param);
}

/**
 * [외부메일설정 > 삭제]
 * 
 * @param host
 * @param id
 */
function deleteExtList(host, id) {	
	param = {};	
	param.pop3Host = host
	param.pop3Id = id
	mailSettingControl.deleteExtRule(param);	
}

/**
 * [외부메일설정 > 전체삭제]
 */
function deleteAllExtList() {	
	jQuery.goConfirm(mailMsg.alert_remove_all, "", function() {
		mailSettingControl.deleteAllExtRule();
	});
}

function setStartTime() {	
	//jQuery("#startTime").datepick({dateFormat:'yy-mm-dd'});	
	jQuery("#startTime").datepicker({
		dateFormat : "yy-mm-dd",
		changeMonth: true,
        changeYear: true,
        yearSuffix: ""
    });
}

function setEndTime() {	
	//jQuery("#endTime").datepick({dateFormat:'yy-mm-dd'});
	
	jQuery("#endTime").datepicker({
		dateFormat : "yy-mm-dd",
		changeMonth: true,
        changeYear: true,
        yearSuffix: ""
    });
}
function changeSslSelect(){
	var sslCheck = jQuery("#sslCheck").attr("checked");
	if (sslCheck){
		jQuery("#pop3Port").attr("value", "995");
	} else {
		jQuery("#pop3Port").attr("value", "110");
	}
}

//부재중 응답 
function changeReplyMode() {
	var replyMode = jQuery("#replyMode").val();
	
	if(replyMode == "REPLYWHITE") {
		jQuery("#reply_mode_area").show();
	} else if(replyMode == "REPLYALL") {
		jQuery("#reply_mode_area").hide();
	}
	
}

function deleteReplyMail() {
	var chk_reply_area = jQuery("#reply_mail_list").length;
	if(chk_reply_area == 0){
		jQuery("#mail_list_empty").show();
	}
}

function deleteReplyMailAll() {
	var chk_mail_list_prev = jQuery("#mail_list_empty").prev().html();
	var chk_mail_list_next = jQuery("#mail_list_empty").next().html();
			
	while(chk_mail_list_prev || chk_mail_list_next){
		jQuery("#reply_mail_list").remove();
		chk_mail_list_prev = jQuery("#mail_list_empty").prev().html();
		chk_mail_list_next = jQuery("#mail_list_empty").next().html();
	}
	jQuery("#mail_list_empty").show();
	
}

function saveMailAdd() {
	var inputObj, selectObj;
	jQuery("#mail_list_empty").hide();
	
	var myEmail = USEREMAIL;
	inputObj = jQuery("#add_mail_name").val();
	
	if(!checkInputLength("jQuery", jQuery("#add_mail_name"), "", 0, 255)) {
        return;
	}
	
	selectObj = jQuery("#mail_add_list tr .reply_address").map(function () {
		return jQuery(this).text();
		}).get();
		
	addMailList(jQuery("#add_mail_name"), selectObj, '1000', myEmail, false, "r");
	
	jQuery.goPopup.close();
}

/**
 * [외부메일설정 > 추가 > POP3 서버]
 */
function setPOP3Server() {	
	var pop3value = jQuery("#pop3List").val();
	jQuery("form input").attr("disabled", pop3value == "");
	
	if (pop3value.indexOf("|") > -1){
		pop3value = pop3value.replace("|ssl","");
		jQuery("#pop3Port").val("995");
		jQuery("#sslCheck").attr("checked",true);
	} else {
		jQuery("#pop3Port").val("110");
		jQuery("#sslCheck").attr("checked",false);
	}
	
	jQuery("#pop3Host").val(pop3value == "userInput" ? "" : pop3value);
}

/**
 * [외부메일설정 > 추가 > 저장메일함]
 */
function checkBox() {
	if (jQuery("#mbox").attr("checked")) {		
		jQuery("#saveNewFolder").removeAttr("disabled");
		jQuery("#saveFolder").attr("disabled", "disabled");
		jQuery("#inputBoxName").show();
	} else {
		jQuery("#saveNewFolder").attr("disabled", "disabled");
		jQuery("#saveFolder").removeAttr("disabled");
		jQuery("#inputBoxName").hide();
	}
}

function changeOnlyImageSignMode(text) {
	var checked = jQuery("#sign_only_image").attr("checked");
	
	if(checked == 'checked'){
		settingEditorBoxDestroy();		
		jQuery("#signSelectMode").hide();
		jQuery("#registSignImage").show();
		jQuery("#signText").hide();
		jQuery("#signHtml").hide();
		jQuery("#signImgSizeText").hide();
		jQuery("#onlySignImgSize").show();	
		
		jQuery("#thumbnail_image").removeAttr("width");
		jQuery("#thumbnail_image").removeAttr("height");
		
		jQuery("#thumbnailImageWrap").height("170px");
		if("image" == jQuery("input[name='imgSizeFlag']:checked").val() || jQuery("input[name='imgSizeFlag']:checked").val() == undefined) {
			jQuery("#thumbnail_image").css({"width":"350px","height":"170px"});
			jQuery("#signImageSizeDesc").text("350 x 170");
			jQuery("input[name='imgSizeFlag'][value='image']").attr("checked", "checked");
		} else {
			jQuery("#thumbnail_image").css({"width":"","height":""});
			jQuery("input[name='imgSizeFlag'][value='image_full']").attr("checked", "checked");
		}
		
		jQuery("#thumbnailImageDivWrap").css({"overflow":"auto", "width":"670px", "height":"180px"});
	}else{
		jQuery("#signSelectMode").show();
		jQuery("#registSignImage").show();
		var mode = jQuery("#sign_mode option:selected").val();
		if(mode == "html"){
			jQuery("#signText").hide();
			jQuery("#signHtml").show();
			settingEditorBoxScript(null, text);
		}else{
			jQuery("#signText").show();
			jQuery("#signHtml").hide();
			settingEditorBoxDestroy();
		}
		jQuery("#signImgSizeText").show();
		jQuery("#onlySignImgSize").hide();
		jQuery("#thumbnailImageWrap").height("120px");
		jQuery("#thumbnail_image").css({"width":"100px","height":"120px"});
		jQuery("#signImageSizeDesc").text("100 x 120");
		
		jQuery("#thumbnailImageDivWrap").css({"overflow":"", "width":"", "height":""});
	}
}

/**
 * [서명관리 > 서명편집 or 추가 or 수정 > signMode변경]
 */
function changeSignMode(){
	
	jQuery("#mail_setting_modify_sign_modal").hide();
	var mode = jQuery("#sign_mode option:selected").val();
	jQuery("#signSelectMode").show();
	jQuery("#registSignImage").show();
	if(mode == "html"){
		if(!confirm(mailMsg.conf_sign_18)){
			jQuery("#sign_mode").val("text");
			jQuery("#mail_setting_modify_sign_modal").show();
			return;
		}
		var textareaVal = jQuery("#signText_Textarea").val();
		jQuery("#signText").hide();
		jQuery("#signHtml").show();
		settingEditorBoxDestroy();
		settingEditorBoxScript();
	}else{
		if(!confirm(mailMsg.conf_sign_17)){
			jQuery("#sign_mode").val("html");
			jQuery("#mail_setting_modify_sign_modal").show();
			return;
		}
		jQuery("#signText").show();
		jQuery("#signHtml").hide();
		jQuery("#signText_Textarea").empty();
		
	}
	jQuery("#mail_setting_modify_sign_modal").show();
};

function selectPicture(){
	jQuery("#theFile").click();
}

function deleteThumbnailImage(){
	jQuery("#thumbnail_image").attr("img-data", "");
	jQuery("#thumbnail_image").attr("src", "/resources/images/photo_profile_sample.jpg");
}

function saveSign(){
	var param = getSignData();
	if(param){
		mailSettingControl.destroySignAttach();
		mailSettingControl.saveSignData(param);
		jQuery.goPopup.close();
	}
}

function getSignData(){
	var $signName = jQuery("#signName");
	var signName = $signName.val();
    if (!validateInputValue($signName, 1, 20, "onlyBack")) {
        return;
    }  
    var $beforeSignName = jQuery("#beforeSignName");
    var beforeSignName = $beforeSignName.val();
    var signWriteType = jQuery("#signWriteType").val();
	var isSameName = false;
	jQuery("#signListTable input[name='signNameHidden']").each(function(i) {
		if (jQuery.trim(signName) == jQuery.trim(jQuery(this).val())) {
			if (signWriteType == "modify") {
				if(beforeSignName != signName) {
					isSameName = true;
				}
			} else {
				isSameName = true;
			}
		}
	});
	if (isSameName) {
		jQuery.goMessage(mailMsg.conf_sign_alert_signName_same);
		return;
	}
	var isOnlyImage = jQuery("#sign_only_image").attr("checked");
	var signMode = jQuery("#sign_mode option:selected").val();
	var signText = "";
	var defaultSign = false;

	if (!isOnlyImage) {
		if(signMode == 'html'){
			signText = settingGetHtmlMessage();
		}else{
			signText = jQuery("#signText_Textarea").val();
		}
		var len = signText.length;
		if (len < 1 && len > 2048) {			
			jQuery.goMessage(msgArgsReplace(mailMsg.error_inputlength,[1,2048]));		
			return;
		}
	}

	var signSeq = jQuery("#signSeq").val();
	var signType="";
	
	var chk_defaultSign = jQuery("#defaultSign").attr("checked");
	if(chk_defaultSign == 'checked'){
		defaultSign = true;
	}
	
	if(isOnlyImage){
		signType = jQuery("input[name='imgSizeFlag']:checked").val();
	}else{
		signType = "normal";
	}
	
	var param = {};
	param.signName = signName;
	param.defaultSign = defaultSign;
	param.signMode = signMode;
	param.signText = signText;
	param.signSeq = signSeq;
	param.signType = signType;
	
	var signImagePath = jQuery("#thumbnail_image").attr("img-data");
	if(signImagePath){
        param.signImagePath = signImagePath;
	}	
	var signImageName = jQuery("#thumbnail_image").attr("img-name");
	if(signImageName){
        param.signImageName = signImageName;
    }
	return param;
}
function settingGetHtmlMessage() {
   return signSmartEditorControl.getEditorText();
}

function sleep(msecs) {
    var start = new Date().getTime();
    var cur = start;
    while (cur - start < msecs) {
        cur = new Date().getTime();
    }
}

function selectSignImage(){
	jQuery("#theFile").click();
}

function deleteGetSignData(signSeq){
	var param = {"signSeq":signSeq};
	mailSettingControl.deleteSignData(param);
}

function deleteGetAllSignData(){
	var func = function (){
       mailSettingControl.deleteAllSignData();    
	};
	
	jQuery.goConfirm(mailMsg.location_sign,mailMsg.mail_sign_select_all_remove_title,function(){
        func();
    });
}

function setDefaultSign(signSeq){
	var param = {};
	param.signSeq = signSeq;
	
	mailSettingControl.settingDefaultSign(param);
}

function saveSignSetting(){	
	var signUse = jQuery("#sign_apply").attr("checked") ? true : false;
	var signLocation = jQuery("#signLocationOption option:selected").val();
	var param = {};
	param.signUse = signUse;
	param.signOutside = (signLocation == "outside");
	
	mailSettingControl.modifySign(param);
}

function changeUserFolderAgingDayExcute(param,event) {
	var _param = param;
	var func = function(){
    	mailSettingControl.changeUserFolderAgingDay(_param);
	    
	};
	var cancelFunc = function(){
    	var preAgingDay =_param.preAgingDay;
    	var preAgingOption;
    	event.find("option").each(function(){
    	    var day=jQuery(this).val();
    	    if(preAgingDay==day){
    	        preAgingOption = jQuery(this);
    	    }
    	});
    	if(preAgingOption){
    	    preAgingOption.attr("selected",true);
    	}else{
    	    event.find("option").attr("selected",false);
    	}
	};
	
	jQuery.goConfirm(mailMsg.mail_folder,mailMsg.mail_change_aging_title,function(){
        func();
    },function(){
        cancelFunc();
    });
}
function startBackupFolderExcute(folderName, fid) {
	if(isBackup || isBackupComplete || backupWork){
		jQuery.goAlert(mailMsg.mail_backup_title,mailMsg.alert_backup_process);
		return;
	}
	
	backupWork = true;
	backupStatusId = fid;
	var param = {"folderName": folderName,"folderEncName":fid};
	mailSettingControl.startBackupFolder(param);
}
function reloadViewFolderManage(){
	mailSettingControl.loadViewFolderManage();
}
function closeModifyFolderArea(){
	jQuery("#folderManageWrap span.txt_edit").each(function (){
		jQuery(this).prev().show();
		jQuery(this).hide();
	});
	jQuery("#folderManageWrap tr.edit").each(function() {
		jQuery(this).removeClass("edit");
	})
}

var signSmartEditorControl;
function settingEditorBoxScript(func, data) {
	var editorOpt = {
		useImage: false // 서명 에디터인 경우 ActiveX 에디터에서 이미지 버튼을 제거한다.
	};
    if (signSmartEditorControl) {
    	signSmartEditorControl.destroy();
    	signSmartEditorControl = null;
    }

    editorOpt.id = "signSmartEditor";
	editorOpt.locale = LOCALE;
	editorOpt.simpleMode = true;
	editorOpt.blockResize = true;
	signSmartEditorControl = new SmartEditorControl(editorOpt);    	
	signSmartEditorControl.makeEditor(function(){
		if (data) {
			signSmartEditorControl.setEditorText(data);
		}
	});
}
function settingEditorBoxDestroy() {
	if (signSmartEditorControl) {
    	signSmartEditorControl.destroy();
    	signSmartEditorControl = null;
    }
}
function saveMailTagExcute() {
	var tagNameObj = jQuery("#tag_name_input");
	var tagName = tagNameObj.val();
	var tagColor = jQuery("#mail_tag_popup div.layer_pallete a.active").attr("color");
	
	if (!validateInputValue(tagNameObj, 2, 32, "folderName")) {
		return;
	}
	
	mailSettingControl.addTag(tagName, tagColor);
	jQuery.goPopup.close();
}

function closeMailTagPallete() {
	jQuery("#mailTagPallete").remove();
	var ModifyTxt = jQuery("#tag_modify_area").length;
	if(ModifyTxt){
		jQuery("#tag_modify_area").parent().parent().prev().show();
		jQuery("#tag_modify_area").parent().parent().empty();
	}
}
function modifyTagNameExcute(param){
	var tagName =  param.tagName;
	var color = param.color;
	var id = param.id;
	
	var tag_row = "tag_row_" + id;
	var modify_tag_pallete = "modify_tag_pallete_" + id;
	
	var tag_modify_area = "tag_modify_area_" + id;
	var data = {"name":tagName, "color":color, "id":id};
	jQuery("#" + tag_row).hide();
	jQuery("#" + tag_modify_area).append(getHandlebarsTemplate("tag_modify_tmpl",data));
	jQuery("#" + tag_modify_area).show();
	
	var data = {"color":color};
	jQuery("#" + modify_tag_pallete).html(getHandlebarsTemplate("mail_pallete_modal_tmpl",data));
	
	jQuery("#"+modify_tag_pallete+" div.layer_pallete").on("click","a", function(e) {
		jQuery("#"+modify_tag_pallete+" div.layer_pallete a").removeClass("active");
		jQuery(this).addClass("active");
	});
}

//최근 보낸메일 
function deleteLastRcptExcute(rcptSeq) {
	var $deleteList = jQuery("#rcptList");
	var deleteList = $deleteList.val();
	if(deleteList == ""){
		$deleteList.val(rcptSeq);
	}else{
		$deleteList.val(deleteList + "," + rcptSeq);
	}
	if(!jQuery("#rcptbodyEmpty ~ tr").length){
		jQuery("#rcptbodyEmpty").show();
	}
}
function deleteAllLastRcptExcute() {
	jQuery("#rcptData .deleteBtn").each(function (){
		deleteLastRcptExcute(jQuery(this).data("seq"));
	});
	jQuery("#rcptbodyEmpty ~ tr").remove();
	jQuery("#rcptbodyEmpty").show();
}

function saveLastRcptExcute() {
	var rcptList = jQuery("#rcptList").val();
	if(rcptList == ""){
		jQuery.goSlideMessage(mailMsg.save_ok);
		return;
	}
	var rcptSeqArray = rcptList.split(",");
	var param = {"rcptSeqList":rcptSeqArray};
	
	mailSettingControl.deleteLastRcpt(param);
}

function isMail(str) {
    len = get_length(str);
    if (len > 256)    	
        return false;
    
    for (i = 0; i < len; i++) {    	
        ch = str.charAt(i);
        if ((ch >= '0' && ch <= '9') || (ch >= 'A' && ch <= 'Z')
        || (ch >= 'a' && ch <= 'z') || ch == '-' || ch == '.' ||
            ch == '_' || ch == '@')
            continue;
        else {        	
            return false;
        }
    }
    
    for (i = 0; i < len; i++) {    	
        ch = str.charAt(i);
        if (ch == '@')        	
            return true;
    }
    return false;
}

function get_length(str) {
    real_length = 0;
    len = str.length;
    for(i = 0; i < len; i++) {
        ch = str.charCodeAt(i);
        if(ch >= 0xFFFFFF) {
            real_length += 4;
        } else if(ch >= 0xFFFF) {
            real_length += 3;
        } else if (ch >= 0xFF) {
            real_length += 2;
        } else {
            real_length++;
        }
    }
    return real_length;
}

function checkName() {	
	var lastName = jQuery("#lastName").val();	
	var firstName = jQuery("#firstName").val();	
	lastName = lastName + " ";
	
	jQuery("#memberName").val(lastName+firstName);
}

function validateAddSenderEmail() {
	
	if (jQuery("#mailSenderListTbody .senderItem").length >= 100) {
		jQuery.goMessage(msgArgsReplace(mailMsg.common_form_002,[100]));
		return;
	}
	
	if (!validateInputValue(jQuery("#inputSenderName"), 0, 128, "userName")) {
	    return;
	}
	var senderName = jQuery.trim(jQuery("#inputSenderName").val());
	var senderEmailObj = jQuery("#availableEmails :selected");
	var senderEmail = jQuery.trim(senderEmailObj.val());
	if (senderEmail == "") {
		jQuery.goMessage(mailMsg.common_form_003);
	    senderEmailObj.focus();
	    return;
	}
	if(!isEmail(senderEmail)){
	    jQuery.goMessage(mailMsg.common_form_004);
	    senderEmailObj.focus();
	    return;
	}
	/*if (senderEmail == USERLOGINEMAIL) {
		jQuery.goMessage(mailMsg.common_form_001);
	    senderEmailObj.focus();
	    return;
	}*/
	
	var isDup = false;
	
	jQuery("#mailSenderListTbody .senderItem").each(function() {
		var email = get_email(jQuery(this).data("email"));
		if (email == senderEmail) {
			isDup = true;
			return false;
		}
	});
	
	if (isDup) {
		jQuery.goMessage(mailMsg.common_form_005);
		return;
	}
	var data={};
	var emailFormat = getEmailFormat(senderName, senderEmail);
	data.value= emailFormat;
	data.isAliasUser = senderEmailObj.data("type")=="AliasUser";
	var tmpl = getHandlebarsTemplate("mail_sender_add_tmpl",data);
	jQuery("#mailSenderListTbody").append(tmpl);
	jQuery("#mailSenderListWrap").show();
	jQuery("#inputSenderName").val("");
}


function toggleReplyTo(e) {
	if(jQuery(e.currentTarget).is(':checked')){
		jQuery('#senderEmailInfo').attr('disabled', 'disabled');
	}else{
		jQuery('#senderEmailInfo').removeAttr('disabled');
	}
}

function changePersonalPart(e) {
	jQuery('.senderItem').first().text('"'+jQuery(e.currentTarget).val()+'" <'+USEREMAIL+'>');
}

function changeImgSize() {
	jQuery("#signSelectMode").hide();
	jQuery("#registSignImage").show();
	jQuery("#signText").hide();
	jQuery("#signHtml").hide();
	jQuery("#signImgSizeText").hide();
	jQuery("#onlySignImgSize").show();	
	
	jQuery("#thumbnail_image").removeAttr("width");
	jQuery("#thumbnail_image").removeAttr("height");
	
	jQuery("#thumbnailImageWrap").height("170px");
	if("image" == jQuery("input[name='imgSizeFlag']:checked").val()) {
		jQuery("#thumbnail_image").css({"width":"350px","height":"170px"});
		jQuery("#signImageSizeDesc").text("350 x 170");
	} else {
		jQuery("#thumbnail_image").css({"width":"","height":""});
	}
}

function bindFilterInputEvent() {
	jQuery("#setting_filter_sender,#setting_filter_receiver,#setting_filter_subject").keyup(function() {
		var sender = jQuery.trim(jQuery("#setting_filter_sender").val());
		var receiver = jQuery.trim(jQuery("#setting_filter_receiver").val());
		var subject = jQuery.trim(jQuery("#setting_filter_subject").val());
		if ((sender != "" && receiver != "") || (sender != "" && subject != "") || (receiver != "" && subject != "")) {
			jQuery("#settingFilterCondOperationWrap").show();
		} else {
			jQuery("#settingFilterCondOperationWrap").hide();
		}
	});
}

function unbindFilterInputEvent() {
	jQuery("#setting_filter_sender,#setting_filter_receiver,#setting_filter_subject").unbind("keyup");
}
