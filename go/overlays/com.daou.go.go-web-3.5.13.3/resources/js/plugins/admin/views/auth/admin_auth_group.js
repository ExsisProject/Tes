define('admin/views/auth/admin_auth_group', function(require) {

    require("jquery.go-orgslide");
    var AdminAuthGroupTmpl = require('hgn!admin/templates/auth/admin_auth_group');
    var AdminAuthUserTmpl = require('hgn!admin/templates/auth/admin_auth_user_list');
    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");

    var adminAuthGroupView = Backbone.View.extend({

        el : '#adminAuthGroup',

        events : {
            'click #groupSaveBtn' : 'onGroupSaveBtnClicked',
            'click #groupCancelBtn' : 'onGroupCancelBtnClicked',
            'click #adminUserAddBtn' : 'onAdminUserAddBtnClicked',
            'click #adminUserDelBtn' : 'onAdminUserDelBtnClicked',
            'click .category' : 'onCategoryClicked',
            'click .title_sort' : 'onAuthUserSortClicked',
            'click .sideMenu' : 'onSideMenuClicked',
            'click #allUserSelector' : 'onAllUserSelectorClicked',
        },

        initialize : function(options) {
            this.authGroup = options.authGroup;
            this.authGroupCollection = options.authGroupCollection;
            this.authUserListEl = '#adminAuthUserList';
        },

        render : function() {
            this.$el.html(AdminAuthGroupTmpl({
                authGroup : this.authGroup,
                adminLang : AdminLang,
                commonLang : CommonLang,
            }));
            this.authGroup.sortAuthUsers('userName', true);
            this.renderAuthUserList();
        },

        renderAuthUserList : function() {
            this.$el.find(this.authUserListEl).html(AdminAuthUserTmpl({
                authGroup : this.authGroup,
                adminLang : AdminLang,
                commonLang : CommonLang
            }));
        },

        remove : function() {
            this.undelegateEvents();
            this.$el.removeData().unbind();
            this.$el.html("");
        },

        getInaccessibleMenusByPage : function() {
            var sideMenus = this.$el.find('.sideMenu');
            var uncheckedMenus = _.filter(sideMenus, function(sideMenu) {
                var $sideMenu = $(sideMenu);
                var sideMenuIsUnchecked = !$sideMenu.prop('checked');

                var isCategory = $sideMenu.hasClass('category');

                if (isCategory) {
                    var sideMenuContainer = $sideMenu.closest('.com_opt_container');
                    var sideMenus = sideMenuContainer.find('.sideMenu').not('.category');
                    if (sideMenus.size() < 1) {
                        return sideMenuIsUnchecked;
                    }

                    var everyCategoryIsUnchecked = _.every(sideMenus, function(menu) {
                        return !$(menu).prop('checked');
                    });

                    return everyCategoryIsUnchecked;
                } else {
                    return sideMenuIsUnchecked;
                }
            });

            return _.map(uncheckedMenus, function(sideMenu) {
                return $(sideMenu).data('id');
            });
        },

        onCategoryClicked : function(e) {
            (function __changeSideMenuCheckbox() {
                var category = $(e.currentTarget);
                var categoryIsChecked = category.prop('checked');
                var categoryContainer = category.closest('.com_opt_container');
                var sideMenus = categoryContainer.find('.sideMenu');
                sideMenus.prop('checked', categoryIsChecked);
            })();
        },

        onSideMenuClicked : function(e) {
            (function __changeCategoryCheckbox() {
                var sideMenu = $(e.currentTarget);
                if (sideMenu.hasClass('category')) {
                    return;
                }

                var sideMenuContainer = sideMenu.closest('.com_opt_container');
                var category = sideMenuContainer.find('.category');
                var sideMenus = sideMenuContainer.find('.sideMenu').not('.category');

                var everyCategoryIsChecked = _.every(sideMenus, function(sideMenu) {
                    return $(sideMenu).prop('checked');
                });

                category.prop('checked', everyCategoryIsChecked);
            })();
        },

        onGroupSaveBtnClicked : function() {
            var _self = this;
            $.goPopup({
                title : AdminLang['저장하시겠습니까?'],
                buttons : [{
                    btype : 'confirm',
                    btext: CommonLang['저장'],
                    callback: function() {
                        GO.util.preloader(
                            _self.authGroup.save({ inaccessibleMenus : _self.getInaccessibleMenusByPage() })
                        );
                    }
                }, {
                    btype : 'close', btext: CommonLang['취소']
                }]
            });
        },

        defaultGroupLimitUserErrorType: {
            ADD: 'add',
            REMOVE: 'remove'
        },

        defaultGroupLimitUserErrorPopup : function(type) {
            var title = type === this.defaultGroupLimitUserErrorType.ADD ? AdminLang['관리자 추가 불가'] : AdminLang['관리자 삭제 불가']

            $.goPopup({
                title : title,
                contents: AdminLang['관리자 삭제 불가 설명'],
                buttons : [{
                    btype : 'close', btext: CommonLang['확인']
                }]
            });
            return;
        },

        onAdminUserAddBtnClicked : function(e) {
            var _self = this;

            var callback = function(data) {
                var authUser = _self.authGroupCollection.findAuthUsersByUserId(data.id)[0] || undefined;
                var getAuthUserAttr = function(target) {
                    if (_.isUndefined(authUser)) return undefined;
                    return authUser[target];
                }
                var userId = data.id;
                var authUserNames = getAuthUserAttr('authGroupName');
                var defaultGroupUserList = _self.authGroupCollection.defaultGroupUserList();

                if(getAuthUserAttr('domainAdminAuthGroupId' === _self.authGroup.id)) {
                    $.goMessage(AdminLang['이미 추가된 사용자 입니다.']);
                    return;
                }

                if (!_self.authGroup.attributes.defaultGroup
                    && defaultGroupUserList.length === 1
                    && (getAuthUserAttr('defaultGroup') || false)) {
                    _self.defaultGroupLimitUserErrorPopup(_self.defaultGroupLimitUserErrorType.ADD);
                    return;
                }

                if (!_.isUndefined(authUser)) {
                    __addAuthUserWithPopup()
                } else {
                    __addAuthUserWithoutPopup();
                }

                function __addAuthUserWithPopup() {
                    var popupBtn = [{
                        btype : 'confirm',
                        btext: CommonLang["삭제"],
                        callback: function() { _self.addAuthUser(userId, true); }
                    }];

                    var isNotDefaultGroup = !_self.authGroup.isDefaultGroup();
                    var hasNotDefaultGroupAuth = getAuthUserAttr('defaultGroup') || false;

                    if (isNotDefaultGroup && hasNotDefaultGroupAuth) {
                        popupBtn.push({
                            btype : 'close',
                            btext: CommonLang["유지"],
                            callback : function() { _self.addAuthUser(userId, false); }
                        })
                    }

                    $.goPopup({
                        title : AdminLang['관리자권한 추가 팝업 타이틀'],
                        contents : '<span class="title">(' + authUserNames + ')</span>',
                        buttons : popupBtn
                    });
                }

                function __addAuthUserWithoutPopup() {
                    _self.addAuthUser(userId, false)
                }

            };

            $.goOrgSlide({
                header : AdminLang['관리자 추가'],
                callback : callback,
                target : e,
                isAdmin : true,
                contextRoot : GO.contextRoot
            });
        },

        addAuthUser : function(userId, removeOtherAuth) {
            this.userChangePromiseHandler(this.authGroup.addAuthUser(userId, removeOtherAuth));
        },

        onAdminUserDelBtnClicked : function() {
            var delUserEls = this.$el.find('.authUser input[type="checkbox"]:checked');
            if (delUserEls.size() < 1) {
                $.goMessage(CommonLang['최소한 1개 이상 선택하여야 합니다.']);
                return;
            }

            if (!(this.$el.find('.authUser').size() - delUserEls.size() > 0) && this.authGroup.attributes.defaultGroup) {
                this.defaultGroupLimitUserErrorPopup(this.defaultGroupLimitUserErrorType.REMOVE)
                return;
            }

            var deleteUsers = function() {
                var dataKey = this.authGroup.isDefaultGroup() ? 'userid' : 'id';
                var ids = _.map(delUserEls, function(delUserEl) {
                    return $(delUserEl).data(dataKey);
                });
                this.userChangePromiseHandler(this.authGroup.deleteAuthUsers(ids));
            };

            $.goPopup({
                title : AdminLang['관리자 삭제 알림'],
                buttons : [{
                    btype : 'confirm',
                    btext: CommonLang["삭제"],
                    callback: $.proxy(deleteUsers, this)
                }, {
                    btype : 'close', btext: CommonLang['취소']
                }]
            });
        },

        userChangePromiseHandler : function(promise) {
            var _self = this;
            GO.util.preloader(promise);
            promise.then(function() {
                return _self.authGroupCollection.fetch();
            }).then(function() {
                _self.authGroup.sortAuthUsers(_self.authGroup.sortKey, _self.authGroup.desc);
                _self.renderAuthUserList();
                $('#adminAuthList').trigger('renderAdminAuthList', _self.authGroup);
            });
        },

        onGroupCancelBtnClicked : function() {
            $.goMessage(CommonLang['취소되었습니다.']);
            this.remove();
            this.render();
        },

        onAuthUserSortClicked : function(e) {
            var sortKey = $(e.currentTarget).data('sortkey');
            var desc = this.authGroup.sortKey == sortKey ? !this.authGroup.desc : this.authGroup.desc;
            this.authGroup.sortAuthUsers(sortKey, desc);
            this.renderAuthUserList();
        },

        onAllUserSelectorClicked : function(e) {
            var isChecked = $(e.currentTarget).prop('checked');
            this.$el.find('.authUser input[type="checkbox"]').prop('checked', isChecked);
        }
    });

    return adminAuthGroupView;
});