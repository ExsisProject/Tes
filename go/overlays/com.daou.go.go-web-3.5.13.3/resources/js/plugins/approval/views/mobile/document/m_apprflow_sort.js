// 결재이력
define([
        // 필수
        "jquery",
        "backbone",
        "hgn!approval/templates/mobile/document/m_apprflow_sort",
        "hgn!approval/templates/mobile/document/m_activity",
        "i18n!nls/commons",
        "i18n!approval/nls/approval",
        "jquery.ui.touch-punch"
    ],

    function(
        $,
        Backbone,
        Tpl,
        ActivityTpl,
        commonLang,
        approvalLang
    ) {
        var elSelectors = {
            activityAppendArea : '.list_approvalLine', // 결재자 요소를 붙일 요소
            activityDeleteBtn : '.btn_del', // 결재자 삭제 버튼
            cancelViewBtn : '#cancel_btn', // 뷰 상단 취소 버튼
            saveViewBtn : '#save_btn', // 뷰 상단 확인 버튼
            activity : '.activity', // 결재자

            sortableItem : '.item', // 결재자 중, 드래그앤드랍 활성화 할 요소
            sortableHandler : '.btn_drag', // 결재자에서 드래그앤드랍이 동작하게 될 영역
        };

        var lang = {
            완료 : commonLang['완료'],
            취소 : commonLang['취소'],
            결재선변경 : approvalLang['결재선 변경']
        };

        var ApprFlowSortView = Backbone.View.extend({

            initialize : function(options){
                this.options = options || {};
                this.data = this.options.data || {};
                this.saveCallBack = this.options.saveCallBack;
                this.cancelCallBack = this.options.cancelCallBack;
            },

            render : function(){
                this.$el.html(Tpl({lang:lang}));
                this.renderActivities();
                this.bindEvents();

                this.sortableArea(this.$el.find(elSelectors.activityAppendArea), elSelectors.sortableItem, elSelectors.sortableHandler);
                return this;
            },

            bindEvents : function() {
                this.$el.find(elSelectors.activityDeleteBtn).bind('click', this.onClickedDelBtn);
                this.$el.find(elSelectors.cancelViewBtn).bind('click', $.proxy(this.onClickedCancelBtn, this));
                this.$el.find(elSelectors.saveViewBtn).bind('click', $.proxy(this.onClickedSaveBtn, this));
            },

            // Reference about 'sortable' : http://api.jqueryui.com/sortable/#option-handle
            sortableArea : function($el, sortItem, handler) {
                $el.sortable({
                    items : '> ' + sortItem, // 드래그 단위가 될 요소 셀렉터
                    axis : 'y', // 드래그앤드랍시 선택된 요소의 범위를 위아래로 제한
                    handle : handler, // 드래그앤드랍을 발동시킬수 있는 선택영역
                    opacity : 0.8, // 불투명도
                    //containment : $el, // 드래그앤드랍시에 선택된 요소가 움직일수 있는 최대 범위
                    start : function(event, ui) {
                        //.util.iscroll.disable(); // iscroll과 드래그앤드랍 동시동작 방지.
                    },
                    stop : function(event, ui) {
                        //GO.util.iscroll.enable(); // iscroll과 드래그앤드랍 동시동작 방지.
                    },
                });
            },

            renderActivities : function() {
                var self = this;
                $.each(this.data.activities, function(index, activity) {
                    activity = _.extend(activity,
                        { isDeletable: !activity.isAssigned || self.data.isAssignedActivityDeletable });
                    self.$el.find(elSelectors.activityAppendArea).append(ActivityTpl(activity));
                });
            },

            onClickedSaveBtn : function(e) {
                var $activities = this.$el.find(elSelectors.activity);

                var sortKeys = [];
                $activities.each(function(index, activity) {
                    sortKeys.push({
                        userId: $(activity).attr('data-userid'),
                        deptId: $(activity).attr('data-deptid')
                    });
                });
                if(this.saveCallBack) this.saveCallBack(sortKeys);
                this.$el.remove();
            },

            onClickedCancelBtn : function(e) {
                if(this.cancelCallBack) this.cancelCallBack();
                this.$el.remove();
            },

            onClickedDelBtn : function(e) {
                $(e.currentTarget.parentElement).remove();
            },
        });
        return ApprFlowSortView;
    });