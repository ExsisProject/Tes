define("works/components/formbuilder/form_components/field_mapping/field_mapping",function(require){var e=require("underscore"),t=require("backbone"),n=require("moment"),r=require("app"),s=require("works/constants/component_type"),o=require("works/constants/field_type"),u=require("works/constants/value_type"),a=require("works/components/formbuilder/core/form_component"),f=require("works/components/formbuilder/core/component_registry"),l=require("works/components/formbuilder/core/component_manager"),c=require("works/components/formbuilder/core/views/base_form"),h=require("works/components/formbuilder/core/views/base_detail"),p=require("works/components/formbuilder/core/views/base_option"),d=require("works/components/masking_manager/models/masking"),v=require("works/models/applet_doc"),m=require("works/collections/fields"),g=require("hgn!works/components/formbuilder/form_components/field_mapping/option"),y=require("hgn!works/components/formbuilder/form_components/field_mapping/form"),b=require("hgn!works/components/formbuilder/form_components/field_mapping/detail"),w=require("go-nametags"),E=require("i18n!works/nls/works"),S=require("i18n!nls/commons");require("jquery.go-preloader");var x={"\uc5f0\ub3d9\ucef4\ud3ec\ub10c\ud2b8 \ub9e4\ud551":E["\uc5f0\ub3d9\ucef4\ud3ec\ub10c\ud2b8 \ub9e4\ud551"],"\uc774\ub984":S["\uc774\ub984"],"\uc124\uba85":E["\uc124\uba85"],"\uc774\ub984\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694":E["\uc774\ub984\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694."],"\uc774\ub984\uc228\uae30\uae30":E["\uc774\ub984\uc228\uae30\uae30"],"\uc124\uba85\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694":E["\uc124\uba85\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694."],"\ud234\ud301\uc73c\ub85c \ud45c\ud604":E["\ud234\ud301\uc73c\ub85c \ud45c\ud604"],"\uc790\ub3d9\uc785\ub825":E["\uc790\ub3d9\uc785\ub825"],"\uc5f0\ub3d9 \ucef4\ud3ec\ub10c\ud2b8":E["\uc5f0\ub3d9 \ucef4\ud3ec\ub10c\ud2b8"],"\ucef4\ud3ec\ub10c\ud2b8 \ub9e4\ud551":E["\ucef4\ud3ec\ub10c\ud2b8 \ub9e4\ud551"],"\uc120\ud0dd\ud558\uc138\uc694":S["\uc120\ud0dd\ud558\uc138\uc694."],"\uad00\ub9ac\uc790\uc5d0 \uc758\ud574 \ub9c8\uc2a4\ud0b9 \ucc98\ub9ac \ub41c \ud56d\ubaa9\uc785\ub2c8\ub2e4":E["\uad00\ub9ac\uc790\uc5d0 \uc758\ud574 \ub9c8\uc2a4\ud0b9 \ucc98\ub9ac \ub41c \ud56d\ubaa9\uc785\ub2c8\ub2e4"]},T="targetComponentCid",N="targetFieldCid",C=t.View.extend({tagName:"span",initialize:function(e){var t=e||{};this.setSource(t.source),this.setValueType(t.valueType),this.setFieldInfo(t.fieldInfo||{})},render:function(){return this.convert()},setSource:function(e){return this.source=e,this},getSource:function(){return this.source},setValueType:function(e){return this.valueType=e,this},getValueType:function(){return this.valueType},setFieldInfo:function(e){return this.fieldInfo=e,this},convert:function(){switch(this.valueType){case u.NUMBER:this._fromNumber();break;case u.SELECT:case u.SELECTS:this._fromSelectType();break;case u.DATE:this._fromDate();break;case u.DATETIME:this._fromDatetime();break;case u.USERS:case u.USER:this._fromUsersType();break;case u.DEPTS:this._fromDept();break;case u.STEXT:case u.STEXTS:default:this._fromText()}return this},_fromText:function(){var t=this.source;e.isArray(this.source)&&(t=e.compact(this.source).join(", ")),e.isString(t)||(t="-"),this.$el.html(r.util.escapeHtml(t))},_fromNumber:function(){var e=this.source,t=this.fieldInfo.dataType?this.fieldInfo.dataType:"NUMBER";if(t=="PERCENT")r.util.isInvalidValue(e)?e="-":e='<span class="com_gage"><span class="wrap_gage"><span class="gage" id="percentGage" style="width:'+e+'%"></span></span><span class="txt">'+e+"%</span></span>";else if(t=="POINT")if(r.util.isInvalidValue(e))e="-";else{var n='<span class="com_rate"><span class="wrap_rate">';for(i=0;i<this.fieldInfo.maxLength;i++){var s=i<parseFloat(e)?"":"ic_star_off";n=n+'<ins style="cursor: default;" class="ic_star '+s+'"></ins>'}n+="</span></span>",e=n}else this.fieldInfo.thousandComma&&(e=r.util.numberWithCommas(e)),this.fieldInfo.fixType==="prefix"&&(e=this.fieldInfo.unitText+" "+e),this.fieldInfo.fixType==="postfix"&&(e=e+" "+this.fieldInfo.unitText);this.$el.html(e)},_fromSelectType:function(){var t=this.source,n="-";if(this._hasSource()){var i=this.fieldInfo,s=e.isArray(t)?t:[t],o=e.map(s,function(t){var n=e.findWhere(i.options||[],{value:t});return n?r.util.escapeHtml(n.displayText):""});o=e.compact(o),n=o.join(", "),this.getValueType()==="SELECTS"?this.setSource(o):this.setSource(n)}this.$el.html(n)},_fromDate:function(){var e=this.source,t="-";this._hasSource()&&(t=[e.substr(0,4),e.substr(4,2),e.substr(6,2)].join("-")),this.$el.html(t)},_fromDatetime:function(){var e=this.source,t="-";this._hasSource()&&(t=n(e).format("YYYY-MM-DD HH:mm")),this.$el.html(t)},_fromUsersType:function(){function u(e){var t="";if(e){var n=e&&e.position?e.position:"",r=e&&e.displayName?e.displayName:"";r?t=r:t=e.name+(n?" "+n:"")}return t}var t=this.source,n="-";if(this._hasSource()){var i=e.isArray(t)?t:[t],s=r.util.isMobile(),o=e.map(i,function(e){var t="",n=u(e);return s?t+='<li><span class="name">'+n+"</span></li>":(t+='<span class="member">',e&&e.thumbnail&&(t+='<img src="'+e.thumbnail+'" alt="'+n+'" title="'+n+'">'+"\n"),t+='<span class="txt">'+n+"</span>",t+="</span>"),t},this);n=o.join(""),s&&this.setElement('<ul class="name_tag"></ul>')}this.$el.html(n)},_fromDept:function(){var t=this.source;if(this._hasSource()){var n=e.isArray(t)?t:[t],r=w.create({},{useAddButton:!1});e.each(n,function(e){r.addTag(e.id,e.name,{attrs:e,removable:!1})}),this.$el.html(r.el)}else this.$el.html("-")},toHtml:function(){return this.$el.html()},toText:function(){var t="-";if(this._isTypeOfUser()||this._isTypeOfDept()){var n=this.$el.find(this._hasNameTagElement()?"span.name":"span.txt"),r=[];n.each(function(){r.push($(this).text())}),t=(e.compact(r)||[]).join(", ")}else t=this.$el.text();return t},_hasNameTagElement:function(){return this.$el.hasClass("name_tag")||this.$el.find("ul.name_tag").length>0},_isTypeOfUser:function(){return e.contains([u.USER,u.USERS],this.getValueType())},_isTypeOfDept:function(){return u.DEPTS===this.getValueType()},_hasSource:function(){return!e.isUndefined(this.source)&&this.source!==null}},{create:function(e,t,n){return new C({source:e,valueType:t,fieldInfo:n})}}),k=p.extend({customEvents:function(){var e={};return e["change select[name="+T+"]"]="_loadIntegratedFieldOptions",e["change select[name="+N+"]"]="_onChangeMappingProp",e},renderBody:function(){var e=this._changeable("targetAppletId"),t=this._changeable("targetFieldCid");this.$el.html(g({lang:x,model:this.model.toJSON(),appletChangeable:e,fieldChangeable:t,targetComponentCid:T,targetFieldCid:N})),e&&this._loadIntegratedComponentOptions(),t&&this._loadIntegratedFieldOptions()},_changeable:function(e){var t=l.getInstance(this.viewType),n=t.getComponent(this.clientId);return t.isNew(this.clientId)?!0:!this.model.get(e)||this.model.get(e)!=n.properties[e]},_loadIntegratedComponentOptions:function(){var t=[],n;n=this.$el.find("select[name="+T+"]"),e.each(this._getAppletDocComponent(),function(e){var n=e.getComponentPropertyModel();t.push('<option value="'+e.getCid()+'">'+n.get("label")+"</option>")}),n.append(t.join("\n"));var r=this.model.get(T);r&&r.length>0&&(n.val(r),this._fetchAndUpdateIntegratedFieldOptions(r))},_loadIntegratedFieldOptions:function(){var e,t,n,r,i,s=l.getInstance(this.viewType);this.$("select[name="+N+"]").html('<option value="">'+x["\uc120\ud0dd\ud558\uc138\uc694"]+"</option>"),e=this.$("select[name="+T+"]").val()||this.model.get("targetComponentCid"),e&&(t=s.getComponent(this.clientId),n=t.getComponentPropertyModel(),r=s.getComponent(e),i=r.getComponentPropertyModel(),n.set("targetAppletId",r.getAppletId()),n.set("targetAppletName",i.get("appletName")),n.set("targetComponentLabel",i.get("label")),this._fetchAndUpdateIntegratedFieldOptions(e))},_fetchAndUpdateIntegratedFieldOptions:function(t){var n=t,r=this;if(e.isString(t)){var i=l.getInstance(this.viewType);n=i.getComponent(t)}if(n){var s=n.getComponentPropertyModel(),o=this.$el.find("select[name="+N+"]"),u=[];this.fields=new m([],{appletId:s.get("integrationAppletId"),type:"consumers"}),this.fields.fetch({success:function(e){var t=e.getMappableFields();t.each(function(e){var t=e.get("label");u.push('<option value="'+e.get("cid")+'" data-valuetype="'+e.get("valueType")+'">'+t+"</option>")}),o.append(u.join("\n"));var n={};o.children().each(function(){n[this.value]&&$(this).remove(),n[this.value]=!0});var i=r.model.get(N);i&&i.length>0&&o.val(i)}})}},_onChangeMappingProp:function(e){var t=$(e.currentTarget),n=t.val(),r=t.find("option:selected"),i=r.data("valuetype"),s=r.text();n&&n.length>0&&(this._setValueType(i),this._setTargetFieldLabel(s))},_setValueType:function(e){var t=l.getInstance(this.viewType),n=t.getComponent(this.clientId);switch(e){case u.SELECT:n.setValueType(u.STEXT);break;case u.SELECTS:n.setValueType(u.STEXTS);break;default:n.setValueType(e)}},_setTargetFieldLabel:function(e){var t=l.getInstance(this.viewType),n=t.getComponent(this.clientId),r=n.getComponentPropertyModel();r.set("targetFieldLabel",e)},_getAppletDocComponent:function(){var t=l.getInstance(this.viewType);return e.filter(t.getComponents(),function(e){return e.getType()===o.APPLETDOCS})}}),L=c.extend({initialize:function(){c.prototype.initialize.apply(this,arguments),this.sourceData=null,!this.isEditable()&&this.observer&&(this.listenTo(this.observer,"applet_doc:add",this._onAppletDocAdded),this.listenTo(this.observer,"applet_doc:removed",this._onAppletDocRemoved));var e=this.model.get("targetComponentCid"),t=l.getInstance(this.viewType),n=t.getComponent(e),r=n?n.getComponentPropertyModel():null;this.masking=new d({appletId:r?r.get("integrationAppletId"):null}),r&&r.get("integrationAppletId")&&this.appletDocModel.id?this.masking.fetch():this.masking.deferred.resolve()},render:function(){this.masking.deferred.done(e.bind(function(){var t=e.contains(this.masking.get("fieldCids"),this.model.get("targetFieldCid"));this.$body.html(y({clientId:this.getCid(),displayTextId:this._getDisplayTextId(),model:this.model.toJSON(),label:r.util.escapeHtml(this.model.get("label")),"editable?":this.isEditable(),lang:x,isMasking:t})),this._setClassname(),this._initDisplayContent()},this))},_initDisplayContent:function(){var e=this.appletDocModel.get(this.getCid()),t=x["\uc790\ub3d9\uc785\ub825"],n;e&&(n=this._createOrGetDisplayView(e),t=n.convert().toHtml(),this._getInputElement().data("source",e)),this._getContentEl().html(t)},_setClassname:function(){var e=["wrap_txt"];this._getContentEl().attr("class",""),this.isEditable()&&e.push("disabled"),this._getContentEl().addClass(e.join(" "))},_gerSourceData:function(){return this.appletDocModel.get(this.getCid())},_setSourceData:function(e){var t;if(this.displayContentView)switch(this.displayContentView.getValueType()){case u.SELECT:case u.SELECTS:t=this.displayContentView.getSource();break;default:t=e}this.appletDocModel.set(this.getCid(),t)},_onAppletDocAdded:function(e,t,n){if(this.model.get(T)!=e)return;if(!this._getVisible())return;this._fetchAndInputContent(t,n)},_fetchAndInputContent:function(e,t){var n=new v(e),r=this._getFieldInfo(t);this._setContent(n,r)},_getFieldInfo:function(t){var n=e.findWhere(t||[],{cid:this.model.get(N)}),r=l.getInstance(this.viewType),i=r.getComponent(this.getCid()),s=i.getIntegrationModel();return e.extend(n,s.getPropertiesByMappingComponentId(this.clientId))},_onAppletDocRemoved:function(t,n,r,i){if(this.model.get(T)!=t)return;this._clearContent(),r&&e.keys(r).length>0&&this._fetchAndInputContent(r,i)},_hasMappedData:function(){return!!this._gerSourceData()},_getInputElement:function(){return this.$el.find('input[name="'+this.getCid()+'"]')},_clearMappedData:function(){this.appletDocModel.set(this.getCid(),null)},_setContent:function(e,t){var n=this.model.get(N),r=e.getValue(n),i=l.getInstance(this.viewType),s=i.getComponent(this.getCid()),o=s.getValueType(),u=this._createOrGetDisplayView(r);t&&(o=t.valueType,u.setFieldInfo(t)),u.setValueType(o),this._getContentEl().html(u.convert().toHtml()),this._setSourceData(r)},_createOrGetDisplayView:function(t,n){var r=l.getInstance(this.viewType),i=r.getComponent(this.getCid());e.isUndefined(n)&&(n=i.getValueType());if(this.displayContentView)this.displayContentView.setSource(t).setValueType(n);else{var s=i.getIntegrationModel(),o=s.getPropertiesByMappingComponentId(this.clientId);this.displayContentView=C.create(t,n,o)}return this.displayContentView},_clearContent:function(){var e=this._getInputElement();e.val(""),e.data("source",null),this._clearMappedData(),this._getContentEl().html(x["\uc790\ub3d9\uc785\ub825"])},_getDisplayTextId:function(){return this.getCid()+"-displayText"},_getContentEl:function(){return this.$body.find("#"+this._getDisplayTextId())}}),A=h.extend({initialize:function(){h.prototype.initialize.apply(this,arguments);var e=this.model.get("targetComponentCid"),t=l.getInstance(this.viewType),n=t.getComponent(e),r=n?n.getComponentPropertyModel():null;this.masking=new d({appletId:r?r.get("integrationAppletId"):null}),r&&r.get("integrationAppletId")&&this.appletDocModel.id?this.masking.fetch():this.masking.deferred.resolve()},render:function(){this.masking.deferred.done(e.bind(function(){var t=e.contains(this.masking.get("fieldCids"),this.model.get("targetFieldCid"));this.$body.html(b({model:this.model.toJSON(),label:r.util.escapeHtml(this.model.get("label")),userData:this._getDisplayHtml(),isMasking:t,lang:x}))},this))},getTitle:function(){var e=this._getDisplayContentView();return e.convert().toText()},_getDisplayContentView:function(){var e=this.appletDocModel.get(this.clientId),t=l.getInstance(this.viewType),n=t.getComponent(this.clientId);if(this.displayContentView)this.displayContentView.setSource(e).setValueType(n.getValueType());else{var r=n.getIntegrationModel(),i=r.getPropertiesByMappingComponentId(this.clientId);this.displayContentView=C.create(e,n.getValueType(),i)}return this.displayContentView},_getDisplayHtml:function(){var e=this._getDisplayContentView();return e.convert().toHtml()}}),O=a.define(s.FieldMapping,{name:x["\uc5f0\ub3d9\ucef4\ud3ec\ub10c\ud2b8 \ub9e4\ud551"],valueType:u.STEXT,group:"extra",properties:{label:{defaultValue:x["\uc5f0\ub3d9\ucef4\ud3ec\ub10c\ud2b8 \ub9e4\ud551"]},hideLabel:{defaultValue:!1},guide:{defaultValue:""},guideAsTooltip:{defaultValue:!0},targetAppletId:{defaultValue:null},targetAppletName:{defaultValue:""},targetComponentCid:{defaultValue:""},targetComponentLabel:{defaultValue:""},targetFieldCid:{defaultValue:""},targetFieldLabel:{defaultValue:""}},OptionView:k,FormView:L,DetailView:A});f.addComponent(O)});