define([
    "json!lang/en/hrcard.json", 
    "json!lang/en/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.hrcard || {});
});