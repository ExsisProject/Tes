define([
    "json!lang/zh-tw/todo.json", 
    "json!lang/zh-tw/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.todo || {});
});