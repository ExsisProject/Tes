(function() {
	define([
		"jquery",
		"backbone",
		"app",
		"hgn!calendar/templates/mobile/m_side",
		"calendar/collections/calendar_feeds",
		"i18n!calendar/nls/calendar",
		"calendar/collections/calendars",
		"calendar/libs/util",
		"i18n!nls/commons"
	],
	function(
		$,
		Backbone,
		GO,
		sideMenuTpl,
		feedsCollection,
		calendarLang,
		Calendars,
		CalUtil,
		CommonLang
	) {

		var lang = {
			'my_calendar' : calendarLang['내 캘린더'],
			'my_plan' : calendarLang['내 일정'],
			'feeds' : calendarLang['관심 캘린더'],
			'company_calendar' : calendarLang['전사일정'],
			'cal_default_name' : calendarLang["캘린더 기본이름"],
			'cal_display_name' : calendarLang["캘린더 표시이름"],
			'cal_default' : calendarLang["기본 캘린더 표시"],
			'calendar': CommonLang['캘린더'],
			'all' : CommonLang['전체']
		};

		var SideView = Backbone.View.extend({
			className: 'go_side',
			attributes: {'style': 'position:static;'},
			unBindEvent : function() {
				this.$el.off("click", "input[data-event-type='checkList']");
				this.$el.off("click", "#allFeedCheckbox");
			},
			bindEvent: function () {
				this.$el.on("click", "input[data-event-type='checkList']", $.proxy(this.saveCheckedCalendar, this));
				this.$el.on("click", "#allFeedCheckbox", $.proxy(this.checkAllFeedCheckbox, this));
			},
			initialize: function (options) {
				var self = this;
				this.options = options || {};
				this.checkAllCheckBox = false;
				this.checkedCalendarIds = [];
				Calendars.getCalendars().done(function (model) {
					var savedSelectedCalendarIds = CalUtil.getSavedSelectedCalendar();
					if (_.isUndefined(savedSelectedCalendarIds) || savedSelectedCalendarIds === "") {
						self.checkedCalendarIds.push(model.getMyCalendars()[0].id.toString());
						CalUtil.saveCheckedCalendar(self.checkedCalendarIds);
					} else {
						self.checkedCalendarIds = savedSelectedCalendarIds.split(',');
					}
					if (self.checkedCalendarIds.indexOf(model.getHolidayCalendars()[0].id.toString()) === -1) {
						self.checkedCalendarIds.push(model.getHolidayCalendars()[0].id.toString());
						CalUtil.saveCheckedCalendar(self.checkedCalendarIds);
					}
				});
			},

			saveCheckedCalendar: function (e) {
				var _this = this;
                _this.checkedOwnerIds = _.isUndefined(CalUtil.getSavedSelectedCalendarOwnerId()) || CalUtil.getSavedSelectedCalendarOwnerId() === "" ? [] : CalUtil.getSavedSelectedCalendarOwnerId().split(",");
                var $target = $(e.currentTarget);
				var feedId = $target.attr('data-calendar-owner-id');
				var feedCalId = $target.attr('data-calendarid');
				if ($target.is(':checked')) {
                    if(_this.checkedCalendarIds.indexOf(feedCalId) < 0){
                        _this.checkedCalendarIds.push(feedCalId);
                        if(!_.isUndefined(feedId)){
                            _this.checkedOwnerIds.push(feedId);
                        }
                    }
				} else {
				    if(_this.checkedCalendarIds.indexOf(feedCalId) > -1){
                        _this.checkedCalendarIds.splice(_this.checkedCalendarIds.indexOf(feedCalId), 1);
                    }
				    if(_this.checkedOwnerIds.indexOf(feedId) > -1){
                        _this.checkedOwnerIds.splice(_this.checkedOwnerIds.indexOf(feedId), 1);
                    }
				}
                CalUtil.saveCheckedCalendarOwnerId(this.checkedOwnerIds);
                CalUtil.saveCheckedCalendar(this.checkedCalendarIds);
				if(!this.checkAllCheckBox){
                    this.setAllFeedCheckBoxProperty();
                }
			},

			setAllFeedCheckBoxProperty: function(){
				var feedTotalCnt = this.$el.find('input:checkbox[data-type="feed"]').length;
				var feedCheckedCnt = this.$el.find('input:checkbox[data-type="feed"]:checked').length;
				var allFeedCheckbox = this.$el.find('input:checkbox[data-type="all"]');
				allFeedCheckbox.prop('checked', feedTotalCnt === feedCheckedCnt);
				GO.EventEmitter.trigger("calendar", "checkFeedBox");
			},

			checkAllFeedCheckbox: function (e) {
                this.checkAllCheckBox = true;
				var target = $(e.currentTarget);
				$("input:checkbox[data-type='feed']").prop("checked", !target.is(':checked')).click();
                this.setAllFeedCheckBoxProperty();
                this.checkAllCheckBox = false;
            },

			getCalendarFeeds: function () {
				return feedsCollection.setUserId(GO.session("id")).getData();
			},

			render : function() {
				this.packageName = this.options.packageName;
				this.feedsId = [];
				var self = this,
					deferred = $.Deferred();

				this.unBindEvent();
				this.bindEvent();

				var companyCal = new Backbone.Collection(Calendars.getCompanyCalendar());
				var myCal = [];
				$.each(Calendars.getMyCalendar(),function(k,v){
					return myCal.push(v.toJSON());
				});
				var checkState = function(){
					if(this.state == "following"){
						self.feedsId.push(this.calendar.id);
						return true;
					}
					return false;
				};
				var isDefaultCalendar = function(){
					if(this.defaultCalendar === true){
						return true;
					}
					return false;
				};
				this.$el.html(sideMenuTpl({
					data:this.getCalendarFeeds().toJSON(),
					feedName : function(){
						/* GO-26243 pc웹과 모바일의 관심캘린더 명칭을 동일하게 바꿈.
						 * 기본일정일 경우 xx의 일정이라고 표시되는데 기본일정 명칭을 바꿀경우 혼란이 올 수 있음.
						 * */
						/*if(this.calendar.defaultCalendar === true){
							return GO.i18n(lang.cal_default_name, { "username": this.calendar.owner.name }) +
							"("+this.calendar.owner.name+")";
						}else{*/
							return this.calendar.name + "(" +this.calendar.owner.name+ ")";
						//}
					},
					lang:lang,
					companyCal : companyCal.toJSON(),
					myCal : myCal,
					checkState:checkState,
					isDefaultCalendar : isDefaultCalendar,
					//내일정
					myCalName : function(){
						if(this.defaultCalendar === true){
							return lang.cal_default +" "+ this.name;
						}else{
							return this.name;
						}
					}
				}));
				this.$el.find('input:checkbox[data-type="all"]').attr('data-calendarid',this.feedsId);
				this.setSideApp();
				this.setCheckboxProperty();
				deferred.resolveWith(this, [this]);
				return deferred;
			},
			setSideApp : function() {
				$('body').data('sideApp', this.packageName);
			},
			setCheckboxProperty: function () {
				var self = this;
				_.each(this.checkedCalendarIds, function (calId) {
					var checkedId = self.$el.find('input:checkbox[data-calendarid="' + calId + '"]');
					checkedId.prop("checked", true);
				});
				this.setAllFeedCheckBoxProperty();
			}
		}, {
            __instance__: null,
            create: function(packageName) {
                /*if(this.__instance__ === null)*/ this.__instance__ = new this.prototype.constructor({'packageName':packageName});
                return this.__instance__;
            }
        });

		return SideView;
	});
}).call(this);