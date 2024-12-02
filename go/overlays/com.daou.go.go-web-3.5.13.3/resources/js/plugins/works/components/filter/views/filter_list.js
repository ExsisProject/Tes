define('works/components/filter/views/filter_list', function(require) {
    var GridView = require('grid');

    var Filters = require('works/components/filter/collections/filters');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    var lang = {
        '검색': commonLang['검색'],
        '필터명': worksLang['필터명'],
        '생성자': worksLang['생성자']
    };

    var View = Backbone.View.extend({

        gridView: null,
        defer: $.Deferred(),

        initialize: function(options) {
            options = options || {};
            this.appletId = options.appletId;
            this.collection = new Filters([], {
                type: 'others',
                paginated: true,
                appletId: this.appletId
            });
            this.useBottomButton = options.useBottomButton;
        },

        render: function() {
            this.gridView = new GridView({
                tableClass: 'type_normal tb_works_filter',
                checkbox: false,
                columns: this._getGridColumns(),
                collection: this.collection,
                usePageSize: false,
                useToolbar: false,
                useTableScroll: false,
                useBottomButton: false
            });
            this.$el.append(this.gridView.render().el);
            this.gridView.$el.prepend(this._searchInputTemplate());
            this.collection.fetch().done($.proxy(function() {
                this.defer.resolve();
            }, this));
            this.gridView.$el.on('navigate:grid', function(event, id) {
                $(this).find('input[data-id="' + id + '"]').prop('checked', true);
            });

            this.$('#keyword').focus();

            return this;
        },

        getCheckedData: function() {
            var id = this.gridView.$('input[type="radio"]:checked').attr('data-id');
            return this.collection.get(id);
        },

        _getGridColumns: function() {
            var columns = [{
                name: 'name',
                label: lang['필터명'],
                sortable: true,
                render: function(model) {
                    return model.get('name');
                }
            }, {
                name: 'userName',
                label: lang['생성자'],
                sortable: true,
                render: function(model) {
                    return model.get('user').name;
                }
            }];

            return columns;
        },

        _searchInputTemplate: function() {
            return Hogan.compile([
                '<div class="search_wrap">',
                    '<input class="search" type="text" id="searchKeyword">',
                    '<input class="btn_search" type="button" value="{{lang.검색}}" title="{{lang.검색}}" id="searchBtn">',
                '</div>'
            ].join('')).render({lang: lang});
        }
    });

    return View;
});