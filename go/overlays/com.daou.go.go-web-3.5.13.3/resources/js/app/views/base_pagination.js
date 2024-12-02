define('views/base_pagination', function (require) {

    return Backbone.View.extend({

        initialize: function(options) {
            this.pageInfo = options.pageInfo;
            this.useBottomButton = options.useBottomButton;
        },

        goTo: function(e) {
            e.preventDefault();
            this.paging($(e.currentTarget).attr('data-page'));
        },

        firstPage: function(e) {
            e.preventDefault();
            if (this.pageInfo.prev) {
                this.paging(0);
            }
        },

        prevPage: function(e) {
            e.preventDefault();
            if (this.pageInfo.prev) {
                this.paging(this.pageInfo.pageNo - 1);
            }
        },

        nextPage: function(e) {
            e.preventDefault();
            if (this.pageInfo.next) {
                this.paging(this.pageInfo.pageNo + 1);
            }
        },

        lastPage: function(e) {
            e.preventDefault();
            if (this.pageInfo.next) {
                this.paging(this.pageInfo.lastPageNo);
            }
        },

        paging: function(pageNo) {
            this.trigger('paging', pageNo);
        }
    });
});