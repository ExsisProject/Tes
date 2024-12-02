
define("todo/views/mobile/side", [
    "backbone", 
    "when", 
    "app",
    
    "hgn!todo/templates/mobile/mobile_side",
    "text!todo/templates/partials/_mobile_side_menu.html",
    
    "i18n!todo/nls/todo"
],
function(
    Backbone, 
    when, 
    GO,
    
    renderSide, 
    mobileSideMenuTpl, 
    
    TodoLang
) { 
    var TodoMobileSideView;

    TodoMobileSideView = Backbone.View.extend({
        id: 'todo-side-menu', 
        collections: {}, 
        template: renderSide, 
        
        events: {
            "vclick a[data-category]": "_tabSideMenu",
            "vclick a[data-navigate]": "goSideMenu"
        },
        
        initialize : function(options) {
            this.collections = options.collections;
            this.listenTo(this.collections.my, 'add', this.reload);
            this.listenTo(this.collections.favorite, 'add', this.reload);
            this.listenTo(this.collections.favorite, 'remove', this.reload);
            this.listenTo(this.collections.favorite, 'resort', this.reload);
        },
        
        render : function() {
            var defer = when.defer();

            render.call(this);            
            $('body').data('sideApp', this.options.packageName);
            
            defer.resolve(this);

            return defer.promise;
        },

        goSideMenu : function(e){
            e.preventDefault();
            e.stopPropagation();
            var targetEl = $(e.currentTarget);
            var url = targetEl.attr("data-navigate");
            GO.router.navigate(url, {trigger: true});
        },

        reload: function() {
            render.call(this);
        }, 
        
        getStoredCategory: function() {             
            return GO.util.store.get(CATE_STORE_KEY);
        }, 
        
        storeCategory: function(category) {
            // return GO.util.store.set(CATE_STORE_KEY, category, {type: 'session'});
        }, 
        
        _tabSideMenu : function(e){
            e.preventDefault();
            var $el = $(e.currentTarget);
            
            this.storeCategory($el.data('category'));
            
            GO.router.navigate($el.data('href'), {trigger: true, pushState: true});
            e.stopPropagation();
        }
    });

    function render() {
        this.$el.empty().append(this.template({
            "myTodoList": parseCollection(this.collections.my), 
            "favoriteList": parseCollection(this.collections.favorite), 
            "hasFavorite?": this.collections.favorite.length > 0,
            "label": {
                "favorite": TodoLang["즐겨찾는 보드"],
                "mytodo": TodoLang["내 보드"]
            }
        }, {
            "_mobile_side_menu": mobileSideMenuTpl
        }));
    }

    function parseCollection(collection) {
        var cloned = collection.toJSON(), 
            icon = {"my": 'ic_board', "favorite": 'ic_board'}[collection.modelType] || 'ic_board';

        _.map(cloned, function(model) {
            model.relativeLink = 'todo/' + model.id;
            model.absoluteLink = GO.config('contextRoot') + 'app/' + model.relativeLink;
            model.icon = icon;
        });

        return cloned;
    }
    
    return TodoMobileSideView;
});
