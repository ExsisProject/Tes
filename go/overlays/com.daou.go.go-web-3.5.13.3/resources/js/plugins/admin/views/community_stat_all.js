define([
	"jquery",
	"backbone", 	
	"app",
    "hgn!admin/templates/community_stat_all",
    "hgn!admin/templates/list_empty",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "jquery.go-popup",
    "jquery.go-sdk",
    "jquery.go-grid",
    "GO.util",
    "jquery.go-validation"
], 

function(
	$,
	Backbone,
	App,
	communityStatAllTmpl,
	emptyTmpl,
	commonLang,
	adminLang
) {
	var instance = null,
		tmplVal = {
			label_total_community : adminLang["총 커뮤니티 수"],
			label_community : adminLang["소속 커뮤니티"],
			label_total_board : adminLang["총 게시판 수"],
			label_total_post : adminLang["총 게시물 수"],
			label_online : adminLang["정상"],
			label_stop : adminLang["중지"],
			label_classic : adminLang["클래식"],
			label_feed : adminLang["피드"],
			label_count : adminLang["개"],
			label_mb : adminLang["MB"],
			label_total_storage : adminLang["총 사용량"],
			label_down : adminLang["목록 다운로드"],
			label_name : adminLang["커뮤니티 명"],
			label_master : adminLang["마스터"],
			label_created : adminLang["생성일"],
			label_members : adminLang["회원수(명)"],
			label_board : commonLang["게시판"],
			label_boards : adminLang["게시판 수(개)"],
			label_posts : adminLang["게시물 수(개)"],
			label_storage : adminLang["사용량(MB)"],
			label_search : commonLang["검색"],
			label_all : adminLang["전체유형"],
			label_bbs : adminLang["클래식 타입"],
			label_stream : adminLang["피드 타입"],
            label_usage_desc : adminLang["사용량정보 안내"]
	};
	var CommunityList = Backbone.View.extend({
		el : '#layoutContent',

		events:{
			"click .wrap_action" : "onClickedWrapAction"
			
		},
		unbindEvent: function() {
			this.$el.off("click", "span.btn_search");
			this.$el.off("keydown", "span.search_wrap input");
			this.$el.off("change", "#boardType");
			this.$el.off("click", "span#btn_down_all");
		}, 
		bindEvent : function() {
			this.$el.on("click", "span.btn_search", $.proxy(this.search, this));
			this.$el.on("keydown", "span.search_wrap input", $.proxy(this.searchKeyboardEvent, this));
			this.$el.on("change", "#boardType", $.proxy(this.boardTypeFilter, this));
			this.$el.on("click", "span#btn_down_all", $.proxy(this.csvDownloadCommunityAll, this));
			
		},
		initialize: function() {
			this.listEl = '#communityList';
			this.dataTable = null;
			
			this.model = new Backbone.Model();
			this.model.url = GO.contextRoot + "ad/api/community/statistic/all"; 
			this.model.fetch({async : false});
			
			this.unbindEvent();
			this.bindEvent();
		},
        onClickedWrapAction : function() {
            this.$el.find('.wrap_action').toggle();
            this.$el.find('.info_summary li').not('.first').toggle();
        },
		csvDownloadCommunityAll : function() {
			var url = "ad/api/community/statistic/boards/download?";
            var data = this.dataTable.listParams;
            var properties = {
            		"property" : data.property,
            		"direction" : data.direction,
            		"type" : data.type,
            		"keyword" : data.keyword,
            		"searchtype" : data.searchtype
            };
			GO.util.downloadCsvFile(url + GO.util.jsonToUrlParam(properties));
		},
		render : function() {
			this.$el.empty();
			
			var dataset = this.model.toJSON();
			this.$el.html( communityStatAllTmpl({
				model : dataset,
				lang : tmplVal,
				selectType : [{"name":commonLang["게시판"], "value" : "name"},
				              {"name":adminLang["소속 커뮤니티"], "value" : "sortOwnerInfos"}
				],
				totalSize : function() {
					return GO.util.byteToMega(dataset.totalAttachSize);
				}
			}));	
			
			this.renderCommunityList();
		},
		renderCommunityList : function() {
			var self = this;
			this.dataTable = $.goGrid({
				el : this.listEl,
				method : 'GET',
				url : GO.contextRoot + 'ad/api/community/statistic/boards',
				emptyMessage : emptyTmpl({
						label_desc : adminLang["커뮤니티가 없습니다."]
				}),
				defaultSorting : [[ 0, "desc" ]],
				sDomType : 'admin',
				displayLength : App.session('adminPageBase'),
				columns : [
				           { mData : "name", bSortable: true, sClass : "align_l"},
				           { mData: "sortOwnerInfos", sWidth: '150px', bSortable: true},
				           { mData: null, sWidth : "120px", bSortable: false, fnRender : function(obj) {
				        	   if(obj.aData.type == "CLASSIC") {
				        		   return adminLang["클래식"];  
				        	   } else {
				        		   return adminLang["피드"];
				        	   }
				           }},
				           { mData : "postCount", sClass: "align_r", sWidth : "130px", bSortable: true },
				           { mData : "totalSize", sClass: "align_r", sWidth : "130px", bSortable: true, fnRender : function(obj) {
				        	   return GO.util.byteToMega(obj.aData.totalSize);
				           }},
				           { mData : "createdAt", sClass: "align_c", sWidth : "130px", bSortable: true, fnRender : function(obj) {
				        	   return GO.util.shortDate(obj.aData.createdAt); 
				           }}
		        ],
		        fnDrawCallback : function(obj) {
		        	self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#btn_down_all').show());
		        }
			});
		},
		search : function() {
			var searchForm = this.$el.find('.table_search input[type="text"]'),
				keyword = searchForm.val();			
			
			searchForm.trigger('focusout').blur();
			if($.trim(keyword) == ''){
				$.goAlert(commonLang['검색어를 입력하세요.']);
				return;
			}
			if(!$.goValidation.isCheckLength(2,32,keyword)){
				$.goAlert(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"32"}));
				return;
			}
			
			this.dataTable.tables.search(this.$el.find('.table_search select').val(), keyword);
		},
		searchKeyboardEvent : function(e) {
			if(e.keyCode == 13) {
				this.search();
			}
		},
		
		boardTypeFilter : function(e){
            var value = $(e.currentTarget).val();
            if(typeof this.dataTable.tables.setParam == 'function') {
                this.dataTable.tables.setParam("type",value);
            }
        },
	});
	return CommunityList;
});