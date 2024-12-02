(function() {
	define([
		"jquery",
		"backbone",
		"app",
		"admin/models/menu_admin",
		"hgn!admin/templates/function_list",

	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
	    "jquery.go-validation",
	    "jquery.go-popup",
	    "jquery.go-sdk"
	],

	function(
		$,
		Backbone,
		App,
		AllMenu,
		FunctionListTmpl,

		commonLang,
		adminLang
	) {
		var tmplVal = {
			function_list : adminLang["기능 목록"],
			label_fmenu : adminLang["기능 메뉴"],
			label_able : adminLang["사용여부"],
			label_access : adminLang["접근설정"],
			label_setting: commonLang["설정"],
			label_online:commonLang["사용"],
			label_stop: commonLang["사용하지 않음"],
			label_black : adminLang['차단정책'],
			label_white : adminLang['허용정책'],
			label_non_fmenu : adminLang["기능메뉴가 없습니다."]
		};

		var MenuAll = App.BaseView.extend({
			el : '#layoutContent',

			initialize : function() {
				this.model = new AllMenu();
				this.model.fetch({async : false});
				this.unbindEvent();
				this.bindEvent();
			},

			unbindEvent : function() {
				this.$el.off("click", "span.btn_setting_fmenu");
			},

			bindEvent : function() {
				this.$el.on("click", "span.btn_setting_fmenu", $.proxy(this.setFunctionMenu, this));
			},

			render : function() {
				this.$el.empty();

				var dataset = this.model.toJSON();
				var tmpl = FunctionListTmpl({
					lang : tmplVal,
					dataset : dataset,
					isOnline : function() {
						if(this.status == 'online') return true;
						return false;
					},
					isBlack : function() {
						if("black" == this.accessSetting) return true;
						return false;
					},
					nameValue : function(){
						if(this.name == 'org'){
							return adminLang["조직도 - 웹서비스"];
						}else if(this.name == 'org_mobile'){
							return adminLang["조직도 - 모바일"];
						}else if(this.name == 'org_pc'){
							return adminLang["조직도 - PC 메신저"];
						}else if(this.name == 'chat'){
							return adminLang["대화"];
						}else if(this.name == 'messenger'){
							return adminLang["PC 메신저"];
						}else if(this.name == 'mobileapp'){
							return adminLang["모바일 앱"];
						}else if(this.name == "note"){
							return adminLang['쪽지'];
						}else if(this.name == 'pubsubcircle'){
							return adminLang["공지톡"];
						}
					}

				});

				this.$el.html(tmpl);

				return this.$el;
			},

			setFunctionMenu: function(e){
				var menuEl = $(e.currentTarget).parents('tr'),
					menuId = menuEl.attr('data-id');

				App.router.navigate('/company/fmenu/'+menuId+"/modify", true);
			}
		},{
			__instance__: null
		});

		return MenuAll;
	});

}).call(this);