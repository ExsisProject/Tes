define("timeline/controllers/mobile", function (require) {
    require("ehr/common/components/layoutEventListener");
    var MobileLayout = require("views/layouts/mobile_default");
    var SideView = require("ehr/common/views/side");
    var appName = 'ehr';
    
    var TimelineController = (function () {
        var Controller = function () {
        };
        var self = this;
    	var LayoutView = null;
    	
        function toggleSearchBtn(flag){
        	LayoutView.$('#btnHeaderSearch').toggle(flag);
        }
    	
        function renderSide(){
    	    require(["ehr/common/views/mobile/side"], function(SideView) {
    	    	var View = SideView.create("ehr");
    	    	if($('body').data('sideApp') != appName) {
    	    		View.render().done(function(sideView) {
    	    			var sideEl = LayoutView.getSideContentElement().append(sideView.el);
    	    			GO.EventEmitter.trigger('common', 'layout:initSideScroll', this);
    	    			sideEl.parent().hide();
    	    		});
    	    	}
    	    });
        }

        Controller.prototype = {

            renderUser : function(userId) {
            	require(["timeline/views/mobile/user/main"], function (MainView) {
            		var targetUserId = GO.session().id;
            		if(userId){
            			targetUserId = userId;
            		}
            		LayoutView = MobileLayout.create();

            		LayoutView.render(appName).done(function(layout){
            			toggleSearchBtn(false);
            			renderSide.call(self);
            			var mainView = new MainView({"userId": targetUserId});
                        layout.getContentElement().addClass('ehr_attend');
                        layout.$el.addClass("go_skin_attend");
                        mainView.render();

                    });
            	});
            },
            
            renderCompany: function () {
                require(["timeline/views/mobile/company_stat/company_stats"], function (CompanyStatsView) {
                	LayoutView = MobileLayout.create();
            		LayoutView.render(appName).done(function(layout){
            			toggleSearchBtn(false);
            			renderSide.call(self);
                        var companyStats = new CompanyStatsView({"range":"COMPANY"});
                        companyStats.render();
                        layout.getContentElement().removeClass('ehr_attend'); 
                    });
                });
            },
            
            renderDept: function (deptId) {
                require(["timeline/views/mobile/company_stat/company_stats"], function (DeptStatsView) {
                	LayoutView = MobileLayout.create();
            		LayoutView.render(appName).done(function(layout){
            			toggleSearchBtn(false);
            			renderSide.call(self);
                        var deptStats = new DeptStatsView({"range":"DEPARTMENT", "deptId": parseInt(deptId) });
                        deptStats.render();
                        layout.getContentElement().removeClass('ehr_attend'); 
                    });
                });
            },
            
            renderCreateHistory: function(targetUserId) {
            	require(["timeline/views/mobile/user/history"], function (CreateView) {
            		if(!targetUserId){
            			targetUserId = GO.session().id;
            		}
                	LayoutView = MobileLayout.create();
            		LayoutView.render(appName).done(function(layout){
            			toggleSearchBtn(false);
                        var createView = new CreateView({
                        	"targetUserId" : targetUserId,
                        	"type" : "create"
                        });
                        createView.render();
                        layout.getContentElement().removeClass('ehr_attend'); 
                    });
                });
            },
            
            renderDetailHistory: function (historyId, targetUserId, baseDate) {
                require(["timeline/views/mobile/user/history"], function (DetailView) {
                	LayoutView = MobileLayout.create();
            		LayoutView.render(appName).done(function(layout){
            			toggleSearchBtn(false);
                        var detailView = new DetailView({
                        	"historyId" : historyId, 
                        	"targetUserId" : targetUserId, 
                        	"baseDate" : baseDate, 
                        	"type" : "view"
                        	});
                        detailView.render();
                        layout.getContentElement().removeClass('ehr_attend'); 
                    });
                });
            },
            renderUpdateHistory: function(historyId, targetUserId, baseDate) {
            	require(["timeline/views/mobile/user/history"], function (UpdateView) {
                	LayoutView = MobileLayout.create();
            		LayoutView.render(appName).done(function(layout){
            			toggleSearchBtn(false);
                        var updateView = new UpdateView({
                        	"historyId" : historyId, 
                        	"targetUserId" : targetUserId, 
                        	"baseDate" : baseDate, 
                        	"type" : historyId === "new" ? "create" : "update"
                        	});
                        updateView.render();
                        layout.getContentElement().removeClass('ehr_attend'); 
                    });
                });
            },
            renderDeleteHistory: function(historyId, targetUserId, baseDate) {
            	require(["timeline/views/mobile/user/history"], function (DeleteView) {
                	LayoutView = MobileLayout.create();
            		LayoutView.render(appName).done(function(layout){
            			toggleSearchBtn(false);
                        var deleteView = new DeleteView({
                        	"historyId" : historyId, 
                        	"targetUserId" : targetUserId, 
                        	"baseDate" : baseDate, 
                        	"type" : "delete"
                        	});
                        deleteView.render();
                        layout.getContentElement().removeClass('ehr_attend'); 
                    });
                });
            }
        };

        return Controller;
    })();

    return new TimelineController();
});
