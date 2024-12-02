define("mail/views/layouts/defaults", function(require) {

    var DefaultLayout = require("views/layouts/default");

    var __super__ = DefaultLayout.prototype,
        _slice = Array.prototype.slice,
        MailDefaultLayout;

    MailDefaultLayout = DefaultLayout.extend({
        contentTopView: null,
        initialize: function() {
            var args = _slice.call(arguments);
            // this.contentTopView = new ContentTopView();
            __super__.initialize.apply(this, args);
        },
        setTitle: function(html) {
            this.contentTopView.setTitle(html);
            return this;
        },

        // Override
        render: function() {
            var self = this;
            //self.appName = 'task';
            this.setUseSide(false);
            return __super__.render.apply(this);
        },

        renderContentTop: function() {
            this.contentTopView.render();
            this.getContentElement().empty().append(this.contentTopView.el);
        }
    }, {
        __instance__: null,

        create: function() {
            if(this.__instance__ === null) {
                this.__instance__ = new this.prototype.constructor();
            }
            return this.__instance__;
        }
    });

    return MailDefaultLayout;
});