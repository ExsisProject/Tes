define([
    "approval/models/document"
],
function(DocumentModel) {

    var RefDocumentModel = DocumentModel.extend({
        
        initialize: function(attrs, options) {
        	DocumentModel.prototype.initialize.apply(this, arguments);
        	options = options || {};

            this.docId = options.docId;
            this.refDocId = options.refDocId;

        },

        url: function() {
            var url = '/api/approval';
            var doccumentId;
            var referenceId;

            if (!_.isUndefined(this.docId)) {
                doccumentId = ["document", this.docId].join('/')
            }

            if (!_.isUndefined(this.docId) && !_.isUndefined(this.refDocId)) {
                referenceId = ["reference", this.refDocId].join('/')
            }
            return [url, doccumentId, referenceId].join('/')
        }
    }, {
    	create: function(docId, refDocId) {
    		return new RefDocumentModel(null, {"docId": docId, "refDocId": refDocId});
    	}
    });

    return RefDocumentModel;
});


