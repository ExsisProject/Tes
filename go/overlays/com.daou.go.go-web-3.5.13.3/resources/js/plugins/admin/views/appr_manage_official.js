//자동결재선 설정
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "when",
    
    "hgn!admin/templates/appr_manage_official",
    "hgn!admin/templates/appr_manage_official_item",
    
    "i18n!approval/nls/approval",
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
    "jquery.ui",
    "jquery.go-sdk"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	when,
	
	ManageOfficialTpl,
	ManageOfficialItemTpl,
	
	approvalLang,
    commonLang,
    adminLang
) {	
	var apiBaseUrl = GO.contextRoot + 'ad/api/',
	lang = {
			'시행문 양식 관리' : adminLang['시행문 양식 관리'],
			'발신 명의 관리' : adminLang['발신 명의 관리'],
			'직인 관리' : adminLang['직인 관리'],
			'제목' : approvalLang['제목'],
			'사용여부' : adminLang['사용여부'],
			'추가' : commonLang['추가'],
			'삭제' : commonLang['삭제'],
			'empty_msg' : approvalLang['자료가 없습니다'],
			'delete_success_msg' : commonLang['삭제하였습니다.'],
            'delete_fail_msg' : commonLang['삭제하지 못했습니다.']
	};
	
	//시행문 양식 관리
	var ManageOfficialFormModel = Backbone.Model.extend();
	var ManageOfficialFormList = Backbone.Collection.extend({
		model : ManageOfficialFormModel,
		url: function() {
			var conditions = {
	                direction: this.direction,
	                property: this.property
            };
			return apiBaseUrl + 'approval/manage/official/form' + '?' + $.param(conditions);
		},
		setSort: function(property,direction) {
            this.property = property;
            this.direction = direction;
        }
	});
	
	//발신 명의 관리
	var ManageOfficialSenderModel = Backbone.Model.extend();
	var ManageOfficialSenderList = Backbone.Collection.extend({
		model : ManageOfficialSenderModel,
		url: function() {
			var conditions = {
	                direction: this.direction,
	                property: this.property
            };
			return apiBaseUrl + 'approval/manage/official/sender' + '?' + $.param(conditions);
		},
		setSort: function(property,direction) {
            this.property = property;
            this.direction = direction;
        }
	});
	
	//직인 관리
	var ManageOfficialSignModel = Backbone.Model.extend();
	var ManageOfficialSignList = Backbone.Collection.extend({
		model : ManageOfficialSignModel,
		url: function() {
			var conditions = {
	                direction: this.direction,
	                property: this.property
            };
			return apiBaseUrl + 'approval/manage/official/sign' + '?' + $.param(conditions);
		},
		setSort: function(property,direction) {
            this.property = property;
            this.direction = direction;
        }
	});
	
	var ManageOfficialView = Backbone.View.extend({
		el: '#layoutContent',
		initialize: function() {
			//시행문 양식 관리
			this.formCollection = new ManageOfficialFormList();
			//발신 명의 관리
			this.senderCollection = new ManageOfficialSenderList();
			//직인 관리
			this.signCollection = new ManageOfficialSignList();
			
			this.initProperty = "name";
			this.initDirection = "desc";
		},
		delegateEvents: function(events) {
            this.undelegateEvents();
            Backbone.View.prototype.delegateEvents.call(this, events);
            this.$el.on("click.manageofficial", "#btnFormAdd", $.proxy(this._addOfficialForm, this));
            this.$el.on("click.manageofficial", "#btnSenderAdd", $.proxy(this._addOfficialSender, this));
            this.$el.on("click.manageofficial", "#btnSignAdd", $.proxy(this._addOfficialSign, this));
            this.$el.on("click.manageofficial", "#btnFormDelete", $.proxy(this._delOfficialForm, this));
            this.$el.on("click.manageofficial", "#btnSenderDelete", $.proxy(this._delOfficialSender, this));
            this.$el.on("click.manageofficial", "#btnSignDelete", $.proxy(this._delOfficialSign, this));
            this.$el.on("click.manageofficial", "[name=check_all]", $.proxy(this._checkAllItem, this));
            this.$el.on("click.manageofficial", "[name=officialItemTitle]", $.proxy(this._detailView, this));
            this.$el.on("click", ".sorting", $.proxy(this.sort, this));
            this.$el.on("click", ".sorting_desc", $.proxy(this.sort, this));
            this.$el.on("click", ".sorting_asc", $.proxy(this.sort, this));
        }, 
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.off();
            return this;
        },
        
        render: function() {
        	when(this.renderLayout.call(this))
            .then(_.bind(this.loadFormList, this))
            .then(_.bind(this.loadSenderList, this))
            .then(_.bind(this.loadSignList, this))
            .then(_.bind(function(){
            	this.setInitSort(this.initProperty,this.initDirection);
            }, this))
            .otherwise(function printError(err) {
                console.log(err.stack);
            });
		},	
		renderLayout: function(){
			this.$el.html(ManageOfficialTpl({
				lang: lang
			}));
		},
		
		loadFormList: function(){
			when(this.fetchFormList.call(this))
            .then(_.bind(this.renderFormList, this))
            .otherwise(function printError(err) {
                console.log(err.stack);
            });
		},
		fetchFormList: function(){
			var deffered = when.defer();
            this.formCollection.fetch({
            	success : deffered.resolve,
            	error : deffered.reject,
                statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }
            });
			return deffered.promise;
        },
		renderFormList: function(list){
			var target = '#manage_official_form_tbl > tbody';
			this._renderList('form', target, list);
		},
		
		loadSenderList: function(){
			when(this.fetchSenderList.call(this))
            .then(_.bind(this.renderSenderList, this))
            .otherwise(function printError(err) {
                console.log(err.stack);
            });
		},
		fetchSenderList : function(){
			var deffered = when.defer();
            this.senderCollection.fetch({
            	success : deffered.resolve,
            	error : deffered.reject,
                statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }
            });
			return deffered.promise;
        },
        renderSenderList: function(list){
			var target = '#manage_official_sender_tbl > tbody';
			this._renderList('sender', target, list);
		},
		
		loadSignList: function(){
			when(this.fetchSignList.call(this))
            .then(_.bind(this.renderSignList, this))
            .otherwise(function printError(err) {
                console.log(err.stack);
            });
		},
        fetchSignList : function(){
			var deffered = when.defer();
            this.signCollection.fetch({
            	success : deffered.resolve,
            	error : deffered.reject,
                statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }
            });
			return deffered.promise;
        },
        renderSignList: function(list){
			var target = '#manage_official_sign_tbl > tbody';
			this._renderList('sign', target, list);
		},
		
		_renderList: function(type, target, list){
			$(target).empty();
			if (list.length == 0) {
				$(target).append(this._renderEmptyTmpl({
                    lang : lang
                }));
			}else{
				$(list.toJSON()).each(function(k, v){
					var data = {
							id : v.id,
							name : v.name,
							state : (v.state == 'NORMAL') ? approvalLang['사용'] : approvalLang['미사용'],
							type : type
					};
					$(target).append(ManageOfficialItemTpl({
						data : data
					}));
				});
			}
		},
		_renderEmptyTmpl: function(data) {
            var htmls = [];
            htmls.push('    <tr>');
            htmls.push('        <td colspan="3">');
            htmls.push('            <p class="data_null">');
            htmls.push('                <span class="ic_data_type ic_no_data"></span>');
            htmls.push('                <span class="txt">{{lang.empty_msg}}</span>');
            htmls.push('            </p>');
            htmls.push('        </td>');
            htmls.push('    </tr>');
            var compiled = Hogan.compile(htmls.join('\n'));
            return compiled.render(data);
        },
		
        _addOfficialForm : function(){
            GO.router.navigate('approval/manage/official/form/new', {trigger: true});
            return false;
        },
        _addOfficialSender : function(){
            GO.router.navigate('approval/manage/official/sender/new', {trigger: true});
            return false;
        },
        _addOfficialSign : function(){
            GO.router.navigate('approval/manage/official/sign/new', {trigger: true});
            return false;
        },
        
        _delOfficialForm : function(){
        	this._delOfficialItems('#manage_official_form_tbl input:checked', 'approval/manage/official/form');
        },
        _delOfficialSender : function(){
        	this._delOfficialItems('#manage_official_sender_tbl input:checked', 'approval/manage/official/sender');
        },
        _delOfficialSign : function(){
        	this._delOfficialItems('#manage_official_sign_tbl input:checked', 'approval/manage/official/sign');
        },
        _delOfficialItems: function(checkTarget, apiUrl){
        	var self = this;
        	var formIds = [];
            
            this.$el.find(checkTarget).each(function(idx) {
                if ($(this).attr('name') == 'id') {
                    formIds.push($(this).val());
                }
            });
            if (formIds.length == 0) {
                $.goMessage(approvalLang['선택된 대상이 없습니다.']);
                return false;
            }
        	
            $.goConfirm(adminLang['삭제하시겠습니까?'], "", function() {
                $.go(apiBaseUrl + apiUrl, JSON.stringify({ids: formIds}), {
                    qryType : 'DELETE',
                    contentType: 'application/json',
                    async: false,
                    responseFn : function(rs) {
                        $.goMessage(lang['delete_success_msg']);
                        self.render();
                    },
                    error : function(error) {
                        $.goMessage(lang['delete_fail_msg']);
                        self.render();
                    }
                });
            });
        },
        
        _detailView: function(e){
        	var target = $(e.currentTarget);
        	var type = $(target).attr('data-type');
        	var id = $(target).attr('data-id');
        	GO.router.navigate("approval/manage/official/"+type+"/"+id+"/show", {trigger: true});
            return false;
        },
        
        _checkAllItem: function(e){
        	var el = $(e.currentTarget);
            checkboxes = el.closest('table').find('input:checkbox');
	        if (el.is(':checked')) {
	            checkboxes.attr('checked', 'checked');
	        } else {
	            checkboxes.removeAttr('checked');
	        }
        },
        
        setInitSort: function(property,direction){
			var dataId = null;
			var sortPart = this.$el.find('th:not(.sorting_disable)');
    		sortPart.each(function(){
    			if($(this).attr('class') != 'sorting_disabled') {
    				$(this).attr('class','sorting'); 
    			} 
    			if ( $(this).attr('sort-id') == property ) {
    				dataId = $(this).attr('id');
    				$("#"+dataId).attr('class','sorting_'+direction);
    			} 
    		});
		},
		
        sort: function(e){
    		var id = '#'+$(e.currentTarget).attr('id');
    		var class_status =$(id).attr('class');
    		var property = $(id).attr('sort-id');
    		var direction= 'desc';
    		var targetTbl = $(e.currentTarget).closest('table');
    		var sortPart = targetTbl.find('th:not(.sorting_disable)');
    		sortPart.each(function(){
    			if($(this).attr('class') != 'sorting_disabled') {
    				$(this).attr('class','sorting'); 
    			} 
    		});
    		if ( class_status == 'sorting' ){
    			$(id).attr('class','sorting_desc');
    		} else if ( class_status == 'sorting_desc' ){
    			$(id).attr('class','sorting_asc');
    			direction= 'asc';
    		} else if ( class_status == 'sorting_asc' ) {
    			$(id).attr('class','sorting_desc');
    		} else {
    			$.goMessage("Sorting Error.");
    		}
    		
    		if($(e.currentTarget).attr('sort-type') == "form"){
    			this.formCollection.setSort(property,direction);
    			this.loadFormList();
    		}else if($(e.currentTarget).attr('sort-type') == "sender"){
    			this.senderCollection.setSort(property,direction);
    			this.loadSenderList();
    		}else if($(e.currentTarget).attr('sort-type') == "sign"){
    			this.signCollection.setSort(property,direction);
    			this.loadSignList();
    		}
    	},
        
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	return ManageOfficialView;
});