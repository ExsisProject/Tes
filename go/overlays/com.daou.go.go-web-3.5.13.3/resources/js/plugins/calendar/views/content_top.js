(function() {
    define([
        "app", 
        "views/content_top", 
        "calendar/views/power_search_layer", 
        "i18n!calendar/nls/calendar",
        "i18n!nls/commons",
    ], 

    function(
        GO, 
        ContentTopView, 
        CalendarPowerSearchLayer, 
        calLang,
        commonLang
    ) {

        var CalendarTopView = ContentTopView.extend({
            searchUrl: "calendar/search", 
            
            /**
            상세검색 레이어 호출
                - 어플리케이션별로 상속받아 구현
                
            @method showDetailSearch
            @param {$.Event} jQuery Event 객체
            @chainable
            */ 
            showDetailSearch: function(e) {
                e.preventDefault();
                var $target = $(e.currentTarget), 
                    toffset = $target.offset();
                var searchType = $('#searchType').val();
				if(searchType != "appSearch"){
					this.detailPopup(e);
					return;
				}

                new CalendarPowerSearchLayer({
                    offset: {
                        top : parseInt(toffset.top+30, 10),
                        right : 7
                    }
                });

                return false;
            },
            
            setAppSearchTitle : function(){
	        	this.$el.find('#searchType option[value="appSearch"]').html(commonLang['캘린더'])
	        },
            
        });

        return CalendarTopView;
    });
}).call(this);