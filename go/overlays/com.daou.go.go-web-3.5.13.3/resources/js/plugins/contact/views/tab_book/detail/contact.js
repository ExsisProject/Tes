/**
 * 주소록 리스트 뷰
 */
define(function (require) {
    var GO = require("app");
    var Backbone = require("backbone");

    var ConnectorListTpl = require("hgn!contact/templates/tab_book/connector_list");
    var ConnectorDetailTpl = require("hgn!contact/templates/tab_book/connector_detail");

    var ContactCollection = require("contact/collections/contacts");
    var ContactSearchCollection = require("contact/collections/search_contact");

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

    var ContactDetailView = Backbone.View.extend({
        className: "content_list",

        events: {
            "keydown #contactSearch1": "_onKeyupSearch",
            "click #contactSearch2": "_onClickSearch",
            "click .btn_list_reload": "_onClickListMore",
            "click #contactChkAll": "contactChkAll",
            "click #contactTable tr td[class!='checkbox']": "selectLow"
        },

        mode : "MAIL",
        
        LIST_TYPE : {
            "LIST" : "LIST",
            "SEARCH" : "SEARCH"
        },

        isMailMode : function(){
            return this.mode == "MAIL";
        },

        isSMSMode : function(){
            return this.mode == "SMS";
        },

        isDept: function () {
            return this.type == "DEPARTMENT";
        },

        initialize: function (options) {
            this.mode = options.mode;
            this.type = options.type;
            this.groupId = options.groupId;
            this.deptId = options.deptId;
        },

        render: function () {
            this.$el.html(ConnectorDetailTpl({
                lang: lang,
                isMailExposure : this.isMailMode(),
                isSMSMode : this.isSMSMode()
            }));

            this._setPlaceHolder();
        },

        _setPlaceHolder: function () {
            var message = [];
            message.push(lang.name);

            if(this.isMailMode()){
                message.push(lang.email);
            }else{
                message.push(lang.mobileNo);
            }

            message.push(lang.company);
            this.$el.find("#contactSearch1").attr('placeholder', message);
            this.$el.find('input[placeholder], textarea[placeholder]').placeholder();
        },

        refresh: function (options) {
            this._renderList(options);
        },

        _renderList: function (options) {

            this.type = _.isUndefined(options.type) ? this.type : options.type;
            this.groupId = _.isUndefined(options.groupId) ? this.groupId : options.groupId;
            this.initial = _.isUndefined(options.initial) ? this.initial : options.initial;
            this.deptId = _.isUndefined(options.deptId) ? this.deptId : options.deptId;

            var params = {};
            params["type"] = this.type;
            params["groupId"] = this.groupId;
            params["initialConsonantPattern"] = this.initial;

            if (this.isDept()) {
                params["deptId"] = this.deptId;
            }

            empty.call(this);

            var collection = new ContactCollection();
            collection.findAll(params);
            
            params["list-type"] = this.LIST_TYPE.LIST;

            this._makeListEl(collection, params);

            function empty() {
                this.$el.find('#contactTable tbody').empty();
            }
        },

        /**
         * 목록 화면을 작성
         * @param collection : 데이터
         * @param params : 더보기 버튼 구현에서 사용될 param
         * @param listType : 현재 리스트의 타입을 저장. 더보기 구현시 사용.
         * @private
         */
        _makeListEl: function (collection, params) {
            var self = this;
            var tpl = ConnectorListTpl({
                data: collection.toJSON(),
                lang: lang,
                isMailExposure: this.isMailMode(),
                isSMSMode: this.isSMSMode(),
                isCheckBoxEnable: function () {
                    if (self.isMailMode()) {
                        return this.email.length ? true : false;
                    } else { //self.isSMSMode()
                        return this.nodeType == "department" || this.mobileNo.length;
                    }
                }
            });

            var $list = this.$el.find('#contactTable tbody');
            $list.append(tpl);
            this.$el.find("#contactChkAll").attr('checked', false);
            if (collection.page.lastPage) {
                this.$el.find('.bottom_action').hide();
            } else {
                this.$el.find('.bottom_action').show();
                var $listMore = this.$el.find('.btn_list_reload');
                $listMore.data("list-type", params["list-type"]);
                $listMore.data("page", collection.page.page);
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

            var collection = new ContactSearchCollection();
            var params = {ownerType: this.type, keyword: keyword};
            if (this.isDept()) {
                params["deptId"] = this.deptId;
            }
            collection.search(params);
            this._initListEl();
            params["list-type"] = this.LIST_TYPE.SEARCH;
            this._makeListEl(collection, params);
            this.$el.find("#contactSearch1").val("");

            this.trigger("detail.search");
        },

        _initListEl: function (e) {
            this.$el.find('#contactTable tbody').empty();
        },

        _onClickListMore: function (e) {
            var $listMore = $(e.currentTarget);
            var listType = $listMore.data("list-type");
            var page = $listMore.data("page");
            var params = $listMore.data("params");
            var collection;

            params.page = page + 1;
            
            params["list-type"] = listType;
            
            if(this.LIST_TYPE.LIST == listType){
                collection = new ContactCollection();
                collection.findAll(params);
            }else{  // this.LIST_TYPE.SEARCH
                collection = new ContactSearchCollection();
                collection.search(params);
            }

            this._makeListEl(collection, params);
        },

        contactChkAll: function (e) {
            var isChecked = $(e.currentTarget).is(':checked');
            this.$el.find("#contactTable").find('tbody input[type=checkbox]').not('[disabled]').attr('checked', isChecked);
        },

        selectLow: function (e) {
            var target = $(e.currentTarget).parents('tr').first();
            var inputEl = target.find("input");
            var isChecked = inputEl.is(":checked");
            target.find('input[type=checkbox]').not('[disabled]').attr('checked', !isChecked);
        },

        /**
         * 체크박스 선택된 사용자
         * @returns {Array} :
         * {
             *      name : 이름,
             *      email : 이메일,
             *      deptName : 부서이름,
             *      position : 직위
             * }
         */
        getSelectedUsers: function () {
            var $selectedEls = this.$el.find("#contactTable tbody input[type='checkbox']:checked");

            if ($selectedEls.length == 0) {
                throw new Error("not select users");
            }

            var selectedDataArr = [];
            $.each($selectedEls, function () {
                var $selectedEl = $(this);

                var selectedData = {
                    name: $selectedEl.data("name"),
                    email: $selectedEl.data("email"),
                    deptName: $selectedEl.data("deptname"),
                    position: $selectedEl.data("position"),
                    mobileNo: $selectedEl.data("mobileno")
                };

                selectedDataArr.push(selectedData);
            });

            return selectedDataArr;
        }
    });

    return ContactDetailView;
});