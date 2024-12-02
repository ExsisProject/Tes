define(function(require) {
    var Backbone = require('backbone');
    var moment = require('moment');
    return Backbone.Collection.extend({

        setOverlapIndex: function() {
            var collection = this;
            this._clearIndex();
            collection.each(function(model) {
                var startTime = model.get('startTime');
                var endTime = model.get('endTime');
                var overlaps = collection.filter(function(target) {
                    return (moment(model.get('startTime')) - moment(target.get('endTime')) < 0 &&
                        moment(model.get('endTime')) - moment(target.get('startTime')) > 0);
                });

                // 겹치는 item 에서 비어있는 index 를 찾는다.
                _.each(overlaps, function(overlap, index) {
                    var result = _.findWhere(overlaps, {index: index});
                    if (!result) {
                        model.index = index;
                        return false;
                    }
                });
            });
        },

        overlapCount: function() {
            if (this.isEmpty()) return 1;
            var max = this.max(function(model) {
                return model.index;
            });
            return max.index + 1;
        },

        _clearIndex: function() {
            this.each(function(model) {
                model.index = null;
            });
        }
    });
});