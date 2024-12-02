(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "i18n!approval/nls/approval",
            "jquery.go-sdk",
            "jquery.jstree",
            "jquery.go-validation"
        ],
        function (
            $,
            Backbone,
            App,
            commonLang,
            adminLang,
            approvalLang
        ) {

            var lang,
                FormTreeException,
                ApprFormTreeView;

            lang = {
                'folder_name': adminLang["폴더명"],
                'select_folder': adminLang["폴더를 선택해 주십시오."],
                'cannot_update': adminLang["최상위 폴더를 수정할 수 없습니다."],
                'cannot_delete': adminLang["삭제할 수 없습니다."],
                'cannot_delete_root': commonLang["최상위 폴더는 삭제할 수 없습니다."],
                'cannot_delete_parent': adminLang["하위 폴더가 있는 경우는 삭제할 수 없습니다."],
                'folder_add': adminLang["폴더 추가"],
                'folder_modify': commonLang["수정"],
                'folder_delete': commonLang["삭제"],
                'folder_delete_message': adminLang["폴더 삭제"],
                'folder_delete_confirm': adminLang["폴더를 삭제하시겠습니까? 해당 폴더내의 문서는 지워집니다"],
                'selected_folder': adminLang["선택된 폴더"],
                'save_success': commonLang['저장되었습니다.'],
                'already_used_name': adminLang["이미 사용중인 이름입니다."],
                'name_invalid_character': adminLang['유효하지 않은 문자열 입니다.'],
                'name_invalid_length': adminLang['제목은 20자까지 입력할 수 있습니다.']
            };

            FormTreeException = function (message) {
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
                parentNodes: [],
                maxDepth: 10,
                maxChildren: -1,
                dragable: true,

                /**
                 * 초기화
                 *  @treeElementId: 트리를 그려 붙여 놓을 대상 엘리먼트 아이디이며, #값을 제외하고 이름만 전달합니다.
                 *  @selectCallback: 노드 선택시 호출되는 콜백입니다.
                 *  @isAdmin: 어드민인지 여부이며, 이에 따라 호출 URL이 달라집니다. 기본값은 false.
                 */
                initialize: function (options) {
                    this.options = options || {};
                    if (_.isString(this.options.treeElementId)) {
                        this.treeElementId = this.options.treeElementId;
                    }
                    if (_.isString(this.options.apiCommonUrl)) {
                        this.apiCommonUrl = this.options.apiCommonUrl;
                    }
                    if (_.isFunction(this.options.selectCallback)) {
                        this.selectCallback = this.options.selectCallback;
                    }
                    if (_.isBoolean(this.options.isAdmin)) {
                        this.isAdmin = this.options.isAdmin;
                    }
                    if (_.isNumber(this.options.maxDepth)) {
                        this.maxDepth = this.options.maxDepth;
                    }
                    if (_.isNumber(this.options.maxChildren)) {
                        this.maxChildren = this.options.maxChildren;
                    }
                    if (_.isBoolean(this.options.dragable)) {
                        this.dragable = this.options.dragable;
                    }
                    if (_.isNull(this.treeElementId)) {
                        throw new FormTreeException("옵션:treeElementId이 필요합니다.");
                    }
                },

                /**
                 * 노드 선택시 호출되는 콜백메서드의 기본값 입니다.
                 */
                selectCallback: function () {
                    console.log("아무런 selectCallback도 지정되지 않았습니다.");
                },

                /**
                 * 현재 선택된 노드의 데이터를 반환합니다.
                 *
                 * @returns id: 노드 아이디값, el: 노드 엘리먼트, type: 노드의 종류, children: 자식 노드 정보(배열)
                 *
                 */
                getSelectedNodeData: function (selected) {
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


                /***
                 * 부모 노드까지의 텍스트 값을 구한다.
                 * @returns {String}
                 */

                getFullPathName: function () {
                    var selected = this._getTreeElement().jstree('get_selected');
                    var targetNode = this._getTreeElement().find('a[nodeid=' + selected.data().id + ']').closest('li');
                    var depth = $(targetNode).parentsUntil(this._getTreeElement()).filter('li').length;
                    var parentNames = [];
                    var fullPathName = '';
                    var pathTxt = '';

                    for (var i = 0; i < depth + 1; i++) {
                        pathTxt = $(targetNode).find('a').eq(0).text();
                        parentNames.push(pathTxt);
                        targetNode = $(targetNode).parent().closest('li');
                    }

                    var len = $(parentNames).length;
                    $($(parentNames).get().reverse()).each(function (k, v) {
                        if (k === len - 1) {
                            fullPathName += v;
                        } else {
                            fullPathName += v + " > ";
                        }
                    });

                    return fullPathName;
                },

                /**
                 * 폴더를 추가하는 화면을 구성합니다. (어드민만 가능)
                 * @param inputName
                 */
                renderNewFolderInput: function (inputName) {
                    if (!this.isAdmin) {
                        return false;
                    }

                    var node = this.getSelectedNodeData()['el'];
                    this._getTreeElement().jstree('create', node, 'last', {
                        data: inputName || lang['folder_name']
                    });
                },

                /**
                 * 폴더를 수정하는 화면을 구성합니다. (어드민만 가능)
                 * @returns {Boolean}
                 */
                renderRenameFolderInput: function () {
                    if (!this.isAdmin) {
                        return false;
                    }

                    var selectedData = this.getSelectedNodeData();
                    if (!selectedData['id']) {
                        $.goError(lang['select_folder']);
                        return false;
                    }

                    if (selectedData['type'] == 'ROOT') {
                        $.goError(lang['cannot_update']);
                        return false;
                    }

                    this._getTreeElement().jstree('rename');
                    this._getTreeElement().find('.jstree-clicked').css({'background': 'transparent', 'border': 0});
                    this._getTreeElement().find('input.jstree-rename-input').css({'left': '20px', 'top': '2px'});
                },

                /**
                 * 폴더를 삭제합니다. (어드민만 가능)
                 * @returns {Boolean}
                 */
                deleteSelectedFolder: function () {

                    var deferred = $.Deferred();

                    try {
                        validate.call(this);
                    } catch (e) {
                        return deferred;
                    }

                    $.goCaution(lang['folder_delete_message'], lang['folder_delete_confirm'], $.proxy(function () {
                        this._getTreeElement().jstree('remove');
                        deferred.resolve();
                    }, this));

                    return deferred;

                    function validate() {
                        if (!this.isAdmin) {
                            throw new Error();
                        }

                        var selectedData = this.getSelectedNodeData();
                        if (!selectedData['id']) {
                            $.goError(lang['select_folder']);
                            throw new Error();
                        }

                        if (selectedData['type'] == 'ROOT' || selectedData['type'] == 'root') {
                            $.goError(lang['cannot_delete_root']);
                            throw new Error();
                        }

                        var tree = jQuery.jstree._reference($(this._getTreeElement()));
                        var selected = $(this._getTreeElement()).jstree('get_selected');
                        var children = tree._get_children(selected);

                        if (children.length > 0) {
                            $.goError(lang['cannot_delete_parent']);
                            throw new Error();
                        }
                    }
                },

                /**
                 * 양식 트리를 렌더합니다.
                 */
                render: function () {
                    var self = this;
                    var plugins = ['themes', 'json_data', 'crrm', 'ui', 'types'];
                    if (this.dragable) {
                        plugins.push('dnd')
                    }

                    this.treeElement = this._getTreeElement().jstree({
                        'plugins': plugins,
                        'core': {'animation': 120},
                        'json_data': {
                            'ajax': {
                                'url': self._getCommonUrl(),
                                'data': function (n) {
                                    var data = null;
                                    if (typeof n.data == 'function') {
                                        data = n.data();
                                    }
                                    return {
                                        folderId: data ? data.id : self.loadId
                                    };
                                },
                                'cache': true,
                                'async': true,
                                'success': function (data) {
                                    // Nothing..
                                }
                            }
                        },
                        'defaults ': {
                            'html_titles': false,
                            'move_node': false,
                            'ccp': true,
                            'width': 200
                        },
                        'ui': {
                            'select_multiple_modifier': false,
                            'select_limit': 1
                        },
                        'types': {
                            'valid_children': ["ROOT"],
                            'start_drag': false,
                            'move_node': false,
                            'delete_node': false,
                            'remove': false,
                            'types': {
                                'default' : {
                                    'max_depth': this.maxDepth,
                                    'max_children': this.maxChildren
                                },
                                'root': {
                                    'valid_children': self._getValidChildrenOfFolder(),
                                    'start_drag': false,
                                    'move_node': false,
                                    'delete_node': false,
                                    'remove': false
                                },
                                'normal': {
                                    'max_depth': 10,
                                    'max_children': -1,
                                    'valid_children': self._getValidChildrenOfFolder(),
                                    'start_drag': this.dragable,
                                    'move_node': this.dragable,
                                    'delete_node': this.dragable,
                                    'remove': this.dragable
                                }
                            }
                        }
                    })
                        .bind("loaded.jstree", $.proxy(self._onLoaded, self))
                        .bind("load_node.jstree", $.proxy(self._onLoadNode, self))
                        .bind("select_node.jstree", $.proxy(self._onSelectNode, self));

                    if (this.isAdmin) {
                        this.treeElement.bind("create.jstree", $.proxy(self._onJstreeCreate, self))
                            .bind("move_node.jstree", $.proxy(self._onJstreeMove, self))
                            .bind("remove.jstree", $.proxy(self._onJstreeRemove, self));
                    }
                },

                _getTreeElement: function () {
                    return $('#' + this.treeElementId);
                },

                _getCommonUrl: function () {

                    if (!_.isEmpty(this.apiCommonUrl)) {
                        return GO.contextRoot + this.apiCommonUrl;
                    } else {
                        if (this.isAdmin) {
                            return GO.contextRoot + 'ad/api/approval/manage/companyfolder';
                        } else {
                            return GO.contextRoot + 'api/approval/companyfolder/tree';
                        }
                    }

                },

                _getValidChildrenOfFolder: function () {
                    var types = ["normal"];
                    types.push("FORM");
                    return types;
                },

                _onLoaded: function () {
                    this.treeElement.find('a[rel="ROOT"]').trigger('click');
                },

                _onLoadNode: function (node, success_callback, error_callback) {
                    this.treeElement.find('a[href="#"]').attr('data-bypass', 1);
                },

                /**
                 * Jstree의 한 노드(폴더)가 선택된 경우의 콜백
                 *
                 * @param e
                 * @param data
                 */
                _onSelectNode: function (e, data) {

                    var selectedData = this.getSelectedNodeData($(data.rslt.obj[0]));
                    if (selectedData && _.isFunction(this.selectCallback)) {
                        this.selectCallback(selectedData);
                    }
                    data.inst.toggle_node(data.rslt.obj[0]);
                },

                /**
                 * 폴더 추가시 중복 텍스트 방지
                 * @param data
                 * @returns {Boolean}
                 */
                _checkUniqueTextOnCreate: function (data) {
                    var addData = data.rslt,
                        saveParam = {
                            name: $.trim(addData.name),
                        };

                    var p = data.inst._get_children(data.rslt.o);
                    var childCount = 0;
                    p.children('a').each(function () {
                        if ($.trim($(this).text()) == saveParam.name) {
                            childCount++;
                        }
                    });
                    if (childCount > 1) {
                        return false;
                    }
                    return true;
                },

                /**
                 *  폴더 이동시 중복 텍스트 방지
                 * @param data
                 * @returns {Boolean}
                 */
                _checkUniqueTextOnMove: function (data) {
                    var name = data.inst._get_node(data.rslt.o).data('name');
                    var p = data.inst._get_node(data.rslt.o);
                    var childCount = 0;
                    p.closest('ul').find('> li > a').each(function () {
                        if ($.trim($(this).text()) == name) {
                            childCount++;
                        }
                    });
                    if (childCount > 1) {
                        return false;
                    }
                    return true;
                },

                /**
                 * 폴더 정보변경시 중복이름 방지
                 */

                _checkUniqueTextOnRename: function (newName) {

                    var o = this._getTreeElement().jstree('get_selected');
                    var o_id = o.data('id');
                    var childCount = 0;
                    o.closest('ul').find('> li > a').each(function () {
                        if ($.trim($(this).text()) == $.trim(newName) && $(this).attr('nodeid') != o_id) {
                            childCount++;
                        }
                    });
                    if (childCount > 0) {
                        return false;
                    }
                    return true;
                },

                /**
                 * 선택된 폴더의 하위폴더가 있는지 체크한다.
                 *
                 * @param e
                 * @param data
                 * @returns {Boolean}
                 */
                hasChildrenFolder: function () {
                    var tree = jQuery.jstree._reference($(this._getTreeElement()));
                    var selected = $(this._getTreeElement()).jstree('get_selected');
                    var children = tree._get_children(selected);
                    return (children.length > 0) ? true : false;
                },

                /**
                 * Jstree create 콜백. 실제 폴더를 저장하는 API 통신 수행한다.
                 *
                 * @param e
                 * @param data
                 * @returns {Boolean}
                 */
                _onJstreeCreate: function (e, data) {
                    var addData = data.rslt,
                        saveParam = {
                            name: $.trim(addData.name),
                            state: 'HIDDEN', //default state
                            parentId: this.getSelectedNodeData()['id'],
                            desc: $.trim(addData.name),
                            seq: addData.position
                        };
                    var self = this;
                    var targetParent = data.inst._get_node(data.rslt.o);
                    var isUniquedName = this._checkUniqueTextOnCreate(data);
                    if (!isUniquedName) {
                        $.goError(lang['already_used_name']);
                        this._getTreeElement().jstree('refresh', targetParent);
                        return false;
                    }

                    if (!_.isEmpty(saveParam.name) && !$.goValidation.isCheckLength(2, 100, saveParam.name)) {
                        this._getTreeElement().jstree('refresh', targetParent);
                        $.goError(App.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1: 2, arg2: 100}));
                        return false;
                    }

                    if (saveParam.name == lang['folder_name'] || saveParam.name == '') {
                        this._getTreeElement().jstree('refresh', targetParent);
                        return false;
                    }

                    $.go(this._getCommonUrl(), JSON.stringify(saveParam), {
                        contentType: 'application/json',
                        responseFn: function (rs) {
                            self._getTreeElement().jstree('refresh', targetParent);
                        },
                        error: function (error) {
                            if (data.rlbk) {
                                $.jstree.rollback(rlbk);
                            }
                        }
                    });
                },

                _onJstreeMove: function (e, data) {
                    if (!data.rslt.o.data('id')) {
                        $.jstree.rollback(data.rlbk);
                    }
                    var targetParent = data.inst._get_parent(data.rslt.o),
                        targetId = data.rslt.o.data('id'),
                        param = {
                            parentId: targetParent.data('id'),
                            seq: data.rslt.o.index()
                        };
                    var isUniquedName = this._checkUniqueTextOnMove(data);
                    if (!isUniquedName) {
                        $.goError(lang['already_used_name']);
                        $.jstree.rollback(data.rlbk);
                        return false;
                    }

                    $.go(this._getCommonUrl() + '/' + targetId + '/move', JSON.stringify(param), {
                        qryType: 'PUT',
                        contentType: 'application/json',
                        responseFn: function (rs) {
                            if (rs.code == 200) {
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
                _onJstreeRemove: function (e, data) {
                    var selected = $(data.rslt.obj[0]);
                    $.go(this._getCommonUrl() + '/' + selected.data()['id'], {}, {
                        qryType: 'POST',
                        contentType: 'application/json',
                        responseFn: $.proxy(function (rs) {
                            var parentNode = selected.parents('li:eq(0)');
                            this._getTreeElement().jstree('select_node', parentNode);
                        }, this),
                        error: $.proxy(function (err) {
                            $.goError(lang['cannot_delete']);
                            if (data.rlbk) {
                                $.jstree.rollback(data.rlbk);
                            }

                        }, this)
                    });
                }


            });

            return ApprFormTreeView;
        });
}).call(this);