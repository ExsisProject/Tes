define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");
    var _ = require("underscore");
    var HeaderToolbarView = require("views/mobile/header_toolbar");
    var TplContactCreate = require("hgn!contact/templates/mobile/m_create");
    var TplContactModify = require("hgn!contact/templates/mobile/m_modify");
    var PersonalCreateContactModel = require("contact/models/personal_create_contact");
    var ContactInfoModel = require("contact/models/contact_info");
    var CompanyContactInfoModel = require("contact/models/company_contact_info");
    var CompanyCreateContactModel = require("contact/models/company_create_contact");
    var CompanyContactModifyModel = require("contact/models/company_contact_modify");
    var ContactModifyModel = require("contact/models/contact_modify");
    var PersonalGroupInfoModel = require("contact/models/personal_group_info");
    var CompanyGroupInfoModel = require("contact/models/company_group_info");
    var commonLang = require("i18n!nls/commons");
    var userLang = require("i18n!nls/user");
    var contactLang = require("i18n!contact/nls/contact");
    var DeptContactModel = require("contact/models/dept_contact");

    var GroupCollection = require("contact/collections/groups");
    var helper = require("contact/helpers/contacts");
    var FileUploader = require("components/go-fileuploader/mobile");
    require("jquery.go-validation");
    require("GO.util");
    require("jquery.cookie");
    require("jquery.datepicker");

    var instance = null;
    var lang = {
        'add_contact': contactLang['연락처 추가'],
        'return_home': commonLang['홈으로 이동'],
        'not_contact': contactLang['등록된 주소록이 없습니다'],
        'name': contactLang['이름(표시명)'],
        'firstName': commonLang['이름'],
        'middleName': contactLang['중간이름'],
        'lastName': contactLang['성'],
        'company': userLang['회사'],
        'dept': userLang['부서'],
        'position': userLang['직위'],
        'group': contactLang['그룹'],
        'group_create': contactLang['그룹추가'],
        'email': userLang['이메일'],
        'phone': userLang['휴대폰'],
        'company_tel': contactLang['회사전화'],
        'company_addr': contactLang['회사주소'],
        'description': contactLang['메모'],
        'nickName': contactLang['애칭'],
        'birthday': contactLang['생일'],
        'anniversary': contactLang['기념일'],
        'home_tel': contactLang['집 전화'],
        'home_addr': contactLang['집 주소'],
        'home_fax': contactLang['집 팩스'],
        'home_homepage': contactLang['집 홈페이지'],
        'company_fax': contactLang['회사 팩스'],
        'company_homepage': contactLang['회사 홈페이지'],
        'item_add': contactLang['항목추가'],
        'select_desc': contactLang['추가할 항목을 선택하세요'],
        'photoupload': contactLang['사진등록'],
        'profilephoto': contactLang['프로필사진'],
        'modify': commonLang['수정'],
        'delete': commonLang['삭제'],
        'image': commonLang["사진"],
        'imageUpload': commonLang["사진 올리기"],
        'imageUploadInfo': commonLang["※ 사진은 자동으로 100x100 사이즈로 적용 됩니다."]
    };

    var Contacts = Backbone.View.extend({
        el: '#content',

        events: {
            "change select[name=contactItem]": "selectItem",
            "vclick #groupNameTag li span.ic_del": "deleteGroup",
            "change select[name=selectGroup]": "selectGroup",
            "keyup #contactDescription": "expandTextarea",

            "keyup input[name=firstName]": "checkName",
            "keyup input[name=lastName]": "checkName",
            "keyup input[name=middleName]": "checkName",
            "focusout input[name=firstName]": "checkName",
            "focusout input[name=lastName]": "checkName",
            "focusout input[name=middleName]": "checkName",

        },

        initialize: function (options) {
            this.$el.off();
            this.type = options.type;
            this.contactId = options.contactId;
            this.viewMode = options.viewMode;
            this.groupId = options.groupId;
            this.deptId = options.deptId;

            helper.init(options);

            this.headerToolbarView = HeaderToolbarView;
            GO.EventEmitter.off("trigger-action");
            GO.EventEmitter.on('trigger-action', 'contact-save', this.saveData, this);
        },

        render: function () {
            this.renderToolbar();

            if (helper.isModifyMode()) {
                this.renderModify();
            } else {
                this.renderCreate();
            }
            this.attachFileUploader();
        },

        attachFileUploader: function () {
            var attachOption = {};
            attachOption.isContact = true;

            attachOption.success = function (file) {
                var obj = GO.config('isMobileApp') ? JSON.parse(file) : file.data;
                $("#contactImage").attr("src", obj.thumbnail);
                $("#contactImage").attr("data-filepath", obj.filePath);
                $("#contactImage").attr("data-filename", obj.fileName);
            };

            attachOption.error = function () {
                alert(commonLang['업로드에 실패하였습니다.']);
            };

            FileUploader.bind(this.$el.find('#contact-fileuploader'), attachOption);
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

        renderModify: function () {
            var contactModel;

            if (helper.isUser()) {
                this.groupInfo = PersonalGroupInfoModel.read({"groupId": this.groupId}).toJSON();
                contactModel = ContactInfoModel.read({contactId: this.contactId});
            } else if (helper.isCompany()) {
                this.groupInfo = CompanyGroupInfoModel.read({"groupId": this.groupId}).toJSON();
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
                    contactData[key] = moment(val, 'YYYY-MM-DD').format('YYYY-MM-DD');
                }

                if (key == 'description') {
                    if (typeof val === 'string' && !val) {
                        contactData[key] = null;
                    } else {
                        if (helper.isModifyMode()) {
                            val = val.replace("<br>", /(\n)/gi);
                            val = val.replace("&nbsp;", / /gi);
                        } else {
                            val = val.replace(/(\n)/gi, "<br>");
                            val = val.replace(/ /gi, "&nbsp;");
                        }
                        contactData[key] = val;
                    }
                }
            });

            var params = {
                lang: lang,
                contextRoot: App.contextRoot,
                data: contactData,
                isCompany: helper.isCompany()
            };

            if (helper.isCompany()) {
                params.companyGroup = CompanyGroupInfoModel.read({"groupId": this.groupId}).toJSON();
            } else {
                params.allGroups = GroupCollection.getCollection(this.type, this.deptId).toJSON();
            }

            this.$el.html(TplContactModify(params));
            this.$el.css('-webkit-tap-highlight-color', '');
        },

        /**
         * 툴바 및 제목 렌더링
         */
        renderToolbar: function () {
            var self = this;
            /*var toolbarOpt = {
                contentEl : this.$el,
                isPrev : true,
                name : function() {
                    if(helper.isCreateMode()) {
                        return contactLang['연락처 추가'];
                    } else {
                        return contactLang['연락처 수정'];
                    }
                },
                isLeftCancelBtn : {text : commonLang['취소']},
                rightButton : {
                    text : commonLang['확인'],
                    contextRoot : App.contextRoot,
                    callback : function() {
                        self.saveContactData(self.contactId);
                    }
                }
            };

            this.titleToolbarView.render(toolbarOpt);*/

            var toolbarOpt = {
                isClose: true,
                title: helper.isCreateMode() ? contactLang['연락처 추가'] : contactLang['연락처 수정'],
                actionMenu: [{
                    id: "contactSave",
                    text: commonLang['확인'],
                    triggerFunc: 'contact-save'
                }]
            };
            this.headerToolbarView.render(toolbarOpt);

        },
        
        saveData: function () {
            this.preventSameAction();
            this.saveContactData(this.contactId);
        },
        
        preventSameAction: function(){
            $("a[data-trigger=contact-save]").on('vclick', false);
        },
        
        expandTextarea: function (e) {
            GO.util.textAreaExpand(e);
        },

        selectGroup: function (e) {
            var id = $(e.currentTarget).val();
            if (id == 'none') {
                return true;
            }
            var name = $(e.currentTarget).find("option:selected").text();

            if (!$("#groupNameTag").find('li[data-id="' + id + '"]').length) {
                $("#groupInput").show();
                $("#groupName").hide();
                $("#groupNameTag").append('<li class="edit" data-id="' + id + '">' +
                    '<input type="hidden" name="groupId" value="' + id + '">' +
                    '<span class="name">' + name + '</span><span class="btn_wrap">' +
                    '<span class="ic ic_del" title="' + commonLang['삭제'] + '"></span></span></li>');
            } else {
                alert(commonLang["이미 선택되었습니다."]);
            }
        },


        deleteGroup: function (e) {
            $(e.currentTarget).parents('li').remove();
        },

        renderCreate: function () {
            var optionList =
                [{"value": "nickName", "name": contactLang['애칭']},
                    {"value": "birthday", "name": contactLang['생일']},
                    {"value": "anniversary", "name": contactLang['기념일']},
                    {"value": "home_tel", "name": contactLang['집 전화']},
                    {"value": "home_addr", "name": contactLang['집 주소']},
                    {"value": "home_fax", "name": contactLang['집 팩스']},
                    {"value": "home_homepage", "name": contactLang['집 홈페이지']},
                    {"value": "company_fax", "name": contactLang['회사 팩스']},
                    {"value": "company_homepage", "name": contactLang['회사 홈페이지']}];

            var params = {
                lang: lang,
                optionList: optionList,
                contextRoot: App.contextRoot,
                isMobileApp: GO.config('isMobileApp'),
                isCompany: helper.isCompany()
            };

            if (helper.isCompany()) {
                params.companyGroup = CompanyGroupInfoModel.read({"groupId": this.groupId}).toJSON();
            } else {
                params.allGroups = GroupCollection.getCollection(this.type, this.deptId).toJSON();
            }

            this.$el.html(TplContactCreate(params));
        },

        selectItem: function (e) {
            item = $(e.currentTarget).val();
            var form = this.$el.find('form[name=formContactCreate]');
            var itemEl;
            if (item == "description") {
                itemEl = form.find('textarea[name=' + item + ']');
            } else {
                itemEl = form.find('input[name=' + item + ']');
            }

            if (itemEl.parents('tr').css('display') == 'none') {
                itemEl.parents('tr').show();
                if (item == "birthday" || item == "anniversary") {
                    this.initializeDatepicker();
                }
                $(e.currentTarget).find('option[value=' + item + ']').remove();
            }
        },

        initializeDatepicker: function () {
            var birthdayDate = $("#birthdayDate");
            var anniversaryDate = $("#anniversaryDate");

            birthdayDate.datepicker({
                defaultDate: "+1w",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                //numberOfMonths: 3,
                yearSuffix: "",
            });

            anniversaryDate.datepicker({
                defaultDate: "+1w",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                //numberOfMonths: 3,
                yearSuffix: "",
            });
        },

        saveContactData: function (contactId) {

            var self = this;
            var form = this.$el.find('form[name=formContactCreate]'),
                nameEl = form.find('input[name="name"]'),
                emailEl = form.find('input[name="email"]');

            var home = {};
            var office = {};
            var groupIds = [];
            var model = null;
            function enableSaveBtn(){
                $("a[data-trigger=contact-save]").off('vclick', false);
            }

            form.find('input:focus').blur().trigger('focusout');

            if (helper.isCompany()) {
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

            } else if (helper.isUser()) {
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
                    v.value = v.value.replace(/<br>/gi, "");
                    v.value = v.value.replace(/&nbsp;/gi, "");
                    model.set(v.name, v.value, {silent: true});
                } else if (v.name == 'company_tel') {
                    office['tel'] = v.value;
                } else if (v.name == 'company_fax') {
                    office['fax'] = v.value;
                } else if (v.name == 'company_addr') {
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
                } else if (v.name == 'home_addr') {
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

            var filePath = $('#contactImage').attr('data-filepath');
            var fileName = $('#contactImage').attr('data-filename');

            if (filePath.length > 0 || fileName.length > 0) {
                model.set({
                    photo: {"filePath": filePath, "fileName": fileName}
                });
            }

            if (!_.isEmpty(_.compact(_.values(office)))) {
                model.set("office", office);
            }

            if (!_.isEmpty(_.compact(_.values(home)))) {
                model.set("home", home);
            }

            validate(model);

            model.save({}, {
                async: false,
                success: function (model, response) {
                    if (response.code == '200') {
                        $('#birthdayDate').blur();
                        $('#anniversaryDate').blur();
                        $('#birthdayDate').datepicker('hide');
                        $('#anniversaryDate').datepicker('hide');
                        window.history.back();
                    }
                },
                error: function (model, response) {
                    enableSaveBtn();
                    var result = JSON.parse(response.responseText);
                    console.error(result.message);
                }
            });

            function validate(model) {
                var invalidAction = function (msg, focusEl) {
                    alert(msg);
                    if (focusEl) {
                        focusEl.focus();
                        enableSaveBtn();
                        throw new Error("invalid params");
                    }
                };

                validateName();
                validateCompanyName();
                validateDeptName();
                validatePositionName();
                validateEmail();
                validateMobilNo();
                validateOfficeTel();
                validateOfficeBasicAddress();
                validateDescription();
                validateNickName();
                validateHome();
                validateHomeBasicAddress();
                validateHomeFax();
                validateHomeHomepage();
                validateOfficeHomepate();
                validateOfficeFax();

                function validateName() {
                    if (!$.goValidation.isCheckLength(2, 64, $.trim(model.get('name')))) {
                        invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1": "2", "arg2": "64"}), nameEl);
                    }
                }

                function validateCompanyName() {
                    if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get('companyName')))) {
                        invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                            "arg1": "0",
                            "arg2": "255"
                        }), form.find('input[name="companyName"]'));
                    }
                }

                function validateDeptName() {
                    if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get('departmentName')))) {
                        invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                            "arg1": "0",
                            "arg2": "255"
                        }), form.find('input[name="departmentName"]'));
                    }
                }

                function validatePositionName() {
                    if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get('positionName')))) {
                        invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                            "arg1": "0",
                            "arg2": "255"
                        }), form.find('input[name="positionName"]'));
                    }
                }

                function validateEmail() {
                    if (model.get('email').length > 0) {
                        if (!$.goValidation.isValidEmail(model.get('email'))) {
                            invalidAction(commonLang['이메일 형식이 올바르지 않습니다.'], emailEl);
                        }

                        if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get('email')))) {
                            invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                                "arg1": "0",
                                "arg2": "255"
                            }), emailEl);
                        }
                    }
                }

                function validateMobilNo() {
                    if (model.get('mobileNo').length > 0) {
                        if (!$.goValidation.isCheckLength(0, 40, $.trim(model.get('mobileNo')))) {
                            invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                                "arg1": "0",
                                "arg2": "40"
                            }), form.find('input[name="mobileNo"]'));
                        }
                        if (!$.goValidation.isInvalidTel(model.get('mobileNo'))) {
                            invalidAction(contactLang['번호형식이 올바르지 않습니다(-,0~9)'], form.find('input[name="mobileNo"]'));
                        }
                    }
                }

                function validateOfficeTel() {
                    if (model.get('office').tel.length > 0) {
                        if (!$.goValidation.isCheckLength(0, 40, $.trim(model.get("office").tel))) {
                            invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                                "arg1": "0",
                                "arg2": "40"
                            }), form.find('input[name="company_tel"]'));
                        }
                        if (!$.goValidation.isInvalidTel(model.get("office").tel)) {
                            invalidAction(contactLang['번호형식이 올바르지 않습니다(-,0~9)'], form.find('input[name="company_tel"]'));
                        }
                    }
                }

                function validateOfficeBasicAddress() {
                    if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get("office").basicAddress))) {
                        invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                            "arg1": "0",
                            "arg2": "255"
                        }), form.find('input[name="company_basicAddress"]'));
                    }
                }

                function validateDescription() {
                    if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get("description")))) {
                        invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                            "arg1": "0",
                            "arg2": "255"
                        }), form.find('input[name="description"]'));
                    }
                }

                function validateNickName() {
                    if (!$.goValidation.isCheckLength(0, 64, $.trim(model.get("nickName")))) {
                        invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                            "arg1": "0",
                            "arg2": "64"
                        }), form.find('input[name="nickName"]'));
                    }
                }

                function validateHome() {
                    if (model.get("home").tel.length > 0) {
                        if (!$.goValidation.isCheckLength(0, 40, $.trim(model.get("home").tel))) {
                            invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                                "arg1": "0",
                                "arg2": "40"
                            }), form.find('input[name="home_tel"]'));
                        }
                        if (!$.goValidation.isInvalidTel(model.get("home").tel)) {
                            invalidAction(contactLang['번호형식이 올바르지 않습니다(-,0~9)'], form.find('input[name="home_tel"]'));
                        }
                    }
                }

                function validateHomeBasicAddress() {
                    if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get("home").basicAddress))) {
                        invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                            "arg1": "0",
                            "arg2": "255"
                        }), form.find('input[name="home_basicAddress"]'));
                    }
                }

                function validateHomeFax() {
                    if (model.get('home').fax.length > 0) {
                        if (!$.goValidation.isCheckLength(0, 40, $.trim(model.get("home").fax))) {
                            invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                                "arg1": "0",
                                "arg2": "40"
                            }), form.find('input[name="home_fax"]'));
                        }
                        if (!$.goValidation.isInvalidTel(model.get("home").fax)) {
                            invalidAction(contactLang['번호형식이 올바르지 않습니다(-,0~9)'], form.find('input[name="home_fax"]'));
                        }
                    }
                }

                function validateHomeHomepage() {
                    if (model.get('home').homepage.length > 0) {
                        if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get("home").homepage))) {
                            invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                                "arg1": "0",
                                "arg2": "255"
                            }), form.find('input[name="home_homepage"]'));
                        }
                        if (!$.goValidation.validateURL(model.get("home").homepage)) {
                            invalidAction(contactLang['홈페이지 오류 설명'], form.find('input[name="home_homepage"]'));
                        }
                    }
                }

                function validateOfficeFax() {
                    if (model.get('office').fax.length > 0) {
                        if (!$.goValidation.isCheckLength(0, 40, $.trim(model.get("office").fax))) {
                            invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                                "arg1": "0",
                                "arg2": "40"
                            }), form.find('input[name="company_fax"]'));
                        }
                        if (!$.goValidation.isInvalidTel(model.get("office").fax)) {
                            invalidAction(contactLang['번호형식이 올바르지 않습니다(-,0~9)'], form.find('input[name="company_fax"]'));
                        }
                    }
                }

                function validateOfficeHomepate() {
                    if (model.get('office').homepage.length > 0) {
                        if (!$.goValidation.isCheckLength(0, 255, $.trim(model.get("office").homepage))) {
                            invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                                "arg1": "0",
                                "arg2": "255"
                            }), form.find('input[name="office_homepage"]'));
                        }
                        if (!$.goValidation.validateURL(model.get("office").homepage)) {
                            invalidAction(contactLang['홈페이지 오류 설명'], form.find('input[name="office_homepage"]'));
                        }
                    }
                }
            }
        },

        imageUpload: function (e) {
            var fd = new FormData(),
                $eTarget = $(e.currentTarget);
            fd.append('file', $eTarget.get(0).files[0]);
            fd.append('GOSSOcookie', $.cookie('GOSSOcookie'));
            $.ajax({
                url: GO.contextRoot + "api/file",
                type: 'POST',
                contentType: false,
                processData: false,
                data: fd,
                success: function (response) {
                    window.attachFileSuccess(response);
                }
            });
        },

    });

    return {
        render: function (options) {
            instance = new Contacts(options);
            return instance.render();

        }
    }
});
