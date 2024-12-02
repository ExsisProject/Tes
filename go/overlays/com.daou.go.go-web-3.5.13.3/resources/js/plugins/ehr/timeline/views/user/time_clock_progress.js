define("timeline/views/user/time_clock_progress", function(require){

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/user/time_clock_progress");
    var PopupView = require("timeline/views/user/history_popup");
    var TimelineGroup= require("timeline/models/timeline_group");
    var AuthModel = require("timeline/models/auth");
    var TimelineLang = require("i18n!timeline/nls/timeline");
    var GO = require("app");


    var CellView = Backbone.View.extend({
        events : {
            'click span#clockIn' : 'showEditPopup',
            'click span#clockOut' : 'showEditPopup'
        },
        className:'progress ',
        initialize : function(opt, model){
            this.options = opt;
            this.viewModel = model;

            this.authModel = new AuthModel(GO.util.store.get("timeline.auth"));
            this.dayInfo = this.options.data.detailDay
            this.hour = this.options.hour;
            this.targetUserId = this.options.targetUserId;
            this.min =0 ;

            this.group = this.options.group;
            this.timelineGroup = new TimelineGroup(this.group);
            this.sHistory = this.viewModel.startHistory;
            this.eHistory = this.viewModel.endHistory;

            this.inStatusName = this.sHistory? this.sHistory.timelineStatus.name: '';
            this.outStatusName = this.eHistory? this.eHistory.timelineStatus.name:'';

            this.restTime = this.timelineGroup.isRestTime(this.hour, this.min);
            this.workTime= this.timelineGroup.isWorkTime(this.hour, this.min);
            this.nightTime= this.timelineGroup.isNightTime(this.hour, this.min);

            this.startTail = this.viewModel.startTail;
            this.endTail = this.viewModel.endTail;
        },
        render : function() {

            this.$el.html(Tmpl({
                first: !!this.sHistory,
                last:!!this.eHistory,
                tomorrow:this.viewModel.tomorrow,
                inStatusName: this.inStatusName,
                outStatusName: this.outStatusName,
                clockInTime : this.getDetailTimeInfo(this.sHistory),
                clockOutTime : this.getDetailTimeInfo(this.eHistory)
            }));
            var widthMin = (new Date(this.viewModel.endDate) - new Date(this.viewModel.startDate)) / (1000 * 60);
            if( this.sHistory ){
                this.$el.addClass('start');

                if( widthMin<= 30 && !this.viewModel.overTime ){
                    this.$el.addClass('initial');
                }
            }
            if ( this.eHistory){
                if( widthMin<= 60 ){
                    this.$el.addClass('initial');
                }
                this.$el.addClass('close');
            }
            if(!!this.viewModel.overTime){
                this.$el.addClass('part_overtime');
            }else{
                this.$el.addClass('part_default');
            }
            if(this.authModel.isEditable()){
                this.$el.find('span').css("cursor", "pointer")
            }

            if(this.startTail ){
                this.$el.addClass('day_tail_l');
            }
            else if(this.endTail){
                this.$el.addClass('day_tail_r');
            }

            this.$el.css('left', this.viewModel.startPoint +'%');
            this.$el.css('width', + (this.viewModel.endPoint - this.viewModel.startPoint)+ '%');


        },

        getDetailTimeInfo : function(history) {
            var defaultTimeZone = "GMT +09:00";
            if(!history) {
                return "";
            }

            if(history.timezoneInfo) {
                return moment(history.checkTime).zone(history.timezoneInfo).format("HH:mm");
            } else {
                return moment(history.checkTime).zone(defaultTimeZone).format("HH:mm");
            }
        },

        showEditPopup : function(e){

            if(!this.authModel.isEditable()){
                return;
            }

            var $target = $(e.currentTarget);
            var id = $target.attr("id");

            var history = id === 'clockIn' ? this.sHistory: this.eHistory;
            var popupView = new PopupView({targetUserId : this.targetUserId,dayInfo : this.dayInfo,  data : history});
            popupView.render();

        },
    });

    return CellView;
});