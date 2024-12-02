(function() {
    
    define([
        "backbone", 
        "survey/collections/surveys", 
        "survey/views/dashboard/todo", 
        "survey/views/dashboard/created",
        "components/backdrop/backdrop"
    ], 
    
    function(
        Backbone, 
        SurveyCollection, 
        DashboardTodoListView, 
        DashboardCreatedListView,
        BackdropView
    ) {
        
        var DashboardView = Backbone.View.extend({
            tagName: 'div', 
            className: 'content_page dashboard_survey', 

            events: {
                "click .btn-toggle-desc" : "_toggleDesc"
            },
            
            initialize: function() {
            	this.collection = new SurveyCollection();
                this.todoListView = new DashboardTodoListView();
                this.createdListView = new DashboardCreatedListView();
            },
            
            render: function() {
            	this.$el.append(this.todoListView.el, this.createdListView.el);
                
                this.todoListView.render();
                this.createdListView.render();
            },

            _toggleDesc : function(e) {
                if (!this.backdropView) {
                    this.backdropView = new BackdropView();
                    this.backdropView.backdropToggleEl = $(e.currentTarget).find(".tooltip-desc");
                    this.backdropView.linkBackdrop($(e.currentTarget));
                }
            }
            
        });
        
        return DashboardView;
        
    });
    
})();