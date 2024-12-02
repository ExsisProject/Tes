define("works/components/report/models/table_model", function(require) {
    var worksLang = require('i18n!works/nls/works');

    return Backbone.Model.extend({
        initialize : function(options) {
            this.fieldCid = options.fieldCid;
            this.modelName = "table_model";
        },

        initialize: function (options) {
            this.appletId = options.appletId;

            this.set('title', options.title ? options.title : worksLang['새 테이블']);
            this.set('aggMethod', options.aggMethod ? options.aggMethod : 'COUNT');
            this.set('calculateField', options.calculateField);
            this.set('standardField', options.standardField);
            this.set('rangeOption', options.rangeOption);
            this.set('rowCount', options.rowCount ? options.rowCount : '5');
            this.set('direction', options.direction ? options.direction : 'ASC');
            this.set('subQuery', options.subQuery)
            this.set('q', options.q ? options.q : '');
        },

        url: function () {
            return GO.contextRoot + "api/works/applet/" + this.appletId + "/table?" + this._makeParam();
        },

        parse: function (response, options) {
            this.data = response.data;
            return this.data;
        },

        setQueryString : function(queryString) {
            this.set('q', queryString);
        },

        _makeParam: function () {
            var param = {
                aggMethod: this.get('aggMethod'),
                calculateCid: this.get('calculateField').cid,
                standardCid: this.get('standardField').cid,
                q: this.get('q')
            };

            if (this.get('rangeOption')) param["rangeOption"] = this.get('rangeOption');
            if (this.get('rowCount')) param["rowCount"] = this.get('rowCount');
            if (this.get('direction')) param["direction"] = this.get('direction');
            if (this.get('subQuery')) param["subQuery"] = this.get('subQuery');

            return $.param(param);
        },

        toJSON: function () {
            return {
                appletId: this.appletId,
                title: this.get('title'),
                aggMethod: this.get('aggMethod'),
                calculateField: this.get('calculateField'),
                standardField: this.get('standardField'),
                rangeOption: this.get('rangeOption'),
                rowCount: this.get('rowCount'),
                direction: this.get('direction'),
                subQuery: this.get('subQuery'),
                q: this.get('q')
            }
        }
    });
});