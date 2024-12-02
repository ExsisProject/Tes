define('docs/search/views/mobile/search', function (require) {

    var commonLang = require('i18n!nls/commons');
    var lang = {
        '검색결과': commonLang['검색결과'],
        '검색어': commonLang['검색어']
    };

    var SearchResult = require('docs/search/models/search');

    var SearchContentView = require('docs/search/views/search_content');
    var PaginationView = require('views/mobile/pagination');

    var Template = require('hgn!docs/search/templates/mobile/search');

    return Backbone.View.extend({

        className: 'go_content',

        events: {
            'vclick .ic_nav_prev': '_onClickBack'
        },

        initialize: function () {
            this.result = new SearchResult();
            this.collection = this.result.getCollection();

            this.param = GO.router.getSearch();
            this.result.setParam(this.param);

            this.listenTo(this.result, 'sync', this._renderContents);
            this.result.fetch();
        },

        render: function () {
            this.$el.html(Template({
                lang: lang,
                keyword: this.result.keyword
            }));

            return this;
        },

        _renderContents: function() {
            var contentView = new SearchContentView({model: this.result});
            this.$('[data-el-content]').html(contentView.render().el);

            var paginationView = new PaginationView({
                pageInfo: this.collection.pageInfo(),
                collection: this.collection
            });
            this.$('[data-el-paging]').html(paginationView.render().el);
        },

        _onClickBack: function() {
            window.history.back();
        }
    });
});