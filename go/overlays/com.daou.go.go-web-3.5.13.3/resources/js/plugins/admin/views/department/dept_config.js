define([
	"jquery",
	"backbone", 	
	"app",
	"hgn!admin/templates/dept_config",
    "i18n!admin/nls/admin",
    "i18n!nls/commons",
    "GO.util",
    "jquery.go-grid"
], 

function(
	$, 
	Backbone,
	App,
	deptConfigTmpl,
	adminLang,
	commonLang
) {
	var tplVar = {
		'count' : adminLang['개'],
		'total_dept' : adminLang['총 부서 수'],
		'dept_unit' : adminLang['단위 부서'],
		'dept_name' : adminLang['부서명'],
		'dept_manager' : adminLang['부서장'],
		'dept_manager_name' : adminLang['부서장 이름'],
		'dept_member' : adminLang['부서원(명)'],
		'dept_sub' : adminLang['하위부서(개)'],
		'dept_createat' : adminLang['생성일'],
		'dept_usage' : adminLang['사용량(MB)'],
		'move_to_org' : adminLang['조직도에서 부서 추가하기'],
		'list_to_csv' : adminLang['목록 다운로드'],
		'search' : commonLang['검색'],
        'not_exist_depts' : adminLang['부서없음']
	};

	var DeptConfig = Backbone.View.extend({
		
		initialize : function(options) {
			this.options = options || {};
			this.deptId = this.options.deptId;
		},
		
        events: {
            'click span#btn_down' : 'downloadDeptList',
            'click #deptConfigSearch span.btn_search' : 'search',
            'keydown #deptConfigSearch input[type=text]' : 'searchKeyboardEvent'
        },
        
        render : function() {
			this.listEl = null;
			this.searchParams = this.getSearchParams();	
			this.$el.html(deptConfigTmpl({
				'org_href' : GO.contextRoot + 'admin/dept/org',
				'lang' : tplVar
			}));
			if (this.searchParams['keyword']) this.$el.find('#deptConfigSearch input[type=text]').val(this.searchParams['keyword']);
			if (this.deptId) {
				$("span#btn_down").attr('data-id', this.deptId);
				this.renderDeptList("ad/api/dept/children/" + this.deptId);
			} else {
				this.renderDeptList('ad/api/departments');
			}
			
			return this;
		},
        
		searchParamKeys :  ['page', 'offset' , 'searchtype', 'keyword', 'sortkey', 'sortdir'],
		
		renderDeptList : function(url) {
			var self = this;
			this.listEl = $.goGrid({
				el : this.$('#deptList'),
				method : 'GET',
				url : GO.contextRoot + url,
                emptyMessage : "<p class='data_null'> " +
                                    "<span class='ic_data_type ic_no_data'></span>" +
                                    "<span class='txt'>"+tplVar.not_exist_depts+"</span>" +
                                "</p>",
				params : this.searchParams,
				defaultSorting : [[ 0, "asc" ]],
				sDomType : 'admin',
				displayLength : App.session('adminPageBase'),
				columns : [
				           { mData : "name", bSortable: true, fnRender : function(obj) {
				        	   return '<span data-id="'+obj.aData.id+'">'+obj.aData.name+'</span>';				        	   
				           }},
				           { mData: "masterName", sWidth: '150px', bSortable: true, fnRender : function(obj) {
				        	   return '<span data-id="'+obj.aData.masterUserId+'">'+obj.aData.masterName+ ' ' + obj.aData.masterPositionName + '</span>';				       
				           } },
				           { mData: "memberCount", sClass: "align_r", sWidth: '120px', bSortable: true, sWidth : "100px" },
				           { mData: "childrenCount", sClass: "align_r", sWidth : "120px", bSortable: true, fnRender : function(obj){
				        	   return '<span data-id="'+obj.aData.id+'">'+obj.aData.childrenCount+'</span>';
				           } },
				           { mData: "createdAt", sClass: "align_c", sWidth: "100px", fnRender : function(obj) {
				        	   return GO.util.shortDate(obj.aData.createdAt);
				           }}
		        ],
		        fnDrawCallback : function(obj, oSettings, listParams) {
		        	//목록 상단 버튼 
		        	self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
		        	
		        	self.$el.find('#deptTotalCount').html(oSettings._iRecordsTotal);
		        	self.$el.find('tr>td:nth-child(1)').css('cursor', 'pointer').click(function(e) {
		        		App.router.navigate('dept/'+$(e.currentTarget).find('span').attr('data-id'), {trigger: true});
		        	});
		        	
		        	self.$el.find('tr>td:nth-child(2)').css('cursor', 'pointer').click(function(e) {
		        		if($(e.currentTarget).find('span').attr('data-id') !== ''){
		        			App.router.navigate('account/'+$(e.currentTarget).find('span').attr('data-id'), {trigger: true});
		        		}
		        	});
		        	
		        	self.$el.find('tr>td:nth-child(4)').css('cursor', 'pointer').click(function(e) {
		        		App.router.navigate('dept/children/'+$(e.currentTarget).find('span').attr('data-id'), {trigger: true});
		        	});
		        }
			});
			
		},
		_addSearchParam : function(newParams, paramOnly) {
			var getUrl = App.router.getUrl(),
				searchParams = this.getSearchParams(),
				newParams = newParams;
			
			$.each(this.searchParamKeys, function(k,v) {
				if(newParams.hasOwnProperty(v)) searchParams[v] = newParams[v];
			});
			App.router.navigate(getUrl.split('?')[0] +'?'+this._serializeObj(searchParams));
		},
		_serializeObj : function(obj) {
			var str = [];
			for(var p in obj) {
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			}
			return str.join("&");
		},
		getSearchParams : function() {
			var search = App.router.getSearch(),
				returnParams = search || {};
			
			returnParams['page'] = parseInt(search['page'],10) || 0;//-1
			returnParams['offset'] = search['offset'] || '';
			return returnParams;
		},
		searchKeyboardEvent : function(e) {
			if(e.keyCode == 13) {
				this.search();
			}
		},
		search : function() {
			var searchForm = this.$el.find('.table_search input[type="text"]'),
				keyword = searchForm.val();
			
			this.listEl.tables.search(this.$el.find('.table_search select').val(), keyword, searchForm);
		},
		downloadDeptList : function(e) {
			var id = $(e.currentTarget).attr('data-id');
			var url = null;
			if(id == null){
				url = "ad/api/departments/download?";
			}else{
				url = "ad/api/dept/children/download/" + id +"?";
			}
            var data = this.listEl.listParams;
            var properties = {
            		"property" : data.property,
            		"direction" : data.direction,
            		"searchtype" : data.searchtype,
            		"keyword" : data.keyword
            };
			GO.util.downloadCsvFile(url + GO.util.jsonToUrlParam(properties));
		}
	});
	
	return DeptConfig;
});