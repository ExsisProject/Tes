define([
    "json!lang/ja/admin.json", 
    "json!lang/ja/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.admin || {});
});