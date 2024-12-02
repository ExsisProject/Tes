define([
        "jquery",
        "backbone",
        "app",
        "hgn!admin/templates/department/dept_delete_list",
        "hgn!admin/templates/org_delete_list",
        "hgn!admin/templates/account_delete_list",
        "hgn!admin/templates/list_empty",
        "i18n!admin/nls/admin",
        "i18n!nls/commons",
        "jquery.go-grid",
        "GO.util"
    ],

    function (
        $,
        Backbone,
        App,
        deptDeleteListTmpl,
        BaseTmpl,
        accountDeleteListTmpl,
        emptyTmpl,
        adminLang,
        commonLang
    ) {

        var lang = {
            'search': commonLang['검색'],
            'count': adminLang['개'],
            'total_dept': adminLang['총 부서 수'],
            'total_attach': adminLang['총 사용량'],
            'dept_unit': adminLang['단위 부서'],
            'dept_name': adminLang['부서명'],
            'dept_manager': adminLang['부서장'],
            'dept_manager_name': adminLang['부서장 이름'],
            'dept_createat': adminLang['생성일'],
            'dept_deletedat': adminLang['삭제일'],
            'dept_deleted_admin': adminLang['삭제 관리자'],
            'list_to_csv': adminLang['목록 다운로드'],
            'delete_list_null': adminLang['삭제된 부서가 없습니다.'],
            'attach_size': adminLang['사용량(MB)'],
            'remove_attach': adminLang['첨부파일 삭제'],
            'no_select_dept': adminLang['부서를 선택해 주십시오.'],
            'remove_attach_success': adminLang["첨부파일이 삭제되었습니다."],
            'remove_attach_confirm': adminLang["부서 첨부파일 삭제 알림"],
            'complete_deletion': adminLang["완전 삭제"],
            'reset_dept': adminLang["복구"],
            'delete_dept_confirm': adminLang["선택한 부서를 완전 삭제하시겠습니까"],
            'delete_dept_comfirm_desc': adminLang["삭제한 부서 삭제 경고 메시지"],
            'delete_dept_success': commonLang["성공했습니다."],
            label_download: adminLang["목록 다운로드"],
            label_id: adminLang["번호"],
            label_name: commonLang["이름"],
            label_position: adminLang["직위"],
            label_email: commonLang["이메일"],
            label_deleteDate: adminLang["삭제일"],
            label_delete_admin: adminLang["삭제 관리자"],
            label_search: commonLang["검색"]
        };

        var deptDeleteList = Backbone.View.extend({

            events: {
                "click span#btn_down": "downAccountDeleteList",
                'keydown span.search_wrap input': 'searchKeyboardEvent',
                'click span.btn_search': 'search',
                'click span#btn_down_delete': 'downDeptDeleteList',
                'click span#btn_data_remove': 'removeDeptAttachData',
                'click span#btn_delete_dept': 'deleteDeletedDept',
                'click span#btn_reset_dept': 'resetDept',
                'click ul.tab_menu li': 'changeTab'
            },

            initialize: function () {
                var DeleteDeptAttachModel = Backbone.Model.extend({
                    url: GO.contextRoot + "ad/api/department/delete"
                });
                this.deleteDeptAttach = new DeleteDeptAttachModel();
            },

            render: function () {
                this.listEl = null;
                this.$el.html(BaseTmpl({
                    'lang': {
                        'deleted_dept': adminLang["삭제 부서"],
                        'deleted_member': adminLang["삭제 멤버"]
                    }
                }));
                this.renderDeptTmpl();

                return this;
            },

            changeTab: function (e) {
                var target = $(e.currentTarget);
                var type = target.find("span").data("type");

                target.parents("ul.tab_menu").find("li").removeClass("active");
                target.addClass("active");
                if (type === "dept") {
                    this.renderDeptTmpl();
                } else {
                    this.renderUserTpl();
                }

            },
            renderDeptTmpl: function () {
                this.$el.find("#tab_content").html(deptDeleteListTmpl({
                    'org_href': GO.contextRoot + 'admin/dept/org',
                    'lang': lang
                }));
                this.deleteDeptAttach.fetch({
                    async: true,
                    success: $.proxy(function () {
                        this._setTotalAttachSize();
                    }, this)
                });
                this.renderDeptDeleteList();
            },

            renderDeptDeleteList: function () {
                var self = this;
                this.listEl = $.goGrid({
                    el: this.$('#deleteDeptList'),
                    method: 'GET',
                    url: GO.contextRoot + 'ad/api/deletedepts',
                    emptyMessage: '<p class="data_null"><span class="ic_data_type ic_no_data"></span><span class="txt">' + lang['delete_list_null'] + '</span></p>',
                    defaultSorting: [[4, "desc"]],
                    sDomType: 'admin',
                    checkbox: true,
                    checkboxData: 'deptId',
                    displayLength: App.session('adminPageBase'),
                    columns: [
                        {
                            mData: "name", bSortable: true, fnRender: function (obj) {
                                return '<span data-id="' + obj.aData.deptId + '">' + obj.aData.name + '</span>';
                            }
                        },
                        {
                            mData: "attachSize", sClass: "align_c", sWidth: "120px", fnRender: function (obj) {
                                var attachSize = obj.aData.attachSize;
                                return GO.util.byteToMega(attachSize);
                            }, bSortable: false
                        },
                        {
                            mData: "createdAt",
                            sClass: "align_c",
                            bSortable: true,
                            sWidth: "120px",
                            fnRender: function (obj) {
                                if (obj.aData.createdAt == null || obj.aData.createdAt == '') {
                                    return "-";
                                }
                                return GO.util.shortDate(obj.aData.createdAt);
                            }
                        },
                        {
                            mData: "deletedAt",
                            sClass: "align_c",
                            bSortable: true,
                            sWidth: "120px",
                            fnRender: function (obj) {
                                if (obj.aData.deletedAt == null || obj.aData.deletedAt == '') {
                                    return "-";
                                }
                                return GO.util.shortDate(obj.aData.deletedAt);
                            }
                        },
                        {
                            mData: function (obj) {
                                if (!obj) return null;
                                var adminName = obj.deleteAdminName || "";
                                var returnData = adminName + ' ' + obj.deleteAdminPosition;
                                return returnData == " " ? "-" : returnData;
                            }, bSortable: false, sWidth: "130px", fnRender: function (obj) {
                            }
                        }
                    ],
                    fnDrawCallback: function (obj, oSettings) {
                        self.$el.find('.header_tb').remove();
                        self.$el.find('#deptTotalCount').html(oSettings._iRecordsTotal);
                        self.$el.find('tr>td:nth-child(2)').css('cursor', 'pointer').click(function (e) {
                            var targetEl = $(e.currentTarget).find('span'),
                                id = targetEl.attr('data-id');

                            App.router.navigate('dept/delete/' + id, {trigger: true});
                        });
                    }
                });
            },
            downDeptDeleteList: function () {
                var url = "ad/api/deletedepts/download?";
                var data = this.listEl.listParams;
                var properties = {
                    "property": data.property,
                    "direction": data.direction,
                    "searchtype": data.searchtype,
                    "keyword": data.keyword
                };
                GO.util.downloadCsvFile(url + GO.util.jsonToUrlParam(properties));
            },
            removeDeptAttachData: function () {
                var url = GO.contextRoot + "ad/api/department/delete/attach",
                    ids = this.listEl.tables.getCheckedIds(),
                    self = this;

                if (ids.length == 0) {
                    $.goMessage(lang.no_select_dept);
                    return;
                }

                $.goConfirm(lang.remove_attach, lang.remove_attach_confirm, function () {
                    $.ajax({
                        type: 'DELETE',
                        async: true,
                        dataType: 'json',
                        contentType: "application/json",
                        data: JSON.stringify({ids: self.listEl.tables.getCheckedIds()}),
                        url: url

                    }).done(function (response) {
                        $.goMessage(lang.remove_attach_success);
                        self.listEl.tables.reload();
                        self.$el.find("#checkedAll").attr("checked", null);
                    });

                });
            },

            deleteDeletedDept: function () {
                var url = GO.contextRoot + "ad/api/department/complate/delete",
                    ids = this.listEl.tables.getCheckedIds(),
                    self = this;

                if (ids.length == 0) {
                    $.goMessage(lang.no_select_dept);
                    return;
                }

                $.goConfirm(lang.delete_dept_confirm, lang.delete_dept_comfirm_desc, function () {
                    $.ajax({
                        type: 'DELETE',
                        async: true,
                        dataType: 'json',
                        contentType: "application/json",
                        data: JSON.stringify({ids: self.listEl.tables.getCheckedIds()}),
                        url: url

                    }).done(function () {
                        $.goMessage(lang.delete_dept_success);
                        self.listEl.tables.reload();
                        self.$el.find("#checkedAll").attr("checked", null);
                    });

                });
            },

            resetDept: function () {
                var url = GO.contextRoot + "ad/api/department/reset";
                var ids = this.listEl.tables.getCheckedIds();
                var self = this;


                if (ids.length == 0) {
                    $.goMessage(lang.no_select_dept);
                    return;
                }

                $.goPopup({
                    title: adminLang['삭제 부서 복구'],
                    message: GO.i18n(adminLang['삭제 부서 복구 설명'], {
                        'term': GO.config('orgSyncWaitMin')
                    }),
                    buttons: [{
                        btype: 'confirm',
                        btext: commonLang['확인'],
                        callback: function () {
                            $.ajax({
                                type: 'put',
                                async: true,
                                dataType: 'json',
                                contentType: "application/json",
                                data: JSON.stringify({ids: self.listEl.tables.getCheckedIds()}),
                                url: url

                            }).done(function () {
                                $.goMessage(lang.delete_dept_success);
                                self.listEl.tables.reload();
                                self.$el.find("#checkedAll").attr("checked", null);
                            }).fail(function (xhr, status, error) {
                                $.goAlert(xhr.responseJSON.message);
                            });
                        }
                    }, {
                        btype: 'cancel',
                        btext: commonLang['취소'],
                    }]
                });
            },

            _setTotalAttachSize: function () {
                var totalAttachSize = GO.util.byteToMega(this.deleteDeptAttach.get("totalAttachSize"));
                this.$el.find('#deptTotalAttach').html(totalAttachSize);
            },

            renderUserTpl: function () {
                this.$el.find("#tab_content").html(accountDeleteListTmpl({
                    lang: lang,
                    selectType: [{"name": commonLang["이름"], "value": "name"},
                        {"name": commonLang["이메일"], "value": "email"},
                        {"name": adminLang["삭제 관리자"], "value": "actorName"}
                    ],
                }));
                this.renderDeleteUser();
            },

            renderDeleteUser: function () {
                var self = this;
                this.listEl = $.goGrid({
                    el: this.$("#deleteList"),
                    method: 'GET',
                    url: GO.contextRoot + 'ad/api/deleteuser/list',
                    emptyMessage: emptyTmpl({
                        label_desc: adminLang["삭제된 계정이 없습니다."]
                    }),
                    defaultSorting: [[3, "desc"]],
                    sDomType: 'admin',
                    checkbox: false,
                    lengthMenu: [20, 40, 60, 80],
                    displayLength: App.session('adminPageBase'),
                    columns: [
                        {
                            mData: function (obj) {
                                if (obj.name == null || obj.name == '') {
                                    return "-";
                                }

                                return obj.name;
                            }, sClass: "align_c", sWidth: '160px', bSortable: false, fnRender: function (obj) {
                            }
                        },
                        {
                            mData: function (obj) {
                                if (!obj) return "position";
                                if (obj.position == null || obj.position == '') {
                                    return "-";
                                }
                                return obj.position;
                            }, sClass: "align_c", sWidth: '150px', bSortable: false, fnRender: function (obj) {
                            }
                        },
                        {
                            mData: function (obj) {
                                if (obj.email == null || obj.email == '') {
                                    return "-";
                                }

                                return obj.email;
                            }, sClass: "align_c", bSortable: false
                        },
                        {
                            mData: function (obj) {
                                if (!obj) return "deletedDate";

                                if (obj.deletedDate == null || obj.deltedDate == '') {
                                    return "-";
                                }

                                return GO.util.shortDate(obj.deletedDate);
                            }, sClass: "align_c", bSortable: true, sWidth: "180px", fnRender: function (obj) {
                            }
                        },
                        {
                            mData: function (obj) {
                                if (obj.adminName == null || obj.adminName == '') {
                                    return "-";
                                }
                                var deleteAdmin = obj.adminName + ' ';

                                if (obj.adminPosition == null) {
                                    deleteAdmin = deleteAdmin;
                                } else {
                                    deleteAdmin = deleteAdmin + obj.adminPosition;
                                }
                                return deleteAdmin;
                            }, sClass: "align_c", sWidth: "250px", bSortable: false, fnRender: function (obj) {
                            }
                        }
                    ],
                    fnDrawCallback: function (obj) {
                        self.$el.find('.header_tb').remove();
                    }

                });
            },
            search: function () {
                var searchForm = this.$el.find('.table_search input[type="text"]'),
                    keyword = searchForm.val();
                this.listEl.tables.search(this.$el.find('.table_search select').val(), keyword, searchForm);
            },

            searchKeyboardEvent: function (e) {
                if (e.keyCode == 13) {
                    this.search();
                }
            },
            downAccountDeleteList: function () {
                var url = "ad/api/deleteuser/download/list?";
                var data = this.listEl.listParams;
                var properties = {
                    "property": "deletedDate",
                    "direction": data.direction,
                    "searchtype": data.searchtype,
                    "keyword": data.keyword
                };
                GO.util.downloadCsvFile(url + GO.util.jsonToUrlParam(properties));
            }
        });

        return deptDeleteList;
    });
