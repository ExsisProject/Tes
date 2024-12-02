define([
    "json!lang/zh-tw/vacation.json",
    "json!lang/zh-tw/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.vacation || {});
});