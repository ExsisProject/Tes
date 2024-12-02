var layoutControl, basicAttachUploadControl, massAttachUploadControl = null;
var mailControl, folderControl, mailSettingControl, historyControl, editorControl, editorImgControl;
var currentFolderType, currentFolderName, currentFolderViewName, layoutMode, isAllfolder, currentMenu, currentMenuType;
var autoSaveTimeTerm, checkSaveTimeTerm, autoSaveMessageTerm, writeAutoSave;
var autoReflashTimeTerm, runAutoReflashTime;
var isAutoReflash = false;
var POPUPDATA = {};
var isDocTemplate = false;
var isAutoSave = false;
var isAutoSaveStart = false;
var isSendWork = false;
var isRcptModeNormal = true;
var isRcptModeNoneAC = false;
var sendAllowUsed = false;
var isSendInfoCheckUse = false;
var isSendEmailCheckUse = false;
var isSendAttachCheckUse = false;
var sendAttachData = "";
var isSendKeywordCheckUse = false;
var sendKeywordData = "";
var today;
var isOcxUpload = false;
var isOcxUploadDownModule = false;
var MAX_ATTACH_SIZE = 0;
var MAX_BIG_ATTACH_SIZE = 0;
var BIG_ATTACH_QUOTA = 0;
var MAX_BIG_ATTACH_QUOTA = 0;
var BIGATTACH_TIMEZONE;
var BIGATTACH_EXPIRE_DATE;
var BIGATTACH_EXPIRE;
var BIGATTACH_DOWNCNT;
var USE_BIGATTACH_MODE = false;
var isBookmark = false;
var bookmarkType = "mail";
var bookmarkName = "";
var bookmarkValue = "";
var bookmarkSeq = 0;
var listDateStore = -1;
var popWriteWin;
var isLetter = false;
var mailBadgeCount = 0;
var isModFieldInside = false;
var isMaxSendMailCountUse = false;
var maxSendMailCount = 0;
var childrenFnameForModify = null;
var initSendData = {};
var isUseReflashTime = true;
var previousSenderEmail = "";
var sendConfirm = "";
var LOCAL_DOMAIN = "";

var mailToolbarRuleMap = new HashMap();
mailToolbarRuleMap.put("normal", {
    "quick": true,
    "tag": true,
    "delete": true,
    "reply": true,
    "forward": true,
    "seen": true,
    "copy": true,
    "move": true,
    "erase": true,
    "save": true,
    "filter": true,
    "spam": true,
    "notspam": false,
    "reject": true,
    "allow": false,
    "resend": false,
    "layout": true,
    "print": true,
    "upload": true,
    "thismail": true,
    "attachdelete": true
});
mailToolbarRuleMap.put("inbox", {
    "quick": true,
    "tag": true,
    "delete": true,
    "reply": true,
    "forward": true,
    "seen": true,
    "copy": true,
    "move": true,
    "erase": true,
    "save": true,
    "filter": true,
    "spam": true,
    "notspam": false,
    "reject": true,
    "allow": false,
    "resend": false,
    "layout": true,
    "print": true,
    "upload": false,
    "thismail": true,
    "attachdelete": true
});
mailToolbarRuleMap.put("sent", {
    "quick": true,
    "tag": true,
    "delete": true,
    "reply": true,
    "forward": true,
    "seen": true,
    "copy": true,
    "move": true,
    "erase": true,
    "save": true,
    "filter": true,
    "spam": false,
    "notspam": false,
    "reject": false,
    "allow": false,
    "resend": true,
    "layout": true,
    "print": true,
    "upload": false,
    "thismail": true,
    "attachdelete": true
});
mailToolbarRuleMap.put("drafts", {
    "quick": true,
    "tag": false,
    "delete": true,
    "reply": false,
    "forward": false,
    "seen": false,
    "copy": true,
    "move": true,
    "erase": true,
    "save": false,
    "filter": false,
    "spam": false,
    "notspam": false,
    "reject": false,
    "allow": false,
    "resend": false,
    "layout": false,
    "print": true,
    "upload": false,
    "thismail": true,
    "attachdelete": false
});
mailToolbarRuleMap.put("reserved", {
    "quick": true,
    "tag": false,
    "delete": true,
    "reply": false,
    "forward": false,
    "seen": false,
    "copy": false,
    "move": false,
    "erase": true,
    "save": true,
    "filter": false,
    "spam": false,
    "notspam": false,
    "reject": false,
    "allow": false,
    "resend": false,
    "layout": true,
    "print": true,
    "upload": false,
    "thismail": true,
    "attachdelete": false
});
mailToolbarRuleMap.put("spam", {
    "quick": true,
    "tag": true,
    "delete": true,
    "reply": true,
    "forward": true,
    "seen": true,
    "copy": true,
    "move": true,
    "erase": true,
    "save": true,
    "filter": true,
    "spam": false,
    "notspam": true,
    "reject": false,
    "allow": true,
    "resend": false,
    "layout": true,
    "print": true,
    "upload": false,
    "thismail": true,
    "attachdelete": true
});
mailToolbarRuleMap.put("trash", {
    "quick": true,
    "tag": true,
    "delete": true,
    "reply": true,
    "forward": true,
    "seen": true,
    "copy": true,
    "move": true,
    "erase": true,
    "save": true,
    "filter": true,
    "spam": false,
    "notspam": true,
    "reject": false,
    "allow": true,
    "resend": false,
    "layout": true,
    "print": true,
    "upload": false,
    "thismail": true,
    "attachdelete": true
});
mailToolbarRuleMap.put("all", {
    "quick": true,
    "tag": true,
    "delete": true,
    "reply": true,
    "forward": true,
    "seen": true,
    "copy": true,
    "move": true,
    "erase": true,
    "save": false,
    "filter": false,
    "spam": false,
    "notspam": false,
    "reject": false,
    "allow": false,
    "resend": false,
    "layout": true,
    "print": true,
    "upload": false,
    "thismail": true,
    "attachdelete": true
});
mailToolbarRuleMap.put("shared", {
    "quick": true,
    "tag": false,
    "delete": false,
    "reply": true,
    "forward": true,
    "seen": false,
    "copy": true,
    "move": false,
    "erase": false,
    "save": true,
    "filter": false,
    "spam": false,
    "notspam": false,
    "reject": false,
    "allow": false,
    "resend": false,
    "layout": true,
    "print": true,
    "upload": false,
    "thismail": true,
    "attachdelete": false
});
mailToolbarRuleMap.put("quotaviolate", {
    "quick": true,
    "tag": false,
    "delete": true,
    "reply": false,
    "forward": false,
    "seen": false,
    "copy": false,
    "move": true,
    "erase": true,
    "save": false,
    "filter": false,
    "spam": false,
    "notspam": false,
    "reject": false,
    "allow": false,
    "resend": false,
    "layout": true,
    "print": false,
    "upload": false,
    "thismail": false,
    "attachdelete": true
});

window.layoutMode = layoutMode;

var MailControl = function () {
    var _this = this;
    this.listAction = "/api/mail/message/list";
    this.readAction = "/api/mail/message/read";
    this.writeAction = "/api/mail/message/write";
    this.sendAction = "/api/mail/message/send";
    this.autoSaveAction = "/api/mail/message/autosave";
    this.mdnListAction = "/api/mail/message/mdn/list";
    this.mdnReadAction = "/api/mail/message/mdn/read";
    this.deleteMdnAction = "/api/mail/message/mdn/delete";
    this.recallMessageAction = "/api/mail/message/mdn/recall";
    this.sendMdnResponseAction = "/api/mail/message/mdn/send";
    this.previewAction = "/api/mail/message/write/preview";
    this.sourceAction = "/api/mail/message/source";
    this.downloadAttachFileAction = "/api/mail/message/attach/download";
    this.downloadAllAttachFileAction = "/api/mail/message/attach/download/all";
    this.downloadTnefAttachFileAction = "/api/mail/message/tnef/attach/download";
    this.removeAttachFileAction = "/api/mail/message/attach/delete";
    this.removeAllAttachesFromMessageAction = "/api/mail/message/attach/delete/all";
    this.relationAction = "/api/mail/message/relation";
    this.switchFlagAction = "/api/mail/message/flag";
    this.listSearchQueryAction = "/api/mail/searchquery/list";
    this.saveSearchQueryAction = "/api/mail/searchquery/create";
    this.deleteSearchQueryAction = "/api/mail/searchquery/delete";
    this.readModeOptionAction = "/api/mail/setting/basic/readmode";
    this.pageBaseOptionAction = "/api/mail/setting/basic/pagebase";
    this.autoSaveOptionAction = "/api/mail/setting/basic/autosave";
    this.searchAddressAction = "/api/mail/address/search/name";
    this.searchAddressesAction = "/api/mail/address/search/names";
    this.listBigAttachAction = "/api/mail/bigattach/list";
    this.deleteBigAttachAction = "/api/mail/bigattach/delete";
    this.listLetterAction = "/mail/mail/getLetterList.action";
    this.listDocTemplateAction = "/mail/common/listDocTemplate.action";
    this.readDocTemplateAction = "/mail/common/loadDocTemplate.action";
    this.signListAction = "/api/mail/setting/sign/list";
    this.signContentAction = "/api/mail/setting/sign/content";
    this.bigAttachUpdateAction = "/api/mail/bigattach/save";
    this.resetExtMailAction = "/api/mail/pop3/reset";
    this.downloadOrderExtMailAction = "/api/mail/pop3/download/order";
    this.downloadExtMailAction = "/api/mail/pop3/download";
    this.taggingMessageAction = "/api/mail/message/tag";
    this.deleteMessageAction = "/api/mail/message/delete";
    this.cleanMessageAction = "/api/mail/message/clean";
    this.copyMessageAction = "/api/mail/message/copy";
    this.moveMessageAction = "/api/mail/message/move";
    this.downloadMessageAction = "/api/mail/message/download";
    this.addResistRuleAction = "/api/mail/message/rule";
    this.allSelectMessageProcessAction = "/api/mail/message/all";
    this.saveMailFilterAction = "/api/mail/setting/filter";
    this.sortFilterMessageAction = "/api/mail/message/filter";
    this.registBayesianRuleAction = "/api/mail/message/bayesian";
    this.messageIntegrityAction = "/api/mail/message/integrity";
    this.readNestedAction = "/api/mail/message/nested/read";
    this.webfolderAttachSaveAction = "/api/webfolder/mail/attach/save";
    this.webfolderAttachWriteAction = "/api/webfolder/mail/attach/write";
    this.readMailUserSenderAction = "/api/mail/setting/sender/list";
    this.listSendAllowAction = "/api/mail/address/sendallow/list";
    this.checkSendAllowAction = "/api/mail/address/sendallow/check";
    this.isMailAttachSearchAction = "/api/system/mailattachsearch";
    this.lastRcptListAction = "/api/mail/setting/lastrcpt/list";
    this.listMode = "mail";
    this.listParam = {};
    this.readParam = {};
    this.writeParam = {};
    this.writeData = {};
    this.sendData = {};
    this.sharedFlag = false;
    this.currentFolder = "Inbox";
    this.loadMessageList = function (param, escapeHistory, isInit, directRead) {
        if (param) {
            this.listParam = param;
            if (param.folder && param.folder != "") {
                this.currentFolder = param.folder;
                param.folder = htmlEntityDecode(param.folder);
            }
            if (param.sharedFlag && param.sharedFlag == "shared") {
                this.sharedFlag = true;
                param.sharedFolderName = htmlEntityDecode(param.sharedFolderName);
            } else {
                this.sharedFlag = false;
            }
        } else {
            param = {};
        }
        this.listParam = param;
        param.init = isInit;
        makeProcessLoader();
        var searchType = jQuery("#searchType").val();
        if (searchType == "appSearch" || isPopup) {
            ActionLoader.postSyncGoJsonLoadAction(this.listAction, param, function (data) {
                directRead = (!directRead) ? false : directRead;
                data.directRead = directRead;
                data.toolbarSort = param.toolbarSort;
                _this.printMessageList(data);
            }, "json");
            google.sendPageView(this.listAction);
        } else {
            if (isMsie8) {
                window.top.window.location = "/app/#unified/search?stype=simple&searchTerm=all&offset=5&page=0&keyword=" + encodeURIComponent(param.keyWord);
            } else {
                window.top.window.location = "/app/unified/search?stype=simple&searchTerm=all&offset=5&page=0&keyword=" + encodeURIComponent(param.keyWord);
            }
            jQuery("#searchType").val('appSearch');
            jQuery('#mailSearchKeyWord').val('');
            escapeHistory = true;
        }

        if (!escapeHistory) historyControl.setHistory({"type": "list", "param": param});
    };
    this.initSubMessage = function () {
        if (layoutMode != "n") {
            ReadSubMessageChecker.resetUid();
            jQuery("#mailReadArea").handlebars("mail_read_default_tmpl");
        }
    };
    this.readRelationMessage = function (page, sortDir) {
        var readParam = _this.readParam;
        readParam.page = page;
        readParam.sortDir = sortDir;
        ActionLoader.postGoJsonLoadAction(this.relationAction, readParam, _this.printRelationMessage, "json");
        google.sendPageView(this.relationAction);
    };
    this.printRelationMessage = function (data) {
        if (data.total > 1) {
            data.isPopup = (CURRENT_PAGE_NAME == "popup");
            jQuery("#relationMessageWrapper").show();
            jQuery("#relationMessageCount").text((data.total - 1));
            jQuery("#relationContentWrap").handlebars("mail_read_relation_tmpl", data);
            jQuery("#relation_" + getFolderNameId(data.folderName) + "_" + data.uid).addClass("active");
        }
    };
    this.getSharedFolderParam = function (param) {
        if (this.sharedFlag) {
            param.sharedFlag = "shared";
            param.sharedUserSeq = this.listParam.sharedUserSeq;
            param.sharedFolderName = this.listParam.sharedFolderName;
        } else {
            param.sharedFlag = "user";
            param.sharedUserSeq = "0";
            param.sharedFolderName = "";
        }
        return param;
    }, this.setSharedFolderParam = function (param) {
        if (param.shared) {
            this.sharedFlag = true;
            if (this.listParam) {
                this.listParam.sharedUserSeq = param.sharedUserSeq;
                this.listParam.sharedFolderName = param.folderName;
            }
        }
    }, this.switchMessagesFlags = function (uids, folders, flagType, used, isRead) {
        var param = {};
        param = this.getSharedFolderParam(param);
        param.folderNames = folders;
        param.uids = uids;
        param.flagType = flagType;
        param.used = used;
        ActionLoader.postGoJsonLoadAction(this.switchFlagAction, param, function (data) {
            if (isRead) {
                changeFlagReadView(used, flagType);
                if (layoutMode != "n") {
                    changeFlagView(used, flagType, data);
                }
            } else {
                changeFlagView(used, flagType, data);
                if (layoutMode != "n") {
                    changeFlagReadView(used, flagType);
                }
            }
            if (isReloadReady()) {
                opener.reloadMessageList();
            }
        }, "json");
    };
    this.movePage = function (page) {
        var param = this.listParam;
        if (this.listMode == "mdnread") {
            param = this.readParam;
        }
        if (param == null) {
            param = {};
        }

        param.page = page;
        this.listParam = param;
        if (this.listMode == "mail") {
            this.loadMessageList(param);
        } else if (this.listMode == "mdnlist") {
            this.loadMdnList(param);
        } else if (this.listMode == "mdnread") {
            this.loadMdnRead(param);
        }
    };
    this.reloadMessageList = function (ignoreHistory) {
        ignoreHistory = (!ignoreHistory) ? true : false;
        if (this.listMode == "mail") {
            this.loadMessageList(this.listParam, ignoreHistory);
        } else if (this.listMode == "mdnlist") {
            this.loadMdnList(this.listParam, ignoreHistory);
        } else if (this.listMode == "mdnread") {
            this.loadMdnRead(this.readParam, ignoreHistory);
        }
    };
    this.sortMessage = function (sortBy, sortDir) {
        var param = this.listParam;
        if (param == null) {
            param = {};
        }
        param.page = 1;
        param.sortBy = sortBy;
        param.sortDir = sortDir;
        //리스트 sort시 툴바를 다시 그리지 않기 위해 옵션 추가
        param.toolbarSort = true;
        this.listParam = param;
        this.loadMessageList(param);
    };
    this.searchMessage = function (param) {
        param = this.getSharedFolderParam(param);
        this.loadMessageList(param);
    };
    this.printMessageList = function (data) {
        _this.initSubMessage();
        useSearch(true);
        if (data.init) {
            changeMailContainer("read");
        } else {
            changeMailContainer("list");
        }
        listDateStore = -1;
        currentMenu = "list";
        _this.listMode = "mail";
        currentFolderType = data.folderType;
        currentFolderName = data.folderFullName;
        currentFolderViewName = data.folderName;
        isAllFolder = (currentFolderType == "all") ? true : false;
        isBookmark = data.bookmark;
        bookmarkType = data.listType;
        bookmarkName = currentFolderViewName;
        bookmarkValue = currentFolderName;
        bookmarkSeq = data.bookmarkSeq;
        if (data.extFolder == "on") {
            bookmarkType = data.extType;
            bookmarkValue = bookmarkType;
        }
        var linkId = "";
        if (Number(bookmarkSeq) > 0) {
            linkId = "bookmark_title_" + data.bookmarkSeq;
        } else {
            if (bookmarkType == "tag") {
                linkId = "tag_link_" + data.tagId;
            } else {
                if (!isAllFolder) {
                    if (data.folderType == "shared") {
                        linkId = "shared_link_" + data.folderEncName;
                    } else {
                        linkId = "folder_link_" + data.folderEncName;
                    }
                } else {
                    if (data.extFolder == "on") {
                        linkId = "ext_folder_link_" + bookmarkType;
                    }
                }
            }
        }

        selectCurrentFolderName(linkId);
        var headerMsgData = {};
        headerMsgData.name = data.folderName;
        headerMsgData.totalCnt = data.messageCount;
        headerMsgData.unseenCnt = data.unreadMessageCount;
        headerMsgData.bookmarkType = bookmarkType;
        headerMsgData.bookmarkSeq = bookmarkSeq;
        headerMsgData.isBookmark = isBookmark;
        headerMsgData.isAllFolder = isAllFolder;
        headerMsgData.folderType = data.folderType;
        headerMsgData.extFolder = data.extFolder;
        headerMsgData.flag = data.flag;

        if (bookmarkType == "tag") {
            bookmarkValue = data.tagId;
            var tagInfo = getTagInfo(bookmarkValue);
            headerMsgData.type = "tag";
            headerMsgData.tagInfo = tagInfo;
        }
        makeMailHeaderMessege(headerMsgData);
        if (!data.toolbarSort) {
            _this.makeListToolbar(data);
        }

        _this.makeMailListContent(data);


        data.pageInfo.out = true;
        _this.makeNavigation(data);
        if (!isFirstLoad) {
            executeFolderInfo();
        }
        isFirstLoad = false;
        removeProcessLoader();
    };
    this.makeListToolbar = function (data) {
        deleteWriteToolbarClass();
        var toolbarType = mailToolbarRuleMap.get(data.folderType);
        if (isPopupView()) toolbarType.isPopup = true;
        jQuery("#toolbar_wrap").handlebars("mail_toolbar_tmpl", toolbarType);
        if (data.directRead) {
            _this.makeReadToolbar(data);
        } else if (!isPopupView() && data.pageInfo) {
            if (toolbarType.layout) {
                var naviData = {
                    "layoutMode": layoutMode,
                    "pageBase": data.pageInfo.pageSize,
                    "refreshTime": getCookie("reflash_time"),
                    "isUseRefreshTime": isUseReflashTime,
                    "isAllFolder": isAllFolder
                };
                jQuery("#mailOptionBoxWrap").handlebars("mail_list_option_tmpl", naviData);
            } else {
                var naviData = {"pageBase": data.pageInfo.pageSize};
                jQuery("#mailOptionBoxWrap").handlebars("mail_list_option_page_tmpl", naviData);
            }
        }
    };
    this.makeMailListContent = function (data) {
        var headerTmplName = "mail_list_header_tmpl";
        data.locale = LOCALE;
        data.mailExposure = MAIL_EXPOSURE;
        data.companyDomainList = companyDomainList;

        var tmplName = "mail_list_tmpl";
        if (layoutMode == "v" && data.folderType != "drafts") {
            headerTmplName = "mail_list_horizon_header_tmpl";
            tmplName = "mail_list_horizon_tmpl";
        }
        jQuery("#mail_list_content").handlebars(tmplName, data);

        this.makeMailListPreview();
    };
    this.makeMailListPreview = function () {
        jQuery("#mail_list_content span.preview").tooltipster({
            theme: ['tooltipster-noir', 'tooltipster-noir-customized'],
            delay: 500,
            position: 'bottom',
            minWidth: 400,
            maxWidth: 400,
            contentAsHTML: true,
            functionBefore: function (instance, helper) {
                var subject = jQuery(helper.origin).html();
                var content = jQuery(helper.origin).data("preview");
                var data = {"subject": subject, "content": content};
                instance.content(getHandlebarsTemplate("mail_list_content_preview", data));
            }
        });
    };
    this.closeMailListPreview = function () {
        jQuery("div.tooltipster-noir-customized").hide();
        var instances = jQuery.tooltipster.instances();
        jQuery.each(instances, function (i, instance) {
            instance.close();
        });
    };
    this.makeNavigation = function (data) {
        jQuery("#messageNaviWrap").handlebars("mail_navi_tmpl", data);
    };
    this.readMessage = function (param, escapeHistory) {
        this.readParam = clone(this.listParam);
        this.readParam.folder = param.folder;
        this.readParam.uid = param.uid;
        if (param.viewImg) {
            this.readParam.viewImg = param.viewImg;
        }
        this.readParam = this.getSharedFolderParam(this.readParam);
        ActionLoader.postSyncGoJsonLoadAction(this.readAction, this.readParam, function (data) {
            _this.printReadMessage(data);
        }, "json");
        google.sendPageView(this.readAction);
        if (!escapeHistory && !isPopupView()) historyControl.setHistory({"type": "read", "param": param});

    };
    this.reloadReadMessage = function () {
        var readParam = _this.readParam;
        _this.readMessage(readParam, true);
    };
    this.printReadMessage = function (data) {
        if (data.readResult && data.readResult == "fail") {

            jQuery.goAlert(mailMsg.mail_not_found_message, "", function () {
                if (POPUPREAD) {
                    if (isReloadReady()) {
                        opener.reloadMessageList();
                    }
                    window.close();
                } else {
                    if (layoutMode != "n") {
                        _this.reloadMessageList();
                    }
                }
            });
            return;
        }
        changeMailContainer("read");
        currentMenu = "read";
        _this.listMode = "mail";
        var isRcptHidden = ("on" == getCookie("rcpt_hidden"));
        data.isRcptHidden = isRcptHidden;
        _this.makeMailReadContent(data);
        _this.makeReadToolbar(data);
        _this.makeNDRGuide(data);
        mailReadInit(data);
        executeFolderInfo();
        if (POPUPREAD) {
            document.title = data.msgContent.subject + " - " + document.title;
            POPUPREAD = false;
        }
        var readParam = _this.readParam;
        if (readParam) {
            readParam.page = data.page;
            _this.readParam = readParam;
        }
        var listParam = _this.listParam;
        if (listParam) {
            listParam.page = data.page;
            _this.listParam = listParam;
        }
    };
    this.makeNDRGuide = function (data) {
        var subject = data.msgContent.subject;
        if (subject.indexOf("[NDR]") == 0) {
            jQuery("#ndrGuide").show().handlebars("mail_ndr_guide_tmpl");
        }
    };
    this.makeMailReadContent = function (data) {
        data.useWebfolder = USE_WEBFOLDER;
        data.useContact = USE_CONTACT && MAIL_EXPOSURE;
        data.useCalendar = USE_CALENDAR;
        data.mailExposure = MAIL_EXPOSURE;

        data.msgContent.htmlContent = _this.convertMSWordTag(data.msgContent.htmlContent);
        data.msgContent.htmlContent = _this.convertIcalTemplate(data.msgContent.icalList) + data.msgContent.htmlContent;
        if (layoutMode == 'n') {
            jQuery("#mailListAllCheck").hide();
        }
        jQuery("#mailReadArea").handlebars("mail_read_tmpl", data);
        this.hideLabel("mailReadArea");
    };
    this.convertIcalTemplate = function (icalList) {
        if (!icalList || icalList.length == 0) {
            return "";
        }
        for (var i = 0; i < icalList.length; i++) {
            var icalRecurrence = icalList[i].icalRecurrence;
            icalList[i].icalRecurrenceMsg = "";
            if (icalRecurrence != "" && icalRecurrence != null) {
                icalList[i].icalRecurrenceMsg = recurrenceParser(icalList[i].icalRecurrence);
                icalList[i].icalStartDate = "";
            }

            var icalSubject = jQuery.trim(icalList[i].icalSubject);
            if (icalSubject == "" || icalSubject == null) {
                icalList[i].icalSubject = mailMsg.header_nosubject;
            }
        }
        return getHandlebarsTemplate("mail_icalendar_tmpl", icalList);
    };

    this.hideLabel = function (context) {
        var hideLabel = {
            to: [], cc: []
        };
        jQuery.each(["to", "cc"], function (index, type) {
            var label = jQuery("#" + context).find("li[data-type=" + type + "]");
            if (label.length > 20) {
                hideLabel[type] = jQuery("#" + context).find("li[data-type=" + type + "]:gt(19)");
                hideLabel[type].attr("data-more", "").hide();
                var button = ['<li evt-rol="moreLabel" data-type="' + type + '" class="add">', '<span class="name">', '<span data-label>', mailMsg.mail_more, '</span>', '<span class="ic ic_arrow_down" title="' + mailMsg.mail_more + '"></span>', '</span>', '</li>'];
                label.parent("ul").append(button.join(""));
            }
        });
        jQuery("#" + context + " li[evt-rol='moreLabel']").on("click", function (e) {
            var target = jQuery(e.currentTarget);
            var type = target.attr("data-type");
            var isShow = hideLabel[type].is(":visible");
            var labelText = isShow ? mailMsg.mail_more : mailMsg.mail_fold;
            target.find("span[data-label]").text(labelText);
            target.find("span.ic").toggleClass("ic_arrow_down").toggleClass("ic_arrow_up");
            hideLabel[type].toggle(!isShow);
        });
    };

    this.convertMSWordTag = function (content) {
        if (isMsie9 || isMsie8 || isMsie7) {
            if (content == null) {
                return content;
            }
            var tcontent = '' + content;
            tcontent = tcontent.replace(/&lt;!--\[[^-->]*\]--&gt;/gi, '');
            tcontent = tcontent.replace(/<!--\[[^-->]*\]-->/gi, '');
            tcontent = tcontent.replace(/(xmlns=")[\\s\\S]*[^"]*/gi, '');
            return tcontent;
        }
        return content;
    };

    this.removeSignAnnotation = function (content) {
        if (content == null) {
            return '';
        }
        var tcontent = '' + content;
        tcontent = tcontent.replace(/&lt;!--sign Area start--&gt;/gi, '');
        tcontent = tcontent.replace(/<!--sign Area start-->/gi, '');
        tcontent = tcontent.replace(/&lt;!--sign Area end--&gt;/gi, '');
        tcontent = tcontent.replace(/<!--sign Area end-->/gi, '');
        return tcontent;
    };

    this.makeReadToolbar = function (data) {
        deleteWriteToolbarClass();
        if (isPopupView()) data.isPopup = true;
        if (currentMenu == "read" && layoutMode == "n") {
            jQuery("#mailOptionBoxWrap").handlebars("mail_read_optionbox_tmpl", data);
        }
    };
    this.downloadMessages = function (param) {
        jQuery("#reqFrame").attr("src", this.downloadMessageAction + "?" + jQuery.param(param));
    };
    this.downloadAttachFile = function (param) {
        if (TABLET || MOBILE) {
            var host = window.location.protocol + "//" + window.location.host;
            url = this.downloadAttachFileAction + "?" + jQuery.param(param);
            window.location = host + url;
        } else {
            jQuery("#reqFrame").attr("src", this.downloadAttachFileAction + "?" + jQuery.param(param));
        }
    };
    this.downloadTnefAttachFile = function (param) {
        jQuery("#reqFrame").attr("src", this.downloadTnefAttachFileAction + "?" + jQuery.param(param));
    };
    this.downloadAllAttachFile = function (param) {
        makeProcessLoader();
        ActionLoader.postGoJsonLoadAction(this.downloadAllAttachFileAction, param, function (data) {
            var downloadParam = {"downloadFileName": data.downloadFileName, "zipFileName": data.zipFileName}
            jQuery("#reqFrame").attr("src", _this.downloadAllAttachFileAction + "?" + jQuery.param(downloadParam));
            removeProcessLoader();
        });
    };
    this.removeAttachFile = function (param) {
        ActionLoader.postGoLoadAction(this.removeAttachFileAction, param, function (data) {
            _this.readParam.uid = data;
            if (layoutMode != "n") {
                _this.reloadMessageList();
            }
            _this.readMessage(_this.readParam, true);
            if (isReloadReady()) {
                opener.reloadMessageList();
            }
            removeProcessLoader();
        }, "json");
    };
    this.removeAllAttachesFromMessage = function (param) {
        ActionLoader.postGoJsonLoadAction(this.removeAllAttachesFromMessageAction, param, function (data) {
            jQuery.goSlideMessage(mailMsg.mail_complete_delete_mail, "caution");

            if ((layoutMode != "n" && currentMenu == "read") || currentMenu != "read") {
                _this.reloadMessageList();
            }

            if (layoutMode != "n" || currentMenu == "read") {
                if (data > 0) {
                    _this.readParam.uid = data;
                    _this.readMessage(_this.readParam, true);
                } else {
                    _this.initSubMessage();
                }
            }
            if (isReloadReady()) {
                opener.reloadMessageList();
            }
            removeProcessLoader();
        }, "json");
    };
    this.readNestedMessage = function (param) {
        ActionLoader.postGoJsonLoadAction(this.readNestedAction, param, function (data) {
            data.useWebfolder = USE_WEBFOLDER;
            data.msgContent.htmlContent = _this.convertMSWordTag(data.msgContent.htmlContent);
            data.msgContent.htmlContent = _this.convertIcalTemplate(data.msgContent.icalList) + data.msgContent.htmlContent;
            data.folderName = param.folderName;
            data.uid = param.uid;
            data.orgPart = param.part;
            data.nestedPart = (param.nestedPart) ? param.nestedPart : ((param.part) ? param.part : "");
            jQuery("#popupBodyWrap").handlebars("mail_nested_read_tmpl", data);
        }, "json");
        google.sendPageView(this.readNestedAction);
    };
    this.writeMessage = function (param, escapeHistory) {
        this.writeParam = param;
        makeProcessLoader();
        ActionLoader.postGoJsonLoadAction(this.writeAction, param, function (data) {
            //메일쓰기 페이지의 default태그를 넣기위해 editor.config.json을 호출한다.
            jQuery.getJSON("/resources/js/conf/editor/editor.config.json", function (editorConfig) {
                LOCAL_DOMAIN = data.localDomain ? data.localDomain : "";

                if (TABLET) {
                    data.editorMode = "text";
                }
                changeMailContainer("write");
                currentMenu = "write";
                data.isPopupWrite = isPopupWrite;
                notiMode = data.notiMode;
                _this.writeData = data;
                _this.setSharedFolderParam(data);
                _this.convertSendData(data);
                _this.convertInitSendData(data);
                _this.makeMailWriteToolbar(data);
                _this.makeMailWriteContent(data, editorConfig);
                mailWriteInit(data);
                if (TABLET) {
                    jQuery("#writeChangeEditorWrap").hide();
                }
                isMaxSendMailCountUse = data.sendMailCount.maxSendMailCountUse;
                maxSendMailCount = data.sendMailCount.maxSendMailCount;

                removeProcessLoader();
                if (!data.isPopupWrite) {
                    _this.initWritePageScroll();
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.warn('editor.config.json파일이 없습니다.');
            });
        }, "json");
        google.sendPageView(this.writeAction);
        if (!escapeHistory) historyControl.setHistory({"type": "empty"});
    };
    this.initWritePageScroll = function () {

        var wHeight = jQuery(window).height(), fixedHeader = jQuery("#mailHeaderWrap").outerHeight(),
            toolbar = jQuery("#write_toolbar_wrap").outerHeight();

        var writeArea = wHeight - fixedHeader - toolbar - 10;
        jQuery("#mailWriteArea").css({
            "overflow-y": "auto", "height": writeArea + "px"
        });
    };
    this.reloadWriteMessage = function () {
        this.writeMessage(this.writeParam, true);
    };
    this.convertSendData = function (data) {
        this.sendData = {};
        this.sendData.senderEmail = data.senderEmail;
        this.sendData.senderName = data.senderName;
        this.sendData.sendType = data.writeType;
        this.sendData.sendFlag = data.sendFlag;
        this.sendData.charset = data.encoding;
        this.sendData.folderName = data.folderName;
        this.sendData.uids = data.uids;
        this.sendData.orgMessageId = data.orgMsgId;
        this.sendData.draftMessageId = data.draftMsgId;
        if (data.defaultSignSeq && data.defaultSignSeq > 0) {
            this.sendData.attachsign = data.signAttach;
            this.sendData.signSeq = data.defaultSignSeq;
        }
        this.sendData.signLocation = data.signLocation;
        this.sendData.bannerDisplay = data.bannerDisplay;
        this.sendData.bannerContent = data.bannerContent;
    };
    this.convertInitSendData = function (data) {
        this.initSendData = {};
        this.initSendData.senderEmail = data.senderEmail;
        this.initSendData.senderName = data.senderName;
        this.initSendData.sendType = data.writeType;
        this.initSendData.sendFlag = data.sendFlag;
        this.initSendData.charset = data.encoding;
        this.initSendData.folderName = data.folderName;
        this.initSendData.uids = data.uids;
        this.sendData.orgMessageId = data.orgMsgId;
        this.initSendData.draftMessageId = data.draftMsgId;
        if (data.defaultSignSeq && data.defaultSignSeq > 0) {
            this.initSendData.attachsign = data.signAttach;
            this.initSendData.signSeq = data.defaultSignSeq;
        }
        this.initSendData.signLocation = data.signLocation;
        this.initSendData.bannerDisplay = data.bannerDisplay;
        this.initSendData.bannerContent = data.bannerContent;
    };
    this.getWriteData = function () {
        return this.writeData;
    };
    this.getSendData = function () {
        return this.sendData;
    };
    this.setSendData = function (sendData) {
        this.sendData = sendData;
    };

    this.getInitSendData = function () {
        return this.initSendData;
    };

    this.makeMailWriteContent = function (data, editorJsonConfig) {
        var mailWritePrefixHtml = editorJsonConfig.config.mailWritePrefixHtml;
        var editorConfig = BASECONFIG.data.editorConfig;
        var defaultEditor = 'SmartEditor'; // SmartEditor / ActiveDesigner / Dext5Editor
        var curEditorName = editorConfig && editorConfig.editorName ? editorConfig.editorName : defaultEditor;
        var editorName = !GO.Editor.isIE() && GO.Editor.isActiveXType(curEditorName) ? defaultEditor : curEditorName;

        //editor.config.json 파일의 메일쓰기시 디폴트 html(답장,전달,서명 사용할 경우만 적용됨)
        if (!mailWritePrefixHtml) {
            // editor.config.json파일은 커스텀 파일이기 때문에 기존 커스텀된 사이트일 경우 업그레이드 머지시 추가된 기능이 누락될 수 있음.
            console.warn("(daou office) editor.config.json 파일을 최신으로 적용해주세요.");
            mailWritePrefixHtml = {
                activeDesigner: "<P>&nbsp;</P><P>&nbsp;</P>",
                dext5: "<P>&nbsp;</P><P>&nbsp;</P>",
                smartEditor: "<br><p><br></p><p><br></p><br>"
            };
        }

        var activeDesignerHtml = mailWritePrefixHtml.activeDesigner;
        var Dext5EditorHtml = mailWritePrefixHtml.dext5;
        var smartEditorHtml = mailWritePrefixHtml.smartEditor;
        var prefixHtml = "";
        var editorCases = {
            ActiveDesigner: function () {
                prefixHtml = activeDesignerHtml;
            }, Dext5Editor: function () {
                prefixHtml = Dext5EditorHtml;
            }, SmartEditor: function () {
                prefixHtml = smartEditorHtml;
            }
        }
        editorCases[curEditorName]();

        var htmlPart = "";
        var textPart = "";
        var htmlContent = _this.removeSignAnnotation(data.htmlContent);
        var textContent = _this.removeSignAnnotation(data.textContent);

        if (data.sendFlag == "forwardAttached") {
            data.signLocation = "outside";
            htmlContent = "<div style='font-weight:bold;text-align:center'>" + mailMsg.mail_forwardmessage + "</div><br><br>";
            textContent = "* " + mailMsg.mail_forwardmessage;
        }

        if (data.signAttach && (data.writeType != "drafts" && data.writeType != "rewrite")) {
            if (data.signLocation == "inside") {
                htmlPart = "<span>&nbsp;</span><!--sign Area start-->" + data.signContent + "<!--sign Area end-->" + htmlContent;
                textPart = "\n\n" + data.textSignContent + textContent;
            } else {
                htmlPart = htmlContent + "<span>&nbsp;</span><!--sign Area start-->" + data.signContent + "<!--sign Area end-->";
                textPart = textContent + "\n\n" + data.textSignContent;
            }
        } else {
            htmlPart = htmlContent;
            textPart = textContent;
        }

        //서명을 사용하지 않고 일반메일 작성시 혹은 임시보관함에서 작성시에는 앞에 prefixhtml을 사용하지 않음.
        //(답장,전달 혹은 서명을 사용하면 정의된 prefixHtml을 사용함.)

        //!data.signAttach && data.sendFlag == "normal"             : 일반메일 임시저장
        //data.folderName == "Drafts"					            : 답장메일을 임시저장
        //data.sendFlag == "draftForwardAttached" 		            : 원문 첨부 전달을 임시저장
        //data.sendFlag == "forward" && data.writeType == "drafts"  : 원문 포함 전달을 임시저장

        if (!data.signAttach && data.sendFlag == "normal" || data.folderName == "Drafts" || data.sendFlag == "draftForwardAttached" || (data.sendFlag == "forward" && data.writeType == "drafts") || data.writeType == "rewrite") {
            prefixHtml = "";
        }

        data.htmlContent = prefixHtml + _this.convertMSWordTag(htmlPart);
        data.textContent = _this.convertMSWordTag(textPart);
        EDITOR_TYPE = editorName;
        data.useContact = USE_CONTACT;
        data.useWebfolder = USE_WEBFOLDER;
        jQuery("#mailWriteArea").handlebars("mail_write_tmpl", data);
    };
    this.makeMailWriteToolbar = function (data) {
        jQuery("div[data-tag=write_toolbar_wrap]").handlebars("mail_write_toolbar_tmpl", data);
        addWriteToolbarClass();
    };
    this.sendMessage = function (param) {
        if (param.sendType != "draft") {
            makeProcessLoader();
            google.sendPageView(this.sendAction);
        }
        param = this.getSharedFolderParam(param);

        ActionLoader.postGoJsonLoadAction(this.sendAction, param, function (data) {
            if (param.sendType == "draft") {
                if (!data.sendError) {
                    var sendData = mailControl.getSendData();
                    sendData.draftMessageId = data.messageId;
                    jQuery.goSlideMessage(mailMsg.mail_drafts_success);
                }
                isAutoSave = false;
            } else {
                _this.sendMessageResult(data);
                removeProcessLoader();
                executeFolderInfo();
                destroyBasicUploadControl();
                destroyMassUploadControl();
                destoryEditorControl();
            }
            isSendWork = false;
        }, "json");
    };
    this.autoSaveMessage = function (param) {
        param = this.getSharedFolderParam(param);
        ActionLoader.postGoJsonLoadAction(this.autoSaveAction, param, function (data) {
            resultAutoSave(data);
        }, "json");
    };
    this.sendMessageResult = function (data) {
        currentMenu = "send";
        data.pageMode = CURRENT_PAGE_NAME;
        data.useContact = USE_CONTACT && MAIL_EXPOSURE;
        data.mailExposure = MAIL_EXPOSURE;

        jQuery("#mailSendArea").handlebars("mail_send_tmpl", data);
        jQuery("#toolbar_wrap").empty();
        jQuery("div[data-tag=write_toolbar_wrap]").empty();
        changeMailContainer("send");
    };
    this.loadMdnList = function (param, escapeHistory) {
        param = (!param) ? {} : param;
        this.listParam = param;

        ActionLoader.postGoLoadAction(this.mdnListAction, param, _this.printMdnList, "json");
        google.sendPageView(this.mdnListAction);
        if (!escapeHistory) historyControl.setHistory({"type": "mdnlist", "param": param});
    };
    this.printMdnList = function (data) {
        _this.listMode = "mdnlist";
        currentMenu = "list";
        changeMailContainer("list");
        useSearch(false);
        var headerMsgData = {"type": "mdn", "name": mailMsg.menu_receivenoti};
        makeMailHeaderMessege(headerMsgData);
        data.pageInfo.out = true;
        _this.makeMdnListToolbar(data);
        _this.makeMdnListContent(data);
        _this.makeNavigation(data);
        removeProcessLoader();
    };
    this.makeMdnListToolbar = function (data) {
        deleteWriteToolbarClass();
        jQuery("#toolbar_wrap").handlebars("mail_mdn_list_toolbar_tmpl", data);
    };
    this.makeMdnListContent = function (data) {
        data.mailExposure = MAIL_EXPOSURE;
        jQuery("#mail_list_content").handlebars("mail_mdn_list_tmpl", data);
    };
    this.loadMdnRead = function (param, escapeHistory) {
        this.readParam = param;
        ActionLoader.postGoLoadAction(this.mdnReadAction, param, _this.printMdnRead, "json");
        google.sendPageView(this.mdnReadAction);
        if (!escapeHistory) historyControl.setHistory({"type": "mdnread", "param": this.readParam});
    };
    this.printMdnRead = function (data) {
        _this.listMode = "mdnread";
        currentMenu = "list";

        changeMailContainer("list");
        var headerMsgData = {"type": "mdn", "name": mailMsg.menu_receivenoti};
        makeMailHeaderMessege(headerMsgData);
        data.subject = _this.readParam.subject;
        data.dateUtc = _this.readParam.dateUtc;
        data.pageInfo.out = true;
        _this.makeMdnReadToolbar(data);
        _this.makeMdnReadContent(data);
        _this.makeNavigation(data);
        removeProcessLoader();
    };
    this.makeMdnReadToolbar = function (data) {
        deleteWriteToolbarClass();
        jQuery("#toolbar_wrap").handlebars("mail_mdn_read_toolbar_tmpl", data);
    };
    this.makeMdnReadContent = function (data) {
        data.mailExposure = MAIL_EXPOSURE;
        data.companyDomainList = companyDomainList;

        jQuery("#mail_list_content").handlebars("mail_mdn_read_tmpl", data);
    };
    this.deleteMdn = function (param) {
        makeProcessLoader();
        ActionLoader.postGoLoadAction(this.deleteMdnAction, param, function (data) {
            removeProcessLoader();
            jQuery.goSlideMessage(mailMsg.mail_complete_delete_mail, "caution");
            _this.reloadMessageList();
        }, "json");
    };
    this.recallMessage = function (param) {
        ActionLoader.postGoLoadAction(this.recallMessageAction, param, function (data) {
            _this.processRecallResult(data);
        }, "json");
    };
    this.processRecallResult = function (data) {
        if ((data.ignoreEmailList && data.ignoreEmailList.length > 0) || (data.failEmailList && data.failEmailList.length > 0) || (data.externalEmailList && data.externalEmailList.length > 0)) {
            jQuery.goPopup({
                id: 'recallFailAddressPopup',
                pclass: 'layer_normal layer_confim',
                width: 500,
                header: mailMsg.mail_mdn_message_recall_004,
                contents: getHandlebarsTemplate("mail_mdn_recall_fail_tmpl", data),
                closeCallback: function () {
                    _this.reloadMessageList();
                },
                buttons: [{btype: 'close', autoclose: true, btext: mailMsg.comn_close}]
            });
        } else {
            jQuery.goMessage(mailMsg.mail_mdn_message_recall_008);
            _this.reloadMessageList();
        }
    }
    this.sendMdnResponse = function (param) {
        ActionLoader.postGoJsonLoadAction(this.sendMdnResponseAction, param, function (data) {
            jQuery.goMessage(mailMsg.mail_send_success);
        }, "json");
    };
    this.getSearchQueryList = function () {
        ocxUploadVisible(false);
        ActionLoader.getGoLoadAction(this.listSearchQueryAction, null, function (data) {
            var tmplData = {};
            tmplData.searchAllFolder = searchAllFolder;
            tmplData.folderList = folderControl.getUserFolderList();
            tmplData.queryList = data;
            jQuery("#detailSearchLayerWrap").handlebars("mail_detail_search_tmpl", tmplData);
            jQuery("#adStartDate").datepicker({
                dateFormat: "yy-mm-dd", changeMonth: true, changeYear: true, yearSuffix: ""
            });
            jQuery("#adEndDate").datepicker({
                dateFormat: "yy-mm-dd", changeMonth: true, changeYear: true, yearSuffix: ""
            });
            var isMailAttachSearch = _this.isMailAttachSearch();
            if (isMailAttachSearch) {
                jQuery('#adAttachContentSearch').show();
            }
            jQuery("#detailSearchLayerWrap").show();
            jQuery(document).trigger("showLayer.goLayer");
        }, "json");
    };

    this.getUnifiedSearchFolderList = function () {
        jQuery("#detailSearchLayerWrap").handlebars("mail_unified_detail_search_tmpl", {});
        jQuery("#fromDate").datepicker({
            dateFormat: "yy-mm-dd", changeMonth: true, changeYear: true, yearSuffix: ""
        });
        jQuery("#toDate").datepicker({
            dateFormat: "yy-mm-dd", changeMonth: true, changeYear: true, yearSuffix: ""
        });
        ocxUploadVisible(false);
        jQuery("#detailSearchLayerWrap").show();
    };
    this.saveSearchQuery = function (param) {
        jQuery.ajax({
            url: this.saveSearchQueryAction, dataType: "json", type: "POST", data: param, success: function () {
                _this.getSearchQueryList();
            }, error: function (xhr) {
                var respObj = JSON.parse(xhr.responseText);
                xhr.ignoreProcessLoader = true;
                if (respObj.code != "401") {
                    jQuery.goSlideMessage(respObj.message, "caution");
                }
            }
        });
    };
    this.deleteSearchQuery = function (param) {
        ActionLoader.postGoLoadAction(this.deleteSearchQueryAction, param, function (data) {
            _this.getSearchQueryList();
        }, "json");
    };
    this.updateReadModeOption = function (param) {
        ActionLoader.postGoLoadAction(this.readModeOptionAction, param, function (data) {
            contentSplitterChange(param.readMode);
        }, "json");
    };
    this.updatePageBaseOption = function (param) {
        ActionLoader.postGoLoadAction(this.pageBaseOptionAction, param, function (data) {
            _this.reloadMessageList();
        }, "json");
    };
    this.listBigAttachFile = function (func) {
        ActionLoader.postGoLoadAction(this.listBigAttachAction, null, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.deleteBigAttach = function (param, func, errorFunc) {
        ActionLoader.postGoLoadAction(this.deleteBigAttachAction, param, function (data) {
            if (func) func(data);
        }, "json", function (result) {
            if (errorFunc) errorFunc(result);
        });
    };
    this.getLetterList = function (param, func) {
        ActionLoader.postLoadAction(this.listLetterAction, param, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.getDocTemplateList = function (param, func) {
        ActionLoader.postLoadAction(this.listDocTemplateAction, param, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.getTemplateContent = function (param, func) {
        ActionLoader.postLoadAction(this.readDocTemplateAction, param, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.updateAutoSaveInfo = function (term, func) {
        var param = {"term": term};
        ActionLoader.postGoLoadAction(this.autoSaveOptionAction, param, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.getSignList = function (func) {
        ActionLoader.getGoLoadAction(this.signListAction, null, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.signContent = function (param, func) {
        ActionLoader.postGoLoadAction(this.signContentAction, param, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.getLastRcptList = function () {
        ActionLoader.getGoLoadAction(this.lastRcptListAction, null, function (data) {
            var rcptListId = (isRcptModeNormal) ? "#toRcptList,#ccRcptList,#bccRcptList" : "#rcptList";
            jQuery(rcptListId).append(getHandlebarsTemplate("mail_write_last_rcpt_tmpl", data));
        }, "json");
    };
    this.mailPreview = function (param) {
        ActionLoader.postGoJsonLoadAction(this.previewAction, param, function (data) {
            jQuery("#popupBodyWrap").handlebars("mail_preview_tmpl", data);
        }, "json");
    };
    this.mailPrint = function (param) {
        ActionLoader.postSyncGoJsonLoadAction(this.readAction, param, function (data) {
            data.msgContent.htmlContent = _this.convertMSWordTag(data.msgContent.htmlContent);
            data.msgContent.htmlContent = _this.convertIcalTemplate(data.msgContent.icalList) + data.msgContent.htmlContent;

            jQuery("#popupBodyWrap").handlebars("mail_print_tmpl", data);
            //if(isMsie8) {
            jQuery("#mailViewArea").find("img").load(function () {
                if (jQuery(this).width() > 800) {
                    jQuery(this).attr({"width": "100%"});
                }
            });
            //}
            _this.hideLabel("popupBodyWrap");
        }, "json");
    };
    this.mailPreviewPrint = function (param) {
        ActionLoader.postGoJsonLoadAction(this.previewAction, param, function (data) {
            jQuery("#popupBodyWrap").handlebars("mail_preview_print_tmpl", data);
            _this.hideLabel("popupBodyWrap");
            //if(isMsie8) {
            jQuery("#mailViewArea").find("img").load(function () {
                if (jQuery(this).width() > 800) {
                    jQuery(this).attr({"width": "100%"});
                }
            });
            //}
        }, "json");
    };
    this.mailReadPopup = function (param) {
        ActionLoader.postSyncGoJsonLoadAction(this.readAction, param, function (data) {
            jQuery("#mailReadArea").handlebars("mail_read_tmpl", data);
            _this.hideLabel("mailReadArea");
        }, "json");
    };
    this.mailSource = function (param) {
        jQuery("#sourceFrame").attr("src", this.sourceAction + "?" + jQuery.param(param));
    };
    this.bigAttachUpdate = function (param, sendParam) {
        makeProcessLoader();
        ActionLoader.postGoLoadAction(this.bigAttachUpdateAction, param, function (data) {
            sendForBigAttach(data, sendParam);
            removeProcessLoader();
        }, "json");
    };
    this.loadExtMail = function (func) {
        ActionLoader.getGoLoadAction(this.downloadExtMailAction, null, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.downloadOrderExtMail = function (param) {
        ActionLoader.postGoLoadAction(this.downloadOrderExtMailAction, param, function (data) {
            runCheckPop3Status();
            _this.downloadExtMail();
        }, "json");
    };
    this.downloadExtMail = function () {
        ActionLoader.postGoLoadAction(this.downloadExtMailAction, {}, function (data) {
        }, "json");
    };
    this.resetExtMail = function (param) {
        ActionLoader.postGoLoadAction(this.resetExtMailAction, param, function (data) {
            runCheckPop3Status();
        }, "json");
    };
    this.makeToolbarTagList = function (data) {
        jQuery("#toolbar_tag_list").handlebars("mail_tag_toolbar_tmpl", data);
    };
    this.deleteMessages = function (param) {
        makeProcessLoader();
        ActionLoader.postGoJsonLoadAction(this.deleteMessageAction, param, function (data) {
            removeProcessLoader();
            jQuery.goSlideMessage(mailMsg.mail_complete_delete_mail, "caution");
            if (isPopupView()) {
                if (isReloadReady()) {
                    opener.reloadMessageList();
                }
                window.close();
            } else {
                _this.reloadMessageList(true);
            }
        }, "json");
    };
    this.cleanMessages = function (param) {
        makeProcessLoader();
        ActionLoader.postGoJsonLoadAction(this.cleanMessageAction, param, function (data) {
            removeProcessLoader();
            jQuery.goSlideMessage(mailMsg.mail_complete_delete_mail, "caution");
            if (isPopupView()) {
                if (isReloadReady()) {
                    opener.reloadMessageList();
                }
                window.close();
            } else {
                _this.reloadMessageList();
            }
        }, "json");
    };
    this.copyMessage = function (param) {
        param = this.getSharedFolderParam(param);
        ActionLoader.postGoJsonLoadAction(this.copyMessageAction, param, function (data) {
            if (isReloadReady()) {
                opener.reloadMessageList();
            } else {
                _this.reloadMessageList();
            }
        }, "json", function (data) {
            jQuery.goSlideMessage(data.message, "caution");
        });
    };
    this.moveMessage = function (param) {
        ActionLoader.postGoJsonLoadAction(this.moveMessageAction, param, function (data) {
            if (isPopupView()) {
                if (isReloadReady()) {
                    opener.reloadMessageList();
                }
                window.close();
            } else {
                _this.reloadMessageList(true);
            }
        }, "json", function (data) {
            jQuery.goSlideMessage(data.message, "caution");
        });
    };
    this.addResistRule = function (param, func) {
        ActionLoader.postGoJsonLoadAction(this.addResistRuleAction, param, function (data) {
            if (func) func(param.ruleType);
        }, "json");
    };
    this.searchAddressByKeyowrd = function (param, func) {
        ActionLoader.postGoLoadAction(this.searchAddressesAction, param, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.allSelectMessageProcess = function (param) {
        makeProcessLoader();
        ActionLoader.postGoJsonLoadAction(this.allSelectMessageProcessAction, param, function (data) {
            removeProcessLoader();
            if (param.actionType == "delete" || param.actionType == "clean") {
                jQuery.goSlideMessage(mailMsg.mail_complete_delete_mail, "caution");
            }
            _this.reloadMessageList();
        }, "json", function () {
            jQuery.goAlert(mailMsg.allselect_action_error);
        });
    };
    this.saveMailFilter = function (param) {
        ActionLoader.postGoJsonLoadAction(this.saveMailFilterAction, param, function (data) {
            saveMessageFilterResult(param, data);
        }, "json", function (data) {
            if (data.name == "DuplicatedException") {
                jQuery.goMessage(mailMsg.conf_filter_exist);
            } else {
                jQuery.goMessage(mailMsg.save_fail);
            }
        });
    };
    this.sortFilterMessage = function (param) {
        ActionLoader.postGoJsonLoadAction(this.sortFilterMessageAction, param, function (data) {
            removeProcessLoader();
            if (isPopupView()) {
                if (isReloadReady()) {
                    opener.reloadMessageList();
                }
                window.close();
            } else {
                _this.reloadMessageList();
            }
        }, "json");
    };
    this.saveMemberAddress = function (param) {
        var data = JSON.stringify(param);
        jQuery.ajax({
            url: "/api/contact/personal/contact",
            type: 'post',
            contentType: 'application/json',
            dataType: 'json',
            data: data
        }).done(function (rs) {
            if (rs.code == "200" && rs.message == "OK") {
                jQuery.goAlert(mailMsg.alert_addr_add);
            }
        });

    };
    this.registBayesianRule = function (param) {
        ActionLoader.postGoLoadAction(this.registBayesianRuleAction, param, function (data) {
            jQuery.goMessage(mailMsg.bayesian_submitmsg);
            _this.reloadReadMessage();
        }, "json", function () {
            jQuery.goMessage(mailMsg.bayesian_submitmsg_error);
        });
    };
    this.messageIntegrity = function (param, func) {
        ActionLoader.postGoLoadAction(this.messageIntegrityAction, param, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.getListParam = function () {
        return this.listParam;
    };
    this.setListParam = function (listParam) {
        this.listParam = listParam;
        if (listParam.sharedFlag && listParam.sharedFlag == "shared") {
            this.sharedFlag = true;
        }
    };
    this.webfolderAttachSave = function (param, func) {
        ActionLoader.postGoJsonLoadAction(this.webfolderAttachSaveAction, param, function (data) {
            jQuery.goAlert(mailMsg.mail_attach_webfolder_save, mailMsg.mail_attach_webfolder_save_ok);
        }, "json", function (data) {
            var errMsg = mailMsg.mail_attach_webfolder_save_fail;
            if (data.message) {
                errMsg = data.message;
            }
            jQuery.goAlert(mailMsg.mail_attach_webfolder_save, errMsg);
        });
    };
    this.webfolderWriteAttach = function (param, func) {
        ActionLoader.postGoJsonLoadAction(this.webfolderAttachWriteAction, param, function (data) {
            if (func) func(data);
        }, "json", function () {
            jQuery.goAlert(mailMsg.alert_attachFile);
        });
    };
    this.readMailUserSender = function (func) {
        ActionLoader.getGoLoadAction(this.readMailUserSenderAction, null, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.listSendAllow = function (func) {
        ActionLoader.getGoLoadAction(this.listSendAllowAction, null, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.checkSendAllow = function (param, func) {
        ActionLoader.postSyncGoLoadAction(this.checkSendAllowAction, param, function (data) {
            if (func) func(data);
        }, "json");
    };

    this.isMailAttachSearch = function () {
        var attachSearch = false;
        ActionLoader.getSyncGoLoadAction(this.isMailAttachSearchAction, null, function (data) {
            attachSearch = data;
        }, "json");
        return attachSearch;
    };

    this.makeMailEvent = function () {
        var mailEventOption = {
            everyPreFunc: function () {
                closeMailFolderOptionLayer();
            }
        };
        var mailEvent = new EventControl("#mainContentWrap", "click", "a,span,ins,li,p,tr,td", mailEventOption);
        mailEvent.add("switch-flag", function (target) {
            var flag = jQuery(target).attr("flag");
            var flaged = ("on" == jQuery(target).attr("flaged"));
            var mid = jQuery(target).closest("tr").attr("id");
            switchFlagFlaged([mid], flag, !flaged);
        });
        mailEvent.add("switch-flag-read", function (target) {
            var flag = jQuery(target).attr("flag");
            var flaged = ("on" == jQuery(target).attr("flaged"));
            var folderName = jQuery("#folderName").val();
            var uid = jQuery("#msgUid").val();
            _this.switchMessagesFlags([uid], [folderName], flag, !flaged, true);
        });
        mailEvent.add("toolbar", function (target) {
            _this.executeToolbarAction(target);
        });
        mailEvent.add("check-reserved", function (target) {
            var param = _this.getSendData();
            var useSecureMail = (param.secureMail);
            if (useSecureMail) {
                jQuery.goAlert(mailMsg.mail_setting_error, mailMsg.write_alert004);
                return;
            }
            openReservedLayerPopup();
            jQuery(document).trigger("showLayer.goLayer");
        });
        mailEvent.add("check-securemail", function (target) {
            var param = _this.getSendData();
            var useReservation = (param.reserveMail);
            if (useReservation) {
                jQuery.goAlert(mailMsg.mail_setting_error, mailMsg.write_alert004);
                return;
            }
            openSecureMailLayerPopup();
            jQuery(document).trigger("showLayer.goLayer");
        });
        mailEvent.add("list-sort", function (target) {
            var $target = jQuery(target);
            var sortBy = $target.attr("by");
            var sortDir = ($target.hasClass("sorting_desc")) ? "asce" : "desc";

            jQuery("#toolbar_sort_flag li").removeClass("sorting_desc sorting_asce");
            jQuery("#toolbar_sort_flag span.sort").removeClass("ic_toolbar sort_up sort_down");
            if (sortDir == "asce") {
                $target.addClass("sorting_asce");
                $target.find("span.sort").addClass("ic_toolbar sort_up");
            } else {
                $target.addClass("sorting_desc");
                $target.find("span.sort").addClass("ic_toolbar sort_down");
            }
            _this.sortMessage(sortBy, sortDir);
        });
        mailEvent.add("toolbar-quick-search", function (target) {
            var type = jQuery(target).attr("data-type");
            console.log(type);
            viewQuickList(type);
        });
        mailEvent.add("list-page-move", function (target) {
            var page = jQuery(target).attr("page");
            _this.movePage(page);
            jQuery("#mail_list_content").scrollTop(0);
        });
        mailEvent.add("reload-list", function (target) {
            _this.reloadMessageList(true);
        });
        mailEvent.add("reload-mdn-list", function (target) {
            _this.loadMdnList(_this.listParam);
        });
        mailEvent.add("read-message-simple", function (target) {
            var folderName = jQuery(target).attr("folder");
            var uid = jQuery(target).attr("uid");
            readMessage(folderName, uid);
        });
        mailEvent.add("read-message-simple-relation", function (target) {
            var folderName = jQuery(target).attr("folder");
            var uid = jQuery(target).attr("uid");
            var param = {"folder": unescape_tag_title(folderName)};
            param = _this.getSharedFolderParam(param);
            if (layoutMode != "n") {
                mailControl.loadMessageList(param, true, true, true);
            }
            readMessage(folderName, uid);
        });
        mailEvent.add("read-message", function (target) {
            _this.closeMailListPreview();
            var folderName = jQuery(target).closest("tr").attr("folder");
            var uid = jQuery(target).closest("tr").attr("uid");
            readMessage(folderName, uid);
        });
        mailEvent.add("read-message-popup", function (target) {
            var folderName = jQuery(target).closest("tr").attr("folder");
            var uid = jQuery(target).closest("tr").attr("uid");
            readMessagePopup(folderName, uid);
        });
        mailEvent.add("read-message-relation-popup", function (target) {
            var folderName = jQuery(target).attr("folder");
            var uid = jQuery(target).attr("uid");
            readMessagePopup(folderName, uid);
        });
        mailEvent.add("draft-message", function (target) {
            var folderName = jQuery(target).closest("tr").attr("folder");
            var uid = jQuery(target).closest("tr").attr("uid");
            writeDraftMessage(folderName, uid);
        });
        mailEvent.add("mail-read-close-sender-list", function (target) {
            jQuery("#mailReadSenderListWrap").hide();
            jQuery(target).hide();
            jQuery(target).parent().find(".ic_arrow_down_type4").show();
            setCookie("rcpt_hidden", "on", 365);
        });
        mailEvent.add("mail-read-open-sender-list", function (target) {
            jQuery("#mailReadSenderListWrap").show();
            jQuery(target).hide();
            jQuery(target).parent().find(".ic_arrow_up_type4").show();
            setCookie("rcpt_hidden", "off", 365);
        });
        mailEvent.add("mail-read-open-relation-list", function (target) {
            jQuery(target).hide();
            jQuery(target).parent().find(".btn_slide_hide").show();
            jQuery("#relationContentWrap").show();
        });
        mailEvent.add("mail-read-close-relation-list", function (target) {
            jQuery(target).hide();
            jQuery(target).parent().find(".btn_slide_show").show();
            jQuery("#relationContentWrap").hide();
        });
        mailEvent.add("download-attach", function (target) {
            var evtData = jQuery(target).attr("evt-data");
            if (evtData && evtData != "") {
                attachChecklayer();
            } else {
                var folderName = jQuery("#folderName").val();
                var uid = jQuery("#msgUid").val();
                var part = jQuery(target).closest("li").attr("part");
                downloadAttach(folderName, uid, part);
            }
        });
        mailEvent.add("preview-attach", function (target) {
            var folderName = jQuery("#folderName").val();
            var uid = jQuery("#msgUid").val();
            var part = jQuery(target).closest("li").attr("part");
            previewAttach(uid, folderName, part);
        });
        mailEvent.add("save-webfolder", function (target) {
            var evtData = jQuery(target).attr("evt-data");
            if (evtData && evtData != "") {
                attachChecklayer();
            } else {
                var folderName = jQuery("#folderName").val();
                var uid = jQuery("#msgUid").val();
                var part = jQuery(target).closest("li").attr("part");
                var param = {"folderName": folderName, "uid": uid, "part": part};

                if (jQuery("#shared_folder_wrap").find("p.title.on").length > 0) {
                    param.sharedUserSeq = jQuery("#shared_folder_wrap").find("p.title.on").children().attr("seq");
                    param.sharedFolderName = folderName;
                    param.sharedFlag = "shared";
                }
                openWebfolderPopup(param);
            }
        });
        mailEvent.add("read-view-img", function (target) {
            var folderName = jQuery("#folderName").val();
            var uid = jQuery("#msgUid").val();
            readViewImg(folderName, uid);
        });
        mailEvent.add("regist-bayesian-rule", function (target) {
            var ruleType = jQuery(target).data("type");
            var folderName = jQuery("#folderName").val();
            var uid = jQuery("#msgUid").val();
            registBayesianRuleMessage(ruleType, folderName, uid);
        });
        mailEvent.add("download-attach-all", function (target) {
            var folderName = jQuery("#folderName").val();
            var uid = jQuery("#msgUid").val();
            var parts = "";
            jQuery("#attachListWrap li:not(.deleted)").each(function () {
                parts += (parts == "") ? parts : "_";
                parts += jQuery(this).attr("part");
            });
            if (parts == "") {
                jQuery.goAlert(mailMsg.mail_attach, mailMsg.alert_download_nofile);
                return;
            }
            jQuery.goAlert(mailMsg.mail_attach_all_save_title, mailMsg.mail_attach_all_save_message);
            downloadAllAttach(folderName, uid, parts);
        });
        mailEvent.add("delete-attach", function (target) {
            var folderName = jQuery("#folderName").val();
            var uid = jQuery("#msgUid").val();
            var part = jQuery(target).closest("li").attr("part");
            deleteAttachFile(folderName, uid, part);
        });
        mailEvent.add("delete-attach-all", function (target) {
            var folderName = jQuery("#folderName").val();
            var uid = jQuery("#msgUid").val();
            var parts = "";

            jQuery("#attachListWrap li").each(function () {
                if (!jQuery(this).hasClass("deleted")) {
                    parts += (parts == "") ? parts : "_";
                    parts += jQuery(this).attr("part");
                }
            });
            deleteAllAttach(folderName, uid, parts);
        });
        mailEvent.add("read-nested-pop", function (target) {
            var folderName = jQuery("#folderName").val();
            var uid = jQuery("#msgUid").val();
            var part = jQuery(target).closest("li").attr("part");
            readNestedMessage(folderName, uid, part);
        });
        mailEvent.add("help-accordion-collapse", function (target) {
            var help_cir = jQuery(target);
            var toggleId = help_cir.data("id");
            var toggleObj = jQuery("#" + toggleId);

            if (help_cir.hasClass("on")) {
                help_cir.removeClass("on");
            } else {
                help_cir.addClass("on");
            }
            toggleObj.slideToggle("fast");
        });
        mailEvent.add("download-tnef-attach", function (target) {
            var folderName = jQuery("#folderName").val();
            var uid = jQuery("#msgUid").val();
            var part = jQuery(target).closest("li").attr("part");
            var attKey = jQuery(target).attr("attkey");
            downLoadTnefAttach(folderName, uid, part, attKey);
        });
        mailEvent.add("view-message-source", function (target) {
            var folderName = jQuery("#folderName").val();
            var uid = jQuery("#msgUid").val();
            viewSource(folderName, uid);
        });
        mailEvent.add("view-ndr-guide", function (target) {
            viewNdrGuide();
        });
        mailEvent.add("registration-schedule", function (target) {
            var subject = jQuery("#messageListId").attr("subject");
            viewRegistrationSchedule(subject);
        });
        mailEvent.add("print-message", function (target) {
            printMessage();
        });
        mailEvent.add("confirm-integrity", function (target) {
            var folderName = jQuery("#folderName").val();
            var uid = jQuery("#msgUid").val();
            confirmIntegrity(folderName, uid);
        });
        mailEvent.add("write-toggle-bccwrap", function (target) {
            if (jQuery(target).hasClass("ic_arrow_down_type4")) {
                jQuery(target).removeClass("ic_arrow_down_type4").addClass("ic_arrow_up_type4").attr("title", mailMsg.comn_close);
                jQuery("#writeBccWrap").show();
            } else {
                jQuery(target).removeClass("ic_arrow_up_type4").addClass("ic_arrow_down_type4").attr("title", mailMsg.comn_open);
                jQuery("#writeBccWrap").hide();
            }
        });
        mailEvent.add('attach-area-toggle', function (target) {
            var $target = jQuery(target);
            var isOpened = $target.hasClass('ic_arrow_up_type4');
            if (getCookie("OcxUpload") == "on") {
                jQuery('#att_ocx_area').toggle(!isOpened);
            } else {
                jQuery('#att_simple_area').toggle(!isOpened);
            }
            $target.toggleClass('ic_arrow_down_type4').toggleClass('ic_arrow_up_type4');
            setCookie('isAttachAreaFolded', isOpened, 365);
        });
        mailEvent.add("write-toggle-massRcptwrap", function (target) {
            var close = "on";
            if (jQuery(target).hasClass("ic_arrow_down_type4")) {
                jQuery(target).removeClass("ic_arrow_down_type4").addClass("ic_arrow_up_type4").attr("title", mailMsg.comn_close);
                jQuery("#massRcptwrap").show();
                close = "off";
            } else {
                jQuery(target).removeClass("ic_arrow_up_type4").addClass("ic_arrow_down_type4").attr("title", mailMsg.comn_open);
                jQuery("#massRcptwrap").hide();
            }
            setCookie("DO_MASSRCPT_CLOSE", close, 365);
        });
        mailEvent.add("bigattach-manage", function (target) {
            viewBigAttachManager();
        });
        mailEvent.add("open-write-webfolder", function (target) {
            openWriteWebfolder();
        });
        mailEvent.add("letter-layer", function (target) {
            getLetterListLayer();
        });
        mailEvent.add("write-change-editor", function (target) {
            getWriteModeLayer();
        });
        mailEvent.add("write-mode-change", function (target) {
            var mode = jQuery(target).data("mode");
            chgEditorMod(mode);
        });
        mailEvent.add("template-layer", function (target) {
            getDocTemplateList();
        });
        mailEvent.add("layer-list-page-move", function (target) {
            var pageType = jQuery("#pageNaviLayerWrap").data("type");
            var page = jQuery(target).attr("page");
            if (pageType == "letter") {
                getLetterListLayer(page);
            } else if (pageType == "docTmpl") {
                getDocTemplateList(page);
            }
        });
        mailEvent.add("send-message", function (target) {
            if (!contentValidation()) return;
            sendMessage();
        });
        mailEvent.add("send-draft", function (target) {
            if (!contentValidation()) return;
            doDraftSave();
        });
        mailEvent.add("receive-noti-read", function (target) {
            var messageId = jQuery(target).attr("messageId");
            var subject = jQuery(target).attr("subject");
            var dateUtc = jQuery(target).attr("date");
            var param = {"messageId": messageId, "subject": subject, "dateUtc": dateUtc};
            mailControl.loadMdnRead(param);
        });
        mailEvent.add("add-message-tagging", function (target) {
            var tagId = jQuery(target).closest("li").data("tid");
            messageTaggingManager(tagId, "true");
        });
        mailEvent.add("remove-message-tagging", function (target) {
            var tagId = jQuery(target).closest("li").data("tid");
            messageTaggingManager(tagId, "false");
        });
        mailEvent.add("self-remove-message-tagging", function (target) {
            var tagId = jQuery(target).data("tagid");
            var folder, uid;
            if (currentMenu == "read") {
                folder = jQuery("#folderName").val();
                uid = jQuery("#msgUid").val();
            } else {
                var mailTr = jQuery(target).closest("tr");
                folder = mailTr.attr("folder");
                uid = mailTr.attr("uid");
            }
            selfRemoveMessageTagging(folder, uid, tagId);
        });
        mailEvent.add("change-flag-seen", function (target) {
            changeSeenFlag(true);
        });
        mailEvent.add("change-flag-unseen", function (target) {
            changeSeenFlag(false);
        });
        mailEvent.add("toolbar-folder", function (target) {
            var folderName = jQuery(target).attr("fname");
            copyMoveMessage(folderName);
        });
        mailEvent.add("toolbar-write-reply", function (target) {
            replyWrite("reply");
        });
        mailEvent.add("toolbar-write-replyall", function (target) {
            replyWrite("replyall");
        });
        mailEvent.add("toolbar-forward-parsed", function (target) {
            forwardMessage("parsed");
        });
        mailEvent.add("toolbar-forward-attached", function (target) {
            forwardMessage("attached");
        });
        mailEvent.add("toolbar-message-delete", function (target) {
            deleteMessage();
        });
        mailEvent.add("toolbar-message-erase", function (target) {
            cleanMessage();
        });
        mailEvent.add("toolbar-attach-delete", function (target) {
            deleteMessageAttaches();
        });
        mailEvent.add("toolbar-message-save", function (target) {
            if (!checkListToolbarSelect()) {
                return;
            }
            downloadMessage();
        });
        mailEvent.add("toolbar-message-filter", function (target) {
            if (!checkListToolbarSelect()) {
                return;
            }
            addMessageFilter();
        });
        mailEvent.add("toolbar-print", function (target) {
            if (!checkListToolbarSelect()) {
                return;
            }
            printMessage();
        });
        mailEvent.add("toolbar-add-reject", function (target) {
            if (!checkListToolbarSelect()) {
                return;
            }
            registRejectAllow("black");
        });
        mailEvent.add("toolbar-add-allow", function (target) {
            if (!checkListToolbarSelect()) {
                return;
            }
            registRejectAllow("white");
        });
        mailEvent.add("toolbar-write-cancel", function (target) {
            checkEscapeWriteMode(function () {
                mailControl.reloadWriteMessage();
            });
        });
        mailEvent.add("toolbar-rewrite", function (target) {
            if (!checkListToolbarSelect()) {
                return;
            }
            reWrite();
        });
        mailEvent.add("toolbar-change-mailmode", function (target) {
            var selectId = jQuery(target).find("span").attr("id");
            var $layer1 = jQuery("#readMode_layer1");
            var $layer2 = jQuery("#readMode_layer2");
            var $layer3 = jQuery("#readMode_layer3");
            $layer1.removeClass("ic_layer1 ic_layer1_active on");
            $layer2.removeClass("ic_layer2 ic_layer2_active on");
            $layer3.removeClass("ic_layer3 ic_layer3_active on");
            if (selectId == "readMode_layer1") {
                $layer1.addClass("ic_layer1_active on");
                $layer2.addClass("ic_layer2");
                $layer3.addClass("ic_layer3");
            } else if (selectId == "readMode_layer2") {
                $layer1.addClass("ic_layer1");
                $layer2.addClass("ic_layer2_active on");
                $layer3.addClass("ic_layer3");
            } else {
                $layer1.addClass("ic_layer1");
                $layer2.addClass("ic_layer2");
                $layer3.addClass("ic_layer3_active on");
            }
            saveLayoutOption();
        });
        mailEvent.add("search-rcpt-address", function (target) {
            searchRcptAddress();
        });
        mailEvent.add("select-all-message-on", function (target) {
            selectAllMessageOn();
        });
        mailEvent.add("select-all-message-off", function (target) {
            selectAllMessageOff();
        });
        mailEvent.add("from-to-submenu", function (target) {
            openAddrLayerPopup(target);
        });
        mailEvent.add("layer-write-email", function (target) {
            var emailFormat = jQuery(target).parent().data("email");
            var param = {wtype: "normal", to: emailFormat};
            goWrieLoad(param);
            closeAddrLayerPopup(target);
        });
        mailEvent.add("layer-save-addr", function (target) {
            var emailFormat = jQuery(target).parent().data("email");
            addAddrBookEmail(emailFormat);
            closeAddrLayerPopup(target);
        });
        mailEvent.add("layer-search-mail", function (target) {
            var emailFormat = jQuery(target).parent().data("email");
            var email = get_email(emailFormat);
            searchMessage(email);
            closeAddrLayerPopup(target);
        });
        mailEvent.add("goto-basic-setting", function (target) {
            if (isPopupView()) {
                if (isReloadReady()) {
                    opener.loadBasicSetting();
                }
                window.close();
            } else {
                loadBasicSetting();
            }
        });
        mailEvent.add("go-home", function (target) {
            parent.GoInitMenu();
        });
        mailEvent.add("write-mail", function (target) {
            jQuery(window).scrollTop(0);
            goWrite();
        });
        mailEvent.add("folder", function (target) {
            var folder = jQuery(target).attr("fname");
            goFolder(folder);
        });
        mailEvent.add("write-add-address", function (target) {
            var rcptType = jQuery(target).data("rcpt");
            openWriteAddrRcptPopup(rcptType);
        });
        mailEvent.add("write-mail-popup", function (target) {
            var wname = "writePopup" + makeRandom();
            location.replace("/app/mail/popup", wname, "scrollbars=yes,resizable=yes,width=1280,height=790");

        });
        mailEvent.add("view-popup-allow-list", function (target) {
            _this.listSendAllow(function (data) {
                viewSendAllow(data);
            });
        });
        mailEvent.add("select-field", function (target) {
            selectAddressFieldkeyEvt(jQuery(target).closest("li"));
        });
        mailEvent.add("multi-select-field", function (target) {
            var selectUnit = jQuery(target).closest("li");
            selectUnit.addClass("on");
        });
        mailEvent.add("multi-select-fields", function (target) {
            if (window.event) {
                window.event.returnValue = false;
            } else {
                event.returnValue = false;
            }
            var selectUnit = jQuery(target).closest("li");
            var parentUlElement = selectUnit.closest("ul.name_tag");
            var emailLiList = parentUlElement.find("li:not(.creat)");
            var selectUnitsSize = emailLiList.size();

            selectUnit.addClass("on");

            var firstNode = emailLiList.first();
            var nextNode = null;

            var selectRange = new Array();

            for (var i = 0; i < selectUnitsSize; i++) {
                if (i == 0) {
                    if (firstNode.hasClass("on")) {
                        selectRange.push(i);
                    }
                    nextNode = firstNode.next();
                } else {
                    if (nextNode.hasClass("on")) {
                        selectRange.push(i);
                    }
                    nextNode = nextNode.next();
                }
            }

            for (var i = selectRange[0]; i < selectRange[1]; i++) {
                for (var j = 0; j < selectUnitsSize; j++) {
                    if (j == 0 && i == j) {
                        firstNode.addClass("on");
                        nextNode = firstNode.next();
                    } else if (j != 0 && i == j) {
                        nextNode.addClass("on");
                        nextNode = nextNode.next();
                    } else {
                        if (j == 0) {
                            nextNode = firstNode.next();
                        } else {
                            nextNode = nextNode.next();
                        }
                    }
                }
            }
        });
        mailEvent.add("toggle-mail-folder", function (target) {
            var status = jQuery(target).attr("status");
            var currentDepth = jQuery(target).closest("li").attr("depth");
            currentDepth = parseInt(currentDepth, 10);
            var childObj = jQuery(target).closest("li").find("ul[depth='" + (currentDepth + 1) + "']");
            if (status == "open") {
                childObj.hide();
                jQuery(target).removeClass("close").addClass("open").attr({
                    "status": "close", "title": mailMsg.comn_open
                });
            } else {
                childObj.show();
                jQuery(target).removeClass("open").addClass("close").attr({
                    "status": "open", "title": mailMsg.comn_close
                });
                ;
            }
        });
        mailEvent.add("refresh-mail-list", function (target) {
            makeProcessLoader();
            mailControl.reloadMessageList();
        });
        mailEvent.add("refresh-toolbar", function (target) {
            _this.makeSubToolbar(jQuery(target));
        });
        mailEvent.add("select-refresh-time", function (target) {
            setCookie("reflash_time", jQuery(target).attr("data-value"), 365);
            jQuery("#toolbar_refresh_flag li .ic_check").each(function () {
                jQuery(this).hide();
            });
            var refreshTime = getCookie("reflash_time");
            jQuery("#toolbar_refresh_flag li").each(function () {
                if (jQuery(this).attr("data-value") == refreshTime) {
                    jQuery(this).find('.ic_board.ic_check').show();
                }
            });
            if (refreshTime != "-1") {
                jQuery("#refresh_min_text").text(refreshTime);
            } else {
                jQuery("#refresh_min_text").text("");
            }
        });
        mailEvent.add("layout-toolbar", function (target) {
            _this.makeLayoutSubToolbar(jQuery(target));
        });

        mailEvent.add("sort-toolbar", function (target) {
            //_this.makeSubToolbar(jQuery(target));
            _this.makeSortAndSearchToolbar(jQuery(target));
        });

        var mailInputEvent = new EventControl("#mainContentWrap", "click", "input");

        mailInputEvent.add("list-select-all", function (target) {
            var checked = jQuery(target).attr("checked");
            var checkbox = jQuery("#mail_list_content input:checkbox");
            checkbox.each(function () {
                listCheckboxControl(jQuery(this), checked);
            });
            toggleAllCheckMessage(checked);
        });
        mailInputEvent.add("write-myself", function (target) {
            var checked = jQuery(target).attr("checked");
            makeWriteMyself(checked);
        });
        mailInputEvent.add("check-list", function (target) {
            ReadSubMessageChecker.resetUid();
            listCheckboxControl(jQuery(target), jQuery(target).attr("checked"));
        });
        mailInputEvent.add("mod-field-inside", function (target) {
            isModFieldInside = true;
        });

        var mailUlEvent = new EventControl("#mainContentWrap", "click", "ul");
        mailUlEvent.add("write-address-to", function (target) {
            if (!isModFieldInside) {
                jQuery("#to").focus();
            }
        });
        mailUlEvent.add("write-address-cc", function (target) {
            if (!isModFieldInside) {
                jQuery("#cc").focus();
            }
        });
        mailUlEvent.add("write-address-bcc", function (target) {
            if (!isModFieldInside) {
                jQuery("#bcc").focus();
            }
        });

        var mailChangeEvent = new EventControl("#mainContentWrap", "change", "select");
        mailChangeEvent.add("auto-save", function (target) {
            var term = jQuery(target).val();
            chgAutoSaveTerm(term);
        });
        mailChangeEvent.add("select-rcpt-email", function (target) {
            var rcptType = jQuery(target).data("rcpt");
            var email = jQuery(target).val();
            selectRcptEmail(rcptType, email);
            jQuery(target).val("");
        });
        mailChangeEvent.add("change-pagebase", function (target) {
            savePageBase();
        });
        mailChangeEvent.add("change-sender-mail", function (target) {
            if (jQuery(target).find("option:selected").attr("alias") == "true") {
                jQuery.goPopup({
                    id: 'changeSenderMail',
                    contents: "<p class='add'>" + mailMsg.mail_sender_email_alias_alert + "</p>",
                    closeCallback: function () {
                        jQuery("#senderUserEmail").val(previousSenderEmail);
                    },
                    buttons: [{
                        btype: 'confirm', btext: mailMsg.comn_confirm, autoclose: false, callback: function () {
                            jQuery.goPopup.close();
                        }
                    }, {btype: 'cancel', btext: mailMsg.comn_cancel}]
                });
            }
        });

        var mailHeaderEvent = new EventControl("#mailHeaderWrap", "click", "a,:button,ins");
        mailHeaderEvent.add("mail-detail-search", function (target) {
            toggleDetailSearchLayer();
        });
        mailHeaderEvent.add("mail-search", function (target) {
            searchMessage();
        });
        mailHeaderEvent.add("add-bookmark", function (target) {
            addBookmark();
        });
        mailHeaderEvent.add("delete-bookmark", function (target) {
            deleteBookmark();
        });
        mailHeaderEvent.add("mail-search-cancel", function (target) {
            cancelSearch();
        });

        jQuery("#mainContentWrap").on("mouseover", "#mail_list_content table:not(#mail_mdn_list_content,#mail_mdn_read_content) tr:not(.tb_option,.dateDesc)", function (event) {
            makeDragEvent(jQuery(this));
        });

        jQuery("#mailSearchKeyWord").on("keypress", function (event) {
            if (event.which == 13) {
                searchMessage();
            }
        })
            .on("focus", function () {
                jQuery(this).parent().addClass("search_focus");
            })
            .on("blur", function () {
                jQuery(this).parent().removeClass("search_focus");
            });
    };

    //정렬순서,빠른검색 레이어용 툴바를 만들까...

    this.makeSortAndSearchToolbar = function (linkObj) {
        var bindEvent = function (linkObj, parentObj) {
            var timeout;
            linkObj.bind({
                mouseover: function () {
                    if (timeout) clearTimeout(timeout);
                }, mouseout: function () {
                    timeout = setTimeout(function () {
                        parentObj.hide();
                        linkObj.unbind();
                        parentObj.unbind();
                    }, 1000);
                }
            });
            parentObj.bind({
                mouseover: function () {
                    if (timeout) clearTimeout(timeout);
                }, mouseout: function () {
                    timeout = setTimeout(function () {
                        parentObj.hide();
                        linkObj.unbind();
                        parentObj.unbind();
                    }, 1000);
                }
            });
        };
        var parentObj = linkObj.parent().find("div.array_option");
        if (parentObj.css("display") == "none") {
            jQuery("#toolbar_wrap div.array_option").hide();
            jQuery("div[data-tag=write_toolbar_wrap] div.array_option").hide();
            parentObj.show();
            bindEvent(linkObj, parentObj);
        } else {
            parentObj.hide();
            linkObj.unbind();
            parentObj.unbind();
        }
    };

    this.makeSubToolbar = function (linkObj, menu) {
        var unbindEvent = function (subLayerId, linkObj) {
            jQuery("#" + subLayerId + " *").unbind();
            linkObj.unbind();
        };
        var subLayerId = linkObj.parent().find("ul").attr("id");
        var $parentObj = jQuery("#" + subLayerId).closest("div.array_option");
        if ($parentObj.css("display") == "none") {
            jQuery("#toolbar_wrap div.array_option").hide();
            jQuery("div[data-tag=write_toolbar_wrap] div.array_option").hide();
            $parentObj.show();
            var timeout;
            linkObj.bind("mouseover", function () {
                if (timeout) clearTimeout(timeout);
            });
            linkObj.bind("mouseout", function () {
                timeout = setTimeout(function () {
                    $parentObj.hide();
                    unbindEvent(subLayerId, linkObj);
                }, 1000);
            });
            jQuery("#" + subLayerId).parent().bind("mouseout", function () {
                timeout = setTimeout(function () {
                    $parentObj.hide();
                    unbindEvent(subLayerId, linkObj);
                }, 1000);
            });
            jQuery("#" + subLayerId).parent().bind("mouseover", function () {
                if (timeout) clearTimeout(timeout);
            });
            if (menu == "move") {
                jQuery("#" + subLayerId).closest("div.array_option").bind("mouseover", function () {
                    if (timeout) clearTimeout(timeout);
                });
            }
            jQuery("#" + subLayerId + " > li").bind("click", function () {
                if (jQuery(this).parent().attr("auto-close") != "off") {
                    $parentObj.hide();
                    unbindEvent(subLayerId, linkObj);
                }
                var type = jQuery(this).attr("evt-rol");
                if (!type) return;
                if (type == "toolbar-quick-search") {
                    var type = jQuery(this).data("type");
                    viewQuickList(type);
                }
            });
        } else {
            $parentObj.hide();
            unbindEvent(subLayerId, linkObj);
        }
    };

    this.makeLayoutSubToolbar = function (linkObj, menu) {
        var subLayerId = "toolbar_layout_flag";
        var $parentObj = jQuery("#" + subLayerId).closest("div.array_option");
        if ($parentObj.css("display") == "none") {
            jQuery("#toolbar_wrap div.array_option").hide();
            jQuery("div[data-tag=write_toolbar_wrap] div.array_option").hide();
            $parentObj.show();
            var timeout;
            linkObj.bind("mouseover", function () {
                if (timeout) clearTimeout(timeout);
            });
            linkObj.bind("mouseout", function () {
                timeout = setTimeout(function () {
                    $parentObj.hide();
                    jQuery("#" + subLayerId + " *").unbind();
                    linkObj.unbind();
                }, 1000);
            });
            jQuery("#" + subLayerId + " > *").bind("mouseout", function () {
                timeout = setTimeout(function () {
                    $parentObj.hide();
                    jQuery("#" + subLayerId + " *").unbind();
                    linkObj.unbind();
                }, 1000);
            });
            jQuery("#" + subLayerId + " > *").bind("mouseover", function () {
                if (timeout) clearTimeout(timeout);
            });
            jQuery("#" + subLayerId + " > a").bind("click", function () {
                if (jQuery(this).parent().attr("auto-close") != "off") {
                    $parentObj.hide();
                    jQuery("#" + subLayerId + " *").unbind();
                    linkObj.unbind();
                }
            });
        } else {
            jQuery("#" + subLayerId + " *").unbind();
            linkObj.unbind();
            $parentObj.hide();
        }

    };

    this.makeMailHeaderMsg = function (data) {
        if (getCookie("reflash_time") == "") {
            setCookie("reflash_time", -1, 365);
        }
        var reflashTime = getCookie("reflash_time");
        data.reflashTime = reflashTime;

        var folderType = data.folderType;
        if (folderType == "sent" || folderType == "drafts" || folderType == "reserved" || folderType == "spam" || folderType == "trash" || folderType == "all") {
            isUseReflashTime = false;
            runAutoReflashTime = null;
        } else if (folderType == "inbox" || folderType == "normal") {
            isUseReflashTime = true;
        }
        jQuery("#mail_header_msg").handlebars("mail_header_msg_tmpl", data);
        if (isUseReflashTime && reflashTime > 0 && runAutoReflashTime == null) {
            runAutoReflashTime = setTimeout(function () {
                runAutoReflashProcess();
            }, 5000);
        }
    };
    this.getListMode = function () {
        return this.listMode;
    };
    this.getCurrentFolder = function () {
        return this.currentFolder;
    };
    this.taggingMessage = function (param) {
        ActionLoader.postGoJsonLoadAction(this.taggingMessageAction, param, function (data) {
            if (isReloadReady()) {
                opener.reloadMessagePopup();
                opener.reloadMessageList();
            } else {
                if (currentMenu == "read") {
                    _this.reloadReadMessage();
                } else {
                    _this.reloadMessageList();
                }
            }
        }, "json");
    };
    this.executeToolbarAction = function (target) {
        if (currentMenu == "list" || (currentMenu == "read" && layoutMode != "n")) {
            var ignore = ("on" == jQuery(target).attr("ignore"));
            if (!ignore && getMailListCheckedCount() == 0) {
                if (_this.listMode == "mdnread") {
                    jQuery.goAlert(mailMsg.error_noselect);
                    return;
                } else if (_this.listMode == "mdnlist") {
                    var action = jQuery(target).attr("evt-act");
                    if (action == "toolbar-mdn-recall-all") {
                        jQuery.goSlideMessage(mailMsg.mail_mdn_message_recall_001, 'caution');
                    } else {
                        jQuery.goSlideMessage(mailMsg.mail_mdn_message_delete_001, 'caution');
                    }
                    return;
                } else {
                    jQuery.goAlert(mailMsg.mail_message_notselect);
                    return;
                }
            }
        }
        var hasSubToolbar = ("on" == jQuery(target).attr("sub"));
        var menu = jQuery(target).attr("menu");
        if (hasSubToolbar) {
            if (menu == "tag") {
                makeTagToolbar();
            } else if (menu == "copy" || menu == "move") {
                makeCopyMoveToolbar();
            } else if (menu == "forward") {
                jQuery("#toolbarForwardParsedMenu").show();
                if (getMailListCheckedCount() > 1) {
                    jQuery("#toolbarForwardParsedMenu").hide();
                }
            }
            _this.makeSubToolbar(jQuery(target), menu);
        } else {
            var action = jQuery(target).attr("evt-act");
            switch (action) {
                case "toolbar-write-preview" :
                    writePreview();
                    break;
                case "toolbar-message-delete" :
                    if (_this.listMode == "mdnlist") {
                        deleteMdn();
                    } else {
                        deleteMessage();
                    }
                    break;
                case "toolbar-write-reply" :
                    replyWrite("reply");
                    break;
                case "toolbar-forward-quick" :
                    if (getMailListCheckedCount() > 1) {
                        forwardMessage("attached");
                    } else {
                        forwardMessage("parsed");
                    }
                    break;
                case "change-flag-seen" :
                    changeSeenFlag(true);
                    break;
                case "toolbar-add-spam" :
                    addSpamWhiteRule("black");
                    break;
                case "toolbar-add-white" :
                    addSpamWhiteRule("white");
                    break;
                case "toolbar-mdn-recall" :
                    recallMsg();
                    break;
                case "toolbar-mdn-recall-all" :
                    recallSelectMsg();
                    break;
                case "toolbar-mdn-sent-view" :
                    var uid = jQuery("#mdnReadUid").val();
                    if (uid < 0) {
                        jQuery.goSlideMessage(mailMsg.mail_not_found_message, 'caution');
                        return;
                    }
                    readMessagePopup('Sent', uid);
                    break;
                default :
                    return;
            }
        }
    }
};

var FolderControl = function () {
    this.folderInfoAction = "/api/mail/folder/info";
    this.folderAllInfoAction = "/api/mail/folder/all";
    this.folderBasicInfoAction = "/api/mail/folder/list";
    this.addFolderAction = "/api/mail/folder/create";
    this.modifyFolderAction = "/api/mail/folder/modify";
    this.deleteFolderAction = "/api/mail/folder/delete";
    this.emptyFolderAction = "/api/mail/folder/empty";
    this.sharedFolderReaderListAction = "/api/mail/folder/share/reader";

    //즐겨찾기
    this.bookmarkListAction = "/api/mail/bookmark/list";
    this.saveBookmarkAction = "/api/mail/bookmark/save";
    this.updateBookmarkAction = "/api/mail/bookmark/update";
    this.deleteBookmarkAction = "/api/mail/bookmark/delete";
    this.changeBookmarkAction = "/api/mail/bookmark/change";

    //태그관리
    this.tagListAction = "/api/mail/tag/list";
    this.addTagAction = "/api/mail/tag/create";
    this.modifyTagAction = "/api/mail/tag/modify";
    this.deleteTagAction = "/api/mail/tag/delete";

    this.userFolderList = [];
    this.quotaInfo = {};
    this.tagData = [];
    var _this = this;
    this.updateFolderCountInfo = function () {
        var param = {};
        ActionLoader.getGoLoadAction(this.folderInfoAction, param, function (data) {
            _this.printFolderCountUpdate(data);
            _this.printFolderCountUpdateBookMark(data);
            makeMailBadgeCount();
        }, "json");
    };
    this.printFolderCountUpdate = function (data) {
        var folderList = data;
        if (folderList && folderList.length > 0) {
            for (var i = 0; i < folderList.length; i++) {
                var folder = folderList[i];
                if (isMailBadgeUse) {
                    if (folder.fullName == "Inbox") {
                        mailBadgeCount = folder.unseenCnt;
                    }
                    if (!isDefaultBox(folder.fullName)) {
                        mailBadgeCount += folder.unseenCnt;
                    }
                }
                var unseenArea = jQuery("#" + folder.id + "_num");
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
                if (folder.child && folder.child.length > 0) {
                    _this.printFolderCountUpdate(folder.child);
                }
                if ((currentMenu == "list" || currentMenu == "read") && currentFolderName == folder.fullName) {
                    isBookmark = false;
                    jQuery("#mail_bookmark_list li").each(function () {
                        var data = jQuery(this).attr("query");
                        var seq = jQuery(this).attr("seq");
                        if (data == folder.fullName) {
                            isBookmark = true;
                        }
                    });
                    var headerMsgData = {
                        "name": currentFolderViewName,
                        "totalCnt": folder.totalCnt,
                        "unseenCnt": folder.unseenCnt,
                        "isBookmark": isBookmark
                    };
                    if (bookmarkType == "tag") {
                        var tagInfo = getTagInfo(bookmarkValue);
                        headerMsgData.type = "tag";
                        headerMsgData.tagInfo = tagInfo;
                    }
                    makeMailHeaderMessege(headerMsgData);
                }
            }
        }
    };
    this.printFolderCountUpdateBookMark = function (folderList) {
        if (folderList && folderList.length > 0) {
            for (var i = 0; i < folderList.length; i++) {
                var folder = folderList[i];
                jQuery("#mail_bookmark_list li").each(function () {
                    var data = jQuery(this).attr("query");
                    var seq = jQuery(this).attr("seq");
                    if (data == folder.fullName) {
                        var unseenArea = jQuery("#bookmark_num_" + seq);
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
                    }

                });
                if (folder.child && folder.child.length > 0) {
                    _this.printFolderCountUpdateBookMark(folder.child);
                }
            }
        }
    };

    this.getFolderAllInfo = function () {
        var param = {};
        ActionLoader.getGoLoadAction(this.folderAllInfoAction, param, function (data) {
            _this.checkCollapseStatus();
            _this.printFolderAllInfo(data);
        }, "json");
    };
    this.checkCollapseStatus = function () {
        _this.toggleCollapseStatus("mail_tag_wrap", "tag_menu_collapse");
        _this.toggleCollapseStatus("left_mail_box_wrap", "mail_menu_collapse");
        _this.toggleCollapseStatus("uf_smart_area", "smart_menu_collapse");
        _this.toggleCollapseStatus("left_quicksearch_box_wrap", "quicksearch_menu_collapse");
    };
    this.toggleCollapseStatus = function (wrapId, toggleId) {
        var status = getCookie(wrapId);
        if (status == "close") {
            jQuery("#" + toggleId).closest('h1').addClass('folded').attr("title", mailMsg.common_menu_show);
            jQuery("#" + wrapId).hide();
        } else {
            jQuery("#" + toggleId).closest('h1').removeClass('folded').attr("title", mailMsg.common_menu_hide);
            jQuery("#" + wrapId).show();
        }
    };
    this.getFolderInfo = function () {
        _this.getFolderInfoData(function (data) {
            _this.printFolderInfo(data);
        });
    };
    this.getFolderInfoData = function (func) {
        var param = {};
        ActionLoader.getGoLoadAction(this.folderBasicInfoAction, param, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.getQuotaInfo = function () {
        return this.quotaInfo;
    };
    this.setQuotaInfo = function (quotaInfo) {
        this.quotaInfo = quotaInfo;
    };
    this.addFolderAfterFunc = function (folderName, func) {
        var param = {"folderName": folderName};
        ActionLoader.postGoLoadAction(this.addFolderAction, param, function (data) {
            if (func) {
                func(data);
            }
        }, "json");
    };
    this.addFolder = function (param) {
        ActionLoader.postGoLoadAction(this.addFolderAction, param, function (data) {
            _this.getFolderInfo();
            if (isFolderManageMenu()) {
                mailSettingControl.loadViewFolderManage();
            }
            removeProcessLoader();
        }, "json");
    };
    this.modifyFolder = function (param) {
        ActionLoader.postGoLoadAction(this.modifyFolderAction, param, function (data) {
            _this.getFolderInfo();
            var newValue = param.newName;
            var newName = "";
            if (newValue.indexOf(".") > 0) {
                newName = newValue.substring((newValue.lastIndexOf(".") + 1), newValue.length);
            } else {
                newName = newValue;
            }
            var bookmarkParam = {};
            bookmarkParam.bookmarkType = "mail";
            bookmarkParam.preBookmarkValue = param.previousName;
            bookmarkParam.bookmarkName = newName;
            bookmarkParam.bookmarkValue = newValue;
            _this.changeBookMarkInfo(bookmarkParam);

            if (isFolderManageMenu()) {
                mailSettingControl.loadViewFolderManage();
            }
        }, "json", function (result) {
            jQuery.goSlideMessage(result.message, "caution");
        });
    };
    this.deleteFolder = function (folderName, func) {
        var param = {"folderName": folderName};
        ActionLoader.postGoLoadAction(this.deleteFolderAction, param, function (data) {
            _this.getFolderInfo();
            var bookmarkParam = {};
            bookmarkParam.bookmarkType = "mail";
            bookmarkParam.bookmarkValue = folderName;
            _this.deleteBookmark(bookmarkParam);
            if (func) func();
        }, "json");
    };
    this.emptyMailFolder = function (param, func) {
        ActionLoader.postGoLoadAction(this.emptyFolderAction, param, function (data) {
            if (func) func();
        }, "json");
    };
    this.printFolderInfo = function (data) {
        _this.makeDefaultFolder(data.defaultFolders);
        _this.makeUserFolder(data.userFolders);
        _this.makeQuotaInfo(data.quotaInfo);
        _this.printFolderCountUpdateBookMark(data.defaultFolders);
        _this.printFolderCountUpdateBookMark(data.userFolders);
    };
    this.printFolderAllInfo = function (data) {
        _this.printFolderInfo(data);
        _this.makeTagList(data.userTags);
        _this.makeSharedFolderList(data.userSharedFolderList);
    };
    this.makeQuotaInfo = function (quotaInfo) {
        jQuery("#usageQuota").html(quotaInfo.usageUnit);
        jQuery("#limitQuota").html(quotaInfo.limitUnit);
        var percent = (quotaInfo.percent > 100) ? 100 : quotaInfo.percent;
        jQuery("#usagePercent").css("width", percent + "%");
        this.quotaInfo = quotaInfo;
    };
    this.makeDefaultFolder = function (folderList) {
        var isOuotaOverExist = false;
        if (folderList && folderList.length > 0) {
            for (var i = 0; i < folderList.length; i++) {
                var folder = folderList[i];
                if (folder.fullName == "Quotaviolate") {
                    isOuotaOverExist = true;
                }
                var unseenArea = jQuery("#" + folder.id + "_num");
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
            jQuery("#df_quotaviolate").show();
        } else {
            jQuery("#df_quotaviolate").hide();
        }
    };
    this.makeUserFolder = function (folderList) {
        this.userFolderList = folderList;
        folderList.isInbox = true;

        var inboxFolderArea = jQuery("#inbox_folder_area");
        inboxFolderArea.handlebars("mail_user_folder_tmpl", folderList);

        var inboxToggleBtn = jQuery("#inbox_toggle_btn");
        if (inboxFolderArea.find("li.folder").length > 0) {
            var status = getCookie("DFN_defaultFolder0");
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

        folderList.isInbox = false;
        jQuery("#uf_folder_area").handlebars("mail_user_folder_tmpl", folderList);

        jQuery("#uf_folder_area p.title span.txt").each(function () {
            makeDropEvent(jQuery(this));
        });

        jQuery("#inbox_folder_area p.title span.txt").each(function () {
            makeDropEvent(jQuery(this));
        });
        if (isMailBadgeUse) {
            for (var i = 0; i < folderList.length; i++) {
                mailBadgeCount += folderList[i].unseenCnt;
            }
        }
        jQuery("#uf_smart_area").handlebars("mail_smart_folder_tmpl", folderList);
        if (jQuery("#uf_smart_area li").length > 0) {
            jQuery("#smart_menu").show();
        } else {
            jQuery("#smart_menu").hide();
        }
    };
    this.makeSharedFolderList = function (data) {
        if (data && data.length > 0) {
            jQuery("#shared_folder_title").show();
        } else {
            jQuery("#shared_folder_title").hide();
        }
        jQuery("#shared_folder_wrap").handlebars("shared_folder_tmpl", data);
    };
    this.getSharringReaderList = function (param) {
        ActionLoader.getGoLoadAction(this.sharedFolderReaderListAction, param, function (data) {
            makeShareFolderInfo(data);
        }, "json");
    };
    this.setSharringReaderList = function (param, func) {
        ActionLoader.putGoJsonLoadAction(this.sharedFolderReaderListAction, param, function (data) {
            jQuery.goOrgSlide.close();
            _this.getFolderInfo();
            if (func) func();
        }, "json");
    };
    this.getBookmarkInfo = function () {
        ActionLoader.getGoLoadAction(this.bookmarkListAction, null, function (data) {
            var status = getCookie("mail_bookmark_list");
            if (status == "close") {
                jQuery("#bookmark_menu_collapse").closest('h1.star').addClass('folded').attr("title", mailMsg.common_menu_show);
                jQuery("#mail_bookmark_list").hide();
            } else {
                jQuery("#bookmark_menu_collapse").closest('h1.star').removeClass('folded').attr("title", mailMsg.common_menu_hide);
                jQuery("#mail_bookmark_list").show();
            }

            jQuery("#mail_bookmark_list").handlebars("mail_bookmark_tmpl", data);
            _this.updateFolderCountInfo();
        }, "json");
    };
    this.saveBookmark = function (param) {
        ActionLoader.postGoLoadAction(this.saveBookmarkAction, param, function (data) {
            _this.changeBookmarkFlag(true);
            _this.getBookmarkInfo(true);
        }, "json");
    };
    this.updateBookmark = function (param) {
        ActionLoader.postGoLoadAction(this.updateBookmarkAction, param, function (data) {
            _this.getBookmarkInfo(true);
        }, "json");
    };
    this.deleteBookmark = function (param) {
        ActionLoader.postGoLoadAction(this.deleteBookmarkAction, param, function (data) {
            _this.changeBookmarkFlag(false);
            _this.getBookmarkInfo();
        }, "json");
    };
    this.changeBookMarkInfo = function (param) {
        ActionLoader.postGoLoadAction(this.changeBookmarkAction, param, function (data) {
            _this.getBookmarkInfo();
        }, "json");
    };
    this.changeBookmarkFlag = function (flag) {
        var bookmarkFlagObj = jQuery("#mail_header_msg ins");
        if (flag) {
            bookmarkFlagObj.attr("evt-rol", "delete-bookmark");
            bookmarkFlagObj.removeClass("ic_star_off").addClass("ic_star").attr("title", mailMsg.mail_bookmark_del);
        } else {
            bookmarkFlagObj.attr("evt-rol", "add-bookmark");
            bookmarkFlagObj.removeClass("ic_star").addClass("ic_star_off").attr("title", mailMsg.mail_bookmark_add);
        }
    };
    ////////////// 태그 관리 ////////////////
    this.getTagList = function () {
        this.getTagListAfterFunc(function (data) {
            _this.makeTagList(data);
        });
    };
    this.getTagListAfterFunc = function (func) {
        ActionLoader.getGoLoadAction(this.tagListAction, null, function (data) {
            if (func) func(data);
        }, "json");
    };
    this.makeTagList = function (data) {
        _this.tagData = data;
        jQuery("#mail_tag_list_area").handlebars("mail_tag_tmpl", data);
        jQuery("#mail_tag_list_area p.title span.txt").each(function () {
            makeDropEvent(jQuery(this));
        });
    };
    this.getTagData = function () {
        return this.tagData;
    };
    this.setTagData = function (tagData) {
        this.tagData = tagData;
    };
    this.addTag = function (param) {
        this.addTagAfterFunc(param, function () {
            _this.getTagList();
            if (isFolderManageMenu()) {
                mailSettingControl.loadViewFolderManage();
            }
        });
    };
    this.addTagAfterFunc = function (param, func) {
        ActionLoader.postGoLoadAction(this.addTagAction, param, function (data) {
            if (func) func();
        }, "json");
    };
    this.modifyTag = function (param, func) {
        ActionLoader.postGoLoadAction(this.modifyTagAction, param, function (data) {
            _this.getTagList();

            var bookmarkParam = {};
            bookmarkParam.bookmarkType = "tag";
            bookmarkParam.preBookmarkValue = param.oldId;
            bookmarkParam.bookmarkName = param.tagName;
            bookmarkParam.bookmarkValue = param.oldId;
            _this.changeBookMarkInfo(bookmarkParam);

            if (isFolderManageMenu()) {
                mailSettingControl.loadViewFolderManage();
            }
            if (func) func();
        }, "json");
    };
    this.delTag = function (tagId, func) {
        var param = {"tagIds": [tagId]};
        ActionLoader.postGoLoadAction(this.deleteTagAction, param, function (data) {
            _this.getTagList();

            var bookmarkParam = {};
            bookmarkParam.bookmarkType = "tag";
            bookmarkParam.bookmarkValue = tagId;
            _this.deleteBookmark(bookmarkParam);

            if (isFolderManageMenu()) {
                mailSettingControl.loadViewFolderManage();
            }
            if (func) func();
        }, "json");
    };
    this.getUserFolderList = function () {
        return this.userFolderList;
    };
    this.setUserFolderList = function (userFolderList) {
        this.userFolderList = userFolderList;
    };
    //////////////////////////////////////////////////
    ////////////// 메일 이벤트 //////////////////////
    this.makeEvent = function () {
        var folderEventOption = {
            everyPreFunc: function () {
                closeMailFolderOptionLayer();
            }
        };
        var folderEvent = new EventControl("#mailLeftMenuWrap", "click", "a,span,li", folderEventOption);

        folderEvent.add("mail-home", function () {
            top.location = '/app/mail';
        });

        folderEvent.add("write-mail", function (target) {
            goWrite();
        });
        folderEvent.add("folder", function (target) {
            var folder = jQuery(target).attr("fname");
            goFolder(folder);
        });
        folderEvent.add("add-folder", function (target) {
            var targetOffset = jQuery(target).offset();
            addFolder(targetOffset);
        });
        folderEvent.add("more-folder", function (target) {
            var targetOffset = jQuery(target).offset();
            moreFolder(targetOffset);
        });
        folderEvent.add("mail-folder-option", function (target) {
            var depth = jQuery(target).data("depth");
            var folderName = jQuery(target).attr("fname");

            var childerObj = jQuery(target).parent().parent().find('p a');

            childrenFnameForModify = new Array(childerObj.length);
            jQuery(target).parent().parent().find('p a').each(function (index) {
                childrenFnameForModify[index] = jQuery(target).attr('fname');
            });

            var share = jQuery(target).data("share");
            var shareseq = jQuery(target).data("shareseq");
            var data = {"folderName": folderName, "depth": depth, "share": share, "shareseq": shareseq};

            var targetOffset = jQuery(target).offset();
            data.useSharedfolder = useSharedfolder;
            jQuery.goPopup({
                id: 'mailFolderOptionLayer',
                pclass: 'layer_normal layer_context',
                width: 115,
                modal: false,
                openCallback: function () {
                    jQuery("#mailFolderOptionLayer header, #mailFolderOptionLayer footer").hide();
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
        });
        folderEvent.add("mail-folder-option-close", function (target) {
            closeMailFolderOptionLayer();
        });
        folderEvent.add("empty-spam-folder", function (target) {
            emptyFolder("Spam");
        });
        folderEvent.add("empty-trash-folder", function (target) {
            emptyFolder("Trash");
        });
        folderEvent.add("shared-folder", function (target) {
            var folder = jQuery(target).attr("fname");
            var userSeq = jQuery(target).attr("seq");
            goSharedFolder(folder, userSeq);
        });
        folderEvent.add("unseen-folder", function (target) {
            var folder = jQuery(target).attr("fname");
            goFolder(folder, "U");
        });
        folderEvent.add("bookmark-modify", function (target) {
            bookmarkManage();
        });
        folderEvent.add("bookmark-cancel", function (target) {
            bookmarkCancel();
        });
        folderEvent.add("bookmark-submit", function (target) {
            bookmarkModify();
        });
        folderEvent.add("bookmark-execute", function (target) {
            if (jQuery("#mail_bookmark_wrap").hasClass("lnb_edit")) {
                return;
            }
            var dataLi = jQuery(target).closest("li");
            var bookmarkType = dataLi.attr("type");
            var bookmarkQuery = dataLi.attr("query");
            var bookmarkSeq = dataLi.attr("seq");
            bookmarkExecute(bookmarkSeq, bookmarkType, bookmarkQuery);
        });
        folderEvent.add("bookmark-delete", function (target) {
            jQuery(target).closest("li").remove();
        });
        folderEvent.add("tag-add", function (target) {
            var $target = jQuery(target);
            var targetOffset = $target.offset();
            targetOffset["sideTop"] = $target.attr("id");
            addMailTag(null, targetOffset);
        });
        folderEvent.add("mail-tag-option", function (target) {
            var id = jQuery(target).attr("tagid");
            var name = jQuery(target).attr("tagname");
            var color = jQuery(target).attr("tagcolor");
            var data = {"id": id, "name": name, "color": color};

            var targetOffset = jQuery(target).offset();
            jQuery.goPopup({
                id: 'mailTagOptionLayer',
                pclass: 'layer_normal layer_context',
                width: 115,
                modal: false,
                openCallback: function () {
                    jQuery("#mailTagOptionLayer header,footer").hide();
                    jQuery("#mailTagOptionLayer div.content").css("padding", "0");
                    jQuery("#mailTagOptionLayer div.content").on("click", "li", function (e) {
                        var type = jQuery(this).attr("evt-rol");
                        var tagId = jQuery(this).parent().attr("tagid");
                        if (type == "tag-modify") {
                            var tagName = jQuery(this).parent().attr("tagname");
                            var tagColor = jQuery(this).parent().attr("tagcolor");
                            var data = {"id": tagId, "name": tagName, "color": tagColor, "type": "modify"};
                            addMailTag(data);
                        } else if (type == "tag-delete") {
                            deleteMailTag(tagId);
                        }
                    });
                },
                offset: {
                    top: targetOffset.top, left: targetOffset.left + 15
                },
                contents: getHandlebarsTemplate("mail_tag_option_tmpl", data),
                buttons: []
            });
        });
        folderEvent.add("mail-tag-option-close", function (target) {
            closeMailTagOptionLayer();
        });
        folderEvent.add("tag-message", function (target) {
            var param = {"folder": "all", "listType": "tag", "tagId": jQuery(target).attr("val")};

            var mode = layoutControl.getContentSplitterMode();
            mode = (mode) ? mode : "n";
            layoutControl.contentSplitterChange(mode);

            checkEscapeWriteMode(function () {
                mailControl.loadMessageList(param);
            });
        });
        folderEvent.add("setting-menu", function (target) {
            selectSettingMenu("basic");
        });
        folderEvent.add("receive-noti-list", function (target) {
            loadMdnList();
        });
        folderEvent.add("extmail-download", function (target) {
            viewExtMailPopup();
        });
        folderEvent.add("go-folder-manager", function (target) {
            selectSettingMenu("folder");
        });
        folderEvent.add("change-menu-collapse", function (target) {
            var toggleId = jQuery(target).data("id");
            var iconId = jQuery(target).data("icon");
            var toggleObj = jQuery("#" + toggleId);
            var isClose = (toggleObj.css("display") == "none");
            var collapseFlag = "open";
            if (isClose) {
                toggleObj.slideDown();
                jQuery(target).closest('h1').removeClass('folded').attr("title", mailMsg.common_menu_hide);
            } else {
                collapseFlag = "close";
                toggleObj.slideUp();
                jQuery(target).closest('h1').addClass('folded').attr("title", mailMsg.common_menu_show);
            }
            setCookie(toggleId, collapseFlag, 365);
        });
        folderEvent.add("folder-execute", function (target) {
            var ftype = jQuery(target).attr("type");
            folderExecute(ftype);
        });
        folderEvent.add("toggle-mail-folder", function (target) {
            var status = jQuery(target).attr("status");
            var fid = jQuery(target).attr("fid");
            var currentDepth = jQuery(target).closest("li").attr("depth");
            currentDepth = parseInt(currentDepth, 10);
            var childObj = jQuery(target).closest("li").find("ul[depth='" + (currentDepth + 1) + "']");
            var statusSimple = "O";
            if (status == "open") {
                childObj.hide();
                jQuery(target).removeClass("close").addClass("open").attr({
                    "status": "close", "title": mailMsg.comn_open
                });
                statusSimple = "C";
            } else {
                childObj.show();
                jQuery(target).removeClass("open").addClass("close").attr({
                    "status": "open", "title": mailMsg.comn_close
                });
                ;
            }
            setCookie("DFN_" + fid, statusSimple, 365);
        });
        folderEvent.add("tmw-folder", function (target) {
            window.open("tmwPopup.jsp");
        });
        folderEvent.add("move-security-center", function (target) {
            var url = jQuery(target).parent().attr("evt-data-url");
            var folder = jQuery(target).attr("evt-data");
            if (folder) {
                url += "&folder=" + folder;
            }
            window.open(url);
        });
        folderEvent.add("go-filter-manager", function (target) {
            selectSettingMenu("filter");
        });

        jQuery("#leftMenuSectionWrap li.default_folder p.title span.txt").each(function () {
            makeDropEvent(jQuery(this));
        });
    };
};

function getListResizeHeight() {
    var footerOffsetTop = jQuery("#mailBottom").offset().top;
    var listOffsetTop = jQuery("#mainContent").offset().top;

    // 75, 55  스크롤
    var headerHeight = 44;
    var headerOffset = 0
    if (USERSESSION.theme == "THEME_ADVANCED") {
        headerHeight = 0;
        headerOffset = 50;
    }
    jQuery("#mail_list_content").height(footerOffsetTop - listOffsetTop - headerHeight - headerOffset);
}

function getReadResizeHeight() {
    var footerOffsetTop = jQuery("#mailBottom").offset().top;
    var listOffsetTop = jQuery("#mainContent").offset().top;
    //jQuery("#mailViewContentWrap").height(footerOffsetTop-listOffsetTop-77);
    jQuery("#mailViewContentWrap").height(footerOffsetTop - listOffsetTop - 60);
}

var LayoutControl = function () {
    var _this = this;
    this.opt = {};
    this.contentSplitterMode = "n";
    this.normalMode = false;
    this.makeLayout = function (mode) {
        if (!mode) mode = "n";
        this.contentSplitterMode = mode;
        this.contentSplitterChange(mode, true);
    };
    this.contentSplitterChange = function (mode, init) {
        if (!mode) mode = "n";
        if (!init && (!this.normalMode && mode == this.contentSplitterMode)) {
            return;
        }
        this.contentSplitterMode = mode;
        if (mode == "n") {
            this.contentNormalSplitter();
        } else if (mode == "h") {
            this.makeHorizonSplitter();
        } else if (mode == "v") {
            this.makeVerticalSplitter(init);
        }
        this.normalMode = false;
    };
    this.contentNormalSplitter = function () {
        jQuery(window).off(".mail");
        resizeLeftMenu();
        jQuery("#xbar").draggable("destroy").hide();
        jQuery("#ybar").draggable("destroy").hide();
        jQuery("#mailListArea").removeAttr("style").hide();
        jQuery("#mailReadArea").removeAttr("style").hide();
        jQuery("#mail_list_content").removeAttr("style");
        //        jQuery(window).resize(getListResizeHeight);
        //        jQuery(window).resize(getReadResizeHeight);
        jQuery(window).on('resize.mail', getListResizeHeight);
        jQuery(window).on('resize.mail', getReadResizeHeight);
        jQuery(window).trigger("resize");
        jQuery("#mainContent").removeClass("column_inline column_block").addClass("column_block");
        this.normalMode = true;
    };
    this.makeHorizonSplitter = function () {
        /*jQuery(window).unbind("resize");*/
        jQuery(window).off(".mail");
        resizeLeftMenu();
        jQuery("#xbar").draggable("destroy").hide();
        jQuery("#ybar").draggable("destroy").hide();
        jQuery("#mail_list_content").removeAttr("style");
        jQuery("#mailListArea").removeAttr("style");
        jQuery("#mailReadArea").removeAttr("style");
        jQuery("#mainContent").removeClass("column_inline column_block").addClass("column_block");
        var listSize = getCookie("TL_V_H");

        listSize = (listSize) ? listSize : 200;
        var height = parseInt(listSize, 10) + 64;
        jQuery("#mail_list_content").height(height);
        jQuery("#xbar").draggable({
            containment: "parent", axis: "y", zIndex: 100, cursor: "n-resize", start: function (event, ui) {
                jQuery('<div class="splitterMask"></div>').insertAfter(jQuery(this));
            }, stop: function (event, ui) {
                jQuery('div.splitterMask').remove();
                _this.makeHorizonBar(jQuery(this), true);
            }
        });
        jQuery("#xbar").show();
        _this.makeHorizonBar(jQuery("#xbar"));
    };
    this.makeHorizonBar = function (obj, isMove) {
        var offsetHeight = parseInt(jQuery(obj).offset().top, 10);
        offsetHeight = (offsetHeight < 300) ? 300 : offsetHeight;
        jQuery(obj).css("top", "0px");
        var listOffsetTop = jQuery("#mainContent").offset().top;
        var mailBottomTop = jQuery("#mailBottom").offset().top - 10;
        var listSize = offsetHeight - listOffsetTop - 65;
        jQuery("#mail_list_content").height(listSize);
        jQuery("#mailReadArea").height(mailBottomTop - offsetHeight - 10).show();
        if (TABLET) {
            jQuery("#mailReadArea").css({
                "overflow": "scroll", "-webkit-overflow-scrolling": "touch"
            });
        }
        /*jQuery(window).resize(function() {
            mailBottomTop = jQuery("#mailBottom").offset().top-10;
            jQuery("#mailReadArea").height(mailBottomTop - offsetHeight-5);
        });*/
        jQuery("#mailViewContentWrap").css("height", (jQuery("#mailReadArea").height() - 77) + "px");

        jQuery(window).on('resize.mail', function () {
            mailBottomTop = jQuery("#mailBottom").offset().top - 10;
            jQuery("#mailReadArea").height(mailBottomTop - offsetHeight - 10);
        });
        setCookie("TL_V_H", listSize, 365);

        if (!isMove) {
            jQuery(window).trigger("resize");
        }
    };
    this.resizeMailEvent = function () {
        mailBottomTop = jQuery("#mailBottom").offset().top;
        var barHeight = mailBottomTop - 100;
        jQuery("#ybar").height((barHeight > 510) ? barHeight : 510);

        //클래식일때도 높이 확인해야함.
        var listContentHeight = mailBottomTop - 120 - 80;
        jQuery("#mail_list_content").height((listContentHeight > 430) ? listContentHeight : 430);
        var readHeight = mailBottomTop - 149;
        jQuery("#mailReadArea").height((readHeight > 500) ? readHeight : 500);


        var mainContentWidth = jQuery("#mainContent").width();
        var mailListWidth = jQuery("#mailListArea").outerWidth() + 1;
        var yBarWidth = jQuery("#ybar").outerWidth() + 1;
        var readWidth = mainContentWidth - mailListWidth - yBarWidth;

        jQuery("#mailReadArea").width(readWidth);
    };
    this.makeVerticalSplitter = function (init) {

        jQuery(window).off(".mail");
        resizeLeftMenu();
        jQuery("#xbar").draggable("destroy").hide();
        jQuery("#ybar").draggable("destroy").hide();
        jQuery("#mail_list_content").removeAttr("style");
        jQuery("#mailListArea").removeAttr("style");
        jQuery("#mailReadArea").removeAttr("style");
        jQuery("#mainContent").removeClass("column_inline column_block").addClass("column_inline");
        var leftMenuWidth = _this.getLeftMenuWidth();
        var offsetWidth = getCookie("TL_H_V");
        offsetWidth = (offsetWidth) ? offsetWidth : 830;
        var width = offsetWidth - leftMenuWidth;
        jQuery("#mailListArea").width(width);

        var $ybar = jQuery("#ybar");
        $ybar.draggable({
            containment: "parent", axis: "x", zIndex: 100, cursor: "e-resize", start: function (event, ui) {
            }, stop: function (event, ui) {
            }
        });
        $ybar.on("dragstart", function (event, ui) {
            jQuery('<div class="splitterMask"></div>').insertAfter(jQuery(this));
        });
        $ybar.on("dragstop", function (event, ui) {
            jQuery('div.splitterMask').remove();
            _this.makeVerticalBar(_this.getLeftMenuWidth(), _this.getVerticalBaroffsetWidth(), true);
        });
        $ybar.show();

        if (!init) {
            offsetWidth = _this.getVerticalBaroffsetWidth();
        }
        _this.makeVerticalBar(leftMenuWidth, offsetWidth, false);
    };
    this.makeVerticalBar = function (leftMenuWidth, offsetWidth, isMove) {
        var mailBottomTop = jQuery("#mailBottom").offset().top;
        var mainContentWidth = jQuery("#mainContent").width();
        var mailListWidth = offsetWidth - leftMenuWidth;
        if (offsetWidth > mainContentWidth - 100) {
            offsetWidth = offsetWidth - 100;
        }
        jQuery("#ybar").css("left", "0px");
        jQuery("#mailListArea").width(mailListWidth);


        var readWidth = mainContentWidth - mailListWidth - jQuery("#ybar").outerWidth();

        if (mainContentWidth <= 1000) {
            readWidth = 1000 - offsetWidth - 7;
        }

        jQuery("#mailReadArea").width(readWidth);
        //jQuery("#mailReadArea").css("left",offsetWidth - leftMenuWidth + jQuery("div.go_body").offset().left + 7);
        if (!isMove) {
            var barHeight = mailBottomTop - 100;
            jQuery("#ybar").height((barHeight > 510) ? barHeight : 510);
            var listContentHeight = mailBottomTop - 120 - 50;
            jQuery("#mail_list_content").height((listContentHeight > 430) ? listContentHeight : 430);
            var readHeight = mailBottomTop - 149;
            jQuery("#mailReadArea").height((readHeight > 500) ? readHeight : 500).show();
            if (TABLET) {
                jQuery("#mailReadArea").css({
                    "overflow": "scroll", "-webkit-overflow-scrolling": "touch"
                });
            }
        }

        jQuery(window).off('resize.mail');
        jQuery(window).on('resize.mail', this.resizeMailEvent);
        jQuery(window).trigger("resize");

        setCookie("TL_H_V", offsetWidth, 365);
    };
    this.getVerticalBaroffsetWidth = function () {
        //advanced 일때 div.go_body의 margin-left가 180px임.
        //classic과 advanced를 둘다 만족하기 위해 jQuery("div.go_body").offset().left 를 항상 빼줘야함.
        var offsetWidth = parseInt(jQuery("#ybar").offset().left - jQuery("div.go_body").offset().left, 10)
        offsetWidth = (offsetWidth < 700) ? 700 : offsetWidth;
        return offsetWidth;
    };
    this.getLeftMenuWidth = function () {
        var $leftMenuWrap = jQuery("#mailLeftMenuWrap");
        var leftMenuWidth = $leftMenuWrap.outerWidth();
        if ($leftMenuWrap.css("display") == "none") {
            leftMenuWidth = 0;
        }
        return leftMenuWidth;
    };
    this.getContentSplitterMode = function () {
        return this.contentSplitterMode;
    };
    
    if (!isPopupView()) {
        jQuery(window).on('resize.mail', this.resizeMailEvent);
    }
};

function mailHistoryCallBack(state) {
    var historyIndex = historyControl.getHistoryIndex();
    var data = state.data;
    if (data && data.param && historyIndex - 1 > data.state) {
        checkEscapeWriteMode(function () {
            switch (data.type) {
                case "list" :
                    var folderName = data.param.folder;
                    if (folderName != "Drafts") {
                        var mode = layoutControl.getContentSplitterMode();
                        mode = (mode) ? mode : "n";
                        layoutControl.contentSplitterChange(mode);
                    } else {
                        layoutControl.contentNormalSplitter();
                    }
                    mailControl.loadMessageList(data.param, true);
                    break;
                case "read" :
                    var folderName = data.param.folder;
                    if (folderName != "Drafts") {
                        var mode = layoutControl.getContentSplitterMode();
                        mode = (mode) ? mode : "n";
                        layoutControl.contentSplitterChange(mode);
                    } else {
                        layoutControl.contentNormalSplitter();
                    }
                    if (mode != "n") {
                        mailControl.loadMessageList(data.param, true);
                    }
                    mailControl.readMessage(data.param, true);
                    break;
                case "mdnlist" :
                    layoutControl.contentNormalSplitter();
                    mailControl.loadMdnList(data.param, true);
                    break;
                case "mdnread" :
                    layoutControl.contentNormalSplitter();
                    mailControl.loadMdnRead(data.param, true);
                    break;
            }
            ;
        }, function () {
            history.forward();
        });
    } else if (!data || !data.type) {
        var url = state.url;
        if (url.indexOf("app/mail?work=") > 0) {
            checkEscapeWriteMode(function () {
                history.back();
            }, function () {
                history.forward();
            });
        }
    }
}

var ReadSubMessageChecker = {
    currentUid: "", setCurrent: function (uid) {
        uid = getFolderNameId(uid);
        ReadSubMessageChecker.currentUid = uid;

        jQuery("#mail_list_content tr.choice input:checkbox[name=msgId]").each(function () {
            listCheckboxControl(jQuery(this), false);
        });
        listCheckboxControl(jQuery("#" + uid + " input:checkbox[name=msgId]"), true);
    }, resetUid: function () {
        ReadSubMessageChecker.currentUid = "";
    }, hasCurrentItem: function () {
        if (ReadSubMessageChecker.currentUid == "") return false;
        // { GO-26763 화면 분할시 메일의 노출여부를 체크박스 유무로 체크하던 로직을 화면 분할시 메일이 존재하면 보여주는 방식으로 변경함
        var bool = (jQuery("#" + ReadSubMessageChecker.currentUid + " td input:checkbox[name=msgId]").length > 0);
        if (!bool) {
            if (layoutMode != "n") {
                bool = true;
            }
        }
        return bool;
        // GO-26763}
    }
};

function checkSuccess(data) {
    if (data && data.isSuccess) {
        return true;
    } else {
        if (data && data.failMsg) {
            jQuery.goAlert(data.failMsg);
        }
        return false;
    }
};

function changeMailContainer(type) {
    mailMenuStatus = type;
    jQuery("#toolbar_wrap").show();
    type = (!type) ? "list" : type;
    if (type == "setting") {
        jQuery("#mainContentWrap").hide();
        jQuery("#mailSettingWrap").show();
    } else {
        if (type == "list") {
            if (layoutMode == "n") {
                jQuery("#mailReadArea").hide();
            }
            jQuery("#mailWriteArea").hide();
            jQuery("#mailSendArea").hide();
            jQuery("#mailListArea").show();
        } else if (type == "read") {
            if (layoutMode == "n") {
                jQuery("#mailListArea").hide();
            }
            jQuery("#mailWriteArea").hide();
            jQuery("#mailSendArea").hide();
            jQuery("#mailReadArea").show();

            if (TABLET) {
                jQuery("#mailReadArea").css({
                    "overflow": "scroll", "-webkit-overflow-scrolling": "touch"
                });
            }
        } else if (type == "write") {
            jQuery("#mailListArea").hide();
            jQuery("#mailReadArea").hide();
            jQuery("#mailSendArea").hide();
            jQuery("#mailWriteArea").show();
        } else if (type == "send") {
            jQuery("#toolbar_wrap").hide();
            jQuery("div[data-tag=write_toolbar_wrap]").hide();
            jQuery("#mailListArea").hide();
            jQuery("#mailReadArea").hide();
            jQuery("#mailWriteArea").hide();
            jQuery("#mailSendArea").show();
        }
        jQuery("#mailSettingWrap").hide();
        jQuery("#mainContentWrap").show();
    }
    jQuery(window).trigger("resize");
}

function getTextMessage() {
    contentValue = "";
    if (isMsie) {
        contentValue = window.textContentFrame.getContent();
    } else {
        contentValue = document.getElementById("textContentFrame").contentWindow.getContent();
    }
    return contentValue;
}

function getHtmlMessage(type) {
    var sendData = mailControl.getSendData();
    var isLetter = ("on" == sendData.letterMode);

    if (type == 'draft' || type == 'ascheck' || type == 'secure') {
        return editorControl.getEditorText();
    }

    if (!isLetter) {    // Without Letter Image
        var content = editorControl.getEditorText();
        var template = "";
        var wrapTerraceMsgTag = false;

        try {
            //메일본문이 TerraceMsg클래스를 가진 DIV태그로 감싸져 있으면 다시 감싸지 않는다.
            if ((jQuery(content).length == 1) && (jQuery(content).attr("class") == "TerraceMsg")) {
                wrapTerraceMsgTag = true;
            }
        } catch (err) {
            wrapTerraceMsgTag = false;
            console.warn("[DO] FAIL! Convert HTML string into Jquery Object");
        }

        if (editorControl.oEditor.options.name == "ActiveDesigner") {
            // IE8 호환을 위해 textarea에 mime string 을 넣는다.
            var textarea = document.createElement("textarea");
            textarea.appendChild(document.createTextNode(content));
            template = wrapTerraceMsgTag ? textarea.outerHTML : "<div class='TerraceMsg' data-content-type='MIME' data-editor='ActiveDesigner'>" + textarea.outerHTML + "</div>";
        } else {
            template = wrapTerraceMsgTag ? content : "<div class='TerraceMsg'>" + content + "</div>";
        }
        return template;
    } else {            // With Letter Image
        var headerPath = "{tims_letter_paper_header}";
        var bodyPath = "{tims_letter_paper_body}";
        var tailPath = "{tims_letter_paper_tail}";
        if (type == "preview") {
            var letterObj = sendData.letterData;
            headerPath = letterObj.header;
            bodyPath = letterObj.body;
            tailPath = letterObj.tail;
        }

        var pstr = "" + "<table width='600px' cellspacing='0' cellpadding='0'>" + "<tr><td style='line-height:0;'><img src='" + headerPath + "'/></td></tr>" + "<tr>" + "<td class='TerraceMsg' style='padding:10px 30px 0px 30px;' background='" + bodyPath + "'>" + editorControl.getEditorText() + "</td></tr>" + "<tr><td style='line-height:0;'><img src='" + tailPath + "'></td></tr>" + "</table>";
    }
    return pstr;
}

function getPopupData() {
    return POPUPDATA;
}

function checkEmailInvalidAddress(str) {
    var addr_array = getEmailArray(str);

    for (var i = 0; i < addr_array.length; i++) {
        var address = addr_array[i];
        address = jQuery.trim(address);
        if (address == "" || checkEmailFormat(address)) {
            continue;
        } else {
            jQuery.goMessage(mailMsg.alert_invalidaddress + "\"" + escape_tag(address) + "\"");
            return false;
        }
    }
    return true;
}

function useSearch(use) {
    if (use) {
        jQuery('section.combine_search').show();
    } else {
        jQuery('section.combine_search').hide();
    }
}

function isContainedTrashMail() {
    return jQuery("tr[folder=Trash] input:checked").length > 0;
}

function getMailListCheckedObj() {
    var obj;
    if (currentMenu == "read" && layoutMode == "n") {
        obj = jQuery("#messageListId");
    } else {
        obj = jQuery("#mail_list_content input[name=msgId]:checked");
    }
    return obj;
}

function getMailListCheckedCount() {
    return getMailListCheckedObj().length;
}

function getMailListCheckedIdArray() {
    var listArray = new Array();
    if (currentMenu == "read" && layoutMode == "n") {
        listArray.push(getMailListCheckedObj().val());
    } else {
        getMailListCheckedObj().each(function () {
            listArray.push(jQuery(this).closest("tr").attr("id"));
        });
    }
    return listArray;
}

function getMailListCheckedData(dataName) {
    var listArray = new Array();
    getMailListCheckedObj().each(function () {
        listArray.push(jQuery(this).data(dataName));
    });
    return listArray;
}

function getMailListCheckedValue() {
    var listArray = new Array();
    getMailListCheckedObj().each(function () {
        listArray.push(jQuery(this).val());
    });
    return listArray;
}

function getListProcessParams(midArray) {
    var uids = [];
    var fnames = [];

    for (var i = 0; i < midArray.length; i++) {
        var midIdx = midArray[i].lastIndexOf("_");
        var folderName = midArray[i].substring(0, midIdx);
        var uid = midArray[i].substring(midIdx + 1);
        uids[uids.length] = uid;
        if (isAllFolder) {
            fnames[fnames.length] = folderName;
        } else {
            fnames[0] = folderName;
        }
    }
    return {"uids": uids, "fnames": fnames};
}

function makeMailHeaderMessege(data) {
    mailControl.makeMailHeaderMsg(data);
}

function executeFolderInfo() {
    folderControl.updateFolderCountInfo();
}

function closeMailFolderOptionLayer() {
    jQuery("#mailFolderOptionLayer").remove();
}

function closeMailMoreFolderPopupLayer() {
    jQuery("#mail_more_folder_popup").remove();
}

function closeMailTagOptionLayer() {
    jQuery("#mailTagOptionLayer").remove();
}

function getTagInfo(tagId) {
    var tagList = folderControl.getTagData();
    if (tagList && tagList.length > 0) {
        for (var i = 0; i < tagList.length; i++) {
            if (tagList[i].id == tagId) {
                return tagList[i];
            }
        }
    }
    return null;
}

function isExistTagName(tagName, orgTagId) {
    var exist = false;
    var tagList = folderControl.getTagData();
    if (tagList && tagList.length > 0) {
        for (var i = 0; i < tagList.length; i++) {
            if (tagList[i].name == tagName && tagList[i].id != orgTagId) {
                exist = true;
                break;
            }
        }
    }
    return exist;
}

function makeDragEvent(obj) {
    jQuery(obj).draggable({
        helper: function () {
            var allCheck = ("on" == jQuery("#mailListAllCheck").val());
            var checkedCnt = getMailListCheckedCount();
            var dragText = "";
            if (allCheck) {
                dragText = mailMsg.allselect_003;
            } else if (checkedCnt > 0) {
                dragText = checkedCnt + mailMsg.mail_moremsg;
            } else {
                dragText = jQuery(this).find("span.subject").text();
            }
            var param = {"message": dragText};
            return getHandlebarsTemplate("mail_dnd_tmpl", param);
        }, appendTo: "#mailLeftMenuWrap", cursorAt: {top: 10, left: -5}, scroll: false
    });
}

function makeDropEvent(obj) {
    jQuery(obj).droppable({
        accept: "#mail_list_content tr:not(.tb_option,.dateDesc)",
        tolerance: "pointer",
        hoverClass: "dropClass",
        over: function (event, ui) {
            var dropType = jQuery(this).data("droptype");
            dropType = (dropType) ? dropType : "folder";
            var dragId = ui.draggable.attr("id");
            var param = getListProcessParams([dragId]);
            var folder = param.fnames[0];
            var allCheck = ("on" == jQuery("#mailListAllCheck").val());
            if (dropType == "folder") {
                var dropFolderName = jQuery(this).closest("a").attr("fname");
                if ((!isAllFolder && dropFolderName == folder) || (dropFolderName == "Sent" || dropFolderName == "Drafts" || dropFolderName == "Reserved")) {
                    return;
                }
            } else {
                if (allCheck) {
                    return;
                }
            }
            jQuery("#dragHelperIcon").removeClass("ic_disallow").addClass("ic_allow");
        },
        out: function (event, ui) {
            jQuery("#dragHelperIcon").removeClass("ic_allow").addClass("ic_disallow");
        },
        drop: function (event, ui) {
            var dropType = jQuery(this).data("droptype");
            dropType = (dropType) ? dropType : "folder";
            var dragId = ui.draggable.attr("id");
            var param = getListProcessParams([dragId]);
            var folder = param.fnames[0];
            var uid = param.uids[0];
            var allCheck = ("on" == jQuery("#mailListAllCheck").val());
            if (dropType == "folder") {
                var dropFolderName = jQuery(this).closest("a").attr("fname");
                if ((!isAllFolder && dropFolderName == folder) || (dropFolderName == "Sent" || dropFolderName == "Drafts" || dropFolderName == "Reserved")) {
                    return;
                }
                if (allCheck) {
                    allSelectAction("move", dropFolderName);
                } else {
                    var moveParam = {};
                    if (getMailListCheckedCount() > 0) {
                        var uidArray = getMailListCheckedIdArray();
                        var params = getListProcessParams(uidArray);
                        moveParam = {"fromFolders": params.fnames, "uids": params.uids, "toFolder": dropFolderName};
                    } else {
                        moveParam = {"fromFolders": [folder], "uids": [uid], "toFolder": dropFolderName};
                    }
                    mailControl.moveMessage(moveParam);
                }
            } else {
                if (allCheck) {
                    return;
                }
                var tagId = jQuery(this).closest("a").attr("val");
                var tagParam = {};
                if (getMailListCheckedCount() > 0) {
                    var uidArray = getMailListCheckedIdArray();
                    var params = getListProcessParams(uidArray);
                    tagParam = {"addFlag": "true", "tagId": tagId, "folderNames": params.fnames, "uids": params.uids};
                } else {
                    tagParam = {"addFlag": "true", "tagId": tagId, "folderNames": [folder], "uids": [uid]};
                }
                mailControl.taggingMessage(tagParam);
            }
        }
    });
}

function mailReadInit(data) {
    var msgContent = data.msgContent;
    var messageId = msgContent.folderEncName + "_" + msgContent.uid;
    ReadSubMessageChecker.setCurrent(messageId);
    if (msgContent.mdnCheck) {
        jQuery.goConfirm("", mailMsg.mail_mdn_response_confirm, function () {
            var param = {"folderName": msgContent.folderEncName, "uid": msgContent.uid};
            param = mailControl.getSharedFolderParam(param);
            mailControl.sendMdnResponse(param);
        });
    }
    var tagIdList = data.tagIdList;
    var readTagWrapObj = jQuery("#readTagWrap");
    if (tagIdList && tagIdList.length > 0) {
        var tagList = folderControl.getTagData();
        for (var i = 0; i < tagIdList.length; i++) {
            for (var j = 0; j < tagList.length; j++) {
                if (tagIdList[i] == tagList[j].id) {
                    var tagInfo = {"messageId": messageId, "tagInfo": tagList[j]};
                    readTagWrapObj.append(getHandlebarsTemplate("mail_read_tag_tmpl", tagInfo));
                    break;
                }
            }
        }

    }
    readRelationMessage();
}

function mailWriteInit(data) {
    var msgData = {"type": "write", "name": mailMsg.mail_write};
    mailControl.makeMailHeaderMsg(msgData);

    if (data.rcptMode == "searchaddr") {
        isRcptModeNormal = false;
        isRcptModeNoneAC = false;
    } else if (data.rcptMode == "noneac") {
        isRcptModeNoneAC = true;
        isRcptModeNormal = true;
    } else if (data.rcptMode == "normal") {
        isRcptModeNoneAC = false;
        isRcptModeNormal = true;
    }
    isSendInfoCheckUse = data.sendCheckConfig.sendCheckApply;
    isSendEmailCheckUse = data.sendCheckConfig.sendEmailCheck;
    isSendAttachCheckUse = data.sendCheckConfig.sendAttachCheck;
    sendAttachData = data.sendCheckConfig.sendAttachData;
    isSendKeywordCheckUse = data.sendCheckConfig.sendKeywordCheck;
    sendKeywordData = data.sendCheckConfig.sendKeywordData;
    sendAllowUsed = data.sendAllowUsed;
    sendConfirm = data.sendConfirm;
    if (isRcptModeNormal) {
        makeInputAddresskeyEvt("to");
        makeInputAddresskeyEvt("cc");
        makeInputAddresskeyEvt("bcc");
        if (!isRcptModeNoneAC) {
            var options = {
                "autoResizeWidth": true,
                "makeFormat": true,
                "makeFormatFunc": makeFormatUnit,
                "multiple": false,
                "width": "450px",
                "matchCase": true,
                "max": 15,
                "notContact": (USE_CONTACT == true ? "F" : "T")
            };
            jQuery("#to").autocomplete(mailControl.searchAddressAction, options);
            jQuery("#cc").autocomplete(mailControl.searchAddressAction, options);
            jQuery("#bcc").autocomplete(mailControl.searchAddressAction, options);
        }

        makeInputDropEvents("#toAddrWrap ul.name_tag, #ccAddrWrap ul.name_tag, #bccAddrWrap ul.name_tag");
        bindAddrAreaEvents("#toAddrWrap ul.name_tag, #ccAddrWrap ul.name_tag, #bccAddrWrap ul.name_tag");

    } else {
        jQuery("#writeRcptValue").keypress(function (event) {
            if (event.which == 13) {
                event.preventDefault();
                searchRcptAddress();
            }
        });
    }
    mailControl.getLastRcptList();

    makeInputAddressFormat("to", data.to);
    makeInputAddressFormat("cc", data.cc);
    makeInputAddressFormat("bcc", data.bcc);

    if (data.editorMode == "html") {
        makeEditorProcess(data);
    }

    //jQuery("#textContentFrame").attr("src","textContent.html");
    if (data.editorMode == "text" && notiMode == 'link') {
        jQuery("#receivenoti").attr("disabled", true);
    }

    MAX_ATTACH_SIZE = data.attachConfig.maxAttachSize;
    USE_BIGATTACH_MODE = data.attachConfig.useBigAttachMode;
    BIGATTACH_EXPIRE = data.attachConfig.bigAttachExpireDay;
    BIGATTACH_DOWNCNT = data.attachConfig.bigAttachDownCnt;
    today = new Date(Number(data.systemTime));
    BIGATTACH_TIMEZONE = data.attachConfig.bigAttachTimezone;
    BIGATTACH_EXPIRE_DATE = new Date(today.getTime() + ((parseInt(BIGATTACH_EXPIRE) - 1) * 24 * 60 * 60 * 1000));
    var quotausage = data.attachConfig.useBigAttachQuota;
    MAX_BIG_ATTACH_SIZE = data.attachConfig.maxBigAttachSize * 1024 * 1024;
    MAX_BIG_ATTACH_QUOTA = data.attachConfig.maxBigAttachQuota * 1024 * 1024;
    BIG_ATTACH_QUOTA = MAX_BIG_ATTACH_QUOTA - quotausage;
    BIG_ATTACH_QUOTA = (BIG_ATTACH_QUOTA < 0) ? 0 : BIG_ATTACH_QUOTA;
    var ctrType = USE_BIGATTACH_MODE ? "power" : "normal";

    var basicControlOpt = {
        controlType: ctrType,
        btnId: "basicUploadControl",
        btnCid: "basicUploadBtn",
        formName: "theFile",
        param: {"uploadType": "flash", "email": USER_EMAIL},
        url: "/api/mail/file/upload",
        maxFileSize: (1024 * 1024 * 2000),
        fileType: "*.*",
        locale: LOCALE,
        width: (LOCALE == "jp") ? 90 : 73,
        btnText: mailMsg.comn_file_select,
        debug: false,
        autoStart: false,
        handler: basicUploadListeners,
        listId: "basicUploadAttachList",
        startUploadFunc: startUploadAttach
    };

    var massControlOpt = {
        controlType: ctrType,
        btnId: "massUploadControl",
        btnCid: "massUploadBtn",
        formName: "theFile",
        param: {"uploadType": "flash", "email": USER_EMAIL},
        url: "/api/mail/file/upload",
        maxFileSize: (1024 * 1024 * 100),
        singleSelect: true,
        fileType: "*.txt",
        locale: LOCALE,
        width: (LOCALE == "jp") ? 90 : 73,
        btnText: mailMsg.comn_file_select,
        debug: false,
        autoStart: false,
        handler: {
            swfuploadLoaded: function (event) {
            }, fileQueued: function (event, file) {
                if (!isConfirmFile(file.type, "txt")) {
                    jQuery.goAlert(msgArgsReplace(mailMsg.error_nofileext, ["txt"]));
                    return;
                }

                jQuery(this).swfupload('startUpload');
            }, fileQueueError: function (event, file, errorCode, message) {
            }, fileDialogStart: function (event) {
            }, fileDialogComplete: function (event, numFilesSelected, numFilesQueued) {
            }, uploadStart: function (event, file) {

            }, uploadProgress: function (event, file, bytesLoaded) {
            }, uploadSuccess: function (event, file, serverData) {
                var name = file.name, size = (parseInt(file.size) / 1024).toFixed(2),
                    data = eval("(" + serverData + ")"),
                    fileItemTmp = ["<span class='item_file' file-path='" + data.filePath + "'>", "<span class='ic_file ic_txt'></span>", "<span class=''>" + name + "</span>", "<span class='size'>" + size + "KB" + "</span>", "<span class='btn_bdr'>", "<span class='ic_classic ic_del' title='" + mailMsg.comn_del + "'></span>", "</span>", "</span>"].join("");

                $fileItemTmp = jQuery(fileItemTmp);
                jQuery("#massFileItem").html($fileItemTmp);
                jQuery("#uploadActor").hide();
                $fileItemTmp.find("span.ic_del").on("click", function (e) {
                    jQuery(this).parents("span.item_file:first").remove();
                    jQuery("#uploadActor").show();
                });
            }, uploadComplete: function (event, file) {

            }, uploadError: function (event, file, errorCode, message) {
            }
        },
        listId: "basicUploadAttachList",
        startUploadFunc: startUploadAttach
    };

    //if (hasFlashPlayer()) {
    //basicAttachUploadControl = new UploadBasicControl(basicControlOpt);
    //massAttachUploadControl = new UploadBasicControl(massControlOpt);
    //} else {
    basicAttachUploadControl = new UploadSimpleBasicControl(basicControlOpt);
    if (hasFlashPlayer()) {
        massAttachUploadControl = new UploadBasicControl(massControlOpt);
    } else {
        massAttachUploadControl = new UploadSimpleBasicControl(massControlOpt);
    }
    //}

    if (USE_BIGATTACH_MODE) {
        jQuery("#bigattachBtn").show();
        jQuery("#bigattachMngBtn").show();
        var bigAttachInfoStr;
        if (data.attachConfig.useBigAttachDownCnt) {
            bigAttachInfoStr = msgArgsReplace(mailMsg.bigattach_15, [BIGATTACH_EXPIRE, BIGATTACH_DOWNCNT]);
        } else {
            bigAttachInfoStr = msgArgsReplace(mailMsg.bigattach_07, [BIGATTACH_EXPIRE]);
        }
        jQuery("#bigattachMessageSpan").html(bigAttachInfoStr);
    }
    var ocxQuota = mailMsg.mail_attach_normal_simple + " " + "<span id='ocx_normal_size' class='num'>0B</span>/<strong>" + MAX_ATTACH_SIZE + "MB</strong>" + "<span id='ocx_bigattach_size' style='display:none;'>, " + mailMsg.mail_attach_bigattach_simple + " " + "<span id='ocx_huge_size' class='num'>0B</span>/<strong id='ocx_huge_quota'>0B</strong></span>";
    jQuery("#att_ocx_quota_info").html(ocxQuota);

    var simpleQuota = mailMsg.mail_attach_normal_simple + " " + "<span id='basic_normal_size' class='current'>0B</span>/<strong>" + MAX_ATTACH_SIZE + "MB</strong>" + "<span id='basic_bigattach_size' style='display:none;'>, " + mailMsg.mail_attach_bigattach_simple + " " + "<span id='basic_huge_size' class='current'>0B</span>/<strong id='basic_huge_quota'>0B</strong></span>";
    jQuery("#att_simple_quota_info").html(simpleQuota);

    if (data.attachConfig.useBigAttachMode) {
        jQuery("#ocx_bigattach_size").show();
        jQuery("#basic_bigattach_size").show();
    }
    var checkOcxUpload = getCookie("OcxUpload") == 'on' ? true : false;
    if (activeXMake && activeXUse && isMsie) { //activeXUse 는 사용하지 않는것으로 보임.
        chgAttachMod("ocx", true);
    } else if (isMsie9) { //ie9일때 jquery업로드 전환버튼도 숨긴다. GO-29004
        chgAttachMod("ocx", true);
        jQuery("#crtBtnSimple").hide();
    } else if (isMsie && checkOcxUpload) { // GO-13903
        chgAttachMod("ocx", true);
    } else {
        chgAttachMod("simple", true);
        if (!hasFlashPlayer()) {
            jQuery("#massUploadControl").hide();
            jQuery("#massSimpleFileInit").show();
        }
    }

    massAttachUploadControl.init();
    massAttachUploadControl.makeBtnControl();

    if (USE_WEBFOLDER) {
        jQuery("#writeWebfolderBtn").show();
    }

    checkMassRcptToggleBtn(data.massRcptConfirm);

    mailControl.getSignList(makeSignListItem);
    if (data.useMailSender) {
        getMailUserSender();
    }

    if (data.bcc && data.bcc != "") {
        openWriteBccWrap();
    }

    setTimeout(function () {
        checkUploadfile(data.attaches);
        if (data.editorMode == "text") {
            jQuery("#signSelect").attr("disabled", true);
        }
    }, 1000);

    writeAutoSave = setTimeout(function () {
        runAutoSaveProcess();
    }, 5000);
}

function openShareFolderSettingLayer(folderName, func) {
    var folderNameArray = folderName.split(".");
    var lastFolderNameIndex = folderNameArray.length - 1;
    var shareFolderTitle = folderNameArray[lastFolderNameIndex];

    jQuery.goOrgSlide({
        header: shareFolderTitle,
        desc: mailMsg.mail_folder_share_msg,
        headerOption: '<input type="checkbox" id="orgShareFlag" checked="checked"/><label for="orgShareFlag">' + mailMsg.mail_folder_share_msg1 + '</label><div class="data_result"><ul id="orgDataWrap" class="name_tag" style="max-height:55px;overflow-y:auto;"></ul></div>',
        isOrgServiceOn: useOrgAccess,
        type: "node",
        callback: function (data) {
            if (jQuery("#orgMember_" + data.id).length > 0) {
                return;
            }
            makeShareFolderUser(data);
        },
        buttons: [{
            bclass: 'btn_major_s', btext: mailMsg.comn_confirm, callback: function () {
                var isSave = false;
                var nameListObj = jQuery("#orgDataWrap li span.name");

                if (jQuery("#orgShareFlag").attr("checked") && nameListObj.length != 0) {
                    isSave = true;
                }
                var folderUid = jQuery("#orgShareFlag").data("shareSeq");
                var param = {};
                var sharedUserSeq = [];
                var sharedDeptSeq = [];

                if (nameListObj.length == 0 && jQuery("#orgShareFlag").data("shareSeq") == null) {
                    jQuery.goOrgSlide.close();
                    return;
                }

                var isSelfTarget = false;
                nameListObj.each(function () {
                    if (jQuery(this).data("id") == SESSION_ID) {
                        isSelfTarget = true;
                        return false;
                    }
                    if (jQuery(this).data("type") == "org") {
                        sharedDeptSeq.push(jQuery(this).data("id"));
                    } else {
                        sharedUserSeq.push(jQuery(this).data("id"));
                    }
                });
                if (isSelfTarget) {
                    jQuery.goAlert(mailMsg.self_share_impossible);
                    return;
                }

                param.save = isSave;
                param.folderUid = folderUid;
                param.folderName = folderName;
                param.goSeq = true;
                param.sharedUserSeq = sharedUserSeq;
                param.sharedDeptSeq = sharedDeptSeq;


                folderControl.setSharringReaderList(param, func);
            }
        }],
        contextRoot: "/"
    });
}

function openDirectedApproverPopup() {
    jQuery.goOrgSlide({
        header: mailMsg.mail_directed_approver,
        desc: mailMsg.mail_folder_share_msg,
        headerOption: mailMsg.mail_approver_msg001,
        isOrgServiceOn: useOrgAccess,
        type: "node",
        callback: function (data) {
            var name = data.name;
            var email = data.email;
            var type = data.type;

            if (!("MEMBER" == type || "MODERATOR" == type || "MASTER" == type)) {
                jQuery("#customButtons0").attr("selected", null);
                jQuery.goAlert(mailMsg.mail_approver_msg004);
                return;
            }

            if (USEREMAIL == email) {
                jQuery("#customButtons0").attr("selected", null);
                jQuery.goAlert(mailMsg.mail_approver_msg002);
                return;
            }

            if (data.postion) {
                name += "/" + data.postion;
            }

            if (data.deptName) {
                name += "/" + data.deptName;
            }

            jQuery("#customButtons0").attr("selected", "selected");
            jQuery("#customButtons0").attr("data-address", name + " &lt;" + email + "&gt;");

        },
        buttons: [{
            bclass: 'btn_major_s', btext: mailMsg.comn_confirm, callback: function () {
                if ("selected" != jQuery("#customButtons0").attr("selected")) {
                    jQuery.goAlert(mailMsg.comn_error_001);
                    return;
                }

                var data = {};
                data.address = jQuery("#customButtons0").attr("data-address");

                makeDirectedApprover(data);
                jQuery.goOrgSlide.close();
            }
        }],
        contextRoot: "/"
    });

    var target = jQuery("#gpopupLayer");
    var left = (jQuery(window).width() - target.width()) / 2;
    var top = (jQuery(window).height() - target.height()) / 2;

    target.css("left", "156px");
    target.css("top", "178px");
}

function makeShareFolderUser(data) {
    var nameSpan = jQuery('<span id="" class="name" data-id="' + data.id + '" data-email="' + data.email + '"' + '" data-type="' + data.type + '"></span>')
        .attr("id", "orgMember_" + data.id).data("id", data.id).data("email", data.email).text(data.name + " " + ((!data.position) ? "" : data.position));
    var delWrap = jQuery('<span class="btn_wrap" title="' + mailMsg.comn_del + '"><span class="ic_classic ic_del"></span></span>').click(function () {
        jQuery(this).closest("li").remove();
    });
    jQuery("#orgDataWrap").append(jQuery("<li></li>").append(nameSpan).append(delWrap));
}

function makeDirectedApprover(data) {
    var nameSpan = jQuery("<span class='name'>" + data.address + "</span>");
    var delWrap = jQuery("<span class='btn_wrap'><span class='ic_classic ic_del' title='" + mailMsg.mail_attach_delete + "'></span></span>").click(function () {
        jQuery(this).closest("li").remove();
    });
    jQuery("#approverAddrWrap ul").append(jQuery("<li approver='" + data.address + "'></li>").append(nameSpan).append(delWrap));
}

function makeShareFolderInfo(data) {
    var list = data;
    if (list && list.length > 0) {
        var param = {};
        for (var i = 0; i < list.length; i++) {
            param = {};
            param.id = list[i].readerUserSeq;
            param.email = list[i].readerId;
            param.name = list[i].readerName;
            param.position = "";
            makeShareFolderUser(param);
        }
    }
}

function isPopupView() {
    return (CURRENT_PAGE_NAME == "popup");
}

function isReloadReady() {
    return isPopupView() && window.opener && (window.opener.reloadMessageList);
}

function getFolderType(folderName) {
    var folderType = "normal";
    if (folderName == "Inbox") {
        folderType = "inbox";
    } else if (folderName == "Sent") {
        folderType = "sent";
    } else if (folderName == "Drafts") {
        folderType = "drafts";
    } else if (folderName == "Reserved") {
        folderType = "reserved";
    } else if (folderName == "Spam") {
        folderType = "spam";
    } else if (folderName == "Trash") {
        folderType = "trash";
    } else if (folderName == "Quotaviolate") {
        folderType = "quotaviolate";
    }
    return folderType;
}

function checkListToolbarSelect() {
    if (currentMenu == "list" && getMailListCheckedCount() == 0) {
        jQuery.goAlert(mailMsg.mail_message_notselect);
        return false;
    }
    return true;
}

function selectCurrentFolderName(linkId) {
    jQuery("#leftMenuSectionWrap p.title").removeClass("on");
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

function isDefaultBoxCheck(mbox) {
    var mboxUpper = mbox.toUpperCase();
    if (mboxUpper == "INBOX" || mboxUpper == "SENT" || mboxUpper == "DRAFTS" || mboxUpper == "TRASH" || mboxUpper == "SPAM" || mboxUpper == "RESERVED" || mboxUpper == "QUOTAVIOLATE" || mbox == mailMsg.folder_inbox || mbox == mailMsg.folder_sent || mbox == mailMsg.folder_drafts || mbox == mailMsg.folder_reserved || mbox == mailMsg.folder_spam || mbox == mailMsg.folder_trash || mbox == mailMsg.folder_quotaviolate) {
        return true;
    }
    return false;
}

function isDefaultBox(fullName) {
    var mboxUpper = fullName.toUpperCase();
    if (mboxUpper == "INBOX" || mboxUpper == "SENT" || mboxUpper == "DRAFTS" || mboxUpper == "TRASH" || mboxUpper == "SPAM" || mboxUpper == "RESERVED" || mboxUpper == "QUOTAVIOLATE") {
        return true;
    } else {
        return false;
    }
}

function checkReserveTime(Y1, M1, d1, h1, m1, maxDay) {
    var dateB = new Date(Y1, M1 - 1, d1, h1, m1);
    dateB.setFullYear(Y1, M1 - 1, d1);
    dateB.setHours(h1);
    dateB.setMinutes(m1);
    var minTimeStamp = today.getTime() + (10 * 60 * 1000);
    var maxTimeStamp = today.getTime() + (maxDay * 24 * 60 * 60 * 1000);
    var selTimeStamp = dateB.getTime();

    if (selTimeStamp < minTimeStamp) {
        jQuery.goMessage(mailMsg.alert_minreserved);
        return false;
    }
    if (selTimeStamp > maxTimeStamp) {
        jQuery.goMessage(msgArgsReplace(mailMsg.alert_maxreserved, [maxDay]));
        return false;
    }
    return true;
}

function preventDrop() {
    var $body = jQuery('body');
    $body.bind('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.originalEvent.dataTransfer.dropEffect = 'none';
    });
    $body.bind('drop', function (e) {
        console.log('drop');
        e.preventDefault();
        e.stopPropagation();
    });
}

function resizeLeftMenu() {
    var func = function () {
        var footerOffsetTop = jQuery("#mailBottom").offset().top;
        var leftMenuOffsetTop = jQuery("#leftMenuSectionWrap").offset().top;
        var mailLeftMenuWrap = jQuery("#mailLeftMenuWrap").height();

        var gnbTitleHeight = jQuery("#mailLeftMenuWrap section.gnb_title").outerHeight();
        var writeBtnHeight = jQuery("#mailLeftMenuWrap section.function").outerHeight();
        var personalDataHeight = jQuery("#mailLeftMenuWrap section.personal_data").outerHeight();
        var organogramHeight = 50;
        if (USERSESSION.theme == "THEME_ADVANCED") {
            organogramHeight = 0;
        }

        //console.log(gnbTitleHeight + ":" + writeBtnHeight + ":" + personalDataHeight + ":" + organogramHeight);

        //130 , 60 스크롤
        //jQuery("#leftMenuSectionWrap").height(footerOffsetTop - leftMenuOffsetTop - 130);

        jQuery("#leftMenuSectionWrap").height(footerOffsetTop - gnbTitleHeight - writeBtnHeight - personalDataHeight - organogramHeight);

    };
    /*jQuery(window).resize(func);*/
    jQuery(window).on('resize.mail', func);
    jQuery(window).trigger("resize");
}

function hideAutoComplate() {
    jQuery("#to").unautocomplete();
    jQuery("#cc").unautocomplete();
    jQuery("#bcc").unautocomplete();
}

function recurrenceParser(code) {
    var temp = code.split(";");
    var tempParam = {};
    for (var i = 0; i < temp.length; i++) {
        var tempKey = temp[i].split("=");
        tempParam [tempKey[0]] = tempKey[1];
    }
    var humanizeFrequencyMsg = humanizeFrequency(tempParam);
    var intervalOptionMsg = humanizeIntervalOption(tempParam);
    var humanizeUntilMsg = humanizeUntil(tempParam);
    var humanizeCountMsg = humanizeCount(tempParam);
    return humanizeFrequencyMsg + " " + intervalOptionMsg + " " + humanizeUntilMsg + " " + humanizeCountMsg;
}

function humanizeFrequency(code) {
    var msg = "";
    switch (code.FREQ) {
        case "DAILY" :
            if (code.hasOwnProperty("INTERVAL")) {
                msg = msgArgsReplace(mailMsg.mail_calendar_recur_day, [code.INTERVAL]);
                //msg = code.INTERVAL + "일마다";
            } else {
                msg = mailMsg.mail_calendar_allday;
                //msg = "매일";
            }
            break;
        case "WEEKLY" :
            if (code.hasOwnProperty("INTERVAL")) {
                msg = msgArgsReplace(mailMsg.mail_calendar_recur_week, [code.INTERVAL]);
                //msg = code.INTERVAL + "주마다";
            } else {
                msg = mailMsg.mail_calendar_allweek;
                //msg = "매주";
            }
            break;
        case "MONTHLY" :
            if (code.hasOwnProperty("INTERVAL")) {
                msg = msgArgsReplace(mailMsg.mail_calendar_recur_month, [code.INTERVAL]);
                //msg = code.INTERVAL + "개월마다";
            } else {
                msg = mailMsg.mail_calendar_allmonth;
                //msg = "매월";
            }
            break;
        case "YEARLY" :
            if (code.hasOwnProperty("INTERVAL")) {
                msg = msgArgsReplace(mailMsg.mail_calendar_recur_year, [code.INTERVAL]);
                //msg = code.INTERVAL + "년마다";
            } else {
                msg = mailMsg.mail_calendar_allyear;
                //msg = "매년";
            }
            break;
    }
    ;
    return msg;
}

function humanizeIntervalOption(code) {
    var msg = "";
    if (code.hasOwnProperty("BYDAY")) {
        var temp = code.BYDAY.split(",");
        var DAY_STR = {
            "SU": mailMsg.mail_calendar_sunday,
            "MO": mailMsg.mail_calendar_monday,
            "TU": mailMsg.mail_calendar_tuesday,
            "WE": mailMsg.mail_calendar_wednesday,
            "TH": mailMsg.mail_calendar_thursday,
            "FR": mailMsg.mail_calendar_friday,
            "SA": mailMsg.mail_calendar_saturday
        };
        for (var i = 0; i < temp.length; i++) {
            var matched = /([0-9]*)(SU|MO|TU|WE|TH|FR|SA)?$/.exec(temp[i]);
            var nth = matched[1] ? matched[1] : undefined;
            var weekdayShort = DAY_STR[matched[2]];
            if (code.hasOwnProperty("BYSETPOS")) {
                nth = code.BYSETPOS;
            }
            if (nth == null) {
                msg += weekdayShort;
            } else {
                msg += msgArgsReplace(mailMsg.mail_calendar_recur_number, [nth, weekdayShort]);
                //msg += nth + "번째" + weekdayShort;
            }
            if (temp.length != (i + 1)) {
                msg += ", ";
            }
        }
    }
    if (code.hasOwnProperty("BYMONTHDAY")) {
        var temp = code.BYMONTHDAY.split(",");
        for (var i = 0; i < temp.length; i++) {
            msg += msgArgsReplace(mailMsg.mail_calendar_recur_day, [temp[i]]);
            //msg += temp[i] + "일";
            if (temp.length != (i + 1)) {
                msg += ", ";
            }
        }
    }
    if (code.hasOwnProperty("BYMONTH")) {
        var temp = code.BYMONTHDAY.split(",");
        for (var i = 0; i < temp.length; i++) {
            msg += msgArgsReplace(mailMsg.mail_calendar_recur_day, [temp[i]]);
            //msg += temp[i] + "일";
            if (temp.length != (i + 1)) {
                msg += ", ";
            }
        }
    }
    return msg;
}

function humanizeUntil(code) {
    var msg = "";
    if (code.hasOwnProperty("UNTIL")) {
        var mdate = moment(code.UNTIL, "YYYYMMDD");
        msg = msgArgsReplace(mailMsg.mail_calendar_recur_to, [mdate.format("YYYY-MM-DD")]);
        //msg = mdate.format("YYYY-MM-DD") + "까지";
    }
    return msg;
}

function humanizeCount(code) {
    var msg = "";
    if (code.hasOwnProperty("COUNT")) {
        msg = msgArgsReplace(mailMsg.mail_calendar_recur_count, [code.COUNT]);
        //msg = code.COUNT + "회";
    }
    return msg;
}

function securityCetnerFolderInfo() {
    if (securityCenter) {
        ActionLoader.getGoLoadAction("/api/security/mailfolder/list", null, function (data) {
            if (data && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].name == "Todo") {
                        jQuery("#leftMenuSectionWrap .security .approver").show();
                        jQuery("#leftMenuSectionWrap .security .num").text(data[i].count);
                        break;
                    }
                }
            }
        }, "json", function () {
        });
    }
}
