(function(){define(["backbone","hogan","i18n!nls/commons","calendar/collections/calendar_logs"],function(e,t,n,r){var i={history:n["\ubcc0\uacbd\uc774\ub825"],showMore:n["\ub354\ubcf4\uae30"]},s=t.compile('<li><p class="desc">'+n["\ubcc0\uacbd\uc774\ub825\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."]+"</p>"+"</li>"),o=t.compile('<div class="reply_wrap"><div class="aside_wrapper_body"><ul id="logList" class="type_simple_list simple_list_alarm"></ul><div id="moreLog" class="bottom_action"><a class="btn_list_reload"><span class="ic"></span><span class="txt">{{lang.showMore}}</span></a></div></div></div>'),u=t.compile('<p class="photo"><img src="{{log.actor.thumbnail}}" title="{{log.actor.name}} {{#log.actor.position}}{{log.actor.position}}{{/log.actor.position}}"  alt="{{log.actor.name}} {{log.actor.position}}"></p><div class="info"><p class="name">{{log.actor.name}} </p><span class="date">{{createdAt}}</span>{{#messages}}<p class="subject">{{{.}}}</p>{{/messages}}</div>'),a=e.View.extend({tagName:"li",events:{},initialize:function(e){this.log=e},render:function(){return this.$el.html(u.render({log:this.log.toJSON(),messages:this.log.contentParser(),createdAt:GO.util.basicDate(this.log.get("createdAt"))})),this}}),f=e.View.extend({events:{"click #moreLog":"moreLog"},initialize:function(e){this.logs=new r({calendarId:e.calendarId,eventId:e.eventId})},render:function(){var e=this;return this.logs.fetch({success:function(){e.$el.html(o.render({count:e.logs.models.length,lang:i})),e.renderLogs()}}),this},renderLogs:function(){_.each(this.logs.models,function(e){var t=new a(e);$("#logList").append(t.render().el)}),$("#logCount").text(this.logs.page.total),this.isEnd()&&$("#moreLog").hide(),this.logs.length||this.$("#logList").append(s.render())},moreLog:function(){var e=this,t=this.logs.page.page;this.logs.setPage(t+1),this.logs.fetch({success:function(t){e.renderLogs()}})},isEnd:function(){return $("#logList").find("li").length==this.logs.page.total}});return f})}).call(this);