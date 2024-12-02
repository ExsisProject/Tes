define('admin/models/auth/admin_auth_group', function(require) {

    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");

    var baseFailHandler = function(response) {
        if (response.responseJSON && response.responseJSON.message) {
            $.goMessage(response.responseJSON.message);
        } else {
            $.goMessage(AdminLang["요청 처리 중 오류가 발생하였습니다."]);
        }
    };

    return Backbone.Model.extend({

        initialize : function(attr, options) {
            var _self = this;
            if (options && options.collection && options.collection.sideMenuCollection) {
                this.sideMenuCollection = options.collection.sideMenuCollection;
                this.inaccessibleMenus = this.getInaccessibleMenus();
            }

            this.sideMenus = _.map(this.sideMenuCollection.models, extendsMenuModel);
            this.sortAuthUsers('userName', true);

            function extendsMenuModel(menuModel) {
                var menu = {
                    uid : menuModel.uid,
                    labelKey : menuModel.labelKey,
                    labelKeyOrigin : menuModel.labelKeyOrigin,
                    isAccessibleLevel : menuModel.isAccessibleLevel,
                    isAccessibleApp : menuModel.isAccessibleApp,
                    checkboxFlag : !_.contains(_self.inaccessibleMenus, menuModel.uid),
                    exceptedMenu : _.contains(['서비스 정보'], menuModel.labelKeyOrigin),
                    subMenus : _.map(menuModel.childs, extendsMenuModel) // <- recursive call
                };

                var isCategory = menuModel.depth == 0;
                if (isCategory) {
                    menu.description = AdminLang[menu.labelKey + ' 권한설명'];
                    menu.withoutSubMenus = _.contains(['보안 관리', '조직 관리', '시스템 연동'], menu.labelKeyOrigin);
                    var isEverySideMenuChecked = _.chain(menu.subMenus)
                        .filter(function(subMenu) { return subMenu.isAccessibleLevel; })
                        .every(function(subMenu) { return subMenu.checkboxFlag; })
                        .value();
                    menu.checkboxFlag = menu.withoutSubMenus ? menu.checkboxFlag : isEverySideMenuChecked;
                }
                return menu;
            }
        },

        url : function() {
            return GO.contextRoot + 'ad/api/domainadmin/auth';
        },

        fetch : function(options) {
            options = options ? options : {};
            if (this.isDefaultGroup()) {
                options.url = this.url() + '/default';
            } else {
                options.url = this.url() + '/' + this.id;
            }
            return Backbone.Model.prototype.fetch.call(this, options)
                .fail(baseFailHandler);
        },

        save : function(options) {
            var _self = this;
            return Backbone.Model.prototype.save.call(this, options)
                .done(function(response) {
                    _self.inaccessibleMenus = response.data.inaccessibleMenus;
                    $.goMessage(CommonLang['저장되었습니다.']);
                })
                .done($.proxy(_self.initialize, _self))
                .fail(baseFailHandler);
        },

        destroy : function(options) {
            options = options ? options : {};
            options.contentType = 'application/json';
            options.data = JSON.stringify(this.attributes);
            options.wait = true;
            return Backbone.Model.prototype.destroy.call(this, options)
                .done(function() {
                    $.goMessage(CommonLang["삭제되었습니다."]);
                })
                .fail(baseFailHandler);
        },

        getInaccessibleMenus : function() {
            return this.get('inaccessibleMenus');
        },

        isDefaultGroup : function() {
            return this.get('defaultGroup');
        },

        deleteAuthUsers : function(ids) {
            var url = GO.contextRoot + "ad/api/domainadmin";
            if (this.isDefaultGroup()) {
                url += "/default/users";
            } else {
                url += "/auth/users";
            }

            return $.ajax({
                url: url,
                type: 'DELETE',
                data : JSON.stringify(ids),
                dataType: 'json',
                contentType: 'application/json',
            }).fail(baseFailHandler);
        },

        addAuthUser : function(userId, removeOtherAuth) {
            var url = GO.contextRoot + "ad/api/domainadmin";
            if (this.isDefaultGroup()) {
                url += "/default/user";
            } else {
                url += "/auth/user";
            }

            return $.ajax({
                url: url,
                type: 'POST',
                data: { authGroupId: this.id, userId: userId, removeOtherAuth : removeOtherAuth }
            }).fail(baseFailHandler);
        },

        sortAuthUsers : function(sortKey, desc) {
            var sortedUsers = this.get('domainAdminAuthUsers');
            if (!sortedUsers) {
                return;
            }

            this.desc = desc;
            this.sortKey = sortKey;
            sortedUsers.sort(function(a, b) {
                var val = 0;
                if (!a[sortKey] && b[sortKey]) {
                    val = -1;
                } else if (a[sortKey] && !b[sortKey]) {
                    val = 1;
                } else if (a[sortKey] > b[sortKey]) {
                    val = 1;
                } else if (a[sortKey] < b[sortKey]) {
                    val = -1;
                }

                return desc ? val : -(val);
            });
            this.set('domainAdminAuthUsers', sortedUsers);
        },

        findAuthUserByUserId : function(userId) {
            var _self = this;
            return _.find(_self.get('domainAdminAuthUsers'), function(authUser) {
                return authUser['userId'] == userId;
            });
        }
    });
});