define('works/models/integration', function (require) {

    return Backbone.Model.extend({

        getPropertiesByMappingComponentId: function(mappingComponentCid) {
            var fields = this.get('fields');
            var mappingField = _.findWhere(fields, {cid: mappingComponentCid});
            var mappingFieldProperties = {};
            var integrationFieldCid = '';
            if (mappingField) {
                mappingFieldProperties = mappingField.properties;
                integrationFieldCid = mappingFieldProperties.targetComponentCid;
            }
            var integrationField = _.findWhere(fields, {cid: integrationFieldCid});
            if (!integrationField) return {};
            var integrationFieldProperties = integrationField.properties;
            var integrationAppletId = integrationFieldProperties.integrationAppletId;
            var integrationAppletFields = this.get(integrationAppletId);
            var targetComponent = integrationAppletFields.findWhere({cid: mappingFieldProperties.targetFieldCid});
            return targetComponent ? targetComponent.get('properties') : {};
        },

        getPropertiesByIntegrationAppletId: function(integrationFieldCid) {
            var fields = this.get('fields');
            var integrationField = _.findWhere(fields, {cid: integrationFieldCid});
            var integrationFieldProperties = {};
            var integrationAppletId = '';
            var integrationAppletFields;
            var targetComponent;
            if (integrationField) {
                integrationFieldProperties = integrationField.properties;
                integrationAppletId = integrationFieldProperties.integrationAppletId;
                integrationAppletFields = this.get(integrationAppletId);
                targetComponent = _.findWhere(integrationAppletFields.toJSON(), {
                    cid: integrationFieldProperties.integrationFieldCid
                }); // 폼빌더 구조에 대해 우려했던 문제가 발생했다. clientId 를 cid 로 쓰는 바람에 검색이 안된다.
            }
            return targetComponent ? targetComponent.properties : {};
        }
    });
});