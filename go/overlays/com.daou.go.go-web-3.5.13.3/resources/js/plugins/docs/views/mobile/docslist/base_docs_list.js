define('docs/views/mobile/docslist/base_docs_list', function (require) {
    var MoreView = require("views/mobile/m_more_list");
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var when = require("when");
    var GO = require("app");

    var DocsList = require("docs/collections/docs_list");
    var DocsFolderInfo = require("docs/models/doc_folder_info");
    var HeaderToolbarView = require('views/mobile/header_toolbar');

    var ListTmpl = require('hgn!docs/templates/mobile/docslist/base_docslist');
    var emptyTmpl = require('hgn!docs/templates/mobile/docslist/docslist_empty');
    var DocsListItemTmpl = require('hgn!docs/templates/mobile/docslist/docslist_item');

    var docsLang = require("i18n!docs/nls/docs");

    return MoreView.extend({
        el: "#content",
        initialize: function (options) {
            GO.util.appLoading(true);
            sessionStorage.setItem('list-folderType', undefined);
            this.options = options;
            this.folderType = this.options.folderType ? this.options.folderType : "";
            this.folderId = this.options.folderId;
            this.isHome = _.isUndefined(options.isHome) ? false : options.isHome;
            this.collection = new DocsList([], {
                folderType: this.folderType,
                folderId: this.folderId
            });
            if (this.isHome) {
                this.folderType = "latestread";
                this.collection.folderType = "latestread";
            }
            this.$el.off();

            if (this.folderId) {
                var _this = this;
                this.folder = new DocsFolderInfo({id: this.folderId});
                this.folder.fetch({async: false}).done(
                    function () {
                        _this.title = _this._getTitleName();
                    }
                );
            }
            var renderListFunc = {
                listFunc: $.proxy(function (collection) {
                    this.renderList(collection);
                }, this),
                emptyListFunc: $.proxy(function () {
                    $("#docsList").append(emptyTmpl({
                        lang: {
                            'doclist_empty': docsLang['문서없음']
                        }
                    }));
                }, this)
            };
            this.setRenderListFunc(renderListFunc);
            var dataSet = {
                keyword: this.keyword,
                property: this.property,
                direction: this.direction,
                searchType: this.searchType
            };
            this.setFetchInfo(dataSet, this.collection);

        },

        render: function () {
            $(".content_page").html(ListTmpl({}));
            var toolBarData = {
                title: this._getTitleName(),
                isList: true,
                isSideMenu: true,
                isHome: true,
                isSearch: true
            };
            HeaderToolbarView.render(toolBarData);
            this.dataFetch()
                .done($.proxy(function (collection) {
                    if (collection.length === 0) {
                        this.renderListFunc.emptyListFunc();
                    } else {
                        this.renderListFunc.listFunc(collection);
                        this.scrollToEl();
                    }
                }, this));
            GO.util.appLoading(false);
            return this;
        },

        renderList: function (collection) {
            _.each(collection.models, function (docs) {
                var doc = {
                    id: docs.getDocsId(),
                    docsInfoId: docs.getDocsInfoId(),
                    docsId: docs.getDocsId(),
                    folderId: docs.getFolderId(),
                    title: docs.getTitle(),
                    writer: docs.getCreatorName(),
                    writerId: docs.getCreatorId(),
                    writerPositionName: docs.getCreatorPositionName(),
                    writeDate: docs.getRequestDate(),
                    state: docs.getDocsStatus(),
                    stateName: docs.getDocsStatusName(),
                    statusClass: docs.getDocsStatusClass(),
                    folderPath: docs.getFolderPath(),
                    readDate: docs.getReadDate(),
                    completDate: docs.getCompleteDate(),
                    hasAttach: docs.hasAttach(),
                    attachCount: docs.getAttachCount(),
                    folderName: docs.getFolderName(),
                    commentCount: docs.getCommentCount(),
                    hasComment: docs.hasComment(),
                    docNum: docs.getDocNum()
                };
                var useDocsStatus = (this.folderType == "registwaiting" || this.folderType == "approvewaiting") ? true : false;
                var useCompletDate = (this.folderType == "registwaiting" || this.folderType == "approvewaiting") ? false : true;
                var useReadDate = (this.folderType == "latestread") ? true : false;
                var isNew = docs.get("completDate") ? GO.util.isCurrentDate(docs.get("completDate"), 1) : false;

                $("#docsList").append(DocsListItemTmpl({
                    doc: doc,
                    useDocsStatus: useDocsStatus,
                    useCompletDate: useCompletDate,
                    useReadDate: useReadDate,
                    isNew: isNew
                }));
            }, this);
            this.unbindEvent();
            this.bindEvent();
        },
        unbindEvent: function () {
            $("a[data-list-id]").unbind("click");
            $(window).off("orientation");
        },
        bindEvent: function () {
            var self = this;
            $("a[data-list-id]").click(function (e) {
                self._goDocsDetail(e);
            });
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
                return this.folder.getName();
            }
        },
        _goDocsDetail: function (e) {
            this.setSessionInfo(e);
            if (this.folderType != undefined && this.folderType != "" && this.folderType != null) {
                sessionStorage.setItem('list-folderType', this.folderType);
            }
            var docsId = e.currentTarget.getAttribute("data-id");
            var url = "/docs/detail/" + docsId;
            GO.router.navigate(url, true);
        }
    });
});