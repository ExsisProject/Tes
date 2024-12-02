//결재 통계
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "hogan",
    "views/pagination",
    "admin/views/approval/batch_list_layout",
    "admin/views/approval/batch_list_item",
	"collections/paginated_collection",
    "admin/models/approval/batch_list_item",
    "approval/collections/security_levels",
    "when",
    "i18n!approval/nls/approval",
    "i18n!nls/commons",    
    "i18n!admin/nls/admin",
    "jquery.ui",
    "jquery.go-validation",
    "jquery.go-preloader"
], 
function(
    $, 
    _, 
    Backbone, 
    GO,
    Hogan,
    PaginationView,
    ListLayoutView,
    ListItemView,
    PaginatedCollection,
    ListItemModel,
    SecurityLevelCollection,
    when,
    approvalLang,
    commonLang,
    adminLang
) {
    lang = {
            'head_title' : approvalLang['결재 양식 추가'],
            'caption' : commonLang['등록정보'],
            'title' : commonLang['제목'],
            'form_name' : commonLang['제목'],
            'edit_template' : approvalLang['양식 편집'],
            'template_editor' : approvalLang['양식 편집기'],
            'template_preview' : commonLang['미리보기'],
            'load_another_template' : approvalLang['다른 양식 불러오기'],
            'load_template_title' : approvalLang['다른 양식 조회'],
            'state' : adminLang['사용여부'],
            'hidden' : adminLang['숨김'],
            'normal' : adminLang['정상'],
            'empty_msg' : approvalLang['등록된 양식이 없습니다.'],
            'creation_success_msg' : approvalLang['저장되었습니다. 양식 목록으로 이동합니다.'],
            'creation_fail_msg' : commonLang['저장할 수 없습니다.'],
            'cancel_and_go_to_list_msg' : approvalLang['취소하셨습니다. 이전 화면으로 이동합니다.'],
            'msg_cannot_preview_html' : approvalLang['현재 일시적인 문제로 양식을 미리보기 할 수 없습니다. 잠시 후 다시 시도해주세요.'],
            'select' : commonLang['선택'],
            'add' : commonLang['추가'],
            'delete' : commonLang['삭제'],
            'save' : commonLang['저장'],
            'cancel' : commonLang['취소'],
            'folder_name' : commonLang["폴더명"],
            'description' : approvalLang['양식 도움말'],
            'reception' : adminLang['문서 수신'],
            'receiverEditable' : adminLang['사용자가 수신처 수정 가능'],
            'reader' : adminLang['문서 열람자'],
            'reference' : adminLang['문서 참조자'],
            'referrerEditable' : adminLang['기안자가 참조자 수정 가능'],
            'system_integration' : adminLang['시스템 연동'],
        };
    
    var Collection = PaginatedCollection.extend({
    	model : ListItemModel,
		url : function() {
			var url = GO.contextRoot + "ad/api/approval/allapprform";
			return url;
		}
		
	});
	
	ApprFormConfigBatchListView = Backbone.View.extend({

            popupEl: null,
            dataTable: null,
            selectCallback: null,
            popUpTableId: 'template_table',
            securityLevels : null,
            initialize: function(options) {
                options = _.extend({}, options);
                this.selectCallback = options.selectCallback;
//                this.closeCallback = options.closeCallback;
    			this.collection = new Collection();
    			this.collection.bind('reset', this.resetList, this);
                this.securityLevels = new SecurityLevelCollection();
            },
            
            fetchSecurity : function(){
        		var self = this;
        		var deffered = when.defer();
        		when(this.securityLevels.fetch({
        			success : function(){
        				deffered.resolve();
        			},
        			error : function(){
        				deffered.reject();
        			}
        		}))
        		.otherwise(function printError(err) {
                    console.log(err.stack);
                });
        		return deffered.promise;
            },

            render: function() {
                this._renderPopup();
                this._renderPopupContent();
            },
            
            close: function() {
                isListViewOpen = false;
                if(this.dataTable) {
                    this.dataTable.tables.remove();
                }
                if (this.popupEl) {
                    this.popupEl.close();
                }
                this.remove();
            }, 

            _renderPopup: function() {
                var html = [];
                var self = this;
                this.popupEl = $.goPopup({
                    'header' : adminLang['일괄설정'],
                    'modal' : true,
                    'width' : 800,
                    'pclass' : 'layer_normal table_large_layer',
                    'contents' : '',
                    "buttons" : [
                                 {
                                    'btext' : commonLang['확인'],
                                    'autoclose' : false,
                                    'btype' : 'confirm',
                                    'callback' : function(rs){
                                    		self.saveApprConfigBatchList();
                                    }
                                },
                                {
                                    'btext' : commonLang["취소"],
                                    'btype' : 'cancel'
                                }
                            ]
                });
                this.layoutView = new ListLayoutView();
                this.layoutView.render();
                this.listenTo(this.layoutView, 'getListBySearch', this.getListBySearch);
                this.popupEl.reoffset();
            },
            
            getListBySearch : function(data){
            	this.collection.fetch({
            		data : data
            	});
            },
            
            saveApprConfigBatchList : function(){
            	var self = this;
                var preloader = $.goPreloader();
                var cloneCollection = this.collection.clone();
                var toRemoveModels = [];
                cloneCollection.each(function(m){
                	if(!m.hasChanged()){
                		toRemoveModels.push(m);
                	}
                });
                cloneCollection.remove(toRemoveModels);

                
                cloneCollection.fetch({
            		type : 'PUT',
	    			dataType : "json",
					contentType:'application/json',
					data : JSON.stringify(cloneCollection),
				    beforeSend : function(){
				        preloader.render();
				    },
	                statusCode: {
	                    403: function() { GO.util.error('403'); },
	                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); },
	                    500: function() { GO.util.error('500'); }
	                }
            	}).done(function(){
        			$.goMessage(commonLang['저장되었습니다.']);
	                preloader.release();
	                self.popupEl.close();
	            }).fail(function(){
        			$.goError(commonLang['저장에 실패 하였습니다.']);
	                preloader.release();	            	
	            });
            },

            _renderPopupContent: function() {
                var preloader = $.goPreloader();
				this.collection.fetch({
				    beforeSend : function(){
				        preloader.render();
				    },
	                statusCode: {
	                    403: function() { GO.util.error('403'); },
	                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); },
	                    500: function() { GO.util.error('500'); }
	                }
	            }).done(function(){
	                preloader.release();
	            });
            },
            
    		resetList: function(doclist) {
    			this.popupEl.find('#template_table > tbody').empty();
    			doclist.each(function(doc){
    				var listItemView = new ListItemView({
    					model: doc,
    					securityLevels : this.securityLevels.clone()
    				});
    				this.popupEl.find('#template_table > tbody').append(listItemView.render().el);
    			}, this);

    			if (doclist.length == 0) {
    				this.popupEl.find('#template_table > tbody').html(this._renderSearchEmptyTmpl());
    			}
    		},

            _closeTemplate: function() {
                isListViewOpen = false;
                if(this.dataTable) {
                    this.dataTable.tables.remove();
                }
                this.remove();
            },
            
            _renderSearchEmptyTmpl: function() {
                var htmls = [];
                htmls.push('    <tr>');
                htmls.push('        <td colspan="19">');
                htmls.push('            <p class="data_null">');
                htmls.push('                <span class="ic_data_type ic_no_data"></span>');
                htmls.push('                <span class="txt">' + approvalLang['등록된 결재 양식이 없습니다.'] + '</span>');
                htmls.push('            </p>');
                htmls.push('        </td>');
                htmls.push('    </tr>');

                var compiled = Hogan.compile(htmls.join('\n'));
                return compiled.render();
            }
        });
        
        return ApprFormConfigBatchListView;
    
});