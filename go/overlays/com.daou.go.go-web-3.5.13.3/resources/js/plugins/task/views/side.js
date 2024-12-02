;(function () {
    define([
            "backbone",
            "app",

            "i18n!nls/commons",
            "i18n!task/nls/task",
            "hgn!task/templates/side",
            "task/collections/task_department_folders",
            "models/dept_root",
            "models/dept_tree",
            "task/views/side_dept",
            "task/views/side_folder",
            "favorite",
            "admin/models/task_config",
            "amplify",
            "task/components/task_dept_tree/task_dept_tree",
            "task/models/task_dept_auth"
        ],
        function (
            Backbone,
            App,
            commonLang,
            taskLang,
            SideTmpl,
            TaskDeptFolders,
            DeptRootModel,
            DeptsTreeModel,
            SideDeptView,
            SideFolderView,
            FavoriteView,
            TaskConfigModel,
            Amplify,
            TaskDeptsTree,
            TaskDeptAuthModel
        ) {
            var subDeptFolder = Hogan.compile(
                '<li class="assigned" data-item="subDeptFolder">' +
                '<p class="title">' +
                '<a>' +
                '<ins class="ic"></ins>' +
                '<span class="txt" title="{{lang.subTask}}">{{lang.subTask}}</span>' +
                '</a>' +
                '</p>' +
                '</li>'
            );


            var closedFolder = Hogan.compile(
                '<li class="closed" data-item="closedFolder">' +
                '<p class="title">' +
                '<a>' +
                '<ins class="ic"></ins>' +
                '<span class="txt" title="{{lang.endTask}}">{{lang.endTask}}</span>' +
                '</a>' +
                '</p>' +
                '</li>'
            );


            var lang = {
                "task": commonLang["업무"],
                "newTask": taskLang["새 업무"],
                "orgTaskCondition": taskLang["조직도별 업무현황"],
                "deptFolder": taskLang["부서별 업무 폴더"],
                "addFolder": taskLang["업무 폴더 추가"],
                "subTask": taskLang["하위 부서 업무 폴더"],
                "companyFolder": taskLang["전사 업무 폴더"],
                "emptyDept": taskLang["소속된 부서가 없습니다."],
                "contactAdmin": taskLang["관리자에게 문의하세요."],
                "endTask": taskLang["중지된 업무 폴더"],
                "fold": commonLang["접기"],
                "outspread": commonLang["펼치기"],
                "deletedDept": commonLang["삭제된 부서"]
            };

            var COMPANY_TASK_STORE_KEY = GO.session("loginId") + '-task-company-toggle';

            var DEPT_TASK_STORE_KEY = GO.session("loginId") + '-task-dept-toggle';

            var TASK_DEPTS_TREE_STORE_KEY = GO.session("loginId") + '-task-tree-toggle';

            // 축약형
            var TaskDeptsTreeMenuView = TaskDeptsTree.TaskDeptsTreeMenuView;

            var TaskSideView = Backbone.View.extend({
                el: "#side",

                events: {
                    "click #newTask": "newTaskAction",
                    "click h1[data-tag=fold]": "fold",
                    "click li[data-item=subDeptFolder]": "goSubDeptFolder",
                    "click li[data-item=closedFolder]": "goClosedFolder",
                    "click #side_favorite li[data-item]": "highlightFavorite",
                    "click #createFolderBtn": "goCreateFolder",
                    "click #goTaskHome": "goTaskHome",
                    "click a.node-value": "goTaskCalendar",
                },


                initialize: function () {
                    this.taskDeptTreeView = null;
                    this.deptRoot = new DeptRootModel();
                    this.$el.off(); //  layout side 의 구조상 반드시 필요함
                    this.deptFolders = new TaskDeptFolders({type: "dept"});
                    this.companyFolders = new TaskDeptFolders({type: "public"});
                    this.taskDeptsAuth = new TaskDeptAuthModel(); //조직도별 업무현황 노출 여부

                    this.model = TaskConfigModel.read({admin: false}).toJSON();

                    GO.config("attachNumberLimit", this.model.attachNumberLimit);
                    GO.config("attachSizeLimit", this.model.attachSizeLimit);
                    GO.config("maxAttachNumber", this.model.maxAttachNumber);
                    GO.config("maxAttachSize", this.model.maxAttachSize);
                    GO.config("excludeExtension", this.model.excludeExtension ? this.model.excludeExtension : "");
                    GO.config("priorityTask", this.model.priorityTask);

                },

                render: function () {

                    this.deptRoot.fetch({async: false});
                    this.lastDeptId = (GO.util.store.get("deptTreeId") == null) ? this.deptRoot.id : GO.util.store.get("deptTreeId");
                    this.deptsTree = new DeptsTreeModel({deptId: this.lastDeptId});

                    var fetchDeptFolder = this.deptFolders.fetch();
                    var fetchAllDepts = this.deptsTree.fetch();
                    var fetchCompanyFolder = this.companyFolders.fetch();
                    var getFolderPresent = this.getFolderPresent();
                    var fetchTaskDeptsAuth = this.taskDeptsAuth.fetch();

                    var self = this;
                    $.when(fetchDeptFolder, fetchAllDepts, fetchCompanyFolder, getFolderPresent, fetchTaskDeptsAuth).done(function () {

                        var isTaskDeptVisible = self.taskDeptsAuth.get("true");
                        self.$el.html(SideTmpl({
                            lang: lang,
                            folderPresent: self.deptFolders.folderPresent(),
                            deptPresent: self.deptFolders.deptPresent(),
                            companyFolderPresent: self.companyFolders.deptPresent(),
                            isDeptOpen: self.getStoredCategoryIsOpen(DEPT_TASK_STORE_KEY),
                            isCompanyOpen: self.getStoredCategoryIsOpen(COMPANY_TASK_STORE_KEY),
                            isTreeOpen: self.getStoredCategoryIsOpen(TASK_DEPTS_TREE_STORE_KEY),
                            isDeptTaskPriority: GO.config("priorityTask"),
                            isTaskDeptVisle: isTaskDeptVisible,
                            appName: GO.util.getAppName("task")
                        }));


                        if (isTaskDeptVisible) {
                            var treenode = null;
                            if (self.taskDeptTreeView == null) {
                                treenode = self.deptsTree.toJSON();
                            } else {
                                treenode = self.taskDeptTreeView.taskTreeNodes[0];
                            }

                            self.taskDeptTreeView = self.renderInitTaskTree(treenode);
                            $("#sideTaskDeptTree").append(self.taskDeptTreeView.el);
                        } else {
                            GO.util.store.set("deptTreeId", self.deptRoot.id);
                        }

                        self.renderDeptView(self.deptFolders, $("#sideDeptList"), true);
                        self.renderDeptView(self.companyFolders, $("#companyList"), false);
                        self.renderFavorite();
                        self.renderHighlight();
                    });
                },


                renderHighlight: function () {
                    var item = GO.util.store.get("sideItem");
                    this.$("li[data-item=" + item + "]").find("p:first").addClass("on");
                    GO.util.store.set("sideItem", null, {type: "session"});
                },


                renderFavorite: function () {
                    var self = this;
                    var favoriteView = FavoriteView.create({
                        el: "#side_favorite",
                        url: GO.config("contextRoot") + "api/task/folder/favorite",
                        type: "task",
                        liClass: "task",
                        link: function (model) {
                            return "task/folder/" + model.get("id") + "/task";
                        },
                        overrideDataSet: function (model) {
                            return {
                                id: model.get("id"),
                                name: model.get("name"),
                                newMark: self.isNew(model.get("taskCreatedAt")),
                                privateMark: self.isPrivate(model)
                            };
                        }
                    });

                    favoriteView.$el.on("refresh", function () {
                        favoriteView.reload();
                    });
                },


                getFolderPresent: function () {
                    var self = this;
                    return $.ajax({
                        type: "GET",
                        dataType: "json",
                        url: GO.contextRoot + "api/task/folder/present",
                        success: function (resp) {
                            self.folderPresent = resp.data;
                        },
                        error: function (resp) {
                            $.goError(resp.responseJSON.message);
                        }
                    });
                },


                newTaskAction: function () {
                    var folderId = GO.util.store.get("taskFolderId");
                    var url = "";

                    if (folderId) {
                        url = "task/folder/" + folderId + "/create";
                    } else {
                        url = 'task/create';
                    }

                    var callback = function () {
                        App.router.navigate(url, true);
                    };

                    GO.util.editorConfirm(callback);
                },


                renderDeptView: function (collection, $el, isDeptList) {
                    var self = this;
                    _.each(collection.models, function (dept) {
                        var sideDeptView = new SideDeptView({
                            dept: dept,
                            isDeptList: isDeptList
                        });
                        $el.append(sideDeptView.render().el);
                        sideDeptView.renderFolders();
                    }, this);
                    if (isDeptList) {
                        if (this.folderPresent.stoppedFolders) {
                            $el.append(closedFolder.render({
                                lang: lang
                            }));
                        }

                        if (this.folderPresent.subdeptLiveFolders || this.folderPresent.subdeptStoppedFolders) {
                            $el.append(subDeptFolder.render({
                                lang: lang
                            }));
                        }
                    }
                    ;
                },

                /**
                 * 트리구조의 조직도 렌더링
                 */
                renderInitTaskTree: function (deptModel) {

                    var treeMenuView = new TaskDeptsTreeMenuView({
                        "lastId": this.lastDeptId,
                        "nodes": [deptModel],
                        "deptId": deptModel.data.id,
                        "parentId": (deptModel.data.parentId == null) ? 0 : deptModel.data.parentId
                    });

                    treeMenuView.render();
                    return treeMenuView;
                },


                fold: function (e) {
                    var target = $(e.currentTarget);
                    var type = target.attr("data-type");
                    var btn = target.find("span.ic_side");

                    if (target.hasClass("folded")) {
                        target.removeClass("folded");
                        btn.attr("title", commonLang["접기"]);
                        $("#" + type).slideDown(200);
                    } else {
                        target.addClass("folded");
                        btn.attr("title", commonLang["펼치기"]);
                        $("#" + type).slideUp(200);
                    }

                    var isCompany = target.hasClass("company");
                    var isDept = target.hasClass("org");
                    var isDeptTree = target.hasClass("tree");
                    var isOpen = !target.hasClass("folded");

                    if (isCompany) {
                        this.storeCategoryIsOpen(COMPANY_TASK_STORE_KEY, isOpen);
                    } else if (isDept) {
                        this.storeCategoryIsOpen(DEPT_TASK_STORE_KEY, isOpen);
                    } else if (isDeptTree) {
                        this.storeCategoryIsOpen(TASK_DEPTS_TREE_STORE_KEY, isOpen);
                    }
                },


                goSubDeptFolder: function () {
                    var self = this;
                    var callback = function () {
                        var status = self.folderPresent.subdeptLiveFolders ? "Live" : "Stopped";
                        GO.util.store.set("taskFolderId", null, {type: "session"});
                        GO.util.store.set("sideItem", "subDeptFolder", {type: "session"});
                        App.router.navigate("task/dept/sub/" + status, true);
                        $(document).scrollTop(0);
                    };

                    GO.util.editorConfirm(callback);

                },


                goCreateFolder: function (e) {
                    var callback = function () {
                        GO.util.store.set("taskFolderId", null, {type: "session"});
                        App.router.navigate("task/folder/create", true);
                        $(document).scrollTop(0);
                    };

                    GO.util.editorConfirm(callback);
                },


                goTaskHome: function () {
                    var callback = function () {
                        GO.util.store.set("taskFolderId", null, {type: "session"});
                        App.router.navigate("task", true);
                        $(document).scrollTop(0);
                    };

                    GO.util.editorConfirm(callback);
                },


                goClosedFolder: function (e) {
                    var callback = function () {
                        GO.util.store.set("taskFolderId", null, {type: "session"});
                        GO.util.store.set("sideItem", "closedFolder", {type: "session"});
                        App.router.navigate("task/dept/close", true);
                        $(document).scrollTop(0);
                    };

                    GO.util.editorConfirm(callback);
                },

                /**
                 * 조직도별 업무 현황 항목 클릭시 이벤트 콜백
                 * @param e
                 */
                goTaskCalendar: function (e) {
                    //TODO : psk84 캘린더 UI 연동
                    var deptId = $(e.currentTarget).data("id");
                    GO.util.store.set("deptTreeId", deptId, null);
                    var url = 'task/depts/' + deptId;
                    GO.router.navigate(url, true);

                },

                highlightFavorite: function (e) {
                    var id = $(e.currentTarget).attr("data-id");
                    GO.util.store.set("sideItem", "favorite" + id, {type: "session"});
                },


                isNew: function (taskCreatedAt) {
                    return taskCreatedAt ? GO.util.isCurrentDate(taskCreatedAt, 1) : false;
                },


                getDeptShares: function (share) {
                    return _.filter(share.nodes, function (node) {
                        return _.contains(["department", "subdepartment"], node.nodeType);
                    });
                },


                isPrivate: function (model) {
                    var deptShares = this.getDeptShares(model.get("share"));

                    var myDeptShares = _.find(deptShares, function (dept) {
                        return dept.nodeId == model.get("deptId");
                    }, this);

                    if (!myDeptShares) return false;

                    return myDeptShares.members.length ? true : false;
                },


                getStoredCategoryIsOpen: function (store_key) {
                    var savedCate = '';
                    if (!window.sessionStorage) {
                        savedCate = Amplify.store(store_key);
                    } else {
                        savedCate = Amplify.store.sessionStorage(store_key);
                    }

                    if (savedCate == undefined) {
                        savedCate = true;
                    }

                    return savedCate;
                },

                storeCategoryIsOpen: function (store_key, category) {
                    return Amplify.store(store_key, category, {type: !window.sessionStorage ? null : 'sessionStorage'});
                }
            }, {
                __instance__: null,

                render: function () {
                    if (this.__instance__ === null) {
                        this.__instance__ = new this.prototype.constructor();
                    }
                    this.__instance__.render();
                }
            });
            return TaskSideView;
        });
}).call(this);