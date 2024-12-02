define([
    "backbone"
],
function(Backbone) {

    /**
    *
    * 공문 발송 문서 모델
    *
    */
    var OfficialDocFormModel = Backbone.Model.extend({

        defaults: {
            name: '',
            state: 'HIDDEN', // NORMAL, HIDDEN
            html: ''
        },

        url: function() {
            var baseUrl = GO.contextRoot + 'ad/api/approval/manage/official/form/';
            
            return _.isUndefined(this.get('id')) ? baseUrl : baseUrl + this.get('id');
        },
        
        setSaveUrl : function(){
            return GO.contextRoot + 'ad/api/approval/manage/official/form/';        	
        },
        
        validate : function(attrs, options){
            if (_.isEmpty(attrs.name)) {
                return 'name_required';
            } else if (attrs.name.length > 20) {
                return 'name_invalid_length';
            }
        }
    }, 
    {
        STATES : ["NORMAL", "HIDDEN"]
    });

    return OfficialDocFormModel;
});