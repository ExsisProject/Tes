define([
    "json!lang/zh-cn/approval.json", 
    "json!lang/zh-cn/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.approval || {});
});