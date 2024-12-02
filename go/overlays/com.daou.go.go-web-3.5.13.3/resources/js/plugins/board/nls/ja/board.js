define([
    "json!lang/ja/board.json", 
    "json!lang/ja/custom.json"
], 

function( 
	DefaultLang, 
	CustomLang 
) {	
	return _.extend(DefaultLang, CustomLang.board || {});
});