define('components/form_component_manager/report_form_manager', function (require) {
    var FormComponentManager = require('components/form_component_manager/form_component_manager');
    var PALLET_ITEMS = require('components/form_component_manager/constants/report_pallet_items');
    var FormListView = require('views/form_list');

    return FormComponentManager.extend({

        DEFAULT_STR_AVAILABLE_COMPONENTS: [],
        MAX_LENGTH_AVAILABLE_COMPONENTS: [],

        /**
         * @Override
         */
        initialize: function (options) {
            this.PALLET_ITEMS = PALLET_ITEMS;
            FormComponentManager.prototype.initialize.apply(this, arguments);
        },

        /**
         * @Override
         * 전자결재는 언더바를 옵션에 사용하는데, 보고서는 언더바를 무분별하게 사용중이다. type 을 미리 걸러내줘야 한다.
         */
        _convertDSLToData: function(dsl) {
            var filteredData = this._convertSpecialAttribute(dsl);
            dsl = filteredData.dsl;
            var returnValue = filteredData.returnValue;

            var keyWithUnderBar = ['name_pos', 'user_name', 'user_pos', 'user_empno', 'user_org', 'reg_date'];
            _.each(keyWithUnderBar, function(key) {
                var regex = new RegExp(key, 'g');
                dsl.replace(regex, function(n) {
                    returnValue.type = n;
                    dsl = dsl.replace(n, '');
                });
            });
            var underBarSplitItem = dsl.split('_');
            if (underBarSplitItem.length > 1) { // 옵션이 있는 컴포넌트 처리
                returnValue.type = underBarSplitItem.shift();
                if (underBarSplitItem.length) returnValue.options = [];
                _.each(underBarSplitItem, function(option) {
                    var optionSplitResult = option.split(':');
                    returnValue.options.push({
                        value: optionSplitResult[0],
                        id: optionSplitResult[1]
                    });
                });
            } else {
                var colonSplitItem = _.compact(dsl.split(':'));
                if (!returnValue.type) returnValue.type = colonSplitItem[0];
                returnValue.id = colonSplitItem[1]
            }

            return returnValue;
        },

        _onClickLoadForm: function() {
            var content = this.editor.getContent();
            var formListView = new FormListView({oldContent : content});
            formListView.popupRender().appFormRender();
            $('#content').off('insert:deptForm').on('insert:deptForm', _.bind(function(e, content) {
                this._setContent(this._modelToEditorContent(content));
                $('#popOverlay').remove();
            }, this));
        }
    });
});