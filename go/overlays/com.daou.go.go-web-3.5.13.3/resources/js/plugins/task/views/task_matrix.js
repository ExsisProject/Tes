define(function(require) {
    var MATRIX_EVENT = require('matrix/constants/matrix_event');
    var MatrixView = require('matrix');
    return MatrixView.extend({
        render: function() {
            if (this.collection.page == 0) {
                this._render();
                this.$el.trigger(MATRIX_EVENT.RENDER_DONE);
            } else {
                this._appendRows();
            }

            return this;
        },

        _appendRows: function() {
            this._appendBackgroundRow();
            this._renderRows(true);
        },

        _appendBackgroundRow: function() {
            var template = Hogan.compile([
                '{{#rows}}',
                '<tr data-row>',
                    '<td data-row-head="{{rowKey}}" class="info">',
                        '<span class="name">{{rowTitle}}</span>',
                        '<span class="position">{{rowSubTitle}}</span>',
                    '</td>',
                    '{{#columns}}',
                    '<td data-column-key="{{key}}" data-matrix-column class="{{#isToday}}today{{/isToday}}"></td>',
                    '{{/columns}}',
                '</tr>',
                '{{/rows}}',
            ].join(''))
            this.$('tbody').append(template.render({
                columns: this.matrix.get('columns'),
                rows: this.collection.toJSON()
            }));
        },

        _renderRows: function(isAppend) {
            if (!isAppend) this.$('div[data-matrix-body]').empty();
            this.collection.each(function(model, index) {
                var fullIndex = this.collection.getFullIndex(index);
                this._appendRow(model, fullIndex);
            }, this);
        }
    });
});