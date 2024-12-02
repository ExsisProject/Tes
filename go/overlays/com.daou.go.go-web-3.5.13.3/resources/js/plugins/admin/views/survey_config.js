(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "admin/collections/app_admin_list",
        "admin/views/app_admin_list",
        "hgn!admin/templates/survey_config",
        "hgn!admin/templates/app_admin_config",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "jquery.go-orgslide",
        "jquery.go-popup",
        "jquery.go-sdk"
    ], 
    
    function(
        $, 
        Backbone,
        App,
        Admins,
        AppAdminListView,
        configTmpl,
        adminTmpl,
        commonLang,
        adminLang
    ) {
        
        var SurveyConfig,
            tmplVal = {
                label_ok: commonLang["저장"],
                label_cancel: commonLang["취소"]
            };
        
        SurveyConfig = App.BaseView.extend({
            
            el : '#layoutContent',
            
            initialize : function(){
                this.model = new Backbone.Model();
                this.model.url = "/ad/api/surveyconfig";
                this.model.fetch({async : false});
                
                this.adminListView = new AppAdminListView({
                    title: adminLang["전사 설문 작성자 설정"],
                    collection: new Admins(this.model.get("administrators"))
                });
                this.unbindEvent();
                this.bindEvent();
            },
            
            unbindEvent : function() {
                this.$el.off("click", "#administratorCreate");
                this.$el.off("click", "span#btn_ok");
                this.$el.off("click", "span#btn_cancel");
            },
            
            bindEvent : function() {
                this.$el.on("click", "#administratorCreate", $.proxy(this.createAdministrator, this));
                this.$el.on("click", "span#btn_ok", $.proxy(this.surveyConfigSave, this));
                this.$el.on("click", "span#btn_cancel", $.proxy(this.surveyConfigCancel, this));
            },
            
            render : function() {
                this.$el.empty().html(configTmpl({ lang : tmplVal }));
                this.$el.find("div.content_page").prepend(this.adminListView.render());
                this.$el.find("#admin_title").html(adminLang["전사 설문 작성자"]);
                this.$el.find("#add_text").html(commonLang["추가"]);
                this.$el.find('ul.name_tag').parent().append('<span class="desc">'+ adminLang["전사 설문 작성자 설명"] +'</span>');
                return this.$el;
            },
            
            createAdministrator : function(e) {
                var _this = this;
                var addAdminCallback = function(data) {
                    _this.adminListView.addAdmin({
                        'userId': data.id,
                        'name': data.name,
                        'position': data.position
                    });
                    $('ul.name_tag').parent().find("span.desc").remove();
                    $('ul.name_tag').parent().append('<span class="desc">'+ adminLang["전사 설문 작성자 설명"] +'</span>');
                };
                $.goOrgSlide({
                    header : tmplVal.label_admin_add,
                    callback : addAdminCallback,
                    contextRoot : GO.contextRoot,
                    target : e,
                    isAdmin : true
                });
            },
            
            surveyConfigSave : function(){
                var saveData = {
                        administrators: this.adminListView.collection.toJSON()
                    };
                
                this.model.save(saveData,{
                    success : function(model, response) {
                        if(response.code == '200') {
                            $.goMessage(commonLang["저장되었습니다."]);
                        }
                    },
                    error : function(model, response) {
                        if(response.message) $.goAlert(response.message);
                        else $.goMessage(commonLang["실패했습니다."]);
                    }
                });
            },
        
            surveyConfigCancel : function(){
                var self = this;
                $.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function(){
                    self.initialize();
                    self.render();
                    $.goMessage(commonLang["취소되었습니다."]);
                }, commonLang["확인"]);
            }               
        }, {
            __instance__: null
        });
        
        return SurveyConfig;
    });
}).call(this);
