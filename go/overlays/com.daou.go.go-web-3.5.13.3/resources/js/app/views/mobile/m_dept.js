;define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");

    var DeptNodes = require("collections/deptNodes");
    var Tpl = require("hgn!templates/mobile/m_dept");
    var CommonLang = require("i18n!nls/commons");
    var ApprovalLang = require("i18n!approval/nls/approval");
    var SurveyLang = require("i18n!survey/nls/survey");

    var OrgMemberCollection = require("contact/collections/contacts_org_member");

    require("GO.util");

    var mobileOrgView = Backbone.View.extend({
        id: 'mobileOrg',
        attributes: {
            'data-role': 'layer',
            'style': 'background:white; position:absolute; width:100%; min-height:100%; top:0; left:0; z-index:102;'
        },
        lastScrollTop: 0,
        unbindEvent: function () {
            this.$el.off("change", "select[name=companySelect]");
            this.$el.off("vclick", "select[name=companySelect]");
            this.$el.off("vclick", "#companyText");
            this.$el.off("vclick", ".depthspan");
            this.$el.off("vclick", "div.dept_info");
            this.$el.off("vclick", ".btn.btn_plus");
            this.$el.off("vclick", ".nameTagItem");
            this.$el.off("keyup", "#searchKeyword");
            this.$el.off("vclick", "#btnSearch");
            this.$el.off("vclick", "#btnSearchResetBtn");
            this.$el.off("vclick", "a[data-btn='ok']");
            this.$el.off("vclick", "a[data-btn='cancel']");
            $(window).off('scroll');
        },
        bindEvent: function () {
            this.$el.on("change", "select[name=companySelect]", $.proxy(this.changeCompany, this));
            this.$el.on("vclick", "select[name=companySelect]", $.proxy(this.reloadCompany, this));
            this.$el.on("vclick", "#companyText", $.proxy(this.resetDeptList, this));
            this.$el.on("vclick", ".depthspan", $.proxy(this.clickBreadcrumbDept, this));
            this.$el.on("vclick", "div.dept_info", $.proxy(this.clickDeptNode, this));
            this.$el.on("vclick", ".btn.btn_plus", $.proxy(this.setActive, this));
            this.$el.on("vclick", ".nameTagItem", $.proxy(this.removeActive, this));
            this.$el.on("keyup", "#searchKeyword", $.proxy(this.searchKeyEvent, this));
            this.$el.on("vclick", "#btnSearch", $.proxy(this.search, this));
            this.$el.on("vclick", "#btnSearchResetBtn", $.proxy(this.resetDeptList, this));
            this.$el.on("vclick", "a[data-btn='ok']", $.proxy(this.sendSelectedNodes, this));
            this.$el.on("vclick", "a[data-btn='cancel']", $.proxy(this.back, this));
            this.$el.on("vclick", "#userNode", $.proxy(this.selectUser, this));

            $(window).on('scroll', $.proxy(this.detect_scroll, this));
        },
        initialize: function (options) {
            this.options = options || {};
            this.type = options.type || 'mydept';
            this.selectedNodes = [];
            this.depts = [];
            this.users = [];
            this.deptId = options.deptId || {};
            this.sendNodesCallback = options.sendSelectedNodesCallback;
            App.EventEmitter.trigger('common', 'scrollToTop', this);

            this.back = _.isFunction(options.backCallback) ? this.options.backCallback : this.back;
            this.lang = {
                'btn_ok': CommonLang['추가'],
                'btn_cancel': CommonLang['취소'],
                'search_placeholder': CommonLang['이름 또는 부서명을 검색해주세요.'],
                'search_result': CommonLang['검색결과'],
                'select': CommonLang['선택'],
                'search_result_null': CommonLang['검색결과없음'],
                'all': CommonLang['전체'],
                'include_child_dept': SurveyLang['하위 부서 포함하기'],
                'department': ApprovalLang['부서'],
                'dept_users': CommonLang['부서원'],
                "count": CommonLang["개"],
                'msg_duplicate_activity': ApprovalLang['중복된 대상입니다.']
            };

            this.options.lang = this.lang;

            if (this.type === "mydept") {
                this.options.lang.title = ApprovalLang['결재자 추가']
            } else if (this.type === "docReferenceReaders") {
                this.options.lang.title = ApprovalLang['참조자 추가']
            } else if (this.type === "docReceptionReaders") {
                this.options.lang.title = ApprovalLang['수신자 추가']
            } else if (this.type === "docReadingReaders") {
                this.options.lang.title = ApprovalLang['열람자 추가']
            } else if (this.type === "custom") {
                this.options.lang.title = ApprovalLang['담당자 지정']
            }

            this.tplUnit = {
                'listUser': Hogan.compile('<li id="userNode" data-id="{{type}}_{{nodeId}}"><a class="btn btn_plus" value="{{type}}_{{id}}" id="userSort_{{id}}"></a><a class="tit"><div class="photo"><img src="{{thumbnail}}"></div><div class="info" data-id="{{type}}_{{id}}"><span class="name txt_ellipsis">{{displayName}}</span><span class="mail txt_ellipsis"><span class="department">{{deptName}}</span>{{#isMultiCompany}}<span class="part">  |  </span><span class="department">{{companyName}}</span>{{/isMultiCompany}}</span></span></div></a> </li>'),
                'listDept': Hogan.compile('<li id="deptNode" data-id="{{type}}_{{id}}"><a class="btn btn_plus" value="{{type}}_{{id}}" id="userSort_{{id}}"></a><a class="tit">{{#isMultiCompany}}<span class="multi_company"><span class="txt">{{companyName}}</span></span>{{/isMultiCompany}}<div class="depart"><span class="txt">{{department}}</span></div><div class="info dept_info" data-id="{{type}}_{{id}}"><span class="name txt_ellipsis">{{title}}</span>{{#hasDeptChildren}}<span class="ic ic_arrow4" style="display: inline-block"></span>{{/hasDeptChildren}}</div></a></li>'),
                'deptItem': Hogan.compile('<a id="sub_dept" class="depthspan" data-id="{{deptId}}">{{deptName}}</a>'),
                'companyOptions': Hogan.compile('<option value="{{id}}">{{title}}</option>'),
                'companySelect': Hogan.compile('<select id="companySelect" name="companySelect"></select>'),
                'companyText': Hogan.compile('<a id="companyText">{{all}}</a>'),
                'deptNameTagTpl': Hogan.compile('<a value="{{dataId}}" class="nameTagItem"><li><div class="depart"><span class="txt">{{department}}</span></div><span class="name">{{name}}</span><span class="btn_wrap" id="btn_del"  value="{{dataId}}"><span class="btn btn_del_type2"></span></span></li></a>'),
                'deptNameWithSubDeptTagTpl': Hogan.compile('<a value="{{dataId}}" class="nameTagItem"><li><div class="depart"><span class="txt">{{department}}</span></div><span class="name">{{name}}</span><span class="name_option">{{included_depts}}</span><span class="btn_wrap" id="btn_del"  value="{{dataId}}"><span class="btn btn_del_type2"></span></span></li></a>'),
                'userNameTagTpl': Hogan.compile('<a value="{{dataId}}" class="nameTagItem"><li><div class="photo"><img src="{{thumbnail}}"></div><span class="name">{{name}}</span><span class="btn_wrap" id="btn_del"  value="{{dataId}}"><span class="btn btn_del_type2"></span></span></li></a>'),
                'emptyActiveTab': Hogan.compile('<div class="form_tr" id="emptyActiveTab"><div class="form_td"><div class="data_null">{{emptyTab}}</div></div></div>'),
                'listNull' : Hogan.compile('<li class="creat data_null"><span class="txt">{{search_result_null}}</span></li>'),
                'employeeNewWrap': '<div class="list_employee_new"><ul class="name_tag" id="activeBar"></ul></div>'
            };

            this.collection = new DeptNodes({type: this.type, deptid: this.deptId});

            this.collection.fetch({
                reset: true,
                async: true,
                statusCode: {
                    403: function () {
                        $(".wrap_search").hide();
                    }
                }
            });

            this.useSiteName = App.config('useSiteNameConfig');

            this.collection.bind('reset', this.setHeaderBreadList, this);
            this.collection.bind('reset', this.setOrgAndUserItems, this);
        },
        render: function () {
            this.unbindEvent();
            this.bindEvent();
            this.$el.css("height", $(document).height() + "px").html(Tpl(this.options));
            $('body').append(this.el);
            if (this.type === "custom") {
                $('div.list_employee_new').remove()
            }
        },
        selectUser: function (e) {

            if (this.type !== "custom") {
                return;
            }

            if ($(e.currentTarget).hasClass("choise")) {
                $(e.currentTarget).removeClass("choise");
                return;
            }

            var dataId = $(e.currentTarget).attr("data-id");
            $('#deptPeopleItem').children().removeClass("choise");
            $(e.currentTarget).addClass("choise");

            var selectedMember = _.first(_.filter(this.users, function (user) {
                var _dataId = user.type + "_" + user.nodeId;
                return _dataId === dataId
            }));

            this.selectedNodes = [];
            this.selectedNodes.push(selectedMember);
        },
        setActive: function (e) {
            e.preventDefault();

            var depts = $.extend({}, this.depts);
            var users = $.extend({}, this.users);
            var dataId = $(e.currentTarget).attr('value');
            var nodeType = dataId.split('_')[0];
            var nodeId = dataId.split('_')[1];

            var dept = _.find(depts, function (o) {
                return o.type === nodeType && o.id == nodeId
            });
            var user = _.find(users, function (o) {
                return o.type == nodeType && o.id == nodeId
            });

            if (_.isUndefined(dept) && _.isUndefined(user)) {
                throw new Error('잘못된 응답입니다');
                return;
            }
            var checkedItem = _.isUndefined(dept) ? user : dept;
            checkedItem.dataId = dataId;

            if (nodeType == 'org' && (this.type === 'docReferenceReaders' || this.type === 'docReadingReaders' || this.type === 'docReceptionReaders')) {
                checkedItem.includedSubDept = confirm(this.options.lang.include_child_dept);
            }

            var existedNode = _.some(this.selectedNodes, function (o) {
                return o.dataId === dataId;
            });

            if (existedNode) {
                GO.util.toastMessage(this.lang.msg_duplicate_activity);
                return;
            }

            this.selectedNodes.push(checkedItem);
            if ($("div.list_employee_new").length < 1) {
                $("div.docu_search").before(this.tplUnit.employeeNewWrap);
            }
            $('#activeBar').append(
                nodeType != 'org' ? this.tplUnit.userNameTagTpl.render(checkedItem) :
                    (checkedItem.includedSubDept ?
                        this.tplUnit.deptNameWithSubDeptTagTpl.render({
                            dataId: checkedItem.dataId,
                            department: ApprovalLang['부서'],
                            name: checkedItem.name,
                            included_depts: ApprovalLang['하위 포함']
                        }) : this.tplUnit.deptNameTagTpl.render({
                            dataId: checkedItem.dataId,
                            department: ApprovalLang['부서'],
                            name: checkedItem.name
                        }))
            );

            this.scrollToRightEnd("#activeBar");
        },
        scrollToRightEnd: function (el) {
            var e = $(el);
            var scrollWidth = e[0].scrollWidth;
            e.scrollLeft(scrollWidth);
        },
        removeActive: function (e) {
            e.preventDefault();

            var dataId = $(e.currentTarget).attr('value');
            var _selectedNodes = this.selectedNodes;

            this.selectedNodes = _.filter(_selectedNodes, function (o) {
                return o.dataId !== dataId
            });

            if (_.isEmpty(this.selectedNodes)) {
                $('div.list_employee_new').remove();
            }

            this.$el.find('.name_tag').find('a[value=' + dataId + ']').remove();
            this.$el.find('#select_count').text(this.selectedNodes.length + " 개");
        },
        setHeaderBreadList: function (data) {
            var self = this;
            var breadCrumb = this.$el.find('#userCheckedScroll');
            var companyInitialData = data.toJSON();
            if (this.isMultiSite(companyInitialData)) {
                breadCrumb.html(this.tplUnit.companySelect.render());
                $.each(companyInitialData, function (value, element) {
                    self.$el.find('#companySelect')
                        .append(self.tplUnit.companyOptions.render({
                            id: element.data.id,
                            title: element.data.title
                        }));
                });

            } else {
                if (this.type === "custom") {
                    var companyInitialDatum = companyInitialData[0];
                    var title;
                    if (this.useSiteName) {
                        title = companyInitialDatum.children[0].data.title;
                    } else {
                        title = companyInitialDatum.data.title;
                    }
                    breadCrumb.html(this.tplUnit.companyText.render({all: title}));
                } else {
                    breadCrumb.html(this.tplUnit.companyText.render({all: this.options.lang.all}));
                }
            }
        },
        setOrgAndUserItems: function (data) {
            this.clearNodes();
            var models;
            this.hasMultiCompany = this.isMultiSite(_.map(data.models, function (o) {
                return o.attributes
            }));

            if (this.hasMultiCompany) {
                var defaultCompany = data.models[0];
                models = defaultCompany.attributes.children;
            } else if (this.useSiteName === false) {
                models = data.toJSON();
            } else {
                models = _.first(_.map(data.models, function (model) {
                    return model.attributes.children;
                }));
            }

            if (this.type === "custom") {
                models = _.first(models).children
            }

            this.setDeptUsersNodes(models);
            this.drawItems();
        },
        isMultiSite: function (data) {
            var companies = _.filter(data, function (node) {
                return node.data.id.indexOf('company') !== -1
            });
            return companies.length > 1;
        },
        clickDeptNode: function (e) {
            var $currentTarget = $(e.currentTarget);
            $currentTarget.prop("disabled", true);
            if ($currentTarget.find('.ic.ic_arrow4').length === 0) {
                return
            }

            var preloader = $.goPreloader();
            e.preventDefault();
            var self = this;
            var deptId = $currentTarget.attr('data-id').split('_')[1];
            var deptName = $currentTarget.text();

            preloader.render();
            this.childCollection = new DeptNodes({type: this.type, deptid: deptId});
            this.childCollection.fetch({
                success: function (data) {
                    preloader.release();
                    $("#userCheckedScroll").append(self.tplUnit.deptItem.render({
                        deptId: deptId,
                        deptName: deptName
                    }));
                    self.scrollToRightEnd("#userCheckedScroll");
                    data = data.toJSON();

                    if (self.type === "custom") {
                        data = _.first(_.map(data, function (model) {
                            return model.children;
                        }));
                        if (self.useSiteName === true) {
                            data = _.first(data).children;
                        }
                    }

                    self.resetDeptItem(data);
                },
                error: function (collection, response, options) {
                    GO.util.toastMessage(response.responseText);
                    preloader.release();
                }
            });

        },
        clickCompany: function (e) {
            e.preventDefault();
            $('#companyText').nextAll().remove();
            var preloader = $.goPreloader();
            preloader.render();

            this.collection = new DeptNodes({type: this.type, deptid: this.deptId});
            this.collection.fetch({
                success: $.proxy(function (data) {

                    if (this.type === "custom") {
                        data = _.first(_.map(data.models, function (model) {
                            return model.attributes.children;
                        }));
                        if (this.useSiteName === true) {
                            data = _.first(data).children;
                        }

                    } else {

                        data = _.flatten(_.map(data.toJSON(), function (o) {
                            return o.children
                        }));
                    }

                    preloader.release();
                    this.resetDeptItem(data);
                }, this),
                error: function (collection, response, options) {
                    preloader.release();
                    GO.util.toastMessage(response.responseText);
                }
            });
        },
        changeCompany: function (e) {
            $('#companySelect').nextAll().remove();
            this.collection = new DeptNodes({type: this.type, deptid: this.deptId});
            this.collection.fetch({
                success: $.proxy(function (collection) {
                    this.companyReset(collection);
                }, this),
                error: function (collection, response, options) {
                    GO.util.toastMessage(response.responseText);
                }
            });
        },
        reloadCompany: function(){
            this.changeCompany();
        },
        clickBreadcrumbDept: function (e) {
            var self = this;
            var currentTarget = $(e.currentTarget);
            currentTarget.nextAll().remove();
            var deptId = currentTarget.attr('data-id');

            var preloader = $.goPreloader();
            preloader.render();

            this.collection = new DeptNodes({type: this.type, deptid: deptId});
            this.collection.fetch({
                success: $.proxy(function (collection) {
                    preloader.release();

                    collection = collection.toJSON();

                    if (self.type === "custom") {
                        collection = _.first(_.map(collection, function (model) {
                            return model.children;
                        }));

                        if (this.useSiteName === true) {
                            collection = _.first(collection).children;
                        }
                    }

                    this.resetDeptItem(collection);
                }, this),
                error: function (collection, response, options) {
                    preloader.release();
                    GO.util.toastMessage(response.responseText);
                }
            });
        },
        companyReset: function (collection) {
            this.clearNodes();
            var models = _.map(collection.models, function (o) {
                return o.attributes
            });

            var selectedCompany = _.find(models, function (model) {
                return model.data.id === $('#companySelect').val()
            });
            this.setDeptUsersNodes(selectedCompany.children);
            this.drawItems();
        },
        setDeptUsersNodes: function (collection) {
            $.each(collection, $.proxy(function (index, value) {
                if (value.data.id.includes("org")) {
                    var hasDeptChildren = (value.metadata.childrenCount > 0 || value.metadata.memberCount > 0);
                    this.depts.push({
                        title: value.data.title,
                        id: value.metadata.id,
                        email: value.metadata.email,
                        originalEmail: value.metadata.email,
                        name: value.metadata.name,
                        type: value.data.id.split('_')[0],
                        includedSubDept: false,
                        code: value.metadata.code,
                        useReception: value.metadata.useReception,
                        useReference: value.metadata.useReference,
                        hasDeptChildren: hasDeptChildren
                    });
                } else if (_.contains(['MASTER', 'MODERATOR', 'MEMBER'], value.data.id.split('_')[0])) {
                    this.users.push({
                        nodeId: value.attr.nodeId,
                        id: value.metadata.id,
                        companyName: value.metadata.companyName,
                        email: value.metadata.email,
                        originalEmail: value.metadata.email,
                        name: value.metadata.name,
                        type: value.data.id.split('_')[0],
                        duty: value.metadata.duty,
                        deptId: value.metadata.deptId,
                        deptName: value.metadata.deptName,
                        position: value.metadata.position,
                        displayName: value.metadata.name + value.metadata.position,
                        thumbnail: value.metadata.thumbnail,
                        employeeNumber: value.metadata.employeeNumber,
                        loginId: value.metadata.loginId
                    });
                }
            }, this));
        },
        clearNodes: function () {
            $('#deptItem').empty();
            $('#deptPeopleItem').empty();
            this.depts = [];
            this.users = [];
        },
        resetDeptItem: function (collection) {
            this.clearNodes();
            this.setDeptUsersNodes(collection);
            this.drawItems()
        },
        drawItems: function () {

            var $deptListTitle = $('#dept_list_title');
            var $usersListTitle = $('#users_list_title');
            this.depts.length === 0 ? $deptListTitle.hide() : $deptListTitle.show();
            this.users.length === 0 ? $usersListTitle.hide() : $usersListTitle.show();
            _.each(this.depts, $.proxy(function (o) {
                o.department = ApprovalLang['부서'];
                this.$el.find('#deptItem').append(this.tplUnit.listDept.render(o));
            }), this);

            _.each(this.users, $.proxy(function (o) {
                this.$el.find('#deptPeopleItem').append(this.tplUnit.listUser.render(o));
            }), this);

            if (this.type === "custom") {
                $('.btn_plus').remove()
            }
        },
        searchKeyEvent: function (e) {
            e.preventDefault();
            if (e.keyCode === 13) {
                this.search()
            }
            return false;
        },
        search: function (e) {
            var keyword = this.$el.find('#searchKeyword').val();

            this.$el.find('.bcr').hide();
            this.$el.find('#dept_list_title');
            if (!keyword) {
                GO.util.toastMessage(CommonLang["검색어를 입력하세요."]);
                return;
            }
            this.getDeptUserList(0, keyword);
            this.$el.find('.ic.ic_arrow4').remove();
            return false;
        },
        getDeptUserList: function (page, keyword) {
            var nodeType = {};
            var nodeId = {};

            if (this.type === "custom") {
                nodeType = "department";
                nodeId = this.deptId
            }
            var orgMemberCollection = OrgMemberCollection.getCollection(null, keyword, page, nodeType, nodeId);
            this.searchedResult(orgMemberCollection.toJSON());
        },
        searchedResult: function (orgMemberCollection) {
            this.clearNodes();
            this.users = [];
            this.depts = [];
            if (orgMemberCollection.length < 1) {
                $(".docu_body .list_title").show();
                $("#deptItem").html(this.tplUnit.listNull.render(this.lang));
                $("#deptPeopleItem").html(this.tplUnit.listNull.render(this.lang));
                return
            }
            _.each(orgMemberCollection, $.proxy(function (value) {
                if (value.nodeType == "user") {
                    this.users.push({
                        nodeId: value.employeeNumber,
                        id: value.id,
                        companyName: value.companyName,
                        email: value.email,
                        originalEmail: value.originalEmail,
                        name: value.name,
                        type: "user",
                        duty: value.duties[0],
                        deptId: value.departmentIds[0],
                        deptName: value.departments[0],
                        position: value.position,
                        displayName: value.name + value.position,
                        thumbnail: value.thumbnail,
                        employeeNumber: value.employeeNumber,
                        loginId: value.loginId,
                        isMultiCompany: this.hasMultiCompany
                    });
                } else if (value.nodeType == "department") {
                    this.depts.push({
                        title: value.name,
                        id: value.id,
                        email: value.email,
                        originalEmail: value.email,
                        name: value.name,
                        type: 'org',
                        includedSubDept: false,
                        userReception: value.useReception,
                        useReference: value.useReference,
                        isMultiCompany: this.hasMultiCompany,
                        companyName: value.companyName
                    });
                }
            }, this));
            this.drawItems();
        },
        resetDeptList: function () {
            this.$el.find('#searchKeyword').val('');

            this.collection = new DeptNodes({type: this.type, deptid: this.deptId});
            this.$el.find('.bcr').show();

            this.collection.fetch({
                success: $.proxy(function (data) {
                    this.$el.find('#companySelect').show();
                    this.setHeaderBreadList(data);
                    this.setOrgAndUserItems(data)
                }, this),
                error: function (collection, response, options) {
                    GO.util.toastMessage(response.responseText);
                }
            });
            return false;
        },
        sendSelectedNodes: function (e) {
            var selectedNodes = this.selectedNodes;
            this.sendNodesCallback(this, e, selectedNodes);
            return false;
        },
        back: function (e) {
            $("#mobileOrg").remove();
            e.preventDefault();
            return false;
        },
        close: function (e) {
            $("#mobileOrg").remove();
            e.preventDefault();
            return false;
        },
        detect_scroll: function (e) {
            if (_.isUndefined(e.currentTarget)) {
                return;
            }

            var scrollToTopBtn = $('#scrollToTop');
            var scrollY = e.currentTarget.scrollY;
            if (scrollY > this.lastScrollTop) {
                scrollToTopBtn.hide();
            } else if (scrollY < this.lastScrollTop && scrollY > 30) {
                scrollToTopBtn.show();
            } else {
                scrollToTopBtn.hide();
            }
            this.lastScrollTop = scrollY;
        }
    });
    return mobileOrgView;
});
