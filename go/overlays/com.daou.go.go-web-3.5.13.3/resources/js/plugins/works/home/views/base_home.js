define('works/home/views/base_home', function (require) {

    require('jquery.mobile');

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');
    var lang = {
        all: worksLang['Works 홈'],
        favorite: worksLang['즐겨찾는 앱'],
        manage: worksLang['운영중인 앱'],
        share: worksLang['앱 공유하기'],
        buttonTitle: worksLang["앱 추가하기"],
        buttonDesc: worksLang["앱 만들기 안내문구"],
        '리스트 형태로 보기': worksLang['리스트 형태로 보기'],
        '카드 형태로 보기': worksLang['카드 형태로 보기'],
        '정렬': worksLang['정렬'],
        '가나다 순': worksLang['가나다 순'],
        '최근 열어본 순': worksLang['최근 열어본 순'],
        '전체': commonLang['전체'],
        '나의 폴더': worksLang['나의 폴더'],
        '폴더 만들기': worksLang['폴더 만들기'],
        '폴더 만들기 설명': worksLang['폴더 만들기 설명'],
        '앱 내보내기': worksLang['앱 내보내기'],
        '앱 가져오기': worksLang['앱 가져오기'],
        '앱 내보내기 설명': worksLang['앱 내보내기 설명'],
        '앱 명을 입력하세요': worksLang['앱 명을 입력하세요.'],
        '원하는 앱을간편하게 만들어보세요': worksLang['원하는 앱을 간편하게 만들어보세요!']
    };

    var CONSTANTS = require('works/constants/works');

    var AppletAdminModel = require('works/models/applet_admin');
    var Applets = require('works/collections/applet_simples');
    var Folders = require('works/home/collections/applet_folders');
    var ExportAppletList = require('works/home/collections/applet_export_list');
    var ImportAppletList = require('works/home/collections/applet_import_list');
    var HasAccessibleAppletModel = require('works/models/applet_accessible')

    var AppletItemView = require('works/home/views/applet_item');
    var GroupItemView = require('works/home/views/applet_folder_item');
    var AppletExportListView = require('works/home/views/applet_export');

    return Backbone.View.extend({

        events: {
            'vclick [data-all]': '_onClickHome',
            'vclick [data-favorite]': '_onClickFavorite',
            'vclick [data-manage]': '_onClickManage',
            'vclick [data-toggle-layout]': '_onClickToggleLayout',
            'vclick a[data-folder-id]': '_onClickFolderItem',
            'vclick [applet-share]': '_onClickShareAppletList'
        },

        initialize: function (options) {
            options = options || {};
            this.appletType = options.appletType || GO.util.store.get(GO.session('id') + '-works-home-tab-type') || CONSTANTS.WORKS_HOME_TAB_TYPE.ALL;
            this.folderId = options.folderId;
            var url = 'works/home/' + this.appletType + (this.appletType === 'folder' ? '/' + this.folderId : '');
            GO.router.navigate(url, {replace: true});
            this.viewType = GO.util.store.get(GO.session('id') + '-works-home-view-type') || CONSTANTS.APPLET_VIEW_TYPE.CARD;

            this.lang = lang;

            this.order = GO.util.store.get(GO.session('id') + '-works-home-order') || 'name';

            this.hasAccessibleApplet = new HasAccessibleAppletModel();

            this.folders = new Folders([], {orderBy: this.order});
            this.applets = new Applets([], {type: this.appletType, folderId: this.folderId});
            this.checkAdmin = new AppletAdminModel();
            this.exportApplets = new ExportAppletList();
            this.importApplets = new ImportAppletList();

            this.listenTo(this.checkAdmin, 'sync', this._onSyncCheckAdmin);
            this.listenTo(this.hasAccessibleApplet, 'sync', this._onSyncHasAccessibleApplets);
            this.listenTo(this.folders, 'remove', this._onDestroyFolder);
            this.listenTo(this.folders, 'sync', this._onSyncFolders);
            this.listenTo(this.applets, 'sync', this._onSyncApplets);
            this.listenTo(this.exportApplets, 'sync', this._onSyncExportAppletList);

            this.applets.setOrder(this.order);
        },

        render: function () {
            this.fetch();
            return this;
        },

        fetch: function () {
            var defer = $.Deferred();
            $.when(
                this.hasAccessibleApplet.fetch()
            ).then($.proxy(function () {
                defer.resolve();
            }, this)).then($.proxy(function () {
                defer.reject();
            }, this));

            return defer;
        },

        _onSyncFolders: function () {
            this._renderFolders();
        },

        _onSyncApplets: function () {
            this._toggleIconClass(this.applets.getType());
            this.$('[data-app-list]').empty();
            this._renderApplets();
            this._toggleFolders();
            this._toggleAddButtonAndEmptyMessage();
        },

        _onSyncCheckAdmin: function () {
            this._toggleAppletShare();
            this._toggleAddButtonAndEmptyMessage();
        },

        _onSyncExportAppletList: function () {
            this._renderExportAppletList();
        },

        _onDestroyFolder: function (model) {
            if (model.id === parseInt(this.applets.getFolderId())) {
                this.applets.setType('all');
                GO.router.navigate('works/home/all', {replace: true});
            }
            this.folders.fetch();
            GO.util.preloader(this.applets.fetch());

        },

        _toggleIconClass: function (type) {
            this.$('#worksTabs').find('li').removeClass('on');
            this.$('[data-btn-type="' + type + '"]').addClass('on');
        },

        _commonAction: function (type) {
            this._toggleIconClass(type);
            this.applets.setType(type);
            if (type != 'share') {
                GO.util.store.set(GO.session('id') + '-works-home-tab-type', type, 'local');
            }
            GO.util.preloader(this.applets.fetch({reset: true}));
            this._pushState('works/home/' + type);
        },

        _pushState: function (url) {
            var currentUrl = GO.router.getUrl();
            if (currentUrl !== url) GO.router.navigate(url);
        },

        _onClickFolderItem: function (e) {
            e.preventDefault();
            this._setContent('folder');
            var folderId = $(e.currentTarget).attr('data-folder-id');
            this.applets.setType('folder');
            this.applets.setFolderId(folderId);
            GO.util.preloader(this.applets.fetch());
            this._pushState('works/home/folder/' + folderId);
            $(window).scrollTop(0);
        },

        _onClickHome: function () {
            this._setContent('all');
            this.$('[data-group-list]').show();
            this._commonAction('all');
            this.$('section.search_wrap').show();
            this._setInitializeAppSearch();
        },

        _onClickFavorite: function () {
            this._setContent('favorite');
            this.$('[data-group-list]').hide();
            this._commonAction('favorite');
            this.$('section.search_wrap').hide();
        },

        _onClickManage: function () {
            this._setContent('manage');
            this.$('[data-group-list]').hide();
            this._commonAction('manage');
            this.$('section.search_wrap').hide();
        },

        _onClickShareAppletList: function () {
            this._setContent('share');
            this._commonAction('share');
            this.exportApplets.fetch();
        },

        _setInitializeAppSearch: function () {
            this.$('#appName').val('');
            this.$('[data-el-app-search-btn]').removeClass('searching');
        },

        _setContent: function (type) {
            type = type || this.applets.getType();
            if (type === 'share') {
                this._setToggleLayout('list');
                this.$('[data-base-options]').hide();
                this.$('[data-works-home]').hide();
                this.$('[data-share-content]').show();
                this.$('[tab-applet-export]').attr("class", "active");
                this.$('[tab-applet-import]').attr("class", "selectable");
                this.$('[data-applet-share-info]').html(lang['앱 내보내기 설명']);
            } else {
                this._setToggleLayout();
                this.$('[data-base-options]').show();
                this.$('[data-works-home]').show();
                this.$('[data-share-content]').hide();
            }
        },

        _setToggleLayout: function (type) {
            type = _.isUndefined(type) ? (GO.util.store.get(GO.session('id') + '-works-home-view-type') || 'card') : 'list';
            this.$toggleLayoutEl.removeClass('list_type').removeClass('card_type').addClass(type + '_type');
        },

        _onClickToggleLayout: function () {
            this._toggleLayout();
        },

        _toggleLayout: function (type) {
            type = _.isUndefined(type) ? (this.$toggleLayoutEl.hasClass('card_type') ? 'list' : 'card') : type;
            this.$toggleLayoutEl.removeClass('list_type').removeClass('card_type').addClass(type + '_type');
            GO.util.store.set(GO.session('id') + '-works-home-view-type', type, 'local');
            return type;
        },

        _renderApplets: function () {
            this.applets.each(function (applet) {
                var itemView = new AppletItemView({model: applet});
                this.$('[data-app-list]').append(itemView.render().el);
            }, this);
            if (!this.applets.length) this._renderAppletEmpty();
        },

        _renderFolders: function () {
            this.$('[data-group-list]').empty();
            this.folders.each(function (group) {
                var groupItemView = new GroupItemView({model: group});
                this.$('[data-group-list]').append(groupItemView.render().el);
            }, this);
        },
        _onSyncHasAccessibleApplets: function () {
            if (this.hasAccessibleApplet.get('false')) {
                GO.router.navigate('works/start', {
                    "pushState": true,
                    "trigger": true
                });
            } else {
                var defer = $.Deferred();
                GO.util.preloader(
                    $.when(
                        this.checkAdmin.fetch(),
                        this.folders.fetch(),
                        this.applets.fetch()
                    ).then($.proxy(function () {
                        if (this.appletType == 'share') {
                            this._shareFetch();
                        }
                        defer.resolve();
                    }, this)).then($.proxy(function () {
                        defer.reject();
                    }, this))
                );
                return defer;
            }
        },
        _renderAppletEmpty: function () {
            var emptyTitle = worksLang['앱없음 전체 제목'];
            var emptyDesc = worksLang['앱없음 전체 내용'];

            if (this.applets.getType() == CONSTANTS.WORKS_HOME_TAB_TYPE.FAVORITE) {
                emptyTitle = worksLang['앱없음 즐겨찾기 제목'];
                emptyDesc = worksLang['앱없음 즐겨찾기 내용'];
            } else if (this.applets.getType() == CONSTANTS.WORKS_HOME_TAB_TYPE.MANAGE) {
                emptyTitle = worksLang['앱없음 운영중 제목'];
                emptyDesc = worksLang['앱없음 운영중 내용'];
            } else if (this.applets.getType() == CONSTANTS.WORKS_HOME_TAB_TYPE.SEARCH) {
                emptyTitle = commonLang['검색결과없음'];
                emptyDesc = "";
            }

            this.$('[data-empty-title]').text(emptyTitle);
            this.$('[data-empty-desc]').text(emptyDesc);
        },

        _renderExportAppletList: function () {
            this.$('[data-share-item-list]').empty();
            this.appExportListView = new AppletExportListView({models: this.exportApplets});
            this.$('[data-share-item-list]').append(this.appExportListView.render().el);
        },

        _toggleAppletShare: function () {
            if (this.checkAdmin.isWorksAdmin()) {
                this.$('[data-side-share]').show();
            } else {
                this.$('[data-side-share]').hide();
            }
        },

        _shareFetch: function () {
            if (this.checkAdmin.isWorksAdmin()) {
                this.exportApplets.fetch();
            } else {
                GO.util.error('403', {"msgCode": "400-works"});
            }
        },

        _toggleFolders: function () {
            var is = this.applets.getType() === 'all';
            this.$('[data-group-list]').toggle(is);
        },

        /**
         * 전체보기시: 폴더도 없고, 애플릿도 없고, 권한도 없으면 emptyMessage 노출
         * 그 외 케이스: 애플릿도 없고, 권한도 없으면 emptyMessage 노출
         * # 모바일은 앱생성 권한 없음.
         */
        _toggleAddButtonAndEmptyMessage: function () {
            var checkAdmin = !!this.checkAdmin.get('true');
            this.$('[data-add-applet]').toggle(checkAdmin);
            this.$('[data-app-create]').toggle(checkAdmin);
            this.$('[data-app-create-auth]').toggle(!checkAdmin);
            this.$('[data-app-create-title]').toggle(checkAdmin);

            if (this.applets.getType() == CONSTANTS.WORKS_HOME_TAB_TYPE.SEARCH) {
                var is = !this.applets.length;
                this.$('[data-empty-message]').toggle(is);
                this.$('[data-add-applet]').toggle(!is);
            } else {
                var writeAuth = GO.util.isMobile() ? false : this.checkAdmin.get('true');
                var is = !writeAuth && !this.applets.length && (this.applets.getType() === 'all' ? !this.folders.length : true);
                this.$('[data-empty-message]').toggle(is);
            }
        }
    });
});
