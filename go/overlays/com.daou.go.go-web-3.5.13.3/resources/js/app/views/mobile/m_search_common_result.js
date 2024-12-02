;define('views/mobile/m_search_common_result', function (require) {

    var _ = require("underscore");
    var Backbone = require('backbone');
    var GO = require('app');
    var instance = null;

    var searchCommonResult = Backbone.View.extend({
        initialize: function (options) {
            this.$el.off();
            this.pageNo = 0;
            this.isLastPage = true;
            this.collection = options.collection == undefined ? "" : options.collection;
            this.searchOptions = options.searchOptions == undefined ? "" : options.searchOptions;
            this.renderListFunc = options.renderListFunc == undefined ? "" : options.renderListFunc;
            this.renderListMoreFunc = options.renderListMoreFunc == undefined ? "" : options.renderListMoreFunc;
        },
        render: function () {
            this._resultLayerInitScroll();
        },
        _fetch: function () {
            this._collectionFetch()
                .done($.proxy(function (collection) {
                    this._setIsLastPage(collection);
                    this.renderListFunc(collection);
                    this._searchResultSetHeight();
                    this._searchInputBlur();
                }, this));
        },
        _collectionFetch: function () {
            var deferred = $.Deferred();
            this.searchOptions['page'] = this.pageNo;
            this.collection.fetch({
                data: this.searchOptions,
                success: function (collection) {
                    deferred.resolve(collection);
                }
            });
            return deferred;
        },
        _resultLayerInitScroll: function () {
            $('#searchDetail').off('scroll.searchLayer');
            $('#searchDetail').on('scroll.searchLayer', $.proxy(this._detectSearchScroll, this));
            $('#searchResultWrap').css('display', 'block');
        },
        _detectSearchScroll: function (e) {
            var $list = $('#searchResultWrap ul');
            if ($list.length == 0) {
                $list = $('#searchResultWrap dl');
            }
            var scrollTop = $(e.currentTarget).scrollTop();
            var isScrollBottom = (parseInt(scrollTop) >= $("#searchResultWrap").height() - $(window).height() - 60);
            if (isScrollBottom) {
                if (this.isLastPage) return;
                if (typeof this.renderListMoreFunc == 'function') {
                    this.pageNo++;
                    this._collectionFetch()
                        .done($.proxy(function (collection) {
                            this._setIsLastPage(collection);
                            if (collection.length !== 0) {
                                this.renderListMoreFunc(collection);
                            }
                        }, this));
                }
            }
        },
        _searchResultSetHeight: function () {
            $('input').blur().focusout();
            setTimeout(function(){
                var resultWrapHeight = $(window).height() - $('#searchNav').outerHeight(true);
                $('#searchDetail').css('height', resultWrapHeight);
            },500);
        },
        _searchInputBlur: function () {
            $('#detailSearchWrap input').blur();
        },
        _setIsLastPage: function(collection){
            if (collection.page) {
                this.isLastPage = collection.page.lastPage;
            } else { //only for Works
                this.isLastPage = collection.toJSON()[0].docs.pageInfo.lastPage;
            }
        }
    });
    return {
        set: function (options) {
            instance = new searchCommonResult(options);
            return instance.render();
        },
        fetch: function () {
            instance._fetch();
        }
    };
});