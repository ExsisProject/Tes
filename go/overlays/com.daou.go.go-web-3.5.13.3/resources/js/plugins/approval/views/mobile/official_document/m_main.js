;(function () {
    define([
            "jquery",
            "backbone",
            "hogan",
            "app",
            "when",

            "approval/models/doclist_item",

            "views/mobile/header_toolbar",
            "approval/views/mobile/official_document/m_toolbar",
            "approval/views/mobile/official_document/m_document",
            "approval/views/mobile/official_document/m_action_document",

            "hgn!approval/templates/mobile/official_document/m_main",

            "i18n!nls/commons",
            "i18n!approval/nls/approval",
            "jquery.go-validation",
            "GO.util",
            "iscroll"
        ],
        function (
            $,
            Backbone,
            Hogan,
            GO,
            when,
            DocListItemModel,
            HeaderToolbarView,
            ToolbarView,
            DocumentView,
            DocumentActionView,
            MainTpl,
            commonLang,
            approvalLang
        ) {

            var lang = {
                '승인하기': approvalLang['승인하기'],
                'move_to_home': commonLang['홈으로 이동'],
                'approval': approvalLang['전자결재'],
                "공문 발송 취소 여부": approvalLang["공문 발송 취소 여부"],
                "공문 재발송 여부": approvalLang["공문 재발송 여부"]
            };

            var OfficialModel = Backbone.Model.extend({
                url: function () {
                    return ['/api/approval/official', this.officialId].join('/');
                },
                initialize: function (options) {
                    this.officialId = options.officialId;
                },
                getOfficialId: function () {
                    return this.get('officialVersion').id;
                }
            });

            var MainView = Backbone.View.extend({
                    el: '#content',
                    events: {
                        "vclick #copyUrl": "copyUrl"
                    },
                    initialize: function (options) {
                        this.allowAction = true;
                        GO.util.appLoading(true);

                        this.options = options || {};
                        this.officialId = this.options.officialId;
                        this.model = new OfficialModel({officialId: this.officialId});
                        this.toolBarData = {title: approvalLang['상세 내용 조회'], isPrev: true};

                        GO.EventEmitter.off("change:comment");
                        GO.EventEmitter.on("common", "change:comment", _.bind(function (count) {
                            this.$el.find('#commentCount').text(count);
                        }, this));

                    },

                    render: function () {
                        when(this.fetchModel())
                            .then(_.bind(function renderMe() {
                                var doc = {
                                    title: this.model.get('title')
                                };
                                this.$el.html(MainTpl({
                                    doc: doc
                                }));
                                this.renderTitleToolbarView();
                                this.renderSubView();
                                this.bindSubView();
                            }, this))
                            .then(_.bind(this.show_document, this))
                            .otherwise(function printError(error) {
                                GO.util.linkToErrorPage(error);
                            });
                    },
                    copyUrl: function (e) {
                        GO.util.copyUrl(e);
                    },
                    renderSubView: function () {
                        var self = this;
                        this.toolbarView = new ToolbarView({
                            model: this.model
                        });
                        this.assign(this.toolbarView, 'div.tool_bar');
                        this.documentView = new DocumentView({
                            model: this.model
                        });
                        this.assign(this.documentView, '#document_view');

                        /*this.officialDocReceiverView = new OfficialDocReceiverView({
                            dataList: this.model.get('officialVersion'),
                            isAdmin : false
                        });
                        this.append(this.officialDocReceiverView, '#docinfo_section');*/
                    },

                    bindSubView: function () {
                        this.toolbarView.bind('actList', this.actList, this);
                        this.toolbarView.bind('approved', this.doApprove, this);
                        this.toolbarView.bind('returned', this.doReturn, this);
                        this.toolbarView.bind('retracted', this.doRetract, this);
                        this.toolbarView.bind('rerequested', this.doRerequest, this);
                        this.toolbarView.bind('show_document', this.show_document, this);
                    },

                    renderTitleToolbarView: function () {
                        this.headerToolbarView = HeaderToolbarView;
                        this.headerToolbarView.render(this.toolBarData);
                    },
                    fetchModel: function () {
                        var defer = when.defer();
                        this.model.fetch({
                            success: defer.resolve,
                            error: defer.reject
                        });
                        return defer.promise;
                    },
                    //승인
                    doApprove: function () {
                        var self = this;
                        var toolBarData = {
                            title: lang['승인하기'],
                            rightButton: {
                                text: approvalLang['승인'],
                                callback: function () {
                                    self.saveApprAction("APPROVE");
                                }
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            header: self.$el.find('#doc_header').html()
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    //반려
                    doReturn: function () {
                        var self = this;
                        var toolBarData = {
                            title: approvalLang['반려하기'],
                            rightButton: {
                                text: approvalLang['반려'],
                                callback: function () {
                                    self.saveApprAction("RETURN");
                                }
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            header: self.$el.find('#doc_header').html()
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    //공문 발송 취소
                    doRetract: function () {
                        var self = this;
                        if (confirm(lang['공문 발송 취소 여부'])) {
                            var model = new OfficialModel({
                                id: this.model.get('officialVersion').id,
                                officialId: this.model.get('officialVersion').id
                            });
                            /*model.set({
                                //'comment' : $("#textarea-desc").val(),
                            }, {
                                silent : true
                            });*/
                            model.save({}, {
                                type: 'PUT',
                                url: ['/api/approval/official/cancel', this.model.getOfficialId()].join('/'),
                                success: function (model, result) {
                                    if (result.code == 200) {
                                        self.actList();
                                    }
                                },
                                error: function (model, rs) {
                                    var responseObj = JSON.parse(rs.responseText);
                                    if (responseObj.message) {
                                        alert(responseObj.message);
                                        return false;
                                    } else {
                                        alert(approvalLang['발송 취소에 실패 하였습니다']);
                                        return false;
                                    }
                                }
                            });
                        } else {
                            _.delay(function () {
                                self.toolbarView.$('#selectAction').val('');
                            }, 100);
                        }
                    },
                    //공문 재발송
                    doRerequest: function () {
                        var self = this;
                        if (confirm(lang['공문 재발송 여부'])) {
                            var model = new OfficialModel({
                                id: this.model.get('officialVersion').id,
                                officialId: this.model.get('officialVersion').id
                            });
                            /*model.set({
                                //'comment' : $("#textarea-desc").val(),
                            }, {
                                silent : true
                            });*/
                            model.save({}, {
                                type: 'PUT',
                                url: ['/api/approval/official/rerequest', this.model.getOfficialId()].join('/'),
                                success: function (model, result) {
                                    if (result.code == 200) {
                                        self.actList();
                                    }
                                },
                                error: function (model, rs) {
                                    var responseObj = JSON.parse(rs.responseText);
                                    if (responseObj.message) {
                                        alert(responseObj.message);
                                        return false;
                                    } else {
                                        alert(approvalLang['발송에 실패 하였습니다']);
                                        return false;
                                    }
                                }
                            });
                        } else {
                            _.delay(function () {
                                self.toolbarView.$('#selectAction').val('');
                            }, 100);
                        }
                    },
                    saveApprAction: function (actionName) {
                        var self = this;
                        if (!this.allowAction) {
                            return;
                        }
                        if (!this.actionApprValidate('#textarea-desc', actionName)) {
                            this.allowAction = true;
                            return false;
                        }
                        this.allowAction = false;

                        var property = "document.draftedAt";
                        var direction = "desc";
                        var searchtype = sessionStorage.getItem('list-history-searchtype');
                        var keyword = sessionStorage.getItem('list-history-keyword') && sessionStorage.getItem('list-history-keyword').replace(/\+/gi, " ");
                        var duration = "all";
                        var fromDate = "";
                        var toDate = "";

                        if (sessionStorage.getItem('list-history-duration') && sessionStorage.getItem('list-history-duration') != "") {
                            duration = sessionStorage.getItem('list-history-duration');
                        }
                        if (duration == "period" && sessionStorage.getItem('list-history-fromDate') && sessionStorage.getItem('list-history-fromDate') != "") {
                            fromDate = sessionStorage.getItem('list-history-fromDate');
                            toDate = sessionStorage.getItem('list-history-toDate');
                        }

                        var model = new OfficialModel({
                            id: this.model.get('officialVersion').id,
                            officialId: this.model.get('officialVersion').id
                        });
                        if (actionName == 'APPROVE') {
                            url = ['/api/approval/official/approve', this.model.getOfficialId()].join('/');
                        } else if (actionName == 'RETURN') {
                            url = ['/api/approval/official/return', this.model.getOfficialId()].join('/');
                        }
                        var param = $.param({comment: $("#textarea-desc").val()});
                        url += "?" + param;

                        var promise = model.save({}, {
                            type: 'PUT',
                            url: url,
                            success: function (model, result) {
                                self.allowAction = true;
                                if (result.code == 200) {
                                    if (actionName == "APPROVE"
                                        || actionName == "RETURN") {
                                        sessionStorage.setItem('list-history-pageNo', 0);
                                        GO.util.navigateToBackList();
                                    }
                                }
                            },
                            error: function (model, rs) {
                                self.allowAction = true;
                                var responseObj = JSON.parse(rs.responseText);
                                if (responseObj.message) {
                                    alert(responseObj.message);
                                    return false;
                                } else {
                                    alert(approvalLang['저장에 실패 하였습니다.']);
                                    return false;
                                }
                            }
                        });
                        GO.util.preloader(promise);
                    },

                    actionApprValidate: function (descEl, actionName) {
                        var description = $(descEl).val();
                        var max = 1000;
                        if (actionName == "RETURN" && $.trim(description) == '') {
                            setTimeout(function () {
                                alert(approvalLang['의견을 작성해 주세요']);
                            }, 10);
                            return false;
                        }
                        if (description && description.length > max) {
                            setTimeout(function () {
                                alert(GO.i18n(approvalLang["{{max}}자 이하로 입력해 주십시오"], {'max': max}));
                            }, 10);
                            return false;
                        }
                        return true;
                    },
                    show_document: function () {
                        var self = this;
                        this.documentView.$el.parent().show();
                        this.decideIscrollInit();
                        $(window).on("orientation", function () {
                            self.decideIscrollInit();
                        });
                    },
                    show_official_doc_receiver: function () {
                        this.documentView.$el.parent().hide();
                        this.decideIscrollInit();
                    },
                    decideIscrollInit: function () {
                        if ($(document).width() < this.documentView.$el.width()) {
                            GO.util.initDetailiScroll('document_iscroll', 'document_hscroll', 'document_view');
                        }
                    },
                    actList: function (e) {
                        var baseUrl = sessionStorage.getItem('list-history-baseUrl');
                        if (baseUrl) {
                            GO.router.navigate(baseUrl, {trigger: true});
                        } else {
                            GO.router.navigate('approval', {trigger: true});
                        }
                    },
                    docActionRelease: function () {
                        this.headerToolbarView.render(this.toolBarData);
                        this.$el.find('#document_main').show();
                        this.$el.find('#document_action').hide();
                        this.$el.find('#selectAction').val("");
                        this.documentAction.release();
                    },
                    assign: function (view, selector) {
                        view.setElement(this.$(selector)).render();
                    },

                    append: function (view, selector) {
                        this.$(selector).append(view.render().el);
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
            return MainView;
        });
}).call(this);