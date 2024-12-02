(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
	    "hgn!admin/templates/contact_stat",
	    "hgn!admin/templates/list_empty",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
        "jquery.go-grid",
	    "jquery.go-validation"
	], 

	function(
		$, 
		Backbone,
		App,
		contactStatTmpl,
		emptyTmpl,
		commonLang,
		adminLang
	) {
		var tmplVal = {
				label_down : adminLang["목록 다운로드"],
				label_search : commonLang['검색'],
				label_company_cnt : adminLang["전사주소록 연락처 개수"],
				label_private_cnt : adminLang["개인주소록 연락처 개수"],
				label_user : adminLang["사용자"],
				label_contact_cnt : adminLang["연락처 개수(개)"],
				label_count : adminLang['개'],
			};

		var ContactStat = App.BaseView.extend({
			el : '#layoutContent',
            events:{
                "click .wrap_action" : "onClickedWrapAction"
            },
			initialize : function() {
				this.listEl = '#contactList';
				this.dataTable = null;
				this.unbindEvent();
				this.bindEvent();
			},
			unbindEvent : function() {
				this.$el.off("click", "#csvDownLoadBtn");
				this.$el.off("click", "span.btn_search");
				this.$el.off("keydown", "span.search_wrap input");
			},
			bindEvent : function() {
				this.$el.on("click", "#csvDownLoadBtn", $.proxy(this.csvDownLoad, this));
				this.$el.on("click", "span.btn_search", $.proxy(this.search, this));
				this.$el.on("keydown", "span.search_wrap input", $.proxy(this.searchKeyboardEvent, this));
			},
			render : function() {
				this.$el.empty();
				var contactTotalCnt = this.getContactTotalCnt();
				
				
				this.$el.html(contactStatTmpl({
					lang : tmplVal,
					companyContactCnt : contactTotalCnt.companyTotalCount,
					privateContactCnt : contactTotalCnt.personalTotalCount
				}));
				this.renderContactCompanyList();
			},
            onClickedWrapAction : function() {
                this.$el.find('.wrap_action').toggle();
                this.$el.find('.info_summary li').not('.first').toggle();
            },
            getContactTotalCnt : function(){
                var cnt = {},
                    url = GO.contextRoot + "ad/api/contact/stat/count";
                $.go(url,"", {
                    async : false,
                    qryType : 'GET',
                    contentType : 'application/json',
                    responseFn : function(response) {
                        if(response.code === "200"){
                            cnt = response.data;
                        } else{
                            
                        }
                            
                    },
                    error : function(error){
                        $.goAlert(type.error);
                    }
                });
                return cnt;
            },
			renderContactCompanyList : function() {
				if(this.dataTable != null) this.dataTable.tables.fnDestroy();
				var self = this;
				this.dataTable  = $.goGrid({
					el : this.listEl,
					method : 'GET',
					url : GO.contextRoot + 'ad/api/contact/stat/user',
					emptyMessage : emptyTmpl({
							label_desc : adminLang["목록없음"]
					}),
					sDomType : 'admin',
					defaultSorting : [[ 1, "desc" ]],
					params : {
						'page' : this.page
					},
					displayLength : App.session('adminPageBase'),
					columns : [
					           { mData : "name", bSortable: false, fnRender : function(obj) {
                                   return obj.aData.name + " " +obj.aData.positionName;
                               }},
					           { mData: "contactCount", bSortable: true,sWidth: '230px'}
			        ],
			        fnDrawCallback : function(obj) {
			        	self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#csvDownLoad').show());
			        }
				});
			},
			csvDownLoad : function(){
				var url = "ad/api/contact/stat/user/download?";
	            var data = this.dataTable.listParams;
	            var properties = {
	            		"property" : data.property,
	            		"direction" : data.direction,
	            		"type" : data.type,
	            		"searchtype" : data.searchtype,
	            		"keyword" : data.keyword
	            };
				GO.util.downloadCsvFile(url + GO.util.jsonToUrlParam(properties));
			},
			search : function() {
				var searchForm = this.$el.find('.table_search input[type="text"]'),
					keyword = searchForm.val();		
								
				this.dataTable.tables.search(this.$el.find('.table_search select').val(), keyword, searchForm);
			},
			searchKeyboardEvent : function(e) {
				if(e.keyCode == 13) {
					this.search();
				}
			}
		},{
			__instance__: null
		});
		
		return ContactStat;
	});
}).call(this);