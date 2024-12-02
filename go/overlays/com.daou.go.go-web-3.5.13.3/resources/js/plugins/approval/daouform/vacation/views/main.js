define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var App = require('app');
	var _ = require('underscore');

	var VacationModel = require('approval/daouform/vacation/models/vacation');

	var typeTpl = require('hgn!approval/daouform/vacation/templates/typeTemplate');
	var halfTpl = require('hgn!approval/daouform/vacation/templates/halfTemplate');
	var pointTpl = require('hgn!approval/daouform/vacation/templates/pointTemplate');
	var commonLang = require("i18n!nls/commons");
	var vacationLang = require("i18n!vacation/nls/vacation");

	var Vacation = Backbone.View.extend({
		initialize : function(options) {
			this.$startDateEl = $(options.startDateEl); // 시작일
			this.$endDateEl = $(options.endDateEl); // 종료일
			this.$vacationTypeAreaEl = $(options.vacationTypeAreaEl); // 휴가 유형  영역
			this.$vacationHalfAreaEl = $(options.vacationHalfAreaEl); // 반차 관련 영역
			this.$restPointAreaEl = $(options.restPointAreaEl); // 잔여연차 관련 영역
			this.$usingPointAreaEl = $(options.usingPointAreaEl); // 사용연차 관련 영역
			this.$applyPointAreaEl = $(options.applyPointAreaEl); // 신청연차 관련영역
			this.$descriptionEl = $(options.descriptionEl); //휴가사유
			this.variablesData = options.variables;
			this.vacationTypes = options.type;
			this.calculationType = options.calculationType; // 연차계산시 휴일처리 방식(all:주말+기념일+공휴일 / holiday:주말+공휴일 / weekend:주말)
			this.closedDayOfWeek = options.closedDayOfWeek; //지정 비근무요일
		},

		render : function() {
			this.$startDateEl.datepicker("setDate", new Date());
			this.$endDateEl.datepicker("setDate", new Date());

			makeTypeEl(this.vacationTypes, this.$vacationTypeAreaEl);
			makePointEl(this.$usingPointAreaEl, '사용일수', 'usingPoint', 1);
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
					check : '{{check_시작일_종료일}}',
					radio : '{{radio_오전_오후}}'
				}));
			}

			function makePointEl($target, text, name, value){
				if (!$target.length) {
					return;
				}
				var data = {
						text : text,
						dsl : ['{{number:', name,'}}'].join(''),
						name : name,
						id : name,
						value : value,
					};

				$target.html(pointTpl({data:data}));
			}

			function makeTypeEl(vacationTypes, $vacationTypeEl){
				// 휴가 타입
				var text = _.pluck(vacationTypes, 'text');
				var dsl = [];
				// TODO : name => data-vacation-type 로 변경후 테스트

				var isSelectMode = $vacationTypeEl.attr('name') == 'select' ;
				if (isSelectMode) {
					dsl.push('cSel');
				} else {
					dsl.push('radio');
				}

				dsl = $.merge(dsl, text);

				var data = {
					dsl : '{{'+dsl.join('_') + '}}',
					options : vacationTypes,
					isSelectMode : isSelectMode
				};

				$vacationTypeEl.html(typeTpl({data:data}));

				if(!isSelectMode){
					$vacationTypeEl.find("input:radio:first").attr("checked", "checked");
				}
			}

		},
		getVacationType: function(vacationName) {
			return this.vacationTypes.filter(function (value) {
				return value.text == vacationName;
			})[0];
		},
		renderEditDocument : function() {
			this.$usingPointAreaEl.find("input").attr("readOnly", true);
			this.$applyPointAreaEl.find("input").attr("readOnly", true);
			this.$restPointAreaEl.find("input").attr("readOnly", true);
			this._eventBind();
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

			this.$vacationHalfAreaEl.find('input:checkbox').on('change', function(e){
				var $target = $(e.currentTarget);
				$target.closest('span.halfArea').find(':radio').attr('disabled', !$target.is(':checked')).attr('checked', false);

				if(!_.isEqual(self.$startDateEl.val(), self.$endDateEl.val())){
					$('#startAMHalf, #endPMHalf').attr('disabled', true);
				}
			});

			function initHalfEl() {
				self.$vacationHalfAreaEl.find("input").attr('checked', false).attr('disabled', true);

				self.$vacationHalfAreaEl.find('#startHalf').attr('disabled', false);
				if(!_.isEqual(self.$startDateEl.val(), self.$endDateEl.val())){
					self.$vacationHalfAreaEl.find('#endHalf').attr('disabled', false);
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
				if(type.text ==vacationName){
					isVacation = type.isVacation;
					return;
				}
			}, this);

			return isVacation;
		},

		refresh : function(){
			var self = this;
			var usingPoint = getUsingPoint(this.$startDateEl, this.$endDateEl, this.getVacationName());
			var halfPoint = getHalfPoint(this.$vacationHalfAreaEl);

			var point = usingPoint - halfPoint;
			this.applyPoint = this.isVacation() ? point : 0;

			this.$usingPointAreaEl.find('input').val(point);
			this.$applyPointAreaEl.find('input').attr('value', this.applyPoint);

			this.validate().applyPoint(this.applyPoint, point);

			function getHalfPoint($halfEl) {
				var halfPoint = 0;
				$.each($halfEl.find('input:radio'), function(index, value){
					if(value.checked){
						halfPoint += 0.5;
					}
				});
				return halfPoint;
			}

			function getUsingPoint($startDateEl, $endDateEl, vacationName){
				var startDate = GO.util.customDate($startDateEl.val().split("(")[0], "YYYY-MM-DD");
				var endDate = GO.util.customDate($endDateEl.val().split("(")[0], "YYYY-MM-DD");

				var param = {
					startDate : startDate,
					endDate : endDate,
					vacationName : vacationName,
					calculationType : self.calculationType,
					closedDayOfWeek : JSON.stringify(self.closedDayOfWeek)
				};

				var vacationModel = new VacationModel();
				vacationModel.fetch({
					data : param,
					async : false,
					error : function(model, response, options){
						$.goError(commonLang["500 오류페이지 타이틀"]);
						GO.router.navigate("approval", {trigger:true});
					}
				});

				var usingPoint = (vacationModel.get("vacationCount") * 1.0);
				return usingPoint;
			}
		},

		getVacationName : function() {
			var vacationName;
			if(this.$vacationTypeAreaEl.attr('name') == 'select') {
				vacationName = this.$vacationTypeAreaEl.find('select').val();
			} else {
				vacationName = this.$vacationTypeAreaEl.find('input:radio:checked').val();
			}
			return vacationName;
		},

		getVariablesData : function() {
			return {
				title : this.getVacationName(),
				isAnnualVacation :  this.isVacation(),
				year : this.variablesData.year,
				startDate : GO.util.customDate(this.$startDateEl.val().split("(")[0], "YYYY-MM-DD"),
				endDate : GO.util.customDate(this.$endDateEl.val().split("(")[0], "YYYY-MM-DD"),
				startAMHalf :$('#startAMHalf').is(':checked'),
				startPMHalf : $('#startPMHalf').is(':checked'),
				endAMHalf : $('#endAMHalf').is(':checked'),
				applyPoint : this.isVacation() ? this.applyPoint : 0,
				description : this.$descriptionEl.val()
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

