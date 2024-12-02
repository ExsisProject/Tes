define(function(require){
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");
    var SiteConfigModel = require("system/models/siteConfigModel");
    var CompanyQuotaManageTmpl = require("hgn!admin/templates/cloud/company_quota_manage");
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");

    require("jquery.go-orgslide");
    require("jquery.go-popup");
    require("jquery.go-sdk");
    require("jquery.go-validation");

    var lang = {
        label_user_setting : adminLang["사용자 설정"],
        label_max_user_count : adminLang["최대 사용자 수"],
        label_online_user_count : adminLang["현재 사용자 수"],
        label_user_count : commonLang["명"],
        label_quota_setting : adminLang["용량 설정"],
        label_available_quota : adminLang["총 용량"],
        label_total_account_quota : adminLang["총 할당 계정 용량"],
        label_total_company_quota : adminLang["공용 용량"],
        label_send_warning : adminLang["공용 용량 초과 경고 발송"],
        label_warning_rate : adminLang["공용 용량 초과 경고 비율"],
        label_restriction : adminLang["공용 용량 초과시 제재"],
        label_help_account_quota : adminLang["사이트 할당 계정 용량 툴팁"],
        label_help_company_quota : adminLang["사이트 공용 용량 툴팁"],
        label_help_restrict_quota : adminLang["공용 용량 초과시 제재 도움말"],
        label_max_user_help : adminLang["최대 사용자 수 설명"],
        label_use : commonLang["사용"],
        label_not_use : adminLang["사용 안함"],
        label_save : commonLang["저장"],
        label_cancel : commonLang["취소"],
        label_quota_service_desc : adminLang["용량추가 구입은 현재 준비 중이니 따로 문의 바랍니다"],
        label_company_quota_usage : adminLang["공용 용량 사용 현황"],
        label_used_quota : adminLang["현재 사용량"],
        label_contact : commonLang["주소록"],
        label_works : commonLang["Works"],
        label_post : adminLang["게시판/커뮤니티"],
        label_approval : commonLang["전자결재"],
        label_report : commonLang["보고"],
        label_task : commonLang["업무"],
        label_webfolder : commonLang["자료실"],
        label_survey : commonLang["설문"],
        label_todo : commonLang["ToDO+"],
        label_sms : adminLang["문자발송"],
        label_docs : commonLang["문서관리"],
        label_chat : adminLang["메신저/앱 대화"],
        label_comment : commonLang["댓글"],
        label_etc : commonLang["기타"],
        label_help_etc : adminLang["기타 용량 툴팁"],
        label_sync : adminLang["동기화"],
        label_prev_sync_caution : adminLang["현재 공용 용량 사용현황 확인을 위해서는 동기화를 먼저 수행해주십시오."],
    	label_usage_desc : adminLang["사용량 정보는 자정 기준으로 자동 동기화 되며, 용량 관리 동기화 수행시 현재시점으로 즉시 동기화 됩니다."]
    };

    var CompanyModel = Backbone.Model.extend({
        url: function() {
            var url = '/ad/api/company';
            return url;
        }
    });

    var CompanyQuotaModel = Backbone.Model.extend({
        url: function() {
            var url = '/ad/api/quotaconfig';
            return url;
        }
    });

    var CompanyAppsQuotaModel = Backbone.Model.extend({
        url: function() {
            var url = '/ad/api/company/attach/usage';
            return url;
        }
    });

    var SiteConfigModel = Backbone.Model.extend({
        url: function() {
            var url = '/ad/api/siteconfig';
            return url;
        }
    });

    var SyncQuotaModel= Backbone.Model.extend({
        url: function() {
            var url = '/ad/api/company/quota/sync';
            return url;
        }
    });
    var QUOTA_HELPER = {
        GB : 1024 * 1024 * 1024,
        MB : 1024 * 1024,
        QUOTA_APPS : ['contact', 'works', 'post', 'document', 'report', 'survey', 'todo', 'task', 'sms', 'webfolder', 'docs', 'chat', 'comment', 'all'],
        byteToMega: function(size) {
            return (parseInt(size) / this.MB).toFixed(1);
        },

        byteToGiga: function(size) {
            return parseInt(size) / this.GB;
        },

        gigaToByte: function(size) {
            return size * this.GB;
        },
    };

    var CompanyQuotaManage = Backbone.View.extend({
        el : '#layoutContent',

        events : {
            "click span#saveQuota" : "save",
            "click span#cancelQuota" : "cancel",
            "click input:radio" : "toggleRadio",
            "click span#btn_sync" : "sync",
            "keyup input#totalAccountQuota" : "_validateNumber",
            "keyup input#companyQuota" : "_validateNumber",
        },

        initialize : function(){
        	this.$el.off();
        },

        render : function() {
            this.$el.html(CompanyQuotaManageTmpl({
                lang : lang,
                isNotSite : true,
            }));
        },

        renderQuotaArea : function() {
            var self = this;
            this.$el.html(CompanyQuotaManageTmpl({
                lang : lang,
                isNotSite : !GO.session().serviceAdminMode,
                companyModel : this.model.toJSON(),
                companyQuotaModel : this.companyQuotaModel.toJSON(),
                companyAppsQuotaModel : self.convertAppsUsage(),
                hidePercent : function(){
                    if(self.companyQuotaModel.get("companyQuota") == 0){
                        return false;
                    }
                    return true;
                },
                usagePercent : Math.round(this.companyAppsQuotaModel.get("all")/this.companyQuotaModel.get("companyQuota")*100),
                appConfig : self.convertAppConfig(),
                availableQouta : function(){
                    return QUOTA_HELPER.byteToGiga(self.availableQuota);
                },
                allAccountQuotaGB : function(){
                    return QUOTA_HELPER.byteToGiga(this.companyQuotaModel.totalAccountQuota);
                },
                allCompanyQuotaGB : function() {
                    return QUOTA_HELPER.byteToGiga(this.companyQuotaModel.companyQuota);
                }
            }));

            this.toggleRadio();
            var companyQuotaWarningRate = this.companyQuotaModel.get("companyQuotaWarningRate");
            this.$el.find('#companyQuotaWarningRate').attr('value', companyQuotaWarningRate == 0 ? 90 : companyQuotaWarningRate);

            this.$el.find('#quota_content').css('display', 'block');
            this.$el.find('.desc_caution').css('display', 'none');

            return this.$el;
        },

        sync : function() {
        	GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
        	var self = this;

            this.model = new CompanyModel();
            this.model.fetch({async : false});

            this.companyQuotaModel = new CompanyQuotaModel();
            this.companyQuotaModel.fetch({async : false});
            this.availableQuota = this.companyQuotaModel.get("totalAccountQuota") + this.companyQuotaModel.get("companyQuota");

            this.companyAppsQuotaModel = new CompanyAppsQuotaModel();
            this.companyAppsQuotaModel.fetch({async : false});

            this.siteConfigModel = new SiteConfigModel();
            this.siteConfigModel.fetch({async : false});

            this.SyncQuotaModel = new SyncQuotaModel();
            this.SyncQuotaModel.save(null, {
                async : false,
                success: function(){
                    $.goMessage(adminLang["동기화에 성공하였습니다."]);
                    self.renderQuotaArea();
                },
                error: function(){
                    $.goError(adminLang["동기화에 실패하였습니다. 잠시 후 다시 시도해주세요."]);
                }
            });
            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
        },

        convertAppsUsage : function() {
            var appsQuota = {};
            var etcMB = 0;
            $.each(this.companyAppsQuotaModel.toJSON(), function(app, size){
                if($.inArray(app, QUOTA_HELPER.QUOTA_APPS) >= 0){
                    appsQuota[app + 'MB'] = QUOTA_HELPER.byteToMega(size);
                }else{
                    etcMB = etcMB + size;
                }
            });
            appsQuota['etcMB'] = QUOTA_HELPER.byteToMega(etcMB);
            return appsQuota;
        },

        convertAppConfig : function() {
            var appConfig = {};
            $.each(this.siteConfigModel.toJSON(), function(app, service){
                if(app.indexOf('Service')){
                    appConfig[app] = service == "on" ? true : false;
                }
            });
            appConfig['postService'] = (this.siteConfigModel.get('boardService') == "on"
                                || this.siteConfigModel.get('communityService') == "on") ? true : false;
            return appConfig;
        },

        validation : function(companyQuotaModel) {
            $('.go_alert').html("");
            var vaild = true;
            var msg = "";
            var inputValueTotalAccountQuota = QUOTA_HELPER.byteToGiga(companyQuotaModel.get("totalAccountQuota"));
            var inputValueCompanyQuota = QUOTA_HELPER.byteToGiga(companyQuotaModel.get("companyQuota"));

            //총 할당 계정 용량
            if(companyQuotaModel.get("totalAccountQuota") == 0){
            	vaild = false;
                this.showValidateMsg("totalAccountQuota", App.i18n(adminLang["{{quota}}은 0{{unit}}로 설정할 수 없습니다."],{"quota": adminLang["총 할당 계정 용량"], "unit" : "GB"}));
                return false;
            }
            if(!$.goValidation.isNumber(companyQuotaModel.get("totalAccountQuota")) || !$.goValidation.isNumber(inputValueTotalAccountQuota)){
                vaild = false;
                this.showValidateMsg("totalAccountQuota", App.i18n(adminLang["{{quota}}에 숫자를 입력해주세요."],{"quota": adminLang["총 할당 계정 용량"]}));
                return false;
            }
            if(companyQuotaModel.get("totalAccountQuota") < this.model.get("totalAccountQuota")){
                vaild = false;
                this.showValidateMsg("totalAccountQuota", App.i18n(adminLang["현재 사용량은 {{arg1}}입니다. {{arg1}}이상으로 설정해주세요."],{"arg1": Math.ceil(QUOTA_HELPER.byteToGiga(this.model.get("totalAccountQuota")))}));
                return false;
            }
            if (inputValueTotalAccountQuota < 2 || inputValueTotalAccountQuota > 102400) {
                vaild = false;
                this.showValidateMsg("totalAccountQuota", App.i18n(adminLang["{{quota}}의 설정 가능 범위는 {{arg1}} ~ {{arg2}}까지입니다."], {
                    "quota": adminLang["총 할당 계정 용량"],
                    "arg1": 2,
                    "arg2": 102400
                }));
                return false;
            }

            //공용 용량
            if(companyQuotaModel.get("companyQuota") == 0){
            	vaild = false;
                this.showValidateMsg("companyQuota", App.i18n(adminLang["{{quota}}은 0{{unit}}로 설정할 수 없습니다."],{"quota": adminLang["공용 용량"], "unit" : "GB"}));
                return false;
            }
            if(!$.goValidation.isNumber(companyQuotaModel.get("companyQuota")) || !$.goValidation.isNumber(inputValueCompanyQuota)){
                vaild = false;
                this.showValidateMsg("companyQuota", App.i18n(adminLang["{{quota}}에 숫자를 입력해주세요."],{"quota": adminLang["공용 용량"]}));
                return false;
            }
            if(companyQuotaModel.get("companyQuota") < this.model.get("companyQuota")){
                vaild = false;
                this.showValidateMsg("companyQuota", App.i18n(adminLang["현재 사용량은 {{arg1}}입니다. {{arg1}}이상으로 설정해주세요."],{"arg1": Math.ceil(QUOTA_HELPER.byteToGiga(this.model.get("companyQuota")))}));
                return false;
            }
            if (inputValueCompanyQuota < 1 || inputValueCompanyQuota > 102400) {
                vaild = false;
                this.showValidateMsg("companyQuota", App.i18n(adminLang["{{quota}}의 설정 가능 범위는 {{arg1}} ~ {{arg2}}까지입니다."], {
                    "quota": adminLang["공용 용량"],
                    "arg1": 1,
                    "arg2": 102400
                }));
                return false;
            }

            //총 할당 계정 용량 + 공용 용량
            if((companyQuotaModel.get("totalAccountQuota") + companyQuotaModel.get("companyQuota")) != this.availableQuota){
                vaild = false;
                this.showValidateMsg("totalAccountQuota", App.i18n(adminLang["총 용량(총 할당 계정 용량 + 공용 용량)은 {{arg1}}입니다."],{"arg1": QUOTA_HELPER.byteToGiga(this.availableQuota)}));
                return;
            }

            //공용 용량 초과 경고 비율
            if(!$.goValidation.isNumber(companyQuotaModel.get("companyQuotaWarningRate"))){
                vaild = false;
                this.showValidateMsg("companyQuotaWarningRate", App.i18n(adminLang["{{quota}}에 숫자를 입력해주세요."],{"quota": adminLang["공용 용량 초과 경고 비율"]}));
                return false;
            }

            if(companyQuotaModel.get("sendWarningExceedCompanyQuota") == "true" && companyQuotaModel.get("companyQuotaWarningRate") < 1 || companyQuotaModel.get("companyQuotaWarningRate") > 99){
                vaild = false;
                this.showValidateMsg("companyQuotaWarningRate", App.i18n(adminLang["{{quota}}의 설정 가능 범위는 {{arg1}} ~ {{arg2}}까지입니다."],{"quota": adminLang["공용 용량 초과 경고 비율"], "arg1": 1, "arg2": 99}));
                return false;
            }

            return vaild;
        },

        showValidateMsg : function(targetId, msg) {
            $('#' + targetId).focus();
            $('#' + targetId + 'Validate').html(msg);
        },

        save : function(){
            var self = this;
            var form = this.$el.find('form[name=formCompanyQuota]');

            $.each(form.serializeArray(), function(i, item) {
                item.value = self._inputValueConverter(item.name, item.value);
                self.companyQuotaModel.set(item.name, item.value, {silent: true});
            });

            if (!self.validation(self.companyQuotaModel)) {
                return;
            }

            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");

            self.companyQuotaModel.save({},{
                  type : 'PUT',
                  success : function(model, response) {
                      if(response.code == '200') {
                          $.goMessage(commonLang["저장되었습니다."]);
                      }
                  },
                  error : function(model, response) {
                      if(response.message) $.goAlert(response.message);
                      else $.goMessage(commonLang["실패했습니다."]);
                  },
                  complete : function(){
                      self.render();
                      GO.EventEmitter.trigger('common', 'layout:clearOverlay');
                  }

              });
        },

        toggleRadio : function() {
            if($('#sendWarningExceedCompanyQuota_on').is(":checked")){
                $('#companyQuotaWarningRate').attr('disabled', false);
            }else{
                $('#companyQuotaWarningRate').attr('disabled', true);
            }
        },

        cancel : function(){
            this.render();
        },

        _inputValueConverter : function (name, value) {
            if(name == "totalAccountQuota" || name == "companyQuota"){
                return QUOTA_HELPER.gigaToByte(value);
            }
            return value;
        },

        _validateNumber: function(e) {
            $('.go_alert').html('');
            var $target = $(e.currentTarget);
            if(!$.goValidation.isNumber($target.val())) {
                this.showValidateMsg($target.attr('id') ,App.i18n(adminLang["{{quota}}에 숫자를 입력해주세요."],{"quota": adminLang["총 할당 계정 용량"]}));
            }
        }

    });
    return CompanyQuotaManage;
})
