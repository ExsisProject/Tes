define("timeline/views/user/week",function(require){var e=require("backbone"),t=require("hgn!timeline/templates/user/week"),n=require("i18n!timeline/nls/timeline"),r=require("timeline/views/user/day"),i=require("timeline/helpers/user/local_storage"),s=e.View.extend({events:{"click #weekToggle":"toggle"},initialize:function(){this.model=this.options.model,this.targetUserId=this.options.targetUserId,this.index=this.options.index},render:function(){this.$el.html(t({TimelineLang:n,index:this.index,totalWorkingTime:this.model.getTotalWorkingTime(),extensionWorkingTime:this.model.getExtensionWorkingTimeStr(),isOverTotalWorkingTime:this.model.isOverTotalWorkingTime()}));var e=this.$el.find("#day_list"),s=!1;_.each(this.model.get("dailyList"),function(t){var n=new r({targetUserId:this.targetUserId,data:t});e.append(n.$el),n.render(),i.isSelectedDay(t.detailDay.day)&&(s=!0)},this),(s||i.isContainWeek(this.index))&&this.show()},toggle:function(){var e=this.$el.find("#weekToggle");e.hasClass("ic_open")?this.show():e.hasClass("ic_close")&&this.hide()},show:function(){var e=this.$el.find("#weekToggle");e.removeClass("ic_open"),e.addClass("ic_close"),this.$el.find("#day_area").show(),i.addWeek(this.index)},hide:function(){var e=this.$el.find("#weekToggle");e.removeClass("ic_close"),e.addClass("ic_open"),this.$el.find("#day_area").hide(),i.removeWeek(this.index)}});return s});