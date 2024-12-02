define('admin/views/layout/top_menu', function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var App = require('app');
	var CommonLang = require('i18n!nls/commons');
	var Tmpl = require('hgn!admin/templates/layout/top_menu');
	var ReadedGuide = require('admin/models/layout/readed_guide');
	var AdminLang = require("i18n!admin/nls/admin");

	var AdminGuide = require('admin/views/layout/admin_guide');
	require("jquery.go-popup");

	return Backbone.View.extend({

		events: {
			'click #top_menu_profile': 'profileMenu',
			'click #top_menu_help': 'helpMenu',
			'click .list_item': 'cleanSubMenu',
		},
		initialize: function () {
			this.session = App.session();
			this.readSiteAdmin3Guide = false;
			this.guideReadEventReader();
		},
		guideReadEventReader:function(){
			var self = this;
			GO.EventEmitter.on("guide", "update", function(key) {
				self.readSiteAdmin();
				self.tutorialGuideTextView();
			}, this);
		},
		render: function () {
			this.$el.html(Tmpl({
				contextRoot: GO.contextRoot,
				CommonLang:CommonLang,
				AdminLang:AdminLang,
				userName:this.session.name,
				thumbnail:this.session.thumbnail,
				removeDoStartDone:$.cookie("REMOVE_DO_START" + GO.session().id) ? true : false
		}));

			this.read = new ReadedGuide('SiteAdmin3');
			if(this.read.isAlreadyRead()){
				this.readSiteAdmin();
			}


			return this;
		},
		readSiteAdmin:function(){
			this.readSiteAdmin3Guide = true;
			$('#top_menu_help').removeClass('btn_ic_help3');
		},
		tutorialGuideTextView:function(){
			var self = this;
			console.log("tutorial text view")

			this.$el.find('#tutorial_guide_text').css('display', '')

			setTimeout(function() {
				self.$el.find('#tutorial_guide_text').fadeOut(2000, 'linear');
			}, 1000 * 3);
		},
		cleanSubMenu:function(){
			this.$el.find('#top_menu_profile_sub_menu').css('display', 'none');
			this.$el.find('#top_menu_help_sub_menu').css('display', 'none');
		},
		helpMenu:function(){
			if( !this.readSiteAdmin3Guide){
				return;
			}
			this.$el.find('#top_menu_profile_sub_menu').css('display', 'none');
			this.cssToggle(this.$el.find('#top_menu_help_sub_menu'), 'display', 'none', 'inline-block');
		},
		profileMenu:function(){
			this.$el.find('#top_menu_help_sub_menu').css('display', 'none');
			this.cssToggle(this.$el.find('#top_menu_profile_sub_menu'), 'display', 'none', 'inline-block');
		},
		cssToggle:function(el, key, val1, val2){
			var currVal = $(el).css(key);
			console.log("currVal : " + currVal)
			if( currVal === val1){
				$(el).css(key, val2);
			}else{
				$(el).css(key, val1);
			}
		},
	});
});