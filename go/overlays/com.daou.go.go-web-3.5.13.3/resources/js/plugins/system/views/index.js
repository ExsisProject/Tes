(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
		"hgn!system/templates/index",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
	    "jquery.go-grid",
	    "jquery.go-sdk",
	    "GO.util",
	], 

function(
	$, 
	Backbone,
	App,
	cacheListTmpl,
	commonLang,
	adminLang
) {
	var tmplVal = {
			label_category : adminLang["분류"],
			label_link : adminLang["링크정보"],
			label_cache : adminLang["캐시 관리"],
			label_search : adminLang["검색 서버"],
			label_push : adminLang["푸쉬 서버"],
			label_schedule : adminLang["스케줄 관리"],
			label_webrevision : adminLang["webRevision 관리"]
	};
	var cacheList = Backbone.View.extend({

		events : {
			"click a#searchServerLink" : "goToLink",
			"click a#pushServerLink" : "goToLink"
		},

		initialize : function() {
			this.listEl = '#cacheList';
		},
		goToLink : function(e) {
			var url = $(e.currentTarget).attr('data-link');
			window.open(url, '_blank');
		},
		render : function() {
			$('.breadcrumb .path').html(adminLang["검색/푸쉬"]);
			this.$el.empty();
			this.$el.html(cacheListTmpl({
					lang : tmplVal,
					searchServerLink : "http://"+ location.hostname + ":8983",
					pushServerLink : "http://" + location.hostname + ":9090",
			}));
		}
	},{
			__instance__: null
	});
	
		return cacheList;
	});
}).call(this);