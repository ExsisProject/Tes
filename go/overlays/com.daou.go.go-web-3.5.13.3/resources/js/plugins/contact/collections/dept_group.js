define(function(require){
    var Backbone = require("backbone");
	var DeptGroups = Backbone.Collection.extend({

        initialize : function(deptId){
              this.deptId = deptId;
        },

		url: function() {
			return "/api/contact/dept/" +this.deptId+ "/groups";
		}
	},{
        get : function(deptId){
            var deptGroups = new DeptGroups(deptId);
            deptGroups.fetch({ async : false, reset : true});
            return deptGroups;
        },
        promiseAsync : function(deptId) {
            var defer = $.Deferred();

            var deptGroups = new DeptGroups(deptId);
            deptGroups
                .fetch({ async : true, reset : true})
                .then(function(){
                    defer.resolve(deptGroups);
                });

            return defer;

        }
    });
	
	return DeptGroups
});