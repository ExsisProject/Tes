define([
    "report/models/report",
    "i18n"
], function(
	ReportModel
) {
	describe("report model test", function() {
		it("마감일 date 변환", function() {
			var reportModel = new ReportModel();
			reportModel.set('submittedAt', '2014-10-16T14:14:04');
			
			expect('2014-10-16(목) 14:14')
			.toEqual(reportModel.submittedAtBasicDate());
		});
		
		it("생성일 date 변환", function() {
			var reportModel = new ReportModel();
			reportModel.set('createdAt', '2014-10-16T14:14:04');
			
			expect('2014-10-16(목) 14:14')
			.toEqual(reportModel.createdAtBasicDate());
		});
		
		it("첨부파일 갯수", function() {
			var reportModel = new ReportModel();
			reportModel.set('attaches', [{id : 1}]);
			
			expect(1)
			.toEqual(reportModel.attachesCount());
		});
		
		it("첨부파일 URL 확인", function() {
			var reportModel = new ReportModel();
			reportModel.set('id', 1);
			reportModel.set('attaches', [{id : 21}]);
			
			reportModel.setAttacheUrl()
			
			expect('/api/report/1/download/21')
			.toEqual(reportModel.get("attaches")[0].url);
		}); 
		
		it("첨부파일 사이즈 확인", function() {
			var reportModel = new ReportModel();
			reportModel.set('id', 1);
			reportModel.set('attaches', [{size : 102400}]);
			
			reportModel.setAttacheSizeByKb();
			
			expect('100.00')
			.toEqual(reportModel.get("attaches")[0].sizeByKb);
		});
		
		it("전체 첨부파일 사이즈 확인", function() {
			var reportModel = new ReportModel();
			reportModel.set('id', 1);
			reportModel.set('attaches', [{size : 102400}, {size : 102400}]);
			
			expect(204800)
			.toEqual(reportModel.attachesSize());
		});
		
		it("전체 첨부파일 없는경우 사이즈 확인", function() {
			var reportModel = new ReportModel();
			reportModel.set('id', 1);
			reportModel.set('attaches', []);
			
			expect(0)
			.toEqual(reportModel.attachesSize());
		});

		it("getSeriesStr 테스트", function() {
			var reportModel = new ReportModel();
			reportModel.set('series', {series : 1});
			
			expect('제 1회차')
			.toEqual(reportModel.getSeriesStr());
		});
	});
});