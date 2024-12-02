define([
    "backbone"
],
function(Backbone) {
    var AppletStatsDetail = Backbone.Model.extend({
    	
    	initialize : function(options) {
    		this.appletId = options.appletId;
		},
		
        url : function() {
        	return "/ad/api/works/applets/" + this.get('appletId');
        },
       
        displayShareValue : function() {
        	return this.get("appletShareModel");
        },

        getShareNodes : function() {
        	return this.get("appletShareModel").circle.nodes;
        },
       
        isUserType: function(nodeType) {
            return nodeType == 'user';
        },

        isDeptType: function(nodeType, includingSubDeptType) {
            var result = nodeType == 'department';
            if (includingSubDeptType) {
                result = result || this.isSubDeptType(nodeType);
            }
            return result;
        },
        
        isSubDeptType: function(nodeType) {
            return nodeType == 'subdepartment';
        },
        
        isUserWithDeptType: function(nodeType, nodeDeptId) {
            return this.isUserType(nodeType) && !nodeDeptId;
        },
        
    }); 
    
    return AppletStatsDetail;
});
