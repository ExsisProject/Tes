(function() {
    define([
        "jquery",
        "backbone",
        "app",
        
        "approval/models/appr_line",
        "approval/collections/appr_lines",
        "approval/views/document/appr_tree",
        "hgn!approval/templates/document/apprflow_my_lines",
        
        "i18n!nls/commons",
        "i18n!approval/nls/approval",
        
        "jquery.go-sdk",
        "jquery.jstree",
        "jquery.go-popup",
        "jquery.go-grid",
        "jquery.go-orgtab",
        "jquery.go-validation"
    ], 
    function(
        $,
        Backbone,
        App,
        
        ApprLineModel,
        ApprLineCollection,
        OrgTreeTabView,
        myLinesTmpl,
        
        commonLang,
        approvalLang
    ) {

        var lang = {
            'header' : approvalLang['결재 정보'],
            'save_as_my_line' : approvalLang['개인 결재선으로 저장'],
            'delete_as_my_line' : approvalLang['개인 결재선 삭제'],
            'my_line_name' : approvalLang['결재선 이름'],
            'normal' : approvalLang['일반'],
            'my_lines' : approvalLang['나의결재선'],
            'draft' : approvalLang['기안'],
            'name' : commonLang['이름'],
            'dept' : approvalLang['부서'],
            'line' : approvalLang['라인'],
            'status' : approvalLang['상태'],
            'approval' : approvalLang['결재'],
            'agreement' : approvalLang['합의'],
            'agreement_type' : approvalLang['합의방식'],
            'agreement_linear' : approvalLang['순차합의'],
            'agreement_parallel' : approvalLang['병렬합의'],
            'activityType' : approvalLang['타입'],
            'add' : commonLang['추가'],
            'apply' : approvalLang['적용'],
            'delete' : commonLang['삭제'],
            'confirm' : commonLang['확인'],
            'cancel' : commonLang['취소'],
            'group_count_title' : approvalLang['{{count}}개의 결재선이 있습니다.'],
            'add_activity' : approvalLang['결재선을 추가해주세요.'],
            'msg_empty_my_lines' : approvalLang['개인 결재선이 없습니다.'],
            'msg_duplicate_activity' : approvalLang['중복된 대상입니다.'],
            'msg_max_approval_count_exceed' : approvalLang['결재자 수가 최대 결재자 수를 넘을 수 없습니다.'],
            'msg_not_selected' : approvalLang['선택된 대상이 없습니다.'],
            'msg_not_deletable_status_activity' : approvalLang['삭제할 수 없는 상태의 결재자 입니다.'],
            'msg_not_deletable_assigned_activity' : approvalLang['지정 결재자는 삭제할 수 없습니다.'],
            'msg_save_success' : commonLang['저장되었습니다.'],
            'msg_duplicated_my_line_title' : approvalLang['중복된 이름을 사용할 수 없습니다.'],
            'msg_my_line_set_error_maxCount' : approvalLang['결재자를 최대치보다 넘게 할당할 수 없습니다.'],
            'msg_my_line_set_error_assigned_deleted' : approvalLang['지정 결재자는 꼭 포함되어야 합니다.'],
            'msg_my_line_set_error_exceed_group_count' : approvalLang['그룹 갯수가 허용치보다 많습니다.'],
            'msg_parallel_agreement_should_has_2_more_agreement' : approvalLang['병렬합의는 연속된 둘 이상의 합의가 필요합니다.']
        };

        /**
        * 나의 결재선 목록 뷰
        */
        var MyLinesTabView = Backbone.View.extend({
            
            el: '#my_line_tab_content',
            docStatus: null,
            observer: null,
            
            initialize: function(options) {
                this.collection = new ApprLineCollection();
                this.observer = options.observer;
                this.docStatus = options.docStatus;
                
                this.$el.off('click', 'p.title');
                this.$el.on('click', 'p.title', $.proxy(this._onItemSelected, this));
                this.$el.off('click', 'a.ic_del');
                this.$el.on('click', 'a.ic_del', $.proxy(this._onItemDeleted, this));
            },
            
            render: function() {
                this.$el.empty();
                this.$el.css({'min-height': '339px', 'max-height' : '339px'});
                this.collection.fetch({
                    success: $.proxy(this._renderMyLineList, this)
                });
            },
            
            show: function() {
                this.$el.show();
            },
            
            hide: function() {
                this.$el.hide();
            },
            
            isShowing: function() {
                return true;
            },
            
            isHiding: function() {
                return true;
            },
            
            _renderMyLineList: function(collection, response, options) {
                var isEnabled = (this.docStatus == 'CREATE') || (this.docStatus == 'TEMPSAVE');
                this.$el.html(myLinesTmpl({
                    'lang' : lang,
                    'hasMyLines': !collection.isEmpty(),
                    'myLines' : collection.map(function(model) {
                        return {
                            'id' : model.get('id'),
                            'title' : model.get('title'),
                            'groupCount' : model.get('activityGroups').length,
                            'groupCountTitle' : GO.i18n(lang['group_count_title'], "count", model.get('activityGroups').length),
                            'isSelected' : model.get('isSelected') || false,
                            'isEnabled' : isEnabled,
                            'delete' : lang['delete'],
                        	'apply' : lang['apply']
                        };
                    })
                }));
            },
            
            _onItemSelected: function(e) {
            	var self = this,
            	    $target = $(e.target),
            	    myListUl = $('div#my_line_tab_content').find('ul.side_depth');
            	
            	// isSelect false
            	$.each(myListUl.find('li'), function(){
            		var myListId = $(this).children().children('a.my_line_a').attr('data-id'),
            		    model = self.collection.get(myListId);
            		
                    model.set('isSelected', false);
            	});

                var $li = $target.parents('li.feed');
            	if ($li.hasClass('inactive')) {
            		return false;
            	}
            	var lineId = $li.find('a.my_line_a').data('id');
                var model = this.collection.get(lineId);
                model.set('isSelected', true);
                this.observer.trigger('myLineSelected', model.get('activityGroups'));
                
                this.render();
            },
            
            _onItemDeleted: function(e) {
                var aButton = $(e.target).parent().find('a.my_line_a'),
                    confirmCallback = $.proxy(this._deleteAsPeronalApprLineOkButtonCallback, this, aButton.attr('data-id'), targetEl);
                
                $.goConfirm(lang['delete_as_my_line'], approvalLang['선택한 항목을 삭제하시겠습니까?'], confirmCallback);
                
                e.stopPropagation();
            },
            
            _deleteAsPeronalApprLineOkButtonCallback: function(apprLineId, targetEl, rs, event){
                var myLineModel = new ApprLineModel();
                myLineModel.save({
                    id : apprLineId
                }, 
                {
                    type : 'DELETE',
                    success: $.proxy(function(model, resp, opts) {
                        $.goMessage(commonLang['삭제되었습니다.']);
                        this.render();
                        $(targetEl).closest('li').remove();
                        rs.close('', event);
                    }, this),
                    error: function(model, resp, opts) {
                        $.goMessage(commonLang['관리 서버에 오류가 발생하였습니다']);
                    }
                });
            }
        });
        
        
        /**
         * 탭 뷰 (나의 결재선, 조직도 포함)
         */
        var TabView = Backbone.View.extend({
            
            el: '#tab_container',
            docStatus: null,
            observer: null,
            isAdmin: false,
            orgTreeTabView: null,
            myLinesTabView: null,
            
            initialize: function(options) {
                this.docStatus = options.docStatus;
                this.observer = options.observer;
                this.isDndActive = options.isDndActive;
                this.dndDropTarget = options.dndDropTarget;
                this.isAdmin = options.isAdmin;
                
                this.multiCompanySupporting = false;
                if (_.isBoolean(options.multiCompanySupporting)) {
                    this.multiCompanySupporting = options.multiCompanySupporting;
                }
                
                this.$el.off('click', '#org_tab');
                this.$el.off('click', '#my_line_tab');
                this.$el.on('click', '#org_tab', $.proxy(this._openOrgTab, this));
                this.$el.on('click', '#my_line_tab', $.proxy(this._openMyLinesTab, this));
                
                this.observer.bind('addActivity', function() {
                    var func = arguments[0];
                    func(this.getSelected());
                }, this);
            },
            
            render: function() {
                this._renderOrgTabView();
                if (!this.isAdmin) {
                    this._renderMyLinesTabView();
                }
            },
           
            renderMyLines: function() {
                this.myLinesTabView.render();
            },
            
            
            renderContactTree : function() {
            	var options = this._getTreeViewOptions();
            	options["type"] = "contact";
            	var contactTreeView = new OrgTreeTabView(options);
            	contactTreeView.render();
            },
            
            _renderOrgTabView: function() {
                this.orgTreeTabView = new OrgTreeTabView(this._getTreeViewOptions());
                this.orgTreeTabView.render();
            },
            
            _renderMyLinesTabView: function() {
                this.myLinesTabView = new MyLinesTabView({
                    docStatus: this.docStatus,
                    observer: this.observer
                });
                this.myLinesTabView.render();
            },
            
            getSelected: function() {
                if (this.orgTreeTabView.isShowing()) {
                    return this.orgTreeTabView.getSelected();
                } else {
                    return {};
                }
            },
            
            _openOrgTab: function(e) {
                this.orgTreeTabView.show();
                this.myLinesTabView.hide();
                $(e.currentTarget).removeClass('selected').addClass('selected');
                $(e.currentTarget).parent().find('#my_line_tab').removeClass('selected');
            },
            
            _openMyLinesTab: function(e) {
                this.myLinesTabView.show();
                this.orgTreeTabView.hide();
                $(e.currentTarget).removeClass('selected').addClass('selected');
                $(e.currentTarget).parent().find('#org_tab').removeClass('selected');
            },
            
            _getTreeViewOptions: function() {
            	return {
                    'elementId' : 'org_tab_content',
                    'observer' : this.observer,
                    'isDndActive' : this.isDndActive,
                    'dndDropTarget' : this.dndDropTarget,
                    'multiCompanySupporting' : this.multiCompanySupporting,
                    'isAdmin': this.isAdmin
                };
            }
        });
        
        return TabView;
        
    });
}).call(this);