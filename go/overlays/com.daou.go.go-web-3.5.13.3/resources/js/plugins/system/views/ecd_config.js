(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "system/models/ecd_config",
            "hgn!system/templates/ecd_config",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "i18n!board/nls/board",
            "jquery.go-validation",
            "jquery.go-popup",
            "jquery.go-sdk"
        ],

        function (
            $,
            Backbone,
            GO,
            configModel,
            configTmpl,
            commonLang,
            adminLang,
            boardLang
        ) {
            var lang = {
                "데이터 백업 설정": adminLang['데이터 백업 설정'],
                "데이터 백업 서버": adminLang['데이터 백업 서버'],
                "저장": commonLang['저장'],
                "취소": commonLang['취소']
            }

            var ecdConfig = Backbone.View.extend({

                events: {
                    "click span#btn_ok": "save",
                    "click span#btn_cancel": "cancel",
                    "click span.btn_box[data-btntype='changeform']": "changeModifyForm",
                    "click span#data": "changeModifyForm",
                    "submit form": "formSubmit"
                },

                initialize: function () {
                    this.model = configModel.read();
                },
                formSubmit: function (e) {
                    e.preventDefault();
                    return;
                },

                changeModifyForm: function (e) {
                    var targetEl = $(e.currentTarget).parent();
                    if (targetEl && targetEl.attr('data-formname')) {
                        $(e.currentTarget).hide();
                        targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '" class="input w_small" value="', targetEl.attr('data-value'), '" />'].join(''))
                            .find('input').focusin();

                        var validateEl = targetEl.parent().find('#ecdServerURLValidate');
                        targetEl.find('input').keyup(function (e) {
                            if (!$.goValidation.validateURL($(e.currentTarget).val())) {
                                validateEl.html(boardLang["잘못된 url입니다."]);
                            } else {
                                validateEl.empty();
                            }
                        });
                    }
                },
                render: function () {
                    var self = this;

                    this.$el.empty();
                    var dataset = this.model.toJSON();

                    var tmpl = configTmpl({
                        lang: lang,
                        dataset: dataset
                    });
                    this.$el.html(tmpl);
                    $('.breadcrumb .path').html(adminLang["데이터 백업 설정"]);
                    return this.$el;
                },
                save: function () {
                    var self = this,
                        ecdServerURLVal = $('input[name="ecdServerURL"]').val(),
                        validate = true;

                    if (ecdServerURLVal == undefined) return;

                    if (ecdServerURLVal.length != 0 && !$.goValidation.validateURL(ecdServerURLVal)) {
                        validate = false;
                        $('input[name="ecdServerURL"]').focus();
                        this.$el.find('#ecdServerURLValidate').html(boardLang["잘못된 url입니다."]);
                        return false;
                    }
                    self.model.set('str', ecdServerURLVal);

                    if (!validate) {
                        return false;
                    }

                    self.model.save({}, {
                        success: function (model, response) {
                            if (response.code == '200') {
                                $.goMessage(commonLang["저장되었습니다."]);
                                self.render();
                            }
                        },
                        error: function (model, response) {
                            $.goAlert(commonLang["실패"], commonLang["실패했습니다."]);
                        }
                    });
                },
                cancel: function () {
                    var self = this;
                    $.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function () {
                        self.render();
                        $.goMessage(commonLang["취소되었습니다."]);
                    }, commonLang["확인"]);
                }
            }, {
                __instance__: null
            });

            return ecdConfig;
        });
}).call(this);
