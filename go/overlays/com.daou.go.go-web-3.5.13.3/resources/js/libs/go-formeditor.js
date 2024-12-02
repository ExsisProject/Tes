define([
    "app", 
    "go-webeditor/editors/smarteditor",
    "formutil",
	'formparse'
],
function(GO) {
	var pluginName = 'goFormEditor';
	var editorName = 'SmartEditor';

	$.fn[pluginName] = function(options) {
		var defaults = {
			contextRoot: GO.config('contextRoot'), 
			theme: 'form', 
			bUseVerticalResizer : false,		// 입력창 크기 조절바 사용 여부 (true:사용/ false:사용하지 않음)
			bUseApprovalType : '',				// 보고서용 : '', 전자결재용 : 'approval', 공문서발신용 : 'official'
			bUsePallet: true, 
			approvalInfo : {}
		};
		var opts = $.extend({}, defaults, options);
			
		return this.each(function () {
			if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, GO.Editor.create(editorName, this, opts));
            }
		});
	};
	
	$[pluginName] = {

		getContent : function(id){
			var content = GO.Editor.getInstance(id).getContent();
			var spanMarkup;
			var returnValue;
			//console.log(content);
			spanMarkup = content.substr(0,5);
			returnValue = spanMarkup == "<span" ? DSLtoSpan(content) : DSLtoSpan("<span>"+content+"</span>");
			//console.log(returnValue);
			return returnValue;
		},
		putContent : function(id,content){
			var html = $.parseHTML(content,document,true);
			var result = '';
			$.each($(html), function(k,v){
				$(v).find('span[data-dsl]').each(function(){
					$(this).replaceWith($(this).attr('data-dsl')); 
				});
		        result += $(v).clone().wrapAll("<div/>").parent().html();
	        });
			GO.Editor.getInstance(id).setContent(result);
		},
		spanToDSL : function(content){
			var html = $.parseHTML(content, document, true);
			//console.log(html[0].outerHTML);
			var result = '';
			$.each($(html), function(k,v) {
				$(v).find('span[data-dsl]').each(function(){
					$(this).replaceWith($(this).attr('data-dsl'));
				});
				result += $(v).clone().wrapAll("<div/>").parent().html();
			});
			//console.log(result);
			return result;
		}
	};
	
	function DSLtoSpan(dsl){
		return $.editorParser.convertDslToSpan(dsl);
	}
});