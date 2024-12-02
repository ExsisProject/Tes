define(function(require) {
    var Backbone = require('backbone');

    var SyncDetailView = require('system/views/sync/config_detail');
    var SyncItemView = require('system/views/sync/config_item');

    var SyncQueryModel = require('system/models/sync/config_query_model');

    var ListTpl = require('hgn!system/templates/sync/config_list');

    var adminLang = require('i18n!admin/nls/admin');
    var commonLang = require('i18n!nls/commons');

    var langs = {
    		'label_sync_query_list_title' : adminLang['동기화 설정'],
    		'label_add' : commonLang['추가'],
    		'label_delete' : commonLang['삭제'],
    		'label_sync_company_select' : adminLang['회사 선택'],
    		'label_all' : commonLang['전체'],
    		'label_sync_company_name' : adminLang['회사명'],
    		'label_sync_jdbc_name' : adminLang['Jdbc Name'],
    		'label_sync_query_type' : adminLang['Query Type'],
    		'label_sync_query_columns' : adminLang['Key Columns'],
    		'label_sync_query' : adminLang['Query'],
    		'label_empty_list' : adminLang['표시할 데이터 없음'],
    		'label_sync_delete' : adminLang['동기화 설정 삭제'],
    		'label_sync_delete_message' : adminLang['해당 동기화 설정을 삭제하시겠습니까?'],
    		'label_delete_check_error_message' : adminLang['삭제할 데이터가 선택되지 않았습니다.'],
    		'label_delete_success_message' : adminLang['정상적으로 삭제되었습니다.'],
    		'label_delete_error_message' : adminLang['삭제에 실패하였습니다.']
    }

    var QueryList = Backbone.Collection.extend({
    	model : SyncQueryModel,
    	companyId : null,
    	url : function(){
    		var params = {company_id : this.companyId};
    		return GO.contextRoot + "ad/api/sync/queries?" + $.param(params);
    	},
    	setCompanyId : function(companyId){
    		this.companyId = companyId;
    	}
    });

    var emptyTpl = "<td class='align_c' colspan='6'><p class='data_null'><span class='ic_data_type ic_no_data'></span> <span class='txt'>"+langs.label_empty_list+"</span></p></td>";

    var SyncConfigListView = Backbone.View.extend({

    	events : {
    		'change #sortCompanies' : '_refreshListByComapny',
    		'click #add_btn' : '_addQuery',
    		'click #delete_btn' : '_deleteQuery',
    		'click #group_all' : '_checkAll'
    	},

    	initialize : function() {
    		this.queryList = new QueryList();
        	this.companies = this.options.companies;
    		this.queryList.fetch({
    			async : false
    		});
        },

    	render : function() {
    		var self = this;
			$('.breadcrumb .path').html(adminLang["데이터 동기화 설정 / 수행"]);

			this.$el.html(ListTpl({
				lang : langs,
				companies : this.companies,
				isSelectedCompany : function(){
					return this.id == self.queryList.companyId;
				}
			}));

			var itemListArea = this.$el.find("#syncConfigTable tbody");

			if(this.queryList.length == 0){
				itemListArea.append(emptyTpl);
			}

			this.queryList.each($.proxy(function(model){
				var itemView = new SyncItemView({model : model, companies : this.companies});
				itemListArea.append(itemView.el);
				itemView.render();
			}, this));

    	},

    	_refreshListByComapny : function() {
    		var companyId = $('#sortCompanies option:selected').val();
    		if(_.isEmpty(companyId)){
    			companyId=null;
    		}
    		this.queryList.setCompanyId(companyId);
    		this.queryList
    		.fetch({
    			async:false
    		})
    		.done($.proxy(this, this.render()));
    	},

    	_addQuery : function() {
    		var addView = new SyncDetailView({companies : this.companies});
    		addView.render();
    	},

    	_deleteQuery : function() {
    		var self = this;
            $.goCaution(langs.label_sync_delete, langs.label_sync_delete_message, confirmCallback);

            function confirmCallback() {
                var deleteList=[];
                var $target = $('.check input:checked');

                if(_.isEmpty($target)) {
                    $.goError(langs.label_delete_check_error_message);
                    return ;
                }

                $.each($target, function(index, query){
                	var deleteQueryId = $(query).val();
                	if(_.isEmpty(deleteQueryId)){
                		return;
                	}
                	deleteList.push(deleteQueryId);
                })

				 var params = {
				   'deleteList' : deleteList.join(',')
				 }

				 $.ajax({
					 method : 'DELETE',
					 contentType: "application/json; charset=UTF-8",
					 dataType: "json",
					 data: JSON.stringify(params),
					 url : GO.contextRoot + "ad/api/sync/query",
					 success : function() {
						 $.goMessage(langs.label_delete_success_message);
						 self._refreshListByComapny();
				     },
				     error : function() {
				    	 $.goError(langs.label_delete_error_message);
				     }
				 })
            }
    	},

    	_checkAll : function(evt) {
            var checked = evt.target.checked;
            $.each($('.check input'), function(index, value){
            	this.checked = checked;
            });
        }

    });

    return SyncConfigListView;
});