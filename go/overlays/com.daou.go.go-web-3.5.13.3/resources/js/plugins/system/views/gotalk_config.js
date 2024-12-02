(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "hgn!system/templates/gotalk_config",
            "i18n!admin/nls/admin",
            "jquery.go-popup"
        ],

        function (
            $,
            Backbone,
            GO,
            configTmpl,
            adminLang
        ) {
            var lang = {
                "Gotalk 설정": adminLang["Gotalk 설정"],
                "무료방 생성": adminLang["무료방 생성"],
                "생성": adminLang["생성"]
            };

            var gotalkConfig = Backbone.View.extend({

                events: {
                    "click span#btn_ok": "createFreeRoomByAll"
                },

                initialize: function () {
                    this.gotalkConfigModel = new Backbone.Model();
                    this.gotalkConfigModel.url = "/ad/api/gotalkconfig";
                },

                createFreeRoomByAll: function () {
                    this.gotalkConfigModel.save({}, {
                        success: function () {
                            $.goMessage('SUCCESS');
                        },
                        error: function (error) {
                            $.goMessage('FAIL: ' + error.message);
                        }
                    });
                },
                render: function () {
                    this.$el.html(configTmpl({
                        lang: lang,
                    }));
                    $('.breadcrumb .path').html(adminLang["Gotalk 설정"]);
                    return this.$el;
                }
            });

            return gotalkConfig;
        });
}).call(this);
