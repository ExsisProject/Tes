define('works/collections/actions', function (require) {

    return Backbone.Collection.extend({
        initialize : function(models, options){
            this.options = options || {};
            this.appletId = options.appletId;
            this.docId = options.docId;
        },

        url : function(){
            return GO.config('contextRoot') + 'api/works/applets/' + this.appletId + '/docs/' + this.docId + '/actions';
        }
    });
});