;define(function(require) {
	var App = require("app");
    var BackdropView = require('components/backdrop/backdrop');
	var TplContactHome = require("hgn!contact/templates/home");
	var TplGroupModify = require("hgn!contact/templates/group_modify");
	var TplCopyContact = require("hgn!contact/templates/copy_contact");
	var TplContactNull = require("hgn!contact/templates/contact_null");
	var TplContactExport = require("hgn!contact/templates/contact_export");
	var TplContactImport = require("hgn!contact/templates/contact_import");
	var TplContactImportLoading = require("hgn!contact/templates/contact_import_loading");
	var ContactCreateView = require("contact/views/create");
	var ContactSearchTitleView = require("contact/views/search_title");
	var ContactDeptImportView = require("contact/views/dept_import");
	var FieldSettingLayerView = require("contact/views/field_setting_layer");
	var CompanyManageView = require("contact/views/side/components/manage_popup");
	var PersonalCreateContactModel = require("contact/models/personal_create_contact");
	var DeleteContactModel = require("contact/models/delete_contact");
	var CompanyCreateContactModel = require("contact/models/company_create_contact");
	var GroupInfoModel = require("contact/models/group_info");
	var GroupAddModel = require("contact/models/group_add");
	var GroupCancelModel = require("contact/models/group_cancel");
	var ImportDeptModel = require("contact/models/import_dept");
	var ContactListFieldModel = require("contact/models/contact_list_field");
	var CopyMenuModel = require("contact/models/contact_copy_menu");
	var CopyMenuGroupsModel = require("contact/models/contact_copy_menu_groups");
	var PersonalGroupCollection = require("contact/collections/personal_group");
	var CompanyGroupCollection = require("contact/collections/company_group");
	var DeptGroupCollection = require("contact/collections/dept_group");
	var CommonLang = require("i18n!nls/commons");
	var ContactLang = require("i18n!contact/nls/contact");
	var UserLang = require("i18n!nls/user");
	var FileUploader = require("file_upload");
	var DeptProfile = require("models/dept_profile");
	var DeptContactModel = require("contact/models/dept_contact");
	require("jquery.go-grid");
	require("jquery.go-popup");
	require("jquery.go-validation");


	var instance = null;
	var lang = {
		'new_contact_desc' : ContactLang['새로운 연락처를 등록하세요'],
		'new_contact' : ContactLang['새 주소 등록하기'],
		'all_contact' : ContactLang['전체 주소록'],
		'search' : CommonLang['플레이스홀더검색'],
		'total' : CommonLang['전체'],
		'import' : ContactLang['가져오기'],
		'export' : ContactLang['내보내기'],
		'print' : ContactLang['인쇄'],
		'group_select' : ContactLang['그룹선택'],
		'file_type' : ContactLang['파일유형'],
		'encording' : ContactLang['인코딩'],
		'export' : ContactLang['내보내기'],
		'dup_addr' : ContactLang['중복 처리방식'],
		'all_new' : ContactLang['새로추가'],
		'overwrite' : ContactLang['덮어쓰기'],
		'not_add' : ContactLang['추가안함'],
		'import_desc' : ContactLang['가져오기설명'],
		'all' : CommonLang['전체'],
		'personal' :  ContactLang['개인 주소록'],
		'company' : ContactLang['전사 주소록'],
		'sendMail' : ContactLang['이 그룹에게 전체메일'],
		'displayname' : ContactLang['이름(표시명)'],
		'email' : UserLang['이메일'],
		'mobileno' : UserLang['휴대폰'],
		'name' : CommonLang['이름'],
		'companyname' : UserLang['회사'],
		'tel' : CommonLang['전화번호'],
		'quick' : ContactLang['빠른 등록'],
		'detail' : ContactLang['상세정보 추가'],
		'delete' : CommonLang['삭제'],
		'mail' : ContactLang['메일발송'],
		'addcontact' : ContactLang['주소추가'],
		'addgroup' : ContactLang['그룹지정'],
		'file_select' : ContactLang['파일 선택'],
		'not_select' : ContactLang['미지정'],
		'hurigana' : ContactLang['후리가나'],
		'company_tel' : ContactLang['회사전화'],
		'current_print' : ContactLang['현재 목록 인쇄'],
		'all_print' : ContactLang['전체 목록 인쇄'],
		'successContact' : ContactLang['정상적으로 가져온 연락처'],
		'failContact' : ContactLang['실패한 연락처'],
		'duplicateContact' : ContactLang['중복주소설명'],
		'contactImportDesc' : ContactLang['개의 연락처를 가져왔습니다.'],
		'contactImportLodingDesc' : ContactLang['주소록 가져오기 설명'],
		'import_csv' : ContactLang['CSV에서 가져오기'],
		'import_from_org' : ContactLang['조직도에서 가져오기'],
		'group' : ContactLang['그룹'],
		'groupCancel' : ContactLang['그룹해제'],
		'copy' : ContactLang["주소록 복사"],
		'department' : ContactLang["부서"],
		'position' : ContactLang["직위"],
		'company_address' : ContactLang["회사주소"],
		'memo' : CommonLang["메모"],
		'contact' : ContactLang['주소록'],
		'copyContactDesc' : ContactLang['주소록을 복사할 위치를 선택하세요.'],
		'contactGroup' : ContactLang['그룹명'],
		'deptContact' : ContactLang['부서 주소록'],
		'canNotCopyDesc' : ContactLang['복사할 수 있는 연락처 그룹이 없습니다'],
		"등록된 주소록이 없습니다" : ContactLang["등록된 주소록이 없습니다"],
		"그룹관리" : ContactLang["그룹관리"],
		"더보기" : ContactLang["더보기"]
	};

	var contactFieldData = null;

	var ContactHome = Backbone.View.extend({
		el: '#content',
		listEl: null,
		manage: false,

		TYPE : {"USER" : "USER", "COMPANY" : "COMPANY", "DEPARTMENT" : "DEPARTMENT"},

		isUser : function(){
			return _.isEqual(this.TYPE['USER'], this.type);
		},

		isCompany : function(){
			return _.isEqual(this.TYPE['COMPANY'], this.type);
		},

		isDept : function(){
			return _.isEqual(this.TYPE['DEPARTMENT'], this.type);
		},

		events : {
			"click #contactMail" : "contactMail",
			"click #groupModify" : "groupModify",
			"click #contactDelete" : "contactDelete",
			"click #groupCancel" : "groupCancel",
			"click #quickCreate" : "quickCreate",
			"click #detailCreate" : "detailCreate",
			"click .contact_detail" : "contactDetail",
			"click #contactCreate" : "contactCreate",
			"click .tab_nav li[data-param]" : "initialSearch",
			"click #sendMailGroup" : "sendMailGroup",
			"click #contactExport" : "contactExport",
			"click #contactCsvImport" : "contactImport",
			"click #contactDeptImport" : "contactDeptImport",
			"click #importDisplay" : "importDisplay",
			"click #printDisplay" : "contactPrintDisplay",
			"click #contactCurrentPrint" : "contactPrint",
			"click #contactAllPrint" : "contactPrint",
			"click .send_mail" : "sendMail",
			"click #copyContact" : "_copyButtonClicked",
			"click #popupFieldSetting" : "popupFieldSetting",
			"change tbody input" : "_toggleCheckAll",
			"change #groups" : "groupsFilter",
			"click #manage_company" : "companyManage",
			"click #quickRegistToggler" : "_toggleQuickRegist",
			"click #seeMore" : "_seeMore"
		},

		initialize: function (options) {
			this.groupId = options.groupId;
			this.deptId = options.deptId;

			this.$el.off();
			this.type = options.type;

			if(this.groupId){
				this.groupInfo = GroupInfoModel.read({groupId : this.groupId}).toJSON();
			}
			this.mailExposure = GO.config('mailExposure');
		},

		render: function () {
			this.$el.addClass('go_addr_list');
			var self = this;
			var groupDeferred;
			if(this.isUser()){
				groupDeferred = PersonalGroupCollection.promiseAsync();
			} else if(this.isDept()) {
				groupDeferred = DeptGroupCollection.promiseAsync(this.deptId);
			}

			var contactFieldModel = new ContactListFieldModel({
				isGetFieldList : true
			});


			$.when(
				groupDeferred,
				contactFieldModel.fetch().done()
			).then(function(groupCollection) {
				var groups;

				if(!self.isCompany()) {
					groups = groupCollection.toJSON();
				}
				contactFieldData = contactFieldModel.getContactListFields();

				var tmpl = TplContactHome({
					lang: lang,
					contextRoot: App.contextRoot,
					info: self.groupInfo,
					isCompanyManager : self.isCompany() && self.groupInfo.managable,
					getSubTitle : function(){
						if(self.isCompany()){
							return lang.company;
						}else if(self.isUser()){
							return lang.personal;
						}

						// 부서 주소록
						if(self.groupId){
							return self.groupInfo.deptName + " " + lang.contact;
						}else{
							var dept = DeptProfile.read(self.deptId);
							return dept.get("name") + " " + lang.contact;
						}
					},
					isGroup: function () {
						if (self.groupId) {
							return true;
						} else {
							return false;
						}
					},
					isAvailableMail: function () {
						if (GO.isAvailableApp('mail')) return true;
						else return false;
					},
					isLocaleJp: function () {
						if (GO.session().locale == 'ja') {
							return true;
						} else {
							return false;
						}
					},
					isName: function () {
						return self._checkFieldShowing(contactFieldData, 'NAME');
					},
					isPosition: function () {
						return self._checkFieldShowing(contactFieldData, 'POSITION');
					},
					isMobile: function () {
						return self._checkFieldShowing(contactFieldData, 'MOBILE');
					},
					isEmail: function () {
						return self._checkFieldShowing(contactFieldData, 'EMAIL');
					},
					isDepartment: function () {
						return self._checkFieldShowing(contactFieldData, 'DEPARTMENT');
					},
					isCompany: function () {
						return self._checkFieldShowing(contactFieldData, 'COMPANY');
					},
					isCompanyPhone: function () {
						return self._checkFieldShowing(contactFieldData, 'COMPANY_PHONE');
					},
					isCompanyAddress: function () {
						return self._checkFieldShowing(contactFieldData, 'COMPANY_ADDRESS');
					},
					isMemo: function () {
						return self._checkFieldShowing(contactFieldData, 'MEMO');
					},
					isShowGroup: function () {
						return self._checkFieldShowing(contactFieldData, 'GROUP');
					},

					writable: self.isCompany() ? self.groupInfo.writable : true,
					removable: self.isCompany() ? self.groupInfo.removable : true,
					contactGroup : groups,
					isCompanyMode : self.isCompany(),
					mailExposure : self.mailExposure
				});

				self.$el.html(tmpl);
				$('input[placeholder], textarea[placeholder]').placeholder();
				// TODO : 4. contacts
				self.listEl = self.renderDataTables(self.groupId, self.type, self.deptId);
				ContactSearchTitleView.render(self.type, self.groupId, self.deptId);

				if (!GO.session("useOrgAccess")) {
					$('#importDisplay').remove();
					$('#importOption').remove();
				}
			})
		},

        _toggleQuickRegist: function() {
            $("#quickCreateForm .form_speed").slideToggle("fast");
		},

		_seeMore: function() {
            if (!this.backdropView) {
                this.backdropView = new BackdropView();
                this.backdropView.backdropToggleEl = this.$('div[el-backdrop]');
                this.backdropView.linkBackdrop(this.$('a[el-backdrop-link]'));
            }
		},

		_checkFieldShowing: function(fieldList, showName){
			var fieldChecked = false;
			_.each(fieldList, function(item){
				if(showName == item.fieldCode){
					fieldChecked = item.checked;
					return fieldChecked;
				}
			});
			return fieldChecked;

		},

		companyManage : function(){
			var companyManageView = new CompanyManageView({
				type: this.type,
				id : this.groupId,
				name : this.groupInfo.name,
				hasChildren : this.groupInfo.hasChildren
			});
			companyManageView.render();
		},

		_copyButtonClicked: function () {
			this.copyMenuModel = CopyMenuModel.read().toJSON();


			var contactIds = _.map(this._getCheckedContacts(), function (checkbox) {
				return $(checkbox).val();
			});
			if (contactIds.length == 0) {
				$.goMessage(ContactLang['선택된 주소록이 없습니다']);
				return;
			}

			var self = this;
			this.copyPopup = $.goPopup({
				header: ContactLang["주소록 복사"],
				modal: true,
				width : 300,
				pclass: 'layer_normal layer_item_move',
				contents: TplCopyContact({
					lang : lang
				}),
				buttons: [{
					autoclose: false,
					btype: 'confirm',
					btext: CommonLang["확인"],
					callback: function () {
						var type = self.copyPopup.find('#type option:selected').val();
						var groupId =self.copyPopup.find('#selectGroup option:selected').val();
						var deptId = self.copyPopup.find('#type option:selected').attr("data-id");
						getCheckedGroupIds.call(self, type, groupId, deptId);
					}
				}]
			});

			self.changeTypeSelect();
			self.changeGroupSelect();

			function getCheckedGroupIds(type, groupId, deptId) {
				var self = this;
				var url = GO.contextRoot + "api/contact/type/"+type+"/copy";
				if(this.groupId){
					url = GO.contextRoot + "api/contact/type/"+type+"/group/" + this.groupId + "/copy";
				}
				$.ajax({
					url: GO.contextRoot + "api/contact/type/"+type+"/copy",
					type: "POST",
					data: JSON.stringify({
						groupIds: (groupId == null || groupId == undefined) ? groupId: [groupId],
						contactIds: contactIds,
						deptId : deptId
					}),
					contentType: "application/json",
					success: function () {
						if (self.copyPopup) self.copyPopup.close();
						$.goSlideMessage(ContactLang["복사되었습니다."]);
					},
					error : function(rs) {
						$.goSlideMessage(rs.responseJSON.message, "caution");
					}
				});
			}

			this.copyPopupUnbindEvents();
			this.copyPopupBindEvents();
		},
		copyPopupUnbindEvents : function(){
			this.copyPopup.off();
		},
		copyPopupBindEvents : function(){
			this.copyPopup.on("change", "select#type", $.proxy(this.changeGroupSelect, this));
		},
		changeTypeSelect : function(){
			var tmpl = "";
			var self = this;
			$.each(self.copyMenuModel.priority.priorityTypes, function(i, item){
				if(!self.isCompany() && item == "COMPANY" && self.copyMenuModel.displayCompany){
					tmpl += "<option value='company'>" + lang.company + "</option>";
				}
				if(!self.isDept() && item == "DEPARTMENT" && self.copyMenuModel.displayDept){
					$.each(self.copyMenuModel.deptGroups, function(i, depts){
						tmpl += "<option data-id="+depts.deptId+" value='department'>[" + depts.deptName + "] " + lang.deptContact + "</option>";
					});
				}
				if(!self.isUser() && item == "USER"){
					tmpl += "<option value='personal'>" + lang.personal + "</option>";
				}
			});

			$('#type').html(tmpl);
		},
		changeGroupSelect : function(){
			var type = this.copyPopup.find('#type option:selected').val();
			var deptId = this.copyPopup.find('#type option:selected').attr("data-id");
			var copyMenuGroupsModel = CopyMenuGroupsModel.read({type:type, deptId:deptId});

			var self = this;
			$('#selectGroupLabel').show();
			$('#selectGroupDd').show();
			self.copyPopup.find(".btn_major_s").css({pointerEvents: "", cursor: "", opacity: ""});

			var tmpl ="";
			$('#canNotCopy').hide();
			if($('#type option:selected').val() == "company"){
				$.each(copyMenuGroupsModel.toJSON().companyGroups, function(i, item){
					tmpl += "<option value="+item.id+">" + item.parentPathName + "</option>";
				});
				if(tmpl == ""){
					$('#selectGroupLabel').hide();
					$('#selectGroupDd').hide();
					$('#canNotCopy').show();
					self.copyPopup.find(".btn_major_s").css({pointerEvents: "none", cursor: "default", opacity: "0.6"});
				}
			}else if($('#type option:selected').val() == 'department'){
				$.each(copyMenuGroupsModel.toJSON().deptGroups, function(i, item){
					if($('#type option:selected').attr("data-id") == item.deptId){
						$.each(item.groups, function(j, group){
							tmpl += "<option value="+group.id+">" + group.name + "</option>";
						});
						if(item.groups.length < 1){
							$('#selectGroupLabel').hide();
							$('#selectGroupDd').hide();
						}
					}
				});
			}else{
				$.each(copyMenuGroupsModel.toJSON().personalGroups, function(i, item){
					tmpl += "<option value="+item.id+">" + item.name + "</option>";
				});
				if(copyMenuGroupsModel.toJSON().personalGroups.length < 1){
					$('#selectGroupLabel').hide();
					$('#selectGroupDd').hide();
				}
			}
			$('#selectGroup').html(tmpl);
		},

		sendMailGroup: function (e) {
			var groupName = $(e.currentTarget).parents('h1').children('span.txt').text();
			var param = {"to":"\""+groupName+"\"" + "<$" + this.groupId + ">"};
			window.open(GO.contextRoot + "app/mail/popup/process?data=" + encodeURIComponent(JSON.stringify(param)), "popupRead" + Math.floor(Math.random() * 1000000) + 1, "scrollbars=yes,resizable=yes,width=1280,height=760");
		},

		_reloadTables: function (e) {
			this.listEl.tables.fnClearTable();
		},

		contactDetail: function (e) {
			var contactId = $(e.currentTarget).attr('data-id');
			var navigateParam = {
				trigger : true,
				pushStatus : true
			};
			var url;

			if (!this.groupId) {
				if(this.isUser()){
					url = "contact/" + contactId;
				}else{  // this.isDept()
					url = "contact/dept/" + this.deptId + "/modify/" + contactId;
				}
				App.router.navigate(url , navigateParam);
				return;
			}

			if (this.isUser()) {
				url = "contact/personal/" + this.groupId + "/modify/" + contactId;
			} else if(this.isCompany()){
				url = "contact/company/" + this.groupId + "/modify/" + contactId;
			} else { //this.isDept()
				url = "contact/dept/" + this.deptId + "/group/" + this.groupId + "/modify/" + contactId;
			}

			App.router.navigate(url , navigateParam)
		},

		contactCreate: function (e) {
			var url = "";
			if (this.groupId) {
				if (this.isUser()) {
					url = 'contact/personal/' + this.groupId + '/create';
				} else if(this.isCompany()){
					url = 'contact/company/' + this.groupId + '/create';
				} else { // this.isDept()
					url = 'contact/dept/' +this.deptId + "/group/" + this.groupId + '/create';
				}
			} else if(this.isUser()){
				url = "contact/create";
			} else { // this.isDept()
				url = "contact/dept/" + this.deptId + "/create";
			}

			App.router.navigate(url, {trigger: true, pushState: true});
		},

		renderDataTables: function (groupId, type, deptId) {
			var self = this;
			var params = {};

			if(this.isDept()) {
				if (groupId) {
					params["groupId"] = groupId;
				}
			}

			var maxWidth = GO.session().locale == 'ja' ? Math.round(this.$el.width() / 6 - 15) : Math.round(this.$el.width() / 5 - 10);

			this.goGrid = $.goGrid({
				el: '#contacts',
				url: App.contextRoot + makeUrl.apply(this),
				params : params,
				emptyMessage: TplContactNull({
					lang: lang
				}),
				method: 'get',
				defaultSorting: [[1, "asc"]],
				checkbox: true,
				checkboxData: 'id',
				columns: makeColumns.apply(this),
				fnServerError : function(jqXHR) {
					if(jqXHR.status == '403') {
						GO.util.error('403');
					}
				},
				fnDrawCallback: function (tables, oSettings, listParams) {
					self.$el.find("#contactCount").html(App.i18n(CommonLang['총건수'], "num", oSettings._iRecordsTotal));
					$(window).scrollTop(0);
					if (self.groupInfo != null) {
						if (self.isCompany() && self.groupInfo.writable != true) {
							self.$el.find(".data_null").find("span.txt").text(lang["등록된 주소록이 없습니다"]);
							self.$el.find("#contactCreate").remove()
						}
					}
				}
			});

			this.renderToolbar();


			function makeUrl() {
				var url;

				if(this.isDept()){
					url = "api/contact/dept/"+ deptId +"/contacts";
				}else{
					if (groupId) {
						var URL_MAPPER = {};
						URL_MAPPER[this.TYPE.USER] = "personal";
						URL_MAPPER[this.TYPE.COMPANY] = "company";

						url = 'api/contact/' + URL_MAPPER[type] + '/group/' + groupId + '/contacts';
					} else{
						url = 'api/contact/personal/contacts';
					}
				}

				return url;

			}

			function makeColumns() {
				var columns = [];

				if (this._checkFieldShowing(contactFieldData, 'NAME')) {
					columns.push({
						mData: "nameInitialConsonant",
						bSortable: true,
						sClass: "align_l name",
						fnRender: function (obj) {
							var name = GO.util.textToHtml(obj.aData.name);
							return '<span class="photo small">'
                                +'<img src="' + obj.aData.thumbSmall + '" title="' + name + '" alt="' + name +'" />'
								+'</span>'
								+'<a>'
								+'<span class="name contact_detail" data-id="' + obj.aData.id + '">' + name + '</span>'
								+'</a>';
						}
					});

					if (GO.session().locale == 'ja') {
						columns.push({
							mData: "nameHurigana",
							bSortable: true,
							sClass: "align_l name",
							fnRender: function (obj) {
								return '<span class="name">' + GO.util.textToHtml(obj.aData.nameHurigana) + '</span>';
							}
						});
					}
				}
				if (this._checkFieldShowing(contactFieldData, 'POSITION')) {
					columns.push({
						mData: null,
						bSortable: false,
						sClass: "align_l position",
						fnRender: function (obj) {
							if (obj.aData.positionName != undefined) {
								return '<span class="positionName">' + GO.util.textToHtml(obj.aData.positionName) + '</span>';
							} else {
								return "";
							}
						}
					});
				}
				if (this._checkFieldShowing(contactFieldData, 'MOBILE')) {
					columns.push({
						mData: "mobileNo",
						bSortable: false,
						sClass: "align_l hp",
						fnRender: function (obj){
							return '<span class="hp">' + GO.util.textToHtml(obj.aData.mobileNo) + '</span>';
						}
					});
				}
				if (this._checkFieldShowing(contactFieldData, 'EMAIL')) {
					columns.push({
						mData: "email",
						bSortable: true,
						sClass: "align_l email",
						fnRender: function (obj){
							return '<a><span class="email send_mail" data-position="' + GO.util.textToHtml(obj.aData.positionName) + '" data-department="' + GO.util.textToHtml(obj.aData.departmentName) + '" >' +  obj.aData.email + '</span></a>';
						}
					});
				}
				if (this._checkFieldShowing(contactFieldData, 'DEPARTMENT')) {
					columns.push({
						mData: null,
						bSortable: false,
						sClass: "align_l department",
						fnRender: function (obj) {
							if (obj.aData.departmentName != undefined) {
								return '<span class="departmentName">' + GO.util.textToHtml(obj.aData.departmentName) + '</span>';
							} else {
								return "";
							}
						}
					});
				}
				if (this._checkFieldShowing(contactFieldData, 'COMPANY')) {
					columns.push({
						mData: "companyName",
						bSortable: true,
						sClass: "align_l company",
						fnRender: function (obj) {
							if (obj.aData.companyName != undefined) {
								return '<span class="company">' + GO.util.textToHtml(obj.aData.companyName) + '</span>';
							} else{
								return "";
							}
						}
					});
				}
				if (this._checkFieldShowing(contactFieldData, 'COMPANY_PHONE')) {
					columns.push({
						mData: null,
						bSortable: false,
						sClass: "align_l tel",
						fnRender: function (obj) {
							if (obj.aData.office != undefined && obj.aData.office.tel != undefined) {
								return '<span class="tel">' + GO.util.textToHtml(obj.aData.office.tel) + '</span>';
							} else {
								return "";
							}
						}
					});
				}
				if (this._checkFieldShowing(contactFieldData, 'COMPANY_ADDRESS')) {

					columns.push({
						mData: null,
						bSortable: false,
						sClass: "align_l company_address",
						fnRender: function (obj) {
							if (obj.aData.office != undefined && obj.aData.office.basicAddress != undefined) {
								return '<span class="basicAddress">' + GO.util.textToHtml(obj.aData.office.basicAddress) + '</span>';
							} else {
								return "";
							}
						}
					});
				}

				if (this._checkFieldShowing(contactFieldData, 'MEMO')) {
					columns.push({
						mData: null,
						bSortable: false,
						sClass: "align_l memo",
						fnRender: function (obj) {
							if (obj.aData.description != undefined) {
								return '<span class="description">' + GO.util.textToHtml(obj.aData.description) + '</span>';
							} else {
								return "";
							}
						}
					});
				}
				if (this._checkFieldShowing(contactFieldData, 'GROUP')) {
					columns.push({
						mData: null,
						bSortable: false,
						sClass: "align_l group",
						fnRender: function (obj) {
							var groupName = [];
							if (obj.aData.groups == undefined) {
								return "";
							}
							$.each(obj.aData.groups, function (k, v) {
								groupName.push(v.name);
							});
							if (groupName.length > 0) {
								return '<span class="group" title="' + groupName.join(',') + '">' + GO.util.textToHtml(groupName.join(',')) + '</span>';
							} else {
								return "";
							}
						}
					});
				}

				return columns;
			}

			return this.goGrid;
		},

		renderToolbar: function () {
			var initialWord = ContactLang["초성검색"];
			var split = [];
			split = initialWord.split(',');

			var tplHtml = '<ul class="tab_nav small">';
			$(split).each(function (k, v) {
				if (k == 0) {
					tplHtml += '<li data-param="" class="first on"><span>' + v + '</span></li>';
				} else if (k == split.length - 1) {
					tplHtml += '<li class="last" data-param="' + v + '"><span>' + v + '</span></li>';
				} else {
					tplHtml += '<li data-param="' + v + '"><span>' + v + '</span></li>';
				}
			});
			tplHtml += '</ul>';

			this.$el.find('#toolBar').html(tplHtml);
			this.$el.find('.tool_bar .custom_header').append(this.$el.find('#toolBar').show());
			this.$el.find('#contacts_length').css('margin-top', '15px');
			this.$el.find('#contacts tr td:first-child,#contacts tr th:first-child').addClass('checkbox');

			var filedLang = ContactLang['필드 설정'];
			var fieldSettingHtml = '<div class="optional" style="margin-top: 15px;">';
			fieldSettingHtml += '<a id="popupFieldSetting" class="btn_tool" data-role="button"><span class="ic_toolbar setting"></span><span class="txt">' + filedLang + '</span> </a>';
			fieldSettingHtml += '</div>';
			this.$el.find('#contacts_wrapper .tool_bar:first').append(fieldSettingHtml);

		},


		initialSearch: function (e) {
			this.listEl.tables.setParam('initialConsonantPattern', $(e.currentTarget).attr('data-param'));
			$(e.currentTarget).parents("ul.tab_nav").find('li').removeClass("on");
			$(e.currentTarget).addClass("on");
		},

		contactMail: function (e) {
			if (this._getCheckedContacts().size() == 0) {
				$.goMessage(ContactLang['선택된 주소록이 없습니다']);
				return;
			}

			var checkedData = this.listEl.tables.getCheckedData(),
				emailArr = [];
			emailArr = $(checkedData).map(function (k, v) {
				var emailAddr = $(v.email).find("span.email").text();
				if (emailAddr) {
					return "\"" + v.name + "\"" + " <" + emailAddr + ">";
				}
			}).get();

			if (!emailArr.length) {
				$.goMessage(ContactLang['메일 주소가 없습니다.']);
			} else {
				var param = {"to":emailArr.join(',')};
				window.open(GO.contextRoot + "app/mail/popup/process?data=" + encodeURIComponent(JSON.stringify(param)), "popupRead" + Math.floor(Math.random() * 1000000) + 1, "scrollbars=yes,resizable=yes,width=1280,height=760");
			}

		},

		sendMail: function (e) {
			if (!GO.isAvailableApp('mail')) return;
			var email = $(e.currentTarget).html();
			var name = $(e.currentTarget).parents('tr').find('.contact_detail').text();
			var positionName =  $(e.currentTarget).data("position");
			var departmentName = $(e.currentTarget).data("department");
			positionName = (positionName && positionName != "undefined") ? '/' + positionName : "";
			departmentName = (departmentName && departmentName != "undefined") ? '/' + departmentName : "";
			
			var mailformat = name + positionName + departmentName;
			var param = {"to":"\"" + mailformat + "\"" + " <" + email + ">"};
			window.open(GO.contextRoot + "app/mail/popup/process?data=" + encodeURIComponent(JSON.stringify(param)), "popupRead" + Math.floor(Math.random() * 1000000) + 1, "scrollbars=yes,resizable=yes,width=1280,height=760");
		},

		groupModify: function (e) {
			var self = this;

			if (this._getCheckedContacts().size() == 0) {
				$.goMessage(ContactLang['선택된 주소록이 없습니다']);
				return;
			}

			var groups;

			if(this.isUser()){
				groups = PersonalGroupCollection.getCollection().toJSON() || [];
			}else{ // this.isDept()
				groups = DeptGroupCollection.get(this.deptId).toJSON() || [];
			}

			if (!groups.length) {
				$.goMessage(ContactLang['등록된 그룹이 없습니다']);
				return;
			}

			this.popupEl = $.goPopup({
				header: ContactLang["그룹지정"],
				modal: true,
				width: "262",
				pclass: 'layer_creat_group layer_normal',
				contents: TplGroupModify({
					data: groups
				}),

				buttons: [{
					autoclose: false,
					btype: 'confirm',
					btext: CommonLang["확인"],
					callback: function () {
						var groupItems = $('#popupGroupName').find('input:checked');
						var groupIds = [];
						groupItems.each(function () {
							groupIds.push($(this).val());
						});
						self.saveGroups(groupIds);
						self._reloadTables();
						self.popupEl.close();
					}
				},
					{
						btype: 'normal',
						btext: CommonLang["취소"],
						callback: function () {

						}
					}]


			});

			this.popupEl.reoffset();
			this.popupUnbindEvents();
			this.popupBindEvents();

		},

		popupUnbindEvents: function () {
			this.popupEl.off();
		},

		popupBindEvents: function () {
			this.initSWFUpload();
		},

		saveGroups: function (groupIds) {
			var ids = [];

			$(this.$el.find('form[name=formContacts]').serializeArray()).each(function (k, v) {
				if (v.name == 'id') {
					ids.push(v.value);
				}
			});

			var model = new GroupAddModel();
			model.set({
				"groupIds": groupIds,
				"contactIds": ids
			}, {silent: true});
			model.save({}, {
				type: 'PUT',
				async: false,
				success: function (model, response) {
					if (response.code == '200') {
						$.goMessage(ContactLang['그룹지정 완료']);
						$("#checkedAll").attr('checked', false);
					}
				},
				error: function (model, response) {
					var result = JSON.parse(response.responseText);
					$.goMessage(result.message);
				}
			});


		},

		contactDelete: function (e) {
			var self = this;
			var ids = [];
			var form = this.$el.find('form[name=formContacts]');
			var checkedContacts = this._getCheckedContacts();

			if (checkedContacts.size() == 0) {
				$.goMessage(ContactLang['선택된 주소록이 없습니다']);
				return;
			}

			$(form.serializeArray()).each(function (k, v) {
				if (v.name == 'id') {
					ids.push(v.value);
				}
			});

			$.goCaution(ContactLang["선택하신 주소록을 삭제하시겠습니까"], App.i18n(ContactLang["총 0명 선택되었습니다"], "count", checkedContacts.size()), function () {
				var model = new DeleteContactModel();
				model.set({
					"ids": ids,
				}, {silent: true});
				model.save({}, {
					type: 'DELETE',
					success: function (model, response) {
						if (response.code == '200') {
							$.goMessage(CommonLang['삭제되었습니다.']);
							self._reloadTables();
							$("#checkedAll").attr('checked', false);
						}
					},
					error: function (model, response) {
						var result = JSON.parse(response.responseText);
						$.goMessage(result.message);
					}
				});
			}, CommonLang["확인"]);
		},

		groupCancel: function (e) {
			var self = this;
			var ids = [];
			var form = this.$el.find('form[name=formContacts]');
			var checkedContacts = this._getCheckedContacts();

			if (checkedContacts.size() == 0) {
				$.goMessage(ContactLang['선택된 주소록이 없습니다']);
				return;
			}

			$(form.serializeArray()).each(function (k, v) {
				if (v.name == 'id') {
					ids.push(v.value);
				}
			});

			$.goCaution(
				ContactLang["선택한 연락처의 그룹을 해제 하시겠습니까"],
				App.i18n(ContactLang["총 0명 선택되었습니다"], "count", checkedContacts.size()),
				function () {
					var model = new GroupCancelModel();
					model.set({
						'groupId': self.groupId,
						"ids": ids,
					}, {silent: true});
					model.save({}, {
						type: 'DELETE',
						success: function (model, response) {
							if (response.code == '200') {
								$.goMessage(ContactLang['해제되었습니다.']);
								self._reloadTables();
								$("#checkedAll").attr('checked', false);
							}
						},
						error: function (model, response) {
							var result = JSON.parse(response.responseText);
							$.goMessage(result.message);
						}
					});
				}
				,CommonLang["확인"]);
		},

		quickCreate: function (e) {
			var self = this;
			var name = $("#quickName").val(),
				email = $("#quickEmail").val(),
				phone = $("#quickPhone").val();

			var invalidAction = function (msg, focusEl) {
				$.goMessage(msg);
				if (focusEl) focusEl.focus();
				return false;
			};

			if (name == ContactLang['이름(표시명)']) {
				name = "";
			}

			if (email == UserLang['이메일']) {
				email = "";
			}

			if (phone == UserLang['휴대폰']) {
				phone = "";
			}

			if (!$.goValidation.isCheckLength(2, 64, name)) {
				invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
					"arg1": "2",
					"arg2": "64"
				}), $("#quickName"));
				return false;
			}

			if (email.length > 0) {
				if (!$.goValidation.isValidEmail(email)) {
					invalidAction(CommonLang['이메일 형식이 올바르지 않습니다.'], $("#quickEmail"));
					return false;
				}
			}

			if (phone.length > 0) {
				if (!$.goValidation.isCheckLength(0, 40, phone)) {
					invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
						"arg1": "0",
						"arg2": "40"
					}), $("#quickPhone"));
					return false;
				}

				if (!$.goValidation.isInvalidTel(phone)) {
					invalidAction(ContactLang['번호형식이 올바르지 않습니다(-,0~9)'], $("#quickPhone"));
					return false;
				}
			}

			var model;
			if (this.isUser()) {
				model = new PersonalCreateContactModel();
			} else if(this.isCompany()){
				model = new CompanyCreateContactModel();
			} else { // this.isDept();
				model = new DeptContactModel();
				model.setDeptId(this.deptId);
			}

			model.set({
				"name": name,
				"mobileNo": phone,
				"email": email
			}, {silent: true});


			if (this.groupId) {
				if(this.isCompany()){
					model.setGroupId(this.groupId);
				} else {
					var groupIds = [];
					groupIds.push(this.groupId);
					model.set({"groupIds": groupIds});
				}
			}
			GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
			model.save({}, {
				type: 'POST',
				success: function (model, response) {
					if (response.code == '200') {
						$("#quickEmail").val("").focus().focusout();
						$("#quickPhone").val("").focus().focusout();
						$("#quickName").val("").focus().focusout();
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
						self._reloadTables();
					}
				},
				error: function (model, response) {
					GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					var result = JSON.parse(response.responseText);
					$.goMessage(result.message);
				}

			});
		},

		detailCreate: function (e) {
			var name = $("#quickName").val(),
				email = GO.util.escapePlaceholder($("#quickEmail")),
				phone = GO.util.escapePlaceholder($("#quickPhone"));

			var opt = {
				groupId: this.groupId
			};

			var data = {
				name: name,
				email: email,
				phone: phone
			};

			var type = null;

			if (this.isUser()) {
				type = "personal";
			} else if(this.isCompany()){
				type = "company";
			} else { // this.isDept()
				type = "dept";
				opt['deptId'] = this.deptId;
			}

			var invalidAction = function (msg, focusEl) {
				$.goMessage(msg);
				if (focusEl) focusEl.focus();
				return false;
			};

			if (name == ContactLang['이름(표시명)']) {
				name = "";
			}

			if (!$.goValidation.isCheckLength(2, 64, name)) {
				invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
					"arg1": "2",
					"arg2": "64"
				}), $("#quickName"));
				return false;
			} else {
				ContactCreateView.render(opt, 'create', type, data);

			}
		},

		contactExport: function () {

			var fileType = [{"value": "OUTLOOK"}, {"value": "OUTLOOK_EXPRESS"},];

			if (GO.session().locale == 'ja') {
				encording = [{"value": "SHIFT-JIS"}, {"value": "UTF-8"}, {"value": "EUC-KR"}];
			} else {
				encording = [{"value": "EUC-KR"}, {"value": "UTF-8"}, {"value": "SHIFT-JIS"}];
			}

			var groups = null;
			if (this.isUser()) {
				groups = PersonalGroupCollection.getCollection().toJSON() || [];
			} else if(this.isCompany()){
				groups = CompanyGroupCollection.getCollection().toJSON() || [] ;
			} else { // this.isDept()
				groups = DeptGroupCollection.get(this.deptId).toJSON() || [];
			}

			var self = this;
			var popup = $.goPopup({
				header: ContactLang["내보내기"],
				modal: true,
				width: "240px",
				pclass: 'layer_normal layer_addr_export',
				contents: TplContactExport({
					fileType: fileType,
					encording: encording,
					data: groups,
					isUser: this.isUser(),
					lang: lang,
				}),
				buttons: [{
					autoclose: false,
					btype: 'confirm',
					btext: CommonLang["확인"],
					callback: function () {
						var groupId = $('select[name=groupId] option:selected').val();
						var fileType = $('select[name=fileType] option:selected').val();
						var encording = $('select[name=encording] option:selected').val();

						if (groupId == 'all') {
							groupId = null;
						}

						var param = {
							groupId: groupId,
							csvType: fileType,
							charset: encording,
							ownerType: self.type
						};

						if(self.isDept()){
							param["deptId"] = self.deptId;
						}

						location.href = GO.contextRoot + "api/contact/export?" + self._serializeObj(param);
						popup.close();
					}
				},
					{
						btype: 'normal',
						btext: CommonLang["취소"],
						callback: function () {
						}
					}]
			});

			if (this.groupId > 0) {
				$("#selectContactExport").val(this.groupId);
			} else {
				$("#selectContactExport").val('all');
			}
		},

		contactImport: function () {
			$("#importOption").hide();

			this.contactLoadingPopup(ContactLang['CSV에서 가져오기']);
			var status = this.contactJobStatus("contact_import_batch");
			if (status == 'DONE') {
				this.contactImportPopup();
				this.popupEl.reoffset();
			} else {
				var self = this;
				var inteval = setInterval(function () {
					var status = self.contactJobStatus("contact_import_batch");
					if (status == 'DONE') {
						self.contactImportPopup();
						self.popupEl.reoffset();
						clearInterval(inteval);
					}
				}, 2000);
			}
		},

		//필드 설정 팝업
		popupFieldSetting: function (e) {
			var self = this;
			e.preventDefault();
			var contactfieldSettingLayer = $.goPopup({
				"pclass": "layer_normal",
				"header": ContactLang['필드 설정'],
				"modal": true,
				"width": 300,
				"contents": "",
				"buttons": [
					{
						'btext': CommonLang['확인'],
						'btype': 'confirm',
						'autoclose': false,
						'callback': function (rs) {
							self.savePopupFieldSetting();
							rs.close();
						}
					},
					{
						'btext': CommonLang["취소"],
						'btype': 'cancel'
					}
				]
			});

			this.fieldSettingLayerView = new FieldSettingLayerView({
				isGetFieldList : true,
				toRemoveColumns: this.toRemoveColumns
			});

			contactfieldSettingLayer.find('.content').append(this.fieldSettingLayerView.el);

			this.fieldSettingLayerView.render().done(function () {
				contactfieldSettingLayer.reoffset();
			});

			return false;
		},

		//필드설정 팝업 내용 저장
		savePopupFieldSetting: function () {
			var self = this;
			//var model = new contactListFieldModel();
			var fieldList = this.fieldSettingLayerView.getData();

			$.ajax({
				url:  GO.config("contextRoot") + 'api/contact/fields',
				contentType: "application/json",
				async: true,
				data: JSON.stringify(fieldList),
				type: 'POST',
				dataType: 'json',
				success : function(resp) {
					self.render(self.groupId, self.groupType);
				}
			});

		},


		contactImportPopup: function () {
			var self = this;
			var fileType = [{"value": "Outlook"}, {"value": "Outlook_Express"}];
			var encording = [{"value": "UTF-8"}, {"value": "EUC-KR"}, {"value": "SHIFT-JIS"}];

			var groups = null;
			var ownerType = null;
			if (this.isUser()) {
				groups = PersonalGroupCollection.getCollection().toJSON() || [];
				//ownerType = 'USER';
			} else if(this.isCompany()){
				groups = CompanyGroupCollection.getCollection().toJSON() || [];
				//ownerType = 'COMPANY';
			} else { // this.isDept()
				groups = DeptGroupCollection.get(this.deptId).toJSON();
			}


			this.popupEl = $.goPopup({
				header: ContactLang["CSV에서 가져오기"],
				modal: false,
				pclass: 'layer_normal layer_addr_import',
				contents: TplContactImport({
					fileType: fileType,
					data: groups,
					isCompany: this.isCompany(),
					lang: lang,
					contextRoot: App.contextRoot,
					ownerType: this.type
				}),

				buttons: [{
					autoclose: false,
					btype: 'confirm',
					btext: CommonLang["확인"],
					callback: function () {
						var form = $('form[name=importForm]');

						var data = {
							path: $("#filePath").attr("data-filepath"),
							groupId: form.find('select[name="groupId"]').val(),
							ownerType: form.find('input[name="ownerType"]').val(),
							csvType: form.find('select[name="csvType"]').val(),
							charset: form.find('select[name="charset"]').val(),
							writeType: form.find('input[name="writeType"]:radio:checked').val(),
							deptId : self.deptId
						};

						var param = self._serializeObj(data);

						$.go(GO.contextRoot + 'api/contact/import?' + param, '', {
							qryType: 'GET',
							contentType: 'application/json',
							responseFn: function (response) {
								if (response.code == '200') {
									self.contactLoadingPopup(ContactLang['CSV에서 가져오기']);
									var inteval = setInterval(function () {
										var status = self.contactJobStatus("contact_import_batch");
										if (status == 'DONE') {
											self.popupEl.close();
											$.goSlideMessage(ContactLang['가져오기 완료']);
											self.reloadContact();
											clearInterval(inteval);
										}
									}, 2000);
								}
							},
							error: function (response) {
								var result = JSON.parse(response.responseText);
								if (result.name == 'exceed.contact') {
									$.goSlideMessage(result.message, "caution");
								} else {
									$.goSlideMessage(ContactLang['가져오기실패'], "caution");
								}
							}
						});
					}
				},
					{
						btype: 'normal',
						btext: CommonLang["취소"],
						callback: function () {
						}
					}]
			});

			this.popupEl.find('.btn_major_s').hide();

			if (this.groupId) {
				this.popupEl.find("#selectContactImport").val(this.groupId);
			}

			this.popupEl.reoffset();
			this.popupUnbindEvents();
			this.popupBindEvents();
		},

		contactDeptImport: function () {
			var ownerType = this.type;
			var self = this;
			$("#importOption").hide();
			this.contactLoadingPopup(ContactLang['조직도에서 가져오기']);

			if (isDone()) {
				showPopup();
			} else {
				var inteval = setInterval($.proxy(this,
					function(){
						if(isDone()){
							showPopup();
							clearInterval(inteval);
						}
					})
					, 2000);
			}

			function showPopup(){
				self.contactDeptImportPopup();
				var view = new ContactDeptImportView({
					type : ownerType,
					groupId : self.groupId,
					deptId : self.deptId
				});
				view.render();
				self.popupEl.reoffset();
			}

			function isDone(){
				var status = self.contactJobStatus("contact_import_dept_batch");
				return status == 'DONE';
			}
		},

		contactDeptImportPopup: function () {
			var self = this;
			this.popupEl = $.goPopup({
				header: ContactLang['조직도에서 가져오기'],
				modal: false,
				pclass: 'layer_normal layer_address',
				width: '1000px',
				buttons: [{
					autoclose: false,
					btype: 'confirm',
					btext: CommonLang["확인"],
					callback: function () {
						userIds = [];
						deptIds = [];

						$.each($('#mailReceive ul li'), function (k, v) {
							if ($(v).hasClass('user')) {
								userIds.push($(v).attr('data-userid'));
							}
							if ($(v).hasClass('group')) {
								var subdept = 0;
								if ($(v).attr('data-sub') == 'true') {
									subdept = 1;
								}
								deptIds.push($(v).attr('data-id') + '_' + subdept);
							}
						});

						var writeType = $('input[name="writeType"]:radio:checked').val();

						var groupIds = [];
						$.each($('#groupNameTag li[data-id]'), function (k, v) {
							groupIds.push($(v).find('input').val());
						});

						this.model = new ImportDeptModel();
						this.model.set({
							"userIds": userIds,
							"deptIds": deptIds,
							"writeType": writeType,
							"groupIds": groupIds,
							"ownerType": self.type,
							"ownerDeptId" : self.deptId
						}, {silent: true});
						this.model.save({}, {
							type: 'POST',
							success: function (model, response) {
								if (response.code == '200') {
									self.contactLoadingPopup(ContactLang['조직도에서 가져오기']);
									var inteval = setInterval(function () {
										var status = self.contactJobStatus("contact_import_dept_batch");
										if (status == 'DONE') {
											self.popupEl.close();
											$.goSlideMessage(ContactLang['가져오기 완료']);
											self.reloadContact();
											clearInterval(inteval);
										}
									}, 2000);
								}
							},
							error: function (model, response) {
								var result = JSON.parse(response.responseText);
								$.goError(result.message);
							}
						});
					}
				},

					{
						btype: 'normal',
						btext: CommonLang["취소"],
						callback: function () {

						}
					}]
			});
		},

		contactLoadingPopup: function (title) {
			this.popupEl = $.goPopup({
				header: title,
				lang: lang,
				modal: false,
				pclass: 'layer_normal layer_import_info',
				contents: TplContactImportLoading({
					lang: lang
				}),
			});
		},

		contactJobStatus: function (jobName) {
			var result;
			$.ajax({
				type: "GET",
				async: false,
				dataType: "json",
				url: GO.contextRoot + "api/contact/job/status/" + jobName,
				success: function (resp) {
					result = resp.data.jobStatus;
				},
				error: function (resp) {
					$.goError(resp.responseJSON.message);
				}
			});
			return result;
		},

		contactPrint: function (e) {
			$("#contactPrintOption").hide();
			var type = $(e.currentTarget).attr('data-type');
			sessionStorage.setItem("contactPrintOffset", this.goGrid.listParams.offset);
			if (type == 'all') {
				sessionStorage.setItem("contactPrintOffset", 9999);
			}

			sessionStorage.setItem("contactPrintPage", this.goGrid.listParams.page);
			sessionStorage.setItem("groupId", this.groupId);
			sessionStorage.setItem("deptId", this.deptId);
			sessionStorage.setItem("contactPrintDirection", this.goGrid.listParams.direction);
			sessionStorage.setItem("type", this.type);
			sessionStorage.setItem("contactPrintProperty", this.goGrid.listParams.property);
			sessionStorage.setItem("initialConsonantPattern", this.goGrid.listParams.initialConsonantPattern);

			var url = GO.contextRoot + "app/contact/print";
			window.open(url, '', 'location=no, directories=no, resizable=yes, status=no, toolbar=no, menubar=no, width=1280, height=650, left=0, top=0, scrollbars=yes');
		},

		contactPrintDisplay : function() {

			var item = $("#contactPrintOption");

			if(item.css('display') == 'none') {
				item.show();
			} else {
				item.hide();
			}
		},

		importDisplay : function() {

			var item = $("#importOption");

			if(item.css('display') == 'none') {
				item.show();
			} else {
				item.hide();
			}
		},

		reloadContact : function() {
			//주소록 가져오기 비동기 처리로 인해서
			//주소록 앱을 벗어난경우 새로고침 안함
			//주소록 앱내에서도 목록에 있는 경우에만 새로고침
			var url  = App.router.getUrl();
			if(url.search('contact') == -1) {
				return;
			}
			if(url.search('create') > 0) {
				return;
			}
			App.router.navigate(url, {trigger:true, pushState:true, replace:true});
		},

		_serializeObj : function(obj) {
			var str = [];
			for(var p in obj) {
				if(obj[p] != undefined) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
			}
			return str.join("&");
		},

		initSWFUpload : function(){
			var self = this;
			new FileUploader({
				el: '#swfupload-control',
				context_root: GO.config('contextRoot'),
				button_text: "<span class='buttonText'>" + CommonLang["파일 첨부"] + "</span>",
				url : "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
			}).queue(function(e, data){
			}).start(function(e, data){
				var reExt = new RegExp("(csv)","gi"),
					fileExt = data.type.split(".")[1].toLowerCase();

				if(!reExt.test(fileExt)){
					$.goMessage(ContactLang["csv 파일만 가능합니다"]);
					return false;
				}

				if(data.size > 5 * 1024 * 1024){
					$.goMessage(CommonLang["첨부파일 용량은 5MB이하 입니다."]);
					return false;
				}
			}).progress(function(e, data){
			}).success(function(e, resp) {
				var data = resp.data,
					fileName = data.fileName,
					filePath = data.filePath;
					
                if(GO.util.isFileSizeZero(resp)) {
                	$.goAlert(GO.util.serverMessage(resp));
                	return false;
                }	
					
				$("#fileName").text(fileName);
				$("#fileName").prepend('<span class="ic_file ic_def"></span>');
				$("#filePath").attr("data-filepath",filePath);
				self.popupEl.find('.btn_major_s').show();
			}).complete(function(e, data){
			}).error(function(e, data){
			});
		},

		_getCheckedContacts : function() {
			return this.$('tbody input[type="checkbox"]:checked');
		},

		_toggleCheckAll : function() {
			var isCheckAll = true;
			_.each(this.$("tbody").find("input"), function (input) {
				if (!$(input).is(":checked")) isCheckAll = false;
			});

			this.$("#checkedAll").attr("checked", isCheckAll);
		},

		groupsFilter: function (e) {
			var key;

			if(this.isDept()){
				key = "groupId"
			}else{
				key = "groupsFilter";
			}
			this.changeFilter(e, key);
		},

		changeFilter: function (e, key) {
			var value = $(e.currentTarget).val();
			if (typeof this.listEl.tables.setParam == 'function') {
				this.listEl.tables.setParam(key, value);
			}
		}
	});

	return {
		render: function(groupId, type, deptId) {
			instance = new ContactHome({
				groupId : groupId,
				type : type,
				deptId : deptId
			});
			return instance.render();
		}
	};
});
