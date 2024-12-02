define('admin/views/layout/admin_guide_button', function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var App = require('app');
	var Tmpl = require('hgn!admin/templates/layout/admin_guide_button');

	var CommonLang = require('i18n!nls/commons');
	var AdminLang = require("i18n!admin/nls/admin");

	var ReadedGuide = require('admin/models/layout/readed_guide');
	var AdminGuide = require('admin/views/layout/admin_guide');
	require("jquery.go-popup");

	return Backbone.View.extend({

		events: {
			'click #popup_admin_guide' :'popupGuide',
			'click .btn_layer_x' :'close'
		},

		initialize: function (options) {
			this.read = new ReadedGuide('SiteAdmin3');
			this.hidden = this.read.isAlreadyRead();
		},
		tpl:function(menu){

		},
		render: function () {

			if( !this.hidden){
				$('#admin_guide_button').css('display', '')
			}else{
				$('#admin_guide_button').css('display', 'none');
			}

			this.$el.html(Tmpl({
				AdminLang:AdminLang,
				CommonLang:CommonLang,
				contextRoot: GO.contextRoot,
				view:!this.hidden,
			}));

			return this;
		},
		popupGuide:function(){
			this.adminGuide = new AdminGuide();
			this.adminGuide.render();
			this.hidden = true;
			this.render();
		},
		close:function(){
			this.hidden = true;
			this.read.updateReaded();
			this.render();
		}
	});
});