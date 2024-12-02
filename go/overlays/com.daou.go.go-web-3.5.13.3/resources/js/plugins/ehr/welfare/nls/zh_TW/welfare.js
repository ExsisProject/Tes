define([
    "json!lang/zh-tw/welfare.json",
    "json!lang/zh-tw/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.welfare || {});
});