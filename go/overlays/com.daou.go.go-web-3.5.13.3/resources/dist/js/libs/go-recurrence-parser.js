define(["underscore","moment","app","i18n!calendar/nls/calendar"],function(e,t,n,r){function f(e,t){return n.util.parseOrdinaryNumber(e,t)}var i=n.constant("calendar","RECURRENCE_FREQ"),s={SU:r["\uc77c\uc694\uc77c"],MO:r["\uc6d4\uc694\uc77c"],TU:r["\ud654\uc694\uc77c"],WE:r["\uc218\uc694\uc77c"],TH:r["\ubaa9\uc694\uc77c"],FR:r["\uae08\uc694\uc77c"],SA:r["\ud1a0\uc694\uc77c"]},o={1:r["\uccab\uc9f8\uc8fc"],2:r["\ub458\uc9f8\uc8fc"],3:r["\uc14b\uc9f8\uc8fc"],4:r["\ub137\uc9f8\uc8fc"],5:r["\ub2e4\uc12f\uc9f8\uc8fc"],"-1":r["\ub9c8\uc9c0\ub9c9 \uc8fc"]},u=["FREQ","UNTIL","COUNT","INTERVAL","BYSECOND","BYMINUTE","BYHOUR","BYDAY","BYMONTHDAY","BYYEARDAY","BYWEEKNO","BYMONTH","BYSETPOS","WKST"],a=function(){var a=function(e){this.options=e||{},this.__recurrence__={FREQ:i.daily}};return a.prototype={set:function(t,n){return e.isObject(t)?this._setHash(t):this.__recurrence__[t]=n,this},get:function(e){return this.__recurrence__[e]},has:function(t){return e.has(this.__recurrence__,t)},parse:function(t){var n=t.split(";");return e.each(n,function(e){var t=e.split("=");this.__recurrence__[t[0]]=t[1]},this),this},toString:function(){var t=[];return this.validate()&&e.each(this.__recurrence__,function(e,n){e&&t.push(n+"="+e)}),t.join(";")},humanize:function(e,t){return n.i18n(r["{{frequecy}}\ub9c8\ub2e4 {{interval_options}}({{until_or_count}}, {{timeZone}} \uae30\uc900)"],{frequecy:this._humanizeFrequency(),interval_options:this._humanizeIntervalOption(),until_or_count:this._humanizeUntil(e,t)||this._humanizeCount()||!1,timeZone:this.timeZoneInfo(e)})},validate:function(){if(!this.__recurrence__.FREQ)throw new Error("FREQ \uac12\uc740 \ud544\uc218\uc785\ub2c8\ub2e4.");if(!this._validateCountOrUntil(this.__recurrence__))throw new Error("UNTIL\uacfc COUNT \uac12\uc740 \uc911\ubcf5\ub420 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.");return!0},isDailyOfFreq:function(){return this.get("FREQ")===i.daily},isWeeklyOfFreq:function(){return this.get("FREQ")===i.weekly},isMonthlyOfFreq:function(){return this.get("FREQ")===i.monthly},isYearlyOfFreq:function(){return this.get("FREQ")===i.yearly},timeZoneInfo:function(e){var t=e||n.util.timeZoneOffset(),i=["GMT",t,r["\uae30\uc900"]].join("");return i},_humanizeFrequency:function(){var e=this.get("INTERVAL")||1,t={};return t[i.daily]=e===1?r["\ub9e4\uc77c"]:n.i18n(r["{{monthday}}\uc77c\ub9c8\ub2e4"],"monthday",e),t[i.weekly]=e===1?r["\ub9e4\uc8fc"]:n.i18n(r["{{week}}\uc8fc\ub9c8\ub2e4"],"week",e),t[i.monthly]=e===1?r["\ub9e4\uc6d4"]:n.i18n(r["{{month}}\uac1c\uc6d4\ub9c8\ub2e4"],"month",e),t[i.yearly]=e===1?r["\ub9e4\ub144"]:n.i18n(r["{{year}}\ub144\ub9c8\ub2e4"],"year",e),t[this.get("FREQ")]},_humanizeIntervalOption:function(){var t=e.compact([this._humanizeBymonthString(),this._humanizeBymonthdayString(),this._humanizeBydayString()]);return t.length>0?t.join(" "):undefined},_humanizeUntil:function(e,i){if(!this.get("UNTIL"))return;var s=e||n.util.store.get("timeZoneOffset"),o=i||n.session().timeZone.serverTZOffset,u=s||n.util.timeZoneOffset(),a=t(this.get("UNTIL"),"YYYYMMDD"),f=n.util.dateToRFC2445(a,u,o);return n.i18n(r["{{date}} \uae4c\uc9c0"],"date",f)},_humanizeCount:function(){if(!this.get("COUNT"))return;return n.i18n(r["{{count}}\ud68c"],"count",this.get("COUNT"))},_humanizeBydayString:function(){if(!this.get("BYDAY"))return;var t=this.get("BYDAY").split(","),i=[],o=this;return e.each(t,function(e){var t=/([0-9]*)(SU|MO|TU|WE|TH|FR|SA)?$/.exec(e),u=t[1]?f(t[1],n.config("locale")):undefined,a=t[2];o.get("BYSETPOS")&&(u=o.get("BYSETPOS")),u==="-1"?i.push(r["\ub9c8\uc9c0\ub9c9"]+" "+s[t[2]]):i.push(n.i18n(r["{{nth}}\ubc88\uc9f8 {{weekday}}"],{nth:u,weekday:s[a]}))}),i.join(",")},_humanizeBymonthdayString:function(){if(!this.get("BYMONTHDAY"))return;var t=[],i=this.get("BYMONTHDAY").split(",");return e.each(i,function(e){t.push(n.i18n(r["{{monthday}}\uc77c"],"monthday",e))}),t.join(",")},_humanizeBymonthString:function(){if(!this.get("BYMONTH"))return;var t=[],i=this.get("BYMONTH").split(",");return e.each(i,function(e){t.push(n.i18n(r["{{month}}\uc6d4"],"month",e))}),t.join(",")},_setHash:function(t){var n=u.unshift(t),r=e.pick.apply(e,n);if(!this._validateCountOrUntil(r))throw new Error("UNTIL\uacfc COUNT \uac12\uc740 \uc911\ubcf5\ub420 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.");return this.__recurrence__=e.extend(this.__recurrence__,r),this},_validateCountOrUntil:function(t){return!e.has(t,"COUNT")&&!e.has(t,"UNTIL")?!0:!!(e.has(t,"COUNT")&e.has(t,"UNTIL"))},_getWeekStr:function(){return o},_getDayStr:function(){return s}},a}();return a.FREQ_DAILY=i.daily,a.FREQ_WEEKLY=i.weekly,a.FREQ_MONTHLY=i.monthly,a.FREQ_YEARLY=i.yearly,a});