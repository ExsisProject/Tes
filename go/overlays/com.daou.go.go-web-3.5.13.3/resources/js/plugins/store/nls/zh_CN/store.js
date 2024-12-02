define([
    "json!lang/zh-cn/store.json",
    "json!lang/zh-cn/custom.json"
],
function(
    DefaultLang,
    CustomLang
) {
    return _.extend(DefaultLang, CustomLang.store || {});
});
