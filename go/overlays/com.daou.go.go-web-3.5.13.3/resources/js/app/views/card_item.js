(function() {
    
    define([
        "jquery", 
        "underscore", 
        "backbone", 
        "hgn!templates/card_item"
    ], 
    
    function(
        $,
        _, 
        Backbone,
        Template
    ) {
        
        var CardItemView = Backbone.View.extend({
            tagName: 'section', 
            className: 'card_item', 
            
            initialize: function(options) {
            	this.options = options || {};
            	
                if(this.options.className) {
                    this.$el.addClass(this.options.className);
                }
                
                this.options.hasButtons = false;
            },
            
            render: function() {
                this.options.hasButtons = (this.options.buttons || []).length > 0;
                this.$el.append(Template(this.options));
                                
                _.each(this.options.buttons, function(v, k) {
                    
                    var $el = $(makeBtnTemplate(v.name, v.classname, v.label));
                    
                        $el.on('click', _.bind(function(e) {
                            var target = e.currentTarget;
                            if(v['onClick'] && _.isFunction(v.onClick)) {
                                v.onClick(e, target, this);
                            }
                            this.$el.trigger('clicked:button', [target, this]);
                        }, this));
                    
                    this.$el.find('.card_action').append($el);
                }, this);
            }, 
            
            setHeader: function(html) {
                this.options.header = html;
                return this;
            },
            
            setSubject: function(html) {
                this.options.subject = html;
                return this;
            }, 
            
            setContent: function(html) {
                this.options.content = html;
                return this;
            }, 
            
            addButtons: function(btnOpt) {
                this.options.buttons = this.options.buttons || [];
                this.options.buttons.push(btnOpt);
                
                return this;
            }, 
            
            bind: function(eventName, callback) {
                return this.$el.on(eventName, callback);
            }
        });
        
        function makeBtnTemplate(name, classnames, label) {
            var cns = ['ic'];
            if(!!classnames) cns.push(classnames);
            
            return '<a class="btn_lead" data-name="'+name+'"><span class="'+cns.join(' ')+'"></span><span class="txt">'+label+'</span></a>';
        }
        
        return CardItemView;
        
    });
    
})();