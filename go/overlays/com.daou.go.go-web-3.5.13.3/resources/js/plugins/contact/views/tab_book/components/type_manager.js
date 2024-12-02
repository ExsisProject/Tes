define("contact/views/tab_book/components/type_manager", function (require) {
    var Amplify = require("amplify");
    var ProfileCardView = require("models/profile_card");
    var ContactLang = require("i18n!contact/nls/contact");
    var CommonLang = require("i18n!nls/commons");
    var GO = require("app");

    var lang = {
        "private_contact": ContactLang["개인 주소록"],
        "public_contact": ContactLang["전사 주소록"],
        "dept_contact": ContactLang["부서 주소록"],
        "organization": ContactLang['조직도'],
        "search": CommonLang["검색"],
        "user" : CommonLang["사용자"]
    };

    var TypeManager = function (options) {
        this.localStorageKey = options.localStorageKey;
        this.tabMenus = [];

        this.tabMenus.push({type: "USER", name: lang.private_contact});

        if (this.hasDepartment()) {
            this.tabMenus.push({type: "DEPARTMENT", name: lang.dept_contact});
        }

        // company 그룹이 있을 경우에만 노출
        if (this.hasCompanyGroups()) {
            this.tabMenus.push({type: "COMPANY", name: lang.public_contact});
        }

        if (GO.session('useOrgAccess') === false) {
            this.tabMenus.push({type: "USERSEARCH", name: lang.user + lang.search});
        } else {
            this.tabMenus.push({type: "ORG", name: lang.organization});
        }
    };

    TypeManager.prototype.hasDepartment = function () {
        return ProfileCardView.get(GO.session().id).hasDepartment();
    };

    TypeManager.prototype.hasCompanyGroups = function () {
        var isExistGroups = false;
        $.ajax({
            type: "GET",
            async: false,
            dataType: "json",
            url: GO.contextRoot + "api/contact/company/group/exist",
            success: function (resp) {
                if (resp.data) {
                    isExistGroups = true;
                }
            },
            error: function (resp) {
                $.goError(resp.responseJSON.message);
            }
        });

        return isExistGroups;
    };

    TypeManager.prototype.getMenus = function () {
        return this.tabMenus;
    };

    TypeManager.prototype.getType = function () {
        var initType = Amplify.store(this.localStorageKey);

        // 초기 값이 없거나 선택했던 탭의 조건이 변경되어 없어질 경우
        if (hasNotInitMenu.call(this)) {
            initType = "USER";
        }

        return initType;

        function hasNotInitMenu() {
            return _.isUndefined(initType) || _.isEmpty(_.findWhere(this.tabMenus, {type: initType}));
        }
    };

    TypeManager.prototype.saveType = function(type){
        Amplify.store(this.localStorageKey, type, {type: null});
    };

    return TypeManager;
});