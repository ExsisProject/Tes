//게시판 글 목록 HOME
(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "hgn!community/templates/members",
            "i18n!nls/commons",
            "i18n!community/nls/community",
            "board/views/board_title",
            "community/models/info",
            "jquery.go-grid",
            "jquery.placeholder"

        ],
        function (
            $,
            Backbone,
            App,
            tplCommunityMembers,
            commonLang,
            communityLang,
            BoardTitleView,
            infoModel
        ) {

            var tplVar = {
                'community_member': communityLang['멤버 전체'],
                'community_member_list': communityLang['커뮤니티 전체 멤버 리스트'],
                'name': commonLang['이름'],
                'dept': commonLang['소속'],
                'email': commonLang['이메일'],
                'count': commonLang['명'],
                'join_date': communityLang['가입 신청일'],
                'post_count': communityLang['게시 글 수'],
                'name': commonLang['이름'],
            };

            var CommunityAdminHome = Backbone.View.extend({
                el: '#content',
                manage: false,
                events: {},
                initialize: function (options) {
                    this.options = options || {};
                    this.unbindEvent();
                    this.bindEvent();
                    this.dataTable = null;
                    this.communityId = this.options.communityId;
                    if (this.status == undefined) {
                        this.status = "online";
                    } else {
                        this.status = this.options.status;
                    }
                },

                bindEvent: function () {
                    this.$el.on("click", "#memberSearch", $.proxy(this.search, this));
                    this.$el.on("keydown", "#memberSearch2 input", $.proxy(this.searchKeyboardEvent, this));
                },

                unbindEvent: function () {
                    this.$el.off("click", "#memberSearch");
                    this.$el.off("keydown", "#memberSearch2 input");
                },

                render: function () {
                    var self = this;
                    var model = infoModel.read({communityId: this.communityId}).toJSON();
                    var mailExposure = GO.config("mailExposure");

                    this.$el.html(tplCommunityMembers({
                        lang: tplVar,
                        mailExposure: mailExposure
                    }));

                    BoardTitleView.render({
                        el: '.content_top',
                        dataset: {
                            name: model.name
                        },
                        isCommunity: true
                    });
                    $('input[placeholder], textarea[placeholder]').placeholder();

                    var columns = [
                        {mData: "name", sWidth: "100px", bSortable: true},
                        {mData: "departmentName", bSortable: true},
                        {mData: "email", bSortable: true},
                        {
                            mData: "createdAt", bSortable: true, fnRender: function (obj) {
                                return GO.util.basicDate2(obj.aData.createdAt);
                            }
                        },
                        {mData: "postCount", bSortable: true, sWidth: '100px'}
                    ];

                    if (!mailExposure) {
                        columns.splice(2, 1);
                    }

                    this.dataTable = $.goGrid({
                        el: '#memberList',
                        url: GO.contextRoot + 'api/community/' + this.communityId + '/member/' + this.status,
                        method: 'get',
                        defaultSorting: [],
                        params: {
                            property: 'memberType',
                            direction: 'asc'
                        },
                        columns: columns,

                        fnDrawCallback: function (tables, oSettings) {
                            self.renderToolbar(oSettings._iRecordsTotal);
                        }
                    });
                },

                renderToolbar: function (total) {
                    this.$el.find('#toolBar #memberTotalElements').html(total);
                    this.$el.find('.tool_bar .custom_header').html(this.$el.find('#toolBar').html());
                },

                searchKeyboardEvent: function (e) {
                    if (e.keyCode == 13) {
                        this.search();
                    }
                },

                search: function () {
                    var searchForm = this.$el.find('.table_search input[type="text"]'),
                        keyword = searchForm.val();

                    if (!$.goValidation.isCheckLength(1, 32, keyword)) {
                        $.goMessage(App.i18n(communityLang['0자이상 0이하 입력해야합니다.'], {"arg1": "1", "arg2": "32"}));
                        return false;
                    }
                    this.dataTable.tables.search(this.$el.find('.table_search select').val(), keyword);
                }


            });
            return {
                render: function (communityId, status) {
                    var communityAdminHome = new CommunityAdminHome({communityId: communityId, status: status});
                    return communityAdminHome.render();
                }
            };
        });

}).call(this);
