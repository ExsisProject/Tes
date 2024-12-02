define("timeline/views/user/time_cell", function(require){

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/user/time_cell");
    var PopupView = require("timeline/views/user/history_popup");
    var CellItem= require("timeline/views/user/time_cell_item");
    var TimelineGroup= require("timeline/models/timeline_group");
    var AuthModel = require("timeline/models/auth");
    var GO = require("app");


    var CellView = Backbone.View.extend({
        events : {
        },
        className:'tb_cell',
        initialize : function(opt){
            this.options = opt;
            this.history = opt.history;

            this.dayInfo = this.options.dayInfo;
            this.hour = this.options.hour;
            this.min =0 ;

            this.group = this.options.group;
            this.timelineGroup = new TimelineGroup(this.group);

            this.restTime = this.timelineGroup.isRestTime(this.hour, this.min);
            this.workTime= this.timelineGroup.isWorkTime(this.hour, this.min);
            this.nightTime= this.timelineGroup.isNightTime(this.hour, this.min);
        },
        render : function() {
            this.$el.html(Tmpl({
                workTime:this.workTime
            }));

            if(this.workTime){
                this.$el.addClass('workinghours');
            }
            var div = this.$el.find('.tb_div');
            var self = this;
            _.range(0, 6).map(function(i) {
                 var item = new CellItem(self.options, self.hour, i * 10, self.history) ;
                 div.append(item.$el);
                 item.render();
            });

        },


    });

    return CellView;
});