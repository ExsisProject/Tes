(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "approval/models/activity_group",
        "approval/models/activity",
        "approval/collections/activities"
    ], 
    function(
        $,
        Backbone,
        App,
        ActivityGroupModel,
        ActivityModel,
        ActivityCollection
    ) {

        /**
        *
        * 결재 라인을 구성하는 ActivityGroup 컬렉션
        *
        */
        var ActivityGroupCollection = Backbone.Collection.extend({
            
            model: ActivityGroupModel,
            
            /**
             * 특정 activity가 자신(activity_group)을 담은 컬렉션 모두에서 이미 존재하는지 여부를 검증한다.
             *  
             * @param activityData
             * @returns {Boolean}
             */
            isExistActivity: function(activityData) {
                var activity = new ActivityModel(activityData),
                    totalActivities = new ActivityCollection();
                
                this.each(function(model) {
                    var aCol = new ActivityCollection(model.get('activities'));
                    totalActivities.add(aCol.models);
                });
                
                return totalActivities.isExistActivity(activity);
            }
        });

        return ActivityGroupCollection;
        
    });
}).call(this);