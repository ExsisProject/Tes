(function(){define(["backbone","app","i18n!calendar/nls/calendar"],function(e,t,n){var r=e.Model.extend({urlRoot:"/api/calendar",addMyCalendar:function(e){var t=$.Deferred();return this.save({name:e},{success:t.resolve,error:t.reject}),t},move:function(e){var n=$.Deferred();return this.save(typeof e=="undefined"?null:{seq:e},{url:t.config("contextRoot")+"api/calendar/"+this.id+"/move",success:n.resolve,error:n.reject}),n},isPublic:function(){return this.get("visibility")==="public"},isProtected:function(){return this.get("visibility")==="protected"},isPrivate:function(){return this.get("visibility")==="private"},isAccessible:function(){return!this.isPrivate()||this.get("permission")},isDefault:function(){return this.get("defaultCalendar")},isMyCalendar:function(){return this.get("type")==="normal"},getCalendarName:function(){return this.get("name")||t.i18n(n["\uce98\ub9b0\ub354 \uae30\ubcf8\uc774\ub984"],{username:this.get("owner").name})},getOwnerName:function(){var e=this.get("owner");return[e.name,e.position].join(" ")},decideDefault:function(e){return this.set("defaultCalendar",this.id===e)},updateDefaultCalendar:function(){var e=$.Deferred();return this.save({defaultCalendar:!0},{success:e.resolve,error:e.reject}),e}});return r})}).call(this);