define('works/components/formbuilder/core/models/adapters', function(require) {
    
    var AppletFormModel = require('works/components/formbuilder/core/models/applet_form');
    var AppletDocModel = require('works/components/formbuilder/core/models/user_doc');

    return {
        toAppletFormModel: function(appletFormData) {
            // 그냥 통과시킨다....
            return AppletFormModel.create(appletFormData.data);
        }, 
        
        toAppletDocModel: function(userDocData) {
            return userDocData;
            //var appletDocModel = new AppletDocModel(userDocData.get('values'), {id: userDocData.id});
            //userDocData.on('sync', function(model, resp, options) {
            //    appletDocModel.set(model.get('values'));
                //appletDocModel.trigger('sync', model, resp, options);
            //});
            //return appletDocModel;
        }
    }
});