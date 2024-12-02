define('works/components/formbuilder/core/models/user_doc', function(require) {

    var Backbone = require('backbone');

    /**
     * @immutable
     * 사용자가 입력한 값을 각 컴포넌트에서 사용할 수 있도록 한다.
     * 각 컴포넌트에서는 값의 변경은 일어나지 않도록 한다.
     */
    return Backbone.Model.extend({
        appletId: null,
        initialize: function(attrs, options) {
            this.modelName = 'user_doc'; // 디버깅 용도
            options = options || {};
            this.options = options;
            this.appletId = null;
            this.id = options.id;
            if (options.hasOwnProperty('appletId')) {
                this.setAppletId(options.appletId);
            }
        },

        setAppletId: function(appletId) {
            this.appletId = appletId;
        },

        getAppletId: function() {
            return this.appletId;
        }
    });
});