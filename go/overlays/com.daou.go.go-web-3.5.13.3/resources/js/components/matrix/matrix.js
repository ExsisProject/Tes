define(function(require) {
    require('jquery.ui');

    var MATRIX_EVENT = require('matrix/constants/matrix_event');

    var commonLang = require('i18n!nls/commons');
    var calendarLang = require('i18n!calendar/nls/calendar');

    var Backbone = require('backbone');

    var Matrix = require('matrix/models/matrix');
    var MatrixItem = require('matrix/models/matrix_item');

    var RowView = require('matrix/views/matrix_row');
    var ItemView = require('matrix/views/matrix_item');

    var Template = require('hgn!matrix/templates/matrix');

    var lang = {
        '오늘': commonLang['오늘'],
        '이전': commonLang['이전'],
        '다음': commonLang['다음'],
        '주간': calendarLang['주간'],
        '일간': calendarLang['일간']
    };
    var DEFAULT_HEAD_WIDTH = 100;

    return Backbone.View.extend({

        isDragging: false,
        draggedRow: null,
        correctionValue: 0,

        attributes: {'data-matrix': ''},

        initialize: function(options) {
            this.matrix = new Matrix(options.matrix);
            this.leftToolbar = options.leftToolbar || '';
            this.rightToolbar = options.rightToolbar || '';
            this.emptyMessage = options.emptyMessage || '';
            this.matrixHeader = options.matrixHeader || '';

            this.listenTo(this.collection, 'sync', this.render);
            this.collection.setMatrix(this.matrix);
            this.collection.fetch();

            this._bindResize();
        },

        events: {
            'click [data-matrix-item]': '_onClickItem',
            'click [data-matrix-row]': '_onClickRow',
            'click [data-row-head]': '_onClickRowHead',
            'mousedown [data-matrix-row]': '_onMouseDownRow',
            'mouseup [data-matrix-row]': '_onMouseUpRow',
            'mousemove [data-matrix-row]': '_onMouseMoveRow',
            'click #datePickerBtn': '_onClickDatePicker',
            'click #today': '_onClickToday',
            'click #prev': '_onClickPrev',
            'click #next': '_onClickNext'
        },

        render: function() {
            this._render();
            this.$el.trigger(MATRIX_EVENT.RENDER_DONE);

            return this;
        },

        fetch: function() {
            this.collection.fetch();
        },

        getMatrix: function() {
            return this.matrix;
        },

        _render: function() {
            this.$el.html(Template({
                lang: lang,
                range: this.matrix.getDateRange(),
                columns: this.matrix.get('columns'),
                columnSize: this.matrix.getColumnLength(),
                headerColumn: this.matrix.getHeaderColumns(),
                headerColSpan: _.isUndefined(this.matrix.get('headerColSpan')) ? 1 : this.matrix.get('headerColSpan'),
                rows: this.collection.toJSON(),
                isEmpty: this.collection.isEmpty(),
                leftToolbar: this.leftToolbar,
                rightToolbar: this.rightToolbar,
                emptyMessage: this.emptyMessage,
                matrixHeader: this.matrixHeader,
                displayTimeLine: this.matrix.isDayType() && !this.collection.isEmpty()
            }));

            this.matrix.set('bodyWidth', this.$('div[data-matrix-body]').width());
            this.matrix.set('columnWidth', this.$('td[data-matrix-column]:first').outerWidth());
            this.matrix.set('minRowHeight', this.$('td[data-row-head]').outerHeight());

            this.correctionValue = 0;
            this._correction();
            this._renderRows();
            this._initDatePicker();
            this._renderTimeLine();
        },

        _renderRows: function() {
            this.$('div[data-matrix-body]').empty();
            this.collection.each(function(model, index) {
                this._appendRow(model, index);
            }, this);
        },

        _appendRow: function(model, index) {
            var rowView = new RowView({
                matrix: this.matrix,
                model: model
            });
            this.$('div[data-matrix-body]').append(rowView.render().el);

            var height = rowView.$el.height();
            this.$('tr[data-row]:eq(' + index + ')').css('height', height);
        },

        _renderTimeLine: function() {
            var rowHeadWidth = this.matrix.get('rowHeadWidth');
            var matrixLeft = this.matrix.dateToPixel();
            var left = rowHeadWidth + matrixLeft;

            if (matrixLeft < 0 || matrixLeft > this.matrix.get('bodyWidth')) {
                this.$('#timeLine').hide();
            } else {
                this.$('#timeLine').css({
                    left: left + 'px',
                    height: this.$('[data-matrix-body]').height()
                });
            }
        },

        _bindResize: function() {
            $(window).on('resize.matrix', $.proxy(function(e) {
                if ($(e.target).attr('data-matrix-item') == '') return false;
                this._correction();
                var columnWidth = this.$('td[data-matrix-column]:first').outerWidth();
                this.matrix.set('bodyWidth', this.$('div[data-matrix-body]').width());
                this.matrix.set('columnWidth', columnWidth);
                if (this.matrix.get('useGrid')) {
                    if (this.matrix.get('resizable')) this.$('div[data-matrix-item]').resizable('option', 'grid', [columnWidth]);
                    if (this.matrix.get('draggable')) this.$('div[data-matrix-item]').draggable('option', 'grid', [columnWidth]);
                }
                this._renderTimeLine();
            }, this));
        },

        /**
         * 모든 컬럼을 동일한 크기로 조정하여 오차를 생기지 않게 하기 위한 함수.
         * bodyWidth 를 column 갯수로 나눈 나머지를 보정값으로 정하고 head 의 너비값에 더해준다.
         * absolute position 인 body 의 left 도 이동시켜준다.
         */
        _correction: function() {
            var $head = this.$('th:first');
            this.correctionValue = (this.correctionValue + this.$('div[data-matrix-body]').width()) % this.matrix.get('columns').length;
            var rowHeadWidth = DEFAULT_HEAD_WIDTH + this.correctionValue;
            $head.css('width', rowHeadWidth + 'px');
            this.matrix.set('rowHeadWidth', rowHeadWidth);
            this.$('[data-matrix-body]').css('left', $head.outerWidth());
        },

        _onClickItem: function(e) {
            e.stopPropagation();
            var isResizing = $(e.currentTarget).find('.ui-resizable-handle').length > 0;
            if (isResizing) return;
            console.log('on click item');
            var itemId = $(e.currentTarget).attr('data-matrix-item');
            this.$el.trigger(MATRIX_EVENT.ITEM_CLICK, {itemId: itemId, target: $(e.currentTarget)});
        },

        _onClickRow: function(e) {
            this.$el.trigger(MATRIX_EVENT.ROW_CLICK);
        },

        _onClickRowHead: function(e) {
            this.$el.trigger(MATRIX_EVENT.ROW_HEAD_CLICK, {rowId: $(e.currentTarget).attr('data-row-head')});
        },

        _onMouseDownRow: function(e) {
            if (e.which == 3) return; // 우클릭 제한
            if (!this.matrix.get('useDrag')) return;
            if ($(e.target).parents('[data-matrix-item]').length) return false;
            console.log('on mouse down row');

            var $target = $(e.currentTarget);
            var $column = this._getColumnFromPoint(e);
            var startTime = $column.attr('data-column-key');
            var model = new MatrixItem({
                startTime: startTime,
                endTime: startTime
            }, {
                matrix: this.matrix
            });
            model.setEndDateByGrid(1);
            this.newItemView = new ItemView({
                matrix: this.matrix,
                model: model
            });
            $target.append(this.newItemView.render().el);
            this.newItemView.$el.css('opacity', 0.5);

            this.isDragging = true;
            this.draggedRow = $target;

            this.$el.trigger(MATRIX_EVENT.ROW_MOUSE_DOWN, {column: $column, item: this.newItemView});
        },

        _onMouseUpRow: function(e) {
            if (!this.matrix.get('useDrag')) return;
            if (!this.isDragging) return;
            console.log('on mouse up row');

            var $column = this._getColumnFromPoint(e);
            this.$el.trigger(MATRIX_EVENT.ROW_MOUSE_UP, {column: $column, item: this.newItemView, row: this.draggedRow});

            this.isDragging = false;
            this.draggedRow = null;
        },

        _onMouseMoveRow: function(e) {
            if (!this.matrix.get('useDrag')) return;
            if (!this.isDragging) return;

            var $column = this._getColumnFromPoint(e);
            if (!$column) return;

            var endTime = $column.attr('data-column-key');

            this.newItemView.setEndDateByGrid(endTime);
            this.newItemView.render();
        },

        _getColumnFromPoint: function(e) {
            var $target = $(e.currentTarget);
            var $parent = $target.parent('div[data-matrix-body]');
            $parent.hide();
            var $column = $(document.elementFromPoint(e.clientX, e.clientY));
            $parent.show();
            if (!$column.attr('data-column-key')) $column = null; // 아직은 발생한 case 가 없으나, modal 등 다른 엘리먼트가 상위에 뜬 경우 처리가 필요함.

            return $column;
        },

        _initDatePicker: function() {
            $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
            this.$("#matrixDate").datepicker({
                yearSuffix: "",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                beforeShow : function(elplaceholder, object) {
                    object.dpDiv.attr("data-layer", "");
                    var isBefore = true;
                    $(document).trigger("showLayer.goLayer", isBefore);
                },
                onClose : function() {
                    var isBefore = true;
                    $(document).trigger("hideLayer.goLayer", isBefore);
                },
                onSelect: $.proxy(function(selectedDate) {
                    this.selectedDate = selectedDate;
                    this.collection.changeTime(selectedDate);
                }, this)
            });
            if (this.selectedDate) this.$("#matrixDate").datepicker('setDate', this.selectedDate);
        },

        _onClickDatePicker: function() {
            this.$('#matrixDate').focus();
        },

        _onClickToday: function() {
            this.collection.today();
        },

        _onClickPrev: function() {
            this.collection.prev();
        },

        _onClickNext: function() {
            this.collection.next();
        }
    });
});