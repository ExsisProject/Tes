(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "hgn!system/templates/extension_function",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "jquery.go-grid",
            "jquery.go-sdk",
            "GO.util",
        ],

        function ($,
                  Backbone,
                  App,
                  extensionFunctionTmpl,
                  commonLang,
                  adminLang) {

            var tmplVal = {
                'label_extension_function': adminLang["확장 기능 관리"],
                'label_ok': commonLang['저장'],
                'label_cancel': commonLang['취소'],
                'label_title': adminLang['기본 설정'],
                'label_cert_login': adminLang['공인인증서 로그인'],
                'label_use': adminLang['사용함'],
                'label_unuse': commonLang['사용하지 않음'],
                'label_editor_custom_config': adminLang['에디터 커스텀설정'],
                'label_mail_exposure_desc': "사용시, 내부 임직원 이름과 메일주소가 함께 노출됩니다. 사용하지 않으면 이름만 노출됩니다.",
                'label_sms': adminLang['문자발송'],
                'label_attach_shared_storage': adminLang['첨부파일 공유 스토리지 사용 여부'],
                'label_drm': "DRM",
                'label_allow_agreement_config': "부서합의 상세 옵션",
                'label_allow_agreement_config_desc': "부서합의에 대한 상세 옵션입니다. 부서장만 합의 가능 / 부서장, 부부서장만 합의 가능 / 부서원전체 합의 가능으로 나뉩니다.",
                'label_task_config': "업무",
                'label_task_config_desc': '업무 기능에 대한 노출여부 옵션입니다. "사용함" 으로 체크할 경우 도메인/사이트관리 - 사이트 - 제공서비스 에 "업무" 앱이 노출됩니다.',
                'label_note_config': "쪽지",
                'label_note_config_desc': '쪽지 기능에 대한 사용여부 옵션입니다. "사용함" 으로 체크할 경우 전체 사이트에서 쪽지를 사용할 수 있습니다. 특정 사이트에서 OFF하려는 경우, 사이트 설정의 "일반>기능 관리>쪽지" 에서 사용권한을 OFF로 설정하세요. ',
                'label_store_config': 'Link+',
                'label_file_upload_type': '파일 업로드 타입',
                'label_otp_in_admin': adminLang['관리자 페이지에서 OTP 사용'],
                'label_allow_duplicate_empNo': adminLang['중복사번 허용'],
                'label_allow_duplicate_empNo_toolTip': adminLang['중복사번 허용 툴팁'],
                'label_stop_no_used_admin': adminLang['장기 미접속 시스템 관리자 중지 여부'],
                'label_stop_no_used_admin_toolTip': adminLang['장기 미접속 시스템 관리자 중지 여부 툴팁']
            };

            var extensionFunction = Backbone.View.extend({
                events: {
                    "click #btn_extension_ok": "saveExtensionConfig",
                    "click span.btn_box[data-btntype='changeCustomEditorName']": "changeCustomEditorName",
                    "click span.edit_data": "changeCustomEditorName"
                },

                initialize: function () {
                    this.model = null;
                },

                render: function () {
                    var self = this;
                    var deferred = $.Deferred();

                    $.when(this.getExtensionConfig()).then(function () {
                        $('.breadcrumb .path').html(adminLang["확장 기능 관리"]);
                        self.$el.html(extensionFunctionTmpl({
                            lang: tmplVal,
                            useCert: function () {
                                if (self.model.certConfig == "on") {
                                    return true;
                                }
                                return false;
                            },
                            useTask: function () {
                                if (self.model.taskConfig == "on") {
                                    return true;
                                }
                                return false;
                            },
                            useNote: function () {
                                if (self.model.useNote == "on") {
                                    return true;
                                }
                                return false;
                            },
                            useSms: function () {
                                if (self.model.smsConfig == "on") {
                                    return true;
                                }
                                return false;
                            },
                            useAttachSharedStorage: function () {
                                if (self.model.attachSharedStorage == "on") {
                                    return true;
                                }
                                return false;
                            },
                            useActiveDesigner: function () {
                                return self.model.useActiveDesigner;
                            },
                            customEditorName: function () {
                                return self.model.customEditorName;
                            },
                            hasDrmImpl: function () {
                                return self.model.hasDrmImpl;
                            },
                            useDrm: function () {
                                if (self.model.drmConfig == "on") {
                                    return true;
                                }
                                return false;
                            },
                            useAgreementAllow: function () {
                                if (self.model.agreementAllowOption == "on") {
                                    return true;
                                }
                                return false;
                            },
                            useStoreConfig: function () {
                                if (self.model.storeConfig == 'on') {
                                    return true;
                                }
                                return false;
                            },
                            useOtpInAdmin: function () {
                                if (self.model.otpInAdmin == 'on') {
                                    return true;
                                }
                                return false;
                            },
                            stopNoUsedSystemAdmin: function () {
                                if (self.model.stopNoUsedSystemAdmin == 'on') {
                                    return true;
                                }
                                return false;
                            },
                            allowDuplicateEmpNum: function () {
                                if (self.model.allowDuplicateEmpNum == 'on') {
                                    return true;
                                }
                                return false;
                            }
                        }));

                        deferred.resolveWith(self, [self]);
                    });

                    return deferred;
                },
                changeCustomEditorName: function (e) {
                    var targetEl = $(e.currentTarget).parent();
                    if (targetEl && targetEl.attr('data-formname')) {
                        $(e.currentTarget).hide();
                        targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '" class="input w_mini" value="', targetEl.attr('data-value'), '" />'].join(''))
                            .find('input').focusin();
                    }
                },
                getCertConfig: function () {
                    var self = this;
                    var deferred = $.Deferred();
                    var url = GO.contextRoot + "ad/api/system/certconfig";

                    $.go(url, '', {
                        qryType: 'GET',
                        responseFn: function (response) {
                            if (response.code == 200) {
                                self.model = response.data;
                                deferred.resolve();
                            }
                        },
                        error: function (response) {

                        }
                    });
                    return deferred;
                },
                getExtensionConfig: function () {
                    var self = this;
                    var deferred = $.Deferred();
                    var url = GO.contextRoot + "ad/api/system/extensionconfig";

                    $.go(url, '', {
                        qryType: 'GET',
                        responseFn: function (response) {
                            if (response.code == 200) {
                                self.model = response.data;
                                deferred.resolve();
                            }
                        },
                        error: function (response) {

                        }
                    });
                    return deferred;
                },
                saveExtensionConfig: function () {
                    var self = this;
                    var deferred = $.Deferred();
                    var url = GO.contextRoot + "ad/api/system/extensionconfig";

                    var param = {};
                    param["certConfig"] = $('input[name="useCert"]:checked').val();
                    param["taskConfig"] = $('input[name="useTask"]:checked').val();
                    param["useNote"] = $('input[name="useNote"]:checked').val();
                    param["smsConfig"] = $('input[name="useSms"]:checked').val();
                    param["agreementAllowOption"] = $('input[name="useAgreementAllow"]:checked').val();
                    param["drmConfig"] = $('input[name="useDrm"]:checked').val();
                    param["customEditorName"] = $('[name="customEditorName"]').val() == undefined ? $('[data-formname="customEditorName"]').attr('data-value') : $('[name="customEditorName"]').val();
                    param["attachSharedStorage"] = $('input[name="useAttachSharedStorage"]:checked').val();
                    param["storeConfig"] = $('input[name="useStoreConfig"]:checked').val();
                    param["otpInAdmin"] = $('input[name="useOtpInAdmin"]:checked').val();
                    param["allowDuplicateEmpNum"] = $('input[name="allowDuplicateEmpNum"]:checked').val();
                    param["stopNoUsedSystemAdmin"] = $('input[name="stopNoUsedSystemAdmin"]:checked').val();

                    $.go(url, JSON.stringify(param), {
                        qryType: 'PUT',
                        contentType: 'application/json',
                        responseFn: function (response) {
                            if (response.code == 200) {
                                $.goMessage(commonLang["저장되었습니다."]);
                                self.model = response.data;
                                deferred.resolve();
                            }
                        },
                        error: function (response) {
                            var responseData = JSON.parse(response.responseText);
                            $.goMessage(responseData.message);
                        }
                    });
                    return deferred;
                }
            }, {
                __instance__: null
            });

            return extensionFunction;
        });
}).call(this);
