//define([
//    "todo/views/site/main"
//],
//
//function(
//    Layout
//) {
//
//    return {
//        index: function() {
//            require(["todo/views/site/dashboard"], function(TodoDashboardView) {
//                Layout.render().then(function(layout) {
//                    var collections = layout.collections;
//                    var dashboardView = TodoDashboardView.create(collections.myTodoList, collections.favoriteTodoList);
//                    layout.setContent(dashboardView);
//                    dashboardView.render();
//                }).otherwise(function(err) {
//                    console.warn('[:::ToDO+ Rendering Error:::] : Caused by...');
//                    console.log(err['stack'] ? err['stack'] : err.message);
//                });
//            });
//        },
//
//        view: function(todoId) {
//            require(["todo/views/site/todo_board"], function(TodoBoardView) {
//                var layout;
//                Layout.render().then(function(layout) {
//                    // var collections = layout.collections;
//                    return TodoBoardView.attachToLayout(layout, todoId);
//                }).otherwise(function(err) {
//                    console.warn('[:::ToDO+ Rendering Error:::] : Caused by...');
//                    console.log(err['stack'] ? err['stack'] : err.message);
//                });
//            });
//        }
//    };
//
//});