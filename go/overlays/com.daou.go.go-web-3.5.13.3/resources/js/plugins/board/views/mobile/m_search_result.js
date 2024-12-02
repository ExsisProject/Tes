(function() {
    define(function(require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            GO = require('app'),
            SearchCollection = require("board/collections/post_search"),
            TplResult = require("text!board/templates/mobile/m_search_result.html"),
            TplResultItem = require("text!board/templates/mobile/m_search_result_unit.html"),
            CommonResult = require("views/mobile/m_search_common_result"),
            commonLang = require("i18n!nls/commons"),
            boardLang = require("i18n!board/nls/board");

        require("GO.util");

        var instance = null;
        var lang = {
            '검색결과없음' : commonLang['검색결과없음'],
            '검색결과' : commonLang['검색결과']
        };

        var dateParse = function(){
            return GO.util.snsDate(this.createdAt);
        };

        var resultContentParse = function(){
            if(this.hiddenPost){
                return boardLang['열람권한이 없는 게시물입니다.'];
            }
            var content = this.content;
            content = content.replace(/<br \/>/gi, "");
            return content;
        };
        var isStream = function(){
            var boardType = this.boardType;
            if(boardType == "STREAM"){
                return true;
            }
            return false;
        };

        var Contacts = Backbone.View.extend({
            el : '#searchResultWrap',
            events : {
                'vclick li[data-postid]': '_getContent'
            },
            initialize: function(options) {
                var _this = this;
                this.options = options;
                this.lastPage = false;
                this.$el.off();
                this.collection  = new SearchCollection.setCollection(this.options.isCommunity);
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
                    dateParse:dateParse,
                    resultContentParse:resultContentParse,
                    isStream:isStream
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
                    dateParse:dateParse,
                    resultContentParse:resultContentParse,
                    isStream:isStream
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
                    boardType = targetEl.attr('data-boardType'),
                    boardId = targetEl.attr('data-boardId'),
                    postId = targetEl.attr('data-postId');

                if(!boardType || !boardId || !postId){
                    return;
                }
                if(targetEl.attr('data-hidden') == 'true'){
                    GO.util.delayAlert(boardLang['열람권한이 없는 게시물입니다.']);
                    return;
                }
                $.ajax({
                    "url" : GO.contextRoot+"api/board/"+boardId+"/master",
                    "type" : 'GET',
                    "dataType" : 'json',
                    "success" : function(response) {
                        var communityId = 0;
                        if(response.data.ownerType == "Community") {
                            communityId = response.data.ownerId;
                        }
                        var routerApi = "board/"+boardId+"/post/"+ postId;
                        if(communityId) {
                            routerApi = "community/"+communityId+"/"+routerApi;
                        }
                        if(boardType == "STREAM") {
                            routerApi = routerApi + "/stream";
                        }
                        GO.router.navigate(routerApi, true);
                    }
                });

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