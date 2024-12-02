define('docs/views/mobile/detail', function (require) {

    var Backbone = require('backbone');

    var DetailTemplate = require('hgn!docs/templates/mobile/detail');
    var DocsActionView = require('docs/views/mobile/docs_action');
    var docsModel = require("docs/models/docs_doc_item");
    var folderModel = require("docs/models/doc_folder_info");
    var HeaderToolbarView = require("views/mobile/header_toolbar");
    var approvalLang = require("i18n!approval/nls/approval");
    var FontResize = require('views/mobile/m_font_resize');
    var commonLang = require('i18n!nls/commons');
    var docsLang = require("i18n!docs/nls/docs");
    require('go-fancybox');

    var RejectModel = Backbone.Model.extend({

        initialize: function (options) {
            this.docsId = options.docsId;
        },

        url: function () {
            return GO.contextRoot + "api/docs/" + this.docsId + "/rejected";
        }

    });

    var RejectTmpl = Hogan.compile(
        '<span class="state notyet">{{lang.반려}}</span>' +
        '<span class="subject">&nbsp;{{model.message}}</span>' +
        '<div class="info">' +
        '<span class="name">{{model.userName}} {{model.positionName}}</span>' +
        '<span class="part"> | </span>' +
        '<span class="date">{{date}}</span>' +
        '</div>'
    );

    var lang = {
        "등록자": docsLang["등록자"],
        "등록일": commonLang["등록일"],
        "보존연한": docsLang["보존연한"],
        "문서상태": docsLang["문서상태"],
        "문서번호": docsLang["문서번호"],
        "변경사유": docsLang["변경 사유"],
        "상세내용": docsLang["상세내용"],
        "자세히": commonLang["자세히"],
        "승인대기": docsLang["승인대기"],
        "반려": docsLang["반려"],
        "문서버전": docsLang["문서버전"]
    };

    return Backbone.View.extend({
        initialize: function (options) {
            this.options = options;
            this.docsId = this.options.docsId;
        },

        dataFetch: function () {
            var fetchFolder = $.Deferred();
            var fetchDocs = $.Deferred();
            var self = this;

            this.folderType = sessionStorage.getItem('list-folderType');

            if (this.docsId) {
                this.docsModel = new docsModel({id: this.docsId});
                if (this.folderType != "undefined" && this.folderType != null) {
                    this.docsModel.folderType = this.folderType;
                    this.docsModel.type = "folderType";
                }
                this.docsModel.fetch({
                    error: function (model, error) {
                        GO.util.linkToErrorPage(error);
                    }
                }).done($.proxy(function () {
                    fetchDocs.resolve();
                    this.folderId = this.docsModel.getFolderId();
                    this.folderModel = new folderModel({id: this.folderId});
                    this.folderModel.fetch({
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
                    }).done(function () {
                        fetchFolder.resolve();
                    });
                }, this));
            } else {
                fetchDocs.resolve();
                fetchFolder.resolve();
            }

            var deferred = $.Deferred();
            $.when(fetchDocs, fetchFolder).done(function () {
                deferred.resolve(self);
            });

            return deferred;
        },

        render: function () {
            $(".content_page").html(DetailTemplate({
                lang: lang,
                docsModel: this.docsModel.toJSON(),
                preserveYear: this.makePreserveYear(),
                completeDate: this.docsModel.getCompleteDate(),
                needState: this.docsModel.isNeedState() || this.docsModel.getDocsStatus() == "TEMPSAVE",
                wait: this.docsModel.getDocsStatus() == "APPROVEWAITING",
                version: "VER " + this.docsModel.getVersion(),
                reject: this.docsModel.getDocsStatus() == "REJECT",
                temp: this.docsModel.getDocsStatus() == "TEMPSAVE",
                stateName: this.docsModel.getDocsStatusName(),
                useDocNum: this.folderModel.useDocNum() && !_.isUndefined(this.docsModel.get('docNum')) && !_.isEmpty(this.docsModel.get('docNum'))
            }));

            if (this.docsModel.getDocsStatus() == "REJECT") {
                this._renderReject();
            }
            this._renderHeader();
            this._renderAction();
            GO.util.imageLoadCheck('editorView').done($.proxy(function () {
                this.initIscroll();
            }, this));
            this.initWindowEvent();
            this.fontResizeLayerAdd();
            $("#copyUrl").on("vclick", function (e) {
                GO.util.copyUrl(e);
            });
            return this;
        },
        initIscroll: function () {
            if($(document).width() < $("#editorView .editor_view").width()) {
                GO.util.initDetailiScroll("iScrollContentWrap", "docsContentLayout", "editorView");
            }
        },
        fontResizeLayerAdd: function () {
            FontResize.render({
                el: "#fontResizeWrap",
                targetContentEl: "#docsContentLayout"
            });
        },
        initWindowEvent: function () {
            this.orientationWindowEvent = {
                name: 'orientation',
                event: function () {
                    this.initIscroll();
                }
            };
            this.setTimeoutToWindowEventHandler(this.orientationWindowEvent);
        },
        setTimeoutToWindowEventHandler: function (eventHandler) {
            var self = this;
            $(window).on(eventHandler.name, function () {
                if (this.timeout) clearTimeout(this.timeout);
                this.timeout = setTimeout($.proxy(eventHandler.event, self), 200);
            });
        },

        _renderReject: function () {

            this.rejectModel = new RejectModel({docsId: this.docsModel.id});
            this.rejectModel.fetch({
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
                },

                success: function (model) {
                    var renderView = RejectTmpl.render({
                        lang: {"반려": docsLang["반려"]},
                        model: model.toJSON(),
                        date: GO.util.shortDate(model.get("createdAt"))
                    });
                    this.$('#rejectWrap').append(renderView);
                }
            });

        },

        makePreserveYear: function () {
            return (this.docsModel.getDocsYear() == 0) ? approvalLang['영구'] : this.docsModel.getDocsYear() + approvalLang['년'];
        },

        _renderAction: function () {
            this.actionView = new DocsActionView({
                model: this.docsModel,
                folderInfo: this.docsModel.folderType,
                folderModel: this.folderModel
            });
            this.actionView.setElement($("#actionArea")).render();
        },

        _getTitleName: function () {
            if (this.folderType == "latestread") {
                return docsLang["최근 열람 문서"];
            } else if (this.folderType == "latestupdate") {
                return docsLang["최근 업데이트 문서"];
            } else if (this.folderType == "registwaiting") {
                return docsLang["등록 대기 문서"];
            } else if (this.folderType == "approvewaiting") {
                return docsLang["승인 대기 문서"];
            } else {
                return this.folderModel.getName();
            }
        },

        _renderHeader: function () {
            this.headerToolbarView = HeaderToolbarView;
            this.headerToolbarView.render({
                title: this._getTitleName(),
                isPrev: true
            });
        }
    });
});