define([
    "json!lang/en/welfare.json",
    "json!lang/en/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.welfare || {});
});