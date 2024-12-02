define('views/base_view', function(require) {
    return Backbone.View.extend({
        _isDetached: function() {
            return !this.$el.parents('body').length; // this.$el 이 body 이면?
        }
    }, {
        instanceMap: {},
        getInstance: function(key, attributes) {
            var view = this.instanceMap[key];
            if (!view || view._isDetached()) {
                view = new this(attributes);
                this.instanceMap[key] = view;
            }
            return view;
        }
    });
});