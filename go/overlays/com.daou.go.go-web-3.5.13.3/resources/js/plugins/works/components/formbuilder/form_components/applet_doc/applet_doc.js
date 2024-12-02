define('works/components/formbuilder/form_components/applet_doc/applet_doc', function (require) {

    require("jquery.go-validation");

    var _ = require('underscore');
    //var Backbone = require('backbone');
    var GO = require('app');
    var when = require('when');
    var NameTagView = require("go-nametags");
    var DNDTagMobileView = require('works/components/formbuilder/form_components/applet_doc/dndtags_mobile');

    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/applet_doc/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/applet_doc/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/applet_doc/option');

    var WorksUtil = require('works/libs/util');

    var AppletDocSearchView = require('works/components/applet_doc_search/views/applet_doc_search');
    var AppListView = require('works/components/app_list/views/app_list');

    var AppletDocModel = require('works/models/applet_doc_summary');
    var ReferDocs = require('works/collections/docs');
    var Fields = require('works/collections/fields');
    var Field = require('works/models/field');
    var Integration = require('works/components/integration_manager/models/integration');
    var Applet = require('works/models/applet_baseconfig');
    var SearchReferApps = require('works/views/mobile/search_refer_apps');
    var Masking = require('works/components/masking_manager/models/masking');

    var VALUE_TYPE = require("works/constants/value_type");

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');
    var lang = {
        "이름": commonLang["이름"],
        "설명": worksLang["설명"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        "툴팁으로 표현": worksLang["툴팁으로 표현"],
        "필수 입력 컴포넌트": worksLang["필수 입력 컴포넌트"],
        "이름숨기기": worksLang["이름숨기기"],
        '검색': commonLang['검색'],
        '설정': commonLang['설정'],
        '추가': commonLang['추가'],
        '연동앱': worksLang['연동앱'],
        '연동 컴포넌트': worksLang['연동 컴포넌트'],
        '데이터 연동': worksLang['데이터 연동'],
        '선택 최대 개수': worksLang['선택 최대 개수'],
        '앱을 먼저 선택하세요.': worksLang['앱을 먼저 선택하세요.'],
        '데이터 연결 시, 검색 노출 항목': worksLang['데이터 연결 시, 검색 노출 항목'],
        '앱 검색 설명': worksLang['앱 검색 설명'],
        '연동 권한 설명': worksLang['연동 권한 설명'],
        '연동할 수 있는 항목이 없습니다.': worksLang['연동할 수 있는 항목이 없습니다.'],
        '앱 검색': worksLang['앱 검색'],
        '데이터 검색': worksLang['데이터 검색'],
        '최대 선택 개수를 초과하였습니다.': worksLang['최대 선택 개수를 초과하였습니다.'],
        "삭제된 연동 설명": worksLang["삭제된 연동 설명"],
        "검색 노출 항목 없음 설명": worksLang["검색 노출 항목 없음 설명"],
        "연동 앱 없음 설명": worksLang["연동 앱 없음 설명"],
        '관리자에 의해 마스킹 처리 된 항목입니다': worksLang['관리자에 의해 마스킹 처리 된 항목입니다']
    };

    var defaultValues = {
        maxCount: 10
    };

    var OptionView = BaseOptionView.extend({

        popupView: null,
        appListView: null,
        appNameTagView: null,
        fieldNameTagView: null,
        fields: null,
        optionListSettingView: null,
        applet: null,

        customEvents: {
            "blur input[name=maxCount]": "_checkOptionValidate",
            "keypress input[name=maxCount]": "onlyNumber",
            "keyup input[name=maxCount]": "replaceNumber",
            'click [el-select-app]': '_onClickSelectApp',
            'click [el-add-field]': '_onClickAddField',
            'change #fields': '_onChangeFields'
        },

        initialize: function (options) {
            BaseOptionView.prototype.initialize.call(this, options);

            this.fields = new Fields([], {
                appletId: this.model.get('integrationAppletId'),
                type: 'consumers'
            });

            this.fields.on('sync', this._onSyncFields, this);
            if (this.model.get('integrationAppletId')) {
                this.fields.fetch();
                this.applet = new Applet({id: this.model.get('integrationAppletId')});
                this.applet.fetch({
                    success: $.proxy(function () {
                        this._syncApplet();
                    }, this),
                    error: $.proxy(function (model, resp) {
                        if (resp.responseJSON.name === 'not.found') {
                            this.model.set('isDeletedApplet', true);
                            this._renderAppItem();
                        }
                    }, this),
                    statusCode: {}
                });
            }
        },

        renderBody: function () {
            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON()
            }));

            this._initAppNameTagView();
            this._initFieldNameTagView();

            this._renderAppItem();
            this._renderFieldOptions();
            this._renderDisplayOptions();
            this._renderSelectedDisplayItems();
        },

        _syncApplet: function () {
            var appName = this.applet.get('name');
            this.model.set('appletName', appName);
            this.$('#appArea').find('li[data-id="' + this.applet.id + '"]').find('span.name').text(appName);
        },

        _appletChangeable: function () {
            var component = ComponentManager.getComponent(this.clientId);
            if (!component) return;
            return ComponentManager.isNew(this.clientId) ? true :
                !!(!this.model.get('integrationAppletId') ||
                    (this.model.get('integrationAppletId') != component.properties.integrationAppletId));
        },

        _integrationFieldChangeable: function () {
            var component = ComponentManager.getComponent(this.clientId);
            if (!component) return;
            return ComponentManager.isNew(this.clientId) ? true :
                !!(!this.model.get('integrationFieldCid') ||
                    (this.model.get('integrationFieldCid') != component.properties.integrationFieldCid));
        },

        _initAppNameTagView: function () {
            this.appNameTagView = NameTagView.create([], {useAddButton: false});
            this.appNameTagView.$el.on('nametag:removed', $.proxy(function () {
                this.model.unset('integrationAppletId');
                this.model.unset('integrationFieldCid');
                this.model.unset('appletName');
                this.model.unset('fields');
                this.model.unset('displayFields');
                this.model.unset('selectedDisplayFields');
                this.renderBody();
            }, this));
            this.$('#appArea').append(this.appNameTagView.el);
        },

        _initFieldNameTagView: function () {
            this.fieldNameTagView = NameTagView.create({useAddButton: false});
            this.fieldNameTagView.$el.on('nametag:removed', $.proxy(function (e, cid) {
                var fields = new Fields(this.model.get('selectedDisplayFields'));
                var field = fields.findWhere({cid: cid});
                fields.remove(field);
                this.model.set('selectedDisplayFields', fields.toJSON());
            }, this));
            this.$('#fieldArea').append(this.fieldNameTagView.el);
            this.fieldNameTagView.$el.sortable({
                stop: $.proxy(function () {
                    var fields = _.map(this.fieldNameTagView.$('li'), function (fieldEl) {
                        var cid = $(fieldEl).attr('data-id');
                        var field = this.fields.findWhere({cid: cid});
                        return field.pick(['cid', 'label', 'valueType']);
                    }, this);
                    this.model.set('selectedDisplayFields', fields);
                }, this)
            });
        },

        _onClickSelectApp: function () {
            this.popupView = $.goPopup({
                pclass: 'layer_normal layer_app_search',
                header: lang['앱 검색'],
                contents: '<p class="desc">' + lang['앱 검색 설명'] + '</p><hr>',
                buttons: [{
                    btext: commonLang["확인"],
                    btype: "confirm",
                    callback: $.proxy(function () {
                        var applet = this.appListView.getCheckedData();
                        if (!applet) return;
                        this.model.set({
                            integrationAppletId: applet.get('id'),
                            appletName: applet.get('name')
                        });
                        this._addApplet();
                    }, this)
                }, {
                    btext: commonLang["취소"],
                    btype: "cancel"
                }]
            });

            this.appListView = new AppListView({
                useBottomButton: false
            });
            this.popupView.find('div.content').append(this.appListView.render().el);
            this.appListView.$el.on('renderingComplete', $.proxy(function () {
                this.appListView.$('div.dataTables_paginate').css({"padding-top": "0px"});
                this.popupView.reoffset();
            }, this));
        },

        _addApplet: function () {
            this._renderAppItem();
            this.model.set('fields', []);
            this.model.set('integrationFieldCid', '');
            this.fields.appletId = this.model.get('integrationAppletId');
            this.fields.fetch();
        },

        _renderAppItem: function () {
            if (!this._appletChangeable()) this.$('span[el-select-app]').hide();
            if (this.model.get('integrationAppletId') && this.appNameTagView) {
                this.appNameTagView.removeAll();
                this.appNameTagView.addTag(this.model.get('integrationAppletId'), this.model.get('appletName'), {
                    removable: this._appletChangeable()
                });
                if (this.model.get('isDeletedApplet')) this.appNameTagView.$('span.name').wrapInner('<strike></stike>');
            }
        },

        _onChangeFields: function () {
            var currentCid = this.$('#fields').val();
            var beforeCid = this.model.get('integrationFieldCid');
            this._removeDisplayField(beforeCid);
            this._removeDisplayField(currentCid);
            this._addDisplayField(currentCid, true);
            this.model.set('integrationFieldCid', currentCid);
        },

        /**
         * model에 저장된 fields 와 서버로 부터 받아온 fields 를 비교하여
         * 삭제된 필드가 있으면 마킹해주고, 추가된 필드가 있으면 model 에도 추가시켜준다.
         */
        _mergedFields: function (currentFields) {
            this.model.set('isDeletedField', false);
            var beforeFields = this.model.get('fields') || [];
            _.each(beforeFields, function (field) {
                var data = currentFields.findWhere({cid: field.cid});
                if (!data) {
                    //field.isDeleted = true;
                    if (field.cid == this.model.get('integrationFieldCid')) {
                        this.model.set('isDeletedField', true);
                    }
                }
            }, this);

            var fields = new Fields(beforeFields);
            currentFields.each(function (currentField) {
                var field = fields.findWhere({cid: currentField.get('cid')});
                if (field) {
                    field.set('label', currentField.get('label'));
                } else {
                    fields.push(currentField);
                }
            });

            return fields;
        },

        /**
         * model에 저장된 fields 와 서버로 부터 받아온 fields 를 비교하여
         * 삭제된 필드가 있으면 지우고, label이 변경된 필드가 있으면 model 에도 변경시켜준다.
         */
        _mergedDisplayFields: function () {
            var currentFields = this.fields.getColumnFields();
            var beforeFields = this.model.get('selectedDisplayFields') || [];
            beforeFields = _.reject(beforeFields, function (field) {
                return !currentFields.findWhere({cid: field.cid});
            });

            var fields = new Fields(beforeFields);
            currentFields.each(function (currentField) {
                var field = fields.findWhere({cid: currentField.get('cid')});
                if (field) field.set('label', currentField.get('label'));
            });

            return fields;
        },

        _onSyncFields: function () {
            var linkableFields = this.fields.getLinkableFields();
            linkableFields.comparator = 'label';
            linkableFields.sort();
            var fields = linkableFields.toJSON();
            var displayFields = this.fields.getDisplayFields().pick(['cid', 'label']).toJSON();
            var integrationFieldCid = this.model.get('integrationFieldCid') || (fields.length > 0 ? fields[0].cid : '');

            this.model.set('fields', this._mergedFields(linkableFields).pick(['cid', 'label']).toJSON());
            this.model.set('integrationFieldCid', integrationFieldCid);
            this.model.set('displayFields', displayFields);
            this.model.set('selectedDisplayFields', this._mergedDisplayFields().pick(['cid', 'label', 'valueType']).toJSON());

            this._renderFieldOptions();
            this._renderDisplayOptions();
            this._renderSelectedDisplayItems();
            if (!this.model.get('selectedDisplayFields').length) this._addDisplayField(this.$('#fields').val(), true);
        },

        _renderFieldOptions: function () {
            var fields = this.model.get('fields');
            if (_.isUndefined(fields)) {
                fields = [];
            } else if (fields.length === 0) {
                fields.push({
                    cid: '',
                    label: lang['연동할 수 있는 항목이 없습니다.']
                });
            }
            this._renderOptions(fields, this.$('#fields'));
            this.$('#fields').css('color', this.model.get('isDeletedField') ? 'red' : '');
            if (this.model.get('integrationFieldCid')) this.$('#fields').val(this.model.get('integrationFieldCid'));
            if (!ComponentManager.isNew(this.clientId) && !this._integrationFieldChangeable()) this.$('#fields').prop('disabled', 'disabled');
        },

        _renderDisplayOptions: function () {
            var fields = this.model.get('displayFields') || [];
            this._renderOptions(fields, this.$('#displayFields'));
        },

        _renderOptions: function (fields, $targetEl) {
            if (fields.length == 0) {
                fields = [{
                    cid: '',
                    label: lang['앱을 먼저 선택하세요.']
                }];
            }
            var fieldOptionsEl = _.map(fields, function (field) {
                return '<option value="' + field.cid + '">' + field.label + '</option>';
            });
            $targetEl.html(fieldOptionsEl);
        },

        _onClickAddField: function () {
            this._addDisplayField(this.$('#displayFields').val());
        },

        _addDisplayField: function (cid, isDefaultField) {
            if (!cid) return;

            var fieldModel = this.fields.findWhere({cid: cid});
            if (!fieldModel) return;

            var fields = this.model.get('selectedDisplayFields') || [];
            var collection = new Fields(fields);
            var isAlreadyAdded = _.isObject(collection.findWhere({cid: fieldModel.get('cid')}));
            if (isAlreadyAdded) return;

            if (isDefaultField) {
                collection.remove(this.model.get('integrationFieldCid'));
                fields = collection.toJSON();
            }
            var field = _.pick(fieldModel.toJSON(), ['cid', 'label', 'valueType']);
            fields.push(field);
            this.model.unset('selectedDisplayFields');
            this.model.set('selectedDisplayFields', fields);

            this._renderTextFieldItem(field, isDefaultField);
        },

        _removeDisplayField: function (cid) {
            var displayFields = this.model.get('selectedDisplayFields') || [];
            var collection = new Fields(displayFields);
            var field = collection.findWhere({cid: cid});
            collection.remove(field);
            this.model.unset('selectedDisplayFields');
            this.model.set('selectedDisplayFields', collection.toJSON());

            this.fieldNameTagView.removeTag(cid);
        },

        _renderSelectedDisplayItems: function () {
            if (this.fieldNameTagView) this.fieldNameTagView.removeAll();
            _.each(this.model.get('selectedDisplayFields'), function (field) {
                var isDefaultField = field.cid == this.model.get('integrationFieldCid');
                this._renderTextFieldItem(field, isDefaultField);
            }, this);
        },

        _renderTextFieldItem: function (field, isDefaultField) {
            if (this.fieldNameTagView) {
                this.fieldNameTagView.addTag(field.cid, field.label, {
                    attrs: field,
                    removable: isDefaultField ? false : true
                });
                var $name = this.fieldNameTagView.$('span.name');
                _.each($name, function (el) {
                    var $el = $(el);
                    if (!$el.siblings('span.ic_drag').length) {
                        $el.before('<span class="ic_works ic_drag"></span>');
                    }
                });
            }
        },

        onlyNumber: function (e) {
            var keyCode = e.keyCode ? e.keyCode : e.which;
            if (!WorksUtil.isNumber(keyCode)) { //숫자가 아니면
                e.preventDefault();
                return false;
            }
        },

        replaceNumber: function (e) { //keypress가 한글에서는 이벤트가 동작하지 않는 버그때문에 keyup을 통해 막아야함. 근데 그것도 키보드 동시에 2개 누르면 못막는 버그가 있어서 replace해야함
            var keyCode = e.keyCode ? e.keyCode : e.which;
            if (!WorksUtil.isNumber(keyCode)) { //숫자가 아니면
                var replace = $(e.currentTarget).val().replace(/[^0-9]/gi, '');
                $(e.currentTarget).val(replace);
                e.preventDefault();
                return false;
            }
        },

        _checkOptionValidate: function (e) {
            var $target = $(e.currentTarget),
                $targetName = $target.attr('name'),
                $targetValue = $target.val();

            if ($targetValue == '' && _.has(defaultValues, $targetName)) {
                $target.val(defaultValues[$targetName]);
                this.model.set($targetName, defaultValues[$targetName]);
            }

            if ($targetName == 'maxCount' && $targetValue > 20) {
                $target.val(20);
                this.model.set($targetName, 20);
            }
        }
    });

    var FormView = BaseFormView.extend({

        fieldsFetched: null,

        initialize: function (options) {
            options = options || {};
            BaseFormView.prototype.initialize.call(this, options);

            this.fieldsFetched = $.Deferred();

            this.masking = new Masking({appletId: this.model.get('integrationAppletId')});
            if (this.model.get('integrationAppletId')) {
                this.fields = new Fields([], {
                    appletId: this.model.get('integrationAppletId'),
                    includeProperty: true,
                    type: 'consumers'
                });
                this.fields.fetch().done($.proxy(function () {
                    this.fieldsFetched.resolve();
                }, this));
                this.masking.fetch();
            } else {
                this.fieldsFetched.resolve();
                this.masking.deferred.resolve();
            }

            this.docs = new ReferDocs([], {
                type: 'producerDocs',
                appletId: this.appletId,
                referAppletId: this.model.get('integrationAppletId'),
                fieldCid: this.model.get('integrationFieldCid'),
                fieldValueType: this.getIntegrationFieldValueType(this.model.get('integrationFieldCid')) || ""
            });
            this.docs.pageSize = 10;
            this._initNameTag();
        },

        render: function () {
            this.$body.html(renderFormTpl({
                lang: lang,
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                clientId: this.clientId,
                inputValue: this._getInputValue(),
                isReadonly: this.isEditable(),
                "editable?": this.isEditable(),
                isMasking: this.isMasking()
            }));
            this.resizeWidth(this.model.get('width'), this.model.get('widthUnit') === 'percent' ? '%' : this.model.get('widthUnit'));
            this.masking.deferred.done(_.bind(function () {
                var isMasking = _.contains(this.masking.get('fieldCids'), this.model.get('integrationFieldCid'));
                if (isMasking) this.setMasking(true);
                //if (!this.fieldNameTagView) this._initNameTag();
                this.$('div.build_box_data').append(this.fieldNameTagView.el);
                this._renderNameTag();
            }, this));
        },

        events: function () {
            if (GO.util.isMobile()) {
                return this.isEditable() ? BaseFormView.prototype.events : _.extend({}, BaseFormView.prototype.events, {
                    'click a[el-button]': '_onClickButtonMobileType'
                });
            } else {
                return this.isEditable() ? BaseFormView.prototype.events : _.extend({}, BaseFormView.prototype.events, {
                    'click a[el-button]': '_onClickButton'
                });
            }
        },

        validate: function () {
            if (!this.model.get('required')) return true;

            var isValid = this.getDataFromView()[this.clientId].length > 0;
            if (isValid) {
                return true;
            } else {
                this.printErrorTo('div:last', worksLang['필수 항목입니다.']);
                return false;
            }
        },

        _initNameTag: function () {
            //Mobile NameTagView의 디자인이 상이하여 NameTagView를 확자ㅇgks DNDTagMobileView 생성
            //Mobiledp서는 해당 TagView를 이용하여 연동앱 doc add처리
            var viewOption = {
                useAddButton: false,
                className: 'list_comp'
            };
            this.fieldNameTagView = GO.util.isMobile() ? new DNDTagMobileView(viewOption) : NameTagView.create([], viewOption);
            this._renderNameTag();
            //this.$('div.build_box_data').append(this.fieldNameTagView.el);
            this.fieldNameTagView.$el.on('nametag:removed', $.proxy(function (e, removedDocId) {
                var restNameTags = this.fieldNameTagView.getNameTagList();
                var nextDocAttrs = {};

                this.appletDocModel.set(this.clientId, restNameTags);
                this._changeValue(restNameTags);

                if (_.isArray(restNameTags) && restNameTags.length > 0) {
                    nextDocAttrs = restNameTags[0];
                    nextDocAttrs.appletId = this.model.get('integrationAppletId');
                }

                if (nextDocAttrs.id) {
                    this._fetchAppletDocModel(nextDocAttrs).done($.proxy(function (resp) {
                        this.observer.trigger('applet_doc:removed', this.clientId, removedDocId, resp.data, this.fields.toJSON());
                    }, this));
                } else {
                    this.observer.trigger('applet_doc:removed', this.clientId, removedDocId, {}, this.fields.toJSON());
                }
            }, this));
        },

        _renderNameTag: function () {
            this.fieldNameTagView.removeAll();
            _.each(this.appletDocModel.get(this.clientId), function (field) {
                var integrationFieldCid = this.model.get('integrationFieldCid');
                var isNumber = VALUE_TYPE.NUMBER === this.getIntegrationFieldValueType(integrationFieldCid);
                var displayText = isNumber ? "" : field.text;
                var isTemplate = false;
                var templateText = '';

                if (isNumber) {
                    displayText = field.text;
                    var componentManager = ComponentManager.getInstance(this.viewType);
                    var component = componentManager.getComponent(this.clientId);
                    var integrationModel = component.getIntegrationModel();
                    var properties = integrationModel.getPropertiesByIntegrationAppletId(this.clientId);
                    var dataType = properties.dataType ? properties.dataType : "NUMBER";
                    if (dataType == "PERCENT") {
                        if (GO.util.isInvalidValue(displayText)) {
                            displayText = "-";
                        } else {
                            isTemplate = true;
                            templateText = displayText;
                            displayText = '<span class="com_gage"><span class="wrap_gage"><span class="gage" id="percentGage" style="width:'
                                + displayText + '%"></span></span><span class="txt">' + displayText + '%</span></span>';
                        }
                    } else if (dataType == "POINT") {
                        if (GO.util.isInvalidValue(displayText)) {
                            displayText = "-";
                        } else {
                            isTemplate = true;
                            templateText = displayText;
                            var pointEl = '<span class="com_rate"><span class="wrap_rate">';
                            for (i = 0; i < properties.maxLength; i++) {
                                var customClass = i < parseFloat(displayText) ? "" : "ic_star_off"
                                pointEl = pointEl + '<ins style="cursor: default;" class="ic_star ' + customClass + '"></ins>';
                            }
                            pointEl = pointEl + '</span></span>';

                            displayText = pointEl;
                        }
                    } else {
                        if (properties.thousandComma) {
                            displayText = GO.util.numberWithCommas(displayText);
                        }
                        if (properties.fixType === 'prefix') displayText = properties.unitText + ' ' + displayText;
                        if (properties.fixType === 'postfix') displayText = displayText + ' ' + properties.unitText;
                    }

                }
                this.fieldNameTagView.addTag(field.id, displayText, {
                    attrs: field,
                    removable: true,
                    isTemplate: isTemplate,
                    liCustomClass: isTemplate ? 'comp' : '',
                    templateText: templateText,
                });
            }, this);
            this.fieldNameTagView.$('li[data-id]').wrapInner('<span class="item_file"></span>');
            if (this.isMasking()) {
                this.fieldNameTagView.$('span.item_file').html(
                    '<div class="hidden_data">' +
                    '<span class="help" title="' + lang['관리자에 의해 마스킹 처리 된 항목입니다'] + '"></span>' +
                    '</div>'
                );
            }
        },

        _onClickButton: function () {
            this.integration = new Integration({
                appletId: this.appletId
            });
            $.when(this.integration.fetch(), this.fieldsFetched).done($.proxy(function () {
                this._renderAppletDocSearch();
            }, this));
        },

        _renderAppletDocSearch: function () {
            this.popupView = $.goPopup({
                pclass: 'layer_normal layer_app_search',
                header: lang['데이터 검색'],
                buttons: [{
                    btext: commonLang["닫기"],
                    callback: $.proxy(function () {
                    }, this)
                }]
            });

            var appletDocSearchView = new AppletDocSearchView({
                model: this.model,
                docs: this.docs,
                fieldsOfIntegrationApp: this.fields,
                integration: this.integration
            });

            this.popupView.find('div.content').html(appletDocSearchView.render().el);
            this.popupView.on('onClickListItem', $.proxy(function (e, doc) {
                this._addDoc(doc);
            }, this));
            appletDocSearchView.on('rendered:appletDocSearch', _.bind(this.popupView.reoffset));
        },

        _onClickButtonMobileType: function () {
            this.integration = new Integration({
                appletId: this.appletId
            });
            this.integration.fetch().done($.proxy(function () {
                this._renderMobileSearchRefer();
            }, this));
        },

        _renderMobileSearchRefer: function () {
            var $errMsgTarget = this.$('.txt_error');
            $errMsgTarget.remove();

            var $msgTarget = this.$('.btn_minor_s');
            var hasDisplayFields = this.model.get('selectedDisplayFields').length > 0;
            var hasListAuth = this.integration.getListAuthByCid(this.model.get('integrationAppletId'));
            if (!hasDisplayFields || !hasListAuth || !this.model.get('integrationAppletId')) {
                if (!this.model.get('integrationAppletId')) {
                    this.printErrorTo($msgTarget, GO.i18n(lang['연동 앱 없음 설명']));
                } else if (!hasDisplayFields) {
                    this.printErrorTo($msgTarget, GO.i18n(lang['검색 노출 항목 없음 설명']));
                } else {
                    this.printErrorTo($msgTarget, GO.i18n(lang['연동 권한 설명']));
                }
            } else {
                var self = this;
                var searchReferApps = new SearchReferApps({
                    "selectedDocs": this.fieldNameTagView.getNameTagList(),
                    "appletId": this.appletId,
                    "referModel": this.model,
                    "callbackAddDoc": function (referDocs) {
                        self._addDocMobile(referDocs);
                        $('.go_wrap').show();
                    },
                    "callbackCancel": function () {
                        $('.go_wrap').show();
                    }
                });

                $('.go_wrap').hide();
                $('body').append(searchReferApps.el);
                searchReferApps.render();
            }
        },

        _addDoc: function (doc) {
            var isAlreadyAdded = this.fieldNameTagView.getNameTag(doc.id).length;
            if (isAlreadyAdded) {
                $.goMessage(commonLang['이미 추가되어 있습니다.']);
                return;
            }

            var correction = isAlreadyAdded ? 0 : 1;
            var currentItemCount = this.fieldNameTagView.$('li[data-id]').length;
            var isExcess = currentItemCount + correction > parseInt(this.model.get('maxCount'));
            var integrationFieldCid = this.model.get('integrationFieldCid');

            if (isExcess) {
                $.goError(lang["최대 선택 개수를 초과하였습니다."]);
                return;
            }
            var value = doc.values[integrationFieldCid] || "";
            var data = {
                id: doc.id,
                text: _.isArray(value) ? _.map(value, function (val) {
                    return val.text;
                }) : value
            };

            var displayText = data.text;
            var templateText = '';
            if (VALUE_TYPE.NUMBER === this.getIntegrationFieldValueType(integrationFieldCid)) {
                var integrationField = _.find(doc.columnFields, function (field) {
                    return field.get("cid") == integrationFieldCid
                });
                templateText = displayText;
                displayText = integrationField.getDisplayValueContainsTemplate(new Backbone.Model(doc), integrationField.get("properties"));
            }

            var $tag = this.fieldNameTagView.addTag(data.id, displayText, {
                attrs: {
                    id: data.id,
                    text: displayText
                },
                removable: true,
                isTemplate: true,
                templateText: templateText
            });
            $tag.wrapInner('<span class="item_file"></span>');
            if (this.isMasking()) {
                this.fieldNameTagView.$('span.item_file').html(
                    '<div class="hidden_data">' +
                    '<span class="help" title="' + lang['관리자에 의해 마스킹 처리 된 항목입니다'] + '"></span>' +
                    '</div>'
                );
            }

            var savedData = this.appletDocModel.get(this.clientId) || [];
            savedData.push(data);
            this.appletDocModel.set(this.clientId, savedData);
            this._changeValue(savedData);

            // 필드매핑 연동으로 추가(Bongsu Kang, kbsbroad@daou.co.kr)
            this._fetchAppletDocModelAndNotify(doc);

            $.goMessage(commonLang['추가되었습니다.']);
        },
        _getColumnFields: function () {
            var columnFields = this.fields.getFields(this.model.get('selectedDisplayFields'));
            return columnFields.filter(function (columnField) {
                return this.fields.findWhere({cid: columnField.get('cid')});
            }, this);
        },
        _addDocMobile: function (referDocs) {
            var integrationFieldCid = this.model.get('integrationFieldCid');
            var items = this.fieldNameTagView.getNameTagList();
            var savedData = [];

            this.docs = new ReferDocs(referDocs, {
                type: 'producerDocs',
                appletId: this.appletId,
                referAppletId: this.model.get('integrationAppletId'),
                fieldCid: this.model.get('integrationFieldCid'),
                columnFields: this._getColumnFields()
            });

            _.each(items, function (item) {
                this.fieldNameTagView.removeTag(item.id);
            }, this);

            this.docs.each(function (referDoc) {
                var doc = referDoc.toJSON();
                var value = doc.values[this.model.get('integrationFieldCid')] || "";
                var data = {
                    id: doc.id,
                    text: _.isArray(value) ? _.map(value, function (val) {
                        return val.text;
                    }) : value
                };

                var displayText = data.text;
                var templateText = '';
                if (VALUE_TYPE.NUMBER === this.getIntegrationFieldValueType(integrationFieldCid)) {
                    var integrationField = _.find(this.docs.columnFields, function (field) {
                        return field.get("cid") == integrationFieldCid
                    });
                    templateText = displayText;
                    displayText = integrationField.getDisplayValueContainsTemplate(new Backbone.Model(doc), integrationField.get("properties"));
                }
                this.fieldNameTagView.addTag(data.id, displayText, {
                    attrs: {
                        id: data.id,
                        text: data.text
                    },
                    removable: true,
                    isTemplate: true,
                    templateText: templateText
                });
                if (this.isMasking()) {
                    this.fieldNameTagView.$('span.item_file').html(
                        '<div class="hidden_data">' +
                        '<span class="help" title="' + lang['관리자에 의해 마스킹 처리 된 항목입니다'] + '"></span>' +
                        '</div>'
                    );
                }

                savedData.push(data);
            }, this);

            this.appletDocModel.set(this.clientId, savedData);
            this._changeValue(savedData);

            // 필드매핑 연동으로 추가(Bongsu Kang, kbsbroad@daou.co.kr)
            if (this.docs.length > 0) {
                var firstDoc = this.docs.first();
                this._fetchAppletDocModelAndNotify(firstDoc.toJSON());
            }
        },

        /**
         * 연동된 문서의 모델을 fetch
         *
         * @param doc
         * @returns Promise
         * @private
         */
        _fetchAppletDocModel: function (doc) {
            var appletDocModel = new AppletDocModel({}, {
                producerDocId: doc.id,
                appletId: this.appletId,
                producerAppletId: doc.appletId
            });
            var promise = appletDocModel.fetch();
            GO.util.preloader(promise);
            return promise;
        },

        /**
         * 연동된 문서의 모델을 패치하고 add 이벤트를 observer로 발생함.
         * @param doc
         * @private
         */
        _fetchAppletDocModelAndNotify: function (doc) {
            var self = this;
            this._fetchAppletDocModel(doc).done(function (resp) {
                self.observer.trigger('applet_doc:add', self.clientId, resp.data, self.fields.toJSON());
            });
        },

        _searchInputTmpl: function () {
            return Hogan.compile([
                '<input type="txt_mini" id="searchKeyword" class="txt_mini" />',
                '<span class="btn_minor_s" id="searchBtn">',
                '<span class="txt">{{lang.검색}}</span>',
                '</span>'
            ].join('')).render({lang: lang});
        },

        //getFormData: function() {
        //console.log(this.appletDocModel.get(this.clientId));
        //return this.appletDocModel.toJSON();
        //},

        getDataFromView: function () {
            var returnValue = {};
            returnValue[this.clientId] = _.map(this.$('li'), function (li) {
                return $(li).data('attrs');
            });
            return returnValue;
        },

        _getInputValue: function () {
            var userData = this.appletDocModel.get(this.getCid());
            var result = this.model.get('defaultValue');

            if (userData && userData.length > 0) {
                result = userData;
            }

            return result;
        },

        getIntegrationFieldValueType: function (fieldCid) {
            var result = _.find(this.model.get('selectedDisplayFields'), function (field) {
                return field.cid == fieldCid
            }, this);
            return result ? result.valueType : "";
        },

        fetchAppletDocModel: function (doc) {
            this._fetchAppletDocModelAndNotify(doc);
        }

    });

    var DetailView = BaseDetailView.extend({

        events: {
            'click span[data-integrat-doc]': '_onClickAppletItem'
        },

        initialize: function (options) {
            options = options || {};
            BaseDetailView.prototype.initialize.call(this, options);

            this.masking = new Masking({appletId: this.model.get('integrationAppletId')});
            if (this.model.get('integrationAppletId')) {
                this.masking.fetch();
            } else {
                this.masking.deferred.resolve();
            }
        },

        render: function () {
            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                isMasking: this.isMasking(),
                iconTitle: worksLang['데이터 연동']
            }));

            this.masking.deferred.done(_.bind(function () {
                var isMasking = _.contains(this.masking.get('fieldCids'), this.model.get('integrationFieldCid'));
                if (isMasking) this.setMasking(true);
                this._initNameTag();
            }, this));

            return this;
        },

        getTitle: function () {
            return _.map(this.appletDocModel.get(this.clientId), function (applet) {
                return applet.text;
            }).join(', ');
        },

        _onClickAppletItem: function (e) {
            var appletData = $(e.currentTarget).closest('li[data-id]').data('attrs');
            this.$el.trigger('navigate:integrationDoc', {
                appletId: this.appletId,
                integrationAppletId: this.model.get('integrationAppletId'),
                integrationDocId: appletData.id
            });
        },

        _initNameTag: function () {
            this.fieldNameTagView = NameTagView.create([], {
                useAddButton: false,
                className: 'list_comp'
            });
            this._renderNameTag();
            this.$('div.build_box_data').append(this.fieldNameTagView.el);
        },

        _renderNameTag: function () {
            _.each(this.appletDocModel.get(this.clientId), function (field) {
                var integrationFieldCid = this.model.get('integrationFieldCid');
                var isNumber = VALUE_TYPE.NUMBER === this.getIntegrationFieldValueType(integrationFieldCid);
                var displayText = isNumber ? "" : field.text;
                var isTemplate = false;
                var templateText = '';

                if (isNumber) {
                    displayText = field.text;
                    var componentManager = ComponentManager.getInstance(this.viewType);
                    var component = componentManager.getComponent(this.clientId);
                    var integrationModel = component.getIntegrationModel();
                    var properties = integrationModel.getPropertiesByIntegrationAppletId(this.clientId);

                    var dataType = properties.dataType ? properties.dataType : "NUMBER";
                    if (dataType == "PERCENT") {
                        if (GO.util.isInvalidValue(displayText)) {
                            displayText = "-";
                        } else {
                            isTemplate = true;
                            templateText = displayText;
                            displayText = '<span class="com_gage"><span class="wrap_gage"><span class="gage" id="percentGage" style="width:'
                                + displayText + '%"></span></span><span class="txt">' + displayText + '%</span></span>';
                        }
                    } else if (dataType == "POINT") {
                        if (GO.util.isInvalidValue(displayText)) {
                            displayText = "-";
                        } else {
                            isTemplate = true;
                            templateText = displayText;
                            var pointEl = '<span class="com_rate"><span class="wrap_rate">';
                            for (i = 0; i < properties.maxLength; i++) {
                                var customClass = i < parseFloat(displayText) ? "" : "ic_star_off"
                                pointEl = pointEl + '<ins class="ic_star ' + customClass + '"></ins>';
                            }
                            pointEl = pointEl + '</span></span>';

                            displayText = pointEl;
                        }
                    } else {
                        if (properties.thousandComma) {
                            displayText = GO.util.numberWithCommas(displayText);
                        }
                        if (properties.fixType === 'prefix') displayText = properties.unitText + ' ' + displayText;
                        if (properties.fixType === 'postfix') displayText = displayText + ' ' + properties.unitText;
                    }
                }
                this.fieldNameTagView.addTag(field.id, displayText, {
                    attrs: field,
                    removable: false,
                    isTemplate: isTemplate,
                    liCustomClass: isTemplate ? 'comp' : '',
                    templateText: templateText,
                });

            }, this);

            this.fieldNameTagView.$('li[data-id]').wrapInner('<span data-integrat-doc></span>')
            this.fieldNameTagView.$('li[data-id]').not('.comp').find('span.name').addClass('linkage');
            this.fieldNameTagView.$('li[data-id]>span').attr("style", "cursor: pointer");

            if (this.isMasking()) {
                this.fieldNameTagView.$('span.item_file').html(
                    '<div class="hidden_data">' +
                    '<span class="help" title="' + lang['관리자에 의해 마스킹 처리 된 항목입니다'] + '"></span>' +
                    '</div>'
                );
            }
        },

        getIntegrationFieldValueType: function (fieldCid) {
            var result = _.find(this.model.get('selectedDisplayFields'), function (field) {
                return field.cid === fieldCid;
            }, this);
            return result ? result.valueType : '';
        }
    });

    var AppletDocComponent = FormComponent.define(ComponentType.AppletDocs, {
        name: lang['데이터 연동'],
        valueType: 'APPLETDOCS',
        group: 'extra',

        properties: {
            appletName: '',
            integrationAppletId: null,
            integrationFieldCid: '',
            selectedDisplayFields: [],
            maxCount: {defaultValue: 10},

            "label": {defaultValue: lang['데이터 연동']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "required": {defaultValue: false}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(AppletDocComponent);
});
