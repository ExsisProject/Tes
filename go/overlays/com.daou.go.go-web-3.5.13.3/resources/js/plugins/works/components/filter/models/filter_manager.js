/**
 * 이름을 뭐라고 해야 할지?
 * 기본필터와 개인필터 collection 들을 관리한다.
 */
define('works/components/filter/models/filter_manager', function(require) {
    var Filters = require('works/components/filter/collections/filters');

    return Backbone.Model.extend({
        baseFilters: null,
        mineFilters: null,

        initialize: function(options) {
            this.appletId = options.appletId;
            this.baseFilters = new Filters([], {
                appletId: this.appletId,
                type: 'base'
            });
            this.mineFilters = new Filters([], {
                appletId: this.appletId
            });

            /**
             * 중계기 역할
             */
            //this.listenTo(this, 'changeFilter.filters', this._onChangeFilter);
            this.listenTo(this.baseFilters, 'changeFilter.filters', this._onChangeFilter);
            this.listenTo(this.mineFilters, 'changeFilter.filters', this._onChangeFilter);
            //this.listenTo(this, 'change:name', this._onChangeFilterName);
            this.listenTo(this.baseFilters, 'change:name', this._onChangeFilterName);
            this.listenTo(this.mineFilters, 'change:name', this._onChangeFilterName);
        },

        fetch: function() {
            var deferred = $.Deferred();
            $.when(this.baseFilters.fetch(), this.mineFilters.fetch()).then(function() {
                deferred.resolve();
            });

            return deferred;
        },

        getBaseFilters: function() {
            return this.baseFilters;
        },

        getMineFilters: function() {
            return this.mineFilters;
        },

        findWhere: function(object) {
            return this.baseFilters.findWhere(object) || this.mineFilters.findWhere(object);
        },

        remove: function(model) {
            this.baseFilters.remove(model);
            this.mineFilters.remove(model);
        },

        _onChangeFilter: function(filterId, type) {
            this.trigger('changeFilter.filters', filterId, type);
        },

        _onChangeFilterName: function(model) {
            this.trigger('change:name', model);
        }
    });
});