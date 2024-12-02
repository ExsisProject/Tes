define('docs/views/content_top', function(require) {
    
    var commonLang = require('i18n!nls/commons');
    
    var ContentTopView = require('views/content_top');
    var SearchPopupView = require('docs/search/views/search_popup');

    return ContentTopView.extend({
    	
    	events : function(){
			return _.extend({},ContentTopView.prototype.events, {
			    'click #favorite' : '_toggleFavorite',
			});
		},
    	
        searchUrl: "docs/search", 
        
        setFavoriteTmpl : function(isFavorite, folderId) {
        	var favoriteClass = isFavorite ? "ic_star" : "ic_star_off";
        	var favoriteTmpl = '<span class="action">' + 
        							'<ins id="favorite" data-folder-id="' + folderId + '"class="' + favoriteClass + '" value="'+ isFavorite + '">' + '</ins>' + 
        						'</span>';
        	
        	this.$el.find("h1").append(favoriteTmpl);
        },
        
        setAppSearchTitle : function(){
        	this.$('#searchType option[value="appSearch"]').html(commonLang['문서관리']);
        },
        
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
                        var url = ["docs/search", "?", GO.util.jsonToQueryString(searchPopupView.getSearchParam())].join('');
                        GO.router.navigate(url, true);
                    }
                }
            });

            this.searchPopup.find(".content").html(searchPopupView.el);
            searchPopupView.render();
        },
        _toggleFavorite : function(e) {
    		var target = $(e.currentTarget);
    		var isFavorite = GO.util.toBoolean(target.attr("value"));
    		var folderId = target.attr("data-folder-id");
    		var options = {
	    			dataType : "json",
	    			url : GO.contextRoot + "api/docs/folder/" + folderId + "/favorite",
	    			error : function(resp) {
            			$.goError(resp.responseJSON.message);
            		}
	    		};
    		if (isFavorite) {
    			options["type"] = "DELETE";
    			options["success"] = function() {
    				target.removeClass("ic_star").addClass("ic_star_off").val("false");
    				$("#side_favorite").trigger("refresh");
    			};
    		} else {
    			options["type"] = "POST";
    			options["success"] = function() {
    				target.removeClass("ic_star_off").addClass("ic_star").val("true");
    				$("#side_favorite").trigger("refresh");
    			};
    		}
    		$.ajax(options);
    	},
    });
});