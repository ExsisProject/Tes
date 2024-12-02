(function () {
    define(function (require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            GO = require('app'),
            commonLang = require("i18n!nls/commons"),
            adminLang = require("i18n!admin/nls/admin"),
            reportLang = require("i18n!report/nls/report"),
            SearchLayerTpl = require("hgn!report/templates/mobile/m_search_layer"),
            SearchHeader = require("views/mobile/m_search_header"),
            SearchResultView = require("report/views/mobile/m_search_result"),
            ReportMenu = require("report/collections/left_menu");

        require("GO.util");

        var instance = null;

        var lang = {
            '검색 조건': commonLang['검색 조건'],
            '전체': commonLang['전체'],
            '검색': commonLang['검색'],
            '보고자': reportLang['보고자'],
            '위치': reportLang['위치'],
            '부서': reportLang['부서'],
            '본문': commonLang['본문'],
            '댓글': commonLang['댓글'],
            '첨부파일': commonLang['첨부파일'],
            '초기화': adminLang['초기화'],
            '검색어': commonLang['검색어'],
            '검색 키워드를 입력하세요': commonLang['검색 키워드를 입력하세요.']
        };
        var SearchLayer = Backbone.View.extend({
            el: '#goSearch',
            events: {
                'vclick #searchInit': '_detailSearchInit',
                'vclick a[data-search]': '_simpleSearch',
                'keyup #detailSearchWrap input': '_detailSearch',
                'change #deptSelect': '_showFolderSelect'
            },
            initialize: function (options) {
                this.$el.off();
                this.packageName = options.packageName;
                this.reportMenu = ReportMenu.get();
            },
            render: function () {
                this.$el.html(SearchLayerTpl({
                    lang: lang,
                    data: this.reportMenu.toJSON()
                }));
                this._renderSearchHeader();
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
            _showFolderSelect: function (e) {
                var targetEl = $(e.currentTarget),
                    selectValue = targetEl.val();

                if (selectValue == "all") {
                    $("#folderSelect").hide();
                } else {
                    var folderModel = this.reportMenu.get(selectValue),
                        optionTmpl = ['<option value="all">' + lang['전체'] + '</option>'];
                    $.each(folderModel.get("folders"), function () {
                        optionTmpl.push('<option value="' + this.id + '">' + this.name + '</option>');
                    });
                    $("#folderSelect").html(optionTmpl.join("")).show();
                }
            },
            _detailSearchInit: function (e) {
                e.preventDefault();
                $("#detailSearchWrap input[type=search], #detailSearchWrap input[type=checkbox]").prop("checked", false).val('');
                $("#detailSearchWrap select").prop('selectedIndex', 0);
            },
            _detailSearch: function (e) {
                if (e.keyCode != 13) {
                    return;
                }
                var detailText = $.trim($('#stext').val());
                var detailWriter = $.trim($('#detailRepoter').val());
                var currentDate = GO.util.shortDate(new Date());
                var startAt = GO.util.toISO8601('1970/01/01');
                var endAt = GO.util.searchEndDate(currentDate);
                var inputData = [{data: detailText, id: 'stext'}, {data: detailWriter, id: 'detailRepoter'}];

                if(GO.util.isAllEmptySearchText(inputData)){
                    alert(lang['검색 키워드를 입력하세요']);
                    return;
                }
                if(!GO.util.isValidForSearchTextWithCheckbox("stext")){
                    return;
                }
                if (!GO.util.isValidSearchTextForDetail(inputData)) {
                    return;
                }

                var folderInfo = this._getFolderInfo();
                var searchOption = {
                    stype: "detail",
                    content: $("#detailContent").is(':checked') ? detailText : '',
                    comment: $("#detailComment").is(':checked') ? detailText : '',
                    attachFileNames: $("#detailAttach").is(':checked') ? detailText : '',
                    attachFileContents: $("#detailAttach").is(':checked') ? detailText : '',
                    reporterName: $.trim(detailWriter),
                    folderIds: folderInfo['folderIds'].join(),
                    folderNames: folderInfo['folderNames'].join(),
                    properties: "submittedAt",
                    fromDate: startAt,
                    toDate: endAt
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
                    offset: 15,
                    properties: 'submittedAt'
                };

                if (searchData == "all") {
                    searchOption['stype'] = 'simple';
                    searchOption['keyword'] = searchText;
                } else {
                    var folderInfo = this._getFolderInfo();
                    searchOption['stype'] = 'detail';
                    searchOption[searchData] = searchText;
                    searchOption['folderIds'] = folderInfo['folderIds'].join(),
                        searchOption['folderNames'] = folderInfo['folderNames'].join()
                }
                SearchResultView.render(searchOption);
            },
            _getFolderInfo: function () {
                var deptValue = $("#deptSelect").val();
                var folderInfo = {
                    folderIds: [],
                    folderNames: []
                };
                if (deptValue == "all") {
                    $.each(this.reportMenu.models, function (index, model) {
                        $.each(model.get("folders"), function () {
                            folderInfo.folderIds.push(this.id);
                        });
                    });
                    folderInfo.folderNames.push(lang['전체']);
                } else {
                    var folderValue = $("#folderSelect").val();

                    if (folderValue == "all") {
                        var selectDept = this.reportMenu.get(deptValue);
                        $.each(selectDept.get("folders"), function () {
                            folderInfo.folderIds.push(this.id);
                            folderInfo.folderNames.push(this.name);
                        });
                    } else {
                        folderInfo.folderIds.push(folderValue);
                        folderInfo.folderNames.push($("#folderSelect :selected").text());
                    }
                }
                return folderInfo;
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