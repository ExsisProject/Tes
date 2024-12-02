define([
    "report/models/report_search",
    "jquery.ajaxmock",
    "i18n"
], function(
	ReportSearchModel
) {
	describe("report search model test", function() {
		it("정기보고 getTitle", function() {
			window.GO.config = function(){
				return "ko";
			}
			var reportSearchModel = new ReportSearchModel();
			reportSearchModel.set("folderType", "PERIODIC");
			reportSearchModel.set("seriesNo", 1);
			reportSearchModel.set("folderDeptName", "테스트 부서");
			
			reportSearchModel.getTitle()
			
			expect('테스트 부서 제 1회차')
			.toEqual(reportSearchModel.getTitle());
		});
		
		it("수시보고 getTitle", function() {
			var reportSearchModel = new ReportSearchModel();
			reportSearchModel.set("title", "수시보고 테스트");
			
			expect('수시보고 테스트')
			.toEqual(reportSearchModel.getTitle());
		});
		
		it("static get", function() {
			var reportSearchModel = ReportSearchModel.get();
			
			expect(null).not.toEqual(reportSearchModel);
		});
		
	});
});