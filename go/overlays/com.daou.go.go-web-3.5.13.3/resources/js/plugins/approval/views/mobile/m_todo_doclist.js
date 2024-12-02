define([
        // libraries...
        "views/mobile/m_more_list",
        "jquery",
        "backbone",
        "when",
        "hogan",
        "app",
        "i18n!nls/commons",
        "i18n!approval/nls/approval",
        "i18n!admin/nls/admin",
        "i18n!works/nls/works",

        "approval/views/mobile/m_pagination",
        "approval/views/mobile/m_doclist_item",
        "approval/views/mobile/document/m_appr_form_select",

        "approval/models/doclist_item",
        "collections/paginated_collection",
        "views/mobile/header_toolbar",
        'views/layouts/m_action_bar_default',
        'approval/views/mobile/base_approval',
        "approval/views/mobile/document/m_action_document",
        "hgn!approval/templates/mobile/m_doclist_empty",
        "hgn!approval/templates/mobile/m_doclist_bulk_toolbar",
        "hgn!approval/templates/mobile/m_doclist_item",

        "jquery.go-validation",
        "GO.util",
        'jquery.go-preloader'
    ],
    function (
        MoreView,
        $,
        Backbone,
        when,
        Hogan,
        GO,
        commonLang,
        approvalLang,
        adminLang,
        worksLang,
        PaginationView,
        DocListItemView,
        FormSelectView,
        DocListItemModel,
        PaginatedCollection,
        HeaderToolbarView,
        actionBar,
        BaseApprovalView,
        DocumentActionView,
        DocListEmptyTpl,
        DocListBulkToolbarTpl,
        DocListItemTpl
    ) {

        var lang = {
            'approval': approvalLang['전자결재'],
            '결재 대기 문서': approvalLang['결재 대기 문서'],
            'move_to_home': commonLang['홈으로 이동'],
            '일괄결재': approvalLang['일괄 결재'],
            '전체선택': commonLang['전체'] + commonLang['선택'],
            '전체해제': commonLang['전체'] + adminLang['해제'],
            'waitingMsg': worksLang['저장중 메세지'],
            '새결재': approvalLang['새결재'],
            '양식선택': approvalLang['결재양식 선택'],
        };

        var ConfigModel = Backbone.Model.extend({
            url: "/api/approval/apprconfig"
        });

        var ToolBarModel = Backbone.Model.extend({
            url: "/api/approval/authBulkComplete"
        });

        var UserApprConfigModel = Backbone.Model.extend({
            url: "/api/approval/usersetting/userconfig",
            getDefaultPhoto: function () {
                return 'resources/images/stamp_approved.png';
            }
        });

        var TodoList = PaginatedCollection.extend({
            initialize: function (options) {
                PaginatedCollection.prototype.initialize.call(this, options);
                _.extend(this.options, options || {});
            },
            model: DocListItemModel,
            url: function () {
                return '/api/approval/todo/all?';
            }
        });

        var preloader = null;
        var _savingFlag = false;

        return MoreView.extend({
                el: '#content',
                events: {},
                authBulkComplete: false,
                initialize: function (options) {
                    BaseApprovalView.prototype.initialize.call(this);
                    GO.util.appLoading(true);
                    this.options = options || {};
                    _.bindAll(this, 'render', 'renderPages');
                    this.collection = new TodoList();
                    var fragment = this.collection.url().replace('/api/', '');
                    var bUrl = GO.router.getUrl();
                    if (bUrl.indexOf("?") < 0) {
                        GO.router.navigate(fragment, {replace: true});
                    } else {
                        if (bUrl != fragment) {
                            GO.router.navigate(fragment, {trigger: false, pushState: true});
                        }
                    }
                    this.headerToolbarView = HeaderToolbarView;
                    this.addEvent();
                    var dataSet = {};
                    this.setFetchInfo(dataSet, this.collection);
                },
                addEvent: function () {
                    GO.EventEmitter.on('trigger-action', 'selectTodoCheckbox', this.selectTodoCheckbox, this);
                    GO.EventEmitter.on('trigger-action', 'dSelectTodoCheckbox', this.dSelectTodoCheckbox, this);
                    GO.EventEmitter.on('trigger-action', 'onBulkCompleteClicked', this.onBulkCompleteClicked, this);
                    this.$el.off('change', '#document_todo input');
                    this.$el.on('change', '#document_todo input', $.proxy(this.setToolbarTitle, this));
                    this.$el.off('vclick', '#document_todo input');
                    this.$el.on('vclick', '#document_todo input', $.proxy(function (e) {
                        var target = $(e.currentTarget);
                        if (target.is(':checked')) {
                            //체크 풀었을때
                            if ($('#document_todo input:checked').length == 1) {
                                //리스트에서 체크된 항목 없으면 헤더 변환
                                this.headerToolbarView.checkBoxHeader(e);
                            }
                        } else {
                            //체크했을때
                            if (!$('#document_todo input:checked').length > 0 && $("#checkedHeaderMenu").css("display") === "none") {
                                //리스트에서 체크된 항목 하나도 없었으면 헤더 변환
                                this.headerToolbarView.checkBoxHeader(e);
                            }
                        }
                    }, this));

                },
                setToolbarTitle: function () {
                    var checkedNum = $('#document_todo input[name="todoCheck"]:checked').length;
                    var totalNum = $('#document_todo input[name="todoCheck"]').length;
                    if (totalNum === checkedNum) {
                        $("#allTodoSelect").hide();
                        $("#allTodoDeselect").show();
                    } else {
                        $("#allTodoSelect").show();
                        $("#allTodoDeselect").hide();
                    }
                },
                getUseMenus: function () {

                    var useMenuList = [];
                    var menus = {
                        "전체선택": {
                            id: 'allTodoSelect',
                            text: lang['전체선택'],
                            triggerFunc: 'selectTodoCheckbox'
                        },
                        "전체해제": {
                            id: 'allTodoDeselect',
                            text: lang['전체해제'],
                            style: 'display:none',
                            triggerFunc: 'dSelectTodoCheckbox'
                        },
                        "일괄결재": {
                            id: 'btnBulkComplete',
                            text: lang['일괄결재'],
                            triggerFunc: 'onBulkCompleteClicked'
                        }
                    };
                    useMenuList.push(menus.전체선택);
                    useMenuList.push(menus.전체해제);
                    if (this.authBulkComplete) {
                        useMenuList.push(menus.일괄결재);
                    }

                    return useMenuList;
                },
                renderPages: function () {
                    this.$el.find('div.paging br_no').remove();
                },
                render: function () {
                    var self = this;
                    when(this.fetchConfig.call(this))
                        .then(_.bind(this.isAuthBulkComplete, this))
                        .then(_.bind(function () {

                            this.toolBarData = {
                                title: lang['결재 대기 문서'],
                                isList: true,
                                isSideMenu: true,
                                isHome: true,
                                isSearch: true,
                                checkedActionMenu: this.getUseMenus(),
                                checkedTargetEl: '#document_todo input',
                                isWriteBtn: true,
                                writeBtnCallback: function () {
                                    var formSelectToolBarData = {
                                        title: lang['양식선택'],
                                        isClose: true,
                                        closeCallback: function () {
                                            self.headerToolbarView.render(self.toolBarData);
                                            self.formSelectView.release();
                                            self.onScrollEvent();
                                            self.$el.find('#document_action').hide();
                                            self.$el.find('#document_todo').show();
                                        }
                                    };
                                    self.formSelectView = new FormSelectView({
                                        toolBarData: formSelectToolBarData
                                    });
                                    self.formSelectView.release();
                                    self.offScrollEvent();
                                    self.$el.find('#document_todo').hide();
                                    self.$el.find('#document_action').show();
                                    self.dSelectTodoCheckbox();
                                    $("#headerToolbar").removeClass('check_nav');
                                    self.assign(self.formSelectView, '#document_action');
                                }
                            };
                            this.headerToolbarView.render(this.toolBarData);

                            var renderListFunc = {
                                listFunc: $.proxy(function (collection) {
                                    this.renderList(collection);
                                }, this),
                                emptyListFunc: $.proxy(function () {
                                    this.$el.find('ul.list_box').append(DocListEmptyTpl({
                                        lang: {'doclist_empty': approvalLang['문서가 없습니다.']}
                                    }));
                                }, this)
                            };
                            this.setRenderListFunc(renderListFunc);

                            GO.util.appLoading(false);
                        }, this))
                        .then(_.bind(this.fetchCollection, this))
                        .then(_.bind(function () {
                            GO.util.pageDone();
                            this.$el.html(DocListItemTpl({
                                ulWrapperId: "document_todo",
                                otherClass: "list_box_approval",
                                documentAction: true
                            }));
                            this.dataFetch()
                                .done($.proxy(function (collection) {
                                    if (collection.length === 0) {
                                        this.renderListFunc.emptyListFunc();
                                    } else {
                                        this.renderListFunc.listFunc(collection);
                                        this.scrollToEl();
                                    }
                                }, this));
                        }, this))
                        .otherwise(function printError(err) {
                            console.log(err.stack);
                        });
                    GO.util.appLoading(false);
                },
                fetchConfig: function () {
                    var self = this;
                    this.useHold = true;
                    return this.config.fetch({
                        success: function (model) {
                            self.useHold = model.get('useHold');
                        }
                    });
                },
                fetchCollection: function () {
                    var deffered = when.defer();
                    this.collection.fetch({
                        success: function () {
                            deffered.resolve();
                        },
                        error: deffered.reject
                    });
                    return deffered.promise;
                },

                selectTodoCheckbox: function (e) {
                    /*e.preventDefault();
                    e.stopPropagation();*/
                    $("input[name=todoCheck]").prop('checked', true);
                    $("#allTodoSelect").hide();
                    $("#allTodoDeselect").show();
                },

                dSelectTodoCheckbox: function (e) {
                    /*e.preventDefault();
                    e.stopPropagation();*/
                    $("input[name=todoCheck]").prop('checked', false);
                    $("#allTodoSelect").show();
                    $("#allTodoDeselect").hide();
                },

                isAuthBulkComplete: function () {
                    var self = this;
                    var deffered = when.defer();
                    this.toolBarModel = new ToolBarModel();
                    this.authBulkComplete = true;
                    this.toolBarModel.fetch({
                        success: function (model) {
                            self.authBulkComplete = model.get('authBulkComplete');
                            deffered.resolve();
                        },
                        error: deffered.reject
                    });
                    return deffered.promise;
                },

                onBulkCompleteClicked: function (e) {
                    /*e.preventDefault();
                    e.stopPropagation();
                    var self = this;*/
                    var $checkedList = $('input[name=todoCheck]:checked'),
                        self = this,
                        buttons = [],
                        contents = [];

                    if ($checkedList.length < 1) {
                        alert(approvalLang['선택된 항목이 없습니다.']);
                        return;
                    }

                    var config = new UserApprConfigModel();

                    config.fetch({
                        success: function (model) {
                            var usePassword = model.get('passwordUseFlag');

                            var toolBarData = {
                                title: approvalLang['결재하기'],
                                rightButton: {
                                    text: approvalLang['결재'],
                                    callback: function () {
                                        var comment = $('#textarea-desc').val(),
                                            password = $('#apprPassword').val(),
                                            docIds = _.map($checkedList, function (el) {
                                                return parseInt($(el).attr('data-id'));
                                            });
                                        self.bulkComplete(docIds, comment, password).done(function (data, status, xhr) {
                                            alert(GO.i18n(approvalLang['{{arg1}}개의 결재가 완료되었습니다.'], {"arg1": data.data.length}));
                                        }).fail(function (data, status, xhr) {
                                            if (data.responseJSON.name == 'pwd.not.match') {
                                                alert(data.responseJSON.message);
                                            } else {
                                                alert(commonLang['500 오류페이지 타이틀']);
                                            }
                                        }).complete(function () {
                                            preloader.release();
                                            _savingFlag = false;
                                            $("#headerToolbar").removeClass('check_nav');
                                            GO.router.navigate("/approval/todo/all", {trigger: true});
                                        });
                                    }
                                },

                                cancelButton: {
                                    callback: $.proxy(function () {
                                        this.headerToolbarView.render(this.toolBarData);
                                        this.documentAction.release();

                                        $('#document_action').hide();
                                        $('#document_todo').show();
                                        this.dSelectTodoCheckbox();
                                        $("#headerToolbar").removeClass('check_nav');
                                    }, self)
                                }
                            };

                            self.documentAction = new DocumentActionView({
                                toolBarData: toolBarData,
                                isPassword: usePassword,
                                //header : self.$el.find('#doc_header').html(),
                                nextApproval: false,
                                useNextApproval: false
                            });
                            $('#document_todo').hide();
                            $('#document_action').show();
                            self.assign(self.documentAction, '#document_action');
                        }
                    });
                },

                bulkComplete: function (docIds, comment, password) {
                    if (_savingFlag) {
                        alert(lang['waitingMsg']);
                        return;
                    }
                    preloader = $.goPreloader();
                    _savingFlag = true;

                    return $.ajax({
                        url: GO.contextRoot + 'api/approval/document/bulkcomplete',
                        type: 'PUT',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            'comment': comment,
                            'password': password,
                            'docIds': docIds
                        })
                    });
                },

                assign: function (view, selector) {
                    view.setElement(this.$(selector)).render();
                },
                resetList: function (doclist) {
                    var self = this;
                    this.$el.append(DocListItemTpl({otherClass: "list_box_approval"}));
                    this.$el.find("ul.list_box").removeClass("list_apprChk");
                    this.$el.find('ul.list_box').empty();
                    var listType = "approval";
                    var useHold = this.useHold;
                    var authBulkComplete = this.authBulkComplete;
                    doclist.each(function (doc) {
                        var docListItemView = new DocListItemView({
                            model: doc,
                            listType: listType,
                            useHold: useHold,
                            total: doclist.total,
                            isCheckboxVisible: authBulkComplete
                        });
                        self.$el.find('ul.list_box').append(docListItemView.render().el);
                    });
                },
                renderList: function (doclist) {
                    var self = this;
                    var listType = "approval";
                    var useHold = this.useHold;
                    var authBulkComplete = this.authBulkComplete;
                    doclist.each(function (doc) {
                        var docListItemView = new DocListItemView({
                            model: doc,
                            listType: listType,
                            useHold: useHold,
                            total: doclist.total,
                            isCheckboxVisible: authBulkComplete
                        });
                        self.$el.find('ul.list_box').append(docListItemView.render().el);
                    });
                }
            },
            {
                __instance__: null,
                create: function () {
                    this.__instance__ = new this.prototype.constructor({el: $('#content')});
                    return this.__instance__;
                },
                render: function () {
                    var instance = this.create(),
                        args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];
                    return this.prototype.render.apply(instance, args);
                }
            });
    });
