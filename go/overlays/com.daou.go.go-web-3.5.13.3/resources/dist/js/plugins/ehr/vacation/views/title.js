define(["backbone","app","hgn!vacation/templates/title","i18n!vacation/nls/vacation"],function(e,t,n,r){function o(e,t,n){}var i={"\ub0b4 \uc5f0\ucc28 \ub0b4\uc5ed":r["\ub0b4 \uc5f0\ucc28 \ub0b4\uc5ed"],"\uc804\uc0ac \uc5f0\ucc28\ud604\ud669 \uad00\ub9ac":r["\uc804\uc0ac \uc5f0\ucc28\ud604\ud669 \uad00\ub9ac"],"\ubd80\uc11c \uc5f0\ucc28\ud604\ud669":r["\ubd80\uc11c \uc5f0\ucc28\ud604\ud669"],"\uc804\uc0ac \uc5f0\ucc28\ud604\ud669":r["\uc804\uc0ac \uc5f0\ucc28\ud604\ud669"]},s=e.View.extend({events:{},initialize:function(){},render:function(e){return $.extend(i,{label_title:e}),this.$el.html(n({lang:i})),this}});return s});