define(["backbone","sms/models/sms_info","collections/paginated_collection"],function(e,t,n){var r=n.extend({model:t,url:function(){var e=GO.contextRoot;return this.type=="company"&&(e+="ad/"),e+="api/sms/"+this.type+"/stat",e+="?"+this.makeParam(),e},isEmpty:function(){return this.models.length==0},setDuration:function(e,t){t||(t={});var n=e||"";if(n=="period")this.fromDate=GO.util.toISO8601(t.fromDate),this.toDate=GO.util.searchEndDate(t.toDate);else if(n!=""&&n!="all"){var r=GO.util.shortDate(new Date),i=GO.util.calDate(r,"months",n);this.fromDate=GO.util.toISO8601(i),this.toDate=GO.util.searchEndDate(r)}else this.fromDate=null,this.toDate=null;this.duration=n},makeParam:function(){var e={},t=$.param({page:this.pageNo,offset:this.pageSize});return this.keyword&&(t+="&keyword="+encodeURIComponent(this.keyword)),this.property&&(e.property=this.property),this.direction&&(e.direction=this.direction),this.searchType&&(e.searchType=this.searchType),this.fromDate&&(e.fromDate=this.fromDate),this.toDate&&(e.toDate=this.toDate),_.isEmpty(e)||(t+="&"+$.param(e)),t},_getParam:function(){var e={pageNo:this.pageNo,pageSize:this.pageSize,keyword:this.keyword,property:this.property,direction:this.direction,searchType:this.searchType,fromDate:this.fromDate,toDate:this.toDate,duration:this.duration};return e}});return r});