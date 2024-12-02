define(function(require) {
	var Backbone = require("backbone");
	var App = require("app");
	var MainTpl = require("hgn!components/print/templates/print_comment");
	var commonLang = require("i18n!nls/commons");

	require("formeditor");
	require("jquery.fancybox");
	require("jquery.go-popup");
	require("jquery.ui");
	require("json");
	require("json2");
	require("jquery.placeholder");

	var lang = {

		"댓글" : commonLang['댓글'],
		"인쇄 미리보기" : commonLang['인쇄 미리보기'],
		"인쇄" : commonLang['인쇄']

	};


	var MainView = Backbone.View.extend({
		el: '#content',
		initialize: function(options) {
			this.options = options || {};
			this.unbindEvent();
			this.bindEvent();
		},

		render: function() {
			this.$el.html(MainTpl({
				lang : lang
			}));
			this.toggleDisplay();
			$("body").addClass("print");
			if (GO.util.isIE8()) {
				$("body").css("min-width", "300px");
			}
		},

		unbindEvent : function() {
			this.$el.parent().off("click","#toolbar input[type='chk']");
			this.$el.parent().off("click","#printDoc");
		},
		bindEvent : function() {
			this.$el.parent().on("click", "#toolbar input[name='chk']", $.proxy(this.toggleDisplay, this));
			this.$el.parent().on("click", "#printDoc", $.proxy(this.printDoc, this));
		},

		printDoc : function(){
			GO.util.print(this.$el);
		},

		toggleDisplay : function(){
			var isCommentChk = $('#commentChecked').is(':checked');

			if(isCommentChk){
				$(this.el).find('#replyArea').show();
			}else{
				$(this.el).find('#replyArea').hide();
			}
		},

		setPrintContents: function(item) {
			this.$el.find('#postContents').append(item);
			//댓글 출력 여부 체크 
			this.toggleDisplay();
			//화면 조정 
			_.each(this.$el.find("header, section, article, footer").get().reverse(), function(el){
				var div = $("<div></div>");
				var $el = $(el);
				div.html($el.html());
				div.addClass($el.attr("class"));
				div.attr('id', $el.attr('id'));
				div.attr('style', $el.attr('style'));
				$el.replaceWith(div);
			});
		}

	});

	return MainView;

});