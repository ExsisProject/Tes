define("views/notification/header", function(require) {
    var _ = require("underscore");
    var Backbone = require("backbone");
    var HeaderTmpl = require("hgn!templates/notification/header");
    var commonLang = require("i18n!nls/commons");

    var NotificationHeaderView = Backbone.View.extend({

        tagName: 'header',
        events: {
            'click #arrow_button': 'onArrowButtonClicked',
            'click #DeleteAll': 'onClickDeleteAll',
            'click #ReadAll': 'onClickReadAll'
        },

        onArrowButtonClicked: function() {
            console.log("Nothing added on onArrowButtonClicked!");
        },

        initialize: function(options) {
            this.options = options || {};
            this.$el.empty();
            this.variables = {
                "label": {
                    "add": commonLang["추가"],
                    "more": commonLang["자세히 보기"]
                }
            };
            if(this.options.title) this.setTitle(this.options.title);
            if(this.options.buttons) this.addButton(this.options.buttons);
            if(this.options.icontype) this.setIconType(this.options.icontype);
            if(this.options.arrowButton) this.setArrowButton(this.options.arrowButton);
        },

        render: function() {
            this.$el.empty().append(HeaderTmpl(this.variables));
            return this.el;
        },

        setTitle: function(title) {
            this.variables["title"] = title;
        },

        setIconType: function(icontype) {
            this.variables["header_icon_type"] = icontype;
        },

        setCount: function(count) {
            this.$el.find('.num').text(count);
        },

        addButton: function(buttons) {
            this.variables["buttons"] = _.map(buttons, function(option) {
                this["onClick" + option.id] = function() {
                    if (typeof option.action == "function") {
                        option.action();
                    }
                };
                return {
                    "id" : option.id,
                    "button_icon_class": option.icontype,
                    "button_label": option.label
                }
            }, this);
        },

        setArrowButton: function(option) {
            this.onArrowButtonClicked = function() {
                document.location = option.link;
            };
            this.variables["arrow_button_class"] = option.type;
            this.variables["arrow_button_title"] = option.title;
        }

    });

    return NotificationHeaderView;
});
