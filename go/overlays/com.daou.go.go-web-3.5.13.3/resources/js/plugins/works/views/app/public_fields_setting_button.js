define('works/views/app/public_fields_setting_button', function (require) {

    var worksLang = require("i18n!works/nls/works");
    var Template = Hogan.compile([
        '<span class="ic_classic ic_setup"></span> ',
        '<span class="txt">', worksLang['공개 컴포넌트 설정'], '</span>'
    ].join(''));

    var Layer = require('works/views/app/public_fields_setting_layer');

    return Backbone.View.extend({

        className: 'btn_minor_s btn_attrSet',

        events: {},

        initialize: function (options) {
            this.type = options.type;
            this.fields = options.fields;
            this.suppressedFields = options.suppressedFields;
        },

        render: function () {
            this.$el.html(Template.render());

            this.layerView = new Layer({
                type: this.type,
                fields: this.fields,
                suppressedFields: this.suppressedFields
            });
            this.$el.append(this.layerView.render().el);
            this.layerView.linkBackdrop(this.$el);

            return this;
        },

        getSuppressedFields: function () {
            return this.layerView.getSuppressedFields();
        }
    });
});
