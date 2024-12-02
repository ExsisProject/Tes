(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
	    "hgn!admin/templates/company_info",
	    "i18n!admin/nls/admin",
		'admin/views/layout/admin_guide_button',
		'admin/models/layout/mail_admin_base'
],

	function(
		$, 
		Backbone,
		App,
		infoTmpl,
		adminLang,
		AdminGuideButton,
		MailAdminBase
	) {
		var tmplVal = {
			label_company_info: adminLang["사이트 정보"],
			label_base_info : adminLang["기본 정보"],
			label_company_name: adminLang["사이트명"],
			label_officer: adminLang["담당자"],
			label_domain_info: adminLang["도메인 정보"],
			label_domain_name: adminLang["도메인 명"],
			label_startday: adminLang["도입일자"],
			label_user_count: adminLang["총 계정수"],
			label_count: adminLang["개"],
			label_online: adminLang["활동 계정"],
			label_storage: adminLang["사용 용량"],
			label_package: adminLang["사용 패키지"],
			label_mail_stat : adminLang["메일 통계"],
			label_mail_24_hour : adminLang["최근 24시간"],
			label_mail_30_day : adminLang["최근 30일간"],
			label_stat_message : adminLang["메일통수"],
			label_stat_hour : adminLang["시간"],
			label_stat_normal : adminLang["정상메일"],
			label_stat_spam : adminLang["스팸메일"],
			label_stat_phishing : adminLang["피싱메일"],
			label_stat_virus : adminLang["바이러스메일"],
			label_total_account_quota : adminLang["총 할당 계정 용량"],
			label_total_company_quota : adminLang["공용 용량"],
			label_limitless : adminLang["무제한"],
			label_period:adminLang['사용 기간'],
			label_site_url:adminLang['사이트 URL'],
			label_site_id:adminLang['사이트 아이디'],
			label_caremanager:adminLang['고객케어관리자'],
			label_approval_title1:adminLang['전자결재제목1'],
			label_approval_title2:adminLang['전자결재제목2'],
			label_approval_contents:adminLang['전자결재내용'],
			label_approval_hashtags:adminLang['전자결재해쉬태그'],
			label_works_title:adminLang['Works제목'],
			label_works_contents:adminLang['Works내용'],
			label_works_hashtags:adminLang['Works해쉬태그'],
			label_manager_title:adminLang['관리기능제목'],
			label_manager_contents:adminLang['관리기능내용'],
			label_manager_hashtags:adminLang['관리기능해쉬태그'],
			label_linkplus:adminLang['링크플러스혜택확인하기']
			};
		
		var CompanyInfo = App.BaseView.extend({
			el : '#layoutContent',
			initialize : function() {
				this.adminBase = new MailAdminBase();
				var model = new Backbone.Model();
				model.url = "/ad/api/company";
				model.fetch({async : false});
				this.model = model.toJSON();
				
				document.title = "SiteAdmin " + this.model.name;
				
				var baseCompanyConfigModel = new Backbone.Model();
                baseCompanyConfigModel.url = "/ad/api/quotaconfig";
                baseCompanyConfigModel.fetch({async : false});
                this.baseCompanyConfigModel = baseCompanyConfigModel.toJSON();
			},
			render : function() {
				var dateformat = function(){
					return GO.util.basicDate(this.model.createdAt);
				};
				
				if(this.baseCompanyConfigModel.totalAccountQuota == "0"){
					this.baseCompanyConfigModel.totalAccountQuota = adminLang["무제한"];
				}else{
					this.baseCompanyConfigModel.totalAccountQuota = this.makeQuotaTmpl(this.baseCompanyConfigModel.totalAccountQuota, this.model.totalAccountQuota);
				}
				
				if(this.baseCompanyConfigModel.companyQuota == "0"){
					this.baseCompanyConfigModel.companyQuota = adminLang["무제한"];
				}else{
					this.baseCompanyConfigModel.companyQuota = this.makeQuotaTmpl(this.baseCompanyConfigModel.companyQuota, this.model.companyQuota);
				}
				
				this.$el.empty();
				var tmpl = infoTmpl({
					lang : tmplVal,
					model : this.model,
					dateformat : dateformat,
					baseCompanyConfig : this.baseCompanyConfigModel,
					usedAccount : function(){
						return this.model.usedCount -  this.model.stopUserCount;
					},
					companyPeriod: function(){
						if ( this.baseCompanyConfig.restrictCompanyPeriod == true ){
							var d_day = App.util.getDdayDiff(this.baseCompanyConfig.restrictCompanyPeriodEnd);
							var ddayformat="";
                     	   	if(d_day <= 7 && d_day >= 0 ){
                     		   ddayformat = " <span style='color: red;'>( "+adminLang["서비스 만료일"]+" D-"+d_day+")</span>";
                     	   	} else if(d_day < 0) {
                     	   	ddayformat = " <span style='color: red;'>( "+adminLang["서비스 만료"]+" )</span>";
                     	   		
                     	   	}
							return this.baseCompanyConfig.restrictCompanyPeriodStart +" ~ "+this.baseCompanyConfig.restrictCompanyPeriodEnd+ddayformat;
						} else {
							return adminLang["무제한"];
						}
					}
					
				});	
				this.$el.html(tmpl);
				this.renderMailStatic();
				this.renderGuide();
				return this.$el;
			},
			renderGuide:function(){
				this.adminGuideButton= new AdminGuideButton();
				this.adminGuideButton.render();

				$('#admin_guide_button').empty();
				$('#admin_guide_button').append(this.adminGuideButton.$el);
			},
			makeQuotaTmpl :function(totalQuota, usedQuota){
				var usedRate = (parseInt(usedQuota)/parseInt(totalQuota)*100).toFixed(0),
					changedUsedQuota = App.util.getHumanizedFileSize(usedQuota),
	 	       		changedTotalQuota = App.util.getHumanizedFileSize(totalQuota);
				
				return changedUsedQuota + " / " + changedTotalQuota + " (" + usedRate + "%)";	
			},
			renderMailStatic : function(){
				var graphType = this.adminBase.getGraphType();

				$.getJSON("/summaryMonitor.action",{"act" : "json", "graphType" :graphType}, function(response){
                    $("#mail24Hour").attr("src", response.data[0].imgPath);
                    $("#mail30Day").attr("src", response.data[1].imgPath);
			    });
			}
		},{
			__instance__: null
		});
		
		return CompanyInfo;
	});
}).call(this);