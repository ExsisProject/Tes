(function() {
    
    define([
        "jquery",
        "underscore", 
        "backbone", 
        "app", 
        "i18n!nls/commons",
        "report/collections/activity_logs",
        "hgn!report/templates/activity_log"
    ], 
    
    function(
        $, 
        _, 
        Backbone, 
        GO, 
        CommonLang,
        ActivityLogsCollection,
        ActivityTmpl
    ) {
        
        var lang = {
            activity_empty_msg : CommonLang["변경이력이 없습니다."]
        },
        defaults = {
            offset : 10
        }
        
        var ActivityLogsView = Backbone.View.extend({
            tagName: 'ul', 
            className: 'type_simple_list simple_list_alarm', 
            
            events: {

            }, 
            
            initialize: function(options) {
            	this.options = options || {};
                var self = this;
                this.offset = defaults.offset;
                this.collections = ActivityLogsCollection.fetch({id : this.options.seriesId});
                this.$el.on("add:activity_log", function(e, content){
                    self.add(content);
                });
            },
            
            render: function() {
                var data = [];
                this.$el.html("");
                this.collections.each(function(model){
                    data.push($.extend({}, model.toJSON(), {
                        createdAtBasicDate : GO.util.basicDate(model.get("createdAt"))
                    }));
                });
                
                this.$el.append(ActivityTmpl({
                    data : data,
                    lang : lang
                }));
                
                return this;
            },
            add : function(){
                this.collections = ActivityLogsCollection.fetch({id : this.options.seriesId});
                return this.render();
            },
            
            release: function() {
                this.childView.release();
                
                this.$el.off();
                this.$el.empty();
                this.remove();
            },
            
            more : function(){
                this.offset = this.offset + defaults.offset;
                this.reload();
                return this;
            },
            
            reload : function(){
                this.collections.fetch({async:false, data : {page : 0 , offset : this.offset}});
                this.render();
                return this;
            }
        }, 
        
        {
            __instance__: null, 
            
            create: function() {
                if(this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
                return this.__instance__;
            } 
        });
        
        function privateFunc(view, param1, param2) {
            
        }
        
        return ActivityLogsView;
        
    });
    
})();