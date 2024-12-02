define([
    "when",
    "views/layouts/default",
    "todo/models/todos",
    "todo/views/site/content_top",
    "go-ignoreduplicatemethod"
],

function(
    when,
    DefaultLayout,
    TodoList,
    TodoContentTopView,
    GOIgnoreDuplicateMethod
) {

    var TodoLayoutView,
        THEME_PREFIX = 'skin_todo_type';

    TodoLayoutView = DefaultLayout.extend({
        name: "todo",
        className: "go_skin_default go_full_screen todo go_renew go_todo",
        useRedirectPolicy: false,

        collections: {},

        initialize: function(options) {
            DefaultLayout.prototype.initialize.call(this, options);
            GO.config('workspace_expansion_button_visible', false);
            this.collections = {};
        },

        _init: function() {
            this.setUseSide(false);
            this.setUseContentWrapper(true);
            if (GO.session()['theme'] !== 'THEME_ADVANCED') this.setUseOrganogram(false);
        },

        render: function() {
        	this.off("resize:content");

            var self = this,
                defer = when.defer();

            self.appName = 'todo';

            TodoList.fetchCollections.call(this).then(function(collections) {
                self.collections = collections;
                return DefaultLayout.prototype.render.call(self);
            }).then(function() {
                renderContentTop.call(self);
                resizeContentHeight.call(self);
                bindWindowResize.call(self);
                bindClearHistoryMenuEvent.call(self);

                defer.resolve(self);
            }).otherwise(defer.reject);

            return defer.promise;
        },

        remove: function() {
            DefaultLayout.prototype.remove.apply(this, arguments);
            $(document).off('.go.todo');
        },

        setTheme: function(themeId) {
            // 테마지정 규칙: skin_todo_type{{themeId}}
            this.$el.addClass(THEME_PREFIX + themeId);
        },

        getContentPageHeight: function() {
            var ch = this.getContentElement().height(),
                cth = this.$el.find('.content_top').outerHeight();

            return ch - cth;
        },

        // 무력화 시킨다.
        setTitle: function() {}

    }, {
        __instance__: null
    });

    function bindClearHistoryMenuEvent() {
        var menu = '.history-menu';

        $(document)
            .on('click.go.todo', clearMenus)
            .on('click.go.todo', clearEditForm);
    }

    function clearEvent(event, eventName) {
        // 마우스 우클릭 이벤트는 무시한다.
        if (event && event.which === 3) return;
        // DOM에서 사라진 엘리먼트는 무시한다.
        if ($(event.target).closest(document).length < 1) return;
        $(document).trigger($.Event(eventName, {relatedTarget: event.target}));
    }

    function clearMenus(e) {
        clearEvent(e, 'go.todo.clearmenu');
    }

    function clearEditForm(e) {
        clearEvent(e, 'go.todo.cleareditform');
    }

    function bindWindowResize() {
        var self = this,
            resizer = new GOIgnoreDuplicateMethod();

        $(window).on('resize.todo', function(e) {
            resizer.bind(function() {
                resizeContentHeight.call(self);
            });
        });
    }

    function triggerResizeEvent() {
        this.trigger("resize:content", this.getContentPageHeight(), this);
    }

    function resizeContentHeight() {
        var
            goBody = this.$el.find('.go_body'),
            goBodyHeight = $(window).height(),
            minHeight = parseInt(goBody.css('min-height')),
            contentPadding = 45;

        this.$el.find( '#content' ).css("padding-bottom", 0);

        this.$el.find('.go_wrap').children(':not(.go_body)').each(function(i, el) {
            goBodyHeight -= $(el).outerHeight();
        });

        goBodyHeight = Math.max(minHeight, goBodyHeight);

        this.$el.find( '.go_body' ).height( goBodyHeight );
        this.$el.find( '#content' ).height( goBodyHeight );

        this.trigger("resize:content", goBodyHeight - this.$el.find('.content_top').outerHeight(), this);
    }

    function renderContentTop() {
        var contentTopView = new TodoContentTopView(this.collections);
        this.$el.find('.go_content').empty().append(contentTopView.el);
        contentTopView.render();
    }

    return TodoLayoutView;

});
