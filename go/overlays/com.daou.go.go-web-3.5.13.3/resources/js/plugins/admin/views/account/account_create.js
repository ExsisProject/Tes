
(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "views/layouts/admin_default",
            "i18n!nls/commons",

            "i18n!admin/nls/admin",
            "admin/views/account/account_form",
            "hgn!admin/templates/account_create",

            "admin/models/mail_domain_group"
        ],
        function (
            $,
            BackBone,
            App,
            Layout,
            CommonLang,

            AdminLang,
            AccountForm,
            CreateTmpl,

            MailDomainGroup
        ) {
            var __super__ = AccountForm.prototype;

            var AccountCreate = AccountForm.extend({
                events: function () {
                    return _.extend({}, __super__.events, {
                        "submit form": "formSubmit",
                        "click.account #saveAction": "saveAction",
                        "click.account #saveContinue": "saveContinue"
                    });
                },

                initialize: function (options) {
                    __super__.initialize.call(this, options);
                    Layout.render();
                    this.model = new Backbone.Model();
                    this.model.url = GO.contextRoot + "ad/api/user";

                    var systemInfo = new Backbone.Model();
                    systemInfo.url = GO.contextRoot + "ad/api/systeminfo";
                    systemInfo.fetch({async: false});
                    this.systemInfo = systemInfo.toJSON();

                    this.mailDomainGroup = MailDomainGroup.read("default");

                    this.systemMailSetting = new Backbone.Model();
                    this.systemMailSetting.url = GO.contextRoot + "ad/api/mailsetting";
                    this.systemMailSetting.fetch({async: false});

                    this.companyMailService = new Backbone.Model();
                    this.companyMailService.url = GO.contextRoot + "ad/api/company/mailservice";
                    this.companyMailService.fetch({async: false});

                    var mailDomainConfigModel = new Backbone.Model();
                    mailDomainConfigModel.url = GO.contextRoot + "ad/api/siteconfig";
                    mailDomainConfigModel.fetch({async: false});
                    this.mailDomainConfigModel = mailDomainConfigModel.toJSON();

                    this.$parentEl = options.$parentEl;
                },

                render: function () {
                    var profileVisibleInfos = this.mailDomainConfigModel.profileVisibleInfos,
                        moreInfoKeys = ["directTel", "mobileNo", "repTel", "fax", "selfInfo", "job", "location", "homePage", "messanger", "birthday", "anniversary", "address", "memo"],
                        moreInfos = _.pick(profileVisibleInfos, moreInfoKeys);

                    var domain_positions = this.positions.toJSON(),
                        domain_grades = this.grades.toJSON(),
                        domain_duties = this.duties.toJSON();
                    thumbnail_path = GO.contextRoot + "resources/images/admin/sample_photo.jpg",
                        locale = this.__setLocale(),
                        timeZone = this.__setTimeZone(),
                        mailGroups = this.__setMailGroup(),
                        userVirtualDomains = this.__setUserVirtualDomains(),
                        systemMailSetting = this.__setSystemMailSetting(),
                        isOrgServiceOn = this.__setOrgService(),
                        instalLocale = this.systemInfo.language,
                        tmpl = CreateTmpl({
                            type: this.type,
                            timeZone: timeZone,
                            locale: locale,
                            positions: domain_positions,
                            grades: domain_grades,
                            duties: domain_duties,
                            thumbnail_path: thumbnail_path,
                            mailGroups: mailGroups,
                            userVirtualDomains: userVirtualDomains,
                            systemMailSetting: systemMailSetting,
                            companyInfo: this.companyInfo,
                            instalLocale: instalLocale,
                            isJpInstall: instalLocale == 'ja',
                            isOrgServiceOn: isOrgServiceOn,
                            hasApproval: this.hasApproval,
                            isKoLocale: instalLocale == 'ko',
                            isEnLocale: instalLocale == 'en',
                            isJpLocale: instalLocale == 'ja',
                            isZhcnLocale: instalLocale == 'zhcn',
                            isZhtwLocale: instalLocale == 'zhtw',
                            isViLocale: instalLocale == 'vi',
                            profileVisibleInfos: profileVisibleInfos,
                            hasDeptInfo: this.options.hasOwnProperty('deptId'),
                            hasMoreInfo: function () {
                                var valueIsTrue = _.filter(moreInfos, function (info) {
                                    if (info) return true;
                                });
                                return _.contains(valueIsTrue, true);
                            }
                        });

                    this.$el.html(tmpl);
                    this.datePickerInit();
                    this.initProfileUpload();
                    this.setBirthday();
                    if (this.hasApproval) {
                        this.initApprovalUpload();
                        var defaultApprLevel = _.max(this.approvalLevels.toJSON(), function (approvalLevel) {
                            return approvalLevel.level;
                        });

                        this.setApprovalConfig({approvalLevel: defaultApprLevel.level});
                    }
                    this.inheritMailGroupConfig(this.mailDomainGroup.toJSON());
                    this.inheritDomainMailServiceConfig(this.companyMailService.toJSON());
                    if (this.mailDomainConfigModel.otpService == 'on') {
                        $('tr#otp').show();
                    }
                    if (this.mailDomainConfigModel.useAbbroadIpCheck == 'on') {
                        $('tr#useAbbroadIpCheck').show();
                    }

                    this.changeRepresentationEmail();
                    setTimeout($.proxy(function () {
                        $("#loginId").val("");
                        $("input[name='password']").val("");
                    }, this), 300);

                    this.customFieldRender();

                    this.hideDetailArea();
                    return this;
                },

                type: function () {
                    return _.extend({}, __super__.type, {
                        save_and_continue: AdminLang["저장 후 계속해서 추가"],
                        account_add: AdminLang["계정 추가 등록"],
                        save: CommonLang["저장"],
                        detail_input: AdminLang["상세 입력"],
                        multi_lang: AdminLang["다국어"],
                        open: CommonLang["열기"]
                    });
                }(),

                formSubmit: function (e) {
                    e.preventDefault();
                    return;
                },

                save: function (callback) {
                    var self = this;

                    try {
                        this.isFormInvalid({password: true, apprPassword: false});
                        this.model.attributes = $.extend({}, this.model.attributes, this.accountBuilder(this.options.deptId));
                    } catch (e) {
                        return console.log("accountBuilder Error :: " + e);
                    }

                    this.model.save(null, {
                        success: function () {
                            if (self.$parentEl) self.$parentEl.trigger('orgChanged');
                            $.goMessage(GO.i18n(AdminLang['멤버가 저장되었습니다.'], {'name': self.model.attributes.name}));
                            self.model.clear();
                            callback();
                        },
                        error: function (model, error) {
                            __super__.errorMessage(error);
                        }
                    });
                },
                saveAction: function () {
                    this.save(this.goList);
                },
                saveContinue: function () {
                    this.save(this.reset);
                },
                showDetail: function () {
                    this.$el.find("span#show_detail_btn").hide();
                    this.$el.find("div.detail_area").show();
                    this.$el.find("tr.detail_area").show();
                    if (this.mailDomainConfigModel.useAbbroadIpCheck != 'on') {
                        this.$el.find("tr#useAbbroadIpCheck").hide();
                    }
                },
                toggleMultiLang: function () {
                    var $targetBtn = this.$el.find("span#btnMultiLang i");
                    if ($targetBtn.hasClass('ic_accordion_s')) {
                        $targetBtn.removeClass('ic_accordion_s').addClass('ic_accordion_c').attr('title', CommonLang["닫기"]);
                        this.$el.find('tr[id$="NameInput"]').show();
                    } else {
                        $targetBtn.removeClass('ic_accordion_c').addClass('ic_accordion_s').attr('title', this.type.open);
                        this.$el.find('tr[id$="NameInput"]').hide();
                    }
                },

                reset: function () {
                    var form = $("#userCreateForm"),
                        thumbnail_image = $("#thumbnail_image"),
                        approval_sign_image = $("#approval_sign_img");

                    form[0].reset();
                    form.find(".dept_member").remove();
                    form.find("#group_members li").not("li.creat").remove();
                    form.find("ul.list_option li").remove();
                    form.find("input[name='name']").focus();

                    thumbnail_image.attr("src", GO.contextRoot + "resources/images/photo_profile_large.jpg");
                    thumbnail_image.removeAttr("data-filepath");
                    thumbnail_image.removeAttr("data-filename");

                    approval_sign_image.attr("src", GO.contextRoot + "resources/images/stamp_approved.png");
                    approval_sign_image.removeAttr("data-filepath");
                    approval_sign_image.removeAttr("data-filename");
                },
                cancel: function () {
                    this.goList();
                },

                __setSystemMailSetting: function () {
                    var mailSetting = this.systemMailSetting.toJSON();
                    var useLimitSendMailSize = mailSetting.limitSendmailSize;
                    if (useLimitSendMailSize == 'on') {
                        return true;
                    } else {
                        return false;
                    }
                },
                __setMailGroup: function () {
                    var mailGroup = this.mailDomainGroups.toJSON();
                    $.each(mailGroup, function () {
                        if (this.mailGroup == "default") {
                            this["isSelected?"] = true;
                            return;
                        }
                    });

                    return mailGroup;
                },
                __setUserVirtualDomains: function () {
                    var userVirtualDomains = this.userVirtualDomains.toJSON();
                    $.each(userVirtualDomains, function () {
                    });

                    return userVirtualDomains;
                },
                datePickerInit: function () {
                    var mailExpireDate = $("#mailExpireDate"),
                        anniversaryDate = $("#anniversaryDate");

                    $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
                    mailExpireDate.datepicker({
                        defaultDate: "+1w",
                        dateFormat: "yymmdd",
                        changeMonth: true,
                        changeYear: true,
                        yearSuffix: "",
                    });
                    anniversaryDate.datepicker({
                        defaultDate: "+1w",
                        dateFormat: "yy-mm-dd",
                        changeMonth: true,
                        changeYear: true,
                        yearSuffix: "",
                    });
                },
                __setTimeZone: function () {
                    var systemTimeZoneName = this.systemInfo.timeZoneName;

                    //TimeZone에서 ROK와 Asia/Seoul두개가 존재하기 때문에 하나의 값을 Asia/Seoul로 설정합니다.
                    if (systemTimeZoneName == "ROK") {
                        systemTimeZoneName = "Asia/Seoul";
                    }

                    for (var i = 0; i < this.timeZone.length; i++) {
                        if (this.timeZone[i].location == systemTimeZoneName) {
                            this.timeZone[i]["isTimeZone?"] = true;
                            timeZoneFlag = false;
                            break;
                        }
                    }
                    return this.timeZone;
                },
                __setLocale: function () {
                    var locale = [
                        {value: "ko", text: this.type.ko},
                        {value: "en", text: this.type.en},
                        {value: "ja", text: this.type.jp},
                        {value: "zh_CN", text: this.type.zh_cn},
                        {value: "zh_TW", text: this.type.zh_tw},
                        {value: "vi", text: this.type.vi}
                    ];

                    for (var i = 0; i < locale.length; i++) {
                        if (locale[i].value == this.systemInfo.language) {
                            locale[i]["isLocale?"] = true;
                            break;
                        }
                    }
                    return locale;
                },

                customFieldRender: function () {
                    var self = this;
                    $.go(GO.contextRoot + "ad/api/customprofile/use/config", {}, {
                        qryType: 'GET',
                        async: false,
                        responseFn: function (response) {
                            if (response.data.length == 0) {
                                self.$el.find('#customInfo').remove();
                                return;
                            }

                            var tmp = "";
                            var dateIdList = [];
                            $.each(response.data, function (i, item) {
                                if (item.dataType == "String") {
                                    tmp += '<tr>' +
                                        '<th><span class="title">' + item.name + '</span></th>' +
                                        '<td><input class="w200 input" type="text" name="' + item.profileName + '" id="' + item.profileName + '"/></td>' +
                                        '</tr>';
                                } else {
                                    tmp += '<tr>' +
                                        '<th><span class="title">' + item.name + '</span></th>' +
                                        '<td><input class="w200 input" type="text" name="' + item.profileName + '" id="' + item.profileName + '"/></td>' +
                                        '</tr>';
                                    dateIdList.push(item.profileName);
                                }
                            });

                            self.$el.find('#customInfo table.detail').append(tmp);

                            $.each(dateIdList, function (i, item) {
                                self.$el.find('#' + item).datepicker({
                                    defaultDate: "+1w",
                                    dateFormat: "yy-mm-dd",
                                    changeMonth: true,
                                    changeYear: true,
                                    yearSuffix: "",
                                });
                            });
                        },
                        error: function (response) {
                            var responseData = JSON.parse(response.responseText);
                            $.goMessage(responseData.message);
                        }
                    });
                },

                hideDetailArea: function () {
                    this.$el.find(".detail_area").hide();
                },
                __setOrgService: function () {
                    return GO.util.isUseOrgService(true);
                }
            });

            return AccountCreate;
        });
}).call(this);
