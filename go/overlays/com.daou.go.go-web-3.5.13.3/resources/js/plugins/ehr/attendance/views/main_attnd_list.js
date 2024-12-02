(function() {
    define([
    "backbone", 
    "app",
    "attendance/views/daily_attnd_list",
    "attendance/views/monthly_attnd_list",
    "attendance/views/title",
    "hgn!attendance/templates/main_attnd_list",
    "i18n!attendance/nls/attendance"
    ],

    function(
    Backbone,
    GO,
    DailyAttndList,
    MonthlyAttndList,
    AttndTitleView,
    Tmpl,
    AttndLang
    ) {
    	var DescendantDept = Backbone.Collection.extend({
    		initialize : function(options){
    			this.deptId = options.deptId;
    		},
    		url : function() {
            	return GO.contextRoot + 'api/department/descendant/' + this.deptId;
            }
    	});
    	
        var MainAttndList = Backbone.View.extend({
            events : {
            },

            initialize : function() {
                this.isCompanyAttnd = this.options.isCompanyAttnd;
                this.deptId = this.options.deptId;
                if(_.isUndefined(this.deptId)){
                	this.descendantDept = new Backbone.Collection();
                }else{
                	this.descendantDept = new DescendantDept({"deptId" : this.deptId});
                	this.descendantDept.fetch({async: false});
                }
            },

            render : function() {
                this.$el.html(Tmpl());
                
                var attndTitleView = new AttndTitleView();
                var title = "";
                
                if(this.deptId == undefined){title = AttndLang["전사 근태현황"]}
                else{title = AttndLang["부서 근태현황"];}
                
                this.$el.find('header.content_top').html(attndTitleView.render(title).el);
                this.renderDailyList();
                return this;
            },
            
            renderDailyList : function(){
                var dailyAttndList = new DailyAttndList({"isCompanyAttnd":this.isCompanyAttnd, "deptid" : this.deptId, "descendantDept" : this.descendantDept});
                dailyAttndList.render();
                this.$el.find("div.content_page").html(dailyAttndList.$el);
                
                var self = this;
                dailyAttndList.on("click:monthlytab", function(){
                    self.renderMonthlyList();
                });
            },
            
            renderMonthlyList : function(){
                var monthlyAttndList = new MonthlyAttndList({"isCompanyAttnd":this.isCompanyAttnd, "deptid" : this.deptId, "descendantDept" : this.descendantDept});
                monthlyAttndList.render();
                this.$el.find("div.content_page").html(monthlyAttndList.$el);
                
                var self = this;
                monthlyAttndList.on("click:dailytab", function(){
                    self.renderDailyList();
                });
            }
        });

        function privateFunc(view, param1, param2) {

        }

        return MainAttndList;

    });

})();