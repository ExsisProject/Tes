var webfolderControl,historyControl,currentMenu;
var isOcxUploadDownModule = false;
var isOcxUpload = false;
var POPUPDATA = {};
var basicAttachUploadControl;
var WebfolderControl = function() {

    this.listFolderDataAction = "/api/webfolder/folder/tree";
    this.viewFolderAction = "/api/webfolder/folder/list";

    this.createFolderAction = "/api/webfolder/folder/create";
    this.renameFolderAction = "/api/webfolder/folder/rename";
    this.deleteFolderAction = "/api/webfolder/folder/delete";

    this.copyAndMoveFolderAction  = "/api/webfolder/folder/copymove";
    this.uploadFileAction = "/api/webfolder/file/create";
    this.searchUserAction = "/api/user/sort/list";

    // 폴더 공유
    this.sharedFolderAction = "/api/webfolder/folder/share";

    this.isMailAttachSearchAction = "/api/system/mailattachsearch";
    this.downloadFileAction = "/api/webfolder/file/download";

    this.listParam = {};

    this.attachSizeMax;
    this.currentPage;
    this.pageCount;
    this.loader;
    this.quotaInfo;
    this.groupSelect;
    this.currentFolder;
    this.auth;
    this.sharedUserList;
    this.sharedFolderUid;
    this.type;

    this.ESC_KEY = 27;
    this.ENTER_KEY = 13;
    var _this = this;

    this.loadWebfolderList = function () {
        ActionLoader.getSyncGoLoadAction(_this.listFolderDataAction, {"type": "user"}, function (data) {
            _this.printWebfolderList(data);
        }, "json");
    };
    this.loadShareWebfolderList = function () {
        ActionLoader.getSyncGoLoadAction(_this.listFolderDataAction, {"type": "share"}, function (data) {
            _this.printShareWebfolderList(data);
        }, "json");
    };
    this.loadPublicWebfolderList = function () {
        ActionLoader.getSyncGoLoadAction(_this.listFolderDataAction, {"type": "public"}, function (data) {
            _this.printPublicWebfolderList(data);
        }, "json");
    };
    this.printHeaderTitle= function (data){
        data.useOrg = useOrg;
        jQuery("#headerTitle").handlebars("webfoler_header_title_tmpl", data);
    };
    this.makeNavigation = function(data) {
        jQuery("#webfolderListFooter").html('');
        data.pageInfo.out = true;
        if (data.total > data.pageBase) {
            jQuery("#webfolderListFooter").handlebars("webfolder_navi_tmpl", data);
        }
    };
    this.printWebfolderList = function (data) {
        if (data.resultType == "removeFolder") {
            _this.groupSelect = getHandlebarsTemplate("webfoler_select_folder_popup_tmpl", data);
        } else {
            _this.groupSelect = getHandlebarsTemplate("webfoler_select_folder_popup_tmpl", data);
            jQuery("#webFolderList").handlebars("webfoler_left_tmpl", data);
            jQuery("#webFolderList").find("ul").hide();
        }
    };
    this.printPublicWebfolderList = function (data) {
        if (data.resultType == "removeFolder") {
            _this.groupSelect += getHandlebarsTemplate("webfoler_select_folder_popup_tmpl", data);
        } else {
            _this.groupSelect += getHandlebarsTemplate("webfoler_select_folder_popup_tmpl", data);
            jQuery("#publicWebFolderList").handlebars("webfoler_left_tmpl", data);
            jQuery("#publicWebFolderList").find("ul").hide();
        }
    };
    this.printShareWebfolderList = function (data) {
        if (data.resultType == "removeFolder") {
            if (data.webfolder != null) {
                _this.groupSelect += getHandlebarsTemplate("webfoler_select_folder_share_popup_tmpl", data);
            }
        } else {
            if (data.webfolder != null) {
                _this.groupSelect += getHandlebarsTemplate("webfoler_select_folder_share_popup_tmpl", data);
            }
            jQuery("#webShareFolderList").handlebars("webfoler_share_left_tmpl", data);
            jQuery("#webShareFolderList").find("ul").hide();
        }
    };
    this.loadViewWebFolder = function(param){

        if (!param) {
            var val = jQuery("#webfolder_list_offset option:selected").val();
            param = {"path": "/", "fullPath": "/", "currentPage": "1", "offset": val};
        }
        setDownloadButtonAttr(param);
        _this.listParam = param;
        var searchType = jQuery("#searchType").val();

        if (searchType === "appSearch") {
            ActionLoader.getGoLoadAction(_this.viewFolderAction, _this.listParam, _this.printViewfolder, "json");
            google.sendPageView(_this.viewFolderAction);
        }

        if (searchType === "totalSearch") {
            window.top.window.location = "/app/" + (isMsie8 ? "#" : "") + "unified/search?stype=simple&searchTerm=all&offset=5&page=0&keyword=" + encodeURIComponent(param.keyWord);
            jQuery("#searchType").val('appSearch');
            jQuery("#webfolderInput").val('');
        }

        function setDownloadButtonAttr(param) {

            var $totalDownload = jQuery("#totalDownload");
            var $currentDownload = jQuery("#currentDownload");

            $totalDownload.removeAttr("fullPath path sroot type userSeq sharedUserSeq");
            $currentDownload.removeAttr("fullPath path sroot type userSeq sharedUserSeq");

            $totalDownload.attr("fullPath", param.fullPath);
            $totalDownload.attr("path", param.path);
            $totalDownload.attr("sroot", param.sroot);
            $totalDownload.attr("type", param.type);
            $totalDownload.attr("userSeq", param.userSeq);
            $totalDownload.attr("sharedUserSeq", param.userSeq);

            $currentDownload.attr("fullPath", param.fullPath);
            $currentDownload.attr("path", param.path);
            $currentDownload.attr("sroot", param.sroot);
            $currentDownload.attr("type", param.type);
            $currentDownload.attr("userSeq", param.userSeq);
            $currentDownload.attr("sharedUserSeq", param.userSeq);
        }
    };
    this.printPage = function (data) {
        jQuery("#webfolderPaging").handlebars("webfoler_tail_paging_tmpl", data);
    };
    this.titleOn = function (data) {
        if (!data.isRoot || data.type != "user") {
            jQuery("#webfolderLeft p").removeClass("on");
            var webFolderId = data.type + (replaceAll(data.realPath, ".", "-"));
            jQuery(document.getElementById(webFolderId)).addClass("on");
        } else {
            jQuery("#webfolderLeft p").removeClass("on");
        }
    };
    this.setSharedUserInfo = function (data){
        if (data.sharedUserCount && (data.sharedUserCount > 0)) {
            _this.sharedUserList = data.sharedUserList;
            _this.sharedFolderUid = data.fid;
        } else {
            _this.sharedUserList = "";
        }
        _this.sharedUserSeq = data.userSeq;
    };
    this.authCheck = function (data){

        _this.auth = data.folderAuth;
        var toolbar = jQuery("#toolbar a");

        if (_this.auth == "W") {
            toolbar.removeClass("disable");
            toolbar.each(function () {
                jQuery(this).show();
            });
        }

        if (_this.auth === "R" && (data.type === "share" || data.type === "public")) {
            _this.showDefaultMenus();
        }
    };
    this.printViewfolder = function (data){
        _this.titleOn(data);
        _this.setSharedUserInfo(data);
        _this.currentFolder=data.path;
        _this.quotaInfoTitle(data);
        _this.printHeaderTitle(data);
        _this.makeNavigation(data);
        _this.attachSizeMax  = data.attachMaxSize;
        _this.authCheck(data);
        _this.type = data.type;
        data.useOrg = useOrg;
        _this.printWebfolderListPage(data);
        EXCLUDE_EXTENSION = data.excludeExtension;
    };
    this.movePage = function(page){
        var val = jQuery("#webfolder_list_offset option:selected").val();
        var param = _this.listParam;
        param.offset = val;
        _this.currentPage = page;
        param.currentPage = _this.currentPage;
        ActionLoader.getGoLoadAction(_this.viewFolderAction, param, function (data) {
            _this.makeNavigation(data);
            _this.printWebfolderListPage(data);
        }, "json");
    };
    this.printWebfolderListPage = function(data){
        jQuery("#viewFolder").handlebars("webfoler_view_tmpl", data);
    };
    this.quotaInfoTitle = function (data) {
        _this.quotaInfo = data.quotaInfo;
        MAX_QUOTA_SIZE = data.quotaInfo.max;
        if (data.quotaUsagePercent > 100) {
            data.quotaUsagePercent = 100;
        }
        jQuery("#quotaInfo").handlebars("webfoler_left_quot_tmpl", data);
    };
    this.getQuotaInfo = function (data) {
        _this.quotaInfo = data.quotaInfo;
        jQuery("#webfolderFilePopup #quotaWrap").html(getHandlebarsTemplate("webfolder_file_popup_tmpl", _this.quotaInfo));
    };
    this.createFolder = function (param){
        ActionLoader.postGoJsonLoadAction(_this.createFolderAction, param, function(data){
            jQuery.goSlideMessage(mailMsg.webfolder_create_info);
            _this.successResult();
            jQuery("#createFolderWrap").hide();
            jQuery("#folderNameError").hide();
            jQuery("#fNameInput").val("");
        }, "json", function(data) {
            jQuery("#folderNameError").show();
        });
    };
    this.editFolder  = function (param){
        ActionLoader.postSyncGoJsonLoadAction(_this.renameFolderAction, param, function(data) {
            jQuery.goSlideMessage(mailMsg.save_ok);
            _this.successResult();
        }, "json", function(data) {
            _this.failResult(data);
        });
    };
    this.removeFolder = function (param){
        ActionLoader.postSyncGoJsonLoadAction(_this.deleteFolderAction, param, function(data) {
            jQuery.goSlideMessage(mailMsg.del_ok);
            _this.successResult("removeFolder");
        }, "json", function(data) {
            _this.failResult(data);
        });
    };

    this.successResult = function(resultType) {
        if (resultType === "removeFolder") {
            _this.loadWebfolderList("removeFolder");
            _this.loadShareWebfolderList("removeFolder");
            _this.loadPublicWebfolderList("removeFolder");
        } else {
            _this.loadWebfolderList();
            _this.loadShareWebfolderList();
            _this.loadPublicWebfolderList();
        }

        if (_this.listParam) {
            _this.listParam.currentPage = 1;
        }
        _this.loadViewWebFolder(_this.listParam);
    };
    this.failResult = function(data) {
        var message = mailMsg.webfolder_move_and_copy_fail_title;
        if(data.message){
            message = data.message;
        }
        jQuery.goSlideMessage(message,"caution");
    };

    this.isMailAttachSearch = function() {
        var attachSearch = false;
        ActionLoader.getSyncGoLoadAction(this.isMailAttachSearchAction,null,function(data) {
            attachSearch = data;
        },"json");
        return attachSearch;
    };
    this.uploadResult = function(data){
        jQuery.goSlideMessage(mailMsg.webfolder_create_info);
        removeProcessLoader();
        _this.loadWebfolderList();
        _this.loadShareWebfolderList();
        _this.loadPublicWebfolderList();
        if (_this.listParam) {
            _this.listParam.currentPage = 1
        }
        _this.loadViewWebFolder(_this.listParam);
    };
    this.fileUpload = function (attr){
        var param = {};
        var selectedItem = jQuery("#selectFolderListAll :selected");
        var type = selectedItem.attr("type");
        var sroot = selectedItem.attr("sroot");
        var userSeq = selectedItem.attr("user-seq");
        var path = selectedItem.attr("real-path");
        if(userSeq) param.sharedUserSeq = userSeq;
        if(sroot) param.sroot = sroot;

        param.type = type;
        param.path = path;
        param.attachList = attr;

        if(basicAttachUploadControl) {
            basicAttachUploadControl.stopUpload();
            basicAttachUploadControl.cancelUpload();
            basicAttachUploadControl.destroy();
        }
        if(isOcxUploadDownModule){
            deleteOcxFileAll();
            isOcxUploadDownModule = false;
        }
        jQuery("#webfolderFilePopup").off("click","a,span");
        jQuery("#webfolderFilePopup").remove();

        makeProcessLoader();
        ActionLoader.postGoJsonLoadAction(_this.uploadFileAction,param,_this.uploadResult,"json", function(result) {
            removeProcessLoader();
            jQuery.goSlideMessage(result.message,"caution");
        });
        google.sendPageView(_this.uploadFileAction);
    };
    this.makeLeftEvent = function (){
        jQuery("#webfolderLeft").on("click","a,span", function(event) {
            event.preventDefault();
            var eventType = jQuery(this).attr("evt-rol");
            if (eventType == "webfolder-home") {
                window.top.window.location = '/app/webfolder';

            } else if (eventType == "viewFolderLeft") {
                var param = {};
                var realPath = jQuery(this).attr("real-path");
                var type = jQuery(this).attr("type");

                jQuery("#createFolderWrap").hide();

                if (type == "share") {
                    var userSeq = jQuery(this).attr("user-seq");
                    var sroot = jQuery(this).attr("sroot");
                    param.sroot = sroot;
                    param.userSeq = userSeq;
                }
                param.fullPath = realPath;
                param.type = type;

                goFolder(param);
            } else if (eventType == "toggleFolder") {
                toggleWebfolderList(jQuery(this).attr("type"));
            }else if(eventType=="uploadFileView"){
                var max = _this.quotaInfo.max;
                if (max <= 0) {
                    jQuery.goAlert(mailMsg.error_fullquota);
                    return;
                }
                jQuery("body").append(getHandlebarsTemplate("file_upload"));
                jQuery("#webfolderFilePopup #quotaWrap").html(getHandlebarsTemplate("webfolder_file_popup_tmpl", _this.quotaInfo));
                jQuery("#webfolderFilePopup #selectFolderListAll").append(_this.groupSelect);
                var folderType = !_this.listParam.type ? "user" : _this.listParam.type;
                var fullPath = _this.listParam.fullPath;
                var isSelected = false;
                jQuery("#selectFolderListAll ." + folderType).each(function () {
                    var path = jQuery(this).attr("real-path");
                    if (fullPath == path) {
                        jQuery(this).attr("selected", true);
                        isSelected = true;
                    }
                });
                jQuery("#webfolderFilePopup #selectFolderListAll").change(function () {

                    var param = {};
                    param.type = jQuery(this).children("option:selected").attr("type");
                    param.fullPath = jQuery(this).children("option:selected").attr("real-path");
                    param.sroot = jQuery(this).children("option:selected").attr("sroot");
                    param.userSeq = jQuery(this).children("option:selected").attr("user-seq");
                    ActionLoader.getGoLoadAction(_this.viewFolderAction, param, _this.getQuotaInfo, "json");
                });

                if (!isSelected) {
                    jQuery("#selectFolderListAll ." + folderType + ":eq(0)").attr("selected", true);
                }

                MAX_ATTACH_SIZE = _this.attachSizeMax;
                var basicControlOpt = {
                    controlType: "normal",
                    btnId: "basicUploadControl",
                    btnCid: "basicUploadBtn",
                    formName: "theFile",
                    param: {"uploadApp": "webfolder", "uploadType": "flash", "email": USEREMAIL},
                    url: "/api/webfolder/file/upload",
                    maxFileSize: _this.attachSizeMax * 1024 * 1024,
                    fileType: "*.*",
                    locale: LOCALE,
                    btnText: mailMsg.button_upload,
                    debug: false,
                    autoStart: false,
                    handler: basicUploadListeners,
                    listId: "basicUploadAttachList",
                    startUploadFunc: startUploadAttach,
                    webfolder: true,
                    width: (LOCALE == "jp" ? 80 : 73),
                    btnStyle: ".buttonText { color:#656565;font-size:12px;}"
                };

                if (hasFlashPlayer()) {
                    basicAttachUploadControl = new UploadBasicControl(basicControlOpt);
                } else {
                    basicAttachUploadControl = new UploadSimpleBasicControl(basicControlOpt);
                }

                if (isMsie && !isMsie9) {
                    jQuery("#chgAttachModeWrap").show();
                }

                isMsie9 ? chgAttachMod('ocx') : chgAttachMod('simple');


                jQuery("#webfolderFilePopup").on("click","a,span", function(event) {

                    var eventType = jQuery(this).attr("evt-rol");

                    if (eventType == "selectSendFile") {
                        eventType == null;
                        return;
                    }
                    event.preventDefault();
                    if (eventType == "removeAttachFileList") {
                        deletefile();
                    } else if (eventType == "closeUploadFileWrap") {
                        if (basicAttachUploadControl) {
                            basicAttachUploadControl.stopUpload();
                            basicAttachUploadControl.cancelUpload();
                            basicAttachUploadControl.destroy();
                        }
                        jQuery("#webfolderFilePopup").off("click", "a,span");
                        removeProcessLoader();
                        if (isOcxUploadDownModule) {
                            deleteOcxFileAll();
                            isOcxUploadDownModule = false;
                        }
                        jQuery("#webfolderFilePopup").remove();
                    } else if (eventType == "sendFile") {
                        var selectedItem = jQuery("#selectFolderListAll :selected");

                        if (!selectedItem.attr("real-path")) {
                            jQuery.goAlert(mailMsg.alert_notargetfolder);
                            return;
                        }
                        if (selectedItem.attr("auth") == "R") {
                            jQuery.goAlert(mailMsg.no_right_folder_message);
                            return;
                        }
                        if (!startUploadAttach()) {
                            return;
                        }
                        jQuery("#webfolderFilePopup .btn_major_s .txt").text(mailMsg.file_upload_send_progress_title);
                    }
                });
                makeProcessLoader('mask');
                jQuery("#webfolderFilePopup").draggable();
            } else if (eventType == "toggle-webfolder") {
                var status = jQuery(this).attr("status");
                var currentDepth = jQuery(this).closest("li").attr("depth");
                currentDepth = parseInt(currentDepth, 10);
                var childObj = jQuery(this).closest("li").find("ul[depth='" + (currentDepth + 1) + "']");
                if (status == "open") {
                    childObj.hide();
                    jQuery(this).removeClass("close").addClass("open").attr({
                        "status": "close",
                        "title": mailMsg.comn_open
                    });
                } else {
                    childObj.show();
                    jQuery(this).removeClass("open").addClass("close").attr({
                        "status": "open",
                        "title": mailMsg.comn_close
                    });
                }
            }
        });
    };
    this.makeContentEvent = function (){

        function downloadFilesBy(dateParams) {
            jQuery.fileDownload(_this.downloadFileAction, {
                httpMethod: "GET",
                data: dateParams,
                prepareCallback: function () {
                    makeProcessLoader();
                },
                successCallback: function () {
                    removeProcessLoader();
                },
                failCallback: function () {
                    removeProcessLoader();
                }
            });
        }
        var menuEvent = jQuery("#webFolderContent");
        menuEvent.on("change", "#webfolder_list_offset", function (event) {
            _this.listParam.offset = jQuery("#webfolder_list_offset option:selected").val();
            _this.listParam.currentPage = 1;
            ActionLoader.getGoLoadAction(_this.viewFolderAction, _this.listParam, _this.printViewfolder, "json");
        });
        menuEvent.on("click", "#pageNaviWrap a", function (event) {
            var page = jQuery(event.target).attr("page");
            _this.movePage(page);
        });
        menuEvent.on("click", "a,span,li", function (event) {
            var eventType = jQuery(this).attr("evt-rol");
            if (eventType === undefined || !eventType) {
                return;
            }
            event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
            event.preventDefault();

            if (eventType == "downloadFile") {

                var dataParams = {
                    uids: [jQuery(this).closest("tr").attr("uid")],
                    type: jQuery(this).closest("tr").attr("type"),
                    path: jQuery(this).closest("tr").attr("path"),
                    sroot: jQuery(this).closest("tr").attr("sroot"),
                    sharedUserSeq: jQuery(this).closest("tr").attr("userSeq")
                };

                downloadFilesBy(dataParams);

                google.sendPageView(_this.downloadFileAction);

            } else if (eventType == "previewFile") {

                var param = {};
                param.uid = jQuery(this).closest("tr").attr("uid");
                param.type = jQuery(this).closest("tr").attr("type");
                param.path = jQuery(this).closest("tr").attr("path");
                param.sroot = jQuery(this).closest("tr").attr("sroot");
                param.sharedUserSeq = jQuery(this).closest("tr").attr("userSeq");

                previewFile(param);

            } else if (eventType == "viewFolder") {
                var param = {};
                var type = jQuery(this).parent().parent().attr("type");
                if (type == "share") {
                    param.sroot = jQuery(this).parent().parent().attr("sroot");
                    param.userSeq = jQuery(this).parent().parent().attr("user-seq");
                }
                param.fullPath = jQuery(this).parent().parent().attr("real-path");
                param.nodeNum = jQuery(this).parent().parent().attr("node-number");
                param.type = type;
                param.offset = jQuery("#webfolder_list_offset option:selected").val();

                goFolder(param);

            } else if (eventType == "preFolder") {
                var nodeId = jQuery(this).attr("node-num");
                if (nodeId.length > 1) {
                    nodeId = nodeId.substr(0, nodeId.lastIndexOf("|"));
                    nodeId = nodeId.substr(0, nodeId.lastIndexOf("|") + 1);
                }
                var param = {};
                param.type = jQuery(this).attr("type");
                if (param.type == "share") {
                    param.sroot = jQuery(this).attr("sroot");
                    param.userSeq = jQuery(this).attr("user-seq");
                }
                param.fullPath = jQuery(this).attr("ppath");
                param.nodeNum = jQuery(this).attr("node-num");
                param.offset = jQuery("#webfolder_list_offset option:selected").val();

                goFolder(param);
            } else if (eventType == "createFolderView") {

                if (jQuery(this).hasClass("disable")) return

                jQuery("#createFolderWrap").show();

            } else if (eventType == "cancelCreateFolder") {
                jQuery("#createFolderWrap").hide();
                jQuery("#folderNameError").hide();
                jQuery("#fNameInput").val("");
            } else if (eventType == "createFolder") {
                var param = clone(_this.listParam);

                var folders = param.fullPath.split(".");
                if (folders.length >= 6) {
                    jQuery.goMessage(mailMsg.alert_maxdepth);
                    return;
                }
                if (!validateInputValue(jQuery("#fNameInput"), 2, 32, "folderName")) {
                    return;
                }
                param.path = param.fullPath;
                param.folderName = jQuery("#fNameInput").val();
                _this.createFolder(param);

            } else if (eventType == "editFolderView") {

                var folderName = jQuery(this).prev().text();
                var templateData = {folderName: folderName};
                jQuery(this).parent().html(getHandlebarsTemplate("webfoler_edit_folder_tmpl", templateData));
                jQuery("#rfName").keydown(function (keyEvent) {

                    if (keyEvent.which == _this.ENTER_KEY) {
                        _this.editFolderInput(jQuery(this));
                        keyEvent.preventDefault();
                    }

                    if (keyEvent.which == _this.ESC_KEY) {
                        _this.editFolderCancel(jQuery(this));
                        keyEvent.preventDefault();
                    }
                });
            } else if (eventType === "editFolder") {
                _this.editFolderInput(jQuery(this));
            } else if (eventType === "editFolderViewCancel") {
                _this.editFolderCancel(jQuery(this));
            } else if (eventType === "removeFolder") {

                if (jQuery(this).hasClass("disable")) return;

                var param = _this.listParam;
                var isChild;
                var isShare;
                var isShareType;
                var fids = jQuery('#viewFolder input:checkbox:checked').map(function () {
                    var fid = jQuery(this).parent().parent().attr("fid");
                    if (!fid) return;
                    return fid;
                }).get();

                jQuery('#viewFolder input:checkbox:checked').each(function () {
                    // child 폴더가 있는지
                    if (jQuery(this).parent().parent().attr("isChild") == "true") {
                        isChild = true;
                    }
                    // 공유한 사용자가 있는지
                    if (jQuery(this).parent().parent().attr("isShare") == "true") {
                        isShare = true;
                    }
                });

                if (isChild) {
                    jQuery.goMessage(mailMsg.share_alert_003);
                    return;
                }
                if (isShare) {
                    jQuery.goMessage(mailMsg.share_alert_004);
                    return;
                }
                var uids = jQuery('#viewFolder input:checkbox:checked').map(function () {
                    var uid = jQuery(this).parent().parent().attr("uid");
                    if (!uid) return;
                    return uid;
                }).get();

                if (fids.length == 0 && uids.length == 0) {
                    jQuery.goMessage(mailMsg.no_select);
                    return;
                }

                param.fids = fids;
                param.uids = uids;
                jQuery.goConfirm(mailMsg.webfolder_delete, mailMsg.alert_remove, function () {
                    _this.removeFolder(param);
                    jQuery(".title.on").parent().find("li p a[title=" + fids + "]").parent().parent().parent().remove();
                    if (jQuery(".title.on").parent().find("ul").length == 0) {
                        jQuery(".title.on span.close").remove();
                    }
                });
            } else if (eventType == "copyFolder") {
                if (jQuery(this).hasClass("disable")) return;

                // 공유받은 폴더 인지
                var checkedBox = jQuery('#viewFolder input:checkbox:checked');
                var isSharedType = _.any(checkedBox, function(a){
                    return jQuery(a).parent().attr("type") == "share"
                });

                if (isSharedType) {
                    jQuery.goMessage(mailMsg.webfolder_no_action_info);
                    return;
                }

                var param = {};
                var fids = jQuery('#viewFolder input:checkbox:checked').map(function () {
                    var fid = jQuery(this).parent().parent().attr("fid");
                    if (!fid) return;
                    return fid;
                }).get();

                var uids = jQuery('#viewFolder input:checkbox:checked').map(function () {
                    var uid = jQuery(this).parent().parent().attr("uid");
                    if (!uid) return;
                    return uid;
                }).get();

                if (fids.length == 0 && uids.length == 0) {
                    jQuery.goMessage(mailMsg.no_select);
                    return;
                }

                _this.showSelectFolderPopup("copy");

            } else if (eventType == "moveFolder") {
                if (jQuery(this).hasClass("disable")) return;

                var checkedBoxes = jQuery('#viewFolder input:checkbox:checked');
                if (checkedBoxesAttrEqualsKeyValueAndTargetValue(checkedBoxes, "isChild", "true")) {
                    jQuery.goMessage(mailMsg.share_alert_003);
                    return;
                }
                if (checkedBoxesAttrEqualsKeyValueAndTargetValue(checkedBoxes, "isShare", "true")) {
                    jQuery.goMessage(mailMsg.share_alert_004);
                    return;
                }
                if (checkedBoxesAttrEqualsKeyValueAndTargetValue(checkedBoxes, "type", "share")) {
                    jQuery.goMessage(mailMsg.webfolder_no_action_info);
                    return;
                }

                var fids = checkedBoxes.map(function () {
                    var fid = jQuery(this).parent().parent().attr("fid");
                    if (!fid) return;
                    return fid;
                }).get();

                var uids = checkedBoxes.map(function () {
                    var uid = jQuery(this).parent().parent().attr("uid");
                    if (!uid) return;
                    return uid;
                }).get();

                if (checkedNone(fids, uids)) {
                    jQuery.goMessage(mailMsg.no_select);
                    return;
                }

                _this.showSelectFolderPopup("move");

                function checkedNone(fids, uids) {
                    return fids.length == 0 && uids.length == 0
                }

                function checkedBoxesAttrEqualsKeyValueAndTargetValue(elements, key, targetValue) {
                    return _.any(elements, function (a) {
                        return jQuery(a).parent().attr(key) === targetValue
                    });
                }

            } else if (eventType == "sendMail") {

                if (jQuery(this).hasClass("disable")) return;

                var fids = jQuery('#viewFolder input:checkbox:checked').map(function () {
                    var fid = jQuery(this).parent().parent().attr("fid");
                    if (!fid) return;
                    return fid;
                }).get();

                var uids = jQuery('#viewFolder input:checkbox:checked').map(function () {
                    var uid = jQuery(this).parent().parent().attr("uid");
                    if (!uid) return;
                    return uid + "|";
                }).get().join('');

                if (fids.length == 0 && uids.length == 0) {
                    jQuery.goMessage(mailMsg.no_select);
                    return;
                }

                if (fids.length > 0 && uids.length >= 0) {
                    jQuery.goMessage(mailMsg.not_only_select_file);
                    return;
                }
                var param = {};
                param.wtype = "webfolder";
                param.folder = _this.currentFolder;
                param.wfolderType = _this.type;
                param.wuid = uids;
                param.wfolderShareSeq = _this.sharedUserSeq || 0;
                param.work = "write";

                var data = {"dataType": "sendMailForWebfolder"};

                var url = BASEURL + "app/mail/popup/process?" + jQuery.param(param) + "&data=" + encodeURIComponent(JSON.stringify(data));
                window.open(url, "webfolderWrite", "scrollbars=yes,resizable=yes,width=1280,height=790");

            } else if (eventType == "sortFolderList") {

                var param = _this.listParam;
                if (param.currentPage != 1) {
                    param.currentPage = 1;
                }
                param.sortby = jQuery(this).attr("sort-data");
                var sortDirClass = jQuery(this).parent().attr("class");
                param.sortDir = sortDirClass.indexOf("asc") > -1 ? "desc" : "asc";
                goFolder(param);

            } else if (eventType == "downloadFolderList") {

                if (jQuery(this).hasClass("disable")) {
                    return;
                }

                var checkedBoxes = jQuery('#viewFolder input:checkbox:checked');

                _.forEach(checkedBoxes, function (e) {
                    var element = jQuery(e);

                    if (_.isUndefined(element.attr('folder-type'))) {
                        return;
                    }

                    var param = {};
                    param.fullPath = element.attr('real-path');
                    param.path = param.fullPath.substring(14);
                    param.type = element.attr('folder-type');
                    param.nodeNum = element.attr('nodeNum');

                    ActionLoader.getGoLoadAction(_this.viewFolderAction, param, _this.downloadFolders, "json");
                });


                var uids = checkedBoxes.map(function () {
                    var uid = jQuery(this).parent().parent().attr("uid");
                    if (!uid) return;
                    return uid;
                }).get();

                var downloadParams = {
                    uids: uids,
                    type: jQuery(this).attr("type") || _this.listParam.type || 'user',
                    path: jQuery(this).attr("path") || _this.listParam.path || '/',
                    sroot: _this.listParam.sroot || '',
                    sharedUserSeq: _this.listParam.userSeq || 0
                };

                downloadFilesBy(downloadParams);
                google.sendPageView(_this.downloadFileAction);

            } else if (eventType == "movePage") {
                _this.listParam.currentPage = jQuery(this).attr("page");
                goFolder(_this.listParam);

            } else if (eventType == "showShareFolderList") {

                var param = {};
                param.fullPath = jQuery(this).parent().parent().attr("real-path");
                param.nodeNum = jQuery(this).parent().parent().attr("node-number");
                param.type = jQuery(this).parent().parent().attr("type");
                if (param.fullPath) {
                    param.path = param.fullPath.substring(14);
                }

                ActionLoader.getGoLoadAction(_this.viewFolderAction, param, _this.setSharedValue, "json");

            } else if (eventType === "listDownload") {
                jQuery("#list_download").toggle('fast');

            } else if (eventType === "currentDownload") {
                jQuery("#list_download").toggle('fast');
                var checkboxes = jQuery("input[evt-rol='list-select']");
                var $currentDownload = jQuery(this);

                var data = {};

                var folders = _.map(checkboxes, function (element) {
                    var $checkbox = jQuery(element);
                    if (_.isUndefined($checkbox.attr('folder-type'))) {
                        return;
                    }
                    var param = {};
                    param.fullPath = $checkbox.attr('real-path');
                    param.path = param.fullPath.substring(14);
                    param.type = $checkbox.attr('folder-type');
                    param.nodeNum = $checkbox.attr('nodeNum');
                    return param;
                });

                data.folders = _.filter(folders, function (folder) {
                    return !_.isUndefined(folder)
                });

                var uids = _.map(checkboxes, function (element) {
                    var $checkbox = jQuery(element);
                    var uid = $checkbox.parent().parent().attr("uid");
                    if (!uid) return;
                    return {id: uid};
                });

                uids = _.filter(uids, function (uid) {
                    return !_.isUndefined(uid)
                });

                data.messages = uids;
                data.type = $currentDownload.attr("type");
                data.fullpath = $currentDownload.attr("fullpath");
                data.path = $currentDownload.attr("path");
                data.sroot = $currentDownload.attr("sroot");
                data.useseq = $currentDownload.attr("userseq");
                data.sharedUserSeq = $currentDownload.attr("sharedUserSeq");
                _this.downloadFolders(data);

            } else if (eventType === "totalDownload"){
                jQuery("#list_download").toggle('fast');
                param = {"path": "/", "fullPath": "/", "currentPage": "1", "offset": "99999"};

                var $totalDownload = jQuery("#totalDownload");
                param.fullpath = $totalDownload.attr("fullPath");
                param.path = $totalDownload.attr("path");
                param.sroot = $totalDownload.attr("sroot");
                param.type = $totalDownload.attr("type");
                param.userSeq = $totalDownload.attr("userSeq");
                param.sharedUserSeq = $totalDownload.attr("sharedUserSeq");

                ActionLoader.getGoLoadAction(_this.viewFolderAction, param, _this.downloadFolders, "json");
            }
        });
        menuEvent.on("click", "input", function (event) {
            var eventType = jQuery(this).attr("evt-rol");

            if (eventType == "list-select-all") {
                var checked = jQuery(this).attr("checked");
                var checkbox = jQuery("#viewFolder input:checkbox");
                checked ? checkbox.attr("checked", true) : checkbox.attr("checked", false);
            }

            jQuery("#toolbar a").each(function () {
                var toolbarType = jQuery(this).attr("evt-rol");
                if (toolbarType == "createFolderView") {
                    return;
                }
                jQuery(this).removeClass("disable");
                jQuery(this).hide();
            });

            _this.showDefaultMenus();
        });
        jQuery("#headerTitle").on("click","a[evt-rol='showShareFolderList']", function(event) {
            event.preventDefault();
            var param = {};
            var realPath = jQuery(this).attr("real-path");
            var type = jQuery(this).parent().parent().attr("type");
            param.fullPath = realPath;
            param.type = type;
            if (param.fullPath) {
                param.path = param.fullPath.substring(14);
            }
            ActionLoader.getGoLoadAction(_this.viewFolderAction, param, _this.setSharedValue, "json");
        });
        jQuery("#createFolderWrap").on("keypress","input[evt-rol='fNameInput']", function(event) {

            var folderNameInput = jQuery("#fNameInput");
            if (event.keyCode === _this.ESC_KEY) {
                jQuery("#createFolderWrap").hide();
                jQuery("#folderNameError").hide();
                folderNameInput.val("");
                event.preventDefault();
            }

            if (event.keyCode === _this.ENTER_KEY) {
                var param = clone(_this.listParam);

                var folders = param.fullPath.split(".");
                if (folders.length >= 6) {
                    jQuery.goMessage(mailMsg.alert_maxdepth);
                    return;
                }

                if (!validateInputValue(folderNameInput, 2, 32, "folderName")) {
                    return;
                }

                param.path = param.fullPath;
                param.folderName = folderNameInput.val();
                _this.createFolder(param);
                event.preventDefault();
            }
        });
    };
    this.downloadFolders = function (data) {

        if (data.messages.length > 0){
            _this.downloadFiles(data);
        }

        if (data.folders.length <= 0){
            return;
        }

        var folders = data.folders;
        var type = data.type;
        for (var i = 0; i < folders.length; i++) {
            var fullPath = folders[i].realPath || folders[i].fullPath;
            var path = fullPath.substring(14);
            var nodeNum = folders[i].nodeNum;

            var param = {};
            param.fullPath = fullPath;
            param.path = path;
            param.type = type;
            param.nodeNum = nodeNum;
        }
        ActionLoader.getGoLoadAction(_this.viewFolderAction, param, _this.downloadFolders, "json");

    };
    this.showDefaultMenus = function () {
        jQuery("#toolbar a").each(function () {
            var toolbarType = jQuery(this).attr("evt-rol");

            jQuery(this).hide();
            var fids = jQuery("#viewFolder input:checkbox:checked").map(function () {
                var fid = jQuery(this).attr('folder-type');
                if (!fid) return;
                return fid;
            }).get();

            if (fids.length > 0) {

                if (toolbarType === "downloadFolderList"
                    || toolbarType === "sendMail"
                    || toolbarType === "copyFolder"
                    || toolbarType === "listDownload") {
                    jQuery(this).show();
                    jQuery('#sendMailButton').addClass("disabled");
                }

            } else {

                if (toolbarType === "downloadFolderList"
                    || toolbarType === "sendMail"
                    || toolbarType === "copyFolder"
                    || toolbarType === "listDownload") {
                    jQuery(this).show();
                    jQuery('#sendMailButton').removeClass("disabled");
                }
            }

            if (_this.auth == "W") {
                jQuery(this).show();
            }
        });
    };
    this.editFolderCancel = function (target) {
        var folderName = jQuery("#rfName").attr("folder-name");
        var $parentTd = target.closest("td");
        var type = $parentTd.attr("type");
        var realPath = $parentTd.attr("real-path");
        var nodeNumber = $parentTd.attr("node-number");
        var sharedUserCount = $parentTd.attr("shared-user-count");

        var data = {};
        data.folderName = folderName;
        data.type = type;
        data.realPath = realPath;
        data.nodeNumber = nodeNumber;
        data.useOrg = useOrg;
        data.sharedUserCount = sharedUserCount;

        var html = getHandlebarsTemplate("webfolder_edit_tmpl", data);
        $parentTd.html(html);
    };
    this.editFolderInput = function (target) {
        var param = _this.listParam;
        var rfName = jQuery("#rfName");
        if (!validateInputValue(rfName, 2, 32, "folderName")) return;
        if (rfName.val() === rfName.attr("folder-name")) {
            _this.editFolderCancel(target);
            return;
        }
        param.folderName = rfName.attr("folder-name");
        param.rfName = rfName.val();
        _this.editFolder(param);
    };
    this.makeSearchEvent = function () {
        var searchEvent = jQuery("#webfolderSearch");
        searchEvent.on("keypress", "input[evt-rol='webfolderInput']", function (event) {
            if (event.keyCode == _this.ENTER_KEY) {
                var searchKeyword = jQuery("#webfolderInput");
                if (jQuery("#webfolderInput").hasClass("placeholder") || jQuery.trim(jQuery("#webfolderInput").val()) == "") {
                    jQuery.goMessage(mailMsg.alert_search_empty_keyword);
                    return;
                }
                if (!validateInputValue(searchKeyword, 2, 64, "searchMail")) {
                    return;
                }
                var param = _this.listParam;
                param.keyWord = searchKeyword.val();
                goFolder(param);
                event.preventDefault();
            }
        });
        searchEvent.on("click", "a,:button,ins", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (type == "file-detail-search") {
                toggleDetailSearchLayer();
            }
        });
        searchEvent.on("change", "select[evt-rol='file-search-select']", function (event) {
            toggleSearchType();
        });
        searchEvent.on("click", "input[evt-rol='webfoderSearchSubmit']", function (event) {
            var searchKeyword = jQuery("#webfolderInput");
            if (jQuery("#webfolderInput").hasClass("placeholder") || jQuery.trim(jQuery("#webfolderInput").val()) == "") {
                jQuery.goMessage(mailMsg.alert_search_empty_keyword);
                return;
            }
            if (!validateInputValue(searchKeyword, 2, 64, "searchMail")) {
                return;
            }

            var param = _this.listParam;
            param.keyWord = searchKeyword.val();
            goFolder(param);
        });
        var searchInputEvent = jQuery("#webfolderInput");
        searchInputEvent.focus(function () {
            jQuery(this).parent().addClass("search_focus");
        });
        searchInputEvent.blur(function () {
            jQuery(this).parent().removeClass("search_focus");
        });
    };

    this.setSharedValue = function (data) {
        if (data.fid > 0) {
            _this.sharedUserList = data.sharedUserList;
            _this.sharedFolderUid = data.fid;
        } else {
            _this.sharedUserList = "";
            _this.sharedFolderUid = "";
        }
        _this.currentFolder = data.path;
        _this.showSharedPopup();
    };
    this.downloadFiles = function (data) {

        var uids = _.map(data.messages, function (message) {
            return message.id;
        });

        jQuery.fileDownload(_this.downloadFileAction, {
            httpMethod: "GET",
            data: {
                uids: uids,
                type: data.type || 'user',
                path: data.path || '/',
                sroot: data.sroot || '',
                sharedUserSeq: data.sharedUserSeq || 0
            },
            prepareCallback: function () {
                makeProcessLoader();
            },
            successCallback: function () {
                removeProcessLoader();
            },
            failCallback: function () {
                removeProcessLoader();
            }
        })
    },

        this.showSharedPopup = function(){
            jQuery.goPopup({
                id:"webfolderSharePopup",
                width:"420px",
                header : mailMsg.webfolder_share,
                pclass :"layer_normal layer_folder_share",
                contents: getHandlebarsTemplate("webfolder_shared_popup_tmpl",{"folder":_this.currentFolder}),
                openCallback: function(){
                    jQuery("#searchUserInput").placeholder();
                    if(_this.sharedUserList && _this.sharedUserList.length > 0){
                        jQuery("#webfolderSharePopup #sharedUserList").html(getHandlebarsTemplate("webfolder_shared_user_list_tmpl",_this.sharedUserList ));
                    }

                    jQuery("#webfolderSharePopup").on("click","span", function(event) {
                        event.preventDefault();
                        var eventType = jQuery(this).attr("evt-rol");
                        if(eventType=="addShareUser"){
                            var showType = jQuery(this).attr("data-type");
                            if(showType=="add"){
                                jQuery("#webfolderSharePopup .share_user").after(getHandlebarsTemplate("webfolder_shared_user_search_popup_tmpl",{}));
                                jQuery("#webfolderSharePopup").width("900px");
                                jQuery(this).attr("data-type","hide");
                                jQuery(this).text(mailMsg.common_menu_hide);
                                jQuery("#webfolderSharePopup").css("left","25%");
                            }else{
                                jQuery("#webfolderSharePopup .move_wrap").remove();
                                jQuery("#webfolderSharePopup .user_search_wrap").remove();
                                jQuery("#webfolderSharePopup").width("420px");
                                jQuery(this).attr("data-type","add");
                                jQuery(this).text(mailMsg.webfolder_searchadd);
                                jQuery("#webfolderSharePopup").css("left","50%");
                            }

                        }else if(eventType =="shareUserAdd"){

                            var addUserCheckedList = jQuery("#searchUserList input:checked");
                            if(addUserCheckedList.length == 0) {
                                jQuery.goSlideMessage(mailMsg.error_noselect);
                                return;
                            }

                            var userList =  jQuery("#webfolderSharePopup #sharedUserList li").map(function (){
                                return jQuery(this).attr("data-id");
                            }).get();
                            var addUserList = addUserCheckedList.map(function(){
                                var param = {};
                                var id  = jQuery(this).attr("data-id");
                                var email = jQuery(this).attr("data-email");
                                if(USERID ==email.substring(0,email.indexOf("@")) ){
                                    return;
                                }
                                for(var i =0;i<userList.length;i++){
                                    if(id == userList[i]){
                                        return;
                                    }
                                }
                                param.goUserSeq = id;
                                param.userName = jQuery(this).attr("data-name");
                                param.position = jQuery(this).attr("data-position");
                                param.dept = jQuery(this).attr("data-dept");
                                param.email = jQuery(this).attr("data-email");
                                //param.userId = email.substring(0,email.indexOf("@"));
                                return param;
                            }).get();

                            jQuery("#webfolderSharePopup #sharedUserList").append(getHandlebarsTemplate("webfolder_shared_user_list_tmpl",addUserList));
                        }else if(eventType =="removeShareUser"){
                            jQuery(this).parent().remove();
                        }else if(eventType=="writePermission"){
                            var permission = jQuery(this).parent().attr("data-permission");
                            if(permission=="" || permission=="R"){
                                jQuery(this).find(".btn_fn7").text(mailMsg.webfolder_write);
                                jQuery(this).parent().attr("data-permission","W");
                            }else{
                                jQuery(this).find(".btn_fn7").text(mailMsg.webfolder_read);
                                jQuery(this).parent().attr("data-permission","R");
                            }

                        }
                    });
                    jQuery("#webfolderSharePopup").on("click",".btn_search", function(event) {
                        var eventType = jQuery(this).attr("evt-rol");
                        if(eventType=="searchUser"){
                            searchGoUser();
                        }

                    });
                    jQuery("#webfolderSharePopup").on("keypress",".search", function(event) {
                        var eventType = jQuery(this).attr("evt-rol");
                        if(eventType=="searchUser" ){
                            if(event.keyCode == _this.ENTER_KEY){
                                searchGoUser();

                            }
                        }

                    });

                },
                closeCallback:function(){
                    jQuery("#webfolderSharePopup").off();
                },
                buttons: [{
                    btext : mailMsg.button_ok,
                    btype : "confirm", //초록 버튼
                    autoclose:false,
                    callback : function() {
                        var param = {};
                        param.folderPath = _this.currentFolder;
                        param.readAuthBox= jQuery("#webfolderSharePopup #sharedUserList li").map(function (){
                            var permission = jQuery(this).attr("data-permission");
                            if(permission!="W") return jQuery(this).attr("data-id");
                            return;
                        }).get();
                        param.rwAuthBox= jQuery("#webfolderSharePopup #sharedUserList li").map(function (){
                            var permission = jQuery(this).attr("data-permission");
                            if(permission =="W") return jQuery(this).attr("data-id");
                            return;
                        }).get();
                        if(_this.sharedFolderUid){
                            param.fuid = _this.sharedFolderUid
                        }

                        jQuery.goPopup.close();
                        ActionLoader.postGoJsonLoadAction(_this.sharedFolderAction, param, function(data){
                            jQuery.goSlideMessage(mailMsg.save_ok);
                            _this.loadViewWebFolder(_this.listParam);
                        }, "json");

                    }
                },{
                    btext : mailMsg.button_cancel,
                    btype : "normal", //초록 버튼
                    autoclose:true
                }]
            });
        };
    this.showSelectFolderPopup = function (cmType){
        // GO-30472 이슈로 전사 <-> 개인 자료실 간 폴더 이동 불가능하도록
        var isMoveFolder = false;
        if (cmType === "move") {
            jQuery('#viewFolder input:checkbox:checked').each(function () {
                if (jQuery(this).parent().parent().attr("fid")) {
                    isMoveFolder = true;
                    return false;
                }
            });
        }

        jQuery.goPopup({
            id:"webfolderPopup",
            header : mailMsg.webfolder_select,
            pclass :"layer_normal layer_select",
            contents : getHandlebarsTemplate("webfolder_list_popup_wrap_tmpl"),
            openCallback: function(){

                /**
                 * 개인자료실
                 * 폴더는 전사 -> 개인
                 * 이동불가
                 */
                if (!(isMoveFolder && _this.type == "public")) {
                    ActionLoader.getSyncGoLoadAction(_this.listFolderDataAction, {"type":"user"}, function(data) {
                        jQuery("#userFolderArea").handlebars("webfolder_list_popup_tmpl", data);
                    }, "json");
                }

                // 공유폴더
                ActionLoader.getSyncGoLoadAction(_this.listFolderDataAction, {"type":"share"}, function(data){
                        jQuery("#privateWebfolderList").append(getHandlebarsTemplate("webfolder_list_share_popup_tmpl", data)); },
                    "json");

                /**
                 * 전사자료실
                 * 폴더는 개인 -> 전사
                 * 이동불가
                 */
                if (!(isMoveFolder && _this.type == "user")) {
                    ActionLoader.getSyncGoLoadAction(_this.listFolderDataAction, {"type": "public"}, function (data) {
                        jQuery("#companyFolderArea").handlebars("webfolder_list_public_popup_tmpl", data);
                    }, "json");
                }

                jQuery("#webfolderListWrap ul.side_depth").on("click","span ", function(event) {
                    event.preventDefault();
                    jQuery("#webfolderListWrap p").removeClass("on");
                    jQuery(this).closest("p").addClass("on");
                });
            },
            buttons: [{
                btext: mailMsg.button_ok,
                btype: "confirm",
                autoclose: false,
                callback: function () {
                    var selectFolder = jQuery("#webfolderListWrap p.on");
                    var targetPath = selectFolder.attr("real-path");
                    var moveAndCopyParam = clone(_this.listParam);
                    moveAndCopyParam.path = moveAndCopyParam.fullPath;
                    moveAndCopyParam.targetPath = targetPath;
                    var sroot = selectFolder.attr("sroot");
                    var userSeq = selectFolder.attr("user-seq");
                    var type = selectFolder.attr("type");
                    var auth = selectFolder.attr("auth");
                    if (sroot) moveAndCopyParam.sroot = sroot;
                    if (userSeq) {
                        moveAndCopyParam.userSeq = userSeq;
                        moveAndCopyParam.targetUserSeq = userSeq;
                    }
                    if (type) moveAndCopyParam.targetType = type;
                    if (auth == "R") {
                        jQuery.goMessage(mailMsg.no_right_folder_message);
                        return;
                    }

                    var fids = jQuery('#viewFolder input:checkbox:checked').map(function () {
                        var fid = jQuery(this).parent().parent().attr("fid");
                        if (!fid) return;
                        return fid;
                    }).get();

                    var uids = jQuery('#viewFolder input:checkbox:checked').map(function () {
                        var uid = jQuery(this).parent().parent().attr("uid");
                        if (!uid) return;
                        return uid;
                    }).get();

                    var folders = moveAndCopyParam.targetPath.split(".");
                    // 파일이 한개 이상, 폴더 6개이상
                    if (fids.length > 0 && folders.length >= 6) {
                        jQuery.goMessage(mailMsg.alert_maxdepth);
                        return;
                    }

                    var isSameFolderPath = false;

                    jQuery.each(fids, function (index, fid) {
                        var folderPath = moveAndCopyParam.fullPath;
                        if (moveAndCopyParam.fullPath === "/") {
                            folderPath = "WEBFOLDERROOT";
                        }
                        folderPath = folderPath + '.' + fid;
                        if (folderPath === targetPath) {
                            isSameFolderPath = true;
                        }
                    });

                    if (isSameFolderPath) {
                        jQuery.goMessage(mailMsg.same_folder_copymove_error);
                        return;
                    }

                    moveAndCopyParam.fids = fids;
                    moveAndCopyParam.uids = uids;
                    moveAndCopyParam.cmType = cmType;
                    jQuery.goPopup.close();

                    ActionLoader.postGoJsonLoadAction(_this.copyAndMoveFolderAction, moveAndCopyParam, function (data) {
                        jQuery.goSlideMessage(mailMsg.common_job_success);
                        _this.loadWebfolderList();
                        _this.loadPublicWebfolderList();
                        _this.loadViewWebFolder(_this.listParam);
                    }, "json", function (data) {
                        _this.failResult(data);
                    });
                }
            }, {
                btext: mailMsg.button_cancel,
                btype: "normal", //초록 버튼
                autoclose: true
            }]
        });
    };

    this.getUnifiedSearchFolderList = function () {
        jQuery("#detailSearchLayerWrap").handlebars("file_unified_detail_search_tmpl", {});
        jQuery("#fromDate").datepicker({
            dateFormat: "yy-mm-dd",
            changeMonth: true,
            changeYear: true,
            yearSuffix: ""
        });
        jQuery("#toDate").datepicker({
            dateFormat: "yy-mm-dd",
            changeMonth: true,
            changeYear: true,
            yearSuffix: ""
        });
        ocxUploadVisible(false);
        jQuery("#detailSearchLayerWrap").show();
    };
};

function searchGoUser() {
    if (!validateInputValue(jQuery("#webfolderSharePopup .search"), 1, 60, "onlyBack")) {
        return;
    }
    var data = {
        'page': '0',
        'offset': '30',
        'keyword': jQuery("#webfolderSharePopup .search").val()
    };
    jQuery.ajax({
        url: webfolderControl.searchUserAction,
        type: 'get',
        contentType: 'application/json',
        data: data
    }).done(function (rs) {
        var resultData = getSearchUserList(rs);
        var resultDataIndex = 0;
        while (resultDataIndex < resultData.length) {
            if (resultData[resultDataIndex].nodeType == "department") {
                resultData.splice(resultDataIndex, 1);
            } else {
                resultDataIndex++;
            }
        }

        if (resultData && resultData.length) {
            var html = getHandlebarsTemplate("webfolder_shared_user_search_result_tmpl", resultData);
            jQuery("#webfolderSharePopup #searchUserList").html(html);
        } else {
            jQuery("#webfolderSharePopup #searchUserList").html("<li>" + mailMsg.webfolder_nosearch + "</li>")
        }
    });
}
function getSearchUserList(rs) {

    if (!(rs.data && rs.data.length)) {
        return false;
    }
    var resultData = [];

    for (var i = 0; i < rs.data.length; i++) {
        if (rs.data[i].nodeType !== "Department") {
            resultData.push(rs.data[i]);
        }
    }
    return resultData;
}

function getPopupData() {
    return POPUPDATA;
}

Handlebars.registerHelper("replaceEmail",function(email,options){
    var result= email.substring(0,email.indexOf("@"));
    return new Handlebars.SafeString(result);
});
Handlebars.registerHelper("deptParse",function(depts,options){
    var result= depts.join(',');
    return new Handlebars.SafeString(result);
});
Handlebars.registerHelper('notEmptyArray', function(data, options) {
	data = data.length;
	if(data > 0) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});
