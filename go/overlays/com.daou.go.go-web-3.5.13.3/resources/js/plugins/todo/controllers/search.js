//define([
//    "todo/views/site/main"
//],
//
//function(SiteMain) {
//
//    var Layout = SiteMain.LayoutView,
//        SearchResultView = SiteMain.SearchResultView;
//
//    return {
//        index: function() {
//            Layout.render().then(function(layout) {
//                var searchResultView = new SearchResultView();
//                layout.setContent(searchResultView);
//                searchResultView.render();
//            }).otherwise(function(err) {
//                console.warn('[:::ToDO+ Rendering Error:::] : Caused by...');
//                console.log(err['stack'] ? err['stack'] : err.message);
//            });
//        }
//    };
//
//});
