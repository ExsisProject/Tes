;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        "i18n!board/nls/board",
	        "i18n!calendar/nls/calendar",
	        "i18n!todo/nls/todo",

	        "hgn!task/templates/task_list",
	        
	        "task/models/task_folder",
	        "task/models/task",
	        "task/collections/tasks",
	        
	        "task/views/task_title",
			"task/views/task_post_move",
	        "task/views/share_info_popup",
			"task/views/side",
			"grid",
	        
	        "jquery.go-grid"
	], 
	function(
			Backbone,
			Hogan,
			App,
			
			commonLang,
			taskLang,
			boardLang,
			calLang,
            todoLang,

			TaskDetailTmpl,
			
			TaskFolder,
			Task,
			Tasks,
			
			TaskTitleView,
			TaskPostMoveView,
			ShareInfoPopup,
			SideView,
			GridView
	) {
		var lang = {
				"addr" : taskLang["폴더 주소"],
				"copy" : commonLang["복사"],
				"search" : commonLang["검색"],
				"showShareInfo" : taskLang["공개/공유 현황 보기"],
				"admin" : taskLang["운영자"],
				"state" : taskLang["상태"],
				"title" : commonLang["제목"],
				"content" : taskLang["제목+내용"],				
				"dueDate" : taskLang["기한"],
				"assignee" : taskLang["담당자"],
				"creator" : taskLang["등록자"],
				"notAuthorized" : taskLang["열람 권한이 없는 업무입니다"]
		};
		
		
		var TaskListView = Backbone.View.extend({
			events : {
				"click #favorite" : "toggleFavorite",
				"click #copyUrl" : "copyUrl",
				"click #shareInfoBtn" : "shareInfoPopup",
				"click #folderInfoToggleBtn" : "toggleFolderInfo",
				"click a[data-type=task]" : "goTaskDetail",
				"click span[data-type=task]" : "goTaskDetail"
			},
			
			initialize : function(options) {
				this.options = options || {};
				this.folder = new TaskFolder(this.options);
				this.tasks = new Tasks([], {
					folderId : this.folder.id
				});
				
				this.bindFavorite();
				
			},
			
			dataFetch : function() {
				var self = this;
				var deferred = $.Deferred();
				
				this.folder.fetch({
					statusCode : {
						400 : function() {
							self.folder.clear();
							App.router.navigate("task", true);
						}, 
						403 : function() { GO.util.error('403', { "msgCode": "400-common"}); }, 
						404 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
						500 : function() { GO.util.error('500'); }
					},
					success : function(folder) {
						if (folder.get("actions").writable) 
							GO.util.store.set("taskFolderId", folder.id, {type : "session"});
						
						folder.getDepartment().done(function(resp) {
							self.department = resp.data;
							deferred.resolve();
						});
					}
				});
				
				return deferred;
			},
			
			
			render : function() {
				if (!this.folder.id) return;
				
				this.$el.addClass("go_renew");
				this.$el.html(TaskDetailTmpl({
					lang : lang,
					folder : this.folder.toJSON(),
					dept : this.department,
					hasAdmin : this.folder.hasAdmin(),
					adminLabel : this.folder.adminLabel(),
					url : this.folderAddress(),
					description : GO.util.escapeHtml(this.folder.get("description"))
				}));
				
				var taskTitleView = new TaskTitleView({
					title : this.folder.get("name"),
					subTitle : this.department.name,
					count : this.folder.get("taskCount"),
					hasFavorite : true,
					isFavorite : this.folder.get("favorite")
				});
				this.$el.find(".content_top").html(taskTitleView.el);
				taskTitleView.render();
				
				this.renderGrid();
				
				var infoArea = this.$("#detailFolderInfo");
				infoArea.toggle(!this.getFolderStatus());
				
				$("#searchKeyword").placeholder();
				
				return this;
			},
			
			
			bindFavorite : function() {
				var self = this;
				$("#side_favorite").on("changeFavorite", function(e, models){
					var isFavoriteFolder = false;
					$.each(models, function(index, model){
					    if (model.get("id") == self.folder.id) {
					        isFavoriteFolder = true;
					        return;
					    }
					});
					
					if (!isFavoriteFolder) {
					    self.$el.find("#favorite").addClass("ic_star_off").attr("value", false);
					}
	            });
			},
			
			
			toggleFolderInfo : function(e) {
				$(e.currentTarget).find("span").toggleClass("ic_open").toggleClass("ic_close");
				var infoArea = this.$("#detailFolderInfo");
				var isHide = infoArea.is(":visible");
				infoArea.toggle(!isHide);
				
				var folderStatusKey = "taskInfo_" + GO.session('id') + "_" + this.id;
				GO.util.store.set(folderStatusKey, isHide, {type : "local"});
			},
			
			
			getFolderStatus : function() {
				var folderStatusKey = "taskInfo_" + GO.session('id') + "_" + this.id;
				return GO.util.store.get(folderStatusKey) || false;
			},

			
			shareInfoPopup : function() {
				var popup = $.goPopup({
                    modal : true,
                    pclass : "layer_normal layer_public_list",
                    header : taskLang["공개/공유 현황"],
                    width : 500,
                    top : "30%",
                    modal : false,
                    contents : "<div id='sharePopupContent' calss='content'></div>",
                    buttons : [{
                        btext : commonLang["확인"],
                        btype : "confirm", 
                        callback : function() {
                        }
                    }]
                });
				
				var popup = new ShareInfoPopup({
					folder : this.folder,
					parent : popup
				});
				popup.render();
			},
			
			
			goCreateTask : function() {
				GO.util.store.set("taskFolderId", null, {type : "session"});
				GO.util.store.set("sideItem", "departmentFolder" + this.folder.id, {type : "session"});
				App.router.navigate("task/folder/" + this.folder.get("id") + "/create", true);
			},
			
			
			goTaskDetail : function(e) {
				GO.util.store.set("taskFolderId", null, {type : "session"});
				GO.util.store.set("sideItem", "departmentFolder" + this.folder.id, {type : "session"});
				var taskId = e.currentTarget.getAttribute("data-id");
				var searchUrl = this.getSearch(); 
				App.router.navigate("task/" + taskId + "/detail" + searchUrl, true);
			},
	    	
	    	
	    	getQueryString : function() {
	    		var str = "";
	    		_.each($("input[type=checkbox][data-id]:checked"), function(folder) {
	    			str = str + "id=" + $(folder).attr("data-id") + "&";
	    		});
	    		return str;
	    	},
	    	
	    	
	    	isNotSelected : function() {
	    		var checkedTasks = this.$("input[type=checkbox][data-id]:checked");
	    		if (!checkedTasks.length) return true;
	    		return false;
	    	},
	    	postBoard : function() {
				var checkeds = this._getCheckedData();
				if(checkeds.length <= 0) {
					$.goMessage(taskLang["선택된 업무가 없습니다."]);
					return;
				}
				var taskIds = [];
				$.each(checkeds, function(index, task){
					taskIds.push(task.id);
				});
	    		var taskPostMoveView = new TaskPostMoveView({
					taskIds : taskIds,
					deptId : this.department.id,
					url : GO.contextRoot + "api/linkage/task/post"
				});
				taskPostMoveView.render();
	    	},
	    	
	    	_getCheckedData : function() {
				var checkeds = this.gridView.getCheckedIds();
				return _.map(checkeds, function(id) {
					var task = this.tasks.get(id);
					return task.toJSON();
				}, this);
			},
	    	
	    	confirmDelete : function() {
	    		if (this.isNotSelected()) return;
	    		
	    		var self = this;
	    		$.goPopup({
					title : taskLang["업무 삭제"],
					message : taskLang["업무 삭제 설명"],
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
	    	
	    	csvDownLoad : function(){
	    		var folderId = this.options.id;
	    		var url = "api/task/download/" + folderId + "?";
                GO.util.downloadCsvFile(url + "?" + this.tasks.makeParam());
	    	},
			
			deleteTask : function() {
	    		var self = this;
	    		$.ajax({
	    			type : "DELETE",
	    			dataType : "json",
	    			url : GO.contextRoot + "api/task?" + self.getQueryString(),
	    			success : function(resp) {
	    				SideView.render();
	    				$.goMessage(commonLang["삭제되었습니다."]);
	    				self.gridView.collection.fetch();
	    			},
	    			error : function(resp) {
            			$.goError(resp.responseJSON.message);
            		}
	    		});
	    	},
	    	
	    	
	    	getSearch : function() {
	    		var search = GO.router.getSearch();
	    		var keyword = search.keyword;
	    		delete search["keyword"]; 
				var searchUrl = "";
				if (!$.isEmptyObject(search)) {
					searchUrl = "?keyword=" + encodeURIComponent(keyword) + "&" + $.param(search); 
				} 
				
				return searchUrl;
	    	},
	    	
	    	
	    	renderGrid : function() {
	    		var self = this;
				var unreadableIds = [];
				var isReadTasks = [];
	    		this.gridView = new GridView({
	    			el : "#taskListWapper",
	    			collection : this.tasks,
	    			tableClass : "type_normal list_task list_task001 dataTable",
	    			columns : [{
	    				name : "statusName",
	    				className : "state",
	    				label : taskLang["상태"],
	    				sortable : true,
	    				render : function(model) {
				    		var status = model.get("status");
				    		if (model.isReadable()) {
				    			var state = status.end ? "finished" : "etc";
				    			return '<span class="state ' + state + '">' + status.name + '</span>';
				    		} else {
				    			return '<span>-</span>';
				    		}
	    				} 
	    			}, {
	    				name : "name",
	    				className : "list_subject",
	    				label : commonLang["제목"],
	    				sortable : true,
	    				render : function(model) {
				    		var lockIcon = model.get("privateTask") ? '<span class="ic_classic ic_lock"></span>' : "";
				    		var isRead = model.get("read");
							if(!isRead){
								isReadTasks.push(model.id);
							}
				    		if (model.isReadable()) {
				    			var element = 
				    				'<a data-move data-type="task" data-id="' + model.id + '">' +
				    				lockIcon + '\n' + // 디자인팀이 해결 방법을 찾지 못하여 개발팀에서 개행문자 추가함.
                                    '<span class="txt">' + model.get("name") + '</span>' +
				    				'</a>';
				    			if (model.hasActivity()) {
				    				element = element +  
				    				'<span data-move data-type="task" data-id="' + model.id + '" class="btn_wrap btn_activity">' +
				    				'<span class="ic_classic ic_activvity"></span>' + // vv 오타아님. 실제 클래스명
				    				'<span class="txt_b">' + taskLang["활동기록"] + '</span>' +
				    				'<span class="num">' + model.get("activityCount") + '</span>' +
				    				'</span>';
				    			} 
				    			return element;
				    		} else {
								unreadableIds.push(model.id);
				    			return '<a>' + lockIcon + '<span> ' + taskLang["열람 권한이 없는 업무입니다"] + '</span></a>';
				    		}
	    				}
    				}, {
	    				name : "beginDate",
	    				className : "date",
	    				label : calLang['시작일'],
	    				sortable : true,
	    				render : function(model) {
				    		if (model.isReadable()) {
				    			var beginDate = model.get("beginDate") ? GO.util.basicDate2(model.get("beginDate")) : "-";
				    			return "<span class='date'>" + beginDate + "</span>";
				    		} else {
				    			return '<span>-</span>';
				    		}
	    				}
                    }, {
	    				name : "dueDate",
	    				className : "date",
	    				label : todoLang["기한일"],
	    				sortable : true,
	    				render : function(model) {
				    		if (model.isReadable()) {
				    			var dueDate = model.get("dueDate") ? GO.util.basicDate2(model.get("dueDate")) : "-";
				    			var dateClass = model.get("dueDate") && model.get("delay") ? "date delay" : "date";
				    			return "<span class='" + dateClass + "'>" + dueDate + "</span>";
				    		} else {
				    			return '<span>-</span>';
				    		}
	    				}
    				}, {
	    				name : "assignees",
	    				className : "name",
	    				label : taskLang["담당자"],
	    				render : function(model) {
				    		if (model.isReadable()) {
				    			var size = model.get("assignees").length;
				    			var label = model.assigneeLabel(taskLang["외"], commonLang["명"]); 
				    			var assignee = model.firstAssignee();
				    			var assigneeId = assignee ? assignee.id : "";
				    			var html = 
				    				'<a href="javascript:;">' + 
				    					'<span class="txt" data-size="' + size + '" data-id="' + assigneeId + '" data-profile>' + 
				    						label + 
			    						'</span>' + 
		    						'<a/>'; 
				    			return html;
				    		} else {
				    			return '<span>-</span>';
				    		}
	    				}
    				}, {
	    				name : "creator",
	    				className : "name",
	    				label : taskLang["등록자"],
	    				render : function(model) {
				    		if (model.isReadable()) {
				    			var creator = model.get("creator");
				    			var label = model.creatorLabel();
				    			var html = 
				    				'<a href="javascript:;">' + 
					    				'<span class="txt" data-id="' + creator.id + '"  data-profile>' + 
					    					label + 
					    				'</span>' + 
				    				'<a/>'; 
				    			return html;
				    		} else {
				    			return '<span>-</span>';
				    		}
	    				}
	    			}],
	    			drawCallback : function(collection) {
	    				$(unreadableIds).each(function(k,v) {
                        	self.$el.find('input[type="checkbox"][data-id="'+v+'"]').remove();
                        });
						$(isReadTasks).each(function(k,v) {
                        	self.$el.find('tr[data-id="'+v+'"]').addClass("read_no");
                        });
	    			},
	    			buttons : [{
    					render : function() {
    						return self.folder.get("actions").writable ?
								'<a class="btn_tool" data-button>' +
								'<span class="ic_toolbar plus"></span>' +
								'<span class="txt">' + taskLang["업무 등록"] + '</span>' +
								'</a>' : "";
    					},
    					onClick : function() {
    						self.goCreateTask();
    					}
	    			}, {
	    				render : function() {
	    					return GO.isAvailableApp("board") ? 
    							'<a class="btn_tool" data-button>' +
                                '<span class="ic_toolbar board"></span>' +
    							'<span class="txt_caution">' + boardLang["게시판 게시"] + '</span>' +
								'</a>' : "";
			           },
    					onClick : function() {
    						self.postBoard();
    					}
	    			}, {
	    				render : function() {
	    					return self.folder.get("actions").managable ? 
    							'<a class="btn_tool" data-button>' +
                                '<span class="ic_toolbar del"></span>' +
    							'<span class="txt_caution">' + commonLang["삭제"] + '</span>' +
								'</a>' : "";
			           },
    					onClick : function() {
    						self.confirmDelete();
    					}
	    			}, { 
	    				render : function() {
	    					return self.folder.get("actions").managable ? 
    							'<a class="btn_tool" data-button>' +
                                '<span class="ic_toolbar download"></span>' +
    							'<span class="txt_caution">' + commonLang["목록 다운로드"] + '</span>' +
    							'</a>' : "";
	    				},
    					onClick : function() {
    						self.csvDownLoad();
    					}
		           }],
		           searchOptions : [{
	        		   value : "TITLE",
	        		   label : commonLang["제목"]
	        	   }, {
	        		   value : "CONTENT",
	        		   label : taskLang["제목+내용"]
	        	   }, {
	        		   value : "STATUS",
	        		   label : taskLang["상태"]
	        	   }, {
	        		   value : "ASSIGNEE",
	        		   label : taskLang["담당자"]
	        	   }, {
	        		   value : "CREATOR",
	        		   label : taskLang["등록자"]
	        	   }]
	    		});
	    		
	    		this.gridView.render();
	    		this.tasks.fetch({
					statusCode : {
						400 : function() {
							self.folder.clear();
							App.router.navigate("task", true);
						}, 
						403 : function() { GO.util.error('403', { "msgCode": "400-common"}); }, 
						404 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
						500 : function() { GO.util.error('500'); }
					}});
	    	},
			
			
	    	toggleFavorite : function(e) {
	    		var target = $(e.currentTarget);
	    		var isFavorite = GO.util.toBoolean(target.attr("value"));
	    		var options = {
		    			dataType : "json",
		    			url : GO.contextRoot + "api/task/folder/" + this.folder.id + "/favorite",
		    			error : function(resp) {
	            			$.goError(resp.responseJSON.message);
	            		}
		    		};
	    		if (isFavorite) {
	    			options["type"] = "DELETE";
	    			options["success"] = function() {
	    				target.removeClass("ic_star").addClass("ic_star_off").val("false");
	    				$("#side_favorite").trigger("refresh");
	    			};
	    		} else {
	    			options["type"] = "POST";
	    			options["success"] = function() {
	    				target.removeClass("ic_star_off").addClass("ic_star").val("true");
	    				$("#side_favorite").trigger("refresh");
	    			};
	    		}
	    		$.ajax(options);
	    	},

	    	
	    	copyUrl : function() {
    			var agent = navigator.userAgent.toLowerCase();
    			var address = this.folderAddress();
            	
			    if (agent.indexOf("msie") != -1) {
			    	window.clipboardData.setData('Text', address);
			    	$.goMessage(taskLang["업무 폴더 링크복사 완료 메시지"]);
			    } else {
			    	temp = prompt(taskLang["업무 폴더 링크복사 안내 메시지"], address);
			    }
	    	},
	    	
	    	
	    	folderAddress : function() {
	    		return GO.router.getRootUrl() + "task/folder/" + this.folder.id + "/task";
	    	}
		});
		return TaskListView;
	});
}).call(this);