var UploadSimpleBasicControl = function (opt) {
    var _this = this;

    this.opt = opt;
    this.init = function () {
        var opt = this.opt;
        this.btnId = "#" + opt.btnId;
        this.listId = "#" + opt.listId;
        this.controlType = opt.controlType;
        this.quota = {"hugeMax": 0, "normalMax": 0, "hugeUse": 0, "normalUse": 0};
        this.normalFileList = new HashMap();
        this.hugeFileList = new HashMap();
        this.queueFileList = new HashMap();
        this.uploadCompleteFile = [];
        this.hugeMode = opt.controlType == "power";
        this.defaultImgPath = '/resources/images/upload.gif';
        var isAttachAreaFolded = getCookie('isAttachAreaFolded') == 'true' && jQuery('[evt-rol="attach-area-toggle"]').length;
        if (isAttachAreaFolded) {
            jQuery('[evt-rol="attach-area-toggle"]').removeClass('ic_arrow_up_type4').addClass('ic_arrow_down_type4');
            jQuery('#att_simple_area').hide();
        }
    };

    this.makeBtnControl = function () {
        function uploadValidation(data) {
            var file = data.files[0];
            if (jQuery('#' + file.id).length) {
                return false;
            }

            if (file.relativePath) {
                return false;
            }

            return true;
        };

        if (this.btnId == "#basicUploadControl") {
            var $dropZone = jQuery('#dropZone');
            var timer = null;

            jQuery('#simpleFileInitSub').off("click");
            jQuery('#simpleFileInitSub').on('click', function () {
                jQuery('#mailSimpleUpload').click();
            });

            jQuery('#mailSimpleUpload').unbind();
            $dropZone.unbind();

            jQuery('#mailSimpleUpload').fileupload({
                url: "/api/mail/file/upload",
                sequentialUploads: true,
                formData: {
                    uploadType: 'flash',
                    maxAttachFileSize: MAX_ATTACH_SIZE
                },
                dataType: 'json',
                done: function (e, data) {
                    
                },
                dropZone: $dropZone, // prevent document drop
                pasteZone: null
            });

            $dropZone.bind('dragleave', function (e) {
                clearTimeout(timer);
                timer = setTimeout(function () { // 반복 토글방지. 마지막 leave 일때 removeClass 하자
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

            jQuery('#mailSimpleUpload')
                .bind('fileuploadadd', function (e, data) {
                    uploadAttachFilesComplete = false;
                    var fileIndex = basicAttachUploadControl.generatorFileIndex();
                    var fileId = "file_index_" + fileIndex;
                    data.files[0].id = fileId;
                    data.files[0].index = fileIndex;

                    var file = data.files[0];

                    /*
                    //동일한 파일명과 폴더는 skip
                    if(!uploadValidation(data)){
                        //upload event 순서는 1)fileuploadadd 2)fileuploadsubmit 3)fileuploadprogress 4)fileuploaddone
                        //동일한 파일명과 폴더 체크에 걸리면 uploadAttachFilesComplete를 true로 변경 후 return false 한다.
                        //return false; 를 하면 동시에 올린 다른 파일들도 같이 취소됨.
                        //uploadAttachFilesComplete 을 전역으로 사용하고 있어서 파일별로 처리할수 없음.
                        uploadAttachFilesComplete = true;
                        return false;
                    }
                    */

                    var quota = basicAttachUploadControl.getAttachQuotaInfo();
                    var isNormalOver = (file.size + quota.normalUse) > quota.normalMax;
                    var isAllowBigAttach = jQuery("#bigAttachFlagCheck").attr("checked");
                    var type = "normal";

                    if ((isAllowBigAttach || (file.size > quota.normalMax) || isNormalOver)
                        && basicAttachUploadControl.getHugeUploadUse()) {
                        type = "huge";
                        if ((file.size + quota.hugeUse) > quota.hugeMax) {
                            if (isNormalOver) jQuery.goAlert(mailMsg.comn_upload_title, mailMsg.ocx_upalert_size);
                            else jQuery.goAlert(mailMsg.comn_upload_title, printSize(quota.hugeMax) + " " + mailMsg.ocx_upalert_size);
                            return false;
                        }
                        if (file.size > MAX_BIG_ATTACH_SIZE) {
                            jQuery.goAlert(mailMsg.comn_upload_title, msgArgsReplace(mailMsg.bigattach_18, [printSize(MAX_BIG_ATTACH_SIZE)]));
                            return false;
                        }
                        data.formData = {
                            uploadType: 'flash',
                            maxAttachFileSize: MAX_ATTACH_SIZE,
                            attachtype: "huge",
                            regdate: today.getTime()
                        };

                        updateAttachQuota("hugeUse", file.size + quota.hugeUse);

                    } else {
                        type = "normal";
                        if ((file.size + quota.normalUse) > quota.normalMax) {
                            jQuery.goAlert(mailMsg.comn_upload_title, printSize(quota.normalMax) + " " + mailMsg.ocx_upalert_size);
                            return false;
                        }

                        if (file.size > (MAX_ATTACH_SIZE * 1024 * 1024)) {
                            jQuery.goAlert(mailMsg.comn_upload_title, MAX_ATTACH_SIZE + "MB " + mailMsg.ocx_upalert_size);
                            return false;
                        }

                        updateAttachQuota("normalUse", file.size + quota.normalUse);

                    }

                    /* GO-29817 파일 사이즈와 변경시간이 동일한 경우 한개만 첨부되는 현상

                    */
                    var file = {
                        id: fileId,
                        index: fileIndex,
                        name: file.name,
                        size: file.size,
                        type: type
                    };
                    _this.addAttachFile(file);

                    var jqXHR = data.submit(); // Catching the upload process of every file
                    jQuery('[data-id="' + fileId + 'delBtn"]').on('click', function (e) {
                        jqXHR.abort();	// upload cancel
                        // _this.deleteAttachList(fileId, e);
                    });
                })
                .bind('fileuploadprogress', function (e, result) {
                    var file = result.files[0];
                    var progressId = file.id;
                    var fileUploadPercent = Math.ceil(result.loaded / result.total * 100);
                    if (fileUploadPercent > 99) {
                        fileUploadPercent = 100;
                    }

                    fileUploadPercent = (fileUploadPercent >= 100) ? 100 : fileUploadPercent;
                    var progressBar = jQuery('#progress_' + progressId);
                    progressBar.hide();
                    progressBar.find('.gage').css('width', fileUploadPercent);
                    progressBar.show();
                    jQuery("#" + progressId + "delBtn").show();

                    var status = jQuery('#status_' + progressId);
                    if (fileUploadPercent == 100) {
                        status.html("<img src='/resources/images/img_loader_s.gif'>");
                    } else {
                        status.html('<span class="rate">' + fileUploadPercent + '%</span>');
                    }
                })
                .bind('fileuploadsubmit', function (e, data) {
                    var isAllowBigAttach = jQuery("#bigAttachFlagCheck").attr("checked");
                    // GO-27684 대용량 체크박스를 체크 하지 않아요 대용량이 업로드 가능하므로 대용량으로 업로드 됬는지 한번 더 체크
                    var isHugeAttachType = data.formData ? data.formData.attachtype == "huge" : false;
                    if (isAllowBigAttach || isHugeAttachType) {
                        data.formData = {
                            uploadType: 'flash',
                            maxAttachFileSize: MAX_ATTACH_SIZE,
                            attachtype: "huge",
                            regdate: today.getTime()
                        }
                    }
                })
                .bind('fileuploadsend', function (e, data) {
                })
                .bind('fileuploaddone', function (e, data) {
                    var result = data.result;
                    var resStatus = result.uploadResult;
                    var resultMsg = mailMsg.comn_upload_complete;
                    var size = result.fileSize;

                    var file = data.files[0];
                    var fileId = file.id;
                    if (resStatus === "success") {
                        var isAllowBigAttach = jQuery("#bigAttachFlagCheck").attr("checked");	// 대용량 체크박스 체크 유무
                        // GO-27684 대용량 체크박스를 체크 하지 않아요 대용량이 업로드 가능하므로 대용량으로 업로드 됬는지 한번 더 체크
                        var isHugeAttachType = data.formData ? data.formData.attachtype == "huge" : false;
                        var attachType = (isAllowBigAttach || isHugeAttachType) ? "huge" : "normal";
                        addlistForJQuery(result.fileName, result.fileSize, result.filePath, result.hostId, result.uid, attachType, fileId);
                    } else {
                        resultMsg = mailMsg.conf_pop_54;
                        if (size == 0) {
                            jQuery.goAlert(mailMsg.comn_upload_title, mailMsg.file_size_zero);
                            jQuery("#" + fileId).closest("li").remove();
                            uploadAttachFilesComplete = true;
                            return false;
                        }
                    }

                    uploadAttachFilesComplete = _this.isUploadComplete(file, data.originalFiles);
                    _this.updateAttachFileProgress(fileId, resultMsg);
                    jQuery('#att_simple_area').toggle(true);
                    jQuery('[evt-rol="attach-area-toggle"]').removeClass('ic_arrow_down_type4').addClass('ic_arrow_up_type4');
                    setCookie('isAttachAreaFolded', false, 365);
                })
                .bind('fileuploadfail', function (e, data) {
                    uploadAttachFilesComplete = _this.isUploadComplete(data.files[0], data.originalFiles);
                    if (data.errorThrown != "abort") {
                        var fileId = data.files[0].id;
                        _this.updateAttachFileProgress(fileId, mailMsg.conf_pop_54);
                        jQuery.goAlert(mailMsg.comn_upload_title, mailMsg.error_fileupload);
                    }
                })
                .bind('fileuploadchunkalways', function (e, data) {
                });
        } else {
            jQuery('#massSimpleUpload').unbind();
            jQuery('#massSimpleUpload').fileupload({
                url: "/api/mail/file/upload",
                formData: {
                    uploadType: 'flash',
                    maxAttachFileSize: MAX_ATTACH_SIZE
                },
                dataType: 'json',
                done: function (e, serverData) {
                    var data = serverData.result,
                        name = data.fileName,
                        size = (parseInt(data.fileSize) / 1024).toFixed(2),
                        fileItemTmp = [
                            "<span class='item_file' file-path='" + data.filePath + "'>",
                            "<span class='ic_file ic_txt'></span>",
                            "<span class=''>" + name + "</span>",
                            "<span class='size'>" + size + "KB" + "</span>",
                            "<span class='btn_bdr'>",
                            "<span class='ic_classic ic_del' title='" + mailMsg.comn_del + "'></span>",
                            "</span>",
                            "</span>"].join("");

                    if (!isConfirmFile(name, "txt")) {
                        jQuery.goAlert(msgArgsReplace(mailMsg.error_nofileext, ["txt"]));
                        return;
                    }

                    $fileItemTmp = jQuery(fileItemTmp);
                    jQuery("#massFileItem").html($fileItemTmp);
                    jQuery("#uploadActor").hide();
                    $fileItemTmp.find("span.ic_del").on("click", function (e) {
                        jQuery(this).parents("span.item_file:first").remove();
                        jQuery("#uploadActor").show();
                    });
                }
            });
        }
    };

    // GO-29817 파일 사이즈와 변경시간이 동일한 경우 한개만 첨부되는 현상
    this.generatorFileIndex = function () {
        var index = 0;

        // 첨부된 파일이 있으면 마지막 index+1
        var attachedNum = jQuery("#basicAttachList > li").size();
        if (attachedNum > 0) {
            var lastIndex = jQuery("#basicAttachList li:last").attr("data-index");
            if (lastIndex) {
                index = parseInt(lastIndex) + 1;
            }
        }

        return index;
    };
    this.isUploadComplete = function (uploadedFile, originalFiles) {
        return uploadedFile == originalFiles[originalFiles.length - 1];
    };
    this.btnControldestory = function () {
    };
    this.getControlFile = function () {
    };
    this.startUpload = function () {
    };
    this.stopUpload = function () {
    };
    this.cancelUpload = function () {
    };
    this.resetUpload = function () {
        this.init();
        this.makeListControl();
    };
    this.makeListControl = function () {
        var list = jQuery('<ul id="basicAttachList" class="attach_list" style="display: none;">');
        var bigList = jQuery('<ul id="bigAttachList" class="file_wrap big_file" style="display: none;">');
        var lid = this.listId;
        setTimeout(function () {
            jQuery(lid).empty();
            jQuery(lid).append(list);
            jQuery(lid).append(bigList);
        }, 100);
    };

    this.makeListWebFolderControl = function () {
        var sefMainTable = jQuery('<table class="form_type"></table>');
        var sefMainTr = jQuery('<tr></tr>');
        var sefMainTd = jQuery('<td style="padding:0"></td>');
        var sefheaderTable = jQuery('<table id="basicAttachTitle" class="in_table form_mail004"></table>');
        var tableHead = jQuery('<thead></thead>');

        var swfTable_Tr1 = jQuery('<tr></tr>');
        swfTable_Tr1.append('<th class="checkbox"><input type="checkbox" id="basicAttachChkAll" onclick="checkAll(this,document.uploadForm.basicAttachFileEl)"/></th>');
        swfTable_Tr1.append('<th class="align_l filename">' + mailMsg.bigattach_list_001 + '</th>');
        swfTable_Tr1.append('<th class="align_l attachtype">' + mailMsg.webfolder_ext + '</th>');
        swfTable_Tr1.append('<th class="align_r filesize">' + mailMsg.bigattach_list_002 + '</th>');
        swfTable_Tr1.append('<th class="align_c" style="width:46px">' + mailMsg.comn_upload_status + '</th>');

        tableHead.append(swfTable_Tr1);
        sefheaderTable.append(tableHead);
        sefMainTd.append(sefheaderTable);
        sefMainTr.append(sefMainTd);
        sefMainTable.append(sefMainTr);

        var swfTable = jQuery('<div class="div_scroll" style="height:200px"><table id="basicAttachList" class="in_table form_mail004">');
        var lid = this.listId;
        setTimeout(function () {
            jQuery(lid).empty();
            jQuery(lid).append(sefMainTable);
            jQuery(lid).append(swfTable);
        }, 100);
    };

    this.addAttachList = function (fileObj) {
        _this.addAttachFile(fileObj);
        _this.updateAttachFile(fileObj);
        _this.updateAttachFileProgress(fileObj.id);
    };

    this.addAttachFile = function (fileObj) {
        var isHugeType = fileObj.type == "huge";
        var listElement =
            '<li id="' + fileObj.id + 'Low" data-index="' + fileObj.index + '" class="wrap_file">' +
            '<input type="checkbox" id="' + fileObj.id + '" name="basicAttachFileEl" style="display: none;" attsize="' + fileObj.size + '" atttype="' + (isHugeType ? 'huge' : 'normal') + '" />' +
            '<span class="file">' +
            '<span class="btn_wrap" onclick="deletefileById(\'' + fileObj.id + '\')">' +
            '<span id="' + fileObj.id + 'delBtn" data-id="' + fileObj.id + 'delBtn" class="ic_attach ic_del"></span>' +
            '</span>' +
            '<span class="ic_file ic_' + getFileTypeImage(fileObj.name) + '"></span>' +
            '<span class="name">' + escape_tag(fileObj.name) + '</span>' +
            drawPreviewDownloadIcon.call(this, fileObj) +
            '</span>' +
            '<span class="info">' +
            '<span class="etc">' +
            '<span class="gage_wrap" id="progress_' + fileObj.id + '" style="display: none;">' +
            '<span class="gage" style="width: 0%;"></span>' +
            '</span>' +
            '</span>' +
            '<span id="status_' + fileObj.id + '" class="status">' +
            '<span class="ic state_stay"></span>' +
            '</span>' +
            '<span class="kind">' +
            '<span class="' + (isHugeType ? 'state nude' : 'txt') + '">' +
            (isHugeType ? mailMsg.bigattach_11 : mailMsg.bigattach_10) +
            '</span>' +
            '</span>' +
            '<span class="size">' + printSize(fileObj.size) + '</span>' +
            '</span>' +
            '</li>';

        jQuery("#basicAttachList").show().append(listElement);

        showAttachBoxDisplay(true);

        function drawPreviewDownloadIcon(fileObj) {
            var itemInfo = [];
            itemInfo.push('<span class="attach_opt">');
            // 프리뷰 가능한 확장자이면 화면에 표시.
            if (acceptConverterMobile(getFileTypeImage(fileObj.name))) {
                var previewIcon = [
                    '<span class="btn_fn7" onclick="previewTempFile(\'' + fileObj.id + '\')"><span class="txt">' + mailMsg.mail_preview + '</span></span>&nbsp;'
                ];
                itemInfo.push(previewIcon);
            }
            // 다운로드는 default로 추가.
            var downloadIcon = [
                '<span class="btn_fn7" onclick="downloadTempFile(\'' + fileObj.id + '\')"><span class="txt">' + mailMsg.bigattach_09 + '</span></span>'
            ];
            itemInfo.push(downloadIcon);
            itemInfo.push('</span>');
            return itemInfo.join('');
        }

        function acceptConverterMobile(fileType) {
            fileType = fileType.toLowerCase();
            var acceptType = "doc|docx|hwp|ppt|pptx|xls|xlsx|pdf|txt|jpg|jpeg|gif|tif|tiff|png";
            var regExp = new RegExp("(" + acceptType + ")$", "i");
            if (regExp.test(fileType)) {
                return true;
            } else {
                return false;
            }
        }
    };
    this.updateAttachFileProgress = function (progressId, msg) {
        jQuery('[data-id="fileNameWrapper_' + progressId + '"]').show();
        jQuery("#progress_" + progressId).hide();
        jQuery("#status_" + progressId).html('<span class="ic state_complete"></span>');
    };
    this.updateAttachFile = function (fileObj) {
        var isHugeType = fileObj.type == "huge";
        if (isHugeType) {
            this.hugeFileList.put(fileObj.id, fileObj);
        } else {
            this.normalFileList.put(fileObj.id, fileObj);
        }
    };

    this.addAttachWebfolderList = function (fileObj) {
        var isHugeType = fileObj.type == "huge";
        var listElement =
            '<tr id="' + fileObj.id + 'Low" >';
        listElement +=
            '<td class="checkbox">' +
            '<input type="checkbox" id="' + fileObj.id + '" name="basicAttachFileEl" value="" attsize="' + fileObj.size + '" atttype="' + ((isHugeType) ? 'huge' : 'normal') + '">' +
            '<span class="btn_bdr" onclick="deletefileById(\'' + fileObj.id + '\')">' +
            '<span title="' + mailMsg.comn_del + '" class="ic_attach ic_del"></span>' +
            '</span>' +
            '</td>';
        listElement +=
            '<td class="align_l filename" title="' + escape_tag(fileObj.name) + '">' +
            '<span class="item_file file_wrap">' +
            '<span class="ic_file ic_' + getFileTypeImage(fileObj.name) + '"></span>' +
            '<span class="name">' + escape_tag(fileObj.name) + '</span>' +
            '</span>' +
            '</td>';
        listElement +=
            '<td class="align_c attachtype">' +
            '<span class="name">' + getFileTypeImage(fileObj.name) + '</span>' +
            '</td>';
        listElement +=
            '<td class="align_r filesize"><span class="size">' + printSize(fileObj.size) + '</span></td>';
        listElement +=
            '<td id="' + fileObj.id + 'TypeInfo" class="align_c" style="width:30px">' +
            '<span id="progress_' + fileObj.id + '" class="progressBar">' +
            '<span class="ic state_complete"></span>' +
            '</span>' +
            '</td>';
        listElement += '</tr>';

        if (isHugeType) {
            this.hugeFileList.put(fileObj.id, fileObj);
        } else {
            this.normalFileList.put(fileObj.id, fileObj);
        }
        jQuery("#basicAttachList").append(listElement);
    };

    this.getCheckAttachFileIds = function () {
        var checkIds = [];
        jQuery("/*#basicAttachList */input[name=basicAttachFileEl]:checked").each(function () {
            checkIds.push(jQuery(this).attr("id"));
        });

        return checkIds;
    };

    this.deleteAttachList = function (fid, e) {
        var type = jQuery("#" + fid).attr("atttype");
        var size = jQuery("#" + fid).attr("attsize");

        if (type == "huge") {
            this.hugeFileList.remove(fid);
            updateAttachQuota("hugeUse", this.quota.hugeUse - parseInt(size, 0));
        } else {
            this.normalFileList.remove(fid);
            updateAttachQuota("normalUse", this.quota.normalUse - parseInt(size, 0));
        }

        if (e) {
            jQuery(e.currentTarget).parents('#' + fid + 'Low').remove();
        } else {
            jQuery("#" + fid + "Low").remove();
        }
    };

    this.setAttachSize = function (type, size) {
        if (type == "hugeMax") this.quota.hugeMax = size;
        else if (type == "hugeUse") this.quota.hugeUse = size;
        else if (type == "normalMax") this.quota.normalMax = size;
        else if (type == "normalUse") this.quota.normalUse = size;
    };

    this.getAttachSize = function (type) {
        var size = 0;
        if (type == "hugeMax") size = this.quota.hugeMax;
        else if (type == "hugeUse") size = this.quota.hugeUse;
        else if (type == "normalMax") size = this.quota.normalMax;
        else if (type == "normalUse") size = this.quota.normalUse;
        return size;
    };
    this.getAttachQuotaInfo = function () {
        return this.quota;
    };
    this.getFileList = function (type) {
        if (type == "huge") return this.hugeFileList.getValues();
        else if (type == "normal") {
            return this.normalFileList.getValues();
        } else {
            return [];
        }
    };
    this.setFileList = function (type, fileList) {
        var nList = new HashMap();
        for (var i = 0; i < fileList.length; i++) {
            nList.put(fileList[i].id, fileList[i]);
        }
        if (type == "huge") this.hugeFileList = nList;
        else this.normalFileList = nList;
    };
    this.getAttachFileInfo = function (type, fid) {
        return (type == "huge") ? this.hugeFileList.get(fid) : this.normalFileList.get(fid);
    };
    this.setAttachFileInfo = function (type, fid, fObj) {
        if (type == "huge") this.hugeFileList.put(fid, fObj);
        else this.normalFileList.put(fid, fObj);
    };
    this.setUploadCompleteFile = function (fid, file) {
        var queueFile = this.hugeFileList.get(fid);
        if (queueFile) {
            queueFile.uid = file.uid;
            queueFile.path = file.filePath;
            this.hugeFileList.remove(fid);
            this.hugeFileList.put(fid, queueFile);
        } else {
            queueFile = this.normalFileList.get(fid);
            if (queueFile) {
                queueFile.uid = file.uid;
                queueFile.path = file.filePath;
                this.normalFileList.remove(fid);
                this.normalFileList.put(fid, queueFile);
            }
        }
    };
    this.setHugeUploadUse = function (val) {
        this.hugeMode = val;
    };
    this.getHugeUploadUse = function () {
        return this.hugeMode;
    };
    this.isHugeTypeFile = function (fid) {
        var hugeFile = this.hugeFileList.get(fid);
        return (hugeFile) ? true : false;
    };
    this.chageAttachType = function (fid) {

    };
    this.destroy = function () {
        if (this.listId) jQuery(this.listId).empty();
        this.quota = {"hugeMax": 0, "normalMax": 0, "hugeUse": 0, "normalUse": 0};
        if (this.normalFileList) this.normalFileList.destroy();
        if (this.hugeFileList) this.hugeFileList.destroy();
        if (this.queueFileList) this.queueFileList.destroy();
        this.uploadCompleteFile = [];
    };
    this.emptyFileList = function () {
        if (this.listId) jQuery(this.listId).empty();
    };
};

var SignSimpleSettingControl = function (opt) {
    this.opt = opt;

    this.makeBtnControl = function () {

    };
    this.destroy = function () {

    };
};

var MailSimpleInlineImgControl = function (opt) {
    this.opt = opt;

    this.makeBtnControl = function () {

    };
    this.destroy = function () {

    };
};
