define('admin/collections/auth/app_integrated_auth_collection', function (require) {

    var Backbone = require('backbone');
    var GO = require('app');
    var _ = require('underscore');
    var Model = require('admin/models/auth/app_integrated_auth_category');
    var PageModel = require('admin/models/layout/page_model');

    var AppAuthCollection = Backbone.Collection.extend({

        initialize: function (options) {
            this.catModel = [];
            this.detailItems = [];
            this.checkedCnt = 0;
            this.filterModel = options.filterModel;
            this.pageModel = new PageModel();

        },
        refresh:function(){
            var self = this;

            this.fetch({
                async: false,
                success: function (resp) {
                    self.page = resp.page;
                    self.appName = resp.extParameter;
                }
            });

            this.detailItems =[];
            if (this.filterModel.appAuthLevel === 'AppContentOperator') {
                this.catModel[0] = new Model({
                    attributes: {
                        appAuthGroup: this.filterModel.appAuthType,
                        groupName: this.filterModel.appAuthType,
                        appAuthModels: this.models,
                        contentLevel: true
                    }
                });
                _.forEach(this.catModel[0].appAuthModels, function (model) {
                    self.detailItems[self.detailItems.length] = model;
                });
            } else {
                for (var i = 0; i < this.length; i++) {
                    this.catModel[i] = new Model(this.models[i]);
                    _.forEach(this.catModel[i].appAuthModels, function (model) {
                        self.detailItems[self.detailItems.length] = model;
                    });
                }
            }
        },
        updatePage: function (options) {
            if (options.page || options.page === 0) {
                this.pageModel.page = options.page;
            }
            if (options.offset) {
                this.pageModel.offset = options.offset;
            }
            if (options.property) {
                this.pageModel.property = options.property;
            }
            if (options.direction) {
                this.pageModel.direction = options.direction;
            }
        },
        updatedChecked: function (keys) {
            var self = this;
            this.checkedCnt = 0;
            _.forEach(this.detailItems, function (model) {
                self.checkedCnt += model.updatedChecked(keys);
            });
            return this.checkedCnt;
        },
        getUpdatedReqModels: function () {
            var reqModels = [];

            _.forEach(this.detailItems, function (model) {
                if (model.updated) {
                    reqModels[reqModels.length] = model.getSaveModel();
                }
            });
            return reqModels;
        },
        getCheckedReqModels: function (user, removeMode) {
            var reqModels = [];

            _.forEach(this.detailItems, function (model) {
                if (model.checked) {
                    reqModels[reqModels.length] = model.getSaveModel(user, removeMode)
                }
            });
            return reqModels;
        },
        clearData:function(){
            _.forEach(this.detailItems, function (model) {
                if (model.checked) {
                    model.clearData();
                }
            });
        },
        addAdminData:function(user){
            _.forEach(this.detailItems, function (model) {
                if (model.checked) {
                    model.addUserModel(user);
                }
            });
        },
        saveUpdatedItems:function(){
            var self = this;
            $.ajax({
                url: GO.contextRoot + "ad/api/auth/saves",
                data: JSON.stringify(this.getUpdatedReqModels()),
                type: 'POST',
                async: false,
                contentType: 'application/json',
                success: function (res) {
                }, error: function (resp) {
                }
            });
        },
        addAdmin: function (user) {
            var self = this;
            $.ajax({
                url: GO.contextRoot + "ad/api/auth/saves",
                data: JSON.stringify(this.getCheckedReqModels(user, false)),
                type: 'POST',
                async: false,
                contentType: 'application/json',
                success: function (res) {
                    _.forEach(self.detailItems, function (model) {
                        if (model.checked) {
                            model.addUserModel(user);
                        }
                    });
                }, error: function (resp) {
                }
            });
        },
        removeSelectedUser: function () {
            var models = [];
            _.forEach(this.detailItems, function (model) {
                if (model.checked) {
                    models = models.concat(model.clearUser());
                }
            });
            if (models.length > 0) {
                this.removeAdminModel(models);
            }
            _.forEach(this.detailItems, function (model) {
                if (model.checked) {
                    model.clear();
                }
            });
        },
        removeAdminModel: function (models) {
            var self = this;
            $.ajax({
                url: GO.contextRoot + "ad/api/auth/removes",
                data: JSON.stringify(models),
                type: 'POST',
                async: false,
                contentType: 'application/json',
            });
        },
        removeAdminUser: function (user) {
            var self = this;
            this.removeAdminModel(this.getCheckedReqModels(user, true));
            _.forEach(self.detailItems, function (model) {
                if (model.checked) {
                    model.removeUserModel(user);
                }
            });
        },
        getQueryParam:function(){
            return '?' + $.param({
                'appAuthLevel':this.filterModel.appAuthLevel,
                'userName':this.filterModel.userName,
                'appCategory':this.filterModel.appCategory,
                'appAuthType':this.filterModel.appAuthType,
                'contentName':this.filterModel.contentName,
            }) +'&' +  this.pageModel.getQueryStr();
        },
        url: function () {
            var u = GO.contextRoot + "ad/api/auth/all";


            u += this.filterModel.appAuthLevel === 'AppContentOperator' ? ('/' + this.filterModel.appAuthType) : '';
            u += this.getQueryParam();

            return u;
        },
    });
    return AppAuthCollection
});
