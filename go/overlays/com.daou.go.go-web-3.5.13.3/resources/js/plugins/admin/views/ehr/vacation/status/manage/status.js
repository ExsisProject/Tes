define("admin/views/ehr/vacation/status/manage/status", function (require) {
    var Backbone = require("backbone");
    var adminLang = require("i18n!admin/nls/admin");
    var vacationLang = require("i18n!vacation/nls/vacation");

    var StatusTpl = require("hgn!admin/templates/ehr/vacation/status/manage/status");
    var StatusPopupView = require("admin/views/ehr/vacation/status/manage/status_popup");

    var lang = {
        '설정' : adminLang['설정'],
        '사용' : adminLang['사용'],
        '미사용' : adminLang['미사용'],
        '적용 안 함' : adminLang['적용 안 함'],
        '차감' : adminLang['차감'],
        '차감안함' : adminLang['차감안함'],
        '포함' : adminLang['포함'],
        '미포함' : adminLang['미포함'],
        '유급': vacationLang['유급'],
        '무급': vacationLang['무급'],
        '사용 가능일 수' : vacationLang['사용 가능일 수'],
        '시작/종료 시간' : vacationLang['시작/종료 시간']
    }

    return Backbone.View.extend({
        className:'status',
        tagName:'tr',

        initialize: function (options) {
            this.statusModel = options.statusModel;
            this.statusListEl = options.statusListEl;
        },

        events: {
            "click .statusSettingBtn" : "popupStatusSetting"
        },

        render: function () {
            //자바에서 boolean 대신 enum 타입을 사용해서 로직을 추가함
            if (this.statusModel.get('holidayPolicy') == 'HOLIDAY') {
                this.statusModel.set('canBeUsedHoliday', true);
            } else {
                this.statusModel.set('canBeUsedHoliday', false);
            }
            this.$el.html(StatusTpl({
                lang : lang,
                data : this.statusModel.attributes
            }));
            return this;
        },

        append : function() {
            this.statusListEl.append(this.$el);
        },

        popupStatusSetting : function(e) {
            e.stopPropagation();
            e.preventDefault();
            new StatusPopupView({
                statusModel : this.statusModel,
                refreshCallback : $.proxy(this.render, this)
            }).render();
        }
    });

});