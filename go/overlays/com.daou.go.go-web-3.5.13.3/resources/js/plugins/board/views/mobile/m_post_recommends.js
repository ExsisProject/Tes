(function () {
    define([
            'jquery',
            'backbone',
            'app',
            'board/models/board_config',
            'views/mobile/header_toolbar',
            'board/views/mobile/m_post_info',
            'board/collections/post_recommend',
            'hgn!board/templates/mobile/m_post_recommends',
            'hgn!board/templates/mobile/m_post_more_recommends',
            'i18n!board/nls/board',
            'i18n!nls/commons',
            'GO.util'
        ],
        function (
            $,
            Backbone,
            GO,
            BoardModel,
            HeaderToolbarView,
            PostInfoView,
            RecommendCollection,
            tplPostRecommends,
            tplPostMoreRecommends,
            boardLang,
            commonLang
        ) {
            var tplVar = {
                'recommend': boardLang['좋아요'],
                'recommend_null': boardLang['좋아요 목록이 없습니다.']
            };

            var PostRecommends = Backbone.View.extend({
                unbindEvent: function () {
                    this.$el.off('vclick', 'a[data-btn="paging"]');
                },
                bindEvent: function () {
                    this.$el.on('vclick', 'a[data-btn="paging"]', $.proxy(this.goPaging, this));
                },
                initialize: function (options) {
                    this.options = options || {};
                },
                initPage: function (args) {
                    this.boardId = args.boardId;
                    this.postId = args.postId;

                    this.options = {
                        boardId: this.boardId,
                        postId: this.postId
                    };
                },

                render: function () {
                    this.unbindEvent();
                    this.bindEvent();

                    this.initPage(arguments[0]);
                    this.renderTitleToolbar();

                    this.recommendCollection = RecommendCollection.getCollection(this.options);
                    this.dataset = this.recommendCollection.toJSON();

                    var homelistTpl = tplPostRecommends({
                        lang: tplVar,
                        recommendCount: this.dataset.length,
                        dataset: this.dataset,
                        dateformat: function () {
                            return GO.util.basicDate3(this.updatedAt);
                        }
                    });
                    this.$el.html(homelistTpl);

                    this.renderPostInfo();
                    this.$listEl = this.$el.find('ul.list_normal');

                    //모바일 페이징 추가
                    var pagingTpl = GO.util.mPaging(this.recommendCollection);
                    this.$el.find('.paging').remove();
                    this.$listEl.after(pagingTpl);

                },
                renderPostInfo: function () {
                    var postInfoView = PostInfoView.render(this.options),
                        postInfoEl = postInfoView.$el;

                    this.$el.find('.' + postInfoEl.className).remove();
                    this.$el.find('.classic_detail').prepend(postInfoEl);
                },
                renderTitleToolbar: function () {
                    this.boardModel = BoardModel.get(this.boardId);
                    this.boardName = this.boardModel.get('name');
                    HeaderToolbarView.render({
                        isClose: true
                    });
                },
                goPaging: function (e) {
                    GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
                    e.stopPropagation();

                    var direction = $(e.currentTarget).attr('data-direction'),
                        cPage = this.recommendCollection.page.page || 0;

                    if (direction == 'prev' && cPage > 0) cPage--;
                    else if (direction == 'next') cPage++;

                    $(e.currentTarget).parents('.paging').remove();
                    this.$listEl.empty();
                    this.recommendCollection.fetch({
                        async: false,
                        data: {page: cPage, offset: this.offset},
                        reset: true
                    });

                    this.dataset = this.recommendCollection.toJSON();
                    var moreListTpl = tplPostMoreRecommends({
                        dataset: this.dataset,
                        dateformat: function () {
                            return GO.util.basicDate3(this.updatedAt);
                        }
                    });

                    this.$listEl.html(moreListTpl);
                    //모바일 페이징 추가
                    var pagingTpl = GO.util.mPaging(this.recommendCollection);
                    this.$listEl.after(pagingTpl);

                    return false;
                }

            }, {
                __instance__: null,
                create: function () {
                    this.__instance__ = new this.prototype.constructor({el: $('#content')});
                    return this.__instance__;
                },
                render: function () {
                    var instance = this.create(),
                        args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];

                    return this.prototype.render.apply(instance, args);
                }
            });

            return PostRecommends;
        });
}).call(this);