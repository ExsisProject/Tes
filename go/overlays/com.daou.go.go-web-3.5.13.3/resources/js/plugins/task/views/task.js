;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
			"i18n!calendar/nls/calendar",
	        "hgn!task/templates/task",
	        "hgn!task/templates/task_partial",
	        
	        "task/models/task",
	        "task/models/task_folder",
			"calendar/models/event", 
	        "task/collections/task_departments",
	        "task/collections/task_folders",
	        "task/views/task_title",
	        
	        "go-nametags",
	        "file_upload",
			"go-calendar", 
	        
	        "jquery.go-sdk",
	        "jquery.go-orgslide",
	        "go-webeditor/jquery.go-webeditor",
	        "jquery.calbean"
	], 
	function(
			Backbone,
			Hogan,
			App,
			
			commonLang,
			taskLang,
			calLang,
			TaskTmpl,
			TaskPartialTmpl,
			
			Task,
			TaskFolder,
			CalendarEvent,
			TaskDepartments,
			TaskFolders,
			TaskTitleView,
			
			NameTagView,
			FileUpload,
			GOCalendar
	) {
		var lang = {
				"task" :commonLang["업무"],
				"regist" : commonLang["등록"],
				"edit" :commonLang["수정"],
				"delete" : commonLang["삭제"],
				"location" :commonLang["위치"],
				"selectDept" :taskLang["부서 선택"],
				"selectFolder" :taskLang["폴더 선택"],
				"title" : commonLang["제목"],
				"private" :commonLang["비공개"],
				"assignee" : taskLang["담당자"],
				"dueDate" : taskLang["기한"],
				"dueDateDesc" : taskLang["기한 설명"],
				"tag" : taskLang["분류"],
				"referer" : taskLang["참조자"],
				"refererDesc" : taskLang["참조자 설명"],
				"approver" : taskLang["승인자"],
				"approverDesc" : taskLang["승인자 설명"],
				"detail" : taskLang["상세내용"],
				"cancel" : commonLang["취소"],
				"type" : taskLang["유형"],
				"privateDesc" :taskLang["비공개 설명"],
				"addAttach" :commonLang["파일 첨부"],
				"addCalEvent" : commonLang["캘린더에 일정 등록"],
				"calendar" : commonLang["캘린더"]
		};
		
		
		
		var TaskView = Backbone.View.extend({
		
			events : {
				"change #deptList" : "departmentCheck",
				"change #folderList" : "folderCheck",
				"change #typeList" : "typeCheck",
				"click span.ic_del" : "attachDelete",
				"click #addCalendarEvent" : "addCalendarEvent",
				"click .ic_edit" : "editCalendarEvent",
				"click .ic_basket_bx" : "deleteCalendarEvent",
				"click #submitTask" : "submitTask",
				"click #goBackTask" : "goBack"
			},

			
			initialize : function(options) {
				this.options = options || {};
				this.task = new Task(this.options);
				this.isCreate = this.options.id ? false : true;
				this.editable = {};
			},			

			
			dataFetch : function() {
				var self = this;
				var fetchEditable = $.Deferred();
				var fetchDepartment = $.Deferred();
				var fetchFolder = $.Deferred();
				var fetchFolders = $.Deferred();
				var fetchData = $.Deferred();
				var fetchTask = $.Deferred();
				
				if (this.task.id) {
					this.task.fetch({
						statusCode: {
							400 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
							403 : function() { GO.util.error('403', { "msgCode": "400-common"}); }, 
							404 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
							500 : function() { GO.util.error('500'); }
						}
					}).done(function() {
						fetchTask.resolve();
					});
				} else {
					fetchTask.resolve();
				}
				
				fetchTask.done(function(task) {
//					console.log("fetchTask done");
					if(self.task.get('calendarEvent')){
						self.task.calendarEvent = new CalendarEvent(self.task.get('calendarEvent'));
					}
					
					self.folder = new TaskFolder({
						id : self.options.folderId || self.task.get("folderId") || null
					});
					
					if (self.folder.id) {
						self.folder.fetch().done(function() {
							fetchFolder.resolve();
						});
					} else {
						fetchFolder.resolve();
					}
					
					fetchFolder.done(function(folder) {
//						console.log("fetchFolder done");
						if (!self.task.id) self.task.set({
							folderId : self.folder.id || null,
							issueType : self.folder.defaultType()
						});
						
						self.getEditable().done(function() {
//							console.log("fetchEditable done");
							fetchEditable.resolve();
						});
					});
					
					self.departments = new TaskDepartments({type : "dept"});
					self.departments.fetch().done(function() {
//						console.log("fetchDepartment done");
						fetchDepartment.resolve();
					});
					
					$.when(fetchFolder, fetchDepartment).done(function() {
//						console.log("fetchFolder, fetchDepartment when");
						self.deptId = self.departments.isOneTeam() ? self.departments.first().id : (self.folder.get("deptId") || null);
						self.folders = new TaskFolders();
						self.folders.setDeptId(self.deptId);
						if (self.deptId) {
							fetchFolders = self.folders.fetch({
								success : function() {
//									console.log("fetchFolders done");
									if (self.folders.isOneFolder() && !self.task.get("folderId")) {
										self.task.set({folderId : self.folders.first().id});
										if (!self.folder.id) {
											self.folder = new TaskFolder({id : self.folders.first().id});
											self.folder.fetch().done(function() {
//												console.log("fetchData done");
												fetchData.resolve();
											});
										} else {
//											console.log("fetchData done");
											fetchData.resolve();
										}
									} else {
//										console.log("fetchData done");
										fetchData.resolve();
									}
								}
							});
						} else {
							self.folders.reset([]);
//							console.log("fetchFolders done");
							fetchFolders.resolve();
//							console.log("fetchData done");
							fetchData.resolve();
						}
						
					});
				});
				
				var deferred = $.Deferred();
				$.when(fetchEditable, fetchDepartment, fetchData).done(function() {
//					console.log("fetchEditable, fetchDepartment, fetchData when");
					deferred.resolve(self);
				});
				
				return deferred;
			},
			
			render : function() {
				
				// GO-16446 : Placeholder is required 발생 및 중복으로 Render 되는 이슈 방지
				this.renderCompleted = true;
				
				this.$el.addClass("go_renew");
				this.$el.html(TaskTmpl(this.getRenderData()));
				
				var taskTitleView = new TaskTitleView({
					title : commonLang["업무"] + " " + (this.task.id ? commonLang["수정"] : commonLang["등록"]) 
				});
				this.$el.find(".content_top").html(taskTitleView.el);
				taskTitleView.render();
				
				this.partialRender();
				this.initSmartEditor();
				this.initFileUpload();
				this.toggleTypeView();
				this.setSelectData();
				
				$("input[placeholder]").placeholder();
				
				this.allowAction = true;
				return this;
			},
			
			
			partialRender : function() {
				this.$el.find("tr[data-tag=partial]").remove();
				this.$("#partialArea").replaceWith(TaskPartialTmpl(this.getRenderData()));
				
				$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
				
				this.renderNameTagView("assignees");
				this.renderNameTagView("referers");
				this.renderDatepicker();
				this.renderTagView();
				this.renderField(this.folder.get("fields"), $("#folderFieldArea"));
				this.renderField(this.folder.getCurrentTypeFields($("#typeList").val()), $("#typeFieldArea"));
				this.renderApproverView();
			},
			
			
			getEditable : function() {
				var self = this;
				var deferred = $.Deferred();
				this.task.getEditableAttribute().done(function(editable) {
					self.editable = editable;
					deferred.resolve();
				});
				
				return deferred;
			},
			
			
			getRenderData : function() {
				var showAddEventBtn = true;
				if(this.task.hasEvent()){
					showAddEventBtn = false;
				}
				
				var isEventEditable = true;
				if(this.task.getCalendarEventCreator()) {
					isEventEditable = this.task.getCalendarEventCreator().id == GO.session().id; 
				}
				
				return {
					lang : lang,
					isAvailableCalendar : GO.isAvailableApp("calendar"),
					isCreate : this.task.id ? false : true,
					showAddEventBtn : showAddEventBtn,
					data : $.extend(this.task.toJSON(),{}),
					folder : this.folder.toJSON(),
					beginDate : this.task.getShortBeginDate(),
					dueDate : this.task.getShortDueDate(),
					departments : this.departments.toJSON(),
					folders : this.folders.toJSON(),
					editable : this.editable,
					files : this.task.getFiles(),
					images : this.task.getImages(),
					start : this.task.getEventStartDate(),
					end : this.task.getEventEndDate(),
					eventSummary : this.task.getEventSummary(),
					eventLocation : this.task.getEventLocation(),
					eventType : this.task.getEventType(), 
					calendarId : this.task.getCalendarId(),
					eventId : this.task.getEventId(),
					timeType : this.task.getCalendarTimeType(),
					isEventEditable : isEventEditable
				};
			},
			
			departmentCheck : function() {
				if (this.folder.id) {
					this.typeChangeAlert("department");
				} else {
					this.changeDept();
				};
			},
			
			
			folderCheck : function() {
				if (this.folder.id) {
					this.typeChangeAlert("folder");
				} else {
					this.changeFolder();
				};
			},
			
			
			typeCheck : function() {
				this.typeChangeAlert("type");
			},
			
			
			changeDept : function() {
				var self = this;
				var fetchFolders = $.Deferred();
				
				this.deptId = $("#deptList").val();
				
				this.folders = new TaskFolders();
				this.folders.setDeptId(this.deptId);
				if (this.deptId) {
					fetchFolders = this.folders.fetch();
				} else {
					this.folders.reset([]);
					fetchFolders.resolve();
				}
				fetchFolders.done(function() {
					self.renderFolderList(self.folders);
					self.changeFolder();
				});
			},
			
			
			changeFolder : function() {
				var self = this;
				var folderId = $("#folderList").val();
				var fetchFolder = $.Deferred();
				
				this.folder = new TaskFolder({id : folderId});
				if (folderId) {
					fetchFolder = this.folder.fetch();
				} else {
					fetchFolder.resolve();
				}
				
				fetchFolder.done(function() {
					self.task.set({
						folderId : folderId,
						issueType : self.folder.defaultType()
					});
					
					self.renderTypeView();
					
					self.getEditable().done(function() {
						self.redrawTaskView();
					});
				});
			},
			
			
			changeType : function() {
				var typeId = $("#typeList").val();
				this.task.set({
					issueType : this.folder.findIssueType(typeId)
				});
				
				var self = this;
				this.getEditable().done(function() {
					self.redrawTaskView();
				});
			},
			
			
			toggleTypeView : function() {
				if ($("#typeList").find("option").length > 1) {
					$("#typeArea").show();
				} else {
					$("#typeArea").hide();
				}
			},
			
			
			renderFolderList : function(folders) {
				var tmpl = 
					'{{#folders}}' + 
					'{{^separator}}' + 
					'<option value={{id}} {{#currentFolder}}selected{{/currentFolder}}>{{name}}</option>' +
					'{{/separator}}' + 
					'{{/folders}}';
				var folderList = $("select#folderList");
				
				folderList.find("option:gt(0)").remove();
				folderList.append(Hogan.compile(tmpl).render({
					folders :folders.toJSON()
				}));
			},
			
			
			renderTypeView : function() {
				$("#typeList").find("option").remove();
				var typeItemTpl = Hogan.compile('<option value={{issueType.id}}>{{issueType.name}}</option>');
				_.each(this.folder.getIssueTypes(), function(issueType) {
					$("#typeList").append(typeItemTpl.render({
						issueType : issueType
					}));
				});
				$("#typeList").val(this.task.get("issueType").id);
			},
			
			
			typeChangeAlert : function(type) {
				var self = this;
				var text = type == "type" ? taskLang["유형 변경 경고"] : taskLang["위치 변경 경고"];
				var popup = $.goPopup({
					contents : text,
					buttons : [{
						btext : commonLang["확인"],
						callback : function() {
							if (type == "department") {
								self.changeDept();
							} else if (type == "folder") {
								self.changeFolder();
							} else if (type == "type") {
								self.changeType();
							};
						}
					}, {
						btext : commonLang["취소"]
					}]
				});
				
				// closeCallback 은 popup 이 닫힐때 항상 수행 되기때문에 이벤트를 따로 정의하거나 async 처리를 해줘야 한다.
				popup.find("a.btn_minor_s:last").bind("click", function() {
					self.revert(type);
				});
				popup.find("a.btn_layer_x").bind("click", function() {
					self.revert(type);
				});
			},
			
			
			revert : function(type) {
				if (type == "department") {
					this.revertDept();
				} else if (type == "folder") {
					this.revertFolder();
				} else if (type == "type") {
					this.revertType();
				};
			},
			
			
			revertDept : function() {
				//$("#deptList").val(this.task.get("deptId"));
				$("#deptList").val(this.deptId);
			},
			
			
			revertFolder : function() {
				$("#folderList").val(this.task.get("folderId"));
			},
			
			
			revertType : function() {
				$("#typeList").val(this.task.get("issueType").id);
			},
			
			
			setSelectData : function() {
				$("#deptList").val(this.deptId);
				$("#folderList").val(this.task.get("folderId"));
			},
			
			
			redrawTaskView : function() {
				var title = $("#taskName").val();
				var deuDate = $("#dueDate").val();
				var beginDate = $("#beginDate").val();
				
				this.partialRender();
				
				$("#taskName").val(title);
				$("#dueDate").val(deuDate);
				$("#beginDate").val(beginDate);
				
				this.toggleTypeView();
			},
			
			
			getEditableAttributeByType : function(type) {
	    		if (type == "assignees") {
	    			return this.editable.ASSIGNEE;
	    		} else if(type == "referers") {
	    			return this.editable.REFERER;
	    		} else if(type == "approver") {
	    			return this.editable.APPROVER;
	    		} else {
	    			return true;
	    		}; 
	    	},
			
			
			renderNameTagView : function(type) {
				
				var editable = this.getEditableAttributeByType(type);
				var self = this;
				var nameTag = NameTagView.create({}, {useAddButton : editable});
				
				$("#" + type).html(nameTag.el);
					
				if (type == 'approver') {
					var approver = this.task.id ? this.task.get('approver') : this.folder.get('approver');
					if (approver) {
						nameTag.addTag(approver.id, approver.name + " " + approver.position || "", {removable : editable});
					} /*else {
						nameTag.addTag("0", taskLang["미지정"], {removable : false});
					}*/
				} else {
					var typeMembers =  this.task.id ? this.task.get(type) : this.folder.get(type);
					_.each(typeMembers, function(user){
						nameTag.addTag(user.id, user.name + " " + user.position || "", {removable : editable});
					}, this);
				}
				
				if (!this.task.id) {
					if (type == "assignees") { //업무폴더에서 지정할 경우
						if(this.folder.get('defaultAssignee')) {
							var user = this._getSessionUser();
							nameTag.addTag(user.id, user.name + " " + user.position || "", {removable : editable});
						}
					}
				}
				
				nameTag.$el.on('nametag:clicked-add', function(e, nameTag) {
					$.goOrgSlide(self.getOrgOption(nameTag, editable, type));
				});
				
//				nameTag.$el.on('nametag:removed', function(event, id) {
//					if (self.$("#assignees").find("li[data-id]").length == 0) {
//						self.renderDefaultUser(nameTag);
//					}
//				});
			},
			
			
			getOrgOption : function(nameTag, editable, type) {
				var header = "";
				
				if (type == "assignees") {
					header = taskLang["담당자"];
				} else if (type == "approver") {
					header = taskLang["승인자"];
				} else if (type == "referers") {
					header = taskLang["참조자"];
				}
				
				var option = {
					header : header + " " + commonLang["선택"],
					memberTypeLabel : header,
					externalLang : commonLang,
					contextRoot : GO.contextRoot,
					isBatchAdd : true,
					callback : $.proxy(function(info) {
						var datas = _.isArray(info) ? info : [info];
						if (datas[0].type == "org") return;
						
						if (type == "approver") {
							var approver = $("#approver").find("li[data-id]").first(); 
							if (approver.length) $.goMessage(commonLang["변경되었습니다."]);
							approver.remove();
						}
						nameTag.addTags(datas, { removable : editable, "attr": info });
						this.removeDefaultAssignee();
					}, this)
				};
				
				if (type == "approver") option["isOnlyOneMember"] = true;
				
				if (this.folder.isCompanyShare()) {
		 	 	 	var domainCodeShares = this.folder.getDomainCodeShares();
		 	 	 	                                      
		 	 	 	if (domainCodeShares.length) {
			 	 	 	var includeLoadIds = _.pluck(domainCodeShares, "nodeId");
			 	 	 	
			 	 	 	option["type"] = "domaincode";
			 	 	 	option["includeLoadIds"] = includeLoadIds;
		 	 	 	} else {
		 	 	 		option["type"] = "list";
		 	 	 	}
	 	 	 	} else {
	 	 	 		option["circle"] = this.folder.get("share");
	 	 	 		option["type"] = "circle";
	 	 	 		option["method"] = "POST";
	 	 	 		option["isBatchAdd"] = false;
	 	 	 	}
				
				return option;
			},
			
			
			isAssigneeType : function() {
				if (!this.folder.id) return false;
				
				return this.editable.ASSIGNEE;
			},

			
//			renderDefaultUser : function(nameTag) {
//				nameTag.addTag("0", taskLang["미지정"], {removable : false});
				
				// 나중에 다시 쓰일듯.
//				var session = GO.session();
//				nameTag.addTag(session.id, session.name + " " + session.position || "", {removable : true});
//			},
			
			
			removeDefaultAssignee : function() {
				this.$("#assignees").find("li[data-id='0']").remove();
			},
			
			
			renderDatepicker : function() {

				$("#beginDate").datepicker({
					yearSuffix: "",
					dateFormat: "yy-mm-dd",
					changeMonth: true,
					changeYear: true,
					beforeShow : function(elplaceholder, object) {
						object.dpDiv.attr("data-layer", "");
						var isBefore = true;
						$(document).trigger("showLayer.goLayer", isBefore);
					},
					onClose : function() {
						var isBefore = true;
						$(document).trigger("hideLayer.goLayer", isBefore);
					}
				});

				$("#dueDate").datepicker({
					yearSuffix: "",
					dateFormat: "yy-mm-dd", 
					changeMonth: true,
					changeYear: true,
					beforeShow : function(elplaceholder, object) {
					    object.dpDiv.attr("data-layer", "");
					    var isBefore = true;
					    $(document).trigger("showLayer.goLayer", isBefore);
					},
					onClose : function() {
					    var isBefore = true;
					    $(document).trigger("hideLayer.goLayer", isBefore);
					}
                });
			},
			
			
			renderTagView : function() {
				var TagPopupTmpl = Hogan.compile(
					'<div class="list_wrap">' +
						'<ul class="side_depth">' +
						'{{#tags}}' +
							'<li id={{.}}>' +
								'<p class="title">' +
								'<a><span class="txt">{{.}}</span></a>' +
								'</p>' +					
							'</li>' +
						'{{/tags}}' +
						'</ul>' +
					'</div>'	
				);
				
				var editable = this.task.id ? this.editable.TAG : true;
				var self = this;
				var nameTag = NameTagView.create({}, {useAddButton : editable});
				var tags = this.task.get("tags");
				
				$("#tag").html(nameTag.el);
				
				_.each(tags, function(tag){
					nameTag.addTag(tag, tag, {removable : editable}); //Tag model을 제거하여 id 가 없으므로 id에 name String 을 대체
				}, this);
				
				nameTag.$el.on('nametag:clicked-add', function(e) {
					var popup = $.goPopup({
						header : taskLang["분류 추가"],
						width : 300,
						contents : TagPopupTmpl.render({
							tags : self.folder.get("tags")
						}),
						buttons : [{
							btext : commonLang["닫기"]
						}]
					});
					
					var addedTags = _.map($("ul#tag").find("li[data-id]"), function(tag) {
						return $(tag).find("span.txt").text();
					});
					
					$(popup).find("li").on("click", function() {
						var id = this.getAttribute("id");
						var name = $(this).find("span").text();
						
						if (!_.contains(addedTags, id)) {
							$.goMessage(taskLang["추가되었습니다."]);
							addedTags.push(name);
						}
						
						nameTag.addTag(id, name, {removable : true});
					});
				});
			},
			
			renderField : function(collection, $element) {
				if (!this.folder.id) return;
				var fields = this._getFields(collection).join("");
				$element.replaceWith(fields);
			},
			
			
			renderApproverView : function() {
				if (!this.folder.id) return;
				var currentType = this.folder.findIssueType($("#typeList").val());
				if (!currentType || !currentType.approver) return;
				this.makeApproverView();
				this.renderNameTagView("approver");
			},

			
			makeApproverView : function() {
				var html = '<tr data-tag="partial">' +
								'<th>' +
								'<span class="title">' + taskLang["승인자"] +
									' <span class="help">&nbsp;' +
										'<span class="tool_tip">' + taskLang["승인자 설명"] + '<i class="tail_left"></i></span>' +
									'</span>' +
								'</span>' +
							'</th>' +
							'<td>' +
								'<div class="wrap_name_tag">' +
									'<ul id="approver" class="name_tag">' +
									'</ul>' +
								'</div>' +
							'</td>' +
						'</tr>';
				$("tr.line").before(html);
			},
			
			
			attachDelete : function(e) {
				$(e.target).parents("li").remove();
			},
			
			deleteCalendarEvent : function() {
				this.task.calendarEvent = null;
				$("#calendarEvent").hide();
				$("#calendarEvent span#start").text('');
				$("#calendarEvent span#end").text('');
				$("#calendarEvent span#eventSummary").attr('data-summary', '');
				$("#calendarEvent span#eventSummary").attr('data-location', '');
				$("#calendarEvent span#eventSummary").attr('data-calendarid', '');
				$("#calendarEvent span#eventSummary").attr('data-timeType', '');
				$("#calendarEvent span#eventSummary").attr('data-id', '');
				$("#addCalendarEvent").show();
			},

			addCalendarEvent : function() {
				var startDate = $("#beginDate").val(),
					endDate = $("#dueDate").val();
				if(!startDate){
					startDate = endDate;
				}
				if(!endDate) {
					endDate = startDate;
				}
				if(startDate > endDate){
					$.goError(taskLang["종료일이 시작일보다 이전일 수 없습니다."], $("#dateError"), false, true);
					$(document).scrollTop(0);
					return false;
				}
				var options = {
					"startDate" : startDate,
					"endDate" : endDate,
					"summary" : $("#taskName").val(),
					"isAllDay" : $("#beginDate").val() == $("#dueDate").val() ? true : false
				}
				this._makeCalendarLayer(options);
			},				
			
			editCalendarEvent: function() {
				var options = {
					
					"startDate" : GO.util.shortDate($("#start").attr('data-modify-date')),
					"startTime" : GO.util.hourMinute($("#start").attr('data-modify-date')),
					"endDate" : GO.util.shortDate($("#end").attr('data-modify-date')),
					"endTime" : GO.util.hourMinute($("#end").attr('data-modify-date')),
					"summary" : $("#eventSummary").attr('data-summary'),
					"location" : $("#eventSummary").attr('data-location'),
					"calendarId" : $("#eventSummary").attr('data-calendarid'),
					"type" : $("#eventSummary").attr('data-type'),
					"isAllDay" : $("#eventSummary").attr('data-timeType') == "allday" ? true : false
				}
				this._makeCalendarLayer(options);
			},
			
			_makeCalendarLayer : function(options) {
				var self = this;
				GOCalendar.addSimpleEvent({
					"contextRoot": GO.config('contextRoot'), 
					"session": GO.session(),
					"timeType": options.isAllDay ? "allday" : "timed",
					"startDate": options.startDate,
					"startTime" : options.startTime, 
					"endDate": options.endDate, 
					"endTime" : options.endTime,
					"summary": options.summary,
					"location": options.location,
					"calendarId": options.calendarId,
					"type" : options.type,
					"modal": true,
					"returnType" : "related",
					"afterAddEvent": function(respData) {
						
						if(self.task.calendarEvent == undefined || self.task.calendarEvent == null){
							self.task.calendarEvent = new CalendarEvent(respData);
						}else{
							self.task.calendarEvent.set('calendarId', respData.calendarId);
							self.task.calendarEvent.set('endTime', respData.endTime);
							self.task.calendarEvent.set('location', respData.location);
							self.task.calendarEvent.set('startTime', respData.startTime);
							self.task.calendarEvent.set('summary', respData.summary);
							self.task.calendarEvent.set('timeType', respData.timeType);
							self.task.calendarEvent.set('type', respData.type);
							self.task.calendarEvent.set('visibility', respData.visibility);
						}
						
						
						if($("#calendarEvent span#eventSummary").attr('data-id')){
							self.task.calendarEvent.set('id', $("#calendarEvent span#eventSummary").attr('data-id'));
						}
						
						$("#addCalendarEvent").hide();
						$("#calendarEvent").show();
						$("#calendarEvent span#start").text(GO.util.basicDate(respData.startTime));
						$("#calendarEvent span#end").text(GO.util.basicDate(respData.endTime));
						
						$("#calendarEvent span#start").attr('data-modify-date', GO.util.toMoment(respData.startTime, 'YYYY-MM-DD (ddd) HH:mm').format('YYYY-MM-DD HH:mm'));
						$("#calendarEvent span#end").attr('data-modify-date', GO.util.toMoment(respData.endTime, 'YYYY-MM-DD (ddd) HH:mm').format('YYYY-MM-DD HH:mm'));
						
						$("#calendarEvent span#eventSummary").attr('data-summary', respData.summary);
						$("#calendarEvent span#eventSummary").attr('data-location', respData.location);
						$("#calendarEvent span#eventSummary").attr('data-calendarid', respData.calendarId);
						$("#calendarEvent span#eventSummary").attr('data-timeType', respData.timeType);
						$("#calendarEvent span#eventSummary").attr('data-type', respData.type);
					}, 
					"onCreateError": function(errorTag) {
						var messages = {
							"required:summary": calLang["일정명을 입력하세요"], 
							"max:summary": GO.i18n(calLang["일정명은 {{max}}자 이하로 입력해 주십시오"], "max", 500)
						};
						$.goMessage(messages[errorTag] || calLang["일정 등록시 오류가 발생하였습니다"]);
					}, 
					"lang": {
						"내 캘린더": calLang["내 캘린더"], 
						"일정 등록": calLang["일정 등록"], 
						"일정명": calLang["일정명"], 
						"일시": calLang["일시"], 
						"시간": calLang["시간"], 
						"종일": calLang["종일"],
						"확인": commonLang["확인"], 
						"취소": commonLang["취소"],
						"일정상세 입력": calLang["일정상세 입력"], 
						"기본 캘린더 이름": calLang["캘린더 기본이름"], 
						"기본 캘린더 표시": calLang["기본 캘린더 표시"],
						"분" : calLang["분"],
						"장소" : calLang["장소"],
            			"전사일정" : calLang["전사일정"],
            			"알림메일 확인" : calLang["알림메일 확인"],
            			"일정등록에 대한 알림메일을 보내시겠습니까?" : calLang["일정등록에 대한 알림메일을 보내시겠습니까?"],
            			"보내기" : commonLang["보내기"],
            			"보내지 않음" : calLang["보내지 않음"]
					}
				});
			},
			
			goBack : function() {
				window.history.back();
			},
					
			submitTask : function() {
				if (!GO.Editor.getInstance("editor").validate()) {
            		$.goError(commonLang['마임 사이즈 초과']);
            		return false;
            	}
				
				var self = this;
				if (!this.allowAction) {
					return;
				}
				this.allowAction = false;
				var calendarEvent = this.task.calendarEvent ? this.task.calendarEvent.toJSON() : null;
				var taskData = {
					folderId : $("#folderList").val(),
					name : $("#taskName").val(),
					issueType : this.folder.findIssueType($("#typeList").val()),
					beginDate : this._getBeginDate(),
					dueDate : this._getDueDate(),
					tags : this._getTags(),
					creator : this._getCreator(),
					lasModifier : this._getSessionUser(),
					privateTask : $("#privateTask").is(":checked"),
					status : {
						name : "status",
						start : false,
						end : false,
						doing : false
					},
					activityCount : this.task.get("activityCount"),
					fieldValues : this._getFieldValues(),
					attaches : this._getFiles(),
					content : this.getContent(),
					assignees : this._getUserInfo("assignees"),
					referers : this._getUserInfo("referers"),
					approver : this._getUserInfo("approver"),
					updatedAt : this.task.getUpdatedAt(),
					calendarEvent : calendarEvent
				};
				
				if(this.validate(taskData) == false) {
					this.allowAction = true;
					return;
				}
				
				this.task.set(taskData);
				this.task.save({}, {
					success : function(e) {
						GO.util.store.set("taskFolderId", null, {type : "session"});
						App.router.navigate("task/" + e.id + "/detail", true);
					},
	    			error : function(model, resp) {
	    				$.goError(resp.responseJSON.message);
	    				self.allowAction = true;
            		}
				});
			},
			
			
			getContent : function() {
				var content = GO.Editor.getInstance("editor").getContent();
				return (content == "" || $.trim(content) == "<br>") ? "" : content;
			},
			
	    	
			validate : function(task) {
				if (!task.folderId || !this.folder.id) {
	    			$.goError(taskLang["폴더를 선택해 주세요."], $("#folderError"), false, true);
	    			$(document).scrollTop(0);
	    			return false;
	    		}
	    		if (task.name.length > 64 || task.name.length < 2) {
	    			$.goError(taskLang["제목은 2자 이상, 64자 이하 입력 가능합니다."], $("#taskName"), false, true);
	    			$(document).scrollTop(0);
	    			return false;
	    		}
	    		if (this.folder.get("tagRequired") && task.tags.length == 0) {
	    			$.goError(taskLang["분류를 선택해 주세요."], $("#tagError"), false, true);
	    			$(document).scrollTop(0);
	    			return false;
	    		}
				if (task.beginDate.length != 0 && task.dueDate.length != 0) {

					var beginDate = new Date(task.beginDate);
					var dueDate = new Date(task.dueDate);

					if (beginDate > dueDate) {
						$.goError(taskLang["종료일이 시작일보다 이전일 수 없습니다."], $("#dateError"), false, true);
						$(document).scrollTop(0);
						return false;
					}
				}
	    		if (!this.customFieldValidate()) return false;
			},
			
			
			customFieldValidate : function() {
				var isValid = true;
				_.each(this.folder.getRequiredSelectFields(), function(field) {
					var fieldId = field.id;
					var fieldEl = $("tr#field" + fieldId + "[data-field=customField]").find("select");
					if (fieldEl.val() == "") {
						isValid = false;
						$.goError(commonLang["필수항목을 입력하지 않았습니다."], fieldEl, false, true);
					}
				});
				_.each(this.folder.getRequiredTextFields(), function(field) {
					var fieldId = field.id;
					var fieldEl = $("tr#field" + fieldId + "[data-field=customField]").find("input");
					if (fieldEl.val() == "") {
						isValid = false;
						$.goError(commonLang["필수항목을 입력하지 않았습니다."], fieldEl, false, true);
					}
				});
				_.each(this.folder.getTextFields(), function(field) {
					var fieldId = field.id;
					var fieldEl = $("tr#field" + fieldId + "[data-field=customField]").find("input");
					if (fieldEl.val().length > 200) {
						isValid = false;
						$.goError(GO.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."], {arg1 : 200}), fieldEl, false, true);
					}
				});
				
				return isValid;
			},
			
			
			_getFieldValues : function() {
				var fieldValues = [];
				_.each(this.$el.find("tr[data-field=customField]"), function(field) {
					var $field = $(field);
					var type = $field.attr("data-type").toUpperCase();
					if (type == "SELECT") {
						fieldValues.push(this._getSelectFieldValue($field));
					} else if (type == "BOOLEAN") {
						fieldValues.push(this._getBooleanFieldValue($field));
					} else if (type == "TEXT") {
						fieldValues.push(this._getTextFieldValue($field));
					} else {
						return;
					} 
				}, this);
				return fieldValues;
			},

			_getBeginDate : function() {
				return $("#beginDate").val() ? GO.util.searchStartDate(GO.util.toMoment($("#beginDate").val()) ) : "";
			},
			
			_getDueDate : function() {
				return $("#dueDate").val() ? GO.util.searchEndDate(GO.util.toMoment($("#dueDate").val()) ) : "";
			},
			
			
			_getTags : function() {
				var tags = [];
				_.each($("#tag").find("li[data-id]"), function(tag) {
					tags.push($(tag).find("span.name").text());
				});
				return tags;
			},
			
			
			_getCreator : function() {
				return this.task.id ? this.task.creator : this._getSessionUser();
			},
			
			
			_getSessionUser : function() {				
				return _.pick(GO.session(), 'id', 'name', 'email', 'position', 'thumbnail'); 
			},
			
			
			_getFiles : function() {
				var files = [];
				_.each($("#editorArea").find("li:not(.attachError)"), function(file) {
					files.push({
						id : $(file).attr("data-id") || null,
						path : $(file).attr("data-path"),
						name : $(file).attr("data-name"),
						hostId : $(file).attr("data-hostId")
					});
				});
				return files;
			},
			
			
			_getUserInfo : function(type) {
				if (type == "approver") {
					var approvers = $("#" + type).find("li[data-id]");
					if (approvers.length) {
						return {
							id : approvers.attr("data-id")
						};
					} else {
						return null;
					}
				} else {
					var users = [];
					_.each($("#" + type).find("li[data-id]"), function(user) {
						var id = $(user).attr("data-id");
						if (id == 0) return false;
						users.push({
							id : id
						});
					});
					return users;
				}
			},
			
			
			_getFields : function(collection) {
				var fieldEls = [];
				_.each(collection, function(field) {
					if (field.type == "SELECT") {
						fieldEls.push(this._makeSelectFieldEl(field));
					} else if (field.type == "BOOLEAN") {
						fieldEls.push(this._makeBooleanFieldEl(field));
					} else if (field.type == "TEXT") {
						fieldEls.push(this._makeTextFieldEl(field));
					} else {
						return;
					}
				}, this);
				return fieldEls;
			},
			
			
			_makeSelectFieldEl : function(field) {
				var taskFieldValue = this._getFieldValue(field);
				var options = ['<option value="">' + commonLang["선택"] + '</option>']; 
				var defaultValue = this.task.id ? taskFieldValue.value : taskFieldValue.defaultValue;
				
				_.each(field.options, function(value) {
					var selectOption = value == defaultValue ? " selected" : "";
					options.push('<option ' + selectOption + '>' + value + '</option>');
				}, this);
				
				var html = 
				'<tr data-tag="partial" id="field{{field.id}}" data-fieldId="{{field.id}}" data-field="customField" data-type="select">' + 
					'<th>' +
						'<span class="title">{{field.name}}</span>' +
						'{{#field.required}}<ins class="asterisk">*</ins>{{/field.required}}' +
					'</th>' +
					'<td>' + 
						'<span class="wrap_select">' +
							'<select {{^editable.FIELD}}disabled="disabled"{{/editable.FIELD}}>' +
								options.join("") + 
							'</select>' +
						'</span>' +								
					'</td>' +
				'</tr>';
				
				return Hogan.compile(html).render({
					field : field,
					editable : this.editable
				});
			},
			
			
			_makeBooleanFieldEl : function(field) {
				var taskFieldValue = this._getFieldValue(field);
				var value = this.isCreate ? taskFieldValue.defaultValue : taskFieldValue.value;
				var html = 
				'<tr data-tag="partial" id="field{{field.id}}" data-fieldId="{{field.id}}" data-field="customField" data-type="boolean">' + 
					'<th>' +
						'<span class="title">{{field.name}}</span>' +
						'{{#field.required}}<ins class="asterisk">*</ins>{{/field.required}}' +
					'</th>' +
					'<td>' +
						'<span class="wrap_option">' +
							'<input type="checkbox" ' +
								'{{#taskFieldValue.value}}checked{{/taskFieldValue.value}} ' +
								'{{^editable.FIELD}}disabled="disabled"{{/editable.FIELD}}>' + 
							'<label>{{field.message}}</label>' +
						'</span>' +	
					'</td>' +
				'</tr>';
				
				return Hogan.compile(html).render({
					field : field,
					taskFieldValue : {
						value : GO.util.toBoolean(value)
					},
					editable : this.editable
				});
			},
			
			
			_makeTextFieldEl : function(field) {
				var taskFieldValue = this._getFieldValue(field);
				var html = 
				'<tr data-tag="partial" id="field{{field.id}}" data-fieldId="{{field.id}}" data-field="customField" data-type="text">' + 							
					'<th>' +
						'<span class="title">{{field.name}}</span>' +
						'{{#field.required}}<ins class="asterisk">*</ins>{{/field.required}}' +
					'</th>' +
					'<td>' +									
						'<div class="wrap_txt">' +
							'<input class="txt w_max" type="text"' + 
								'value="{{taskFieldValue.value}}"' +
								'placeholder="{{taskFieldValue.message}}"' + 
								'{{^editable.FIELD}}disabled="disabled"{{/editable.FIELD}}>' + 
						'</div>' +
					'</td>' +
				'</tr>';
				
				return Hogan.compile(html).render({
					field : field,
					taskFieldValue : {
						value : taskFieldValue.value,
						message : field.message 
					},
					editable : this.editable
				});
			},
			
			
			_getSelectFieldValue : function($field) {
				return {
					fieldId : $field.attr("data-fieldId"),
					value : $field.find("option:selected").val()
				};
			},
			
			
			_getBooleanFieldValue : function($field) {
				return {
					fieldId : $field.attr("data-fieldId"),
					value : $field.find("input").is(":checked")
				};
			},
			
			
			_getTextFieldValue : function($field) {
				var input = $field.find("input");
				var value = input.val();
				if (input.attr("placeholder") == value) value = "";
				return {
					fieldId : $field.attr("data-fieldId"),
					value : value
				};
			},
			
			
			_getFieldValue : function(field) {
				if (this.isCreate) return field;
				
				var fieldValues = this.task.get("fieldValues");
				
				if (fieldValues.length == 0) return field;
				
				var fieldValue = _.find(fieldValues, function(fieldValue) {
					return fieldValue.fieldId == field.id;
				}); 
				
				return  fieldValue || {value : field.defaultValue || ""};
			},
			
			
			_isNotSelectFolder : function() {
				return $("select#folderList").val() == "";
			},
			
			
			_isFolderSelect : function() {
				return $("#folderList").val() != "";
			},
			
			editorCallback : function(){
				if (!this.isCreate && !this.editable.CONTENT) {
					var iframe = document.getElementsByTagName('iframe')[0]; 
                    var doc = iframe.contentWindow.document; 
                    var iframe2 = doc.getElementsByTagName('iframe')[0]; 
                    var doc2 = iframe2.contentWindow.document; 
                    doc2.body.contentEditable= 'false';
				}
				GO.Editor.getInstance("editor").setContent(this.task.get("content") || "");
			},
			initSmartEditor : function() {
				$("#editor").goWebEditor({
				    contextRoot: GO.config('contextRoot'),
					lang:GO.session('locale'),
					onLoad : _.bind(this.editorCallback, this)
				});
			},
			
			
			initFileUpload : function(options){
				if (!this.editable.CONTENT) return;
                var self = this,
                    options = {
                        el : "#file-control",
                        context_root : GO.contextRoot ,
                        button_text : "<span class='buttonText'>"+lang.addAttach+"</span>",
                        url : "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie')
                };
                
                (new FileUpload(options))
                .queue(function(e, data){
                    
                })
                .start(function(e, data){
                	if(!GO.config('attachFileUpload')){
                		$.goAlert(commonLang['파일첨부용량초과']);
                		return false;
                	}
                	if(GO.config('excludeExtension') != ""){
                        var test = $.inArray(data.type.substr(1).toLowerCase(),GO.config('excludeExtension').split(','));
                        if(test >= 0){
                            $.goMessage(App.i18n(commonLang['확장자가 땡땡인 것들은 첨부 할 수 없습니다.'], "arg1", GO.config('excludeExtension')));
                            return false;
                        }
                    }
                    
                    if(GO.config('attachSizeLimit')){
                        var size = data.size / 1024 / 1024;  //(MB)
                        var maxAttachSize = GO.config('maxAttachSize');
                        if(maxAttachSize < size){
                            $.goMessage(App.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                            return false;
                        }
                    }
                    
                    if(GO.config('attachNumberLimit')){
                        var currentAttachCnt = $('#fileWrap').children().size() + $("#img_wrap").children().size();
                        var limitAttachCnt = GO.config('maxAttachNumber');
                        if(limitAttachCnt <= currentAttachCnt){     
                            $.goMessage(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", limitAttachCnt));
                            return false;
                        }
                    }
                })
                .progress(function(e, data){
                    
                })
                .success(function(e, resp, fileItemEl){
                	var isImage = GO.util.isImage(resp.data.fileExt);
                	var attachEl2 = self.$("#editorArea");
                	
                	fileItemEl.attr("data-hostId", resp.data.hostId);
                	
                	if(GO.util.fileUploadErrorCheck(resp)){
                		fileItemEl.find(".item_file").append("<strong class='caution'>" + GO.util.serverMessage(resp) + "</strong>");
                		fileItemEl.addClass("attachError");
                	} else {
                		if(GO.util.isFileSizeZero(resp)) {
                			$.goAlert(GO.util.serverMessage(resp));
                			return false;
                		}
                	}
                	
                	if (isImage) {
                		attachEl2.find("ul.img_wrap").append(fileItemEl);
                	} else {
                		attachEl2.find("ul.file_wrap").append(fileItemEl);
                	}
                })
                .complete(function(e, data){
                    console.info(data);
                })
                .error(function(e, data){
                    console.info(data);
                });
            }
		});
		return TaskView;
	});
}).call(this);
