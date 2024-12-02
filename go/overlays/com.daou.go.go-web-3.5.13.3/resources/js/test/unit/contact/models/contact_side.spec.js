define(function(require) {
    var ContactSideModel = require("contact/models/contact_side");

	describe("contact side test", function() {
		it("우선순위가 [DEPARTMENT, COMPANY, USER] 순서일때 " +
            "부서 정보 출력 확인", function() {
			var contactSideModel = ContactSideModel.init();

            contactSideModel.set("priority", {"priorityTypes" : [ "DEPARTMENT", "COMPANY", "USER" ]})

            var userGroups = makeUserGroup();
            var companyGroups = makeCompanyGroup();
            var deptGroups = makeDeptGroup();

            contactSideModel.set("personalGroups", userGroups);
            contactSideModel.set("companyGroups", companyGroups);
            contactSideModel.set("deptGroups", deptGroups);

            var initMenu = contactSideModel.getInitMenu();

            expect("DEPARTMENT")
			.toEqual(initMenu.type);

            expect(deptGroups[0].deptId)
                .toEqual(initMenu.deptId);
		});

        it("우선순위가 [DEPARTMENT, COMPANY, USER] 순서일때 " +
            "부서정보가 없다면 공용주소록 첫번째 요소 출력 확인", function() {
            var contactSideModel = ContactSideModel.init();

            contactSideModel.set("priority", {"priorityTypes" : [ "DEPARTMENT", "COMPANY", "USER" ]})

            var userGroups = makeUserGroup();
            var companyGroups = makeCompanyGroup();

            contactSideModel.set("personalGroups", userGroups);
            contactSideModel.set("companyGroups", companyGroups);
            contactSideModel.set("deptGroups", []);

            var initMenu = contactSideModel.getInitMenu();

            expect("COMPANY")
                .toEqual(initMenu.type);

            expect(companyGroups[0].id)
                .toEqual(initMenu.groupId);
        });

        it("우선순위가 [DEPARTMENT, COMPANY, USER] 순서일때 " +
            "부서정보와 COMPANY정보가 없다면 USER 정보 출력", function() {
            var contactSideModel = ContactSideModel.init();

            contactSideModel.set("priority", {"priorityTypes" : [ "DEPARTMENT", "COMPANY", "USER" ]});

            var userGroups = makeUserGroup();

            contactSideModel.set("personalGroups", userGroups);
            contactSideModel.set("companyGroups", []);
            contactSideModel.set("deptGroups", []);

            var initMenu = contactSideModel.getInitMenu();

            expect("USER")
                .toEqual(initMenu.type);
        });

        it("우선순위가 [DEPARTMENT, COMPANY, USER] 순서일때 " +
            "부서정보와 COMPANY정보와 USER 그룹정보가 없을경우에 USER 정보 출력", function() {
            var contactSideModel = ContactSideModel.init();

            contactSideModel.set("priority", {"priorityTypes" : ["DEPARTMENT", "COMPANY", "USER"]});

            contactSideModel.set("deptGroups", []);
            contactSideModel.set("personalGroups", []);
            contactSideModel.set("companyGroups", []);

            var initMenu = contactSideModel.getInitMenu();

            expect("USER")
                .toEqual(initMenu.type);
        });

        it("우선순위가 [DEPARTMENT, USER, COMPANY] 순서일때 " +
            "부서정보와 COMPANY정보와 USER 그룹정보가 없을경우에 USER 정보 출력", function() {
            var contactSideModel = ContactSideModel.init();

            contactSideModel.set("priority", {"priorityTypes" : ["DEPARTMENT", "USER", "COMPANY"]});

            contactSideModel.set("deptGroups", []);
            contactSideModel.set("personalGroups", []);
            contactSideModel.set("companyGroups", []);

            var initMenu = contactSideModel.getInitMenu();

            expect("USER")
                .toEqual(initMenu.type);
        });


        it("우선순위가 [USER, DEPARTMENT, COMPANY] 순서일때 " +
            "부서정보와 COMPANY정보와 USER 그룹정보가 없을경우에 USER 정보 출력", function() {
            var contactSideModel = ContactSideModel.init();

            contactSideModel.set("priority", {"priorityTypes" : ["USER", "DEPARTMENT", "COMPANY"]});

            contactSideModel.set("deptGroups", []);
            contactSideModel.set("personalGroups", []);
            contactSideModel.set("companyGroups", []);

            var initMenu = contactSideModel.getInitMenu();

            expect("USER")
                .toEqual(initMenu.type);
        });

	});

    function makeUserGroup(){
        return [{
            "id" : 53,
            "name" : "test"
        }];
    }

    function makeDeptGroup(){
        return [
            {
                "deptId" : 7,
                "deptName" : "메일팀",
                "groups" : [ {
                    "id" : 80,
                    "deptName" : "메일팀"
                }]
            }
        ];
    }

    function makeCompanyGroup(){
        return [
            {
                "id": 90,
                "name": "전사 주소록"
            },{
                "id": 92,
                "name": "전사 주소록2"
            }];
    }
});