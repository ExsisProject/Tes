define('docs/search/views/search_info', function (require) {

    require('jquery.mobile');

    var commonLang = require('i18n!nls/commons');
    var docsLang = require('i18n!docs/nls/docs');
    
    var lang = {
        empty_search_results : commonLang["검색결과없음"],
		more : commonLang['더보기'],
		version : docsLang['버전'],
		keyword: commonLang['검색어'],
		creator: docsLang['등록자'],
		title:  docsLang['제목'],
		content: commonLang['내용'],
		attachName: commonLang['첨부파일 명'],
		attachContent: commonLang['첨부파일 내용'],
		docsyear: docsLang['보존연한'],
		docNum: docsLang['문서번호'],
		term: commonLang['기간'],
		folder: docsLang['문서함'],
		includeType: docsLang['하위 문서함 포함']
    };

    var Template = require('hgn!docs/search/templates/search_info');
    
    return Backbone.View.extend({

        events: {
        },

        initialize: function (options) {
            options = options || {};
            this.param = options.param,
            this.isSimple = this.param.stype === 'simple' ? true : false;
            this.template = GO.util.isMobile() ? MobileTemplate : Template;
        },

        render: function () {
            this.$el.html(this.template({
                lang: lang,
                isSimple: this.isSimple,
                isIncludeSub: this.param.includeType == 'none' ? false : true,
                param : this.param,
                term : this.getTermLabel() 
            }));

            return this;
        },
        getTermLabel : function() {
			var termLabel = "";
			var fromDate = "";
			var toDate = "";
			
			if(this.param.searchTerm == "all") {
				return commonLang["전체"];
			}
			
			if (this.param.fromDate) {
				fromDate = GO.util.shortDate(this.param.fromDate);
			}
			if(this.param.toDate){
				toDate = GO.util.shortDate(this.param.toDate);
			}
			termLabel = fromDate + " ~ " + toDate;
			return termLabel;
		}
    });
});