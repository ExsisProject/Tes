(function() {
    define([
        "backbone"
    ],
    function(Backbone) {
        var DeptProfileCard = Backbone.Model.extend({
            urlRoot : '/api/department/profile/'
        }, {
            get: function(deptId) {
                var instance = null;
                instance = new DeptProfileCard();
                instance.set("id", deptId, {silent: true});
                instance.fetch({async:false});
                return instance;
            }
        }); 
        
        return {
            init: function(attrs) {
                return new DeptProfileCard(attrs);
            },
            read : function(deptId){
                return DeptProfileCard.get(deptId);
            }
        }
    });
}).call(this);