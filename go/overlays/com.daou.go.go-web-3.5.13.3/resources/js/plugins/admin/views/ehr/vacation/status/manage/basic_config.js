define("admin/views/ehr/vacation/status/manage/basic_config", function(require) {
    var Backbone = require("backbone");
    var GO = require("app");

    var AdminLang = require("i18n!admin/nls/admin");
    var VacationLang = require("i18n!vacation/nls/vacation");
    var CommonLang = require("i18n!nls/commons");

    var BasicConfigTpl = require("hgn!admin/templates/ehr/vacation/status/manage/basic_config");
    var LinkageConfigModel = require("admin/models/ehr/vacation/linkage");


    var lang = {
        '캘린더' : CommonLang['캘린더'],
        '근태관리' : AdminLang['근태관리'],
        '저장' : CommonLang['저장'],
        '취소' : CommonLang['취소'],
        '기본 설정' : AdminLang['기본 설정'],
        '메신저' : CommonLang['메신저 (PC/모바일)'],
        '연차연동 설명' : VacationLang['연차연동 설명'],
        '연차 데이터 메뉴연동' : VacationLang['연차 데이터 메뉴연동']
    };

    return Backbone.View.extend({
        el: '#basicConfigLayout',

        events: {
            "click #saveBasicConfig" : "saveBasicConfig",
            "click #cancelBasicConfig" : "cancelBasicConfig",
            "click #calendarLinkage" : "changeCalendarLinkageOn",
            "click #messengerLinkage" : "changeMessengerLinkageOn"
        },

        render: function () {
            this.linkageConfig = new LinkageConfigModel();
            this.linkageConfig.fetch({
                success : $.proxy(this.renderConfig, this)
            });

            return this;
        },

        renderConfig : function(data) {
            this.$el.html(BasicConfigTpl({
                lang : lang,
                data : data.attributes,
            }));
            this.timelineLinkageEl = this.$('#timelineLinkage');
            this.calendarLinkageEl = this.$('#calendarLinkage');
            this.messengerLinkageEl = this.$('#messengerLinkage');
        },

        saveBasicConfig : function() {
            GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
            this.linkageConfig.save({}, {
                success : function() {
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay');
                    $.goMessage(CommonLang['저장되었습니다.']);
                },
                fail : function() {
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay');
                    $.goMessage(CommonLang['500 오류페이지 타이틀']);
                }
            });
        },

        cancelBasicConfig : function() {
            this.render();
            $.goMessage(CommonLang['취소되었습니다.']);
        },

        changeCalendarLinkageOn : function() {
            var calendarLinkageOn = this.linkageConfig.get('calendarLinkageOn');
            if (calendarLinkageOn) {
                this.calendarLinkageEl.removeClass('on');
            } else {
                this.calendarLinkageEl.addClass('on');
            }
            this.linkageConfig.changeCalendarLinkageOn();
        },

        changeMessengerLinkageOn : function() {
            var messengerLinkageOn = this.linkageConfig.get('messengerLinkageOn');
            if (messengerLinkageOn) {
                this.messengerLinkageEl.removeClass('on');
            } else {
                this.messengerLinkageEl.addClass('on');
            }
            this.linkageConfig.changeMessengerLinkageOn();
        }
    });
});