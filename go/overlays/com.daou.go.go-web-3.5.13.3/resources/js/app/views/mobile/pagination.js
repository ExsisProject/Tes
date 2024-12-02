define('views/mobile/pagination', function (require) {

    var commonLang = require('i18n!nls/commons');
    var lang = {
        '이전': commonLang['이전'],
        '다음': commonLang['다음']
    };

    var BasePaginationView = require('views/base_pagination');

    var Template = require('hgn!templates/mobile/pagination');

    return BasePaginationView.extend({

        className: 'paging',

        events: {
            'vclick [data-direction="prev"]': 'prevPage',
            'vclick [data-direction="next"]': 'nextPage'
        },

        initialize: function() {
            BasePaginationView.prototype.initialize.apply(this, arguments);
            this.on('paging', this._paging);
        },

        render: function () {
            var pageInfo = this.pageInfo;
            var total = pageInfo.total;
            var to = pageInfo.pageSize * (pageInfo.pageNo + 1);
            this.$el.html(Template({
                lang: lang,
                isFirst: pageInfo.pageNo === 0,
                isLast: !pageInfo.next,
                from: pageInfo.pageSize * pageInfo.pageNo + 1,
                to: to > total ? total : to,
                total: total
            }));

            return this;
        },

        _paging: function(param) {
            this.collection.setPageNo(param);
            this.collection.fetch();
            $.mobile.silentScroll(0);
        }
    });
});