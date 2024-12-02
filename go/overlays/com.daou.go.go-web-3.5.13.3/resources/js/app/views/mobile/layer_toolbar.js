;(function() {
    define([
            "jquery",
            "underscore",
            "backbone",
            'app',
            "hgn!templates/mobile/layer_toolbar",
            "GO.util"
        ],
        function(
            $,
            _,
            Backbone,
            GO,
            LayerToolbarTpl
        ) {
            var instance = null;
            var LayerToolbar = Backbone.View.extend({
                el : '#headerToolbar',
                initialize : function() {
                    this.unbindEvent();
                    this.bindEvent();
                },
                unbindEvent : function() {
                    this.$el.off('vclick', '#btnClose');
                    this.$el.off('vclick', 'a[data-role]');
                },
                bindEvent : function() {
                    this.$el.on('vclick', '#btnClose', $.proxy(this.btnClose, this));
                    this.$el.on('vclick', 'a[data-role=layerConfirm]', $.proxy(this.confirm, this));
                    this.$el.on('vclick', 'a[data-role=layerConfirmOther]', $.proxy(this.confirmOther, this));
                },
                render : function(options) {
                    this.options = options || {};
                    this.$sideEl = $('#side');
                    this.$contentEl = $('.go_content');

                    this.title = this.options.title;
                    this.rightButton = this.options.rightButton;
                    this.rightButtonOther = this.options.rightButtonOther;
                    this.btnCloseCallback = this.options.cancelButton.callback;
                    this.btnRightCallback = this.options.rightButton.callback;
                    this.btnRightOtherCallback = (this.rightButtonOther) ? this.options.rightButtonOther.callback : "";

                    this.$el = this.$el.empty();
                    this.$el.append(LayerToolbarTpl({
                        title : this.title,
                        rightButton : this.rightButton,
                        rightButtonOther : this.rightButtonOther
                    }));


                    this.$sideEl.css('visibility','hidden');
                    return this.el;
                },
                btnClose : function(e) {
                    var $targetEl = $(e.currentTarget);
                    $targetEl.blur().trigger('focusout');
                    e.preventDefault();
                    e.stopPropagation();
                    if(typeof this.btnCloseCallback == 'function') this.btnCloseCallback(e);
                    return false;
                },
                confirm : function(e) {
                    var $targetEl = $(e.currentTarget);
                    $targetEl.blur().trigger('focusout');
                    e.preventDefault();
                    e.stopPropagation();
                    if(typeof this.btnRightCallback == 'function') this.btnRightCallback(e);
                    return false;
                },
                confirmOther : function(e){
                    var $targetEl = $(e.currentTarget);
                    $targetEl.blur().trigger('focusout');
                    e.preventDefault();
                    e.stopPropagation();
                    if(typeof this.btnRightOtherCallback == 'function') this.btnRightOtherCallback(e);
                    return false;
                }
            }, {
                render : function(opts) {
                    if(instance == null) instance = new LayerToolbar();
                    return instance.render(opts);
                }
            });

            return LayerToolbar;
        });

}).call(this);