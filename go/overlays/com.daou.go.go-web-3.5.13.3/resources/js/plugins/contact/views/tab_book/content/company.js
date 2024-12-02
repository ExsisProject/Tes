/**
 * 전사 주소록 Side + Detail View
*/
;define(function (require) {
    var GO = require("app");

    var GroupTpl = require("hgn!contact/templates/tab_book/connector_group");

    var FolderTree = require("approval/views/apprform/admin_company_folder_tree");
    var ContactDetailView = require("contact/views/tab_book/detail/contact");
    var InitialView = require("contact/views/tab_book/toolbar/initial_bar");

    require("jquery.jstree");
    require("jquery.go-sdk");

    var CompanyContactView = Backbone.View.extend({
        type : "COMPANY",

        initialize: function (options) {
            this.detailView = new ContactDetailView({type: this.type, mode : options.mode});
            this.companySideView = new CompanySideView();
            this.initialView = new InitialView();

            this.initialView.on("click.initialWord", $.proxy(function (initial) {
                this.detailView.refresh({initial : initial});
            }, this));

            this.companySideView.on("click.companySideView", $.proxy(function (options) {
                this.detailView.refresh({groupId: options.groupId, type: this.type});
                this.initialView.show();
                this.initialView.reset();
            }, this));

            this.detailView.on("detail.search", $.proxy(function(){
                this.initialView.hide();
            }, this));
        },

        render: function () {
            this.$el.html(GroupTpl());
            var $contactWrap = this.$el.find("#contactWrap");

            $contactWrap.append(this.companySideView.el);
            $contactWrap.append(this.detailView.el);
            this.$el.append(this.initialView.el);

            this.companySideView.render();
            this.detailView.render();
            this.initialView.render();
        },

        getSelectedGroup : function(){
            return this.companySideView.getSelectedGroup();
        },

        getSelectedUsers : function(){
            return this.detailView.getSelectedUsers();
        }
    });

    var CompanyTreeView = FolderTree.extend({
        _getCommonUrl: function() {
            return GO.contextRoot + 'api/contact/companyfolder/manage';
        },

        _onSelectNode: function(e, data) {
            var $selectedNode = $(data.rslt.obj[0]);
            var selectedData = this.getSelectedNodeData($selectedNode);
            if (selectedData && selectedData.readable && _.isFunction(this.selectCallback)) {
                this.selectCallback(selectedData);
            }else{
                $selectedNode.find(".jstree-clicked").removeClass("jstree-clicked");
            }
            data.inst.toggle_node(data.rslt.obj[0]);
        }
    });

    var CompanySideView = Backbone.View.extend({
        className : "content_tab_wrap",

        template: "<div id='group-tree' style='height:350px' class='jstree jstree-default'><ul></ul></div>",

        initialize : function(){

        },

        render : function(){
            this.$el.html(this.template);
            this.renderTree();
        },

        renderTree : function(){
            this.treeView = new CompanyTreeView({
                maxDepth : this.maxDepth,
                maxChildren : this.maxChildren,
                isAdmin: false,
                dragable : false,
                treeElementId: 'group-tree',
                selectCallback: $.proxy(function(data) {
                    this.trigger("click.companySideView", {groupId : data['id']})
                }, this)
            });

            this.treeView.render();
        },

        getSelectedGroup : function(){
            var $selectedTree = this.$el.find("a.jstree-clicked").closest("li");
            var groupId  = $selectedTree.data("id");
            var groupName = $selectedTree.data("name");


            // 전체 주소록 클릭 후 그룹 추가 눌렀을 경우
            if(!groupId){
                throw new Error("not select group");
            }

            return {
                data : [{
                    dataId : groupId,
                    dataName : groupName
                }],
                groupType : "GROUP"
            }
        }
    });

    return CompanyContactView;
});