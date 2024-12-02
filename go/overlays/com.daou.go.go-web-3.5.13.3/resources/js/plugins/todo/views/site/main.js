define("todo/views/site/main", [
    "todo/views/site/layout",
    "todo/views/site/dashboard",
    "todo/views/site/todo_detail",
    "todo/views/site/card_detail",
    "todo/views/site/search_result"
],

function(
    LayoutView,
    TodoDashboardView,
    TodoDetailView,
    CardDetailView,
    SearchResultView
) {

    // Composite Pattern
    return {
        LayoutView : LayoutView,
        TodoDashboardView: TodoDashboardView,
        TodoDetailView: TodoDetailView,
        CardDetailView: CardDetailView,
        SearchResultView: SearchResultView
    };

});
