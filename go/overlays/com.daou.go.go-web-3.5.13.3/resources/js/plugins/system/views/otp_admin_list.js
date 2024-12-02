define("system/views/otp_admin_list", [
	"jquery",
	"backbone", 	
	"app",
	"hgn!system/templates/otp_admin_list",
	"system/models/otp_admin_list",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "jquery.go-validation",
    "jquery.go-popup"
],

function(
	$, 
	Backbone,
	App,
	OtpRulesTmpl,
	OtpRulesModel,
	commonLang,
	adminLang
) {
    gAdminLang = adminLang
    var	tmplVal = {
        label_id : adminLang["2차인증 아이디"],
        label_user_name : adminLang["2차인증 사용자 이름"],
        label_domain : adminLang["2차인증 도메인"],
        label_company_name : adminLang["2차인증 회사명"],
        label_admin_type : adminLang["2차인증 관리자 종류"],
        label_next : adminLang["2차인증 다음"],
        label_search : adminLang["2차인증 검색"],
        label_admin : adminLang["2차인증 관리자"],
        label_external_mail : adminLang["2차인증 외부메일"],
        label_modify : adminLang["2차인증 수정"],
        label_used_or_not : adminLang["2차인증 사용여부"],
        label_type : adminLang["2차인증 종류"],
        label_used : adminLang["2차인증 사용"],
        label_not_used : adminLang["2차인증 사용안함"],
        label_mobile : adminLang["2차인증 모바일"],
        label_mail : adminLang["2차인증 메일"],
        label_OS_type : adminLang["2차인증 OS 타입"],
        label_device_model_name : adminLang["2차인증 모델명"],
        label_device_id : adminLang["2차인증 디바이스 ID"],
        label_registration_date : adminLang["2차인증 등록일"],
        label_manage : adminLang["2차인증 관리"],
        label_delete_device : adminLang["2차인증 기기삭제"],
        label_save : adminLang["2차인증 저장"],
        label_cancel : adminLang["2차인증 취소"],
        label_list: adminLang["2차인증 목록"],
        label_delete_device_check : adminLang["2차인증 OTP 기기가 삭제 경고"],
        label_confirm : adminLang["2차인증 확인"],
        label_mail_otp_reset : adminLang["2차인증 메일 OTP 초기화"],
        label_mail_otp_reset_check : adminLang["2차인증 메일 OTP가 초기화 경고"],
        label_delete_complete : adminLang["2차인증 삭제 완료"],
        label_reset_complete : adminLang["2차인증 초기화 완료"],
        label_no_device_yet : adminLang["2차인증 기기 등록 안됨"],
        label_no_data : adminLang["표시할 데이터 없음"]
    };

    return App.BaseView.extend({

        initialize: function () {
            this.model = new OtpRulesModel();
            this.model.fetch().done($.proxy(function () {
                this.render();
                toggleViewMode(true)
                tableHeads = $("#list_start_point").html()
                renderList(0, null, null);

            }, this));
            $('.breadcrumb .path').html(adminLang['관리자'] +" > " + adminLang["2차인증 관리자"] + " OTP");
        },

        render: function () {

            var data = this.model.toJSON();
            this.$el.html(OtpRulesTmpl({
                lang: tmplVal,
                model: data,
            }));
            return this;
        },
    });
});

/**
 * 검색창 엔터 칠 경우 검색
 */
function onEnter() {
    if (window.event.keyCode == 13) {
        searchForm(0)
    }
}

/**
 * 관리자권한을 가진 계정을 검색하여 리스트업 해준다.
 */
function getAdminUserList(idx, searchKey, compareValue) {
    var requests;
    var api_response = null;
    var url = GO.contextRoot + 'ad/api/system/otp/admin-user-list/' + idx
    if (searchKey != null && compareValue != null && compareValue.length > 0) {
        var searchTargetId = null;
        var searchTargetName = null;
        if (searchKey === "mail_uid") {
            searchTargetId = compareValue;
        }
        else {
            searchTargetName = compareValue;
        }

        requests = {
            type: "POST",
            async: false,
            contentType: 'application/json',
            data : JSON.stringify({
                "page" : idx,
                "searchTargetId": searchTargetId,
                "searchTargetName": searchTargetName,
            })
        }
        url = GO.contextRoot + 'ad/api/system/otp/search-admin-users'
    }
    else {
        requests = {
            type: "GET",
            async: false,
        }
    }
    $.ajax(url, requests).done(function (response) {
        if (response.code == 200) {
            api_response = response.data;
        }
    });
    return api_response;
}

/**
 * 관리자 계정을 세부사항 API 요청 및 결과 반환
 */
function getAdminUserDetails(uid) {
    var api_response = null;
    $.ajax(GO.contextRoot + 'ad/api/system/otp/admin-user-details/' + uid, {
        type: 'GET',
        async: false,
    }).done(function (response) {
        if (response.code == 200) {
            api_response = response.data;
        }
    })
    return api_response;
}

/**
 * 화면 영역 reset
 */
function clearAdminUserInfo() {
    $("#admin_otp_used").prop("checked", false);
    $("#admin_otp_not_used").prop("checked", false);
    $("#admin_otp_media_type_mail").prop("checked", false);
    $("#admin_otp_media_type_mobile").prop("checked", false);
    $("#infor_table_mobile_1_os_type").html("-");
    $("#infor_table_mobile_2_model").html("-");
    $("#infor_table_mobile_3_device_id").html("-");
    $("#infor_table_mobile_4_registration_date").html("-");
    $("#infor_table_mail_1_mail_addr").html("-");
    $("#infor_table_mail_2_registration_date").html("-");
}

/**
 * 메일 OTP/모바일 OTP 텝 전환.
 */
function onToggleOtpType(radio) {
    if(radio.id === "admin_otp_media_type_mail") {
        toggleOtpType("MAIL", serverUserInfo.mobileRegistered, serverUserInfo.mailRegistered)
    }
    else {
        toggleOtpType("MOBILE", serverUserInfo.mobileRegistered, serverUserInfo.mailRegistered)
    }
}

/**
 * 메일 OTP/모바일 OTP 텝 전환.
 */
function toggleViewMode(isList) {
    if(isList === true) {
        $("#view_user_details").css("display", "none");
        $("#view_user_list").css("display", "block");
        if (typeof gLastListIdx !== 'undefined') {
            renderList(gLastListIdx, gSearchKey, gCompareValue)
        }
    }
    else {
        $("#view_user_list").css("display", "none");
        $("#view_user_details").css("display", "block");
    }
}

/**
 * 관리자 사용자 검색
 */
function searchForm(idx) {
    var searchKey = $("#searchKey").val();
    var compareValue = $("#compareValue").val();
    renderList(idx, searchKey, compareValue)

}

/**
 * 관리자 사용자 검색
 */
function toggleOtpType(mediaType, mobileRegistered, mailRegistered) {
    if(mediaType === "MAIL") {
        $("#admin_otp_media_type_mail").prop("checked", true);
        $("#admin_otp_media_type_mobile").prop("checked", false);
        $("#infor_table_mobile").css("display", "none");
        $("#infor_table_mobile_none").css("display", "none");

        $("#infor_table_mail").css("display", "block");
        $("#infor_table_mail_none").css("display", "none");
        // if (mailRegistered === true) {
        //     $("#infor_table_mail").css("display", "block");
        //     $("#infor_table_mail_none").css("display", "none");
        // }
        // else {
        //     $("#infor_table_mail").css("display", "none");
        //     $("#infor_table_mail_none").css("display", "block");
        // }
    }
    else {
        $("#admin_otp_media_type_mail").prop("checked", false);
        $("#admin_otp_media_type_mobile").prop("checked", true);
        $("#infor_table_mail").css("display", "none");
        $("#infor_table_mail_none").css("display", "none");

        if (mobileRegistered === true) {
            $("#infor_table_mobile").css("display", "block");
            $("#infor_table_mobile_none").css("display", "none");
        }
        else {
            $("#infor_table_mobile").css("display", "none");
            $("#infor_table_mobile_none").css("display", "block");
        }

    }

    // $("#infor_table_mail").attr("disabled", false);
    // if (mailRegistered === false) {
    //     $("#infor_table_mail").attr("disabled", true);
    // }
    // $("#infor_table_mobile").attr("disabled", false);
    // if (mobileRegistered === false) {
    //     $("#infor_table_mobile").attr("disabled", true);
    // }
}

/**
 * 버튼 상태 변경 (활성화/비활성화)
 */
function changeExternalMailBtuStatus(status) {
    $("#nameArea").attr("disabled", status);
}

/**
 * 외부 메일 주소 변경
 */
function changeOtpExternalMailAddress(targetUid, changeTo) {
    var uri = encodeURI(GO.contextRoot + 'ad/api/system/otp/change-auth-mail/' + targetUid)
    $.ajax(uri, {
        type: 'POST',
        async: false,
        contentType: 'application/json',
        data : JSON.stringify({
            "email":  changeTo
        })
    }).fail(function(){
        alert(gAdminLang["2차인증 메일변경실패"]);
    });
}

/**
 * OTP 설정 변경
 */
function updateOtpAttribute(attribute,targetUid, changeTo) {
    var uri = encodeURI(GO.contextRoot + 'ad/api/system/otp/' + attribute + '/' + targetUid + "/" + changeTo)
    $.ajax(uri, {
        type: 'POST',
        async: false,
    }).fail(function(){
        alert(gAdminLang["2차인증 속성 변경실패"]);
    });
}

/**
 * 설정 저장
 */
function doSave() {
    if(isOtpRegistered === true) {
        if (serverUserInfo.externalMail !== $("#nameArea").val()) {
            changeOtpExternalMailAddress(serverUserInfo.uid, $("#nameArea").val())
        }
        if (serverUserInfo.used === true && $("#admin_otp_not_used").prop("checked") === true) {
            updateOtpAttribute("change-device-usage", serverUserInfo.uid, "OFF")
        } else if (serverUserInfo.used === false && $("#admin_otp_used").prop("checked") === true) {
            updateOtpAttribute("change-device-usage", serverUserInfo.uid, "ON")
        }

        if (serverUserInfo.mediaType === "MAIL" && $("#admin_otp_media_type_mobile").prop("checked") === true) {
            updateOtpAttribute("change-auth-type", serverUserInfo.uid, "MOBILE")
        } else if (serverUserInfo.mediaType === "MOBILE" && $("#admin_otp_media_type_mail").prop("checked") === true) {
            updateOtpAttribute("change-auth-type", serverUserInfo.uid, "MAIL")
        }
    }
    else {
        if (serverUserInfo.used === true && $("#admin_otp_not_used_2").prop("checked") === true) {
            updateOtpAttribute("change-device-usage", serverUserInfo.uid, "OFF")
        } else if (serverUserInfo.used === false && $("#admin_otp_used_2").prop("checked") === true) {
            updateOtpAttribute("change-device-usage", serverUserInfo.uid, "ON")
        }
    }
    toggleViewMode(true);
}

/**
 * 저장하지 않고 메뉴로 돌어가기
 */
function doCancel() {
    toggleViewMode(true);
}

/**
 * OTP 삭제 API
 */
function doDeleteDevice(targetAction, targetUid) { // delete-otp, delete-device
    var uri = encodeURI(GO.contextRoot + 'ad/api/system/otp/' + targetAction + '/' + targetUid)
    $.ajax(uri, {
        type: 'POST',
        async: false,
    }).fail(function(){
        alert(gAdminLang["2차인증 속성 변경실패"]);
    }).done(function (response) {
        if (response.code == 200) {
            if(targetAction === "delete-device") {
                alert(gAdminLang["2차인증 삭제 완료"]);
            }
            else {
                alert(gAdminLang["2차인증 초기화 완료"]);
            }
        }
    });
}

/**
 * 기기 삭제 버튼 클릭시 팝업창 활성화
 */
function onResetDevice() {
    var targetUid = serverUserInfo.uid
    var targetAction = "delete-device"
    this.popupView = new OTPInAdminResetPopupView();
    this.popupView.render("OTP " + gAdminLang["2차인증 기기삭제"], gAdminLang["2차인증 OTP 기기가 삭제 경고"], targetUid, targetAction);
}

/**
 * 기기 삭제 버튼 클릭시 팝업창 활성화
 */
function onResetOtp() {
    var targetUid = serverUserInfo.uid
    var targetAction = "delete-otp"
    this.popupView = new OTPInAdminResetPopupView();
    this.popupView.render(gAdminLang["2차인증 메일 OTP 초기화"], gAdminLang["2차인증 메일 OTP가 초기화 경고"], targetUid, targetAction);
}

/**
 * 개별 어드민 사용자 설정 정보를 출력
 */
function readAdminUserInfo(uid) {
    var data = getAdminUserDetails(uid)

    isOtpRegistered = true
    $("#view_user_details_alert_area").css("display", "none");
    $("#view_user_details_content_body").css("display", "block");
    if (data.mobileRegistered === false && data.mailRegistered === false && data.externalMail == null) {
        isOtpRegistered = false
        $("#view_user_details_alert_area").css("display", "block");
        $("#view_user_details_content_body").css("display", "none");
    }

    $("#nameArea").val(data.externalMail);
    clearAdminUserInfo()

    toggleViewMode(false)

    serverUserInfo = data
    if(data.used === true) {
        $("#admin_otp_used").prop("checked", true);
        $("#admin_otp_not_used").prop("checked", false);
        $("#admin_otp_used_2").prop("checked", true);
        $("#admin_otp_not_used_2").prop("checked", false);
    }
    else {
        $("#admin_otp_used").prop("checked", false);
        $("#admin_otp_not_used").prop("checked", true);
        $("#admin_otp_used_2").prop("checked", false);
        $("#admin_otp_not_used_2").prop("checked", true);
    }

    toggleOtpType(data.mediaType, data.mobileRegistered, data.mailRegistered)
    changeExternalMailBtuStatus(true)

    $("#infor_table_mobile_1_os_type").html(data.osType);
    $("#infor_table_mobile_2_model").html(data.modelName);
    $("#infor_table_mobile_3_device_id").html(data.deviceId);
    if(data.mobileOtpRegistrationDate != null) {
        $("#infor_table_mobile_4_registration_date").html(
            data.mobileOtpRegistrationDate + "(" +
            data.mobileOtpRegistrationWeekDay + ") " +
            data.mobileOtpRegistrationTime);
    }
    else {
        $("#infor_table_mobile_4_registration_date").html("")
    }

    $("#infor_table_mail_1_mail_addr").html(data.externalMail);

    if(data.mailOtpRegistrationDate != null) {
        $("#infor_table_mail_2_registration_date").html(
            data.mailOtpRegistrationDate + "(" +
            data.mailOtpRegistrationWeekDay + ") " +
            data.mailOtpRegistrationTime);
    }
    else {
        $("#infor_table_mail_2_registration_date").html("")
    }

}

/**
 * 게시판 렌더링
 */
function renderList (idx, searchKey, compareValue) {
    var lines = ''
    var api_response = getAdminUserList(idx, searchKey, compareValue)
    var items = api_response.users

    gLastListIdx = idx
    gSearchKey = searchKey
    gCompareValue = compareValue


    for (var inIdx in items) {
        var userData = items[inIdx]
        var sysadmin = gAdminLang["2차인증 사이트 관리자"]
        if (userData.sysadmin === true) {
            sysadmin = gAdminLang["2차인증 시스템 관리자"]
        }

        var line = `<tr class="">
                    <td>
                        <table class="TM_HiddenTextTable">
                            <tbody><tr>
                                <td style="border:0;" title=` + userData.loginId + `>
                                    <div class="TM_HiddenTextDiv">
                                        <a href="javascript:readAdminUserInfo('` + userData.userId + `')">` + userData.loginId + `</a>
                                    </div>
                                </td>
                            </tr>
                            </tbody></table>
                    </td>
                    <td>
                        <table class="TM_HiddenTextTable">
                            <tbody><tr>
                                <td style="border:0;" title="` + userData.userName + `">
                                    <div class="TM_HiddenTextDiv">` + userData.userName + `</div>
                                </td>
                            </tr>
                            </tbody></table>
                    </td>
                    <td>
                        <table class="TM_HiddenTextTable">
                            <tbody><tr>
                                <td style="border:0;" title="` + userData.domain + `">
                                    <div class="TM_HiddenTextDiv">
                                        ` + userData.domain + `
                                    </div>
                                </td>
                            </tr>
                            </tbody></table>
                    </td>
                    <td>
                        <table class="TM_HiddenTextTable">
                            <tbody><tr>
                                <td style="border:0;" title="` + userData.companyName + `">
                                    <div class="TM_HiddenTextDiv">` + userData.companyName + `</div>
                                </td>
                            </tr>
                            </tbody></table>
                    </td>
                    <td>
                        <table class="TM_HiddenTextTable">
                            <tbody><tr>
                                <td style="border:0;" title="DOMAIN">
                                    <div class="TM_HiddenTextDiv">` + sysadmin + `</div>
                                </td>
                            </tr>
                            </tbody></table>
                    </td>
                </tr>`
        lines += line
    }
    $("#list_start_point").html(tableHeads + lines) ;
    lines = ""
    var startPage = idx - 3
    var endPage = idx + 3
    for(var i=startPage;i<endPage;i++) {
        if (i < 0) {
            endPage += 1;
            continue;
        }
        if (i === idx) {
            lines += '<span class="choiseNum" style="font-weight: bold;">' + (i + 1) + '</span>'
        }
        else if (api_response.totalPage > i){
            if(compareValue != null && compareValue.length > 0) {
                lines += '<a href="javascript:renderList(' + i + ',\'' + searchKey + '\',\'' + compareValue + '\')" class="num">' + (i + 1) + '</a>'
            }
            else {
                lines += '<a href="javascript:renderList(' + i + ')" class="num">' + (i + 1) + '</a>'
            }
        }
    }

    $("#pageCounter").html(lines) ;

}

/**
 * 팝업 뷰
 */
var OTPInAdminResetPopupView = Backbone.View.extend({
    render: function (title_text, description_text, targetUid, targetAction) {
        this.$el.html(this.getTemplate(title_text, description_text));
        this.popupEl = $.goPopup({
            pclass: 'layer_normal layer_otp',
            draggable: false,
            isLock: true,
            closeIconVisible: true,
            width: '460px',
            header : title_text,
            modal: true,
            contents: this.$el
        });
        $("#popup_btn_ok").on( "click", this.okBtn);
        $("#popup_btn_cancle").on( "click", this.cancelBtn);
        this.targetUid = targetUid;
        this.targetAction = targetAction;
        this.uid =
        self = this
        return this;
    },

    /**
     * popup 화면 HTML
     */
    getTemplate: function (title_text, description_text) {
        return `
            <div class="content" id="popup_message_box">
                <p class="desc">${description_text}</p>
            </div>
            <footer class="btn_layer_wrap">
                <a class="btn_major_s" id="popup_btn_ok"><span class="txt">${gAdminLang["2차인증 확인"]}</span></a>
                <a class="btn_minor_s" id="popup_btn_cancle"><span class="txt">${gAdminLang["2차인증 취소"]}</span></a>
            </footer>
        `
    },
    
    /**
     * popup '취소' 버튼 클릭 이벤트
     */
    cancelBtn : function(e) {
        self.popupEl.close();
    },

    /**
     * popup '저장' 버튼 클릭 이벤트
     */
    okBtn : function() {
        self.popupEl.close();
        doDeleteDevice(self.targetAction, self.targetUid)
        if(self.targetAction === "delete-otp") {
            toggleViewMode(true);
        }
        else {
            readAdminUserInfo(self.targetUid)
        }
    },
});