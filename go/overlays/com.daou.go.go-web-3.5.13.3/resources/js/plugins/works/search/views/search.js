define('works/search/views/search', function (require) {

    var commonLang = require('i18n!nls/commons');
    var lang = {
        '검색결과': commonLang['검색결과'],
        '검색어': commonLang['검색어']
    };

    var SearchResult = require('works/search/models/search');

    var WorksHomeLayout = require('works/views/app/home/works_home_layout');
    var ContentTopView = require('works/views/app/layout/content_top');
    var WorksSearchView = require('dashboard/views/search/works_search');

    var Template = require('hgn!works/search/templates/search');

    return Backbone.View.extend({

        className: 'go_content',

        initialize: function () {
            this.result = new SearchResult();
            this.listenTo(this.result, 'sync', this._onSyncResult);
            this.collection = this.result.getCollection();

            this.param = GO.router.getSearch();
            this.result.setParam(this.param);

            this.layoutView = WorksHomeLayout.create();
        },

        render: function () {
            this._renderLayout.call(this);

            this.$el.html(Template({lang: lang}));
            var contentTopView = new ContentTopView();
            contentTopView.setElement(this.$('header'));
            contentTopView.render();
            contentTopView.setTitle(commonLang['검색결과']);

            this._renderContents();

            return this;
        },

        _renderLayout: function() {
            this.layoutView.render().done($.proxy(function() {
                this.layoutView.setContent(this);
                this.layoutView.$el.addClass('go_full_screen');
            }, this));
        },

        _renderContents: function() {
            var worksSearchView = new WorksSearchView({
                model: this.result,
                collection: this.collection,
                type: 'detail'
            });
            this.$('.content_page').html(worksSearchView.render().el);
        },

        _onSyncResult: function() {
            $(window).scrollTop(this.$el.offset().top);
        }
    });
});