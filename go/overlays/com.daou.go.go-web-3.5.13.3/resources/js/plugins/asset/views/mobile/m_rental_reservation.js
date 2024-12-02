;(function () {
    define([
            "jquery",
            "underscore",
            "backbone",
            "when",
            "app",
            "i18n!nls/commons",
            "i18n!asset/nls/asset",

            "hgn!asset/templates/mobile/m_rental_reservation",
            "views/mobile/header_toolbar",
            "calendar/helpers/datepicker",

            "asset/collections/asset_admin",
            "asset/models/asset_user_create",
            "asset/models/asset_manage",
            "asset/models/asset_admin",

            "jquery.ui",
            "jquery.go-sdk"
        ],
        function (
            $,
            _,
            Backbone,
            when,
            GO,
            commonLang,
            assetLang,
            renderTemplate,
            HeaderToolbarView,
            DatepickerHelper,
            AssetReserveAttributes,
            AssetItemCreateModel,
            AssetManagableModel,
            AssetModel
        ) {

            var lang = {
                'rent_date': assetLang['대여일'],
                'rent_user': assetLang['대여자'],
                'reservation_date': assetLang['예약일'],
                'reservation_user': assetLang['예약자'],
                'rent_change': assetLang['변경'],
                'return_list': assetLang['목록으로 돌아가기'],
                'reservation_cancel': assetLang['예약 취소하기'],
                'asset_return': assetLang['반납하기'],
                'confirm': commonLang['확인'],
                'cancel': commonLang['취소'],
                'modify': commonLang['수정완료'],
                'no_reservation': assetLang['지난 시간은 예약할 수 없습니다.'],
                'alert_no_reservation': assetLang['예약하려는 시간대에 이미 예약된 건이 포함되어있습니다.'],
                'alert_input': assetLang['필수등록정보를 입력하세요.'],
                'start': assetLang['시작'],
                'end': assetLang['종료'],
                'write_alert': assetLang['을 작성해 주세요.'],
                'time_alert' : assetLang['예약할 수 없는 시간입니다.'],
                'day_alert': assetLang['예약할 수 없는 요일입니다.'],
                'allday': assetLang['종일'],
                'reserve_anonym': assetLang['익명예약'],
                'use_anonym': commonLang['사용']
            };

            var AssetCreate = Backbone.View.extend({

                initialize: function (options) {
                    var opt = options || {};

                    this.assetId = opt.assetId;
                    this.itemId = opt.itemId;
                    this.type = opt.type;		// 예약(reservation), 대여(rental)
                    this.status = opt.status; 	// 추가,현황
                    this.reservationId = opt.reservationId;

                    this.selectDate = opt.selectDate;
                    this.startTime = opt.startTime;
                    this.endTime = opt.endTime;
                    this.assetModel = new AssetModel();
                    this.assetCreateModel = new AssetItemCreateModel();

                    this.assetManagableModel = new AssetManagableModel();
                    this.isManagable = false;

                    this.reqType = opt.reqType;	// 자산예약(reservation), 캘린더(calendar)
                    this.isCreate = this.type == "create";

                    this.headerToolbarView = HeaderToolbarView;
                    this.param = opt.queryString || "empty";
                    GO.EventEmitter.off('trigger-action');
                    GO.EventEmitter.on('trigger-action', 'asset-save', this.save, this);
                    GO.EventEmitter.on('trigger-action', 'asset-modify', this.modify, this);
                    GO.EventEmitter.on('trigger-action', 'asset-cancel', this.cancel, this);
                },

                events: {
                    "change #startDate": "disableSelectTime",
                    "change #endDate": "disableSelectTime",
                    "change #startTime": "disableSelectTime",
                    "change #endTime": "disableSelectTime",
                    "keyup textarea": "_expandTextarea",
                    //"vclick #cancel" : "cancel",
                    //"vclick #modify" : "modify",
                    "change #allday": "toggleCheck"
                },

                render: function () {
                    var _this = this;

                    return when.promise(_.bind(function (resolve, reject) {
                        this._loadAssetModel()
                            .then(_.bind(this._loadManagableModel, this))
                            .then(_.bind(this._loadAssetCreateModel, this))
                            .then(_.bind(function () {

                                this.renderTitleToolBar();
                                $('#btnHeaderSearch').show().attr('data-assetid', this.assetId);

                                var itemCol = AssetReserveAttributes.getCollection({
                                    assetId: this.assetId,
                                    type: 'reservation'
                                }); //자산 attribute 호출(이용목적등)
                                itemCol.on("reset", _.bind(function (collection) {
                                    var tmpl = _this.makeTemplete({
                                        collection: collection.toJSON(),
                                        type: _this.type,
                                        status: _this.status,
                                        isCreate: _this.type == "create"
                                    });
                                    _this.$el.html(tmpl);
                                    _this.setData();
                                    if (_this.type == "reservation") {
                                        _this.disableSelectTime();
                                    }

                                    resolve();
                                }, this));
                            }, this))
                            .otherwise(reject);
                    }, this));
                },

                _loadAssetModel: function () {
                    return when.promise(_.bind(function (resolve, reject) {
                        this.assetModel.clear();
                        this.assetModel.set({assetId: this.assetId}, {silent: true});
                        this.assetModel.fetch({
                            success: resolve,
                            error: reject
                        });
                    }, this));
                },

                _loadManagableModel: function () {
                    return when.promise(_.bind(function (resolve, reject) {
                        this.assetManagableModel.clear();
                        this.assetManagableModel.set({assetId: this.assetId}, {silent: true});
                        this.assetManagableModel.fetch({
                            success: _.bind(function (model) {
                                // 기존 코드 호환성 유지
                                this.isManagable = model.get('managable');
                                resolve(model);
                            }, this),
                            error: reject
                        });

                    }, this));
                },

                _loadAssetCreateModel: function () {
                    return when.promise(_.bind(function (resolve, reject) {
                        var data = {assetId: this.assetId, itemId: this.itemId};
                        this.assetCreateModel.clear();

                        if (this.status == "create") {
                            data.type = 'title';
                        } else {
                            if (this.reservationId) {
                                data.type = 'reservationStatus';
                                data.reservationId = this.reservationId;
                            } else {
                                data.type = 'current';
                            }
                        }

                        this.assetCreateModel.set(data, {silent: true});
                        this.assetCreateModel.fetch({
                            success: resolve,
                            error: reject
                        });
                    }, this));
                },

                renderTitleToolBar: function () {
                    var _this = this;
                    /*var opt = {
                        isPrev : true,
                        isIscroll : false,
                        name : this.assetCreateModel.get('itemName'),
                    };

                    if(this.status == "create"){
                        opt.isLeftCancelBtn = { text : commonLang['취소'] };
                        opt.rightButton = {
                            text : commonLang['확인'],
                            callback : function(e) {
                                _this.reservCreate(e);
                            }
                        };
                    }

                    this.titleToolbarView.render(opt);*/
                    var toolBarData = {
                        title: this.assetCreateModel.attributes.itemName,
                        isClose: true
                    };

                    if (this.hasToolBarAuth()) {
                        toolBarData.actionMenu = [
                            {
                                id: 'asset-modify',
                                text: commonLang['확인'],
                                triggerFunc: 'asset-modify'
                            },
                            {
                                id: 'asset-cancel',
                                text: commonLang['취소'],
                                triggerFunc: 'asset-cancel'
                            }
                        ];
                    }

                    if (this.status === "create") {
                        toolBarData = {
                            isClose: true,
                            title: this.assetCreateModel.get('name'),
                            actionMenu: [{
                                id: "contactSave",
                                text: commonLang['확인'],
                                triggerFunc: 'asset-save'
                            }]
                        };
                    }
                    this.headerToolbarView.render(toolBarData);
                },
                hasToolBarAuth: function () {
                    return !this.assetCreateModel.has("reservationId") || this.assetCreateModel.get('user').id === GO.session('id') || !!this.isManagable;
                },

                modify: function (e) {
                    if (this._isRecurrence()) {
                        this.reservationUpdateAction();
                    } else {
                        this.reservCreate(e);
                    }
                },

                save: function(){
                    this.preventSameAction();
                    this.reservCreate();
                },

                preventSameAction: function(){
                    $("a[data-trigger=asset-save]").on('vclick', false);
                },

                cancel: function () {
                    if (this.type == "rental") {
                        if (confirm(assetLang['이용을 반납하시겠습니까?'])) {
                            this.rentalCancelAction();
                        }
                    } else {
                        if (confirm(assetLang['예약을 취소하시겠습니까?'])) {
                            this.reservationDeleteAction();
                        }
                    }
                },

                _expandTextarea: function (e) {
                    GO.util.textAreaExpand(e);
                },

                setStartTime: function () {
                    var checkDisabled = $('#startTime option[value="' + $('#startTime').val() + '"]').attr('disabled');
                    if (checkDisabled == "disabled") {
                        var startTime = this.assetModel.get('availabilityDate').startTime.substr(0, 2) + ":" + this.assetModel.get('availabilityDate').startTime.substr(2, 2);
                        var endTime = GO.util.formatDatetime(GO.util.calDate($('#startDate').val() + "T" + startTime, 'hours', 1), null, "HH:mm");
                        $('#startTime').val(startTime);
                        $('#startTime').attr("data-prev", startTime);
                        $('#endTime').val(endTime);
                        $('#endTime').attr("data-prev", endTime);
                        $('#startTime').trigger('change');
                    }
                },
                disableSelectTime: function () {
                    var _this = this;

                    this.ableDays = this.assetModel.get('availabilityDate').ableDays.split('');

                    var startTimeCon = this.assetModel.get('availabilityDate').startTime.substr(0, 2) + ":" + this.assetModel.get('availabilityDate').startTime.substr(2, 2);
                    var endTimeCon = this.assetModel.get('availabilityDate').endTime.substr(0, 2) + ":" + this.assetModel.get('availabilityDate').endTime.substr(2, 2);
                    var plusDay = GO.util.formatDatetime(GO.util.now(), null, "YYYY-MM-DD");

                    this.disableTimeArray = [];
                    for (var i = 0; i < 48; i++) {

                        if (GO.util.formatDatetime(plusDay, null, "HH:mm") == startTimeCon) {
                            break;
                        }
                        this.disableTimeArray.push(GO.util.formatDatetime(plusDay, null, "HH:mm"));
                        plusDay = GO.util.calDate(plusDay, 'minutes', 30);
                    }

                    var plusDay2 = GO.util.formatDatetime(GO.util.now(), null, "YYYY-MM-DD");
                    this.disableTimeArray2 = [];
                    for (var k = 0; k < 48; k++) {
                        plusDay2 = GO.util.calDate(plusDay2, 'minutes', -30);
                        if (GO.util.formatDatetime(plusDay2, null, "HH:mm") == endTimeCon || endTimeCon == "24:00") {
                            break;
                        }
                        this.disableTimeArray2.push(GO.util.formatDatetime(plusDay2, null, "HH:mm"));
                    }

                    setTimeout(function () {
                        $.each(_this.disableTimeArray, function (k, v) {
                            $('#startTime option[value="' + v + '"]').attr('disabled', true);
                        });

                        $.each(_this.disableTimeArray2, function (k, v) {
                            $('#startTime option[value="' + v + '"]').attr('disabled', true);
                        });

                        $.each(_this.disableTimeArray, function (k, v) {
                            $('#endTime option[value="' + v + '"]').attr('disabled', true);
                        });

                        $.each(_this.disableTimeArray2, function (k, v) {
                            $('#endTime option[value="' + v + '"]').attr('disabled', true);
                        });

                        _this.setStartTime();

                    }, 500);


                },

                setData: function () {
                    var respFunc = function () {
                    };
                    if (this.status == "create") {
                        respFunc = this._setDataForCreate;
                    } else {
                        respFunc = this._setDataForModify;
                    }
                    respFunc.call(this);
                },

                _setDataForCreate: function () {
                    $('#userName').text(GO.session('name') + " " + GO.session('position'));
                    $('#userId').attr('data-userid', GO.session('id'));
                    $('#titleToolbar h2').text(this.assetCreateModel.get('name'));
                    if (this.type == "rental") {
                        $('#date').text(GO.util.basicDate3(new Date()));
                    } else {
                        if (this.startTime) {
                            var startDate = GO.util.formatDatetime(this.startTime, null, "YYYY-MM-DD");
                            var endDate = GO.util.formatDatetime(this.endTime, null, "YYYY-MM-DD");
                            var startTime = GO.util.formatDatetime(this.startTime, null, "HH:mm");
                            var endTime = GO.util.formatDatetime(this.endTime, null, "HH:mm");

                            $('#startDate').val(startDate).attr("disabled", "disabled");
                            $('#endDate').val(endDate).attr("disabled", "disabled");
                            $('#startTime').html('<option value="' + startTime + '">' + startTime + '</option>').attr("disabled", "disabled");
                            $('#endTime').html('<option value="' + endTime + '">' + endTime + '</option>').attr("disabled", "disabled");
                            var assetData = GO.util.store.get(this.param);
                            if (assetData.allday) {
                                $('#allday').attr('checked', 'checked');
                                $('#startTime').hide();
                                $('#endTime').hide();
                            }
                        } else {
                            this.datepickerHelper = new DatepickerHelper(
                                this.$el.find("#startDate"),
                                this.$el.find("select[name=start_time]"),
                                this.$el.find("#endDate"),
                                this.$el.find("select[name=end_time]"),
                                'detail'
                            );
                            this.datepickerHelper.updateSelectedTime(new Date());
                            $('#startDate').val(this.selectDate);
                            $('#endDate').val(this.selectDate);
                            $('#startDate').attr('data-prev', this.selectDate);
                            $('#endDate').attr('data-prev', this.selectDate);
                        }
                    }
                },

                _setDataForModify: function () {
                    $('#userName').text(this.assetCreateModel.get('user').name + " " + this.assetCreateModel.get('user').positionName);
                    $('#titleToolbar h2').text(this.assetCreateModel.get('itemName'));
                    $.each(this.assetCreateModel.get('properties'), function (k, v) {
                        $('tr[data-id="' + v.attributeId + '"]').find('textarea').text(v.content);
                    });

                    if (!this._isEditable()) {
                        $('#titleToolbar div.optional').hide();
                        $('#tool_bar').hide();
                    }

                    if (this.type == "rental") {
                        $('#date').text(GO.util.basicDate3(this.assetCreateModel.get('createdAt')));
                    } else {
                        var sDate = GO.util.formatDatetime(this.assetCreateModel.get('groupStartTime') != undefined ? this.assetCreateModel.get('groupStartTime') : this.assetCreateModel.get('startTime'), null, "YYYY-MM-DD");
                        var eDate = GO.util.formatDatetime(this.assetCreateModel.get('groupEndTime') != undefined ? this.assetCreateModel.get('groupEndTime') : this.assetCreateModel.get('endTime'), null, "YYYY-MM-DD");
                        var sTime = GO.util.formatDatetime(this.assetCreateModel.get('groupStartTime') != undefined ? this.assetCreateModel.get('groupStartTime') : this.assetCreateModel.get('startTime'), null, "HH:mm");
                        var eTime = GO.util.formatDatetime(this.assetCreateModel.get('groupEndTime') != undefined ? this.assetCreateModel.get('groupEndTime') : this.assetCreateModel.get('endTime'), null, "HH:mm");

                        this.datepickerHelper = new DatepickerHelper(
                            this.$el.find("#startDate"),
                            this.$el.find("select[name=start_time]"),
                            this.$el.find("#endDate"),
                            this.$el.find("select[name=end_time]"),
                            'detail'
                        );
                        var time = this.isCreate ? new Date() : GO.util.toMoment(this.assetCreateModel.get("startTime"));

                        $('#startDate').val(sDate);
                        $('#startTime').val(sTime);
                        $('#endDate').val(eDate);
                        $('#endTime').val(eTime);
                        $('#startDate').attr('data-prev', sDate);
                        $('#endDate').attr('data-prev', eDate);

                        this.dateForBack = sDate;

                        if (this.assetCreateModel.get('allday')) {
                            $('#allday').attr('checked', 'checked');
                            $('#startTime').hide();
                            $('#endTime').hide();
                        }
                    }
                },

                getStartTime : function (isCreate) {
                    if(isCreate) {
                        return new Date();
                    } else if (!_.isUndefined(this.assetCreateModel.get("groupStartTime"))) {
                        return this.assetCreateModel.get("groupStartTime");
                    } else if (!_.isUndefined(this.assetCreateModel.get("startTime"))){
                        return this.assetCreateModel.get("startTime");
                    }
                },

                getEndTime : function(isCreate) {
                    if(isCreate) {
                        return new Date();
                    } else if (!_.isUndefined(this.assetCreateModel.get("groupEndTime"))) {
                        return this.assetCreateModel.get("groupEndTime");
                    } else if (!_.isUndefined(this.assetCreateModel.get("endTime"))){
                        return this.assetCreateModel.get("endTime");
                    }
                },

                makeTemplete: function (opt) {
                    var isCreate = (opt.status == "create") ? true : false;
                    var startTime = this.getStartTime(isCreate);
                    var endTime = this.getEndTime(isCreate);
                    var intervalStartTime = GO.util.toMoment(startTime);
                    var intervalEndTime = GO.util.toMoment(endTime);
                    var prevStartDate = intervalStartTime.format("YYYY-MM-DD");
                    var prevStartTime = intervalStartTime.format("HH:mm");
                    var prevEndDate = intervalEndTime.format("YYYY-MM-DD");
                    var prevEndTime = intervalEndTime.format("HH:mm");

                    var isManagable = !!this.isManagable;
                    var isEditable = this._isEditable();
                    var isAllowAnonym = !!this.assetModel.get('allowAnonym');
                    var isAlwaysAnonym = !!this.assetModel.get('alwaysAnonym');
                    var useAnonym = !!this.assetCreateModel.get('useAnonym');
                    var isRecurrence = this.assetCreateModel.get('recurrence');

                    var isShowUserRow = true;
                    var isShowAnonymRow = false;

                    if (this.status == 'create') {
                        useAnonym = isAllowAnonym && isAlwaysAnonym;
                        isShowAnonymRow = isAllowAnonym;
                    } else {
                        isAllowAnonym = isAllowAnonym && isEditable;
                        isShowUserRow = isEditable || !useAnonym;
                        isShowAnonymRow = isEditable && isAllowAnonym;
                        useAnonym = isAllowAnonym && useAnonym;
                    }

                    var attributeInfo = function () {
                        return GO.i18n(assetLang['을 작성해 주세요.'], {'arg1': this.name});
                    };

                    this.dateForBack = prevStartDate;
                    var tpl = renderTemplate({
                        dataset: opt.collection,
                        lang: lang,
                        isCreate: isCreate,
                        isRental: opt.type == "rental" ? true : false,
                        hasToolbarAuth: !this.assetCreateModel.has("reservationId") || this.assetCreateModel.get('user').id === GO.session('id') || isManagable,
                        prevStartDate: prevStartDate,
                        prevStartTime: prevStartTime,
                        prevEndDate: prevEndDate,
                        prevEndTime: prevEndTime,
                        attributeInfo: attributeInfo,
                        useAnonym: useAnonym,
                        isManagable: isManagable,
                        isEditable: isEditable,
                        isAllowAnonym: isAllowAnonym,
                        isAlwaysAnonym: isAlwaysAnonym,
                        isShowUserRow: isShowUserRow,
                        isShowAnonymRow: isShowAnonymRow,
                        isRecurrence: isRecurrence
                    });

                    return tpl;
                },

                _isEditable: function () {
                    var editable = false;

                    if (this.status === 'create') {
                        return true;
                    }

                    if (this.assetCreateModel && this.assetCreateModel.get('user')) {
                        editable = (this.assetCreateModel.get('user').id == GO.session('id') || this.isManagable);
                    }

                    return editable;
                },

                returnList: function () {
                    if (this.type == "reservation") {
                        var assetName = $('#titleToolbar h2').text();
                        var selectDate = this.dateForBack;
                        GO.router.navigate('asset/monthly/' + this.assetId + '/' + this.itemId + '/' + assetName + '/' + selectDate, true);
                    } else {
                        GO.router.navigate('asset/' + this.assetId + '/list/' + this.type, true);
                    }
                },
                getData: function () {
                    var data = {};

                    if (this.type == "reservation") {
                        var beforeSTime = $("#startTime").val();
                        var beforeETime = $("#endTime").val();

                        if ($('#allday').is(':checked')) {
                            var startTime = this.assetModel.attributes.availabilityDate.startTime;
                            var endTime = this.assetModel.attributes.availabilityDate.endTime;
                            if (endTime == "2400") {
                                endTime = "2359";
                            }
                            var assetStartTime = startTime.substring(0, 2) + ":" + startTime.substring(2, 4);
                            var assetEndTime = endTime.substring(0, 2) + ":" + endTime.substring(2, 4);
                            if ($("#startTime").find("option[value='" + assetStartTime + "']").size() > 0) {
                                $("#startTime").val(assetStartTime);
                            } else {
                                $("#startTime").append('<option value="' + assetStartTime + '">' + assetStartTime + '</option>').val(assetStartTime);
                            }

                            if ($("#endTime").find("option[value='" + assetEndTime + "']").size() > 0) {
                                $("#endTime").val(assetEndTime);
                            } else {
                                $("#endTime").append('<option value="' + assetEndTime + '">' + assetEndTime + '</option>').val(assetEndTime);
                            }
                        }

                        var sTime = $("#startTime").val();
                        var eTime = $("#endTime").val();

                        if (!sTime || !eTime) {
                            data.alertMessage = lang.time_alert;
                            return data;
                        }

                        var startTime = GO.util.toISO8601(GO.util.toMoment($("#startDate").val() + " " + sTime, "YYYY-MM-DD HH:mm"));
                        var endTime = GO.util.toISO8601(GO.util.toMoment($("#endDate").val() + " " + eTime, "YYYY-MM-DD HH:mm"));

                        data.startTime = startTime;
                        data.endTime = endTime;
                        data.allday = $('#allday').is(':checked');

                        if (moment(startTime).isBefore(moment().startOf('day'))) {
                            $("#startTime").val(beforeSTime);
                            $("#endTime").val(beforeETime);
                            data.alertMessage = lang.no_reservation;
                            return data;
                        }

                    }

                    data.useAnonym = $('#useAnonym').is(':checked');

                    var properties = [];
                    var targetTr = $('tr[data-type="attribute"]');
                    targetTr.each(function () {
                        var attr = {};
                        attr.attributeId = $(this).attr('data-id');
                        attr.content = $(this).find('textarea').val();
                        properties.push(attr);
                    });
                    data.properties = properties;
                    return data;
                },
                reservationUpdateAction: function () {
                    var self = this;
                    var url = GO.contextRoot + "api/asset/item/loop/reservation?" + $.param({
                        reservationId: this.assetCreateModel.attributes.reservationId,
                        recurChange: 'instance'
                    });

                    $.ajax(url, {
                        type: 'PUT',
                        data: JSON.stringify(self.getData()),
                        dataType: 'json',
                        contentType: "application/json",
                        success: function () {
                            GO.router.navigate('asset/' + self.assetCreateModel.attributes.assetId + '/list/reservation' , true);
                        },
                        error: function () {
                            $.goError(assetLang["예약하려는 시간대에 이미 예약된 건이 포함되어있습니다."]);
                        }
                    });
                },
                reservCreate: function () {
                    var _this = this;
                    var data = this.getData();

                    var properties = data.properties;
                    function cancelSaveAction(msg){
                        alert(msg);
                        enableSaveBtn();
                        return false;
                    }
                    function enableSaveBtn(){
                        $("a[data-trigger=asset-save]").off('vclick', false);
                    }

                    if (this.type == "reservation") {
                        var timeValidate = false;

                        if (this.ableDays[GO.util.toMoment($("#startDate").val()).day()] == 0) {
                            GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
                            return cancelSaveAction(lang.day_alert);
                        }

                        $.each(this.disableTimeArray, function (k, v) {
                            if ($("#startTime").val() == v) {
                                timeValidate = true;
                            }
                        });
                        $.each(this.disableTimeArray2, function (k, v) {
                            if ($("#endTime").val() == v) {
                                timeValidate = true;
                            }
                        });
                    }

                    if (data.alertMessage) {
                        GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
                        return cancelSaveAction(data.alertMessage);
                    }

                    var checkVal = false;
                    $.each(this.$('tr[data-type="attribute"]'), function (index) {
                        if ($.trim($(this).find('textarea').val()) == '') {
                            checkVal = true;
                            return false;
                        }
                    });

                    if (checkVal) {
                        return cancelSaveAction(lang.alert_input);
                    }

                    if (this.reservationId) {
                        // 같은 모델의 인스턴스를 계속해서 중복 생성,
                        // rest API 를 지원 하지 않는 등
                        // 모델이 제 기능을 하지 못하고 모델의 url 구조가 복잡하여 ajax 로 대체함.
                        $.ajax({
                            url: GO.contextRoot + "api/asset/" + this.assetCreateModel.get("assetId") + "/item/" + this.assetCreateModel.get("itemId") + "/reserve/" + this.assetCreateModel.id,
                            data: JSON.stringify(data),
                            type: "PUT",
                            dataType: "json",
                            contentType: "application/json;",
                            success: function () {
                                GO.router.navigate("asset", true);
                            },
                            error: function () {
                                enableSaveBtn();
                                console.log("error");
                            }
                        });

                    } else {
                        var assetReservModel = new AssetItemCreateModel({
                            assetId: this.assetId,
                            reservationId: '',
                            itemId: this.itemId,
                            type: 'reserve'
                        });

                        // TODO - GO-15500 : 자산 예약 시점을 캘린더 일정 등록 시점으로 이동
                        if (this.reqType == 'c') {
                            if (GO.util.toISO8601(_this.startTime)) {
                                var assetData = GO.util.store.get(this.param);
                                var startTime = $("#startTime").val();
                                var endTime = $("#endTime").val();

                                var assetStartTime = startTime.substring(0, 2) + ":" + startTime.substring(2, 4);
                                var assetEndTime = endTime.substring(0, 2) + ":" + endTime.substring(2, 4);
                                assetData.asset.push({
                                    assetId: _this.assetId,
                                    assetName: $('#appTitle').text(),
                                    reservationId: '',
                                    itemId: _this.itemId,
                                    assetStartTime: assetStartTime,
                                    assetEndTime: assetEndTime,
                                    properties: properties
                                });
                                assetData.allday = $('#allday').is(':checked');

                                GO.util.store.set(this.param, assetData);

                                var url = ['calendar', 'asset', 'write', GO.util.toISO8601(_this.startTime), GO.util.toISO8601(_this.endTime), this.param];
                                GO.router.navigate(url.join('/'), true);
                            } else {
                                _this.returnList();
                            }
                        } else {
                            assetReservModel.save(data, {
                                success: function (model, response) {
                                    if (_this.startTime) {
                                        var assetData = GO.util.store.get(this.param);

                                        assetData.asset.push({
                                            assetId: _this.assetId,
                                            assetName: $('#titleToolbar h2').text(),
                                            reservationId: '',
                                            itemId: _this.itemId
                                        });

                                        GO.util.store.set(this.param, assetData);

                                        var url = ['calendar', 'asset', 'write', GO.util.toISO8601(_this.startTime), GO.util.toISO8601(_this.endTime), this.param];
                                        GO.router.navigate(url.join('/'), true);
                                    } else {
                                        _this.returnList();
                                    }
                                },
                                error: function (model, response) {
                                    enableSaveBtn();
                                    alert(lang.alert_no_reservation);
                                }
                            });
                        }
                    }
                },
                rentalCancelAction: function () {
                    var _this = this;
                    var data = {};
                    data.id = this.assetId;

                    var assetReservModel = new AssetItemCreateModel({
                        assetId: this.assetId,
                        itemId: this.itemId,
                        type: 'return'
                    });

                    assetReservModel.save(data, {
                        success: function (model, response) {
                            _this.returnList();
                        }
                    });
                },
                updateItem: function () {
                    var _this = this;
                    var data = this.getData();
                    data.id = this.assetId;

                    var assetReservModel = new AssetItemCreateModel({
                        assetId: this.assetId,
                        itemId: this.itemId
                    });

                    assetReservModel.save(data, {
                        success: function (model, response) {
                            GO.router.navigate('asset/' + _this.assetId + '/admin/manage', true);
                        }
                    });
                },
                reservationDeleteAction: function () {
                    var _this = this;
                    if (this._isRecurrence()) {
                        var url = GO.contextRoot + "api/asset/item/loop/reservation?" + $.param({
                            reservationId: this.assetCreateModel.attributes.reservationId,
                            recurChange: $(this.popupEl).find("input[name=remove_option]:checked").val()
                        });

                        $.ajax(url, {
                            type: 'DELETE',
                            success: function () {
                                GO.router.navigate('asset/' + _this.assetCreateModel.attributes.assetId + '/list/reservation' , true);
                            }
                        });
                    }


                    var url = GO.contextRoot + "api/asset/item/reservation";
                    var ids = [];
                    ids.push(this.reservationId);

                    $.ajax(url, {
                        type: 'DELETE',
                        dataType: 'json',
                        contentType: "application/json",
                        data: JSON.stringify({'ids': ids}),
                        success: function () {
                            _this.returnList();
                        }
                    });
                },

                _isRecurrence: function() {
                    var exclude = this.assetCreateModel.get('exclude');
                    var isRecurrence = this.assetCreateModel.get('recurrence');
                    return !_.isEmpty(isRecurrence) && !exclude;
                },

                toggleCheck: function (e) {
                    // 주의: vclick은 실제로 체크되기 전에 이 함수가 작동한다.(triggerHandler가 작동하는 듯)
                    // 따라서 PC와 반대로 처리해야 함
                    if ($(e.currentTarget).is(':checked')) {
                        $("#startTime").hide();
                        $("#endTime").hide();
                    } else {
                        $("#startTime").show();
                        $("#endTime").show();
                    }

                    e.stopImmediatePropagation();
                }
            });

            return AssetCreate;
        });
}).call(this);
