// 문서목록에서 개별 문서에 대한 View
define([
    "jquery",
    "underscore",
    "backbone",
    "when",
    "app",
    "system/collections/companies",
    "hgn!board/components/layer/templates/share_scope",
    "i18n!survey/nls/survey",
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    "i18n!admin/nls/admin",
    "i18n!board/nls/board"
],
function(
	$,
	_,
	Backbone,
	when,
	GO,
	CompanyCollection,
	LayerTpl,
    SurveyLang,
    commonLang,
    approvalLang,
    adminLang,
    boardLang
) {
	
    var lang = {
            'user' : commonLang['사용자'],
            'subdepartment' : approvalLang['부서'],
            'department' : approvalLang['부서'],
            'position' : approvalLang['직위'],
            'duty' : adminLang['직책'],
            'grade' : adminLang['직급'],
            'company' : adminLang['사이트명'],
            'usergroup' : adminLang['사용자그룹'],
            'position_select' : adminLang['직위 선택'],
            'duty_select' : adminLang['직책 선택'],
            'grade_select' : adminLang['직급 선택'],
            'usergroup_select' : adminLang['사용자그룹 선택'],
            'including_sub_dept' : boardLang['하위 부서 포함'],
            'include_child_dept': SurveyLang['하위 부서 포함하기'],
            'select_department' : SurveyLang['부서 선택'],
            'select_user' : SurveyLang['사용자 선택'],
            'add' : commonLang['추가'],
            'remove': commonLang['삭제'],
            'add_dept': SurveyLang['부서추가'],
            'dept_name': SurveyLang['부서명'],
            'target_whole': SurveyLang['전사'],
            'target_part': SurveyLang['일부'],
            'select_dept': SurveyLang['부서 선택'],
            'select_class': SurveyLang['클래스 선택'],
            'child_dept': SurveyLang['하위 부서'],
            'site_select' : adminLang['사이트 선택'],
            'writable' : adminLang['쓰기가능'],
            'notUseApprReception' : '문서 수신 기능을 사용하지 않는 부서입니다. 해당 부서를 추가하려면 [전자결재 > 부서 문서함 관리 > 부서 문서함 사용 설정]에서 수신함을 체크해주세요.',
            'notUseApprReference' : '부서문서함 기능을 사용하지 않는 부서입니다. 해당 부서를 추가하려면 [전자결재 > 부서 문서함 관리 > 부서 문서함 사용 설정]에서 부서함을 체크해주세요.',
        };


        var ACTION = {
                READABLE : 'read',
                WRITABLE : 'write',
                REMOVABLE : 'remove',
                MANAGABLE : 'manage'
            }
	
    /**
    *
    * 노드 모델
    *
    */
    var CircleNodeModel = Backbone.Model.extend({
        defaults : {
            nodeId: 0,
            nodeDeptId: "",
            nodeCompanyId: null,
            nodeCompanyName: null,
            nodeType: 'user', /* POSITION, GRADE, DUTY, USERGROUP, USER, DEPARTMENT, SUBDEPARTMENT, COMPANY */
            nodeValue: '', /* 멤버값 출력 문자열 */
            actions: '', /* read, write */
            members: null
        },

        initialize: function() {
            if (!_.isArray(this.get('members'))) {
                this.set('members', []);
            }
        },

        isUserType: function() {
            return this.get('nodeType') == 'user';
        },

        isUserWithDeptType: function() {
            return this.isUserType() && !this.get('nodeDeptId');
        },

        isDeptType: function(includingSubDeptType) {
            var result = this.get('nodeType') == 'department';
            if (includingSubDeptType) {
                result = result || this.isSubDeptType();
            }
            return result;
        },

        isSubDeptType: function() {
            return this.get('nodeType') == 'subdepartment';
        },

        isPositionType: function() {
            return this.get('nodeType') == 'position';
        },

        isGradeType: function() {
            return this.get('nodeType') == 'grade';
        },

        isDutyType: function() {
            return this.get('nodeType') == 'duty';
        },

        isUserGroupType: function() {
            return this.get('nodeType') == 'usergroup';
        },
        
        isCompanyType: function() {
            return this.get('nodeType') == 'company';
        }
    });


    /**
    *
    * 노드 컬렉션
    *
    */
    var CircleNodeCollection = Backbone.Collection.extend({

        model: CircleNodeModel
    });
	
	var ScopeLayerView = Backbone.View.extend({

		el : ".layer_share_scope .content",
		initialize: function(options) {
		    this.options = options || {};
		    this.shares = this.options.shares;
		},
		
		render : function(){
			console.log(this.shares)
			_.each(this.shares.get('companyShares'), function(m){
				var collection = new CircleNodeCollection(m['nodes']);
				console.log(collection)
	            this.$el.append(LayerTpl({
	                'nodes': this._makeTemplateData(collection),
	                'withoutSubDept' : this.withoutSubDept,
	                'visibleCompanyName' : true,
	                'including_sub_dept_label' : lang['including_sub_dept'],
	                'useAction' : this.useAction,
	                'companyName' : collection.at(0).get('nodeCompanyName')
	            }));				
			}, this);

		},
		
        _makeTemplateData: function(collection) {
            return _.map(collection.models, function(m, idx) {
                return {
                    'isFirst?' : idx == 0,
                    'isDeptOrSubDeptType?' :  m.isDeptType(true),
                    'isSubDeptType?' : m.isSubDeptType(),
                    'nodeId' : m.get('nodeId'),
                    'nodeType' : m.get('nodeType'),
                    'nodeDeptId' : m.get('nodeDeptId'),
                    'nodeCompanyName' : m.get('nodeCompanyName'),
                    'nodeValue' : m.get('nodeValue'),
                    'nodeTypeLabel' : lang[m.get('nodeType')],
                    'actions' : m.get('actions'),
                    'isCompanyType' : m.isCompanyType(),
                    'actionName' : function(){
                        var actions = m.get("actions");
                        var actionsName = [];
                        if(actions.indexOf(ACTION.READABLE) >= 0){
                            actionsName.push(adminLang["읽기"]);
                        }
                        
                        if(actions.indexOf(ACTION.WRITABLE) >= 0){
                            actionsName.push(adminLang["쓰기"]);
                        }
                        
                        /**
                         * 관리 항목이 늘어날 경우 사용
                         * 
                        if(actions.indexOf(ACTION.REMOVABLE) >= 0){
                            actionName.push(adminLang["삭제"]);
                        }
                        
                        if(actions.indexOf(ACTION.MANAGABLE) >= 0){
                            actionName.push(adminLang["관리"]);
                        }
                        */
                        
                        return actionsName.join("/");
                    }()
                };
            });
        },
	});

	return ScopeLayerView;
});