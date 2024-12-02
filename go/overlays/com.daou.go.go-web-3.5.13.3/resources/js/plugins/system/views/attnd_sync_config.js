(function() {
	define([
	"backbone", 
	"app",
	"system/models/attnd_sync_config",
	"hgn!system/templates/attnd_sync_config",
	"i18n!admin/nls/admin",
	"i18n!nls/commons",
	"jquery.go-validation"
	],

	function(
	Backbone,
	GO,
	AttndModel,
	AttndTmpl,
	adminLang,
	commonLang
	) {
		
		var lang = {
				label_edit: commonLang["수정"],
				label_ok: commonLang["저장"],
				label_cancel: commonLang["취소"],
				label_fail: commonLang["실패"],
				label_failDesc: commonLang["실패했습니다."],
				label_sucess: commonLang["저장되었습니다."],
				label_ko: adminLang["KO"],
				label_en: adminLang["EN"],
				label_jp: adminLang["JP"],
				label_zhcn: adminLang["ZH-CN"],
				label_zhtw: adminLang["ZH-TW"],
				label_usage : adminLang["사용여부"],
				label_order : adminLang["정렬여부"],
				label_use : commonLang["사용"],
				label_no_use : commonLang["사용하지 않음"],
				label_folder_name : adminLang["폴더명"],
				label_add : commonLang["추가"],
				label_delete : commonLang["삭제"],
				label_attnd_sync : adminLang["근태 동기화"],
				label_attnd_sync_time : adminLang["주기설정"]
				};

		var attnd_config = Backbone.View.extend({

			events : {
				"click .ic_edit" : "editText",
				"click #btn_ok" : "saveAttndSyncConfig",
				"click input:radio[name='attndSyncUse']" : "chageAttndSyncUse"
			},

			initialize : function() {
				this.AttndModel = AttndModel.get();
			},

			render : function() {
				var self = this;
				$('.breadcrumb .path').html(adminLang["근태 동기화 설정"]);

				var tmpl = AttndTmpl({
					lang : lang,
					data : this.AttndModel.toJSON()
				});
				this.$el.html(tmpl);
				return this.$el;
			},
			
			editText : function(e) {
				var targetEl = $(e.currentTarget).closest("td");
				targetEl.find(".editable").hide();
				targetEl.find("input:text").show();
			},

			saveAttndSyncConfig : function() {
				var self = this;
				
				var attndSyncCron = this.$el.find("#attndSyncCron").val();
				var attndSyncUse = this.$el.find("input:radio[name='attndSyncUse']:checked").val();

				self.AttndModel.set("attndSyncUse", attndSyncUse == 'on' ? true : false);
				self.AttndModel.set("attndSyncCron", attndSyncUse == 'on' ? attndSyncCron : '');

				self.AttndModel.save({}, {
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(lang['label_sucess']);
							self.AttndModel = AttndModel.get();
							self.render();
						}
					},
					error : function(model, response) {
						$.goAlert(lang['label_fail'],lang['label_failDesc']);
					}
				})
			},
			
			showValidateMsg : function(targetId, msg) {
				$('#' + targetId).focus();
				$('#' + targetId + 'Validate').html(msg);
			},

			chageAttndSyncUse : function(e) {
				if($(e.currentTarget).val() == "on") {
					this.$el.find("#use_attnd_sync_setting, #example").show();
				} else {
					this.$el.find("#use_attnd_sync_setting, #example").hide();
				}
			}

		},{
			__instance__: null
		});

		function privateFunc(view, param1, param2) {

		}

		return attnd_config;

	});

})();