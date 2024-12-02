define('works/components/doc_list/views/doc_list', function (require) {

    require("jquery.tooltipster");

    var VALUE_TYPE = require('works/constants/value_type');
    var FIELD_TYPE = require('works/constants/field_type');

    var worksLang = require('i18n!works/nls/works');
    var commonLang = require('i18n!nls/commons');

    var ListSetting = require('works/components/list_manager/models/list_setting');
    var Masking = require('works/components/masking_manager/models/masking');

    var Fields = require('works/collections/fields');

    var GridView = require('go-realgrid');
    var StatusColumnView = require('works/components/doc_list/views/status_column');

    var FormValidator = require('works/components/formbuilder/formvalidator');
    var FormulaUtil = require("works/components/formbuilder/form_components/formula/formula_util");

    var lang = {
        "일": worksLang["일"],
        "시간": worksLang["시간"],
        "분": worksLang["분"],
        '관리자에 의해 마스킹 처리 된 항목입니다': worksLang['관리자에 의해 마스킹 처리 된 항목입니다']
    };
    return GridView.extend({

        gridView: null,

        events: _.extend({
            'click [data-el-document-popup]': '_onClickDocPopup'
        }, GridView.prototype.events),

        initialize: function (options) {

            options = options || {};

            GridView.prototype.initialize.call(this, _.extend(options));

            this.appletId = options.appletId;
            this.subFormId = options.subFormId;
            this.accessibleForms = options.accessibleForms;
            this.fields = options.fields;
            this.masking = new Masking({appletId: this.appletId});
            this.masking.fetch();
            this.maskings = {};
            this.fieldsOfIntegrationApplet = {};
            this.columnFields = options.columnFields;
            this.integrationFieldCid = options.integrationFieldCid;
            this.columns = [];
            this.useProfile = options.useProfile !== false;
            this.conditions = options.conditions;
            this.usePopupView = (typeof options.usePopupView === "undefined" || options.usePopupView === null) ? false : options.usePopupView;
            this.isContainsTemplate = options.isContainsTemplate ? options.isContainsTemplate : false;

            if (!this.fields) {
                this.fields = new Fields([], {
                    appletId: this.appletId,
                    subFormId: this.subFormId,
                    includeProperty: true
                });
                this.fields.fetch();
            }
            if (!this.setting) {
                this.setting = new ListSetting({}, {appletId: this.appletId});
                this.setting.fetch();
            }
        },

        dataFetch: function () {
            return $.when(
                this.fields.deferred,
                this.setting.deferred,
                this.masking.deferred
            ).then($.proxy(function () {
                return this.fetchIntegrationDatas();
            }, this)).then($.proxy(function () {
                this._setColumns();
            }, this));
        },

        fetchIntegrationDatas: function () {
            var deferred = $.Deferred();
            this.fields.getFieldsOfIntegrationApplet().done(_.bind(function (fields) {
                this.fieldsOfIntegrationApplet = fields;
                deferred.resolve();
            }, this));
            return deferred;
        },

        setCustomColumns: function (customColumns) {
            this.columnFields = customColumns;
        },

        _setColumns: function () {
            this.columns = this._getGridColumns();
        },

        _setMasking: function (fields) {
            var maskingFields = this.masking.get('fieldCids');
            _.each(fields, function (field) {
                var isMasking;
                if (field.get('fieldType') === FIELD_TYPE.FIELD_MAPPING) {
                    maskingFields = this._getIntegrationAppletMaskingByFieldMappingCid(field.get('cid'));
                    var properties = field.get('properties') || {};
                    isMasking = _.contains(maskingFields, properties.targetFieldCid);
                } else {
                    isMasking = _.contains(maskingFields, field.get('cid'));
                }
                field.set('isMasking', isMasking);
            }, this);
            return fields;
        },

        _getIntegrationAppletMaskingByFieldMappingCid: function (cid) {
            var fieldMapping = this.fields.findWhere({cid: cid});
            var fieldMappingProperties = fieldMapping.get('properties') || {};
            // fields API(입력항목) 옵션중 includeProperties=false 일 경우 properties가 없음  ex)가젯
            if (fieldMappingProperties) {
                return [];
            }
            var appletDocCid = fieldMappingProperties.targetComponentCid;
            var appletDoc = this.fields.findWhere({cid: appletDocCid});
            var appletDocProperties = appletDoc.get('properties') || {};
            var integrationAppletId = appletDocProperties.integrationAppletId;
            var masking = this.maskings[integrationAppletId];
            return masking.get('fieldCids');
        },
        /**
         * Override
         * @private
         */
        _setFieldsNColumns: function () {
            var fields = [];
            fields.push({fieldName: "docId", dataType: this.DataType.NUMBER});
            _.each(this.columns, function (column) {
                fields.push({
                    fieldName: column.fieldName,
                    dataType: (column.dataType) ? column.dataType : this.DataType.TEXT
                });
            }, this);
            this.provider.setFields(fields);
            this.gridView.setColumns(this.columns);

            var visibleHeaderSummary = GO.util.store.get(this.appletId + '-gridview-headerSummary');
            this.gridView.headerSummaries.visible = (visibleHeaderSummary) ? true : false;
        },

        /**
         * Override
         * @private
         */
        _renderListView: function () {
            this.columnDatas = {};
            this.provider.clearRows();
            this.collection.each(function (model) {
                var columnsData = {appletId: this.appletId, docId: model.id};
                _.each(this.columns, function (column) {
                    if (column.fieldName === 'status') {
                        var statusColumnView = new StatusColumnView({
                            appletId: this.appletId,
                            docId: model.id,
                            statusLabel: column.render(model),
                            color: model.get("status") ? model.get("status").color : '0'
                        });
                        var statusId = model.id + "_" + column.fieldName;
                        columnsData[column.fieldName] = statusId;
                        this.columnDataView = (this.columnDataView) ? this.columnDataView : {};
                        this.columnDataView[statusId] = statusColumnView;
                    } else {
                        columnsData[column.fieldName] = column.render(model);
                    }
                }, this);
                this.provider.addRow(columnsData);
            }, this);

            this._resizeGrid();
        },
        /**
         * Override
         * @private
         */
        _setOnLoadEvent: function() {
            this.gridView.onDataLoadComplated = $.proxy(function(grid){
                if (this.collection.length) {
                    this._numberValueStats();
                }
            },this)
        },
        /**
         * Override
         * @private
         */
        _setColumnEvent: function () {
            this.gridView.onColumnPropertyChanged = $.proxy(function (grid, column, property, newValue, oldValue) {
                if (property == "displayIndex") {
                    var columns = grid.getDisplayColumns();
                    var columnIds = _.map(columns, function (column) {
                        return column.fieldName;
                    });
                    this._changeColumnOrder(columnIds);
                } else if (property == "displayWidth") {
                    var columnWidth = GO.util.store.get(this.appletId + "-gridview-columnWidth");
                    columnWidth = (!columnWidth) ? {} : columnWidth;
                    columnWidth[column.fieldName] = newValue;
                    GO.util.store.set(this.appletId + "-gridview-columnWidth", columnWidth);
                }
            }, this);

            this.gridView.onCellButtonClicked = $.proxy(function (grid) {
                var current = grid.getCurrent();
                var docValue = this.provider.getJsonRow(current.dataRow);
                this.clickGridListItem(docValue.docId);
            }, this);
        },
        /**
         * Override
         * @private
         */
        _setEditColumnEvent: function () {
            this.gridView.onValidateColumn = $.proxy(function (grid, column, inserting, newValue) {
                newValue = (!newValue) ? "" : newValue;
                var current = grid.getCurrent();
                if (current.fieldName != column.fieldName) {
                    return;
                }

                var fieldName = column.fieldName;
                var field = this.fields.findWhere({cid: fieldName});
                var fieldType = field.get('fieldType');
                var valueType = field.get('valueType');
                var isMultiValued = _.contains(VALUE_TYPE.MULTI_VALUED_TYPES, valueType);
                var properties = this.getProperties(field);

                var value = newValue;
                if (isMultiValued) {
                    value = (value == "") ? [] : value.split(",");
                }

                var validator = FormValidator.getValidator(fieldType);
                if (!validator) {
                    return;
                }

                var result = this._validateUpdateValue(validator, fieldType, value, properties);

                var error = {};
                if (!result.isValid) {
                    error.level = "warning";
                    error.message = result.message;
                } else {
                    var docValue = this.provider.getJsonRow(current.dataRow);
                    var updateValue = this._makeUpdateValueFormat(field, value, docValue, properties);
                    this._saveDataAndGridUpdate(docValue.docId, updateValue, grid, current.dataRow);
                }
                return error;
            }, this)
        },
        /**
         * Override
         * @private
         */
        _setSelectionEvent: function() {
            var $selectionTooltip = this.$el.find("[data-el-realgrid]");
            this.gridView.onSelectionChanged = $.proxy(function (grid) {
                var instances = $.tooltipster.instances($selectionTooltip);
                if (instances.length == 0) {
                    $selectionTooltip.tooltipster({
                        content: '',
                        contentAsHTML: true,
                        theme: 'tooltipster-light',
                        hideOnClick: true,
                        trigger: 'custom',
                        arrow: false,
                        viewportAware: false,
                        functionPosition: function (instance, helper, position) {
                            position.coord.top += 5;
                            return position;
                        }
                    });
                }
                var selectionDatas = grid.getSelectionData();
                var selectionCount = (selectionDatas) ? selectionDatas.length : 0;
                var numberCids = [];
                var dataCount = 0;
                var valueCount = 0;
                var valueSum = 0;
                if (selectionCount > 1) {
                    _.each(selectionDatas, function(selectionData, index) {
                        _.each(selectionData, function (value, key) {
                            dataCount++;
                            if (index == 0) {
                                var field = this.fields.findWhere({cid: key});
                                if (field.isNumberValueType() && !field.get('isMasking')) {
                                    numberCids.push(key);
                                }
                            }
                            if (_.contains(numberCids, key) && $.isNumeric(value)) {
                                valueCount++;
                                valueSum += value;
                            }
                        }, this);
                    }, this);
                    var content = '';
                    if (numberCids.length > 0) {
                        content = worksLang['합계'] + ": " + GO.util.formatNumber(valueSum);
                        content += "  " + worksLang['평균'] + ": " + ((valueSum == 0) ? 0 : GO.util.formatNumber(valueSum / valueCount));
                    } else {
                        content = worksLang['개수'] + ": " + dataCount;
                    }
                    $selectionTooltip.tooltipster('content', content);
                    $selectionTooltip.tooltipster('show');
                } else {
                    $selectionTooltip.tooltipster('content', '');
                    $selectionTooltip.tooltipster('hide');
                }
            }, this);
        },
        /**
         * Override
         * @private
         */
        _setContextMenuPopupEvent: function () {
            this.gridView.onContextMenuPopup = $.proxy(function (grid) {
                if (this.readOnly) {
                    return;
                }
                var displayColumns = grid.getDisplayColumns();
                var displayColumnIds = _.map(displayColumns, function (displayColumn) {
                    return displayColumn.fieldName;
                });

                var visibleContextMenu = [];
                var columnFields = this.fields.getColumnFields().models;
                _.each(columnFields, function (field) {
                    var menuItem = {};
                    menuItem.label = field.get("columnName") || field.get("label");
                    menuItem.tag = field.get('cid');
                    menuItem.checked = _.contains(displayColumnIds, field.get('cid'));
                    menuItem.callback = $.proxy(function (grid, menuItem) {
                        var checked = (!menuItem.checked);
                        var settingId = parseInt(this.settingId);
                        var setting = settingId ? this.settings.get(settingId) : null;
                        var url = "api/works/applets/" + this.appletId + "/listview";
                        url += (setting) ? "/my/" + settingId : "";
                        url += "/columns/visible";

                        $.ajax({
                            type: 'PUT',
                            contentType: "application/json",
                            url: GO.contextRoot + url,
                            data: JSON.stringify({fieldCids: [menuItem.tag], visible: checked}),
                            success: $.proxy(function () {
                                $.goMessage(commonLang['저장되었습니다.']);
                                this.$el.trigger('update:grid');
                            }, this),
                            error: $.proxy(function (resp) {
                                this._saveErrorMessage(resp);
                            }, this)
                        });
                    }, this);
                    visibleContextMenu.push(menuItem);
                }, this);

                var contextMenu = _.clone(this._getContextMenu());
                contextMenu.push({label: worksLang["컴포넌트 표시여부"], tag: "columnMenu", children: visibleContextMenu});

                grid.setContextMenu(contextMenu);
            }, this);
        },
        /**
         * Override
         * @private
         */
        _setOnCopyEvent: function() {
            this.gridView.onCopy = $.proxy(function(grid, selection, event) {
                var selectionDatas = grid.getSelectionData();
                var clipboardData = "";
                _.each(selectionDatas, function(selectionData, index) {
                    var textDatas = [];
                    _.each(selectionData, function (value, key) {
                        var field = this.fields.findWhere({cid: key});
                        if (field.isStatusFieldType()) {
                            var statusView = this.columnDataView[value];
                            textDatas.push(statusView.options.statusLabel);
                        } else if (field.isSelectValueType()) {
                            var fieldOptions = field.get("options");
                            var fieldValues = value.split(",");
                            var labels = _.map(fieldValues, function (fieldValue) {
                                var fieldOption = _.findWhere(fieldOptions, {value: parseInt(fieldValue)});
                                return fieldOption ? fieldOption.displayText : "";
                            });
                            textDatas.push(_.compact(labels).join(","));
                        }
                        else {
                            textDatas.push($("<div></div>").html(value).text());
                        }
                    }, this);
                    clipboardData = clipboardData + textDatas.join("\t") + "\n";
                }, this);

                if (clipboardData) {
                    if (window.clipboardData) {
                        window.clipboardData.setData("Text", clipboardData);
                    } else {
                        event.clipboardData.setData('text/plain', clipboardData);
                    }
                }
                return false;
            }, this);
        },

        _renderMasking: function () {
            return (
                '<div class="hidden_data">' +
                '<span class="help" title="' + lang['관리자에 의해 마스킹 처리 된 항목입니다'] + '"></span>' +
                '</div>'
            );
        },

        _getGridColumns: function () {
            var columnFields = this.fields.getColumnFields();
            var fields = this.columnFields ?
                (new Fields(this.columnFields)).models :
                this.setting.getColumns(columnFields);

            fields = this._setMasking(fields);

            return _.map(fields, function (mergedField, index) {
                var label = mergedField.get("columnName") || mergedField.get("label");
                var isTitle = (index === this.setting.get('titleColumnIndex')) && mergedField.isTextValueType();
                var dataType = this._getDataType(mergedField.get('valueType'));
                var properties = this.getProperties(mergedField);
                var storedColumnWidth = GO.util.store.get(this.appletId + "-gridview-columnWidth");
                var fieldName = mergedField.get('cid');
                var columnWidth = (storedColumnWidth && storedColumnWidth[fieldName]) ?
                    storedColumnWidth[fieldName] : (isTitle) ? 300 : 150;
                var columnData = {
                    name: label,
                    fieldName: fieldName,
                    type: "data",
                    width: columnWidth,
                    sortable: false,//realgrid sortable 사용안함
                    useSort: true,
                    multiple: mergedField.get("multiple"),
                    dataType: dataType,
                    fillWidth: 0,
                    styleName: this._getColumnClass(mergedField, isTitle),
                    header: {text: label},
                    button: (isTitle) ? "none" : "action"
                };
                if ((fieldName === 'status')) {
                    columnData.editable = false;
                    columnData.renderer = 'renderer_view';
                } else if (isTitle || mergedField.isOrgType()) {
                    columnData.editable = false;
                    columnData.renderer = 'renderer_html';
                } else {
                    var fieldType = mergedField.get('fieldType');
                    var valueType = mergedField.get('valueType');
                    if (mergedField.isDateValueType() || mergedField.isDateTimeValueType()) {
                        var datetimeFormat = 'yyyy-MM-dd' + ((mergedField.isDateTimeValueType()) ? ' HH:mm' : '');
                        columnData.editor = {
                            type: 'date',
                            datetimeFormat: datetimeFormat,
                            mask: {
                                "definitions": {
                                    "a": "[1,2]",
                                    "b": "[0-9]",
                                    "c": "[0-1]",
                                    "d": "[0-3]",
                                    "e": "[0-2]",
                                    "f": "[0-5]",
                                    "g": "[0-9]"
                                },
                                "editMask": "abbb-cb-db" + ((mergedField.isDateTimeValueType()) ? " eb:fg" : ""),
                                "includedFormat": true, "overWrite": true, "allowEmpty": true
                            }
                        };
                        columnData.datetimeFormat = datetimeFormat;

                        if (fieldType == 'create_date' || fieldType == 'update_date') {
                            columnData.editable = false;
                        }
                    } else if (mergedField.isTimeValueType()) {
                        columnData.editor = {
                            mask: {
                                "definitions": {"b": "[0-2]", "c": "[0-9]", "d": "[0-5]", "e": "[0-9]"},
                                "editMask": "bc:de", "includedFormat": true, "overWrite": true, "allowEmpty": true
                            }
                        };
                        columnData.textFormat = "([0-9]{2})([0-9]{2});$1:$2";
                    } else if (fieldType == "select" || fieldType == "radio") {
                        var selectOptions = mergedField.get("options");
                        columnData.lookupDisplay = true;
                        columnData.editor = {
                            type: 'dropdown',
                            textReadOnly: true,
                            domainOnly: true,
                            dropDownCount: selectOptions.length
                        };
                        columnData.values = _.map(selectOptions, function (selectOption) {
                            return selectOption.value;
                        });
                        columnData.labels = _.map(selectOptions, function (selectOption) {
                            return selectOption.displayText;
                        });
                    } else if (fieldType == "checkbox" || fieldType == "listbox") {
                        var checkboxOptions = mergedField.get("options");
                        columnData.editor = {
                            type: 'checklist',
                            acceptText: '확인',
                            cancelText: '취소',
                            textReadOnly: true,
                            domainOnly: true,
                            dropDownCount: checkboxOptions.length
                        };
                        columnData.editButtonVisibility = 'rowfocused';
                        columnData.lookupDisplay = true;
                        columnData.valueSeparator = ",";
                        columnData.values = _.map(checkboxOptions, function (checkboxOption) {
                            return checkboxOption.value;
                        });
                        columnData.labels = _.map(checkboxOptions, function (checkboxOption) {
                            return checkboxOption.displayText;
                        });
                    } else if (mergedField.isNumberValueType()) {
                        if (properties.expressionType == "day" || properties.expressionType == "time") {
                            columnData.dataType = 'text';
                            columnData.editable = false;
                        } else if (properties.dataType == 'POINT') {
                            columnData.renderer = {
                                type: "html",
                                callback: function (grid, cell, w, h) {
                                    return mergedField.getPointTemplate(cell.value, properties);
                                }
                            };
                            columnData.width = (parseInt(properties.maxLength, 10) * 18) + 40;
                        } else if (properties.dataType == 'PERCENT') {
                            columnData.renderer = {
                                type: "html",
                                callback: function (grid, cell) {
                                    return mergedField.getPercentTemplate(cell.value);
                                }
                            };
                            columnData.width = 170;
                        } else {
                            if (properties.fixType) {
                                if (properties.fixType == 'prefix') {
                                    columnData.prefix = properties.unitText;
                                } else {
                                    columnData.suffix = properties.unitText;
                                }
                            }
                            if (properties.minLength) {
                                columnData.min = properties.minLength;
                            }
                            if (properties.maxLength) {
                                columnData.max = properties.minLength;
                            }
                            var numberFormat = (properties.thousandComma) ? "#,##0" : "###0";
                            if (properties.decimalPoints && properties.decimalPoints > 0) {
                                numberFormat += ".";
                                for (var i = 0; i < properties.decimalPoints; i++) {
                                    numberFormat += "#";
                                }
                            }
                            columnData.numberFormat = numberFormat;
                            columnData.styleName += " right-column";
                        }

                        if (!mergedField.get('isMasking') &&
                            (properties.expressionType != "day" && properties.expressionType != "time")) {
                            var summaryStyle = "number-summary" + " cid-" + columnData.fieldName;
                            columnData.headerSummaries = [{
                                height: 30,
                                expression: "sum",
                                numberFormat: numberFormat,
                                prefix: worksLang["합계"] + ":",
                                styleName: summaryStyle,
                                placeHolder: worksLang["합계"],
                                valueCallback: function (grid) {
                                    var dataCount = grid.getItemCount();
                                    var valueSum = 0;
                                    for (var i = 0; i < dataCount; i++) {
                                        var dataValue = grid.getValue(i, columnData.fieldName);
                                        if ($.isNumeric(dataValue)) {
                                            valueSum += dataValue;
                                        }
                                    }
                                    return valueSum;
                                }
                            }, {
                                numberFormat: numberFormat,
                                prefix: worksLang["평균"] + ":",
                                styleName: summaryStyle,
                                placeHolder: worksLang["평균"],
                                valueCallback: function (grid) {
                                    var dataCount = grid.getItemCount();
                                    var valueCount = 0;
                                    var valueSum = 0;
                                    for (var i = 0; i < dataCount; i++) {
                                        var dataValue = grid.getValue(i, columnData.fieldName);
                                        if ($.isNumeric(dataValue)) {
                                            valueCount += 1;
                                            valueSum += dataValue;
                                        }
                                    }
                                    return (valueCount > 0 && valueSum > 0) ? (valueSum / valueCount).toFixed(2) : 0;
                                }
                            }];
                        }
                    } else {
                        columnData.styleName += " left-column";
                    }

                    if (mergedField.isFieldMappingFieldType() || mergedField.isAppletDocValueType()
                        || mergedField.isDocNoType() || mergedField.isFormulaType()) {
                        columnData.editable = false;
                    }

                    if (mergedField.get('isMasking')) {
                        columnData.editable = false;
                        columnData.dataType = 'text';
                        columnData.renderer = 'renderer_html';
                    }
                }

                if (index == 0 && !columnData.headerSummaries) {
                    columnData.headerSummaries = [
                        {text: worksLang["현재 페이지 합계"], styleName: "rg-reader-summary"},
                        {text: worksLang["현재 페이지 평균"], styleName: "rg-reader-summary"}
                    ];
                }

                columnData.render = $.proxy(function (model) {
                    var additionalData = this._getAdditionalColumnData(model, isTitle);
                    return (mergedField.get('isMasking') && !model.isCreator(GO.session('id'))
                        ? this._renderMasking() : this.getColumnData(model, mergedField, isTitle, this.isContainsTemplate)) + additionalData;
                }, this);
                return columnData;
            }, this);
        },

        _getDataType: function (type) {
            if (type == VALUE_TYPE.NUMBER) {
                return this.DataType.NUMBER;
            } else {
                return this.DataType.TEXT;
            }
        },

        getColumnData: function (model, mergedField, isTitle, isContainsTemplate) {
            var classes = [];
            var columnData;
            var isMultiValued = _.contains(VALUE_TYPE.MULTI_VALUED_TYPES, mergedField.get('valueType'));
            if (isMultiValued) classes.push('item');

            if (mergedField.isOrgType()) {
                var values = model.get("values")[mergedField.get("cid")];
                return mergedField.getOrgTemplateValue(values, this.useProfile);
            } else {
                var properties = this.getProperties(mergedField);
                if (isContainsTemplate || mergedField.get('isMasking')) {
                    columnData = mergedField.getDisplayValueContainsTemplate(model, properties);
                } else {
                    columnData = mergedField.getValue(model, properties);
                }
                columnData = _.isArray(columnData) ? columnData : [columnData];

                if (isContainsTemplate) {
                    var numberOrAppletDocsType = (mergedField.isNumberValueType() || mergedField.isAppletDocsValueType());
                    var dataType = numberOrAppletDocsType ? properties.dataType : '';
                    var makeUlElement = false;
                    if (dataType == 'PERCENT' || dataType == 'POINT') {
                        makeUlElement = true;
                    }
                    if (makeUlElement) {
                        columnData = _.map(columnData, function (data) {
                            return classes.length ? '<li class="comp">' + _.unescape(data) + '</li>' : _.unescape(data);
                        }).join('');
                        if (classes.length) {
                            columnData = '<ul class="list_comp">' + columnData + '</ul>';
                        }
                    } else {
                        columnData = _.map(columnData, function (data) {
                            return classes.length ? '<span class="' + classes.join(' ') + '">' + _.unescape(data) + '</span>' : _.unescape(data);
                        }).join(', ');
                    }
                } else {
                    columnData = _.map(columnData, function (data) {
                        return _.unescape(data);
                    }).join(',');

                    if (isTitle) {
                        return '<a el-grid-list-item data-id="' + model.id + '" title="' + columnData + '">' + ((columnData) ? columnData : '-') + '</a>';
                    }
                }
            }
            return columnData;
        },

        getProperties: function (mergedField) {
            var properties;
            var integrationAppletId = null;
            var integrationAppletFields = null;
            var integrationProperties = null;
            if (mergedField.isFieldMappingFieldType() && mergedField.isNumberValueType()) {
                var integrationFieldCid = mergedField.get('properties').targetComponentCid;
                var integrationField = this.fields.findWhere({cid: integrationFieldCid});
                if (integrationField && integrationField.get('properties')) {
                    integrationAppletId = integrationField.get('properties').integrationAppletId;
                    integrationAppletFields = this.fieldsOfIntegrationApplet[integrationAppletId];
                    integrationProperties = integrationAppletFields.findWhere({cid: mergedField.get('properties').targetFieldCid});
                }
                properties = integrationProperties ? integrationProperties.get('properties') : {};
            } else if (mergedField.isAppletDocValueType()) {
                var mergedFieldProperties = mergedField.get('properties');
                if (mergedFieldProperties) {
                    integrationAppletId = mergedFieldProperties.integrationAppletId;
                    integrationAppletFields = this.fieldsOfIntegrationApplet[integrationAppletId];
                    integrationProperties = integrationAppletFields.findWhere({cid: mergedFieldProperties.integrationFieldCid});
                }
                properties = integrationProperties ? integrationProperties.get('properties') : {};
            } else {
                // 컴포넌트는 json 을 통으로 저장하는데 properties 는 나중에 추가된 속성이라서 저장된 field 에는 없을 수도 있다.
                properties = mergedField.get('properties') || this.fields.findWhere({cid: mergedField.get('cid')}).get('properties') || {};
            }
            return properties;
        },

        _getAdditionalColumnData: function (model, isTitle) {
            var isNewData;
            var columnData = '';
            if (GO.util.isCurrentDate(model.get('values').create_date, 1)) isNewData = true;
            if (isTitle && model.has('activityCount')) columnData += this._getActivityLabel(model.get('activityCount'), model.get('lastActivityCreatedAt'));
            if (isTitle && isNewData) columnData += ' <span class="ic_classic ic_new2"></span>';
            if (isTitle && this.usePopupView) columnData += this._getPopupView();
            return columnData;
        },

        _getColumnClass: function (mergedField, isTitle) {
            var className = "";
            if (isTitle) className = "subject left-column ";
            if (mergedField.get('isMasking')) className += "masking ";
            if (mergedField.isMultiValueType()) className += "item_wrap ";
            return className;
        },

        _getActivityLabel: function (activityCount, lastActivityCreatedAt) {
            if (GO.util.isCurrentDate(lastActivityCreatedAt, 1))
                var hasNewActivity = true;

            return [
                ' ',
                '<span class="btn_wrap btn_activity">',
                hasNewActivity ? '<span class="ic_classic ic_activvity on"></span>' : '<span class="ic_classic ic_activvity"></span>',
                '<span class="txt_b">', worksLang['활동기록'], '</span>',
                '<span class="num">', activityCount, '</span>',
                '</span>'
            ].join('');
        },

        _getPopupView: function () {
            return ' <span class="ic_classic ic_blank" data-el-document-popup title="' + commonLang['팝업보기'] + '" ' +
                'style="cursor:pointer"></span>';
        },

        _onClickDocPopup: function (e) {
            e.stopPropagation();
            var current = this.gridView.getCurrent();
            var docData = this.provider.getJsonRow(current.dataRow);

            var url = GO.contextRoot + 'app/works/applet/' + this.appletId + '/doc/' + docData.docId + '/popup';
            if (GO.util.isValidValue(this.subFormId)) {
                url += '/' + this.subFormId
            }
            window.open(url, "help", "width=1280,height=700,status=yes,scrollbars=yes,resizable=yes");
        },

        _changeColumnOrder: function (columnIds) {
            var settingId = parseInt(this.settingId);
            var setting = settingId ? this.settings.get(settingId) : null;
            var url = "api/works/applets/" + this.appletId + "/listview";
            url += (setting) ? "/my/" + settingId : "";
            url += "/columns/order";

            $.ajax({
                type: 'PUT',
                contentType: "application/json",
                url: GO.contextRoot + url,
                data: JSON.stringify({fieldCids: columnIds}),
                success: function () {
                    $.goMessage(commonLang['저장되었습니다.']);
                },
                error: $.proxy(function (resp) {
                    this._saveErrorMessage(resp);
                    this.$el.trigger('update:grid');
                }, this)
            });
        },

        _onSelectContextMenu: function(contextMenu) {
            if (contextMenu.tag == "showHeaderSummary") {
                setTimeout($.proxy(function() {
                    this._numberValueStats();
                },this), 100);
            }
        },

        _onClickCellButton: function(grid) {
            var current = grid.getCurrent();
            var docValue = this.provider.getJsonRow(current.dataRow);
            this.clickGridListItem(docValue.docId);
        },

        _onClickIndicator: function(grid) {
            var current = grid.getCurrent();
            var docValue = this.provider.getJsonRow(current.dataRow);
            this.clickGridListItem(docValue.docId);
        },

        _validateUpdateValue: function (validator, fieldType, value, properties) {
            var validationData = {};
            if (fieldType == FIELD_TYPE.RADIO || fieldType == FIELD_TYPE.SELECT) {
                validationData.count = 1;
            } else if (fieldType == FIELD_TYPE.DATETIME) {
                if (value != "") {
                    var dateTimeData = value.split(" ");
                    var dateValue = dateTimeData[0];
                    var timeValue = dateTimeData[1];
                    validationData.dateValue = dateValue;
                    validationData.timeValue = timeValue;
                }
            } else if (_.isArray(value)) {
                validationData.count = value.length;
            }
            validationData.value = value;

            return validator.validate(validationData, properties);
        },

        _makeUpdateValueFormat: function (field, value, docValue, properties) {
            var updateValue = {};
            updateValue[field.get('cid')] = field.convertDateTimeValue(value);

            if (field.isFormulaTargetType()) {
                var code = properties.code;
                var columnFields = this.fields.getColumnFields().models;
                var formulaFields = _.filter(columnFields, function (columnField) {
                    return columnField.isFormulaType();
                });

                _.each(formulaFields, function (formulaField) {
                    var formulaFieldProperties = this.getProperties(formulaField);
                    var codes = FormulaUtil.getExpressionCodes(formulaFieldProperties.expression);
                    if (_.contains(codes, code)) {
                        var valueDatas = [];
                        _.each(codes, function (currentCode) {
                            var currentField = this.fields.findByCode(currentCode);
                            var valueData = {
                                valueType: currentField.get('valueType'),
                                multiple: currentField.get('multiple'),
                                dataType: currentField.get('properties').dataType
                            };
                            if (currentCode == code) {
                                valueData.value = value;
                            } else {
                                valueData.value = docValue[currentField.get("cid")];
                            }
                            valueData.value = currentField.convertDateTimeValue(valueData.value);
                            valueDatas.push(valueData);
                        }, this);
                        updateValue[formulaField.get('cid')] = FormulaUtil.getFormulaValue(formulaFieldProperties, codes, valueDatas);
                    }
                }, this);
            }
            return updateValue;
        },

        _saveDataAndGridUpdate: function (docId, updateValue, grid, rowIndex) {
            var _this = this;
            $.ajax({
                type: 'PUT',
                contentType: "application/json",
                url: GO.contextRoot + "api/works/applets/" + this.appletId + "/docs/" + docId + "/values",
                data: JSON.stringify({values: updateValue}),
                success: $.proxy(function (response) {
                    $.goMessage(commonLang['저장되었습니다.']);
                    grid.cancel();
                    setTimeout(function () {
                        var responseValues = response.data.values;
                        _.each(responseValues, function (value, key, obj) {
                            var field = _this.fields.findWhere({cid: key});
                            if (field.isOrgType()) {
                                obj[key] = field.getOrgTemplateValue(value, _this.useProfile);
                            } else {
                                var formatValue = field.convertDateTimeAndNumberFormat(value, _this.getProperties(field));
                                obj[key] = (formatValue) ? formatValue : value;
                            }
                        });
                        _this.provider.updateRow(rowIndex, responseValues);
                    }, 100);
                    this.$el.trigger('update:chart');
                }, this),
                error: $.proxy(function (resp) {
                    this._saveErrorMessage(resp);
                    this.$el.trigger('update:grid');
                }, this)
            });
        },

        _numberValueStats: function () {
            var appletId = this.appletId;
            var query = this.collection.queryString;
            var $tooltipEl = this.$el.find("td.number-summary");

            var instances = $.tooltipster.instances($tooltipEl);
            if (instances.length > 0) {
                $.each(instances, function (i, instance) {
                    $(instance.elementOrigin()).data('loaded', false);
                    instance.destroy();
                });
            }
            $tooltipEl.tooltipster({
                content: 'Loading...',
                contentAsHTML: true,
                theme: 'tooltipster-borderless',
                updateAnimation: null,
                functionPosition: function (instance, helper, position) {
                    position.coord.top += 5;
                    return position;
                },
                functionBefore: function (instance, helper) {
                    var $origin = $(helper.origin);
                    var className = $origin.attr("class");
                    var classNames = className.split(" ");
                    var cidClassPrefix = "cid-";
                    var cidClasses = _.filter(classNames, function (className) {
                        return className.indexOf(cidClassPrefix) == 0;
                    });
                    if (!cidClasses || cidClasses.length == 0) {
                        return;
                    }
                    var cid = cidClasses[0].substring(cidClassPrefix.length);
                    if (!$origin.data('loaded')) {
                        $.get(makeUrlAndParam(appletId, query, cid), function (result) {
                            result = worksLang['전체'] + ' ' + worksLang['합계'] + ": " +
                                GO.util.formatNumber(result.data.sum) + "&nbsp;&nbsp;" +
                                worksLang['전체'] + ' ' + worksLang['평균'] + ": " +
                                GO.util.formatNumber(result.data.avg);

                            instance.content(result);
                            $origin.data('loaded', true);
                        }, "json");
                    }
                }
            });

            function makeUrlAndParam(appletId, query, cid) {
                return GO.contextRoot + "api/works/applets/" + appletId + "/component/stats?q=" +
                    encodeURIComponent(query || "") + "&aggCid=" + cid;
            }
        },
        _saveErrorMessage: function(resp) {
            if (resp.responseJSON.code == "403") {
                $.goError(commonLang['권한이 없습니다.']);
            } else {
                $.goError(commonLang['저장에 실패 하였습니다.']);
            }
        }
    });
});
