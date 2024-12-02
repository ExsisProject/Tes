    define([
        "jquery",
        "approval/collections/appr_base_doclist",
        "approval/models/doclist_item"
    ],
    function(
        $,
        ApprBaseDocList,
        DocListItemModel
    ) {

    	var ViewerDocList = ApprBaseDocList.extend({
    	    
    		model: DocListItemModel.extend({
    			idAttribute: "_id"
    		}),

    		url: function() {
    			return '/api/approval/doclist/viewer/' + this.type + '?' + this._makeParam();
    		},
    		
    		getCsvURL: function() {
    		    return '/api/approval/doclist/viewer/all/csv?' + this._makeParam();
    		}
    	});

        return ViewerDocList;

    });