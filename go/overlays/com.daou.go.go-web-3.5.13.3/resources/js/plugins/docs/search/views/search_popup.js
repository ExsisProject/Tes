define('docs/search/views/search_popup', function (require) {
	var Hogan = require('hogan');
	
	var DocFolderList = require('docs/collections/doc_folder_infos');

	var Template = require('hgn!docs/search/templates/search_popup');
	
	
    var commonLang = require('i18n!nls/commons');
    var docsLang = require('i18n!docs/nls/docs');
    var dashboardLang = require('i18n!dashboard/nls/dashboard');
    
    var lang = {
    	folder: docsLang['위치'],
        creator: docsLang['등록자'],
        keyword : commonLang['검색어'],
        period : commonLang['기간'],
        all : commonLang['전체'],
        aweek : dashboardLang['최근 1주일'],
        twoweeks : dashboardLang['최근 2주일'],
        amonth : dashboardLang['최근 1개월'],
        directly : dashboardLang['직접선택'],
        attachFileNames: commonLang['첨부파일 명'],
        attachFileContents: commonLang['첨부파일 내용'],
        title:  docsLang['제목'],
		content: commonLang['내용'],
		docsyear: docsLang['보존연한'],
		docNum: docsLang['문서번호'],
		term: commonLang['기간'],
		includeType: docsLang['하위 문서함 포함'],
		permanent: docsLang['영구'],
		oneyear: docsLang['1년'],
		threeyear: docsLang['3년'],
		fiveyear: docsLang['5년'],
		tenyear: docsLang['10년'],
		allFolder: docsLang['전체문서함']
    };
    
	var sideItemView = Hogan.compile(
			'<option value="{{data.id}}">{{data.parentPathName}}</option>'
		);


    return Backbone.View.extend({

        tagName : "form",

        events : {
            "change input[type=radio]" : "changeTerm"
        },

        initialize: function () {
        	 this.docFolderList = new DocFolderList();
        },

        render: function () {
        	this.docFolderList.comparator = 'parentPathName';
            this.docFolderList.fetch({
                success : function(collection){

                	collection.each(function(model) {
                        this.$("#folderId").append(sideItemView.render({
                            data : model.toJSON()
                        }));
                    });
                }
            });
        	
            this.$el.html(Template({
                lang : lang
            }));

            $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
            this.renderDatePicker();
            return this;
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

        changeTerm : function(e) {
            var isDirectly = $(e.currentTarget).attr("id") == "radioDirectly";

            this.$("input[data-type=datepicker]").prop("disabled", !isDirectly);
            this.renderDatePicker();

            if (isDirectly) this.$("input[data-type=datepicker]").val(GO.util.shortDate(new Date()));
        },

        getSearchParam: function() {
        	var checkTitle = this.$('input[name="title"]').is(':checked'),
        		checkContent = this.$('input[name="content"]').is(':checked'),
        		checkAttachFileNames = this.$('input[name="attachFileNames"]').is(':checked'),
        		checkAttachFileContents = this.$('input[name="attachFileContents"]').is(':checked'),
        		checkIncludeType = this.$('input[name="includeType"]').is(':checked');
        		
            var $keyword = this.$('#keyword');
            var keyword = $.trim($keyword.val());

            var isValid = this.validate();
            if (!isValid) return;
            
            var date = this.getSearchTerm();
            return {
                stype: "detail",
                appName: "docs",
                keyword: keyword,
                searchTerm: date.searchTerm,
                page: 0,
                offset: 15,
                fromDate: date.fromDate,
                toDate: date.toDate,
                creatorName: this.$('#creatorName').val(),
                title: checkTitle ? keyword : "",
        		content: checkContent ? keyword : "",
				attachFileNames: checkAttachFileNames ? keyword : "",
				attachFileContents: checkAttachFileContents? keyword : "",
				docNum: this.$("#docNum").val(),
				docsYear: this.$("#docsYear option:selected").val(),
				docsYearValue: this.$("#docsYear option:selected").text(),
				includeType: checkIncludeType ? "include" : "none",
				folderId: this.$("#folderId option:selected").val(),
				folderPathName: this.$("#folderId option:selected").text()
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

        validate: function() {
	        var $keyword = this.$('#keyword');
	        var keyword = $.trim($keyword.val());
	        var creatorName = $.trim(this.$("#creatorName").val());
        	return true;
        },

        convertTime : function(time){
            var date = time.split('T');
            return date[0];
        }
    });
});