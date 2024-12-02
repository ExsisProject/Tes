define([
    "jquery.go-orgtab"
], 
function(
) {	
	
	// 구 OrgTreeTabView
	var ApprTreeView = Backbone.View.extend({
            
        orgEl: null,
        orgTab: null,
        elId: 'orgTreeTab', 
        orgElId: 'org_tree_tab_content',
        elementId: null,
        observer: null,
        isAdmin: false,
        multiCompanySupporting: false, 
        searchResultElId: 'memberList', 
        
        initialize: function(options) {
            this.observer = options.observer;
            if (_.isString(options.elementId)) {
                this.elId = options.elementId;
            }
            if (_.isString(options.orgElId)) {
                this.orgElId = options.orgElId;
            }
            if (_.isBoolean(options.isDndActive)) {
                this.isDndActive = options.isDndActive;
            }
            if (_.isString(options.dndDropTarget)) {
                this.dndDropTarget = options.dndDropTarget;
            }
            if (_.isBoolean(options.isAdmin)) {
                this.isAdmin = options.isAdmin;
            }
            if (_.isBoolean(options.multiCompanySupporting)) {
                this.multiCompanySupporting = options.multiCompanySupporting;
            }
            if(_.isString(options.searchResultElId)) {
            	this.searchResultElId = options.searchResultElId;
            }
            
            if(_.isString(options.type)) {
                this.type = options.type;
            }
            
            if(_.isString(options.draggables)) {
                this.draggables = options.draggables;
            }
            
            if (_.isBoolean(options.useDisableNodeStyle)) {
                this.useDisableNodeStyle = options.useDisableNodeStyle; // 조직도에서 disable style사용 여부. (결재선 수신자 탭 등..)
            }
            
            if (_.isBoolean(options.useApprReception)) {
                this.useApprReception = options.useApprReception; // 결재선 수신자탭에서 넘기는 param. 
            }

            if (_.isBoolean(options.useApprReference)) {
                this.useApprReference = options.useApprReference; // 결재선 참조자탭에서 넘기는 param. 
            }
            
            if(_.isString(options.receiveAllowType)) {
            	this.receiveAllowType = options.receiveAllowType;
            }

        },
        
        /**
         * 렌더링..
         * 
         * @param options.dnd
         */
        render: function() {
            this.orgTab = $.goOrgTab({
                elId: this.elId,
                orgElId: this.orgElId, 
                searchResultElId: this.searchResultElId, 
                isAdmin: this.isAdmin,
                isDndActive: this.isDndActive,
                dndDropTarget: this.dndDropTarget,
                dropCheck: $.proxy(this._dropCheckCallback, this),
                dropFinish: $.proxy(this._dropFinishCallback, this),
                dropOut: $.proxy(this._dropOutCallback, this),
                multiCompanyVisible : this.multiCompanySupporting,
                draggables : this.draggables,
                useDisableNodeStyle : this.useDisableNodeStyle,
                useApprReception : this.useApprReception,
                useApprReference : this.useApprReference,
                receiveAllowType : this.receiveAllowType,
                css : {
                    'minHeight' : '306px',
                    'maxHeight' : '306px'
                },
                type : this.type
            });

             this.observer.bind('activateDNDDroppable', function() {
                 console.log("activateDNDDroppable");
                 this.orgTab.activateDNDDroppable();
             }, this);

            this.orgEl = $('#' + this.elId);
        },
        
        /**
         * 드래그된 노드가 드롭이 가능한지 여부를 검사
         * 
         * @param targetEl drop 대상이 되는 엘리먼트
         * @param nodeData jsTree에서 선택된 노드의 가공된 데이터
         * @returns {Boolean} 드롭 가능 여부 표현
         */
        _dropCheckCallback: function(targetEl, nodeData) {
            var dndInfo = this._makeDNDInfoByDropTarget(targetEl);
            this.observer.trigger("dropCheck", dndInfo['groupSeq'], dndInfo['activitySeq']);
            return true;
        },
        
        /**
         * 노드를 드롭했을때 실행되는 콜백
         * 
         * @param targetEl drop 대상이 되는 엘리먼트
         * @param nodeData jsTree에서 선택된 노드의 가공된 데이터
         */
        _dropFinishCallback : function (targetEl, nodeData) {
            var dndInfo = this._makeDNDInfoByDropTarget(targetEl);
            this.observer.trigger("dropFinish", dndInfo['groupSeq'], dndInfo['activitySeq'], nodeData);
            return;
        },
        
        /**
         * droppableUI에서 제공해주는 인자인, targetElement로 Drop 대상의 정보를 제공한다.
         */
        _makeDNDInfoByDropTarget: function(targetEl) {
            var $activity = $(targetEl);
            if ($activity.attr('data-isnullactivity') == 'true') {
                return {
                    groupSeq: 'last',
                    activitySeq: 'last'
                };
            }
            
            var $group = $activity.parents('div.activity_group'),
                $activities = $activity.parent().children();
            
            return {
                groupSeq: parseInt($group.attr('data-index')),
                activitySeq: parseInt($activities.index($activity)) + 1
            };
        },
        
        /**
        * DND시에, droppable로부터 마우스가 out된 경우 호출되는 콜백
        */
        _dropOutCallback: function(targetEl, nodeData) {
            this.observer.trigger('dropOut');
        },
        
        getSelected: function() {
            return this.orgTab.getSelectedData();
        },
        
        show: function() {
            this.orgEl.show();
        },
        
        hide: function() {
            this.orgEl.hide();
        },
        
        isShowing: function() {
            return (this.orgEl.is(':hidden') == false);
        },
        
        isHiding: function() {
            return (this.orgEl.is(':hidden') == true);
        }
    });
	
	return ApprTreeView;
});