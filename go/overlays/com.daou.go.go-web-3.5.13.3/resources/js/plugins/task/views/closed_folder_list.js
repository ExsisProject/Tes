;(function() {
	define([
			"backbone",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        "hgn!task/templates/closed_folder_list",
	        
	        "task/collections/closed_folders",
	        "task/views/task_title",
	        "task/views/side",
	        "grid",
	        
	        "jquery.go-grid",
	        "jquery.go-orgslide"
	], 
	function(
			Backbone,
			App,
			
			commonLang,
			taskLang,
			FinishFolderListTmpl,
			
			ClosedFolders,
			TaskTitleView,
			SideView,
			GridView
	) {
		var ClosedFolderListView = Backbone.View.extend({
			events : {
				"click a[data-tag=deleteTaskBtn]" : "deleteConfirm",
				"click a[data-tag=restartTaskBtn]" : "restartConfirm",
				"click a[data-tag=transferTaskBtn]" : "callOrg",
				"click a[data-tag=goFolder]" : "goFolder"
			},
			
			
			initialize : function() {
				this.collection = new ClosedFolders();
			},
			
			
			render : function() {
				this.$el.addClass("go_renew");
				this.$el.html(FinishFolderListTmpl());
				
				var taskTitleView = new TaskTitleView({
					title : taskLang["중지된 업무 폴더"]
				});
				this.$el.find(".content_top").html(taskTitleView.el);
				taskTitleView.render();
				
				this.renderList();
				this.renderButton();
				return this;
			},
			
			
			callOrg : function() {
				if ($("input[type=checkbox][data-id]:checked").length == 0) return;
				
				var self = this;
				$.goOrgSlide({
					type : "department",
					contextRoot : GO.contextRoot,
					callback : $.proxy(function(info) {
						var content = 
							'<p class="add">' +
							GO.i18n(taskLang["폴더 이관 경고"],{arg1 : info.name}) + 
							'</p>'; 
						
						$.goConfirm(content, "", function() {
							self.transferFolder(info.id);
						});
					}, this)	
				});
			},
			
			
			renderButton : function() {
				var	btnTmpl =
					'<a class="btn_tool" data-role="button" data-tag="deleteTaskBtn">' +
						'<span class="txt_caution txt_normal">' + commonLang["삭제"] + '</span>' + 
					'</a>' + 
					'<a class="btn_tool" data-role="button" data-tag="restartTaskBtn">' +
						'<span class="txt">' + taskLang["정상 상태로 변경"] + '</span></a>' + 
					'<a class="btn_tool" data-role="button" data-tag="transferTaskBtn">' +
						'<span class="txt">' + commonLang["폴더 이관"] + '</span>' + 
					'</a>';
				
		    	this.$("div.critical").append(btnTmpl);
			},
			
			
			getQueryString : function() {
	    		var str = "";
	    		_.each($("input[type=checkbox][data-id]:checked"), function(folder) {
	    			str = str + "id=" + $(folder).attr("data-id") + "&";
	    		});
	    		return str;
	    	},
	    	
	    	
	    	getIds : function() {
	    		var ids = [];
	    		_.each($("input[type=checkbox][data-id]:checked"), function(folder) {
	    			ids.push(parseInt($(folder).attr("data-id")));
	    		});
	    		return {ids : ids};
	    	},
	    	
	    	
	    	isNotSelected : function() {
	    		var checkedFolders = $("input[type=checkbox]:checked");
	    		if (!checkedFolders.length) return true;
	    		return false;
	    	},
	    	
	    	
	    	deleteConfirm : function() {
	    		if (this.isNotSelected()) return;
	    		
	    		var self = this;
	    		
	    		$.goPopup({
	    			title : taskLang["폴더 삭제"],
	    			message  : taskLang["폴더 삭제 설명"],
	    			buttons : [{
	    				btype : "confirm",
	    				btext : commonLang["확인"],
	    				callback : function() {
	    					self.deleteFolder();
	    				}
	    			}, {
	    				btext : commonLang["취소"],
	    				callback : function() {
	    				}
	    			}]
	    		});
	    	},
			
			
			deleteFolder : function() {
	    		var self = this;
	    		$.ajax({
	    			type : "DELETE",
	    			dataType : "json",
	    			url : GO.contextRoot + "api/task/folder?" + self.getQueryString(),
	    			success : function(resp) {
	    				$.goMessage(commonLang["삭제되었습니다."]);
	    				self.render();
	    			},
	    			error : function(resp) {
            			$.goError(resp.responseJSON.message);
            		}
	    		});
	    	},
	    	
	    	
	    	restartConfirm : function() {
	    		if (this.isNotSelected()) return;
	    		
	    		var self = this;
	    		
	    		$.goPopup({
	    			title : taskLang["정상 상태로 변경"],
	    			message  : taskLang["정상 상태로 변경 설명"],
	    			buttons : [{
	    				btype : "confirm",
	    				btext : commonLang["확인"],
	    				callback : function() {
	    					self.restartFolder();
	    				}
	    			}, {
	    				btext : commonLang["취소"],
	    				callback : function() {
	    				}
	    			}]
	    		});
	    	},
	    	
	    	
	    	restartFolder : function() {
	    		var self = this;
	    		$.ajax({
	    			type : "PUT",
	    			dataType : "json",
	    			url : GO.contextRoot + "api/task/folder/restart?" + self.getQueryString(),
	    			success : function(resp) {
	    				GO.util.store.set("sideItem", "closedFolder", {type : "session"});
	    				SideView.render();
	    				$.goMessage(commonLang["변경되었습니다."]);
	    				self.render();
	    			},
	    			error : function(resp) {
            			$.goError(resp.responseJSON.message);
            		}
	    		});
	    	},
	    	
	    	
	    	transferFolder : function(deptId) {
	    		if (this.isNotSelected()) return;
	    		
	    		var self = this;
	    		$.go(GO.contextRoot + "api/task/folder/transfer/dept/" + deptId, JSON.stringify(self.getIds()), {
	    			contentType : 'application/json',
        			qryType : 'put',
        			responseFn : function(rs) {
        				GO.util.store.set("sideItem", "closedFolder", {type : "session"});
        				SideView.render();
        				$.goMessage(taskLang["이관되었습니다."]);
	    				self.render();
        			},
	    			error : function(resp) {
            			$.goError(resp.responseJSON.message);
            		}
        		});
	    	},
	    	
	    	
	    	goFolder : function(e) {
	    		var folderId = $(e.currentTarget).attr("data-id");
				App.router.navigate("task/folder/" + folderId + "/task", true);
			},
			
			
			renderList : function(options) {
//				var self = this;
				this.gridView = new GridView({
					el : '#closedListWrapper',
					collection : this.collection,
					tableClass : "type_normal list_task list_task001 dataTable",
					columns : [{
				    	name : "closedAt",
				    	className : "period",
				    	sortable : true,
				    	label : taskLang["업무 기간"],
				    	render : function(model) {
				    		return '<span class="date">' +
					    		GO.util.shortDate(model.get("createdAt")) + ' ~ ' + 
					    		GO.util.shortDate(model.get("closedAt")) + '</span>';
				    	}
				    }, {
				    	name : null,
				    	className : "subject",
				    	sortable : false,
				    	label : commonLang["부서명"],
				    	render : function(model) {
				    		return '<span class="txt">' + model.get("departmentName") + '</span>';
				    	}
				    }, {
				    	name : "name",
				    	className : "subject",
				    	sortable : true,
				    	label : taskLang["폴더 제목"],
				    	render : function(model) {
				    		return '<a data-tag="goFolder" data-id="' + model.id + '">' +
				    			'<span class="txt">' + model.get("name") + '</span>' + 
			    			'</a>';
				    	}
				    }, {
				    	name : null,
				    	className : "num",
				    	sortable : false,
				    	label : taskLang["업무수"],
				    	render : function(model) {
				    		return '<span class="num">' + model.get("taskCount") +'</span>';
				    	}
				    }],
					
				});
				this.gridView.render();
				this.collection.fetch();
			}
		});
		return ClosedFolderListView;
	});
}).call(this);