;(function () {
    define([
            "backbone",
            "app",
            "jquery",
            "models/profile_card",
            "hgn!templates/profile_card",
            "hgn!templates/profile_card_deptInfo",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "i18n!calendar/nls/calendar",
            "i18n!timeline/nls/timeline",
            "jquery.go-popup",
            "jquery.fancybox",
            "jquery.ui"
        ],
        function (
            Backbone,
            GO,
            $,
            ProfileCardModel,
            tplProfileView,
            tplProfileDeptInfoView,
            CommonLang,
            AdminLang,
            CalLang,
            TimelineLang
        ) {
            var instance = null,
                lang = {
                    'send_mail': CommonLang['이메일'],
                    'show_calendar': CommonLang['일정 보기'],
                    'deleted_member': CommonLang['삭제된 계정입니다.'],
                    'direct_tel': "Rep.",
                    'phone': "Cell.",
                    'representive_tel': "Rep.",
                    'fax': "Fax.",
                    'self_info_guide': CommonLang["자기소개서는 2줄까지 입력이 가능합니다."],
                    'lunar_calendar': CommonLang["(음)"],
                    '닫기': CommonLang['닫기'],
                    '수정': CommonLang['수정'],
                    '회사명': AdminLang['회사명'],
                    '전화번호': CommonLang["전화번호"],
                    '회사번호': CommonLang['회사번호'],
                    '직책부서': CommonLang['직책부서'],
                    '홈페이지': AdminLang['홈페이지'],
                    '이메일': CommonLang['이메일'],
                    '생일': AdminLang['생일'],
                    '주소': AdminLang['주소'],
                    '메모': CommonLang['메모'],
                    '자기소개': AdminLang['자기소개'],
                    '직무': AdminLang['직무'],
                    '직급': AdminLang['직급'],
                    '직통전화': CommonLang['직통전화'],
                    '휴대전화': AdminLang['휴대전화'],
                    '대표전화': AdminLang['대표전화'],
                    '팩스': AdminLang['팩스'],
                    '위치': AdminLang['위치'],
                    '인식번호': CommonLang['인식번호'],
                    '메신저': AdminLang['메신저'],
                    '기념일': AdminLang['기념일'],
                    '직책부서더보기': '...' + CommonLang['더보기'],
                    '직책부서접기': '...' + CommonLang['접기'],
                };

            var profileCardDeptInfo = Backbone.View.extend({

                initialize: function (options) {
                    this.options = options || {};
                    this.depts = options.depts || {};
                    this.isMultiDept = (options.depts.deptMembers.length > 1 ? true : false);
                    this.isMoreView = (options.depts.deptMembers.length > 1 ? false : true);
                },
                bindEvent: function () {
                    $(this.$el).on("click", "a.txt_link", $.proxy(this.changeDept, this));
                },
                unBindEvent: function () {
                    $(this.$el).off("click", "a.txt_link", $.proxy(this.changeDept, this));
                },
                render: function() {
                    this.unBindEvent();
                    this.$el.empty();

                    var deptModel = this.convertView(this.depts);

                    if (this.isMultiDept && !this.isMoreView) {
                        deptModel = deptModel[0];
                    }

                    this.$el.append(tplProfileDeptInfoView({
                        depts: deptModel,
                        isMultiDept: this.isMultiDept,
                        isMoreView: this.isMoreView,
                        lang: lang,
                    }));

                    this.bindEvent();
                },

                convertView: function (data) {
                    return $(data.deptMembers).map(function (k, v) {
                        var gradeName = "";
                        if (data.profileExposureInfoModel.grade) {
                            gradeName = data.grade;
                        }
                        return {
                            position: v.deptName + '  ' + (v.dutyName || '')+ '  ' + (gradeName || ''),
                            team: v.parentsDeptPath || '',
                        }
                    }).get();
                },

                changeDept: function() {
                    this.isMoreView = !this.isMoreView;
                    this.render();
                }
            });

            var ProfileView = Backbone.View.extend({
                initialize: function (options) {
                    this.options = options || {};
                    this.userId = this.options.userId;
                    this.targetEl = this.options.targetEl;
                    this.offset = this.options.offset;
                    this.isAvailableCal = GO.isAvailableApp('calendar');
                    this.isAvailableMail = GO.isAvailableApp('mail');
                    this.mailExposure = GO.config('mailExposure');
                    if (this.el) this.unbindEvent();
                },
                bindEvent: function () {
                    $(this.el)
                        .on("click", "span.ic_close", $.proxy(this.checkContent, this))
                        .on("click", "span.ic_modify", $.proxy(this.checkContent, this))
                        .on("click", "a.btn_v2_calendar", $.proxy(this.checkContent, this))
                        //				.on("click", "a.showProfilePhoto", $.proxy(this.showProfilePhoto, this))
                        .on("click", "a.btn_v2_mail", $.proxy(this.checkContent, this))
                        .on("mouseover", '#timeline_status', $.proxy(this.showTimeline, this))
                        .on("mouseout", '#timeline_status', $.proxy(this.hideTimeline, this));
                },
                showTimeline: function () {
                    this.el.find('#timeline_message').css('display', 'block');
                },
                hideTimeline: function () {
                    this.el.find('#timeline_message').css('display', 'none');
                },
                unbindEvent: function () {
                    $(this.el)
                        .off("click", "span.ic_close")
                        .off("click", "span.ic_modify")
                        .off("click", "a.btn_v2_calendar")
                        //				.off("click", "a.showProfilePhoto")
                        .off("click", "a.btn_v2_mail");
                },
                showCalendar: function () {
                    var self = this;
                    require(['models/calendar_permission'], function (CalendarPermission) {
                        var CalPermModel = new CalendarPermission({userId: self.userId});
                        CalPermModel.fetch({async: false});
                        if (CalPermModel.get('read')) {
                            GO.router.navigate("calendar/user/" + self.userId, {trigger: true, pushState: true});
                        } else {
                            // TODO 관심동료 신청 연결.
                            //임시 알림문구
                            if (CalPermModel.get('follow')) {
                                $.goPopup({
                                    title: CalLang["일정을 열람할 수 없습니다"],
                                    message: CalLang["관심 동료가 되면 일정을 열람할 수 있습니다"],
                                    buttons: [{
                                        'btext': CalLang["관심동료 신청"],
                                        'btype': 'confirm',
                                        'callback': function () {
                                            var url = GO.config("contextRoot") + "api/calendar/user/" + self.userId + "/feed";
                                            Backbone.ajax(url, {type: "POST"}).done(function (resp) {
                                                $.goMessage(CalLang["관심동료 신청이 완료되었습니다."]);
                                                if (GO.router.getPackageName() == 'calendar') GO.router.navigate("calendar", {
                                                    trigger: true,
                                                    replace: true
                                                });
                                            }).fail(function () {
                                                $.goMessage(CalLang["관심동료 추가시 오류가 발생하였습니다."]);
                                            });
                                        }
                                    }, {
                                        'btext': CommonLang["취소"],
                                        'btype': 'normal'
                                    }]
                                });
                            } else {
                                $.goMessage(CalLang["상대방의 관심동료 수락이 완료되면 조회가 가능합니다."]);
                            }
                        }
                    });
                },
                checkContent: function (e) {
                    var type = $(e.currentTarget).attr("data-type");
                    if (!this.isEmptyContent(type)) {
                        this.contentAlert(type);
                    } else {
                        this.performActions(type);
                    }

                },
                performActions: function (type) {
                    console.log(type);
                    if (type == "mail") {
                        this.moveToSendMail();
                    } else if (type == "calendar") {
                        this.showCalendar();
                    } else if (type == "modify") {
                        this.moveToMyProfile();
                    } else if (type == "close") {
                        $.goPopup.close();
                    }
                },
                moveToMyProfile: function () {
                    GO.router.navigate("my/profile", {trigger: true, pushState: true});
                },
                moveToSendMail: function () {
                    var data = this.model.toJSON(),
                        url = GO.router.getSendMailUrl({
                            name: data.name,
                            position: data.position,
                            email: data.email,
                            department: $.isArray(data.deptMembers) && data.deptMembers[0] ? data.deptMembers[0].deptName : ''
                        });

                    if (url) window.open(url, "popupRead" + Math.floor(Math.random() * 1000000) + 1, "scrollbars=yes,resizable=yes,width=1280,height=760");
                    //window.location.href = url;
                },
                convertTimelineStatus: function (timelineOneDaySimpleModel) {
                    if (!timelineOneDaySimpleModel) {
                        return {
                            visible : false,
                            status : '',
                            message : '',
                            duration : '',
                            color : ''
                        };
                    }
                    var timelineMessage = {
                        visible : true
                    };
                    switch (timelineOneDaySimpleModel.status) {
                        case 'VACATION':
                            timelineMessage.status = TimelineLang["휴가"];
                            timelineMessage.color = 'state_vacation';
                            break;
                        case 'GO_TO_WORK':
                            timelineMessage.status = TimelineLang["출근"];
                            timelineMessage.color = 'state_work';
                            break;
                        case 'LEAVE_WORK':
                            timelineMessage.status = TimelineLang["퇴근"];
                            timelineMessage.color = '';
                            break;
                        default:
                            timelineMessage.status = TimelineLang["출근 전"];
                            timelineMessage.color = '';
                    }
                    timelineMessage.message = timelineOneDaySimpleModel.message || TimelineLang["출근 전 입니다"];
                    timelineMessage.duration = timelineOneDaySimpleModel.duration || moment().format('YYYY-MM-DD(ddd)');
                    return timelineMessage;
                },
                render: function () {
                    if (this.model) this.model.clear();

                    this.model = ProfileCardModel.get(this.userId);

                    var data = this.model.toJSON();

                    var timelineMessage = this.convertTimelineStatus(data.timelineOneDaySimpleModel);
                    var isSessionId = (data.id == GO.session("id")) ? true : false;

                    data.contact = this.getSubContactInfo(data);
                    data.rightSpaceItems = this.getRightSpaceItems(data);
                    data.displayRightSpace = this.getRightSpaceStatus(data.rightSpaceItems);
                    data.mailExposure = this.mailExposure;

                    var tpl = tplProfileView({
                        dataset: data,
                        isSessionId: isSessionId,
                        timelineMessage: timelineMessage,
                        isAvailableCal: (this.isAvailableCal && GO.session("companyId") == data.companyId),
                        isAvailableMail: this.isAvailableMail,
                        getDeptName: function () {
                            var resStr = '';
                            if (data.deptMembers.length > 0 ){
                                resStr = '<span class="txt">' +
                                    data.deptMembers[0].deptName + ' ' + (data.deptMembers[0].dutyName || '') + ' ' + (data.grade || '') +
                                    '</span>' +
                                    '<span class="ic_v2 ic_profile ic_profile_tooltip" title="' + (data.deptMembers[0].parentsDeptPath || '') + '"></span>'
                            } else {
                                if (data.profileExposureInfoModel.grade) {
                                    resStr = '<span class="txt">' +data.grade + '</span>'
                                }
                            }
                            return resStr;
                        },
                        lang: lang,
                        isOrgServiceOn: GO.session("useOrgAccess")
                    });

                    var popupOptions = {
                        "pclass": "layer_member_card_type2",
                        "modal": false,
                        "contents": tpl,
                        "width": 520,
                        openCallback: function () {
                            $("#gpopupLayer header").remove();
                            var deptView = new profileCardDeptInfo({depts: data});
                            deptView.render();
                            this.$(".wrap_list_position_team").append(deptView.el);
                        }
                    };

                    if (this.offset) {
                        popupOptions.offset = this.offset;
                    } else if (this.targetEl) {
                        var targetEl = $(this.targetEl),
                            targetOffset = targetEl.offset(),
                            windowWidth = $(window).width(),
                            upperRightLeft = targetOffset.left + targetEl.width() + popupOptions.width;

                        popupOptions.offset = {
                            top: targetOffset.top + targetEl.height() + 5,
                            left: targetOffset.left + targetEl.width() + 5
                        };

                        // 오른쪽 영역밖을 벗어났을 경우 보정...(추후 go-popup 자체서 보정하도록 변경)
                        if (windowWidth < upperRightLeft) {
                            // 둥근 모서리 만들기 위해 좌우상하 12px씩 마진을 줘야 함....
                            var roundFix = 32,
                                delta = upperRightLeft - windowWidth + roundFix;
                            popupOptions.offset.left -= delta;
                        }

                        //TODO: 팝업 위치가 화면 아래쪽을 벗어날 경우 처리...
                    }
                    this.el = $.goPopup(popupOptions);
                    this.el.draggable({
                        handle: '.handle',
                        cursor: "move",
                        start: function (event, ui) {
                            $(this).css('bottom', '');
                        }

                    });
                    //if(this.offset) {
                    //	if($.browser.mozilla){
                    //		$('.layer_card').css('top', '50%');
                    //	}else{
                    //		$('.layer_card').css('top', 'initial');
                    //	}
                    //}
                    this.bindEvent();
                }
                ,
                getRightSpaceStatus: function (rightSpaceItems) {

                    var displayRightSpace = false;
                    _.each(rightSpaceItems, function (item) {
                        displayRightSpace = displayRightSpace || item.display;
                    });

                    return displayRightSpace;
                },

                getRightSpaceItems: function (data) {
                    /**
                     * 순서
                     자기소개, 회사명, 소속+직책, 직무, 직급, 직통전화, 휴대전화, 대표전화, 팩스, 위치, 인식번호(사번),
                     생일, 홈페이지, 메신저, 기념일, 주소, 메모
                     */
                    var rightSpaceItems = [];
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.selfInfo) && data.profileExposureInfoModel.selfInfo),
                        "title": lang['자기소개'],
                        "class": "",
                        "value": data.selfInfo || data.profileExposureInfoModel.selfInfo
                    });
                    rightSpaceItems.push({
                        "display": true,
                        "title": lang['회사명'],
                        "class": "",
                        "value": data.companyName
                    });
                    rightSpaceItems.push({
                        "isDept": true,
                        "display": true,
                        "title": lang['직책부서'],
                        "class": "",
                        "value": data.companyName
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.job) && data.profileExposureInfoModel.job),
                        "value": data.job || data.profileExposureInfoModel.job,
                        "class": "",
                        "title": lang['직무'],
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.grade) && data.profileExposureInfoModel.grade),
                        "value": data.grade || data.profileExposureInfoModel.grade,
                        "class": "",
                        "title": lang['직급'],
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.directTel) && data.profileExposureInfoModel.directTel),
                        "value": data.directTel || data.profileExposureInfoModel.directTel,
                        "class": "",
                        "title": lang['직통전화'],
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.mobileNo) && data.profileExposureInfoModel.mobileNo),
                        "value": data.mobileNo || data.profileExposureInfoModel.mobileNo,
                        "class": "",
                        "title": lang['휴대전화'],
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.repTel) && data.profileExposureInfoModel.repTel),
                        "value": data.repTel || data.profileExposureInfoModel.repTel,
                        "class": "",
                        "title": lang['대표전화'],
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.fax) && data.profileExposureInfoModel.fax),
                        "value": data.fax || data.profileExposureInfoModel.fax,
                        "class": "",
                        "title": lang['팩스'],
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.location) && data.profileExposureInfoModel.location),
                        "value": data.location || data.profileExposureInfoModel.location,
                        "class": "",
                        "title": lang['위치'],
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.employeeNumber) && data.profileExposureInfoModel.employeeNumber),
                        "value": data.employeeNumber || data.profileExposureInfoModel.employeeNumber,
                        "class": "",
                        "title": lang['인식번호']
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.birthday) && data.profileExposureInfoModel.birthday),
                        "value": data.lunarCal ? lang.lunar_calendar + " " + GO.util.shortDate(data.birthday) : GO.util.shortDate(data.birthday),
                        "class": "",
                        "title": lang['생일'],
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.homePage) && data.profileExposureInfoModel.homePage),
                        "value": data.homePage || data.profileExposureInfoModel.homePage,
                        "class": "",
                        "title": lang['홈페이지'],
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.messanger) && data.profileExposureInfoModel.messanger),
                        "value": data.messanger || data.profileExposureInfoModel.messanger,
                        "class": "",
                        "title": lang['메신저'],
                    });

                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.anniversary) && data.profileExposureInfoModel.anniversary),
                        "value": GO.util.shortDate(data.anniversary || data.profileExposureInfoModel.anniversary),
                        "class": "",
                        "title": lang['기념일'],
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.address) && data.profileExposureInfoModel.address),
                        "value": data.address || data.profileExposureInfoModel.address,
                        "class": "",
                        "title": lang['주소'],
                    });
                    rightSpaceItems.push({
                        "display": (!_.isEmpty(data.memo) && data.profileExposureInfoModel.memo),
                        "value": data.memo || data.profileExposureInfoModel.memo,
                        "class": "",
                        "value": data.memo,
                        "title": lang['메모'],
                    });

                    return rightSpaceItems;
                }
                ,

                getSubContactInfo: function (data) {
                    var contact = [];
                    if (data.mobileNo && data.profileExposureInfoModel.mobileNo) {
                        contact.push({
                            isTop: contact.length % 2 == 0 ? true : false,
                            title: "Cell.",
                            number: data.mobileNo
                        });
                    }
                    if (data.repTel && data.profileExposureInfoModel.repTel) {
                        contact.push({
                            isTop: contact.length % 2 == 0 ? true : false,
                            title: "Rep.",
                            number: data.repTel
                        });
                    }
                    if (data.directTel && data.profileExposureInfoModel.directTel) {
                        contact.push({
                            isTop: contact.length % 2 == 0 ? true : false,
                            title: "Dir.",
                            number: data.directTel
                        });
                    }
                    if (data.fax && data.profileExposureInfoModel.fax) {
                        contact.push({
                            isTop: contact.length % 2 == 0 ? true : false,
                            title: "Fax.",
                            number: data.fax
                        });
                    }
                    return contact;
                }
                ,
                isEmptyContent: function (type) {

                    if (GO.util.hasActiveEditor() && type != "close") {
                        return !GO.util.isEditorWriting();
                    }

                    return true;
                }
                ,
                contentAlert: function (type) {
                    var self = this;
                    $.goPopup({
                        title: '',
                        message: CommonLang["내용 작성 중 이동 경고 메시지"],
                        modal: true,
                        buttons: [
                            {
                                'btext': CommonLang["확인"],
                                'btype': 'confirm',
                                'callback': function () {
                                    self.performActions(type);
                                }
                            },
                            {
                                'btext': CommonLang["취소"],
                                'btype': 'normal',
                                'callback': function () {
                                    return;
                                }
                            }]
                    });
                }
                ,
            });
            return {
                render: function (userId, targetEl, offset) {
                    instance = new ProfileView({userId: userId, targetEl: targetEl, offset: offset});
                    instance.render();
                }
            };
        });
})(jQuery);
