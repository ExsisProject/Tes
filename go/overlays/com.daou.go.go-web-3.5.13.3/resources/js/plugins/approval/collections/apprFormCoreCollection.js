define([
        "backbone"
    ],
    function(
        Backbone
    ) {
    
        var ApprFormCoreModel = Backbone.Model.extend({
            defaults: {
                name: ''
            }
        });
    
        var ApprFormCoreCollection = Backbone.Collection.extend({
            model: ApprFormCoreModel,
            
            initialize: function (isAdmin) {
                this.isAdmin = isAdmin;
            },
            
            url: function () {
                if (this.isAdmin) {
                    return GO.contextRoot + 'ad/api/approval/apprform/core/admin/normal';
                }
                return GO.contextRoot + 'api/approval/apprform/core/admin';
            }
        });
        
        return ApprFormCoreCollection;
    });
