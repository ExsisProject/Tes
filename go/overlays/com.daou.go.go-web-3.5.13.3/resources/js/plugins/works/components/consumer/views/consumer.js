define('works/components/consumer/views/consumer', function(require) {
	
	var Consumers = require('works/components/consumer/collections/consumers');
	
	var ConsumerItemView = require('works/components/consumer/views/consumer_item');
	
	var View = Backbone.View.extend({
		initialize: function(options) {
			this.appletId = options.appletId;
			this.docId = options.docId;
			this.docText = options.docText;
			
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
			this._renderList();
		},
		
		_renderList: function() {
			this.consumers.each(function(consumer, index) {
				var consumerItemView = new ConsumerItemView({
					appletId: this.appletId,
					model: consumer,
					docId: this.docId,
					docText: this.docText
				});
				this.$el.append(consumerItemView.render().el);
				if (this.consumers.length != index + 1) this.$el.append('<hr>');
			}, this);
		}
	});
	
	return View;
});