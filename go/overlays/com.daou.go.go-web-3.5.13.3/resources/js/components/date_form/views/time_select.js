define(function(require) {
	var calendarLang = require("i18n!calendar/nls/calendar"); 
	var BackdropView = require("components/backdrop/backdrop");
	
	var template = [
    	'<input data-time="{{type}}" type="text" class="{{className}}">',
		'<ul class="select_list" el-time-list style="display:none;">',
		'</ul>',		
	].join("");
	
	var INTERVAL = 30;
	
	var TimeSelectView = BackdropView.extend({
		tagName : "span",
		className : "wrap_select_list",
		
		initialize : function(options) {
			this.type = options.type;
			this.useBackdrop = options.useBackdrop === false ? false : true;
			this.backdropToggleElSelector = "ul";
			
			if (this.useBackdrop) this.bindBackdrop();
		},
		
		render : function() {
			var className = "txt wfix_";
			
			this.$el.html(Hogan.compile(template).render({
				cid : this.cid,
				className : className + (this.type == "end" ? "normal" : "small"),
				type : this.type
			}));
			
			this.renderTimeOption();
			
			return this;
		},
		
		/**
		 * 검색용 주석 : getStartTime, getEndTime
		 */
		renderTimeOption : function() {
			this.$("ul").html(this._makeTimeOption());
			this.$("input").val(this.model["get" + GO.util.initCap(this.type) + "Time"]());
		},
		
		/**
		 * 현재 시간 기준으로 간격을 유지하면서 option 을 제공한다.
		 * 시작일과 종료일이 다른경우 option 은 00분 부터 시작한다
		 */
		_makeTimeOption : function() {
			var options = [];
			var timeOption = moment().startOf("days");
			var timeSlotLength = 60 * 24 / INTERVAL;
			
			for (var index = 0; index < timeSlotLength; index++) {
				var label = "";
				if (this.type === "end") {
					var diff = this.model.getEndDateTime(null, timeOption.format("HH:mm")).diff(this.model.getStartDateTime(), "minutes");
					if (this.model.getStartDate() != this.model.getEndDate()) diff = 0;
					var mod = Math.abs(diff % INTERVAL);
					timeOption.add("minutes", mod);
					
					if (diff < 0) {
						timeOption.add("minutes", INTERVAL);
						continue;
					} else if (this.model.getStartDate() != this.model.getEndDate()) {
						label = "";
					} else if (diff >= 0 && diff < 60) {
						label = "(" + diff + calendarLang["분"] + ")";
					} else {
						label = "(" + diff / 60 + calendarLang["시간"] + ")";
					}
				}
				options.push("<li><span class='txt'>" + timeOption.format("HH:mm") + label + "</span></li>");
				timeOption.add("minutes", INTERVAL);
			}
			
			return options;
		}
	});
	
	return TimeSelectView;
});