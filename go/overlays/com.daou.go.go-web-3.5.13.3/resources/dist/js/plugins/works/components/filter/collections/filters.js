define("works/components/filter/collections/filters",function(require){var e=require("works/components/filter/models/filter"),t=require("collections/paginated_collection"),n={type:"mine",model:e,initialize:function(e,n){this.options=n||{},this.collectionName="filters",this.options.paginated&&(t.prototype.initialize.call(this,e,n),this._initPageOption()),this.type=n.type||this.type,this.appletId=n.appletId},url:function(){var e=GO.contextRoot+"api/works/applets/"+this.appletId+"/filters/"+this.type;return this.options.paginated&&(e+="?"+this.makeParam()),e},parse:function(e){var n=[];return this.options.paginated?n=t.prototype.parse.call(this,e):n=e.data,_.each(n,function(e){e.type=this.type},this),n},_initPageOption:function(){this.pageSize=10,this.direction="asc",this.property="name"}};return function(e,r){return r=r||{},r.paginated?new(t.extend(n))(e,r):new(Backbone.Collection.extend(n))(e,r)}});