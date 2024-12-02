define("todo/views/extensions/base", [
    "backbone",
    
    "hgn!todo/templates/extensions/extension_base",
    
    "i18n!nls/commons"
],

function(
    Backbone,
    
    renderExtensionBase,
    
    CommonLang
) {
    var RESIZE_EVENT_NAME = 'resize.todoextensionview',
        EXTENSION_ATTR_NAME = 'data-todo-extension',
        extensionBaseTpl = renderExtensionBase,
        TodoExtensionBaseView;

    TodoExtensionBaseView = Backbone.View.extend({
        name: 'todo-extenstion-view',
        className: 'view_type',

        onClose: function() {},
        onResize: function() {},

        events: {
            "click .btn-close" : '_close'
        },

        initialize: function(options) {
            var opts = options || {};
            this.onClose = opts.onClose || function() {};
            this.onResize = opts.onResize || function() {};

            this.$el.addClass(this.name);
            this.$el.attr(EXTENSION_ATTR_NAME, true);
            this.$el.data('instance', this);
            this.$el.append(extensionBaseTpl({
                label: {
                    "close": CommonLang["닫기"]
                }
            }));
        },

        setContent: function(content) {
            this.$el.find('.todo-extension-content').empty()
                .append(content);
            return this;
        },

        close: function() {
            $(window).off(RESIZE_EVENT_NAME);
            this.remove();
            this.onClose();
        },

        resize: function(height) {
            this.$el.height(height);
            this.onResize.call(this, height);
        },

        _close: function(e) {
            e.preventDefault();
            this.close();
        }
    }, {
        attachTo: function($target, options) {
            var instance;

            $('[' + EXTENSION_ATTR_NAME + ']').each(function(i, el) {
                $(el).data('instance').close();
            });

            instance = new this.prototype.constructor(options || {});
            $target.append(instance.el);
            instance.render();

            return instance;
        }
    });

    return TodoExtensionBaseView;
});