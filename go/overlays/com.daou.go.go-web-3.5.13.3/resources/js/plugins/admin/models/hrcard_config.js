define([
    "backbone",
    "admin/collections/app_admin_list"
],

function(
    Backbone,
    AppAdminList
){
    
    var instance = null;
    var HRCardConfig = Backbone.Model.extend({
        url: function() {
            return "/ad/api/hrcard/manager";//com.daou.go.core.admin.controller.api / HRCardAdminController.java
        }
    },
    {
        get : function(){
            if(instance == null) instance = new HRCardConfig();
            instance.fetch({
                async:false,
                success: function(model, resp) {
                    var adminList = new AppAdminList(model.get('administrators'));
                    var menuActive = model.get('hrCardMenuActive');
                    model.set('administrators', adminList);
                    model.set('menuActive',menuActive);
                }
            });
            return instance;
        }
    }); 
    
    return {
        read : function(){
            return HRCardConfigModel = HRCardConfig.get();
        }
    };
});