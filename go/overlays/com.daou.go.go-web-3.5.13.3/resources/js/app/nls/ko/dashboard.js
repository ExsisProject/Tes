define([
    "json!lang/ko/dashboard.json", 
    "json!lang/ko/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.dashboard || {});
});