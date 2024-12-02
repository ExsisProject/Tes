define('components/select/views/select_layer', function(require) {
    var BackdropView = require("components/backdrop/backdrop");
    var CheckableSelectView = require('components/select/views/select_list');
    var Template = require('hgn!components/select/templates/select_layer');

    var commonLang = require("i18n!nls/commons");
    var lang = {
        "확인" : commonLang["확인"],
        "취소" : commonLang["취소"]
    };

    return BackdropView.extend({

        className : 'array_option array_copy_opt',
        contentView: null,

        initialize: function(options) {
            this.backdropToggleEl = this.$el;
            this.bindBackdrop();

            this.labelKey = options.labelKey;
            this.valueKey = options.valueKey;
            this.iconPathKey = options.iconPathKey;
            this.useScroll = options.useScroll;
            this.useCheckbox = options.useCheckbox !== false;
        },

        events : {
            "click a[el-type='submit']" : "_onClickSubmit",
            "click a[el-type='cancel']" : "_onClickCancel"
        },

        render : function() {
            this.$el.html(Template({
                lang : lang,
                useFooter : this.options.useFooter
            }));

            this.contentView = new CheckableSelectView({
                useScroll: this.useScroll,
                useCheckbox: this.useCheckbox,
                valueKey: this.valueKey,
                labelKey: this.labelKey,
                iconPathKey: this.iconPathKey,
                collection : this.collection
            });
            this.$el.prepend(this.contentView.render().el);

            return this;
        },

        afterShow: function() {
            this.$('input[type="text"]').focus();
        },

        _onClickSubmit : function(e) {
            e.stopPropagation();

            // TODO: 각 contentView에 validation 체크를 위임할 수 있는 공통 인터페이스 작업 필요
            // 별로 좋은 방법은 아니지만, 현재로서는 변경을 최소화하면서 validation을 체크할 수 있는 방법이다.
            if (typeof this.contentView.isValid == "function" && !this.contentView.isValid()) {
                return false;
            }

            if (typeof this.contentView.setModel == "function") {
                this.contentView.setModel();
            }
            this.$el.trigger("setLabelText");
            this.$el.trigger("changeFilter");

            this.toggle(false);
        },

        _onClickCancel : function(e) {
            e.stopPropagation();

            if (typeof this.contentView.resetView == "function") {
                this.contentView.resetView();
            }

            this.toggle(false);
        }
    });
});