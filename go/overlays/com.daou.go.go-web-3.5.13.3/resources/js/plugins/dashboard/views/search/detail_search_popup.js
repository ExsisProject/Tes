	define([
			"backbone",
			"app",
			"i18n!nls/commons",
			"i18n!dashboard/nls/dashboard",
			"hgn!dashboard/templates/search/detail_search_popup",
			"jquery.go-validation",
			"jquery.go-sdk"
	], 
	function(
			Backbone,
			App,
			commonLang,
			dashboardLang,
			SearchTpl
	) {
		
		var lang = {
			keyword : commonLang['검색어'],
			period : commonLang['기간'],
			all : commonLang['전체'],
			aweek : dashboardLang['최근 1주일'],
			twoweeks : dashboardLang['최근 2주일'],
			amonth : dashboardLang['최근 1개월'],
			directly : dashboardLang['직접선택'],
			content_search : commonLang['첨부파일내용 검색']
		};

		return Backbone.View.extend({
			tagName : "form",
			
			events : {
				"change input[type=radio]" : "changeTerm"
			},

			render : function() {
				this.$el.html(SearchTpl({
					lang : lang,
					isMailAttachSearch : this.getMailAttachSearch()
				}));
				
				$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
				this.renderDatePicker();
				this.getMailAttachSearch();
			},

			renderDatePicker : function() {
				this.$("#fromDate").datepicker({
					yearSuffix: "",
					dateFormat: "yy-mm-dd", 
					changeMonth: true,
					changeYear: true
                });
				
				this.$("#toDate").datepicker({
					yearSuffix: "",
					dateFormat: "yy-mm-dd", 
					changeMonth: true,
					changeYear: true
				});
			},

			renderFolders : function(folders) {
				this.$("#folders").empty();
				this.$("#folders").append("<option value='all'>" + commonLang["전체"] + "</option>");
				_.each(folders, function(folder) {
					var option = "<option value='" + folder.id + "'>" + folder.name + "</option>";
					this.$("#folders").append(option);
				}, this);
			},

			renderStatus : function(statuses) {
				this.$("#status").empty();
				this.$("#status").append("<option value=''>" + commonLang["전체"] + "</option>");
				_.each(statuses, function(status) {
					var option = "<option value='" + status + "'>" + status + "</option>";
					this.$("#status").append(option);
				}, this);
			},
			
			changeTerm : function(e) {
				var isDirectly = $(e.currentTarget).attr("id") == "radioDirectly";
				
				this.$("input[data-type=datepicker]").prop("disabled", !isDirectly);
				this.renderDatePicker();
				
				if (isDirectly) this.$("input[data-type=datepicker]").val(GO.util.shortDate(new Date()));
			},
			
			getSearchParam : function() {
				var keyword = this.$("#keyword").val();
				keyword = $.trim(keyword);
				if(keyword == ''){
					$.goError(commonLang['검색어를 입력하세요.']);
					keyword.focus();
					return;
				}
				
				if(!$.goValidation.isCheckLength(2,64,keyword)){
					$.goMessage(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"64"}));
					keyword.focus();
					return;
				}
				
				if($.goValidation.isInValidEmailChar(keyword)){
					$.goMessage(commonLang['메일 사용 불가 문자']);
					keyword.focus();
					return;
				}
				
				var date = this.getSearchTerm();
				return {
					stype : "detail",
					keyword : keyword,
					searchAttachContents : this.$("#searchAttachContents").is(':checked'),
					fromDate : date.fromDate,
					toDate : date.toDate,
					searchTerm : date.searchTerm,
					page : 0,
					offset : 5,
					sdate : this.convertTime(date.fromDate) + "-00-00-00",
					edate : this.convertTime(date.toDate) + "-23-59-59",
					adv : "on"
				};				
			},
			
			getSearchTerm : function() {
				var term = this.$el.find("input[type=radio]:checked").val();
				var currentDate = GO.util.shortDate(new Date());
				var fromDate = GO.util.toISO8601('1970/01/01');
				var toDate = GO.util.toISO8601(new Date());
				var searchTerm = "all";
				
				if (term == "-1") {
					fromDate = GO.util.calDate(currentDate, "weeks", term);
					searchTerm = "1w";
				} else if (term == "-2") {
					fromDate = GO.util.calDate(currentDate, "weeks", term);
					searchTerm = "2w";
				} else if (term == "month") {
					fromDate = GO.util.calDate(currentDate, "months", -1);
					searchTerm = "1m";
				} else if (term == "directly") {
					searchTerm = "";
					fromDate = GO.util.toISO8601($("#fromDate").val());
					toDate = GO.util.searchEndDate($("#toDate").val());
				}
				
				return {fromDate : fromDate, toDate : toDate, searchTerm : searchTerm};
			},
			
			validate : function() {
				var invalidCount = 0;
				var attrs = ["keyword"];
				_.each(attrs, function(attr) {
					var context = this.$("#" + attr);
					if (context.val().length > 64) {
						$.goError(GO.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."], {arg1 : 64}), context, false, true);
						invalidCount += 1;
					}
				}, this);
				
				return invalidCount == 0;
			},

			convertTime : function(time){
				var date = time.split('T');
				return date[0];
			},

			getMailAttachSearch : function(){
				$.go(GO.contextRoot + "api/system/mailattachsearch", '' , {
					qryType : 'GET',
					sync : false,
					responseFn : function(response) {
						if(response.code == 200 && response.data){
							$('#searchAttachContents').parents('span.vertical_option').show();
						}
					},
					error: function(response){
						
					}
				});
			}
		});
	});