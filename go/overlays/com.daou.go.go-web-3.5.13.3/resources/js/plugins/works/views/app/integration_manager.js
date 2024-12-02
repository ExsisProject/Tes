define("works/views/app/integration_manager", function (require) {

    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        "저장": commonLang["저장"],
        "취소": commonLang["취소"],
        "관리": worksLang["관리"],
        "관리 홈으로 이동": worksLang["관리 홈으로 이동"],
        "해당 앱으로 이동": worksLang["해당 앱으로 이동"],
        '페이지 제목': worksLang['앱간 데이터 연동'],
        '페이지 설명': worksLang['앱간 데이터 연동 설명'],
        '허용': commonLang['허용'],
        '비허용': commonLang['비허용'],
        '이 앱을 참조하고 있는 앱 목록': worksLang['이 앱을 참조하고 있는 앱 목록'],
        '연결된 앱': worksLang['연결된 앱'],
        '연결 컴포넌트': worksLang['연결 컴포넌트'],
        '신청자': worksLang['신청자'],
        '목록 조회 허용': worksLang['목록 조회 허용'],
        '상세 보기 허용': worksLang['상세 보기 허용'],
        '다른 앱의 데이터를 참조하고 있는 컴포넌트': worksLang['다른 앱의 데이터를 참조하고 있는 컴포넌트'],
        '항목명': worksLang['컴포넌트명'],
        '연동앱': worksLang['연동앱'],
        '연결 권한': worksLang['연결 권한'],
        '보기 권한': worksLang['보기 권한'],
        '참조목록 설명': worksLang['참조목록 설명'],
        '참조컴포넌트 설명': worksLang['참조컴포넌트 설명'],
        "목록이 없습니다": worksLang["목록이 없습니다."]
    };

    var BaseSettingView = require('works/views/app/base_setting');
    var PublicFieldSettingButtonView = require('works/views/app/public_fields_setting_button');

    var Fields = require("works/collections/fields");
    var Integration = require('works/components/integration_manager/models/integration');

    var ProducerTmpl = require("hgn!works/components/integration_manager/templates/producers");
    var ConsumerTmpl = require("hgn!works/components/integration_manager/templates/consumers");
    var Template = require("hgn!works/components/integration_manager/templates/integration_manager");

    return BaseSettingView.extend({

        className: "go_content go_renew go_works_home app_temp",

        suppressedConsumers: null,
        suppressedProducers: null,

        events: _.extend(BaseSettingView.prototype.events, {
            'click a[data-id]': '_onClickIntegrationApp'
        }),

        initialize: function (options) {
            this.lang = lang;
            BaseSettingView.prototype.initialize.call(this, options);

            this.fields = new Fields([], {appletId: this.appletId});
            this.fields.fetch();

            this.model = new Integration({appletId: this.appletId});
            this.model.fetch();
        },

        render: function () {
            BaseSettingView.prototype.render.call(this);
            this.$('[el-content]').prepend(Template({lang: lang}));
            this._renderProducers();
            this._renderConsumers();
            $.when(this.fields.deferred, this.model.deferred).done($.proxy(function () {
                this._renderListAndButton();
            }, this));

            return this;
        },

        _renderListAndButton: function () {
            this.model.mergeFromFieldsAndParse(this.fields);
            this._renderProducers();
            this._renderConsumers();
            this._renderSuppressedFieldsButton();
        },

        /**
         * 검색용 주석
         * suppressedFieldsToConsumers, suppressedFieldsToProducers
         * suppressedConsumers, suppressedProducers
         */
        _renderSuppressedFieldsButton: function () {
            _.each(this.$('[el-tool-area]'), function (el) {
                var $el = $(el);
                var type = $el.attr('data-type');
                var columnFields = this.fields.getColumnFields();
                this['suppressed' + GO.util.initCap(type)] = new PublicFieldSettingButtonView({
                    type: type,
                    fields: columnFields.reset(columnFields.toJSON()),
                    suppressedFields: this.model.get('suppressedFieldsTo' + GO.util.initCap(type))
                });
                $(el).append(this['suppressed' + GO.util.initCap(type)].render().el);
            }, this);
        },

        _renderProducers: function () {
            this.$('#producers').html(ProducerTmpl({
                lang: lang,
                model: this.model.toJSON()
            }));
        },

        _renderConsumers: function () {
            this.$('#consumers').html(ConsumerTmpl({
                lang: lang,
                model: this.model.toJSON()
            }));
        },

        _setConsumerPrivileges: function () {
            var values = _.map(this.$('#consumers').find('tr'), function (tr) {
                return _.map($(tr).find('input:checked'), function (input) {
                    return $(input).val();
                });
            });

            _.each(this.model.get('consumers'), function (producer, index) {
                producer.privileges = values[index];
            });
        },

        _setPublicFields: function () {
            this.model.set('suppressedFieldsToConsumers', this.suppressedConsumers.getSuppressedFields());
            this.model.set('suppressedFieldsToProducers', this.suppressedProducers.getSuppressedFields());
        },

        _onClickSave: function () {
            this._setPublicFields();
            this._setConsumerPrivileges();
            this.model.save({}, {
                type: 'PUT',
                success: function () {
                    $.goMessage(commonLang["저장되었습니다."]);
                },
                error: function (e, resp) {
                    console.log(e);
                    console.log(resp);
                }
            });
        },

        _onClickCancel: function () {
            this._renderListAndButton();
        },

        _onClickIntegrationApp: function (e) {
            var targetId = $(e.currentTarget).attr('data-id');
            GO.router.navigate('works/applet/' + targetId + '/home', true);
        }
    });
});
