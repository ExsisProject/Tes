(function () {
    define([
            "contact/views/layouts/defaults"
        ],
        function (DefaultLayout) {
            var ContactController = (function () {

                var Controller = function () {
                };

                Controller.prototype = {

                    render: function () {
                        require(["contact/views/home"], function (ContactAppView) {
                            var layout = DefaultLayout.create();
                            layout.sideInit();
                            layout.render().done(function (layout) {
                                var content = layout.getContentElement();

                                // 앱초기 메뉴 진입시 호출할 주소록 선택
                                var initParam = layout.sideView.getInitParam();
                                ContactAppView.render(initParam.groupId, initParam.type, initParam.deptId);
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    /**
                     * 개인주소록 전체
                     * @param id
                     */
                    renderContactPersonal: function () {
                        require(["contact/views/home"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render("", "USER");
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    /**
                     * 개인주소록 그룹
                     * @param id
                     */
                    renderContactPersonalGroup: function (id) {
                        require(["contact/views/home"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render(id, "USER");
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    /**
                     * 부서 주소록 전체
                     * @param deptId
                     */
                    renderContactDept: function (deptId, groupId) {
                        require(["contact/views/home"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render(groupId, "DEPARTMENT", deptId);
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    /**
                     * 부서 주소록 그룹
                     * @param deptId
                     */
                    renderContactDeptGroup: function (deptId, groupId) {
                        require(["contact/views/home"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render(groupId, "DEPARTMENT", deptId);
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    renderContactCompany: function (id) {
                        require(["contact/views/home"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render(id, "COMPANY");
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    renderContactCompanyManage: function () {
                        require(["contact/views/company_manage"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                var contactAppView  = new ContactAppView();
                                content.append(ContactAppView.el);
                                contactAppView.render();
                            });
                        });
                    },

                    renderContactModify: function (id) {
                        require(["contact/views/create"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render({contactId: id}, 'modify', 'personal');
                                content.append(ContactAppView.el);
                            });
                        });
                    },


                    renderContactCreate: function () {
                        require(["contact/views/create"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render({}, 'create', 'personal');
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    renderContactCreatePersonal: function (groupId) {
                        require(["contact/views/create"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render({groupId: groupId}, 'create', 'personal');
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    renderContactCreateCompany: function (groupId) {
                        require(["contact/views/create"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render({groupId: groupId}, 'create', 'company');
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    renderDeptContactCreate: function (deptId, groupId) {
                        require(["contact/views/create"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render({groupId: groupId, deptId: deptId}, 'create', 'department');
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    renderContactModifyPersonal: function (groupId, contactId) {
                        require(["contact/views/create"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render({groupId: groupId, contactId: contactId}, 'modify', 'personal');
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    renderContactModifyCompany: function (groupId, contactId) {
                        require(["contact/views/create"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render({groupId: groupId, contactId: contactId}, 'modify', 'company');
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    /**
                     * 부서별 전체보기에서 사용자 클릭시 사용
                     * @param deptId
                     * @param groupId
                     * @param contactId
                     */
                    renderDeptContactModifyInTotal: function (deptId, contactId) {
                        require(["contact/views/create"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render({contactId: contactId, deptId: deptId}, 'modify', 'dept');
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    /**
                     * 부서 그룹 선택 후 사용자 클릭시 사용
                     * @param deptId
                     * @param groupId
                     * @param contactId
                     */
                    renderDeptContactModifyInGroup: function (deptId, groupId, contactId) {
                        require(["contact/views/create"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render({
                                    groupId: groupId,
                                    contactId: contactId,
                                    deptId: deptId
                                }, 'modify', 'dept');
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    renderContactSearch: function () {
                        require(["contact/views/search"], function (ContactAppView) {
                            DefaultLayout.render().done(function (layout) {
                                var content = layout.getContentElement();
                                ContactAppView.render();
                                content.append(ContactAppView.el);
                            });
                        });
                    },

                    connector: function (target) {
                        require(["jquery", "contact/views/connector"], function ($, ConnectorView) {
                            var view = new ConnectorView({'target': target});
                            $('body').append(view.el);
                            view.render();
                        });
                    },

                    print: function () {
                        require(["contact/views/print", "print"], function (View, PrintView) {
                            var printView = new PrintView();
                            var view = new View();
                            $("body").html(printView.render().$el);
                            printView.$el.find("#printArea").append(view.el);
                            view.render();
                        });
                    }
                };

                return Controller;

            })();

            return new ContactController();
        });
}).call(this);