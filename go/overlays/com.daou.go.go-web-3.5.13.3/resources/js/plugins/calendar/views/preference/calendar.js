(function() {
	
	define([
        "backbone", 
        "calendar/collections/calendars", 
        "hgn!calendar/templates/preference/calendar", 
        "hgn!calendar/templates/preference/_calendar_list", 
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar", 
        "calendar/libs/util", 
        
        "jquery.go-popup"
    ], 
    
    function(
		Backbone, 
		Calendars, 
		MainTemplate,
		ListTemplate, 
		commonLang, 
		calLang, 
		CalUtil
	) {
		
		var RequestLocker = {
			__state__: false, 
			
			init: function() {
				this.unlock();
			}, 
			
			lock: function() {
				this.__state__ = true;
			}, 
			
			unlock: function() {
				this.__state__ = false;
			}, 
			
			isLock: function() {
				return this.__state__;
			}
		};
		
		var CalendarConfigView = Backbone.View.extend({
			id: 'calendar-config-pane', 
			className: 'calendar-config tab_conent_wrap', 
			
			events: {
				"submit #form-add-mycal": "_reqAddCalendar",
				"click #form-add-mycal .btn-submit": "_reqAddCalendar", 
				"click .btn-remove": "_reqRemoveCalendars",
				"click .btn-reorder": "_toggleSortable", 
				"click .calendar-name": "_setEditNameMode", 
				"submit form[name=form-edit-calname]": "_reqUpdateCalendarName", 
				"click form[name=form-edit-calname] .btn-submit": "_reqUpdateCalendarName", 
				"click .calendar-list input[name=is_default]": "_reqDefaultCalendar", 
				"change .calendar-list select[name=visibility]": "_reqUpdateVisibility", 
				"click .calendar-list input[type=checkbox][name=calendar_id]": "_setAllCheckedState", 
				"click input.check-all": "_checkAllCalendars", 
				"click #btn-gotocal": "_goToCal"
			}, 
			
			initialize: function(options) {
				if(!this.collection) {
					this.collection = Calendars.create();
				}
				this.$el.attr('data-type', 'calendar');
				// 초기 상태는 숨긴다.
				this.$el.hide();
				
				RequestLocker.init();
				
				this.listenTo(this.collection, 'add', _.bind(this.addListRow, this));
				this.listenTo(this.collection, 'remove', _.bind(this.reloadList, this));
				this.listenTo(this.collection, 'reset', _.bind(this.reloadList, this));
			}, 			
			
			render: function() {
				this.$el.append(MainTemplate({
					"label": {
		                "save": commonLang["저장"], 
		                "delete": commonLang["삭제"], 
		                "go_to_calendar": calLang["캘린더로 돌아가기"], 
		                "calendar_name": calLang["캘린더 이름"], 
		                "calendar": commonLang["캘린더"], 
		                "add_calendar": commonLang["추가"], 
		                "default_calendar": calLang["기본 캘린더"], 
		                "visibility_state": calLang["공개 상태"], 
		                "reorder": commonLang["순서바꾸기"],
		                "editable": commonLang["수정"]
		            }
				}));
				
				buildCalenarRows.call(this);
			}, 
			
			reloadList: function() {
				this.$el.find('.calendar-list > tbody').empty();
				renderCalendarRows.call(this);
			},
			
			activate: function(type) {
				if(type === 'calendar') {
					this.$el.show();
				} else {
					this.$el.hide();
				}
			}, 
			
			addListRow: function(model) {
				this.$el.find('.calendar-list > tbody').append(addCalendarRow(model));
			},
			
			_reqAddCalendar: function(e) {
				var $form = this.$el.find('#form-add-mycal'), 
					$input = $form.find('input[name=calendar_name]'), 
					calendarName = $input.val();
				
				if(RequestLocker.isLock()) {
					callRequestLockMessage();
					return;
				}
				
				e.preventDefault();
				RequestLocker.lock();
				resetValidateError($form);
				
				if(validateCalendarName(calendarName)) {
					this.collection.create({"name": calendarName}, {
						"wait": true, 
						"success": function() {
							$input.val('');
							RequestLocker.unlock();
						}
					});
				} else {
					raiseInvalidCalendarNameError($input, $form.find('.wrap_txt'));
				}
			}, 
			
			_reqRemoveCalendars: function(e) {
				var self = this, 
					checkedEls = this.$el.find("input[type=checkbox][name=calendar_id]:checked"), 
					removedIds = [];
				
				if(RequestLocker.isLock()) {
					callRequestLockMessage();
					return;
				}
				
				RequestLocker.lock();
				
				if(checkedEls.length > 0) {
					checkedEls.each(function(i, el) {
						removedIds.push($(el).val());
					});
					
					$.ajax({
						"url": GO.config('contextRoot') + "api/calendar", 
	                    "type": "DELETE", 
	                    "data": JSON.stringify({"ids": removedIds}), 
	                    "dataType": 'json',
	                    "contentType": 'application/json'
	                }).then(function(resp) {
	                	self.collection.remove(removedIds);
	                	removeStoredSelectedCals(removedIds);
	                	RequestLocker.unlock();
	                });
				} else {
					$.goSlideMessage(calLang["삭제 캘린더 선택오류 메시지"], 'caution');
				}
			}, 
			
			_toggleSortable: function(e) {
				if(isSortable.call(this)) {
					disableSortable.call(this);
				} else {
					enableSortable.call(this);
				}
			}, 
			
			_setEditNameMode: function(e) {
				var $target = $(e.currentTarget), 
					calendarId = $target.data('id'), 
					calendarName = $target.data('name');
				
				$target.hide();
				$target.parent().append(buildCalendarNameEditTpl(calendarId, calendarName));
			}, 
			
			_reqUpdateCalendarName: function(e) {
				var self = this, 
					$target = $(e.currentTarget), 
					$form = ($target.is('form') ? $target : $target.closest('form')),
					calendarId = $form.find('input[name="calendar_id"]').val(), 
					calendarName = $form.find('input[name="calendar_name"]').val();
				
				e.preventDefault();

				if(validateCalendarName(calendarName)) {					
					syncCalendar.call(self, calendarId, {"name": calendarName}).then(function() {
						$form.remove();
					});
				}
			}, 
			
			_reqDefaultCalendar: function(e) {
				var self = this, 
					$target = $(e.currentTarget),
					calendarId = $target.data('id');
				
				if(RequestLocker.isLock()) {
					callRequestLockMessage();
					return;
				}
				
				RequestLocker.lock();
				
				this.collection.setDefaultCalendar(calendarId).then(function() {
					$.goSlideMessage(calLang["캘린더 수정완료 메시지"]);
					self.reloadList();
					RequestLocker.unlock();
				});
			}, 
			
			_reqUpdateVisibility: function(e) {
				var $target = $(e.currentTarget),
					visibility = $target.val(), 
					calendarId = $target.data('id');
			
				e.preventDefault();
				syncCalendar.call(this, calendarId, {"visibility": visibility});
			}, 
			
			_setAllCheckedState: function(e) {
				var $checkAllBox = this.$el.find('input.check-all'), 
					$cbxCalId = this.$el.find('.calendar-list input[type=checkbox][name=calendar_id]');
				
				$checkAllBox.prop('checked', isAllChecked($cbxCalId));
			}, 
			
			_checkAllCalendars: function(e) {
				var $checkAllBox = this.$el.find('input.check-all'), 
					$cbxCalId = this.$el.find('.calendar-list input[name=calendar_id]');
				
				$cbxCalId.prop('checked', $checkAllBox.is(':checked'));
			}, 
			
			_goToCal: function(e) {
				GO.router.navigate("calendar", { trigger: true, pushState: true });
            }
		});
		
		function removeStoredSelectedCals(removedIds) {
			var storeCalIds = CalUtil.getSavedSelectedCalendar().split(',');
			CalUtil.saveCheckedCalendar(_.difference(storeCalIds, removedIds));
		}
		
		function isSortable() {
			return this.$el.find('.calendar-list tbody').hasClass('ui-sortable');
		}
		
		function enableSortable() {
			var self = this, 
				$sortTarget = this.$el.find('.calendar-list tbody');
			
			this.$el.find('.btn-reorder .txt').text(commonLang['순서바꾸기 완료']);
			this.$el.find('.btn-remove').hide();
			RequestLocker.lock();
			
			$sortTarget.sortable({
				items: "tr", 
				axis: "y", 
				hoverClass: "ui-state-hover",
				
				start: function(event, ui) {
					
				}, 
				
				stop: function(event, ui) {
					var calendarId = ui.item.find('input[name=calendar_id]').val(), 
						calendar;
					
					reorderCalendars.call(self);
					calendar = self.collection.get(calendarId);
					calendar.move();
				}
			});
			
			$sortTarget.disableSelection();
		}
		
		function reorderCalendars() {
			var self = this;
			this.$el.find('.calendar-list tbody tr').each(function(i, el) {
				var calendarId = $(el).find('input[name=calendar_id]').val(), 
					calendar = self.collection.get(calendarId);
				
				calendar.set({"seq": i}, {silent: true});
			});
			
			this.collection.sort();
		}
		
		function disableSortable() {
			var $sortTarget = this.$el.find('.calendar-list tbody');
			
			this.$el.find('.btn-reorder .txt').text(commonLang["순서바꾸기"]);
			this.$el.find('.btn-remove').show();
			
			RequestLocker.unlock();
			$sortTarget.sortable( "destroy" );
			$sortTarget.enableSelection();
		}
		
		function isAllChecked($cbx) {
			return !($cbx.filter(':not(:checked)').length > 0);
		}
		
		function callRequestLockMessage() {
			$.goSlideMessage(calLang["캘린더 수정요청 진행중 메시지"], 'caution');
		}
				
		function syncCalendar(id, props) {
			var self = this, 
				defer = $.Deferred(), 
				model = this.collection.get(id);
			
			if(RequestLocker.isLock()) {
				callRequestLockMessage();
				return defer;
			}
			
			RequestLocker.lock();
			
			model.save(props, {
				success: function(updated) {
					$.goSlideMessage(calLang["캘린더 수정완료 메시지"]);
					self.reloadList();
					RequestLocker.unlock();
					defer.resolve(updated);
				}, 
				error: defer.reject
			});
			
			return defer;
		}
		
		function buildCalendarNameEditTpl(id, name) {
			var html = [];
			
			html.push('<form name="form-edit-calname">');
				html.push('<span class="wrap_txt">');
					html.push('<input type="hidden" name="calendar_id" value="' + id + '" />')
					html.push('<input type="text" name="calendar_name" value="' + name + '" class="txt wfix_large" />');
					html.push('<a class="btn-submit btn_fn10" href="#" data-bypass>' + commonLang["변경"] + '</a>');
				html.push('</span>');
			html.push('</form>');
			
			return html.join("\n");
		}
		
		function resetValidateError($wrap) {
			$wrap.find('.go_error').remove();
			$wrap.find('.enter.error').removeClass('enter error');
		}
		
		function raiseInvalidCalendarNameError($target, $after) {
			$after = $after || $target;
			
			$.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], { "arg1": 1, "arg2": 32 }), $after);
			$target.addClass('enter error');
			
			RequestLocker.unlock();
		}
		
		function validateCalendarName(name) {
			var len = name.length;
			if (len < 1 || len >= 33) {
				return false;
			}

			if ($.goValidation.containsInvalidFileNameCharacter(name)) {
				$.goError(GO.i18n(commonLang["파일명 특수 문자 불가"]));
				return false;
			}

			return true;
		}
		
		function fetchCalendars() {
			var defer = $.Deferred();
			
			if(this.collection.length > 0) {
				defer.resolve(this.collection);
			} else {
				this.collection.fetch({
					success: defer.resolve, 
					error: defer.reject
				});
			}
			
			return defer;
		}
		
		function addCalendarRow(model) {
			return ListTemplate({
				"calendar_id": model.id, 
				"tag": buildDefaultCalendarTag(model), 
				"calendar_name": model.getCalendarName(), 
				"default?": model.isDefault(), 
				"public?": model.isPublic(), 
				"protected?": model.isProtected(), 
				"private?": model.isPrivate(), 
				"label": {
					"visibility_public": commonLang["공개"], 
					"visibility_protected": calLang["수락 후 공개"],
					"visibility_private": commonLang["비공개"]
				}
			});
		}
		
		function buildCalenarRows() {			
			fetchCalendars.call(this).then(_.bind(renderCalendarRows, this));
		}
		
		function renderCalendarRows(calendars) {
			var $tbody = this.$el.find('.calendar-list > tbody'),
				buff = [];
			
			if(!calendars) {
				calendars = this.collection;
			}
			
			calendars.each(function(calendar) {
				if(calendar.isMyCalendar()) {
					buff.push(addCalendarRow(calendar));
				}
			});
			
			$tbody.append(buff.join("\n"));
		}
		
		function isSelectedVisibilty(bool) {
			return bool ? ' selected="selected"' : '';
		}
		
		function buildDefaultCalendarTag(model) {
			return model.isDefault() ? calLang["기본 캘린더 표시"] : "";
		}
		
		return CalendarConfigView;
	});
	
})();