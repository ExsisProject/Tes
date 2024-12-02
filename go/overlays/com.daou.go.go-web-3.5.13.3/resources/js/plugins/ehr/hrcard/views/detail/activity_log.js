define([
        "backbone",
        "app",
        "hgn!hrcard/templates/detail/activity_log",
        "hgn!hrcard/templates/detail/activity_log_item",
        "i18n!hrcard/nls/hrcard",
        "i18n!nls/commons"
        ],
function(
		Backbone,
		GO,
		activityTpl,
		activityItemTpl,
		hrcardLang,
		commonLang
		) {
	
	//다국어
	var lang = {
		label_actionLogs : commonLang['변경이력'],
		label_more : commonLang['더보기']
	};

	var ActivityView = Backbone.View.extend({
		events : {
			"click #moreLog" : "moreLog"
		},
        initialize : function(options) {
			this.options = options || {};
       		this.userid = this.options.userid;
       		
       		this.logs = new Backbone.Collection();
        	this.logs.url = GO.contextRoot + 'api/ehr/hrcard/info/logs/'+ this.userid + '/actionlogs';
        	this.logs.fetch({async:false});
        },
        render : function() {
        	var self = this;
        	this.$el.html(activityTpl({
        		lang : lang
        	}));
        	this.$el.find('header.single_title span.num').text(this.logs.page.total);
        	
        	var tpl = activityItemTpl({
        		log : this.logs.toJSON(),
        		date : function() {
        			return moment(this.createdAt).format('YYYY-MM-DD [(]dd[)] HH:mm');
        		}
        	});
        	this.$el.find('ul.type_simple_list').append(tpl);
        	this.checkMoreBtn();
        	return this;
        },
        
        moreRender : function() {
        	var self = this;
        	
        	var tpl = activityItemTpl({
        		log : this.logs.toJSON(),
        		date : moment(this.createdAt).format('YYYY-MM-DD [(]dd[)] HH:mm')
        	});
        	this.$el.find('ul.type_simple_list').append(tpl);
        	this.checkMoreBtn();
        },
        
        moreLog : function(e) {
        	var self = this;
			var page = this.logs.page.page + 1;
			this.logs.url = GO.contextRoot + 'api/ehr/hrcard/info/logs/'+ this.userid + '/actionlogs?' + $.param({page : page});
			this.logs.fetch({
				success : function(resp) {
					self.moreRender();
				} 
			});
        },
        checkMoreBtn : function(){
        	if (this.logs.page.lastPage) {
        		this.$el.find("#moreLog").hide();
        	} else {
        		this.$el.find("#moreLog").show();
        	}
        }
    });
	
	return ActivityView;
	
});