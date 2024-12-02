(function () {
    define([
            "jquery",
            'underscore',
            "backbone",
            "app",
            "admin/models/department",
            "system/models/licenseModel",

            "admin/views/department/dept_org_member_duty",
            "admin/views/department/dept_org_member_type",
            "admin/views/department/dept_order_config",
            "admin/views/department/org_exposure_config",
            "admin/views/department/mail_exposure_config",

            "admin/views/account/account_create",
            "admin/views/account/account_detail",
            "admin/views/department/dept_detail",
            "admin/views/department/add_dept",
            "admin/views/department/org_list",
            "admin/views/department/dept_file",
            'admin/views/org_sync_button',

            "hgn!admin/templates/dept_org",
            "hgn!admin/templates/dept_org_title",
            "hgn!admin/templates/dept_fail_alert",
            "hgn!admin/templates/_edit_dept",
            "hgn!admin/templates/_add_dept_member",
            "hgn!admin/templates/org_member",

            "i18n!admin/nls/admin",
            "i18n!nls/commons",
            "go-ignoreduplicatemethod",
            "jquery.go-sdk",
            "jquery.jstree.hotkeys",
            "jquery.jstree",
            "jquery.go-popup",
            "jquery.go-grid",
            "jquery.go-orgslide",
            "jquery.go-validation",
            "jquery.go-preloader",
            "GO.util"
        ],

        function (
            $,
            _,
            Backbone,
            App,
            DepartmentModel,
            LicenseModel,

            MemberDutyView,
            MemberTypeView,
            OrderConfigView,
            OrgConfigView,
            MailConfigView,

            AccountCreateView,
            AccountDetailView,
            DeptDetailView,
            AddDeptView,
            OrgListView,
            DeptFileView,
            OrgSyncButton,

            deptOrgTmpl,
            deptTitleTmpl,
            deptFailAlertTmpl,
            editDeptTmpl,
            addDeptMemberTmpl,
            orgMemberTmpl,
            adminLang,
            commonLang,
            GOIgnoreDuplicateMethod
        ) {
            var apiBaseUrl = GO.contextRoot + 'ad/api/',
                tplVar = {
                    'edit': commonLang['수정'],
                    'add': commonLang['추가'],
                    'add_member': adminLang["부서원 추가"],
                    'download': adminLang["다운로드"],
                    'delete': commonLang['삭제'],
                    'ok': commonLang['확인'],
                    'cancel': commonLang['취소'],
                    'org': adminLang['조직도'],
                    'dept_s': adminLang['부서_줄임'],
                    'dept': adminLang['부서'],
                    'dept_org': adminLang['조직도 관리'],
                    'dept_list': adminLang['조직도 목록'],
                    'dept_name': adminLang['부서명'],
                    'dept_delete': adminLang['부서 삭제'],
                    'dept_delete_confirm': adminLang['부서삭제?'],
                    'dept_migration': adminLang['데이터 이관 바로가기'],
                    'member_name': adminLang['이름 (이메일)'],
                    'member_grade': adminLang['직위'],
                    'member_email': adminLang['이메일'],
                    'member_duty': adminLang['직책'],
                    'dept_info' : adminLang['부서 정보'],
                    'dept_member_list': adminLang['부서원 목록'],
                    'dept_file': adminLang['부서 자료'],
                    'member_type': adminLang['멤버타입'],
                    'dept_mail_id': adminLang['부서메일아이디'] + "　　　",
                    'dept_code_id': adminLang['부서코드'] + "　　　",
                    'dept_alias_id': adminLang['부서약어'] + "　　　",
                    'dept_mail_id_explanation': adminLang['부서메일아이디'],
                    'dept_code_id_explanation': adminLang['부서코드'],
                    'dept_alias_id_explanation': adminLang['부서약어'],
                    'dept_mail_invalid_msg': adminLang['사용할 수 없는 이메일입니다.'],
                    'dept_mail_already_msg': adminLang['이미 사용중인 이메일입니다.'],
                    'dept_code_invalid_msg': adminLang['사용할 수 없는 부서코드입니다.'],
                    'dept_code_already_msg': adminLang['이미 사용중인 부서코드입니다.'],
                    'dept_alias_invalid_msg': adminLang['사용할 수 없는 부서약어입니다.'],
                    'dept_alias_already_msg': adminLang['이미 사용중인 부서약어입니다.'],
                    'check_validation': adminLang['0자이하 입력해야합니다.'],
                    'dept_member_select_msg': adminLang['부서원을선택하라'],
                    'member_reorder_desc': adminLang['부서 또는 순서변경'],
                    'org_add_desc': adminLang['부서원 추가 설명'],
                    'none': adminLang['미지정'],
                    'dept_member_move_success': adminLang['땡땡님이 땡떙부서로 이동되었습니다.'],
                    'dept_member_move_error': adminLang['이동에 실패하였습니다.'],
                    'already_added_member': adminLang['이미 부서원'],
                    'org_master_changed': adminLang['부서장 변경'],
                    'no_select_dept_mgs': adminLang['부서를 선택해 주십시오.'],
                    'save_success': commonLang['저장되었습니다.'],
                    //member type key - 변경불가
                    'MASTER': adminLang['부서장'],
                    'MODERATOR': adminLang['부부서장'],
                    'MEMBER': adminLang['부서원'],
                    'select_file': adminLang['파일선택'],
                    'duplicate_data': adminLang['중복데이터 처리'],
                    'ignore': adminLang['추가하지 않음'],
                    'dept_member_manage': adminLang['부서원 관리'],
                    'dept_org_import_fail': adminLang['등록이 실패한 조직 목록 다운로드'],
                    'dept_member_import_fail': adminLang['등록이 실패한 부서원 목록 다운로드'],
                    'export': adminLang['내보내기'],
                    'import': adminLang['가져오기'],
                    'close': commonLang['닫기'],
                    'orderConfig': adminLang['정렬 설정'],
                    'orderInit': adminLang['설정값으로 재정렬'],
                    'org_desc' : adminLang['조직도 설명'],

                    'mail_exposure_config' : adminLang['메일 주소 노출 설정'],
                    'dept_member_order_config' : adminLang['부서원 자동 정렬 설정'],
                    'org_exposure_config' : adminLang['사이트 조직도 노출 설정'],

                    'dept_add' : adminLang['부서 추가'],
                    'dept_delete' : adminLang['부서 삭제'],
                    'search' : commonLang['검색'],

                    'siteName_use_config': adminLang['사이트명 사용 여부'],
                    'orgUnfold_use_config': adminLang['조직도 펼침 여부'],
                    'org_unfold': adminLang['펼침'],
                    'org_fold': adminLang['펼치지 않음'],
                    'siteName_use_config_tool_tip': adminLang['조직도에 사이트명 노출여부를 설정할 수 있습니다.'],
                    'orgOpen_use_config_tool_tip': adminLang['로그인후, 조직도 펼침여부를 설정할 수 있습니다.'],
                    'org_exposure_config_ok': commonLang["저장"],
                    'org_exposure_config_cancel': commonLang["취소"],
                    'label_use': adminLang["사용함"],
                    'label_notuse': commonLang["사용하지 않음"],
                    'delete': commonLang["삭제"],

                    'create_new_member': adminLang['신규 멤버 생성'],
                    'create_new_dept_Member': adminLang['신규 부서원 생성'],
                    'dept_unspecified_member': adminLang['부서 미지정 멤버'],
                    'download_batch_register': adminLang['내려받기/일괄등록'],
                    'manual_sync': adminLang['채널 즉시 동기화']
                };

            var deptOrg = Backbone.View.extend({

                events: {
                    'click #orgDeptCreate': 'addDept',
                    'click #orgDeptDelete': '_deleteDept',
                    'click table#deptMembers span.btn_member_job': 'addDutyChangeView',
                    'click table#deptMembers span.btn_member_type': 'addTypeChangeView',
                    'click span#btnAddDeptMembers': 'addDeptMembers',
                    'click #btnOrderConfig': 'openOrderConfigPopup',
                    'click #btnOrgExposureConfig': 'openOrgExposureConfigPopup',
                    'click #btnMailExposureConfig': 'openMailExposureConfigPopup',
                    'click #closeAlert': 'removeFailResult',
                    'click span#btn_ok': 'orgExposureConfigSave',
                    'click span#btn_cancel': 'orgExposureConfigCancel',
                    'click a#createNewMember': 'createNewMember',
                    'click a#downloadBatchRegister': 'goToBatchRegisterLink',
                    'click a#deptUnspecifiedMember': "showDeptUnspecifiedMember",
                    'click .content_tab li': 'changeTab',
                    'click #orgSetting': 'orgSettingToggle',
                    'click #searchInputReset': 'resetSearchInput',
                    'keyup #search': 'searchNode',
                    'focus #search':'focusSearch',
                    'focusout #search':'focusOutSearch',
                    'click .jstree-leaf': 'clickNode',
                },

                initialize: function (options) {
                    this.options = options || {};
                    this.searchDeptId = this.options.opt1 || "";
                    this.menus = this.options.menus;
                    this.model = new Backbone.Model();
                    this.model.url = GO.contextRoot + "ad/api/department/csv";

                    var systemInfo = new Backbone.Model();
                    systemInfo.url = GO.contextRoot + "ad/api/systeminfo";
                    systemInfo.fetch({async: false});
                    this.systemInfo = systemInfo.toJSON();
                    this.licenseModel = LicenseModel.read();
                    this.deptModel = new DepartmentModel();

                    this.orgSyncable = GO.config('orgSyncWaitMin') > 0;
                    this.$el.on('orgChanged', _.bind(this.handleOrgChanged, this));
                },
                render: function () {
                    GO.EventEmitter.on("admin","refreshHeader", this.refreshHeader, this);
                    this.treeEl = null;
                    this.listEl = null;
                    var self= this;
                    var isUnspecified = $.cookie("jstree_select") == "#unspecified_-1";

                    this.getDeptRoot();
                    this.$el.html(deptOrgTmpl({
                        lang: tplVar,
                        rootDeptName: this.rootDeptName,
                        rootDeptCount: this.rootDeptCount,
                        isUnspecified: isUnspecified,
                        orgSyncable: this.orgSyncable
                    }));

                    this.orgSyncButton = new OrgSyncButton({
                        description: GO.i18n(adminLang['조직 설계 동기화 설명'], {
                            'term': GO.config('orgSyncWaitMin')
                        })
                    });
                    this.orgSyncButton.setElement(this.$('#manualSync'));
                    this.orgSyncButton.render();

                    this.orgListView = new OrgListView();
                    this.$el.find('#contentArea').append(this.orgListView.$el);
                    this.orgListView.render();

                    this.renderTree(this.searchDeptId);

                    this._updateUnspecifiedMemberCount();
                    this.bindResizing();

                    this.$el.on('click', function(e){
                        var target = $(e.target);
                        if(!target.parents().hasClass('layer_mini') && !target.hasClass('layer_mini') && self.prevSettingViewStatus ==='block'){
                            $('#orgSettingView').hide();
                        }
                        self.prevSettingViewStatus = $('#orgSettingView').css('display');
                    })

                    return this;
                },
                renderTree: function (searchDept) {
                    var self = this;
                    var keyword = this.$el.find("#search").val();
                    var url = apiBaseUrl + 'organization/admin/list';
                    if (keyword) {
                        this.keyword = '';
                        url = url + '?'+ $.param({'search' : keyword});
                    }else if (searchDept) {
                        $.removeCookie("jstree_select", {path: GO.contextRoot+'admin'});
                        $.removeCookie("jstree_select", {path: GO.contextRoot+'admin/dept'});
                        url = url + '?'+ $.param({'searchDeptId' : searchDept});
                    }
                    this.treeEl = this.$el.find('#orgMemTree').jstree({
                        'plugins': ['themes', 'json_data', 'ui', 'crrm', 'cookies', 'dnd', 'types', 'hotkeys', 'search'],
                        'json_data': {
                            'ajax': {
                                "url": url,
                                "data": function (n) {
                                    if (typeof n.data == 'function') var data = n.data();
                                    return {deptid: data ? data.id : self.loadId};
                                },
                                "cache": true,
                                "async": true,
                                "success": function (data) {
                                }
                            }
                        },
                        "search": {
                            "case_sensitive": false,
                            "show_only_matches": true,
                        },
                        'core': {
                            'animation': 120,
                            'strings': {
                                'loading': '&nbsp;'
                            }
                        },
                        "types": {
                            "valid_children": "none",
                            "types": {
                                "root": {
                                    "valid_children": "all"
                                },
                                "unspecified": {
                                    "valid_children": ["MEMBER"]
                                },
                                "MEMBER": {
                                    "valid_children": "none"
                                },
                                "MASTER": {
                                    "valid_children": "none"
                                },
                                "MODERATOR": {
                                    "valid_children": "none"
                                }
                            }
                        },
                        "crrm": {
                            "move": {
                                "check_move": function (m) {
                                    /*
                                     o : original, np : nextParent, p : position, cp : calculatePosition
                                     첫번째 조건 : 미지정 부서 폴더 이동시 false
                                     두번째 조건 : 부서 미지정 폴더 아래로 노드 이동시 false ( 부서 미지정 폴더는 항상 최하단에 놓임 )
                                     */
                                    return !((m.o.attr('rel') === "unspecified") || (m.np.attr("rel") === "root" && m.p !== "last" && m.np.data("childrenCount") + m.np.data("memberCount") < m.cp));
                                }
                            }
                        },
                        'defaults ': {
                            'html_titles': false,
                            'move_node': false,
                            'ccp': true,
                            'width': 200
                        },
                        'ui': {
                            'select_limit': -1,

                        },
                        'hotkeys': {
                            'del': self._deleteDept,
                            'f2': function () {
                                return false;
                            },
                            'space': function () {
                                return false;
                            }
                        }
                    }).bind("loaded.jstree", function (event, data) {
                        if(searchDept){
                            self.treeEl.jstree('select_node', $("#orgMemTree li[nodeid=" + searchDept + "][rel!='MODERATOR'][rel!='MEMBER'][rel!='MASTER']"), true);
                        }else if(_.isEmpty($.cookie("jstree_select"))||$.cookie("jstree_select")=="#-1"){
                            self.treeEl.jstree('select_node', self._getRootNode(), true);
                        }
                    }).bind("load_node.jstree", function (event, object) {
                            self.treeEl.find('a[href="#"]').attr('data-bypass', 1);
                        })
                        .bind("move_node.jstree", $.proxy(this._moveNode, this))
                        .bind("select_node.jstree", function (e, data) {
                            $.goOrgSlide('close');
                            self.selectedObj = data.rslt.obj;
                            self.selectedRel = self.selectedObj.attr('rel');
                            self.selectedObj.isModifyAlias = false;
                            self.selectedObj.isModifycode = false;
                            self.selectedObj.isModifyEmail = false;
                            var deptMemerId = self.selectedObj.data('id');
                            var parentNode = self.selectedObj.parents('li:eq(0)');
                            if (self.isMember(self.selectedRel)) { //부서원
                                self.isClickedMember = true;
                                self.deptId = self.selectedObj.data('deptId');
                                this.deptModel = self.getDeptModelById(self.deptId);
                                if(parentNode.attr('rel') !== "unspecified") {
                                    self.$el.find(".content_tab li [data-type='member_list']").trigger('click');
                                }
                                self.orgListView.onPreparedMemberListRendering();
                                self.orgListView.renderMember(deptMemerId);//notUserId
                                self.treeEl.jstree('select_node', parentNode, true);
                            } else if (self.selectedRel === "unspecified") {
                                self.deptId = self.selectedObj.data('id');
                                this.deptModel = self.getDeptModelById(self.deptId);
                                self.$el.find(".content_tab li [data-type='member_list']").trigger('click');
                            } else { //부서
                                if(self.isClickedMember){
                                    self.isClickedMember = false;
                                    return;
                                }
                                this.deptModel = self.getDeptModel(self.selectedObj.data());
                                var tab = self.$el.find('ul.content_tab li.active');
                                if(data.rslt.e && data.rslt.e.type =="click"){
                                    self.$el.find(".content_tab li [data-type='dept_info']").trigger('click');
                                }
                                else{
                                    tab.trigger('click');
                                }
                            }
                            self._setDeptTitle(this.deptModel.toJSON());
                        })
                        .bind("refresh.jstree", function (e, data) {
                            GO.EventEmitter.trigger("admin", "refreshFinish");
                        });
                },
                bindResizing: function () {
                    var self = this;
                    var resizer = new GOIgnoreDuplicateMethod(100);

                    $(window).resize(function (e) {
                        if (!$.isWindow(e.target)) return;
                        resizer.bind(function () {
                            self.resizeContent();
                        });
                    });
                    this.resizeContent();
                },

                resizeContent: function () {
                    $("#leftContainer").height($(window).height() - 140);
                    $("#rightContainer").height($(window).height() - 140);
                    $("#treeContainer").height($(window).height() - 226);
                    $("#deptMemberDiv").height($(window).height() - 295);
                    $("#accountDetail").height($(window).height() - 387);
                },

                refreshHeader: function(deptId){
                    this.deptModel = this.getDeptModelById(deptId);
                    this._setDeptTitle(this.deptModel.toJSON());
                },

                getSelectedNode: function () {
                    return this.treeEl.jstree('get_selected');
                },

                getSelectedDeptData: function (key) {
                    var self = this;
                    var selectedNode = self.getSelectedNode();
                    var selectedData = {};
                    if (_.isEmpty(selectedNode.data())) {
                        selectedData.id = this.$el.find("#deptName").data('id');
                        selectedData.name = this.$el.find("#deptName").text();
                        return selectedData;
                    }
                    if (this.isMember(selectedNode.attr('rel'))) {
                        selectedData.id = selectedNode.data('deptId');
                        selectedData.name = selectedNode.data('deptName');
                    } else {
                        selectedData = selectedNode.data();
                    }
                    selectedData.rel = selectedNode.attr('rel');
                    return (typeof key !== "undefined" ? selectedData[key] : selectedData);
                },

                isMember: function (type) {
                    return (type === "MEMBER" || type === "MASTER" || type === "MODERATOR");
                },

                openOrderConfigPopup: function () {
                    this.orgSettingToggle();
                    var self = this;
                    var orderConfigPopup = $.goPopup({
                        pclass: 'layer_normal layer_set_orgview',
                        header: adminLang['부서원 자동 정렬 설정'],
                        modal: true,
                        contents: '<div id="divOrderConfigPopup"></div>',
                        buttons: [{
                            btype: 'confirm',
                            btext: commonLang["수정"],
                            autoclose: true,
                            callback: function (rs) {
                                self.orderConfigView.saveOrderConfig();
                                self.treeEl.jstree('refresh', self.getSelectedNode());
                                self.refreshTab('member_list');
                            }
                        }, {
                            btype: 'close', btext: commonLang["취소"]
                        }]
                    });
                    this.orderConfigView = new OrderConfigView({$parentEl: this.$el});
                    orderConfigPopup.find("#divOrderConfigPopup").html(this.orderConfigView.render({parent: self}).el);
                    orderConfigPopup.reoffset();
                },

                openOrgExposureConfigPopup: function (e) {
                    this.orgSettingToggle();
                    var self = this;
                    var orgConfigPopup = $.goPopup({
                        pclass: 'layer_normal layer_set_orgview',
                        width:600,
                        header: adminLang['사이트 조직도 노출 설정'],
                        modal: true,
                        contents: '<div id="orgExposureConfigPopup"></div>',
                        buttons: [{
                            btype: 'confirm',
                            btext: commonLang["수정"],
                            autoclose: true,
                            callback: function (rs) {
                                self.orgConfigView.orgExposureConfigSave();
                            }
                        }, {
                            btype: 'close', btext: commonLang["취소"]
                        }]
                    });
                    this.orgConfigView = new OrgConfigView();
                    orgConfigPopup.find("#orgExposureConfigPopup").html(this.orgConfigView.render({parent: self}).el);
                    orgConfigPopup.reoffset();
                },

                openMailExposureConfigPopup: function (e) {
                    this.orgSettingToggle();
                    var self = this;
                    var orgConfigPopup = $.goPopup({
                        pclass: 'layer_normal layer_set_orgview',
                        header: adminLang['메일 주소 노출 설정'],
                        modal: true,
                        headerHtml: '<p class="desc">'+adminLang['메일주소노출 팝업설명1']+'</p><p class="desc">'+adminLang['메일주소노출 팝업설명2']+'</p>',
                        contents: '<div id="mailExposureConfigPopup"></div>',
                        buttons: [{
                            btype: 'confirm',
                            btext: commonLang["수정"],
                            autoclose: true,
                            callback: function (rs) {
                                self.mailConfigView.save();
                            }
                        }, {
                            btype: 'close', btext: commonLang["취소"]
                        }]
                    });
                    this.mailConfigView = new MailConfigView();
                    orgConfigPopup.find("#mailExposureConfigPopup").html(this.mailConfigView.render({parent: self}).el);
                    orgConfigPopup.reoffset();
                },
                _moveNode: function (e, data) {
                    var self = this;
                    var originalParent = data.rslt.op;
                    var original = data.rslt.o;
                    var originalRel = original.attr("rel");
                    var nextParent = data.rslt.np;
                    var targetParentId = nextParent.data('id');
                    var sortOrder = data.rslt.cp + 1;
                    if (originalParent.data('id') == targetParentId) {
                        if (data.rslt.cp > data.rslt.cop) {
                            sortOrder = data.rslt.cp;
                        }
                    }
                    if (originalRel === "org") { // 부서 이동
                        $('#orgMemTree').jstree("deselect_all", true);

                        var url = apiBaseUrl + '/department/' + original.data('id') + '/move';
                        var qryType = 'PUT';
                        var param = {
                            targetParentId: targetParentId,
                            sortOrder: sortOrder - nextParent.data('memberCount')
                        };
                    } else if (nextParent.attr('rel') === "unspecified") { //부서원 -> 미지정 부서
                        var url = apiBaseUrl + '/deptmember/' + original.attr('nodeid') + '/related';
                        var qryType = 'DELETE';
                    } else if (originalParent.attr('rel') === "unspecified") {// 미지정 부서원 -> 부서
                        var url = apiBaseUrl + '/department/' + nextParent.attr('nodeid') + '/member';
                        var qryType = 'POST';
                        var param = {
                            'userId': original.data('id'),
                        };
                    } else { //멤버 이동 (root는 moveNode 될 수 없음)
                        var url = apiBaseUrl + '/deptmember/' + original.find('a').attr('nodeid') + '/move';
                        var qryType = 'PUT';
                        var param = {
                            targetDeptId: targetParentId,
                            sortOrder: sortOrder
                        };
                    }

                    $.go(url, JSON.stringify(param), {
                        qryType: qryType,
                        contentType: 'application/json',
                        responseFn: function (rs) {
                            if (rs.code == 200) {
                                self.$el.trigger('orgChanged');
                                self.refreshTab();
                                if (qryType === 'DELETE' && rs.data) {
                                    self.refreshTab('member_list');
                                    rs.data.forEach(function (deptId) {
                                        var parentNode = $("#orgMemTree li[nodeid=" + deptId + "]");
                                        if(parentNode.length > 0) {
                                            self.treeEl.jstree('refresh', parentNode);
                                        }
                                    });
                                }
                                self.treeEl.jstree('refresh', nextParent);
                                this._updateUnspecifiedMemberCount();
                            } else {
                                $.jstree.rollback(data.rlbk);
                            }
                        },
                    });
                },

                _getRootNode: function () {
                    return this.$("#orgMemTree li:first");
                },
                _deleteDept: function (e) {
                    e.stopPropagation();
                    var self = this,
                        selectedData = this.getSelectedDeptData();

                    if (selectedData.rel === 'root' || selectedData.rel === "unspecified") {
                        $.goMessage(adminLang['삭제할 수 없습니다.']);
                        return false;
                    }
                    if (this.isMember(selectedData.rel)) {
                        $.goMessage(tplVar['no_select_dept_mgs']);
                        return false;
                    }

                    if (selectedData['id']) {
                        var deptDeleteConfirm = $.goPopup({
                            header: tplVar['dept_delete'],
                            width: 500,
                            modal: true,
                            message: tplVar['dept_delete_confirm'],
                            buttons: [{
                                btype: 'caution',
                                btext: tplVar["delete"],
                                autoclose: false,
                                callback: function (rs) {
                                    $.go(apiBaseUrl + 'department/' + selectedData['id'], {}, {
                                        qryType: 'DELETE',
                                        contentType: 'application/json',
                                        responseFn: function (rs) {
                                            self.$el.trigger('orgChanged');
                                            var selectedNode = self.getSelectedNode();
                                            var parentNode = selectedNode.parents('li:eq(0)');
                                            self.treeEl.jstree('refresh', parentNode);
                                            self.treeEl.jstree('select_node', parentNode, true);
                                            deptDeleteConfirm.close();
                                        }
                                    });
                                }
                            }, {
                                btype: 'close', btext: commonLang["취소"]
                            }, {
                                btype: 'confirm',
                                btext: tplVar["dept_migration"],
                                autoclose: true,
                                callback: function (rs) {
                                    self.$el.find(".content_tab li [data-type='dept_file']").trigger('click');
                                }
                            }]
                        });
                    } else {
                        $.goMessage(tplVar['no_select_dept_mgs']);
                    }
                },

                getDeptModel: function (deptData) {
                    this.deptModel.set({"id": deptData.id});
                    if (deptData.id === -1) {
                        this.deptModel.set({"name": deptData.name});
                        this.deptModel.set({"memberCount": this._getUnspecifiedMemberCount()});
                    } else {
                        this.deptModel.set({"emailId": ""}); // emailId가 null인경우 key 가 없다.
                        this.deptModel.set({"deptAlias": ""}); // deptAlias가 null인경우 key 가 없다.
                        this.deptModel.fetch({"async": false});
                        this.deptModel.setModifyFlag();
                    }
                    return this.deptModel;
                },

                getDeptModelById: function (id) {
                    this.deptModel.set({"id": id});
                    if (id === -1) {
                        this.deptModel.set({"name": adminLang['부서 미지정 멤버']});
                        this.deptModel.set({"memberCount": this._getUnspecifiedMemberCount()});
                    } else {
                        this.deptModel.set({"emailId": ""}); // emailId가 null인경우 key 가 없다.
                        this.deptModel.set({"deptAlias": ""}); // deptAlias가 null인경우 key 가 없다.
                        this.deptModel.fetch({"async": false});
                        this.deptModel.setModifyFlag();
                    }
                    return this.deptModel;
                },

                _setDeptTitle: function (data) {
                    var _this = this;
                    var setSearchTime = null;
                    var hasApprovalServicePack = false;
                    var controlBtnGroup = this.$el.find('#controlBtnGroup');

                    // 부서 (멤버카운트)
                    this.$el.find("#deptName").text(data.name);
                    this.$el.find("#deptName").data("id", data.id);
                    this.$el.find("#deptMemCount").text(' (' + data.memberCount + ')');

                    // (부서 미지정 멤버 카운트) 갱신
                    this._updateUnspecifiedMemberCount();

                    // 부서 미지정일 때 '신규 멤버 생성', 아닐 때 '신규 부서원 생성'
                    this._UpdateCreateNewBtnName();

                    if (this.licenseModel.get('approvalServicePack')) {
                        hasApprovalServicePack = true;
                    }
                    if (jQuery('#emailId').val() === tplVar['dept_mail_id']) {
                        data.isModifyEmail = true;
                    }
                    if (jQuery('#code').val() === tplVar['dept_code_id']) {
                        data.isModifyCode = true;
                    }
                    if (jQuery('#deptAlias').val() === tplVar['dept_alias_id']) {
                        data.isModifyAlias = true;
                    }

                    this.$el.find('.option_group .op_group').html(deptTitleTmpl({
                        'isUnspecifiedDept?': data.id === -1,
                        'isModifyEmail?': data.isModifyEmail || false,
                        'isModifyCode?': data.isModifyCode || false,
                        'isModifyAlias?': data.isModifyAlias || false,
                        'hasApprovalServicePack?': hasApprovalServicePack || false,
                        'id': data.id,
                        'email': data.email,
                        'emailId': data.emailId == "" ? null : data.emailId,
                        'code': data.code == "" ? null : data.code,
                        'deptAlias': data.deptAlias == "" ? null : data.deptAlias,
                        'name': data.name,
                        'lang': tplVar,
                        'preEmailId': data.preEmailId,
                        'preCode': data.preCode,
                        'preDeptAlias': data.preDeptAlias,
                        'preIsModifyEmail': data.isModifyEmail,
                        'preIsModifyCode': data.isModifyCode,
                        'preIsModifyDeptAlias': data.isModifyAlias,
                    }));
                    this.orgListView.changeOrder(!data.sortFlag);

                    $('input[placeholder]').placeholder();

                    if (data.isModifyEmail || !data.emailId) {
                        _this.$el.find('.option_group .op_group').find('input[name="emailId"]').bind('keyup.emailValidate', function (e) {
                            var emailSubmit = function () {
                                var msg = '',
                                    inputVal = $(e.target).val();
                                _this._checkDeptEmail(inputVal);
                                $.go(apiBaseUrl + 'department/' + data.id + '/emailcheck', {'emailId': inputVal}, {
                                    qryType: 'GET',
                                    contentType: 'application/json',
                                    responseFn: function (rs) {
                                        _this.$el.find('.go_alert').html(msg);
                                    },
                                    error: function (rs) {
                                        msg = tplVar['dept_mail_already_msg'];
                                        _this.$el.find('.go_alert').html(msg);
                                    }
                                });
                            };
                            if (e.keyCode === 13) {
                                emailSubmit();
                            } else {
                                clearTimeout(setSearchTime);
                                setSearchTime = setTimeout(emailSubmit, 700);
                            }
                        });
                    }
                    if (data.isModifyCode || !data.code) {
                        _this.$el.find('.option_group .op_group').find('input[name="code"]').bind('keyup.codeValidate', function (e) {
                            var codeSubmit = function () {
                                var msg = '',
                                    inputVal = $(e.target).val();
                                _this._checkDeptEmail(inputVal);
                                $.go(apiBaseUrl + 'department/' + data.id + '/codecheck', {'code': inputVal}, {
                                    qryType: 'GET',
                                    contentType: 'application/json',
                                    responseFn: function (rs) {
                                        _this.$el.find('.go_alert').html(msg);
                                    },
                                    error: function (rs) {
                                        msg = tplVar['dept_code_already_msg'];
                                        _this.$el.find('.go_alert').html(msg);
                                    }
                                });
                            };
                            if (e.keyCode === 13) {
                                codeSubmit();
                            } else {
                                clearTimeout(setSearchTime);
                                setSearchTime = setTimeout(codeSubmit, 700);
                            }
                        });
                    }
                    if (data.isModifyAlias || !data.deptAlias) {
                        _this.$el.find('.option_group .op_group').find('input[name="deptAlias"]').bind('keyup.deptAliasValidate', function (e) {
                            var deptAliasSubmit = function () {
                                var msg = '',
                                    inputVal = $(e.target).val();
                                _this._checkDeptEmail(inputVal);
                                $.go(apiBaseUrl + 'department/' + data.id + '/aliascheck', {'alias': inputVal}, {
                                    qryType: 'GET',
                                    contentType: 'application/json',
                                    responseFn: function (rs) {
                                        _this.$el.find('.go_alert').html(msg);
                                    },
                                    error: function (rs) {
                                        msg = tplVar['dept_alias_already_msg'];
                                        _this.$el.find('.go_alert').html(msg);
                                    }
                                });
                            };
                            if (e.keyCode === 13) {
                                deptAliasSubmit();
                            } else {
                                clearTimeout(setSearchTime);
                                setSearchTime = setTimeout(deptAliasSubmit, 700);
                            }
                        });
                    }
                    if (data.id === -1) {
                        controlBtnGroup.hide();
                    } else {
                        controlBtnGroup.show();
                    }
                },

                getDeptRoot: function () {
                    var self = this;
                    $.go(apiBaseUrl + '/organization/root', {}, {
                        qryType: 'GET',
                        async: false,
                        contentType: 'application/json',
                        responseFn: function (rs) {
                            self.rootDeptName = rs.data.name;
                            self.rootDeptCount = rs.data.memberCount;
                        }
                    });
                },
                _checkDeptEmail: function (val) {
                    var msg = '';
                    if (val == tplVar['dept_mail_id']) {
                        msg = adminLang["부서이메일입력경고"];
                    } else if (val.length > 0 && !$.goValidation.isValidEmailId(val)) {
                        msg = tplVar['dept_mail_invalid_msg'];
                    }
                    this.$el.find('.go_alert').html(msg);
                    if (msg != '') {
                        return false;
                    } else {
                        return true;
                    }
                },

                addDeptMembers: function (e) {
                    e.stopPropagation();

                    var self = this,
                        selectedDeptData = this.getSelectedDeptData();

                    if (selectedDeptData === null) {
                        $.goMessage(tplVar['no_select_dept_mgs']);
                        return;
                    } else {
                        $.goOrgSlide({
                            contextRoot: GO.contextRoot,
                            header: tplVar['org'],
                            desc: tplVar['org_add_desc'],
                            isAdmin: true,
                            target: e,
                            callback: function (obj) {
                                $.go(apiBaseUrl + 'department/' + selectedDeptData['id'] + '/member', JSON.stringify({'userId': obj.id}), {
                                    qryType: 'POST',
                                    contentType: 'application/json',
                                    responseFn: function (rs) {
                                        self.refreshTab("member_list");
                                    },
                                    error: function (rs) {
                                        var returnData = JSON.parse(rs.responseText);
                                        if (returnData.name == 'already_added_member') {
                                            $.goMessage(tplVar['already_added_member']);
                                        }
                                    }
                                });
                            }
                        });
                    }
                },
                addDutyChangeView: function (e) {
                    e.stopPropagation();

                    var target = $(e.currentTarget);
                    var view = new MemberDutyView({
                        el: target.parent('td'),
                        dutyCode: target.attr('data-code'),
                        memberId: target.attr('data-id')
                    });
                    view.render();
                },
                addTypeChangeView: function (e) {
                    e.stopPropagation();

                    var target = $(e.currentTarget);
                    var view = new MemberTypeView({
                        el: target.parent('td'),
                        type: target.attr('data-type'),
                        memberId: target.attr('data-id')
                    });
                    view.render();
                },

                _UpdateCreateNewBtnName: function () {
                    var btnName = this.getSelectedDeptData().rel === 'unspecified' ? adminLang['신규 멤버 생성'] : adminLang['신규 부서원 생성'];
                    this.$el.find("#createNewMember span.txt").text(btnName);
                },

                _updateUnspecifiedMemberCount: function () {
                    this.$el.find("#deptUnspecifiedMemberCount").text('(' + this._getUnspecifiedMemberCount() + ')');
                },

                _getUnspecifiedMemberCount: function () {
                    var memCnt = 0;
                    $.go(apiBaseUrl + "department/unspecified/member/count", {}, {
                        qryType: 'GET',
                        async: false,
                        contentType: 'application/text',
                        responseFn: function (rs) {
                            memCnt = rs.data;
                        }
                    });
                    return memCnt;
                },

                goToBatchRegisterLink: function () {
                    $.goPopup({
                        width : 500,
                        title : "",
                        pclass : "layer_confim",
                        contents : "<p class='q'>" + GO.i18n(adminLang['메뉴로 이동하시겠습니까'], {"menuName":adminLang['일괄 등록']}) + "</p>",
                        buttons : [{
                            btext : commonLang["확인"],
                            btype : "confirm",
                            autoclose : true,
                            callback : function() {
                                GO.router.navigate("account/batch/regist/dept", true);
                            }
                        }, {
                            btext : commonLang["취소"]
                        }]
                    });
                },

                showDeptUnspecifiedMember: function () {
                    this.$el.find("#orgMemTree a[rel='unspecified']").trigger('click');
                },

                attachCntBadge : function (popup) {
                    var saveContinueBtn = $(popup).find("footer a").first();
                    if (saveContinueBtn.hasClass("badge")) {
                        var $savedMemCnt = $(saveContinueBtn).find(".com_badge .txt");
                        var savedMemCnt = $savedMemCnt.text();
                        if (savedMemCnt < 99) {
                            $savedMemCnt.text(++savedMemCnt);
                        } else {
                            $savedMemCnt.text("99+");
                        }
                    } else {
                        saveContinueBtn.addClass("badge");
                        saveContinueBtn.append("<span class='com_badge'><span class='txt'>1</span></span>");
                    }
                },

                changeTab: function (e) {
                    var targetTab = $(e.currentTarget);
                    var type = targetTab.find('span').data('type');
                    this.$el.find('ul.content_tab li').removeClass('active');
                    targetTab.addClass("active");
                    this.renderContents(type);
                },

                refreshTab: function (type) { //type에 해당하는 tab refresh, type 없을 시 현재 tab refresh
                    var activeTab = this.$el.find('ul.content_tab li.active');
                    var activeType = activeTab.find('span').data('type');
                    if (!type) {
                        this.renderContents(activeType);
                    } else if (type === activeType) {
                        this.renderContents(type);
                    }
                    GO.EventEmitter.trigger("admin","refreshHeader", this.getSelectedDeptData().id);
                },

                renderContents: function (type) {
                    var selectedDept = this.getSelectedDeptData();
                    this.arrangeTabAndBtns(selectedDept.id);
                    if (type === 'dept_info') { // 부서 정보
                        this.$el.find("#deptMemberContent").hide();
                        this.$el.find("#deptInfoContent").show();
                        var deptDetailView = new DeptDetailView({"deptId": selectedDept.id});
                        this.$el.find("#deptInfoContent").html(deptDetailView.$el);
                        deptDetailView.render();
                        this.$el.find("#toolBar").hide();
                        //todo 부서로 포커싱 가게끔,,
                    } else if (type === 'member_list') {// 부서원 목록
                        this.$el.find("#deptInfoContent").hide();
                        this.$el.find("#deptMemberContent").show();
                        this.$el.find("#toolBar").show();
                        this.orgListView.renderDeptMemberList(selectedDept.id);
                    } else { // 부서 자료
                        this.$el.find("#deptMemberContent").hide();
                        this.$el.find("#deptInfoContent").show();
                        var deptFileView = new DeptFileView({
                            "deptId": selectedDept.id,
                            approvalMenuAccessible : this.menus.findMenuFromHref("approval/deptfolder").accessible,
                        });
                        this.$el.find("#deptInfoContent").html(deptFileView.$el);
                        deptFileView.render();
                        this.$el.find("#toolBar").hide();
                    }
                },
                arrangeTabAndBtns: function (deptId) {
                    if (deptId === -1) {
                        this.$el.find('ul.content_tab').hide();
                        this.$el.find('li[data-type="duty"]').hide();
                        this.$el.find('#delegateBtnArea').hide();
                        this.$el.find('li#deleteDeptMembers').hide();
                        this.$el.find('#deptCtr').hide();
                        this.$el.find('.wrap_order').hide();
                        this.$el.find('.moveDeptMembers span.txt').text(adminLang["부서 지정"]);
                    } else {
                        this.$el.find('ul.content_tab').show();
                        this.$el.find('li[data-type="duty"]').show();
                        this.$el.find('#delegateBtnArea').show();
                        this.$el.find('li#deleteDeptMembers').show();
                        this.$el.find('#deptCtr').show();
                        this.$el.find('.wrap_order').show();
                        this.$el.find('.moveDeptMembers span.txt').text(adminLang["부서 이동"]);
                    }
                },
                addDept: function (e) {
                    var selectedData = this.getSelectedDeptData();
                    var selectedDeptNode = this.getSelectedNode();
                    if (!(selectedData && selectedData.id)) {
                        $.goMessage(tplVar['no_select_dept_mgs']);
                        return false;
                    }
                    if (selectedData.rel === "unspecified" || this.isMember(selectedData.rel)) {
                        $.goMessage(tplVar['no_select_dept_mgs']);
                        return false;
                    }

                    var self = this;
                    var addDeptView = new AddDeptView();
                    var addPopup = $.goPopup({
                        header: adminLang["부서 추가"],
                        contents: '<div id="addDeptArea"></div>',
                        width: '500',
                        modal: true,
                        buttons: [{
                            'btext': adminLang["저장 후 계속 생성"],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function () {
                                addDeptView.deptSave = $.Deferred();
                                addDeptView.save(selectedDeptNode.data()['id']);
                                addDeptView.deptSave.promise().done(function () {
                                    addDeptView.reset();
                                    self.treeEl.jstree('refresh', selectedDeptNode);
                                    self.refreshTab('dept_info');
                                    self.attachCntBadge(addPopup);
                                    self.$el.trigger('orgChanged');
                                });
                            }
                        }, {
                            'btext': commonLang["저장"],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': $.proxy(function (e) {
                                var depth = self.treeEl.jstree('get_path').length;
                                if (depth >= 10) {
                                    $.goMessage(adminLang["하위부서는 최대 9개까지만 추가 가능합니다."]);
                                    return;
                                }
                                addDeptView.deptSave = $.Deferred();
                                addDeptView.save(selectedDeptNode.data()['id']);
                                addDeptView.deptSave.promise().done(function () {
                                    self.treeEl.jstree('refresh', selectedDeptNode);
                                    self.refreshTab('dept_info');
                                    self.$el.trigger('orgChanged');
                                    e.close();
                                });
                            }, self)

                        }, {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }]
                    });
                    addPopup.find('#addDeptArea').html(addDeptView.render(this.systemInfo.language).el);
                    addPopup.reoffset();
                },

                getCreateNewMemberTitleTpl: function (deptName) {
                    return ['<span class="wrap_group">',
                        '<span class="txt light"> / </span>',
                        '<span class="ic_adm ic_folder_s"></span>',
                        '<span class="txt light">', deptName, '</span>',
                        '</span>'].join('');
                },

                createNewMember: function () {
                    var self = this;
                    var selectedDept = this.getSelectedDeptData();
                    var param = hasDeptInfo(selectedDept) ? {"deptId": selectedDept.id} : {};
                    this.accountCreateView = new AccountCreateView(param);

                    this.createMemberPopup = $.goPopup({
                        header: hasDeptInfo(selectedDept) ?
                            adminLang['부서원 생성'] + self.getCreateNewMemberTitleTpl(selectedDept.name) : adminLang["멤버 생성"],
                        width: 800,
                        pclass: "layer_add_member layer_normal ui-draggable",
                        modal: true,
                        contents: '<div id="accountCreateArea"></div>',
                        buttons: [{
                            'btext': adminLang["저장 후 계속 생성"],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function () {
                                self.accountCreateView.save($.proxy(function () {
                                    this.refreshDeptNode(this.getSelectedNode());
                                    this.refreshTab();
                                    this.accountCreateView.reset();
                                    this.attachCntBadge(this.createMemberPopup);
                                    this.$el.trigger('orgChanged');
                                }, self));
                            }
                        }, {
                            'btext': commonLang["저장"],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function () {
                                self.accountCreateView.save($.proxy(function () {
                                    this.createMemberPopup.close();
                                    this.refreshDeptNode(this.getSelectedNode());
                                    this.refreshTab();
                                    this.$el.trigger('orgChanged');
                                }, self));
                            }
                        }, {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }]
                    });

                    this.createMemberPopup.find('#accountCreateArea').html(this.accountCreateView.el);
                    this.accountCreateView.render();
                    this.createMemberPopup.reoffset();

                    this.createMemberPopup.find("#btnMultiLang").on("click", function(e, data){
                        self.accountCreateView.toggleMultiLang();
                        self.createMemberPopup.reoffset();
                    });
                    this.createMemberPopup.find("#show_detail_btn").on("click", function(e, data){
                        self.accountCreateView.showDetail();
                        self.createMemberPopup.addClass('expand');
                        self.createMemberPopup.find('>.content').height('500px');
                        self.createMemberPopup.reoffset();

                    });
                    function hasDeptInfo(selectedDept) {
                        return selectedDept && selectedDept.id != -1;
                    }
                },

                refreshDeptNode: function (node) {
                    if (node.size() > 0) {
                        this.$el.find("#orgMemTree").jstree('refresh', node);
                    } else {
                        this.$el.find("#orgMemTree").jstree('refresh', this._getRootNode());
                    }
                },

                orgSettingToggle: function () {
                    this.$el.find("#orgSettingView").toggle();
                },

                searchNode: function (e) {
                    var $target = $(e.currentTarget);
                    var self = this;

                    if( e.keyCode == 13 ) {
                        self.renderTree();
                        return ;
                    }
                    clearTimeout(this.clearTimeOut);
                    this.clearTimeOut = setTimeout(function(){
                        if( e ) {
                            var inputValue = $.trim($target.val());
                            if ( inputValue != '' && self.keyword != inputValue ) {
                                self.$el.find("#searchInputReset").show();
                                self.keyword = inputValue;
                                self.renderTree();
                            }

                            if( inputValue == ''){
                                self.$el.find("#searchInputReset").hide();
                                self.renderTree();
                            }
                        };
                    }, 500);
                },
                focusSearch: function () {
                    this.$el.find(".search_micro").addClass("focus");
                    this.$el.find("#search").attr( 'placeholder', adminLang['부서/멤버를 검색하세요.']);
                },
                focusOutSearch: function () {
                    if (this.$el.find("#search").val()) return;
                    this.$el.find(".search_micro").removeClass("focus");
                    this.$el.find("#search").attr( 'placeholder', '' );
                },
                resetSearchInput: function () {
                    this.$el.find("#search").val('');
                    this.$el.find("#searchInputReset").hide();
                    this.$el.find(".search_micro").removeClass("focus");
                    this.$el.find("#search").attr( 'placeholder', '' );
                    this.renderTree();
                },
                handleOrgChanged: function() {
                    this.orgSyncButton.disable();
                },
            });
            return deptOrg;
        });
}).call(this);
