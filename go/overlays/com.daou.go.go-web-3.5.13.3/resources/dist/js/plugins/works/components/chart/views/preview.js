define("works/components/chart/views/preview",function(require){var e=require("backbone"),t=require("hgn!works/components/chart/templates/preview"),n=require("works/components/chart/views/chart"),r=require("works/components/filter/models/filter"),i=require("works/models/applet_baseconfig"),s=require("works/components/filter/collections/filters"),o=require("i18n!works/nls/works");return e.View.extend({events:{"change [data-filters]":"_onChangeFilter"},initialize:function(e){this.appletId=e.appletId,this.chartFields=e.chartFields,this.numberFields=e.numberFields,this.filter=new r({appletId:this.appletId}),this.appletBaseConfig=i.getInstance({id:this.appletId}),this.filters=new s([],{appletId:this.appletId,type:"base"})},render:function(){return this.fetch().done(_.bind(function(){this.$el.html(t({filters:this.filters.toJSON(),lang:o})),this._renderChart()},this)),this},fetch:function(){return $.when(this.appletBaseConfig.fetch({useCache:!0}),this.filters.fetch())},_renderChart:function(){this.chartView=new n({model:this.model,appletId:this.appletId,chartFields:this.chartFields,numberFields:this.numberFields}),this.$("[data-chart-area]").html(this.chartView.render().el),this.chartView.fetchChartDatas()},_onChangeFilter:function(e){var t=$.Deferred(),n=$(e.currentTarget).val(),i={appletId:this.appletId};n==="all"?(this.filter=new r(i),t.resolve()):n==="createdBy"?(this.filter=new r(_.extend(i,r.getCreatedByFilterOptions())),t.resolve()):(this.filter=new r(_.extend(i,{id:parseInt(n)})),this.filter.fetch().done(_.bind(function(){t.resolve()},this))),t.done(_.bind(function(){this.model.setQueryString(this.filter.getSearchQuery()),this.chartView.fetchChartDatas()},this))}})});