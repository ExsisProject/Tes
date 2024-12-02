(function () {
    define(function (require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            GO = require('app'),
            commonLang = require("i18n!nls/commons"),
            adminLang = require("i18n!admin/nls/admin"),
            calendarLang = require("i18n!calendar/nls/calendar"),
            SearchLayerTpl = require("hgn!calendar/templates/mobile/m_search_layer"),
            SearchHeader = require("views/mobile/m_search_header"),
            SearchResultView = require("calendar/views/mobile/m_search_result_new");

        require("GO.util");

        var instance = null;

        var lang = {
            '검색 조건': commonLang['검색 조건'],
            '전체': commonLang['전체'],
            '검색': commonLang['검색'],
            '초기화': adminLang['초기화'],
            '검색어': commonLang['검색어'],
            '일정명': calendarLang['일정명'],
            '참석자': calendarLang['참석자'],
            '검색 키워드를 입력하세요': commonLang['검색 키워드를 입력하세요.'],
            '검색어를 입력하세요': commonLang['검색어를 입력하세요.']
        };
        var SearchLayer = Backbone.View.extend({
            el: '#goSearch',
            events: {
                'vclick a[data-search]': '_simpleSearch'
            },
            initialize: function (options) {
                this.$el.off();
                this.packageName = options.packageName;
            },
            render: function () {
                this.$el.html(SearchLayerTpl({
                    lang: lang
                }));
                this._renderSearchHeader();
                return this.el;
            },
            _renderSearchHeader: function () {
                var _this = this;
                SearchHeader.render({
                    enterSimpleSearchCallback: function (e) {
                        _this._simpleSearch(e);
                    },
                    useDetailSearch: false
                });
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
                    type: 'all',
                    page: 0,
                    offset: 15
                };

                if (searchData == "all") {
                    searchOption['stype'] = 'simple';
                    searchOption['keyword'] = searchText;
                } else {
                    searchOption['stype'] = 'detail';
                    searchOption[searchData] = searchText;
                    searchOption['attendees'] = '',
                        searchOption['fromDate'] = '',
                        searchOption['toDate'] = ''
                }
                SearchResultView.render(searchOption);
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
