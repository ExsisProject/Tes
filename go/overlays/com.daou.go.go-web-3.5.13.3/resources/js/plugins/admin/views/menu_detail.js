define("admin/views/menu_detail", function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");
    var MenuDetailTpl = require("hgn!admin/templates/menu_detail");
    var CircleView = require("views/circle");
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    require("jquery.go-orgslide");
    require("jquery.go-sdk");
    require("jquery.go-validation");
    require("jquery.go-popup");

    var lang = {
        label_ok: commonLang["저장"],
        label_cancel: commonLang["취소"],
        label_base: adminLang["기본 정보"],
        label_name: adminLang["메뉴명"],
        label_url: adminLang["메뉴 URL 주소"],
        label_ko: adminLang["KO"],
        label_en: adminLang["EN"],
        label_jp: adminLang["JP"],
        label_zhcn: adminLang["ZH-CN"],
        label_zhtw: adminLang["ZH-TW"],
        label_vi: adminLang["VI"],
        label_linkMenu_mobile_desc: adminLang["새 링크 모바일 앱 이용 주의 문구"],
        label_location_desc: adminLang["메뉴위치경고"],
        label_info_add: adminLang["메뉴명 언어항목 추가"],
        label_info_add_select: adminLang["추가할 항목을 선택하세요."],
        label_iframe: adminLang["현재 보고 있는 페이지에 iframe 으로 화면이 표시됩니다."],
        label_self: adminLang["현재 보고 있는 페이지에서 화면이 표시됩니다."],
        label_new: adminLang["새창이 떠서 화면이 표시됩니다."],
        label_has_submenu: adminLang["하위 메뉴가 있습니다."],
        label_comfirm_has_submenu: adminLang["해당 메뉴를 삭제하려면, 먼저 하위 메뉴를 삭제하시길 바랍니다."],
        label_modify_has_submenu: adminLang["해당 메뉴를 수정하려면, 먼저 하위 메뉴를 삭제하시길 바랍니다."],
        label_location: adminLang["메뉴화면표시"],
        label_status: adminLang["메뉴 활성화 여부"],
        use: commonLang["사용"],
        not_use: commonLang["사용하지 않음"],
        use_label: adminLang["사용여부"],
        add_org_access_deny: adminLang["접근제한 클래스 추가"],
        label_modify: commonLang["수정"],
        label_remove: commonLang["삭제"],
        label_validate: adminLang['0자이상 0이하 입력해야합니다.'],
        label_access: adminLang['메뉴 접근 설정'],
        label_white: adminLang['공개'],
        label_black: adminLang['비공개'],
        label_policy: adminLang['정책 설정'],
        label_addAccessDenyClass: adminLang['설정'],
        label_addAccessAllowedClass: adminLang['접근 허용 클래스 추가'],
        label_selectClass: adminLang['클래스 선택'],
        label_addExceptionClass: adminLang['예외 클래스 추가'],
        "Web(PC,모바일)": adminLang['Web(PC,모바일)'],
        "WEB 정책 툴팁": adminLang['WEB 정책 툴팁'],
        "모바일앱 정책 툴팁": adminLang['모바일앱 정책 툴팁'],
        "자료실 정책 툴팁": adminLang['자료실 정책 툴팁'],
        "모바일 앱": adminLang['모바일 앱'],
        "모바일 메뉴 권한 안내": adminLang["모바일 메뉴 권한 안내"],
        "디바이스 별 권한 설정": adminLang["디바이스 별 권한 설정"],
        "모든기기": adminLang["모든기기"],
        "WEB / 모바일 앱 구분": adminLang["WEB / 모바일 앱 구분"]
    };

    var MenuDetail = Backbone.View.extend({
        webAccessTarget: null,
        mobileAccessTarget: null,
        mobileAccessTarget: null,
        mobileExceptionTarget: null,

        className: "col2",

        initialize: function (options) {
            this.installInfo = options.installInfo;
            this.model = options.model;
            this.menuId = options.menuId;
        },

        events: {
            "click #submit": "submit",
            "click #cancel": "cancel",
            "change #selectAccessPolicy input:radio": "changeAccessSetting",
            "keyup input[name$='Name']": "nameValidate",
            "keyup input[name='url']": "urlValidate",
            "keydown input": "prevent",
            "click span.btn_box[data-btntype='changePopupName']": "modifyName",
            "click span.btn_box[data-btntype='changePopupUrl']": "changeModifyUrl",
            "click span#data[data-type='changePopupName']": "changeModifyName",
            "click span#data[data-type='changePopupUrl']": "changeModifyUrl",
            "change #moreName": "addMoreName",
            "change #accessDeviceOption input:radio": "changeAccessDeviceOption"
        },


        render: function () {
            this.$el.html(MenuDetailTpl({
                lang: lang,
                model: this.model.toJSON(),
                isKoLocale: this.installInfo.isKoLocale(),
                isEnLocale: this.installInfo.isEnLocale(),
                isJpLocale: this.installInfo.isJpLocale(),
                isZhcnLocale: this.installInfo.isZhcnLocale(),
                isZhtwLocale: this.installInfo.isZhtwLocale(),
                isViLocale: this.installInfo.isViLocale(),
                isAccessDeviceOptionAll: this.model.isAccessDeviceOptionAll(),
                isRequireMobileAccess: this.model.isRequireMobileAccess() && this.model.toJSON().appName !== "webfolder",
                isWebFolderMenu: this.model.toJSON().appName === "webfolder"
            }));

            this.setModifyMenuData(this.model.toJSON());

            var $pcDevice = this.$el.find("#pc_device");
            var $mobileDevice = this.$el.find("#mobile_device");

            if (!this.model.isNew()) {
                var location = this.model.get("location");
                var status = this.model.get("status");
                var subMenuType = this.model.get("subMenuType");
                this.$('input[name="location"][value="' + location.toLowerCase() + '"]').attr('checked', true);
                this.$('input[name="status"][value="' + status.toLowerCase() + '"]').attr('checked', true);

                this.$('input[name="subMenuType"][value="' + subMenuType + '"]').attr('checked', true);
                this.$('select[name="parentId"] option[value="' + this.menuId + '"]').hide();
                var webAccessSetting = this.model.get("webAccessSetting");
                var mobileAccessSetting = this.model.get("mobileAccessSetting");
                var $accessDeviceOption = this.$el.find("#accessDeviceOption");
                var accessDeviceOption = this.model.get("accessDeviceOption");
                toggleAccessLabel(webAccessSetting, $pcDevice);
                toggleAccessLabel(mobileAccessSetting, $mobileDevice);
                $pcDevice.find('input[name="webAccessSetting"][value="' + webAccessSetting + '"]').attr('checked', true);
                $mobileDevice.find('input[name="mobileAccessSetting"][value="' + mobileAccessSetting + '"]').attr('checked', true);
                $accessDeviceOption.find("input[name='accessDeviceOption'][value='" + accessDeviceOption + "']").attr('checked', true);
            } else {
                this.$("#self").attr('checked', true);
                $pcDevice.find("[name='webAccessSetting'][value='black']").attr('checked', true);
                $mobileDevice.find("[name='mobileAccessSetting'][value='black']").attr('checked', true);
                $mobileDevice.hide();
            }

            $("span.btn[data-btntype='submit']").attr('data-locale', this.installInfo.getLocale());

            var isOrgUse = GO.util.isUseOrgService(true);
            this.webAccessTarget = this.renderCricleView("#webAccessTarget", this.model.get("webAccessTarget"), isOrgUse);
            this.webExceptionTarget = this.renderCricleView("#webExceptionTarget", this.model.get("webExceptionTarget"), isOrgUse);
            this.mobileAccessTarget = this.renderCricleView("#mobileAccessTarget", this.model.get("mobileAccessTarget"), isOrgUse);
            this.mobileExceptionTarget = this.renderCricleView("#mobileExceptionTarget", this.model.get("mobileExceptionTarget"), isOrgUse);
        },

        changeAccessDeviceOption: function (e) {
            var $currentTarget = $(e.currentTarget);
            var option = $currentTarget.val();
            var callbcak = {
                "ALL": hideMobileAccess,
                "DIVIDE": showMobileAccess
            };

            callbcak[option].call(this);

            function hideMobileAccess() {
                this.$el.find("#mobile_device").hide();
                this.$el.find("#access_web_label").hide();
            }

            function showMobileAccess() {
                this.$el.find("#mobile_device").show();
                this.$el.find("#access_web_label").show();
            }
        },

        submit: function () {
            var self = this;

            $.each(this.$("form").serializeArray(), function (k, v) {
                validateMenuNameLength.call(self, v.name, v.value);
                self.model.set(v.name, v.value, {silent: true});
            });

            this.model.set('accessDeviceOption', this.$el.find("#accessDeviceOption :radio[name='accessDeviceOption']:checked").val());
            this.model.set('webAccessSetting', this.$el.find("#pc_device :radio[name='webAccessSetting']:checked").val());
            this.model.set('mobileAccessSetting', this.$el.find("#mobile_device :radio[name='mobileAccessSetting']:checked").val());

            this.model.set('webAccessTarget', this.webAccessTarget.getData());
            this.model.set('webExceptionTarget', this.webExceptionTarget.getData());
            this.model.set('mobileAccessTarget', this.mobileAccessTarget.getData());
            this.model.set('mobileExceptionTarget', this.mobileExceptionTarget.getData());

            GO.util.preloader(self.model.save({}, {
                success: function (model, response) {
                    if (response.code == '200') {
                        $.goMessage(commonLang["저장되었습니다."]);
                    }
                    self.render();
                    self.$el.trigger("change:menu", model);
                },
                error: function (model, response) {
                    var responseData = JSON.parse(response.responseText);
                    if (responseData != null) {
                        $.goAlert(commonLang["오류"], responseData.message);
                    } else {
                        $.goMessage(commonLang["실패했습니다."]);
                    }
                }
            }));

            function validateMenuNameLength(name, value) {
                if (name.indexOf("Name") < 0) {
                    return;
                }

                var companyLocale = this.installInfo.getLocale();
                var MAX_LENGTH = 16;
                var MIN_LENGTH = isInstallLocale(name) ? 1 : 0;

                var validateEl = $('#' + name + 'Validate');

                if (!$.goValidation.isCheckLength(MIN_LENGTH, MAX_LENGTH, value)) {
                    validateEl.html(App.i18n(lang['label_validate'], {"arg1": MIN_LENGTH, "arg2": MAX_LENGTH}));
                    $("#" + name).focus();
                    throw new Error(App.i18n(lang['label_validate'], {"arg1": MIN_LENGTH, "arg2": MAX_LENGTH}));
                } else {
                    validateEl.empty();
                }

                function isInstallLocale(value) {
                    if (value.indexOf(companyLocale) >= 0) {
                        return true;
                    }

                    return false;
                }
            }
        },

        cancel: function () {
            this.render();
        },

        addMoreName: function (e) {
            $("[data-id=\"" + e.target.value + "Input\"]").show();
            $(e.target).find(":selected").remove();
            if ($('#moreName option').size() == 1) {
                $('[data-id="addMenuName"]').hide();
            }
        },

        modifyName: function (e) {
            var targetEl = $(e.currentTarget).parent(),
                essential = $(e.currentTarget).attr('data-locale'),
                essentialName = essential != undefined ? essential + 'Name' : '';

            if (targetEl && targetEl.attr('data-formname')) {
                $(e.currentTarget).hide();
                targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '" class="input w_full" value="', targetEl.attr('data-value'), '" />'].join(''))
                    .find('input').focusin();

                var validateEl = targetEl.parent().find('#' + targetEl.attr('data-formname') + 'Validate');
                targetEl.find('input').keyup(function (e) {

                    if (targetEl.attr('data-formname') == essentialName && !$.goValidation.isCheckLength(1, 16, $(e.currentTarget).val())) {
                        validateEl.html(App.i18n(lang['label_validate'], {"arg1": "1", "arg2": "16"}));
                    } else if (targetEl.attr('data-formname') != essentialName && $(e.currentTarget).val().length > 0 && (!$.goValidation.isCheckLength(1, 16, $(e.currentTarget).val()))) {
                        validateEl.html(App.i18n(lang['label_validate'], {"arg1": "1", "arg2": "16"}));
                    } else {
                        validateEl.empty();
                    }
                });
            }
        },


        changeModifyUrl: function (e) {
            var targetEl = $(e.currentTarget).parent();
            if (targetEl && targetEl.attr('data-formname')) {
                $(e.currentTarget).hide();
                targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '" class="input w_full" value="', targetEl.attr('data-value'), '" />'].join(''))
                    .find('input').focusin();

                var validateEl = targetEl.parent().find('#' + targetEl.attr('data-formname') + 'Validate');
                targetEl.find('input').keyup(function (e) {
                    if (!$.goValidation.isCheckLength(1, 128, $(e.currentTarget).val())) {
                        validateEl.html(App.i18n(lang['label_validate'], {"arg1": "1", "arg2": "128"}));
                    } else {
                        validateEl.empty();
                    }
                });
            }
        },


        urlValidate: function (e) {
            var urlValidateEl = $('#urlValidate');
            if (!$.goValidation.isCheckLength(1, 255, $(e.currentTarget).val())) {
                urlValidateEl.html(App.i18n(lang['label_validate'], {"arg1": "1", "arg2": "255"}));
            } else {
                urlValidateEl.empty();
            }
        },


        nameValidate: function (e) {
            var essential = $(e.currentTarget).attr('data-locale'),
                essentialName = essential != undefined ? essential + 'Name' : '';
            var targetElId = e.currentTarget.id,
                targetValue = $(e.currentTarget).val();
            var nameValidateEl = $('#' + targetElId + 'Validate');
            if (targetElId == essentialName && !$.goValidation.isCheckLength(1, 16, targetValue)) {
                nameValidateEl.html(App.i18n(lang['label_validate'], {"arg1": "1", "arg2": "16"}));
            } else if (targetElId != essentialName && targetValue.length > 0 && (!$.goValidation.isCheckLength(1, 16, targetValue))) {
                nameValidateEl.html(App.i18n(lang['label_validate'], {"arg1": "1", "arg2": "16"}));
            } else {
                nameValidateEl.empty();
            }
        },

        changeAccessSetting: function (e) {
            var $currentTarget = $(e.currentTarget);
            var $selectedTable = $currentTarget.closest("table.detail");
            var selectedType = $selectedTable.data("type");

            var popup = $.goPopup({
                title: adminLang['정책 설정 변경 확인'],
                message: "",
                buttons: [{
                    btext: commonLang["확인"],
                    btype: "confirm",
                    callback: $.proxy(confirmCallback, this),
                    autoclose: false
                }, {
                    btext: commonLang["취소"],
                    btype: "normal",
                    callback: $.proxy(cancelCallback, this)
                }]
                ,
                closeCallback: $.proxy(cancelCallback, this)
            });

            function confirmCallback() {
                var TYPE = {
                    "PC": {accessTarget: this.webAccessTarget, exceptionTarget: this.webExceptionTarget},
                    "MOBILE": {accessTarget: this.mobileAccessTarget, exceptionTarget: this.mobileExceptionTarget}
                };

                TYPE[selectedType].accessTarget.deleteAllData();
                TYPE[selectedType].exceptionTarget.deleteAllData();
                toggleAccessLabel($currentTarget.val(), $selectedTable);
                popup.close();
            };

            function cancelCallback() {
                var currentPolicy = getOldPolicy($currentTarget.val());
                $selectedTable.find('input[value="' + currentPolicy + '"]').attr('checked', true);

                function getOldPolicy(currentPolicy) {
                    var oldPolicy = 'black';
                    if (currentPolicy == oldPolicy) {
                        oldPolicy = 'white';
                    }
                    return oldPolicy;
                }
            };
        },


        setModifyMenuData: function (data) {
            var locales = ["ko", "en", "jp", "zhcn", "zhtw", "vi"];

            _.each(locales, function (locale) {
                if (data[locale + "Name"]) {
                    this.$('tr[data-id="' + locale + 'NameInput"]').show();
                    this.$('#moreName > option[value="' + locale + 'Name"]').remove();
                }
            }, this);

            if (this.$('#moreName option').size() == 1) {
                this.$('tr[data-id="addMenuName"]').hide();
            }
        },


        renderCricleView: function ($el, circleJSON, isOrgUse) {
            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
            if (isOrgUse) {
                nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }
            var circleView = new CircleView({
                selector: $el,
                isAdmin: true,
                isWriter: true,
                circleJSON: circleJSON,
                nodeTypes: nodeTypes
            });
            circleView.render();
            return circleView
        },

        prevent: function (e) {
            if (e.keyCode == 13) e.preventDefault();
        }
    });

    function toggleAccessLabel(accessSetting, $el) {
        $el.find(".access_class_label").text(adminLang['설정']);
        if ("black" == accessSetting) {
            $el.find('#selectedClass').text(adminLang['차단할 클래스 선택']);
            $el.find('#exceptedClass').text(adminLang['예외 허용 클래스 선택']);
            $el.find('.help .tool_tip').html(adminLang['예외허용 클래스 선택 툴팁']);
        } else {
            $el.find('#selectedClass').text(adminLang['허용할 클래스 선택']);
            $el.find('#exceptedClass').text(adminLang['예외 차단 클래스 선택']);
            $el.find('.help .tool_tip').html(adminLang['예외차단 클래스 선택 툴팁']);
        }
    }

    return MenuDetail;

});