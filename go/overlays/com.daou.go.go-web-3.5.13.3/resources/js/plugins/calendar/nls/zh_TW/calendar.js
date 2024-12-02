define([
    "json!lang/zh-tw/calendar.json", 
    "json!lang/zh-tw/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.calendar || {});
});