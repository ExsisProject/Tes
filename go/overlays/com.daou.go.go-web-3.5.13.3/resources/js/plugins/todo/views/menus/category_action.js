define("todo/views/menus/category_action", [
    "components/history_menu/main", 
    
    "hgn!todo/templates/menus/menu_items_menu",
    
    "todo/views/menus/remove_confirm",
    "todo/views/menus/move_column",
    
    "i18n!todo/nls/todo", 
    "i18n!nls/commons"
], 
function(
    HistoryMenu,
    
    renderMenuItemsMenus,
    
    RemoveConfirmMenuView, 
    MoveColumnMenuView,
    
    TodoLang, 
    CommonLang
) {

    var ColumnActionMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView, 
        menuList = [];

    menuList.push({"classname": 'add-card', "next_view": '', "menu_name": TodoLang["카드 추가"], "icon_class": false, "has_child": false});
    menuList.push({"classname": 'move-column', "next_view": '', "menu_name": CommonLang["이동"], "icon_class": false, "has_child": false});
    menuList.push({"classname": 'remove-column', "next_view": '', "menu_name": TodoLang["이 칼럼을 삭제"], "icon_class": false, "has_child": false});

    ColumnActionMenuView = HistoriableMenuView.extend({
        id: 'column-action-menu', 
        className: 'content', 

        name: 'column-action-menu', 
        title: TodoLang["칼럼 메뉴"], 

        template: renderMenuItemsMenus, 
        columnView: null, 
        
        events: {
            "click .add-card a": "_callAddCardForm", 
            "click .remove-column a": "_callRemoveConfirmMenu", 
            "click .move-column a": "_callMoveColumnMenu"
        }, 

        initialize: function(options) {
            options = options || {};
            
            this.columnView = options.columnView;
            this.model = this.columnView.model;
            this.todoModel = this.columnView.todoModel;
            HistoriableMenuView.prototype.initialize.call(this, options);
            this.setMenuClass('layer_todo_board');
        }, 

        render: function() {
            this.$el.empty().append(this.template({
                "menulist": menuList
            }));
        }, 

        _callAddCardForm: function(e) {
            e.preventDefault();
            if(this.columnView.$el.find('.ui-add-card').css("display") != "none"){
            	this.columnView.$el.find('.btn-add-card').trigger('click');
            }
            this.close();
        }, 

        _callRemoveConfirmMenu: function(e) {
            var self = this;

            e.preventDefault();
            this.forward(new RemoveConfirmMenuView({
                "subject": TodoLang["칼럼 삭제 타이틀"], 
                "description": TodoLang["칼럼 삭제 확인 메시지"], 
                afterClick: function() {
                    var todoModel = self.todoModel, 
                        categoryModel = self.model;

                    // 칼럼 삭제 API
                    todoModel.removeCategory(categoryModel.id).then(function(updatedTodoModel) {
                        self.close();
                        self.columnView.remove();
                    })
                }
            }));
        }, 

        _callMoveColumnMenu: function(e) {
            var self = this;

            e.preventDefault();

            this.forward(new MoveColumnMenuView({"columnView": this.columnView}));
        }
    });

    return ColumnActionMenuView;
});