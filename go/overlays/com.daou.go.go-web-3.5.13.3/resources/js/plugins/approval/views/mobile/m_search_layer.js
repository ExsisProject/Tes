(function () {
    define(function (require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            GO = require('app'),
            commonLang = require("i18n!nls/commons"),
            adminLang = require("i18n!admin/nls/admin"),
            approvalLang = require("i18n!approval/nls/approval"),
            SearchLayerTpl = require("hgn!approval/templates/mobile/m_search_layer"),
            SearchHeader = require("views/mobile/m_search_header"),
            SearchResultView = require("approval/views/mobile/m_search_result");

        require("GO.util");

        var instance = null;

        var lang = {
            '검색 조건': commonLang['검색 조건'],
            '전체': commonLang['전체'],
            '검색': commonLang['검색'],
            '기안자': approvalLang['기안자'],
            '제목': approvalLang['제목'],
            '결재양식': approvalLang['결재양식'],
            '기안부서': approvalLang['기안부서'],
            '결재선': approvalLang['결재라인'],
            '문서번호': approvalLang['문서번호'],
            '본문': commonLang['본문'],
            '첨부파일': commonLang['첨부파일'],
            '검색조건': commonLang['검색 조건'],
            '모두만족': approvalLang['모두 만족'],
            '하나만만족': approvalLang['하나만 만족'],
            '초기화': adminLang['초기화'],
            '검색어': commonLang['검색어'],
            '검색 키워드를 입력하세요': commonLang['검색 키워드를 입력하세요.'],
            '불가문자': commonLang['메일 사용 불가 문자'],
            '문자길이체크': commonLang['0자이상 0이하 입력해야합니다.']
        };
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
            },
            render: function () {
                this.$el.html(SearchLayerTpl({
                    lang: lang
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
            _detailSearchInit: function (e) {
                e.preventDefault();
                $("#detailSearchWrap input[type=search], #detailSearchWrap input[type=checkbox]").prop("checked", false).val('');
            },
            _detailSearch: function (e) {
                if (e.keyCode != 13) {
                    return;
                }
                var formName = $.trim($('#formName').val());
                var drafterName = $.trim($('#drafterName').val());
                var drafterDeptName = $.trim($('#drafterDeptName').val());
                var activityUserNames = $.trim($('#activityUserNames').val());
                var docNum = $.trim($('#docNum').val());
                var stext = $.trim($('#stext').val());
                var searchOption = $.trim($("input[name='searchOption']:checked").val());
                var inputData = [{data: formName, id: 'formName'}, {data: drafterName, id: 'drafterName'},
                    {data: drafterDeptName, id: 'drafterDeptName'}, {data: activityUserNames, id: 'activityUserNames'},
                    {data: docNum, id: 'docNum'}, {data: stext, id: 'stext'}];

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

                var searchOption = {
                    stype: 'detail',
                    type: this.packageName,
                    formName: formName,
                    drafterName: drafterName,
                    drafterDeptName: drafterDeptName,
                    activityUserNames: activityUserNames,
                    docNum: docNum,
                    dateType: 'draftedAt',
                    title: $('#title').is(':checked') ? stext : '',
                    docBody: $('#docBody').is(':checked') ? stext : '',
                    searchTerm: 'all',
                    attachFileNames: $('#attachFile').is(':checked') ? stext : '',
                    attachFileContents: $('#attachFile').is(':checked') ? stext : '',
                    searchOption: searchOption
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
                    type: this.packageName,
                    page: 0,
                    offset: 15
                };

                if (searchData == "all") {
                    searchOption['stype'] = 'simple';
                    searchOption['keyword'] = searchText;
                } else {
                    searchOption['stype'] = 'detail';
                    searchOption[searchData] = searchText;
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