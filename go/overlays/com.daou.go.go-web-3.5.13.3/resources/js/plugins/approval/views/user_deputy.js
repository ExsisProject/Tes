//사용자환경설정(부재설정)
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    "approval/views/deputylist_item",
    
    "approval/models/deputy_item",
    "collections/paginated_collection",
    
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/usersetting_userdeputy",
    
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	
	ContentTopView,
	PaginationView,
	PageSizeView,
	DocListItemView,
	
	DocListItemModel,
	PaginatedCollection,
	
	DocListEmptyTpl,
	UserDeputyTpl,
	
    commonLang,
    approvalLang
) {
	var UserDeputy = PaginatedCollection.extend({
		model: DocListItemModel,
		url: function() {
			return '/api/approval/usersetting/deputy' + '?' + $.param({page: this.pageNo, offset: this.pageSize});
		}
	});
	
	var AbsenceDeleteModel = Backbone.Model.extend({
		url : function(){
			var url = '/api/approval/usersetting/deputy';
			return url;
		}
	});
	
	var UserDeputyListView = Backbone.View.extend({
		columns: {
			"부재 추가" : approvalLang['부재 추가'],
			"부재 시작" : approvalLang['부재 시작'],
			"부재 종료" : approvalLang['부재 종료'],
			"대결자" : approvalLang['대결자'],
			"부재 사유" : approvalLang['부재 사유'],
			"사용 여부" : approvalLang['사용 여부'],
			'count': 6
		},
		el: '#content',
		initialize: function() {
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');
			var self = this;
			this.contentTop = ContentTopView.getInstance();
			this.collection = new UserDeputy();
			this.collection.bind('reset', this.resetList, this);
			this.collection.fetch({
				statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }
			});
		},
		events: {
			'click .tab_menu > li' : 'selectTab',
			'click a[data-id = btn_regist_deputy]' : 'goRegist',
			'click input:checkbox' : 'toggleCheckbox',
			'click a[data-id = btn_delete_deputy]' : 'btnDeleteAbsence',
    	},
    	btnDeleteAbsence: function() {
			var self = this;
			var docIds = [];
			var target = $('input[name=checkbox]:checked');
			target.each(function(){
				docIds.push($(this).attr('data-id'));
			});
			if ($.isEmptyObject(docIds)) {
				$.goError(approvalLang["선택된 항목이 없습니다."]);
				return;
			}
			
			var absenceDeleteModel = new AbsenceDeleteModel();
			
			$.goConfirm(approvalLang['부재 설정 삭제'], approvalLang['부재 설정을 삭제하시겠습니까?'],
				function() {
					absenceDeleteModel.set({ 'ids' : docIds }),
					absenceDeleteModel.save({
					}, {
						silent : true,
						type : 'DELETE',
						success : function() {
							$.goMessage(approvalLang["선택한 항목이 삭제되었습니다"]);
							self.$el.find('#checkedAllAbsence').attr('checked', false);
							self.collection.fetch();
						},
						error : function(){
							$.goError(commonLang['저장에 실패 하였습니다.']);
						}
					});
				});
		},
		render: function() {

			var lang = {
					'기본 설정': approvalLang['기본 설정'],
					'부재/위임 설정': approvalLang['부재/위임 설정'],
					'개인 결재선 관리': approvalLang['개인 결재선 관리'],
					"부재 추가" : approvalLang['부재 추가'],
					"삭제" : commonLang['삭제'],
					"부재 시작" : approvalLang['부재 시작'],
					"부재 종료" : approvalLang['부재 종료'],
					"대결자" : approvalLang['대결자'],
					"부재 사유" : approvalLang['부재 사유'],
					"사용 여부" : approvalLang['사용 여부']
			};
			this.$el.html(UserDeputyTpl({
				lang: lang,
				columns: this.columns
			}));
			this.contentTop.setTitle(approvalLang['결재환경설정']);
    		this.contentTop.render();
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
    		this.renderPageSize();
		},
		toggleCheckbox : function(e){
			var $target = $(e.currentTarget),
            $checkAllBox = $('input#checkedAllAbsence'),
            targetChecked = $target.is(':checked');
			
	        if ($target.attr('id') == $checkAllBox.attr('id')) {
	            $('input[type="checkbox"][name="checkbox"]').attr('checked', targetChecked);
	        }
	        
	        if ($target.hasClass('absence_item_checkbox')) {
	            if (!targetChecked) {
	                $checkAllBox.attr('checked', targetChecked);
	            }
	        }
		},
		renderPageSize: function() {
			this.pageSizeView = new PageSizeView({pageSize: this.collection.pageSize});
    		this.pageSizeView.render();
    		this.pageSizeView.bind('changePageSize', this.selectPageSize, this);
		},
		renderPages: function() {
			this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
			this.pageView.bind('paging', this.selectPage, this);
			this.$el.find('div.tool_absolute > div.dataTables_paginate').remove();
			this.$el.find('div.tool_absolute').append(this.pageView.render().el);
		},
		resetList: function(doclist) {
			var fragment = this.collection.url().replace('/api/','');
			//GO.router.navigate(fragment, {trigger: false, pushState: true});
			var bUrl = GO.router.getUrl();
			if (bUrl.indexOf("?") < 0) {
				GO.router.navigate(fragment, {replace: true});
			} else {
				if (bUrl != fragment) {
					GO.router.navigate(fragment, {trigger: false, pushState: true});
				}
			}

			$('.tb_config_absence > tbody').empty();
			var columns = this.columns;
			if(!doclist){
				$('.tb_config_absence > tbody').html(DocListEmptyTpl({
					columns: this.columns,
					lang: { 'doclist_empty': approvalLang['저장된 부재 목록이 없습니다'] }
				}));
				this.renderPages();
				return false;
			}
			
			doclist.each(function(doc){
				var docListItemView = new DocListItemView({ 
					model: doc, 
					columns: columns
				});
				$('.tb_config_absence > tbody').append(docListItemView.render().el);
			});
			if (doclist.length == 0) {
				$('.tb_config_absence > tbody').html(DocListEmptyTpl({
					columns: this.columns,
					lang: { 'doclist_empty': approvalLang['저장된 부재 목록이 없습니다'] }
				}));
			}
			this.renderPages();
		},
		// 탭 이동
		selectTab: function(e) {
			if($(e.currentTarget).attr("class") === "active"){return false};

			// TODO 브라우저 URL 변경
			var tabId = $(e.currentTarget).attr('id');
			var url = "/approval/";
			
			if (tabId == 'tab_user_config') {
				url += "usersetting/userconfig";		
			} else if (tabId == 'tab_user_deputy') {
				url += "usersetting/deputy";
			}
			
			GO.router.navigate(url, {trigger: true});
			$('html, body').animate({
				scrollTop : 0
			});
	
		},
		// 페이지 이동
		selectPage: function(pageNo) {
			this.collection.setPageNo(pageNo);
			this.collection.fetch();
		},
		// 목록갯수 선택
		selectPageSize: function(pageSize) {
			this.collection.setPageSize(pageSize);
			this.collection.fetch();
		},
		// 검색
		search: function() {
			
		},
		
		goRegist : function(e){

			var url = '/approval/usersetting/deputy/regist';
			GO.router.navigate(url, true);
		},
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return UserDeputyListView;
});