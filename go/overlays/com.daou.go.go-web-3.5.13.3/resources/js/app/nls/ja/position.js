define([
    "json!lang/ja/position.json",
    "json!lang/ja/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.position || {});
});