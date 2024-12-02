define("todo/views/menus/todo_action", [
    "app", 
    "components/history_menu/main", 
    
    "hgn!todo/templates/menus/menu_items_menu",
    
    "todo/views/menus/add_member",
    "todo/views/menus/remove_confirm",
    
    "i18n!todo/nls/todo"
], 
function(
    GO, 
    HistoryMenu,
    
    renderMenuItemsMenu,
    
    AddMemberMenuView, 
    RemoveConfirmMenuView,
    
    TodoLang
) {

    var TodoActionMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView;

    TodoActionMenuView = HistoriableMenuView.extend({
        id: 'board-action-menu', 
        className: 'content', 

        template: renderMenuItemsMenu, 

        name: 'board-action-menu', 
        title: TodoLang["보드 메뉴"], 

        events: {
            "click .share-board a": "_callAddMemberMenu", 
            "click .remove-board a": "_callRemoveConfirmMenu", 
            "click .leave-board a": "_callLeaveConfirmMenu"
        }, 

        initialize: function(options) {
            options = options || {};
            HistoriableMenuView.prototype.initialize.call(this, options);
            this.setMenuClass('layer_todo_board');
        },

        render: function() {
            this.$el.empty().append(this.template({
                "menulist": getMenuList.call(this)
            }));
        }, 

        _callAddMemberMenu: function(e) {
            var nextView;

            e.preventDefault();

            if(this.model.isMember(GO.session('id'))) {
                nextView = new AddMemberMenuView({
                    "model": this.model
                });

                this.forward(nextView);
            }
        }, 

        _callRemoveConfirmMenu: function(e) {
            var self = this;

            if(!this.model.isOwner(GO.session('id'))) {
                return false;
            }

            e.preventDefault();
            this.forward(new RemoveConfirmMenuView({
                "subject": TodoLang["보드 삭제 타이틀"], 
                "description": TodoLang["보드 삭제 확인 메시지"], 
                afterClick: function() {
                    self.model.remove().then(function(updatedTodoModel) {
                        self.close();
                        GO.router.navigate('todo', {"pushState": true, "trigger": true});
                    })
                }
            }));
        }, 

        _callLeaveConfirmMenu: function(e) {
            var self = this, 
                userId = GO.session('id');

            if(this.model.isOwner(userId) || !this.model.isMember(userId)) {
                return false;
            }

            e.preventDefault();
            this.forward(new RemoveConfirmMenuView({
                "subject": TodoLang["보드나가기 타이틀"], 
                "description": TodoLang["보드나가기 확인 메시지"], 
                "buttonText": TodoLang["나가기"], 
                afterClick: function() {
                    self.model.leaveMember(userId).then(function(updatedTodoModel) {
                        self.close();
                        GO.router.navigate('todo', {"pushState": true, "trigger": true});
                    });
                }
            }));
        }
    });

    function getMenuList() {
        var menuList = [];

        menuList.push({"classname": 'share-board', "next_view": '', "menu_name": TodoLang["공유 설정"], "icon_class": false, "has_child": false});

        if(this.model.isOwner(GO.session('id'))) {
            menuList.push({"classname": 'remove-board', "next_view": '', "menu_name": TodoLang["보드 삭제"], "icon_class": false, "has_child": false});
        } else if(this.model.isMember(GO.session('id'))) {
            menuList.push({"classname": 'leave-board', "next_view": '', "menu_name": TodoLang["보드에서 나가기"], "icon_class": false, "has_child": false});
        }

        return menuList;
    }

    return TodoActionMenuView;

    // TODO: 테스트 코드 보강
});