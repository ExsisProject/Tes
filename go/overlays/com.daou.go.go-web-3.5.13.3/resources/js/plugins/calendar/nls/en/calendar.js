define([
    "json!lang/en/calendar.json", 
    "json!lang/en/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.calendar || {});
});