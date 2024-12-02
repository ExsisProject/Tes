define("works/components/filter/views/filter_condition_button", function (require) {

    var ConditionLayerView = require("works/components/filter/views/filter_condition_layer");

    var ConditionOptions = require("works/components/filter/collections/filter_condition_options");

    var ConditionButtonTmpl = require("hgn!works/components/filter/templates/filter_condition_button");

    var ConditionButtonView = Backbone.View.extend({

        className: "btn_submenu",
        attributes: {"el-condition": ""},

        initialize: function (options) {
            // @deprecated
            this.type = options.type;
            // valueType도 필요해서 가독성 차원에서 fieldType으로 이름 변경
            this.fieldType = options.fieldType || options.type;// @deprecated
            this.valueType = options.valueType;

            this.deletable = options.deletable == false ? false : true;
            this.isInstant = options.isInstant || false; // default false

            this.fields = options.fields;

            this.zIndex = options.zIndex;

            this.model.on("unusedItem", this._onChangeUsed, this);

            this.collection = new ConditionOptions(this.model.get("options"));
            this.collection.on("toggleOption", this._onToggleOption, this);
            if (this.model.isSelectValueType()) {
                var values = this.model.get("values") ? this.model.get("values").values : [];
                this.collection.setLabel();
                this.collection.setUsed(values);
            } else if (this.model.isOrgType()) {
                this.collection.addConditionFromUsers(this.model.get("values").values);
            }

            this.$el.on("setLabelText", $.proxy(function () {
                this._setLabelText();
            }, this));
        },

        events: {
            "click span[el-delete]": "_onClickDelete"
        },

        render: function () {
            this.$el.html(ConditionButtonTmpl({model: this.model.toJSON()}));

            if (this.model.isOrgType()) this.$("a").addClass("fix_large");

            this._setLabelText();
            this._renderLayer();

            return this;
        },

        _renderLayer: function () {
            var options = {
                type: this.fieldType,// @deprecated
                fieldType: this.fieldType,// @deprecated
                valueType: this.valueType,
                parentCid: this.cid,
                model: this.model, // condition
                fields: this.fields,
                zIndex: this.zIndex
            };
            if (this.model.isSelectTypeCondition()) {
                options["collection"] = this.collection; // condition_options
            }
            this.$el.attr("backdrop-toggle", true);
            this.filterLayer = new ConditionLayerView(options);
            this.filterLayer.linkBackdrop(this.$el);
            this.filterLayer.toggle(this.isInstant);
            this.$el.append(this.filterLayer.render().el);
        },

        /**
         * 순서 중요 view.remove -> model.remove
         */
        _onChangeUsed: function () {
            this.model.off("unusedItem");
            this.remove();
            this.model.collection.remove([this.model]);
        },

        /**
         * 순서 중요. unuse -> search
         */
        _onClickDelete: function () {
            this.filterLayer.afterHide();
            this.model.set("isUsed", false); // condition
            this.model.collection.trigger("unuseCondition", this.model);
            this.$el.trigger("changeFilter");
            this.remove();
            this._removeDatepicker();
        },

        _onToggleOption: function () {
            var usedOptions = this.collection.getUsedOption();
            this.model.set("values", {
                values: usedOptions
            });

            this._setLabelText();
        },

        _setLabelText: function () {
            var label = this.model.getLabelText();
            this.$("strong[el-type='fieldLabel']").text(label);
            this.$("strong[el-type='fieldLabel']").attr("title", label);
        },

        _removeDatepicker: function () {
            $("#ui-datepicker-div").empty();
        }
    });

    return ConditionButtonView;
});
