define([
    "json!lang/zh-cn/welfare.json",
    "json!lang/zh-cn/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.welfare || {});
});