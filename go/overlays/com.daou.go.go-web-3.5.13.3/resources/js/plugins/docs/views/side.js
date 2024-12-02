define('docs/views/side', function(require) {
	
	// dependency
    var $ = require('jquery');
    var Backbone = require('backbone');
    var when = require('when');
    var GO = require('app');

    var DocFolderList = require('docs/collections/doc_folder_infos');
	
    var SideTmpl = require('hgn!docs/templates/side');
    var renderDocsTreeMenuTpl = require('hgn!docs/templates/docs_tree_menu');

    var DocsTreeMenuView = require('docs/views/docs_tree_menu');
    var FavoriteView = require("favorite");

    var commonLang = require("i18n!nls/commons");
    var docsLang = require('i18n!docs/nls/docs');

    var DOCS_STORE_KEY = GO.session("loginId") + '-docs-approval-toggle';

    var tplVar = {
        'collapse' : commonLang['접기'],
        'expand' : commonLang['펼치기'],
        'folder' : docsLang['문서함'],
        'addDocs' : docsLang['문서 등록'],
        'latestRead' : docsLang['최근 열람 문서'],
        'latestUpdate' : docsLang['최근 업데이트 문서'],
        'approveWaiting' : docsLang['승인 대기 문서'],
        'completeWaiting' : docsLang['등록 대기 문서']
        
    };
	return Backbone.View.extend({

		className: "go_side docs_side",
        events : {
            "click section.lnb span.docs.ic_side" : "slideToggle",
            "click section.lnb span.txt" : "slideToggle",
            "click #docsHome" : "goDocsHome",
            "click #addDocs" : "addDocs",
            "click a[data-navi]" : "goDocsList",
            "click a.node-value" : "showList",
            "click #toggleFolder" : "toggleFolder"
        },

		initialize: function () {
            this.docFolderList = new DocFolderList();
            this.appName = GO.util.getAppName("docs");
		},

		render: function () {
            var self = this;
            $.when(
                 self.getRegistwaiting(),
                 self.getApprovewaiting()
            ).done($.proxy(function() {
                this.$el.html(SideTmpl({
                	appName : self.appName,
                    isDocsOpen : self.getStoredCategoryIsOpen(DOCS_STORE_KEY),
                    lang : tplVar,
                    hasRegistwaiting : self.registwaitingCnt ? self.registwaitingCnt > 0 : false,
                    hasApprovewaiting : self.approvewaitingCnt ? self.approvewaitingCnt > 0 : false,
                    registwaitingCnt : self.registwaitingCnt,
                    approvewaitingCnt : self.approvewaitingCnt
                }));
                this.renderFavorite();
                this.docFoldersRender();
            }, this));
		},
		
		selectSideMenu : function(url) {
			var selectedEl = null, loadMenuArr = url.split('?')[0].split('/');
            var folderType = loadMenuArr[2];
            
            if(folderType == "latestread" || folderType == "latestupdate" || folderType == "approvewaiting" || folderType == "registwaiting") {
            	selectedEl = this.$el.find('ul.side_depth li a[data-navi="' + folderType + '"]');
            }else{
            	selectedEl = this.$el.find('ul.side_depth li a[data-id="' + folderType + '"]');
            }
            
            if (!_.isNull(selectedEl)) {
                selectedEl.parents('p:eq(0)').addClass('on');
                return true;
            }
            return false;
		},

        refreshWaitingCount: function(){
            var self = this;
            $.when(
                self.getRegistwaiting(),
                self.getApprovewaiting()
            ).done($.proxy(function() {
                this.registwaitingCnt > 0 ? $("#registwaitingCnt").show().empty().append(this.registwaitingCnt) : $("#registwaitingCnt").hide();
                this.approvewaitingCnt > 0 ? $("#approvewaitingCnt").show().empty().append(this.approvewaitingCnt) : $("#approvewaitingCnt").hide();
                self.selectSideMenu(GO.router.getUrl());
            }, this));
        },

        getRegistwaiting : function() {
            var self = this;
            var deferred = when.defer();
            return $.ajax({
                type : "GET",
                dataType : "json",
                url : GO.config('contextRoot') + 'api/docs/registwaiting/count',
                success : function(resp) {
                    deferred.resolve();
                    self.registwaitingCnt =  resp.data.count;
                },
                error : function(){
                    deferred.reject();
                    return 0;
                }
            });
        },

        getApprovewaiting : function() {
            var self = this;
            var deferred = when.defer();
            return $.ajax({
                type : "GET",
                dataType : "json",
                url : GO.config('contextRoot') + 'api/docs/approvewaiting/count',
                success : function(resp) {
                    deferred.resolve();
                    self.approvewaitingCnt = resp.data.count;
                },
                error : function(){
                    deferred.reject();
                    return 0;
                }
            });
        },

        renderFavorite : function() {
            var self = this;
            var favoriteView = FavoriteView.create({
                el : "#side_favorite",
                url : GO.config("contextRoot") + "api/docs/folder/favorite",
                type : "docs",
                liClass : "docs folder",
                link : function(model){
                    return "docs/folder/" + model.get("id");
                },
                overrideDataSet : function(model){
                    return {
                        id : model.get("id"),
                        name : model.get("name"),
                        newMark : self.isNew(model.get("lastDocsCompleteDate"))
                    };
                }
            });

            favoriteView.$el.on("refresh", function(){
                favoriteView.reload();
            });
            
            favoriteView.$el.on("changeFavorite", function(e, models){
            	var isFavoriteFolder = false;
				$.each(models, function(index, model){
				    if (model.get("id") == $("ins#favorite").attr('data-folder-id')) {
				        isFavoriteFolder = true;
				        return;
				    }
				});
				
				if (!isFavoriteFolder) {
					$("ins#favorite").addClass("ic_star_off").attr("value", false);
				}
            });
            
        },
        
        isNew : function(date) {
            return date ? GO.util.isCurrentDate(date, 1) : false;
        },

        docFoldersRender: function() {

            var self = this;
            var $section = $('#docFolders');
            var $container = $section.find('ul:first');
            var elBuff = [];

            //$container.empty();
            $section.show();

            this.docFolderList.comparator = 'seq';
            this.docFolderList.fetch({
                success : function(collection){

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
                    self.selectSideMenu(GO.router.getUrl());
                }
            });

            function renderDeptBoardTree(folderModel, treeNodes) {
                var $nodeLi;

                var isOpen = self.getStoredCategoryIsOpen(GO.session("loginId") + folderModel.id + folderModel.getName() +  '-docs-folder-toggle');
                // 멀티컴퍼니인 경우에 대비해서 company id까지 포함한다.
                var menuId = ['company', GO.session('companyId'), 'docs'].join('.');
                var boardTreeView = self._renderMenuTree(folderModel.id, treeNodes, menuId);
                $nodeLi = $(self.renderBoardTreeMenuNode({
                    "nodeId": folderModel.id,
                    "nodeType": 'FOLDER',	// 가상의 타입을 준다.
                    "nodeValue": folderModel.getName(),
                    "isDeleted" : folderModel.attributes.state ? folderModel.attributes.state != "NORMAL" : true,
                    "isAccessible" : this.isDeleted ? false : (folderModel.isReadable() ? folderModel.isReadable() : false),
                    "hasChild" : treeNodes.length > 0,
                    "close" : isOpen,
                    "isNew" : self.isNew(folderModel.get("lastDocsCompleteDate")),
                    "iconType": 'folder',
                    "managable": false,
                    "isWritable" : folderModel.isWritable()
                }));
                $nodeLi.append(boardTreeView.el);
                if(!isOpen){
                    boardTreeView.$el.hide();
                }
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

        renderBoardTreeMenuNode: function() {
            return renderDocsTreeMenuTpl.apply(undefined, arguments);
        },
        /**
         * 트리구조의 메뉴 렌더링
         */
        _renderMenuTree: function(folderId, treeNodes, menuId) {
            var treeMenuView = new DocsTreeMenuView({
                "nodes": treeNodes,
                "menuId": menuId,
                "parentId" : folderId
            });
            treeMenuView.render();
            return treeMenuView;
        },

        slideToggle : function(e) {
            var currentTarget = $(e.currentTarget),
                parentTarget = currentTarget.parents('h1:first'),
                toggleBtn = parentTarget.find('.ic_side'),
                self = this;

            parentTarget.next('ul').slideToggle("fast",
                function() {
                    if ($(this).css('display') == 'block') {
                        parentTarget.removeClass("folded");
                        toggleBtn.attr("title", tplVar['collapse']);
                    } else {
                        parentTarget.addClass("folded");
                        toggleBtn.attr("title", tplVar['expand']);
                    }

                    var isDocs = parentTarget.hasClass("docs");
                    var isOpen = !parentTarget.hasClass("folded");
                    if(isDocs){
                        self.storeCategoryIsOpen(DOCS_STORE_KEY , isOpen);
                    }
                });
        },

        toggleFolder : function(e){
            var currentTarget = $(e.currentTarget),
                id = currentTarget.parent().find("a").attr("data-id"),
                title = currentTarget.parent().find("a").attr("title");
            var isOpen = currentTarget.hasClass("close");
            this.storeCategoryIsOpen(GO.session("loginId") + id + title +  '-docs-folder-toggle' , !isOpen);

            if(isOpen){
                currentTarget.removeClass("close").addClass("open");
                currentTarget.parent().next('ul').hide();
            }else{
                currentTarget.removeClass("open").addClass("close");
                currentTarget.parent().next('ul').show();
            }
        },


        storeCategoryIsOpen: function(store_key, isOpen) {
            GO.util.store.set(store_key, isOpen);
        },
        goDocsHome : function() {
        	GO.router.navigate("docs", true);
        },
        addDocs : function(){
        	var selectFolder = $('#docFolders ul.side_depth li.folder > p.on');
        	var folderId;
        	
        	if(selectFolder.length > 0 && selectFolder.attr("data-writable")){
    			folderId = selectFolder.parent().attr("data-id");
        	}
            var url = "";

            if (folderId) {
                url = "docs/folder/" + folderId + "/create";
            } else {
                url = 'docs/create';
            }

            var callback = function() {
                GO.router.navigate(url, true);
            };

            GO.util.editorConfirm(callback);
        },
        goDocsList : function(e) {
        	var selectedEl = $(e.currentTarget);
            
        	var folderType = selectedEl.attr('data-navi');
            var url = "/docs/folder/" + folderType;
            
            this.$el.find('.on').removeClass('on');
            selectedEl.parent().addClass('on');
            GO.router.navigate(url, {trigger: true});
        },
        showList : function(e){
            var folderId = $(e.currentTarget).attr('data-id');

            if(folderId && this.docFolderList.isReadableFolder(folderId)){
                this.$el.find('.on').removeClass('on');
                $(e.currentTarget).parent().addClass('on');
                var url = "docs/folder/" + folderId;
                GO.router.navigate(url, true);
            }else {
                return false;
            }
        }
	});
});