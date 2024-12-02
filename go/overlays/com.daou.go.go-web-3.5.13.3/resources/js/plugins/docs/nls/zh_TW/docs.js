define([
    "json!lang/zh-tw/docs.json", 
    "json!lang/zh-tw/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.docs || {});
});