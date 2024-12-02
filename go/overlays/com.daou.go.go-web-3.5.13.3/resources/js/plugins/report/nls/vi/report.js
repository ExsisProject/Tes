define([
    "json!lang/vi/report.json", 
    "json!lang/vi/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.report || {});
});