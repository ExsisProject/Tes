(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
	    "hgn!system/templates/data_init",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",	    
	    "jquery.go-grid",
	], 
	
	function(
		$, 
		Backbone,
		App,
		AdminJobTmpl, 
		commonLang,
		adminLang
	) {
		var tmplVal = { };
		
		var DataInitView = App.BaseView.extend({

			events : {
				"click #noti_delete" : "notiDelete",
				"click #login_history_delete" : "loginHistoryDelete",
				"click #delete_document" : "deleteDocument"
			},

			initialize : function() {
			},

			render : function() {
				var self = this;
				$('.breadcrumb .path').html(adminLang["데이터 초기화"]);

				var tmpl = AdminJobTmpl({
					lang : tmplVal,
				});
				this.$el.html(tmpl);
				this.renderAdminJobList();
				return this.$el;
			},
						
			
			notiDelete : function(){
				
				var self = this;
				
				var checkedEls = $("#admin_job_list tbody input[type=checkbox]:checked");
                if(checkedEls.length == 0){
                    return $.goMessage("항목선택");
                } 
                
                if(checkedEls.length > 1){
                    return $.goMessage("1개만 선택");
                } 
                
                var companyId = checkedEls[0].value;
                
                $.goConfirm("알림 히스토리 삭제", "알림 히스토리 삭제 하시겠습니까?", function() {
                	$.goCaution("알림 히스토리 삭제", "삭제된 데이터는 복구 불가합니다. 삭제합니까?", function() {
                		$.go(GO.contextRoot + 'ad/api/noti/company/'+companyId, '', {
                            qryType : "delete",
                            async : false,
                            contentType : 'application/json',
                            responseFn : function(){
                            	$.goMessage("수행완료");
                            },
                            error : function(data){
                            	$.goMessage(data.responseJSON.message);
                            }
                        });
    				}, "삭제");
				}, "삭제");
			},
			
			
			loginHistoryDelete : function(){
				var self = this;
				
				var checkedEls = $("#admin_job_list tbody input[type=checkbox]:checked");
                if(checkedEls.length == 0){
                    return $.goMessage("항목선택");
                } 
                
                if(checkedEls.length > 1){
                    return $.goMessage("1개만 선택");
                } 
                
                var companyId = checkedEls[0].value;
                
                $.goConfirm("로그인 히스토리 삭제", "로그인 히스토리 삭제 하시겠습니까?", function() {
                	$.goCaution("로그인 히스토리 삭제", "삭제된 데이터는 복구 불가합니다. 삭제합니까?", function() {
                		$.go(GO.contextRoot + 'ad/api/login/history/company/'+companyId, '', {
                            qryType : "delete",
                            async : false,
                            contentType : 'application/json',
                            responseFn : function(){
                            	$.goMessage("삭제완료");                    	
                            },
                            error : function(data){
                            	$.goMessage(data.responseJSON.message);
                            }
                        });
    				}, "삭제");
				}, "삭제");
			},
			
			renderAdminJobList : function() {
				var self = this;
				this.$tableEl = this.$el.find('#admin_job_list');
                this.adminJobList = $.goGrid({
                    el : '#admin_job_list',
                    method : 'GET',
                    destroy : true,
                    url : GO.contextRoot + 'ad/api/system/companies',
                    params : this.searchParams,
                    emptyMessage : "<p class='data_null'> " +
                                        "<span class='ic_data_type ic_no_data'></span>" +
                                        "<span class='txt'>없음</span>" +
                                   "</p>",
                    defaultSorting : [[ 1, "asc" ]],
                    sDomType : 'admin',
                    checkbox : true,
                    checkboxData : 'id',
                    columns : [                               
                               { mData: "id", bSortable: true },
                               { mData: "domainName", bSortable: true },
                               { mData: "name", bSortable: true },
                               { mData: "siteUrl", bSortable: true }
                    ],
                    
                    fnDrawCallback : function(obj, oSettings, listParams) {
                    	self.$el.find('#admin_job_list_wrapper .toolbar_top .custom_header').append(self.$el.find('#controlButtons1').show());
                    }
                });
				
			},
			
			deleteDocument : function() {
				var documentIds = $('input[name="documentIds"]').val();		
//				var formIds = $('input[name="formIds"]').val();
				options = {
						ids : documentIds.split(';')
				};
				$.goConfirm("전자결재 삭제", "전자결재 문서를 삭제 하시겠습니까?", function() {
                	$.goCaution("전자결재 삭제", "삭제된 데이터는 복구 불가합니다. 삭제합니까?", function() {
                		$.go(GO.contextRoot + 'ad/api/approval/manage/delete', JSON.stringify(options), {
                            qryType : "delete",
                            async : false,
                            contentType : 'application/json',
                            responseFn : function(){
                            	$.goMessage("삭제완료");                    	
                            },
                            error : function(data){
                            	$.goMessage(data.responseJSON.message);
                            }
                        });
    				}, "삭제");
				}, "삭제");
			}
		},{
			__instance__: null
		});
		return DataInitView;
	});
	
}).call(this);
