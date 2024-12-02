/**
 *
 * 결재 라인 뷰 (리스트가 아닌 각 라인을 그리는 뷰이다.)
 * 라인의 명칭, 최대 결재자, 지정 결재자를 표현한다. 서버에서는 라인을 ActivityGroup이라 부른다.
 *
 */
define('admin/views/appr_form_activity_group_item', function(require) {
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    var approvalLang = require("i18n!approval/nls/approval");
    var lang = {
        'order': commonLang['순서'],
        'name': commonLang['이름'],
        'count': commonLang['개'],
        'person': commonLang['명'],
        'approval_type': approvalLang['결재'],
        'agreement_type': approvalLang['합의'],
        'check_type': approvalLang['확인'],
        'inspection_type': approvalLang['감사'],
        'max_approver': approvalLang['최대 결재자'],
        'appr_line_caption': approvalLang['결재 라인'],
        'predefined_approver': approvalLang['지정 결재자'],
        'add_approval_user': approvalLang['결재 추가'],
        'add_agreement_user': approvalLang['합의 추가'],
        'add_check_user': approvalLang['확인 추가'],
        'add_inspection_user': '감사 추가',
        'already_added': commonLang['이미 추가되어 있습니다.'],
        'is_over_max_approval_count': approvalLang['지정 결재자가 최대 결재자 인원수를 초과하였습니다.'],
        'is_over_approval_count_ten': approvalLang['지정 결재자는 10개를 초과 하실 수 없습니다'],
        'msg_not_belong_to_department_user': approvalLang['부서가 없는 사용자는 추가할 수 없습니다.'],
        'appr_type': approvalLang['결재 타입'],
        '변경': commonLang['변경'],
        '자동결재선': adminLang['자동결재선']
    };

    var ActivityModel = require('approval/models/activity');

    var activityGroupTmpl = require('hgn!admin/templates/appr_form_activity_group');
    var activityTmpl = require('hgn!admin/templates/appr_form_activity');

    return Backbone.View.extend({

        tagName: 'tr',
        _APPROVER_COUNTS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

        events: {
            // firefox는 한글만 입력된 경우의 key 관련 event를 제대로 처리하지 못한다. why focusout event is used..
            'focusout input.w_full': 'setName',
            'change select#selectApproverCount': 'setMaxApproverCount',
            'click input[name=typeOpApproval], input[name=typeOpAgreement], input[name=typeOpCheck], input[name=typeOpInspection]': '_toggleTypeOp'
        },

        initialize: function(options) {
            this._setBindings();
            this.model = options['model'];
            this.companyIds = options['companyIds'];
            this.allowAgreement = options['allowAgreement'];
            this.agreementAllowType = options['agreementAllowType'];
            this.allowCheck = options['allowCheck'];
            this.allowInspection = options['allowInspection'];
            this.apprlineruleModel = options['apprlineruleModel'];
        },

        _setBindings: function() {
            this.$el.off("click", "#approval_user_add");
            this.$el.off("click", "#agreement_user_add");
            this.$el.off("click", "#check_user_add");
            this.$el.off("click", "#inspection_user_add");
            this.$el.off("click", ".btn_delete_activity");
            this.$el.on("click", "#approval_user_add", $.proxy(this.addApprovementUser, this));
            this.$el.on("click", "#agreement_user_add", $.proxy(this.addAgreementUser, this));
            this.$el.on("click", "#check_user_add", $.proxy(this.addCheckUser, this));
            this.$el.on("click", "#inspection_user_add", $.proxy(this.addInspectionUser, this));
            this.$el.on("click", ".btn_delete_activity", $.proxy(this.deleteActivity, this));
        },

        render: function() {
            var tmplData = _.extend(this.model.toJSON(), {
                approverCounts: _.map(this._APPROVER_COUNTS, function(num) {
                    return {
                        'value': num,
                        'label': num + lang['person'],
                        'isSelected': num == this.model.get('maxApprovalCount')
                    };
                }, this),
                lang: lang,
                allowAgreement: this.allowAgreement,
                allowCheck: this.allowCheck,
                allowInspection: this.allowInspection,
                useApprLineRule: $('#useApprLineRule').is(':checked') // TODO. context
            });

            tmplData['seq']++;
            var selectedLineRuleId = (this.apprlineruleModel && this.apprlineruleModel.get('id')) ?
                this.apprlineruleModel.get('id') : '';
            var selectedLineRuleName = (this.apprlineruleModel && this.apprlineruleModel.get('name')) ?
                this.apprlineruleModel.get('name') : '';
            if (tmplData['seq'] == 1) {
                tmplData = _.extend(tmplData, {
                    setLineRule: true,
                    selectedLineRuleId: selectedLineRuleId,
                    selectedLineRuleName: selectedLineRuleName
                });

                if ($('#useApprLineRule').is(':checked')) {
                    _.extend(tmplData, {
                        hideUserAdd: true
                    })
                }
            }

            this.$el.html(activityGroupTmpl({
                data: tmplData,
                lang: lang
            }));
            this._renderActivities();
            return this.$el;
        },

        setName: function(e) {
            var el = $(e.currentTarget);
            this.model.set('name', el.val());
        },

        setMaxApproverCount: function(e) {
            var el = $(e.target);
            this.model.set('maxApprovalCount', el.val() * 1);
        },

        addApprovementUser: function() {
            this.addActivity("APPROVAL", 'USER', lang['add_approval_user']);
        },

        addAgreementUser: function() {
            this.addActivity("AGREEMENT", 'USER', lang['add_agreement_user']);
        },

        addCheckUser: function() {
            this.addActivity("CHECK", 'USER', lang['add_check_user']);
        },

        addInspectionUser: function() {
            this.addActivity("INSPECTION", 'USER', lang['add_inspection_user']);
        },

        addActivity: function(activityType, nodeType, orgSlideTitle) {
            var addCallback = function(data) {
                var newActivity;

                if (data.type == 'org') {
                    newActivity = {
                        type: activityType,
                        userId: null,
                        userName: null,
                        position: null,
                        deptId: data.id,
                        deptName: data.name,
                        displayName: data.name
                    };
                } else {
                    newActivity = {
                        type: activityType,
                        userId: data.id,
                        userName: data.name,
                        position: data.position,
                        deptId: data.deptId,
                        deptName: data.deptName,
                        displayName: data.displayName
                    };
                }

                if (this.model.isExistActivity(newActivity)) {
                    $.goAlert(lang['already_added']);
                    return;
                }

                /**
                 * 지정결재자가(결재 + 합의 + 감사 포함) 최대 결재자수를 넘어갈 수 없다. 여기선 인원을 추가하기 전이므로 +1을 해준다.
                 */
                if (this.model.getActivityCollection().length + 1 > this.model.getMaxApprovalCount()) {
                    $.goAlert(lang['is_over_max_approval_count']);
                    return;
                }

                if (this.model.getActivityCollection().length + 1 > 10) {
                    $.goAlert(lang['is_over_approval_count_ten']);
                    return;
                }

                if (!ActivityModel.validate(newActivity)) {
                    $.goMessage(lang['msg_not_belong_to_department_user']);
                    return false;
                }

                this.model.addActivity(newActivity);
                this._renderActivities();
            };
            var orgType = 'node';
            if (activityType == 'AGREEMENT') {
                if (this.agreementAllowType == 'DEPARTMENT') {
                    orgType = 'department';
                } else if (this.agreementAllowType == 'USER') {
                    orgType = 'list';
                }
            } else {
                orgType = (_.contains(['APPROVAL', 'CHECK', 'INSPECTION'], activityType)) ? 'list' : 'node';
            }

            var orgSlideOption = {
                header: orgSlideTitle,
                callback: $.proxy(addCallback, this),
                contextRoot: GO.contextRoot,
                type: orgType,
                isAdmin: true
            };

            if (_.isArray(this.companyIds)) {
                orgSlideOption['companyIds'] = this.companyIds;
            }

            $.goOrgSlide(orgSlideOption);
        },

        deleteActivity: function(e) {
            var el = $(e.target).parent().parent(),
                userId = el.attr('data-userId'),
                deptId = el.attr('data-deptId');

            this.model.removeActivityByUserIdAndDeptId(userId, deptId);
            this._renderActivities();
        },

        _renderActivities: function() {
            var self = this;
            var htmls = [];
            var renderActivitiesModel = [{
                type: "APPROVAL",
                model: _.filter(this.model.get('activities'), function(activity) {
                    return activity.type == "APPROVAL"
                })
            }, {
                type: "AGREEMENT",
                model: _.filter(this.model.get('activities'), function(activity) {
                    return activity.type == "AGREEMENT"
                })
            }, {
                type: "CHECK",
                model: _.filter(this.model.get('activities'), function(activity) {
                    return activity.type == "CHECK"
                })
            }, {
                type: "INSPECTION",
                model: _.filter(this.model.get('activities'), function(activity) {
                    return activity.type == "INSPECTION"
                })
            }];

            $('li:not(#add_btn_container)', this.$el.find('ul.name_tag')).remove();
            _.each(renderActivitiesModel, function(typeModel) {
                _.each(typeModel.model, function(activity) {
                    var activityTypeName = self._getActivityTypeName(activity.type);
                    htmls.push(activityTmpl({
                        userId: activity.userId,
                        deptId: activity.deptId,
                        name: activity.displayName + '(' + activityTypeName + ')',
                        lang: lang
                    }));
                });
                self.$el.find('ul.' + typeModel.type + '_nameTag').prepend(htmls.join('\n'));
                htmls = []
            });
        },

        _getActivityTypeName: function(type) {
            switch (type) {
                case 'APPROVAL':
                    return approvalLang['결재'];
                case 'AGREEMENT':
                    return approvalLang['합의'];
                case 'INSPECTION':
                    return approvalLang['감사'];
                default:
                    return approvalLang['확인'];
            }
        },

        _toggleTypeOp: function(e) {
            var self = this;
            var type = {};

            if ($(e.currentTarget).attr('name') == "typeOpApproval") {
                type = _.extend(type, {
                    apprAppointUserAdder: 'approval_user_add',
                    appointListTypeText: '(' + approvalLang['결재'] + ')',
                    checkModelName: 'useApproval'
                });
            } else if ($(e.currentTarget).attr('name') == "typeOpAgreement") {
                type = _.extend(type, {
                    apprAppointUserAdder: 'agreement_user_add',
                    appointListTypeText: '(' + approvalLang['합의'] + ')',
                    checkModelName: 'useAgreement'
                });
            } else if ($(e.currentTarget).attr('name') == "typeOpCheck") {
                type = _.extend(type, {
                    apprAppointUserAdder: 'check_user_add',
                    appointListTypeText: '(' + approvalLang['확인'] + ')',
                    checkModelName: 'useCheck'
                });
            } else if ($(e.currentTarget).attr('name') == "typeOpInspection") {
                type = _.extend(type, {
                    apprAppointUserAdder: 'inspection_user_add',
                    appointListTypeText: '(' + approvalLang['감사'] + ')',
                    checkModelName: 'useInspection'
                });
            }
            if ($(e.currentTarget).attr('checked')) {
                this.$('#' + type.apprAppointUserAdder).css('display', 'inline-block');
                this.model.set(type.checkModelName, true);
            } else {
                this.$('#' + type.apprAppointUserAdder).css('display', 'none');
                this.model.set(type.checkModelName, false);
                var $targetsAppointList = this.$('.name_tag').find('li:not("#add_btn_container")');
                _.each($targetsAppointList, function(target) {
                    if ($(target).find('.name').text().indexOf(type.appointListTypeText) != -1) {
                        self.model.removeActivityByUserIdAndDeptId($(target).attr('data-userid'), $(target).attr('data-deptid'));
                    }
                });
                self._renderActivities();
            }
        }
    });
});