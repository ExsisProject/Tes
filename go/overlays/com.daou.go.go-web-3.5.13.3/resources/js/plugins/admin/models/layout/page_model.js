define('admin/models/layout/page_model', function (require) {

    var PageModel = Backbone.Model.extend({

        initialize: function (options) {
            options = options ? options : {};
            this.page = options.page ? options.page : 0;
            this.offset = options.offset ? options.offset : 20;
            this.direction = options.direction ? options.direction : 'desc';
            this.property = options.property ? options.property : 'id';
        },
        updatePage: function (page) {
            this.page = page;
        },
        updateSort: function (property, direction) {
            this.property = property;
            this.direction = direction;
        },
        updateOffset: function (offset) {
            this.offset = offset;
        },
        getQueryStr: function () {
            return $.param({
                'page':this.page,
                'offset':this.offset,
                'direction':this.direction,
                'property':this.property
            });
        }

    });
    return PageModel;
});