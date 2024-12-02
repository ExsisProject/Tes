;(function () {
    define([
            "backbone",
            "hogan",
            "app",

            "i18n!task/nls/task",
            "i18n!nls/commons",
            "task/views/side_folder"
        ],
        function (
            Backbone,
            Hogan,
            App,
            taskLang,
            commonLang,
            SideFolderView
        ) {
            var SideDeptTmpl = Hogan.compile(
                '<p class="title">' +
                '<a>' +
                '<ins class="ic"></ins>' +
                '{{#isShared}}<span class="ic_side ic_shareboard"></span>{{/isShared}}' +
                '<span class="txt" title="{{dept.name}}">{{dept.name}} {{#dept.deleted}} (' + commonLang["삭제된 부서"] + ' ) {{/dept.deleted}}</span>' +
                '</a>' +
                '{{#dept.managable}}' +
                '{{#isDeptList}}' +
                '<span class="btn_wrap">' +
                '<span data-deptId="{{dept.id}}" class="ic_side ic_side_setting" title="{{lang.folderAdmin}}"></span>' +
                '</span>' +
                '{{/isDeptList}}' +
                '{{/dept.managable}}' +
                '</p>' +
                '<ul id="sideFolderList">' +
                '</ul>'
            );


            var SeparatorItemTpl = Hogan.compile(
                '<li class="delimiter">' +
                '<p class="title">' +
                '<ins class="ic"></ins><span class="txt" title="{{name}}">{{name}}</span>' +
                '</p>' +
                '</li>'
            );


            var emptyFolders =
                '<li class="null">' +
                '<p class="title">' +
                '<a><span class="txt">' + taskLang["생성된 업무 폴더가 없습니다."] + '</span></a>' +
                '</p>' +
                '</li>';


            var lang = {
                "folderAdmin": taskLang["폴더 관리"]
            };


            var SideDeptView = Backbone.View.extend({
                tagName: "li",


                events: {
                    "click span[data-deptId]": "goEditDeptFolder"
                },


                initialize: function (options) {
                    this.options = options || {};
                    this.department = this.options.dept;
                    this.isDeptList = this.options.isDeptList;
                },


                render: function () {
                    var dept = this.department.toJSON();
                    var isShared = this.department.get("shared");
                    this.$el.html(SideDeptTmpl.render({
                        lang: lang,
                        dept: dept,
                        isDeptList: this.isDeptList,
                        isShared: isShared
                    }));
                    isShared ? this.$el.addClass("org_share") : this.$el.addClass("org");
                    if (this.isDeptList) this.$el.attr("data-item", "department" + this.department.id);
                    return this;
                },


                renderFolders: function () {
                    var listEl = this.$el.find("#sideFolderList");
                    var folders = this.department.get("folders");

                    if (!folders.length) {
                        listEl.append(emptyFolders);
                    }

                    _.each(folders, function (folder) {
                        if (!folder.deptId) {
                            listEl.append(SeparatorItemTpl.render(folder));
                            return;
                        }
                        var sideFolderView = new SideFolderView({
                            folder: folder,
                            isDeptList: this.isDeptList,
                            department: this.department
                        });
                        listEl.append(sideFolderView.render().el);
                    }, this);
                },


                goEditDeptFolder: function () {
                    var self = this;
                    var callback = function () {
                        GO.util.store.set("taskFolderId", null, {type: "session"});
                        GO.util.store.set("sideItem", "department" + self.department.id, {type: "session"});
                        App.router.navigate("task/dept/" + self.department.id + "/admin", true);
                        $(document).scrollTop(0);
                    };

                    GO.util.editorConfirm(callback);
                }
            });
            return SideDeptView;
        });
}).call(this);