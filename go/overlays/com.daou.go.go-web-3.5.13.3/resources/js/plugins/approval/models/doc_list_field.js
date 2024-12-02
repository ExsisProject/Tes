(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!approval/nls/approval",
        "approval/collections/doc_list_field"
    ], 
    function(
        $,
        Backbone,
        App,
        approvalLang,
        DocListFieldCollection        
    ) {

    	var DocListFieldModel = Backbone.Model.extend({
    		initialize: function(options) {
    		    this.options = options || {};
    		    this.docFolderType = this.options.docFolderType;
    		},
    		
    		url : function(){
    			if(this.docFolderType){
    				return GO.config('contextRoot') + 'api/approval/doclistField/' + this.docFolderType;
    			}else{
    				return GO.config('contextRoot') + 'api/approval/doclistField/';
    			}
    		},
    		getCollection : function(){
    			return new DocListFieldCollection(this.get('docListFields'));
    		},
    		
    		isUserType : function(){
    			return this.get('docFieldType') === 'USER';
    		}
    	});
        
    	return DocListFieldModel;
    });
}).call(this);