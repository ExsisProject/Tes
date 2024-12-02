(function() {
	
	define([
    	"jquery",
		"underscore", 
        "backbone", 
        "app", 
        
        "hgn!components/print/templates/print",
        "i18n!nls/commons",
        "content_viewer"
    ], 
    
    function(
		$, 
		_, 
		Backbone, 
		GO, 
		
		PrintTmpl,
		CommonLang,
		ContentViewer
	) {
		
		var lang ={
		    title : CommonLang["인쇄 미리보기"],
		    print : CommonLang["인쇄"],
		    cancel : CommonLang["취소"]
		};
		
		var PrintView = Backbone.View.extend({
			tagName: 'div', 
			className: 'layer_normal layer_report_print popup', 
			
			events: {
				"click #actions a.print": "print",
				"click #actions a.cancel": "cancel",
			}, 
			
			initialize: function(options) {
				this.options = options || {};
                this.isAll = this.options.isAll || false;
                this.setting = this.options.setting || {};
			}, 
			
			render: function() {
                this.$el.html(PrintTmpl({
                    lang : lang,
                    title : this.options.title || lang.title,
                    content : typeof this.content == "string" ? this.content : "",
                    isAll : this.isAll
                }));
                
                if(typeof this.content != "string"){
                    this.$el.find("#printContent").html(this.content);
                };
                
                if(this.options.addClass != undefined){
                    this.$el.find("#printContent").addClass(this.options.addClass);
                }
                
                //report미리보기에서도 스타일이 깨지지 않도록 iframe안에 내용을 붙여야한다.
                if(this.options.mode == "preview"){
	                var contentEl = this.$el.find("#reportContent");
	            	ContentViewer.init({
	            		$el : contentEl,
	            		content : contentEl.html()
	            	});
                }
                
                return this;
			},
			
			setContent : function(content){
			    this.content = content;
			    return this;
			},

			getContent : function(){
			    return this.content;
			},

			print : function(){
				GO.util.print(this.$el.find("#printArea"), this.setting);
			},

			parseHtml5Tags: function($el) {
				/*
				 문제현상 :
				 ie8 인쇄시 스타일 깨짐 현상. html5shiv 도 프린트 영역에선 적용되지 않는다.

				 해결 방법 :
				 html5 태그들을 div 로 치환한다.
				 html5 태그들이 div 로 치환 되어도 스타일이 깨지지 않도록
				 html5 태그가 사용하는 클래스를 div 가 동일하게 사용 할 수 있도록 CSS 에 정의 한다.
				 html5 태그가 중첩되어 있을 수 있으므로 하위노드에서 상위노드로 치환을 진행한다.
				 */
				_.each($el.find("header, section, article, footer").get().reverse(), function(el){
					var div = $("<div></div>");
					var $el = $(el);
					div.html($el.html());
					div.addClass($el.attr("class"));
					div.attr('id', $el.attr('id'));
					div.attr('style', $el.attr('style'));
					$el.replaceWith(div);
				});
			},
			
			cancel : function(){
			    window.close();
			}
		});
		
		function privateFunc(view, param1, param2) {
			
		}
		
		return PrintView;
		
	});
	
})();