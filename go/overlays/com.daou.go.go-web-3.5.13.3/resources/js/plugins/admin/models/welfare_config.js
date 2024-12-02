define([
    "backbone",
    "admin/collections/app_admin_list"
],

function(
    Backbone,
    AppAdminList
){
    
    var instance = null;

    var WelfareConfig = Backbone.Model.extend({
        url: function() {
            return "/ad/api/ehr/welfare/config";
        }
    },
    {
        get : function(type){
            if(instance == null) instance = new WelfareConfig(type);
            instance.fetch({
                async:false,
                success: function(model, resp) {
                    var adminList = new AppAdminList(model.get('administrators'));
                    var menuActive = model.get('menuActive');
                    model.set('administrators', adminList);
                    model.set('menuActive',menuActive);
                }
            });
            return instance;
        }
    }); 
    
    return WelfareConfig;
});