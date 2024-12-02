define('works/components/doc_list/views/refer_doc_list', function(require) {
    var Fields = require('works/collections/fields');
    var DocListView = require('works/components/doc_list/views/doc_list');
    return DocListView.extend({
        search: function(keyword) {
            this._search(null, keyword);
        },

        _search : function(event, keyword) {
            keyword = _.isUndefined(keyword) ? this.$("#searchKeyword").val() : keyword;
            var fields = new Fields(this.columnFields);
            var textFields = fields.getLinkableTextFields();
            var queryString = textFields.map(function(field) {
                return field.get('cid') + ':"' + keyword + '"';
            }, this).join(' OR ');
            this.collection.queryString = queryString;
            this.collection.setPageNo(0);
            this.collection.fetch();
        }
    });
});