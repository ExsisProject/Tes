Handlebars.registerHelper('flagClass', function (flagStr, options) {
    var flagClass = "ic_read_no";
    var title = mailMsg.mail_flag_unseen_message;
    if (flagStr.indexOf("A") > -1) {
        if (flagStr.indexOf("S") > -1) {
            flagClass = "ic_read_reply";
            title = mailMsg.mail_flag_reply_message;
        } else {
            flagClass = "ic_noread_reply";
            title = mailMsg.mail_flag_reply_unseen_message;
        }
    } else if (flagStr.indexOf("C") > -1) {
        if (flagStr.indexOf("S") > -1) {
            flagClass = "ic_read_fw";
            title = mailMsg.mail_flag_forward_message;
        } else {
            flagClass = "ic_noread_fw";
            title = mailMsg.mail_flag_forward_unseen_message;
        }

    } else if (flagStr.indexOf("S") > -1) {
        flagClass = "ic_read_yes";
        title = mailMsg.mail_flag_seen_message;
    }
    var result = '<span class="ic flagClass ' + flagClass + '" title="' + title + '"></span>';
    return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('flagClassMobile', function (flagStr, options) {
    var flagClass = "ic_mail";
    var title = mailMsg.mail_flag_unseen_message;
    if (flagStr.indexOf("A") > -1) {
        if (flagStr.indexOf("S") > -1) {
            flagClass = "ic_read_reply";
            title = mailMsg.mail_flag_reply_message;
        } else {
            flagClass = "ic_noread_reply";
            title = mailMsg.mail_flag_reply_unseen_message;
        }
    } else if (flagStr.indexOf("C") > -1) {
        if (flagStr.indexOf("S") > -1) {
            flagClass = "ic_read_fw";
            title = mailMsg.mail_flag_forward_message;
        } else {
            flagClass = "ic_noread_fw";
            title = mailMsg.mail_flag_forward_unseen_message;
        }

    } else if (flagStr.indexOf("S") > -1) {
        flagClass = "ic_mail_read";
        title = mailMsg.mail_flag_seen_message;
    }
    var result = '<span class="ic ' + flagClass + '" title="' + title + '"></span>';
    return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('folderDepthName', function (folderName, options) {
    if (folderName == "Inbox") {
        folderName = mailMsg.folder_inbox;
    } else if (folderName == "Sent") {
        folderName = mailMsg.folder_sent;
    } else if (folderName == "Drafts") {
        folderName = mailMsg.folder_drafts;
    } else if (folderName == "Reserved") {
        folderName = mailMsg.folder_reserved;
    } else if (folderName == "Spam") {
        folderName = mailMsg.folder_spam;
    } else if (folderName == "Trash") {
        folderName = mailMsg.folder_trash;
    } else if (folderName == "bill_box") {
        folderName = mailMsg.folder_bill;
    } else if (folderName == "adv_box") {
        folderName = mailMsg.folder_adv;
    } else if (folderName == "sns_box") {
        folderName = mailMsg.folder_sns;
    }
    return folderName;
});

Handlebars.registerHelper('viewMoveFolderName', function (mailBox, options) {
    var folderName = replaceAll(mailBox, "move ", "");
    if (folderName == "Inbox") {
        folderName = mailMsg.folder_inbox;
    } else if (folderName == "Sent") {
        folderName = mailMsg.folder_sent;
    } else if (folderName == "Drafts") {
        folderName = mailMsg.folder_drafts;
    } else if (folderName == "Reserved") {
        folderName = mailMsg.folder_reserved;
    } else if (folderName == "Spam") {
        folderName = mailMsg.folder_spam;
    } else if (folderName == "Trash") {
        folderName = mailMsg.folder_trash;
    } else if (folderName == "bill_box") {
        folderName = mailMsg.folder_bill;
    } else if (folderName == "adv_box") {
        folderName = mailMsg.folder_adv;
    } else if (folderName == "sns_box") {
        folderName = mailMsg.folder_sns;
    } else {
        folderName = replaceInboxChild(folderName);
    }
    return folderName;
});

Handlebars.registerHelper('viewTagName', function (tagPolicy, options) {
    var tagId = replaceAll(tagPolicy, "tag ", "");
    var tagInfo = getTagInfo(tagId);
    return (tagInfo) ? tagInfo.name : "";
});


Handlebars.registerHelper('emailName', function (emailFormat, options) {
    if (jQuery.trim(emailFormat) == "") return "";
    return (get_name(emailFormat) == "") ? get_email(emailFormat) : get_name(emailFormat);
});

Handlebars.registerHelper('makeEmailAddress', function (name, email, options) {
    return getEmailFormat(name, email);
});

Handlebars.registerHelper('makeEmailFormatName', function (emailFormat, options) {
    return getFormatName(emailFormat);
});

Handlebars.registerHelper('makeMdn', function (code, mdnTime, options) {
    var pstr = "";
    if (code == "1") {
        pstr = mailMsg.mail_mdn_recall;
    } else if (code == "1000") {
        pstr = Handlebars.helpers.printMdnTimeDate.apply(this, [mdnTime]);
    } else if (code == "100") {
        pstr = mailMsg.mail_mdn_wait;
    } else if (code == "200" || code == "201" || code == "300") {
        pstr = mailMsg.mail_mdn_unseen;
    } else {
        pstr = mailMsg.mail_mdn_fail;
    }
    return pstr;
});

Handlebars.registerHelper('isMdnCheck', function (localDomain, code, options) {
    if (arguments.length < 3) throw new Error("Handlebars Helper equal needs 2 parameters");
    if (localDomain && (code == "200" || code == "201" || code == "300")) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('printSize', function (size, options) {
    return printSize(size);
});

Handlebars.registerHelper('printDate', function (delimiter, date, options) {
    var dateFormat = date;
    if (date && date.length >= 8) {
        dateFormat = date.substring(0, 4) + delimiter + date.substring(4, 6) + delimiter + date.substring(6, 8);
    }
    return dateFormat;
});

Handlebars.registerHelper('fileExt', function (fileName, options) {
    if (!fileName || fileName == "") return "unknown";
    return fileName.substring((fileName.lastIndexOf(".") + 1), fileName.length);
});

Handlebars.registerHelper('printDateDesc', function (folderType, term, dateSetUtc, options) {
    var subTemplate = Handlebars.compile(jQuery('#mail_list_date_tmpl').html());
    var param = {};
    var msg = "";
    param.folderType = folderType;
    param.term = term;

    if (listDateStore == term) {
        return;
    }
    listDateStore = term;

    if (term < 7) {
        if (term == 0) {
            msg = mailMsg.mail_date_today;
        } else if (term == 1) {
            msg = mailMsg.mail_date_yesterday;
        }
        if (dateSetUtc[term]) {
            param.format = moment(dateSetUtc[term]).format('YYYY-MM-DD (ddd)');
        }
    } else if (term == 7) {
        msg = mailMsg.mail_date_lastweek;
    } else if (term == 8) {
        msg = mailMsg.mail_date_twoweeksago;
    } else if (term == 9) {
        msg = mailMsg.mail_date_threeweeksago;
    } else if (term > 9) {
        msg = mailMsg.mail_date_longago;
    }
    param.msg = msg;
    return new Handlebars.SafeString(subTemplate(param));
});

Handlebars.registerHelper('user_folder_inbox_check', function (context, isInbox, options) {
    var fullName = context.fullName;
    if (isInbox) {
        if (fullName.toLowerCase() == "Inbox".toLowerCase() || fullName.toLowerCase().indexOf("Inbox.".toLowerCase()) == 0) {
            return options.fn(this);
        }
    } else {
        if (fullName.toLowerCase() != "Inbox".toLowerCase() && fullName.toLowerCase().indexOf("Inbox.".toLowerCase()) < 0) {
            return options.fn(this);
        }
    }
    return options.inverse(this);
});

Handlebars.registerHelper('replaceInboxChild', function (folderName, options) {
    return replaceInboxChild(folderName);
});

Handlebars.registerHelper('isUserFolder', function (folderName, options) {
    if (isDefaultBoxCheck(folderName)) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

Handlebars.registerHelper('isNotgroupAgingZero', function (groupAging, options) {
    if (groupAging != 0) {
        return options.fn(this);
    } else {
        options.inverse(this);
    }
});

Handlebars.registerHelper('isOvergroupAging', function (groupAging, aging, options) {
    if (groupAging == 0) {
        options.inverse(this);
    } else if (groupAging < aging) {
        return options.fn(this);
    } else {
        options.inverse(this);
    }
});

Handlebars.registerHelper('isCustomAging', function (groupAging, options) {
    var aging = [0, 30, 90, 120];
    for (var i = 0; i < aging.length; i++) {
        if (aging[i] == groupAging) {
            return options.inverse(this);
        }
    }
    return options.fn(this);
});

/**
 * groupAging - admin 에서 설정한 유효기간
 * aging - 현재 메일함의 유효기간
 * value - 현재 select HTML 의 선택된 value
 */
Handlebars.registerHelper('selectAging', function (groupAging, aging, value, options) {

    var agingDuration = aging;
    var deafultAgingDuration = 0;
    if (aging == deafultAgingDuration || (groupAging != deafultAgingDuration && groupAging < aging)) {
        agingDuration = groupAging;
    }
    if (agingDuration == value) {
        return "selected";
    } else {
        return "";
    }
});

Handlebars.registerHelper('displayFolderName', function (folderName, options) {
    if (!folderName || folderName == "") return "";
    if (folderName.indexOf(".") > 0) {
        return folderName.substring((folderName.lastIndexOf(".") + 1), folderName.length);
    } else {
        return folderName;
    }
});

Handlebars.registerHelper('displayBookmark', function (bookmarkType, bookmarkName, options) {
    return mailBookmarkName(bookmarkType, bookmarkName);
});

Handlebars.registerHelper('bookmarkCss', function (bookmarkType, bookmarkName, options) {
    var bookmarkCss = "";
    if (bookmarkType == "flaged") {
        bookmarkCss = "mail_important";
    } else if (bookmarkType == "unseen") {
        bookmarkCss = "mail_noread";
    } else if (bookmarkType == "seen") {
        bookmarkCss = "mail_read";
    } else if (bookmarkType == "today") {
        bookmarkCss = "mail_today";
    } else if (bookmarkType == "yesterday") {
        bookmarkCss = "mail_yesterday";
    } else if (bookmarkType == "attach") {
        bookmarkCss = "mail_file";
    } else if (bookmarkType == "reply") {
        bookmarkCss = "mail_reply";
    } else if (bookmarkType == "myself") {
        bookmarkCss = "mail_me";
    } else if (bookmarkType == "mail") {
        bookmarkCss = "folder";
        if (bookmarkName == "Inbox") {
            bookmarkCss = "mail_inbox";
        } else if (bookmarkName == "Sent") {
            bookmarkCss = "mail_sent";
        } else if (bookmarkName == "Drafts") {
            bookmarkCss = "mail_draft";
        } else if (bookmarkName == "Reserved") {
            bookmarkCss = "mail_reserved";
        } else if (bookmarkName == "Spam") {
            bookmarkCss = "mail_spam";
        } else if (bookmarkName == "Trash") {
            bookmarkCss = "trash";
        }
    } else {
        bookmarkCss = "star";
    }
    return bookmarkCss;
});

Handlebars.registerHelper('mobileFileName', function (fileName, options) {
    if (!fileName || fileName == "") return "";
    if (fileName.lastIndexOf(".") <= 0) return fileName;
    fileName = fileName.substring(0, fileName.lastIndexOf("."));
    return fileName;
});

Handlebars.registerHelper('mobileFileExt', function (fileName, options) {
    if (!fileName || fileName == "") return "";
    if (fileName.lastIndexOf(".") <= 0) return "";
    var fileType = fileName.substring(fileName.lastIndexOf("."), fileName.length);
    return fileType;
});

Handlebars.registerHelper('mobileFileIcon', function (fileType, options) {
    fileType = fileType.toLowerCase();

    if (fileType.lastIndexOf(".") > 0) {
        fileType = fileType.substring(fileType.lastIndexOf(".") + 1, fileType.length);
    }
    var cssType = "";
    if (fileType == "pdf" || fileType == "ppt" || fileType == "pptx" || fileType == "xls" || fileType == "xlsx" || fileType == "doc" || fileType == "docx" || fileType == "hwp" || fileType == "zip" || fileType == "txt" || fileType == "html" || fileType == "xml" || fileType == "mpeg" || fileType == "avi" || fileType == "htm" || fileType == "mp3" || fileType == "mp4" || fileType == "exe" || fileType == "csv" || fileType == "log" || fileType == "lzh") {
        cssType = fileType;
    } else if (isImgFile("xxx." + fileType)) {
        if (fileType == "jpg" || fileType == "png" || fileType == "gif" || fileType == "tif" || fileType == "bmp" || fileType == "tiff" || fileType == "jpeg") cssType = fileType;
    } else {
        cssType = "def";
    }
    return cssType;
});

Handlebars.registerHelper('acceptConverter', function (fileType, options) {
    if (!fileType || fileType == "") return options.inverse(this);
    fileType = fileType.toLowerCase();
    var acceptType = "doc|docx|hwp|ppt|pptx|xls|xlsx|pdf|gif|jpg|jpeg|bmp|png|txt";
    var regExp = new RegExp("(" + acceptType + ")$", "i");
    if (regExp.test(fileType)) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('acceptConverterMobile', function (fileType, options) {
    if (!fileType || fileType == "") return options.inverse(this);
    fileType = fileType.toLowerCase();
    var acceptType = "doc|docx|hwp|ppt|pptx|xls|xlsx|pdf|txt";
    var regExp = new RegExp("(" + acceptType + ")$", "i");
    if (regExp.test(fileType)) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('makeTreeLink', function (fid, options) {
    var link = jQuery('<span evt-rol="toggle-mail-folder"></span>');
    var status = getCookie("DFN_" + fid);
    if (status == "C") {
        link.addClass("open").attr({"status": "close", "fid": fid, "title": mailMsg.comn_open});
    } else {
        link.addClass("close").attr({"status": "open", "fid": fid, "title": mailMsg.comn_close});
    }
    var tmpLinkWrap = jQuery("<span></span>").append(link);
    return new Handlebars.SafeString(tmpLinkWrap.html());
});

Handlebars.registerHelper('closeTreeLink', function (parentId, options) {
    var status = getCookie("DFN_" + parentId);
    if (status == "C") {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('printFromPage', function (page, pageBase, options) {
    page = Number(page);
    page -= 1;
    pageBase = Number(pageBase);
    var intval = parseInt(page * pageBase, 10);
    return intval + 1;
});

Handlebars.registerHelper('printToPage', function (page, total, pageBase, options) {
    page = Number(page);
    total = Number(total);
    pageBase = Number(pageBase);
    var intval = parseInt(page * pageBase, 10);
    intval = (intval > total) ? total : intval;
    return intval;
});

Handlebars.registerHelper('mobileBookmarkCss', function (bookmarkType, bookmarkName, options) {
    var bookmarkCss = "";
    if (bookmarkType == "flaged") {
        bookmarkCss = "ic_side ic_mail_important";
    } else if (bookmarkType == "unseen") {
        bookmarkCss = "ic_side ic_mail_noread";
    } else if (bookmarkType == "seen") {
        bookmarkCss = "ic_side ic_mail_read";
    } else if (bookmarkType == "today") {
        bookmarkCss = "ic_side ic_mail_today";
    } else if (bookmarkType == "yesterday") {
        bookmarkCss = "ic_side ic_mail_yesterday";
    } else if (bookmarkType == "attach") {
        bookmarkCss = "ic_side ic_mail_file";
    } else if (bookmarkType == "reply") {
        bookmarkCss = "ic_side ic_mail_reply";
    } else if (bookmarkType == "myself") {
        bookmarkCss = "ic_side ic_mail_me";
    } else if (bookmarkType == "tag") {
        bookmarkCss = "ic_side ic_favori";
    } else if (bookmarkType == "mail") {
        bookmarkCss = "folder";
        if (bookmarkName == "Inbox") {
            bookmarkCss = "ic_side ic_mail_receive";
        } else if (bookmarkName == "Sent") {
            bookmarkCss = "ic_side ic_mail_send";
        } else if (bookmarkName == "Drafts") {
            bookmarkCss = "ic_side ic_mail_temp";
        } else if (bookmarkName == "Reserved") {
            bookmarkCss = "ic_side ic_mail_reserve";
        } else if (bookmarkName == "Spam") {
            bookmarkCss = "ic_side ic_mail_spam";
        } else if (bookmarkName == "Trash") {
            bookmarkCss = "ic_side ic_mail_basket";
        } else {
            bookmarkCss = "ic_side ic_mail";
        }
    } else {
        bookmarkCss = "ic_side ic_mail";
    }
    return bookmarkCss;
});

/**
 * 메일 목록의 보낸일자/수신일자 표현(PC용)
 */
Handlebars.registerHelper('printListDate', function (datestr, options) {
    var format;
    var mdate = moment(datestr);
    var today = new Date();

    if (mdate.isSame(today, 'day')) {
        format = 'HH:mm';
    } else {
        format = 'YY-MM-DD HH:mm';
    }

    return mdate.format(format);
});

Handlebars.registerHelper('printReadDate', function (datestr, options) {
    var format = "YYYY/MM/DD dddd a h:mm:ss";
    var mdate = moment(datestr);

    return mdate.format(format);
});

/**
 * 메일 목록의 보낸일자/수신일자 표현(모바일용)
 */
Handlebars.registerHelper('printMdnListDate', function (datestr, options) {
    var today = new Date();
    var mdate = moment(datestr);
    var format;
    if (mdate.isSame(today, 'day')) {
        format = 'HH:mm';
    } else if (mdate.isSame(today, 'year')) {
        format = 'MM-DD';
    } else {
        format = 'YY-MM-DD';
    }
    return mdate.format(format);
});

Handlebars.registerHelper('printMdnTimeDate', function (datestr, options) {
    var today = new Date();
    var mdate = moment(datestr);
    var format;
    if (mdate.isSame(today, 'day')) {
        format = 'HH:mm:ss';
    } else {
        format = 'YYYY/MM/DD';
    }
    return mdate.format(format);
});

Handlebars.registerHelper('printMdnReadMessage', function (datestr, options) {
    var mdate = moment(datestr);
    var format = "YYYY/MM/DD (HH:mm)";
    var message = "";
    if (mdate.isValid()) {
        message = mdate.format(format);
    } else {
        message = datestr;
    }
    return message;
});

Handlebars.registerHelper('printFormatDate', function (datestr, format, options) {
    if (datestr == "") {
        return;
    }
    var mdate = moment(datestr);
    return mdate.format(format);
});


Handlebars.registerHelper('printSmartFolder', function (str, options) {
    if (str == "") {
        return;
    }

    if (str == "bill_box") {
        str = "bill";
    } else if (str == "sns_box") {
        str = "sns";
    } else if (str == "adv_box") {
        return "ad";
    }
    return str;
});

Handlebars.registerHelper('printSmartFolderMobile', function (str, options) {
    if (str == "") {
        return;
    }
    if (str == "bill_box") {
        str = "ic_mail_bill";
    } else if (str == "sns_box") {
        str = "ic_mail_sns";
    } else if (str == "adv_box") {
        return "ic_mail_ad";
    }
    return str;
});

Handlebars.registerHelper('isSmartFolder', function (folder, options) {
    if (folder == "bill_box" || folder == "sns_box" || folder == "adv_box") {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('printOnlyTime', function (dateStrInUtc, options) {
    var format = "HH:mm";
    var mdate = moment(dateStrInUtc);
    return mdate.format(format);
});

Handlebars.registerHelper('printFullDate', function (dateStrInUtc, options) {
    var format = "YYYY-MM-DD (dd)";
    var mdate = moment(dateStrInUtc);
    return mdate.format(format);
});

Handlebars.registerHelper('printFullDateTime', function (dateStrInUtc, options) {
    var format = "YYYY-MM-DD (dd) HH:mm";
    var mdate = moment(dateStrInUtc);
    return mdate.format(format);
});

Handlebars.registerHelper('printFullMonth', function (dateStrInUtc, options) {
    var format = "MMM";
    var mdate = moment(dateStrInUtc);
    return mdate.format(format);
});

Handlebars.registerHelper('printSingleDayOfMonth', function (dateStrInUtc, options) {
    var format = "D";
    var mdate = moment(dateStrInUtc);
    return mdate.format(format);
});

Handlebars.registerHelper('printDayOfWeek', function (dateStrInUtc, options) {
    var format = "dd";
    var mdate = moment(dateStrInUtc);
    return mdate.format(format);
});

Handlebars.registerHelper('printNationText', function (code, text, options) {
    if (code == "local" || code == "private" || code == "unknown") {
        text = mailMsg["common_ip_" + code];
    }
    return text;
});