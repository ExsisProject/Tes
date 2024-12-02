define(function(require) {
    var moment = require('moment');
    var Backbone = require('backbone');
    var MatrixItems = require('matrix/collections/matrix_items');
    var MatrixItem = require('matrix/models/matrix_item');
    return Backbone.Collection.extend({

        initMatrixItems: function(models, options) {
            options = options || {};
            return new MatrixItems(models, _.extend(options, {
                matrix: this.matrix,
                model: MatrixItem
            }));
        },

        setMatrix: function(matrix) {
            this.matrix = matrix;
        },

        setRows: function(rows) {
            this.rows = rows;
        },

        prev: function() {
            this._changeTimes(-1);
        },

        next: function() {
            this._changeTimes(1);
        },

        today: function() {
            this._changeTimes(this._calculateDateDiff());
        },

        changeTime: function(date) {
            this._changeTimes(this._calculateDateDiff(date));
        },

        changeTimeCallback: function() {},

        _calculateDateDiff: function(date) {
            date = date || new Date();
            var interval = this.matrix.get('navigationInterval');
            var startOfDayStartTime = moment(this.matrix.get('startTime')).startOf(interval);

            return moment(date).startOf(interval).diff(startOfDayStartTime, interval);
        },

        _changeTimes: function(coefficient) {
            var startTime = this.matrix.get('startTime');
            var endTime = this.matrix.get('endTime');

            var newStartTime = moment(startTime).add(coefficient, this.matrix.get('navigationInterval')).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
            var newEndTime = moment(endTime).add(coefficient, this.matrix.get('navigationInterval')).format('YYYY-MM-DDTHH:mm:ss.SSSZ');

            this.matrix.set('startTime', newStartTime);
            this.matrix.set('endTime', newEndTime);
            this.matrix.initColumns();

            this.changeTimeCallback();
        }
    });
});