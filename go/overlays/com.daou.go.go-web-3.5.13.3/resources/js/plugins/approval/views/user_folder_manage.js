//부서 문서함 관리
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    
    "approval/views/content_top",
    "approval/views/doclist/user_folderlist_item",
    "approval/models/user_folderlist_item",
    "approval/views/side",
    
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/user_folder_list",
    "hgn!approval/templates/add_org_member",
    "hgn!approval/templates/user_folder_add",
    
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
	UserFolderListItemView,
	UserFolderListItemModel,
	SideView,
	
	DocListEmptyTpl,
	UserFolderListTpl,
	tplAddMember,
	UserFolderAddTpl,
	
    commonLang,
    approvalLang
) {
	
	var UserFolderList = Backbone.Collection.extend({
		model: UserFolderListItemModel,
		url: function() {
			return '/api/approval/userfolder/' + this.userId;
		},
		setUserId: function(userId) {
			this.userId = userId;
		}
	});
	
	var UserFolderModel = Backbone.Model.extend({
		url: function() {
			var url = ['/api/approval/userfolder', this.userId,'folder'].join('/');
			return url;
		},
		setUserId: function(userId) {
			this.userId = userId;
		}
	}); 

	var UserFolderSortModel = Backbone.Model.extend({
		url: function(){
			return '/api/approval/userfolder/'+this.userId+'/folder/sort';
		},
		setUserId: function(userId) {
			this.userId = userId;
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
			"개인 문서함명" : approvalLang["개인 문서함명"],
			"개인 문서함 폴더명을 입력하세요" : approvalLang["개인 문서함 폴더명을 입력하세요"],
			'개인 문서함 관리' : approvalLang['개인 문서함 관리'],
			"이미 동일한 이름의 문서함이 있습니다" : approvalLang["이미 동일한 이름의 문서함이 있습니다"],
			"개인 문서함 이관" : approvalLang["개인 문서함 이관"],
			"설정" : commonLang["설정"],
			"이 문서함의 공유 설정은 모두 초기화됩니다" : approvalLang["이 문서함의 공유 설정은 모두 초기화됩니다"],
			"문서함" : approvalLang["문서함"],
			"자동분류" : approvalLang["자동분류"]
		};
	
	var UserFolderListView = Backbone.View.extend({
		columns: {
			'선택' : approvalLang.선택,
			'count' : 5
		},
		initialize: function(options) {
			this.contentTop = ContentTopView.getInstance();
			this.userId = GO.session("id");
			
			this.collection = new UserFolderList();
			this.collection.setUserId(this.userId);
			this.collection.bind('reset', this.generateList, this);
			this.collection.fetch({reset:true});
			
		},
		events: {
			'click .tab_menu > li' : 'selectTab',
			'click #changeSelect' : 'changeSelect',
			'click div.critical .btnSortable' : 'changeSort',
			'click div.critical .btnAdd' : 'addFolder',
			'click div.critical .btnDelete' : 'deleteFolder',
			"click #migration" : "callOrg"
    	},
		render: function() {
			this.$el.html(UserFolderListTpl({
				lang: lang				
			}));
			this.contentTop.setTitle(lang['개인 문서함 관리']);
    		this.contentTop.render();
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
		},	
		
		// 탭 이동
		selectTab: function(e) {
			if($(e.currentTarget).attr("class") === "active") return false;

			var tabId = $(e.currentTarget).attr('id');
			var url = "/approval/";
			
			if (tabId == 'tab_user_folder') {
				url += "userfolder/manage";		
			} else if (tabId == 'tab_folder_classify') {
				url += "userfolder/classify/manage";
			}
			
			GO.router.navigate(url, {trigger: true});
			$('html, body').animate({
				scrollTop : 0
			});
	
		},
		
		generateList: function(folderlist) {
			$('.tb_part_doc > tbody').empty();
			var columns = this.columns;
			folderlist.each(function(folder){
				var folderListItemView = new UserFolderListItemView({
					lang : lang,
					model: folder,
					columns: columns,
					userId: this.userId
					//type: 'up_dept'
				});
				
				$('.tb_part_doc > tbody').append(folderListItemView.render().el);
			});
				
			if (folderlist.length == 0) {
				$('.tb_part_doc > tbody').html(DocListEmptyTpl({		
					columns : columns,
					lang: { 'doclist_empty': approvalLang['문서함이 없습니다'] }
				}));
			}
			
		},
		
		changeSort : function(e){
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
			this.$el.find('.btnSortable').addClass('btn_save').find('span.txt').html(approvalLang['순서바꾸기 완료']);
			this.$el.find('.btnAdd').hide();
			this.$el.find('.btnDelete').hide();
			this.$el.find('#migration').hide();
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
			        ui.placeholder.html("<td colspan='5'>&nbsp;</td>");
			    }
			}).sortable('enable');
			
		},
		actionListSortPut : function(e) {
			var sortableBody = this.$el.find('#tableList tbody'),
				sortIds = sortableBody.find('.subject').map(function(k,v) {
					return $(v).attr('data-id');
				}).get();

			if (sortIds) {
				var model = new UserFolderSortModel();
				model.setUserId(this.userId);
				model.save({'ids' : sortIds}, {type : 'PUT'});
				//SideView.reload(true);
			}
			this.$el.find('.btnSortable').removeClass('btn_save').find('span.txt').html(approvalLang['순서 바꾸기']);
			this.$el.find('.btnAdd').show();
			this.$el.find('.btnDelete').show();
			this.$el.find('#migration').show();
			this.$el.find('#tableList tbody').removeClass().sortable('disable');
			SideView.reload(true);
		},
		
		changeSelect : function(){
			if ($("#changeSelect").is(":checked")) { 
				$('td.check :checkbox:not(checked)').attr("checked", true); 
			} else { 
				$('td.check :checkbox:checked').attr("checked", false); 
			}
					
		},
		
		addFolder : function(){
			var self = this;
			 $.goPopup({
				"pclass" : "layer_normal",
				"header" : lang['개인 문서함 추가'],
				"modal" : true,
				"width" : 370,
				"contents" :  UserFolderAddTpl({lang: lang}),
				"buttons" : [{
								'btext' : commonLang["확인"],
								'btype' : 'confirm',
								'autoclose' : false,
								'callback' : function(rs) {
									self.userFolderAdd(rs);
								}
							},
							{
								'btext' : commonLang["취소"],
								'btype' : 'cancel'
							}]
			});
		},
		userFolderAdd : function(rs){
			var self = this;
			var userFolderName = $('#userFolderName').val();
			if(this.validate(userFolderName)){
				var model = new UserFolderModel();
				model.setUserId(this.userId);
				model.set({ 'userId' : this.userId, 'folderName' : userFolderName}, { silent : true });
				model.save({}, {
		            success: function() {
                        $.goMessage(approvalLang['문서함이 추가되었습니다.']);
		            	self.collection.fetch({reset:true});
		            	rs.close();
		            	SideView.reload(true);
		            },
		            error : function(model,rs){
						var result = JSON.parse(rs.responseText);
		            	$.goError(result.message);
		            }
				});
			}
		},
		
		deleteFolder : function(){
			var self = this;
			var deleteFolderIds = []; 
			var columns = this.columns;
			var checkCount = 0;
			
			$('td.check :checkbox:checked').each(function(){
				deleteFolderIds.push($(this).val());
				checkCount++;
			});
			if(checkCount == 0){
				$.goMessage(approvalLang["선택된 항목이 없습니다."]);
				return false;
			}
			
			$.goConfirm(approvalLang['문서함 삭제 경고 내용'],
				'',
				function() {
					if (deleteFolderIds.length) {
						var preloader = $.goPreloader();
						preloader.render();
						$.ajax({
		                    "url": GO.config("contextRoot") + 'api/approval/userfolder/' + self.deptId + '/folder',                    
		                    "contentType": 'application/json', 
		                    "dataType": "json", 
		                    "data": JSON.stringify({ "ids": deleteFolderIds }), 
		                    "type": "DELETE", 
		                    "success": function(rs) {
		                    	if(deleteFolderIds.length > 1){
		                    		$.goMessage(GO.i18n(approvalLang['복수개 문서함삭제 안내메시지'], {"arg1": deleteFolderIds.length}));
		                    	}else if(deleteFolderIds.length == 1){
		                    		var folderName = self.$('#tableList tbody input:checkbox:checked').closest('tr').find('td.subject').text();
		                    		$.goMessage(GO.i18n(approvalLang['문서함삭제 안내메시지'], {"arg1": folderName}));
		                    	}
		                    	
		                    	$('td.check :checkbox:checked').each(function(){
		                    		$(this).parents('tr:first').remove();
		            			});
		                    	
		                    	if($('.tb_part_doc > tbody tr').size() == 0){
		                    		$('.tb_part_doc > tbody').html(DocListEmptyTpl({
		                    			columns: columns,
		            					lang: { 'doclist_empty': approvalLang['문서함이 없습니다'] }
		            				}));
		                    	}
		                    	$('#changeSelect').attr("checked", false); 
		                    	SideView.reload(true);
		                    	preloader.release();
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
		validate: function(keyword) {
            var self = this;
            if(!keyword) {
                $.goMessage(lang["개인 문서함 폴더명을 입력하세요"]);
                self.$el.find("#userFolderName").focus();
                return false;
            }
            if(keyword.length < 2 || keyword.length > 20) {
            	$.goMessage(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"20"}));
            	self.$el.find("#userFolderName").focus();                    
                return false;
            }
            return true;
        }, 
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		},
		
		getCheckedFolderIds : function() {
			return _.map(this.$("input[type=checkbox][value]:checked"), function(checkbox) {
				return $(checkbox).val();
			});
		},
		
		migration : function(targetId, type) {
			var self = this;
			var checkedData = this.getCheckedFolderIds();
			var url = GO.contextRoot + 'api/approval/userfolder/transfertouser/' + targetId;
			if(type == "MEMBER"){ //개인
				url = GO.contextRoot + 'api/approval/userfolder/transfertouser/' + targetId;
			}else if(type == "org"){ //부서
				url = GO.contextRoot + 'api/approval/userfolder/transfertodept/' + targetId;
			}
			$.ajax({
                url: url,
                data: JSON.stringify({ ids : checkedData}), 
                type: 'PUT',
                dataType: 'json',
                contentType : "application/json",
                success: function(resp) {
                	$.goOrgSlide.close();
                	$.goMessage(approvalLang["이관되었습니다."]);
                	self.collection.fetch({reset:true});
                	SideView.reload(true);
                },
                error : function(xhr, status, error){
                	var result = JSON.parse(xhr.responseText);
                	$.goError(result.message);
                }
            });
		},
		
		callOrg : function() {
			if (this.$("input[type=checkbox][value]:checked").length == 0) {
				$.goMessage(approvalLang["선택된 항목이 없습니다."]);
				return;
			}
			
			var self = this;
			$.goOrgSlide({
				type : "node",
				contextRoot : GO.contextRoot,
				useApprReference : true,
				useDisableNodeStyle : true,
				callback : $.proxy(function(info) {
					var type = info.type != 'org' ? 'user' : 'dept';
					if(type != 'dept' && GO.session('id') == info.id){
						$.goError(approvalLang['선택된 대상을 추가 할 수 없습니다']);
						return false;
					}else if(type == 'dept' && !info.useReference){
						$.goError(approvalLang['선택된 대상을 추가 할 수 없습니다']);
						return false;						
					}
					var content = 
						'<p class="add">' +
						GO.i18n(approvalLang["문서함 이관 확인"],{arg1 : info.displayName ? info.displayName : info.name}) + 
						'</p>' + 
						'<p class="txt_caution">※ '+ lang["이 문서함의 공유 설정은 모두 초기화됩니다"] +'</p>';
					
					$.goConfirm(lang["개인 문서함 이관"], content, function() {
						self.migration(info.id, info.type);
					});
				}, this)	
			});
		}
	});
	
	return UserFolderListView;
});