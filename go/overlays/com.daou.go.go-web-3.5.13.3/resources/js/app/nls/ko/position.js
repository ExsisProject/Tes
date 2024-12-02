define([
    "json!lang/ko/position.json",
    "json!lang/ko/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.position || {});
});