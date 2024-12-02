(function () {
    define(function (require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            TplResult = require("text!works/search/templates/mobile/search_result.html"),
            TplResultItem = require("text!works/search/templates/mobile/search_result_unit.html"),
            CommonResult = require("views/mobile/m_search_common_result"),
            Fields = require('works/collections/fields'),
            commonLang = require("i18n!nls/commons");

        require("GO.util");

        var instance = null;

        var lang = {
            '검색결과없음': commonLang['검색결과없음'],
            '검색결과': commonLang['검색결과']
        };

        var SearchCollection = Backbone.Collection.extend({
            url: function () {
                return '/api/search/works';
            }
        });

        var parseViewDatas = function (collection) {
            return _.map(collection.docs.content, function (document) {
                var summary = _.findWhere(collection.appletSummaries, {id: document.appletId});
                var appletIcon = summary.thumbSmall || '';
                var titleCid = summary.titleCid || '';
                var fieldsArray = summary.fields;
                var fields = new Fields(fieldsArray);
                var columnFields = fields.getColumnFields();
                var displayTitle = document.values[titleCid] || '';
                var content = columnFields.map(function (field) {
                    var tmpValue = field.getDisplayValue(new Backbone.Model(document), field.get('properties'));
                    var displayValue = (_.isArray(tmpValue) ? tmpValue.join(', ') : tmpValue);

                    if (field.get('cid') == titleCid) {
                        displayTitle = displayValue;
                    }
                    return field.get('label') + ': ' + displayValue;
                });
                return {
                    id: document.id,
                    appletId: document.appletId,
                    title: displayTitle,
                    createdAt: GO.util.basicDate3(document.values.create_date),
                    content: content,
                    creator: document.values.creator ? GO.util.userLabel(document.values.creator) : "",
                    appletName: summary.name,
                    appletIcon: appletIcon
                };
            }, this);
        };

        var Contacts = Backbone.View.extend({
            el: '#searchResultWrap',
            events: {
                'vclick li[data-id]': '_getContent'
            },
            initialize: function (options) {
                var _this = this;
                this.lastPage = false;
                this.pageNo = 0;
                this.options = options;
                this.$el.off();
                this.collection = new SearchCollection();
                CommonResult.set({
                    collection: this.collection,
                    searchOptions: this.options,
                    renderListFunc: function (collection) {
                        _this._renderContents(collection);
                    },
                    renderListMoreFunc: function (collection) {
                        _this._moreList(collection);
                    }
                });
            },
            render: function () {
                CommonResult.fetch();
                return this.el;
            },
            _renderContents: function () {
                var _this = this;
                var searchData = this.collection.toJSON()[0];
                var data = parseViewDatas(searchData);

                this.$el.html(Hogan.compile(TplResult).render({
                    lang: lang,
                    data: data,
                    highlightTitle: function () {
                        return _this._highlighting(this.title, _this.options.keyword);
                    },
                    highlightContent: function () {
                        return _this._highlighting(this.content.join(), _this.options.keyword);
                    },
                    highlightAppletName: function () {
                        return _this.options.appletName ? _this._highlighting(this.appletName, _this.options.appletName) : this.appletName
                    },
                    resultCount: searchData.docs.pageInfo.total
                }, {
                    partial: TplResultItem
                }));
                $('#detailSearchToggle').removeClass('on');
                this._showResultWrap();
            },
            _moreList: function (collection) {
                var _this = this;
                var searchData = collection.toJSON()[0];
                if (searchData.docs.content.length == 0) return;
                this.$el.find('ul:first').append(Hogan.compile(TplResultItem).render({
                    lang: lang,
                    data: parseViewDatas(searchData),
                    highlightTitle: function () {
                        return _this._highlighting(this.title.join(), _this.options.keyword);
                    },
                    highlightContent: function () {
                        return _this._highlighting(this.content.join(), _this.options.keyword);
                    },
                    highlightAppletName: function () {
                        return _this.options.appletName ? _this._highlighting(this.appletName, _this.options.appletName) : this.appletName
                    },
                }))
            },
            _showResultWrap: function () {
                $('#simpleSearchWrap').hide();
                $('#detailSearchWrap').hide();
                $('#searchResultWrap').show();
            },
            _highlighting: function (content, keyword) {
                if(_.isUndefined(content) || content == null) {
                    return;
                }

                content = content.toString();
                return content.replace(new RegExp(keyword, 'gi'), '<strong class="txt_key">' + keyword + "</strong>");
            },
            _getContent: function (e) {
                var $target = $(e.currentTarget);
                var appletId = $target.attr('data-applet-id');
                var docId = $target.attr('data-id');
                GO.router.navigate('works/applet/' + appletId + '/doc/' + docId, true);
            }
        });
        return {
            render: function (options) {
                instance = new Contacts(options);
                return instance.render();
            }
        };
    });
}).call(this);
