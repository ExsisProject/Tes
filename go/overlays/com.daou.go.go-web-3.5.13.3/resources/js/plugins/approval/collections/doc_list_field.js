(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!approval/nls/approval"
    ], 
    function(
        $,
        Backbone,
        App,
        approvalLang
    ) {
    	
    	var DocListFieldItemModel = Backbone.Model.extend({
    		
    	});

    	var DocListFieldCollection = Backbone.Collection.extend({
    		model : DocListFieldItemModel,
    		initialize: function(options) {
    		    this.options = options || {};
    		},

    		addLangField : function(){
    			this.each(function(model){
    				model.set('columnName', approvalLang[model.get('columnMsgKey')]);
    				model.set('columnDesc', approvalLang[model.get('columnDescKey')]);
    				model.set('isDisabled', !model.get('isEditable'));
    				model.set('isChecked', !model.get('isEditable') || model.get('isEditable') && model.get('useColumn'));
    			});
    		},
    		
    		makeDoclistColumn : function(){
    			var columns = {};
				var count = this.where({useColumn : true}).length;
				this.each(function(m){
					if(m.get('useColumn')){
						columns[m.get('columnMsgKey')] = approvalLang[m.get('columnMsgKey')];
					}
					columns['count'] = count;
				});
				return columns;
    		},
    		
    		makeDoclistSort : function(){
    			var sorts = {};
				this.each(function(m){
					if(m.get('useColumn')){
						if(!_.isEmpty(m.get('sortColumn'))){
							sorts[m.get('columnMsgKey')] = m.get('sortColumn');	
						}
					}
				});
				return sorts;
    		}
    	});
    	
    	return DocListFieldCollection;
        
    });
}).call(this);