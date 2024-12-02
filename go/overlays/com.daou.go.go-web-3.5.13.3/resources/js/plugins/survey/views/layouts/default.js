(function() {
    
    define([
        "jquery",
        "amplify", 
        "app", 
        "views/layouts/default", 
        "views/content_top",
            "components/backdrop/backdrop",
        "hgn!survey/templates/side", 
        "i18n!nls/commons",
        "i18n!survey/nls/survey"
    ], 
    
    function(
        $, 
        amplify, 
        GO, 
        DefaultLayout, 
        ContentTopView,
        BackdropView,
        SideTemplate, 
        CommonLang, 
        SurveyLang
    ) {
    	var CATE_STORE_KEY = {
            name: GO.session("id") + '-survey-lastcate',
            type: "session"
        };

        var SURVEY_FOLDER_STORE_KEY = {
            name: GO.session("loginId") + '-survey-folder-toggle',
            type: "local"
        };

        var SurveyTopView = ContentTopView.extend({
        	initialize: function(options) {
        		ContentTopView.prototype.initialize.call(this, options);
        		_.extend(this.options, options || {});
            	ContentTopView.prototype.initialize.apply(this, arguments);
            	this.options.use_search = false;
            }
        });
        
        var SurveyLayout = DefaultLayout.extend({ 
        	
        	events: {
        		"click section#surveySide .side-category": "_toggleSideMenu",
                "click section#surveySide span.ic_side" : "_toggleFolder",
                "click section#surveySide span.txt" : "_toggleFolder",
                "click h1 #titleDescBtn" : "toggleTitleDesc"
        	}, 
            
            initialize: function() {
                var args = Array.prototype.slice.call(arguments);
                DefaultLayout.prototype.initialize.apply(this, args);
                this.contentTopView = new SurveyTopView();
            }, 
            
            render: function() {
                var self = this, 
                    deferred = $.Deferred();

                this.appName = 'survey';
                DefaultLayout.prototype.render.apply(this).done(function() {
                    
                    self.renderSide();
                    self.renderContentTop();
                    self.getContentElement().addClass('go_renew go_alarm');
                    
                    deferred.resolveWith(self, [self]);
                });
    
                return deferred;
            }, 
            
            renderSide: function() {
        	    var isSurveyOpen = this.getStoredValue(SURVEY_FOLDER_STORE_KEY);
                this.clearSide();
                this.getSideElement().append(SideTemplate({
                    "context_root": GO.config('contextRoot'),
                    "label": {
                    	"survey": SurveyLang["설문"],
                        "create_survey": SurveyLang["설문 작성"],
                        "progressing": SurveyLang["진행중인 설문"], 
                        "finished": SurveyLang["완료된 설문"], 
                        "created_by_me": SurveyLang["내가 만든 설문"],
                        "bring_survey" : SurveyLang["설문 가져오기"],
                        "collapse": CommonLang["접기"],
                        "expand": CommonLang["펼치기"]
                    },
                    isMultiCompanyUser : GO.session('integratedCompanies').length > 1,
                    isSurveyOpen : _.isUndefined(isSurveyOpen) ? true : isSurveyOpen,
    				appName : GO.util.getAppName("survey")
                }));
            }, 
            
            renderContentTop: function() {
                this.getContentElement().append(this.contentTopView.el);
                this.contentTopView.render();
            }, 
            
            /**
            페이지 타이틀 설정
            @method setTitle
            @params {Object} 타이틀 문자열 혹은 HTML*Element 타입의 객체
            @return {Object} SurveyLayout 인스턴스 객체
            */
            setTitle: function(html) {
                if(this.contentTopView === null) throw new Error("contentTopView 객체가 필요합니다.");
                this.contentTopView.setTitle(html);
                return this;
            },

            setTitleDescription: function(category) {
                if(category === 'copyable') {
                    var template= '<span class="btn_wrap"><span id="titleDescBtn" class="ic ic_info">'
                        +'<span class="layer_tail tooltip-desc" el-backdrop style="display:none;">'
                        +'<div>'+SurveyLang["설문 가져오기 설명"]+'</div></span></span></span>';
                    this.contentTopView.$el.find('h1').append(template);
                }
            },

            toggleTitleDesc: function() {
                if(!this.backdropView) {
                    var contentTopEl = this.contentTopView.$el.find("#titleDescBtn");
                    this.backdropView = new BackdropView();
                    this.backdropView.backdropToggleEl = $(contentTopEl).find("span[el-backdrop]");
                    this.backdropView.linkBackdrop(contentTopEl);
                }
            },
            
            selectSideMenu: function(category) {
            	if(_.isUndefined(this.getStoredValue(CATE_STORE_KEY))) {
            		this.storeKeyValue(CATE_STORE_KEY, category);
            	}
            	
            	$('#side .side-category').each(function(i, el) {
            		var $titlePara = $(el).closest('p.title');
            		
            		if($(el).data('category') === category) {
            			$titlePara.addClass('on');
            		} else {
            			$titlePara.removeClass('on');
            		}
            	});
            },

            getStoredValue: function(store_key) {
                return GO.util.store.get(store_key.name);
            },

            storeKeyValue: function(key, value) {
                GO.util.store.set(key.name, value, {type: key.type});
            },

            _toggleSideMenu: function(e) {
            	var selectedCategory = $(e.currentTarget).data('category');
            	this.storeKeyValue(CATE_STORE_KEY, selectedCategory);
            },

            _toggleFolder : function(e){
                var currentTarget = $(e.currentTarget),
                    parentTarget = currentTarget.parents('h1'),
                    toggledFolder = parentTarget.find("span.ic_side");

                if(parentTarget.hasClass("folded")) {
                    parentTarget.next('ul').slideDown(200);
                    parentTarget.removeClass("folded");
                    toggledFolder.attr("title", CommonLang["접기"]);
                } else {
                    parentTarget.next('ul').slideUp(200);
                    parentTarget.addClass("folded");
                    toggledFolder.attr("title", CommonLang["펼치기"]);
                }

                var isOpen = !parentTarget.hasClass("folded");
                this.storeKeyValue(SURVEY_FOLDER_STORE_KEY, isOpen);
            },
        }, {
            __instance__: null            
        });
        
        return SurveyLayout;
    });
    
})();