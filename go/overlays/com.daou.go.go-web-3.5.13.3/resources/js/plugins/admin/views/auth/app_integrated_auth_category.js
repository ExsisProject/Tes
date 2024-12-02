define('admin/views/auth/app_integrated_auth_category', function (require) {

    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var App = require('app');

    var DetailView = require('admin/views/auth/app_integrated_auth_detail_item')

    return Backbone.View.extend({

        tagName:'tbody',
        events: {
            'click li': '',
        },

        initialize: function (options, viewOpt) {
            this.model = options;
            this.detailViews=[];
            this.hasContent= this.model.appAuthModels.length > 0 ;
            this.viewOpt = viewOpt;

            this.addDetailView('AppManager');
            this.addDetailView('AppContentOperator');
        },
        addDetailView:function(authlevel){
            for ( var i =0 ;i < this.model.appAuthModels.length; i++) {
                if( this.model.appAuthModels[i].authLevel === authlevel){
                    this.detailViews[this.detailViews.length] = new DetailView(this.model.appAuthModels[i], this.viewOpt);
                }
            }
        },
        refresh:function(){
            _.forEach(this.detailViews, function(dv ){
                dv.refresh();
            });
        },
        render: function () {

            var self = this;
            this.$el.html();

            _.forEach(this.detailViews, function(view){
                self.$el.append(view.$el);
                view.render();
            });

            return this;
        },
    });
});