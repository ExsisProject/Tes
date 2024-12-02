// 전자결재 설정
define([
        "jquery",
        "underscore",
        "backbone",
        "app",

        "views/circle",
        "admin/views/appr_activity_box_setting",
        "hgn!admin/templates/appr_config",

        "i18n!nls/commons",
        "i18n!approval/nls/approval",
        "i18n!admin/nls/admin",
        "i18n!works/nls/works",

        "jquery.go-orgslide"
    ],
    function (
        $,
        _,
        Backbone,
        GO,
        CircleView,
        ActivityBoxSettingView,
        ApprConfigTpl,
        commonLang,
        approvalLang,
        adminLang,
        worksLang
    ) {
        var ApprConfig = Backbone.Model.extend({
            url: function () {
                return "/ad/api/approval/admin/config";
            }
        });

        var tplVar = {
            '전자결재 설정': adminLang["전자결재 설정"],
            '전자결재 서명 설정': adminLang['전자결재 서명 설정'],
            '결재칸 표기 방법': approvalLang['결재칸 표기 방법'],
            '결재칸 표기 방법 설명': approvalLang['결재칸 표기 방법 설명'],
            '직위 노출': approvalLang['직위 노출'],
            '직책 노출': approvalLang['직책 노출'],
            '전사 문서함 사용': adminLang['전사 문서함 사용'],
            '전사 문서함 설명': adminLang['전사 문서함 설명'],
            '사용': commonLang['사용'],
            '사용하지 않음': commonLang['사용하지 않음'],
            '전자결재 비밀번호 설정': adminLang['전자결재 비밀번호 설정'],
            '결재전용 비밀번호 사용': adminLang['결재전용 비밀번호 사용'],
            '결재전용 비밀번호 설명': adminLang['결재전용 비밀번호 설명'],
            '서명옵션': approvalLang['서명 옵션'],
            '서명을사용하지않음': approvalLang['서명을 사용하지 않음'],
            '서명을사용함': approvalLang['서명을 사용함'],
            '사용자가자신의인장서명을변경할수있음': approvalLang['사용자가 자신의 서명을 변경할 수 있음'],
            '확인 결재 타입': adminLang['확인 결재 타입'],
            '참조자 열람 옵션': adminLang['참조자 열람 옵션'],
            '결재 진행중에도 열람': adminLang['결재 진행중에도 열람'],
            '결재 완료후에만 열람': adminLang['결재 완료후에만 열람'],
            '참조자 열람 옵션 설명': adminLang['참조자 열람 옵션 설명'],
            '합의 결재 옵션': adminLang['합의 결재 옵션'],
            '반대하여도 결재 진행': adminLang['반대하여도 결재 진행'],
            '반대하면 결재 중단': adminLang['반대하면 결재 중단'],
            '합의 결재 옵션 설명': adminLang['합의 결재 옵션 설명'],
            '메일 발송 기능': adminLang['메일 발송 기능'],
            '메일 발송 기능 설명': adminLang['메일 발송 기능 설명'],
            '확인 결재 설명': adminLang['확인 결재 설명'],
            '선결재 기능 사용': adminLang['선결재 기능 사용'],
            '선결재 기능 설명': adminLang['선결재 기능 설명'],
            '1인결재 옵션': adminLang['1인결재 옵션'],
            '1인결재 옵션 설명': adminLang['1인결재 옵션 설명'],
            '비공개 문서 제목 표시': approvalLang['비공개 문서 제목 표시'],
            '비공개 문서 제목 표시 설명': approvalLang['비공개 문서 제목 표시 설명'],
            '제목만 표시': approvalLang['제목만 표시'],
            '비공개 문서로 표시': approvalLang['비공개 문서로 표시'],
            '저장': commonLang['저장'],
            '취소': commonLang['취소'],
            '수신처 설정': adminLang['수신처 설정'],
            '모두 설정 가능': adminLang['모두 설정 가능'],
            '부서만 설정 가능': adminLang['부서만 설정 가능'],
            '사용자만 설정 가능': adminLang['사용자만 설정 가능'],
            '수신처 설정 설명': adminLang['수신처 설정 설명'],
            '합의 결재 설명': adminLang['합의 결재 설명'],
            '보류 옵션': adminLang['보류 옵션'],
            '보류 옵션 설명': adminLang['보류 옵션 설명'],
            '결재칸 설정': adminLang['결재칸 설정'],
            '결재칸 설정 설명': adminLang['결재칸 설정 설명'],
            '결재문서회수': approvalLang['결재문서회수'],
            '결재문서회수설명': approvalLang['결재문서회수설명'],
            '재기안시기결재자통과하기': approvalLang['재기안시기결재자통과하기'],
            '재기안시기결재자통과하기설명': approvalLang['재기안시기결재자통과하기설명'],
            '전단계반려옵션': approvalLang['전단계반려옵션'],
            '전단계반려옵션설명': approvalLang['전단계반려옵션설명'],
            '일괄 결재 옵션': approvalLang['일괄 결재 옵션'],
            '일괄 수신 처리 옵션': approvalLang['일괄 수신 처리 옵션'],
            '일괄 수신처리 설명': approvalLang['일괄 수신처리 설명'],
            '전체 사용': approvalLang['전체 사용'],
            '일부만 사용': approvalLang['일부만 사용'],
            '공문 발송 승인 설정': approvalLang['공문 발송 승인 설정'],
            '공문 발송 설명': approvalLang['공문 발송 설명'],
            '감사 결재 옵션': approvalLang['감사 결재 옵션'],
            '반려 기능 제공': approvalLang['반려 기능 제공'],
            '순차합의': approvalLang['순차합의'],
            '병렬합의': approvalLang['병렬합의'],
            '부서장만 부서합의 가능': adminLang['부서장만 부서합의 가능'],
            '부서장 부부서장만 부서합의 가능': adminLang['부서장 부부서장만 부서합의 가능'],
            '부서원 전체 부서합의 가능': adminLang['부서원 전체 부서합의 가능'],
            '부서합의 설명1': adminLang['부서합의 설명1'], //'합의에 부서를 넣었을 때, 부서합의를 할 수 있는 사용자를 설정합니다.'
            '부서합의 설명2': adminLang['부서합의 설명2'],//'부서장, 부부서장이 없으면 부서내 조직도에서 가장 상단에 있는 사용자가 부서합의를 할 수 있습니다.'
            '부서합의 상세 설명': adminLang['부서합의 상세 설명'], //'합의자를 추가할 때, 부서 또는 사용자만 지정하도록 설정할 수 있습니다.'
            '기본합의설정 설명': adminLang['기본합의설정 설명'],//'합의 순서의 기본값을 설정합니다. 사용자가 기안시 변경할 수 있습니다.'
            '기본': adminLang['기본'],
            '프로세스': worksLang['프로세스'],
            '기타': commonLang['기타'],
            '문서 내보내기 형식': adminLang['문서 내보내기 형식'],
            'pdf형식 사용': adminLang['pdf형식 사용'],
            'HTML형식 사용': adminLang['HTML형식 사용'],
            '문서 내보내기 형식 설명': adminLang['문서 내보내기 형식 설명'],
            'pdf형식 설명': adminLang['pdf형식 설명'],
            '결재 지연 설정': adminLang['결재 지연 설정'],
            '결재지연방지설명': adminLang['결재지연방지설명'],
            '일': adminLang['일'],
            '결재지연기간설정설명': adminLang['결재지연기간설정설명'],
            '결재 지연 안내 메일 발송 일자': adminLang['결재 지연 안내 메일 발송 일자'],
            '업로드 불가 파일': adminLang['업로드 불가 파일'],
            '수정': adminLang['수정'],
            '업로드 제한': adminLang['업로드 제한']
        };

        return Backbone.View.extend({

            el: '#layoutContent',

            delegateEvents: function (events) {
                this.undelegateEvents();
                Backbone.View.prototype.delegateEvents.call(this, events);
                this.$el.on("click.sign", "span#btn_save_appr_config", $.proxy(this.save, this));
                this.$el.on("click.sign", "span#btn_cancel_appr_config", $.proxy(this.cancel, this));
                this.$el.on("click.sign", "input[name=radioAgreement]", $.proxy(this.drawAgreement, this));
                this.$el.on("click.sign", "input[name=agreementAllowType]", $.proxy(this.drawDeptAgreement, this));
                this.$el.on("click", "#activityBoxSettingButton", $.proxy(this.onActivityBoxSettingClicked, this));
                this.$el.on("click.sign", "input[name=radioUseDraftWithdraw]", $.proxy(this.checkUseSkipApproval, this));
                this.$el.on("click.sign", "input[name=radioUseInspection]", $.proxy(this.checkUseInspection, this));
                this.$el.on("click.sign", "input[name=bulklyApprovalType]", $.proxy(this.drawBulklyApprovalTypePart, this));
                this.$el.on("click.sign", "input[name=bulklyReceiveType]", $.proxy(this.drawBulklyReceiveTypePart, this));
                this.$el.on("click.sign", "input[name=radioUseDelayRemind]", $.proxy(this.checkUsedelayRemind, this));
                this.$el.on("click", "span.btn_box[data-btntype='changeForm']", $.proxy(this.changeModifyForm, this));
                this.$el.on("keyup #useDelayRemindTerm", "input[data-type='delayRemindTermType']" , $.proxy(this.delayRemindTermKeyupValidator, this));
                this.$el.on("focusout", "input[data-type='delayRemindTermType']", $.proxy(this.delayRemindTermValidator, this));
                this.$el.on("keyup", "input[name='excludeExtension']", $.proxy(this.keyUPExtensionValidator, this));
            },

            undelegateEvents: function () {
                Backbone.View.prototype.undelegateEvents.call(this);
                this.$el.off(".sign");
                return this;
            },

            events: {
                'click div.tit': '_onClickFold'
            },

            initialize: function () {
                this.$el.off();
                this.model = new ApprConfig();
                this.model.fetch({
                    async: false,
                    statusCode: {
                        403: function () {
                            GO.util.error('403');
                        },
                        404: function () {
                            GO.util.error('404', {"msgCode": "400-common"});
                        },
                        500: function () {
                            GO.util.error('500');
                        }
                    }
                });
            },

            render: function () {
                var activityBoxHeaderType = this.model.get('activityBoxHeaderType');
                var receiveAllowType = this.model.get('receiveAllowType');
                var docConvertType = this.model.get('docConvertType');
                var agreementAllowType = this.model.get('agreementAllowType');
                var deptAgreementType = this.model.get('deptAgreementType');
                var bulklyApprovalType = this.model.get('bulklyApprovalOption');
                var bulklyReceiveType = this.model.get('bulklyReceiveOption');

                var config = {
                    id: this.model.get("id"),
                    usePassword: this.model.get("usePassword"),
                    useCompanyDocFolder: this.model.get("useCompanyDocFolder"),
                    useCheckActivity: this.model.get("useCheckActivity"),
                    referrerVisibleInProgress: this.model.get("referrerVisibleInProgress"),
                    returnOnOpposition: this.model.get('returnOnOpposition'),
                    useAdvApproval: this.model.get("useAdvApproval"),
                    usePrivateDocTitleVisible: this.model.get("usePrivateDocTitleVisible"),
                    useAgreement: this.model.get('useAgreement'),
                    receiveAllowType: {
                        isAll: function () {
                            return receiveAllowType == 'ALL'
                        },
                        isDept: function () {
                            return receiveAllowType == 'DEPARTMENT'
                        },
                        isUser: function () {
                            return receiveAllowType == 'USER'
                        }
                    },
                    docConvertType: {
                        pdfType: function () {
                            return docConvertType == 'PDF'
                        },
                        htmlType: function () {
                            return docConvertType == 'HTML'
                        }
                    },
                    useHold: this.model.get("useHold"),
                    usePreviousReturn: this.model.get("usePreviousReturn"),

                    agreementAllowType: {
                        isAll: function () {
                            return agreementAllowType == 'ALL'
                        },
                        isDept: function () {
                            return agreementAllowType == 'DEPARTMENT'
                        },
                        isUser: function () {
                            return agreementAllowType == 'USER'
                        }
                    },
                    deptAgreementType: {
                        isAll: function () {
                            return deptAgreementType == 'ALL'
                        },
                        isManager: function () {
                            return deptAgreementType == 'MANAGER'
                        },
                        isMaster: function () {
                            return deptAgreementType == 'MASTER'
                        }
                    },
                    useDraftWithdraw: this.model.get('useDraftWithdraw'),
                    useSkipApproval: this.model.get('useSkipApproval'),
                    bulklyApprovalOption: {
                        isAll: function () {
                            return bulklyApprovalType == 'ALL'
                        },
                        isPart: function () {
                            return bulklyApprovalType == 'PART'
                        },
                        isNone: function () {
                            return bulklyApprovalType == 'NONE'
                        }
                    },
                    bulklyReceiveOption: {
                        isAll: function () {
                            return bulklyReceiveType == 'ALL'
                        },
                        isPart: function () {
                            return bulklyReceiveType == 'PART'
                        },
                        isNone: function () {
                            return bulklyReceiveType == 'NONE'
                        }
                    },
                    useOfficialConfirm: this.model.get('useOfficialConfirm'),
                    useInspectionActivity: this.model.get('useInspectionActivity'),
                    useInspectionReturn: this.model.get('useInspectionReturn'),
                    isSeriesAsDefaultAgreementType: this.model.get('defaultAgreementType') == 'SERIES',
                    useDelayRemind: this.model.get('useDelayRemind'),
                    delayRemindMin: this.model.get('delayRemindMin'),
                    delayRemindMax: this.model.get('delayRemindMax'),
                    isEmptyExcludeExtension: (this.model.get('excludeExtension') == null || this.model.get('excludeExtension') == ""),
                    excludeExtension: this.model.get('excludeExtension')
                };

                this.$el.empty();
                this.$el.html(ApprConfigTpl({
                    config: config,
                    lang: tplVar
                }));
                this.drawAgreement();
                this.drawDeptAgreement();
                this.drawBulklyApprovalTypePart();
                this.drawBulklyReceiveTypePart();
                this._renderBulklyApprovalTypePartView();
                this._renderBulklyReceiveTypePartView();
                this._renderDelayRemindTermView();
                return this.$el;
            },

            _onClickFold: function (e) {
                $(e.currentTarget).parent('.module_drop_head').siblings('.module_drop_body').toggle();
            },

            _renderBulklyApprovalTypePartView: function () {
                var nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
                this.bulklyApprovalTypePartView = new CircleView({
                    selector: '#bulklyApprovalPartArea',
                    isAdmin: true,
                    isWriter: true,
                    circleJSON: this.model.get('bulklyApprovalTarget'),
                    nodeTypes: nodeTypes,
                    noSubDept: false
                });
                this.bulklyApprovalTypePartView.render();
            },

            _renderBulklyReceiveTypePartView: function () {
                var nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
                this.bulklyReceiveTypePartView = new CircleView({
                    selector: '#bulklyReceivePartArea',
                    isAdmin: true,
                    isWriter: true,
                    circleJSON: this.model.get('bulklyReceiveTarget'),
                    nodeTypes: nodeTypes,
                    noSubDept: false
                });
                this.bulklyReceiveTypePartView.render();
            },
            _renderDelayRemindTermView: function () {
                var flag = this.$('input:radio[name="radioUseDelayRemind"]:checked').val() == "true";
                this.$("#useDelayRemindTerm").toggle(flag);
            },

            save: function () {
                var self = this;

                var excludeExtensionTarget = $("input[name=excludeExtension]");
                var excludeExtensionValue = excludeExtensionTarget.val();
                if (!_.isUndefined(excludeExtensionValue)) {
                    if (excludeExtensionValue.match(new RegExp("^[a-zA-Z0-9,]*$"))) {
                        excludeExtensionValue = excludeExtensionValue.toLowerCase();
                    } else {
                        excludeExtensionTarget.html(adminLang["영어, 쉼표, 숫자만 입력가능"]);
                        excludeExtensionTarget.focus();
                        return false;
                    }
                } else {
                    excludeExtensionValue = $('span[data-formname="excludeExtension"]').attr('data-value');
                }

                this.model.set({
                    'usePassword': $('input#usePassword').is(":checked") ? true : false,
                    'useCompanyDocFolder': $('input#useCompanyDocFolder').is(":checked") ? true : false,
                    'useCheckActivity': $('input#useCheckActivity').is(":checked") ? true : false,
                    'referrerVisibleInProgress': $('input#referrerVisibleInProgress').is(":checked") ? true : false,
                    'returnOnOpposition': $('input#returnOnOpposition').is(":checked") ? true : false,
                    'useAdvApproval': $('input#useAdvApproval').is(":checked") ? true : false,
                    'usePrivateDocTitleVisible': $('input#usePrivateDocTitleVisible').is(":checked") ? true : false,
                    'useAgreement': $('input#useAgreement').is(":checked") ? true : false,
                    'receiveAllowType': $('input:radio:checked[name=receiveAllowType]').val(),
                    'docConvertType': $('input:radio:checked[name=docConvertType]').val(),
                    'useHold': $('input#useHold').is(":checked") ? true : false,
                    'agreementAllowType': $('input:radio:checked[name=agreementAllowType]').val(),
                    'deptAgreementType': $('input:radio:checked[name=deptAgreementType]').val(),
                    'defaultAgreementType': $('input:radio:checked[name=defaultAgreementType]').val(),
                    'useDraftWithdraw': $('input#useDraftWithdraw').is(":checked") ? true : false,
                    'useSkipApproval': $('input#useSkipApproval').is(":checked") ? true : false,
                    'usePreviousReturn': $('input#usePreviousReturn').is(":checked") ? true : false,
                    'bulklyApprovalOption': $('input:radio[name="bulklyApprovalType"]:checked').val(),
                    'bulklyReceiveOption': $('input:radio[name="bulklyReceiveType"]:checked').val(),
                    'useOfficialConfirm': $('input#useOfficial').is(":checked") ? true : false,
                    'useInspectionActivity': $('input#useInspectionActivity').is(":checked") ? true : false,
                    'useInspectionReturn': $('input#useInspectionReturn').is(":checked") ? true : false,
                    'useDelayRemind': $('input#useDelayRemind').is(":checked") ? true : false,
                    'excludeExtension': excludeExtensionValue
                }, {silent: true});

                if (this.model.get('useDelayRemind')) {
                    this.model.set('delayRemindMin', $('span[data-formname="delayRemindMin"]').attr('data-value'));
                    this.model.set('delayRemindMax', $('span[data-formname="delayRemindMax"]').attr('data-value'));
                }

                this.model.set('bulklyApprovalTarget', {nodes: []});
                if (this.model.get('bulklyApprovalOption') == 'PART') {
                    this.model.set('bulklyApprovalTarget', this.bulklyApprovalTypePartView.getData());
                }

                this.model.set('bulklyReceiveTarget', {nodes: []});
                if (this.model.get('bulklyReceiveOption') == 'PART') {
                    this.model.set('bulklyReceiveTarget', this.bulklyReceiveTypePartView.getData());
                }

                this.model.save({}, {
                    type: 'PUT',
                    success: function (model, response) {
                        if (response.code == '200') {
                            self.render();
                            $.goMessage(commonLang["저장되었습니다."]);
                        }
                    },

                    error: function () {
                        $.goError(commonLang['저장에 실패 하였습니다.']);
                        return false;
                    }
                });
            },

            cancel: function () {
                var self = this;
                $.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function () {
                    self.model = new ApprConfig();
                    self.model.fetch({async: false});
                    self.render();
                    $.goMessage(commonLang["취소되었습니다."]);
                }, commonLang["확인"]);
            },

            drawAgreement: function () {
                var flag = this.$('input:radio[name="radioAgreement"]:checked').val() == "true";
                this.$("#oppositionOpt").toggle(flag);
                this.$('#agreementArea').toggle(flag);
                this.$('#defaultAgreementOption').toggle(flag);
                if (this.model.get('useSystemAgreementAllowOption')) {
                    if (flag) {
                        var isNotUserType = this.$('input:radio[name="agreementAllowType"]:checked').val() != "USER";
                        this.$('#deptAgreementOption').toggle(isNotUserType);
                    } else {
                        this.$('#deptAgreementOption').toggle(flag);
                    }
                }
            },
            drawDeptAgreement: function () {
                if (this.model.get('useSystemAgreementAllowOption')) {
                    var agreementAllowType = this.$('input:radio[name="agreementAllowType"]:checked').val();
                    var flag = agreementAllowType == "ALL" || agreementAllowType == "DEPARTMENT";
                    this.$('#deptAgreementOption').toggle(flag);
                } else {
                    this.$('#deptAgreementOption').toggle(false);
                }
            },
            drawBulklyApprovalTypePart: function () {
                var flag = this.$('input:radio[name="bulklyApprovalType"]:checked').val() == "PART";
                this.$("#bulklyApprovalPartArea").toggle(flag);
            },
            drawBulklyReceiveTypePart: function () {
                var flag = this.$('input:radio[name="bulklyReceiveType"]:checked').val() == "PART";
                this.$("#bulklyReceivePartArea").toggle(flag);
            },
            checkUseInspection: function () {
                var flag = this.$('input:radio[name="radioUseInspection"]:checked').val() == "true";
                if (!flag) {
                    this.$('#useInspectionReturn').attr('checked', false);
                }
                this.$("#useInspectionReturnArea").toggle(flag);
            },

            checkUseSkipApproval: function () {
                var flag = this.$('input:radio[name="radioUseDraftWithdraw"]:checked').val() == "true";
                if (!flag) {
                    this.$('#useSkipApproval').attr('checked', false);
                }
                this.$("#useSkipApprovalArea").toggle(flag);
            },
            checkUsedelayRemind: function () {
                var flag = this.$('input:radio[name="radioUseDelayRemind"]:checked').val() == "true";
                this.$("#useDelayRemindTerm").toggle(flag);
            },

            onActivityBoxSettingClicked: function (e) {
                var popupOkCallback = function (rs) {
                    var errorMessage = view.validateData();
                    if (!_.isEmpty(errorMessage)) {
                        $.goMessage(errorMessage);
                        return false;
                    }
                    this.model.set(view.getData());
                    rs.close();
                };

                var popup = $.goPopup({
                    'header': tplVar['결재칸 설정'],
                    'modal': true,
                    'offset': $(e.currentTarget).offset(),
                    'pclass': 'layer_normal layer_payroom_set',
                    'contents': '',
                    "buttons": [
                        {
                            'btext': commonLang['확인'],
                            'autoclose': false,
                            'btype': 'confirm',
                            'callback': $.proxy(popupOkCallback, this)
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }
                    ]
                });

                var view = new ActivityBoxSettingView({
                    el: popup.find('.content'),
                    configModel: this.model
                });

                view.render();
            },

            // 제거
            release: function () {
                this.$el.off();
                this.$el.empty();
            },
            changeModifyForm: function (e) {
                e.stopPropagation();

                var targetEl = $(e.currentTarget).parent();
                if(targetEl && targetEl.attr('data-formname') == 'excludeExtension') {
                    targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '"id="', targetEl.attr('data-formname'), '" class="input w_large" value="', targetEl.attr('data-value'), '" />'].join(''))
                        .find('input').focusin();
                } else {
                    targetEl.children().toggle();
                    targetEl.find('input').focus();
                }
            },
            delayRemindTermKeyupValidator: function (e) {
                e.stopPropagation();

                var targetEl = $(e.currentTarget).parent();
                var targetId = e.currentTarget.id;
                var validateEl = targetEl.parent().parent().find('.go_alert');
                if (targetId == 'minDelayRemindDay') {
                    validateEl = targetEl.parent().parent().find('#delayRemindMinAlert');
                } else if (targetId == 'maxDelayRemindDay') {
                    validateEl = targetEl.parent().parent().find('#delayRemindMaxAlert');
                }
                validateEl.html('');

                if (e.keyCode >= 96 && e.keyCode <= 105 || e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode == 46 || e.keyCode == 13 || e.keyCode == 8) {
                } else {
                    validateEl.html(adminLang["숫자만 입력하세요."]);
                    e.currentTarget.value = '';
                    return false;
                }
            },
            delayRemindTermValidator: function (e) {
                var targetValue = e.currentTarget.value;
                var targetId = e.currentTarget.id;
                var targetEl = $(e.currentTarget).parent();

                if (targetId == 'minDelayRemindDay') {
                    var maxLength = $('span[data-formname="delayRemindMax"]').attr('data-value');
                    var validateEl = targetEl.parent().parent().find('#delayRemindMinAlert');

                    if (targetValue < 1 || targetValue > 29) {
                        validateEl.html(GO.i18n(adminLang['입력값은 0~0이어야 합니다.'], {"arg1": "1", "arg2": "29"}));
                        e.currentTarget.focus();
                        e.currentTarget.value = '';
                        return false;
                    } else if (parseInt(targetValue) >= parseInt(maxLength)) {
                        validateEl.html(adminLang['기준일 입력 시 입력값보다 작은 수를 입력하세요.']);
                        e.currentTarget.focus();
                        e.currentTarget.value = '';
                        return false;
                    } else {
                        targetEl.attr('data-value', targetValue);
                    }
                }
                if (targetId == 'maxDelayRemindDay') {
                    var minLength = $('span[data-formname="delayRemindMin"]').attr('data-value');
                    var validateEl = targetEl.parent().parent().find('#delayRemindMaxAlert');

                    if (targetValue < 2 || targetValue > 30) {
                        validateEl.html(GO.i18n(adminLang['입력값은 0~0이어야 합니다.'], {"arg1": "2", "arg2": "30"}));
                        e.currentTarget.focus();
                        e.currentTarget.value = '';
                        return false;
                    } else if (parseInt(targetValue) <= parseInt(minLength)) {
                        validateEl.html(adminLang['기준일 입력 시 입력값보다 큰 수를 입력하세요.']);
                        e.currentTarget.focus();
                        e.currentTarget.value = '';
                        return false;
                    } else {
                        targetEl.attr('data-value', targetValue);
                    }
                }
            },
            keyUPExtensionValidator: function(e) {
                var targetValue = e.currentTarget.value;
                var targetEl = $(e.currentTarget).parent();
                var validateEl = targetEl.parent().parent().find('.go_alert');
                validateEl.html('');

                if(!targetValue.match(new RegExp("^[a-zA-Z0-9,]*$"))){
                    validateEl.html(adminLang["영어, 쉼표, 숫자만 입력가능"]);
                    e.currentTarget.focus();
                    e.currentTarget.value = '';
                    return false;
                }
            }
        });
    });
