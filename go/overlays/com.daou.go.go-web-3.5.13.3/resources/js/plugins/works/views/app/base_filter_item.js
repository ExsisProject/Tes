define('works/views/app/base_filter_item', function (require) {

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');

    var FilterConditions = require('works/components/filter/collections/filter_conditions');

    var FilterView = require('works/components/filter/views/filter');

    var FilterTemplate = require('hgn!works/templates/app/_filter_manager');
    var Template = require('hgn!works/templates/app/base_filter_item');

    return Backbone.View.extend({

        tagName: 'tr',

        events: {
            'click [data-edit-condition]': '_onClickEditCondition',
            'click [data-delete]': '_onClickDelete',
            'blur input[data-attr]': '_onBlur',
            'keyup input[data-attr]': '_onKeyup'
        },

        initialize: function (options) {
            options = options || {};
            this.fields = options.fields;
            this.conditions = new FilterConditions(this.model.get('conditions'));
            this.conditions.mergeFromFields(this.fields.toJSON());
            this.appletId = options.appletId;
            this.filters = options.filters;

            this.filterView = new FilterView({
                template: FilterTemplate,
                conditions: this.conditions,
                appletId: this.appletId,
                fields: this.fields,
                filters: this.filters,
                store: false
            });
            this.filterView.render();
        },

        render: function () {
            this.$el.html(Template({
                model: this.model.toJSON(),
                conditions: this.conditions.getLabelTexts() || worksLang['조건 없음']
            }));

            return this;
        },

        _onClickDelete: function() {
            this.$el.trigger('removeFilterItem');
            this.model.destroy();
            this.remove();
        },

        _onClickEditCondition: function() {
            this._renderFilterPopup();
        },

        _onBlur: function(e) {
            var $target = $(e.currentTarget);
            var attr = $target.attr('data-attr');
            this.model.set(attr, $.trim($target.val()));
        },

        _onKeyup: function(e) {
            var $target = $(e.currentTarget);
            var name = $target.val();
            var regExp = /[^ㄱ-ㅎ가-힣a-zA-Z0-9]/gi;
            if((regExp.test(name))) {
                $.goMessage(GO.i18n(worksLang['{{arg0}}만 입력할 수 있습니다.'], {arg0: worksLang['한글, 영문, 숫자']}));
                $target.val(name.replace(regExp, ''));
            }
        },

        _renderFilterPopup: function() {
            var popup = $.goPopup({
            	pclass : "layer_normal layer_filterAdd",
            	header : worksLang['필터 조건'], 
                modal: false,
                buttons: [{
                    btype: 'normal',
                    btext: commonLang['확인'],
                    autoclose : false,
                    callback: $.proxy(function(popup) {
                        this.conditions = this.filterView.conditions;
                        this.model.set('conditions', this.filterView.conditions.toJSON());
                        this.model.set('query', this.filterView.conditions.getSearchQueryString());
                        this._renderConditionLabel();
                        popup.close();
                    }, this)
                }]
            });
            popup.find('.content').addClass('go_renew').html(this.filterView.el);
            this.filterView.render();
            popup.reoffset();
        },

        _renderConditionLabel: function() {
            this.$('[data-condition-label]').text(this.conditions.getLabelTexts());
        }
    });
});