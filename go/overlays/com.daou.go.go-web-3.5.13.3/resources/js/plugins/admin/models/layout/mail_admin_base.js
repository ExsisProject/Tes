define('admin/models/layout/mail_admin_base', function (require) {

    var AdminBase = Backbone.Model.extend({

        initialize: function (options) {
            this.fetch({async:false})
        },
        url: function () {
            return GO.contextRoot + "ad/api/adminprofile";
        },
        getGraphType:function(){
           return this.get('admGraph');
        },
        getAdmLang:function(){
            return this.get('admLanguage');
        },
        getAdminTimeout:function(){
            return this.get('admTimeout');
        },
        getThumbnail:function(){
            return this.get('thumbnail');
        },
        setGraphType:function(val){
            this.set('admGraph',val )
        },
        setAdmLang:function(val){
            this.set('admLanguage',val )
        },
        setAdminTimeout:function(val){
            this.set('admTimeout',val )
        }
    });
    return AdminBase;
});