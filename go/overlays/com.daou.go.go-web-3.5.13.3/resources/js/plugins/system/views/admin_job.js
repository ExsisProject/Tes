(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
	    "hgn!system/templates/admin_job",
	    "hgn!system/templates/admin_job_item_head",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",	    
	    "jquery.go-grid",
	], 
	
	function(
		$, 
		Backbone,
		App,
		AdminJobTmpl, 
		AdminJobItemHeadTmpl, 
		commonLang,
		adminLang
	) {
		/** 재수행 버튼을 사용하는 AdminJob의 JobName 목록 */
		var useReSyncBtn = [
		    'sync_data',
		    're_sync_data',
		    'sync_legacy_db',
            'migration'
        ];

		var tmplVal = {
			deleteJob : commonLang["삭제"],
			detailJob : commonLang["상세"],
			doSyncJob : commonLang["수행"],
		};
		
		var AdminJobView = App.BaseView.extend({

			events : {
				"click #sync_start" : "syncStart",
				"click #sync_detail" : "syncDetail",
				"click #sync_delete" : "syncDelete",

				"click #redo_checked_item" : "syncCheckedJobItem",
				"click #redo_all_failed_item" : "syncAllFailedJobItem",
				"click #show_data_detail" : "showDataDetail"
			},

			initialize : function() {
			},

			render : function() {
				var self = this;
				
				this.$el.empty();
				var tmpl = AdminJobTmpl({
					lang : tmplVal,
				});
				this.$el.html(tmpl);
				this.renderAdminJobList();
				$('.breadcrumb .path').html(adminLang["AdminJob 관리"]);
				return this.$el;
			},
						
			
			syncStart : function(){
				
				$.go(GO.contextRoot + 'ad/api/system/sync/job', '', {
                    qryType : "post",
                    async : false,
                    contentType : 'application/json',
                    responseFn : function(){
                    	$.goMessage(adminLang["수행이 완료되었습니다."]);
                    	App.router.navigate('system/extension/adminjob', {trigger: true});
                    },
                    error : function(data){
                    	$.goMessage(data.responseJSON.message);
                    }
                });
			},
			
			syncDetail : function(){
				var checkedEls = $("#admin_job_list tbody input[type=checkbox]:checked");
                if(checkedEls.length == 0){
                    return $.goMessage(adminLang["항목이 선택되지 않았습니다."]);
                } 
                
                if(checkedEls.length > 1){
                    return $.goMessage(adminLang["항목은 한개만 선택가능합니다."]);
                } 
                
                var jobId = checkedEls[0].value;
                var jobName= checkedEls.parent().parent().find('td:last').text();
                
                if(this.adminJobItemList) {
                	this.adminJobItemList.tables.fnDestroy();
                }
                this.renderAdminJobItemList(jobId, "all", jobName);
                $('#admin_job_item_list').attr('job_id', jobId);
			},
			
			syncDelete : function(){
				var self = this;
				
				var checkedEls = $("#admin_job_list tbody input[type=checkbox]:checked");
                if(checkedEls.length == 0){
                	return $.goMessage(adminLang["항목이 선택되지 않았습니다."]);
                } 
                
                if(checkedEls.length > 1){
                	return $.goMessage(adminLang["항목은 한개만 선택가능합니다."]);
                } 
                
                var jobId = checkedEls[0].value;
                
                $.go(GO.contextRoot + 'ad/api/system/adminjob/'+jobId, '', {
                    qryType : "delete",
                    async : false,
                    contentType : 'application/json',
                    responseFn : function(){
                    	$.goMessage(adminLang["삭제가 완료되었습니다."]);                   	
                    	App.router.navigate('system/extension/adminjob', {trigger: true});
                    },
                    error : function(data){
                    	$.goMessage(data.responseJSON.message);
                    }
                });
                
				
			},
			
			syncCheckedJobItem : function(e) {
				var checkedItemIds = this.adminJobItemList.tables.getCheckedIds();
				if(checkedItemIds.length==0) {
					$.goMessage(adminLang["항목이 선택되지 않았습니다."]);
					return;
				}
				
				var jobId = $('#admin_job_item_list').attr('job_id')
				
				var param = JSON.stringify(checkedItemIds);
                $.go(GO.contextRoot + 'ad/api/system/adminjob/retry/'+jobId, param, {
                    qryType : "post",
                    async : false,
                    contentType : 'application/json',
                    responseFn : function(){
                    	$.goMessage(adminLang["수행이 완료되었습니다."]);                	
                    	App.router.navigate('system/extension/adminjob', {trigger: true});
                    },
                    error : function(data){
                    	$.goMessage(data.responseJSON.message);
                    }
                });
			},
			
			syncAllFailedJobItem : function(e) {
				var jobId= $('#admin_job_item_list').attr('job_id');
				
                $.go(GO.contextRoot + 'ad/api/system/adminjob/retry/all/'+jobId, '', {
                    qryType : "post",
                    async : false,
                    contentType : 'application/json',
                    responseFn : function(){
                    	$.goMessage(adminLang["수행이 완료되었습니다."]);              	
                    	App.router.navigate('system/extension/adminjob', {trigger: true});
                    },
                    error : function(data){
                    	$.goMessage(data.responseJSON.message);
                    }
                });
			},
			
			showDataDetail : function() {
				var checkedIds = this.adminJobItemList.tables.getCheckedIds();
                if(checkedIds.length == 0){
                    return $.goMessage(adminLang["항목이 선택되지 않았습니다."]);
                } 
                
                if(checkedIds.length > 1){
                    return $.goMessage(adminLang["항목은 한개만 선택가능합니다."]);
                } 
                
                var jobItemId = checkedIds[0];
                this.getJobItem(jobItemId)
                .then(function parseItemDataToStr(itemData) {
                	var deferred = $.Deferred();
    				try {
    	                var data = itemData.data;
    	                data = data.substring(data.indexOf('{'), data.length); // Command명 제거
    	                data = JSON.stringify(JSON.parse(data), null, '<br>'); // Json Beautify
    	                data = data.substring(1, data.length-1); // 좌우끝 괄호제거
    	                deferred.resolve(data);
    				} catch(exception) {
    					$.goMessage(commonLang["데이터를 표시할 수 없습니다."]);
    				}
                    return deferred.promise();
    			})
                .then(function renderDataDetailPopup(parsedDataStr) {
            		$.goPopup({
            			pclass: 'layer_normal layer_count',
            			header : adminLang["데이터 상세"],
            			contents: parsedDataStr,
            			buttons : [{
            				btype : 'close',
            				btext : commonLang["닫기"]
            			}]
            		});
    			});
			},
			
            getJobItem : function(jobItemId) {
            	var deferred = $.Deferred();
                $.go(GO.contextRoot + 'ad/api/system/adminjob/item/' + jobItemId, '', {
                    qryType : "get",
                    async : false,
                    contentType : 'application/json',
                    responseFn : function(response){
                    	deferred.resolve(response.data);
                    },
                    error : function(data){
                    	$.goMessage(data.responseJSON.message);
                    }
                });
                return deferred.promise();
            },
			
			renderAdminJobList : function() {
				var self = this;
				this.$tableEl = this.$el.find('#admin_job_list');
                this.adminJobList = $.goGrid({
                    el : '#admin_job_list',
                    method : 'GET',
                    destroy : true,
                    url : GO.contextRoot + 'ad/api/system/adminjob/list',
                    params : this.searchParams,
                    emptyMessage : "<p class='data_null'> " +
                                        "<span class='ic_data_type ic_no_data'></span>" +
                                        '<span class="txt">'+ commonLang["없음"] +'</span>' +
                                   "</p>",
                    defaultSorting : [[ 6, "desc" ]],
                    sDomType : 'admin',
                    checkbox : true,
                    checkboxData : 'jobId',
                    columns : [                               
                               { mData: "jobId", sWidth: '100px', bSortable: false },
                               { mData: "companyId", sWidth : "100px", bSortable: true },
                               { mData: "size", sWidth : "100px",  bSortable: true },
                               { mData: "successCount", sWidth : "100px", bSortable: true },
                               { mData: "failCount", sWidth : "100px", bSortable: true },
                               { mData: "startedAt", bSortable: true, fnRender : function(obj) {
                                   return GO.util.basicDate(obj.aData.startedAt);
                               }},
                               { mData: "endedAt", bSortable: true, fnRender : function(obj) {
                                   return GO.util.basicDate(obj.aData.endedAt);
                               }},
                               { mData: null, sWidth : "150px", bSortable: false, fnRender : function(obj) {
                            	   	if(obj.aData.operator != undefined) {
                            	   		return obj.aData.operator.name;
                            	   	} else {
                            	   		return "";
                            	   	}
                               }},
                               { mData: "jobName", bSortable: true },
                    ],
                    
                    fnDrawCallback : function(obj, oSettings, listParams) {
                    	self.$el.find('#admin_job_list_wrapper .toolbar_top .custom_header').append(self.$el.find('#controlButtons1').show());
                    }
                });
				
			},
			
			renderAdminJobItemList : function(jobId, status, jobName) {
				var self = this;
				var useRedoBtn = useReSyncBtn.indexOf(jobName)>-1 ? true : false;
				if(!useRedoBtn) {
					useRedoBtn = jobName.indexOf("re_sync_data") > -1 ? true : false;
				}
            	var btnTpl = //'<div class="critical" id="controlButtons2" style="display: none">'+
							// '<span class="btn_tool" id="sync_download">'+adminLang["다운로드"]+'</span></div>'+
            				// '</div>'+
							'<div class="critical" id="controlButtons3" style="display: none">' +
							'<span class="btn_tool" id="show_data_detail">'+adminLang["데이터 상세"]+'</span>' +
							'<span class="btn_tool" id="redo_checked_item">'+adminLang["선택데이터 재수행"]+'</span>'+
							'<span class="btn_tool" id="redo_all_failed_item">'+adminLang["모든 실패데이터 재수행"]+'</span></div>';
            	this.$el.find('#admin_job_item_container').append(btnTpl);
            	
				this.$tableEl = this.$el.find('#admin_job_item_list');
				this.$tableEl.html('');
				this.$tableEl.append(AdminJobItemHeadTmpl());
				
                this.adminJobItemList = $.goGrid({
                    el : '#admin_job_item_list',
                    method : 'GET',
                    destroy : true,
                    url : GO.contextRoot + 'ad/api/system/adminjob/'+jobId+'/item/'+status,
                    params : this.searchParams,
                    checkbox : useRedoBtn,
                    checkboxData : 'id',
                    emptyMessage : "<p class='data_null'> " +
                                        '<span class="ic_data_type ic_no_data"></span>' +
                                        '<span class="txt">'+ commonLang["없음"] +'</span>' +
                                   "</p>",
                    defaultSorting : [[ 1, "asc" ]],
                    sDomType : 'admin',
                    displayLength : App.session('adminPageBase'),
                    columns : [                               
                               { mData: "id", sWidth: '100px', bSortable: true },
                               { mData: "jobId", sWidth : "100px", bSortable: true },
                               { mData: "status", sWidth : "100px",  bSortable: true },
                               { mData: "data", bSortable: true },
                               { mData: "message", bSortable: true}
                    ],
                    
                    fnDrawCallback : function(obj, oSettings, listParams) {
                    	//self.$el.find('#admin_job_item_list_wrapper .toolbar_top .custom_header').append(self.$el.find('#controlButtons2').show());
                    	if(useRedoBtn) {
                			self.$el.find('#admin_job_item_list_wrapper .toolbar_top .custom_header').append(self.$el.find('#controlButtons3').show());
                    	}
                    }
                });
				
			}

		},{
			__instance__: null
		});
		return AdminJobView;
	});
	
}).call(this);