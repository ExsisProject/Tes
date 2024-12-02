define('docs/views/select_folder_popup', function(require) {

    var $ = require('jquery');
    var Backbone = require('backbone');
    var GO = require('app');

    var DocFolderList = require('docs/collections/doc_folder_infos');
    var DocsTreeMenuView = require('docs/views/docs_tree_menu');
    var renderDocsTreeMenuTpl = require('hgn!docs/templates/docs_tree_menu');
    var Hogan = require('hogan');
    
    var commonLang = require("i18n!nls/commons");
    var docsLang = require('i18n!docs/nls/docs');

    var tpl = Hogan.compile(
        '<section id="selectDocFolders" class="lnb">' +
            '<ul class="side_depth">'+
            '</ul>' + 
        '</section>'
    );

    var SelectFolderPopup = Backbone.View.extend({

        events : {
            "click a.node-value" : "folderSelect",
            "click #toggleFolder" : "toggleFolder"
        },

        initialize: function (options) {
            this.docFolderList = new DocFolderList();
            this.options = options || {};
            this.popupType = this.options.popupType ? this.options.popupType : "";
        },

        render: function(){
            this.$el.html(tpl.render());
        },

        renderList: function(){
            this.render();
            return $.when(
                this.docFoldersRender()
            ).done($.proxy(function() {
                $(".list_wrap").append(this.$el);
            }, this));
        },
        docFoldersRender: function() {

            var self = this;
            var $section = this.$el.find('#selectDocFolders');
            var $container = $section.find('ul:first');
            var elBuff = [];

            $container.empty();

            this.docFolderList.comparator = 'seq';
            return this.docFolderList.fetch({
                success : function(collection){

                	if (collection.length == 0) {
                		$(".list_wrap").remove();
                		var tmpl = '<p class="add" style="color: #999;text-align: center;">' + docsLang["등록 가능한 문서함이 없습니다."] + '</p>'
                		$(".content").append(tmpl);
                		$(".btn_layer_wrap .btn_minor_s").text(commonLang["닫기"]);
                	}else{
                		var folderList = new DocFolderList();

                        collection.each(function(model) {
                            if(folderList.get(model)){
                                folderList.get(model).attributes = model.attributes
                            }else{
                                folderList.push(model);
                            }
                            model.attributes.parent  = _.sortBy(model.attributes.parent, 'depth');
                            var parentId = 0;
                            for(var i = 0; i < model.getParent().length; i++){
                                if(i > 0){
                                    model.getParent()[i].parentId = parentId;
                                }
                                folderList.push(folderList.getExistModel(model.getParent()[i]));
                                parentId = model.getParent()[i].id;
                            }
                        });

                        _.each(folderList.getRootFolders(), function(rootFolder){
                            var $nodeLi = renderDeptBoardTree(rootFolder, folderList.getEveryChildrenFolder(rootFolder.id));
                            if($nodeLi) {
                                elBuff.push($nodeLi);
                            }
                        });

                        $container.append.apply($container, elBuff);
                	}
                }
            });

            function renderDeptBoardTree(folderModel, treeNodes) {
                var $nodeLi;

                // 멀티컴퍼니인 경우에 대비해서 company id까지 포함한다.
                var menuId = ['company', GO.session('companyId'), 'selectDocs'].join('.');
                var boardTreeView = self._renderMenuTree(folderModel.id, treeNodes, menuId);
                $nodeLi = $(self.renderBoardTreeMenuNode({
                    "nodeId": folderModel.id,
                    "nodeType": 'FOLDER',	// 가상의 타입을 준다.
                    "nodeValue": folderModel.getName(),
                    "isDeleted" : folderModel.attributes.state ? folderModel.attributes.state != "NORMAL" : false,
                    "hasChild" : treeNodes.length > 0,
                    "close" : true,
                    "isNew" : false,
                    "iconType": 'folder',
                    "isMovePopup" : this.popupType == "move" ? true : false,
                    "managable": false
                }));
                $nodeLi.append(boardTreeView.el);

                return $nodeLi;
            }
        },

        getStoredCategoryIsOpen: function(storeKey) {
            var savedCate = GO.util.store.get(storeKey);

            if(_.isUndefined(savedCate)){
                savedCate = true;
            }

            return savedCate;
        },

        toggleFolder : function(e){
            var currentTarget = $(e.currentTarget),
                id = currentTarget.parent().find("a").attr("data-id"),
                title = currentTarget.parent().find("a").attr("title");
            var isOpen = currentTarget.hasClass("close");

            if(isOpen){
                currentTarget.removeClass("close").addClass("open");
                currentTarget.parent().next('ul').hide();
            }else{
                currentTarget.removeClass("open").addClass("close");
                currentTarget.parent().next('ul').show();
            }
        },

        _renderMenuTree: function(folderId, treeNodes, menuId) {
            var treeMenuView = new DocsTreeMenuView({
                "nodes": treeNodes,
                "menuId": menuId,
                "parentId" : folderId,
                "useNew" : false,
                "useOpen" : false
            });
            treeMenuView.render();
            return treeMenuView;
        },

        renderBoardTreeMenuNode: function() {
    		return renderDocsTreeMenuTpl.apply(undefined, arguments);
        },

        folderSelect : function(e){
            var currentTarget = $(e.currentTarget);
            if(!this.docFolderList.isAccessFolder(currentTarget.attr('data-id'))){
                $.goMessage(commonLang["권한이 없습니다."]);
                return;
            }
            
            var folderData = this.docFolderList.findFolderModel(currentTarget.attr('data-id'));
            $("#docsPath").trigger("docsFolder:select", folderData);
            
            if(this.popupType == "move"){
    			var targetFolderId = currentTarget.attr('data-id');
    			var self = this;
    			$.ajax({
                    type : "GET",
                    dataType : "json",
                    url : GO.config('contextRoot') + 'api/docs/folder/'+ targetFolderId +'/move/available',
                    success : function(resp) {
                    	if(resp.code != 200){
                    		$.goMessage(docsLang["승인문서함이동설명"]);
                        	return;
                    	}else{
                    		var selectedEl = $(e.currentTarget).parents('p.folder');
                        	self.$el.find('.on').removeClass('on');
                        	selectedEl.addClass('on');
                    	}
                    }
                });
            }
        }

    });

    return SelectFolderPopup;
});