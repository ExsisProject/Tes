define("todo/views/menus/todoitem_action", [
        "components/history_menu/main",

        "hgn!todo/templates/menus/menu_items_menu",

        "todo/views/menus/search_member",
        "todo/views/menus/select_label",
        "todo/views/menus/remove_confirm",
        "todo/views/menus/move_card",
        "todo/views/menus/duedate",

        "i18n!todo/nls/todo",
        "i18n!nls/commons",

        "components/go-fileuploader/main",
        "components/go-fileuploader/mobile"

    ],
    function (
        HistoryMenu,
        renderMenuItemsMenu,
        SearchMemberMenuView,
        SelectLabelMenuView,
        RemoveConfirmMenuView,
        MoveCardMenuView,
        DuedateMenuView,
        TodoLang,
        CommonLang,
        FileUploader,
        MobileFileUploader
    ) {

        var TodoActionMenuView,
            HistoriableMenuView = HistoryMenu.HistoriableMenuView,
            menuList = [];

        // TODO: todoitem -> card로 변경
        menuList.push({
            "classname": 'todoitem-members',
            "next_view": '',
            "menu_name": TodoLang["담당자"],
            "icon_class": false,
            "has_child": false
        });
        menuList.push({
            "classname": 'todoitem-labels',
            "next_view": '',
            "menu_name": TodoLang["라벨"],
            "icon_class": false,
            "has_child": false
        });
        menuList.push({
            "classname": 'todoitem-duedate',
            "next_view": '',
            "menu_name": TodoLang["기한일"],
            "icon_class": false,
            "has_child": false
        });
        menuList.push({
            "classname": 'todoitem-attach-file go-fileuploader',
            "next_view": '',
            "menu_name": CommonLang["파일 첨부"],
            "icon_class": false,
            "has_child": false
        });
        if (GO.util.isAndroidApp()) {
            menuList.push({
                "classname": 'todoitem-attach-image go-fileuploader',
                "next_view": '',
                "menu_name": CommonLang["이미지 첨부"],
                "icon_class": false,
                "has_child": false
            });
        }
        if (GO.util.isMobile() && GO.config('isWebFolderAvailable')) {
            menuList.push({
                "classname": 'todoitem-attach-webfolder go-fileuploader',
                "next_view": '',
                "menu_name": CommonLang["자료실"],
                "icon_class": false,
                "has_child": false
            });
        }
        menuList.push({
            "classname": 'move-todoitem',
            "next_view": '',
            "menu_name": CommonLang["이동"],
            "icon_class": false,
            "has_child": false
        });
        menuList.push({
            "classname": 'remove-todoitem',
            "next_view": '',
            "menu_name": CommonLang["삭제"],
            "icon_class": false,
            "has_child": false
        });


        TodoItemActionMenuView = HistoriableMenuView.extend({
            id: 'todoitem-action-menu',
            className: 'content',

            template: renderMenuItemsMenu,

            name: 'todoitem-action-menu',
            title: TodoLang["카드 액션"],

            todoModel: null,

            events: {
                "click .todoitem-members": "_callSearchMemberMenu",
                "click .todoitem-labels": "_callSelectLabelMenu",
                "click .remove-todoitem": "_callRemoveConfirmMenu",
                "click .move-todoitem": "_callMoveCardMenu",
                "click .todoitem-duedate": "_callDuedateMenu"
            },

            initialize: function (options) {
                options = options || {};
                this.todoModel = options.todoModel;
                HistoriableMenuView.prototype.initialize.call(this, options);
            },

            render: function () {
                this.$el.empty().append(this.template({
                    "menulist": menuList
                }));
                this.setMenuClass('layer_todo_board');
                attachFileUploader.call(this);
            },

            _callSearchMemberMenu: function (e) {
                e.preventDefault();
                this.forward(new SearchMemberMenuView({
                    "model": this.model,
                    "todoModel": this.todoModel
                }));
            },

            _callSelectLabelMenu: function (e) {
                var nextView;

                e.preventDefault();
                nextView = new SelectLabelMenuView({"model": this.model, "todoModel": this.todoModel});
                this.forward(nextView);
            },

            _callRemoveConfirmMenu: function (e) {
                var self = this;

                if (!this.todoModel.isMember(GO.session('id'))) {
                    return false;
                }

                e.preventDefault();
                this.forward(new RemoveConfirmMenuView({
                    "subject": TodoLang["카드 삭제 타이틀"],
                    "description": TodoLang["카드 삭제 확인 메시지"],
                    afterClick: function () {
                        self.model.remove().then(function () {
                            self.close();
                        });
                    }
                }));
            },

            _callMoveCardMenu: function (e) {
                var self = this;

                if (!this.todoModel.isMember(GO.session('id'))) {
                    return false;
                }

                e.preventDefault();
                this.forward(new MoveCardMenuView({
                    "model": this.model,
                    "todoModel": this.todoModel
                }));
            },

            _callDuedateMenu: function (e) {
                e.preventDefault();
                this.forward(new DuedateMenuView({
                    "model": this.model
                }));
            }
        });

        function attachFileUploader() {
            var urlList = getFileUploadUrl.call(this);
            var todoItemModel = this.model,
                attachOption = {
                    "url": urlList.fileUrl,
                    "webFolderUrl": urlList.webFolderUrl + "/webfolder",
                    "isToDo": true
                };

            this.$el.find('.todoitem-attach-file a').attr('data-attachtype', 'file');
            if (GO.util.isMobile()) {
                if (GO.util.isMobileApp()) {
                    this.$el.find('.todoitem-attach-image a').attr('data-attachtype', 'image');
                    attachOption.url = this.$el.find('.go-fileuploader a').data('url');
                } else {
                    attachOption.error = function () {
                        alert(CommonLang['업로드에 실패하였습니다.']);

                    };
                }

                attachOption.success = function (resp) {
                    var attachModel = (typeof resp === "string") ? JSON.parse(resp) : resp.data;
                    if (window.target.context.className.indexOf("todoitem-attach-webfolder") > -1) {
                        todoItemModel.addFile((attachModel.data));
                    } else {
                        if (attachModel.hasOwnProperty('data')) {
                            attachModel = attachModel.data;
                        }
                        GO.util.isMobileApp()
                            ? todoItemModel.updateFile(convertToAttachModel(attachModel))
                            : todoItemModel.addFile(attachModel);
                    }
                };
            } else {
                attachOption.success = function (attachModel) {
                    todoItemModel.addFile(attachModel);
                };
                attachOption.error = function (attachModel) {
                    $.goSlideMessage(attachModel, 'caution');
                };
            }

            if (GO.util.isMobile()) {
                MobileFileUploader.bind(this.$el.find('.go-fileuploader a'), attachOption);
            } else {
                FileUploader.bind(this.$el.find('.go-fileuploader a'), attachOption);
            }
        }

        function getFileUploadUrl() {
            var result = {};
            var todoItemModel = this.model;

            result.webFolderUrl = [GO.config('contextRoot') + 'api/todo', todoItemModel.get('todoId'), 'item', todoItemModel.id, 'file'].join('/');
            if (GO.util.isMobileApp()) {
                result.fileUrl = GO.config('contextRoot') + 'api/file';
            } else {
                result.fileUrl = result.webFolderUrl;
            }

            return result;
        }

        function convertToAttachModel(uploadAttachModel) {
            return {
                "name": uploadAttachModel.fileName,
                "size": uploadAttachModel.fileSize,
                "extention": uploadAttachModel.fileExt,
                "path": uploadAttachModel.filePath
            };
        }

        return TodoItemActionMenuView;
    });