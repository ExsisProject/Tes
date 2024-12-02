;(function() {
	define([
			"backbone",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        "hgn!task/templates/folder_admin",
	        "task/models/task_department_folder",
	        "task/models/task_folder",
	        "task/views/task_title",
	        "task/views/side",
	        
	        "jquery.ui",
	        "jquery.go-sdk",
	        "jquery.go-orgslide"
	], 
	function(
			Backbone,
			App,
			
			commonLang,
			taskLang,
			FolderAdminTmpl,
			TaskDeptFolder,
			TaskFolder,
			TaskTitleView,
			SideView
	) {
		var lang = {
				"stop" : commonLang["중지"],
				"edit" : commonLang["수정"],
				"save" : commonLang["저장"],
				"delete" : commonLang["삭제"],
				"cancel" : commonLang["취소"],
				"setting" : commonLang["설정"],
				"addSeparator" : commonLang["구분선 추가"],
				"transferFolder" : commonLang["폴더 이관"],
				"setOrder" : taskLang["순서 바꾸기"],
				"orderComplte" : taskLang["순서바꾸기 완료"],
				"taskFolderName" : taskLang["업무 폴더명"],
				"admin" : taskLang["운영자"],
				"createdAt" : taskLang["개설일"],
				"taskCount" : taskLang["업무수"],
				"isEmpty" : taskLang["목록이 없습니다"]
		};
		
		
		var folderItem = Hogan.compile(
				'<tr data-type="folder" data-folderId="{{folder.id}}">' +
					'<td class="checkbox"><input type="checkbox" data-folderId="{{folder.id}}"></td>' +
					'<td class="subject">' + 
						'<a data-tag="folder" data-folderId="{{folder.id}}">' + 
							'<span class="txt">{{folder.name}}</span>' + 
						'</a>' + 
					'</td>' +
					'<td class="name"><span class="txt">{{adminLabel}}</span></td>' +
					'<td class="date"><span class="date">{{createdAt}}</span></td>' +
					'<td class="num"><span class="num">{{folder.taskCount}}</span></td>' +
					'<td class="setting">' +
						'<span class="wrap_btn_m" data-tag="setting" data-folderId="{{folder.id}}">' +
							'<span class="ic_setting"></span>' +
						'</span>' +
					'</td>' +
				'</tr>'
		);
		
		
		var SeparatorItemTpl = Hogan.compile(
			'<tr data-type="separator">' +
				'<td colspan="6" class="depart_bg align_l" data-tag="view">' +
					'&lt;<span class="title_depart vm" data-tag="content">{{separator.name}}</span>&gt;' +
					'<span class="btn_fn7 vm" data-tag="editSeparator">{{lang.edit}}</span>' +
					'<span class="btn_fn7 vm" data-tag="deleteSeparator">{{lang.delete}}</span>' +
				'</td>' +
				'<td colspan="6" class="depart_bg align_l" data-tag="edit" style="display:none;">' +
					'<input type="text" class="input w_medium vm">&nbsp;' +
					'<span class="btn_fn7 vm save" data-tag="saveSeparator">{{lang.save}}</span>&nbsp;' +
					'<span class="btn_fn7 vm cancel" data-tag="cancelSeparator">{{lang.cancel}}</span>' +
				'</td>' +
			'</tr>'
		);

		
		var FolderAdminView = Backbone.View.extend({
			events : {
				"click span[data-tag=editSeparator]" : "editSeparator",
				"click span[data-tag=deleteSeparator]" : "deleteSeparator",
				"click span[data-tag=saveSeparator]" : "saveSeparator",
				"click span[data-tag=cancelSeparator]" : "cancelSeparator",
				"click span[data-tag=setting]" : "goFolderSetting",
				"click a[data-tag=folder]" : "goFolder",
				"click a[data-tag=order]" : "orderList",
				"click a[data-tag=orderComplete]" : "orderComplete",
				"click a[data-tag=separator]" : "addSeparator",
				"click a[data-tag=close]" : "closeConfirm",
				"click a[data-tag=delete]" : "deleteConfirm",
				"click a[data-tag=transfer]" : "callOrg",
				"click #checkAllAdmin" : "checkAll",
				
			},
			
			
			initialize : function(options) {
				this.options = options || {};
				this.dept = new TaskDeptFolder(this.options);
				
				this.defaultSeparator = {
					name : taskLang["구분선"],
					separator : true
				};
			},
			
			
			dataFetch : function() {
				return this.dept.fetch({
					statusCode: {
						400 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
						403 : function() { GO.util.error('403', { "msgCode": "400-common"}); }, 
						404 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
						500 : function() { GO.util.error('500'); }
					}
				});
			},
			
			
			render : function() {
				this.$el.addClass("go_renew");
				this.$el.html(FolderAdminTmpl({
					dept : this.dept.toJSON(),
					lang : lang,
					isEmpty : this.dept.isEmptyfolder()
				}));
				
				var taskTitleView = new TaskTitleView({
					title : taskLang["업무 폴더 관리"],
					subTitle : this.dept.get("name")
				});
				this.$el.find(".content_top").html(taskTitleView.el);
				taskTitleView.render();
				
				this.renderList();
				return this;
			},

			
			renderList : function() {
				var listEl = this.$el.find("tbody");
				_.each(this.dept.get("folders"), function(item) {
					if (!item.deptId) {
						listEl.append(SeparatorItemTpl.render({
							lang : lang,
							separator : item
						}));
					} else {
						var folder = new TaskFolder(item);
						listEl.append(folderItem.render({
							folder : folder.toJSON(),
							adminLabel : folder.minAdminLabel(taskLang["외"], commonLang["명"]),
							createdAt : GO.util.basicDate2(folder.get("createdAt"))
						}));
					}
				}, this);
			},
			
			
			orderList : function() {
				this.$el.find("a[data-tag=order]").hide();
				this.$el.find("a[data-tag=orderComplete]").show();
				this.$el.find("tbody").removeClass().sortable({
					opacity : "1",
					delay: 100,
					cursor : "move",
					items : "tr",
					containment : ".content_page",
					hoverClass: "ui-state-hover",
					forceHelperSize : "true",
					helper : "clone",
					placeholder : "ui-sortable-placeholder",
				    start : function (event, ui) {
				        ui.placeholder.html("<td colspan='5'>&nbsp;</td>");
				    }
				});	
			},
			
			
			combinedItems : function() {
				return _.map($("tbody").find("tr"), function(item) {
					if ($(item).attr("data-type") == "folder") {
						return _.find(this.dept.getFolders(), function(folder) {
							return folder.id == $(item).attr("data-folderId"); 
						});
					} else {
						return {
							name : $(item).find("span[data-tag=content]").text(),
							separator : true
						};
					}
				}, this);
			},
			
			
			submit : function(message) {
				var self = this;
				var deferred = $.Deferred();
				var items = this.combinedItems();
				
				$.go(GO.contextRoot + "api/task/folder/dept/" + self.dept.get("id") + "/", JSON.stringify(items), {
	    			contentType : 'application/json',
        			qryType : 'put',
        			responseFn : function(rs) {
        				GO.util.store.set("sideItem", "department" + self.dept.id, {type : "session"});
        				SideView.render();
        				$.goMessage(message);
        				deferred.resolve();
        			},
	    			error : function(resp) {
            			$.goError(resp.responseJSON.message);
            		}
        		});
				
				return deferred;
			},
			
			
			orderComplete : function() {
				var self = this;
				
				this.submit(commonLang["변경되었습니다."]).done(function() {
					self.dept.fetch().done(function() {
						self.render();
					});
				});
			},
			
			
			addSeparator : function() {
				this.$el.find("tbody").append(SeparatorItemTpl.render({
					lang : lang,
					separator : this.defaultSeparator
				}));
				this.submit(taskLang["추가되었습니다."]);
			},
			
			
			editSeparator : function(e) {
				var separator = $(e.currentTarget).parents("tr");
				var content = separator.find("span[data-tag=content]").text();
				separator.find("td[data-tag=view]").hide();
				separator.find("td[data-tag=edit]").show();
				separator.find("input").val(content);
			},
			
			
			deleteSeparator : function(e) {
				$(e.currentTarget).parents("tr[data-type=separator]").remove();
				this.submit(commonLang["삭제되었습니다."]);
			},
			
			
			saveSeparator : function(e) {
				var separator = $(e.currentTarget).parents("tr");
				var content = separator.find("input").val();
				separator.find("td[data-tag=view]").show();
				separator.find("td[data-tag=edit]").hide();
				separator.find("span[data-tag=content]").text(content);
				this.submit(commonLang["변경되었습니다."]);
			},
			
			
			cancelSeparator : function(e) {
				var separator = $(e.currentTarget).parents("tr");
				separator.find("td[data-tag=view]").show();
				separator.find("td[data-tag=edit]").hide();
				separator.find("input").val("");
			},
//			
//			
//			
//			adminStr : function(admins) {
//	    		if (admins.length == 0) return;
//				var adminStr = admins[0].name + " " + admins[0].position || "";
//				if (admins.length > 1) {
//					adminStr = adminStr + " " + taskLang["외"] + " " + (admins.length - 1) + commonLang["명"];
//				}
//				return adminStr;
//	    	},
//	    	
//	    	
	    	goFolder : function(e) {
	    		var id = $(e.currentTarget).attr("data-folderId");
	    		GO.util.store.set("sideItem", "departmentFolder" + id, {type : "session"});
	    		GO.util.store.set("taskFolderId", null, {type : "session"});
	    		App.router.navigate("task/folder/" + id + "/task", true);
	    	},
	    	
	    	
	    	goFolderSetting : function(e) {
	    		var id = $(e.currentTarget).attr("data-folderId");
	    		GO.util.store.set("sideItem", "departmentFolder" + id, {type : "session"});
	    		GO.util.store.set("taskFolderId", null, {type : "session"});
	    		App.router.navigate("task/folder/" + id, true);
	    	},
	    	
	    	
	    	checkAll : function(e) {
	    		var isChecked = $(e.currentTarget).is(":checked");
	    		$("input[type=checkbox][data-folderId]").attr("checked", isChecked);
	    	},
	    	
	    	
	    	getQueryString : function() {
	    		var str = "";
	    		_.each($("input[type=checkbox][data-folderId]:checked"), function(folder) {
	    			str = str + "id=" + $(folder).attr("data-folderId") + "&";
	    		});
	    		return str;
	    	},
	    	
	    	
	    	isNotSelected : function() {
	    		var checkedFolders = $("input[type=checkbox][data-folderId]:checked");
	    		if (!checkedFolders.length) return true;
	    		return false;
	    	},
	    	
	    	
	    	closeConfirm : function() {
	    		var self = this;
	    		if (this.isNotSelected()) {
	    			$.goAlert(taskLang["중지할 폴더를 선택해주세요."]);
	    		}else{
	    			$.goPopup({
	    				title : taskLang["폴더 중지"],
	    				message  : taskLang["폴더 중지 설명"],
	    				buttons : [{
	    					btype : "confirm",
	    					btext : commonLang["확인"],
	    					callback : function() {
	    						self.closeFolders();
	    					}
	    				}, {
	    					btext : commonLang["취소"],
	    					callback : function() {
	    					}
	    				}]
	    			});
	    		}
	    	},
	    	
	    	
	    	closeFolders : function() {
	    		var self = this;
	    		
	    		$.ajax({
					type : "PUT",
					dataType : "json",
					url : GO.contextRoot + "api/task/folder/stop?" + self.getQueryString(),
					success : function(resp) {
						$.goMessage(commonLang["변경되었습니다."]);
						GO.util.store.set("sideItem", "closedFolder", {type : "session"});
						GO.util.store.set("taskFolderId", null, {type : "session"});
						App.router.navigate("task/dept/close", true);
					},
	    			error : function(resp) {
            			$.goError(resp.responseJSON.message);
            		}
				});
	    	},
	    	
	    	
	    	deleteConfirm : function() {
	    		var self = this;
	    		if (this.isNotSelected()){
	    			$.goAlert(taskLang["삭제할 폴더를 선택해주세요."]);
	    		}else{
	    			$.goPopup({
	    				title : taskLang["폴더 삭제"],
	    				message  : taskLang["폴더 삭제 설명"],
	    				buttons : [{
	    					btype : "confirm",
	    					btext : commonLang["확인"],
	    					callback : function() {
	    						self.deleteFolders();
	    					}
	    				}, {
	    					btext : commonLang["취소"],
	    					callback : function() {
	    					}
	    				}]
	    			});
	    		}
	    	},
	    	
	    	
	    	deleteFolders : function() {
	    		var self = this;
	    		
	    		$.ajax({
	    			type : "DELETE",
	    			dataType : "json",
	    			url : GO.contextRoot + "api/task/folder?" + self.getQueryString(),
	    			success : function(resp) {
	    				GO.util.store.set("sideItem", "department" + self.dept.id, {type : "session"});
	    				SideView.render();
	    				$.goMessage(commonLang["삭제되었습니다."]);
	    				self.dept.fetch({
	    					success : function() {
	    						self.render();
	    					}
	    				});
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
        				GO.util.store.set("sideItem", "department" + self.dept.id, {type : "session"});
        				SideView.render();
        				$.goMessage(taskLang["이관되었습니다."]);
        				self.dept.fetch({
        					success : function() {
        						self.render();
        					}
        				});
        			},
	    			error : function(resp) {
            			$.goError(resp.responseJSON.message);
            		}
        		});
	    	},
	    	
	    	
	    	getIds : function() {
	    		var ids = [];
	    		_.each($("input[type=checkbox][data-folderId]:checked"), function(folder) {
	    			ids.push(parseInt($(folder).attr("data-folderId")));
	    		});
	    		return {ids : ids};
	    	},
	    	
	    	
	    	callOrg : function() {
	    		var self = this;
				if (this.isNotSelected()) {
					$.goAlert(taskLang["이관할 폴더를 선택해주세요."]);
				}else{
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
				}
			}
		});
		return FolderAdminView;
	});
}).call(this);