define([
    "json!lang/vi/dashboard.json", 
    "json!lang/vi/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.dashboard || {});
});