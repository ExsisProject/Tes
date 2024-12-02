define('works/components/formbuilder/core/component_validator', function (require) {
    var _ = require('underscore');

    var ComponentValidator = function() {};

    ComponentValidator.prototype.validate = function (data, properties) {
        return this.createResult(true);
    };

    ComponentValidator.prototype.createResult = function (isValid, type, message) {
        return {
            "isValid": isValid,
            "type" : type,
            "message" : message
        };
    };

    return ComponentValidator;
});