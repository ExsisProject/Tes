(function() {
	define(function(require) {
		var MobileLayout = require("views/layouts/mobile_default");
		var Side = require("contact/views/mobile/m_side");

		var appName = 'contact';
		var LayoutView = MobileLayout.create();
		var SideMenuView = Side.create(appName);

		var parseType = {
			'personal' : 'USER',
			'dept' : 'DEPARTMENT',
			'company' : 'COMPANY'
		}

		var renderSideMenu = function() {
			if($('body').data('sideApp') != appName) {
				SideMenuView.dataFetch().done(function() {
					var sideEl = LayoutView.getSideContentElement().append(SideMenuView.el);
                    if(SideMenuView.getContactListExposure()) {
                        SideMenuView.render();
                    }
					sideEl.parent().hide();
				});
			} else {
				return;
			}
		};

		return {
            render : function() {
                require(["contact/views/mobile/m_home"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        renderSideMenu.call(this);
                        var initParam = SideMenuView.getInitParam();
                        HomeListView.render({
                            type : initParam.type,
                            deptId : initParam.deptId,
                            groupId : initParam.groupId,
                            contactListExposure : SideMenuView.getContactListExposure()
                        });

                    });
                });
            },

            /**
             * 개인주소록 메인 화면(전체)
             * @param contactType
             */
            renderContactPersonList : function(contactType) {
                require(["contact/views/mobile/m_home"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            type:parseType['personal'],
                        });
                        renderSideMenu.call(this);
                    });
                });
            },

            /**
             * 개인 그룹별 주소록 메인 화면
             * @param contactType
             * @param groupId
             */
            renderContactPersonGroupList : function(groupId) {
                require(["contact/views/mobile/m_home"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            type:parseType['personal'],
                            groupId: groupId,
                        });
                        renderSideMenu.call(this);
                    });
                });
            },

            /**
             * 공용 그룹별 주소록 메인 화면
             * @param contactType
             * @param groupId
             */
            renderContactCompanyGroupList : function(groupId) {
                require(["contact/views/mobile/m_home"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            type:parseType['company'],
                            groupId: groupId,
                        });
                        renderSideMenu.call(this);
                    });
                });
            },

            /**
             * 부서별 전체주소록 메인 화면
             * @param contactType
             * @param groupId
             */
            renderContactDeptList : function(deptId) {
                require(["contact/views/mobile/m_home"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            type:parseType['dept'],
                            deptId: deptId,
                        });
                        renderSideMenu.call(this);
                    });
                });
            },

            /**
             * 부서별 그룹별 주소록 메인 화면
             * @param contactType
             * @param groupId
             */
            renderContactDeptGroupList : function(deptId, groupId) {
                require(["contact/views/mobile/m_home"], function (HomeListView) {
                    LayoutView.render(appName).done(function (layout) {
                        HomeListView.render({
                            type: parseType['dept'],
                            deptId: deptId,
                            groupId: groupId,
                        });
                        renderSideMenu.call(this);
                    });
                });
            },

            /**
             * 개인 주소록 상세 뷰 화면
             * @param groupId
             * @param id
             */
            renderPersonalDetail : function(id) {
                require(["contact/views/mobile/m_detail"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            contactId : id,
                            type : parseType['personal'],
                            viewMode : 'detail'
                        });
                        layout.getSearchWrapElement().hide();
                    });
                });
            },

            /**
             * 개인 그룹 주소록 상세 뷰 화면
             * @param groupId
             * @param id
             */
            renderPersonalGroupDetail : function(groupId, id) {
                require(["contact/views/mobile/m_detail"], function (HomeListView) {
                    LayoutView.render(appName).done(function (layout) {
                        HomeListView.render({
                            contactId: id,
                            groupId: groupId,
                            type: parseType['personal'],
                            viewMode: 'detail'
                        });
                    });
                });
            },

            /**
             * 공용 주소록 상세 뷰 화면
             * @param groupId
             * @param id
             */
            renderCompanyDetail : function(groupId, id) {
                require(["contact/views/mobile/m_detail"], function (HomeListView) {
                    LayoutView.render(appName).done(function (layout) {
                        HomeListView.render({
                            contactId: id,
                            groupId: groupId,
                            type: parseType['company'],
                            viewMode: 'detail'
                        });
                    });
                });
            },

            /**
             * 부서 주소록 상세 뷰 화면
             * @param groupId
             * @param id
             */
            renderDeptDetail : function(deptId, id) {
                require(["contact/views/mobile/m_detail"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            contactId : id,
                            deptId : deptId,
                            type : parseType['dept'],
                            viewMode : 'detail'
                        });
                    });
                });
            },

            /**
             * 부서 그룹 주소록 상세 뷰 화면
             * @param groupId
             * @param id
             */
            renderDeptGroupDetail : function(deptId, groupId, id) {
                require(["contact/views/mobile/m_detail"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            contactId : id,
                            deptId : deptId,
                            groupId : groupId,
                            type : parseType['dept'],
                            viewMode : 'detail'
                        });
                    });
                });
            },

            /**
             * 개인 주소록 생성
             * @param groupId
             * @param id
             */
            renderContactCreate : function() {
                require(["contact/views/mobile/m_create"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            type : parseType['personal'],
                            viewMode : 'create'
                        });
                    });
                });
            },

            /**
             * 개인 그룹 주소록 생성
             * @param groupId
             * @param id
             */
            renderPersonalGroupCreate : function(groupId) {
                require(["contact/views/mobile/m_create"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            groupId : groupId,
                            type : parseType['personal'],
                            viewMode : 'create'
                        });
                    });
                });
            },

            /**
             * 공용 그룹 주소록 생성
             * @param groupId
             * @param id
             */
            renderCompanyGroupCreate : function(groupId) {
                require(["contact/views/mobile/m_create"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            groupId : groupId,
                            type : parseType['company'],
                            viewMode : 'create'
                        });
                    });
                });
            },

            /**
             * 부서 주소록 생성
             * @param groupId
             * @param id
             */
            renderDeptCreate : function(deptId) {
                require(["contact/views/mobile/m_create"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            deptId : deptId,
                            type : parseType['dept'],
                            viewMode : 'create'
                        });
                    });
                });
            },

            /**
             * 부서 그룹 주소록 생성
             * @param groupId
             * @param id
             */
            renderDeptGroupCreate : function(deptId, groupId) {
                require(["contact/views/mobile/m_create"], function (HomeListView) {
                    LayoutView.render(appName).done(function (layout) {
                        HomeListView.render({
                            deptId: deptId,
                            groupId: groupId,
                            type: parseType['dept'],
                            viewMode: 'create'
                        });
                    });
                });
            },

            /**
             * 개인 주소록 수정
             * @param groupId
             * @param id
             */
            renderPersonalModify : function(id) {
                require(["contact/views/mobile/m_create"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            contactId : id,
                            type : parseType['personal'],
                            viewMode : 'modify'
                        });
                    });
                });
            },

            /**
             * 개인 그룹 주소록 수정
             * @param groupId
             * @param id
             */
            renderPersonalGroupModify : function(groupId, id) {
                require(["contact/views/mobile/m_create"], function (HomeListView) {
                    LayoutView.render(appName).done(function (layout) {
                        HomeListView.render({
                            contactId: id,
                            groupId: groupId,
                            type: parseType['personal'],
                            viewMode: 'modify'
                        });
                    });
                });
            },

            /**
             * 공용 그룹 주소록 수정
             * @param groupId
             * @param id
             */
            renderCompanyModify : function(groupId, id) {
                require(["contact/views/mobile/m_create"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            contactId : id,
                            groupId : groupId,
                            type : parseType['company'],
                            viewMode : 'modify'
                        });
                    });
                });
            },

            /**
             * 부서 주소록 수정
             * @param groupId
             * @param id
             */
            renderContactDeptModify : function(deptId, id) {
                require(["contact/views/mobile/m_create"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            contactId : id,
                            deptId : deptId,
                            type : parseType['dept'],
                            viewMode : 'modify'
                        });
                    });
                });
            },

            /**
             * 부서 그룹 주소록 수정
             * @param groupId
             * @param id
             */
            renderContactDeptGroupModify : function(deptId, groupId, id) {
                require(["contact/views/mobile/m_create"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render({
                            contactId : id,
                            groupId : groupId,
                            deptId : deptId,
                            type : parseType['dept'],
                            viewMode : 'modify'
                        });
                    });
                });
            },

            renderSearch : function() {
                require(["contact/views/mobile/m_search"], function(HomeListView) {
                    LayoutView.render(appName).done(function(layout) {
                        HomeListView.render();
                        //renderSideMenu.call(this);
                    });
                });
            }
		};
	});

}).call(this);