;(function () {
    define([
            "backbone",
            "hogan",
            "app",

            "i18n!task/nls/task",

            "task/models/task_folder"
        ],
        function (
            Backbone,
            Hogan,
            App,
            taskLang,
            TaskFolder
        ) {
            var SideFolderTmpl = Hogan.compile(
                '<p class="title">' +
                '<a>' +
                '<ins class="ic"></ins>' +
                '{{#isPrivate}}' +
                '<span class="ic_side ic_private"></span>' +
                '{{/isPrivate}}' +
                '<span class="txt" title="{{folder.name}}">{{folder.name}}</span>' +
                '</a>' +
                '{{#isNew}}' +
                ' <span class="ic_classic ic_new2"></span>' +
                '{{/isNew}}' +
                '{{#folder.actions.managable}}' +
                '{{#isDeptList}}' +
                '<span class="btn_wrap">' +
                '<span data-id="{{folder.id}}" class="ic_side ic_side_setting" title="{{lang.folderSetting}}"></span>' +
                '</span>' +
                '{{/isDeptList}}' +
                '{{/folder.actions.managable}}' +
                '</p>'
            );
            var lang = {
                "folderSetting": taskLang["폴더 설정"]
            };


            var SideFolderView = Backbone.View.extend({
                tagName: "li",


                events: {
                    "click p": "goListFolder",
                    "click span[data-id]": "goEditFolder"
                },


                initialize: function (options) {
                    this.options = options || {};
                    this.folder = new TaskFolder(this.options.folder);
                    this.isDeptList = this.options.isDeptList;
                    this.department = this.options.department;
                    this.type = this.isDeptList ? "departmentFolder" : "companyFolder";
                },


                render: function () {
                    this.$el.html(SideFolderTmpl.render({
                        lang: lang,
                        folder: this.folder.toJSON(),
                        isNew: this.folder.isNews(),
                        isDeptList: this.isDeptList,
                        isPrivate: this.folder.isPrivate()
                    }));
                    !this.department.get("shared") && this.folder.isShare() ? this.$el.addClass("task_share") : this.$el.addClass("task");
                    this.$el.attr("data-item", this.type + this.folder.id);

                    return this;
                },


                goListFolder: function () {
                    var self = this;
                    var callback = function () {
                        GO.util.store.set("taskFolderId", null, {type: "session"});
                        GO.util.store.set("sideItem", self.type + self.folder.id, {type: "session"});
                        App.router.navigate("task/folder/" + self.folder.id + "/task", true);
                        $(document).scrollTop(0);
                    };

                    GO.util.editorConfirm(callback);
                },


                goEditFolder: function (e) {
                    var self = this;
                    var callback = function () {
                        e.stopPropagation();
                        GO.util.store.set("taskFolderId", null, {type: "session"});
                        GO.util.store.set("sideItem", self.type + self.folder.id, {type: "session"});
                        App.router.navigate("task/folder/" + self.folder.id, true);
                        $(document).scrollTop(0);
                    };

                    GO.util.editorConfirm(callback);
                }
            });
            return SideFolderView;
        });
}).call(this);