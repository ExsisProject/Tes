/**
 * Created by hwjung on 2016-02-01.
 */
define(function(require) {
    var instance;
    var ConfigModel = Backbone.Model.extend({
        url : "/api/approval/apprconfig",
        initialize: function() {
            this.defer = $.Deferred();
            this.isFetching = false;
            this.isFetched = false;
        },
        /**
         * 싱글턴 모델. 인스턴스를 한번만 생성하여 관리.
         * 값이 바뀌지 않으므로 여러곳에서 fetch 를 호출하여도 최초 한번만 수행한다.
         * @param options
         * @returns {*}
         */
        fetch: function(options) {
            typeof(options) != 'undefined' || (options = {});
            if (this.isFetching || this.isFetched) return this.defer;
            this.isFetching = true;
            var success = options.success;
            Backbone.Model.prototype.fetch.call(this, _.extend(options, {
                success: $.proxy(function(resp) {
                    if (success) success.call(this, resp);
                    this.isFetching = false;
                    this.isFetched = true;
                    this.defer.resolve(resp);
                }, this)
            }));
            return this.defer;
        }
    }, {
        init: function() {
            if (!instance) instance = new ConfigModel();
            return instance;
        }
    });

    return Backbone.View.extend({
        initialize: function() {
            this.config = ConfigModel.init();
        }
    });
});