define("laboratory/views/layouts/default", function (require) {

    var DefaultLayout = require('views/layouts/default');
    var ContentTopView = require('laboratory/views/content_top');

    return DefaultLayout.extend({
        contentTopView: null,
        name: "laboratory",
        className: "go_skin_default go_full_screen go_renew",

        initialize: function (options) {
            DefaultLayout.prototype.initialize.call(this, options);
            this.contentTopView = new ContentTopView();
            GO.config('workspace_expansion_button_visible', false);
        },

        _init: function () {
            this.setUseSide(false);
            this.setUseContentWrapper(true);
            if (GO.session()['theme'] !== 'THEME_ADVANCED') this.setUseOrganogram(false);
        },


        render: function () {
            var self = this;
            this.appName = 'laboratory';
            return DefaultLayout.prototype.render.apply(this).done(function () {
                self.renderContentTop();
            });

        },

        renderContentTop: function () {
            this.getContentElement().append(this.contentTopView.el);
            this.contentTopView.render();
        }

    }, {
        __instance__: null,

        create: function () {
            if (this.__instance__ === null) {
                this.__instance__ = new this.prototype.constructor();
            }
            return this.__instance__;
        }
    });
});