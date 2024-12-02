define('works/models/action', function (require) {

    var BaseModel = require('models/base_model');
    return BaseModel.extend({
        initialize : function(attributes, options){
            this.options = options || {};
            this.appletId = options.appletId;
            this.docId = options.docId;
            this.actionId = options.actionId;
        },

        url : function(){
            return GO.config('contextRoot') + 'api/works/applets/' + this.appletId + '/docs/' + this.docId + '/actions/' + this.actionId;
        },

        setActionId: function(actionId) {
            this.actionId = actionId;
        },

        setUrl : function(url){
            this.url = url;
        }
    });
});

