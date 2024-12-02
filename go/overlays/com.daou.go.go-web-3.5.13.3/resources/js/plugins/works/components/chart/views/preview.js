define('works/components/chart/views/preview', function(require) {
    var Backbone = require('backbone');
    var Template = require('hgn!works/components/chart/templates/preview');
    var ChartView = require('works/components/chart/views/chart');
    var Filter = require('works/components/filter/models/filter');
    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var Filters = require('works/components/filter/collections/filters');
    var lang = require('i18n!works/nls/works');

    return Backbone.View.extend({

        events: {
            'change [data-filters]': '_onChangeFilter'
        },

        initialize: function(options) {
            this.appletId = options.appletId;
            this.chartFields = options.chartFields;
            this.numberFields = options.numberFields;
            this.filter = new Filter({appletId: this.appletId});
            this.appletBaseConfig = AppletBaseConfigModel.getInstance({id: this.appletId});
            this.filters = new Filters([], {
                appletId: this.appletId,
                type: 'base'
            });
        },

        render: function() {
            this.fetch().done(_.bind(function() {
                this.$el.html(Template({
                    filters: this.filters.toJSON(),
                    lang: lang
                }));
                this._renderChart();
            }, this));

            return this;
        },

        fetch: function() {
            return $.when(
                this.appletBaseConfig.fetch({useCache: true}),
                this.filters.fetch()
            );
        },

        _renderChart: function() {
            this.chartView = new ChartView({
                model: this.model,
                appletId: this.appletId,
                chartFields: this.chartFields,
                numberFields : this.numberFields
            });
            this.$('[data-chart-area]').html(this.chartView.render().el);
            this.chartView.fetchChartDatas();
        },

        _onChangeFilter: function(e) {
            var deferred = $.Deferred();
            var filterId = $(e.currentTarget).val();
            var filterOption = {appletId: this.appletId};
            if (filterId === 'all') {
                this.filter = new Filter(filterOption);
                deferred.resolve();
            } else if (filterId === 'createdBy') {
                this.filter = new Filter(_.extend(filterOption, Filter.getCreatedByFilterOptions()));
                deferred.resolve();
            } else {
                this.filter = new Filter(_.extend(filterOption, {id: parseInt(filterId)}));
                this.filter.fetch().done(_.bind(function() {
                    deferred.resolve();
                }, this));
            }
            deferred.done(_.bind(function() {
                this.model.setQueryString(this.filter.getSearchQuery());
                this.chartView.fetchChartDatas();
            }, this));
        }
    });
});