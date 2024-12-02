;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        "i18n!board/nls/board",
			"i18n!calendar/nls/calendar",
	        "hgn!task/templates/task_detail",
	        
	        "task/models/task_folder",
	        "task/models/task",
			
	        "task/views/task_title",
			"task/views/task_post_move",
	        "task/views/task_activity",
	        "task/views/task_log",
	        "attach_file",
	        "content_viewer",
	        "jquery.go-preloader"
	], 
	function(
			Backbone,
			Hogan,
			App,
			
			commonLang,
			taskLang,
			boardLang,
			calendarLang,
			TaskDetailTmpl,
			
			TaskFolder,
			Task,
			
			TaskTitleView,
			TaskPostMoveView, 
			TaskActivityView,
			TaskLogView,
			AttachView,
			ContentViewer
	) {
		var lang = {
				"move" : commonLang["이동"],
				"delete" : commonLang["삭제"],
				"list" : commonLang["목록"],
				"print" : commonLang["인쇄"],
				"summary" : taskLang["업무 개요"],
				"regist" : commonLang["등록"],
				"edit" : commonLang["수정"],
				"type" : taskLang["유형"],
				"assignee" : taskLang["담당자"],
				"dueDate" : taskLang["기한"],
				"delay" : taskLang["지연"],
				"tag" : taskLang["분류"],
				"referer" : taskLang["참조자"],
				"detail" : taskLang["업무상세"],
				"attach" : commonLang["첨부파일"],
				"count" : taskLang["개"],
				"save" : commonLang["저장"],
				"folder" : taskLang["폴더"],
				"emptyValue" : taskLang["미지정"],
				"emptyFile" :taskLang["첨부파일이 없습니다."],
				"selectFolder" :taskLang["업무를 이동시킬 폴더를 선택하세요"],
				"preview" : commonLang["인쇄 미리보기"],
				"activity" : taskLang["활동기록"],
				"history" :taskLang["변경이력"],
				"cancel" : commonLang["취소"],
				"post" : boardLang["게시판 게시"]
		};
		
		
		var TaskMovePopupTmpl = Hogan.compile(
			'<p class="desc">{{lang.selectFolder}}</p>' +
			'<div>' +
				'<dl>' +
					'<dt>{{lang.folder}}</dt>' +
					'<dd>' +
						'<select>' +
						'{{#folders}}' +
							'<option id="{{id}}">{{name}}</option>' +
						'{{/folders}}' +
						'</select>' +
					'</dd>' +
				'</dl>' +
			'</div>'
		);
			
			
		var TaskDetailView = Backbone.View.extend({
			events : {
				"click span[data-tag=toggle]" : "toggleView",
				"click a[data-tag=action]" : "taskAction",
				"click #moveTask" : "moveTaskPopup",
				"click #deleteTask" : "confirmDelete",
				"click #postTask" : "postBoard",
				"click #taskEditBtn" : "goTaskEdit",
				"click #goToListBtn" : "goList",
				"click #taskPrint" : "printPopup",
				"click #closePopup" : "closePopup",
				"click #print" : "print",
			},
			
			
			initialize : function(options) {
				var self = this;
				this.options = options || {};
				this.task = new Task(this.options);
				this.isPrint = this.options.isPrint;
				
				this.$el.on("change:log", function() {
					self.logView.logs.setPage(0);
					self.logView.render();
				});
			},
			
			
			dataFetch : function() {
				var self = this;
				var deferred = $.Deferred();
				
				this.task.fetch({
					statusCode: {
						400 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
						403 : function() { GO.util.error('403', { "msgCode": "400-common"}); }, 
						404 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
						500 : function() { GO.util.error('500'); }
					},
					success : function(task) {
						if (!task.isReadable()) window.history.back();
						
						var fetchAction = task.getAction();
						self.folder = new TaskFolder({id : task.get("folderId")});
						self.folder.fetch({
							success : function(folder) {
								if (!self.isPrint) {
									GO.util.store.set("taskFolderId", folder.id, {type : "session"});
								}
								var fetchDepartment = folder.getDepartment();
								fetchDepartment.done(function(resp) {
									self.dept = resp.data;
								});
								
								$.when(fetchAction, fetchDepartment).done(function() {
									deferred.resolve(self);
								});
							}
						});
					}
				});
				
				return deferred;
			},
			
			
			render : function() {
				var taskData = {
						lang : lang,
						isAvailableBoard : GO.isAvailableApp("board"),
						referers : this._userNameHelper("referers"),
						approver : this._userNameHelper("approver"),
						folder : this.folder.toJSON(),
						data : $.extend(this.task.toJSON(),{}),
						fileInfo : this._getFilesInfo(),
						dept : this.dept,
						actions : this.task.actions,
						createdAt : GO.util.basicDate(this.task.get("createdAt")),
						beginDate : this.task.getBeginDate() || null,
						dueDate : this.task.getDueDate() || null,
						isDelay : this.task.get("delay"),
						tagLabel : this.task.getTagLabel() || null,
						content : GO.util.convertMSWordTag(this.task.get("content")),
						status : this.task.get("status").end ? "finished" : "ongoing",
						isMultiType : this.folder.isMultiType(),
						isPrint : this.isPrint,
						hasEvent : this.task.hasEvent(),
						calendarEventInfo : this._getCalendarEventInfo()
				};
				this.$el.html(TaskDetailTmpl(taskData));
				
				var taskTitleView = new TaskTitleView({
					title : this.folder.get("name"),
					subTitle : this.dept.name,
					isPrivate : this.folder.get("privateTask")
				});
				this.$el.find(".content_top").html(taskTitleView.el);
				taskTitleView.render();
				
				this.renderApproverView();
				this.renderFieldView();
				this.renderActivityView();
				this.renderLogView();
				if (!this.isPrint) this.renderContentViewer();
				
				var self = this;
				AttachView.create("#attachArea", this.task.get("attaches"), function(attach) {
					return GO.contextRoot + "api/task/" + self.task.id + "/download/" + attach.id;
				});
				
				this.setStyle();
				this.allowAction = true;
				return this;
			},
			
			
			setStyle : function() {
				var style = this.isPrint ? "layer_normal layer_task_print popup" : "go_renew";  
				this.$el.addClass(style);
				this.$el.find("div.task_type").css("overflow-x", "auto");
			},
			
			
			taskAction : function(e) {
				var self = this;
				if (!this.allowAction) {
					return;
				}
				this.allowAction = false;
				var actionId = $(e.currentTarget).attr("data-actionId");
				var promise = $.ajax({
	    			type : "PUT",
	    			dataType : "json",
	    			url : GO.contextRoot + "api/task/" + this.task.get("id") + "/action/" + actionId,
	    			success : function(resp) {
	    				$.goMessage(commonLang["변경되었습니다."]);
	    				self.task.fetch({
	    					success : function(task) {
	    						task.getAction().done(function() {
	    							self.render();
	    						});
	    					}
	    				});
	    				this.allowAction = true;
	    			},
	    			error : function(resp) {
            			$.goError(resp.responseJSON.message);
            			this.allowAction = true;
            		}
	    		});
				
				var preloader = $.goPreloader();
				
				promise.progress(function() {
					preloader.render();
				});
				promise.always(function() {
					preloader.release();
				});
			},
			
			
			goTaskEdit : function() {
				GO.util.store.set("taskFolderId", null, {type : "session"});
				App.router.navigate("task/" + this.task.get("id"), true);
			},
			
			
			isFullSearch : function() {
				var search = GO.router.getSearch();
				return !_.isEmpty(search) && !_.has(search, "page");  
			},
			
			
			goList : function() {
				GO.util.store.set("taskFolderId", null, {type : "session"});
				GO.util.store.set("sideItem", "departmentFolder" + this.folder.id, {type : "session"});
				
				var search = this.serializeObj(GO.router.getSearch());
				var param = search ? "?" + search : "";
				
				if (this.isFullSearch()) {
					App.router.navigate("task/search" + param, true);
				} else {
					App.router.navigate("task/folder/" + this.folder.get("id") + "/task" + param, true);
				}
			},
			
			
			serializeObj : function(obj) {
				var str = [];
				for(var p in obj) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
				return str.join("&");
			},
			
			
			printPopup : function() {
				var url = GO.contextRoot + "app/task/" + this.task.get("id") + "/print";
				window.open(url, '', 'location=no, directories=no, resizable=yes, status=no, toolbar=no, menubar=no, width=1280, height=650, left=0, top=0, scrollbars=yes');
			},
			
			
			closePopup : function() {
				window.close();
			},
			
			
			print : function() {
				window.print();
			},
			
			
			renderApproverView : function() {
				if (!this.task.get("issueType").approver) return;
				this.makeApproverView();
			},

			
			makeApproverView : function() {
				var approver = this.task.get("approver");
				if (!approver) return;
				var label = [approver.name, approver.position || ""].join(" ");
				var html = 
					'<tr id="approver">' +
						'<th><span class="title">' + taskLang["승인자"] + '</span></th>' +
						'<td><span class="txt">' + label + '</span></td>' +
					'</tr>';
				$("tr#approver").replaceWith(html);
			},
			
			
			renderActivityView : function() {
				var self = this;
				var taskActivityView = new TaskActivityView({
					taskId : this.task.get("id"),
					isPrint : this.isPrint,
					dept : this.dept
				});
				
				taskActivityView.dataFetch().done(function(view) {
					self.$("#taskSection").append(taskActivityView.el);
					taskActivityView.render();
				});
			},
			
			
			renderFieldView : function() {
				var folderFields = this._getFields(this.folder.get("fields")).join("");
				var typeFields = this._getFields(this.task.get("issueType").fields).join("");
				$("#fieldArea").replaceWith(folderFields.concat(typeFields));
			},
			
			
			renderLogView : function() {
				this.logView = new TaskLogView({taskId : this.task.get("id")});
				$("#logSection").append(this.logView.el);
				this.logView.render();
			},
			
			
			renderContentViewer : function() {
				ContentViewer.init({
					$el : this.$("#contentArea"),
					content : GO.util.convertMSWordTag(this.task.get("content"))
				});
			},
			
			
			toggleView : function(e) {
				var parent = $(e.currentTarget);
				var child = parent.find("span");
				var type = parent.attr("data-type");
				
				if (child.hasClass("ic_close")) {
					$("#" + type).slideUp(300);
				} else {
					$("#" + type).slideDown(300);
				}
				
				child.toggleClass("ic_close");
				child.toggleClass("ic_open");
			},
			
			
			moveTaskPopup : function() {
				var fetchMovableFolder = this.folder.getMovableFolders();
				fetchMovableFolder.done(function(folders) {
					$.goPopup({
						header : taskLang["업무 이동"],
						width : 320,
						contents : TaskMovePopupTmpl.render({
							folders : self.folder.getMovableFolders()
						}),
						buttons : [{
							btext : commonLang["이동"],
							btype : "confirm"
						}],
						pclass : "layer_normal layer_item_move"
					});
				}).fail(function(resp) {
					$.goError(resp.responseJSON.message);
				});
			},
			postBoard : function() {
				var taskPostMoveView = new TaskPostMoveView({
					taskIds : this.task.id,
					deptId : this.dept.id,
					url : GO.contextRoot + "api/linkage/task/post"
				});
				taskPostMoveView.render();
			},
			
			confirmDelete : function() {
				var self = this;
				$.goPopup({
					title : taskLang["업무 삭제"],
					message  : taskLang["업무 삭제 설명"],
					buttons : [{
						btype : "confirm",
						btext : commonLang["확인"],
						callback : function() {
							self.deleteTask();
						}
					}, {
						btext : commonLang["취소"],
						callback : function() {
						}
					}]
				});
			},
			
			
			deleteTask : function() {
				$.goMessage(commonLang["삭제되었습니다."]);
				this.task.destroy();
				this.goList();
			},
			
			_getCalendarEventInfo : function() {
				return "* " + this.task.getEventStartDate() + " ~ " + this.task.getEventEndDate() + " " + calendarLang['캘린더 일정 등록됨'];
			},
			
			_getFilesInfo : function() {
				var files = [];
				var totalSize = 0;
				_.each(this.task.get("attaches"), function(file) {
					file.fileSizeString = GO.util.getHumanizedFileSize(file.size);
					file.downloadPath = GO.contextRoot + "api/task/" + this.task.get("id") + "/download/" + file.id;
					file.style = GO.util.getFileIconStyle(file);
					file.isImageType = GO.util.isImage(file.extention);
					files.push(file);
					totalSize = totalSize + file.size;
				}, this);
				return {
					size : GO.util.getHumanizedFileSize(totalSize),
					count : this.task.get("attaches").length,
					files : files,
					filePresent : this.task.get("attaches").length ? true : false
				};
			},
			
			
			_userNameHelper : function(type) {
				var result = null;
				if (type == "approver") {
					result = this.task.get(type);
				} else {
					var users = _.map(this.task.get(type), function(user) {
						return user.name + " " + user.position || "";
					});
                    result = users.length ? users.join(", ") : taskLang["미지정"];
				}
				return result;
			},
			
			
			_getFields : function(collection) {
				var fieldEls = [];
				_.each(collection, function(field) {
					if (field.type == "SELECT") {
						fieldEls.push(this._selectField(field));
					} else if (field.type == "BOOLEAN") {
						fieldEls.push(this._booleanField(field));
					} else if (field.type == "TEXT") {
						fieldEls.push(this._textField(field));
					} else {
						return;
					}
				}, this);
				return fieldEls;
			},
			
			
			_selectField : function(field) {
				var taskFieldValue = this._getTaskFieldValue(field);
				if (!taskFieldValue || !taskFieldValue.value) return "";
				var html = 
				'<tr>' + 
					'<th><span class="title">{{field.name}}</span></th>' +
					'<td>' + 
						'<span class="txt">' +
							'{{value}}' +
						'</span>' +								
					'</td>' +
				'</tr>';
				
				return Hogan.compile(html).render({
					field : field,
					value : taskFieldValue.value
				});
			},
			
			
			_booleanField : function(field) {
				var taskFieldValue = this._getTaskFieldValue(field);
				if (!taskFieldValue) return "";
				var html = 
				'<tr>' + 
					'<th>' +
						'<span class="title">{{field.name}}</span>' +
					'</th>' +
					'<td>' +
						'<span class="wrap_option">' +
							'<input type="checkbox" {{#value}}checked{{/value}} disabled>' + 
							'<label>{{field.message}}</label>' +
						'</span>' +	
					'</td>' +
				'</tr>';
				
				return Hogan.compile(html).render({
					field : field,
					value : GO.util.toBoolean(taskFieldValue.value)
				});
			},
			
			
			_textField : function(field) {
				var taskFieldValue = this._getTaskFieldValue(field);
				if (!taskFieldValue || !taskFieldValue.value) return "";
				var html = 
				'<tr>' + 							
					'<th><span class="title">{{field.name}}</span></th>' +
					'<td>' +									
						'<span class="txt">' +
							'{{value}}' + 
						'</span>' +
					'</td>' +
				'</tr>';
				
				return Hogan.compile(html).render({
					field : field,
					value : taskFieldValue.value
				});
			},
			
			
			_getTaskFieldValue : function(field) {
				return _.find(this.task.get("fieldValues"), function(fieldValue) {
					return fieldValue.fieldId == field.id; 
				});
			}
		});
		return TaskDetailView;
	});
}).call(this);