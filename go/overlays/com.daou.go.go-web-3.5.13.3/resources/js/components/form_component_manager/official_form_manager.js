define('components/form_component_manager/official_form_manager', function (require) {
    var FormComponentManager = require('components/form_component_manager/form_component_manager');
    var PALLET_ITEMS = require('components/form_component_manager/constants/official_pallet_items');
    var TemplateListLayerView = require('admin/views/appr_official_template_list');
    var OldFormTemplateEditor = require('admin/views/appr_form_template_editor');
    return FormComponentManager.extend({

        OPTION_AVAILABLE_COMPONENTS: [],
        ID_AVAILABLE_COMPONENTS: ['text', 'number', 'textarea', 'editor', 'cOrg', 'calendar', 'cSum', 'rSum', 'label', 'span'],
        WIDTH_AVAILABLE_COMPONENTS: [],
        REQUIRE_AVAILABLE_COMPONENTS: [],
        MAX_LENGTH_AVAILABLE_COMPONENTS: [],
        DEFAULT_STR_AVAILABLE_COMPONENTS: [],

        initialize: function (options) {
            this.PALLET_ITEMS = PALLET_ITEMS;
            FormComponentManager.prototype.initialize.apply(this, arguments);
        },

        _onClickLoadForm:  function() {
            var templateListLayerView = new TemplateListLayerView({
                EditorModule: OldFormTemplateEditor.extend({model: this.model}),
                selectCallback: _.bind(function(content) {
                    this._setContent(this._modelToEditorContent(content));
                }, this)
            });
            templateListLayerView.render()
        },
        
        /**
         * @Override
         */
        _onClickComponent: function(clickEvent) {
            this.$('[data-attribute-area="room"]').hide();
            var component = FormComponentManager.prototype._onClickComponent.apply(this, arguments);
            if (component) {
                var hasDSL = component.getAttribute('data-dsl');
                this.$('[data-attribute-area="component"]').toggle(!!hasDSL);
                this._setComponentEditView(component);
            }
        },
        
        /**
         * @Override
         */
        _setComponentEditView: function(component) {
            FormComponentManager.prototype._setComponentEditView.apply(this, arguments);
        }
    });
});