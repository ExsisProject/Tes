(function() {
	define([
        "jquery",
	    "backbone",
	    "app",
	    
	    "hgn!admin/templates/mail/alias_list",	    
        "i18n!admin/nls/admin",
        "i18n!nls/commons",
        
        "GO.util",
        "jquery.go-grid"
	],
	function(
        $,
	    Backbone,
	    App,
	    
	    aliasListTmpl,	    
        adminLang,
        commonLang
        
	) {
		var instance = null;
		var lang = {
				alias_name : adminLang["별칭 계정 이름"],
				alias_id : adminLang["별칭 계정 아이디"],
				forward_count : adminLang["전달 이메일 개수"],
				account_status : adminLang["사용 상태"],
				alias_forward_address : adminLang["전달할 이메일"]
		};
		
		var AliasListView = Backbone.View.extend({
			el: "#layoutContent",
			initialize : function() {
				this.$el.off();
				this.listOption = {
					page : 0,
					size : 20
				};
			},
			events : {
				"keypress #searchKeyword" : "enterEventHandler",
				"click #addAlias" : "addAlias",
				"click #delAlias" : "delAlias",
				"click #searchAlias" : "search",
				"click span[data-type='setting']" : "settingAlias"
			},
			render: function() {
				//el그리기
				$('div#aliasList').empty();
				this.$el.append(aliasListTmpl({
						lang : lang
					}));
				
				this.renderAliasGrid();
				this.renderButton();
				return this;
				
			},
			
			renderButton : function() {
				var btn_add = '<span class="btn_tool" id="addAlias">' + adminLang["별칭 계정 추가"] + '</span>';
				var btn_del='<span class="btn_tool txt_caution" id="delAlias">' + adminLang["별칭 계정 삭제"] + '</span>';
				
				$(".custom_header").append(btn_add+btn_del);
			},
						
			renderAliasGrid : function() {
				var self = this;
				this.dataTable = $.goGrid({
					el : this.$('#aliasDataTable'),
					method : 'GET',
					bDestroy : true,
					url : GO.contextRoot + 'ad/api/mail/alias/list',
					emptyMessage : "<p class='data_null'> " +
		                "<span class='ic_data_type ic_no_data'></span>" +
		                "<span class='txt'>"+adminLang["등록된 별칭 계정이 없습니다."]+"</span>" +
		                "</p>",
					defaultSorting : [[ 2, "asc" ]],
					sDomType : 'admin',
					checkbox : true,
	                checkboxData : 'mailUserSeq',
	                displayLength : 20,
					params : {
						'page' : this.page,
						'offset' : this.offset
					},
					columns : [
			            { mData : "userName",sWidth: '350px', sClass:"title", bSortable: true, fnRender : function(obj) {
			            	if(obj.aData.userName==null){
			            		obj.aData.userName = '-';
			            	}
			            	return '<span data-type="setting" data-id="' + obj.aData.mailUserSeq + '" style="cursor:pointer;">' + obj.aData.userName + '</span>';
			    	    }},
			            { mData : "mailUid",sWidth: '350px', sClass:"title", bSortable: true, fnRender : function(obj) {
			    	    	
			            	return '<span data-type="setting" data-id="' + obj.aData.mailUserSeq + '" style="cursor:pointer;">' + obj.aData.mailUid + '</span>';
			    	    }},
			    	    { mData : "forwardCount",sWidth: '150px', bSortable: false, fnRender : function(obj) {
			    	    	return obj.aData.forwardCount;
			    	    }},
			    	    { mData : "accountStatus", bSortable: true, fnRender : function(obj) {
			    	    	if(obj.aData.accountStatus == 'enabled'){
				        		   return adminLang['정상'];
				        	}
			    	    	return adminLang['중지'];
			    	    }}	    	    
			        ],
			        fnDrawCallback : function(tables, oSettings, listParams) {
                        tables.find("thead tr th:first").addClass("check");
			        }
				});
				
			},
			addAlias : function() {
				GO.router.navigate('mail/alias/create', {trigger : true, pushState : true});
			},
			
			delAlias : function() {
				var self = this,
                ids = this.getCheckedIds();
				
	            if(ids.length == 0){
	                $.goMessage(adminLang["삭제할 항목을 선택하세요."]);
	                return;
	            }
	            
	            $.goConfirm(adminLang["별칭 계정 삭제"], adminLang["별칭 계정을 삭제하면, 하위 별칭 계정이 최상위로 이동됩니다."], function() {
	            	$.go(GO.contextRoot + "ad/api/mail/alias",JSON.stringify({ids : ids}), {
	            		qryType : 'DELETE',
	            		contentType : 'application/json',
	            		responseFn : function(response) {
	            			self.render();
	            			$.goMessage(commonLang["삭제되었습니다."]);
	            		},
	            		error : function(resp){
	            			$.goError(resp.responseJSON.message);
	            		}
					});
				}, commonLang['확인']);
			},
																				
			settingAlias : function(e){
				var aliasId = $(e.currentTarget).attr("data-id"); 
				GO.router.navigate('mail/alias/modify/'+aliasId, {trigger : true, pushState : true});
			},
			
			getCheckedIds : function(){
                var ids = [];
                $.each($("#aliasDataTable td input:checkbox:checked"), function(index, el){
                    ids.push($(el).val());
                });
                return ids;
            },
            
            search : function() {
    			var searchForm = this.$el.find('.table_search input[type="text"]'),
				keyword = searchForm.val();			
    			searchForm.trigger('focusout').blur();
    			if($.trim(keyword) == ''){
    				$.goAlert(commonLang['검색어를 입력하세요.']);
    				return;
    			}
    			this.dataTable.tables.search(this.$el.find('.table_search select').val(), keyword);
	    	},
	    	
	    	getSearchUrl : function() {
	    		return GO.contextRoot + "ad/api/mail/alias/list?" + $.param(this.listOption);
	    	},
	    	
	    	enterEventHandler : function(e) {
				if (e.which == 13) this.search();
			}
			
		});
		
		return AliasListView;
		
	});
}).call(this);