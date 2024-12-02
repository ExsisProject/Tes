;define('views/mobile/m_search_header', function (require) {

    var _ = require("underscore");
    var Backbone = require('backbone');
    var GO = require('app');
    var CommonLang = require("i18n!nls/commons");
    var SearchHeaderTpl = require('hgn!templates/mobile/m_search_header');
    var instance = null;
    var lang = {
        'input_placeholder': CommonLang['검색 키워드를 입력하세요.'],
        'detail': CommonLang['상세']
    };

    var defaultOption = {
        keyupSimpleSearchCallback: function (val) {
            $('span.searchText').text(val);
        },
        simpleSearchWrapEl: 'simpleSearchWrap',
        detailSearchWrapEl: 'detailSearchWrap',
        searchResultWrapEl: 'searchResultWrap',
        useDetailSearch: true
    };

    var SearchHeader = Backbone.View.extend({
        el: '#searchNav',
        events: {
            'keyup #commonSearchInput': '_keyupSimpleSearchInput',
            'vclick #searchCloseButton': '_closeSearchLayer',
            'vclick #deleteSearchText': '_deleteSearchText',
            'vclick #detailSearchToggle': '_detailSearchToggle',
            'vclick #detailSearchTitle': '_detailSearchToggle'
        },
        initialize: function (options) {
            this.$el.off();
            this.keyupSimpleSearchCallback = options.keyupSimpleSearchCallback == undefined ? defaultOption.keyupSimpleSearchCallback : options.keyupSimpleSearchCallback;
            this.enterSimpleSearchCallback = options.enterSimpleSearchCallback || "";
            this.simpleSearchWrapEl = options.simpleSearchWrapEl == undefined ? defaultOption.simpleSearchWrapEl : options.simpleSearchWrapEl;
            this.detailSearchWrapEl = options.detailSearchWrapEl == undefined ? defaultOption.detailSearchWrapEl : options.detailSearchWrapEl;
            this.searchResultWrapEl = options.searchResultWrapEl == undefined ? defaultOption.searchResultWrapEl : options.searchResultWrapEl;
            this.useDetailSearch = options.useDetailSearch == undefined ? defaultOption.useDetailSearch : options.useDetailSearch;
        },
        render: function () {
            this.$el.html(SearchHeaderTpl({
                lang: lang,
                useDetailSearch: this.useDetailSearch
            }));
            this.simpleSearchEl = $("#" + this.simpleSearchWrapEl);
            this.detailSearchEl = $("#" + this.detailSearchWrapEl);
            this.searchResultEl = $("#" + this.searchResultWrapEl);
            this.simpleSearchEl.show();
            this.detailSearchEl.hide();
            this.searchResultEl.hide();
            return this.el;
        },
        _keyupSimpleSearchInput: function (e) {
            if (e.keyCode == 13) {
                if (!GO.util.isValidSearchText($("#commonSearchInput").val())) {
                    return;
                }

                if (typeof this.enterSimpleSearchCallback == 'function') {
                    this.enterSimpleSearchCallback(e);
                    this._showSearchResultWrap();
                }
            } else {
                if (typeof this.keyupSimpleSearchCallback == 'function') {
                    this.keyupSimpleSearchCallback($("#commonSearchInput").val());
                }
            }
        },
        _closeSearchLayer: function (e) {
            e.preventDefault();
            $("#goSearch input").blur();
            $("#goSearch").hide().empty();
            $('body').toggleClass('scroll_fix');
            return false;
        },
        _deleteSearchText: function (e) {
            e.preventDefault();
            $('#commonSearchInput').val('');
            $('span.searchText').text('');
            return false;
        },
        _detailSearchToggle: function (e) {
            e.preventDefault();
            var $detailButton = $('#detailSearchToggle');
            $detailButton.toggleClass('on');
            if ($detailButton.hasClass('on')) {
                this.detailSearchEl.show();
                this.simpleSearchEl.hide();
                this.searchResultEl.hide();
                $('#simpleSearchTitle').hide();
                $('#detailSearchTitle').show();
            } else {
                this.detailSearchEl.hide();
                this.simpleSearchEl.show();
                this.searchResultEl.hide();
                $('#simpleSearchTitle').show();
                $('#detailSearchTitle').hide();
            }
        },
        _showSearchResultWrap: function () {
            this.detailSearchEl.hide();
            this.simpleSearchEl.hide();
            this.searchResultEl.show();
            $("#commonSearchInput").blur();
        }
    });

    return {
        render: function (options) {
            instance = new SearchHeader(options);
            return instance.render();
        }
    };
});