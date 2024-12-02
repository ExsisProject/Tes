(function() {
    define(function(require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            GO = require('app'),
            TplResult = require("text!report/templates/mobile/m_search_result.html"),
            TplResultItem = require("text!report/templates/mobile/m_search_result_unit.html"),
            CommonResult = require("views/mobile/m_search_common_result"),
            reportLang = require("i18n!report/nls/report"),
            commonLang = require("i18n!nls/commons");

        require("GO.util");

        var instance = null;
        var lang = {
            '검색결과없음' : commonLang['검색결과없음'],
            '검색결과' : commonLang['검색결과']
        };

        var parseSeriesNo = function() {
            if(!this.seriesNo) return "";
            return GO.i18n(reportLang["제 {{arg1}}회차"],{arg1 : this.seriesNo});
        };

        var dateParse = function() {
            return GO.util.snsDate(this.submittedAt);
        };

        var SearchCollection = GO.BaseCollection.extend({
            url: function() {
                return "/api/search/report";
            }
        });

        var Contacts = Backbone.View.extend({
            el : '#searchResultWrap',
            events : {
                'vclick li[data-reportid]': '_getContent'
            },
            initialize: function(options) {
                var _this = this;
                this.options = options;
                this.lastPage = false;
                this.$el.off();
                this.collection  = new SearchCollection();
                CommonResult.set({
                    collection : this.collection,
                    searchOptions : this.options,
                    renderListFunc : function(collection) {
                        _this._renderContents(collection);
                    },
                    renderListMoreFunc : function(collection) {
                        _this._moreList(collection);
                    }
                });
            },
            render: function() {
                CommonResult.fetch();
                return this.el;
            },
            _renderContents : function() {
                var searchData = this.collection;
                this.$el.html(Hogan.compile(TplResult).render({
                    lang : lang,
                    dataset : searchData.toJSON(),
                    resultCount : searchData.page.total,
                    parseSeriesNo : parseSeriesNo,
                    dateParse : dateParse
                },{
                    partial : TplResultItem
                }));
                $('#detailSearchToggle').removeClass('on');
                this._showResultWrap();
            },
            _moreList : function(collection) {
                var searchData = collection.toJSON();
                this.$el.find('ul:first').append(Hogan.compile(TplResultItem).render({
                    lang : lang,
                    dataset : searchData,
                    parseSeriesNo : parseSeriesNo,
                    dateParse : dateParse
                }))
            },
            _showResultWrap : function() {
                $('#simpleSearchWrap').hide();
                $('#detailSearchWrap').hide();
                $('#searchResultWrap').show();
            },
            _getContent : function(e) {
                e.preventDefault();
                var targetEl = $(e.currentTarget),
                    reportId = targetEl.attr("data-reportid"),
                    seriesId = targetEl.attr("data-seriesid"),
                    folderId = targetEl.attr("data-folderid"),
                    type = targetEl.attr("data-reporttype"),
                    url = "report/folder/"+folderId+"/report/"+reportId;
                if(type == "PERIODIC"){
                    url = "report/series/"+seriesId+"/report/"+reportId;
                }
                GO.router.navigate(url, {trigger: true});
            }
        });
        return {
            render : function(options) {
                instance = new Contacts(options);
                return instance.render();

            }
        };
    });

}).call(this);