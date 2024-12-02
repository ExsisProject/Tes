define('works/components/formbuilder/core/views/form_toolbox', function (require) {

    var Backbone = require('backbone');
    var FBAccessSettingView = require('works/components/formbuilder/core/views/form_access_setting');
    var FBComponentListView = require('works/components/formbuilder/core/views/component_list');
    var FBSubFormComponentListView = require('works/components/formbuilder/core/views/subform_component_list');
    var FBComponentOptionView = require('works/components/formbuilder/core/views/component_option');
    var constants = require('works/components/formbuilder/constants');

    var FBToolboxView = Backbone.View.extend({
        className: 'go_side',

        observer: null,
        accessSettingView: null,
        componentListView: null,
        componentOptionView: null,

        initialize: function (options) {
            options = options || {};
            this.appletId = options.appletId;
            this.appletFormModel = options.appletFormModel;
            this.model = options.appletFormModel.data;
            this.mainFormModel = options.mainFormModel;

            this.observer = null;
            if (options.hasOwnProperty('observer')) {
                this.observer = options.observer;
            }

            this.accessSettingView = new FBAccessSettingView({
                observer: this.observer,
                appletFormModel: this.appletFormModel
            });

            if (this.mainFormModel) {
                this.componentListView = new FBSubFormComponentListView({
                    observer: this.observer,
                    mainFormModel: this.mainFormModel
                });
            } else {
                this.componentListView = new FBComponentListView({observer: this.observer});
            }

            this.componentOptionView = new FBComponentOptionView({observer: this.observer});

            this.listenTo(this.observer, constants.EVENT_TOGGLE_OPTION_VIEW, this._toggledOptionView);
            this.listenTo(this.observer, constants.EVENT_FOLD_COMPONENT_PANNEL, this._foldComponentPannel)
            this.listenTo(this.observer, constants.EVENT_FOLD_ACCESS_PANNEL, this._foldAccessPannel)
        },

        /**
         * @Override
         */
        render: function () {
            this.$el.append(this.accessSettingView.el, this.componentListView.el, this.componentOptionView.el);

            this.accessSettingView.render();
            this.componentListView.render();
            this.componentOptionView.render();

            this.componentListView.toggleContent(true);
        },

        /**
         * @Override
         */
        remove: function () {
            Backbone.View.prototype.remove.apply(this, arguments);

            // 서브뷰 해제
            this.accessSettingView.remove();
            this.componentListView.remove();
            this.componentOptionView.remove();
        },

        resize: function (newSize) {
            this.$el.outerHeight(newSize);

            this.accessSettingView.resize(newSize);
            this.componentListView.resize(newSize);
            this.componentOptionView.resize(newSize);
        },

        _toggledOptionView: function (bool) {
            this.accessSettingView.toggleContent(!bool);
            this.componentListView.toggleContent(!bool);
        },
        _foldComponentPannel: function () {
            this.accessSettingView.toggleContent(false);
        },
        _foldAccessPannel: function () {
            this.componentListView.toggleContent(false);
        }
    });

    return FBToolboxView;
});
