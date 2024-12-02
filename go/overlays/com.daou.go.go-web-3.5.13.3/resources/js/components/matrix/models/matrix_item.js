define(function(require) {
    var Backbone = require('backbone');
    var moment = require('moment');

    var FULL_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
    return Backbone.Model.extend({
        initialize: function(attrs, options) {
            this.modelName = 'matrix_item';
            this.matrix = options.matrix;
            if (options.startTimeKey) this.set('startTime', this.get(options.startTimeKey));
            if (options.endTimeKey) this.set('endTime', this.get(options.endTimeKey));
        },

        defaults: {
            startTime: moment(new Date()).format(FULL_DATE_FORMAT),
            endTime: moment(new Date()).format(FULL_DATE_FORMAT)
        },

        setDateByGrid: function(coefficient) {
            this.setStartDateByGrid(coefficient);
            this.setEndDateByGrid(coefficient);
        },

        setStartDateByGrid: function(coefficient) {
            var gridValue = this.matrix.get('gridValue');
            var gridUnit = this.matrix.get('gridUnit');
            var startTime = moment(this.get('startTime')).add(coefficient * gridValue, gridUnit).format(FULL_DATE_FORMAT);
            this.set({startTime: startTime});
        },

        setEndDateByGrid: function(coefficient) {
            var gridValue = this.matrix.get('gridValue');
            var gridUnit = this.matrix.get('gridUnit');
            var endTime = moment(this.get('endTime')).add(coefficient * gridValue, gridUnit).format(FULL_DATE_FORMAT);
            this.set({endTime: endTime});
        },

        /**
         * left(%) = (현재시간 - 시작시간) / (종료시간 - 시작시간) * 100
         * left 가 음수인경우 content 가 영역을 벗어나므로 보정해준다.
         */
        dateToPosition: function() {
            var startTime = moment(this.matrix.get('startTime'));
            var endTime = moment(this.matrix.get('endTime'));
            var start = (moment(this.get('startTime')) - startTime) / (endTime - startTime) * 100;
            var end = (moment(this.get('endTime')) - startTime) / (endTime - startTime) * 100;

            var left = (start < 0 ? 0 : start) + '%';
            var width = (start < 0 ? end : (end - start)) + '%';
            var top = (this.index * parseInt(this.matrix.get('itemHeight'))) + 'px';

            return {
                left: left,
                width: width,
                top: top
            };
        },

        // 현재시간 = 시작시간 + left(%) * (종료시간 - 시작시간) / 100
        ratioToDate: function(left) {
            var startTime = moment(this.matrix.get('startTime'));
            var endTime = moment(this.matrix.get('endTime'));
            var date = new Date(left * (endTime - startTime) / 100 + startTime);
            return moment(date).format(FULL_DATE_FORMAT);
        },

        isValid: function() {
            return moment(this.get('startTime')) < moment(this.get('endTime'));
        }
    });
});