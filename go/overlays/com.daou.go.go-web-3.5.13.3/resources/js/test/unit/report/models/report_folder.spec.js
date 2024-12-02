define([
    "report/models/report_folder",
    "jquery.mockjax"
], function(
	ReportFolderModel
) {
	describe("report folder model test", function() {
		it("static get() test", function() {
			$.mockjax({
			    url : '/api/report/folder/1',
			    responseText:{
		    	  "data" : {
		    		    "id" : 1,
		    		    "createdAt" : "2013-10-25T17:15:04",
		    		    "updatedAt" : "2014-10-01T00:10:00",
		    		    "recurrence" : "FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=-1",
		    		    "name" : "월간보고",
		    		    "description" : "",
		    		    "formFlag" : false,
		    		    "totalCount" : 169,
		    		    "totalSeries" : 13,
		    		    "type" : "PERIODIC",
		    		    "publicOption" : "OPEN",
		    		    "status" : "ACTIVE",
		    		    "department" : {
		    		      "id" : 61,
		    		      "name" : "GroupWare개발팀",
		    		      "code" : "0000000598",
		    		      "email" : "cncdev@daou.co.kr",
		    		      "emailId" : "cncdev",
		    		      "memberCount" : 23,
		    		      "childrenCount" : 1,
		    		      "parentId" : 197,
		    		      "parentCode" : "0000000658",
		    		      "sortOrder" : 2,
		    		      "depth" : 0,
		    		      "deptAlias" : "cncdev",
		    		      "deletedDept" : false,
		    		      "sortFlag" : false
		    		    },
		    		    "reporter" : {
		    		      "id" : 19,
		    		      "nodes" : [ {
		    		        "id" : 86,
		    		        "nodeId" : 696,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "백금철 책임연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 87,
		    		        "nodeId" : 929,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "권세택 책임연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 88,
		    		        "nodeId" : 864,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "김경인 선임연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 89,
		    		        "nodeId" : 1120,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "강봉수 선임연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 90,
		    		        "nodeId" : 1551,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "허용선 선임연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 91,
		    		        "nodeId" : 294,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "박관후 선임연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 92,
		    		        "nodeId" : 1619,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "조슬기 연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 93,
		    		        "nodeId" : 889,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "박상오 주임연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 94,
		    		        "nodeId" : 780,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "조건희 주임연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 95,
		    		        "nodeId" : 855,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "김태환 주임연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 96,
		    		        "nodeId" : 1165,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "정해운 연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 97,
		    		        "nodeId" : 1235,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "장인선 연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 98,
		    		        "nodeId" : 1633,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "권구성 연구원",
		    		        "members" : [ ]
		    		      } ]
		    		    },
		    		    "referrer" : {
		    		      "id" : 18,
		    		      "nodes" : [ ]
		    		    },
		    		    "admin" : {
		    		      "id" : 17,
		    		      "nodes" : [ {
		    		        "id" : 84,
		    		        "nodeId" : 855,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "김태환 주임연구원",
		    		        "members" : [ ]
		    		      }, {
		    		        "id" : 85,
		    		        "nodeId" : 321,
		    		        "nodeType" : "user",
		    		        "nodeValue" : "송동수 전문위원",
		    		        "members" : [ ]
		    		      } ]
		    		    },
		    		    "form" : {
		    		      "content" : ""
		    		    },
		    		    "actions" : {
		    		      "updatable" : false,
		    		      "removable" : false,
		    		      "writable" : true,
		    		      "managable" : false,
		    		      "readable" : false
		    		    },
		    		    "favorite" : false,
		    		    "attachSize" : 10600550,
		    		    "newReport" : false
		    		  },
		    		  "message" : "OK",
		    		  "code" : "200",
		    		  "__go_checksum__" : true
		    		}
			});
			
			var reportModel = ReportFolderModel.get(1);
			expect(reportModel.get("id")).toBe(1);
		});
		
		it("init 초기값 설정", function() {
			var reportModel = ReportFolderModel.init();
			
			expect(reportModel.id).toBe(null);
		});
		
		it("isOpen 공용 보고서 폴더인가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("publicOption" , "OPEN");
			expect(true).toBe(reportModel.isOpen());
		});
		
		it("isReporterOpen 보고자간 공개 보고서 폴더인가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("publicOption" , "CLOSED");
			expect(true).toBe(reportModel.isReporterOpen());
		});
		
		it("isPrivate 보고자간 비공개 보고서 폴더인가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("publicOption" , "PRIVATE");
			expect(true).toBe(reportModel.isPrivate());
		});
		
		it("부서원 전체가 보고서를 작성할 수 있는가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("reporter", {"nodes" : [{
				"id" : 15781,
				"nodeId" : 61,
				"nodeType" : "department",
				"nodeDeptId" : 61,
				"nodeValue" : "GroupWare개발팀",
				"members" : [ ]
			}]});
			expect(true).toBe(reportModel.isMemberWrite());
		});
		
		it("하위 부서원 전체가 보고서를 작성할 수 있는가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("reporter", {"nodes" : [{
				"id" : 15781,
				"nodeId" : 61,
				"nodeType" : "subdepartment",
				"nodeDeptId" : 61,
				"nodeValue" : "GroupWare개발팀",
				"members" : [ ]
			}]});
			expect(true).toBe(reportModel.isDescendantWrite());
		});
		
		it("직접지정한 보고자만 작성할 수 있는가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("reporter", {"nodes" : [ {
				"id" : 15783,
				"nodeId" : 1106,
				"nodeType" : "user",
				"nodeValue" : "김태한 차장",
				"members" : [ ]
			}]});
			expect(true).toBe(reportModel.isSpecifiedWrite());
		});
		
		it("정기보고서 인가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("type", "PERIODIC");
			expect(true).toBe(reportModel.isPeriodic());
		});
		
		it("수시보고서 인가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("type", "OCCASIONAL");
			expect(true).toBe(reportModel.isOccasional());
		});
		
		it("보고자 권한 확인", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("reporter", {
		      "id" : 4892,
		      "nodes" : [ {
		        "id" : 15786,
		        "nodeId" : 889,
		        "nodeType" : "user",
		        "nodeValue" : "박상오 주임연구원",
		        "members" : [ ]
		      }, {
		        "id" : 15785,
		        "nodeId" : 780,
		        "nodeType" : "user",
		        "nodeValue" : "조건희 주임연구원",
		        "members" : [ ]
		      } ]
		    });
			expect([ { id : 889, title : '박상오 주임연구원', options : { removable : true } }, { id : 780, title : '조건희 주임연구원', options : { removable : true } } ])
			.toEqual(reportModel.reportersNameTag());
		});
		
		it("참조자 권한 확인", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("referrer", {
			      "id" : 4891,
			      "nodes" : [ {
			        "id" : 15792,
			        "nodeId" : 889,
			        "nodeType" : "user",
			        "nodeValue" : "박상오 주임연구원",
			        "members" : [ ]
			      }, {
			        "id" : 15791,
			        "nodeId" : 780,
			        "nodeType" : "user",
			        "nodeValue" : "조건희 주임연구원",
			        "members" : [ ]
			      } ]
			    });
		
			expect([ { id : 889, title : '박상오 주임연구원', options : { removable : true } }, { id : 780, title : '조건희 주임연구원', options : { removable : true } } ])
			.toEqual(reportModel.referrersNameTag());
		});
		
		it("관리자 권한 확인", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("admin", {
			      "id" : 4890,
			      "nodes" : [ {
			        "id" : 15790,
			        "nodeId" : 889,
			        "nodeType" : "user",
			        "nodeValue" : "박상오 주임연구원",
			        "members" : [ ]
			      } ]
			    });
			
			expect([ { id : 889, title : '박상오 주임연구원', options : { removable : true } } ])
			.toEqual(reportModel.adminsNameTag());
		});
		
		it("정상 보고서인가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("status", "ACTIVE");
			
			expect(true)
			.toEqual(reportModel.isActive());
		});
		
		it("정지된 보고서인가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("status", "INACTIVE");
			
			expect(true)
			.toEqual(reportModel.isInactive());
		});
		
		it("보고자 이름 출력이 정상적으로 되는가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("reporter", {
		      "id" : 4892,
		      "nodes" : [ {
		        "id" : 15786,
		        "nodeId" : 889,
		        "nodeType" : "user",
		        "nodeValue" : "박상오 주임연구원",
		        "members" : [ ]
		      }, {
		        "id" : 15785,
		        "nodeId" : 780,
		        "nodeType" : "user",
		        "nodeValue" : "조건희 주임연구원",
		        "members" : [ ]
		      } ]
		    });
			
			expect('박상오 주임연구원, 조건희 주임연구원')
			.toEqual(reportModel.reporterNames());
		});
		
		it("보고자 및 하위 부서원 포함 이름 출력이 정상적으로 되는가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("reporter", {"nodes" : [{
				"id" : 15781,
				"nodeId" : 61,
				"nodeType" : "subdepartment",
				"nodeDeptId" : 61,
				"nodeValue" : "GroupWare개발팀",
				"members" : [ ]
				},
				{
					"id" : 15786,
					"nodeId" : 889,
					"nodeType" : "user",
					"nodeValue" : "박상오 주임연구원",
					"members" : [ ]
				}, {
					"id" : 15785,
					"nodeId" : 780,
					"nodeType" : "user",
					"nodeValue" : "조건희 주임연구원",
					"members" : [ ]
				}
				]});
			
			expect('GroupWare개발팀 (하위 부서원 포함 ) , 박상오 주임연구원, 조건희 주임연구원')
			.toEqual(reportModel.reporterNames());
		});
		
		it("보고자 없을 경우 출력이 정상적으로 되는가?", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("reporter", {"nodes" : []});
			
			expect('없음')
			.toEqual(reportModel.reporterNames());
		});
		
		it("참조자 이름 출력 확인", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("referrer", {
			      "id" : 4891,
			      "nodes" : [ {
			        "id" : 15792,
			        "nodeId" : 889,
			        "nodeType" : "user",
			        "nodeValue" : "박상오 주임연구원",
			        "members" : [ ]
			      }, {
			        "id" : 15791,
			        "nodeId" : 780,
			        "nodeType" : "user",
			        "nodeValue" : "조건희 주임연구원",
			        "members" : [ ]
			      } ]
			    });
		
			expect('박상오 주임연구원, 조건희 주임연구원')
			.toEqual(reportModel.referrerNames());
		});
		
		it("참조자 없는 경우 확인", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("referrer", {"nodes" : []});
			
			expect('없음')
			.toEqual(reportModel.referrerNames());
		});
		
		it("관리자 이름 출력 확인", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("admin", {
				"id" : 4891,
				"nodes" : [ {
					"id" : 15792,
					"nodeId" : 889,
					"nodeType" : "user",
					"nodeValue" : "박상오 주임연구원",
					"members" : [ ]
				}, {
					"id" : 15791,
					"nodeId" : 780,
					"nodeType" : "user",
					"nodeValue" : "조건희 주임연구원",
					"members" : [ ]
				} ]
			});
			
			expect('박상오 주임연구원, 조건희 주임연구원')
			.toEqual(reportModel.adminNames());
		});
		
		it("관리자 없을 경우 이름 출력 확인", function() {
			var reportModel = new ReportFolderModel();
			reportModel.set("admin", []);
			
			expect('없음')
			.toEqual(reportModel.adminNames());
		});
		
	});
});