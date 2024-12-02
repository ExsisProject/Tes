define([
    "backbone",
    "attendance/collections/records"
],

function(
    Backbone,
    RecordCollection
) {
    var MonthlyUserRecord = Backbone.Model.extend({
        
        initialize : function(data, logMonth){
            this.records = new RecordCollection({month : moment(logMonth)});
            if(_.isUndefined(data)){
                return;
            }
            this.records.reset();
            this.records.add(this.get("records"));
        },
        
        getUserName : function(){
            return this.get("user").name;
        },
        
        getUserId : function(){
            return this.get("user").id;
        },
        
        getDeptNames : function(){
            var deptNames = [];
            _.each(this.get("depts"), function(dept){
                deptNames.push(dept.name);
            });
            return deptNames.join(", ");
        },
        getRecords : function(){
            // month 라는 값이 들어감. 왜 들어가지는 확인 후 제거
            return this.records.getRecords();
        },
        getLateCount : function(){
            return this.records.getLateCount();
        }
    }, {});

    return MonthlyUserRecord;
});