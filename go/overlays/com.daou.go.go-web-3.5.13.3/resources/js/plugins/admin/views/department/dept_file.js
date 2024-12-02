define("admin/views/department/dept_file", function (require) {

    var Backbone = require("backbone");
    var GO = require("app");
    var Tpl = require("hgn!admin/templates/department/dept_file");
    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require("i18n!nls/commons");
    var boardLang = require("i18n!board/nls/board");
    var approvalLang = require("i18n!approval/nls/approval");
    var taskLang = require("i18n!task/nls/task");
    var reportLang = require("i18n!report/nls/report");
    var ContactView = require("admin/views/department/dept_detail_contact");
    var SystemMenuConfig = require("admin/models/system_menu_list");
    var lang = {
        'board': commonLang['게시판'],
        'size': adminLang['사용량(MB)'],
        'docCount': adminLang["문서 개수"],
        'share': adminLang['공유'],
        'title': commonLang['제목'],
        'type': adminLang['구분'],
        "migration_board": commonLang["게시판 이관"],
        "migration_report": commonLang["보고서 이관"],
        "migration_task": commonLang["폴더 이관"],
        "migration_approval": adminLang["문서함 이관"],
        "move_dept_folder": adminLang["문서함 관리"],
        "check_box_alert": adminLang["부서 자료를 선택해주세요."],
        "approval": commonLang["전자결재"],
        "task": adminLang["업무"],
        "report": adminLang["보고"],
        'dept_amounts_empty' : adminLang['등록된 부서자료가 없습니다.'],
        "save_success": commonLang["저장되었습니다."],
        "closed": adminLang["중지"],
        "normal": commonLang["정상"],
        "total": commonLang["전체"],
        "contact": commonLang["주소록"],
        'list_to_csv' : adminLang['목록 다운로드'],
    }

var DeptFile = Backbone.View.extend({
    events: {
        'click .file_tab li': 'changeTab',
    },

    initialize: function (options) {
        this.options = options || {};
        this.deptId = this.options.deptId;
        this.approvalMenuAccessible = this.options.approvalMenuAccessible;
    },
    render: function () {
        var systemMenuList = SystemMenuConfig.read();
        var hasTask = systemMenuList.hasApp("task");
        var hasReport = systemMenuList.hasApp("report");
        var hasApproval = systemMenuList.hasApp("approval");
        var hasBoard = systemMenuList.hasApp("board");
        var hasContact = systemMenuList.hasApp("contact");

        this.$el.html(Tpl({
            'lang': lang,
            'hasTask' : hasTask,
            'hasReport' : hasReport,
            'hasApproval' : hasApproval,
            'hasBoard' : hasBoard,
            'hasContact' : hasContact
        }));

        var view = GridViewFactory.create("Approval", this.deptId, this.approvalMenuAccessible);
        this.$el.find("#deptDataList").show().html(view.render().el);

        return this;
    },
    changeTab: function (e) {
        var target = $(e.currentTarget);
        var content = target.data('content');
        this.$el.find('ul.file_tab li').removeClass('active');
        target.addClass('active');

        var view = GridViewFactory.create(content, this.deptId, this.approvalMenuAccessible);
        this.$el.find("#deptDataList").show().html(view.render().el);
    },
});

var deptDataGridTmpl =
    ["<div class='dataTables_wrapper'>",
        "<div class='toolbar_top header_tb'>",
        "<div class='critical'>",
        "<span class='btn_tool' id='dept_data_migration'><span class='ic_adm ic_move'></span><span class='txt'>{{lang.migration_button}}</span></span>",
        "</div><div class='optional'>",
        "<span class='btn_tool' id='dept_data_down'><span class='ic_adm ic_down'></span><span class='txt'>{{lang.list_to_csv}}</span></span>",
        "</div>",
        "</div>",
        "<div class='content_tb'><div class='dataTables_wrapper'>",
        "<table class='chart size dataTable'>",
        "<thead>",
        "<tr>",
        "<th class='sorting'><span class='title_sort'>{{lang.title}}<ins class='ic'></ins><span class='selected'></span></span></th>",
        "<th class='sorting_disable'>",
        "<select id='statusFilter' style='width:120px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis'>",
        "<option value='all'>" + lang.total + "</option>",
        "<option value='normal'>" + lang.normal + "</option>",
        "<option value='stop'>" + lang.closed + "</option>",
        "</select>",
        "</th>",
        "<th class='sorting_disable'><span class='title_sort'>{{lang.share}}</span><span class='selected'></span></th>",
        "<th class='sorting_desc last'><span class='title_sort'>{{lang.size}}<ins class='ic'></ins><span class='selected'></span></span></th>",
        "</tr>",
        "</thead>",
        "</table>",
        "</div></div>",
        "</div>"].join("");

var apprDataGridTmpl =
    ["<div class='dataTables_wrapper'>",
        "<div class='toolbar_top header_tb'>",
        "<div class='critical'>",
        "<span class='btn_tool' id='dept_data_migration'><span class='ic_adm ic_move'></span><span class='txt'>{{lang.migration_button}}</span></span>",
        "</div><div class='optional'>",
        "<span class='btn_tool' id='move_dept_foler'><span class='ic_adm ic_shortcut'></span><span class='txt'>{{lang.move_dept_folder}}</span></span>",
        "<span class='btn_tool' id='dept_data_down'><span class='ic_adm ic_down'></span><span class='txt'>{{lang.list_to_csv}}</span></span>",
        "</div>",
        "</div>",
        "<div class='content_tb'><div class='dataTables_wrapper'>",
        "<table class='chart size dataTable'>",
        "<thead>",
        "<tr>",
        "<th class='sorting'><span class='title_sort'>{{lang.title}}<ins class='ic'></ins><span class='selected'></span></span></th>",
        "<th class='sorting_desc last'><span class='title_sort'>{{lang.docCount}}<ins class='ic'></ins><span class='selected'></span></span></th>",
        "</tr>",
        "</thead>",
        "</table>",
        "</div></div>",
        "</div>"].join("");

var BaseGridView = Backbone.View.extend({

    events: {
        "click #dept_data_down": "download",
        "click #dept_data_migration": "migration",
        "click #move_dept_foler": "moveDeptFolder",
        "change #statusFilter": "statusFilter",
    },

    initialize: function () {
        this.deptId = this.options.id;
        this.grid = null;
    },

    render: function (option) {
        var content = Hogan.compile(deptDataGridTmpl).render({
            lang: $.extend({}, lang, {
                migration_button: option.migration_button
            })
        });

        this.$el.html(content);
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

var BoardGridView = BaseGridView.extend({
    initialize: function () {
        this.deptId = this.options.id;
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

    migration: function () {
        var checkedData = this.grid.tables.getCheckedIds(),
            self = this;

        if (!this.checkboxValidate(checkedData)) {
            return;
        }

        $.goOrgSlide({
            header: lang.migration_board,
            type: "department",
            isAdmin: true,
            contextRoot: GO.contextRoot,
            callback: $.proxy(function (info) {
                if (info.type == "root") return;

                if (info.id == self.deptId) {
                    $.goMessage(adminLang["현재부서로이관못함"]);
                    return;
                }

                $.goConfirm(lang.migration_board, GO.i18n(boardLang["게시판 {{arg1}}로 이동"], {"arg1": info.name}), function () {
                    var deptId = info.id,
                        url = GO.contextRoot + 'ad/api/board/transfer/dept/' + deptId;

                    $.ajax({
                        url: url,
                        data: JSON.stringify({ids: checkedData}),
                        type: 'PUT',
                        async: true,
                        dataType: 'json',
                        contentType: "application/json",
                        success: function (resp) {
                            self.reload();
                            $("#layoutContent").trigger("dept_detail:reload");
                            $.goOrgSlide.close();
                            $.goMessage(lang.save_success);
                        }
                    });

                });
            }, this)
        });
    },

    makeGrid: function () {
        var url = GO.contextRoot + "ad/api/department/" + this.deptId + "/boards";
        this.grid = $.goGrid({
            el: this.$("table"),
            method: 'GET',
            url: url,
            emptyMessage: '<p class="data_null"><span class="ic_data_type ic_no_data"></span><span class="txt">' + lang['dept_amounts_empty'] + '</span></p>',
            defaultSorting: [[1, "asc"]],
            pageUse: false,
            sDomUse: false,
            checkbox: true,
            checkboxData: 'id',
            displayLength: 999,
            columns: [
                {mData: 'name', sWidth: '250px', bSortable: true},

                {
                    mData: null, sWidth: '150px', bSortable: false, fnRender: function (obj) {
                        if (obj.aData.status == "ACTIVE") {
                            return lang.normal;
                        } else {
                            return lang.closed;
                        }
                    }
                },

                {
                    mData: null, bSortable: false, fnRender: function (obj) {
                        var owner = obj.aData.owners,
                            sharedDept = undefined;

                        sharedDept = _.filter(owner, function (data) {
                            return data.ownerShip == "JOINT";
                        });

                        if (sharedDept == undefined) {
                            return "";
                        } else {
                            var names = [];
                            $.each(sharedDept, function () {
                                names.push(this.ownerInfo);
                            });
                            return names.join(", ")
                        }

                        return;
                    }
                },

                {
                    mData: 'attachSize', sClass: "align_r", sWidth: '100px', bSortable: true, fnRender: function (obj) {
                        return GO.util.byteToMega(obj.aData.attachSize);
                    }
                }
            ],
            fnDrawCallback: function (tables) {
                $('.dataTables_scroll tr>td:last-child, .dataTables_scroll tr>th:last-child, .dataTables_scrollBody tr:last-child').addClass('last');
            }
        });
    },

    statusFilter: function (e) {
        this.changeFilter(e, "statusFilter");
    },

    changeFilter: function (e, key) {
        var value = $(e.currentTarget).val();
        filterValue = "";

        if (value == "all") {
            filterValue = "";
        } else if (value == "normal") {
            filterValue = "ACTIVE";
        } else {
            filterValue = "CLOSED";
        }

        if (typeof this.grid.tables.setParam == 'function') {
            this.grid.tables.setParam(key, filterValue);
        }
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

    migration: function () {
        var checkedData = this.grid.tables.getCheckedIds(),
            self = this;

        if (!this.checkboxValidate(checkedData)) {
            return;
        }

        $.goOrgSlide({
            type: "department",
            isAdmin: true,
            contextRoot: GO.contextRoot,
            callback: $.proxy(function (info) {
                if (info.type == "root") return;
                var content =
                    '<p class="add">' +
                    GO.i18n(taskLang["폴더 {{arg1}}로 이동"], {arg1: info.name}) +
                    '</p>';

                $.goConfirm(content, "", function () {
                    $.ajax({
                        type: 'PUT',
                        async: true,
                        data: JSON.stringify({ids: checkedData}),
                        dataType: 'json',
                        contentType: "application/json",
                        url: GO.config("contextRoot") + 'ad/api/task/folder/transfer/dept/' + info.id
                    }).done(function (response) {
                        self.reload();
                        $("#layoutContent").trigger("dept_detail:reload");
                        $.goOrgSlide.close();
                    });

                });

            }, this)
        });
    },

    makeGrid: function () {
        var url = GO.contextRoot + 'ad/api/task/department/' + this.deptId + '/folders',
            self = this;

        this.grid = $.goGrid({
            el: this.$("table"),
            method: 'GET',
            url: url,
            emptyMessage: '<p class="data_null"><span class="ic_data_type ic_no_data"></span><span class="txt">' + lang['dept_amounts_empty'] + '</span></p>',
            defaultSorting: [[1, "asc"]],
            pageUse: false,
            sDomUse: false,
            checkbox: true,
            checkboxData: 'id',
            displayLength: 999,
            columns: [
                {mData: 'name', sWidth: '250px', bSortable: true},
                {
                    mData: null, sWidth: '150px', bSortable: false, fnRender: function (obj) {
                        if (obj.aData.closedAt == undefined) {
                            return lang.normal;
                        } else {
                            return lang.closed;
                        }
                    }
                },
                {
                    mData: 'share', bSortable: false, fnRender: function (obj) {
                        var share = obj.aData.share.nodes;
                        sharer = _.filter(share, function (data) {
                            return data.nodeId != self.deptId;
                        }),
                            sharerNames = [];

                        if (sharer.length == 0) {
                            return "";
                        }
                        ;

                        $.each(sharer, function () {
                            sharerNames.push(this.nodeValue);
                        });

                        return sharerNames.join(',');
                    }
                },
                {
                    mData: 'attachSize', sClass: "align_r", sWidth: '100px', bSortable: true, fnRender: function (obj) {
                        return GO.util.byteToMega(obj.aData.attachSize);
                    }
                }
            ],
            fnDrawCallback: function (tables) {
                $('.dataTables_scroll tr>td:last-child, .dataTables_scroll tr>th:last-child, .dataTables_scrollBody tr:last-child').addClass('last');
            }
        });
    },


    statusFilter: function (e) {
        this.changeFilter(e, "statusFilter");
    },

    changeFilter: function (e, key) {
        var value = $(e.currentTarget).val();
        filterValue = "";

        if (value == "all") {
            filterValue = "";
        } else if (value == "normal") {
            filterValue = "LIVE";
        } else {
            filterValue = "STOPPED";
        }

        if (typeof this.grid.tables.setParam == 'function') {
            this.grid.tables.setParam(key, filterValue);
        }
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

    migration: function () {
        var checkedData = this.grid.tables.getCheckedIds(),
            self = this;

        if (!this.checkboxValidate(checkedData)) {
            return;
        }

        $.goOrgSlide({
            header: lang['add_viewer'],
            type: "department",
            isAdmin: true,
            contextRoot: GO.contextRoot,
            callback: $.proxy(function (info) {
                if (info.type == "root") return;
                var ids = this.grid.tables.getCheckedIds();
                content =
                    '<p class="add">' +
                    GO.i18n(reportLang["폴더 이관 경고"], {arg1: info.name}) +
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
                        self.reload();
                        $("#layoutContent").trigger("dept_detail:reload");
                        $.goOrgSlide.close();
                    });

                });
            }, this)
        });
    },

    makeGrid: function () {
        var url = GO.contextRoot + "ad/api/report/department/" + this.deptId + "/folders";

        this.grid = $.goGrid({
            el: this.$("table"),
            method: 'GET',
            url: url,
            emptyMessage: '<p class="data_null"><span class="ic_data_type ic_no_data"></span><span class="txt">' + lang['dept_amounts_empty'] + '</span></p>',
            defaultSorting: [[1, "asc"]],
            pageUse: false,
            sDomUse: false,
            checkbox: true,
            checkboxData: 'id',
            displayLength: 999,
            columns: [
                {mData: 'name', sWidth: '250px', bSortable: true},
                {
                    mData: null, sWidth: '150px', bSortable: false, fnRender: function (obj) {
                        if (obj.aData.status == "ACTIVE") {
                            return lang.normal;
                        } else {
                            return lang.closed;
                        }
                    }
                },
                {
                    mData: null, bSortable: false, fnRender: function (obj) {
                        return "";
                    }
                },
                {
                    mData: 'attachSize', sClass: "align_r", sWidth: '100px', bSortable: true, fnRender: function (obj) {
                        return GO.util.byteToMega(obj.aData.attachSize);
                    }
                }
            ],
            fnDrawCallback: function (tables) {
                $('.dataTables_scroll tr>td:last-child, .dataTables_scroll tr>th:last-child, .dataTables_scrollBody tr:last-child').addClass('last');
            }
        });
    },

    statusFilter: function (e) {
        this.changeFilter(e, "statusFilter");
    },

    changeFilter: function (e, key) {
        var value = $(e.currentTarget).val();
        filterValue = "";

        if (value == "all") {
            filterValue = "";
        } else if (value == "normal") {
            filterValue = "ACTIVE";
        } else {
            filterValue = "INACTIVE";
        }

        if (typeof this.grid.tables.setParam == 'function') {
            this.grid.tables.setParam(key, filterValue);
        }
    }
});

var ApprovalGridView = BaseGridView.extend({
    initialize: function () {
        $.extend(this.events, __super__.events);
        __super__.initialize.apply(this, arguments);
    },

    render: function (option) {
        var content = Hogan.compile(apprDataGridTmpl).render({
            lang: $.extend({}, lang, {
                migration_button: lang.migration_approval,
                moveDeptFolder_button: lang.move_dept_folder
            })
        });

        this.$el.html(content);
        this.makeGrid();

        return this;
    },

    download: function () {
        GO.util.downloadCsvFile("ad/api/approval/deptfolder/download/" + this.deptId);
    },

    moveDeptFolder: function () {
        var deptId = this.deptId;
        var contents = adminLang["해당 화면으로 이동하기 위한 권한이 없습니다."];
        var buttons = [];
        if(this.options.approvalMenuAccessible){
            contents =  adminLang["부서 문서함 관리로 이동하시겠습니까?"];
            buttons = [{
                btext : commonLang["확인"],
                btype : "confirm",
                autoclose : true,
                callback : function() {
                    GO.router.navigate("approval/deptfolder/" + deptId, true);
                }
            }, {
                btext : commonLang["취소"]
            }]
        }

        $.goPopup({
            width : 600,
            title : "",
            pclass : "layer_confim",
            contents : "<p class='q'>"  + contents +  "</p>",
            buttons : buttons
        });
    },

    migration: function () {
        var checkedData = this.grid.tables.getCheckedIds(),
            self = this;

        if (!this.checkboxValidate(checkedData)) {
            return;
        }

        var cancelCallback = function () {
            $.goOrgSlide.close();
        };

        $.goOrgSlide({
            type: "department",
            isAdmin: true,
            contextRoot: GO.contextRoot,
            callback: $.proxy(function (info) {
                if (info.type == "root") return;

                //기본문서함이 포함되어 있는지 확인
                var includeDefaultfolder = false;
                var defaultFolderName = "";
                checkedData.forEach(function (item, i, list) {
                    if (item == "DRAFT" || item == "RECEPTION" || item == "REFERENCE") {
                        if (includeDefaultfolder == true) {
                            defaultFolderName = defaultFolderName.concat(", ");
                        }
                        if (item == 'DRAFT') {
                            defaultFolderName = defaultFolderName.concat(approvalLang['기안 완료함']);
                        } else if (item == 'RECEPTION') {
                            defaultFolderName = defaultFolderName.concat(approvalLang['부서 수신함']);
                        } else if (item == 'REFERENCE') {
                            defaultFolderName = defaultFolderName.concat(approvalLang['부서 참조함']);
                        }
                        includeDefaultfolder = true;
                    }
                });

                if (includeDefaultfolder) {
                    defaultFolderName = GO.i18n(adminLang["<{{arg1}}>은 문서함이 복사 문구"], {arg1: defaultFolderName});
                }

                    $.goConfirm(GO.i18n(adminLang["문서함 {{arg1}}로 이동"], {arg1: info.name}), defaultFolderName, function () {
                        GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
                        $.ajax({
                            type: 'PUT',
                            timeout: 2 * 60 * 60 * 1000,
                            async: true,
                            data: JSON.stringify({stringIds: checkedData}),
                            dataType: 'json',
                            contentType: "application/json",
                            url: GO.config("contextRoot") + 'ad/api/approval/deptfolder/transfer/' + info.id + '/' + self.id
                        }).done(function (response) {
                            self.reload();
                            $("#layoutContent").trigger("dept_detail:reload");
                            $.goOrgSlide.close();
                        }).always(function (result) {
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                        });

                    }, cancelCallback);

            }, this)
        });
    },

    makeGrid: function () {
        var url = GO.contextRoot + 'ad/api/approval/deptallfolder/' + this.deptId;

        this.grid = $.goGrid({
            el: this.$("table"),
            method: 'GET',
            url: url,
            emptyMessage: '<p class="data_null"><span class="ic_data_type ic_no_data"></span><span class="txt">' + lang['dept_amounts_empty'] + '</span></p>',
            defaultSorting: [[1, "asc"]],
            pageUse: false,
            sDomUse: false,
            checkbox: true,
            checkboxData: 'id',
            deptId: 'deptId',
            folderType: 'folderType',
            displayLength: 999,
            columns: [
                {
                    mData: null, sWidth: '250px', bSortable: false, fnRender: function (obj) {
                        return obj.aData.folderName;
                    }
                },
                {
                    mData: null, sClass: "align_r", sWidth: '100px', bSortable: false, fnRender: function (obj) {
                        return obj.aData.docCount || 0;
                    }
                }
            ],
            fnDrawCallback: function (tables) {
                $('.dataTables_scroll tr>td:last-child, .dataTables_scroll tr>th:last-child, .dataTables_scrollBody tr:last-child').addClass('last');
            }
        });
    },


    statusFilter: function (e) {
        this.changeFilter(e, "statusFilter");
    },

    changeFilter: function (e, key) {
        var value = $(e.currentTarget).val();
        filterValue = "";

        if (value == "all") {
            filterValue = "";
        } else if (value == "normal") {
            filterValue = "LIVE";
        } else {
            filterValue = "STOPPED";
        }

        if (typeof this.grid.tables.setParam == 'function') {
            this.grid.tables.setParam(key, filterValue);
        }
    }
});


var GridViewFactory = {};
GridViewFactory.create = function (type, id, approvalMenuAccessible) {

    if (type == "Board") {
        return new BoardGridView({id: id});
    } else if (type == "Task") {
        return new TaskGridView({id: id});
    } else if (type == "Report") { // Report
        return new ReportGridView({id: id});
    } else if (type == "Approval") { // Approval
        return new ApprovalGridView({id: id, approvalMenuAccessible : approvalMenuAccessible});
    } else if (type == "Contact") { // Approval
        return (new ContactView({id: id, __super__: __super__}));
    } else {
        throw new Error("400", "invalid GridViewFactory type");
    }
};

return DeptFile;

});
