;(function() {
    define([
        "app",     
        "backbone", 
        "hgn!templates/mobile/m_home",
        "models/m_base_config",
        "i18n!nls/commons",
        "jquery.mobile",
        "GO.util",
        "GO.m.util"
    ], 

    function(
    	GO,
        Backbone, 
        tplHomeView,
        MobileBaseConfig,
        commonLang
    ) {
    	var lang = {
    			'mail' : commonLang['메일'],
    			'calendar' : commonLang['캘린더'],
    			'board' : commonLang['게시판'],
    			'contact' : commonLang['주소록'],
    			'community' : commonLang['커뮤니티'],
    			'asset' : commonLang['예약'],
    			'survey' : commonLang['설문'],
    			'report' : commonLang['보고'],
    			'task' : commonLang['업무'],
    			'approval' : commonLang['전자결재'],
    			'docfolder' : commonLang['전사 문서함']
    	};
    	
        var HomeView = Backbone.View.extend({
        	id : 'mobileHome',
            initialize: function() {
            	GO.util.appLoading(true);
            },  
            render: function() {
            	window.androidHistoryBack = function(){
            		window.GOMobile.pressBackKey();
            	};
            	
            	// TODO: 이 파일 자체가 안 쓰이는 것으로 파악됨
            	console.log(GO.session('integratedCompanies'));
            	
            	var _this = this;
            	var homeConfig = new MobileBaseConfig();
            	homeConfig.fetch({async:true,reset:true});
            	homeConfig.on("change",function(collection,response){
            		var homelistTpl = tplHomeView({
            		    lang : lang,
    					contextRoot : GO.contextRoot,
    					company : collection.toJSON().name,
    					companies : GO.session('integratedCompanies'),
    					isMultiCompany : GO.session('integratedCompanies').length > 1
    				});
            		
                	_this.$el.html(homelistTpl).hide();
                	$("#main").html(_this.$el);
                	
                	GO.util.appLoading(false);
                	
                	_this.$el.fadeIn();
                	_this.setCurrentLayout();
				});

            	this.$el.on('vclick', 'ul.home a', function(e) {
                	e.stopPropagation();
                	var tapHighlightClass = 'iscroll-tap-highlight',
                		$targetEl = $(e.currentTarget);
                	$targetEl.addClass(tapHighlightClass);
                	setTimeout(function() {
                		$targetEl.removeClass(tapHighlightClass);
                    }, 300);
                });

            	/*var naviStr = "";
            	$.each(navigator, function( key, value ) {
            		  naviStr += key + ": " + value +"<br>";
            		});
            	$("#Mnavigator").html(naviStr);   */
            },
            goToApp : function(e) {
            	e.stopPropagation();
            	GO.router.navigate( $(e.currentTarget).attr('data-href'), { trigger: true, pushState: true } );
            	return false;
            },
            setCurrentLayout: function() {
                $('body').data('layout', 'home');
                $('body').data('sideApp', 'home');
            }
        });
        
        return new HomeView;

    });
}).call(this);