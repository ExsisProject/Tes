define(function(require) {
    var Backbone = require('backbone');

    var StartTpl = require('hgn!system/templates/sync/config_job');

    var adminLang = require('i18n!admin/nls/admin');
    var commonLang = require('i18n!nls/commons');

    var langs = {
    		'label_company_name' : adminLang['회사명'],
    		'label_company_id' : adminLang['회사 ID'],
    		'label_sync_start_title' : adminLang['동기화 시작'],
    		'label_sync_start_question' : adminLang['동기화를 시작하시겠습니까?'],
    		'label_apply_message' : adminLang['적용되었습니다.'],
    		'label_sync_company_select' : adminLang['회사 선택'],
    		'label_all' : commonLang['전체'],
    		'label_sync_start_button' : commonLang['시작']
    };

    var SyncStartView = Backbone.View.extend({

    	events : {
    		'click #sync_start_btn' : '_syncStart'
    	},

    	initialize : function(){
    		this.companies = this.options.companies;
    	},

    	render : function() {
    		var self = this;
    		this.$el.html(StartTpl({
    			lang : langs,
    			companies : this.companies
    		}));
    	},

    	_syncStart : function(){
    		var $company = $('#startCompanies option:selected');
    		var companyName = $company.text();
        	var companyId = $company.val();

        	var url = GO.contextRoot + 'ad/api/legacy/sync';
        	if(companyId != 'ALL'){
        		url = url+'?company_id='+companyId;
        	}

        	$.goConfirm(langs.label_company_id+' : '+companyId+' / '+langs.label_company_name+' : '+companyName, langs.label_sync_start_question, confirmCallback);

        	function confirmCallback() {
                $.ajax({
                    contentType : 'application/json',
                    method : 'PUT',
                    url : url,
                    success : function() {
                    	$.goMessage(langs.label_apply_message);
                    }
                });
            }
    	}
    });

    return SyncStartView;
});