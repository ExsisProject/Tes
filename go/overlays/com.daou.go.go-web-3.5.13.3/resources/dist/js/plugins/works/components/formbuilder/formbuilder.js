define("works/components/formbuilder/formbuilder",function(require){function i(e,r,i,s){var o=i||{},u=n.toAppletFormModel(e),a=n.toAppletDocModel(r),f=e.appletId,l=o.observer||_.extend({},Backbone.Events),c=t.init(u.toJSON(),i),h=c.getComponent(u.get("cid"),o);return h.setAppletId(f),h.setEditable(!1),h.attachObserver(l),h.setAppletDocModel(a),h.setIntegrationModel(s),h}var e=require("works/components/formbuilder/core/views/builder"),t=require("works/components/formbuilder/core/component_manager"),n=require("works/components/formbuilder/core/models/adapters"),r=require("works/components/formbuilder/constants");require("works/components/formbuilder/form_components/canvas/canvas"),require("works/components/formbuilder/form_components/input_text/input_text"),require("works/components/formbuilder/form_components/input_textarea/input_textarea"),require("works/components/formbuilder/form_components/input_radio/input_radio"),require("works/components/formbuilder/form_components/input_checkbox/input_checkbox"),require("works/components/formbuilder/form_components/input_select/input_select"),require("works/components/formbuilder/form_components/input_listbox/input_listbox"),require("works/components/formbuilder/form_components/input_number/input_number"),require("works/components/formbuilder/form_components/input_timepicker/input_timepicker"),require("works/components/formbuilder/form_components/input_datepicker/input_datepicker"),require("works/components/formbuilder/form_components/input_datetimepicker/input_datetimepicker"),require("works/components/formbuilder/form_components/input_file/input_file"),require("works/components/formbuilder/form_components/org/org"),require("works/components/formbuilder/form_components/label/label"),require("works/components/formbuilder/form_components/hr/hr"),require("works/components/formbuilder/form_components/blank/blank"),require("works/components/formbuilder/form_components/creator/creator"),require("works/components/formbuilder/form_components/updater/updater"),require("works/components/formbuilder/form_components/org_dept/org_dept"),require("works/components/formbuilder/form_components/create_date/create_date"),require("works/components/formbuilder/form_components/update_date/update_date"),require("works/components/formbuilder/form_components/columns/columns"),require("works/components/formbuilder/form_components/table/table"),require("works/components/formbuilder/form_components/applet_doc/applet_doc"),require("works/components/formbuilder/form_components/field_mapping/field_mapping"),require("works/components/formbuilder/form_components/formula/formula");var s={createBuilder:function(t){return new e({appletId:t.appletId,model:t})},createUserComponent:function(e,t,n,r){return i(e,t,n,r)},getInvalidForm:function(e){var n=e?this._getComponentsByType(e):t.getComponents(),r;for(var i=0,s=n.length;i<s;i++){var o=n[i];if(!o.validateFormData()){r=o.getFormView();break}}return r},getFormData:function(e){function l(e){var t=e.getFormView(),n=t.$el.offset();$(window).scrollTop(n.top)}var n=e?this._getComponentsByType(e):t.getComponents(),i=!0,s={};for(var o=0,u=n.length;o<u;o++){var a=n[o];if(!a.validateFormData()){l(a),i=!1;break}var f=a.getFormData();f&&_.extend(s,f),a.getFormView().$("."+r.CN_ERROR).remove()}return i?s:!1},getDocumentTitle:function(e){var r,i,s=e.get("titleCid");if(t.isCreated(s))r=t.getComponent(s),i=r&&r.getDetailView();else if(t.getComponentClass(s)){var o=t.getComponentClass(s),u=n.toAppletDocModel(e);r=t.createComponent(o.type),r.setAppletDocModel(u),i=r.getDetailView()}return!_.isUndefined(i)&&_.isFunction(i.getTitle)?i.getTitle():null},_getComponentsByType:function(e){return _.filter(t.getComponents(),function(t){return t.getViewType()===e})}};return s});