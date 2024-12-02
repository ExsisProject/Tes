(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "hgn!system/templates/google_analytics",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "jquery.go-grid",
        "jquery.go-sdk",
        "GO.util",
    ], 

function(
    $, 
    Backbone,
    App,
    googleAnalyticsTmpl,
    commonLang,
    adminLang
) {
    var tmplVal = {
            'label_google_analytics' : adminLang["Google Analytics 관리"],
            'label_title' : adminLang["Google Analytics 설정"],
            'label_googleanalytics_company' : adminLang['회사명'],
            'label_googleanalytics_configvalue' : adminLang['Google Key 값'],
            'label_ok': commonLang['저장'],
            'label_cancel': commonLang['취소']
    };
    var googleAnalytics = Backbone.View.extend({

        events : {
            "click span#btn_ok" : "googleAnalyticsSave",
            "click span#btn_cancel" : "googleAnalyticsCancel",
            "click span.btn_box[data-btntype='changeform']" : "googleAnalyticsChange",
            "click span.edit_data" : "googleAnalyticsChange"
        },

        initialize : function() {
            this.model = null;
        },

        googleAnalyticsChange : function(e){
			var targetEl = $(e.currentTarget).parent();
			if(targetEl && targetEl.attr('data-formname')) {
				$(e.currentTarget).hide();
				targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '" class="input w_mini" value="', targetEl.attr('data-value'), '" />'].join(''))
					.find('input').focusin();
			}
		},
        render : function() {
            var self = this;
            var deferred = $.Deferred();
                       
            $.when(this.getGoogleAnalytics()).then(function(){
                $('.breadcrumb .path').html(adminLang["Google Analytics 관리"]);

                var googleAnalyticsData = self.model;
                self.$el.html(googleAnalyticsTmpl({
                        lang : tmplVal,
                        googleAnalyticsData : googleAnalyticsData
                }));
                deferred.resolveWith(self, [self]);
            });
            
             return deferred;
        },
        
		getGoogleAnalytics : function(){
			var self = this;
			var deferred = $.Deferred();
			
			var url = GO.contextRoot + "ad/api/system/googleconfig";
			$.go(url,'' , {
                qryType : 'GET',                
                responseFn : function(response) {
                    if(response.code == 200){
                        self.model = response.data;
                        deferred.resolve();
                    }
                },
                error: function(response){
                }
            });
            return deferred;
		},
		googleAnalyticsSave : function(){
			var self = this;
			var deferred = $.Deferred();
			var companyGoogleAnalyticsList = [];
            
            var url = GO.contextRoot + "ad/api/system/googleconfig";
			
			$.each($('[data-formname="googleAnalytics"]'), function(k,v) {
				var companyGoogleAnalyticsValue = $(v).find('input').val();
				if(companyGoogleAnalyticsValue == undefined){
					companyGoogleAnalyticsValue = $(v).attr('data-value');
				}
				var companyGoogleAnalytics = {companyId: parseInt($(v).attr('data-id')), companyName: $(v).attr('data-name'), configValue: companyGoogleAnalyticsValue};
				companyGoogleAnalyticsList.push(companyGoogleAnalytics);
			});	
			
			$.go(url, JSON.stringify(companyGoogleAnalyticsList) , {
                qryType : 'POST',    
                contentType : 'application/json',
                responseFn : function(response) {
                    if(response.code == 200){
                        $.goMessage(commonLang["저장되었습니다."]);
                        self.render();
                    }
                },
                error: function(response){
                }
            });
            return deferred;
        },
        googleAnalyticsCancel : function() {
        	var self = this;
        	$.goCaution(tmplVal['label_cancel'], commonLang["변경한 내용을 취소합니다"], function(){
        		self.render();
        		$.goMessage(commonLang["취소되었습니다."]);
        	});
        }
    },{
            __instance__: null
    });
    
        return googleAnalytics;
    });
}).call(this);