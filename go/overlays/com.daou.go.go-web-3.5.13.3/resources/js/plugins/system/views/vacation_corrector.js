(function() {
    define([
            "jquery",
            "backbone",
        
            "hgn!system/templates/vacation_corrector",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
        ],
        
        function(
            $,
            Backbone,
            
            template,
            commonLang,
            adminLang,
        ) {
            var lang = {
                title: adminLang['근태 이력 관리'],
                delete_vacation_history: adminLang['근태 이력 삭제'],
                delete_vacation_history_desc: adminLang['근태 이력 삭제 안내문'],
            };
            
            var VacationCorrector = Backbone.View.extend({
                
                events : {
                    "click #deleteVacationHistory" : "deleteVacationHistory"
                },
                
                initialize : function() {
                },
                
                render : function() {
                    $('.breadcrumb .path').html(lang.title);
                    var tmpl = template({
                        lang : lang,
                    });
                    
                    this.$el.html(tmpl);
                    return this.$el;
                },
    
                deleteVacationHistory: function() {
                    var $vacationHistory = this.$el.find('#vacationHistoryId');
                    var $company = this.$el.find('#companyId');
                    var $user = this.$el.find('#userId');
                    
                    var historyId = $vacationHistory.val();
                    var companyId = $company.val();
                    var userId = $user.val();
    
                    if (!(historyId && companyId && userId)) {
                        $.goMessage(commonLang["모든 항목을 입력하세요."]);
                        return;
                    }
                    
                    $vacationHistory.val('');
                    $company.val('');
                    $user.val('');
                    
                    $.ajax({
                        url: GO.contextRoot + "ad/api/system/vacation/history",
                        type: 'DELETE',
                        data: JSON.stringify({
                            companyId: companyId,
                            userId: userId,
                            historyId: historyId
                        }),
                        contentType: 'application/json',
                        success: function () {
                            $.goMessage(commonLang["성공했습니다."]);
                        }, error: function () {
                            $.goError(commonLang["실패했습니다."]);
                        }
                    });
                },
            },{
                __instance__: null
            });
            return VacationCorrector;
        });
    
}).call(this);
