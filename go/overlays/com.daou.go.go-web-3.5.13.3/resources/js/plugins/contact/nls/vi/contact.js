define([
    "json!lang/vi/contact.json", 
    "json!lang/vi/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.contact || {});
});