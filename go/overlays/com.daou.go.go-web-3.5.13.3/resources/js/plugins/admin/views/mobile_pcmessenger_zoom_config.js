define(function(require){
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    var mobileAttachZoomConfigTmpl = require("hgn!admin/templates/mobile_attach_zoomconfig");

    var ZoomConfigView = Backbone.View.extend({
        events : {
            "click span#btn_ok": "_mobileAttachZoomConfigSave"
        },

        initialize : function() {
            this.zoomConfigModel = new Backbone.Model();
            this.zoomConfigModel.url = "/ad/api/config/agreement/ZOOM";


        },

        render : function() {
            this.zoomConfigModel.fetch().done($.proxy(function() {
                this.$el.html(mobileAttachZoomConfigTmpl({
                    adminLang : adminLang,
                    commonLang : commonLang,
                    agreement: (this.zoomConfigModel.get('agreement') | false),
                    updatedAt: this.zoomConfigModel.get("updatedAt")
                }));
            }, this));
        },

        _mobileAttachZoomConfigSave : function(e) {
            this._confirmPopup();
        },

        _alertPopup : function(message) {
            var self = this;

            $.goPopup({
                modal : true,
                width: '250',
                pid: 'wakeup_confirm',
                pclass : 'layer_confim',
                message: message,
                buttons : [{
                    btext : "확인",
                    btype : "confirm",
                    autoclose : true,
                    callback: function() {
                        self.render(self)
                    }
                }]
            });
        },

        _confirmPopup : function() {
            var self = this;
            var message = "";
            var subMessage = "";

            if (self.zoomConfigModel.get('agreement') == $("#zoomAgreement").is(':checked')) {
                return;
            }

            if (self.zoomConfigModel.get('agreement')) {
                message = adminLang["화상회의 Zoom 연동서비스 이용을 취소하시겠습니까?"];
                subMessage = '<p class="q">' + adminLang["취소되었습니다"] + '</p><p class="add">' + adminLang["서비스 사용이 불가함에 따라 PC메신저를 재시작 하여 주시기 바랍니다"] + '</p>';
            }else {
                message = adminLang["화상회의 Zoom 연동서비스 이용에 동의하십니까?"];
                subMessage = '<p class="q">' + adminLang["동의가 완료되었습니다"] + '</p><p class="add">' + adminLang["화상회의 Zoom 연동서비스 이용을 위해 PC 메신저를 재부팅 하여 주시기 바랍니다"] + '</p>';
            }

            $.goPopup({
                modal : true,
                width: '250',
                pid: 'wakeup_confirm',
                pclass : 'layer_confim',
                message: '<p class="q">' + message + '</p>',
                buttons : [
                    {
                        btext : commonLang["확인"],
                        btype : "confirm",
                        autoclose : true,
                        callback : function() {
                            self.zoomConfigModel.save(
                                {agreement: $("#zoomAgreement").is(':checked')},
                                {
                                    success: self._alertPopup(subMessage),
                                    error: self.render()
                                }
                            );
                        }
                    },
                    {
                        btext : commonLang["취소"],
                        btype : 'cancel',
                        autoclose : true
                    }
                ]
            });
        },
    });

    return ZoomConfigView;
});