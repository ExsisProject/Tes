define([
    "json!lang/zh-cn/sms.json", 
    "json!lang/zh-cn/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.sms || {});
});