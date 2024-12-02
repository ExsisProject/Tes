(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "admin/models/display_config",
            "hgn!templates/user/user_profile",
            "models/user_profile",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "i18n!nls/user",
            "file_upload",
            "jquery.go-validation",
            "jquery.go-popup",
            "jquery.go-sdk"
        ],
        function (
            $,
            Backbone,
            App,
            DisplayConfigModel,
            ContentTmpl,
            UserProfileModel,
            commonLang,
            adminLang,
            userLang,
            FileUpload
        ) {
            var isValidation = {
                    mobileNo: true,
                    directTel: true,
                    repTel: true,
                    fax: true,

                },
                UserProfile = Backbone.View.extend({
                    type: {
                        title: userLang["기본정보"],
                        goBack: userLang["이전으로"],
                        image: commonLang["사진"],
                        imageUpload: commonLang["사진 올리기"],
                        imageUploadInfo: commonLang["※ 사진은 자동으로 100x100 사이즈로 적용 됩니다."],
                        name: commonLang["이름"],
                        company: userLang["회사"],
                        department: userLang["부서"],
                        employeeNumber: userLang["사원번호"],
                        position: userLang["직위"],
                        grade: userLang["직급"],
                        job: adminLang["직무"],
                        email: userLang["이메일"],
                        externalEmail: userLang["외부 메일"],
                        phone: "Cell.",
                        dirTel: "Dir.",
                        repTel: "Rep.",
                        fax: "Fax.",
                        save: commonLang["저장"],
                        cancel: commonLang["취소"],
                        modify: commonLang["수정"],
                        saveFail: commonLang["저장에 실패 하였습니다."],
                        saveSuccess: commonLang["저장되었습니다."],
                        deletePhoto: commonLang["삭제"],
                        password: userLang["비밀번호"],
                        changPassword: userLang["비밀번호 변경"],
                        dept_desc: userLang["겸직의 경우 부서의 우선순위를 변경할 수 있습니다."],
                        label_email_invalid_msg: commonLang['이메일 형식이 올바르지 않습니다.'],
                        label_email_my_mail: userLang['현재 이메일 주소와 동일합니다. 다른 주소를 입력해 주세요'],
                        label_max_length_msg: App.i18n(commonLang['최대 {{arg1}}자 까지 입력할 수 있습니다.'], {"arg1": "51"}),
                        text_long_max_length_placeholder: App.i18n(commonLang['최대 {{arg1}}자 까지만 입력 가능'], {"arg1": "100"}),
                        text_long_mid_length_placeholder: App.i18n(commonLang['최대 {{arg1}}자 까지만 입력 가능'], {"arg1": "50"}),
                        text_short_max_placeholder: App.i18n(commonLang['최대 {{arg1}}자 까지만 입력 가능'], {"arg1": "20"}),
                        text_job_short_max_placeholder: App.i18n(commonLang['최대 {{arg1}}자 까지만 입력 가능'], {"arg1": "150"}),
                        text_long_max_length_msg: App.i18n(commonLang['최대 {{arg1}}자 까지 입력할 수 있습니다.'], {"arg1": "100"}),
                        text_long_mid_length_msg: App.i18n(commonLang['최대 {{arg1}}자 까지 입력할 수 있습니다.'], {"arg1": "50"}),
                        text_short_max_length_msg: App.i18n(commonLang['최대 {{arg1}}자 까지 입력할 수 있습니다.'], {"arg1": "20"}),
                        text_job_short_max_length_msg: App.i18n(commonLang['최대 {{arg1}}자 까지 입력할 수 있습니다.'], {"arg1": "150"}),
                        verify_ok: userLang["인증 완료"],
                        verify_mail_desc: userLang["※ 발송된 인증 메일을 확인해 주세요."],
                        reverify_mail: userLang["재발송"],
                        externalEmail_tooltip: userLang["외부메일툴팁"],
                        homepage: adminLang["홈페이지"],
                        messanger: adminLang["메신저"],
                        selfInfo: adminLang["자기소개"],
                        memo: adminLang["메모"],
                        address: adminLang["주소"],
                        location: adminLang["위치"],
                        birthday: adminLang["생일"],
                        anniversary: adminLang["기념일"],
                        only_number: adminLang["숫자만 입력하세요."],
                        lunar_calendar: commonLang['(음)'],
                        lunar_cal_desc: commonLang['음력선택'],
                        select_desc: commonLang["선택"],
                        year: commonLang['년'],
                        month: commonLang['달'],
                        day: commonLang['날']

                    },
                    el: "#content",
                    delegateEvents: function (events) {
                        this.undelegateEvents();
                        Backbone.View.prototype.delegateEvents.call(this, events);
                        this.$el.on("keyup.userconfig", "#profileForm :text", $.proxy(this.checkLength, this));
                        this.$el.on("click.userconfig", "#save", $.proxy(this.save, this));
                        this.$el.on("click.userconfig", "#cancel", $.proxy(this.cancel, this));
                        this.$el.on("click.userconfig", "span.txt_form", $.proxy(this.toggle, this));
                        this.$el.on("click.userconfig", "span.tooltip", $.proxy(this.toggle, this));
                        this.$el.on("click", ".btn_fn7", $.proxy(this.deletePhoto, this));
                        this.$el.on("click", "#btn_changePassword", $.proxy(this.changePassword, this));
                        this.$el.on("blur", "input[name='externalEmail']", $.proxy(this.checkEmailFormat, this));
                        this.$el.on("click", "#externalEmailUnverified_form", $.proxy(this.checkEmailFormat, this));
                        this.$el.on("click", "#btn_reVerifyMail", $.proxy(this.sendVerifyMail, this));

                        return this;
                    },
                    checkEmailFormat: function (e) {
                        var targetEl = $(e.target);
                        var value = targetEl.val();
                        if (value == "" && targetEl.attr('id') == 'externalEmailUnverified_form') {
                            value = this.model.get('externalEmailUnverified');
                        } else {
                            targetEl.nextAll().hide();
                        }
                        var valid = true;
                        if (GO.session().email == value) {
                            isValidation['externalEmail'] = false;
                            $("#myMail").show();
                            return;
                        } else {
                            isValidation['externalEmail'] = valid;
                            $("#myMail").hide();
                        }
                        if (value) {
                            valid = GO.util.checkEmailFormat(value);
                        }

                        if (valid) {
                            targetEl.next().next().hide();
                        } else {
                            targetEl.next().next().show();
                        }
                        isValidation['externalEmail'] = valid;
                    },
                    checkLength: function (e) {
                        var targetEl = $(e.target);
                        var valid = $.goValidation.isCheckLength(0, targetEl.attr("maxlength"), targetEl.val());
                        if (targetEl.attr("name") == 'externalEmail') {
                            return;
                        }
                        if (valid) {
                            isValidation[targetEl.attr("name")] = valid;
                            targetEl.next().hide();
                        } else {
                            isValidation[targetEl.attr("name")] = false;
                            targetEl.next().show();
                        }
                    },
                    checkValidation: function () {
                        $.each(isValidation, function (key, value) {
                            if (!value) {
                                throw Error("", "");
                            }
                        });

                        var checkNames = this.getNumbericNames();
                        checkNames.forEach(function (item) {
                            var target = $("#profileForm input[name*='" + item + "']");
                            this.isNumbericCheck(target[0]);
                        }, this);
                    },
                    undelegateEvents: function () {
                        Backbone.View.prototype.undelegateEvents.call(this);
                        this.$el.off(".userconfig");
                        return this;
                    },
                    initialize: function () {
                        $(this.el).removeClass("go_home");
                        this.model = UserProfileModel.read(GO.session().id);
                        this.displayConfigModel = DisplayConfigModel.read({admin: false});
                    },
                    toggle: function (e) {
                        //수정 여부가 가능 할 경우만 수정 처리진행
                        if (this.model.get("profileEditable")) {
                            var $toggleEl = $(e.target).parents("td").find("span.txt_form");
                            $toggleEl.hide();
                            if ($toggleEl.attr('id')) {
                                $("#verifyOk").hide();
                                $("#btn_reVerifyMail").hide();
                                $("#verifyMailDesc").hide();
                            }
                            $toggleEl.next().show();
                        }
                    },
                    render: function () {
                        var displayConfigs = this.displayConfigModel.toJSON();
                        var blockPasswordChange = function () {
                            return displayConfigs.blockPasswordChange;
                        };

                        if (this.model.get('birthday') != undefined && this.model.get('birthday').length > 0) {
                            this.model.set('birthdayDate', App.util.shortDate(this.model.get('birthday')));
                        } else {
                            this.model.set('birthdayDate', '');
                        }

                        if (this.model.get('anniversary') != undefined && this.model.get('anniversary').length > 0) {
                            this.model.set('anniversaryDate', App.util.shortDate(this.model.get('anniversary')));
                        } else {
                            this.model.set('anniversaryDate', '');
                        }

                        var userData = this.model.toJSON(),
                            hasExternalEmailUnverified = (userData.externalEmailUnverified != undefined && userData.externalEmailUnverified != "") ? true : false,
                            hasExternalEmail = (userData.externalEmail != undefined && userData.externalEmail != "") ? true : false,
                            externalEmailIsEmpty = !hasExternalEmailUnverified && !hasExternalEmail ? true : false;
                        var tmpl = ContentTmpl({
                            type: this.type,
                            user: userData,
                            externalEmailIsEmpty: externalEmailIsEmpty,
                            hasExternalEmailUnverified: hasExternalEmailUnverified,
                            hasExternalEmail: hasExternalEmail,
                            deptNames: this.__setDepartment(),
                            blockPasswordChange: blockPasswordChange,
                            passwordSearchFeature: GO.config('passwordSearchFeature')
                        });
                        this.$el.html(tmpl);
                        this.datePickerInit();
                        if (userData.profileEditable) {
                            this.initFileUpload();
                        }
                        this.initSortable();
                        this.customFieldRender(this.model);
                        this._renderBrowserTitle();
                        this.setBirthdaySelect();
                    },
                    setBirthdaySelect: function () {
                        var MINYEAR = 1900;
                        var MAXYEAR = moment().format('YYYY');
                        var MINMONTH = 1;
                        var MAXMONTH = 12;
                        var MINDAY = 1;
                        var MAXDAY = 31;
                        var yearOptions = '';
                        var monthOptions = '';
                        var dayOptions = '';
                        var birthdayArray = [];

                        if (this.model.get('birthdayDate') != undefined && this.model.get('birthdayDate') != "") {
                            birthdayArray = this.model.get('birthdayDate').split('-');
                        }

                        for (i = MAXYEAR; i >= MINYEAR; i--) {
                            if (parseInt(birthdayArray[0]) == i) {
                                yearOptions += "<option value=" + i + " selected = 'selected'>" + i + this.type.year + "</option>"
                            } else {
                                yearOptions += "<option value=" + i + ">" + i + this.type.year + "</option>"
                            }
                        }
                        for (i = MINMONTH; i <= MAXMONTH; i++) {
                            if (parseInt(birthdayArray[1]) == i) {
                                monthOptions += "<option value=" + App.util.leftPad(i, 2, "0") + " selected = 'selected'>" + i + this.type.month + "</option>"
                            } else {
                                monthOptions += "<option value=" + App.util.leftPad(i, 2, "0") + ">" + i + this.type.month + "</option>"
                            }
                        }
                        for (i = MINDAY; i <= MAXDAY; i++) {
                            if (parseInt(birthdayArray[2]) == i) {
                                dayOptions += "<option value=" + App.util.leftPad(i, 2, "0") + " selected = 'selected'>" + i + this.type.day + "</option>"
                            } else {
                                dayOptions += "<option value=" + App.util.leftPad(i, 2, "0") + ">" + i + this.type.day + "</option>"
                            }
                        }
                        $('#birthdayYear').append(yearOptions);
                        $('#birthdayMonth').append(monthOptions);
                        $('#birthdayDay').append(dayOptions);
                    },
                    initSortable: function () {
                        $("#dept_list").sortable({
                            delay: 100,
                            items: "li",
                            //containment : "#dept_list",
                            start: function (event, ui) {
                                //ui.placeholder.html(ui.helper.html());
                                //ui.placeholder.find('li').css('padding','5px 10px');
                            }
                        });
                    },
                    _renderBrowserTitle: function () {
                        $(document).attr('title', this.type['title'] + ' - ' + GO.config('webTitle'));
                    },
                    __setDepartment: function () {
                        var members = this.model.toJSON().deptMembers,
                            names = "";

                        if (members.length > 0) {
                            names += members[0].deptName;
                            for (var i = 1; i < members.length; i++) {
                                names += (" / " + members[i].deptName);
                            }
                        }
                        return names;
                    },
                    sendVerifyMail: function () {
                        $.go(GO.contextRoot + "api/email/issue", {}, {
                            qryType: 'GET',
                            contentType: 'application/json',
                            responseFn: function (response) {
                                $.goMessage(commonLang["메일을 발송했습니다."]);
                            },
                            error: function (error) {
                                $.goMessage(commonLang["실패했습니다."]);
                            }
                        });
                    },
                    cancel: function () {
                        this.reload();
                        return false;
                    },
                    save: function () {
                        try {
                            this.checkValidation();
                        } catch (e) {
                            if ("onlyNumber" == e.message) {
                                $.goMessage(this.type.only_number);
                            } else {
                                $.goAlert(commonLang["입력 항목을 확인해 주세요"]);
                            }
                            return false;
                        }

                        var self = this;
                        var userProfile = this.profileBuilder();
                        for (field in userProfile) {
                            var fieldValue = userProfile[field];
                            if (fieldValue && typeof (fieldValue) == "string") {
                                userProfile[field] = $.trim(fieldValue);
                            }
                        }
                        this.model.attributes = $.extend({}, this.model.attributes, userProfile);

                        this.model.save(null, {
                            success: function (e) {
                                var message = "";
                                if (GO.config('orgSyncWaitMin') > 0) {
                                    message = GO.i18n(commonLang["기본정보 프로필 저장 메시지"], {
                                        'term': GO.config('orgSyncWaitMin')
                                    });
                                }
                                $.goAlert(self.type.saveSuccess, message, $.proxy(self.reload, self));
                                $("#sessionThumbnail").attr("src", e.attributes.thumbSmall);
                                if (GO.useMiniGnb === "true") {
                                    $("#photo_thumb").attr("src", e.attributes.thumbSmall);
                                }
                            }, error: function (model, error) {
                                $.goAlert(self.type.saveFail);
                            }
                        });
                        return false;
                    },
                    reload: function () {
                        this.initialize();
                        this.render();
                    },
                    changePassword: function () {
                        var popupWindow = window.open(GO.contextRoot + "app/my/password", "Password", "width=630,height=580 top=" + ((screen.height / 2) - 200) + " left=" + ((screen.width / 2) - 180));
                        popupWindow.sessionStorage.setItem('doAdsExceptPage', 'true');
                    },
                    deletePhoto: function () {
                        var $thumbnail = $("#thumbnail_image");

                        $thumbnail.attr("data-filepath", "");
                        $thumbnail.attr("data-filename", "sample");
                        $thumbnail.attr("src", GO.contextRoot + "resources/images/photo_profile_large.jpg");
                    },
                    profileBuilder: function () {
                        var form = $("#profileForm"),
                            model = {},
                            $thumbnail = $("#thumbnail_image"),
                            thumbnail_image = {
                                filePath: $thumbnail.attr("data-filepath").replace(GO.contextRoot, ""),
                                fileName: $thumbnail.attr("data-filename"),
                                hostId: $thumbnail.attr("host-id")
                            };

                        if (thumbnail_image["filePath"] == "" && thumbnail_image["fileName"] == "") {
                            thumbnail_image = null;
                        }

                        model["attPhoto"] = thumbnail_image;

                        $(form.serializeArray()).each(function (k, v) {
                            /*if(v.name == "birthday" && v.value.length > 0){
                                model[v.name] = App.util.toISO8601(v.value);
                            } else */
                            if (v.name == "anniversary" && v.value.length > 0) {
                                model[v.name] = App.util.toISO8601(v.value);
                            } else {
                                model[v.name] = v.value;
                            }

                        });

                        var birthdayYear = form.find('#birthdayYear').val(),
                            birthdayMonth = form.find('#birthdayMonth').val(),
                            birthdayDay = form.find('#birthdayDay').val();

                        if (birthdayYear == undefined || birthdayYear == '' || birthdayMonth == '' || birthdayDay == '') {
                            //어드민에서 생일 항목을 노출하지않고 사용자화면에서 저장했을때
                            if (this.model && this.model.get('birthday') != "" && !(birthdayYear == '' && birthdayMonth == '' && birthdayDay == '')) {
                                model['birthday'] = this.model.get('birthday');
                                model['lunarCal'] = this.model.get('lunarCal');
                            } else {
                                model['birthday'] = '';
                                model['lunarCal'] = false;
                            }
                        } else {
                            var birthdayStr = birthdayYear + "-" + birthdayMonth + "-" + birthdayDay;
                            model['birthday'] = App.util.toISO8601(App.util.toMoment(birthdayStr).add(1, 'hours'));
                            model['lunarCal'] = $('#lunarCal').is(':checked');
                        }

                        model["deptMembers"] = [];
                        $.each($("#dept_list li"), function () {
                            model["deptMembers"].push({
                                id: $(this).attr("data-id")
                            })
                        });

                        //TODO
                        //App.util.toISO8601(v.value);
                        return model;
                    },
                    initFileUpload: function () {
                        var self = this,
                            options = {
                                el: "#swfupload-control",
                                context_root: GO.contextRoot,
                                button_text: "<span class='buttonText'>" + this.type['imageUpload'] + "</span>",
                                button_style: "color:#ffffff; font-size:12px; text-align:center;",
                                button_height: 33,
                                button_width: 100,
                                progressBarUse: false,
                                url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie')
                            };

                        (new FileUpload(options))
                            .queue(function (e, data) {

                            })
                            .start(function (e, data) {
                                console.log("uploadStart");
                                console.log(data);
                                var reExt = new RegExp("(jpeg|jpg|gif|png|bmp)", "gi"),
                                    fileExt = data.type;

                                if (!reExt.test(fileExt)) {
                                    $.goMessage(commonLang["포멧 경고"]);
                                    return false;
                                }

                                if (data.size > 5 * 1024 * 1024) {
                                    $.goMessage(commonLang["첨부파일 용량은 5MB이하 입니다."]);
                                    return false;
                                }
                            })
                            .progress(function (e, data) {

                            })
                            .success(function (e, serverData, fileItemEl) {
                                if (GO.util.fileUploadErrorCheck(serverData)) {
                                    $.goAlert(GO.util.serverMessage(serverData));
                                    return false;
                                } else {
                                    if (GO.util.isFileSizeZero(serverData)) {
                                        $.goAlert(GO.util.serverMessage(serverData));
                                        return false;
                                    }
                                }

                                var data = serverData.data,
                                    fileName = data.fileName,
                                    filePath = data.filePath,
                                    hostId = data.hostId,
                                    thumbnail = data.thumbnail;
                                console.log("fileName :: " + fileName);
                                $("#thumbnail_image")
                                    .attr("src", thumbnail)
                                    .attr("data-filepath", filePath)
                                    .attr("data-filename", fileName)
                                    .attr("host-id", hostId);
                            })
                            .complete(function (e, data) {
                                console.info(data);
                            })
                            .error(function (e, data) {
                                console.info(data);
                            });
                    },
                    datePickerInit: function () {
                        var birthdayDate = $("#birthday");
                        var anniversaryDate = $("#anniversary");

                        $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
                        birthdayDate.datepicker({
                            defaultDate: "+1w",
                            dateFormat: "yy-mm-dd",
                            changeMonth: true,
                            changeYear: true,
                            yearSuffix: "",
                            yearRange: 'c-80:c+10'
                        });
                        anniversaryDate.datepicker({
                            defaultDate: "+1w",
                            dateFormat: "yy-mm-dd",
                            changeMonth: true,
                            changeYear: true,
                            yearSuffix: "",
                            yearRange: 'c-80:c+10'
                        });
                    },
                    customFieldRender: function (model) {
                        $.ajax({
                            url: GO.contextRoot + "api/customprofile/display/config",
                            type: 'GET',
                            success: function (response) {

                                var tmpl = "";
                                $.each(response.data, function (i, item) {
                                    var profileValue = model.get(item.profileName) == undefined ? '' : model.get(item.profileName);
                                    tmpl += '<tr>' +
                                        '<th><span class="title">' + item.name + '</span></th>' +
                                        '<td>' +
                                        profileValue +
                                        '</td>' +
                                        '</tr>';
                                });

                                $('#profileForm tr:nth-last-child(2)').after(tmpl);
                            }
                        });
                    },

                    isNumbericCheck: function (target) {
                        if (!target || target.length == 0) {
                            return;
                        }

                        var value = target.value;

                        if (!value || value.length == 0) {
                            return;
                        }

                        if ($.goValidation.isPhoneType(value)) {
                            return;
                        }

                        $(target).focus();
                        throw Error("onlyNumber", "");
                    },
                    getNumbericNames: function () {
                        //대표전화, 직통전화, 휴대전화, 팩스, 생일, 기념일
                        var checkNames = ["repTel", "directTel", "mobileNo", "fax", "birthday", "anniversary"];
                        return checkNames;
                    }
                });

            return {
                render: function () {
                    var userProfile = new UserProfile();
                    return userProfile.render();
                }
            };

        });

}).call(this);
