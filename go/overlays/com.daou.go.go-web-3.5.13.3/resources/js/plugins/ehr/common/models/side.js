define([
		"backbone"
	],

	function(
		Backbone
	) {
		var instance = null;
		var Side = Backbone.Model.extend({
			initialize : function() {
			},
			urlRoot : GO.contextRoot + "api/ehr/side",
			/*getAttnd : function() {
				return this.get('attndSide');
			},*/
			getTimeline : function() {
				return this.get('timelineSide');
			},
			getHrcard : function() {
				return this.get('hrcardSide');
			},
			getVacation : function(){
				return this.get("vacationSide");
			},
			getWelfare : function(){
				return this.get("welfareSide");
			},
			getDepts : function() {
				return this.get('depts');
			},
			/*isAttndActive : function() {
				return this.get('attndSide').active;
			},*/
            isTimelineActive : function() {
                return this.get('timelineSide').active;
            },
			isHrcardActive : function() {
				return this.get('hrcardSide').active;
			},
			isVacationActive : function() {
				return this.get('vacationSide').active;
			},
			isWelfareActive : function() {
				return this.get('welfareSide').active;
			},
			isAttndAdminActive : function() {
				var attndSide = this.get('attndSide');
				return attndSide.active || attndSide.manager;
			},
            isTimelineAdminActive : function() {
                var timelineSide = this.get('timelineSide');
                return timelineSide.active || timelineSide.manager;
            },
			isHrcardAdminActive : function() {
				var hrcardSide = this.get('hrcardSide');
				return hrcardSide.active || hrcardSide.manager;
			},
			isVacationAdminActive : function(){
				var vacationSide = this.get('vacationSide');
				return vacationSide.active || vacationSide.manager;
			},
			isWelfareAdminActive : function(){
				var welfareSide = this.get('welfareSide');
				return welfareSide.active || welfareSide.manager;
			},
			isTimelineSyncActive : function() {
                return this.get('timelineSide').syncActive;
			},
			isTimelineHasGroup : function() {
                return this.get('timelineSide').hasGroup;
			},
			hasDepts : function() {
				return this.get('depts').length > 0;
			},
		/*	useAttndDeptSituationAndStats : function() {
				return this.get('attndSide').useDeptSituationAndStats;
			},*/
            useTimelineDeptSituationAndStats : function() {
                return this.get('timelineSide').useDeptSituationAndStats;
            },
			useHrcardDeptSituationAndStats : function() {
				return this.get('hrcardSide').useDeptSituationAndStats;
			},
			useVacationDeptManageOpen : function(){
				return this.getVacation().deptManageOpen;
			},
			isEhrManager : function(){
				return (this.getTimeline().manager || this.getHrcard().manager || this.getVacation().manager || this.getWelfare().manager) ? true : false;
			},
			isEhrActive : function(){
				return this.isTimelineAdminActive() || this.isHrcardAdminActive() || this.isVacationAdminActive() || this.isWelfareAdminActive();
			},
			useDeptSituationAndStats : function(){
				return this.useTimelineDeptSituationAndStats() || this.useHrcardDeptSituationAndStats() || this.useVacationDeptManageOpen();
			},
			moment:function(){
            	return moment(this.get('serverTime'));
			}
		});

		return Side;
	});