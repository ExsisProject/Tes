define('timeline/components/views/guide_layer', function (require) {

    var TimelineLang = require('i18n!timeline/nls/timeline');
    var lang = {
        '가이드설명': '가이드설명'
    };

    var Template = require('hgn!timeline/components/templates/guide_layer');
    var TIME_LINE_GUIDE_KEY = "TIMELINE_GUIDE_BADGE_";

    return Backbone.View.extend({

        events: {
            'click #closeBadge': '_onClickBadgeClose',
            'click #goToGuide': '_onClickPopupGuideLayer'
        },

        initialize: function (options) {
            this.viewGuideBanner = $.cookie(TIME_LINE_GUIDE_KEY + GO.session().id) ? true : false;
        },

        render: function () {
            var self = this;
            self.$el.html(Template({
                TimelineLang: TimelineLang,
                viewGuideBanner: self.viewGuideBanner
            }));

            return self;
        },
        _onClickBadgeClose: function() {
            $("#guideBadge").remove();
            $("#guideBanner").show();
            $.cookie(TIME_LINE_GUIDE_KEY + GO.session().id, "done" , {expires: 3650/*10년*/, path: "/"});
        },
        _onClickPopupGuideLayer : function(){
            var url = GO.contextRoot + "resources/guide/timeline/step1.html";
            window.open(url,"popupRead","resizable=no,scrollbars=no,width=1225,height=650");
        }
    });
});