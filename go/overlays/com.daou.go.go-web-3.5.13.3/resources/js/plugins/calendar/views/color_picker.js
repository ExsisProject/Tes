define([
        "underscore",
        "backbone",
        "app",
        "hgn!calendar/templates/color_picker",
        "i18n!calendar/nls/calendar"
    ],

    function (
        _,
        Backbone,
        GO,
        ColorPickerTpl,
        calLang
    ) {
        var ColorPicker,
            // 호출한 사이드 메뉴의 타입(내일정 / 구독캘린더)
            // >>>> TO-DO: 캘린더 전역 상수로 빼야 한다.
            CALLER_TYPE = {'calendar': 'calendar', 'feed': 'feed', 'works': 'works'},
            POSITION_TYPE = {'left': 'left', 'right': 'right'},
            COLOR_PICKER_ID = "color-picker",
            NUM_OF_COLORS = 18, // 색상코드 갯수
            NUM_OF_COLS = 6, // 한줄당 색상코드 갯수
            additionText = calLang["2인 이상 일정"],
            label_color = calLang["색상"];

        ColorPicker = Backbone.View.extend({
            id: COLOR_PICKER_ID,
            className: "layer_normal layer_pallete",
            target: null,
            oldTarget: null,
            type: CALLER_TYPE.feed,

            events: {
                "click .pallete_color": "selectedColor",
                'change input': 'onChangeInput'
            },

            initialize: function (options) {
                console.log("[ColorPicker#initialize] ColorPicker initializing...");
                this.target = null;
                this.oldTarget = null;
                this.useAddition = options.useAddition;
                this.useAdditionInput = options.useAdditionInput;
                this.additionText = options.additionText || additionText;
                // 기본 숨긴다.
                this.$el.hide();
                this.render();
            },

            delegateEvents: function (events) {
                var self = this;
                this.undelegateEvents();
                Backbone.View.prototype.delegateEvents.call(this, events);
                Backbone.$("body").on("click.colorpicker", function (e) {
                    var $target = $(e.target);
                    if ($target.is("span.chip")) return;
                    if (!self.isShow()) return;
                    if ($target.parents('#color-picker').length > 0) return;
                    self.hide();
                });
            },

            undelegateEvents: function (events) {
                Backbone.View.prototype.undelegateEvents.call(this, events);
                Backbone.$("body").off(".colorpicker");
            },

            render: function () {
                var html = ColorPickerTpl(_.extend({
                    color_set: this.buildColorSetVars(),
                    useAddition: this.useAddition,
                    useAdditionInput: this.useAdditionInput
                }, {
                    additionText: this.additionText,
                    label_color: label_color
                }));
                this.$el.html(html);
                this.$el.appendTo('#main');
            },

            setTargetElement: function (target) {
                this.target = target;
                return this;
            },

            setType: function (newType) {
                if (_.indexOf(_.values(CALLER_TYPE), newType) === -1) throw new Error("Invalid Caller Type");
                this.type = newType;
                return this;
            },

            setPosition: function (position) {
                this.position = position;
                return this;
            },

            show: function (e) {
                var $target = typeof e === 'undefined' ? $(this.target) : $(e.target),
                    offset = $target.offset();
                if (!this.target) this.target = $target;

                this.$el.show();

                if (this.position == POSITION_TYPE.left) {
                    this.$el.css("left", offset.left - this.$el.outerWidth() - 4);
                    this.$el.css("top", offset.top + $target.height() + 7);
                } else {
                    this.$el.css("left", offset.left + $target.width() + 4);
                    this.$el.css("top", offset.top - 7);
                }
            },

            isShow: function () {
                return $(this.el).is(':visible');
            },

            selectedColor: function (e) {
                console.log("[ColorPicker#selectedColor] selected calendar color...");
                e.preventDefault();
                var $target = $(e.target);
                if (!$target.attr('data-code')) throw new Error("[ColorPicker#selectedColor] Invalid Color Code");
                // singleton only. deprecated
                $(this.target).trigger('changed:chip-color', [$target.attr('data-code'), this.type]);
                this.trigger('changed:chip-color', $target.attr('data-code'));
                this.hide();
            },

            hide: function () {
                this.$el.hide();
            },

            toggle: function (e) {
                return (this.isShow() ? this.hide(e) : this.show(e));
            },

            buildColorSetVars: function () {
                var colorSet = [];
                for (var i = 1; i <= NUM_OF_COLORS; i++) {
                    colorSet.push({"color_code": i, "last_cols?": (i % NUM_OF_COLS === 0)});
                }
                return colorSet;
            },

            onChangeInput: function (e) {
                var $target = $(e.currentTarget);
                this.trigger('changed:addition-checkbox', $target.is(':checked'));
                this.hide();
            }
        }, {
            __instance__: null,

            create: function (target, type, position) {
                releaseInstance.call(this);
                this.type = type;
                if (this.__instance__ === null) this.__instance__ = new this.prototype.constructor({type: type});
                this.__instance__.setTargetElement(target);
                this.__instance__.setType(type);
                this.__instance__.setPosition(position);

                return this.__instance__;
            },

            show: function (target, type, position) {
                console.log("[ColorPicker.show] show ColorPicker");
                var instance = this.create(target, type, position);
                instance.show();
            },

            hide: function (target, type) {
                var instance = this.create(target, type);
                instance.hide();
            },

            toggle: function (target, type) {
                var instance = this.create(target, type);
                instance.toggle();
            }
        });

        function releaseInstance() {
            if (this.__instance__ && this.__instance__.$el.parents('#main').length < 1) {
                this.__instance__.remove();
                this.__instance__ = null;
            }
        }

        return ColorPicker;
    });
