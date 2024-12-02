define(function(require) {
    var DefaultLang = require("json!lang/ko/store.json");
    var CustomLang = require("json!lang/ko/custom.json");
    return {
        "root": _.extend(DefaultLang, CustomLang.store || {}),
        "en": true, "ja": true, "zh_CN": true, "zh_TW": true, "vi":true
    }
});