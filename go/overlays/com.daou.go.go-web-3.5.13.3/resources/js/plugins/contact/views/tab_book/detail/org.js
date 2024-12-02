/**
 * 조직도 리스트 뷰
 */
;define(function (require) {
    var GO = require("app");
    var Backbone = require("backbone");

    var ConnectorListTpl = require("hgn!contact/templates/tab_book/connector_list");
    var ConnectorDetailTpl = require("hgn!contact/templates/tab_book/connector_detail");

    var ContactOrgMemberCollection = require("contact/collections/contacts_org_member");

    var CommonLang = require("i18n!nls/commons");
    var ContactLang = require("i18n!contact/nls/contact");
    var UserLang = require("i18n!nls/user");

    require("jquery.placeholder");
    require("jquery.go-sdk");

    var lang = {
        "all": CommonLang["전체"],
        "search": CommonLang["검색"],
        "user": CommonLang["사용자"],
        "group": CommonLang["그룹"],
        "etc": CommonLang["기타"],
        "search_null": CommonLang['검색결과없음'],
        "list_more": CommonLang['더보기'],
        "user": CommonLang['사용자'],
        'name': CommonLang['이름'],
        'dept': UserLang['부서'],
        'position': UserLang['직위'],
        'email': UserLang['이메일'],
        'company': UserLang['회사'],
        'mobileNo': ContactLang['휴대폰']
    };

    var OrgDetailView = Backbone.View.extend({
        className: "content_list",

        events: {
            "keydown #contactSearch1": "_onKeyupSearch",
            "click #contactSearch2": "_onClickSearch",
            "click .btn_list_reload": "_onClickListMore",
            "click #contactChkAll": "contactChkAll",
            "click #contactTable tr td[class!='checkbox']": "selectLow"
        },

        mode: "MAIL",

        isMailMode: function () {
            return this.mode == "MAIL";
        },

        isSMSMode: function () {
            return this.mode == "SMS";
        },

        isMailExposure: function () {
            return this.isMailMode() && GO.config('mailExposure');
        },

        initialize: function (options) {
            this.mode = _.isEmpty(options.mode) ? this.mode : options.mode;
        },

        render: function () {
            this.$el.html(ConnectorDetailTpl({
                lang: lang,
                isMailExposure: this.isMailExposure(),
                isSMSMode: this.isSMSMode()
            }));
            this._setPlaceHolder();
        },

        _setPlaceHolder: function () {
            var message = [];
            message.push(lang.name);
            message.push(lang.dept);
            this.$el.find("#contactSearch1").attr('placeholder', message);
            this.$el.find('input[placeholder], textarea[placeholder]').placeholder();
        },

        selectLow: function (e) {
            var target = $(e.currentTarget).parents('tr').first();
            var inputEl = target.find("input");
            var isChecked = inputEl.is(":checked");
            target.find('input[type=checkbox]').not('[disabled]').attr('checked', !isChecked);
        },

        contactChkAll: function (e) {
            var isChecked = $(e.currentTarget).is(':checked');
            this.$el.find("#contactTable").find('tbody input[type=checkbox]').not('[disabled]').attr('checked', isChecked);
        },

        refresh: function (options) {
            this._initListEl();
            var params = {deptId: options.deptId, deptName: options.deptName, keyword: null, page: 0};
            var collection = ContactOrgMemberCollection.getCollection(params.deptId, params.keyword, params.page);
            this._makeListEl(collection, params.deptName, params)
        },

        _makeListEl: function (collection, deptName, params) {
            var self = this;
            var tpl = ConnectorListTpl({
                data: collection.toJSON(),
                lang: lang,
                isMailExposure: this.isMailExposure(),
                isSMSMode: this.isSMSMode(),
                isCheckBoxEnable: function () {
                    if (self.isMailMode()) {
                        return true;
                    } else { //self.isSMSMode
                        return this.mobileNo;
                    }
                },
                departmentName: function () {
                    if (deptName) {
                        return deptName;
                    }

                    if (this.departments) {
                        return this.departments.join(',');
                    }

                    return "";
                },
                positionName: function () {
                    return this.position;
                }
            });

            this.$("#contactChkAll").attr("checked", false);
            var $list = this.$el.find('#contactTable tbody');
            $list.append(tpl);


            if (collection.page.lastPage || collection.page == 0) {
                $('.bottom_action').hide();
            } else {
                $('.bottom_action').show();
                var $listMore = this.$el.find('.btn_list_reload');
                $listMore.data("params", params);
            }
        },

        _onKeyupSearch: function (e) {
            if (e.keyCode == 13) {
                this._onClickSearch();
            }
        },

        _onClickSearch: function () {
            var keyword = this.$el.find('#contactSearch1').val();

            if (!keyword) {
                $.goSlideMessage(CommonLang['검색어를 입력하세요.'], 'caution');
                return;
            }

            if (!$.goValidation.isCheckLength(2, 64, keyword)) {
                $.goSlideMessage(GO.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {"arg1": "2", "arg2": "64"}), 'caution');
                return;
            }

            var params = {deptId: 0, keyword: keyword, page: 0};
            var collection = ContactOrgMemberCollection.getCollection(params.deptId, params.keyword, params.page);
            this._initListEl();
            this._makeListEl(collection, "", params);
            this.$el.find("#contactSearch1").val("");
            this.trigger("click.search");
        },

        _initListEl: function (e) {
            this.$el.find('#contactTable tbody').empty();
        },

        _onClickListMore: function (e) {
            var $listMore = $(e.currentTarget);
            var params = $listMore.data("params");
            params.page = params.page + 1;

            var collection = ContactOrgMemberCollection.getCollection(params.deptId, params.keyword, params.page);
            this._makeListEl(collection, params.deptName, params)
        },

        getSelectedUsers: function () {
            var $selectedEls = this.$el.find("#contactTable tbody input[type='checkbox']:checked");

            if ($selectedEls.length == 0) {
                throw new Error("not select users");
            }

            var selectedDataArr = [];
            $.each($selectedEls, function () {
                var $selectedEl = $(this);

                if ($selectedEl.data("nodetype") == "department") {
                    return;
                }

                var data = {
                    name: $selectedEl.data("name"),
                    email: $selectedEl.data("email"),
                    deptName: $selectedEl.data("deptname"),
                    position: $selectedEl.data("position"),
                    mobileNo: $selectedEl.data("mobileno")
                };

                selectedDataArr.push(data);
            });

            return selectedDataArr;
        },

        getSelectedGroup: function () {
            // TODO : SEARCH 모드가 아닐 경우 validate

            var $selectedGroups = this.$el.find('tbody input[data-nodetype="department"][type="checkbox"]:checked');

            if ($selectedGroups.length == 0) {
                return {};
            }

            var data = [];

            $.each($selectedGroups, function () {
                var deptId = $(this).data('id');
                var deptName = $(this).data('name');
                data.push({
                    dataId: deptId,
                    dataName: deptName
                })
            });

            return {
                data: data,
                groupType: "ORG"
            }
        }
    });

    return OrgDetailView;
});
