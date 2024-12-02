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
        * 결재선 모델입니다. 
        *
        */
        var ApprLineModel = Backbone.Model.extend({
            
            url : function() {
                var url = GO.contextRoot + 'api/approval/usersetting/apprline';
                if (!this.isNew()) {
                    url += '/' + this.get('id');
                }
                return url;
            },

            defaults: {
                title: '',
                useParallelAgreement: true, // false면 순차합의
                activityGroups: null
            },
            
            initialize: function() {
                if (_.isNull(this.get('activityGroups'))) {
                    this.set('activityGroups', new ApprActivityGroups());
                }
                
                if ((this.get('useParallelAgreement') === true) || (this.get('useParallelAgreement') === 'true')) {
                    this.set('useParallelAgreement', true);
                } else {
                    this.set('useParallelAgreement', false);
                }
            }
        });

        return ApprLineModel;
    });
}).call(this);