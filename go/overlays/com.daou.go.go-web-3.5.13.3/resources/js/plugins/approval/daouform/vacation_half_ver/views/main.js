define(function(require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var _ = require('underscore');

    var NonHolidayCountModel = require('approval/daouform/vacation_half_ver/models/non_holiday_count');

    var typeTpl = require('hgn!approval/daouform/vacation_half_ver/templates/typeTemplate');
    var halfTpl = require('hgn!approval/daouform/vacation_half_ver/templates/halfTemplate');
    var pointTpl = require('hgn!approval/daouform/vacation_half_ver/templates/pointTemplate');
    var commonLang = require("i18n!nls/commons");
    var vacationLang = require("i18n!vacation/nls/vacation");

    var Vacation = Backbone.View.extend({
        initialize : function(options) {
            this.$startDateEl = $(options.startDateEl); // 시작일
            this.$endDateEl = $(options.endDateEl); // 종료일
            this.$vacationTypeAreaEl = $(options.vacationTypeAreaEl); // 휴가 유형 영역
            this.$vacationHalfAreaEl = $(options.vacationHalfAreaEl); // 반차 관련 영역
            this.$restPointAreaEl = $(options.restPointAreaEl); // 잔여연차 관련 영역
            this.$selectedDaysAreaEl = $(options.selectedDaysAreaEl); // 선택일수 관련 영역
            this.$applyPointAreaEl = $(options.applyPointAreaEl); // 신청연차 관련영역
            this.$descriptionEl = $(options.descriptionEl); // 휴가사유
            this.variablesData = options.variables;
            this.vacationTypes = _.pluck(options.models, 'attributes');
            this.drafterId = options.docModel.drafterId;
        },

        render : function() {
            this.$startDateEl.datepicker("setDate", new Date());
            this.$endDateEl.datepicker("setDate", new Date());

            makeTypeEl(this.$vacationTypeAreaEl, this.vacationTypes);
            makePointEl(this.$selectedDaysAreaEl, '선택일수', 'usingPoint', 1);
            makePointEl(this.$restPointAreaEl, '잔여연차', 'restPoint', parseFloat(this.variablesData.restPoint));
            makePointEl(this.$applyPointAreaEl, '신청연차', 'applyPoint', 1);
            makeHalfEl(this.$vacationHalfAreaEl);

            this.refresh();
            this._eventBind();

            function makeHalfEl($vacationHalfEl) {
                if (!$vacationHalfEl.length) {
                    return;
                }
                $vacationHalfEl.html(halfTpl({
                    checkStartEnd : '{{check_시작일_종료일}}',
                    checkHalf : '{{check_오전_오후}}'
                }));
            }

            function makePointEl($target, text, name, value) {
                if (!$target.length) {
                    return;
                }
                var data = {
                    text : text,
                    dsl : ['{{number:', name,'}}'].join(''),
                    name : name,
                    id : name,
                    value : value
                };

                $target.html(pointTpl({data:data}));
            }

            function makeTypeEl($vacationTypeEl, vacationTypes) {
                var dsl = ['cSel'];
                var vacationNames = _.pluck(vacationTypes, 'name');
                dsl = $.merge(dsl, vacationNames);

                var data = {
                    dsl : '{{'+dsl.join('_')+'}}',
                    options : vacationTypes
                };

                $vacationTypeEl.html(typeTpl({data : data}));
            }
        },
        getVacationType: function(vacationName) {
            return this.vacationTypes.filter(function (value) {
                return value.name == vacationName;
            })[0];
        },
        renderEditDocument : function() {
            this.$selectedDaysAreaEl.find("input").attr("readOnly", true);
            this.$applyPointAreaEl.find("input").attr("readOnly", true);
            this.$restPointAreaEl.find("input").attr("readOnly", true);
            this.$vacationHalfAreaEl.find("input[name^='checkHalf']").unwrap('span'); //임시저장시 wrapping된 span 제거 - nextUntil 메소드 사용을 위해
            this._eventBind();
            this.$endDateEl.trigger('change'); //날짜 변경 이벤트 발생 - 같은 날짜인 경우 종료일 체크박스 disabled 시키는 로직을 태우기 위해
        },

        _eventBind : function() {
            var self = this;
            setMinDate();

            $.merge(self.$startDateEl, self.$endDateEl).on("change", function(){
                setMinDate();
                initHalfEl();
                self.refresh();
            });

            this.$vacationTypeAreaEl.on("change", function(e){
                self.refresh();
                var $target = $(e.currentTarget).find('select');
                $target.attr('data-selectval',$target.val());
            });

            this.$vacationHalfAreaEl.on('change', function(){
                self.refresh();
            });

            // 시작일 & 종료일 checkbox 에 이벤트
            this.$vacationHalfAreaEl.find('input:checkbox').filter("input[name^='checkStartEnd']").on('change', function(e){
                var $target = $(e.currentTarget);

                if($target.is(':checked')) {
                    if(!isStartEndSameDate() && $target.attr('id') == "startHalf") {
                        // 2일 이상인 경우 반차 시작일을 오후後(Quarter4)
                        $target.closest('span.halfArea').find("input#startHalf2").prop('checked', true);
                    } else { // 기본 오전前(Quarter1) 자동 클릭
                        $target.closest('span.halfArea').find("input[id$='Half1']").prop('checked', true);
                    }
                } else { // 해제 시 모든 checkbox 해제
                    $target.closest('span.halfArea').find(":checkbox").prop('checked', false);
                }
            });

            // 시작일 라인의 반반차 영역 checkbox 에 이벤트
            var $startHalfArea = this.$vacationHalfAreaEl.find('input:checkbox')
                .filter("input[name^='checkHalf']").filter("input[name$='startHalf']");
            $startHalfArea.on('change', function(e){
                var $target = $(e.currentTarget);

                if (!isStartEndSameDate()) {
                    // 중간 체크 해제 불가 = 앞에 체크되어 있으면 체크유지
                    if ($target.prevAll().filter('input:checked').length) {
                        $target.prop('checked', true);
                        showContinuousQuarterSuggestionSlide();
                    }

                    // startQuarter4가 아닌 checkbox 에 체크 시 뒤에 startQuarter4까지 다 체크
                    if ($target.attr('id') !== 'startHalf2') {
                        var $input = $target.nextAll().filter('input');
                        if ($input.filter(':not(:checked)').length) {
                            showContinuousQuarterSuggestionSlide();
                        }
                        $input.prop('checked', true);
                    }
                }

                var checkedCnt = $startHalfArea.filter(':checked').length;
                if (checkedCnt > 1) {
                    fillInBetweenChecked($startHalfArea.filter(':checked'));
                }
                // 체크 하나라도 있으면 시작일 체크
                $target.closest('span.halfArea').find('input#startHalf').prop('checked', checkedCnt > 0 ? true : false);
            });

            // 종료일 라인의 반반차 영역 checkbox 에 이벤트
            var $endHalfArea = this.$vacationHalfAreaEl.find('input:checkbox')
                .filter("input[name^='checkHalf']").filter("input[name$='endHalf']");
            $endHalfArea.on('change', function(e){
                var $target = $(e.currentTarget);

                if (!isStartEndSameDate()) {
                    // 중간 체크 해제 불가 = 뒤에 체크되어 있으면 체크유지
                    if ($target.nextAll().filter('input:checked').length) {
                        $target.prop('checked', true);
                        showContinuousQuarterSuggestionSlide();
                    }

                    // endQuarter1가 아닌 checkbox 에 체크 시 앞에 endQuarter1까지 다 체크
                    if ($target.attr('id') !== 'endHalf1') {
                        var $input = $target.prevAll().filter('input');
                        if ($input.filter(':not(:checked)').length) {
                            showContinuousQuarterSuggestionSlide();
                        }
                        $input.prop('checked', true);
                    }
                }
                var checkedCnt = $endHalfArea.filter(':checked').length;
                if (checkedCnt > 1) {
                    fillInBetweenChecked($endHalfArea.filter(':checked'));
                }
                // 체크 하나라도 있으면 종료일 체크
                $target.closest('span.halfArea').find('input#endHalf').prop('checked', checkedCnt > 0 ? true : false);
            });

            function isStartEndSameDate() {
                return _.isEqual(self.$startDateEl.val(), self.$endDateEl.val());
            }

            function showContinuousQuarterSuggestionSlide() {
                $.goError('(반)반차는 연이어서만 선택할 수 있습니다. (분리해서 사용하려면 나눠서 신청해주세요)');
            }

            function fillInBetweenChecked($checkedCheckboxes) { // 체크체크 사이 체크
                $checkedCheckboxes.filter(':first').nextUntil($checkedCheckboxes.filter(':last'), 'input').prop('checked', true);
            }

            function initQuarterEl() { // 시작일 체크-> 오후後 자동체크, 종료일 체크-> 오전前 자동체크
                if (self.$vacationHalfAreaEl.find("input#startHalf").prop('checked')) {
                    self.$vacationHalfAreaEl.find("input#startQuarter4").prop('checked', true).trigger('change');
                } else if (self.$vacationHalfAreaEl.find("input#endHalf").prop('checked')) {
                    self.$vacationHalfAreaEl.find("input#endQuarter1").prop('checked', true).trigger('change');
                }
            }

            function initHalfEl() { // 시작일과 종료일이 같을 때 종료관련 체크박스 비활성화
                if(isStartEndSameDate()){
                    self.$vacationHalfAreaEl.find("input[id^='end']").prop('checked', false).prop('disabled', true);
                } else {
                    self.$vacationHalfAreaEl.find("input[id^='end']").prop('disabled', false);
                    initQuarterEl();
                }
            }

            function setMinDate() {
                self.$endDateEl.datepicker('option', 'minDate', self.$startDateEl.val());
            }
        },

        isVacation : function() {
            var isVacation = false;
            var vacationName = this.getVacationName();

            _.each(this.vacationTypes, function(type){
                if(type.name == vacationName){
                    isVacation = type.useVacationPoint;
                    return;
                }
            }, this);

            return isVacation;
        },

        refresh : function() {
            var usingPoint = getUsingPoint(this.$startDateEl, this.$endDateEl, this.getVacationName(), this.drafterId);
            this.applyPoint = this.isVacation() ? getApplyPoint(this.$vacationHalfAreaEl, usingPoint) : 0;

            var selectedDays = getSelectedDays(this.$startDateEl, this.$endDateEl);
            this.$selectedDaysAreaEl.find('input').val(selectedDays);
            this.$applyPointAreaEl.find('input').attr('value', this.applyPoint);

            this.validate().applyPoint(this.applyPoint, selectedDays);

            function getSelectedDays($startDateEl, $endDateEl) {
                var startDate = new Date(GO.util.customDate($startDateEl.val().split("(")[0], "YYYY-MM-DD")) ;
                var endDate = new Date(GO.util.customDate($endDateEl.val().split("(")[0], "YYYY-MM-DD"));

                var btMs = endDate.getTime() - startDate.getTime() ;
                var btDay = (btMs / (1000*60*60*24)) + 1;

                return btDay;
            }

            function getApplyPoint($halfEl, usingPoint) {
                var halfPoint = 0.5;
                var checkedStartEndCnt = $halfEl.find("input[name^='checkStartEnd']").filter(":checked").length;
                var checkedQuarterCnt = $halfEl.find("input[name^='checkHalf']").filter(":checked").length;

                return usingPoint - checkedStartEndCnt + (halfPoint * checkedQuarterCnt);
            }

            function getUsingPoint($startDateEl, $endDateEl, vacationName, drafterId){
                var startDate = GO.util.customDate($startDateEl.val().split("(")[0], "YYYY-MM-DD");
                var endDate = GO.util.customDate($endDateEl.val().split("(")[0], "YYYY-MM-DD");

                var param = {
                    startDate : startDate,
                    endDate : endDate,
                    vacationName: vacationName,
                    drafterId: drafterId,
                };
                var nonHolidayCountModel = new NonHolidayCountModel();
                nonHolidayCountModel.fetch({
                    data : param,
                    async : false,
                    error : function(model, response, options) {
                        $.goError(commonLang["500 오류페이지 타이틀"]);
                        GO.router.navigate("approval", {trigger:true});
                    },
                    success : function(model, response) {
                        nonHolidayCountModel.nonHolidayCount = response.data;
                    }
                });
                var usingPoint = nonHolidayCountModel.nonHolidayCount * 1.0;
                return usingPoint;
            }
        },

        getVacationName : function() {
            return this.$vacationTypeAreaEl.find('select').val();
        },

        getVariablesData : function() {
            return {
                title : this.getVacationName(),
                isAnnualVacation :  this.isVacation(),
                year : this.variablesData.year,
                startDate : GO.util.customDate(this.$startDateEl.val().split("(")[0], "YYYY-MM-DD"),
                endDate : GO.util.customDate(this.$endDateEl.val().split("(")[0], "YYYY-MM-DD"),
                startQuarter1 : $('#startHalf1').is(':checked'),
                startQuarter2 : $('#startHalf1').is(':checked'),
                startQuarter3 : $('#startHalf2').is(':checked'),
                startQuarter4 : $('#startHalf2').is(':checked'),
                endQuarter1 : $('#endHalf1').is(':checked'),
                endQuarter2 : $('#endHalf1').is(':checked'),
                endQuarter3 : $('#endHalf2').is(':checked'),
                endQuarter4 : $('#endHalf2').is(':checked'),
                applyPoint : this.isVacation() ? this.applyPoint : 0,
                description : this.$descriptionEl.val(),
                version : "2.5.8.0"
            }
        },

        validate : function() {
            var self = this;

            return {
                applyPoint : function(applyPoint, selectedDays) {
                    var vacationType = self.getVacationType(self.getVacationName());
                    if (vacationType.limited && vacationType.availableMax < selectedDays) {
                        $('#usingPoint_Comment').text(GO.i18n(vacationLang["사용 가능일 수 에러메시지"],{ "availableMax": vacationType.availableMax}));
                        return;
                    }
                    if (applyPoint > parseFloat(self.variablesData.restPoint)) {
                        $('#usingPoint_Comment').text(commonLang["신청가능일을 초과하였습니다."]);
                        return;
                    }
                    $('#usingPoint_Comment').text("");
                },
                descriptionLength : function() {
                    //oracle 한글 한자 3byte로 취급 4000/3
                    var descriptionDBColumnMaxLength = 1333;
                    var maxLength = ($(self.$descriptionEl).attr("data-maxlength")) ? parseInt($(self.$descriptionEl).attr("data-maxlength")) : descriptionDBColumnMaxLength;
                    if(maxLength > descriptionDBColumnMaxLength) {
                        maxLength = descriptionDBColumnMaxLength;
                    }
                    var isOverMaxLength = self.$descriptionEl.val()
                        && ($(self.$descriptionEl).val().length > maxLength);
                    if (isOverMaxLength) {
                        if(maxLength === descriptionDBColumnMaxLength) {
                            maxLength = "(4000byte)1333"
                        }
                        $.goSlideMessage(GO.i18n(commonLang['최대 {{arg1}}자 까지 입력할 수 있습니다.'], "arg1", maxLength));
                        return false;
                    }
                    return true;
                }
            }
        }
    });

    return Vacation;
})
