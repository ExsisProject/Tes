define('docs/views/mobile/side', function(require) {
	
	var Backbone = require('backbone');
    var when = require('when');
	var SideItemView = require('docs/views/mobile/side_item');

    var Favorites = require('components/favorite/collections/favorite');

	var DocFolderList = require('docs/collections/doc_folder_infos');

	var SideTmpl = require('hgn!docs/templates/mobile/side');

    var docsLang = require('i18n!docs/nls/docs');
    var commonLang = require("i18n!nls/commons");

    var tplVar = {
        'folder' : docsLang['문서함'],
        'latestRead' : docsLang['최근 열람 문서'],
        'latestUpdate' : docsLang['최근 업데이트 문서'],
        'approveWaiting' : docsLang['승인 대기 문서'],
        'completeWaiting' : docsLang['등록 대기 문서'],
        'favorite' : commonLang["즐겨찾기"]

    };
	var WorksSideView = Backbone.View.extend({
        events : {
            "click span[name=sideItem]" : "moveToFolder"
        },
		
		initialize : function() {
            this.docFolderList = new DocFolderList();
            this.favorites = Favorites.get({url : GO.contextRoot + "api/docs/folder/favorite"});
		},

        refreshWaitingCount: function(){
            var self = this;
            return $.when(
                self.getRegistwaiting(),
                self.getApprovewaiting()
            ).done($.proxy(function() {
                this.registwaitingCnt > 0 ? $("#registwaitingCnt").show().empty().append(this.registwaitingCnt) : $("#registwaitingCnt").hide();
                this.approvewaitingCnt > 0 ? $("#approvewaitingCnt").show().empty().append(this.approvewaitingCnt) : $("#approvewaitingCnt").hide();
            }, this));
        },

        render : function() {
            var self = this;
            var deferred = $.Deferred();
            this.packageName = this.options.packageName;
            var fetFolderPresent = this.favorites.fetch();
            this.docFolderList.comparator = 'seq';
            var docsFolderList = this.docFolderList.fetch();


            $.when(
                self.getRegistwaiting(),
                self.getApprovewaiting(),
                docsFolderList,
                fetFolderPresent
            ).done(function() {

                self.$el.html(SideTmpl({
                    lang : tplVar,
                    hasFavorite : self.favorites.hasFavorite(),
                    favorites : self.favorites.toJSON(),
                    isNew : function(){
                        return this.lastDocsCompleteDate ? GO.util.isCurrentDate(this.lastDocsCompleteDate, 1) : false;
                    },
                    hasRegistwaiting : self.registwaitingCnt ? self.registwaitingCnt > 0 : false,
                    hasApprovewaiting : self.approvewaitingCnt ? self.approvewaitingCnt > 0 : false,
                    registwaitingCnt : self.registwaitingCnt,
                    approvewaitingCnt : self.approvewaitingCnt
                }));


                var folderList = new DocFolderList();

                self.docFolderList.each(function(model) {
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
                    self.renderItemsView(rootFolder,folderList, self.$el.find("#allFolderList"), {className : 'ic_work'});
                });


                self.setSideApp();
                deferred.resolveWith(self, [self]);
            });
            return deferred;
		},

		renderItemsView : function(rootFolder, folderList, target, options) {
            var sideItemView = new SideItemView({
                root : true,
                model: rootFolder,
                depth : rootFolder.getDepth(),
                className : options['className']
            });
            target.append(sideItemView.render().el);

            this.renderSideChildItem(folderList, rootFolder, false, target, options);
		},


        renderSideChildItem : function(folderList, model, isRoot, target, options){
            var childList = folderList._getChildrenFolder(model.id);
            if(childList.length > 0){
                _.each(childList, $.proxy(function(childFolder) {
                    var sideItemView = new SideItemView({
                        root : isRoot,
                        model: childFolder,
                        depth : childFolder.getDepth() == 0 ? childFolder.get('depth') - 2 : childFolder.getDepth(),
                        /**
                            depth 에서 2를 빼는 이유는
                            server 기준으로 depth 는 회사 1 최상위 폴더 2 하위폴더 3 ... 이지만
                            front 기준으로는 depth 가 최상위 폴더 0 하위폴더 1 ... 순으로 진행되기 때문입니다.
                            또한 childFolder 이므로 0일 수 없습니다.
                         */
                        className : options['className']
                    });
                    target.append(sideItemView.render().el);
                    if(folderList._getChildrenFolder(childFolder.id).length > 0){
                        this.renderSideChildItem(folderList,childFolder,false,target,options);
                    }
                }),this);
            }
        },

        moveToFolder : function(e) {
			var folderIdOrType = $(e.currentTarget).attr("data-id");
            if(!folderIdOrType){
                folderIdOrType = $(e.currentTarget).attr("data-navi");
            }
            if(folderIdOrType){
                var url = "/docs/folder/" + folderIdOrType;
                GO.router.navigate(url, true);
            }
		},
		
		
		setSideApp : function() {
            $('body').data('sideApp', this.packageName);
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
        }

	}, {
        __instance__: null, 
        create: function(packageName) {
            this.__instance__ = new this.prototype.constructor({'packageName':packageName});
            return this.__instance__;
        }
    });
	
	return WorksSideView;
});
