define([
    "jquery",
    "backbone",
    "app",

    "approval/models/activity_group",
    "approval/collections/activity_groups",

    'admin/views/appr_form_activity_group_item',

    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "i18n!approval/nls/approval",

    "hgn!admin/templates/appr_form_activity_group_app",

    "jquery.go-popup",
    "jquery.go-sdk",
    "jquery.go-grid",
    "jquery.go-orgslide",
    "jquery.go-validation",
    "GO.util"
],

function(
    $,
    Backbone,
    App,

    ActivityGroupModel,
    ActivityGroupCollection,

    ActivityGroupItemView,

    commonLang,
    adminLang,
    approvalLang,

    activityGroupAppTmpl
) {
    var ActivityGroupListView,
        lang = {
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
        'add_inspection_user': approvalLang['감사 추가'],
        'already_added': commonLang['이미 추가되어 있습니다.'],
        'is_over_max_approval_count': approvalLang['지정 결재자가 최대 결재자 인원수를 초과하였습니다.'],
        'is_over_approval_count_ten': approvalLang['지정 결재자는 10개를 초과 하실 수 없습니다'],
        'msg_not_belong_to_department_user': approvalLang['부서가 없는 사용자는 추가할 수 없습니다.'],
        'appr_type': approvalLang['결재 타입'],
        '변경': commonLang['변경'],
        '자동결재선': adminLang['자동결재선']
    };

    /**
     *
     * 결재 라인 목록을 구성하는 뷰
     *
     */
    ActivityGroupListView = Backbone.View.extend({

        initialize: function(options) {
            options = _.extend({}, options);

            this.companyIds = null;
            if (_.isArray(options['companyIds'])) {
                this.companyIds = options['companyIds'];
            }

            if (options.groups) {
                this.collection = options.groups;
            }

            var apprlineruleModel = Backbone.Model.extend();
            if (options['apprlinerule']) {
                this.apprlineruleModel = new apprlineruleModel(options['apprlinerule']);
            }
        },

        /**
         * 결재 라인 컴포넌트를 그린다.
         *
         * @count 몇 개의 라인을 그릴지 결정하며, 0인 경우는 아무 데이터가 없는 초기 컴포넌트를 구성한다.
         *
         */
        render: function(count) {
            var self = this;

            if (!count) {
                if (this.collection.length < 1) {
                    // 최초 화면 그리는 경우이고, 주어진 group이 없으면.. 빈 칸 1개
                    this.collection.add(new ActivityGroupModel());
                } else {
                    // 최초 화면 그리는 경우이고, 주어진 group이 있으면.. 있는 것을 그린다.
                }
            } else {
                var offset = count - this.collection.length;
                if (offset > 0) {
                    // 현재 갯수보다 큰 경우
                    for (var i = 0; i < offset; i++) {
                        this.collection.push(new ActivityGroupModel({
                            useApproval: true,
                            useAgreement: false,
                            useCheck: false
                        }));
                    }

                } else if (offset < 0) {
                    // 현재 갯수보다 작은 경우
                    for (var i = 0; i < -offset; i++) {
                        this.collection.pop();
                    }
                }
            }

            this.$el.empty();
            this.collection.each(function(m, idx) {
                m.set('seq', idx);
                var lineView = new ActivityGroupItemView({
                    companyIds: this.companyIds,
                    model: m,
                    allowAgreement: self.options['allowAgreement'],
                    agreementAllowType: self.options['agreementAllowType'],
                    allowCheck: self.options['allowCheck'],
                    allowInspection: self.options['allowInspection'],
                    apprlineruleModel: this.apprlineruleModel
                });
                this.$el.append(lineView.render());
            }, this);

            /**
             * 이걸 왜 뷰 트리거로 세팅하냐..
             */
            //최초 등록시 결재타입 기본 체크
            //if (!self.options['formid']) {
            //    this.$('[name=typeOpApproval]:not(:checked)').click();
            //}

            return this.$el.contents();
        },

        getListAsJSON: function() {
            return this.collection.toJSON();
        },

        /**
         * 양식 결재에서 확인을 누를때 부르는 이벤트로 지정결재자가 최대결재자보다 많은 경우 false를 리턴한다.
         */
        isOverMaxApprovalCount: function() {
            var checked = false;
            var isIncludeAgreement = $('#includeAgreement').is(":checked");
            this.collection.each(function(m) {
                var tempActivities = m.get('activities');
                tempActivities = _.filter(tempActivities, function(activity) {
                    if (isIncludeAgreement) {
                        return activity.type == 'APPROVAL' || activity.type == 'AGREEMENT';
                    } else {
                        return activity.type == 'APPROVAL';
                    }
                });
                if (tempActivities.length > m.get('maxApprovalCount'))
                    checked = true;
            }, this);
            return checked;
        },

        isNothingCheckedApprType: function() {
            var checked = false;
            var typeSets = $('#appr_line_tbl').find('.tb_approval_line');
            $(typeSets).each(function(idx, typeSet) {
                var useApprovalState = $(typeSet).find('[name=typeOpApproval]').is(":checked");
                var useAgreementState = $(typeSet).find('[name=typeOpAgreement]').is(":checked");
                var useCheckState = $(typeSet).find('[name=typeOpCheck]').is(":checked");
                var useInspectionState = $(typeSet).find('[name=typeOpInspection]').is(":checked");
                if (!useApprovalState && !useAgreementState && !useCheckState && !useInspectionState) {
                    checked = true;
                }
            });
            return checked;
        },

        isAppointmentOfNotSelectedType: function() {
            var checked = false;
            var apprGroups = $('#appr_line_tbl').find('tr');
            $(apprGroups).each(function(idx, apprGroup) {
                //var useApprovalStateLength = $(apprGroup).find('[name=typeOpApproval]').length;
                var useAgreementStateLength = $(apprGroup).find('[name=typeOpAgreement]').length;
                var useCheckStateLength = $(apprGroup).find('[name=typeOpCheck]').length;
                var $targetsAppointList = $(apprGroup).find('.name_tag').find('li:not("#add_btn_container")');
                if (useAgreementStateLength == 0) {
                    _.each($targetsAppointList, function(target) {
                        if ($(target).find('.name').text().indexOf('(' + approvalLang['합의'] + ')') != -1) {
                            checked = true;
                        }
                    });
                }
                if (useCheckStateLength == 0) {
                    _.each($targetsAppointList, function(target) {
                        if ($(target).find('.name').text().indexOf('(' + approvalLang['확인'] + ')') != -1) {
                            checked = true;
                        }
                    });
                }
            });
            return checked;
        }
    });

    return Backbone.View.extend({

        groupListView: null,
        apprLineCounts: [],

        events: {
            'change #select_appr_line_counts': '_onApprLineCountSelected'
        },

        initialize: function(options) {
            options = _.extend({}, options);
            this.companyIds = null;
            if (_.isArray(options.companyIds)) {
                this.companyIds = options.companyIds;
            }

            var viewOption = {
                companyIds: this.companyIds,
                allowAgreement: options.allowAgreement,
                allowCheck: options.allowCheck,
                allowInspection: options.allowInspection
            };

            if (!_.isUndefined(options.groups)) {
                _.extend(viewOption, {
                    groups: options.groups,
                    apprlinerule: options.apprlinerule,
                    agreementAllowType: options.agreementAllowType,
                    formid: options.formid
                });
            }
            this.groupListView = new ActivityGroupListView(viewOption);
            this.apprLineCounts = _.map([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(num) {
                return {
                    'value': num,
                    'label': num + lang.count,
                    'selected': (options.groups && options.groups.length == num) ? 'selected' : ''
                };
            }, this);
        },

        render: function() {
            this.$el.html(activityGroupAppTmpl({
                apprLineCounts: this.apprLineCounts,
                lang: lang
            }));

            this.$el.find('tbody#appr_line_tbl').html(this.groupListView.render());
            return this.$el;
        },

        getListAsJSON: function() {
            return this.groupListView.getListAsJSON();
        },

        isOverMaxApprovalCount: function() {
            return this.groupListView.isOverMaxApprovalCount();
        },

        isNothingCheckedApprType: function() {
            return this.groupListView.isNothingCheckedApprType();
        },

        isAppointmentOfNotSelectedType: function() {
            return this.groupListView.isAppointmentOfNotSelectedType();
        },
        // 최대 결재자 넘어서 지정 결재자 있는 경우의 처리!
        _onApprLineCountSelected: function(e) {
            var selectedCount = $(e.target).val();
            this.$el.find('tbody#appr_line_tbl').html(this.groupListView.render(selectedCount));
        }
    });
});