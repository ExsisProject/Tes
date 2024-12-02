define([
    "json!lang/ko/vacation.json",
    "json!lang/ko/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.vacation || {});
});