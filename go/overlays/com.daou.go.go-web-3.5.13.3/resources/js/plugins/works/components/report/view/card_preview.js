define("works/components/report/view/card_preview", function(require) {
    var Backbone = require('backbone');

    var Template = require('hgn!works/components/report/template/card_preview');
    var EmptyTemplate = require('hgn!works/components/report/template/item_empty_preview');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");

    var lang = {
        "DONE" : commonLang["사용안함"],
        "ONE_YEAR_AGO" : worksLang["이전 연도"],
        "ONE_DAY_AGO" : worksLang["직전일"],
        "SAME_DAY" : worksLang["직전 동일 기간"],
        "CUSTOM" : adminLang["사용자 설정"],
        "ALL" : worksLang["전체기간"],
        "COUNT": worksLang["개수"],
        "SUM": worksLang["합계"],
        "AVG": worksLang["평균"],
        "MAX": worksLang["최대값"],
        "MIN": worksLang["최소값"],
        "대비": worksLang["대비"],
        "기간": commonLang['기간'],
        "리포트 아이템 컴포넌트 삭제 경고": worksLang['리포트 아이템 컴포넌트 삭제 경고']
    }

    return Backbone.View.extend({
        initialize: function (options) {
            this.options = options || {};
            this.model = options.model;
            this.selectField = options.selectField;
        },

        render: function (isEmpty) {
            if (isEmpty) {
                this._renderEmptyPreview();
                return this;
            }

            this._renderPreview();
            return this;
        },

        _renderPreview: function () {
            var compareRangeOption = this.model.get('compareRangeOption');
            var compareValueSubtract = this.model.get('compareValueSubtract');
            var compareValuePercent = this.model.get('compareValuePercent');

            var compareColor = 'red';
            if (compareValueSubtract < 0) {
                compareColor = 'blue';
            } else if (compareValueSubtract == 0) {
                compareColor = '#999';
            }

            this.$el.append(Template({
                lang: lang,
                title: this.model.get('title'),
                aggDate: this.model.getAggDate(),
                color: this.getColorByCode(this.model.get('color')),
                aggValue: GO.util.formatNumber(this.model.get('aggValue')),
                unitText: this._getUnitText(),
                isDone: 'DONE' == compareRangeOption,
                isCustom: 'CUSTOM' == compareRangeOption,
                compareRangeOption: lang[compareRangeOption],
                compareValue: GO.util.formatNumber(this.model.get('compareValue')),
                compareValueSubtract: (compareValueSubtract > 0 ? '+' : '') + GO.util.formatNumber(compareValueSubtract),
                compareValuePercent: (compareValuePercent > 0 ? '+' : '') + compareValuePercent,
                compareColor: compareColor,
                compareDate: this.model.get('compareDate')
            }));
        },

        _renderEmptyPreview: function () {
            this.$el.append(EmptyTemplate({
                lang: lang
            }));
        },

        _getUnitText: function () {
            if ('COUNT' === this.model.get('method')){
                return commonLang['개'];
            }

            if (!this.selectField) {
                return '';
            }

            var properties = this.selectField.properties;
            if (properties) {
                return properties.unitText;
            }

            return '';
        },

        getColorByCode : function (code) {
            if (2 == code) {
                return '#d06b64';
            } else if (3 == code) {
                return '#d75269';
            } else if (4 == code) {
                return '#fa573c';
            } else if (5 == code) {
                return '#ff7537';
            } else if (6 == code) {
                return '#ffad46';
            } else if (7 == code) {
                return '#42d692';
            } else if (8 == code) {
                return '#16a765';
            } else if (9 == code) {
                return '#7bd148';
            } else if (10 == code) {
                return '#b3dc6c';
            } else if (11 == code) {
                return '#fbe983';
            } else if (12 == code) {
                return '#fad165';
            } else if (13 == code) {
                return '#f691b2';
            } else if (14 == code) {
                return '#cd74e6';
            } else if (15 == code) {
                return '#9a9cff';
            } else if (16 == code) {
                return '#b99aff';
            } else if (17 == code) {
                return '#6691e5';
            } else if (18 == code) {
                return '#000000';
            } else {
                return '#905341';
            }
        }
    });
});