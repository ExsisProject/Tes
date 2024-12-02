(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "i18n!approval/nls/approval",
        "hgn!admin/templates/appr_form_index",
        "admin/views/appr_form_list",
        "admin/views/appr_form_config_batch_list",
        "approval/views/apprform/appr_form_tree",
        
        "jquery.go-sdk",
        "jquery.jstree",
        "jquery.go-popup",
        "jquery.go-grid",
        "jquery.go-orgslide",
        "jquery.go-validation"
    ], 
    function(
        $,
        Backbone,
        App,
        commonLang,
        adminLang,
        approvalLang,
        configTmpl,
        ApprFormListView,
        ApprFormConfigBatchListView,
        ApprFormTreeView
    ) {
        
        var ApprFormConfigView,
            lang = {
                'head_title' : approvalLang["결재 양식 관리"],
                'appr_form_folder_list' : approvalLang["결재양식 폴더 목록"],
                'folder_name' : commonLang["폴더명"],
                'folder_add' : commonLang["폴더 추가"],
                'folder_modify' : commonLang["수정"],
                'folder_delete' : commonLang["삭제"],
                'selected_folder' : commonLang["선택된 폴더"],
                'form_add' : approvalLang["양식 추가"],
                'form_delete' : approvalLang["양식 삭제"],
                'reorder' : adminLang["순서바꾸기"],
                'reorder_done' : adminLang["순서바꾸기 완료"],
                'folder_delete_message' : commonLang["폴더 삭제"],
                'folder_delete_confirm' : commonLang["폴더를 삭제하시겠습니까?"],
                'null_data' : approvalLang["등록된 결재 양식이 없습니다."],
                'select_folder' : commonLang["폴더를 선택해 주십시오."],
                'cannot_update' : commonLang["최상위 폴더를 수정할 수 없습니다."],
                'cannot_delete' : commonLang["삭제할 수 없습니다."],
                'cannot_delete_root' : commonLang["최상위 폴더는 삭제할 수 없습니다."],
                'cannot_delete_parent' : approvalLang["양식이 있거나 하위 폴더가 있는 경우는 삭제할 수 없습니다."],
                'save_success' : commonLang['저장되었습니다.'],
                'already_used_name' : commonLang["이미 사용중인 이름입니다."],
                '저장': commonLang["저장"],
                '사용여부': adminLang["폴더 노출 여부"],
                '운영자': adminLang["운영자"],
                '사용여부 툴팁':adminLang["결재양식 관리 사용여부 툴팁"],
                '정상' : adminLang["정상"],
                '숨김' : adminLang["숨김"],
                '일괄설정' : adminLang['일괄설정'],
                'form_input' : adminLang["양식 제목을 입력하세요."]
            };
        
        /**
        *
        * 결재 양식 관리의 메인 뷰이다. 폴더 관리와 양식의 목록 관리를 담당한다.
        *
        */
        ApprFormConfigView = Backbone.View.extend({
            
            treeView: null,
            formListView: null,
            batchListView : null,
            initialize : function(){
                this._initEventBinding();
            },
            
            _initEventBinding : function() {
                this.$el.off();
                this.$el.on("click", "span#btnFolderCreate", $.proxy(this._beforeCreate, this));
                this.$el.on("click", "span#btnFolderUpdate", $.proxy(this._beforeUpdate, this));
                this.$el.on("click", "span#btnFolderDelete", $.proxy(this._beforeDelete, this));
                this.$el.on("click", "span#btnFormCreate", $.proxy(this._goToFormCreate, this));
                this.$el.on("click", "span#btnFormDelete", $.proxy(this._deleteForm, this));
                this.$el.on("click", "span#btnFormReorder", $.proxy(this._renderFormReorderView, this));
                this.$el.on("click", "span#btnFormReorderUpdate", $.proxy(this._updateReorderedList, this));
                this.$el.on("click", "span#folderStateSave", $.proxy(this._folderStateSave, this));
                this.$el.on("click", "span#popupSetting", $.proxy(this.popupSetting, this));
                this.$el.on("keyup", "input#search", $.proxy(this.searchNode, this));
            },
            searchNode: function (e) {
                var $target = $(e.currentTarget);
                var self = this;

                if( e.keyCode == 13 ) {
                    self._renderTreeView();
                    return ;
                }
                clearTimeout(this.clearTimeOut);
                this.clearTimeOut = setTimeout(function(){
                    if( e ) {
                        var inputValue = $.trim($target.val());
                        if ( inputValue != '') {
                            self.keyword = inputValue;
                            self._renderTreeView();
                        }

                        if( inputValue == ''){
                            self._renderTreeView();
                        }
                    };
                }, 500);
            },

            render : function() {
                this.$el.html(configTmpl({ lang : lang }));
                this._renderTreeView();
                
                return this;
            },
            
            popupSetting : function(){
            	var self = this;
            	this.batchListView = new ApprFormConfigBatchListView();
            	this.batchListView.fetchSecurity().done(function(){
            		self.batchListView.render();
            	});
            },

            _renderTreeView: function() {
                var treeViewCallback = {
                    select: function(data) {
                        this._renderFormListView(data);
                    },

                    rename: function(name) {
                        this.$el.find('#appr_form_list .header_group .critical h3').text(name);
                    }
                };
                
                this.treeView = new ApprFormTreeView({
                    isAdmin: true,
                    keyword: this.$el.find("#search").val().trim(),
                    treeElementId: 'folderTree',
                    selectCallback: $.proxy(treeViewCallback['select'], this),
                    renameCallback: $.proxy(treeViewCallback['rename'], this)
                });
                
                this.treeView.render();
                
                // GO-10422 사이트 관리자 > 결재양식 추가 후, 이전 폴더를 위치되도록 개선
                // 기본 렌더링 자체가 trigger 에 의한 동작이라... 일단 이렇게 처리.
                var self = this;
                setTimeout(function() {
                	var stored = GO.util.store.get("appr_form_index:folderId");
                	var root = self.treeView.getSelectedNodeData();
                	GO.util.store.set("appr_form_index:folderId", null);
                	if (stored && (stored != root.id)) {
                		$("a[nodeid='" + stored + "']").trigger("click");
                	}
                }, 1000);
            },
            
            _renderFormListView: function(data) {
                var $toolbar = this.$el.find('#tool_bar');
                var $formList = $toolbar.next();
                if ($formList.length > 0) {
                    $formList.empty();
                }
                var formId = $('a.jstree-hovered').attr('id');
                if(formId != undefined)
                    formId = formId.replace('form_','');

                this.formListView = new ApprFormListView({ folderId: data['id'], formId: formId });
                $toolbar.after(this.formListView.$el);
                this.$el.find('#appr_form_list .header_group .critical h3').text(data['folderName']);
                if(data.folderState == 'HIDDEN'){
                	this.$('#folderState_HIDDEN').prop('checked', true);
                }else{
                	this.$('#folderState_NORMAL').prop('checked', true);                	
                }
            	this.$('#appr_option_group').toggle(data.type != 'ROOT'); //루트 폴더는 사용여부를 숨김

                
                this.formListView.render($.proxy(this._makeFormDraggableToFolder, this));
            },
            
            _folderStateSave : function(){
            	var self = this;
                var selectedData = this.treeView.getSelectedNodeData();
                var folderId = selectedData['id'], folderState = this.$('input[name="folderState"]:checked').val();
            	$.go(GO.contextRoot + 'ad/api/approval/formfolder' + '/' + selectedData['id'], JSON.stringify({id: folderId, folderState: folderState}), {
                    qryType : 'PUT',
                    contentType: 'application/json',
                    async: false,
                    responseFn : function(rs) {
                        $.goMessage(commonLang['저장되었습니다.']);
                        var tree = jQuery.jstree._reference(self.treeView._getTreeElement());
                        var currentNode = tree._get_node(null, false);
                        var parentNode = tree._get_parent(currentNode);
                        tree.refresh(parentNode);
                        _.delay(function() {
                        	$("a[nodeid='" + folderId + "']").trigger("click");                        	
                        }, 500);
                    },
                    error : function(error) {
                        $.goMessage(commonLang['저장에 실패 하였습니다.']);
                    }
                });
            },
            
            _makeFormDraggableToFolder: function() {
                var ctx = this;
                if (!this.formListView) {
                    return false;
                }
                
                this.draggable = this.formListView.getDraggable();
                
                // GO-11542 양식이 없다는 문구가 D&D 되는 버그
                if (this.formListView.dataTable.tables.isEmpty()) return;
                
                $(this.draggable['selector']).draggable({
                    cursorAt: { top: 5 },
                    helper: 'clone',
                    revert: 'invalid',
                    start : this.draggable['startCallback']
                });
                
                var droppable = this.treeView.getDroppable();
                $(droppable['selector']).droppable({
                    over: function(e, ui) {
                        var promise = droppable['overCallback']($(ui.draggable), $(this));
                        promise.done(this.draggable['markAsDroppable']);
                        promise.fail(this.draggable['markAsNotDroppable']);
                    },
                    out: function(e, ui) {
                        var promise = droppable['outCallback']($(ui.draggable), $(this));
                        promise.always(this.draggable['markAsNotDroppable']);
                    },
                    drop: function(e, ui) {
                        var promise = droppable['dropCallback']($(ui.draggable), $(this));
                        if (!promise) return;
                        promise.done(function() {
                            ctx.formListView.refreshList();
                            ctx.treeView.render();
                        });

                    }
                });
            },
            
            /**
             * 폴더를 생성하는 화면을 구성한다.
             * 
             */
            _beforeCreate: function() {
                this.treeView.renderNewFolderInput(lang['folder_name']);
            },
            
            /**
             * 폴더를 수정하는 화면을 구성한다.
             * 
             * @returns {Boolean}
             */
            _beforeUpdate: function() {
                this.treeView.renderRenameFolderInput();
            },
            
            /**
             * 폴더 삭제 전 콜백
             * 
             */
            _beforeDelete: function() {
                if (!this.formListView.isEmpty()) {
                    $.goMessage(lang['cannot_delete_parent']);
                    return false;
                }
                this.treeView.deleteSelectedFolder();
            },

            /**
             * 양식 추가 화면으로 이동
             * 
             */
            _goToFormCreate: function() {
                var selectedData = this.treeView.getSelectedNodeData();
                if (!selectedData['id']) {
                    $.goMessage(lang['select_folder']);
                    return false;
                }

                GO.router.navigate('approval/formfolder/' + selectedData['id'] + '/apprform/new', true);
                //location.href = GO.contextRoot + 'admin/approval/formfolder/' + selectedData['id'] + '/apprform/new';
                return false;
            },

            /**
             * 양식 삭제
             * 
             */
            _deleteForm: function() {
                this.formListView.deleteSelected();
            },

            /**
             * 양식 일괄 순서 변경 화면으로 변경
             * 
             */
            _renderFormReorderView: function(e) {
            	$(this.draggable["selector"]).unbind();
                this.$el.find('#btnFormCreate').hide();
                this.$el.find('#btnFormDelete').hide();
                this.$el.find('#btnFormReorder').hide();
                this.$el.find('#btnFormReorderUpdate').show();
                this.formListView.renderForReorderView();
            },

            _updateReorderedList: function(e) {
                this.$el.find('#btnFormCreate').show();
                this.$el.find('#btnFormDelete').show();
                this.$el.find('#btnFormReorder').show();
                this.$el.find('#btnFormReorderUpdate').hide();
                this.formListView.saveReorderedList();
                this.formListView.refreshList();
                this.treeView.render();
            }
        });
        
        return ApprFormConfigView;
    });
}).call(this);
