define("admin/views/ehr/timeline/group/noti/noti_settings",function(require){var e=require("backbone"),t=require("admin/views/ehr/timeline/group/noti/noti"),n=require("i18n!timeline/nls/timeline"),r=require("i18n!admin/nls/admin"),i=require("underscore"),s={"\uae30\ubcf8 \uadfc\ubb34\uc2dc\uac04 \ucd08\uacfc(\uc804)":GO.i18n(n["\uae30\ubcf8 \uadfc\ubb34\uc2dc\uac04 \ucd08\uacfc(0)"],{arg1:r["\uc804"]}),"\uae30\ubcf8 \uadfc\ubb34\uc2dc\uac04 \ucd08\uacfc(\ud6c4)":GO.i18n(n["\uae30\ubcf8 \uadfc\ubb34\uc2dc\uac04 \ucd08\uacfc(0)"],{arg1:r["\ud6c4"]}),"\uc5f0\uc7a5 \uadfc\ubb34\uc2dc\uac04 \ucd08\uacfc(\uc804)":GO.i18n(n["\uc5f0\uc7a5 \uadfc\ubb34\uc2dc\uac04 \ucd08\uacfc(0)"],{arg1:r["\uc804"]}),"\uc5f0\uc7a5 \uadfc\ubb34\uc2dc\uac04 \ucd08\uacfc(\ud6c4)":GO.i18n(n["\uc5f0\uc7a5 \uadfc\ubb34\uc2dc\uac04 \ucd08\uacfc(0)"],{arg1:r["\ud6c4"]})},o=e.View.extend({initialize:function(){function u(e,t){return i.chain(e).filter(function(e){return e.notiType==t}).value()}this.itemViews=[];var e=this.options.collection,r=new t({type:"CLOCKIN",title:n["\uc5c5\ubb34\uc2dc\uc791"],timeSetting:{use:!0,type:"MINUTE",afterType:!1},collection:u(e,"CLOCKIN")});this.itemViews.push(r);var o=new t({type:"CLOCKOUT",title:n["\uc5c5\ubb34\uc885\ub8cc"],timeSetting:{use:!0,type:"MINUTE",afterType:!1},collection:u(e,"CLOCKOUT")});this.itemViews.push(o),this.itemViews.push(new t({type:"OVER_TIME_40_BEFORE",title:n["40\uc2dc\uac04 \ucd08\uacfc"],timeSetting:{use:!1},description:n["40\uc2dc\uac04 \ucd08\uacfc \uc54c\ub9bc \uc124\uba85"],collection:u(e,"OVER_TIME_40_BEFORE")})),this.itemViews.push(new t({type:"OVER_TIME_52_BEFORE",title:n["52\uc2dc\uac04 \ucd08\uacfc"],timeSetting:{use:!1},description:n["52\uc2dc\uac04 \ucd08\uacfc \uc54c\ub9bc \uc124\uba85"],collection:u(e,"OVER_TIME_52_BEFORE")})),this.itemViews.push(new t({type:"REST_TIME",title:n["\ud734\uac8c\uc2dc\uac04 \uc885\ub8cc"],timeSetting:{use:!0,type:"MINUTE",afterType:!1},collection:u(e,"REST_TIME")})),this.itemViews.push(new t({type:"OVER_TIME_MONTH_MINIMUM_BEFORE",title:s["\uae30\ubcf8 \uadfc\ubb34\uc2dc\uac04 \ucd08\uacfc(\uc804)"],timeSetting:{use:!0,type:"HOUR",afterType:!1},collection:u(e,"OVER_TIME_MONTH_MINIMUM_BEFORE")})),this.itemViews.push(new t({type:"OVER_TIME_MONTH_MINIMUM_AFTER",title:s["\uae30\ubcf8 \uadfc\ubb34\uc2dc\uac04 \ucd08\uacfc(\ud6c4)"],timeSetting:{use:!0,type:"HOUR",afterType:!0},collection:u(e,"OVER_TIME_MONTH_MINIMUM_AFTER")})),this.itemViews.push(new t({type:"OVER_TIME_MONTH_EXTENSION_MAXIMUM_BEFORE",title:s["\uc5f0\uc7a5 \uadfc\ubb34\uc2dc\uac04 \ucd08\uacfc(\uc804)"],timeSetting:{use:!0,type:"HOUR",afterType:!1},collection:u(e,"OVER_TIME_MONTH_EXTENSION_MAXIMUM_BEFORE")})),this.itemViews.push(new t({type:"OVER_TIME_MONTH_EXTENSION_MAXIMUM_AFTER",title:s["\uc5f0\uc7a5 \uadfc\ubb34\uc2dc\uac04 \ucd08\uacfc(\ud6c4)"],timeSetting:{use:!0,type:"HOUR",afterType:!0},collection:u(e,"OVER_TIME_MONTH_EXTENSION_MAXIMUM_AFTER")})),this.renderNotiList(this.options.hideNotis)},render:function(){i.each(this.itemViews,i.bind(function(e){this.$el.append(e.$el),e.render()},this))},getData:function(e){var t=i.chain(this.itemViews);return e&&(t=t.filter(function(t){return!i.contains(e,t.type)})),i.flatten(t.map(function(e){return e.getData()}).value())},show:function(e){i.chain(this.itemViews).filter(function(t){return i.contains(e,t.type)}).map(function(e){e.$el.show()}).value()},hide:function(e){i.chain(this.itemViews).filter(function(t){return i.contains(e,t.type)}).map(function(e){e.$el.hide()}).value()},renderNotiList:function(e){var t=i.chain(this.itemViews);t.filter(function(t){return i.contains(e,t.type)}).map(function(e){e.$el.show()}).value(),t.filter(function(t){return!i.contains(e,t.type)}).map(function(e){e.$el.hide()}).value()}});return o});