define([
    "json!lang/zh-tw/attendance.json", 
    "json!lang/zh-tw/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.attendance || {});
});