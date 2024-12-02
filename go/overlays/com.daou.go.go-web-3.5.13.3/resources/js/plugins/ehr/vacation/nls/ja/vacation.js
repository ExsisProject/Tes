define([
    "json!lang/ja/vacation.json",
    "json!lang/ja/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.vacation || {});
});