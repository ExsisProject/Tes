(function () {
    define([
            "jquery",
            'underscore',
            "backbone",
            "app",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",

            "hgn!admin/templates/account_list",
            "hgn!admin/templates/_modify_class_popup",
            "hgn!admin/templates/_modify_password_popup",
            "admin/collections/position_list",
            "admin/collections/grade_list",

            "admin/collections/usergroup_list",
            "admin/collections/mailgroup_list",
            "admin/views/account/account_create",
            "components/backdrop/backdrop",
            'admin/views/org_sync_button',

            "jquery.go-popup",
            "jquery.go-grid",
            "GO.util"
        ],
        function (
            $,
            _,
            Backbone,
            App,
            commonLang,
            adminLang,
            accountListTmpl,
            modifyClassPopupTmpl,
            modifyPasswordPopupTmpl,
            positionCollection,
            gradeCollection,
            UserGroup,
            MailGroupCollection,
            AccountCreateView,
            BackdropView,
            OrgSyncButton,
        ) {
            var type = {
                current_member_cnt: adminLang["현재 멤버 수"],
                label_total_account_quota: adminLang["총 할당 계정 용량"],
                label_available_account_quota: adminLang["추가 가능한 계정 용량"],
                cnt: commonLang["명"],
                online: adminLang["정상"],
                dormant: adminLang["메일 휴면"],
                stop: adminLang["중지"],
                available_added_cnt: adminLang["추가 가능한 멤버 수"],
                add_member: adminLang["멤버 생성"],
                modify_member_info: adminLang["멤버 정보 수정"],
                modify_password: adminLang["비밀번호 변경"],
                delete_member: adminLang["멤버 삭제"],
                account_no: adminLang["식별번호"],
                name: commonLang["이름"],
                account_group: commonLang["사용자 그룹"],
                email: commonLang["이메일"],
                user_number: adminLang["사번"],
                employee_no: commonLang["인식번호(사번/학번)"],
                not_exist_accounts: adminLang["등록된 계정이 없습니다."],
                position: adminLang["직위"],
                grade: adminLang["직급"],
                mail_group: adminLang["메일그룹"],
                account_status: adminLang["계정상태"],
                search: commonLang["검색"],
                close: commonLang["닫기"],
                error: commonLang["오류"],
                change_success: commonLang["변경되었습니다."],
                select_user: adminLang["선택된 사용자"],
                about_target_person: adminLang["명에 대해서"],
                modify_position: adminLang["직위 변경"],
                modify_grade: adminLang["직급 변경"],
                modify_user_group: adminLang["사용자그룹 변경"],
                modify_mail_group: adminLang["메일그룹 변경"],
                modify_status: adminLang["계정상태 변경"],
                member_delete_warning: adminLang["선택 멤버를 삭제하시겠습니까"],
                member_delete_restore_impossible_warning: adminLang["멤버 삭제 시 자료 복구 불가 경고"],
                member_delete_release_dept_guide: adminLang["멤버 부서 해제 가이드"],
                member_delete_error: adminLang["멤버 삭제 오류"],
                password: adminLang["비밀번호"],
                password_confirm: adminLang["비밀번호 확인"],
                password_not_match: adminLang["비밀번호 불일치"],
                password_require: commonLang["비밀번호를 입력해주세요"],
                save: commonLang["저장"],
                cancel: commonLang["취소"],
                label_limitless: adminLang["무제한"],
                mail_quota: adminLang["메일쿼터"],
                webfolder_quota: adminLang["자료실쿼터"],
                admin_delete_error: adminLang["관리자 삭제 오류"],
                stopped_member: adminLang["중지된 멤버"],
                dont_change_status: adminLang["상태 변경이 불가능합니다. 라이선스 계정수를 확인하세요."],
                name_and_email: commonLang["이름"] + " + " + commonLang["이메일"],
                add_user_group: adminLang["선택한 클래스를 추가함"],
                change_user_group: adminLang["선택한 클래스로 바꾸기"],
                reset_pwd: adminLang["비밀번호 초기화"],
                reset_pwd_messege: adminLang["선택된 사용자 0명에 대한 비밀번호 알럿"]
            };

            var AccountList = Backbone.View.extend({

                events: {
                    "click.account #count_info #countInfoFoldBtn": "toggleCountInfo",
                    'click.account #controlButtons #positionCtr': 'toggleSubPosition',
                    "click.account #controlButtons #createNewMember": "createNewMember",
                    'click.account #controlButtons .changePosition': 'modifyClass',
                    "click.account #controlButtons #deleteMembers": "deleteMembers",
                    "click.account #controlButtons .reset_pwd": "resetAccountPwd",
                    "click.account #account_list .btn_submenu .btn_tool": "showSubList",
                    "click.account #position li": "positionFilter",
                    "click.account #grade li": "gradeFilter",
                    "click.account #userGroup li": "userGroupFilter",
                    "click.account #mailGroup li": "mailGroupFilter",
                    "click.account #status li": "statusFilter",
                    "click.account span.btn_search": "search",
                    "click input:checkbox": "toggleCheckbox",
                    "keydown.account span.search_wrap input": "searchKeyboardEvent",
                    "click .wrap_action": "onClickedWrapAction",
                },

                initialize: function () {
                    this.init();
                    this.orgSyncable = GO.config('orgSyncWaitMin') > 0;
                    this.$el.on('orgChanged', _.bind(this.handleOrgChanged, this));
                },

                render: function () {
                    var account_cnt = this.getAccountCnt();
                    this.searchParams = this.getSearchParams();

                    var model = new Backbone.Model();
                    model.url = "/ad/api/quotaconfig";
                    model.fetch({async: false});
                    this.baseCompanyConfigModel = model.toJSON(),
                        resetPassword = this.resetPwdModel.toJSON().str;

                    var avaliableCount = account_cnt.userCount - account_cnt.usedCount + account_cnt.stopUserCount;
                    if (avaliableCount < 0) {
                        avaliableCount == 0;
                    }
                    account_cnt["available_added_cnt"] = avaliableCount;

                    var availableAccountQuota = parseInt(this.baseCompanyConfigModel.totalAccountQuota) - parseInt(account_cnt.totalAccountQuota);
                    var usedRate = (account_cnt.totalAccountQuota / this.baseCompanyConfigModel.totalAccountQuota * 100).toFixed(0);

                    if (this.baseCompanyConfigModel.totalAccountQuota == "0") {
                        this.baseCompanyConfigModel.totalAccountQuota = adminLang["무제한"];
                    } else {
                        this.baseCompanyConfigModel.totalAccountQuota = GO.util.getHumanizedFileSize(account_cnt.totalAccountQuota) + " / " + GO.util.getHumanizedFileSize(this.baseCompanyConfigModel.totalAccountQuota) + " (" + usedRate + "%)";
                    }

                    var tmpl = accountListTmpl({
                        accounts_cnt: account_cnt,
                        type: type,
                        positions: this.positions.toJSON(),
                        grades: this.grades.toJSON(),
                        userGroups: this.userGroups.toJSON(),
                        mailGroups: this.mailGroups.toJSON(),
                        baseCompanyConfigModel: this.baseCompanyConfigModel,
                        availableAccountQuota: GO.util.getHumanizedFileSize(availableAccountQuota),
                        isUseResetPwd: (resetPassword != undefined && resetPassword.length > 0) ? true : false,
                        usedAccount: function () {
                            return this.accounts_cnt.usedCount - this.accounts_cnt.stopUserCount;
                        }
                    });

                    this.$el.html(tmpl);
                    this.renderAccountList();
                    this.renderDownloadButtons();

                    this.orgSyncButton = new OrgSyncButton({
                        description: GO.i18n(adminLang['멤버통합관리 동기화 설명'], {
                            'term': GO.config('orgSyncWaitMin')
                        })
                    });
                    this.orgSyncButton.setElement(this.$('#manualSync'));
                    this.orgSyncButton.render();

                    if (this.searchParams['keyword']) this.$el.find('#accountSearch input[type=text]').val(this.searchParams['keyword']);

                    if (avaliableCount <= 0) {
                        $('.add_account').click(function () {
                            $.goError(adminLang["계정을 더이상 추가할 수 없습니다. 라이선스 계정수를 확인하세요."]);
                            return false;
                        });
                    } else if (account_cnt.userCount == 0) {
                        $('.add_account').click(function () {
                            $.goError(adminLang["사용자 라이선스 등록 경고"]);
                            return false;
                        });
                    } else if (this.baseCompanyConfigModel.totalAccountQuota != adminLang["무제한"] && availableAccountQuota < 0) {
                        $('.add_account').click(function () {
                            $.goError(adminLang["총 할당 계정 용량 초과"]);
                            return false;
                        });
                    }
                    if (this.baseCompanyConfigModel.totalAccountQuota == adminLang["무제한"]) {
                        $('#availableAccountQuota').hide();
                    }

                    return this;
                },

                init: function () {
                    this.positions = positionCollection.getCollection();
                    this.grades = gradeCollection.getCollection();
                    this.userList = null;
                    this.userGroups = UserGroup.getCollection();
                    this.mailGroups = MailGroupCollection.getCollection();
                    this.resetPwdModel = new Backbone.Model();
                    this.resetPwdModel.url = "/ad/api/resetpassword";
                    this.resetPwdModel.fetch({async: false});
                },

                toggleCountInfo: function () {
                    var $targetBtn = this.$el.find("span#countInfoFoldBtn i");
                    if ($targetBtn.hasClass('ic_accordion_s')) {
                        $targetBtn.removeClass('ic_accordion_s').addClass('ic_accordion_c').attr('title', commonLang["닫기"]);
                        this.$el.find('#count_info dl').show();
                    } else {
                        $targetBtn.removeClass('ic_accordion_c').addClass('ic_accordion_s').attr('title', commonLang["열기"]);
                        this.$el.find('#count_info dl').hide();
                    }
                },

                toggleCheckbox: function (e) {
                    if ($(e.currentTarget).is(':checked')) {
                        $(e.currentTarget).attr('checked', true);
                    } else {
                        this.$el.find('#checkedAll').attr('checked', false);
                        $(e.currentTarget).attr('checked', false);
                    }
                },
                searchParamKeys: ['page', 'offset', 'searchtype', 'keyword', 'sortkey', 'sortdir'],

                positionFilter: function (e) {
                    this.changeFilter(e, "positionFilter");
                },
                gradeFilter: function (e) {
                    this.changeFilter(e, "gradeFilter");
                },
                userGroupFilter: function (e) {
                    this.changeFilter(e, "userGroupFilter");
                },
                mailGroupFilter: function (e) {
                    this.changeFilter(e, "mailGroupFilter");
                },
                statusFilter: function (e) {
                    this.changeFilter(e, "statusFilter");
                },
                changeFilter: function (e, key) {
                    var value = $(e.currentTarget).attr('data-id');
                    var name = $(e.currentTarget).find('span').html();
                    if (typeof this.userList.tables.setParam == 'function') {
                        $(e.currentTarget).parents('.btn_submenu').find('.btn_tool span.txt').text(name);
                        $(".array_option").hide();
                        this.userList.tables.setParam(key, value);
                    }
                },
                attachCntBadge: function (popup) {
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
                createNewMember: function () {
                    var self = this;
                    this.accountCreateView = new AccountCreateView({
                        $parentEl: this.$el
                    });
                    this.createMemberPopup = $.goPopup({
                        header: adminLang["멤버 생성"],
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
                                    this.accountCreateView.reset();
                                    self.render();
                                    this.attachCntBadge(this.createMemberPopup);
                                }, self));
                            }
                        }, {
                            'btext': commonLang["저장"],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function () {
                                self.accountCreateView.save($.proxy(function () {
                                    this.createMemberPopup.close();
                                    self.render();
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

                    this.createMemberPopup.find("#btnMultiLang").on("click", function (e, data) {
                        self.accountCreateView.toggleMultiLang();
                        self.createMemberPopup.reoffset();
                    });
                    this.createMemberPopup.find("#show_detail_btn").on("click", function (e, data) {
                        self.accountCreateView.showDetail();
                        self.createMemberPopup.addClass('expand');
                        self.createMemberPopup.find('>.content').height('500px');
                        self.createMemberPopup.reoffset();
                        self.createMemberPopup.find(">.content").scrollTop(self.createMemberPopup.height() / 2);

                    });
                },
                deleteMembers: function () {
                    var self = this;
                    var checkedEls = $("#account_list input[type=checkbox]:checked");
                    if (checkedEls.length == 0) {
                        return $.goMessage(adminLang["멤버 선택 알림"]);
                    }
                    $.goPopup({
                        width: 500,
                        modal: true,
                        title: type.member_delete_warning,
                        contents: '<span class="txt_caution">' + type.member_delete_restore_impossible_warning + '</span>',
                        buttons: [{
                            btext: commonLang["삭제"],
                            btype: 'caution',
                            autoclose: true,
                            callback: function () {
                                var url = GO.contextRoot + "ad/api/user";
                                var options = {
                                    ids: []
                                };
                                for (var i = 0; i < checkedEls.length; i++) {
                                    if (checkedEls[i].value == "on") {
                                        continue;
                                    }
                                    options.ids.push(parseInt(checkedEls[i].value));
                                }
                                if (options.ids.length == 0) {
                                    return;
                                }
                                $.go(url, JSON.stringify(options), {
                                    qryType: 'DELETE',
                                    contentType: 'application/json',
                                    responseFn: function (response) {
                                        self.$el.trigger('orgChanged');
                                        $.proxy(self.deleteAccountOfChatRoom(options), self);
                                        $.goMessage(adminLang["멤버가 삭제되었습니다."]);
                                        $.proxy(self.reload(), self);
                                    },
                                    error: function (error) {
                                        var result = JSON.parse(error.responseText),
                                            msg = "";
                                        if (result.name == "admin.delete.error") {
                                            msg = type.admin_delete_error;
                                        }
                                        $.goAlert(type.member_delete_error, msg);
                                    }
                                });
                            }
                        }, {
                            btext: commonLang["취소"]
                        }]
                    });
                },
                resetAccountPwd: function () {
                    var checkedEls = $("#account_list input[id!=checkedAll][type=checkbox]:checked");
                    if (checkedEls.length == 0) {
                        return $.goMessage(adminLang["멤버 선택 알림"]);
                    }
                    $.goConfirm(type.reset_pwd,
                        App.i18n(type.reset_pwd_messege, {"arg1": checkedEls.length}),
                        function () {
                            var url = GO.contextRoot + "ad/api/user/password/reset",
                                options = {
                                    ids: []
                                };
                            for (var i = 0; i < checkedEls.length; i++) {
                                if (checkedEls[i].value == "on") {
                                    continue;
                                }
                                options.ids.push(parseInt(checkedEls[i].value));
                            }
                            if (options.ids.length == 0) {
                                return;
                            }
                            $.go(url, JSON.stringify(options), {
                                qryType: 'PUT',
                                contentType: 'application/json',
                                responseFn: function (response) {
                                    $.goMessage(commonLang["변경되었습니다."]);
                                },
                                error: function (error) {
                                    $.goMessage(commonLang["실패했습니다."]);
                                }
                            });
                        });
                },
                deleteAccountOfChatRoom: function (optoins) {
                    var url = GO.contextRoot + "ad/api/chat/members/users/free";
                    var param = optoins;

                    $.go(url, JSON.stringify(param), {
                        qryType: 'DELETE',
                        async: false,
                        contentType: 'application/json',
                        responseFn: function () {
                            $.goMessage(commonLang["삭제되었습니다."]);
                        },
                        error: function () {
                            $.goMessage(commonLang["실패했습니다."]);
                        }
                    });

                },
                reload: function () {
                    this.init();
                    this.render();
                },
                toggleSubPosition: function () {
                    if (!this.subPositionBackdropView) {
                        this.subPositionBackdropView = this._bindBackdrop(this.$el.find("#subPositionMenu"), this.$el.find("#positionCtr"));
                    }
                },
                _bindBackdrop: function ($el, $link) {
                    var backdropView = new BackdropView();
                    backdropView.backdropToggleEl = $el;
                    backdropView.linkBackdrop($link);
                    return backdropView;
                },
                modifyClass: function (e) {
                    var checkedEls = $("#account_list tbody input[type=checkbox]:checked");
                    if (checkedEls.length == 0) {
                        return $.goMessage(adminLang["멤버 선택 알림"]);
                    }
                    var self = this;
                    var classType = $(e.currentTarget).data('type');
                    this.popupEl = $.goPopup({
                        header: type.modify_member_info,
                        width: 400,
                        title: "",
                        modal: true,
                        contents: modifyClassPopupTmpl({
                            selectCount: checkedEls.length,
                            type: type,
                            positions: this.positions.toJSON()
                        }),
                        buttons: [{
                            'btext': commonLang["저장"],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function () {
                                self.changePositionAction();
                            }
                        }, {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }]
                    });
                    if (this.subPositionBackdropView) {
                        this.subPositionBackdropView.toggle(false);
                        this.subPositionBackdropView.unBindBackdrop();
                        this.subPositionBackdropView = null;
                    }
                    this.popupEl.reoffset();
                    this.changePositionSelect(classType);
                    this.popupEl.find("select.class_type").attr('disabled', 'true');

                },
                changePositionSelect: function (classType) {
                    var typeValues = [];
                    var typeValuesTmpl = "";
                    var selectEl = $(this.popupEl).find("select.class_type_values");
                    this.popupEl.find("select").val(classType);
                    this.popupEl.find('#userGroupOption').hide();

                    if (classType === "position") {
                        var positions = this.positions.toJSON();
                        for (var i = 0; i < positions.length; i++) {
                            typeValues.push({
                                id: positions[i].id,
                                name: positions[i].name
                            });
                        }
                    } else if (classType === "grade") {
                        var grades = this.grades.toJSON();
                        for (var i = 0; i < grades.length; i++) {
                            typeValues.push({
                                id: grades[i].id,
                                name: grades[i].name
                            });
                        }
                    } else if (classType === "mail_group") {
                        var mailGroups = this.mailGroups.toJSON();
                        for (var i = 0; i < mailGroups.length; i++) {
                            typeValues.push({
                                id: mailGroups[i].mailGroup,
                                name: mailGroups[i].mailGroup
                            });
                        }
                    } else if (classType === "status") {
                        typeValues = [{id: "0", name: adminLang["정상"]}, {id: "1", name: adminLang["메일 휴면"]}, {
                            id: "2",
                            name: adminLang["중지"]
                        }];
                    } else if (classType === "user_group") {
                        var userGroup = this.userGroups.toJSON();
                        for (var i = 0; i < userGroup.length; i++) {
                            typeValues.push({
                                id: userGroup[i].id,
                                name: userGroup[i].name
                            });
                        }
                        this.popupEl.find('#userGroupOption').show();
                    }
                    typeValues.forEach(function (value) {
                        typeValuesTmpl += "<option value='" + value.id + "'>" + value.name + "</option>";
                    });
                    selectEl.html(typeValuesTmpl);
                },
                changePositionAction: function () {
                    var checkedEls = $("#account_list tbody input[type=checkbox]:checked"),
                        self = this,
                        url = "",
                        classType = this.popupEl.find(".class_type").val(),
                        options = {
                            ids: []
                        };

                    for (var i = 0; i < checkedEls.length; i++) {
                        options.ids.push(parseInt(checkedEls[i].value));
                    }

                    if (classType == "position") {
                        url = GO.contextRoot + "ad/api/user/position";
                        options.id = this.popupEl.find(".class_type_values").val();
                    } else if (classType == "grade") {
                        url = GO.contextRoot + "ad/api/user/grade";
                        options.id = this.popupEl.find(".class_type_values").val();
                    } else if (classType == "status") {
                        url = GO.contextRoot + "ad/api/user/status";
                        options.id = this.popupEl.find(".class_type_values").val();

                        var account_cnt = this.getAccountCnt();
                        var avaliableCount = account_cnt.userCount - account_cnt.usedCount + account_cnt.stopUserCount;

                        validateStatusChange.call(this, options.id, avaliableCount, checkedEls)
                        $('#account_error_message').hide();
                    } else if (classType == "mail_group") {
                        url = GO.contextRoot + "ad/api/user/mailgroup";
                        options.stringId = this.popupEl.find(".class_type_values").val();
                    } else if (classType == "user_group") {
                        var userGroupChgOption = $('input:radio[name="userGroup"]:checked').val();
                        if (userGroupChgOption == "change") {
                            url = GO.contextRoot + "ad/api/user/usergroup/change";
                        } else {
                            url = GO.contextRoot + "ad/api/user/usergroup/add";
                        }
                        options.id = this.popupEl.find(".class_type_values").val();
                    }
                    this.popupEl.close();
                    $.go(url, JSON.stringify(options), {
                        qryType: 'PUT',
                        contentType: 'application/json',
                        responseFn: function (response) {
                            self.$el.trigger('orgChanged');
                            $.goMessage(commonLang["변경되었습니다."]);
                            $.proxy(self.reload(), self);
                        },
                        error: function (error) {
                            $.goMessage(commonLang["오류"]);
                        }
                    });
                    $("#gpopupLayer").remove();
                },

                getAccountCnt: function () {
                    var cnt = {},
                        url = GO.contextRoot + "ad/api/company/license";
                    $.go(url, "", {
                        async: false,
                        qryType: 'GET',
                        contentType: 'application/json',
                        responseFn: function (response) {
                            if (response.code === "200") {
                                cnt = response.data;
                            } else {

                            }

                        },
                        error: function (error) {
                            $.goAlert(type.error);
                        }
                    });
                    return cnt;
                },
                renderAccountList: function () {

                    var self = this,
                        behindIds = [],
                        inputIds = [];

                    this.$tableEl = this.$el.find('#account_list');

                    this.userList = $.goGrid({
                        el: $('#account_list'),
                        method: 'GET',
                        destroy: true,
                        url: GO.contextRoot + 'ad/api/user/list',
                        params: this.searchParams,
                        emptyMessage: "<p class='data_null'> " +
                            "<span class='ic_data_type ic_no_data'></span>" +
                            "<span class='txt'>" + type.not_exist_accounts + "</span>" +
                            "</p>",
                        defaultSorting: [[1, "asc"]],
                        sDomType: 'admin',
                        checkbox: true,
                        checkboxData: 'id',
                        displayLength: App.session('adminPageBase'),
                        columns: [
                            {
                                mData: "name",
                                sWidth: '130px',
                                sClass: "name",
                                bSortable: true,
                                fnRender: function (obj) {
                                    inputIds.push(obj.aData.id);
                                    if (obj.aData.openType == 'behind') behindIds.push(obj.aData.id);
                                    if (obj.aData.openType == "open") {
                                        return '<span data-id="' + obj.aData.id + '">' + obj.aData.name + '</span>';
                                    } else {
                                        return '<span class="behind" data-id="' + obj.aData.id + '">' + obj.aData.name + '</span>';
                                    }
                                }
                            },
                            {mData: "position", sWidth: '100px', sClass: "position", bSortable: false},
                            {mData: "grade", sWidth: "80px", sClass: "grade", bSortable: false},
                            {
                                mData: "userGroup",
                                sWidth: '120px',
                                sClass: "user_group",
                                bSortable: false,
                                fnRender: function (obj) {
                                    return self._getUserGroupName(obj.aData.userGroup);
                                }
                            },
                            {
                                mData: "loginId",
                                sWidth: '120px',
                                sClass: "email",
                                bSortable: true,
                                fnRender: function (obj) {
                                    return obj.aData.email;
                                }
                            },
                            {
                                mData: "mailUsage", sClass: "mail_qt", bSortable: true, fnRender: function (obj) {
                                    return self.makeQuotaTmpl(obj.aData.assignedMailQuota, obj.aData.mailUsage);
                                }
                            },
                            {
                                mData: "webFolderUsage", sClass: "data_qt", bSortable: true, fnRender: function (obj) {
                                    return self.makeQuotaTmpl(obj.aData.assignedWebFolderQuota, obj.aData.webFolderUsage);
                                }
                            },
                            {mData: "mailGroup", sWidth: "120px", sClass: "group", bSortable: false},
                            {
                                mData: "status",
                                sClass: "align_c",
                                sWidth: "100px",
                                sClass: "state last",
                                bSortable: false,
                                fnRender: function (obj) {
                                    return type[obj.aData.status];
                                }
                            }
                        ],
                        fnDrawCallback: function (obj, oSettings, listParams) {
                            self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
                            self.$el.find('#checkedAll').attr('checked', false);
                            self.$el.find('tr>td:nth-child(2)').css('cursor', 'pointer').click(function (e) {
                                var targetEl = $(e.currentTarget).find('span');
                                if (targetEl.hasClass("behind")) {
                                    self.passwordPopupEl = $.goPopup({
                                        header: targetEl.text() + " " + type.modify_password,
                                        width: 400,
                                        title: "",
                                        modal: true,
                                        contents: modifyPasswordPopupTmpl({
                                            type: type,
                                            data: {passwordUserId: targetEl.attr('data-id')}
                                        })
                                    });
                                    self.passwordPopupEl.reoffset();
                                    self.passwordPopupUnbindEvents();
                                    self.passwordPopupBindEvents();
                                } else {
                                    App.router.navigate('account/' + targetEl.attr('data-id'), {trigger: true});
                                }
                            });

                            $(behindIds).each(function (k, v) {
                                self.$tableEl.find('input[type="checkbox"][name="id"][value="' + v + '"]').attr('disabled', true);
                            });

                            self._addSearchParam({'page': listParams.page, 'offset': listParams.offset}, true);
                        }
                    });
                },
                renderDownloadButtons: function () {
                    this.$el.find('.toolbar_top .dataTables_length').prepend(
                        '<span class="btn_tool" id="down_account_list">' +
                        '<span class="ic_adm ic_download"></span>' +
                        '<span class="txt">' + adminLang['목록 다운로드'] + '</span>' +
                        '</span>' +
                        '<span class="btn_tool" id="downloadBatchRegister">' +
                        '<span class="ic_adm ic_shortcut"></span>' +
                        '<span class="txt">' + adminLang['일괄 등록'] + '</span>' +
                        '</span>' +
                        (this.orgSyncable ? '<span class="btn_tool" id="manualSync"></span>' : '')
                    );

                    this.bindingEvent();
                },

                bindingEvent: function () {
                    this.$el.find("#down_account_list").on('click', $.proxy(this.downAccountList, this));
                    this.$el.find("#downloadBatchRegister").on('click', $.proxy(this.goToBatchRegisterLink, this));
                },

                downAccountList: function () {
                    var url = "ad/api/user/download/list?";
                    var data = this.userList.listParams;
                    var properties = {
                        "property": data.property,
                        "direction": data.direction,
                        "positionFilter": data.positionFilter,
                        "gradeFilter": data.gradeFilter,
                        "userGroupFilter": data.userGroupFilter,
                        "mailGroupFilter": data.mailGroupFilter,
                        "statusFilter": data.statusFilter,
                        "searchtype": data.searchtype,
                        "keyword": data.keyword
                    };
                    GO.util.downloadCsvFile(url + GO.util.jsonToUrlParam(properties));
                },
                makeQuotaTmpl: function (totalQuota, usedQuota) {
                    var usedRate = 0;
                    if (totalQuota != 0) {
                        usedRate = (parseInt(usedQuota) / parseInt(totalQuota) * 100).toFixed(0);
                    }
                    var changedUsedQuota = GO.util.getHumanizedFileSize(usedQuota),
                        changedTotalQuota = GO.util.getHumanizedFileSize(totalQuota);
                    return changedUsedQuota + " / " + changedTotalQuota + " (" + usedRate + "%)";
                },
                passwordPopupUnbindEvents: function () {
                    this.passwordPopupEl.off();
                },
                passwordPopupBindEvents: function () {
                    var self = this;

                    this.passwordPopupEl.on("click", "#passwordSave", $.proxy(this.changePassword, this));
                    this.passwordPopupEl.on("click", "#passwordCancel", function () {
                        self.passwordPopupEl.close();
                    });
                },
                changePassword: function () {
                    var self = this,
                        url = GO.contextRoot + "ad/api/user/password/" + $("#passwordUserId").val(),
                        params = {
                            newPassword: $("#password").val(),
                            newPasswordConfirm: $("#passwordConfirm").val()
                        };

                    if (params.newPassword.length == 0 || params.newPasswordConfirm.length == 0) {
                        $.goMessage(commonLang["비밀번호를 입력해주세요"]);
                        return;
                    }

                    if (params.newPassword != params.newPasswordConfirm) {
                        $.goMessage(adminLang["비밀번호 불일치"]);
                        return;
                    }


                    $.go(url, JSON.stringify(params), {
                        qryType: 'PUT',
                        contentType: 'application/json',
                        responseFn: function (response) {
                            $.goAlert(commonLang["변경되었습니다."], "", self.passwordPopupEl.close);
                        },
                        error: function (error) {
                            $.goAlert(commonLang["저장에 실패 하였습니다."]);
                        }
                    });
                },
                _getUserGroupName: function (names) {
                    var groupNames = "";

                    if (names.length == 0) {
                        return "";
                    } else {
                        for (var i = 0; i < names.length; i++) {
                            if (i > 0) {
                                groupNames += ", ";
                            }
                            groupNames += names[i];
                        }
                    }

                    return groupNames;
                },
                _addSearchParam: function (newParams, paramOnly) {
                    var getUrl = App.router.getUrl(),
                        searchParams = this.getSearchParams(),
                        newParams = newParams;

                    $.each(this.searchParamKeys, function (k, v) {
                        if (newParams.hasOwnProperty(v)) searchParams[v] = newParams[v];
                    });
                    App.router.navigate(getUrl.split('?')[0] + '?' + this._serializeObj(searchParams));
                },
                _serializeObj: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                    return str.join("&");
                },
                getSearchParams: function () {
                    var search = App.router.getSearch(),
                        returnParams = search || {};

                    returnParams['page'] = parseInt(search['page'], 10) || 0;//-1
                    returnParams['offset'] = search['offset'] || '';
                    return returnParams;
                },

                searchKeyboardEvent: function (e) {
                    if (e.keyCode == 13) {
                        this.search();
                    }
                },
                search: function () {
                    var _this = this,
                        searchForm = this.$el.find('.table_search input[type="text"]'),
                        keyword = searchForm.val();

                    this.userList.tables.search(this.$el.find('.table_search select').val(), keyword, searchForm);
                },
                goToBatchRegisterLink: function () {
                    $.goPopup({
                        width: 500,
                        title: "",
                        pclass: "layer_confim",
                        contents: "<p class='q'>" + GO.i18n(adminLang['메뉴로 이동하시겠습니까'], {"menuName": adminLang['일괄 등록']}) + "</p>",
                        buttons: [{
                            btext: commonLang["확인"],
                            btype: "confirm",
                            autoclose: true,
                            callback: function () {
                                GO.router.navigate("account/batch/regist/member", true);
                            }
                        }, {
                            btext: commonLang["취소"]
                        }]
                    });
                },
                showSubList: function (e) {
                    var subList = $(e.currentTarget).parent().find('div.array_option');
                    if (subList.css('display') == "none") {
                        $(".array_option").hide();
                        subList.show();
                    } else {
                        subList.hide();
                    }
                },
                onClickedWrapAction: function () {
                    this.$el.find('.wrap_action').toggle();
                    this.$el.find('.info_summary li').not('.first').toggle();
                    if (this.baseCompanyConfigModel.totalAccountQuota == adminLang["무제한"]) {
                        $('#availableAccountQuota').hide();
                    }
                },

                handleOrgChanged: function () {
                    this.orgSyncButton.disable();
                },
            });

            return AccountList;
        });

    function validateStatusChange(statusId, avaliableCount, checkedEls) {
        var STATUS = {
            "NORMAL": 0,
            "DORMANT": 1,
            "STOP": 2
        };

        if (statusId == STATUS.STOP) {
            return;
        }

        var addCount = 0,
            self = this;

        $.each(checkedEls, function () {
            var rowData = self.userList.tables.fnGetData($(this).closest("tr")[0]);
            if (rowData.status == 'stop') {
                addCount++;
            }
        });

        if (addCount > avaliableCount) {
            $('#account_error_message').show();
            throw new Error();
        }
    }
}).call(this);
