define('works/views/mobile/home', function (require) {

    var BaseHomeView = require('works/home/views/base_home');

    var Template = require('hgn!works/templates/mobile/home');

    var HeaderToolbarView = require('views/mobile/header_toolbar');

    return BaseHomeView.extend({
        events: _.extend(BaseHomeView.prototype.events, {
            'vclick [data-el-prev]': '_onClickPrev',
            'vclick #btn-search': '_searchAppName',
            'keyup #appName': '_onKeyupSearch',
            'click #appNameDelete': "_deleteSearchText",
        }),

        render: function () {
            this.$el.html(Template({
                lang: this.lang,
            }));

            this.$('#content').removeClass('list_type').addClass('content_page bg_card_type go_works_home card_type');
            this.$toggleLayoutEl = this.$('#content');
            this._toggleLayout(this.viewType);
            BaseHomeView.prototype.render.apply(this, arguments);

            return this;
        },

        _onSyncApplets: function () {
            BaseHomeView.prototype._onSyncApplets.apply(this, arguments);
            this._renderTitle();
            var searchAvailable = this.applets.getType() === 'all' || this.applets.getType() === 'search';
            if (!searchAvailable) {
                this.$('#appName').val('');
                this.$('section.search_wrap').hide();
            }
        },

        _renderTitle: function () {
            var type = this.applets.getType();
            var isFolderType = type === 'folder';
            if (isFolderType) {
                var folderId = this.applets.getFolderId();
                var folder = this.folders.findWhere({id: parseInt(folderId)});
                this.$('[data-el-folder-name]').text();

                HeaderToolbarView.render({
                    title: folder.get('name'),
                    isPrev: true
                });
                this.$('[app-name-search-option]').hide();
            } else {
                HeaderToolbarView.render({
                    title: 'Works',
                    isList: true,
                    isHome: true,
                    isSearch: true
                });
            }
            this.$("#titleToolbar").toggle(!isFolderType)
        },

        _onClickPrev: function () {
            this.applets.setType('all');
            this.applets.fetch();
            window.history.back();
        },

        /**
         * @Override
         * @private
         */
        _toggleLayout: function () {
            var type = BaseHomeView.prototype._toggleLayout.apply(this, arguments);
            var typeMap = {
                card: 'list',
                list: 'card'
            };
            this.$('[data-toggle-layout] > i').removeClass('ic_list').removeClass('ic_card').addClass('ic_' + typeMap[type]);
        },
        _onKeyupSearch: function (e) {
            e.preventDefault();
            if (e.keyCode != 13 && !_.isEmpty($('#appName').val())) {
                return;
            }
            this._searchAppName();
        },

        _searchAppName: function () {
            var keyword = $('#appName').val().trim();

            if (_.isEmpty(keyword)) {
                this.applets.setType('all');

            } else {
                this.applets.setType('search');
            }
            this.applets.setKeyword(keyword);

            this.applets.fetch({reset: true});
        },
        _deleteSearchText: function (e) {
            e.preventDefault();
            $('#appName').val('');
            this._searchAppName();
        }
    });
});
