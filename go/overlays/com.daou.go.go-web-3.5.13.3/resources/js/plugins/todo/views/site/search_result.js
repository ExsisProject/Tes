define("todo/views/site/search_result", [
    "backbone",
    "moment",
    "app",
    
    "todo/models/todo_search_results",
    "todo/libs/util",
    
    "hgn!todo/templates/search_result",
    
    "i18n!nls/commons",
    "i18n!todo/nls/todo"
],

function(
    Backbone,
    moment,
    GO,
    
    TodoSearchResultList,
    TodoUtil,

    renderSearchResult, 
    
    CommonLang,
    TodoLang
) {
    var SearchResultView,
        PAGING_OFFSET = 10;

    SearchResultView = Backbone.View.extend({
        className: 'content_page combine_search_page',
        template: renderSearchResult,

        events: {
            "click .page-link": "_changePage"
        },

        initialize: function(options) {
            if(!this.collection) {
                this.collection = new TodoSearchResultList();
            }
        },

        render: function() {
            var self = this;

            return this.collection.getFilteredList(parseQueryString())
                .then(_.bind(renderPage, this))
                .otherwise(function(err) {
                    console.warn('[:::ToDO+ Rendering Error:::] : Caused by...');
                    console.log(err['stack'] ? err['stack'] : err.message);

                    renderNoResultPage.call(self);
                });
        },

        _changePage: function(e) {
            var $target = $(e.currentTarget),
                targetPage = parseInt($target.data('page')),
                searchParam = parseQueryString();

            e.preventDefault();

            if($target.hasClass('disabled')) {
                ;
            } else {
                searchParam.page = targetPage || 0;
                GO.router.navigate('todo/search?' + GO.util.jsonToQueryString(searchParam), {pushState: true, trigger: true});
            }
        }
    });

    function renderPage(collection) {
        var searchParam = parseQueryString(),
            currentPage = (searchParam.page || 0) + 1;

        if(collection.length > 0) {
            this.$el
                .empty()
                .append(this.template({
                    "contextRoot": GO.config('contextRoot'),
                    "collection": parseCollection(collection),
                    "currentPage": currentPage,
                    "totalPage": collection.page.total,
                    "showPaging?": isShowPaging(collection),
                    "prevPage": getPrevPage(collection),
                    "nextPage": getNextPage(collection),
                    "lastPage": getLastPage(collection),
                    "firstPageGroup?": isFirstPageGroup(collection),
                    "firstPage?": isFirstPage(collection),
                    "lastPageGroup?": isLastPageGroup(collection),
                    "lastPage?": isLastPage(collection),
                    "pagingData": buildPagingData(collection),
                    "label": {
                        "dueDate": TodoLang["기한일"],
                        "prev": CommonLang["이전"],
                        "next": CommonLang["다음"]
                    }
                }));
        } else {
            renderNoResultPage.call(this);
        }
    }

    function renderNoResultPage() {
        this.$el.empty().append('<p class="data_null"><span class="ic_classic ic_no_result"></span><span class="txt">' + CommonLang["검색결과없음"] + '</span></p>');
    }

    function parseQueryString() {
        return GO.router.getSearch();
    }

    function parseCollection(collection) {
        var clonedList = collection.toJSON();

        _.map(clonedList, function(item) {
            if(item.dueDate) {
                item.dueDate = TodoUtil.parseDuedate(item.dueDate);
            }
        });

        return clonedList;
    }

    function isShowPaging(collection) {
        var pageInfo = collection.page;
        return pageInfo.total > 1;
    }

    function getTotalPage(collection) {
        var pageInfo = collection.page;
        return Math.ceil(pageInfo.total / pageInfo.offset);
    }

    function getPrevPage(collection) {
        var pageInfo = collection.page,
            prev = pageInfo.page - 1;
        return prev > 0 ? prev : 0;
    }

    function getNextPage(collection) {
        var pageInfo = collection.page,
            totalPage = getTotalPage(collection),
            next = pageInfo.page + 1;

        return next >= totalPage ? totalPage : next;
    }

    function getLastPage(collection) {
        return getTotalPage(collection) - 1;
    }

    function buildPagingData(collection) {
        var result = [],
            pageInfo = collection.page,
            totalPage = getTotalPage(collection),
            startPage = PAGING_OFFSET * Math.floor(pageInfo.page / PAGING_OFFSET) + 1,
            endPage = startPage + PAGING_OFFSET - 1;

        if(endPage > totalPage) {
            endPage = totalPage;
        }

        for(var i = startPage; i <= endPage; i++) {
            result.push({"page": i - 1, "label": i, "isCurrent": i === (pageInfo.page + 1)});
        }

        return result;
    }

    function isFirstPageGroup(collection) {
    	var pageInfo = collection.page;
    	return pageInfo.page < 1;
    }

    function isLastPageGroup(collection) {
        var pageInfo = collection.page,
            curPageGroup = Math.floor(pageInfo.page + 1 / PAGING_OFFSET) + 1;
        return curPageGroup === getTotalPage(collection);
    }

    function isFirstPage(collection) {
        return collection.page.page === 0;
    }

    function isLastPage(collection) {
        return collection.page.lastPage;
    }

    return SearchResultView;
});
