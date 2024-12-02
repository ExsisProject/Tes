define('collections/base_collection', function() {
    return Backbone.Collection.extend({
        initialize: function() {
            this.deferred = $.Deferred();
        },

        fetch: function(options) {
            if (!this.isFetching) {
                this.isFetching = true;
                options = options || {};
                var success = options.success;
                options.success = $.proxy(function(resp) {
                    this.deferred.resolve(resp);
                    if (success) success(this, resp);
                }, this);
                this.promise = Backbone.Collection.prototype.fetch.call(this, options).done($.proxy(function() {
                    this.isFetching = false;
                }, this));
            }
            return this.promise;
        },

        /**
         * static 전용 메소드
         * @returns {*}
         */
        getData: function() {
            var deferred = $.Deferred();
            if (this.deferred.state() === 'pending' && !this.isFetching) {
                console.log('case 1');
                this.fetch().done($.proxy(function() {
                    deferred.resolve(this);
                }, this));
                return deferred;
            } else if (this.deferred.state() === 'pending' && this.isFetching) {
                console.log('case 2');
                return this.deferred;
            } else {
                console.log('case 3');
                return deferred.resolve(this);
            }
        }
    });
});