(function () {
    define(function (require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            commonLang = require("i18n!nls/commons"),
            worksLang = require("i18n!works/nls/works"),
            adminLang = require("i18n!admin/nls/admin"),
            SearchLayerTpl = require("hgn!works/search/templates/mobile/search_layer"),
            SearchResultView = require("works/search/views/mobile/search_result"),
            SearchHeader = require("views/mobile/m_search_header"),
            AppList = require("works/collections/applet_simples");

        require("GO.util");

        var instance = null;

        var lang = {
            '전체': commonLang['전체'],
            '검색': commonLang['검색'],
            '검색 조건': commonLang['검색 조건'],
            '등록자': worksLang['등록자'],
            '텍스트': worksLang['텍스트'],
            '활동기록': worksLang['활동기록'],
            '본문': commonLang['본문'],
            '댓글': commonLang['댓글'],
            '첨부파일': commonLang['첨부파일'],
            '첨부파일명': commonLang['첨부파일명'],
            '앱명': worksLang['앱명'],
            '초기화': adminLang['초기화'],
            '검색어': commonLang['검색어'],
            '검색 키워드를 입력하세요': commonLang['검색 키워드를 입력하세요.'],
            '직접입력': adminLang['직접입력'],
            '검색할앱명입력': worksLang['앱 명을 입력하세요.']
        };

        var AppListView = Hogan.compile(
            '<option value="{{data.id}}">{{data.name}}</option>'
        );

        var SearchLayer = Backbone.View.extend({

            el: '#goSearch',
            events: {
                'vclick #searchInit': '_detailSearchInit',
                'vclick a[data-search]': '_simpleSearch',
                'keyup #detailSearchWrap input': '_detailSearch',
                'change #appType': '_toggleAppType'
            },
            initialize: function (options) {
                this.$el.off();
                this.appList = new AppList();
            },
            render: function () {
                this.$el.html(SearchLayerTpl({
                    lang: lang
                }));
                this._renderSearchHeader();
                this._renderAppList();
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
            _renderAppList: function () {
                this.appList.fetch({
                    success: function (collection) {
                        collection.each(function (model) {
                            $("#appList").append(AppListView.render({
                                data: model.toJSON()
                            }));
                        });
                    }
                });
            },
            _detailSearchInit: function (e) {
                e.preventDefault();
                $("#detailSearchWrap input[type=search], #detailSearchWrap input[type=checkbox]").prop("checked", false).val('');
                $("#detailSearchWrap select").prop('selectedIndex', 0);
            },
            _detailSearch: function (e) {
                if (e.keyCode != 13) {
                    return;
                }
                var authorName = $.trim(this.$('#authorName').val());
                var keyword = $.trim(this.$('#keyword').val());
                var inputData = [{data: authorName, id: 'authorName'}, {data: keyword, id: 'keyword'}];

                var isAppNameSearch = this.$('#appType').val() == 'directInput';
                var appName = isAppNameSearch ? $.trim(this.$('#appName').val()) : '';
                if (this.$('#appType').val() == 'directInput') {
                    if (appName == '') {
                        alert(lang['검색할앱명입력']);
                        return;
                    }
                }

                if (GO.util.isAllEmptySearchText(inputData) || keyword == "") {
                    alert(lang['검색 키워드를 입력하세요']);
                    return;
                }
                if (!GO.util.isValidForSearchTextWithCheckbox("keyword")) {
                    return;
                }
                if (!GO.util.isValidSearchTextForDetail(inputData)) {
                    return;
                }

                var searchOption = {
                    offset: '20',
                    page: '0',
                    appletId: this.$("#appList option:selected").val(),
                    keyword: keyword,
                    authorName: $.trim(this.$('#authorName').val()),
                    content: this.$('input[name="text"]').is(':checked'),
                    comments: this.$('input[name="comment"]').is(':checked'),
                    attachFileNames: this.$('input[name="attach"]').is(':checked'),
                    activityContents: this.$('input[name="activity"]').is(':checked'),
                    attachFileContents: this.$('input[name="attach"]').is(':checked'),
                    appletName: appName
                };
                var result = {};
                Object.keys(searchOption).forEach(function (key) {
                    if (searchOption[key] !== "")
                        result[key] = searchOption[key];
                });
                SearchResultView.render(result);
            },
            _simpleSearch: function (e) {
                e.preventDefault();
                var searchText = $.trim($('#commonSearchInput').val());
                if (!GO.util.isValidSearchText(searchText)) {
                    return;
                }

                var searchOption = {
                    keyword: searchText,
                    content: true,
                    page: 0,
                    offset: 15
                };
                SearchResultView.render(searchOption);
            },
            _toggleAppType: function (e) {
                var appType = $(e.currentTarget).val();
                if (appType == 'directInput') {
                    this.$('#appList').hide();
                    this.$('#appName').show();
                } else {
                    this.$('#appList').show();
                    this.$('#appName').hide();
                }
            },
        });

        return {
            render: function (options) {
                instance = new SearchLayer(options);
                return instance.render();
            }
        };
    });

}).call(this);
