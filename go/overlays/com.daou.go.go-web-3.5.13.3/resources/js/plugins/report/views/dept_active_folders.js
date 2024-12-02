(function () {

    define([
            "jquery",
            "hogan",
            "underscore",
            "backbone",
            "app",
            "i18n!nls/commons",
            "i18n!report/nls/report",
            "models/dept_profile",
            "report/models/report_dept",
            "hgn!report/templates/dept_active_folders",
            "report/views/report_title",
            "GO.util",
            "jquery.go-grid",
            "jquery.go-orgslide",
            "jquery.go-preloader"
        ],

        function (
            $,
            Hogan,
            _,
            Backbone,
            GO,
            CommonLang,
            ReportLang,
            DeptCardModel,
            DeptFoldersModel,
            DeptFoldersTmpl,
            ReportTitleView
        ) {

            var lang = {
                empty_msg: ReportLang["생성된 보고서가 없습니다."],
                report_manage: ReportLang["보고서 관리"],
                remove_msg: ReportLang["보고서 및 선택한 보고서 내 모든 데이터가 삭제 됩니다. 삭제하시겠습니까?"],
                stop_title: ReportLang["폴더 중지"],
                stop_msg: ReportLang["폴더 중지 설명"],
                stop: ReportLang["중지"],
                remove: CommonLang["삭제"],
                edit: CommonLang["수정"],
                save: CommonLang["저장"],
                cancel: CommonLang["취소"],
                report_title: ReportLang["보고서 제목"],
                type: ReportLang["유형"],
                created_at: ReportLang["개설일"],
                config: CommonLang["설정"],
                empty: CommonLang["없음"],
                config: CommonLang["설정"],
                sort: CommonLang["순서 바꾸기"],
                add_separate: CommonLang["구분선 추가"],
                move_folder: ReportLang["보고서 이관"],
                sort_success: ReportLang["순서 바꾸기 완료"],
                select_report: ReportLang["보고서를 선택해 주세요."],
                change_success: CommonLang["변경되었습니다."],
                save_success: CommonLang["저장되었습니다."],
                remove_success: CommonLang["삭제되었습니다."]
            };

            var DeptFoldersView = Backbone.View.extend({
                    el: "#content",

                    events: {
                        "click #controlButtons a.sort": "setOrder",
                        "click #controlButtons a.add_separate": "addSeparate",
                        "click #controlButtons a.close": "close",
                        "click #controlButtons a.delete": "remove",
                        "click #controlButtons a.move": "move",
                        "click #checkedAll": "toggleCheckbox",
                        "click #folder_items tr input:checkbox": "toggleCheckboxAll",
                    },

                    initialize: function (options) {
                        this.options = options || {};
                        this.$el.off();
                        this.department = DeptCardModel.read(this.options.deptId);
                        this.model = DeptFoldersModel.get(this.options.deptId);
                        this.collection = new Backbone.Collection(this.model.get("folders"));
                        $("#side").trigger("set:leftMenu", [this.department.get("id"), "department"]);
                    },

                    render: function () {
                        var self = this;

                        this.$el.html(DeptFoldersTmpl({
                            lang: lang
                        }));

                        this.renderItem();

                        ReportTitleView.create({
                            text: lang.report_manage,
                            meta_data: this.department.get("name")
                        });

                        return this;
                    },

                    renderItem: function () {
                        this.$el.find("#folder_items").html("");
                        this.$el.find("#folder_items").off();

                        var self = this;

                        this.$el.find("#folder_items").html("");
                        $.each(this.model.get("folders"), function (index, data) {
                            var folder_item = "",
                                model = new Backbone.Model(data);

                            if (!model.get("separator")) {
                                folder_item = new FolderItemView({model: model});
                            } else {
                                folder_item = new FolderSeparateItemView({model: model});
                                folder_item.$el.on("remove:separate", $.proxy(self.removeSeparate, self));
                                folder_item.$el.on("update:separate", $.proxy(self.updateSeparate, self));
                            }

                            folder_item.render();
                            self.$el.find("#folder_items").append(folder_item.$el);
                        });
                    },

                    updateSeparate: function (e, data) {
                        var currentEl = $(e.currentTarget);

                        separate = this.collection.get(data.id);

                        separate.set({name: data.name});

                        this.saveList(this.collection, function (response) {
                            $.goMessage(lang.change_success);
                            currentEl.find("td span.title_depart").text(data.name);
                            currentEl.find("td").toggle();
                            $("#side").trigger("change:folder", []);
                        });
                    },

                    removeSeparate: function (e, id) {
                        var separate = this.collection.get(id),
                            currentEl = $(e.currentTarget);

                        this.collection.remove(separate);
                        this.saveList(this.collection, function (response) {
                            $.goMessage(lang.change_success);
                            currentEl.remove();
                            $("#side").trigger("change:folder", []);
                        });
                    },

                    addSeparate: function () {
                        var self = this,
                            model = new Backbone.Model();

                        model.set({name: "", separator: true});
                        this.collection.add(model);

                        this.saveList(this.collection, function (response) {
                            $.goMessage(lang.save_success);
                            $.proxy(self.reload(), self);
                        });
                    },

                    toggleCheckbox: function (e) {
                        var folder_check_boxs = this.$el.find("#folder_items tr input:checkbox");

                        folder_check_boxs.each(function () {
                            if ($(e.currentTarget).is(':checked')) {
                                $(this).attr("checked", true);
                            } else {
                                $(this).attr("checked", false);
                            }
                        });
                    },

                    toggleCheckboxAll: function (e) {
                        if (!$(e.currentTarget).is(':checked')) {
                            this.$el.find("#checkedAll").attr("checked", false);
                        }
                    },

                    getCheckedIds: function () {
                        var ids = [];

                        $.each($("#folders_table td input:checkbox:checked"), function (index, el) {
                            ids.push($(el).val());
                        });

                        return ids;
                    },
                    move: function () {
                        var ids = this.getCheckedIds();

                        if (ids.length == 0) {
                            $.goMessage(lang.select_report);
                            return;
                        }

                        var self = this;
                        $.goOrgSlide({
                            type: "department",
                            contextRoot: GO.contextRoot,
                            callback: $.proxy(function (info) {
                                var content =
                                    '<p class="add">' +
                                    GO.i18n(ReportLang["폴더 이관 경고"], {arg1: info.name}) +
                                    '</p>';

                                $.goConfirm(content, "", function () {
                                    self.moveSave(info.id, ids);
                                });
                            }, this)
                        });
                    },
                    moveSave: function (id, ids) {
                        var url = GO.contextRoot + "api/report/folder/department/" + this.department.get("id") + "/transfer/" + id,
                            self = this;

                        $.go(url, JSON.stringify({ids: ids}), {
                            async: false,
                            qryType: 'PUT',
                            contentType: 'application/json',
                            responseFn: function (response) {
                                $.goMessage(lang.change_success);
                                GO.router.navigate("report/dept/" + self.department.get("id") + "/folder/active", {trigger: true});
                            },
                            error: function (error) {
                                $.goAlert(type.error);
                            }
                        });
                    },
                    remove: function () {
                        var self = this,
                            ids = this.getCheckedIds();

                        if (ids.length == 0) {
                            $.goMessage(lang.select_report);
                            return;
                        }

                        $.goConfirm('', lang.remove_msg,
                            function () {
                                var url = GO.contextRoot + "api/report/folder",
                                    options = {
                                        id: self.options.deptId,
                                        ids: ids
                                    };

                                self.preloader = $.goPreloader();
                                self.preloader.render();

                                $.go(url, JSON.stringify(options), {
                                    async: true,
                                    qryType: 'DELETE',
                                    contentType: 'application/json',
                                    responseFn: function (response) {
                                        self.preloader.release();
                                        if (response.code === "200") {
                                            self.reload.call(self);
                                        } else {

                                        }
                                    },
                                    error: function (error) {
                                        self.preloader.release();
                                        $.goAlert(CommonLang["삭제에 실패하였습니다."]);
                                    }
                                });
                            });
                    },
                    close: function () {
                        var self = this,
                            ids = this.getCheckedIds();

                        if (ids.length == 0) {
                            $.goMessage(lang.select_report);
                            return;
                        }

                        $.goConfirm(
                            lang.stop_title,
                            lang.stop_msg,
                            function () {
                                var url = GO.contextRoot + "api/report/folder/status/inactive",
                                    options = {
                                        id: self.options.deptId,
                                        ids: ids
                                    };

                                $.go(url, JSON.stringify(options), {
                                    async: false,
                                    qryType: 'PUT',
                                    contentType: 'application/json',
                                    responseFn: function (response) {
                                        if (response.code === "200") {
                                            self.reload.call(self);
                                        } else {

                                        }
                                    },
                                    error: function (error) {
                                        $.goAlert(type.error);
                                    }
                                });
                            });
                    },
                    reload: function () {
                        var url = "report/dept/" + this.options.deptId + "/folder/active";
                        GO.router.navigate(url, true);
                    },
                    setOrder: function (e) {
                        var self = this,
                            $el = $(e.currentTarget),
                            isSave = this.$el.find('#folders_table').find('tbody').hasClass('ui-sortable'),
                            btnCodes = this.$el.find("#controlButtons a").not(".sort");

                        if (isSave) {
                            var collection = [];

                            this.$el.find('#folders_table').find('tbody').sortable("destroy").removeAttr('class');

                            $.each(this.$el.find("tbody tr"), function (index, el) {
                                var model = self.collection.get(parseInt($(el).attr("data-id")));
                                collection.push(model);
                            });

                            this.saveList(collection, function (response) {
                                $.goMessage(lang.change_success);
                                $.proxy(self.reload(), self);
                            });

                            $el.find("span.txt").text(lang.sort);

                            $.each(btnCodes, function (index, el) {
                                $(el).show();
                            });
                        } else {
                            $.each(btnCodes, function (index, el) {
                                $(el).hide();
                            });

                            $el.find("span.txt").text(lang.sort_success);

                            this.$el.find('#folders_table').find('tbody').sortable({
                                opacity: '1',
                                delay: 100,
                                cursor: "move",
                                items: "tr",
                                containment: '.go_content',
                                hoverClass: "ui-state-hover",
                                placeholder: 'ui-sortable-placeholder',
                                start: function (event, ui) {
                                    ui.placeholder.html(ui.helper.html());
                                    ui.placeholder.find('td').css('padding', '5px 10px');
                                }
                            });
                        }
                    },

                    saveList: function (models, successCallBack) {
                        var url = GO.contextRoot + "api/report/folder/department/" + this.department.get("id"),
                            self = this;

                        $.go(url, JSON.stringify(models), {
                            qryType: 'PUT',
                            contentType: 'application/json',
                            responseFn: successCallBack,
                            error: function (error) {
                                $.goAlert(type.account_delete_error);
                            }
                        });
                    },

                    release: function () {
                        this.childView.release();

                        this.$el.off();
                        this.$el.empty();
                        this.remove();
                    }
                },

                {
                    __instance__: null,

                    create: function () {
                        if (this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
                        return this.__instance__;
                    }
                });

            var DeptFolderItemTpl = Hogan.compile([
                "<td class='align_c'><input name='id' type='checkbox' value='{{data.id}}'></td>",
                "<td class='subject sorting_1'><span data-id='4' style='cursor: pointer;'> {{data.name}} </span></td>",
                "<td class='name'>{{{data.reportType}}}</td>",
                "<td class='date'>{{data.createdAt}}</td>",
                "<td class='setting'><a class='btn_bdr' style='cursor: pointer;'><span class='ic_classic ic_setup' title='{{lang.config}}'></span></a></td>"
            ].join(""));

            var FolderItemView = Backbone.View.extend({
                tagName: "tr",

                events: {
                    "click td.subject span": "goList",
                    "click td.setting a": "goConfig",
                },

                initialize: function (options) {
                    this.options = options || {};
                    this.model = this.options.model;
                    this.$el.attr("data-id", this.model.get("id"));
                },

                render: function () {
                    var self = this,
                        item = DeptFolderItemTpl.render({
                            data: $.extend({}, this.model.toJSON(), {
                                reportType: function () {
                                    var reportType = self.model.get("type");
                                    if (reportType == "PERIODIC") {
                                        return ReportLang["정기 보고서"];
                                    } else if (reportType == "OCCASIONAL") {
                                        return ReportLang["수시 보고서"];
                                    } else {
                                        return "";
                                    }
                                },
                                createdAt: GO.util.basicDate(self.model.get("createdAt"))
                            }),
                            lang: lang
                        });

                    this.$el.html(item);
                    return this;
                },

                goList: function () {
                    var url = "report/folder/" + this.model.get("id") + "/reports";
                    GO.router.navigate(url, {trigger: true});
                },

                goConfig: function () {
                    var url = "report/folder/" + this.model.get("id");
                    GO.router.navigate(url, {trigger: true});
                }
            });

            var SeparateItemTpl = Hogan.compile([
                    '<td colspan="6" class="depart_bg align_l" data-tag="view">',
                    '&lt;<span class="title_depart vm" data-tag="content">{{data.name}}</span>&gt;',
                    '<span class="btn_fn7 vm edit">{{lang.edit}}</span> ',
                    '<span class="btn_fn7 vm remove" >{{lang.remove}}</span>',
                    '</td>' +
                    '<td colspan="6" class="depart_bg align_l" data-tag="edit" style="display:none;">',
                    '<input type="text" class="input w_medium vm" value="{{data.name}}">&nbsp;' +
                    '<span class="btn_fn7 vm save" data-tag="saveSeparator">{{lang.save}}</span>&nbsp;',
                    '<span class="btn_fn7 vm cancel" data-tag="cancelSeparator">{{lang.cancel}}</span>',
                    '</td>'
                ].join("")
            );

            var FolderSeparateItemView = Backbone.View.extend({
                tagName: "tr",

                events: {
                    "click span.edit": "edit",
                    "click span.remove": "remove",
                    "click span.save": "save",
                    "click span.cancel": "cancel"
                },

                initialize: function (options) {
                    this.options = options || {};
                    this.model = this.options.model;
                    this.$el.attr("data-id", this.model.get("id"));
                },

                render: function () {
                    var item = SeparateItemTpl.render({
                        data: this.model.toJSON(),
                        lang: lang
                    })
                    this.$el.html(item);
                    return this;
                },

                edit: function () {
                    this.$el.find("td").toggle();
                },

                remove: function () {
                    this.$el.trigger("remove:separate", [this.model.get("id")]);
                },

                save: function () {
                    this.$el.trigger("update:separate", [{
                        id: this.model.get("id"),
                        name: this.$el.find("input:text").val()
                    }]);
                },

                cancel: function () {
                    this.$el.find("td").toggle();
                }
            });

            function privateFunc(view, param1, param2) {

            }

            return DeptFoldersView;
        });
})();
