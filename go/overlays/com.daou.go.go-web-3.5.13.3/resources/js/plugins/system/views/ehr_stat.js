(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "hgn!system/templates/ehr_stat",
        "hgn!system/templates/list_empty",
        "i18n!nls/commons",
        "i18n!board/nls/board",
        "i18n!admin/nls/admin",
        "jquery.go-grid",
        "jquery.go-sdk",
        "GO.util",
    ], 

function(
    $, 
    Backbone,
    App,
    EhrStatTmpl,
    emptyTmpl,
    commonLang,
    boardLang,
    adminLang
) {
    var tmplVal = {
            label_siteName : adminLang['사이트명'],
            label_ehr_stat : adminLang["근태 통계"],
            label_execution : adminLang['실행'],
            label_all : commonLang['전체']
    };
    var ehrStatPage = Backbone.View.extend({

        events : {
            "click span.btn_execution" : "execute"
        },

        initialize : function() {
            this.dataTable = null;
        },

        render : function() {
            var self = this;
            
            $('.breadcrumb .path').html(adminLang['근태 통계']);
            this.$el.empty();
            
            this.$el.html(EhrStatTmpl({
                    lang : tmplVal
            }));

            self.setCompanyList();
            self.initDate(true);
            self.initDate(false);
            $('select.companyList').val(GO.session("companyId"));

        },

        execute : function(e){
         
            var self = this;
            var url = this.getUrl($(e.currentTarget).attr("id"));

            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            $.go(url, "", {
                qryType : 'GET',    
                contentType : 'application/json',
                timeout : 3000,
                responseFn : function(response) {
                    if(response.code == 200) {
                        $.goMessage(App.i18n(adminLang["{{arg1}} 실행 성공"],{"arg1": adminLang["근태 통계"]}));
                    }else {
                        $.goMessage(App.i18n(adminLang["{{arg1}} 실행 실패"],{"arg1": adminLang["근태 통계"]}));
                    }
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    
                },
                error: function(response){
                    if(response.statusText == "timeout"){
                        $.goMessage(App.i18n(adminLang["{{arg1}} 실행 성공"],{"arg1": adminLang["근태 통계"]}));
                    }else{
                        $.goMessage(App.i18n(adminLang["{{arg1}} 실행 실패"],{"arg1": adminLang["근태 통계"]}));
                    }
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);

                    
                }
            });
        },

        initDate : function(isAllCompany){
            var self = this;
            $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] ); 
            var startDate = isAllCompany ? this.$el.find("#allStartDate") : this.$el.find("#startDate");
            var endDate = isAllCompany ? this.$el.find("#allEndDate") : this.$el.find("#endDate");

            startDate.val(GO.util.now().format("YYYY-MM-DD"));
            endDate.val(GO.util.now().format("YYYY-MM-DD"));
           
            startDate.datepicker({ 
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                maxDate : endDate.val()
            });

            endDate.datepicker({
                dateFormat: "yy-mm-dd", 
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onClose : function(selectedDate){
                    startDate.datepicker('option', 'maxDate', selectedDate);
                }
            });
        },
        
        setCompanyList : function(){
            var url = GO.contextRoot + "ad/api/system/companies?offset=999";
            
            $.go(url, "", {
                qryType : 'GET',
                async : false,
                responseFn : function(response) {
                    $.each(response.data, function(i, item){
                        $('select.companyList').append('<option value="' +item.id+ '">' + item.name +'</option>');
                    });

                },
                error: function(response){
                    var responseData = JSON.parse(response.responseText);
                    $.goMessage(responseData.message);
                }
            });
        },
        
        getUrl : function(executId){
            
            var url = "";
            
            if(executId =='ehrStatWithCompany'){ //사이트별 통계 보정.
                var companyId = $("#companyList").val();
                var startDate = GO.util.toISO8601(GO.util.toMoment($("#startDate").val()));
                var endDate = GO.util.toISO8601(GO.util.toMoment($("#endDate").val()).add("days",1).subtract("seconds",1));
                url = GO.contextRoot + "ad/api/ehr/attnd/stat/all/batch-with-companyId"+"?"+$.param({startDate: startDate, endDate: endDate,companyId: companyId});
            }else{
                var startDate = GO.util.toISO8601(GO.util.toMoment($("#allStartDate").val()));
                var endDate = GO.util.toISO8601(GO.util.toMoment($("#allEndDate").val()).add("days",1).subtract("seconds",1));
                url = GO.contextRoot + "ad/api/ehr/attnd/stat/all/batch"+"?"+$.param({startDate: startDate, endDate: endDate});
            }
            
            return url;
            
        }
    },{
            __instance__: null
    });
    
        return ehrStatPage;
    });
}).call(this);