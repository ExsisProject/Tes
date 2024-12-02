define('works/views/app/data_copy', function (require) {

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');
    var lang = {
        '등록': commonLang['등록'],
        '취소': commonLang['취소'],
        '다른 앱으로 데이터 복사': worksLang['다른 앱으로 데이터 복사'],
        '데이터 복사 설명': worksLang['데이터 복사 설명'],
        '매핑 저장': worksLang['매핑 저장'],
        '매핑 설정': worksLang['매핑 설정'],
        '함께 복사': worksLang['활동기록 및 댓글 함께 복사']
    };

    var when = require("when");
    var VALUE_TYPE = require("works/constants/value_type");

    var AppletForm = require('works/models/applet_form');
    var AppletDoc = require('works/models/applet_doc');
    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var AppletFieldMapping = require('works/models/applet_field_mapping');
    var Masking = require('works/components/masking_manager/models/masking');
    var Integration = require('works/models/integration');

    var Fields = require('works/collections/fields');

    var BackdropView = require('components/backdrop/backdrop');
    var WorksSettingsLayoutView = require('works/views/app/settings_layout');
    var DocContentView = require('works/views/app/doc_content');
    var DocEditView = require('works/views/app/doc_content_edit');
    var MappingItemView = require('works/views/app/mapping/mapping_item');

    var FormBuilder = require('works/components/formbuilder/formbuilder');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var Template = require('hgn!works/templates/app/data_copy');
    var COMPONENT_TYPE = require('works/constants/component_type');

    return Backbone.View.extend({

        className: 'go_content go_renew go_works_home app_temp',

        events: {
            'click #saveMapping': '_onClickSaveMapping',
            'click #saveDoc': '_onClickSaveDoc',
            'click #cancel': '_onClickCancel',
            'click #changeLayout': '_onClickChangeLayout',
            'click #close': '_onClickClose'
        },

        initialize: function (options) {
            var self = this;
            this.initLayout();

            this.sourceFieldsOfIntegrationApplet = {};
            this.targetFieldsOfIntegrationApplet = {};

            this.sourceConfigModel = new AppletBaseConfigModel({id: options.sourceAppletId});
            this.targetConfigModel = new AppletBaseConfigModel({id: options.targetAppletId});

            this.sourceAppletId = options.sourceAppletId;
            this.targetAppletId = options.targetAppletId;
            this.sourceDocId = options.sourceDocId;

            this.sourceAppletForm = new AppletForm({appletId: options.sourceAppletId});
            this.sourceAppletDoc = new AppletDoc({
                appletId: this.sourceAppletId,
                id: this.sourceDocId
            });
            this.sourceMasking = new Masking({appletId: this.sourceAppletId});
            this.sourceMasking.fetch();

            this.targetAppletForm = new AppletForm({appletId: options.targetAppletId});
            this.targetAppletDoc = new AppletDoc({appletId: this.targetAppletId});
            this.targetMasking = new Masking({appletId: this.targetAppletId});
            this.targetMasking.fetch();

            this.sourceFields = new Fields([], {appletId: this.sourceAppletId, includeProperty: true});
            this.targetFields = new Fields([], {appletId: this.targetAppletId, includeProperty: true});

            this.appletFieldMapping = new AppletFieldMapping({
                sourceAppletId: this.sourceAppletId,
                targetAppletId: this.targetAppletId
            });

            GO.util.preloader($.when(
                self.sourceConfigModel.fetch(),
                self.targetConfigModel.fetch(),
                self.sourceAppletForm.fetch(),
                self.targetAppletForm.fetch(),
                self.sourceAppletDoc.fetch(),
                self.sourceFields.fetch(),
                self.targetFields.fetch(),
                self.sourceMasking.deferred,
                self.targetMasking.deferred
                ).then($.proxy(function () {
                    var deferred = $.Deferred();
                    when.all([
                        self.sourceFields.getFieldsOfIntegrationApplet(), self.targetFields.getFieldsOfIntegrationApplet()
                    ]).then(_.bind(function(fields) {
                        self.sourceFieldsOfIntegrationApplet = fields[0];
                        self.targetFieldsOfIntegrationApplet = fields[1];
                        deferred.resolve();
                    }, self));
                    return deferred;
                }, self)).then($.proxy(function () {
                    return $.when(
                        self.render(),
                        self.appletFieldMapping.fetch()
                    );
                }, self)).then($.proxy(function () {
                    self._renderMapping();
                }, self))
            );

            this.$el.on('changeMapping', $.proxy(this._onChangeMapping, this));
            this.$el.on('clickMappingItem', $.proxy(this._onClickMappingItem, this));
        },

        render: function () {
            this.$el.html(Template({
                lang: lang,
                sourceConfig: this.sourceConfigModel.toJSON(),
                targetConfig: this.targetConfigModel.toJSON()
            }));

            if (!this.sourceAppletDoc.isCreator(GO.session('id'))) {
                this.sourceAppletForm.mergeMaskingValue(this.sourceMasking.get('fieldCids'));
            }
            var docContentView = new DocContentView({
                model: this.sourceAppletDoc,
                baseConfigModel: this.sourceConfigModel,
                appletFormModel: this.sourceAppletForm,
                integrationModel: new Integration(_.extend(this.sourceFieldsOfIntegrationApplet, {fields: this.sourceFields.toJSON()}))
            });
            this.$('[data-detail-area]').html(docContentView.render().el);
            this.sourceComponentManager = ComponentManager.getInstance('detail');

            //this.targetAppletForm.mergeMaskingValue(this.targetMasking.get('fieldCids'));
            var docEditView = new DocEditView({
                baseConfigModel: this.targetConfigModel,
                appletFormModel: this.targetAppletForm,
                appletDocModel: this.targetAppletDoc,
                isMultiForm: true,
                integrationModel: new Integration(_.extend(this.targetFieldsOfIntegrationApplet, {fields: this.targetFields.toJSON()}))
            });
            this.$('[data-edit-area]').html(docEditView.render().el);
            this.targetComponentManager = ComponentManager.getInstance('form');

            return ($.Deferred()).resolve();
        },

        _renderMapping: function () {
            var sourceFields = this.sourceFields.rejectFields(this.sourceMasking.get('fieldCids'));
            var targetFields = this.targetFields.getMappingFields();
            targetFields = targetFields.rejectFields(this.targetMasking.get('fieldCids'));
            targetFields.each(function (field) {
                var mapping = this.appletFieldMapping.get('mapping');
                var itemView = new MappingItemView({
                    sourceAppletId: this.sourceAppletId,
                    targetAppletId: this.targetAppletId,
                    model: field,
                    sourceFields: sourceFields,
                    mappingData: mapping[field.get('cid')]
                });
                this.$('[data-mapping-list]').append(itemView.el); // render 와 동시에 trigger 가 가능 하도록 el 을 먼저 붙이자
                itemView.render();
            }, this);

            if (this.appletFieldMapping.get('copyActivity')) {
                this.$("#withCopy").attr("checked", true);
            }
            this._bindBackdrop();
            this._setHeight();
            $(window).resize($.proxy(function () {
                this._setHeight();
            }, this));
        },

        _setHeight: function () {
            this.$('[el-scroll-area]').css('height', $(window).height() - 250);
        },

        _bindBackdrop: function () {
            var backdropView = new BackdropView({el: this.$('.layer_tail')});
            backdropView.bindBackdrop();
            backdropView.linkBackdrop(this.$('.ic_info'));
        },

        _onClickSaveMapping: function () {
            var data = {};
            var isWithChecked = this.$('input:checkbox[id="withCopy"]').is(":checked");
            _.each(this.$('[data-mapping-list]').find('li'), function (li) {
                var $li = $(li);
                data[$li.find('[data-target-cid]').attr('data-target-cid')] = $li.find('select').val();
            });
            this.appletFieldMapping.save({mapping: data, copyActivity: isWithChecked}, {
                success: function () {
                    $.goMessage(commonLang['저장되었습니다.']);
                }
            });
        },

        _onClickSaveDoc: function () {
            var isWithChecked = this.$('input:checkbox[id="withCopy"]').is(":checked");
            this.targetAppletDoc.setParam({fromDocId: this.sourceDocId, copyActivity: isWithChecked});
            var formData = FormBuilder.getFormData('form');
            if (!formData) {
                var invalidForm = FormBuilder.getInvalidForm();
                this._animate(invalidForm);
                return;
            }
            this.targetAppletDoc.setValue(formData);
            this.targetAppletDoc.save({}, {
                success: $.proxy(function (resp) {
                    $.goMessage(commonLang['저장되었습니다.']);
                    GO.router.navigate('works/applet/' + this.targetAppletId + '/doc/' + resp.id, true);
                }, this)
            });
        },

        _onClickCancel: function () {
            GO.router.navigate('works/applet/' + this.sourceAppletId + '/doc/' + this.sourceDocId, true);
        },

        _onClickMappingItem: function (e, data) {
            var sourceCid = $(e.target).find('select').val();
            var sourceComponent = this.sourceComponentManager.getComponent(data.sourceCid);
            var detailView = sourceCid !== '0' && sourceComponent ? this.sourceComponentManager.getComponent(sourceCid).getDetailView() : null;
            var formView = this.targetComponentManager.getComponent(data.targetCid).getFormView();
            this._highlightFormView(formView);
            this._highlightDetailView(detailView);
            this._animate(formView, detailView);
        },

        _onChangeMapping: function (e, data) {
            var value;
            var sourceComponent = this.sourceComponentManager.getComponent(data.sourceCid);
            var targetComponent = this.targetComponentManager.getComponent(data.targetCid);
            var userDoc = targetComponent.getAppletDocModel(); // getAppletDocModel 인데 왜 user_doc 모델을 반환하지?? user_doc 은 뭐지?? 이름부터 이상하다.
            var isUnMapped = data.sourceCid === '0';
            if (isUnMapped) {
                setAndRender.call(this, this._getDefaultValue(targetComponent));
                return;
            }
            value = this.sourceAppletDoc.get('values')[data.sourceCid];
            value = sourceComponent && sourceComponent.isMultiple()
                ? this._convertValueOfMultiple(data.sourceCid, data.targetCid, value, targetComponent)
                : this._convertValue(data.sourceCid, data.targetCid, value);
            value && _.isFunction(value.done) ? value.done($.proxy(function (data) {
                setAndRender.call(this, data);
            }, this)) : setAndRender.call(this);

            function setAndRender(val) {
                value = _.isUndefined(val) ? value : val;
                userDoc.set(data.targetCid, value);
                this.targetAppletDoc.setValue(data.targetCid, value);
                var formView = targetComponent.getFormView();
                if (formView.isMultiple()) {
                    var parentComponent = formView.getParentComponent();
                    userDoc.set(this.targetAppletDoc.get('values'));
                    parentComponent.getFormView().renderNode();
                } else {
                    formView.renderNode();
                }

                // formBuilder 를 개선하는게 이상적이겠지만 시간이 없으므로 코드를 덕지 덕지 붙이자.
                if (_.isArray(value) && value.length && formView.type === COMPONENT_TYPE.AppletDocs) {
                    formView.fetchAppletDocModel({
                        id: value[0].id,
                        appletId: formView.model.get('integrationAppletId')
                    });
                }

                if (!data.isLabelMapping && !isUnMapped && sourceComponent) {
                    var detailView = sourceComponent.getDetailView();
                    this._animate(formView, detailView);
                    this._highlightFormView(formView);
                    this._highlightDetailView(detailView);
                }
            }
        },

        // sourceComponent가 multiple 경우 value는 arrary 이므로
        _convertValueOfMultiple: function(sourceCid, targetCid, value, targetComponent) {
            value = _.map(value, _.bind(function(val) {
                return this._convertValue(sourceCid, targetCid, val);
            }, this));

            /* GO-32978 데이터 복사시 [] 가 씌여져서 텍스트가 노출되는 이슈
            * targetComponet가 multiple일 경우 이슈가 발생되지 않지만,
            * targetComponet가 STEXT or TEXT이고 multiple이 아닐 경우
            * sourceComponent value가 [null], [""], ["",""], ["가","나","다"] 등 대괄호 까지 텍스트로 인식는 이슈*/
            return (this._isTextValueType(targetComponent.getValueType()) && !targetComponent.isMultiple())
                ? value.join(",") : value;
        },

        _isTextValueType: function(type) {
            return _.contains([VALUE_TYPE.STEXT, VALUE_TYPE.TEXT], type);
        },

        _highlightFormView: function (formView) {
            if (this.beforeFormView) this.beforeFormView.removeClass('choice');
            formView.addClass('choice');
            this.beforeFormView = formView;
        },

        _highlightDetailView: function (detailView) {
            if (this.beforeDetailView) this.beforeDetailView.removeClass('choice');
            if (detailView) {
                detailView.addClass('choice');
                this.beforeDetailView = detailView;
            } else {
                this.beforeDetailView = null;
            }
        },

        _onClickChangeLayout: function () {
            this.$('#layoutArea').toggleClass('mode_full');
        },

        _onClickClose: function () {
            this.$('#layoutArea').removeClass('mode_full');
        },

        /**
         * 최소 30가지 케이스. 일단 코드를 반정도 줄이긴 했는데,, 더 어떻게 정리 하면 좋을까?
         */
        _convertValue: function (sourceCid, targetCid, value) {
            var targetComponent = this.targetComponentManager.getComponent(targetCid);
            var targetValueType = targetComponent.getValueType();

            if (_.isUndefined(value)) {
                // source 에 선택 값이 없을 경우 처리
                if (targetValueType === VALUE_TYPE.SELECTS && targetComponent.isShow()) {
                    return this._getDefaultValue(targetComponent);
                }
                return;
            }

            var sourceComponent = this.sourceComponentManager.getComponent(sourceCid);

            // 화면에 없을수 있는 정보 (ex: 수정일/수정자 등 시스템에서 사용하는 값)
            if (_.isUndefined(sourceComponent)) {
                return value;
            }

            var sourceValueType = sourceComponent.getValueType();

            var sourceField, targetField, valueLabels;

            /**
             * SELECT, SELECTS 를 제외하고 타입이 같은 경우 그대로 전달
             */
            if ((sourceValueType !== VALUE_TYPE.SELECT && sourceValueType !== VALUE_TYPE.SELECTS)
                && sourceValueType === targetValueType) return value;

            if (sourceValueType === VALUE_TYPE.APPLETDOCS) {
                return value[0] ? value[0].text : '';
            } // APPLETDOCS to (STEXT or TEXT)

            if (sourceValueType === VALUE_TYPE.DATETIME) {
                if (!value) return;
                if (targetValueType === VALUE_TYPE.DATE) return moment(value).format('YYYY-MM-DD'); // DATETIME to DATE
                if (targetValueType === VALUE_TYPE.TIME) return moment(value).format('HH:mm'); // DATETIME to TIME
            }

            if (sourceValueType === VALUE_TYPE.DEPTS) {
                return _.map(value, function (dept) { // DEPTS to (STEXT to TEXT)
                    return dept.displayName;
                }).join(', ');
            }

            if (sourceValueType === VALUE_TYPE.SELECT) {
                sourceField = this.sourceFields.findByCid(sourceCid);
                var sourceOption = _.findWhere(sourceField.get('options'), {value: value}) || {};
                var sourceLabel = sourceOption.displayText;
                if (_.contains([VALUE_TYPE.STEXT, VALUE_TYPE.TEXT], targetValueType)) { // SELECT to (STEXT or TEXT)
                    return sourceOption.displayText;
                }

                if (_.contains([VALUE_TYPE.SELECT, VALUE_TYPE.SELECTS], targetValueType)) {
                    targetField = this.targetFields.findByCid(targetCid);
                    var targetOption = _.findWhere(targetField.get('options'), {displayText: sourceLabel});
                    value = targetOption ? targetOption.value : null;
                    if (value === null) {
                        return this._getDefaultValue(targetComponent);
                    } //  매칭되는 label 이 없으면 기본값으로 세팅 된다.
                    return VALUE_TYPE.SELECT === targetValueType ? value : [value]; // SELECT to (SELECT or SELECTS)
                }
                if (targetValueType === VALUE_TYPE.APPLETDOCS) { // SELECT to APPLETDOCS
                    return this._toAppletDocs(sourceLabel, targetComponent);
                }
            }

            if (sourceValueType === VALUE_TYPE.SELECTS) {
                // label 매핑 이기 때문에 value 로 label 을 찾아서 label 이 같은 item 을 찾은 다음
                // 해당 item 의 value 를 다시 넘겨줘야함.
                if (targetValueType === VALUE_TYPE.SELECTS) {
                    sourceField = this.sourceFields.findByCid(sourceCid);
                    var sourceOptions = _.compact(_.map(value, function (val) {
                        return _.findWhere(sourceField.get('options'), {value: val});
                    }));
                    valueLabels = _.map(sourceOptions, function (sourceOption) {
                        return sourceOption.displayText;
                    });
                    targetField = this.targetFields.findByCid(targetCid);
                    var items = _.compact(_.map(valueLabels, function (label) {
                        return _.findWhere(targetField.get('options'), {displayText: label});
                    }));
                    var values = _.map(items, function (item) {
                        return item.value;
                    });
                    if (!values.length) values = this._getDefaultValue(targetComponent);
                    return values; // SELECTS to SELECTS
                }

                sourceField = this.sourceFields.findByCid(sourceCid);
                valueLabels = _.map(value, function (val) {
                    var sourceLabel = _.findWhere(sourceField.get('options'), {value: val});
                    return value = sourceLabel.displayText;
                });
                return valueLabels; // SELECTS to (STEXT or TEXT)
            }

            if (sourceValueType === VALUE_TYPE.STEXT) {
                if (targetValueType === VALUE_TYPE.APPLETDOCS) {
                    return this._toAppletDocs(value, targetComponent);
                }
                return value; // STEXT to (STEXT or TEXT)
            }

            if (sourceValueType === VALUE_TYPE.USERS) {
                return _.map(value, function (val) { // USERS to (STEXT or TEXT)
                    return val.displayName || val.name + (val.position ? ' ' + val.position : '');
                }).join(', ');
            }

            if (sourceValueType === VALUE_TYPE.USER) {
                if (targetValueType === VALUE_TYPE.USERS) { // USER to USERS
                    return [value];
                }
                // USER to (STEXT or TEXT)
                return value.displayName || value.name + (value.position ? ' ' + value.position : '');
            }

            if (sourceValueType === VALUE_TYPE.NUMBER) {
                value = GO.util.numberWithCommas(value);
                var properties = sourceComponent.getComponentPropertyModel();
                if (properties.get('fixType') === 'prefix') return properties.get('unitText') + ' ' + value;
                if (properties.get('fixType') === 'postfix') return value + ' ' + properties.get('unitText');
                return value; // NUMBER to (STEXT or TEXT)
            }

            return value;
        },

        _getDefaultValue: function (component) {
            if (!component.properties.items) return component.properties.defaultValue;
            var valueType = component.getValueType();
            var items = _.filter(component.properties.items, function (item) {
                return item.selected;
            });
            var values = _.map(items, function (item) {
                return parseInt(item.value);
            });

            return valueType === VALUE_TYPE.SELECT ? values[0] : values; // SELECT 는 무조건 하나의 값이 있다.
        },

        _toAppletDocs: function (value, targetComponent) {
            var formView = targetComponent.getFormView();
            var deferred = $.Deferred();
            formView.docs.duplicateSearch(value).done(function (docs) {
                var data = [];
                if (docs.length === 1) {
                    var doc = docs.at(0);
                    data.push({
                        id: doc.get('id'),
                        text: doc.get('values')[formView.docs.fieldCid]
                    });
                }
                deferred.resolve(data);
            });
            return deferred;
        },

        _animate: function (formView, detailView) {
            if (detailView) {
                detailView.$el.closest('.card_type5').animate({
                    scrollTop: detailView.$el.offset().top - detailView.$el.closest('[data-detail-area]').offset().top
                });
            }
            formView.$el.closest('.card_type5').animate({
                scrollTop: formView.$el.offset().top - formView.$el.closest('#fb-canvas-edit').offset().top
            });
        },

        initLayout: function () {
            this.layoutView = WorksSettingsLayoutView.create();
            if (GO.session()['theme'] !== 'THEME_ADVANCED') this.layoutView.setUseOrganogram(false);
        },

        renderLayout: function () {
            return when(this.layoutView.render())
                .then($.proxy(function renderMe() {
                    // 디자인팀에서 css 정리가 필요할것으로 보임.
                    this.layoutView.$el.addClass('go_skin_default go_full_screen go_skin_works');
                    this.layoutView.$el.removeClass("full_page");
                    this.layoutView.setContent(this);
                }, this)).otherwise(function printError(err) {
                    console.log(err.stack);
                });
        },

        _setMasking: function(fields, maskingFields) {
            _.each(fields, function (field) {
                var isMasking = _.contains(maskingFields, field.get('cid'));
                field.set('isMasking', isMasking);
            });
            return fields;
        }
    });
});
