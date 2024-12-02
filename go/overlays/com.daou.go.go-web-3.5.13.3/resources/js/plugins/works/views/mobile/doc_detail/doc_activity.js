define('works/views/mobile/doc_detail/doc_activity', function(require) {
	// dependency
    var when = require('when');
	var Backbone = require('backbone');
	var App = require('app');

	var DocActivityItemView = require('works/views/mobile/doc_detail/doc_activity_item');
	var HeaderToolbarView = require('views/mobile/header_toolbar');

	// models
	var ActivityCollection = require('works/collections/applet_activities');

	// lang
	var commonLang = require("i18n!nls/commons");

	var menus = {
		"활동기록등록" : {
			id : "btnWriteActivity",
			text: commonLang["등록"],
			triggerFunc : 'works-write-activity'
		}
	};

	var DocActivityView = Backbone.View.extend({
		el : "#content",

		initialize : function(options) {
			this.appletId = options.appletId;
			this.docId = options.docId;
			this.activities = new ActivityCollection({docId : options.docId, appletId : options.appletId});
			this.currentPage = 1;
			this.headerBindEvent();
		},

		dataFetch : function() {
			var deferred = when.defer();
			var fetchActivity = this.activities.fetch();
			$.when(fetchActivity).done(function() {
				deferred.resolve();
			}); 
			return deferred.promise;
		},

		headerBindEvent : function() {
			GO.EventEmitter.off('trigger-action');
			GO.EventEmitter.on('trigger-action','works-write-activity', this.goActivityCreate, this);
		},
		render : function() {
			var self = this;
			this.dataFetch().done(function () {
				self.models = self.activities.models;
				if(self.models.length == 0) {
					GO.router.navigate("works/applet/" + self.appletId + "/doc/" + self.docId + '/navigate', true);
				} else {
					self.renderActivity();
					self.renderHeaderToolBar();
				}
			});
			return this;
		},

		renderActivity: function () {
			var activity = this.models[this.currentPage-1];
			var docActivityItem =  new DocActivityItemView({
					model : activity,
					appletId : this.appletId,
					docId : this.docId
				});
			this.$el.empty().html(docActivityItem.el);
			docActivityItem.render();
		},

		renderHeaderToolBar: function() {
			HeaderToolbarView.render({
				title : this.currentPage+"/"+this.models.length,
				actionMenu : this.getUseMenus(),
				isLeftBtn : this.currentPage > 1,
				leftBtnCallback : $.proxy(this._onClickPrevious, this),
				isRightBtn :  this.currentPage < this.models.length,
				rightBtnCallback : $.proxy(this._onClickNext, this),
				isClose : true
			});
		},

		getUseMenus : function() {
			var useMenuList = [];
			useMenuList.push(menus.활동기록등록);
			return useMenuList;
		},

		goActivityCreate : function(){
			App.router.navigate("works/applet/" + this.appletId + "/doc/" + this.docId + "/activity" , true);
		},

		_onClickPrevious: function() {
			this.currentPage--;
			this.renderActivity();
			this.renderHeaderToolBar();
		},

		_onClickNext: function () {
			this.currentPage++;
			this.renderActivity();
			this.renderHeaderToolBar();
		}
	});
	
	
	return DocActivityView;
});