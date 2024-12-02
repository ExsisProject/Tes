define('works/components/formbuilder/core/views/component_option', function (require) {
    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var FBToolboxPaneView = require('works/components/formbuilder/core/views/toolbox_pane');
    var constants = require('works/components/formbuilder/constants');
    var worksLang = require('i18n!works/nls/works');

    var FBComponentOptionView = FBToolboxPaneView.extend({
        className: 'builder_side_box component-option',

        title: worksLang['속성'],
        useResizer: true,
        titleWrapClassname: 'title_attr_edit',
        contentWrapClassname: 'tool_attr',
        attributes: {style: "display: none;"},

        initialize: function (options) {
            FBToolboxPaneView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.observer, constants.EVENT_COMPONENT_SELECTED, this.render);
            this.listenTo(this.observer, constants.EVENT_CLEAR_COMPONENT_SELECTED, this.clear);
        },

        render: function (cid) {
            this.clear();

            if (!cid) {
                return;
            }

            var component = ComponentManager.getComponent(cid);
            this.optionView = component.getOptionView();
            this.optionView.render();

            if (this.optionView.$el.is(':empty')) {
                ;
            } else {
                this.$('.toolbox-content').append(this.optionView.el);
                this.optionView.$el.wrap('<div class="scroll-inner"></div>');

                this.$el.show();
                this.toggleContent(true);

                this.observer.trigger(constants.EVENT_TOGGLE_OPTION_VIEW, true);
            }
        },

        clear: function () {
            if (this.optionView) {
                this.optionView.$el.detach();
                this.$('div.scroll-inner').remove();
                this.optionView = null;

                this.$el.hide();
                this.observer.trigger(constants.EVENT_TOGGLE_OPTION_VIEW, false);
            }
        },

        /**
         * @Override
         */
        getMarginHeight: function () {
            var marginHeight = 36;
            return this.$('.toolbox-title').outerHeight() * 2 + marginHeight;
        }
    });

    return FBComponentOptionView;
});
