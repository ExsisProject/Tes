define("approval/components/apprflow_editor/views/activity_list/activity_list", [
	"backbone", 
	"approval/components/apprflow_editor/views/activity_list/activity_group", 
	
	"approval/collections/appr_activity_groups",
	"approval/collections/activities",
	
	"hgn!approval/components/apprflow_editor/templates/activity_list/empty_group"
], 

function(
	Backbone, 
	ActivityGroupView, 
	
	ApprActivityGroupCollection, 
	ActivityCollection, 
	
	emptyGroupTpl
) {
	
	
	/**
	 * ActivityListView
	 */
    var ActivityListView = Backbone.View.extend({

        el: '#activity_groups',
        observer: null,
        collection: null,
        actionCheck: null,
        groupViewList: [],
        
        __activated__: false, 

        initialize: function(options) {
        	options = options || {};
        	
        	this.__activated__ = false;
        	
        	if(options.observer && options.observer.hasOwnProperty('bind')) {
    			this.observer = options.observer;
    		} else {
    			this.observer = _.extend({}, Backbone.Events);
    		}
        	
            this.groupViewList = [];
            
            if (_.isObject(options.actionCheck)) {
                this.actionCheck = options.actionCheck;
            }
            listenEvents.call(this);
        },
        
        /**
         * 액티비티 그룹 뷰를 추가한다.
         * @param activityGroupView ActivityGroupView ActivityGroupView 뷰 인스턴스
         */
        addGroupView: function(/*ActivityGroupView*/activityGroupView) {
        	if(activityGroupView instanceof ActivityGroupView) {
        		activityGroupView.setIndex(this.groupViewList.length);
        		this.groupViewList.push(activityGroupView);
        	}
        	
        	return this;
        }, 

        /**
         * 뷰 렌더링
         */
        render: function() {
        	// beforeRender
            this.$el.empty();
            
            _.each(this.groupViewList, function(activityGroupView, index) {
            	this.$el.append(activityGroupView.el);
            	activityGroupView.render();
            }, this);
            
            makeEmptyGroupToSpareSpace.call(this);
            resizeEmptyGroupView.call(this);

            this.activate();
            this.observer.trigger('activateDNDDroppable');
        }, 

        activate: function() {
        	this.__activated__ = true;
        }, 
        
        deactivate: function() {
        	this.__activated__ = false;
        }, 
        
        isActivated: function() {
        	return this.__activated__;
        }
    });
    
    // private methods..
    function listenEvents() {
        this.listenTo(this.observer, 'dropCheck', callDropCheck);
        this.listenTo(this.observer, 'dropFinish', callDropFinish);
        this.listenTo(this.observer, 'dropOut', callDropOut);
        this.listenTo(this.observer, 'resize', resizeEmptyGroupView);
    }
    
    function makeEmptyGroupToSpareSpace() {
        this.$el.append(emptyGroupTpl());
    }
    
    function callDropCheck(groupSeq, activitySeq) {
    	var groupView;
    	/**
	     * [GO-17078]
		 * 전자결재 > 결재선 UI > "참조자/수신자/열람자/공문서 수신처" 탭에서 순서변경이 되지않는 이슈
		 * 
		 * 우선 결재선을 제외한 모든 탭에서 순서변경이 불가능하도록 여기서 제어한다. 
		 * 향후에는 재사용가능하도록 옵션을 받아서 처리하는 방식으로 변경해야 한다.
	     */
    	var pGroupSeq = 'last';
    	var pActivitySeq = 'last';
    	
    	if(!this.isActivated()) {
    		return;
    	}
    	
    	groupView = getGroupView.call(this, pGroupSeq);
    	
    	if(groupView && _.isFunction(groupView.drawDropHelper)) {
    		groupView.drawDropHelper(pActivitySeq);
    	}
    }
    
    function callDropFinish(groupSeq, activitySeq, nodeData) {
    	var groupView;
    	
    	if(!this.isActivated()) {
    		return
    	}
    	
    	groupView = getGroupView.call(this, groupSeq);
    	
    	if(groupView) {
    		groupView.addActivity(nodeData, activitySeq);
    		groupView.clearDropHelper(activitySeq);
    	}
    }
    
    function callDropOut() {
    	if(!this.isActivated()) {
    		return;
    	}
    	
    	_.each(this.groupViewList, function(groupView) {
            groupView.clearDropHelper();
        });
    }
    
    function resizeEmptyGroupView() {
    	var self = this;
    	
    	// 아직 엘리먼트가 DOM트리에 붙지 않았을 경우 높이 계산이 되지 않는다.
    	// DOM 트리에 붙었는지 확인 후 높이 계산을 수행한다.
    	setTimeout(function() {
    		if(self.$el.parents('body').length > 0) {
        		var totalHeight = parseInt(self.$el.innerHeight());
                var totalGroupsHeight = 0;
                var emptySpaceHeight = 0;
                var marginToAvoidScroll = 0; // 스크롤이 생기지 않도록, 충분한 공간을 두도록 한다.

                _.each(self.groupViewList, function(view) {
                    totalGroupsHeight += parseInt(view.$el.outerHeight());
                });

                emptySpaceHeight = totalHeight - totalGroupsHeight;
                if (emptySpaceHeight < marginToAvoidScroll) {
                    return;
                }

                self.$el.find('.empty-activity-group').css({
                    'height': (emptySpaceHeight - marginToAvoidScroll)
                });
        	} else {
        		resizeEmptyGroupView.call(self);
        	}
    	}, 100);
    }
    
    function getGroupView(groupSeq) {
    	var groupView;
    	
    	if ( groupSeq === 'last' ) {
    		groupView = _.last(this.groupViewList);
    	} else {
    		groupView = this.groupViewList[groupSeq];
    	}
    	
    	return groupView
    }

    return ActivityListView;
});