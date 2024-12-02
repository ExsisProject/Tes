define([
    "json!lang/vi/timeline.json", 
    "json!lang/vi/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.timeline || {});
});