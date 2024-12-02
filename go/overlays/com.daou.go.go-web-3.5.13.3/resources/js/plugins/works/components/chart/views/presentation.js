define('works/components/chart/views/presentation', function(require) {
    var Template = require('hgn!works/components/chart/templates/presentation');
    var ChartView = require('works/components/chart/views/chart');

    return Backbone.View.extend({

        className: 'layer_normal layer_present_mode',

        events: {
            'click [data-el-chart-presentation-close]': '_onClickClose'
        },

        initialize: function(options) {
            options = options || {};
            this.charts = options.charts;
            this.appletId = options.appletId;
            this.chartFields = options.chartFields;
            this.numberFields = options.numberFields;

            this.$el.on('navigateChart', _.bind(this._navigateChart, this));
        },

        render: function() {
            this.$el.html(Template({title: this.model.get('title')}));
            this._renderChart();
            this._renderCharts();
            return this;
        },

        _renderChart: function() {
            var chartView = new ChartView({
                isPresentation: true,
                model: this.model,
                appletId: this.appletId,
                chartFields: this.chartFields,
                numberFields : this.numberFields
            });
            this.$('.content').html(chartView.render().el);
            chartView.fetchChartDatas();
        },

        _renderCharts: function() {
            this.charts.each(function(chart) {
                var chartView = new ChartView({
                    model: chart,
                    appletId: this.appletId,
                    chartFields: this.chartFields,
                    numberFields : this.numberFields,
                    isThumbnail: true
                });
                this.$('.chart_list').append(chartView.render().el);
                chartView.fetchChartDatas();
            }, this);
        },

        _onClickClose: function() {
            this.$el.remove();
        },

        _navigateChart: function(event, targetChart) {
            this.model = targetChart;
            this._renderChart();
        }
    });
});
