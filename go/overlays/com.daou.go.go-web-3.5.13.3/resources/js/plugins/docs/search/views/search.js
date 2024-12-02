define('docs/search/views/search', function (require) {

    var commonLang = require('i18n!nls/commons');
    var lang = {
        '검색결과': commonLang['검색결과'],
        '검색어': commonLang['검색어']
    };

    var SearchResult = require('docs/search/models/search');
    var DefaultLayout = require("views/layouts/default");
    var ContentTopView = require('docs/views/content_top');
    var DocsSearchView = require('dashboard/views/search/docs_search');
    var BaseDocsView = require("docs/views/base_docs");

    var Template = require('hgn!docs/search/templates/search');

    return BaseDocsView.extend({

        className: '',

        initialize: function () {
        	BaseDocsView.prototype.initialize.apply(this, arguments);
        	
            this.result = new SearchResult();
            this.listenTo(this.result, 'sync', this._onSyncResult);
            this.collection = this.result.getCollection();

            this.param = GO.router.getSearch();
            this.result.setParam(this.param);

            this.layoutView = DefaultLayout.create();
        },

        render: function () {
        	BaseDocsView.prototype.render.apply(this, arguments);
        	
        	$(".content_top h1").text(commonLang['검색결과']);
        	
            this._renderLayout.call(this);
            this.$el.html(Template({
            	lang: lang
        	}));

/*			var contentTopView = new ContentTopView({});

			contentTopView.setElement(this.$('header'));
            contentTopView.render();
            contentTopView.setTitle(commonLang['검색결과']);
            
            this.sideView = new HomeSide({});
            this.layoutView.getSideElement().empty().append(this.sideView.el);
            this.sideView.render();*/

            this._renderContents();

            return this;
        },

        _renderLayout: function() {
            this.layoutView.render().done($.proxy(function() {
                this.layoutView.setContent(this);
            }, this));
        },

        _renderContents: function() {
            var docsSearchView = new DocsSearchView({
                model: this.result,
                collection: this.collection,
                type: 'simple'
            });
            
            this.$('.content_page').html(docsSearchView.render().el);
        },
        
        _onSyncResult: function() {
            $(window).scrollTop(this.$el.offset().top);
        }
    });
});