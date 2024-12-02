(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "system/models/chat_bot_config",
            "hgn!system/templates/chat_bot_config",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "jquery.go-grid",
            "jquery.go-sdk",
            "GO.util"
        ],

        function (
            $,
            Backbone,
            App,
            chatBotModel,
            chatBotTmpl,
            commonLang,
            adminLang
        ) {
            var lang = {
                '사용여부': adminLang["사용여부"],
                '사용' : commonLang["사용"],
                '사용하지않음' : commonLang["사용하지 않음"],
                '저장': commonLang['저장']
            };
            var chatBotView = Backbone.View.extend({
                events : {
                    "click span#btn_ok" : "saveConfig"
                },
                initialize: function () {
                    this.chatBotModel = chatBotModel.get();
                },
                render: function () {
                    this.$el.html(chatBotTmpl({
                        lang: lang,
                        chatBot: this.chatBotModel.toJSON()
                    }));
                },
                saveConfig: function () {
                    var chatBotUse = $("input[name='chatBotUse']:checked").val();
                    this.chatBotModel.set("use", chatBotUse == 'on' ? true : false);
                    this.chatBotModel.save({}, {
                        type: 'PUT',
                        success : function(model, response) {
                            if(response.code == '200') {
                                $.goMessage(commonLang["저장되었습니다."]);
                            }
                        },
                        error : function(model, response) {
                            $.goMessage(commonLang["실패했습니다."]);
                        }
                    })
                }
            }, {
                __instance__: null
            });

            return chatBotView;
        });
}).call(this);
