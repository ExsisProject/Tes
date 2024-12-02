//부서 문서함 관리
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    
    "approval/views/content_top",
    "approval/views/doclist/rulelist_item",
    "approval/views/create_rule",
    "approval/views/side",
    
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/doc_classify_list",
    
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
	"jquery.go-popup",
    "jquery.go-orgslide",
    "jquery.go-validation"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	
	ContentTopView,
	RuleListItemView,
	CreateRuleView,
	SideView,
	
	DocListEmptyTpl,
	DocClassifyListTpl,
	
    commonLang,
    approvalLang
) {
	
	var UserRuleSortModel = Backbone.Model.extend({
		url: function(){
			if(this.deptId){
				return '/api/approval/classify/dept/rule/reorder/' + this.deptId;
			}
			return '/api/approval/classify/user/rule/reorder';
		},
		setDeptId : function(deptId){
			this.deptId = deptId;
		}
	});
	
	var ApprClassificationRuleList = Backbone.Collection.extend({
		url: function() {
			if(this.deptId){
				return '/api/approval/classify/dept/' + this.deptId + '/rulelist';
			}
			return '/api/approval/classify/user/' + this.userId + '/rulelist';
		},
		setUserId: function(userId) {
			this.userId = userId;
		},
		setDeptId : function(deptId) {
			this.deptId = deptId;
		}
	});
	
	var ApprClassificationRuleOwnerModel = Backbone.Model.extend({
		url: function(){
			if(this.deptId){
				return '/api/approval/classify/dept/owner/' + this.deptId;
			}
			return '/api/approval/classify/owner';
		},
		setDeptId : function(deptId) {
			this.deptId = deptId;
		}
	});
	var lang = {
			"담당자 추가" : approvalLang['담당자 추가'],
			"순서 바꾸기" : approvalLang['순서 바꾸기'],
			"삭제" : commonLang['삭제'],
			"추가" : commonLang['추가'],
			"문서함 이름" : approvalLang['문서함 이름'],
			"생성일" : approvalLang['생성일'],
			"삭제" : commonLang['삭제'],
			"문서 개수" : approvalLang['문서 개수'],
			"수정" : commonLang["수정"],
			"수정완료" : commonLang["수정완료"],
			"취소" : commonLang["취소"],
			"migration" : approvalLang["문서함 이관"],
			"개인 문서함 추가" : approvalLang["개인 문서함 추가"],
			"부서 문서함 관리" : approvalLang["부서 문서함 관리"],
			"개인 문서함명" : approvalLang["개인 문서함명"],
			"개인 문서함 폴더명을 입력하세요" : approvalLang["개인 문서함 폴더명을 입력하세요"],
			'개인 문서함 관리' : approvalLang['개인 문서함 관리'],
			"이미 동일한 이름의 문서함이 있습니다" : approvalLang["이미 동일한 이름의 문서함이 있습니다"],
			"개인 문서함 이관" : approvalLang["개인 문서함 이관"],
			"설정" : commonLang["설정"],
			"이 문서함의 공유 설정은 모두 초기화됩니다" : approvalLang["이 문서함의 공유 설정은 모두 초기화됩니다"],
			"문서함" : approvalLang["문서함"],
			"자동분류" : approvalLang["자동분류"],
			"자동분류 규칙" : approvalLang["자동분류 규칙"],
			"적용함" : approvalLang["적용함"],
			"적용하지 않음" : approvalLang["적용하지 않음"],
			"분류규칙" : approvalLang["분류규칙"],
			"분류 조건" : approvalLang["분류 조건"],
			"보관문서함" : approvalLang["보관문서함"],
			"관리" : approvalLang["관리"],
			"저장" : commonLang['저장'],
			"취소" : commonLang['취소']
	};
	
	var DocClassifyListView = Backbone.View.extend({
		columns: {
			'선택' : approvalLang.선택,
			'count' : 5
		},
		initialize: function(options) {
			this.options = options || {};
			this.deptId = this.options.deptId;
			this.contentTop = ContentTopView.getInstance();
			this.userId = GO.session("id");
			
			this.collection = new ApprClassificationRuleList();
			this.model = new ApprClassificationRuleOwnerModel();
			if(this.deptId){
				this.collection.setDeptId(this.deptId);
				this.model.setDeptId(this.deptId);
			}else{
				this.collection.setUserId(this.userId);
			}

			this.collection.bind('reset', this.generateList, this);
			this.collection.fetch({reset:true});
			
			this.model.fetch({async : false});
			
		},
		events: {
			'click .tab_menu > li' : 'selectTab',
			'click #saveApplyRuleSetting' : 'saveApplyRuleSetting',
			'click div.critical .btnReorder' : 'reorderRules',
			'click div.critical .btnCreate' : 'createRule',
			"click tbody .subject" : "updateRule",
			'click div.critical .btnDelete' : 'deleteRule',
			'click #checkAll' : 'checkAll'
    	},
		render: function() {
			this.$el.html(DocClassifyListTpl({
				lang: lang,
				model : this.model.toJSON()
			}));
			if(this.deptId){
				this.contentTop.setTitle(lang['부서 문서함 관리']);
			}else{
				this.contentTop.setTitle(lang['개인 문서함 관리']);
			}
    		this.contentTop.render();
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
		},	
		
		// 탭 이동
		selectTab: function(e) {
			if($(e.currentTarget).attr("class") === "active") return false;

			var tabId = $(e.currentTarget).attr('id');
			var url = "/approval/";
			
			if (tabId == 'tab_folder') {
				if(this.deptId){
					url += "deptfolder/"+this.deptId+"/manage";
				}else{
					url += "userfolder/manage";		
				}
			} else if (tabId == 'tab_folder_classify') {
				if(this.deptId){
					url += "deptfolder/"+this.deptId+"/classify/manage";
				}else{
					url += "userfolder/classify/manage";
				}
			}
			
			GO.router.navigate(url, {trigger: true});
			$('html, body').animate({
				scrollTop : 0
			});
	
		},
		
		saveApplyRuleSetting : function() {
			this.model.set({'inUse' : $('#apply').is(':checked')}, { silent : true });
			this.model.save({}, {
				type : 'PUT',
				success: function() {
                    $.goMessage(commonLang['저장되었습니다.']);
	            },
	            error : function(model,rs){
					var result = JSON.parse(rs.responseText);
	            	$.goError(result.message);
	            }});
			
		},
		
		generateList: function(ruleList) {
			$('.tb_part_doc > tbody').empty();
			var columns = this.columns;
			ruleList.each(function(rule){
				var ruleListItemView = new RuleListItemView({
					lang : lang,
					model: rule,
					columns: columns,
					userId: this.userId
				});
				
				$('.tb_part_doc > tbody').append(ruleListItemView.render().el);
			});
				
			if (ruleList.length == 0) {
				$('.tb_part_doc > tbody').html(DocListEmptyTpl({		
					columns : columns,
					lang: { 'doclist_empty': approvalLang['분류규칙이 없습니다'] }
				}));
			}
			
		},
		
		reorderRules : function(e){
			var self = this;
			if(self.$el.find('.data_null').size() == 0 ){
				if($(e.currentTarget).find("span.txt").text() == approvalLang['순서 바꾸기']){
					self.listSortable(e);
				}else{
					self.actionListSortPut(e);
				}
			}else{
				$.goMessage(approvalLang['문서함이 없습니다']);
				return false;
			}
		},
		
		listSortable : function(e) {
			this.$el.find('.btnReorder').addClass('btn_save').find('span.txt').html(approvalLang['순서바꾸기 완료']);
			this.$el.find('.btnCreate').hide();
			this.$el.find('.btnDelete').hide();
			this.$el.find('input:checkbox').parent('th').hide();
			this.$el.find('input:checkbox').parent('td').hide();
			this.$el.find('#tableList>tbody').sortable({
				opacity : "1",
				delay: 100,
				cursor : "move",
				items : "tr",
				containment : ".content_page",
				hoverClass: "ui-state-hover",
				forceHelperSize : "true",
				helper : "clone",
				placeholder : "ui-sortable-placeholder",
			    start : function (event, ui) {
			        ui.placeholder.html("<td colspan='3'>&nbsp;</td>");
			    }
			}).sortable('enable');
			
		},
		
		actionListSortPut : function(e) {
			var sortableBody = this.$el.find('#tableList tbody'),
				sortIds = sortableBody.find('.subject').map(function(k,v) {
					return $(v).attr('data-id');
				}).get();

			if (sortIds) {
				var model;
				if(this.deptId){
					model = new UserRuleSortModel();
					model.setDeptId(this.deptId);
				}else{
					model = new UserRuleSortModel();
				}
				model.save({'ids' : sortIds}, {type : 'PUT'});
			}
			this.$el.find('.btnReorder').removeClass('btn_save').find('span.txt').html(approvalLang['순서 바꾸기']);
			this.$el.find('.btnCreate').show();
			this.$el.find('.btnDelete').show();
			this.$el.find('input:checkbox').parent('th').show();
			this.$el.find('input:checkbox').parent('td').show();
			this.$el.find('#tableList tbody').sortable('destroy');
		},
		
		changeSelect : function(){
			if ($("#changeSelect").is(":checked")) { 
				$('td.check :checkbox:not(checked)').attr("checked", true); 
			} else { 
				$('td.check :checkbox:checked').attr("checked", false); 
			}
					
		},
		
		createRule : function(){
			var self = this;
			var createRuleView;
			if(self.deptId){
				createRuleView = new CreateRuleView({deptId: self.deptId});
			}else{
				createRuleView = new CreateRuleView();
			}
			 var popupView = $.goPopup({
				"pclass" : "layer_normal layer_auto",
				"header" : lang['자동분류'],
				"modal" : true,
				"width" : 380,
				"contents" :  "",
				"buttons" : [{
								'btext' : commonLang["확인"],
								'btype' : 'confirm',
								'autoclose' : false,
								'callback' : function(rs) {
									if(createRuleView.validate()){
										createRuleView.createRule().done(function(){
											self.collection.fetch({reset:true});
										});
										rs.close();
									}
								}
							},
							{
								'btext' : commonLang["취소"],
								'btype' : 'cancel'
							}]
			});
			 popupView.find(".content").html(createRuleView.render().el);
			 popupView.reoffset();
		},
		
		 updateRule : function(e){
			 if($(e.currentTarget).parents('tbody').hasClass('ui-sortable')){
				 return;
			 }
			 
			 var ruleId = $(e.currentTarget).attr('data-id');
			 var self = this;
			 var createRuleView;
			 if(self.deptId){
				 createRuleView = new CreateRuleView({deptId: self.deptId , ruleId : ruleId});
			 }else{
				 createRuleView = new CreateRuleView({ruleId : ruleId});
			 }
			 var popupView = $.goPopup({
				 "pclass" : "layer_normal layer_auto",
				 "header" : lang['자동분류'],
				 "modal" : true,
				 "width" : 380,
				 "contents" :  "",
				 "buttons" : [{
					 'btext' : commonLang["확인"],
					 'btype' : 'confirm',
					 'autoclose' : false,
					 'callback' : function(rs) {
						 if(createRuleView.validate()){
							 createRuleView.createRule().done(function(){
								 self.collection.fetch({reset:true});
							 });
							 rs.close();
						 }
					 }
				 },
				 {
					 'btext' : commonLang["취소"],
					 'btype' : 'cancel'
				 }]
			 });
			 popupView.find(".content").html(createRuleView.render().el);
			 popupView.reoffset();
		 },
		
		deleteRule : function(){
			var self = this;
			var deleteRuleIds = []; 
			var columns = this.columns;
			var checkCount = 0;
			
			$('td.check :checkbox:checked').each(function(){
				deleteRuleIds.push($(this).val());
				checkCount++;
			});
			if(checkCount == 0){
				$.goMessage(approvalLang["선택된 항목이 없습니다."]);
				return false;
			}
			var url = GO.config("contextRoot") + 'api/approval/classify/user/rule';
			if(this.deptId){
				url = GO.config("contextRoot") + 'api/approval/classify/dept/'+this.deptId+'/rule'
			}
			
			$.goConfirm(approvalLang['문서함 삭제 경고 내용'],
				'',
				function() {
					if (deleteRuleIds.length) {
						var preloader = $.goPreloader();
						preloader.render();
						$.ajax({
		                    "url": url,                    
		                    "contentType": 'application/json', 
		                    "dataType": "json", 
		                    "data": JSON.stringify({ "ids": deleteRuleIds }), 
		                    "type": "DELETE", 
		                    "success": function(rs) {
		                    	preloader.release();
		                    	self.collection.fetch({reset:true});
		                    	$.goMessage(commonLang["삭제되었습니다."]);
		                    },
		                    "error" : function(xhr, status, error){
		                    	var result = JSON.parse(xhr.responseText);
				            	$.goError(result.message);
				            	preloader.release();
		                    }
		                });
					}
				});
						
		},
		
		checkAll : function(){
			if ($("#checkAll").is(":checked")) { 
				$('td.check :checkbox:not(checked)').attr("checked", true); 
			} else { 
				$('td.check :checkbox:checked').attr("checked", false); 
			}
					
		},

        // 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return DocClassifyListView;
});