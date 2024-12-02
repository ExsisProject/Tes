(function() {
    define(function(require) {

        var $ = require("jquery"),
            Backbone = require("backbone"),
            App = require("app"),
            ContactSearchCollection = require("contact/collections/search_contact"),
            TplContactResult = require("text!contact/templates/mobile/m_search_result.html"),
            TplContactResultItem = require("text!contact/templates/mobile/m_search_result_item.html"),
            CommonResult = require("views/mobile/m_search_common_result"),
            commonLang = require("i18n!nls/commons"),
            contactLang = require("i18n!contact/nls/contact");
        require("GO.util");

        var instance = null;
        var lang = {
            '검색결과없음' : commonLang['검색결과없음'],
            '검색결과' : commonLang['검색결과']
        };
        var Contacts = Backbone.View.extend({
            el : '#searchResultWrap',
            events : {
                'vclick a[data-id]': '_getContact',
                'vclick .telMobile': '_telMobile',
                'vclick .smsMobile': '_smsMobile',
                'vclick .sendMail': '_sendMail'
            },
            initialize: function(options) {
                var _this = this;
                this.options = options;
                this.$el.off();
                this.collection = new ContactSearchCollection();
                this.lastPage = false;
                this.listenTo(this.collection, 'reset', this._renderContacts);
                CommonResult.set({
                    collection : this.collection,
                    searchOptions : this.options,
                    renderListFunc : function(collection) {
                        _this._renderContacts(collection);
                    },
                    renderListMoreFunc : function(collection) {
                        _this._moreList(collection);
                    }
                });
            },
            render: function() {
                CommonResult.fetch({
                    renderListFunc : this._renderContacts,
                    renderMoreListFunc : this._moreList,
                });
                return this.el;
            },
            _renderContacts : function(collection) {
                var searchData = collection.toJSON();
                this.$el.html(Hogan.compile(TplContactResult).render({
                    lang : lang,
                    data : searchData,
                    resultCount : collection.page.total,
                    isAvailableMail : function() {
                        if(App.isAvailableApp('mail')) return true;
                        else return false;
                    }
                },{
                    partial : TplContactResultItem
                }));
                $('#detailSearchToggle').removeClass('on');
                this._showResultWrap();
            },
            _moreList : function(collection) {
                var searchData = collection.toJSON();
                this.$el.find('ul:first').append(Hogan.compile(TplContactResultItem).render({
                    lang : lang,
                    data : searchData,
                    isAvailableMail : function() {
                        if(App.isAvailableApp('mail')) return true;
                        else return false;
                    }
                }))
            },
            _showResultWrap : function() {
                $('#simpleSearchWrap').hide();
                $('#detailSearchWrap').hide();
                $('#searchResultWrap').show();
            },
            _getContact : function(e) {
                e.preventDefault();
                var $currentTarget = $(e.currentTarget),
                    dataId = $currentTarget.data("id"),
                    model = this.collection.findById(dataId),
                    urls = {
                        "COMPANY" : makeCompanyUrl,
                        "USER" : makeUserUrl,
                        "DEPARTMENT" : makeDeptUrl
                    };

                var url = urls[model.getOwnerType()](model);
                GO.router.navigate(url, {trigger: true, pushState: true});
                function makeCompanyUrl(model){
                    var url = ['contact'];
                    url.push("company");
                    url.push(model.getCompanyGroupId());
                    url.push("view");
                    url.push(model.getId());
                    return url.join("/");
                }
                function makeDeptUrl(model){
                    var url = ['contact'];
                    url.push("dept");
                    url.push(model.getDeptId());
                    url.push("view");
                    url.push(model.getId());
                    return url.join("/");
                }
                function makeUserUrl(model){
                    var url = ['contact'];
                    url.push("view");
                    url.push(model.getId());
                    return url.join("/");
                }
            },
            _telMobile: function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = "tel:" + $(e.currentTarget).attr('data-mobile');
                return;
            },
            _smsMobile: function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (GO.config('isMobileApp')) {
                    window.location.href = "smsto:" + $(e.currentTarget).attr('data-mobile');
                } else {
                    window.location.href = "sms://" + $(e.currentTarget).attr('data-mobile');
                }
                return;
            },
            _sendMail: function (e) {
                e.preventDefault();
                if (!App.isAvailableApp('mail')) return;
                var self = this;
                e.stopPropagation();
                if (confirm(contactLang["메일을 보내시겠습니까?"])) {
                    var data_id = $(e.currentTarget).parent().siblings().attr('data-id');
                    var name = "";
                    var positionName = "";
                    var departmentName = "";
                    var mailformat = "";
                    var sendUrlParam = "";
                    self.collection.toJSON().forEach(function(item){
                        if(item.id == data_id){
                            if(!_.isEmpty(item.name)){
                                name = item.name;
                            }
                            if(!_.isEmpty(item.positionName)){
                                positionName = '/' + item.positionName;
                            }
                            if(!_.isEmpty(item.departmentName)){
                                departmentName = '/' + item.departmentName;
                            }
                            mailformat = name + positionName + departmentName;
                            if(mailformat.length > 0){
                                mailformat = '"' + mailformat + '"';
                            }
                        }
                    });
                    sendUrlParam = encodeURI(mailformat + '<' +$(e.currentTarget).attr('data-email') + '>');
                    window.location.href = "/app/mail?work=write&toAddr=" + sendUrlParam;
                }
                return;
            }
        });
        return {
            render : function(options) {
                instance = new Contacts(options);
                return instance.render();

            }
        };
    });

}).call(this);