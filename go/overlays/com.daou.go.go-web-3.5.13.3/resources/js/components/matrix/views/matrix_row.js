define(function(require) {
    var Backbone = require('backbone');

    var ItemView = require('matrix/views/matrix_item');

    return Backbone.View.extend({

        className: '_wrap_schedule_tiem',
        attributes: {'data-matrix-row': ''},

        initialize: function(options) {
            this.matrix = options.matrix;
            this.items = this.model.get('values');
            this.items.setOverlapIndex();
            this.$el.attr('data-row-key', this.model.get('rowKey'));
        },

        render: function() {
            this._renderItems();
            this._setHeight();

            return this;
        },

        _renderItems: function() {
            this.items.each(function(model) {
                var itemView = new ItemView({
                    matrix: this.matrix,
                    model: model
                });
                this.$el.append(itemView.render().el);
            }, this);
        },

        _setHeight: function() {
            var margin = 2;
            var height = this.matrix.get('itemHeight') * this.items.overlapCount();
            var minRowHeight = this.matrix.get('minRowHeight');
            if (height < minRowHeight) height = minRowHeight;
            this.$el.css('height', height + margin);
        }
    });
});