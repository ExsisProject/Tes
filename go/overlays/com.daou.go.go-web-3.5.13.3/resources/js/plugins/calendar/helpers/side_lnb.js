(function() {
    
    define([
        "backbone", 
        "hogan", 
        "text!calendar/templates/lnb.html", 
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar"
    ], 
    function(
        Backbone, 
        Hogan, 
        LnbTpl, 
        commonLang, 
        calLang
    ) {
        var compileLnbTpl = Hogan.compile(LnbTpl), 
            _slice = Array.prototype.slice;

        // 객체로 만들어 재사용 가능하도록 Helper로 작성
        var LnbVariableBuilder = (function() {
            // Constructor
            var LnbVariableBuilder = function(model) {
                this.model = model;
                this.__before = {context: this, func: function() {}};
                this.variables = { 
                    "label": "no names"
                };
                if(model.id) this.variables.id = model.id;
            }

            LnbVariableBuilder.prototype = {
                build: function() {
                    this.__before.func.call(this.__before.context, this, this.model);
                    return this.variables;
                }, 

                before: function(func, context) {
                    context = (typeof context === 'undefined' ? this: context);
                    if(typeof func === 'function') {
                        this.__before.context = context;
                        this.__before.func = func
                    } else {
                        throw new Error("Type of arguments is not a function.");
                    }
                }, 

                addButton: function(label, classnames, attrs) {
                    if(!("buttons?" in this.variables)) this.variables["buttons?"] = { buttons: [] };
                    this.variables["buttons?"]["buttons"].push({ 
                        "btn_label": label, 
                        "btn_classes": classnames, 
                        "attributes": attrs ? " " + attrs : null
                    });
                    return this;
                }, 

                addTag: function(label, classnames) {
                    if(!("tags?" in this.variables)) this.variables["tags?"] = [];
                    this.variables["tags?"].push({ "tag_classes": classnames, "tag_label": label });
                    return this;
                }, 

                useCheckbox: function(name, value, disabled, checked, attrs) {
                    var tattrs = attrs || {}, strAttrs = '', sbuff = [];
                    if(!("checkbox?" in this.variables)) this.variables["checkbox?"] = {};
                    this.variables["checkbox?"]["name"] = name;
                    this.variables["checkbox?"]["value"] = value;
                    this.variables["checkbox?"]["disabled?"] = disabled || false;
                    this.variables["checkbox?"]["checked?"] = checked || false;
                    
                    _.each(attrs, function(val, key) {
                        sbuff.push([key, '="', val, '"'].join(""));
                    });
                    
                    this.variables["checkbox?"]["attrs"] = sbuff.join(" ");
                    
                    return this;
                }, 

                setClassnames: function(classnames) {
                    if(!("li_classes" in this.variables)) this.variables["li_classes"] = [];
                    this.variables["li_classes"] = classnames;
                    return this;
                }, 

                setLabel: function(newName) {
                    this.variables["label"] = newName;
                }
            }

            return LnbVariableBuilder;
        })();

        var SideLnbHelper = (function() {
            var SideLnbHelper = function(collection, options) {
                this.options = _.defaults(options || {}, { "useCheckAll": false });
                this.collection = (collection instanceof Array ? collection : [collection]);
                this.variables = { 
                    "ul_classes": "side_depth",
                    "label": { "all" : commonLang["전체"] },
                    "use_check_all?": this.options.useCheckAll, 
                    "items": [] 
                };
            }

            SideLnbHelper.prototype = {
                setClassnames: function(newNames) {
                    this.variables["ul_classes"] = newNames;
                }, 

                setItemVars: function(func, context) {
                    _.each(this.collection, function(model) {
                        var obj = (model instanceof Backbone.Model ? model.toJSON() : model);
                        var varibaleBuilder = new LnbVariableBuilder(obj);
                        varibaleBuilder.before(func, context);
                        this.variables["items"].push(varibaleBuilder.build());
                    }, this);
                }, 
                
                setUseCheckAll: function( bool ) {
                    this.options.useCheckAll = bool;
                    this.variables["use_check_all?"] = bool;
                }, 

                render: function() {
                    return compileLnbTpl.render(this.variables);
                }
            }

            return SideLnbHelper;
        })();

        return SideLnbHelper;
    });
}).call(this);