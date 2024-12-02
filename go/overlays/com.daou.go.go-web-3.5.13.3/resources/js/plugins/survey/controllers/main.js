(function() {
    define([
        "underscore", 
        "survey/views/layouts/default", 
        "i18n!survey/nls/survey"
    ], 
    
    function(
        _, 
        SurveyLayout, 
        SurveyLang
    ) {
        
        function SurveyController() {
            this.layout = SurveyLayout.create();
        }
        
        SurveyController.prototype.dashboard = function() {
            renderView(this.layout, 'dashboard', {
                title: SurveyLang["설문 홈"] 
            });
        };
        
        SurveyController.prototype.list = function(filterName) {
            renderView(this.layout, 'list', {
                title: {
                    'progress': SurveyLang["진행중인 설문"], 
                    'finished': SurveyLang["완료된 설문"],
                    'my': SurveyLang["내가 만든 설문"],
                    'copyable' : SurveyLang["설문 가져오기"]
                }[filterName], 
                onBeforeRender: function(layout) {
                	layout.selectSideMenu(filterName);
                    this.setFilter(filterName);
                    layout.setTitleDescription(filterName);
                }
            });
        };

        SurveyController.prototype.preview = function(surveyId) {
            require(["survey/views/detail"], function (DetailView) {
                var preview = new DetailView({'previewMode' : true});
                preview.setResponseView();
                preview.model.set('id', surveyId);
                preview.render();
                $('body').html(preview.$el);
            })
        },
        
        SurveyController.prototype.regist = function() {
            renderView(this.layout, 'regist', {
                title: SurveyLang["설문 작성"] 
            });
        };
        
        SurveyController.prototype.edit = function(surveyId) {
            renderView(this.layout, 'edit', {
                title: SurveyLang["설문 수정"] , 
                onBeforeRender: function(layout) {
                    this.model.set('id', surveyId);
                }
            });
        };

        SurveyController.prototype.editCopied = function(surveyId) {
            renderView(this.layout, 'edit', {
                title: SurveyLang["설문 수정"] ,
                onBeforeRender: function(layout) {
                    $.goSlideMessage(SurveyLang["복사된 설문입니다."]);
                    this.model.set('id', surveyId);
                }
            });
        };
        
        SurveyController.prototype.queryEditor = function(surveyId) {
            renderView(this.layout, 'query_editor', {
                title: SurveyLang["설문 문항 작성"], 
                onBeforeRender: function(layout) {
                    this.model.set('id', surveyId);
                }
            });
        };
        
        SurveyController.prototype.detail = function(surveyId) {
            // TODO: 페이지 타이틀 문제 해결하기...
            renderView(this.layout, 'detail', {
                title: SurveyLang["설문 상세"], 
                onBeforeRender: function(layout) {
                    this.model.set('id', surveyId);
                }
            });
        };
        
        SurveyController.prototype.modifyResponse = function(surveyId) {
            renderView(this.layout, 'detail', {
                title: SurveyLang["설문 응답 수정"], 
                onBeforeRender: function(layout) {
                	this.setResponseView();
                    this.model.set('id', surveyId);
                }
            });
        };
        
        function renderView(layout, fn, options) {
            _.defaults(options || {}, {
                onBeforeRender: function() {}, 
                onAfterRender: function() {}
            });
            
            layout.render().done(function() {
                if(options.title) {
                    this.setTitle(options.title);
                }
                
                require(['survey/views/' + fn], _.bind(function(TargetView) {
                    var view = new TargetView();
                    this.setContent(view);
                    
                    options.onBeforeRender.call(view, this);
                    view.render();
                    options.onAfterRender.call(view, this);
                }, this));
            });
        }
        
        return new SurveyController;
    });
})();