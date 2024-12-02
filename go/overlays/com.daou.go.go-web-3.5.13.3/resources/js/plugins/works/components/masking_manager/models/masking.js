define('works/components/masking_manager/models/masking', function(require) {
    var BaseModel = require('models/base_model');
    return BaseModel.extend({

        initialize: function(attr, options) {
            BaseModel.prototype.initialize.apply(this, arguments);

            options = options || {};
            this.useFilter = options.useFilter !== false;
        },

        url: function() {
            return GO.config('contextRoot') + 'api/works/applets/' + this.get('appletId') + '/blind';
        },

        parse: function(resp) {
            return this.useFilter ? this._filterMaskingFieldCids(resp.data) : resp.data;
        },

        _filterMaskingFieldCids: function(maskingModel) {
            var sessionUserId = GO.session().id;
            var accessCircle = maskingModel.accessCircle;
            var nodes = accessCircle.nodes || [];
            var circleUserIds = _.map(nodes, function(node) {
                return node.nodeId;
            });
            var sessionUserIsAccessible = _.contains(circleUserIds, sessionUserId);
            maskingModel.fieldCids = sessionUserIsAccessible ? [] : maskingModel.fieldCids;

            return maskingModel;
        }
    });
});