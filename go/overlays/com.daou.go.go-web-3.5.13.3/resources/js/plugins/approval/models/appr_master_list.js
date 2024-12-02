(function() {
    define([
        "jquery",
        "backbone",
        "app"
    ],
    function(
        $,
        Backbone,
        App
    ) {

        var ApprMasterModel = Backbone.Model.extend({});
        var ApprMasterCollection = Backbone.Collection.extend({
            model : ApprMasterModel
        });

        var ApprMasterListModel = Backbone.Model.extend({

            TYPE: {
                COMPANY_FOLDER: 'companyFolderMasters',
                OFFICIAL_DOC: 'officialDocMasters',
                DOC: 'apprDocMasters'
            },

            initialize: function(options) {
                var opt = _.extend({}, options);
                this.isAdmin = false;
                if (_.isBoolean(opt.isAdmin)) {
                    this.isAdmin = opt.isAdmin;
                }
            },

            url: function() {
                var url = '/api/approval/master';
                if (this.isAdmin) {
                    url = '/ad' + url;
                }
                return url;
            },

            getCompanyFolderMasters: function() {
                return this._getMasters(this.TYPE.COMPANY_FOLDER);
            },

            getDocMasters: function() {
                return this._getMasters(this.TYPE.DOC);
            },

            getOfficialDocMasters: function() {
                return this._getMasters(this.TYPE.OFFICIAL_DOC);
            },

            _getMasters: function(type) {
                var collection = new ApprMasterCollection();
                collection.set(this.get(type));
                return collection;
            },

            addCompanyFolderMaster: function(userId, actions) {
                this._addMaster(this.TYPE.COMPANY_FOLDER, userId, actions);
            },

            addDocMaster: function(userId, actions) {
                this._addMaster(this.TYPE.DOC, userId, actions);
            },

            addOfficialDocMaster: function(userId, actions) {
                this._addMaster(this.TYPE.OFFICIAL_DOC, userId, actions);
            },

            _addMaster: function(type, userId, actions) {
                var collection = new ApprMasterCollection(this.get(type));
                var master = new ApprMasterModel({
                    userId: userId,
                    actions: actions
                });

                collection.add(master);
                this.set(type, collection.toJSON());
            },

            clearCompanyFolderMasters: function() {
                this.set(this.TYPE.COMPANY_FOLDER, []);
            },

            clearDocMasters: function() {
                this.set(this.TYPE.DOC, []);
            },

            clearOfficialDocMasters: function() {
                this.set(this.TYPE.OFFICIAL_DOC, []);
            }
        });

        return ApprMasterListModel;

    });
}).call(this);