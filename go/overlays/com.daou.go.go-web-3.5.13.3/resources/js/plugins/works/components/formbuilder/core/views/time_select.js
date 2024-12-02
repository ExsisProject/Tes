define(function(require) {
	var BackdropView = require("components/backdrop/backdrop");
	
	var template = [
    	'<input data-time="start" type="text" class="txt wfix_small">',
		'<ul class="select_list" el-time-list style="display:none;">',
		'</ul>',		
	].join("");
	
	var INTERVAL = 30;
	
	return BackdropView.extend({
		tagName : "span",
		className : "wrap_select_list",
		
		initialize : function(options) {
			this.useBackdrop = options.useBackdrop !== false;
			this.backdropToggleElSelector = "ul";
			
			if (this.useBackdrop) this.bindBackdrop();
		},
		
		render : function() {
			
			this.$el.html(Hogan.compile(template).render({
				cid : this.cid
			}));
			
			this.renderTimeOption();
			
			return this;
		},
		
		renderTimeOption : function() {
			this.$("ul").html(this._makeTimeOption());
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
				options.push("<li><span class='txt'>" + timeOption.format("HH:mm") + label + "</span></li>");
				timeOption.add("minutes", INTERVAL);
			}
			
			return options;
		}
	});
});