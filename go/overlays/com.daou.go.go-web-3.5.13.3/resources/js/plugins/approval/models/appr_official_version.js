(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "approval/models/appr_receiver",
    	"approval/collections/appr_receiver",
        "i18n!approval/nls/approval"
    ],
    function(
        $,
        Backbone,
        App,
        ApprReceiverModel,
        ApprReceiverCollection,
        approvalLang
    ) {
    	
    	var ApprOfficialVersionModel = Backbone.Model.extend({
    		defaults : {
    			"state" : "CREATE",
                "forms" : [],
                "senders" : [],
                "signs" : [],
                "receivers" : [],
        		"asignedForm" : null,
        		"asignedSender" : null,
        		"asignedSign" : null
    		},
    		addReceiver : function(receiver){
    			var receivers = new ApprReceiverCollection(this.getReceiver());
    			receivers.add(new ApprReceiverModel(receiver));
    			this.set('receivers', receivers.toJSON());
    		},
    		
    		getReceiver : function(){
    			return this.get('receivers');
    		}
    	});

        return ApprOfficialVersionModel;
    });
}).call(this);