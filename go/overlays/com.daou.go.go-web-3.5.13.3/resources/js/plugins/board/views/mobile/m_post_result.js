;(function () {
    define([
            "jquery",
            "backbone",
            "app",
            'i18n!board/nls/board',
            "views/mobile/header_toolbar",
            'board/collections/post_search',
            //"hgn!board/templates/mobile/m_post_result",
            "hgn!board/templates/mobile/m_post_more_result",
            "hgn!board/templates/mobile/m_board_list_item",
            "i18n!nls/commons",
            "jquery.go-sdk",
            "GO.util"
        ],
        function (
            $,
            Backbone,
            App,
            boardLang,
            HeaderToolbarView,
            SearchCollection,
            //TplPostResult,
            TplPostResultMore,
            LayoutTpl,
            commonLang
        ) {
            var lang = {
                'search_result': commonLang['검색결과'],
                'post_write': boardLang['글쓰기']
            };
            var PostResult = Backbone.View.extend({
                initialize: function () {
                    this.headerToolbarView = HeaderToolbarView;
                    this.collection = null;

                    this.offset = GO.config('mobileListOffset') || 20;
                    this.$listEl = null;

                },
                unbindEvent: function () {
                    this.$el.off('vclick');
                },
                bindEvent: function () {
                    this.$el.on('vclick', 'ul.list_normal > li', $.proxy(this.viewDetailLi, this));
                    this.$el.on('vclick', 'a[data-btn="paging"]', $.proxy(this.goPaging, this));
                },
                goPaging: function (e) {
                    GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
                    e.stopPropagation();

                    var direction = $(e.currentTarget).attr('data-direction'),
                        cPage = this.collection.page.page || 0;

                    if (direction == 'prev' && cPage > 0) cPage--;
                    else if (direction == 'next') cPage++;

                    $(e.currentTarget).parents('.paging').remove();
                    this.$listEl.empty();


                    var data = {
                        "page": cPage,
                        "offset": this.offset,
                        "stype": this.stype,
                        "keyword": this.keyword,
                        "fromDate": this.fromDate,
                        "toDate": this.toDate
                    };
                    this.collection.fetch({async: false, data: data, reset: true});
                    var searchlistTpl = this.makeTemplete({
                        data: this.collection,
                        searchData: data,
                        type: 'more'
                    });

                    this.$listEl.html(searchlistTpl);
                    //모바일 페이징 추가
                    var pagingTpl = GO.util.mPaging(this.collection);
                    this.$listEl.after(pagingTpl);
                    return false;
                },
                viewDetailLi: function (e) {
                    var targetEl = $(e.currentTarget);
                    this.moveBoardAction(targetEl);
                },
                moveBoard: function (e) {
                    var targetEl = $(e.currentTarget).parents('li').first();
                    this.moveBoardAction(targetEl);
                },
                moveBoardAction: function (targetEl) {
                    var boardType = targetEl.attr('data-boardType');
                    var boardId = targetEl.attr('data-boardId');
                    var postId = targetEl.attr('data-postId');

                    if (!boardType || !boardId || !postId) {
                        return;
                    }

                    if (targetEl.attr('data-hidden') == 'true') {
                        GO.util.delayAlert(boardLang['열람권한이 없는 게시물입니다.']);
                        return;
                    }

                    $.go(GO.contextRoot + "api/board/" + boardId + "/master", '', {
                        qryType: 'GET',
                        contentType: 'application/json',
                        responseFn: function (response) {
                            var communityId = 0;
                            if (response.data.ownerType == "Community") {
                                communityId = response.data.ownerId;
                            }
                            var routerApi = "board/" + boardId + "/post/" + postId;
                            if (communityId) {
                                routerApi = "community/" + communityId + "/" + routerApi;
                            }
                            if (boardType == "STREAM") {
                                routerApi = routerApi + "/stream";
                            }
                            App.router.navigate(routerApi, true);
                        }
                    });
                },
                makeTemplete: function (opt) {

                    var data = opt.data;
                    var searchData = opt.searchData;
                    var boardName = opt.boardName;
                    var searchType = opt.searchType;
                    var type = opt.type;

                    var dateParse = function (date) {
                        return GO.util.snsDate(this.createdAt);
                    };

                    var checkFileType = function () {

                        var fileType = "def";
                        if (GO.util.fileExtentionCheck(this.fileExt)) {
                            fileType = this.fileExt;
                        }
                        return fileType;

                    };

                    var isDetaiSearch = function () {
                        if (searchType == "detail") {
                            return true;
                        }
                        return false;
                    };

                    var resultContentParse = function () {
                        if (this.hiddenPost) {
                            return boardLang['열람권한이 없는 게시물입니다.'];
                        }
                        var content = this.content;
                        content = content.replace(/<br \/>/gi, "");
                        //content += this.attachFileNames;
                        return content;
                    };

                    var isStream = function () {
                        var boardType = this.boardType;
                        if (boardType == "STREAM") {
                            return true;
                        }
                        return false;
                    };
                    var tmplLang = {
                        keyword: commonLang['검색어'],
                        non_result: commonLang['검색결과없음'],

                    };
                    var tplPostResult = TplPostResultMore({
                        dataset: data.toJSON(),
                        dateParse: dateParse,
                        checkFileType: checkFileType,
                        searchData: searchData,
                        boardName: boardName,
                        parseFromDate: GO.util.shortDate(searchData.fromDate),
                        parseToDate: GO.util.shortDate(searchData.toDate),
                        isDetaiSearch: isDetaiSearch,
                        resultContentParse: resultContentParse,
                        isStream: isStream,
                        lang: tmplLang
                    });

                    return tplPostResult;
                },
                render: function () {

                    this.unbindEvent();
                    this.bindEvent();

                    GO.util.appLoading(true);

                    /*this.titleToolbarView.render({
                        isPrev : true,
                        name : lang['search_result'],
                        rightButton : {
                            text : lang['post_write'],
                            callback : function() {
                                GO.util.appLoading(true);
                                App.router.navigate('board/post/write', { trigger : true });
                            }
                        },
                        refreshButton : {
                            callback : function(){
                                _this.render();
                            }
                        }
                    });*/


                    this.headerToolbarView.render({
                        isClose: true,
                        title: commonLang['검색결과'],
                        isWriteBtn: true,
                        writeBtnCallback: function () {
                            GO.util.appLoading(true);
                            App.router.navigate('board/post/write', {trigger: true});
                        }
                    });

                    var _this = this;
                    var searchParams = App.router.getSearch();
                    if (window.MsearchParam) {
                        searchParams = GO.util.getSearchParam(window.MsearchParam);
                    }

                    var opt = {
                        stype: searchParams.stype,
                        keyword: searchParams.keyword,
                        fromDate: searchParams.fromDate,
                        toDate: searchParams.toDate,
                        page: GO.router.getSearch('page') || 0,
                        offset: this.offset

                    };
                    this.$el.html(LayoutTpl({otherClass: "list_search"}));
                    this.$listEl = this.$el.find('ul.list_normal');

                    this.collection = SearchCollection.searchCollection(opt, searchParams.isCommunity, true);
                    var data = this.collection;
                    var searchData = opt;
                    var boardName = searchParams.boardName;
                    var searchType = searchParams.searchType;
                    var isCommunity = searchParams.isCommunity == 'true' ? true : false;

                    this.stype = searchParams.stype;
                    this.title = searchParams.title || '';
                    this.content = searchParams.content || '';
                    this.comments = searchParams.comments || '';
                    this.attachFileNames = searchParams.attachFileNames || '';
                    this.userName = searchParams.userName || '';
                    this.boardIds = searchParams.boardIds || '';
                    this.keyword = searchParams.keyword || '';
                    this.fromDate = searchParams.fromDate;
                    this.toDate = searchParams.toDate;

                    this.$listEl.html(this.makeTemplete({
                        data: data,
                        searchData: searchData,
                        boardName: boardName,
                        searchType: searchType,
                        type: 'end'
                    }));

                    //모바일 페이징 추가
                    var pagingTpl = GO.util.mPaging(this.collection);
                    this.$listEl.after(pagingTpl);

                    GO.util.appLoading(false);
                }
            });

            return {
                render: function (opt) {
                    var postResult = new PostResult({
                        el: '#content'
                    });
                    return postResult.render();
                }
            };
        });
}).call(this);