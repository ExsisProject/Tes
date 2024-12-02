define(function(require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var Vacation = require("approval/daouform/vacation_half_ver/views/main");
    var VacationStatusCollection = require("approval/daouform/vacation_half_ver/collections/statuses");

    // 초기셋팅
    var initOptions = {
        startDateEl : "#startDate", //default
        endDateEl : "#endDate", //default
        vacationTypeAreaEl : "#vacationTypeArea", //default
        vacationHalfAreaEl : "#vacationHalfArea", //option
        applyPointAreaEl : "#applyPointArea", //option
        restPointAreaEl : "#restPointArea",	//option
        selectedDaysAreaEl : "#usingPointArea", //option
        descriptionEl : "#description" //option
    }

    var Integration = Backbone.View.extend({

        initialize : function(options) {
            this.options = options || {};
            this.docModel = this.options.docModel;
            this.variables = this.options.variables;
            this.infoData = this.options.infoData;

            this.docStatus = GO.util.store.get('document.docStatus');
            this.docMode = GO.util.store.get('document.docMode');
            this.vacationStatuses = new VacationStatusCollection();
            this.vacationStatuses.fetch({ async: false });
        },

        render : function() {
            // create Mode
            this.vacation = new Vacation(_.extend(initOptions, this.options, this.vacationStatuses));
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
            this.vacation = new Vacation(_.extend(initOptions, this.options, this.vacationStatuses));
            this.vacation.renderEditDocument();
        },

        beforeSave : function() {
        },

        afterSave : function() {
        },

        validate : function() {
            if(this.vacation){
                return this.vacation.validate().descriptionLength();
            } else {
                return true;
            }
        },

        getDocVariables : function() {
            if(this.vacation) {
                return this.vacation.getVariablesData();
            } else {
                return this.variables;
            }
        }
    });

    return Integration;
});