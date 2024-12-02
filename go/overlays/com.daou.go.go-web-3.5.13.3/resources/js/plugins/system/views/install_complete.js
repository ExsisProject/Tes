define([
	"jquery",
	"backbone", 	
	"app",
    "hgn!system/templates/install_complete",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "jquery.go-orgslide",
    "jquery.go-sdk",
    "jquery.go-validation",
    "swfupload",
	"swfupload.plugin"
], 

function(
	$, 
	Backbone,
	App,
	InstallCompleteTmpl,
	commonLang,
	adminLang
) {
	var tmplVal = {
			install_complete : adminLang['등록이 완료 되었습니다'],
			install_complete_message : adminLang['설치 완료 메세지'],
			move_login : adminLang['로그인 화면으로 이동']
		};
	var instance = null;
	var installComplete = App.BaseView.extend({
		initialize : function() {
			this.deleteInstallUser();
		},
		events : {
		},
		render : function() {
			var self = this;
			var contents = InstallCompleteTmpl({
				lang : tmplVal
			});
			this.$el.html(contents);
		},
		deleteInstallUser : function(){
			var url = GO.contextRoot + "ad/api/user/delete/install/user";
		
			$.go(url, "",{
				qryType : 'DELETE',
				responseFn : function(response) {
					if(response.code == 200 && response.data.duplicated){
					}
				},
				error: function(response){
					var responseData = JSON.parse(response.responseText);
					$.goMessage(responseData.message);
				}
			});
		}
	},{
		create: function(opt) {
			instance = new installComplete({el : '#installLayout'});
			return instance.render();
		}
	});
	
	return {
		render: function(opt) {
			var layout = installComplete.create(opt);
			return layout;
		}
	};
});