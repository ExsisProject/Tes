define([
    "task/models/domain_code",
    
    "jquery.ajaxmock",
    "GO.util"
], function(
	DomainCode
) {
	describe("task (include taskFolder!)", function() {
		it("url. domainCode 모델 URL", function() {
			$.ajaxMock.register('/api/position/list', {
			    responseText:{
			    	  "data" : [ {
			    		    "id" : 16,
			    		    "code" : "010",
			    		    "name" : "회장",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 17,
			    		    "code" : "020",
			    		    "name" : "부회장",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 1,
			    		    "code" : "030",
			    		    "name" : "사장",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 2,
			    		    "code" : "040",
			    		    "name" : "부사장",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 3,
			    		    "code" : "120",
			    		    "name" : "전무",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 4,
			    		    "code" : "080",
			    		    "name" : "상무",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 18,
			    		    "code" : "090",
			    		    "name" : "상무보",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 5,
			    		    "code" : "070",
			    		    "name" : "이사",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 23,
			    		    "code" : "100",
			    		    "name" : "이사대우",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 6,
			    		    "code" : "150",
			    		    "name" : "부장",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 31,
			    		    "code" : "151",
			    		    "name" : "수석",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 7,
			    		    "code" : "152",
			    		    "name" : "수석연구원",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 8,
			    		    "code" : "160",
			    		    "name" : "차장",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 9,
			    		    "code" : "161",
			    		    "name" : "책임연구원",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 10,
			    		    "code" : "170",
			    		    "name" : "과장",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 11,
			    		    "code" : "171",
			    		    "name" : "선임연구원",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 12,
			    		    "code" : "180",
			    		    "name" : "대리",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 13,
			    		    "code" : "181",
			    		    "name" : "주임연구원",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 22,
			    		    "code" : "500",
			    		    "name" : "선임상담사원",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 21,
			    		    "code" : "600",
			    		    "name" : "주임상담사원",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 20,
			    		    "code" : "700",
			    		    "name" : "상담사원",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 14,
			    		    "code" : "190",
			    		    "name" : "사원",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 15,
			    		    "code" : "191",
			    		    "name" : "연구원",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 32,
			    		    "code" : "200",
			    		    "name" : "수습사원",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 33,
			    		    "code" : "300",
			    		    "name" : "감사",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 34,
			    		    "code" : "130",
			    		    "name" : "사외이사",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 35,
			    		    "code" : "060",
			    		    "name" : "고문",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 36,
			    		    "code" : "110",
			    		    "name" : "상무이사",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 24,
			    		    "code" : "400",
			    		    "name" : "전문위원",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 37,
			    		    "code" : "900",
			    		    "name" : "기타",
			    		    "codeType" : "POSITION"
			    		  }, {
			    		    "id" : 60,
			    		    "code" : "899",
			    		    "name" : "주임",
			    		    "codeType" : "POSITION"
			    		  } ],
			    		  "message" : "OK",
			    		  "code" : "200",
			    		  "__go_checksum__" : true
			    		}
			});
			
			
			$.ajaxMock.register('/api/usergroup/list', {
				responseText:{
					  "data" : [ {
						    "id" : 29,
						    "code" : "U300",
						    "name" : "사내공지관리자",
						    "codeType" : "USERGROUP"
						  }, {
						    "id" : 30,
						    "code" : "U400",
						    "name" : "생활백서관리자",
						    "codeType" : "USERGROUP"
						  }, {
						    "id" : 25,
						    "code" : "U100",
						    "name" : "다우임직원",
						    "codeType" : "USERGROUP"
						  }, {
						    "id" : 27,
						    "code" : "U110",
						    "name" : "다우계열사임직원",
						    "codeType" : "USERGROUP"
						  }, {
						    "id" : 26,
						    "code" : "U200",
						    "name" : "외부협력직원",
						    "codeType" : "USERGROUP"
						  }, {
						    "id" : 96,
						    "code" : "U999",
						    "name" : "설문대상자",
						    "codeType" : "USERGROUP"
						  } ],
						  "message" : "OK",
						  "code" : "200",
						  "__go_checksum__" : true
						}
			});
			
			var domainCode = new DomainCode();
			domainCode.getList("position").done(function() {
				cloneModel = _.clone(domainCode.models);
				expect(domainCode.models.length).toBe(31);
				expect(domainCode.url()).toBe("/api/position/list");
			});
			
			domainCode.getList("usergroup").done(function() {
				expect(domainCode.models.length).toBe(6);
				expect(domainCode["position"].length).toBe(31);
			});
		});
	});
});