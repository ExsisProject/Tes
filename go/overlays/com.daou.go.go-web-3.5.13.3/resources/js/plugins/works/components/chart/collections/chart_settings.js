define("works/components/chart/collections/chart_settings", function (require) {
    var FIELD_TYPE = require("works/constants/field_type");

    var Chart = require("works/components/chart/models/chart_setting");

    var Collection = Backbone.Collection.extend({

        model: Chart,

        initialize: function (options) {
            this.collectionName = "charts";
        },

        setQueryString: function (queryString) {
            this.each(function (model) {
                model.set("queryString", queryString);
            });
        },
        /**
         * 삭제된 필드가 있는지 확인해서 세팅한다.
         */
        mergeFromFields: function (fieldsCollection) {
            this.each(function (model) {
                model.set("hasDeletedField", false);
                if (model.get("aggCid")) {
                    var aggField = fieldsCollection.findWhere({cid: model.get("aggCid")});
                    if (_.isUndefined(aggField)) model.set("hasDeletedField", true);
                }
                if (model.get("groupByCid")) {
                    var groupByField = fieldsCollection.findWhere({cid: model.get("groupByCid")});
                    var isPredefinedField = _.contains(FIELD_TYPE.PREDEFINED_TYPES, model.get("groupByCid"));
                    if (_.isUndefined(groupByField) && !isPredefinedField) model.set("hasDeletedField", true);
                }
                if (model.get("subGroupByCid")) {
                    var subGroupByField = fieldsCollection.findWhere({cid: model.get("subGroupByCid")});
                    var isPredefinedField = _.contains(FIELD_TYPE.PREDEFINED_TYPES, model.get("subGroupByCid"));
                    if (_.isUndefined(subGroupByField) && !isPredefinedField) model.set("hasDeletedField", true);
                }
            }, this);
        },

        triggerChangeDocs: function () {
            this.each(function (model) {
                model.trigger("change:docs");
            });
        },

        setChartsWithSeq: function (charts) {
            _.each(charts, function (chart, index) {
                chart.seq = index;
                this.push(chart);
            }, this);
        },

        reorder: function (cid, index) {
            var chart = this.get(cid);
            this.remove(chart, {silent: true});
            this.add(chart, {at: index});
        }
    });

    return Collection;
});
