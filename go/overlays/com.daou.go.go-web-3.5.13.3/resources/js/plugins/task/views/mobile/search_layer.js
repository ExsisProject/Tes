(function () {
    define(function (require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            commonLang = require("i18n!nls/commons"),
            SearchLayerTpl = require("hgn!task/templates/mobile/search_layer"),
            SearchHeader = require("views/mobile/m_search_header"),
            SearchResultView = require("task/views/mobile/search_result");

        require("GO.util");

        var instance = null;

        var lang = {
            '검색 조건': commonLang['검색 조건'],
            '전체': commonLang['전체'],
            '검색': commonLang['검색']
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
                var searchText = $.trim($('#commonSearchInput').val());
                if (!GO.util.isValidSearchText(searchText)) {
                    return;
                }

                var searchOption = {
                    stype: 'simple',
                    keyword: searchText
                };
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