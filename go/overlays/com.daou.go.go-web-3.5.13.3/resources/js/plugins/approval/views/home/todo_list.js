define([
        "jquery",
        "underscore",
        "backbone",
        "when",
        "app",
        "collections/paginated_collection",
        "approval/views/doclist/doclist_card_item",
        "approval/models/doclist_item",
        "hgn!approval/templates/doclist_empty",
        "hgn!approval/templates/home_card_list",
        "i18n!nls/commons",
        "i18n!approval/nls/approval",
    ],

    function (
        $,
        _,
        Backbone,
        when,
        GO,
        PaginatedCollection,
        DocListCardItemView,
        DocListItemModel,
        DocListEmptyTpl,
        HomeListCardTpl,
        commonLang,
        approvalLang
    ) {
        var HomeToDodocList = PaginatedCollection.extend({
            model: DocListItemModel,
            url: function () {
                return "/api/approval/home/todo" + "?" + "page=" + this.pageNo;
            }
        });

        var ConfigModel = Backbone.Model.extend({
            url: "/api/approval/apprconfig"
        });

        var HomeToDodocListView = Backbone.View.extend({
            initialize: function (options) {
                var self = this;
                this.options = options || {};
                this.collection = new HomeToDodocList();
                this.collection.bind('reset', this.generateList, this);
                this.configModel = new ConfigModel();
                this.useHold = true
                this.configModel.fetch({
                    async: false,
                    success: function (model) {
                        self.useHold = model.get('useHold');
                    }
                });
                this.collection.fetch({reset: true});
            },
            events: {
                'click a.next': '_goNext',
                'click a.previous': '_goPrevious'
            },
            render: function () {
                var lang = {};
                this.$el.html(HomeListCardTpl({
                    lang: {
                        "이전": commonLang["이전"],
                        "다음": commonLang["다음"],
                    },
                }));
                return this;
            },
            generateList: function () {
                var viewEl = this.$el;
                viewEl.find('div.card_item_wrapper').empty();
                var listType = "approval";
                this.collection.each(function (doc) {
                    var docListCardItemView = new DocListCardItemView({
                        listType: listType,
                        model: doc,
                        useHold: this.useHold
                    });
                    viewEl.find('div.card_item_wrapper').append(docListCardItemView.render().el);
                }, this);
                if (this.collection.length == 0) {
                    $('div.dashboard_box').html("<p class='desc'>" + approvalLang['결재할 문서가 없습니다.'] + "</p>");
                    $('div#pageNavigator').remove();
                } else {
                    this._makePageNavigation();
                }

            },
            // 제거
            release: function () {
                this.$el.off();
                this.$el.empty();
            },
            _makePageNavigation: function () {
                var pageInfo = this.collection.pageInfo();
                var disableClass = "paginate_button_disabled";

                if (pageInfo.lastPageNo == 0) {
                    this.$("#pageNavigator").remove();
                    return;
                }

                if (pageInfo.prev) {
                    this.$("a.previous").removeClass(disableClass);
                } else {
                    this.$("a.previous").addClass(disableClass);
                }

                if (pageInfo.next) {
                    this.$("a.next").removeClass(disableClass);
                } else {
                    this.$("a.next").addClass(disableClass);
                }

            },
            _goNext: function () {
                this._goPage("next");
            },
            _goPrevious: function () {
                this._goPage("previous");
            },
            _goPage: function (direction) {
                if (direction === 'next') {
                    this.collection.nextPage();
                } else {
                    this.collection.prevPage();
                }
            }

        });

        return HomeToDodocListView;
    });