(function(){define(["jquery","underscore","app","works/collections/works_events","works/libs/util"],function(e,t,n,r,i){var s=Array.prototype.slice,o="YYYY-MM-DDTHH:mm:ss.SSS",u=function(){var u=function(){this.appletId=-1,this.timeMin=null,this.timeMax=null,this.maxResult=1e3,this.isCached=!1,this.__collections__={},this.isFetching=!1,this.fetching=e.Deferred()};return u.prototype={getCollections:function(){return this.__collections__},setAppletId:function(e){return this.appletId=e,this},setFields:function(e){return this.fields=e,this},setTimeMin:function(e){return this.timeMin=moment.utc(e).format(o)+"Z",this},setTimeMax:function(e){return this.timeMax=moment.utc(e).format(o)+"Z",this},setBoundaryTime:function(e,t){return this.setTimeMin(e),this.setTimeMax(t),this.isCached=!1,this},setMaxResult:function(e){return this.maxResult=e,this},contains:function(e){return t.has(this.__collections__,e)},findEvent:function(e,t){if(!this.contains(e))throw new Error("period \uac00 \ud480\uc5d0 \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.");return this.__collections__[e].get(t)},addEvent:function(e){var t=this.__collections__[e.get("periodId")];return t.add(e),this},add:function(e){var t=new r;return t.setPeriodId(e),this.__collections__[e]=t,this},show:function(e){return this.__collections__[e].isHide=!1,this},hide:function(e){return this.__collections__[e].isHide=!0,this},remove:function(e){var t=e;return this._isInstanceOf(e)&&(t=e.getPeriodId()),delete this.__collections__[t],this},clear:function(){return this.__collections__=null,this.__collections__={},this},updateCalendar:function(e){var t=s.call(arguments,1);return this.contains(e)&&this.__collections__[e].map(function(e,n){e.set.apply(e,t)}),this},updateEvents:function(e){var n=e.split("_")[0],r=e.split("_")[1],i=s.call(arguments,1),o=this.findEvent(n,e),u=o.get("startCid"),a=o.get("endCid");t.map(this.__collections__,function(e){t.map(e.models,function(e){if(r==e.get("docId")){var n={};u==e.get("startCid")&&t.extend(n,{startTime:i[0].startTime}),!t.isUndefined(a)&&a==e.get("endCid")&&t.extend(n,{endTime:i[0].endTime}),t.isEmpty(n)||(t.isUndefined(e.get("endCid"))&&t.extend(n,{endTime:i[0].startTime}),e.set.apply(e,Array(n)))}})})},removeEvents:function(e){this.__collections__[e]=[]},fetch:function(r){var s=this;s.fetching=e.Deferred(),this.isFetching=!0;var o=t.keys(s.__collections__);return t.each(o,function(e,t){e===""&&o.splice(t,1)}),o.length==0?(s.isFetching=!1,s.fetching.resolveWith(s,[s]),s.fetching):(e.ajax(n.config("contextRoot")+"api/works/applet/"+this.appletId+"/calendarview/event",{type:"GET",data:{q:t.isUndefined(r)?"":r,timeMin:this.timeMin,timeMax:this.timeMax,maxResult:this.maxResult,periodIds:o},beforeSend:function(){s.fetching.notify()}}).done(function(e){if(!e.__go_checksum__)throw s.fetching.reject(),new Error("\uc798\ubabb\ub41c \uc751\ub2f5\uc785\ub2c8\ub2e4");e.code==="200"&&(t.each(s.__collections__,function(e){e.reset()}),t.each(e.data,function(e){var r=this.__collections__[e.periodId],o=s.fields.findByCid(e.titleCid);if(t.isUndefined(e.title)&&!t.isUndefined(o)){var u=o.getDisplayValue(new Backbone.Model(e.appletDocModel));e.title=n.util.htmlToText(u)}r.add(i.parseEventModel(e),{merge:!0})},s)),s.isCached=!0,s.isFetching=!1,s.fetching.resolveWith(s,[s])}).fail(function(){s.isFetching=!1,s.fetching.rejectWith(s,[s])}),s.fetching)},merge:function(){var e=[];return t.each(this.__collections__,function(n){var r=n.isHide?[]:n.toJSON();e=t.union(e,r)}),t.values(e)},_isInstanceOf:function(e){return e instanceof r}},u}();return u})}).call(this);