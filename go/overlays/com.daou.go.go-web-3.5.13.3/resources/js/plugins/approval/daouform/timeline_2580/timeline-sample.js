define(function(require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var Timeline = require("approval/daouform/timeline_2580/views/main");

    var Integration = Backbone.View.extend({

        initialize : function(options) {
            this.options = options || {};
            this.docStatus = GO.util.store.get('document.docStatus');
        },

        render : function() {
            this.timeline = new Timeline(this.options);
            if (!_.isEqual(this.docStatus, "TEMPSAVE")){
                this.timeline.render();
            }
        },

        renderViewMode : function() {
            $('#timelineApprovalFormSection').hide();
        },

        onEditDocument : function() {
            this.timeline = new Timeline(this.options);
            $('#timelineApprovalFormSection').show();
        },

        beforeSave : function() {},

        afterSave : function() {},

        validate : function() {
            if (this.timeline) {
                return this.timeline.validate().checkEmptyRequestApprovals();
            }
            return true;
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
