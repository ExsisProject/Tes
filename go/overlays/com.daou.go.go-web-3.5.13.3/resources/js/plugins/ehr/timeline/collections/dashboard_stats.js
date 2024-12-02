define('timeline/collections/dashboard_stats', function (require) {
    var PaginatedCollection = require("collections/paginated_collection");
    var DashboardStat= require("timeline/models/dashboard/dashboard_stat");
    var _ = require("underscore");

    var Collection = PaginatedCollection.extend({

        model: DashboardStat,

        initialize: function (baseDate) {
            PaginatedCollection.prototype.initialize.apply(this, arguments);
            this.baseDate = baseDate;
            this.param = {page : 0 , offset:20, baseDate:moment(this.baseDate).format('YYYY-MM-DD')}
        },
        url: function () {
            var url = GO.contextRoot + "api/ehr/timeline/company/dashboard/list";
            url += "?" + this.mkParam();
            return url;
        },
        getCheckLists:function(){
            return ['missingClockIn', 'missingClockOut', 'absence', 'tardy', 'early', 'vacation', 'unAuthDevice', 'autoClockOut', 'extensionWorkingTime', 'nightWorkingTime', 'holyDayWorkingTime', 'etcStatus'] ;
        },
        mkParam:function(){
            return $.param(this.param);
        },
        changeParam:function(param, viewList){
           this.param = param;
            var self = this;


            _.forEach(this.getCheckLists(), function(v){
                if(!!self.param[v]){
                    delete self.param[v];
                }
            });

           _.forEach(viewList, function(v){
               self.param[v] = true;
           });
        },
        excelUrl:function(){
            var url = GO.contextRoot + "api/ehr/timeline/company/dashboard/excel";
            url += "?" + this.mkParam();
            return url;
        }

    });

    return Collection;
});
