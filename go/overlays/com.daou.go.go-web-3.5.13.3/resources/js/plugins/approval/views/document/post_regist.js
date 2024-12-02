(function () {
    define([
            "jquery",
            "backbone",
            "app",

            "i18n!nls/commons",
            "i18n!board/nls/board",
            "hgn!approval/templates/document/post_regist",
            "board/collections/dept_list",
            "board/collections/board_list",
            "board/collections/header_list",
            "attach_file"
        ],

        function (
            $,
            Backbone,
            App,
            commonLang,
            boardLang,
            PostRegistTpl,
            Depts,
            Boards,
            Headers,
            AttachView
        ) {
            var lang = {
                all: commonLang["전체"],
                postTitle: commonLang["제목"],
                content: commonLang["내용"],
                location: commonLang["위치"],
                attach: commonLang["첨부파일"],
                head: boardLang["말머리"],
                selectHeader: boardLang["말머리 선택"],
                board_list_null: boardLang['선택가능한 게시판이 없습니다.']
            };

            var PostRegistView = Backbone.View.extend({

                initialize: function (options) {
                    this.departments = Depts.getDeptList({
                        apiUrl: "/api/board/menu/target/owners"
                    });

                    if (this.departments.options.retry) {
                        _.each(this.departments.models, function (department) {
                            department.attributes.ownerId = department.attributes.id;
                        });
                    }
                    this.boards = Boards.init();
                    this.headers = Headers.init();
                },


                events: {
                    "change #deptId": "fetchBoards",
                    "change #boardId": "fetchHeaders"
                },


                render: function () {
                    var content = this.model.get("document").docBodyContent;
                    var convertedContent = $.goFormUtil.convertViewMode(content);

                    this.$el.html(PostRegistTpl({
                        lang: lang,
                        model: this.model.toJSON(),
                        content: convertedContent,
                        hasAttach: this.model.get("document").attaches.length > 0,
                        hasHead: this.headers.length > 0,
                        headers: this.headers.toJSON()
                    }));

                    this.fetchDepts();

                    AttachView.create("#attachArea", this.model.get("document").attaches, this.model.get("document").id, function (attach, docId) {
                        return GO.contextRoot + "api/approval/document/" + docId + "/download/" + attach.id;
                    });
                },


                fetchDepts: function () {
                    var self = this;

                    return this.departments.fetch({
                        success: function () {
                            self.renderDepartments();
                            self.fetchBoards();
                        }
                    });
                },


                fetchBoards: function () {
                    var self = this;
                    var deptId = this.getCurrentDepartmentId();
                    var dept = this.departments.getDept(deptId);
                    var fetch = null;

                    if (dept.isCompany()) {
                        this.boards.setDeptId(false, null, "Company", "classic");
                        fetch = this.boards.fetch();
                    } else {
                        this.boards.setDeptId(false, deptId, "Department", "classic");
                        fetch = this.boards.fetch();
                    }

                    fetch.done(function () {
                        self.renderBoards();
                        self.fetchHeaders();
                    });
                },


                fetchHeaders: function () {
                    var self = this;
                    var selectedBoardId = this.$("#boardId").val();

                    this.headers.setBoardId(selectedBoardId);
                    this.headers.fetch({
                        success: function () {
                            self.renderHeaders();
                        }
                    });
                },


                renderDepartments: function () {
                    this.$("#deptId").empty();

                    var item = Hogan.compile(
                        '<option value="{{ownerId}}">{{name}}</option>'
                    );

                    _.each(this.departments.models, function (department) {
                        this.$("#deptId").append(item.render(department.toJSON()));
                    }, this);

                },


                renderBoards: function () {
                    this.$("#boardId").empty();

                    var item = Hogan.compile(
                        '<option value="{{id}}">{{name}}</option>'
                    );

                    var writableBoards = this.boards.getWritableBoards();
                    if (writableBoards.length == 0) {
                        var noBoardItem = Hogan.compile('<option value="">{{lang.board_list_null}}</option>');
                        var opt = {lang: lang};
                        this.$("#boardId").append(noBoardItem.render(opt));
                    } else {
                        _.each(writableBoards, function (board) {
                            this.$("#boardId").append(item.render(board.toJSON()));
                        }, this);
                    }

                },


                renderHeaders: function () {
                    this.$("#headerId").find("option").not("option[value=default]").remove();

                    var hasHeader = this.headers.models.length > 0;

                    this.$("#headerArea").toggle(hasHeader);

                    if (!hasHeader) return;

                    var headerItem = Hogan.compile(
                        '<option value="{{id}}">{{name}}</option>'
                    );

                    _.each(this.headers.models, function (header) {
                        this.$("#headerId").append(headerItem.render(header.toJSON()));
                    }, this);

                    this.$("#headerAsterisk").toggle(this.isHeaderRequired());
                },


                submit: function () {
                    var titleArea = this.$("#postTitle");
                    var title = titleArea.val();

                    if (title.length > 100 || title.length < 2) {
                        $.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {
                            arg1: 2,
                            arg2: 100
                        }), titleArea, false, true);
                        return ($.Deferred()).reject();
                    }

                    var boardId = this.getCurrentBoardId();

                    if (_.isEmpty(boardId)) {
                        $.goError(boardLang['게시판을 선택해 주세요.'], this.$('#select_board'), false, true);
                        return ($.Deferred()).reject();
                    }

                    var headerArea = this.$("#headerId");
                    var headerId = headerArea.val();
                    if (this.isHeaderRequired() && headerId == "default") {
                        $.goError(boardLang["말머리를 선택해주세요."], headerArea, false, true);
                        return ($.Deferred()).reject();
                    }

                    var docId = this.model.get("document").id;
                    var data = {
                        "boardId": boardId,
                        "contentType": "HTML",
                        "notiFlag": false,
                        "postId": "",
                        "status": "OPEN",
                        "stickable": false,
                        "title": title,
                        "writeType": "",
                    };

                    if (headerId != "default") {
                        data["headerId"] = headerId;
                    }

                    return $.ajax({
                        type: "POST",
                        url: GO.contextRoot + "api/approval/document/" + docId + "/sendpost",
                        dataType: "json",
                        data: JSON.stringify(data),
                        contentType: "application/json; charset=utf-8",
                        success: function (resp) {
                            $.goMessage(boardLang["게시글이 등록되었습니다."]);
                        },
                        error: function (e) {
                            $.goAlert(e.responseJSON.message);
                            console.log(e);
                        }
                    });
                },


                getCurrentDepartmentId: function () {
                    return this.$("#deptId").val();
                },


                getCurrentBoardId: function () {
                    return this.$("#boardId").val();
                },


                isHeaderRequired: function () {
                    var boardId = this.getCurrentBoardId();
                    var board = this.boards.getBoard(boardId);

                    return board.isHeaderRequired();
                }
            });

            return PostRegistView;
        });

}).call(this);
