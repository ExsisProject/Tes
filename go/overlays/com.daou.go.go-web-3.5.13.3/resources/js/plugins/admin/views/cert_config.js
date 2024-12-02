define([
    "jquery",
    "backbone",
    "app",
    "i18n!admin/nls/admin",
    "i18n!nls/commons",
    "hgn!admin/templates/cert_config",
    "admin/views/user_cert_list"
],

function(
	$,
	Backbone,
	App,
	adminLang,
	commonLang,
	layoutTpl,
	UserCertList
) {

	var lang = {
		'label_ok': commonLang['저장'],
		'label_cancel': commonLang['취소'],
		'label_title' : adminLang['기본 설정'],
		'label_cert_login' : adminLang['공인인증서 로그인'],
		'label_use' : adminLang['사용함'],
		'label_unuse' : commonLang['사용하지 않음']
	};

	var CertConfigView = Backbone.View.extend({
		unbindEvent: function() {
			this.$el.off("click", ".tab_menu li");
			this.$el.off("click", "span#ok");
			this.$el.off("click", "span#cancel");
			this.$el.off("submit", "form");
		},
		bindEvent : function() {
			this.$el.on("click", ".tab_menu li", $.proxy(this.moveCompanyBoardTab, this));
			this.$el.on("click", "span#ok", $.proxy(this.configSave, this));
			this.$el.on("click", "span#cancel", $.proxy(this.configCancel, this));
			this.$el.on("submit", "form", $.proxy(this.formSubmit, this));
		},
		initialize: function() {
			this.unbindEvent();
			this.bindEvent();
			this.model = new Backbone.Model();
			this.model.url = GO.contextRoot + "ad/api/certconfig";
			this.model.fetch({async : false});
		},
		formSubmit : function(e) {
			e.preventDefault();
			return;
		},
		render : function(args) {
			var useSystemCert = this.model.get('useSystemCert');
			if (useSystemCert == false) {
				this.$el.html();
				return;
			}

			var data = this.model.toJSON();
			var tmpl = layoutTpl({
				model : data,
				lang : lang
			});
			this.$el.html(tmpl);
			UserCertList.render('use');
		},
		moveCompanyBoardTab : function(e){
			var targetEl = $(e.currentTarget);
			if (targetEl.hasClass('active')){
				return;
			}

            targetEl.siblings('li').removeClass('active');
            targetEl.addClass('active');
            if (targetEl.attr('data-type') == 'activeBoard'){
                UserCertList.render('ACTIVE');
            }else{
                UserCertList.render('CLOSED');
            }
		},
		configSave: function() {
			var self = this,
				form = this.$el.find('form[name=certConfig]');

			$.each(form.serializeArray(), function(k,v) {console.log(v.name);
				self.model.set(v.name, v.value, {silent: true});
			});
			self.model.save({}, {
				success : function(model, response) {
					if(response.code == '200') {
						$.goMessage(commonLang["저장되었습니다."]);
						self.render();
					}
				},
				error : function(model, response) {
					var responseData = JSON.parse(response.responseText);
					if(responseData.message != null){
						$.goMessage(responseData.message);
					}else{
						$.goMessage(commonLang["실패했습니다."]);
					}
				}
			});
		},
		configCancel : function(){
			var self = this;
			$.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function() {
				self.render();
				$.goMessage(commonLang["취소되었습니다."]);
			}, commonLang["확인"]);
		}
	});
	return CertConfigView;
});