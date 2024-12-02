// 문서목록에서 개별 문서에 대한 View
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "admin/models/appr_form",
    "hgn!admin/templates/approval/batch_list_item",
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    "i18n!admin/nls/admin"
],
function(
	$,
	_,
	Backbone,
	GO,
    ApprFormModel,
    DocListItemTpl,
    commonLang,
    approvalLang,
    adminLang
) {
	var lang = {
            'head_title' : adminLang['결재 양식'],
            'caption' : adminLang['계정 추가 등록'],
            'title' : commonLang['제목'],
            'form_name' : approvalLang['양식제목'],
            'alias' : adminLang['양식약어'],
            'code' : adminLang['코드'],
            'creator' : commonLang['작성자'],
            'description' : approvalLang['양식 도움말'],
            'use_help' : approvalLang['결재문서에서 도움말 버튼 제공'],
            'unuse_help' : approvalLang['제공하지 않음'],
            'appr_line' : approvalLang['결재라인'],
            'select_count' : adminLang['갯수 선택'],
            'approver_name' : adminLang['결재자 이름'],
            'agreer_name' : adminLang['합의자 이름'],
            'guide_approver_deletable' : adminLang['사용자가 지정 결재자를 삭제할 수 있음'],
            'reception' : adminLang['문서 수신'],
            'use' : commonLang['사용'],
            'possible' : commonLang['가능'],
            'impossible' : commonLang['불가능'],
            'year' : approvalLang['년'],
            'forever' : approvalLang['영구'],
            'dept' : approvalLang['부서'],
            'user' : adminLang['사용자'],
            'select_dept' : adminLang['부서 검색'],
            'select_user' : adminLang['사용자 검색'],
            'edit_template' : adminLang['양식 편집'],
            'template_editor' : commonLang['양식 편집기'],
            'template_preview' : commonLang['미리보기'],
            'load_template_title' : commonLang['양식 불러오기'],
            'load_another_template' : commonLang['다른 양식 불러오기'],
            'system_integration' : adminLang['시스템 연동'],
            'select_integration' : adminLang['연동 프로그램 선택'],
            'folder': adminLang['전사 문서함\n보관 폴더'],
            'unsigned' : adminLang['미지정'],
            'folder_addable' : adminLang['사용자가 저장 폴더를 추가할 수 있음'],
            'arbt_decision_active' : adminLang['전결 옵션'],
            'use_right' : adminLang['작성 권한'],
            'all_user' : adminLang['전체 사용자'],
            'all_scope' : commonLang['전체'],
            'specific_user' : adminLang['일부 사용자'],
            'preserve_in_year' : approvalLang['보존연한'],
            'preserve_changeable' : adminLang['사용자 변경 가능'],
            'securityLevel_changeable' : adminLang['사용자 변경 가능'],
            'activity_editable' : adminLang['결재선 수정'],
            'document_editable' : adminLang['문서 수정'],
            'approver_allow' : adminLang['결재자가 수정할 수 있음'],
            'approver_disallow' : adminLang['결재자는 수정할 수 없음'],
            'official_document_send' : approvalLang['공문 발송 기능'],
            'invalid_template_html_activity_groups' : approvalLang['결재라인 정보가 양식에 반영되지 않았습니다. 양식을 수정해주세요.'],
            'invalid_template_html_receivers' : approvalLang['양식에 수신자 정보가 제대로 반영되지 않았습니다. 양식을 수정해주세요.'],
            'is_over_max_approval_count' : approvalLang['지정 결재자가 최대 결재자 인원수를 초과하였습니다.'],
            'is_nothing_checked_approval_type' : approvalLang['결재 타입을 한개 이상 선택해주세요'],
            'is_appointmentof_notselectedtype' : approvalLang['선택하지 않은 타입의 지정 결재자가 있습니다'],
            'security_level' : adminLang['보안등급'],
            'state' : adminLang['사용여부'],
            'hidden' : adminLang['숨김'],
            'normal' : adminLang['정상'],
            'allow' : commonLang['허용'],
            'disallow' : commonLang['비허용'],
            'empty_msg' : adminLang['등록된 양식이 없습니다.'],
            'receiverEditable' : adminLang['사용자가 수신처 수정 가능'],
            'referrerEditable' : adminLang['기안자가 참조자 수정 가능'],
            'adminUser' : adminLang['운영자'],
            'reader' : adminLang['문서 열람자'],
            'reference' : adminLang['문서 참조자'],
            'creation_success_msg' : adminLang['저장되었습니다. 양식 목록으로 이동합니다.'],
            'creation_fail_msg' : adminLang['저장할 수 없습니다.'],
            'duplicated_name' : adminLang['제목이 중복되었습니다.'],
            'duplicated_code' : adminLang['코드가 중복되었습니다.'],
            'cancel_and_go_to_list_msg' : adminLang['취소하셨습니다. 이전 화면으로 이동합니다.'],
            'name_required' : adminLang['제목을 입력하세요.'],
            'alias_required' : adminLang['양식약어를 입력하세요.'],
            'name_invalid_length' : adminLang['제목은 20자까지 입력할 수 있습니다.'],
            'alias_invalid_length' : adminLang['양식약어는 20자까지 입력할 수 있습니다.'],
            'description_invalid_length' : adminLang['양식설명은 500자까지 입력할 수 있습니다.'],
            'state_required' : adminLang['상태를 지정하세요.'],
            'folder_required' : adminLang['전사 문서함 폴더가 지정되지 않았습니다.'],
            'integration_invalid' : adminLang['연동 옵션을 선택해주세요.'],
            'documentOpenable' : adminLang['공개여부'],
            'documentOpen' : adminLang['공개'],
            'documentClose' : adminLang['비공개'],
            'documentOpenEditable' : adminLang['사용자가 공개여부 수정 가능'],
            'select' : commonLang['선택'],
            'add' : commonLang['추가'],
            'delete' : commonLang['삭제'],
            'save' : commonLang['저장'],
            'cancel' : commonLang['취소'],
            'displayDrafter_desc' : adminLang['기안자 표시 설명'],
            'includeAgreement_desc' : adminLang['결재방 표시 설명'],
            "운영자 추가" : adminLang['운영자 추가'],
            "수정권한" : adminLang['수정권한'],
            "삭제권한" : adminLang['삭제권한'],
    		'메일 발송 기능' : adminLang['메일 발송 기능'],
    		'메일 발송 기능 설명' : adminLang['메일 발송 기능 설명'],
    		'1인결재 옵션' : adminLang['1인결재 옵션'],
    		'1인결재 옵션 설명' : adminLang['1인결재 옵션 설명'],
			'게시판 등록 기능' : adminLang['게시판 등록 기능'],
			'사용' : commonLang['사용'],
			'사용하지 않음' : commonLang['사용하지 않음'],
			'noUse' : approvalLang['미사용']
        };
	
	var DocListView = Backbone.View.extend({

		tagName: 'tr',
		events: {
			'change [data-name]' : 'changeData',
			'click td.tit a' : 'goShowForm'
        },
        
        securityLevels : null,

		initialize: function(options) {
		    this.options = options || {};
		    this.securityLevels = options.securityLevels;
		},
		
		render: function() {
			this.$el.html(DocListItemTpl(this._makeTemplateData()));
			this.renderSecurityData();
			return this;
		},
		
		goShowForm : function(e) {
			var formId = $(e.currentTarget).attr('form-id');
			 GO.router.navigate('approval/apprform/' + formId, {trigger: true});
		},
		
		changeData : function(e){
			var target = $(e.currentTarget);
			var inputType = target.attr('type');
			if(target.is('select')){
				inputType = 'select';
			}
			var attr = '';
			switch( inputType ) {
			case 'checkbox': 
			    attr = target.attr('data-name');
			    if (attr == 'state') {
			    	this.model.set(attr, target.is(':checked') ? "NORMAL" : "HIDDEN");
			    } else if (attr == 'formUserScope') {
			    	this.model.set(attr, target.is(':checked') ? "ALL" : "SPECIFIC");
			    } else if(attr == 'documentEditable') {
			    	this.model.set(attr, target.is(':checked'));
			    	if(target.is(':checked')) {
						this.model.set("useDocEditableTypeAll", 'true');
			    	} else {
			    		this.model.set("useDocEditableTypeAll", 'false');
			    	}
			    	this.model.set("useDocEditableApproval", 'false');
					this.model.set("useDocEditableAgreement", 'false');
					this.model.set("useDocEditableInspection", 'false');
					this.model.set("useDocEditableCheck", 'false');
			    } else if(attr == 'activityEditable') {
			    	this.model.set(attr, target.is(':checked'));
			    	if(target.is(':checked')) {
			    		this.model.set("useActivityEditableTypeAll", 'true');
			    	} else {
			    		this.model.set("useActivityEditableTypeAll", 'false');
			    	}
			    	this.model.set("useActivityEditableApproval", 'false');
					this.model.set("useActivityEditableAgreement", 'false');
					this.model.set("useActivityEditableInspection", 'false');
					this.model.set("useActivityEditableCheck", 'false');
			    } else {
				    this.model.set(attr, target.is(':checked'));
			    }
			    break;
			case 'radio':
			    attr = target.attr('data-name');
			    this.model.set(attr, target.val());
			    break;
            case 'select':
			    attr = target.attr('data-name');
			    if(attr == 'securityLevel'){
	                var selectedId = target.val();
			    	var m = this.securityLevels.get(selectedId);
			    	this.model.set(attr, m.toJSON());			    	
			    }else{
			    	this.model.set(attr, target.val());
			    }
                break;
			}
		},
		
		renderSecurityData : function(){
			this._markSelectedSecurityLevel(this.securityLevels ,this.model.get('securityLevel'));
			this.$('[data-name="securityLevel"]').html(this._renderSecurityTmpl({
                securityLevels: this.securityLevels.toJSON()
            }))
			
		},
		
        _makeTemplateData: function() {
            var preserveYears = _.map(ApprFormModel.PRESERVE_YEARS, function(num) {
                return {
                    'value' : num,
                    'label' : (num == 0) ? lang['forever'] : GO.i18n(commonLang["{{arg1}}년"],{arg1 : num}),
                    'isSelected' : (this.model.get('preserveDurationInYear') * 1 == num * 1) ? true : false
                };
            }, this);
            var wrappedState = this.model.get('state') == "NORMAL" ?  true : false;
            var wrappedFormUserScope = this.model.get('formUserScope') == "ALL" ? true : false;
            //var wrappedFormUserScope = function() {
            //    return function(text) {
            //        return text.replace('value="' + this.formUserScope + '"', 'value="' + this.formUserScope + '" checked');
            //    };
            //};
            //
            //var wrappedState = function() {
            //    return function(text) {
            //        return text.replace('value="' + this.state + '"', 'value="' + this.state + '" checked');
            //    };
            //};

            var tmplData = {
                preserveYears: preserveYears,
    			lang : lang,
                wrappedFormUserScope : wrappedFormUserScope,
                wrappedState : wrappedState,
                cid : this.cid
            };
            return _.extend(tmplData, this.model.toJSON());
        },
        
        _markSelectedSecurityLevel: function(securityLevels, selected) {
            if (selected && selected['id']) {
            	securityLevels.each(function(m) {
                    if (m.get('id') == selected['id']) {
                        m.set('isSelected', true);
                    }
                });
            } else {
                var first = securityLevels.at(0);
                if (first) {
                    first.set('isSelected', true);
                }
            }
        },
        
        _renderSecurityTmpl: function(data) {
            var tmpl = [];
            var lang = {
            		'noUse' : approvalLang['미사용']
            };
            _.extend(data, {
            	lang : lang
            });
            tmpl.push('{{#securityLevels}}');
            tmpl.push('    <option value="{{id}}" {{#isSelected}}selected{{/isSelected}}>{{name}}{{^useFlag}}({{lang.noUse}}){{/useFlag}}</option>');
            tmpl.push('{{/securityLevels}}');
            var compiled = Hogan.compile(tmpl.join('\n'));
            return compiled.render(data);
        }

	});

	return DocListView;
});