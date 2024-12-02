(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        
        "hgn!admin/templates/vacation_config",

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
        
        ConfigTmpl,

        CommonLang,
        AdminLang
    ) {
        
        var VacationConfig,
            tmplVal = {
                label_dataReset : AdminLang["데이터 초기화"],
                label_vacationDataReset : AdminLang["연차 데이터 초기화"],
                label_vacationDataDelete : AdminLang["연차현황 데이터 삭제"],
                label_resetAlert : AdminLang["연차현황 초기화 알림"],
                label_resetCaution : AdminLang["연차현황 초기화 경고"],
                label_notification : AdminLang["반드시 확인해주시기 바랍니다"],
                label_resetCaution1 : AdminLang["연차설정 초기화문구1"],
                label_resetCaution2 : AdminLang["연차설정 초기화문구2"],
                label_resetCaution3 : AdminLang["연차설정 초기화문구3"],
            };
        
        VacationConfig = App.BaseView.extend({
            
            el : '#layoutContent',

            events : {
                "click #reset_vacation" : "resetVacation",
            },
            
            initialize : function(){
                this.$el.off();
            },

            render : function() {
                this.$el.empty().html(ConfigTmpl({ lang : tmplVal}));
                this.$el.find("#reset_alert").html(tmplVal["label_resetCaution"]);
                return this.$el;
            },
            
            resetVacation : function() {
            	$.goConfirm(tmplVal["label_resetAlert"], "", _.bind(function() {
            		$.ajax({
	            		 url : GO.contextRoot + "ad/api/ehr/vacation/reset",
	            		 type : 'PUT',
	            		 contentType : 'application/json',
	            		 success : function(response) {
	            			 $.goSlideMessage(CommonLang["초기화되었습니다."]);
	            		 },
	            		 error : function(response) {
	            			 $.goSlideMessage(CommonLang["실패했습니다."], 'caution');
	            		 }
	            	 });
            	}, this));
            }

        }, {
            __instance__: null
        });
        
        return VacationConfig;
    });
}).call(this);
