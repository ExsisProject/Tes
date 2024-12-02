define([
    "backbone"
],

function(
    Backbone
) {
    
    var UserIntegrationModel = Backbone.Model.extend({
        
        defaults:  {
            id : null,
            users : null
        },
        
        initialize: function() {
            if (_.isEmpty(this.get('users'))) {
                this.set('users', []);
            }
        },
        
        hasCompanyUser: function(companyId) {
            var result = false;
            _.each(this.get('users'), function(user) {
                if (!_.isUndefined(user['companyId']) && !_.isUndefined(companyId)) {
                    if (String(user['companyId']) == String(companyId)) {
                        result = true;
                    }
                }
            });
            
            return result;
        },
        
        generateUserListKey: function() {
            var userIds = _.map(this.get('users'), function(user) { return user['id']; });
            return UserIntegrationModel.generateUserListKey(userIds);
        },
        
        moveUserTop: function(targetId) {
            this.removeUser(targetId, function(users, target, index) {
                users.add(target, {
                    'at' : 0
                });
            });
        },
        
        moveUserUp: function(targetId) {
            this.removeUser(targetId, function(users, target, index) {
                users.add(target, {
                    'at' : index == 0 ? 0 : index - 1
                });
            });
        },
        
        moveUserDown: function(targetId) {
            this.removeUser(targetId, function(users, target, index) {
                users.add(target, {
                    'at' : index == users.size() ? index : index + 1
                });
            });
        },
        
        moveUserBottom: function(targetId) {
            this.removeUser(targetId, function(users, target, index) {
                users.add(target);
            });
        },
        
        removeUser: function(targetId, afterRemoveCallback) {
            var users = new Backbone.Collection(this.get('users')),
                target = users.get(targetId),
                index = users.indexOf(target);
            
            if (!target) {
                return target;
            }
            
            users.remove(target);
            if (_.isFunction(afterRemoveCallback)) {
                afterRemoveCallback(users, target, index);
            }
            
            this.set('users', users.toJSON());
            return target;
        },
    },
    {
        generateUserListKey: function(userIds) {
            return userIds.join('#');
        }
    });

    return UserIntegrationModel;
});