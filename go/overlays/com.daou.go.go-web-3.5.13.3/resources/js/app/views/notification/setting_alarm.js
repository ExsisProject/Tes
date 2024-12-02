define("views/notification/setting_alarm", function (require) {
    var _ = require("underscore");
    var Backbone = require("backbone");
    var Hogan = require("hogan");
    var GO = require("app");
    var SettingAlarmTmpl = require("hgn!templates/notification/setting_alarm");
    var commonLang = require("i18n!nls/commons");
    var notiLang = require("i18n!nls/notification");
    var approvalLang = require("i18n!approval/nls/approval");

    var lang = {
        'mail': commonLang["메일"],
        'approval': commonLang["전자결재"],
        'works': commonLang["Works"],
        'todo': commonLang["ToDO+"],
        'task': commonLang["업무"],
        'survey': commonLang["설문"],
        'report': commonLang["보고"],
        'bbs': commonLang["게시판"],
        'community': commonLang["커뮤니티"],
        'calendar': commonLang["캘린더"],
        'addr': commonLang["주소록"],
        'all': commonLang["전체메일함"],
        'inbox': commonLang["받은메일함"],
        'approve': approvalLang["결재"],
        'comment': approvalLang["결재댓글"],
        'receive': approvalLang["결재도착"],
        'withdraw': approvalLang["결재취소"],
        'reject': approvalLang["결재반려"],
        'complete': approvalLang["결재완료"],
        'docs': commonLang['문서관리']
    };

    var NotificationApp = Backbone.Model.extend({
        url: function () {
            return '/api/user/push';
        }
    });

    var NotificationEvent = Backbone.Model.extend({
        category: null,

        url: function () {
            return '/api/user/push/' + this.category;
        },

        initialize: function () {
        },

        setCategory: function (category) {
            this.category = category;
            return this;
        }
    });

    var NotificationSettingListView = Backbone.View.extend({

        initialize: function () {
            this.appModel = new NotificationApp();
            this.eventModel = new NotificationEvent();
        },

        events: {
            "click span[btn-push]": "pushSetting"
        },

        render: function (appModel) {
            this.model = appModel;
            this.requestEventInfo('approval');
            var applist = appModel.notiCategory,
                status;

            this.$el.empty().append(SettingAlarmTmpl({
                'lang': lang,
                'data': this.model
            }));

            // 설정에 따른 버튼 셋팅
            _.each(applist, function (value, appInfo) {

                var appTag = this.$el.find("li[data-appname='" + appInfo + "']"),
                    isSubmenu = this.$el.closest('ul[submenu]').length > 0,
                    checkBtn = appTag.find('span[btn-push]'),
                    subMenu = checkBtn.closest('li[data-appname]').find('ul[submenu]');

                status = (value == true) ? 'ic_toggle_on' : 'ic_toggle_off';
                checkBtn.addClass(status);
                // 설정 버튼 상태
                var isOn = checkBtn.hasClass('ic_toggle_on');

                // 메일일 경우 Toggle 방식
                if (appInfo == 'mail' && value == true) {
                    this.mailToggleSetting(this.model.pushMailBox);
                }
                // 전자결재인 경우 Sub-Menu
                if (appInfo == 'approval') {
                    _.each(this.eventModel.attributes.notiEvent, function (value, eventInfo) {
                        status = (value == true) ? 'ic ic_toggle_on' : 'ic ic_toggle_off';
                        var apprSubBtn = this.$el.find('li[data-eventname]').find("span[btn-push='" + eventInfo + "']");
                        apprSubBtn.attr('class', status);
                    }, this);
                }

                if (!isSubmenu) {
                    subMenu.toggle(isOn);
                }

                // TODO : AppName이 board이지만 설정에서는 noti 설정에서는 bbs로 사용되어 발생되는 이슈이며, 전반적으로 개선해야 함.
                if (appInfo == 'bbs') {
                    appInfo = 'board';
                }

                if (!GO.isAvailableApp(appInfo)) {
                    this.$el.find("li[data-appname=" + appInfo + "]").hide()
                }

            }, this);

            return this.$el;
        },

        requestEventInfo: function (category) {
            this.eventModel.setCategory(category);
            this.eventModel.fetch();
        },

        mailToggleSetting: function (status, toggle) {
            var allMail = this.$el.find('li[data-mail-status=all]').find('span[btn-push]'),
                inbox = this.$el.find('li[data-mail-status=inbox]').find('span[btn-push]');

            if (status == 'all') {
                allMail.attr('class', 'ic ic_toggle_on');
                inbox.attr('class', 'ic ic_toggle_off');
            } else if (status == 'inbox') {
                allMail.attr('class', 'ic ic_toggle_off');
                inbox.attr('class', 'ic ic_toggle_on');
            } else {
                allMail.attr('class', 'ic ic_toggle_off');
                inbox.attr('class', 'ic ic_toggle_off');
            }
        },

        getSettingStatus: function (category) {
            var result;
            result = this.$el.find("span[btn-push='" + category + "']").hasClass('ic_toggle_on');
            return result;
        },

        pushSetting: function (e) {
            e.stopPropagation();
            setTimeout(function () {
            }, 300);

            // 버튼 이벤트 처리
            var $el = $(e.target),
                $subMenu = $el.closest('li[data-appname]').find('ul[submenu]'),
                $mailTag = $el.closest('li[data-appname]').find('span[btn-push=mail]');
            var isSubmenu = $el.closest('ul[submenu]').length > 0;

            $el.toggleClass('ic_toggle_on');
            $el.toggleClass('ic_toggle_off');

            var isOn = $el.hasClass('ic_toggle_on');
            if (!isSubmenu) {
                $subMenu.toggle(isOn);
            }

            // 메일 설정이고 켜져 있을 경우 > 전체 메일함 체크
            if ($mailTag && isOn) {
                if ($el.attr('btn-push') == 'all') {
                    this.mailToggleSetting('all');
                } else if ($el.attr('btn-push') == 'inbox') {
                    this.mailToggleSetting('inbox');
                } else {
                    this.mailToggleSetting('all');
                }
            } else {
                if ($el.attr('btn-push') == 'all') {
                    this.mailToggleSetting('inbox');
                } else if ($el.attr('btn-push') == 'inbox') {
                    this.mailToggleSetting('all');
                }
            }

            // 메일 설정 상태
            var mailStatus = 'none';
            if (this.getSettingStatus('mail') && this.getSettingStatus('all')) {
                mailStatus = 'all';
            } else if (this.getSettingStatus('mail') && this.getSettingStatus('inbox')) {
                mailStatus = 'inbox';
            }

            if (isSubmenu && $el.closest('li[data-appname=approval]')) {
                this.saveEventInfo(mailStatus);
            } else {
                this.saveAppInfo(mailStatus);
            }
        },

        saveAppInfo: function (mailStatus) {
            // 모델 저장
            console.log(this.model);


            var param = {
                'mail': this.getSettingStatus('mail'),
                'task': this.getSettingStatus('task'),
                'todo': this.getSettingStatus('todo'),
                'approval': this.getSettingStatus('approval'),
                'report': this.getSettingStatus('report'),
                'community': this.getSettingStatus('community'),
                'survey': this.getSettingStatus('survey'),
                'core': true,
                'addr': true,
                'bbs': this.getSettingStatus('bbs'),
                'works': this.getSettingStatus('works'),
                'calendar': this.getSettingStatus('calendar'),
                'docs': this.getSettingStatus('docs')
            };
            this.appModel.set({
                'usePush': this.model.usePush,
                'usePushSetting': this.model.usePushSetting,
                'pushStartTime': this.model.pushStartTime,
                'pushEndTime': this.model.pushEndTime,
                'pushMailBox': mailStatus || 'all',
                'timeZone': this.model.timeZone,
                'pushType': this.model.pushType,
                'notiCategory': param
            });

            this.appModel.save({}, {
                type: 'PUT',
                success: function (model, response) {
                    if (response.code == '200') {
                        $.goMessage(commonLang['저장되었습니다.']);
                    }
                },
                error: function (model, response) {
                    var result = JSON.parse(response.responseText);
                    $.goMessage(result.message);
                }
            });
        },

        saveEventInfo: function (mailStatus) {

            var param = {
                'document.arrived': this.getSettingStatus('document.arrived'),
                'document.commented': this.getSettingStatus('document.commented'),
                'document.completed': this.getSettingStatus('document.completed'),
                'document.reading.reader.added': true,
                'document.received': this.getSettingStatus('document.arrived'),
                'document.received.returned': true,
                'document.receiver.changed': true,
                'document.referrence.reader.added': true,
                'document.returned': this.getSettingStatus('document.returned'),
                'document.withdrew': this.getSettingStatus('document.withdrew')
            };
            this.appModel.set({
                'usePush': this.eventModel.attributes.usePush,
                'usePushSetting': this.eventModel.attributes.usePushSetting,
                'pushStartTime': this.eventModel.attributes.pushStartTime,
                'pushEndTime': this.eventModel.attributes.pushEndTime,
                'pushMailBox': mailStatus || 'all',
                'timeZone': this.eventModel.attributes.timeZone,
                'pushType': this.eventModel.attributes.pushType,
                'categoryType': this.eventModel.attributes.categoryType,
                'notiEvent': param
            });
            console.log(this.appModel);
            this.appModel.save({}, {
                type: 'PUT',
                success: function (model, response) {
                    if (response.code == '200') {
                        $.goMessage(commonLang['저장되었습니다.']);
                    }
                },
                error: function (model, response) {
                    var result = JSON.parse(response.responseText);
                    $.goMessage(result.message);
                }
            });
        }
    });

    return NotificationSettingListView;
});
