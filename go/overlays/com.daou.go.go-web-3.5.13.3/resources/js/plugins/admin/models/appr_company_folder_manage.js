define([
    "backbone"
],
function(Backbone) {

    /**
    *
    * 결재 양식 모델
    *
    */
    var ApprCompanyFolderModel = Backbone.Model.extend({

        defaults: {
            name: '',
            description: '',
            state : 'HIDDEN',
            folderUserScope: 'ALL',
            folderUser: null,
        },

        initialize: function() {

        },
        
        url: function() {
            var baseUrl = '/ad/api/approval/manage/companyfolder/';
            return _.isUndefined(this.get('id')) ? baseUrl : baseUrl + this.get('id');
        },
        
        validate: function(attrs, options) {
        	// GO-11550 전사문서함 제목에 특수문자를 허용하도록 한다.
//        	var chktext = /[ \{\}\[\]\/?.,;:|\)~`!^\-_┼<>@\$%&\'\"\\\(\=]/gi; //특수문자는 제외한다. + $ * 는 허용
        	
            if (_.isEmpty(attrs.name)) {
                return 'name_required';
            }
            else if (attrs.name.length > 100 || attrs.name.length < 2) {
                return 'name_invalid_length';
            }
//            else if(chktext.test(attrs.name)){
//            	return 'name_invalid_character';
//            }
        }
    });

    return ApprCompanyFolderModel;
});