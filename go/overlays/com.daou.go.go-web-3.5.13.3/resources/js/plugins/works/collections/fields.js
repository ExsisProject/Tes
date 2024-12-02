/**
 * 향후 메소드 명명 규칙. 과거에 만들어진 메소드들은 차근차근 수정하자.
 * TextFieldTypeFields: field type 이 Text 인 fields
 * TextValueTypeFields: value type 이 Text 인 fields
 * TextTypeFields: appletDocs, text 와 같이 field type, value type 과 관계 없이 text 를 쓰고 있는 fields // 이름, 정의 애매함.
 */
define("works/collections/fields", function (require) {
    var BaseCollection = require('collections/base_collection');
    var Field = require("works/models/field");

    var FIELD_TYPE = require("works/constants/field_type");
    var VALUE_TYPE = require("works/constants/value_type");

    var instanceMap = {};

    return BaseCollection.extend({
        model: Field,

        initialize: function (models, options) {
            BaseCollection.prototype.initialize.call(this, options);
            options = options || {};
            this.collectionName = "filter_fields"; // debugging 용도
            this.appletId = options.appletId;
            this.subFormId = options.subFormId;
            this.includeProperty = options.includeProperty;
            this.includeDocNoAndProcess = options.includeDocNoAndProcess;
            this.type = options.type;
            this.fieldsOfIntegrationApplet = {};
        },

        url: function () {

            var partial = this.type ? '/' + this.type : '';
            var url = GO.contextRoot + "api/works/applets/" + this.appletId + partial + "/fields";
            if (GO.util.isValidValue(this.subFormId)) {
                url = url + '/' + this.subFormId;
            }
            if (this.includeProperty) url += '?p=true';
            if (this.includeDocNoAndProcess) {
                url += (this.includeProperty ? '&dp=true' : '?dp=true');
            }

            return url;
        },

        getFields: function (models) {
            var cIds = _.map(models, function (data) {
                return data.cid
            });

            var fields = cIds.map(function (cid) {
                return this.findByCid(cid);
            }, this);

            return this._clone(fields);
        },

        getFieldsOfIntegrationApplet: function () {
            var appletDocs = this.filter(function (field) {
                return field.get('valueType') === VALUE_TYPE.APPLETDOCS;
            });
            var integrationAppIds = _.uniq(_.compact(_.map(appletDocs, function (appletDoc) {
                var properties = appletDoc.get('properties') || {};
                return properties.integrationAppletId;
            })));

            var fetches = [];
            _.each(integrationAppIds, function (integrationAppletId) {
                var fields = new this.constructor([], {
                    appletId: integrationAppletId,
                    type: 'consumers',
                    includeProperty: true
                });
                this.fieldsOfIntegrationApplet[integrationAppletId] = fields;
                fetches.push(fields.fetch());
            }, this);

            var deferred = $.Deferred();
            $.when.apply($, fetches).done(_.bind(function () {
                deferred.resolve(this.fieldsOfIntegrationApplet);
            }, this)).fail(_.bind(function () {
                deferred.resolve(this.fieldsOfIntegrationApplet);
            }, this));

            return deferred;
        },

        /**
         * 연동 가능한 필드
         * GO-24299 연동 가능 필드에 숫자컴포넌트 추가
         */
        getLinkableFields: function () {
            var fields = this.filter(function (model) {
                return (
                    model.get('valueType') === VALUE_TYPE.APPLETDOCS
                    || (
                        model.get('valueType') === VALUE_TYPE.NUMBER
                        && model.get('fieldType') != FIELD_TYPE.FORMULA
                    )
                    || (
                        model.get('valueType') === VALUE_TYPE.STEXT
                        && model.get('fieldType') != FIELD_TYPE.DOCNO
                    )
                ) && !model._isMultiple();
            });
            return this._clone(fields);
        },

        /*
         * 데이터 연동 연동 시 검색 노출 가능한 필드
         */
        getDisplayFields: function () {
            var fields = this.filter(function (model) {
                return _.contains(FIELD_TYPE.APPLETDOC_DISPLAY_FIELD_TYPES, model.get("fieldType")) && !model._isMultiple();
            }, this);
            return this._clone(fields);
        },

        /**
         * 데이터 연동 컴포넌트 producer 앱 검색
         * GO-24874 연동필드 검색은 숫자컴포넌트는 미지원
         */
        getLinkableTextFields: function () {
            var fields = this.filter(function (model) {
                return (model.get('valueType') === VALUE_TYPE.STEXT || model.get('valueType') === VALUE_TYPE.APPLETDOCS) && !model._isMultiple();
            });
            return this._clone(fields);
        },

        getUserFields: function () {
            var fields = this.filter(function (model) {
                return model.get('valueType') === VALUE_TYPE.USERS;
            });
            return this._clone(fields);
        },

        getUserFieldsExceptMappingFields: function () {
            var fields = this.filter(function (model) {
                return model.get('valueType') === VALUE_TYPE.USERS && model.get('fieldType') !== FIELD_TYPE.FIELD_MAPPING;
            });
            return this._clone(fields);
        },

        getFilterFields: function () {
            var fields = this.filter(function (model) {
                return _.contains(FIELD_TYPE.FILTER_FIELD_TYPES, model.get("fieldType"));
            }, this);
            return this._clone(fields);
        },

        getColumnFields: function () {
            var fields = this.filter(function (model) {
                return _.contains(FIELD_TYPE.COLUMN_FIELD_TYPES, model.get("fieldType")) && !model._isMultiple();
            }, this);
            return this._clone(fields);
        },

        getChartFields: function () {
            var fields = this.filter(function (model) {
                return _.contains(FIELD_TYPE.CHART_FIELD_TYPES, model.get("fieldType")) && !model._isMultiple();
            }, this);
            return this._clone(fields);
        },

        getNumberFields: function () {
            var numberFields = this.filter(function (model) {
                return (VALUE_TYPE.NUMBER == model.get("valueType")) && !model._isMultiple();
            });
            return this._clone(numberFields);
        },

        getListenableFields: function () {
            var fields = this.filter(function (model) {
                return _.contains(FIELD_TYPE.LISTENABLE_TYPES, model.get('fieldType')) && !model.get('multiple');
            });
            return this._clone(fields);
        },

        /**
         * 연동항목 매핑이 가능한 필드 반환
         */
        getMappableFields: function () {
            var fields = this.filter(function (model) {
                return _.contains(FIELD_TYPE.MAPPABLE_TYPES, model.get("fieldType")) && !model._isMultiple();
            }, this);
            return this._clone(fields);
        },

        findByKeyword: function (keyword) {
            if (!keyword) return [];

            return this.filter(function (model) {
                return model.get("label").indexOf(keyword) > -1;
            });
        },

        unuseAllField: function () {
            this.each(function (field) {
                field.set("isUsed", false);
            });
        },

        mergeFromConditions: function (conditions) {
            this.each(function (field) {
                var fieldCids = _.map(conditions, function (condition) {
                    return condition.fieldCid;
                });
                var isUsed = _.contains(fieldCids, field.get("cid"));
                field.set("isUsed", isUsed);
            });
        },

        /**
         * 필드를 바탕으로 컬럼 추출.
         *
         * 컬럼은 있지만 필드가 없는경우 -> 컬럼으로 추가했지만 필드가 사라진경우. 컬럼값 무시.
         * 필드는 있지만 컬럼이 없는경우 -> 컬럼으로 사용 안하는 필드
         *
         * 컬럼으로부터 columnName 을 가져오기 위해 merge 한다
         *
         */
        mergeFromColumns: function (columns) {

            var fieldCids = _.map(columns, function (column) {
                return column.fieldCid;
            });

            this.each(function (field) {
                var isUsed = _.contains(fieldCids, field.get('cid'));
                field.set('isUsed', isUsed);
            });
        },

        getPropertyByFieldCid: function (cid) {
            if (!cid) return null;

            var field = this.findWhere({cid: cid});
            if (field && field.get('cid')) return field.get('cid');

            return null;
        },

        hasFieldByCid: function (fieldCid) {
            var field = this.findWhere({cid: fieldCid});
            return _.isObject(field);
        },

        findByLabel: function (label) {
            return this.findWhere({label: label});
        },

        findByCid: function (cid) {
            return this.findWhere({cid: cid});
        },

        findByCode: function (code) {
            return this.find(function (field) {
                var properties = field.get('properties') || {};
                return properties.code == code;
            }, this);
        },

        getMappingFields: function () {
            var fields = this.filter(function (field) {
                return _.contains([
                        VALUE_TYPE.STEXT, VALUE_TYPE.TEXT, VALUE_TYPE.NUMBER, VALUE_TYPE.SELECT, VALUE_TYPE.SELECTS,
                        VALUE_TYPE.DATE, VALUE_TYPE.TIME, VALUE_TYPE.DATETIME, VALUE_TYPE.FILES, VALUE_TYPE.USER, VALUE_TYPE.USERS,
                        VALUE_TYPE.DEPTS, VALUE_TYPE.APPLETDOCS
                    ], field.get('valueType')) && !this._irreplaceableInValueType(field)
                    && field.get('fieldType') !== FIELD_TYPE.FIELD_MAPPING && field.get('fieldType') !== FIELD_TYPE.FORMULA;
            }, this);
            var clone = this.clone();
            return clone.reset(fields);
        },

        getOpenApiFields: function () {
            var fields = this.filter(function (field) {
                return _.contains([
                        VALUE_TYPE.STEXT, VALUE_TYPE.TEXT, VALUE_TYPE.NUMBER, VALUE_TYPE.SELECT, VALUE_TYPE.SELECTS,
                        VALUE_TYPE.DATE, VALUE_TYPE.TIME, VALUE_TYPE.DATETIME
                    ], field.get('valueType')) && !this._irreplaceableInValueType(field)
                    && field.get('fieldType') !== FIELD_TYPE.FIELD_MAPPING && field.get('fieldType') !== FIELD_TYPE.FORMULA;
            }, this);
            var clone = this.clone();
            return clone.reset(fields);
        },

        getAvailableMappingFields: function (targetFieldModel) {
            var valueType = targetFieldModel.get('valueType');
            var isMultiple = targetFieldModel.get('multiple');
            var clone = this.clone();
            var fields = {
                STEXT: this._getMappingFieldsOfSText(isMultiple),
                TEXT: this._getMappingFieldsOfText(),
                NUMBER: this._getMappingFieldsOfNumber(isMultiple),
                SELECT: this._getMappingFieldsOfSelect(isMultiple), // selectbox 만 테이블에 들어갈 수 있다.
                SELECTS: this._getMappingFieldsOfSelects(),
                DATE: this._getMappingFieldsOfDate(isMultiple),
                TIME: this._getMappingFieldsOfTime(isMultiple),
                DATETIME: this._getMappingFieldsOfDateTime(isMultiple),
                FILES: this._getMappingFieldsOfFiles(),
                USERS: this._getMappingFieldsOfUsers(),
                USER: this._getMappingFieldsOfUser(),
                DEPTS: this._getMappingFieldsOfDepts(),
                APPLETDOCS: this._getMappingFieldsOfAppletDocs(targetFieldModel)
            }[valueType];

            return clone.reset(fields);
        },

        getMaskableFields: function () {
            var fields = this.filter(function (field) {
                return _.contains(VALUE_TYPE.MASKABLE_TYPES, field.get('valueType')) || FIELD_TYPE.FIELD_MAPPING === field.get('fieldType');
            }, this);
            var clone = this.clone();
            return clone.reset(fields);
        },

        rejectFields: function (fieldCids) {
            var fields = this.reject(function (field) {
                return _.contains(fieldCids, field.get('cid'));
                //return !(_.contains(VALUE_TYPE.MASKABLE_TYPES, field.get('valueType')) || FIELD_TYPE.FIELD_MAPPING === field.get('fieldType'));
            }, this);
            var clone = this.clone();
            return clone.reset(fields);
        },

        _getMappingFieldsOfSText: function (isMultiple) {
            return this.filter(function (field) {
                return _.contains([
                    VALUE_TYPE.STEXT, VALUE_TYPE.NUMBER, VALUE_TYPE.SELECT, VALUE_TYPE.SELECTS,
                    VALUE_TYPE.USERS, VALUE_TYPE.DEPTS, VALUE_TYPE.APPLETDOCS
                ], field.get('valueType')) && !this._irreplaceableInValueType(field) && this._tableValidation(field, isMultiple);
            }, this);
        },

        _getMappingFieldsOfText: function () {
            return this.filter(function (field) {
                return _.contains([
                    VALUE_TYPE.STEXT, VALUE_TYPE.TEXT, VALUE_TYPE.NUMBER, VALUE_TYPE.SELECT,
                    VALUE_TYPE.SELECTS, VALUE_TYPE.USERS, VALUE_TYPE.DEPTS, VALUE_TYPE.APPLETDOCS
                ], field.get('valueType')) && !this._irreplaceableInValueType(field);
            }, this);
        },

        _getMappingFieldsOfNumber: function (isMultiple) {
            return this.filter(function (field) {
                return _.contains([
                    VALUE_TYPE.NUMBER
                ], field.get('valueType')) && this._tableValidation(field, isMultiple);
            }, this);
        },

        _getMappingFieldsOfSelect: function (isMultiple) {
            return this.filter(function (field) {
                return _.contains([
                    VALUE_TYPE.SELECT
                ], field.get('valueType')) && !this._irreplaceableInValueType(field) && this._tableValidation(field, isMultiple);
            }, this);
        },

        _getMappingFieldsOfSelects: function () {
            return this.filter(function (field) {
                return _.contains([
                    VALUE_TYPE.SELECT, VALUE_TYPE.SELECTS
                ], field.get('valueType')) && !this._irreplaceableInValueType(field);
            }, this);
        },

        _getMappingFieldsOfDate: function (isMultiple) {
            return this.filter(function (field) {
                return _.contains([
                    VALUE_TYPE.DATE, VALUE_TYPE.DATETIME
                ], field.get('valueType')) && !this._irreplaceableInValueType(field) && this._tableValidation(field, isMultiple);
            }, this);
        },

        _getMappingFieldsOfTime: function (isMultiple) {
            return this.filter(function (field) {
                return _.contains([
                    VALUE_TYPE.TIME, VALUE_TYPE.DATETIME
                ], field.get('valueType')) && !this._irreplaceableInValueType(field) && this._tableValidation(field, isMultiple);
            }, this);
        },

        _getMappingFieldsOfDateTime: function (isMultiple) {
            return this.filter(function (field) {
                return _.contains([
                    VALUE_TYPE.DATETIME
                ], field.get('valueType')) && this._tableValidation(field, isMultiple);
            }, this);
        },

        _getMappingFieldsOfFiles: function () {
            return this.filter(function (field) {
                return _.contains([VALUE_TYPE.FILES], field.get('valueType'));
            }, this);
        },

        _getMappingFieldsOfUsers: function () {
            return this.filter(function (field) {
                return _.contains([VALUE_TYPE.USERS, VALUE_TYPE.USER], field.get('valueType'));
            }, this);
        },

        _getMappingFieldsOfUser: function () {
            return this.filter(function (field) {
                return _.contains([VALUE_TYPE.USER], field.get('valueType'));
            }, this);
        },

        _getMappingFieldsOfDepts: function () {
            return this.filter(function (field) {
                return _.contains([VALUE_TYPE.DEPTS], field.get('valueType'));
            }, this);
        },

        /**
         * 데이터 연동 컴포넌트는 동일한 애플릿 이면서 동일한 데이터 연동 컴포넌트인 경우만 허용한다.
         * @param targetFieldModel
         * @param isSameApplet
         * @returns {*}
         * @private
         */
        _getMappingFieldsOfAppletDocs: function (targetField) {
            return this.filter(function (sourceField) {
                var sourceProperties = sourceField.get('properties') || {};
                var targetProperties = targetField.get('properties') || {};
                return _.contains([VALUE_TYPE.STEXT, VALUE_TYPE.SELECT], sourceField.get('valueType'))
                    && !this._irreplaceableInValueType(sourceField)
                    || (sourceField.get('valueType') === VALUE_TYPE.APPLETDOCS
                        && sourceProperties.integrationAppletId === targetProperties.integrationAppletId
                        && sourceProperties.integrationFieldCid === targetProperties.integrationFieldCid)
            }, this);
        },

        /**
         * valueType 으로 대체 불가능한 필드들
         */
        _irreplaceableInValueType: function (field) {
            return _.contains(FIELD_TYPE.IRREPLACEABLE_IN_VALUE_TYPES, field.get('fieldType'));
        },

        /**
         * TODO method Name
         *
         * 테이블    ->    테이블 (O)
         * 비테이블 ->    테이블 (O)
         * 비테이블 ->    비테이블 (O)
         * 테이블    ->    비테이블 (X)
         */
        _tableValidation: function (sourceField, isMultipleTarget) {
            return isMultipleTarget || !sourceField._isMultiple();
        },

        _clone: function (models) {
            var clone = this.clone();
            return clone.reset(models);
        },

        pick: function (keys) {
            return this._clone(this.map(function (field) {
                return _.pick(field.toJSON(), keys);
            }));
        }
    }, {
        getFieldsByAppletId: function (appletId) {
            var fields = instanceMap[appletId];
            if (!fields) {
                fields = new this([], {appletId: appletId});
                instanceMap[appletId] = fields;
            }
            return fields;
        }
    });
});
