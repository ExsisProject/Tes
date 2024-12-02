define([
    "json!lang/ja/store.json",
    "json!lang/ja/custom.json"
],
function(
    DefaultLang,
    CustomLang
   ) {
   return _.extend(DefaultLang, CustomLang.store || {});
});