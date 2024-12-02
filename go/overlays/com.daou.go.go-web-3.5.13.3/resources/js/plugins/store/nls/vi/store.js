define([
    "json!lang/vi/store.json",
    "json!lang/vi/custom.json"
],
function(
    DefaultLang,
    CustomLang
) {
    return _.extend(DefaultLang, CustomLang.store || {});
});
