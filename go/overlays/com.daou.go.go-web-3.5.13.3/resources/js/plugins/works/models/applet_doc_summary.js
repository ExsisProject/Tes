define('works/models/applet_doc_summary', function(require) {

    var AppletDocModel = require('works/models/applet_doc');

    var worksLang = require("i18n!works/nls/works");

    return AppletDocModel.extend({
        initialize: function(attributes, options) {
            AppletDocModel.prototype.initialize.apply(this, arguments);
            this.appletId = options.appletId;
            this.producerAppletId = options.producerAppletId;
            this.producerDocId = options.producerDocId;
        },

        url: function() {
            return GO.config('contextRoot') + 'api/works/applets/' + this.appletId + '/producer/'
                + this.producerAppletId + '/doc/' + this.producerDocId + '/summary';
        },

        fetch: function(options) {
            options = options || {};
            options = _.extend({
                error: function (data, error) {
                    if (error && error.responseJSON && error.responseJSON.name == 'not.found') {
                        $.goMessage(worksLang['데이터 복사시 연동데이터 삭제 경고']);
                    }
                }
            }, options);
            return AppletDocModel.prototype.fetch.call(this, options);
        }
    });
});
