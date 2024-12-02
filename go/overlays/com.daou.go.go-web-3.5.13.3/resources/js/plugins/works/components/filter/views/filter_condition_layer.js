/**
 * "조건추가" 버튼과 "조건" 버튼에서 함께 사용한다.
 * "조건추가" 버튼에서는 field 들을 그려주고 "조건" 버튼에서는 condition option 들을 그려준다.
 *
 * "조건추가" 버튼은 model이 없다.
 */

define("works/components/filter/views/filter_condition_layer", function (require) {

    require("jquery.go-orgslide");

    var commonLang = require("i18n!nls/commons");
    var lang = {
        "확인": commonLang["확인"],
        "취소": commonLang["취소"]
    };

    var VALUE_TYPE = require("works/constants/value_type");

    var BackdropView = require("components/backdrop/backdrop");
    var DateFormView = require("components/date_form/views/date_form");

    var ConditionOption = require("works/components/filter/models/filter_condition_option");

    var CheckableSelectView = require("works/components/filter/views/filter_checkable_select");
    var TextFormView = require("works/components/filter/views/filter_text_form");
    var IntegrationView = require("works/components/filter/views/filter_integration");
    var NumberFormView = require("works/components/filter/views/filter_number_form");

    var FilterConditionLayerTmpl = require("hgn!works/components/filter/templates/filter_condition_layer");

    return BackdropView.extend({

        className: "array_option form_box_basic",

        initialize: function (options) {
            // valueType도 필요해서 가독성 차원에서 fieldType으로 이름 변경
            this.fieldType = options.fieldType || options.type; // @deprecated
            this.valueType = options.valueType || options.type;
            this.parentCid = options.parentCid;
            this.fields = options.fields;
            this.useCheckbox = options.useCheckbox !== false;
            this.zIndex = options.zIndex;

            this.backdropToggleEl = this.$el;
            this.bindBackdrop();

            this.contentView = null;

            this.$el.on("onClickOption", $.proxy(function (event, isChecked) {
                this._onClickOption(isChecked);
            }, this));
        },

        events: {
            "click a[el-type='submit']": "_onClickSubmit",
            "click a[el-type='cancel']": "_onClickCancel"
        },

        render: function () {
            this.$el.html(FilterConditionLayerTmpl({
                lang: lang,
                isAppletDocsType: this._isAppletDocsTypeLayer(),
                isDateType: this._isDateTypeLayer(),
                useFooter: this._isSelectTypeConditionLayer() ? false : true
            }));

            this._renderFromValueType();
            return this;
        },

        afterShow: function () {
            if (!this._isImpossibleFocusLayer()) {
                this.$("input[type='text']:first").focus();
            }

            if (this._isOrgTypeLayer()) {
                var type = this._isUserTypeLayer() ? 'list' : 'department';
                setTimeout($.proxy(function () {
                    this.orgSlide = $.goOrgSlide({
                        type: type,
                        zIndex: this.zIndex,
                        contextRoot: GO.contextRoot,
                        callback: $.proxy(function (info) {
                            this._orgCallback(info);
                        }, this)
                    });
                    this.linkBackdrop($('.layer_organogram'));
                }, this), 200);
            }
        },

        afterHide: function () {
            if (this._isOrgTypeLayer()) {
                this.orgSlide = $.goOrgSlide("close");
            }
            if (this._isSelectTypeConditionLayer()) {
                this.$("[el-search]").val("").trigger("keyup");
            }
            if (this._isAppletDocsTypeLayer()) {
                this.contentView.getPopupEl() ? this.contentView.getPopupEl().remove() : false;
            }
        },


        _renderFromValueType: function () {
            switch (this.valueType) {
                case VALUE_TYPE.STEXT:
                case VALUE_TYPE.STEXTS:
                case VALUE_TYPE.TEXT:
                case VALUE_TYPE.FILES:
                    this._renderTextFormView();
                    break;
                case VALUE_TYPE.APPLETDOCS:
                    this._renderIntegrationView();
                    break;
                case VALUE_TYPE.NUMBER:
                    this._renderNumberFormView();
                    break;
                case VALUE_TYPE.DATE:
                    this._renderDateFormView();
                    break;
                case VALUE_TYPE.TIME:
                    this._renderTimeFormView();
                    break;
                case VALUE_TYPE.DATETIME:
                    this._renderDatetimeFormView();
                    break;
                case VALUE_TYPE.SELECT:
                case VALUE_TYPE.SELECTS:
                    this._renderCheckableSelectView();
                    break;
                case VALUE_TYPE.USER:
                case VALUE_TYPE.USERS:
                case VALUE_TYPE.DEPTS:
                    this._renderNoSearchCheckableSelectView();
                    break;
            }
        },

        _renderIntegrationView: function () {
            this.contentView = new IntegrationView({
                fields: this.fields,
                hasRelativeView: true,
                model: this.model
            });
            this.$el.addClass('array_opt_linkage');
            this.$("[el-applet-docs-form-wrapper]").addClass("wrap_box_small");
            this.$("[el-applet-docs-form]").html(this.contentView.render().el);
            this.contentView.$el.on('showPopup', $.proxy(function () {
                this.linkBackdrop(this.contentView.getPopupEl());
            }, this));
        },

        _renderTextFormView: function () {
            this.contentView = new TextFormView({
                model: this.model
            });
            this.$el.prepend(this.contentView.render().el);
        },

        _renderNumberFormView: function () {
            this.contentView = new NumberFormView({
                model: this.model
            });
            this.$el.prepend(this.contentView.render().el);
        },

        _renderDateFormView: function () {
            this.contentView = new DateFormView({
                dateTime: this.model.valuesToDateTime(),
                hasTime: false,
                hasRelativeView: true,
                values: this.model.get("values"),
                isRelative: this.model.isRelativeType(),
                externalModel: this.model
            });
            this.$("[el-date-form-wrapper]").addClass("wrap_box_large");
            this.$("[el-date-form]").html(this.contentView.render().el);
            this.linkBackdrop($("#ui-datepicker-div"));
        },

        _renderDatetimeFormView: function () {
            this.contentView = new DateFormView({
                dateTime: this.model.valuesToDateTime(),
                hasRelativeView: true,
                isRelative: this.model.isRelativeType(),
                values: this.model.get("values"),
                externalModel: this.model
            });
            this.$("[el-date-form-wrapper]").addClass("wrap_box_large time_date_option");
            this.$("[el-date-form]").html(this.contentView.render().el);
            this.linkBackdrop($("#ui-datepicker-div"));

            //달력레이어의 좌우버튼
            if ($("a.ui-datepicker-prev").length == 0) {
                this.linkBackdrop($("a.ui-datepicker-prev"));
                this.linkBackdrop($("a.ui-datepicker-next"));
            }
        },

        _renderTimeFormView: function () {
            this.contentView = new DateFormView({
                dateTime: this.model.valuesToDateTime(),
                hasDate: false,
                externalModel: this.model
            });
            this.$("[el-date-form-wrapper]").addClass("wrap_box_small time_date_option");
            this.$("[el-date-form]").html(this.contentView.render().el);
        },

        _renderCheckableSelectView: function () {
            /**
             * fieldMananger : model 이 없다. fields 를 collection 으로 사용한다.
             * 조건추가 버튼, 컬럼추가 버튼 이 fieldManager 에 해당한다.
             */
            this.contentView = new CheckableSelectView({
                useScroll: true,
                collection: this.collection,
                useCheckbox: this.useCheckbox
            });
            this.$el.prepend(this.contentView.render().el);
        },

        _renderNoSearchCheckableSelectView: function () {
            this.contentView = new CheckableSelectView({
                useScroll: true,
                collection: this.collection,
                useSearchForm: false,
                valueType: this.valueType
            });
            this.$el.prepend(this.contentView.render().el);
        },

        _orgCallback: function (info) {
            var model = new ConditionOption({
                value: info.id,
                label: info.name,
                isUsed: true,
                isOrgType: true
            });
            this.contentView.collection.addOption(model);
        },

        _onClickSubmit: function (e) {
            e.stopPropagation();

            // TODO: 각 contentView에 validation 체크를 위임할 수 있는 공통 인터페이스 작업 필요
            // 별로 좋은 방법은 아니지만, 현재로서는 변경을 최소화하면서 validation을 체크할 수 있는 방법이다.
            if (typeof this.contentView.isValid == "function" && !this.contentView.isValid()) {
                return false;
            }

            if (typeof this.contentView.setModel == "function") {
                this.contentView.setModel();
            }
            this.$el.trigger("setLabelText");
            this.$el.trigger("changeFilter");

            this.toggle(false);
        },

        _onClickCancel: function (e) {
            e.stopPropagation();

            if (typeof this.contentView.resetView == "function") {
                this.contentView.resetView();
            }

            this.toggle(false);
        },

        _onClickOption: function (isChecked) {
            if (this._isFieldManager() && isChecked) this.toggle(false);
        },

        /**
         * 사용자 타입 레이어인지 반환
         *
         * 필드매핑 컴포넌트가 추가되면서 field type으로만 체크하는 것에 한계가 발생하여,
         * value type으로 체크하는 것으로 변경
         *
         * @returns {boolean}
         * @private
         */
        _isUserTypeLayer: function () {
            return _.contains([VALUE_TYPE.USER, VALUE_TYPE.USERS], this.valueType);
        },

        /**
         * 부서 타입 레이어인지 반환
         *
         * 필드매핑 컴포넌트가 추가되면서 field type으로만 체크하는 것에 한계가 발생하여,
         * value type으로 체크하는 것으로 변경
         *
         * @returns {boolean}
         * @private
         */
        _isDeptTypeLayer: function () {
            return VALUE_TYPE.DEPTS == this.valueType;
        },

        _isOrgTypeLayer: function () {
            return this._isUserTypeLayer() || this._isDeptTypeLayer();
        },

        /**
         * 선택 타입 레이어인지 반환
         *
         * [대상 필드타입 목록]
         * - CHECKBOX => SELECTS
         * - LISTBOX => SELECTS
         * - RADIO => SELECT
         * - SELECT => SELECT
         * - STATUS => value type 없음
         *
         * - ORG => USERS
         * - DEPT => DEPTS
         * - CREATOR => USER
         * - UPDATER => USER
         *
         * @returns {boolean}
         * @private
         */
        _isSelectTypeConditionLayer: function () {
            return _.contains([VALUE_TYPE.SELECT, VALUE_TYPE.SELECTS, VALUE_TYPE.USER, VALUE_TYPE.USERS, VALUE_TYPE.DEPTS], this.valueType);
        },

        /**
         * 시간 타입 레이어인지 반환
         *
         * 필드매핑 컴포넌트가 추가되면서 field type으로만 체크하는 것에 한계가 발생하여,
         * value type으로 체크하는 것으로 변경
         *
         * @returns {boolean}
         * @private
         */
        _isDateTypeLayer: function () {
            return _.contains([VALUE_TYPE.DATE, VALUE_TYPE.TIME, VALUE_TYPE.DATETIME], this.valueType);
        },

        /**
         * 데이터연동 타입 레이어인지 반환
         *
         * 필드매핑 컴포넌트가 추가되면서 field type으로만 체크하는 것에 한계가 발생하여,
         * value type으로 체크하는 것으로 변경
         *
         * @returns {boolean}
         * @private
         */
        _isAppletDocsTypeLayer: function () {
            return _.contains([VALUE_TYPE.APPLETDOCS], this.valueType);
        },

        /**
         * 기본 포커스를 사용하지 않는 것인지 반환
         *
         * 필드매핑 컴포넌트가 추가되면서 field type으로만 체크하는 것에 한계가 발생하여,
         * value type으로 체크하는 것으로 변경
         *
         * @returns {boolean}
         * @private
         */
        _isImpossibleFocusLayer: function () {
            return _.contains([VALUE_TYPE.DATE, VALUE_TYPE.DATETIME, VALUE_TYPE.APPLETDOCS], this.valueType);
        },

        _isFieldManager: function () {
            return !_.isObject(this.model);
        }
    });
});
