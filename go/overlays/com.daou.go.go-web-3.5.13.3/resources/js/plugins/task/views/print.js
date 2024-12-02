define([
], 
function(
) {
	var PrintView = Backbone.View.extend({
		initialize : function() {
			
		},
		
		render : function() {
			$("body").addClass("print");
			$("body").css("min-width", "300px");
			return this;
		},
		
		parseHtml5Tags : function() {
			// 문제현상 :
			// ie8 인쇄시 스타일 깨짐 현상. html5shiv 도 소용없다.
			// ie 에서 만들어주는 print preview 화면에서 html5 해석 불가. 디버깅도 불가. 크롬은 embed 영역 생성됨.
			// 해결 방법 : 
			// html5 태그들을 div 로 치환한다. 
			// style 은 html5 태그들과 div 간 상호 호환이 되도록 각각 css로 정의 해야한다.
			var html5Tags = ["header", "section", "article"]; 
			_.each(html5Tags, function(tagName) {
				this.$el.find(tagName).each(function(key, value){
					var content = $(this).html();
					var classAttr = $(this).attr("class");
					var div = $("<div></div>");
					div.html(content);
					div.addClass(classAttr);
					$(this).replaceWith(div);
				});
			}, this);
		},
		
		print : function() {
			this.parseHtml5Tags();
			setTimeout(function() {
				window.print();
			}, 1000);
		}
	});
	
	return PrintView;
});