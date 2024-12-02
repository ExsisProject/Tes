define([
        "i18n!nls/commons",
        "i18n!approval/nls/approval",

        "hgn!admin/templates/approval/appr_dept_folder_list",
        "collections/paginated_collection",
        "admin/views/approval/appr_dept_folder_categorize",
        "hgn!approval/templates/select_all_layout",
        "views/pagination",
        "views/pagesize"
    ],
    function (
        commonLang,
        approvalLang,
        Template,
        PaginatedCollection,
        ClassifyView,
        SelectAllTpl,
        PaginationView,
        PageSizeView
    ) {

        var lang = {
            add: approvalLang["부서 문서함 분류"],
            move: commonLang["이동"],
            remove: commonLang["삭제"],
            "수신": approvalLang["수신"],
            "기안일": approvalLang["기안일"],
            "기안자": approvalLang["기안자"],
            "결재양식": approvalLang["결재양식"],
            "제목": commonLang["제목"],
            "부서문서함": approvalLang["부서문서함"],
            "문서가 없습니다": approvalLang["문서가 없습니다."],
            'all_select_page': approvalLang['현재 페이지에 있는 모든 문서들이 선택되었습니다.'],
            'count_msg': approvalLang['해당 문서함의 모든 문서 0개를 선택메시지'],
            'select_all': approvalLang['모든 문서 선택'],
            'all_select_folder': approvalLang['해당 문서함의 모든 문서들이 선택되었습니다.'],
            'cancel_msg': approvalLang['해당 문서함의 선택 취소메시지'],
            'select_cancel': approvalLang['선택 해제'],
            '열람자 추가': approvalLang['열람자 추가']
        };

        var Document = Backbone.Model.extend({
            isCompleted: function () {
                return this.get("docStatus") == "COMPLETE";
            }
        });

        var ReaderModel = Backbone.Model.extend({
            initialize: function (docId) {
                this.docId = docId;
            },
            url: function () {
                return "/ad/api/approval/manage/document/addreaders";
            }
        });

        var Documents = PaginatedCollection.extend({

            model: Document,

            /**
             * PredefinedFolders : 기안완료함, 부서참조함, 부서수신함
             * ReceiveFolder : 부서수신함
             * @method url
             */
            url: function () {
                var baseUrl = GO.contextRoot + "ad/api/approval/deptfolder/";
                var url = "";

                if (this._isPredefinedFolder()) {
                    url = baseUrl + this.type + "/" + this.folderId;
                    if (this._isReceiveFolder()) url += "/all";
                } else {
                    url = baseUrl + this.folderId + "/documents";
                }

                return url + "?" + this._makeParam();
            },

            /**
             * object 를 한번에 collection 속성으로 넣어줌.
             * @method setAttributes
             * @return {Object}
             */
            setAttributes: function (obj) {
                _.each(obj, function (value, key) {
                    this[key] = value;
                }, this);
            },

            /**
             * paging collection 의 parameter 를 반환
             * @method _makeParam
             * @return {Object} page info
             */
            _makeParam: function () {
                return $.param({
                    page: this.pageNo,
                    offset: this.pageSize,
                    property: this.property,
                    direction: this.direction,
                    searchtype: this.searchtype,
                    keyword: this.keyword
                });
            },

            /**
             * PredefinedFolders : 기안완료함, 부서참조함, 부서수신함
             * @method _isPredefinedFolder
             */
            _isPredefinedFolder: function () {
                return this.type != "doc";
            },

            /**
             * ReceiveFolder : 부서수신함
             * @method _isReceiveFolder
             */
            _isReceiveFolder: function () {
                return this.type == "receive";
            },

            /**
             * collection 에서 서버 요청을 통괄.
             * type : add, move, remove
             * @method categorize
             * @param {Object} options = {type, documentIds, targetFolderId, folderId}
             */
            categorize: function (options) {
                var data;
                var documentScope = "document";
                var folderType = "deptfolder";
                if (options.isAllDocumentsSelect) {
                    documentScope = "alldocuments";
                    if (options.type == "move") {
                        data = {'folderId': options.targetFolderId}
                    } else if (options.type == "add") {
                        folderType = "dept" + options.folderType + "folder";
                        data = {'folderId': options.folderId, 'deptId': options.deptId}
                    }
                } else {
                    data = {ids: options.documentIds};
                    if (options.type == "move") _.extend(data, {folderId: options.targetFolderId});
                }
                return $.ajax({
                    url: GO.contextRoot + "ad/api/approval/" + folderType + "/" + options.folderId + "/" + documentScope + "/" + options.type,
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify(data)
                });
            },

            addreaders: function (options) {
                var model = new ReaderModel();
                model.set({
                    'readers': options.readers
                });
                var folderType = "deptfolder";
                if (this.type != "doc") {
                    folderType = "dept" + this.type + "folder";
                }
                return $.ajax({
                    url: GO.contextRoot + "ad/api/approval/" + folderType + "/" + options.folderId + "/alldocuments/addreaders",
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify(model)
                });

            },

            getCompletedDocumentCount: function () {
                var cnt = 0;
                _.each(this.models, function (model) {
                    if (model.isCompleted()) {
                        cnt += 1;
                    }
                });
                return cnt;
            }
        });


        var View = Backbone.View.extend({
            initialize: function (options) {
                this.department = options.department;
                this.folderName = options.name;
                this.folderId = options.folderId;
                this.type = options.type;
                this.isPredefined = options.isPredefined;
                this.isOfficial = options.isOfficial;
                this.collection = new Documents();
                this.collection.setAttributes({
                    folderId: options.folderId,
                    type: options.type
                });
                this.collection.on("sync", this.render, this);
                GO.util.preloader(this.collection.fetch());
            },


            events: {
                "click #addCategory": "_categorize",
                "click #moveCategory": "_categorize",
                "click #removeCategory": "_categorize",
                "click #checkAll": "_checkAll",
                "change #documentList input": "_toggleCheckAll",
                "click th[data-property]": "_sorting",
                'click p#allSelectMsg3': 'toggleSelectScope',
                "click #bulkReaderAdd": "_onReaderAddClicked"
            },


            render: function () {
                var template = Template({
                    name: this.folderName,
                    isPredefined: this.isPredefined,
                    isOfficial: this.isOfficial,
                    collection: this._parseCollection(),
                    lang: lang,
                    isReceive: this.type == "receive"
                });
                this.$el.html(template);
                this._renderSelectAllTpl();
                this._renderPageSizeView();
                this._renderPageView();
                this._markHeader();
                return this;
            },

            /**
             * template render 를 간편하게 하기 위해 collection parsing
             * @method _parseCollection
             */
            _parseCollection: function () {
                var clone = _.clone(this.collection);
                return _.map(clone.models, function (document) {
                    var parsedDocument = {
                        shortDraftedAt: GO.util.shortDate(document.get("draftedAt")),
                        isCompleted: document.isCompleted()
                    };
                    return _.extend(parsedDocument, document.toJSON());
                });
            },

            /**
             * 페이지 사이즈뷰 렌더링
             * @method _renderPageSizeView
             */
            _renderPageSizeView: function () {
                this.pageSizeView = new PageSizeView({pageSize: this.collection.pageSize});
                this.pageSizeView.render();
                this.pageSizeView.bind('changePageSize', this._selectPageSize, this);
            },

            /**
             * 페이징뷰 렌더링
             * @method _renderPageView
             */
            _renderPageView: function () {
                if (this.pageView) this.pageView.remove();
                this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
                this.pageView.bind("paging", this._selectPage, this);
                this.$("#paginateArea").append(this.pageView.render().el);
            },

            /**
             * 페이지 선택
             * @method _selectPage
             * @param {Number} 페이지
             */
            _selectPage: function (page) {
                this.collection.setPageNo(page);
                this.collection.fetch();
            },

            /**
             * 페이지 사이즈 선택
             * @method _selectPageSize
             * @param {Number} 페이지사이즈
             */
            _selectPageSize: function (pageSize) {
                this.collection.setPageSize(pageSize);
                this.collection.fetch();
            },

            /**
             * 문서 분류
             * @method _categorize
             */
            _categorize: function (e) {
                var self = this;
                var type = $(e.currentTarget).attr("data-categorizeType");
                var documentIds = this._getCheckedDocumentIds();
                if (!documentIds.length) {
                    $.goError(approvalLang["선택된 항목이 없습니다."]);
                    return;
                }
                var table_wrap = $(e.target).parent().parent().next();
                var isAllDocumentsSelect = (table_wrap.find('#allSelectTr').is(':visible') && table_wrap.find('#allSelectMsg3').attr('data-value') == 'folder');
                if (type == "remove") {
                    var categorizeOption = {
                        type: type,
                        folderId: self.folderId,
                        documentIds: documentIds,
                        isAllDocumentsSelect: isAllDocumentsSelect,
                        deptId: self.folderId
                    };

                    $.goConfirm(approvalLang['선택한 항목을 삭제하시겠습니까?'],
                        '',
                        function () {
                            GO.util.preloader(self.collection.categorize(categorizeOption).done(function () {
                                $.goMessage(approvalLang["선택한 항목이 삭제되었습니다"]);
                                self.$el.find('#checkedAllCompanyDoc').attr('checked', false);
                                self.collection.fetch();
                            }).fail(function () {
                                $.goError(commonLang['저장에 실패 하였습니다.']);
                            }));
                        }
                    );
                } else {
                    this.popup = $.goPopup({
                        "pclass": "layer_normal layer_doc_type_select",
                        "header": lang[type],
                        "modal": true,
                        "width": 300,
                        "contents": "",
                        "buttons": [
                            {
                                'btext': commonLang['확인'],
                                'btype': 'confirm',
                                'autoclose': false,
                                'callback': function (popup) {
                                    var selectedFolderEl = popupContentView.getSelectedFolderEl();
                                    if (!selectedFolderEl.length) {
                                        $.goError(approvalLang["이동하실 문서함을 선택해주십시요."]);
                                        return false;
                                    }

                                    var targetFolderId = $(selectedFolderEl).attr("data-folderId");
                                    if (!targetFolderId) {
                                        $.goError(approvalLang["이동하실 문서함을 선택해주십시요."]);
                                        return false;
                                    }
                                    var documentIds = self._getCheckedDocumentIds();
                                    var categorizeOption = {
                                        type: type,
                                        documentIds: documentIds,
                                        targetFolderId: targetFolderId,
                                        isAllDocumentsSelect: isAllDocumentsSelect,
                                        deptId: self.folderId
                                    };

                                    if (type == "move") {
                                        categorizeOption["targetFolderId"] = targetFolderId;
                                        categorizeOption["folderId"] = self.folderId;
                                    } else {
                                        categorizeOption["folderId"] = targetFolderId;
                                        categorizeOption["folderType"] = self.collection.type;
                                    }

                                    var promise = self.collection.categorize(categorizeOption).done(function () {
                                        self.popup.close();
                                        self.collection.fetch();
                                        self.$("#checkAll").prop("checked", false);
                                    }).fail(function () {
                                        $.goError(commonLang["저장에 실패 하였습니다."]);
                                    });
                                    GO.util.preloader(promise);
                                }
                            },
                            {
                                'btext': commonLang["취소"],
                                'btype': 'cancel'
                            }
                        ]
                    });
                    var popupContentView = new ClassifyView({
                        department: this.department
                    });
                    this.popup.find("div.content").html(popupContentView.render().el);
                }
            },

            _onReaderAddClicked: function (e) {
                var self = this;
                var documentIds = this._getCheckedDocumentIds();
                if (!documentIds.length) {
                    $.goError(approvalLang["선택된 항목이 없습니다."]);
                    return;
                }
                var table_wrap = $(e.target).parent().parent().next();
                var isAllDocumentsSelect = (table_wrap.find('#allSelectTr').is(':visible') && table_wrap.find('#allSelectMsg3').attr('data-value') == 'folder');
                if (isAllDocumentsSelect) documentIds = [];
                this._showReaderAddOrgSlide(documentIds);
            },

            _showReaderAddOrgSlide: function (docIds) {
                $.goOrgSlide({
                    header: approvalLang["열람자 추가"],
                    contextRoot: GO.config("contextRoot"),
                    callback: $.proxy(this._addReaders, this, docIds),
                    memberTypeLabel: approvalLang["열람자"],
                    externalLang: commonLang,
                    isBatchAdd: true,
                    useTag: true,
                    isAdmin: true,
                    type: 'node'
                });
            },

            _addReaders: function (docIds, datas) {
                var self = this;
                var readers = _.map(datas, function (data) {
                    return {reader: data};
                });
                var model = new ReaderModel();

                if (!_.isEmpty(docIds)) {
                    if (_.isEmpty(readers)) {
                        $.goError(approvalLang["열람자를 추가해 주세요."]);
                        return;
                    }

                    model.set({
                        'docIds': docIds,
                        'readers': readers
                    });

                    model.save(null, {
                        type: 'POST',
                        success: function (model, response) {
                            if (response.code == '200') {
                                $(".list_approval input[type=checkbox][data-id]").prop('checked', false);
                                $.goMessage(approvalLang["열람자 추가가 완료되었습니다."]);
                            }
                        },
                        error: function (model, response) {
                            $.goMessage(commonLang["저장에 실패 하였습니다."]);
                        }
                    });
                } else {
                    // 전체 선택
                    var model = new ReaderModel();
                    if (_.isEmpty(readers)) {
                        $.goError(approvalLang["열람자를 추가해 주세요."]);
                        return;
                    }

                    model.set({
                        'readers': readers
                    });

                    var option = {
                        folderId: self.folderId,
                        deptId: self.folderId,
                        folderType: self.collection.type,
                        readers: readers
                    };

                    var promise = self.collection.addreaders(option).done(function () {
                        $.goMessage(approvalLang["열람자 추가가 완료되었습니다."]);
                        self.collection.fetch();
                        self.$("#checkAll").prop("checked", false);
                    }).fail(function () {
                        $.goError(commonLang["저장에 실패 하였습니다."]);
                    });
                    GO.util.preloader(promise);
                }
            },

            // TODO go-table
            /**
             * 전체 체크
             * @method _checkAll
             */
            _checkAll: function (e) {
                var isChecked = this.$("#checkAll").is(":checked");
                this.$("#documentList").find("input").attr("checked", isChecked);
                this._toggleSelectAllTpl(isChecked);
            },

            // TODO go-table
            /**
             * 목록의 체크박스가 모두 선택 됐는지 여부에 따라 checkAll 체크박스를 토글
             * @method _toggleCheckAll
             */
            _toggleCheckAll: function () {
                var isCheckAll = true;
                _.each(this.$("#documentList").find("input"), function (input) {
                    if (!$(input).is(":checked")) isCheckAll = false;
                });

                this.$("#checkAll").attr("checked", isCheckAll);
                this._toggleSelectAllTpl(isCheckAll);
            },

            _renderSelectAllTpl: function () {
                $('.tb_admin > tbody').prepend(SelectAllTpl({
                    columnCount: this.isPredefined ? 6 : 5,
                    lang: lang,
                    totalCount: GO.i18n(lang['count_msg'], {"totalCount": this.collection.type == "receive" ? this.completeDocumentCount() : this.collection.total})
                }));
            },

            _toggleSelectAllTpl: function (isSelect) {
                var hasMorePage = this.collection.total > this.collection.pageSize || this.collection.total > this.collection.getCompletedDocumentCount();
                if (isSelect && hasMorePage) {
                    $('#allSelectTr').show();
                } else {
                    $('#allSelectTr').hide();
                    this.toggleSelectAllMsg('folder');
                }
            },

            toggleSelectScope: function (e) {
                var target = $(e.target).parent();
                var presentScope = target.attr("data-value");

                if (_.isUndefined(presentScope)) {
                    return;
                }
                this.toggleSelectAllMsg(presentScope);
            },

            toggleSelectAllMsg: function (presentScope) {
                var allSelectMsg1 = $("#allSelectMsg1").empty();
                var allSelectMsg2 = $("#allSelectMsg2").empty();
                var allSelectMsg3 = $("#allSelectMsg3").find('a').empty();
                if (presentScope == 'page') {
                    $("#allSelectMsg3").attr("data-value", "folder");
                    allSelectMsg1.append(lang['all_select_folder']);
                    allSelectMsg2.append(lang['cancel_msg']);
                    allSelectMsg3.append(lang['select_cancel']);
                } else if (presentScope == 'folder') {
                    $("#allSelectMsg3").attr("data-value", "page");
                    allSelectMsg1.append(lang['all_select_page']);
                    allSelectMsg2.append(GO.i18n(lang['count_msg'], {"totalCount": this.collection.type == "receive" ? this.completeDocumentCount() : this.collection.total}));
                    allSelectMsg3.append(lang['select_all']);
                }
            },

            completeDocumentCount: function () {
                var result;
                $.ajax({
                    type: "GET",
                    async: false,
                    dataType: "json",
                    url: GO.contextRoot + "ad/api/approval/deptfolder/" + this.folderId + "/reception/complete/count",
                    success: function (resp) {
                        result = resp.data.docCount;
                    },
                    error: function (resp) {
                        $.goError(resp.responseJSON.message);
                    }
                });
                return result;
            },

            /**
             * 선택된 체크박스의 docId 를 반환.
             * @method _getCheckedDocumentIds
             */
            _getCheckedDocumentIds: function () {
                return _.map(this.$("#documentList").find("input:checked"), function (inputEl) {
                    return $(inputEl).attr("data-docid");
                });
            },


            // TODO go-table
            /**
             * 정렬
             * @method _sorting
             */
            _sorting: function (e) {
                var target = $(e.currentTarget);
                var property = target.attr("data-property");
                var direction = target.attr("data-direction") == "asc" ? "desc" : "asc";
                target.attr("data-direction", direction);

                this.collection.property = property;
                this.collection.direction = direction;
                this.collection.fetch();
            },


            // TODO go-table
            /**
             * collection 의 direction 과 property 값에 맞는 스타일 지정
             * @method _markHeader
             */
            _markHeader: function () {
                var target = this.$("th[data-property='" + this.collection.property + "']");
                target.attr("data-direction", this.collection.direction);
                target.removeClass();
                target.addClass("sorting_" + this.collection.direction);
            }
        });

        return View;
    });