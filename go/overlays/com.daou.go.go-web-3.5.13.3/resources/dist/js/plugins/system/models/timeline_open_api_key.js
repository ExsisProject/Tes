define(["backbone","go-map"],function(e){return e.Model.extend({initialize:function(e){this.targetUrl="";switch(e){case"kakao":this.targetUrl=GO.util.kakaoMap.getURL();default:this.targetUrl=GO.util.kakaoMap.getURL()}},url:function(){return this.targetUrl}})});