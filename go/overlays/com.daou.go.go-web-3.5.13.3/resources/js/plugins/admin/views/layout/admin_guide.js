define('admin/views/layout/admin_guide', function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var App = require('app');

	var Tmpl = require('hgn!admin/templates/layout/admin_guide');
	var ReadedGuide = require('admin/models/layout/readed_guide');
	var AdminLang = require("i18n!admin/nls/admin");
	var MailAdminBase = require('admin/models/layout/mail_admin_base');

	require("jquery.go-popup");

	return Backbone.View.extend({
		id:'admin_guide_3',
		events: {
			'click .align_right' :'movePage',
			'click .align_left' :'movePage',
			'click .btn_next' :'movePage',
			'click .btn_prev' :'movePage',
			'click .btn_layer_x': 'close',
		},

		initialize: function (options) {
			this.options = options || {};
			this.step = this.options.step ? options.step : "step1";
			this.read = new ReadedGuide('SiteAdmin3');
			this.adminBase = new MailAdminBase();

			this.sizeCheck()
		},
		sizeCheck:function(){
			var self = this;
			this.intervalId = setInterval(function () {
				var windowHeight = $(window).height();
				if (self.windowHeight!== windowHeight) {
					self.resize();
				}
				self.windowHeight= windowHeight;
			}, 100);
		},
		resize:function(){
			var wSize = $(window).height();
			var pSize = $('#gpopupLayer').height();
			var top = (wSize - pSize) /2 ;
			$('#gpopupLayer').css('top', top +'px');
		},
		tpl:function(menu){

		},
		movePage:function(e){
			var target = $(e.currentTarget);
			var val = target.attr('value');
			if( !!!val ){
				return;
			}

			if( val === 'orgMenu'){
				App.router.navigate('/account/domaincode', {trigger: true, pushState: true});
				this.close();
			}else{
				this.step = val;
				this.renderContent();
			}
		},
		renderContent:function(){

			var step1= this.step === 'step1';
			var stepOrg1= this.step === 'stepOrg1';
			var stepOrg2 = this.step === 'stepOrg2';
			var stepOrg3 = this.step === 'stepOrg3';

			console.log(this.adminBase.getAdmLang() )
			var lang = this.adminBase.getAdmLang() === 'ko' ? 'kor' :'eng';

			this.$el.html(Tmpl({
				AdminLang:AdminLang,
				contextRoot: App.contextRoot,
				lang:lang,
				step1:step1,
				stepOrg1:stepOrg1,
				stepOrg2:stepOrg2,
				stepOrg3:stepOrg3,
			}));

			if( this.step.indexOf('Org') >0){
				$('.go_popup').addClass('layer_org');
			}else{
				$('.go_popup').removeClass('layer_org');
			}


		},
		close:function(){
			this.read.updateReaded();
			this.popup.close();
		},
		render: function () {

			this.popup = $.goPopup({
				pclass :'layer_tutorial layer_intro',
				closeIconVisible : false,
				width:'1100px',
				modal: true,
				draggable : false,
				contents: this.$el,
			});
			this.renderContent();

			this.popup.reoffset();

			$("#admin_guide_3").insertAfter('#popOverlay');
			$(".go_popup").empty();
			$("#admin_guide_3").appendTo('.go_popup');

			this.resize();

			return this;
		}
	});
});