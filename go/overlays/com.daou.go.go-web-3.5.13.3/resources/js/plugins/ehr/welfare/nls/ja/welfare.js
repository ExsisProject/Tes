define([
    "json!lang/ja/welfare.json",
    "json!lang/ja/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.welfare || {});
});