define([
    "report/models/series_report",
    "jquery.ajaxmock",
    "i18n"
], function(
	SeriesReportModel
) {
	describe("series report model test", function() {
		it("[정기보고] 마감일자 YYYY-MM-DD(ddd)", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("closedAt", '2014-10-16T14:14:04');
			
			expect('2014-10-16(목)')
			.toEqual(seriesReportModel.closedAtBasicDate2());
		});
		
		it("[정기보고] 제외된 보고자 없음", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("exclusion", []);
			
			expect('없음')
			.toEqual(seriesReportModel.excludeReportsStr());
		});
		
		it("[정기보고] 제외된 보고자 있음", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("exclusion", [{name : "박상오", position : "대리"}, {name : "김태환" , position : "주임"}]);
			
			expect('박상오 대리, 김태환 주임')
			.toEqual(seriesReportModel.excludeReportsStr());
		});
		
		it("[정기보고] 보고완료로 상태변경", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("dones", []);
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("undones", [ {
			      "id" : 1,
			      "name" : "강봉수",
			      "email" : "kbsbroad@daou.co.kr",
			      "originalEmail" : "kbsbroad@daou.co.kr",
			      "position" : "선임연구원",
			      "thumbnail" : "/thumb/user/small/12451-2619",
			      "status" : "ONLINE",
			      "employeeNumber" : "2524",
			      "reportId" : 11561,
			      "commentCount" : 0,
			      "actions" : {
			        "updatable" : false,
			        "removable" : false,
			        "writable" : false,
			        "managable" : false,
			        "readable" : true
			      }
			    }, {
			      "id" : 2,
			      "name" : "권구성",
			      "email" : "create2879@daou1.com",
			      "originalEmail" : "create2879@daou.co.kr",
			      "position" : "연구원",
			      "thumbnail" : "/thumb/user/small/6770-23160",
			      "status" : "ONLINE",
			      "employeeNumber" : "2736",
			      "reportId" : 11564,
			      "commentCount" : 0,
			      "actions" : {
			        "updatable" : false,
			        "removable" : false,
			        "writable" : false,
			        "managable" : false,
			        "readable" : true
			      }
			}]);
			
			var changeUser = seriesReportModel.changeStatus(2, "dones");
			
			expect('dones')
			.toEqual(changeUser.status);
			
			expect(2)
			.toEqual(changeUser.user.id);
		});
		
		it("[정기보고] 미보고로 상태변경", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("dones", []);
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("undones", [ {
				"id" : 1,
				"name" : "강봉수",
				"email" : "kbsbroad@daou.co.kr",
				"originalEmail" : "kbsbroad@daou.co.kr",
				"position" : "선임연구원",
				"thumbnail" : "/thumb/user/small/12451-2619",
				"status" : "ONLINE",
				"employeeNumber" : "2524",
				"reportId" : 11561,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : false,
					"managable" : false,
					"readable" : true
				}
			}, {
				"id" : 2,
				"name" : "권구성",
				"email" : "create2879@daou1.com",
				"originalEmail" : "create2879@daou.co.kr",
				"position" : "연구원",
				"thumbnail" : "/thumb/user/small/6770-23160",
				"status" : "ONLINE",
				"employeeNumber" : "2736",
				"reportId" : 11564,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : false,
					"managable" : false,
					"readable" : true
				}
			}]);
			
			var changeUser = seriesReportModel.changeStatus(2, "undones");
			
			expect('undones')
			.toEqual(changeUser.status);
			
			expect(2)
			.toEqual(changeUser.user.id);
		});
		
		it("[정기보고] 보고 제외로 상태변경", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("dones", []);
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("undones", [ {
				"id" : 1,
				"name" : "강봉수",
				"email" : "kbsbroad@daou.co.kr",
				"originalEmail" : "kbsbroad@daou.co.kr",
				"position" : "선임연구원",
				"thumbnail" : "/thumb/user/small/12451-2619",
				"status" : "ONLINE",
				"employeeNumber" : "2524",
				"reportId" : 11561,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : false,
					"managable" : false,
					"readable" : true
				}
			}, {
				"id" : 2,
				"name" : "권구성",
				"email" : "create2879@daou1.com",
				"originalEmail" : "create2879@daou.co.kr",
				"position" : "연구원",
				"thumbnail" : "/thumb/user/small/6770-23160",
				"status" : "ONLINE",
				"employeeNumber" : "2736",
				"reportId" : 11564,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : false,
					"managable" : false,
					"readable" : true
				}
			}]);
			
			var changeUser = seriesReportModel.changeStatus(2, "exclusion");
			
			expect('exclusion')
			.toEqual(changeUser.status);
			
			expect(2)
			.toEqual(changeUser.user.id);
		});
		
		it("[정기보고] 해당 사용자가 미보고자 인가?", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("dones", [{
				"id" : 1,
				"name" : "강봉수",
				"email" : "kbsbroad@daou.co.kr",
				"originalEmail" : "kbsbroad@daou.co.kr",
				"position" : "선임연구원",
				"thumbnail" : "/thumb/user/small/12451-2619",
				"status" : "ONLINE",
				"employeeNumber" : "2524",
				"reportId" : 11561,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : false,
					"managable" : false,
					"readable" : true
				}
			}]);
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("undones", [{
				"id" : 2,
				"name" : "권구성",
				"email" : "create2879@daou1.com",
				"originalEmail" : "create2879@daou.co.kr",
				"position" : "연구원",
				"thumbnail" : "/thumb/user/small/6770-23160",
				"status" : "ONLINE",
				"employeeNumber" : "2736",
				"reportId" : 11564,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : false,
					"managable" : false,
					"readable" : true
				}
			}]);
			
			expect(true)
			.toEqual(seriesReportModel.isUndoneReporter(2));
		});
		
		it("[정기보고] 해당 정기보고 회차에 포함된 보고서 인가?", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("dones", [{
				"id" : 1,
				"name" : "강봉수",
				"email" : "kbsbroad@daou.co.kr",
				"originalEmail" : "kbsbroad@daou.co.kr",
				"position" : "선임연구원",
				"thumbnail" : "/thumb/user/small/12451-2619",
				"status" : "ONLINE",
				"employeeNumber" : "2524",
				"reportId" : 11561,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : false,
					"managable" : false,
					"readable" : true
				}
			}]);
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("undones", [{
				"id" : 2,
				"name" : "권구성",
				"email" : "create2879@daou1.com",
				"originalEmail" : "create2879@daou.co.kr",
				"position" : "연구원",
				"thumbnail" : "/thumb/user/small/6770-23160",
				"status" : "ONLINE",
				"employeeNumber" : "2736",
				"reportId" : 11564,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : false,
					"managable" : false,
					"readable" : true
				}
			}]);
			
			expect(true)
			.toEqual(seriesReportModel.isExistReport(11561));
		});
		
		it("[정기보고] 보고자 상태에 따른 조회", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("dones", [{
				"id" : 1,
				"name" : "강봉수",
				"email" : "kbsbroad@daou.co.kr",
				"originalEmail" : "kbsbroad@daou.co.kr",
				"position" : "선임연구원",
				"thumbnail" : "/thumb/user/small/12451-2619",
				"status" : "ONLINE",
				"employeeNumber" : "2524",
				"reportId" : 11561,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : false,
					"managable" : false,
					"readable" : true
				}
			}]);
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("undones", [{
				"id" : 2,
				"name" : "권구성",
				"email" : "create2879@daou1.com",
				"originalEmail" : "create2879@daou.co.kr",
				"position" : "연구원",
				"thumbnail" : "/thumb/user/small/6770-23160",
				"status" : "ONLINE",
				"employeeNumber" : "2736",
				"reportId" : 11564,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : false,
					"managable" : false,
					"readable" : true
				}
			}]);
			
			var reporter = seriesReportModel.findReporterByUserId(1, "dones")
			
			expect("dones")
			.toEqual(reporter.status);
			
			expect(1)
			.toEqual(reporter.user.id);
		});
		
		it("[정기보고] 작성된 보고서를 볼수 있는가?", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("dones", [{
				"id" : 1,
				"name" : "강봉수",
				"email" : "kbsbroad@daou.co.kr",
				"originalEmail" : "kbsbroad@daou.co.kr",
				"position" : "선임연구원",
				"thumbnail" : "/thumb/user/small/12451-2619",
				"status" : "ONLINE",
				"employeeNumber" : "2524",
				"reportId" : 11561,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : false,
					"managable" : false,
					"readable" : true
				}
			}]);
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("undones", []);
			
			seriesReportModel.setDonesClickable();
			
			expect(true)
			.toEqual(seriesReportModel.get("dones")[0].isClickable);
		});
		
		it("[정기보고] 작성된 보고서가 개인만 공개인가?", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("dones", [{
				"id" : 1,
				"name" : "강봉수",
				"email" : "kbsbroad@daou.co.kr",
				"originalEmail" : "kbsbroad@daou.co.kr",
				"position" : "선임연구원",
				"thumbnail" : "/thumb/user/small/12451-2619",
				"status" : "ONLINE",
				"employeeNumber" : "2524",
				"reportId" : 11561,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : false,
					"managable" : false,
					"readable" : false
				}
			}]);
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("undones", []);
			
			seriesReportModel.setDonesClickable();
			
			expect(true)
			.toEqual(seriesReportModel.get("dones")[0].isPrivateShow);
		});
		
		it("[정기보고] 보고서를 작성할 수 있는가?", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("folder", {status : "ACTIVE"});
			seriesReportModel.set("undones", [{
				"id" : 1,
				"name" : "강봉수",
				"email" : "kbsbroad@daou.co.kr",
				"originalEmail" : "kbsbroad@daou.co.kr",
				"position" : "선임연구원",
				"thumbnail" : "/thumb/user/small/12451-2619",
				"status" : "ONLINE",
				"employeeNumber" : "2524",
				"reportId" : 11561,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : true,
					"managable" : false,
					"readable" : false
				}
			}]);
			
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("dones", []);
			
			seriesReportModel.setUndonesClickable();
			
			expect(true)
			.toEqual(seriesReportModel.get("undones")[0].isClickable);
			
			expect(true)
			.toEqual(seriesReportModel.get("undones")[0].isWritable);
		});
		
		it("[정기보고] 완료된 보고수", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("dones", [{
				"id" : 1,
				"name" : "강봉수",
				"email" : "kbsbroad@daou.co.kr",
				"originalEmail" : "kbsbroad@daou.co.kr",
				"position" : "선임연구원",
				"thumbnail" : "/thumb/user/small/12451-2619",
				"status" : "ONLINE",
				"employeeNumber" : "2524",
				"reportId" : 11561,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : true,
					"managable" : false,
					"readable" : false
				}
			}]);
			
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("ㅕㅜdones", []);
			
			expect(1)
			.toEqual(seriesReportModel.getCompleteCount());
		});
		
		it("[정기보고] getIncompleteCount", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("undones", [{
				"id" : 1,
				"name" : "강봉수",
				"email" : "kbsbroad@daou.co.kr",
				"originalEmail" : "kbsbroad@daou.co.kr",
				"position" : "선임연구원",
				"thumbnail" : "/thumb/user/small/12451-2619",
				"status" : "ONLINE",
				"employeeNumber" : "2524",
				"reportId" : 11561,
				"commentCount" : 0,
				"actions" : {
					"updatable" : false,
					"removable" : false,
					"writable" : true,
					"managable" : false,
					"readable" : false
				}
			}]);
			
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("dones", []);
			
			expect(1)
			.toEqual(seriesReportModel.getIncompleteCount());
		});
		
		it("[정기보고] 보고서를 작성한 사람들의 이름", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("dones", [
                {
					"id" : 1,
					"name" : "강봉수",
					"email" : "kbsbroad@daou.co.kr",
					"originalEmail" : "kbsbroad@daou.co.kr",
					"position" : "선임연구원",
					"thumbnail" : "/thumb/user/small/12451-2619",
					"status" : "ONLINE",
					"employeeNumber" : "2524",
					"reportId" : 11561,
					"commentCount" : 0,
					"actions" : {
						"updatable" : false,
						"removable" : false,
						"writable" : true,
						"managable" : false,
						"readable" : false
					}
                },
                {
                	"id" : 2,
                	"name" : "박상오",
                	"email" : "kbsbroad@daou.co.kr",
                	"originalEmail" : "kbsbroad@daou.co.kr",
                	"position" : "선임연구원",
                	"thumbnail" : "/thumb/user/small/12451-2619",
                	"status" : "ONLINE",
                	"employeeNumber" : "2524",
                	"reportId" : 11561,
                	"commentCount" : 0,
                	"actions" : {
                		"updatable" : false,
                		"removable" : false,
                		"writable" : true,
                		"managable" : false,
                		"readable" : false
                	}
                },
			
			]);
			
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("undones", []);
			
			expect('강봉수 선임연구원, 박상오 선임연구원')
			.toEqual(seriesReportModel.getCompleteUserName());
		});
		
		it("[정기보고] 보고서를 작성하지 않은 사람들의 이름", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("undones", [
                {
                	"id" : 1,
                	"name" : "강봉수",
                	"email" : "kbsbroad@daou.co.kr",
                	"originalEmail" : "kbsbroad@daou.co.kr",
                	"position" : "선임연구원",
                	"thumbnail" : "/thumb/user/small/12451-2619",
                	"status" : "ONLINE",
                	"employeeNumber" : "2524",
                	"reportId" : 11561,
                	"commentCount" : 0,
                	"actions" : {
                		"updatable" : false,
                		"removable" : false,
                		"writable" : true,
                		"managable" : false,
                		"readable" : false
                	}
                },
                {
                	"id" : 2,
                	"name" : "박상오",
                	"email" : "kbsbroad@daou.co.kr",
                	"originalEmail" : "kbsbroad@daou.co.kr",
                	"position" : "선임연구원",
                	"thumbnail" : "/thumb/user/small/12451-2619",
                	"status" : "ONLINE",
                	"employeeNumber" : "2524",
                	"reportId" : 11561,
                	"commentCount" : 0,
                	"actions" : {
                		"updatable" : false,
                		"removable" : false,
                		"writable" : true,
                		"managable" : false,
                		"readable" : false
                	}
                },
            ]);
			
			seriesReportModel.set("exclusion", []);
			seriesReportModel.set("dones", []);
			
			expect('강봉수 선임연구원, 박상오 선임연구원')
			.toEqual(seriesReportModel.getIncompleteUserName());
		});
		
		it("[정기, 수시보고] 정상 상태 보고서 폴더인가?", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("folder", {status : "ACTIVE"});
			
			expect(true)
			.toEqual(seriesReportModel.isActive());
		});
		
		it("[정기, 수시보고] 정지 상태 보고서 폴더인가?", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("folder", {status : "INACTIVE"});
			
			expect(true)
			.toEqual(seriesReportModel.isInactive());
		});
		
		it("[정기보고] 회차이름 출력 확인", function() {
			var seriesReportModel = new SeriesReportModel();
			seriesReportModel.set("series", 10);
			
			expect('제 10회차')
			.toEqual(seriesReportModel.getSeriesStr());
		});
	});
});