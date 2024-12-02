(function() {
    define([
        "backbone", 
        "app", 
        "board/views/home_list"
    ], 
    
    function(
        Backbone, 
        GO, 
        HomeListView
    ) {
        var BoardAppView = GO.BaseView.extend({
            render: function() {
                HomeListView.render();
            }
        }, {
            __instance__: null, 
            
            render: function() {
                var view = this.getInstance();
                view.render();
                return view;
            }
        });
        
        return BoardAppView;
    }); 
})();
