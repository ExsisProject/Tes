define(function (require) {
    var _ = require("underscore");
    var App = require("app");
    var TplContactCreate = require("hgn!contact/templates/create");
    var TplContactModify = require("hgn!contact/templates/modify");
    var TplGroupCreate = require("hgn!contact/templates/group_create");
    var TplAddrDetail = require("hgn!contact/templates/addr_detail");
    var PersonalCreateContactModel = require("contact/models/personal_create_contact");
    var CompanyCreateContactModel = require("contact/models/company_create_contact");
    var DeleteContactModel = require("contact/models/delete_contact");
    var CompanyContactInfoModel = require("contact/models/company_contact_info");
    var CompanyContactModifyModel = require("contact/models/company_contact_modify");
    var DeptContactModel = require("contact/models/dept_contact");
    var CreateGroupModel = require("contact/models/create_group");
    var ContactInfoModel = require("contact/models/contact_info");
    var ContactModifyModel = require("contact/models/contact_modify");
    var PersonalGroupCollection = require("contact/collections/personal_group");
    var DeptGroupCollection = require("contact/collections/dept_group");
    var UserLang = require("i18n!nls/user");
    var CommonLang = require("i18n!nls/commons");
    var ContactLang = require("i18n!contact/nls/contact");
    var FileUpload = require("file_upload");
    var GroupInfoModel = require("contact/models/group_info");
    require("jquery.go-popup");
    require("jquery.ui");

    var lang = {
        'name': ContactLang['이름(표시명)'],
        'firstName': CommonLang['이름'],
        'middleName': ContactLang['중간이름'],
        'lastName': ContactLang['성'],
        'hurigana': ContactLang['후리가나'],
        'company': UserLang['회사'],
        'dept': UserLang['부서'],
        'position': UserLang['직위'],
        'group': ContactLang['그룹'],
        'group_create': ContactLang['그룹추가'],
        'email': UserLang['이메일'],
        'phone': UserLang['휴대폰'],
        'company_tel': ContactLang['회사전화'],
        'company_addr': ContactLang['회사주소'],
        'description': ContactLang['메모'],
        'nickName': ContactLang['애칭'],
        'birthday': ContactLang['생일'],
        'anniversary': ContactLang['기념일'],
        'home_tel': ContactLang['집 전화'],
        'home_addr': ContactLang['집 주소'],
        'home_fax': ContactLang['집 팩스'],
        'home_homepage': ContactLang['집 홈페이지'],
        'company_fax': ContactLang['회사 팩스'],
        'company_homepage': ContactLang['회사 홈페이지'],
        'item_add': ContactLang['항목추가'],
        'select_desc': ContactLang['추가할 항목을 선택하세요'],
        'save': CommonLang['저장'],
        'cancel': CommonLang['취소'],
        'save_continue': ContactLang['계속등록'],
        'return_list': CommonLang['목록'],
        'modify': CommonLang['수정'],
        'delete': CommonLang['삭제'],
        'copy': CommonLang['URL 복사'],
        'image': CommonLang["사진"],
        'imageUpload': CommonLang["사진 올리기"],
        'imageUploadInfo': CommonLang["※ 사진은 자동으로 100x100 사이즈로 적용 됩니다."],
        'contact_modify': ContactLang['주소록 수정'],
        'item_modify': ContactLang['수정하기'],
        'add_detail': ContactLang['상세주소입력'],
        'new_group_name': ContactLang['새 그룹 이름'],
        'new_group': ContactLang['새 그룹'],
        'name_detail': ContactLang['이름 상세입력'],
        'contact_add': ContactLang['연락처 추가'],
        'homepage_link': ContactLang['연결'],
        'phone_desc': ContactLang['국가코드도움말'],
        'contact': CommonLang['주소록']
    };

    var addr = {
        'addr_country': ContactLang['국가/지역'],
        'addr_zipcode': ContactLang['우편번호'],
        'addr_state': ContactLang['시/도'],
        'addr_city': ContactLang['구/군'],
        'addr_ext': ContactLang['기타주소']
    };

    var ContactCreate = Backbone.View.extend({

        el: '#content',
        manage: false,
        events: {
            "click #groupCreate": "groupCreate",
            "click #officeDetail": "officeDetail",
            "click #homeDetail": "homeDetail",
            "click #saveDone": "saveDone",
            "click #saveContinueDone": "saveContinueDone",
            "click #saveCancel": "saveCancel",
            "click #groupNameTag li span.ic_del": "deleteGroup",
            "change select[name=contactItem]": "selectItem",
            "click #saveModify": "saveModify",
            "click #contactDelete": "contactDelete",
            "click #modifyCancel": "modifyCancel",
            "click #returnList": "returnList",
            "click #bottomSaveModify": "saveModify",
            "click #bottomContactDelete": "contactDelete",
            "click #bottomModifyCancel": "modifyCancel",
            "click #bottomReturnList": "returnList",

            "click .contact_item_modify": "contactItemModify",
            "click #birthdayDateIcon": "birthdayDateIcon",
            "click #anniversaryDateIcon": "anniversaryDateIcon",
            "focus input": "focusForm",
            "focusout input": "focusoutForm",
            "click #del_photo": "deletePhoto",
            "click #home_link": "homepageLink",
            "click #company_link": "homepageLink",

            "keyup input[name=firstName]": "checkName",
            "keyup input[name=lastName]": "checkName",
            "keyup input[name=middleName]": "checkName",
            "focusout input[name=firstName]": "checkName",
            "focusout input[name=lastName]": "checkName",
            "focusout input[name=middleName]": "checkName",

            "keyup input[name=firstNameHurigana]": "checkNameHurigana",
            "keyup input[name=lastNameHurigana]": "checkNameHurigana",
            "keyup input[name=middleNameHurigana]": "checkNameHurigana",
            "focusout input[name=firstNameHurigana]": "checkNameHurigana",
            "focusout input[name=lastNameHurigana]": "checkNameHurigana",
            "focusout input[name=middleNameHurigana]": "checkNameHurigana"
        },

        isUser: function () {
            return this.type == "personal";
        },

        isCompany: function () {
            return this.type == "company";
        },

        isDept: function () {
            return this.type == "department";
        },

        isCreateMode: function () {
            return this.mode == "create";
        },

        isModifyMode: function () {
            return this.mode == "modify";
        },

        initialize: function () {
            this.mode = null;
            this.$el.off();
            this.type = this.options.type;
            this.mode = this.options.mode;
            this.groupId = this.options.groupId;
            this.deptId = this.options.deptId;
            this.contactId = this.options.contactId;
            this.initData = this.options.initData || {};
        },

        render: function () {
            if (this.isModifyMode()) {
                this.renderModify();
            } else {
                this.renderCreate();
            }
            this.initFileUpload();
        },

        renderCreate: function () {
            var groupInfo = null;
            if (this.groupId) {
                groupInfo = GroupInfoModel.read({groupId: this.groupId}).toJSON();
            }

            var optionList =
                [{"value": "nickName", "name": ContactLang['애칭']},
                    {"value": "birthday", "name": ContactLang['생일']},
                    {"value": "anniversary", "name": ContactLang['기념일']},
                    {"value": "home_tel", "name": ContactLang['집 전화']},
                    {"value": "home_basicAddress", "name": ContactLang['집 주소']},
                    {"value": "home_fax", "name": ContactLang['집 팩스']},
                    {"value": "home_homepage", "name": ContactLang['집 홈페이지']},
                    {"value": "company_fax", "name": ContactLang['회사 팩스']},
                    {"value": "company_homepage", "name": ContactLang['회사 홈페이지']}];

            var tmpl = TplContactCreate({
                lang: lang,
                data: this.initData,
                contextRoot: App.contextRoot,
                optionList: optionList,
                group: groupInfo,
                isCompany: this.isCompany(),
                isJapanese: GO.session().locale == 'ja'
            });
            this.$el.html(tmpl);
        },

        renderModify: function () {

            var contactModel;

            if (this.isUser()) {
                contactModel = ContactInfoModel.read({contactId: this.contactId});
            } else if (this.isCompany()) {
                var groupInfo = GroupInfoModel.read({"groupId": this.groupId}).toJSON();
                contactModel = new CompanyContactInfoModel();
                contactModel.set({
                    "groupId": this.groupId,
                    "contactId": this.contactId,
                });
                contactModel.fetch({
                    async: false,
                    error: function (model, response) {
                        return false;
                    }
                });
            } else { // this.isDept()
                contactModel = new DeptContactModel();
                contactModel.setDeptId(this.deptId);
                contactModel.set("id", this.contactId);
                contactModel.fetch({async: false});
            }

            var contactData = contactModel.toJSON();
            _.map(contactData, function (val, key) {

                if (typeof val === 'string' && !val) {
                    contactData[key] = null;
                }

                if (typeof val === 'object') {
                    _.map(val, function (val2, key2) {
                        if (typeof val2 === 'string' && !val2) {
                            contactData[key][key2] = null;
                        }
                    });
                }

                if (key == 'birthday' || key == 'anniversary') {
                    contactData[key] = toShortDate(val);
                }

                if (key == 'description') {
                    if (typeof val === 'string' && !val) {
                        contactData[key] = null;
                    } else {
                        val = GO.util.textToHtml(val);
                        contactData[key] = val;
                    }
                }
            });

            var tmpl = TplContactModify({
                lang: lang,
                contextRoot: App.contextRoot,
                data: contactData,
                isCompany: this.isCompany(),
                isJapanese: GO.session().locale == 'ja'
            });

            this.$el.html(tmpl);
            if (!contactModel.toJSON().hasOwnProperty('home') || contactModel.get('home').basicAddress == null) {
                $('#homeDetail').parents('tr').hide();
            }

            if (!contactModel.toJSON().hasOwnProperty('office') || contactModel.get('office').basicAddress == null) {
                $('#officeDetail').parents('tr').hide();
            }

            if (this.isCompany()) {
                if (!groupInfo.removable) {
                    $("#contactDelete").remove();
                    $("#bottomContactDelete").remove();
                }

                if (!groupInfo.writable) {
                    $("#modifyCancel").remove();
                    $("#bottomModifyCancel").remove();
                    $("#saveModify").remove();
                    $("#bottomSaveModify").remove();
                    this.removeModifyClass();
                }
            }
        },

        focusForm: function (e) {
            $(e.currentTarget).addClass('edit');
        },
        focusoutForm: function (e) {
            $(e.currentTarget).removeClass('edit');
        },

        birthdayDateIcon: function (e) {
            $("#birthdayDate").focus();
        },
        anniversaryDateIcon: function (e) {
            $("#anniversaryDate").focus();
        },

        homepageLink: function (e) {
            var parent = $(e.currentTarget).parents('td');
            window.open(parent.find('span.txt_form').text(), "scrollbars=yes,resizable=yes,width=800,height=640");
        },

        contactItemModify: function (e) {

            var value = $.trim($(e.currentTarget).text());
            var parentEl = $(e.currentTarget).parents('td');

            parentEl.find('span.btn_fn7').hide();
            parentEl.find('span.txt_edit,span.noti_date_wrap,span.textarea').show().find('input').val(value).focus();
            parentEl.find('span.textarea').show().find('textarea').text(value).focus();
            parentEl.find('span.txt_form').remove();

            if (parentEl.find('span.noti_date_wrap').length) {
                this.initializeDatepicker();
            }
        },


        removeModifyClass: function (e) {
            this.$el.find('.contact_item_modify').removeClass('contact_item_modify');
            this.$el.find('input').attr('readonly', true);
            this.$el.find('#swfupload-control').remove();
            this.$el.find('.ui_edit').remove();
            this.$el.find('.ic_detail').remove();
            this.$el.find('select[name=contactItem]').parents('tr').remove();
        },

        groupCreate: function (e) {
            var groups;

            if (this.isUser()) {
                groups = PersonalGroupCollection.getCollection().toJSON() || [];
            } else {  // this.isDept()
                groups = DeptGroupCollection.get(this.deptId).toJSON();
            }

            this.popupEl = $.goPopup({
                header: ContactLang["그룹추가"],
                width: "262px",
                pclass: 'layer_creat_group layer_normal',
                contents: TplGroupCreate({
                    data: groups,
                    lang: lang
                })
            });

            this.popupEl.reoffset();
            this.popupUnbindEvents();
            this.popupBindEvents();
        },

        selectItem: function (e) {
            var item = $(e.currentTarget).val();
            var form = this.$el.find('form[name="formContactCreate"]');

            if (item == "description") {
                itemEl = form.find('textarea[name="' + item + '"]');
            } else {
                itemEl = form.find('input[name="' + item + '"]');
            }

            if (itemEl.parents('tr').css('display') == 'none') {
                itemEl.parents('tr').show();
                if (item == "birthday" || item == "anniversary") {
                    this.initializeDatepicker();
                }
                $(e.currentTarget).find('option[value="' + item + '"]').remove();
            }
        },

        initializeDatepicker: function () {
            var birthdayDate = $("#birthdayDate");
            var anniversaryDate = $("#anniversaryDate");
            $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
            birthdayDate.datepicker({
                defaultDate: "+1w",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearRange: 'c-80:c+10',
                yearSuffix: ""
            });

            anniversaryDate.datepicker({
                defaultDate: "+1w",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearRange: 'c-80:c+10',
                yearSuffix: ""
            });
        },
        deletePhoto: function () {
            var $thumbnail = $("#thumbnail_image");
            $thumbnail.attr("data-filepath", "");
            $thumbnail.attr("data-filename", "");
            $thumbnail.attr("src", GO.contextRoot + "resources/images/photo_profile_large.jpg");
        },
        saveDone: function () {
            var response = this.saveContactData();
            if (response.code == '200') {
                if (new RegExp("create").test(App.router.getUrl())) {
                    if (new RegExp("contact/create").test(App.router.getUrl())) {
                        App.router.navigate("contact", {trigger: true});
                    } else {
                        window.history.back();
                    }
                } else {
                    App.router.navigate(App.router.getUrl(), {replace: true, trigger: true, pushState: true});
                }
                $.goMessage(CommonLang['저장되었습니다.']);
            }
        },

        saveContinueDone: function () {
            var self = this;
            var response = this.saveContactData();
            if (response.code == '200') {
                $.goMessage(CommonLang['저장되었습니다.']);
                var groupId = $(".title.on").parent().attr('data-id');
                var type = $(".title.on").parent().attr('data-type');
                if (groupId != undefined) {
                    var opt = {
                        groupId: groupId
                    };
                    self.renderCreate(opt, type);
                } else {
                    self.renderCreate();
                }
                this.initFileUpload();
            }
        },

        saveModify: function () {
            var response = this.saveContactData(this.contactId);
            if (response.code == '200') {
                $.goMessage(CommonLang['수정되었습니다.']);
                window.history.back();
            }
        },

        saveContactData: function (contactId) {
            var rs = null;
            var form = this.$el.find('form[name=formContactCreate]'),
                nameEl = form.find('input[name="name"]'),
                emailEl = form.find('input[name="email"]');

            var home = {};
            var office = {};
            var groupIds = [];
            var model;

            if (this.isCompany()) {
                if (contactId) {
                    model = new CompanyContactModifyModel();
                    model.set({
                        "groupId": this.groupId,
                        "id": contactId
                    });
                } else {
                    model = new CompanyCreateContactModel();
                    model.setGroupId(this.groupId);
                }

            } else if (this.isUser()) {
                if (contactId) {
                    model = new ContactModifyModel();
                    model.set("id", contactId);
                } else {
                    model = new PersonalCreateContactModel();
                }
            } else {  // this.isDept()
                model = new DeptContactModel();
                model.setDeptId(this.deptId);
                if (contactId) {
                    model.set("id", contactId);
                }
            }

            $.each(form.serializeArray(), function (k, v) {
                if (v.name == 'groupId') {
                    groupIds.push(v.value);
                } else if (v.name == 'description') {
                    model.set(v.name, GO.util.htmlToText(v.value), {silent: true});
                } else if (v.name == 'company_tel') {
                    office['tel'] = v.value;
                } else if (v.name == 'company_fax') {
                    office['fax'] = v.value;
                } else if (v.name == 'company_basicAddress') {
                    office['basicAddress'] = v.value;
                } else if (v.name == 'company_country') {
                    office['country'] = v.value;
                } else if (v.name == 'company_postalCode') {
                    office['postalCode'] = v.value;
                } else if (v.name == 'company_state') {
                    office['state'] = v.value;
                } else if (v.name == 'company_city') {
                    office['city'] = v.value;
                } else if (v.name == 'company_extAddress') {
                    office['extAddress'] = v.value;
                } else if (v.name == 'company_homepage') {
                    office['homepage'] = v.value;
                } else if (v.name == 'home_tel') {
                    home['tel'] = v.value;
                } else if (v.name == 'home_fax') {
                    home['fax'] = v.value;
                } else if (v.name == 'home_basicAddress') {
                    home['basicAddress'] = v.value;
                } else if (v.name == 'home_country') {
                    home['country'] = v.value;
                } else if (v.name == 'home_postalCode') {
                    home['postalCode'] = v.value;
                } else if (v.name == 'home_state') {
                    home['state'] = v.value;
                } else if (v.name == 'home_city') {
                    home['city'] = v.value;
                } else if (v.name == 'home_extAddress') {
                    home['extAddress'] = v.value;
                } else if (v.name == 'home_homepage') {
                    home['homepage'] = v.value;
                } else if (v.name == 'birthday' && v.value.length > 0) {
                    model.set(v.name, GO.util.dateFormatWithoutTimeZone(v.value), {silent: true});
                } else if (v.name == 'anniversary' && v.value.length > 0) {
                    model.set(v.name, GO.util.dateFormatWithoutTimeZone(v.value), {silent: true});
                } else if (v.name == 'contactItemDesc') {
                } else {
                    model.set(v.name, v.value, {silent: true});
                }
            });

            model.set({
                "office": office,
                "home": home,
                "groupIds": groupIds
            });

            $thumbnail = $("#thumbnail_image"),
                thumbnail_image = {
                    filePath: $thumbnail.attr("data-filepath").replace(GO.contextRoot, ""),
                    fileName: $thumbnail.attr("data-filename"),
                    hostId: $thumbnail.attr("host-id")
                };

            if (thumbnail_image["filePath"] == "" && thumbnail_image["fileName"] == "") {
                thumbnail_image = null;
            }
            model.set("photo", thumbnail_image);

            var invalidAction = function (msg, focusEl) {
                $.goMessage(msg);
                if (focusEl) focusEl.focus();
                return false;
            };

            if (!$.goValidation.isCheckLength(2, 64, $.trim(model.get('name')))) {
                invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {"arg1": "2", "arg2": "64"}), nameEl);
                return false;
            }

            if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get('companyName')))) {
                invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                    "arg1": "0",
                    "arg2": "255"
                }), form.find('input[name="companyName"]'));
                return false;
            }

            if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get('departmentName')))) {
                invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                    "arg1": "0",
                    "arg2": "255"
                }), form.find('input[name="departmentName"]'));
                return false;
            }

            if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get('positionName')))) {
                invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                    "arg1": "0",
                    "arg2": "255"
                }), form.find('input[name="positionName"]'));
                return false;
            }

            if (model.get('email').length > 0) {
                if (!$.goValidation.isValidEmail(model.get('email'))) {
                    invalidAction(CommonLang['이메일 형식이 올바르지 않습니다.'], emailEl);
                    return false;
                }

                if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get('email')))) {
                    invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {"arg1": "0", "arg2": "255"}), emailEl);
                    return false;
                }
            }

            if (model.get('mobileNo').length > 0) {
                if (!$.goValidation.isCheckLength(0, 40, $.trim(model.get('mobileNo')))) {
                    invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                        "arg1": "0",
                        "arg2": "40"
                    }), form.find('input[name="mobileNo"]'));
                    return false;
                }
                if (!$.goValidation.isInvalidTel(model.get('mobileNo'))) {
                    invalidAction(ContactLang['번호형식이 올바르지 않습니다(-,0~9)'], form.find('input[name="mobileNo"]'));
                    return false;
                }
            }

            if (model.get('office').tel.length > 0) {
                if (!$.goValidation.isCheckLength(0, 40, $.trim(model.get("office").tel))) {
                    invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                        "arg1": "0",
                        "arg2": "40"
                    }), form.find('input[name="company_tel"]'));
                    return false;
                }
                if (!$.goValidation.isInvalidTel(model.get("office").tel)) {
                    invalidAction(ContactLang['번호형식이 올바르지 않습니다(-,0~9)'], form.find('input[name="company_tel"]'));
                    return false;
                }
            }

            if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get("office").basicAddress))) {
                invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                    "arg1": "0",
                    "arg2": "255"
                }), form.find('input[name="company_basicAddress"]'));
                return false;
            }

            if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get("description")))) {
                invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                    "arg1": "0",
                    "arg2": "255"
                }), form.find('input[name="description"]'));
                return false;
            }

            if (!$.goValidation.isCheckLength(0, 64, $.trim(model.get("nickName")))) {
                invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                    "arg1": "0",
                    "arg2": "64"
                }), form.find('input[name="nickName"]'));
                return false;
            }

            if (model.get("home").tel.length > 0) {
                if (!$.goValidation.isCheckLength(0, 40, $.trim(model.get("home").tel))) {
                    invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                        "arg1": "0",
                        "arg2": "40"
                    }), form.find('input[name="home_tel"]'));
                    return false;
                }
                if (!$.goValidation.isInvalidTel(model.get("home").tel)) {
                    invalidAction(ContactLang['번호형식이 올바르지 않습니다(-,0~9)'], form.find('input[name="home_tel"]'));
                    return false;
                }
            }

            if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get("home").basicAddress))) {
                invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                    "arg1": "0",
                    "arg2": "255"
                }), form.find('input[name="home_basicAddress"]'));
                return false;
            }

            if (model.get('home').fax.length > 0) {
                if (!$.goValidation.isCheckLength(0, 40, $.trim(model.get("home").fax))) {
                    invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                        "arg1": "0",
                        "arg2": "40"
                    }), form.find('input[name="home_fax"]'));
                    return false;
                }
                if (!$.goValidation.isInvalidTel(model.get("home").fax)) {
                    invalidAction(ContactLang['번호형식이 올바르지 않습니다(-,0~9)'], form.find('input[name="home_fax"]'));
                    return false;
                }
            }


            if (model.get('home').homepage.length > 0) {
                if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get("home").homepage))) {
                    invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                        "arg1": "0",
                        "arg2": "255"
                    }), form.find('input[name="home_homepage"]'));
                    return false;
                }
                if (!$.goValidation.validateURL(model.get("home").homepage)) {
                    invalidAction(ContactLang['홈페이지 오류 설명'], form.find('input[name="home_homepage"]'));
                    return false;
                }
            }


            if (model.get('office').fax.length > 0) {
                if (!$.goValidation.isCheckLength(0, 40, $.trim(model.get("office").fax))) {
                    invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                        "arg1": "0",
                        "arg2": "40"
                    }), form.find('input[name="company_fax"]'));
                    return false;
                }
                if (!$.goValidation.isInvalidTel(model.get("office").fax)) {
                    invalidAction(ContactLang['번호형식이 올바르지 않습니다(-,0~9)'], form.find('input[name="company_fax"]'));
                    return false;
                }
            }

            if (model.get('office').homepage.length > 0) {
                if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get("office").homepage))) {
                    invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                        "arg1": "0",
                        "arg2": "255"
                    }), form.find('input[name="office_homepage"]'));
                    return false;
                }
                if (!$.goValidation.validateURL(model.get("office").homepage)) {
                    invalidAction(ContactLang['홈페이지 오류 설명'], form.find('input[name="office_homepage"]'));
                    return false;
                }
            }

            model.save({}, {
                async: false,
                success: function (model, response) {
                    if (response.code == '200') {
                        rs = response;
                    }
                },
                error: function (model, response) {
                    var result = JSON.parse(response.responseText);
                    $.goMessage(result.message);
                    rs = response;
                }
            });
            return rs;
        },

        returnList: function () {
            var url = App.router.getUrl();
            var goToUrl = ["contact"];
            if (this.isDept() || this.type == "dept") {
                goToUrl.push("dept");
                goToUrl.push(this.deptId);
                if (!_.isEmpty(this.groupId)) {
                    goToUrl.push("group");
                    goToUrl.push(this.groupId);
                }
            } else {
                goToUrl.push(this.type);
                goToUrl.push(this.groupId);
            }
            App.router.navigate(goToUrl.join("/"), {replace: true, trigger: true});
        },

        saveCancel: function () {
            var self = this;
            $.goConfirm(CommonLang['취소하시겠습니까?'], CommonLang['입력하신 정보가 초기화됩니다.'], function () {
                self.renderCreate();
                self.initFileUpload();
            });
        },

        modifyCancel: function () {
            var self = this;
            $.goConfirm(CommonLang['취소하시겠습니까?'], CommonLang['입력하신 정보가 초기화됩니다.'], function () {
                self.renderModify({contactId: self.contactId});
                self.initFileUpload();
            });
        },

        contactDelete: function (e) {
            var self = this;
            var ids = [];
            ids.push(self.contactId);
            $.goCaution(ContactLang["주소록을 삭제하시겠습니까"], "", function () {
                var model = new DeleteContactModel();
                model.set({
                    "ids": ids,
                }, {silent: true});
                model.save({}, {
                    type: 'DELETE',
                    success: function (model, response) {
                        if (response.code == '200') {
                            $.goMessage(CommonLang["삭제되었습니다."]);
                            window.history.back();
                        }
                    },
                    error: function (model, response) {
                        var result = JSON.parse(response.responseText);
                        $.goMessage(result.message);
                    }
                });
            });
        },

        popupUnbindEvents: function () {
            this.popupEl.off();
        },

        popupBindEvents: function () {
            this.popupEl.on("click", "#popupGroupAdd", $.proxy(this.popupGroupAdd, this));
            this.popupEl.on("click", ".popupGroupName", $.proxy(this.popupGroupName, this));
            this.popupEl.on("click", "#popupGroupCreate", $.proxy(this.popupGroupCreate, this));
            this.popupEl.on("click", "#popupGroupCancel", $.proxy(this.popupGroupCancel, this));
        },

        checkName: function (e) {
            var firstName = this.$el.find('input[name=firstName]').val();
            var lastName = this.$el.find('input[name=lastName]').val();
            var middleName = this.$el.find('input[name=middleName]').val();
            var displayName = this.$el.find('input[name=name]');

            lastName = lastName + " ";
            if (middleName != "") {
                middleName = middleName + " ";
            }
            displayName.val(lastName + middleName + firstName);
        },

        checkNameHurigana: function () {
            var firstName;
            var lastName;
            var middleName;
            var displayName;
            firstName = this.$el.find('input[name=firstNameHurigana]').val();
            lastName = this.$el.find('input[name=lastNameHurigana]').val();
            middleName = this.$el.find('input[name=middleNameHurigana]').val();
            displayName = this.$el.find('input[name=nameHurigana]');
            lastName = lastName + " ";
            if (middleName != "") {
                middleName = middleName + " ";
            }
            displayName.val(lastName + middleName + firstName);
        },

        popupGroupAdd: function (e) {
            var item = $(e.currentTarget).parents('ul.group_tag').children('li.edit');
            if (item.css('display') == 'none') {
                item.show();
            } else {
                $.goAlert(ContactLang["1개 이상 추가할 수 없습니다."]);
            }
        },

        popupGroupCreate: function (e) {
            var self = this;
            var groupName = $(e.currentTarget).parents('li.edit').children('input').val();
            var invalidAction = function (msg, focusEl) {
                $.goMessage(msg);
                if (focusEl) focusEl.focus();
                return false;
            };

            if (!$.goValidation.isCheckLength(2, 16, groupName)) {
                invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                    "arg1": "2",
                    "arg2": "16"
                }), $(e.currentTarget).parents('li.edit').children('input'));
                return false;
            } else {

                var type;

                if (this.isUser()) {
                    type = "USER";
                } else { // this.isDept()
                    type = "DEPARTMENT";
                }

                var model = new CreateGroupModel({
                    "type": type
                });

                if (model.isDept()) {
                    model.set("deptId", this.deptId);
                }

                model.set({
                    "name": groupName
                }, {silent: true});

                model.save({}, {
                    type: 'POST',
                    success: function (model, response) {
                        if (response.code == '200') {
                            self.groupCreate();
                            self.popupGroupNameAdd(groupName, response.data.id);
                            GO.EventEmitter.trigger('contact', 'changed:sideGroups');
                        }
                    },
                    error: function (model, response) {
                        var result = JSON.parse(response.responseText);
                        $.goMessage(result.message);
                    }
                });
            }
        },

        popupGroupCancel: function (e) {
            $(e.currentTarget).parents('li.edit').hide().children('input').val('');
        },

        popupGroupNameAdd: function (groupName, groupId) {
            $('#groupNameTag li.creat').before('<li data-id=' + groupId + '><input type="hidden" name="groupId" value=' + groupId + '><span class="name">' + groupName
                + '</span><span class="btn_wrap"><span class="ic_classic ic_del" title="' + CommonLang['삭제'] + '"></span></span></li>');
        },

        popupGroupName: function (e) {
            var id = $(e.currentTarget).attr('data-id'),
                name = $(e.currentTarget).children('a').text();
            var targetEl = $('#groupNameTag');

            if (!targetEl.find('li[data-id="' + id + '"]').length) {
                $('#groupNameTag li.creat').before('<li data-id=' + id + '><input type="hidden" name="groupId" value=' + id + '><span class="name">' + name
                    + '</span><span class="btn_wrap"><span class="ic_classic ic_del" title="' + CommonLang['삭제'] + '"></span></span></li>');
            } else {
                $.goMessage(CommonLang["이미 선택되었습니다."]);
            }
        },

        deleteGroup: function (e) {
            $(e.currentTarget).parents('li').remove();
        },

        officeDetail: function (e) {
            this.addDetail("company_basicAddress");

        },

        homeDetail: function (e) {
            this.addDetail("home_basicAddress");
        },

        addDetail: function (name) {

            var address = "";
            var preFix = name.split('_')[0];

            var data = {
                country: $('input[name=' + preFix + '_country]').val(),
                postalCode: $('input[name=' + preFix + '_postalCode]').val(),
                state: $('input[name=' + preFix + '_state]').val(),
                city: $('input[name=' + preFix + '_city]').val(),
                extAddress: $('input[name=' + preFix + '_extAddress]').val(),
            };

            $.goPopup({
                header: ContactLang['주소 상세입력'],
                pclass: 'layer_normal layer_addr_mgmt',
                buttons: [{
                    btype: 'confirm',
                    btext: CommonLang['저장'],
                    callback: function () {
                        var form = $('form[name=formAddrDetail]');
                        $.each(form.serializeArray(), function (k, v) {
                            if (v.name == "country") {
                                $('input[name=' + preFix + '_' + v.name + ']').val(v.value);
                            } else if (v.name == "postalCode") {
                                $('input[name=' + preFix + '_' + v.name + ']').val(v.value);
                            } else if (v.name == "state") {
                                $('input[name=' + preFix + '_' + v.name + ']').val(v.value);
                            } else if (v.name == "city") {
                                $('input[name=' + preFix + '_' + v.name + ']').val(v.value);
                            } else if (v.name == "extAddress") {
                                $('input[name=' + preFix + '_' + v.name + ']').val(v.value);
                            }
                            address += v.value + " ";
                        });
                        $('input[name=' + name + ']').val(address);
                    }
                },
                    {
                        btype: 'normail',
                        btext: CommonLang["취소"],
                        callback: function () {
                        }
                    }],
                width: "300px",
                contents: TplAddrDetail({
                    lang: addr,
                    data: data,
                })
            });
        },
        initFileUpload: function () {
            var _this = this,
                options = {
                    el: "#swfupload-control",
                    context_root: GO.contextRoot,
                    button_text: "<span class='buttonText'>" + CommonLang["사진 올리기"] + "</span>",
                    button_style: "text-align:center; color:#ffffff; font-size:12px;",
                    button_height: 30,
                    button_width: 100,
                    progressBarUse: false,
                    url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie')
                };

            (new FileUpload(options))
                .queue(function (e, data) {

                })
                .start(function (e, data) {
                    var reExt = new RegExp("(jpeg|jpg|gif|png|bmp)", "gi"),
                        fileExt = data.type;

                    if (!reExt.test(fileExt)) {
                        $.goMessage(CommonLang["포멧 경고"]);
                        return false;
                    }

                    if (data.size > 5 * 1024 * 1024) {
                        $.goMessage(CommonLang["첨부파일 용량은 5MB이하 입니다."]);
                        return false;
                    }

                })
                .progress(function (e, data) {

                })
                .success(function (e, serverData, fileItemEl) {
                    if (GO.util.fileUploadErrorCheck(serverData)) {
                        $.goAlert(GO.util.serverMessage(serverData));
                        return false;
                    } else {
                        if (GO.util.isFileSizeZero(serverData)) {
                            $.goAlert(GO.util.serverMessage(serverData));
                            return false;
                        }
                    }

                    var data = serverData.data,
                        fileName = data.fileName,
                        filePath = data.filePath,
                        hostId = data.hostId,
                        thumbnail = data.thumbnail;

                    $("#thumbnail_image")
                        .attr("src", thumbnail)
                        .attr("data-filepath", filePath)
                        .attr("host-id", hostId)
                        .attr("data-filename", fileName);
                })
                .complete(function (e, data) {
                    console.info(data);
                })
                .error(function (e, data) {
                    console.info(data);
                });

        }
    });

    // 생일, 기념일은 타임존에 영향을 받지 않고 고정된 날짜를 표시함.
    function toShortDate(datetime) {
        return moment(datetime, 'YYYY-MM-DD').format('YYYY-MM-DD');
    }

    return {
        render: function (opt, mode, type, data) {
            opt["mode"] = mode;
            opt["type"] = type;
            opt["initData"] = data;
            var instance = new ContactCreate(opt);
            return instance.render();
        }
    };
});