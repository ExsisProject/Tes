define('works/components/chart/views/chart', function (require) {
    var Backbone = require('backbone');
    var worksLang = require('i18n!works/nls/works');
    var lang = {
        '콤보차트 오류': worksLang['콤보차트 오류'],
        '데이터가 존재하지 않습니다.': worksLang['데이터가 존재하지 않습니다.'],
        '목표': worksLang['목표'],
        '이미지로 저장': worksLang['이미지로 저장'],
        '프레젠테이션': worksLang['프레젠테이션'],
        '복원': worksLang['복원'],
        '꺾은 선형': worksLang['꺾은 선형'],
        '세로 막대형': worksLang['세로 막대형'],
        'line': '(' + worksLang['꺾은 선형'] + ')',
        'bar': '(' + worksLang['세로 막대형'] + ')',
        'COUNT': worksLang['개수'],
        'SUM': worksLang['합계'],
        'AVG': worksLang['평균'],
        'MAX': worksLang['최대값'],
        'MIN': worksLang['최소값']
    };

    var ChartDatas = require('works/components/chart/collections/chart_datas');
    var Template = require('hgn!works/components/chart/templates/chart');
    var THEME = {
        '0': ['#1d72ec', '#7a7a7a', '#35c2ff', '#7075ff', '#98afff', '#a5a9b8', '#00d1d1', '#394cc8', '#0a977e', '#35444e'],
        '1': ['#37abe8', '#4fe3b9', '#c79aea', '#fbd63f', '#29cbe4', '#c8d5e7', '#7dcff6', '#8eaaec', '#3fe4fb', '#6286f3'],
        '2': ['#ff9a53', '#8e8dd1', '#ffcf55', '#91b3e7', '#a6ba8c', '#ebdba4', '#fe85a4', '#b2adad', '#7c738b', '#c384db'],
        '3': ['#00d1d1', '#7a7a7a', '#82adad', '#4ae562', '#b6ebe3', '#2da940', '#1e838d', '#4ffefe', '#40ab92', '#c3cbcd']
    };

    return Backbone.View.extend({
        tagName: 'section',
        className: 'card_item',
        attributes: {'style': 'padding:0px;'},
        events: {
            'click': '_onClickChart'
        },

        initialize: function (options) {
            this.options = options || {};
            this.appletId = options.appletId;
            this.chartFields = options.chartFields;
            this.numberFields = options.numberFields;
            this.useToolbox = options.useToolbox === undefined ? true : options.useToolbox;
            this.isThumbnail = options.isThumbnail === undefined ? false : options.isThumbnail;
            this.usePresentation = options.usePresentation === undefined ? true : options.usePresentation;
            this.isPresentation = options.isPresentation === undefined ? false : options.isPresentation;
            this.useLink = options.useLink === undefined ? false : options.useLink;

            this.model.on('change:queryString', this._fetchChartData, this);
            this.model.on('change:docs', this._onChangeDocs, this);

            this.chartDatas = new ChartDatas([], _.extend(this.model.toJSON(), {
                appletId: this.appletId,
                groupByField: this.chartFields ? this.chartFields.findWhere({cid: this.model.get('groupByCid')}) : {},
                aggField: this.numberFields ? this.numberFields.findWhere({cid: this.model.get('aggCid')}) : {}
            }));
            this.subChartDatas = new ChartDatas([], _.extend(this.model.toJSON(), {
                appletId: this.appletId,
                groupByField: this.chartFields ? this.chartFields.findWhere({cid: this.model.get('groupByCid')}) : {},
                aggMethod: this.model.get('subAggMethod'),
                aggCid: this.model.get('subAggCid'),
                aggField: this.numberFields ? this.numberFields.findWhere({cid: this.model.get('subAggCid')}) : {}
            }));

            this.isInitResize = false;
            this.settingId = options.settingId;
        },

        render: function () {
            this.$el.html(Template);
            this.chartEl = this.$('div.card_wrapper');

            return this;
        },

        _onClickChart: function () {
            if (this.isThumbnail) this.$el.trigger('navigateChart', this.model);
        },

        _bindResize: function () {
            if (this.isInitResize) return;
            this.isInitResize = true;
            $(window).on('resize', _.bind(function () {
                setTimeout($.proxy(function () {
                    this.chart.resize();
                }, this), 300); // css transition 이 들어가면서 transition 값(300) 만큼 지연을 줘야 한다.
            }, this));
        },

        _fetchChartData: function () {
            this.chartDatas.setQueryString(this.model.get('queryString'));

            if (this.model.get('combination')) {
                this.subChartDatas.setQueryString(this.model.get('queryString'));
                $.when(this.chartDatas.fetch(), this.subChartDatas.fetch()).done(_.bind(function () {
                    this._onSyncChartDatas();
                }, this));
            } else {
                this.chartDatas.fetch().done(_.bind(function () {
                    this._onSyncChartDatas();
                }, this));
            }
        },

        fetchChartDatas: function () {
            this._fetchChartData();
        },

        _onChangeDocs: function () {
            this._fetchChartData();
        },

        _onSyncChartDatas: function () {
            var chartType = this.model.get('chartType');
            if (chartType === 'COLUMN') {
                this._renderBarChart();
            } else if (chartType === 'LINE') {
                this._renderBarChart(chartType);
            } else if (chartType === 'PIE') {
                this._renderPieChart();
            } else if (chartType === 'GAUGE') {
                this._renderGaugeChart();
            }

            this._bindResize();

            /**
             * 차트가 안나오는다는 이슈가 있는데 재현은 되지 않는다.
             * 방어 코드로써 0.1초후에 resize 이벤트를 한번 트리거 하도록 한다.
             */
            setTimeout($.proxy(function () {
                $(window).trigger('resize');
            }, this), 100);
        },

        _renderBarChart: function (chartType) {
            chartType = chartType === 'LINE' ? 'line' : 'bar';
            var option = {};
            var seriesData = this.chartDatas.toJSON();
            var xAxisData = this.chartDatas.getLabel();
            var stack = this.model.get('stack');
            var isCombination = this.model.get('combination');
            var isMultiSeries = this.subChartDatas.isMultiSeries();
            var series = isMultiSeries
                ? this._getMultiSeries(this.chartDatas.getMultiSeriesData(), chartType, stack)
                : [{
                    type: chartType,
                    stack: 'stack',
                    data: seriesData,
                    itemStyle: this._seriesItemStyle(chartType, stack)
                }];

            if (isCombination) {
                var subChartType = chartType === 'line' ? 'bar' : 'line';
                var subStack = this.model.get('subStack');
                var combinationSeries = this.subChartDatas.isMultiSeries()
                    ? this._getMultiSeries(this.subChartDatas.getMultiSeriesData(), subChartType, subStack, lang[subChartType], 1, isCombination)
                    : [{
                        yAxisIndex: 1,
                        type: subChartType,
                        combination: true,
                        stack: 'subStack',
                        data: this.subChartDatas.toJSON(),
                        itemStyle: this._seriesItemStyle(subChartType, subStack, isCombination)
                    }];
                series = _.union(series, combinationSeries);
            }

            option.title = this._getChartTitle();

            option = _.extend(option, this._commonOption(), {
                tooltip: {
                    position: 'inside',
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: _.bind(function (input) {
                        var returnValues = _.map(input, function (data) {
                            var name = isMultiSeries ? data.seriesName : data.name;
                            if (!isMultiSeries && subChartType === data.seriesType) {
                                name = name + lang[data.seriesType];
                            }

                            var value = data.value;
                            if (typeof name === 'number') name = GO.util.numberWithCommas(name);
                            if (typeof value === 'number') value = GO.util.numberWithCommas(parseFloat(value.toFixed(2)));

                            return name + ' : ' + value;
                        }, this);
                        if (isMultiSeries) {
                            var firstInput = input[0] || {};
                            returnValues.unshift(isMultiSeries ? firstInput.name : firstInput.seriesName);
                        }
                        return returnValues.join('<br>');
                    }, this),
                    textStyle: this._fontFamily()
                },
                toolbox: this.useToolbox ? {
                    show: !this.isThumbnail,
                    orient: 'horizontal',
                    x: 'left',
                    y: 'top',
                    feature: this._getFeature(),
                    textStyle: this._fontFamily(),
                    color: '#9d9d9d'
                } : false,
                calculable: true,
                dataZoom: this.isThumbnail ? false : {
                    show: true,
                    height: 20,
                    bottom: 30
                },
                xAxis: [{
                    type: 'category',
                    data: xAxisData,
                    axisLabel: {
                        formatter: _.bind(function (value) {
                            if (this.isThumbnail) return '';
                            if (typeof value === 'number') value = GO.util.numberWithCommas(value);
                            return value;
                        }, this),
                        textStyle: this._fontFamily()
                    }
                }],
                yAxis: this._getYAxis(),
                series: series,
                grid: this._getGridOption()
            });
            if (isMultiSeries && !this.isThumbnail) {
                var legend = this.chartDatas.getSubLegend();
                if (this.model.get('combination')) {
                    var comboLegend = this.subChartDatas.getSubLegend(lang[subChartType]);
                    legend = _.union(legend, comboLegend);
                }
                _.extend(option, {
                    legend: {
                        type: 'scroll',
                        data: legend,
                        bottom: 0
                    }
                });
            }

            this.chart = echarts.init(this.chartEl[0]);
            this.chart.setOption(option);
        },

        _renderPieChart: function () {
            var seriesData = this.chartDatas.getPieData();
            var legendData = this.chartDatas.getPieLabel();
            var showLabel = seriesData.length <= 30;
            var showValue = this._isShowValue();
            var option = _.extend(this._commonOption(), {
                title: {
                    text: this.model.get('title'),
                    x: 'center',
                    textStyle: _.extend(this._fontFamily(), this._titleFontSize())
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function (data) {
                        var name = data.name;
                        var value = data.value;
                        if (typeof name === 'number') name = GO.util.numberWithCommas(name);
                        if (typeof value === 'number') value = GO.util.numberWithCommas(parseFloat(value.toFixed(2)));

                        return name + ' : ' + value + '(' + data.percent + '%)';
                    },
                    textStyle: this._fontFamily()
                },
                legend: {
                    show: !this.isThumbnail,
                    type: 'scroll',
                    bottom: 0,
                    data: legendData,
                    textStyle: this._fontFamily()
                },
                toolbox: GO.util.isMobile() ? false : {
                    show: !this.isThumbnail,
                    orient: 'horizontal',
                    x: 'left',
                    y: 'top',
                    feature: this._getFeature(),
                    textStyle: this._fontFamily(),
                    color: '#9d9d9d'
                },
                calculable: true,
                series: [{
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '50%'],
                    itemStyle: {
                        normal: {
                            label: {
                                show: !this.isThumbnail && showLabel,
                                formatter: function (data) {
                                    var name = data.name;
                                    var value = data.value;
                                    if (typeof name === 'number') name = GO.util.numberWithCommas(name);
                                    if (typeof value === 'number') value = GO.util.numberWithCommas(parseFloat(value.toFixed(2)));
                                    return (showValue) ? name + '\n' + value + ' (' + data.percent + '%)' : value;
                                },
                                textStyle: this._fontFamily()
                            },
                            labelLine: {
                                show: !this.isThumbnail && showLabel
                            }
                        }
                    },
                    data: seriesData
                }]
            });

            this.chart = echarts.init(this.chartEl[0]);
            this.chart.setOption(option);
        },

        _renderGaugeChart: function () {
            var goalRate = 100;
            var realRate = 1 / (goalRate / 120);
            var goal = this.model.get('goal');
            var data = this.chartDatas.getGaugeData();
            var showValue = this._isShowValue();
            var isThumbnail = this.isThumbnail;
            var theme = (this.model.get('theme') + '') || '0';
            var colors = THEME[theme];
            var option = _.extend(this._commonOption(), {
                title: {
                    text: this.model.get('title'),
                    x: 'center',
                    textStyle: _.extend(this._fontFamily(), this._titleFontSize(14))
                },
                tooltip: {
                    formatter: function (data) {
                        var percent = parseFloat(data.value * 100 / goal).toFixed(1) + '%';
                        return GO.util.numberWithCommas(data.value) + '(' + percent + ')';
                    }
                },
                toolbox: GO.util.isMobile() ? false : {
                    show: !this.isThumbnail,
                    orient: 'horizontal',
                    x: 'left',
                    y: 'top',
                    feature: this._getFeature(),
                    textStyle: this._fontFamily(),
                    color: '#9d9d9d'
                },
                series: [{
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    max: goal * realRate,
                    center: ['50%', '75%'], // [0, 0] => 좌상
                    axisLine: {
                        lineStyle: {
                            color: [
                                [0.833, colors[0]],
                                [1, colors[2]]
                            ]
                        }
                    },
                    splitNumber: 12,
                    axisLabel: {
                        formatter: function (v) {
                            if (isThumbnail) return '';
                            switch (v + '') {
                                case goal + '':
                                    // 목표치
                                    return lang['목표'] + '\n' + GO.util.numberWithCommas(goal);
                                default:
                                    return '';
                            }
                        },
                        textStyle: {
                            fontSize: 15,
                            fontWeight: 'bolder'
                        }
                    },
                    pointer: {
                        width: 4
                    },
                    title: {
                        show: true,
                        offsetCenter: [0, '-60%'],
                        textStyle: {
                            color: '#fff',
                            fontSize: 30
                        }
                    },
                    detail: {
                        show: true,
                        borderWidth: 0,
                        offsetCenter: [0, '-130%'],
                        formatter: function (data) {
                            if (showValue && !isThumbnail) {
                                var percent = parseFloat(data * 100 / goal).toFixed(1) + '%';
                                return GO.util.numberWithCommas(data) + '(' + percent + ')';
                            } else {
                                return '';
                            }
                        },
                        textStyle: {
                            color: 'auto',
                            fontSize: 30
                        }
                    },
                    data: data
                }]
            });

            this.chart = echarts.init(this.chartEl[0]);
            this.chart.setOption(option, true);
        },

        _showPresentationMode: function () {
            this.$el.trigger('showPresentationMode', this.model);
        },

        _goToAppletHome: function () {
            console.log('_goToAppletHome');
            GO.router.navigate('works/applet/' + this.appletId + '/home', true);
        },

        _commonOption: function () {
            var theme = (this.model.get('theme') + '') || '0';
            return {
                loadingText: 'loading..',
                noDataLoadingOption: {
                    text: lang['데이터가 존재하지 않습니다.'],
                    effect: 'whirling'// 'spin' | 'bar' | 'ring' | 'whirling' | 'dynamicLine' | 'bubble'
                },
                color: THEME[theme],
                renderAsImage: this.isThumbnail
            };
        },

        _fontFamily: function () {
            return {
                fontFamily: 'Noto Sans KR, 맑은 고딕, 돋움, malgun gothic, dotum, AppleGothic, Helvetica, sans-serif'

            };
        },

        _titleFontSize: function (size) {
            return {
                fontSize: size
            };
        },

        _titleFontColor: function (color) {
            return {
                color: color
            };
        },

        _getChartTitle: function () {
            var title = [{
                text: this.model.get('title'),
                x: 'center',
                y: 'top',
                textStyle: _.extend(this._fontFamily(), this._titleFontSize(14))
            }];

            if (this.model.get('combination') && (this.chartDatas.length != this.subChartDatas.length)) {
                var targetField =
                    this.chartDatas.length > this.subChartDatas.length
                        ? this.subChartDatas.aggField.get('label') : this.chartDatas.aggField.get('label');

                title.push({
                    text: targetField + ' ' + lang['콤보차트 오류'],
                    x: 'center',
                    y: 'bottom',
                    textStyle: _.extend(this._fontFamily(), this._titleFontSize(9), this._titleFontColor('red'))
                });
            }
            return title;
        },

        _getMultiSeries: function (map, chartType, stack, postfix, yAxisIndex, isCombination) {
            yAxisIndex = yAxisIndex || 0;
            if (_.isEmpty(map)) return {type: chartType, data: []};
            var itemStyle = this._seriesItemStyle(chartType, stack, isCombination);
            return _.map(map, function (value, key) {
                return {
                    yAxisIndex: yAxisIndex,
                    name: postfix ? key + postfix : key,
                    type: chartType,
                    data: value,
                    stack: stack ? chartType : false,
                    itemStyle: itemStyle
                };
            });
        },

        _getGridOption: function () {
            if (this.isThumbnail) return {x: 0, y: 0, x2: 0, y2: 0};
            return {y: 60, y2: 80};
        },

        _getFeature: function () {
            return {
                magicType: {
                    show: this.isPresentation && this._isBarOrLine(),
                    title: {
                        line: lang['꺾은 선형'],
                        bar: lang['세로 막대형']
                    },
                    type: ['line', 'bar']
                },
                restore: {
                    show: this.isPresentation && (this._isBarOrLine() || this._isPie()),
                    title: lang['복원']
                },
                saveAsImage: {
                    show: !GO.util.msie() && this.isPresentation,
                    title: lang['이미지로 저장'],
                    lang: [lang['이미지로 저장']]
                },
                myShowPresentationMode: {
                    show: this.usePresentation && !this.isPresentation,
                    title: lang['프레젠테이션'],
                    lang: [lang['프레젠테이션']],
                    icon: 'image://' + GO.util.locationOrigin() + '/resources/images/ic_expand.png',
                    onclick: _.bind(this._showPresentationMode, this)
                },
                myShowLink: {
                    show: this.useLink,
                    title: worksLang['해당 앱으로 이동'],
                    lang: [worksLang['해당 앱으로 이동']],
                    icon: 'image://' + GO.util.locationOrigin() + '/resources/images/ic_access.png',
                    onclick: _.bind(this._goToAppletHome, this)
                }
            };
        },

        _isBarOrLine: function () {
            var chartType = this.model.get('chartType');
            return chartType === 'COLUMN' || chartType === 'LINE';
        },

        _isPie: function () {
            return this.model.get('chartType') === 'PIE';
        },

        _isShowValue: function () {
            return this.isPresentation;
            // return this.isPresentation && this.model.get('showValue') === true;
        },

        _labelValueOption: function (chartType, stack, isCombination) {
            if (isCombination || stack) return false;
            return {
                show: true,
                position: 'top',
                formatter: function (data) {
                    var value = data.value;
                    if (typeof value === 'number') {
                        value = GO.util.numberWithCommas(parseFloat(value.toFixed(2)));
                    }
                    return value == '0' ? '' : value;
                }/*,
                textStyle: (chartType === 'line') ? {color: 'black', fontWeight: 'bold'} : {color: 'white'}*/
            }
        },

        _seriesItemStyle: function (chartType, stack, isCombination) {
            var itemStyle = {};
            if (chartType === 'line' && stack) {
                itemStyle.normal = {areaStyle: {type: 'default'}};
            }
            if (this._isShowValue()) {
                if (!itemStyle.normal) {
                    itemStyle.normal = {};
                }
                itemStyle.normal.label = this._labelValueOption(chartType, stack, isCombination);
            }
            return itemStyle;
        },

        _getYAxis: function () {
            var combination = this.model.get('combination');
            var yAxis = [this._getYAxisItem(this.chartDatas, combination)];
            if (combination) {
                yAxis.push(this._getYAxisItem(this.subChartDatas, true));
            }

            return yAxis;
        },

        _getYAxisItem: function (chartDatas, combination) {
            return {
                name: this._getYAxisName(chartDatas),
                type: 'value',
                splitNumber: (combination) ? 5 : null,
                axisLabel: {
                    rotate: 30,
                    formatter: _.bind(function (value) {
                        if (this.isThumbnail) return '';
                        if (typeof value === 'number') value = GO.util.numberWithCommas(value);
                        if (value.length > 12) value = value.substr(0, 10) + '..';
                        return value;
                    }, this),
                    textStyle: this._fontFamily()
                }
            }
        },

        _getYAxisName: function (chartDatas) {
            if (!_.isUndefined(chartDatas.aggField) && chartDatas.aggField.isDayTimeFormulaFieldType()) return worksLang['분'];
            var yAxis = '';
            if (chartDatas.aggMethod) yAxis += lang[chartDatas.aggMethod];
            if (chartDatas.aggField) yAxis += '(' + chartDatas.aggField.get('label') + ')';
            return yAxis;
        }
    });
});

