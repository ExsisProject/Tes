    define([
        "jquery",
        "underscore",
        "backbone",
        "app",
		"approval/views/detail_search_layer", 
		"dashboard/views/search/detail_search_popup",
        "hgn!templates/content_top",
		"i18n!nls/commons",
        "jquery.go-popup",
        "jquery.placeholder"
    ], 

    function(
        $,
        _,
        Backbone,
        GO,
        ApprovalDetailSearchLayer,
        totalSearchView,
        template,
        commonLang
    ) { 
    	var now = GO.util.now().format("YYYY-MM-DD");
    	var MAX_KEYWORD_LENGTH = 64;
        var tplVars = {
            'search': commonLang["검색"],
            'power_search' : commonLang["상세검색"],
            "app_search" : commonLang["앱검색"],
            "unified_search" : commonLang["통합검색"],
            "detail" : commonLang["상세"],
            "use_search?": true
        };

        return Backbone.View.extend({
            tagName: "header", 
            className: "content_top", 
            title: "", 
            searchUrl: "", 
            rendered: false, 
            
            unbindEvent: function() {
    			this.$el.off("click", "#btn-search");
    			this.$el.off("click", "#btn_DetailSearch");
    			this.$el.off("keydown", "#search-keyword");
    		}, 
    		
    		bindEvent: function() {
    			this.$el.on("click", "#btn-search", $.proxy(this.simpleSearch, this));
    			this.$el.on("click", "#btn_DetailSearch", $.proxy(this.showDetailSearch, this));
    			this.$el.on("keydown", "#search-keyword", $.proxy(this.bindKeyboardEvent, this));
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
            	this.unbindEvent();
				this.bindEvent();
				
            	var keyword = decodeURIComponent(GO.router.getSearch('keyword') || '');
            	
            	this.$el.html(template(_.defaults({
            		"keyword": "",
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
            
            setAppSearchTitle : function(){
                var searchCheck = GO.router.getUrl().indexOf("docfolder");
                if ( searchCheck == -1 ) {
                	this.$el.find('#searchType option[value="appSearch"]').html(commonLang['전자결재'])
                }else{
                	this.$el.find('#searchType option[value="appSearch"]').html(commonLang['전사 문서함'])
                }
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

            simpleSearch: function() {
				this.searchUrl = '';
                this.type = '';
				var searchCheck = GO.router.getUrl().indexOf("docfolder");
				var searchType = this.$el.find('#searchType').val();
                if (searchType == "totalSearch"){
                	this.searchUrl = "unified/search"
                } else if ( searchCheck == -1 ) {
            		this.searchUrl = "approval/search";
					this.type = "approval";
            	} else {
            		this.searchUrl = "docfolder/search";
					this.type = "docfolder";
            	}
                
                var startAt = GO.util.toISO8601('1970/01/01');
                var endAt = GO.util.searchEndDate(GO.util.shortDate(now));
                
                var $keyword = this.$el.find("#search-keyword"), 
                    keyword = $keyword.val(),
                    url = [this.searchUrl, "?", GO.util.jsonToQueryString({ 'stype': 'simple', 'type' : this.type, keyword: $.trim(keyword), 'fromDate' : startAt, 'toDate' : endAt })].join('');

                if(this.validate($.trim(keyword))) {
                	if (searchType == "totalSearch"){
                		url = url + "&offset=5";
                		url = url + "&searchTerm=all"
                    } 
                    GO.router.navigate(url, true);
                }
                return this;
            }, 
            
            bindKeyboardEvent: function(e) {
                if(e.which === 13) { this.simpleSearch(); }
                return this;
            }, 

            validate: function(keyword) {
                var self = this;
                if(!keyword) {
                    $.goError(commonLang["검색어를 입력하세요."]);
                    self.$el.find("#search-keyword").focus();
                    return false;
                }
                if(keyword.length < 2 || keyword.length > 64) {
                	$.goMessage(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"64"}));
                	self.$el.find("#search-keyword").focus();                    
                    return false;
                }
                if($.goValidation.isInValidEmailChar(keyword)){
					$.goMessage(commonLang['메일 사용 불가 문자']);
					return false;
				}
                return true;
            }, 
    	
            showDetailSearch: function(e) {
                e.preventDefault();
                
                var searchType = $('#searchType').val();
				if(searchType != "appSearch"){
					this.detailPopup(e);
					return;
				}
                
                var $target = $(e.currentTarget), 
                    toffset = $target.offset();
                
                new ApprovalDetailSearchLayer({
                	
                	offset: {
                        top : parseInt(toffset.top+30, 10),
                        right : 7
                    }
                });
                
                return false;
            },
            
            detailPopup : function(e) {
				var detailSearchPopupView = new totalSearchView();
				var targetOffset = $(e.currentTarget).offset();
				
				this.searchPopup = $.goSearch({
                    modal : true,
                    header : commonLang["상세검색"],
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
			}
    	
    	}, {
            __instance__: null, 
            
            getInstance: function() {
                if(this.__instance__ === null) {
                	this.__instance__ = new this.prototype.constructor();
                }
                
                return this.__instance__;
                
            }
        });
    });
