(function() {
    
    define([
        "jquery",
        "amplify", 
        "app", 
        "survey/views/mobile/side", 
        "views/layouts/mobile_default", 
        "hgn!survey/templates/side",
        "i18n!survey/nls/survey"
    ], 
    
    function(
        $, 
        amplify, 
        GO, 
        SideMenuView, 
        MobileLayout, 
        SideTemplate,
        SurveyLang
    ) {
        
        var SurveyMobileLayout = MobileLayout.extend({ 
        	name: 'survey', 
            
            initialize: function(options) {
            	options = options || {};
            	// 글로벌 검색창 사용안함
            	options.useSearch = false;
            	
            	MobileLayout.prototype.initialize.call(this, options);
            	_.extend(this.options, options);
            	
            	this.titleToolbarView = null;
            	this.toolbarOptions = this.options.toolbar;
            }, 
            
            setToolbar: function(options) {
            	_.extend(this.toolbarOptions, options || {});
            }, 
            
            render: function() {
                var self = this, 
                    deferred = $.Deferred();
                
                this.clearContent();
                
                if($('body').data('sideApp') === this.name) {
                	deferred.resolveWith(this, [this]);
                	
                } else {
                	MobileLayout.prototype.render.call(this, this.name).done(function() {
                    	renderSideMenu(this);
                    	$('body').data('sideApp', this.name);
                        deferred.resolveWith(self, [self]);
                    });
                }

                return deferred;
            }, 
                        
            /**
             * 컨텐츠 영역 설정
             * TODO: 리팩토링(default.js에서 응용함)
             * @param klass 뷰 클래스
             * @param options 뷰 클래스 생성시 전달할 옵션
             * @param appended 컨텐츠 뷰를 append할 것인지 여부(false이면 el을 그대로 사용)
             */
            buildContentView: function( klass, options, appended ) {
            	options = options || {};
            	appended = appended || false;
            	
                var contentWrap = this.getContentElement(),
                	instance;
                
                _.defaults(options, {
                	"append": false
                });
                
                if(contentWrap.data( 'go-view-instance' )) {
                    var savedInstance = contentWrap.data('go-view-instance'), 
                        releaseFn = _.isFunction(savedInstance['release']) ? savedInstance['release'] : savedInstance['remove'];
                    
                    releaseFn.call( savedInstance );
                }
                
                if(appended) {
                	instance = new klass(options);
                	contentWrap
                		.empty()
                		.append(instance.el);
                } else {
                	instance = new klass(_.extend(options, {"el": this.getContentElement()}));
                }
                
                contentWrap.data( 'go-view-instance', instance );
                
                return instance;
            }, 
            
            
            /**
            페이지 타이틀 설정
            @method setTitle
            @params {Object} 타이틀 문자열 혹은 HTML*Element 타입의 객체
            @return {Object} SurveyLayout 인스턴스 객체
            */
            setTitle: function(html) {
                if(this.titleToolbarView === null) throw new Error("titleToolbarView 객체가 필요합니다.");
                this.titleToolbarView.setTitle(html);
                return this;
            }
        }, {
            __instance__: null
        });

		function renderSideMenu(layout) {
			if($('body').data('sideApp') != layout.name) {
				var sideMenu = new SideMenuView(), 
					sideEl = layout.getSideContentElement().append(sideMenu.el);
				
				sideMenu.render().done(function() {
					GO.EventEmitter.trigger('common', 'layout:initSideScroll', this);
					sideEl.parent().hide();
				});
			}
		}
		
        return SurveyMobileLayout;
    });
    
})();