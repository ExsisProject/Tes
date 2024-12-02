var mailToolbarRuleMap = new HashMap();
mailToolbarRuleMap.put("normal", {
    "remove": true,
    "reply": true,
    "forward": true,
    "seen": true,
    "copy": true,
    "move": true,
    "resend": false
});
mailToolbarRuleMap.put("inbox", {
    "remove": true,
    "reply": true,
    "forward": true,
    "seen": true,
    "copy": true,
    "move": true,
    "resend": false
});
mailToolbarRuleMap.put("sent", {
    "remove": true,
    "reply": true,
    "forward": true,
    "seen": true,
    "copy": true,
    "move": true,
    "resend": true
});
mailToolbarRuleMap.put("drafts", {
    "remove": true,
    "reply": false,
    "forward": false,
    "seen": false,
    "copy": true,
    "move": true,
    "resend": false
});
mailToolbarRuleMap.put("reserved", {
    "remove": true,
    "reply": false,
    "forward": false,
    "seen": false,
    "copy": false,
    "move": false,
    "resend": false
});
mailToolbarRuleMap.put("spam", {
    "remove": true,
    "reply": true,
    "forward": true,
    "seen": true,
    "copy": true,
    "move": true,
    "resend": false
});
mailToolbarRuleMap.put("trash", {
    "remove": true,
    "reply": true,
    "forward": true,
    "seen": true,
    "copy": true,
    "move": true,
    "resend": false
});
mailToolbarRuleMap.put("all", {
    "remove": true,
    "reply": true,
    "forward": true,
    "seen": true,
    "copy": true,
    "move": true,
    "resend": false
});
mailToolbarRuleMap.put("shared", {
    "remove": false,
    "reply": true,
    "forward": true,
    "seen": false,
    "copy": true,
    "move": false,
    "resend": false
});
mailToolbarRuleMap.put("quotaviolate", {
    "remove": false,
    "reply": true,
    "forward": true,
    "seen": false,
    "copy": true,
    "move": false,
    "resend": false
});

var mailControl, folderControl, historyControl;
var currentFolderType, currentFolderName, currentFolderViewName, currentFolderEncName, isAllfolder, currentMenu;
var isBookmark = false;
var listType = "mail";
var bookmarkType = "mail";
var bookmarkSeq = 0;
var bookmarkName = "";
var bookmarkValue = "";
var isCallPreviewAttach = false;
var isMaxSendMailCountUse = false;
var maxSendMailCount = 0;
var isFirstLoad = false;
var sendConfirm = "";
var LOCAL_DOMAIN = "";

var toolBarMenus = {
    "전체선택": {
        id: "mail_toolbar_list_selectall",
        action: "mail-select-all",
        ignore: "on",
        text: mailMsg.mail_select_all
    },
    "전체선택_search": {
        id: "mail_toolbar_search_selectall",
        action: "mail-select-all",
        ignore: "on",
        text: mailMsg.mail_select_all
    },
    "삭제_list": {
        id: "mail_toolbar_list_delete",
        action: "mail-delete",
        text: mailMsg.menu_delete
    },
    "삭제_read": {
        id: "mail_toolbar_read_delete",
        action: "mail-delete",
        text: mailMsg.menu_delete
    },
    "읽음": {
        selectId: "toolbar_seen_flag",
        menu: "seen",
        role: "change-flag-seen",
        text: mailMsg.menu_flag_read
    },
    "안읽음": {
        selectId: "toolbar_seen_flag",
        menu: "seen",
        role: "change-flag-unseen",
        text: mailMsg.menu_flag_unread
    },
    "이동": {
        id: "mail_toolbar_list_move",
        action: "move-message-page",
        text: mailMsg.menu_move
    },
    "태그": {
        id: "mail_toolbar_list_tag",
        action: "tag-message-page",
        text: mailMsg.folder_tag
    },
    "전체답장_read": {
        title: mailMsg.mail_thismessage,
        id: "mail_toolbar_read_replyall",
        action: "mail-reply-all",
        text: mailMsg.menu_replyall,
        inMoreBtn: true
    },
    "스팸이동": {
        id: "mail_toolbar_spam_move",
        action: "mail_spam_move",
        text: mailMsg.menu_conf_spam + mailMsg.comn_move,
        inMoreBtn: true
    },
    "이동_read": {
        title: mailMsg.mail_thismessage,
        id: "mail_toolbar_read_move",
        action: "move-message-page",
        text: mailMsg.mail_folder_move,
        inMoreBtn: true
    },
    "태그_read": {
        title: mailMsg.mail_thismessage,
        id: "mail_toolbar_read_tag",
        action: "tag-message-page",
        text: mailMsg.folder_tag,
        inMoreBtn: true
    },
    "안읽음_read": {
        title: mailMsg.mail_thismessage,
        action: "change-flag-unseen",
        text: mailMsg.menu_flag_unread,
        inMoreBtn: true
    },
    "이전": {
        id: "read_pre_message_btn",
        action: "read-pre-message",
        text: mailMsg.comn_page_up,
        inMoreBtn: true
    },
    "다음": {
        id: "read_next_message_btn",
        action: "read-next-message",
        text: mailMsg.comn_page_down,
        inMoreBtn: true
    },
    "답장": {
        id: "mail_toolbar_read_reply",
        action: "mail-reply",
        text: mailMsg.menu_reply
    },
    "전달": {
        id: "mail_toolbar_read_forward",
        action: "mail-forward",
        text: mailMsg.menu_forward
    }

};
jQuery(document).ready(function () {


    initLayoutSize();
    initMailFunction();

    isFirstLoad = true;

    makeTopMenuTitle(MAIL_APP_NAME);
    if (workAction == "error") return;

    var workStatus = false;
    if (workAction == "write") {
        jQuery("#mailHomeToolbarWrap").hide();
        workStatus = true;
        var param = {};
        if (writeToList) {
            param.to = unescape_tag_title(writeToList);
        }
        param.init = true;
        goWrieLoad(param);
    } else if (workAction == "read") {
        if (isNotFoundError == "true") {
            alert(mailMsg.mail_sid_not_found_alert);
            gotoMailHome(true);
        }
        if (workFolder && workFolder != "" && workUid && Number(workUid) > 0) {
            workStatus = true;
            readMessage(unescape_tag_title(workFolder), workUid);
        }
    }
    if (!workStatus) {
        gotoMailHome(true);
    }
    folderControl.getFolderAllInfo();
    folderControl.getBookmarkInfo();

    pageDone();
    changeStatusBarColor(false);
    displayHomeIcon();
});

window.moveTab = function () {
    isMoveTabReturn();
    if (checkEscapeWriteMode()) {
        isMoveTab();
    }
};

var FolderControl = function () {
    var _this = this;
    this.folderInfoAction = "/api/mail/folder/info";
    this.folderAllInfoAction = "/api/mail/folder/all";
    this.emptyFolderAction = "/api/mail/folder/empty";
    this.bookmarkListAction = "/api/mail/bookmark/list";
    this.defaultFolders = [];
    this.userFolderList = [];
    this.tagData = [];
    this.Iscroll = null;

    this.getFolderAllInfo = function () {
        var param = {};
        ActionLoader.getGoLoadAction(this.folderAllInfoAction, param, function (data) {
            _this.printFolderAllInfo(data);
        }, "json");
    };
    this.printFolderAllInfo = function (data) {
        _this.printFolderInfo(data);
        _this.makeTagList(data.userTags);
        _this.makeSharedFolderList(data.userSharedFolderList);
        //selectedMailMenu(); TODO 현재 선택된 메일함
    };
    this.printFolderInfo = function (data) {
        _this.makeDefaultFolder(data.defaultFolders);
        _this.makeUserFolder(data.userFolders);
        _this.printFolderCountUpdateBookmark(data.defaultFolders);
        _this.printFolderCountUpdateBookmark(data.userFolders);
        _this.quotaInfo = data.quotaInfo;
    };
    this.makeDefaultFolder = function (folderList) {
        this.defaultFolders = folderList;
        var isOuotaOverExist = false;
        if (folderList && folderList.length > 0) {
            for (var i = 0; i < folderList.length; i++) {
                var folder = folderList[i];
                if (folder.fullName == "Quotaviolate") {
                    isOuotaOverExist = true;
                }
                var unseenArea = jQuery("#" + folder.id + "_num");
                unseenArea.empty();

                if (folder.fullName != "Sent" && folder.unseenCnt > 0) {
                    unseenArea.text(folder.unseenCnt);
                }
            }
        }
        if (isOuotaOverExist) {
            jQuery("#folder_quotaviolate").show();
        } else {
            jQuery("#folder_quotaviolate").hide();
        }
    };
    this.makeUserFolder = function (folderList) {
        this.userFolderList = folderList;
        folderList.isInbox = true;
        jQuery("#inbox_folder_area").handlebars("mail_user_folder_tmpl", folderList);

        folderList.isInbox = false;
        jQuery("#uf_folder_area").handlebars("mail_user_folder_tmpl", folderList);

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
    this.makeTagList = function (data) {
        _this.tagData = data;
        jQuery("#mail_tag_list_area").handlebars("mail_tag_tmpl", data);
    };
    this.getBookmarkInfo = function () {
        ActionLoader.getGoLoadAction(this.bookmarkListAction, null, function (data) {
            jQuery("#mail_bookmark_list").handlebars("mail_bookmark_tmpl", data);
        }, "json");
    };
    this.updateFolderCountInfo = function () {
        var param = {};
        ActionLoader.getGoLoadAction(this.folderInfoAction, param, function (data) {
            _this.printFolderCountUpdate(data);
            _this.printFolderCountUpdateBookmark(data);
        }, "json");
    };
    this.printFolderCountUpdate = function (data) {
        var folderList = data;
        if (folderList && folderList.length > 0) {
            for (var i = 0; i < folderList.length; i++) {
                var folder = folderList[i];
                var unseenArea = jQuery("#" + folder.id + "_num");
                unseenArea.empty();

                if (folder.fullName != "Sent" && folder.unseenCnt > 0) {
                    unseenArea.text(folder.unseenCnt);
                }
                if (folder.child && folder.child.length > 0) {
                    _this.printFolderCountUpdate(folder.child);
                }
            }
        }
    };
    this.printFolderCountUpdateBookmark = function (folderList) {
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
                            unseenArea.text(folder.unseenCnt);
                        }
                    }
                });
                if (folder.child && folder.child.length > 0) {
                    _this.printFolderCountUpdateBookmark(folder.child);
                }
            }
        }
    };
    this.emptyMailFolder = function (param) {
        ActionLoader.postGoLoadAction(this.emptyFolderAction, param, function (data) {
            if (param.folderName == currentFolderName) {
                mailControl.reloadMessageList();
            } else {
                executeFolderInfo();
            }
        }, "json");
    };
    this.getQuotaInfo = function () {
        return this.quotaInfo;
    };
    this.getTagData = function () {
        return this.tagData;
    };
    this.getDefaultFolderList = function () {
        return this.defaultFolders;
    };
    this.getUserFolderList = function () {
        return this.userFolderList;
    };
    this.makeMailEvent = function () {
        //클릭이벤트 처리

        //왼쪽메뉴 이벤트
        jQuery("#mail_folder_side").on("tap", "a", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            event.preventDefault();

            if (type == "folder") {
                var folder = jQuery(this).attr("fname");
                goFolder(folder);
            } else if (type == "empty-spam-folder") {
                emptyFolder("Spam");
            } else if (type == "empty-trash-folder") {
                emptyFolder("Trash");
            } else if (type == "tag-message") {
                var param = {"folder": "all", "listType": "tag", "tagId": jQuery(this).attr("val")};
                goMailList(param);
            } else if (type == "bookmark-execute") {
                var dataLi = jQuery(this).closest("li");
                var bookmarkType = dataLi.attr("type");
                var bookmarkQuery = dataLi.attr("query");
                var bookmarkSeq = dataLi.attr("seq");
                bookmarkExecute(bookmarkSeq, bookmarkType, bookmarkQuery);
            } else if (type == "folder-execute") {
                var ftype = jQuery(this).attr("type");
                folderExecute(ftype);
            } else if (type == "receive-noti-list") {
                loadMdnList();
            } else if (type == "shared-folder") {
                var folder = jQuery(this).attr("fname");
                var userSeq = jQuery(this).attr("seq");
                goSharedFolder(folder, userSeq);
            } else if (type == "move-security-center") {
                var url = jQuery(this).attr("evt-data-url");
                executeExtUrl(url);
            }
        });

        jQuery(window).on("orientationchange", function () {
            window.orientationChangeListener();
        });

        window.orientationChangeListener = function () {
            if (console) console.log("orientationchange");
            setTimeout(function () {
                var isSideShow = jQuery('#mail_folder_side').css('display') === 'none' ? false : true;
                folderControl.setBodyHeight(isSideShow);
                folderControl.setSideHeight();
                if (folderControl.Iscroll) folderControl.Iscroll.refresh();
            }, 1000);
        };
    };

    this.setSideHeight = function () {
        var sideEl = jQuery("#mail_folder_side");
        var headerEl = jQuery("header div.nav");
        var windowHeight = jQuery(window).height();
        var height = windowHeight - headerEl.height();
        sideEl.css({
            height: height
        });
    };

    this.setBodyHeight = function (isSideShow) {
        var bodyEl = jQuery("#go_body");
        if (isSideShow) {
            bodyEl.height(jQuery(window).height() - jQuery("header").height());
        } else {
            bodyEl.height('auto');
        }
    };

    this.makeLeftMenuIscroll = function () {
        if (this.Iscroll) {
            this.Iscroll.refresh();
        } else {
            this.Iscroll = new IScroll('#mail_folder_side', {
                bounce: true,
                scrollbars: true
            });
        }
    };
};

var MailControl = function () {
    var _this = this;
    this.offset = 20;
    this.listAction = "/api/mail/message/list";
    this.readAction = "/api/mail/message/read";
    this.writeAction = "/api/mail/message/write";
    this.sendAction = "/api/mail/message/send";
    this.mdnListAction = "/api/mail/message/mdn/list";
    this.mdnReadAction = "/api/mail/message/mdn/read";
    this.deleteMdnAction = "/api/mail/message/mdn/delete";
    this.recallMessageAction = "/api/mail/message/mdn/recall";
    this.sendMdnResponseAction = "/api/mail/message/mdn/send";
    this.deleteMessageAction = "/api/mail/message/delete";
    this.switchFlagAction = "/api/mail/message/flag";
    this.searchAddressAction = "/api/mail/address/search/name";
    this.copyMessageAction = "/api/mail/message/copy";
    this.moveMessageAction = "/api/mail/message/move";
    this.writeAddrSelectAction = "/api/contact/contacts";
    this.writeAddrSearchAction = "/api/contact/search";
    this.deptSelectAction = "/api/department/list/joined";
    this.companySelectAction = "/api/contact/companyfolder/manage";
    this.writeAttachAction = "/api/file";
    this.signListAction = "/api/mail/setting/sign/list";
    this.taggingMessageAction = "/api/mail/message/tag";
    this.isMailAttachSearchAction = "/api/system/mailattachsearch";
    this.viewFolderAction = "/api/webfolder/folder/list";
    this.webfolderAttachWriteAction = "/api/webfolder/mail/attach/write";
    this.viewShareFolderAction = "/api/webfolder/folder/tree?type=share";

    this.listMode = "mail";
    this.listParam = {};
    this.readParam = {};
    this.writeParam = {};
    this.writeData = {};
    this.sendData = {};
    this.addrParam = {};
    this.sharedFlag = false;
    this.currentFolder = "Inbox";
    this.nextPage = 1;
    this.addrNextPage = 1;
    this.lastPage = 1;
    this.preNavi = {};
    this.nextNavi = {};
    this.Iscroll = null;
    this.selectedMailId = null;
    this.pageNo = null;
    this.dataSet = {};
    this.searchInfo = {};
    this.depts = [];
    this.users = [];
    this.selectedNodes = [];
    this.isMultiSite = false;
    this.webFolderParamHistoryList = [];
    this.currentWebFolderInfo = {};

    this.isMailAttachSearch = function () {
        var attachSearch = false;
        ActionLoader.getSyncGoLoadAction(this.isMailAttachSearchAction, null, function (data) {
            attachSearch = data;
        }, "json");
        return attachSearch;
    };

    this.getSearchList = function (param, callback) {
        _this.searchInfo.param = param;
        ActionLoader.postSyncGoJsonLoadAction(this.listAction, param, function (data) {
            _this.searchInfo.pageInfo = data.pageInfo;
            if (typeof callback == "function") {
                callback(data);
            }
        }, "json");
    };

    this.initSearchInfo = function () {
        this.searchInfo = {};
    };

    this.preventBodyScroll = function () {
        jQuery('body').addClass('scroll_fix');
    };

    this.searchResultSetHeight = function () {
        var resultWrapHeight = jQuery(window).height() - jQuery('#searchNav').outerHeight(true);
        jQuery('#searchDetail').css('height', resultWrapHeight + 'px');
    };

    this.searchLayerInitScroll = function () {
        jQuery('#searchDetail').off('scroll.searchLayer');
        jQuery('#searchDetail').on('scroll.searchLayer', jQuery.proxy(this.detectSearchScroll, this));
    };

    this.detectSearchScroll = function (e) {
        var currentTargetHeight = jQuery(window).height();
        var end = jQuery('#searchResultWrap').height();
        var scrollTop = jQuery(e.currentTarget).scrollTop();
        var scrollHeight = end - currentTargetHeight - 10;
        var isScrollBottom = (scrollTop - scrollHeight) >= jQuery('#searchNav').outerHeight(true);
        if (isScrollBottom) {
            if (_this.searchInfo.pageInfo.lastPage) {
                return;
            }
            moreSearchList(_this.searchInfo);
        }
    };

    this.detectScroll = function (e) {
        var scrollTop = jQuery(e.currentTarget).scrollTop();
        var isBottom = parseInt(scrollTop) >= (jQuery(document).height() - jQuery(window).height() - 60);
        var isMultiplePages = _this.lastPage !== 1;
        if (isMultiplePages && isBottom) {
            this.appendRenderAboveList();
        }
        if (scrollTop === 0) {
            jQuery("#main_content").empty();
            if (this.pageNo === 0) {
                return false;
            }
            this.selectedMailId = null;
            this.pageNo = 1;
            this.dataFetch(this.pageNo);
            jQuery("#mailHomeToolbarWrap").show();
            jQuery("#mailListToolbarWrap").hide();
        }
    };

    this.getSharedFolderList = function () {
        ActionLoader.getSyncGoLoadAction(this.viewShareFolderAction, {}, function (result) {
            jQuery("#webFolderDirectory option[data-type=share]").remove();
            _.each(result.webfolder, function (folder) {
                jQuery("#webFolderDirectory").append("<option data-type='share' data-sroot='" + folder.sroot + "' data-full-path='" + folder.fullName + "' data-userseq='" + folder.mailUserSeq + "' >" + folder.name + "</option>");
            });
        }, "json");
    };

    this.fetchWebFolderList = function (param) {
        var pageInfo = _this.currentWebFolderInfo.pageInfo;
        if (!_.isUndefined(pageInfo)) {
            if (pageInfo.lastPage) {
                return;
            }
            param = _.extend(param, {currentPage: pageInfo.page + 1});
        }

        ActionLoader.getSyncGoLoadAction(this.viewFolderAction, param, function (result) {
            _this.currentWebFolderInfo.pageInfo = result.pageInfo;
            _this.renderWebFolderList(result);
            _this.renderWebFolderHeader(result);
        }, "json");
    };

    this.renderWebFolderHeader = function (result) {
        jQuery("div.webFolderHeader:visible").attr({
            "data-path": result.path,
            "data-userseq": result.userSeq,
            "data-sroot": result.sroot,
            "data-type": result.type
        });
    };

    this.renderWebFolderList = function (tmplData) {
        if (_this.currentWebFolderInfo.pageInfo.firstPage) {
            jQuery("#webfolder_list").empty();
        } else {
            tmplData.folders = [];
        }

        if (tmplData.total === 0 && tmplData.folders.length === 0) {
            var tmpl = '<li class="creat data_null"><span class="txt">' + mailMsg.webfolder_file_empty_title + '</span></li>';
            jQuery("#webfolder_list").append(tmpl);
        }
        jQuery("#webfolder_list").append(getHandlebarsTemplate("webfolder_content_tmpl", tmplData));
        jQuery("#webfolder_content").show();
    };

    this.detectWebFolderListScroll = function (e) {
        var currentTargetHeight = jQuery(e.currentTarget).height();
        var end = jQuery('.go_wrap').height();
        var scrollTop = jQuery(e.currentTarget).scrollTop();
        var scrollHeight = end - currentTargetHeight;
        if (scrollTop - scrollHeight > -1) {
            _this.fetchWebFolderList(_this.currentWebFolderInfo.param);
        }
    };

    this.resetCheckedWebFolder = function (e) {
        jQuery("#mailWebFolderSelectToolbarWrap").hide();
        jQuery("#webfolder_list input[type=checkbox]").prop("checked", false);
        jQuery("#select-all").text(mailMsg.mail_select_all);
    };

    this.loadMessageList = function (param, escapeHistory, isInit) {
        progressAction({"action": true});
        if (param) {
            if (param.folder && param.folder != "") {
                this.currentFolder = param.folder;
            }
            if (param.sharedFlag && param.sharedFlag == "shared") {
                this.sharedFlag = true;
            } else {
                this.sharedFlag = false;
            }
        } else {
            param = {};
        }
        this.listParam = param;
        param.init = isInit;
        this.dataSet = param;
        ActionLoader.postSyncGoJsonLoadAction(this.listAction, param, _this.printMessageList, "json");
        jQuery(window).off('scroll.renderNewPage');
        jQuery(window).on('scroll.renderNewPage', jQuery.proxy(this.detectScroll, this));
        google.sendPageView(this.listAction);
        if (!escapeHistory) historyControl.setHistory({"type": "list", "param": param});
    };
    this.printMessageList = function (data) {
        _this.selectedMailId = _.isNull(sessionStorage.getItem("SELECTED-DOC-ID")) ? null : sessionStorage.getItem("SELECTED-DOC-ID");
        _this.pageNo = _.isNull(sessionStorage.getItem("PAGE-NO")) ? 1 : parseInt(sessionStorage.getItem("PAGE-NO"));
        sessionStorage.removeItem("SELECTED-DOC-ID");
        sessionStorage.removeItem("PAGE-NO");
        _this.dataSet["folder"] = _this.listParam.folder;
        _this.dataSet["init"] = _this.listParam.init;
        changeMailContainer("list");
        _this.lastPage = data.total <= 20 ? 1 : Math.ceil(data.total / 20);
        _this.listMode = "mail";
        currentMenu = "list";
        _this.nextPage = 1;
        currentFolderType = data.folderType;
        currentFolderName = data.folderFullName;
        currentFolderViewName = data.folderName;
        currentFolderEncName = data.folderEncName;
        isAllFolder = (currentFolderType == "all") ? true : false;
        isBookmark = data.bookmark;
        listType = data.listType;
        bookmarkSeq = data.bookmarkSeq;
        bookmarkType = data.bookmarkType;
        bookmarkName = currentFolderViewName;
        bookmarkValue = currentFolderName;

        if (data.extFolder == "on") {
            bookmarkType = data.extType;
            bookmarkValue = bookmarkType;
        }
        var headerMsgData = {};
        headerMsgData.isList = true;
        headerMsgData.search = data.search;
        headerMsgData.name = data.folderName;
        headerMsgData.bookmarkSeq = data.bookmarkSeq;
        headerMsgData.bookmarkType = bookmarkType;
        headerMsgData.bookmarkValue = bookmarkValue;
        headerMsgData.isBookmark = isBookmark;
        headerMsgData.isAllFolder = isAllFolder;
        headerMsgData.flag = data.flag;
        headerMsgData.extFolder = data.extFolder;
        headerMsgData.extType = data.extType;
        headerMsgData.folderType = data.folderType;
        if (listType == "tag") {
            bookmarkValue = data.tagId;
            var tagInfo = getTagInfo(bookmarkValue);
            headerMsgData.type = "tag";
            headerMsgData.tagInfo = tagInfo;
        }
        jQuery("#main_content").empty();
        if (_this.pageNo >= 2) {
            _this.dataSet['offset'] = _this.offset * (parseInt(_this.pageNo));
            _this.pageNo = 1;
            _this.dataFetch(_this.pageNo);
        } else {
            _this.dataSet['offset'] = _this.offset;
            _this.makeMailListContent(data);
        }
        _this.scrollToEl();
        progressAction({"action": false});
        _this.makeListToolbar(headerMsgData);

        if (!isFirstLoad) {
            executeFolderInfo();
        }
        isFirstLoad = false;
        changeStatusBarColor(false);
        if (_this.isBiggerStyle()) {
            jQuery("#main_content").removeClass("content_detail");
        }
    };
    this.scrollToEl = function () {
        if (_this.selectedMailId == null) {
            return false;
        }
        var _selectedMailId = JSON.parse(this.selectedMailId);
        var el = jQuery("li").find('a[data-list-id="' + _selectedMailId.listId + '"]').closest('li');
        if (el.length == 0) return;
        var offset = el.offset().top - jQuery('#mailHomeToolbarWrap').outerHeight(true);
        jQuery('html').animate({scrollTop: offset}, 10);
    };
    this.appendRenderAboveList = function () {
        if (_this.dataSet['offset'] > _this.offset) {
            _this.pageNo = _this.dataSet['offset'] / _this.offset;
            _this.dataSet['offset'] = _this.offset;
        }
        if (_this.lastPage === _this.pageNo) {
            return;
        }
        _this.pageNo = _this.pageNo + 1;
        _this.dataFetch(_this.pageNo);
    };
    this.dataFetch = function (cPage) {
        _this.dataSet['page'] = cPage;
        if (this.listMode === "mail") {
            ActionLoader.postSyncGoJsonLoadAction(this.listAction, this.dataSet, _this.makeMailListContent, "json");
        } else {
            //수신확인
            ActionLoader.postSyncGoLoadAction(this.mdnListAction, this.dataSet, _this.makeMailMdnListContent, "json");
        }
    };
    this.makeListHeader = function (data) {
        jQuery("#mail_header .mailHeaderWrap").hide();
        jQuery("#mail_list_header").show();
        jQuery("#search_back_btn").hide();
        jQuery("#toggle_folder_side_btn").show();
        jQuery("#mail_refresh_btn").show();
        if (data.bookmarkSeq > 0) {
            var type = data.type;
            var bookmarkType = data.bookmarkType;
            if (type == "tag") {
                jQuery("#header_title_wrap").hide();
                jQuery("#header_tag_color").removeClass().addClass("ic_tag " + data.tagInfo.color);
                jQuery("#header_tag_name").text(data.tagInfo.name);
                jQuery("#header_tag_title_wrap").show();
            } else {
                jQuery("#header_tag_title_wrap").hide();
                var headerMsg = mailBookmarkName(bookmarkType, data.name);
                jQuery("#header_title_wrap").text(headerMsg).show();
            }
        } else {
            if (data.type == "tag") {
                jQuery("#header_title_wrap").hide();
                jQuery("#header_tag_color").removeClass().addClass("ic_tag " + data.tagInfo.color);
                jQuery("#header_tag_name").text(data.tagInfo.name);
                jQuery("#header_tag_title_wrap").show();
            } else {
                jQuery("#header_tag_title_wrap").hide();
                var headerMsg = "";
                if (data.isAllFolder) {
                    if (data.search) {
                        headerMsg = mailMsg.mail_search_result;
                        jQuery("#mail_refresh_btn").hide();
                        jQuery("#search_back_btn").show();

                    } else {
                        if (data.extFolder == "on") {
                            headerMsg = mailBookmarkName(data.extType, "");
                        }
                    }
                } else {
                    headerMsg = data.name;
                }
                jQuery("#header_title_wrap").text(headerMsg).show();
            }
        }
    };
    this.makeMenuItemTemplate = function (toolBarLayout, menu) {
        var html = [];

        if (this.isSelectType(menu)) {
            html = this._makeSelectTemplate(toolBarLayout, html, menu);
        } else {
            html = this._makeButtonTemplate(html, menu);
        }
        return html.join('');
    };

    this.isSelectType = function (menu) {
        return menu.selectId != undefined;
    };

    this._makeSelectTemplate = function (toolBarLayout, html, menu) {
        var selectBox = toolBarLayout.find("#" + menu.selectId);
        if (selectBox.length > 0) {
            selectBox.append('<li><a href="javascript:;" evt-act="' + menu.role + '" evt-rol="toolbar"><span>' + menu.text + '</span></a></li>');
        } else {
            html.push('<li><div class="btn_submenu">');
            html.push('<a href="javascript:;" class="btn_tool" data-role="button" evt-rol="toolbar" sub="on" menu="' + menu.menu + '">');
            html.push('\n');
            if (menu.title == undefined) {
                html.push('<span class="txt">' + menu.text + '</span>');
            } else {
                html.push('<span class="txt">' + menu.title + '</span>');
            }
            html.push('\n');
            html.push('<span class="ic_cmm ic_dropdown_small"></span>');
            html.push('</a>');
            html.push('<div class="array_option" style="width:110px;display:none;">');
            html.push('<ul id="' + menu.selectId + '" class="array_type">');
            html.push('<li><a href="javascript:;" evt-act="' + menu.role + '" evt-rol="toolbar"><span>' + menu.text + '</span>');
            html.push('</a></li>');
            html.push('</div></li>');
        }
        return html;
    };

    this._makeButtonTemplate = function (html, menu) {
        var btnClass = "";//menu.cls == undefined ? "btn_tool" : "btn_tool" + menu.cls;
        var role = menu.role == undefined ? "toolbar" : menu.role;
        if (menu.ignore == "on") {
            html.push('<li><a href="javascript:;" class="' + btnClass + '" data-role="button" id="' + menu.id + '" evt-rol="' + role + '" evt-act="' + menu.action + '" ignore="on">');
        } else {
            html.push('<li><a href="javascript:;" class="' + btnClass + '" data-role="button" id="' + menu.id + '" evt-rol="' + role + '" evt-act="' + menu.action + '">');
        }
        /*if(menu.action == "read-pre-message"){
			html.push('<span class="ic ic_arrow3_t"></span>\n');
		}else if(menu.action == "read-next-message"){
			html.push('<span class="ic ic_arrow3_d"></span>\n');
		}*/
        html.push('<span class="txt">' + menu.text + '</span>');
        html.push('</a></li>');
        return html;
    };

    this.makeMoreMenuItemTemplate = function (menu) {
        var html = [];
        var role = menu.role == undefined ? "toolbar" : menu.role;
        html.push('<li>');
        html.push('<a href="javascript:;" data-role="button" id="' + menu.id + '" evt-rol="' + role + '" evt-act="' + menu.action + '">');
        html.push('<span class="txt">' + menu.text + '</span>');
        html.push('</a></li>');

        return html.join('');
    };

    this.menuBarAllowWidthPolicy = function (context, curWidth) {
        var MORE_BTN_WIDTH = 34;
        return (curWidth - context.outerWidth() + MORE_BTN_WIDTH > 0);
    };

    this.makeListToolbar = function (data) {
        jQuery("#mailHomeToolbarWrap").show();
        jQuery("#mailHomeToolbarWrap div.optional").show();
        jQuery("#mailWriteToolbarWrap").hide();
        jQuery("#mailReadToolbarWrap").hide();
        jQuery("#mailListToolbarWrap").hide();
        jQuery("#mailWriteBtn").show();
        var toolBarLayout = jQuery("#mailListToolbarWrap");
        var searhToolbarLayout = jQuery("#searchResultNav");
        toolBarLayout.find("li").not(".moreItemLi").remove();
        searhToolbarLayout.find("li").not(".moreItemLi").remove();
        var toolbarType = mailToolbarRuleMap.get(data.folderType);

        var useMenuList = [];
        useMenuList.push(toolBarMenus.전체선택);
        if (toolbarType.remove) {
            useMenuList.push(toolBarMenus.삭제_list);
        }

        if (toolbarType.seen) {
            useMenuList.push(toolBarMenus.읽음);
            useMenuList.push(toolBarMenus.안읽음);
        }

        if (toolbarType.move) {
            useMenuList.push(toolBarMenus.이동);
        }
        useMenuList.push(toolBarMenus.태그);
        jQuery("#toolbar_wrap").show();

        this._renderListTitle(data);
        this._renderHeaderToolBar(toolBarLayout, useMenuList);
        useMenuList.splice(0, 1, toolBarMenus.전체선택_search);
        this._renderHeaderToolBar(searhToolbarLayout, useMenuList);
    };
    this._renderListTitle = function (data) {
        var listTitle = mailMsg.mail_title;
        if (data.bookmarkSeq > 0) {
            var type = data.type;
            var bookmarkType = data.bookmarkType;
            if (type == "tag") {
                listTitle = data.tagInfo.name;
            } else {
                listTitle = mailBookmarkName(bookmarkType, data.name);
            }
        } else {
            if (data.type == "tag") {
                listTitle = data.tagInfo.name;
            } else {
                if (data.isAllFolder) {
                    if (data.extFolder == "on") {
                        listTitle = mailBookmarkName(data.extType, "");
                    }
                } else {
                    listTitle = data.name;
                }
            }
        }
        jQuery("#top_menu_title").text(listTitle);
    };
    this._renderHeaderToolBar = function (toolBarLayout, useMenuList) {

        if (!useMenuList) {
            return;
        }
        var needMore = false;
        var self = this;
        useMenuList.forEach(function (menu) {
            var $item = jQuery(self.makeMenuItemTemplate(toolBarLayout, menu));
            if(menu.inMoreBtn){
                toolBarLayout.find(".moreMenuItem").append($item, '\n');
                needMore = true;
            } else {
                toolBarLayout.find(".moreItemLi").before($item, '\n');
            }
            if (needMore) {
                toolBarLayout.find(".moreItemLi").show();
            }
        });
        if (needMore) {
            toolBarLayout.find(".moreItemLi").show();
        }
        displayHomeIcon();
    };

    this._renderToolBar = function (toolBarLayout, useMenuList) {
        var itemsWidth = 18; //시작(8) 끝(10) 여백
        var needMore = false;
        var self = this;
        useMenuList.forEach(function (menu) {
            var $item = jQuery(self.makeMenuItemTemplate(toolBarLayout, menu));
            toolBarLayout.find(".critical").append($item, '\n');
            itemsWidth += $item.outerWidth() > 0 ? ($item.outerWidth() + 2) : $item.outerWidth();
            if ($item.find('.array_option').length > 0) {
                itemsWidth += 20; //select tag css 20px
            } else if ($item.find(".ic_arrow3_t").length > 0 || $item.find(".ic_arrow3_d").length > 0) {
                itemsWidth += 10; //ic_arrow3_t tag css 10px
            }
            if (self.menuBarAllowWidthPolicy(toolBarLayout, itemsWidth)) {
                $item.attr('data-more', 'Y');
                toolBarLayout.find("[data-id=more_list]").append(self.makeMoreMenuItemTemplate(menu));
                needMore = true;
            }
        });

        toolBarLayout.find('[data-more]').remove();
        if (needMore) {
            toolBarLayout.find("#more_btn").show();
        } else {
            toolBarLayout.find("#more_btn").hide();
        }
    };

    this.makeMailListContent = function (data) {
        jQuery("#main_content").append(getHandlebarsTemplate("mail_list_content_tmpl", data));
    };
    this.readMessage = function (param, escapeHistory) {
        this.readParam = clone(this.listParam);
        this.readParam.folder = param.folder;
        this.readParam.uid = param.uid;
        this.readParam.viewImg = true;
        this.readParam = this.getSharedFolderParam(this.readParam);
        progressAction({"action": true});
        ActionLoader.postSyncGoJsonLoadAction(this.readAction, this.readParam, _this.printReadMessage, "json");
        jQuery(window).off('scroll.renderNewPage');
        google.sendPageView(this.readAction);
        if (!escapeHistory) historyControl.setHistory({"type": "read", "param": param});
    };
    this.reloadReadMessage = function () {
        var readParam = _this.readParam;
        _this.readMessage(readParam, true);
    };
    this.printReadMessage = function (data) {
        changeMailContainer("read");
        _this.listMode = "mail";
        currentMenu = "read";
        isAllFolder = false;
        _this.preNavi = data.preNavi;
        _this.nextNavi = data.nextNavi;
        var headerMsgData = {"isRead": true};

        moment.lang("kr");
        data.msgContent.date = moment(data.msgContent.dateUtc).format("YYYY/MM/DD dddd a HH:mm:ss");

        var isRcptShow = ("on" == getCookie("rcpt_show"));
        data.isRcptShow = isRcptShow;
        progressAction({"action": false});

        _this.makeReadToolbar(data);
        _this.makeMailReadContent(data).done(jQuery.proxy(function () {
            window.Iscroll = _this.makeReadIscroll({isInitRendering: true});
        }, _this));

        /*_this.makeReadSwipeEvent();*/

        jQuery.mobile.silentScroll(0);

        var msgContent = data.msgContent;
        if (msgContent.mdnCheck) {
            if (confirm(mailMsg.mail_mdn_response_confirm)) {
                var param = {"folderName": msgContent.folderEncName, "uid": msgContent.uid};
                param = _this.getSharedFolderParam(param);
                _this.sendMdnResponse(param);
            }
        }
        executeFolderInfo();

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

    this.makeReadToolbar = function (data) {
        jQuery("#mailHomeToolbarWrap").hide();
        jQuery("#mailWriteToolbarWrap").hide();
        jQuery("#mailListToolbarWrap").hide();
        jQuery("#mailWriteBtn").show();
        var toolBarLayout = jQuery("#mailReadToolbarWrap");
        toolBarLayout.show();
        toolBarLayout.find("li").not(".moreItemLi").remove();
        toolBarLayout.find('div.optional').show();
        var toolbarType = mailToolbarRuleMap.get(data.folderType);

        var useMenuList = [];

        if (toolbarType.reply) {
            useMenuList.push(toolBarMenus.답장);
        }
        if (toolbarType.forward) {
            useMenuList.push(toolBarMenus.전달);
            jQuery("#mail_bottom_toolbar_read_forward").show();
        } else {
            jQuery("#mail_bottom_toolbar_read_forward").hide();
        }
        if (toolbarType.remove) {
            useMenuList.push(toolBarMenus.삭제_read);
            jQuery("#mail_bottom_toolbar_read_delete").show();
        } else {
            jQuery("#mail_bottom_toolbar_read_delete").hide();
        }

        if (toolbarType.reply) {
            useMenuList.push(toolBarMenus.전체답장_read);
            jQuery("#mail_bottom_toolbar_read_reply").show();
            jQuery("#mail_bottom_toolbar_read_replyall").show();
        } else {
            jQuery("#mail_bottom_toolbar_read_reply").hide();
            jQuery("#mail_bottom_toolbar_read_replyall").hide();
        }

        useMenuList.push(toolBarMenus.스팸이동);

        if (toolbarType.move) {
            useMenuList.push(toolBarMenus.이동_read);
            jQuery("#mail_bottom_toolbar_read_move").show();
        } else {
            jQuery("#mail_bottom_toolbar_read_move").hide();
        }

        useMenuList.push(toolBarMenus.태그_read);
        useMenuList.push(toolBarMenus.안읽음_read);

        if (data.preNavi) {
            useMenuList.push(toolBarMenus.이전);
        }

        if (data.nextNavi) {
            useMenuList.push(toolBarMenus.다음);
        }

        jQuery("#toolbar_wrap").show();

        this._renderHeaderToolBar(toolBarLayout, useMenuList)

    };
    this.makeMailReadContent = function (data) {
        var deferred = jQuery.Deferred();
        var deviceWidth = jQuery(window).width() - 30;

        data.msgContent.htmlContent = _this.convertIcalTemplate(data.msgContent.icalList) + data.msgContent.htmlContent;

        jQuery("#main_content").handlebars("mail_read_content_tmpl", data);
        jQuery("#fontResizeLayer li input[value="+this.getFontSize()+"]").prop("checked", true);

        var tagIdList = data.tagIdList;
        var readTagWrapObj = jQuery("#readTagWrap");
        if (tagIdList && tagIdList.length > 0) {
            var tagList = folderControl.getTagData();
            for (var i = 0; i < tagIdList.length; i++) {
                for (var j = 0; j < tagList.length; j++) {
                    if (tagIdList[i] == tagList[j].id) {
                        readTagWrapObj.append(getHandlebarsTemplate("mail_read_tag_tmpl", tagList[j]));
                        break;
                    }
                }
            }
        }

        jQuery("#message_view_table a[href],area[href]").each(function () {
            if (!MOBILE_WEB) {
                jQuery(this).attr("evt-rol", "ext-url");
            }
        });


        var $image = jQuery("#message_view_table").find("img:not([src*=mdnData])");
        var imageCnt = $image.length;
        if (!imageCnt) {
            deferred.resolve();
        }
        var loadImageCnt = 0;
        $image.load(function () {
            loadImageCnt++;
            if (imageCnt == loadImageCnt) {
                deferred.resolve();
            }
        });
        return deferred;
    };
    this.makeReadIscroll = function (options) {
        var isInitRendering = options.isInitRendering;

        var self = this;
        var windowHeight = jQuery(window).height();
        var contentWidth = jQuery("#mailContentWrapper").outerWidth(true);
        var deviceWidth = jQuery(window).width();
        if (deviceWidth > contentWidth) contentWidth = deviceWidth;
        if (isInitRendering) {
            this.contentsParsingForFontSizeResizing();
            resizeFontSize(this.getFontSize());
        }
        jQuery("#message_view_table").css("width", contentWidth + "px");
        var docHeaderHeight = jQuery("#mailReadToolbarWrap").outerHeight(true);
        var articleHeaderHeight = jQuery('header.article_header').outerHeight(true);
        jQuery("#article_view").height(windowHeight - articleHeaderHeight - docHeaderHeight);

        if (this.isBiggerStyle()) {
            jQuery("#main_content").addClass("content_detail");
        }

        if (this.Iscroll) this.Iscroll.destroy();
        var renderedFactor = 1 / (contentWidth / deviceWidth);

        self.Iscroll = new IScroll('#article_view', {
            bounce: false,
            zoom: true,
            zoomMin: renderedFactor,
            disablePointer: true, // important to disable the pointer events that causes the issues
            disableTouch: false, // false if you want the slider to be usable with touch devices
            disableMouse: false, // false if you want the slider to be usable with a mouse (desktop)
            preventDefault: false
        });

        self.Iscroll.on('zoomStart', function(e) {
            jQuery("#article_view")
                .css('overflow-x', '')
                .css('overflow-y', '');
        });
        self.Iscroll.on('zoomEnd', function(e) {
            jQuery("#article_view")
                .css('overflow-x', 'scroll')
                .css('overflow-y', 'hidden');
        });

        setTimeout(function () {
            if (contentWidth > deviceWidth) {
                self.Iscroll.zoom(0, 0, renderedFactor);
                self.Iscroll.scrollTo(0, 0);
            }
            self.Iscroll.refresh();
        }, 400);

        return self.Iscroll;
    };

    this.getFontSize = function () {
        var lastFontSize = getLocalStorage("lastFontSize_"+USERSESSION.id);
        return lastFontSize ? lastFontSize : 40;
    };

    this.isBiggerStyle = function () {
        if (document.getElementById('systemBigStyle').disabled == true ||
            document.getElementById('systemBiggerStyle').disabled == true) {
            return true;
        }
        return false;
    };

    this.contentsParsingForFontSizeResizing = function () {
        jQuery("#fontResizeWrap").show();
        jQuery("#mailContentWrapper").wrapInner("<div></div>").find('*').contents().filter(function () {
            return this.nodeType == 3 && jQuery.trim(this.nodeValue);
        }).each(function (x, y) {
            var targetStyle = getComputedStyle(this.parentNode);
            var fontSize = targetStyle.fontSize.replace('px', '');
            var lineHeight = targetStyle.lineHeight.replace('px', '');

            jQuery(this).wrap('<span data-font-resize ' +
                'data-origin-fontsize="' + fontSize + '" ' +
                'data-origin-lineheight="' + lineHeight + '" ' +
                'style="font-size:' + fontSize + 'px;line-height:' + lineHeight + 'px" />')
        });
    };

    this.makeReadSwipeEvent = function () {
        var $swipeLeftObj = jQuery("#leftHandle");
        var $swipeRightObj = jQuery("#rightHandle");
        jQuery("#mailViewContentWrap").swipe({
            swipeLeft: function (event, direction, distance, duration, fingerCount) {
                if (_this.nextUid > 0) {
                    readMessage(_this.nextNavi.folderName, _this.nextNavi.uid);
                } else {
                    alert(mailMsg.mail_last_message);
                    return;
                }
            },
            swipeRight: function (event, direction, distance, duration, fingerCount) {
                if (_this.preNavi) {
                    readMessage(_this.preNavi.folderName, _this.preNavi.uid);
                } else {
                    alert(mailMsg.mail_first_message);
                    return;
                }
            },
            swipeStatus: function (event, phase, direction, distance, duration, fingers) {
                if (phase == "start") {
                    $swipeLeftObj.css("right", "-50px").hide();
                    $swipeRightObj.css("left", "-50px").hide();
                } else if (phase == "move") {
                    if (direction == "left") {
                        $swipeRightObj.css("left", "-50px").hide();
                        $swipeLeftObj.show();
                        if (distance <= 50) {
                            $swipeLeftObj.css("right", (-50 + distance) + "px");
                        }
                    } else if (direction == "right") {
                        $swipeLeftObj.css("right", "-50px").hide();
                        $swipeRightObj.show();
                        if (distance <= 50) {
                            $swipeRightObj.css("left", (-50 + distance) + "px");
                        }
                    }
                } else if (phase == "end") {
                    $swipeLeftObj.css("right", "-50px").hide();
                    $swipeRightObj.css("left", "-50px").hide();
                }
            },
            threshold: 100
        });
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
    this.writeMessage = function (param, escapeHistory) {
        if (!param.init) {
            progressAction({"action": true});
        }
        param.init = null;
        this.writeParam = param;
        ActionLoader.postGoJsonLoadAction(this.writeAction, param, _this.printWriteMessage, "json");
        jQuery(window).off('scroll.renderNewPage');
        google.sendPageView(this.writeAction);
        if (!escapeHistory) historyControl.setHistory({"type": "empty", "param": param});

    };
    this.printWriteMessage = function (data) {
        LOCAL_DOMAIN = data.localDomain ? data.localDomain : "";
        changeMailContainer("write");
        _this.listMode = "mail";
        currentMenu = "write";
        notiMode = data.notiMode;
        sendConfirm = data.sendConfirm;
        var headerMsgData = {"isWrite": true};
        data.isMobileWeb = MOBILE_WEB;
        _this.makeMailWriteContent(data);
        progressAction({"action": false});
        _this.makeMailWriteHeader(headerMsgData);
        _this.makeMailWriteToolbar(data);
        _this.writeData = data;
        _this.convertSendData(data);
        mailWriteInit(data);
        isMaxSendMailCountUse = data.sendMailCount.maxSendMailCountUse;
        maxSendMailCount = data.sendMailCount.maxSendMailCount;

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
    };
    this.makeMailWriteHeader = function (data) {
        jQuery("#mail_header .mailHeaderWrap").hide();
        jQuery("#mail_write_header").show();
    };
    this.makeMailWriteToolbar = function (data) {
        jQuery("#mailHomeToolbarWrap").hide();
        jQuery("#mailListToolbarWrap").hide();
        jQuery("#mailReadToolbarWrap").hide();
        jQuery("#mailWriteToolbarWrap").show();
        jQuery("#mailWriteBtn").hide();
        if (!USE_CONTACT) {
            jQuery("#contactButton").hide();
        }
        jQuery("#toolbar_wrap").show();
    };
    this.makeMailWriteContent = function (data) {
        jQuery("#main_content").handlebars("mail_write_content_tmpl", jQuery.extend({}, data, {
            "isAndroidApp": isAndroidApp(),
            "isWebFolderUsable": USE_WEBFOLDER
        }));
    };
    this.getSignList = function (func) {
        ActionLoader.getGoLoadAction(this.signListAction, null, function (data) {
            if (data && data.length > 0) {
                var useAttach = jQuery("#signListWrap").data("attach");
                data.useAttach = useAttach;
                jQuery("#signListWrap").html(getHandlebarsTemplate("mail_layer_sign_tmpl", data));
                jQuery("#signWrap").show();
            }
        }, "json");
    };
    this.loadMdnList = function (param, escapeHistory) {
        param = (!param) ? {} : param;
        this.listParam = param;
        this.dataSet = {};
        progressAction({"action": true});
        ActionLoader.postGoLoadAction(this.mdnListAction, param, _this.printMdnList, "json");
        jQuery(window).off('scroll.renderNewPage');
        jQuery(window).on('scroll.renderNewPage', jQuery.proxy(this.detectScroll, this));
        google.sendPageView(this.mdnListAction);
        if (!escapeHistory) historyControl.setHistory({"type": "mdnlist", "param": param});
    };
    this.printMdnList = function (data) {
        _this.selectedMailId = _.isNull(sessionStorage.getItem("SELECTED-DOC-ID")) ? null : sessionStorage.getItem("SELECTED-DOC-ID");
        _this.pageNo = _.isNull(sessionStorage.getItem("PAGE-NO")) ? 1 : parseInt(sessionStorage.getItem("PAGE-NO"));
        sessionStorage.removeItem("SELECTED-DOC-ID");
        sessionStorage.removeItem("PAGE-NO");
        _this.nextPage = 1;
        _this.lastPage = data.pageInfo.pages.length;
        _this.listMode = "mdnlist";
        currentMenu = "list";
        changeMailContainer("list");
        var headerMsgData = {"isMdnList": true};
        jQuery("#main_content").empty();
        if (_this.pageNo >= 2) {
            var pageNum = _this.pageNo;
            for (var i = 1; i <= pageNum; i++) {
                _this.pageNo = i;
                _this.dataFetch(i);
            }
        } else {
            _this.makeMailMdnListContent(data);
        }
        _this.scrollToEl();
        _this.makeMailMdnListToolbar(data);
        changeStatusBarColor(false);
        progressAction({"action": false});
    };
    this.makeMailMdnListToolbar = function (data) {
        jQuery("#mailHomeToolbarWrap").show();
        jQuery("#mailHomeToolbarWrap div.optional").hide();
        jQuery("#mailWriteToolbarWrap").hide();
        jQuery("#mailReadToolbarWrap").hide();

        jQuery("#toolbar_wrap").show();

        jQuery("#top_menu_title").text(mailMsg.menu_receivenoti);

    };
    this.makeMailMdnListContent = function (data) {
        jQuery("#main_content").append(getHandlebarsTemplate("mail_mdn_list_content_tmpl", data));
    };
    this.loadMdnRead = function (param, escapeHistory) {
        this.readParam = param;
        progressAction({"action": true});
        ActionLoader.postGoLoadAction(this.mdnReadAction, param, _this.printMdnRead, "json");
        jQuery(window).off('scroll.renderNewPage');
        google.sendPageView(this.mdnReadAction);
        if (!escapeHistory) historyControl.setHistory({"type": "mdnread", "param": param});
    };
    this.printMdnRead = function (data) {
        _this.nextPage = 1;
        _this.listMode = "mdnread";
        currentMenu = "list";
        changeMailContainer("list");
        var headerMsgData = {"isMdnRead": true};

        data.subject = _this.readParam.subject;
        data.dateUtc = _this.readParam.dateUtc;
        _this.makeMailMdnReadToolbar(data);
        _this.makeMailMdnReadContent(data);
        progressAction({"action": false});
    };

    this.makeMailMdnReadToolbar = function (data) {
        jQuery("#mailHomeToolbarWrap").hide();
        jQuery("#mailWriteToolbarWrap").hide();
        jQuery("#mailListToolbarWrap").hide();
        jQuery("#mailWriteBtn").show();
        var toolBarLayout = jQuery("#mailReadToolbarWrap");
        toolBarLayout.show();
        toolBarLayout.find("li").not(".moreItemLi").remove();
        toolBarLayout.find('div.optional').hide();
        var useMenuList = [];
        this._renderHeaderToolBar(toolBarLayout, useMenuList)
    };
    this.makeMailMdnReadContent = function (data) {
        jQuery("#main_content").handlebars("mail_mdn_read_tmpl", data);
    };
    this.deleteMdn = function (param) {
        ActionLoader.postGoLoadAction(this.deleteMdnAction, param, function (data) {
            _this.reloadMessageList();
        }, "json");
    };
    this.recallMessage = function (param) {
        ActionLoader.postGoLoadAction(this.recallMessageAction, param, function (data) {
            _this.reloadMessageList();
        }, "json");
    };
    this.sendMdnResponse = function (param) {
        ActionLoader.postGoJsonLoadAction(this.sendMdnResponseAction, param, function (data) {
            alert(mailMsg.mail_send_success);
        }, "json");
    };
    this.searchMessage = function (param) {
        this.loadMessageList(param);
    };
    this.copyMessage = function (param) {
        param = this.getSharedFolderParam(param);
        ActionLoader.postGoJsonLoadAction(this.copyMessageAction, param, function (data) {
            _this.reloadMessageList();
        }, "json", function (data) {
            alert(data.message);
        });
    };
    this.moveMessage = function (param) {
        param = this.getSharedFolderParam(param);
        ActionLoader.postGoJsonLoadAction(this.moveMessageAction, param, function (data) {
            _this.reloadMessageList();
        }, "json", function (data) {
            alert(data.message);
        });
    };
    this.taggingMessage = function (param) {
        ActionLoader.postGoJsonLoadAction(this.taggingMessageAction, param, function (data) {
            if (currentMenu == "read") {
                _this.reloadReadMessage();
            } else {
                _this.reloadMessageList();
            }
        }, "json");
    };
    this.writeDeptAddrInfo = function (callbackFunc) {
        ActionLoader.getLoadAction(this.deptSelectAction, {}, function (data) {
            jQuery("#writeDeptAddrSelect").handlebars("addr_dept_select_tmpl", data);
            jQuery("#writeDeptAddrLink span.txt").text(jQuery('#writeDeptAddrSelect option:first').text());
            if (callbackFunc) {
                callbackFunc();
            }
        }, "json");
    };
    this.writeAddrSelect = function (param) {
        var goAgent_device = sessionStorage.getItem("GO-Agent-mail");
        jQuery("#mailWriteToolbarWrap").hide();
        if (jQuery(".list_employee_new").length === 0) {
            _this.selectedNodes = [];
        }
        jQuery('#companyText').nextAll().andSelf().remove();
        jQuery('#companySelect').nextAll().andSelf().remove();
        jQuery("#addr_dept_list").empty();
        jQuery("#addr_member_list").empty();
        param = (!param) ? {} : param;
        this.addrParam = param;
        var addrAction = this.writeAddrSelectAction;
        var paramName = param.name;
        var addrResultFunc = this.makeWriteAddrListContent;
        if (param.ownerType == 'company' && !param.isReadable) {
            addrResultFunc = this.makeNotReadableListContent;
        }

        if (param.ownerType == 'department') {
            param.deptId = (!param.deptId) ? jQuery('select.dept_addr_select').val() : param.deptId;
            this.addrParam.deptId = param.deptId;
        }

        if (param.ownerType == "emp") {
            if (goAgent_device === "BROWSER") {
                paramName = param.keyword;
            } else {
                jQuery("#mailWriteToolbarWrap").show();
                setCookie("ContactViewTypeMobile", 'user', 365);
                if (isIphoneApp()) {
                    window.location = "gomobile://callOrgDept?&addReceiverSuccess&addReceiverFail";
                } else if (isAndroidApp()) {
                    window.GOMobile.callOrgDept('addReceiverSuccess', 'addReceiverFail');
                }
            }
        } else {
            if (param.keyword) {
                addrAction = this.writeAddrSearchAction;
            } else {
                param = {
                    page: param.page || 0,
                    offset: 20,
                    property: "nameInitialConsonant",
                    direction: "asc",
                    keyword: "",
                    type: (param.ownerType).toUpperCase() || "",
                    groupId: param.groupId || "",
                    deptId: param.deptId || jQuery('select.dept_addr_select').val()
                };
            }
        }

        currentMenu = "addr";
        changeMailContainer("addr");
        makeTopMenuTitle(mailMsg.addr_list_write_select);
        _this.addrNextPage = 1;

        if (param.ownerType == "emp") {
            jQuery("#users_list_title").text(mailMsg.common_org_dept_staff);
            jQuery("#dept_list_title").show();
            if (goAgent_device === "BROWSER") {
                if (jQuery.trim(paramName) != "" || !_.isUndefined(paramName)) {
                    _this.fetchOrgMemberBySearch(paramName);
                } else {
                    jQuery(".list_employee_new").remove();
                    _this.fetchOrgMember('', function(result){
                        _this.setHeaderCrumbList(result);
                        _this.setOrgMemberByCompany(result)
                    });
                }
            }
        } else {
            jQuery("#users_list_title").text(mailMsg.addr_user);
            jQuery("#dept_list_title").hide();
            jQuery(".list_employee_new").remove();
            ActionLoader.getLoadAction(addrAction, param, function (data) {
                if (paramName && jQuery.trim(paramName) != "") {
                    data.search = true;
                }
                if (!data.search) {
                    addrResultFunc(data);
                }
            }, "json");
        }

        jQuery(window).off('scroll.renderNewPage');
        google.sendPageView(addrAction);
        //if (!escapeHistory && isInit)
        if (param.isInit) {
            historyControl.setHistory({"type": "addr", "param": param});
        }
    };

    this.makeNotReadableListContent = function (data) {
        jQuery("#addr_member_list").handlebars("addr_no_readable_mail_tmpl");
    }

    this.makeWriteAddrListContent = function (data) {
        var pageInfo = data.page;
        var page = pageInfo.page + 1;
        var newPageInfo = {};
        newPageInfo.firstPage = (page == 1);
        newPageInfo.prePage = (page - 1);
        newPageInfo.page = page;
        newPageInfo.pageSize = pageInfo.offset;
        newPageInfo.total = pageInfo.total;
        newPageInfo.lastPage = pageInfo.lastPage;
        newPageInfo.nextPage = page + 1;
        var newData = {};
        newData.data = data.data;
        newData.pageInfo = newPageInfo;
        jQuery("#addr_member_list").handlebars("addr_write_mail_tmpl", newData);
    };

    this.setHeaderCrumbList = function (members) {
        var companyNameList = [];
        var companySet = _this.getCompanyList(members);

        _.each(companySet, function (company) {
            companyNameList.push(company.data.title);
        });

        if (jQuery("select[name=companySelect]").text() === companyNameList.join("")) {
            return;
        }
        if (companySet.length >= 2) {
            _this.isMultiSite = true;
            var tpl = '<select id="companySelect" name="companySelect"></select>';
            jQuery("#userCheckedScroll").append(tpl);
            _.each(companySet, function (company) {
                if (jQuery("select[name=companySelect]").text().indexOf(company.data.title) === -1) {
                    jQuery('#companySelect').append('<option value="' + company.data.id + '">' + company.data.title + '</option>');
                }
            });
        } else {
            var tpl = '<a id="companyText">' + mailMsg.mail_search_all + '</a>';
            jQuery("#userCheckedScroll").append(tpl);
        }
    };

    this.getCompanyList = function (members) {
        var companySet = [];
        _.each(members, function (member) {
            if (member.data.id.indexOf('company') !== -1) {
                companySet.push(member);
            }
        });
        return companySet;
    };

    this.getFetchOrgUrl = function (deptId) {
        var baseUrl = '/api/organization/multi/list';
        var url;
        if (!_.isEmpty(deptId)) {
            url = baseUrl + '?deptid=' + deptId + '&type=child';
        } else {
            url = baseUrl + '?type=mydept';
        }
        return url;
    };

    this.fetchOrgMember = function (deptId, setOrgMemberCallback) {
        jQuery.ajax({
            method: 'GET',
            reset: true,
            url: _this.getFetchOrgUrl(deptId),
            success: function (result) {
                _this.depts = [];
                _this.users = [];
                setOrgMemberCallback(result);
                _this.drawOrgMember();
            }
        });
    };

    this.setOrgMemberByCompany = function(deptList){
        var isOneCompany = jQuery("#companyText").length >= 1;
        var isMultiCompany = jQuery("#companySelect").length !== 0 && jQuery("#companySelect").children.length >= 2;
        if(isOneCompany){
            _this.setOrgMemberByPosition(deptList[0].children);
        } else if (isMultiCompany) {
            var selectedCompany = jQuery("select[name=companySelect]").val();
            _.any(deptList, function (model) {
                if (model.data.id === selectedCompany) {
                    _this.setOrgMemberByPosition(model.children);
                    return true;
                }
            });
        } else {
            _this.setOrgMemberByPosition(deptList);
        }
    },

    this.setOrgMemberByPosition = function (members) {
        _.each(members, function (member) {
            if (member.data.id.includes("org")) {
                var hasDeptChildren = (member.metadata.childrenCount > 0 || member.metadata.memberCount > 0);
                _this.depts.push({
                    title: member.data.title,
                    id: member.metadata.id,
                    email: member.metadata.email,
                    originalEmail: member.metadata.email,
                    name: member.metadata.name,
                    type: member.data.id.split('_')[0],
                    includedSubDept: false,
                    code: member.metadata.code,
                    useReception: member.metadata.useReception,
                    useReference: member.metadata.useReference,
                    hasDeptChildren: hasDeptChildren,
                });
            } else if (_.contains(['MASTER', 'MODERATOR', 'MEMBER'], member.data.id.split('_')[0])) {
                _this.users.push({
                    nodeId: member.attr.nodeId,
                    id: member.metadata.id,
                    companyName: member.metadata.companyName,
                    email: member.metadata.email,
                    originalEmail: member.metadata.email,
                    name: member.metadata.name,
                    type: member.data.id.split('_')[0],
                    duty: member.metadata.duty,
                    deptId: member.metadata.deptId,
                    departments: member.metadata.deptName,
                    position: member.metadata.position,
                    displayName: member.metadata.name + member.metadata.position,
                    thumbnail: member.metadata.thumbnail,
                    employeeNumber: member.metadata.employeeNumber,
                    loginId: member.metadata.loginId,
                });
            }
        });
    };

    this.fetchOrgMemberBySearch = function (paramName) {
        jQuery.ajax({
            method: 'GET',
            reset: true,
            async: false,
            url: "/api/org/user/sort/list?nodeType=org&page=0&keyword=" + encodeURIComponent(paramName),
            success: function (result) {
                _this.depts = [];
                _this.users = [];
                _this.setOrgMemberBySearch(result.data);
                _this.drawOrgMember();
            }
        });
    };

    this.setOrgMemberBySearch = function (result) {
        if (result.length < 1) {
            return
        }
        var alreadyAddedIdList = [];
        _.each(result, function (value) {
            if (alreadyAddedIdList.indexOf(value.id) === -1) {
                alreadyAddedIdList.push(value.id);
                if (value.nodeType == "user") {
                    _this.users.push({
                        nodeId: value.employeeNumber,
                        id: value.id,
                        companyName: value.companyName,
                        email: value.email,
                        originalEmail: value.originalEmail,
                        name: value.name,
                        type: "user",
                        duty: value.duties[0],
                        deptId: value.departmentIds[0],
                        departments: value.departments,
                        position: value.position,
                        displayName: value.name + value.position,
                        thumbnail: value.thumbnail,
                        employeeNumber: value.employeeNumber,
                        loginId: value.loginId,
                        isMultiCompany: _this.isMultiSite
                    });
                } else if (value.nodeType == "department") {
                    _this.depts.push({
                        title: value.name,
                        id: value.id,
                        email: value.email,
                        originalEmail: value.email,
                        name: value.name,
                        type: 'org',
                        includedSubDept: false,
                        userReception: value.useReception,
                        useReference: value.useReference,
                        isMultiCompany: _this.isMultiSite,
                        companyName: value.companyName
                    });
                }
            }
        });
    };

    this.removeOrgList = function(){
        jQuery('#companySelect').nextAll().remove();
        jQuery("#addr_dept_list").empty();
        jQuery("#addr_member_list").empty();
    };

    this.drawOrgMember = function (result) {
        var userData = {};
        var deptData = {};
        userData.mailExposure = MAIL_EXPOSURE;
        deptData.mailExposure = MAIL_EXPOSURE;
        deptData.data = _this.depts;
        userData.data = _this.users;
        jQuery("#addr_dept_list").handlebars("mail_org_dept_tmpl", deptData);
        jQuery("#addr_member_list").handlebars("mail_org_member_tmpl", userData);

        jQuery("select[name=companySelect]").off();
        jQuery("select[name=companySelect]").on("change", function (e) {
            _this.removeOrgList();
            _this.fetchOrgMember('',  _this.setOrgMemberByCompany);
        });

        jQuery("select[name=companySelect]").on("vclick", function (e) {
            _this.removeOrgList();
            _this.fetchOrgMember('', _this.setOrgMemberByCompany);
        });

        jQuery("#companyText").off();
        jQuery("#companyText").on("vclick", function (e) {
            jQuery('#companyText').nextAll().remove();
            _this.fetchOrgMember('', _this.setOrgMemberByCompany);
        });

        jQuery(".dept_info").off();
        jQuery(".dept_info").on("vclick", function (e) {
            var $currentTarget = jQuery(e.currentTarget);
            $currentTarget.prop("disabled", true);
            if ($currentTarget.find('.ic.ic_arrow4').length === 0) {
                return;
            }
            var deptId = $currentTarget.attr('data-id').split('_')[1];
            var deptName = $currentTarget.text();
            jQuery("#userCheckedScroll").append('<a id="sub_dept" class="orgDepthspan" data-id="' + deptId + '">' + deptName + '</a>');
            _this.fetchOrgMember(deptId, _this.setOrgMemberByPosition);
        });

        jQuery(".orgDepthspan").off();
        jQuery(".orgDepthspan").on("vclick", function (e) {
            var currentTarget = jQuery(e.currentTarget);
            currentTarget.nextAll().remove();
            var deptId = currentTarget.attr('data-id');
            _this.fetchOrgMember(deptId, _this.setOrgMemberByPosition);
        });

        jQuery(".btn.btn_plus").off();
        jQuery(".btn.btn_plus").on("vclick", function (e) {
            e.preventDefault();
            var depts = jQuery.extend({}, _this.depts);
            var users = jQuery.extend({}, _this.users);
            var dataId = jQuery(e.currentTarget).attr('value');
            var nodeType = dataId.split('_')[0];
            var nodeId = dataId.split('_')[1];

            var dept = _.find(depts, function (o) {
                return o.type === nodeType && o.id == nodeId
            });
            var user = _.find(users, function (o) {
                return o.type == nodeType && o.id == nodeId
            });

            if (_.isUndefined(dept) && _.isUndefined(user)) {
                alert(mailMsg.error_noselect);
                return;
            }
            var checkedItem = _.isUndefined(dept) ? user : dept;
            checkedItem.dataId = dataId;

            if (nodeType == 'org') {
                checkedItem.includedSubDept = confirm(mailMsg.mail_subdept_include);
            }

            var existedNode = _.some(_this.selectedNodes, function (o) {
                return o.dataId === dataId;
            });

            if (existedNode) {
                alert(mailMsg.alert_same);
                return;
            }
            _this.selectedNodes.push(checkedItem);
            if (jQuery("div.list_employee_new").length < 1) {
                var activeBarTpl = '<div class="list_employee_new"><ul class="name_tag" id="activeBar"></ul></div>';
                jQuery("div.docu_search").before(activeBarTpl);
            }

            if (checkedItem.includedSubDept) {
                var memberInfos = [];
                var reqUrl = '/api/organization/dept/tree?deptid=' + nodeId + '&scope=subdept';
                jQuery.ajax({
                    method: 'GET',
                    reset: true,
                    async: false,
                    url: reqUrl,
                    success: function (memberList) {
                        memberInfos = memberList;
                        _this.setOrgMemberByPosition(memberList);
                        _.each(memberList, function (member) {
                            var dataId = member.attr.id;
                            var existedNode = _.any(_this.selectedNodes, function (o) {
                                return o.dataId === dataId;
                            });
                            if (!existedNode) {
                                var department = mailMsg.mail_search_name_department;
                                var name = member.attr.title;
                                var tplUnit = '<a value="' + dataId + '" class="nameTagItem"><li><div class="depart"><span class="txt">' + department + '</span></div><span class="name">' + name + '</span><span class="btn_wrap" id="btn_del" value="' + dataId + '"><span class="btn btn_del_type2"></span></span></li></a>'
                                jQuery('#activeBar').append(tplUnit);

                                if (checkedItem.dataId !== dataId) {
                                    var nodeType = dataId.split('_')[0];
                                    var nodeId = dataId.split('_')[1];

                                    var dept = _.find(_this.depts, function (o) {
                                        return o.type === nodeType && o.id == nodeId
                                    });
                                    dept.dataId = dataId;
                                    _this.selectedNodes.push(dept);
                                }
                            }
                        });
                    }
                });
            }

            var tplUnit = null;
            if (nodeType != 'org') {
                tplUnit = '<a value="' + checkedItem.dataId + '" class="nameTagItem"><li><div class="photo"><img src="' + checkedItem.thumbnail + '"></div><span class="name">' + checkedItem.name + '</span><span class="btn_wrap" id="btn_del"  value="' + checkedItem.dataId + '"><span class="btn btn_del_type2"></span></span></li></a>';
            } else {
                var dataId = checkedItem.dataId;
                var department = mailMsg.mail_search_name_department;
                var name = checkedItem.name;
                tplUnit = '<a value="' + dataId + '" class="nameTagItem"><li><div class="depart"><span class="txt">' + department + '</span></div><span class="name">' + name + '</span><span class="btn_wrap" id="btn_del"  value="' + dataId + '"><span class="btn btn_del_type2"></span></span></li></a>';
            }
            jQuery('#activeBar').append(tplUnit);

            jQuery(".nameTagItem").on("vclick", function (e) {
                e.preventDefault();
                var dataId = jQuery(e.currentTarget).attr('value');
                var nodeIndexToDelete = 0;

                _.any(_this.selectedNodes, function (node) {
                    if (node.dataId === dataId) {
                        return true;
                    }
                    nodeIndexToDelete++;
                });

                if (_this.selectedNodes.length !== nodeIndexToDelete) {
                    _this.selectedNodes.splice(nodeIndexToDelete, 1);
                }

                if (_.isEmpty(_this.selectedNodes)) {
                    jQuery('div.list_employee_new').remove();
                }
                jQuery('.name_tag').find('a[value=' + dataId + ']').remove();
            });
        });
    };

    this.moveAddrPage = function (page) {
        page -= 1;
        this.addrParam.page = page;
        _this.writeAddrSelect(this.addrParam);
    };
    this.reloadWriteAddrSelect = function () {
        _this.writeAddrSelect(this.addrParam);
    };
    this.makeDeptSelectOptions = function (data) {
        // 초기세팅
        jQuery('.addr_select').val('user')
        jQuery('.dept_addr_select').hide();

        addrAction = this.deptSelectAction;
        addrResultFunc = this.makeDeptSelectOptions;

        var $deptSelect = jQuery('#addr_content select.dept_addr_select');
        ActionLoader.getLoadAction(addrAction, {}, function (data) {

            jQuery("#addr_content select.dept_addr_select").handlebars("addr_dept_select_tmpl", data);
            $deptSelect.closest('a').find('span.txt').text($deptSelect.find("option:first").text());

        }, "json");
    }


    this.deleteMessages = function (param) {
        ActionLoader.postGoJsonLoadAction(this.deleteMessageAction, param, function (data) {
            _this.reloadMessageList(true);
        }, "json");
    };
    this.switchMessagesFlags = function (uids, folders, flagType, used, isRead) {
        var param = {};
        param = this.getSharedFolderParam(param);
        param.folderNames = folders;
        param.uids = uids;
        param.flagType = flagType;
        param.used = used;
        ActionLoader.postGoJsonLoadAction(this.switchFlagAction, param, function (data) {
            if (isRead) {
                changeFlagReadView(used, flagType);
            } else {
                if (flagType == "F") {
                    changeFlagView(used, flagType, data);
                } else {
                    _this.reloadMessageListWithUseHistory();
                }
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

    this.reloadMessageListWithUseHistory = function () {
        this.reloadMessageList(true);
    };

    this.reloadMessageList = function (setHistory) {
        //this.listParam.page = 1;
        ignoreHistory = (!setHistory) ? true : false;
        if (this.listMode == "mail") {
            this.loadMessageList(this.listParam, ignoreHistory);
        } else if (this.listMode == "mdnlist") {
            this.loadMdnList(this.listParam, ignoreHistory);
        } else if (this.listMode == "mdnread") {
            this.loadMdnRead(this.readParam, ignoreHistory);
        }
    };
    this.reloadWriteMessage = function () {
        this.writeMessage(this.writeParam);
    };
    this.sendMessage = function (param) {
        progressAction({"action": true});
        ActionLoader.postGoJsonLoadAction(this.sendAction, param, function (data) {
            if (param.sendType == "draft") {
                if (!data.isError) {
                    alert(mailMsg.mail_drafts_success);
                    progressAction({"action": false});
                    var sendData = mailControl.getSendData();
                    sendData.draftMessageId = data.messageId;
                }
            } else {
                _this.sendMessageResult(data);
                progressAction({"action": false});
            }
            if (!data.isError && (isAndroidApp() || isIphoneApp())) {
                mailSendComplete();
                if(isAndroidApp()) {
                    progressAction({"action": false});
                }
            }
        }, "json");
        if (param.sendType != "draft") {
            jQuery(window).off('scroll.renderNewPage');
            google.sendPageView(this.sendAction);
        }
    };
    this.sendMessageResult = function (data) {
        currentMenu = "send";
        changeMailContainer("send");
        var headerMsgData = {"isSend": true};
        _this.makeMailSendHeader(headerMsgData);
        _this.makeMailSendToolbar(data);
        _this.makeMailSendContent(data);
        executeFolderInfo();
    };
    this.makeMailSendHeader = function (data) {
        jQuery("#mail_header .mailHeaderWrap").hide();
        jQuery("#mail_send_header").show();
    };
    this.makeMailSendToolbar = function (data) {
        jQuery("#toolbar_wrap").hide();
    };
    this.makeMailSendContent = function (data) {
        jQuery("#main_content").handlebars("mail_send_content_tmpl", data);
    };
    this.makeSubToolbar = function (linkObj, menu) {
        var $subLayer = linkObj.closest('li');
        var $parentObj = $subLayer.find("div.array_option");
        if ($parentObj.css("display") == "none") {
            var $wrap = jQuery('#toolbar_wrap');
            if (isSearchResult()) {
                $wrap = jQuery('#searchResultNav');
            }
            $wrap.find('div.array_option').hide();
            $parentObj.show();
            var timeout;
            linkObj.bind("mouseover", function () {
                if (timeout) clearTimeout(timeout);
            });
            linkObj.bind("mouseout", function () {
                timeout = setTimeout(function () {
                    $parentObj.hide();
                }, 500);
            });
            $subLayer.bind("mouseout", function () {
                timeout = setTimeout(function () {
                    $parentObj.hide();
                }, 500);
            });
            $subLayer.bind("mouseover", function () {
                if (timeout) clearTimeout(timeout);
            });
            if (menu == "move") {
                $parentObj.bind("mouseover", function () {
                    if (timeout) clearTimeout(timeout);
                });
            }
        } else {
            linkObj.unbind();
            $parentObj.hide();
        }

    };
    this.getCurrentFolder = function () {
        return this.currentFolder;
    };
    this.getSendData = function () {
        return this.sendData;
    };
    this.setSendData = function (sendData) {
        this.sendData = sendData;
    };
    this.getListMode = function () {
        return this.listMode;
    };
    this.getAddrParam = function () {
        return this.addrParam;
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
    };
    this.makeMailEvent = function () {
        var self = this;
        //클릭이벤트 처리
        jQuery(document).on("click", function (e) {
            var moreLayout = jQuery(e.currentTarget).find("#more_layout");
            closeMoreLayout(moreLayout);
        });
        //메일쓰기 이벤트
        jQuery("header").on("vclick", "#mailWriteBtn", function (event) {
            hideMailFolderSide();
            goWrite();
        });
        //메일검색 이벤트
        jQuery("header #search_wrap").on("vclick", "a", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            event.preventDefault();
            closeMoreLayout();
            if (type == "search-message") {
                searchGoMessage();
            } else if (type == "search-cancel") {
                if (currentMenu == "addr") {
                    searchAddrCancel();
                } else {
                    searchMessageCancel();
                }
            }
        });
        jQuery("#mailHomeToolbarWrap").on("vclick", "a", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            event.preventDefault();
            closeMoreLayout();
            if (type == "toggle-folder-side") {
                toggleMailFolderSide();
            } else if (type == "write-mail") {
                goWrite();
            } else if (type == "toggle-search-message") {
                toggleSearchMessageWrap();
            } else if (type == "goto-gohome") {
                //GO-22942 iOS에서 이벤트 동작안함 현상으로 인해 수정
                escapewriteAndGoHome();
            } else if (type == "mail-refresh") {
                _this.reloadMessageList();
            } else if (type == "move-folder-cancel" || type == "tag-message-cancel") {
                gotoHistoryBack();
                if (currentMenu == "list") {
                    changeMailContainer("list");
                } else {
                    changeMailContainer("read");
                }
            } else if (type == "download-attach-confirm-close") {
                jQuery("#attachOverlay").hide();
                jQuery("#downloadAttachConfirmLayer").hide();
            } else if (type == "send-check-cancel") {
                checkSendMessageCancel();
                jQuery("#attachOverlay").hide();
            }
        });
        jQuery("#mailWriteToolbarWrap").on("click", "a,span,p", function (event) {
            var act = jQuery(this).attr("evt-act");
            if (!act) return;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            event.preventDefault();
            if (act == "write-cancel") {
                document.activeElement.blur();
                //초기 설정 페이지 일 경우
                if (MOBILE_WEB) {
                    history.back();
                } else {
                    if (historyControl.historyIdx == 1) {
                        if (isAndroidApp()) {
                            window.GOMobile.goHome();
                        } else {
                            window.location.href = "gomobile://goHome";
                        }
                    } else {
                        if (isAndroidApp()) {
                            window.GOMobile.pressBackKey();
                        } else {
                            history.back();
                        }
                    }
                }
            } else if (act == "write-add-address") {
                writeAddrSelect();
            } else if (act == "send-mail") {
                setTimeout(function () {
                    sendMessage();
                }, 100);
            }
        });
        // 툴바이벤트
        jQuery("#mailReadToolbarWrap,#mailListToolbarWrap, #mailWebFolderSelectToolbarWrap, #mailWebSubFolderToolbarWrap").on("click", "a,span,p", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            event.preventDefault();

            if (type == "toolbar") {
                if (currentMenu == "list") {
                    var ignore = ("on" == jQuery(this).attr("ignore"));
                    if (!ignore && getMailListCheckedCount() == 0) {
                        alert(mailMsg.mail_message_notselect);
                        return;
                    }
                }
                var hasSubToolbar = ("on" == jQuery(this).attr("sub"));
                var menu = jQuery(this).attr("menu");
                if (hasSubToolbar) {
                    _this.makeSubToolbar(jQuery(this), menu);
                } else {
                    var act = jQuery(this).attr("evt-act");
                    if (act == "mail-select-all") {
                        var checked = jQuery(this).data("checked");
                        if (checked) {
                            jQuery("input[name=msgId]").each(function () {
                                jQuery(this).prop("checked", false);
                                checkMailListCheckbox(jQuery(this));
                            });
                            jQuery(this).data("checked", false);
                            jQuery(this).find("span.txt").text(mailMsg.mail_select_all);
                        } else {
                            jQuery("input[name=msgId]").each(function () {
                                jQuery(this).prop("checked", true);
                                checkMailListCheckbox(jQuery(this));
                            });
                            jQuery(this).data("checked", true);
                            jQuery(this).find("span.txt").text(mailMsg.mail_select_all_cancel);
                        }
                    } else if (act == "mail-delete") {
                        if (_this.listMode == "mdnlist") {
                            deleteMdn();
                            jQuery("#mailHomeToolbarWrap").show();
                            jQuery("#mailListToolbarWrap").hide();
                            changeStatusBarColor(false);
                        } else {
                            deleteMessage();
                        }
                    } else if (act == "mail-forward") {
                        forwardMessage("parsed");
                    } else if (act == "mail-reply") {
                        replyWrite("reply");
                    } else if (act == "mail-reply-all") {
                        replyWrite("replyall");
                    } else if (act == "write-add-address") {
                        writeAddrSelect();
                    } else if (act == "move-message-page") {
                        moveMessagePage();
                        closeMoreToolbarLayer();
                    } else if (act == "tag-message-page") {
                        tagMessagePage();
                        closeMoreToolbarLayer();
                    } else if (act == "read-pre-message") {
                        readMessage(_this.preNavi.folderName, _this.preNavi.uid);
                    } else if (act == "read-next-message") {
                        readMessage(_this.nextNavi.folderName, _this.nextNavi.uid);
                    } else if (act == "toggle-more-layout") {
                        _this.makeSubToolbar(jQuery(this), menu);
                    } else if (act == "change-flag-seen") {
                        changeSeenFlag(true);
                    } else if (act == "change-flag-unseen") {
                        changeSeenFlag(false);
                    } else if (act == "mail_spam_move") {
                        alert(mailMsg.mail_spam_move);
                        copyMoveMessage("Trash");
                    }
                }
            } else if (type == "reload-list") {
                _this.reloadMessageList();
            } else if (type == "goto-prev-page") {

                if (jQuery("#searchResultWrap ul").length != 0) {
                    jQuery("#goSearch").show();
                    jQuery("#searchResultWrap").show();
                    return;
                }

                setTimeout(function () {
                    gotoHistoryBack();
                }, 100);
            } else if (type == "checked-cancel") {
                closeToolbarMenu();
            } else if (type == "checked-webfolder-cancel") {
                _this.resetCheckedWebFolder();
            } else if (type == "move-parent-webfolder") {
                _this.currentWebFolderInfo = {};
                _this.currentWebFolderInfo.param = _this.webFolderParamHistoryList.pop();
                if (_.contains(_this.currentWebFolderInfo.param.path, jQuery("#mailWebSubFolderToolbarWrap h1").text().trim())) {
                    _this.currentWebFolderInfo.param = _this.webFolderParamHistoryList.pop();
                }
                if (_this.webFolderParamHistoryList.length === 0) {
                    jQuery("#mailWebFolderHomeToolbarWrap").show();
                    jQuery("#mailWebSubFolderToolbarWrap").hide();
                    _this.webFolderParamHistoryList.push(_this.currentWebFolderInfo.param);
                } else {
                    jQuery("#mailWebSubFolderToolbarWrap").show();
                    jQuery("#mailWebFolderHomeToolbarWrap").hide();
                    jQuery("#mailWebSubFolderToolbarWrap h1").text(_this.currentWebFolderInfo.param.path.split(".").slice(-1)[0]);
                }
                _this.currentWebFolderInfo.param.currentPage = 1;
                _this.fetchWebFolderList(_this.currentWebFolderInfo.param);
            } else if (type == "select-webfolder-all") {
                if (jQuery("#select-all").text() === mailMsg.mail_select_all) {
                    jQuery("#webfolder_list input[type=checkbox]").prop("checked", true);
                    jQuery("#select-all").text(mailMsg.mail_select_all_cancel);
                } else {
                    jQuery("#webfolder_list input[type=checkbox]").prop("checked", false);
                    jQuery("#select-all").text(mailMsg.mail_select_all);
                }
                judgmentWebFolderCheckList();
            } else if (type == "attach-webfolder") {
                progressAction({action: true});
                jQuery(window).off('scroll.renderNewWebFolderPage');
                var $paramInfoTarget = jQuery("div.webFolderHeader:visible");
                var param = {
                    path: $paramInfoTarget.attr("data-path"),
                    sharedUserSeq: $paramInfoTarget.attr("data-userseq") === "" ? 0 : $paramInfoTarget.attr("data-userseq"),
                    sroot: $paramInfoTarget.attr("data-sroot"),
                    type: $paramInfoTarget.attr("data-type")
                };
                var _uids = [];
                _.each(jQuery("#webfolder_content").find("li input:checked"), function (file) {
                    _uids.push(jQuery(file).data("uid").toString());
                });
                _this.resetCheckedWebFolder();
                jQuery("#mailWebFolderHomeToolbarWrap").hide();
                jQuery("#mailWebSubFolderToolbarWrap").hide();
                jQuery("#mailWriteToolbarWrap").show();
                param = _.extend(param, {uids: _uids});
                changeMailContainer("write");
                ActionLoader.postSyncGoJsonLoadAction(_this.webfolderAttachWriteAction, param, function (data) {
                    progressAction({action: false});
                    checkUploadfile(data);
                }, "json", function () {
                    alert(mailMsg.alert_attachFile);
                });


            }
        });

        jQuery("#main_content").on("touchstart", "a.flagClass", function (event) {
            var type = jQuery(this).attr("tap-rol");
            if (type == "switch-flag") {
                var flagItem = jQuery(this).find("span.ic");
                var flag = flagItem.attr("flag");
                var flaged = ("on" == flagItem.attr("flaged"));
                var mid = flagItem.closest("li").attr("id");
                switchFlagFlaged([mid], flag, !flaged);
            }
        });
        //컨텐츠 이벤트
        jQuery("#main_content").on("click", "a,span,li", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            event.preventDefault();

            if (type == "switch-flag") {
                var flag = jQuery(this).attr("flag");
                var flaged = ("on" == jQuery(this).attr("flaged"));
                var mid = jQuery(this).closest("li").attr("id");
                switchFlagFlaged([mid], flag, !flaged);
            } else if (type == "read-message") {
                var targetEl = jQuery(this);
                var targetId = targetEl.attr("data-list-id");
                var _pageNo = Math.floor(_.indexOf(_.map(jQuery('ul.list_mail li>a'), function (a) {
                    return jQuery(a).attr('data-list-id')
                }), targetId.toString()) / 20) + 1;
                var selectedMailId = {'listId': targetId};
                sessionStorage.setItem("PAGE-NO", _pageNo);
                sessionStorage.setItem("SELECTED-DOC-ID", JSON.stringify(selectedMailId));
                var folderName = jQuery(this).closest("li").attr("folder");
                var uid = jQuery(this).closest("li").attr("uid");
                readMessage(folderName, uid);
            } else if (type == "draft-message") {
                var folderName = jQuery(this).closest("li").attr("folder");
                var uid = jQuery(this).closest("li").attr("uid");
                writeDraftMessage(folderName, uid);
            } else if (type == "mail-read-toggle-sender-list") {
                var toggleObj = jQuery("#mailReadSenderListWrap");
                if (toggleObj.css("display") == "none") {
                    toggleObj.show();
                    jQuery(this).find("span.ic_arrow2_down").removeClass("ic_arrow2_down").addClass("ic_arrow2_up");
                    setCookie("rcpt_show", "on", 365);
                } else {
                    toggleObj.hide();
                    jQuery(this).find("span.ic_arrow2_up").removeClass("ic_arrow2_up").addClass("ic_arrow2_down");
                    setCookie("rcpt_show", "off", 365);
                }
                if (_this.Iscroll) {
                    _this.makeReadIscroll({isInitRendering: false});
                }
            } else if (type == "mail-read-toggle-attach-list") {
                var toggleObj = jQuery("#mailReadAttachListWrap");
                if (toggleObj.css("display") == "none") {
                    toggleObj.show();
                    jQuery(this).find("span.ic_arrow2_down").removeClass("ic_arrow2_down").addClass("ic_arrow2_up");
                } else {
                    toggleObj.hide();
                    jQuery(this).find("span.ic_arrow2_up").removeClass("ic_arrow2_up").addClass("ic_arrow2_down");
                }
                if (_this.Iscroll) {
                    _this.Iscroll.refresh();
                }
            } else if (type == "download-tnef-attach") {
                var folderName = jQuery("#folderName").val();
                var uid = jQuery("#msgUid").val();
                var part = jQuery(this).closest("li").attr("part");
                var attKey = jQuery(this).attr("attkey");
                downLoadTnefAttach(folderName, uid, part, attKey);
            } else if (type == "download-attach") {
                var isAttachCheck = jQuery(this).attr("evt-data");
                var isAttachConfirm = jQuery("#attachFileWrap").attr("evt-confirm");
                if (isAttachCheck) {
                    openDownloadAttachConfirm();
                } else {
                    var folderName = jQuery("#folderName").val();
                    var uid = jQuery("#msgUid").val();
                    var part = jQuery(this).closest("li").attr("part");
                    var fileName = jQuery(this).closest("li").attr("fileName");
                    var fileSize = jQuery(this).closest("li").attr("fileSize");
                    var param = {"folderName": folderName, "uid": uid, "part": part, "type": "normal"};
                    param = _this.getSharedFolderParam(param);
                    downloadAttach(param, fileName, fileSize);
                }
            } else if (type == "switch-flag-read") {
                var folderName = jQuery("#folderName").val();
                var uid = jQuery("#msgUid").val();
                var flag = jQuery(this).attr("flag");
                var flaged = ("on" == jQuery("#readFlagedFlagIcon").attr("flaged"));
                _this.switchMessagesFlags([uid], [folderName], flag, !flaged, true);
            } else if (type == "show-contents-view") {
                var contents = jQuery("#message_view_table").html();
                POPUPDATA = contents;
                var host = location.protocol + "//" + window.location.host;
                var link = host + '/app/mail/mobile/content';
                if (isAndroidApp()) {
                    window.GOMobile.viewHTML(encodeURIComponent(contents));
                } else if (isIphoneApp()) {
                    window.location.href = "gomobile://viewHTML?" + encodeURIComponent(contents);
                } else {
                    window.open(link, "", "scrollbars=yes");
                }
            } else if (type == "write-mail") {
                goWrite();
            } else if (type == "write-addr-select") {
                jQuery(this).remove();
            } else if (type == "write-toggle-ccbcc") {
                var isOpen = ("open" == jQuery(this).data("toggle"));
                if (isOpen) {
                    jQuery("#mail_write_table tr.ccbccWrap").hide();
                    jQuery(this).data("toggle", "close");
                } else {
                    jQuery("#mail_write_table tr.ccbccWrap").show();
                    jQuery(this).data("toggle", "open");
                }
            } else if (type == "attach-photo") {
                selectAttachPhoto();
            } else if (type == "attach-file") {
                var maxAttachSize = MAILCONFIG.maxAttachSize,
                    configMaxAttachNumber = MAILCONFIG.maxAttachCount,
                    excludeExtension = "",
                    currentCount = jQuery("#attach_wrap li").size(),
                    maxAttachNumber = configMaxAttachNumber - currentCount;

                var totalFileSize = 0;
                jQuery("#attach_wrap li").each(function () {
                    totalFileSize += jQuery(this).attr("filesize") / 1024 / 1024;
                });

                if (maxAttachSize < totalFileSize) {
                    alert(msgArgsReplace(mailMsg.mail_attach_limit_size, [maxAttachSize]));
                    return;
                }

                maxAttachSize -= totalFileSize;

                if (configMaxAttachNumber == 0) {	// unlimited
                    maxAttachNumber = -1;
                } else if (maxAttachNumber < 1) {
                    alert(msgArgsReplace(mailMsg.mail_attach_limit_count, [configMaxAttachNumber]));
                    return false;
                }

                attachFile(maxAttachSize, maxAttachNumber, excludeExtension);
            } else if (type == "folder") {
                var folder = jQuery(this).attr("fname");
                goFolder(folder);
            } else if (type == "mdn-read") {
                var targetEl = jQuery(this);
                var targetId = targetEl.attr("data-list-id");
                var _pageNo = Math.floor(_.indexOf(_.map(jQuery('ul.mail_mdn_list_area li>a'), function (a) {
                    return jQuery(a).attr('data-list-id')
                }), targetId.toString()) / 20) + 1;
                var selectedMailId = {'listId': targetId};
                sessionStorage.setItem("PAGE-NO", _pageNo);
                sessionStorage.setItem("SELECTED-DOC-ID", JSON.stringify(selectedMailId));

                var messageId = jQuery(this).attr("messageId");
                var subject = jQuery(this).attr("subject");
                var dateUtc = jQuery(this).attr("date");
                var param = {"messageId": messageId, "subject": subject, "dateUtc": dateUtc};
                _this.loadMdnRead(param);
            } else if (type == "recall-mdn") {
                var email = jQuery(this).attr("addr");
                recallMsg([email]);
            } else if (type == "delete-attach") {
                if (!confirm(mailMsg.mobile_delete_attach)) {
                    return;
                }
                jQuery(this).closest("li").remove();
            } else if (type == "preview-attach") {
                if (!isCallPreviewAttach) {
                    isCallPreviewAttach = true;
                    progressAction({"action": true});
                    var folderName = jQuery("#folderName").val();
                    var uid = jQuery("#msgUid").val();
                    var part = jQuery(this).closest("li").attr("part");
                    previewAttach(uid, folderName, part);
                }
            } else if (type == "preview-attach-temp") {
                if (!isCallPreviewAttach) {
                    isCallPreviewAttach = true;
                    progressAction({"action": true});
                    var fileName = jQuery(this).closest("li").attr("filename");
                    var filePath = jQuery(this).closest("li").attr("orgname");
                    var hostId = jQuery(this).closest("li").attr("hostid");
                    previewAttachTemp(filePath, fileName, hostId);
                }
            } else if (type == "preview-attach-image") {
                progressAction({"action": true});
                var folderName = jQuery("#folderName").val();
                var uid = jQuery("#msgUid").val();
                var part = jQuery(this).closest("li").attr("part");
                var fileName = jQuery(this).closest("li").attr("fileName");
                previewAttachImage(uid, folderName, part, fileName);
            } else if (type == "layer-write-email") {
                var email = jQuery(this).parent().attr("email");
                goWrieLoad({"to": email});
            } else if (type == "read-nested-pop") {
                var folderName = jQuery("#folderName").val();
                var uid = jQuery("#msgUid").val();
                var part = jQuery(this).closest("li").attr("part");
                readNestedMessage(folderName, uid, part);
            } else if (type == "ext-url") {
                var href = jQuery(this).attr("href");
                executeExtUrl(href);
            } else if (type == "list-page-move") {
                var page = jQuery(this).attr("page");
                _this.movePage(page);
                jQuery(document).scrollTop(0);
            } else if (type == "mail-read-font-resize") {
                jQuery('#fontResizeLayer').toggle();
                fontResizeEventBind();
            } else if (type == "open-write-webfolder") {
                jQuery(window).off('scroll.renderNewWebFolderPage');
                jQuery(window).on('scroll.renderNewWebFolderPage', jQuery.proxy(_this.detectWebFolderListScroll, this));
                jQuery("#mailWriteToolbarWrap").hide();
                jQuery("#mailWebFolderHomeToolbarWrap").show();
                jQuery("#mailWebSubFolderToolbarWrap").hide();
                jQuery("#webFolderDirectory").val("user").attr("selected", "selected");
                _this.webFolderParamHistoryList = [];
                _this.currentWebFolderInfo = {};
                _this.currentWebFolderInfo.param = {
                    path: "/",
                    fullPath: "/"
                };
                changeMailContainer("webFolder");
                _this.getSharedFolderList();
                _this.webFolderParamHistoryList.push(_this.currentWebFolderInfo.param);
                _this.fetchWebFolderList(_this.currentWebFolderInfo.param);
            }
        });

        jQuery("#main_content").on("click", "input", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (type == "write-myself") {
                var checked = jQuery(this).attr("checked");
                makeWriteMyself(checked);
            }
        });

        //첨부파일 -카메라/일범
        jQuery("#attachLayer").on("click", "a", function (event) {
            closeAttachPhoto();
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            event.preventDefault();
            if (type == "attach-take-picture") {
                attachTakePicuture();
            } else if (type == "attach-select-album") {
                attachSelectAlbum();
            }
        });

        jQuery("#sendCheckLayer").on("click", "span, a", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return
            if (type == "send-check-ok") {
                checkSendMessage();
                checkSendMessageCancel();
                jQuery("#attachOverlay").hide();
            } else if (type == "send-check-cancel") {
                checkSendMessageCancel();
                jQuery("#attachOverlay").hide();
            } else if (type == "send-check-apply") {
                settingWriteInfo();
                checkSendMessageCancel();
                jQuery("#attachOverlay").hide();
            }
        });

        jQuery("#downloadAttachConfirmLayer").on("click", "span, a", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return
            if (type == "download-attach-confirm-close") {
                jQuery("#attachOverlay").hide();
                jQuery("#downloadAttachConfirmLayer").hide();
            } else if (type == "attach-confirm-layer-download") {
                var folderName = jQuery("#folderName").val();
                var uid = jQuery("#msgUid").val();
                var part = jQuery(this).closest("li").attr("part");
                var fileName = jQuery(this).closest("li").attr("fileName");
                var fileSize = jQuery(this).closest("li").attr("fileSize");
                var param = {"folderName": folderName, "uid": uid, "part": part, "type": "normal"};
                param = _this.getSharedFolderParam(param);
                downloadAttach(param, fileName, fileSize);
            }
        });

        jQuery("#main_content").on("tap", "input[type=file]", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;

            var configMaxAttachNumber = MAILCONFIG.maxAttachCount,
                currentCount = jQuery("#attach_wrap li").size(),
                maxAttachNumber = configMaxAttachNumber - currentCount;

            if (configMaxAttachNumber == 0) {	// unlimited
                maxAttachNumber = -1;
            } else if (maxAttachNumber < 1) {
                alert(msgArgsReplace(mailMsg.mail_attach_limit_count, [configMaxAttachNumber]));
                return false;
            }

            return true;
        });

        jQuery("#main_content").on("change", "input[type=file]", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            event.preventDefault();

            if (type == "attach-image") {
                var files = jQuery(this).get(0).files;
                _.each(files, function (file) {
                    var maxAttachSize = MAILCONFIG.maxAttachSize;
                    var fileSize = file.size / 1024 / 1024;
                    var fd = new FormData();
                    var nameAndTypeList = file.name.split(".");
                    var type = nameAndTypeList[nameAndTypeList.length - 1];

                    if (type == undefined) {
                        alert(mailMsg.mail_attach_type_exception);
                        return;
                    }

                    var totalFileSize = fileSize;
                    jQuery("#file_wrap li").each(function () {
                        totalFileSize += jQuery(this).attr("filesize") / 1024 / 1024;
                    });

                    jQuery("#img_wrap li").each(function () {
                        totalFileSize += jQuery(this).attr("filesize") / 1024 / 1024;
                    });

                    if (maxAttachSize < totalFileSize) {
                        alert(msgArgsReplace(mailMsg.mail_attach_limit_size, [maxAttachSize]));
                        return;
                    }

                    fd.append('file', file);
                    fd.append('GOSSOcookie', getCookie('GOSSOcookie'));
                    jQuery.ajax({
                        url: _this.writeAttachAction,
                        type: 'POST',
                        contentType: false,
                        processData: false,
                        data: fd,
                        success: function (response) {
                            attachFileSuccess(response);
                        }
                    });
                });
            }
        });

        jQuery("#popSideOverlay").on("swipeleft", function (event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            event.preventDefault();
            hideMailFolderSide();
        });
        jQuery("#popSideOverlay").on('tap', function (event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            event.preventDefault();
            hideMailFolderSide();
        });

        jQuery("#move_folder_page").on("click", "a,span", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (type == "move-message") {
                var mailBox = jQuery(this).attr("folder");
                copyMoveMessage(mailBox);
            } else if (type == "move-folder-cancel") {
                changeMailContainer("list");
            }
        });

        jQuery("#tag_message_page").on("click", "a,span", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (type == "tag-message") {
                var tagId = jQuery(this).attr("val");
                tagMessage(tagId, true);
            } else if (type == "tag-message-cancel") {
                changeMailContainer("list");
            }
        });

        jQuery("#addr_content").on("click", "a,span", function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;

            if (type == "change-addr-type") {
                var addrType = jQuery(this).data("type");
                jQuery("#addr_tab_wrap li").removeClass("on");
                jQuery(this).closest("li").addClass("on");
                changeMailWriteAddrType(addrType, false);
            } else if (type == "list-page-move") {
                var page = jQuery(this).attr("page");
                _this.moveAddrPage(page);
            } else if (type == "write-addr-cancel") {
                jQuery("#mailWriteToolbarWrap").show();
                _this.selectedNodes = [];
                closeAddressContent();
            } else if (type == "add-addr-write") {
                var rcptType = jQuery(this).data("type");
                makeAddrSelectItem(rcptType, _this.selectedNodes);
            }
        });

        jQuery("#webfolder_content").on("click", "a,span", function (e) {
            var $target = jQuery(e.currentTarget);
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;

            if (type == "move-sub-webfolder") {
                _this.currentWebFolderInfo = {};
                jQuery("#mailWebFolderHomeToolbarWrap").hide();
                jQuery("#mailWebSubFolderToolbarWrap").show();
                _this.resetCheckedWebFolder();
                jQuery("#mailWebSubFolderToolbarWrap h1").text($target.text());
                _this.currentWebFolderInfo.param = {
                    type: $target.data('type'),
                    path: $target.data('full-path').split("WEBFOLDERROOT.")[1],
                    fullPath: $target.data('full-path'),
                    nodeNum: $target.data("node-num")
                };
                if ($target.data('type') === "share") {
                    _this.currentWebFolderInfo.param.userSeq = $target.data('userseq');
                    _this.currentWebFolderInfo.param.sroot = $target.data('sroot');
                }
                _this.webFolderParamHistoryList.push(_this.currentWebFolderInfo.param);
                _this.fetchWebFolderList(_this.currentWebFolderInfo.param);
            } else if (type == "choose-webfolder-cancel") {
                closeWebFolder();
            } else if (type == "select-webfolder") {
                $target.next().trigger("click");
                judgmentWebFolderCheckList();
            }
        });

        jQuery("#webfolder_content").on("click", "input[type=checkbox]", function (e) {
            judgmentWebFolderCheckList();
        });

        jQuery("#webfolder_content").on("change", "#webFolderDirectory", function (e) {
            var $target = jQuery(e.currentTarget).find('option:selected');
            _this.webFolderParamHistoryList = [];
            _this.currentWebFolderInfo = {};
            jQuery("#mailWebFolderHomeToolbarWrap").show();
            jQuery("#mailWebSubFolderToolbarWrap").hide();
            _this.resetCheckedWebFolder();
            _this.currentWebFolderInfo.param = {
                type: $target.data("type"),
                fullPath: "WEBFOLDERROOT"
            };
            if ($target.data("type") === "share") {
                _this.currentWebFolderInfo.param = jQuery.extend(_this.currentWebFolderInfo.param, {
                    sroot: $target.data("sroot"),
                    userSeq: $target.data("userseq"),
                    path: $target.data("full-path").split(".")[1],
                    fullPath: $target.data("full-path")
                });
            }
            _this.webFolderParamHistoryList.push(_this.currentWebFolderInfo.param);
            _this.fetchWebFolderList(_this.currentWebFolderInfo.param);
        });

        function selectText(target, selected) {
            var value = target.find('option:' + (selected ? 'selected' : 'first')).text();
            target.closest('a').find('span.txt').text(value);
        }

        /**
         * 주소록 select change
         */
        jQuery("#addr_content").on("change", "select.addr_select", jQuery.proxy(function (event) {
            var _this = this;
            var $target = jQuery(event.currentTarget);
            var addrType = $target.val();
            selectText($target, true);

            jQuery('#addr_content').find('span.depthspan').remove();
            jQuery('#userCheckedScroll').empty();

            if (addrType === 'department') {
                getDept();
            } else if (addrType === 'company') {
                getCompany();
                return;
            } else {
                jQuery("#writeDeptAddrLink").hide();
            }

            changeMailWriteAddrType(addrType, event.isTrigger);

            function getCompany() {
                getCompanyRoot().done(function (data) {
                    var getData = jQuery.ajax({
                        method: 'GET',
                        data: {
                            folderId: data[0].metadata.id
                        },
                        async: false,
                        url: _this.companySelectAction
                    });

                    getData.done(function (data) {
                        if (_.isEmpty(data)) {
                            changeMailWriteAddrType("user", true);
                            return;
                        }
                        var depth = data[0].metadata.parentPathName.split('>').length;
                        var html = Handlebars.compile(jQuery("#addr_company_select_tmpl").html())({
                            isFirst: true,
                            depth: depth,
                            data: data
                        });
                        jQuery("#addr_content div.addr_main").append(html);
                        selectText(jQuery('#addr_content span.depthspan:last select'), false);
                    });

                    jQuery('#addr_content span.depthspan:last').find('select').trigger('change', [event.isTrigger]);
                });
            }

            function getDept() {
                var getData = jQuery.ajax({
                    method: 'GET',
                    async: false,
                    url: _this.deptSelectAction
                });

                getData.done(function (data) {
                    var html = Handlebars.compile(jQuery("#addr_dept_select_tmpl").html())(data);
                    jQuery("#addr_content div.addr_main").append(html);
                    selectText(jQuery('#addr_content span.depthspan:last select'), false);
                });
            }

            function getCompanyRoot() {
                var getData = jQuery.ajax({
                    method: 'GET',
                    async: false,
                    url: _this.companySelectAction
                });

                return getData;
            }
        }, this));

        /**
         * 주소록 부서 select change
         */
        jQuery("#addr_content").on("change", "select.company_addr_select", jQuery.proxy(function (event, isInit) {
            var $target = jQuery(event.currentTarget),
                _this = this;
            var $span = $target.closest('span.depthspan'),
                depth = $span.data('depth'),
                groupId = $target.find('option:selected').val(),
                addrType = jQuery('select.addr_select').val(),
                isReadable = $target.find('option:selected').data('readable');

            removeDepth(depth);
            selectText($target, true);

            if (groupId == '') {
                if (Number(depth) > 1) {
                    var $preSelect = $span.prev().find('select');
                    changeMailWriteAddrType(addrType, isInit, $preSelect.val(), $preSelect.find('option:selected').data('readable'));
                    return;
                }
                return;
            }

            var getData = jQuery.ajax({
                method: 'GET',
                async: false,
                data: {
                    folderId: groupId
                },
                url: _this.companySelectAction
            });

            getData.done(function (data) {
                if (data.length == 0) return;
                var depth = data[0].metadata.parentPathName.split('>').length;
                removeDepth(depth);

                var html = Handlebars.compile(jQuery("#addr_company_select_tmpl").html())({
                    isFirst: false,
                    depth: depth,
                    data: data
                });
                jQuery("#addr_content div.addr_main").append(html);

                selectText(jQuery('#addr_content span.depthspan:last select'), false);
            });

            changeMailWriteAddrType(addrType, isInit, groupId, isReadable);

            function removeDepth(depth) {
                jQuery.each(jQuery('#addr_content span.depthspan'), function () {
                    var targetDepth = Number(jQuery(this).data('depth'));
                    if (Number(depth) < targetDepth) {
                        jQuery(this).remove();
                    }
                });
            }
        }, this));

        /**
         * 주소록 부서 select change
         */
        jQuery("#addr_content").on("change", "select.dept_addr_select", function (event) {
            var $target = jQuery(event.currentTarget);
            var deptId = $target.val();
            $target.closest('a').find('span.txt').text($target.find('option:selected').text());
            var addrType = $target.closest('div').find('select.addr_select').val();
            changeMailWriteAddrType(addrType, false, deptId);
        });

        /**
         * 메일쓰기 주소록 레이어에서 검색
         */
        jQuery('#addr_content input#addrSearchText').on('keyup', function (e) {
            e.preventDefault();
            if (e.keyCode == 13) {
                searchAddr();
                return;
            }
        });

        jQuery('#addrSearchCancel').on('vclick', function (e) {
            e.preventDefault();
            jQuery('#addrSearchText').val('');
            if(jQuery("#writeAddrSelect").val() === "emp"){
            _this.removeOrgList();
            _this.fetchOrgMember('', function(result){
                _this.setHeaderCrumbList(result);
                _this.setOrgMemberByCompany(result)
            });
            } else {
                writeAddrSelect();
            }
        });

        jQuery('#addrSearchBtn').on('vclick', function (e) {
            e.preventDefault();
            searchAddr();
        });

        jQuery('body').on('touchstart', "div.layer_auto_complete", function (event) {
            jQuery(this).addClass('hover_effect');
        });

        jQuery("#main_content").on('tap', 'span', function () {
            var type = jQuery(this).attr("evt-rol");
            if (type == "check-checkbox") {
                jQuery(this).prev().trigger("click");
                checkMailListCheckbox(jQuery(this).prev());
                var dataType = jQuery(this).attr('data-type');
                judgmentCheckList(dataType);
            }
        });

        jQuery("#addr_member_list").on('tap', 'li', function (e) {
            e.preventDefault();
            var type = jQuery(this).find("span").attr("evt-rol");
            if (type == "check-checkbox-only") {
                jQuery(this).find("input").trigger("click");
            }
        });

        //검색 레이어 관련 이벤트
        jQuery('#commonSearchInput').on('keyup', function (e) {
            if (e.keyCode == 13) {
                simpleSearch('all');
                return;
            }
            jQuery('#simpleSearchWrap span.searchText').text(jQuery('#commonSearchInput').val());
        });

        //검색 상단 이벤트
        jQuery("#goSearch").on("vclick", "a", function (e) {
            e.preventDefault();
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (type == "searchCloseButton") {
                jQuery('#simpleSearchTitle').show();
                if (window.History.getState().data.type == "read") {
                    var folderName = mailControl.getCurrentFolder();
                    var param = {"folder": folderName};
                    mailControl.loadMessageList(param);
                }
                closeSearchLayer();
            } else if (type == "detailSearchToggle" || type == "detailSearchTitle") {
                _detailSearchToggle();
            } else if (type == "deleteSearchText") {
                _deleteSearchText();
            } else if (type == "searchInit") {
                jQuery("#detailSearchWrap input[type=search], #detailSearchWrap input[type=checkbox]").prop("checked", false).val('');
                jQuery("#detailSearchWrap select").prop('selectedIndex', 0);
            }

            function _detailSearchToggle() {
                var $detailButton = jQuery('#detailSearchToggle');
                $detailButton.toggleClass('on');
                if ($detailButton.hasClass('on')) {
                    jQuery('#detailSearchTitle, #detailSearchWrap').show();
                    jQuery('#simpleSearchWrap, #simpleSearchTitle').hide();
                } else {
                    jQuery('#simpleSearchTitle, #simpleSearchWrap').show();
                    jQuery('#detailSearchWrap, #detailSearchTitle').hide();
                }
                jQuery('#searchResultWrap').hide();
            }

            function _deleteSearchText() {
                jQuery('#commonSearchInput').val('');
                jQuery('#simpleSearchWrap span.searchText').text('');
                return false;
            }
        });
    };
    this.makeSearchEvent = function () {
        //일반검색
        jQuery('a[data-search]').off();
        jQuery('a[data-search]').on('vclick', function (e) {
            e.preventDefault();
            simpleSearch(jQuery(this).attr("data-search"));
        });
        //상세검색
        jQuery('ul.search_result').off();
        jQuery('ul.search_result').on('keyup', function (e) {
            if (e.keyCode == 13) {
                detailSearch(e);
                return;
            }
        });
    };
    //검색 결과리스트 이벤트
    this.makeSearchResultEvent = function () {
        var _this = this;
        //검색결과 페이지에서 읽기
        jQuery('#searchResultWrap li a.tit').off();
        jQuery('#searchResultWrap li a.tit').on('vclick', function () {
            var type = jQuery(this).closest('li').attr("evt-rol");
            if (type == "read-message") {
                var folderName = jQuery(this).attr("folder");
                var uid = jQuery(this).attr("uid");
                readMessage(folderName, uid);
                closeSearchLayer(true);
            }
        });
        //검색결과 페이지에서 중요메일 클릭
        jQuery("#searchResultWrap li a[tap-rol='switch-flag']").off();
        jQuery("#searchResultWrap li a[tap-rol='switch-flag']").on('vclick', function (event) {
            var flagItem = jQuery(this).find("span.ic");
            var flag = flagItem.attr("flag");
            var flaged = ("on" == flagItem.attr("flaged"));
            var mid = flagItem.closest("li").attr("id");
            switchFlagFlaged([mid], flag, !flaged);
        });

        jQuery("#searchResultWrap li span.checkboxSelect").off();
        jQuery("#searchResultWrap li span.checkboxSelect").on('tap', function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (type == "check-checkbox") {
                jQuery(this).prev().trigger("click");
                checkMailListCheckbox(jQuery(this).prev());
                judgmentSearchCheckList();
            }
        });

        jQuery("#searchResultNav").off();
        jQuery("#searchResultNav").on('tap', 'a', function (event) {
            var type = jQuery(this).attr("evt-rol");
            if (!type) return;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            event.preventDefault();
            if (type == "toolbar") {
                var hasSubToolbar = ("on" == jQuery(this).attr("sub"));
                var menu = jQuery(this).attr("menu");
                if (hasSubToolbar) {
                    _this.makeSubToolbar(jQuery(this), menu);
                } else {
                    var act = jQuery(this).attr("evt-act");
                    if (act == "mail-select-all") {
                        var checked = jQuery(this).data("checked");
                        if (checked) {
                            jQuery("input[name=msgId]").each(function () {
                                jQuery(this).prop("checked", false);
                                checkMailListCheckbox(jQuery(this));
                            });
                            jQuery(this).data("checked", false);
                            jQuery(this).find("span.txt").text(mailMsg.mail_select_all);
                        } else {
                            jQuery("input[name=msgId]").each(function () {
                                jQuery(this).prop("checked", true);
                                checkMailListCheckbox(jQuery(this));
                            });
                            jQuery(this).data("checked", true);
                            jQuery(this).find("span.txt").text(mailMsg.mail_select_all_cancel);
                        }
                    } else if (act == "mail-delete") {
                        deleteMessage();
                        closeSearchLayer();
                    } else if (act == "move-message-page") {
                        moveMessagePage();
                        closeSearchLayer(true);
                        closeMoreToolbarLayer();
                    } else if (act == "tag-message-page") {
                        tagMessagePage();
                        closeSearchLayer(true);
                        closeMoreToolbarLayer();
                    } else if (act == "search-toggle-more-layout") {
                        _this.makeSubToolbar(jQuery(this), menu);
                    } else if (act == "change-flag-seen") {
                        changeSeenFlag(true);
                        closeSearchLayer();
                    } else if (act == "change-flag-unseen") {
                        changeSeenFlag(false);
                        closeSearchLayer();
                    }
                }
            } else if (type == "checked-cancel") {
                jQuery("#searchNav").show();
                jQuery("#searchResultNav").hide();
                jQuery("#searchResultNav div.array_option").hide();
                jQuery("#searchResultWrap input[name=msgId]").each(function () {
                    jQuery(this).prop("checked", false);
                    checkMailListCheckbox(jQuery(this));
                });
                jQuery("#mail_toolbar_search_selectall").data("checked", false);
                jQuery("#mail_toolbar_search_selectall").find("span.txt").text(mailMsg.mail_select_all);
            }
        });
    };
};

function fontResizeEventBind() {
    var _this = this;
    jQuery("#fontResizeLayer ul.list_fs").on("touchmove", function (e) {
        var pos = e.originalEvent.touches[0];
        var dragDom = document.elementFromPoint(pos.pageX, pos.pageY);
        try {
            if (jQuery(dragDom)[0].nodeName && jQuery(dragDom)[0].nodeName == "INPUT") {
                jQuery(dragDom).trigger("click");
            }
        } catch (e) {
            return;
        }
    });
    jQuery("#fontResizeLayer input[name=inpFont]").on("change", function (e) {
        var target = jQuery(e.currentTarget);
        var fontsize = target.val();
        resizeFontSize(parseInt(fontsize));
        setLocalStorage("lastFontSize_"+USERSESSION.id, fontsize);
    });
}

function resizeFontSize(percent) {
    jQuery('#mailContentWrapper').find('span[data-font-resize]').each(function () {
        var originFontSize = jQuery(this).attr("data-origin-fontsize");
        var originLineHeight = jQuery(this).attr("data-origin-lineheight");
        var fontSize = parseFloat(originFontSize) + parseFloat(originFontSize * (percent * 0.01));
        var lineHeight = parseFloat(originLineHeight) + parseFloat(originLineHeight * (percent * 0.01));
        jQuery(this).css({
            'font-size': fontSize.toFixed(3) + 'px',
            'line-height': lineHeight.toFixed(3) + 'px'
        });
    });
    if (this.Iscroll) {
        this.Iscroll.refresh();
    }
};

function closeToolbarMenu() {
    jQuery("#mailHomeToolbarWrap").show();
    jQuery("#mailListToolbarWrap").hide();
    jQuery("#mail_list_area input[name=msgId], #mail_mdn_list_area input[name=msgId]").each(function () {
        jQuery(this).attr("checked", false);
        checkMailListCheckbox(jQuery(this));
    });
    jQuery("#mail_toolbar_list_selectall").data("checked", false);
    jQuery("#mail_toolbar_list_selectall").find("span.txt").text(mailMsg.mail_select_all);
    changeStatusBarColor(false);
}

function isSearchResult() {
    var checkedLength = jQuery("#goSearch").find('li input:checked').length;
    return checkedLength > 0
}

function closeMoreToolbarLayer() {
    var $wrap = jQuery('#toolbar_wrap');
    if (isSearchResult()) {
        $wrap = jQuery('#searchResultNav');
    }
    $wrap.find('div.array_option').hide();
}

function closeSearchLayer(isRead) {
    jQuery("#goSearch input").blur();
    jQuery("#goSearch").hide();
    jQuery('#commonSearchInput').val('');
    jQuery('body').removeClass('scroll_fix');
    initSearhResultLayer(isRead);
}

function initSearhResultLayer(isRead) {
    console.log("initSearchResultLayer");
    jQuery("#searchNav").show();
    jQuery("#searchResultNav").hide();
    if (!isRead) {
        jQuery("#searchResultWrap").html('');
    }
    jQuery("#mail_toolbar_search_selectall").data("checked", false);
    jQuery("#mail_toolbar_search_selectall").find("span.txt").text(mailMsg.mail_select_all);
}

function judgmentCheckList(dataType) {
    var checkCount = jQuery("#main_content").find("li input:checked").length;
    if (checkCount) {
        jQuery("#mailHomeToolbarWrap").hide();
        jQuery("#mailListToolbarWrap").show();
        changeStatusBarColor(true);
    } else {
        jQuery("#mailHomeToolbarWrap").show();
        jQuery("#mailListToolbarWrap").hide();
        changeStatusBarColor(false);
    }
    if (dataType == "mdn") {
        jQuery("#mailListToolbarWrap div.btn_submenu").hide();
        jQuery("#mailListToolbarWrap span.wrap_btn_m_more").hide();
    } else {
        jQuery("#mailListToolbarWrap div.btn_submenu").show();
        jQuery("#mailListToolbarWrap span.wrap_btn_m_more").show();
    }
}

function judgmentSearchCheckList() {
    var checkCount = jQuery("#searchResultWrap").find("li input:checked").length;
    if (checkCount) {
        jQuery("#searchNav").hide();
        jQuery("#searchResultNav").show();
    } else {
        jQuery("#searchNav").show();
        jQuery("#searchResultNav").hide();
        jQuery("#searchResultNav div.array_option").hide();
    }
}

function judgmentWebFolderCheckList() {
    var checkCount = jQuery("#webfolder_content").find("li input:checked").length;
    if (checkCount) {
        jQuery("#mailWebFolderSelectToolbarWrap").show();
    } else {
        jQuery("#mailWebFolderSelectToolbarWrap").hide();
    }
    jQuery("#mailWebFolderSelectToolbarWrap span.count").text(msgArgsReplace(mailMsg.folder_select_number.replace("{number}", "0"), [checkCount]));
}

function closeMoreLayout(moreLayout) {
    if (moreLayout == undefined) {
        moreLayout = jQuery("#more_layout");
    }

    if (moreLayout.is(":visible")) {
        moreLayout.hide();
        return true;
    }
    return false;
}

function getPopupData() {
    return POPUPDATA;
}

function initMailFunction() {
    folderControl = new FolderControl();
    mailControl = new MailControl();
    historyControl = new HistoryControl(mailHistoryCallBack);

    folderControl.makeMailEvent();
    mailControl.makeMailEvent();
}

function mailHistoryCallBack(state) {
    var historyIndex = historyControl.getHistoryIndex();
    var data = state.data;
    if (data && data.param && historyIndex - 1 > data.state) {
        if ((data.type != "empty") && (!checkEscapeWriteMode())) {
            history.forward();
            return;
        }
        switch (data.type) {
            case "list" :
                mailControl.loadMessageList(data.param, true);
                break;
            case "read" :
                mailControl.readMessage(data.param, true);
                break;
            case "mdnlist" :
                mailControl.loadMdnList(data.param, true);
                break;
            case "mdnread" :
                mailControl.loadMdnRead(data.param, true);
                break;
            case "empty" :
                if (currentMenu == "addr") {
                    changeMailWriteMode();
                }
                break;
            case "move" :
                gotoHistoryBack();
                break;
            case "tag" :
                gotoHistoryBack();
                break;
        }
        ;
    } else if (!data || !data.type) {
        var url = state.url;
        if (url.indexOf("app/mail?work=") > 0) {
            if (!checkEscapeWriteMode()) {
                history.forward();
                return;
            }
            gotoHistoryBack();
        }
    }
}

function changeMailContainer(type) {
    var containerObj = jQuery("#main_content");
    if (type == "addr" || type == "moveFolder" || type == "tag" || type == "webFolder") {
        jQuery("#go_content").hide();
        if (type == "addr") {
            jQuery("#addr_content").show();
            containerObj.removeClass("write");
        } else if (type == "tag") {
            jQuery("#tag_message_page").show();
        } else if (type == "moveFolder") {
            jQuery("#move_folder_page").show();
        } else {
            jQuery("#webfolder_content").show();
        }
    } else {
        jQuery("#addr_content").hide();
        jQuery("#webfolder_content").hide();
        jQuery("#move_folder_page").hide();
        jQuery("#tag_message_page").hide();
        jQuery("#go_content").show();
        if (type == "write") {
            if (!containerObj.hasClass("write")) {
                containerObj.addClass("write");
            }
        } else {
            containerObj.removeClass("write");
        }
    }
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

function isContainedTrashMail() {
    return jQuery("li[folder=Trash] input:checked").length > 0;
}

function getMailListCheckedObj() {
    var obj;
    if (currentMenu == "read") {
        obj = jQuery("#messageListId");
    } else {
        var $wrap = jQuery('#main_content');
        if (isSearchResult()) {
            $wrap = jQuery('#searchResultWrap');
        }
        obj = $wrap.find('input[name=msgId]:checked');
    }
    return obj;
}

function getMailListCheckedCount() {
    return getMailListCheckedObj().length;
}

function getMailListCheckedIdArray() {
    var listArray = new Array();
    if (currentMenu == "read") {
        listArray.push(getMailListCheckedObj().val());
    } else {
        getMailListCheckedObj().each(function () {
            listArray.push(jQuery(this).closest("li").attr("id"));
        });
    }
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

function checkSuccess(data) {
    if (data && data.isSuccess) {
        return true;
    } else {
        if (data && data.failMsg) {
            alert(data.failMsg);
        }
        return false;
    }
}

function checkMailListCheckbox(obj) {
    var target = jQuery(obj).closest("li");
    if (obj.attr("checked")) {
        if (!target.hasClass("choice")) {
            target.addClass("choice");
        }
    } else {
        if (target.hasClass("choice")) {
            target.removeClass("choice");
        }
    }
}

function checkEscapeWriteMode() {
    if (currentMenu == "write" || currentMenu == "addr") {
        if (isWriteModify() && confirm(mailMsg.mail_draft_save)) {
            doDraftSave();
        }
        hideAutoComplate();
    }
    return true;
}

function escapewriteAndGoHome() {
    if (currentMenu == "write" || currentMenu == "addr") {
        if (isWriteModify()) {
            setTimeout(function () {
                if (confirm(mailMsg.confirm_mobile_escapewrite)) {
                    hideAutoComplate();
                    window.location = "/app/home";
                }
            }, 200);
        } else {
            hideAutoComplate();
            window.location = "/app/home";
        }
    } else {
        window.location = "/app/home";
    }
}

function isWriteModify() {
    var addrCnt = getRcptFormCount();
    if (addrCnt > 0) return true;

    var subject = jQuery.trim(jQuery("#subject").val());
    if (subject != "") return true;

    var content = jQuery.trim(jQuery("#content").val());
    if (content != "") return true;

    var attachCnt = jQuery("#file_wrap li").length;
    attachCnt += jQuery("#img_wrap li").length;
    if (attachCnt > 0) return true;

    return false;
}

function mailWriteInit(data) {
    makeInputAddresskeyEvt("to");
    makeInputAddresskeyEvt("cc");
    makeInputAddresskeyEvt("bcc");
    var options = {
        // GO-13554
        // 현상 : 모바일에서 참조인을 추가하면 textArea#cc 가 작아지는현상.
        // 원인 : textArea 가 숨겨져 있는상태에선 defaultWidth를 잡아도 의미가 없기 때문에 발생하는 문제.
        // 해결 : autoResizeWidth 를 false 로 하도록 한다.
        // 추신 : 만약 autoResize 를 flase 로 함으로 인해 다른 문제가 발생하는경우
        // 		  모든 view 를 visible 로 두고 rendering 순서를 바꾸는게 좋을듯
        "autoResizeWidth": false,
        "makeFormat": true,
        "multiple": false,
        "matchCase": true,
        "notContact": (USE_CONTACT == true ? "F" : "T")
    };
    jQuery("#to").autocomplete(mailControl.searchAddressAction, options);
    jQuery("#cc").autocomplete(mailControl.searchAddressAction, options);
    jQuery("#bcc").autocomplete(mailControl.searchAddressAction, options);

    makeInputAddressFormat("to", data.to);
    makeInputAddressFormat("cc", data.cc);
    makeInputAddressFormat("bcc", data.bcc);

    isSendInfoCheckUse = data.sendCheckConfig.sendCheckApply;
    isSendEmailCheckUse = data.sendCheckConfig.sendEmailCheck;
    isSendAttachCheckUse = data.sendCheckConfig.sendAttachCheck;
    sendAttachData = data.sendCheckConfig.sendAttachData;
    isSendKeywordCheckUse = data.sendCheckConfig.sendKeywordCheck;
    sendKeywordData = data.sendCheckConfig.sendKeywordData;

    MAX_ATTACH_SIZE = data.attachConfig.maxAttachSize;

    checkCcBccRcptArea();

    mailControl.getSignList();

    jQuery("#content").css('min-height', jQuery("#content").height());
    jQuery("#content").on('keyup paste change', function () {
        jQuery(this).height(1);
        jQuery(this).height( jQuery(this).prop('scrollHeight') + 12 );
    });
}

function resizeTextFrame(height, width) {
    document.getElementById("messageContentFrame").style.height = height + 25 + "px";
    document.getElementById("messageContentFrame").style.width = width + "px";
}

function getMessageText() {
    return document.getElementById("messageText").value;
}

function makeInputAddressFormat(fromId, addressStr) {
    if (!addressStr) return;
    addressStr = jQuery.trim(addressStr);
    addressArray = addressStr.split(",");
    for (var i = 0; i < addressArray.length; i++) {
        makeAddressUnitFormat(fromId, addressArray[i]);
    }
}

function makeAddressUnitFormat(fromId, value) {
    var isSameValue = false;
    if (jQuery.trim(value) == "") return;
    _.each(jQuery("#" + fromId + "AddrWrap span.name"), function (addedEmail) {
        if (addedEmail.title.indexOf(value.substring(value.indexOf("<"))) > -1) {
            isSameValue = true;
            return;
        }
    });
    if (isSameValue) {
        return;
    }
    var $input = jQuery("#" + fromId);
    var nameField = jQuery('<span class="name"></span>').attr("title", value).data("email", value).text(getFormatName(value, MAIL_EXPOSURE == false, LOCAL_DOMAIN));
    var delField = jQuery('<span class="ic ic_del"></span>');
    delField.click(function () {
        jQuery(this).closest('a.adr').remove();
        $input.focus();
    });
    var delWrap = jQuery('<span class="btn_wrap" style="display:inline-block;"></span>').append(delField);
    var addrWrap = jQuery("<li evt-rol='write-addr-select'></li>");
    addrWrap.append(nameField).append(delWrap);
    //$input.closest('li').before(jQuery('<a href="javascript:;" evt-rol="write-addr-select" class="adr"></a>').append(addrWrap));
    $input.closest('li').before(addrWrap);
    $input.val("");
    $input.focus();
}

function deleteAddressUnitFormat(fromId, item) {
    jQuery(item).remove();
    jQuery("#" + fromId).focus();
}

function deleteAddressUnitFormatAll(type) {
    jQuery("#" + type + "AddrWrap ul.name_tag li:not(.creat)").remove();
}

function makeInputAddresskeyEvt(fromId) {
    jQuery("#" + fromId)
        .blur(function (event) {
            event.preventDefault();
            var value = jQuery.trim(jQuery(this).val());
            var fromIdObj = jQuery("#" + fromId + "_actb");
            if (fromIdObj.length == 0 || fromIdObj.css("display") == "none") {
                makeInputAddressFormat(fromId, value);
            } else {
                setTimeout(function () {
                    if (jQuery("div.layer_auto_complete").hasClass("hover_effect")) {
                        jQuery(this).val("");
                        jQuery("div.layer_auto_complete").removeClass("hover_effect");
                    } else {
                        makeInputAddressFormat(fromId, value);
                    }
                }, 200);
            }
        });

    jQuery("#" + fromId + "AddrWrap ul.name_tag").click(function (e) {
        jQuery("#" + fromId).focus();
    });
}

function getRcptFormCount() {
    var addrType = ["to", "cc", "bcc"];
    var count = 0;
    for (var i = 0; i < addrType.length; i++) {
        jQuery("#" + addrType[i] + "AddrWrap li span.name").each(function () {
            count++;
        });
    }
    return count;
}

function makeRcptForm(param) {
    if (!param) param = {};
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
    return param;
}

function checkCcBccRcptArea() {
    var addrType = ["cc", "bcc"];
    var count = 0;
    for (var i = 0; i < addrType.length; i++) {
        jQuery("#" + addrType[i] + "AddrWrap li span.name").each(function () {
            count++;
        });
    }
    if (count > 0) {
        jQuery("#mail_write_table tr.ccbccWrap").show();
        jQuery("#toggle_ccbcc_link").data("toggle", "open");
    }
}

function hideAutoComplate() {
    jQuery("#to").unautocomplete();
    jQuery("#cc").unautocomplete();
    jQuery("#bcc").unautocomplete();
}

function getFileSizeWithUnit(bytesize, fixedLength) {
    var orgsize = parseInt(bytesize) || 0,
        UNIT = {
            'K': 1024,
            'M': 1048576,
            'G': 1.0737e+9,
            'T': 1.0995e+12
        }, basebyte = 0, postfix = 'B';


    // 킬로바이트
    if (orgsize > UNIT.T) {
        basebyte = UNIT.T;
        postfix = 'T' + postfix;
    }
    // 메가바이트
    else if (orgsize > UNIT.G) {
        basebyte = UNIT.G;
        postfix = 'G' + postfix;
    }
    // 기가바이트
    else if (orgsize > UNIT.M) {
        basebyte = UNIT.M;
        postfix = 'M' + postfix;
    }
    // 테라바이트
    else {
        basebyte = UNIT.K;
        postfix = 'K' + postfix;
    }

    return (orgsize / basebyte).toFixed(fixedLength) + ' ' + postfix;
}

function getFileIconStyle(ext) {
    var extension = ext.toLowerCase(),
        reExt = new RegExp("(zip|doc|docx|ppt|pptx|xls|xlsx|hwp|pdf|txt|html|htm|jpg|jpeg|png|gif|tif|tiff|bmp|exe|avi|mp3|mp4|mov|mpg|mpeg|lzh|xml|log|csv|eml)", "gi");

    return 'ic_' + (reExt.test(extension) ? extension : 'def');
}

function isImage(type) {
    var re = new RegExp("(jpeg|jpg|gif|png|bmp|tiff|tif)", "gi");
    if (re.test(type)) {
        return true;
    }
    ;
    return false;
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