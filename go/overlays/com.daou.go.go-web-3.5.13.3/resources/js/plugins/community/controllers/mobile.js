(function () {

    define([
            "views/layouts/mobile_default",
            "i18n!nls/commons",
            "community/views/mobile/m_side_board",
            "community/views/mobile/m_side_community",
        ],
        function (
            MobileLayout,
            commonLang,
            SideBoardView,
            SideCommunityView
        ) {
            var CommunityController = (function () {
                var appName = 'community';
                var LayoutView = MobileLayout.create();

                var Controller = function () {
                };


                Controller.prototype = {
                    renderSideBoard: function (communityId) {
                        var deferred = $.Deferred();
                        var sideBoardView = SideBoardView.create(appName);

                        if (!communityId) return false;
                        sideBoardView.render({communityId: communityId}).done(function (sideMenu) {
                            var sideEl = LayoutView.getSideContentElement().html(sideMenu.$el);

                            // 수정전 반드시 GO-12241 참고.
                            LayoutView.showSideElement();

                            GO.EventEmitter.trigger('common', 'layout:initSideScroll', this);
                            sideEl.parent().hide();
                            deferred.resolve();
                        });

                        return deferred;
                    },
                    renderSideCommunity: function () {
                        var deferred = $.Deferred();
                        var sideCommunityView = SideCommunityView.create();

                        sideCommunityView.render().done(function (sideMenu) {
                            var sideEl = LayoutView.getSideContentElement().html(sideMenu.$el);

                            // 수정전 반드시 GO-12241 참고.
                            LayoutView.showSideElement();

                            GO.EventEmitter.trigger('common', 'layout:initSideScroll', this);
                            sideEl.parent().hide();
                            deferred.resolve();
                        });

                        return deferred;
                    },
                    render: function () {
                        require(["community/views/mobile/m_index"], function (CommunityAppView) {
                            LayoutView.render(appName).done(function (layout) {
                                //사이드메뉴
                                Controller.prototype.renderSideCommunity();
                                CommunityAppView.render();
                            });
                        });
                    },
                    renderCommunityHome: function (communityId) {
                        require(["community/views/mobile/m_home_list"], function (CommunityHomeView
                            ) {
                                LayoutView.render(appName).done(function (layout) {

                                    Controller.prototype.renderSideBoard(communityId).done(function () {
                                        CommunityHomeView.render({
                                            type: 'community',
                                            communityId: communityId
                                        });
                                    });
                                });
                            }
                        );
                    },
                    renderCommunityAdminPage: function (communityId, type, subType, memberId) {
                        require(["community/views/mobile/m_admin"], function (AdminView) {
                            LayoutView.render(appName).done(function (layout) {

                                Controller.prototype.renderSideBoard(communityId).done(function () {
                                    var adminView = new AdminView({
                                        communityId: communityId,
                                        type: type,
                                        subType: subType,
                                        memberId: memberId
                                    });
                                    adminView.renderWithCommunityData();
                                });
                            });
                        });
                    },
                    renderPostWrite: function (communityId, boardId, postId) {
                        require(["board/views/mobile/m_post_write"], function (PostWrite) {
                            LayoutView.render(appName).done(function (layout) {
                                var opt = {communityId: communityId, boardId: boardId, postId: postId || ''};
                                if (postId) {
                                    opt.type = 'reply';
                                }
                                PostWrite.render(opt);
                            });
                        });
                    },
                    renderEditWriteParam: function (communityId, boardId, postId) {
                        require(["board/views/mobile/m_post_write"], function (PostWrite) {
                            LayoutView.render(appName).done(function (layout) {
                                PostWrite.render({
                                    communityId: communityId,
                                    boardId: boardId,
                                    postId: postId,
                                    type: 'edit'
                                });
                            });
                        });
                    },
                    renderById: function (communityId, boardId) {
                        require(["board/views/mobile/m_post_home"], function (PostHomeView) {
                            LayoutView.render(appName).done(function (layout) {
                                if (boardId && boardId.indexOf("?") != -1) {
                                    boardId = boardId.split("?")[0];
                                }
                                PostHomeView.render({boardId: boardId, communityId: communityId});
                                Controller.prototype.renderSideBoard(communityId);
                            });
                        });
                    },
                    renderByPostId: function (communityId, boardId, postId) {
                        require(["board/views/mobile/m_post_home"], function (PostHomeView) {
                            LayoutView.render(appName).done(function (layout) {
                                if (postId && postId.indexOf("?") != -1) {
                                    postId = postId.split("?")[0];
                                }
                                PostHomeView.render({boardId: boardId, postId: postId, communityId: communityId});
                                layout.getSearchWrapElement().hide();
                                Controller.prototype.renderSideBoard(communityId);
                            });
                        });
                    },

                    renderByPostIdRecommends: function (communityId, boardId, postId) {
                        require(["board/views/mobile/m_post_recommends"], function (RecommendsView) {
                            LayoutView.render(appName).done(function (layout) {
                                RecommendsView.render({boardId: boardId, postId: postId});
                                Controller.prototype.renderSideBoard(communityId);
                            });
                        });
                    },
                    renderByPostIdComments: function (communityId, boardId, postId) {
                        require(["board/views/mobile/m_post_comments"], function (CommentsView) {
                            LayoutView.render(appName).done(function (layout) {
                                CommentsView.render({boardId: boardId, postId: postId});
                                Controller.prototype.renderSideBoard(communityId);
                            });
                        });
                    },

                    renderPostResult: function () {
                        require(["board/views/mobile/m_post_result"], function (PostResult) {
                            LayoutView.render(appName).done(function (layout) {
                                var content = layout.getContentElement();
                                PostResult.render();
                                content.append(PostResult.el);
                            });
                        });
                    }

                };

                return Controller;
            })();

            return new CommunityController();
        });

}).call(this);