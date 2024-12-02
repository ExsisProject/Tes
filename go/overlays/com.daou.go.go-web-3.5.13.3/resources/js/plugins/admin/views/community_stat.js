define([
	"jquery",
	"backbone", 	
	"app",
    "hgn!admin/templates/community_stat",
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
	communityStatTmpl,
	emptyTmpl,
	commonLang,
	adminLang
) {
	var instance = null,
		tmplVal = {
			label_total_community : adminLang["총 커뮤니티 수 :"],
			label_count : adminLang["개"],
			label_mb : adminLang["MB"],
			label_total_storage : adminLang["총 사용량 :"],
			label_down : adminLang["목록 다운로드"],
			label_name : adminLang["커뮤니티 명"],
			label_master : adminLang["마스터"],
			label_created : adminLang["생성일"],
			label_members : adminLang["회원수(명)"],
			label_boards : adminLang["게시판 수(개)"],
			label_posts : adminLang["게시물 수(개)"],
			label_storage : adminLang["사용량(MB)"],
			label_search : commonLang["검색"],
            label_usage_desc : adminLang["사용량정보 안내"]
	};
	var CommunityList = Backbone.View.extend({
		el : '#layoutContent',
		unbindEvent: function() {
			this.$el.off("click", "span.btn_search");
			this.$el.off("keydown", "span.search_wrap input");
			this.$el.off("click", "span#btn_down_community");
		}, 
		bindEvent : function() {
			this.$el.on("click", "span.btn_search", $.proxy(this.search, this));
			this.$el.on("keydown", "span.search_wrap input", $.proxy(this.searchKeyboardEvent, this));
			this.$el.on("click", "span#btn_down_community", $.proxy(this.csvDownloadCommunity, this));
		},
		initialize: function() {
			this.listEl = '#communityList';
			this.dataTable = null;
			this.unbindEvent();
			this.bindEvent();
		},
		csvDownloadCommunity : function() {
			var url = "ad/api/community/statistic/list/download?";
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
            
			this.$el.html( communityStatTmpl({
				lang : tmplVal,
				selectType : [{"name":adminLang["커뮤니티 명"], "value" : "name"} ,
				              {"name":adminLang["마스터"], "value" : "masterUser"}
				],
			}));	
			
			this.renderCommunityList();
		},
		renderCommunityList : function() {
			var self = this;
			this.dataTable = $.goGrid({
				el : this.listEl,
				method : 'GET',
				url : GO.contextRoot + 'ad/api/community/statistic/list',
				emptyMessage : emptyTmpl({
						label_desc : adminLang["커뮤니티가 없습니다."]
				}),
				defaultSorting : [[ 0, "desc" ]],
				sDomType : 'admin',
				displayLength : App.session('adminPageBase'),
				columns : [
				           { mData : "name", bSortable: true, sClass : "align_l"},
				           { mData: "masterUser", sWidth: '150px', bSortable: true , fnRender : function(obj) {
				        	   return obj.aData.masterUser+" "+obj.aData.masterPosition;
				           }},
				           { mData: "boardCount", sClass: "align_r", sWidth : "130px", bSortable: true },
				           { mData : "postCount", sClass: "align_r", sWidth : "130px", bSortable: true },
				           { mData : "totalSize", sClass: "align_r", sWidth : "130px", bSortable: true, fnRender : function(obj) {
				        	   return GO.util.byteToMega(obj.aData.totalSize);
				           }}
		        ],
		        fnDrawCallback : function(obj) {
		        	self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#btn_down_community').show());
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
		}
	});
	return CommunityList;
});