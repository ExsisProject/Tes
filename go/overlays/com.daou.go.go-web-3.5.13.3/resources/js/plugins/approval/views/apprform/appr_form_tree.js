(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!approval/nls/approval",
        "i18n!admin/nls/admin",
        "jquery.go-sdk",
        "jquery.jstree"
    ], 
    function(
        $,
        Backbone,
        App,
        commonLang,
        approvalLang,
        adminLang
    ) {

        var lang,
            FormTreeException,
            ApprFormTreeView;

        lang = {
            'folder_name' : adminLang["폴더명"],
            'select_folder' : adminLang["폴더를 선택해 주십시오."],
            'cannot_update' : adminLang["최상위 폴더를 수정할 수 없습니다."],
            'cannot_delete' : adminLang["삭제할 수 없습니다."],
            'cannot_delete_root' : commonLang["최상위 폴더는 삭제할 수 없습니다."],
            'cannot_delete_parent' : adminLang["양식이 있거나 하위 폴더가 있는 경우는 삭제할 수 없습니다."],
            'folder_add' : adminLang["폴더 추가"],
            'folder_modify' : commonLang["수정"],
            'folder_delete' : commonLang["삭제"],
            'folder_delete_message' : adminLang["폴더 삭제"],
            'folder_delete_confirm' : adminLang["폴더를 삭제하시겠습니까?"],
            'selected_folder' : adminLang["선택된 폴더"],
            'save_success' : commonLang['저장되었습니다.'],
            'already_used_name' : adminLang["이미 사용중인 이름입니다."],
            'move_success' : approvalLang['{{arg1}}양식이 {{arg2}} 폴더로 이동되었습니다.'],
            'move_fail' : adminLang['이동에 실패하였습니다.'],
            'cannot_search' : commonLang["해당 검색 결과가 존재하지 않습니다."]
        };

        FormTreeException = function(message) {
            this.message = message;
            this.name = 'FormTreeException';
        };
        
        /**
         * 결재 양식과 폴더를 트리 형태로 보여주는 뷰입니다.
         * 어드민 타입과, 사용자 타입 2개를 제공하며,
         * 사용자 타입인 경우 사용예시는 다음과 같습니다.
         * 
         * var treeView = new ApprFormTreeView({
                isAdmin: false,
                treeElementId: 'org_tree_wrapper',
                selectCallback: $.proxy(function(data) {
                    console.log(data);
                }, this)
            });
            treeView.render();
         */
        ApprFormTreeView = Backbone.View.extend({
            
            treeElement: null,
            treeElementId: null,
            apiCommonUrl: null,
            isAdmin: false,
            keyword: '',

            /**
             * 초기화
             *  @keyword: 검색할 양식 keyword
             *  @treeElementId: 트리를 그려 붙여 놓을 대상 엘리먼트 아이디이며, #값을 제외하고 이름만 전달합니다.
             *  @selectCallback: 노드 선택시 호출되는 콜백입니다.
             *  @isAdmin: 어드민인지 여부이며, 이에 따라 호출 URL이 달라집니다. 기본값은 false.
             */
            initialize: function(options) {
                this.options = options || {};
                if (_.isString(this.options.keyword)) { this.keyword = this.options.keyword; }
                if (_.isString(this.options.treeElementId)) { this.treeElementId = this.options.treeElementId; }
                if (_.isFunction(this.options.selectCallback)) { this.selectCallback = this.options.selectCallback; }
                if (_.isFunction(this.options.renameCallback)) { this.renameCallback = this.options.renameCallback; }
                if (_.isBoolean(this.options.isAdmin)) { this.isAdmin = this.options.isAdmin; }
                if (_.isNull(this.treeElementId)) {
                    throw new FormTreeException("옵션:treeElementId이 필요합니다.");
                }
            },
            
            /**
             * 노드 선택시 호출되는 콜백메서드의 기본값 입니다.
             */
            selectCallback: function() {
                console.log("아무런 selectCallback도 지정되지 않았습니다.");
            },
            
            /**
             * 폴더 수정후 호출되는 콜백메서드의 기본값 입니다.
             */
            renameCallback: function() {
                console.log("아무런 renameCallback도  지정되지 않았습니다.");
            },
            
            /**
             * 현재 선택된 노드의 데이터를 반환합니다.
             * 
             * @returns id: 노드 아이디값, el: 노드 엘리먼트, type: 노드의 종류, hasChildren: 자식 노드가 있는지 여부
             * 
             */
            getSelectedNodeData: function(selected) {
                selected = selected || this._getTreeElement().jstree('get_selected');
                if (!selected || selected.length == 0 || !selected.data()) {
                    return {};
                }
                var data = _.extend(selected.data(), {
                    el: selected,
                    folderName : this._getTreeElement().jstree('get_text'),
                    type: selected.find('a:eq(0)').attr('rel'),
                    hasChildren: selected.find('ul').length > 0
                });
                
                return data;
            },
            
            /**
             * 폴더를 추가하는 화면을 구성합니다. (어드민만 가능)
             * @param inputName
             */
            renderNewFolderInput: function(inputName) {
                if (!this.isAdmin) {
                    return false;
                }
                
                var node = this.getSelectedNodeData()['el'];
                this._getTreeElement().jstree('create', node, 'last', {
                    data : inputName || lang['folder_name']
                });
            },
            
            /**
             * 폴더를 수정하는 화면을 구성합니다. (어드민만 가능)
             * @returns {Boolean}
             */
            renderRenameFolderInput: function() {
                if (!this.isAdmin) {
                    return false;
                }
                
                var selectedData = this.getSelectedNodeData();
                if (!selectedData['id']) {
                    $.goMessage(lang['select_folder']);
                    return false;
                }
                
                if (selectedData['type'] == 'ROOT') {
                    $.goMessage(lang['cannot_update']);
                    return false;
                }
                
                this._getTreeElement().jstree('rename');
                this._getTreeElement().find('.jstree-clicked').css({ 'background' : 'transparent', 'border' : 0  });
                this._getTreeElement().find('input.jstree-rename-input').css({'left' : '20px', 'top':'2px' });
            },
            
            /**
             * 폴더를 삭제합니다. (어드민만 가능)
             * @returns {Boolean}
             */
            deleteSelectedFolder: function() {
                if (!this.isAdmin) {
                    return false;
                }
                
                var selectedData = this.getSelectedNodeData();
                console.log(selectedData);
                
                if (!selectedData['id']) {
                    $.goMessage(lang['select_folder']);
                    return false;
                }
                
                if (selectedData['type'] == 'ROOT') {
                    $.goMessage(lang['cannot_delete_root']);
                    return false;
                }
                
                if (selectedData['hasChildren']) {
                    $.goMessage(lang['cannot_delete_parent']);
                    return false;
                }
                
                $.goCaution(lang['folder_delete_message'], lang['folder_delete_confirm'], $.proxy(function() {
                    this._getTreeElement().jstree('remove');
                }, this));
            },
            
            /**
             * 양식 트리를 렌더합니다.
             */
            render: function() {
                var self = this;
                var url = self._getCommonUrl();
                if(this.keyword !== '') {
                    url = url + '?' + $.param({'keyword' : this.keyword});
                }
                this.treeElement = this._getTreeElement().jstree({
                    'plugins' : [ 'themes', 'json_data', 'crrm', 'ui', 'cookies', 'types', 'dnd'],
                    'core' : { 'animation' : 120 },
                    'json_data' : {
                        'ajax' : {
                            "url" : url,
                            "data" : function(n) {
                                var data = null;
                                if (typeof n.data == 'function') {
                                    data = n.data();
                                }
                                return {
                                    folderId : data ? data.id : self.loadId
                                };
                            },
                            "cache" : true,
                            "async" : false,
                            "success" : function(data) {
                                if(_.isEmpty(data)) {
                                    $("#" + self.treeElementId).append(lang['cannot_search']);
                                    return;
                                }
                            	$.each(data, function(i, v){
                            		if(v.metadata && v.metadata.folderState == 'HIDDEN'){
                            			v.data.attr.nodeState = 'DISABLE';
                            		}
                            	});
                            }
                        }
                    },
                     'core' : { 'animation' : 120 },
                     'defaults ' : {
                         'html_titles' : false,
                         'move_node' : false,
                         'ccp' : true,
                         'width' : 200
                     },
                     'ui' : {
                         'select_multiple_modifier' : false,
                         'select_limit' : 1
                     },
                     'types' : {
                         'max_depth' : 10,
                         "max_children" : 10,
                         'valid_children' : [ "root" ],
                         'start_drag' : false,
                         'move_node' : false,
                         "start_drag" : false,
                         "move_node" : false,
                         'delete_node' : false,
                         'remove' : false,
                         'types' : {
                             'default' : {
                                 "start_drag" : (self.isAdmin) ? true : false,
                                 "move_node" : (self.isAdmin) ? true : false,
                                 "delete_node" : (self.isAdmin) ? true : false
                             },
                             'root' : {
                                 'valid_children' : self._getValidChildrenOfFolder(),
                                 "start_drag" : false,
                                 "move_node" : false,
                                 "delete_node" : false,
                                 "remove" : false
                             },
                             'form' : {
                                 'valid_children' :  [ "none" ],
                                 "start_drag" : false,
                                 "move_node" : false,
                                 "delete_node" : false,
                                 "remove" : false
                             },
                             'normal' : {
                                 'max_depth' : 10,
                                 "max_children" : 10,
                                 'valid_children' : self._getValidChildrenOfFolder(),
                                 "start_drag" : false,
                                 "move_node" : false,
                                 "delete_node" : false,
                                 "remove" :false
                             }
                         }
                     }
                })
                .bind("loaded.jstree", $.proxy(self._onLoaded, self))
                .bind("load_node.jstree", $.proxy(self._onLoadNode, self))
                .bind("select_node.jstree", $.proxy(self._onSelectNode, self));

                if (this.isAdmin) {
                    this.treeElement.bind("create.jstree", $.proxy(self._onJstreeCreate, self))
                    .bind("rename.jstree", $.proxy(self._onJstreeRename, self))
                    .bind("move_node.jstree", $.proxy(self._onJstreeMove, self))
                    .bind("remove.jstree", $.proxy(self._onJstreeRemove, self));
                }
            },

            getDroppable: function() {
                var selector = 'li a[rel=FOLDER],li a[rel=ROOT]',
                    getFormData,
                    getFolderData,
                    getSelectedFolderData;
                
                getFormData = function($draggable) {
                    return {
                        id: $draggable.find('td.title > a').attr('data-id'),
                        name: $draggable.find('td.title > a').text()
                    };
                };
                
                getSelectedFolderData = $.proxy(this.getSelectedNodeData, this);
                getFolderData = function($dropTarget) {
                    return {
                        id: $dropTarget.attr('nodeid'),
                        name: $dropTarget.text()
                    };
                };
                
                return {
                    selector: selector,
                    overCallback: function($dragging, $dropTo) {
                        var formData = getFormData($dragging),
                            folderData = getFolderData($dropTo),
                            selectedFolderData = getSelectedFolderData(),
                            deferred = $.Deferred();
                        
                        if (selectedFolderData['id'] == folderData['id']) {
                            deferred.reject();
                        } else {
                            $dropTo.addClass('jstree-hovered');
                            deferred.resolve();
                        }
                        
                        return deferred;
                    },

                    outCallback: function($dragging, $dropTo) {
                        var deferred = $.Deferred();
                        $(selector).removeClass('jstree-hovered');
                        deferred.resolve();
                        return deferred;
                    },
                    
                    dropCallback: function($dragging, $dropTo) {
                        $(selector).removeClass('jstree-hovered');
                        var formData = getFormData($dragging),
                            folderData = getFolderData($dropTo),
                            selectedFolderData = getSelectedFolderData();
                            
                        if (selectedFolderData['id'] == folderData['id']) {
                            return false;
                        }
                        
                        var ajaxURL = GO.contextRoot + 'ad/api/approval/apprform/' + formData['id'] + '/move',
                            ajaxData = JSON.stringify({
                                id : formData['id'],
                                folder : { id: folderData['id'] },
                                seq : 0
                            });
                        
                        var promise = $.ajax({
                            type: 'PUT',
                            async: true,
                            url: ajaxURL,
                            data : ajaxData,
                            contentType : "application/json",
                            dataType: 'json',
                        });
                        
                        promise.done(function(response){
                            $.goMessage(App.i18n(lang['move_success'], { 
                                "arg1" : formData['name'],
                                "arg2" : folderData['name']
                            }));
                        });
                        
                        promise.fail(function(xhr, status, err) {
                            $.goMessage(lang['move_fail']);
                        });
                        
                        return promise;
                    }
                };
            },
            
            _getTreeElement: function() {
                return $('#' + this.treeElementId);
            },
            
            _getCommonUrl: function() {
                if (this.isAdmin) {
                    return GO.contextRoot + 'ad/api/approval/formfolder';
                } else {
                    return GO.contextRoot + 'api/approval/apprform/tree';
                }
            },
            
            _getValidChildrenOfFolder: function() {
                var types = [ "FOLDER" ];
                if (!this.isAdmin) {
                    types.push("FORM");
                }
                return types;
            },
            
            _onLoaded: function() {
                if(!$.cookie("jstree_open")) {
                    this.treeElement.find('a[rel="ROOT"]').trigger('click');
                    this.treeElement.jstree('open_node', this._getTreeElement().find('li:eq(0)'));
                }
            },
            
            _onLoadNode: function( node , success_callback , error_callback ) {
                this.treeElement.find('a[href="#"]').attr('data-bypass', 1);
                this.treeElement.find('a[rel="form"] > ins').addClass('appr_form');
            },

            /**
             * Jstree의 한 노드(폴더)가 선택된 경우의 콜백
             * 
             * @param e
             * @param data
             */
            _onSelectNode: function(e, data) {
                if(this._isForm(this.getSelectedNodeData()['type'])) {
                    var selected = $(data.rslt.obj[0]);
                    var parentNode = selected.parents('li:eq(0)');

                    this.treeElement.jstree('select_node', parentNode, true);

                    var selectedData = this.getSelectedNodeData(parentNode);
                    if (selectedData && _.isFunction(this.selectCallback)) {
                        this.selectCallback(selectedData);
                    }


                } else {
                    var selectedData = this.getSelectedNodeData($(data.rslt.obj[0]));
                    if (selectedData && _.isFunction(this.selectCallback)) {
                        this.selectCallback(selectedData);
                    }
                }
            },

            _isForm: function(type) {
                return type === "form";
            },

            /**
             * Jstree create 콜백. 실제 폴더를 저장하는 API 통신 수행한다.
             * 
             * @param e
             * @param data
             * @returns {Boolean}
             */
            _onJstreeCreate : function(e, data) {
            	var self = this;
            	
                var parentNode = this.getSelectedNodeData()['el'],
                    addData = data.rslt,
                    saveParam = {
                        name : $.trim(addData.name),
                        parentId: this.getSelectedNodeData()['id'],
                        seq : addData.position
                    };
                
                if(saveParam.name == lang['folder_name'] || saveParam.name == '') {
                    this._getTreeElement().jstree('refresh', parentNode);
                    return false;
                }

                $.go(this._getCommonUrl(), JSON.stringify(saveParam), {
                    contentType: 'application/json',
                    responseFn : function(rs) {
                    	self._getTreeElement().jstree('refresh', parentNode);
                    }
                });
            },
            
            /**
             * jstree rename 이벤트 콜백
             * 
             * @param e
             * @param data
             */
            _onJstreeRename : function(e, data) {
            	var self = this;
                this._getTreeElement().find('.jstree-clicked').removeAttr('style');
                var renameObj = data.rslt,
                    selectedData = $(data.rslt.obj[0]).data(),
                    json = JSON.stringify({
                        id: selectedData['id'],
                        name: renameObj.new_name
                    });
                if (!renameObj.new_name) { return false; }
                if (renameObj.new_name == renameObj.old_name) { return false; }
                $.go(this._getCommonUrl() + '/' + selectedData['id'], json, {
                    qryType : 'PUT',
                    contentType: 'application/json',
                    responseFn : function(rs) {
                        if (_.isFunction(self.renameCallback)) {
                        	self.renameCallback(renameObj.new_name);
                        }
                        this._getTreeElement().find('.go_alert').html('');
                    },
                    error : function(error) {
                        if(data.rlbk) {
                            $.jstree.rollback(rlbk);
                        }
                        // TODO: status에 따라 다른 메시지를 보여주면 더 좋을 것!
                        this._getTreeElement().find('.go_alert').html(lang['already_used_name']);
                    }
                });

                
            },
            _getSeq: function (targetParent, data) {
                var isRoot = targetParent.filter('[rel=ROOT]').length > 0;
                if(!isRoot)
                    return 0;

                var totalCount = data.rslt.o.index();
                var formCount = data.inst._get_children(data.inst._get_parent())
                if(formCount != undefined)
                    formCount = formCount.filter('[rel=form]').length;

                return totalCount - formCount;
            },

            _onJstreeMove: function(e, data) {
                var self = this;
                var targetParent = data.inst._get_parent(data.rslt.o),
                    targetId = data.rslt.o.data('id'),
                    param = {
                        parentId : targetParent.data('id'),
                        seq : this._getSeq(targetParent, data),
                    };

                $.go(this._getCommonUrl() + '/' + targetId + '/move', JSON.stringify(param), {
                    qryType : 'PUT',
                    contentType : 'application/json',
                    responseFn : function(rs) {
                        if(rs.code == 200) {
                            self.render();
                        } else {
                            $.jstree.rollback(data.rlbk);
                        }
                    }
                });
            },
            
            /**
             * jstree remove 이벤트 콜백
             * 
             * @param e
             * @param data
             */
            _onJstreeRemove: function(e, data) {
                var selected = $(data.rslt.obj[0]);
                $.go(this._getCommonUrl() + '/' + selected.data()['id'], {}, {
                    qryType : 'DELETE',
                    contentType: 'application/json',
                    success : $.proxy(function(rs) {
                        var parentNode = selected.parents('li:eq(0)');
                        this._getTreeElement().jstree('select_node', parentNode);
                    }, this),
                    error: $.proxy(function(err) {
                        if(data.rlbk) {
                            $.jstree.rollback(data.rlbk);
                        }
                        this._getTreeElement().find('.go_alert').html(lang['cannot_delete']);
                    }, this)
                });
            }
        });

        return ApprFormTreeView;
    });
}).call(this);