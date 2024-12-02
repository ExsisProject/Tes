define("approval/components/apprflow_editor/views/activity_list/activity_group", [
	"backbone", 

	"hgn!approval/components/apprflow_editor/templates/activity_list/activity_group"
], 

function(
	Backbone, 
	
	ActivityGroupTpl
) {
	
	
	/**
	 * ActivityGroupView
	 * 조직도나 주소록에서 추가된 개별정보를 보여주는 뷰
	 * 
	 * - 조직도/공용주소록에서 DnD로 추가
	 * - 조직도/공용주소록에서 현재 선택된 것에 대해 ">>"를 클릭하면 추가됨
	 * - 옵션에 따라 그룹제목도 표현할 수 있음
	 */
	var ActivityGroupView = Backbone.View.extend({
		groupTitle: null,
		
		// 드랍 대상 엘리먼트에 대한 selector 지정
		dndDropTarget: "appr-activity", 
		
		index: 0, 
		activities: [], 
		observer: null, 
		ActivityItemsView: null,
		
		__activityItemsView__: null, 
		__disabled__: false, 
		__sortable__: true, 
		
		events: {
			"click .btn-add-activity": "_onClickAddActivity"
		}, 
		
		initialize: function(options) {
			options = options || {};
			// 변수 초기화(해주지 않으면 다른 오브젝트에 영향을 미친다...
			this.__activityItemsView__ = null;
			this.__disabled__ = false;
			this.__sortable__ = true;
			
			if(_.isNumber(options.index)) {
				this.index = options.index;
			}
			
			if(_.isString(options.grouptTitle)) {
				this.groupTitle = options.grouptTitle;
			}
			
			if(options.dndDropTarget) {
				this.dndDropTarget = options.dndDropTarget;
			}
			
			if(options.actionCheck) {
				this.actionCheck = options.actionCheck;
			}
			
			if(options.tabId){
				this.tabId = options.tabId;
			}
			
			if(options.activities) {
				if(options.activities instanceof Backbone.Collection) {
					this.collection = options.activities;
				} else {
					this.collection = new Backbone.Collection(this.activities);
				}
			}
			
			if(options.observer && options.observer.hasOwnProperty('bind')) {
    			this.observer = options.observer;
    		} else {
    			this.observer = _.extend({}, Backbone.Events);
    		}
			
			if(options.disable) {
				this.disable();
			}
			
			initRender.call(this);
			
			/**
		     * [GO-17078]
			 * 전자결재 > 결재선 UI > "참조자/수신자/열람자/공문서 수신처" 탭에서 순서변경이 되지않는 이슈
			 * 
			 * 우선 결재선을 제외한 모든 탭에서 순서변경이 불가능하도록 여기서 제어한다. 
			 * 향후에는 재사용가능하도록 옵션을 받아서 처리하는 방식으로 변경해야 한다.
		     */
			// applySortable.call(this);
		}, 
		
		render: function() {
			var activityItemsView = new this.ActivityItemsView({
				collection: this.collection, 
				dndDropTarget: this.dndDropTarget,
				actionCheck : this.actionCheck,
				tabId : this.tabId,
				disable: this.isDisabled(), 
				observer: this.observer
			});
			this.$el.find('.activity-group-items').html(activityItemsView.el)
			
			activityItemsView.render();
			this.__activityItemsView__ = activityItemsView;
		}, 
		
		setIndex: function(newIndex) {
			this.index = newIndex;
			this.$el.attr('data-index', this.index);
		}, 
		
		/**
		 * 조직도에서 건너온 데이터를 파싱(Override)
		 */
		parseOrgTreeData: function(orgTreeData) {
			// 구현..
		}, 
		
		/**
		 * 필요하면 override하라...
		 */
		addActivity: function(orgTreeData, index) {
			if(orgTreeData && orgTreeData.type === 'company') {
				return;
			}
			
			var addOptions = {};
			var modelAttrs = this.parseOrgTreeData(orgTreeData);
			if(!modelAttrs) {
				return;
			}
			
			if(_.isNumber(index) && this.collection.length > index) {
				addOptions.at = index;
				addOptions.merge = true;
			} 
			
			this.collection.add(modelAttrs, addOptions);
			this.observer.trigger('resize');
		},
		
		/**
        * 그룹내의 특정 액티비티 하단부에 드래그 라인을 표시한다.
        *
        * TODO: 리팩토링 필요..
        * 기존 appr_tree를 그대로 사용하기 위해서 어쩔 수 없이 만들어진 구조
        * targetEl을 넘겨받는 식으로 하면 이 코드를 개선할 수 있다.
        * @param activitySeq
        */
		drawDropHelper: function(targetActivitySeq) {           
			this.__activityItemsView__.drawDropHelper(targetActivitySeq);
		},
       
		clearDropHelper: function() {
			this.__activityItemsView__.clearDropHelper();
		},
		
		disable: function() {
			this.__disabled__ = true;
		}, 
		
		isDisabled: function() {
			return this.__disabled__;
		},
		
		_onClickAddActivity: function(e) {
			e.preventDefault();
			
			if(this.isDisabled()) {
				return;
			} 
			this.observer.trigger('addActivity', _.bind(this.addActivity, this));
		}
    });
	
	// private methods...
	function initRender() {
		this.$el.html(ActivityGroupTpl({
			"disabled": this.__disabled__
		}));
		
		// 공통으로 적용되어야 하는 selector를 부여(className으로 관리안함)
		// activity_group 클래스명은 appr_tree에서 DnD 후 콜백에서 그룹의 최상위 엘리먼트를 찾기위해 사용하고 있으므로 반드시 지정해야함(리팩토링 대상)
		this.$el.addClass("activity_group approval_line");
	}
	
	function applySortable() {
		var sortableItems = ".appr-activity:not(.inactive)";
		var groupSelector = ".activity_group";
		
		
		this.$el.sortable({
			connectWith: groupSelector, 
            items: sortableItems,
            placeholder: "ui-state-highlight",
            stop: _.bind(function(event, ui) {
            	var $group = ui.item.parents(groupSelector);
            	var groupIndex = parseInt($group.data('index') || 0);
            	
            	if(groupIndex === this.index) {
            		var uniqIds = [];
            		this.$el.find(sortableItems).each(function(i, el) {
            			uniqIds.push($(el).data('id'));
            		});
            		
            		this.__activityItemsView__.sortByIds(uniqIds);
            	}
            	
            }, this)
        });
		
		/**
         * sortable library가 disableSelection을 지정해야 사용 가능한데,
         * 이는 input 창에 적용하면 firefox에서 오류가 발생한다. 그래서 input에 대해서는 filtering..
         */
        this.$el.filter('input').disableSelection();
	}
	
	return ActivityGroupView;
});