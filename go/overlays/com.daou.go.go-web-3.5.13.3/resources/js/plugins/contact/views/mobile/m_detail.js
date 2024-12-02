(function () {
    define(function (require) {

        var $ = require("jquery");
        var Backbone = require("backbone");
        var App = require("app");
        var _ = require("underscore");
        var HeaderToolbarView = require("views/mobile/header_toolbar");

        var TplContactDetail = require("hgn!contact/templates/mobile/m_detail");
        var ContactInfoModel = require("contact/models/contact_info");
        var CompanyContactInfoModel = require("contact/models/company_contact_info");
        var GroupInfoModel = require("contact/models/group_info");
        var DeleteContactModel = require("contact/models/delete_contact");
        var commonLang = require("i18n!nls/commons");
        var userLang = require("i18n!nls/user");
        var contactLang = require("i18n!contact/nls/contact");
        var DeptContactModel = require("contact/models/dept_contact");
        var helper = require("contact/helpers/contacts");

        require("GO.util");
        require("jquery.cookie");

        var instance = null;

        var lang = {
            'add_contact': contactLang['연락처 추가'],
            'return_home': commonLang['홈으로 이동'],
            'not_contact': contactLang['등록된 주소록이 없습니다'],
            'name': commonLang['이름'],
            'company': userLang['회사'],
            'dept': userLang['부서'],
            'position': userLang['직위'],
            'group': contactLang['그룹'],
            'group_create': contactLang['그룹추가'],
            'email': userLang['이메일'],
            'phone': userLang['휴대폰'],
            'company_tel': contactLang['회사전화'],
            'company_addr': contactLang['회사주소'],
            'description': contactLang['메모'],
            'nickName': contactLang['애칭'],
            'birthday': contactLang['생일'],
            'anniversary': contactLang['기념일'],
            'home_tel': contactLang['집 전화'],
            'home_addr': contactLang['집 주소'],
            'home_fax': contactLang['집 팩스'],
            'home_homepage': contactLang['집 홈페이지'],
            'company_fax': contactLang['회사 팩스'],
            'company_homepage': contactLang['회사 홈페이지'],
            'profilephoto': contactLang['프로필사진'],
            'delete': commonLang['삭제'],
            'image': commonLang["사진"],
            'modify': commonLang['수정'],
            'copy_url': commonLang['URL 복사']
        };

        var Contacts = Backbone.View.extend({
            el: '#content',

            events: {
                "vclick #telMobile": "telMobile",
                "vclick #smsMobile": "smsMobile",
                "vclick #sendMail": "sendMail",
            },

            initialize: function (options) {
                this.$el.off();
                this.type = options.type;
                this.contactId = options.contactId;
                this.viewMode = options.viewMode;
                this.groupId = options.groupId;
                this.deptId = options.deptId;

                // 유틸사용을 위한 초기화
                helper.init(options);

                this.headerToolbarView = HeaderToolbarView;
                this.groupInfo = getGroupInfo(this.groupId);

                function getGroupInfo(groupId) {
                    var groupInfo = {
                        readable: true,
                        removable: true,
                        writable: true
                    };

                    if (_.isUndefined(groupId)) {
                        groupInfo;
                    }

                    if (helper.isCompany()) {
                        groupInfo = GroupInfoModel.read({"groupId": groupId}).toJSON();
                    }

                    return groupInfo;
                }

                GO.EventEmitter.off("trigger-action");
                GO.EventEmitter.on('trigger-action', 'contact-modify', this.contactModify, this);
                GO.EventEmitter.on('trigger-action', 'contact-delete', this.contactDelete, this);
                GO.EventEmitter.on('trigger-action', 'contact-copy-url', this.copyUrl, this);
            },

            render: function () {
                this.renderToolbar();
                this.renderDetail();
            },
            copyUrl: function () {
                GO.util.copyUrl();
            },

            renderDetail: function () {
                var contactModel,
                    self = this;
                var errorFunc = {
                    error: function (model, response) {
                        GO.util.linkToErrorPage(response);
                    }
                };

                if (helper.isUser()) {
                    contactModel = ContactInfoModel.read({
                        contactId: this.contactId
                    });
                } else if (helper.isCompany()) {
                    contactModel = new CompanyContactInfoModel();
                    contactModel.set({
                        "groupId": this.groupId,
                        "contactId": this.contactId
                    });
                    contactModel.fetch({
                        async: false,
                        error: errorFunc.error
                    });
                } else { // this.isDept()
                    contactModel = new DeptContactModel();
                    contactModel.setDeptId(this.deptId);
                    contactModel.set("id", this.contactId);
                    contactModel.fetch({
                        async: false,
                        error: errorFunc.error
                    });
                }

                var contactData = contactModel.toJSON();

                this.$el.html(TplContactDetail({
                    lang: lang,
                    isMobileApp: GO.config('isMobileApp'),
                    contextRoot: App.contextRoot,
                    data: self.parseData(contactData),
                    isGroups: function () {
                        if (contactData.groups != undefined) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    isAvailableMail: function () {
                        if (App.isAvailableApp('mail')) return true;
                        else return false;
                    }
                }));
                $('#btnToolbarRight').remove();
                $('#goBody').addClass('address_detail');
                if ($('#defaultInfo ul li').length == 0) {
                    $('#defaultInfo').hide();
                }
                if ($('#addInfo ul li').length == 0) {
                    $('#addInfo').hide();
                }
            },

            /**
             * 툴바 및 제목 렌더링
             */
            renderToolbar: function () {
                /*var _this = this;
                var toolbarOpt = {
                    contentEl : this.$el,
                    isList: true,
                    isSideMenu: true,
                    isHome: true,
                    isSearch: true,
                    isPrev : true,
                    name : contactLang['연락처 보기'],
                    rightButton : {
                        callback : function(e){
                            _this.contactModify();
                        },
                        text : lang.modify,
                        id : "addrModify"
                    },
                    rightButtonOther : {
                         callback : function(e){
                             _this.contactDelete();
                         },
                         text : lang.delete,
                         id : "addrDelete",
                         className : "txt_caution"
                    }
                };

                //수정권한
                if(!this.groupInfo.writable){
                    toolbarOpt.rightButton = false;
                }
                //삭제권한
                if(!this.groupInfo.removable){
                    toolbarOpt.rightButtonOther = false;
                }

                this.titleToolbarView.render(toolbarOpt);*/

                var toolbarOpt = {
                    isPrev: true,
                    actionMenu: this.getUseMenus()
                };
                this.headerToolbarView.render(toolbarOpt);

            },

            getUseMenus: function () {
                var menus = {
                    "수정": {
                        id: "contact-modify",
                        text: lang.modify,
                        triggerFunc: "contact-modify",
                        inMoreBtn: true
                    },
                    "삭제": {
                        id: "contact-delete",
                        text: lang.delete,
                        triggerFunc: "contact-delete",
                        inMoreBtn: true
                    },
                    "URL 복사": {
                        id: "contact-copy-url",
                        text: lang.copy_url,
                        triggerFunc: "contact-copy-url"
                    }
                };
                var useMenuList = [];
                if (this.groupInfo.removable) {
                    useMenuList.push(menus["URL 복사"]);
                }
                if (this.groupInfo.writable) {
                    useMenuList.push(menus.수정);
                }
                if (this.groupInfo.removable) {
                    useMenuList.push(menus.삭제);
                }
                return useMenuList;
            },

            contactModify: function (e) {
                var url = [
                    'contact'
                ];

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

                $.merge(url, ['modify', this.contactId]);
                App.router.navigate(url.join('/'), {trigger: true, pushState: true});
            },

            contactDelete: function (e) {
                var ids = [];
                ids.push(this.contactId);
                if (confirm(contactLang["주소록을 삭제하시겠습니까"])) {
                    this.model = new DeleteContactModel();
                    this.model.set({
                        "ids": ids,
                    }, {silent: true});
                    this.model.save({}, {
                        type: 'DELETE',
                        success: function (model, response) {
                            if (response.code == '200') {
                                // TODO : redirect after delete item
                                window.history.back();
                            }
                        },
                        error: function (model, response) {

                        }
                    });
                }
            },

            telMobile: function (e) {
                //e.preventDefault();
                e.stopPropagation();
                window.location.href = "tel:" + $(e.currentTarget).attr('data-mobile');
                return false;
            },


            smsMobile: function (e) {
                //e.preventDefault();
                e.stopPropagation();
                window.location.href = "smsto:" + $(e.currentTarget).attr('data-mobile');
                return false;
            },

            sendMail: function (e) {
                //e.preventDefault();
                e.stopPropagation();
                if (confirm(contactLang["메일을 보내시겠습니까?"])) {
                    console.log(sessionStorage.getItem("GO-Agent-mail"));
                    if (_.isNull(sessionStorage.getItem("GO-Agent-mail"))) {
                        sessionStorage.setItem("GO-Agent-mail", this._getGoAgentMail());
                    }
                    window.location.href = GO.contextRoot + "app/mail?work=write&toAddr=" + encodeURIComponent($(e.currentTarget).attr('data-email'));
                }
                return false;
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
            },

            parseData: function (contactData) {
                _.map(contactData, function (val, key) {
                    if (typeof val === 'string' && !val) {
                        contactData[key] = null;
                    }

                    if (typeof val === 'object') {
                        _.map(val, function (val2, key2) {
                            if (typeof val2 === 'string' && !val2) {
                                contactData[key][key2] = null;
                            }
                        });
                    }

                    if (key == 'birthday' || key == 'anniversary') {
                        contactData[key] = moment(val, 'YYYY-MM-DD').format('YYYY-MM-DD');
                    }

                    if (key == 'description') {
                        if (typeof val === 'string' && !val) {
                            contactData[key] = null;
                        } else {
                            val = val.replace(/(\n)/gi, "<br>");
                            val = val.replace(/ /gi, "&nbsp;");
                            contactData[key] = val;
                        }
                    }
                });
                return contactData;
            }
        });

        return {
            render: function (options) {
                instance = new Contacts(options);
                return instance.render();

            }
        }
    });

}).call(this);