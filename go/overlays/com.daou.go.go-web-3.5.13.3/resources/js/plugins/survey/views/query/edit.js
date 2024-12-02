(function() {
    define([
        "jquery", 
        "backbone", 
        "survey/models/query", 
        "survey/views/query/form", 
        "survey/views/query/preview"
    ], 
    
    function(
        $, 
        Backbone, 
        QueryModel, 
        QueryFormView, 
        QueryPreviewView
    ){
        
        var QueryEditView = Backbone.View.extend({
            tagName: 'li', 
            className: 'query-item', 
            
            callbacks: {}, 
            
            initialize: function() {
                if(!this.model) {
                    this.model = new QueryModel();
                }
                
                this.callbacks.start = $.Callbacks();
                this.callbacks.complete = $.Callbacks();
                
                this.$el.on('click:edit-end', $.proxy(function(e, model) {
                	this.model = model;
                    this.renderPreview();
                    this.callbacks.complete.fire();
                }, this));
                                
                this.$el.on('click:edit-start', $.proxy(function() {
                    this.renderForm();
                    this.callbacks.start.fire();
                }, this));
            }, 
            
            release: function() {
            	var view = this.$el.data('view');
                if(view) view.undelegateEvents();
                
                this.$el
                    .attr('class', '')
                    .addClass(this.className)
                    .empty();
            }, 
            
            onStart: function(callback) {
                this.callbacks.start.add(callback);
            }, 
            
            onComplete: function(callback) {
                this.callbacks.complete.add(callback);
            }, 
            
            renderForm: function() {
                this.release();
                var qfv = new QueryFormView({ "el": this.el, "model": this.model });
                qfv.render();
                
                return qfv;
            }, 
            
            renderPreview: function() {
                this.release();
                this.$el.addClass('sortable');
                var qev = new QueryPreviewView({ "el": this.el, "model": this.model });
                qev.render();
                
                return qev;
            }
            
        }, {
            create: function(surveyId) {
                return this.modify(new QueryModel({"surveyId": surveyId}));
            }, 
            
            modify: function(model) {
                var instance = new this.prototype.constructor({"model": model});
                instance.renderForm();
                
                return instance;
            }, 
            
            preview: function(model) {
                var instance = new this.prototype.constructor({"model": model});
                instance.renderPreview();
                
                return instance;
            }
        });
        
        return QueryEditView;
    });
    
})();