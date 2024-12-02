define([
    "backbone"
],
function(Backbone) {

	
    /**
    *
    * 연동 모델
    *
    */
    var IntegrationModel = Backbone.Model.extend({
        defaults: {
        	integrationDetailModel: {}
        }
    });
	
    /**
    *
    * 결재 양식 모델
    *
    */
    var ApprFormModel = Backbone.Model.extend({

        defaults: {
            code: null,
            name: '',
            alias: '',
            description: '',
            state: 'HIDDEN', // NORMAL, HIDDEN
            seq: 0,
            creator: null,
            activityGroups: null,
            assignedActivityDeletable: false,
            receptionActive: false,
            receiver: null,
            receiverEditable: false,
            readerActive: true,
            reader: null,
            readerEditable: false,
            securityLevelActive: false,
            referenceActive: true,
            referrer: null,
            referrerEditable: true,
            actCopyAlterable: true,
            templateHtml: null,
            integrationActive: false,
            integrationName: '',
            folder: null,
            folderChangeable: false,
            companyDocFolder: null,
            arbtDecisionActive: true,
            arbtDecisionType: 'DOCUMENT',
            formUserScope: 'ALL',
            formUser: null,
            preserveDurationInYear: 5, // 1,3,5,영구
            preserveDurationEditable: false,
            securityLevelEditable: false,
            documentEditable : false,
            activityEditable : false,
            officialDocumentSendable : false,
            useDisplayDrafter : true,
            useIncludeAgreement : false,
            allowAgreement : false,
            allowCheck : false,
            useApprLineRule : false,
            useSelfApproval : true,
            useSendMail : true,
            usePostRegistable : true,
            useReceptionDocModifiable : true,
            useRequiredReceiver : false,
            formScriptType : "SRC",
            scriptBody : '',
            officialFormId : '',
            officialSenderId : '',
            officialSignId : '',
            allowMobileApproval: false
        },

        initialize: function() {
            if (_.isUndefined(this.get('activityGroups'))) {
                this.set('activityGroups', []);
            }
        },
        
        getIntegrationDetailModel : function(){
        	var integrationData = new IntegrationModel(this.get('integration')).toJSON();
        	
    		return integrationData['integrationDetailModel'];
        },
        
        setIntegrationDetailModel : function(detailModel){
        	var integration = this.getIntegrationDetailModel();
    		integration['integrationDetailModel'] = detailModel;
    		this.set('integration', integration);
        },
        
        url: function() {
            var baseUrl = GO.contextRoot + 'ad/api/approval/apprform/';
            return _.isUndefined(this.get('id')) ? baseUrl : baseUrl + this.get('id');
        },
        
        validate: function(attrs, options) {
            if (_.isEmpty(attrs.name)) {
                return 'name_required';
            } else if (_.isEmpty(attrs.alias)) {
                return 'alias_required';
            } else if (attrs.name.length > 100) {
                return 'name_invalid_length';
            } else if (attrs.alias.length > 100) {
                return 'alias_invalid_length';
            } else if (_.isEmpty(attrs.state)) {
                return 'state_required';
            } else if (_.isEmpty(attrs.folder) || _.isUndefined(attrs.folder.id)) {
                return 'folder_required';
            } else if (attrs.integrationActive && (_.isEmpty(attrs.integration) || _.isEmpty(attrs.integration.beanName))) {
                return 'integration_invalid';
            }
        },
    }, 
    {
        PRESERVE_YEARS : [1, 3, 5, 10, 0],
        STATES : ["NORMAL", "HIDDEN"]
    });

    return ApprFormModel;
});
