(function() {
    define([
        "jquery", 
        "underscore", 
        "app", 
        "calendar/collections/calendars", 
        "calendar/collections/calendar_feeds", 
        "calendar/views/layouts/default", 
        "calendar/libs/util", 
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar", 
        "go-ignoreduplicatemethod", 
        
        "jquery.go-popup"
    ], 

    function(
        $, 
        _, 
        GO, 
        Calendars, 
        CalendarFeeds, 
        CalendarDefaultLayout, 
        CalUtil, 
        commonLang, 
        calLang, 
        GOIgnoreDuplicateMethod
    ) {
        var // 상수
            __super__ = CalendarDefaultLayout.prototype;


        var CalendarFixedSizeLayout = CalendarDefaultLayout.extend({
            events: _.extend({
                "click ins.calendar_star": "_editFeed"
            }, __super__.events),
            
            initialize: function() {
                console.log("CalendarFixedSizeLayout#initialize");
                __super__.initialize.apply(this, arguments);
            }, 

            // Override
            render: function() {
                var self = this, 
                    deferred = $.Deferred();

                __super__.render.apply(this).done(function(parent) {
                    // 임시... padding-bottom을 0px로 만든다.
                    self.$el.find( '#content' )
                        .css( 'padding-bottom', '0px' )
                        .addClass('go_calendar_list go_renew');
                    
                    // 반드시 여기서 바인딩 해야 한다.
                    self._bindWindowResize();
                    
                    this.setTitle(makeCalendarTagTemplate());
                    deferred.resolveWith(self, [self]);
                });
                return deferred;
            }, 

            delegateEvents: function(events) {
                this.undelegateEvents();
                __super__.delegateEvents.call(this, events);
            }, 
            
            undelegateEvents: function() {
                __super__.undelegateEvents.call(this);
                $(document).off('.fixedsize-layout');
            }, 
            
            resizeContentHeight: function() {                
                var 
                	goBody = this.$el.find('.go_body'), 
                    goBodyHeight = $(window).height(), 
                    minHeight = parseInt(goBody.css('min-height')), 
                    contentTopHeight = this.getContentTopElement().outerHeight(),
                    //초기 로딩시 스크롤바가 생기므로 보정값 넣어 조정
                    fixTopHeight = 3;

                contentTopHeight = contentTopHeight + this.$el.find('.tool_bar').outerHeight();
                if (!GO.isAdvancedTheme()) {
                    this.$el.find('.go_wrap').children(':not(.go_body)').each(function(i, el) {
                        goBodyHeight -= $(el).outerHeight();
                    });
                }

                goBodyHeight = Math.max(minHeight, goBodyHeight);
                
                this.$el.find( '.go_body' ).height( goBodyHeight );
                this.$el.find( '#content' ).height( goBodyHeight );
                this.$el.find( '.content_page' ).height( goBodyHeight - contentTopHeight - fixTopHeight );
            }, 

            /**
            캘린더 UI 영역의 높이 계산

            @method getContentPageHeight
            @return {Integer} 캘린더 UI 영역의 높이
            */
            getContentPageHeight: function() {
                return this.$el.find( '.content_page' ).height();
            }, 

            /**
            윈도우 resize 이벤트 바인딩
            
            @method _bindWindowResize
            @private
            */
            _bindWindowResize: function() {
                var self = this,
                    resizer = new GOIgnoreDuplicateMethod();
                $(window).on('resize.fixedsize-layout', function(e) {
                	if (!$.isWindow(e.target)) return;
                    resizer.bind(function() {
                        self.resizeContentHeight();
                        self.triggerResizeEvent();
                    });
                });
            }, 

            triggerResizeEvent: function() {
                this.trigger("resize:content", this.getContentPageHeight(), this);
            }, 
            
            /**
             * TODO: 리팩토링 필요..
             */
            setCaledarTags: function(calInfo) {
                createCalendarTags(calInfo);
                bindCalendarTagEvent(this.getContentElement());
                
                if(calInfo && calInfo.type === 'user') {
                	this.$el.find('#calendar-tag-base .ic_open').trigger('click');
                }
            }, 
            
            /**
            피드 추가 및 삭제
            
            @method _editFeed
            @private
            @chainable
            */
            _editFeed: function(e) {
                var $target = $(e.currentTarget);
                if($target.hasClass("ic_star_off")) {
                    this._addFeed(e);
                } else {
                    this._removeFeed(e);
                }
                return this;
            }, 
            
            /**
            피드 추가
            
            @method _addFeed
            @return {Object}
            @private
            @chainable
            */
            _addFeed: function(e) {
                var self = this, 
                    $target = $(e.currentTarget), 
                    calendarId = $target.attr("data-id");
                
                Backbone.ajax(this._getCreateFeedUrl(calendarId), {type: 'POST'}).done(function(data) {                    
                    $.goPopup({
                        title : calLang["관심 캘린더로 등록되었습니다"],
                        message : "",
                        modal : true, 
                        buttons : [{
                            'btext' : commonLang["확인"],
                            'btype' : 'confirm',
                        }], 
                        closeCallback: function() {
                        	self._updateCookieForCal(calendarId);
                            GO.router.navigate("calendar", {trigger: true, pushState:true});
                        }
                    });
                });
                return this;
            }, 
            
            /**
            피드 삭제
            
            @method _addFeed
            @return {Object}
            @private
            @chainable
            */
            _removeFeed: function(e) {
                var self = this, 
                	$target = $(e.currentTarget), 
                    feedId = $target.attr("data-id"), 
                    feed = CalendarFeeds.getInstance().get(feedId);
                
                // >>>> TO-DO: 사이드에서도 사용하는 것으로 리팩토링 필요
                $.goConfirm(
                    calLang["관심 캘린더 목록에서 삭제하시겠습니까?"], 
                    calLang["관심 캘린더 해제 알림 메시지"],
                    function() {
                        var url = GO.config("contextRoot") + "api/calendar/feed/" + feedId
                        Backbone.ajax(url, {type: 'DELETE'}).done(function() {
                        	self._removeSavedCalendars(feed.getCalendarId());
                            if(feed.isPrivate()) {
                                GO.router.navigate("calendar", {trigger: true, pushState: false});
                            } else {
                                location.reload();
                            }
                        });
                    }
                );
                return this;
            },
            
            /**
            캘린더를 저장 쿠키에 추가
            
            @method _updateCookieForCal
            @private
            @chainable
            */
            _updateCookieForCal: function(calendarId) {
                var current = CalUtil.getSavedSelectedCalendar().split(",");
                
                current.push(calendarId);
                CalUtil.saveCheckedCalendar(_.uniq(current));
                return this;
            }, 
            
            _removeSavedCalendars: function(calendarIds) {
            	var current = CalUtil.getSavedSelectedCalendar().split(","), 
            		updated;
            	
            	if(!_.isArray(calendarIds)) calendarIds = [calendarIds];
            	
            	calendarIds = _.map(calendarIds, function(calId) {
            		return '' + calId;
            	});
            	
            	updated = _.difference(current, calendarIds || []);
            	CalUtil.saveCheckedCalendar(_.uniq(updated));
            	return this;
            }, 
            
            /**
            피드 추가 요청 URL 반환
            
            @method _getCreateFeedUrl
            @param {Integer} calendarId 캘린더 ID
            @return {String} URL
            @private
            */
            _getCreateFeedUrl: function(calendarId) {
                return GO.config("contextRoot") + "api/calendar/feed?calendarId=" + calendarId;
            }            
        }, {
            /**
            CalendarFixedSizeLayout 싱글톤 객체
            (주의) 반드시 상속후에도 싱글톤 객체는 선언해주어야 한다. 그렇지 않으면 부모의 __instance__를 그대로 사용하게 됨.
            @attribute __instance__
            @type {Object} CalendarFixedSizeLayout 인스턴스 객체
            @required
            **/
            __instance__: null
        });
        
        function makeCalendarTagTemplate() {
        	var html = [];
        	
        	html.push('<span>', calLang["일정목록"], '</span>');
        	html.push('<ul id="calendar-tag-base" class="name_tag calendar_tag"></ul>');
        	
        	return html.join("");
        }
        
        /**
         * TODO: 리팩토링 필요
         * 	- 특정 유저의 일정을 볼때와 내 캘린더 및 피드를 볼때의 tag 처리를 분리...
         */
        function createCalendarTags(calInfo) {
            var calTagEl = $( '#calendar-tag-base' ), 
                checkedEl = $( '#side input[name=calendar_id]:checked' );
            
            calTagEl.empty();
            $('.layer_name_tag').remove();
            
            if(calInfo) {
            	var calType = calInfo.type;
            	
            	if(calType === 'user') {
            		calTagEl.append(makeSelectedCalendarsTag(calInfo.name, 'user', calInfo.userid));
            	} else {
            		createCalTag(calTagEl, calType, calInfo.name, calInfo.id);
            	}
            } else if(checkedEl.length > 1) { 
            	var label = GO.i18n(calLang["캘린더 타이틀 선택 캘린더 메시지"], {"count": checkedEl.length});
                calTagEl.append(makeSelectedCalendarsTag(label));
            } else if(checkedEl.length === 1) {
                $( '#side input[name=calendar_id]:checked' ).each(function( i, elem ) {
                    var $elem = $(elem); 
                    createCalTag(calTagEl, $elem.data('type'), $elem.data('name'), $elem.data('feedid'));
                });
            } 
        }
        
        /**
         * viewtype : my: 내 캘린더와 피드표시, user: 특정사용자 캘린더 표시
         * userid : viewtype이 'user' 일 경우에만 해당됨.
         */
        function makeSelectedCalendarsTag(label, viewtype, userid) {
        	var html = [];
        	
        	// viewtype : my: 내 캘린더와 피드표시, user: 특정사용자 캘린더 표시
        	viewtype = viewtype || 'my';
            
            html.push('<li class="default_option">');
	            html.push('<span class="name">');
	            html.push(label);
	            html.push('</span>');
            html.push('</li>');
            html.push('<li class="desc">')
            	html.push('<span class="btn_wrap">')
            		html.push('<span class="ic_classic ic_open" title="'+ commonLang['자세히 보기'] +'" data-type="'+viewtype+'"'+(userid ? ' data-userid="' + userid + '"': '')+'></span>');
            	html.push('</span>');
            html.push('</li>');
            
            return html.join("\n");
        }
        
        // dataId는 관심동료 추가일 경우 calendarId, 해제일 경우 feedId이다.
        function createCalTag( parent, type, name, dataId ) {
            require(["hgn!calendar/templates/_calendar_tag"], function(Template) {
                var 
                    isMyCal = (type === 'my'), 
                    isFeed = (type === 'feed'), 
                    isUser = (type === 'user'), 
                    tagVars = {
                        "calendar_name": name, 
                        "show_star?": isUser || isFeed, 
                        "follower?" : isFeed, 
                        "title_attr": isFeed ? calLang["관심 캘린더 해제"] : calLang["관심 캘린더 추가"], 
                        "data_id": dataId
                    };
                
                if(isUser) {
                    var feeds = CalendarFeeds.getInstance(), 
                        isFollowing = feeds.isFollowing(dataId);
                    
                    tagVars["follower?"] = isFollowing;
                    // 이미 관심동료일 경우에는 피드 id를 찾아서 넣어준다.
                    tagVars["data_id"] = isFollowing ? feeds.findByCalendarId(dataId)[0].id : dataId;
                }
                
                $(Template(tagVars)).addClass(function() {
                    var cns = [];
                    if(isMyCal) {
                        cns.push('default_option');
                    }

                    return cns.join(' ');
                }).appendTo(parent);
            });
        }
        
        function bindCalendarTagEvent( $parent ) {
            $parent.off('.calendarAppView');
            $(document).off('.calendarAppView');
            
            $parent.on('click.calendarAppView', '#calendar-tag-base .ic_open' ,function(e) {
                var $btn = $(e.currentTarget), 
                	calType = $btn.data('type'), 
                    tagLayer;
                
                tagLayer = createCalendarTagLayer();
                
                if(calType === 'user') {
            		var userCalendars = new Calendars(), 
            			userid = $btn.data('userid');
            		
                	userCalendars.setUserId(userid);
                	userCalendars.fetch({
                		success: function(collection) {
                			collection.each(function(model) {
                				if(model.isMyCalendar()) {
                					var calendarName = model.get('name');
                					
                					if(model.isProtected()) {
                						calendarName += '(' + calLang["수락 후 공개"] + ')';
                					}
                					createCalTag(tagLayer.find('.calendar_tag'), calType, calendarName, model.id);
                				}
                			});
                		} 
                	});
            	} else {
            		var checkedEl = $( '#side input[name=calendar_id]:checked' );
            		checkedEl.each(function(i, elem) {
                        var $elem = $(elem); 
                        createCalTag(tagLayer.find('.calendar_tag'), $elem.data('type'), $elem.data('name'), $elem.data('feedid'));
                    });
            	}
                
                $('.content_page').append(tagLayer);
                tagLayer.show();
                $(e.currentTarget).removeClass('ic_open').addClass('ic_close');
             });
            
             $parent.on('click.calendarAppView', '.layer_name_tag .btn_layer_x, #calendar-tag-base .ic_close', function() {
                $('.layer_name_tag').remove();
                $('#calendar-tag-base .ic_close').removeClass('ic_close').addClass('ic_open');
             });
             
             $parent.on('click.calendarAppView', '.calendar_star', function() {
                 
             });
             
             $(document).on('show:calendar.calendarAppView', function() {
                 createCalendarTags();
             });
             
             $(document).on('hide:calendar.calendarAppView', function() {
                 createCalendarTags();
             });
        }
                                            
        function createCalendarTagLayer() {
            $('.layer_name_tag').remove();
            
            var wrap = [], $wrap;
            wrap.push('<div class="layer_slide layer_name_tag" style="top:-8px; left:-1px;">');
            wrap.push('<header></header>');
            wrap.push('<a class="btn_layer_x" title="' + commonLang['닫기'] +'">');
            wrap.push('<span class="ic"></span><span class="txt">'+ commonLang['닫기']  +'</span>');
            wrap.push('</a>');
            wrap.push('</header>');
            wrap.push('<ul class="name_tag calendar_tag">');
            wrap.push('</ul>');
            wrap.push('</div>');
            
            $wrap = $(wrap.join("\n")).hide();
                        
            return $wrap;
        }
        
        return CalendarFixedSizeLayout;
    });
}).call(this);