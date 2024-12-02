define([
    "backbone",
    "hogan",
    "app",

    "hgn!dashboard/templates/search/works_search",
    "hgn!works/search/templates/result_item",

    "collections/paginated_collection",
    'works/search/models/search',

    "dashboard/views/search/search_form",
    "dashboard/views/search/no_search_result",
    'works/search/views/search_content',

    "i18n!nls/commons",
    "GO.util"
],
function(
    Backbone,
    Hogan,
    App,

    WorksSeachTmpl,
    ResultItemTemplate,

    PaginatedCollection,
    WorksSearch,

    SearchForm,
    NosearchResult,
    SearchContentView,

    commonLang
) {

    return SearchForm.extend({

        events : {
            "click #btn_more" : "showMore"
        },

        initialize : function(options) {
            options = options || {};
            this.param = GO.router.getSearch();
            this.type = options.type || this.param.appName === 'works' ? 'detail' : 'simple';

            this.model = this.model || new WorksSearch();
            this.collection = this.collection || this.model.getCollection();
            this.listenTo(this.model, 'sync', this._onSync);
            this.model.setParam(this.param);
            this.model.fetch({
                statusCode: {
                    403: function() { GO.util.error('403'); },
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    500: function() { GO.util.error('500'); }
                }
            });
        },

        render : function() {
            if (this.type === 'detail') {
                var searchList =
                    '<div data-el-search-wrapper></div>' +
                    '<div class="tool_bar tool_absolute">' +
                    '<div class="dataTables_length"></div>' +
                    '</div>';
                this.$el.append(searchList);
            }
            return this;
        },
        showMore : function() {
            this.param.appName = "works";
            this.showAppSearchMore(this.param);
        },
        getSearchTotalCount : function(){
            return 0;
        },
        _onSync: function() {
            if (this.type === 'detail') {
                if (this.collection.total == 0) {
                    var noSearchResult = new NosearchResult({appName : commonLang["Works"]});
                    this.$('[data-el-search-wrapper]').html(noSearchResult.render().el);
                    return;
                }
                var contentView = new SearchContentView({
                    isSimple: false,
                    model: this.model
                });
                this.$('[data-el-search-wrapper]').html(contentView.render().el);
                this.renderPages();
            } else {
                if (this.collection.pageInfo().total == 0) {
                    $('#worksEmptyMessage').show();
                    return;
                }
                var contentView = new SearchContentView({
                    isSimple: true,
                    model: this.model
                });
                this.$el.append(contentView.render().el);
            }
            this.removeMoreBtn();
        }
    });
});