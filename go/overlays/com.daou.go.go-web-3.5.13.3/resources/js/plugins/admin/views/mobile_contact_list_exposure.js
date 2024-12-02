define(function(require) {
	var MobileConfig = require("models/mobile_config");
	var Template = require("hgn!admin/templates/mobile_contact_list_exposure");
	var commonLang = require("i18n!nls/commons");
	var adminLang = require('i18n!admin/nls/admin');

    var lang = {
		label_not_use: adminLang["사용안함"],
		label_use: commonLang["사용"],
        label_ok: commonLang["저장"],
        label_cancel: commonLang["취소"],
        label_contact_list_exposure : adminLang['주소록 목록 보안 설정'],
        use_contact_list : adminLang['주소록 목록 사용하기'],
        contact_exposure_help : adminLang['주소록 목록 사용하기 도움말']
    };

    var ContactListExposure = Backbone.View.extend({

        el : '#mobileContactListExposureArea',

        events : {
            "click span#btn_ok" : "_mobileConfigSave",
            "click span#btn_cancel" : "_mobileConfigCancel"
        },

		initialize : function() {
            this.model = new MobileConfig({
                adminContext: true
            });
		},

		render : function() {
            this.model.fetch().done($.proxy(function() {
                this.$el.html(Template({
                    lang : lang,
                    model: this.model.toJSON()
                }));
            }, this))
		},
        _mobileConfigSave : function(e) {
            e.stopPropagation();

            var self = this,
				saveData = {
                    mobileContactList : $.parseJSON($('form[name=formMobileContactConfig] input[type="radio"]:checked').val())
            };
            self.model.save(saveData, {
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

        _mobileConfigCancel : function(e) {
            e.stopPropagation();

            var self = this;
            $.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function() {
                self.render();
                $.goMessage(commonLang["취소되었습니다."]);
            }, commonLang["확인"]);
        }
	});

    return ContactListExposure;
});