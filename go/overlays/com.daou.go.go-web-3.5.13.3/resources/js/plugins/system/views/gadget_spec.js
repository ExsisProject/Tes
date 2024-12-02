(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "system/models/web_revision",
        "hgn!system/templates/gadget_spec",
        "i18n!dashboard/nls/dashboard",
        "i18n!admin/nls/admin",
        "jquery.go-validation",
        "jquery.go-popup",
        "jquery.go-sdk"
    ], 
    
    function(
        $, 
        Backbone,
        App,
        WebRevisionModel,
        template, 
        dashboardLang,
        adminLang
    ) {
        
        var lang = {
            title: dashboardLang["명세서 파일 동기화"],
            filesync: dashboardLang["동기화 시작"],
            sucess: dashboardLang["동기화에 성공했습니다."],
            fail: dashboardLang["동기화에 실패했습니다."]
        };
        
        var GadgetSpecSyncConfig = App.BaseView.extend({

            events : {
                "click span#btn_ok" : "startFileSync"
            },

            initialize : function() {
            },
            
            render : function() {
                $('.breadcrumb .path').html(adminLang["가젯 명세서 관리"]);

                this.$el.empty().html(template({ 
                    lang : lang
                }));
                return this.$el;
            },
            
            startFileSync : function() {
                $.ajax({
                    url: GO.contextRoot + 'ad/api/gadgetspec/private/filesync'
                }).done(function(data, status, xhr) {
                    $.goMessage(lang['sucess']);
                }).fail(function(xhr, status, error) {
                    $.goMessage(lang['fail']);
                });
            }
        });
        
        return GadgetSpecSyncConfig;
    });
    
}).call(this);