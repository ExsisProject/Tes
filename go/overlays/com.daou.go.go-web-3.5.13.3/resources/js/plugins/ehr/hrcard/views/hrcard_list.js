(function() {
    define([
        "jquery", 
        "backbone",
        "app", 
        "hgn!hrcard/templates/hrcard_list",
        "hrcard/collections/position_list",
        "i18n!nls/commons",
        "i18n!hrcard/nls/hrcard",
        "jquery.go-grid", 
        "jquery.go-popup",
        "GO.util"
    ], 
    
    function(
        $,
        Backbone, 
        App,
        TplHrcardList,
        positionCollection,
        commonLang,
        hrcardLang
    ) {
    	var lang = {
    			"status" : hrcardLang["계정상태"],
    			"online" : commonLang["정상"],
    			"stop" : commonLang["중지"],
    			"dormant" : commonLang["휴면"],
    			"mail" : commonLang["메일"],
    			"noResult" : hrcardLang["조회할 목록이 없습니다."],
    			"totalCnt" : hrcardLang["전체명수"],
    			"search" : commonLang["검색"],
    			"empno" : hrcardLang["사번"],
    			"deptName" : commonLang["소속"],
    			"name" : commonLang["이름"],
    			"email" : commonLang["이메일"],
    			"directTel" : hrcardLang["내선번호"],
    			"company" : hrcardLang["전사"],
    			"dept" : hrcardLang["부서"],
    			"position" : hrcardLang["직위"],
    			"subDeptInclude" : hrcardLang["하위부서 포함"],
    			"hrcard" : hrcardLang["인사정보"]
		};
    	
    	var layoutView = Backbone.View.extend({
    		unbindEvent: function() {
    			this.$el.off("change", "#position");
    			this.$el.off("change", "#status");
    			this.$el.off("click", ".btn-search");
    			this.$el.off("keydown", "div.search_wrap input");
    			this.$el.off("click", "#includeSubDept input");
    			this.$el.off("click", "#hrcardListSearch");
    			this.$el.off("click", "#hrcardInfo");
    			
    		}, 
    		
    		bindEvent: function() {
    			this.$el.on("change", "#position", $.proxy(this.positionFilter, this));
    			this.$el.on("change", "#status", $.proxy(this.statusFilter, this));
    			this.$el.on("click", ".btn-search", $.proxy(this.search, this));
    			this.$el.on("keydown", "div.search_wrap input", $.proxy(this.searchKeyboardEvent, this));
    			this.$el.on("click", "#includeSubDept input" ,$.proxy(this.checkIncludeSubDept, this));
    			this.$el.on("click", "#hrcardListSearch" ,$.proxy(this.search, this));
    			this.$el.on("click", "#hrcardListDataTable tbody tr" , $.proxy(this.hrcardInfo,this))
    		}, 
    		initialize: function(options) {
    			this.options = options || {};    			
    			this.unbindEvent();
    			this.bindEvent();
    			
    			//전사 혹은 부서 인사정보 인지 아닌지(all / dept)
    			this.range = this.options.range;
    			this.deptId = this.options.deptId || "";
    			this.positions = positionCollection.getCollection();
    			//this.isManager = hrcardManagerModel.get().getIsManager();
    			
    		},
    		render : function() {
    			var _this = this;
    			this.positions.on("reset",function(collection,response){
    				_this.$el.html(TplHrcardList({
    					lang : lang,
        				positions : _this.positions.toJSON()
        			}));
        			_this.loadTable();    				
    			});
    			
    			return this;
    			
    		},
    		checkIncludeSubDept : function(e){
    			//하위부서 포함 체크 여부에 따라
    			
    			var target = $(e.currentTarget);    			
    			var	url = GO.contextRoot + "api/ehr/hrcard/dept/"+this.deptId+"?" +  $.param({includeSubDept : target.is(":checked")});		
   				this.dataTable.tables.fnSettings().sAjaxSource = url;
   				this.dataTable.tables.fnClearTable();
    			
    		},
    		getUrl : function(){
    			var url = ""; 
    			if(this.range == "all"){
    				url = GO.contextRoot + "api/ehr/hrcard/all"; 
    			}else{
    				url = GO.contextRoot + "api/ehr/hrcard/dept/"+this.deptId+"?" +  $.param({includeSubDept : false});
    			}
    			return url;
    			
    		},
    		hrcardInfo : function(e){
    			var target = $(e.currentTarget);
    			var infoId = target.find("td span").attr("data-id");
    			GO.router.navigate("ehr/hrcard/detail/" + infoId , {trigger: true});
    			
    		},
    		loadTable : function() {
    			var self = this;
    			this.dataTable = $.goGrid({
    				el : '#hrcardListDataTable',
    				method : 'GET',
    				url : self.getUrl(),
					bDestroy : true,
    				emptyMessage : "<p class='data_null'> " +
    	                "<span class='ic_data_type ic_no_data'></span>" +
    	                "<span class='txt'>"+lang.noResult+"</span>" +
    	                "</p>",
    				columns : [
    				    { mData : null , bSortable: false, fnRender : function(obj){
    				    	if(obj.aData.employeeNumber != null){
    		            		return obj.aData.employeeNumber;
    		            	}else {
    		            		return "-";
    		            	}
    				    }},
    				    { mData : null , bSortable: false, fnRender : function(obj){
    		            	if(obj.aData.deptName != null){
    		            		return obj.aData.deptName;
    		            	}else {
    		            		return "-";
    		            	}
    		            }},
    		            { mData : "name",bSortable: true, fnRender : function(obj){
    		            	return '<span data-id="'+obj.aData.id+'">'+obj.aData.name+'</span>';
    		            }},
    		            { mData : null , bSortable: false, fnRender : function(obj){
    		            	if(obj.aData.position != null){
    		            		return obj.aData.position;
    		            	}else {
    		            		return "-";
    		            	}
    		            }},
    		    	    { mData : "email",bSortable: true},
    		    	    { mData : null ,bSortable: false, fnRender : function(obj){
    		            	if(obj.aData.directTel != null){
    		            		return obj.aData.directTel;
    		            	}else {
    		            		return "-";
    		            	}
    		            }},
    		    	    { mData: "status", sClass: "align_c", sWidth : "100px",bSortable: false, fnRender : function(obj) {
    		    	    	if(obj.aData.status == 'ONLINE'){
    		    	    		return lang.online;
    		    	    	} else if(obj.aData.status == 'STOP'){
    		    	    		return lang.stop;
    		    	    	} else {
    		    	    		return lang.mail + " " + lang.dormant;
    		    	    	}
    		    	    }}		    	    
    		        ],
    		        fnDrawCallback : function(tables, oSettings, listParams) {    		        	
    		        	var totalCntText = App.i18n(lang['totalCnt'],{"arg1" : oSettings._iRecordsTotal});
    		        	self.$el.find("#totalCnt").html(totalCntText);
    		        	self.$el.find('.custom_header').append(self.$el.find("#listInfo").show());
    		        	if(self.range == "dept"){
    		        		$("#includeSubDept").show();
    		        	}
    		        	self.$el.find('tbody tr').css('cursor','pointer');
    		        }
    			});
    		},
    		positionFilter : function(e) {
                this.changeFilter(e, "positionFilter");
            },
            statusFilter : function(e) {
            	this.changeFilter(e, "statusFilter");
            },
            changeFilter : function(e , key){
            	var value = $(e.currentTarget).val();
                if(typeof this.dataTable.tables.setParam == 'function') {
                    this.dataTable.tables.setParam(key,value);
                }
            },
            search : function() {
    			var searchForm = this.$el.find('.table_search input[type="text"]'),
    				keyword = searchForm.val();		
    			this.dataTable.tables.search(this.$el.find('.table_search select').val(), keyword, searchForm);
    		},
    		searchKeyboardEvent : function(e) {
    			if(e.keyCode == 13) {
    				this.search();
    			}
    		}
    	});
    	
    	return layoutView;
    });
})();