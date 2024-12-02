//define([
//    "todo/views/site/main"
//],
//
//function(SiteMain) {
//
//    var Layout = SiteMain.LayoutView,
//        TodoDetailView = SiteMain.TodoDetailView,
//        CardDetailView = SiteMain.CardDetailView;
//
//    function renderView(todoId) {
//        clearCardDetailView();
//        return Layout.render().then(function(layout) {
//            // var collections = layout.collections;
//            layout.$el.addClass('go_no_scroll');
//            return TodoDetailView.attachToLayout(layout, todoId);
//        }).otherwise(function(err) {
//            try {
//                GO.util.error(parseInt(err.status));
//            } catch (e) {
//                GO.router.navigate('todo', {"replace": true, "trigger": true});
//            }
//        });
//    }
//
//    function clearCardDetailView() {
//        if($('.ui-todocard-container').length > 0) {
//            $('.ui-todocard-container').data('view').remove();
//        }
//    }
//
//    return {
//        index: function(todoId) {
//            renderView(todoId);
//        },
//
//        showCard: function(todoId, todoItemId) {
//            renderView(todoId).then(function(todoDetailView) {
//                var todoModel = todoDetailView.getTodoModel(),
//                    todoItemModel = todoDetailView.getTodoItemModel(todoItemId);
//
//                CardDetailView.create(todoModel, todoItemModel);
//            });
//        }
//    };
//
//});