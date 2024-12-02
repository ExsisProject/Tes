define([
    "jquery", 
    "backbone", 
    "app",  
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "hgn!admin/templates/board_statistics",
    "hgn!admin/templates/board_statistics_top",
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
	layoutTopTpl,
	tplBbsNull,
	adminLang
) {
	var lang = {
		'board_null' : adminLang['등록된 게시판이 없습니다.'],
		'BBS' : adminLang['클래식'],
		'STREAM' : adminLang['피드'],
		'count' : adminLang['개'],
		'mb' : adminLang['MB'],
		'total_board' : adminLang['총 게시판 수'],
		'total_post' : adminLang['총 게시물 수'],
		'total_size' : adminLang['총 사용량'],
		'board_statistics' : adminLang['전체 게시판 통계'],
		'title' : commonLang['제목'],
		'dept' : adminLang['소유부서'],
		'board_type' : adminLang['전체유형'],
		'board_bbs' : adminLang['클래식 타입'],
		'board_feed' : adminLang['피드 타입'],
		'post_count' : adminLang['게시물 개수'],
		'usage' : adminLang['사용량(MB)'],
		'board_create' : adminLang['생성일'],
		'board_title' : adminLang['게시판 제목'],		
		'search' : commonLang['검색'],
		'alert_keyword' : commonLang['검색어를 입력하세요.'],
		'alert_length' : adminLang['0자이상 0이하 입력해야합니다.'],
		'label_down' : adminLang["목록 다운로드"],
		'status' : adminLang["상태"],
		'active' : adminLang["정상"],
		'closed' : adminLang["중지"],
		'loading' : adminLang["로딩중"]
	};
	var instance = null;
	var boardStatisticList = Backbone.View.extend({
        events:{
            "click .wrap_action" : "onClickedWrapAction"
        },
		unbindEvent: function() {
			this.$el.off("click", "span.btn_search");
			this.$el.off("click", "#csvDownLoadBtn");
			this.$el.off("keydown", "span.search_wrap input");
			this.$el.off("change", "#boardType");
			this.$el.off("change", "#boardStatus");
		}, 
		bindEvent : function() {
			this.$el.on("click", "span.btn_search", $.proxy(this.search, this));
			this.$el.on("click", "#csvDownLoadBtn", $.proxy(this.csvDownLoad, this));
			this.$el.on("keydown", "span.search_wrap input", $.proxy(this.searchKeyboardEvent, this));
			this.$el.on("change", "#boardType", $.proxy(this.boardTypeFilter, this));
			this.$el.on("change", "#boardStatus", $.proxy(this.boardStatusFilter, this));
			
		},
		csvDownLoad : function(){
			var url = "ad/api/company/statistic/boards/download?";
            var data = this.dataTableStatistics.listParams;
            var properties = {
            		"property" : data.property,
            		"direction" : data.direction,
            		"type" : data.type,
            		"searchtype" : data.searchtype,
            		"keyword" : data.keyword,
            		"statusFilter" : data.statusFilter
            };
			GO.util.downloadCsvFile(url + GO.util.jsonToUrlParam(properties));
		},
		search : function() {
			var searchForm = this.$el.find('.table_search input[type="text"]'),
				keyword = searchForm.val();		
			
			this.dataTableStatistics.tables.search(this.$el.find('.table_search select').val(), keyword, searchForm);
		},
		searchKeyboardEvent : function(e) {
			if(e.keyCode == 13) {
				this.search();
			}
		},
		initialize: function() {
		},
        onClickedWrapAction : function() {
            this.$el.find('.wrap_action').toggle();
            this.$el.find('.info_summary li').not('.first').toggle();
        },
		renderStatistics : function(){
			
			var dataset = this.statisticsModel.toJSON();
			
			var boardActionParse = function(){
				return adminLang["정상"] + " : " + this.totalActiveBoard;
			};
			var boardClosedParse = function(){
				return  adminLang["중지"] + " : " + this.totalClosedBoard;
			};
			var bbsCountParse = function(){
				return  adminLang["클래식"] + " : " + this.totalBbsPost;
			};
			var feedCountParse = function(){
				return  adminLang["피드"] + " : " + this.totalStreamPost;
			};
			
			var totalSize = function(){
				return GO.util.byteToMega(this.totalAttachSize);
			}
			
			var activeSize = function(){
			    return GO.util.byteToMega(this.activeAttachSize);
			}
			
			var closedSize = function(){
			    return GO.util.byteToMega(this.closedAttachSize);
			}
			
			var tmpl = layoutTopTpl({
				dataset:this.statisticsModel.toJSON(),
				boardActionParse:boardActionParse,
				boardClosedParse:boardClosedParse,
				bbsCountParse:bbsCountParse,
				feedCountParse:feedCountParse,
				totalSize:totalSize,
				activeSize : activeSize,
				closedSize : closedSize,
				lang:lang
			});
			this.$el.find("#content_top").html(tmpl);
		},
		render : function() {
			var _this = this;
			this.companyId = GO.session().companyId;
			this.dataTableStatistics = null;
			this.unbindEvent();
			this.bindEvent();
			
			this.statisticsModel = new Backbone.Model();
			this.statisticsModel.url = GO.contextRoot + "ad/api/company/statistic/board";
			this.statisticsModel.fetch({
				async : true,
				success : function(){
					_this.renderStatistics();
				}
			});
			
			
			var tmpl = layoutTpl({				
				lang:lang});			
			this.$el.html(tmpl);
						
			this.renderDataTables();
			
		},
		boardTypeFilter : function(e){
		    var value = $(e.currentTarget).val();
		    this.changeFilter("type", value);
        },
        
        boardStatusFilter : function(e){
            var value = $(e.currentTarget).val();
            this.changeFilter("statusFilter", value);
        },
        
        changeFilter : function(type , value){
            if(typeof this.dataTableStatistics.tables.setParam == 'function') {
                this.dataTableStatistics.tables.setParam(type,value);
            }
        },
        
		renderDataTables : function() {
			var self = this;
			this.dataTableStatistics = $.goGrid({
				el : '#bbsDataTable',
				type : 'admin',
				method : 'GET',
				url : GO.contextRoot + 'ad/api/company/statistic/boards',
				emptyMessage : tplBbsNull({lang : lang}),
				defaultSorting : [[ 5, "desc" ]],
				sDomType : 'admin',
				params : {
					'page' : this.page
				},
				columns : [
		            { mData : "name",sClass:"title",bSortable: true},
		    	    { mData: "sortOwnerInfos",sClass:"title", bSortable: true, fnRender : function(obj){
		    	    	var ownerDept, owners = obj.aData.owners;
		    	    	_.each(owners, function(owner) {
		    	    		if (owner.ownerShip === "MASTER") {
		    	    			ownerDept = owner.ownerInfo;		    	    			
		    	    		}
		    	    	});
		    	    	return ownerDept;
		    	    }},
		    	    { mData: "type",bSortable: false, sWidth : "120px" , fnRender : function(obj){
		    	    	if(obj.aData.type == "CLASSIC"){
		    	    		return lang['BBS'];
		    	    	}
		    	    	return lang['STREAM'];
		    	    }},
		    	    { mData: null,bSortable: false, sWidth : "120px" , fnRender : function(obj){
		    	        if(obj.aData.status == "ACTIVE"){
		    	            return lang.active;
		    	        }else{
		    	            return lang.closed;
		    	        }
		    	    }},
		    	    { mData: "postCount", sClass: "align_r", bSortable: true, sWidth : "140px" },
		    	    { mData: "totalSize", sClass: "align_r", bSortable: true, sWidth : "140px" , fnRender : function(obj){
		    	    	return GO.util.byteToMega(obj.aData.totalSize);
		    	    }},
		    	    { mData: "createdAt", sClass: "align_c", sWidth : "120px",bSortable: true, fnRender : function(obj) {
		    	    	return GO.util.shortDate(obj.aData.createdAt);
		    	    }}		    	    
		        ],
		        fnDrawCallback : function(tables, oSettings, listParams) {
		        	self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#csvDownLoad').show());
		        	$('.tool_bar .dataTables_length').hide();
		        }
			});
		}
	});
	return boardStatisticList;
});