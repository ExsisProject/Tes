define(["backbone","report/models/series_report"],function(e,t){var n=e.Collection.extend({model:t,initialize:function(e,t){this.folderId=t.folderId,this.conditions=t.conditions||this.conditions},url:function(){return GO.contextRoot+"api/report/folder/"+this.folderId+"/series"},conditions:{page:0,offset:20,property:"closedAt",direction:"desc"}},{fetch:function(e){var t=new n([],{folderId:e.folderId,conditions:e.conditions});return t.fetch({async:!1,data:t.conditions}),t}});return n});