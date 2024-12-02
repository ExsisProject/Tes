define('admin/models/auth/app_integrated_auth', function (require) {

    var AuthModel = Backbone.Model.extend({

        initialize: function (options, groupName, groupKey) {

            var self= this;
            this.attributes = options;
            this.groupName = groupName;
            this.groupKey = groupKey;

            this.authLevel = this.get('authLevel');
            this.name = this.get('name');
            this.contentName = this.get('contentName');
            this.contentId = this.get('contentId') ? this.get('contentId') : 0;
            this.checked = false;
            this.view = true;
            this.owner = this.get('owner');

            this.originLink = this.get('originLink');
            this.appAuthType= this.get('authType');
            this.authDataType = this.get('authDataType');
            this.circle = this.get('circle');

            if( !!this.circle) {
                this.firstCircle = JSON.parse(JSON.stringify(this.get('circle')));
            }
            this.originCircle = this.get('originCircle');

            this.users = this.get('users');
            this.tooltip = this.get('tooltip');
            this.actionModel = this.get('actionModels');
            this.companyShare = this.get('companyShare');
            this.contentKey = this.appAuthType + '_' + this.contentId;
            this.contentSize = this.get('contentSize');
        },
        isEmptyContent:function(){
           return this.contentSize === 0 ;
        },
        duplicatedCheckCircle:function(circle){
            if( !!!circle || !!!circle.nodes ||  circle.nodes.length < 2){
                return circle;
            }

            for(var i =0 ;i < circle.nodes.length; i ++){
                var lnode = circle.nodes[i];
                if( lnode.nodeType !=='user'){ continue; }
                for ( var j =i+1 ; j < circle.nodes.length; j ++){
                    var rnode = circle.nodes[j];
                    if( lnode.nodeId=== rnode.nodeId && rnode.nodeType ==='user'){
                        circle.nodes.splice(j, 1);
                    }
                }
            }
            return circle;
        },
        clearData:function(){
           this.circle = {} ;
           this.actionModel = [];
           this.updated = true;
        },
        updateCircleData:function(circle){
            this.circle = this.duplicatedCheckCircle(circle);
            this.updated = true;
        },
        updateCircle: function (circle ) {
            this.circle = this.duplicatedCheckCircle(circle);
            var self = this;
            $.ajax({
                url: GO.contextRoot + "ad/api/auth/save",
                data: self.getSaveJsonStr(),
                type: 'POST',
                async:false,
                contentType: 'application/json',
                success: function (res) {
                }, error: function (resp) {
                }
            });
        },

        addUser: function (user) {
            var self = this;

            if( this.authDataType === 'CIRCLE_ACTION') {
                this.addUserModel(user);
                this.updated = true;
                return;
            }

            $.ajax({
                url: GO.contextRoot + "ad/api/auth/save",
                data: this.getSaveJsonStr(user),
                type: 'POST',
                async: false,
                contentType: 'application/json',
                success: function (res) {
                    self.addUserModel(user);
                }, error: function (resp) {
                }
            });
        },
        clear:function(){
         this.users = [];
         this.circle = {};
         this.actionModel = [];
        },
        isOnlyUserCircle:function(){
            if( !this.circle || !this.circle.nodes ){
                return false;
            }
            var onlyUsers = true;
            for( var i =0 ;i <  this.circle.nodes.length; i ++){
                if( this.circle.nodes[i].nodeType !== 'user'){
                    onlyUsers = false;
                    break;
                }
            }
            return onlyUsers;
        },
        clearUser: function () {
            var self = this;
            var removeUsers = [];

            if (this.users ) {
                _.forEach(this.users, function (us) {
                    removeUsers[removeUsers.length] = self.getSaveModel(us);
                })
            }
            else if ( this.actionModel){

                _.forEach(this.actionModel, function (am) {
                    removeUsers[removeUsers.length] = self.getSaveModel(am.user);
                })
            }
            else if (this.circle) {
                if( this.isOnlyUserCircle()) {
                    var users =[];
                    _.forEach(this.circle.nodes, function (nd) {
                        if (nd && nd.nodeType === 'user') {
                            users[users.length] = nd.nodeId;
                        } });
                    var saveModel= self.getSaveModel({id: 0});
                    saveModel.userIds= users;
                    removeUsers[removeUsers.length] = saveModel;
                }else{
                    this.updateCircle({});
                }
            }

            return removeUsers;
            //this.clear();
        },
        removeUser: function (user) {
            var self = this;

            if( this.authDataType === 'CIRCLE_ACTION'){
                this.removeUserModel(user);
                this.updated = true;
                return;
            }

            $.ajax({
                url: GO.contextRoot + "ad/api/auth/remove",
                data: this.getSaveJsonStr(user),
                type: 'POST',
                async:false,
                contentType: 'application/json',
                success: function (res) {
                    self.removeUserModel(user);
                }, error: function (resp) {
                }
            });
        },
        removeUserModel: function (user) {
            if (this.users) {
                for (var i = 0; i < this.users.length; i++) {
                    if (this.users[i].id == user.id) {
                        this.users.splice(i, 1);
                        return;
                    }
                }
            } else if (this.actionModel) {
                for (var i = 0; i < this.actionModel.length; i++) {
                    if (this.actionModel[i].user.id == user.id) {
                        this.actionModel.splice(i, 1);
                        return;
                    }
                }
            }
        },
        addUserModel: function (user) {

            if (this.authDataType === 'USER_ACTION' || this.authDataType === 'CIRCLE_ACTION' ) {
                var existAction = this.findAction(user.id);
                if (existAction) {
                    return;
                }
                if( !this.actionModel){ this.actionModel = []; }

                this.actionModel[this.actionModel.length] = {
                    user: user,
                    read: true,
                    write: true,
                    remove: true,
                    manage: true
                };
            } else if (this.authDataType === 'USER') {
                if( this.appAuthType === 'CommunityMaster'){
                    this.users = [];
                    this.users[0] = user;
                    return;
                }

                var existUser = this.findUser(user.id);
                if (existUser) {
                    return;
                }
                if( !this.users){ this.users= []; }

                this.users[this.users.length] = user
            }

            this.updated = true;
        },

        getSaveJsonStr: function (user) {
            return JSON.stringify(
                this.getSaveModel(user)
            )
        },
        getSaveModel: function (user, removeMode) {
            var options = '';
            var userId = user ? user.id : undefined;
            var action = this.findAction(userId);
            if (action) {
                options = this.convertActionStr(action);
            }
            else{
                options = 'read,write,remove,manage'
            }

            if ( this.authDataType ==='CIRCLE' && user && !!removeMode) {
                var existUserIdx = this.findCircleIdx(userId);
                if (existUserIdx>=0) {
                    this.circle.nodes.splice(existUserIdx, 1);
                }
            } else if (this.authDataType ==='CIRCLE' && user) {
                var existUserIdx = this.findCircleIdx(userId);
                if (existUserIdx < 0) {
                    this.circle.nodes[this.circle.nodes.length] = {
                        nodeType: 'user',
                        nodeId: user.id,
                        nodeValue: user.displayName
                    };
                }
            }

            return {
                'appAuthType': this.appAuthType,
                'contentId': this.contentId,
                'circle': this.circle,
                'firstCircle': this.firstCircle,
                'originCircle': this.originCircle,
                'actionModel':this.actionModel,
                'userId': userId,
                'options': options
            }
        },
        convertActionStr:function(action){
            var options ='';
            options += action.read ? 'read,' : '';
            options += action.write ? 'write,' : '';
            options += action.remove ? 'remove,' : '';
            options += action.manage ? 'manage,' : '';

            return options;
        },
        convertActionToCircle:function(){
            var self = this;
            var circle = {};
            circle.nodes = [];
            _.forEach(this.actionModel, function(action){
                self.circle.nodes[self.circle.nodes.length] = { "nodeId":action.user.id , "nodeType":"user", "actions" : self.convertActionStr(action)}
            });
            return circle;
        },
        findCircleIdx: function (userId) {
            if ( !this.circle || !this.circle.nodes){
                this.circle = {};
                this.circle.nodes= [];
                return -1;
            }
            for (var i = 0; i < this.circle.nodes.length; i++) {
                var node = this.circle.nodes[i];
                if (node.nodeType === 'user' && node.nodeId === userId) {
                    return i;
                }
            }
            return -1;
        },
        findUser: function (userId) {
            if (this.users) {
                for (var i = 0; i < this.users.length; i++) {
                    if (userId == this.users[i].id) {
                        return this.users[i];
                    }
                }
            }
            return undefined;
        },
        findAction: function (userId) {
            if (this.actionModel) {
                for (var i = 0; i < this.actionModel.length; i++) {
                    if (this.actionModel[i].user.id == userId) {
                        return this.actionModel[i];
                    }
                }
            }
            return undefined;
        },
        updatedChecked: function (keys) {
            this.checked = keys.indexOf(this.contentKey) >= 0;
            return this.checked ? 1 : 0;
        },



    });
    return AuthModel;
});