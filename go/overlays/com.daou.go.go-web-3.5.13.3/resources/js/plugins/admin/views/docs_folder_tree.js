define('admin/views/docs_folder_tree', function(require) {
    var App = require('app');
    var folderTree = require("approval/views/apprform/admin_company_folder_tree");
    var docsLang = require("i18n!docs/nls/docs");
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");

    var lang = {
        'folder_name': commonLang["폴더명"],
        'already_used_name' : adminLang["이미 사용중인 이름입니다."],
        'cannot_delete' : adminLang["삭제할 수 없습니다."]
    };
    var DocsFolderTree = folderTree.extend({

        _getCommonUrl: function() {

            if (this.isAdmin) {
                return GO.contextRoot + 'ad/api/docs/companyfolder';
            } else {
                return GO.contextRoot + 'ad/api/docs/companyfolder';
            }

        },
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
                    $.goError(lang['cannot_delete']);
                    if(data.rlbk) {
                        $.jstree.rollback(data.rlbk);
                    }

                }, this)
            });
        },

        _onJstreeCreate : function(e, data) {
            var addData = data.rslt,
                adminNodes = getNodes(this.getSelectedNodeData()['admin']),
                accessTargetNodes = getNodes(this.getSelectedNodeData()["accessTarget"]),
                exceptionTarget = getNodes(this.getSelectedNodeData()["exceptionTarget"]),
                saveParam = {
                    name : $.trim(addData.name),
                    docYear : 5,
                    state : 'NORMAL',
                    parentId: this.getSelectedNodeData()['id'],
                    desc : $.trim(addData.name),
                    admin : {nodes: adminNodes},
                    accessTarget : {nodes: accessTargetNodes},
                    exceptionTarget :{nodes: exceptionTarget},
                    seq : addData.position
                };
            var self = this;
            var targetParent = data.inst._get_node(data.rslt.o);
            /*var isUniquedName = this._checkUniqueTextOnCreate(data);
             if(!isUniquedName){
             $.goError(lang['already_used_name']);
             this._getTreeElement().jstree('refresh', targetParent);
             return false;
             }*/

            if ( !_.isEmpty(saveParam.name) && !$.goValidation.isCheckLength(2,100,saveParam.name))   {
                this._getTreeElement().jstree('refresh', targetParent);
                $.goError(App.i18n(docsLang["0은 0자이상 0자이하 입력해야 합니다."], {"arg0":docsLang["문서함 이름"], "arg1":"2","arg2":"100"}));
                return false;
            }

            if(saveParam.name == lang['folder_name'] || saveParam.name == '') {
                this._getTreeElement().jstree('refresh', targetParent);
                return false;
            }

            $.go(this._getCommonUrl(), JSON.stringify(saveParam), {
                contentType: 'application/json',
                responseFn : function(rs) {
                    self._getTreeElement().jstree('refresh', targetParent);
                },
                error : function(error) {
                    if(data.rlbk) {
                        $.jstree.rollback(rlbk);
                    }
                }
            });

            function getNodes(nodeData){
                var convertedNodes = [];

                if(_.isUndefined(nodeData)){
                    return convertedNodes;
                }

                _.each(nodeData['nodes'], function(node){
                    var convertedNode = _.pick(node, function(value, key){
                        return key != "id";
                    });
                    convertedNodes.push(convertedNode);
                });
                return convertedNodes;
            }
        }

    });

    return DocsFolderTree;
});