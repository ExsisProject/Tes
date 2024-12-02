define([
    "json!lang/zh-tw/store.json",
    "json!lang/zh-tw/custom.json"
],
function(
    DefaultLang,
    CustomLang
) {
    return _.extend(DefaultLang, CustomLang.store || {});
});