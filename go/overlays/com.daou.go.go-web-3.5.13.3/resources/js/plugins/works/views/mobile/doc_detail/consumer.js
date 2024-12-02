/**
 * Created by JeremyJeon on 15. 10. 5..
 */
define('works/views/mobile/doc_detail/consumer', function(require) {

    var Consumers = require('works/components/consumer/collections/consumers');

    var ConsumerItemView = require('works/views/mobile/doc_detail/consumer_item');

    var View = Backbone.View.extend({
        initialize: function(options) {
            this.appletId = options.appletId;
            this.docId = options.docId;

            this.consumers = new Consumers({
                appletId: this.appletId,
                docId: this.docId
            });
            this.consumers.on('sync', this._onSyncConsumers, this);
            this.consumers.fetch();
        },

        render: function() {
            return this;
        },

        _onSyncConsumers: function() {
            console.log('on sync consumer');

            this._renderList();
        },

        _renderList: function() {
            this.consumers.each(function(consumer) {
                var consumerItemView = new ConsumerItemView({
                    model: consumer,
                    docId: this.docId
                });
                this.$el.append(consumerItemView.render().el);
            }, this);
        }
    });

    return View;
});