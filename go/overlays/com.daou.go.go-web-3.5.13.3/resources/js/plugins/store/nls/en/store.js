define([
    "json!lang/en/store.json",
    "json!lang/en/custom.json"
],
function(
    DefaultLang,
    CustomLang
) {
    return _.extend(DefaultLang, CustomLang.store || {});
});