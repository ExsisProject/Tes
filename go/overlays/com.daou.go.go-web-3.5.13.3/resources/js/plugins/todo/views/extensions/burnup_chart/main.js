define("todo/views/extensions/burnup_chart/main", function (require) {
    var Backbone = require("backbone");
    var moment = require("moment");
    var TodoBurnupList = require("todo/models/todo_burnup_list");
    var TodoExtensionBaseView = require("todo/views/extensions/base");
    var renderExtensionBurnupchart = require("hgn!todo/templates/extensions/extension_burnupchart");
    var ColumnStore = require("todo/views/extensions/burnup_chart/column_store");
    var SelectColumnMenuView = require("todo/views/extensions/burnup_chart/select_column_menu");
    var CommonLang = require("i18n!nls/commons");
    var TodoLang = require("i18n!todo/nls/todo");
    var NameTagListView = require("go-nametags");

    require("go-ignoreduplicatemethod");
    require("go-charts");
    require("jquery.ui");
    require("GO.util");

    var TodoBurnupChartView,
        MAX_DURATION_MONTH = 6,
        FORMAT_DATE = 'YYYY-MM-DD',
        SELECTORS = {
            "tooltip": 'flot-tooltip'
        };

    TodoBurnupChartView = TodoExtensionBaseView.extend({
        id: 'burnup_chart_view_id',
        name: 'todo-burnupchart-view',
        className: 'view_type view_todo_statistic',

        todoModel: null,
        startDate: null,
        endDate: null,
        template: renderExtensionBurnupchart,

        isDirty: true,
        tootipData: [],
        nameTagListView: null,

        events: function () {
            var superEvents = TodoExtensionBaseView.prototype.events || {};

            return _.extend({}, superEvents, {
                'click .btn-add-column': '_toggleSelectColumnMenu',
            });
        },

        initialize: function (options) {
            var opts = options || {};
            TodoExtensionBaseView.prototype.initialize.call(this, opts);

            this.todoModel = opts.todoModel;

            if (!this.collection) {
                this.collection = new TodoBurnupList({todoId: this.todoModel.id});
            }
            this.startDate = moment().subtract('d', '30').startOf('d');
            this.endDate = moment().endOf('d');

            this.__plotObj = null;
            initStoredColumns.call(this);
        },

        render: function () {
            this.setContent(this.template({
                "label": {
                    "add_column": TodoLang["칼럼 추가"]
                }
            }));

            initDatepicker.call(this);
            initNameTagList.call(this);
            requestBurnupData.call(this);
        },

        // @Override
        resize: function (height) {
            // padding 값 반영해야 함.
            TodoExtensionBaseView.prototype.resize.call(this, height - 20);
            SelectColumnMenuView.clear();
            requestBurnupData.call(this);
        },

        //컬럼 추가 레이어 뛰우기
        _toggleSelectColumnMenu: function (e) {
            var self = this;

            e.preventDefault();

            SelectColumnMenuView.toggle($(e.currentTarget), {
                model: this.todoModel,
                onClicked: function ($el) {
                    var cateId = parseInt($el.val());
                    toggleColumnTag.call(self, $el.prop('checked'), cateId);

                    self.isDirty = true;
                    requestBurnupData.call(self);
                }
            });
        }
    });

    function initStoredColumns() {
        var todoId = this.todoModel.id,
            todoCateIds = _.pluck(this.todoModel.getCategories(), 'id');

        // todoCateIds === 0 전체가 추가되어 없으면 추가
        if (ColumnStore.hasTodoId(todoId)) {
            ColumnStore.set(todoId, _.intersection(ColumnStore.get(todoId), _.union(todoCateIds, [0])));
        } else {
            ColumnStore.set(todoId, todoCateIds.pop());
        }
    }

    function getColumnAttrs(cateId) {
        var column = this.todoModel.getCategory(cateId) || {};

        if (isTotalColumn(cateId)) {
            column.title = CommonLang["전체"];
        }

        return column;
    }

    function initNameTagList() {
        var todoModel = this.todoModel,
            storedCols = ColumnStore.get(todoModel.id),
            tags = [],
            self = this;

        _.each(storedCols, function (cateId) {
            var column = getColumnAttrs.call(this, cateId);
            tags.push({"id": cateId, "title": GO.util.unescapeHtml(column.title), options: {"removable": true}})
        }, this);

        this.nameTagListView = NameTagListView.create(tags || [], {"useAddButton": false, "useMarker": true});
        this.$el.find('.selected-column-list').append(this.nameTagListView.el);

        this.nameTagListView.$el.on("nametag:removed", function (e, cateId, el) {
            SelectColumnMenuView.clear();
            ColumnStore.remove(todoModel.id, cateId);

            self.isDirty = true;
            requestBurnupData.call(self);
        });
    }

    function toggleColumnTag(checked, cateId) {
        var column = getColumnAttrs.call(this, cateId);

        if (!this.nameTagListView) {
            return;
        }

        if (checked) {
            this.nameTagListView.addTag(cateId, GO.util.unescapeHtml(column.title), {"removable": true});
        } else {
            this.nameTagListView.removeTag(cateId);
        }
    }

    function getChartHeight() {
        var eh = this.$el.height(),
            th = this.$el.find('.todo_statistic_opt').outerHeight();

        return eh - th - 30;
    }

    function requestBurnupData() {
        var self = this;

        if (!this.isDirty) {
            drawPlotChart.call(this);
            return;
        }

        this.collection.getFilteredData(
            this.startDate,
            this.endDate,
            // 전체(==0)은 걸러낸다.
            _.without(ColumnStore.get(this.todoModel.id), 0)
        ).then(function () {
            drawPlotChart.call(self);
            self.isDirty = false;
        });
    }

    function drawPlotChart() {
        var placeholder = this.$el.find('[data-chart-placeholder]');
        var chartData = changeRequestDataToChartData.call(this);
        var colorCodes = [];

        placeholder.height(getChartHeight.call(this));

        _.each(chartData, function (v, key) {
            if (key !== 'total') {
                var $nameTag = this.nameTagListView.getNameTag(key);
                colorCodes.push($nameTag.data('marker'));
            }
        }, this);

        this.__plotObj = $.plot(placeholder, _.values(chartData), {
            series: {
                lines: {show: true},
                points: {show: true}
            },
            legend: {show: false},
            xaxis: {
                ticks: createFlotChartAxisXLabel.call(this)
            },
            yaxis: {min: 0, tickDecimals: 0},
            selection: {mode: "x"},
            grid: {
                hoverable: true,
                clickable: true
            },
            colors: colorCodes
        });

        bindPlotHoverEvent.call(this);
    }


    function changeRequestDataToChartData() {
        var sdate = this.startDate.clone(),
            edate = this.endDate.clone(),
            curDate = sdate,
            chartDataList = initChartData.call(this),
            columns = ColumnStore.get(this.todoModel.id);

        var _count = 0;
        while (curDate.isBefore(edate)) {
            var searchData = this.collection.findWhere({"date": curDate.format('YYYYMMDD')});
            _.each(columns, function(column){
                var value = getValue(searchData, column);
                chartDataList[column]['data'].push([_count, value]);
            });

            this.tootipData.push(curDate.format('MM/DD'));

            curDate.add(1, 'day');
            _count++;
        }

        return chartDataList;

        function getValue(searchData, column){
            var value = 0;

            if(searchData){
                if(isTotalColumn(column)){
                    value = searchData.get('totalCount');
                }else if(searchData.get("evaluatedMap")[column]){
                    value = searchData.get("evaluatedMap")[column]
                }
            }

            return value;
        }

        function initChartData() {
            var dataMap = {};
            var columns = ColumnStore.get(this.todoModel.id);

            _.each(columns, function (cateId) {
                var title = isTotalColumn(cateId) ? TodoLang["전체카드수"] : this.todoModel.getCategory(cateId).title;
                dataMap[cateId] = {
                    "label": title,
                    "data": []
                }
            }, this);

            return dataMap;
        }
    }

    function isTotalColumn(cateId){
        return cateId == 0;
    }

    function initDatepicker() {
        var self = this,
            sdt = this.startDate.toDate(),
            edt = this.endDate.toDate(),
            $startDate = this.$el.find('#start-date'),
            $endDate = this.$el.find('#end-date');

        $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);

        $startDate
            .val(this.startDate.format(FORMAT_DATE))
            .datepicker({
                defaultDate: sdt,
                maxDate: moment(new Date()).add(-1, 'day').format(FORMAT_DATE),
                changeMonth: true,
                changeYear: true,
                yearRange: "-1:+0",
                numberOfMonths: 1,
                dateFormat: "yy-mm-dd",
                yearSuffix: "",
                onSelect: function (selectedDate) {
                    $endDate.datepicker("option", {
                        "minDate": selectedDate,
                        "maxDate": setMaxEndDate(selectedDate, $endDate.val()).format(FORMAT_DATE)
                    });

                    changeDate.call(self, selectedDate, $endDate.val());
                }
            });

        $endDate
            .val(this.endDate.format(FORMAT_DATE))
            .datepicker({
                defaultDate: edt,
                minDate: sdt,
                maxDate: setMaxEndDate(this.startDate.format(FORMAT_DATE), this.endDate.format(FORMAT_DATE)).format(FORMAT_DATE),
                changeMonth: true,
                changeYear: true,
                yearRange: "+0:+1",
                numberOfMonths: 1,
                yearSuffix: "",
                onSelect: function (selectedDate) {
                    changeDate.call(self, $startDate.val(), selectedDate);
                }
            });
    }

    /**
     * (규칙)
     * - 일주일 이상이면 일주일 단위로 라벨 표시
     * - 일주일 이하이면 매번 표시
     */
    function createFlotChartAxisXLabel() {
        var sdt = this.startDate,
            edt = this.endDate,
            dur = edt.diff(sdt, 'day'),
            curDate = sdt.clone(),
            result = [];

        var _index = 0;
        while (curDate.isBefore(edt)) {
            var label = curDate.format('MM/DD');

            if (dur > 7 && (_index % 7 !== 0) && _index !== dur) {
                label = '';
            }

            result.push([_index, label]);
            curDate.add(1, 'day');
            _index++;
        }

        return result;
    }

    function attachPlotTooltip(contents, posX, posY) {
        var params = _.extend({}, {
            "position": 'absolute',
            "display": 'none',
            "top": posY,
            "border": '2px solid #4572A7',
            "padding": '2px 10px',
            "size": '10',
            "background-color": '#fff',
            "opacity": 0.80
        });


        $('.' + SELECTORS.tooltip).remove();

        $('<div class="' + SELECTORS.tooltip + '">' + contents + '</div>')
            .css(params)
            .appendTo("body");

        var winWidth = $(window).width();
        var tootipWidth = $('.' + SELECTORS.tooltip).outerWidth();
        var posAttr = {};

        if (tootipWidth + posX > winWidth) {
            posAttr['right'] = Math.abs(winWidth - posX);
        } else {
            posAttr['left'] = posX;
        }

        $('.' + SELECTORS.tooltip).css(posAttr).fadeIn(200);
    }

    function bindPlotHoverEvent() {
        var self = this,
            previousPoint = null;

        this.$el.on("plothover", function (event, pos, item) {
            if (item) {
                if (previousPoint != item.dataIndex) {
                    var x = item.datapoint[0],
                        y = item.datapoint[1],
                        content = "<strong>" + y + "</strong> (" + item.series.label + ")" + "<br>" + self.tootipData[item.dataIndex];

                    attachPlotTooltip(content, item.pageX, item.pageY);
                    previousPoint = item.dataIndex;
                }
            } else {
                $('.' + SELECTORS.tooltip).remove();
                previousPoint = null;
            }
        });
    }

    /**
     * 날짜 변경
     *
     * [규칙]
     * - 항상 시작일을 기준으로 계산
     * - 시작일은 max/min에 대한 제한이 없다.
     * - 종료일은 max/min에 대한 제한을 둔다.
     * - 변경 후 체크 조건은 세가지이다.
     *      1. 종료일은 미래의 날짜로 선택할 수 없음.
     *      2. 최대 검색 기간을 넘겼을 경우 : 시작일 기준 종료일을 최대 기간일로 변경
     *      3. 시작일이 종료일 이후로 설정되었을 경우 : 변경 전 기간으로 맞춰서 종료일을 변경한다.
     *
     * @param startDate
     * @param endDate
     */
    function changeDate(startDate, endDate) {
        var msdt = moment(startDate),
            medt = validateEndDate(startDate, endDate);

        this.startDate = msdt;
        this.endDate = validateEndDate(startDate, endDate);
        this.$el.find('#start-date').val(msdt.format(FORMAT_DATE));
        this.$el.find('#end-date').val(medt.format(FORMAT_DATE));

        this.isDirty = true;
        requestBurnupData.call(this);
    }

    function setMaxEndDate(startDate, endDate) {
        var maxEndDate = moment(startDate).add(MAX_DURATION_MONTH, 'month').endOf('day'),
            today = moment().endOf('day');

        // TODO: moment 2.7.0 이후 버전은 max 함수를 제공하므로 향후 패치 후 적용.
        if (maxEndDate.isAfter(today)) {
            maxEndDate = today;
        }

        return maxEndDate;
    }

    function validateEndDate(startDate, endDate) {
        var msdt = moment(startDate).clone().startOf('d'),
            medt = moment(endDate).clone().endOf('d'),
            result = medt;

        if (medt.isAfter(new Date())) {
            result = moment().endOf('day');
        }

        if (medt.diff(msdt, 'month') > MAX_DURATION_MONTH) {
            result = msdt.clone().add(MAX_DURATION_MONTH, 'month');
        }

        if (medt.isBefore(msdt)) {
            result = msdt.clone().add(medt.diff(msdt, 'days'), 'day')
        }

        return result;
    }

    return TodoBurnupChartView;
});
