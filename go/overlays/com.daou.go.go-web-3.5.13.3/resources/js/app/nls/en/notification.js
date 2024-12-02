define([
    "json!lang/en/notification.json", 
    "json!lang/en/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.notification || {});
});