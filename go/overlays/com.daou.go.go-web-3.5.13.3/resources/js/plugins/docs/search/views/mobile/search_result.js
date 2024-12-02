(function() {
    define(function(require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            GO = require('app'),
            TplResult = require("text!docs/search/templates/mobile/search_result.html"),
            TplResultItem = require("text!docs/search/templates/mobile/search_result_unit.html"),
            CommonResult = require("views/mobile/m_search_common_result"),
            docsLang = require("i18n!docs/nls/docs"),
            commonLang = require("i18n!nls/commons");

        require("GO.util");

        var instance = null;
        var lang = {
            '검색결과없음' : commonLang['검색결과없음'],
            '검색결과' : commonLang['검색결과'],
            '버전' : docsLang['버전']
        };
        var convertDate = function() {
            return (this.completeDate) ? GO.util.snsDate(this.completeDate) : "";
        };

        var SearchCollection = GO.BaseCollection.extend({
            url: function() {
                return "/api/search/docs";
            }
        });

        var Contacts = Backbone.View.extend({
            el : '#searchResultWrap',
            events : {
                'vclick li[data-docsId]': '_getContent'
            },
            initialize: function(options) {
                var _this = this;
                this.options = options;
                this.lastPage = false;
                this.$el.off();
                this.collection = new SearchCollection();
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
                var data = this.collection;
                this.$el.html(Hogan.compile(TplResult).render({
                    lang : lang,
                    data : data.toJSON(),
                    resultCount :data.page.total,
                    convertDate : convertDate
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
                    data : searchData,
                    convertDate : convertDate
                }))
            },
            _showResultWrap : function() {
                $('#simpleSearchWrap').hide();
                $('#detailSearchWrap').hide();
                $('#searchResultWrap').show();
            },
            _getContent : function(e) {
                var docsId = $(e.currentTarget).attr("data-docsId");
                GO.router.navigate("/docs/detail/"+docsId, true);
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