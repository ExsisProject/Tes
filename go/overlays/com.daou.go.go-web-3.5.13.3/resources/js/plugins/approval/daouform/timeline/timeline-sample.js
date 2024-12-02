define(function(require) {
    var $ = require("jquery");
    var app = require("app");
    var Backbone = require("backbone");
    var Timeline = require("approval/daouform/timeline/views/main");

    var initOptions = {
        startDate : "#startDate",
        startTime : "#startTime",
        endTime: "#endTime",
        totalTime:"#totalTime",
        weeklyTotalTime:"#weeklyTotalTime",
        monthlyTotalTime:"#monthlyTotalTime",
        description : "#description",
        approvalName : "#name"
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
            this.timeline = new Timeline(_.extend(initOptions, this.options));
            if(_.isEqual(this.docStatus, "TEMPSAVE")){
                this.timeline.renderEditDocument();
            }else{
                this.timeline.render();
            }
        },

        renderViewMode : function() {
            /* 읽기모드에서 함수가 필요한 경우 구현 */
        },

        onEditDocument : function() {
            /* '수정 ' 버튼을 눌렀을때 실행. */
            this.timeline = new Timeline(_.extend(initOptions, this.options));
            this.timeline.renderEditDocument();

        },

        beforeSave : function() {
        },

        afterSave : function() {
        },

        validate : function() {
            if(this.timeline){
                return this.timeline.validate().descriptionLength()&&this.timeline.validate().buttonClick()&&this.timeline.validate().selectApprovalName();
            }else{
                return true;
            }
        },
        getDocVariables : function() {
            if(this.timeline) {
                return this.timeline.getVariablesData();
            }else {
                return this.timeline;
            }
        }
    });

    return Integration;
});