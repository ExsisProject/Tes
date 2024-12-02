;(function() {
	define([
	    "backbone"
	],
	
	function(
			Backbone
	) {	
	    /**
	     * TODO: 리팩토링 필요...
	     */
		var instance = null;
		
		var Department = Backbone.Model.extend({
			isCompany : function() {
				return this.get("ownerType") == "Company";
			}
		});
		
		var DeptListCollection = Backbone.Collection.extend({
			model : Department,
			initialize : function(option) {
				this.options = option || {};
				this.apiUrl = this.options.apiUrl;
			},
			
			url: function() {
				return this.apiUrl;
			},
			setType : function(opt){
                if (opt.retry){
                    this.apiUrl = "/api/task/folder/dept";
                    return;
                }
				if(opt.isCommunity){
					this.apiUrl = "/api/board/menu/communities";
				}else{
					this.apiUrl = "/api/board/menu/target/owners";
				}
			},
			
			getDept : function(deptId) {
				return _.find(this.models, function(model) {
					return model.get("ownerId") == deptId;
				});
			},
			
			isCompany : function() {
			}
			
		}, {
			setFetch: function(opt) {
			
				instance = new DeptListCollection(opt);		
				instance.setType(opt);
				instance.fetch({async:false});
				
				return instance;
			}
		});
		
		return {
			// deprecated!!
			getDeptList: function(opt) {
				var deptList = DeptListCollection.setFetch(opt);
                if(deptList.size() == 0){
                    opt.retry = true;
                    deptList = DeptListCollection.setFetch(opt);
                }
				return deptList;
			},
			init : function(opt) {
				return new DeptListCollection(opt);
			}
		};
	});
}).call(this);