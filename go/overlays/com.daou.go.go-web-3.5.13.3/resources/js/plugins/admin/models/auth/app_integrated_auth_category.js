define('admin/models/auth/app_integrated_auth_category', function (require) {

    var DetailModel = require('admin/models/auth/app_integrated_auth');
    var _ = require('underscore');

    var AuthModel = Backbone.Model.extend({

        initialize: function (options) {
            this.attributes = options.attributes;
            this.appAuthGroup = this.get('appAuthGroup');
            this.groupName = this.get('groupName');
            this.contentLevel = !!this.get('contentLevel');

            this.appAuthModels = [];

            var models = this.get('appAuthModels');

            var self = this;
            _.forEach(models, function(model){
                if( !model ){ return; }
                self.appAuthModels[self.appAuthModels.length] = new DetailModel(self.contentLevel ? model.attributes : model, self.groupName, self.appAuthGroup);
            });

        },
    });
    return AuthModel;
});