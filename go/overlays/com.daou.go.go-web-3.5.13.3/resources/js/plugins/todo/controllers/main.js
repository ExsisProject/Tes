define('todo/controllers/main', function(require) {
    var SiteMain = require('todo/views/site/main');
    var Layout = SiteMain.LayoutView;
    var SearchResultView = SiteMain.SearchResultView;
    var TodoDetailView = SiteMain.TodoDetailView;
    var CardDetailView = SiteMain.CardDetailView;
    var TodoDashboardView = SiteMain.TodoDashboardView;

    function renderView(todoId) {
        clearCardDetailView();
        return Layout.render().then(function(layout) {
            layout.$el.addClass('go_no_scroll');
            return TodoDetailView.attachToLayout(layout, todoId);
        }).otherwise(function(err) {
            try {
                GO.util.error(parseInt(err.status));
            } catch (e) {
                GO.router.navigate('todo', {"replace": true, "trigger": true});
            }
        });
    }

    function clearCardDetailView() {
        var $container = $('.ui-todocard-container');
        if ($container.length > 0) $container.data('view').remove();
    }

    return {
        search: function() {
            Layout.render().then(function(layout) {
                var searchResultView = new SearchResultView();
                layout.setContent(searchResultView);
                searchResultView.render();
            }).otherwise(function(err) {
                console.warn('[:::ToDO+ Rendering Error:::] : Caused by...');
                console.log(err['stack'] ? err['stack'] : err.message);
            });
        },
        detail: function(todoId) {
            renderView(todoId);
        },
        showCard: function(todoId, todoItemId) {
            renderView(todoId).then(function(todoDetailView) {
                var todoModel = todoDetailView.getTodoModel(),
                    todoItemModel = todoDetailView.getTodoItemModel(todoItemId);

                CardDetailView.create(todoModel, todoItemModel);
            });
        },
        dashboard: function() {
            Layout.render().then(function(layout) {
                var collections = layout.collections;
                var dashboardView = TodoDashboardView.create(collections.myTodoList, collections.favoriteTodoList);
                layout.setContent(dashboardView);
                dashboardView.render();
            }).otherwise(function(err) {
                console.warn('[:::ToDO+ Rendering Error:::] : Caused by...');
                console.log(err['stack'] ? err['stack'] : err.message);
            });
        }
    }
});