define(function(require) {
	var $ = require("jquery");
	var app = require("app");
	var Backbone = require("backbone");
	var Vacation = require("approval/daouform/vacation/views/main");
	var VacationCustomOptions = require("json!approval/daouform/vacation/config/vacation.custom.config.json");

	// 초기셋팅
	var initOptions = {
		startDateEl : "#startDate",								//default
		endDateEl : "#endDate",								//default
		vacationTypeAreaEl : "#vacationTypeArea",		//default
		vacationHalfAreaEl : "#vacationHalfArea",			//option
		applyPointAreaEl : "#applyPointArea",				//option
		restPointAreaEl : "#restPointArea",					//option
		usingPointAreaEl : "#usingPointArea",				//option
		descriptionEl : "#description"							//option
	}

	var Integration = Backbone.View.extend({

		initialize : function(options) {
			this.options = options || {};
			this.docModel = this.options.docModel;
			this.variables = this.options.variables;
			this.infoData = this.options.infoData;

			this.docStatus = GO.util.store.get('document.docStatus');
			this.docMode = GO.util.store.get('document.docMode');
		},

		render : function() {
			// create Mode
			$.extend(initOptions, VacationCustomOptions);
			this.vacation = new Vacation(_.extend(initOptions, this.options));
			if(_.isEqual(this.docStatus, "TEMPSAVE")){
				this.vacation.renderEditDocument();
			}else{
				this.vacation.render();
			}
		},

		renderViewMode : function() {
			/* 읽기모드에서 함수가 필요한 경우 구현 */
		},

		onEditDocument : function() {
			/* '수정 ' 버튼을 눌렀을때 실행. */
			$.extend(initOptions, VacationCustomOptions);
			this.vacation = new Vacation(_.extend(initOptions, this.options));
			this.vacation.renderEditDocument();
		},

		beforeSave : function() {
		},

		afterSave : function() {
		},

		validate : function() {
			if(this.vacation){
				return this.vacation.validate().descriptionLength();
			}else{
				return true;
			}
		},

		getDocVariables : function() {
			if(this.vacation) {
                return this.vacation.getVariablesData();
            }else {
                return this.variables;
            }
		},
		
		getDeleteMessageKey : function() {
			return "연차연동문서 삭제 경고 메세지";
		}
	});

	return Integration;
});
