define("works/views/app/data_copy",function(require){var e=require("i18n!nls/commons"),t=require("i18n!works/nls/works"),n={"\ub4f1\ub85d":e["\ub4f1\ub85d"],"\ucde8\uc18c":e["\ucde8\uc18c"],"\ub2e4\ub978 \uc571\uc73c\ub85c \ub370\uc774\ud130 \ubcf5\uc0ac":t["\ub2e4\ub978 \uc571\uc73c\ub85c \ub370\uc774\ud130 \ubcf5\uc0ac"],"\ub370\uc774\ud130 \ubcf5\uc0ac \uc124\uba85":t["\ub370\uc774\ud130 \ubcf5\uc0ac \uc124\uba85"],"\ub9e4\ud551 \uc800\uc7a5":t["\ub9e4\ud551 \uc800\uc7a5"],"\ub9e4\ud551 \uc124\uc815":t["\ub9e4\ud551 \uc124\uc815"],"\ud568\uaed8 \ubcf5\uc0ac":t["\ud65c\ub3d9\uae30\ub85d \ubc0f \ub313\uae00 \ud568\uaed8 \ubcf5\uc0ac"]},r=require("when"),i=require("works/constants/value_type"),s=require("works/models/applet_form"),o=require("works/models/applet_doc"),u=require("works/models/applet_baseconfig"),a=require("works/models/applet_field_mapping"),f=require("works/components/masking_manager/models/masking"),l=require("works/models/integration"),c=require("works/collections/fields"),h=require("components/backdrop/backdrop"),p=require("works/views/app/settings_layout"),d=require("works/views/app/doc_content"),v=require("works/views/app/doc_content_edit"),m=require("works/views/app/mapping/mapping_item"),g=require("works/components/formbuilder/formbuilder"),y=require("works/components/formbuilder/core/component_manager"),b=require("hgn!works/templates/app/data_copy"),w=require("works/constants/component_type");return Backbone.View.extend({className:"go_content go_renew go_works_home app_temp",events:{"click #saveMapping":"_onClickSaveMapping","click #saveDoc":"_onClickSaveDoc","click #cancel":"_onClickCancel","click #changeLayout":"_onClickChangeLayout","click #close":"_onClickClose"},initialize:function(e){var t=this;this.initLayout(),this.sourceFieldsOfIntegrationApplet={},this.targetFieldsOfIntegrationApplet={},this.sourceConfigModel=new u({id:e.sourceAppletId}),this.targetConfigModel=new u({id:e.targetAppletId}),this.sourceAppletId=e.sourceAppletId,this.targetAppletId=e.targetAppletId,this.sourceDocId=e.sourceDocId,this.sourceAppletForm=new s({appletId:e.sourceAppletId}),this.sourceAppletDoc=new o({appletId:this.sourceAppletId,id:this.sourceDocId}),this.sourceMasking=new f({appletId:this.sourceAppletId}),this.sourceMasking.fetch(),this.targetAppletForm=new s({appletId:e.targetAppletId}),this.targetAppletDoc=new o({appletId:this.targetAppletId}),this.targetMasking=new f({appletId:this.targetAppletId}),this.targetMasking.fetch(),this.sourceFields=new c([],{appletId:this.sourceAppletId,includeProperty:!0}),this.targetFields=new c([],{appletId:this.targetAppletId,includeProperty:!0}),this.appletFieldMapping=new a({sourceAppletId:this.sourceAppletId,targetAppletId:this.targetAppletId}),GO.util.preloader($.when(t.sourceConfigModel.fetch(),t.targetConfigModel.fetch(),t.sourceAppletForm.fetch(),t.targetAppletForm.fetch(),t.sourceAppletDoc.fetch(),t.sourceFields.fetch(),t.targetFields.fetch(),t.sourceMasking.deferred,t.targetMasking.deferred).then($.proxy(function(){var e=$.Deferred();return r.all([t.sourceFields.getFieldsOfIntegrationApplet(),t.targetFields.getFieldsOfIntegrationApplet()]).then(_.bind(function(n){t.sourceFieldsOfIntegrationApplet=n[0],t.targetFieldsOfIntegrationApplet=n[1],e.resolve()},t)),e},t)).then($.proxy(function(){return $.when(t.render(),t.appletFieldMapping.fetch())},t)).then($.proxy(function(){t._renderMapping()},t))),this.$el.on("changeMapping",$.proxy(this._onChangeMapping,this)),this.$el.on("clickMappingItem",$.proxy(this._onClickMappingItem,this))},render:function(){this.$el.html(b({lang:n,sourceConfig:this.sourceConfigModel.toJSON(),targetConfig:this.targetConfigModel.toJSON()})),this.sourceAppletDoc.isCreator(GO.session("id"))||this.sourceAppletForm.mergeMaskingValue(this.sourceMasking.get("fieldCids"));var e=new d({model:this.sourceAppletDoc,baseConfigModel:this.sourceConfigModel,appletFormModel:this.sourceAppletForm,integrationModel:new l(_.extend(this.sourceFieldsOfIntegrationApplet,{fields:this.sourceFields.toJSON()}))});this.$("[data-detail-area]").html(e.render().el),this.sourceComponentManager=y.getInstance("detail");var t=new v({baseConfigModel:this.targetConfigModel,appletFormModel:this.targetAppletForm,appletDocModel:this.targetAppletDoc,isMultiForm:!0,integrationModel:new l(_.extend(this.targetFieldsOfIntegrationApplet,{fields:this.targetFields.toJSON()}))});return this.$("[data-edit-area]").html(t.render().el),this.targetComponentManager=y.getInstance("form"),$.Deferred().resolve()},_renderMapping:function(){var e=this.sourceFields.rejectFields(this.sourceMasking.get("fieldCids")),t=this.targetFields.getMappingFields();t=t.rejectFields(this.targetMasking.get("fieldCids")),t.each(function(t){var n=this.appletFieldMapping.get("mapping"),r=new m({sourceAppletId:this.sourceAppletId,targetAppletId:this.targetAppletId,model:t,sourceFields:e,mappingData:n[t.get("cid")]});this.$("[data-mapping-list]").append(r.el),r.render()},this),this.appletFieldMapping.get("copyActivity")&&this.$("#withCopy").attr("checked",!0),this._bindBackdrop(),this._setHeight(),$(window).resize($.proxy(function(){this._setHeight()},this))},_setHeight:function(){this.$("[el-scroll-area]").css("height",$(window).height()-250)},_bindBackdrop:function(){var e=new h({el:this.$(".layer_tail")});e.bindBackdrop(),e.linkBackdrop(this.$(".ic_info"))},_onClickSaveMapping:function(){var t={},n=this.$('input:checkbox[id="withCopy"]').is(":checked");_.each(this.$("[data-mapping-list]").find("li"),function(e){var n=$(e);t[n.find("[data-target-cid]").attr("data-target-cid")]=n.find("select").val()}),this.appletFieldMapping.save({mapping:t,copyActivity:n},{success:function(){$.goMessage(e["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."])}})},_onClickSaveDoc:function(){var t=this.$('input:checkbox[id="withCopy"]').is(":checked");this.targetAppletDoc.setParam({fromDocId:this.sourceDocId,copyActivity:t});var n=g.getFormData("form");if(!n){var r=g.getInvalidForm();this._animate(r);return}this.targetAppletDoc.setValue(n),this.targetAppletDoc.save({},{success:$.proxy(function(t){$.goMessage(e["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),GO.router.navigate("works/applet/"+this.targetAppletId+"/doc/"+t.id,!0)},this)})},_onClickCancel:function(){GO.router.navigate("works/applet/"+this.sourceAppletId+"/doc/"+this.sourceDocId,!0)},_onClickMappingItem:function(e,t){var n=$(e.target).find("select").val(),r=this.sourceComponentManager.getComponent(t.sourceCid),i=n!=="0"&&r?this.sourceComponentManager.getComponent(n).getDetailView():null,s=this.targetComponentManager.getComponent(t.targetCid).getFormView();this._highlightFormView(s),this._highlightDetailView(i),this._animate(s,i)},_onChangeMapping:function(e,t){function u(e){n=_.isUndefined(e)?n:e,s.set(t.targetCid,n),this.targetAppletDoc.setValue(t.targetCid,n);var u=i.getFormView();if(u.isMultiple()){var a=u.getParentComponent();s.set(this.targetAppletDoc.get("values")),a.getFormView().renderNode()}else u.renderNode();_.isArray(n)&&n.length&&u.type===w.AppletDocs&&u.fetchAppletDocModel({id:n[0].id,appletId:u.model.get("integrationAppletId")});if(!t.isLabelMapping&&!o&&r){var f=r.getDetailView();this._animate(u,f),this._highlightFormView(u),this._highlightDetailView(f)}}var n,r=this.sourceComponentManager.getComponent(t.sourceCid),i=this.targetComponentManager.getComponent(t.targetCid),s=i.getAppletDocModel(),o=t.sourceCid==="0";if(o){u.call(this,this._getDefaultValue(i));return}n=this.sourceAppletDoc.get("values")[t.sourceCid],n=r&&r.isMultiple()?this._convertValueOfMultiple(t.sourceCid,t.targetCid,n,i):this._convertValue(t.sourceCid,t.targetCid,n),n&&_.isFunction(n.done)?n.done($.proxy(function(e){u.call(this,e)},this)):u.call(this)},_convertValueOfMultiple:function(e,t,n,r){return n=_.map(n,_.bind(function(n){return this._convertValue(e,t,n)},this)),this._isTextValueType(r.getValueType())&&!r.isMultiple()?n.join(","):n},_isTextValueType:function(e){return _.contains([i.STEXT,i.TEXT],e)},_highlightFormView:function(e){this.beforeFormView&&this.beforeFormView.removeClass("choice"),e.addClass("choice"),this.beforeFormView=e},_highlightDetailView:function(e){this.beforeDetailView&&this.beforeDetailView.removeClass("choice"),e?(e.addClass("choice"),this.beforeDetailView=e):this.beforeDetailView=null},_onClickChangeLayout:function(){this.$("#layoutArea").toggleClass("mode_full")},_onClickClose:function(){this.$("#layoutArea").removeClass("mode_full")},_convertValue:function(e,t,n){var r=this.targetComponentManager.getComponent(t),s=r.getValueType();if(_.isUndefined(n)){if(s===i.SELECTS&&r.isShow())return this._getDefaultValue(r);return}var o=this.sourceComponentManager.getComponent(e);if(_.isUndefined(o))return n;var u=o.getValueType(),a,f,l;if(u!==i.SELECT&&u!==i.SELECTS&&u===s)return n;if(u===i.APPLETDOCS)return n[0]?n[0].text:"";if(u===i.DATETIME){if(!n)return;if(s===i.DATE)return moment(n).format("YYYY-MM-DD");if(s===i.TIME)return moment(n).format("HH:mm")}if(u===i.DEPTS)return _.map(n,function(e){return e.displayName}).join(", ");if(u===i.SELECT){a=this.sourceFields.findByCid(e);var c=_.findWhere(a.get("options"),{value:n})||{},h=c.displayText;if(_.contains([i.STEXT,i.TEXT],s))return c.displayText;if(_.contains([i.SELECT,i.SELECTS],s)){f=this.targetFields.findByCid(t);var p=_.findWhere(f.get("options"),{displayText:h});return n=p?p.value:null,n===null?this._getDefaultValue(r):i.SELECT===s?n:[n]}if(s===i.APPLETDOCS)return this._toAppletDocs(h,r)}if(u===i.SELECTS){if(s===i.SELECTS){a=this.sourceFields.findByCid(e);var d=_.compact(_.map(n,function(e){return _.findWhere(a.get("options"),{value:e})}));l=_.map(d,function(e){return e.displayText}),f=this.targetFields.findByCid(t);var v=_.compact(_.map(l,function(e){return _.findWhere(f.get("options"),{displayText:e})})),m=_.map(v,function(e){return e.value});return m.length||(m=this._getDefaultValue(r)),m}return a=this.sourceFields.findByCid(e),l=_.map(n,function(e){var t=_.findWhere(a.get("options"),{value:e});return n=t.displayText}),l}if(u===i.STEXT)return s===i.APPLETDOCS?this._toAppletDocs(n,r):n;if(u===i.USERS)return _.map(n,function(e){return e.displayName||e.name+(e.position?" "+e.position:"")}).join(", ");if(u===i.USER)return s===i.USERS?[n]:n.displayName||n.name+(n.position?" "+n.position:"");if(u===i.NUMBER){n=GO.util.numberWithCommas(n);var g=o.getComponentPropertyModel();return g.get("fixType")==="prefix"?g.get("unitText")+" "+n:g.get("fixType")==="postfix"?n+" "+g.get("unitText"):n}return n},_getDefaultValue:function(e){if(!e.properties.items)return e.properties.defaultValue;var t=e.getValueType(),n=_.filter(e.properties.items,function(e){return e.selected}),r=_.map(n,function(e){return parseInt(e.value)});return t===i.SELECT?r[0]:r},_toAppletDocs:function(e,t){var n=t.getFormView(),r=$.Deferred();return n.docs.duplicateSearch(e).done(function(e){var t=[];if(e.length===1){var i=e.at(0);t.push({id:i.get("id"),text:i.get("values")[n.docs.fieldCid]})}r.resolve(t)}),r},_animate:function(e,t){t&&t.$el.closest(".card_type5").animate({scrollTop:t.$el.offset().top-t.$el.closest("[data-detail-area]").offset().top}),e.$el.closest(".card_type5").animate({scrollTop:e.$el.offset().top-e.$el.closest("#fb-canvas-edit").offset().top})},initLayout:function(){this.layoutView=p.create(),GO.session().theme!=="THEME_ADVANCED"&&this.layoutView.setUseOrganogram(!1)},renderLayout:function(){return r(this.layoutView.render()).then($.proxy(function(){this.layoutView.$el.addClass("go_skin_default go_full_screen go_skin_works"),this.layoutView.$el.removeClass("full_page"),this.layoutView.setContent(this)},this)).otherwise(function(t){console.log(t.stack)})},_setMasking:function(e,t){return _.each(e,function(e){var n=_.contains(t,e.get("cid"));e.set("isMasking",n)}),e}})});