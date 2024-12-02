(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "admin/models/hrcard_config",
        "admin/views/app_admin_list",
        "hgn!admin/templates/hrcard_config",
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
        hrcardConfigModel,
        AppAdminListView,
        configTmpl,
        adminTmpl,
        commonLang,
        adminLang
    ) {
        
        var HRCardConfig,
            tmplVal = {
                label_ok: commonLang["저장"],
                label_cancel: commonLang["취소"],
                label_hrcardActive : adminLang['인사정보 활성화 여부'],
        	    label_menuActive : adminLang['메뉴 활성화 여부'],
        	    label_menuActiveDesc : adminLang['해당 메뉴를 활성화 합니다.'],
        	    label_menuDectiveDesc : adminLang['해당 메뉴를 비활성화 합니다.'],
                label_manager : adminLang['인사정보 운영설정']
            };
        
        HRCardConfig = App.BaseView.extend({
            
            el : '#layoutContent',
            
            initialize : function(){
                this.model = hrcardConfigModel.read();//★★
                this.adminListView = new AppAdminListView({
                    title: tmplVal.label_manager,
                    collection: this.model.get('administrators')
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
                this.$el.on("click", "span#btn_ok", $.proxy(this.hrcardConfigSave, this));
                this.$el.on("click", "span#btn_cancel", $.proxy(this.hrcardConfigCancel, this));
            },
            
            render : function() {
                this.$el.empty().html(configTmpl(
                		{ lang : tmplVal,
                		  menuActive : this.model.get('hrCardMenuActive')
                		}));
                this.$el.find("div.content_page").prepend(this.adminListView.render());
                this.$el.find("#admin_title").html(adminLang["운영자"]);
                this.$el.find("#add_text").html(commonLang["추가"]);
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
                };
                $.goOrgSlide({
                    header : tmplVal.label_admin_add,
                    callback : addAdminCallback,
                    contextRoot : GO.contextRoot,
                    target : e,
                    isAdmin : true
                });
            },
            
            hrcardConfigSave : function(){
                var saveData = {
                        administrators: this.adminListView.collection.toJSON(),
                        hrCardMenuActive : $("input[name=menuActive]:checked").val()
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
        
            hrcardConfigCancel : function(){
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
        
        return HRCardConfig;
    });
}).call(this);
