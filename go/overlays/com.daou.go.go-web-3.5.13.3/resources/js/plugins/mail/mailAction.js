var layoutMode = window.layoutMode || 'h';
var isFirstLoad = false;

function initService() {
    initMailLayout();
    folderControl.getFolderAllInfo();
    folderControl.getBookmarkInfo();
    folderControl.makeEvent();
    mailControl.makeMailEvent();

    isFirstLoad = true;

    var workStatus = false;
    if (workAction == "write") {
        workStatus = true;
        var param = {};
        if (writeToList) {
            param.to = unescape_tag_title(writeToList);
        }
        if (wtype) {
            param.wtype = wtype;
            param.wuid = wuid;
            param.folderName = folder;
            param.wfolderType = wfolderType;
            param.wfolderShareSeq = wfolderShareSeq;
        }
        goWrieLoad(param);
        if (isPopupWrite) mailControl.loadMessageList();
    } else if (workAction == "read") {
        if (isNotFoundError == "true") {
            jQuery.goAlert("", mailMsg.mail_sid_not_found_alert);
            mailControl.loadMessageList();
        }
        if (workFolder && workFolder != "" && workUid && Number(workUid) > 0) {
            workFolder = decodeURIComponent(workFolder);
            var param = {};
            if (quickType && quickType != "") {
                param = getFolderExecuteParam(quickType);
            } else {
                param.folder = unescape_tag_title(workFolder);
            }

            if (parseInt(initPage, 10) > 1) {
                param.page = initPage;
            }
            mailControl.loadMessageList(param, true, true);
            workStatus = true;
            //setTimeout(function() {
            readMessage(unescape_tag_title(workFolder), workUid);
            //},500);
        }
    } else if (workAction == "list") {
        if (isShareFolder) {
            goSharedFolder(workFolder, workUid);
        } else {
            goFolder(workFolder)
        }
        workStatus = true;
    } else if (workAction == "quick") {
        folderExecute(workFolder);
        workStatus = true;
    }
    if (!workStatus) {
        mailControl.loadMessageList();
    }
    jQuery("#mailSearchKeyWord").placeholder();

}

function setMailAppName() {
    jQuery("#mailAppNameLink").text(currentAppName);
}

function initMailFunction() {
    layoutControl = new LayoutControl();
    folderControl = new FolderControl();
    mailControl = new MailControl();
    historyControl = new HistoryControl(mailHistoryCallBack);
}

function initMailLayout() {
    layoutControl.makeLayout(storeLayoutMode);
    layoutMode = layoutControl.getContentSplitterMode();
}

function goFolder(folderName, flag) {
    checkEscapeWriteMode(function () {
        var param = {"folder": folderName};
        param.sharedFlag = "user";
        if (flag) {
            param.flag = flag;
        }

        if (folderName != "Drafts") {
            var mode = layoutControl.getContentSplitterMode();
            mode = (mode) ? mode : "n";
            layoutControl.contentSplitterChange(mode);
        } else {
            layoutControl.contentNormalSplitter();
        }
        mailControl.loadMessageList(param);
        hideSearchCancelBtn();
    });
}

function writeDraftMessage(folderName, uid) {
    goWrieLoad({wtype: "drafts", folderName: folderName, uids: [uid]});
}

function readMessage(folderName, uid) {
    var param = {"folder": folderName, "uid": uid};
    mailControl.readMessage(param);

    if (layoutMode != "n") {
        if (ReadSubMessageChecker.hasCurrentItem()) {
            if (ReadSubMessageChecker.currentUid != uid) {
                changeFlagView(true, "S", [folderName + "_" + uid]);
            }
        }
    }
    //mailControl.switchMessagesFlags(uid, folderName, "S", true);
}

function readMessagePopup(folderName, uid) {
    if (currentMenu == "list") {
        changeFlagView(true, "S", [folderName + "_" + uid]);
    }

    var param = {};
    param.folder = folderName;
    param.uid = uid;
    param.folderType = currentFolderType;
    param = mailControl.getSharedFolderParam(param);
    param.action = "read";
    param.popupWrite = isPopupWrite;
    POPUPDATA = param;
    var wname = "popupRead" + makeRandom();
    POPUPDATA.wname = wname;

    window.open("/app/mail/popup", wname, "scrollbars=yes,resizable=yes,width=1280,height=640");
}

function reloadMessagePopup() {
    var targetName = "";
    if (POPUPDATA.action == "read") {
        targetName = POPUPDATA.wname;
    }
    window.open("/app/mail/popup", targetName);
}

function reloadMessageList() {
    mailControl.reloadMessageList();
}

function downloadAttach(folderName, uid, part) {
    var param = {"folderName": folderName, "uid": uid, "part": part, "type": "normal"};
    param = mailControl.getSharedFolderParam(param);

    mailControl.downloadAttachFile(param);
}

function downloadAllAttach(folderName, uid, parts) {
    var param = {"folderName": folderName, "uid": uid, "part": parts};
    param = mailControl.getSharedFolderParam(param);
    mailControl.downloadAllAttachFile(param);
}

function downLoadTnefAttach(folder, uid, part, tnefKey) {
    var param = {"folderName": folder, "uid": uid, "part": part, "type": "tnef", "tnefKey": tnefKey};
    param = mailControl.getSharedFolderParam(param);
    mailControl.downloadTnefAttachFile(param);
}

function deleteAttachFile(folderName, uid, part) {

    jQuery.goConfirm(mailMsg.mail_del_attach, mailMsg.confirm_delete, function () {
        jQuery("#gpopupLayer").hide();
        jQuery(this)[0].autoclose = false;
        makeProcessLoader();
        var param = {"folderName": folderName, "uid": uid, "part": part};
        mailControl.removeAttachFile(param);
    });
}

function deleteAllAttach(folderName, uid, parts) {
    jQuery.goConfirm(mailMsg.mail_attach_delete_all, mailMsg.confirm_delete, function () {
        jQuery("#gpopupLayer").hide();
        jQuery(this)[0].autoclose = false;
        makeProcessLoader();
        var param = {"folderName": folderName, "uid": uid, "part": parts};
        mailControl.removeAttachFile(param);
    });
}

function deleteMessageAttaches() {
    var uidArray = getMailListCheckedIdArray();
    var params = getListProcessParams(uidArray);
    var messageParam = {"folderNames": params.fnames, "uids": params.uids};

    jQuery.goConfirm(mailMsg.mail_del_attach, mailMsg.confirm_delete, function () {
        jQuery("#gpopupLayer").hide();
        jQuery(this)[0].autoclose = false;
        makeProcessLoader();
        mailControl.removeAllAttachesFromMessage(messageParam);
    });
}

function readNestedMessage(folder, uid, part) {
    var param = {};
    param.folderName = folder;
    param.uid = uid;
    param.part = part;
    param.action = "nestedRead";
    param = mailControl.getSharedFolderParam(param);
    POPUPDATA = param;

    var wname = "popupRead" + makeRandom();

    window.open("/app/mail/popup", wname, "scrollbars=yes,resizable=yes,width=800,height=640");
}


function readRelationMessage(folder, uid, sortDesc) {
    mailControl.readRelationMessage(sortDesc);
}

function goSharedFolder(folderName, userSeq) {
    checkEscapeWriteMode(function () {
        var param = {
            "folder": folderName, "sharedFlag": "shared", "sharedUserSeq": userSeq, "sharedFolderName": folderName
        };
        mailControl.loadMessageList(param);
    });
}

function addFolder(targetOffset) {
    var offset = null;
    if (targetOffset) {
        offset = {
            top: targetOffset.top, left: targetOffset.left + 90
        };
    }
    var folderList = folderControl.getUserFolderList();
    jQuery.goPopup({
        id: 'mail_add_folder_popup',
        pclass: 'layer_normal layer_add_mailbox',
        header: mailMsg.mail_folder_add,
        width: 300,
        contents: getHandlebarsTemplate("mail_add_folder_tmpl", folderList),
        offset: offset,
        openCallback: function () {
            jQuery("#mail_add_folder_popup div.content").on("click", "input", function (e) {
                var type = jQuery(this).attr("evt-rol");
                if (type == "add-folder-select-parent") {
                    if (jQuery(this).attr("checked")) {
                        jQuery("#addFolderParentSelect").attr("disabled", false);
                        jQuery("#addFolderParentSelect").removeClass("inactive");
                    } else {
                        jQuery("#addFolderParentSelect").attr("disabled", true);
                        jQuery("#addFolderParentSelect").addClass("inactive");
                    }
                }
            });
        },
        closeCallback: function () {
            jQuery("#mail_add_folder_popup div.content").off();
        },
        buttons: [{
            btype: 'confirm', btext: mailMsg.comn_confirm, autoclose: false, callback: saveMailFolder
        }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
    });
}

function addSubFolder(parentFolder) {
    var data = {"folderName": parentFolder};
    jQuery.goPopup({
        id: 'mail_add_subfolder_popup',
        pclass: 'layer_normal layer_add_mailbox',
        header: mailMsg.mail_subfolder_add,
        width: 300,
        contents: getHandlebarsTemplate("mail_add_subfolder_tmpl", data),
        buttons: [{
            btype: 'confirm', btext: mailMsg.comn_confirm, autoclose: false, callback: saveSubMailFolder
        }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
    });
}

function saveMailFolder() {

    if (!validateInputValue(jQuery("#newMailFolderName"), 2, 32, "folderName")) {
        return;
    }
    var folderName = jQuery.trim(jQuery("#newMailFolderName").val());

    if (isDefaultBoxCheck(folderName)) {
        jQuery.goMessage(mailMsg.alert_systemfolder);
        return;
    }

    var parentFolderName = "";
    if (jQuery("#newParentSelectCheck").attr("checked")) {
        parentFolderName = jQuery("#addFolderParentSelect").val();
    }
    folderName = (parentFolderName == "") ? folderName : parentFolderName + "." + folderName;
    var param = {"folderName": folderName};
    folderControl.addFolder(param);
    jQuery.goPopup.close();
}

function saveSubMailFolder() {

    if (!validateInputValue(jQuery("#subMailFolderName"), 2, 32, "folderName")) {
        return;
    }

    var folderName = jQuery("#subMailFolderName").val();
    var parentFolder = jQuery("#subMailFolderName").attr("folder");

    var newFolderName = parentFolder + "." + folderName;

    if (strByteLength(newFolderName) > 255) {
        jQuery.goSlideMessage(mailMsg.mail_newfolder_error, "caution");
        return;
    }

    var param = {"folderName": newFolderName};
    folderControl.addFolder(param);
    jQuery.goPopup.close();
    makeProcessLoader();
}

function modifyFolder(folderName) {
    var data = {"folderName": folderName};
    jQuery.goPopup({
        id: 'mail_modify_folder_popup',
        pclass: 'layer_normal layer_add_mailbox',
        header: mailMsg.mail_folder_modify,
        width: 300,
        contents: getHandlebarsTemplate("mail_modify_folder_tmpl", data),
        buttons: [{
            btype: 'confirm', btext: mailMsg.comn_confirm, autoclose: false, callback: modifySaveFolder
        }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
    });
}

function moveFolder(folderName) {
    var data = {"folderName": folderName};
    var param = {};
    var preFolderName = folderName;
    var newFolderName = "";

    ActionLoader.getGoLoadAction(folderControl.folderAllInfoAction, param, function (data) {
        var userFolderList = data.userFolders;
        userFolderList.isInbox = true;

        jQuery.goPopup({
            id: 'mail_move_folder_popup', /*pclass: 'layer_normal layer_select',*/
            pclass: 'layer_normal layer_select layer_mailbox_detail ',
            header: mailMsg.mail_folder_move_header,
            contents: getHandlebarsTemplate("mail_move_folder_popup_tmpl"),
            openCallback: function () {
                jQuery("#preMailFolderName").val(preFolderName);

                jQuery("#selectMailFolderPopup").on("click", "a,span,ins,li,p", function (event) {
                    var type = jQuery(this).attr("evt-rol");

                    if (!type) return;
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    } else {
                        event.cancelBubble = true;
                    }
                    event.preventDefault();

                    if (type == "toggle-mail-folder") {
                        var status = jQuery(this).attr("status");
                        var fid = jQuery(this).attr("fid");
                        var currentDepth = jQuery(this).closest("li").attr("depth");
                        currentDepth = parseInt(currentDepth, 10);
                        var childObj = jQuery(this).closest("li").find("ul[depth='" + (currentDepth + 1) + "']");
                        var statusSimple = "O";
                        if (status == "open") {
                            childObj.hide();
                            jQuery(this).removeClass("close").addClass("open").attr({
                                "status": "close", "title": mailMsg.comn_open
                            });
                            statusSimple = "C";
                        } else {
                            childObj.show();
                            jQuery(this).removeClass("open").addClass("close").attr({
                                "status": "open", "title": mailMsg.comn_close
                            });
                            ;
                        }
                    } else if (type == "folder") {
                        newFolderName = jQuery(this).find('a').attr("fname");

                        jQuery("#selectMailFolderPopup p").each(function (index) {
                            if (jQuery(this).hasClass("title on")) {
                                jQuery(this).removeClass("on");
                            }
                        });

                        if (jQuery("#selectMailFolderPopup h1.mail").hasClass('on')) {
                            jQuery("#selectMailFolderPopup h1.mail").removeClass('on');
                        }
                        jQuery(this).addClass("on");
                        jQuery("#newMailFolderName").val(newFolderName);
                    } else if (type == "select-root") {
                        newFolderName = "";
                        jQuery("#newMailFolderName").val(newFolderName);

                        jQuery("#selectMailFolderPopup p").each(function (index) {
                            if (jQuery(this).hasClass("title on")) {
                                jQuery(this).removeClass("on");
                            }
                        });

                        jQuery(this).parent().addClass("on");
                    }
                });
            },
            buttons: [{
                btype: 'confirm', btext: mailMsg.comn_confirm, autoclose: false, callback: moveSaveFolder
            }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
        });

        userFolderList.isInbox = true;

        var inboxFolderArea = jQuery("#inbox_folder_popup_area");
        inboxFolderArea.handlebars("mail_user_folder_popup_tmpl", userFolderList);

        var inboxToggleBtn = jQuery("#inbox_toggle_popup_btn");
        if (inboxFolderArea.find("li.folder").length > 0) {
            if (status == "C") {
                inboxToggleBtn.addClass("open").removeClass("close").attr({
                    "status": "close", "title": mailMsg.comn_open
                });
                inboxFolderArea.hide();
            } else {
                inboxToggleBtn.addClass("close").removeClass("open").attr({
                    "status": "open", "title": mailMsg.comn_close
                });
                inboxFolderArea.show();
            }
            inboxToggleBtn.show();
        } else {
            inboxToggleBtn.hide();
        }

        userFolderList.isInbox = false;
        jQuery("#uf_folder_popup_area").handlebars("mail_user_folder_popup_tmpl", userFolderList);

        jQuery("#selectMailFolderPopup span").each(function (index) {
            if (jQuery(this).attr("status") != null) {
                var currentDepth = jQuery(this).closest("li").attr("depth");
                currentDepth = parseInt(currentDepth, 10);
                var childObj = jQuery(this).closest("li").find("ul[depth='" + (currentDepth + 1) + "']");
                childObj.show();
                jQuery(this).removeClass("open").addClass("close").attr({
                    "status": "open", "title": mailMsg.comn_close
                });
            }
        });

        jQuery("#selectMailFolderPopup a").each(function (index) {
            if (jQuery(this).attr("fname") == preFolderName) {
                jQuery(this).parent().addClass("title_selected");
            }
        });
    }, "json");
}

function moveSaveFolder() {
    var newObj = jQuery("#newMailFolderName");
    var preObj = jQuery("#preMailFolderName");

    var childerObj = jQuery(".title_selected").parent().find('p a');

    var childerFname = new Array(childerObj.length);
    jQuery(".title_selected").parent().find('p a').each(function (index) {
        childerFname[index] = jQuery(this).attr('fname');
    });

    checkMoveFolderName(newObj, preObj, childerObj);
}

function checkMoveFolderName(newObj, preObj, childerObj) {

    var childerFname = new Array(childerObj.length);
    childerObj.each(function (index) {
        childerFname[index] = jQuery(this).attr('fname');
    });

    var preFolderName = preObj.val().substring(preObj.val().lastIndexOf(".") + 1);
    var preFolderParent = preObj.val().substring(0, preObj.val().lastIndexOf(".") + 1);

    var newFolerParent = newObj.val() + ".";

    if (newObj.val() == "") {
        newFolerParent = "";
    }

    var newFolderFullName = newFolerParent + preFolderName;
    var preFolderFullName = preObj.val();

    var newFolderSplit = newObj.val().split(".");
    var preFolderSplit = preObj.val().split(".");

    var newFolderNameSize = strByteLength(newFolderFullName);
    if (newFolderNameSize > 255) {
        jQuery.goSlideMessage(mailMsg.mail_folder_move_message_001, "caution");
        return;
    }

    var folderByteSize = new Array(childerFname.length);
    for (var i = 0; i < childerFname.length; i++) {
        folderByteSize[i] = strByteLength(childerFname[i]);
    }
    var moveRootSize = folderByteSize[0];
    for (var i = 0; i < folderByteSize.length; i++) {
        var diff = folderByteSize[i] - moveRootSize;

        if (parseInt(newFolderNameSize) + diff > 255) {
            jQuery.goSlideMessage(mailMsg.mail_folder_move_message_001, "caution");
            return;
        }
    }

    // - 이동하려는 대상 메일함이 원본 메일함의 하위 메일함인 경우에는 이동할 수 없음.
    //		-> 대상 메일함이 원본 메일함의 하위 메일함입니다.
    var isMoveSubFolder = false;
    if (newFolderSplit.length > preFolderSplit.length) {
        for (var i = 0; i < preFolderSplit.length; i++) {
            if (newFolderSplit[i] == preFolderSplit[i]) {
                isMoveSubFolder = true;
                continue;
            } else {
                isMoveSubFolder = false;
                break;
            }
        }
        if (isMoveSubFolder) {
            jQuery.goSlideMessage(mailMsg.mail_folder_move_message_002, "caution");
            return;
        }
    }

    // - 이동하려는 대상 메일함이 원본 메일함과 같은 경우에는 메일함을 이동할 수 없음.
    //		-> 대상 메일함이 원본 메일함과 같습니다.
    if (newObj.val() == preFolderFullName) {
        jQuery.goSlideMessage(mailMsg.mail_folder_move_message_003, "caution");
        return;
    }
    var param = {"previousName": preObj.val(), "newName": newFolderFullName};
    folderControl.modifyFolder(param);

    jQuery.goPopup.close();
}

function modifySaveFolder() {

    var modifyObj = jQuery("#modifyMailFolderName");
    if (!validateInputValue(modifyObj, 2, 32, "folderName")) {
        return;
    }
    var preFolder = modifyObj.attr("folder");
    var parentFolder = "";
    if (preFolder.indexOf(".") > 0) {
        parentFolder = preFolder.substring(0, preFolder.lastIndexOf(".") + 1);
    }

    var newFolder = jQuery.trim(modifyObj.val());
    var preFolderName = modifyObj.data("folder-name");
    if (newFolder == preFolderName) {
        jQuery.goPopup.close();
        return;
    }
    newFolder = parentFolder + "" + newFolder;

    var newMailBoxName = newFolder;
    var preMailBoxName = parentFolder + "" + preFolderName;


    var newFolderNameSize = strByteLength(newFolder);
    if (newFolderNameSize > 255) {
        jQuery.goSlideMessage(mailMsg.mail_folder_move_message_001, "caution");
        return;
    }

    var folderByteSize = new Array(childrenFnameForModify.length);
    for (var i = 0; i < childrenFnameForModify.length; i++) {
        folderByteSize[i] = strByteLength(childrenFnameForModify[i]);
    }

    var moveRootSize = folderByteSize[0];
    for (var i = 0; i < folderByteSize.length; i++) {
        var diff = folderByteSize[i] - moveRootSize;

        if (parseInt(newFolderNameSize) + diff > 255) {
            jQuery.goSlideMessage(mailMsg.mail_folder_move_message_001, "caution");
            return;
        }
    }

    if (isDefaultBoxCheck(newFolder)) {
        jQuery.goMessage(mailMsg.alert_systemfolder);
        return;
    }
    var param = {"previousName": preFolder, "newName": newFolder};
    folderControl.modifyFolder(param);

    jQuery.goPopup.close();
    childrenFnameForModify = null;
}

//즐겨찾기
function bookmarkManage() {
    var $bookmarkWrapObj = jQuery("#mail_bookmark_wrap");
    $bookmarkWrapObj.data("content", $bookmarkWrapObj.html());
    if (!$bookmarkWrapObj.hasClass("lnb_edit")) {
        $bookmarkWrapObj.addClass("lnb_edit");
    }
    $bookmarkWrapObj.find("span.btn_wrap").show();
    jQuery("#mail_bookmark_list").find("p.on").attr("data-on", "true").removeClass("on");
    jQuery("#mail_bookmark_list").sortable({
        start: function (evt, ui) {
            jQuery(ui.helper).addClass("move");
        }, beforeStop: function (evt, ui) {
            jQuery(ui.helper).removeClass("move");
        }
    }).sortable("enable");
    jQuery("#mail_bookmark_list").disableSelection();
    jQuery("#mail_bookmark_btn_normal").hide();
    jQuery("#mail_bookmark_btn_modify").show();
}

function bookmarkCancel() {
    var $bookmarkWrapObj = jQuery("#mail_bookmark_wrap");
    $bookmarkWrapObj.find("span.btn_wrap").hide();
    $bookmarkWrapObj.html($bookmarkWrapObj.data("content"));
    if ($bookmarkWrapObj.hasClass("lnb_edit")) {
        $bookmarkWrapObj.removeClass("lnb_edit");
    }
    jQuery("#mail_bookmark_list").sortable("disable");
    jQuery("#mail_bookmark_list").find("p[data-on=true]").addClass("on");
}

function bookmarkModify() {
    var bookmarkIds = [];
    jQuery("#mail_bookmark_list li").each(function () {
        bookmarkIds.push(jQuery(this).attr("seq"));
    });
    var param = {"bookmarkSeqArray": bookmarkIds};
    folderControl.updateBookmark(param);

    jQuery("#mail_bookmark_list span.btn_wrap").hide();
    var $bookmarkWrapObj = jQuery("#mail_bookmark_wrap");
    if ($bookmarkWrapObj.hasClass("lnb_edit")) {
        $bookmarkWrapObj.removeClass("lnb_edit");
    }
    jQuery("#mail_bookmark_btn_modify").hide();
    jQuery("#mail_bookmark_btn_normal").show();
    jQuery("#mail_bookmark_list").sortable("disable");

    if (isBookmark && (currentMenu == "list" || currentMenu == "read")) {
        var isExist = false;
        jQuery("#mail_bookmark_list li").each(function () {
            var type = jQuery(this).attr("type");
            var query = jQuery(this).attr("query");
            if (type == bookmarkType && query == bookmarkValue) {
                isExist = true;
            }
        });
        if (!isExist) {
            folderControl.changeBookmarkFlag(false);
        }
    }
}

function bookmarkExecute(seq, type, query) {
    checkEscapeWriteMode(function () {
        var param = {};
        if (type == "tag") {
            param.listType = type;
            param.tagId = query;
        } else {
            param.folder = "all";
            param.extFolder = "on";
            if (type == "unseen") {
                param.flag = "U";
            } else if (type == "today") {
                param.adv = "on";
                param.sdate = "TODAYS";
                param.edate = "TODAYE";
            } else if (type == "yesterday") {
                param.adv = "on";
                param.sdate = "YESTERDAYS";
                param.edate = "YESTERDAYE";
            } else if (type == "flaged") {
                param.flag = "F";
            } else if (type == "seen") {
                param.flag = "S";
            } else if (type == "attach") {
                param.flag = "T";
            } else if (type == "reply") {
                param.flag = "A";
            } else if (type == "myself") {
                param.flag = "L";
            } else {
                param.folder = query;
                param.extFolder = "off";
            }
            param.extType = type;

            if (query != "Drafts") {
                var mode = layoutControl.getContentSplitterMode();
                mode = (mode) ? mode : "n";
                layoutControl.contentSplitterChange(mode);
            } else {
                layoutControl.contentNormalSplitter();
            }
        }
        param.bookmarkSeq = seq;
        mailControl.loadMessageList(param);
    });
}

function folderExecute(type) {
    checkEscapeWriteMode(function () {
        var param = getFolderExecuteParam(type);

        var mode = layoutControl.getContentSplitterMode();
        mode = (mode) ? mode : "n";
        layoutControl.contentSplitterChange(mode);

        mailControl.loadMessageList(param);
    });
}

function getFolderExecuteParam(type) {
    var param = {};
    if (type == "unseen") {
        param.flag = "U";
    } else if (type == "today") {
        param.adv = "on";
        param.sdate = "TODAYS";
        param.edate = "TODAYE";
    } else if (type == "yesterday") {
        param.adv = "on";
        param.sdate = "YESTERDAYS";
        param.edate = "YESTERDAYE";
    } else if (type == "flaged") {
        param.flag = "F";
    } else if (type == "seen") {
        param.flag = "S";
    } else if (type == "attach") {
        param.flag = "T";
    } else if (type == "reply") {
        param.flag = "A";
    } else if (type == "myself") {
        param.flag = "L";
    }
    param.folder = "all";
    param.extFolder = "on";
    param.extType = type;

    return param;
}

//태그 관리
function addMailTag(data, targetOffset) {
    var tagList = folderControl.getTagData();
    if ((!data || data.type != "modify") && (tagList && tagList.length >= 300)) {
        jQuery.goMessage(mailMsg.mail_tag_insert_limit);
        return;
    }
    var offset = null;
    if (targetOffset) {
        if (targetOffset.sideTop == "sideTop_mail") {
            offset = {
                top: targetOffset.top - 300, left: targetOffset.left + 120
            };
        } else { //targetOffset.sideTop == "sideTop_tag"
            offset = {
                top: targetOffset.top, left: targetOffset.left + 120
            };
        }
    }

    jQuery.goPopup({
        id: 'mail_tag_popup',
        pclass: 'layer_normal layer_add_tag',
        header: mailMsg.mail_tag_add,
        contents: getHandlebarsTemplate("mail_tag_add_tmpl", data),
        offset: offset,
        openCallback: function () {
            jQuery("#mail_tag_popup div.layer_pallete").on("click", "a", function (e) {
                jQuery("#mail_tag_popup div.layer_pallete a").removeClass("active");
                jQuery(this).addClass("active");
            });
        },
        closeCallback: function () {
            jQuery("#mail_tag_popup div.layer_pallete").off();
        },
        buttons: [{
            btype: 'confirm', btext: mailMsg.comn_confirm, autoclose: false, callback: saveMailTag
        }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
    });
}

function saveMailTag() {

    if (!validateInputValue(jQuery("#tag_name_input"), 2, 32, "folderName")) {
        return;
    }

    var tagId = jQuery.trim(jQuery("#tag_id_hidden").val());
    var tagName = jQuery.trim(jQuery("#tag_name_input").val());
    var tagColor = jQuery("#mail_tag_popup div.layer_pallete a.active").attr("color");
    var param = {"tagName": tagName, "tagColor": tagColor};

    if (tagId != "") {
        param.oldId = tagId;
        if (isExistTagName(tagName, tagId)) {
            jQuery.goMessage(mailMsg.alert_tag_samename);
            return;
        }
        folderControl.modifyTag(param);
    } else {
        if (isExistTagName(tagName)) {
            jQuery.goMessage(mailMsg.alert_tag_samename);
            return;
        }
        folderControl.addTag(param);
    }

    jQuery.goPopup.close();
}

function deleteMailTag(tagId) {
    jQuery.goConfirm(mailMsg.mail_tag_delete, mailMsg.mail_tag_delete_confirm, function () {
        folderControl.delTag(tagId);
        if (isFolderManageMenu()) {
            mailSettingControl.loadViewFolderManage();
        }
    });
}

function checkEscapeWriteMode(confirmOkFunc, cunfirmCancelFunc) {
    if (currentMenu == "write") {
        if (isWriteModify()) {
            //            jQuery.goConfirm(mailMsg.mail_write,mailMsg.confirm_escapewrite,
            jQuery.goConfirm("", mailMsg.confirm_escapewrite, //GO-15230
                function () {
                    clearTimeout(writeAutoSave);
                    clearTimeout(autoSaveTimeTerm);
                    deleteAllHugeFile();
                    destroyBasicUploadControl();
                    destroyMassUploadControl();
                    destoryEditorControl();
                    hideAutoComplate();
                    jQuery.goPopup.close();
                    if (confirmOkFunc) confirmOkFunc();
                }, function () {
                    if (cunfirmCancelFunc) cunfirmCancelFunc();
                });
        } else {
            clearTimeout(writeAutoSave);
            clearTimeout(autoSaveTimeTerm);
            destroyBasicUploadControl();
            destroyMassUploadControl();
            destoryEditorControl();
            hideAutoComplate();
            jQuery.goPopup.close();
            if (confirmOkFunc) confirmOkFunc();
        }
    } else {
        if (confirmOkFunc) confirmOkFunc();
    }
}

function writePreview() {
    var sendData = mailControl.getSendData();
    var param = makeRcptForm();
    param.writeMode = jQuery("#editorMode").data("mode");
    param.subject = jQuery("#subject").val();
    param.content = getMessageContent("preview");
    param.letterSeq = (sendData.letterSeq) ? sendData.letterSeq : "";
    var useMailSender = jQuery("#senderMode");
    if (useMailSender.length > 0 && useMailSender.val() == "on") {
        var senderUserEmail = jQuery("#senderUserEmail :selected").val();
        param.senderName = get_name(senderUserEmail);
        param.senderEmail = get_email(senderUserEmail);
    } else {
        param.senderName = sendData.senderName;
        param.senderEmail = sendData.senderEmail;
    }

    param.attachList = getPreviewAttachString();

    var signSeq = jQuery("#signSelect").val();
    if (signSeq && signSeq > 0) {
        param.attachSign = true;
        param.signSeq = signSeq;
    } else {
        param.attachSign = false;
        param.signSeq = "";
    }

    param.bannerDisplay = sendData.bannerDisplay;
    param.bannerContent = sendData.mailBanner ? sendData.mailBanner.content : null;

    param.action = "writePreview";
    POPUPDATA = param;

    window.open("/app/mail/popup", "previewPopup", "resizable=yes,scrollbars=yes,width=850,height=700");
}

function isWriteModify() {
    var mode = jQuery("#editorMode").data("mode");
    var content = "";
    try {
        var contentChanged = false;
        if (editorControl == null) {
            return false;
        }

        if (mode == "html") {
            if (!editorControl.oEditor.validate()) {
                jQuery.goError(mailMsg.mail_mime_size_exceed);
                return false;
            }
            try {
                content = getHtmlMessage("ascheck");
            } catch (e) {

            }
        } else {
            content = jQuery.trim(getTextMessage());
        }

        if (jQuery.trim(content) != "") {
            contentChanged = true;
            return contentChanged;
        }

        if (getHugeFileUidList().length > 0) {
            contentChanged = true;
            return contentChanged;
        }

        if (!uploadAttachFilesComplete) {
            return true;
        }

        if (getRcptFormCount() > 0) contentChanged = true;
    } finally {
        content = null;
    }
    return contentChanged;
}

function getMessageContent(type) {
    var sendData = mailControl.getSendData();
    var isSignAdd = false;
    var signLocation = sendData.signLocation;
    var editorMode = jQuery("#editorMode").data("mode");
    var contentValue;
    var searchText, spos, contentStr;

    if (editorMode == 'html') {
        if (!editorControl.oEditor.validate()) {
            jQuery.goError(mailMsg.mail_mime_size_exceed);
            return false;
        }
        contentValue = getHtmlMessage(type);
    } else {
        contentValue = getTextMessage();
    }

    if (type != "secure" && type != 'draft') {
        if (signLocation == "inside") {
            if (editorMode == 'html') {
                searchText = "<signpos\></signpos>";
                spos = contentValue.indexOf(searchText);
                if (spos > -1) {
                    contentStr = contentValue.substring(0, spos);
                    //contentStr = contentStr + "<br>{tims_sign_pos}<br>";
                    contentValue = contentStr + contentValue.substring(spos, contentValue.length);
                    isSignAdd = true;
                }
            } else {
                searchText = "--- Original Message ---";
                spos = contentValue.indexOf(searchText);
                if (spos > -1) {
                    contentStr = contentValue.substring(0, spos);
                    //contentStr = contentStr + "\n\n{tims_sign_pos}\n\n";
                    contentValue = contentStr + contentValue.substring(spos, contentValue.length);
                    isSignAdd = true;
                }
            }
        }

        if (!isSignAdd) {
            if (editorMode == 'html') {
                //contentValue = contentValue+"<br>{tims_sign_pos}<br>";
            } else {
                //contentValue = contentValue+"\n\n{tims_sign_pos}\n\n";
            }

        }
    }
    return contentValue;
}

function goWriteSecureMail() {
    goWrite("expressE");
}

function goWrite() {
    secureWriteMode = "normal";
    //isOcxUpload=false;
    isOcxUpload = getCookie("OcxUpload") == 'on' ? true : false;
    if (isPopupWrite) {
        goWriteWork();
    } else {
        checkEscapeWriteMode(function () {
            goWriteWork();
        });
    }
}

function goWriteWork() {

    var func = function () {
        var paramObj = {wtype: "normal"};
        if (isPopupWrite) {
            popupWriteLoad(paramObj);
        } else {
            layoutControl.contentNormalSplitter();
            mailControl.writeMessage(paramObj);
            hideSearchCancelBtn();
        }
    };

    var dfolderUnseen = jQuery("#folder_link_Drafts span.num").text();
    if (isWriteNoti && Number(dfolderUnseen) > 0) {
        jQuery.goConfirm(mailMsg.conf_profile_74, mailMsg.confirm_draftswrite, function () {
            goFolder("Drafts");
        }, function () {
            func();
        });
    } else {
        func();
    }
}

function goWrieLoad(paramObj) {
    paramObj = mailControl.getSharedFolderParam(paramObj);
    if (isPopupWrite) {
        popupWriteLoad(paramObj);
    } else {
        checkEscapeWriteMode(function () {
            var isPopup = false;
            try {
                isPopup = isPopupView();
            } catch (e) {
                isPopup = false;
            }
            if (isPopup) {
                popupWriteLoad(paramObj);
            } else {
                layoutControl.contentNormalSplitter();
                mailControl.writeMessage(paramObj);
                hideSearchCancelBtn();
            }
        });
    }
}

function switchFlagFlaged(midArray, flagType, flagUse) {
    var msgInfo = getListProcessParams(midArray);
    mailControl.switchMessagesFlags(msgInfo.uids, msgInfo.fnames, flagType, flagUse);
}

function changeFlagView(isUsed, flagType, messageIds) {
    var messageId, flagedIcon;
    for (var i = 0; i < messageIds.length; i++) {
        messageId = messageIds[i];
        if (flagType == "F") {
            flagedIcon = jQuery("#" + getFolderNameId(messageId)).find('span[flag="F"]');
            if (isUsed) {
                flagedIcon.removeClass("ic_important_off");
                flagedIcon.addClass("ic_important_on");
                flagedIcon.attr("flaged", "on");
            } else {
                flagedIcon.removeClass("ic_important_on");
                flagedIcon.addClass("ic_important_off");
                flagedIcon.attr("flaged", "off");
            }
        } else if (flagType == "S") {
            var listTr = jQuery("#" + getFolderNameId(messageId));
            if (isUsed) {
                listTr.removeClass("read_no");
                var flagObj = listTr.find("span.flagClass");
                if (flagObj.hasClass("ic_noread_reply")) {
                    flagObj.removeClass("ic_noread_reply").addClass("ic_read_reply");
                } else if (flagObj.hasClass("ic_read_no")) {
                    flagObj.removeClass("ic_read_no").addClass("ic_read_yes");
                } else if (flagObj.hasClass("ic_noread_fw")) {
                    flagObj.removeClass("ic_noread_fw").addClass("ic_read_fw");
                }
            } else {
                if (!listTr.hasClass("read_no")) {
                    listTr.addClass("read_no");
                    var flagObj = listTr.find("span.flagClass");
                    if (flagObj.hasClass("ic_read_reply")) {
                        flagObj.removeClass("ic_read_reply").addClass("ic_noread_reply");
                    } else if (flagObj.hasClass("ic_read_yes")) {
                        flagObj.removeClass("ic_read_yes").addClass("ic_read_no");
                    } else if (flagObj.hasClass("ic_read_fw")) {
                        flagObj.removeClass("ic_read_fw").addClass("ic_noread_fw");
                    }
                }
            }
        }
    }

    var listMode = mailControl.getListMode();
    if (flagType == "S" && listMode == "mail") {
        folderControl.updateFolderCountInfo();
    }
}

function changeFlagReadView(isUsed, flagType) {
    if (flagType == "F") {
        var flagedIcon = jQuery("#readFlagedFlagIcon");
        if (isUsed) {
            flagedIcon.removeClass("ic_important_off");
            flagedIcon.addClass("ic_important_on");
            flagedIcon.attr("flaged", "on");
        } else {
            flagedIcon.removeClass("ic_important_on");
            flagedIcon.addClass("ic_important_off");
            flagedIcon.attr("flaged", "off");
        }
    }
}

//검색
function searchMessage(addr) {
    var listMode = mailControl.getListMode();
    var keyWord = "";
    if (addr) {
        keyWord = addr;
    } else {
        var searchObj = jQuery("#mailSearchKeyWord");
        keyWord = jQuery.trim(searchObj.val());
        if (keyWord == "") {
            jQuery.goSlideMessage(mailMsg.alert_search_nostr, "caution");
            searchObj.focus();
            return;
        }
        if (!validateInputValue(searchObj, 2, 64, "searchMail")) {
            return;
        }
    }

    checkEscapeWriteMode(function () {
        if (listMode == "mdnlist") {
            var param = {"pattern": keyWord};
            mailControl.loadMdnList(param);
        } else if (listMode == "mdnread") {
            var messageId = jQuery("#mdnMessageId").val();
            var param = {"pattern": keyWord, "messageId": messageId};
            mailControl.loadMdnRead(param);
        } else {
            closeDetailSearchLayer();
            var folderName = mailControl.getCurrentFolder();
            var param = {"folder": folderName, "keyWord": keyWord};
            mailControl.searchMessage(param);
        }
        showSearchCancelBtn();
    });
}

//상세 검색
function makeDetailSearchLayer() {
    mailControl.getSearchQueryList();
    jQuery("#detailSearchLayerWrap").on("click", "input,span,a", function (e) {
        var type = jQuery(this).attr("evt-rol");
        if (!type) return;
        if (type == "select-saved-search") {
            var query = jQuery(this).closest("li").attr("query");
            checkEscapeWriteMode(function () {
                var param = unserialize(Base64TMS.decode(query));
                mailControl.loadMessageList(param);
                closeDetailSearchLayer();
            });
        } else if (type == "delete-saved-search") {
            var uid = jQuery(this).closest("li").attr("uid");
            var param = {"searchQueryIds": [uid]};
            mailControl.deleteSearchQuery(param);
        } else if (type == "save-search-folder") {
            if (jQuery("#detail_search_cond_area li").length >= 15) {
                jQuery.goAlert(mailMsg.mail_sfolder_save, mailMsg.mail_sfolder_insert_limit);
                return;
            }
            openAdSearchMessageNamePopup();
        } else if (type == "close-search-folder") {
            closeDetailSearchLayer();
        } else if (type == "detail-mail-search") {
            adSearchMessage();
        }
    });
    jQuery("#detailSearchLayerWrap").on("change", "select", function (e) {
        var type = jQuery(this).attr("evt-rol");
        if (type == "select-search-folder") {
            var selectBox = jQuery(this).val();
            if (selectBox == "all") {
                jQuery("#searchIncludeExtFolderWrap").show();
            } else {
                jQuery("#searchIncludeExtFolderWrap").hide();
                jQuery("#searchIncludeExtFolder").attr("checked", false);
            }
        }
    });
    jQuery("#detailSearchLayerWrap").on("keypress", "input", function (e) {
        if (e.which == 13) {
            adSearchMessage();
        }
    });
    makeProcessLoader("mask");
}

//상세 통합 검색
function makeDetailUnifiedSearchLayer() {
    mailControl.getUnifiedSearchFolderList();
    var isMailAttachSearch = mailControl.isMailAttachSearch();
    if (isMailAttachSearch) {
        jQuery('#searchAttachContentsWrap').parents('div.vertical_wrap').show();
    }
    jQuery("#detailSearchLayerWrap").on("click", "input,span,a", function (e) {
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
        }
        if (term == "-2") {
            fromDate = moment(moment(currentDate).clone().add("weeks", term)).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
            searchTerm = "2w";
        } else if (term == "month") {
            fromDate = moment(moment(currentDate).clone().add("months", -1)).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
            searchTerm = "1m";
        } else if (term == "directly") {
            fromDate = moment(jQuery("#fromDate").val()).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
            toDate = moment(moment(jQuery("#toDate").val()).clone().add('days', 1).subtract('seconds', 1)).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
            searchTerm = "";
        }

        if (type == "search-period") {

            jQuery("#fromDate").attr("disabled", true);
            jQuery("#toDate").attr("disabled", true);
        } else if (type == "search-directly") {
            jQuery("#fromDate").attr("disabled", false);
            jQuery("#toDate").attr("disabled", false);
        } else if (type == "close-unified-search-folder") {
            closeDetailSearchLayer();
        } else if (type == "detail-unified-search") {
            var keyword = jQuery.trim(jQuery("#keyword").val());
            if (keyword == "") {
                jQuery.goSlideMessage(mailMsg.alert_search_nostr, "caution");
                return false;
            }
            if (!validateInputValue(jQuery("#keyword"), 2, 64, "searchMail")) {
                return false;
            }
            if (jQuery("#fromDate").val() != "" || jQuery("#toDate").val() !== "") {
                if (!checkDatePeriod(jQuery("#fromDate").val(), jQuery("#toDate").val())) {
                    return false;
                }
            }
            if (isMsie8) {
                window.top.window.location = "/app/#unified/search?offset=5&page=0&stype=detail&keyword=" + encodeURIComponent(jQuery("#keyword").val()) + "&searchAttachContents=" + jQuery("#searchAttachContents").is(":checked") + "&fromDate=" + fromDate + "&toDate=" + toDate + "&searchTerm=" + searchTerm;
            } else {
                window.top.window.location = "/app/unified/search?offset=5&page=0&stype=detail&keyword=" + encodeURIComponent(jQuery("#keyword").val()) + "&searchAttachContents=" + jQuery("#searchAttachContents").is(":checked") + "&fromDate=" + fromDate + "&toDate=" + toDate + "&searchTerm=" + searchTerm;
            }
            jQuery("#searchType").val('appSearch');
            jQuery("#keyword").val('');

        }
    });
    jQuery("#detailSearchLayerWrap").on("change", "select", function (e) {
        var type = jQuery(this).attr("evt-rol");
        if (type == "select-search-folder") {
            var selectBox = jQuery(this).val();
            if (selectBox == "all") {
                jQuery("#searchIncludeExtFolderWrap").show();
            } else {
                jQuery("#searchIncludeExtFolderWrap").hide();
                jQuery("#searchIncludeExtFolder").attr("checked", false);
            }
        }
    });
    jQuery("#detailSearchLayerWrap").on("keypress", "input", function (e) {
        if (e.which == 13) {
            adSearchMessage();
        }
    });
    makeProcessLoader("mask");
}

function adSearchMessage() {
    if (!validateAdSearchMessage()) {
        return;
    }
    checkEscapeWriteMode(function () {
        var param = getAdSearchMessageQuery();
        mailControl.loadMessageList(param);
        closeDetailSearchLayer();
        showSearchCancelBtn();
    });
}

function validateAdSearchMessage() {
    var adFrom = jQuery.trim(jQuery("#adFrom").val());
    if (adFrom != "") {
        if (!validateInputValue(jQuery("#adFrom"), 2, 64, "searchMail")) {
            return false;
        }
    }
    var adTo = jQuery.trim(jQuery("#adTo").val());
    if (adTo != "") {
        if (!validateInputValue(jQuery("#adTo"), 2, 64, "searchMail")) {
            return false;
        }
    }
    var adStartDate = jQuery("#adStartDate").val();
    var adEndDate = jQuery("#adEndDate").val();
    if (adStartDate != "" || adEndDate !== "") {
        if (!checkDatePeriod(adStartDate, adEndDate)) {
            return false;
        }
    }

    var adKeyWord = jQuery.trim(jQuery("#adSearchKeyWord").val());

    if (adFrom == "" && adTo == "" && adStartDate == "" && adEndDate == "" && adKeyWord == "") {
        jQuery.goMessage(mailMsg.alert_search_nostr);
        jQuery("#adSearchKeyWord").focus();
        return false;
    }

    if (adKeyWord != "") {
        if (!validateInputValue(jQuery("#adSearchKeyWord"), 2, 64, "searchMail")) {
            return;
        }
    }

    return true;
}

function getAdSearchMessageQuery() {
    var folderName = jQuery.trim(jQuery("#adFolderName").val());
    var searchExtFolder = (jQuery("#searchIncludeExtFolder").attr("checked")) ? "on" : "off";
    var adFrom = jQuery.trim(jQuery("#adFrom").val());
    var adTo = jQuery.trim(jQuery("#adTo").val());
    var searchCond = "";
    jQuery("#adSearchCondWrap input:checked").each(function () {
        searchCond += jQuery(this).val();
    });
    var adKeyWord = jQuery.trim(jQuery("#adSearchKeyWord").val());
    var adStartDate = jQuery("#adStartDate").val();
    var adEndDate = jQuery("#adEndDate").val();
    if (adStartDate != "" && adEndDate != "") {
        adStartDate += "-00-00-00";
        adEndDate += "-23-59-59";
        adStartDate = moment(adStartDate, "YYYY-MM-DD-HH-mm-ss").utc().format();
        adEndDate = moment(adEndDate, "YYYY-MM-DD-HH-mm-ss").utc().format();
    }

    var addSearchFlag = "";
    jQuery("#addSearchFlagWrap input:checked").each(function () {
        addSearchFlag += jQuery(this).val();
    });

    var param = {};
    param.adv = "on";
    param.listType = "mail";
    param.keyWord = adKeyWord;
    param.folder = folderName;
    param.fromaddr = adFrom;
    param.toaddr = adTo;
    param.category = searchCond;
    param.sdate = adStartDate;
    param.edate = adEndDate;
    param.flag = addSearchFlag;
    param.searchExtFolder = searchExtFolder;

    return param;
}

function closeDetailSearchLayer() {
    ocxUploadVisible(true);
    jQuery("#detailSearchLayerWrap").hide();
    jQuery("#detailSearchLayerWrap").off();
    jQuery(document).trigger("hideLayer.goLayer");
    removeProcessLoader();
}

function toggleDetailSearchLayer() {
    if (jQuery("#detailSearchLayerWrap").css("display") == "none") {
        var searchType = jQuery("#searchType").val();
        if (searchType == "appSearch") {
            makeDetailSearchLayer();
        } else {
            makeDetailUnifiedSearchLayer();
        }
    } else {
        closeDetailSearchLayer();
    }
}

function openAdSearchMessageNamePopup() {

    if (!validateAdSearchMessage()) {
        return;
    }

    jQuery.goPopup({
        id: 'ad_search_name_popup',
        pclass: 'layer_normal',
        header: mailMsg.mail_sfolder_save,
        contents: getHandlebarsTemplate("mail_detail_search_save_cond_name_tmpl"),
        buttons: [{
            btype: 'confirm', btext: mailMsg.comn_confirm, autoclose: false, callback: saveAdSearchMessageCond
        }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
    });
}

function saveAdSearchMessageCond() {

    if (!validateInputValue(jQuery("#adSearchMessageCondName"), 2, 32, "folderName")) {
        return;
    }

    var searchName = jQuery.trim(jQuery("#adSearchMessageCondName").val());
    var searchQuery = Base64TMS.encode(jQuery.param(getAdSearchMessageQuery()));
    var param = {"searchName": searchName, "searchQuery": searchQuery};
    mailControl.saveSearchQuery(param);
    jQuery.goPopup.close();
}

function getMessageText() {
    return jQuery("#messageText").val();
}

var contentFrameWidth;

function resizeTextFrame(height, width) {
    jQuery("#messageContentFrame").css({"height": height + 25 + "px", "overflow-x": "hidden", "overflow-y": "hidden"});
    contentFrameWidth = jQuery("#messageContentFrame").contents().find("#contentT").width();
    contentFrameWidth = (width < 1000) ? contentFrameWidth : width;
    var func;
    if (CURRENT_PAGE_NAME == "popup") {
        func = function () {
            var wrapper = jQuery("#readContentMessageWrap");
            var parentWrapper = jQuery("#mailViewContentWrap");
            var mailReadSenderList = jQuery("#mailReadSenderListWrap");
            var mailReadArea = jQuery("#mailReadArea");
            if (parentWrapper.width() < contentFrameWidth) {
                //wrapper.css("width",(contentFrameWidth+30)+ "px");
                wrapper.css("width", parentWrapper.width());
                parentWrapper.css("width", contentFrameWidth);
            } else {
                if (mailReadArea.width() > parentWrapper.width() + 57) {
                    parentWrapper.css("width", "");
                }
                wrapper.css("width", (isMsie) ? "" : "100%");
            }
            parentWrapper.height("100%");

        };
        jQuery(window).unbind("resize.mailread");
        jQuery(window).bind("resize.mailread", func);
    } else {
        func = function () {
            var wrapper = jQuery("#readContentMessageWrap");
            var parentWrapper = jQuery("#mailViewContentWrap");
            var mailReadArea = jQuery("#mailReadArea");
            var mailReadSenderList = jQuery("#mailReadSenderListWrap");

            if (parentWrapper.width() < contentFrameWidth) {
                //wrapper.css("width",(contentFrameWidth+30)+ "px");
                parentWrapper.css("width", contentFrameWidth);
                wrapper.css("width", parentWrapper.width());
            } else {
                if (mailReadArea.width() > parentWrapper.width() + 57) {
                    parentWrapper.css("width", "");
                }
                wrapper.css("width", (isMsie) ? "" : "100%");
            }
            getReadResizeHeight();

            if (layoutMode === "h") {
                parentWrapper.css("height", (mailReadArea.height() - 60) + "px");
                //wrapper.css("width", (mailReadSenderList.width()));
            }
        };
        jQuery(window).unbind("resize.mailread");
        jQuery(window).bind("resize.mailread", func);
    }
    func();
}

function viewSource(folder, uid) {
    var param = {};
    param.folder = folder;
    param.uid = uid;
    param = mailControl.getSharedFolderParam(param);
    param.action = "source";
    POPUPDATA = param;

    window.open("/app/mail/popup", "sourcePopup", "scrollbars=yes,width=1280,height=640,resizable=yes");
}

function viewNdrGuide() {
    window.open("/app/mail/ndrguide", "ndrGuidePopup", "scrollbars=yes,width=920,height=640,resizable=yes");
}

function viewRegistrationSchedule(subject) {

    var baseConfig = BASECONFIG.data;

    if (!baseConfig.contextRoot) baseConfig.contextRoot = "/";
    if (!baseConfig.locale) baseConfig.locale = LOCALE;

    var offset = jQuery("#resistration").offset();

    session = {};
    session.id = SESSION_ID;
    session.serverTZOffset = SERVER_TIMEZONE;

    GO.Calendar.addSimpleEvent({
        "contextRoot": baseConfig.contextRoot,
        "modal": false,
        "summary": subject,
        "session": session,
        "onCreateError": function (errorTag) {
            jQuery.goMessage(getSimpleEventErrorMessage(errorTag));
        },
        "afterAddEvent": function (respData) {
            var calendarId = respData.calendarId;
            var eventId = respData.id;

            var layerTitle = mailMsg.event_added;
            var layerText = mailMsg.event_confirm_to_move;
            var buttonText = mailMsg.event_move;

            jQuery.goConfirm(layerTitle, layerText, moveToEvent, afterAddEvent, buttonText);

            function moveToEvent() {
                var url = baseConfig.contextRoot + "app/calendar/" + calendarId + "/event/" + eventId;

                if (window.opener) {
                    window.location.href = url;
                } else {
                    window.top.window.location.href = url;
                }
            }

            function afterAddEvent() {
                // 메일조회에서 일정등록후 후처리 필요시 구현
                return;
            }
        },
        "lang": {
            "내 캘린더": mailMsg.mail_registe_my_calendar,
            "일정 등록": mailMsg.mail_registe_schedule,
            "일정명": mailMsg.mail_registe_name,
            "일시": mailMsg.mail_registe_date,
            "시간": mailMsg.mail_registe_time,
            "종일": mailMsg.mail_registe_allday,
            "확인": mailMsg.comn_confirm,
            "취소": mailMsg.comn_cancel,
            "일정상세 입력": mailMsg.mail_registe_detail,
            "기본 캘린더 이름": mailMsg.mail_registe_basic_calendar,
            "기본 캘린더 표시": mailMsg.mail_registe_basic,
            "분": mailMsg.autosave_option_min,
            "장소": mailMsg.mail_calendar_location,
            "전사일정": mailMsg.mail_calendar_company
        },
        "offset": {
            left: offset.left, top: offset.top + jQuery("#resistration").height()
        }
    });

    function goToEvent(calendarId, eventId) {
        window.location.href = "/app/calendar/" + calendarId + "/event/" + eventId;
    }
}

function getSimpleEventErrorMessage(errorTag) {
    // 간편등록 일정명 최대길이값
    var SUMMARY_MAX_LENGTH = 500;
    var messages = {
        "required:summary": mailMsg.mail_registe_error_01,
        "max:summary": msgArgsReplace(mailMsg.mail_registe_error_02, [SUMMARY_MAX_LENGTH])
    };

    return messages[errorTag] || mailMsg.mail_registe_error
}

function addWriteToolbarClass() {
    if (!jQuery("#mainContentWrap").hasClass("mail_write")) {
        jQuery("#mainContentWrap").addClass("mail_write");
    }
    jQuery("#toolbar_wrap").hide();
    jQuery("div[data-tag=write_toolbar_wrap]").show();
}

function deleteWriteToolbarClass() {
    if (jQuery("#mainContentWrap").hasClass("mail_write")) {
        jQuery("#mainContentWrap").removeClass("mail_write");
    }
    jQuery("div[data-tag=write_toolbar_wrap]").hide();
    jQuery("#toolbar_wrap").show();
}

function saveLayoutOption() {
    var readMode = "n";
    jQuery("#mailOptionBoxWrap span.ic_con").each(function () {
        if (jQuery(this).hasClass("on")) {
            readMode = jQuery(this).attr("val");
            return false;
        }
    });
    var param = {"readMode": readMode};
    mailControl.updateReadModeOption(param);
}

function savePageBase() {
    var spbase = jQuery("#toolbar_list_pagebase").val();
    var param = {"pageBase": spbase};
    mailControl.updatePageBaseOption(param);
}

function contentSplitterChange(mode) {
    layoutMode = mode;
    layoutControl.contentSplitterChange(mode);
    mailControl.reloadMessageList();
}

function editorBoxScript(data) {

    if (editorControl) return;

    makeEditorProcess(data);
}

function makeEditorProcess(data) {
    var editorOpt = {};
    destoryEditorControl();
    var $changeEditorWrap = jQuery("#writeChangeEditorWrap");

    editorOpt.id = "smartEditor";
    editorOpt.locale = LOCALE;
    editorOpt.content = data.htmlContent;
    editorOpt.letterUse = data.letterUse;
    editorControl = new SmartEditorControl(editorOpt);

    if (EDITOR_TYPE != "SmartEditor") {
        $changeEditorWrap.parent().css("top", "0px");
        $changeEditorWrap.show();
    }

    editorControl.makeEditor(function () {
        if (data.docTemplateApply) {
            editorControl.showWriteTemplateSelectLink();
        }
        editorControl.setEditorText(data.htmlContent);
        setFocus(data);
    });
}

function setFocus(data) {
    if (!data.sendFlag || data.sendFlag.indexOf("forward") > -1) {
        if (!isRcptModeNormal) {
            jQuery("#writeRcptValue").focus();
        } else {
            jQuery("#to").focus();
        }
    } else {
        editorControl.setFocus();
    }

}

function destoryEditorControl() {
    if (editorControl) {
        editorControl.destroy();
        editorControl = null;
    }
}

function makeAddressUnitFormat(fromId, value, data) {
    if (jQuery.trim(value) == "") return;
    var $input = jQuery("#" + fromId);
    makeFormatUnit($input, value, data);
    $input.focus();
    $input.width("80px");
}

function makeFormatEmail(addressArray) {
    var newAddressArray = new Array();
    var newAddressIndex = 0;
    var firstDoubleQuote = false;
    var secDoubleQuote = false;
    for (var i = 0; i < addressArray.length; i++) {
        if (addressArray[i] == "") {
            continue;
        }
        if (addressArray[i].indexOf("\"") > -1) {
            firstDoubleQuote = true;
            for (var j = i + 1; j < addressArray.length; j++) {
                if (addressArray[j].indexOf("\"") > -1) {
                    secDoubleQuote = true;
                    for (var k = i; k <= j; k++) {
                        if (k == i) {
                            newAddressArray[newAddressIndex] = addressArray[k] + ",";
                        } else if (k == j) {
                            newAddressArray[newAddressIndex] = newAddressArray[newAddressIndex] + addressArray[k];
                        } else {
                            newAddressArray[newAddressIndex] = newAddressArray[newAddressIndex] + addressArray[k] + ",";
                        }

                    }
                    newAddressIndex++;
                    break;
                }
            }

            if (!secDoubleQuote) {
                newAddressArray[newAddressIndex] = addressArray[i];
            }
            i = j;
        } else {
            newAddressArray[newAddressIndex] = addressArray[i];
            newAddressIndex++;
        }
    }
    return newAddressArray;
}

function makeFormatUnit(inputObj, value, data) {
    if (jQuery.trim(value) == "") return;

    addressArray = new Array();
    value = value.replace(/[\r|\n|\t]/g, '');
    addressSplit = value.split(">,");

    for (var i = 0; i < addressSplit.length; i++) {
        tempAddressArray = addressSplit[i].split(",");

        for (var j = 0; j < tempAddressArray.length; j++) {
            tempAddressArray[j] = jQuery.trim(tempAddressArray[j]);
        }

        addressArray = addressArray.concat(makeFormatEmail(tempAddressArray));
    }

    for (var i = 0; i < addressArray.length; i++) {
        value = addressArray[i];

        var isValid = checkEmailFormat(value);
        var isdiffDomain = isDiffDomain(value, USEREMAIL);

        var emailValue = get_email(value);
        var isAddrGroup = (isValid) ? ((emailValue.indexOf("$") == 0 || emailValue.indexOf("#") == 0 || emailValue.indexOf("!") == 0) ? true : false) : false;
        var displayName = (isValid) ? getFormatName(value) : value;
        var dataName = (isValid) ? getEmailFormatName(value) : value;
        var nameField = jQuery('<span class="name" evt-rol="select-field" onselectstart="return false"></span>').attr("title", displayName).data("email", dataName).text(displayName);
        if (data != null) {
            nameField.data("info", true).data("name", data[0].name).data("companyName", data[0].companyName).data("deptName", data[0].deptName).data("position", data[0].title);
        }
        var modField = jQuery('<span class="ic_con ic_edit_m" evt-rol="mod-field"></span>');
        modField.attr("title", mailMsg.comn_modfy).click(function () {
            jQuery(this).closest("li").find("span.btn_wrap").hide();
            var isInvalidAddr = jQuery(this).closest("li").hasClass("invalid");
            var emailObj = jQuery(this).closest("li").addClass((isInvalidAddr && !isRcptModeNoneAC) ? "invalid_on" : "on").find("span.name");
            var email = emailObj.data("email");
            var editField = jQuery('<input type="text" evt-rol="mod-field-inside" class="edit" style="display:none;">').val(email);
            if (!isRcptModeNoneAC) {
                var options = {
                    "autoResizeWidth": true,
                    "makeFormat": true,
                    "multiple": false,
                    "width": "400px",
                    "matchCase": true,
                    "editMode": true,
                    "editModeFunc": makeEditFormatUnit
                };
                jQuery(editField).autocomplete(mailControl.searchAddressAction, options);
            }
            emailObj.before(editField).remove();
            editField.blur(function (event) {
                event.preventDefault();
                isModFieldInside = false;
                if (jQuery("div.layer_auto_complete:hover").length) {
                    jQuery(this).val("");
                } else {
                    var fromId = editField.parent().next().children().children().attr("id");
                    var editVal = editField.val();
                    makeEditFormatUnit(editField, editField.val());
                    if (isRcptModeNoneAC && isRcptModeNormal) {
                        searchRcptAddrOneName(fromId, editVal);
                    }
                }
            }).keydown(function (event) {
                if (isRcptModeNoneAC) {
                    var value = jQuery.trim(jQuery(this).val());
                    if (event.which == 13 || event.which == 9) {
                        var fromId = editField.parent().next().children().children().attr("id");
                        var editVal = editField.val();
                        makeEditFormatUnit(editField, editField.val());
                        searchRcptAddrOneName(fromId, editVal);
                    }
                    var $writeStr = jQuery("#writeStrWidth");
                    $writeStr.text(value);
                    if ($writeStr.outerWidth() + 50 > jQuery(this).width()) {
                        jQuery(this).width($writeStr.outerWidth() + 50);
                    }
                }
                if (event.which == 13) {
                    isModFieldInside = false;
                }
            });
            var e = jQuery.Event("keydown");
            e.which = 40;
            editField.trigger(e).show().focus();
        });
        var modWrap = "";
        if (!isAddrGroup) {
            modWrap = jQuery('<span class="btn_wrap"></span>').append(modField);
        }
        var infoField = jQuery('<span class="ic_con ic_info_m"></span>');
        infoField.attr("title", mailMsg.mail_search_name_title).click(function () {
            var emailWrap = jQuery(this).closest('li');
            var emailValue = jQuery(this).closest("li").find("span.name").data("email");

            var name = jQuery(this).closest("li").find("span.name").data("name");
            var deptName = jQuery(this).closest("li").find("span.name").data("deptName");
            var companyName = jQuery(this).closest("li").find("span.name").data("companyName");
            var position = jQuery(this).closest("li").find("span.name").data("position");

            var email = get_email(emailValue);
            /*emailWrap.find("input.edit").unautocomplete();
	    	emailWrap.remove();
	    	inputObj.focus();*/
            var list = {};
            list.emailValue = emailValue;
            if (name == null) {
                name = get_name(emailValue);
            }
            list.name = name;
            list.email = email;
            list.position = position;
            list.company = companyName;
            list.department = deptName;
            rcptSelectInfoPopup(list);
        });
        var infoWrap = jQuery('<span class="btn_wrap"></span>').append(infoField);

        var delField = jQuery('<span class="ic_classic ic_del"></span>');
        delField.attr("title", mailMsg.comn_del).click(function () {
            var emailWrap = jQuery(this).closest('li');
            emailWrap.find("input.edit").unautocomplete();
            emailWrap.remove();
            inputObj.focus();
        });
        var delWrap = jQuery('<span class="btn_wrap"></span>').append(delField);

        var addrWrap = jQuery('<li></li>');
        addrWrap.addClass((!isValid && !isRcptModeNoneAC) ? "invalid" : (isdiffDomain) ? "out" : "");
        if (isRcptModeNoneAC) {
            addrWrap.append(nameField).append(infoWrap).append(modWrap).append(delWrap);
        } else {
            addrWrap.append(nameField).append(modWrap).append(delWrap);
        }
        inputObj.closest('li').before(addrWrap);
        inputObj.val("");

        if (isRcptModeNormal) {
            var inputId = inputObj.attr("id");
        }
    }
}

function makeEditFormatUnit(inputObj, value) {
    if (jQuery.trim(value) == "") return;
    var isValid = checkEmailFormat(value);
    var isdiffDomain = isDiffDomain(value, USEREMAIL);
    var displayName = (isValid) ? getFormatName(value) : value;
    var dataName = (isValid) ? getEmailFormatName(value) : value;
    var nameField = jQuery('<span class="name" evt-rol="select-field" onselectstart="return false"></span>').attr("title", displayName).data("email", dataName).text(displayName);
    inputObj.before(nameField);
    inputObj.closest("li").removeClass("out invalid invalid_on on").addClass((!isValid && !isRcptModeNoneAC) ? "invalid" : (isdiffDomain) ? "out" : "");
    inputObj.closest("li").find("span.btn_wrap").show();
    inputObj.unautocomplete();
    inputObj.remove();
}

function makeSearchAddressUnitFormat(value, addrType) {
    if (jQuery.trim(value) == "") return;
    var isValid = checkEmailFormat(value);
    var isdiffDomain = isDiffDomain(value, USEREMAIL);
    var displayName = (isValid) ? getFormatName(value, MAIL_EXPOSURE == false, LOCAL_DOMAIN) : value;
    var dataName = (isValid) ? getEmailFormatName(value) : value;
    addrType = (!addrType) ? jQuery("#writeRcptType").val() : addrType;
    var addrText = "";
    if (addrType == "to") {
        addrText = mailMsg.mail_to;
    } else if (addrType == "cc") {
        addrText = mailMsg.mail_cc;
    } else if (addrType == "bcc") {
        addrText = mailMsg.mail_bcc;
    }
    $input = jQuery("#writeRcptValue");
    var typeField = jQuery('<p class="title"></p>').text(addrText + ":");
    var nameField = jQuery('<span class="name"></span>').attr("title", displayName).data("email", dataName).data("type", addrType).text(displayName);
    var delField = jQuery('<span class="ic_classic ic_del"></span>');
    delField.click(function () {
        jQuery(this).closest('ul.name_tag').closest('li').remove();
        $input.focus();
    });
    var delWrap = jQuery('<span class="btn_wrap"></span>').append(delField);
    var addrWrap = jQuery('<ul class="name_tag"></ul>');
    addrWrap.append(jQuery('<li></li>').addClass((!isValid) ? "invalid" : (isdiffDomain) ? "out" : "").append(nameField).append(delWrap));
    jQuery("#writeRcptList").append(jQuery('<li></li>').append(typeField).append(addrWrap));
    $input.val("");
    $input.focus();
}

function makeInputAddresskeyEvt(fromId) {
    jQuery("#" + fromId)
        .keydown(function (event) {
            var value = jQuery.trim(jQuery(this).val());
            if (event.which == 188 && !event.shiftKey) {//,
                makeInputAddressFormat(fromId, value);
                event.preventDefault();
            }
            if (isRcptModeNoneAC) {
                if (event.which == 13 || event.which == 9) {
                    makeInputAddressFormat(fromId, value);
                    searchRcptAddrOneName(fromId, value);
                    event.preventDefault();
                }
                var $writeStr = jQuery("#writeStrWidth");
                $writeStr.text(value);
                if ($writeStr.outerWidth() + 50 > jQuery(this).width()) {
                    jQuery(this).width($writeStr.outerWidth() + 50);
                }
            }
        })
        .blur(function (event) {
            event.preventDefault();
            var value = jQuery.trim(jQuery(this).val());
            var fromIdObj = jQuery("#" + fromId + "_actb");
            if (fromIdObj.length == 0 || fromIdObj.css("display") == "none") {
                if (jQuery("div.layer_auto_complete:hover").length) {
                    jQuery(this).val("");
                } else {
                    makeInputAddressFormat(fromId, value);
                    if (isRcptModeNoneAC && isRcptModeNormal) {
                        searchRcptAddrOneName(fromId, value);
                    }
                }
            } else {
                if (jQuery("div.layer_auto_complete:hover").length) {
                    var _this = this;
                    setTimeout(function () {
                        if (fromIdObj.css("display") == "none") {
                            jQuery(_this).val("");
                        }
                    }, 100);
                } else {
                    makeInputAddressFormat(fromId, value);
                }
            }
        })
        .keydown(function (event) {
            if (event.which == 8) {
                if (jQuery(this).val() == "") {
                    jQuery(this).closest("ul.name_tag").find("li:not(.creat):last").remove();
                }
            }
        });
}

function makeInputAddressFormat(fromId, addressStr) {
    if (!addressStr) return;
    var tempAddressStr = jQuery.trim(addressStr);
    var tempAddressArray = getEmailArray(tempAddressStr);
    for (var i = 0; i < tempAddressArray.length; i++) {
        if (isRcptModeNormal) {
            makeAddressUnitFormat(fromId, tempAddressArray[i]);
        } else {
            makeSearchAddressUnitFormat(tempAddressArray[i], fromId);
        }
    }
}

function deleteAddressUnitFormat(fromId, item) {
    jQuery(item).remove();
    jQuery("#" + fromId).focus();
}

function deleteSearchAddressUnitFormat(item) {
    jQuery(item).closest("ul.name_tag").closest("li").remove();
    jQuery("#writeRcptValue").focus();
}

function deleteAddressUnitFormatAll(type) {
    jQuery("#" + type + "AddrWrap ul.name_tag li:not(.creat)").remove();
}

function deleteSearchAddressUnitFormatAll() {
    jQuery("#writeRcptList li").remove();
}

function selectRcptEmail(rcptType, email) {
    if (jQuery.trim(email) != "") {
        if (isRcptModeNormal) {
            makeAddressUnitFormat(rcptType, email);
        } else {
            makeSearchAddressUnitFormat(email);
        }
    }
}

function insertRcptEmail(rcptType, email) {
    if (jQuery.trim(email) != "") {
        if (isRcptModeNormal) {
            makeAddressUnitFormat(rcptType, email);
        } else {
            makeSearchAddressUnitFormat(email, rcptType);
        }
    }
}

function makeWriteMyself(checked) {
    var isExist = false;
    var wrapId = (isRcptModeNormal) ? "toAddrWrap" : "writeRcptList";

    jQuery("#" + wrapId + " ul.name_tag li:not(.creat)").each(function () {
        var mailFormat = jQuery(this).find("span.name").data("email");
        var email = get_email(mailFormat);
        if (USEREMAIL == email) {
            if (checked) {
                isExist = true;
                return false;
            } else {
                if (isRcptModeNormal) {
                    deleteAddressUnitFormat("to", jQuery(this));
                } else {
                    deleteSearchAddressUnitFormat(jQuery(this));
                }
            }
        }
    });
    if (checked && !isExist) {
        if (isRcptModeNormal) {
            if (isRcptModeNoneAC) {
                var data = {};
                jQuery.ajax({
                    type: "GET", url: "/api/user/profile/" + SESSION_ID, async: false, success: function (result) {
                        var deptMembers = result.data.deptMembers;
                        var deptName = "";

                        for (var i = 0; i < deptMembers.length; i++) {
                            if (i == 0) {
                                deptName = deptMembers[i].deptName;
                            } else {
                                deptName = deptName + "/" + deptMembers[i].deptName;
                            }
                        }
                        data.companyName = result.data.companyName;
                        data.deptName = deptName;
                        data.email = USEREMAIL;
                        data.name = USERNAME;
                        data.title = USERPOSITION;
                    }, dataType: "json"
                });


                var dataArray = new Array(1);
                dataArray[0] = data;
                var emailFormat = "\"" + USERNAME + "\" <" + USEREMAIL + ">";
                makeAddressUnitFormat("to", emailFormat, dataArray);
            } else {
                var emailFormat = "\"" + USERNAME + "\" <" + USEREMAIL + ">";
                makeAddressUnitFormat("to", emailFormat);
            }
        } else {
            var emailFormat = "\"" + USERNAME + "\" <" + USEREMAIL + ">";
            makeSearchAddressUnitFormat(emailFormat);
        }
    }
}

function contentDataCheck() {
    var contentTemp = jQuery("#contentTemp").val();
    var sendData = mailControl.getSendData();

    /*if (sendData.sendFlag == "forwardAttached") {
        setTimeout(function() {
            var forwardMessage = "* "+mailMsg.mail_forwardmessage+"\n\n";
            if (isMsie) {
                window.textContentFrame.setContent(forwardMessage);
            } else {
                document.getElementById("textContentFrame").contentWindow.setContent(forwardMessage);
            }
        },500);
    }
    else {*/
    if (contentTemp != '') {
        setTimeout('initTextContentData()', 500);
    }
    //}
}

function initTextContentData() {
    var textContent = jQuery("#contentTemp").val();
    if (isMsie) {
        window.textContentFrame.setContent(textContent);
    } else {
        document.getElementById("textContentFrame").contentWindow.setContent(textContent);
    }
}

function getWriteType() {
    return jQuery("#editorMode").data("mode");
}

function openWriteBccWrap() {
    jQuery("#writeToggleBccWrap").removeClass("ic_arrow_down_type4").addClass("ic_arrow_up_type4").attr("title", mailMsg.comn_close);
    jQuery("#writeBccWrap").show();
}

function getWriteMode() {
    var sendData = mailControl.getSendData();
    var writeMode = "normal";
    if (sendData.sendFlag == "forwardAttached" || sendData.sendFlag == "forward") {
        writeMode = "forward";
    }
    return writeMode;
}

function chgEditorMod(mode, isinit) {
    var htmlLayer = jQuery("#modeHtmlWrapper");
    var textLayer = jQuery("#modeTextWrapper");

    var ocx;
    if (isOcxUpload) {
        ocx = document.uploadForm.powerupload;
        ocx.SetChangeUpMode("true");
    }

    var editorMode = jQuery("#editorMode").data("mode");

    if (!isinit && editorMode == mode) {
        return;
    }

    var func = function () {
        if (mode == "text") {
            var sendData = mailControl.getSendData();
            if (sendData.letterMode == "on") {
                clearLetterPaper();
            }
            htmlLayer.hide();
            textLayer.show();
            closeLetterListLayer();
            closeDocTmplListLayer();
            jQuery("#editorMode").data("mode", mode).text("TEXT");

            if (!isinit) {
                if (isMsie) {
                    window.textContentFrame.setFrameFocus();
                } else {
                    document.getElementById("textContentFrame").contentWindow.setFrameFocus();
                }
            }

            if (notiMode == 'link') {
                jQuery("#receivenoti").attr("disabled", true);
            }

            jQuery("#writeChangeEditorWrap").show();
            jQuery("#signSelect").attr("disabled", true);
        } else {
            textLayer.hide();
            htmlLayer.show();
            jQuery("#editorMode").data("mode", mode).text("HTML");

            var writeData = mailControl.getWriteData();
            editorBoxScript(writeData);

            if (notiMode == 'link') {
                jQuery("#receivenoti").attr("disabled", false);
            }
            if (EDITOR_TYPE == "SmartEditor") {
                jQuery("#writeChangeEditorWrap").hide();
            }
            jQuery("#signSelect").removeAttr("disabled");
        }
        editorMode = mode;
    };

    var confirmMeg = mailMsg.write_alert002;
    if (editorMode == "html" && notiMode == 'link') {
        confirmMeg = mailMsg.write_alert003;
    }

    if (!isinit) {
        jQuery.goConfirm(mailMsg.mail_write_editor_mode, confirmMeg, function () {
            func();
        });
    } else {
        func();
    }
}

function viewBigAttachManager() {
    mailControl.listBigAttachFile(function (data) {
        jQuery.goPopup({
            id: 'mail_bigattach_manager_popup',
            pclass: 'layer_normal layer_big_data',
            header: mailMsg.mail_attach_manager_simple,
            width: 750,
            contents: getHandlebarsTemplate("mail_layer_bigattach_manager_tmpl", data),
            openCallback: function () {
                jQuery("#mail_bigattach_manager_popup").on("click", "span", function (e) {
                    var type = jQuery(this).attr("evt-rol");
                    if (!type) return;
                    if (type == "bigattach-delete") {
                        var messageUid = jQuery(this).data("messageuid");
                        deleteBigAttach(messageUid);
                    }
                });
            },
            closeCallback: function () {
                jQuery("#mail_bigattach_manager_popup").off();
            },
            buttons: [{btype: 'cancel', btext: mailMsg.comn_close}]
        });
    });
}

function deleteBigAttach(messageUid) {
    jQuery.goCaution(mailMsg.mail_bigattach_delete, mailMsg.bigattach_list_010, function () {
        var param = {"messageUids": [messageUid]};
        mailControl.deleteBigAttach(param, function (data) {
            jQuery("#bigattach_item_" + messageUid).remove();
            updateHugeQuota(Number(data));
            deleteUpoladBarList(messageUid);
        }, function (result) {
            jQuery.goAlert(mailMsg.mail_bigattach_delete_fail, mailMsg.bigattach_list_009);
        });
    }, function () {
        viewBigAttachManager();
    });
}

function viewExtMailPopup() {
    mailControl.loadExtMail(function (data) {
        jQuery.goPopup({
            id: 'mail_extmail_popup',
            pclass: 'layer_normal out_mail',
            header: mailMsg.conf_pop_44,
            width: 700,
            contents: getHandlebarsTemplate("mail_layer_extmail_tmpl", data),
            openCallback: function () {
                jQuery("#mail_extmail_popup").on("click", "a", function (e) {
                    var type = jQuery(this).attr("evt-rol");
                    if (!type) return;
                    if (type == "extmail-download-start") {
                        if (!jQuery(this).find("span.state").hasClass("finish")) {
                            return;
                        }
                        var host = jQuery(this).attr("host");
                        var id = jQuery(this).attr("userid");
                        var param = {"pop3Host": host, "pop3Id": id};
                        mailControl.downloadOrderExtMail(param);
                        jQuery(this).find("span.state").text(mailMsg.comn_waiting).removeClass("finish").addClass("wait");
                    } else if (type == "extmail-download-reset") {
                        var host = jQuery(this).attr("host");
                        var id = jQuery(this).attr("userid");
                        var param = {"pop3Host": host, "pop3Id": id};
                        mailControl.resetExtMail(param);
                    }
                });
                checkPop3Status();
            },
            closeCallback: function () {
                jQuery("#mail_extmail_popup").off();
                clearTimeout(pop3StatusTimeout);
            },
            buttons: [{btype: 'cancel', btext: mailMsg.comn_close}, {
                btype: 'confirm', btext: mailMsg.mail_pop3_insert, callback: function () {
                    selectSettingMenu("extmail");
                }
            }]
        });
    });
}

var pop3StatusTimeout;

function checkPop3Status() {
    clearTimeout(pop3StatusTimeout);
    jQuery("#mail_extmail_popup tr.item").each(function () {
        var status = jQuery(this).attr("status");
        if (status == "INPROGRESS" || status == "WAIT") {
            pop3StatusTimeout = setTimeout('runCheckPop3Status()', 5000);
            return false;
        }
    });
}

function runCheckPop3Status() {
    mailControl.loadExtMail(function (data) {
        jQuery("#mail_extmail_popup div.content").html(getHandlebarsTemplate("mail_layer_extmail_tmpl", data));
        checkPop3Status();
    });
}

function receiveMessage(data) {
    var status = data.status;
    var index = data.index;
    var $extMailBtnObj = jQuery("#extMailBtn" + index);

    if (status == "finish" || status == "fail") {
        $extMailBtnObj.text(mailMsg.comn_complate).removeClass("btn_fn8").addClass("btn_fn4");
        $extMailBtnObj.attr("evt-rol", "extmail-download-complate");

        if (status == "fail") {
            jQuery("#extMailProcess" + index).hide();
            jQuery("#extMailProcessMsg" + index).text(data.msg).show();
        }
    } else if (status == "total") {
        jQuery("#extMailProcessTotalCount" + index).text(data.count);
    } else if (status == "success") {
        jQuery("#extMailProcessSuccessCount" + index).text(data.count);
    } else if (status == "failCount") {
        jQuery("#extMailProcessFailCount" + index).text(data.count);
    } else if (status == "graph") {
        jQuery("#extMailProcessTotalGraph" + index).css("width", data.graphTotal + "%");
        jQuery("#extMailProcessSuccessGraph" + index).css("width", data.graphSuccess + "%");
    } else if (status == "complate") {
        //jQuery.goAlert("외부메일 다운로드가 완료되었습니다.");
    }
}

var writeModeTimeout;

function getWriteModeLayer() {
    var $parentObj = jQuery("#writeModeSelect");
    var isClose = ($parentObj.css("display") == "none");
    if (!isClose) {
        closeWriteModeLayer();
        return;
    }
    jQuery("#writeModeSelect ul > *").bind("mouseout", function () {
        writeModeTimeout = setTimeout(function () {
            closeWriteModeLayer();
        }, 1000);
    });
    jQuery("#writeModeSelect ul > *").bind("mouseover", function () {
        if (writeModeTimeout) clearTimeout(writeModeTimeout);
    });
    jQuery("#writeModeSelect ul > *").bind("click", function () {
        closeWriteModeLayer();
    });

    closeDocTmplListLayer();
    closeLetterListLayer();

    $parentObj.show();
}

function closeWriteModeLayer() {
    jQuery("#writeModeSelect ul > *").unbind();
    jQuery("#writeModeSelect").hide();
}

function getLetterListLayer(page) {
    closeWriteModeLayer();
    closeDocTmplListLayer();
    if (!page) page = 1;
    var param = {"page": page};
    var sendData = mailControl.getSendData();
    mailControl.getLetterList(param, function (data) {
        data.letterMode = sendData.letterMode;
        data.type = "letter";
        jQuery("#writeOptionLayer").handlebars("mail_letter_layer_tmpl", data);
        jQuery("#mailLetterLayerWrap").on("click", "li", function (e) {
            jQuery("#mailLetterLayerWrap li").removeClass("on");
            jQuery(this).addClass("on");
        });
        jQuery("#mailLetterLayerWrap").on("click", "span,a", function (e) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (type == "apply-letter") {
                var $selectedLetterObj = jQuery("#mailLetterLayerWrap li.on");
                if ($selectedLetterObj.length == 0) {
                    return;
                }
                var letterSeq = $selectedLetterObj.data("letterseq");
                var letterHeader = $selectedLetterObj.data("header");
                var letterBody = $selectedLetterObj.data("body");
                var letterTail = $selectedLetterObj.data("tail");
                var letterData = {};
                letterData.letterSeq = letterSeq;
                letterData.header = letterHeader;
                letterData.body = letterBody;
                letterData.tail = letterTail;
                setLetterPaper(letterData);
            } else if (type == "letter-layer-close") {
                closeLetterListLayer();
            } else if (type == "cancel-letter") {
                clearLetterPaper();
            }
        });
    });
}

function setLetterPaper(data) {
    if (!editorControl.oEditor.validate()) {
        jQuery.goError(mailMsg.mail_mime_size_exceed);
        return false;
    }
    var content = getHtmlMessage("ascheck");
    if (jQuery.trim(content) == "") {
        isDocTemplate = false;
    }
    if (isDocTemplate) {
        jQuery.goAlert(mailMsg.doctemplate_text_alert3);
        return;
    }

    var header = data.header;
    var body = data.body;
    var tail = data.tail;

    var oImgTop = jQuery("<img></img>");
    oImgTop.attr("id", "letter_top_img");
    oImgTop.attr("src", header);
    oImgTop.css("width", "600px");

    var oImgBot = jQuery("<img></img>");
    oImgBot.attr("id", "letter_bot_img");
    oImgBot.attr("src", tail);
    oImgBot.css("width", "600px");

    editorControl.makeLetterLayout(oImgTop, body, oImgBot);

    var sendData = mailControl.getSendData();
    sendData.letterMode = "on";
    sendData.letterSeq = data.letterSeq;
    sendData.letterData = data;
    mailControl.setSendData(sendData);
    isLetter = true;

    closeLetterListLayer();
}

function clearLetterPaper() {
    editorControl.cancelLetterLayout();

    var sendData = mailControl.getSendData();
    sendData.letterMode = "off";
    mailControl.setSendData(sendData);
    isLetter = false;

    closeLetterListLayer();
}

function closeLetterListLayer() {
    jQuery("#mailLetterLayerWrap").off();
    jQuery("#writeOptionLayer").empty();

}

function getDocTemplateList(page) {
    closeWriteModeLayer();
    closeLetterListLayer();
    if (!page) page = 1;
    var param = {"page": page};
    mailControl.getDocTemplateList(param, function (data) {
        data.type = "docTmpl";
        jQuery("#writeOptionLayer").handlebars("mail_doctemplate_layer_tmpl", data);
        jQuery("#mailDocTmplLayerWrap").on("click", "li", function (e) {
            jQuery("#mailDocTmplLayerWrap li").removeClass("on");
            jQuery(this).addClass("on");
        });
        jQuery("#mailDocTmplLayerWrap").on("click", "span,a", function (e) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (type == "apply-doctmpl") {
                var $selectedDocTmplObj = jQuery("#mailDocTmplLayerWrap li.on");
                if ($selectedDocTmplObj.length == 0) {
                    return;
                }
                var docSeq = $selectedDocTmplObj.data("seq");
                setDocTemplate(docSeq);
            } else if (type == "doctmpl-layer-close") {
                closeDocTmplListLayer();
            }
        });
    });
}

function setDocTemplate(seq) {
    if (isLetter) {
        jQuery.goAlert(mailMsg.doctemplate_text_alert3);
        return;
    }
    if (!editorControl.oEditor.validate()) {
        jQuery.goError(mailMsg.mail_mime_size_exceed);
        return false;
    }
    var content = getHtmlMessage("ascheck");

    var func = function () {
        var param = {"templateSeq": seq};
        mailControl.getTemplateContent(param, function (data) {
            editorControl.setEditorText(data.template);
            isDocTemplate = true;
        });
        closeDocTmplListLayer();
    };

    if (jQuery.trim(content) != "") {
        jQuery.goConfirm(mailMsg.mail_doctemplate_title, mailMsg.doctemplate_text_alert2, function () {
            func();
        });
    } else {
        func();
    }
}

function closeDocTmplListLayer() {
    jQuery("#mailDocTmplLayerWrap").off();
    jQuery("#writeOptionLayer").empty();

}


function chgAutoSaveTerm(val) {
    clearTimeout(autoSaveTimeTerm);
    isAutoSaveStart = false;
    mailControl.updateAutoSaveInfo(val, function (data) {
        runAutoSaveProcess();
        processAutoSaveMessage("saveTerm");
    });
}

function runAutoSaveProcess() {
    clearTimeout(autoSaveTimeTerm);
    var quotaInfo = folderControl.getQuotaInfo();
    var selectedCheckTime = jQuery("#autoSaveSelect").val();
    var checkTime = selectedCheckTime * 1000;
    if (checkTime > 0) {
        if (Number(quotaInfo.percent) >= 100) {
            processAutoSaveMessage("quotaover");
        } else {
            if (isAutoSaveStart) {
                doAutoSave();
            }
            isAutoSaveStart = true;
        }
        autoSaveTimeTerm = setTimeout('runAutoSaveProcess()', checkTime);
    } else {
        isAutoSaveStart = false;
        clearTimeout(autoSaveTimeTerm);
    }
}

function runAutoReflashProcess() {
    clearTimeout(autoReflashTimeTerm);

    var selectedReflashTime = getCookie("reflash_time");
    var reflashTime = selectedReflashTime * 1000 * 60;
    if (reflashTime > 0 && isUseReflashTime) {
        if (isAutoReflash && currentMenu == "list") {
            mailControl.reloadMessageList();
        }
        isAutoReflash = true;
        autoReflashTimeTerm = setTimeout('runAutoReflashProcess()', reflashTime);
    } else {
        isAutoReflash = false;
        clearTimeout(autoReflashTimeTerm);
    }
}

function processAutoSaveMessage(type, data) {
    clearTimeout(checkSaveTimeTerm);
    var tmpMessage = "";

    if (type == "saveMessage") {
        var sendData = mailControl.getSendData();
        sendData.draftMessageId = data.messageId;
        tmpMessage = mailMsg.autosave_message_savesuccess + " ( " + moment(data.updateTimeUtc).format('HH:mm:ss') + " )";
    } else if (type == "saveTerm") {
        var selectedValue = jQuery("#autoSaveSelect").val();
        tmpMessage = mailMsg.autosave_message_termchange;
        if (selectedValue > 0) {
            if (selectedValue < 60) tmpMessage += " (" + selectedValue + mailMsg.autosave_option_sec + ")"; else tmpMessage += " (" + (selectedValue / 60) + mailMsg.autosave_option_min + ")";
        } else {
            tmpMessage += " (" + mailMsg.autosave_option_nosave + ")";
        }
    } else if (type == "saveErrorTerm") {
        tmpMessage = mailMsg.autosave_term_error;
    } else if (type == "saveErrMessage") {
        tmpMessage = mailMsg.autosave_message_error;
    } else if (type == "quotaover") {
        tmpMessage = mailMsg.mail_send_quotaover_draft;
    }

    processMessageViewer(tmpMessage);
    isAutoSave = false;
}

function contentValidation() {
    var editorMode = jQuery("#editorMode").data("mode");
    if (editorMode == "html" && !editorControl.oEditor.validate()) {
        jQuery.goError(mailMsg.mail_mime_size_exceed);
        return false;
    }
    return true;
}

function doAutoSave() {
    if (isSendWork) {
        return;
    }
    if (editorMode == 'html' && !editorControl.oEditor.isAccessible()) return;

    var param = {};
    param = makeRcptForm(param);

    var editorMode = jQuery("#editorMode").data("mode");
    var contentValue;
    if (editorMode == 'html') {
        if (!editorControl.oEditor.validate()) {
            jQuery.goError(mailMsg.mail_mime_size_exceed);
            return false;
        }
        contentValue = getHtmlMessage("draft");
    } else {
        contentValue = getTextMessage();
    }

    param.subject = jQuery("#subject").val();
    param.sendType = "autosave";

    var sendData = mailControl.getSendData();

    param.draftMessageId = sendData.draftMessageId;
    param.sendFlag = sendData.sendFlag;
    param.writeMode = editorMode;
    param.uids = sendData.uids;
    param.folderName = sendData.folderName;
    param.charset = sendData.charset;
    param.massMode = false;
    param.content = contentValue;
    param.attachList = getAttachString();

    if (param.to == "" && param.bcc == "" && param.cc == "" && param.subject == "" && param.content == "" && param.attachList == "") {
        return;
    }

    isAutoSave = true;

    processMessageViewer(mailMsg.autosave_message_start);

    checkSaveTimeTerm = setTimeout(function () {
        if (isAutoSave) processAutoSaveMessage("saveErrMessage");
    }, 10000);

    mailControl.autoSaveMessage(param);
}

function doDraftSave() {
    if (isSendWork) {
        return;
    }

    var param = {};
    param = makeRcptForm(param);

    var editorMode = jQuery("#editorMode").data("mode");
    var contentValue;
    if (editorMode == 'html') {
        if (!editorControl.oEditor.validate()) {
            jQuery.goError(mailMsg.mail_mime_size_exceed);
            return false;
        }
        contentValue = getHtmlMessage("draft");
    } else {
        contentValue = getTextMessage();
    }

    var subject = jQuery("#subject").val();
    if (subject == "") {
        jQuery.goSlideMessage(mailMsg.alert_nosubject, "caution");
        return;
    }

    param.subject = subject;
    param.sendType = "draft";

    var sendData = mailControl.getSendData();

    param.draftMessageId = sendData.draftMessageId;
    param.sendFlag = sendData.sendFlag;
    param.writeMode = editorMode;
    param.uids = sendData.uids;
    param.folderName = sendData.folderName;
    param.charset = sendData.charset;
    param.massMode = false;
    param.content = contentValue;

    isAutoSave = true;

    if (isOcxUpload) {
        var ocx = document.uploadForm.powerupload;
        var cnt = ocx.GetAttachedFileCount();
        if (cnt > 0) {
            var hugeSize = ocx.GetAttachedSize("HUGE");
            if (hugeSize > 0) {
                jQuery.goConfirm(mailMsg.menu_draft, mailMsg.confirm_draftbigattach, function () {
                    for (var i = 0; i < cnt; i++) {
                        type = ocx.GetAttachedFileAttr(i, "attachtype");
                        if (type == "huge") {
                            ocx.RemoveAttachFile(ocx.GetAttachedFileAttr(i, "attachid"));
                        }
                    }
                    ocxUploadAndSendMessage(param);
                });
            } else {
                ocxUploadAndSendMessage(param);
            }
        } else {
            mailControl.sendMessage(param);
        }
    } else {
        param.attachList = getAttachString();
        var bigAttachInfo = makeBigAttachContent();
        if (bigAttachInfo.mode == "on") {
            jQuery.goConfirm(mailMsg.menu_draft, mailMsg.confirm_draftbigattach, function () {
                mailControl.sendMessage(param);
            });
        } else {
            mailControl.sendMessage(param);
        }
    }
}

function ocxUploadAndSendMessage(param) {
    if (!uploadOcxFile()) {
        isAutoSave = false;
        return;
    }
    param.attachList = getAttachString();
    mailControl.sendMessage(param);
}

function processMessageViewer(msg) {
    clearTimeout(autoSaveMessageTerm);
    jQuery("#processMessageContent").text(msg);
    jQuery("#processMessageWrap").fadeIn(500, function () {
        autoSaveMessageTerm = setTimeout(function () {
            jQuery("#processMessageWrap").fadeOut(500);
        }, 3000);
    });
}

function makeRcptForm(param) {
    if (!param) param = {};
    if (isRcptModeNormal) {
        var addrType = ["to", "cc", "bcc"];
        var addrArray = [];
        for (var i = 0; i < addrType.length; i++) {
            jQuery("#" + addrType[i] + "AddrWrap li span.name").each(function () {
                addrArray.push(jQuery(this).data("email"));
            });
            if (addrType[i] == "to") {
                param.to = addrArray.join(",");
            } else if (addrType[i] == "cc") {
                param.cc = addrArray.join(",");
            } else if (addrType[i] == "bcc") {
                param.bcc = addrArray.join(",");
            }
            addrArray = [];
        }
    } else {
        var toArray = [];
        var ccArray = [];
        var bccArray = [];
        var type;
        var value;
        jQuery("#writeRcptList li span.name").each(function () {
            type = jQuery(this).data("type");
            value = jQuery(this).data("email");
            if (type == "to") {
                toArray.push(value);
            } else if (type == "cc") {
                ccArray.push(value);
            } else if (type == "bcc") {
                bccArray.push(value);
            }
        });
        param.to = toArray.join(",");
        param.cc = ccArray.join(",");
        param.bcc = bccArray.join(",");
    }
    return param;
}

function getRcptFormCount() {
    var count = 0;
    if (isRcptModeNormal) {
        var addrType = ["to", "cc", "bcc"];
        for (var i = 0; i < addrType.length; i++) {
            jQuery("#" + addrType[i] + "AddrWrap li span.name").each(function () {
                count++;
            });
        }
    } else {

    }
    return count;
}

function resultAutoSave(data) {
    if (data.success) {
        processAutoSaveMessage("saveMessage", data);
    } else {
        processAutoSaveMessage("saveErrMessage");
    }
}

function openReservedLayerPopup() {
    var data = {};
    var hourArray = [];
    var minArray = [];
    var writeData = mailControl.getWriteData();
    var sendData = mailControl.getSendData();
    for (var i = 0; i < 24; i++) {
        hourArray.push(i);
    }
    for (var i = 0; i < 6; i++) {
        minArray.push(i * 10);
    }
    data.hourArray = hourArray;
    data.minArray = minArray;
    data.reservedDateInfo = writeData.reservedDateInfo;

    var utcDate = data.reservedDateInfo.reservedDateUtc;
    var utcFormatDate = moment(utcDate);
    if (sendData.reservation == "on") {
        utcFormatDate = moment(sendData.reservedDateUtc);
    }
    data.reservedDateInfo.todayDate = utcFormatDate.format('YYYY') + "-" + utcFormatDate.format('MM') + "-" + utcFormatDate.format('DD');
    data.reservedDateInfo.thour = utcFormatDate.format('HH');
    data.reservedDateInfo.tmin = utcFormatDate.format('mm');

    jQuery("#secureReservedLayerWrap").html(getHandlebarsTemplate("mail_layer_reserved_tmpl", data));
    jQuery("#reservedDate").datepicker({
        dateFormat: "yy-mm-dd", changeMonth: true, changeYear: true, yearSuffix: ""
    });
    jQuery("#mailReservedLayerWrap").on("click", "span,a", function (e) {
        var type = jQuery(this).attr("evt-rol");
        if (!type) return;
        if (type == "apply-reserved") {
            applyReservedMail();
        } else if (type == "reserved-layer-close") {
            closeReservedLayerPopup();
        }
    });
}

function applyReservedMail() {
    var reservedDate = jQuery.trim(jQuery("#reservedDate").val());
    if (reservedDate == "") {
        jQuery.goMessage(mailMsg.alert_emptyreserved);
        return;
    }
    var maxReservedDay = jQuery("#reservedDate").data("maxreservedday");
    var reservedDateArray = reservedDate.split('-');

    if (!checkReserveTime(reservedDateArray[0], reservedDateArray[1], reservedDateArray[2], jQuery("#reservedHour").val(), jQuery("#reservedMin").val(), maxReservedDay)) {
        return;
    }

    var param = mailControl.getSendData();
    param.reserveMail = true;
    var reservedLocalDate = moment(reservedDate + " " + jQuery("#reservedHour").val() + ":" + jQuery("#reservedMin").val(), "YYYY-MM-DD HH:mm");
    var localHour = reservedLocalDate.format("HH");
    var localMinute = reservedLocalDate.format("mm");
    param.reservedDateUtc = reservedLocalDate.utc().format();
    param.sendType = "reserved";
    mailControl.setSendData(param);

    var titleWrap = jQuery("#reservation_setting_info");
    titleWrap.empty();
    var titleObj = jQuery('<span class="data"></span>');
    titleObj.text(reservedDate + " " + localHour + mailMsg.comn_hour + " " + localMinute + mailMsg.comn_min);
    var deleteWrap = jQuery('<span title="' + mailMsg.comn_disabled + '" class="btn_wrap"></span>');
    var deleteObj = jQuery('<span class="ic_classic ic_del"></span>');
    deleteObj.click(function () {
        clearReservedData();
    });
    deleteWrap.append(deleteObj);
    titleWrap.append(titleObj).append(deleteWrap);
    titleWrap.closest("dl").addClass("option_on");

    closeReservedLayerPopup();
}

function closeReservedLayerPopup() {
    jQuery("#mailReservedLayerWrap").off();
    jQuery("#secureReservedLayerWrap").empty();
    jQuery(document).trigger("hideLayer.goLayer");
}

function clearReservedData() {
    var param = mailControl.getSendData();
    param.reserveMail = false;
    param.reservedDateUtc = "";
    param.sendType = "normal";
    mailControl.setSendData(param);
    jQuery("#reservation_setting_info").empty();
    jQuery("#reservation_setting_info").closest("dl").removeClass("option_on");
}

function openSecureMailLayerPopup(offset) {
    var data = {};
    jQuery("#secureReservedLayerWrap").html(getHandlebarsTemplate("mail_layer_securemail_tmpl", data));

    jQuery("#mailSecureLayerWrap").on("click", "span,a", function (e) {
        var type = jQuery(this).attr("evt-rol");
        if (!type) return;
        if (type == "apply-secure") {
            applySecureMail();
        } else if (type == "secure-layer-close") {
            closeSecureLayerPopup();
        }
    });
}

function applySecureMail() {

    if (!validateInputValue(jQuery("#securemailPass"), 2, 32, "searchMail")) {
        return;
    }

    if (!validateInputValue(jQuery("#securemailHint"), 2, 32, "searchMail")) {
        return;
    }

    var securePass = jQuery.trim(jQuery("#securemailPass").val());
    var secureHint = jQuery.trim(jQuery("#securemailHint").val());

    var param = mailControl.getSendData();
    param.secureMail = true;
    param.securePass = securePass;
    param.secureHint = secureHint;
    mailControl.setSendData(param);

    var titleWrap = jQuery("#secure_setting_info");
    titleWrap.empty();
    var titleObj = jQuery('<span class="data"></span>');
    titleObj.text(mailMsg.comn_use);
    var deleteWrap = jQuery('<span title="' + mailMsg.comn_disabled + '" class="btn_wrap"></span>');
    var deleteObj = jQuery('<span class="ic_classic ic_del"></span>');
    deleteObj.click(function () {
        clearSecureMailData();
    });
    deleteWrap.append(deleteObj);
    titleWrap.append(titleObj).append(deleteWrap);
    titleWrap.closest("dl").addClass("option_on");

    closeSecureLayerPopup();
}

function closeSecureLayerPopup() {
    jQuery("#mailSecureLayerWrap").off();
    jQuery("#secureReservedLayerWrap").empty();
    jQuery(document).trigger("hideLayer.goLayer");
}

function clearSecureMailData() {
    var param = mailControl.getSendData();
    param.secureMail = false;
    param.securePass = "";
    param.secureHint = "";
    mailControl.setSendData(param);

    jQuery("#secure_setting_info").empty();
    jQuery("#secure_setting_info").closest("dl").removeClass("option_on");
}

function makeSignListItem(data) {
    data = (!data) ? {} : data;
    var useAttach = jQuery("#signListWrap").data("attach");
    data.useAttach = (useAttach) ? true : false;
    jQuery("#signListWrap").html(getHandlebarsTemplate("mail_layer_sign_tmpl", data));
    jQuery("#signSelect").on("change", function () {
        callSignData(jQuery("#signSelect option:selected").val());
    });
}

function callSignData(signSeq) {
    if (signSeq == 0) {
        editorControl.setSignData("");
        return;
    }
    var param = {"signSeq": signSeq};
    mailControl.signContent(param, function (data) {
        editorControl.setSignData(data);
    });
}

function sendMessage(type) {

    if (!uploadAttachFilesComplete) {
        jQuery.goAlert(mailMsg.alert_upload_progress);
        return;
    }

    if (sendAllowUsed && type != "draft" && !isSendAllowed()) {
        jQuery.goAlert("", mailMsg.sendallow_msg3);
        return;
    }

    isSendWork = true;

    if (isRcptModeNoneAC) {
        sendMailType = type;
        searchRcptAddrName();
        newSendMessage(sendMailType);
    } else {
        newSendMessage(type);
    }
}

var writeType = false;
var writeParam = false;

function isSendAllowed() {
    var sendAllowedChecked = false;
    var param = makeRcptForm();
    var massFilePath = getRcptFilePath();
    if (massFilePath != "") {
        param.massRcpt = massFilePath;
    }
    mailControl.checkSendAllow(param, function (data) {
        sendAllowedChecked = data;
    });

    return sendAllowedChecked;
}

function newSendMessage(type) {
    if (!uploadAttachFilesComplete) {
        jQuery.goAlert(mailMsg.alert_upload_progress);
        return;
    }
    var param = mailControl.getSendData();
    param = makeRcptForm(param);

    var checkSendInfo = false;
    var to = param.to;
    var cc = param.cc;
    var bcc = param.bcc;

    if (type != "draft") {
        var massFilePath = getRcptFilePath();
        if (massFilePath == "") {
            param.massMode = false;
            if (jQuery.trim(to) == "") {
                jQuery.goAlert(mailMsg.error_norecipient);
                jQuery("#to").focus();
                return;
            }
            if (!checkEmailInvalidAddress(to)) {
                return;
            }
            if (!checkEmailInvalidAddress(cc)) {
                return;
            }
            if (!checkEmailInvalidAddress(bcc)) {
                return;
            }
            if (isSendInfoCheckUse || isSendEmailCheckUse || isSendAttachCheckUse || isSendKeywordCheckUse) {
                checkSendInfo = true;
            }
        } else {
            param.massRcpt = massFilePath;
            param.massMode = true;
            jQuery("#onesend").attr("checked", true);
        }

        var signSeq = jQuery("#signSelect").val();
        if (signSeq && signSeq > 0) {
            param.attachSign = true;
            param.signSeq = signSeq;
        } else {
            param.attachSign = false;
            param.signSeq = "";
        }
        param.senderMode = jQuery("#senderMode").val() == "on" ? true : false;
        param.senderUserEmail = jQuery("#senderUserEmail").val();
        param.useAliasEmail = jQuery("#senderUserEmail option:selected").attr('alias') == "true";

        if (param.reserveMail) {
            type = "reserved";
        } else {
            type = "normal";
        }
    }
    param.sendType = type;

    var subject = jQuery.trim(jQuery("#subject").val());
    if (subject == "") {
        jQuery.goAlert(mailMsg.alert_nosubject);
        jQuery("#subject").focus();
        return;
    }

    param.subject = subject;
    param.writeMode = jQuery("#editorMode").data("mode");

    var mode = jQuery("#editorMode").data("mode");
    var content = "";

    if (mode == "html") {
        if (!editorControl.oEditor.validate()) {
            jQuery.goError(mailMsg.mail_mime_size_exceed);
            return false;
        }
        content = getHtmlMessage("ascheck");
    } else {
        content = jQuery.trim(getTextMessage());
    }

    if (!checkSendMailCount(param)) {
        return;
    }

    if (checkSendInfo) {
        param.sendEmailCheckResult = false;
        param.sendAttachCheckResult = false;
        param.sendKeywordCheckResult = false;
        param.sendInfoCheck = false;

        if (isSendEmailCheckUse) {

            var to = getEmailArray(param.to);
            var cc = (!param.cc || jQuery.trim(param.cc) == "") ? "" : getEmailArray(param.cc);
            var bcc = (!param.bcc || jQuery.trim(param.bcc) == "") ? "" : getEmailArray(param.bcc);

            if (cc != "") {
                to = to.concat(cc);
            }

            if (bcc != "") {
                to = to.concat(bcc);
            }

            var emailArray = new Array();
            var emailGroupArray = new Array();
            var emailGroupIndex = 0;
            var emailArrayIndex = 0;
            var emailValue;

            for (var i = 0; i < to.length; i++) {
                emailValue = get_email(to[i]);
                if ((emailValue.indexOf("$") == 0 || emailValue.indexOf("#") == 0 || emailValue.indexOf("!") == 0) ? true : false) {
                    emailGroupArray[emailGroupIndex] = emailValue;
                    emailGroupIndex++;
                } else {
                    emailArray[emailArrayIndex] = emailValue;
                    emailArrayIndex++;
                }
            }


            var emailParam = {};
            emailParam.emailArray = emailArray;

            if (emailArray.length != 0) {
                ActionLoader.postSyncGoLoadAction("/api/mail/address/search/external", emailParam, function (data) {
                    param.sendEmailCheckResult = (data) ? true : false;
                }, "json");
            } else {
                param.sendEmailCheckResult = false;
            }
        }

        if (isSendAttachCheckUse) {
            var cnt;
            if (isOcxUpload) {
                var ocx = document.uploadForm.powerupload;
                cnt = ocx.GetAttachedFileCount();
            } else {
                var hfileList = basicAttachUploadControl.getFileList("huge");
                var nfileList = basicAttachUploadControl.getFileList("normal");
                jQuery.merge(hfileList, nfileList);
                cnt = hfileList.length;
            }

            var keyword = sendAttachData;

            if (searchContentKeyword(content, keyword, /,/g)) {
                if (cnt > 0) {
                    param.sendAttachCheckResult = false;
                } else {
                    param.sendAttachCheckResult = true;
                }
            }
        }
        if (isSendKeywordCheckUse) {
            var keyword = sendKeywordData;

            if (searchContentKeyword(content, keyword, /\\\\/g)) {
                param.sendKeywordCheckResult = true;
            } else {
                param.sendKeywordCheckResult = false;
            }
        }
        if (isSendInfoCheckUse) {
            param.sendInfoCheck = true;
        }

        if (param.sendEmailCheckResult || param.sendAttachCheckResult || param.sendKeywordCheckResult || param.sendInfoCheck) {
            mailControl.setSendData(param);
            checkSendInfoValue(param);
        } else {
            sendMessageParamProcess(param);
        }

    } else {
        sendMessageParamProcess(param);
    }

}

function searchContentKeyword(content, keyword, delimiter) {
    var mode = jQuery("#editorMode").data("mode");

    if (mode == 'html') {
        content = unescape_tag_title(content);
    }

    var specials = new RegExp("[.*+?|()\\[\\]\\^\\${}\\\\]", "g"); // .*+?|()[]{}\
    keyword = keyword.replace(specials, "\\$&");
    var kFormat = keyword.replace(delimiter, '|');
    return content.match(new RegExp("(" + kFormat + ")", "gi"));
}

function getEmailAddrNoPersonal(wrapId) {
    var toWrap = jQuery("#" + wrapId);
    var len = toWrap.children().length;
    var addrData = "";
    if (len > 0) {
        toWrap.children().each(function (i) {
            var wrapBlock = jQuery(this).css("display");
            if (wrapBlock == "block") {
                if (i === len - 1) {
                    addrData += get_email(unescape_tag(jQuery(this).attr("data-addr")));
                } else {
                    addrData += get_email(unescape_tag(jQuery(this).attr("data-addr"))) + ",";
                }
            }
        });
    }
    return addrData;
}

function checkSendInfoValue(param) {
    var attachArray = [];

    if (isOcxUpload) {
        var ocx = document.uploadForm.powerupload;
        var cnt = ocx.GetAttachedFileCount();
        for (var i = 0; i < cnt; i++) {
            attachArray.push({
                name: Base64TMS.decode(ocx.GetAttachedFileAttr(i, "FILENAME2")),
                id: ocx.GetAttachedFileAttr(i, "attachid"),
                size: ocx.GetAttachedFileAttr(i, "SIZE")
            });
        }
    } else {
        var hfileList = basicAttachUploadControl.getFileList("huge");
        var nfileList = basicAttachUploadControl.getFileList("normal");
        jQuery.merge(hfileList, nfileList);
        for (var i = 0; i < hfileList.length; i++) {
            attachArray.push({name: hfileList[i].name, id: hfileList[i].id, size: hfileList[i].size});
        }
    }

    var data = {};
    data.subject = param.subject;
    data.toList = getEmailArray(param.to);
    data.ccList = (!param.cc || jQuery.trim(param.cc) == "") ? null : getEmailArray(param.cc);
    data.bccList = (!param.bcc || jQuery.trim(param.bcc) == "") ? null : getEmailArray(param.bcc);
    data.attachList = attachArray;
    data.sendEmailCheckResult = param.sendEmailCheckResult;
    data.sendAttachCheckResult = param.sendAttachCheckResult;
    data.sendKeywordCheckResult = param.sendKeywordCheckResult;
    data.sendInfoCheck = param.sendInfoCheck;

    var buttons;
    if (isSendInfoCheckUse) {
        buttons = [{
            btype: 'confirm', btext: mailMsg.menu_send, callback: checkSendMessage, autoclose: false
        }, {btype: 'cancel', btext: mailMsg.comn_setting, callback: settingWriteInfo}, {
            btype: 'cancel', btext: mailMsg.comn_cancel, callback: cancelSend, autoclose: true
        }];
    } else {
        buttons = [{
            btype: 'confirm', btext: mailMsg.menu_send, callback: checkSendMessage, autoclose: false
        }, {btype: 'cancel', btext: mailMsg.comn_cancel, callback: cancelSend, autoclose: true}];
    }

    jQuery.goPopup({
        id: 'mail_send_allow_check_popup',
        pclass: 'layer_normal layer_prevent_receiveError',
        header: mailMsg.mail_rcptcheck,
        width: 600,
        contents: getHandlebarsTemplate("mail_send_allow_check_tmpl", data),
        buttons: buttons
    });
}

function cancelSend() {
    isSendWork = false;
    var sendData = mailControl.getSendData();
    var initdata = mailControl.getInitSendData();
    if (sendData.letterMode == "on") {
        initdata.letterMode = "on";
        initdata.letterSeq = sendData.letterSeq;
        initdata.letterData = sendData.letterData;
    }

    if (sendData.reserveMail) {
        initdata.reserveMail = true;
        initdata.reservedDateUtc = sendData.reservedDateUtc;
        initdata.sendType = "reserved";
    }

    if (sendData.secure == "on") {
        initdata.secure = "on";
        initdata.securePass = sendData.securePass;
        initdata.secureHint = sendData.secureHint;
    }

    initdata.draftMessageId = sendData.draftMessageId;

    mailControl.setSendData(initdata);
}

function checkSendMessage() {
    var param = mailControl.getSendData();
    if (isSendInfoCheckUse) {
        var toList = getCheckSendInfoValue("to");
        if (!toList || toList.length == 0) {
            jQuery.goMessage(mailMsg.mail_rcpt_to_noselect);
            return;
        }
        settingWriteInfo();
        jQuery.goPopup.close();
        param = makeRcptForm(param);
    } else {
        jQuery.goPopup.close();
    }
    sendMessageParamProcess(param);
}

function settingWriteInfo() {
    var toList = getCheckSendInfoValue("to");
    var ccList = getCheckSendInfoValue("cc");
    var bccList = getCheckSendInfoValue("bcc");
    if (isRcptModeNormal) {
        deleteAddressUnitFormatAll("to");
        deleteAddressUnitFormatAll("cc");
        deleteAddressUnitFormatAll("bcc");
    } else {
        deleteSearchAddressUnitFormatAll();
    }
    if (toList && toList.length > 0) {
        for (var i = 0; i < toList.length; i++) {
            insertRcptEmail("to", toList[i]);
        }
    }
    if (ccList && ccList.length > 0) {
        for (var i = 0; i < ccList.length; i++) {
            insertRcptEmail("cc", ccList[i]);
        }
    }
    if (bccList && bccList.length > 0) {
        for (var i = 0; i < bccList.length; i++) {
            insertRcptEmail("bcc", bccList[i]);
        }
    }
    settingWriteInfoAttach();
}

function settingWriteInfoAttach() {
    jQuery("#basicAttachList input[name='basicAttachFileEl']").attr("checked", false);
    jQuery("#mail_send_allow_check_popup input[name=attachFile]").each(function () {
        if (!jQuery(this).attr("checked")) {
            var value = jQuery(this).val();
            if (isOcxUpload) {
                ocx.RemoveAttachFile(value);
            } else {
                jQuery("#" + value).attr("checked", true);
            }
        }
        if (!isOcxUpload) {
            deletefile();
        }
    });
}

function sendMessageParamProcess(param) {
    var type = param.sendType;

    if (directedApproverFilter(param)) {
        return;
    }

    if (isAutoSave) {
        jQuery.goAlert(mailMsg.write_alert008);
        return;
    }

    param.content = getMessageContent(type);

    var quotaInfo = folderControl.getQuotaInfo();
    if (Number(quotaInfo.percent) >= 100) {
        if (type == "draft") {
            jQuery.goAlert(mailMsg.mail_send_quotaover_draft);
            return;
        } else {
            jQuery.goConfirm(mailMsg.mail_quota_over, mailMsg.mail_send_quotaover_confirm, function () {
                jQuery("#savesent").attr("checked", false);
                jQuery("#receivenoti").attr("checked", false);
                mailControl.setSendData(param);
                clearReservedData();
                clearSecureMailData();
                param = mailControl.getSendData();

                if (jQuery("#onesend").attr("checked")) {
                    param.oneSend = true;
                }
                if (jQuery("#priority").attr("checked")) {
                    param.priority = 'HIGH';
                }
                if (jQuery("#vcardAttach").attr("checked")) {
                    param.attachVcard = true;
                }

                if (isOcxUpload) {
                    if (!uploadOcxFile()) {
                        return;
                    }
                }
                requestSendAction(param);
            });
        }
    } else {
        sendNormalMessage(param);
    }
}

function sendNormalMessage(param) {
    var type = param.sendType;
    var sendConfirmMsg = mailMsg.mail_send_confirm;
    if (type != "draft") {
        if (jQuery("#onesend").attr("checked")) {
            param.oneSend = true;
        }
        if (jQuery("#priority").attr("checked")) {
            param.priority = 'HIGH';
        }
        if (jQuery("#vcardAttach").attr("checked")) {
            param.attachVcard = true;
        }
        if (jQuery("#receivenoti").attr("checked")) {
            if ((param.writeMode == "html" && notiMode == 'link') || (notiMode == 'mail')) {
                param.receiveNoti = true;
            }
        }
        if (jQuery("#savesent").attr("checked")) {
            param.saveSent = true;
        }
        if (param.secureMail) {
            sendConfirmMsg = mailMsg.mail_secure_confirm;
        }
    } else {
        param.letterMode = "off";
        if (param.secureMail) {
            jQuery.goAlert(mailMsg.error_secure_draft);
            return;
        }
        if (!processDraftHuseFile()) {
            return;
        }
        sendConfirmMsg = mailMsg.mail_send_drafts_confirm;
    }
    var sendConfirmTitle = (param.sendType == "draft") ? mailMsg.menu_draft : mailMsg.mail_send_title;

    makeProcessLoader();
    if (!sendConfirm) {
        if (isOcxUpload) {
            if (!uploadOcxFile()) {
                return;
            }
        }
        requestSendAction(param);
    } else {
        jQuery.goConfirm(sendConfirmTitle, sendConfirmMsg, function () {
            jQuery("#gpopupLayer").hide();
            jQuery(this)[0].autoclose = true;
            makeProcessLoader();
            if (isOcxUpload) {
                if (!uploadOcxFile()) {
                    return;
                }
            }
            requestSendAction(param);
        }, function () {
            cancelSend();
        });
    }

}

function requestSendAction(param) {
    var isHugeFileInfoCheck = false;
    var actionParam = {};
    var hfileIdx = [];
    var hfileName = [];
    var hfilePath = [];
    var hfileSize = [];

    param.attachList = getAttachString();
    if (isOcxUpload) {
        var ocx = document.uploadForm.powerupload;
        var cnt = ocx.GetAttachedFileCount();
        var type, uid;
        for (var i = 0; i < cnt; i++) {
            type = ocx.GetAttachedFileAttr(i, "TYPE");
            uid = ocx.GetAttachedFileAttr(i, "UID");
            if (type == "huge" && (!uid || uid == "")) {
                isHugeFileInfoCheck = true;
                hfileIdx.push(i);
                hfileName.push(ocx.GetAttachedFileAttr(i, "FILENAME"));
                hfilePath.push(ocx.GetAttachedFileAttr(i, "FILEPATH"));
                hfileSize.push(ocx.GetAttachedFileAttr(i, "SIZE"));
            }
        }
    } else {
        var hugeFiles = basicAttachUploadControl.getFileList("huge");
        var uid;
        if (hugeFiles) {
            for (var i = 0; i < hugeFiles.length; i++) {
                uid = hugeFiles[i].uid;
                if ((!uid || uid == "" || uid == "0")) {
                    isHugeFileInfoCheck = true;
                    hfileIdx.push(hugeFiles[i].id);
                    hfileName.push(hugeFiles[i].name);
                    hfilePath.push(hugeFiles[i].path);
                    hfileSize.push(hugeFiles[i].size);
                }
            }
        }
    }

    if (!isHugeFileInfoCheck) {
        var bigAttachInfo = makeBigAttachContent();
        param.bigAttachContent = bigAttachInfo.html;
        param.bigAttachMode = bigAttachInfo.mode;
        param.bigAttachLinks = bigAttachInfo.links;
        mailControl.sendMessage(param);
        /*destroyBasicUploadControl();
        destroyMassUploadControl();
        destoryEditorControl();*/
    } else {
        actionParam.hidx = hfileIdx;
        actionParam.hfileName = hfileName;
        actionParam.hfilePath = hfilePath;
        actionParam.hfileSize = hfileSize;
        actionParam.regdate = today.getTime();

        mailControl.bigAttachUpdate(actionParam, param);
    }
    makeProcessLoader();
}

function sendForBigAttach(data, param) {
    var fid;
    if (isOcxUpload) {
        var ocx = document.uploadForm.powerupload;
        for (var i = 0; i < data.length; i++) {
            fid = ocx.GetAttachedFileAttr(parseInt(data[i].fileIndex), "attachid");
            ocx.SetAttachedFileAttr2(fid, "UID", data[i].messageUid);
        }
    } else {
        var hugeFile;
        for (var i = 0; i < data.length; i++) {
            hugeFile = basicAttachUploadControl.getAttachFileInfo("huge", data[i].fileIndex);
            hugeFile.uid = data[i].messageUid;
            basicAttachUploadControl.setAttachFileInfo("huge", data[i].fileIndex, hugeFile);
        }
    }
    var bigAttachInfo = makeBigAttachContent();
    param.bigAttachContent = bigAttachInfo.html;
    param.bigAttachMode = bigAttachInfo.mode;
    param.bigAttachLinks = bigAttachInfo.links;

    mailControl.sendMessage(param);
    destroyBasicUploadControl();
    destroyMassUploadControl();
}

function processDraftHuseFile() {
    var hugeSize;
    if (isOcxUpload) {
        var ocx = document.uploadForm.powerupload;
        var count = ocx.GetAttachedFileCount();
        hugeSize = ocx.GetAttachedSize("HUGE");
        if (hugeSize > 0) {
            if (!confirm(mailMsg.confirm_draftbigattach)) {
                return false;
            }
        }
        for (var i = count - 1; i >= 0; i--) {
            fileType = ocx.GetAttachedFileAttr(i, "attachtype");
            if (fileType == "huge") {
                id = ocx.GetAttachedFileAttr(i, "attachid");
                ocx.RemoveAttachFile(id);
            }
        }
    } else {
        hugeSize = basicAttachUploadControl.getAttachSize("hugeUse");
        if (hugeSize > 0) {
            if (!confirm(mailMsg.confirm_draftbigattach)) {
                return false;
            }
        }
        var hugeFileList = basicAttachUploadControl.getFileList("huge");
        for (var i = 0; i < hugeFileList.length; i++) {
            basicAttachUploadControl.deleteAttachList(hugeFileList[i].id);
        }
    }
    return true;
}

function viewQuickList(type) {
    checkEscapeWriteMode(function () {
        var param = {};
        param = mailControl.getSharedFolderParam(param);
        param.folder = currentFolderName;
        param.page = 1;

        if (type == "TODAY") {
            param.adv = "on";
            param.sdate = "TODAYS";
            param.edate = "TODAYE";
        } else if (type == "YESTERDAY") {
            param.adv = "on";
            param.sdate = "YESTERDAYS";
            param.edate = "YESTERDAYE";
        } else {
            param.flag = type;
        }
        mailControl.loadMessageList(param);
    });
}

function makeTagToolbar() {
    var tagList = folderControl.getTagData();
    if (!tagList || tagList.length == 0) {
        jQuery.goAlert(mailMsg.mail_tag_empty);
        return;
    }

    var uidArray = getMailListCheckedIdArray();
    var totalCount = 0;
    var idPrefix = "tag";
    if (currentMenu == "read" && layoutMode == "n") {
        idPrefix = "read_" + idPrefix;
    }
    for (var i = 0; i < tagList.length; i++) {
        for (var j = 0; j < uidArray.length; j++) {
            var tagCount = jQuery("#" + idPrefix + "_" + getFolderNameId(uidArray[j]) + "_" + tagList[i].id).length;
            if (tagCount > 0) {
                totalCount++;
                tagList[i].containsTag = true;
                break;
            } else {
                tagList[i].containsTag = false;
            }
        }
    }
    jQuery("#mailListTagBox").width((totalCount > 0) ? ((LOCALE == "en") ? "265px" : "250px") : "205px");

    mailControl.makeToolbarTagList(tagList);
}

function makeCopyMoveToolbar() {
    var userFolder = folderControl.getUserFolderList();
    userFolder.isInbox = true;
    jQuery("#toolbarInboxMoveMessageList").handlebars("mail_toolbar_user_folder_tmpl", userFolder);
    if (jQuery("#toolbarInboxMoveMessageList li").length > 0) {
        jQuery("#inboxToggleFolder").show();
    }
    userFolder.isInbox = false;
    jQuery("#toolbarMoveMessageList").handlebars("mail_toolbar_user_folder_tmpl", userFolder);
    jQuery("#checkMessageCopy").attr("checked", false);
}

function messageTaggingManager(tagId, flag) {
    var uidArray = getMailListCheckedIdArray();
    var params = getListProcessParams(uidArray);
    var tagParam = {"addFlag": flag, "tagId": tagId, "folderNames": params.fnames, "uids": params.uids};
    mailControl.taggingMessage(tagParam);
}

function selfRemoveMessageTagging(folder, uid, tagId) {
    var tagParam = {"addFlag": "false", "tagId": tagId, "folderNames": [folder], "uids": [uid]};
    mailControl.taggingMessage(tagParam);
}

function deleteMessage() {
    var hasTrash = isContainedTrashMail();
    if (!hasTrash && currentFolderType != "trash" && currentFolderType != "reserved") {
        deleteMessageAction();
    } else {
        var msg = "";
        if (hasTrash || currentFolderType == "trash") {
            msg = mailMsg.confirm_trashdelete;
        } else if (currentFolderType == "reserved") {
            msg = mailMsg.confirm_reserveddelete;
        }
        jQuery.goConfirm(mailMsg.mail_message_delete, msg, function () {
            deleteMessageAction();
        });
    }
}

function deleteMessageAction() {
    var allCheck = ("on" == jQuery("#mailListAllCheck").val());
    if (allCheck) {
        allSelectAction("delete", "");
    } else {
        var uidArray = getMailListCheckedIdArray();
        var params = getListProcessParams(uidArray);
        var messageParam = {"folderNames": params.fnames, "uids": params.uids};
        mailControl.deleteMessages(messageParam);
    }
}

function deleteMdn() {
    var midArray = new Array();
    getMailListCheckedObj().each(function () {
        midArray.push(jQuery(this).val());
    });
    mailControl.deleteMdn({"messageIds": midArray});
}

function cleanMessage() {
    var allCheck = ("on" == jQuery("#mailListAllCheck").val());
    var msgCheckCnt = getMailListCheckedCount();
    var listTotalCnt = jQuery("#pageNaviWrap").data("total");
    msgCheckCnt = (allCheck) ? listTotalCnt : msgCheckCnt;

    jQuery.goConfirm(mailMsg.menu_deleteforever, msgArgsReplace(mailMsg.confirm_clean, [msgCheckCnt]), function () {
        jQuery("#gpopupLayer").hide();
        jQuery(this)[0].autoclose = false;
        if (allCheck) {
            allSelectAction("clean", "");
        } else {
            var uidArray = getMailListCheckedIdArray();
            var params = getListProcessParams(uidArray);
            var messageParam = {"folderNames": params.fnames, "uids": params.uids};
            mailControl.cleanMessages(messageParam);
            //jQuery.goSlideMessage(mailMsg.mail_complete_delete_mail,"caution");
        }

    });
}

function downloadMessage() {
    var uidArray = getMailListCheckedIdArray();
    var params = getListProcessParams(uidArray);
    var messageParam = {"folder": params.fnames, "uids": params.uids};
    messageParam = mailControl.getSharedFolderParam(messageParam);

    if (uidArray.length > 1) {
        // 2014.07.03 window 기본 zip에서 한글 압축 파일명 안보이는 현상으로 사용자에게 utf-8 지원 유틸 사용하도록 유도
        jQuery.goAlert(mailMsg.mail_attach_all_save_title, mailMsg.mail_attach_all_save_message);
    }

    mailControl.downloadMessages(messageParam);
}

function copyMoveMessage(toFolderName) {
    var copyMoveType = "move";
    if (jQuery("#checkMessageCopy").attr("checked") || jQuery("#onlyMessageCopy").attr("checked")) {
        copyMoveType = "copy";
    }
    var allCheck = ("on" == jQuery("#mailListAllCheck").val());
    if (allCheck) {
        allSelectAction(copyMoveType, toFolderName);
    } else {
        var uidArray = getMailListCheckedIdArray();
        var params = getListProcessParams(uidArray);
        var copyMoveParam = {"fromFolders": params.fnames, "uids": params.uids, "toFolder": toFolderName};
        if (copyMoveType == "copy") {
            mailControl.copyMessage(copyMoveParam);
        } else if (copyMoveType == "move") {
            mailControl.moveMessage(copyMoveParam);
        }
    }
}

function allSelectAction(actionType, targetFolder) {
    var param = mailControl.getListParam();
    param.actionType = actionType;
    param.targetFolder = targetFolder;

    mailControl.allSelectMessageProcess(param);
}

function changeSeenFlag(isSeen) {
    var uidArray = getMailListCheckedIdArray();
    var msgInfo = getListProcessParams(uidArray);

    var type = "seen";
    var allCheck = ("on" == jQuery("#mailListAllCheck").val());
    if (allCheck) {
        var param = mailControl.getListParam();
        param.actionType = type;
        param.targetFolder = "";
        param.flagType = "S";
        param.used = isSeen;
        mailControl.allSelectMessageProcess(param);
    } else {
        mailControl.switchMessagesFlags(msgInfo.uids, msgInfo.fnames, "S", isSeen);
    }
}

function replyWrite(type) {

    if (getMailListCheckedCount() > 1) {
        jQuery.goAlert(mailMsg.error_replyone);
        return;
    }

    var uidArray = getMailListCheckedIdArray();
    var msgInfo = getListProcessParams(uidArray);

    var params = {};
    params.folderName = msgInfo.fnames[0];
    params.uids = msgInfo.uids;
    params.wtype = type;
    mailControl.getSharedFolderParam(params);
    goWrieLoad(params);
}

function forwardMessage(fwtype) {

    var uidArray = getMailListCheckedIdArray();
    var msgInfo = getListProcessParams(uidArray);

    var params = {};
    params.folderName = msgInfo.fnames[0];
    params.uids = msgInfo.uids;
    params.fwmode = fwtype;
    params.wtype = "forward";
    mailControl.getSharedFolderParam(params);
    goWrieLoad(params);
}

function printMessage() {
    if (getMailListCheckedCount() > 1) {
        jQuery.goAlert(mailMsg.error_printone);
        return;
    }

    var uidArray = getMailListCheckedIdArray();
    var msgInfo = getListProcessParams(uidArray);

    var param = {};
    param.folder = msgInfo.fnames[0];
    param.uid = msgInfo.uids[0];
    param = mailControl.getSharedFolderParam(param);
    param.viewImg = true;
    param.action = "print";
    POPUPDATA = param;

    window.open("/app/mail/popup", "printPopup", "scrollbars=yes,width=1280,height=640,resizable=yes");
}

function addMessageFilter() {

    if (getMailListCheckedCount() > 1) {
        jQuery.goAlert(mailMsg.mail_filter_select_one);
        return;
    }

    var folderList = folderControl.getUserFolderList();
    var tagList = folderControl.getTagData();
    var checkedObj = getMailListCheckedObj();
    var from;
    var to;
    if (!MAIL_EXPOSURE) {
        from = getEmailNotInCompanyDomain(companyDomainList, checkedObj.data("femail"));
        to = getEmailNotInCompanyDomain(companyDomainList, checkedObj.data("temail"));
    } else {
        from = jQuery.trim(get_email(checkedObj.data("femail")));
        to = jQuery.trim(get_email(checkedObj.data("temail")));
    }
    var subject = "";
    if (currentMenu == "read" && layoutMode == "n") {
        subject = checkedObj.attr("subject");
    } else {
        subject = jQuery.trim(checkedObj.closest("tr").find("span.subject").text());
    }
    var data = {"from": from, "to": to, "subject": subject, "folderList": folderList, "tagList": tagList};
    jQuery.goPopup({
        id: 'mail_message_filter_popup',
        pclass: 'layer_normal layer_auto',
        header: mailMsg.menu_rule,
        width: 500,
        contents: getHandlebarsTemplate("mail_layer_filter_tmpl", data),
        openCallback: function () {
            jQuery("#mail_message_filter_popup input[name='filterCondOption']").click(function () {
                if (jQuery("#mail_message_filter_popup input[name='filterCondOption']:checked").length > 1) {
                    jQuery("#filterCondOperationWrap").show();
                } else {
                    jQuery("#filterCondOperationWrap").hide();
                }
            });

            jQuery("#mail_message_filter_popup  input[placeholder]").placeholder();
            jQuery("#mail_message_filter_popup div.layer_pallete").on("click", "a", function (e) {
                jQuery("#mail_message_filter_popup div.layer_pallete a").removeClass("active");
                jQuery(this).addClass("active");
                setTimeout(function () {

                    jQuery('#mail_message_filter_popup input[placeholder]').placeholder();
                }, 3000);
            });
        },
        closeCallback: function () {
            jQuery("#mail_message_filter_popup div.layer_pallete").off();
        },
        buttons: [{
            btype: 'confirm', btext: mailMsg.comn_confirm, callback: saveMessageFilter, autoclose: false
        }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
    });
}

function saveMessageFilter() {

    var filterCondOption = jQuery("#mail_message_filter_popup input[name=filterCondOption]:checked");
    if (filterCondOption.length == 0) {
        jQuery.goSlideMessage(mailMsg.comn_error_001, "caution");
        return;
    }
    var param = {};
    var subcondList = [];
    var isSuccess = true;
    filterCondOption.each(function () {
        var cond = jQuery(this).val();
        if (cond == "from") {
            var value = jQuery.trim(jQuery("#filterFrom").val().toLowerCase());
            if (value == "") {
                jQuery.goSlideMessage(mailMsg.conf_filter_1, "caution");
                jQuery("#filterFrom").focus();
                isSuccess = false;
                return false;
            }
            subcondList.push({"field": "FROM", "pattern": value})
        } else if (cond == "to") {
            var value = jQuery.trim(jQuery("#filterTo").val().toLowerCase());
            if (value == "") {
                jQuery.goSlideMessage(mailMsg.conf_filter_1, "caution");
                jQuery("#filterTo").focus();
                isSuccess = false;
                return false;
            }
            subcondList.push({"field": "TO", "pattern": value})
        } else if (cond == "subject") {
            var value = jQuery.trim(jQuery("#filterSubject").val());
            if (value == "") {
                jQuery.goSlideMessage(mailMsg.conf_filter_1, "caution");
                jQuery("#filterSubject").focus();
                isSuccess = false;
                return false;
            }
            if (!validateInputValue(jQuery("#filterSubject"), 0, 255, "onlyBack")) {
                jQuery("#filterSubject").focus();
                isSuccess = false;
                return false;
            }
            subcondList.push({"field": "SUBJECT", "pattern": value})
        }
    });

    if (!isSuccess) return;

    param.subcondList = subcondList;

    var filterOperation = jQuery("#mail_message_filter_popup input[name=filterOperation]:checked").val();
    param.operation = filterOperation;

    var autoFilterSelect = jQuery("#mail_message_filter_popup input[name=filterOption]:checked").val();
    var makeFolder = false;
    var makeFolderName = "";
    var makeTag = false;
    var makeTagName = "";
    var makeTagColor = "";

    if (autoFilterSelect == "extBox") {
        param.policy = "move " + jQuery("#filterFolder").val();
    } else if (autoFilterSelect == "newBox") {
        var newBoxObj = jQuery("#filterNewMailBox");
        var newBox = jQuery.trim(newBoxObj.val());
        if (newBox == "" || newBoxObj.hasClass("placeholder")) {
            jQuery.goMessage(mailMsg.conf_filter_37);
            newBoxObj.focus();
            return;
        }
        if (!validateInputValue(newBoxObj, 2, 32, "folderName")) {
            return;
        }

        var newPolicy = jQuery("#filterParentFolder").val();
        if (newPolicy == "") {
            makeFolderName = newBox;
        } else {
            makeFolderName = newPolicy + "." + newBox;
        }
        makeFolder = true;
    } else if (autoFilterSelect == "extTag") {
        var tagId = jQuery("#filterTagList").val();
        if (tagId == "") {
            jQuery.goMessage(mailMsg.mail_tag_select_msg);
            return;
        }
        param.policy = "tag " + tagId;
    } else if (autoFilterSelect == "newTag") {
        var newTagNameObj = jQuery("#filterNewTagName");
        var tagName = jQuery.trim(newTagNameObj.val());

        if (tagName == "" || newTagNameObj.hasClass("placeholder")) {
            jQuery.goMessage(mailMsg.mail_tag_add_msg);
            newTagNameObj.focus();
            return;
        }

        if (!checkInputLength("jQuery", newTagNameObj, mailMsg.conf_filter_1, 2, 32)) {
            return;
        }

        if (isExistTagName(tagName)) {
            jQuery.goSlideMessage(mailMsg.alert_tag_samename, "caution");
            return;
        }

        var tagList = folderControl.getTagData();
        if (tagList && tagList.length >= 300) {
            jQuery.goMessage(mailMsg.mail_tag_insert_limit);
            return;
        }
        makeTag = true;
        makeTagName = tagName;

        var tagColor = jQuery("#filterNewTagList a.active").attr("color");
        makeTagColor = tagColor;
    } else {
        jQuery.goMessage(mailMsg.conf_filter_1);
        return;
    }

    if (makeFolder) {
        folderControl.addFolderAfterFunc(makeFolderName, function () {
            param.policy = "move " + makeFolderName;
            mailControl.saveMailFilter(param);
        });
    } else if (makeTag) {
        var tagParam = {"tagName": makeTagName, "tagColor": makeTagColor};
        folderControl.addTagAfterFunc(tagParam, function () {
            folderControl.getTagListAfterFunc(function (data) {
                folderControl.makeTagList(data);
                var tagId = "";
                for (var i = 0; i < data.length; i++) {
                    if (data[i].name == tagName) {
                        tagId = data[i].id;
                        break;
                    }
                }
                param.policy = "tag " + tagId;
                mailControl.saveMailFilter(param);
            });
        });
    } else {
        mailControl.saveMailFilter(param);
    }
}

function saveMessageFilterResult(param, data) {
    jQuery.goConfirm(mailMsg.menu_rule, mailMsg.list_filter01, function () {
        jQuery("#gpopupLayer").hide();
        jQuery(this)[0].autoclose = false;
        makeProcessLoader();
        sortFilterList(param);
    });
}

function sortFilterList(data) {
    var param = {};
    var policy = data.policy;
    var type = policy.split(" ")[0];
    if (type == "tag") {
        param.storeTag = true;
        param.tagId = jQuery.trim(replaceAll(policy, "tag", ""));
    } else {
        param.toFolder = jQuery.trim(replaceAll(policy, "move", ""));
    }
    param.fromFolder = mailControl.getCurrentFolder();

    var subcondList = data.subcondList;
    if (subcondList && subcondList.length > 0) {
        for (var i = 0; i < subcondList.length; i++) {
            if (subcondList[i].field == "FROM") {
                param.from = subcondList[i].pattern;
            } else if (subcondList[i].field == "TO") {
                param.to = subcondList[i].pattern;
            } else if (subcondList[i].field == "SUBJECT") {
                param.subject = subcondList[i].pattern;
            }
        }
    }
    mailControl.sortFilterMessage(param);
}

function addSpamWhiteRule(type) {
    var title = (type == "black") ? mailMsg.reportspam_title : mailMsg.reportham_title;
    var tmpl = (type == "black") ? "mail_layer_spam_tmpl" : "mail_layer_white_tmpl";
    jQuery.goPopup({
        id: 'mail_add_spam_white_popup', pclass: 'layer_normal', header: title, width: 300, openCallback: function () {
            jQuery("#mail_add_spam_white_popup").data("type", type);
        }, contents: getHandlebarsTemplate(tmpl), buttons: [{
            btype: 'confirm', btext: mailMsg.comn_confirm, callback: saveSpamWhiteRule, autoclose: false
        }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
    });
}

function saveSpamWhiteRule() {
    var ruleType = jQuery("#mail_add_spam_white_popup").data("type");
    var uidArray = getMailListCheckedIdArray();
    var msgInfo = getListProcessParams(uidArray);

    var uids = msgInfo.uids;
    var folderName = msgInfo.fnames[0];
    var fromEmails = [];

    var isMyselfCheck = false;
    var checkboxOption = jQuery("#mail_add_spam_white_popup input:checkbox");
    var addRule = (checkboxOption.eq(0).attr("checked")) ? true : false;
    var moveBox = (checkboxOption.eq(1).attr("checked")) ? true : false;

    var email;
    if (addRule) {
        var emailData = getMailListCheckedData("femail");
        if (emailData && emailData.length > 0) {
            for (var i = 0; i < emailData.length; i++) {
                email = get_email(emailData[i]).toLowerCase();
                if (email == USEREMAIL) {
                    isMyselfCheck = true;
                    break;
                } else {
                    fromEmails[fromEmails.length] = email;
                }
            }
        }
        if (isMyselfCheck) {
            jQuery.goSlideMessage(mailMsg.conf_forward_14, "caution");
            return;
        }
    }

    var param = {};
    param.ruleType = ruleType;
    param.folderName = folderName;
    param.uids = uids;
    param.fromEmails = fromEmails;
    param.addRule = addRule;
    param.moveBox = moveBox;
    param.adminReport = true;

    mailControl.addResistRule(param, saveSpamWhiteRuleResult);
}

function saveSpamWhiteRuleResult(ruleType) {
    if (ruleType == "black") {
        jQuery.goMessage(mailMsg.bayesian_reportspam);
    } else {
        jQuery.goMessage(mailMsg.bayesian_reportwhite);
    }

    if (isPopupView()) {
        if (isReloadReady()) {
            opener.reloadMessageList();
        }
        window.close();
    } else {
        reloadMessageList();
    }
    jQuery.goPopup.close();
}

function registRejectAllow(type) {
    var title = "";
    var msg = "";
    if (type == "black") {
        title = mailMsg.mail_receivreject;
        msg = mailMsg.confirm_denymsg;
    } else {
        title = mailMsg.mail_receivallow;
        msg = mailMsg.confirm_allowmsg;
    }

    jQuery.goConfirm(title, msg, function () {
        var emailData = getMailListCheckedData("femail");
        var emailList = [];

        var email;
        var isMyselfCheck = false;
        if (emailData && emailData.length > 0) {
            for (var i = 0; i < emailData.length; i++) {
                email = get_email(emailData[i]).toLowerCase();
                if (email == USEREMAIL) {
                    isMyselfCheck = true;
                    break;
                } else {
                    emailList[emailList.length] = email;
                }
            }
        }
        if (isMyselfCheck) {
            jQuery.goMessage(mailMsg.conf_forward_14);
            return;
        }

        var param = {};
        param.ruleType = type;
        param.addRule = true;
        param.fromEmails = emailList;

        mailControl.addResistRule(param, registRejectAllowResult);
    });
}

function registRejectAllowResult(type) {
    var title = "";
    var msg = "";
    if (type == "black") {
        title = mailMsg.mail_receivreject;
        msg = mailMsg.confirm_denyok;
    } else {
        title = mailMsg.mail_receivallow;
        msg = mailMsg.confirm_allowok;
    }
    jQuery.goConfirm(title, msg, function () {
        moveRejectMsg(type);
    });
}

function moveRejectMsg(type) {
    var uidArray = getMailListCheckedIdArray();
    var msgInfo = getListProcessParams(uidArray);
    var uids = msgInfo.uids;
    var folderName = msgInfo.fnames[0];

    var param = {};
    param.ruleType = type;
    param.moveBox = true;
    param.uids = uids;
    param.folderName = folderName;

    mailControl.addResistRule(param, function () {
        if (isPopupView()) {
            if (isReloadReady()) {
                opener.reloadMessageList();
            }
            window.close();
        } else {
            mailControl.reloadMessageList();
        }
    });
}

function emptyFolder(folderName) {
    var msg = "";
    if (folderName == "Trash") {
        msg = mailMsg.confirm_emptytrash;
    } else if (folderName == "Spam") {
        msg = mailMsg.confirm_emptyspam;
    } else {
        msg = mailMsg.mail_folder_delete_alert;
    }

    jQuery.goConfirm(mailMsg.mail_folder_empty, msg, function () {
        var param = {"folderName": folderName};
        folderControl.emptyMailFolder(param, function () {
            if (folderName == currentFolderName) {
                mailControl.reloadMessageList();
            } else {
                executeFolderInfo();
                if (isFolderManageMenu()) {
                    mailSettingControl.loadViewFolderManage();
                }
            }
        });
    });
    jQuery("#gpopupLayer").width("410");
}

function reWrite() {

    if (getMailListCheckedCount() > 1) {
        jQuery.goAlert(mailMsg.error_rewrite);
        return;
    }

    var uidArray = getMailListCheckedIdArray();
    var msgInfo = getListProcessParams(uidArray);

    var params = {};
    params.folderName = msgInfo.fnames[0];
    params.uids = msgInfo.uids;
    params.wtype = "rewrite";

    goWrieLoad(params);
}

function recallMsg() {

    var recallEmails = getMailListCheckedValue();
    var uid = jQuery("#mdnReadUid").val();
    var messageId = jQuery("#mdnMessageId").val();
    var subject = jQuery("#mdnMessageSubject").val();

    jQuery.goConfirm(mailMsg.mail_mdn_recall, mailMsg.mail_mdn_confirm, function () {
        var param = {};
        param.messageId = messageId;
        param.uid = uid;
        param.subject = subject;
        param.recallEmails = recallEmails;

        mailControl.recallMessage(param);
    });
}

function recallSelectMsg() {

    if (getMailListCheckedCount() > 1) {
        jQuery.goAlert(mailMsg.error_recall);
        return;
    }

    jQuery.goConfirm(mailMsg.mail_mdn_recall, mailMsg.mail_mdn_confirm, function () {
        var $item = jQuery("input[name='msgId']:checked");
        var messageId = $item.val();
        var subject = $item.attr("subject");
        var param = {"messageId": messageId, "subject": subject, "recallAll": true};

        mailControl.recallMessage(param);
    });
}

function searchRcptAddress() {
    var keywordObj = jQuery("#writeRcptValue");
    var keyword = jQuery.trim(keywordObj.val());
    var searchKeywordList = [];
    var normalEmailList = [];
    var searchNameList = [];
    if (keyword == "") {
        jQuery.goMessage(mailMsg.alert_addr_search_nostr);
        keywordObj.focus();
        return;
    }
    var isSplit1 = (keyword.indexOf(",") > -1);
    var isSplit2 = (keyword.indexOf(";") > -1);

    if (isSplit1 || isSplit2) {
        if (isSplit1) {
            searchKeywordList = keyword.split(",");
        } else if (isSplit2) {
            searchKeywordList = keyword.split(";");
        }
    } else {
        searchKeywordList.push(keyword);
    }

    for (var i = 0; i < searchKeywordList.length; i++) {
        var keyword = jQuery.trim(searchKeywordList[i]);

        if (!checkInputSearchAddr(keyword, 2, 255, true)) {
            break;
            return;
        }
        if (isEmail(keyword)) {
            normalEmailList.push(keyword);
        } else {
            searchNameList.push(keyword);
        }
    }
    if (searchNameList.length > 0) {
        var param = {"keywords": searchNameList, equalSearch: false};
        mailControl.searchAddressByKeyowrd(param, function (data) {
            searchRcptResult(data);
        });
    }
    if (normalEmailList.length > 0) {
        for (var i = 0; i < normalEmailList.length; i++) {
            makeSearchAddressUnitFormat(normalEmailList[i]);
        }
    }

    keywordObj.val("");
    keywordObj.focus();
}

function searchRcptResult(data) {
    if (data.singleAddressList.length == 0 && data.multiAddressList.length == 0) {
        jQuery.goMessage(mailMsg.alert_addr_search_noresult);
        return;
    }

    var slist = data.singleAddressList;
    var mlist = data.multiAddressList;
    for (var i = 0; i < slist.length; i++) {
        makeSearchAddressUnitFormat(slist[i].address);
    }
    if (mlist.length > 0) {
        makeRcptSelectPopup(mlist, applyRcptSearchAddress);
    }

}

function applyRcptSearchAddress() {
    jQuery("#mail_write_multi_search_result_popup input[name=emailCheck]:checked").each(function () {
        makeSearchAddressUnitFormat(jQuery(this).val());
    });
    jQuery.goPopup.close();
}

function applyRcptAddress(target) {
    var checkObj = jQuery("#mail_write_multi_search_result_popup input[name=emailCheck]:checked");
    if (checkObj.length == 0) {
        jQuery.goMessage(mailMsg.comn_error_001);
        return;
    }
    var emailList = jQuery("#" + target + "AddrWrap li span.name");
    checkObj.each(function () {
        var _this = this;
        makeAddressUnitFormat(target, jQuery(this).val());
        emailList.each(function () {
            if (jQuery(_this).data("name") == jQuery(this).data("email")) {
                jQuery(this).closest("li").remove();
            }
        });
    });
    jQuery.goPopup.close();

    if (SearchByNameInfo.emptyKeywordList && SearchByNameInfo.emptyKeywordList.length > 0) {
        var emailList = jQuery("#" + target + "AddrWrap li span.name");

        for (var i = 0; i < SearchByNameInfo.emptyKeywordList.length; i++) {
            var name = SearchByNameInfo.emptyKeywordList[i];
            emailList.each(function () {
                if (name == jQuery(this).data("email")) {
                    jQuery(this).closest("li").addClass("invalid");
                }
            });
        }
    } else {
        queryByRcptName();
    }
}

function makeRcptSelectPopup(list, func) {
    list.mailExposure = MAIL_EXPOSURE;
    jQuery.goPopup({
        id: 'mail_write_multi_search_result_popup',
        pclass: 'layer_normal',
        header: mailMsg.mail_rcptadd,
        width: 600,
        contents: getHandlebarsTemplate("mail_write_multi_search_result_tmpl", list),
        openCallback: function () {
            jQuery("#mail_write_multi_search_result_popup").on("click", "#writeMultiSearchCheckAll", function () {
                var checkObj = jQuery("#mail_write_multi_search_result_popup input[name=emailCheck]:checkbox");
                if (jQuery(this).attr("checked")) {
                    checkObj.attr("checked", true);
                } else {
                    checkObj.attr("checked", false);
                }
            });
        },
        closeCallback: function () {
            jQuery("#mail_write_multi_search_result_popup").off();
        },
        buttons: [{btype: 'confirm', btext: mailMsg.comn_confirm, callback: func, autoclose: false}, {
            btype: 'cancel', btext: mailMsg.comn_cancel
        }]
    });
}

var SearchByNameInfo = {
    searchAddrValueList: [], emptyListFlag: false, emptyKeywordList: [], rcptMultiResultType: "normal", rcptType: ""
};

function searchRcptAddrName() {
    var param = makeRcptForm();
    SearchByNameInfo.searchAddrValueList.push({type: "to", list: param.to});
    SearchByNameInfo.searchAddrValueList.push({type: "cc", list: param.cc});
    SearchByNameInfo.searchAddrValueList.push({type: "bcc", list: param.bcc});
    queryByRcptName();
}

function searchRcptAddrOneName(type, list) {
    if (jQuery.trim(list) == "") return;
    var param = {};
    if (type == "to") {
        param.to = list;
        SearchByNameInfo.searchAddrValueList.push({type: "to", list: param.to});
    } else if (type == "cc") {
        param.cc = list;
        SearchByNameInfo.searchAddrValueList.push({type: "cc", list: param.cc});
    } else if (type == "bcc") {
        param.bcc = list;
        SearchByNameInfo.searchAddrValueList.push({type: "bcc", list: param.bcc});
    } else if (type == "edit") {
        param.edit = list;
        SearchByNameInfo.searchAddrValueList.push({type: "edit", list: param.edit});
    }
    queryByRcptName();
}

function queryByRcptName() {
    SearchByNameInfo.emptyListFlag = false;
    SearchByNameInfo.emptyKeywordList = [];
    SearchByNameInfo.rcptType = "";

    var addrObj = SearchByNameInfo.searchAddrValueList.pop();
    if (addrObj) {
        var addrListVal = addrObj.list;
        var rcptType = addrObj.type;
        SearchByNameInfo.rcptType = rcptType;
        if (!addrListVal || jQuery.trim(addrListVal) == "") {
            queryByRcptName();
            return;
        }
        var searchKeywordList = [];
        var normalEmailList = [];
        var searchNameList = [];
        var checkLength = 2;

        var isSplit1 = (addrListVal.indexOf(",") > -1);
        var isSplit2 = (addrListVal.indexOf(";") > -1);

        if (isSplit1 || isSplit2) {
            if (isSplit1) {
                searchKeywordList = addrListVal.split(",");
            } else if (isSplit2) {
                searchKeywordList = addrListVal.split(";");
            }
        } else {
            searchKeywordList.push(addrListVal);
        }

        for (var i = 0; i < searchKeywordList.length; i++) {
            var keyword = jQuery.trim(searchKeywordList[i]);
            if (keyword == "" || keyword.length == 0) {
                continue;
            }

            if (!checkInputSearchAddr(keyword, checkLength, 255, true)) {
                break;
                return;
            }

            if (checkEmailFormat(keyword)) {
                normalEmailList.push(keyword);
            } else {
                searchNameList.push(keyword);
            }
        }
        if (normalEmailList.length > 0) {
            for (var i = 0; i < normalEmailList.length; i++) {
                var emailList = jQuery("#" + rcptType + "AddrWrap li span.name");
                emailList.each(function () {
                    if (normalEmailList[i] == jQuery(this).data("email")) {
                        jQuery(this).closest("li").remove();
                    }
                });
                makeAddressUnitFormat(rcptType, normalEmailList[i]);
            }
        }
        if (searchNameList.length > 0) {
            var param = {"keywords": searchNameList};
            mailControl.searchAddressByKeyowrd(param, function (data) {
                resultQueryByRcptName(rcptType, data);
            });
        } else {
            queryByRcptName();
            return;
        }
    } /*else {
        newSendMessage(sendMailType);
    }*/
}

function resultQueryByRcptName(rcptType, data) {
    if (!data.singleAddressList && !data.multiAddressList) {
        SearchByNameInfo.rcptMultiResultType = "empty";
        var emailList = jQuery("#" + rcptType + "AddrWrap li span.name");

        for (var i = 0; i < data.emptyAddressList.length; i++) {
            var name = data.emptyAddressList[i];
            emailList.each(function () {
                if (name == jQuery(this).data("email")) {
                    jQuery(this).closest("li").addClass("invalid");
                }
            });
        }
        return;
    } else {
        var slist = data.singleAddressList;
        var mlist = data.multiAddressList;
        var elist = data.emptyAddressList;

        if (slist.length > 0) {
            var emailList = jQuery("#" + rcptType + "AddrWrap li span.name");
            for (var i = 0; i < slist.length; i++) {
                makeAddressUnitFormat(rcptType, slist[i].address, slist);
                emailList.each(function () {
                    if (slist[i].personal == jQuery(this).data("email")) {
                        jQuery(this).closest("li").remove();
                    }
                });
            }
        }
        if (elist.length > 0) {
            SearchByNameInfo.emptyListFlag = true;
            SearchByNameInfo.emptyKeywordList = elist;
        }
        if (mlist.length > 0) {
            SearchByNameInfo.rcptMultiResultType = "normal";
            makeRcptSelectPopup(mlist, function () {
                applyRcptAddress(rcptType);
            });
        } else if (SearchByNameInfo.emptyListFlag) {
            SearchByNameInfo.rcptMultiResultType = "empty";

            var emailList = jQuery("#" + rcptType + "AddrWrap li span.name");

            for (var i = 0; i < elist.length; i++) {
                var name = elist[i];
                emailList.each(function () {
                    if (name == jQuery(this).data("email")) {
                        //jQuery(this).closest("li").remove();
                        jQuery(this).closest("li").addClass("invalid");
                    }
                });
            }
        } else {
            queryByRcptName();
        }
    }
}

function deleteFolder(folderName) {
    jQuery.goConfirm(mailMsg.mail_folder_delete, mailMsg.confirm_delete_folder, function () {
        folderControl.deleteFolder(folderName, function () {
            if (folderName == currentFolderName) {
                goFolder("Inbox");
            }
            if (isFolderManageMenu()) {
                mailSettingControl.loadViewFolderManage();
            }
            childrenFnameForModify = null;
        });
    });
}

function popupWriteLoad(param) {
    POPUPDATA = param;
    param.action = "write";
    var wname = "writePopup" + makeRandom();
    var options = "scrollbars=yes, resizable=yes, width=1280";

    if (window.screen && window.screen.height && window.screen.availTop && window.screen.height + window.screen.availTop < 790) {
        options += ", height=" + (window.screen.height + window.screen.availTop);
    } else {
        options += ", height=790";
    }

    popWriteWin = window.open("/app/mail/popup", wname, options);
}

function addBookmark() {
    if (bookmarkType == "tag") {
        var tagInfo = getTagInfo(bookmarkValue);
        bookmarkName = tagInfo.name;
    } else {
        if (bookmarkType == "unseen") {
            bookmarkName = "unseen";
            bookmarkValue = "unseen";
        } else if (bookmarkType == "flaged") {
            bookmarkName = "flaged";
            bookmarkValue = "flaged";
        } else if (bookmarkType == "today") {
            bookmarkName = "today";
            bookmarkValue = "today";
        }
    }
    var param = {"bookmarkType": bookmarkType, "bookmarkName": bookmarkName, "bookmarkValue": bookmarkValue};
    folderControl.saveBookmark(param);
}

function deleteBookmark() {
    if (bookmarkType == "unseen") {
        bookmarkValue = "unseen";
    } else if (bookmarkType == "flaged") {
        bookmarkValue = "flaged";
    } else if (bookmarkType == "today") {
        bookmarkValue = "today";
    }
    var param = {"bookmarkType": bookmarkType, "bookmarkValue": bookmarkValue};
    folderControl.deleteBookmark(param);
}

function toggleAllCheckMessage(bool) {

    var pageInfoObj = jQuery("#pageNaviWrap");
    var total = pageInfoObj.data("total");
    var pageBase = pageInfoObj.data("pagebase");
    if (total <= pageBase) {
        return;
    }

    if (bool) {
        selectAllMessageOff();
        jQuery("#allSelectTr").show();
    } else {
        jQuery("#allSelectTr").hide();
        jQuery("#mailListAllCheck").val("off");
    }
}

function selectAllMessageOn() {
    jQuery("#allSelectMsg1").empty();
    jQuery("#allSelectMsg2").empty();
    jQuery("#allSelectMsg3").empty();
    jQuery("#allSelectMsg1").text(mailMsg.allselect_007);
    jQuery("#allSelectMsg2").text(mailMsg.allselect_005);
    var selectCancel = jQuery("<a evt-rol='select-all-message-off'></a>").append(mailMsg.allselect_009);
    jQuery("#allSelectMsg3").append(selectCancel);
    jQuery("#mailListAllCheck").val("on");

    displayToolbarBySelectAll();
}

function selectAllMessageOff() {
    jQuery("#allSelectMsg1").empty();
    jQuery("#allSelectMsg2").empty();
    jQuery("#allSelectMsg3").empty();
    var total = jQuery("#pageNaviWrap").data("total");
    jQuery("#allSelectMsg1").text(mailMsg.allselect_001);
    jQuery("#allSelectMsg2").text(msgArgsReplace(mailMsg.allselect_002, [total]));
    var selectOn = jQuery("<a evt-rol='select-all-message-on'></a>").append(mailMsg.allselect_008);
    jQuery("#allSelectMsg3").append(selectOn);
    jQuery("#mailListAllCheck").val("off");

    displayToolbarBySelectAll();
}

function displayToolbarBySelectAll() {
    // 삭제/완전삭제, 읽음/안읽음, 이동/복사 를 제외한 나머지 툴바는 전체메일 선택시 비활성화 및 마우스오버시 화살표로 표시함
    jQuery.each(jQuery("#toolbar_wrap .critical").children().not("[evt-rol=list-select-all]"), function (k, v) {
        if (jQuery(v).find('a[evt-act="toolbar-message-delete"]').length > 0) {
            // 전체메일 선택시 "삭제툴바 > 첨부파일삭제" 는 비활성화함
            if (jQuery("#mailListAllCheck").val() == "on") {
                jQuery(v).find('[evt-rol="toolbar-attach-delete"]').css({'opacity': '0.3', 'cursor': 'default'});
                jQuery(v).find('[evt-rol="toolbar-attach-delete"]').attr('evt-rol', '');
            } else {
                jQuery(v).find('[evt-rol=""]').css({'opacity': '', 'cursor': 'pointer'});
                jQuery(v).find('[evt-rol=""]').attr('evt-rol', 'toolbar-attach-delete');
            }
        } else if (jQuery(v).find('a[evt-act="change-flag-seen"]').length > 0) {
            // 전체메일 선택시 "읽음/안읽음"
            return true;
        } else if (jQuery(v).find('a[menu="move"]').length > 0) {
            // 전체메일 선택시 "이동/복사"
            return true;
        } else {
            // 전체메일 선택시 "삭제/완전삭제, 읽음/안읽음, 이동/복사 를 제외한 나머지 툴바"
            if (jQuery("#mailListAllCheck").val() == "on") {
                jQuery(v).css('opacity', '0.3');
                jQuery(v).find('[evt-rol="toolbar"]').andSelf().attr('evt-rol', '');
                jQuery(v).children().andSelf().css('cursor', 'default');
            } else {
                jQuery("#toolbar_wrap .critical").children().css('opacity', '');
                jQuery(v).find('[evt-rol=""]').andSelf().attr('evt-rol', 'toolbar');
                jQuery(v).children().andSelf().css('cursor', 'pointer');
            }
        }
    });
}

function addAddrBookEmail(emailFormat) {
    var name = get_name(emailFormat);
    var email = get_email(emailFormat);

    jQuery.get("/api/contact/personal/group", function (result) {
        var data = {"name": name, "email": email, "groupList": result.data};
        jQuery.goPopup({
            id: 'mail_add_addrbook_email_popup',
            pclass: 'layer_normal layer_add_address',
            header: mailMsg.menu_addaddr,
            width: 300,
            contents: getHandlebarsTemplate("mail_add_addr_email_tmpl", data),
            buttons: [{
                btype: 'confirm', btext: mailMsg.comn_confirm, autoclose: false, callback: saveAddrBookEmail
            }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
        });

    });

}

function saveAddrBookEmail() {
    var name = jQuery.trim(jQuery("#addrMemberName").val());
    if (!validateInputValue(jQuery("#addrMemberName"), 2, 64, "userName")) {
        return;
    }
    var email = jQuery.trim(jQuery("#addrMemberEmail").val());
    var group = jQuery.trim(jQuery("#addrMemberGroup").val());
    var param = {"name": name, "email": email};
    if (group) {
        param.groupIds = [group];
    }
    mailControl.saveMemberAddress(param);
    jQuery.goPopup.close();
}

function openAddrLayerPopup(obj) {
    var email = jQuery(obj).data("email");
    var data = {"email": email, "useContact": USE_CONTACT && MAIL_EXPOSURE};
    var layerObj = jQuery(obj).parent().find("div.layerPop");
    layerObj.html(getHandlebarsTemplate("mail_email_layer_menu_tmpl", data));
    var opt = {"clickObj": jQuery(obj)};
    jQuery(layerObj).dropDownMenu(opt);
}

function closeAddrLayerPopup(obj) {
    jQuery(obj).closest("div.layerPop").empty();
}

function readViewImg(folder, uid) {
    var param = {};
    param.folder = folder;
    param.uid = uid;
    param.viewImg = true;
    param = mailControl.getSharedFolderParam(param);

    mailControl.readMessage(param);
}

function registBayesianRuleMessage(ruleType, folderName, uid) {
    var param = {};
    param.ruleType = ruleType;
    param.folderName = folderName;
    param.uid = uid;

    mailControl.registBayesianRule(param);
}

function confirmIntegrity(folderName, uid) {
    jQuery("#integrityMsg").text(mailMsg.mail_integrity_check);
    jQuery("#integrityBtn").hide();

    var param = {};
    param.folderName = folderName;
    param.uid = uid;
    mailControl.messageIntegrity(param, function (integrity) {
        updateIntegrity(integrity);
    });
}

function updateIntegrity(integrity) {
    var msgPane = jQuery("#integrityMsg");
    if (integrity == "match") {
        msgPane.text(mailMsg.mail_integrity_match);
    } else if (integrity == "no-match") {
        msgPane.text(mailMsg.mail_integrity_nomatch);
    } else if (integrity == "no") {
        msgPane.text(mailMsg.mail_integrity_no);
    } else if (integrity == "error") {
        msgPane.text(mailMsg.mail_integrity_error);
    }
    jQuery("#integrityBtn").show();
}

function getCheckSendInfoValue(type) {
    var emailArray = new Array();
    jQuery("#mail_send_allow_check_popup input[name=" + type + "Addr]:checked").each(function () {
        emailArray.push(jQuery(this).val());
    });
    return emailArray;
}

function loadBasicSetting() {
    mailSettingControl.loadBasicSetting();
}

function loadMdnList() {
    checkEscapeWriteMode(function () {
        layoutControl.contentNormalSplitter();
        mailControl.loadMdnList();
        hideSearchCancelBtn();
    });
}

function clearMassRcpt() {
    var f = document.massRcptUploadForm;

    f.reset();
    f.massFilePath.value = "";

    jQuery("#massRcptFile").show();
    jQuery("#massRcptFileInfo").hide();
    jQuery("#massFileName").empty();
    jQuery("#massFileSize").empty();
}

function openWriteAddrRcptPopup(rcptType) {
    jQuery.goPopup({
        id: 'mail_write_address_add_popup',
        pclass: 'layer_normal layer_address',
        header: mailMsg.mail_searchaddr,
        width: 980,
        modal: true,
        contents: "<iframe id='writeAddrRcptFrame' name='writeAddrRcptFrame' scrolling='no' src='/app/contact/connector/all' frameborder='0' style='border:0;width:100%;height:470px;overflow: hidden;'></iframe><div id='popOverlay' data-overlay style='position:absolute !important;' class='overlay'><div class='processing'></div></div>",
        openCallback: function (popupEl) {
            popupEl.draggable("option", "containment", "document");
            jQuery('body').css('overflow', 'hidden');
            /*jQuery("body").bind("mousewheel", function() {
                return false;
            });*/
        },
        closeCallback: function () {
            /*jQuery("body").unbind("mousewheel");*/
            jQuery('body').css('overflow', 'auto');
        },
        buttons: [{
            btype: 'confirm', btext: mailMsg.comn_confirm, autoclose: false, callback: applyWriteAddrRcpt
        }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
    });
}

function applyWriteAddrRcpt() {
    var addrObj;
    if (isMsie) {
        addrObj = window.writeAddrRcptFrame.getAddrRcptList();
    } else {
        addrObj = document.getElementById("writeAddrRcptFrame").contentWindow.getAddrRcptList();
    }

    var toList = addrObj.toList;
    var ccList = addrObj.ccList;
    var bccList = addrObj.bccList;

    var hasAddrObj = false;
    if (toList && toList.length > 0) {
        for (var i = 0; i < toList.length; i++) {
            insertRcptEmail("to", toList[i]);
        }
        hasAddrObj = true;
    }
    if (ccList && ccList.length > 0) {
        for (var i = 0; i < ccList.length; i++) {
            insertRcptEmail("cc", ccList[i]);
        }
        hasAddrObj = true;
    }
    if (bccList && bccList.length > 0) {
        for (var i = 0; i < bccList.length; i++) {
            insertRcptEmail("bcc", bccList[i]);
        }
        hasAddrObj = true;
    }

    if (!hasAddrObj) {
        jQuery.goSlideMessage(mailMsg.mail_addr_popup_alert, "caution");
        return;
    } else {
        // TODO closeCallback 이 전역으로 선언되어있던 시기가 있어서 임시로 빈 함수를 넣어주도록 함
        jQuery.goPopup.close(function () {
            jQuery('body').css('overflow', 'auto');
        });
    }
}

function closeMailWritePopup() {
    checkEscapeWriteMode(function () {
        try {
            if (isReloadReady()) {
                opener.reloadMessageList();
            }
        } catch (e) {
        }

        window.close();
    });
}

function previewAttach(uid, folder, part) {
    var param = {"folderName": folder, "uid": uid, "part": part, "type": "normal"};
    param = mailControl.getSharedFolderParam(param);
    param.action = "previewAttach";
    POPUPDATA = param;
    window.open("/app/mail/popup", "", "resizable=yes,scrollbars=yes,status=yes,width=800,height=640");
}

function listCheckboxControl(checkbox, bool) {
    if (bool) {
        checkbox.attr("checked", true).closest("tr").addClass("choice");
        var mailListCheckBoxList = jQuery("#mail_list_content :checkbox").length;
        var mailListCheckedList = jQuery("#mail_list_content :checkbox:checked").length;


        if (mailListCheckBoxList == mailListCheckedList) {
            jQuery("#mailListAllCheck").attr("checked", true);
            toggleAllCheckMessage(true);
        }

        if (layoutMode != "n") {
            if (!ReadSubMessageChecker.hasCurrentItem()) {
                jQuery("#mailReadArea").handlebars("mail_read_checked_list_tmpl");
                jQuery("#checkedListMessage").text(msgArgsReplace(mailMsg.mail_message_checked_list, [mailListCheckedList]));
            }
        }
    } else {
        checkbox.attr("checked", false).closest("tr").removeClass("choice");
        if (jQuery("#mailListAllCheck").attr("checked")) {
            jQuery("#mailListAllCheck").attr("checked", false);
            toggleAllCheckMessage(false);
        }

        var mailListCheckedList = jQuery("#mail_list_content :checkbox:checked").length;

        if (layoutMode != "n") {
            if (!ReadSubMessageChecker.hasCurrentItem()) {
                jQuery("#mailReadArea").handlebars("mail_read_checked_list_tmpl");
                if (mailListCheckedList != 0) {
                    jQuery("#checkedListMessage").text(msgArgsReplace(mailMsg.mail_message_checked_list, [mailListCheckedList]));
                } else {
                    jQuery("#mailReadArea").handlebars("mail_read_default_tmpl");
                }
            }
        }
    }
}

function showSearchCancelBtn() {
    var listMode = mailControl.getListMode();
    var inputSize = "107px";
    var cancelBtnRight = "55px";
    if (listMode == "mdnlist" || listMode == "mdnread") {
        inputSize = "126px";
        cancelBtnRight = "37px";
    }
    jQuery("#mailSearchKeyWord").width(inputSize);
    jQuery("#mailSearchCancelBtn").css("right", cancelBtnRight).show();
}

function hideSearchCancelBtn() {
    jQuery("#mailSearchCancelBtn").hide().css("right", "55px");
    jQuery("#mailSearchKeyWord").width("126px");
    jQuery("#mailSearchKeyWord").val("");
    jQuery("#mailSearchKeyWord").placeholder();
}

function cancelSearch() {
    var listMode = mailControl.getListMode();
    if (listMode == "mdnlist") {
        mailControl.loadMdnList();
    } else if (listMode == "mdnread") {
        var uid = jQuery("#mdnReadUid").val();
        var param = {"uid": uid};
        mailControl.loadMdnRead(param);
    } else {
        var folderName = mailControl.getCurrentFolder();
        folderName = (folderName == "all") ? "Inbox" : folderName;
        var param = {"folder": folderName};
        mailControl.loadMessageList(param);
    }
    hideSearchCancelBtn();
}

function makeMailBadgeCount() {
    /*
	var badgeObj = jQuery("#topmenu_mail .badge");
	if (isMailBadgeUse) {
		if (mailBadgeCount > 0) {
			badgeObj.text(mailBadgeCount).css("visibility","visible");
		} else {
			badgeObj.text(0).css("visibility","hidden");
		}
	} else {
		badgeObj.text(0).css("visibility","hidden");
	}
	*/
}

//첨부파일 자료실 저장
function openWebfolderPopup(param) {
    jQuery.goPopup({
        id: 'mail_read_attach_webfolder_popup',
        pclass: 'layer_normal',
        header: mailMsg.mail_attach_webfolder_select,
        width: 400,
        contents: "<iframe id='mailReadAttachWebfolderSelectFrame' name='mailReadAttachWebfolderSelectFrame' scrolling='no' src='/app/webfolder/popup/process' frameborder='0' style='border:0;width:100%;height:200px;overflow: hidden;'></iframe>",
        openCallback: function (popupEl) {
            popupEl.draggable("option", "containment", "document");
            popupEl.data("attachInfo", param);
        },
        buttons: [{
            btype: 'confirm', btext: mailMsg.comn_confirm, autoclose: false, callback: saveMailReadAttachWebfolder
        }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
    });
}

function saveMailReadAttachWebfolder() {
    var webfolderInfo;
    if (isMsie) {
        webfolderInfo = window.mailReadAttachWebfolderSelectFrame.selectFileList();
    } else {
        webfolderInfo = document.getElementById("mailReadAttachWebfolderSelectFrame").contentWindow.selectFileList();
    }
    if (!webfolderInfo) return;

    var attachInfo = jQuery("#mail_read_attach_webfolder_popup").data("attachInfo");
    var param = {};
    param.attachInfo = attachInfo;
    param.webfolderInfo = webfolderInfo;

    mailControl.webfolderAttachSave(param);
}

//메일쓰기 자료실 첨부
var webfolderAttachProcess = false;

function openWriteWebfolder() {
    jQuery.goPopup({
        id: 'mail_write_attach_webfolder_popup',
        pclass: 'layer_normal',
        header: mailMsg.mail_attach_webfolder_write_attach,
        width: 900,
        offset: (isPopupWrite) ? {top: 0, left: 0} : null,
        contents: "<iframe id='mailWriteAttachWebfolderSelectFrame' name='mailWriteAttachWebfolderSelectFrame' scrolling='no' src='/app/webfolder/popup/process?path=selectFile' frameborder='0' style='border:0;width:100%;height:350px;overflow: hidden;vertical-align: top;'></iframe>",
        modal: true,
        openCallback: function (popupEl) {
            webfolderAttachProcess = false;
            jQuery("#mail_write_attach_webfolder_popup").addClass("layer_import_file");
            popupEl.draggable("option", "containment", "document");
        },
        closeCallback: function (popupEl) {
            webfolderAttachProcess = false;
        },
        buttons: [{
            btype: 'confirm', btext: mailMsg.comn_confirm, autoclose: false, callback: applyWriteWebfolderFile
        }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
    });
}

function applyWriteWebfolderFile() {
    if (webfolderAttachProcess) {
        jQuery.goMessage(mailMsg.mail_attach_webfolder_write_attach_process);
        return;
    }
    var webfolderParam;
    if (isMsie) {
        webfolderParam = window.mailWriteAttachWebfolderSelectFrame.writeAttachFile();
    } else {
        webfolderParam = document.getElementById("mailWriteAttachWebfolderSelectFrame").contentWindow.writeAttachFile();
    }
    if (!webfolderParam || !webfolderParam.uids || webfolderParam.uids.length == 0) return;

    webfolderAttachProcess = true;
    mailControl.webfolderWriteAttach(webfolderParam, function (data) {
        checkUploadfile(data);
        jQuery.goPopup.close();
    });
}

function getMailUserSender() {
    var $senderListObj = jQuery("#senderUserEmail");
    var senderName = $senderListObj.attr("sname");
    var myEmail = "\"" + senderName + "\" <" + USERLOGINEMAIL + ">";
    $senderListObj.empty();
    $senderListObj.append(jQuery("<option selected></option>").text(myEmail).attr("value", myEmail).attr("alias", false));
    mailControl.readMailUserSender(function (data) {
        $senderListObj.append(getHandlebarsTemplate("mail_write_sender_tmpl", data));
        previousSenderEmail = $senderListObj.val();
    });
}

function viewSendAllow(data) {
    jQuery.goPopup({
        pclass: 'layer_normal layer_mail_allowlist',
        header: mailMsg.sendallow_list,
        contents: getHandlebarsTemplate("mail_send_allow_list_tmpl", data),
        buttons: [{btype: 'cancel', btext: mailMsg.comn_close}]
    });
}

function makeInputDropEvents(obj) {
    jQuery(obj).droppable({
        accept: "ul.name_tag li:not(.creat)", tolerance: "pointer", over: function (event, ui) {
            jQuery("#dragHelperIcon").removeClass("ic_disallow").addClass("ic_allow");
        }, out: function (event, ui) {
            jQuery("#dragHelperIcon").removeClass("ic_allow").addClass("ic_disallow");
        }, drop: function (event, ui) {
            ui.helper.remove();

            var isSelectedObj = jQuery(this).attr('sort');
            if (isSelectedObj && 'true' == isSelectedObj) {
                //정렬은 아래의 로직을 수행할 필요없다.
                return;
            }

            var dropThis = this;
            var $moveTarget = ui.draggable.parent().find("li.on");
            if ($moveTarget.length == 0) {
                //Select 하지 않은 드래그&드랍일 경우에 대한 처리
                $moveTarget = ui.draggable;
            }

            $moveTarget.each(function () {
                var emailEl = jQuery(this).find("span.name");
                var data = null;
                if (emailEl.data("info")) {
                    data = [];
                    data.push({
                        "name": emailEl.data("name"),
                        "companyName": emailEl.data("companyName"),
                        "deptName": emailEl.data("deptName"),
                        "title": emailEl.data("position")
                    });
                }
                makeAddressUnitFormat(jQuery(dropThis).attr("area"), emailEl.data("email"), data);
            });
            $moveTarget.remove();
        }
    });
}

function bindAddrAreaEvents(obj) {
    jQuery(obj).sortable({
        items: "li:not(:last-child)",
        containment: '#mailWriteAreaTable',
        appendTo: "body",
        cursorAt: {top: 10, left: -5},
        scroll: false,
        change: function (event, ui) {
            ui.placeholder.css({
                background: 'gray', opacity: '0.3', width: '100px', visibility: 'visible', border: '1px solid'
            }).removeClass("out");
        },
        over: function (event, ui) {
            jQuery(this).attr('sort', true);
        },
        out: function (event, ui) {
            jQuery(this).attr('sort', false);
        },
        helper: function (event, ui) {
            var dragText = "";
            var draggedCnt = ui.length || 0;
            if (draggedCnt > 0) {
                dragText = ui.context.textContent;
            } else {
                dragText = jQuery(this).find("span.name").text();
            }
            var message = {"message": dragText};
            return getHandlebarsTemplate("mail_dnd_tmpl", message);
        }
    }).disableSelection();
}

function selectAddressFieldkeyEvt(selectUnit) {

    var shiftKey = 16;
    var ctrlKey = 17;
    var leftKey = 37;
    var rightKey = 39;
    var aKey = 65;
    var cKey = 67;
    var backSpaceKey = 8;
    var delKey = 46;

    var parentUlElement = selectUnit.closest("ul.name_tag");
    var emailLiList = parentUlElement.find("li:not(.creat)");
    var selectUnitsSize = emailLiList.size();
    var firstNode = emailLiList.first();

    var selectList = new Array();

    var nextNode = null;

    var toList = jQuery("#toAddrWrap").find("li:not(.creat)");
    var ccList = jQuery("#ccAddrWrap").find("li:not(.creat)");
    var bccList = jQuery("#bccAddrWrap").find("li:not(.creat)");

    var toFirstNode = toList.first();
    var ccFirstNode = ccList.first();
    var bccFirstNode = bccList.first();

    var toListSize = toList.size();
    var ccListSize = ccList.size();
    var bccListSize = bccList.size();

    var addrWrapId = parentUlElement.closest("div.div_ipt").attr("id");
    if (addrWrapId != "toAddrWrap") {
        jQuery(document).unbind("keydown");
        initSelectField(toFirstNode, toListSize);
    }
    if (addrWrapId != "ccAddrWrap") {
        jQuery(document).unbind("keydown");
        initSelectField(ccFirstNode, ccListSize);
    }
    if (addrWrapId != "bccAddrWrap") {
        jQuery(document).unbind("keydown");
        initSelectField(bccFirstNode, bccListSize);
    }

    for (var i = 0; i < selectUnitsSize; i++) {
        if (i == 0) {
            firstNode.removeClass("on");
            nextNode = firstNode.next();
        } else {
            nextNode.removeClass("on");
            nextNode = nextNode.next();
        }
    }

    selectUnit.addClass("on");
    var selectIndex = emailLiList.index(selectUnit);
    var firstNodeIndex = emailLiList.index(firstNode);
    var lastNodeIndex = firstNodeIndex + selectUnitsSize - 1;

    if (selectIndex == -1) {
        selectUnitsSize = emailLiList.size();
        firstNode = emailLiList.first();
    }

    ctrlDown = false;
    shiftDown = false;
    ctrlPlusA = false;
    ctrlPlusClick = false;

    jQuery(document).keydown(function (event) {
        if (event.keyCode == ctrlKey) {
            ctrlDown = true;

            for (var i = 0; i < selectUnitsSize; i++) {
                if (i == 0) {
                    firstNode.find("span.name").attr("evt-rol", "multi-select-field");
                    nextNode = firstNode.next();
                } else {
                    nextNode.find("span.name").attr("evt-rol", "multi-select-field");
                    nextNode = nextNode.next();
                }
            }
            event.preventDefault();
        }

        if ((selectIndex != -1) && ((event.keyCode == backSpaceKey) || (event.keyCode == delKey))) {
            if (window.event) {
                window.event.returnValue = false;
            } else {
                event.returnValue = false;
            }
            parentUlElement.find("li.on").remove();
        }
        if (event.keyCode == shiftKey) {
            if (window.event) {
                window.event.returnValue = false;
            } else {
                event.returnValue = false;
            }
            shiftDown = true;
            for (var i = 0; i < selectUnitsSize; i++) {
                if (i == 0) {
                    firstNode.find("span.name").attr("evt-rol", "multi-select-fields");
                    nextNode = firstNode.next();
                } else {
                    nextNode.find("span.name").attr("evt-rol", "multi-select-fields");
                    nextNode = nextNode.next();
                }
                ;
            }
            event.preventDefault();
        }
        if (ctrlDown && event.keyCode == cKey) {

            ctrlDown = false;

            for (var i = 0; i < selectUnitsSize; i++) {
                if (i == 0) {
                    if (firstNode.hasClass("on")) {
                        selectList.push(firstNode.find("span.name").data("email"));
                    }
                    firstNode.find("span.name").attr("evt-rol", "select-field");
                    nextNode = firstNode.next();
                } else {
                    if (nextNode.hasClass("on")) {
                        selectList.push(nextNode.find("span.name").data("email"));
                    }
                    nextNode.find("span.name").attr("evt-rol", "select-field");
                    nextNode = nextNode.next();
                }
            }

            if (window.clipboardData) {
                var selectItem = "";
                for (var i = 0; i < selectList.length; i++) {
                    if (i != (selectList.length - 1)) {
                        selectItem += selectList[i] + ",";
                    } else {
                        selectItem += selectList[i];
                    }
                }
                window.clipboardData.setData('text', selectItem);
                event.preventDefault();
                jQuery(document).unbind("keydown");
            } else {
                var selectItem = "";
                for (var i = 0; i < selectList.length; i++) {
                    if (i != (selectList.length - 1)) {
                        selectItem += selectList[i] + ",";
                    } else {
                        selectItem += selectList[i];
                    }

                }
                var hiddenCopyTextEl = jQuery("#hiddenCopyTextEl");
                if (!hiddenCopyTextEl || hiddenCopyTextEl.length == 0) {
                    hiddenCopyTextEl = jQuery("<textarea></textarea>").css({
                        "position": "absolute", "left": "-9999px", "top": "0", "id": "hiddenCopyTextEl"
                    });
                    jQuery("body").append(hiddenCopyTextEl);
                }

                hiddenCopyTextEl.val(selectItem);
                hiddenCopyTextEl.focus();
                hiddenCopyTextEl[0].setSelectionRange(0, hiddenCopyTextEl.val().length);
                try {
                    document.execCommand("copy");
                } catch (e) {
                    // TODO: handle exception
                }
                hiddenCopyTextEl.val("");
                //window.prompt(mailMsg.mail_write_select, selectItem);
                event.preventDefault();
                jQuery(document).unbind("keydown");
            }
        }
        if (ctrlDown && event.keyCode == aKey) {
            if (window.event) {
                window.event.returnValue = false;
            } else {
                event.returnValue = false;
            }
            ctrlPlusA = true;

            emailLiList.addClass("on");
        }

        if (event.keyCode == rightKey) {
            if (selectIndex != lastNodeIndex) {
                if (shiftDown) {
                    if (selectUnit.next().hasClass("on")) {
                        selectUnit.removeClass("on");
                    } else {
                        selectUnit.next().addClass("on");
                    }
                    selectUnit = selectUnit.next();
                    selectIndex = emailLiList.index(selectUnit);
                } else {
                    selectUnit.removeClass("on");
                    selectUnit.next().addClass("on");
                    selectUnit = selectUnit.next();
                    jQuery(document).unbind("keydown");
                    selectAddressFieldkeyEvt(selectUnit);
                }
            }
        }
        if (event.keyCode == leftKey) {
            if (selectIndex != firstNodeIndex) {
                if (shiftDown) {
                    if (selectUnit.prev().hasClass("on")) {
                        selectUnit.removeClass("on");
                    } else {
                        selectUnit.prev().addClass("on");
                    }
                    selectUnit = selectUnit.prev();
                    selectIndex = emailLiList.index(selectUnit);
                } else {
                    selectUnit.removeClass("on");
                    selectUnit.prev().addClass("on");
                    selectUnit = selectUnit.prev();
                    jQuery(document).unbind("keydown");
                    selectAddressFieldkeyEvt(selectUnit);
                }
            }
        }
    }).keyup(function (event) {
        if (event.keyCode == ctrlKey || event.keyCode == shiftKey) {
            ctrlDown = false;
            shiftDown = false;

            for (var i = 0; i < selectUnitsSize; i++) {
                if (i == 0) {
                    firstNode.find("span.name").attr("evt-rol", "select-field");
                    nextNode = firstNode.next();
                } else {
                    nextNode.find("span.name").attr("evt-rol", "select-field");
                    nextNode = nextNode.next();
                }
            }
            event.preventDefault();
        }
    });
}

function initSelectField(firstNode, selectFieldSize) {
    var nextNode = null;
    for (var i = 0; i < selectFieldSize; i++) {
        if (i == 0) {
            firstNode.find("span.name").attr("evt-rol", "select-field");
            firstNode.removeClass("on");
            nextNode = firstNode.next();
        } else {
            nextNode.find("span.name").attr("evt-rol", "select-field");
            nextNode.removeClass("on");
            nextNode = nextNode.next();
        }
    }
}

function inlineImgUploadLayer(elPlaceHolder) {
    var param = {"useFlash": hasFlashPlayer()};
    var _this = this;
    var popupContents = jQuery.goPopup({
        id: 'mail_inline_img_upload',
        header: mailMsg.common_upload_picture,
        width: "250px",
        pclass: "layer_normal layer_date_set",
        contents: "<div style='text-align:center'>" + getHandlebarsTemplate("mail_inline_img_upload_tmpl", param) + "</div>",
        modal: true,
        closeCallback: function () {
            if (hasFlashPlayer()) {
                jQuery('#swfupload-control').swfupload("destroy");
            }
        },
        openCallback: function (popup) {
            var inlineImgUploadOpt = {
                locale: LOCALE,
                param: {"maxImageSize": "1024000", "uploadType": "flash", "email": USER_EMAIL},
                popupContents: popup

            };
            if (hasFlashPlayer()) {
                inlineImgUploadControl = new MailInlineImgControl(inlineImgUploadOpt);
            } else {
                inlineImgUploadControl = new MailSimpleInlineImgControl(inlineImgUploadOpt);

                jQuery('#mailSimpleInlineImgUpload').fileupload({
                    url: "/api/mail/image/upload", formData: {
                        uploadType: 'flash', maxImageSize: jQuery("#maxImageSize").val()
                    }, dataType: 'json', pasteZone: null, done: function (e, data) {
                        var result = data.result;
                        if (result.errorMessage == "") {
                            var inlineImg = '<img src="' + result.fileURL + '" title="' + result.fileName + '"/>';
                            editorControl.addEditorText(inlineImg);
                            popup.close();
                        } else {
                            jQuery.goSlideMessage(result.errorMessage, "caution");
                        }

                    }
                });
            }
            inlineImgUploadControl.makeBtnControl();
        }
    });
    return this;
}


function moreFolder(targetOffset) {
    var offset = null;
    var param = {};
    if (targetOffset) {
        offset = {
            top: targetOffset.top, left: targetOffset.left + 90
        };
    }
    ActionLoader.getGoLoadAction(folderControl.folderAllInfoAction, param, function (data) {
        var userFolderList = data.userFolders;
        userFolderList.isInbox = true;
        jQuery.goPopup({
            id: 'mail_more_folder_popup', /*pclass: 'layer_normal layer_select',*/
            pclass: 'layer_normal layer_select layer_mailbox_detail ',
            header: mailMsg.mail_folder_more,
            width: 400,
            modal: false, /*offset:offset,*/
            contents: getHandlebarsTemplate("mail_more_folder_popup_tmpl"),
            openCallback: function () {
                jQuery("#selectMoreMailFolderPopup").on("click", "a,span,ins,li,p", function (event) {
                    var type = jQuery(this).attr("evt-rol");

                    if (!type) return;
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    } else {
                        event.cancelBubble = true;
                    }
                    event.preventDefault();

                    if (type == "toggle-mail-folder") {
                        var status = jQuery(this).attr("status");
                        var fid = jQuery(this).attr("fid");
                        var currentDepth = jQuery(this).closest("li").attr("depth");
                        currentDepth = parseInt(currentDepth, 10);
                        var childObj = jQuery(this).closest("li").find("ul[depth='" + (currentDepth + 1) + "']");
                        var statusSimple = "O";
                        if (status == "open") {
                            childObj.hide();
                            jQuery(this).removeClass("close").addClass("open").attr({
                                "status": "close", "title": mailMsg.comn_open
                            });
                            statusSimple = "C";
                        } else {
                            childObj.show();
                            jQuery(this).removeClass("open").addClass("close").attr({
                                "status": "open", "title": mailMsg.comn_close
                            });
                            ;
                        }
                    } else if (type == "folder") {
                        var folder = jQuery(this).attr("fname");
                        goFolder(folder);
                        closeMailMoreFolderPopupLayer();
                        closeMailFolderOptionLayer();
                    } else if (type == "unseen-folder") {
                        var folder = jQuery(this).attr("fname");
                        goFolder(folder, "U");
                        closeMailMoreFolderPopupLayer();
                        closeMailFolderOptionLayer();
                    } else if (type == "receive-noti-list") {
                        loadMdnList();
                        closeMailMoreFolderPopupLayer();
                        closeMailFolderOptionLayer();
                    } else if (type == "empty-spam-folder") {
                        emptyFolder("Spam");
                        closeMailMoreFolderPopupLayer();
                        closeMailFolderOptionLayer();
                    } else if (type == "empty-trash-folder") {
                        emptyFolder("Trash");
                        closeMailMoreFolderPopupLayer();
                        closeMailFolderOptionLayer();
                    } else if (type == "mail-folder-option") {
                        closeMailFolderOptionLayer();
                        var depth = jQuery(this).data("depth");
                        var folderName = jQuery(this).attr("fname");

                        var childerObj = jQuery(this).parent().parent().find('p a');

                        childrenFnameForModify = new Array(childerObj.length);
                        jQuery(this).parent().parent().find('p a').each(function (index) {
                            childrenFnameForModify[index] = jQuery(this).attr('fname');
                        });

                        var share = jQuery(this).data("share");
                        var shareseq = jQuery(this).data("shareseq");
                        var data = {"folderName": folderName, "depth": depth, "share": share, "shareseq": shareseq};

                        var targetOffset = jQuery(this).offset();
                        data.useSharedfolder = useSharedfolder;
                        jQuery.goPopup({
                            id: 'mailFolderOptionLayer',
                            pclass: 'layer_normal layer_context',
                            width: 115,
                            modal: false,
                            isClose: true,
                            openCallback: function () {
                                jQuery("#mailFolderOptionLayer header,#mailFolderOptionLayer footer").hide();
                                jQuery("#mailFolderOptionLayer div.content").css("padding", "0");
                                jQuery("#mailFolderOptionLayer div.content").on("click", "li", function (e) {
                                    var type = jQuery(this).attr("evt-rol");
                                    var folderName = jQuery(this).parent().attr("folder");
                                    if (type == "empty-user-folder") {
                                        emptyFolder(folderName);
                                    } else if (type == "modify-folder") {
                                        modifyFolder(folderName);
                                    } else if (type == "delete-folder") {
                                        deleteFolder(folderName);
                                    } else if (type == "add-sub-folder") {
                                        addSubFolder(folderName);
                                    } else if (type == "share-folder") {
                                        openShareFolderSettingLayer(folderName);
                                        var isShare = ("on" == jQuery(this).parent().data("share"));
                                        if (isShare) {
                                            var shareSeq = jQuery(this).parent().data("shareseq");
                                            jQuery("#orgShareFlag").attr("checked", true);
                                            jQuery("#orgShareFlag").data("shareSeq", shareSeq);
                                            var param = {"folderUid": shareSeq};
                                            folderControl.getSharringReaderList(param);
                                        }
                                    } else if (type == "upload-message") {
                                        upfolderName = folderName;
                                        openUploadMessageLayer();
                                    } else if (type == "move-folder") {
                                        moveFolder(folderName);
                                    }
                                });
                            },
                            offset: {
                                top: targetOffset.top, left: targetOffset.left + 15
                            },
                            contents: getHandlebarsTemplate("mail_folder_option_tmpl", data),
                            buttons: []
                        });
                    } else if (type == "tmw-folder") {
                        window.open("tmwPopup.jsp");
                    }
                });
            },
            closeCallback: function () {
            },
            buttons: [{btype: 'cancel', btext: mailMsg.comn_close}]
        });

        var folderList = data.defaultFolders;
        var isOuotaOverExist = false;
        if (folderList && folderList.length > 0) {
            for (var i = 0; i < folderList.length; i++) {
                var folder = folderList[i];
                if (folder.fullName == "Quotaviolate") {
                    isOuotaOverExist = true;
                }
                var unseenArea = jQuery("#" + folder.id + "_more_num");
                unseenArea.empty();

                if (folder.unseenCnt > 0) {
                    var unseenLink = jQuery("<a></a>");
                    var nuseenLabel = jQuery("<span class='num'></span>");
                    nuseenLabel.text(folder.unseenCnt);
                    unseenLink.attr({"evt-rol": "unseen-folder", "fname": folder.fullName});
                    unseenLink.html(nuseenLabel);
                    unseenArea.html(unseenLink);
                    unseenArea.data("unseen", folder.unseenCnt);
                }

                if (isMailBadgeUse && folder.fullName == "Inbox") {
                    mailBadgeCount = folder.unseenCnt;
                }
            }
        }
        if (isOuotaOverExist) {
            jQuery("#more_df_quotaviolate").show();
        } else {
            jQuery("#more_df_quotaviolate").hide();
        }

        userFolderList.isInbox = true;

        var inboxFolderArea = jQuery("#inbox_folder_popup_area");
        inboxFolderArea.handlebars("mail_more_user_folder_tmpl", userFolderList);

        var inboxToggleBtn = jQuery("#inbox_toggle_more_btn");
        if (inboxFolderArea.find("li.folder").length > 0) {
            if (status == "C") {
                inboxToggleBtn.addClass("open").removeClass("close").attr({
                    "status": "close", "title": mailMsg.comn_open
                });
                inboxFolderArea.hide();
            } else {
                inboxToggleBtn.addClass("close").removeClass("open").attr({
                    "status": "open", "title": mailMsg.comn_close
                });
                inboxFolderArea.show();
            }
            inboxToggleBtn.show();
        } else {
            inboxToggleBtn.hide();
        }

        userFolderList.isInbox = false;
        jQuery("#uf_more_folder_popup_area").handlebars("mail_more_user_folder_tmpl", userFolderList);

        jQuery("#selectMoreMailFolderPopup span").each(function (index) {
            if (jQuery(this).attr("status") != null) {
                var currentDepth = jQuery(this).closest("li").attr("depth");
                currentDepth = parseInt(currentDepth, 10);
                var childObj = jQuery(this).closest("li").find("ul[depth='" + (currentDepth + 1) + "']");
                childObj.show();
                jQuery(this).removeClass("open").addClass("close").attr({
                    "status": "open", "title": mailMsg.comn_close
                });
            }
        });
    }, "json");
}

function contactGoSlideMessage(msg, type) {
    jQuery.goSlideMessage(msg, type || 'caution');
}

function rcptSelectInfoPopup(list, func) {
    jQuery.goPopup({
        id: 'mail_write_multi_search_result_popup',
        pclass: 'layer_normal',
        header: mailMsg.mail_search_name_title,
        width: 600,
        contents: getHandlebarsTemplate("mail_write_rcpt_info_tmpl", list),
        openCallback: function () {
            jQuery("#mail_write_multi_search_result_popup").on("click", "#writeMultiSearchCheckAll", function () {
                var checkObj = jQuery("#mail_write_multi_search_result_popup input[name=emailCheck]:checkbox");
                if (jQuery(this).attr("checked")) {
                    checkObj.attr("checked", true);
                } else {
                    checkObj.attr("checked", false);
                }
            });
        },
        closeCallback: function () {
            jQuery("#mail_write_multi_search_result_popup").off();
        },
        buttons: [{btype: 'confirm', btext: mailMsg.comn_confirm, callback: func, autoclose: false}, {
            btype: 'cancel', btext: mailMsg.comn_cancel
        }]
    });
}

function bigAttachBtnCheck() {
    if (jQuery("#bigAttachFlagCheck").is(":checked")) {
        jQuery("#bigattachBtn").removeClass("action_off").addClass("action_on");
    } else {
        jQuery("#bigattachBtn").removeClass("action_on").addClass("action_off");
    }
}

function directedApproverFilter(param) {
    if (!isDirectedApprover()) {
        return false;
    }

    var sendParam = {};
    sendParam.to = param.to;
    sendParam.cc = param.cc;
    sendParam.bcc = param.bcc;
    sendParam.massRcpt = param.massRcpt;

    var isExternalDomain = true;
    ActionLoader.postSyncGoLoadAction("/api/mail/address/search/external/domain", sendParam, function (data) {
        isExternalDomain = data;
    }, "json");

    var approverWrap = jQuery("#approverAddrWrap");
    var approverList = jQuery("#approverAddrWrap ul li");

    if (approverList.length > 0 && isExternalDomain) {
        isExternalDomain = false;
        param.approver = jQuery("#approverAddrWrap li").attr("approver");
    } else if (isExternalDomain) {
        openDirectedApproverPopup();
        approverWrap.show();
    } else {
        approverList.remove();
        approverWrap.hide();
    }

    return isExternalDomain;
}

function isDirectedApprover() {
    return jQuery("#approverAddrWrap").attr("data");
}

function checkMassRcptToggleBtn(massRcptConfirm) {
    if (massRcptConfirm) {
        var isRcptClose = (getCookie("DO_MASSRCPT_CLOSE") == "on");
        if (!isRcptClose) {
            jQuery("#massRcptToggleBtn").removeClass("ic_arrow_down_type4").addClass("ic_arrow_up_type4").attr("title", mailMsg.comn_close);
            jQuery("#massRcptwrap").show();
        }
    }
}

function attachChecklayer() {
    jQuery.goPopup({
        id: 'attachChecklayer',
        header: mailMsg.mail_attach_check_layer_header,
        pclass: 'layer_normal layer_prevent_receiveError',
        width: 600,
        contents: getHandlebarsTemplate("mail_attch_check_layer"),
        openCallback: function () {
            jQuery("#attachChekLayerSubject").text(jQuery("#subjectTitle").text());
            jQuery("#attachChekLayerListWrap").html(jQuery("#attachListWrap").html());
            jQuery("#attachChekLayerFileCount").text(jQuery("#attachFileCount").text());
            jQuery("#attachChecklayer").on("click", "a,span,ins,li,p", function (event) {
                var layerType = jQuery(this).attr("evt-rol");
                if (!layerType) return;
                if (event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    event.cancelBubble = true;
                }
                event.preventDefault();
                var folderName = jQuery("#folderName").val();
                var uid = jQuery("#msgUid").val();
                var part = jQuery(this).closest("li").attr("part");

                if (layerType == "download-attach") {
                    downloadAttach(folderName, uid, part);
                } else if (layerType == "download-tnef-attach") {
                    var attKey = jQuery(this).attr("attkey");
                    downLoadTnefAttach(folderName, uid, part, attKey);
                } else if (layerType == "delete-attach") {
                    deleteAttachFile(folderName, uid, part);
                } else if (layerType == "delete-attach-all") {
                    var parts = "";
                    jQuery("#attachListWrap li").each(function () {
                        if (!jQuery(this).hasClass("deleted")) {
                            parts += (parts == "") ? parts : "_";
                            parts += jQuery(this).attr("part");
                        }
                    });
                    deleteAllAttach(folderName, uid, parts);
                } else if (layerType == "preview-attach") {
                    previewAttach(uid, folderName, part);
                } else if (layerType == "save-webfolder") {
                    var param = {"folderName": folderName, "uid": uid, "part": part};

                    if (jQuery("#shared_folder_wrap").find("p.title.on").length > 0) {
                        param.sharedUserSeq = jQuery("#shared_folder_wrap").find("p.title.on").children().attr("seq");
                        param.sharedFolderName = folderName;
                        param.sharedFlag = "shared";
                    }
                    openWebfolderPopup(param);
                }
            });
        },
        buttons: [{btype: 'close', autoclose: true, btext: mailMsg.comn_close}]
    });
}

function checkSendMailCount(param) {

    if (!isMaxSendMailCountUse || param.sendType == "draft") {
        return true;
    }

    makeProcessLoader();
    var recipientCount = 0;
    var sessionTimeoutCheck = true;
    jQuery.ajax({
        type: "POST",
        url: "/api/mail/recipientcount",
        data: {"to": param.to, "cc": param.cc, "bcc": param.bcc},
        async: false,
        success: function (result) {
            recipientCount = result.data;
            removeProcessLoader();
        },
        error: function () {
            sessionTimeoutCheck = false;
            removeProcessLoader();
        },
        dataType: "json"
    });

    //정상적인 응답이 없으면 로그인 팝업창을 띄운다.(GO-19217)
    if (!sessionTimeoutCheck) {
        return false;
    }

    var reservedDateUtc = "";
    if (param.sendType == "reserved") {
        reservedDateUtc = param.reservedDateUtc;
    }

    var sendMailCount = 0;
    jQuery.ajax({
        type: "POST",
        url: "/api/mail/sendmailcount",
        data: {"sendType": param.sendType, "reservedDateUtc": reservedDateUtc},
        async: false,
        success: function (result) {
            sendMailCount = result.data;
        },
        dataType: "json"
    });

    if ((recipientCount + sendMailCount) > maxSendMailCount) {
        jQuery.goAlert(mailMsg.mail_max_send_message_001);
        return false;
    }
    return true;
}

function isFolderManageMenu() {
    return (currentMenu == "setting" && currentMenuType == "folder");
}

function getRcptFilePath() {
    var massFileEl = jQuery("#massFileItem span.item_file");
    return (massFileEl.length > 0) ? massFileEl.attr("file-path") : "";
}
