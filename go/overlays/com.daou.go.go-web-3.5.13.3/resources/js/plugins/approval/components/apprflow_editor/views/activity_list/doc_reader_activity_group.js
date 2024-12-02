define("approval/components/apprflow_editor/views/activity_list/doc_reader_activity_group", [
	"approval/components/apprflow_editor/views/activity_list/activity_group", 
	"approval/components/apprflow_editor/views/activity_list/activity_docinfo", 
	
	"hgn!approval/components/apprflow_editor/templates/activity_list/activity_docinfo_dept",
	"hgn!approval/components/apprflow_editor/templates/activity_list/activity_docinfo_read",
	"i18n!approval/nls/approval", 
	"i18n!attendance/nls/attendance",
	
	"jquery.go-popup"
], 

function(
	ActivityGroupView, 
	ActivityDocInfoView, 
	
	renderActDocinfoDeptTpl,
	renderActDocinfoReadTpl,
	approvalLang,
	attendanceLang
) {
	
	var ActivityDocInfoDeptView = ActivityDocInfoView.extend({ //receiver.js에서 씀
		template: renderActDocinfoDeptTpl, 
		
		/**
		 * @Override
		 */
		getUniqId: function(model) {
			return model.get('reader').id;
		}, 
		
		parseActivities: function() {
			var cloned = this.collection.clone();
			cloned.map(function(model) {
				model.set('removable', !model.get('receivedAt')); 
			});
			return cloned.toJSON();
		}
	});
	
	var ActivityDocInfoReadView = ActivityDocInfoView.extend({ //열람자(reader.js) 참조자(referer.js에서 씀)
		template: renderActDocinfoReadTpl, 
		
		/**
		 * @Override
		 */
		getUniqId: function(model) {
			return model.get('reader').id;
		}, 
		
		remove: function(id) {
			var targetModel = this.collection.find(function(model) {
				return this.getUniqId(model) === id;
			}, this);
			this.collection.remove(targetModel);
		},
		
		parseActivities: function() {
			var cloned = this.collection.clone();
			cloned.map(function(model) {
				var displayName;
				var hasMany = false;
				var displayTooltipText;
				if(_.isEqual(model.get('reader').deptType, true) && model.get('detailReader')){ //참조자 탭에서만 detailReader가 있음.
					if(model.get('detailReader').length == 1){
						displayName = _.first(model.get( 'detailReader')).name;
					}else if(model.get('detailReader').length > 1){
						var len = model.get('detailReader').length - 1;
						hasMany = true;
						displayTooltipText =_.pluck(model.get('detailReader'), 'name').join(',');
						displayName = GO.i18n(approvalLang["아무개 외 0명"],{args1 : _.first(model.get('detailReader')).name, args2 : len});
					}
					model.set('displayName', displayName);
				}
				var removable = !model.get('receivedAt');
				if(this.options.tabId == 'reader') {
					removable = !model.get('readAt');
					if(!this.options.actionCheck.readerEditable && model.get('assigned')){
						removable = false;
					}
				}
				model.set('removable', removable);
				model.set('hasMany', hasMany);
				model.set('displayTooltipText', displayTooltipText);
				model.set('displayReadAt', model.get('readAt') ? GO.util.basicDate(model.get('readAt')) : attendanceLang["미확인"]);
			}, this);
			return cloned.toJSON();
		}
	});
	
	var DocReaderActivityGroupView = ActivityGroupView.extend({
		ActivityItemsView: ActivityDocInfoDeptView, 
		initialize: function(options) {
			options = options || {};
			if(options.includeReadAt){
				this.ActivityItemsView = ActivityDocInfoReadView;
			}
			ActivityGroupView.prototype.initialize.apply(this, arguments);
			this.listenTo(this.collection, 'reset', this.render);
		}, 
		/**
		 * @Override
		 */
		parseOrgTreeData: function(orgTreeData) {
			
			if(orgTreeData && !orgTreeData.hasOwnProperty('id')) {
				return false;
			}
			var result = {};
			var filtered = this.collection.find(function(model) {
				var reader = model.get("reader");
				if (reader) {
					if (orgTreeData.type == 'org') {
						return reader.deptType && reader.id === orgTreeData.id;
					} else {
						return !reader.deptType && reader.id === orgTreeData.id;
					}
				}
			});
			
			// 중복 체크..
			if(filtered) {
				$.goMessage(approvalLang['중복된 대상입니다.']);
				return false;
			}
			
			return {
				"reader": convertToApprUserModelFrom(orgTreeData)
			};
		}
	});
	
	/**
	 * 조직도에서 전달된 데이터를 ApprUserModel로 변환
	 * 
	 * 참고: ApprUserModel(백엔드)
	 */
	function convertToApprUserModelFrom(orgTreeData) {
		var result = {};
		if(orgTreeData && orgTreeData.type && orgTreeData.type.toLowerCase() === 'org') {
			result = {
				"id": orgTreeData.id, 
				"name": orgTreeData.name,
				"deptId": orgTreeData.id, 
				"deptName": orgTreeData.name,
				"deptType": true
			};
		} else {
			result = _.pick(orgTreeData, 'id', 'name', 'position', 'deptId', 'deptName', 'thumbnail');
			result.deptType = false;
		}
		return result;
	}
	
	return DocReaderActivityGroupView;
});