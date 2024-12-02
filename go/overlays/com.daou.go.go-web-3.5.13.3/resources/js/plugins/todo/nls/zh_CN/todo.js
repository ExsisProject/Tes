define([
    "json!lang/zh-cn/todo.json", 
    "json!lang/zh-cn/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.todo || {});
});