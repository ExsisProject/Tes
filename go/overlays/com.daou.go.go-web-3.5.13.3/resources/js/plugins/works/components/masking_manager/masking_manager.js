define('works/components/masking_manager/masking_manager', function(require) {

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');
    var lang = {
        '페이지 제목': worksLang['마스킹 설정'],
        '페이지 설명': worksLang['마스킹 설정 설명'],
        '앱 내 사용하는 항목': worksLang['앱 내 사용하는 항목'],
        '마스킹 할 항목': worksLang['마스킹 할 항목'],
        '항목 조회 허용 대상': worksLang['항목 조회 허용 대상']
    };

    var Masking = require('works/components/masking_manager/models/masking');

    var Fields = require('works/collections/fields');

    var CircleView = require('views/circle');
    var BaseSettingView = require('works/views/app/base_setting');

    var Template = require("hgn!works/components/masking_manager/templates/masking_manager");
    var MaskableFeildItemTemplate = Hogan.compile(
        '<span class="option_wrap">' +
            '<input type="checkbox" id="{{field.cid}}" {{#field.isChecked}}checked{{/field.isChecked}}>' +
            '<label for="{{field.cid}}">{{field.label}}</label>' +
        '</span>'
    );

    return BaseSettingView.extend({

        className : 'go_content go_renew go_works_home app_temp',

        events : _.extend(BaseSettingView.prototype.events, {
        }),

        circleView: null,

        initialize : function (options) {
            this.lang = lang;
            BaseSettingView.prototype.initialize.call(this, options);

            this.fields = new Fields([], {appletId : this.appletId});
            this.fields.fetch();
            this.masking = new Masking({appletId: this.appletId}, {useFilter: false});
            this.masking.fetch();
        },

        render : function() {
            BaseSettingView.prototype.render.call(this);
            this.$('[el-content]').html(Template({
                lang: lang,
                fields: this.fields.toJSON()
            }));

            $.when(this.masking.deferred, this.fields.deferred).then(_.bind(function () {
                this.fields = this.fields.getMaskableFields();
                this._renderFields();
                this._renderCircle();
            }, this));

            return this;
        },

        _renderFields: function() {
            this.fields.each(function (field) {
                if (_.contains(this.masking.get('fieldCids'), field.get('cid'))) field.set('isChecked', true);
                console.log(field.toJSON());
                this.$('[data-el-maskable-fields]').append(MaskableFeildItemTemplate.render({field: field.toJSON()}));
            }, this);
        },

        _renderCircle: function() {
            this.circleView = new CircleView({
                isAdmin: false,
                circleJSON: this.masking.get('accessCircle'),
                nodeTypes: ['user']
            });
            this.$('#accessUser').html(this.circleView.render().el);
        },

        _getCheckedFieldCids: function() {
            return _.map(this.$('[data-el-maskable-fields]').find('input[type="checkbox"]:checked'), function(checkedInput) {
                return $(checkedInput).attr('id');
            });
        },

        _onClickSave: function() {
            this.masking.save({
                fieldCids: this._getCheckedFieldCids(),
                accessCircle: this.circleView.getData()
            }, {
                success: function() {
                    $.goMessage(commonLang['저장되었습니다.']);
                }
            });
        }
    });
});