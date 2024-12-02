define([
    "backbone",
    "hogan",
    "app",

    "hgn!dashboard/templates/search/docs_search",
    "hgn!docs/search/templates/result_item",

    "collections/paginated_collection",
    'docs/search/models/search',

    "dashboard/views/search/search_form",
    "dashboard/views/search/no_search_result",
    'docs/search/views/search_content',
    'docs/search/views/search_info',

    "i18n!nls/commons",
    "GO.util"
],
function(
    Backbone,
    Hogan,
    App,

    DocsSeachTmpl,
    ResultItemTemplate,

    PaginatedCollection,
    DocsSearch,

    SearchForm,
    NosearchResult,
    SearchContentView,
    SearchInfoView,

    commonLang
) {

    return SearchForm.extend({

        events : {
            "click #btn_more" : "showMore"
        },

        initialize : function(options) {
            options = options || {};
            this.$el.off();
            this.param = GO.router.getSearch();
            this.type = options.type === 'detail' || this.param.appName === 'docs' ? 'detail' : 'simple';
            this.model = this.model || new DocsSearch();
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
        	if(!GO.util.isMobile() && window.location.pathname.indexOf("unified") == -1){
        		var searchInfoView = new SearchInfoView({
        			type: this.type,
        			param: this.param
        		});
        		this.$el.append(searchInfoView.render().el);
        	}
        	
        	if (this.type === 'detail') {
                var searchList =
                    '<div data-el-search-wrapper></div>' +
                    '<div class="tool_bar tool_absolute">' +
                    '<div class="dataTables_length"></div>' +
                    '</div>';
                this.$el.append(searchList);
            }else{
            	var searchList = '<div data-el-search-wrapper></div>';
            	this.$el.append(searchList);
            }
            return this;
        },
        showMore : function() {
            this.param.appName = "docs";
            this.showAppSearchMore(this.param);
        },
        getSearchTotalCount : function(){
            return 0;
        },
        _onSync: function() {
        	if(this.type === 'detail'){
                if (this.collection.total == 0) {
                    var noSearchResult = new NosearchResult({
                    	appName : commonLang["문서관리"], 
                    	useIntegrateSearch : window.location.pathname.indexOf("unified") == -1 ? false : true
                	});
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
                	if(window.location.pathname.indexOf("unified") == -1){
                		var noSearchResult = new NosearchResult({
                			appName : commonLang["문서관리"], 
                			useIntegrateSearch : false
            			});
                        this.$('[data-el-search-wrapper]').html(noSearchResult.render().el);
                        return;
                	}else{
                		$('#docsEmptyMessage').show();
                		return;
                	}
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