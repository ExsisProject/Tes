(function() {
	define([
		"backbone",
		
		"i18n!nls/commons",
		"i18n!admin/nls/admin",
		"i18n!task/nls/task",
		
		"hgn!admin/templates/task_type_list",
		"admin/models/task_type",
		
	    "jquery.go-grid"
	], 
	
	function(
		Backbone,
		
		commonLang,
		adminLang,
		taskLang,
		
		TaskTypeListTpl,
		TaskType
	) {
		var lang = {
			SHOW : taskLang["정상"],
			HIDDEN : taskLang["숨김"],
			typeName : adminLang["유형명"],
			statusSetting : adminLang["설정 상태"],
			applyFolder : adminLang["적용 폴더"],
			isEnable : adminLang["사용여부"],
			createdAt : adminLang["등록일"],
			administration : commonLang["관리"],
			typeName : adminLang["유형명"],
			statusName : adminLang["상태명"],
			search : commonLang["검색"]
		};
		
		
		var TaskTypeListView = Backbone.View.extend({
			
			events : {
				"keypress #searchKeyword" : "enterEventHandler",
				"click span[data-type=setting]" : "moveToSetting",
				"click #init" : "typeInit",
				"click #moveToCreate" : "moveToCreate",
				"click #checkAll" : "checkAll",
				"click #destroy" : "destroy",
				"click #search" : "search",
				"click #copy" : "movoToCopy"
			},
			
			initialize : function() {
				this.listOption = {
					page : 0,
					size : 20
				};
			},
			
			
			render : function() {
				this.$el.html(TaskTypeListTpl({
					lang : lang
				}));
				this.typeInit("GET");
				
				return this;
			},
			
			
			typeInit : function(param) {
				var type = param == "GET" ? param : "POST";
				var self = this;
				$.ajax({
					url : GO.contextRoot + "ad/api/task/config/init",
					type : type,
					async : false,
					success : function(resp) {
						type == "GET" ? self.beforeInit(resp) : self.afterInit();
					}
				});
			},
			
			
			beforeInit : function(resp) {
				this.isInit = resp.data.init;
				this.renderList();
				this.renderButton();
			},
			
			
			afterInit : function() {
				this.dataTable.tables.fnClearTable();
				this.$("#init").hide();
			},
			
			
			renderList : function() {
				var self = this;
				this.dataTable = $.goGrid({
				    el : this.$("#typeList"),
				    url : GO.contextRoot + "ad/api/task/type",
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
				    	mData : null, sClass : "check", bSortable : false, fnRender : function(obj) {
				    		return '<input data-typeid="' + obj.aData.id + '" type="checkbox" data-folders="' + obj.aData.appliedFolders + '">';
				    	}
				    }, {
				    	mData : "name", sClass : "state", bSortable : true, fnRender : function(obj) {
				    		return '<span data-type="setting" data-id="' + obj.aData.id + '" style="cursor:pointer;">' + obj.aData.name + '</span>';
				    	}
				    }, {
				    	mData : null, sClass : "set", bSortable : false, fnRender : function(obj) {
				    		var type = new TaskType(obj.aData);
				    		return type.statusLabel();
				    	}
				    }, {
				    	mData : "appliedFolders", sClass : "folder", bSortable : true, fnRender : function(obj) {
				    		return obj.aData.appliedFolders;
				    	}
				    }, {
				    	mData : "status", sClass : "", bSortable : true, fnRender : function(obj) {
				    		return lang[obj.aData.status];
				    	}
				    }, {
				    	mData : "createdAt", sClass : "date", bSortable : true, fnRender : function(obj) {
				    		return GO.util.customDate(obj.aData.createdAt, "YYYY-MM-DD");
				    	}
				    }, {
				    	mData : null, sClass : "last action", bSortable : false, fnRender : function(obj) {
				    		return  '<td class="action last">' +
								'<span class="btn_s btn_setting" data-id="' + obj.aData.id + '" data-type="setting">' + adminLang["설정"] + '</span> ' +
								'<span class="btn_s btn_setting" id="copy" data-id="' + obj.aData.id + '">' + commonLang["복사"] + '</span>' +
							'</td>';
				    	}
				    }],
				    fnDrawCallback : function(tables, oSettings, listParams) {
				    }
				});
			},
			
			
			renderButton : function() {
				var btns = ['<span class="btn_tool" id="moveToCreate">' + commonLang["추가"] + '</span>', '<span class="btn_tool txt_caution" id="destroy">' + commonLang["삭제"] + '</span>'];
				if (!this.isInit) btns.unshift('<span class="btn_tool" id="init">' + adminLang["기본 유형 추가"] + '</span>');
				this.$("div.tool_bar").first().removeClass("toolbar").addClass("toolbar_top header_tb");
				this.$("div.custom_header").append(btns.join(""));
			},
			
			
			checkAll : function(e) {
				var isChecked = $(e.currentTarget).is(":checked");
				this.$("input[data-typeid]").attr("checked", isChecked);
			},
			
			
			getIds : function(types) {
	    		var ids = [];
	    		_.each(types, function(type) {
	    			ids.push($(type).attr("data-typeid"));
	    		});
	    		
	    		return {ids : ids};
	    	},
	    	
	    	
	    	validate : function(types) {
	    		var returnFlag = true;
	    		if (!types.length) {
	    			$.goError(taskLang["유형을 선택해 주세요."]);
	    			returnFlag = false;
	    		}
	    		
	    		_.each(types, function(type) {
					if ($(type).attr("data-folders") > 0) {
						$.goError(taskLang["유형이 적용된 폴더가 있으면 삭제할 수 없습니다."]);
						returnFlag = false;
					} 
				});
	    		
	    		return returnFlag;
	    	},
			
			
			destroy : function() {
				var types = this.$("input[data-typeid]:checked");
				
				if (!this.validate(types)) return;
				
				var self = this;
				$.go(GO.contextRoot + "ad/api/task/type", JSON.stringify(self.getIds(types)), {
	    			contentType : 'application/json',
        			qryType : 'DELETE',
        			async : false,
        			responseFn : function(rs) {
        				self.render();
        				$.goMessage(commonLang["삭제되었습니다."]);
        			},
	    			error : function(resp) {
            			$.goError(resp.responseJSON.message);
            		}
        		});
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
	    		return GO.contextRoot + "ad/api/task/type?" + $.param(this.listOption);
	    	},
	    	
	    	
			moveToSetting : function(e) {
	    		var typeId = $(e.currentTarget).attr("data-id"); 
	    		GO.router.navigate("task/type/" + typeId, {trigger : true, pushState : true});
	    	},
	    	
	    	
	    	moveToCreate : function() {
	    		GO.router.navigate("task/type", {trigger : true, pushState : true});
	    	},
	    	
	    	
	    	movoToCopy : function(e) {
	    		var typeId = $(e.currentTarget).attr("data-id"); 
	    		GO.router.navigate("task/type/copy/" + typeId, {trigger : true, pushState : true});
	    	}
		});
		
		return TaskTypeListView;
	});
}).call(this);