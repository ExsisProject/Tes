define([
    "backbone",
    "admin/collections/app_admin_list"
],

function(
    Backbone,
    AppAdminList
){
    
    var instance = null;

    var VacationConfig = Backbone.Model.extend({
        url: function() {
            return "/ad/api/ehr/vacation/config";
        }
    },
    {
        get : function(type){
            if(instance == null) instance = new VacationConfig(type);
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
    
    return VacationConfig;
});