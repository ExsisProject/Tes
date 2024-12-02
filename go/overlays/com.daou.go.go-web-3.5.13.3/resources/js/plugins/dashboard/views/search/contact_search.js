;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			"hgn!dashboard/templates/search/contact_search",
			"collections/paginated_collection",
			"contact/models/contact",
			"dashboard/views/search/search_form",
			"dashboard/views/search/no_search_result",
			"i18n!nls/commons",
			"i18n!contact/nls/contact"
	], 
	function(
			Backbone,
			Hogan,
			App,
			ContactSearchTmpl,
			PaginatedCollection,
			ContactModel,
			SearchForm,
			NosearchResult,
			commonLang,
			contactLang
	) {
		var lang = {
				empty_search_results : commonLang["검색결과없음"],
				more : commonLang['더보기'],
				contact : commonLang['주소록'],
				mobileNo : contactLang['휴대폰'],
				companyname : contactLang['회사'],
				officeTel : contactLang['회사전화']

		};
		
		var SearchList = PaginatedCollection.extend({
			model : ContactModel,
			url: function() {
				var uri = '/api/contact/search';
				
				var searchParam = $.param({
											stype: this.stype,
											keyword : this.keyword,
											fromDate: this.fromDate,
											toDate: this.toDate,
											page: this.pageNo, 
											offset: this.pageSize,
											searchType : this.searchType
										});
				if (this.stype == "detail") {
					searchParam =  $.param({
						stype: this.stype,
						keyword : this.keyword,
						fromDate: this.fromDate,
						toDate: this.toDate,
						page: this.pageNo, 
						offset: this.pageSize,
						searchType : this.searchType
					});
				}
				return uri + "?" + searchParam;
			},
			setListParam: function() {
				var searchParams = GO.router.getSearch();
				this.stype = searchParams.stype;
				this.keyword = searchParams.keyword ? searchParams.keyword.replace(/\+/gi, " ") : '' ;
				this.fromDate = searchParams.fromDate;
				this.toDate = searchParams.toDate;
				this.pageNo = searchParams.page ? searchParams.page : 0;
				this.pageSize = searchParams.offset ? searchParams.offset : 20;
				this.searchType = 'or'
				sessionStorage.clear();
			},

			findById : function(id){
				var model = this.find(function(model){
					return _.isEqual(model.get("id"), id);
				});

				return model;
			}
		});
		
		var ContactSerach = SearchForm.extend({
			
			events : {
				"click #btn_more" : "showMore",
				"click #name" : "moveContactDetail",
				"click #email" : "moveMailPopup"
			},
			
			initialize : function() {
				this.$el.off();
				this.param = GO.router.getSearch(); 
				this.collection = new SearchList();
				this.collection.setListParam();
				this.collection.bind('reset', this.resetList, this);
				this.collection.fetch({
					statusCode: {
	                    403: function() { GO.util.error('403'); }, 
	                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
	                    500: function() { GO.util.error('500'); }
	                }
				});
			},
			
			render : function() {
				if(this.param.appName != undefined){
					var searchList = '<div class="cs_contact_wrap">'+	
								'</div>'+
								'<div class="tool_bar tool_absolute">'+
								'<div class="dataTables_length"></div>'+
							'</div>';
					this.$el.append(searchList);
				}
				return this;
			},
			moveContactDetail : function(e){
				var dataId = $(e.currentTarget).data('id'),
					model = this.collection.findById(dataId),
					urls = {
						"COMPANY" : makeCompanyUrl,
						"USER" : makeUserUrl,
						"DEPARTMENT" : makeDeptUrl
					};

				var url = urls[model.getOwnerType()](model);

				window.open("/app/"+ url ,"_blank","scrollbars=yes,resizable=yes,width=1280,height=760");

				function makeCompanyUrl(model){
					var url = ['contact'];
					url.push("company");
					url.push(model.getCompanyGroupId());
					url.push("modify");
					url.push(model.getId());
					return url.join("/");
				}

				function makeDeptUrl(model){
					var url = ['contact'];
					url.push("dept");
					url.push(model.getDeptId());
					url.push("modify");
					url.push(model.getId());
					return url.join("/");
				}

				function makeUserUrl(model){
					var url = ['contact'];
					url.push(model.getId());
					return url.join("/");
				}
			},
			moveMailPopup : function(e){
				if(!GO.isAvailableApp('mail')) return;
				var name = $(e.currentTarget).attr('data-name');
				var email = $(e.currentTarget).attr('data-email');
				var param = {"to":"\""+name+"\""+" <"+email+">"};
				window.open(GO.contextRoot + "app/mail/popup/process?data="+encodeURIComponent(JSON.stringify(param)),"popupRead"+Math.floor(Math.random()*1000000)+1,"scrollbars=yes,resizable=yes,width=1280,height=760");
			},
			showMore : function(e) {
				this.param.appName = "contact";
				this.showAppSearchMore(this.param);
			},
			getSearchTotalCount : function(){
				return 0;//this.collection.page.total;
			},
			resetList: function() {
				if(isTotalSearch(this.param.appName)){
					if(this.collection.isEmpty()){
						var nosearchResult = new NosearchResult({appName : commonLang["주소록"]});
						this.$el.find("div.cs_contact_wrap").html(nosearchResult.render().el);
						return;
					}

					this.$el.find('div.cs_contact_wrap').html(makeTemplate(this.collection, lang));
					this.renderPages();
				}else{
					if(this.collection.isEmpty()){
						$('#contactEmptyMessage').show();
						return;
					}
					this.$el.html(makeTemplate(this.collection, lang));
				}

				this.removeMoreBtn();

				function isTotalSearch(appName){
					return !_.isUndefined(appName);
				}

				function makeTemplate(collection, lang){
					return ContactSearchTmpl({
						lang : lang,
						dataset : collection.toJSON()
					});
				}
			},
		});
		return ContactSerach;
	});
}).call(this);