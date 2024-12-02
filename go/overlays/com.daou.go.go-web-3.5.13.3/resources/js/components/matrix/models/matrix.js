/**
 * matrix 컴포넌트 내 모든 모델, 뷰, 컬렉션에 공유되는 모델.
 *
 * @attributes
 * type: day, week // 일간타입 주간타입.
 * gridUnit: column 단위. TODO 현재는 복수형이나 단수형으로 전환 가능해보임.
 * gridValue: column 값 gridUnit 과 합쳐 컬럼의 크기를 나타냄. ex) 30 minutes. 1 days.
 * startTime: 시작 지점의 날짜.
 * endTime: 종료 지점의 날짜. 계산 편의를 위하여 0.001 초에 유의하자. ex) 1일 59.999초 (X) -> 2일 00.000초 (O)
 * useGrid: D&D 나 resize 를 사용 할 때 grid 단위로 할 것인지 여부.
 * useDrag: 비어있는 td를 Drag 하여 간편 등록(?) 기능 사용 여부.
 * navigationInterval: day, week. navigation 단위. type 과는 다르다.
 * contentRenderer: content renderer
 * itemHeight: item height
 * headerColSpan: 컬럼이 많아지는경우 header 에 colspan 을 적용 할 수 있다.
 */
define(function() {
    var Backbone = require('backbone');
    var moment = require('moment');

    var FULL_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
    var YMD = 'YYYY-MM-DD (dd)';
    var LABEL_FORMAT = {
        week: {
            label: 'MM-DD (dd)',
            key: FULL_DATE_FORMAT
        },
        day: {
            label: 'HH',
            key: FULL_DATE_FORMAT
        }
    };
    
    return Backbone.Model.extend({

        initialize: function() {
            this.initMatrix();
        },

        defaults: {
            itemHeight: 23,
            columns: [],
            headerColSpan: 1
        },

        initMatrix: function(force) {
            this.initTimes(force);
            this.initColumns();
            this._initHeaderColSpan();
        },

        pixelToRatio: function(pixel) {
            return pixel / this.get('bodyWidth') * 100;
        },

        ratioToPixel: function(ratio) {
            return ratio / 100 * this.get('bodyWidth');
        },

        dateToRatio: function(date) {
            date = date || new Date();
            var startTime = moment(this.get('startTime'));
            var endTime = moment(this.get('endTime'));
            return (moment(date) - startTime) / (endTime - startTime) * 100;
        },

        dateToPixel: function(date) {
            var ratio = this.dateToRatio(date);
            return this.ratioToPixel(ratio);
        },

        setInterval: function(interval) {
            this.set('navigationInterval', interval);
        },

        getColumnLength: function() {
            return this.get('columns').length;
        },

        getHeaderColumns: function() {
            var columns = this.get('columns');
            if (this.get('type') == 'day') {
                columns = _.filter(columns, function(column, index) {
                    return index % 2 == 0;
                });
            }
            return columns;
        },

        getDateRange: function() {
            var startTime = moment(this.get('startTime'));
            var endTime = moment(this.get('endTime'));
            var diff = endTime.diff(startTime, 'day');

            return diff <= 1 ? startTime.format(YMD) : startTime.format(YMD) + ' ~ ' + endTime.format(YMD);
        },

        initTimes: function(isForce) {
            if (isForce || !this.get('startTime') && !this.get('endTime')) {
                var startTime = moment(new Date()).startOf(this.get('navigationInterval')).format(FULL_DATE_FORMAT);
                var endTime = moment(new Date()).endOf(this.get('navigationInterval')).add(1, 'milliseconds').format(FULL_DATE_FORMAT);
                this.set('startTime', startTime);
                this.set('endTime', endTime);
            }
        },

        /**
         * gridUnit 이 days 이면 today 및 sunday 스타일 표시를 해주자.
         */
        initColumns: function() {
            var columns = [];
            var gridValue = parseInt(this.get('gridValue'));
            var date = moment(this.get('startTime'));
            var columnCount = moment(this.get('endTime')).diff(this.get('startTime'), this.get('gridUnit')) / gridValue;
            for (var i = 0; i < columnCount; i++) {
                var column = {
                    label: date.format(LABEL_FORMAT[this.get('type')]['label']),
                    key: date.format(LABEL_FORMAT[this.get('type')]['key'])
                };
                if (this.get('gridUnit') == 'days') column['isSunday'] = date.day() == 0;
                if (this.get('gridUnit') == 'days') column['isToday'] = date.isSame(new Date(), 'day');
                columns.push(column);
                date.add(gridValue, this.get('gridUnit'));
            }
            this.set('columns', columns);
        },

        isDayType: function() {
            return this.get('type') === 'day';
        },

        _initHeaderColSpan: function() {
            if (this.get('type') == 'day') this.set('headerColSpan', 2);
        }
    });
});