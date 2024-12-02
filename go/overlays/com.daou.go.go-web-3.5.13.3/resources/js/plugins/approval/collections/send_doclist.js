(function() {

    define([
        "jquery",
        "approval/collections/appr_base_doclist",
        "approval/models/doclist_item"
    ],

    function(
        $,
        ApprBaseDocList,
        DocListItemModel
    ) {

        var SendDocCollection = ApprBaseDocList.extend({

            type: "all",
            deptId: null,

            model: DocListItemModel.extend({
                idAttribute: "_id"
            }),

            initialize: function(type, deptId) {
                ApprBaseDocList.prototype.initialize.apply(this, arguments);
                this.type = type;
                this.deptId = deptId;
            },

            url: function() {
                return '/api/' + this.getBaseURL() +'/' + this.type + '?' + this._makeParam();
            },

            getCsvURL: function() {
                return '/api/' + this.getBaseURL() +'/all/csv?' + this._makeParam();
            },

            getBaseURL: function() {
                return 'approval/doclist/send';
            }
        });

        return SendDocCollection;

    });
}).call(this);