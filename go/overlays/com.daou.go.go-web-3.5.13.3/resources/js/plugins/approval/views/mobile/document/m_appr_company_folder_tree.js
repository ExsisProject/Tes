(function() {
	define([
		'underscore',
		'backbone',
		"amplify",
		"app",
		"hgn!approval/templates/mobile/document/m_treeItemList",
		"i18n!approval/nls/approval"
	], function (
		_,
		Backbone,
		Amplify,
		GO,
		TreeTpl
	) {
		var CompanyFolderTreeCollection  = Backbone.Collection.extend({});
		return Backbone.View.extend({
			apiCommonUrl: null,
			isAdmin: false,
			treeElementId: null,
			disabledSelect: false,
			folderId: null,
			disabledClassName: 'disable',

			initialize: function (options) {
				this.options = options || {};
				if (_.isString(this.options.treeElementId)) {
					this.treeElementId = this.options.treeElementId;
				}
				if (_.isString(this.options.apiCommonUrl)) {
					this.apiCommonUrl = this.options.apiCommonUrl;
				}
				if (_.isBoolean(this.options.isAdmin)) {
					this.isAdmin = this.options.isAdmin;
				}
				if (_.isBoolean(this.options.disabledSelect)) {
					this.disabledSelect = this.options.disabledSelect;
				}
				if (_.isFunction(this.options.selectCallback)) {
					this.selectCallback = this.options.selectCallback;
				}
				this.folderId = this.options.folderId;
				this.collection = new CompanyFolderTreeCollection();
				this.collection.url = this._getCommonUrl();
				this.collection.fetch({async: false});
			},
			render: function () {
				this._init_load();
			},

			_init_load: function () {
				var self = this;
				var companyFolders = this.collection.toJSON();
				var disabledClassName = this.disabledClassName;
				$(companyFolders).each(function (index, folder) {
					if (!String(folder.data.id).includes("root")) {
						self._getTreeElement().append(TreeTpl({
							rel: folder.data.attr.rel,
							model: folder.metadata,
							disabledClassName: disabledClassName
						}))
					}
				});
			},

			_getTreeElement: function () {
				return $("optgroup#companyDocSide.companyDocTree");
			},

			_getTargetElementById: function (id) {
				return $(this._getTreeElement().find('option[data-id=' + id + ']'));
			},

			_getCommonUrl: function () {
				return GO.contextRoot + this.apiCommonUrl;
			}
		});
	});
}).call(this);


