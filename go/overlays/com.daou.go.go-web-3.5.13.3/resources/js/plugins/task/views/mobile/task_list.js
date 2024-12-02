;(function () {
    define([
            "views/mobile/m_more_list",
            "backbone",
            "hogan",
            "app",

            "i18n!nls/commons",
            "i18n!task/nls/task",
            "task/collections/tasks",
            "task/models/task_folder",
            "views/mobile/header_toolbar"

//	        "backbone.touch"
        ],
        function (
            MoreView,
            Backbone,
            Hogan,
            App,
            commonLang,
            taskLang,
            Tasks,
            TaskFolder,
            HeaderToolbarView
        ) {
            var lang = {
                "total": taskLang["총"],
                "count": taskLang["건"],
                "addr": taskLang["폴더 주소"],
                "copy": commonLang["복사"],
                "showShareInfo": taskLang["공개/공유 현황 보기"],
                "admin": taskLang["운영자"],
                "state": taskLang["상태"],
                "title": commonLang["제목"],
                "dueDate": taskLang["기한"],
                "assignee": taskLang["담당자"],
                "activity": taskLang["활동기록"],
                "prev": taskLang["이전"],
                "next": taskLang["다음"],
                "notReadable": taskLang["열람 권한이 없는 업무입니다"],
                "empty": taskLang["미지정"]
            };


            var TaskListTmpl = Hogan.compile(
                '<div class="content">' +
                '<ul id="taskList" class="list_normal list_task" data-type="list">' +
                '</ul>' +
                '</div>'
            );


            var emptyList =
                '<li class="creat data_null">' +
                '<span class="subject">' +
                '<span class="txt_ellipsis">' + taskLang["목록이 없습니다"] + '</span>' +
                '</span>' +
                '</li>';


            var TaskItemTmpl = Hogan.compile(
                '{{#isReadable}}' +
                '<li class="{{^isRead}}read_no{{/isRead}}" data-id="{{task.id}}" data-type="task"  data-list-id="{{task.id}}">' +
                '<a href="javascript:;" class="tit" data-list-id="{{task.id}}">' +
                '<span class="state {{#isEnd}}finished{{/isEnd}} {{^isEnd}}etc{{/isEnd}}">{{task.status.name}}</span>' +
                '<span class="subject">' +
                '<span class="title">{{task.name}}</span>' +
                '</span>' +
                '<span class="info">' +
                '<span class="reporter txt_ellipsis">' +
                '{{#assignee}}{{assigneeLabel}}{{/assignee}}' +
                '{{^assignee}}{{lang.empty}}{{/assignee}}' +
                '</span>' +
                '<span class="part">|</span>' +
                '{{#hasBeginDate}}' +
                '<span class="date">{{beginDate}}</span>' +
                '{{/hasBeginDate}}' +
                '{{#hasDate}}~{{/hasDate}}' +
                '{{#hasDueDate}}' +
                '<span class="date {{#isDelay}}delay{{/isDelay}}">{{dueDate}}</span>' +
                '{{/hasDueDate}}' +
                '{{#hasDate}}<span class="part">|</span>{{/hasDate}}' +
                '<span class="activity">' +
                '<span class="txt_b">{{lang.activity}} </span>' +
                '<span class="num">{{task.activityCount}}</span>' +
                '</span>' +
                '</span>' +
                '</a>' +
                '</li>' +
                '{{/isReadable}}' +
                '{{^isReadable}}' +
                '<li data-id="null">' +
                '<a class="tit">' +
                '<span class="subject">' +
                '<span class="ic ic_lock"></span>' +
                '<span class="title">{{lang.notReadable}}</span>' +
                '</span>' +
                '</a>' +
                '</li>' +
                '{{/isReadable}}'
            );

            var TaskListView = MoreView.extend({
                el: "#content",

                unbindEvent: function () {
                    this.$el.off('vclick', "a[data-tag='createTaskBtn']");
                    this.$el.off('vclick', "li[data-type='task']");
                },
                bindEvent: function () {
                    this.$el.on('vclick', "a[data-tag='createTaskBtn']", $.proxy(this.goCreateTask, this));
                    this.$el.on('vclick', "li[data-type='task']", $.proxy(this.goTaskDetail, this));
                },

                initialize: function (options) {
                    this.options = options;
                    this.$el.off();
                    this.tasks = new Tasks([], {
                        folderId: this.options.id
                    });
                    this.folder = new TaskFolder(this.options);

                    var renderListFunc = {
                        listFunc: $.proxy(function (collection) {
                            this.folder.fetch({
                                success: function (folder) {
                                    folder.getDepartment().done(function (resp) {
                                        self.department = resp.data;
                                    });
                                }
                            });
                            this.renderList(collection);
                        }, this),
                        emptyListFunc: $.proxy(function () {
                            this.$("#taskList").append(emptyList);
                        }, this)
                    };
                    this.setRenderListFunc(renderListFunc);
                    var dataSet = {
                        keyword: this.keyword,
                        property: this.property,
                        direction: this.direction,
                        searchType: this.searchType
                    };
                    this.setFetchInfo(dataSet, this.tasks);
                },

                render: function () {
                    this.unbindEvent();
                    var self = this;
                    HeaderToolbarView.render({
                        title: this.folder.get("name"),
                        isList: true,
                        isSideMenu: true,
                        isHome: true,
                        isSearch: true,
                        isWriteBtn: true,
                        writeBtnCallback: function () {
                            App.router.navigate("task/folder/" + self.folder.id + "/create", {
                                trigger: true,
                                pushState: true
                            });
                        }
                    });

                    this.$el.addClass("go_renew");
                    this.$el.html(TaskListTmpl.render({
                        lang: lang,
                        list: this.tasks.toJSON(),
                        folder: this.folder.toJSON(),
                        dept: this.department,
                        adminLabel: this.folder.adminLabel()
                    }));
                    this.dataFetch()
                        .done($.proxy(function (collection) {
                            if (collection.isEmpty()) {
                                this.renderListFunc.emptyListFunc();
                            } else {
                                this.renderListFunc.listFunc(collection);
                                this.scrollToEl();
                            }
                        }, this));
                    this.bindEvent();
                    return this;
                },


                goCreateTask: function () {
                    App.router.navigate("task/folder/" + this.folder.get("id") + "/create", true);
                },


                goTaskDetail: function (e) {
                    this.setSessionInfo(e);
                    var taskId = e.currentTarget.getAttribute("data-id");
                    App.router.navigate("task/" + taskId + "/detail", true);
                },


                renderList: function (collection) {
                    _.each(collection.models, function (task) {
                        this.$("#taskList").append(TaskItemTmpl.render({
                            lang: lang,
                            task: task.toJSON(),
                            assignee: task.firstAssignee(),
                            assigneeLabel: task.assigneeLabel(taskLang["외"], commonLang["명"]),
                            isReadable: task.get("actions").readable,
                            hasDate: task.hasBeginDate() || task.hasDueDate(),
                            hasBeginDate: task.hasBeginDate(),
                            beginDate: task.getBeginDate(),
                            hasDueDate: task.hasDueDate(),
                            dueDate: task.getDueDate(),
                            isDelay: task.get("delay"),
                            isRead: task.get("read"),
                            isEnd: task.get("status").end
                        }));
                    }, this);
                }
            });
            return TaskListView;
        });
}).call(this);