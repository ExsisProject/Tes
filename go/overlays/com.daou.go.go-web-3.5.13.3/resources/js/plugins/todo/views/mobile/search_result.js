(function() {
    define(function(require) {
        var $ = require("jquery"),
            Backbone = require("backbone"),
            App = require("app"),
            TplResult = require("text!todo/templates/mobile/m_search_result.html"),
            TplResultItem = require("text!todo/templates/mobile/m_search_result_unit.html"),
            CommonResult = require("views/mobile/m_search_common_result"),
            commonLang = require("i18n!nls/commons"),
            TodoUtil = require("todo/libs/util");
        require("GO.util");

        var instance = null;
        var lang = {
            '검색결과없음' : commonLang['검색결과없음'],
            '검색결과' : commonLang['검색결과']
        };

        var TodoSearchCollection = Backbone.Collection.extend({
            url: function() {
                return '/api/search/todo';
            }
        });

        var parseDueDate = function() {
            if(this.dueDate) {
                return TodoUtil.parseDuedate(this.dueDate);
            }
        };

        var SearchView = Backbone.View.extend({
            el : '#searchResultWrap',
            events : {
                'vclick a[data-id]': '_getContent',
            },
            initialize: function(options) {
                var _this = this;
                this.options = options;
                this.lastPage = false;
                this.$el.off();
                this.collection  = new TodoSearchCollection();
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
                    data : searchData.toJSON(),
                    parseDueDate : parseDueDate,
                    contextRoot : App.contextRoot,
                    resultCount : searchData.page.total
                },{
                    partial : TplResultItem
                }));
                $('#detailSearchToggle').removeClass('on');
                this._showResultWrap();
            },
            _moreList : function(collection) {
                this.$el.find('ul:first').append(Hogan.compile(TplResultItem).render({
                    lang : lang,
                    data : collection.toJSON(),
                    parseDueDate : parseDueDate,
                    contextRoot : App.contextRoot
                }))
            },
            _showResultWrap : function() {
                $('#simpleSearchWrap').hide();
                $('#searchResultWrap').show();
            },
            _getContent : function(e) {
                e.preventDefault();
                location.href = $(e.currentTarget).attr('href');
            }
        });
        return {
            render : function(options) {
                instance = new SearchView(options);
                return instance.render();
            }
        };
    });

}).call(this);