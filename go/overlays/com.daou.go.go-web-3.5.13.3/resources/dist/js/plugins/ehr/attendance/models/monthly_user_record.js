define(["backbone","attendance/collections/records"],function(e,t){var n=e.Model.extend({initialize:function(e,n){this.records=new t({month:moment(n)});if(_.isUndefined(e))return;this.records.reset(),this.records.add(this.get("records"))},getUserName:function(){return this.get("user").name},getUserId:function(){return this.get("user").id},getDeptNames:function(){var e=[];return _.each(this.get("depts"),function(t){e.push(t.name)}),e.join(", ")},getRecords:function(){return this.records.getRecords()},getLateCount:function(){return this.records.getLateCount()}},{});return n});