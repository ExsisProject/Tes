define([
    "backbone"
],

function(Backbone) {
    var TYPE_MAPPER = {
        "DEPARTMENT" : "dept",
        "COMPANY" : "company",
        "USER" : "personal"
    }

	var CreateGroup = Backbone.Model.extend({
		initialize : function(options) {
			this.type = TYPE_MAPPER[options.type];
		},
		
		url: function() {
			return "/api/contact/" + this.type + "/group";
		},

        save: function (key, val, options) {
            this.beforeSave(key, val, options);
            return Backbone.Model.prototype.save.call(this, key, val, options);
        },

        beforeSave: function (key, val, options) {
            if(this.isCompany()){
                this.set("publicFlag", true);
            }
        },
        isCompany:function(){
            return this.type == "company";
        },
        isDept : function(){
            return this.type == "dept";
        }
	});
	return CreateGroup;
});