/**
 * 프로세스관리 메인 뷰
 */

define('works/views/app/workflow_manager', function(require) {
    // dependency
    var Backbone = require('backbone');
    var when = require('when');
    var WorksHomeLayout = require('works/views/app/home/works_home_layout');
    var ManageContentTopView = require('works/views/app/layout/manage_content_top');
    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var Flows = require('works/collections/workflow_flows');
    var Stats = require('works/collections/workflow_stats');
    var WorkflowModel = require('works/models/workflow_manager');
    var Fields = require("works/collections/fields");
    var MxGraph = require("works/views/app/workflow_graph");
    var ManagerTpl = require('hgn!works/templates/app/workflow_manager');
    var taskLang = require("i18n!task/nls/task");
    var adminLang = require("i18n!admin/nls/admin");
    var WorksUtil = require('works/libs/util');
    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');
    var lang = {
        "ADMIN": taskLang["운영자"],
        "REGISTRANT": taskLang["등록자"],
        tagRequired: worksLang['상태사용안함'],
        "상태관리": worksLang['상태관리'],
        "상태관리 안내문구3": worksLang['상태관리 안내문구3'],
        add: commonLang["추가"],
        statusName: adminLang["상태명"],
        completionStatus: adminLang["완료 상태"],
        destroy: commonLang["삭제"],
        '상태' : adminLang['상태'],
        "추가" : adminLang['추가'],
        "상태 흐름": worksLang['상태 흐름'],
        "상태 흐름 설명": worksLang['상태 흐름 설명'],
        startStatus: adminLang["시작 상태"],
        nextStatus: adminLang["다음 상태"],
        statusModifierButton: worksLang["상태변경 버튼명"],
        statusModifiers: adminLang["상태 변경자"],
        notificationTarget: adminLang["상태 변경 알림대상"],
        administration: commonLang["관리"],
        'regist': commonLang['저장'],
        cancel: commonLang["취소"],
        gosettinghome: worksLang['관리 홈으로 이동'],
        goapphome: worksLang['해당 앱으로 이동'],
        infoDesc: worksLang['프로세스 관리 설명'],
        color: commonLang["색상"],
        "수정 알림 대상 설명" : worksLang['수정 알림 대상 설명'],
        "상태명을 입력하세요.": worksLang['상태명을 입력하세요.'],
        "상태 순서 변경": worksLang['상태 순서 변경']
    };

    var DEFAULT_ROLES = [{
        value: "ADMIN",
        lang: lang.ADMIN
    }, {
        value: "REGISTRANT",
        lang: lang.REGISTRANT
    }];

    var ROLES = [];

    return Backbone.View.extend({
        _mxGraph: null,
        flows: null,
        stats: null,
        template: null,
        className: 'go_content go_renew go_works_home app_temp',

        events: {
            "click #flowView, #statSection_2 #statTable": "beforeElementClick",
            "click #btnAddStat": "addStat",
            "click #btn-confirm": "onSave",
            "click #btn-cancel": "onCancel",
            "change #notUseProcess": "toggleByNotUseProcessFlag",
            "click #btn-gosettinghome": "gosettinghome",
            "click #btn-goapphome": "goapphome",
            'click #goAppHomeNav': "goapphome",
            'click #goSettingHomeNav': "gosettinghome"
        },

        initialize: function(options) {
            options = options || {};
            this.layoutView = WorksHomeLayout.create();
            if (options.hasOwnProperty('appletId')) {
                this.model = new WorkflowModel({
                    id: this.options.appletId
                });
                this.baseConfigModel = new AppletBaseConfigModel(options.hasOwnProperty('appletId') ? {"id": options.appletId} : null);
                this.fields = new Fields([], {appletId: options.appletId});
            }

            if (!mxClient.isBrowserSupported()) {
                mxUtils.error('Browser is not supported!', 200, false);
                return;
            }
        },

        render: function() {
            return when(
                renderLayout.call(this))
                .then(_.bind(renderMain, this))
                .otherwise(function printError(err) {
                    console.log(err.stack);
                }
            );
        },

        beforeElementClick: function() {
            var notUseProcess = $('#notUseProcess').is(':checked');
            if (notUseProcess) {
                $.goError(worksLang['상태를 사용하지 않을 경우 수정할수 없습니다.']);
                return false;
            }
        },

        toggleByNotUseProcessFlag: function(e) {
            var checked = $(e.target).is(':checked');
            if (checked) { // 상태를 사용하지 않음.
                this.$('#flowView, #statSection_1, #statSection_2').find('input, select').prop('disabled', true).addClass('disabled').end().find('span.chip').css("cursor", "default").end().find('span.wrapBtn').hide();
                this.$('#btnAddStat').hide();
                this.$('#statTable').sortable();
                this.$('#addStatName').attr('disabled', true);
                this.$('div.wrap_process').css('opacity', '0.5');
                _mxGraph.disabled();

            } else {
                this.$('#flowView, #statSection_1, #statSection_2').find('input, select').prop('disabled', false).removeClass('disabled').end().find('span.chip').css("cursor", "pointer").end().find('span.wrapBtn').show();
                this.$('#btnAddStat').show();
                this.$('#statTable').sortable();
                this.$('#addStatName').attr('disabled', false);
                this.$('div.wrap_process').css('opacity', '');
                _mxGraph.enabled();
            }
        },

        addStat: function() {
            var $addStatName = this.$('#addStatName');
            //$addStatName.siblings('span').remove();
            var name = $addStatName.val();
            if (!$.goValidation.isCheckLength(2, 20, name)) {
                $.goError(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {
                    "arg1": "2",
                    "arg2": "20"
                }), $addStatName, false, false);
                $addStatName.focus();
                return;
            }

            var stat = new Backbone.Model({name: name, color: 0});
            if (_mxGraph.addStat(stat.toJSON())) {
                $addStatName.val("");
            }
        },
        onSave: function(e) {
            e.preventDefault();
            if (!_mxGraph.isValidData()) {
                return;
            }

            var data = {
                statuses: _mxGraph.getStats(),
                addPushes: _mxGraph.getFirstFlow(),
                template: JSON.stringify(_mxGraph.getTemplate()),
                useProcess: !$('#notUseProcess').is(':checked'),
                transitions: _mxGraph.getTransitions()
            };

            //벨리데이션
            if (!this.validate(data)) return;

            this.model.set(data);
            this.model.save({}, {
                success: function() {
                    $.goMessage(commonLang["저장되었습니다."]);
                },
                error: function(model, resp) {
                    $.goError(resp.responseJSON.message);
                }
            });
        },

        onCancel: function(e) {
            var self = this;
            e.preventDefault();
            $.goConfirm(
                commonLang['취소하시겠습니까?'],
                commonLang['입력하신 정보가 초기화됩니다.'],
                function() {
                    renderMain.call(self);
                }
            );
        },

        gosettinghome: function() {
            WorksUtil.goSettingHome(this.model.get('id'));
        },

        goapphome: function() {
            WorksUtil.goAppHome(this.model.get('id'));
        },

        readyValidate: function() {
            this.$('.go_error, p.caution').remove();
            this.$('.error').removeClass('error');
        },

        validate: function(data) {
            this.readyValidate();

            var isValid = true;
            if (data.useProcess && data.statuses.length < 1) {
                $.goError(worksLang["상태는 1개 이상 반드시 설정해야합니다."]);
                isValid = false;
                return isValid;
            }

            return isValid;
        },

        goError: function(message, targetEl, isClear, fadeOut) {
            var isPop = targetEl ? false : true;
            if (isClear) {
                $(targetEl).siblings('p').remove();
                return false;
            }
            if (isPop) {
                $.goSlideMessage(message, "caution");
            } else {
                var messageTpl = ['<p class="desc caution">', message, '</p>'];
                var errorEl = messageTpl.join('');
                if (fadeOut) {
                    errorEl = $(errorEl).delay(3000).fadeOut(500, function() {
                        $(this).remove();
                    });
                }
                $(targetEl).siblings('p').remove().end().after(errorEl);
            }
        }
    });

    function fetchModel() {
        var self = this;
        var defer = when.defer();
        this.model.fetch({
            success: function() {
                self.stats = new Stats(self.model.get("statuses"));
                self.flows = new Flows(self.model.get("transitions"));
                self.template = self.model.get("template");
                self.flows.addFirstFlow(self.stats.firstFlow().get("name"), self.model.get('addPushes'));
                defer.resolve();
            },
            error: defer.reject
        });
        return defer.promise;
    }

    function renderMain() {
        when(fetchConfigModel.call(this))
            .then(_.bind(fetchModel, this))
            .then(_.bind(fetchFields, this))
            .then(_.bind(function render() {
                WorksUtil.checkAppManager(this.baseConfigModel.get('admins'));
                setRoles.call(this);
                this.$el.html(ManagerTpl({
                    lang: lang,
                    useProcess: this.model.get('useProcess'),
                    baseConfigModel: this.baseConfigModel.toJSON()
                }));

                var contentTopView = new ManageContentTopView({
                    baseConfigModel: this.baseConfigModel,
                    pageName: worksLang['프로세스 관리'],
                    useActionButton: true,
                    infoDesc: lang.infoDesc
                });
                contentTopView.setElement(this.$('#worksContentTop'));
                contentTopView.render();

                _mxGraph = new MxGraph();
                _mxGraph.render();
                _mxGraph.drawJsonData(this.stats.toJSON(), this.flows.transitions().toJSON(), this.template,
                    this.flows.at(0).toJSON(), ROLES);

                self.$('#notUseProcess').trigger('change');
            }, this))
            .otherwise(function printError(err) {
                console.log(err.stack);
            });
    }

    function setRoles() {
        ROLES = [];
        ROLES = ROLES.concat(DEFAULT_ROLES);
        var toAddRoles = _.where(this.fields.toJSON(), {"fieldType": "org"});

        if (toAddRoles.length > 0) {
            ROLES = ROLES.concat(_.map(toAddRoles, function(m) {
                return {
                    value: m.cid,
                    lang: m.label
                }
            }));
        }
    }

    function renderLayout() {
        return when(this.layoutView.render())
            .then(this.layoutView.setContent(this));
    }

    function fetchConfigModel() {
        var defer = when.defer();
        this.baseConfigModel.fetch({
            success: defer.resolve,
            error: defer.reject
        });
        return defer.promise;
    }

    function fetchFields() {
        var defer = when.defer();
        this.fields.fetch({
            success: defer.resolve,
            error: defer.reject
        });
        return defer.promise;
    }
});