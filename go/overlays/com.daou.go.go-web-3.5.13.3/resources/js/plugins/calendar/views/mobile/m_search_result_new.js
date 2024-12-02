(function() {
    define(function(require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            GO = require('app'),
            TplResult = require("text!calendar/templates/mobile/m_search_result_new.html"),
            TplResultItem = require("text!calendar/templates/mobile/m_search_result_unit.html"),
            CommonResult = require("views/mobile/m_search_common_result"),
            commonLang = require("i18n!nls/commons");

        require("GO.util");

        var instance = null;

        var lang = {
            '검색결과없음' : commonLang['검색결과없음'],
            '검색결과' : commonLang['검색결과']
        };

        var SearchListCollection = GO.BaseCollection.extend({
            url: function() {
                return "/api/search/calendar";
            }
        });

        var parseTimeType = function(){
            if(this.timeType == "allday"){
                if(GO.util.isSameDate(this.startTime, this.endTime)){
                    return GO.util.basicDate2(this.startTime);
                }
                return GO.util.basicDate2(this.startTime) + " ~ " + GO.util.basicDate2(this.endTime);
            }else{
                var start,end;
                if(GO.util.isSameDate(this.startTime, this.endTime)){
                    start = GO.util.basicDate(this.startTime);
                    end = GO.util.hourMinute(this.endTime);
                }else{
                    start = GO.util.basicDate(this.startTime);
                    end = GO.util.basicDate(this.endTime);
                }
            }
            return start + " ~ " + end;
        };

        var Contacts = Backbone.View.extend({
            el : '#searchResultWrap',
            events : {
                'vclick dd a[data-calendarid]': '_getContent'
            },
            initialize: function(options) {
                var _this = this;
                this.options = options;
                this.lastPage = false;
                this.$el.off();
                this.collection  = new SearchListCollection();
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
                    parseTimeType:parseTimeType,
                    resultCount :data.page.total
                },{
                    partial : TplResultItem
                }));
                $('#detailSearchToggle').removeClass('on');
                this._showResultWrap();
            },
            _moreList : function(collection) {
                var searchData = collection.toJSON();
                this.$el.find('dl:first').append(Hogan.compile(TplResultItem).render({
                    lang : lang,
                    data : searchData,
                    parseTimeType:parseTimeType,
                }))
            },
            _getContent : function(e) {
                var target = $(e.currentTarget);
                var calendarId = target.attr("data-calendarid");
                var eventId = target.attr("data-eventid");
                GO.router.navigate('calendar/'+calendarId+"/event/"+eventId ,{trigger: true, pushState: true});
            },
            _showResultWrap : function() {
                $('#simpleSearchWrap').hide();
                $('#searchResultWrap').show();
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