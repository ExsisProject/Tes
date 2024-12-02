(function () {
    define(function (require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            GO = require('app'),
            commonLang = require("i18n!nls/commons"),
            adminLang = require("i18n!admin/nls/admin"),
            docsLang = require("i18n!docs/nls/docs"),
            SearchLayerTpl = require("hgn!docs/search/templates/mobile/search_layer"),
            SearchHeader = require("views/mobile/m_search_header"),
            SearchResultView = require("docs/search/views/mobile/search_result"),
            DocFolderList = require('docs/collections/doc_folder_infos');

        require("GO.util");

        var instance = null;

        var lang = {
            '검색 조건': commonLang['검색 조건'],
            '전체': commonLang['전체'],
            '검색': commonLang['검색'],
            '등록자': docsLang['등록자'],
            '제목': docsLang['제목'],
            '문서함': docsLang['문서함'],
            '내용': commonLang['내용'],
            '첨부파일': commonLang['첨부파일'],
            '초기화': adminLang['초기화'],
            '검색어': commonLang['검색어'],
            '하위 문서함 포함': docsLang['하위 문서함 포함'],
            '검색 키워드를 입력하세요': commonLang['검색 키워드를 입력하세요.'],
            '전체문서함': docsLang['전체문서함']
        };
        var folderListView = Hogan.compile(
            '<option value="{{data.id}}">{{data.parentPathName}}</option>'
        );
        var SearchLayer = Backbone.View.extend({
            el: '#goSearch',
            events: {
                'vclick #searchInit': '_detailSearchInit',
                'vclick a[data-search]': '_simpleSearch',
                'keyup #detailSearchWrap input': '_detailSearch'
            },
            initialize: function (options) {
                this.$el.off();
                this.packageName = options.packageName;
                this.docFolderList = new DocFolderList();
            },
            render: function () {
                this.$el.html(SearchLayerTpl({
                    lang: lang
                }));
                this._renderSearchHeader();
                this._renderDocList();
                return this.el;
            },
            _renderSearchHeader: function () {
                var _this = this;
                SearchHeader.render({
                    enterSimpleSearchCallback: function (e) {
                        _this._simpleSearch(e);
                    }
                });
            },
            _renderDocList: function () {
                this.docFolderList.comparator = 'parentPathName';
                this.docFolderList.fetch({
                    success: function (collection) {
                        collection.each(function (model) {
                            this.$("#folderId").append(folderListView.render({
                                data: model.toJSON()
                            }));
                        });
                    }
                });
            },
            _detailSearchInit: function (e) {
                e.preventDefault();
                $("#detailSearchWrap input").prop("checked", false).val('');
                $("#detailSearchWrap select").prop('selectedIndex', 0);
            },
            _detailSearch: function (e) {
                if (e.keyCode != 13) {
                    return;
                }
                var creatorName = $.trim($('#creatorName').val());
                var keyword = $.trim($('#keyword').val());
                var currentDate = GO.util.shortDate(new Date());
                var startAt = GO.util.toISO8601('1970/01/01');
                var endAt = GO.util.searchEndDate(currentDate);
                var checkTitle = this.$('input[name="title"]').is(':checked');
                var checkContent = this.$('input[name="content"]').is(':checked');
                var checkAttachFile = this.$('input[name="attachFile"]').is(':checked');
                var checkIncludeType = this.$('input[name="includeType"]').is(':checked');
                var inputData = [{data: creatorName, id: 'creatorName'}, {data: keyword, id: 'keyword'}];

                if(GO.util.isAllEmptySearchText(inputData)){
                    alert(lang['검색 키워드를 입력하세요']);
                    return;
                }
                if(!GO.util.isValidForSearchTextWithCheckbox("keyword")){
                    return;
                }
                if (!GO.util.isValidSearchTextForDetail(inputData)) {
                    return;
                }

                var searchOption = {
                    stype: "detail",
                    keyword: keyword,
                    page: 0,
                    offset: 15,
                    fromDate: startAt,
                    toDate: endAt,
                    creatorName: creatorName,
                    title: checkTitle ? keyword : "",
                    content: checkContent ? keyword : "",
                    attachFileNames: checkAttachFile ? keyword : "",
                    attachFileContents: checkAttachFile ? keyword : "",
                    docNum: '',
                    docsYear: '',
                    docsYearValue: '',
                    includeType: checkIncludeType ? "include" : "none",
                    folderId: this.$("#folderId option:selected").val(),
                    folderPathName: this.$("#folderId option:selected").text()
                };
                SearchResultView.render(searchOption);
            },
            _simpleSearch: function (e) {
                e.preventDefault();
                var $target = $(e.currentTarget);
                var searchText = $.trim($('#commonSearchInput').val());
                if (!GO.util.isValidSearchText(searchText)) {
                    return;
                }

                var searchData = $target.attr('data-search') || 'all';
                var searchOption = {
                    page: 0,
                    offset: 15
                };
                if (searchData == "all") {
                    searchOption['stype'] = 'simple';
                    searchOption['keyword'] = searchText;
                } else {
                    searchOption['stype'] = 'detail';
                    searchOption['keyword'] = searchText;
                    searchOption[searchData] = searchText;
                    searchOption['includeType'] = 'none';
                }
                SearchResultView.render(searchOption);
            }
        });
        return {
            render: function (options) {
                instance = new SearchLayer(options);
                return instance.render();
            }
        };
    });
}).call(this);