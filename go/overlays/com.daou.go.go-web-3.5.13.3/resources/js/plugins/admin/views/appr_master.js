//전사문서함 관리자설정
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
	"approval/models/appr_master_list",
    "hgn!admin/templates/appr_master",
    "hgn!approval/templates/add_org_member",
    "hgn!admin/templates/appr_admin_owners",
	"hgn!admin/templates/appr_admin_owners_data",
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
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
	ApprMasterListModel,
	ApprMasterTpl,
	tplAddMember,
	tplApprAdminOwners,
	tplApprAdminOwnersData,
    commonLang,
    adminLang,
    approvalLang
) {	
	var lang = {
		"기본 정보" : adminLang['기본 정보'],
		"운영자 추가" : adminLang['운영자 추가'],
		"관리자 추가" : adminLang['관리자 추가'],
        "저장" : commonLang["저장"],
		"전사 문서함 운영자 설정" : adminLang['전사 문서함 운영자 설정'],
		"결재문서 관리자 설정" : adminLang['결재문서 관리자 설정'],
		"전사 공문 발송 관리자 설정" : adminLang['전사 공문 발송 관리자 설정'],
		"결재문서 운영자" : adminLang['결재문서 운영자'],
		"결재문서 관리자" : adminLang['결재문서 관리자'],
		"전사 공문 발송 관리자" : adminLang['전사 공문 발송 관리자'],
		"전사 문서함 운영자" : adminLang['전사 문서함 운영자'],
		"취소" : commonLang['취소'],
		"감사" : adminLang['감사'],
		'user' : adminLang['사용자'],
		'delete' : commonLang['삭제'],
		"수정권한" : adminLang['수정권한'],
		"삭제권한" : adminLang['삭제권한'],
		"추가" : adminLang['추가']
	};
	
	var ApprMasterListView = Backbone.View.extend({
	    
		el: '#layoutContent',

		initialize: function() {
			_.bindAll(this, 'render',  'saveMember');
			this.model = new ApprMasterListModel({ isAdmin: true});
			this.model.fetch({
				async:false,
				statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }				
			});
		},
		
		delegateEvents: function(events) {
            this.undelegateEvents();
            Backbone.View.prototype.delegateEvents.call(this, events);
            this.$el.on("click.folderMaster", "ul#addComDocMasterEl span.btn_wrap:has(span.ic_addlist)", $.proxy(this.showMember, this, 'comdoc'));
            //this.$el.on("click.folderMaster", "ul#addDocMasterEl span.btn_wrap:has(span.ic_addlist)", $.proxy(this.showMember, this, 'doc'));
            this.$el.on("click.folderMaster", "#addDocMaster", $.proxy(this.showMember, this, 'doc'));
            this.$el.on("click.folderMaster", "ul#addOfficialDocMasterEl span.btn_wrap:has(span.ic_addlist)", $.proxy(this.showMember, this, 'officialdoc'));
            this.$el.on("click.folderMaster", "span.ic_del", $.proxy(this.deleteMember, this));
            this.$el.on('click.folderMaster', '#addDocMasterTable span.ic_basket', $.proxy(this._deleteDocMaster, this));
            this.$el.on("click.folderMaster", "span#btn_save_appr_master", $.proxy(this.saveMember, this));
            this.$el.on("click.folderMaster", "span#btn_cancel_appr_master", $.proxy(this.cancel, this));
        }, 
        
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.off(".folderMaster");
            return this;
        },
        
		render: function() {
			var self = this;
			this.$el.html(ApprMasterTpl({
				lang: lang,
				companyFolderMasterList : self.model.getCompanyFolderMasters().toJSON(),
				officialDocMasterList : self.model.getOfficialDocMasters().toJSON()
			}));
			this._renderDocMaster();
		},	
		
		showMember : function(type, e){
		    var header;
		    var callback;
		    
		    if (type == 'doc') {
		        header = lang["관리자 추가"];
		        callback = $.proxy(function(data) {
                    this._addMasterTableType(data);
                }, this);
		    } else if (type == 'comdoc') {
		        header = lang["운영자 추가"];
		        callback = $.proxy(function(data) {
                    this.addMaster($('#addComDocMasterEl'), data);
                }, this);
		    } else {
		        header = lang['전사 공문 발송 관리자'];
		        callback = $.proxy(function(data) {
                    this.addMaster($('#addOfficialDocMasterEl'), data);
                }, this);
		    }
		    
			$.goOrgSlide({
				header : header,
				desc : '',
				callback : callback,
				target : e,
				isAdmin : true,
				contextRoot : GO.contextRoot
			});
		},
		
		
		_renderDocMaster: function() {
        	var self = this;
        	var target = $('#addDocMasterTable .in_table');
        	_.each(self.model.get('apprDocMasters'), function(data){
        		if (data && !target.find('tr[data-id="'+ data.userId + '"]').length) {
					if (!target.length) {
						$('#addDocMasterTable').append(
						tplApprAdminOwners({
							lang : lang
						}));
						target = $('#addDocMasterTable .in_table');
					}
					target.find('tbody').append(
							tplApprAdminOwnersData(
							$.extend({
								id: data.userId,
								name: data.userName,
								position: data.userPosition,
								writeChecked: (data.actions.indexOf("write") != -1) ? true : false,
								removeChecked: (data.actions.indexOf("remove") != -1) ? true : false
							}, {
								lang : lang
							})));
				}
        	});
        },
		
		addMaster : function(targetEl, data) {
		    if(data && !targetEl.find('li[data-id="'+data.id+'"]').length) { 
                targetEl.find('li.creat').before(tplAddMember($.extend(data, { lang : lang })));
            } else {
                $.goMessage(approvalLang['이미 선택되었습니다.']);
            }
		},
		
		_addMasterTableType: function(rs){
        	var self = this;
        	var target = $('#addDocMasterTable .in_table');
			if (rs && !target.find('tr[data-id="'+ rs.id + '"]').length) {
				if (!target.length) {
					$('#addDocMasterTable').append(
					tplApprAdminOwners({
						lang : lang
					}));
					target = $('#addDocMasterTable .in_table');
				}
				target.find('tbody').append(
						tplApprAdminOwnersData(
						$.extend(rs, {
							lang : lang
						})));
			}
        },
		
		deleteMember : function(e){
			$(e.currentTarget).parents('li').remove();
		},
		
		_deleteDocMaster : function(e) {
        	var self = this;
			var tables = this.$el.find('#addDocMasterTable>table'), 
				ownersTable = $(tables[0]), 
				target = tables.find('tbody');
			target.find('tr[data-id="' + $(e.currentTarget).attr('data-id') + '"]').remove();
			if (!ownersTable.find('tbody>tr').length) {
				ownersTable.remove();
			}
		},
		
		saveMember : function(){
			var self = this;
			
			if (self.ajaxLoading) {
				return;
			} else {
				self.ajaxLoading = true;
			}

			self.model.clearCompanyFolderMasters();
			$('#addComDocMasterEl input[name=memberId]').each(function(k, v){
				self.model.addCompanyFolderMaster(v.value, "read");
			});

			self.model.clearDocMasters();
			var $adminEl = $("#addDocMasterTable").find("tbody tr");
			_.each($adminEl, function(el){
				var actions = "read";
				if($(el).find('[name=writePermission]').is(':checked')){
					actions += ",write";
				}
				if($(el).find('[name=removePermission]').is(':checked')){
					actions += ",remove";
				}

				var userId = $(el).attr('data-id');
                self.model.addDocMaster(userId, actions);
			});

			self.model.clearOfficialDocMasters();
			$('#addOfficialDocMasterEl input[name=memberId]').each(function(k, v){
				 self.model.addOfficialDocMaster(v.value, "read");
            });
	        
			this.model.save({},{
				type : 'POST',
				success : function(model, response) {
					if(response.code == '200') {
						$.goMessage(commonLang["저장되었습니다."]);
						self.model = new ApprMasterListModel({ isAdmin: true});
						self.model.fetch({
							async:false,
							statusCode: {
			                    403: function() { GO.util.error('403'); }, 
		                        404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
		                        500: function() { GO.util.error('500'); }
			                }
						});
						self.render();
					}
				},
				error : function(model, rs) {
					var responseObj = JSON.parse(rs.responseText);
					if (responseObj.message) {
						$.goError(responseObj.message);
						return false;
					} else {
						$.goError(commonLang['저장에 실패 하였습니다.']);
						return false;
					}
				},
				complete : function() {
					self.ajaxLoading = false;
				}
			});
		},
		
		cancel : function(){
			var self = this;
			$.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function(){
				self.model.fetch({async : false});
				self.render();
				$.goMessage(commonLang["취소되었습니다."]);
			}, commonLang["확인"]);
		}
	});
	return ApprMasterListView
});