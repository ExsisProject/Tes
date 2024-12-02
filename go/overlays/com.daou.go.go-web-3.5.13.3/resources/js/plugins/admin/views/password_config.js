(function () {
    define([
            "jquery",
            "backbone",
            "app",

            "hgn!admin/templates/password_config",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "jquery.go-validation",
            "jquery.go-popup",
            "jquery.go-validation"
        ],

        function ($,
                  Backbone,
                  App,
                  configTmpl,
                  commonLang,
                  adminLang) {
            var tmplVal = {
                label_copy: commonLang["복사"],
                label_ok: commonLang["저장"],
                label_cancel: commonLang["취소"],
                label_title: adminLang["보안 설정"],
                label_pwd_manage: adminLang["비밀번호 관리"],
                label_min_length: adminLang["비밀번호 최소 길이"],
                label_max_length: adminLang["비밀번호 최대 길이"],
                label_mandatory: adminLang["필수포함 문자"],
                label_num: adminLang["숫자"],
                label_blank: adminLang["공백"],
                label_symbol: adminLang["특수문자"],
                label_taboo: adminLang["사용금지 문자"],
                label_name: commonLang["이름"],
                label_id: adminLang["아이디"],
                label_same: adminLang["동일문자"],
                label_over: adminLang["개 이상"],
                label_serial: adminLang["연속문자"],
                label_input: adminLang["직접입력"],
                label_desc: adminLang["※ 금지문자는 한줄에 한 개씩 입력"],
                label_perior: adminLang["비밀번호 변경 주기"],
                label_non: adminLang["지정하지 않음"],
                label_month: adminLang["개월"],
                label_use: adminLang["사용함"],
                label_notuse: commonLang["사용하지 않음"],
                label_fail: adminLang["비밀번호 오류 설정"],
                label_fail_count: adminLang["비밀번호 연속오류"],
                label_count: adminLang["회"],
                label_min: adminLang["분"],
                label_select: adminLang["사용여부"],
                label_alert: adminLang['입력값은 0~0이어야 합니다.'],
                label_reuse: adminLang['이전 비밀번호 재사용'],
                label_enable: commonLang['허용'],
                label_disable: commonLang['허용하지 않음'],
                label_limit_password_reuse_count_desc: adminLang["이전 비밀번호 재사용 설명"],
                label_time: adminLang["회"],
                label_last: adminLang["최근"],
                label_within: adminLang["이내"],
                label_first_login: adminLang["첫 로그인"],
                label_force_change: adminLang["강제 변경"],
                label_force_change_desc: adminLang["강제 변경 설명"],
                label_on: commonLang["사용"],
                label_off: commonLang["사용하지 않음"],
                label_password_force_chage_all: adminLang["전체 사용자 비밀번호 재설정"],
                label_password_force_chage_all_tip: adminLang["전체 사용자 비밀번호 재설정 설명"],
                label_resetting: adminLang["재설정"],
                label_Alphabet: adminLang["문자"],
                label_password_change: adminLang["비밀번호 변경"],
                label_password_change_guide: adminLang["비밀번호 강제 변경 유도"],
                label_last_change_time: adminLang["마지막 설정 시간"],
                label_reset_title: adminLang["초기화 비밀번호 설정"],
                label_password: adminLang["비밀번호"],
                label_reset_pwd_desc: adminLang["초기화 비밀번호 설명"],
                label_use_captcha: adminLang["자동입력 방지문자 사용"],
                label_captcha_desc: adminLang["자동입력 방지문자 설명"],
                label_request_change_password: adminLang["비밀번호 강제 변경"],
                label_request_change_password_tip: adminLang["비밀번호 강제 변경 설명"],
                characters: adminLang["자"]
            };
            var PasswordConfig = App.BaseView.extend({

                initialize: function () {
                    this.model = new Backbone.Model();
                    this.isServiceMode = GO.session().serviceAdminMode;
                    this.model.url = "/ad/api/passwordconfig";
                    this.model.fetch({async: false});
                },

                events: {
                    "click span#btn_ok": "confirmSave",
                    "click span#btn_cancel": "passwordConfigCancel",
                    "click form[name='formPaswordConfig'] input:checkbox": "toggleCheckbox",
                    "click form[name='formPaswordConfig'] input:radio": "toggleRadio",
                    "click span#data": "changeModifyForm",
                    "click span.btn_box[data-btntype='changeform']": "changeModifyForm",
                    "click #pwd_force_resetting": "pwdForceResetting",
                    "focusout input[type='input']": "inputValidator",
                    "focusout textarea": "inputValidator",
                    "keyup #passwordWrap input[type='input']": "keyupValidator",
                    "keyup #passwordWrap textarea": "keyupValidator",
                    "submit form": "formSubmit",
                    "change input[name=passwordReuse]": "toggleReuse"
                },

                render: function () {
                    var self = this;
                    var data = this.model.toJSON();
                    var tmpl = configTmpl({
                        lang: tmplVal,
                        selectMonth: [
                            {"value": "1"}, {"value": "2"}, {"value": "3"},
                            {"value": "4"}, {"value": "5"}, {"value": "6"},
                            {"value": "7"}, {"value": "8"}, {"value": "9"},
                            {"value": "10"}, {"value": "11"}, {"value": "12"}
                        ],
                        selectCount: [
                            {"value": "3"}, {"value": "4"}, {"value": "5"},
                            {"value": "6"}, {"value": "7"}, {"value": "8"},
                            {"value": "9"}, {"value": "10"}
                        ],
                        selectTime: [
                            {"value": "10"}, {"value": "15"}, {"value": "20"},
                            {"value": "25"}, {"value": "30"}, {"value": "35"},
                            {"value": "40"}, {"value": "45"}, {"value": "50"},
                            {"value": "55"}, {"value": "60"}
                        ],
                        LimitPasswordReuseCount: [
                            {"value": "1"}, {"value": "2"}, {"value": "3"},
                            {"value": "4"}, {"value": "5"}, {"value": "6"},
                            {"value": "7"}, {"value": "8"}, {"value": "9"},
                            {"value": "10"}
                        ],
                        model: data,
                        isServiceMode: this.isServiceMode,
                        lastChangeTime: this.getLastChangeTime(),
                    });

                    this.$el.html(tmpl);

                    var selectBoxArr = ['failCount', 'changePeriod'];
                    $.each(selectBoxArr, function (k, v) {
                        self.$el.find('#' + v).val(self.model.get(v));
                    });
                    if (!self.model.get('useSystemPasswordRules')) {
                        /* 비밀번호 규칙 설정 기본값이 사이트 별 설정 일 경우 */
                        if (!self.model.get('tabooCharSame')) {
                            $('span#sameCharLength').hide();
                        }
                        if (!self.model.get('tabooCharSerial')) {
                            $('span#serialCharLength').hide();
                        }
                        if (!self.model.get('tabooCharInput')) {
                            $('span#inputChar').hide();
                        }
                        if (!self.model.get("useCaptcha")) {
                            $('select[name="failCount"]').attr("disabled", true);
                        } else {
                            $('select[name="failCount"]').attr("disabled", false);
                        }
                        if (!self.model.get("usePasswordConfig")) {
                            this.usePasswordConfigFalse();
                        } else {
                            this.usePasswordConfigTrue();
                        }

                        this.renderReuse();
                    } else {
                        /* 비밀번호 규칙 설정 기본값이 시스템 별 설정 일 경우 */
                        self.$el.find('#mandatory_value').text(this.getMandatoryValueForSystem());
                        self.$el.find('#taboo_value').text(this.getTabooValueForSystem());
                        if (!self.model.get("usePasswordConfig")) {
                            $('select[name="changePeriod"]').attr("disabled", true);
                            $('input[name="passwordForcedChange"]').attr("disabled", true);
                        } else {
                            $('select[name="changePeriod"]').attr("disabled", false);
                            $('input[name="passwordForcedChange"]').attr("disabled", false);
                        }
                    }

                    return this;
                },

                getMandatoryValueForSystem: function () {
                    var mandatoryValues = [];
                    if (this.model.get("mandatoryCharNumber"))
                        mandatoryValues.push({label: adminLang["숫자"], value: this.model.get("mandatoryCharNumber")});
                    if (this.model.get("mandatoryCharBlank"))
                        mandatoryValues.push({label: adminLang["공백"], value: this.model.get("mandatoryCharBlank")});
                    if (this.model.get("mandatoryCharAlphabet"))
                        mandatoryValues.push({label: adminLang["문자"], value: this.model.get("mandatoryCharAlphabet")});
                    if (this.model.get("mandatoryCharSymbol"))
                        mandatoryValues.push({label: adminLang["특수문자"], value: this.model.get("mandatoryCharSymbol")});

                    return _.map(mandatoryValues, function (data) {
                        return data.label;
                    }).join(', ');
                },

                getTabooValueForSystem: function () {
                    var tabooValues = [];
                    if (this.model.get("tabooCharName"))
                        tabooValues.push({label: commonLang["이름"], value: this.model.get("tabooCharName")});
                    if (this.model.get("tabooCharId"))
                        tabooValues.push({label: adminLang["아이디"], value: this.model.get("tabooCharId")});
                    if (this.model.get("tabooCharSame"))
                        tabooValues.push({
                            label: adminLang["동일문자"],
                            value: this.model.get("tabooCharSame"),
                            length: this.model.get("sameCharLength")
                        });
                    if (this.model.get("tabooCharSerial"))
                        tabooValues.push({
                            label: adminLang["연속문자"],
                            value: this.model.get("tabooCharSerial"),
                            length: this.model.get("serialCharLength")
                        });
                    if (this.model.get("tabooCharInput"))
                        tabooValues.push({
                            label: adminLang["직접입력"],
                            value: this.model.get("tabooCharInput"),
                            inputChar: this.model.get("inputChar")
                        });

                    return _.map(tabooValues, function (data) {
                        if (data.label === adminLang["동일문자"] || data.label === adminLang["연속문자"]) {
                            return data.label + " " + data.length + adminLang["개 이상"];
                        } else if (data.label === adminLang["직접입력"]) {
                            return data.label + "(" + data.inputChar + ")";
                        }
                        return data.label;
                    }).join(', ');
                },

                formSubmit: function (e) {
                    e.stopPropagation();
                    return;
                },

                getLastChangeTime: function () {
                    var str = this.model.toJSON().pwdForcedChangeAll;
                    if (str == undefined || str == "") {
                        return commonLang["없음"];
                    }
                    return str.substring(0, str.lastIndexOf(':'));
                },

                renderReuse: function () {
                    if (!this.model.get("passwordReuse")) this.$('#limitPasswordReuseCount').val(this.model.get("limitPasswordReuseCount"));
                },


                toggleReuse: function (e) {
                    e.stopPropagation();

                    var display = !GO.util.toBoolean($(e.currentTarget).val());
                    this.$('#limitPasswordReuseCount').toggle(display);
                },


                keyupValidator: function (e) {
                    e.stopPropagation();

                    var targetId = e.currentTarget.id;
                    var targetEl = $(e.currentTarget).parent();
                    var validateEl = targetEl.parent().parent().find('.go_alert');
                    validateEl.html('');
                    if (targetId != 'inputChar') {
                        if (e.keyCode >= 96 && e.keyCode <= 105 || e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode == 46 || e.keyCode == 13 || e.keyCode == 8) {
                        } else {
                            validateEl.html(adminLang["숫자만 입력하세요."]);
                            e.currentTarget.value = '';
                            return false;
                        }
                    }
                },
                inputValidator: function (e) {
                    e.stopPropagation();

                    var targetValue = e.currentTarget.value,
                        targetId = e.currentTarget.id,
                        targetEl = $(e.currentTarget).parent();
                    var sameChar = $('input#tabooCharSame').is(":checked"),
                        serialChar = $('input#tabooCharSerial').is(":checked"),
                        serialInput = $('input#tabooCharInput').is(":checked");
                    var validateEl = targetEl.parent().parent().find('.go_alert');
                    validateEl.html('');
                    if (targetId == 'minPasswordLength') {
                        var maxLength = $('div.maxPasswordLength').children().attr('data-value');
                        if (targetValue < 8 || targetValue > 15) {
                            validateEl.html(App.i18n(tmplVal['label_alert'], {"arg1": "8", "arg2": "15"}));
                            e.currentTarget.focus();
                            e.currentTarget.value = '';
                            return false;
                        } else if (parseInt(targetValue) >= parseInt(maxLength)) {
                            validateEl.html(adminLang['최대값보다 큰경우 경고']);
                            e.currentTarget.focus();
                            e.currentTarget.value = '';
                            return false;
                        } else {
                            targetEl.attr('data-value', targetValue);
                        }
                    }
                    if (targetId == 'maxPasswordLength') {
                        var minLength = $('div.minPasswordLength').children().attr('data-value');
                        if (targetValue < 9 || targetValue > 16) {
                            validateEl.html(App.i18n(tmplVal['label_alert'], {"arg1": "9", "arg2": "16"}));
                            e.currentTarget.focus();
                            e.currentTarget.value = '';
                            return false;
                        } else if (parseInt(targetValue) <= parseInt(minLength)) {
                            validateEl.html(adminLang['최소값보다 작은경우 경고']);
                            e.currentTarget.focus();
                            e.currentTarget.value = '';
                            return false;
                        } else {
                            targetEl.attr('data-value', targetValue);
                        }
                    }
                    if ((sameChar && targetId == 'sameCharLength') || (serialChar && targetId == 'serialCharLength')) {
                        if (targetValue < 3 || targetValue > 6) {
                            validateEl.html(App.i18n(tmplVal['label_alert'], {"arg1": "3", "arg2": "6"}));
                            e.currentTarget.focus();
                            e.currentTarget.value = '';
                            return false;
                        }
                    }
                    if (serialInput && targetId == 'inputChar') {
                        if (!$.goValidation.isCheckLength(0, 100, targetValue)) {
                            validateEl.html(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1": "1", "arg2": "100"}));
                            e.currentTarget.focus();
                            e.currentTarget.value = '';
                            return false;
                        }
                    }
                    if (targetId == 'resetPassword') {
                        if (targetValue.length == 0) {
                            return;
                        }
                        if (!$.goValidation.isCheckLength(4, 16, targetValue)) {
                            validateEl.html(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1": "4", "arg2": "16"}));
                            e.currentTarget.focus();
                            e.currentTarget.value = '';
                            return false;
                        }
                    }
                },
                changeModifyForm: function (e) {
                    e.stopPropagation();

                    var targetEl = $(e.currentTarget).parent();

                    targetEl.children().toggle();
                    targetEl.find('input').focus();
                },
                makeOriginalInputData: function () {
                    $('input[id="minPasswordLength"]').val(this.model.get("minPasswordLength"));
                    $('[data-formname = "minPasswordLength"]').attr('data-value', this.model.get("minPasswordLength"));
                    $('input[id="maxPasswordLength"]').val(this.model.get("maxPasswordLength"));
                    $('[data-formname = "maxPasswordLength"]').attr('data-value', this.model.get("maxPasswordLength"));

                    $('textarea[id="inputChar"]').val(this.model.get("inputChar"));
                    $('[data-formname = "inputChar"]').attr('data-value', this.model.get("inputChar"));
                    $('input[id="sameCharLength"]').val(this.model.get("sameCharLength"));
                    $('[data-formname = "sameCharLength"]').attr('data-value', this.model.get("sameCharLength"));
                    $('input[id="serialCharLength"]').val(this.model.get("serialCharLength"));
                    $('[data-formname = "serialCharLength"]').attr('data-value', this.model.get("serialCharLength"));
                },
                usePasswordConfigTrue: function () {
                    $('.minPasswordLength').attr("style", "");
                    $('.maxPasswordLength').attr("style", "");
                    if ($('#tabooCharInput').is(':checked')) {
                        $('span#inputChar').attr("style", "");
                    }
                    if ($('#tabooCharSame').is(':checked')) {
                        $('span#sameCharLength').attr("style", "");
                    }
                    if ($('#tabooCharSerial').is(':checked')) {
                        $('span#serialCharLength').attr("style", "");
                    }
                    $('textarea').attr("style", "");
                    $('select[name="changePeriod"]').attr("disabled", false);
                    $('#tabooCharInput').attr("disabled", false);
                    $('#tabooCharSerial').attr("disabled", false);
                    $('#tabooCharSame').attr("disabled", false);
                    $('#tabooCharName').attr("disabled", false);
                    $('#tabooCharId').attr("disabled", false);
                    $('#mandatoryCharNumber').attr("disabled", false);
                    $('#mandatoryCharBlank').attr("disabled", false);
                    $('#mandatoryCharAlphabet').attr("disabled", false);
                    $('#mandatoryCharSymbol').attr("disabled", false);
                    $('input[name="passwordReuse"]').attr("disabled", false);
                    $('input[name="passwordForcedChange"]').attr("disabled", false);

                    $.each($('#first_tr').siblings(), function (k, v) {
                        $(v).attr("style", "");
                        $('#first_tr').removeClass("last");
                    });
                },
                usePasswordConfigFalse: function () {
                    $('.minPasswordLength').attr("style", "display:none");
                    $('.maxPasswordLength').attr("style", "display:none");
                    $('span#inputChar').attr("style", "display:none");
                    $('span#sameCharLength').attr("style", "display:none");
                    $('span#serialCharLength').attr("style", "display:none");
                    $('textarea').attr("style", "display:none");
                    $('select[name="changePeriod"]').attr("disabled", true);
                    $('#tabooCharInput').attr("disabled", true);
                    $('#tabooCharSerial').attr("disabled", true);
                    $('#tabooCharSame').attr("disabled", true);
                    $('#tabooCharName').attr("disabled", true);
                    $('#tabooCharId').attr("disabled", true);
                    $('#mandatoryCharNumber').attr("disabled", true);
                    $('#mandatoryCharBlank').attr("disabled", true);
                    $('#mandatoryCharAlphabet').attr("disabled", true);
                    $('#mandatoryCharSymbol').attr("disabled", true);
                    $('input[name="passwordReuse"]').attr("disabled", true);
                    $('input[name="passwordForcedChange"]').attr("disabled", true);

                    $.each($('#first_tr').siblings(), function (k, v) {
                        $(v).attr("style", "display:none");
                        $('#first_tr').addClass("last");
                    });
                },
                toggleRadio: function (e) {
                    e.stopPropagation();

                    if ($(e.currentTarget).attr('value') == "true" && $(e.currentTarget).attr('name') == "useCaptcha") {
                        $('select[name="failCount"]').attr("disabled", false);
                    } else if ($(e.currentTarget).attr('value') == "false" && $(e.currentTarget).attr('name') == "useCaptcha") {
                        $('select[name="failCount"]').attr("disabled", true);
                    } else if ($(e.currentTarget).attr('value') == "true" && $(e.currentTarget).attr('name') == "usePasswordConfig") {
                        this.usePasswordConfigTrue();
                    } else if ($(e.currentTarget).attr('value') == "false" && $(e.currentTarget).attr('name') == "usePasswordConfig") {
                        this.usePasswordConfigFalse();
                        this.makeOriginalInputData();
                        $.goAlert(adminLang['비밀번호 관리를 사용하지 않는 경우, 보안에 취약할 수 있습니다.'], "", "", commonLang["확인"]);
                    }
                },
                toggleCheckbox: function (e) {
                    e.stopPropagation();

                    if ($(e.currentTarget).is(':checked')) {
                        $(e.currentTarget).val(true);
                        $(e.currentTarget).attr('checked', true);
                        if ($(e.currentTarget).is(':checkbox[name="tabooCharSame"]')) {
                            $('span#sameCharLength').show();
                        } else if ($(e.currentTarget).is(':checkbox[name="tabooCharSerial"]')) {
                            $('span#serialCharLength').show();
                        } else if ($(e.currentTarget).is(':checkbox[name="tabooCharInput"]')) {
                            $('span#inputChar').show();
                        }
                    } else {
                        $(e.currentTarget).val(false);
                        $(e.currentTarget).attr('checked', false);
                        if ($(e.currentTarget).is(':checkbox[name="tabooCharSame"]')) {
                            $('span#sameCharLength').hide();
                        } else if ($(e.currentTarget).is(':checkbox[name="tabooCharSerial"]')) {
                            $('span#serialCharLength').hide();
                        } else if ($(e.currentTarget).is(':checkbox[name="tabooCharInput"]')) {
                            $('span#inputChar').hide();
                        }
                    }
                },

                passwordConfigSave: function () {
                    var self = this;
                    var form = this.$el.find('form[name=formPaswordConfig]');

                    // form data serialize
                    $.each(form.serializeArray(), function (k, v) {
                        self.model.set(v.name, v.value, {silent: true});
                    });

                    // value가 false인 checkbox 처리
                    $.each($(form.find('input[type="checkbox"]'))
                        .filter(function (idx) {
                            return $(this).prop('checked') === false;
                        }), function (idx, el) {
                        self.model.set(el.name, el.value, {silent: true});
                    });

                    GO.util.preloader(this.model.save({}, {
                        success: function (model, response) {
                            if (response.code == '200') {
                                $.goMessage(commonLang["저장되었습니다."]);
                                self.render();
                            }
                        }, error: function (model, response) {
                            var responseData = JSON.parse(response.responseText);
                            $.goAlert(commonLang["실패"], responseData.message);
                        }
                    }));
                },

                passwordConfigCancel: function (e) {
                    e.stopPropagation();

                    var self = this;
                    $.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function () {
                        self.render();
                        $.goMessage(commonLang["취소되었습니다."]);
                    }, commonLang["확인"]);
                },

                confirmSave: function (e) {
                    e.stopPropagation();

                    if (!this.model.get('useSystemPasswordRules')) {
                        /* 비밀번호 규칙 설정 기본값이 사이트 별 설정 일 경우 */
                        if ($('#usePasswordConfig_false').is(":checked")) {
                            this.passwordConfigSave();
                            return;
                        }
                        var self = this;
                        var mandatoryNumber = $('#mandatoryCharNumber').is(":checked") ? true : false,
                            mandatoryBlank = $('#mandatoryCharBlank').is(":checked") ? true : false,
                            mandatoryAlphabet = $('#mandatoryCharAlphabet').is(":checked") ? true : false,
                            mandatorySymbol = $('#mandatoryCharSymbol').is(":checked") ? true : false,

                            sameChar = $('#tabooCharSame').is(":checked") ? true : false,
                            serialChar = $('#tabooCharSerial').is(":checked") ? true : false,
                            serialInput = $('#tabooCharInput').is(":checked") ? true : false,
                            name = $('#tabooCharName').is(":checked") ? true : false,
                            id = $('#tabooCharId').is(":checked") ? true : false;

                        // 사용금지 문자 > 직접입력 > 금지문자 입력여부 check
                        var inputCharEl = $('textarea[name="inputChar"]');
                        if (serialInput && inputCharEl.length > 0) {
                            var inputVal = $.trim(inputCharEl.val());
                            if (_.isEmpty(inputVal)) {
                                $.goMessage(adminLang["제한 값을 입력하세요."]);
                                inputCharEl.focus();
                                return false;
                            }
                        }

                        if (mandatoryNumber || mandatoryBlank || mandatoryAlphabet || mandatorySymbol || sameChar || serialChar || serialInput || name || id) {
                            this.passwordConfigSave();
                        } else {
                            $.goConfirm(adminLang['필수포함 문자 또는 사용금지 문자를 설정하지 않으면 보안에 취약할 수 있습니다.'] + "<br>" + adminLang['저장하시겠습니까?'], "", function () {
                                self.passwordConfigSave();
                            }, commonLang['확인'], function () {
                            });
                        }

                    } else {
                        /* 비밀번호 규칙 설정 기본값이 시스템 별 설정 일 경우 */
                        this.passwordConfigSave();
                    }
                },

                pwdForceResetting: function (e) {
                    e.stopPropagation();

                    var confirm = $.goConfirm(adminLang['전체 사용자의 비밀번호를 재설정하게 확인'], "", function () {
                        $.ajax({
                            type: "GET",
                            dataType: "json",
                            url: GO.contextRoot + "ad/api/passwordconfig/pwdforcedall",
                            success: function (resp) {
                                $.goMessage(commonLang["저장되었습니다."]);
                                var lastChangeTime = resp.data.pwdForcedChangeAll;
                                $('#lastChangeTime').text(lastChangeTime.substring(0, lastChangeTime.lastIndexOf(':')));
                            },
                            error: function (resp) {
                                $.goError(resp.responseJSON.message);
                            }
                        });
                    }, commonLang['확인']);
                    confirm.css("width", "440px");
                }
            });

            return PasswordConfig;
        });
}).call(this);