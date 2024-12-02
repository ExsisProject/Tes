define("system/views/timeline_open_api_key",
    [
        "jquery",
        "backbone",

        "i18n!admin/nls/admin",
        "i18n!nls/commons",
        "hgn!system/templates/timeline_open_api_key",
        "system/models/timeline_open_api_key",
    ],

    function(
        $,
        Backbone,

        adminLang,
        commonLang,
        openApiKeyTemplate,
        openApiKeyModel
    ) {
        return Backbone.View.extend({
            initialize: function(options) {
                this.model = new openApiKeyModel('kakao');
                this.model.fetch({async:false});
                this.render(this.model.get('str'));
            },

            events: {
                "click span#btn_ok": "save",
            },

            render: function(appkey) {
                $('.breadcrumb .path').html(adminLang['기타 설정'] +" > " + adminLang["근태관리 지도 Open API"]);
                this.$el.html(openApiKeyTemplate({
                    appkey: appkey,
                    lang: {
                        "title": adminLang["JavaScript 키"],
                        "upload": adminLang["등록"],
                        "info1": adminLang["OpenAPI key 설명1"],
                        "info2": adminLang["OpenAPI key 설명2"],
                        "info3": adminLang["OpenAPI key 설명3"]
                    }
                }));
            },

            save: function() {
                var self = this;
                this.model.set('str', this.$el.find("#appkey").val());
                this.model.save({}, {
                    type: 'PUT',
                    success: function (model, response) {
                        self.render(model.get('str'));
                        $.goMessage(commonLang["저장되었습니다."]);
                    },
                    error: function (model, response) {
                        $.goMessage(commonLang["실패했습니다."]);
                    }
                });
            }
        })
    }
);