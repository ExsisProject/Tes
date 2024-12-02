
define(function(require) {
    var Backbone = require('backbone');

    var detailTPL = require('hgn!system/templates/database/db_detail');
    var adminLang = require('i18n!admin/nls/admin');
    var commonLang = require('i18n!nls/commons');

    var langs = {
        'label_db_header_config' : commonLang['접속설정'],
        'label_db_company_name' : adminLang['회사명'],
        'label_db_config_name' : adminLang['설정명'],
        'label_db_key' : adminLang['Key'],
        'label_db_vender' : adminLang['Vender'],
        'label_db_host' : adminLang['Host'],
        'label_db_protocol' : adminLang['Protocol'],
        'label_db_driver' : adminLang['Driver'],
        'label_db_database' : adminLang['Database'],
        'label_db_user_name' : adminLang['사용자명'],
        'label_db_password' : adminLang['비밀번호'],
        'label_db_password_change' : adminLang['비밀번호 변경'],
        'label_db_port' : adminLang['포트'],
        'label_db_company' : adminLang['회사'],
        'label_choice' : adminLang['항목 선택'],
        'label_db_description' : adminLang['설명'],
        'label_db_maxpoolsize' : adminLang['MaxPoolSize'],
        'label_db_minpoolsize' : adminLang['MinPoolSize'],
        'label_db_initpoolsize' : adminLang['InitPoolSize'],
        'label_db_checkout_timeout' : adminLang['CheckoutTimeout'],
        'label_remarks' : adminLang['비고'],
        'label_test' : adminLang['테스트'],
        'label_save' : commonLang['저장'],
        'label_close' : commonLang['닫기'],
        'label_db_save' : adminLang['DB 설정 저장'],
        'label_db_save_message' : adminLang['해당 접속설정을 저장하시겠습니까?'],
        'label_save_success_message' : commonLang['저장되었습니다.'],
        'label_save_error_message' : commonLang['저장에 실패 하였습니다.']
    }

    var Companies = Backbone.Collection.extend({

        url : GO.contextRoot + "ad/api/system/companies"
    });

    var Venders = Backbone.Collection.extend({
        url : GO.contextRoot + "ad/api/system/dbconfig/venders"
    });

    var ConfigModel = Backbone.Model.extend({
        url : GO.contextRoot + "ad/api/system/dbconfig"
    });


    var DBDetailView = Backbone.View.extend({
        el : '.detail_container',

        events : {
            'click input:radio' : '_changeVendor',
            'submit #dataForm' : '_save',
            'click #changePwd' : '_changePassword',
            'click #cancel_btn' : '_close',
            'change #key' : '_checkDuplicated'
        },

        initialize : function() {
            this.vendors = new Venders();
            this.companies = new Companies();
        },

        renderInsert : function() {
            var self = this;
            this.model = new ConfigModel();

            this.fetchData(callback);

            function callback() {
                self.$el.empty();
                self.$el.html(detailTPL({
                    lang : langs,
                    venders : self.vendors.toJSON(),
                    companies : self.companies.toJSON(),
                    isNew : true
                }));
            }
        },

        fetchData : function(callback) {
            $.when(
                this.vendors.fetch(),
                this.companies.fetch()
            ).then(callback);
        },

        renderModify : function(item) {
            var self = this;
            this.model = item;
            this.fetchData(callback);

            function callback() {
                self.$el.html(detailTPL({
                    lang : langs,
                    venders : self.vendors.toJSON(),
                    companies : self.companies.toJSON(),
                    data : item.toJSON(),
                    isNew : false
                }));

                var r_list = document.querySelectorAll('input[name=vendor]')
                Array.prototype.slice.call(r_list).map(function(radio) {
                    if(radio.value == String(item.toJSON().vendor).toLowerCase()) {
                        radio.checked = true;
                        radio.click();
                    }
                });

                document.getElementById('configCompany').value = item.toJSON().companyId;
            }
        },

        _checkDuplicated : function(evt) {
            this.trigger('isDulicatedKey', [$(evt.currentTarget).val(), evt]);
        },

        _changePassword : function(evt) {
            var pwdMakup = '<input class="wfix_max" type="password" name="password" value="" required/>',
                target = $(evt.currentTarget).closest('td');

            target.html(pwdMakup);
        },

        _changeVendor : function(evt) {
        	var self = this,
        		radioTag = document.querySelectorAll('input[name=vendor]:checked'),
        		evt = $(evt.currentTarget).closest('span'),
        		previousDBInfo = {
	        		"dbType" : $(radioTag).val(),
	    			"protocol" : $(radioTag).parent().data('protocol'),
	    			"driver" : $(radioTag).parent().data('driver')
    			},
        		savedDBInfo = {
        			"dbType" : '',
        			"protocol" : '',
        			"driver" : ''
        		};
        	
        	if (this.model.attributes.vendor != undefined) {
        		savedDBInfo = {
        			"dbType" : this.model.attributes.vendor.toLowerCase(),
        			"protocol" : document.querySelector('input[name=protocol]').value,
        			"driver" : document.querySelector('input[name=driver]').value
        		};
         	}
        	
            document.querySelector('input[name=protocol]').value = evt.data('protocol');
            document.querySelector('input[name=driver]').value = evt.data('driver');
            if (previousDBInfo.dbType != savedDBInfo.dbType) {
            	document.querySelector('input[name=port]').value = evt.data('port');            	
            }
        },

        _save : function(evt) {
            evt.preventDefault();
            var self = this;
            $.goConfirm(langs.label_db_save, langs.label_db_save_message, confirmCallback);



            function confirmCallback() {
                var request = self.model.save(GO.util.serializeForm($('#dataForm')));
                request.done(function(result) {
                    $.goMessage(langs.label_save_success_message);
                    self.trigger('refresh_list');
                    self.$el.empty();
                });

                request.fail(function(jqXHR, textStatus) {
                    $.goAlert(langs.label_save_error_message)
                    console.log(textStatus);
                })
            }

            return false;

        },

        _close : function() {
            document.querySelector('.detail_container').innerHTML = '';
        }
    });

    return DBDetailView;
});
