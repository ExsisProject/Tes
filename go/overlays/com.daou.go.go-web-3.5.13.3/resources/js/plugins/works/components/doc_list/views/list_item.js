define('works/components/doc_list/views/list_item', function (require) {

    var StatusColumnView = require('works/components/doc_list/views/status_column');
    var Template = require('hgn!works/components/doc_list/templates/list_item');

    return Backbone.View.extend({

        tagName: 'tr',
        className: 'odd',
        attributes: {'el-grid-list-item': ''},

        initialize: function () {
            this.$el.addClass(this.options.trClass);
            this.$el.attr('data-id', this.options.id);
        },

        render: function () {
            this.$el.html(Template(this.options));
            this._renderColumns();

            return this;
        },

        _renderColumns: function() {
            _.each(this.options.columns, function(column) {
                if (column.name === 'status') { // column.name === field.cid / 굳이 field 까지 받아와서 검사 안해도 될듯.
                    var statusColumnView = new StatusColumnView({
                        appletId: this.options.appletId,
                        docId: this.options.id,
                        statusLabel: column.render(this.model),
                        color: this.model.get("status") ? this.model.get("status").color : '0'
                    });
                    this.$el.append(statusColumnView.render().el);
                } else {
                    this.$el.append('<td class="' + column.className + '">' + column.render(this.model) + '</td>');
                }
            }, this);
        }
    });
});