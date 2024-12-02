define("todo/views/menus/main", [
    "components/history_menu/main", 
    "todo/views/menus/todo_list",
    "todo/views/menus/create_todo",
    "todo/views/menus/todo_action",
    "todo/views/menus/category_action",
    "todo/views/menus/todoitem_action",
    "todo/views/menus/remove_confirm",
    "todo/views/menus/public_option",
    "todo/views/menus/board_title",
    "todo/views/menus/add_member",
    "todo/views/menus/select_label",
    "todo/views/menus/edit_label",
    "todo/views/menus/move_card",
    "todo/views/menus/move_column",
    "todo/views/menus/search_member",
    "todo/views/menus/member_profile",
    "todo/views/menus/duedate"
], function(
    HistoryMenu, 
    TodoListMenuView, 
    CreateTodoMenuView, 
    TodoActionMenuView,
    TodoCategoryActionMenuView, 
    TodoItemActionMenuView, 
    RemoveConfirmMenuView, 
    PublicOptionMenuView, 
    BoardTitleMenuView, 
    AddMemberMenuView, 
    SelectLabelMenuView, 
    EditLabelMenuView, 
    MoveCardMenuView, 
    MoveColumnMenuView, 
    SearchMemberMenuView, 
    MemberProfileMenuFactory, 
    DuedateMenuView
) {

    // factory
    return {
        CreateTodoMenuView: CreateTodoMenuView, 
        TodoListMenuView: TodoListMenuView, 
        BoardActionMenuView: TodoActionMenuView, 
        ColumnActionMenuView: TodoCategoryActionMenuView,
        CardActionMenuView: TodoItemActionMenuView, 
        RemoveConfirmMenuView: RemoveConfirmMenuView, 
        PublicOptionMenuView: PublicOptionMenuView, 
        BoardTitleMenuView: BoardTitleMenuView, 
        AddMemberMenuView: AddMemberMenuView, 
        SelectLabelMenuView: SelectLabelMenuView, 
        EditLabelMenuView: EditLabelMenuView, 
        MoveCardMenuView: MoveCardMenuView, 
        MoveColumnMenuView: MoveColumnMenuView, 
        SearchMemberMenuView: SearchMemberMenuView, 
        BoardMemberProfileMenuView: MemberProfileMenuFactory.BoardMemberProfileMenuView, 
        CardMemberProfileMenuView: MemberProfileMenuFactory.CardMemberProfileMenuView, 
        DuedateMenuView: DuedateMenuView, 

        // @deprecated
        TodoActionMenuView: TodoActionMenuView, 

        createMenu: function(fisrtMenuView) {
            return HistoryMenu.create(fisrtMenuView);
        }, 

        attachTo: HistoryMenu.attachTo,

        // @deprecated
        createTodoListMenu: function(myTodoList, favoriteTodoList) {
            var todoListMenuView = TodoListMenuView.create(myTodoList, favoriteTodoList);
            return this.createMenu(todoListMenuView);
        }, 

        // @deprecated
        createPublicOptionMenu: function(options) {
            return this.createMenu(new PublicOptionMenuView(options));
        }
    };
});