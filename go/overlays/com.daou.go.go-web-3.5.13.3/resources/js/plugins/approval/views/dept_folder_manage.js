//부서 문서함 관리
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "approval/views/content_top",
    "approval/views/doclist/folderlist_item",
    "approval/models/folderlist_item",
    "approval/views/side",
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/dept_folder_list",
    "hgn!approval/templates/add_org_member",
    "hgn!approval/templates/dept_folder_add",
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
	FolderListItemView,
	FolderListItemModel,
	SideView,
	DocListEmptyTpl,
	DeptFolderListTpl,
	tplAddMember,
	DeptFolderAddTpl,
    commonLang,
    approvalLang
) {
	var DeptFolderList = Backbone.Collection.extend({
		model: FolderListItemModel,
		url: function() {
			return '/api/approval/deptfolder/' + this.deptId;			
		},
		setDeptId: function(deptId) {
			this.deptId = deptId;
		}
	});
	
	var DeptFolderManagerModel = Backbone.Model.extend({
		url: function() {
			var url = ['/api/approval/deptfolder', this.deptId, 'managers'].join('/');
			return url;
		},
		setDeptId: function(deptId) {
			this.deptId = deptId;
		}
	});
	
	var DeptManagerList = Backbone.Collection.extend({
		model: DeptFolderManagerModel,
		url: function() {
			return '/api/approval/deptfolder/'  + this.deptId + '/manager';			
		},
		setDeptId: function(deptId) {
			this.deptId = deptId;
		},
		
		getUserIds : function() {
			return this.map(function(model) {
				return model.get("userId");
			});
		}
	});
	

	var DeptFolderModel = Backbone.Model.extend({
		url: function() {
			var url = ['/api/approval/deptfolder', this.deptId,'folder'].join('/');
			return url;
		},
		setDeptId: function(deptId) {
			this.deptId = deptId;
		}
	}); 

	var DeptFolderSortModel = Backbone.Model.extend({
		url: function(){
			return '/api/approval/deptfolder/'+this.deptId+'/folder/sort';
		},
		setDeptId: function(deptId) {
			this.deptId = deptId;
		}
	});
	
	
	var lang = {
			"부서 문서함 관리" : approvalLang['부서 문서함 관리'],
			"부서 문서함 폴더명" : approvalLang['부서 문서함 폴더명'],
			"부서 문서함명" : approvalLang['부서 문서함명'],
			"부서 문서함 담당자" : approvalLang['부서 문서함 담당자'],
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
			"설정" : commonLang["설정"],
			"이 문서함의 공유 설정은 모두 초기화됩니다" : approvalLang["이 문서함의 공유 설정은 모두 초기화됩니다"],
			"문서함" : approvalLang["문서함"],
			"자동분류" : approvalLang["자동분류"]
		};
	
	var DeptFolderListView = Backbone.View.extend({
		columns: {
			'선택' : approvalLang.선택,
			'count' : 5
		},
		initialize: function(options) {
			this.contentTop = ContentTopView.getInstance();
			this.deptId = options.deptId;
			
			this.managerCollection = new DeptManagerList();
			this.managerCollection.setDeptId(this.deptId);
			this.managerCollection.fetch({async:false});
			
			this.collection = new DeptFolderList();
			this.collection.setDeptId(this.deptId);
			this.collection.bind('reset', this.generateList, this);
			this.collection.fetch({reset:true});
			
		},
		events: {
			'click .tab_menu > li' : 'selectTab',
			'click #changeSelect' : 'changeSelect',
			'click .creat .btn_wrap' : 'addManager',
			'click .btn_wrap .ic_del' : 'deleteManager',
			'click div.critical .btnSortable' : 'changeSort',
			'click div.critical .btnAdd' : 'addFolder',
		    //'click div.critical a:nth-child(2)' : 'addFolder',
			'click div.critical .btnDelete' : 'deleteFolder',
			"click #migration" : "callOrg"
				
    	},
		render: function() {
			var managerData = this.managerCollection.toJSON();
			this.$el.html(DeptFolderListTpl({
				managerData : managerData,
				lang: lang				
			}));
			
			this.contentTop.setTitle(approvalLang['부서 문서함 관리']);
    		this.contentTop.render();
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
    		
		},	
		
		// 탭 이동
		selectTab: function(e) {
			if($(e.currentTarget).attr("class") === "active") return false;

			var tabId = $(e.currentTarget).attr('id');
			var url = "/approval/";
			
			if (tabId == 'tab_dept_folder') {
				url += "deptfolder/manage";		
			} else if (tabId == 'tab_folder_classify') {
				url += "deptfolder/"+this.deptId+"/classify/manage";
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
				var folderListItemView = new FolderListItemView({
					lang : lang,
					model: folder,
					columns: columns,
					deptId : this.deptId,
					type: 'up_dept'
				});
				$('.tb_part_doc > tbody').append(folderListItemView.render().el);
			}, this);
				
			if (folderlist.length == 0) {
				$('.tb_part_doc > tbody').html(DocListEmptyTpl({		
					columns : columns,
					lang: { 'doclist_empty': approvalLang['문서함이 없습니다'] }
				}));
			}
			
		},
		addManager : function(e){
			var self = this;				
			$.goOrgSlide({
				header : approvalLang["담당자 추가"],
				desc : '',
				contextRoot : GO.contextRoot,
				isCustomType : true,
				memberTypeLabel : approvalLang["담당자"],
				externalLang : commonLang,
				isBatchAdd : true,
				callback : function(rs) {
				   	self.addMember(rs);
				}
			});
		},
		
		addMember : function(data) {
			var self = this;
			var targetEl = $('#addMembers');
			if(data && !targetEl.find('li[data-userId="'+ data.id+'"]').length) { 
				var model = new DeptFolderManagerModel();
				var users = _.isArray(data) ? data : [data];
				var userIds = _.map(users, function(user) {
					return user.id;
				});
				var managerIds = this.managerCollection.getUserIds();
				var filtedIds = _.difference(userIds, managerIds);
				
				if (!filtedIds.length) return;
				
				model.setDeptId(self.deptId);
				model.save({},{
					data : JSON.stringify({ids : filtedIds}),
					contentType : "application/json",
					type : 'PUT',
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
							var addedManagers = _.reject(users, function(user) {
								return _.contains(managerIds, user.id);
							});
							_.each(addedManagers, function(data) {
								targetEl.find('li.creat').before(tplAddMember($.extend(data, { lang : lang })));
							});
							self.managerCollection.fetch({async:false});
						}
					},
					error : function(model, response) {
						$.goMessage(commonLang["저장에 실패 하였습니다."]);
					}
				});
			} else {
				$.goMessage(approvalLang["이미 선택되었습니다."]);
			}
		},
		
		deleteManager : function(e){
			var self = this;
			var delId = $(e.currentTarget).parents('li').attr('data-userId');
			
			$.ajax({
                "url": GO.config("contextRoot") + 'api/approval/deptfolder/'  + this.deptId + '/manager',
                "contentType": 'application/json', 
                "dataType": "json", 
                "data": JSON.stringify({ "userId": delId }), 
                "type": "DELETE", 
                "success": function() {
                	$.goMessage(commonLang["저장되었습니다."]);
                	$(e.currentTarget).parents('li').remove();
                	self.managerCollection.fetch({async:false});
                },
                "error" : function(xhr, status, error){
                	var result = JSON.parse(xhr.responseText);
	            	$.goError(result.message);
                }
            });
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
				var model = new DeptFolderSortModel();
				
				model.setDeptId(this.deptId);
				model.save({'ids' : sortIds}, {type : 'PUT'});
				SideView.renderDeptFolder(true);
			}
			
			this.$el.find('.btnSortable').removeClass('btn_save').find('span.txt').html(approvalLang['순서 바꾸기']);
			this.$el.find('.btnAdd').show();
			this.$el.find('.btnDelete').show();
			this.$el.find('#migration').show();
			this.$el.find('#tableList tbody').removeClass().sortable('disable');
			SideView.renderDeptFolder(true);
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
				"header" : approvalLang["부서 문서함 추가"],
				"modal" : true,
				"width" : 370,
				"contents" :  DeptFolderAddTpl({lang: lang}),
				"buttons" : [{
								'btext' : commonLang["확인"],
								'btype' : 'confirm',
								'autoclose' : false,
								'callback' : function(rs) {
									self.deptFolderAdd(rs);
								}
							},
							{
								'btext' : commonLang["취소"],
								'btype' : 'cancel'
							}]
			});
		},
		deptFolderAdd : function(rs){
			var self = this;
			var deptFolderName = $('#deptFolderName').val();
			
			if(this.validate(deptFolderName)){
				var model = new DeptFolderModel();
				model.setDeptId(this.deptId);
				model.set({ 'deptId' : this.deptId, 'folderName' : deptFolderName}, { silent : true });
				model.save({}, {
		            success: function() {
		            	$.goMessage(approvalLang['문서함이 추가되었습니다.']);
		            	self.collection.fetch({reset:true});
		            	rs.close();
		            	SideView.renderDeptFolder(true);
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
		                    "url": GO.config("contextRoot") + 'api/approval/deptfolder/' + self.deptId + '/folder',                    
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
		                    	SideView.renderDeptFolder(true);
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
                $.goMessage(approvalLang["부서 문서함 폴더명을 입력하세요."]);
                self.$el.find("#deptFolderName").focus();
                return false;
            }
            if(keyword.length < 2 || keyword.length > 20) {
            	$.goMessage(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"20"}));
            	self.$el.find("#deptFolderName").focus();                    
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
			var url = GO.contextRoot + 'api/approval/deptfolder/transfertouser/' + targetId;
			if(type == "MEMBER"){ //개인
				url = GO.contextRoot + 'api/approval/deptfolder/transfertouser/' + targetId;
			}else if(type == "org"){ //부서
				url = GO.contextRoot + 'api/approval/deptfolder/transfertodept/' + targetId;
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
					if(type == 'dept' && self.deptId == info.id){
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
					
					$.goConfirm(approvalLang["부서 문서함 이관"], content, function() {
						self.migration(info.id, info.type);
					});
				}, this)	
			});
		}
	});
	
	return DeptFolderListView;
});