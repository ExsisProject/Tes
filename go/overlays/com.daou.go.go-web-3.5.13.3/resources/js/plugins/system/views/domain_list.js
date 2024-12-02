(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
		"hgn!system/templates/domain_list",
	    "hgn!system/templates/list_empty",
	    "system/models/licenseModel",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
	    "jquery.go-grid",
	    "jquery.go-sdk",
	    "GO.util",
	    "jquery.go-validation"
	], 

function(
	$, 
	Backbone,
	App,
	domainListTmpl,
	emptyTmpl,
	LicenseModel,
	commonLang,
	adminLang
) {
	var tmplVal = {
			label_add : commonLang["추가"],
			label_delete : commonLang["삭제"],
			label_domain_name : adminLang["도메인명"],
			label_loginmod : adminLang["로그인 방법"],
			label_confirm_delete : adminLang["삭제하시게습니까?"],
			label_check_delete_item : adminLang["삭제할 항목을 선택하세요."],
			label_breadcrumb : adminLang["도메인/사이트 관리 > 도메인 목록"],
			label_register_user_license : adminLang["사용자 라이선스를 등록해주세요."],
			label_search : commonLang["검색"],
			label_search_domain : adminLang["도메인 검색"]
	};
	var domainList = Backbone.View.extend({
		el : '#layoutContent',
		initialize : function() {
			this.listEl = '#domainList';
			this.licenseModel = LicenseModel.read();
			this.dataTable = null;
			this.unbindEvent();
			this.bindEvent();
		},
		unbindEvent : function() {
			 this.$el.off("click", "span#btn_add");
			 this.$el.off("click", "span#btn_delete");
			 this.$el.off("click", "span#btn_search");
			 this.$el.off("keydown", "input#search");
		},
		bindEvent : function() {
			this.$el.on("click", "span#btn_add", $.proxy(this.addDomain, this));
			this.$el.on("click", "span#btn_delete", $.proxy(this.deleteDomain, this));
			this.$el.on("click", "span#btn_search", $.proxy(this.searchDomain, this));
			this.$el.on("keydown", "input#search", $.proxy(this.searchKeyboardEvent, this));
		},
		toggleCheckbox : function(e){
			
		},
		addDomain : function() {
			if(this.licenseModel.get('hasUserLicense') == false){
				$.goAlert(adminLang["사용자 라이선스를 등록해주세요."]);
			}else if(this.isExceedLicenseUser()){
				$.goAlert(adminLang["최대 사용자 수를 초과하였습니다."]);
			}else if(!this.isExceedLicenseUser()){
				App.router.navigate('system/domain/create', true);
			}
		},
		deleteDomain : function(e) {
			var self = this,
				checkedEls = $("#domainList input[type=checkbox]:checked");
				
			var defaultDomainId = $(e.currentTarget).attr('data-defaultdomain');
			for(var i=0 ; i < checkedEls.length ; i++){
				if(checkedEls[i].value  == defaultDomainId){
					$.goAlert(adminLang["디폴트 도메인은 삭제할 수 없습니다."]);
					$("#domainList input[type=checkbox]:checked").attr('checked', false);
					return;
				}
			}
				
			if(checkedEls.length == 0){
				return $.goAlert("", adminLang["삭제할 항목을 선택하세요."]);
			}
			
			$.goConfirm(adminLang["삭제하시겠습니까?"], "", function(){
				var url = GO.contextRoot + "ad/api/system/domains";
				options = {
						ids : []
				};
				
				for(var i=0 ; i < checkedEls.length ; i++){
	                if(checkedEls[i].value == "on"){
	                    continue;
	                }
	                options.ids.push(checkedEls[i].value);
	            }
	            
				if(self.hasCompanyies(options.ids)){
					$.goMessage(adminLang["사이트에서 사용중인 도메인입니다."]);
					return;
				}

				if(options.ids.length == 0){
	                return;
	            }
				
	            $.go(url,JSON.stringify(options), {
	                qryType : 'DELETE',
	                contentType : 'application/json',
	                responseFn : function(response) {
	                    $.goMessage(commonLang["삭제되었습니다."]);
	                    self.render();
	                },
	                error : function(error){
	                	$.goMessage(commonLang["실패했습니다."]);
	                }
	            });
	        });
		},
		render : function(keyword) {
			$('#site').addClass('on');
			$('.breadcrumb .path').html(adminLang["도메인/사이트 관리 > 도메인 목록"]);
			this.$el.empty();
			this.$el.html(domainListTmpl({
					lang : tmplVal,
				}));	
			this.renderDomainList(keyword);
			$('#search').attr('value', keyword);
		},
		renderDomainList : function(keyword) {
			var self = this;
			var defaultDomainId = null;
			this.$tableEl = this.$el.find('#domainList');
			this.dataTable = $.goGrid({
				el : this.listEl,
				method : 'GET',
				url : GO.contextRoot + 'ad/api/system/domains',
				emptyMessage : emptyTmpl({
                    label_desc : adminLang["표시할 데이터 없음"]
                }),
                pageUse : true,
				sDomUse : true,
                checkbox : true,
                sDomType : 'admin',
                checkboxData : 'mailDomainSeq',
                defaultSorting : [[ 1, "desc" ]],
                params : {keyword : keyword},
                displayLength : App.session('adminPageBase'),
                columns : [
                           { mData: "mailDomain", sWidth: '500px', bSortable: true, fnRender : function(obj) {
                               if(obj.aData.defaultDomain == 'this'){
                               		defaultDomainId = obj.aData.mailDomainSeq;
                               }
                               return "<div id='name"+obj.aData.mailDomainSeq+"'>"+obj.aData.mailDomain+"</div>";
                           }},
                           { mData: null, sWidth: '400px', bSortable: false, fnRender : function(obj) {
                        	   if(obj.aData.loginMode == 'empno'){
                        		   return adminLang['인식번호(사번/학번)'];
                        	   }else if(obj.aData.loginMode == 'id'){
                        		   return adminLang['아이디'];
                        	   }else{
                        		   return "";
                        	   }
                           }}
                ],
                fnDrawCallback : function(obj) {
                	self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controllButtons').show());
                	self.$el.find(this.el + ' tr>td:nth-child(2)').css('cursor', 'pointer').click(function(e) {
                        App.router.navigate('system/domain/modify/'+ $(e.currentTarget).parent().find('input').val(), {trigger: true});
                    });
                    self.$tableEl.find('input[type="checkbox"][value="' + defaultDomainId + '"]').parent().parent().css("background-color","#b0c4de");
                    self.$el.find('#btn_delete').attr('data-defaultdomain', defaultDomainId);
                }
			});
		},
		isExceedLicenseUser : function(){
			var isExceed = false;
			var url = GO.contextRoot + "ad/api/system/company/userstat";
			
			$.go(url, "", {
				qryType : 'GET',
				async : false,
				responseFn : function(response) {
					if(response.code == 200){
						if((response.data.licenseUserCount - response.data.companiesUserCount)<=0){
							isExceed = true;
						}
					}
				},
				error: function(response){
					var responseData = JSON.parse(response.responseText);
					$.goMessage(responseData.message);
				}
			});
			return isExceed;
		},
		searchKeyboardEvent : function(e) {
			if(e.keyCode == 13) {
				this.searchDomain();
			}
		},
		searchDomain : function(){
			keyword = $('#search').val();
			
			if(keyword == ""){
				$.goMessage(commonLang['검색어를 입력하세요.']);
				return false;
			}
			
			if(!$.goValidation.isCheckLength(2,255,keyword)){
				$.goMessage(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"255"}));
				return false;
			}
			
			if(!$.goValidation.charValidation("/\\/",keyword)){
				$.goMessage(adminLang['입력할 수 없는 문자']);
				return false;
			}
			this.render(keyword);
		},
		hasCompanyies : function(mailDomainSeqs){
			var canBeDeketed = true;
			var url = GO.contextRoot + "ad/api/system/domain/hascompanies";

			$.go(url, JSON.stringify({ids : mailDomainSeqs}), {
				qryType : 'POST',
				contentType : 'application/json',
				async : false,
				responseFn : function(response) {
					if(response.code == 200){
						canBeDeketed = response.data;
					}
				},
				error: function(response){
					$.goMessage(commonLang["실패했습니다."]);
				}
			});
			return canBeDeketed;
		}
	},{
			__instance__: null
	});
	
		return domainList;
	});
}).call(this);