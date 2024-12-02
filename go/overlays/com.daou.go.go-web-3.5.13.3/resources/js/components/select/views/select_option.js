define('components/select/views/select_option', function(require) {
    var CheckableSelectItemTmpl = Hogan.compile([
        '<div el-option-wrapper data-value="{{value}}">', // 디자인 파일에는 없는 wrapper 추가.
            '<span class="wrap_option app_tit_s">',
                '{{#useCheckbox}}',
                '<input type="checkbox" name="type" value="{{value}}" id="option{{value}}{{cid}}" {{#model.isUsed}}checked{{/model.isUsed}}>',
                '{{/useCheckbox}}',
                '{{#iconPath}}',
                '<span class="app_icon"><img src="{{iconPath}}"></span>',
                '<span class="app_name">{{label}}</span>',
                '{{/iconPath}}',
                '{{^iconPath}}',
                '<label for="option{{value}}{{cid}}"><span class="app_name">{{label}}</span></label>',
                '{{/iconPath}}',
            '</span>',
        '</div>'
    ].join(""));

    return Backbone.View.extend({

        attributes : {"el-option" : ""},

        initialize : function(options) {
            this.parentCid = options.parentCid;
            this.valueKey = options.valueKey || 'cid';
            this.labelKey = options.labelKey || 'label';
            this.iconPathKey = options.iconPathKey;
            this.useCheckbox = options.useCheckbox !== false;
            /**
             * model : condition_option or field
             */
            this.model.on("change:isUsed", this._onChangeUsed, this);
        },

        events : {
            "change input" : "_onChangeInput",
            "click [el-option-wrapper]" : "_onClickOption"
        },

        render : function() {
            this.$el.html(CheckableSelectItemTmpl.render({
                useCheckbox: this.useCheckbox,
                value: this.model.get(this.valueKey),
                label: this.model.get(this.labelKey),
                iconPath: this.model.get(this.iconPathKey),
                model : this.model.toJSON(),
                cid : this.cid,
                parentCid: this.parentCid
            }));

            return this;
        },

        /**
         * 조건 추가버튼 -> model : field
         * 조건 버튼 	 ->	model : condition option
         * 컬럼 추가버튼 -> model : field
         */
        _onChangeInput : function() {
            var isChecked = this.$("input").is(":checked");
            this.model.set("isUsed", isChecked); // field or condition_option
            this.model.collection.trigger("toggleOption", this.model); // field or condition_option

            this.$el.trigger("toggleField", this.model);
            this.$el.trigger("changeFilter", isChecked);

            if (this.model.get("isOrgType") && !isChecked && this.model.get('type') !== 'function') {
                this.model.collection.remove([this.model]);
                this.$el.hide();
                setTimeout($.proxy(function() {
                    this.remove();
                }, this), 100);
            }
        },

        _onChangeUsed : function() {
            this.$("input").prop("checked", this.model.get("isUsed"));
        },

        _onClickOption : function(event) {
            event.stopPropagation();
            this.$el.trigger('clickOption', {value: $(event.currentTarget).attr('data-value')});
        }
    });
});