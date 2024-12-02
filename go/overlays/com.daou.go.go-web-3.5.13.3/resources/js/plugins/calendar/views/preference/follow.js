(function() {
	
	define([
        "backbone", 
        "app", 
        "calendar/collections/calendar_feeds", 
        "hgn!calendar/templates/preference/follow", 
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar", 
        "calendar/libs/util", 
        
        "jquery.go-grid"
    ], 
    
    function(
		Backbone, 
		GO, 
		CalendarFeeds, 
		MainTemplate, 
		commonLang, 
		calLang, 
		CalUtil
	) {
		var VIEW_TYPE = {"feed": 'feed', "follower": 'follower'}, 
			DEFAULT_FOLLOW_VIEW_TYPE = VIEW_TYPE.feed;
		
		var FollowConfigView = Backbone.View.extend({
			id: 'follow-config-pane', 
			className: 'calendar-config tab_conent_wrap', 
			
			events: {
                "click input[type=radio][name=view_type]": "_changeFollowerListViewType", 
                "click #button-accept": "_alertForAccept", 
                "click #button-delete": "_confirmForRemove"
            }, 
			
			initialize: function(options) {
				if(!this.collection) {
					this.collection = CalendarFeeds.create();
				}
				
				 if(options.type == "follower")
					 this.__viewtype__ = VIEW_TYPE.follower;
				else
					this.__viewtype__ = VIEW_TYPE.feed;
				this.$el.attr('data-type', 'follow');
				this.dataTable = null;
				
				this.listenTo(this.collection, 'sync', this._reloadTable);
				this.listenTo(this.collection, 'remove', this._reloadTable);
				this.listenTo(this.collection, 'reset', this._reloadTable);
				
                // 캘린더 피드 컬렉션의 reset 이벤트가 언젠가부터 먹질 않는다...
                $(document).off('.calendar-preference');
                $(document).on("reload:calendar-feeds.calendar-preference removed:calendar-feeds.calendar-preference", $.proxy(function(e) {
                    this._reloadTable();
                }, this));
			}, 			
			
			render: function() {
				this.$el.append(MainTemplate({
					"label": {
		                "followings": calLang["내가 등록한 관심 캘린더"], 
		                "followers": calLang["내 일정을 보고 있는 관심동료"], 
		                "accept": calLang["수락"], 
		                "delete": commonLang["삭제"], 
		                "deny": calLang["거절"], 
		                "member": commonLang["이름"], 
		                "status": calLang["상태"], 
		                "updated_at": calLang["설정일"], 
		                "calendar_name": commonLang["캘린더"]
		            }
				}));
				
				
				if (this.__viewtype__ == "follower") 
					$("#radio-followers").prop('checked',true);

				this.loadDataTable(this.__viewtype__);
			}, 
			
			release: function() {
                this.stopListening();
                this.remove();
            }, 
			
			activate: function(type) {
				if(type === 'follow') {
					this.$el.show();
				} else {
					this.$el.hide();
				}
			}, 
			
			loadDataTable: function(type) {
                // dataTable 사용시 로컬변수는 feed 값으로 고정되는 현상이 있다. 따라서, 객체변수로 설정.
                this.__viewtype__ = '' + (type || VIEW_TYPE.feed);
                var self = this, 
                    url = this._buildUrlByType(this.__viewtype__), 
                    customButtons = this.$el.find('#customButtons');

                if(this.dataTable === null) {
                    this.dataTable = $.goGrid({
                        el: "#feed-list-table", 
                        url: url, 
                        params: { "property": "id", "direction": "asc" },
                        displayLength: this.__offset__,
                        emptyMessage: this._buildEmptyMessage(),
                        checkbox : true,
                        checkboxData : 'id',
                        columns: [
                            { mData: null, sClass:'align_l', bSortable: false, fnRender: function(obj) {
                                var memberObj = {'follower' : obj.aData.follower, 'feed': obj.aData.calendar.owner}[self.__viewtype__];
                                return ['<span>', memberObj.name, ' ',  memberObj.position, '</span>'].join("");
                            }}, 
                            { mData: null, bSortable: false, fnRender: function(obj) {
                                return ['<span>', obj.aData.calendar.name, '</span>'].join("");
                            }}, 
                            { mData: null, bSortable: false, fnRender: function(obj) {
                                var stateText = {'waiting': calLang["신청대기"], 'following': calLang["관심 캘린더"]}[obj.aData.state];
                                return ['<span>', stateText, '</span>'].join("");
                            }}, 
                            { mData: null, bSortable: false, fnRender: function(obj) {
                                return ['<span class="date_info">', GO.util.shortDate(obj.aData.createdAt), '</span>'].join("");
                            }}
                        ], 
                        fnDrawCallback : function(obj) {
                            self.$el.find('.tool_bar .custom_header').append(customButtons.show());
                        }
                    });
                } else {
                    this.dataTable.tables.fnSettings().sAjaxSource = url;
                    this.dataTable.tables.fnClearTable();      
                }

                $("#checkedAll").attr("checked", false);
                this._setButtons(this.__viewtype__);
            }, 
			
			_reloadTable: function() {
                if(this.dataTable) this.loadDataTable(this.__viewtype__);
                return this;
            }, 
            
            /**
            feed/follower 별 요청 URL 생성

            @method _buildUrlByType
            @return {String} URL 문자열
            */
            _buildUrlByType: function(type) {
                var stype = '' + (type || DEFAULT_FOLLOW_VIEW_TYPE),
                    urls = [GO.config("contextRoot") + "api/calendar"];
                
                if(stype === VIEW_TYPE.feed) {
                    urls.push(VIEW_TYPE.feed);
                } else {
                    urls.push(VIEW_TYPE.follower);
                }
                return urls.join("/");
            }, 
            
            /**
            데이터 없음 메시지 생성

            @method _buildEmptyMessage
            @return {String} HTML 코드
            */
            _buildEmptyMessage: function() {
                var html = [];
                html.push('<p class="data_null">');
                html.push('<span class="ic_data_type ic_no_data"></span>');
                html.push('<span class="txt">' + calLang["관심 캘린더가 없습니다"] + '.</span>');
                html.push('</p>');

                return html.join("\n");
            }, 
            
            /**
            탭별 노출버튼 설정

            @method _setButtons
            @param {String} type 뷰 타입
            @chainable
            */
            _setButtons: function(type) {
            	var stype = '' + (type || VIEW_TYPE.feed);
            
	            if(stype === VIEW_TYPE.feed) {
	                this.$el.find("#button-accept").hide();
	                this.$el.find("#button-delete > span.txt_caution").text(commonLang["삭제"]);
	            } else {
	            	this.$el.find("#button-accept").show();
                    this.$el.find("#button-delete > span.txt_caution").text([commonLang["삭제"], "(", calLang["거절"], ")"].join(""));
	            }
	            
                return this;
            }, 
            
            /**
            관심동료 패널 > feed/follow 목록 전환

            @method _changeFollowerListViewType
            @param {$.Event} jQuery Event 객체
            @chainable
            */
            _changeFollowerListViewType: function(e) {
                var $target = this.$(e.currentTarget);
                this.loadDataTable($target.val());
                return this;
            }, 
            
            /**
            수락 확인 확인레이어 호출
                - 관심동료만 선택되었을 경우는 경고창을 띄운다.
                - 신청대기 상태의 데이터가 하나라도 있으면 신청대기 상태 데이터만 추출하여 서버로 승인요청한다.

            @method _alertForAccept
            @param {$.Event} jQuery Event 객체
            @chainable
            */
            _alertForAccept: function(e) {
                var self = this, 
                    checkedData = this.dataTable.tables.getCheckedData(), 
                    filteredData = _.filter(checkedData, function(data) {
                        return !!(data.state === 'waiting');
                    });
                
                if(filteredData.length <= 0) {
                    $.goAlert(
                        calLang["대기상태의 캘린더를 선택해주세요"], 
                        calLang["구독 수락 선택 오류 메시지"]
                    ); 
                    return;
                }
                
                $.goConfirm(
                    calLang["관심 캘린더 신청을 수락하시겠습니까?"], 
                    calLang["관심 캘린더 수락 메시지"], 
                    function(popupEl) {
                        self._acceptFollow(filteredData);
                    }
                );

                return this;
            }, 

            /**
            피드/관심동료 삭제 이벤트 콜백

            @method _confirmForRemove
            @param {$.Event} jQuery Event 객체
            @chainable
            */
            _confirmForRemove: function(e) {
                e.preventDefault();
                var self = this, 
                    checkedData = this.dataTable.tables.getCheckedData(), 
                    checkedType = this.$el.find("input[type=radio][name=view_type]:checked").val() || DEFAULT_FOLLOW_VIEW_TYPE, 
                    title = {
                        "feed": calLang["관심 캘린더 삭제"], 
                        "follower": calLang["관심 캘린더 삭제"]
                    }[checkedType], 
                    message = {
                        "feed": calLang["관심 캘린더 해제 알림 메시지"], 
                        "follower": calLang["상대방 관심 캘린더 중지 알림 메시지"]
                    }[checkedType];

                if(checkedData.length > 0) {
                    $.goConfirm(title, message, function(popupEl) {
                        self._removeRelationship(checkedType, checkedData);
                    });
                } else {
                    $.goAlert(calLang["멤버를 선택해주세요"], calLang["멤버를 선택하지 않으셨습니다. 멤버를 선택해주세요"]);
                }
                
                return this;
            }, 

            /**
            수락 요청

            @method _acceptFollow
            @param {Array} collection 수락할 데이터
            @chainable
            */
            _acceptFollow: function(collection) {
                var self = this, 
                defer = $.Deferred(), 
                qi = 0;
                
                _.each(collection, function(data, i) {
                    var url = [GO.config("contextRoot") + "api/calendar/follower/", data.id, "/accept"].join("");                    
                    $.ajax(url, {type: "POST", async: false}).fail(function() {
                        console.log("Error!!!");
                    }).always(function() {
                        qi++;
                        if(qi === collection.length) defer.resolve();
                    });
                }); 
                
                defer.done(function() {
                    self.loadDataTable(self.__viewtype__);
                });

                return this;
            }, 
            
            /**
            피드/관심동료 삭제 요청

            @method _removeRelationship
            @param {String} type Query Event 객체
            @param {Array} elements 체크된 체크박스 목록 배열
            @chainable
            */
            _removeRelationship: function(type, checkedData) {
                
                var self = this, 
                    removedIds = _.pluck(checkedData, "id"), 
                    stype = '' + (type || DEFAULT_FOLLOW_VIEW_TYPE);
                
                $.ajax({
                	"url": GO.config('contextRoot') + "api/calendar/" + stype, 
                    "type": "DELETE", 
                    "data": JSON.stringify({"ids": removedIds}), 
                    "dataType": 'json',
                    "contentType": 'application/json'
                }).then(function() {
                	self.collection.remove(removedIds, {silent: true});
                	CalUtil.triggerRemoveFeed();
                });                

                return this;
            }
		});
		
		return FollowConfigView;
	});
	
})();