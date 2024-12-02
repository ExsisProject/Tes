define(function(require) {

    var Backbone = require("backbone");
	
	var GroupInfo = Backbone.Model.extend({
		url : function() {
			return [ "/api/contact/group", this.groupId].join('/');
		},		
		
		setGroupId : function(opt){
			this.groupId = opt.groupId;
		}
	});
	
	return {
		read : function(opt){
			var groupInfo = new GroupInfo();
			groupInfo.setGroupId(opt);
			groupInfo.fetch({async:false});
			return groupInfo;
		}
	};
});