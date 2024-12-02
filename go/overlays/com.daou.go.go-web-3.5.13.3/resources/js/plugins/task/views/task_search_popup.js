;(function() {
	define([
			"backbone",
			"app",
			"i18n!nls/commons",
			"i18n!task/nls/task",
			"hgn!task/templates/task_search_popup",
			"task/collections/task_departments",
	        "task/collections/task_folders"
	], 
	function(
			Backbone,
			App,
			commonLang,
			taskLang,
			SearchTpl,
			TaskDepartments,
			TaskFolders
	) {
		
		var lang = {
			context : commonLang["위치"],
			status : taskLang["상태"],
			all : commonLang["전체"],
			keyword : commonLang["검색어"],
			title : commonLang["제목"],
			detail : taskLang["상세내용"],
			activity : taskLang["활동기록"],
			comment : commonLang["댓글"],
			assignee : taskLang["담당자"],
			register : taskLang["등록자"],
			term : commonLang["기간"],
			week : commonLang["주일"],
			directly : taskLang["직접선택"],
			attachName : commonLang['첨부파일 명'],
			attachContent : commonLang['첨부파일 내용']
		};
		
		
		var TaskSearchView = Backbone.View.extend({
			tagName : "form",
			
			events : {
				"change #departments" : "changeDepartment",
				"change #folders" : "changeFolder",
				"change input[type=radio]" : "changeTerm"
			},
			
			
			initialize : function() {
				this.departments = new TaskDepartments();
				this.folders = new TaskFolders();
			},
			
			
			dataFetch : function() {
				return this.departments.fetch();
			},
			
			
			render : function() {
				this.$el.html(SearchTpl({
					lang : lang,
					departments : this.departments.toJSON()
				}));
				
				$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
				this.renderDatePicker();
			},
			
			
			renderDatePicker : function() {
				this.$("#fromDate").datepicker({
					yearSuffix: "",
					dateFormat: "yy-mm-dd", 
					changeMonth: true,
					changeYear: true
                });
				
				this.$("#toDate").datepicker({
					yearSuffix: "",
					dateFormat: "yy-mm-dd", 
					changeMonth: true,
					changeYear: true
				});
			},
			
			
			changeDepartment : function(e) {
				var self = this;
				var deptId = $(e.currentTarget).val();
				var isAllDept = deptId == "all";
				
				this.$("#foldersWrap").toggle(!isAllDept);
				this.$("#statusWrap").toggle(!isAllDept);
				
				if (isAllDept) {
					this.folders.reset([]);
					this.$("#folders").empty();
				} else {
					this.folders.setDeptId(deptId);
					this.folders.fetch().done(function(folders) {
						self.renderFolders(folders.data);
						var folderIds = self.folders.getIds();
						self.getStatus(folderIds);
					});
				}
			},
			
			
			getStatus : function(folderIds) {
				var self = this;
				var deferred = $.Deferred();
				
				this.status = [];
				
				if (!folderIds.length) {
					deferred.resolve();
				} else {
					$.ajax({
						url : GO.contextRoot + "api/task/statuses?" + $.param({folderId : folderIds}),
						success : function(resp) {
							self.status = resp.data;
							deferred.resolve();
						}
					});
				}
				
				deferred.done(function() {
					self.renderStatus(self.status);
				});
				
			},
			
			
			renderFolders : function(folders) {
				this.$("#folders").empty();
				this.$("#folders").append("<option value='all'>" + commonLang["전체"] + "</option>");
				_.each(folders, function(folder) {
					var option = "<option value='" + folder.id + "'>" + folder.name + "</option>";
					this.$("#folders").append(option);
				}, this);
			},
			
			
			renderStatus : function(statuses) {
				this.$("#status").empty();
				this.$("#status").append("<option value=''>" + commonLang["전체"] + "</option>");
				_.each(statuses, function(status) {
					var option = "<option value='" + status + "'>" + status + "</option>";
					this.$("#status").append(option);
				}, this);
			},
			
			
			changeFolder : function(e) {
				var folderIds = [];
				var folderId = this.$("#folders").val();
				
				if (folderId == "all") {
					folderIds = this.folders.getIds();
				} else {
					folderIds.push(folderId);
				}
				
				this.getStatus(folderIds);
			},
			
			
			changeTerm : function(e) {
				var isDirectly = $(e.currentTarget).attr("id") == "radioDirectly";
				
				this.$("input[data-type=datepicker]").prop("disabled", !isDirectly);
				this.renderDatePicker();
				
				if (isDirectly) this.$("input[data-type=datepicker]").val(GO.util.shortDate(new Date()));
			},
			
			
			getSearchParam : function() {
				var date = this.getSearchTerm();
				var folders = this.getFolders();
				var stext = $.trim($('#stext').val());
				var searchParam = {
					stype : "detail",
					name : this.$("#name").attr('checked') ? stext : '',
					content : this.$("#content").attr('checked') ? stext : '',
					activityContents : this.$("#activityContents").attr('checked') ? stext : '',
					comments : this.$("#comments").attr('checked') ? stext : '',
					assignees : this.$("#assignees").val(),
					attachFileNames : this.$("#attachFileNames").attr('checked') ? stext : '',
					attachFileContents : this.$("#attachFileContents").attr('checked') ? stext : '',
					creator : this.$("#creator").val(),
					fromDate : date.fromDate,
					toDate : date.toDate,
					folderIds : folders.ids,
					statusName : this.$("#status").val(),
					folderNames : folders.names.join(", "),
					termName : this.$el.find("input[type=radio]:checked").siblings().text()
				};				
				
				return searchParam;
			},
			
			
			getSearchTerm : function() {
				var term = this.$el.find("input[type=radio]:checked").val();
				var currentDate = GO.util.shortDate(new Date());
				var fromDate = GO.util.toISO8601('1970/01/01');
				var toDate = GO.util.toISO8601(new Date());
				
				if (term == "-1" || term == "-2") {
					fromDate = GO.util.calDate(currentDate, "weeks", term);
				} else if (term == "directly") {
					fromDate = GO.util.toISO8601($("#fromDate").val());
					toDate = GO.util.searchEndDate($("#toDate").val());
				}
				
				return {fromDate : fromDate, toDate : toDate};
			},
			
			
			getFolders : function() {
				var folder = this.$("#folders");
				var folderIds = [];
				var folderNames = [];
				
				if (folder.val() == "all") {
					folderIds = _.map(folder.find("option:gt(0)"), function(folder) {
						return $(folder).val();
					});
					folderNames = _.map(folder.find("option:gt(0)"), function(folder) {
						return $(folder).text();
					});
				} else if (folder.val()) {
					folderIds.push(folder.val());
					folderNames.push(folder.find("option:selected").text());
				}
				
				return {
					ids : folderIds,
					names : folderNames
				};
			},
			
			
			validate : function() {
				var invalidCount = 0;
				/*var attrs = ["name", "content", "activityContents", "comments", "assignees", "creator"];
				_.each(attrs, function(attr) {
					var context = this.$("#" + attr);
					if (context.val().length > 64) {
						$.goError(GO.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."], {arg1 : 64}), context, false, true);
						invalidCount += 1;
					}
				}, this);
				*/
				var creator = $.trim($('#creator').val());
				var assignees = $.trim($('#assignees').val());
				var stext = $.trim($('#stext').val());
				var inputData = [creator,assignees,stext];
				for(var i=0 ; i<inputData.length ; i++){
					if(inputData[i] != ''){
						if(!$.goValidation.isCheckLength(2,64,inputData[i])){
							$.goError(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"64"}));
							//return;
							invalidCount += 1;
						}
						if($.goValidation.isInValidEmailChar(inputData[i])){
							$.goMessage(commonLang['메일 사용 불가 문자']);
							return;
						}
					}
				}
				var isChecked = false;
				$('input[type=checkbox]').each(function() {
					if(this.checked) isChecked = true;
			    });  
				
				if(stext && !isChecked){
					$.goError(commonLang['검색어 구분을 선택해주세요.']); 
					//return;
					invalidCount += 1;
				}
				return invalidCount == 0 ? true : false;
			}
		});
		
		return TaskSearchView;
	});
}).call(this);