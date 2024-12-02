//게시판 글 목록 HOME
(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "hgn!community/templates/community_all",
            "hgn!community/templates/community_all_null",
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
            tplCommunityByAll,
            tplCommunityNull,
            commonLang,
            communityLang,
            boardLang
        ) {

            var tplVar = {
                'communityall': communityLang['전체 커뮤니티'],
                'community_name': communityLang['커뮤니티 명'],
                'community': commonLang['커뮤니티'],
                'search': communityLang['검색'],
                'all_post': communityLang['전체 글'],
                'community_member': communityLang['회원수'],
                'new_post': communityLang['새 글 등록'],
                'community_join': communityLang['가입'],
                'total': communityLang['총'],
                'count': boardLang['개'],
                'community_null': communityLang['생성된 커뮤니티가 없습니다.'],
                'community_create': communityLang['커뮤니티 만들기'],
                'community_create_at': communityLang['개설일'],
                'community_master': communityLang['마스터'],
                'placeholder_search': commonLang['플레이스홀더검색']
            };

            var Communities = Backbone.View.extend({
                el: '.tab_contents',
                events: {},

                initialize: function () {
                },

                render: function () {
                    this.$el.html(tplCommunityByAll({
                        lang: tplVar
                    }));
                    this.$el.find('input[placeholder]').placeholder();
                    return this.renderDataTables();
                },
                renderDataTables: function () {
                    var self = this;
                    var actionBtnWidth = GO.locale == 'ja' ? '120px' : '70px';

                    var showCommunityDetail = function (e) {
                        var eventTarget = $(e.currentTarget),
                            selectedIndex = eventTarget.attr('data-row'),
                            detailEl = self.$el.find('#communityDetail' + selectedIndex);

                        if (detailEl.length) {
                            if (detailEl.css('display') == 'none') {
                                detailEl.slideDown(100);
                                $(eventTarget).find('.ic_open_s').addClass('ic_close_s').removeClass('ic_open_s').attr("title", commonLang["접기"]);
                            } else {
                                $(eventTarget).find('.ic_close_s').addClass('ic_open_s').removeClass('ic_close_s').attr("title", commonLang["펼치기"]);
                                detailEl.slideUp(100);
                            }

                        } else {
                            $(eventTarget).find('.ic_open_s').addClass('ic_close_s').removeClass('ic_open_s');
                            if (typeof goGrid.tables.fnGetData == 'function') {
                                var aData = goGrid.tables.fnGetData(),
                                    selectedData = aData[selectedIndex],
                                    basicDate = GO.util.basicDate2(selectedData.createdAt),
                                    tplDetail = ['<tr class="detail_info" id="communityDetail', selectedIndex, '"><td colspan="6"><ul><li class="no_line"><span class="photo"><img alt="초상화" src="' + selectedData.thumbSmall + '" /></span>',
                                        '<p class="info">' + selectedData.description + '</p><span class="date">' + communityLang["개설일"] + ' : ' + basicDate + '</span><span class="manager">' + communityLang["마스터"] + ' : ' + selectedData.masterUser + '</span></li></ul></td></tr>'];
                                eventTarget.parents('tr:eq(0)').after(tplDetail.join(''));

                            }
                        }
                    };


                    var goGrid = $.goGrid({
                        el: '#allCommunity',
                        url: GO.contextRoot + 'api/community/list/all',
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
                                    var title = ['<span class="comm" data-id="', obj.aData.id, '" data-communityStatus="', obj.aData.status, '" data-memberType="', obj.aData.memberType,
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
                            {mData: "memberCount", bSortable: true, sWidth: '80px'},
                            /*{ mData: "postCount", bSortable: true, sWidth: '120px'},
                            { mData: "createdAt",bSortable: true, sWidth: '100px', fnRender: function(obj) {
                                if(obj.aData.createdAt != undefined) {
                                    return '<span class="date">'+ GO.util.shortDate(obj.aData.createdAt) +'</span></td>';
                                } else {
                                    return "";
                                }
                            }},*/
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
                            },
                            {
                                mData: null, bSortable: false, sWidth: actionBtnWidth, fnRender: function (obj) {
                                    var title = ['<span class="btn_fn7 communityAction">'];
                                    if (obj.aData.status == 'WAIT') {

                                        if (obj.aData.memberStatus == 'ONLINE') {
                                            title.push('<span class="txt_caution">' + communityLang["개설취소"] + '</span>');
                                        } else {
                                            title.push('<span class="txt">' + communityLang["개설대기"] + '</span>');
                                        }
                                    } else {

                                        if (obj.aData.memberStatus == 'ONLINE') {
                                            title.push('<span class="txt_caution">' + communityLang["탈퇴"] + '</span>');
                                        } else if (obj.aData.memberStatus == 'WAIT') {
                                            title.push('<span class="txt">' + communityLang["가입취소"] + '</span>');
                                        } else {
                                            title.push('<span class="txt_b">' + communityLang["가입"] + '</span>');
                                        }

                                    }
                                    title.push('</span></td>');
                                    return title.join('');
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
                },

            });

            return {
                render: function () {
                    var communities = new Communities();
                    return communities.render();
                }
            };
        });

}).call(this);