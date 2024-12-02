define(function (require) {
    var Backbone = require("backbone");
    var GO = require("app");
    var Hogan = require("hogan");
    var DepartmentModel = require("admin/models/department");
    var LicenseModel = require("system/models/licenseModel");
    var DeptDeleteDetailTmpl = require("hgn!admin/templates/department/dept_delete_detail");
    var DeptDeleteDetailInfoTmpl = require("hgn!admin/templates/department/dept_delete_detail_info");
    var DeptDeleteDetailDataTmpl = require("hgn!admin/templates/department/dept_delete_detail_data");
    var CommonLang = require("i18n!nls/commons");
    var AdminLang = require("i18n!admin/nls/admin");
    var ApprovalLang = require("i18n!approval/nls/approval");
    require("jquery.go-popup");
    require("jquery.go-orgslide");
    require("jquery.go-grid");

    var lang = {
        "dept_name": AdminLang["부서명"],
        "created_at": AdminLang["생성일"],
        "deleted_at": AdminLang["부서 삭제일"],
        "dept_code": AdminLang["부서코드"],
        "email": CommonLang["이메일"],
        "delete_attach": AdminLang["첨부파일 삭제"],
        "complete_delete": AdminLang["완전 삭제"],
        'delete_dept_confirm': AdminLang["선택한 부서를 완전 삭제하시겠습니까"],
        'delete_dept_comfirm_desc': AdminLang["삭제한 부서 삭제 경고 메시지"],
        'delete_dept_success': CommonLang["성공했습니다."],
        "attach_size": AdminLang["사용량"],
        "basic_info": AdminLang["기본정보"],
        "department_data": AdminLang["부서 자료"],

        "remove": CommonLang["삭제"],
        "docCount": AdminLang["문서 개수"],
        "연락처 개수": AdminLang["연락처 개수"],

        "approval": CommonLang["전자결재"],
        "task": AdminLang["업무"],
        "report": AdminLang["보고"],
        "board": CommonLang["게시판"],
        "주소록": CommonLang["주소록"],
        "list_download": AdminLang["목록 다운로드"],
        "add_viewer": AdminLang["열람자 추가"],

        "migration_board": CommonLang["게시판 이관"],
        "migration_report": CommonLang["보고서 이관"],
        "migration_task": CommonLang["폴더 이관"],
        "migration_approval": AdminLang["문서함 이관"],
        "주소록 이관": AdminLang["주소록 이관"],

        "title": CommonLang["제목"],
        "viewer_info": AdminLang["열람자"],

        "check_box_alert": AdminLang["부서 자료를 선택해주세요."],
        "save_success": CommonLang["저장되었습니다."],
        "remove_attach_success": AdminLang["첨부파일이 삭제 되었습니다."],
        'data_remove_attach_confirm': AdminLang["데이터 첨부파일 삭제 알림"],
        'dept_remove_attach_confirm': AdminLang["부서 첨부파일 삭제 알림"],
        'remove_viewer': AdminLang["열람자 삭제"],
        'remove_viewer_confirm': AdminLang["열람자 삭제 알림"],
        'go_list': AdminLang["목록으로 돌아가기"],
        "add_success": CommonLang["추가되었습니다."],
        "remove_success": CommonLang["삭제되었습니다."]
    };

    var DeptDeleteDetail = Backbone.View.extend({
        events: {
            "click #btnReturnToList": "btnReturnToList"
        },

        initialize: function () {
            this.infoView = null;
            this.dataView = null;
        },

        render: function () {
            this.$el.append(DeptDeleteDetailTmpl({
                lang: lang
            }));

            this.infoView = new DeptDeleteInfo({"deptId": this.options.deptId});
            this.tabView = new TabView({"deptId": this.options.deptId});
            this.tabView.$el.on("changeTab", $.proxy(function (e, type) {
                this._renderGrid(type);
            }, this));

            this.$("#deptDeleteInfo").html(this.infoView.render().el);
            this.$("#delete_data_tab").html(this.tabView.render().el);

            this._renderGrid(this.tabView.getActiveTabType());

            this.infoView.render();
            this.tabView.render();

            return this;
        },

        btnReturnToList: function () {
            GO.router.navigate('dept/delete', {trigger: true});
        },

        _renderGrid: function (type) {
            var gridView = GridViewFactory.create(type, this.options.deptId);
            this.$("#delete_data_grid").html(gridView.render().el);
        }
    });

    var DeptDeleteInfo = Backbone.View.extend({

        events: {
            "click #remove_attach": "removeAttach",
            "click #remove_complete": "removeComplete",
            'click span.btn_box[data-btntype="changeform"]' : 'changeModifyForm',
            'focusout input[data-event="onfocusout"]' : 'changeModifyFormFocusOutEvent',
        },

        initialize: function () {
            var self = this;

            this.model = new DepartmentModel();
            this.model.set({'id': this.options.deptId, 'isDeleted': true}, {silent: true});
            GO.EventEmitter.on("admin", "dept_info:reload", function () {
                self.model.set({'id': self.options.deptId, 'isDeleted': true}, {silent: true});
                self.render();
            });
        },

        render: function () {
            var self = this;

            this.model.fetch({
                "success": function (model) {
                    var content = self.makeContent(model);
                    self.$el.html(content);
                }
            });

            return this;
        },

        makeContent: function (model) {
            return DeptDeleteDetailInfoTmpl({
                lang: lang,
                data: $.extend({}, model.toJSON(), {
                    createdAt: GO.util.basicDate3(model.get("createdAt")),
                    deletedAt: GO.util.basicDate3(model.get("deletedAt")),
                    attachSize: GO.util.byteToMega(model.get("attachSize")),
                    isAttachDelete: model.get("attachSize") == 0 ? false : true,
                    deleteAttachUser: GO.i18n(AdminLang["첨부파일 삭제됨 ({{arg1}})"], {"arg1": model.get("deleteDataAdminName")}),  //변수명 변경될수도 있음
                    isAttachDeleted: model.get("deleteDataAdminName") == "" ? false : true,
                    deleteDeptUser: model.get("deleteAdminName") + " " + model.get("deleteAdminPosition")  //변수명 변경될수도 있음
                })
            });
        },

        removeAttach: function () {
            var self = this;

            $.goConfirm(lang.delete_attach, lang.dept_remove_attach_confirm, function () {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    dataType: 'json',
                    contentType: "application/json",
                    data: JSON.stringify({ids: [self.options.deptId]}),
                    url: GO.config("contextRoot") + 'ad/api/department/delete/attach'
                }).done(function (response) {
                    $.goMessage(lang.remove_attach_success);
                    self.$el.find("#attach_info").html("<span class='user_data'>" + GO.i18n(AdminLang["첨부파일 삭제됨 ({{arg1}})"], {"arg1": GO.session("name") + " " + GO.session("position")}) + "</span>");
                    GO.EventEmitter.trigger("admin", "dept_data:reload");
                });

            });
        },

        changeModifyFormFocusOutEvent: function (e) {
            var targetEl = $(e.currentTarget).parent().parent();
            var viewEl = targetEl.children()[0];
            var edit = targetEl.children()[1];

            var value = $(edit).find('input').val();

            if ($(viewEl).find("span[data-value]").text() !==  value) {
                if (targetEl && targetEl.attr('data-type')) {
                    this.model.set($(targetEl).attr('data-type'), value);

                    // deptId / deleteDeptId 다름. 구분잘해야됨.
                    this.model.save().done((rep) => {
                        $(viewEl).find("span[data-value]").text(value);
                        $(viewEl).find("span[data-value]").attr('data-value', value);
                        $(edit).find('input').attr('value', value);
                        $.goMessage("success");
                    }).fail((error) => {
                        $(edit).find('input').val($(viewEl).find('span[data-value]').attr('data-value'))
                        $.goMessage(error.responseJSON.message);
                    });

                    // var reqData = this.model.clone();
                    // reqData.set('id', reqData.get('deptId'));
                    // reqData.unset('isDeleted');
                    // reqData.save();
                }
            }

            $(edit).hide();
            $(viewEl).show();
        },

        changeModifyForm: function (e) {
            // * html 맞춰야함.
            var targetEl = $(e.currentTarget).parent().parent();
            var viewEl = targetEl.children()[0];
            var edit = targetEl.children()[1];
            if (targetEl && targetEl.attr('data-type')) {
                $(edit).find('input').val($(viewEl).find('span[data-value]').attr('data-value'))

                $(viewEl).hide();
                $(edit).show();
            }
        },

        removeComplete: function () {
            var url = GO.contextRoot + "ad/api/department/complate/delete";
            var self = this;
            $.goConfirm(lang.delete_dept_confirm, lang.delete_dept_comfirm_desc, function () {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    dataType: 'json',
                    contentType: "application/json",
                    data: JSON.stringify({ids: [self.options.deptId]}),
                    url: url
                }).done(function (response) {
                    $.goMessage(lang.delete_dept_success);
                    GO.router.navigate('dept/delete', {trigger: true});
                });
            });
        }
    });

    var TabTmpl = [
        "<ul class='tab_menu round' id='data_menu'>",
        "<li class='active'><span class='txt' data-type='Approval'>{{lang.approval}}</span></li>",
        "<li class=''><span class='txt' data-type='Board'>{{lang.board}}</span></li>",
        "{{#hasTask}}<li class=''><span class='txt' data-type='Task'>{{lang.task}}</span></li>{{/hasTask}}",
        "<li class=''><span class='txt' data-type='Report'>{{lang.report}}</span></li>",
        "<li class=''><span class='txt' data-type='Contact'>{{lang.주소록}}</span></li>",
        "</ul>",
    ].join("");

    var TabView = Backbone.View.extend({

        className: "tab_menu_wrap",

        events: {
            "click #data_menu li": "changeTab"
        },

        initialize: function () {
        	this.licenseInfo = LicenseModel.read();
        },

        render: function () {
        	var self = this;
            var tabTmpl = Hogan.compile(TabTmpl).render({
            	lang: lang,
            	hasTask: self.licenseInfo.get('useTaskService')
        	});

            this.$el.html(tabTmpl);

            return this;
        },

        changeTab: function (e) {
            var targetEl = $(e.currentTarget),
                type = targetEl.find("span").attr("data-type");

            targetEl.parents("ul.tab_menu").find("li").removeClass("active");
            targetEl.addClass("active");

            $.goOrgSlide.close();

            this.$el.trigger("changeTab", type);
        },

        getActiveTabType: function () {
            return this.$el.find("#data_menu li.active span").attr("data-type");
        }

    });

    var BaseGridView = Backbone.View.extend({

        events: {
            "click #dept_data_top_actions span[data-action='download']": "download",
            "click #dept_data_top_actions span[data-action='remove_attach_file']": "remove_attach_file",
            "click #dept_data_top_actions span[data-action='migration']": "migration",
            "click #dept_data_top_actions span[data-action='add_viewer']": "addViewer",
            "click span[data-action='viewer_delete']": "removeViewer"
        },

        initialize: function () {
            var self = this;

            this.deptId = this.options.deptId;
            //parent object setting
            this.grid = null;

            GO.EventEmitter.off("admin", "dept_data:reload");
            GO.EventEmitter.on("admin", "dept_data:reload", function () {
                self.grid.tables.reload();
            });
        },

        render: function (option) {
            var content = DeptDeleteDetailDataTmpl({
                lang: $.extend({}, lang, {
                    migration_button: option.migration_button
                })
            });

            this.$el.html(content);

            return this;
        },

        reload: function () {
            this.grid.tables.reload();
        },

        checkboxValidate: function (data) {
            if (data.length == 0) {
                $.goAlert(lang.check_box_alert);
                return false;
            }

            return true;
        }
    });

    var __super__ = BaseGridView.prototype;

    var ApprovalTpl = Hogan.compile(
        '<div class="dataTables_wrapper">' +
        '<div class="toolbar_top header_tb"  id="controlButtons" style="display: none; border-bottom:0px;">' +
        '<div class="critical" id="dept_data_top_actions">' +
        '<span class="btn_tool" data-action="download"><span class="ic_adm ic_down"></span>{{lang.list_download}}</span>' +
        '<span class="btn_tool" data-action="migration"><span class="ic_adm ic_move"></span>{{lang.migration_button}}</span>' +
        '</div>' +
        '</div>' +

        '<div class="content_tb">' +
        '<table class="chart size" id="dept_delete_table">' +
        '<thead>' +
        '<tr>' +
        '<th class="share_part sorting_disable"><span class="title_sort">{{lang.title}}</span></th>' +
        '<th class="share_part sorting_disable"><span class="title_sort">{{lang.count}}</span></th>' +
        '</tr>' +
        '</thead>' +
        '<tbody id="dept_delete_data_item">' +
        '</tbody>' +
        '</table>' +
        '</div>' +
        '</div>'
    );

    var ApprovalGridView = BaseGridView.extend({

        initialize: function () {
            $.extend(this.events, __super__.events);
            __super__.initialize.apply(this, arguments);
        },

        render: function (option) {
            var content = ApprovalTpl.render({
                lang: $.extend({}, lang, {
                    migration_button: lang.migration_approval,
                    count : lang.docCount
                })
            });

            this.$el.html(content);
            this.makeGrid();

            return this;
        },

        download: function () {
            GO.util.downloadCsvFile("ad/api/approval/deptfolder/download/" + this.deptId);
        },

        migration: function () {
        	var checkedData = this.grid.tables.getCheckedIds(),
            	self = this;
    
        if(!this.checkboxValidate(checkedData)){return;}

		var cancelCallback = function(){
			$.goOrgSlide.close();
		};

        $.goOrgSlide({
            type : "department",
            isAdmin : true,
            contextRoot : GO.contextRoot,
            callback : $.proxy(function(info) {
            	if (info.type == "root") return;

				//기본문서함이 포함되어 있는지 확인
				var includeDefaultfolder = false;
				var defaultFolderName = "";
				checkedData.forEach(function(item, i, list){
					if(item == "DRAFT" || item == "RECEPTION" || item == "REFERENCE"){
						if(includeDefaultfolder == true){
							defaultFolderName = defaultFolderName.concat(", ");
						}
						if (item == 'DRAFT') {
							defaultFolderName = defaultFolderName.concat(ApprovalLang['기안 완료함']);
						} else if (item == 'RECEPTION') {
							defaultFolderName = defaultFolderName.concat(ApprovalLang['부서 수신함']);
						} else if (item == 'REFERENCE') {
							defaultFolderName = defaultFolderName.concat(ApprovalLang['부서 참조함']);
						}
						includeDefaultfolder = true;
					}
				});

				if(includeDefaultfolder){
					defaultFolderName = GO.i18n(AdminLang["<{{arg1}}>은 문서함이 복사 문구"],{arg1 : defaultFolderName});
				}



                $.goConfirm(GO.i18n(AdminLang["문서함 {{arg1}}로 이동"],{arg1 : info.name}), defaultFolderName, function() {
					GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
					$.ajax({
                        type: 'PUT',
						timeout: 2*60*60*1000,
                        async: true,
                        data : JSON.stringify({stringIds : checkedData}),
                        dataType: 'json',
                        contentType : "application/json",
                        url: GO.config("contextRoot") + 'ad/api/approval/deptfolder/transfer/' + info.id + '/' + self.deptId
                    }).
                    done(function(response){
                        $.goMessage(lang.save_success);
						self.reload();
						$.goOrgSlide.close();
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					});
                    
                },cancelCallback);
                
             }, this)
        });
        },

        makeGrid: function () {
            var self = this;

            this.grid = $.goGrid({
                el: this.$('#dept_delete_table'),
                method: 'GET',
                destroy: true,
                url: GO.contextRoot + 'ad/api/approval/deptallfolder/' + this.deptId,
                emptyMessage: "<p class='data_null'> " +
                "<span class='ic_data_type ic_no_data'></span>" +
                "<span class='txt'>" + AdminLang["표시할 데이터 없음"] + "</span>" +
                "</p>",
                pageUse: false,
                sDomUse: false,
                checkbox: true,
                checkboxData: 'id',
                folderType : 'folderType',
                columns: [
                    {
                        mData: "folderName", sWidth: '200px', bSortable: false, fnRender: function (obj) {
                        return obj.aData.folderName;
                    }
                    },
                    {
                        mData: "docCount", sWidth: '200px', bSortable: false, fnRender: function (obj) {
                        return obj.aData.docCount || 0;
                    }
                    }
                ],
                fnDrawCallback: function (obj, oSettings, listParams) {
                    self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
                    self.$el.find('#checkedAll').attr('checked', false);
                }
            });
        }
    });

    var BoardGridView = BaseGridView.extend({
        initialize: function () {
            $.extend(this.events, __super__.events);
            __super__.initialize.apply(this, arguments);
        },

        render: function () {
            __super__.render.call(this, {"migration_button": lang.migration_board});
            this.makeGrid();

            return this;
        },

        download: function () {
            GO.util.downloadCsvFile("ad/api/department/" + this.deptId + "/boards/download");
        },

        remove_attach_file: function () {
            var checkedData = this.grid.tables.getCheckedIds(),
                self = this;

            if (!this.checkboxValidate(checkedData)) {
                return;
            }

            $.goConfirm(lang.delete_attach, lang.data_remove_attach_confirm, function () {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    data: JSON.stringify({ids: checkedData}),
                    dataType: 'json',
                    contentType: "application/json",
                    url: GO.config("contextRoot") + 'ad/api/board/attach'
                }).done(function (response) {
                    $.goMessage(lang.remove_attach_success);
                    self.reload();
                    GO.EventEmitter.trigger("admin", "dept_info:reload");
                });
            });
        },

        migration: function () {
            var checkedData = this.grid.tables.getCheckedIds(),
                self = this;

            if (!this.checkboxValidate(checkedData)) {
                return;
            }

            $.goOrgSlide({
                header: lang['migration_board'],
                type: "department",
                isAdmin: true,
                contextRoot: GO.contextRoot,
                callback: $.proxy(function (info) {
                    if (info.type == "root") return;
                    var ids = this.grid.tables.getCheckedIds();
                    content =
                        '<p class="add">' +
                        GO.i18n(AdminLang["게시판 {{arg1}}로 이동"], {arg1: info.name}) +
                        '</p>';

                    if (!this.checkboxValidate(ids)) {
                        return;
                    }

                    $.goConfirm(content, "", function () {
                        $.ajax({
                            type: 'PUT',
                            async: true,
                            data: JSON.stringify({ids: ids}),
                            dataType: 'json',
                            contentType: "application/json",
                            url: GO.config("contextRoot") + 'ad/api/board/transfer/dept/' + info.id
                        }).done(function (response) {
                            $.goMessage(lang.save_success);
                            self.reload();
                            $.goOrgSlide.close();
                            GO.EventEmitter.trigger("admin", "dept_info:reload");
                        });

                    });
                }, this)
            });
        },

        addViewer: function () {
            var checkedData = this.grid.tables.getCheckedData(),
                self = this;

            if (!this.checkboxValidate(checkedData)) {
                return;
            }

            $.goOrgSlide({
                header: lang['add_viewer'],
                type: "list",
                isAdmin: true,
                contextRoot: GO.contextRoot,
                callback: $.proxy(function (info) {
                    var url = GO.contextRoot + "ad/api/board/viewer/" + info.id,
                        deptIds = [];

                    $.each(checkedData, function () {
                        if (this.deletedDeptViewer != undefined) {
                            var deletedDeptViewer = _.find(this.deletedDeptViewer.nodes, function (data) {
                                return data.nodeId == info.id;
                            });

                            if (deletedDeptViewer != undefined) {
                                return;
                            }
                        }

                        deptIds.push(this.id);
                    });

                    if (deptIds.length == 0) {
                        $.goMessage(lang.save_success);
                        return;
                    }

                    $.ajax({
                        type: 'POST',
                        async: true,
                        dataType: 'json',
                        contentType: "application/json",
                        data: JSON.stringify({ids: deptIds}),
                        url: url
                    }).done(function (response) {
                        $.goMessage(lang.add_success);
                        self.reload();
                    });
                }, this)
            });
        },

        removeViewer: function (e) {
            var targetEl = $(e.currentTarget),
                targetUserId = targetEl.parents("li:first").attr("data-user-id"),
                targetBoardId = targetEl.parents("li:first").attr("data-board-id"),
                url = GO.contextRoot + "ad/api/board/" + targetBoardId + "/viewer/" + targetUserId;
            self = this;

            $.goConfirm(lang.remove_viewer, lang.remove_viewer_confirm, function () {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    dataType: 'json',
                    contentType: "application/json",
                    url: url
                }).done(function (response) {
                    $.goMessage(lang.remove_success);
                    self.reload();
                });
            });
        },

        makeGrid: function () {
            var self = this;

            this.grid = $.goGrid({
                el: this.$('#dept_delete_table'),
                method: 'GET',
                destroy: true,
                url: GO.contextRoot + 'ad/api/department/' + this.deptId + '/boards',
                params: this.searchParams,
                emptyMessage: "<p class='data_null'> " +
                "<span class='ic_data_type ic_no_data'></span>" +
                "<span class='txt'>" + AdminLang["표시할 데이터 없음"] + "</span>" +
                "</p>",
                defaultSorting: [[1, "asc"]],
                sDomType: 'admin',
                pageUse: false,
                sDomUse: false,
                checkbox: true,
                checkboxData: 'id',
                columns: [
                    {
                        mData: null, sWidth: '200px', bSortable: false, fnRender: function (obj) {
                        return obj.aData.name;
                    }
                    },
                    {
                        mData: "attachSize", sWidth: '200px', bSortable: false, fnRender: function (obj) {
                        return GO.util.byteToMega(obj.aData.attachSize);
                    }
                    },
                    {
                        mData: null, bSortable: false, fnRender: function (obj) {
                        var viewers = obj.aData.deletedDeptViewer,
                            viewerItems = [],
                            boardId = obj.aData.id; //boardId 변경될 소지 있음

                        if (viewers == undefined) {
                            return "-";
                        }

                        if (viewers.nodes.length == 0) {
                            return "-";
                        }

                        viewerItems.push("<ul>");

                        $.each(viewers.nodes, function (idx, viewer) {
                            var viewerItem =
                                ["<li class='first' data-user-id='" + viewer.nodeId + "' data-board-id='" + boardId + "'>",
                                    "<span class='minor'>" + viewer.nodeValue + "</span>",
                                    "<span class='btn_border'><span class='ic ic_delete' data-action='viewer_delete' title='" + lang.remove + "'></span></span>",
                                    "</li>"].join("");
                            viewerItems.push(viewerItem);
                        });

                        viewerItems.push("<ul>");

                        return viewerItems.join("");
                    }
                    },
                ],
                fnDrawCallback: function (obj, oSettings, listParams) {
                    self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
                    self.$el.find('#checkedAll').attr('checked', false);
                },


                fnServerSuccess: function (data) {
                    console.info();
                }
            });
        }
    });

    var TaskGridView = BaseGridView.extend({

        initialize: function () {
            $.extend(this.events, __super__.events);
            __super__.initialize.apply(this, arguments);
        },

        render: function () {
            __super__.render.call(this, {"migration_button": lang.migration_task});
            this.makeGrid();

            return this;
        },

        download: function () {
            GO.util.downloadCsvFile("ad/api/task/department/" + this.deptId + "/folders/download");
        },

        remove_attach_file: function () {
            var checkedData = this.grid.tables.getCheckedIds(),
                self = this;

            if (!this.checkboxValidate(checkedData)) {
                return;
            }

            $.goConfirm(lang.delete_attach, lang.data_remove_attach_confirm, function () {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    data: JSON.stringify({ids: checkedData}),
                    dataType: 'json',
                    contentType: "application/json",
                    url: GO.config("contextRoot") + 'ad/api/task/folder/attach'
                }).done(function (response) {
                    $.goMessage(lang.remove_attach_success);
                    self.reload();
                    GO.EventEmitter.trigger("admin", "dept_info:reload");
                });
            });
        },

        migration: function () {
            var checkedData = this.grid.tables.getCheckedIds(),
                self = this;

            if (!this.checkboxValidate(checkedData)) {
                return;
            }

            $.goOrgSlide({
                header: lang['migration_task'],
                type: "department",
                isAdmin: true,
                contextRoot: GO.contextRoot,
                callback: $.proxy(function (info) {
                    if (info.type == "root") return;
                    var content =
                        '<p class="add">' +
                        GO.i18n(AdminLang["폴더 {{arg1}}로 이동"], {arg1: info.name}) +
                        '</p>';

                    if (!this.checkboxValidate(checkedData)) {
                        return;
                    }

                    $.goConfirm(content, "", function () {
                        $.ajax({
                            type: 'PUT',
                            async: true,
                            data: JSON.stringify({ids: checkedData}),
                            dataType: 'json',
                            contentType: "application/json",
                            url: GO.config("contextRoot") + 'ad/api/task/folder/transfer/dept/' + info.id
                        }).done(function (response) {
                            $.goMessage(lang.save_success);
                            self.reload();
                            $.goOrgSlide.close();
                            GO.EventEmitter.trigger("admin", "dept_info:reload");
                        });

                    });
                }, this)
            });
        },

        addViewer: function () {
            var checkedData = this.grid.tables.getCheckedData(),
                self = this;

            if (!this.checkboxValidate(checkedData)) {
                return;
            }

            $.goOrgSlide({
                header: lang['add_viewer'],
                type: "list",
                isAdmin: true,
                contextRoot: GO.contextRoot,
                callback: $.proxy(function (info) {
                    var url = GO.contextRoot + "ad/api/task/folder/viewer/" + info.id,
                        deptIds = [];

                    $.each(checkedData, function () {
                        if (this.deletedDeptViewer != undefined) {
                            var deletedDeptViewer = _.find(this.deletedDeptViewer.nodes, function (data) {
                                return data.nodeId == info.id;
                            });

                            if (deletedDeptViewer != undefined) {
                                return;
                            }
                        }

                        deptIds.push(this.id);
                    });

                    if (deptIds.length == 0) {
                        $.goMessage(lang.save_success);
                        return;
                    }
                    $.ajax({
                        type: 'POST',
                        async: true,
                        dataType: 'json',
                        contentType: "application/json",
                        data: JSON.stringify({ids: deptIds}),
                        url: url
                    }).done(function (response) {
                        $.goMessage(lang.add_success);
                        self.reload();
                    });
                }, this)
            });
        },

        removeViewer: function (e) {
            var targetEl = $(e.currentTarget),
                targetUserId = targetEl.parents("li:first").attr("data-user-id"),
                targetTaskId = targetEl.parents("li:first").attr("data-task-id"),
                url = GO.contextRoot + "ad/api/task/folder/" + targetTaskId + "/viewer/" + targetUserId;
            self = this;

            $.goConfirm(lang.remove_viewer, lang.remove_viewer_confirm, function () {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    dataType: 'json',
                    contentType: "application/json",
                    url: url
                }).done(function (response) {
                    $.goMessage(lang.remove_success);
                    self.reload();
                });
            });
        },

        makeGrid: function () {
            var self = this;

            this.grid = $.goGrid({
                el: this.$('#dept_delete_table'),
                method: 'GET',
                destroy: true,
                url: GO.contextRoot + 'ad/api/task/department/' + this.deptId + '/folders',
                params: this.searchParams,
                emptyMessage: "<p class='data_null'> " +
                "<span class='ic_data_type ic_no_data'></span>" +
                "<span class='txt'>" + AdminLang["표시할 데이터 없음"] + "</span>" +
                "</p>",
                defaultSorting: [[1, "asc"]],
                sDomType: 'admin',
                pageUse: false,
                sDomUse: false,
                checkbox: true,
                checkboxData: 'id',
                columns: [
                    {
                        mData: "name", sWidth: '200px', bSortable: false, fnRender: function (obj) {
                        return obj.aData.name;
                    }
                    },
                    {
                        mData: "attachSize", sWidth: '200px', bSortable: false, fnRender: function (obj) {
                        return GO.util.byteToMega(obj.aData.attachSize);
                    }
                    },
                    {
                        mData: null, bSortable: false, fnRender: function (obj) {
                        var viewers = obj.aData.deletedDeptViewer,
                            viewerItems = [],
                            taskId = obj.aData.id; //boardId 변경될 소지 있음

                        if (viewers == undefined) {
                            return "-";
                        }

                        if (viewers.nodes.length == 0) {
                            return "-";
                        }

                        viewerItems.push("<ul>");

                        $.each(viewers.nodes, function (idx, viewer) {
                            var viewerItem =
                                ["<li class='first' data-user-id='" + viewer.nodeId + "' data-task-id='" + taskId + "'>",
                                    "<span class='minor'>" + viewer.nodeValue + "</span>",
                                    "<span class='btn_border'><span class='ic ic_delete' data-action='viewer_delete' title='" + lang.remove + "'></span></span>",
                                    "</li>"].join("");
                            viewerItems.push(viewerItem);
                        });

                        viewerItems.push("<ul>");

                        return viewerItems.join("");
                    }
                    },
                ],
                fnDrawCallback: function (obj, oSettings, listParams) {
                    self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
                    self.$el.find('#checkedAll').attr('checked', false);
                }
            });
        }
    });

    var ReportGridView = BaseGridView.extend({

        initialize: function () {
            $.extend(this.events, __super__.events);
            __super__.initialize.apply(this, arguments);
        },

        render: function () {
            __super__.render.call(this, {"migration_button": lang.migration_report});
            this.makeGrid();

            return this;
        },

        download: function () {
            GO.util.downloadCsvFile("ad/api/report/department/" + this.deptId + "/folders/download");
        },

        remove_attach_file: function () {
            var checkedData = this.grid.tables.getCheckedIds(),
                self = this;

            if (!this.checkboxValidate(checkedData)) {
                return;
            }

            $.goConfirm(lang.delete_attach, lang.data_remove_attach_confirm, function () {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    data: JSON.stringify({ids: checkedData}),
                    dataType: 'json',
                    contentType: "application/json",
                    url: GO.config("contextRoot") + 'ad/api/report/folder/attach'
                }).done(function (response) {
                    $.goMessage(lang.remove_attach_success);
                    self.reload();
                    GO.EventEmitter.trigger("admin", "dept_info:reload");
                });
            });
        },

        migration: function () {
            var checkedData = this.grid.tables.getCheckedIds(),
                self = this;

            if (!this.checkboxValidate(checkedData)) {
                return;
            }

            $.goOrgSlide({
                header: lang['migration_report'],
                type: "department",
                isAdmin: true,
                contextRoot: GO.contextRoot,
                callback: $.proxy(function (info) {
                    if (info.type == "root") return;
                    var ids = this.grid.tables.getCheckedIds();
                    content =
                        '<p class="add">' +
                        GO.i18n(AdminLang["보고서 {{arg1}}로 이동"], {arg1: info.name}) +
                        '</p>';

                    if (!this.checkboxValidate(ids)) {
                        return;
                    }

                    $.goConfirm(content, "", function () {
                        $.ajax({
                            type: 'PUT',
                            async: true,
                            data: JSON.stringify({ids: ids}),
                            dataType: 'json',
                            contentType: "application/json",
                            url: GO.contextRoot + "ad/api/report/folder/department/" + self.deptId + "/transfer/" + info.id
                        }).done(function (response) {
                            $.goMessage(lang.save_success);
                            self.reload();
                            $.goOrgSlide.close();
                            GO.EventEmitter.trigger("admin", "dept_info:reload");
                        });

                    });
                }, this)
            });
        },

        addViewer: function () {
            var checkedData = this.grid.tables.getCheckedData(),
                self = this;

            if (!this.checkboxValidate(checkedData)) {
                return;
            }

            $.goOrgSlide({
                header: lang['add_viewer'],
                type: "list",
                isAdmin: true,
                contextRoot: GO.contextRoot,
                callback: $.proxy(function (info) {
                    var url = GO.contextRoot + "ad/api/report/folder/viewer/" + info.id,
                        deptIds = [];

                    $.each(checkedData, function () {
                        if (this.deletedDeptViewer != undefined) {
                            var deletedDeptViewer = _.find(this.deletedDeptViewer.nodes, function (data) {
                                return data.nodeId == info.id;
                            });

                            if (deletedDeptViewer != undefined) {
                                return;
                            }
                        }

                        deptIds.push(this.id);
                    });

                    if (deptIds.length == 0) {
                        $.goMessage(lang.save_success);
                        return;
                    }

                    $.ajax({
                        type: 'POST',
                        async: true,
                        dataType: 'json',
                        contentType: "application/json",
                        data: JSON.stringify({ids: deptIds}),
                        url: url
                    }).done(function (response) {
                        $.goMessage(lang.add_success);
                        self.reload();
                    });
                }, this)
            });
        },

        removeViewer: function (e) {
            var targetEl = $(e.currentTarget),
                targetUserId = targetEl.parents("li:first").attr("data-user-id"),
                targetReportId = targetEl.parents("li:first").attr("data-report-id"),
                url = GO.contextRoot + "ad/api/report/folder/" + targetReportId + "/viewer/" + targetUserId;
            self = this;

            $.goConfirm(lang.remove_viewer, lang.remove_viewer_confirm, function () {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    dataType: 'json',
                    contentType: "application/json",
                    url: url
                }).done(function (response) {
                    $.goMessage(lang.remove_success);
                    self.reload();
                });
            });
        },

        makeGrid: function () {
            var self = this;

            this.grid = $.goGrid({
                el: this.$('#dept_delete_table'),
                method: 'GET',
                destroy: true,
                url: GO.contextRoot + "ad/api/report/department/" + this.deptId + "/folders",
                params: this.searchParams,
                emptyMessage: "<p class='data_null'> " +
                "<span class='ic_data_type ic_no_data'></span>" +
                "<span class='txt'>" + AdminLang["표시할 데이터 없음"] + "</span>" +
                "</p>",
                defaultSorting: [[1, "asc"]],
                sDomType: 'admin',
                pageUse: false,
                sDomUse: false,
                checkbox: true,
                checkboxData: 'id',
                columns: [
                    {
                        mData: "name", sWidth: '200px', bSortable: true, fnRender: function (obj) {
                        return obj.aData.name;
                    }
                    },
                    {
                        mData: "attachSize", sWidth: '200px', bSortable: false, fnRender: function (obj) {
                        return GO.util.byteToMega(obj.aData.attachSize);
                    }
                    },
                    {
                        mData: null, bSortable: false, fnRender: function (obj) {
                        var viewers = obj.aData.deletedDeptViewer,
                            viewerItems = [],
                            reportId = obj.aData.id; //boardId 변경될 소지 있음

                        if (viewers == undefined) {
                            return "-";
                        }

                        if (viewers.nodes.length == 0) {
                            return "-";
                        }

                        viewerItems.push("<ul>");

                        $.each(viewers.nodes, function (idx, viewer) {
                            var viewerItem =
                                ["<li class='first' data-user-id='" + viewer.nodeId + "' data-report-id='" + reportId + "'>",
                                    "<span class='minor'>" + viewer.nodeValue + "</span>",
                                    "<span class='btn_border'><span class='ic ic_delete' data-action='viewer_delete' title='" + lang.remove + "'></span></span>",
                                    "</li>"].join("");
                            viewerItems.push(viewerItem);
                        });

                        viewerItems.push("<ul>");

                        return viewerItems.join("");
                    }
                    },
                ],
                fnDrawCallback: function (obj, oSettings, listParams) {
                    self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
                    self.$el.find('#checkedAll').attr('checked', false);
                }
            });
        }
    });

    var ContactTpl = ApprovalTpl;

    var ContactGridView = BaseGridView.extend({

        initialize: function () {
            $.extend(this.events, __super__.events);
            __super__.initialize.apply(this, arguments);
        },

        render: function () {
            var content = ContactTpl.render({
                lang: $.extend({}, lang, {
                    migration_button: lang["주소록 이관"],
                    count : lang["연락처 개수"]
                })
            });

            this.$el.html(content);
            this.makeGrid();

            return this;
        },

        download: function () {
            GO.util.downloadCsvFile("ad/api/contact/department/" + this.deptId + "/groups/download");
        },

        migration: function () {
            var checkedData = this.grid.tables.getCheckedIds(),
                self = this;

            if (!this.checkboxValidate(checkedData)) {
                return;
            }

            $.goOrgSlide({
                header: lang["주소록 이관"],
                type: "department",
                isAdmin: true,
                contextRoot: GO.contextRoot,
                callback: $.proxy(function (info) {
                    if (info.type == "root") return;
                    var content =
                        '<p class="add">' +
                        GO.i18n(AdminLang["주소록 {{arg1}}로 이동"], {arg1: info.name}) +
                        '</p>';

                    if (!this.checkboxValidate(checkedData)) {
                        return;
                    }

                    $.goConfirm(content, "", function () {
                        $.ajax({
                            type: 'PUT',
                            async: true,
                            data: JSON.stringify({ids: checkedData}),
                            dataType: 'json',
                            contentType: "application/json",
                            url: GO.contextRoot + 'ad/api/contact/transfer/dept/' + info.id
                        }).done(function (response) {
                            $.goMessage(lang.save_success);
                            self.reload();
                            $.goOrgSlide.close();
                            GO.EventEmitter.trigger("admin", "dept_info:reload");
                        });

                    });
                }, this)
            });
        },

        makeGrid: function () {
            var self = this;

            this.grid = $.goGrid({
                el: this.$('#dept_delete_table'),
                method: 'GET',
                destroy: true,
                url: GO.contextRoot + 'ad/api/department/'+this.deptId+'/groups',
                emptyMessage: "<p class='data_null'> " +
                "<span class='ic_data_type ic_no_data'></span>" +
                "<span class='txt'>" + AdminLang["표시할 데이터 없음"] + "</span>" +
                "</p>",
                pageUse: false,
                sDomUse: false,
                checkbox: true,
                checkboxData: 'id',
                columns: [
                    {
                        mData: "name", sWidth: '200px', bSortable: false
                    },
                    {
                        mData: "contactCount", sWidth: '200px', bSortable: false
                    }
                ],
                fnDrawCallback: function (obj, oSettings, listParams) {
                    self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
                    self.$el.find('#checkedAll').attr('checked', false);
                }
            });
        }
    });


    var GridViewFactory = {};

    GridViewFactory.create = function (type, deptId) {

        var gridViews = {
            "Board" : BoardGridView,
            "Task" : TaskGridView,
            "Report" : ReportGridView,
            "Approval" : ApprovalGridView,
            "Contact" : ContactGridView
        };

        return new gridViews[type]({deptId: deptId});
    };

    return DeptDeleteDetail;

    function privateFunc(view, param1, param2) {

    }
});
