//게시판 글 목록 HOME
(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "hgn!community/templates/community_user",
            "hgn!community/templates/community_user_null",
            "hgn!community/templates/post_detail",

            "i18n!nls/commons",
            "i18n!community/nls/community",
            "i18n!board/nls/board",
            "jquery.go-grid",
            "jquery.placeholder"
        ],
        function (
            $,
            Backbone,
            App,
            tplCommunityByUser,
            tplCommunityNull,
            tplPostDetail,
            commonLang,
            communityLang,
            boardLang
        ) {

            var tplVar = {
                'joincommunity': communityLang['가입 커뮤니티'],
                'community_name': communityLang['커뮤니티 명'],
                'search': commonLang['검색'],
                'community': commonLang['커뮤니티'],
                'all_post': communityLang['전체 글'],
                'community_member': communityLang['회원수'],
                'new_post': communityLang['새 글 등록'],
                'thumnail': communityLang['초상화'],
                'post_null': communityLang['아직 작성 된 글이 없습니다.'],
                'total': communityLang['총'],
                'count': boardLang['개'],
                'not_community': communityLang['가입된 커뮤니티가 없습니다.'],
                'join_community': communityLang['가입하기'],
                'community_create_at': communityLang['개설일'],
                'community_master': communityLang['마스터'],
                'placeholder_search': commonLang['플레이스홀더검색']
            };

            var Communities = Backbone.View.extend({

                el: '.tab_contents',

                events: {},

                initialize: function () {
                    this.unbindEvent();
                    this.bindEvent();
                },

                bindEvent: function () {
                },

                unbindEvent: function () {
                },

                render: function () {
                    this.$el.html(tplCommunityByUser({
                        lang: tplVar
                    }));
                    this.$el.find('input[placeholder]').placeholder();
                    return this.renderDataTables();
                },

                renderDataTables: function () {
                    var self = this;
                    var goGrid = $.goGrid({
                        el: '#joinedCommunity',
                        url: GO.contextRoot + 'api/community/list/joined',
                        emptyMessage: tplCommunityNull({lang: tplVar}),
                        method: 'get',
                        defaultSorting: [],
                        params: {
                            property: 'createdAt',
                            direction: 'desc'
                        },
                        columns: [
                            {
                                mData: "name", bSortable: true, sClass: "align_l", fnRender: function (obj) {
                                    var tag = '';
                                    if (obj.aData.memberStatus == "WAIT" && obj.aData.status == "ONLINE") {
                                        // 가입대기
                                        tag = '<span class="btn_state_disable"><span class="txt">' + communityLang["가입대기"] + '</span></span>';
                                    }
                                    if (obj.aData.memberStatus == "ONLINE" && obj.aData.status == "WAIT") {
                                        // 개설대기
                                        tag = '<span class="btn_state_disable"><span class="txt">' + communityLang["개설대기"] + '</span></span>';
                                    }

                                    var title = [tag, '&nbsp;<span class="comm" data-id="', obj.aData.id, '" data-communityStatus="', obj.aData.status, '" data-memberType="', obj.aData.memberType,
                                        '" data-memberStatus="', obj.aData.memberStatus, '" data-publicFlag="', obj.aData.publicFlag, '">' + _.escape(obj.aData.name)];
                                    if (obj.aData.newCommunity) {
                                        title.push('&nbsp;<span class="ic_classic ic_new" title="' + communityLang["새커뮤니티"] + '"></span>');
                                    }

                                    if (!obj.aData.publicFlag) {
                                        title.push('&nbsp;<span class="ic_classic ic_lock" title="' + commonLang["비공개"] + '"></span>');
                                    }
                                    title.push('</span>');
                                    return title.join('');
                                }
                            },
                            {mData: "memberCount", bSortable: true, sWidth: "80px"},
                            {
                                mData: "postCount", sWidth: '120px', bSortable: true, fnRender: function (obj) {
                                    if (obj.aData.newPostCount > 0) {
                                        return '<span class="num"><span title="' + commonLang["새글"] + '" class="ic_classic ic_new2"></span><strong>' + obj.aData.newPostCount + '</strong>/' + obj.aData.postCount + '</span>';
                                    } else {
                                        return '<span class="num">' + obj.aData.postCount + '</span>';
                                    }
                                }
                            },
                            {
                                mData: "masterUser", mRender: function (data) {
                                    if (!data) {
                                        return "";
                                    }
                                    return data;
                                }, bSortable: true, sWidth: '120px', fnRender: function (obj) {
                                    if (!obj.aData.masterUser) {
                                        return '<span class="master"></span></td>';
                                    }
                                    return '<span class="master">' + obj.aData.masterUser + '</span></td>';
                                }
                            }
                        ],

                        fnDrawCallback: function (tables, oSettings) {
                            self.renderToolbar(oSettings._iRecordsTotal);
                        }
                    });
                    return goGrid;
                },

                renderToolbar: function (total) {
                    this.$el.find('#toolBar #communityTotalElements').html(total);
                    this.$el.find('.tool_bar .custom_header').append(this.$el.find('#toolBar').show());
                    if (total < 1) {
                        $(".table_search").hide();
                    }
                }
            });

            return {
                render: function () {
                    var communities = new Communities();
                    return communities.render();
                }
            };
        });

}).call(this);