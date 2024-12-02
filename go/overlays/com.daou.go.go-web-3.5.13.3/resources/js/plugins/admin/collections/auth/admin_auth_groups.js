define('admin/collections/auth/admin_auth_groups', function(require) {

    var AdminAuthModel = require('admin/models/auth/admin_auth_group');
    var AdminLang = require("i18n!admin/nls/admin");
    var SideMenuCollection = require('admin/collections/side_menu_collection');

    var baseFailHandler = function(response) {
        if (response.responseJSON && response.responseJSON.message) {
            $.goMessage(response.responseJSON.message);
        } else {
            $.goMessage(AdminLang["요청 처리 중 오류가 발생하였습니다."]);
        }
    };

    return Backbone.Collection.extend({

        model : AdminAuthModel,

        initialize : function() {
            this.sideMenuCollection = new SideMenuCollection();
        },

        url : function() {
            return GO.contextRoot + 'ad/api/domainadmin/auth/all';
        },

        getDefaultAuthGroup : function() {
            return this.findWhere({defaultGroup : true});
        },

        getById : function(id) {
            return this.findWhere({id : id});
        },

        addGroup : function(name) {
            name = name.trim();
            this.validateDuplicatedName(name);
            var _self = this;
            var model = new AdminAuthModel({name : name}, {collection:_self});
            return model.save()
                .done(function() {
                    _self.add(model);
                })
                .fail(baseFailHandler);
        },

        modifyGroup : function(modelId, name) {
            name = name.trim();
            this.validateDuplicatedName(name, modelId);
            var model = this.get(modelId);
            var originName = model.get('name');
            return model.save({name : name})
                .fail(baseFailHandler)
                .fail(function() {
                    model.set('name', originName);
                });
        },

        validateDuplicatedName : function(name, modelId) {
            if (!name) {
                return;
            }

            var duplicatedModel = this.findWhere({name: name});
            if (!duplicatedModel) {
                return;
            }

            var isSelf = modelId != null && duplicatedModel.id == modelId;
            if (isSelf) {
                return;
            }

            $.goMessage(AdminLang['중복된 이름이 존재합니다.']);
            throw new Error();
        },

        findAuthUsersByUserId : function(userId) {
            var _self = this;
            var authUserList = [];
            _.each(_self.models, function(authGroup) {
                var authUser = authGroup.findAuthUserByUserId(userId);
                if (authUser) {
                    authUserList.push(authUser);
                }
            });
            return authUserList;
        },

        defaultGroupUserList : function() {
            var defaultGroupUserList = [];

            _.each(this.models, function(authGroup) {
                if(authGroup.isDefaultGroup()) defaultGroupUserList = authGroup.attributes.domainAdminAuthUsers
            })

            return defaultGroupUserList;
        }
    });
});