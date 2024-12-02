;(function() {
	define([
			"backbone",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        "hgn!task/templates/sub_dept_folder_list",
	        "task/collections/task_department_folders",
	        "task/views/task_title",
	        
	        "jquery.go-grid"
	], 
	function(
			Backbone,
			App,
			
			commonLang,
			taskLang,
			FinishFolderListTmpl,
			TaskDeptFolders,
			TaskTitleView
	) {
		var lang = {
				"normal" : taskLang["정상"],
				"stop" : commonLang["중지"],
				"allSubDept" : taskLang["하위부서 전체"],
				"deptName" : commonLang["부서명"],
				"folderName" : taskLang["폴더 제목"],
				"admin" : taskLang["운영자"],
				"taskCount" : taskLang["업무수"],
				"createdAt" : taskLang["개설일"],
				"setting" : commonLang["설정"]
		};
		
		
		var ButtonTpl = Hogan.compile(
			'<span class="wrap_select">' +
				'<select id="selectDepts">' +
					'<option value="">{{lang.allSubDept}}</option>' +
					'{{#subDepts}}' +
					'<option value="{{id}}">{{name}}</option>' +
					'{{/subDepts}}' +
				'</select>' +
			'</span>'
		);
		
		
		var SubDeptFolderList = Backbone.View.extend({
			events : {
				"change #selectDepts" : "changeDept",
				"click span.ic_setup" : "goEditFolder",
				"click span[data-tag=folder]" : "goFolder",
				"click li[data-tag=stateTab]" : "changeTab"
			},
			
			
			initialize : function(options) {
				this.status = options.status || "Live";
				this.listOption = {
					status : this.status, 
					page : 0,
					size : 20
				};
			},
			
			
			dataFetch : function() {
				var self = this;
				
				return $.ajax({
	    			type : "GET",
	    			dataType : "json",
	    			url : GO.contextRoot + "api/department/descendant",
	    			success : function(resp) {
	    				self.subDepts = resp.data;
	    			},
	    			error : function(resp) {
            			$.goError(resp.responseJSON.message);
            		}
	    		});
			},
			
			
			render : function() {
				this.$el.addClass("go_renew");
				this.$el.html(FinishFolderListTmpl({
					lang : lang,
					isLive : this.status == "Live" 
				}));
				
				var taskTitleView = new TaskTitleView({
					title : taskLang["하위 부서 업무 폴더"]
				});
				this.$el.find(".content_top").html(taskTitleView.el);
				taskTitleView.render();
				
				this.renderList();
				this.renderButton();
				return this;
			},
			
			
			renderButton : function() {
				$("div.tool_bar:first").append(ButtonTpl.render({
					lang : lang,
					subDepts : this.subDepts,
				}));
			},
			
			
			goEditFolder : function(e) {
				GO.util.store.set("taskFolderId", null, {type : "session"});
				var folderId = e.currentTarget.getAttribute("data-id");
				App.router.navigate("task/folder/" + folderId, true);
			},
			
			
			goFolder : function(e) {
				GO.util.store.set("taskFolderId", null, {type : "session"});
				var folderId = e.currentTarget.getAttribute("data-id");
				App.router.navigate("task/folder/" + folderId + "/task", true);
			},
			
			
			changeDept : function(e) {
				var deptId = $(e.target).val();
				if (deptId == "") {
					delete this.listOption["subDeptId"];
				} else {
					this.listOption.subDeptId = deptId;
				}
				this.render();
				$("#selectDepts").val(deptId);
			},
			
			
			changeTab : function(e) {
				var target = $(e.currentTarget);
				var status = target.attr("data-status");
				if (this.status == status) return;
				
				$("li[data-tag=stateTab]").toggleClass("active");
				
				this.status = status;
				this.listOption["status"] = status;
				
				var url = GO.contextRoot + "api/task/folder/subdept?" + $.param(this.listOption);
				this.dataTable.tables.fnSettings().sAjaxSource = url;
	    		this.dataTable.tables.fnClearTable();
			},
			
			
			renderList : function() {
				var self = this;
				this.dataTable = $.goGrid({
				    el : "#subDeptFolderList",
				    url : GO.contextRoot + "api/task/folder/subdept?" + $.param(self.listOption),
				    displayLength : self.listOption.size,
				    emptyMessage : '<tr style="display:">' +
										'<td colspan="6">' +
											'<p class="data_null"> ' +
												'<span class="ic_data_type ic_no_contents"></span>' +
												'<span class="txt">' + taskLang["목록이 없습니다"] + '</span>' +
											'</p>' +							
										'</td>' +
									'</tr>',
				    defaultSorting : [],
				    sDomUse : true,
				    columns : [{
				    	mData : "departmentName", sClass : "part", bSortable : true, fnRender : function(obj) {
				    		return '<span class="txt">' + obj.aData.departmentName +'</span>';
				    	}
				    }, {
				    	mData : "name", sClass : "subject", bSortable : true, fnRender : function(obj) {
				    		return '<span class="txt" data-tag="folder" data-id="' + obj.aData.id + '"><a>' + obj.aData.name +'</a></span>';
				    	}
				    }, {
				    	mData : null, sClass : "name", bSortable : false, fnRender : function(obj) {
				    		return '<span class="txt">' + self.userLabel(obj.aData.admins) + '</span>';
				    	}
				    }, {
				    	mData : "taskCount", sClass : "num", bSortable : true, fnRender : function(obj) {
				    		return '<span class="num">' + obj.aData.taskCount +'</span>';
				    	}
				    }, {
				    	mData : "createdAt", sClass : "date", bSortable : true, fnRender : function(obj) {
				    		return '<span class="date">' + GO.util.basicDate2(obj.aData.createdAt) +'</span>';
				    	}
				    }, {
				    	mData : null, sClass : "setting", bSortable : false, fnRender : function(obj) {
				    		return '<a class="btn_bdr"><span class="ic_classic ic_setup" data-id="' + obj.aData.id + '" title="' + commonLang["설정"] + '"></span></a>';
				    	}
				    }],
				    fnDrawCallback : function(tables, oSettings, listParams) {
				    	self.$el.find('.dataTables_paginate').css('padding-top', '40px');
				    }
				});
			},
			
			
			userLabel : function(users) {
	    		if (users.length == 0) return "";
				var userStr = users[0].name + " " + users[0].position || "";
				if (users.length > 1) {
					userStr = userStr + " " + taskLang["외"] + " " + (users.length - 1) + commonLang["명"];
				}
				return userStr;
	    	}
		});
		return SubDeptFolderList;
	});
}).call(this);