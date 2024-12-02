//메일삭제
function deleteMessage() {
    var hasTrash = isContainedTrashMail();

    var msg = mailMsg.confirm_delete;
    if (hasTrash || currentFolderType == "trash") {
        msg = mailMsg.confirm_trashdelete;
    } else if (currentFolderType == "reserved") {
        msg = mailMsg.confirm_reserveddelete;
    }

    if (!confirm(msg)) {
        return;
    }

    var uidArray = getMailListCheckedIdArray();
    var params = getListProcessParams(uidArray);
    var messageParam = {"folderNames": params.fnames, "uids": params.uids};
    mailControl.deleteMessages(messageParam);
}

function deleteMdn() {
    var midArray = new Array();
    getMailListCheckedObj().each(function () {
        midArray.push(jQuery(this).val());
    });
    mailControl.deleteMdn({"messageIds": midArray});
}

//읽음/안읽음
function changeSeenFlag(isSeen) {
    var uidArray = getMailListCheckedIdArray();
    var msgInfo = getListProcessParams(uidArray);
    mailControl.switchMessagesFlags(msgInfo.uids, msgInfo.fnames, "S", isSeen);
}

//중요메일
function switchFlagFlaged(midArray, flagType, flagUse) {
    var msgInfo = getListProcessParams(midArray);
    mailControl.switchMessagesFlags(msgInfo.uids, msgInfo.fnames, flagType, flagUse);
}

//메일함선택
function goFolder(folderName, flag) {
    if (!checkEscapeWriteMode()) {
        return;
    }
    var param = {"folder": folderName};
    param.sharedFlag = "user";
    if (flag) {
        param.flag = flag;
    }
    hideMailFolderSide();
    mailControl.loadMessageList(param);
}

function displayHomeIcon() {
    //웹,앱 여부에 따라 홈버튼 노출
    var goAgent_device = sessionStorage.getItem("GO-Agent-mail");
    if (goAgent_device == "GO-Android" || goAgent_device == "GO-iPhone") {
        jQuery("#mailHomeToolbarWrap a[evt-rol='goto-gohome']").hide();
    }
}

//메일 홈으로 이동
function gotoMailHome(isInit) {
    var param = {"folder": "Inbox"};
    goMailList(param, isInit);
}

//메일 리스트 이동
function goMailList(param, isInit) {
    param = (!param) ? {} : param;
    if (!checkEscapeWriteMode()) {
        return;
    }
    makeTopMenuTitle(MAIL_APP_NAME);
    hideMailFolderSide();
    mailControl.loadMessageList(param, false, isInit);
}

//메일함 비우기
function emptyFolder(folderName) {
    var msg = "";
    if (folderName == "Trash") {
        msg = mailMsg.confirm_emptytrash;
    } else if (folderName == "Spam") {
        msg = mailMsg.confirm_emptyspam;
    } else {
        msg = mailMsg.mail_folder_delete_alert;
    }
    setTimeout(function () {
        if (!confirm(msg)) {
            return;
        }
        var param = {"folderName": folderName};
        folderControl.emptyMailFolder(param);
    }, 500);
}

//메일함 SIDE 토글
function toggleMailFolderSide() {
    var isClose = (jQuery("#mail_folder_side_background").css("display") == "none");
    if (isClose) {
        showMailFolderSide();
    } else {
        hideMailFolderSide();
    }
}

//메일함 SIDE 닫기
function hideMailFolderSide() {
    jQuery("#mail_folder_side,#mail_folder_side_background").hide();
    jQuery("#popSideOverlay").css({
        left: '0px',
        top: 0,
        width: '0px',
        height: '0px',
    }).hide();
    jQuery(document).undelegate("#popSideOverlay, header.go_header", "scrollstart");
    jQuery("#go_body").height('auto');
    jQuery(".dim").hide();
}

//메일함 SIDE 열기
function showMailFolderSide() {
    jQuery("#mail_folder_side,#mail_folder_side_background").show();
    var $contentBody = jQuery("#go_content");

    var contentBodyOffset = $contentBody.offset();

    jQuery("#popSideOverlay").css({
        left: contentBodyOffset.left + 'px',
        top: 0,
        width: $contentBody.width() + 'px',
        height: jQuery(window).height() + 'px'
    }).show();
    jQuery(document).scrollTop(0).delegate("#popSideOverlay, header.go_header", "scrollstart", false);
    jQuery("#go_body").height(jQuery(window).height() - jQuery("header").height());
    folderControl.makeLeftMenuIscroll();
    jQuery(".dim").show();
}

//메일 플래그 제어
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
}

//읽기 메일 플래그 제어
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

//메일함 메일 갯수 업데이트
function executeFolderInfo() {
    folderControl.updateFolderCountInfo();
}

//즐겨찾기 실행
function bookmarkExecute(seq, type, query) {
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

    }
    param.bookmarkSeq = seq;
    goMailList(param);
}

//빠른 검색
function folderExecute(type) {
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
    goMailList(param);
}

//사이드 메뉴 선택
function selectedMailMenu() {
    var linkId = "";
    if (Number(bookmarkSeq) > 0) {
        linkId = "bookmark_title_" + bookmarkSeq;
    } else {
        if (listType == "tag") {
            linkId = "tag_link_" + bookmarkValue;
        } else {
            if (!isAllFolder) {
                linkId = "folder_link_" + currentFolderEncName;
            }
        }
    }
    selectCurrentFolderName(linkId);
}

//메일읽기
function readMessage(folderName, uid) {
    var param = {"folder": folderName, "uid": uid};
    mailControl.readMessage(param);
}

function selectCurrentFolderName(linkId) {
    jQuery("#mail_folder_side li.title").removeClass("on");
    if (linkId != "") {
        if (jQuery("#" + getFolderNameId(linkId)).length == 0) {
            setTimeout(function () {
                jQuery("#" + getFolderNameId(linkId)).addClass("on");
            }, 1000);
        } else {
            jQuery("#" + getFolderNameId(linkId)).addClass("on");
        }
    }
}

//메일쓰기
function goWrite() {
    if (!checkEscapeWriteMode()) {
        return;
    }
    var isWrite = true;
    var dfolderUnseen = jQuery("#defaultFolder2_num").text();
    if (isWriteNoti && Number(dfolderUnseen) > 0) {
        if (confirm(mailMsg.confirm_draftswrite)) {
            isWrite = false;
            goFolder("Drafts");
        }
    }
    if (isWrite) {
        var paramObj = {wtype: "normal"};
        mailControl.writeMessage(paramObj);
    }
}

//나에게
function makeWriteMyself(checked) {
    var isExist = false;

    jQuery("#toAddrWrap ul.name_tag li:not(.creat)").each(function () {
        var mailFormat = jQuery(this).find("span.name").data("email");
        var email = get_email(mailFormat);
        if (USEREMAIL == email) {
            if (checked) {
                isExist = true;
                return false;
            } else {
                deleteAddressUnitFormat("to", jQuery(this));
            }
        }
    });
    if (checked && !isExist) {
        var emailFormat = "\"" + USERNAME + "\" <" + USEREMAIL + ">";
        makeAddressUnitFormat("to", emailFormat);
    }
}

//답장
function replyWrite(type) {

    var uidArray = getMailListCheckedIdArray();
    var msgInfo = getListProcessParams(uidArray);

    var params = {};
    params.folderName = msgInfo.fnames[0];
    params.uids = msgInfo.uids;
    params.wtype = type;

    goWrieLoad(params);
}

//전달
function forwardMessage(fwtype) {

    var uidArray = getMailListCheckedIdArray();
    var msgInfo = getListProcessParams(uidArray);

    var params = {};
    params.folderName = msgInfo.fnames[0];
    params.uids = msgInfo.uids;
    params.fwmode = fwtype;
    params.wtype = "forward";

    goWrieLoad(params);
}

//다시쓰기
function reWrite() {

    if (isWriteModify()) {
        if (!confirm(mailMsg.confirm_mobile_escaperewrite)) {
            return;
        }
        hideAutoComplate();
    } else {
        hideAutoComplate();
    }

    mailControl.reloadWriteMessage();
}

//메일발송
function sendMessage(type) {

    if (currentMenu != "send") {
        var param = mailControl.getSendData();
        param = makeRcptForm(param);

        var to = param.to;
        var cc = param.cc;
        var bcc = param.bcc;

        var checkSendInfo = false;
        if (type != "draft") {
            type = "normal";
            param.massMode = false;
            if (jQuery.trim(to) == "" && currentMenu != "send") {
                alert(mailMsg.error_norecipient);
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
        }
        param.sendType = type;

        var subject = jQuery.trim(jQuery("#subject").val());
        if (subject == "") {
            alert(mailMsg.alert_nosubject);
            jQuery("#subject").focus();
            return;
        }
        param.subject = subject;

        var signSeq = jQuery("#signSelect").val();
        if (signSeq && signSeq > 0) {
            param.attachSign = true;
            param.signSeq = signSeq;
        } else {
            param.attachSign = false;
            param.signSeq = "";
        }

        var content = jQuery("#content").val();

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
                for (var i = 0; i < to.length; i++) {
                    emailArray[i] = get_email(to[i]);
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
                var keyword = sendAttachData;

                if (searchContentKeyword(content, keyword, /,/g)) {
                    var fileAttachWrap = jQuery("#file_wrap");
                    var imgAttachWrap = jQuery("#img_wrap");
                    if (fileAttachWrap.children().length > 0 || imgAttachWrap.children().length > 0) {
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
                jQuery("#sendCheckLayerApply").show();
            }

            if (param.sendEmailCheckResult || param.sendAttachCheckResult || param.sendKeywordCheckResult || param.sendInfoCheck) {
                jQuery("#attachOverlay").show();
                jQuery("#sendCheckLayer").show();
                mailControl.setSendData(param);
                checkSendInfoValue(param);
            } else {
                sendMessageParamProcess(param);
            }
        } else {
            sendMessageParamProcess(param);
        }
    }

    //sendMessageParamProcess(param);
}

function searchContentKeyword(content, keyword, delimiter) {
    var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
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

    jQuery("#file_wrap li").each(function () {
        attachArray.push({
            name: jQuery(this).attr("filename"),
            id: jQuery(this).attr("orgname"),
            size: jQuery(this).attr("filesize"),
            hostId: jQuery(this).attr("hostid")
        });

    });
    jQuery("#img_wrap li").each(function () {
        attachArray.push({
            name: jQuery(this).attr("filename"),
            id: jQuery(this).attr("orgname"),
            size: jQuery(this).attr("filesize"),
            hostId: jQuery(this).attr("hostid"),
            fileattr: "go"
        });

    });

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

    jQuery("#sendInfoCheck").append(getHandlebarsTemplate("mail_send_allow_check_content_tmpl", data));

}

//받는 사람 한명 입력했는지 체크
function checkSendMessage() {
    var param = mailControl.getSendData();
    if (isSendInfoCheckUse) {
        var toList = getCheckSendInfoValue("to");
        if (!toList || toList.length == 0) {
            alert(mailMsg.mail_rcpt_to_noselect);
            return;
        }
        settingWriteInfo();
        jQuery("#sendCheckLayer").hide();
    }
    sendMessageParamProcess(param);
}

function checkSendMessageCancel() {
    jQuery("#sendCheckLayer").hide();
    jQuery("#sendInfoCheck").children().remove();
}

function settingWriteInfo() {
    var toList = getCheckSendInfoValue("to");
    var ccList = getCheckSendInfoValue("cc");
    var bccList = getCheckSendInfoValue("bcc");

    deleteAddressUnitFormatAll("to");
    deleteAddressUnitFormatAll("cc");
    deleteAddressUnitFormatAll("bcc");

    if (toList && toList.length > 0) {
        for (var i = 0; i < toList.length; i++) {
            makeAddressUnitFormat("to", toList[i]);
        }
    }
    if (ccList && ccList.length > 0) {
        for (var i = 0; i < ccList.length; i++) {
            makeAddressUnitFormat("cc", ccList[i]);
        }
    }
    if (bccList && bccList.length > 0) {
        for (var i = 0; i < bccList.length; i++) {
            makeAddressUnitFormat("bcc", bccList[i]);
        }
    }

    var param = mailControl.getSendData();
    param.to = toList.reverse().join();
    param.cc = ccList.reverse().join();
    param.bcc = bccList.reverse().join();

    mailControl.setSendData(param);

    settingWriteInfoAttach();
}

function settingWriteInfoAttach() {
    var param = mailControl.getSendData();
    var attachList = "";
    jQuery("#sendCheckLayer input[name=attachFile]").each(function () {
        if (jQuery(this).attr("checked")) {
            var value = jQuery(this).val();

            var orgname = jQuery(this).attr("orgname");
            var filename = jQuery(this).attr("filename");
            var filesize = jQuery(this).attr("filesize");
            var fileattr = jQuery(this).attr("fileattr");
            if (fileattr != "") {
                attachList += orgname + "\t" + filename + "\t" + filesize + "\t" + "0" + "\t" + fileattr + "\n";
            } else {
                attachList += orgname + "\t" + filename + "\t" + filesize + "\n";
            }
        } else {
            var orgname = jQuery(this).attr("orgname");
            var filename = jQuery(this).attr("filename");
            var filesize = jQuery(this).attr("filesize");
            var fileattr = jQuery(this).attr("fileattr");

            jQuery("#img_wrap li[orgname='" + orgname + "']").remove();
        }
    });
    param.attachList = attachList;
    mailControl.setSendData(param);
}


function getCheckSendInfoValue(type) {
    var emailArray = new Array();
    jQuery("#sendCheckLayer input[name=" + type + "Addr]:checked").each(function () {
        emailArray.push(jQuery(this).val());
        emailArray.reverse();
    });
    return emailArray;
}

//오송신 끝

function sendMessageParamProcess(param) {
    var type = param.sendType;
    param.content = jQuery("#content").val();

    var quotaInfo = folderControl.getQuotaInfo();
    if (Number(quotaInfo.percent) >= 100) {
        if (type == "draft") {
            alert(mailMsg.mail_send_quotaover_draft);
            return;
        } else {
            if (!confirm(mailMsg.mail_send_quotaover_confirm)) {
                return;
            }
            param.receiveNoti = false;
            param.saveSent = false;
        }
    } else {
        if (jQuery("#receivenoti").attr("checked")) {
            param.receiveNoti = true;
        }
        if (jQuery("#onesend").attr("checked")) {
            param.oneSend = true;
        }
    }

    var sendConfirmMsg = mailMsg.mail_send_confirm;
    if (type == "draft") {
        sendConfirmMsg = mailMsg.mail_send_drafts_confirm;
    } else {
        param.saveSent = true;
    }
    param.mobileMail = true;
    param.forwardOrgText = jQuery("#forwardOrgText").val();
    param.replyOrgText = jQuery("#replyOrgText").val();
    if (!sendConfirm) {
        param.attachList = getAttachString();
        mailControl.sendMessage(param);
    } else {
        if (confirm(sendConfirmMsg)) {
            param.attachList = getAttachString();
            mailControl.sendMessage(param);
        }
    }

}

function getAttachString() {
    var attachList = "";
    jQuery("#file_wrap li").each(function () {
        var orgname = jQuery(this).attr("orgname");
        var filename = jQuery(this).attr("filename");
        var filesize = jQuery(this).attr("filesize");
        var hostId = jQuery(this).attr("hostid");

        attachList += orgname + "\t" + filename + "\t" + filesize + "\t" + hostId + "\n";
    });
    jQuery("#img_wrap li").each(function () {
        var orgname = jQuery(this).attr("orgname");
        var filename = jQuery(this).attr("filename");
        var filesize = jQuery(this).attr("filesize");
        var hostId = jQuery(this).attr("hostid");
        var fileattr = "go";

        attachList += orgname + "\t" + filename + "\t" + filesize + "\t" + hostId + "\t" + "0" + "\t" + fileattr + "\n";
    });
    return attachList;
}

function goWrieLoad(paramObj) {
    if (!checkEscapeWriteMode()) {
        return;
    }
    mailControl.writeMessage(paramObj);
}

//임시보관함 메일쓰기
function writeDraftMessage(folderName, uid) {
    goWrieLoad({wtype: "drafts", folderName: folderName, uids: [uid]});
}

//수신확인 목록
function loadMdnList(param) {
    if (!checkEscapeWriteMode()) {
        return;
    }
    hideMailFolderSide();
    mailControl.loadMdnList(param);
}

//발송취소
function recallMsg(recallEmails) {
    var uid = jQuery("#mdnReadUid").val();
    var messageId = jQuery("#mdnMessageId").val();
    var subject = jQuery("#mdnMessageSubject").val();

    if (!confirm(mailMsg.mail_mdn_confirm)) {
        return;
    }
    var param = {};
    param.messageId = messageId;
    param.uid = uid;
    param.subject = subject;
    param.recallEmails = recallEmails;
    mailControl.recallMessage(param);
}

//검색 레이어 토글
function toggleSearchMessageWrap() {
    jQuery('#goSearch').toggle();
    var tmplData = {};
    tmplData.folderList = folderControl.getUserFolderList();
    jQuery('#detailSearchToggle').removeClass('on');
    jQuery('#searchDetail').handlebars('mail_search_detail', tmplData);
    var isMailAttachSearch = mailControl.isMailAttachSearch();
    if (isMailAttachSearch) {
        jQuery('#adAttachContentSearch').show();
    }
    mailControl.initSearchInfo();
    mailControl.preventBodyScroll();
    mailControl.searchResultSetHeight();
    mailControl.searchLayerInitScroll();
    mailControl.makeSearchEvent();
}

//검색 레이어 열기
function openSearchMessageWrap() {
    var searchWrapObj = jQuery("#search_wrap");
    searchWrapObj.show();
    clearSearchTerm();
    openSearchOverlay();
}

//검색 레이어 닫기
function closeSearchMessageWrap() {
    var searchWrapObj = jQuery("#search_wrap");
    searchWrapObj.hide();
    closeSearchOverlay();
}

function simpleSearch(searchData) {
    var searchInputObj = jQuery('#commonSearchInput');
    if(searchInputObj.val() == ""){
        alert(mailMsg.mail_mobile_search_message);
        return;
    }
    if (!validateSearchInput(searchInputObj, 2, 64, "searchMail")) {
        return;
    }

    var searchText = jQuery.trim(searchInputObj.val());
    var searchParams = getSimpleSearchParam(searchText, searchData);
    mailControl.getSearchList(searchParams, function (data) {
        printSearchList(data);
        searchInputObj.blur();
    });
}

function detailSearch(e) {
    if (!validateAdSearchMessage()) {
        return;
    }
    var searchParams = getDetailSearchParam();
    mailControl.getSearchList(searchParams, function (data) {
        printSearchList(data);
        jQuery("#detailSearchToggle").removeClass('on');
        jQuery('#commonSearchInput').blur();
    });
}

function moreSearchList(searchInfo) {
    var searchParams = searchInfo.param;
    searchParams.page = searchInfo.pageInfo.nextPage;
    mailControl.getSearchList(searchParams, function (data) {
        printSearchMoreList(data)
    });
}

function printSearchList(data) {
    var tmplData = {};
    tmplData.total = data.total;
    tmplData.messageList = data.messageList;
    jQuery('#simpleSearchWrap, #detailSearchWrap').hide();
    jQuery('#searchResultWrap').show();
    jQuery('#searchResultWrap').handlebars('mail_search_list_wrap', tmplData);
    mailControl.makeSearchResultEvent();
}

function printSearchMoreList(data) {
    jQuery('#searchResultWrap ul').append(getHandlebarsTemplate('mail_search_list', data.messageList));
    mailControl.makeSearchResultEvent();
}

function getSimpleSearchParam(searchText, searchData) {

    var param = {
        adv: "on",
        category: "",
        edate: "",
        flag: "",
        folder: "all",
        listType: "mail",
        fromaddr: '',
        keyWord: '',
        sdate: '',
        searchExtFolder: 'off',
        toaddr: ''
    };

    if (searchData == 'all') {
        param = {
            folder: searchData,
            keyWord: searchText
        };
    } else if (searchData == 'fromaddr') {
        param['fromaddr'] = searchText;
    } else if (searchData == 'toaddr') {
        param['toaddr'] = searchText;
    } else if (searchData == "subject") {
        param['category'] = 's';
        param['keyWord'] = searchText;
    }
    return param;
}

function getDetailSearchParam() {
    var folderName = jQuery.trim(jQuery("#adFolderName").val());
    var adFrom = jQuery.trim(jQuery("#fromaddr").val());
    var adTo = jQuery.trim(jQuery("#toaddr").val());
    var searchCond = "";
    jQuery("#adSearchCondWrap input:checked").each(function () {
        searchCond += jQuery(this).val();
    });
    var adKeyWord = jQuery.trim(jQuery("#adSearchKeyWord").val());
    var param = {
        adv: "on",
        category: searchCond,
        edate: "",
        sdate: "",
        flag: '',
        folder: folderName,
        fromaddr: adFrom,
        keyWord: adKeyWord,
        listType: "mail",
        searchExtFolder: 'off',
        toaddr: adTo
    };
    return param;
}

function validateAdSearchMessage() {
    var adFrom = jQuery.trim(jQuery("#fromaddr").val());
    var adTo = jQuery.trim(jQuery("#toaddr").val());
    var adKeyWord = jQuery.trim(jQuery("#adSearchKeyWord").val());

    if (adFrom == "" && adTo == "" && adKeyWord == "") {
        alert(mailMsg.mail_mobile_search_message);
        return false;
    }

    if (adKeyWord != "" && jQuery("#adSearchCondWrap input[type=checkbox]:checked").length < 1) {
        alert(mailMsg.mail_search_valid_checkbox);
        return false;
    }

    if (adKeyWord == "" && jQuery("#adSearchCondWrap input[type=checkbox]:checked").length >= 1) {
        alert(mailMsg.mail_mobile_search_message);
        return false;
    }

    var inputData = [{id: "fromaddr"}, {id: "toaddr"}, {id: "adSearchKeyWord"}];
    var len = inputData.length;
    for (var i = 0; i < len; i++) {
        if (!validateSearchInput(jQuery("#" + inputData[i].id), 2, 64, "searchMail")) {
            return false;
        }
    }
    return true;
}

function openSearchOverlay() {
    jQuery('#popSearchOverlay').remove();
    jQuery('<div id="popSearchOverlay" class="overlay" />').appendTo('.go_wrap').click(function (e) {
        closeSearchMessageWrap(e);
    });
}

function closeSearchOverlay() {
    jQuery('#popSearchOverlay').remove();
}

//검색
function searchMessage() {
    var searchObj = jQuery("#search_keyword");
    keyWord = jQuery.trim(searchObj.val());
    if (keyWord == "") {
        alert(mailMsg.alert_search_nostr);
        searchObj.focus();
        return;
    }
    if (!validateInput(searchObj, 2, 64, "searchMail")) {
        return;
    }
    if (!checkEscapeWriteMode()) {
        return;
    }
    if (mailControl.getListMode() == "mdnlist") {
        var param = {"pattern": keyWord};
        loadMdnList(param);
    } else if (mailControl.getListMode() == "mdnread") {
        var uid = jQuery("#mdnReadUid").val();
        var param = {"pattern": keyWord, "uid": uid};
        mailControl.loadMdnRead(param);
    } else {
        var param = {"folder": "all", "keyWord": keyWord};
        mailControl.searchMessage(param);
    }
    closeSearchMessageWrap();
}

//검색 취소
function searchMessageCancel() {
    /*
     var folderName = mailControl.getCurrentFolder();
     if(mailControl.getListMode() == "mail"){
     folderName = (folderName == "all")?"Inbox":folderName;
     goFolder(folderName);
     } else {
     var param = {};
     if(mailControl.getListMode() == "mdnlist"){
     mailControl.loadMDNList(param);
     } else if(mailControl.getListMode() == "mdnread"){
     param.uid = jQuery("#mdnReadUid").val();
     mailControl.loadMdnRead(param);
     }
     }
     */
    jQuery("#search_keyword").val("");
}

function searchGoMessage() {
    if (currentMenu == "addr") {
        searchAddr();
    } else {
        searchMessage();
    }
}

function checkEmailInvalidAddress(str) {
    var addr_array = getEmailArray(str);

    for (var i = 0; i < addr_array.length; i++) {
        var address = addr_array[i];
        address = jQuery.trim(address);

        var email = get_email(address);
        // Address Group Check
        // Public Address Group Check
        // Organization
        if (email.charAt(0) == '$'
            || email.charAt(0) == '&'
            || email.charAt(0) == '+'
            || email.charAt(0) == '#') {
            continue;
        }

        if (address == "" || isEmail(email)) {
            continue;
        } else {
            alert(mailMsg.alert_invalidaddress + "\n\n" + address);
            return false;
        }
    }
    return true;
}

//첨부이미지 올리기
function selectAttachPhoto() {
    jQuery("#subject").blur();
    jQuery("#content").blur();
    jQuery("#attachOverlay").touchstart(function () {
        closeAttachPhoto();
    }).show();
    jQuery("#attachLayer").show();
}

//첨부이미지 모달 닫기
function closeAttachPhoto() {
    jQuery("#attachLayer").hide();
    jQuery("#attachOverlay").hide();
}

function makeCopyMoveContent() {
    var userFolder = folderControl.getUserFolderList();
    jQuery("#mail_move_folder_list").empty();
    jQuery("#mail_move_folder_list").handlebars("mail_folder_selectbox_tmpl", userFolder);
}

function makeTagListContent() {
    var userTag = folderControl.getTagData();
    jQuery("#mail_tag_message_list").empty();
    jQuery("#mail_tag_message_list").handlebars("mail_tag_page_tmpl", userTag);
}

//이동/복사
function copyMoveMessage(toFolderName) {
    var uidArray = getMailListCheckedIdArray();
    var params = getListProcessParams(uidArray);
    var moveParam = {"fromFolders": params.fnames, "uids": params.uids, "toFolder": toFolderName};
    mailControl.moveMessage(moveParam);
}

function tagMessage(tagId, flag) {
    var uidArray = getMailListCheckedIdArray();
    var params = getListProcessParams(uidArray);
    var tagParam = {"addFlag": flag, "tagId": tagId, "folderNames": params.fnames, "uids": params.uids};
    mailControl.taggingMessage(tagParam);
}

//메일쓰기 주소록
function writeAddrSelect() {
    var contactType = getCookie("ContactViewTypeMobile");
    contactType = (contactType) ? contactType : "user";

    changeWriteAddrSelect(contactType);
    jQuery('select.addr_select').trigger('change');
}

function changeWriteAddrSelect(contactType) {
    var $writeAddrSelect = jQuery("#writeAddrSelect").val(contactType);
    $writeAddrSelect.val(contactType);
    jQuery("#writeAddrLink span.txt").text($writeAddrSelect.find("option:selected").text());
}

//메일쓰기 주소록 닫기 + 재로딩
function changeMailWriteMode() {
    changeMailContainer("write");
    makeTopMenuTitle(MAIL_APP_NAME);
    checkCcBccRcptArea();
}

//메일쓰기 주소록 닫기
function closeAddressContent() {
    jQuery("#addr_content").hide();
    jQuery("#go_content").show();
    jQuery("#main_content").addClass("write");
}

//메일쓰기로 주소록 넘기기
function makeAddrSelectItem(type, selectedNodes) {
    var items = null;
    if (jQuery("#writeAddrSelect").val() === "emp") {
        addSelectedMemberInReceiverList(type, selectedNodes);
    } else {
        items = jQuery("#addr_member_list input[name=addrEmail]:checked");
        jQuery(items).each(function () {
            var name = jQuery(this).data("name");
            var positionName = jQuery(this).data("position");
            var departmentName = jQuery(this).data("department");
            var email = jQuery(this).data("email");
            makeAddressUnitFormat(type, getEmailInfoFormat(name, positionName, departmentName, email));
        });
    }
    checkCcBccRcptArea();
    if (selectedNodes.length === 0 && (!items || items.length == 0)) {
        alert(mailMsg.comn_error_001);
        return;
    }
    setTimeout(function () {
        alert(mailMsg.addr_list_write_insert_success);
    }, 200);
}

function closeWebFolder() {
    jQuery(window).off('scroll.renderNewWebFolderPage');
    jQuery("#webfolder_content").hide();
    jQuery("#mailWriteToolbarWrap").show();
    jQuery("#go_content").show();
}

function goParentWebFolder() {
    jQuery('#moveParentWebFolder').trigger('click');
}

function checkUploadfile(attaches) {
    var name, extension, size, upkey, uid, hostId;

    _.each(attaches, function (attach) {
        upkey = attach.upkey;
        name = attach.name;
        extension = attach.extension;
        size = attach.size;
        hostId = attach.hostId;
        uid = (attach.uid) ? attach.uid : "";
        addlist(name, extension, size, upkey, hostId, uid);
    });
}

function addlist(name, extension, size, path, hostId, uid) {
    var atype = "normal";
    var maxAttachSize = MAILCONFIG.maxAttachSize;
    var attsize = parseInt(size) / 1024 / 1024;
    var totalFileSize = attsize;

    jQuery("#attach_wrap li").each(function () {
        totalFileSize += jQuery(this).attr("filesize") / 1024 / 1024;
    });

    if (maxAttachSize < totalFileSize) {
        alert(msgArgsReplace(mailMsg.mail_attach_limit_size, [maxAttachSize]));
        return;
    }

    var file = {};
    file.data = {
        "filePath": path,
        "fileSize": size,
        "fileName": name,
        "hostId": hostId,
        "uid": uid,
        "type": atype,
        "notChage": true,
        "fileExt": extension,
        "thumbnail": "/thumb/temp/" + hostId + "/small" + path
    };
    attachFileSuccess(file);
    return true;
}

function changeMailWriteAddrType(addrType, isInit, groupId, isReadable) {
    var addrType = (!addrType) ? "user" : addrType;
    setCookie("ContactViewTypeMobile", addrType, 365);
    var params;

    if (addrType === 'company') {
        params = {groupId: groupId, isReadable: isReadable};
    } else if (addrType === 'department') {
        params = {deptId: groupId};
    }
    mailControl.writeAddrSelect(jQuery.extend({ownerType: addrType, isInit: isInit}, params));
}

//주소록 검색 취소
function searchAddrCancel() {
    /*
     var addrParam = mailControl.getAddrParam();
     var addrType = (addrParam && addrParam.ownerType) ? addrParam.ownerType : "user";
     var param = {"ownerType":addrType};
     mailControl.writeAddrSelect(param);
     */
    jQuery("#search_keyword").val("");
}

function searchAddr() {
    var searchObj = jQuery("#addrSearchText");
    var keyWord = jQuery.trim(searchObj.val());
    if (keyWord == "") {
        alert(mailMsg.alert_search_nostr);
        searchObj.focus();
        return;
    }
    if (!validateInput(searchObj, 2, 64, "onlyBack")) {
        return;
    }
    var addrParam = mailControl.getAddrParam();
    var addrType = (addrParam && addrParam.ownerType) ? addrParam.ownerType : "user";
    var param = {"ownerType": addrType};
    param.searchType = "or";
    param.keyword = keyWord;
    param.isReadable = (addrParam && addrParam.isReadable) ? addrParam.isReadable : false;
    mailControl.writeAddrSelect(param);
}

function clearSearchTerm() {
    var input = jQuery("#search_keyword");
    input.val("");
    input.focus();
    // android App 에서 키보드가 안올라오는 현상이 있다. 임시 처리
    input.bind("focusout", function () {
        this.focus();
        this.trigger("tap");
    });
    setTimeout(function () {
        input.off("focusout");
    }, 300);
}

//공유메일함 메일 리스트
function goSharedFolder(folderName, userSeq) {
    if (!checkEscapeWriteMode()) {
        return;
    }
    hideMailFolderSide();
    var param = {
        "folder": folderName,
        "sharedFlag": "shared",
        "sharedUserSeq": userSeq,
        "sharedFolderName": folderName
    };
    mailControl.loadMessageList(param);
}

//메일 이동
function moveMessagePage() {
    makeCopyMoveContent();
    changeMailContainer("moveFolder");
    //historyControl.setHistory({"type":"move","param":{"dummy":"dummy"}});
}

function tagMessagePage() {
    makeTagListContent();
    changeMailContainer("tag");
    //historyControl.setHistory({"type":"tag","param":{"dummy":"dummy"}});
}

function doDraftSave() {
    isAutoSave = true;
    //processMessageViewer(mailMsg.autosave_message_start);

    var param = {};
    param = makeRcptForm(param);

    var editorMode = jQuery("#editorMode").data("mode");
    var contentValue;

    contentValue = jQuery("#content").val();


    param.subject = jQuery("#subject").val();
    param.sendType = "draft";

    var sendData = mailControl.getSendData();

    param.draftMessageId = sendData.draftMessageId;
    param.sendFlag = sendData.sendFlag;
    param.writeMode = editorMode;
    param.uids = sendData.uids;
    param.folderName = sendData.folder;
    param.charset = sendData.charset;
    param.massMode = false;
    param.content = contentValue;

    param.mobileMail = true;
    param.forwardOrgText = jQuery("#forwardOrgText").val();
    param.replyOrgText = jQuery("#replyOrgText").val();

    param.attachList = getAttachString();

    mailControl.sendMessage(param);
}

function openDownloadAttachConfirm() {
    jQuery("#attachFileWrap").attr("evt-confirm", true);
    jQuery("#downloadAttachConfirmCheck").html(getHandlebarsTemplate("mail_attach_download_confirm_tmpl"));
    jQuery("#attachDownloadConfirmSubject").text(jQuery("#readSubject").text());
    jQuery("#attachFileCount").text(jQuery("#mailViewContentWrap div.add_file_header span.num").text());
    jQuery("#attachDownloadConfirmItemWrap").empty();
    jQuery("#attachFileWrap li").each(function () {
        var data = {};
        data.name = jQuery(this).attr("fileName");
        data.css = jQuery(this).find("span.ic_file").attr("class");
        data.size = jQuery(this).find("span.size").text();
        data.realsize = jQuery(this).attr("filesize");
        data.part = jQuery(this).attr("part");
        jQuery("#attachDownloadConfirmItemWrap").append(getHandlebarsTemplate("mail_attach_download_confirm_item_tmpl", data));
    });
    jQuery("#attachOverlay").show();
    jQuery("#downloadAttachConfirmLayer").show();
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
        alert(mailMsg.mail_max_send_message_001);
        return false;
    }
    return true;
}

function addSelectedMemberInReceiverList(type, selectedMembers) {
    var _selectedMembers = [];
    _.each(selectedMembers, function (member) {
        var isPersonOrDeptHasEmail = null;
        var memberType = member.type.toLowerCase();
        if ((memberType !== "department" && memberType !== "org")
            || ((memberType === "department" || memberType === "org") && member.email !== "")) {
            isPersonOrDeptHasEmail = true;
        }
        if (isPersonOrDeptHasEmail) {
            _selectedMembers.push(member);
        } else {
            jQuery.ajax({
                type: "GET",
                url: "/api/organization/multi/list",
                async: false,
                data: {
                    "deptid": member.id,
                    "type": "child"
                },
                dataType: "json",
                success: function (result) {
                    _.each(result, function (data) {
                        var _data = _.extend(data.metadata, {department: data.metadata.deptName});
                        _selectedMembers.push(_data);
                    });
                }
            });
        }
    });
    _.each(_selectedMembers, function (node) {
        var departmentName = _.isUndefined(node.department) ? node.departments : node.department;
        var value = getEmailInfoFormat(node.name, node.position, departmentName, node.email);
        makeAddressUnitFormat(type, value);
    });
}