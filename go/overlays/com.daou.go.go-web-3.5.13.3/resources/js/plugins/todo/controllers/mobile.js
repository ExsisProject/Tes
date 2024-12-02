define([
        "when",
        "todo/views/mobile/main",
        "i18n!nls/commons",
        "i18n!todo/nls/todo"
    ],

    function (
        when,
        MobileViews,
        CommonLang,
        TodoLang
    ) {
        var LayoutView = MobileViews.LayoutView,
            TodoDashboardView = MobileViews.TodoDashboardView,
            TodoDetailView = MobileViews.TodoDetailView,
            CardDetailView = MobileViews.CardDetailView;

        var TodoMobileController = (function () {
            var Controller = function () {
                this.layoutView = new LayoutView();
            };

            Controller.prototype.index = function () {
                var layoutView = this.layoutView;
                GO.util.appLoading(true);

                layoutView
                    .setToolbar({
                        title: TodoLang["ToDO+ 홈"],
                        isList: true,
                        isSideMenu: true,
                        isHome: true,
                        isSearch: true
                    })
                    .render().then(function () {
                    var collections = layoutView.collections;
                    var dashboardView = layoutView.buildContentView(TodoDashboardView, {
                        "myTodoList": collections.my,
                        "favoriteTodoList": collections.favorite
                    });
                    dashboardView.render();
                }).otherwise(function (err) {
                    GO.router.navigate('todo', {"replace": true, "trigger": true});
                });
            };

            Controller.prototype.showBoard = function (todoId) {
                renderDetailView.call(this, todoId).then(function (todoDetailView) {
                    var todoModel = todoDetailView.getTodoModel();
                    $("#appTitle").text(todoModel.toJSON().title);
                });
            };

            Controller.prototype.showCard = function (todoId, todoItemId) {
                renderDetailView.call(this, todoId).then(function (todoDetailView) {
                    var todoModel = todoDetailView.getTodoModel(),
                        todoItemModel = todoDetailView.getTodoItemModel(todoItemId);

                    CardDetailView.create(todoModel, todoItemModel);
                });
            };

            function renderDetailView(todoId) {
                var defer = when.defer(),
                    layoutView = this.layoutView;

                return layoutView
                    .setToolbar({
                        isList: true,
                        isSideMenu: true,
                        isHome: true,
                        isSearch: true
                    })
                    .render().then(function () {
                        return TodoDetailView.attachToLayout(layoutView, todoId, {
                            "useToolbar": false,
                            "columnWidth": parseInt($(window).width() * 0.9)
                        }).otherwise(function (error) {
                            GO.util.linkToErrorPage(error);
                        });
                    }).otherwise(function (error) {
                        console.log(error.stack);
                    });
            }

            return Controller;
        })();

        return new TodoMobileController();

    });
