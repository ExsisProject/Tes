define("todo/views/menus/todo_list", [
    "app", 
    
    "todo/models/todos",
    "components/history_menu/main",
    
    "hgn!todo/templates/menus/menu_items_menu",
    "hgn!todo/templates/partials/_submenu_item",
    
    "todo/views/menus/create_todo",
    "todo/libs/util",
    "libs/go-utils", 
    
    "i18n!todo/nls/todo", 
    
    "jquery.ui"
], 
function(
    GO, 
    
    TodoList, 
    HistoryMenu, 
    
    renderMenuItemsMenu,
    renderSubmenuItemTpl,
    
    CreateTodoMenuView, 
    TodoUtil, 
    CommonUtil, 
    
    TodoLang
) {

    var TodoListMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView, 
        menuList = [], 
        StoreUtil = CommonUtil.store, 
        SELECTORS = {
            "menuitem": '.menuitem', 
            "foldable": '.foldable', 
            "submenu_list": '.submenu-list', 
            "favorite_list": '.favorite-list', 
            "my_todo_list": '.my-todo-list'
        }, 
        STORE_PREFIX = GO.session('id'), 
        FOLD_STATUS= {"folded": 'Y', "unfolded": 'N'}, 
        DEFAULT_FOLD_STATUS = FOLD_STATUS.unfolded;

    menuList.push({"classname": 'create-todo', "next_view": 'create_todo', "menu_name": TodoLang["새보드 만들기"], "icon_class": 'ic_plus', "has_child": false});
    menuList.push({"classname": 'goto-dashboard', "next_view": '', "menu_name": TodoLang["ToDO+ 홈"], "icon_class": 'ic_home', "has_child": false});
    menuList.push({"classname": 'favorite-list', "next_view": '', "menu_name": TodoLang["즐겨찾는 보드"], "icon_class": 'ic_star', "has_child": true});
    menuList.push({"classname": 'my-todo-list', "next_view": '', "menu_name": TodoLang["내 보드"], "icon_class": 'ic_myboard', "has_child": true});

    TodoListMenuView = HistoriableMenuView.extend({
        id: 'todo-list-menu', 
        className: 'content', 

        name: 'todo-list-menu', 
        title: 'Board', 

        template: renderMenuItemsMenu, 

        myTodoList: null, 
        favoriteTodoList: null, 

        events: {
            "click .create-todo a": "_callCreateTodoMenuView", 
            "click .menuitem-title": "_toggleSubmenu", 
            "click .link-board-url": "_navigate", 
            "click .goto-dashboard": "_goToDashboard"
        }, 

        initialize: function(options) {
            options = options || {};
            initCollections.call(this, options);
            HistoriableMenuView.prototype.initialize.call(this, options);
        }, 

        render: function() {
            var compiledTpl = this.template({
                "menulist": menuList
            });
            
            this.$el.empty().append(compiledTpl);
            this.setMenuClass('layer_todo_board');
            initSubMenus.call(this);
        }, 

        _reloadMyTodoList: function() {
            reloadSubmenu.call(this, 'my');
        }, 

        _reloadFavoriteTodoList: function() {
            reloadSubmenu.call(this, 'favorite');
        }, 

        _toggleSubmenu: function(e) {
            e.preventDefault();
            toggleMenu($(e.currentTarget));
        }, 

        _callCreateTodoMenuView: function(e) {
            var view = new CreateTodoMenuView({"myTodoList": this.myTodoList});

            e.preventDefault();
            this.forward(view);
        }, 

        _navigate: function(e) {
            var url = $(e.currentTarget).find('a').attr('href');

            e.preventDefault();
            GO.router.navigate(url, {"pushState": true, "trigger": true});
            this.close();
        }, 

        _goToDashboard: function(e) {
            e.preventDefault();
            GO.router.navigate('todo', {"pushState": true, "trigger": true});
            this.close();
        },
    }, {
        create: function(myTodoList, favoriteTodoList, options) {
            return new TodoListMenuView(_.extend({
                "myTodoList": myTodoList, 
                "favoriteTodoList": favoriteTodoList
            }, options || {}));
        }
    });

    function initCollections(options) {
        this.myTodoList = options.myTodoList || TodoList.createForMyBoard();
        this.favoriteTodoList = options.favoriteTodoList || TodoList.createForFavorite();

        this.listenTo(this.myTodoList, "add", this._reloadMyTodoList);
        this.listenTo(this.myTodoList, "remove", this._reloadMyTodoList);
        this.listenTo(this.favoriteTodoList, "add", this._reloadFavoriteTodoList);
        this.listenTo(this.favoriteTodoList, "remove", this._reloadFavoriteTodoList);
        this.listenTo(this.favoriteTodoList, "resort", this._reloadFavoriteTodoList);
    }

    function initSubMenus() {
        renderFoldableMenu('favorite', this.$el.find(SELECTORS.favorite_list), this.favoriteTodoList);
        renderFoldableMenu('my', this.$el.find(SELECTORS.my_todo_list), this.myTodoList);

        initSortable.call(this);
    }

    function initSortable() {
        var self = this;
        
        this.$el.find('.favorite-list .submenu-list').sortable({
            "items": 'li', 
            "containment": '#todo-list-menu', 
            
            stop: function(event, ui) {
                var $parent = ui.item.parent(), 
                    sortedIds = [];
                
                $parent.find('li').each(function(i, li) {
                    var todoId = $(li).data('todoid');
                    sortedIds.push(todoId);
                });
                
                self.favoriteTodoList.reorder(sortedIds).then(function(updated) {
                    self.favoriteTodoList.trigger('resort');
                }).otherwise(function(err) {
                    console.log(err);
                });
            }
        });
    }

    function reloadSubmenu(type) {
        var selector = {"my": SELECTORS.my_todo_list, "favorite": SELECTORS.favorite_list}[type], 
            collection = {"my": this.myTodoList, "favorite": this.favoriteTodoList}[type];

        renderFoldableMenu(type, this.$el.find(selector), collection);
    }

    function renderFoldableMenu(type, $foldable, collection) {
        var $submenus = $foldable.find('.submenu-list');

        if(getStoredFoldingStatus(type) === 'Y') {
            foldMenu($foldable);
        } else {
            unfoldMenu($foldable);
        }

        if(collection.length > 0) {
            $foldable.data('type', type);
            $submenus.empty();

            collection.each(function(model) {
                $submenus.append(renderSubmenuItem(model));
            });

            $foldable.show();
        } else {
            $foldable.hide();
        }        
    }

    function foldMenu($foldable) {
        var $submenus = $foldable.find('.submenu-list');

        $submenus.hide();
        $foldable.find('.btn-arrow').removeClass('ic_hide_up').addClass('ic_hide_down');
    }

    function unfoldMenu($foldable) {
        var $submenus = $foldable.find('.submenu-list');

        $submenus.show();
        $foldable.find('.btn-arrow').removeClass('ic_hide_down').addClass('ic_hide_up');
    }

    function toggleMenu($el) {
        var $foldable = $el.closest(SELECTORS.foldable), 
            $submenu = $foldable.find(SELECTORS.submenu_list), 
            type = $foldable.data('type');

        if($submenu.is(':visible')) {
            foldMenu($foldable);
            storeFoldStatus(type, FOLD_STATUS.folded);
        } else {
            unfoldMenu($foldable);
            storeFoldStatus(type, FOLD_STATUS.unfolded);
        }
    }

    function getStoredFoldingStatus(type) {
        var stored = StoreUtil.get(getStoredFoldStatusKey(type));

        if(!stored) {
            storeFoldStatus(type, DEFAULT_FOLD_STATUS);
            stored = DEFAULT_FOLD_STATUS;
        }

        return stored;
    }

    function getStoredFoldStatusKey(type) {
        return STORE_PREFIX + '-todolist-' + type + '-folded';
    }

    function storeFoldStatus(type, status) {
        StoreUtil.set(getStoredFoldStatusKey(type), status);
    }

    function renderSubmenuItem(model) {
        return renderSubmenuItemTpl({
            "model": model.toJSON(), 
            "board_url": 'todo/' + model.id
        })
    }

    return TodoListMenuView;
});