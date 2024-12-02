define("todo/views/mobile/main", [
    "todo/views/mobile/layout",
    "todo/views/site/dashboard",
    "todo/views/site/todo_detail",
    "todo/views/site/card_detail"
],

function(
    LayoutView,
    TodoDashboardView,
    TodoDetailView,
    CardDetailView
) {

    // Composite Pattern
    return {
        LayoutView : LayoutView,
        TodoDashboardView: TodoDashboardView,
        TodoDetailView: TodoDetailView,
        CardDetailView: CardDetailView
    };

});
