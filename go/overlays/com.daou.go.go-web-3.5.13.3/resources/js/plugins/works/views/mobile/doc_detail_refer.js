define('works/views/mobile/doc_detail_refer', function (require) {

    var when = require('when');

    var worksLang = require('i18n!works/nls/works');

    // models
    var Fields = require('works/collections/fields');
    var AppletDocReferModel = require('works/models/applet_doc_refer');
    var AppletFormModel = require('works/models/applet_form');
    var AppletBaseConfigModel = require('works/models/applet_baseconfig');

    // views
    var HeaderToolbarView = require("views/mobile/header_toolbar");
    var DocDetailView = require('works/views/mobile/doc_detail');

    // templates
    var renderTemplate = require('hgn!works/templates/mobile/doc_detail_refer');

    return DocDetailView.extend({
        appletId: null,
        baseConfigModel: null,
        canvasView: null,
        el: '#content',

        initialize: function (options) {

            this.appletId = options.referAppletId;
            this.subFormId = options.subFormId;
            this.reqAppletId = options.reqAppletId;
            this.docId = options.referDocId;

            this.fields = new Fields([], {
                appletId: this.appletId,
                subFormId: this.subFormId,
                includeProperty: true
            });

            this.baseConfigModel = new AppletBaseConfigModel({id: this.appletId});
            this.appletFormModel = new AppletFormModel({appletId: this.appletId, subFormId: this.subFormId});
            this.model = new AppletDocReferModel({
                id: this.docId
            }, {
                appletId: this.appletId,
                reqAppletId: this.reqAppletId
            });

            this.Template = renderTemplate;
        },

        render: function () {
            var self = this;
            this._initRender();
            $.when(
                this.baseConfigModel.fetch(),
                this.appletFormModel.fetch({
                    statusCode: {
                        403: function () {
                            GO.util.linkToErrorWithCustomError({
                                code: 403,
                                message: worksLang['폼 접근권한이 없습니다.'] + ' ' + worksLang['폼 접근권한 없음 설명']
                            });
                        }
                    }
                }),
                this.fields.fetch()
            ).then(function () {
                HeaderToolbarView.render({
                    title: self.baseConfigModel.get('name'),
                    isPrev: true
                });
                self._renderContent();
                self.model.fetch();
            });
        }
    });
});
