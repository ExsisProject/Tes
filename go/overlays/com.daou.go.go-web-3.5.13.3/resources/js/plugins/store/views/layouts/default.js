define("store/views/layouts/default",  function(require) {

    var DefaultLayout = require('views/layouts/default');

    var StoreLayoutView = DefaultLayout.extend({
        name : "store",
        className : "go_skin_default go_full_screen go_renew",

        initialize : function(options) {
            DefaultLayout.prototype.initialize.call(this, options);
            GO.config('workspace_expansion_button_visible', false);
        },

        _init: function() {
            this.setUseSide(false);
            this.setUseContentWrapper(false);
        },

        render : function () {
            var self = this;
            self.appName = 'store';
            return DefaultLayout.prototype.render.call(self);
        }
    }, {
        __instance__: null
    });

    return StoreLayoutView;
});