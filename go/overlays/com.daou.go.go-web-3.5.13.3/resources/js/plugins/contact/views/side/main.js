define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");

    var SideTpl = require("hgn!contact/templates/side");
    var CommonLang = require("i18n!nls/commons");
    var ContactLang = require("i18n!contact/nls/contact");

    var ContactSideModel = require("contact/models/contact_side");

    var UserSideView = require('contact/views/side/groups/user');
    var DeptsSideView = require('contact/views/side/groups/department');
    var CompanySideView = require('contact/views/side/groups/company');

    require("jquery.go-popup");
    require("jquery.go-validation");

    var lang = {
        'USER': ContactLang['개인 주소록'],
        'COMPANY': ContactLang['전사 주소록'],
        'DEPARTMENT': ContactLang["부서 주소록"],
        'contact_group': ContactLang['주소록 그룹'],
        'group_add': ContactLang['연락처 그룹 추가'],
        'contact_add': ContactLang['연락처 주소록 추가'],
        'contact_all': ContactLang['전체 주소록'],
        'contact_manage': ContactLang['주소록 관리'],
        'group_manage': ContactLang['그룹관리'],
        'fold': CommonLang['접기'],
        'open': CommonLang["펼치기"],
        'new_contact': ContactLang['새 연락처'],
        'contact': ContactLang['주소록'],
        'delete_contact': ContactLang["주소록 삭제"]
    };

    var instance = null;

    /**
     * 화면에서 사용하기 위한 용도.
     * Server 와의 통신은 없음
     */
    var TYPE = {
        isCompany: function (value) {
            return value == "COMPANY";
        },

        isUser: function (value) {
            return value == "USER";
        },

        isDept: function (value) {
            return value == "DEPARTMENT";
        }
    };

    var URL_TO_TYPE = {
        "personal": "USER",
        "company": "COMPANY",
        "dept": "DEPARTMENT"
    };

    // MAIN VIEW
    var SideView = Backbone.View.extend({

        STORE_KEY: {
            "DEPARTMENT": GO.session("loginId") + '-contact-department-toggle',
            "COMPANY": GO.session("loginId") + '-contact-company-toggle',
            "USER": GO.session("loginId") + '-contact-personal-toggle'
        },

        el: '#side',

        events: {
            "click #contactCreate": "contactCreate",
            "click .side_toggle": "slideContactToggle",
            "click .user_contact": "getUserContact",
            "click .company_contact": "getCompanyContact",
        },

        initialize: function () {
            this.$el.off();
            GO.EventEmitter.on('contact', 'changed:sideGroups', function () {
                this.contactSide = ContactSideModel.read();
                this._renderGroups();
                this._selectSideMenu();
            }, this);
            this.contactSide = ContactSideModel.read();
        },

        render: function () {
            this._renderGroups();
            this._selectSideMenu();
        },

        _renderGroups: function () {
            var tmpl = SideTpl({
                lang: lang,
                appName: GO.util.getAppName("contact"),
                contextRoot: GO.config("contextRoot")
            });

            this.$el.html(tmpl);

            var renderCallback = {
                "USER": $.proxy(renderUserSide, this),
                "DEPARTMENT": $.proxy(renderDeptSide, this),
                "COMPANY": $.proxy(renderCompanySide, this)
            };

            // 우선순위별 side render
            this.contactSide.get("priority").priorityTypes.forEach(function (type) {
                renderCallback[type]();
            });

            function renderUserSide() {
                var userSideView = new UserSideView({collection: this.contactSide.getPersonalGroups()});
                this.$el.append(userSideView.el);
                userSideView.render();
            }

            function renderDeptSide() {
                var collection = this.contactSide.getDeptGroups();

                if(collection.isEmpty()){
                    return;
                }

                var deptsSideView = new DeptsSideView({collection: this.contactSide.getDeptGroups()});
                this.$el.append(deptsSideView.el);
                deptsSideView.render();
            }

            function renderCompanySide() {
                var collection = this.contactSide.getCompanyGroups();

                if (!this.contactSide.isAdmin() && collection.isEmpty()) {
                    return;
                }

                var companySideView = new CompanySideView({
                    collection: collection,
                    isManager: this.contactSide.get("admin")
                });
                this.$el.append(companySideView.el);
                companySideView.render();
            }
        },

        contactCreate: function () {
            App.router.navigate('contact/create', {trigger: true, pushState: true});
        },

        // TODO : 선택하는 부분 처리 필요.
        _selectSideMenu: function () {
            var menuArr = App.router.getUrl().split('?'),
                loadMenuArr = menuArr[0].split('/'),
                type = URL_TO_TYPE[loadMenuArr[1]];

            this.$el.find("p.title").removeClass('on');

            // 초기 진입시 우선순위에 따라 상위에 있는 그룹 선택
            if (App.router.getUrl() == 'contact') {
                this.$el.find("section.lnb:first li.group:first p.title").addClass("on");
                return;
            }

            if (App.router.getUrl() == 'contact/create') {
                this.$el.find("section.lnb[data-type='USER'] li.group:first p.title").addClass("on");
                return;
            }

            var groupId = function () {
                if (TYPE.isDept(type)) {
                    if (loadMenuArr[3] == 'modify') {
                        return "";
                    } else {
                        return loadMenuArr[4];
                    }
                } else {
                    return loadMenuArr[2];
                }
            }();

            if (groupId) {
                this.$el.find("[data-id=" + groupId + "]>p.title").addClass("on");
                return;
            }

            if (TYPE.isDept(type)) {
                var deptId = loadMenuArr[2];
                var $dept = this.$el.find("section.lnb[data-type='DEPARTMENT']");
                $dept.find("[data-dept-id=" + deptId + "] li.group:first>p.title").addClass("on");
                return;
            } else if (TYPE.isUser(type)) {
                this.$el.find("section.lnb[data-type='USER'] ul.side_depth li:first>p.title").addClass("on");
            }
        },

        /**
         * home 부분에서 사용할 param을 정의 합니다.
         */
        getInitParam: function () {
            return this.contactSide.getInitMenu();
        }

    }, {

        create: function () {
            if (instance === null) instance = new layoutView();
            return instance.render();
        }

    });

    return SideView;
});