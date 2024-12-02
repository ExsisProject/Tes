(function() {
    define([
        "jquery",
        "backbone",
        "app",
	    "i18n!approval/nls/approval",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "jquery.go-sdk",
        "jquery.jstree"
    ], 
    function(
        $,
        Backbone,
        App,
        approvalLang,
        commonLang,
        adminLang
    ) {

        var lang,
            FormTreeException,
            ApprFormSearchTreeView;
            
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
            'already_used_name' : adminLang["이미 사용중인 이름입니다."]
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
        ApprFormSearchTreeView = Backbone.View.extend({
            
        	elId: null,
        	treeElId: null,
        	searchInputId: null,
        	searchResultElId : null,
            isAdmin: false,
            
            /**
             * 초기화
             *  @treeElementId: 트리를 그려 붙여 놓을 대상 엘리먼트 아이디이며, #값을 제외하고 이름만 전달합니다.
             *  @selectCallback: 노드 선택시 호출되는 콜백입니다.
             *  @isAdmin: 어드민인지 여부이며, 이에 따라 호출 URL이 달라집니다. 기본값은 false.
             */
            
            initialize: function(options) {
                this.options = options || {};
                if (_.isString(this.options.elId)) { this.elId = this.options.elId; }
                if (_.isString(this.options.treeElId)) { this.treeElId = this.options.treeElId; }
                if (_.isString(this.options.searchInputId)) { this.searchInputId = this.options.searchInputId; }
                if (_.isString(this.options.apiCommonUrl)) { this.apiCommonUrl = this.options.apiCommonUrl; }
                if (_.isString(this.options.searchResultElId)) { this.searchResultElId = this.options.searchResultElId; }
                if (_.isFunction(this.options.selectCallback)) { this.selectCallback = this.options.selectCallback; }
                if (_.isBoolean(this.options.isAdmin)) { this.isAdmin = this.options.isAdmin; }
                if (_.isNull(this.elId)) {
                    throw new FormTreeException("옵션:elId 필요합니다.");
                };
                this.css = {
                        'minHeight' : 150,
                        'maxHeight' : 375,
                        'overflow-y' : 'auto'
                };
            },
            
            _bindEvents: function() {
                var el = $('#' + this.options.elId);
                el.off("keyup", '#' + this.options.searchInputId);
                el.on("keyup", '#' + this.options.searchInputId, $.proxy(function(e) {

                    var keyword = $(e.currentTarget).val(),
                        searchEl = $('#' + this.options.searchResultElId),
                        treeEl = $('#' + this.options.treeElId);

                    if (keyword == "") {
                        searchEl.hide();
                        treeEl.show();
                        this._loadJsTree();
                    } else {
                        treeEl.hide();
                        searchEl.show();
                        this._loadSearchList(keyword);
                    }

                }, this));
            },
            
            _loadSearchList: function(keyword) {
                this.isSearchShowing = true;
                this.isTreeShowing = false;
                
                var searchInputEl = $('#' + this.options.searchInputId),
                    searchResultEl = $('#' + this.options.searchResultElId),
                    keyword = (searchInputEl.val() == searchInputEl.attr('placeholder')) ? '' : $.trim(keyword),
                    folderTpl,
                    nullTpl;

                searchResultEl.off('click', 'ul.mail_folder > li');
                searchResultEl.on('click', 'ul.mail_folder > li', $.proxy(function(e) {
                    var target = $(e.currentTarget);
                    if(target.attr('rel')=="noAuth"){
                    	return false;
                    }
                    
                    searchResultEl.find('ul').find('li>a').removeClass('jstree-clicked');
                    target.find('a').addClass('jstree-clicked');

                    if (_.isFunction(this.selectCallback)) {
                        this.selectCallback(this._processSearchData(target));
                    }

                    
                }, this));

                folderTpl = Hogan.compile([
                    '<li class="jstree-leaf {{className}}" data-id="{{id}}" data-title="{{name}}" rel="{{rel}}" ">',
                    '   <a  data-bypass >',
                    '       <ins class="jstree-icon">&nbsp;</ins>{{name}}',
                    '   </a>',
                    '</li>'
                ].join(''));

                nullTpl = Hogan.compile([
                    '<p class="data_null"><span class="ic_data_type ic_no_part"></span>{{msg_no_search_result}}</p>',
                ].join(''));

                $.ajax({
                    url : GO.contextRoot + 'api/approval/companyfolder/tree/search',
                    type : 'get',
                    contentType : 'application/json',
                    data : {
                        'page' : 0,
                        'offset' : 200,
                        'keyword' : keyword
                    }
                })
                .done($.proxy(function(rs) {
                    var folders = [];

                    searchResultEl.find('ul').empty();
                    
                    if (rs.data && rs.data.length) {
                        $.each(rs.data, function(k, v) {
                        	folders.push(folderTpl.render({ 
                                id : v.metadata.id,
                                name : v.metadata.name,
                                title : v.metadata.title,
                                rel : !v.metadata.auth ? "noAuth" : "",
                                className : !v.metadata.auth ? "disable" : ""
                            }));
                        });
                        searchResultEl.find('ul.mail_folder').append(folders.join(''));
                    
	                }else{
	                    var list = searchResultEl.find('ul.mail_folder'),
	                    rendered = nullTpl.render({
	                        'msg_no_search_result': approvalLang["자료가 없습니다"]
	                    });
	                    list.empty();
	                    list.html(rendered);                    	
	                }
                }, this));
            },
            
            
            /**
             * 노드 선택시 호출되는 콜백메서드의 기본값 입니다.
             */
            selectCallback: function() {
                console.log("아무런 selectCallback도 지정되지 않았습니다.");
            },
            
            /**
             * 현재 선택된 노드의 데이터를 반환합니다.
             * 
             * @returns id: 노드 아이디값, el: 노드 엘리먼트, type: 노드의 종류, children: 자식 노드 정보(배열)
             * 
             */
            getSelectedNodeData: function(selected) {
                selected = selected || this._getTreeElement().jstree('get_selected');
                if (!selected || selected.length == 0 || !selected.data()) {
                    return {};
                }
                
                var data = _.extend(selected.data(), {
                    el: selected,
                    type: selected.find('a:eq(0)').attr('rel')
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
            
            _renderTemplate: function() {
            	var lang = {
            			placeholder : approvalLang['전사 문서함']
            	};
            	
                var htmls = [
                    '<section class="search">',
                    '    <div class="search_wrap">',
                    '        <input id="' + this.options.searchInputId + '" class="search" maxlength="15"  type="text" placeholder="{{lang.placeholder}}">',
                    '        <input class="btn_search" type="button"  value="{{lang.search}}" title="{{lang.search}}" evt-rol="mail-search">',
                    '    </div>',
                    '    <div id="detailSearchLayerWrap" style="position:relative;display:none;z-index:60"></div>',
                    '</section>',
                    '<div class="content_tab_wrap">',
                    '<div id="' + this.options.treeElId + '" class="jstree jstree-0 jstree-focused jstree-default">',
                    '</div>',
                    '<div id="' + this.options.searchResultElId + '"  style="min-height: ' + this.css.minHeight + 'px; max-height: ' + this.css.maxHeight + 'px; display: none;">',
                    '    <div class="jstree jstree-default" style="border-bottom:1px dashed #c8c8c8;margin:5px;display:block">',
                    '        <ul class="mail_folder"></ul>',
                    '    </div>',
                    '</div>',
                    '</div>'
                ];

                var compiled = Hogan.compile(htmls.join(''));
                $('#' + this.options.elId).html(compiled.render({ lang: lang }));
                $('#' + this.options.elId).find('input[placeholder]').placeholder();
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
                if (!selectedData['id']) {
                    $.goMessage(lang['select_folder']);
                    return false;
                }
                
                if (selectedData['type'] == 'ROOT') {
                    $.goMessage(lang['cannot_delete_root']);
                    return false;
                }
                
                if (!_.isEmpty(selectedData['children'])) {
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
            	this._bindEvents();
                this._renderTemplate();
                this._loadJsTree();
                
            },
            _loadJsTree :function(){
            	
                var self = this;
                this.treeEl = this._getTreeElement().jstree({
                    'plugins' : [ 'themes', 'json_data', 'crrm', 'ui', 'dnd', 'types' ],
                    'core' : { 'animation' : 120 },
                    'json_data' : {
                        'ajax' : {
                            "url" : self._getCommonUrl(),
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
                            "async" : true,
                            "success" : function(data) {
                                // Nothing..
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
                             'noAuth' : {
                                 'max_depth' : 10,
                                 "select_node" : false,
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
                    this.treeEl.bind("create.jstree", $.proxy(self._onJstreeCreate, self))
                    .bind("rename.jstree", $.proxy(self._onJstreeRename, self))
                    .bind("move_node.jstree", $.proxy(self._onJstreeMove, self))
                    .bind("remove.jstree", $.proxy(self._onJstreeRemove, self));
                }
            
            	
            },
                
            
            _getTreeElement: function() {
                return $('#' + this.treeElId);
            },
            
    		_getCommonUrl: function() {
    			if(!_.isEmpty(this.apiCommonUrl)){
    		        return GO.contextRoot + this.apiCommonUrl;				
    			}else{
    			    if (this.isAdmin) {
    			        return GO.contextRoot + 'ad/api/approval/manage/companyfolder';
    			    } else {
    			        return GO.contextRoot + 'api/approval/companyfolder/tree';
    			    }				
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
             //   this.treeEl.find('a[rel="ROOT"]').trigger('click');
            	$.jstree._reference(this.treeEl).open_all();
            },
            
            _onLoadNode: function( node , success_callback , error_callback ) {
                this.treeEl.find('a[href="#"]').attr('data-bypass', 1);
                this.treeEl.find('li').each(function(k, v){
                	if(!$(v).data('auth')) {
                		$(v).attr('rel', 'noAuth').find('a').eq(0).addClass('disable');
                	}
                });
            },

            /**
             * Jstree의 한 노드(폴더)가 선택된 경우의 콜백
             * 
             * @param e
             * @param data
             */
            _onSelectNode: function(e, data) {
            	var selectedData = this.getSelectedNodeData($(data.rslt.obj[0]));
                if (selectedData && _.isFunction(this.selectCallback)) {
                        this.selectCallback(selectedData);
                }
                data.inst.toggle_node(data.rslt.obj[0]);
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
                        parentId: this.getSelectedNodeData()['id']
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
                        $.goMessage(lang['save_success']);
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
            
            _onJstreeMove: function(e, data) {
                var targetParent = data.inst._get_parent(data.rslt.o),
                    targetId = data.rslt.o.data('id'),
                    param = {
                        parentId : targetParent.data('id'),
                        seq : data.rslt.cp
                    }; 
                
                $.go(this._getCommonUrl() + '/' + targetId + '/move', JSON.stringify(param), {
                    qryType : 'PUT',
                    contentType : 'application/json',
                    responseFn : function(rs) {
                        if(rs.code == 200) {
                            this._getTreeElement().jstree('refresh', targetParent);
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
                    responseFn : $.proxy(function(rs) {
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
            },
            
            /**
             * 특정 검색 결과의 선택된 노드 데이터를 GO에서 필요한 형태로 가공하여 반환한다.
             * 
             * @param selectedObj
             * @returns data
             */
            _processSearchData : function(selectedObj) {
                var data = {};
                
                data = {
                    'id' : selectedObj.data('id'),
                    'title' : selectedObj.data('title'),
                    'name' : selectedObj.find('a').text()
                };

                
                return data;
            }
        });
        

        return ApprFormSearchTreeView;
    });
}).call(this);