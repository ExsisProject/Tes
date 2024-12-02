//define([
//    "todo/views/site/main"
//],
//
//function(SiteMain) {
//
//    var Layout = SiteMain.LayoutView,
//        TodoDashboardView = SiteMain.TodoDashboardView;
//
//    return {
//        index: function() {
//            Layout.render().then(function(layout) {
//                var collections = layout.collections;
//                var dashboardView = TodoDashboardView.create(collections.myTodoList, collections.favoriteTodoList);
//                layout.setContent(dashboardView);
//                dashboardView.render();
//            }).otherwise(function(err) {
//            	console.warn('[:::ToDO+ Rendering Error:::] : Caused by...');
//                console.log(err['stack'] ? err['stack'] : err.message);
//            });
//        }
//    };
//
//});