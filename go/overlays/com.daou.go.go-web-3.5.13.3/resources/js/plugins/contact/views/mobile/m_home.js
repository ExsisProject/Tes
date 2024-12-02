define(function (require) {
    var MoreView = require("views/mobile/m_more_list");
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");
    var HeaderToolbarView = require("views/mobile/header_toolbar");
    var TplContactHome = require("hgn!contact/templates/mobile/m_home");
    var TplNoContactList = require('hgn!contact/templates/mobile/m_home_nolist');
    var CommonLang = require("i18n!nls/commons");
    var ContactLang = require("i18n!contact/nls/contact");
    require("GO.util");

    var GroupInfoModel = require("contact/models/group_info");
    var Contact = require("contact/collections/contacts_pager");
    var helper = require("contact/helpers/contacts");


    var lang = {
        'add_contact': ContactLang['연락처 추가'],
        'return_home': CommonLang['홈으로 이동'],
        'not_contact': ContactLang['등록된 주소록이 없습니다'],
        'company': CommonLang['공용'],
        'personal': CommonLang['개인'],
        'all_contact': ContactLang['전체 주소록'],
        'list_exposure_message': ContactLang['모바일 주소록 정보 보호 문구']
    };

    var instance = null;

    var Contacts = MoreView.extend({

        el: '#content',

        isCompanyType: function () {
            return this.type == "COMPANY";
        },

        events: {
            'vclick a[data-id]': 'getContact',
            'vclick .telMobile': 'telMobile',
            'vclick .smsMobile': 'smsMobile',
            'vclick .sendMail': 'sendMail'
        },

        initialize: function (options) {

            GO.util.appLoading(true);
            this.$el.off();
            this.type = this.options.type;
            this.deptId = this.options.deptId;
            this.groupId = this.options.groupId;

            this.$el.data('type', this.type);
            this.$el.data('deptId', this.deptId);
            this.$el.data('groupId', this.groupId);

            // 유틸사용을 위한 초기화
            helper.init(options);

            //부서인경우도 고려.

            if (this.groupId) {
                // 전체부소록이냐 주소부소록이냐..
                this.groupInfo = GroupInfoModel.read({groupId: this.groupId}).toJSON();
            }

            if (!this.isContactListExposure()) {
                return false;
            } else {
                this.$el.data('type', this.type);
                this.$el.data('deptId', this.deptId);
                this.$el.data('groupId', this.groupId);
            }
            var dataSet = {
                type: this.type,
                property: 'nameInitialConsonant',
                direction: 'asc',
                deptId: this.deptId,
                groupId: this.groupId
            };
            if (this.searchType) {
                dataSet['searchType'] = this.searchType;
            }
            if (this.keyWord) {
                dataSet['keyWord'] = this.keyWord;
            }
            this.collection = new Contact([], _.extend(dataSet, {collectionType: 'home'}));
            var renderListFunc = {
                listFunc: $.proxy(function (collection) {
                    this.renderList(collection);
                }, this)
            };
            this.setRenderListFunc(renderListFunc);
            this.setFetchInfo(dataSet, this.collection);
        },
        renderList: function (dataList) {
            var _list = (TplContactHome({
                lang: lang,
                data: dataList.toJSON(),
                isAvailableMail: function () {
                    if (App.isAvailableApp('mail')) return true;
                    else return false;
                }
            }));
            this.$el.find('ul.list_normal').append(_list);
        },
        render: function () {
            GO.util.pageDone();
            this.renderHeaderView();
            this.$el.html('<ul class="content list_normal list_photo list_address" data-type="list"></ul>');
            if (!this.isContactListExposure()) {
                this.$el.html(TplNoContactList({
                    lang: lang
                }));
                return this.$el;
            } else {
                GO.util.appLoading(true);
                this.dataFetch()
                    .done($.proxy(function (collection) {
                        this.renderListFunc.listFunc(collection);
                        this.scrollToEl();
                    }, this));
            }
            GO.util.appLoading(false);
        },

        renderHeaderView: function () {
            var self = this;
            var toolBarData = {
                title: (this.groupInfo) ? this.groupInfo.name : lang.all_contact,
                isList: true,
                isSideMenu: this.isContactListExposure() ? true : false,
                isHome: true,
                isSearch: true
            };

            if (canAdd.call(this)) {
                toolBarData.isWriteBtn = true;
                toolBarData.writeBtnCallback = function () {
                    self.contactCreate();
                }
            }

            HeaderToolbarView.render(toolBarData);

            if (!this.isContactListExposure()) {
                $('#btnSideMenu').hide();
            }

            function canAdd() {
                return !this.isCompanyType() || (this.isCompanyType() && this.groupInfo.writable);
            }
        },
        isContactListExposure: function () {
            return _.isUndefined(this.options.contactListExposure) || this.options.contactListExposure;
        },

        renderContacts: function () {
            GO.util.appLoading(true);

            this.$el.html(TplContactHome({
                lang: lang,
                data: this.collection.toJSON(),
                isAvailableMail: function () {
                    if (App.isAvailableApp('mail')) return true;
                    else return false;
                }
            }));

            //모바일 페이징 추가
            var pagingTpl = GO.util.mPaging(this.collection);
            this.$el.find('.paging').remove();
            this.$el.append(pagingTpl);

            GO.util.appLoading(false);
        },

        getContact: function (e) {
            this.setSessionInfo(e);
            var dataId = $(e.currentTarget).data('id'),
                url = ['contact'];
            if (this.groupId) {
                if (this.type)
                    url.push(helper.getURL());

                if (helper.isDept()) {
                    $.merge(url, [this.deptId, 'group', this.groupId]);
                } else {
                    url.push(this.groupId);
                }
            } else {
                if (helper.isDept()) {
                    $.merge(url, [helper.getURL(), this.deptId]);
                }
            }
            $.merge(url, ['view', dataId]);
            if (url) {
                GO.router.navigate(url.join('/'), {trigger: true, pushState: true});
            }

        },

        contactCreate: function () {
            var url = ['contact'];

            if (this.groupId) {
                if (this.type)
                    url.push(helper.getURL());

                if (helper.isDept()) {
                    $.merge(url, [this.deptId, 'group', this.groupId]);
                } else {
                    url.push(this.groupId);
                }
            } else {
                if (helper.isDept()) {
                    $.merge(url, [helper.getURL(), this.deptId]);
                }
            }

            url.push('create');

            App.router.navigate(url.join('/'), {trigger: true, pushState: true});
        },

        telMobile: function (e) {
            //e.preventDefault();
            e.stopPropagation();
            window.location.href = "tel:" + $(e.currentTarget).attr('data-mobile');
            return;
        },

        smsMobile: function (e) {
            //e.preventDefault();
            e.stopPropagation();
            if (GO.config('isMobileApp')) {
                window.location.href = "smsto:" + $(e.currentTarget).attr('data-mobile');
            } else {
                window.location.href = "sms://" + $(e.currentTarget).attr('data-mobile');
            }
            return;
        },

        sendMail: function (e) {
            //e.preventDefault();
            if (!App.isAvailableApp('mail')) return;
            e.stopPropagation();
            var self = this;

            if (confirm(ContactLang["메일을 보내시겠습니까?"])) {
                var data_id = $(e.currentTarget).parent().siblings().attr('data-id');
                var name = "";
                var positionName = "";
                var departmentName = "";
                var mailformat = "";
                self.collection.toJSON().forEach(function (item) {
                    if (item.id == data_id) {
                        if (!_.isEmpty(item.name)) {
                            name = item.name;
                        }
                        if (!_.isEmpty(item.positionName)) {
                            positionName = '/' + item.positionName;
                        }
                        if (!_.isEmpty(item.departmentName)) {
                            departmentName = '/' + item.departmentName;
                        }
                        mailformat = name + positionName + departmentName;
                        if (mailformat.length > 0) {
                            mailformat = '"' + mailformat + '"';
                        }
                    }
                });
                console.log(sessionStorage.getItem("GO-Agent-mail"));
                if (_.isNull(sessionStorage.getItem("GO-Agent-mail"))) {
                    sessionStorage.setItem("GO-Agent-mail", this._getGoAgentMail());
                }
                window.location.href = App.contextRoot + "app/mail?work=write&toAddr=" + encodeURIComponent($(e.currentTarget).attr('data-email'));
            }
            return;
        },

        _getGoAgentMail: function () {
            if (GO.util.isMobileApp()) {
                if (GO.util.isAndroidApp()) {
                    return "GO-Android";
                } else {
                    return "GO-iPhone";
                }
            }
            return "BROWSER";
        }

    });

    return {
        render: function (options) {
            instance = new Contacts(options);
            return instance.render();

        }
    }
});