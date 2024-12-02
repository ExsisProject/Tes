;(function() {    
    define([
        "backbone", 
        "app", 
        "hogan", 
        "when", 
        "when/sequence", 
        "calendar/collections/calendars", 
        "calendar/collections/calendar_feeds", 
        "calendar/helpers/side_lnb", 
        "calendar/views/color_picker",
        "calendar/libs/util", 
        "text!calendar/templates/side.html",
        "text!calendar/templates/_side_nullguide.html", 
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar",
        "go-ignoreduplicatemethod",

        "jquery.go-popup",
        "jquery.go-orgslide"

	], 
    function(
        Backbone, 
        GO, 
        Hogan, 
        when, 
        whenSequence, 
        Calendars, 
        CalendarFeeds, 
        SideLnbHelper, 
        ColorPicker, 
        CalUtil, 
        SideTpl, 
        NullGuideTpl,
        commonLang, 
        calLang, 
        GODuplicateIgnoreMethod
    ) {
        var // 상수 정의
            FEED_STATE = GO.constant("calendar", "FEED_STATE"), 
            // 사이드 메뉴의 타입(내일정 / 구독캘린더)
            SIDE_TYPE = GO.constant("calendar", "SIDE_TYPE");
            
        var compiledSideTpl = Hogan.compile(SideTpl), 
            compiledNullGuideTpl = Hogan.compile(NullGuideTpl), 
            tvars = {
        		"context_root": GO.config("contextRoot"), 
                "regist_event_url": GO.config("contextRoot") + "app/calendar/regist", 
                "use_org?": GO.session("useOrg"), 
                "label": {
                	"calendar": commonLang["캘린더"], 
                    "new_event": calLang["일정 등록"], 
                    "waiting": calLang["신청대기"], 
                    "add_all_staff": calLang["우리 부서원 모두 추가"], 
                    "add_staff": calLang["관심 캘린더 추가"], 
                    "modify": calLang["수정완료"], 
                    "cancel": commonLang["취소"],
                    "my_calendar_config" : commonLang["내 캘린더 관리"],
                    "color_config" : commonLang["색상 변경"],
                    "edit" : commonLang["수정"], 
                    "following": calLang["관심 캘린더"], 
                    "edit_following": calLang["관심 캘린더 편집"],
                    "edit_my_calendar": calLang["내 캘린더 편집"],
                    "unfold": commonLang["접기"],
                    "my_calendar": calLang["내 캘린더"],
                    "setting": calLang["캘린더 환경설정"]
                }, 
                "msg": {
                    "no_feeds": calLang["관심 캘린더 없음 메시지"]
                },
                "isOrgServiceOn" : GO.session("useOrg"),
				"appName" : GO.util.getAppName("calendar")
            };

        var ActionQueue = (function() {
            var constructor = function() {
                this.__index__ = 0;
                this.__queue__ = {};
            };

            constructor.prototype = {
                get: function(index) {
                    return typeof index === 'undefined' ? _.reject(this.__queue__, function(q) {
                    	return !q;
                    }) : this.__queue__[index];
                }, 
                
                last: function() {
                    return this.__queue__[this.__index__];
                }, 
                
                placeholder: function() {
                    return this.add(null);
                }, 

                add: function(data) {
                    this.__queue__[++this.__index__] = $.extend( true,  { index: this.__index__ }, data );
                    return this.__index__;
                }, 
                
                update: function(index, data) {
                    if(this.__queue__.hasOwnProperty(index)) {
                        this.__queue__[index] = $.extend( true,  this.__queue__[index], data );
                    }
                    return this;
                }, 

                remove: function(index) {
                    delete this.__queue__[index];
                    return this;
                }, 

                clear: function() {
                    this.__queue__ = {};
                }, 
                
                count: function() {
                    return _.toArray(this.__queue__).length;
                }, 
                
                groupByAction: function() {
                	return _.groupBy(this.get(), function(q) {
                		return q.action;
                	}, this);
                }
            };

            return constructor;
        })();

        var SideView = Backbone.View.extend({
            feeds: [], 
            
            mainView: null, 

            /**
            인스턴스 초기화
            TODO: 리팩토링 필요

            @method initialize
            */ 
            initialize: function(options) {
                var self = this;
                
                console.log("[SideView#initialize] initializing...");
                this.calendars = options.calendars;
                this.feeds = options.feeds;
                this.mainView = options.mainView;
                
                this.actionQueues = {};
                
                this.checkedCals = CalUtil.getSavedSelectedCalendar();
                
                // GO-18903 신규로 추가된 전사 캘린더 체크박스 체크되도록 설정
                if(!_.isUndefined(this.checkedCals)){
                    var newCalendarIds = this.calendars.getNewCompanyCalendarIds();
                    if(newCalendarIds.length != 0){
                        this.checkedCals = this.checkedCals + "," + this.calendars.getNewCompanyCalendarIds().join(",");
                        CalUtil.saveCheckedCalendar(this.checkedCals.split(","));
                    }
                }
                // GO-18903
                
                this._prepareTemplate();
                
                this.loadMyCalendars();
                this.reloadFeeds(this.$el);
                this._saveCheckedCalendar();

                // add와 update는 sync 이벤트로 처리 가능...
                this.listenTo(this.calendars, "sync", this.reloadMyCalendars);
                this.listenTo(this.calendars, "remove", this.reloadMyCalendars);
                this.listenTo(this.calendars, "sort", this.reloadMyCalendars);
                this.listenTo(this.feeds, "remove", this.reloadFeeds);
                this.listenTo(this.feeds, "sort", this.reloadFeeds);
                
                // TODO: 이벤트 바인딩 부분 리팩토링 필요
                $(document).off("req:checked-feeds.calendar-side").on("req:checked-feeds.calendar-side", function() {
                	$(document).trigger( "res:checked-feeds", [self.getCheckedFeeds()] );
                });
            }, 
            
            /**
            뷰 렌더링

            @method render
            @chainable
            */ 
            render: function() {                
                return this;
            }, 
            
            loadMyCalendars: function() {
            	var list = this.$el.find('#my-calendar > ul.side_depth');
            	var isHide = list.is(":hidden");
            	list.remove();
            	this.$el.find('#my-calendar > div.list_action').remove();
            	this.$el.find('#my-calendar').append(this._buildMyCalendars());
            	this.$el.find('#my-calendar > ul.side_depth').toggle(!isHide);
            	this._setFoldStateForMyCalendar();
            }, 
            
            /**
			내 캘린더 목록 펼침상태 지정

            @method _setFoldStateForMyCalendar
            @chainable
            @private
            */ 
            _setFoldStateForMyCalendar: function() {
                var folderState = CalUtil.getSavedCalendarFoldState();
        
                if(folderState === 'Y') {
                    this._foldLnb($('#my-calendar'), false);
                } else {
                    this._unfoldLnb($('#my-calendar'), false);
                }
                
                return this;
            },

            _toggleFoldState: function(e) {
                var $target = $(e.currentTarget);
                var $section = $target.closest("section.lnb");
                if ($target.closest("h1").hasClass("folded")) {
                    this._unfoldLnb($section);
                } else {
                    this._foldLnb($section);
                }
            },
            
            reloadMyCalendars: function(args) {
            	this.checkedCals = CalUtil.getSavedSelectedCalendar();
            	this.loadMyCalendars();
            	this._setCheckedCalendars(this.$el.find('#my-calendar'));
            }, 
            
            /**
            구독목록 로딩

            @method loadFeeds
            */ 
            loadFeeds: function() {
                this.$el.find('#feed-list > ul.side_depth').remove();
                this.$el.find('#feed-list > div.null_guide').remove();
                this.$el.find('#feed-list > div.list_action').remove();

                this.$el.find('#feed-list').append(this._buildFeeds());
                
                this._toggleFeedActionButtons();
                this._setFoldStateForFeeds();
                this._setScrollForFeeds();
            }, 
            
            reloadFeeds: function(targetEl) {
                this.loadFeeds();
                this._setCheckedCalendars(targetEl);
                this._setCheckedAllFeed();
            },
            
            _setCheckedCalendars: function($el) {
            	$el = $el || this.$el.find('#feed-list');

            	if(!this.checkedCals) {
                    this._saveCheckedCalendar();
                } else {
                    var checkedCals = this.checkedCals.split(',');
                    $el.find("input[type=checkbox][name=calendar_id]").each($.proxy(function(i, elem) {
                        var $elem = $(elem);
                        if( _.contains(checkedCals, $(elem).val()) && !$(elem).is(":disabled")) {
                            $elem.prop("checked", true);
                        }
                    }, this));
                }
            }, 
            
            /**
            이벤트 바인딩
            @method delegateEvents
            */ 
            delegateEvents: function(events) {
                var self = this;
                console.log("[SideView#delegateEvents] called...");
                Backbone.View.prototype.delegateEvents.call(this, events);
                this.undelegateEvents();
                this.$el.on("click.calendar-side", ".ic_list_reorder", $.proxy(this._changeEditMode, this));
                this.$el.on("click.calendar-side", ".ic_cancel", $.proxy(this._cancelEdit, this));
                this.$el.on("click.calendar-side", ".ic_hide_up", $.proxy(this._toggleFoldState, this));
                this.$el.on("click.calendar-side", "h1.opened span.txt", $.proxy(this._toggleFoldState, this));
                this.$el.on("changed:chip-color.calendar-side", ".chip", $.proxy(this._bindChagnedCalendarColor, this));
                this.$el.on("click.calendar-side", "input[type='checkbox'][name='calendar_id']:not(':disabled')", $.proxy(this._checkToggleCalendar, this));
                this.$el.on("click.calendar-side", ".ic_list_del, .cancel_following", $.proxy(this._removeCalendar, this));
                this.$el.on("click.calendar-side", ".ic_done", $.proxy(this._requestModify, this));
                
                this.$el.on("click.calendar-side", ".mycalendar span.chip:not([data-unchangable])", $.proxy(this._toggleColorPickerByCalendar, this));
                this.$el.on("click.calendar-side", "#my-calendar .add-calendar-btn", $.proxy(this._addCalendar, this));                
                
                this.$el.on("click.calendar-side", "#feed-list span.chip", $.proxy(this._toggleColorPickerByFeed, this));
                this.$el.on("click.calendar-side", "#feed-list input[name=check_all]", $.proxy(this._toggleCheckAllFeeds, this));
                this.$el.on("click.calendar-side", "#add-allstaff-btn", $.proxy(this._addFeedsForMyDepts, this));
                this.$el.on("click.calendar-side", "#feed-list .add-follow-btn", $.proxy(this._addFollow, this));
                
                this.$el.on("click.calendar-side", "#lnb-preference", $.proxy(this._goToPreference, this));
                
                // 캘린더 피드 컬렉션의 reset 이벤트가 언젠가부터 먹질 않는다...
                $(document).on("reload:calendar-feeds.calendar-side", $.proxy(function(e) {
                    this.reloadFeeds();
                    this._setCheckedAllFeed();
                    e.stopPropagation();
                }, this));
                
                $(document).on("removed:calendar-feeds.calendar-side", $.proxy(function(e) {
                	this.reloadFeeds();
                	this._saveCheckedCalendar();
                	this._setCheckedAllFeed();
                	e.stopPropagation();
                }, this));
                
                var winResizer = new GODuplicateIgnoreMethod();
                $(window).on( "resize.calendar-side", function(e) {
                    winResizer.bind(function() {
                    	console.log("resize.calendar-side");
                        self._setScrollForFeeds();
                    });
                });
                
                return this;
            }, 
            
            /**
            이벤트 언바인딩

            @method undelegateEvents
            */ 
            undelegateEvents: function() {
                Backbone.View.prototype.undelegateEvents.call(this);
                this.$el.off(".calendar-side");
                $(window).off(".calendar-side");
                $(document).off(".calendar-side");
                this.$el.find(".chip").off("changed:calendar-color");
                
                if(GO.session("useOrg")) {
                    this.stopListening(this.feeds);
                }
                
                return this;
            }, 
            
            /**
            체크된 캘린더의 ID 반환(Deprecated)

            @method getCheckedCalendarIds
            @return {Array} ID 배열
            */ 
            getCheckedCalendarIds: function() {
                return _.pluck(this.getCheckedCalendars(), 'id');
            },
            
            getCheckedCalendars: function() {
                var calendars = []; 
                _.each(this.calendars.getHolidayCalendars(), function(cal, i) {
                    calendars.push({id: cal.id, name: "holiday", type: "holiday"});
                });
                this.$el.find("input[type=checkbox][name=calendar_id]:checked").each(function(i, element) {
                    var $element = $(element);
                    calendars.push({id: $element.val(), name: $element.attr("data-name"), type: $element.attr("data-type")});
                });
                return calendars;
            }, 
            
            getCheckedFeeds: function() {
                var checkedCals = this.getCheckedCalendars(), 
                    checkedFeeds = [];
                
                _.each( checkedCals, function( cal ) {
                    if(cal.type === "feed") {
                        checkedFeeds.push(this.feeds.findByCalendarId(cal.id)[0].toJSON());
                    }
                }, this);
                
                return checkedFeeds;
            }, 
                        
            uncheckAll: function() {
                this.$el.find("input[type=checkbox][name=calendar_id]:checked").prop("checked", false);
            }, 
            
            saveCheckedCalendar: function() {
                this._saveCheckedCalendar();
            }, 
            
            /**
            구독중인 캘린더인지 여부 반환

            @method isFollowing
            @param {Integer} calendarId 캘린더 고유 ID
            @return {boolean} 구독중인 캘린더인지 여부
            */
            isFollowing: function(calendarId) {
                return this.feeds.isFollowing(calendarId);
            }, 

            /**
            접근가능 캘린더 여부 반환

            @method isAccessible
            @param {Integer} calendarId 캘린더 고유 ID
            @return {boolean} 구독중인 캘린더인지 여부
            */
            isAccessible: function(calendarId) {
                return this.feeds.isAccessible(calendarId);
            }, 
            
            /**
            관심동료 목록 펼침상태 지정

            @method _setFoldStateForFeeds
            @chainable
            @private
            */ 
            _setFoldStateForFeeds: function() {
                var folderState = CalUtil.getSavedFeedFoldState();
        
                if( this._hasFeeds() ) {
                    if(!folderState) {
                        CalUtil.saveSideFoldState( 'feed', false );
                    }
                    
                    if(folderState === 'Y') {
                        this._foldLnb($('#feed-list'), false);
                    } else {
                        this._unfoldLnb($('#feed-list'), false);
                    }
                } else if(!!folderState) {
                	CalUtil.saveSideFoldState( 'feed', false );
                }
                
                return this;
            }, 
            
            /**
            관심동료 액션버튼 노출 지정

            @method _toggleFeedActionButtons
            @chainable
            @private
            */ 
            _toggleFeedActionButtons: function() {
                var feedHeaderBtnWrap = this.$el.find("#feed-list > h1 > .btn_wrap");
                
                if( this._hasFeeds() ) {
                    if( feedHeaderBtnWrap.is(":visible") || feedHeaderBtnWrap.css("display") === 'none' ) {
                        feedHeaderBtnWrap.show();
                    }
                } else {
                    feedHeaderBtnWrap.hide();
                }
                
                return this;
            }, 
                                    
            /**
            내 캘린더/구독목록 수정모드 변경

            @method _changeEditMode
            @return {$.Event}
            @private
            */
            _changeEditMode: function(e) {
                var $section = $(e.currentTarget).closest('section.lnb'),
                    listType = $section.data('type'), 
                    title = {"calendar": calLang["내 캘린더 편집"], "feed": calLang["관심 캘린더 편집"]}[listType], 
                    queueIndex = null, actionQueue;
                
                actionQueue = this._getActionQueue(listType);
                
                this._unfoldLnb();
                $section.find("h1 > span.txt").text(title);
                $section.find(".cb-check-all").hide();
                $section.addClass("lnb_edit");
                $section.find(".normalmode").hide();
                $section.find(".editmode:not([data-lazyshow])").show();
                
                $section.sortable({
                    items: "li:not(.ui-state-disabled)", 
                    axis: "y", 
                    start: function(event, ui) {
                        var lastQueue = actionQueue.last();
                        
                        $(ui.helper).addClass("move");
                        
                        // 바로 이전 큐가 sort이면 해당 큐를 그대로 이용해서 네트워크 요청수를 줄인다.
                        if( lastQueue && lastQueue.action === 'sort' ) {
                            queueIndex = lastQueue.index;
                        } else {
                            queueIndex = actionQueue.placeholder();
                        }
                    }, 
                    stop: function(event, ui) {
                        var sortedIds = [];
                        $section.find("li:not(.ui-state-disabled)").each(function(i, elem) {
                            sortedIds.push($(elem).data("id"));
                        });                        
                        actionQueue.update(queueIndex, { "ids": sortedIds, "action": 'sort'});
                        $(ui.item).removeClass("move");
                    }
                });
                $section.disableSelection();
                
                return this;
            }, 

            /**
            내 캘린더/구독목록 일반 모드 변경

            @method _changeNormalMode
            @return {$.Event}
            @private
            */
            _changeNormalMode: function(e) {
                var $section = $(e.currentTarget).closest('section.lnb'), 
                	listType = $section.data('type'), 
                	title = {"calendar": calLang["내 캘린더"], "feed": calLang["관심 캘린더"]}[listType], 
                	reloadFn = {"calendar": this.reloadMyCalendars, "feed": this.reloadFeeds}[listType];
                
                this._clearActionQueue(listType);
                
                $section.find("h1 > span.txt").text(title);
                $section.removeClass("lnb_edit");
                $section.find(".normalmode").show();
                $section.find(".editmode").hide();
                
                $section.sortable( "destroy" );
                $section.enableSelection();
                
                this.render();
                
                reloadFn.call(this);
                
                return this;
            }, 
            
            _getActionQueue: function(type) {
            	if(!this.actionQueues[type]) {
            		this.actionQueues[type] = new ActionQueue();
            	}
            	
            	return this.actionQueues[type];
            }, 
            
            _clearActionQueue: function(type) {
            	if(this.actionQueues[type]) {
            		this.actionQueues[type].clear();
            	}
            }, 
            
            _requestModify: function(e) {
            	var self = this, 
            		sectionType = $(e.currentTarget).closest('section.lnb').data('type');
            	
            	e.preventDefault();
            	processBatchAction.call(this, sectionType).then(function() {
            		self._changeNormalMode(e);
            	});
            }, 

            /**
            구독목록 수정취소

            @method _cancelEdit
            @return {$.Event}
            @chainable
            @private
            */
            _cancelEdit: function(e) {
                this._changeNormalMode(e);
                return this;
            }, 
            
            /**
            캘린더 삭제 액션 처리

            @method _removeCalendar
            @private
            */
            _removeCalendar: function(e) {
            	var $target = $(e.currentTarget), 
            		$li = $target.closest('li'),
            		sectionType = $target.closest('section.lnb').data('type'), 
            		queue = this._getActionQueue(sectionType), 
            		lastQueue = queue.last();
            	
            	// 바로 이전 큐가 remove이면 해당 큐를 그대로 이용해서 네트워크 요청수를 줄인다.
                if( lastQueue && lastQueue.action === 'remove' ) {
                	var removedIds = _.isArray(lastQueue.ids) ? lastQueue.ids: [lastQueue.ids], 
                		removedElements = _.isArray(lastQueue.elements) ? lastQueue.elements : [lastQueue.elements]; 
                	
                	removedIds.push($li.attr("data-id"));
                	removedElements.push($li);
                	queue.update(lastQueue.index, {"ids": removedIds, "elements": removedElements});
                } else {
                    queue.add({"ids": [$li.attr("data-id")], action: 'remove', "elements": [$li]});
                }
            		
            	$li.remove();
            }, 
            
            /**
            우리 부서원 모두 피드목록으로 추가

            @method _addFeedsForMyDepts
            @param {$.Event}
            @private
            @chainable
            */
            _addFeedsForMyDepts: function(e) {
                var self = this, 
                    url = [GO.config("contextRoot"), "api/calendar/feed/department?userId=", GO.session("id")].join("");

                $.ajax(url, {type:"POST"}).done(function(resp) {
                    if( resp.data && resp.data.length > 0 ) {
                        self.feeds.reset(resp.data);
                        CalUtil.triggerReloadFeeds();
                    } else {
                    	$.goSlideMessage(calLang["공개 캘린더 없음 메시지"]);
                    }
                });
                return this;
            }, 

            _addFollow: function(e) {
                return $.goOrgSlide({
                    header : calLang["관심 캘린더 추가"],
                    type: 'list', 
                    desc : calLang["관심 캘린더로 추가할 사용자를 아래에서 선택하세요"],
                    contextRoot : GO.config("contextRoot"),
                    memberTypeLabel : calLang["관심 캘린더"],
                    externalLang : commonLang,
					isBatchAdd : true,
                    callback : $.proxy(function(info) {
                    	var datas = _.isArray(info) ? info : [info];
                    	var ids = _.map(datas, function(data) {
                    		return data.id;
                    	});

                        if (GO.session().id == ids[0]) {
                            $.goSlideMessage(calLang["공개 캘린더 없음 메시지"]);
                            return
                        }
                        
                    	var filtedIds = _.reject(ids, function(id) {
                    		return id == GO.session().id;
                    	});

                    	var totalIds = this.feeds.length + filtedIds.length;
                    	if (totalIds > 50) {
                    		$.goSlideMessage(calLang["관심 캘린더 50개까지만 추가 가능 문구"]);
                    		return;
                    	}
                    	
                        var self = this, 
                            url = [GO.config("contextRoot"), "api/calendar/user/feed"].join("");
                        
                        $.ajax(url, {
                        	type:"POST",
                        	data : JSON.stringify({ids : filtedIds}),
                        	contentType : "application/json"
                		}).done(function(resp) {
                            if( resp.data && resp.data.length > 0 ) {
                                self.feeds.add(resp.data);
                                CalUtil.triggerReloadFeeds();
                            } else {
                                $.goSlideMessage(calLang["공개 캘린더 없음 메시지"]);
                            }
                        });
                    }, this)
                });
            }, 
            
            _addCalendar: function(e) {
            	var $el = $(e.currentTarget), 
            		targetOffset = $el.offset();
            	
            	require(["calendar/views/add_mycal_popup"], _.bind(function(popup) {
            		var popupOffset = {
        				"left": targetOffset.left + $el.outerWidth() + 5, 
        				"top" : targetOffset.top - 5
            		};
            		
            		popup({ offset: popupOffset }).then(_.bind(function(model) {
            			this.calendars.add(model);
            		}, this));
            	}, this));
            }, 
            
            /**
            템플릿 준비

            @method _prepareTemplate
            @return {String} HTML 문자열
            @private
            */ 
            _prepareTemplate: function() {
                var html = compiledSideTpl.render(tvars, this._buildPartials());
                this.$el.empty().html(html);
            }, 

            /**
            내 캘린더 설정으로 이동

            @method _goToPreference
            @param {$.Event} jQuery Event 객체 
            @private
            @chainable
            */ 
            _goToPreference: function(e) {
                var calendarId = this._getCalendarIdFromCheckbox(e.currentTarget);
                GO.router.navigate(["calendar", calendarId, "preference"].join("/"), {trigger:true, pushState: true});
                return this;
            }, 

            /**
            구독 목록을 가지고 있는가?

            @method _hasFeeds
            @return {Boolean} 구독목록 여부 반환
            @private
            @chainable
            */ 
            _hasFeeds: function() {
                return !!(this.feeds.length > 0);
            }, 

            /**
            Partial View 생성

            @method _buildPartials
            @return {Object} Partial View 목록
            @private
            */ 
            _buildPartials: function() {
                return {
                    "company_calendar": this._buildCompanyCalendars()
                };
            }, 

            _buildMyCalendars: function() {
                var lnbHelper = new SideLnbHelper(this.calendars.getMyCalendars()), 
                	sbuff = [], 
                	compiledTpl;
                
                lnbHelper.setItemVars(function(helper, model) {
                	var title = buildMyCalendarName(model), 
                    checked = !this.checkedCals;
                    
                    helper.setLabel(title);
                    helper.setClassnames('default');
                    helper.useCheckbox('calendar_id', model.id, false, checked, {
                        "data-name": title, 
                        "data-type": "my"
                    });
                    helper.addButton(null, "normalmode chip bgcolor" + model.color, "title='"+commonLang["색상 변경"]+"'");
                    
                    if(!model.defaultCalendar) {
                    	helper.addButton(null, "ic_side ic_list_del editmode remove_following", 'style="display:none" title="'+commonLang["삭제"]+'"');
                    }
                    
                }, this);
                
                compiledTpl = Hogan.compile(lnbHelper.render());
                
                sbuff.push(compiledTpl.render(tvars));
                sbuff.push(addListActionButtons('add-calendar-btn', calLang["내 캘린더 추가"]));
                
                return sbuff.join("\n");
            }, 

            _buildCompanyCalendars: function() {
                var lnbHelper = new SideLnbHelper(this.calendars.getCompanyCalendars()), 
                    checked = !this.checkedCals;
                
                lnbHelper.setItemVars(function(helper, model) {
                    var title = model.name;
                    helper.setLabel(title);
                    helper.setClassnames('default');
                    helper.useCheckbox('calendar_id', model.id, false, checked, {
                        "data-name": title, 
                        "data-type": "company"
                    });
                    helper.addButton(null, "chip bgcolor" + model.color);
                });
                return Hogan.compile(lnbHelper.render());
            }, 

            _buildFeeds: function() {
                var sbuff = [];
                
                if(this._hasFeeds()) {
                    var lnbHelper = new SideLnbHelper(this.feeds.toJSON(), { "useCheckAll": true, "display": "none" });
                    lnbHelper.setItemVars(function(helper, model) {
                        var checkDisabled = false, 
                        	calendarInfo = model.calendar, 
                        	username = calendarInfo.owner.name, 
                        	title = buildFeedName(username, calendarInfo.name);
                        
                        if(model.state === FEED_STATE.following) {
                            helper.setClassnames('star');
                            helper.addButton(null, "normalmode chip bgcolor" + model.color, 'title="'+calLang["색상 변경"]+'"');
                            helper.addButton(null, "ic_side ic_list_del editmode remove_following", 'style="display:none" title="'+commonLang["삭제"]+'"');
                        } else {
                            checkDisabled = true;
                            helper.setClassnames('star_waiting');
                            helper.addTag(calLang["신청대기"], "btn_state_disable normalmode");
                            helper.addButton(calLang["신청취소"], "btn_side3 editmode cancel_following", 'style="display:none"');
                        }

                        helper.setLabel(title);
                        helper.useCheckbox('calendar_id', model.calendar.id, checkDisabled, false, {
                            "data-feedid": model.id, 
                            "data-name": title, 
                            "data-type": "feed"
                        });
                    });
                    
                    var compiledTpl = Hogan.compile(lnbHelper.render());
                    sbuff.push(compiledTpl.render(tvars));
                    sbuff.push(addListActionButtons('add-follow-btn', calLang["관심 캘린더 추가"]));
                } else {
                    sbuff.push(compiledNullGuideTpl.render(tvars));
                }
                
                return sbuff.join("");
            }, 

            _getSideFeedsElement: function() {
                return this.$el.find("#feed-list");
            }, 

            _toggleColorPickerByCalendar: function(e) {
                console.log("[SideView#toggleColorPickerByMyCalendar] toggled color picker");
                ColorPicker.show(e.target, 'calendar');
            }, 

            _toggleColorPickerByFeed: function(e) {
                console.log("[SideView#_toggleColorPickerByFeed] toggled color picker");
                ColorPicker.show(e.target, 'feed');
            }, 

            _checkToggleCalendar: function(e) {
                console.log("[SideView#_checkToggleCalendar] triggered event");
                var $target = $(e instanceof $.Event ? e.currentTarget : e),
                    calId = $target.val(), 
                    calName = $target.attr("data-name"), 
                    calType = $target.attr("data-type"),
                    isChecked = $target.is(':checked'), 
                    eventType = isChecked ? 'show' : 'hide';
                
                this._saveCheckedCalendar();
                this.checkedCals = CalUtil.getSavedSelectedCalendar();

                this._triggerEventToggle(eventType, calId, calName, calType);

                this._setCheckedAllFeed();
            }, 
            
            _triggerEventToggle: function(eventType, calId, calName, calType) {            	
            	return requestFetchEvent(eventType, [{ id: calId, name: calName, type: calType }]);
            }, 
            
            _saveCheckedCalendar: function() {
                CalUtil.saveCheckedCalendar(this.getCheckedCalendarIds());
            }, 

            _bindChagnedCalendarColor: function(e, code, type) {
                console.log("[SideView#_bindChagnedCalendarColor] called function");
                var self = this, 
                    target = e.target, 
                    feedOrCalId = this._getCalendarOrFeedId(e.target), 
                    collection = this._getCollectionBySideType(type), 
                    model = collection.get(feedOrCalId), 
                    calendarId = this._getCalendarIdFromCheckbox(e.target);

                model.save({"color": code}, {
                    success: function(pmodel) {
                        var newCode = pmodel.get("color");
                        // 캘린더 .chip 색상을 변경한다.
                        self._resetCalendarColor(target, newCode);
                        // 색상변경 이벤트를 캘린더 UI에 전달
                        $(document).trigger('changed:calendar-color', [calendarId, newCode]);
                    }
                });
            }, 

            _getCollectionBySideType: function(type) {
                var temp = {};
                temp[SIDE_TYPE.calendar] = this.calendars;
                temp[SIDE_TYPE.feed] = this.feeds;
                return temp[type];
            }, 

            _resetCalendarColor: function(target, newCode) {
                $(target).attr("class", "");
                $(target).addClass("chip");
                $(target).addClass("bgcolor" + newCode);
                return this;
            }, 
            
            /**
            피드 전체선택 체크박스 체크여부 결정

            @method _setCheckedAll
            @private
            */ 
            _setCheckedAllFeed: function() {
                var feedList = $("#feed-list");
                // 피드가 모두 체크되어 있으면 전체 체크박스에 체크
                if(!feedList.find(".star input[type=checkbox][name=calendar_id]:not(:checked)").length) {
                    feedList.find("input[name=check_all]").prop("checked", true);
                } else {
                    feedList.find("input[name=check_all]").prop("checked", false);
                }
            }, 
            
            /**
            관심동료 목록 접기

            @method _foldLnb
            @private
            */ 
            _foldLnb: function(el, effect) {
                var $section = (el instanceof $.Event) ? $(el.currentTarget).closest('section.lnb') : $(el), 
                	listType = $section.data('type'), 
                    useEffect = (typeof(effect) === 'undefined' ? true: effect), 
                    fn = useEffect ? "slideUp" : "hide";
                
                if($section.find("ul.side_depth").is(":visible")) {
                    $.prototype[fn].call($section.find("ul.side_depth"), "fast", $.proxy(function() {
                    	
						this._setScrollForFeeds();
						
                        CalUtil.saveSideFoldState( listType, true );
                        
                        $section
                            .find(".ic_hide_up")
                            .attr("title", commonLang["펼치기"]);
                    }, this));
                }
                
                $section
                    .find("h1")
                    .addClass("folded");
            }, 
            
            /**
            관심동료 목록 펼치기

            @method _unfoldLnb
            @private
            */ 
            _unfoldLnb: function(el, effect) {
                var $section = (el instanceof $.Event) ? $(el.currentTarget).closest('section.lnb') : $(el), 
                	listType = $section.data('type'), 
                    useEffect = (typeof(effect) === 'undefined' ? true: effect), 
                    fn = useEffect ? "slideDown" : "show";
                
                if($section.find("ul.side_depth").is(":hidden")) {
                    $.prototype[fn].call($section.find("ul.side_depth"), "fast", $.proxy(function() {
                    	
                    	this._setScrollForFeeds();
                    	
                        CalUtil.saveSideFoldState( listType, false );

                        $section
                            .find(".ic_hide_up")
                            .attr("title", commonLang["접기"]);
                    }, this));
                }
                
                $section
                    .find("h1")
                    .removeClass("folded")
            }, 
            
            _toggleCheckAllFeeds: function(e) {
                var result, eventType;
                
                if($(e.currentTarget).is(":checked")) {
                    result = this._checkAllFeed();
                    eventType = 'show';
                } else {
                    result = this._uncheckAllFeed();
                    eventType = 'hide';
                }
                
                this._saveCheckedCalendar();
                this.checkedCals = CalUtil.getSavedSelectedCalendar();
                requestFetchEvent(eventType, result);
            }, 
            
            _checkAllFeed: function() {
                var results = [];
                
                $("#feed-list").find("input[type=checkbox][name=calendar_id]:not(:checked, :disabled)").each(function(i, el) {
                    results.push( setCheckedFeed(this, true) );
                });
                
                return results;
            }, 
            
            _uncheckAllFeed: function() {
                var results = [];
                $("#feed-list").find("input[type=checkbox][name=calendar_id]:checked").each(function(i, el) {
                    results.push( setCheckedFeed(this, false) );
                });
                
                return results;
            }, 
            
            _setScrollForFeeds: function() {
                setTimeout(function() {
            		var feedListHeight = $("#feed-list").outerHeight();
                    // 피드목록이 펼쳐진 상태만 적용한다.
                    if(isVisibleFeedList()) {
                        var docHeight = $(window).height(), 
                            headerHeight = (GO.isAdvancedTheme()) ? 0 : $("header.go_header").outerHeight(),
                            orgUnfoldHeight = (GO.isAdvancedTheme()) ? 0 : 85,
                            maxHeight = docHeight - headerHeight - orgUnfoldHeight;
                        
                        $("#side > section:not([id='feed-list'])").each(function() {
                            maxHeight -= $(this).outerHeight();
                        });
                        
                        setWrapScrollForFeed( maxHeight );
                    } else {
                    	setWrapScrollForFeed( feedListHeight );
                    }
            	}, 300);
                
                return this;
            }, 

            _getCalendarOrFeedId: function(target) {
                return $(target).parent().parent().parent().attr('data-id');
            }, 

            _getCalendarIdFromCheckbox: function(target) {
                return $(target).parent().parent().find("input[name='calendar_id']").val();
            }
        });
        
		function isVisibleFeedList() {
        	return (
    			$("#feed-list > .null_guide").length > 0 || 
    			$("#feed-list > ul.side_depth").length > 0 && 
    			$("#feed-list > ul.side_depth").is(":visible")
			);
        }
		
        function processBatchAction(sectionType) {
	    	var self = this, 
	     		queue = this._getActionQueue(sectionType),
	            tasks = queue.get(), 
	            collection = getTypedCollection.call(this, sectionType), 
	            reqCommands = [];
	     	
	     	_.each(tasks, function(task){
	     		reqCommands.push(function() {
	     			var commandFunc = {"sort": createSortCommand, "remove": createRemoveCommand}[task.action];
		     		return commandFunc.call(self, sectionType, task.ids);
	     		});
	     	}, this);
	     	
	     	return whenSequence(reqCommands).then(function success() {
	     		var grouped = queue.groupByAction();
	     		
	     		if(grouped['remove']) {
	     			var removedCalendars = [];
	     			_.each(grouped['remove'], function(q) {
	     				removedCalendars.concat(buildRemovedCalendars(q.elements));
	     			});
	     			requestFetchEvent('hide', removedCalendars);
	     			self._saveCheckedCalendar();
	     		}
	     		
	     		// batch로 처리한 후 reset 호출해서, 관련된 뷰에 대한 갱신처리를 할 수 있도록 한다.
	     		// (각 command에서는 silent 모드로 컬렉션 수정/삭제 처리하기 때문)
	     		collection.trigger('reset');
	     		
	     		return when.resolve();
	     	});
	     	
	     	function buildRemovedCalendars(elements) {
	     		var result = [];
	     		_.each(elements, function(el) {
 					var $input = el.find('input[name=calendar_id]');
 					result.push({"id": +$input.val(), "name": $input.data('name'), "type": $input.data('type')})
 				});
	     		
	     		return result;
	     	}
        }
        
        function commonActionCommand(url, method, ids) {
        	var defer = when.defer();
        	
        	ids = _.isArray(ids) ? ids: [ids]; 
        	
        	$.ajax({
            	"url" : url, 
                "type": method, 
                "data": JSON.stringify({ "ids": ids}), 
                "dataType": 'json',
                "contentType": 'application/json'
            }).then(defer.resolve, defer.reject);
        	
        	return defer.promise;
        }
        
        function getTypedCollection(sectionType) {
        	return {"calendar": this.calendars, "feed": this.feeds}[sectionType];
        }
        
        function createRemoveCommand(sectionType, removedIds) {
        	var baseUrl = GO.config('contextRoot') + "api/calendar", 
        		reqUrl = {"calendar": baseUrl, "feed": baseUrl + '/feed'}[sectionType], 
        		collection = getTypedCollection.call(this, sectionType);
        	
        	return commonActionCommand(reqUrl, 'DELETE', removedIds).then(function(resp) {
        		collection.remove(removedIds, {silent: true});
        	});
        }
        
        function createSortCommand(sectionType, sortIds) {
        	var baseUrl = GO.config('contextRoot') + "api/calendar", 
	    		reqUrl = {"calendar": baseUrl + '/move', "feed": baseUrl + '/feed/move'}[sectionType], 
	    		collection = getTypedCollection.call(this, sectionType);
	    	
	    	return commonActionCommand(reqUrl, 'PUT', sortIds).then(function(resp) {
	    		collection.reset(resp.data, {silent: true});
	    	});
        }
        
        function addListActionButtons(id, label) {
        	var sbuff = [];
        	
        	sbuff.push('<div class="list_action normalmode">');
            sbuff.push('<span class="btn_wrap">');
                sbuff.push('<span class="btn_side2 ' + id + '">');
                    sbuff.push(label);
                sbuff.push('</span>');
            sbuff.push('</span>');
            sbuff.push('</div>');
            
            return sbuff.join("\n");
        }
        
        function buildDefaultCalendarName(username) {
        	return GO.i18n(calLang["캘린더 기본이름"], { "username": username });
        }
        
        function buildMyCalendarName(model) {
        	var postfix = model.defaultCalendar ? calLang["기본 캘린더 표시"] : "";
        	return (model.name || buildDefaultCalendarName(GO.session('name'))) + postfix;
        }
        
        function buildFeedName(username, calendarName) {
        	var postfix = "(" + username + ")";
        	return (calendarName || buildDefaultCalendarName(username)) + postfix;
        }

    	function requestFetchEvent(eventType, calendarInfos) {
    		return $(document).trigger(eventType + ':calendar', [calendarInfos]);
    	}
    	
        function setCheckedFeed(el, checked) {
            var $this = $(el);
            $this.prop("checked", checked || false);
            return { id: $this.val(), name: $this.data("name"), type: $this.data("type") };
        }
        
        function setWrapScrollForFeed( maxHeight ) {
        	var $target = $("#feed-list");
        	var minHeight = $target.children("div").hasClass("null_guide") ? 251 : 85;
        	if(maxHeight < minHeight) {
        		maxHeight = minHeight;
        	}
        	var height = Math.min($target.outerHeight(), maxHeight) + 1;
        	$target.parent().height(height);
        	
        	//setWrapScrollForCompanyCalendar(height);
        } 
        
        function setWrapScrollForCompanyCalendar(feedHeight) {
        	var docHeight = $(window).height(), 
	            headerHeight = (GO.isAdvancedTheme()) ? 0 : $("header.go_header").outerHeight(),
	            orgUnfoldHeight = 85,
	            companyCalendarHeight = docHeight - headerHeight - orgUnfoldHeight - feedHeight;
        	
	    	$("#side > section:not([id='company-calendar'])").each(function() {
	    		companyCalendarHeight -= $(this).outerHeight();
	        });
	    	
	    	$("#company-calendar").height(companyCalendarHeight);
	    	$("#company-calendar").css("overflow-y","auto");
        }
        
        return SideView;
    });

}).call(this);