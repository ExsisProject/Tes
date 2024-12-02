define([
    "backbone",
    "admin/collections/app_admin_list"
],

function(
    Backbone,
    AppAdminList
){
    
    var instance = null;
    var DashboardConfig = Backbone.Model.extend({
        url: function() {
            return "/ad/api/dashboardconfig";
        }
    },
    {
        get : function(){
            if(instance == null) instance = new DashboardConfig();
            instance.fetch({
                async:false,
                success: function(model, resp) {
                    var adminList = new AppAdminList(model.get('administrators'));
                    var specList = new Backbone.Collection(model.get('specs'));
                    specList.each(function(m) {
                        if (m.get('active') == 'true' || m.get('active') == true) {
                            m.set('active', true);
                        } else {
                            m.set('active', false);
                        }
                    });
                    model.set('administrators', adminList);
                    model.set('specs', specList);
                }
            });
            return instance;
        }
    }); 
    
    return {
        read : function(){
            return dashboardConfigModel = DashboardConfig.get();
        }
    };
});