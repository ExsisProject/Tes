(function () {
    define(function (require) {

        var $ = require("jquery");
        var Backbone = require("backbone");
        var App = require("app");
        var commonLang = require("i18n!nls/commons");
        var contactLang = require("i18n!contact/nls/contact");
        var adminLang = require("i18n!admin/nls/admin");
        var searchLayerTpl = require("hgn!contact/templates/mobile/m_search_layer");
        var resultPage = require("contact/views/mobile/m_search_result");
        var SearchHeader = require("views/mobile/m_search_header");
        var JoinedDepts = require("collections/joined_depts");
        require("GO.util");

        var instance = null;

        var lang = {
            '검색 조건': commonLang['검색 조건'],
            '전체': commonLang['전체'],
            '검색': commonLang['검색'],
            '이름(표시명)': contactLang['이름(표시명)'],
            '이메일': commonLang['이메일'],
            '휴대폰': contactLang['휴대폰'],
            '개인주소록': contactLang['개인 주소록'],
            '공용주소록': contactLang['공용 주소록'],
            '부서주소록': contactLang['부서 주소록'],
            '회사': contactLang['회사'],
            '회사전화': contactLang['회사전화'],
            '초기화': adminLang['초기화'],
            '주소록 구분': contactLang['주소록 구분'],
            '검색 키워드를 입력하세요': commonLang['검색 키워드를 입력하세요.']
        };

        var SearchLayer = Backbone.View.extend({

            el: '#goSearch',
            events: {
                'vclick #searchInit': '_detailSearchInit',
                'vclick a[data-search]': '_simpleSearch',
                'keyup #detailSearchWrap input': '_detailSearch',
                "change #searchType": "_searchAddrType"
            },
            initialize: function (options) {
                this.$el.off();
                this.joinedDepts = JoinedDepts.fetch();
            },
            render: function () {
                this.$el.html(searchLayerTpl({
                    lang: lang,
                    depts: this.joinedDepts.toJSON()
                }));
                this._renderSearchHeader();
                return this.el;
            },
            _renderSearchHeader: function () {
                var _this = this;
                SearchHeader.render({
                    enterSimpleSearchCallback: function (e) {
                        _this._simpleSearch(e);
                    }
                });
            },
            _detailSearchInit: function (e) {
                e.preventDefault();
                $("#detailSearchWrap input").val('');
            },
            _detailSearch: function (e) {
                if (e.keyCode != 13) {
                    return;
                }
                var searchOption = {
                    collectionType: 'search',
                    ownerType: $('#searchType').val(),
                    date: App.util.toISO8601(new Date()),
                    offset: '20',
                    page: '0',
                    property: 'nameInitialConsonant',
                    direction: 'asc',
                    searchType: 'and'
                };

                var name = $.trim($('#addrName').val());
                var email = $.trim($('#addrEmail').val());
                var mobileNo = $.trim($('#addrMobileNo').val());
                var companyName = $.trim($('#addrCompanyName').val());
                var officeTel = $.trim($('#addrOfficeTel').val());
                var inputData = [{data: name, id: 'addrName'}, {data: email, id: 'addrEmail'},
                    {data: mobileNo, id: 'addrMobileNo'}, {data: companyName, id: 'addrCompanyName'},
                    {data: officeTel, id: 'addrOfficeTel'}];

                if(GO.util.isAllEmptySearchText(inputData)){
                    alert(lang['검색 키워드를 입력하세요']);
                    return;
                }
                if (!GO.util.isValidSearchTextForDetail(inputData)) {
                    return;
                }

                searchOption = $.extend(searchOption, {
                    name: name,
                    email: email,
                    mobileNo: mobileNo,
                    companyName: companyName,
                    officeTel: officeTel,
                });

                if (searchOption["ownerType"] == "DEPARTMENT") {
                    searchOption["deptId"] = $("#deptList").val();
                }

                var result = {};
                Object.keys(searchOption).forEach(function (key) {
                    if (searchOption[key] != "")
                        result[key] = searchOption[key];
                });
                resultPage.render(result);
            },

            _simpleSearch: function (e) {
                e.preventDefault();
                var $target = $(e.currentTarget);

                var searchText = $.trim($('#commonSearchInput').val());
                if (!GO.util.isValidSearchText(searchText)) {
                    return;
                }

                var searchData = $target.attr('data-search') || "all";
                var searchOption = {
                    collectionType: 'search',
                    date: App.util.toISO8601(new Date()),
                    offset: '20',
                    page: '0',
                    property: 'nameInitialConsonant',
                    direction: 'asc'
                };

                var searchType = GO.router.getUrl().split("/")[1];
                if (searchType === "personal") {
                    searchOption['ownerType'] = 'user';
                } else if (searchType === "dept") {
                    searchOption['ownerType'] = 'department';
                    searchOption['deptId'] = GO.router.getUrl().split("/")[2];
                } else if (searchType === "company") {
                    searchOption['ownerType'] = 'company';
                }

                if (searchData == "all") {
                    searchOption = $.extend(searchOption, {
                        searchData: "all",
                        name: searchText,
                        keyword: searchText,
                        email: searchText,
                        mobileNo: searchText,
                        companyName: searchText,
                        officeTel: searchText,
                        searchType: 'or'
                    });
                } else {
                    searchOption[searchData] = searchText;
                    searchOption['searchType'] = 'and';
                }
                resultPage.render(searchOption);
            },
            _searchAddrType: function (e) {
                var $target = $(e.currentTarget);
                if ($target.val() == "DEPARTMENT") {
                    this.$el.find("#deptList").show();
                } else {
                    this.$el.find("#deptList").hide();
                }
            }
        });
        return {
            render: function (options) {
                instance = new SearchLayer(options);
                return instance.render();
            }
        };
    });

}).call(this);