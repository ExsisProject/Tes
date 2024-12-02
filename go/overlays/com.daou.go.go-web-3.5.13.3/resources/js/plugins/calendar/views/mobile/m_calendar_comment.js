;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			
			"i18n!nls/commons",
			"i18n!calendar/nls/calendar",
	        "hgn!calendar/templates/mobile/m_calendar_comment",
	        "calendar/models/event",
	        "calendar/libs/recurrence_parser",
	        
	        "m_comment",
	        "views/mobile/header_toolbar"
	], 
	function(
			Backbone,
			Hogan,
			App,
			
			commonLang,
			calLang,
			CommentListTpl,
			Event,
			RecurrenceParser,
			
			CommentView,
			HeaderToolbarView
	) {
		var lang = {
		};

		
		var CommentList = Backbone.View.extend({
			initialize : function(option) {
				this.model = new Event({
					id : option.eventId,
					calendarId : option.calendarId
				});
			},
			
			
			fetch : function() {
				return this.model.fetch();
			},
			
			
			render : function() {
				/*TitleToolbarView.render({
			        name : calLang["일정보기"], 
			        isIscroll : false,
			        isPrev : true
			    });*/
				HeaderToolbarView.render({
					title : commonLang['댓글'],
					isClose : true
				});
				
				var timeLabel = GO.util.basicDate3(this.model.get("startTime")) + " ~ " + GO.util.basicDate3(this.model.get("endTime"));
				var recurrence = this.model.get("recurrence");
				var recurrenceLabel = "";
				if (recurrence) {
					var recurrenceParser = new RecurrenceParser();
					recurrenceLabel = recurrenceParser.parse(this.model.get("recurrence")).humanize();
				}
				
				this.$el.html(CommentListTpl({
					lang : lang,
					event : this.model.toJSON(),
					isPrivate : this.model.isPrivate(),
					timeLabel : timeLabel,
					recurrence : recurrenceLabel
				}));
				
	            CommentView.create({
	                el : "#comment_list",
	                type : "calendar/" + this.model.get("calendarId") + "/event",
	                typeId : this.model.id,
	                isReply : true
	            });
				
				GO.EventEmitter.on("common", "change:comment", function(count) {
					this.$("#commentCount").text("(" + count + ")");
				}, this);
				
				return this;
			}
		});
		return CommentList;
	});
}).call(this);