(function(){define(["backbone","app","hgn!vacation/templates/my_page","i18n!vacation/nls/vacation","i18n!nls/commons","vacation/views/title","vacation/models/user_vacation","vacation/collections/user_histories"],function(e,t,n,r,i,s,o,u){function l(e,t,n){}var a={"\ucd1d\uc5f0\ucc28":r["\ucd1d\uc5f0\ucc28"],"\uc0ac\uc6a9 \uc5f0\ucc28":r["\uc0ac\uc6a9 \uc5f0\ucc28"],"\uc870\uc815 \uc5f0\ucc28":r["\uc870\uc815 \uc5f0\ucc28"],"\uc794\uc5ec \uc5f0\ucc28":r["\uc794\uc5ec \uc5f0\ucc28"],"\uae30\uac04":r["\uae30\uac04"],"\uc0ac\uc6a9\uc77c\uc218":r["\uc0ac\uc6a9\uc77c\uc218"],"\ubd84\ub958":r["\ubd84\ub958"],"\uc774\uc804":i["\uc774\uc804"],"\ub2e4\uc74c":i["\ub2e4\uc74c"],"\ub0a0\uc9dc \uc774\ub3d9":r["\ub0a0\uc9dc \uc774\ub3d9"],"\uc5f0\ucc28 \uc5c6\uc74c \uc548\ub0b4":r["\uc5f0\ucc28 \uc5c6\uc74c \uc548\ub0b4"],"\ub0b4 \uc5f0\ucc28 \ud604\ud669":r["\ub0b4 \uc5f0\ucc28 \ud604\ud669"]},f=e.View.extend({events:{"click #preDate":"preDate","click #nextDate":"nextDate","click #calArea":"showCalendar"},initialize:function(){var e=t.util.toMoment().year();this.vacation=new o,this.vacation.setYear(e),this.vacation.fetch({async:!1}),this.histories=new u,this.histories.setYear(e),this.histories.fetch({async:!1})},render:function(e){_.isUndefined(e)&&(e=t.util.toMoment().year());var i=Number(e);return this.$el.html(n({preDate:i-1,nextDate:i+1,searchDate:i,vacation:this.vacation.toJSON(),histories:this.histories.toJSON(),lang:a,isEmpty:this.histories.size()==0?!0:!1})),this.$el.find("header.content_top").html((new s).render(r["\ub0b4 \uc5f0\ucc28 \ub0b4\uc5ed"]).el),this.initDatePicker(),this},preDate:function(e){var t=$(e.currentTarget);this.refresh(t.attr("data-date"))},nextDate:function(e){var t=$(e.currentTarget);this.refresh(t.attr("data-date"))},refresh:function(e){var t=Number(e);$("#preDate").attr("data-date",t-1),$("#searchDate").attr("data-date",t),$("#searchDate").text(t),$("#nextDate").attr("data-date",t+1),this.vacation.setYear(t),this.vacation.fetch({async:!1}),this.histories.setYear(t),this.histories.fetch({async:!1}),this.render(t)},showCalendar:function(){this.$el.find("#calBtn").focus()},initDatePicker:function(){var e=this.$el.find("#calBtn");$.datepicker.setDefaults($.datepicker.regional[t.config("locale")]),e.datepicker({dateFormat:"yy-mm-dd",changeMonth:!0,changeYear:!0,yearSuffix:"",onSelect:$.proxy(function(e){var n=t.util.toMoment(e).year();this.refresh(n)},this)})}});return f})})();