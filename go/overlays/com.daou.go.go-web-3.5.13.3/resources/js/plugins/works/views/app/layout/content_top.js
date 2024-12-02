define('works/views/app/layout/content_top', function(require) {

    var commonLang = require('i18n!nls/commons');

	var ContentTopView = require('views/content_top');
    var SearchPopupView = require('works/search/views/search_popup');
	
	return ContentTopView.extend({
        searchUrl: "works/search", 
        
        showDetailSearch: function(e) {
            e.preventDefault();
            if (this.$('#searchType').val() === 'totalSearch') {
                this.detailPopup(e);
            } else {
                this._appSearchPopup(e);
            }

            return false;
        },

        _appSearchPopup: function(e) {
            var searchPopupView = new SearchPopupView();
            var targetOffset = $(e.currentTarget).offset();

            this.searchPopup = $.goSearch({
                modal : true,
                header : commonLang["상세검색"],
                offset : {
                    top : parseInt(targetOffset.top + 30, 10),
                    right : 7
                },
                callback : function() {
                    if (searchPopupView.validate()) {
                        var url = ["works/search", "?", GO.util.jsonToQueryString(searchPopupView.getSearchParam())].join('');
                        GO.router.navigate(url, true);
                    }
                }
            });

            this.searchPopup.find(".content").html(searchPopupView.el);
            searchPopupView.render();
        },
        
        setAppSearchTitle : function(){
        	this.$('#searchType option[value="appSearch"]').html(commonLang['Works'])
        }
    });
});