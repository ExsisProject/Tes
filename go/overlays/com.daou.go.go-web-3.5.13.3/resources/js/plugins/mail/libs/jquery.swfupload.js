/*
 * SWFUpload jQuery Plugin v1.0.0
 *
 * Copyright (c) 2009 Adam Royle
 * Licensed under the MIT license.
 *
 */

(function(jQuery){
	
	var defaultHandlers = ['swfupload_loaded_handler','file_queued_handler','file_queue_error_handler','file_dialog_start_handler','file_dialog_complete_handler','upload_start_handler','upload_progress_handler','upload_error_handler','upload_success_handler','upload_complete_handler','queue_complete_handler'];
	var additionalHandlers = [];
	
	jQuery.fn.swfupload = function(){
		var args = jQuery.makeArray(arguments);
		return this.each(function(){
			var swfu;
			if (args.length == 1 && typeof(args[0]) == 'object') {
				swfu = jQuery(this).data('__swfu');
				if (!swfu) {
					var settings = args[0];
					var $magicUploadControl = jQuery(this);
					var handlers = [];
					jQuery.merge(handlers, defaultHandlers);
					jQuery.merge(handlers, additionalHandlers);
					jQuery.each(handlers, function(i, v){
						var eventName = v.replace(/_handler$/, '').replace(/_([a-z])/g, function(){ return arguments[1].toUpperCase(); });
						settings[v] = function() {
							var event = jQuery.Event(eventName);
							$magicUploadControl.trigger(event, jQuery.makeArray(arguments));
							return !event.isDefaultPrevented();
						};
					});					
					jQuery(this).data('__swfu', new SWFUpload(settings));					
				}
			} else if (args.length > 0 && typeof(args[0]) == 'string') {
				var methodName = args.shift();
				swfu = jQuery(this).data('__swfu');
				if (swfu && swfu[methodName]) {
					swfu[methodName].apply(swfu, args);
				}
			}
		});
	};
	
	jQuery.swfupload = {
		additionalHandlers: function() {
			if (arguments.length === 0) {
				return additionalHandlers.slice();
			} else {
				jQuery(arguments).each(function(i, v){
					jQuery.merge(additionalHandlers, jQuery.makeArray(v));
				});
			}
		},
		defaultHandlers: function() {
			return defaultHandlers.slice();
		},
		getInstance: function(el) {
			return jQuery(el).data('__swfu');
		}
	};
	
})(jQuery);

jQuery.fn.bindAll = function(options) {
	var $this = this;
	jQuery.each(options, function(key, val){
		$this.bind(key, val);
	});
	return this;
};
jQuery.fn.unbindAll = function(options) {
	var $this = this;
	jQuery.each(options, function(key, val){
		$this.unbind(key, val);
	});
	return this;
};
var SimpleBasicControl = function (opt){
    this.opt = opt;
    this.init = function(){
        var opt = this.opt;
    };
    this.makeBtnControl = function(){
        var opt = this.opt;
		var fontFamily = "font-family:돋움,dotum,AppleGothic,arial,Helvetica,sans-serif";
		if (this.opt.locale == "jp") {
			fontFamily = "font-family:MS PGothic,Osaka,arial,sans-serif !important";
		}
        jQuery('#swfupload-control').swfupload({
                    file_post_name : "NewFile",
                    upload_url: "/api/mail/image/upload",
                    file_size_limit : "10240",
                    file_types : "*.jpg;*.gif;*.png;*.bmp",
                    file_types_description : "",
                    file_upload_limit : "0",
                    flash_url : BASEURL + "resources/js/plugins/mail/swfupload/swfupload.swf",
                    post_params : {"maxImageSize":"1024000","uploadType":"flash"},
                    button_cursor :  SWFUpload.CURSOR.HAND,
                    button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                    button_text : "<span class='buttonText'>"+mailMsg.common_upload_picture+"</span>",
                    button_text_style :".buttonText {color:#ffffff;font-size:12px;font-weight:bold;font-family:"+fontFamily+"}",
        			button_width : 100,
                    button_height : 20,
                    button_text_top_padding : 1,
                    button_text_left_padding : (this.opt.locale == "ko") ? 15 : 5,
                    button_placeholder : jQuery('#button')[0],
                    debug: false
                })
                .bind('swfuploadLoaded', function(event){
                   
                })
                .bind('fileQueued', function(event, file){
                   
                    jQuery(this).swfupload('startUpload');
                })
                .bind('fileQueueError', function(event, file, errorCode, message){
                   
                })
                .bind('fileDialogStart', function(event){
                   
                })
                .bind('fileDialogComplete', function(event, numFilesSelected, numFilesQueued){
                   
                })
                .bind('uploadStart', function(event, file){
                   
                    var reExt = new RegExp("(.jpg|.gif|.png|.bmp)","gi"),
                        fileExt = file.type.toLowerCase();
                    
                    if(!reExt.test(fileExt)){
                    	jQuery.goMessage(mailMsg.conf_sign_8);
                        jQuery(this).swfupload('cancelUpload');
                    }
                })
                .bind('uploadProgress', function(event, file, bytesLoaded){
                   
                })
                .bind('uploadSuccess', function(event, file, serverData){
                	var result = jQuery.parseJSON(serverData);
		        	if (result.errorMessage == "") {
                    	jQuery("#thumbnail_image").attr("src", result.fileURL).attr("img-data",result.filePath).attr("img-name",result.fileName);
                    	jQuery("#vcard_img_delete").show();
		        	} else {
		        		jQuery.goSlideMessage(result.errorMessage, "caution");
		        	}
                })
                .bind('uploadComplete', function(event, file){
                    
                })
                .bind('uploadError', function(event, file, errorCode, message){
                   
                    
                });
    };
    this.destroy=function(){
        try{
            jQuery('#swfupload-control').swfupload("destroy");
        } catch(e){}
      
    };
}

var SignSettingControl = function (opt){
    this.opt = opt;
    this.init = function(){
        var opt = this.opt;
    };
    this.makeBtnControl = function(){
        var opt = this.opt;
		var fontFamily = "font-family:돋움,dotum,AppleGothic,arial,Helvetica,sans-serif";
		if (this.opt.locale == "jp") {
			fontFamily = "font-family:MS PGothic,Osaka,arial,sans-serif !important";
		}
        jQuery('#swfupload-control').swfupload({
                    file_post_name : "NewFile",
                    upload_url: "/api/mail/image/upload",
                    file_size_limit : "10240",
                    file_types : "*.jpg;*.gif;*.png;*.bmp",
                    file_types_description : "",
                    file_upload_limit : "0",
                    flash_url : BASEURL + "resources/js/plugins/mail/swfupload/swfupload.swf",
                    post_params : {"maxImageSize":"1024000","uploadType":"flash"},
                    button_cursor :  SWFUpload.CURSOR.HAND,
                    button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                    button_text : "<span class='buttonText'>"+mailMsg.comn_file_select+"</span>",
                    button_text_style :".buttonText {color:#656565;font-size:12px;font-weight:bold;font-family:"+fontFamily+"}",
        			button_width : (this.opt.locale == "jp") ? 90 : 73,
        			button_height : 26,
        			button_text_top_padding : 4,
        			button_text_left_padding : 7,
                    button_placeholder : jQuery('#button')[0],
                    debug: false
                })
                .bind('swfuploadLoaded', function(event){
                   
                })
                .bind('fileQueued', function(event, file){
                   
                    jQuery(this).swfupload('startUpload');
                })
                .bind('fileQueueError', function(event, file, errorCode, message){
                   
                })
                .bind('fileDialogStart', function(event){
                   
                })
                .bind('fileDialogComplete', function(event, numFilesSelected, numFilesQueued){
                   
                })
                .bind('uploadStart', function(event, file){
                   
                    var reExt = new RegExp("(.jpg|.gif|.png|.bmp)","gi"),
                        fileExt = file.type.toLowerCase();
                    
                    if(!reExt.test(fileExt)){
                    	jQuery.goMessage(mailMsg.conf_sign_8);
                        jQuery(this).swfupload('cancelUpload');
                    }
                })
                .bind('uploadProgress', function(event, file, bytesLoaded){
                   
                })
                .bind('uploadSuccess', function(event, file, serverData){
                	var result = jQuery.parseJSON(serverData);
		        	if (result.errorMessage == "") {
                    	jQuery("#thumbnail_image").attr("src", result.fileURL).attr("img-data",result.filePath).attr("img-name",result.fileName);
		        		jQuery("#sign_img_delete").show();
		        	} else {
		        		jQuery.goSlideMessage(result.errorMessage, "caution");
		        	}
                })
                .bind('uploadComplete', function(event, file){
                    
                })
                .bind('uploadError', function(event, file, errorCode, message){
                   
                    
                }).css("width",(this.opt.locale == "jp") ? 90 : 73);
    };
     this.destroy=function(){
        try{
            jQuery('#swfupload-control').swfupload("destroy");
        } catch(e){}
      
    };
    
}
var SimpleBasicCSVControl = function (opt){
   this.opt = opt;
   this.defaultImgPath = "";

    this.init = function(){
        var opt = this.opt;
        this.btnId = "#"+opt.btnId;
        this.queueFileList = new HashMap();
        this.uploadCompleteFile = [];
    };
    this.makeBtnControl = function(){
        var opt = this.opt;

		var fontFamily = "font-family:돋움,dotum,AppleGothic,arial,Helvetica,sans-serif";
		if (this.opt.locale == "jp") {
			fontFamily = "font-family:MS PGothic,Osaka,arial,sans-serif !important";
		}
        jQuery(this.btnId).swfupload({
            file_post_name : opt.formName,
            post_params : opt.param,
            upload_url: opt.url,            
            file_size_limit : opt.maxFileSize+"",
            file_types : opt.fileType,
            file_types_description : "",
            file_upload_limit : "0",
            flash_url : BASEURL + "resources/js/plugins/mail/swfupload/swfupload.swf",
            button_cursor :  SWFUpload.CURSOR.HAND,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            button_text : "<span class='buttonText'>"+mailMsg.comn_file_select+"</span>",
            button_text_style :".buttonText {color:#656565;font-size:12px;font-weight:bold;font-family:"+fontFamily+"}",
			button_width : 73,
			button_height : 26,
			button_text_top_padding : 4,
			button_text_left_padding : 7,
            debug: opt.debug,
             button_placeholder : jQuery('#button')[0]
        });
        jQuery(this.btnId).bindAll(opt.handler);
               
                
    };
    this.startUpload=function(){
       jQuery(this.btnId).swfupload("startUpload");
    };
    this.addPostParam = function(name,value){
        jQuery(this.btnId).swfupload("addPostParam",name,value);
    };
    this.destroy=function(){
        try{
            jQuery(this.btnId).swfupload("destroy");
        } catch(e){}
      
    };
}



var UploadBasicControl = function(opt) {
	this.opt = opt;
	this.defaultImgPath = "";
	
	this.init = function(){
		var opt = this.opt;
		this.btnId = "#"+opt.btnId;
		this.listId = "#"+this.opt.listId;
		this.controlType = opt.controlType;
		this.quota = {"hugeMax":0,"normalMax":0,"hugeUse":0,"normalUse":0};
		this.normalFileList = new HashMap();
		this.hugeFileList = new HashMap();
		this.queueFileList = new HashMap();
		this.uploadCompleteFile = [];
		this.hugeMode = (opt.controlType == "power")?true:false;
		this.defaultImgPath = '/resources/images/upload.gif';
	};
	this.makeBtnControl=function(){		
		var opt = this.opt;
		if(isMsie) {
			opt.buttonTextTopPadding = 4;
		} else {
			opt.buttonTextTopPadding = 4;
		}
		
		var fontFamily = "font-family:돋움,dotum,AppleGothic,arial,Helvetica,sans-serif";
		if (this.opt.locale == "jp") {
			fontFamily = "font-family:MS PGothic,Osaka,arial,sans-serif !important";
		}
		
		jQuery(this.btnId).swfupload({
			file_post_name : opt.formName,
			post_params : opt.param,
			upload_url: opt.url,			
			file_size_limit : opt.maxFileSize+"",
			file_types : opt.fileType,
			file_types_description : "",
			file_upload_limit : "0",
			flash_url : BASEURL + "resources/js/plugins/mail/swfupload/swfupload.swf",
			button_text : "<span class='buttonText'>"+opt.btnText+"</span>",
			button_text_style :".buttonText {color:#656565;font-size:12px;font-weight:bold;"+fontFamily+"}",
			button_width : this.opt.width?this.opt.width:73,
			button_height : 26,
			button_text_top_padding : this.opt.buttonTextTopPadding,
			button_text_left_padding : 7,
			button_placeholder_id : opt.btnCid,
			button_cursor : SWFUpload.CURSOR.HAND,
			button_window_mode:SWFUpload.WINDOW_MODE.TRANSPARENT,
			debug: opt.debug,
			button_action : opt.singleSelect ? SWFUpload.BUTTON_ACTION.SELECT_FILE : SWFUpload.BUTTON_ACTION.SELECT_FILES,
		}).css("width",(this.opt.width?this.opt.width:73));
		
		jQuery(this.btnId).bindAll(opt.handler);
	};
	this.btnControldestory=function(){
		jQuery(this.btnId).swfupload("destroy");
	};
	this.getControlFile=function(fileId){
		return jQuery(this.btnId).swfupload("getFile",fileId);
	};
	this.startUpload=function(){
		jQuery(this.btnId).swfupload("startUpload");
	};
	this.stopUpload=function(){
		jQuery(this.btnId).swfupload("stopUpload");
		this.uploadCompleteFile = [];
	};
	this.cancelUpload=function(){
		if(this.queueFileList){
			var keys = this.queueFileList.getKeys();
			for ( var i = 0; i < keys.length; i++) {
				var file = this.getControlFile(keys[i]);
				if(file){
					jQuery(this.btnId).swfupload("cancelUpload",keys[i]);
					this.queueFileList.remove(keys[i]);
				}
			}
		}
	};
	this.resetUpload=function(){
		this.stopUpload();
		this.cancelUpload();
		this.init();
		this.makeListControl();
	};
	this.makeListControl=function(){

		var swfTable = jQuery('<table id="basicAttachTitle" class="in_table form_mail004">');
		var tableHead = jQuery('<thead></thead>');
		var swfTable_Tr1 = jQuery('<tr></tr>');
			swfTable_Tr1.append('<th class="checkbox"><input type="checkbox" id="basicAttachChkAll" onclick="checkAll(this,document.uploadForm.basicAttachFileEl)"/></th>');
			swfTable_Tr1.append('<th class="align_l filename">'+mailMsg.bigattach_list_001+'</th>');
			swfTable_Tr1.append('<th class="align_r filesize">'+mailMsg.bigattach_list_002+'</th>');
			if(this.controlType == "power"){
				swfTable_Tr1.append('<th class="align_c attachtype">'+mailMsg.mail_attach_type+'</th>');
			}
			swfTable_Tr1.append('<th class="align_c remove">'+mailMsg.mail_attach_delete+'</th>');
			tableHead.append(swfTable_Tr1);
		swfTable.append(tableHead);
		var swfTableWrap = jQuery('<div id="basicAttachItemList" class="div_scroll" style="max-height: 125px">');
		var swfDataTable = swfTable.clone();
		swfDataTable.attr("id", "basicAttachList");
		swfDataTable.find("tr").remove();
		swfTableWrap.append(swfDataTable);
		var lid = this.listId;
		setTimeout(function(){
			jQuery(lid).empty();
			jQuery(lid).append(swfTable);
			jQuery(lid).append(swfTableWrap);
		},100);
	};
	this.makeListWebFolderControl=function(){
		var sefMainTable = jQuery('<table class="form_type"></table>');
		var sefMainTr = jQuery('<tr></tr>');
		var sefMainTd = jQuery('<td style="padding:0"></td>');
		var sefheaderTable = jQuery('<table id="basicAttachTitle" class="in_table form_mail004"></table>');
		var tableHead = jQuery('<thead></thead>');
		var swfTable_Tr1 = jQuery('<tr></tr>');
		swfTable_Tr1.append('<th class="checkbox"><input type="checkbox" id="basicAttachChkAll" onclick="checkAll(this,document.uploadForm.basicAttachFileEl)"/></th>');
		swfTable_Tr1.append('<th class="align_l filename">'+mailMsg.bigattach_list_001+'</th>');
		swfTable_Tr1.append('<th class="align_r filesize">'+mailMsg.bigattach_list_002+'</th>');
		swfTable_Tr1.append('<th class="align_c attachtype">'+mailMsg.comn_upload_status+'</th>');
		swfTable_Tr1.append('<th class="align_c remove">'+mailMsg.mail_attach_delete+'</th>');
		tableHead.append(swfTable_Tr1);
		sefheaderTable.append(tableHead);
		sefMainTd.append(sefheaderTable);
		sefMainTr.append(sefMainTd);
		sefMainTable.append(sefMainTr);
		var swfTable = jQuery('<div class="div_scroll" style="height:200px"><table id="basicAttachList" class="in_table form_mail004">');

		var lid = this.listId;
		setTimeout(function(){
			jQuery(lid).empty();
			jQuery(lid).append(sefMainTable);
			jQuery(lid).append(swfTable);
		},100);
	};
	this.addAttachList=function(fileObj){
		var isHugeType = (fileObj.type == "huge")?true:false;
		var listElement ='<tr id="'+fileObj.id+'Low" >'
			+'<td class="checkbox"><input type="checkbox" id="'+fileObj.id+'" name="basicAttachFileEl" value="" attsize="'+fileObj.size+'" atttype="'+((isHugeType)?'huge':'normal')+'"></td>'
			+'<td class="align_l filename" title="'+escape_tag(fileObj.name)+'">'
				+'<span class="item_file file_wrap">'
					+'<span class="ic_file ic_'+getFileTypeImage(fileObj.name)+'"></span>'
					+'<span class="name">'+escape_tag(fileObj.name)+'</span>'
				+'</span>'
			+'</td>'
			+'<td class="align_r filesize"><span class="size">'+printSize(fileObj.size)+'</span></td>';
		if(this.controlType == "power"|| this.opt.webfolder){
			listElement += '<td id="'+fileObj.id+'TypeInfo" class="attachtype">'+((isHugeType)?mailMsg.bigattach_11:mailMsg.bigattach_10)+'<span id="progress_'+fileObj.id+'" class="progressBar"></span></td>';
		}
		listElement += '<td class="remove"><span class="btn_bdr" onclick="deletefileById(\''+fileObj.id+'\')"><span title="'+mailMsg.comn_del+'" class="ic_classic ic_basket"></span></span></td>';
		listElement += '</tr>';
		if(isHugeType){
			this.hugeFileList.put(fileObj.id,fileObj);
		} else {
			this.normalFileList.put(fileObj.id,fileObj);
		}

		listElement = this.previewTempAttach(fileObj, jQuery(listElement));

		jQuery("#basicAttachList").append(listElement);
	};
	
	this.previewTempAttach = function(fileObj, $itemHtml) {
		var itemInfo = [];

		// 프리뷰 가능한 확장자이면 화면에 표시.
		if(acceptConverterMobile(getFileTypeImage(fileObj.name))) {
			var preview = [
				'<span class="btn_fn4 " style="margin:0 0 0 2px !important;" onclick="previewTempFile(\''+fileObj.id+'\')">',
				'<span class="txt" style="padding:0px;">'+mailMsg.mail_preview+'</span>',
				'</span>'
			];

			jQuery.merge(itemInfo, preview);
		}

		// 다운로드는 default로 추가.
		var downloadView = [
			'<span class="btn_fn4 " style="margin:0 0 0 2px !important;" onclick="downloadTempFile(\''+fileObj.id+'\')">',
			'<span class="txt" style="padding:0px;">'+mailMsg.bigattach_09+'</span>',
			'</span>'
		];

		jQuery.merge(itemInfo, downloadView);

		$itemHtml.find('span.item_file').append(itemInfo.join(''));

		return $itemHtml


		function acceptConverterMobile(fileType) {
			fileType = fileType.toLowerCase();
			var acceptType = "doc|docx|hwp|ppt|pptx|xls|xlsx|pdf|txt";
			var regExp = new RegExp("(" + acceptType + ")$", "i");
			if (regExp.test(fileType)) {
				return true;
			} else {
				return false;;
			}
		}
	};
	this.addAttachWebfolderList=function(fileObj){
		var isHugeType = (fileObj.type == "huge")?true:false;
		var listElement ='<tr id="'+fileObj.id+'Low" >'
		+'<td class="checkbox"><input type="checkbox" id="'+fileObj.id+'" name="basicAttachFileEl" value="" attsize="'+fileObj.size+'" atttype="'+((isHugeType)?'huge':'normal')+'"></td>'
		+'<td class="align_l filename" title="'+escape_tag(fileObj.name)+'">'
		+'<span class="item_file file_wrap">'
		+'<span class="ic_file ic_'+getFileTypeImage(fileObj.name)+'"></span>'
		+'<span class="name">'+escape_tag(fileObj.name)+'</span>'
		+'</span>'
		+'</td>'
		+'<td class="align_r filesize"><span class="size">'+printSize(fileObj.size)+'</span></td>';
		listElement += '<td id="'+fileObj.id+'TypeInfo" class="align_c attachtype"><span id="progress_'+fileObj.id+'" class="progressBar">['+mailMsg.comn_upload_ready+']</span></td>';
		listElement += '<td class="align_c remove"><span class="btn_bdr" onclick="deletefileById(\''+fileObj.id+'\')"><span title="'+mailMsg.comn_del+'" class="ic_classic ic_basket"></span></span></td>';
		listElement += '</tr>';
		if(isHugeType){
			this.hugeFileList.put(fileObj.id,fileObj);
		} else {
			this.normalFileList.put(fileObj.id,fileObj);
		}
		jQuery("#basicAttachList").append(listElement);		
	};	
	this.getCheckAttachFileIds=function(){
		var checkIds = [];		
		jQuery("#basicAttachList input[name=basicAttachFileEl]:checked").each(function(){
			checkIds.push(jQuery(this).attr("id"));
		});
		
		return checkIds;
	};
	this.deleteAttachList=function(fid){
		var type  = jQuery("#"+fid).attr("atttype");
		var size  = jQuery("#"+fid).attr("attsize");
		if(type == "huge"){
			this.quota.hugeUse -= size;
			this.hugeFileList.remove(fid);
		} else {
			this.quota.normalUse -= size;
			this.normalFileList.remove(fid);
		}
		jQuery("#"+fid+"Low").remove();		
		var file = this.getControlFile(fid);
		if(file){
			jQuery(this.btnId).swfupload("cancelUpload",fid);
			this.queueFileList.remove(fid);
		}
	};
	this.setAttachSize=function(type,size){
		if(type == "hugeMax")this.quota.hugeMax = size;
		else if(type == "hugeUse")this.quota.hugeUse = size;
		else if(type == "normalMax")this.quota.normalMax = size;
		else if(type == "normalUse")this.quota.normalUse = size;
		
	};
	this.getAttachSize=function(type){
		var size = 0;
		if(type == "hugeMax")size = this.quota.hugeMax;
		else if(type == "hugeUse")size = this.quota.hugeUse;
		else if(type == "normalMax")size = this.quota.normalMax;
		else if(type == "normalUse")size = this.quota.normalUse;					
		return size;
	};
	this.getAttachQuotaInfo=function(){
		return this.quota;
	};
	this.getFileList=function(type){
		if(type == "huge")return this.hugeFileList.getValues();
		else return this.normalFileList.getValues();
	};
	this.setFileList=function(type,fileList){
		var nList = new HashMap();
		for ( var i = 0; i < fileList.length; i++) {
			nList.put(fileList[i].id,fileList[i]);
		}
		if(type == "huge") this.hugeFileList = nList;
		else this.normalFileList = nList;
	};
	this.getAttachFileInfo=function(type,fid){
		return (type == "huge")?this.hugeFileList.get(fid):this.normalFileList.get(fid);
	};
	this.setAttachFileInfo=function(type,fid,fObj){
		if(type == "huge") this.hugeFileList.put(fid,fObj);
		else this.normalFileList.put(fid,fObj);
	};
	this.addUploadQueueFile=function(file){
		this.queueFileList.put(file.id,{id:file.id,name:file.name,size:file.size});
	};
	this.getUploadQueueFile=function(){
		return this.queueFileList.getValues();
	};
	this.getUploadQueueSize=function(){
		return this.queueFileList.size();
	};
	this.isNextUploadQueue=function(fileId){		
		this.queueFileList.remove(fileId);
		return (this.queueFileList.size() > 0)?true:false;
	};
	this.setUploadCompleteFile=function(fid,file){
		var queueFile = this.hugeFileList.get(fid);
		if(queueFile){
			queueFile.uid = file.uid;
			queueFile.path = file.filePath;
			queueFile.hostId = file.hostId;
			this.hugeFileList.remove(fid);
			this.hugeFileList.put(fid,queueFile);
		} else {
			queueFile = this.normalFileList.get(fid);
			if(queueFile){
				queueFile.uid = file.uid;
				queueFile.path = file.filePath;
				queueFile.hostId = file.hostId;
				this.normalFileList.remove(fid);
				this.normalFileList.put(fid,queueFile);
			}
		}
	};	
	this.setHugeUploadUse=function(val){
		this.hugeMode = val;
	};
	this.getHugeUploadUse=function(){
		return this.hugeMode;
	};
	this.isHugeTypeFile=function(fid){
		var hugeFile = this.hugeFileList.get(fid);
		return (hugeFile)?true:false;
	};
	this.chageAttachType=function(fid){
		var type = jQuery("#"+fid).attr("atttype");
		var tempFile;		
		if(type == "huge"){
			tempFile = this.hugeFileList.get(fid);
			this.normalFileList.put(fid,tempFile);
			this.hugeFileList.remove(fid);
			jQuery("#"+fid).attr("atttype","normal");
			jQuery("#"+fid + "TypeInfo").text(mailMsg.bigattach_10);			
			jQuery("#"+fid + "ChgLink").text(mailMsg.mail_attach_chg_bigattach);
			jQuery(this.btnId).swfupload("removeFileParam",fid,"attachtype");
			jQuery(this.btnId).swfupload("removeFileParam",fid,"regdate");
		} else {
			tempFile = this.normalFileList.get(fid);
			this.hugeFileList.put(fid,tempFile);
			this.normalFileList.remove(fid);
			var today = new Date();
			jQuery("#"+fid).attr("atttype","huge");
			jQuery("#"+fid + "TypeInfo").text(mailMsg.bigattach_11);
			jQuery("#"+fid + "ChgLink").text(mailMsg.mail_attach_chg_normal);
			jQuery(this.btnId).swfupload("addFileParam",fid,"attachtype","huge");
			jQuery(this.btnId).swfupload("addFileParam",fid,"regdate",today.getTime());
		}
	};
	this.destroy=function(){
		try{
			jQuery(this.btnId).swfupload("destroy");
		} catch(e){}
		if(this.listId)jQuery(this.listId).empty();
		this.quota = {"hugeMax":0,"normalMax":0,"hugeUse":0,"normalUse":0};
		if(this.normalFileList)this.normalFileList.destroy();
		if(this.hugeFileList)this.hugeFileList.destroy();
		if(this.queueFileList)this.queueFileList.destroy();
		this.uploadCompleteFile = [];
	};
	this.emptyFileList=function(){
		jQuery(this.btnId).unbindAll(opt.handler);
		if(this.listId)jQuery(this.listId).empty();
		this.cancelUpload();
	};
};



var MailInlineImgControl = function (opt){
    this.opt = opt;
    this.init = function(){
        var opt = this.opt;
    };
    this.makeBtnControl = function(){
        var opt = this.opt;         
        var _this = this;
        var queueFileCount = 0;

		var fontFamily = "font-family:돋움,dotum,AppleGothic,arial,Helvetica,sans-serif";
		if (this.opt.locale == "jp") {
			fontFamily = "font-family:MS PGothic,Osaka,arial,sans-serif !important";
		}

        jQuery('#swfupload-control').swfupload({
                    file_post_name : "NewFile",
                    post_params : opt.param,
                    upload_url: "/api/mail/image/upload",
                    file_size_limit : "10240",
                    file_types : "*.jpg;*.gif;*.png;*.bmp",
                    file_types_description : "",
                    file_upload_limit : "0",
                    flash_url : BASEURL + "resources/js/plugins/mail/swfupload/swfupload.swf",
                    button_cursor :  SWFUpload.CURSOR.HAND,
                    button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                    button_text : "<span class='buttonText'>"+mailMsg.comn_file_select+"</span>",
                    button_text_style :".buttonText {color:#656565;font-size:12px;font-weight:bold;"+fontFamily+"}",
        			button_width : (this.opt.locale == "jp") ? 90 : 73,
        			button_height : 26,
        			button_text_top_padding : 6,
        			button_text_left_padding : 7,
                    button_placeholder : jQuery('#button')[0],
                    debug: false
                })
                .bind('swfuploadLoaded', function(event){
                   
                })
                .bind('fileQueued', function(event, file){
                	queueFileCount++;
                    jQuery(this).swfupload('startUpload');
                })
                .bind('fileQueueError', function(event, file, errorCode, message){
                	var reExt = new RegExp("(.jpg|.gif|.png|.bmp|.jpeg|.tif)","gi"),
                    fileExt = file.type.toLowerCase();
                
                    if(!reExt.test(fileExt)){
                    	jQuery.goSlideMessage(mailMsg.conf_sign_8,"caution");
                    	return;
                    }
                    
                    if(file.size > 10240) {
                    	jQuery.goSlideMessage(msgArgsReplace(mailMsg.conf_userinfo_msg_11,['10MB']),"caution");
                    	return;
                    }
                })
                .bind('fileDialogStart', function(event){
                   
                })
                .bind('fileDialogComplete', function(event, numFilesSelected, numFilesQueued){
                   
                })
                .bind('uploadStart', function(event, file){
                   
                    var reExt = new RegExp("(.jpg|.gif|.png|.bmp|.jpeg|.tif)","gi"),
                        fileExt = file.type.toLowerCase();
                    
                    if(!reExt.test(fileExt)){
                    	jQuery.goMessage(mailMsg.conf_sign_8);
                        jQuery(this).swfupload('cancelUpload');
                    }
                })
                .bind('uploadProgress', function(event, file, bytesLoaded){
                   
                })
                .bind('uploadSuccess', function(event, file, serverData){
                    var data = jQuery.parseJSON(serverData),
                    msg = data.errorMessage;
                    
                    if (msg != '') {
                    	jQuery.goSlideMessage(data.errorMessage, "caution");
                        return;
                    } else {
                    	var inlineImg = '<img src="' + data.fileURL + '" title="' + data.fileName + '"/>';

                    	editorControl.addEditorText(inlineImg);
                    }
                    
                })
                .bind('uploadComplete', function(event, file){
                	queueFileCount--;
                	if(queueFileCount==0) {
                    	jQuery('#swfupload-control').swfupload("destroy");
						_this.opt.popupContents.close();
                	} else {
                		jQuery(this).swfupload('startUpload');
                	}
                })
                .bind('uploadError', function(event, file, errorCode, message){
                   
                    
                }).css("width",(this.opt.locale == "jp") ? 90 : 73);
    };
     this.destroy=function(){
        try{
            jQuery('#swfupload-control').swfupload("destroy");
        } catch(e){}
      
    };
    
};
