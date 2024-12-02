define([
    "json!lang/en/asset.json", 
    "json!lang/en/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.asset || {});
});