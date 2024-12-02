(function() {
    
    define([
        "jquery",
        "underscore", 
        "backbone", 
        "app", 
        
        "hgn!report/templates/report_title",
        "hgn!report/templates/detail_search_layer",
        "report/collections/left_menu",
        "dashboard/views/search/detail_search_popup",
        "i18n!report/nls/report",
        "i18n!calendar/nls/calendar",
        "i18n!nls/commons",
        "jquery.go-popup",
        "jquery.go-validation"
        
    ], 
    
    function(
        $, 
        _, 
        Backbone, 
        GO, 
        ReportTitleTmpl,
        DetailSearchLayerTmpl,
        ReportMenu,
        totalSearchView,
        ReportLang,
        CalendarLang,
        CommonLang
        
    ) {
        
        var lang = {
        	"keyword" : CommonLang["검색어"],	
            "alert_keyword" : CommonLang["검색어를 입력하세요."],
            "alert_length" : CommonLang['0자이상 0이하 입력해야합니다.'],
            "all" : CommonLang["전체"],
            "search" : CommonLang["검색"],
            "location" : CommonLang["위치"],
            "content" : CommonLang["본문"],
            "comment" : CommonLang["댓글"],
            "attach" : CommonLang["첨부파일명"],
            "attachContent" : CommonLang["첨부파일 내용"],
            "term" : CommonLang["기간"],
            "detail_search" : CommonLang["상세검색"],
            "department" : ReportLang["부서"],
            "reporter" : ReportLang["보고자"],
            "direct_selection" : ReportLang["직접선택"],
            "one_week" : GO.i18n(CalendarLang["{{week}}주일"],{week : 1}),
            "two_week" : GO.i18n(CalendarLang["{{week}}주일"],{week : 2}),
            "one_month" : GO.i18n(CalendarLang["{{month}}개월"],{month : 1}),
            'app_search' : CommonLang["앱검색"],
			'unified_search' : CommonLang["통합검색"],
			'report' : CommonLang['보고'],
			"detail" : CommonLang["상세"]
        };
        
        var ReportTitleView = Backbone.View.extend({
            el : "header.content_top",
            events: {
                "click #detailSeach": "renderDetailSearchLayer",
                "keydown input:text#simpleInput" : "searchKeyboardEvent",
                "click #btn_search_report" : "simpleSearch"
            }, 
            
            initialize: function(options) {            	
            	this.options = options || {};
            	
                this.$el.off();
                this.searchParam = {};
            }, 
            
            render: function(folderId) {
                var data = {
                    text : this.options.text,
                    meta_data : this.options.meta_data,
                    meta_section : this.options.meta_section,
                    num_section : this.options.num_section,
                    favorite : this.options.favorite,
                    folder_id : folderId || "all" 
                }
                
                
                this.$el.html(ReportTitleTmpl({
                    data : data,
                    lang : lang
                }));
                
                $('input[placeholder]').placeholder();
                return this;
            },
            showDetailTerm : function(){
                $("#directSelect").show();
            },
            searchKeyboardEvent : function(e){
                if(e.keyCode == 13) {
                    this.simpleSearch();
                }
            },
            _serializeObj : function(obj) {
                var str = [];
                for(var p in obj) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
                return str.join("&");
            },
            search : function() {
            	var searchType = $('#searchType').val();
            	if(searchType == "appSearch"){
					var url = "report/search?" + this._serializeObj(this.searchParam);
				}else{
					this.searchParam.offset = 5;
					var url = 'unified/search?'+this._serializeObj(this.searchParam);
				}
                
                GO.router.navigate(url, {trigger: true});
            },
            simpleSearch : function(e, searchEl){
                var defulatSearchEl = searchEl || this.$el.find('input:text#simpleInput');
            
                if(!this.validate(defulatSearchEl)){
                    return;
                }
                
                this.setSimpleSearchData();
                this.search();
            },
            detailSearch : function(){
                if(!this.detailValidate.call(this)){
                    return;
                }
                
                this.setDetailSearchData();
                this.search();
            },
            
            validate : function(searchForm){
                var keyword = $.trim(searchForm.val());
                
                if($.trim(keyword) == ""){
                    $.goSlideMessage(lang['alert_keyword'], "caution");
                    searchForm.focus();
                    return false;
                }
                
                if(!$.goValidation.isCheckLength(2,64,keyword)){
                    $.goMessage(GO.i18n(lang['alert_length'], {"arg1":"2","arg2":"64"}));
                    searchForm.focus();
                    return false;
                }
                
                if($.goValidation.isInValidEmailChar(keyword)){
					$.goMessage(CommonLang['메일 사용 불가 문자']);
					return;
				}
                
                return true;
            },
            setSimpleSearchData : function(){
                var currentDate = GO.util.shortDate(new Date());
                
                this.searchParam.stype = "simple";
                this.searchParam.keyword = $.trim(this.$el.find("input:text#simpleInput").val());
                this.searchParam.fromDate= GO.util.toISO8601('1970/01/01');
                this.searchParam.toDate = GO.util.searchEndDate(currentDate);
                this.searchParam.page = 0;
                this.searchParam.offset = 15;
                this.searchParam.properties = "submittedAt";
            },
            setDetailSearchData : function(){
                var self = this,
                    deptValue = $("#deptSelect").val(),
                    termValue = this.searchEl.find("input:radio:checked").val(),
                    stext = $.trim($('#stext').val());
                
                this.searchParam.stype = "detail";
                this.searchParam.content = $("#detailContent").attr('checked') ? stext : '';
                this.searchParam.comment = $("#detailComment").attr('checked') ? stext : '';
                this.searchParam.attachFileNames = $("#detailAttach").attr('checked') ? stext : '';
                this.searchParam.attachFileContents = $("#detailAttachContent").attr('checked') ? stext : '';
                this.searchParam.reporterName = $.trim(this.searchEl.find("#detailRepoter").val());
                this.searchParam.folderIds = [];
                this.searchParam.folderNames = [];
                this.searchParam.properties = "submittedAt";
                
                if(termValue == "detail_term_all"){
                    var currentDate = GO.util.shortDate(new Date());
                    this.searchParam.fromDate= GO.util.toISO8601('1970/01/01');
                    this.searchParam.toDate = GO.util.searchEndDate(currentDate);
                }else if(termValue == "detail_term_custom"){
                    this.searchParam.fromDate = GO.util.searchStartDate($("#searchStartDate").val());
                    this.searchParam.toDate = GO.util.searchEndDate($("#searchEndDate").val());
                }else{
                    var currentDate = GO.util.shortDate(new Date());
                    var target = $('input:radio[name="searchType"]:checked');
                    var key = target.attr('data-key');
                    var amount = target.attr('data-amount');
                    
                    this.searchParam.fromDate = GO.util.calDate(currentDate,key,amount);
                    this.searchParam.toDate =  GO.util.searchEndDate(currentDate);
                }
                
                if(deptValue == "all"){
                    $.each(this.reportMenu.models, function(index, model){
                        $.each(model.get("folders"), function(){
                            self.searchParam.folderIds.push(this.id);
                        });
                    });
                    self.searchParam.folderNames.push(lang.all);
                }else{
                    var folderValue = $("#folderSelect").val();
                    
                    if(folderValue == "all"){
                        var selectDept = this.reportMenu.get(deptValue);
                        $.each(selectDept.get("folders"), function(){
                            self.searchParam.folderIds.push(this.id);
                            self.searchParam.folderNames.push(this.name);
                        });
                    }else{
                        self.searchParam.folderIds.push(folderValue);
                        self.searchParam.folderNames.push($("#folderSelect :selected").text());
                    }
                }
                
                this.searchParam.page = 0;
                this.searchParam.offset = 15;
            },
            detailValidate : function(){
            	var stext = $.trim($('#stext').val()),
                    reporter = this.searchEl.find("#detailRepoter"),
                    reporterData = $.trim(reporter.val());
                
            
                if(stext == "" && reporterData == ""){
                    $.goError(lang['alert_keyword']);
                    content.focus();
                    return false;
                }
                
                var inputData = [reporterData,stext]; 
				
				for(var i=0 ; i<inputData.length ; i++){
					if(inputData[i] != ''){
						if(!$.goValidation.isCheckLength(2,64,inputData[i])){
							$.goError(App.i18n(tplVar['alert_length'], {"arg1":"2","arg2":"64"}));
							return;
						}
						if($.goValidation.isInValidEmailChar(inputData[i])){
							$.goMessage(CommonLang['메일 사용 불가 문자']);
							return;
						}
					}
				}
				
				var isChecked = false;
				$('input[type=checkbox]').each(function() {
					if(this.checked) isChecked = true;
			    });  
				
				if(stext && !isChecked){
					$.goError(CommonLang['검색어 구분을 선택해주세요.']); 
					return;
				}
                
                return true;
            },
            renderDetailSearchLayer : function(e){
            	var searchType = $('#searchType').val();
				if(searchType != "appSearch"){
					this.detailPopup(e);
					return;
				}
				
                var targetEl = $(e.currentTarget),
                    self = this;
                
                this.searchEl = $.goSearch({
                    header : lang.detail_search,
                    modal:true,
                    offset : {
                        top : parseInt(targetEl.offset().top+30, 10),
                        right : 7
                    },
                    callback : $.proxy(self.detailSearch, self)
                });
                
                if(this.reportMenu == undefined){
                    this.reportMenu = ReportMenu.get();
                }
                
                this.searchEl.find("div.content").html(
                        DetailSearchLayerTmpl(
                                {
                                    data : this.reportMenu.toJSON(),
                                    lang : lang
                                }
                        ));

                var searchStartDate = $("#searchStartDate");
                var searchEndDate = $("#searchEndDate"); 
                $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
                searchStartDate.datepicker({
                    dateFormat : "yy-mm-dd",
                    changeMonth: true,
                    changeYear : true,
                    yearSuffix: "",
                    onSelect: function( selectedDate ) {
                        searchEndDate.datepicker( "option", "minDate", selectedDate );
                    }
                });
                searchEndDate.datepicker({
                    dateFormat : "yy-mm-dd",
                    changeMonth: true,
                    changeYear : true,
                    yearSuffix: "",
                    onSelect: function( selectedDate ) {
                        searchStartDate.datepicker( "option", "maxDate", selectedDate );
                    }
                });     
                
                this.searchEl.on("click", "#detail_term_custom", $.proxy(this.showDetailTerm, this));
                this.searchEl.on("change", "#deptSelect", $.proxy(this.showFolderSelect, this));
            },
            
            showFolderSelect : function(e){
                var targetEl = $(e.currentTarget),
                    selectValue = targetEl.val();
                
                if(selectValue == "all"){
                    this.searchEl.find("#folderSelect").hide();
                }else{
                    var folderModel = this.reportMenu.get(selectValue),
                        optionTmpl = ["<option value='all'>"+lang.all +"</option>"];
                    
                    $.each(folderModel.get("folders"), function(){
                        optionTmpl.push("<option value='"+this.id+"'>" + this.name + "</option>")
                    })
                    
                    this.searchEl.find("#folderSelect").html(optionTmpl.join("")).show();
                }
            },
            
            release: function() {
                this.childView.release();
                
                this.$el.off();
                this.$el.empty();
                this.remove();
            },
            
            detailPopup : function(e) {
				var self = this;
				var detailSearchPopupView = new totalSearchView();
				var targetOffset = $(e.currentTarget).offset();
				
				this.searchPopup = $.goSearch({
                    modal : true,
                    header : CommonLang["상세검색"],
                    offset : {
						top : parseInt(targetOffset.top + 30, 10),
						right : 7
					},
					callback : function() {
						if (detailSearchPopupView.validate()) {
							self.searchParam = detailSearchPopupView.getSearchParam();
							self.search();
						}
					}
                });
				
				this.searchPopup.find(".content").html(detailSearchPopupView.el);
				detailSearchPopupView.render();
			},
        }, 
        
        {
            __instance__: null, 
            
            create: function(options) {
                return (new ReportTitleView(options)).render();
            } 
        });
        
        function privateFunc(view, param1, param2) {
            
        }
        
        return ReportTitleView;
        
    });
    
})();