define([
    "jquery", 
    "backbone", 
    "app",  
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "hgn!admin/templates/board_statistics_dept",
    "hgn!admin/templates/board_null",
    "i18n!admin/nls/admin",
    "jquery.go-sdk",
    "jquery.go-popup",
    "jquery.go-grid",
    "jquery.ui",
    "GO.util",
    "jquery.go-validation"
], 

function(
	$, 
	Backbone,
	App, 
	commonLang,
	adminLang,
	layoutTpl,
	tplBbsNull,
	adminLang
) {
	var lang = {
		'board_null' : adminLang['부서없음'],
		'board_statistics_dept' : adminLang['부서별 게시판 통계'],
		'dept_title' : adminLang['부서명'],
		'dept_manager' : adminLang['부서장'],
		'board_count' : adminLang['게시판 개수'],
		'post_count' : adminLang['게시물 개수'],
		'usage' : adminLang['사용량(MB)'],				
		'search' : commonLang['검색'],
		'alert_keyword' : commonLang['검색어를 입력하세요.'],
		'alert_length' : adminLang['0자이상 0이하 입력해야합니다.'],
		'label_down' : adminLang["목록 다운로드"]
	};
	var instance = null;
	var boardStatisticList = Backbone.View.extend({
		
		unbindEvent: function() {
			this.$el.off("click", "span.btn_search");
			this.$el.off("click", "#deptcsvDownLoadBtn");
			this.$el.off("keydown", "span.search_wrap input");
		}, 
		bindEvent : function() {
			this.$el.on("click", "span.btn_search", $.proxy(this.search, this));
			this.$el.on("click", "#deptcsvDownLoadBtn", $.proxy(this.csvDownLoad, this));
			this.$el.on("keydown", "span.search_wrap input", $.proxy(this.searchKeyboardEvent, this));
		},
		
		initialize: function() {
			
		},
		csvDownLoad : function(){
			var url = "ad/api/departments/board/stats/download?";
            var data = this.bbsTable.listParams;
            var properties = {
            		"property" : data.property,
            		"direction" : data.direction,
            		"keyword" : data.keyword,
            		"searchtype" : data.searchtype
            };
			GO.util.downloadCsvFile(url + GO.util.jsonToUrlParam(properties));
		},
		render : function() {
			
//			var sessionModel  = sessionUser.read().toJSON();
			this.companyId = GO.session().companyId;
			this.bbsTable = null;
			this.unbindEvent();
			this.bindEvent();
			
			var tmpl = layoutTpl({lang:lang});			
			this.$el.html(tmpl);
						
			this.renderDataTables();
			
		},
		search : function() {
			var searchForm = this.$el.find('.table_search input[type="text"]'),
				keyword = searchForm.val();			
			
			this.bbsTable.tables.search(this.$el.find('.table_search select').val(), keyword, searchForm);
		},
		searchKeyboardEvent : function(e) {
			if(e.keyCode == 13) {
				this.search();
			}
		},
		renderDataTables : function() {
			var self = this;
			this.bbsTable = $.goGrid({
				el : '#bbsDataTable',
				type : 'admin',
				method : 'GET',
				url : GO.contextRoot + 'ad/api/departments/board/stats',
				emptyMessage : tplBbsNull({lang : lang}),
				defaultSorting : [[ 0, "desc" ]],
				sDomType : 'admin',
				params : {
					'page' : this.page
				},
				columns : [
		            { mData : "name" ,sClass:"title", bSortable: true},
		    	    { mData: "masterName",sClass:"title",bSortable: true, sWidth : "200px", fnRender : function(obj){
		    	    	if(obj.aData.masterName==null|| obj.aData.masterName==""){
		    	    		obj.aData.masterName = "-";
		    	    	}
		    	    	return obj.aData.masterName +" "+ obj.aData.masterPositioin;
		    	    }},
		    	    { mData: "boardCnt", sClass: "align_r", bSortable: true, sWidth : "200px"},
		    	    { mData: "postCnt", sClass: "align_r", bSortable: true, sWidth : "200px" },
		    	    { mData: "totalFileSize", sClass: "align_r", bSortable: true, sWidth : "200px", fnRender : function(obj) {
		    	    	return GO.util.byteToMega(obj.aData.totalFileSize);
		    	    } }
		        ],
		        fnDrawCallback : function(tables, oSettings, listParams) {
		        	self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#deptcsvDownLoad').show());
		        	$('.tool_bar .dataTables_length').hide();
		        }
			});
		}
	});
	return boardStatisticList;
});