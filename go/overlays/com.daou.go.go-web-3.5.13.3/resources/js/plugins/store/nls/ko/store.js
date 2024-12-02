define([
    "json!lang/ko/store.json",
    "json!lang/ko/custom.json"
],
function(
    DefaultLang,
    CustomLang
) {
   return _.extend(DefaultLang, CustomLang.store || {});
});
