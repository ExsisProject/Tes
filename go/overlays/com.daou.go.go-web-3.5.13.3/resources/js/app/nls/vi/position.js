define([
    "json!lang/vi/position.json",
    "json!lang/vi/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.position || {});
});