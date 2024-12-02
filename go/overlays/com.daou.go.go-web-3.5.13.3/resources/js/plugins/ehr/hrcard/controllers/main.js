(function() {
	define([
	        "ehr/hrcard/views/layouts/defaults",
			"ehr/common/components/layoutEventListener"
    ],

    function(
    		DefaultLayout
    ) {
		var HrCardController = (function() {
			var Controller = function() {

			};

			Controller.prototype = {


				renderHrCardManage : function() {
					require(["ehr/hrcard/views/hrcard_manage"], function(ManageView) {
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var manageView = new ManageView();
							content.html(manageView.render().el).addClass("ehr_hr_set");
							$("div.go_body").removeClass("go_renew");
						});
					});
				},


				renderHrCardListAll : function() {
					require(["ehr/hrcard/views/hrcard_list"], function(ViewList) {
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var viewList = new ViewList({"range" : "all"});
							content.html(viewList.render().el).addClass("ehr_hr_info");
						});
					});
				},


				renderHrCardList : function(deptId) {
					require(["ehr/hrcard/views/hrcard_list"], function(ViewList) {
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var viewList = new ViewList({"range" : "dept" , "deptId" : deptId});
							content.html(viewList.render().el).addClass("ehr_hr_info");
						});
					});
				},

				detailRender: function(userid) {
					require(["ehr/hrcard/views/my_card"], function(MyCardView) {
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var myCardView = new MyCardView({"userid" : userid});
							content.append(myCardView.render().el).addClass("ehr_personal");
                            $('body').addClass("go_skin_ehr");
							$("div.go_body").addClass("go_renew");
							$('body').addClass("go_skin_ehr");
						});
					});
				}
			};

			return Controller;
		})();

		return new HrCardController();
	});

}).call(this);