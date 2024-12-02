define([
    "json!lang/vi/welfare.json",
    "json!lang/vi/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.welfare || {});
});