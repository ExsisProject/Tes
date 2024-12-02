define(function(require) {

    var MATRIX_EVENT = require('matrix/constants/matrix_event');

    var Backbone = require('backbone');
    var moment = require('moment');

    var Template = require('hgn!matrix/templates/matrix_item');
    return Backbone.View.extend({

        className: 'schedule_time',
        attributes: {'data-matrix-item': '', style: 'position: absolute;'}, // draggable position 확인

        initialize: function(options) {
            this.matrix = options.matrix;
            this.$el.attr('data-matrix-item', this.model.id);
            this.$el.data('model', this.model);
        },

        render: function() {
            var renderer = this.matrix.get('contentRenderer').call(this);
            var content = _.isObject(renderer) ? renderer.content : renderer;
            var title = _.isObject(renderer) ? renderer.title : renderer;
            var otherCompanyReservation = _.isObject(renderer) ? !!renderer.otherCompanyReservation : false;

            this.$el.html(Template({
                content: content,
                title: title,
                otherCompanyReservation : otherCompanyReservation
            }));
            this._setPosition();
            if (this.matrix.get('draggable')) this._initDraggable();
            if (this.matrix.get('resizable')) this._initResizable();

            return this;
        },

        isValid: function() {
            return this.model.isValid();
        },

        revert: function() {
            this.model.set({
                startTime: this.model.previous('startTime'),
                endTime: this.model.previous('endTime')
            });
            this.render();
        },

        setEndDateByGrid: function(endTime) {
            this.model.set('endTime', endTime);
            this.model.setEndDateByGrid(1);
        },

        _setPosition: function() {
            this.$el.css(this.model.dateToPosition());
        },

        _initDraggable: function() {
            this.$el.draggable({
                containment: 'parent',
                grid: this.matrix.get('useGrid') ? [this.matrix.get('columnWidth')] : false,
                snap: this.matrix.get('useGrid') ? false : '.schedule_time',
                stop: $.proxy(function(event, ui) {
                    if (this.matrix.get('useGrid')) {
                        var coefficient = (ui.position.left - ui.originalPosition.left) / this.matrix.get('columnWidth');
                        this.model.setDateByGrid(coefficient);
                    } else {
                        var ratio = this.matrix.pixelToRatio(ui.position.left);
                        var date = this.model.ratioToDate(ratio);
                        var diff = moment(this.model.get('endTime')).diff(this.model.get('startTime'));

                        ui.helper.css('left', ratio + '%');
                        this.model.set({
                            startTime: date,
                            endTime: moment(date).add(diff).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
                        });
                    }

                    console.log(this.model.toJSON());
                    this.$el.trigger(MATRIX_EVENT.ITEM_CHANGE, {item: this});
                }, this)
            });
        },

        _initResizable: function() {
            this.$el.resizable({
                handles: 'e',
                grid: this.matrix.get('useGrid') ? [this.matrix.get('columnWidth')] : false,
                stop: $.proxy(function(event, ui) {
                    if (this.matrix.get('useGrid')) {
                        var value = (ui.size.width - ui.originalSize.width) / this.matrix.get('columnWidth');
                        this.model.setEndDateByGrid(value);
                    } else {
                        var widthRatio = this.matrix.pixelToRatio(ui.size.width);
                        var leftRatio = this.matrix.pixelToRatio(ui.position.left);

                        ui.helper.css({
                            width: widthRatio + '%',
                            left: leftRatio + '%'
                        });
                        this.model.set({endTime: this.model.ratioToDate(leftRatio + widthRatio)});
                    }

                    console.log(this.model.toJSON());
                    this.$el.trigger(MATRIX_EVENT.ITEM_CHANGE, {ui: ui, item: this});
                }, this)
            });
        }
    });
});