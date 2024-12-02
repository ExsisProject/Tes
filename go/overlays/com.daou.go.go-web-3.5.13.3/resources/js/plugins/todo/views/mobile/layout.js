define([
    "jquery",
    "when",
    "app",
    "todo/models/todos",
    "todo/views/mobile/side",
    "views/layouts/mobile_default",
    "views/mobile/header_toolbar",

    // 모바일에서만 사용할 수 있도록 레이아웃에서 import
    "GO.m.util"
],

function(
    $,
    when,
    GO,
    TodoList,
    SideMenuView,
    MobileLayout,
    HeaderToolbarView
) {
    var TodoMobileLayoutView,
        THEME_PREFIX = 'skin_todo_type';

    TodoMobileLayoutView = MobileLayout.extend({
        name: 'todo',
        className: 'go_todo',
        title: '',
        collections: {},

        initialize: function(options) {
            options = options || {};
            // 글로벌 검색창 사용안함
            options.useSearch = true;

            MobileLayout.prototype.initialize.call(this, options);
            _.extend(this.options, options);


            this.headerToolbarView = null;
            this.toolbarOptions = this.options.toolbar;

            GO.EventEmitter.on('common', 'layout:showSideMenu', this.clearLayers, this);
        },

        setToolbar: function(options) {
            this.toolbarOptions = options;
            return this;
        },

        render: function() {
            var self = this,
                layoutName = this.name,
                defer = when.defer();

            this.clearContent();

            MobileLayout.prototype.render.call(this, layoutName).done(function(layout) {
                renderToolbar(this);
                TodoList.fetchCollections().then(function(collections) {
                    self.collections = collections;
                    renderSideMenu.call(self).then(defer.resolve, defer.reject);
                }, defer.reject);
            });

            return defer.promise;
        },

        remove: function() {
            //if(this.titleToolbarView) this.titleToolbarView.remove();
            GO.EventEmitter.off('common', 'layout:showSideMenu', this.clearLayers);
            MobileLayout.prototype.remove.apply(this, arguments);
        },

        clearLayers: function() {
            GO.EventEmitter.trigger('todo', 'go.todo.detail.clearlayers');
        },

        /**
         * 컨텐츠 영역 설정
         * TODO: 리팩토링(default.js에서 응용함)
         * @param klass 뷰 클래스
         * @param options 뷰 클래스 생성시 전달할 옵션
         * @param appended 컨텐츠 뷰를 append할 것인지 여부(false이면 el을 그대로 사용)
         */
        buildContentView: function( klass, options, appended ) {
            options = options || {};
            appended = appended || false;

            var contentWrap = this.getContentElement(),
                instance;

            _.defaults(options, {
                "append": false
            });

            if(contentWrap.data( 'go-view-instance' )) {
                var savedInstance = contentWrap.data('go-view-instance'),
                    releaseFn = _.isFunction(savedInstance['release']) ? savedInstance['release'] : savedInstance['remove'];

                releaseFn.call( savedInstance );
            }

            if(appended) {
                instance = new klass(options);
                contentWrap
                    .empty()
                    .append(instance.el);
            } else {
                instance = new klass(_.extend(options, {"el": this.getContentElement()}));
            }

            contentWrap.data( 'go-view-instance', instance );

            return instance;
        },


        /**
        페이지 타이틀 설정
        @method setTitle
        @params {Object} 타이틀 문자열 혹은 HTML*Element 타입의 객체
        @return {Object} SurveyLayout 인스턴스 객체
        */
        setTitle: function(html) {
            this.title = html;
            return this;
        },

        // PC 버전과 동일하게 재사용하기 위해서 빈 함수를 넣어준다.
        setTheme: function(themeId) {
            // 테마지정 규칙: skin_todo_type{{themeId}}
            this.$el.addClass(THEME_PREFIX + themeId);
        },

        getContentPageHeight: function() {
            var bh = this.getBodyElement().height(),
                cbh = $('#titleToolbar').outerHeight();

            return bh - cbh;
        }
    }, {
        __instance__: null
    });

    function renderToolbar(layout) {
        layout.headerToolbarView = HeaderToolbarView;
        layout.headerToolbarView.render(layout.toolbarOptions);
    }

    function renderSideMenu() {
        var defer = when.defer(),
            self = this,
            sideMenu, sideEl;

        if($('body').data('sideApp') === this.name) {
            return when.resolve(this);
        } else {
            sideMenu = new SideMenuView({"collections": this.collections, "packageName": this.name});
            sideEl = this.getSideContentElement().append(sideMenu.el);

            sideMenu.render().then(function() {
                GO.EventEmitter.trigger('common', 'layout:initSideScroll', this);
                sideEl.parent().hide();
                defer.resolve(self);
            }, defer.reject);
        }

        return defer.promise;
    }

    return TodoMobileLayoutView;
});
