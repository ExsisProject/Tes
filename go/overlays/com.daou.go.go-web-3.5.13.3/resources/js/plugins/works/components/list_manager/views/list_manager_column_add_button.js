define("works/components/list_manager/views/list_manager_column_add_button", function (require) {

    var VALUE_TYPE = require('works/constants/value_type');
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        "컴포넌트를 목록 화면에 추가": worksLang["컴포넌트를 목록 화면에 추가"]
    };

    var Tmpl = Hogan.compile([
        '<a class="btn_tool btn_tool_more">',
        '<span class="ic_toolbar plus"></span>',
        '<span class="txt"><strong>{{lang.컴포넌트를 목록 화면에 추가}}</strong></span>',
        '<span class="ic ic_arrow_type3"></span>',
        '</a>',
    ].join(""));

    var ColumnManagerLayerView = require("works/components/filter/views/filter_condition_layer");

    var View = Backbone.View.extend({

        className: "btn_submenu",

        initialize: function (options) {
        },

        render: function () {
            this.$el.html(Tmpl.render({
                lang: lang
            }));

            this.$el.text(lang["조건추가"]);

            this._renderLayer();

            return this;
        },

        _renderLayer: function () {
            this.columnManangerLayer = new ColumnManagerLayerView({
                type: VALUE_TYPE.SELECT,
                parentCid: this.cid,
                collection: this.collection // fields
            });

            this.$el.attr("backdrop-toggle", true);
            this.columnManangerLayer.linkBackdrop(this.$el);
            this.columnManangerLayer.toggle(false);
            this.$el.append(this.columnManangerLayer.render().el);
        }
    });

    return View;
});
