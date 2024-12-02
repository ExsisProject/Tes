define("todo/views/site/card_detail", [
        "backbone",
        "app",

        "todo/views/site/card_activity_list",
        "todo/views/site/edit_text_form",
        "todo/views/menus/main",
        "todo/libs/util",

        "hgn!todo/templates/add_checklistitem_form",
        "hgn!todo/templates/todo_card_content",
        "text!todo/templates/partials/_member_button.html",
        "text!todo/templates/partials/_user_thumbnail.html",

        "i18n!nls/commons",
        "i18n!todo/nls/todo",

        "components/go-fileuploader/main",
        "components/go-fileuploader/mobile",

        "libs/go-utils",

        "jquery.go-validation",
        "jquery.go-popup",
        "jquery.fancybox-buttons",
        "jquery.fancybox-thumbs",
        "jquery.fancybox",
        'go-fancybox'
    ],

    function (
        Backbone,
        GO,
        CardActivityListView,
        EditTextFormView,
        TodoMenus,
        TodoUtil,
        renderAddChecklistitemForm,
        renderTodoCardContent,
        memberButuonTpl,
        userThumbnailTpl,
        CommonLang,
        TodoLang,
        FileUploader,
        MobileFileUploader,
        CommonUtil
    ) {

        var lang = { 'copy_url': CommonLang['URL 복사'] };

        var CardDetailView,
            CardTitleEditFormView,
            CardDescEditFormView,
            ChecklistTitleEditFormView,
            ChecklistItemFormView,
            ChecklistItemAddFormView,
            ChecklistItemEditFormView;

        // this.model = todoItemModel
        CardTitleEditFormView = EditTextFormView.extend({
            initialize: function (options) {
                options = options || {};
                options.content = GO.util.unescapeHtml(this.model.get('title'));
                this.name = 'card-title-edit-form-' + this.model.id;
                EditTextFormView.prototype.initialize.call(this, options);
            },

            _confirm: function (e) {
                var self = this,
                    title = this.getValue();

                if (!$.goValidation.isCheckLength(1, 1000, title)) {
                    $.goMessage(GO.i18n(CommonLang["0자이상 0이하 입력해야합니다."], {arg1: 1, arg2: 1000}));
                    this.$el.find('textarea').focus();
                    return false;
                }

                e.preventDefault();
                this.model.updateTitle(title).then(function (todoItemModel) {
                    self.remove();
                    self.afterConfirm.call(self, todoItemModel);
                });
            }
        });

        CardDescEditFormView = EditTextFormView.extend({
            initialize: function (options) {
                options = options || {};
                options.content = GO.util.unescapeHtml(this.model.get('content'));
                options.enterNewLine = true;
                options.autoExpand = true;
                options.removable = true;

                this.name = 'card-desc-edit-form-' + this.model.id;
                EditTextFormView.prototype.initialize.call(this, options);
            },

            _confirm: function (e) {
                var self = this,
                    content = this.getValue();

                e.preventDefault();
                this.model.updateContent(content).then(function (todoItemModel) {
                    self.remove();
                    self.afterConfirm.call(self, todoItemModel);
                });
            },

            _destroy: function (e) {
                var self = this,
                    todoItemModel = this.model;

                e.preventDefault();
                TodoMenus.attachTo($(e.currentTarget), new TodoMenus.RemoveConfirmMenuView({
                    subject: TodoLang["카드 상세내용 삭제 확인 타이틀"],
                    description: TodoLang["카드 상세내용 삭제 확인 메시지"],
                    afterClick: function () {
                        var menuView = this;
                        todoItemModel.updateContent('').then(function (todoItemModel) {
                            self.remove();
                            self.afterRemove.call(self, todoItemModel);
                            menuView.back();
                        });
                    }
                }));
            }
        });

        ChecklistTitleEditFormView = EditTextFormView.extend({
            checklist: null,
            initialize: function (options) {
                options = options || {};
                this.checklist = this.model.getChecklist(options.checklistId);
                options.content = GO.util.unescapeHtml(this.checklist.title);
                this.name = 'checklist-title-edit-form-' + this.model.id;
                EditTextFormView.prototype.initialize.call(this, options);
            },

            _confirm: function (e) {
                var self = this,
                    content = this.getValue();

                if (!$.goValidation.isCheckLength(1, 1000, content)) {
                    $.goMessage(GO.i18n(CommonLang["0자이상 0이하 입력해야합니다."], {arg1: 1, arg2: 1000}));
                    this.$el.find('textarea').focus();
                    return false;
                }

                e.preventDefault();
                this.model.updateChecklistTitle(this.checklist.id, content).then(function (checklistModel) {
                    self.remove();
                    self.afterConfirm.call(self, self);
                });
            }
        });

        ChecklistItemFormView = EditTextFormView.extend({
            className: 'checklist-item-addform check_item',
            checklist: null,
            template: renderAddChecklistitemForm,

            events: function () {
                var superEvents = _.result(EditTextFormView.prototype, 'events') || {};

                return _.extend({}, superEvents, {
                    "focus .checklist-item-text": "_showActionBtn",
                    "submit #form-checklist-item": "_confirm"
                });
            },

            initialize: function (options) {
                options = options || {};
                options.templateVariables = $.extend(true, {}, {
                    "label": {
                        "add_checklist_item": TodoLang["항목 입력"]
                    }
                }, options.templateVariables || {});

                this.name = 'checklist-item-form-' + this.model.id;
                this.checklist = this.model.getChecklist(options.checklistId);

                EditTextFormView.prototype.initialize.call(this, options);
            },

            getValue: function () {
                return CommonUtil.stripIllegalTags(this.$el.find('input[name=title]').val());
            },

            _showActionBtn: function (e) {
                this.$el.find('.checklist-item-actions').show();
            }
        });

        ChecklistItemAddFormView = ChecklistItemFormView.extend({

            initialize: function (options) {
                options = options || {};
                this.name = 'checklist-item-add-form-' + this.model.id;
                ChecklistItemFormView.prototype.initialize.call(this, options);
            },

            _confirm: function (e) {
                var self = this,
                    content = this.getValue();

                if (!$.goValidation.isCheckLength(1, 1000, content)) {
                    $.goMessage(GO.i18n(CommonLang["0자이상 0이하 입력해야합니다."], {arg1: 1, arg2: 1000}));
                    this.$el.find('textarea').focus();
                    return false;
                }

                e.preventDefault();

                this.model.addChecklistItem(this.checklist.id, content).then(function (checklistItemModel) {
                    self.confirm(self);
                });
            }
        });

        ChecklistItemEditFormView = ChecklistItemFormView.extend({

            initialize: function (options) {
                options = options || {};
                this.name = 'checklist-item-edit-form-' + this.model.id;
                this.checklistItemId = options.checklistItemId;
                ChecklistItemFormView.prototype.initialize.call(this, options);
            },

            _confirm: function (e) {
                var self = this,
                    content = this.getValue();

                if (!$.goValidation.isCheckLength(1, 1000, content)) {
                    $.goMessage(GO.i18n(CommonLang["0자이상 0이하 입력해야합니다."], {arg1: 1, arg2: 1000}));
                    this.$el.find('textarea').focus();
                    return false;
                }

                e.preventDefault();

                this.model.updateChecklistItemTitle(this.checklist.id, this.checklistItemId, content).then(function (checklistItemModel) {
                    self.confirm(self);
                });
            }
        });

        CardDetailView = Backbone.View.extend({
            className: "ui-todocard-container overlay_scroll",
            categoryModel: null,
            subViews: {},
            events: {
                "click .ui-card-title h1": "_callCardTitleEditForm",
                "click .btn-edit-content": "_callCardDescEditForm",
                "click .ui-card-content": "_callCardDescEditForm",
                "click .ui-card-content a": "_stopPropagation",
                "click .btn-close": "_close",
                "click .btn-add-member": "_callSearchMemberMenu",
                "click .btn-duedate": "_callDuedateMenu",
                "click .btn-add-checklist": "_addChecklist",
                "click .btn-edit-label": "_callSelectLabelMenu",
                "click .btn-card-move": "_callMoveCardMenu",
                "click .btn-card-remove": "_callRemoveCardConfirmMenu",
                "click .ui-user-photo": "_callMemberProfileMenu",
                "click .ui-checklist-container h2": "_callChecklistTitleEditForm",
                "click .btn-checklist-remove": "_callRemoveChecklistConfirmMenu",
                "click .btn-add-checklist-item": "_callChecklistItemAddForm",
                "click .ui-checklist-item-text": "_callChecklistItemEditForm",
                "click .ui-checklist-checkbox": "_checkChecklistItem",
                "click .btn-file-remove": "_callRemoveFileConfirmMenu",
                "click .btn-file-preview": "_callFilePreviewWindow",
                "click .btn-file-download": "_downloadFile",
                "click .btn-image-view": "_viewImage",
                "click .btn-checklistitem-remove": "_removeChecklistItem",
                "click #scrollToTop_card_detail": "_scrollToTop",
                'dragover #dropZone': '_dragOver',
                'dragleave #dropZone': '_dragLeave',
                'drop #dropZone': '_drop',
            },

            _stopPropagation: function (e) {
                e.stopPropagation();
                return true;
            },

            initialize: function (options) {
                var self = this;
                options = options || {};
                this.todoModel = options.todoModel;
                this.$el.data('view', this);

                Backbone.View.prototype.initialize.call(this, options);

                this._initRender();
                // 버블링을 피하기 위해 명시적으로 바인딩을 건다
                // this.listenTo(this.todoModel, 'change:labels', this.syncLabels);
                this.listenTo(this.model, 'change:members', this.reloadContent);
                this.listenTo(this.model, 'change:labels', this.reloadContent);
                this.listenTo(this.model, 'change:title', this.reloadContent);
                this.listenTo(this.model, 'change:content', this.reloadContent);
                this.listenTo(this.model, 'change:dueDate', this.reloadContent);
                this.listenTo(this.model, 'change:checklists', this.reloadContent);
                this.listenTo(this.model, 'change:attaches', this.reloadContent);
                GO.EventEmitter.on("todo", "close:cardLayer", this.remove, this);

                this.$el.on("click.go.todo", function (e) {
                    if (e.target == this) self.close();
                    $(document).trigger('go.todo.clearmenu');
                });

                this.$el.on("scroll", function (e) {
                    if (self.timeout) clearTimeout(self.timeout);
                    self.timeout = setTimeout(function () {
                        var scrollY = e.currentTarget.scrollTop;
                        var scrollToTopBtn = this.$("#scrollToTop_card_detail");
                        if (scrollY == 0) {
                            scrollToTopBtn.hide();
                        } else if (scrollY > 0 && !scrollToTopBtn.is(":visible")) {
                            scrollToTopBtn.show();
                        }

                    }, 20);
                });
                this.isSaaS = GO.session().brandName == "DO_SAAS";
            },

            _dragOver: function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.originalEvent.dataTransfer.dropEffect = 'move';
                $("#dropZone").addClass('drag_file');
            },

            _dragLeave: function (e) {
                e.preventDefault();
                e.stopPropagation();
                $("#dropZone").removeClass('drag_file');
            },

            _drop: function (e) {
                this._dragLeave(e);
            },

            _scrollToTop: function (e) {
                $(e.currentTarget).parent().parent().scrollTop(0);
            },

            render: function () {
                this._renderContent();

                initPosition.call(this);
                initAttachFileList.call(this);
                attachFileUploaders.call(this);
                initChecklistSortable.call(this);
                loadActivities.call(this);
                initActionButtonsPostion.call(this);
                initActionButtonsScroll.call(this);
            },

            remove: function () {
                removeSubviews.call(this);
                return Backbone.View.prototype.remove.apply(this, arguments);
            },

            reloadContent: function () {
                removeSubviews.call(this);

                this._renderContent();

                initAttachFileList.call(this);
                attachFileUploaders.call(this);
                initChecklistSortable.call(this);
                loadActivities.call(this);
            },

            close: function () {
                this.remove();
                GO.router.navigate('todo/' + this.todoModel.id, {"pushState": true, "trigger": false});
            },

            _initRender: function () {
                this.$el.html('<div class="ui-todocard-content layer_type_detail layer_todo_card"></div>');
            },

            _renderContent: function () {
                this.$('.ui-todocard-content')
                    .empty()
                    .append(renderTodoCardContent(getTemplateVars.call(this), {
                        "_member_button": memberButuonTpl,
                        "_user_thumbnail": userThumbnailTpl
                    }));
                this.setViewedTotalAttachSize();
            },

            _close: function (e) {
                e.preventDefault();
                this.close();
            },

            _callCardTitleEditForm: function (e) {
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        $container = $target.closest('.ui-card-title'),
                        self = this,
                        formView;

                    formView = new CardTitleEditFormView({
                        model: this.model,
                        afterConfirm: function () {
                            if (!self.model.hasChanged('title')) {
                                self.model.trigger('change:title');
                            }
                        },
                        afterCancel: function () {
                            self.reloadContent();
                        }
                    });

                    $container.find('h1').hide();
                    $container.find('.ui-column-name').hide();
                    $container.append(formView.el);
                });
            },

            _callCardDescEditForm: function (e) {
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        $container = $target.closest('.ui-content-container'),
                        $content = this.$el.find('.ui-card-content'),
                        self = this,
                        formView,
                        viewOptions = {
                            model: this.model,
                            afterConfirm: function () {
                                if (!self.model.hasChanged('content')) {
                                    self.model.trigger('change:content');
                                }
                            },
                            afterCancel: function () {
                                self.reloadContent();
                            }
                        };

                    if (this.model.get('content') && this.model.get('content').length > 0) {
                        viewOptions.textareaHeight = $content.height();
                        viewOptions.textareaMaxHeight = $(document).height() - ($content.offset().top * 2);
                    } else {
                        viewOptions.textareaRows = 10;
                    }

                    formView = new CardDescEditFormView(viewOptions);
                    $container.empty().append(formView.el);
                });
            },

            _callSearchMemberMenu: function (e) {
                e.preventDefault();
                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        todoItemModel = this.model;

                    TodoMenus.attachTo($target, new TodoMenus.SearchMemberMenuView({
                        "zIndex": 999,
                        "model": todoItemModel,
                        "todoModel": this.todoModel
                    }));
                });
            },

            _callDuedateMenu: function (e) {
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        todoItemModel = this.model;

                    TodoMenus.attachTo($target, new TodoMenus.DuedateMenuView({
                        "model": todoItemModel
                    }));
                });
            },

            _addChecklist: function (e) {
                var self = this;
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    this.model.createChecklist(TodoLang["세부작업"])
                        .then(function (newChecklistModel) {
                            var $container = self.$el.find('.ui-checklist-container').last();
                            $container.find('.btn-add-checklist-item').trigger('click');
                        })
                        .otherwise(function (err) {
                            console.log(err.stack);
                        });
                });
            },

            _callSelectLabelMenu: function (e) {
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        todoItemModel = this.model;

                    TodoMenus.attachTo($target, new TodoMenus.SelectLabelMenuView({
                        "model": todoItemModel,
                        "todoModel": this.todoModel
                    }));
                });
            },

            _callMoveCardMenu: function (e) {
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        todoItemModel = this.model;

                    TodoMenus.attachTo($target, new TodoMenus.MoveCardMenuView({
                        "model": todoItemModel,
                        "todoModel": this.todoModel
                    }));
                });
            },

            _callRemoveCardConfirmMenu: function (e) {
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        cardDetailView = this,
                        todoItemModel = this.model;

                    TodoMenus.attachTo($target, new TodoMenus.RemoveConfirmMenuView({
                        subject: TodoLang["카드 삭제 타이틀"],
                        description: TodoLang["카드 삭제 확인 메시지"],
                        afterClick: function () {
                            var menuView = this;
                            todoItemModel.remove().then(function () {
                                cardDetailView.close();
                                menuView.back();
                            });
                        }
                    }));
                });
            },

            _callRemoveFileConfirmMenu: function (e) {
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        $fileContainer = $target.closest('.ui-attach-file'),
                        attachId = $fileContainer.data('attachid'),
                        todoItemModel = this.model;

                    TodoMenus.attachTo($target, new TodoMenus.RemoveConfirmMenuView({
                        subject: TodoLang["파일 삭제 타이틀"],
                        description: TodoLang["파일 삭제 확인 메시지"],
                        afterClick: function () {
                            var menuView = this;
                            todoItemModel.removeFile(attachId).then(function () {
                                menuView.back();
                            });
                        }
                    }));
                });
            },

            _callMemberProfileMenu: function (e) {
                var $target = $(e.currentTarget),
                    userId = parseInt($target.data('userid')),
                    todoItemModel = this.model;

                e.preventDefault();

                TodoMenus.attachTo($target, new TodoMenus.CardMemberProfileMenuView({
                    "todoModel": this.todoModel,
                    "todoItemModel": todoItemModel,
                    "userId": userId
                }));
            },

            _callChecklistTitleEditForm: function (e) {
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        $container = $target.closest('.ui-checklist-container'),
                        checklistId = parseInt($container.data('checklistid')),
                        formView;

                    formView = new ChecklistTitleEditFormView({
                        "model": this.model,
                        "checklistId": checklistId,
                        afterCancel: function () {
                            $target.show();
                        }
                    });

                    $target.hide().after(formView.el);
                });
            },

            _callChecklistItemAddForm: function (e) {
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        $container = $target.closest('.ui-checklist-container'),
                        checklistId = parseInt($container.data('checklistid')),
                        formView;

                    formView = new ChecklistItemAddFormView({
                        "model": this.model,
                        "checklistId": checklistId,
                        afterCancel: function () {
                            $target.show();
                        }
                    });

                    $target.hide().before(formView.el);
                });
            },

            _callChecklistItemEditForm: function (e) {
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        $container = $target.closest('.ui-checklist-item'),
                        $checklist = $target.closest('.ui-checklist-container'),
                        $checklistItem = $target.closest('.ui-checklist-item'),
                        checklistId = parseInt($checklist.data('checklistid')),
                        checklistItemId = parseInt($checklistItem.data("itemid")),
                        formView;

                    formView = new ChecklistItemEditFormView({
                        "model": this.model,
                        "checklistId": checklistId,
                        "checklistItemId": checklistItemId,
                        "content": $target.text(),
                        afterCancel: function () {
                            $container.show();
                        }
                    });

                    $container.hide().after(formView.el);
                });
            },

            _checkChecklistItem: function (e) {
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        $checklist = $target.closest('.ui-checklist-container'),
                        $checklistItem = $target.closest('.ui-checklist-item'),
                        checklistId = parseInt($checklist.data('checklistid')),
                        checklistItemId = parseInt($checklistItem.data("itemid")),
                        formView;

                    this.model.toggleChecklistItem(checklistId, checklistItemId);
                });
            },

            _callRemoveChecklistConfirmMenu: function (e) {
                e.preventDefault();

                return callActionForMember.call(this, e, function (e) {
                    var $target = $(e.currentTarget),
                        $checklist = $target.closest('.ui-checklist-container'),
                        checklistId = parseInt($checklist.data('checklistid')),
                        todoItemModel = this.model;

                    TodoMenus.attachTo($target, new TodoMenus.RemoveConfirmMenuView({
                        subject: TodoLang["체크리스트 삭제 타이틀"],
                        description: TodoLang["체크리스트 삭제 확인 메시지"],
                        afterClick: function () {
                            var menuView = this;
                            todoItemModel.removeChecklist(checklistId).then(function () {
                                menuView.back();
                            });
                        }
                    }));
                });
            },

            _callFilePreviewWindow: function (e) {
                var $target = $(e.currentTarget),
                    $fileContainer = $target.closest('.ui-attach-file'),
                    attachId = $fileContainer.data('attachid'),
                    todoItemModel = this.model,
                    attachModel = todoItemModel.getFile(attachId);

                e.preventDefault();

                if (attachModel.preview && attachModel.hasOwnProperty('encrypt')) {
                    // TODO: 추후에는 go-utils로 이동해야 함
                    GO.util.preview(attachModel.encrypt);
                }
            },

            _downloadFile: function (e) {
                var self = this;
                var $target = $(e.currentTarget),
                    $fileContainer = $target.closest('.ui-attach-file'),
                    dataGroup = $target.attr('data-fancybox-group'),
                    todoItemModel = this.model,
                    selectedAttachId = $fileContainer.data('attachid'),
                    attachModel = todoItemModel.getFile(selectedAttachId);

                e.preventDefault();

                if (GO.util.isMobile()) {
                    if (!attachModel.download) return false;
                    if (CommonUtil.isImage(attachModel.name)) {
                        if (dataGroup) {
                            var $images = $target.parent().parent().find('a[data-fancybox-group="' + dataGroup + '"]');
                            var images = [];
                            var selectedKey = 0;

                            $.each($images, function (k, v) {
                                var $v = $(v);
                                var attachId = $v.closest('.ui-attach-file').data('attachid');
                                images.push({
                                    fileName: $v.attr('title'),
                                    url: self._getDownloadUrl(attachId)
                                });
                                if (attachId == selectedAttachId) selectedKey = k;
                            });

                            GO.util.attachImages(images, selectedKey);
                        } else {
                            GO.util.attachImages([{
                                "fileName": attachModel.name,
                                "url": self._getDownloadUrl(selectedAttachId)
                            }], 0);
                        }
                    } else {
                        // host를 반드시 붙여야 한다. 그렇지 않으면 다운로드 안된다.
                        var host = location.protocol + '//' + location.host;
                        GO.util.attachFiles(host + self._getDownloadUrl(selectedAttachId), attachModel.name, attachModel.size);
                    }
                } else {
                    location.href = self._getDownloadUrl(selectedAttachId);
                }
            },

            _viewImage: function (e) {
                var self = this;
                var $target = $(e.currentTarget),
                    $fileContainer = $target.closest('.ui-attach-file'),
                    dataGroup = $target.attr('data-fancybox-group'),
                    todoItemModel = this.model,
                    selectedAttachId = $fileContainer.data('attachid'),
                    attachModel = todoItemModel.getFile(selectedAttachId);

                e.preventDefault();

                if (GO.util.isMobile()) {
                    if (dataGroup) {
                        var $images = $target.parent().parent().find('a[data-fancybox-group="' + dataGroup + '"]');
                        var images = [];
                        var selectedKey = 0;

                        $.each($images, function (k, v) {
                            var $v = $(v);
                            var attachId = $v.closest('.ui-attach-file').data('attachid');
                            images.push({
                                fileName: $v.attr('title'),
                                url: self._getDownloadUrl(attachId)
                            });
                            if (attachId == selectedAttachId) selectedKey = k;
                        });

                        GO.util.attachImages(images, selectedKey);
                    }
                } else {
                    GO.util.attachImages([{
                        "fileName": attachModel.name,
                        "url": self._getDownloadUrl(selectedAttachId)
                    }], 0);
                }
            },

            _getDownloadUrl: function (attachId) {
                var todoItemModel = this.model;
                return [GO.config('contextRoot') + 'api/todo', todoItemModel.get('todoId'), 'item', todoItemModel.id, 'download', attachId].join('/');
            },

            _removeChecklistItem: function (e) {
                var $target = $(e.currentTarget),
                    $itemContainer = $target.closest('.ui-checklist-item'),
                    $checklistContainer = $target.closest('.ui-checklist-container'),
                    checklistItemId = $itemContainer.data('itemid'),
                    checklistId = $checklistContainer.data('checklistid');

                e.preventDefault();
                this.model.removeChecklistItem(checklistId, checklistItemId)
                    .otherwise(function (err) {
                        console.log(err.stack);
                    });
            },

            syncLabels: function () {
                var labels = [];

                _.each(this.model.get("labels"), function (item) {
                    var label = _.findWhere(this.todoModel.get("labels"), {
                        id: item.id
                    });
                    labels.push(label);
                }, this);

                this.model.set("labels", labels);

                if (this.model.hasLabels()) {
                    this.reloadContent();
                }
            },

            getViewedTotalAttachSize: function () {
                var viewedTotalAttachSize = 0;
                $("div.content_attach").find('.ui-attach-file').each(function () {
                    viewedTotalAttachSize += parseInt(this.getAttribute('data-size'), 0);
                });
                return viewedTotalAttachSize;
            },

            setViewedTotalAttachSize: function () {
                if (this.isSaaS) {
                    var current = this.getViewedTotalAttachSize();
                    this.$el.find("#total_size").html(GO.util.displayHumanizedAttachSizeStatus(current));
                }
            }
        }, {
            create: function (todoModel, todoItemModel) {
                var instance,
                    target = GO.util.isMobile() ? 'body' : '.go_body',
                    viewUrl = ['todo', todoModel.id, 'card', todoItemModel.id].join('/');

                GO.EventEmitter.trigger('todo', 'go.todo.detail.clearlayers');
                instance = new CardDetailView({
                    "model": todoItemModel,
                    "todoModel": todoModel
                });

                $(target).append(instance.el);
                // render를 나중에 해야 카드 상세 요소들의 높이를 계산할 수 있다.
                instance.render();
                GO.router.navigate(viewUrl, {"pushState": true, "trigger": false});
            }
        });

        function initPosition() {
            var positionStyle = {};
            if (GO.util.isMobile()) {
                positionStyle = {"left": 0, "top": 0, "margin-left": 0};
            } else {
                positionStyle = {"left": '50%', "top": '35px', "margin-left": '-400px'};
            }

            this.$el.find('.ui-todocard-content').css(positionStyle);
        }

        function initAttachFileList() {
            var todoItemModel = this.model;
            // 기존 첨부파일 템플릿과 달라 우선 이 함수는 사용하지 않는다. 추후 리팩토링 필요!!
            // AttachFilesView.create('#ui-attach-placeholder', todoItemModel.get('attaches') || [], function(item) {
            //     return [GO.config('contextRoot') + 'api/todo', todoItemModel.get('todoId'), 'item', todoItemModel.id, 'download', item.id].join('/')
            // });
            if (!GO.util.isMobile()) {
                var self = this;
                setTimeout(function () {
                    initFancyBox.call(self);
                }, 300);
            }
        }

        function removeSubviews() {
            _.each(this.subViews, function (subview) {
                subview.remove();
            });
        }

        function loadActivities() {
            var activityListView = new CardActivityListView({"todoItemModel": this.model});
            this.$el.find('.card-detail-container').append(activityListView.el);
            activityListView.render();
            this.subViews.activityListView = activityListView;
        }

        function initActionButtonsScroll() {
            $('.ui-todocard-container').scroll(_.bind(function () {
                initActionButtonsPostion.call(this);
            }, this));
        }

        function initActionButtonsPostion() {
            var curScrPos = $('.ui-todocard-container').scrollTop();
            this.$el.find('.action-buttons').stop().animate({"top": curScrPos + 'px'}, 350);
        }

        function attachFileUploaders() {
            var attachOption = {
                    "url": this.$el.find('[data-fileuploader]').data('url') || GO.config('contextRoot') + "api/file",
                    "webFolderUrl": this.$el.find('[data-webfolder-uploader]').data('url') + "/webfolder",
                    "isToDo": true
                },
                todoItemModel = this.model;

            attachOption.totalAttachSize = this.getViewedTotalAttachSize();
            attachOption.totalAttachCount = this.model.get('attaches').length;
            if (GO.util.isMobile()) {
                attachOption.success = function (resp) {
                    var uploadAttachModel = (typeof resp === "string") ? JSON.parse(resp) : resp.data;
                    if (window.target.context.id === "todoWebFolder") {
                        todoItemModel.addFile((uploadAttachModel.data));
                    } else {
                        if (uploadAttachModel.hasOwnProperty('data')) {
                            uploadAttachModel = uploadAttachModel.data;
                        }
                        GO.util.isMobileApp()
                            ? todoItemModel.updateFile(convertToAttachModel(uploadAttachModel))
                            : todoItemModel.addFile(uploadAttachModel);
                    }
                };
                if (!GO.util.isMobileApp()) {
                    attachOption.error = function () {
                        $.goSlideMessage('upload fail', 'caution');
                    };
                }
            } else {
                attachOption.success = function (attachModel) {
                    todoItemModel.addFile(attachModel);
                };
                attachOption.error = function (errorMsg) {
                    $.goSlideMessage(errorMsg, 'caution');
                };
                attachOption.dropZone = this.$("#dropZone");
                attachOption.progressEl = this.$("div.progress");
            }

            if (GO.util.isMobile()) {
                MobileFileUploader.bind(this.$el.find('[data-fileuploader]'), attachOption);
            } else {
                FileUploader.bind(this.$el.find('[data-fileuploader]'), attachOption);
            }
        }

        function convertToAttachModel(uploadAttachModel) {
            return {
                "name": uploadAttachModel.fileName,
                "size": uploadAttachModel.fileSize,
                "extention": uploadAttachModel.fileExt,
                "path": uploadAttachModel.filePath
            };
        }

        function initChecklistSortable() {
            var todoItemModel = this.model,
                orgChecklist;

            this.$el.find('.ui-checklist-items').sortable({
                "items": '.ui-checklist-item',
                "connectWith": '.ui-checklist-items',
                "start": function (event, ui) {
                    var $checklist = ui.item.closest('.ui-checklist-container');
                    orgChecklist = todoItemModel.getChecklist($checklist.data('checklistid'));
                },
                "stop": function (event, ui) {
                    var $checklist = ui.item.closest('.ui-checklist-container'),
                        oldChecklistId = orgChecklist.id,
                        newChecklistId = $checklist.data('checklistid'),
                        checklistItemId = ui.item.data('itemid'),
                        newSeq = searchNewChecklistItemSeq($checklist.find('.ui-checklist-item'), checklistItemId);

                    todoItemModel.moveChecklistItem(oldChecklistId, checklistItemId, newChecklistId, newSeq);
                }
            })
        }

        function searchNewChecklistItemSeq($checklistItems, targetId) {
            var result = 0;

            $checklistItems.each(function (seq, itemEl) {
                if ($(itemEl).data('itemid') === targetId) {
                    result = seq;
                    return;
                }
            });

            return result;
        }

        function callActionForMember(event, bodyFunc) {
            return TodoUtil.callActionForMember.call(this, this.todoModel, event, bodyFunc);
        }

        function getTemplateVars() {
            var dueDate = this.model.get("dueDate"),
                columnData = this.todoModel.getCategory(this.model.get("todoCategoryId")),
                checklists = this.model.get('checklists'),
                attaches = this.model.get('attaches'),
                content = GO.util.autolink(GO.util.escapeHtml(this.model.get("content") || ""));

            return {
                "title": GO.util.escapeHtml(this.model.get("title")),
                "content": content,
                "view_cid": this.cid,
                "model": this.model.toJSON(),
                "column_name": columnData.title,
                "lang": lang,
                "checklists": parseChecklists.call(this, checklists),
                "attaches": parseAttaches.call(this, attaches),
                "editable?": this.todoModel.isMember(GO.session("id")),
                "hasMembers?": this.model.hasMembers(),
                "hasLabels?": this.model.hasLabels(),
                "hasDuedate?": !!dueDate,
                "duedate": dueDate ? parseDuedate(dueDate) : false,
                "delayed?": this.model.isDelayed(),
                "hasChecklists?": this.model.hasChecklists(),
                "hasAttaches?": GO.util.isMobileApp() ? (attaches.length > 0 ? true : false) : true,
                "canAttachImage?": canAttachImage(),
                "fileUploadUrl": getFileUploadUrl.call(this),
                "isMobile?": GO.util.isMobile(),
                "isWebFolderUsable?": GO.config('isWebFolderAvailable'),
                "isSaaS": this.isSaaS,
                "label": {
                    "close": CommonLang["닫기"],
                    "member": TodoLang["담당자"],
                    "label": TodoLang["라벨"],
                    "add": CommonLang["추가"],
                    "input_description": TodoLang["상세내용 입력"],
                    "timeline": TodoLang["타임라인"],
                    "duedate": TodoLang["기한일"],
                    "checklist": TodoLang["세부작업"],
                    "attach_file": CommonLang["파일첨부"],
                    "attach_image": CommonLang["이미지 첨부"],
                    "action": TodoLang["액션"],
                    "move": CommonLang["이동"],
                    "remove_card": CommonLang["삭제"],
                    "add_label": TodoLang["라벨 추가"],
                    "add_member": TodoLang["담당자 지정"],
                    "preview": CommonLang["미리보기"],
                    "remove": CommonLang["삭제"],
                    "download": CommonLang["다운로드"],
                    "add_checklist_item": TodoLang["항목 추가"],
                    "webfolder": CommonLang["자료실"],
                    "이 곳에 파일을 드래그 하세요": CommonLang["이 곳에 파일을 드래그 하세요"],
                    "이 곳에 파일을 드래그 하세요 또는": CommonLang["이 곳에 파일을 드래그 하세요 또는"],
                    "파일선택": CommonLang['파일선택'],
                    "첨부파일 1개의 최대 용량은 NNN MB 이며 최대 N개 까지 등록 가능합니다":
                        GO.i18n(CommonLang["첨부파일 1개의 최대 용량은 {{size}} MB 이며 최대 {{number}} 개 까지 등록 가능합니다"],
                            {"size": GO.config('commonAttachConfig').maxAttachSize, "number": GO.config('commonAttachConfig').maxAttachNumber})
                }
            };
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

        function parseDuedate(dueDate) {
            return TodoUtil.parseDuedate(dueDate);
        }

        function canAttachImage() {
            return GO.util.isAndroidApp();
        }

        function parseChecklists(checklists) {
            _.map(checklists, function (checklist) {
                _.map(checklist.checklistItems, function (item) {
                    item.checked = (item.checkFlag === 'Y');
                });
            });

            return checklists;
        }

        function parseAttaches(attaches) {
            var files = [],
                images = [],
                todoModel = this.todoModel,
                todoItemModel = this.model;

            _.each(attaches || [], function (oFile) {
                var file = $.extend(true, {}, oFile);
                file.removable = todoModel.isMember(GO.session('id'));
                file.humanSize = CommonUtil.getHumanizedFileSize(file.size);
                file.downloadUrl = [GO.config('contextRoot') + 'api/todo', todoItemModel.get('todoId'), 'item', todoItemModel.id, 'download', file.id].join('/');

                if (file.hasOwnProperty('updatedAt')) {
                    file.updatedAt = moment(file.updatedAt).format('YYYY-MM-DD(dd) HH:mm');
                }

                if (CommonUtil.isImage(file.name)) {
                    if (GO.util.isMobile() && !file.mobilePreview) {
                        files.push(file);
                    } else {
                        images.push(file);
                    }
                } else {
                    files.push(file);
                }
            });
            //
            return {
                "files": files,
                "images": images
            };
        }

        // TODO: AttachFileView 리팩토링 후 삭제
        function initFancyBox() {
            $('.fancybox-thumbs').goFancybox();
        }

        return CardDetailView;

    });
