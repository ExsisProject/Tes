;(function() {
	define([
			"backbone",
			
			"i18n!nls/commons",
			"i18n!admin/nls/admin",
			"i18n!task/nls/task",
			
			"hgn!admin/templates/task_stats",
			
			"admin/models/task_stats",
			
			"jquery.go-grid"
	], 
	function(
			Backbone,
			
			commonLang,
			adminLang,
			taskLang,
			
			TaskStatsTpl,
			
			TaskStats
	) {
		var lang = {
			"totalFolderCount" : adminLang["총 업무 촐더 수"],
			"count" : taskLang["개"],
			"normal" : adminLang["정상"],
			"stop" : adminLang["중지"],
			"totalTaskCount" : adminLang["총 업무 수"],
			"totalAttachSize" : adminLang["총 사용량"],
			"title" : commonLang["제목"],
			"department" : taskLang["부서"],
			"type" : adminLang["유형"],
			"taskCount" : taskLang["업무수"],
		    "attachSize" : adminLang["사용량"],
		    "status" : adminLang["상태"],
		    "createdAt" : adminLang["생성일"],
		};
		
		
		var TaskStatsView = Backbone.View.extend({
			events : {
				"keypress #searchKeyword" : "enterEventHandler",
				"click #search" : "search",
				"click #download" : "download",
                "click .wrap_action" : "onClickedWrapAction"
			},
			
			
			initialize : function(options) {
				this.stats = new TaskStats();
				this.stats.fetch({async : false});
				
				this.listOption = {
					page : 0,
					offset : 20
				};
			},
			
			
			render : function() {
				this.$el.html(TaskStatsTpl({
					lang : lang,
					stats : this.stats.toJSON(),
					totalCount : this.stats.totalCount(),
					sizeStr : GO.util.byteToMega(this.stats.get("attachSize"))
				}));
				
				this.renderList();
				this.renderButton();
				
				return this;
			},
			
			
			renderList : function() {
				var self = this;
				this.dataTable = $.goGrid({
				    el : this.$("#folderList"),
				    url : GO.contextRoot + "ad/api/task/folder",
				    displayLength : self.listOption.offset,
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
				    	mData : "name", sClass : "title", bSortable : true, fnRender : function(obj) {
				    		return obj.aData.name;
				    	}
				    }, {
				    	mData : "departmentName", sClass : "part", bSortable : true, fnRender : function(obj) {
				    		return obj.aData.departmentName;
				    	}
				    }, {
				    	mData : null, sClass : "", bSortable : false, fnRender : function(obj) {
				    		return (new TaskStats(obj.aData)).typeLabel();
				    	}
				    }, {
				    	mData : "taskCount", sClass : "", bSortable : true, fnRender : function(obj) {
				    		return obj.aData.taskCount;
				    	}
				    }, {
				    	mData : "attachSize", sClass : "", bSortable : true, fnRender : function(obj) {
				    		return GO.util.byteToMega(obj.aData.attachSize);
				    	}
				    }, {
				    	mData : function(folder) { // dueDate key 가 존재하지 않는 경우 dataTables warning
				    		if (!folder) return "closedAt";
			    			return folder.closedAt ? adminLang["중지"] : adminLang["정상"];
				    	}, sClass : "date", bSortable : true, fnRender : function(obj) {}
				    }, {
				    	mData : "createdAt", sClass : "last date", bSortable : true, fnRender : function(obj) {
				    		return GO.util.customDate(obj.aData.createdAt, "YYYY-MM-DD");
				    	}
				    }],
				    fnDrawCallback : function(tables, oSettings, listParams) {
				    }
				});
			},
			
			
			renderButton : function() {
				this.$("div.tool_bar").first().removeClass("toolbar").addClass("toolbar_top header_tb");
				this.$("div.custom_header").append('<span class="btn_tool" id="download">' + adminLang["목록 다운로드"] + '</span>');
			},
			
			
			enterEventHandler : function(e) {
				if (e.which == 13) this.search();
			},
			
			
			search : function() {
	    		var keyword = this.$("#searchKeyword").val();
	    		if (!keyword) {
	    			$.goMessage(taskLang["검색어를 입력해주세요."]);
	    			return;
	    		}
	    		this.listOption["keywordType"] = this.$("#searchType").val();
	    		this.listOption["keyword"] = this.$("#searchKeyword").val();
	    		this.dataTable.tables.fnSettings().sAjaxSource = this.getSearchUrl();
	    		this.dataTable.tables.fnClearTable();
	    	},
	    	
	    	
	    	getSearchUrl : function() {
	    		return GO.contextRoot + "ad/api/task/folder?" + $.param(this.listOption);
	    	},

            onClickedWrapAction : function() {
                this.$el.find('.wrap_action').toggle();
                this.$el.find('.info_summary li').not('.first').toggle();
            },
	    	
	    	download : function() {
				window.location.href = GO.contextRoot + "ad/api/task/folder/download?" + $.param(this.listOption);
	    	}
		});
		
		return TaskStatsView;
	});
}).call(this);