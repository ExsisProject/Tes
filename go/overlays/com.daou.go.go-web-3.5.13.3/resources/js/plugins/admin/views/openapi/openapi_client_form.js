define("admin/views/openapi/openapi_client_form", function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var GO = require("app");
    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require("i18n!nls/commons");

    var OpenApiScope = require('admin/constants/openapi_scope');
    var ClientFormTmpl = require("hgn!admin/templates/openapi/openapi_client_form");
    require("jquery.go-validation");
    var lang = {
        '클라이언트이름': adminLang['클라이언트 이름'],
        'ko': adminLang['KO'],
        'en': adminLang['EN'],
        'jp': adminLang['JP'],
        'zh-cn': adminLang['ZH-CN'],
        'zh-tw': adminLang['ZH-TW'],
        'vi': adminLang['VI'],
        '서비스URL': adminLang['서비스 URL'],
        '제공서비스': adminLang['제공 서비스'],
        '설명': adminLang['설명'],
        '저장': commonLang['저장'],
        '취소': commonLang['취소']
    };

    var OpenApiClientModel = Backbone.Model.extend({
        urlRoot: function () {
            return GO.contextRoot + 'ad/api/oauthclient';
        }
    });

    var OpenApiClientView = Backbone.View.extend({
        el: '#layoutContent',

        events: {
            "click #save": "save",
            "click #cancel": "cancel"
        },

        initialize: function (options) {
            this.$el.off();
            var oauthClientId = this.options.oauthClientId;
            this.isCreate = _.isUndefined(oauthClientId);
            this.model = new OpenApiClientModel();
            if (!this.isCreate) {
                this.model.set({id: oauthClientId});
            }
        },

        render: function () {
            var self = this;
            var filteredScope = _.filter(OpenApiScope, function (scope) {
                return !_.contains(["COMPANY", "SYSTEM"], scope.key);
            }, this);
            if (this.isCreate) {
                this.$el.html(ClientFormTmpl({
                    lang: lang,
                    scope: filteredScope,
                    isCreate: true
                }));
            } else {
                this.model.fetch().done($.proxy(function () {
                    var data = this.model.toJSON();
                    this.$el.html(ClientFormTmpl({
                        lang: lang,
                        scope: filteredScope,
                        data: data,
                        isCreate: false
                    }));
                    self.checkScope(data.scope);
                }, this));
            }
        },

        checkScope: function (scope) {
            if (!_.isUndefined(scope)) {
                var scopeList = scope.split(',');
                var $scopeEl = this.$el.find("#scope");
                for (var i = 0; i < scopeList.length; i++) {
                    $scopeEl.find('input[type=checkbox][value=' + scopeList[i].toUpperCase() + ']').prop("checked", "true");
                }
            }
        },

        getParams: function () {
            return {
                koName: this.$el.find("#koName").val(),
                enName: this.$el.find("#enName").val(),
                jpName: this.$el.find("#jpName").val(),
                zhcnName: this.$el.find("#zhcnName").val(),
                zhtwName: this.$el.find("#zhtwName").val(),
                viName: this.$el.find("#viName").val(),
                baseUrl: this.$el.find("#baseUrl").val(),
                redirectUrl: this.$el.find("#redirectUrl").val(),
                description: this.$el.find("#description").val(),
                scopeList: this.getScopeList()
            };
        },

        save: function () {
            if (!this.validate()) return;
            this.model.save(this.getParams(), {
                success: function (model, response) {
                    if (response.code == '200') {
                        $.goMessage(commonLang["저장되었습니다."]);
                        GO.router.navigate("company/openapi", {trigger: true});
                    }
                },
                error: function (model, response) {
                    if (response.message) $.goAlert(response.message);
                    else $.goMessage(commonLang["실패했습니다."]);
                }
            });
        },

        getScopeList: function () {
            var scopes = [];
            var checkedEls = this.$el.find("input[type=checkbox]:checked");
            for (var i = 0; i < checkedEls.length; i++) {
                scopes.push(checkedEls[i].value.toUpperCase());
            }
            return scopes;
        },

        checkRequiredInput: function () {
            if (this.$el.find("#koName").val().trim() == ""
                || this.$el.find("#baseUrl").val().trim() == ""
                || this.$el.find("#redirectUrl").val().trim() == "") {
                $.goAlert(commonLang['필수항목을 입력하지 않았습니다.']);
                return false;
            }
            return true;
        },

        checkInputLength: function () {
            var inputs = this.$el.find("input[type=text]");
            for (var i = 0; i < inputs.length; i++) {
                if ($.goValidation.isInvalidLength(0, 255, $(inputs[i]).val())) {
                    $.goAlert(GO.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."], {arg1: 255}));
                    return false;
                }
            }
            return true;
        },

        checkUrlFormat: function () {
            if (!$.goValidation.validateURL(this.$el.find("#baseUrl").val()) ||
                !$.goValidation.validateURL(this.$el.find("#redirectUrl").val())) {
                $.goAlert(commonLang['입력하신 주소가 올바른지 다시 한 번 확인하여 주시기 바랍니다']);
                return false;
            }
            return true;
        },

        validate: function () {
            if (!this.checkRequiredInput()) return false;
            if (!this.checkInputLength()) return false;
            if (!this.checkUrlFormat()) return false;
            return true;
        },

        cancel: function () {
            GO.router.navigate("company/openapi", {trigger: true});
        }
    });
    return OpenApiClientView;
});
