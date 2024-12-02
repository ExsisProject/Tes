define('components/select/views/select', function(require) {

    var SelectLayer = require('components/select/views/select_layer');

    var Template = Hogan.compile([
        '<a class="btn_tool">',
            '<span class="ic ic_mapping_s"></span>',
            '<span class="txt">{{buttonText}}</span>',
            '<span class="ic ic_arrow_type3"></span>',
        '</a>'
    ].join(""));

    return Backbone.View.extend({
            className: 'btn_submenu',

        initialize: function(options) {
            this.labelKey = options.labelKey;
            this.valueKey = options.valueKey;
            this.iconPathKey = options.iconPathKey;
            this.useScroll = options.useScroll;
            this.useCheckbox = options.useCheckbox === false ? false : true;
            this.buttonText = options.buttonText;
        },

        render: function() {
            this.$el.html(Template.render({
                buttonText: this.buttonText
            }));

            this._renderLayer();

            return this;
        },

        _renderLayer: function() {
            this.layerView = new SelectLayer({
                useScroll: this.useScroll,
                useCheckbox: this.useCheckbox,
                valueKey: this.valueKey,
                iconPathKey: this.iconPathKey,
                labelKey: this.labelKey,
                collection: this.collection
            });

            this.$el.attr("backdrop-toggle", true);
            this.layerView.linkBackdrop(this.$el);
            this.layerView.toggle(false);
            this.$el.append(this.layerView.render().el);
        }
    });
});