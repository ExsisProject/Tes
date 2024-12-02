define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");
    var GroupManageTpl = require("hgn!contact/templates/group_manage");
    var ModifyGroupModel = require("contact/models/modify_group");
    var PersonalGroupCollection = require("contact/collections/personal_group");
    var DeptGroupCollection = require("contact/collections/dept_group");
    var CommonLang = require("i18n!nls/commons");
    var ContactLang = require("i18n!contact/nls/contact");
    require("jquery.go-popup");
    require("jquery.go-validation");

    var lang = {
        'USER': ContactLang['개인 주소록'],
        'COMPANY': ContactLang['전사 주소록'],
        'DEPARTMENT': ContactLang["부서 주소록"],
        'contact_group': ContactLang['주소록 그룹'],
        'group_add': ContactLang['연락처 그룹 추가'],
        'contact_add': ContactLang['연락처 주소록 추가'],
        'contact_all': ContactLang['전체 주소록'],
        'contact_manage': ContactLang['주소록 관리'],
        'group_manage': ContactLang['그룹관리'],
        'fold': CommonLang['접기'],
        'open': CommonLang["펼치기"],
        'new_contact': ContactLang['새 연락처'],
        'contact': ContactLang['주소록'],
        'delete_contact': ContactLang["주소록 삭제"],
        '하위그룹 삭제 오류' : ContactLang['하위 그룹이 있으면 삭제할 수 없습니다']
    };


    var popupLang = {
        'group_select': ContactLang['그룹선택'],
        '새 이름': ContactLang['새 이름'],
        'save': CommonLang['저장'],
        'cancel': CommonLang['취소'],
        'groupname': ContactLang['연락처 그룹 이름'],
        "주소록 이름": ContactLang["주소록 이름"]
    };

    // USER, DEPARTMENT
    var ManageView = Backbone.View.extend({

        isUser : function(){return this.type == "USER"},
        isDept : function(){return this.type == "DEPARTMENT"},
        isCompany : function(){return this.type == "COMPANY"},

        initialize: function (options) {
            this.type = options.type;
            this.model = new ModifyGroupModel(this.type);
            this.id = options.id;

            if (this.isUser()) {
                this.groups = PersonalGroupCollection.getCollection().toJSON() || [];
            } else if (this.isDept()) {
                var deptId = this.options.deptId;
                this.groups = DeptGroupCollection.get(deptId).toJSON();
            }else{
                this.name = options.name;
                this.hasChildren = options.hasChildren
            }
        },

        render: function () {
            if (!this.isCompany() && !this.groups.length) {
                $.goMessage(ContactLang['등록된 그룹이 없습니다']);
                return;
            }

            var popupTpl = "";

            if(this.isCompany()){
                popupTpl = makeCompanyTpl(this.name);
            }else{
                popupTpl = makeUserAndDeptTpl.call(this, this.id, this.groups);
            }

            var popup = $.goPopup({
                header: ContactLang["그룹관리"],
                contents: popupTpl,
                pclass: 'layer_addr_mgmt layer_normal',
                buttons: [
                    {
                        autoclose: false,
                        btype: 'confirm',
                        btext: ContactLang["그룹이름 변경"],
                        callback: $.proxy(modifyGroupName, this)
                    },
                    {
                        btype: 'caution',
                        btext: ContactLang["그룹삭제"],
                        callback: $.proxy(deleteGroup, this)
                    },
                    {
                        btype: 'normal',
                        btext: CommonLang["취소"],
                        callback: function () {
                            popup.close();
                        }
                    }
                ]
            });

            var model = this.model;

            function makeUserAndDeptTpl(id, groups){
                // TODO : 다른방식을 찾아보자. manger 에서 해당 부분에 대해서 알아야 할까?
                return GroupManageTpl({
                    isCurrentGroup: function () {
                        return id == this.id ? true : false;
                    },
                    data: groups,
                    lang: popupLang,
                    isCompanyType : this.isCompany()
                });
            };


            function makeCompanyTpl(name){
                return GroupManageTpl({
                    name : name,
                    lang : popupLang,
                    isCompanyType : true
                });
            };

            function modifyGroupName() {
                var groupId = getGroupId.call(this);;
                var newName = $('input.txt_mini').val();

                if (!$.goValidation.isCheckLength(2, 16, newName)) {
                    invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {
                        "arg1": "2",
                        "arg2": "16"
                    }), $('input.txt_mini'));
                    return false;
                }

                model.save({'id': groupId, "name": newName})
                    .done(function () {
                        GO.EventEmitter.trigger('contact', 'changed:sideGroups');
                        $.goMessage(CommonLang['수정되었습니다.']);
                        popup.close();
                    })
                    .fail(function (response) {
                        var result = JSON.parse(response.responseText);
                        $.goAlert(result.message);
                    });
            }

            function getGroupId(){
                if(this.isCompany()){
                    return this.id;
                }else{
                    return popup.find('select[name=groupName] option:selected').val();
                }

            }

            function deleteGroup() {
                if(this.isCompany() && this.hasChildren){
                    $.goError(lang["하위그룹 삭제 오류"]);
                    return;
                }


                var groupId = getGroupId.call(this);
                $.goCaution(lang['delete_contact'], CommonLang["삭제하시겠습니까?"], confirm);

                function confirm() {
                    model.set({
                        'id': groupId,
                    }, {silent: true});

                    model.destroy()
                        .done(function (response) {
                            if (response.code == '200') {
                                GO.EventEmitter.trigger('contact', 'changed:sideGroups');
                                $.goMessage(CommonLang['삭제되었습니다.']);
                                popup.close();
                                App.router.navigate('contact', {trigger: true, pushState: true});
                            }
                        })
                        .fail(function (response) {

                        });
                }
            }
        }
    });

    function invalidAction(msg, focusEl) {
        $.goMessage(msg);
        if (focusEl) focusEl.focus();
        return false;
    };

    return ManageView;
});
