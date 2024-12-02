define(function(require) {
    var moment = require('moment');

    var MatrixCollection = require('matrix/collections/matrix_collection');
    return MatrixCollection.extend({

        initialize: function(models, options) {
            this.deptId = options.deptId;
            this.rangeType = options.rangeType || 'week';
            this.setRangeType(this.rangeType);
            this.page = 0;
            this.offset = 20;
        },

        url: function() {
            return GO.contextRoot + 'api/task/depts/' + this.deptId + '?' + this._getParam();
        },

        parse: function(resp) {
            if (resp.page) this._setPageInfo(resp);
            _.each(resp.data, function(row) {
                _.each(row.tasks, function(task) {
                    if (!task.beginDate && task.dueDate) task.beginDate = moment(task.dueDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
                    if (task.beginDate && !task.dueDate) task.dueDate = moment(task.beginDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
                });
            });

            return _.map(resp.data, function(row) {
                return {
                    rowKey: row.member.id,
                    rowTitle: row.member.name,
                    rowSubTitle: row.member.position || '',
                    values: this.initMatrixItems(row.tasks, {
                        startTimeKey: 'beginDate',
                        endTimeKey: 'dueDate'
                    })
                }
            }, this);
        },

        changeTimeCallback: function() {
            this.page = 0;
            this.setRangeFromMatrix();
            this.fetch();
        },

        setRangeType: function(rangeType) {
            this.rangeType = rangeType;
            this.setRange();
        },

        setRangeFromMatrix: function() {
            this.fromDate = this.matrix.get('startTime');
            this.toDate = this.matrix.get('endTime');
        },

        setRange: function() {
            this.fromDate = moment().startOf(this.rangeType).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
            this.toDate = moment().endOf(this.rangeType).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        },

        hasMore: function() {
            return !this.lastPage;
        },

        getFullIndex: function(index) {
            return this.page * this.offset + index;
        },

        _getParam: function() {
            return $.param({
                fromDate: this.fromDate,
                toDate: this.toDate,
                page: this.page,
                offset: this.offset
            });
        },

        _setPageInfo: function(resp) {
            _.each(resp.page, function(value, key) {
                this[key] = value;
            }, this);
        }
    });
});