define("works/components/formbuilder/formvalidator",function(require){var e=require("works/constants/field_type"),t=require("works/components/formbuilder/form_components/input_text/input_text_validator"),n=require("works/components/formbuilder/form_components/input_textarea/input_textarea_validator"),r=require("works/components/formbuilder/form_components/input_select/input_select_validator"),i=require("works/components/formbuilder/form_components/input_radio/input_radio_validator"),s=require("works/components/formbuilder/form_components/input_number/input_number_validator"),o=require("works/components/formbuilder/form_components/input_checkbox/input_checkbox_validator"),u=require("works/components/formbuilder/form_components/input_datepicker/input_datepicker_validator"),a=require("works/components/formbuilder/form_components/input_timepicker/input_timepicker_validator"),f=require("works/components/formbuilder/form_components/input_datetimepicker/input_datetimepicker_validator"),l=require("works/components/formbuilder/form_components/input_listbox/input_listbox_validator"),c={};c[e.TEXT]=new t,c[e.TEXTAREA]=new n,c[e.SELECT]=new r,c[e.RADIO]=new i,c[e.NUMBER]=new s,c[e.CHECKBOX]=new o,c[e.DATE]=new u,c[e.TIME]=new a,c[e.DATETIME]=new f,c[e.LISTBOX]=new l;var h={getValidator:function(e){return c[e]}};return h});