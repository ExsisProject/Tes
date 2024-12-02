(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "admin/models/dashboard_config",
        "admin/views/app_admin_list",
        "hgn!admin/templates/dashboard_config",
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
        DashboardConfigModel,
        AppAdminListView,
        configTmpl,
        adminTmpl,
        commonLang,
        adminLang
    ) {
        
        var DashboardConfig,
            SpecListView,
            tmplVal = {
                'label_ok' : commonLang["저장"],
                'label_cancel' : commonLang["취소"],
                'gadget_visibility' : adminLang["가젯 공개 설정"],
                'public' : adminLang['공개'],
                'private' : adminLang['비공개']
            };
        
        DashboardConfig = App.BaseView.extend({
            
            el : '#layoutContent',
            adminListView: null,
            specListView: null,
            
            initialize : function(){
                this.model = DashboardConfigModel.read();
                this.adminListView = new AppAdminListView({
                    title: adminLang["대시보드 운영자"],
                    collection: this.model.get("administrators")
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
                this.$el.on("click", "span#btn_ok", $.proxy(this.dashboardConfigSave, this));
                this.$el.on("click", "span#btn_cancel", $.proxy(this.dashboardConfigCancel, this));
            },
            
            render : function() {
                this.$el.empty().html(configTmpl({ 
                    lang : tmplVal,
                    specs : this.model.get('specs').toJSON()
                }));
                this.$el.find("div.content_page").prepend(this.adminListView.render());
                this.$el.find("#spec_list tr:last-child").addClass('last');
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
                    header : adminLang["운영자 추가"],
                    callback : addAdminCallback,
                    contextRoot : GO.contextRoot,
                    target : e,
                    isAdmin : true
                });
            },
            
            dashboardConfigSave : function(){
                var saveData = {
                    administrators: this.adminListView.collection.toJSON(),
                    specs: _.map($("#spec_list").find('input[type="radio"]:checked'), function(el) {
                        return {
                            'id' : $(el).attr('name'),
                            'active' : $(el).attr('value')
                        };
                    })
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
        
            dashboardConfigCancel : function(){
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
        
        return DashboardConfig;
    });
}).call(this);
