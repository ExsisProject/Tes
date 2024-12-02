define([
    "json!lang/zh-cn/position.json",
    "json!lang/zh-cn/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.position || {});
});