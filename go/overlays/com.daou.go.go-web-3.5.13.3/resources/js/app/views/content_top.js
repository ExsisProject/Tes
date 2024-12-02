    define([
        "backbone", 
        "app", 
        "hgn!templates/content_top",
        "dashboard/views/search/detail_search_popup",
        "i18n!nls/commons",
        "jquery.go-popup", 
        "jquery.placeholder",
		"jquery.go-validation"
    ], 

    function(
        Backbone,
        GO, 
        template,
        totalSearchView,
        words
    ) {

        var MIN_KEYWORD_LENGTH = 2, 
        	MAX_KEYWORD_LENGTH = 64;

        var tplVars = { // 템플릿 변수
            "search": words["검색"],
            "power_search": words["상세검색"],
            "app_search" : words["앱검색"],
            "unified_search" : words["통합검색"],
            "detail" : words['상세'],
            "use_search?": true
        };

        return Backbone.View.extend({
            tagName: "header", 
            className: "content_top", 
            title: "", 
            searchUrl: "", 
            rendered: false, 
            
            events: {
                "click #btn-search": "search", 
                "keydown #search-keyword": "bindKeyboardEvent", 
                "click #btn_DetailSearch": "showDetailSearch"
            }, 

            initialize: function(options) {
            	this.options = options || {};
            	
            	this.rendered = false;
                
                if(this.options.title) this.setTitle(this.options.title);
                if(!this.options.hasOwnProperty('use_search')) {
                	this.options.use_search = true;
                }
            }, 

            render: function() {
            	var keyword = GO.router.getSearch('keyword') || '';
            	
            	this.$el.html(template(_.defaults({
                    "keyword": keyword,
                    "maxlength": MAX_KEYWORD_LENGTH, 
                    "has_keyword?": !!keyword, 
                    "use_search?": this.options.use_search
                }, tplVars)));
                this.$el.find('input[placeholder]').placeholder();
                
                this.renderTitle();
                this.rendered = true;
                this.setAppSearchTitle();
                return this.el;
            }, 

            setTitle: function(obj) {
                this.title = obj;
                if(this.rendered) this.renderTitle();
                return this;
            }, 
            
            renderTitle: function() {
                var title = this.title;
                if(typeof title === 'object') {
                    if(/\[object HTML[a-zA-Z\-_]+Element\]/.test(title.toString())) {
                        this.$el.find("h1").empty().append(title);
                    } else if('render' in title) {
                        title[render].call(obj);
                    }
                } else if(typeof title === "string") {
                    this.$el.find("h1").empty().html(title);
                }
                return this;
            }, 

            search: function() {
                if(!this.searchUrl) throw new Error("serachUrl이 지정되어야 합니다.");
                
                var searchType = this.$el.find('#searchType').val(), 
                	$keyword = this.$el.find("#search-keyword"),  
                	keyword = $keyword.val(), 
                	params = { 'stype': 'simple', 'keyword': keyword };

                if(!this.validate(keyword)) {
                	return this;
                }
                
                if(searchType == "totalSearch"){
                	this.searchUrl = "unified/search";
                	params.offset = 5;
                	params.searchTerm = 'all';
                }
                
                GO.router.navigate(this.searchUrl + '?' + GO.util.jsonToQueryString(params), true);
                
                return this;
            }, 
            
            bindKeyboardEvent: function(e) {
                if(e.which === 13) { this.search(); }
                return this;
            }, 

            validate: function(keyword) {
                keyword = '' + $.trim(keyword);
                
                if(!keyword) {
                    $.goSlideMessage(words["검색어를 입력하세요."], "caution");
                    this.$el.find("#search-keyword").focus();
                    return false;
                }
                if(keyword.length < MIN_KEYWORD_LENGTH || keyword.length > MAX_KEYWORD_LENGTH) {
                	$.goMessage(GO.i18n(words['0자이상 0이하 입력해야합니다.'], {"arg1":MIN_KEYWORD_LENGTH, "arg2": MAX_KEYWORD_LENGTH}));
                	this.$el.find("#search-keyword").focus();                    
                    return false;
                }
                
                if($.goValidation.isInValidEmailChar(keyword)){
					$.goMessage(words['메일 사용 불가 문자']);
					return false;
				}
                return true;
            }, 
            
            detailPopup : function(e) {
				var detailSearchPopupView = new totalSearchView();
				var targetOffset = $(e.currentTarget).offset();
				
				this.searchPopup = $.goSearch({
                    modal : true,
                    header : words["상세검색"],
                    offset : {
						top : parseInt(targetOffset.top + 30, 10),
						right : 7
					},
					callback : function() {
						if (detailSearchPopupView.validate()) {
							var url = ["unified/search", "?", GO.util.jsonToQueryString(detailSearchPopupView.getSearchParam())].join('');
							GO.router.navigate(url, {trigger: true, pushState: true});
						}
					}
                });
				
				this.searchPopup.find(".content").html(detailSearchPopupView.el);
				detailSearchPopupView.render();
			},
			
			/**
            상세검색 레이어 호출
                - 어플리케이션별로 상속받아 구현
                
            @method _showDetailSearch
            @param {$.Event} jQuery Event 객체
            @chainable
            */ 
            showDetailSearch: function(e) {},
			
			setAppSearchTitle : function(){}
        });
    });