(function(){define(["jquery","underscore","hogan","i18n!nls/commons"],function(e,t,n,r){var i={input:"input",textarea:"textarea"},s="txt_form",o="w_max",u,a={view:'<span class="{{view_classnames}}"{{#editable?}} data-field="{{attr_name}}"{{/editable?}}>{{&content}}{{#editable?}}<span class="tool_tip">'+r["\uc218\uc815"]+' <i class="tail"></i></span>{{/editable?}}</span>',input:'<input{{^edit?}} id="form-field-{{attr_name}}"{{/edit?}} class="txt wfix_max{{#edit?}} edit{{/edit?}} {{fix_width_classname}}" type="text" name="{{attr_name}}" value="{{content}}"{{#maxlength}} maxlength="{{maxlength}}"{{/maxlength}} />',textarea:'<textarea name="{{attr_name}}" class="txtarea {{fix_width_classname}}{{#edit?}} edit{{/edit?}}" rows="10">{{content}}</textarea>',button:'<span class="ic_side ic_done" title="'+r["\uc218\uc815"]+'"></span>'};return u=function(){var r=function(e,r,i,s){return this.options=t.defaults(options||{},{editable:!0,required:!1,maxlength:0}),this.type=e||"input",this.name=r||"",this.content=i||"",this.editable=typeof s=="undefined"?!0:s,this.required=!1,this.maxlength=0,this.preClassnames="",this.postClassnames="",this.widthFixClassname="w_max",this.changableWidth=!0,this.__prevContent__=""+this.content,this.__isChanged__=!1,this._compiledTpl=n.compile(this.content?a.view:a[this.type]),this};return r.prototype={render:function(){return this._buildViewTemplate()},getJQueryElement:function(t){var n=[],r=[this.type,"[name=",this.name,"]"].join("");return n.push(r),typeof t!="undefined"&&n.push(t),e.apply(e,n)},getContent:function(){return this.content},setEditable:function(e){return this.editable=e,this},setRequired:function(e){return this.required=e,this},setMaxLength:function(e){return this.maxlength=e,this},setPreClassnames:function(e){return this.preClassnames=e,this},setPostClassnames:function(e){return this.preClassnames=e,this},setWidthFixClassname:function(e){return this.widthFixClassname=e,this},setChangableWidth:function(e){return this.changableWidth=e,this},getSourceContent:function(){return this.__prevContent__},isChanged:function(){return this.__isChanged__},setEditMode:function(t){var r=t instanceof e.Event?e(t.currentTarget):e(t),i=n.compile(a[this.type]+a.button);return r.empty().html(i.render({attr_name:this.name,content:this._unescapeContent(this.content),fix_width_classname:this.widthFixClassname,maxlength:this.maxlength>0?this.maxlength:null,"edit?":!0})),r.removeClass(s).addClass(this._getTypeClass()),this.changableWidth&&r.addClass(this.widthFixClassname),this},setViewMode:function(t){var n=t instanceof e.Event?e(t.currentTarget):e(t),r=n.find(this.type+'[name="'+this.name+'"]'),i=r.val();return this._validate(n)?(this.content=this._escapeContent(i),this.__isChanged__=this.__prevContent__!==this.content,n.empty().html(this._buildViewTemplate()),n.removeClass(this._getTypeClass()).addClass(s),this.changableWidth&&n.removeClass(this.widthFixClassname),!0):!1},_unescapeContent:function(e){return e=e.replace(/&lt;/gi,"<"),e=e.replace(/&gt;/gi,">"),e},_escapeContent:function(e){return e=e.replace(/</gi,"&lt;"),e=e.replace(/>/gi,"&gt;"),e},_validate:function(e){var t=e.find(this.type+'[name="'+this.name+'"]'),n=t.val();return this.required&&!n?(t.val(this.__prevContent__),e.trigger("required:"+this.name,t),!1):this.maxlength>0&&n.length>this.maxlength?(t.val(n.slice(0,this.maxlength)),e.trigger("max:"+this.name,t,this.maxlength),!1):!0},_buildViewTemplate:function(){var e=[],t=this.content;return this.preClassnames&&e.push(this.preClassnames),this.editable&&e.push("txt_form"),this.postClassnames&&e.push(this.postClassnames),this._compiledTpl.render({attr_name:this.name,content:GO.util.convertRichText(t),fix_width_classname:t?"":this.widthFixClassname,view_classnames:e.join(" "),"editable?":this.editable})},_getTypeClass:function(){return{input:"txt_edit",textarea:"textarea_edit"}[this.type]}},r}(),u})}).call(this);