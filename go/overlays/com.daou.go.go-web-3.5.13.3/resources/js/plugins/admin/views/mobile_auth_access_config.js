define([
        "app",

        "i18n!nls/commons",
	    "i18n!admin/nls/admin",
		
	    "hgn!admin/templates/mobile_auth_access_config",
	    "hgn!admin/templates/list_empty",
		"models/mobile_config",
		
	    "jquery.go-validation",
	    "jquery.go-popup",
	    "jquery.go-sdk",
	    "jquery.go-grid",
	    "GO.util"
],
function(
		App,
		commonLang,
		adminLang,
	
		MobileConfigTmpl,
		emptyTmpl,
		MobileConfig
) {
	var lang = {
		label_ok: commonLang["저장"],
		label_cancel: commonLang["취소"],
		label_not_use: adminLang["사용안함"],
		label_use: commonLang["사용"],
		label_mobile_access: adminLang["모바일 접근 제한"],
		label_empty: adminLang["등록된 모바일 기기 정보가 없습니다."],
		label_search : commonLang['검색'],
		label_delete: commonLang["삭제"],
		label_add: commonLang["추가"],
		label_email: commonLang["이메일"],
		label_name: commonLang["이름"],
		label_deviceid: adminLang["DeviceId"],
		label_all: adminLang["접근허용모바일기기관리"],
		label_ostype : adminLang["OS타입"],
		label_deviceModel : adminLang["모델명"],
		label_status : adminLang["상태"],
		label_approval : adminLang["요청승인"],
		label_reject : adminLang["요청반려"],
		uuid_desc : adminLang["uuid설명"],
		access_enabled_users : adminLang["접근허용모바일기기"],
		access_request_users : adminLang["접근요청모바일기기"],
		request : adminLang["승인요청"],
		approval : adminLang["승인"],
		reject : adminLang["반려"]
	};
	
	var MobileConfigView = Backbone.View.extend({

		initialize : function() {
			this.model = new MobileConfig({
				adminContext: true
			});
			this.listEl = "#mobileAccessList";
		},
		
		events : {
			"click span#btn_ok" : "_mobileConfigSave",
			"click span#btn_cancel" : "_mobileConfigCancel",
			"click span#btn_delete" : "_deleteDeviceId",
			"click span#btn_approval" : "_approvalDeviceId",
			"click span#btn_reject" : "_rejectDeviceId",
			"click span.btn_search" : "_search",
			"click li#access_enabled_users" : "_onAccessEnabledUser",
			"click li#access_request_users" : "_onAccessRequestUser",
			"click div#mobileAccessList_wrapper input:checkbox" : "_toggleCheckbox",
			"click input:radio[name='mobileAccessControl']" : "_toggleMobileAccessControl",
			"keydown span.search_wrap input" : "_searchKeyboardEvent"
		},
		
		render : function() {
			this.model.fetch().done($.proxy(function() {
				this.$el.html(MobileConfigTmpl({
					lang : lang,
					model: this.model.toJSON()
				}));
				this._renderMobileAccessList();
			}, this));
		},
		
		_renderMobileAccessList : function() {
			if($("input:radio[name='mobileAccessControl']").val() == 'false'){
				$('#mobile_access_management_wrap').hide();
			}
			var state = this.$('#access_enabled_users').hasClass('active') ? 'enabled' : 'disabled';
			var self = this;
			
			this.dataTable  = $.goGrid({
				el : this.listEl,
				method : 'GET',
				bDestroy : true,
				type : 'admin',
				url : GO.contextRoot + 'ad/api/mobile/access/' + state,
				emptyMessage : emptyTmpl({
					label_desc : lang['label_empty']
				}),
				params : {
					'page' : this.page
				},
				defaultSorting : [[1, "acs"]],
				pageUse : true,
				checkbox : true,
				sDomType : 'admin',
				checkboxData : 'id',
				displayLength : App.session('adminPageBase'),
				columns : [
				           { mData : "name", bSortable: true, sWidth : "180px"},
				           { mData : "email", bSortable: true, sWidth : "200px"},
				           { mData : "osType", bSortable: true, sWidth : "100px"},
				           { mData : "deviceModel", bSortable: true, sWidth : "120px"},
				           { mData : "deviceId", bSortable: false},
				           { mData : "status", bSortable: true, sWidth : "120px", fnRender: function(obj){
				        	   if(obj.aData.status == 'approval') {
				        		   return lang.approval;
				        	   } else if(obj.aData.status == 'reject') {
				        		   return lang.reject;
				        	   } else if(obj.aData.status == 'request') {
				        		   return lang.request;
				        	   }
				           }}
		        ],
		        fnDrawCallback : function(obj) {
		        	var htmls = [];
		        	htmls.push('<span class="btn_tool txt_caution" id="btn_delete">');
		        	htmls.push(lang.label_delete);
		        	htmls.push('</span>'); 
		        	if (state == 'disabled') {
			        	htmls.push('<span class="btn_tool" id="btn_approval">');
			        	htmls.push(lang.label_approval);
			        	htmls.push('</span>'); 
			        	htmls.push('<span class="btn_tool" id="btn_reject">');
			        	htmls.push(lang.label_reject);
			        	htmls.push('</span>'); 
		        	}
		        	
		        	self.$el.find('.toolbar_top .custom_header').html(htmls.join('\n')); 
		        	self.$el.find('#checkedAll').attr('checked', false);
		        }
			});
		},
		
		_toggleCheckbox : function(e){
			e.stopPropagation();
			
			if($(e.currentTarget).is(':checked')){
				$(e.currentTarget).attr('checked', true);
			}else{
				this.$el.find('#checkedAll').attr('checked', false);
				$(e.currentTarget).attr('checked', false);
			}
		},
		
		_toggleMobileAccessControl : function(e) {
			if($(e.currentTarget).val() == 'true'){
				$("#mobile_access_management_wrap").show();
			}else{
				$("#mobile_access_management_wrap").hide();
			}
		},
		
		_addDeviceId : function(e) {
			e.stopPropagation();
			
			App.router.navigate('mobile/access/create', true);
		},
		
		_deleteDeviceId : function(e) {
			e.stopPropagation();
			
			var self = this,
        	checkedEls = $("#mobileAccessList input[type=checkbox]:checked");
    
	        if(checkedEls.length == 0){
	            return $.goAlert("", adminLang["삭제할 항목을 선택하세요."]);
	        }
        
	        $.goCaution("",adminLang["삭제경고"], function(){
	            var url = GO.contextRoot+"ad/api/mobile/access",
	            options = {
	                ids : []
	            };
	            for(var i=0 ; i < checkedEls.length ; i++){
	                if(checkedEls[i].value == "on"){
	                    continue;
	                }
	                options.ids.push(parseInt(checkedEls[i].value));
	            }
	            if(options.ids.length == 0){
	                return;
	            }
	            $.go(url,JSON.stringify(options), {
	                qryType : 'DELETE',
	                contentType : 'application/json',
	                responseFn : function(response) {
	                    $.goMessage(commonLang["삭제되었습니다."]);
	                    self._renderMobileAccessList();
	                },
	                error : function(error){
	                	$.goMessage(commonLang["실패했습니다."]);
	                }
	            });
	        });
		},
		
		_approvalDeviceId : function(e) {
			e.stopPropagation();
			this._requestDeviceStatus('approval');
		},
		
		_rejectDeviceId : function(e) {
			e.stopPropagation();
			this._requestDeviceStatus('reject');
		},
		
		_requestDeviceStatus : function(status) {
			var self = this,
        	checkedEls = $("#mobileAccessList input[type=checkbox]:checked");
    
	        if(checkedEls.length == 0){
	            return $.goAlert("", commonLang["선택된 항목이 없습니다."]);
	        }
        
	        $.goConfirm("",adminLang["승인요청"], function(){
	            var url = GO.contextRoot+"ad/api/mobile/access/" + status,
	            options = {
	                ids : []
	            };
	            for(var i=0 ; i < checkedEls.length ; i++){
	                if(checkedEls[i].value == "on"){
	                    continue;
	                }
	                options.ids.push(parseInt(checkedEls[i].value));
	            }
	            if(options.ids.length == 0){
	                return;
	            }
	            $.go(url,JSON.stringify(options), {
	                qryType : 'PUT',
	                contentType : 'application/json',
	                responseFn : function(response) {
	                    $.goMessage(commonLang["수정되었습니다."]);
	                    self._renderMobileAccessList();
	                },
	                error : function(error){
	                	$.goMessage(commonLang["실패했습니다."]);
	                }
	            });
	        });
		},
		
		_search : function(e) {
			e.stopPropagation();
			
			var searchForm = this.$el.find('.table_search input[type="text"]'),
			keyword = searchForm.val();		
			this.dataTable.tables.search(this.$el.find('.table_search select').val(), keyword, searchForm);
		},
		
		_searchKeyboardEvent : function(e) {
			if(e.keyCode == 13) {
				this._search();
			}
		},
		
		_onAccessEnabledUser : function(e) {
			this.$('#access_enabled_users').addClass('active');
			this.$('#access_request_users').removeClass('active');
			
			this._renderMobileAccessList();
		},
		
		_onAccessRequestUser : function(e) {
			this.$('#access_enabled_users').removeClass('active');
			this.$('#access_request_users').addClass('active');
			
			this._renderMobileAccessList();
		},
		
		_mobileConfigSave : function(e) {
			e.stopPropagation();
			
			var self = this,
				form = this.$el.find('form[name=formMobileConfig]'),
				selectEl = form.find('input[type="radio"]:checked');
			
			var saveData = {
				mobileAccessControl : selectEl.attr('value')
			};
			self.model.save(saveData, {
				success : function(model, response) {
					if(response.code == '200') {
						$.goMessage(commonLang["저장되었습니다."]);
						self.render();
					}
				},
				error : function(model, response) {
					var responseData = JSON.parse(response.responseText);
					if(responseData.message != null){
						$.goMessage(responseData.message);
					}else{
						$.goMessage(commonLang["실패했습니다."]);
					}
				}
			});
		},
		
		_mobileConfigCancel : function(e) {
			e.stopPropagation();
			
			var self = this;
			$.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function() {
				self.render();
				$.goMessage(commonLang["취소되었습니다."]);
			}, commonLang["확인"]);
		}
	},{
		attachTo: function(targetEl) {
			var contentView = new MobileConfigView();
			
			targetEl
				.empty()
				.append(contentView.el);
			
			contentView.render();
			
			return contentView;
		}
	});
	
	return MobileConfigView;
});