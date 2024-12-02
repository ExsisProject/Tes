define('components/select/views/select_list', function(require) {
    var CheckableSelectItemView = require('components/select/views/select_option');

    return Backbone.View.extend({

        className : "box_basic_inner",

        template: function() {
            return Hogan.compile([
                '<div class="wrap_box_small">',
                    '{{#useSearchForm}}',
                    '<input el-search class="txt_mini w_max" type="text">',
                    '{{/useSearchForm}}',
                '</div>',
                '{{#useScroll}}',
                '<div class="box_basic_scroll"></div>',
                '{{/useScroll}}'
            ].join(""));
        },

        initialize: function(options) {
            this.useSearchForm = options.useSearchForm !== false;
            this.valueKey = options.valueKey;
            this.labelKey = options.labelKey;
            this.iconPathKey = options.iconPathKey;
            this.useScroll = options.useScroll;
            this.useCheckbox = options.useCheckbox !== false;

            this.collection.on('sync', this._onSyncCollection, this);
            this.collection.on('add', this._onAddOption, this);
        },

        events : {
            "keyup input[el-search]" : "_onKeyupSearch"
        },

        render : function() {
            this.$el.html(this.template().render({
                useScroll: this.useScroll,
                useSearchForm : this.useSearchForm
            }));
            this.$list = this.useScroll ? this.$('.box_basic_scroll') : this.$el;

            this._renderSelectList();

            return this;
        },

        _onAddOption : function(model) {
            var itemView = this._addSelectItem(model);
            itemView.$("input").trigger("change");
        },

        _addSelectItem : function(model) {
            var itemView = new CheckableSelectItemView({
                useCheckbox: this.useCheckbox,
                labelKey: this.labelKey,
                valueKey: this.valueKey,
                iconPathKey: this.iconPathKey,
                model : model
            });

            this.$list.append(itemView.render().el);

            return itemView;
        },

        _renderSelectList : function(datas) {
            var models = datas && datas.length ? datas : this.collection.models;
            this.$("div[el-option]").remove();
            _.each(models, function(model) {
                this._addSelectItem(model);
            }, this);
        },

        _onKeyupSearch : function(e) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout($.proxy(function() {
                var keyword = $.trim(this.$("input[el-search]").val());
                var searchResults = this.collection.findByKeyword(keyword);
                this._renderSelectList(searchResults);

                if (e.keyCode == 13 && searchResults.length == 1) {
                    this._directSelect();
                }
            }, this), 100);
        },

        _directSelect : function() {
            var $checkbox = this.$("input[type='checkbox']");
            $checkbox.trigger("click");
            this.$el.trigger('directSelect', {value: this.$('[data-value]').attr('data-value')});
            this.$("input[el-search]").val("");
            this._renderSelectList(this.collection.models);
        },

        _onSyncCollection: function() {

        }
    });
});