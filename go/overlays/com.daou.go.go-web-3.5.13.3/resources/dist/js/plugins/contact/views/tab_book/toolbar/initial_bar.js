define(function(require){var e=require("backbone"),t=require("i18n!contact/nls/contact"),n=e.View.extend({className:"sort_wrap",events:{"click ul.tab_nav li":"_onClickInitial"},initialize:function(){},render:function(){function i(e){var t=["<ul class='tab_nav'>"];return $(e).each(function(n,r){n==0?t.push('<li data-param="" class="ui-state-active first"><span>'+r+"</span></li>"):n==e.length-1?t.push('<li class="last" data-param="'+r+'"><span>'+r+"</span></li>"):t.push('<li data-param="'+r+'"><span>'+r+"</span></li>")}),t.push("</ul>"),t.join("")}var e=t["\ucd08\uc131\uac80\uc0c9"],n=[];n=e.split(",");var r=i(n);this.$el.html(r)},reset:function(){var e=this.$el.find("li");e.each(function(e,t){var n=$(e);t==0?n.addClass("ui-state-active"):n.removeClass("ui-state-active")})},_onClickInitial:function(e){var t=$(e.currentTarget);t.closest("ul").find("li").removeClass("ui-state-active"),t.addClass("ui-state-active");var n=t.data("param");this.trigger("click.initialWord",n)},show:function(){this.$el.show()},hide:function(){this.$el.hide()}});return n});