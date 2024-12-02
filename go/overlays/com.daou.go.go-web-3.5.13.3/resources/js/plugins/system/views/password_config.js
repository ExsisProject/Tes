define("system/views/password_config", [
	"jquery",
	"backbone", 	
	"app",
	"hgn!system/templates/password_config",
	"system/models/password_config",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "jquery.go-grid",
    "jquery.go-sdk",
    "GO.util"
], 

function(
	$, 
	Backbone,
	App,
	PasswordConfigTmpl,
	PasswordConfigModel,
	commonLang,
	adminLang
) {
	var tmplVal = {
		'label_set_password_config' : adminLang['비밀번호 찾기 설정'],
		'label_password_finding_config' : adminLang['비밀번호 찾기'],
		'label_password_finding_config_tooltip' : adminLang['사용자가 계정 비밀번호를 잊어버린 경우, 임시 비밀번호를 발급받을 수 있습니다.'],
		'label_use' : adminLang['사용'],
		'label_notuse' : adminLang['사용하지 않음'],
		'label_ok': commonLang['저장'],
		'label_cancel': commonLang['취소']
	};
	
	var PasswordConfigView = Backbone.View.extend({
		initialize : function(options) {
			
			this.render();
			
			this.passwordSearchFeatureTrue = this.$("#passwordSearchFeature_true");
			this.passwordSearchFeatureFalse = this.$("#passwordSearchFeature_false");
			
			this.model = new PasswordConfigModel();
			this.model.on('sync', this.refresh, this);
			this.model.fetch();
		},
		events : {
			"click span#btn_ok" : "save",
			"click span#btn_cancel" : "cancel",
			"change input" : "onChanged"
		},
		render : function() {
			
			$('#etcConfig').addClass("on");
			
			$('.breadcrumb .path').html(adminLang['기타 설정'] +" > " + tmplVal['label_set_password_config']);
		    this.$el.html(PasswordConfigTmpl({
				lang : tmplVal
			}));
		},

		onChanged : function(e) {
			this.model.set('passwordSearchFeature', this.passwordSearchFeatureTrue.attr('checked') ? true : false);
		},
		
		// model to view
		refresh : function() {
			if(this.model.get('passwordSearchFeature')){
				this.passwordSearchFeatureTrue.attr('checked', true);
			}else{
				this.passwordSearchFeatureFalse.attr('checked', true);
			}
		},
		
		save : function() {
			var self = this;
			self.model.save({}, {
				type : 'PUT',
				success : function(model, response) {
					if(response.code == '200') {
						$.goMessage(commonLang["저장되었습니다."]);
						self.initialize();
					}
				}
			});
		},
		
		cancel : function() {
			this.render();
		}
		
	});

	return PasswordConfigView;
});
