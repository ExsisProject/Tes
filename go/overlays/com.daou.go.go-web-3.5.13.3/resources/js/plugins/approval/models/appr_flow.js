(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "approval/collections/appr_activity_groups"
    ],
    function(
        $,
        Backbone,
        App,
        ApprActivityGroups
    ) {

        /**
        *
        * 결재흐름 모델입니다.
        *
        */
        var ApprFlowModel = Backbone.Model.extend({

            docId: null,
            isAdmin: false,
            idAttribute : '_id',
            url: function() {
                if (this.isAdmin) {
                    return ['/ad/api/approval/manage/document', this.docId , 'apprflow'].join('/');
                } else {
                    return ['/api/approval/document', this.docId , 'apprflow'].join('/');
                }
            },

            initialize: function(options) {
                this.docId = options.docId;
                if (_.isBoolean(options.isAdmin)) {
                    this.isAdmin = options.isAdmin;
                }
            },

            getAllActivities: function() {
                var activities = [];

                var groupCollection = new ApprActivityGroups(this.get('activityGroups'));
                groupCollection.each(function(group) {
                    group.getActivityCollection().each(function(activity) {
                        activities.push(activity.toJSON());
                    });
                });

                return activities;
            },

            hasNoActivities: function() {
                return _.isEmpty(this.getAllActivities());
            },
            
            getCurrentActivity: function() {
            	var activities = this.getAllActivities();
            	var currentActivityId = this.get('currentActivityId');
            	for (var i = 0, len = activities.length; i < len; i++) {
            		if (activities[i].id == currentActivityId) {
            			return activities[i];
            		}
            	}
            }
        });

        return ApprFlowModel;
    });
}).call(this);