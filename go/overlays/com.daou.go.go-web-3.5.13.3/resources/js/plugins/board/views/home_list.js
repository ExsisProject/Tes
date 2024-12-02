(function() {
    define([
        "jquery", 
        "backbone",
        "app",
        "hogan",
        "i18n!nls/commons", 
        "i18n!board/nls/board", 
        
        "hgn!board/templates/home_list", 
        "hgn!board/templates/home_list_more", 
        "board/collections/post_myhome", 
        "board/views/board_title", 
        "board/collections/board_favorite",
        "jquery.go-preloader"
    ], 
    
    function(
        $,
        Backbone, 
        App, 
        Hogan,
        commonLang, 
        boardLang,
        
        LayoutTpl, 
        LayoutTplMore, 
        HomeListCollection, 
        BoardTitleView, 
        SideFavoriteCollection 
    ) {
    
    	var lang = {
    			'board' : commonLang['게시판'],
    			'board_home' : boardLang['게시판 홈'],
    			'detail_search' : commonLang['상세검색'],
    			'detail_view' : commonLang['자세히 보기'],
    			'more_view' : boardLang['더 보기'],
    			'search' : commonLang['검색'],
    			'search_result' : commonLang['검색결과'],
    			'total' : boardLang['총'],
    			'count' : boardLang['건'],
    			'not_list' : boardLang['아직 등록된 글이 없습니다. 아래 버튼을 클릭하여, 글을 등록해 주세요.'],
    			'not_board' : boardLang['아직 등록된 게시판이 없습니다. 아래 버튼을 클릭하여, 게시판을 등록해 주세요.'],
    			'not_dept_board' : boardLang['아직 등록된 게시판이 없습니다.'],
    			'new_post' : boardLang['새 글 작성하기'],
    			'new_board' : boardLang['게시판 추가하기'],
    			'no_auth' : boardLang['열람권한이 없는 게시물입니다.'],
    			'not_list_01' : boardLang['작성된 게시글이 없습니다.'],
    			'private' : commonLang['비공개'],
    			'wait' : commonLang['잠시만 기다려주세요'],
    			'recent_board' : boardLang['최신글 모음'],
    			'total_board' : boardLang['전체 게시판'],
    			'favorite' : commonLang['즐겨찾기'],
    			'empty_favorite' : boardLang['즐겨찾기 게시판 없음']
    	};
    	var layoutView = Backbone.View.extend({

    		unbindEvent: function() {
                this.$el.off();
    			this.$el.off("focus", ".search_wrap .search");
    			this.$el.off("blur", ".search_wrap .search");
    			this.$el.off("click", ".btn_list_more");
    			this.$el.off("click", ".title");
    			this.$el.off("click", "ul.home_list li.dataItem");
    			this.$el.off("click", ".btn_list_more");
    			this.$el.off("click", ".board_link");
    			this.$el.off("click", "span.photo a");
    			this.$el.off("click", "#homeListNewPostBtn");
    			this.$el.off("click", "#homeListNewBoardBtn");
    			this.$el.off("click", "#moreButtoff");
    			this.$el.off("click", "#home_tab li");
                this.$el.off("click", "li.private");

    			//community
    			this.$el.off("click", ".community_link");
    		}, 
    		
    		bindEvent: function() {
    			this.$el.on("focus", ".search_wrap .search", $.proxy(this.searchFocus, this));
    			this.$el.on("blur", ".search_wrap .search", $.proxy(this.searchBlur, this));
    			this.$el.on("click", ".btn_list_more", $.proxy(this.viewPost, this));
    			this.$el.on("click", "ul.home_list li.dataItem", $.proxy(this.viewDetailLi, this));
    			this.$el.on("click", ".btn_list_more", $.proxy(this.viewDetail, this));
    			this.$el.on("click", ".board_link", $.proxy(this.moveBoardLink, this));
    			this.$el.on("click", "span.photo a, a.name", $.proxy(this.showProfileCard, this));
    			this.$el.on("click", "#homeListNewPostBtn", $.proxy(this.newPost, this));
    			this.$el.on("click", "#homeListNewBoardBtn", $.proxy(this.newBoard, this));
    			this.$el.on("click", "#moreButton", $.proxy(this.listMore, this));			
                this.$el.on("click", "#home_tab li", $.proxy(this.changeTab, this));
    			
    			//community
    			this.$el.on("click", ".community_link", $.proxy(this.moveCommunityLink, this));
    		},
            initialize: function() {
                this.favoriteCollection = SideFavoriteCollection.getCollection();
                this.hasFavorite = this.favoriteCollection.length == 0 ? false : true;
                this.tabType = this.hasFavorite ? "favorite" : "all";
                this.collection = HomeListCollection.create({url_type : this.tabType});
            },
            render : function() {
                this.unbindEvent();
                this.bindEvent();
                var _this = this;
                
                $(window).unbind('scroll.board');
                $(window).bind('scroll.board', function (ev) {
                    //console.log('scroll');
                     d_height = $(document).height(); 
                     w_height = $(window).height();  
                     s_height = d_height - w_height;
                     d_top = $(document).scrollTop(); 
                     if ((s_height - d_top) < 2) {
                         if(_this.$el.find('div.bottom_action').is(':visible')){
                             _this.listMore();
                         }
                     }
                });
            
                homelistTpl = LayoutTpl({
                    lang : lang,
                    hasFavorite : this.hasFavorite
                });
                
                this.$el.html(homelistTpl);   
                
                this.renderContent();
                
                BoardTitleView.render({
                    el : '.content_top',
                    dataset : {
                        name : lang.board_home
                    }
                });
                
                if(!GO.session('useOrg')) {
                    $('#homeListNewBoardBtn').remove();
                }
                
                (new HomeWigetApp).render();
            },
            changeTab : function(e){
                var targetEl = $(e.currentTarget),
                    parentEl = targetEl.parents("ul:first");
                
                this.tabType = targetEl.attr("data-type");
                
                this.collection = HomeListCollection.create({url_type : this.tabType});
                
                parentEl.find("li").removeClass("active");
                targetEl.addClass("active");
                
                this.renderContent();
            },
    		showProfileCard : function(e){
    			ProfileView = require("views/profile_card");
    			var userId = $(e.currentTarget).attr('data-userid');
    			if(userId != ""){
    				ProfileView.render(userId, e.currentTarget);
    			}
    			e.stopPropagation();
    		},
    		
    		moveCommunityLink : function(e){
    			return;
    		},
    		
    		newPost : function(){
    			App.router.navigate('board/post/write', true);
    		},
    		newBoard : function(){
    			App.router.navigate('board/create', true);
    		},
    		viewContent : function(e){
    			alert('viewContent');
    		},
    		viewPost : function(e){
    			//console.log("postId["+$(e.target).attr("data-postId")+"]boardId["+$(e.target).attr("data-boardId")+"]");
    		},
    		searchFocus : function(e){
    			$(e.target).parent().addClass('search_focus');			
    		},
    		searchBlur : function(e){
    			$(e.target).parent().removeClass('search_focus');
    		},
    		moveBoardLink : function(e){
    			var targetEl = $(e.currentTarget).parents('li').first();
    			var boardId = targetEl.attr('data-boardId');
    			App.router.navigate("board/"+boardId, true);
    			e.stopPropagation();
    		},
    		viewDetailLi : function(e){
    			var targetEl = $(e.currentTarget);
    			this.moveBoardAction(targetEl);	
    		},
    		viewDetail : function(e){
    			var targetEl = $(e.currentTarget).parents('li').first();
    			this.moveBoardAction(targetEl);
    		},
    		moveBoardAction : function(targetEl){
    			var boardType = targetEl.attr('data-boardType');
    			var boardId = targetEl.attr('data-boardId');
    			var postId = targetEl.attr('data-postId');
    			
    			if(boardType == "CLASSIC"){
    				App.router.navigate("board/"+boardId+"/post/"+postId, true);
    			}else if (boardType == 'STREAM'){
    				App.router.navigate("board/"+boardId+"/post/"+postId+"/stream", true);
    			} else {
    				App.router.navigate("board/"+boardId, true);
    			}
    		},
            onClickedPrivatePost : function() {
    			$.goMessage(boardLang['게시글 열람불가 메세지']);
			},
    		listMore : function(){
    			var page = parseInt(this.collection.page.page) +1
    			
                this.renderContent({
                    page : page,
                    offset : 15,
                    isMore : true
                });
    		},

    		renderContent : function(opts){
    		    var self = this;
    		        defaults = {
    		            page : 0,
    		            offset : 15,
    		            isMore : false
    		        },
    		        options = {},
    		        preloader = null;
    		        
    		    options = $.extend({}, defaults, opts);
    		    
    		    if(!options.isMore){
    		        preloader = $.goPreloader();
    		        preloader.render();
    		    }
    		    
    			this.collection.fetch({
                    data : {
                        "page": options.page , 
                        "offset": options.offset, 
                        "url_type" : self.tabType
                    },
                    
                    success : function(collection){
                        var dataSet = collection.toJSON(),
                            hasBoard = true,
                            hasWritableBoard = true,
                            homelistTpl = "",
                            isFavorite = self.tabType == "favorite" ? true : false,
                            
                            // 즐겨찾기를 하지 않았을 경우 false
                            isEmptyFavorite = (collection.extParameter == undefined) ? true : collection.extParameter; 
                        
                    
                        if(!dataSet.length && collection.extParameter) {
                            hasBoard = collection.extParameter.hasBoard;
                            hasWritableBoard = collection.extParameter.hasWritableBoard;
                        }

                        var boardType = function(){
                            if(this.type == "CLASSIC"){
                                return "classic";
                            }
                            return "feed";
                        };

                        var isZero = function(){
                            if(parseInt(this.recommendCount) == 0){
                                return 'zero';              
                            }
                            return '';
                        };
                        
                        var dateParse = function(date){
                            return GO.util.snsDate(this.createdAt);
                        };
                        
                        var isClassic = function(){
                            var type = this.type;
                            if(type == "CLASSIC"){
                                return true;
                            }
                            return false;
                        };

                        var contentParse = function(){
                        	function escape(summary) {
                        	    if(!summary) {
                        	        return;
                                }
                        		var split = summary.split("\n");
                        		var clone = _.clone(split); 
                        		_.each(split, function(data, index) {
                        			if (data == "") {
                        				clone.shift(index);
                        			} else {
                        				return false;
                        			}
                        		});
                        		return clone.join("\n");
                        	};
                        	var content = this.type == "STREAM" ? escape(this.summary) : this.summary; 
                        	return GO.util.textToHtml(GO.util.convertMSWordTag(content));
                        };
                        
                        var titleParse = function() {
                            return GO.util.escapeHtml(this.title);
                        };
                        
                        var isPostHidden = function(){
                        	return this.hiddenPost;
                        };

                        var isTitleShowHiddenPost = function() {
                        	return this.summary != " $$#HIDDEN_POST#$$ " && this.hiddenPost;
						};
                        
                        homelistTpl = LayoutTplMore({
                            dataSet:dataSet,
                            isZero:isZero,
                            titleParse : titleParse,
                            contentParse:contentParse,
                            dateParse:dateParse,
                            hasBoard : hasBoard,
                            lang:lang,
                            isClassic:isClassic,
                            isPostHidden:isPostHidden,
                            isTitleShowHiddenPost:isTitleShowHiddenPost,
                            writeBtnShow:hasWritableBoard,
                            isOrgServiceOn : GO.session("useOrg"),
                            isFavorite : isFavorite,
                            isEmptyFavorite : isEmptyFavorite,
                            boardType : boardType
                        });
                        
                        if(options.isMore){
                            self.$el.find('ul.article_list').append(homelistTpl);
                        }else{
                            self.$el.find('ul.article_list').html(homelistTpl);
                        }
                        
                        self.moreBtnHide(collection);

                        self.$el.on("click", "li.private", self.onClickedPrivatePost);
                    }
    			}).done(function(){
    	             if(!options.isMore){
    	                 preloader.release();
	                 }
    			});
    		},
    		moreBtnHide : function(){
    			// 더보기 버튼 유무
    			if(this.collection.length == 0){
    				$('#moreButton').hide();
    				return;
    			}
    			
    			var islastpage = this.collection.page.lastPage;			
    			if(islastpage){
    				$('#moreButton').hide();
    			}else{
    				$('#moreButton').show();
    			}
    		}
    	},
    	{
            __instance__: null,
            create: function() {
            	this.__instance__ = new this.prototype.constructor({el: $('#content')});
                return this.__instance__;
            },
            render: function() {
                var instance = this.create(),
                    args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];                    
                return this.prototype.render.apply(instance, args);
            }            
    	});	
    	
    	var HomeWigetApp = Backbone.View.extend({
    	    
    	    el : "div.comm_group",
    	    
    	    initialize : function(){
    	        this.collection = new (Backbone.Collection.extend({
    	            url : GO.contextRoot + "api/board/home/exposure"
    	        }))();
    	    },
    	    
    	    render : function(){
    	        var self = this;
    	        
    	        this.collection.fetch({
    	            success : function(collection){
    	                if(collection.length == 0){
    	                    $("#recent_board").remove();
    	                    $("#content div.dashboard_comm").addClass("widzet_none");
    	                    return;
    	                }
    	                
    	                collection.each(function(model){
                            var $itemEl = $(["<div  class='list_type6' data-id='" + model.get("id") + "'>",
                                             "<p class='tit'>" + model.get("name") + "</p>",
                                             "<ul>" ,
                                             "</ul>" ,
                                             "<div class='img_loader_large' title='" + lang.wait + "'></div>",
                                         "</div>"].join(""));
                         
                             self.$el.append($itemEl);
                             
                             var homeWigetItem = new HomeWidgetItems({
                                 boardId : model.get("id"),
                                 el : $itemEl
                             });
                             homeWigetItem.render();
    	                });
    	            }
    	        })
    	    }
    	});
    	
    	var HomeWidgetItemTmpl = Hogan.compile([
    	                          "<li>",
                                      "{{#data.isClose}}",
                                          "<span class='ic_classic ic_lock' title='{{lang.private}}'></span>",
                                      "{{/data.isClose}}",
                                      "{{#data.isPostHidden}}",
                                          "<a href='javascript:;'>",
                                              "<span class='list_subject'>" +
											  "{{#data.isTitleHidden}}{{lang.no_auth}}{{/data.isTitleHidden}}" +
											  "{{^data.isTitleHidden}}{{data.title}}{{/data.isTitleHidden}}" +
											  "</span>",
                                          "</a>",
                                      "{{/data.isPostHidden}}",
                                      "{{^data.isPostHidden}}",
                                          "<a href='{{data.url}}'>",
                                              "<span class='list_subject' title='{{data.contentParse}}'>{{data.title}}</span>",
                                          "</a>",
                                      "{{/data.isPostHidden}}",
                                      "{{#data.isNew}}",
                                      "<span class='ic_classic ic_new2'></span>",
                                      "{{/data.isNew}}",
                                      "<span class='date'>{{data.createdAt}}</span>",
    	                          "</li>"].join(""));
    	
    	var HomeWidgetEmptyTmpl = Hogan.compile(["<li>",
                                        "<p class='data_null'>",
                                            "<span class='ic_data_type ic_no_contents'></span>",
                                            "<br>",
                                            "<span class='txt'>{{lang.not_list_01}}</span>",
                                        "</p>",
                                    "</li>"].join(""));
    	
    	var HomeWidgetCollection = Backbone.Collection.extend({
    	    initialize : function(options){
    	        this.boardId = options.boardId;
    	    },
            url : function(){
                return GO.contextRoot + "api/company/board/" + this.boardId + "/latest"
            }
        });
    	
    	var HomeWidgetItems = Backbone.View.extend({
    	    
    	    initialize : function(){
    	        this.collection = new HomeWidgetCollection({boardId: this.options.boardId});
    	    },
    	    
    	    render : function(){
    	        var self = this;
    	        
    	        this.collection.fetch({
    	            success: function(collection){
    	                var itemsEl = self.$el.find("ul");
    	                
    	                if(collection.length == 0){
    	                    itemsEl.html(HomeWidgetEmptyTmpl.render({
    	                        lang : lang
    	                    }));
    	                }else{
    	                    var items = [];
    	                    
    	                    collection.each(function(model){
                                var item = HomeWidgetItemTmpl.render({
                                    lang : lang,
                                    data : $.extend({}, model.toJSON(), {
                                        url : function(){
                                            var url = GO.contextRoot + "app/board/"+ model.get("boardId") + "/post/" + model.get("id");
                                            
                                            if(model.get("type") == "STREAM"){ url += "/stream"; }
                                            
                                            return url;
                                        },
                                        isClose : model.get("status") == "CLOSE",
                                        isNew : model.get("newFlag"),
                                        createdAt : GO.util.customDate(model.get("createdAt"), "MM-DD"),
                                        isPostHidden : model.get("hiddenPost"),
										isTitleHidden : model.get("summary") == " $$#HIDDEN_POST#$$ ",
                                        title : model.get("title"),
                                        contentParse : function() {
                                        	if(model.get("summary")){
                                        		return GO.util.convertMSWordTag(model.get("summary")).replace(/(\n)/gi, " ")
                                        	}else{
                                        		return "";
                                        	}
                                        }
                                    })
                                });
                                items.push(item);
    	                    });
    	                    
    	                    itemsEl.html(items.join(""));
    	                }
    	                self.$el.find("div.img_loader_large").hide();
    	            }
    	        })
    	    }
    	});
    	
    	
    	return layoutView;
    });
})();