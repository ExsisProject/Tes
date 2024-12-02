;(function () {
    define([
            "views/mobile/m_more_list",
            "jquery",
            "backbone",
            "hogan",
            "app",
            "i18n!nls/commons",
            "hgn!webfolder/templates/mobile/m_webfolder_list_unit",
            "hgn!webfolder/templates/mobile/m_webfolder_list",
            "webfolder/collections/webfolders_shared",
            "webfolder/collections/webfolders_list",
            "jquery.go-validation",
            "GO.util"
        ],
        function (
            MoreView,
            $,
            Backbone,
            Hogan,
            App,
            commonLang,
            LayoutUnitTpl,
            LayoutTpl,
            WebSharedFoldersCollection,
            WebFolderListCollection
        ) {

            var lang = {
                'board': commonLang['게시판'],
                'webfolder_title': commonLang['자료실'],
                'private_webfolder': commonLang['개인 자료실'],
                'public_webfolder': commonLang['전사 자료실'],
                'attach': commonLang['첨부'],
                'no_list': commonLang['등록된 파일이 없습니다.'],
                'select_all': commonLang['전체선택'],
                'select_cancel': commonLang['전체해제']
            };
            var layoutView = MoreView.extend({
                id: 'webFolderView',
                attributes: {
                    'data-role': 'layer',
                    'style': 'background:#fff; position:absolute; width:100%; min-height:100%; top:0; left:0; z-index:999'
                },
                unbindEvent: function () {
                    this.$el.off("vclick", "#closeWebFolder");
                    this.$el.off("vclick", ".goSubWebFolder");
                    this.$el.off("vclick", "#moveParentWebFolder");
                    this.$el.off("vclick", ".clickFile");
                    this.$el.off("change", "input[type=checkbox]");
                    this.$el.off("change", "#webFolderDirectory");
                    this.$el.off("vclick", "#uncheckAllFile");
                    this.$el.off("vclick", "#selectAllFile");
                    this.$el.off("vclick", "#attachFile");
                },
                bindEvent: function () {
                    this.$el.on("vclick", "#closeWebFolder", $.proxy(this.closeWebFolder, this));
                    this.$el.on("vclick", ".goSubWebFolder", $.proxy(this.moveSubWebFolder, this));
                    this.$el.on("vclick", "#moveParentWebFolder", $.proxy(this.moveParentWebFolder, this));
                    this.$el.on("vclick", ".clickFile", $.proxy(this.clickFile, this));
                    this.$el.on("change", "input[type=checkbox]", $.proxy(this.clickCheckbox, this));
                    this.$el.on("change", "#webFolderDirectory", $.proxy(this.changeFolderDirectory, this));
                    this.$el.on("vclick", "#uncheckAllFile", $.proxy(this.uncheckAllFile, this));
                    this.$el.on("vclick", "#selectAllFile", $.proxy(this.selectAllFile, this));
                    this.$el.on("vclick", "#attachFile", $.proxy(this.attachFile, this));
                },
                initialize: function () {
                    GO.util.appLoading(true);
                    this.webFolderParamHistoryList = [];
                    this.$listEl = null;
                    this.webFolderListCollection = new WebFolderListCollection;
                    this.webSharedFoldersCollection = WebSharedFoldersCollection.getCollection();
                    $("#webFolderDirectory option[data-type=share]").remove();

                    var renderListFunc = {
                        listFunc: $.proxy(function (collection) {
                            this.renderList(collection);
                        }, this)
                    };

                    this.dataSet = {
                        path: "/",
                        fullPath: "/",
                        type: "user"
                    };
                    this.webFolderParamHistoryList.push(this.dataSet);
                    this.setRenderListFunc(renderListFunc);
                    this.setFetchInfo(this.dataSet, this.webFolderListCollection);
                    this.pageNo = 1;
                },

                render: function () {
                    GO.util.pageDone();
                    this.unbindEvent();
                    this.bindEvent();
                    this.options = $.extend(this.options, arguments[0] || {});
                    var sharedFolderNameList = this.webSharedFoldersCollection.toJSON();
                    var tmpl = LayoutTpl({
                        lang: lang
                    });
                    this.$el.html(tmpl);
                    $('body').append(this.el);
                    this.renderSharedFolderNameList(sharedFolderNameList);
                    this.renderHeader(this.dataSet);
                    this.$el.find("#webfolderList").empty();
                    this.dataFetch()
                        .done($.proxy(function (collection) {
                            this.renderListFunc.listFunc(collection);
                        }, this));
                    GO.util.appLoading(false);
                },

                renderList: function () {
                    var _dataSet = this.webFolderListCollection.toJSON()[0];
                    var formattedFileSize = function (num) {
                        if (num > 1024 * 1024) {
                            var size = Math.floor((num * 10) / (1024 * 1024));
                            return parseInt((size / 10)) + "MB";
                        } else if (num > 1024) {
                            var size = Math.floor((num * 10) / (1024));
                            return parseInt((size / 10)) + "KB";
                        } else {
                            return num + "B";
                        }
                    };

                    _.each(_dataSet.messages, function (message) {
                        message.formattedFileSize = formattedFileSize(message.webFolderFileSize);
                        message.formattedUtcDate = moment(message.webFolderFileUtcDate).format('YYYY-MM-DD');
                    });
                    if (_dataSet.messages.length === 0 && _dataSet.folders.length === 0) {
                        _dataSet = null;
                    }
                    var unitTmpl = LayoutUnitTpl({
                        dataSet: _dataSet,
                        lang: lang
                    });
                    if (this.pageNo === 1) {
                        this.$el.find("#webfolderList").empty();
                    }
                    this.$el.find("#webfolderList").append(unitTmpl)
                },

                renderSharedFolderNameList: function (sharedFolderNameList) {
                    var _this = this;
                    _.each(sharedFolderNameList[0].webfolder, function (folder) {
                        $("#webFolderDirectory").append("<option data-type='share' data-sroot='" + folder.sroot + "' data-full-path='" + folder.fullName + "' data-userseq='" + folder.mailUserSeq + "' >" + folder.name + "</option>");
                    });
                    _this.$el.find("#webFolderDirectory").val("user").prop("selected", true);
                },

                closeWebFolder: function () {
                    $("#goBody").show();
                    $("#webFolderView").remove();
                    return false;
                },

                moveSubWebFolder: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var $target = $(e.currentTarget);
                    this.resetCheckedWebFolder();
                    this.dataSet = {
                        type: $target.data('type'),
                        path: $target.data('full-path').split("WEBFOLDERROOT.")[1],
                        fullPath: $target.data('full-path'),
                        nodeNum: $target.data("node-num")
                    };
                    if ($target.data('type') === "share") {
                        this.dataSet.userSeq = $target.data('userseq');
                        this.dataSet.sroot = $target.data('sroot');
                    }
                    this.renderHeader(this.dataSet);
                    this.pageNo = 1;
                    this.webFolderParamHistoryList.push(this.dataSet);
                    this.dataFetch()
                        .done($.proxy(function (collection) {
                            this.renderListFunc.listFunc(collection);
                        }, this));
                },

                moveParentWebFolder: function () {
                    this.dataSet = this.webFolderParamHistoryList.pop();
                    this.resetCheckedWebFolder();

                    if (_.contains(this.dataSet.path, $("#webSubFolderToolbarWrap h1").text().trim())) {
                        this.dataSet = this.webFolderParamHistoryList.pop();
                    }
                    if (this.webFolderParamHistoryList.length === 0) {
                        this.webFolderParamHistoryList.push(this.dataSet);
                    }
                    this.renderHeader(this.dataSet);
                    this.pageNo = 1;
                    this.dataFetch()
                        .done($.proxy(function (collection) {
                            this.renderListFunc.listFunc(collection);
                        }, this));
                },

                renderHeader: function (attrInfo) {
                    if (attrInfo.fullPath.split(".").length >= 2) {
                        $("#webFolderHomeToolbarWrap").hide();
                        $("#webSubFolderToolbarWrap").show();
                        $("div.webFolderHeader:visible h1").text(attrInfo.path.split(".").slice(-1)[0]);
                    } else {
                        $("#webSubFolderToolbarWrap").hide();
                        $("#webFolderHomeToolbarWrap").show();
                    }
                    $("div.webFolderHeader:visible").attr({
                        "data-path": attrInfo.path,
                        "data-userseq": attrInfo.userSeq,
                        "data-sroot": attrInfo.sroot,
                        "data-type": attrInfo.type
                    });
                },

                resetCheckedWebFolder: function () {
                    $("#webFolderSelectToolbarWrap").hide();
                    $("#webfolder_content input[type=checkbox]").prop("checked", false);
                    $("#select-all").text("전체 선택");
                },

                clickFile: function (e) {
                    $(e.currentTarget).next().trigger("click");
                    this.clickCheckbox(e);
                },

                clickCheckbox: function (e) {
                    var checkCount = $("#webfolder_content").find("li input:checked").length;
                    if (checkCount) {
                        $("#webFolderSelectToolbarWrap").show();
                    } else {
                        $("#webFolderSelectToolbarWrap").hide();
                    }
                    $("#webFolderSelectToolbarWrap span.count").text(GO.i18n(webFolderLang.folder_select_number, {"number": checkCount}));
                },

                changeFolderDirectory: function (e) {
                    var $target = $(e.currentTarget).find('option:selected');
                    this.webFolderParamHistoryList = [];
                    this.resetCheckedWebFolder();
                    this.dataSet = {
                        type: $target.data("type"),
                        fullPath: "WEBFOLDERROOT"
                    };
                    if ($target.data("type") === "share") {
                        this.dataSet = $.extend(this.dataSet, {
                            sroot: $target.data("sroot"),
                            userSeq: $target.data("userseq"),
                            path: $target.data("full-path").split(".")[1],
                            fullPath: $target.data("full-path")
                        });
                    }
                    this.renderHeader(this.dataSet);
                    $("#webFolderHomeToolbarWrap").show();
                    this.pageNo = 1;
                    this.webFolderParamHistoryList.push(this.dataSet);
                    this.dataFetch()
                        .done($.proxy(function (collection) {
                            this.renderListFunc.listFunc(collection);
                        }, this));
                },

                uncheckAllFile: function (e) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    e.stopPropagation();
                    this.resetCheckedWebFolder();
                },

                selectAllFile: function () {
                    if ($("#selectAllFile").text() === lang.select_all) {
                        $("#webfolder_content input[type=checkbox]").prop("checked", true);
                        $("#selectAllFile").text(lang.select_cancel);
                    } else {
                        $("#webfolder_content input[type=checkbox]").prop("checked", false);
                        $("#selectAllFile").text(lang.select_all);
                    }
                    this.clickCheckbox();
                },

                attachFile: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    GO.util.appLoading(true);
                    var $paramInfoTarget = $("div.webFolderHeader:visible");
                    var dataSet = {
                        path: $paramInfoTarget.data("path"),
                        sharedUserSeq: $paramInfoTarget.data("userseq") === "" ? 0 : $paramInfoTarget.data("userseq"),
                        sroot: $paramInfoTarget.data("sroot"),
                        type: $paramInfoTarget.data("type")
                    };
                    var _uids = [];
                    _.each($("#webfolder_content").find("li input:checked"), function (file) {
                        _uids.push($(file).data("uid").toString());
                    });
                    dataSet.uids = _uids;
                    this.resetCheckedWebFolder();
                    if (typeof this.options.callback == 'function') {
                        this.options.callback(dataSet);
                    }
                    this.closeWebFolder();
                },

                detectScroll: function (e) {
                    var currentTargetHeight = $(e.currentTarget).height();
                    var end = $('#webfolder_content').height();
                    var scrollTop = $(e.currentTarget).scrollTop();
                    var scrollHeight = end - currentTargetHeight;

                    if (scrollTop - scrollHeight > -0.5) {
                        this.appendWebFolderList();
                    }

                },

                appendWebFolderList: function () {
                    if (this.collection.toJSON()[0].pageInfo.lastPage) {
                        return;
                    }
                    this.pageNo++;
                    this.dataSet.currentPage = this.pageNo;
                    this.dataFetch()
                        .done($.proxy(function (collection) {
                            collection.toJSON()[0].folders.length = 0;
                            this.renderListFunc.listFunc(collection);
                        }, this));
                }

            });
            return layoutView;
        });
}).call(this);