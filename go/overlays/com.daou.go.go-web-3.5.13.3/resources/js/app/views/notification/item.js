define("views/notification/item", function (require) {

    var _ = require("underscore");
    var Backbone = require("backbone");
    var GO = require("app");
    var ItemTmpl = require("hgn!templates/notification/item");
    var commonLang = require("i18n!nls/commons");

    var NotificationItemView = Backbone.View.extend({
        itemDeleted: true,
        tagName: 'li',
        tmplData: null,
        targetLinkUrl: null,
        events: {
            'click .btn_wrap': 'deleteLink'
        },

        initialize: function () {
            this.tmplData = {
                'profile': this._getProfile(),
                'targetLinkUrl': this._goTargetLinkUrl(),
                'companyName': this._getCompanyName(),
                'createdAt': GO.util.snsDate(this.model.get('createdAt')),
                'label': {
                    'more': commonLang["자세히 보기"],
                    'delete': commonLang["삭제"]
                }
            };
        },

        render: function () {
            var tmpl = ItemTmpl(_.extend({}, this.model.toJSON(), this.tmplData));
            this.$el.empty().html(tmpl);
            this._setAsRead();
            return this.$el;
        },

        goToShowUrl: function () {
            document.location = this._goTargetLinkUrl();
        },

        deleteLink: function (e) {
            e.stopPropagation();

            var self = this;
            var $li = this.$el.closest('li');
            var notiId = $li.find('span[id]').attr('id');

            if (self.itemDeleted) {
                self.itemDeleted = false;
                $.ajax({
                    "url": GO.config("contextRoot") + 'api/my/noti/' + notiId,
                    "type": "DELETE",
                    "dataType": "json",
                    "success": function () {
                        $li.remove();
                        $.goMessage(commonLang['삭제되었습니다.']);
                        self.itemDeleted = true;
                    },
                    "error": function () {
                        $.goMessage(commonLang["실패했습니다."]);
                    }
                });
            }
        },

        _goTargetLinkUrl: function () {
            var link = this.model.get('linkUrl'),
                targetCompanyId = this.model.get("companyId"),
                companies = GO.session().companies,
                targetUrl = null;

            for (var company in companies) {
                if (targetCompanyId === company.id) {
                    targetUrl = location.protocol + '//' + company.siteUrl;
                    if (location.port) {
                        targetUrl += ':' + location.port;
                    }

                    targetUrl += GO.contextRoot + 'tokenlogin?';
                    targetUrl += $.param({
                        'token': this._getCookie('GOSSOcookie'),
                        'companyId': (parseInt(GO.session('companyId')) == parseInt(targetCompanyId)) ? null : targetCompanyId, // 불필요한 세션 생성 방지
                        'returnUrl': link
                    });
                }
            }

            return targetUrl || link;
        },

        _getCookie: function (name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            return (parts.length == 2) ? parts.pop().split(";").shift() : "";
        },

        _getProfile: function () {
            var defaultProfile = 'resources/images/photo_my.jpg';
            return this.model.get('profile') || defaultProfile;
        },

        _getCompanyName: function () {
            var companyId = this.model.get("companyId"),
                companyName;

            var companies = GO.session().companies;
            var isIntegrated = GO.session().integratedCompanies.length;
            if (isIntegrated > 1) {
                for (var company in companies) {
                    if (companyId === company.id) {
                        companyName = company.companyName + ' > ';
                    }
                }
            } else {
                companyName = '';
            }

            return companyName;
        },

        _setAsRead: function () {
            if (this.model.get('readAt')) this.$el.addClass("read");
        }

    });

    return NotificationItemView;

});
