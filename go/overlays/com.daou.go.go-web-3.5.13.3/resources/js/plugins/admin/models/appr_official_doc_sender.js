define([
    "backbone"
],
function(Backbone) {

    /**
    *
    * 직인 모델
    *
    */
    var OfficialDocSenderModel = Backbone.Model.extend({
        defaults: {
            state: 'HIDDEN', // NORMAL, HIDDEN
        },

        url: function() {
            var baseUrl = GO.contextRoot + 'ad/api/approval/manage/official/sender/';

            return _.isUndefined(this.get('id')) ? baseUrl : baseUrl + this.get('id');
        },

        validate : function(attrs, options){
            if (_.isEmpty(attrs.name)) {
                return 'name_required';
            } else if (attrs.name.length > 100) {
                return 'name_invalid_length';
            }
        }
    });

    return OfficialDocSenderModel;
});