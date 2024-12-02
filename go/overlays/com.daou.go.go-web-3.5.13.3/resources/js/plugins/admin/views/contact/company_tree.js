define(function (require) {
    var GO = require("app");
    var Backbone = require("backbone");
    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");
    var DocsLang = require("i18n!docs/nls/docs");

    var Template = require("hgn!admin/templates/contact/company_tree");

    var FolderTree = require("approval/views/apprform/admin_company_folder_tree");

    require("jquery.go-orgslide");

    var lang = {
        "추가": CommonLang["추가"],
        "삭제": CommonLang["삭제"],
        "주소록 이름" : AdminLang["주소록 이름"]
    };

    var isSiteAdmin = true;

    var CompanyTree = Backbone.View.extend({

        maxDepth : 10,
        maxChildren : 1000,

        className : "col1",

        events : {
            "click #add" : "add",
            "click #remove" : "remove"
        },

        initialize : function (options) {
            this.treeView = null;
            this.isAdmin = options.isAdmin;
            isSiteAdmin = _.isUndefined(options.isSiteAdmin) ? isSiteAdmin : options.isSiteAdmin;
        },

        render : function () {
            this.$el.html(Template({
                lang: lang,
                isNotSelected: true
            }));

            this.renderTree();
            return this;
        },

        renderTree : function () {
            this.treeView = new FolderTreeView({
                maxDepth : this.maxDepth,
                maxChildren : this.maxChildren,
                isAdmin: this.isAdmin,
                isSideAdmin : true,
                treeElementId: 'contact_tree',
                selectCallback: $.proxy(function(data) {
                    this.$('.tb_wrap');
                    if(data.type == 'root'){
                        this.trigger("company_tree.empty");
                    }else{
                        this.trigger("company_tree.detail", data['id'])
                    }
                }, this)
            });

            this.treeView.render();
        },

        add : function () {
            $.goOrgSlide('close');
            this.treeView.renderNewFolderInput(lang['주소록 이름']);
        },

        remove : function () {
            var deferred = this.treeView.deleteSelectedFolder();
            deferred.done($.proxy(function(){
                this.trigger("company_form.refresh");
            }, this));
        }
    });

    var FolderTreeView = FolderTree.extend({

        _getCommonUrl: function() {
            if (isSiteAdmin) {
                return GO.contextRoot + 'ad/api/contact/companyfolder/manage';
            } else {
                return GO.contextRoot + 'api/contact/companyfolder/manage';
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
                adminNodes = getNodes(this.getSelectedNodeData()['admins']),
                accessTargetNodes = getNodes(this.getSelectedNodeData()['accessTarget']),
                exceptionTargetNodes = getNodes(this.getSelectedNodeData()['exceptionTarget']),
                saveParam = {
                    name : $.trim(addData.name),
                    parentId: this.getSelectedNodeData()['id'],
                    admins : {nodes: adminNodes},
                    accessTarget : {nodes: accessTargetNodes},
                    exceptionTarget :{nodes: exceptionTargetNodes},
                    seq : addData.position
                };
            var self = this;
            var targetParent = data.inst._get_node(data.rslt.o);

            if ( !_.isEmpty(saveParam.name) && !$.goValidation.isCheckLength(2,20,saveParam.name))   {
                this._getTreeElement().jstree('refresh', targetParent);
                $.goError(GO.i18n(DocsLang["0은 0자이상 0자이하 입력해야 합니다."], {"arg0":lang['주소록 이름'], "arg1":"2","arg2":"64"}));
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


    return CompanyTree;
});