define('works/views/app/mapping/mapping_item', function(require) {

    var lang = {
        '미선택': '미선택',
        '선택할 항목이 없습니다.': '선택할 항목이 없습니다.'
    };

    var Template = require('hgn!works/templates/app/mapping/mapping_item');

    return Backbone.View.extend({

        tagName: 'li',

        events: {
            'change select': '_onChangeMapping',
            'click select': '_onClickMapping',
            'click [data-target-cid]': '_onClickMapping'
        },

        initialize: function(options) {
            this.sourceFields = options.sourceFields;
            this.mappingData = options.mappingData;
            this.sourceAppletId = options.sourceAppletId;
            this.targetAppletId = options.targetAppletId;
        },

        render: function() {
            var availableFields = this.sourceFields.getAvailableMappingFields(this.model);
            var labelMappingField = availableFields.findByLabel(this.model.get('label'));
            this.$el.html(Template({
                sourceFields: availableFields.toJSON(),
                targetLabel: this.model.get('label'),
                targetCid: this.model.get('cid'),
                unselectedLabel: availableFields.length ? lang['미선택'] : lang['선택할 항목이 없습니다.']
            }));

            var mappingCid = this.mappingData || (labelMappingField ? labelMappingField.get('cid') : '0');
            if (!this.$('option[value="' + mappingCid + '"]').length) {
                mappingCid = '0';
            }
            this.$('select').val(mappingCid);
            this._triggerChangeMapping(mappingCid, true);

            return this;
        },

        _onChangeMapping: function(e, sourceId, isLabelMapping) {
            var sourceCid = e ? $(e.currentTarget).val() : sourceId;
            this._triggerChangeMapping(sourceCid, isLabelMapping);
        },

        _triggerChangeMapping: function(sourceCid, isLabelMapping) {
            this.$el.trigger('changeMapping', {
                sourceCid: sourceCid,
                targetCid: this.model.get('cid'),
                isLabelMapping: !!isLabelMapping
            });
        },

        _onClickMapping: function() {
            this.$el.trigger('clickMappingItem', {
                targetCid: this.model.get('cid')
            });
        }
    });
});