define([
    "json!lang/ko/contact.json", 
    "json!lang/ko/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.contact || {});
});