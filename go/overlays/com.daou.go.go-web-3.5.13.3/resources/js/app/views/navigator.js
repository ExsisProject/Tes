(function() {
    define([
        "backbone", 
        "app", 
        "hgn!templates/navigator/menu_item",
        "i18n!board/nls/board",
        "i18n!nls/commons",
        "jquery.go-popup"
    ], 

    function(
        Backbone, 
        GO, 
        template,
        boardLang,
        commonLang
    ) {
        var Nav = {};
        var tplVar = {                
                'alert_check_editor' : boardLang['현재 작성중인 내용이 있습니다.<br>화면 이동 시 작성 중인 내용은 사라집니다.<br>이동하시겠습니까?'],
                'confirm' : commonLang['확인'],
                'cancel' : commonLang['취소'],
                'input_placeholder' : boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.']
            };
        
        function isSupportHistoryAPI() {
            return !!(window.history && history.pushState);
        }
        
        Nav.Model = Backbone.Model.extend({
            defaults: {
                name: "",   
                url: GO.config("root"), 
                badge_count: 0
            },
            
            hasNoti: function() {
                return (this.get("badge_count") > 0);
            }, 
            
            hasSubmenu : function() {
            	return this.get('subMenuType');
            },
            
            isCurrent: function() {                
                return (this.isTargetIFrame() ? decodeURIComponent(GO.router.getSearch('url')) : GO.config("root") + GO.router.getPackageName()) === this.get("url");
            }, 
            
            isTargetNew: function() {
                return this.get("location") === 'new';
            },
            
            isTargetIFrame: function() {
                return this.get("location") === 'iframe';
            },
            
            isSubMenu : function() {
            	return this.get('parentId') > 0;
            }
        }); 
        
        Nav.Collection = Backbone.Collection.extend({
            model: Nav.Model,

            comparator: function(model) {
                return model.get("seq") || model.get("id");
            }, 

            initialize: function() {
                this._generateFromConfig();
            }, 

            // privates...
            _generateFromConfig: function() {
            	console.log(GO.config("menuList"));
            	
                _.each(GO.config("menuList"), function(prop, pkg) { 
                    var copyProp = _.clone(prop), 
                        contextRoot = GO.config("contextRoot"), 
                        url = copyProp.url;
                    
                    if(url.indexOf(contextRoot) !== 0 && url.indexOf('http://') !== 0) {
                        copyProp.url = (url[0] === '/' ? url : contextRoot + url);
                    }
                    this.add(copyProp, {silent: true}); 
                }, 
                this);
                return this;
            }
        });
        
        Nav.Collection = (function() {
        	var Collection = Backbone.Collection.extend({
	            model: Nav.Model,
	
	            comparator: function(model) {
	                return model.get("seq") || model.get("id");
	            }, 
	
	            initialize: function() {
	            	generateFromConfig.call(this);
	            }
        	});
        	
        	function generateFromConfig() {
        		_.each(GO.config("menuList"), function(prop, pkg) { 
                    var copyProp = _.clone(prop), 
                        contextRoot = GO.config("contextRoot"), 
                        url = copyProp.url;
                    
                    if(url.indexOf(contextRoot) !== 0 && url.indexOf('http://') !== 0) {
                        copyProp.url = (url[0] === '/' ? url : contextRoot + url);
                    }
                    this.add(copyProp, {silent: true}); 
                }, this);
        		
                return this;
        	}
        	
        	return Collection;
        })();
        
        
        //서버메뉴 레이어 뷰
        var SubmenuView = Backbone.View.extend({
            tagName: "div",
            className : "gnb_top_menu",
            initialize: function() {
            	this.menuArr = this.model.get('subMenu');
            	this.subMenuLength = this.menuArr.length;
            },
            render :function() {
        		_this = this;
        		this.$el.html('<ul />');
        		this.$listEl = this.$el.find('ul');
        		_.each(this.menuArr, function(v,k) {
        			_this.$listEl.append('<li class="nav-'+ v.appName+ ' ' + (k == _this.subMenuLength-1 ? 'last' : '')  + '" id="topSubmenu'+v.id+'" />');
        			v['is_submenu?'] = true;
        			$( template( v ) ).data({
                        'url': v.url, 
                        'location': v.location,
                        'hasSubmenu' : false
                    }).appendTo(_this.$listEl.find('#topSubmenu' + v.id));
        		});
            	this.$el.hide();
            	return this.el;
            }
        });
        
        var MenuItemView = Backbone.View.extend({
            tagName: "li",

            initialize: function() {
            	_this = this;
                if(!this.model) this.model = new Nav.Model();
                
                this.variables = _.extend({}, this.model.toJSON(), {
                    "url": this.getLinkUrl(), 
                    "target_new?": this.model.isTargetNew(),
                    'has_submenu?' : this.model.hasSubmenu(),
                    'is_submenu?' : false
                });
                
                this.$el.addClass('nav-' + this.model.get('appName'));
                this.model.on("change:badge", this.render, this);
                GO.router.on("change:package", this.render, this);
            }, 
            
            render: function() {
            	if(this.variables['subMenuType'] && !this.variables['has_submenu?']) return false;
            	
            	this.$el.empty();
                $( template( this.variables ) ).data({
                    'url': this.variables.url, 
                    'location': this.variables.location,
                    'hasSubmenu' : this.variables['has_submenu?']
                }).appendTo(this.$el); 
                
//                if(this.variables['has_submenu?']) {
//                	var subMenuView = new SubmenuView({"model" : this.model});
//                	this.$el.append(subMenuView.render());
//                }
                
                //this.toggleOn();
                this.toggleBadge();
                return this.el;
            }, 
            
            getLinkUrl: function() {
                var prefix = GO.config('root'), 
                    url = this.model.get('url');
                // history API를 지원하지 않는 브라우저에서 window.location.href로 이동하면 ? 이후의 문자열이 search 쿼리 영역으로 전환된다.
                // 따라서, 해시코드를 직접 생성해서 전달해주어야 한다.
                if(!isSupportHistoryAPI()) {
                    prefix = GO.config('root');
                    prefix += '#';
                } 
                
                return this.model.isTargetIFrame() ? prefix + 'sitelink?url=' + encodeURIComponent(GO.util.XSSFilter(url)) : url;
            }, 
            
            events : {
            	'click a':'moveMenu'
            },
            
            moveMenu : function(e){
            	e.preventDefault();
            	if(this.isReportApp()){
            	    if(!this.reportMoveValidate()){
            	        this.wirtePageMovePopup(e);
            	    }else{
            	        this.moveMenuAction(e);
            	    }
            	}else{
                    if(GO.util.hasActiveEditor()){
                    	if(GO.util.isEditorWriting()){
                    		this.wirtePageMovePopup(e);
    					}else{
    						if($(e.currentTarget).data('hasSubmenu')) {
                                this.toggleSubmenu(e); 
                            } else {
                                this.moveMenuAction(e);
                            }
    					}
                    }else{
                        if($('#feedContent').val() && $('#feedContent').val() != tplVar.input_placeholder){
                            this.wirtePageMovePopup(e);
                        }else{
                            if($(e.currentTarget).data('hasSubmenu')) {
                                this.toggleSubmenu(e);
                            } else {
                                this.moveMenuAction(e);
                            }
                        }
                    }
            	}
				this.$el.data('current_id', this.model.get('id'));
            },
            reportMoveValidate : function(){
                // TODO : 리팩토링 분기문
                
                var targetEl = $("#side").find("li p.on a"),
                    formFlag = targetEl.attr("data-form-flag") == "true" ? true : false,
                    isCreatePage = $("#content div.reportCreateArea").length == 0 ? false : true;
                
                if(!isCreatePage){
                    return true;
                }
                
                if(formFlag){  //양식이 있는경우
                    return false;
                }
                
                if(!formFlag && GO.util.hasActiveEditor()){  //양식이 없는 경우 
                	if(!GO.util.isEditorWriting()){
                		return true;
					}
                }
                
                return false;
            },
            isReportApp : function(){
                return this.getAppName() == "report";
            },
            getAppName : function(){
                return location.href.split("/app/")[1].split("/")[0];
            },
            toggleSubmenu : function(e) {
            	
            	var $menuEl = $(e.currentTarget).parent('li'),
            		$navigatorEl = $menuEl.parent('ul'),
	            	$subMenuEl = $(e.currentTarget).siblings('.gnb_top_menu');
            	if($subMenuEl.is(":visible")) {
            		$menuEl.removeClass('on');
            		$menuEl.removeClass('on_layer');
            		$subMenuEl.hide();
            	} else {
            		
            		$navigatorEl.find('li.on').removeClass('on');
            		$navigatorEl.find('li.on_layer').removeClass('on_layer');
            		$navigatorEl.find('.gnb_top_menu').hide();
            		$menuEl.addClass('on');
            		$subMenuEl.show();
            		
            		if($subMenuEl.width()+10 > $(document).width() - $menuEl.offset().left) {
            			$subMenuEl.css('right', $(document).width() - $menuEl.offset().left - $menuEl.width());
            		} else {
            			$subMenuEl.css('right', 'auto');
            		}
            	}
            },
            moveMenuAction : function(e){
//            	window['oEditors'] = [];
            	var url = $(e.currentTarget).data('url'), 
        	        parsedUrl = GO.util.parseUrl(url), 
        	        referrer = GO.util.parseUrl(window.location.href), 
            	    location = $(e.currentTarget).data('location'),
            	    re = new RegExp("(app)","gi");
            	
            	switch(location) {
                	case 'new': 
                	    this.popupOpen(url);
                	    break;
                	case 'iframe':
                	    // 두개 이상의 iframe 타입 메뉴가 있을 때 상단메뉴까지 페이지가 바뀌는 현상이 있어서 우선 location.href로 페이지 갱신.
                	    window.location.href = url;
                	    if(!isSupportHistoryAPI()) {
                	        // history API를 지원하지 않는 브라우저에서 search 쿼리만 변경될 경우 화면이 리프레시 되지 않고 분할되는 현상이 있다. 
                	        // 그래서 reload 시킨다.
                	        window.location.reload();
                	    }
                	case 'self':
                	    
                	    if( GO.config("trustCertification") === true && referrer.protocol === 'https:' ) {
                	        url = parsedUrl.href.replace('https:', 'http:');
                            window.location.href = url;
                	    } else {
                	        if(re.test(url)){
                                var parseUrl = url.substr(url.lastIndexOf('/')+1);
                                GO.router.navigate(parseUrl, { trigger: true, pushState: true }); 
                            } else {
                                window.location.href = url;
                            }
                	    }
                	    
                	    break;
                	default:
                	    // 잘못된 location 타입은 히스토리를 지우고 홈으로 보낸다.
                	    GO.router.navigate('/', { trigger: true, replace: true }); 
                	    break;
            	}
            },
            
            popupOpen : function(url){
            	var newWin = window.open('about:blank');
    			newWin.location.href = url;
            },
            
            wirtePageMovePopup : function(e){
				var _this = this;
				$.goPopup({
					title : '',
					message : tplVar.alert_check_editor,
					modal : true,
					buttons : [{
						'btext' : tplVar.confirm,
						'btype' : 'confirm',
						'callback' : function(){							
							_this.moveMenuAction(e);
						}
					}, {
						'btext' : tplVar.cancel,
						'btype' : 'normal',
						'callback' : function() {}
					}]
				});
			},
			
            toggleOn: function() {
                this.$el.removeClass("on bar on_layer");
                if(this.model.isCurrent()) {
                    this.$el.addClass("on");
                } 
            }, 

            toggleBadge: function() {
                if(this.model.hasNoti()) {
                    this.$el.find(".badge").css("visibility", "visible");
                } else {
                    this.$el.find(".badge").html('&nbsp;').css("visibility", "none");
                }
            }, 

            toHTML: function() {
                var element = document.createElement("span");
                element.appendChild(this.el);
                return $(element).html();
            }
        });
      
        Nav.View = Backbone.View.extend({
            tagName: "ul", 
            className: "1depth",

            initialize: function(options) {
            	this.options = options || {};
            	this.navContainer = this.options.container;
            	this.options.menuWidth;
                this.collection = new Nav.Collection();
                
                this._bindWindowResizeForNav();
            }, 
            render: function() {
            	var defer = $.Deferred(),
            		totalMenuWidth = 115;//.my_info에 메뉴가 가려져서 100 추가 >>아이콘 사이즈 15
            	this.$el.empty().append('<li class="more" style="display:none"><a><span class="more" title="more"></span></a><div class="gnb_top_menu" style="display:none"><ul class="2depth"></ul></div></li>');
            	this.navContainer.append(this.$el);
                
            	this.collection.each(function(model) {
            		
                    var itemView = new MenuItemView({"model": model}),
                    	childEl = itemView.render();
                    if(this.options.menuWidth < totalMenuWidth){
                    	this.navContainer.find('li.more ul.2depth').append(itemView.render());
                    }else{
                    	if(childEl) {
                        	this.navContainer.find('ul.1depth li.more').before(itemView.render());
                        }
                    }
                    totalMenuWidth += this.navContainer.find('ul.1depth li:nth-last-child(2)').width();
                    
                }, this);
                
                if(this.options.menuWidth < totalMenuWidth){
                	this.navContainer.find('li.more').show();
        		}else{
        			this.navContainer.find('li.more').hide();
        		}
                
                defer.resolveWith(this, [this]);
                
                return defer;
            }, 
            
            _bindWindowResizeForNav: function() {
                var resizer = new GOWindowResizer();
                $(window).off('.nav').on('resize.nav', function(e) {
                    resizer.bind(e, function() {
                    	GO.EventEmitter.trigger('default', 'changed:resizeTopMenu', this);
                    });
                });
            },

            toHTML: function() {
                var element = document.createElement("span");
                element.appendChild(this.render());
                return $(element).html();
            }
        });
      
        return Nav;
    });
}).call(this);