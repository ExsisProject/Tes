define(["backbone"],function(e){var t=e.Model.extend({url:function(){return this.assetId=this.get("assetId"),this.urlPart=this.get("urlPart"),["/api/asset",this.assetId,this.urlPart].join("/")}});return t});