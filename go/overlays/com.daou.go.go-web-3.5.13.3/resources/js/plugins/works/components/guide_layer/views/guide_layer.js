define('works/components/guide_layer/views/guide_layer', function (require) {

    var worksLang = require('i18n!works/nls/works');
    var lang = {
        '가이드설명': worksLang['가이드설명']
    };
    var WorksGuide = require('works/components/guide_layer/views/works_guide');
    var Template = require('hgn!works/components/guide_layer/templates/guide_layer');
    var CONSTANTS = require('works/constants/works');

    return Backbone.View.extend({

        events: {
            'click #goToGuide': '_onClickPopupGuideLayer'
        },

        initialize: function (options) {
            if (options.isSetting) {
                this.isSetting = true;
                this.type = CONSTANTS.WORKS_GUIDE.WORKS_SETTING_BADGE;
            } else {
                this.isSetting = false;
                this.type = CONSTANTS.WORKS_GUIDE.WORKS_APP_BADGE;
            }
            this.worksGuide = new WorksGuide();
        },

        render: function () {
            var self = this;
            self.$el.html(Template({
                lang: lang,
                isSetting: self.isSetting
            }));

            return self;
        },
        displayNewAppGuide: function (createAt) {
            var isListView = GO.util.store.get('applet-viewtype') == 'list';
            var isHome = GO.router.getUrl().indexOf('home') > 0;
            var isNewApp = createAt ? GO.util.isCurrentDate(createAt, 1) : false;
            var isDisplayGuide = isHome && isListView && isNewApp && this.worksGuide.isFirstGuide();
            if (isDisplayGuide) {
                this._onClickPopupGuideLayer({
                    isFirst: true
                });
            }
        },
        _onClickPopupGuideLayer: function (options) {
            this.worksGuide.init(options);
            this.worksGuide.render();
            this.render();
        },
    });
});
