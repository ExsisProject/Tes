define([
    "json!lang/ko/timeline.json", 
    "json!lang/ko/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.timeline || {});
});