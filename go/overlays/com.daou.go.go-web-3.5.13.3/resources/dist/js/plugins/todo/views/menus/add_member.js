define("todo/views/menus/add_member",["components/history_menu/main","hgn!todo/templates/menus/add_member_menu","text!todo/templates/partials/_member_button.html","text!todo/templates/partials/_user_thumbnail.html","todo/models/todo","todo/views/menus/member_profile","i18n!todo/nls/todo","i18n!nls/commons","jquery.go-orgslide"],function(e,t,n,r,i,s,o,u){var a,f=e.HistoriableMenuView;return a=f.extend({id:"add-member-menu",className:"content",name:"add-member-menu",title:o["\ubcf4\ub4dc \uacf5\uc720"],template:t,afterSave:function(){},events:{"click .btn-add-member":"_callOrganogram","click .ui-user-photo":"_callMemberProfileMenu"},initialize:function(e){e=e||{},this.model||(this.model=new i),this.afterSave=e.afterSave||function(){},f.prototype.initialize.call(this,e),this.setMenuClass("layer_share"),this.listenTo(this.model,"change:members",this.render),this.connectWith=".layer_organogram"},render:function(){this.$el.empty().append(this.template({model:this.model.toJSON(),label:{add_member:o["\uba64\ubc84 \ucd94\uac00"]}},{_member_button:n,_user_thumbnail:r}))},remove:function(){f.prototype.remove.apply(this,arguments),this.connectWith&&$(this.connectWith).remove()},_callOrganogram:function(e){e.preventDefault();var t=$.goOrgSlide({header:o["\uba64\ubc84 \ucd94\uac00"],type:"node",contextRoot:GO.config("contextRoot"),callback:_.bind(this._addMember,this),zIndex:200,externalLang:u,memberTypeLabel:o["\uba64\ubc84"],isBatchAdd:!0});return t},_addMember:function(e){var t=_.isArray(e)?e:[e],n=this;if(t[0].type==="org")return;this.model.addMember(t)},_callMemberProfileMenu:function(e){var t=$(e.currentTarget),n;if(!this.model.isMember(GO.session("id")))return!1;e.preventDefault(),this.forward(new s.BoardMemberProfileMenuView({todoModel:this.model,userId:parseInt(t.data("userid"))}))}}),a});