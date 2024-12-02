define(function(require) {
    var Backbone = require('backbone');

    var DetailTpl = require('hgn!system/templates/sync/config_detail');

    var SyncQueryModel = require('system/models/sync/config_query_model');

    var JdbcTpl = require('hgn!system/templates/sync/config_jdbc');

    var adminLang = require('i18n!admin/nls/admin');
    var commonLang = require('i18n!nls/commons');

    var langs = {
    		'label_sync_header_title' : adminLang['동기화 설정'],
    		'label_sync_query_id' : adminLang['아이디'],
    		'label_sync_company_name' : adminLang['회사명'],
    		'label_choice' : adminLang['항목 선택'],
    		'label_sync_query_type' : adminLang['Query Type'],
    		'label_sync_key_columns' : adminLang['Key Columns'],
    		'label_sync_query' : adminLang['Query'],
    		'label_jdbclist_null_message' : adminLang['해당되는 회사의 JDBC TEMPLATE가 존재하지 않습니다.'],
    		'label_save' : commonLang['저장'],
    		'label_cancel' : commonLang['취소'],
    		'label_success_message' : adminLang['정상적으로 반영 되었습니다.'],
    		'label_fail_message' : commonLang['저장에 실패 하였습니다.'],
    		'label_error_message_company_name' : adminLang['회사명이 선택되지 않았습니다.'],
    		'label_error_message_jdbc_name' : adminLang['JDBC 설정명이 선택되지 않았습니다.'],
    		'label_error_message_query_type' : adminLang['QueryType가 선택되지 않았습니다.'],
    		'label_error_message_key_columns' : adminLang['Key Columns가 정의되지 않았습니다.'],
    		'label_error_message_query' : adminLang['Query가 정의되지 않았습니다.'],
    		'label_same_query_type_error_message' : adminLang['해당 회사에 동일한 QueryType이 존재합니다.']
    };

    var queryTypes = [
          { type : "USER" },
          { type : "DEPARTMENT" },
          { type : "DEPTMEMBER" },
          { type : "DUTY" },
          { type : "POSITION" },
          { type : "GRADE" },
          { type : "USERGROUP" },
          { type : "LINKUSERGROUP" }, 
          { type : "CONTACTGROUP" },
          { type : "CONTACT" }
     ];

    var JdbcList = Backbone.Collection.extend({
    	url : GO.contextRoot + 'ad/api/sync/query/jdbckey/',
    	getData : function(){
    		var data = this.toJSON();
    		if(_.isEmpty(data)){
    			data.unshift({id:'', configName:langs.label_choice});
    		}
    		return data;
    	}
    });

    var SyncConfigDetailView = Backbone.View.extend({

    	initialize : function() {
    		this.companies = this.options.companies;
    		if(_.isUndefined(this.options.model)) {
    			this.model = new SyncQueryModel();
    			this.isNew = true;
    		} else {
    			this.model = this.options.model;
    			this.isNew = false;
    		}

    	},

    	render : function(){
    		var self = this;
    		var data = this.model.toJSON();

    		var template = DetailTpl({
    			data : data,
    			lang : langs,
    			types : queryTypes,
    			isSelectedType : function(){
    				if(_.isEmpty(data.queryType)){
    					return;
    				}
					return this.type ==data.queryType;
				},
    			companies : this.companies,
    			isSelectedCompany : function(){
    				if(_.isEmpty(data.companyName)){
    					return;
    				}
					return this.name == data.companyName;
				}
    		});

    		this.popup = $.goPopup({
    			async:false,
		        header: langs.label_sync_header_title,
				width: 500,
				contents: template,
				buttons: [{
					btext : langs.label_save,
					btype : "confirm",
					autoclose : false,
					callback : function() {
						self._saveQuery();
					}
				}, {
					btext : langs.label_cancel
				}]
		    });

    		this.popup.find('#pop_company').on('change', self._refreshJdbcName);

    		this._refreshJdbcName(data);
    	},

    	_saveQuery : function() {
    		try {
    			this._validateQueryData();
    		} catch(err) {
    			$.goError(err);
    			return;
    		}
    		var self = this;

    		var $table = $('.sync_add_table');

    		this.model.save({
    			companyId : $table.find('#pop_company').val(),
    			jdbcId : $table.find('#pop_jdbc_name').val(),
    			keyColumns : $table.find('#pop_query_columns').val(),
    			queryType : $table.find('#pop_query_type').val(),
    			query : $table.find('#pop_query').val()
    			} ,{
				success : function(){
					$.goMessage(langs.label_success_message);
	    			$('.syncMainView').trigger('refresh');
	    			self.popup.close();
				},
				error : function(model, response) {
					if(response.responseJSON.message=="sameQueryType"){
						$.goError(langs.label_same_query_type_error_message);
					}else{
						$.goError(langs.label_fail_message);
					}
				}
			});
    	},

        _refreshJdbcName : function(model){
	    	var companyId = $('#pop_company').val();
    		this.jdbcList = new JdbcList();

    		if(!this.isNew){
    			this.jdbcList.fetch({
    	    		data : $.param({company_id : companyId}),
    				async : false
    			});
    		}

    		var jdbcId = this.isNew ? "" : model.jdbcId;

	    	$('#pop_jdbc_name').html(JdbcTpl({
	    		lang : langs,
	    		jdbcs : this.jdbcList.getData(),
	            isSelectedJdbc : function(){
					return this.id == jdbcId;
				},
	        }));
	    },

	    _validateQueryData : function() {
	       	 if(_.isEmpty($('#pop_company option:selected').val())) throw langs.label_error_message_company_name;
	       	 if(_.isEmpty($('#pop_jdbc_name option:selected').val())) throw langs.label_error_message_jdbc_name;
	       	 if(_.isEmpty($('#pop_query_type option:selected').val())) throw langs.label_error_message_query_type;
	       	 if(_.isEmpty($('#pop_query_columns').val())) throw langs.label_error_message_key_columns;
	       	 if(_.isEmpty($('#pop_query').val())) throw langs.label_error_message_query;
        }
    });

    return SyncConfigDetailView;
});