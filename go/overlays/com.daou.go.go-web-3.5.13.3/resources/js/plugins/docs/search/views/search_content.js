define('docs/search/views/search_content', function (require) {

    require('jquery.mobile');

    var commonLang = require('i18n!nls/commons');
    var docsLang = require('i18n!docs/nls/docs');
    
    var lang = {
        empty_search_results : commonLang["검색결과없음"],
		more : commonLang['더보기'],
		title : commonLang['문서관리'],
		version : docsLang['버전'],
		docNum : docsLang['문서번호'],
		docsYear : docsLang['보존연한']
    };

    var Template = require('hgn!docs/search/templates/search_content');
    var MobileTemplate = require('hgn!docs/search/templates/mobile/search_content');
    var ResultItemTemplate = require('hgn!docs/search/templates/result_item');
    var MobileResultItemTemplate = require('hgn!docs/search/templates/mobile/result_item');
    
    return Backbone.View.extend({

        events: {
            'vclick #docsTitle': '_onClickContent'
        },

        initialize: function (options) {
            options = options || {};
            this.isSimple = options.isSimple;
            this.template = GO.util.isMobile() ? MobileTemplate : Template;
            this.itemTemplate = GO.util.isMobile() ? MobileResultItemTemplate : ResultItemTemplate;
        },

        render: function () {
            this.$el.html(this.template({
                lang: lang,
                isSimple: this.isSimple
            }));

            _.each(this.model.toJSON(), function(data) {
                this.$('[data-el-list]').append(this.itemTemplate({
                	lang : lang,
					id : data.id,
					folderId : data.folderId,
					title : data.title,
					content : data.content,
					folderPath : data.folderPath,
					creatorName : data.creatorName,
					creatorPosition : data.creatorPosition,
					version : data.version,
					docNum : data.docNum,
					docsYear : function() {
						var yearValue = data.docsYear;
						if(yearValue == 0){
							return docsLang["영구"]
						}else if (yearValue == 1){
							return docsLang["1년"]
						}else if (yearValue == 3) {
							return docsLang["3년"]
						}else if (yearValue == 5) {
							return docsLang["5년"]
						}else if (yearValue == 10) {
							return docsLang["10년"]
						}else{
							return yearValue;
						}
					},
					convertDate : function() {
						var completeDate = data.completeDate;
						return (completeDate == null ||  completeDate == undefined) ? "" : GO.util.snsDate(completeDate);
					}
                }));
            }, this);

            return this;
        },

        _onClickContent: function(e) {
        	var docsId = $(e.currentTarget).attr("data-docsId");
			var folderId = $(e.currentTarget).attr("data-folderId");
			
			if(GO.router.getUrl().split("/")[0] == "docs"){
				GO.router.navigate("/docs/detail/"+docsId, true);
			}else{
				window.open("/app/docs/detail/"+docsId,"_blank","scrollbars=yes,resizable=yes,width=1280,height=760");
			}
			
        }
    });
});