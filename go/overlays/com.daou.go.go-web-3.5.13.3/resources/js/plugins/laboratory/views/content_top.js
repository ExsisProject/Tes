define('laboratory/views/content_top', function (require) {

    var ContentTopTmpl = require('hgn!laboratory/templates/content_top');
    var ContentTopView = require('views/content_top');

    var commonLang = require('i18n!nls/commons');

    var lang = {
        'labs': commonLang['실험실']
    };

    return ContentTopView.extend({
        tagName: 'header',
        className: 'content_top',

        events: {},

        initialize: function (options) {
            options = options || {};
            ContentTopView.prototype.initialize.call(this, options);
        },

        render: function () {
            ContentTopView.prototype.render.apply(this, arguments);
            this.$el.html(ContentTopTmpl({lang: lang}));
        },

    });

});
