define(function(require) {
    var MatrixCollection = require('matrix/collections/matrix_collection');
    return MatrixCollection.extend({

        url: function() {
            return GO.contextRoot + 'api/asset/' + this.assetId + '/items/daily?fromDate=' + encodeURIComponent(this.fromDate);
        },

        parse: function(resp) {
            var group = _.groupBy(resp.data, function(reservation) {
               return reservation.itemId;
            });

            return _.map(this.rows, function(row) {
                var items = group[row.key] || [];
                return {
                    rowKey: row.key,
                    rowTitle: row.label,
                    values: this.initMatrixItems(items, {modelUrl: this.modelUrl})
                }
            }, this);
        },

        setAssetId: function(assetId) {
            this.assetId = assetId;
        },

        setFromDate: function(fromDate) {
            this.fromDate = fromDate;
        },

        changeTimeCallback: function() {
            this.setFromDate(this.matrix.get('startTime'));
            this.fetch();
        }
    });
});