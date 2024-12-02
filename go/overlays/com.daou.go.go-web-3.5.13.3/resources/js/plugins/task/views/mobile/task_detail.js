;(function () {
    define([
            "backbone",
            "hogan",
            "app",

            "i18n!nls/commons",
            "i18n!task/nls/task",
            "hgn!task/templates/mobile/task_detail",

            "task/models/task_folder",
            "task/models/task",

            "views/mobile/header_toolbar",
            "attach_file"
        ],
        function (
            Backbone,
            Hogan,
            App,
            commonLang,
            taskLang,
            TaskDetailTmpl,
            TaskFolder,
            Task,
            HeaderToolbarView,
            AttachFilesView
        ) {
            var lang = {
                "move": commonLang["이동"],
                "delete": commonLang["삭제"],
                "list": commonLang["목록"],
                "summary": taskLang["업무 개요"],
                "regist": commonLang["등록"],
                "edit": commonLang["수정"],
                "type": taskLang["유형"],
                "assignee": taskLang["담당자"],
                "dueDate": taskLang["기한"],
                "delay": taskLang["지연"],
                "tag": taskLang["분류"],
                "referer": taskLang["참조자"],
                "detail": taskLang["업무상세"],
                "attach": taskLang["첨부파일"],
                "count": taskLang["개"],
                "save": commonLang["저장"],
                "folder": taskLang["폴더"],
                "emptyValue": taskLang["미지정"],
                "selectFolder": taskLang["업무를 이동시킬 폴더를 선택하세요"],
                "close": commonLang["닫기"],
                "open": commonLang["열기"],
                "activity": taskLang["활동기록"],
                "changeState": taskLang["상태변경"],
                "approver": taskLang["승인자"],
                "notAuthorized": taskLang["열람 권한이 없는 업무입니다"]
            };


            var TaskDetailView = Backbone.View.extend({
                events: {
                    "change #taskAction": "taskAction",
                    "vclick #copyUrl": "copyUrl"
                },

                initialize: function (options) {
                    this.task = new Task(options);
                    this.headerBindEvent();
                },

                headerBindEvent: function () {
                    GO.EventEmitter.off("trigger-action");
                    GO.EventEmitter.on('trigger-action', 'task-activity-write', this.goActivityWrite, this);
                    GO.EventEmitter.on('trigger-action', 'task-activity', this.goActivity, this);
                    GO.EventEmitter.on('trigger-action', 'task-modify', this.goTaskEdit, this);
                    GO.EventEmitter.on('trigger-action', 'task-delete', this.deleteTask, this);
                    GO.EventEmitter.on('trigger-action', 'task-change', this.taskAction, this);
                },

                dataFetch: function () {
                    var self = this;
                    var deferred = $.Deferred();
                    this.task.fetch({
                        success: function (task) {
                            var fetchAction = task.getAction();
                            self.folder = new TaskFolder({id: task.get("folderId")});
                            $.when(fetchAction, self.folder.fetch()).done(function () {
                                deferred.resolve(self);
                            });

                        },
                        error: function (model, resp) {
                            GO.util.linkToErrorPage(resp);
                        }
                    });
                    return deferred;
                },

                render: function () {
                    HeaderToolbarView.render({
                        isPrev: true,
                        actionMenu: this.getUseMenus()
                    });

                    var taskData = {
                        content: GO.util.escapeXssFromHtml(this.task.get('content')),
                        lang: lang,
                        folder: this.folder.toJSON(),
                        data: $.extend(this.task.toJSON(), {}),
                        createdAt: GO.util.basicDate(this.task.get("createdAt")),
                        hasDueDate: !_.isEmpty(this.task.getBeginDate()) || !_.isEmpty(this.task.getDueDate()),
                        beginDate: this.task.getBeginDate(),
                        dueDate: this.task.getDueDate(),
                        tagLabel: this.task.getTagLabel()
                    };
                    this.$el.addClass("go_renew");
                    this.$el.html(TaskDetailTmpl(taskData));
                    this.$("#taskContent").css("overflow-x", "auto");
                    this.renderApproverView();
                    this.renderFieldView();
                    this.renderAttachView();
                    return this;
                },

                getUseMenus: function () {
                    var useMenuList = [];
                    var menus = {
                        "활동기록등록": {
                            id: 'task-activity-write',
                            text: taskLang["활동기록"],
                            triggerFunc: 'task-activity-write'
                        },
                        "활동기록": {
                            id: 'task-activity',
                            text: taskLang["활동기록"],
                            cls: 'btn_comments',
                            triggerFunc: 'task-activity'
                        },
                        "수정": {
                            id: 'task-modify',
                            text: commonLang["수정"],
                            triggerFunc: 'task-modify',
                            inMoreBtn: true
                        },
                        "삭제": {
                            id: 'task-delete',
                            text: commonLang["삭제"],
                            triggerFunc: 'task-delete',
                            inMoreBtn: true
                        },
                    };

                    if (this.task.hasAction()) {
                        useMenuList.push(
                            {
                                selectId: 'taskAction',
                                text: taskLang["상태변경"],
                                selectTriggerFunc: 'task-change'
                            }
                        );
                        this.task.actions.forEach(function (action) {
                            useMenuList.push(
                                {
                                    selectId: 'taskAction',
                                    id: action.id,
                                    text: action.name
                                }
                            );
                        });
                    }
                    var data = this.task.toJSON();
                    if (!this.task.hasActivity()) {
                        useMenuList.push(menus.활동기록등록);
                    } else {
                        menus.활동기록.commentsCount = data.activityCount;
                        useMenuList.push(menus.활동기록);
                    }
                    if (data.actions.updatable) {
                        useMenuList.push(menus.수정);
                    }
                    if (data.actions.removable) {
                        useMenuList.push(menus.삭제);
                    }

                    return useMenuList;
                },

                renderApproverView: function () {
                    if (!this.task.get("issueType").approver) return;
                    this.makeApproverView();
                },

                makeApproverView: function () {
                    var approver = this.task.get("approver");
                    if (!approver) return;
                    var label = [approver.name, approver.position].join(" ");
                    var html =
                        '<tr id="approver">' +
                        '<th><span class="title">' + taskLang["승인자"] + '</span></th>' +
                        '<td><span class="txt">' + label + '</span></td>' +
                        '</tr>';
                    $("tr#approver").replaceWith(html);
                },

                renderFieldView: function () {
                    var folderFields = this._getFields(this.folder.get("fields")).join("");
                    var typeFields = this._getFields(this.task.get("issueType").fields).join("");
                    $("#fieldArea").replaceWith(folderFields.concat(typeFields));
                },

                _getFields: function (collection) {
                    var fieldEls = [];
                    _.each(collection, function (field) {
                        if (field.type == "SELECT") {
                            fieldEls.push(this.makeSelectField(field));
                        } else if (field.type == "BOOLEAN") {
                            fieldEls.push(this.makeBooleanField(field));
                        } else if (field.type == "TEXT") {
                            fieldEls.push(this.makeTextField(field));
                        } else {
                            return;
                        }
                    }, this);
                    return fieldEls;
                },

                makeSelectField: function (field) {
                    var taskFieldValue = this._getTaskFieldValue(field);
                    var html =
                        '<dt><span class="txt">{{field.name}}</span></dt>' +
                        '<dd>{{taskFieldValue.value}}</dd>';

                    return Hogan.compile(html).render({
                        field: field,
                        taskFieldValue: taskFieldValue
                    });
                },

                makeBooleanField: function (field) {
                    var taskFieldValue = this._getTaskFieldValue(field);
                    var html =
                        '<dt><span class="txt">{{field.name}}</span></dt>' +
                        '<dd>' +
                        '<input type="checkbox" {{#taskFieldValue}}checked{{/taskFieldValue}} disabled>' +
                        '<label>{{field.message}}</label>' +
                        '</dd>';

                    return Hogan.compile(html).render({
                        field: field,
                        taskFieldValue: GO.util.toBoolean(taskFieldValue.value)
                    });
                },

                makeTextField: function (field) {
                    var taskFieldValue = this._getTaskFieldValue(field);
                    if (!taskFieldValue || !taskFieldValue.value) return "";
                    var html =
                        '<dt><span class="txt">{{field.name}}</span></dt>' +
                        '<dd>{{taskFieldValue.value}}</dd>';

                    return Hogan.compile(html).render({
                        field: field,
                        taskFieldValue: taskFieldValue
                    });
                },

                _getTaskFieldValue: function (field) {
                    return _.find(this.task.get("fieldValues"), function (fieldValue) {
                        return fieldValue.fieldId == field.id;
                    });
                },

                renderAttachView: function () {
                    var self = this;
                    this.attachView = AttachFilesView.create('#attachArea', this.task.get("attaches"), function (item) {
                        return GO.config("contextRoot") + "api/task/" + self.task.id + "/download/" + item.id;
                    });
                },

                taskAction: function (e) {
                    var self = this;
                    var actionId = $("#taskAction").val();
                    if (!actionId) return;
                    $.ajax({
                        type: "PUT",
                        dataType: "json",
                        url: GO.contextRoot + "api/task/" + this.task.get("id") + "/action/" + actionId,
                        success: function (resp) {
                            self.task.fetch({
                                success: function (task) {
                                    task.getAction().done(function () {
                                        self.render();
                                        alert(commonLang["변경되었습니다."]);
                                    });
                                }
                            });
                        }
                    });
                },

                goTaskEdit: function () {
                    if (/<.*>.*<\/.*>/.test(this.task.get("content"))) {
                        alert(taskLang["PC에서 등록한 업무는 모바일에서 수정할 수 없습니다."]);
                        return;
                    }
                    App.router.navigate("task/" + this.task.get("id"), true);
                },

                goActivityWrite: function () {
                    App.router.navigate("task/" + this.task.id + "/create", true);
                },

                goActivity: function () {
                    App.router.navigate("task/" + this.task.id + "/activities", true);
                },

                deleteTask: function () {
                    var self = this;

                    if (confirm(GO.util.unescapeHtml(taskLang["업무 삭제 설명"]))) {
                        this.task.destroy().done(function () {
                            App.router.navigate("task/folder/" + self.folder.get("id") + "/task", true);
                        });
                    }
                },

                copyUrl: function (e) {
                    GO.util.copyUrl(e);
                },
            });
            return TaskDetailView;
        });
}).call(this);