;(function () {
    define([
            "views/mobile/m_more_list",
            "backbone",
            "app",

            "i18n!nls/commons",
            "i18n!task/nls/task",
            "hgn!task/templates/mobile/home",
            "task/collections/todos",
            "views/mobile/header_toolbar",
            "jquery.go-preloader"
        ],
        function (
            MoreView,
            Backbone,
            App,
            commonLang,
            taskLang,
            HomeTmpl,
            Todos,
            HeaderToolbarView
        ) {
            var lang = {
                "myTodo": taskLang["나의 업무"],
                "count": taskLang["건"],
                "total": taskLang["총"],
                "all": commonLang["전체"],
                "assign": taskLang["담당"],
                "approve": taskLang["승인"],
                "refer": taskLang["참조"],
                "request": taskLang["등록"],
                "showMore": taskLang["더 보기"],
                "prev": taskLang["이전"],
                "next": taskLang["다음"],
                "activity": taskLang["활동기록"],
                "empty": taskLang["미지정"]
            };


            var emptyList =
                '<li class="creat data_null"><span class="txt_ellipsis">' +
                taskLang["등록된 업무가 없습니다."] +
                '</span></li>';


            var TodoItemTmpl = Hogan.compile(
                '<li class="{{^isRead}}read_no{{/isRead}}" id="{{task.id}}" data-type="task" data-list-id="{{task.id}}">' +
                '<a class="tit" data-list-id="{{task.id}}">' +
                '<span class="state etc">{{task.status.name}}</span>' +
                '<span class="subject">' +
                '{{#isPrivate}}' +
                '<span class="ic ic_lock"></span>' +
                '{{/isPrivate}}' +
                '<span class="title">{{task.name}}</span>' +
                '</span>' +
                '<span class="info">' +
                '<span class="reporter txt_ellipsis">' +
                '{{#assignee}}{{assigneeLabel}}{{/assignee}}' +
                '{{^assignee}}{{lang.empty}}{{/assignee}}' +
                '</span>' +
                '<span class="part">|</span>' +
                '{{#hasDueDate}}' +
                '<span class="date {{#isDelay}}delay{{/isDelay}}">{{dueDate}}</span>' +
                '<span class="part">|</span>' +
                '{{/hasDueDate}}' +
                '<span class="category txt_ellipsis">{{task.folderName}}</span>' +
                '<span class="part">|</span>' +
                '<span class="activity">' +
                '<span class="txt_b">{{lang.activity}} </span>' +
                '<span class="num">{{task.activityCount}}</span>' +
                '</span>' +
                '</span>' +
                '</a>' +
                '</li>'
            );


            var TaskHomeView = MoreView.extend({
                el: "#content",


                events: {
                    "vclick #taskTypes li": "tab",
                    "vclick li[data-type=task]": "goTaskDetail",
                },


                initialize: function () {
                    this.$el.off();
                    GO.util.appLoading(true);
                    this.todos = new Todos({type: "associated"});
                    this.$el.html(HomeTmpl({
                        lang: lang
                    }));
                    var renderListFunc = {
                        listFunc: $.proxy(function (collection) {
                            this.renderTodos(collection);
                        }, this),
                        emptyListFunc: $.proxy(function () {
                            this.$("#todoList").append(emptyList);
                            this.$("#moreTodos").remove();
                        }, this)
                    };
                    this.setRenderListFunc(renderListFunc);
                    var dataSet = {};
                    this.setFetchInfo(dataSet, this.todos);
                },

                render: function () {
                    setTimeout(function () {
                        GO.util.pageDone();
                    }, 500);
                    this.dataFetch()
                        .done($.proxy(function (collection) {
                            if (collection.isEmpty()) {
                                this.renderListFunc.emptyListFunc();
                            } else {
                                this.renderListFunc.listFunc(collection);
                                this.scrollToEl();
                            }
                        }, this));

                    HeaderToolbarView.render({
                        title: taskLang['업무'],
                        isList: true,
                        isSideMenu: true,
                        isHome: true,
                        isSearch: true,
                        isWriteBtn: true,
                        writeBtnCallback: function () {
                            App.router.navigate("task/create", {trigger: true, pushState: true});
                        }
                    });
                    GO.util.appLoading(false);

                    return this;
                },

                renderTodos: function (collection) {

                    _.each(collection.models, function (task) {
                        this.$("#todoList").append(TodoItemTmpl.render({
                            lang: lang,
                            task: task.toJSON(),
                            dueDate: task.getDueDate(),
                            hasDueDate: task.hasDueDate(),
                            activityFlag: task.hasActivity(),
                            assignee: task.firstAssignee(),
                            assigneeLabel: task.assigneeLabel(taskLang["외"], commonLang["명"]),
                            isPrivate: task.get("privateTask"),
                            isDelay: task.get("delay"),
                            isRead: task.get("read")
                        }));
                    }, this);

                },


                tab: function (e) {
                    var target = $(e.currentTarget);
                    var type = target.attr("data-type");

                    if (this.pageType == type) return;

                    this.$("#taskTypes").find("li").removeClass("on");
                    target.addClass("on");
                    this.$("#todoList").find("li").remove();
                    this.renderTaskByType(type);
                    this.pageType = type;
                    this.setCurrentPage();
                },


                renderTaskByType: function (type) {

                    this.todos.setType(type);
                    this.todos.setPage(0);
                    this.dataFetch()
                        .done($.proxy(function (collection) {
                            if (collection.isEmpty()) {
                                this.renderListFunc.emptyListFunc();
                            } else {
                                this.renderListFunc.listFunc(collection);
                            }
                        }, this));
                },


                goTaskDetail: function (e) {
                    this.setSessionInfo(e);
                    var taskId = e.currentTarget.getAttribute("id");
                    App.router.navigate("task/" + taskId + "/detail", true);
                },

                setCurrentPage: function () {
                    var pageInfo = this.todos.getPageInfo();
                    $("#todoCurrent").text(pageInfo.firstIndex);
                    $("#todoMax").text(pageInfo.lastIndex);
                }
            });
            return TaskHomeView;
        });
}).call(this);