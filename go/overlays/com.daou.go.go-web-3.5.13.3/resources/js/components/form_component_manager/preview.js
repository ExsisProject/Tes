define('components/form_component_manager/preview', function (require) {

    require('formutil');
    var Template = require('hgn!components/form_component_manager/templates/preview');

    return Backbone.View.extend({

        className: 'wrap_prototype_preview',
        attributes: {'style': 'display: none;'},

        events: {
            'click .btn_close': '_onClickClose'
        },

        render: function () {
            this.$el.html(Template);
            this._setHeight();
            $(window).on('resize', _.bind(function () {
                this._setHeight();
            }, this));

            return this;
        },

        /**
         * width 를 일단 제외한다. 상대너비를 가진 양식이 미리보기에서 다르게 보임.
         */
        show: function(title, contents, width) {
            this.$el.show();
            if (title !== false) this.$('[data-preview-title]').text(title);
            this.$('.editorBox').css({width: '100%'}).setTemplate({
                data: contents
            });
        },

        _onClickClose: function() {
            this.$el.hide();
            this.$el.trigger('hide');
        },

        _setHeight: function () {
            this.$('.editorBox').outerHeight($(window).outerHeight() - (this.$('.gnb').outerHeight() || 60));
        }
    });
});