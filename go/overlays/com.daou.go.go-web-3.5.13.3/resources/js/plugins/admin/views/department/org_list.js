define("admin/views/department/org_list", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");
    var Tpl = require("hgn!admin/templates/org_list");
    var BackdropView = require('components/backdrop/backdrop');
    var AccountDetailView = require("admin/views/account/account_detail");
    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require("i18n!nls/commons");
    var apiBaseUrl = GO.contextRoot + 'ad/api/';
    var orgMemberTpl = require("hgn!admin/templates/org_member");
    var modifyClassPopupTmpl = require("hgn!admin/templates/_modify_class_popup");
    var PositionCollection = require("admin/collections/position_list");
    var GradeCollection = require("admin/collections/grade_list");
    var DutyCollection = require("admin/collections/duty_list");
    var UserGroupCollection = require("admin/collections/usergroup_list");
    var MailGroupCollection = require("admin/collections/mailgroup_list");
    var ActiveScroll = require('components/active-scroll/active-scroll');

    var lang = {
        "직위 변경": adminLang["직위 변경"],
        "직급 변경": adminLang["직급 변경"],
        "직책 변경": adminLang["직책 변경"],
        "사용자그룹 변경": adminLang["사용자그룹 변경"],
        '메일그룹 변경': adminLang["메일그룹 변경"],
        "계정상태 변경": adminLang["계정상태 변경"],
        "부서장 위임": adminLang["부서장 위임"],
        "부부서장 위임": adminLang["부부서장 위임"],
        "부서원 위임": adminLang["부서원 위임"],
        "부서 이동": adminLang["부서 이동"],
        "신규 부서원 생성": adminLang['신규 부서원 생성'],
        "소속된 부서원이 없습니다.": adminLang['소속된 부서원이 없습니다.'],
        "dept_member_empty": adminLang['등록된 부서원이 없습니다.'],
        "부서 해제": adminLang["부서 해제"],
        "멤버 삭제": adminLang["멤버 삭제"],
        "reorder_save": adminLang['순서바꾸기 완료'],
        "자동정렬": adminLang["자동정렬"],
        "자동정렬 툴팁": adminLang["자동정렬 툴팁"],
        "순서바꾸기": commonLang["순서바꾸기"],
        "기본정보": adminLang["기본정보"],
        "메일그룹": adminLang["메일그룹"],
        "전자결재": adminLang["전자결재"],
        "부가 기능": adminLang["부가 기능"],
        "부가정보": adminLang["부가정보"],
        "저장": commonLang["저장"],
        "취소": commonLang["취소"]
    };

    var OrgList = Backbone.View.extend({
        events: {
            'click li.member': 'clickMember',
            'click #positionCtr': 'toggleSubPosition',
            'click #managerCtr': 'toggleSubManager',
            'click #deptCtr': 'toggleSubDept',
            'click #deleteDeptMembers': 'deleteDeptMembers',
            'click #deleteMembers': 'deleteMembers',
            'click .moveDeptMembers': 'moveDeptMembers',
            'click .changePosition': 'modifyPosition',
            'click .setManager': 'setManager',
            'click #allCheck': 'toggleAllCheck',
            'click input[type=checkbox]': 'clickCheckbox',
            'click span#btnReorderDeptMembers': 'reorderDeptMembers',
            'click input#autoOrder': 'changeAutoOrder',
            'click #deptMemberContent #save': 'save',
            'click #deptMemberContent #cancel': 'cancel',
            'click #createMember' : 'createMember'
        },

        initialize: function () {
            this.positions = PositionCollection.getCollection();
            this.grades = GradeCollection.getCollection();
            this.userGroups = UserGroupCollection.getCollection();
            this.mailGroups = MailGroupCollection.getCollection();
            this.duties = DutyCollection.getCollection();
        },
        render: function () {
            this.$el.html(Tpl({
                lang: lang
            }));
            this.initScrollBar();
        },
        initScrollBar: function () {
            new SimpleBar($('#deptMemberDiv')[0]);
        },
        clickMember: function (e) {
            var target = $(e.currentTarget);
            var userId = target.data('userid');
            this.onPreparedMemberListRendering();
            this.onCompletedMembersRendering();
            this.renderMember(userId);
        },
        clickCheckbox: function (e) {
            e.stopPropagation();
        },
        renderMember: function (userId) { // 멤버 상세
            if (this.activeScroll) {
                this.activeScroll.unbind();
            }
            var self = this;
            if (userId) {
                this.accountDetailView = new AccountDetailView({"userId": userId});
            }
            this.userId = userId;
            this.membersRendered.promise().done(function () {
                self.$el.find("li.member").removeClass("active");
                var userLiEl = self.$el.find("li.member[data-userid=" + userId + "]");
                if (!userId || userLiEl.length == 0) {
                    userLiEl = self.$el.find('li.member').first();
                    if (userLiEl.length > 0) {
                        userLiEl.trigger("click");
                        return;
                    }
                }
                if (userLiEl.length > 0) {
                    userLiEl.addClass("active");
                    self.$el.find("#accountDetail").html(self.accountDetailView.$el);
                    self.accountDetailView.render();
                    self.accountDetailView.removeSaveCancelBtn();
                    self.$el.find("#deptMemberInfo div.tab_menu_wrap").show();
                    self.$el.find(".page_action").show();
                }
                self.setScrollEvent(self.$el.find("#accountDetail"));
            });
        },
        setScrollEvent: function (view) {
            var contentIdMenuIdSet = {
                "baseInfo": "mainInfo",
                "mail_config": "mailInfo",
                "apprContainer": "apprInfo",
                "divEmailEtcConfig": "etcFeatureInfo",
                "divMoreInfo": "moreInfo"
            };
            this.activeScroll = new ActiveScroll({
                scrollEl: view,
                activeClass: "active",
                menuArray: contentIdMenuIdSet,
                first: "baseInfo",
                last: "divMoreInfo"
            });
            this.activeScroll.bind();
        },
        changeAutoOrder: function (e) {
            var isAutoOrder = $(e.currentTarget).prop("checked");
            this.$el.find("#btnReorderDeptMembers").toggle();
            var sortOrderIds = $(this.listEl.find('li')).map(function (k, v) {
                return $(v).data('id');
            }).get();
            if (isAutoOrder) {
                this.deptSortOrderChange();
            } else {
                this.saveOrders(sortOrderIds);
            }
        },
        save: function () {
            var depts = $("#dept_members").find("input[name='deptId']");
            this.accountDetailView.save($.proxy(function () {
                this.$el.trigger('orgChanged');
                this._refreshAll(this.userId);
                this.refreshAddedDeptNode(depts, this.deptId);
            }, this));
        },
        cancel: function () {
            this.renderMember(this.userId);
        },
        createMember:function(){
           $('#createNewMember').trigger('click');
        },
        refreshAddedDeptNode: function (depts, deptId) {
            var self = this;
            if (deptId !== -1 && depts.size() === 0) {
                var deptNode = this.getNodeFromDepId(-1);
                if (deptNode.length > 0) {
                    $("#orgMemTree").jstree('refresh', deptNode);
                }
                return;
            }
            _.each(depts, function (input) {
                if ($(input).val() !== this.deptId) {
                    var deptNode = self.getNodeFromDepId($(input).val());
                    if (deptNode.length > 0) {
                        $("#orgMemTree").jstree('refresh', deptNode);
                    }
                }
            })
        },
        /*해당 유저의 tree와, 해당 멤버리스트, 멤버정보를 refresh 하는 액션.*/
        _refreshAll: function (userId) {
            if (this.deptId) {
                this.onPreparedMemberListRendering();
                this.loadDeptMembers(this.deptId);
                if (this.getNodeFromDepId(this.deptId).length > 0) {
                    $('#orgMemTree').jstree('refresh', this.getNodeFromDepId(this.deptId));
                }
                GO.EventEmitter.trigger("admin", "refreshHeader", this.deptId);
            }
            if (userId) {
                this.renderMember(userId);
            }
        },

        /*부서원 목록을 render 하는 함수.*/
        renderDeptMemberList: function (deptId) {
            this.deptId = deptId; //필수
            if (this.deptId) {
                this.onPreparedMemberListRendering();
                this.loadDeptMembers(this.deptId);
            }

            this.renderMember(this.userId);

        },

        offReorderMode: function () {
            if (this.$el.find("#deptMemberContent").hasClass('ui-sortable')) {
                this.$el.find("#deptMemberContent").sortable("destroy");
            }
            this.$el.find("#btnReorderDeptMembers").removeClass('on btn_list_change');
            this.$el.find("#btnReorderDeptMembers span.txt").text(adminLang['순서바꾸기']);
            this.$el.find('#memberControlBtn').show();
            this.$el.find('.orderArea').show();
            //버튼 show
            this.$el.find("#deptMemberInfo").show();
            this.$el.find('input[type=checkbox]').attr({disabled: false});
        },
        reorderDeptMembers: function (e) {
            e.stopPropagation();
            var self = this,
                isSave = $(e.currentTarget).hasClass('on'),
                btnMemControlGroup = this.$el.find('#memberControlBtn');

            if (isSave) {
                var sortOrderIds = $(this.listEl.find('li')).map(function (k, v) {
                    return $(v).data('id');
                }).get();
                this.saveOrders(sortOrderIds);
                this.offReorderMode();

            } else {
                if (!this.listEl || !this.listEl.find('ul li')) {
                    $.goMessage(lang['dept_member_empty']);
                    return false;
                }

                this.listEl.find("li.active").removeClass("active");
                btnMemControlGroup.hide();
                self.$el.find("#deptMemberInfo").hide();

                $(e.currentTarget).addClass('on btn_list_change');
                $(e.currentTarget).find('span.txt').text(lang['reorder_save']);
                this.$el.find('.orderArea').hide();

                this.$el.find("#deptMemberContent").sortable({
                    opacity: '1',
                    delay: 100,
                    cursor: "move",
                    items: "li",
                    containment: '#deptMemberContent',
                    hoverClass: "ui-state-hover",
                    placeholder: 'ui-sortable-placeholder',
                    start: function (event, ui) {
                        ui.helper.addClass("ui-sortable-drag");
                    },
                    stop: function (event, ui) {
                        ui.item.removeClass('ui-sortable-drag');
                    }
                });

            }
            this.$el.find('input[type=checkbox]').attr({
                checked: false,
                disabled: !isSave
            });
        },
        changeOrder: function (autoOrder) {
            this.$el.find('#autoOrder').attr("checked", autoOrder);
            this.$el.find('#btnReorderDeptMembers').toggle(!autoOrder);
        },
        saveOrders: function (sortOrderIds) {
            var self = this;
            $.go(apiBaseUrl + '/department/' + this.deptId + '/member/sortorder', JSON.stringify({ids: sortOrderIds}), {
                async: false,
                qryType: 'PUT',
                contentType: 'application/json',
                responseFn: function (rs) {
                    $.goMessage(commonLang["변경되었습니다."]);
                    if (self.deptId) {
                        $('#orgMemTree').jstree('refresh', self.getNodeFromDepId(self.deptId));
                    }
                },
                error: function () {
                    self.loadDeptMembers(self.deptId);
                }
            });
        },
        deptSortOrderChange: function () {
            var self = this;
            var deptId = this.deptId;
            var sortOrder = this.$el.find("#autoOrder").prop("checked");

            var url = [apiBaseUrl + 'department', deptId, sortOrder];
            $.go(url.join('/'), {}, {
                qryType: 'PUT',
                contentType: 'application/json',
                responseFn: function (rs) {
                    if (rs.code == 200) {
                        self.loadDeptMembers(rs.data.id);
                        $('#orgMemTree').jstree('refresh', self.getNodeFromDepId(rs.data.id));
                    }
                },
                error: function (error) {
                    var result = JSON.parse(error.responseText);
                    if (result && result.message) {
                        $.goMessage(result.message);
                        return;
                    }
                    $.goMessage(commonLang["저장에 실패 하였습니다."]);
                }
            });
        },
        onPreparedMemberListRendering: function () {
            this.membersRendered = $.Deferred();
        },
        onCompletedMembersRendering: function () {
            this.membersRendered.resolve();
        },
        // 부서원 목록(만) 호출
        loadDeptMembers: function (deptId) {
            var self = this;
            self.deptId = deptId;
            self.listEl = $(this.el).find("#deptMembers");
            this.$el.find("#accountDetail").empty();
            this.$el.find(".tab_menu_wrap").hide();
            this.$el.find(".page_action").hide();
            var url = apiBaseUrl + 'department/' + (deptId === -1 ? 'unspecified' : deptId) + '/members';
            $.go(url, "", {
                qryType: 'GET',
                responseFn: function (response) {
                    self.listEl.empty();
                    self.offReorderMode();
                    if(response.data.length > 0){
                        self.$el.find('.notNullData').show();
                        self.$el.find('.nullData').hide();
                        self.$el.find('#deptMemberContent').removeClass("null_data");
                        _.each(response.data, function (data) {
                            self.listEl.append(Hogan.compile(orgMemberTpl(data)).render());
                        });
                    }else{
                        self.$el.find('.notNullData').hide();
                        self.$el.find('.nullData').show();
                        self.$el.find('#deptMemberContent').addClass("null_data");
                        if(self.deptId == -1){
                            self.$el.find("#noMembers").text(adminLang["부서 미지정 멤버가 없습니다."]);
                            self.$el.find("#createMember span.txt").text(adminLang['신규 멤버 생성']);
                        }else{
                            self.$el.find("#noMembers").text(adminLang["소속된 부서원이 없습니다."]);
                            self.$el.find("#createMember span.txt").text(adminLang['신규 부서원 생성']);
                        }
                    }
                    self.onCompletedMembersRendering();
                },
            });
        },
        toggleSubPosition: function () {
            if (!this.subPositionBackdropView) {
                this.subPositionBackdropView = this._bindBackdrop(this.$el.find("#subPositionMenu"), this.$el.find("#positionCtr"));
            }
        },
        toggleSubManager: function () {
            if (!this.subManagerBackdropView) {
                this.subManagerBackdropView = this._bindBackdrop(this.$el.find("#subManagerMenu"), this.$el.find("#managerCtr"));
            }
        },
        toggleSubDept: function () {
            if (!this.subDeptBackdropView) {
                this.subDeptBackdropView = this._bindBackdrop(this.$el.find("#subDeptMenu"), this.$el.find("#deptCtr"));
            }
        },
        toggleAllCheck: function (e) {
            if ($(e.currentTarget).is(':checked')) {
                this.$el.find('li input:checkbox').attr('checked', true);
            } else {
                this.$el.find('li input:checkbox').attr('checked', false);
            }
        },
        deleteDeptMembers: function () {
            var self = this,
                checkedIds = this.getCheckedDeptMemberIds();
            if (this.checkValidation(checkedIds)) {
                $.goPopup({
                    pclass: "layer_confim",
                    width: 500,
                    contents: adminLang["부서 해제 설명"],
                    buttons: [{
                        btext: commonLang["확인"],
                        btype: "confirm",
                        autoclose: true,
                        callback: function () {
                            $.go(apiBaseUrl + 'deptmember', JSON.stringify({ids: checkedIds}), {
                                qryType: 'DELETE',
                                contentType: 'application/json',
                                responseFn: function () {
                                    if (self.deptId) {
                                        $('#orgMemTree').jstree('refresh', self.getNodeFromDepId(self.deptId));
                                        $(".tab_menu li [data-type='member_list']").trigger('click');
                                        $('#orgMemTree').jstree('refresh', self.getNodeFromDepId(-1));
                                    }
                                }
                            });
                            self.$el.find("#allCheck").prop("checked", false);
                        }
                    }, {
                        btext: commonLang["취소"],
                        btype: "normal",
                    }]
                });
                if (this.subDeptBackdropView) {
                    this.subDeptBackdropView.toggle(false);
                    this.subDeptBackdropView.unBindBackdrop();
                    this.subDeptBackdropView = null;
                }
            }
        },
        moveDeptMembers: function (e) {
            var self = this;
            this.checkedIds = this.getCheckedDeptMemberIds();
            if (this.checkValidation(this.checkedIds)) {
                $.goOrgSlide({
                    header: self.deptId && self.deptId == -1 ? adminLang["부서 지정"] : adminLang["부서 이동"],
                    isAdmin: true,
                    type: 'department',
                    externalLang: commonLang,
                    contextRoot: GO.contextRoot,
                    desc: adminLang["추가하려는 부서를 선택하신 후 확인 버튼을 클릭하세요."],
                    target: e,
                    zIndex: 200,
                    buttons: [{
                        btext: commonLang["확인"],
                        bclass: 'btn_major_s',
                        autoClose: true,
                        callback: $.proxy(this._moveDeptMembers, self)
                    }]
                });

            }
        },
        checkValidation: function (checkedIds) {
            if (checkedIds.length > 0) {
                return true;
            } else {
                var msg = adminLang['멤버 선택 알림'];
                if (this.listEl.find('li').length === 0) msg = adminLang['등록된 부서원이 없습니다.'];
                $.goMessage(msg);
                return false;
            }
        },
        _moveDeptMembers: function (obj) {
            var self = this;
            var url = apiBaseUrl + 'deptmembers/' + obj.id + '/move';
            var param = {ids: this.checkedIds};
            var qryType = 'PUT';
            if (this.checkValidation(this.checkedIds)) {
                if (self.deptId === -1) {
                    url = apiBaseUrl + 'department/' + obj.id + '/members';
                    param = {ids: this.getCheckedUserIds()};
                    qryType = 'POST';
                }
                $.go(url, JSON.stringify(param), {
                    qryType: qryType,
                    contentType: 'application/json',
                    responseFn: function (rs) {
                        if (rs.code === "200") {
                            GO.EventEmitter.on("admin", "refreshFinish", function () {
                                this._refreshAll(this.userId);
                                GO.EventEmitter.off("admin", "refreshFinish");
                            }, self);
                            if (self.getNodeFromDepId(obj.id).length > 0) {
                                $('#orgMemTree').jstree('refresh', self.getNodeFromDepId(obj.id));
                            } else {
                                GO.EventEmitter.trigger("admin", "refreshFinish");
                            }
                            self.$el.find("#allCheck").prop("checked", false);
                            $.goMessage(adminLang["해당 멤버의 부서가 변경되었습니다."]);
                        }
                    },
                    error: function (error) {
                        $.goAlert(adminLang["이동에 실패하였습니다."]);
                    }
                });
            }
        },
        modifyPosition: function (e) {
            var self = this;
            var checkedEls = this.getCheckedUserIds();
            var classType = $(e.currentTarget).data('type');
            var type = {
                select_user: adminLang["선택된 사용자"],
                about_target_person: adminLang["명에 대해서"],
                modify_position: adminLang["직위 변경"],
                modify_grade: adminLang["직급 변경"],
                modify_duty: adminLang["직책 변경"],
                modify_mail_group: adminLang["메일그룹 변경"],
                modify_status: adminLang["계정상태"] + " " + commonLang["변경"],
                modify_user_group: adminLang["사용자그룹 변경"],
                change: commonLang["변경"],
                dont_change_status: adminLang["상태 변경이 불가능합니다. 라이선스 계정수를 확인하세요."],
                add_user_group: adminLang["선택한 클래스를 추가함"],
                change_user_group: adminLang["선택한 클래스로 바꾸기"]
            };
            if (this.checkValidation(checkedEls)) {
                this.popupEl = $.goPopup({
                    header: adminLang["멤버 정보 수정"],
                    width: 400,
                    title: "",
                    modal: true,
                    contents: modifyClassPopupTmpl({
                        selectCount: checkedEls.length,
                        type: type,
                        positions: this.positions.toJSON(),
                        isOrg: true
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
            }
        },
        changePositionSelect: function (classType) {
            var typeValues = [],
                typeValuesTmpl = "",
                selectEl = $(this.popupEl).find("select.class_type_values");
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
            } else if (classType === "duty") {
                var duties = this.duties.toJSON();
                for (var i = 0; i < duties.length; i++) {
                    typeValues.push({
                        id: duties[i].id,
                        name: duties[i].name
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
            var self = this;
            var url = "";
            var classType = this.popupEl.find(".class_type").val();
            var memberIds = this.getCheckedDeptMemberIds();
            var options = {
                ids: this.getCheckedUserIds()
            };
            if (this.checkValidation(options.ids)) {
                if (classType === "position") {
                    url = apiBaseUrl + "user/position";
                    options.id = this.popupEl.find(".class_type_values").val();
                } else if (classType === "grade") {
                    url = apiBaseUrl + "user/grade";
                    options.id = this.popupEl.find(".class_type_values").val();
                } else if (classType === "duty") {
                    url = apiBaseUrl + "deptmembers/duty/" + this.popupEl.find(".class_type_values").val();
                    options.ids = memberIds;
                } else if (classType === "status") {
                    url = apiBaseUrl + "user/status";
                    options.id = this.popupEl.find(".class_type_values").val();
                    $('#account_error_message').hide(); //todo 상태 개수 validation
                } else if (classType === "mail_group") {
                    url = apiBaseUrl + "user/mailgroup";
                    options.stringId = this.popupEl.find(".class_type_values").val();
                } else if (classType === "user_group") {
                    var userGroupChgOption = $('input:radio[name="userGroup"]:checked').val();
                    if (userGroupChgOption === "change") {
                        url = apiBaseUrl + "user/usergroup/change";
                    } else {
                        url = apiBaseUrl + "user/usergroup/add";
                    }
                    options.id = this.popupEl.find(".class_type_values").val();
                }
                this.popupEl.close();
                $.go(url, JSON.stringify(options), {
                    qryType: 'PUT',
                    contentType: 'application/json',
                    responseFn: function (response) {
                        $.goMessage(commonLang["변경되었습니다."]);
                        self._refreshAll(self.userId);
                        self.$el.find("#allCheck").prop("checked", false);
                    },
                    error: function (error) {
                        var result = JSON.parse(error.responseText);
                        if (result && result.message) {
                            $.goMessage(result.message);
                            return;
                        }
                        $.goMessage(commonLang["저장에 실패 하였습니다."]);
                    }
                });
            }
        },

        deleteMembers: function (e) {
            var self = this;
            this.checkedIds = this.getCheckedUserIds();
            if (this.checkValidation(this.checkedIds)) {
                $.goPopup({
                    width: 500,
                    modal: true,
                    title: adminLang["선택 멤버를 삭제하시겠습니까"],
                    contents: '<span class="txt_caution">' + adminLang["멤버 삭제 시 자료 복구 불가 경고"] + '</span>'
                    + '<br>' + adminLang["멤버 부서 해제 가이드"],
                    buttons: [{
                        btext: commonLang["삭제"],
                        btype: 'caution',
                        autoclose: true,
                        callback: function () {
                            var url = apiBaseUrl + "user";
                            $.go(url, JSON.stringify({ids: self.checkedIds}), {
                                qryType: 'DELETE',
                                contentType: 'application/json',
                                responseFn: function (response) {
                                    $.goMessage(adminLang["멤버가 삭제되었습니다."]);
                                    $('#orgMemTree').jstree('refresh', self.getNodeFromDepId(self.deptId));
                                    $(".tab_menu li [data-type='member_list']").trigger('click');
                                    self.$el.find("#allCheck").prop("checked", false);
                                },
                                error: function (error) {
                                    var result = JSON.parse(error.responseText);
                                    if (result.name === "admin.delete.error") {
                                        $.goAlert(adminLang["관리자 삭제 오류"]);
                                        return;
                                    }
                                    $.goAlert(adminLang["멤버 삭제 오류"]);
                                }
                            });
                        }
                    }, {
                        btext: commonLang["취소"]
                    }]
                });

                if (this.subDeptBackdropView) {
                    this.subDeptBackdropView.toggle(false);
                    this.subDeptBackdropView.unBindBackdrop();
                    this.subDeptBackdropView = null;
                }
            }
        },
        setManager: function (e) {
            var self = this;
            var type = $(e.currentTarget).data('type');
            this.checkedIds = this.getCheckedDeptMemberIds();
            if (type == "MASTER" && this.checkedIds.length > 1) {
                return $.goMessage(adminLang["부서장 위임은 1명만 가능합니다."]);
            }
            if (this.checkValidation(this.checkedIds)) {
                var url = apiBaseUrl + 'deptmembers/type/' + type;
                $.go(url, JSON.stringify({ids: this.checkedIds}), {
                    qryType: 'PUT',
                    contentType: 'application/json',
                    responseFn: function (rs) {
                        if (rs.code === "200") {
                            self._refreshAll(self.userId);
                            self.$el.find("#allCheck").prop("checked", false);
                            $.goMessage(commonLang['저장되었습니다.']);
                        }
                    },
                    error: function (error) {
                        var result = JSON.parse(error.responseText);
                        if (result && result.message) {
                            $.goMessage(result.message);
                            return;
                        }
                        $.goMessage(commonLang["저장에 실패 하였습니다."]);
                    }
                });
                if (this.subManagerBackdropView) {
                    this.subManagerBackdropView.toggle(false);
                    this.subManagerBackdropView.unBindBackdrop();
                    this.subManagerBackdropView = null;
                }
            }

            return false;
        },

        getCheckedDeptMemberIds: function () {
            return this.listEl.find("input[type=checkbox]:checked").map(function (k, v) {
                return Number($(v).closest('li').attr('data-id'));
            }).get();
        },
        getCheckedUserIds: function () {
            return this.listEl.find("input[type=checkbox]:checked").map(function (k, v) {
                return Number($(v).closest('li').attr('data-userid'));
            }).get();
        },
        getNodeFromMemId: function (id) {
            return $("#orgMemTree li[nodeid=" + id + "][rel!='org'][rel!='unspecified']");
        },
        getNodeFromDepId: function (id) {
            return $("#orgMemTree li[nodeid=" + id + "][rel!='MODERATOR'][rel!='MEMBER'][rel!='MASTER']");
        },
        _bindBackdrop: function ($el, $link) {
            var backdropView = new BackdropView();
            backdropView.backdropToggleEl = $el;
            backdropView.linkBackdrop($link);
            return backdropView;
        },
    });


    return OrgList;

});
