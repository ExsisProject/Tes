define(function(require) {
    var DefaultLang = require("json!lang/ko/notification.json");
    var CustomLang = require("json!lang/ko/custom.json");
    return {
        "root": _.extend(DefaultLang, CustomLang.works|| {}),
        "en": true, "ja": true, "zh_CN": true, "zh_TW": true, "vi":true
    }
});