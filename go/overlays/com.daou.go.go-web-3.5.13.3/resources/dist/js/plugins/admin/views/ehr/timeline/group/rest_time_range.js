define("admin/views/ehr/timeline/group/rest_time_range",function(require){var e=require("backbone"),t=require("hgn!admin/templates/ehr/timeline/group/rest_time_range"),n=24,r=60,i=60,s=_.range(0,n).map(function(e){return e<10?"0"+e:e}),o=_.range(0,r).map(function(e){return e<10?"0"+e:e}),u=_.range(0,i).map(function(e){return e<10?"0"+e:e}),a=e.Model.extend({defaults:{startTime:"12:00:00",endTime:"13:00:00"},getTime:function(e){var t=e.split(":");return{hour:t[0],minute:t[1],second:t[2]}},isStartHour:function(e){return this.getTime(this.get("startTime")).hour==e},isStartMinute:function(e){return this.getTime(this.get("startTime")).minute==e},isStartSecond:function(e){return this.getTime(this.get("startTime")).second==e},isEndHour:function(e){return this.getTime(this.get("endTime")).hour==e},isEndMinute:function(e){return this.getTime(this.get("endTime")).minute==e},isEndSecond:function(e){return this.getTime(this.get("endTime")).second==e}}),f=e.View.extend({events:{"click #add":"add","click #remove":"remove"},initialize:function(){this.model=new a(this.options.data)},render:function(e){var n=this;this.$el.html(t({data:this.model.toJSON(),HOUR:s,MINUTE:o,SECOND:u,isStartHour:function(){return n.model.isStartHour(this)},isStartMinute:function(){return n.model.isStartMinute(this)},isStartSecond:function(){return n.model.isStartSecond(this)},isEndHour:function(){return n.model.isEndHour(this)},isEndMinute:function(){return n.model.isEndMinute(this)},isEndSecond:function(){return n.model.isEndSecond(this)},deletable:e}))},add:function(){this.trigger("add",this)},remove:function(){this.trigger("remove",this),this.$el.remove()},getVariable:function(){var e=this.$el;return{name:e.find("#name").val(),startTime:e.find("#startHour").val()+":"+e.find("#startMinute").val()+":"+e.find("#startSecond").val(),endTime:e.find("#endHour").val()+":"+e.find("#endMinute").val()+":"+e.find("#endSecond").val()}}});return f});