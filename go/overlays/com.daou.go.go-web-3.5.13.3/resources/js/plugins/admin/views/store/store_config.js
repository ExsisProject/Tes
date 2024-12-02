(function() {
    define([
            "jquery",
            "backbone",
            "app",
            "admin/collections/app_admin_list",
            "admin/views/app_admin_list",
            "store/models/config",
            "store/collections/configs",
            "hgn!admin/templates/store/store_config",
            "hgn!admin/templates/app_admin_config",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "jquery.go-orgslide",
            "jquery.go-popup",
            "jquery.go-sdk"
        ],

        function(
            $,
            Backbone,
            App,
            Admins,
            AppAdminListView,
            Config,
            StoreConfigCollection,
            configTmpl,
            adminTmpl,
            commonLang,
            adminLang
        ) {

            var StoreConfig,
                tmplVal = {
                    label_ok: commonLang["저장"],
                    label_cancel: commonLang["취소"]
                };
            var TERMS_ADVERTISEMENT = 'termsAdvertisement';
            StoreConfig = App.BaseView.extend({

                el : '#layoutContent',

                initialize : function(){
                    this.model = new Backbone.Model();
                    this.model.url = "/ad/api/storeconfig";
                    this.model.fetch({async : false});

                    this.adminListView = new AppAdminListView({
                        title: adminLang["Link+ 운영"],
                        collection: new Admins(this.model.get("administrators"))
                    });

                    this.storeConfigs = new StoreConfigCollection(true);
                    this.storeConfigs.fetch({async : false});
                    var config = this.storeConfigs.getConfigByName(TERMS_ADVERTISEMENT);
                    this.termsAdvertisement = config && config.configValue == 'true';
                    this.unbindEvent();
                    this.bindEvent();
                },

                unbindEvent : function() {
                    this.$el.off("click", "#administratorCreate");
                    this.$el.off("click", "span#btn_ok");
                    this.$el.off("click", "span#btn_cancel");
                    this.$el.off("click", "#saveAgree");
                    this.$el.off("click", "#cancelAgree");
                },

                bindEvent : function() {
                    this.$el.on("click", "#administratorCreate", $.proxy(this.createAdministrator, this));
                    this.$el.on("click", "span#btn_ok", $.proxy(this.storeConfigSave, this));
                    this.$el.on("click", "span#btn_cancel", $.proxy(this.storeConfigCancel, this));
                    this.$el.on("click", "#saveAgree", $.proxy(this.saveAgreement, this));
                    this.$el.on("click", "#cancelAgree", $.proxy(this.cancelAgree, this));
                },

                render : function() {
                    this.$el.empty().html(configTmpl({ lang : tmplVal,
                        termsAdvertisement : this.termsAdvertisement}));
                    this.$el.find("div.content_page").prepend(this.adminListView.render());
                    this.$el.find("#admin_title").html(adminLang["운영"]);
                    this.$el.find("#add_text").html(commonLang["추가"]);
                    return this.$el;
                },

                createAdministrator : function(e) {
                    var _this = this;
                    var addAdminCallback = function(data) {
                        _this.adminListView.addAdmin({
                            'userId': data.id,
                            'name': data.name,
                            'position': data.position
                        });
                    };
                    $.goOrgSlide({
                        header : tmplVal.label_admin_add,
                        callback : addAdminCallback,
                        contextRoot : GO.contextRoot,
                        target : e,
                        isAdmin : true
                    });
                },

                storeConfigSave : function(){
                    var saveData = {
                        administrators: this.adminListView.collection.toJSON()
                    };

                    this.model.save(saveData,{
                        success : function(model, response) {
                            if(response.code == '200') {
                                $.goMessage(commonLang["저장되었습니다."]);
                            }
                        },
                        error : function(model, response) {
                            if(response.message) $.goAlert(response.message);
                            else $.goMessage(commonLang["실패했습니다."]);
                        }
                    });
                },

                storeConfigCancel : function(){
                    var self = this;
                    $.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function(){
                        self.initialize();
                        self.render();
                        $.goMessage(commonLang["취소되었습니다."]);
                    }, commonLang["확인"]);
                },

                saveAgreement : function (e) {
                    var self = this;
                    var config = new Config(true);
                    config.set({
                        configName : TERMS_ADVERTISEMENT,
                        configValue : $("#agree_radio").is(':checked')
                    });

                    config.save(null, {
                        success : function () {
                            $.goMessage(commonLang["저장되었습니다."]);

                        },
                        error : function (model, response) {
                            if (response.message) {
                                $.goAlert(response.message);
                            } else {
                                $.goMessage(commonLang["실패했습니다."]);
                            }
                        }
                    });
                },

                cancelAgree : function() {
                    this.render();
                }
            }, {
                __instance__: null
            });

            return StoreConfig;
        });
}).call(this);
