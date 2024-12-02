;(function () {
    define([
            "backbone",
            "hogan",
            "app",

            "i18n!nls/commons",
            "i18n!task/nls/task",
            "hgn!task/templates/mobile/task",
            "hgn!task/templates/mobile/task_partial",

            "task/models/task",
            "task/models/task_folder",
            "task/collections/task_departments",
            "task/collections/task_folders",

            "views/mobile/header_toolbar",
            "views/mobile/m_org",
            "admin/models/task_config",
            "attach_file",
            "formspy",
            "components/go-fileuploader/mobile",

            "jquery.go-sdk",
            "jquery.go-orgslide",
            "jquery.progressbar",
            "GO.util"
        ],
        function (
            Backbone,
            Hogan,
            App,
            commonLang,
            taskLang,
            TaskTmpl,
            TaskPartialTmpl,
            Task,
            TaskFolder,
            TaskDepartments,
            TaskFolders,
            HeaderToolbarView,
            OrgView,
            TaskConfig,
            AttachFile,
            FormSpy,
            FileUploader
        ) {
            var lang = {
                "task": commonLang["업무"],
                "regist": commonLang["등록"],
                "edit": commonLang["수정"],
                "location": commonLang["위치"],
                "selectDept": taskLang["부서 선택"],
                "selectFolder": taskLang["폴더 선택"],
                "title": commonLang["제목"],
                "private": commonLang["비공개"],
                "assignee": taskLang["담당자"],
                "dueDate": taskLang["기한"],
                "dueDateDesc": taskLang["기한 설명"],
                "tag": taskLang["분류"],
                "referer": taskLang["참조자"],
                "approver": taskLang["승인자"],
                "detail": taskLang["상세내용"],
                "cancel": commonLang["취소"],
                "type": taskLang["유형"],
                "privateDesc": taskLang["비공개 설명"],
                "addAttach": commonLang["파일 첨부"],
                "add": commonLang["추가"],
                "assignees": taskLang["담당자"],
                "approver": taskLang["승인자"],
                "referers": taskLang["참조자"]
            };

            var TagItemTpl = Hogan.compile(
                '<li data-id="{{name}}">' +
                '<span class="name">{{name}}</span>' +
                '<span class="btn_wrap">' +
                '<span class="ic ic_del"></span></span>' +
                '</li>'
            );

            var UserItemTpl = Hogan.compile(
                '{{#data}}' +
                '<li data-id="{{id}}" data-name="{{name}}" data-position="{{position}}">' +
                '<span class="name">{{name}} {{position}}</span>' +
                '<span class="btn_wrap">' +
                '<span class="ic ic_del"></span></span>' +
                '</li>' +
                '{{/data}}'
            );

            var View = Backbone.View.extend({
                el: "#content",
                events: {
                    "change #deptList": "departmentCheck",
                    "change #folderList": "folderCheck",
                    "change #typeList": "typeCheck",
                    "change #tagSelect": "tagSelect",
                    "vclick a[data-tag=callOrg]": "callOrg",
                    "vclick #submitTask": "submitTask",
                    "vclick #goBackTask": "goBack",
                    "vclick span.ic_del": "deleteUser",
                    "keyup textarea": "_expandTextarea"
                },

                initialize: function (options) {
                    this.options = options || {};
                    this.task = new Task(this.options);
                    this.isCreate = this.options.id ? false : true;
                    this.$el.off();

                    this.configModel = TaskConfig.read({admin: false});
                    this.headerBindEvent();
                },

                headerBindEvent: function () {
                    GO.EventEmitter.off("trigger-action");
                    GO.EventEmitter.on('trigger-action', 'task-save', this.submitTask, this);
                },

                dataFetch: function () {
                    var self = this;
                    var fetchEditable = null;
                    var fetchDepartment = null;
                    var fetchFolder = null;
                    var fetchFolders = $.Deferred();
                    var fetchData = $.Deferred();
                    var fetchTask = this.task.id ?
                        this.task.fetch({
                            statusCode: {
                                400: function () {
                                    GO.util.error('404', {"msgCode": "400-common"});
                                },
                                403: function () {
                                    GO.util.error('403', {"msgCode": "400-common"});
                                },
                                404: function () {
                                    GO.util.error('404', {"msgCode": "400-common"});
                                },
                                500: function () {
                                    GO.util.error('500');
                                }
                            }
                        }) : ($.Deferred()).resolve();

                    fetchTask.done(function (task) {
                        self.folder = new TaskFolder({
                            id: self.options.folderId || self.task.get("folderId") || null
                        });
                        fetchFolder = self.folder.id ? self.folder.fetch() : ($.Deferred()).resolve();
                        fetchFolder.done(function () {
                            if (!self.task.id) self.task.set({
                                folderId: self.folder.id || null,
                                issueType: self.folder.defaultType(),
                                assignees: [self._getSessionUser()]
                            });

                            fetchEditable = self.getEditable();
                        });

                        self.departments = new TaskDepartments({type: "dept"});
                        fetchDepartment = self.departments.fetch();

                        $.when(fetchFolder, fetchDepartment).done(function () {
                            self.deptId = self.departments.isOneTeam() ? self.departments.first().id : (self.folder.get("deptId") || null);
                            self.folders = new TaskFolders();
                            self.folders.setDeptId(self.deptId);
                            if (self.deptId) {
                                fetchFolders = self.folders.fetch({
                                    success: function () {
                                        if (self.folders.isOneFolder() && !self.task.get("folderId")) {
                                            self.task.set({folderId: self.folders.first().id});
                                            if (!self.folder.id) {
                                                self.folder = new TaskFolder({id: self.folders.first().id});
                                                self.folder.fetch().done(function () {
                                                    fetchData.resolve();
                                                });
                                            } else {
                                                fetchData.resolve();
                                            }
                                        } else {
                                            fetchData.resolve();
                                        }
                                    }
                                });
                            } else {
                                self.folders.reset([]);
                                fetchFolders.resolve();
                                fetchData.resolve();
                            }

                        });
                    });

                    var deferred = $.Deferred();
                    $.when(fetchEditable, fetchDepartment, fetchData).done(function () {
                        deferred.resolve(self);
                    });

                    return deferred;
                },

                render: function () {
                    HeaderToolbarView.render({
                        isClose: true,
                        title: this.task.id ? taskLang["업무 수정"] : taskLang["업무 등록"],
                        actionMenu: [{
                            id: "task-save",
                            text: commonLang["등록"],
                            triggerFunc: "task-save"
                        }]
                    });

                    this.$el.html(TaskTmpl(this.getRenderData()));

                    if (!this.isCreate && this.task.get("attaches").length > 0) {
                        $("#attachWrap").show();
                        AttachFile.edit("#fileWrap", this.task.get("attaches"), {}, this.editable.CONTENT);
                    }

                    this.partialRender();

                    this.toggleTypeView();
                    this.setSelectData();

                    this.$el.addClass("write");

                    this.attachFileUploader();
                    return this;
                },

                attachFileUploader: function () {
                    var attachOption = {};

                    attachOption.success = $.proxy(function (r) {
                        var _this = this;
                        var attach = (typeof r === "string") ? JSON.parse(r) : r.data;
                        attach.mode = "edit";
                        $("#attachWrap").show();
                        var deferred = AttachFile.makeTempItem(attach);

                        deferred.done(function (item) {
                            if ($("div.option_display").data("attachable") === "false") {
                                return;
                            }
                            try {
                                _this.attachValidate(attach)
                            } catch (e) {
                                if (e.message === "overMaxAttachNumber") {
                                    $("div.option_display").data("attachable", "false");
                                }
                                return;
                            }
                            if (GO.util.isImage(attach.fileExt)) {
                                $("#imageWrap").append(item.$el);
                            } else {
                                $("#fileWrap").append(item.$el);
                            }

                            item.$el.on('removedFile', function (o, list) {
                                var e = list.el;
                                e.preventDefault();
                                $(e.currentTarget).parents('li').first().remove();
                                $("div.option_display").data("attachable", "true");
                                if ($("#attachWrap").find("li").size() < 1) {
                                    $("#attachWrap").hide();
                                }
                            });
                        });
                        return deferred.promise();
                    }, this);

                    attachOption.error = function () {
                        alert(commonLang['업로드에 실패하였습니다.']);
                    };

                    attachOption.androidCallFile = $.proxy(function () {
                        this.callFile();
                    }, this);

                    FileUploader.bind(this.$el.find('#go-fileuploader'), attachOption);
                },

                initFormSpy: function () {
                    this.formSpy = new FormSpy(this.$("form"));
                },

                partialRender: function () {
                    this.$el.find("tr[data-tag=partial]").remove();
                    $("#partialArea").replaceWith(TaskPartialTmpl(this.getRenderData()));

                    $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);

                    this.renderDatepicker();
                    this.renderField(this.folder.get("fields"), $("#folderFieldArea"));
                    this.renderField(this.folder.getCurrentTypeFields($("select#typeList").val()), $("#typeFieldArea"));
//				this.renderApproverView();

                    this.initFormSpy();
                },

                callOrg: function (e) {
                    var users = [];
                    var type = $(e.currentTarget).attr("data-type");

                    _.each($("#" + type + " li"), function (userEl) {
                        users.push({
                            id: $(userEl).attr("data-id"),
                            username: $(userEl).attr("data-name"),
                            position: $(userEl).attr("data-position")
                        });
                    });
                    var self = this;
                    setTimeout(function () {
                        self.$el.hide();
                        self.orgRender(users, type);
                    }, 500);
                },

                orgRender: function (users, type) {
                    var isSingleSelect = type == "approver" ? true : false;

                    this.orgView = new OrgView({
                        type: "circle",
                        circle: this.folder.get("share"),
                        isSingleSelect: isSingleSelect
                    });

                    $(document).scrollTop(0);

                    var self = this;
                    this.orgView.render({
                        title: lang[type] + " " + commonLang["추가"],
                        checkedUser: users,
                        callback: function (data) {
                            self.$el.show();
                            var tpl = UserItemTpl.render({
                                data: data
                            });
                            $("#" + type).html(tpl);
                            return false;
                        },
                        backCallback: function () {
                            self.$el.show();
                        }
                    });
                },

                makeTitleOption: function () {
                    var self = this;
                    return {
                        name: this.task.id ? taskLang["업무 수정"] : taskLang["업무 등록"],
                        isPrev: true,
                        isIscroll: false,
                        isLeftCancelBtn: {
                            text: taskLang["취소"]
                        },
                        rightButton: {
                            callback: function (e) {
                                setTimeout(function () {
                                    self.submitTask();
                                }, 100);
                            },
                            text: commonLang["등록"]
                        }
                    };
                },

                getEditable: function () {
                    var self = this;
                    var deferred = $.Deferred();
                    this.task.getEditableAttribute().done(function (editable) {
                        self.editable = editable;
                        deferred.resolve();
                    });

                    return deferred;
                },

                getRenderData: function () {
                    return {
                        lang: lang,
                        isCreate: this.isCreate,
                        data: $.extend(this.task.toJSON(), {}),
                        folder: this.folder.id ? this.folder.toJSON() : null,
                        departments: this.departments.toJSON(),
                        folders: this.folders.toJSON(),
                        editable: this.editable,
                        files: this.task.getFiles(),
                        images: this.task.getImages(),
                        assignees: this.getAssignees(),
                        isApprover: this.isApprover(),
                        isMobileApp: GO.config("isMobileApp"),
                        isAndroidApp: GO.util.isAndroidApp(),
                        content: GO.util.unescapeHtml(this.task.get("content")),
                        beginDate: this.task.getShortBeginDate(),
                        dueDate: this.task.getShortDueDate()
//					isAssigneeType : this.task.isAssigneeType()
                    };
                },

                departmentCheck: function () {
                    if (this.folder.id) {
                        this.typeChangeAlert("department");
                    } else {
                        this.changeDept();
                    }
                },

                folderCheck: function () {
                    if (this.folder.id) {
                        this.typeChangeAlert("folder");
                    } else {
                        this.changeFolder();
                    }
                },

                typeCheck: function () {
                    this.typeChangeAlert("type");
                },

                changeDept: function () {
                    var self = this;
                    var deferred = $.Deferred();

                    this.deptId = $("#deptList").val();

                    this.folders = new TaskFolders();
                    this.folders.setDeptId(this.deptId);
                    if (this.deptId) {
                        this.folders.fetch({
                            success: function () {
                                deferred.resolve();
                            }
                        });
                    } else {
                        this.folders.reset([]);
                        deferred.resolve();
                    }
                    deferred.done(function () {
                        self.renderFolderList(self.folders);
                        self.changeFolder();
                    });
                },

                changeFolder: function () {
                    var self = this;
                    var folderId = $("#folderList").val();
                    var fetchFolder = $.Deferred();

                    this.folder = new TaskFolder({id: folderId});
                    if (folderId) {
                        fetchFolder = this.folder.fetch();
                    } else {
                        fetchFolder.resolve();
                    }

                    fetchFolder.done(function () {
                        self.task.set({
                            folderId: folderId,
                            issueType: self.folder.defaultType()
                        });

                        self.renderTypeView();

                        self.getEditable().done(function () {
                            self.redrawTaskView();
                        });
                    });
                },

                changeType: function () {
                    var typeId = $("#typeList").val();
                    this.task.set({
                        issueType: this.folder.findIssueType(typeId)
                    });

                    var self = this;
                    this.getEditable().done(function () {
                        self.redrawTaskView();
                    });
                },

                toggleTypeView: function () {
                    if ($("#typeList").find("option").length > 1) {
                        $("#typeArea").show();
                    } else {
                        $("#typeArea").hide();
                    }
                },

                renderFolderList: function (folders) {
                    var tmpl =
                        '{{#folders}}' +
                        '{{^separator}}' +
                        '<option value={{id}} {{#currentFolder}}selected{{/currentFolder}}>{{name}}</option>' +
                        '{{/separator}}' +
                        '{{/folders}}';
                    var folderList = $("select#folderList");

                    folderList.find("option:gt(0)").remove();
                    folderList.append(Hogan.compile(tmpl).render({
                        folders: folders.toJSON()
                    }));
                },

                renderTypeView: function () {
                    $("#typeList").find("option").remove();
                    var typeItemTpl = Hogan.compile('<option value={{issueType.id}}>{{issueType.name}}</option>');
                    _.each(this.folder.getIssueTypes(), function (issueType) {
                        $("#typeList").append(typeItemTpl.render({
                            issueType: issueType
                        }));
                    });
                    $("#typeList").val(this.task.get("issueType").id);
                },

                typeChangeAlert: function (type) {
                    var text = type == "type" ? taskLang["유형 변경 경고"] : taskLang["위치 변경 경고"];
                    if (confirm(text.replace("<br>", " "))) {
                        if (type == "department") {
                            this.changeDept();
                        } else if (type == "folder") {
                            this.changeFolder();
                        } else if (type == "type") {
                            this.changeType();
                        }
                    } else {
                        this.revert(type);
                    }
                },

                revert: function (type) {
                    if (type == "department") {
                        this.revertDept();
                    } else if (type == "folder") {
                        this.revertFolder();
                    } else if (type == "type") {
                        this.revertType();
                    }
                },

                revertDept: function () {
                    var self = this;
                    setTimeout(function () {
                        $("#deptList").val(self.deptId);
                    }, 100);
                },

                revertFolder: function () {
                    var self = this;
                    setTimeout(function () {
                        $("#folderList").val(self.task.get("folderId"));
                    }, 100);
                },

                revertType: function () {
                    var self = this;
                    setTimeout(function () {
                        $("#typeList").val(self.task.get("issueType").id);
                    }, 100);
                },

                setSelectData: function () {
                    $("#deptList").val(this.deptId);
                    $("#folderList").val(this.task.get("folderId"));
                },

                redrawTaskView: function () {
                    var title = $("#taskName").val();
                    var deuDate = $("#dueDate").val();
                    var beginDate = $("#beginDate").val();

                    this.partialRender();

                    $("#taskName").val(title);
                    $("#dueDate").val(deuDate);
                    $("#beginDate").val(beginDate);

                    this.toggleTypeView();
                },

                renderDatepicker: function () {
                    $("#beginDate").datepicker({
                        yearSuffix: "",
                        dateFormat: "yy-mm-dd",
                        changeMonth: true,
                        changeYear: true
                    });

                    $("#dueDate").datepicker({
                        yearSuffix: "",
                        dateFormat: "yy-mm-dd",
                        changeMonth: true,
                        changeYear: true
                    });
                },

                renderField: function (collection, $element) {
                    if (!this.folder.id) return;
                    var fields = this._getFields(collection).join("");
                    $element.replaceWith(fields);
                },

                isApprover: function () {
                    if (!this.folder.id) return false;
                    var currentType = this.folder.findIssueType($("select#typeList").val());
                    if (!currentType || !currentType.approver) return false;
                    return true;
                },

                attachDelete: function (e) {
                    $(e.target).parents("li").remove();

                    if (!$("#attachWrap").find("li").length) $("#attachWrap").hide();
                },

                goBack: function () {
                    window.history.back();
                },

                tagSelect: function (e) {
                    var target = $(e.currentTarget);
                    var name = target.val();
                    if (name == lang.add) return;

                    var addedTags = _.map($("ul#tag").find("li[data-id]"), function (tag) {
                        return $(tag).find("span.name").text();
                    });

                    if (!_.contains(addedTags, name)) {
                        var tpl = TagItemTpl.render({
                            name: name
                        });
                        this.$("#tag").append(tpl);
                    }

                    target.val("");
                },

                submitTask: function () {
                    var taskData = {
                        folderId: $("#folderList").val(),
                        name: $("#taskName").val(),
                        issueType: this.folder.findIssueType(this.$("#typeList").val()),
                        dueDate: this._getDueDate(),
                        beginDate: this._getBeginDate(),
                        tags: this._getTags(),
                        creator: this._getCreator(),
                        lasModifier: this._getSessionUser(),
                        privateTask: $("#privateTask").is(":checked"),
                        status: {
                            name: "status",
                            start: false,
                            end: false,
                            doing: false
                        },
                        activityCount: this.task.get("activityCount"),
                        fieldValues: this._getFieldValues(),
                        attaches: FileUploader.getAttachInfo("#attachWrap"),
                        content: GO.util.escapeHtml(this.$el.find("textarea").val()),
                        assignees: this._getUserInfo("assignees"),
                        referers: this._getUserInfo("referers"),
                        approver: this._getUserInfo("approver"),
                        updatedAt: this.task.getUpdatedAt()
                    };

                    if (this.validate(taskData) == false) return;

                    this.task.set(taskData);
                    this.task.save({}, {
                        success: function (e) {
                            console.log(e.id);
                            App.router.navigate("task/" + e.id + "/detail", true);
                        },
                        error: function () {
                            console.log("error");
                        }
                    });
                },

                validate: function (task) {
                    if (!task.folderId || !this.folder.id) {
                        alert(taskLang["폴더를 선택해 주세요."], "");
                        return false;
                    }
                    if (task.name.length > 64 || task.name.length < 2) {
                        alert(taskLang["제목은 2자 이상, 64자 이하 입력 가능합니다."], "");
                        return false;
                    }
                    if (this.folder.get("tagRequired") && task.tags.length == 0) {
                        alert(taskLang["분류를 선택해 주세요."], "");
                        return false;
                    }
                    if (task.beginDate.length != 0 && task.dueDate.length != 0) {

                        var beginDate = new Date(task.beginDate);
                        var dueDate = new Date(task.dueDate);

                        if (beginDate > dueDate) {
                            alert(taskLang["종료일이 시작일보다 이전일 수 없습니다."], "");
                            return false;
                        }
                    }
                    if (!this.customFieldValidate()) return false;
                },

                customFieldValidate: function () {
                    var isValid = true;
                    _.each(this.folder.getRequiredSelectFields(), function (field) {
                        var fieldId = field.id;
                        var fieldEl = $("tr#field" + fieldId + "[data-field=customField]").find("select");
                        if (fieldEl.val() == "") {
                            isValid = false;
                            alert(commonLang["필수항목을 입력하지 않았습니다."]);
                            return false;
                        }
                    });
                    _.each(this.folder.getRequiredTextFields(), function (field) {
                        var fieldId = field.id;
                        var fieldEl = $("tr#field" + fieldId + "[data-field=customField]").find("input");
                        if (fieldEl.val() == "") {
                            isValid = false;
                            alert(commonLang["필수항목을 입력하지 않았습니다."]);
                            return false;
                        }
                    });
                    _.each(this.folder.getTextFields(), function (field) {
                        var fieldId = field.id;
                        var fieldEl = $("tr#field" + fieldId + "[data-field=customField]").find("input");
                        if (fieldEl.val().length > 200) {
                            isValid = false;
                            alert(GO.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."], {arg1: 200}));
                            return false;
                        }
                    });

                    return isValid;
                },

                _getFieldValues: function () {
                    var fieldValues = [];
                    _.each(this.$el.find("tr[data-field=customField]"), function (field) {
                        var $field = $(field);
                        var type = $field.attr("data-type").toUpperCase();
                        if (type == "SELECT") {
                            fieldValues.push(this._getSelectFieldValue($field));
                        } else if (type == "BOOLEAN") {
                            fieldValues.push(this._getBooleanFieldValue($field));
                        } else if (type == "TEXT") {
                            fieldValues.push(this._getTextFieldValue($field));
                        } else {
                            return;
                        }
                    }, this);
                    return fieldValues;
                },

                _getDueDate: function () {
                    return $("#dueDate").val() ? GO.util.searchEndDate(GO.util.toMoment($("#dueDate").val())) : "";
                },

                _getBeginDate: function () {
                    return $("#beginDate").val() ? GO.util.searchStartDate(GO.util.toMoment($("#beginDate").val())) : "";
                },

                _getTags: function () {
                    var tags = [];
                    _.each($("#tag").find("li[data-id]"), function (tag) {
                        tags.push($(tag).find("span.name").text());
                    });
                    return tags;
                },

                _getCreator: function () {
                    return this.isCreate ? this._getSessionUser() : this.task.creator;
                },

                _getSessionUser: function () {
                    return _.pick(GO.session(), 'id', 'name', 'email', 'position', 'thumbnail');
                },

                _getUserInfo: function (type) {
                    if (type == "approver") {
                        var approvers = $("#" + type).find("li[data-id]");
                        if (approvers.length) {
                            return {
                                id: approvers.attr("data-id")
                            };
                        } else {
                            return null;
                        }
                    } else {
                        var users = [];
                        _.each($("#" + type).find("li[data-id]"), function (user) {
                            users.push({
                                id: $(user).attr("data-id")
                            });
                        });
                        return users;
                    }
                },

                _getFields: function (collection) {
                    var fieldEls = [];
                    _.each(collection, function (field) {
                        if (field.type == "SELECT") {
                            fieldEls.push(this._makeSelectFieldEl(field));
                        } else if (field.type == "BOOLEAN") {
                            fieldEls.push(this._makeBooleanFieldEl(field));
                        } else if (field.type == "TEXT") {
                            fieldEls.push(this._makeTextFieldEl(field));
                        } else {
                            return;
                        }
                    }, this);
                    return fieldEls;
                },

                _makeSelectFieldEl: function (field) {
                    var taskFieldValue = this._getFieldValue(field);
                    var options = ['<option value="">' + commonLang["선택"] + '</option>'];
                    var defaultValue = this.isCreate ? taskFieldValue.defaultValue : taskFieldValue.value;

                    _.each(field.options, function (value) {
                        var selectOption = value == defaultValue ? " selected" : "";
                        options.push('<option ' + selectOption + '>' + value + '</option>');
                    }, this);

                    var html =
                        '<tr data-tag="partial" id="field{{field.id}}" data-fieldId="{{field.id}}" data-field="customField" data-type="select">' +
                        '<th>' +
                        '<span class="title">{{field.name}}</span>' +
                        '{{#field.required}}<ins class="asterisk">*</ins>{{/field.required}}' +
                        '</th>' +
                        '<td>' +
                        '<select {{^editable.FIELD}}disabled="disabled"{{/editable.FIELD}}>' +
                        options.join("") +
                        '</select>' +
                        '</td>' +
                        '</tr>';

                    return Hogan.compile(html).render({
                        field: field,
                        editable: this.editable
                    });
                },

                _makeBooleanFieldEl: function (field) {
                    var taskFieldValue = this._getFieldValue(field);
                    var value = this.isCreate ? taskFieldValue.defaultValue : taskFieldValue.value;
                    var html =
                        '<tr data-tag="partial" id="field{{field.id}}" data-fieldId="{{field.id}}" data-field="customField" data-type="boolean">' +
                        '<th>' +
                        '<span class="title">{{field.name}}</span>' +
                        '{{#field.required}}<ins class="asterisk">*</ins>{{/field.required}}' +
                        '</th>' +
                        '<td>' +
                        '<span class="option_wrap">' +
                        '<input type="checkbox" ' +
                        '{{#taskFieldValue.value}}checked{{/taskFieldValue.value}} ' +
                        '{{^editable.FIELD}}disabled="disabled"{{/editable.FIELD}}>' +
                        '<label>{{field.message}}</label>' +
                        '</span>' +
                        '</td>' +
                        '</tr>';

                    return Hogan.compile(html).render({
                        field: field,
                        taskFieldValue: {
                            value: GO.util.toBoolean(value)
                        },
                        editable: this.editable
                    });
                },

                _makeTextFieldEl: function (field) {
                    var taskFieldValue = this._getFieldValue(field);
                    var html =
                        '<tr data-tag="partial" id="field{{field.id}}" data-fieldId="{{field.id}}" data-field="customField" data-type="text">' +
                        '<th>' +
                        '<span class="title">{{field.name}}</span>' +
                        '{{#field.required}}<ins class="asterisk">*</ins>{{/field.required}}' +
                        '</th>' +
                        '<td>' +
                        '<div class="ipt_wrap">' +
                        '<input class="input w_max" type="text" value="{{taskFieldValue.value}}" ' +
                        'placeholder="{{taskFieldValue.message}}"' +
                        '{{^editable.FIELD}}disabled="disabled"{{/editable.FIELD}}>' +
                        '</div>' +
                        '</td>' +
                        '</tr>';

                    var template = Hogan.compile(html).render({
                        field: field,
                        taskFieldValue: {
                            value: taskFieldValue.value,
                            message: field.message
                        },
                        editable: this.editable
                    });

                    return template;
                },

                _getSelectFieldValue: function ($field) {
                    return {
                        fieldId: $field.attr("data-fieldId"),
                        value: $field.find("option:selected").text()
                    };
                },

                _getBooleanFieldValue: function ($field) {
                    return {
                        fieldId: $field.attr("data-fieldId"),
                        value: $field.find("input").is(":checked")
                    };
                },

                _getTextFieldValue: function ($field) {
                    return {
                        fieldId: $field.attr("data-fieldId"),
                        value: $field.find("input").val()
                    };
                },

                _getFieldValue: function (field) {
                    if (this.isCreate) return field;

                    var fieldValues = this.task.get("fieldValues");

                    if (fieldValues.length == 0) return field;

                    var fieldValue = _.find(fieldValues, function (fieldValue) {
                        return fieldValue.fieldId == field.id;
                    });

                    return fieldValue || {value: field.defaultValue || ""};
                },

                getAssignees: function () {
                    return this.isCreate ? [GO.session()] : this.task.get("asignees");
                },

                attachValidate: function (file) {
                    var data = GO.util.getFileNameAndTypeData(file);
                    var maxAttachSize = this.configModel.get("attachSizeLimit") ? this.configModel.get("maxAttachSize") : -1,
                        maxAttachNumber = this.configModel.get("attachNumberLimit") ? this.configModel.get("maxAttachNumber") : -1,
                        excludeExtension = this.configModel.get("excludeExtension") == undefined ? "" : this.configModel.get("excludeExtension");
                    if (this.configModel.get("attachSizeLimit")) {
                        maxAttachSize = this.configModel.get("maxAttachSize");
                    } else if (GO.config('allowedFileUploadSize')) {
                        maxAttachSize = GO.config('allowedFileUploadSize') / 1024 / 1024;
                    }

                    try {
                        $.goValidation.attachValidate("#attachWrap li", data, maxAttachSize, maxAttachNumber, excludeExtension);
                        if (GO.session().brandName == "DO_SAAS") {
                            FileUploader.attachFileValidateBySaaS(data.size);
                        }
                    } catch (e) {
                        var message = e.message;

                        if (message == "ExtentionException") {
                            alert(App.i18n(commonLang['확장자가 땡땡인 것들은 첨부 할 수 없습니다.'], "arg1", excludeExtension));
                        } else if (message == "AttachSizeException") {
                            alert(App.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                        } else if (message == "AttachNumberException") {
                            alert(App.i18n(commonLang['첨부 파일 개수를 초과하였습니다.'], "arg1", maxAttachNumber));
                            throw new Error("overMaxAttachNumber");
                        } else if (message == "AttachNumberExceptionBySaaS") {
                            alert(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
                            throw new Error("overMaxAttachNumber");
                        } else if (message == "NotFoundExtException") {
                            alert(commonLang['첨부할 수 없는 파일 입니다.']);
                        }

                        throw new Error("Attach Validation Error");
                    }
                },

                callFile: function () {
                    var maxAttachSize = -1;
                    if (this.configModel.get("attachSizeLimit")) {
                        maxAttachSize = this.configModel.get("maxAttachSize");
                    } else if (GO.config('allowedFileUploadSize')) {
                        maxAttachSize = GO.config('allowedFileUploadSize') / 1024 / 1024;
                    }
                    var maxAttachNumber = this.configModel.get("attachNumberLimit") ? this.configModel.get("maxAttachNumber") : -1,
                        excludeExtension = this.configModel.get("excludeExtension");

                    if (!this.fileUploadCountValidate()) {
                        return false;
                    }

                    if (this.configModel.get("attachNumberLimit")) {
                        maxAttachNumber = maxAttachNumber - $("#attachWrap li").size();
                    }

                    GO.util.callFile(maxAttachSize, maxAttachNumber, excludeExtension);
                },

                fileUploadCountValidate: function () {

                    if (this.configModel.get("attachNumberLimit")) {
                        var attachCount = $("#attachWrap li").size(),
                            configAttachCount = this.configModel.get("maxAttachNumber");

                        if (attachCount >= configAttachCount) {
                            alert(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", configAttachCount));
                            return false;
                        }
                    }

                    return true;
                },

                deleteUser: function (e) {
                    $(e.currentTarget).parents("li").remove();
                },

                _expandTextarea: function (e) {
                    GO.util.textAreaExpand(e);
                }
            });
            return View;
        });
}).call(this);