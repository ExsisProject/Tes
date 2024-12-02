define([
    "json!lang/zh-cn/vacation.json",
    "json!lang/zh-cn/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.vacation || {});
});