;(function(){
    define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!report/templates/side",
    "i18n!nls/commons",
    "i18n!report/nls/report",
    "report/collections/left_menu",
    "favorite",
    "amplify",
    "jquery.go-popup",
    "jquery.go-validation",
    "jquery.go-sdk"
    
    ], function(
        $, 
        Backbone,
        GO, 
        SideTmpl,
        commonLang,
        reportLang,
        reportMenu,
        FavoriteView,
        Amplify
    ) {
        
        var lang = {
            "report" : reportLang["보고"],
            "deptFolder" : reportLang["부서별 보고서"],
            "descendant" : reportLang["하위 부서 보고서 조회"],
            "folderAdd" : reportLang["보고서 추가"],
            "reportManage" : reportLang["보고서 관리"],
            "reportConfig" : reportLang["보고서 설정"],
            "fold" : commonLang["접기"],
            "unfold" : commonLang["펼치기"],
            'alert_check_editor' : commonLang['내용 작성 중 이동 경고 메시지'],
            'confirm' : commonLang['확인'],
            'cancel' : commonLang['취소'],
            'closed_report_list' : reportLang['중지된 보고서 관리'],
            "favorite" : commonLang["즐겨찾기"],
            'empty_department' : commonLang["소속된 부서가 없습니다.<br> 관리자에게 문의하세요."],
            'empty_report' : reportLang["생성된 보고가 없습니다."],
            "deleted_department" : commonLang["삭제된 부서"]
        };
        
        var CATE_STORE_KEY = GO.session("loginId") + '-report-category-toggle';
        
        var SubDeptCheckModel = Backbone.Model.extend({
            url : GO.contextRoot + "api/department/subdeptcheck"
        });
        
        
        var ClosedReportCheckModel = Backbone.Model.extend({
            url : GO.contextRoot + "api/report/folder/closedcheck"
        });
        
        var SideView = Backbone.View.extend({
            el : "#side",
            events : {
                "click #reportFolderAdd" : "folderAdd" ,
                "click #folderOption>span.txt, #folderOption>span.ic_side" : "folderToggle",
                "click #folders li a.active_folder" : "viewReports",
                "click #folders li span.managable" : "viewFolderConfig",
                "click #folders span.dept_managable" : "viewActiveFolders",
                "click #descendant" : "viewDescendant",
                "click #folders li a.closed_folder" : "viewCloseFolders",
                "click #reportHome" : "reportHome"
                
            },
            initialize : function(){
                this.$el.off();
                this.reportMenu = reportMenu.get();
                this._setLeftMenu();
                this.$el.on("change:url", $.proxy(this.writePageMovePopup, this));
                this.$el.on("change:folder", $.proxy(this.reloadFolder, this));
            },
            render: function() {
                this.renderFolder();
                this.renderFavorite();
                return this;
            },
            renderFolder : function(){
                var reportMenuJson = this.reportMenu.toJSON(),
                    subDeptCheckModel = new SubDeptCheckModel(),
                    closedReportCheckModel = new ClosedReportCheckModel(),
                    hasDescendant = false,
                    hasClosedReport = false;
            
                subDeptCheckModel.fetch({async : false});
                closedReportCheckModel.fetch({async : false});
                
                hasDescendant = subDeptCheckModel.has(true);
                hasClosedReport = closedReportCheckModel.has(true);
                
                $.each(reportMenuJson, function(){
                    $.each(this.folders, function(){
                        if(this.publicOption != "OPEN"){
                            this.isPublic = false;
                        }else{
                            this.isPublic = true;
                        }
                    });
                });
                
                this.$el.html(SideTmpl({
                    data : reportMenuJson,
                    lang : lang,
                    hasDescendant : hasDescendant,
                    hasClosedReport : hasClosedReport,
                    home_url : GO.contextRoot + "app/report",
                    category_is_open : this.getStoredCategoryIsOpen(),
                    show_folder_add_btn : reportMenuJson.length > 0 ? true : false,
                    contextRoot : GO.contextRoot,
    				appName : GO.util.getAppName("report")
                }));
            },
            renderFavorite : function(){
                var favoriteView = FavoriteView.create({
                    el : "#side_favorite",
                    url : GO.config("contextRoot") + "api/report/folder/favorite",
                    type : "report",
                    liClass : function(model){
                    	return model.get("shared")  ? "report report_share" : "report";
                    },
                    link : function(model){
                        return "report/folder/" + model.get("id") + "/reports/favorite";
                    },
                    overrideDataSet : function(model){
                        return {
                            id : model.get("id"),
                            name : model.get("name"),
                            newMark : model.get("newReport"),
                            privateMark : model.get("publicOption") == "CLOSED"
                        };
                    }
                });
                
                favoriteView.$el.on("refresh", function(){
                    favoriteView.reload();
                });
                
                return favoriteView;
            },
            reloadFolder : function(){
                this.reportMenu = reportMenu.get();
                this.renderFolder();
            },
            writePageMovePopup : function(e, callback){
                
                var targetEl = this.$el.find("li p.on a"),
                    formFlag = targetEl.attr("data-form-flag"),
                    isCreatePage = $("#content div.reportCreateArea").length == 0 ? false : true;
                
                if(!isCreatePage){
                    callback();
                    return;
                }
                
                if(!formFlag){
                    callback();
                    return;
                }
                
                if(formFlag && GO.util.hasActiveEditor()){
                	
                	if(!GO.util.isEditorWriting()){
                		callback();
	                    return;
					}
                }
                
                $.goPopup({
                    title : '',
                    message : lang.alert_check_editor,
                    modal : true,
                    buttons : [{
                        'btext' : lang.confirm,
                        'btype' : 'confirm',
                        'callback' : callback
                    }, {
                        'btext' : lang.cancel,
                        'btype' : 'normal',
                        'callback' : function() {}
                    }]
                });
            },
            viewDescendant : function(){
                this.$el.trigger("change:url", [function(){
                    var url = "report/dept/descendant";
                    var callback = function() {
                    	GO.router.navigate(url, {trigger: true});
                    };
                    GO.util.editorConfirm(callback);
                }]);
            },
            viewFolderConfig : function(e){
                this.$el.trigger("change:url", [function(){
                    var $el = $(e.currentTarget),
                    url = "report/folder/" + $el.attr("data-id");
                    
                    var callback = function() {
                    	GO.router.navigate(url, {trigger: true});
                    };
                    GO.util.editorConfirm(callback);
                }]);
                
            },
            viewActiveFolders : function(e){
                this.$el.trigger("change:url", [function(){
                    var $el = $(e.currentTarget).parents("li.org"),
                    url = "report/dept/" + $el.attr("data-id") + "/folder/active";
                
                    var callback = function() {
                    	GO.router.navigate(url, {trigger: true});
                    };
                    GO.util.editorConfirm(callback);
                }]);
            },
            viewCloseFolders : function(e){
                this.$el.trigger("change:url", [function(){
                    var $el = $(e.currentTarget).parents("li.org"),
                    url = "report/dept/" + $el.attr("data-id") + "/folder/close";
                    
                    var callback = function() {
                    	GO.router.navigate(url, {trigger: true});
                    };
                    GO.util.editorConfirm(callback);
                }]);
            },
            viewReports : function(e){
                
                this.$el.trigger("change:url", [function(){
                    var currentEl = $(e.currentTarget),
                        $el = currentEl.parents("li");
                    
                    folderId = $el.attr("data-id"),
                    type = $el.attr("data-type"),
                    url = "report/folder/" + folderId + "/reports";
                    
                   var callback = function() {
                    	GO.router.navigate(url, {trigger: true});
                    };
                    GO.util.editorConfirm(callback);
                }]);
            },
            folderAdd : function(){
                
                this.$el.trigger("change:url", [function(){
                    var callback = function() {
                    	GO.router.navigate("report/folder/create", {trigger: true});
                    };
                    GO.util.editorConfirm(callback);
                }]);
            },
            folderToggle : function(event){
                var currentEl = $(event.currentTarget),
                    parentEl = currentEl.parents('h1'),
                    toggleEl = parentEl.find("span.ic_side");
                
                if(parentEl.hasClass("folded")){
                    $("#folders").slideDown(200);
                    parentEl.removeClass("folded");
                    toggleEl.attr("title", lang.fold);
                } else {
                    $("#folders").slideUp(200);
                    parentEl.addClass("folded");
                    toggleEl.attr("title", lang.unfold);
                }
                
                this.storeCategoryIsOpen(!parentEl.hasClass("folded"));
            },
            
            getStoredCategoryIsOpen: function() {
                var savedCate = '';
                if(!window.sessionStorage) {
                    savedCate = Amplify.store( CATE_STORE_KEY );
                } else {
                    savedCate = Amplify.store.sessionStorage( CATE_STORE_KEY );
                }
                
                if(savedCate == undefined){
                    savedCate = true;
                }
                
                return savedCate;
            }, 
            
            storeCategoryIsOpen: function(category) {
                return Amplify.store( CATE_STORE_KEY, category, { type: !window.sessionStorage ? null : 'sessionStorage' } );
            }, 
            
            _setLeftMenu : function(){
                var self = this;
                
                this.$el.on("set:leftMenu", function(e, folderId, type){
                    var targetSide = "",
                        sideClass = "";
                    
                    $.each(self.$el.find("li.report p.title"), function(){
                        $(this).removeClass("on");
                    });
                    
                    if(folderId == "closed_folder"){
                        return self.$el.find("li.closed>p").addClass("on");
                    }else if(folderId == "descendant_folder"){
                        return self.$el.find("li.assigned>p").addClass("on");
                    }
                    
                    if(window.location.href.search("favorite") > 0){
                        targetSide = "#side_favorite";
                    }else{
                        targetSide = "#side_folder";
                    }
                    
                    if(type == "department"){
                        // department
                        sideClass = "department";
                    }else{
                        sideClass = "report";
                    }
                    
                    self.$el.find(targetSide + " li."+sideClass+"[data-id='"+ folderId +"']>p").addClass("on");
                });
            },
            
            
            reportHome : function() {
            	var callback = function() {
            		GO.router.navigate("report", true);
                };
                GO.util.editorConfirm(callback);
            }
        });
        
        return SideView;
    });
}).call(this);