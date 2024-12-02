define(function(require) {
    var DefaultLang = require("json!lang/ko/attendance.json");
    var CustomLang = require("json!lang/ko/custom.json");
    return {
        "root": _.extend(DefaultLang, CustomLang.attendance || {}),
        "en": true, "ja": true, "zh_CN": true, "zh_TW": true, "vi":true
    }
});