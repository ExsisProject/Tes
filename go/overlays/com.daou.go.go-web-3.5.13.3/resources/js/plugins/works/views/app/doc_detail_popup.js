define('works/views/app/doc_detail_popup', function (require) {

    var when = require('when');
    var commonLang = require('i18n!nls/commons');
    var Masking = require('works/components/masking_manager/models/masking');
    var Fields = require('works/collections/fields');

    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var AppletDocReferModel = require('works/models/applet_doc_refer');
    var AppletDocModel = require('works/models/applet_doc');
    var AppletFormModel = require('works/models/applet_form');

    var AppContentTopView = require('works/views/app/layout/app_content_top');

    var DocDetailView = require('works/views/app/doc_detail');
    var PopupTmpl = require('hgn!works/templates/app/doc_detail_popup');
    var Tmpl = require('hgn!works/templates/app/doc_detail');
    var VALUE_TYPE = require('works/constants/value_type');

    var Actions = Backbone.Collection.extend({
        model: Backbone.Model,
        initialize: function (options) {
            this.options = options || {};
            this.appletId = options.appletId;
            this.docId = options.docId;
        },
        url: function () {
            return GO.config('contextRoot') + 'api/works/applets/' + this.appletId + '/docs/' + this.docId + '/actions';
        }
    });

    return DocDetailView.extend({

        className: 'go_wrap build_popup_layer',

        initialize: function (options) {
            this.appletId = options.appletId;
            this.subFormId = options.subFormId;
            this.reqAppletId = options.reqAppletId;
            this.docId = options.docId;

            this.fieldsOfIntegrationApplet = {};
            this.fields = new Fields([], {
                appletId: options.appletId,
                subFormId: options.subFormId,
                includeProperty: true
            });

            this.baseConfigModel = new AppletBaseConfigModel({id: this.appletId});
            this.appletFormModel = new AppletFormModel({
                appletId: this.appletId,
                subFormId: options.subFormId ? options.subFormId : 0
            });
            this.masking = new Masking({appletId: this.appletId});
            this.masking.fetch();

            this.isOrgDocPopup = options.hasOwnProperty('isOrgDocPopup') ? options.isOrgDocPopup : false;
            if (this.isOrgDocPopup) {
                this.model = new AppletDocModel({
                    id: this.docId,
                    appletId: this.appletId,
                    subFormId: this.subFormId
                });
                this.actions = new Actions({appletId: this.appletId, docId: this.docId});
            } else {
                this.model = new AppletDocReferModel({
                    id: this.docId
                }, {
                    appletId: this.appletId,
                    reqAppletId: this.reqAppletId
                });
            }

            this.$el.on('doAction', $.proxy(function () {
                $.when(this.model.fetch(), this.actions.fetch()).done($.proxy(function () {
                    this._removeNeedToSetProcess();
                    this._renderAction();
                    this._renderDocLog();
                    $.goMessage(commonLang['변경되었습니다.']);
                }, this));
            }, this));
        },

        // 연동문서 팝업보기
        render: function () {
            this.$el.html(PopupTmpl);
            this.$('div.content_page').html(Tmpl({isRefDocPopup: true}));
            this.$('#actionArea').remove();
            this.$('#logSection').remove();

            when.all([
                this.baseConfigModel.fetch(),
                this.appletFormModel.fetch({
                    statusCode: {
                        403: function () {
                            GO.util.error("403", {"msgCode": "403-works-accessibleform"});
                        }
                    }
                }),
                this.model.fetch({
                    statusCode: {
                        403: function () {
                            GO.util.error('403', {'msgCode': '400-works'});
                        },
                        404: function () {
                            GO.util.error('404', {'msgCode': '400-works'});
                        },
                        500: function () {
                            GO.util.error('500');
                        }
                    }
                }),
                this.fields.fetch(),
                this.masking.deferred
            ]).then($.proxy(function () {
                var deferred = $.Deferred();
                this.fields.getFieldsOfIntegrationApplet().done(_.bind(function (fields) {
                    this.fieldsOfIntegrationApplet = fields;
                    deferred.resolve();
                }, this));
                return deferred;
            }, this)).then($.proxy(function () {
                if (!this.model.isCreator(GO.session('id'))) {
                    this.appletFormModel.mergeMaskingValue(this.masking.get('fieldCids'));
                }
                this._renderContent();
            }, this)).otherwise(function printError(err) {
                console.log(err.stack);
            });

            $('body').html(this.el);

            return this;
        },

        // 오리지널 문서 팝업으로 보기
        renderOrgDoc: function () {
            this.$el.html(PopupTmpl);
            this.$('div.content_page').html(Tmpl());

            when.all([
                this.baseConfigModel.fetch(),
                this.appletFormModel.fetch({
                    statusCode: {
                        403: function () {
                            GO.util.error("403", {"msgCode": "403-works-accessibleform"});
                        }
                    }
                }),
                this.actions.fetch(),
                this.model.fetch(),
                this.fields.fetch(),
                this.masking.deferred
            ]).then($.proxy(function () {
                var deferred = $.Deferred();
                this.fields.getFieldsOfIntegrationApplet().done(_.bind(function (fields) {
                    this.fieldsOfIntegrationApplet = fields;
                    deferred.resolve();
                }, this));
                return deferred;
            }, this)).then($.proxy(function () {
                if (!this.model.isCreator(GO.session('id'))) {
                    this.appletFormModel.mergeMaskingValue(this.masking.get('fieldCids'));
                }
                var contentTopView = new AppContentTopView({
                    baseConfigModel: this.baseConfigModel,
                    pageName: this.pageName,
                    useSearch: this.useSearch,
                    isOrgDocPopup: this.isOrgDocPopup
                });
                this.$('div.go_popup_content_top').html(contentTopView.el);
                contentTopView.render();
                this._renderContent();
                this._renderActivity();
                this._renderAction();
                if (_.contains(this.masking.get('fieldCids'), this.model.get('titleCid'))) {
                    this._renderMaskedTitle();
                }
            }, this)).otherwise(function printError(err) {
                console.log(err.stack);
            });

            this._renderConsumer();
            this._renderDocLog();

            $('body').html(this.el);

            return this;
        }
    });
});
