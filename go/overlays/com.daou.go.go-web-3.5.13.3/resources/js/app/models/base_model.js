define('models/base_model', function() {

    var Backbone = require('backbone');
    return Backbone.Model.extend({
        initialize: function() {
            this.deferred = $.Deferred();
            this.isFetched = false;
        },

        fetch: function(options) {
            options = options || {};
            if (this.isFetched && options.useCache) return this.deferred;
            var success = options.success;
            options.success = $.proxy(function(resp) {
                this.isFetched = true;
                this.deferred.resolve(resp);
                if (success) success(this, resp);
            }, this);
            // options = _.extend({
            //     statusCode: {
            //         403 : function() { GO.util.error('403', { 'msgCode': '400-common'}); },
            //         404 : function() { GO.util.error('404', { 'msgCode': '400-common'}); },
            //         500 : function() { GO.util.error('500'); }
            //     }
            // }, options);
            return Backbone.Model.prototype.fetch.call(this, options);
        },

        save: function(attributes, options) {
            if (!this.isSaving) {
                this.isSaving = true;
                this.promise = Backbone.Model.prototype.save.apply(this, arguments).done($.proxy(function() {
                    this.isSaving = false;
                }, this));
            }

            return this.promise;
        }
    }, {
        instanceMap: {},
        getInstance: function(attributes) {
            var instance = new this(attributes);
            var key = instance.url();
            if (!this.instanceMap[key]) this.instanceMap[key] = instance;
            return this.instanceMap[key];
        },

        setInstance: function(instance) {
            var key = instance.url();
            this.instanceMap[key] = instance;
        }
    });
});