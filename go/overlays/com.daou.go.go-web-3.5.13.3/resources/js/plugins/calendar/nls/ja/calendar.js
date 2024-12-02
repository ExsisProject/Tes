define([
    "json!lang/ja/calendar.json", 
    "json!lang/ja/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.calendar || {});
});