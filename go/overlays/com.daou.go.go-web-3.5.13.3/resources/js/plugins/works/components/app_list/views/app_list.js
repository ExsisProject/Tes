define('works/components/app_list/views/app_list', function(require) {
	var GridView = require('grid');
	
	var Apps = require('works/components/app_list/collections/apps');
	
	var worksLang = require("i18n!works/nls/works");
	var commonLang = require('i18n!nls/commons');
	
	var lang = {
		'검색': commonLang['검색'],
		'생성일': worksLang['생성일'],
		'외': worksLang['외'],
		'명': commonLang['명'],
		'앱명': worksLang['앱명']
	};
	
	var View = Backbone.View.extend({
		
		gridView: null,
		
		initialize: function(options) {
			options = options || {};
			this.collection = new Apps();
			this.collection.pageSize = 10;
			this.useBottomButton = options.useBottomButton;
		},
		
		render: function() {
			this.gridView = new GridView({
				tableClass: 'type_normal dataTable list_works_record',
				checkbox: false,
				columns: this._getGridColumns(),
				collection: this.collection,
				usePageSize: false,
				useTableScroll: true,
				useBottomButton: this.useBottomButton,
				buttons: [{
					render: $.proxy(function() {
						return this._searchInputTmpl();
					}, this)
				}]
			});
			this.$el.append(this.gridView.render().el);
			this.collection.fetch();
			this.gridView.$el.on('navigate:grid', function(event, id) {
				$(this).find('input[data-id="' + id + '"]').prop('checked', true);
			});
			
			this.$('#keyword').focus();
			
			return this;
		},
		
		getCheckedData: function() {
			var id = this.gridView.$('input[type="radio"]:checked').attr('data-id');
			return this.collection.get(id);
		},
		
		_getGridColumns: function() {
			var columns = [{
				sortable: false,
				render: function(model) {
					return '<input type="radio" name="integateApps" data-id="' + model.id + '">';
				}
			}, {
				name: 'name',
				label: lang['앱명'],
				sortable: true,
			    render: function(model) {
			    	return model.get('name');
			    }	
			}, {
				name: 'admins',
				label: worksLang['운영자'],
				sortable: true,
				render: function(model) {
					var admins = model.get('admins');
					var adminLabel = admins.length === 0 ? "" : admins[0].name;
					if (admins.length > 1) adminLabel += " " + lang['외'] + " " + (admins.length - 1) + lang['명'];
					return adminLabel;
				}	
			}, {
				name: 'createdAt',
				label : lang['생성일'],
				sortable: true,
			    render: function(model) {
			    	return moment(model.get('createdAt')).format('YYYY-MM-DD');
			    }	
			}];
			
			return columns;
		},
		
		_searchInputTmpl: function() {
			return Hogan.compile([
	            '<input type="txt_mini" id="searchKeyword" class="txt" />',
			 		'<span class="btn_minor_s" id="searchBtn">',
			 		'<span class="txt">{{lang.검색}}</span>',
		 		'</span>'
			].join('')).render({lang: lang});
		}
	});
	
	return View;
});