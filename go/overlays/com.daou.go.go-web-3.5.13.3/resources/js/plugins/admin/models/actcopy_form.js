define([
    "backbone"
],
function(Backbone) {

    /**
    *
    * 결재 양식 모델
    *
    */
    var ActcopyFormModel = Backbone.Model.extend({

        defaults: {
            name: '',
            alias: '',
            state: 'HIDDEN', // NORMAL, HIDDEN
            creator: null,
            templateHtml: ''
        },

        url: function() {
            var baseUrl = GO.contextRoot + 'ad/api/approval/actcopyform/';
            return _.isUndefined(this.get('id')) ? baseUrl : baseUrl + this.get('id');
        },
        
        validate : function(attrs, options){
            if (_.isEmpty(attrs.name)) {
                return 'name_required';
            } else if (_.isEmpty(attrs.alias)) {
                return 'alias_required';
            } else if (attrs.name.length > 20) {
                return 'name_invalid_length';
            } else if (attrs.alias.length > 20) {
                return 'alias_invalid_length';
            }else if (!_.isEmpty(attrs.description) && ( attrs.description.length > 255 ) ){
            	return 'description_invalid_length';
            } else if (_.isEmpty(attrs.companyDocFolder) || _.isUndefined(attrs.companyDocFolder.id)) {
                return 'folder_required';
            }
        }
    }, 
    {
        STATES : ["NORMAL", "HIDDEN"]
    });

    return ActcopyFormModel;
});