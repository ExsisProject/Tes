define(function(require) {
    var Backbone = require('backbone');
    var AdminLang = require('i18n!admin/nls/admin');
    var CommonLang = require('i18n!nls/commons');

    var SyncQueryListView = require('system/views/sync/config_list');
    var SyncStartView = require('system/views/sync/config_job');

    var Companies = Backbone.Collection.extend({
    	url : GO.contextRoot + "ad/api/system/companies"
    });

    var SyncConfigView = Backbone.View.extend({
    	className : 'syncMainView',

    	events : {
    		'refresh' : '_renderQueryListArea'
        },

        initialize : function() {
        	this.companies = new Companies();
        	this.companies.fetch({async : false});
        },

        render : function() {
			this._renderSyncStartArea();
			this._renderQueryListArea();
        },

        _renderSyncStartArea : function() {
        	var syncStartView = new SyncStartView({companies : this.companies.toJSON()});
        	syncStartView.render();
        	this.$el.append(syncStartView.el);
        },

        _renderQueryListArea : function() {
			var syncQueryListView = new SyncQueryListView({companies : this.companies.toJSON()});
        	syncQueryListView.render();
        	this.$el.find('#syncConfigView').remove();
        	this.$el.append(syncQueryListView.el);
        }
    })

    return SyncConfigView;
});