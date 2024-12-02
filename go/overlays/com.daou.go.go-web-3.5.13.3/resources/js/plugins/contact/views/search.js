;define(function (require) {
    var App = require("app");
    var TplContactHome = require("hgn!contact/templates/search");
    var TplGroupModify = require("hgn!contact/templates/group_modify");
    var TplSearchNull = require("hgn!contact/templates/search_null");
    var ContactSearchTitleView = require("contact/views/search_title");
    var PersonalGroupCollection = require("contact/collections/personal_group");
    var DeptGroupCollection = require("contact/collections/dept_group");
    var CompanyGroupInfoModel = require("contact/models/company_group_info");
    var GroupAddModel = require("contact/models/group_add");
    var DeleteContactModel = require("contact/models/delete_contact");
    var ContactListFieldModel = require("contact/models/contact_list_field");
    var CommonLang = require("i18n!nls/commons");
    var ContactLang = require("i18n!contact/nls/contact");
    var UserLang = require("i18n!nls/user");
    require("jquery.go-grid");
    require("jquery.go-popup");
    require("jquery.go-validation");

    var contactFieldData = null;
    var lang = {
        'new_contact_desc': ContactLang['새로운 연락처를 등록하세요록'],
        'search_null': ContactLang['검색어와 일치하는 연락처가 없습니다'],
        'new_contact': ContactLang['새 주소 등록하기'],
        'all_contact': ContactLang['전체 주소록'],
        'total': CommonLang['전체'],
        'name': CommonLang['이름'],
        'email': UserLang['이메일'],
        'mobileno': UserLang['휴대폰'],
        'companyname': UserLang['회사'],
        'tel': CommonLang['전화번호'],
        'personal': ContactLang['개인 주소록'],
        'company': ContactLang['전사 주소록'],
        'dept': ContactLang['부서 주소록'],
        'all': CommonLang['전체'],
        'searchresult': CommonLang['검색결과'],
        'searchword': CommonLang['검색어'],
        'contacttype': ContactLang['주소록 구분'],
        'delete': CommonLang['삭제'],
        'mail': ContactLang['메일발송'],
        'addgroup': ContactLang['그룹지정'],
        'hurigana': ContactLang['후리가나'],
        'company_tel': ContactLang['회사전화'],
        'group': ContactLang['그룹'],
        'department': ContactLang["부서"],
        'position': ContactLang["직위"],
        'company_address': ContactLang["회사주소"],
        'memo': CommonLang["메모"],
    };

    var ContactSearchView = Backbone.View.extend({
        el: '#content',
        listEl: null,
        manage: false,

        isUser: function () {
            return this.type == "USER";
        },

        isCompany: function () {
            return this.type == "COMPANY";
        },

        isDept: function () {
            return this.type == "DEPARTMENT";
        },

        events: {
            "click .contact_detail": "contactDetail",
            "click #contactMail": "contactMail",
            "click #groupModify": "groupModify",
            "click #contactDelete": "contactDelete",
            "click .send_mail": "sendMail"
        },

        initialize: function () {
            this.$el.off();
            this.searchParams = App.router.getSearch();
            this.groupId = this.searchParams.groupId;
            this.deptId = this.searchParams.deptId;
            this.type = this.searchParams.ownerType.toUpperCase();

            this.$el.addClass('go_addr_list');

            this.contactFieldModel = new ContactListFieldModel({
                isGetFieldList: true
            });
        },

        render: function () {

            // TODO : 무슨의미로 쓴지 모르겠지만 기존 코드를 유지하기 위해 사용.
            var isOneItem = true;
            if (this.type) {
                isOneItem = false;
            }

            var self = this;
            this.contactFieldModel.fetch({
                dataType: "json",
                contentType: 'application/json',
                success: function (model) {

                    contactFieldData = model.getContactListFields();

                    var tmpl = TplContactHome({
                        lang: lang,
                        contextRoot: App.contextRoot,
                        isOneItem: isOneItem,
                        data: $.extend(self.searchParams, {
                            name: self.searchParams.name || lang['all'],
                            email: self.searchParams.email || lang['all'],
                            mobileNo: self.searchParams.mobileNo || lang['all'],
                            companyName: self.searchParams.companyName || lang['all'],
                            officeTel: self.searchParams.officeTel || lang['all']
                        }),
                        getContactType: function () {
                            if (self.isUser()) {
                                return lang.personal;
                            } else if (self.isCompany()) {
                                return lang.company;
                            } else {
                                return lang.dept;
                            }
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
                        }

                    });
                    self.$el.html(tmpl);
                    self.listEl = self.renderDataTables();

                    if (self.isCompany()) {
                        if (_.isUndefined(self.groupId)) {
                            $.ajax({
                                type: "GET",
                                async: false,
                                dataType: "json",
                                url: GO.contextRoot + "api/contact/checkadmin",
                                success: function (resp) {
                                    if (!resp.data) {
                                        $("#contactDelete").remove();
                                    }
                                }
                            });
                        } else {
                            self.groupInfo = CompanyGroupInfoModel.read({groupId: self.groupId}).toJSON();
                            if (self.groupInfo.updatable != true) {
                                $("#contactDelete").remove();
                            }
                        }
                        $("#groupModify").remove();
                    }
                    ContactSearchTitleView.render(self.type, self.groupId, self.deptId);
                    self._selectSideMenu();
                }
            });


        },

        contactDetail: function (e) {
            var contactId = $(e.currentTarget).attr('data-id');
            var routerOption = {
                trigger: true, pushState: true
            };

            var TYPE_URL_MAPPING = {
                "USER": makeUserUrl,
                "COMPANY": makeCompanyUrl,
                "DEPARTMENT": makeDeptUrl
            };

            var url = TYPE_URL_MAPPING[this.type].call(this);
            App.router.navigate(url, routerOption);

            function makeUserUrl() {
                if (this.groupId) {
                    return 'contact/personal/' + this.groupId + '/modify/' + contactId;
                } else {
                    return 'contact/' + contactId;
                }
            }

            function makeCompanyUrl() {
                var groupId = this.groupId;

                if (!groupId) {
                    _.each(this.collection, function (item) {
                        if (item.id == contactId) {
                            groupId = item.groups[0].id;
                        }
                    });
                }

                return 'contact/company/' + groupId + '/modify/' + contactId;
            }

            function makeDeptUrl() {
                if (this.groupId) {
                    return "contact/dept/" + this.deptId + "/group/" + this.groupId + "/modify/" + contactId;
                } else {
                    return "contact/dept/" + this.deptId + "/modify/" + contactId;
                }
            }
        },
        sendMail: function (e) {
            if (!GO.isAvailableApp('mail')) return;
            var email = $(e.currentTarget).text();
            var name = $(e.currentTarget).parents('tr').find('.contact_detail').text();
			var positionName =  $(e.currentTarget).data("position");
			var departmentName = $(e.currentTarget).data("department");
			positionName = (positionName && positionName != "undefined") ? '/' + positionName : "";
			departmentName = (departmentName && departmentName != "undefined") ? '/' + departmentName : "";
			
			var mailformat = name + positionName + departmentName;
            var param = {"to":"\""+mailformat+"\""+" <"+email+">"};
            window.open(GO.contextRoot + "app/mail/popup/process?data="+encodeURIComponent(JSON.stringify(param)),"popupRead"+Math.floor(Math.random()*1000000)+1,"scrollbars=yes,resizable=yes,width=1280,height=760");
        },

        // TODO : 사이드 클릭 효과는 side 에서 처리해야됨.
        _selectSideMenu: function () {
            var groupId = this.groupId;
            var side = $('#side');
            side.find('.on').removeClass('on');
            if (side.find('li[data-group-id="' + groupId + '"]').size() == 1) {
                side.find('li[data-group-id="' + groupId + '"]').children('p.title').addClass('on');
                return;
            }

            if (this.isUser()) {
                side.find("section[data-type='USER'] p.title:first").addClass('on');
                return;
            } else { // this.isDept()
                side.find("section[data-type='DEPARTMENT'] li[data-dept-id='" + this.deptId + "']").find("ul p.title:first").addClass('on');
                return;
            }
        },

        _reloadTables: function (e) {
            this.listEl.tables.fnClearTable();
        },

        renderDataTables: function () {
            var self = this,
                name = App.router.getSearch().name,
                email = App.router.getSearch().email,
                mobileNo = App.router.getSearch().mobileNo,
                companyName = App.router.getSearch().companyName,
                officeTel = App.router.getSearch().officeTel;

            var param = location.href.split('?')[1];

            var columns = [];

            // TODO : 동일한 일을 하는 메소드가 많다.. 별도의 메소드로 처리할 수 있을까??
            if (self._checkFieldShowing(contactFieldData, 'NAME')) {
                var maxWidth = GO.session().locale == 'ja' ? Math.round(this.$el.width() / 6 - 15) : Math.round(this.$el.width() / 5 - 10);
                columns.push({
                    mData: "nameInitialConsonant",
                    sWidth: maxWidth < 180 ? maxWidth : 180,
                    bSortable: true,
                    sClass: "align_l name",
                    fnRender: function (obj) {
                        if (name == undefined || obj.aData.name.toLowerCase().indexOf(name.toLowerCase()) == -1) {
                            return '<a><span class="name contact_detail" data-id="' + obj.aData.id + '">' + obj.aData.name + '</span></a>';
                        } else {
                            return '<a><span class="name contact_detail" data-id="' + obj.aData.id + '"><strong class="txt_key">' + obj.aData.name + '</strong></span></a>';
                        }
                    }
                });

                if (GO.session().locale == 'ja') {
                    columns.push({
                        mData: "nameHurigana",
                        sWidth: maxWidth < 150 ? maxWidth : 150,
                        bSortable: true,
                        sClass: "align_l name",
                        fnRender: function (obj) {
                            return '<a><span class="name">' + obj.aData.nameHurigana + '</strong></span></a>';
                        }
                    });
                }
            }

            if (self._checkFieldShowing(contactFieldData, 'POSITION')) {
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

            if (self._checkFieldShowing(contactFieldData, 'MOBILE')) {
                columns.push({
                    mData: "mobileNo",
                    sWidth: maxWidth < 150 ? maxWidth : 150,
                    bSortable: false,
                    sClass: "align_l hp",
                    fnRender: function (obj) {
                        if (mobileNo == undefined || obj.aData.mobileNo.indexOf(mobileNo) == -1) {
                            return '<span class="hp">' + obj.aData.mobileNo + '</span>';
                        } else {
                            return '<span class="hp"><strong class="txt_key">' + obj.aData.mobileNo + '</string></span>';
                        }
                    }
                });
            }

            if (self._checkFieldShowing(contactFieldData, 'EMAIL')) {
                columns.push({
                    mData: "email", bSortable: true, sClass: "align_l email", mRender: function (data) {
                        if (email == undefined || data.toLowerCase().indexOf(email.toLowerCase()) == -1) {
                            return '<a><span class="email send_mail">' + data + '</span></a>';
                        } else {
                            return '<a><span class="email send_mail"><strong class="txt_key">' + data + '</string></span></a>';
                        }
                    }
                });
            }

            if (self._checkFieldShowing(contactFieldData, 'DEPARTMENT')) {
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

            if (self._checkFieldShowing(contactFieldData, 'COMPANY')) {
                columns.push({
                    mData: "companyName",
                    sWidth: maxWidth < 170 ? maxWidth : 170,
                    bSortable: true,
                    sClass: "align_l company",
                    fnRender: function (obj) {
                        if (companyName == undefined || obj.aData.companyName.toLowerCase().indexOf(companyName.toLowerCase()) == -1) {
                            return '<span class="company">' + obj.aData.companyName + '</span>';
                        } else {
                            return '<span class="company"><strong class="txt_key">' + obj.aData.companyName + '</string></span>';
                        }
                    }
                });
            }

            if (self._checkFieldShowing(contactFieldData, 'COMPANY_PHONE')) {
                columns.push({
                    mData: null,
                    sWidth: maxWidth < 150 ? maxWidth : 150,
                    bSortable: false,
                    sClass: "align_l tel",
                    fnRender: function (obj) {
                        if (obj.aData.office != undefined) {
                            if (officeTel == undefined || obj.aData.office.tel.indexOf(officeTel) == -1) {
                                return '<span class="tel">' + obj.aData.office.tel + '</span>';
                            } else {
                                return '<span class="tel"><strong class="txt_key">' + obj.aData.office.tel + '</string></span>';
                            }
                        } else {
                            return "";
                        }
                    }
                });
            }

            if (self._checkFieldShowing(contactFieldData, 'COMPANY_ADDRESS')) {

                columns.push({
                    mData: null,
                    bSortable: false,
                    sClass: "align_l company_address",
                    fnRender: function (obj) {
                        if (obj.aData.office != undefined && obj.aData.office.basicAddress != undefined) {
                            return '<span class="basicAddress">' + obj.aData.office.basicAddress + '</span>';
                        } else {
                            return "";
                        }
                    }
                });
            }


            if (self._checkFieldShowing(contactFieldData, 'MEMO')) {
                columns.push({
                    mData: null,
                    bSortable: false,
                    sClass: "align_l memo",
                    fnRender: function (obj) {
                        if (obj.aData.description != undefined) {
                            return '<span class="description">' + obj.aData.description + '</span>';
                        } else {
                            return "";
                        }
                    }
                });
            }

            if (self._checkFieldShowing(contactFieldData, 'GROUP')) {
                columns.push({
                    mData: null,
                    sWidth: maxWidth < 150 ? maxWidth : 150,
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
                            return '<span class="group">' + groupName.join(',') + '</span>';
                        } else {
                            return "";
                        }
                    }
                });
            }

            var goGrid = $.goGrid({
                el: '#contacts',
                url: App.contextRoot + "api/contact/search?" + param,
                emptyMessage: TplSearchNull({
                    lang: lang,
                }),
                method: 'get',
                defaultSorting: [[1, "asc"]],
                checkbox: true,
                checkboxData: 'id',
                columns: columns,
                fnDrawCallback: function (tables, oSettings, listParams) {
                    self.$el.find("#contactCount").html(App.i18n(CommonLang['총건수'], "num", oSettings._iRecordsTotal));
                },
                fnServerSuccess: function (data) {
                    self.collection = data.data;
                }
            });

            this.renderToolbar();
            return goGrid;
        },

        renderToolbar: function () {
            this.$el.find('.tool_bar .custom_header').append(this.$el.find('#contactSearchTool').html());
            this.$el.find('#contacts tr td:first-child,#contacts tr th:first-child').addClass('checkbox');
        },

        contactMail: function (e) {
            var form = this.$el.find('form[name=formContacts]'),
                contactEl = form.find('tbody input[type="checkbox"]:checked');

            if (contactEl.size() == 0) {
                $.goMessage(ContactLang['선택된 주소록이 없습니다']);
                return;
            }

            var checkedData = this.listEl.tables.getCheckedData(),
            emailArr = [];
            emailArr = $(checkedData).map(function(k,v) {
                if(v.email) {
                    return "\""+v.name+"\""+" <"+v.email+">";
                }
            }).get();

            if (!emailArr.length) {
                $.goMessage(ContactLang['메일 주소가 없습니다.']);
            } else {
            	var param = {"to":emailArr.join(',')};
                window.open(GO.contextRoot + "app/mail/popup/process?data="+encodeURIComponent(JSON.stringify(param)),"popupRead"+Math.floor(Math.random()*1000000)+1,"scrollbars=yes,resizable=yes,width=1280,height=760");
            }
        },

        // TODO : groups 호출하는부분 수정
        groupModify: function (e) {
            var self = this,
                form = this.$el.find('form[name=formContacts]'),
                contactEl = form.find('tbody input[type="checkbox"]:checked');

            if (contactEl.size() == 0) {
                $.goMessage(ContactLang['선택된 주소록이 없습니다']);
                return;
            }


            var groups;

            if (this.isUser()) {
                groups = PersonalGroupCollection.getCollection().toJSON() || [];
            } else { // this.isDept()
                groups = DeptGroupCollection.get(this.deptId).toJSON() || [];
            }

            if (!groups.length) {
                $.goMessage(ContactLang['등록된 그룹이 없습니다']);
                return;
            }

            this.popupEl = $.goPopup({
                header: ContactLang["그룹지정"],
                modal: true,
                width: "240px",
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

        // TODO : 수정부분 확인
        saveGroups: function (groupIds) {
            var self = this;
            var ids = [],
                form = this.$el.find('form[name=formContacts]');

            $(form.serializeArray()).each(function (k, v) {
                if (v.name == 'id') {
                    ids.push(v.value);
                }
            });

            this.model = new GroupAddModel();
            this.model.set({
                "groupIds": groupIds,
                "contactIds": ids
            }, {silent: true});
            this.model.save({}, {
                type: 'PUT',
                success: function (model, response) {
                    if (response.code == '200') {
                        $.goMessage(CommonLang['수정되었습니다.']);
                        self._reloadTables();
                        self.popupEl.close();
                    }
                },
                error: function (model, response) {
                    var result = JSON.parse(response.responseText);
                    $.goMessage(result.message);
                }
            });


        },

        _checkFieldShowing: function (fieldList, showName) {
            var fieldChecked = false;
            _.each(fieldList, function (item) {
                if (showName == item.fieldCode) {
                    fieldChecked = item.checked;
                    return fieldChecked;
                }
            });
            return fieldChecked;

        },

        contactDelete: function (e) {
            var self = this;
            var ids = [];
            form = this.$el.find('form[name=formContacts]'),
                contactEl = form.find('tbody input[type="checkbox"]:checked');

            if (contactEl.size() == 0) {
                $.goMessage("선택된 주소록이 없습니다.");
                return;
            }

            $(form.serializeArray()).each(function (k, v) {
                if (v.name == 'id') {
                    ids.push(v.value);
                }
            });

            $.goCaution(ContactLang["선택하신 주소록을 삭제하시겠습니까"], App.i18n(ContactLang["총 0명 선택되었습니다"], "count", contactEl.size()), function () {
                this.model = new DeleteContactModel();
                this.model.set({
                    "ids": ids,
                }, {silent: true});
                this.model.save({}, {
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
            });
        }
    });

    return {
        render: function () {
            var instance = new ContactSearchView();
            return instance.render();
        }
    };
});