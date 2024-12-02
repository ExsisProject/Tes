(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "admin/models/welfare_config",
        "admin/views/app_admin_list",
        "hgn!admin/templates/welfare_config",
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
        VacationConfigModel,
        AppAdminListView,
        ConfigTmpl,
        AdminTmpl,
        CommonLang,
        AdminLang
    ) {
        
        var VacationConfig,
            tmplVal = {
                label_ok: CommonLang["저장"],
                label_cancel: CommonLang["취소"],
                label_welfareActive : AdminLang["복지포인트 활성화 여부"],
        	    label_menuActive : AdminLang['메뉴 활성화 여부'],
        	    label_menuActiveDesc : AdminLang['해당 메뉴를 활성화 합니다.'],
        	    label_menuDectiveDesc : AdminLang['해당 메뉴를 비활성화 합니다.']
            };
        
        VacationConfig = App.BaseView.extend({
            
            el : '#layoutContent',

            events : {
                "click #administratorCreate" : "createAdministrator",
                "click span#btn_ok" : "save",
                "click span#btn_cancel" : "cancel"
            },
            
            initialize : function(type){
                this.$el.off();
                this.type = type;
                this.model = VacationConfigModel.get(this.type);
                this.adminListView = new AppAdminListView({
                    title: AdminLang["운영자 추가"],
                    collection: this.model.get('administrators')
                });
            },

            render : function() {
                this.$el.empty().html(ConfigTmpl(
                		{ lang : tmplVal,
                		  menuActive : this.model.get('menuActive')
                		}));
                this.$el.find("div.content_page").prepend(this.adminListView.render());
                this.$el.find("#admin_title").html(AdminLang["운영자"]);
                this.$el.find("#add_text").html(CommonLang["추가"]);
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
            
            save : function(){
                var saveData = {
                        administrators: this.adminListView.collection.toJSON(),
                        menuActive : $("input[name=menuActive]:checked").val()
                    };

                GO.EventEmitter.trigger('common', 'layout:setOverlay', "");

                this.model.save(saveData,{
                    success : function(model, response) {
                        if(response.code == '200') {
                            $.goMessage(CommonLang["저장되었습니다."]);
                        }
                    },
                    error : function(model, response) {
                        if(response.message) $.goAlert(response.message);
                        else $.goMessage(CommonLang["실패했습니다."]);
                    },
                    complete : function(){
                        GO.EventEmitter.trigger('common', 'layout:clearOverlay');
                    }
                });
            },
        
            cancel : function(){
                var self = this;
                $.goCaution(CommonLang["취소"], CommonLang["변경한 내용을 취소합니다."], function(){
                    self.initialize();
                    self.render();
                    $.goMessage(CommonLang["취소되었습니다."]);
                }, CommonLang["확인"]);
            }
        }, {
            __instance__: null
        });
        
        return VacationConfig;
    });
}).call(this);
