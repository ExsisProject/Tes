define("timeline/views/user/timeline", function(require){

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/user/timeline");
    var TimelineItemView = require("timeline/views/user/timeline_item");
    var TimeCell= require("timeline/views/user/time_cell");
    var TimeClockProgress= require("timeline/views/user/time_clock_progress");
    var TimeApprovalProgress= require("timeline/views/user/time_approval_progress");
    var DailyModel = require("timeline/models/daily_stat");
    var TimelineHistoryCollection = require("timeline/collections/timeline_histories")


    var TimelineView = Backbone.View.extend({
        className : "tb_attend_detail2",
        splitMinute:60,
        initialize : function(){
            this.model = new DailyModel(this.options.data);
            this.targetUserId = this.options.targetUserId;
            this.timelineHistories = new TimelineHistoryCollection(this.model.historyModels);
        },

        render : function() {
            this.$el.html(Tmpl({}));

            this.rowCount = 0;
            this.renderHeader();
            this.timezoneRender(this.$el.find("#time_wrapper"));

            this.clockInOutViewRender();
            this.approvalViewRender();
            this.renderHistory();

            var timeHeight = 72 + ( this.rowCount * 32);
            this.$el.find('#time_wrapper').height(timeHeight+"px");
        },
        renderHistory:function(){
            var self = this;
            var dataZone =  self.$el.find('#data_zone');
            _.forEach(this.timelineHistories.models, function(history){
                if( history.isRenderProgressBar()){
                    return;
                }
                self.rowCount++;
                dataZone.append('<div id="{id}" class="tb_row workingstate">'.replace('{id}', 'working_state_' + history.getId()));
                self.timezoneRender(self.$el.find('#working_state_' + history.getId()), history);
            })
        },
        timezoneRender:function(target, history ){

            var lastTime = new Date( 1000 * 60 * 60 * 24);
            var splitMs = this.splitMinute *  1000 * 60 ;
            var count = lastTime.getTime() / splitMs;
            _.range(0,count).map(_.bind(function(idx){
                var leftTime =  new Date(idx * splitMs);
                var rightTime =  new Date((idx+1) * splitMs);
                var leftDate = GO.util.convertWithDataTimeZone(leftTime);

                var itemView = new TimeCell(
                    {targetUserId : this.targetUserId,
                        dayInfo : this.options.data.detailDay,
                        group:this.model.get('timelineGroup'),
                        splitMin:this.splitMinute,
                        hour : leftDate.format('HH'),
                        min : leftTime.getMinutes(),
                        history:history
                    });

                target.append(itemView.$el);
                itemView.render();
            }, this));
        },
        renderHeader:function(){
            var self = this;
            _.range(0, 24).map( function (hour ){
                var isWorkingTime = self.model.isWorkingTime(hour) ;
                var markup = '<div class="tb_cell workinghours"> <span class="time">{hour}</span> </div>'.replace('{hour}', hour < 10 ? '0'+hour : hour);
                if( !isWorkingTime){
                    markup = markup.replace(' workinghours', '');
                }
                self.$el.find('#time_zone').append( markup );
            });
        },
        approvalViewRender: function () {
            var self = this;
            var models = this.model.approvals;
            if( !!!models || models.length < 1 ){ return; }

            _.forEach( models, function(m){
                if( m.endPoint > 100){
                    var originEndPoint = m.endPoint;

                    // today
                    m.endPoint = 100;
                    var approvalP= new TimeApprovalProgress(m);
                    self.$el.find('#approval_progress').append(approvalP.$el);
                    approvalP.render();

                    //tomorrow
                    m.endPoint = originEndPoint - 100;
                    m.startPoint = 0;
                    var approvalP= new TimeApprovalProgress(m);
                    self.$el.find('#approval_progress').append(approvalP.$el);
                    approvalP.render();


                }else{
                    var approvalP= new TimeApprovalProgress(m);
                    self.$el.find('#approval_progress').append(approvalP.$el);
                    approvalP.render();
                }
            });

        },
        clockInOutViewRender: function () {
            var self = this;
            var models = this.model.timelineViewModels;
            if( !!!models || models.length < 1 ){ return; }
            _.forEach( models, function(m){
                var clockP = new TimeClockProgress(self.options, m);
                self.$el.find('#clockinout_progress').append(clockP.$el);
                clockP.render();
            });

        }
    });

    return TimelineView;
});