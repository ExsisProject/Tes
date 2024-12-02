define(function (require) {

    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var when = require('when');
    var GO = require('app');

    var RecurrenceParser = require("calendar/libs/recurrence_parser");
    var AssetManagableModel = require('asset/models/asset_manage');
    var AssetModel = require('asset/models/asset_admin');
    var AssetItemCreateModel = require('asset/models/asset_user_create');
    var AssetReserveAttributes = require('asset/collections/asset_admin');
    var AssetReservCalendarModel = require('asset/models/asset_reserv_calendar');
    var GOCalendar = require('go-calendar');
    var RecurrenceLayerHelper = require("calendar/helpers/recurrence_layer");
    var LoopEvent = require("asset/views/loop_event");
    var renderTemplate = require('hgn!asset/templates/rental_reserv_create');
    var AssetItemModel = require("asset/models/asset_item");

    var commonLang = require('i18n!nls/commons');
    var calLang = require('i18n!calendar/nls/calendar');
    var assetLang = require('i18n!asset/nls/asset');

    require('jquery.ui');
    require('jquery.go-orgslide');

    var lang = {
        'rent_date': assetLang['대여일'],
        'rent_user': assetLang['대여자'],
        'reserv_date': assetLang['예약일'],
        'reserv_user': assetLang['예약자'],
        'rent_change': assetLang['변경'],
        'return_list': assetLang['목록으로 돌아가기'],
        'reservation_cancel': assetLang['예약 취소하기'],
        'asset_return': assetLang['반납하기'],
        'confirm': commonLang['확인'],
        'cancel': commonLang['취소'],
        'modify': commonLang['수정'],
        'alert_input': assetLang['필수등록정보를 입력하세요.'],
        'no_reservation': assetLang['지난 시간은 예약할 수 없습니다.'],
        'alert_no_reservation': commonLang['예약할 수 없습니다.'],
        'alert_no_oneday': commonLang['예약은 하루만 가능합니다.'],
        'reservation_modify': assetLang['예약 수정하기'],
        'allday': assetLang['종일'],
        'alert_duplicate_reservation': assetLang['예약하려는 시간대에 이미 예약된 건이 포함되어있습니다.'],
        'date_over': assetLang['1일을 초과하는 예약일정은 반복예약을 할 수 없습니다.'],
        'reserve_anonym': assetLang['익명예약'],
        'use_anonym': commonLang['사용'],
        '반복': calLang['반복'],
        '수정': commonLang['수정'],
        '삭제': commonLang['삭제']
    };

    var AssetReserveView = Backbone.View.extend({
        isSaving: false,

        events: {
            "focus input.w_max": "inputFocus",
            "click #reservConfirm": "reservConfirm",
            "click #reservCancel": "reservCancel",
            "click a[data-btntype='returnList']": "returnList",
            "click #rentalCancel": "rentalCancel",
            "click #reservationCancel": "reservationDelete",
            "click #btnUserOrg": "reservUser",
            "click #reserveModify": "reserveModify",
            "click #allday": "toggleCheck",
            "click #repeat": "showHideRecurrenceSetupLayer",
            "click #repeat-option-wrap .recur_delete": "removeRecurrence",
            "click #repeat-option-wrap .recur_edit": "editRecurrence"
        },

        initialize: function (options) {
            this.$el.off();
            this.options = options || {};

            this.params = GO.router.getSearch();

            this.assetId = this.options.assetId;
            this.itemId = this.options.itemId;
            this.type = this.options.type;  //예약(reservation),대여(rental)
            this.status = this.options.status; // 추가,현황
            this.reservationId = this.options.reservationId;

            this.selectDate = this.options.selectDate;
            this.selectTime = this.options.selectTime;
            this.endTime = this.options.endTime;

            this.assetModel = new AssetModel();
            this.assetCreateModel = new AssetItemCreateModel();
            this.assetItemModel = new AssetItemModel();

            this.assetManagableModel = new AssetManagableModel();
            this.isManagable = false;
            this.isPopup = this.options.isPopup;
            this.isRecurrence = false;
            this.hasUnreservedDate = false;
        },

        render: function () {
            return when.promise(_.bind(function (resolve, reject) {
                this._loadAssetModel()
                    .then(_.bind(this._loadManagableModel, this))
                    .then(_.bind(this._loadReserveCalendarModel, this))
                    .then(_.bind(this._loadAssetCreateModel, this))
                    .then(_.bind(this._loadAssetItemModel, this))
                    .then(_.bind(function () {
                        var itemCol = AssetReserveAttributes.getCollection({
                            assetId: this.assetId,
                            type: 'reservation'
                        });
                        itemCol.on("reset", _.bind(function (collection) {
                            var tmpl = this.makeTemplete({
                                collection: collection.toJSON(),
                                type: this.type,
                                status: this.status,
                                useAnonym: this.params['useAnonym'],
                                allDay: this.params['allDay']
                            });
                            this.$el.html(tmpl);
                            this.setData();
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

        _loadAssetItemModel: function () {
            return when.promise(_.bind(function (resolve, reject) {
                this.assetItemModel.clear();
                this.assetItemModel.set({assetId: this.assetId, itemId : this.itemId}, {silent: true});
                this.assetItemModel.fetch({
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

        _loadReserveCalendarModel: function () {
            if (this.reservationId) {
                this.useCalendar = AssetReservCalendarModel.get(this.reservationId).get('data');
            } else {
                this.useCalendar = false;
            }

            return when.resolve();
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
                	statusCode: {
    					400 : function() { GO.util.error('404', { "msgCode": "400-asset"}); }, 
    					403 : function() { GO.util.error('403', { "msgCode": "400-asset"}); }, 
    					404 : function() { GO.util.error('404', { "msgCode": "400-asset"}); }, 
    					500 : function() { GO.util.error('500', { "msgCode": "400-asset"}); }
    				},
                	success: resolve,
                    error: reject
                });
            }, this));
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
            $('#anonymRow').show();

            $('#userName').text(
                this.params['userName'] ? this.params['userName'] : (GO.session('name') + " " + GO.session('position')));
            $('#userId').attr('data-userid', this.params['userId'] ? this.params['userId'] : GO.session('id'));
            $('#name').text(this.assetCreateModel.get('name'));

            if (this.type == "rental") {
                $('#date').text(GO.util.basicDate3(GO.util.now()));
            } else {

                var selectDate = GO.util.formatDatetime(this.selectDate, null, "YYYY-MM-DD");

                $('#startDate').val(selectDate);
                $('#endDate').val(selectDate);
                $('#startDate').attr('data-prev', selectDate);
                $('#endDate').attr('data-prev', selectDate);
                $("#startTime").attr('data-prev', this.selectTime);
                $("#endTime").attr('data-prev', this.endTime);

                this.datepickerHelper = GOCalendar.init({
                    el: this.$el.find("#selectDate"),
                    startDate: selectDate,
                    startTime: this.selectTime,
                    endDate: selectDate,
                    endTime: this.endTime,
                    lang: this._makeDatePickerLang(),
                    changeEvent: $.proxy(this._dateChangeCallback, this)
                });
            }
        },

        _dateChangeCallback: function (option) {
            if ($("#repeat").is(":checked") && option.isDateDiff) {
                $('#startDate').val(option.prevStartDate);
                $('#endDate').val(option.prevEndDate);
                this.datepickerHelper.updatePrevDate(option);
                $.goMessage(lang.date_over);
                return;
            }

            return this.showHideRecurrenceSetupLayer();
        },

        _isDateDifference: function () {
            return $('#startDate').val() !== $('#endDate').val();
        },

        _setDataForModify: function () {
            var isModifyable = this._isEditable();
            if (isModifyable) {
                $('#anonymRow').show();
                $('#userName').text(this.assetCreateModel.get('user').name + " " + this.assetCreateModel.get('user').positionName);
            } else {
                if (!this.assetCreateModel.get('useAnonym')) {
                    $('#anonymRow').show();
                    $('#userName').text(this.assetCreateModel.get('user').name + " " + this.assetCreateModel.get('user').positionName);
                }
            }
            $('#name').text(this.assetCreateModel.get('itemName'));

            var recurrence = this.assetCreateModel.get('recurrence');
            if (!_.isEmpty(recurrence)) {
                this.recurrenceParser = new RecurrenceParser();
                this.recurrenceParser.parse(this.assetCreateModel.get('recurrence'));
                $("#recurrence-text").text(this.recurrenceParser.humanize());
                $("#repeat-option-wrap input[name=recurrence]").val(this.assetCreateModel.get('recurrence'));
            } else {
                $("#repeat-option-wrap").hide();
            }

            $.each(this.assetCreateModel.get('properties'), function (k, v) {
                $('tr[data-id="' + v.attributeId + '"]').find('input').val(v.content);
                if (!isModifyable) {
                    $('tr[data-id="' + v.attributeId + '"]').find('input').attr('readonly', true);
                }
            });

            if (this.type == "rental") {
                $('#date').text(GO.util.basicDate3(this.assetCreateModel.get('createdAt')));

                if (isModifyable) {
                    $('#rentalCancel').show();
                }
            } else {
                var sDate = GO.util.formatDatetime(this.assetCreateModel.get('groupStartTime') != undefined ? this.assetCreateModel.get('groupStartTime') : this.assetCreateModel.get('startTime'), null, "YYYY-MM-DD");
                var eDate = GO.util.formatDatetime(this.assetCreateModel.get('groupEndTime') != undefined ? this.assetCreateModel.get('groupEndTime') : this.assetCreateModel.get('endTime'), null, "YYYY-MM-DD");
                var sTime = GO.util.formatDatetime(this.assetCreateModel.get('groupStartTime') != undefined ? this.assetCreateModel.get('groupStartTime') : this.assetCreateModel.get('startTime'), null, "HH:mm");
                var eTime = GO.util.formatDatetime(this.assetCreateModel.get('groupEndTime') != undefined ? this.assetCreateModel.get('groupEndTime') : this.assetCreateModel.get('endTime'), null, "HH:mm");

                if (isModifyable) {
                    $('#reserveModify').show();
                    $('#reservationCancel').show();
                    $('#startDate').val(sDate);
                    $('#endDate').val(eDate);
                    $('#startTime').val(sTime).attr("selected", "selected");
                    $('#endTime').val(eTime).attr("selected", "selected");
                    $('#startDate').attr('data-prev', sDate);
                    $('#endDate').attr('data-prev', eDate);
                    $("#startTime").attr('data-prev', sTime);
                    $("#endTime").attr('data-prev', eTime);

                    this.datepickerHelper = GOCalendar.init({
                        el: this.$el.find("#selectDate"),
                        startDate: sDate,
                        startTime: sTime,
                        endDate: eDate,
                        endTime: eTime,
                        lang: this._makeDatePickerLang()
                    });

                } else {
                    $('#startDate').attr("disabled", true);
                    $('#endDate').attr("disabled", true);
                    $('#startTime').attr("disabled", true);
                    $('#endTime').attr("disabled", true);

                    $('#startDate').val(sDate);
                    $('#endDate').val(eDate);
                    $('#startTime').val(sTime);
                    $('#endTime').val(eTime);
                }

                if (this.assetCreateModel.get('allday')) {
                    $('#allday').attr('checked', 'checked');
                    $('#startTime').hide();
                    $('#endTime').hide();
                }

                if (this.assetCreateModel.get('useAnonym')) {
                    $('#useAnonym').prop('checked', true);
                }
            }
        },

        _makeDatePickerLang: function () {
            return {
                "내 캘린더": calLang["내 캘린더"],
                "일정 등록": calLang["일정 등록"],
                "일정명": calLang["일정명"],
                "일시": calLang["일시"],
                "시간": calLang["시간"],
                "종일": calLang["종일"],
                "확인": commonLang["확인"],
                "취소": commonLang["취소"],
                "일정상세 입력": calLang["일정상세 입력"],
                "기본 캘린더 이름": calLang["캘린더 기본이름"],
                "기본 캘린더 표시": calLang["기본 캘린더 표시"],
                "분": calLang["분"],
                "전사일정": calLang["전사일정"],
                "알림메일 확인": calLang["알림메일 확인"],
                "일정등록에 대한 알림메일을 보내시겠습니까?": calLang["일정등록에 대한 알림메일을 보내시겠습니까?"],
                "보내기": commonLang["보내기"],
                "보내지 않음": calLang["보내지 않음"]
            }
        },

        makeTemplete: function (opt) {
            var collection = opt.collection;
            var type = opt.type;
            var status = opt.status;
            var isRental = (type == "rental") ? true : false;
            var isCreate = (status == "create") ? true : false;
            var isModify = (status == "modify") ? true : false;

            var tpl;

            var intervalTime = GO.util.toMoment(new Date());
            var prevDate = intervalTime.format("YYYY-MM-DD");
            var prevTime = intervalTime.format("HH:00");
            var isEditable = this._isEditable();
            var isManagable = !!this.isManagable;
            var isPopup = this.isPopup;

            var isAllowAnonym = !!this.assetModel.get('allowAnonym');
            var isAlwaysAnonym = !!this.assetModel.get('alwaysAnonym');
            var useAnonym = !_.isUndefined(opt.useAnonym) ? opt.useAnonym == "true" : !!this.assetCreateModel.get('useAnonym');
            var isRecurrence = this.assetCreateModel.get('recurrence');

            var isShowUserRow = true;
            var isShowAnonymRow = false;

            if (this.status == 'create') {
                useAnonym = !_.isUndefined(useAnonym) ? useAnonym : isAllowAnonym && isAlwaysAnonym;
                isShowAnonymRow = isAllowAnonym;
            } else {
                isAllowAnonym = isAllowAnonym && isEditable;
                isShowUserRow = isEditable || !useAnonym;
                isShowAnonymRow = isEditable && isAllowAnonym;
                useAnonym = isAllowAnonym && useAnonym;
            }

            tpl = renderTemplate({
                dataset: collection,
                lang: lang,
                isCreate: isCreate,
                isModify: isModify,
                isRental: isRental,
                prevDate: prevDate,
                prevTime: prevTime,
                useAnonym: useAnonym,
                isManagable: isManagable,
                isEditable: isEditable,
                isAllowAnonym: isAllowAnonym,
                isAlwaysAnonym: isAlwaysAnonym,
                isShowUserRow: isShowUserRow,
                isShowAnonymRow: isShowAnonymRow,
                isRecurrence: isRecurrence,
                isPopup: isPopup,
                allDay: opt.allDay === "true"
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

        inputFocus: function (e) {
            $(e.currentTarget).removeClass().addClass('txt w_max enter');
        },
        inputBlur: function (e) {
            $(e.currentTarget).removeClass().addClass('txt w_max');
        },
        returnList: function () {
            if (this.type == "reservation") {
                GO.router.navigate('asset/' + this.assetId + '/item/' + this.itemId + '/weekly/reserve/' + GO.util.toISO8601(GO.util.toMoment($('#startDate').val())), true);
            } else {
                GO.router.navigate('asset/' + this.assetId + '/list/' + this.type, true);
            }
        },

        getData: function () {
            var data = {};

            if (this.type == "reservation") {

                if ($('#allday').is(':checked')) {
                    var startTime = this.assetModel.attributes.availabilityDate.startTime;
                    var endTime = this.assetModel.attributes.availabilityDate.endTime;
                    if (endTime == "2400") {
                        endTime = "2359";
                    }
                    $("#startTime").val(startTime.substring(0, 2) + ":" + startTime.substring(2, 4));
                    $("#endTime").val(endTime.substring(0, 2) + ":" + endTime.substring(2, 4));
                }

                var sTime = $("#startTime").val();
                var eTime = $("#endTime").val();
                var startTime = GO.util.toISO8601(GO.util.toMoment($("#startDate").val() + " " + sTime, "YYYY-MM-DD HH:mm"));
                var endTime = GO.util.toISO8601(GO.util.toMoment($("#endDate").val() + " " + eTime, "YYYY-MM-DD HH:mm"));
                data.recurrence = $("#repeat-option-wrap input[name=recurrence]").val();
                data.startTime = startTime;
                data.endTime = endTime;
            }

            data.useAnonym = $('#useAnonym').is(':checked');
            data.user = {id: $('#userId').attr('data-userid') == "" ? this.assetCreateModel.get('user').id : $('#userId').attr('data-userid')};

            var properties = [];
            var targetTr = $('tr[data-type="attribute"]');
            targetTr.each(function () {
                var attr = {};
                attr.attributeId = $(this).attr('data-id');
                attr.content = $(this).find('input.txt').val();
                properties.push(attr);
            });
            data.properties = properties;
            data.allday = $("#allday").is(":checked");
            return data;
        },
        reservUser: function (e) {
            var assetOwnerInfo = this.assetModel.get('owners');
            var domaincodeArray = [];
            var doaminType = "";

            $.each(assetOwnerInfo, function (k, v) {
                if (v.ownerShip == "MODERATOR" && v.ownerType == "DomainCode") {
                    domaincodeArray.push(v.ownerId);
                    doaminType = "domaincode";
                }
            });

            $.goOrgSlide({
                type: doaminType,
                desc: '',
                includeLoadIds: domaincodeArray,
                contextRoot: GO.contextRoot,
                callback: function (obj) {
                    $('#userId').attr('data-userid', obj.id);
                    $('#userName').html(obj.displayName);
                    $.goOrgSlide('close');
                },
                target: e
            });

            $('div.layer_organogram').css('z-index', '100');
        },

        _isValidTime: function (startTime, endTime) {
            var availabilityDate = this.assetModel.get('availabilityDate');

            if (!(availabilityDate.startTime === '0000' && availabilityDate.endTime === '2400')) {
                var startFormat = 'YYYY-MM-DDT' + availabilityDate.startTime.substr(0, 2) + ':' + availabilityDate.startTime.substr(2, 2) + ':ss.SSSZ';
                var endFormat = 'YYYY-MM-DDT' + availabilityDate.endTime.substr(0, 2) + ':' + availabilityDate.endTime.substr(2, 2) + ':ss.SSSZ';
                var ableStart = moment(startTime).format(startFormat);
                var ableEnd = moment(endTime).format(endFormat);
                if (moment(startTime).isBefore(ableStart) || moment(endTime).isAfter(ableEnd)) return false;
            }

            if (availabilityDate.ableDays.charAt(moment(startTime).format("d")) === '0') return false;
            if (availabilityDate.ableDays.charAt(moment(endTime).format("d")) === '0') return false;

            return true;
        },
        reservConfirm: function () {
            if (this.hasUnreservedDate === true) {
                _this = this;
                $.goConfirm(assetLang['예약 등록'], assetLang["반복 예약 일정 중에 이미 예약 건이 포함된 일자가 있습니다"], function () {
                    _this.reservCreate(true).done($.proxy(function () {
                        GO.router.navigate('asset/' + _this.assetId + '/list/reservation', true);
                    }, this));
                });
            } else {
                this.reservCreate(true).done($.proxy(function () {
                    GO.router.navigate('asset/' + this.assetId + '/list/reservation', true);
                }, this));
            }
        },
        reservCancel: function () {
            GO.router.navigate('asset/' + this.assetId + '/list/reservation' , true);
        },
        reservCreate: function (usePromise) {
            var deferred = $.Deferred();

            if (this.isSaving) return usePromise ? deferred.reject() : false;
            this.isSaving = true;

            try {
                var data = this.getData();
                if (this.type == "reservation") {
                    var startD = $('#startDate').val();
                    var startT = $('#startTime').val();
                    if (moment(startD + " " + startT).isBefore(moment().startOf('day'))) {
                        throw new Error(lang.no_reservation);
                    }
                    if (!this._isValidTime(data.startTime, data.endTime)) throw new Error(lang.alert_no_reservation);
                    if (data.startTime == data.endTime) throw new Error(lang.alert_no_reservation);
                }

                $.each($('tr[data-type="attribute"]'), function () {
                    if ($.trim($(this).find('input').val()) == '') {
                        throw new Error(lang.alert_input);
                    } else if ($.trim($(this).find('input').val()).length > 255) {
                        $(this).find('input').focus();
                        throw new Error(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1: 0, arg2: 255}));
                    }
                });

                this.assetReservModel = new AssetItemCreateModel();
                this.assetReservModel.clear();
                this.assetReservModel.set({
                    assetId: this.assetId,
                    itemId: this.itemId,
                    type: 'reserve'
                });
            } catch (e) {
                this.isSaving = false;
                $.goMessage(e.message);
                return usePromise ? deferred.reject() : false;
            }

            var save = $.proxy(function () {
                return this.assetReservModel.save(data, {
                    success: $.proxy(function () {
                        this.isSaving = false;
                        return true;
                    }, this),
                    error: $.proxy(function () {
                        this.isSaving = false;
                        $.goMessage(lang.alert_duplicate_reservation);
                        return false;
                    }, this),

                    complete: $.proxy(function () {
                        this.isSaving = false;
                    }, this)
                });
            }, this);

            if (usePromise) {
                return save.call(this);
            } else {
                save.call(this);
            }

            return true;
        },
        reserveModify: function (e) {
            var _this = this;
            var data = this.getData();

            if (this._isRecurrence()) {
                var loopEvent = new LoopEvent(this.assetCreateModel, 'update', data);
                loopEvent.render();
                return;
            }

            if (this.type == "reservation") {
                var startD = $('#startDate').val();
                var startT = $('#startTime').val();
                if (moment(startD + " " + startT).isBefore(moment().startOf('day'))) {
                    $.goMessage(lang.no_reservation);
                    return false;
                }

                if (data.startTime == data.endTime) {
                    $.goMessage(lang.alert_no_reservation);
                    return false;
                }

            }

            var checkVal = false;
            $.each($('tr[data-type="attribute"]'), function () {
                if ($.trim($(this).find('input').val()) == '') {
                    $.goMessage(lang.alert_input);
                    checkVal = true;
                    return false;
                } else if ($.trim($(this).find('input').val()).length > 255) {
                    $.goMessage(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1: 0, arg2: 255}));
                    $(this).find('input').focus();
                    checkVal = true;
                    return false;
                }
            });

            if (checkVal) {
                return false;
            }

            if (_this.useCalendar &&
                (GO.util.basicDate3(data.startTime) != GO.util.basicDate3(this.assetCreateModel.get('startTime')) || GO.util.basicDate3(data.endTime) != GO.util.basicDate3(this.assetCreateModel.get('endTime')))) {
                $.goConfirm(assetLang["예약 시간 변경"], assetLang["예약 시간 변경 상세"], function () {
                    data.disconnectionCalendar = true;
                    $.ajax({
                        type: 'PUT',
                        data: JSON.stringify(data),
                        dataType: 'json',
                        contentType: "application/json",
                        url: GO.config("contextRoot") + 'api/asset/' + _this.assetId + '/item/' + _this.itemId + '/reserve/' + _this.reservationId,
                        success: function (response) {
                            $.goMessage(commonLang["저장되었습니다."]);
                            _this.returnList();
                        },
                        error: function (response) {
                            $.goMessage(lang.alert_duplicate_reservation);
                        }
                    });
                });
            } else {
                data.disconnectionCalendar = false;
                $.ajax({
                    type: 'PUT',
                    data: JSON.stringify(data),
                    dataType: 'json',
                    contentType: "application/json",
                    url: GO.config("contextRoot") + 'api/asset/' + _this.assetId + '/item/' + _this.itemId + '/reserve/' + _this.reservationId,
                    success: function (response) {
                        $.goMessage(commonLang["저장되었습니다."]);
                        _this.returnList();
                    },
                    error: function (response) {
                        $.goMessage(lang.alert_duplicate_reservation);
                    }
                });
            }

            e.stopImmediatePropagation();
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
        rentalCancel: function () {

            var _this = this;

            $.goConfirm(assetLang['이용 반납'], assetLang['이용을 반납하시겠습니까?'], function () {
                _this.rentalCancelAction();
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
        reservationDelete: function () {
            if (this._isRecurrence()) {
                var loopEvent = new LoopEvent(this.assetCreateModel, 'remove');
                loopEvent.render();
            } else {
                var _this = this;
                $.goConfirm(assetLang['예약 취소'], assetLang['예약을 취소하시겠습니까?'], function () {
                    _this.reservationDeleteAction();
                });
            }
        },

        _isRecurrence: function() {
            var exclude = this.assetCreateModel.get('exclude');
            var isRecurrence = this.assetCreateModel.get('recurrence');
            return !_.isEmpty(isRecurrence) && !exclude;
        },
        toggleCheck: function (e) {
            if ($(e.currentTarget).is(':checked')) {
                $("#startTime").hide();
                $("#endTime").hide();
            } else {
                $("#startTime").show();
                $("#endTime").show();
            }

        },
        getOffset: function () {
            var offset = $('#repeat').offset();
            offset["top"] = parseInt(offset["top"]) + 30;
            var recurHelperWidth = parseInt(window.width);
            var windowWidth = parseInt(jQuery(window).width());
            if ((parseInt(offset["left"]) + recurHelperWidth) > windowWidth) {
                offset["left"] = parseInt(offset["left"]) + jQuery(window).scrollLeft() - ((parseInt(offset["left"]) + recurHelperWidth) - windowWidth);
            }
            return offset;
        },
        showHideRecurrenceSetupLayer: function () {
            if (this._isDateDifference() && $("#repeat").is(":checked")) {
                $.goMessage(lang.date_over);
                this.cancelUpdateRecurrence();
                return
            }
            if (!$("#repeat").is(":checked")) {
                this.cancelUpdateRecurrence();
                return;
            }

            this.hasUnreservedDate = false;
            var offset = this.getOffset();
            var currentRecurrence = $("#repeat-option-wrap input[name=recurrence]").val();
            var recurHelper = new RecurrenceLayerHelper($('#startDate').val(), false, currentRecurrence, this.day, this.assetItemModel);
            recurHelper.setConfirmCallback(this.updateRecurrenceText, this);
            recurHelper.setCancelCallback(this.cancelUpdateRecurrence, this);
            recurHelper.setCloseCallback(this.cancelUpdateRecurrence, this);
            recurHelper.render(offset);

        },
        updateRecurrenceText: function (code, text, hasUnreservedDate) {
            $("#repeat-option-wrap").show();
            $("#recurrence-text").text(text);
            $("#repeat-option-wrap input[name=recurrence]").val(code);
            $("#repeat-option-wrap input[name=recurrence]").trigger("change");
            this.hasUnreservedDate = hasUnreservedDate;
            return this;
        },
        cancelUpdateRecurrence: function () {
            var repeat = $("#repeat");
            repeat.attr("checked", false);
            repeat.trigger('change');
            $("#repeat-option-wrap").hide();
        },
        removeRecurrence: function () {
            $("#repeat-option-wrap").hide();
            $("#recurrence-text").text("");
            $("#repeat-option-wrap input[name=recurrence]").val("");
            this.cancelUpdateRecurrence();
        },
        editRecurrence: function () {
            this.showHideRecurrenceSetupLayer();
        }
    });

    return AssetReserveView;
});