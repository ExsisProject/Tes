;define('views/mobile/m_more_list', function (require) {

    var _ = require("underscore");
    var Backbone = require('backbone');
    var GO = require('app');

    var ListMoreView = Backbone.View.extend({
        initialize: function () {
        },
        render: function () {
        },
        setFetchInfo: function (dataSet, collection) {
            this.offScrollEvent()
            this.onScrollEvent();
            this.dataSet = dataSet;
            this.collection = collection;
            this.offset = GO.config('mobileListOffset') || 20;
            if (GO.router.getUrl() === sessionStorage.getItem(GO.constant("navigator", "BASE-URL"))) {
                this.selectedDocId = sessionStorage.getItem(GO.constant("navigator", "SELECTED-DOC-ID"));
                this.pageNo = sessionStorage.getItem(GO.constant("navigator", "PAGE-NO"));
            } else {
                this.selectedDocId = null;
                this.pageNo = 0;
            }
            if (this.pageNo >= 1) {
                this.dataSet['offset'] = this.offset * (parseInt(this.pageNo) + 1);
                this.pageNo = 0;
            } else {
                this.dataSet['offset'] = this.offset;
            }
            sessionStorage.removeItem(GO.constant("navigator", "SELECTED-DOC-ID"));
            sessionStorage.removeItem(GO.constant("navigator", "PAGE-NO"));
            sessionStorage.setItem(GO.constant("navigator", "BASE-URL"), GO.router.getUrl());
        },
        setRenderListFunc: function (renderListFunc) {
            this.renderListFunc = renderListFunc;
        },
        scrollToEl: function () {
            if (_.isNull(this.selectedDocId)) {
                return false;
            }
            var _selectedDocId = JSON.parse(this.selectedDocId);
            var el = this.$el.find('a[data-list-id=' + _selectedDocId.listId + ']').closest('li');
            if (el.length < 1) return;
            var offset = el.offset().top - $('#headerToolbar').outerHeight(true);
            $('html').animate({scrollTop: offset}, 10);
        },
        appendRenderAboveList: function () {

            if (!this.collection.page && !this.collection.pageInfo) {
                return;
            }

            if (typeof (this.collection.pageInfo) == 'function') {
                if (!this.collection.pageInfo().next) {
                    return false;
                }
                this.pageNo = this.collection.pageInfo().pageNo;
            } else {
                if (this.collection.page.lastPage) {
                    return false;
                }
                this.pageNo = this.collection.page.page;
            }
            GO.util.appLoading(true);
            if (this.dataSet['offset'] > this.offset) {
                this.pageNo = this.dataSet['offset'] / this.offset - 1;
                this.dataSet['offset'] = this.offset;
            }
            this.pageNo = this.pageNo + 1;
            this.dataFetch()
                .done($.proxy(function (collection) {
                    if (collection.length !== 0) {
                        this.renderListFunc.listFunc(collection);
                        GO.util.appLoading(false);
                    }
                }, this));
        },
        dataFetch: function () {
            var _url = this.collection.url().split("?")[0];
            var deferred = $.Deferred();
            this.dataSet['page'] = this.pageNo;
            this.collection.fetch({
                async: false,
                url: _url,
                data: this.dataSet,
                success: function (collection) {
                    deferred.resolve(collection);
                },
                error: function (data, error) {
                    GO.util.linkToErrorPage(error);
                }
            });
            return deferred;
        },
        setSessionInfo: function (e) {
            var targetEl = $(e.currentTarget);
            var targetId = targetEl.attr("data-list-id");
            var selectedPageNo = Math.floor(_.indexOf(_.map(targetEl.closest('ul').find('a[data-list-id]'), function (a) {
                return $(a).attr('data-list-id')
            }), targetId.toString()) / this.offset);
            var selectedDocId = {'listId': targetId};
            sessionStorage.setItem(GO.constant("navigator", "PAGE-NO"), selectedPageNo);
            sessionStorage.setItem(GO.constant("navigator", "SELECTED-DOC-ID"), JSON.stringify(selectedDocId));
        },
        detectScroll: function (e) {
            var scrollTop = $(e.currentTarget).scrollTop();
            if (parseInt(scrollTop) >= $(document).height() - $(window).height() - 96) {
                this.appendRenderAboveList();
            }
            if (scrollTop === 0) {
                if ((!this.pageNo || this.pageNo == 0) && this.dataSet['offset'] == 20) {
                    return false;
                }
                this.dataSet['offset'] = 20;
                this.selectedDocId = null;
                this.pageNo = 0;
                GO.util.appLoading(true);
                this.dataFetch()
                    .done($.proxy(function (collection) {
                        if (collection.length !== 0) {
                            this.$el.find('ul[data-type="list"]').empty();
                            this.renderListFunc.listFunc(collection);
                            GO.util.appLoading(false);
                        }
                    }, this));
            }
        },
        offScrollEvent: function () {
            $(window).off('scroll.renderNewPage');
        },
        onScrollEvent: function () {
            $(window).on('scroll.renderNewPage', $.proxy(this.detectScroll, this));
        }
    });
    return ListMoreView;
});