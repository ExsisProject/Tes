(function () {
    define(function (require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            GO = require('app'),
            commonLang = require("i18n!nls/commons"),
            adminLang = require("i18n!admin/nls/admin"),
            boardLang = require("i18n!board/nls/board"),
            SearchLayerTpl = require("hgn!board/templates/mobile/m_search_layer"),
            SearchHeader = require("views/mobile/m_search_header"),
            SearchResultView = require("board/views/mobile/m_search_result"),
            BoardList = require("board/views/dept_list");

        require("GO.util");

        var instance = null;

        var lang = {
            '검색 조건': commonLang['검색 조건'],
            '전체': commonLang['전체'],
            '검색': commonLang['검색'],
            '작성자': boardLang['작성자'],
            '본문': commonLang['본문'],
            '게시판': commonLang['게시판'],
            '커뮤니티': commonLang['커뮤니티'],
            '댓글': commonLang['댓글'],
            '첨부파일': commonLang['첨부파일'],
            '초기화': adminLang['초기화'],
            '검색 키워드를 입력하세요': commonLang['검색 키워드를 입력하세요.'],
            '검색어': commonLang['검색어'],
            '검색어를 입력하세요': commonLang['검색어를 입력하세요.'],
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
                    lang: lang,
                    isCommunity: this._isCommunity()
                }));
                this._renderSearchHeader();
                this._renderBoardList();
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
            _renderBoardList: function () {
                BoardList.render({
                    id: "#detail_select_wrap",  		//target ID
                    boardList: true,  		// 부서 셀렉트 박스 사용여부 (true/false)
                    selectClass: 'detailSelect w_max',
                    allSelectUse: true,
                    isCommunity: this._isCommunity()
                });
            },
            _isCommunity: function () {
                return (this.packageName == "community") ? true : false;
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

                var detailText = $.trim($('#detail_text').val());
                var detailWriter = $.trim($('#detail_writer').val());
                var boardSelect = $('#select_board');
                var boardIds = [];
                var currentDate = GO.util.shortDate(new Date());
                var startAt = GO.util.toISO8601('1970/01/01');
                var endAt = GO.util.searchEndDate(currentDate);
                var inputData = [{data: detailText, id: 'detail_text'}, {data: detailWriter, id: 'detail_writer'}];

                if(GO.util.isAllEmptySearchText(inputData)){
                    alert(lang['검색 키워드를 입력하세요']);
                    return;
                }
                if(!GO.util.isValidForSearchTextWithCheckbox("detail_text")){
                    return;
                }
                if (!GO.util.isValidSearchTextForDetail(inputData)) {
                    return;
                }
                
                if (boardSelect.val() == "all") {
                    $.each($('#detailSearchWrap #select_board option[data-bbstype]'), function (k, v) {
                        boardIds.push(v.value);
                    });
                } else {
                    boardIds.push(boardSelect.val());
                }

                var searchOption = {
                    stype: 'detail',
                    content: $("#detail_content").is(':checked') ? detailText : '',
                    comments: $("#detail_comment").is('checked') ? detailText : '',
                    attachFileNames: $("#detail_attachFile").is('checked') ? detailText : '',
                    attachFileContents: $("#detail_attachFile").is('checked') ? detailText : '',
                    userName: detailWriter,
                    boardIds: boardIds.join(','),
                    fromDate: startAt,
                    toDate: endAt,
                    isCommunity: this._isCommunity(),
                    page: 0,
                    offset: 15,
                    allSearch: true
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

                var searchData = $target.attr('data-search') || "all";
                var searchOption = {
                    page: 0,
                    offset: 15,
                    isCommunity: this._isCommunity()
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