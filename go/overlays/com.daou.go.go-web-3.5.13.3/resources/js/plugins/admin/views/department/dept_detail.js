(function() {
define([
	"jquery",
	"backbone",
	"app",
	"hogan",

	"admin/models/department",
	"system/models/licenseModel",
	"admin/models/system_menu_list",

	"admin/views/department/dept_org_member_duty",
	"admin/views/department/dept_org_member_type",
	"admin/views/department/dept_detail_contact",

	"hgn!admin/templates/department/dept_detail",
	"hgn!admin/templates/department/dept_detail_info",

    "i18n!admin/nls/admin",
    "i18n!nls/commons",
    "i18n!board/nls/board",
    "i18n!report/nls/report",
    "i18n!task/nls/task",
	"i18n!approval/nls/approval",

    "jquery.go-grid",
    "jquery.go-popup",
    "jquery.go-orgslide",
    "jquery.go-validation",
    "GO.util",
    "jquery.ajaxmock"   // test 용 삭제 예정
],

function(
	$,
	Backbone,
	App,
	Hogan,

	DepartmentModel,
	LicenseModel,
	SystemMenuConfig,

	MemberDutyView,
	MemberTypeView,
	ContactView,

	deptDetailTmpl,
	deptInfoTmpl,

	adminLang,
	commonLang,
	BoardLang,
	ReportLang,
	TaskLang,
	approvalLang
) {
	var baseUrl = GO.contextRoot + 'ad/api/department/',
		lang = {
		'locale_ko': adminLang["KO"],
    	'locale_en' : adminLang["EN"],
    	'locale_jp' : adminLang["JP"],
    	'locale_zhcn' : adminLang["ZH-CN"],
    	'locale_zhtw' : adminLang["ZH-TW"],
    	'locale_vi' : adminLang["VI"],
    	'info_add' : adminLang['항목추가'],
		'none' : commonLang['없음'],
		'save' : commonLang['저장'],
		'cancel' : commonLang['취소'],
		'edit' : commonLang['수정'],
		'default_info' : adminLang['기본정보'],
		'return_to_list' : adminLang['목록으로 돌아가기'],
		'dept_member_list' : adminLang['부서원 목록'],
		'dept_member_add' : adminLang['부서원 추가'],
		'dept_member_delete' : adminLang['부서원 제외'],
		'dept_member_delete_desc' : adminLang['부서원 제외?'],
		'list_to_csv' : adminLang['목록 다운로드'],
		'member_name_position' : adminLang['이름(직위)'],
		'member_email' : commonLang['이메일'],
		'dept_duty' : adminLang['부서 내 직책'],
		'member_last_login' : adminLang['최종 로그인'],
		'member_type' : adminLang['멤버타입'],
		'dept_files' : adminLang['부서 자료'],
		'dept_name' : adminLang['부서명'],
		'dept_mail_id' : adminLang['부서메일아이디'],
		'dept_code' : adminLang['부서코드'],
		'dept_alias' : adminLang['부서약어'],
		'created_at' : adminLang['생성일'],
		'used_total' : adminLang['사용량'],
		'parent_dept' : adminLang['상위 부서'],
		'child_dept' : adminLang['하위 부서'],
		'dept_delete' : adminLang['부서 삭제'],
		'dept_delete_confirm' : adminLang['부서삭제?'],
		'reorder' : adminLang['순서바꾸기'],
		'reorder_save' : adminLang['순서바꾸기 완료'],
		'dept_member_empty' : adminLang['등록된 부서원이 없습니다.'],
		'dept_amounts_empty' : adminLang['등록된 부서자료가 없습니다.'],
		'dept_member_select_msg' : adminLang['부서원을선택하라'],
		'org_add_desc' : adminLang['부서원 추가 설명'],
        'dept_mail_id_desc':adminLang['부서 메일 아이디 설명'],
        'dept_code_desc':adminLang['부서 코드 설명'],
        'dept_alias_desc':adminLang['부서 약어 설명'],
		'org_master_changed' : adminLang['부서장 변경'],
		'none' : adminLang['미지정'],
		'dept_member_sortable_msg' : adminLang['부서원 순서변경'],
		'already_added_member' : adminLang['이미 부서원으로 지정 되어 있습니다.'],
		'delete_success' : commonLang['삭제되었습니다.'],
		'dept_mail_invalid_msg' : adminLang['사용할 수 없는 이메일입니다.'],
		'mb' : adminLang['MB'],
		'org' : adminLang['부서원 추가'],
		'check_validation' : commonLang['0자이상 0이하 입력해야합니다.'],
		'dept_code_invalid_msg' : adminLang['사용할 수 없는 부서코드입니다.'],
		'dept_code_already_msg' : adminLang['이미 사용중인 부서코드입니다.'],
		'dept_alias_invalid_msg' : adminLang['사용할 수 없는 부서약어입니다.'],
		//member type key - 변경불가
		'MASTER' : adminLang['부서장'],
		'MODERATOR' : adminLang['부부서장'],
		'MEMBER' : adminLang['부서원'],
		'count' : adminLang['개'],
		'total_dept' : adminLang['총 부서 수'],
		'dept_unit' : adminLang['단위 부서'],
		'root_dept_name' : adminLang['상위 부서명'],
		'dept_manager' : adminLang['부서장'],
		'dept_manager_name' : adminLang['부서장 이름'],
		'dept_member' : adminLang['부서원(명)'],
		'dept_sub' : adminLang['하위부서(개)'],
		'dept_createat' : adminLang['생성일'],
		'dept_usage' : adminLang['사용량(MB)'],
		'move_to_org' : adminLang['조직도에서 부서 추가하기'],
		'list_to_csv' : adminLang['목록 다운로드'],
		'search' : commonLang['검색'],
		//부서자료 type key
		'board' : commonLang['게시판'],
		'size' : adminLang['사용량(MB)'],
		'docCount' : adminLang["문서 개수"],
		'share' : adminLang['공유'],
		'title' : commonLang['제목'],
		'type' : adminLang['구분'],
        "migration_board" : commonLang["게시판 이관"],
        "migration_report" : commonLang["보고서 이관"],
        "migration_task" : commonLang["폴더 이관"],
        "migration_approval" : adminLang["문서함 이관"],
		"move_dept_folder" : adminLang["[부서 문서함 관리]로 이동"],
        "check_box_alert" : adminLang["부서 자료를 선택해주세요."],
        "approval" : commonLang["전자결재"],
        "task" : adminLang["업무"],
        "report" : adminLang["보고"],
        "board" : commonLang["게시판"],
        "save_success" : commonLang["저장되었습니다."],
        "closed" : adminLang["중지"],
        "normal" : commonLang["정상"],
        "total" : commonLang["전체"],
        "contact" : commonLang["주소록"],
		"multi_lang" : adminLang["다국어"],
		"open" : commonLang["열기"],
		"close" : commonLang["닫기"]

 	};

	var deptDetail = Backbone.View.extend({
		loaderClass : 'img_loader_large',
		memberEl : null,
		filesEl : null,
		events: {
			'click a[data-type="move_dept"]' : 'pageMoveByDeptId',
			'click a[data-type="move_upper"]' : 'pageMoveUpperByDeptId',
			'click span.btn_box[data-btntype="changeform"]' : 'changeModifyForm',
			'click span#btnPageReset' : 'resetDeptInfo',
			'click span#btnPagePut' : 'putDeptInfo',
			'click ul.tab_menu li' : 'changeTabs',
			'click span#btnMultiLang' : 'toggleMultiLang',
		},

		initialize: function(options) {
			this.options = options || {};
			this.deptId = this.options.deptId;
            this.isOpenLang = false;

			var systemInfo = new Backbone.Model();
            systemInfo.url = GO.contextRoot + "ad/api/systeminfo";
            systemInfo.fetch({async : false});
            this.systemInfo = systemInfo.toJSON();
            this.licenseInfo = LicenseModel.read();

            this.model = new DepartmentModel();
            this.model.clear();
            this.model.set('id', this.deptId, { silent : true });
            this.model.fetch({"async": false});
		},

		render : function() {
            this.renderDeptInfo();
			return this;
		},

        toggleMultiLang : function() {
            var $targetBtn = this.$el.find("span#btnMultiLang i");
            if($targetBtn.hasClass('ic_accordion_s')) {
            	this.isOpenLang = true;
                $targetBtn.removeClass('ic_accordion_s').addClass('ic_accordion_c').attr('title', lang.close);
                this.$el.find('tr[id$="NameInput"]').show();
            } else {
				this.isOpenLang = false;
                $targetBtn.removeClass('ic_accordion_c').addClass('ic_accordion_s').attr('title', lang.open);
                this.$el.find('tr[id$="NameInput"]').hide();
            }
        },

		renderDeptInfo : function() {
			var dataset = this.model.toJSON(),
			    hasApprovalServicePack = false,
				instalLocale = this.systemInfo.language;
			if(this.licenseInfo.get('approvalServicePack')){
			    hasApprovalServicePack = true;
			}

            this.$el.html(deptInfoTmpl({
				lang : lang,
				data : dataset,
				isRootDept : !dataset.parent,
				additions : dataset.additions,
                isKoLocale : instalLocale == 'ko',
				isEnLocale : instalLocale == 'en',
				isJpLocale : instalLocale == 'ja',
				isZhcnLocale : instalLocale == 'zhcn',
				isZhtwLocale : instalLocale == 'zhtw',
				isViLocale : instalLocale == 'vi',
				isOpenLang : this.isOpenLang,
				total : function(){
					return GO.util.byteToMega(dataset.totalSize);
				},
				dateformat : function() {
					 return GO.util.shortDate(dataset.createdAt);
				},
				hasMasterName : function() {
					return this.masterName != '';
				},
				hasApprovalServicePack : hasApprovalServicePack
			}));
			if($('#more_name option').size() == 1){
            	$('#more_name').hide();
            }
		},

		resetDeptInfo : function() {
			this.$el.find('#btnActionGroup').hide();
			this.renderDeptInfo();
		},
		changeModifyForm : function(e) {
			var targetEl = $(e.currentTarget).parent(),
				btnSave = this.$el.find('#btnActionGroup');

			if(targetEl && targetEl.attr('data-formname')) {
				$(e.currentTarget).hide();
				targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '" class="input" value="', targetEl.attr('data-value'), '" />'].join(''))
					.find('input').focusin();
				if(targetEl.attr('data-formname') == 'emailId') {
					var validateEl = targetEl.parent().find('#deptDetailEmailValidate');
					targetEl.find('input').keyup(function(e) {
						$("span.go_alert").empty();
						var msg = '';
						if(!$(e.currentTarget).val()) {
                            msg = '';
						}else if(!$.goValidation.isValidEmailId($(e.currentTarget).val())) {
							msg = lang['dept_mail_invalid_msg'];
						}
                        validateEl.html(msg);
                    });
                }
                if (btnSave.css('display') == 'none') {
                    btnSave.show();
                }
            }
        },
        pageMoveByDeptId: function (e) {
            var deptId = $(e.currentTarget).attr('data-id');
            if (deptId && $("#orgMemTree").jstree("get_selected").length > 0) {
                $("#orgMemTree").jstree("open_node", $("#orgMemTree").jstree("get_selected"), function () {
                    $("#orgMemTree").find("a[nodeid=" + deptId + "][rel!='MODERATOR'][rel!='MEMBER'][rel!='MASTER']").trigger('click');
                });
            }
        },
        pageMoveUpperByDeptId: function (e) {
            var deptId = $(e.currentTarget).attr('data-id');
            if (deptId && $("#orgMemTree").jstree("get_selected").length > 0) {
                $("#orgMemTree").find("a[nodeid=" + deptId + "][rel!='MODERATOR'][rel!='MEMBER'][rel!='MASTER']").trigger('click');
            }
        },
        putDeptInfo: function () {
            var self = this,
				beforeModel = self.model.clone(),
				additions = self.model.get('additions');

			this.$el.find("span.go_alert").html("");
			this.validate();

			var countryNames = ["koName", "enName", "jpName", "zhcnName", "zhtwName", "viName"];

			$.each($("table.table_form_mini :input").serializeArray(), function(k,v) {
				self.model.set(v.name, v.value);

				if(_.contains(countryNames, v.name)){
					additions[v.name] = $.trim(v.value);
				}
			});
			self.model.set("additions", additions);

			this.model.save({}, {
				success : function(model, rs) {
					if(rs.code == 200) {
						self.$el.trigger('orgChanged');
						$.goMessage(lang["save_success"]);
                        var parentNode =  $("#orgMemTree").jstree("get_selected").parents('li:eq(0)');
                        if(parentNode.length > 0) {
                            $("#orgMemTree").jstree('refresh', parentNode);
                        }
						self.resetDeptInfo();
                        GO.EventEmitter.trigger("admin","refreshHeader", model.id);
					}
				},
				error : function(model, rs) {
				    var resultData = JSON.parse(rs.responseText);
				    $.goMessage(resultData.message);
				    self.model = beforeModel;
				}
			});

		},

		validate : function(){
			var errors = new DeptValidate();
			this._validationName(errors);
			this._validationMultiName(errors);
			this._validationEmail(errors);
			this._validationCode(errors);
			this._validationAlias(errors);

			if(errors.hasError()){
            	$.each(errors.getErrors(), function(i, error){
            		if(i == 0){
            			error.el.focus();
            		}
            		error.el.parents(":first").parents(":first").append("<span class='go_alert'>" + error.message + "</span>");
            	});

            	throw new Error(400, "validate error");
			}
		},
		_validationName : function(errors){
			var nameEl = this.$el.find("input[name='name']");
			if(nameEl.length > 0){
				if($.trim(nameEl.val()) == "") {
					errors.add(nameEl, commonLang["필수항목을 입력하지 않았습니다."]);
				}else if(!$.goValidation.isCheckLength(1,64,nameEl.val())) {
					errors.add(nameEl, App.i18n(lang['check_validation'], {"arg1":"1","arg2":"64"}));
				}
            }
        },
        _validationMultiName : function(errors){
			var koNameEl = this.$el.find("input[name='koName']"),
				koNameValue = koNameEl.val();
			if(koNameValue != undefined && koNameValue.length > 0){
				if(!$.goValidation.isCheckLength(2,64,koNameValue)){
					errors.add(koNameEl, App.i18n(lang['check_validation'], {"arg1":"2","arg2":"64"}));
				}
			}

			var enNameEl = this.$el.find("input[name='enName']"),
				enNameValue = enNameEl.val();
			if(enNameValue != undefined && enNameValue.length > 0){
				if(!$.goValidation.isCheckLength(2,64,enNameValue)){
					errors.add(enNameEl, App.i18n(lang['check_validation'], {"arg1":"2","arg2":"64"}));
				}
			}

			var jpNameEl = this.$el.find("input[name='jpName']"),
				jpNameValue = jpNameEl.val();
			if(jpNameValue != undefined && jpNameValue.length > 0){
				if(!$.goValidation.isCheckLength(2,64,jpNameValue)){
					errors.add(jpNameEl, App.i18n(lang['check_validation'], {"arg1":"2","arg2":"64"}));
				}
			}

			var zhcnNameEl = this.$el.find("input[name='zhcnName']"),
				zhcnNameValue = zhcnNameEl.val();
			if(zhcnNameValue != undefined && zhcnNameValue.length > 0){
				if(!$.goValidation.isCheckLength(2,64,zhcnNameValue)){
					errors.add(zhcnNameEl, App.i18n(lang['check_validation'], {"arg1":"2","arg2":"64"}));
				}
			}

			var zhtwNameEl = this.$el.find("input[name='zhtwName']"),
				zhtwNameValue = zhtwNameEl.val();
			if(zhtwNameValue != undefined && zhtwNameValue.length > 0){
				if(!$.goValidation.isCheckLength(2,64,zhtwNameValue)){
					errors.add(zhtwNameEl, App.i18n(lang['check_validation'], {"arg1":"2","arg2":"64"}));
				}
			}
		},

		_validationEmail : function(errors){
			var emailIdEl = this.$el.find("input[name='emailId']");
            if (emailIdEl.val() != undefined && emailIdEl.val().length > 0) {
                if (!$.goValidation.isCheckLength(1, 32, emailIdEl.val())) {
                    errors.add(emailIdEl, App.i18n(lang['check_validation'], {"arg1": "1", "arg2": "32"}));
                } else if (!$.goValidation.isValidEmailId(emailIdEl.val())) {
                    errors.add(emailIdEl, App.i18n(lang['dept_mail_invalid_msg']));
                }
            }
		},
		_validationCode : function(errors){
			var codeEl = this.$el.find("input[name='code']");
			if(codeEl.val() != undefined && codeEl.val().length > 0){
				if(!$.goValidation.isCheckLength(1,32,codeEl.val())){
					errors.add(codeEl, App.i18n(lang['check_validation'], {"arg1":"1","arg2":"32"}));
				}else if($.goValidation.isInvalidSrc(codeEl.val())){
					errors.add(codeEl, App.i18n(lang['dept_code_invalid_msg']));
				}
			}
		},
		_validationAlias : function(errors){
			var aliasEl = this.$el.find("input[name='deptAlias']");
			if(aliasEl.val() != undefined && aliasEl.val().length > 0){
				if(!$.goValidation.isCheckLength(1,20,aliasEl.val())){
					errors.add(aliasEl, App.i18n(lang['check_validation'], {"arg1":"1","arg2":"20"}));
				}else if($.goValidation.isInvalidSrc(aliasEl.val())){
					errors.add(aliasEl, lang['dept_alias_invalid_msg']);
				}
			}
		}

	});

    var DeptValidate = Backbone.View.extend({
    	initialize : function(){
    		this.errors = [];
    	},

    	add : function(el, message){
    		var $el = (typeof el == "string") ? $(el) : el;

    		this.errors.push({"el" : $el, "message" : message});
    	},

    	hasError : function(){
    		return this.errors.length > 0;
    	},

    	getErrors : function(){
    		return this.errors;
    	}
    });

    return deptDetail;
});
}).call(this);
