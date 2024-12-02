define('works/views/app/public_fields_setting_layer', function (require) {

    var BackdropView = require("components/backdrop/backdrop");
    var Template = require('hgn!works/templates/app/public_fields_setting_layer');
    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        'consumersDesc': worksLang['consumers설명'],
        'producersDesc': worksLang['producers설명'],
        '닫기': commonLang['닫기'],
        '공개': commonLang['공개'],
        '비공개': commonLang['비공개']
    };

    return BackdropView.extend({

        tagName: 'span',
        className: 'layer_tail layer_attrSet',
        attributes: {style: 'display: none;'},

        events: {
            'click span[data-field-cid]': '_onClickItem',
            'click [el-close]': '_onClickClose'
        },

        initialize: function (options) {
            BackdropView.prototype.initialize.call(this, options);
            this.type = options.type;
            this.fields = options.fields;
            this.suppressedFields = options.suppressedFields;
            this._parseFields();
        },

        render: function () {
            this.$el.html(Template({
                lang: lang,
                desc: lang[this.type + 'Desc'],
                fields: this.fields.toJSON()
            }));
            return this;
        },

        getSuppressedFields: function () {
            return _.map(this.$('.ic_ctrl_off'), function (buttonEl) {
                return $(buttonEl).attr('data-field-cid');
            });
        },

        _parseFields: function () {
            this.fields.each(function (field) {
                if (_.contains(this.suppressedFields, field.get('cid'))) field.set('suppressed', true);
            }, this);
        },

        _onClickItem: function (e) {
            var $target = $(e.currentTarget);
            $target.toggleClass('ic_ctrl_on').toggleClass('ic_ctrl_off');
            var isOn = $target.hasClass('ic_ctrl_on');
            var fieldCid = $target.attr('data-field-cid');
            var field = this.fields.findWhere({cid: fieldCid})
            field.set('public', isOn);
        },

        _onClickClose: function (e) {
            e.stopPropagation();
            this.toggle(false);
        }
    });
});
