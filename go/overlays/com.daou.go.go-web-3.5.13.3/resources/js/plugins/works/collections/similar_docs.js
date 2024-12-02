define('works/collections/similar_docs', function (require) {
    var BaseDocs = require('works/collections/base_docs');
    return BaseDocs.extend({
        makeParam: function() {
            return 'offset=10';
        }
    });
});