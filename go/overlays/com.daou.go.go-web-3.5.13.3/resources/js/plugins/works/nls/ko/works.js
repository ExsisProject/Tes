define([
    "json!lang/ko/works.json", 
    "json!lang/ko/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.works|| {});
});