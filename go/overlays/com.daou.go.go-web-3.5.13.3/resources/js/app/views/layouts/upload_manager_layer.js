define('views/layouts/upload_manager_layer', function (require) {

    var adminLang = require("i18n!admin/nls/admin");

    var Template = require('hgn!templates/layouts/upload_manager_layer');
    var UPLOAD_MANAGER_KEY = "UPLOAD_MANAGER_BADGE_";

    var lang = {
        "계정등록을 쉽게": adminLang["계정등록을 쉽게"],
        "한번에 끝내는": adminLang["한번에 끝내는"],
        "계정 업로드 매니저": adminLang["계정 업로드 매니저"],
        "계정업로드매니저": adminLang["계정업로드매니저"]
    };

    return Backbone.View.extend({

        events: {
            'click #closeBadge': '_onClickBadgeClose',
            'click #goToGuide': '_onClickPopupGuideLayer'
        },

        initialize: function () {
            this.viewGuideBanner = $.cookie(UPLOAD_MANAGER_KEY + GO.session().id) ? true : false;
        },

        render: function () {
            var self = this;
            self.$el.html(Template({
                lang: lang,
                viewGuideBanner: self.viewGuideBanner
            }));

            return self;
        },
        _onClickBadgeClose: function () {
            $("#guideBadge").remove();
            $("#guideBanner").show();
            $.cookie(UPLOAD_MANAGER_KEY + GO.session().id, "done", {expires: 3650/*10년*/, path: "/"});
        },
        _onClickPopupGuideLayer: function () {
            var url = window.location.protocol + "//" + window.location.host + GO.contextRoot + "admin/account/manager";
            window.open(url, "popupRead" + GO.session().id, "resizable=yes,scrollbars=yes,width=1225,height=710");
        }
    });

});