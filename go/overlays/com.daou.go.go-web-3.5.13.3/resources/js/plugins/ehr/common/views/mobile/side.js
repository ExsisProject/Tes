define('ehr/common/views/mobile/side', function(require) {
	
	var Backbone = require('backbone');
    var when = require('when');

    var Side = require("ehr/common/models/side");
    
	var SideTmpl = require('hgn!ehr/common/templates/mobile/side');

	var TimelineLang = require("i18n!timeline/nls/timeline");

	var TimelineSideView = Backbone.View.extend({
        events : {
        	"click span[name=timelineState]" : "moveTo"
        },
		
		initialize : function() {
			this.side = new Side();
		},

        render : function() {
            var self = this;
            var deferred = $.Deferred();

            $.when(
                self.dataFetch()
            ).done(function() {
				self.$el.html(SideTmpl({
					TimelineLang : TimelineLang,
                    timeline: self.side.getTimeline(),
                    hasDepts: self.side.hasDepts(),
                    useDeptSituationAndStats: self.side.useTimelineDeptSituationAndStats(), //부서장 정보공개권한이 근태,인사,연차 셋중하나라도 있으면
                    hasDepts: self.side.hasDepts(),
                    isEhrManager: self.side.isEhrManager(),
                    data: self.side.toJSON(),
                }));
                self.setSideApp();
                deferred.resolveWith(self, [self]);
            });
            return deferred;
		},
		dataFetch : function() {
			this.side.fetch({async: false});
		},
		setSideApp : function() {
            $('body').data('sideApp', "ehr");
        },
        moveTo : function(e) {
        	var type = $(e.currentTarget).attr("data-type");
        	if(type == "user") {
        		GO.router.navigate('ehr', {trigger: true});
        	}else if(type == "company") {
        		GO.router.navigate('ehr/timeline/companystats', {trigger: true});
        	}else if(type == "dept") {
        		var deptId = $(e.currentTarget).closest('li#dept_stat').attr('data-deptid');
        		GO.router.navigate('ehr/timeline/deptstats/' + deptId, {trigger: true});
        	}
        }
	}, {
        __instance__: null, 
        create: function(packageName) {
            this.__instance__ = new this.prototype.constructor({'packageName':packageName});
            return this.__instance__;
        }
    });
	
	return TimelineSideView;
});
