define('works/components/formbuilder/formvalidator', function(require) {
	var FieldType = require("works/constants/field_type");
	var InputTextValidator = require('works/components/formbuilder/form_components/input_text/input_text_validator');
	var InputTextAreaValidator = require('works/components/formbuilder/form_components/input_textarea/input_textarea_validator');
	var InputSelectValidator = require('works/components/formbuilder/form_components/input_select/input_select_validator');
	var InputRadioValidator = require('works/components/formbuilder/form_components/input_radio/input_radio_validator');
	var InputNumberValidator = require('works/components/formbuilder/form_components/input_number/input_number_validator');
	var InputCheckboxValidator = require('works/components/formbuilder/form_components/input_checkbox/input_checkbox_validator');
	var InputDateValidator = require('works/components/formbuilder/form_components/input_datepicker/input_datepicker_validator');
	var InputTimeValidator = require('works/components/formbuilder/form_components/input_timepicker/input_timepicker_validator');
	var InputDateTimeValidator = require('works/components/formbuilder/form_components/input_datetimepicker/input_datetimepicker_validator');
	var InputListboxValidator = require('works/components/formbuilder/form_components/input_listbox/input_listbox_validator');

	var validators = {};
	validators[FieldType.TEXT] = new InputTextValidator();
	validators[FieldType.TEXTAREA] = new InputTextAreaValidator();
	validators[FieldType.SELECT] = new InputSelectValidator();
	validators[FieldType.RADIO] = new InputRadioValidator();
	validators[FieldType.NUMBER] = new InputNumberValidator();
	validators[FieldType.CHECKBOX] = new InputCheckboxValidator();
	validators[FieldType.DATE] = new InputDateValidator();
	validators[FieldType.TIME] = new InputTimeValidator();
	validators[FieldType.DATETIME] = new InputDateTimeValidator();
	validators[FieldType.LISTBOX] = new InputListboxValidator();

	var FormValidator = {

		getValidator: function (fieldType) {
			return validators[fieldType];
		}
	}
	
	return FormValidator;

});