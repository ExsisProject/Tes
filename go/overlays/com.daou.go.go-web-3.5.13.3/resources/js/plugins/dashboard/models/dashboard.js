(function() {
	
	define([
        "backbone", 
        "when", 
        "app", 
        "dashboard/models/gadgets"
    ], function(
		Backbone,
		when, 
		GO, 
		Gadgets
	) {
		
		var 
			CLASSNAME_PREFIX = 'go_dashboard', 
			TYPE = { "company": 'COMPANY', "user": 'USER' },  
			LAYOUT_SPECS = [], 
			Dashboard;
		
		LAYOUT_SPECS.push({"id": 1, "boxCount": 3, "layout": 1, "desc": "3-1"});
		LAYOUT_SPECS.push({"id": 2, "boxCount": 3, "layout": 2, "desc": "3-2"});
		LAYOUT_SPECS.push({"id": 3, "boxCount": 3, "layout": 3, "desc": "3-3"});
		LAYOUT_SPECS.push({"id": 4, "boxCount": 5, "layout": 1, "desc": "5-1"});
		
		Dashboard = Backbone.Model.extend({
			fetchingFlag: false, 
			
			defaults: {
				"title": "My Portal", 
				"type": TYPE.user, 
				"boxCount": 3, 
				"layout": 1, 
				"gadgetAddable": true, 
				"seq": 0, 
				"activated": false
			}, 
			
			initialize: function() {
				this.fetchingFlag = false;
			}, 
			
			urlRoot: function() {
				return '/api/dashboard';
			}, 
			
			fetchGadgets: function(force) {
				var self = this, 
					defer = when.defer();
				
				if((force || false) || needFetch.call(this)) {
					var gadgets = Gadgets.create(this.get('id'));
					
					this.fetchingFlag = true;
					gadgets.fetch({
						success: function(gadgets) {
							self.set('gadgets', gadgets.toJSON());
							self.fetchingFlag = false;
							defer.resolve(gadgets);
						}, 
						error: function(collection, err, options) {
							defer.reject(err);
						} 
					});
				} 
				
				return defer.promise;
			}, 
			
			removeGadgetsInBoxes: function(boxNumbers) {
				var reqUrl = (GO.config('contextRoot') + [_.result(this, 'urlRoot'), this.get('id'), 'gadget/box'].join('/')).replace('//', '/');
				
				return $.ajax({
					url: reqUrl, 
					type: 'DELETE', 
					contentType: 'application/json', 
					data: JSON.stringify({"boxNumbers": boxNumbers || []})
				});
			}, 
			
			/**
			 * 레이아웃 변경
			 */
			changeLayout: function(boxCount, layoutId) {
				var deferred = $.Deferred();
				
				this.save({"boxCount": boxCount, "layout": layoutId}, {
					"success": deferred.resolve, 
					"error": deferred.reject
				});

				return deferred;
			}, 
			
			/**
			 * 레이아웃 설정 업데이트
			 * changeLayout과 차이점: 현재 레이아웃의 boxCount보다 작아질 경우 가젯을 삭제한 후 레이아웃 변경 함.
			 */
			updateLayout: function(boxCount, layoutId) {
				var deferred = $.Deferred();
				
				this.removeGadgetsInBoxes(this.diffBoxNumbers(boxCount)).then(_.bind(function success() {
					this.changeLayout(boxCount, layoutId).then(deferred.resolve, deferred.reject);
				}, this), deferred.reject);
				
				return deferred;
			}, 
			
			getGadgets: function() {
				return this.get('gadgets') || [];
			}, 
			
			buildGadgets: function() {
				return Gadgets.create(this.get('id'), this.get('gadgets') || []);
			}, 
			
			activateFrom: function(dashboardId) {
				if(this.get('id') === dashboardId) {
					this.activate();
				} else {
					this.deactivate();
				}
			}, 
			
			activate: function() {
				this.set('activated', true);
			}, 
			
			deactivate: function() {
				this.set('activated', false);
			}, 
			
			move: function(newSeq, options) {
				this.save('seq', newSeq, getRequestMoveOptions.call(this, options));
			},
			
			getTitle: function() {
				return this.get('title');
			}, 
			
			getSeq: function() {
				return this.get('seq') || 0;
			}, 
			
			getLayout: function() {
				return this.get('layout');
			}, 
			
			getBoxCount: function() {
				return this.get('boxCount');
			},
			
			activated: function() {
				return this.get('activated') || false;
			}, 
			
			isCompanyType: function() {
				return this.get('type') === TYPE.company;
			}, 
			
			isUserType: function() {
				return this.get('type') === TYPE.user;
			}, 
			
			canAddGadget: function() {
				return this.get('gadgetAddable') || false;
			}, 
			
			getSelectorName: function() {
				return [CLASSNAME_PREFIX, this.get('boxCount'), this.getLayout()].join('_');
			}, 
			
			diffBoxNumbers: function(boxCount) {
				return _.difference(_.range(this.getBoxCount()), _.range(boxCount));
			},
			
			hasEditableGadget : function() {
				var editableGadget = _.find(this.get("gadgets"), function(gadget) {
					return (gadget.actions.updatable || gadget.actions.removable);
				});
				
				return _.isObject(editableGadget);
			},
			
			isEditable : function() {
				return this.hasEditableGadget() || this.canAddGadget();
			}
		});
		
		// 상수 정의
		Dashboard.TYPE_COMPANY = TYPE.company;
		Dashboard.TYPE_USER = TYPE.user;
		Dashboard.LAYOUT_SPECS = LAYOUT_SPECS;
		
		function findLayoutSpec(boxCount, layoutId) {
			return _.findWhere(LAYOUT_SPECS, {"boxCount": boxCount, "layout": layoutId});
		}
		
		function needFetch() {
			return !this.fetchingFlag && this.activated() && !this.getGadgets().length;
		}
		
		function getRequestMoveUrl() {
			return [_.result(this, 'url'), 'move'].join('/');
		}
		
		function getRequestMoveOptions(options) {
			return $.extend( true, options || {}, { "url": getRequestMoveUrl.call(this) });
		}
		
		return Dashboard;
		
	});
	
})();