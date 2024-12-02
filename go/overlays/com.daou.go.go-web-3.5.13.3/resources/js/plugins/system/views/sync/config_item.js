define(function(require) {
    var Backbone = require('backbone');

    var SyncDetailView = require('system/views/sync/config_detail');
    var ItemTpl = require('hgn!system/templates/sync/config_item');

    var SyncConfigItemView = Backbone.View.extend({
    	tagName : "tr",

    	className : "sync_config_tr",

    	events : {
    		"click td.clickable" : "_showPopup"
    	},

    	initialize : function(){
    		this.model = this.options.model;
    		this.companies = this.options.companies;
    	},

    	render : function(){
    			this.$el.html(ItemTpl({
    				data : this.model.toJSON()
    			}));
    	},

    	_showPopup : function(){
    		var updateView = new SyncDetailView({model : this.model, companies : this.companies});
    		updateView.render();
    	}
    });

    return SyncConfigItemView;
});
