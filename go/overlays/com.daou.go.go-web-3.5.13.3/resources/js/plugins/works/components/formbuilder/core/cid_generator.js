define('works/components/formbuilder/core/cid_generator', function(require) {
    var _ = require('underscore');
    var prefix = '_';
    
    return {
        generate: function() {
            return prefix + Math.random().toString(36).substr(2, 9);
        }
    };
});