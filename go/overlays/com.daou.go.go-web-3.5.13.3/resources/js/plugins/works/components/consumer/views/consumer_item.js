define('works/components/consumer/views/consumer_item', function(require) {
	
	var worksLang = require("i18n!works/nls/works");
	var lang = {
		'건의 연동된 데이터가 있습니다': worksLang['건의 연동된 데이터가 있습니다'],
        '현재 연동된 데이터가 없습니다': worksLang['현재 연동된 데이터가 없습니다']
	};
	
	var DocListView = require('works/components/doc_list/views/doc_list');
	
	var Docs = require("works/collections/docs");
	var Fields = require('works/collections/fields');
	
	var Tmpl = require('hgn!works/components/consumer/templates/consumer_item');
	var View = Backbone.View.extend({
		
		initialize: function(options) {
			this.docId = options.docId;
			this.docText = options.docText;
			this.fields = new Fields([], {
				appletId: this.model.get('applet').id,
				includeProperty: true,
				type: 'producers'
			});
			this.fields.fetch();
			this.docs = new Docs([], {
				appletId: options.appletId, 
				referAppletId: this.model.get('applet').id, 
				restoreParam: false, 
				type: 'consumerDocs'
			});
		},
		
		events: {	
			"click a[data-name=consumerApp]" : "_onClickComsumerAppLink"
		},
		
		render: function() {
			this.$el.html(Tmpl({
				lang: lang,
				hasData: this.model.get('count') > 0,
				model: this.model.toJSON()
			}));
			
			if (this.model.get('accessable')) {
				this.listView = new DocListView({
					checkbox: false,
					appletId: this.model.get('applet').id,
					usePageSize: false,
					readOnly: true,
					collection: this.docs,
					columns: [],
					fields: this.fields,
					useToolbar: false,
					trClass: 'pointer'
				});
				this.listView.$el.on('renderingComplete', $.proxy(function() {
	        		this.listView.$('div.dataTables_paginate').css({"padding-top" : "10px"});
	        	}, this));
				this.listView.$el.on('onClickListItem', $.proxy(function(event, doc) {
					window.open(GO.contextRoot + 'app/works/applet/' + doc.appletId + '/doc/' + doc.id, "help", "width=1280,height=700,status=yes,scrollbars=yes,resizable=yes");
				}, this));
				this.listView.dataFetch().done($.proxy(function() {
					this.listView.render();
					this.docs.queryString = this._getQueryString();
					this.docs.fetch();
				}, this));
				
				this.$('#gridArea').html(this.listView.el);
			}
			this.$('span[data-name=consumerApp]').css("cursor", "pointer");
			
			return this;
		},
		
		_onClickComsumerAppLink: function(event) {
			event.stopPropagation();
			var appletId = this.options.appletId;
			var refAppletId = this.model.get('applet').id;
			var linkfilterData = {
				fieldCid: this.model.get('fieldCids'),
				values: {
					isRelative: true,
					values: [{id: this.docId, text: this.docText}]
				}
			};
			GO.util.store.set(appletId + "-"+ this.docId + "-linkfilterData-" + refAppletId, linkfilterData, {type : "session"});
			window.open(GO.contextRoot + "app/works/applet/" + refAppletId + "/home/link/" + appletId + "/" + this.docId);
		},
		
		_getQueryString: function() {
			return _.map(this.model.get('fieldCids'), function(fieldCid) {
				return fieldCid + '.id:(' + this.docId + ')';
			}, this).join(' OR ');
		}
	});
	
	return View;
});