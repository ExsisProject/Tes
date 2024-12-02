define("works/components/report/view/table_preview", function(require) {
    var Backbone = require('backbone');

    var Template = require('hgn!works/components/report/template/table_preview');
    var EmptyTemplate = require('hgn!works/components/report/template/item_empty_preview');

    var worksLang = require("i18n!works/nls/works");
    var lang = {
        "COUNT": worksLang["개수"],
        "SUM": worksLang["합계"],
        "AVG": worksLang["평균"],
        "MAX": worksLang["최대값"],
        "MIN": worksLang["최소값"]
    }

    return Backbone.View.extend({
        initialize: function (options) {
            this.options = options || {};
            this.chartFields = options.chartFields;
        },

        render: function (isEmpty) {
            if (isEmpty) {
                this._renderEmptyPreview(worksLang['리포트 아이템 컴포넌트 삭제 경고']);
                return this;
            }

            var values = this.model.get('values');
            if (values.length < 1) {
                this._renderEmptyPreview(worksLang['표시할 데이터가 없습니다. 선택하신 기준컬럼과 보조컬럼을 확인해주세요.']);
                return this;
            }

            this.$el.empty();
            this.$el.append(Template({
                title: this.model.get('title'),
                aggMethodLang: lang[this.model.aggMethod]
            }));

            var keySet = this.model.get('keySet');
            var tableContent = '<tr>';
            var self = this;

            _.each(keySet, function (key) {
                var cid = self._getCidByKey(key);
                var field = self.chartFields.findByCid(cid).toJSON();
                tableContent += '<th class="col"><span class="title">';
                tableContent += field.label;
                tableContent += '</span></th>';
            });
            tableContent += '</tr>';

            _.each(values, function (value) {
                tableContent += '<tr>';
                _.each(keySet, function (key) {
                    tableContent += '<td class="col">';
                    tableContent += self._convertPrintFormat(value[key], key);
                    tableContent += '</td>';
                });
                tableContent += '</tr>';
            });

            this.$('[table-content-wrap]').append(tableContent);
            return this;
        },

        _renderEmptyPreview: function (msg) {
            this.$el.append(EmptyTemplate({
                lang: {'msg': msg}
            }));
        },

        _convertPrintFormat: function (value, key) {
            if (!value) {
                return '-';
            }

            var cid = this._getCidByKey(key);
            var method = this._getCidByMethod(key);
            var field = this.chartFields.findByCid(cid);
            if (!field) {
                return value;
            }

            //컴포넌트가 Number타입이 아니고 연산 결과 필드가 아니라면 포맷 변환을 하지 않는다.
            var valueType = field.get('valueType');
            if (!method && 'NUMBER' != valueType.toUpperCase()) {
                return value;
            }

            //연산식이 COUNT인 경우 소숫점은 존재하지 않는다.
            if (method && 'COUNT' == method.toUpperCase()) {
                return GO.util.formatNumber(value, {'decimalPoints':0});
            }

            var properties = field.get('properties');
            if (properties) {
                var dataType = properties.dataType ? properties.dataType : "NUMBER";
                if ("PERCENT" == dataType) {
                    return parseFloat(value).toFixed(0) + ' ' + '%';
                } else if ("POINT" == dataType) {
                    return parseFloat(value).toFixed(0);
                }

                var decimailConvert = parseFloat(value).toFixed(properties.decimalPoints);
                return GO.util.formatNumber(decimailConvert, {'decimalPoints':properties.decimalPoints});
            }

            return value;
        },

        _getCidByKey: function (key) {
            if (!key) {
                return '-';
            }

            if (key.indexOf('|') > 0) {
                return key.split('|')[0];
            }
            return key;
        },

        _getCidByMethod: function (key) {
            if (!key) {
                return '';
            }

            if (key.indexOf('|') > 1) {
                return key.split('|')[1];
            }

            return '';
        }
    });
});