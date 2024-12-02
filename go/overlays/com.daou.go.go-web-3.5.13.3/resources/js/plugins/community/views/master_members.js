//게시판 글 목록 HOME
(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "hgn!community/templates/master_members",
            "hgn!community/templates/member_wait_null",
            "community/models/info",
            "i18n!nls/commons",
            "i18n!community/nls/community",
            "jquery.go-grid",
            "jquery.placeholder"

        ],
        function (
            $,
            Backbone,
            App,
            tplCommunityMasterMembers,
            tplMemberListNull,
            infoModel,
            commonLang,
            communityLang
        ) {

            var tplVar = {
                'community_info': communityLang['정보'],
                'community_board': communityLang['게시판'],
                'community_members': communityLang['멤버'],
                'community_delete': communityLang['패쇄'],
                'community_member_all': communityLang['커뮤니티 전체 멤버 리스트'],
                'community_name': commonLang['이름'],
                'community_dept': communityLang['소속'],
                'community_email': communityLang['이메일'],
                'community_jointat': communityLang['가입 신청일'],
                'community_post_count': communityLang['게시 글 수'],
                'community_online': communityLang['사용중'],
                'community_wait': communityLang['가입 승인 대기'],
                'community_member': communityLang['사용 멤버'],
                'community_leave': communityLang['탈퇴'],
                'community_accept': communityLang['승인'],
                'community_reject': communityLang['거절'],
                'community_total': communityLang['총'],
                'community_count': communityLang['명'],
                'community_wait_null': communityLang['승인대기중인 멤버가 없습니다.'],
                'name': commonLang['이름'],
                'placeholder_name': commonLang['플레이스홀더이름'],
                'send_mail': communityLang['메일발송'],
                'send_mail_all': communityLang['전체 메일발송']
            };

            var CommunityMasterHome = Backbone.View.extend({
                //el : '.tab_conent_wrap',
                manage: false,
                events: {},
                initialize: function (options) {
                    this.options = options || {};
                    this.unbindEvent();
                    this.bindEvent();
                    this.dataTable = null;
                    this.communityId = this.options.communityId;
                    this.status = this.options.status;
                    this.communityName = this.options.communityName;
                },

                bindEvent: function () {
                    this.$el.on("click", "#memberSearch", $.proxy(this.search, this));
                    this.$el.on("keydown", "#memberSearch2 input", $.proxy(this.searchKeyboardEvent, this));
                    this.$el.on("click", "#btnSendMail", $.proxy(this.sendMail, this));
                    this.$el.on("click", "#btnSendMailAll", $.proxy(this.sendMailAll, this));
                },

                unbindEvent: function () {
                    this.$el.off("click", "#memberSearch");
                    this.$el.off("keydown", "#memberSearch2 input");
                    this.$el.off("click", "#btnSendMail");
                    this.$el.off("click", "#btnSendMailAll");
                },

                render: function () {
                    this.$el.empty();

                    var status = this.status;
                    var mailExposure = GO.config("mailExposure");

                    this.$el.html(tplCommunityMasterMembers({
                        lang: tplVar,
                        isAvailableMail: function () {
                            if (App.isAvailableApp('mail')) return true;
                            else return false;
                        },
                        isOnlineMember: function () {
                            if (status == "online") {
                                return true;
                            } else {
                                return false;
                            }
                        },
                        mailExposure: mailExposure
                    }));
                    $('input[placeholder], textarea[placeholder]').placeholder();

                    var self = this;
                    var columns = [
                        {mData: "name", sWidth: "100px", bSortable: true},
                        {mData: "departmentName", sWidth: "150px", bSortable: true},
                        {mData: "email", sWidth: '200px', bSortable: true},
                        {
                            mData: "createdAt", sWidth: '120px', bSortable: true, fnRender: function (obj) {
                                return GO.util.basicDate2(obj.aData.createdAt);
                            }
                        },
                        {mData: "postCount", sWidth: '80px', bSortable: true}
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
                        emptyMessage: tplMemberListNull({
                            lang: tplVar
                        }),
                        checkbox: true,
                        checkboxData: 'userId',
                        columns: columns,

                        fnDrawCallback: function (tables, oSettings) {
                            self.renderToolbar(oSettings._iRecordsTotal);
                        }
                    });

                    if (this.status == 'online') {
                        $('#onlineMember').attr('checked', true);
                        $('.wait').remove();
                    } else {
                        $('#waitMember').attr('checked', true);
                        $('.online').remove();
                    }

                    return this.dataTable;

                },

                renderToolbar: function (total) {
                    var toolbar = this.$el.find('#toolBar #memberTotalElements').html(total);
                    if (toolbar.length > 0) {
                        this.$el.find('.tool_bar .custom_header').html(this.$el.find('#toolBar').html());
                        this.$el.find('#toolBar').remove();
                    } else {
                        this.$el.find('#memberTotalElements').html(total);
                    }

                    if (total <= 0) {
                        this.$el.find('#btnMember').remove();
                    }

                },

                searchKeyboardEvent: function (e) {
                    if (e.keyCode == 13) {
                        this.search();
                    }
                },

                search: function () {
                    var searchForm = this.$el.find('.table_search input'),
                        keyword = searchForm.val();

                    if ($('input.search2').attr('placeholder') === this.$el.find('input.search2').val()) {
                        keyword = '';
                    }

                    if (!$.goValidation.isCheckLength(1, 32, keyword)) {
                        $.goMessage(App.i18n(communityLang['0자이상 0이하 입력해야합니다.'], {"arg1": "1", "arg2": "32"}));
                        return false;
                    }

                    this.dataTable.tables.search(this.$el.find('.table_search select').val(), keyword);
                },

                sendMail: function () {
                    var form = this.$el.find('form[name=formCommunityMembers]'),
                        contactEl = form.find('tbody input[type="checkbox"]:checked');

                    if (contactEl.size() == 0) {
                        $.goMessage(communityLang['선택된 멤버가 없습니다']);
                        return;
                    }

                    var checkedData = this.dataTable.tables.getCheckedData(),
                        emailArr = [];
                    emailArr = $(checkedData).map(function (k, v) {
                        if (v.email) {
                            return "\"" + v.name + "\"" + " <" + v.email + ">";
                        }
                    }).get();

                    if (!emailArr.length) {
                        $.goMessage(contactLang['메일 주소가 없습니다.']);
                    } else {
                        var param = {"to": emailArr.join(',')};
                        window.open(GO.contextRoot + "app/mail/popup/process?data=" + encodeURIComponent(JSON.stringify(param)), "popupRead" + Math.floor(Math.random() * 1000000) + 1, "scrollbars=yes,resizable=yes,width=1280,height=760");
                    }
                },

                sendMailAll: function (e) {
                    var communityInfo = infoModel.read({communityId: this.communityId}).toJSON();
                    var param = {"to": "\"" + communityInfo.name + "\" " + "<!" + this.communityId + ">"};
                    window.open(GO.contextRoot + "app/mail/popup/process?data=" + encodeURIComponent(JSON.stringify(param)), "popupRead" + Math.floor(Math.random() * 1000000) + 1, "scrollbars=yes,resizable=yes,width=1280,height=760");
                },

            });

            return {
                render: function (communityId, status) {
                    var communityMasterHome = new CommunityMasterHome({
                        el: '.tab_conent_wrap',
                        communityId: communityId,
                        status: status
                    });
                    return communityMasterHome.render();
                }
            };
        });

}).call(this);
