// 서버에서 앱인지 판단하는 ${mobileApp} 가 불확실 하여 세션스토리지로 판단 (앱에서 GO-Agent가 유실되는 경우 간간히 발생, 최초로딩에는 정상)
var goAgent_device = sessionStorage.getItem("GO-Agent-mail");
if (goAgent_device != "GO-Android" && goAgent_device != "GO-iPhone") {
    //페이지 미리보기
    window.previewAttach = function (uid, folderName, part) {
        var param = {"folderName": folderName, "uid": uid, "part": part, "type": "normal"};
        param = mailControl.getSharedFolderParam(param);

        ActionLoader.postGoLoadAction("/api/mail/message/attach/preview", param, function (data) {
            removeProcessLoader();
            if (data.convert) {
                if (data.image) {
                    window.location.href = data.previewPath;
                } else {
                    window.location.href = BASEURL + "resources/synap/skin/doc.html?fn=" + data.previewPath + "&rs=/api/preview/rs/" + data.previewPath;
                }
            } else {
                alert(mailMsg.mail_attach_convert_error1);
            }

            isCallPreviewAttach = false;
        }, "json", function () {
            alert(mailMsg.mail_attach_convert_error1);
            isCallPreviewAttach = false;
        });
    }

//임시 첨부파일 미리보기
    window.previewAttachTemp = function (filePath, fileName, hostId) {
        var param = {"filePath": filePath, "fileName": fileName, "hostId": hostId};

        ActionLoader.postGoLoadAction("/api/preview/tempFile", param, function (data) {
            removeProcessLoader();
            /*
           * data.str = resources/synap/skin/doc.html?fn={미리보기전용 파일명}&rs=/api/preview/rs/{미리보기전용 파일명}&originName={기존파일명}
           */
            var previewFileName = data.str.split("&")[0].split("fn=")[1];
            window.location.href = BASEURL + "resources/synap/skin/doc.html?fn=" + previewFileName + "&rs=/api/preview/rs/" + previewFileName;

            isCallPreviewAttach = false;
        }, "json", function () {
            alert(mailMsg.mail_attach_convert_error1);
            isCallPreviewAttach = false;
        });
    }

    window.previewAttachImage = function (uid, folderName, part, fileName) {
        previewAttach(uid, folderName, part);
    }

    window.previewAction = function (url, param) {
        var host = location.protocol + "//" + window.location.host;
        makeProcessLoader();

        ActionLoader.postGoLoadAction(url, param, function (data) {
            removeProcessLoader();
            if (data.convert) {
                if (data.image) {
                    window.location.href = data.previewPath;
                } else {
                    window.location.href = BASEURL + "resources/synap/skin/doc.html?fn=" + data.previewPath + "&rs=/api/preview/rs/" + data.previewPath;
                }
            } else {
                alert(mailMsg.mail_attach_convert_error1);
            }

            isCallPreviewAttach = false;
        }, "json", function () {
            alert(mailMsg.mail_attach_convert_error1);
            isCallPreviewAttach = false;
        });
    }
//사진찍기 첨부
    window.attachTakePicuture = function () {

    }
//앨범 선택 첨부
    window.attachSelectAlbum = function () {

    }

    window.attachFile = function () {
    }

//파일 첨부 성공
    window.attachFileSuccess = function (result) {
        if (isImage(result.data.fileExt)) {
            result.data.formattedFileSize = getFileSizeWithUnit(result.data.fileSize, 2);
            jQuery("#img_wrap").append(getHandlebarsTemplate("mail_attach_image_tmpl", result.data));
        } else {
            var extraData = {
                "calFileSize": getFileSizeWithUnit(result.data.fileSize, 2),
                "fileIcon": getFileIconStyle(result.data.fileExt),
                "fileExt": result.data.fileExt,
                "useHtmlConverter": jQuery("#useHtmlConverter").val(),
                "useMobilePreviewOption": jQuery("#useMobilePreviewOption").val()
            };

            jQuery("#file_wrap").append(getHandlebarsTemplate("mail_attach_file_tmpl", jQuery.extend({}, result.data, extraData)));
        }
    }
//파일 첨부 실패
    window.attachFileFail = function (data) {
        alert(mailMsg.alert_attachFile);
    }

    window.isImage = function (extention) {
        var re = new RegExp("(jpg|jpeg|gif|png|bmp|tif)", "gi");
        if (re.test(extention)) {
            return true;
        }
        return false;
    }

    window.isMobileApp = function () {
        var goAgent_device = sessionStorage.getItem("GO-Agent-mail");
        return (goAgent_device == "GO-Android" || goAgent_device == "GO-iPhone");
    }

    window.checkOS = function () {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf("android") > -1) {
            return "android";
        } else if (ua.indexOf("iphone") > -1) {
            return "iphone";
        } else if (ua.indexOf("ipad") > -1) {
            return "ipad";
        } else {
            return -1;
        }
    }

    window.isMobile = function () {
        return this.checkOS() != -1;
    };

    window.isAndroidApp = function () {
        return this.isMobileApp() && this.checkOS() == 'android';
    };

//프로그래스 바 호출
    window.progressAction = function (opt) {
    }

    window.downLoadTnefAttach = function (folder, uid, part, tnefKey) {
        var param = {"folderName": folder, "uid": uid, "part": part, "type": "tnef", "tnefKey": tnefKey};
        param = mailControl.getSharedFolderParam(param);
        var host = location.protocol + "//" + window.location.host;
        url = "/api/mail/message/tnef/attach/download?" + jQuery.param(param);
        window.location = host + url;
    }
//첨부파일 다운로드
    window.downloadAttach = function (param, fileName, fileSize) {
        var host = location.protocol + "//" + window.location.host;
        url = "/api/mail/message/attach/download?" + jQuery.param(param);
        window.location = host + url;
    }
//이미지 첨부파일 미리보기
    window.previewAttachImage = function (uid, folderName, part, fileName) {
        previewAttach(uid, folderName, part);
    }

    window.androidHistoryBack = function () {
        hideMailFolderSide();
        closeSearchMessageWrap();
        closeAttachPhoto();
        closeWebFolder();
    }
//외부링크 연결
    window.executeExtUrl = function (url) {
        window.open(url);
    }
//페이지 로딩 완료
    window.pageDone = function () {

    }

// status bar 색상변경
    window.changeStatusBarColor = function (isDark) {
        return;
    }

//뒤로가기 호출
    window.gotoHistoryBack = function () {
        window.history.back();
    }

    window.dormantRelease = function (paramUrl) {
        location.href = paramUrl;
    }

    window.goUrl = function (url, goAgent) {
        console.log("mail-func web goUrl call!! url:" + url + ", agent: " + goAgent);
        if (url.indexOf('http') != -1) {
            window.location.href = url;
        } else {
            GO.router.navigate(url, true);
        }
    }

    window.goToPcVersion = function () {
        document.cookie = "pcVersion=true;path=/";
        document.location.reload();
        return false;
    }

    window.callSessionTimeout = function () {
        window.location = "/";
    }

    window.mailSendComplete = function () {

    }

    window.addReceiverSuccess = function (result) {
        var _result = JSON.parse(result);
        addSelectedMemberInReceiverList("to", _result["receiver"]);
        addSelectedMemberInReceiverList("bcc", _result["hiddenReference"]);
        addSelectedMemberInReceiverList("cc", _result["reference"]);
        checkCcBccRcptArea();
    }

    window.addReceiverFail = function () {
        alert(mailMsg.addr_list_write_insert_fail);
    }
} else {
    //페이지 미리보기
    window.previewAttach = function (uid, folderName, part) {
        var host = location.protocol + "//" + window.location.host;
        var param = {"folderName": folderName, "uid": uid, "part": part, "type": "normal"};
        param = mailControl.getSharedFolderParam(param);
        makeProcessLoader();
        ActionLoader.postGoLoadAction("/api/mail/message/attach/preview", param, function (data) {
            removeProcessLoader();
            if (data.convert) {
                var url = data.previewPath;
                if (!data.image) {
                    url = BASEURL + "resources/synap/skin/doc.html?fn=" + data.previewPath + "&rs=/api/preview/rs/" + data.previewPath;
                }
            } else {
                alert(mailMsg.mail_attach_convert_error1);
            }

            if (isAndroid()) {
                window.GOMobile.attachView(host + url);
            } else if (isIphone() || isIpad()) {
                window.location.href = "gomobile://attachView?" + host + url;
            }
            isCallPreviewAttach = false;
        }, "json", function () {
            alert(mailMsg.mail_attach_convert_error1);
            isCallPreviewAttach = false;
        });
    }

//임시 첨부파일 미리보기
    window.previewAttachTemp = function (filePath, fileName, hostId) {
        var host = location.protocol + "//" + window.location.host;
        var param = {"filePath": filePath, "fileName": fileName, "hostId": hostId};
        makeProcessLoader();
        ActionLoader.postGoLoadAction("/api/preview/tempFile", param, function (data) {
            removeProcessLoader();
            /*
           * data.str = resources/synap/skin/doc.html?fn={미리보기전용 파일명}&rs=/api/preview/rs/{미리보기전용 파일명}&originName={기존파일명}
           */
            var previewFileName = data.str.split("&")[0].split("fn=")[1];
            var url = BASEURL + "resources/synap/skin/doc.html?fn=" + previewFileName + "&rs=/api/preview/rs/" + previewFileName;
            if (isAndroid()) {
                window.GOMobile.attachView(host + url);
            } else if (isIphone() || isIpad()) {
                window.location.href = "gomobile://attachView?" + host + url;
            }
            isCallPreviewAttach = false;
        }, "json", function () {
            alert(mailMsg.mail_attach_convert_error1);
            isCallPreviewAttach = false;
        });
    }

//사진찍기 첨부
    window.attachTakePicuture = function () {
        if (isAndroid()) {
            window.GOMobile.callCamera('attachFileSuccess', 'attachFileFail');
        } else if (isIphone() || isIpad()) {
            window.location = "gomobile://callCamera?attachFileSuccess&attachFileFail";
        }
    }
//앨범 선택 첨부
    window.attachSelectAlbum = function () {
        if (isAndroid()) {
            window.GOMobile.callAlbum('attachFileSuccess', 'attachFileFail');
        } else if (isIphone() || isIpad()) {
            window.location = "gomobile://callAlbum?attachFileSuccess&attachFileFail";
        }
    }

    window.mailSendComplete = function () {
        if (isAndroid()) {
            window.GOMobile.callMailSendComplete();
        } else if (isIphone() || isIpad()) {
            window.location = "gomobile://callMailSendComplete";
        }
    }

    window.attachFile = function (maxAttachSize, maxAttachNumber, excludeExtension) {
        try {
            var attachSize = (maxAttachSize == undefined) ? -1 : maxAttachSize,
                attachNumber = (maxAttachNumber == undefined) ? -1 : maxAttachNumber,
                extension = (excludeExtension == undefined) ? "" : excludeExtension;

            if (isAndroid()) {
                window.GOMobile.callFile('attachFileSuccess', 'attachFileFail', attachNumber, attachSize, extension);
            } else {

            }
        } catch (e) {

        }
    }

//파일 첨부 성공
    window.attachFileSuccess = function (data) {
        var result;
        if (typeof data === "string") {
            result = JSON.parse(data);
        } else {
            result = data.data;
        }

        var maxAttachSize = MAILCONFIG.maxAttachSize,
            configMaxAttachNumber = MAILCONFIG.maxAttachCount,
            excludeExtension = "",
            currentCount = jQuery("#attach_wrap li").size(),
            maxAttachNumber = configMaxAttachNumber - currentCount;

        var totalFileSize = result.fileSize / 1024 / 1024;
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

        if (isImage(result.fileExt)) {
            result.formattedFileSize = getFileSizeWithUnit(result.fileSize, 2);
            jQuery("#img_wrap").append(getHandlebarsTemplate("mail_attach_image_tmpl", result));
        } else {
            var extraData = {
                "calFileSize": getFileSizeWithUnit(result.fileSize, 2),
                "fileIcon": getFileIconStyle(result.fileExt),
                "useHtmlConverter": jQuery("#useHtmlConverter").val(),
                "useMobilePreviewOption": jQuery("#useMobilePreviewOption").val()
            };
            jQuery("#file_wrap").append(getHandlebarsTemplate("mail_attach_file_tmpl", jQuery.extend({}, result, extraData)));
        }
    }
//파일 첨부 실패
    window.attachFileFail = function (data) {
        alert(mailMsg.alert_attachFile);
    }

//프로그래스 바 호출
    window.progressAction = function (opt) {
        if (isAndroid()) {
            if (opt.msg) {
                window.GOMobile.callProgressBar(opt.action, opt.msg);
            } else {
                window.GOMobile.callProgressBar(opt.action);
            }
        } else if (isIphone() || isIpad()) {
            if (opt.msg) {
                window.location = "gomobile://callProgressBar?" + opt.action + "&" + opt.msg;
            } else {
                window.location = "gomobile://callProgressBar?" + opt.action;
            }
        }
    }

//첨부파일 다운로드
    window.downloadAttach = function (param, fileName, fileSize) {
        var host = location.protocol + "//" + window.location.host;
        url = "/api/mail/message/attach/download?" + jQuery.param(param);
        if (isAndroid()) {
            window.GOMobile.attachSave(host + url, fileName, fileSize);
        } else if (isIphone() || isIpad()) {
            window.location = "gomobile://attachSave?" + host + url + "&fileName=" + fileName;
        }
    }
//이미지 첨부파일 미리보기
    window.previewAttachImage = function (uid, folderName, part, fileName) {
        var param = {"folderName": folderName, "uid": uid, "part": part, "type": "normal"};
        param = mailControl.getSharedFolderParam(param);
        ActionLoader.postGoLoadAction("/api/mail/message/attach/preview", param, function (data) {
            removeProcessLoader();
            if (data.convert) {
                var url = [{"url": data.previewPath, "fileName": fileName}];
                if (isAndroid()) {
                    window.GOMobile.attachImageView(JSON.stringify(url), 0);
                } else if (isIphone() || isIpad()) {
                    window.location = "gomobile://attachImageView?" + JSON.stringify(url) + "&0";
                }
            } else {
                alert(mailMsg.mail_attach_convert_error1);
            }
        }, "json", function () {
            alert(mailMsg.mail_attach_convert_error1);
        });
    }

    window.androidHistoryBack = function () {
        var isLeftClose = (jQuery("#go_content").css("left") == "0px");
        var isSearchClose = (jQuery("#search_wrap").css("display") == "none");
        var attachClose = (jQuery("#attachLayer").css("display") == "none");
        var isGoSearchClosed = jQuery("#goSearch").css("display") == "none";
        var isWebFolderClosed = jQuery("#webfolder_content").css("display") == "none";
        if (isAndroid() && isLeftClose && isSearchClose && attachClose && isGoSearchClosed && isWebFolderClosed) {
            if(window.location.href.split("=")[1] == 1) {
                //첫 메일메뉴로 들어왔을때
                if(jQuery("#mail_write_table").length > 0 || jQuery("#mailViewContentWrap").length > 0 ){
                    //투데이에서 메일쓰기페이지나 메일상세로 바로 왔을때
                    window.GOMobile.pressBackKey();
                }else{
                    //투데이로 이동
                    window.GOMobile.goHome();
                }
            }else{
                window.GOMobile.pressBackKey();
            }
        }else {
            hideMailFolderSide();
            closeSearchMessageWrap();
            closeAttachPhoto();
            if (jQuery("#mailWebFolderHomeToolbarWrap").css("display") == "none") {
                goParentWebFolder();
            } else {
                closeWebFolder();
            }
        }
    }
//외부링크 연결
    window.executeExtUrl = function (url) {
        if (!url || jQuery.trim(url) == "") return;
        url = (url.toLowerCase().indexOf("http") == 0) ? url : "http://" + url;
        if (isAndroid()) {
            //안드로이드는 외부창에서 다운로드가 가능하기 때문에 기존로직 유지
            window.GOMobile.externalUrl(url);
        } else if (isIphone() || isIpad()) {
            //GO-26521
            var isBigAttach = url.includes("downloadBigAttach.do");
            if (isBigAttach) {
                window.location = "gomobile://attachSave?" + url;
            } else {
                window.location = "gomobile://externalUrl?" + url;
            }
        }
    }
//페이지 로딩 완료
    window.pageDone = function () {
        if (isAndroid()) {
            window.GOMobile.pageDone();
        } else if (isIphone() || isIpad()) {
            window.location = "gomobile://pageDone";
        }
    }

//뒤로가기 호출
    window.gotoHistoryBack = function () {
        if (isAndroid()) {
            window.GOMobile.pressBackKey();
        } else if (isIphone() || isIpad()) {
            if (historyControl && historyControl.historyIdx > 1) {
                window.history.back();
            } else {
                window.location = "gomobile://goHome";
            }
        }
    }

    window.dormantRelease = function (paramUrl) {
        if (isAndroid()) {
            window.GOMobile.dormantRelease();
            location.href = paramUrl;
        } else if (isIphone() || isIpad()) {
            window.location = "gomobile://dormantRelease?" + paramUrl;
        }
    }

    window.goUrl = function (url, goAgent) {
        jQuery.cookie('GO-Agent', goAgent);
        if (goAgent === "GO-iPhone" && url.indexOf("mail?work=") > 0) {
            var queryParams = {};
            url.split("mail")[1].replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { queryParams[key] = value; });
            if (queryParams.work === 'write') {
                goWrite();
            } else if (queryParams.work === 'read' && queryParams.folder) {
                readMessage(queryParams.folder, queryParams.uid);
            } else {
                window.location.href = url;
            }
        } else {
            window.location.href = url;
        }
    }

    window.callSessionTimeout = function () {
        if (isAndroid()) {
            window.GOMobile.callSessionTimeout('redirection', '401');
        } else if (isIphone() || isIpad()) {
            window.location = "gomobile://callSessionTimeout?redirection&401";
        }
    }


//모바일 텝이동 호출
    window.isMoveTab = function () {
        if (isAndroid()) {
            window.GOMobile.moveTab();
        } else if (isIphone() || isIpad()) {
            setTimeout(function () {
                window.location = "gomobile://moveTab";
            }, 300);
        }
    }

// status bar 색상변경
    window.changeStatusBarColor = function (isDark) {
        if (isAndroid()) {
            try {
                window.GOMobile.changeStatusBarColor(isDark);
            } catch (e) {
                console.log(e);
                return;
            }
        } else {
            try {
                window.location = "gomobile://changeStatusBarColor?" + isDark;
            } catch (e) {
                console.log(e);
                return;
            }
        }
    }

// 앱에서 호출한 moveTab이 호출 되었음을 응답한다.
    window.isMoveTabReturn = function () {
        if (isAndroid()) {
            window.GOMobile.moveTabReturn();
        } else if (isIphone() || isIpad()) {
            window.location = "gomobile://moveTabReturn";
        }
    }

    window.checkOS = function () {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf("android") > -1) {
            return "android";
        } else if (ua.indexOf("iphone") > -1) {
            return "iphone";
        } else if (ua.indexOf("ipad") > -1) {
            return "ipad";
        } else {
            return -1;
        }
    }

    window.isAndroidApp = function () {
        return this.checkOS() == 'android';
    }

    window.addReceiverSuccess = function (result) {
        var _result = JSON.parse(result);
        addSelectedMemberInReceiverList("to", _result["receiver"]);
        addSelectedMemberInReceiverList("bcc", _result["hiddenReference"]);
        addSelectedMemberInReceiverList("cc", _result["reference"]);
        checkCcBccRcptArea();
        closeAddressContent();
    }

    window.addReceiverFail = function () {
        alert(mailMsg.addr_list_write_insert_fail);
        closeAddressContent();
    }

    window.changeSystemFontsize = function (systemFontsize) {
        if ("BIG" === systemFontsize) {
            jQuery("#systemBigStyle").prop("disabled", false);
            jQuery("#systemBiggerStyle").prop("disabled", true);
        } else if ("BIGGER" === systemFontsize) {
            jQuery("#systemBigStyle").prop("disabled", true);
            jQuery("#systemBiggerStyle").prop("disabled", false);
        } else {
            jQuery("#systemBigStyle").prop("disabled", true);
            jQuery("#systemBiggerStyle").prop("disabled", true);
        }
    };
}