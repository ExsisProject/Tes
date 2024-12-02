define("timeline/views/user/time_approval_progress", function (require) {

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/user/time_approval_progress");
    var GO = require("app");


    var CellView = Backbone.View.extend({
        events: {},
        className: 'progress part_approval start close',
        initialize: function (approval) {
            this.viewModel = approval;
            this.wait = !approval.agree;
            this.approvalName = approval.name;
            this.approvalStatus = approval.approvalStatus;
        },
        render: function () {

            this.$el.html(Tmpl({
                wait: this.wait,
                approvalName: this.approvalName,
                approvalStatus: this.approvalStatus
            }));

            if( this.viewModel.startPoint != 0 && !this.viewModel.startPoint){
                this.$el.hide();
                return;
            }

            this.$el.css('left', this.viewModel.startPoint +'%');
            this.$el.css('width', (this.viewModel.endPoint - this.viewModel.startPoint)+'%');

            if(this.wait){
               this.$el.addClass('wait')
            }

        },

    });

    return CellView;
});