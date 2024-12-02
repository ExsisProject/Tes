define("works/components/report/view/table_setting", function(require) {
    var DATE_ITEMS = ["DAY", "MONTH", "YEAR"];

    var Backbone = require('backbone');

    var NumberFormView = require("components/number_form/number_form");
    var TimeFormatItemTmpl = Hogan.compile('<option value="{{type}}">{{label}}</option>');
    var Template = require('hgn!works/components/report/template/table_setting');
    var SubQueryItem = require('hgn!works/components/report/template/table_setting_sub_query');

    var VALUE_TYPE = require("works/constants/value_type");

    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    var worksLang = require("i18n!works/nls/works");
    var reportLang = require("i18n!report/nls/report");

    var AggMethodOptionTemplate = Hogan.compile([
        '<option value="COUNT">{{{lang.개수}}}</option>',
        '<option value="SUM">{{{lang.합계}}}</option>',
        '<option value="AVG">{{{lang.평균}}}</option>',
        '<option value="MAX">{{{lang.최대값}}}</option>',
        '<option value="MIN">{{{lang.최소값}}}</option>'
    ].join(""));

    var lang = {
        "MINUTE" : worksLang["MINUTE"],
        "HOUR" : worksLang["HOUR"],
        "DAY" : worksLang["DAY"],
        "WEEK" : worksLang["WEEK"],
        "MONTH" : worksLang["MONTH"],
        "QUARTER" : worksLang["QUARTER"],
        "YEAR" : worksLang["YEAR"],
        "테이블 이름": worksLang['테이블 이름'],
        "집계 방식" : worksLang["집계 방식"],
        "정렬" : worksLang["정렬"],
        "개수" : worksLang["개수"],
        "합계" : worksLang["합계"],
        "평균" : worksLang["평균"],
        "최대값" : worksLang["최대값"],
        "최소값" : worksLang["최소값"],
        "미리보기" : reportLang["미리보기"],
        "내림차순으로 정렬" : worksLang["내림차순으로 정렬"],
        "오름차순으로 정렬" : worksLang["오름차순으로 정렬"],
        "항목이 삭제되었습니다 설명" : worksLang["항목이 삭제되었습니다 설명"],
        "기준 컬럼": worksLang["기준 컬럼"],
        "컬럼": worksLang["컬럼"],
        "보조 컬럼": worksLang["보조 컬럼"],
        "정렬 순서": adminLang["정렬 순서"],
        "삭제": commonLang["삭제"],
        "추가": commonLang["추가"]

    }

    //Table 셋팅을 위한 뷰
    return Backbone.View.extend({
        events : {
            "click [data-table-preview]" : "_onClickChartPreview",
            "click span[row-add]" : "_onClickAdd",
            "click span[row-delete]" : "_onClickDelete",
            "change #calculateCid" : "_onChangeCalculateCid",
            "change #standardCid" : "_onChangeStandardCid",
            "change select[sub_query_select]": "_onChangeSubQuery",
            "change #tableTitle" : "_validateTitle",
            "change input[el-row-count]": "_validateRowCount"

        },

        initialize: function (options) {
            this.appletId = options.appletId;
            this.chartFields = options.chartFields;
            this.numberFields = options.numberFields;
        },

        render: function () {
            this.$el.html(Template({
                lang : lang,
                title: this.model.get('title'),
                chartFields : this.chartFields.toJSON(), // fields
                numberFields : this.numberFields.toJSON(),
                hasChartFields : this.chartFields.length > 0,
                hasNumberFields : this.numberFields.length > 0
            }));

            this.$el.attr("data-table-cid", this.model.cid);

            this._renderTimeFormatItem();
            this._renderSubQueryItem();

            this.numberFormView = new NumberFormView({
                inputSelector : {"el-row-count" : ""}
            });
            this.numberFormView.setElement(this.$("[el-number-form-wrapper]"));
            this.numberFormView.render();
            this._setData();

            return this;
        },

        _setData : function() {
            this.$el.find("#aggMethod").val(this.model.get('aggMethod'));
            this.$el.find("#standardCid").val(this.model.get('standardField').cid);
            this.$el.find("#calculateCid").val(this.model.get('calculateField').cid);
            this.$el.find("#rangeOption").val(this.model.get('rangeOption'));
            this.$el.find("#direction").val(this.model.get('direction'));
            this.$el.find("[el-row-count]").val(this.model.get('rowCount'));

            this.$el.find('#calculateCid').trigger('change');
            this._toggleDateTimeView(this.model.get('standardField').valueType, 'rangeOption');
        },

        _renderTimeFormatItem : function() {
            var $postfix = this.$("select[data-postfix]");
            $postfix.empty();

            _.each(DATE_ITEMS, function(item) {
                $postfix.append(TimeFormatItemTmpl.render({
                    type : item,
                    label : lang[item]
                }));
            }, this);
        },

        _renderSubQueryItem: function () {
            var subQuerys = this.model.get('subQuery');
            if (!subQuerys) {
                return;
            }

            var self = this;
            _.each(JSON.parse(subQuerys), function (subQuery) {
                self._onClickAdd();

                var subQuerySelect = self.$('#subQueryWrap').last().find('select[data-cid]');
                subQuerySelect.val(subQuery.componentId);
                subQuerySelect.trigger('change');
                self.$('#subQueryWrap').last().find('select[data-method]').val(subQuery.method);
            });
        },

        isValid: function () {
            if (!this._validateTitle()) {
                return false;
            }

            if (!this._validateRowCount()) {
                return false;
            }
            return true;
        },

        _validateTitle: function () {
            var title = this.$el.find('#tableTitle').val();
            if (title.length < 1 || title.length > 20) {
                $.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1 : 1, arg2 : 20}), this.$("#tableTitle"), false, true);
                return false;
            }
            return true;
        },

        _validateRowCount: function () {
            var rowCount = parseInt(this.numberFormView.getValue());
            if (rowCount < 1 || 20 < rowCount) {
                $.goError(GO.i18n(worksLang["0이상 0이하로 입력해야합니다"], {arg1 : 1, arg2 : 20}),
                    this.$el.find("[el-row-count]"), false, true);
                return false;
            }
            return true;
        },

        save: function () {
            var title = this.$("#tableTitle").val();
            this.model.set('title', title);

            var rangeOption = this.$("#rangeOption").val();
            this.model.set('rangeOption', rangeOption);

            var aggMethod = this.$("#aggMethod").val();
            this.model.set('aggMethod', aggMethod);

            var calculateCid = this.$("#calculateCid").val();
            this.model.set('calculateField', this.chartFields.findByCid(calculateCid).toJSON());

            var direction = this.$("#direction").val();
            this.model.set('direction', direction);

            var rowCount = parseInt(this.numberFormView.getValue());
            this.model.set('rowCount', rowCount);

            var standardCid = this.$("#standardCid").val();
            var standardField = this.chartFields.findByCid(standardCid).toJSON();
            this.model.set('standardField', standardField);

            var subQuerys = [];
            _.each(this.$('#subQueryWrap').children('tr[sub_query]'), function (subQuery) {
                var cid = $(subQuery).find('select[data-cid]').val();
                var method = $(subQuery).find('select[data-method]').val();
                subQuerys.push({'method': method, 'componentId':cid});
            });
            this.model.set('subQuery', JSON.stringify(subQuerys));
        },

        _onChangeStandardCid: function() {
            var standardCid = this.$("#standardCid").val();
            var standardField = this.chartFields.findByCid(standardCid).toJSON();

            this._toggleDateTimeView(standardField.valueType, 'rangeOption');
        },

        _onChangeCalculateCid: function () {
            var calculateType = this.$el.find("#calculateCid :selected").attr('data-value-type');
            if ('NUMBER' === calculateType) {
                this.$el.find('#aggMethod').children().remove();
                this.$el.find('#aggMethod').append(AggMethodOptionTemplate.render({lang:lang}));
                this.$el.find('#aggMethod').val(this.model.get('aggMethod'));
            } else {
                this.$el.find("#aggMethod").children(':gt(0)').remove();
            }
        },

        _onChangeSubQuery: function (event) {
            var subQueryType = this.$(event.target.options[event.target.selectedIndex]).attr('data-value-type');
            var selector = this.$(event.target).closest('td').find('[data-method]');
            if ('NUMBER' === subQueryType) {
                selector.children().remove();
                selector.append(AggMethodOptionTemplate.render({lang:lang}));
            } else {
                selector.children(':gt(0)').remove();
            }
        },

        _onClickAdd: function () {
            this.$('[row-add]').hide();
            this.$('#subQueryWrap').append(SubQueryItem({
                lang: lang,
                chartFields : this.chartFields.toJSON(),
                hasNumberFields: this.numberFields.length > 0,
                hasChartFields : this.chartFields.length > 0
            }));
        },

        _onClickDelete: function (event) {
            this.$('[row-add]').show();
            $(event.target).closest('tr').remove();
        },

        /**
         *
         * @param valueType
         * @param key (rangeOption, subRangeOption)
         * @private
         */
        _toggleDateTimeView : function(valueType, key) {
            var $postfix = this.$('#' + key);
            var isDateFormatField = _.contains([VALUE_TYPE.DATE, VALUE_TYPE.DATETIME, VALUE_TYPE.TIME], valueType);
            var isTimeField = VALUE_TYPE.TIME === valueType;

            if (isDateFormatField) { // date, datetime, time
                if (isTimeField) { // time
                    $postfix.toggle(false);
                    this.model[key] = "HOUR";
                } else { // date, datetime
                    if (!$postfix.val()) {
                        $postfix.val('DAY');
                    }

                    $postfix.toggle(true);
                    this.model[key] = $postfix.val();
                }
            } else { // etc
                $postfix.toggle(false);
                this.model[key] = null;
            }
        },
    });
});