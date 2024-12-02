define("admin/constants/openapi_scope", function () {
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");

    return [
        {key: "APPROVAL", value: commonLang['전자결재']},
        {key: "WORKS", value: commonLang['Works']},
        {key: "NOTI", value: commonLang['푸시알림']},
        {key: "CHAT", value: commonLang['채팅']},
        {key: "MAIL", value: commonLang['메일']},
        {key: "CALENDAR", value: commonLang['캘린더']},
        {key: "EHR", value: commonLang['근태관리']},
        {key: "USER", value: commonLang['사용자']},
        {key: "ORG", value: commonLang['조직도']},
        {key: "SYSTEM", value: adminLang['시스템 설정']},
        {key: "COMPANY", value: adminLang['사이트 관리']}
    ];
});
