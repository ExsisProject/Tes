(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "approval/models/activity"
    ], 
    function(
        $,
        Backbone,
        App,
        ActivityModel
    ) {

        /**
        *
        * 결재 라인을 구성하는 ActivityGroup 컬렉션
        *
        */
        var ActivityCollection = Backbone.Collection.extend({
            
            model: ActivityModel,
            
            isExistActivity: function(model) {
                return this.some(function(m) {
                    return m.equals(model);
                });
            },
            
            getOnlyApprovalActivities: function() {
                var approvals = new ActivityCollection();
                this.each(function(m) {
                    if (m.isApproval()) {
                        approvals.add(m);
                    }
                });
                return approvals;
            },
            
            getApprovalAndDraftActivities: function() {
                var approvals = new ActivityCollection();
                this.each(function(m) {
                    if (m.isApproval() || m.isDraft() || m.isInspection()) {
                        approvals.add(m);
                    }
                });
                return approvals;
            },

            getApprovalAndAgreementAndDraftActivities: function() {
                var approvals = new ActivityCollection();
                this.each(function(m) {
                    if (m.isApproval() || m.isDraft() || m.isAgreement() || m.isInspection()) {
                        approvals.add(m);
                    }
                });
                return approvals;
            },

            getActivities: function() {
                var approvals = new ActivityCollection();
                this.each(function(m) {
                    approvals.add(m);
                });
                return approvals;
            },
            
            selectOnlyAssigned: function() {
                var assigned = new ActivityCollection();
                this.each(function(m) {
                    if (m.isAssigned()) {
                        assigned.add(m);
                    }
                });
                return assigned;
            },
            
            getByUserIdAndDeptId: function(userId, deptId) {
                var compareModel = new ActivityModel({
                    userId: userId,
                    deptId: deptId
                });
                
                return this.find(function(m) {
                    return m.equals(compareModel);
                });
            },
            
            removeByUserIdAndDeptId: function(userId, deptId) {
                var compareModel = new ActivityModel({
                    userId: userId,
                    deptId: deptId
                });
                var target = this.find(function(m) {
            		return m.get('type') != 'DRAFT' && m.equals(compareModel);
                });
                this.remove(target);
            },
            
            removeDraftActivity: function() {
                var draft = this.find(function(m) {
                    return m.isDraft();
                });
                
                this.remove(draft);
            }
        });

        return ActivityCollection;
        
    });
}).call(this);