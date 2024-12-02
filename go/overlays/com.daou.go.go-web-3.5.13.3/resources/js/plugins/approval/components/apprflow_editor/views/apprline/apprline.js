define("approval/components/apprflow_editor/views/apprline/apprline", [
	"backbone", 
	"app", 

	"approval/components/apprflow_editor/views/base_tab_item", 
	"approval/components/apprflow_editor/views/side",
	
	"hgn!approval/components/apprflow_editor/templates/tab/layout",
	"text!approval/components/apprflow_editor/templates/tab/header_apprline.html",
	"text!approval/components/apprflow_editor/templates/tab/footer_apprline.html",
	
	"approval/components/apprflow_editor/views/side/org_tree",
	"approval/components/apprflow_editor/views/side/my_appr_line",
	
	"approval/components/apprflow_editor/views/apprline/activity_groups",
	
	"approval/models/appr_line",
	
	"i18n!nls/commons",
	"i18n!approval/nls/approval"
], 

function(
	Backbone,
	GO, 
	
	BaseTabItemView, 
	BaseSideView, 
	
	TabViewLayoutTpl, 
	ApprLineHeaderTpl,
	ApprLineFooterTpl,
	
	OrgTreeSideView,
	MyApprLineTabItemView,
	
	ActivityGroupsView, 
	
	ApprLineModel, 
	
	commonLang, 
	approvalLang
) {
	
	var lang = {
		"activityType": approvalLang["타입"], 
		"name": commonLang["이름"], 
		"dept": approvalLang["부서"], 
		"state": approvalLang["상태"], 
		"remove": commonLang["삭제"], 
		"all_remove": commonLang["전체 삭제"], 
		"arbitrary": approvalLang["전결"], 
		"agreementType": approvalLang["합의방식"], 
		"agreementLinear": approvalLang["순차합의"],
		"agreementParallel": approvalLang["병렬합의"], 
		"saveMyApprLine": approvalLang["개인 결재선으로 저장"], 
		"msg_duplicated_my_line_title": approvalLang['중복된 이름을 사용할 수 없습니다.'],
		"msg_save_success" : commonLang['저장되었습니다.']
	};
	
    /**
     * 결재 정보 뷰
     * 
     * model: ApprDocumentModel
     */
    var ApprLineTabItemView = BaseTabItemView.extend({
    	tabId: 'apprline', 
    	tabName: approvalLang["결재 라인"], 
    	
    	className: 'set_data wrap_approvalLine_set', 
    	
    	sideView: null, 
    	activityGroupsView: null, 
    	
    	masterAuthModel : null,
    	
    	observer: null, 
    	_MAX_LENGTH_OF_MY_LINE_TITLE : 20,
    	// 문서를 어떤 상태에서 보는지 여부
    	viewerType: '', 
    	
    	events: {
    		"click .save-myapprline-btn": "_saveAsPeronalApprLine", 
    		"click input[name=useParallelAgreement]": "_onChangeAgreementType",
    		"click #allActivityDelete" : "_allActivityDelete"
    			
    	}, 
    	
    	initialize: function(options) {
    		BaseTabItemView.prototype.initialize.apply(this, arguments);

    		options = options || {};
    		
    		if(options.observer && options.observer.hasOwnProperty('bind')) {
    			this.observer = options.observer;
    		} else {
    			this.observer = _.extend({}, Backbone.Events);
    		}
    		
    		if(options.hasOwnProperty('isAdmin')) {
    			this.isAdmin = options.isAdmin;
    		}
    		
    		this.viewerType = '';
    		if(options.hasOwnProperty('viewerType')) {
    			this.viewerType = options.viewerType;
    		}
    		
    		if(options.hasOwnProperty('masterAuthModel')) {
    			this.masterAuthModel = options.masterAuthModel;
    		}
    		
    		initRender.call(this);
    		
    		this.activityGroupsView = new ActivityGroupsView({
    			el: this.$el.find('.list_approval_line_wrap'), 
    			model: this.model, 
    			disable: !this.editable(), 
                observer: this.observer
            });
    	}, 
    	
    	/**
    	 * @Override 
    	 */
    	render: function() {
    		this.activityGroupsView.render();
    	}, 
    	
    	/**
    	 * @Override
    	 */
    	remove: function() {
    		this.sideView.remove();
    		this.activityGroupsView.remove();
    		BaseTabItemView.prototype.remove.apply(this, arguments);
    	}, 
    	
    	/**
    	 * @Override
    	 */
    	editable: function() {
    		if(this.model.isStatusComplete() || this.model.isStatusReturned()) {
    			return false;
    		}
    		var canEditViewType = this.viewerType === 'docmaster' || this.viewerType === 'formadmin';
    		var hasAuthWrite = this.masterAuthModel && this.masterAuthModel.authWrite();
    		var canEditable = canEditViewType && hasAuthWrite;
    		return canEditable || this.model.Permission.canEditApprLine();
    	}, 
    	
    	/**
    	 * @Override
    	 * 결재선은 공문서 발송함에서는 사용하지 않는다.
    	 * 
    	 */
    	usable: function() {
    		return this.viewerType != 'official_document';
    	},
    	
    	/**
    	 * @Override
    	 * activate
    	 * 뷰를 활성화 시킨다.
    	 */
    	activate: function() {
    		BaseTabItemView.prototype.activate.apply(this, arguments);
    		this.activityGroupsView.activate();
    	}, 
    	
    	/**
    	 * @Override
    	 * deactivate
    	 * 뷰를 비활성화 시킨다.
    	 */
    	deactivate: function() {
    		BaseTabItemView.prototype.deactivate.apply(this, arguments);
    		this.activityGroupsView.deactivate();
    	}, 
    	
    	_saveAsPeronalApprLine: function(e) {
    		var pid = 'gopopup-personalapprline';
    		e.preventDefault();
    		
    		// GO-16964: 더블클릭시 복수개의 창이 호출되는 것을 방지
    		if($('#' + pid).length > 0) return;
    		
    		// 결재선 변경 권한이 없으면 동작안함
    		if(!this.editable()) return;
    		
    		var actLength = 0;
            _.each(this.activityGroupsView.getActivityGroupsWithoutDraftActivity(), function(o) {
            	actLength += o.activities.length;
            });
            
            if(actLength < 1){
            	$.goMessage(approvalLang["선택된 항목이 없습니다."]);
            	return;
            }
            
            var $popup = $.goPopup({
            	'id': pid, 
                'allowPrevPopup' : true,
                'pclass' : 'layer_normal',
                'header' : approvalLang['개인 결재선으로 저장'],
                'modal' : true,
                'width' : 300,
                'contents' : getSavePersonalApprLineContentHtml(),
                'buttons' : [
                     {
                        'btext' : commonLang['확인'],
                        'btype' : 'confirm',
                        'autoclose' : false,
                        'callback' : _.bind(saveAsPeronalApprLineOkButtonCallback, this)
                    },
                    {
                        'btext' : commonLang['취소'],
                        'btype' : 'cancel'
                    }
                ]
            });
            
            $('input#my_line_title_input').keypress(_.bind(function (e) {
                if (e.which == 13) {
                	saveAsPeronalApprLineOkButtonCallback.call(this, $popup, e);
                    return false;
                }
            }, this));
        },
    	
    	_onChangeAgreementType: function(e) {
            var flag = ($(e.currentTarget).val() == 'true' || $(e.currentTarget).val() == true);
            this.model.apprFlowModel.set('useParallelAgreement', flag);
            this.model.set('apprFlowChanged', true);
            this.observer.trigger('changedTabItem', this.getTabId());
        },
        
        _allActivityDelete: function(e){
        	this.activityGroupsView._allActivityDelete();
        }
    });
    
    // private members...
    function initRender() {
    	var disabled = !this.editable();
    	this.$el.html(TabViewLayoutTpl({
    		isArbitraryCheckVisible: this.model.getActionCheck('isArbitraryCheckVisible'), 
    		useParallelAgreement: this.model.apprFlowModel.get('useParallelAgreement'),
    		'isPermissibleArbitraryDecision' : this.model.getActionCheck('isPermissibleArbitraryDecision'),
    		useAgreementType : this.model.getActionCheck('useAgreement'),
    		disabled: disabled, 
    		disableParallelAgreementModify : (this.model.isStatusProgress() || disabled), 
    		lang: lang
    	}, {
    		"activityHeader": ApprLineHeaderTpl, 
    		"activityFooter": ApprLineFooterTpl,
    	}));
    }
    
    function saveAsPeronalApprLineOkButtonCallback(rs, event){
        var title = $('input#my_line_title_input').val();
        if (_.isEmpty(title) || title.length > this._MAX_LENGTH_OF_MY_LINE_TITLE) {
            $.goMessage(GO.i18n(approvalLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"20"}));
            return false;
        }
        
        var actLength = 0;
        _.each(this.activityGroupsView.getActivityGroupsWithoutDraftActivity(), function(o) {
        	actLength += o.activities.length;
        });
        
        if(actLength < 1){
        	$.goMessage(approvalLang["선택된 항목이 없습니다."]);
        	return false;
        }
        var myLineModel = new ApprLineModel({
            activityGroups: this.activityGroupsView.getActivityGroupsWithoutDraftActivity(),
            title: title,
            useParallelAgreement : this.model.apprFlowModel.get('useParallelAgreement')
        });
                       
        myLineModel.save({}, {
            success: $.proxy(function(model, resp, opts) {
                $.goMessage(lang['msg_save_success']);
                
                this.observer.trigger('reloadMyLine');
                
                rs.close('', event);
            }, this),
            
            error: function(model, resp, opts) {
                $.goMessage(lang['msg_duplicated_my_line_title']);
            }
        });
    }
    
    function getSavePersonalApprLineContentHtml() {
        return [
            '<table class="table_form_mini"><form>',
            '<tbody><tr>',
            '</tr><tr>',
            '    <th><span class="txt">' + approvalLang['결재선 이름'] + '</span></th>',
            '    <td><input id="my_line_title_input" class="txt_mini w_max" type="text"></td>',           
            '</tr>',
            '</tbody></form></table>'
        ].join('\n');
    }
    
    return ApprLineTabItemView;
});