define(function(require) {
    var Backbone = require('backbone');
    return Backbone.Model.extend({
        initialize: function(attrs) {
            this.modelName = 'reservation_asset';
        },

        getStartTime: function() {
            return this._getTime('startTime');
        },

        getEndTime: function() {
            return this._getTime('endTime');
        },

        isAvailableDay: function(day) {
            return parseInt(this.get('availabilityDate').ableDays.substr(day, 1));
        },

        /**
         * 24:00:00 를 지원하지 않아, invalid date 로 반환 되는 문제.
         * moment 2.8.4 부터 지원한다. 일단 우리쪽에서 처리한다.
         */
        _getTime: function(key) {
            var time = '';
            var now = moment(new Date());
            if (this.get('availabilityDate')[key] == '2400') {
                time = moment(now.format('YYYY-MM-DD ') + '00:00').add(1, 'days');
            } else {
                var hh = this.get('availabilityDate')[key].substring(0, 2);
                var mm = this.get('availabilityDate')[key].substring(2, 4);
                time = moment(now.format('YYYY-MM-DD ') + hh + ':' + mm);
            }

            return time.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        }
    });
});