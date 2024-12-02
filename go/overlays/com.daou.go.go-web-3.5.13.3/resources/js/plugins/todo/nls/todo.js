define(function(require) {
    var DefaultLang = require("json!lang/ko/todo.json");
    var CustomLang = require("json!lang/ko/custom.json");
    return {
        "root": _.extend(DefaultLang, CustomLang.todo || {}),
        "en": true, "ja": true, "zh_CN": true, "zh_TW": true, "vi":true
    }
});
