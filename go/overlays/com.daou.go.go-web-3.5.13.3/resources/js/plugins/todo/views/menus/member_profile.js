define("todo/views/menus/member_profile", [
    "components/history_menu/main", 
    
    "hgn!todo/templates/menus/member_profile_menu",
    "text!todo/templates/menus/menu_items_menu.html",
    
    "todo/views/menus/remove_confirm", 
    "i18n!todo/nls/todo", 
    "i18n!nls/commons"
], 
function(
    HistoryMenu,
    
    renderMemberProfileMenu, 
    menuItemsMenuTpl, 
    
    RemoveConfirmMenuView, 
    TodoLang, 
    CommonLang
) {

    var MemberProfileMenuView, 
        BoardMemberProfileMenuView, 
        CardMemberProfileMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView;

    /**
        this.model은 사용하지 않는다.
     */
    MemberProfileMenuView = HistoriableMenuView.extend({
        id: 'member-profile-menu', 
        className: 'content', 

        template: renderMemberProfileMenu, 

        name: 'member-profile-menu', 
        title: TodoLang["멤버"], 

        menuList: [], 

        initialize: function(options) {
            options = options || {};
            this.userId = options.userId;
            this.todoModel = options.todoModel;
            this.memberInfo = this.todoModel.getMember(this.userId);
            this.menuList = getTypedMenuList.call(this, this.type || 'board');
            HistoriableMenuView.prototype.initialize.call(this, options);
        }, 

        render: function() {            
            this.$el.empty().append(this.template({
                "member": this.memberInfo, 
                "menulist": this.menuList,
                "mailExposure" : GO.config('mailExposure')
            }, {
                "menu_items_menu": menuItemsMenuTpl
            }));
            this.setMenuClass('layer_new_board');
        }
    });

    BoardMemberProfileMenuView = MemberProfileMenuView.extend({
        type: 'board', 

        events: {
            "click .change-owner a": "_changeOwner", 
            "click .remove-member a": "_callRemoveMemberConfirmMenu", 
            "click .leave-board a": "_callLeaveConfirmMenu"
        }, 

        initialize: function(options) {
            options = options || {};
            MemberProfileMenuView.prototype.initialize.call(this, options);
        }, 

        _changeOwner: function(e) {
            var self = this, 
                sessionUserId = GO.session('id'), 
                userId = this.userId;

            if(!this.todoModel.isOwner(sessionUserId)) {
                return false;
            }

            e.preventDefault();
            this.forward(new RemoveConfirmMenuView({
                "subject": TodoLang["운영자 변경 타이틀"], 
                "description": TodoLang["운영자 변경 확인 메시지"], 
                "buttonText": CommonLang["변경"], 
                afterClick: function() {
                    self.todoModel.updateOwner(userId).then(function(updatedTodoModel) {
                        self.close();
                    });
                }
            }));
        }, 

        _callRemoveMemberConfirmMenu: function(e) {
            var self = this, 
                sessionUserId = GO.session('id'), 
                userId = this.userId;

            if(!this.todoModel.isOwner(sessionUserId)) {
                return false;
            }

            e.preventDefault();
            this.forward(new RemoveConfirmMenuView({
                "subject": TodoLang["보드 멤버 삭제 타이틀"], 
                "description": TodoLang["보드 멤버 삭제 확인 메시지"], 
                "buttonText": TodoLang["제외"], 
                afterClick: function() {
                    self.todoModel.removeMember(userId).then(function(updatedTodoModel) {
                        self.back(2);
                        self.close();
                    });
                }
            }));
        }, 

        _callLeaveConfirmMenu: function(e) {
            var self = this, 
                sessionUserId = GO.session('id');

            if(this.todoModel.isOwner(sessionUserId) || !this.todoModel.isMember(sessionUserId)) {
                return false;
            }

            e.preventDefault();
            this.forward(new RemoveConfirmMenuView({
                "subject": TodoLang["보드나가기 타이틀"], 
                "description": TodoLang["보드나가기 확인 메시지"], 
                "buttonText": TodoLang["나가기"], 
                afterClick: function() {
                    self.todoModel.leaveMember(sessionUserId).then(function(updatedTodoModel) {
                        self.close();
                        GO.router.navigate('todo', {"pushState": true, "trigger": true});
                    });
                }
            }));
        }
    }); 

    CardMemberProfileMenuView = MemberProfileMenuView.extend({
        type: 'card', 

        events: {
            "click .remove-member": "_removeMember"
        }, 

        initialize: function(options) {
            options = options || {};
            this.todoItemModel = options.todoItemModel;
            MemberProfileMenuView.prototype.initialize.call(this, options);
        }, 

        _removeMember: function(e) {
            var $target = $(e.currentTarget), 
                userId = this.memberInfo.id, 
                self = this;

            e.preventDefault();
            this.todoItemModel.removeMember(userId).then(function(todoItemModel) {
                self.close();
            });
        }
    });

    function getTypedMenuList(type) {
        return {
            "board": getBoardMenuList.call(this), 
            "card": getCardMenuList.call(this)
        }[type];
    }

    function getBoardMenuList() {
        var menuList = [], 
            todoModel = this.todoModel;

        if(todoModel.isOwner(GO.session("id"))) {
            if(GO.session('id') === this.userId) {
                ;
            } else {
                menuList.push({"classname": 'change-owner', "next_view": '', "menu_name": TodoLang["운영자로 지정"], "icon_class": false, "has_child": false});
                menuList.push({"classname": 'remove-member', "next_view": '', "menu_name": TodoLang["이 멤버를 보드에서 제외"], "icon_class": false, "has_child": false});
            }
        } else {
            if(GO.session('id') === this.userId) {
                menuList.push({"classname": 'leave-board', "next_view": '', "menu_name": TodoLang["보드에서 나가기"], "icon_class": false, "has_child": false});
            }
        }

        return menuList;
    }

    function getCardMenuList() {
        var menuList = [];
        menuList.push({"classname": 'remove-member', "next_view": '', "menu_name": TodoLang["이 멤버를 카드에서 제외"], "icon_class": false, "has_child": false});
        return menuList;
    }

    return {
        BoardMemberProfileMenuView: BoardMemberProfileMenuView, 
        CardMemberProfileMenuView: CardMemberProfileMenuView
    };
});