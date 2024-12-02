define(function (require) {
    var Backbone = require("backbone");
    var instance = null;
    var ContactGroups = Backbone.Model.extend({
        url: "/api/contact/side",
        initialize: function () {

        },

        getSortedDataByPriority: function () {
            var companyContact = this.get('companyGroups') || [];
            var personalContact = this.get('personalGroups') || [];
            var departmentContact = this.get('deptGroups') || [];
            var sidePriority = this.get('priority').priorityTypes;
            var typeData = [
                {
                    type: "USER",
                    groups: personalContact
                },
                {
                    type: "DEPARTMENT",
                    deptInfo: departmentContact
                }
            ];

            if (companyContact.length > 0 || this.get("admin")) {
            	companyContact = _.each(companyContact, function(data){
            		var parentPathName = data.parentPathName,
            			depth = parentPathName ? parentPathName.split('>').length - 1 : 0;
            			data.depth = depth;
            	});
            	companyContact = _.chain(companyContact).sortBy(function(data){
            		if(data.parent.length > 0){
                    	return data.parent[data.parent.length - 1].seq;
                    }
            	}).sortBy("seq").sortBy("depth").value();
            	
                typeData.push({
                    type: "COMPANY",
                    groups: companyContact
                });
            }

            var sortedData = _.sortBy(typeData, function (data) {
                return sidePriority.indexOf(data.type);
            });
            return sortedData;
        },

        /**
         * contact home 부분에 표현해야할 contact 를 반환합니다.
         * case1) 우선순위가 공용주소록이 먼저인데 그룹이 없을 경우는 다음 우선순위가 반환됩니다.
         * case2) 부서도 없을 경우에는 다음 주소록 반환
         *
         * return {
         *     type : "USER", "DEPARTMENT", "COMPANY" (공통반환)
         *     deptId : type이 DEPARTMENT 경우에만 반환
         *     groupId : type이 COMPANY 일 경우에만 반환
         * }
         *
         */
        getInitMenu: function () {
            var sortedMenus = this.getSortedDataByPriority();
            var initMenu = getFirstMenu(sortedMenus);

            function getFirstMenu(sortedMenus) {
                var initMenu = sortedMenus.splice(0, 1)[0];

                if (sortedMenus.length == 0 || isValid(initMenu)) {
                    return initMenu
                }
                ;

                return getFirstMenu(sortedMenus);
            }


            function isValid(menu) {
                // 우선 순위가 company 이지만 그룹이 없을 경우에는 다음 순번이 우선순위가 됨.
                if (menu.type == "COMPANY" && menu.groups.length == 0) {
                    return false;
                }

                if (menu.type == "DEPARTMENT" && menu.deptInfo.length == 0) {
                    return false;
                }

                return true;
            }

            var result = {type: initMenu.type};
            if (initMenu.type == "DEPARTMENT") {
                result.deptId = initMenu.deptInfo[0].deptId;
            }

            if (initMenu.type == "COMPANY") {
                result.groupId = initMenu.groups[0].id;
            }

            return result;
        },

        getContactListExposure : function() {
            return this.get('contactListExposure');
        },

        getPersonalGroups : function(){
            return new Backbone.Collection(this.get('personalGroups'));
        },


        getDeptGroups : function(){
            return new Backbone.Collection(this.get('deptGroups'));
        },

        getCompanyGroups : function(){
            return new Backbone.Collection(this.get('companyGroups'));
        },

        isAdmin : function(){
            return this.get("admin");
        }
    }, {
        get: function () {
            if (instance == null) instance = new ContactGroups();
            instance.fetch({async: false});
            return instance;
        },
        init: function () {
            return new ContactGroups();
        }
    });

    return {
        read: function () {
            return ContactGroups.get();
        },
        init: function () {
            return ContactGroups.init();
        }
    };
});