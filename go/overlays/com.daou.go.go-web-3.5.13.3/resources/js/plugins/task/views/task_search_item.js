;(function() {
	define([
			"backbone",
			"app",
			
			"i18n!nls/commons",
			"i18n!task/nls/task"
	], 
	function(
			Backbone,
			App,
			
			commonLang,
			taskLang
	) {
		var lang = {
			term : taskLang["기한"],
			activity : taskLang["활동기록"]
		};
		
		var ResultItemTpl = Hogan.compile(
			'<td>{{data.folderName}}</td>' +
			'<td id="goDetail" class="align_l">' +
				'<a>' +	
					'<span>' + 
						'{{{data.name}}}' +
					'</span>' +
				'</a>' +
			'</td>' +
			'<td>{{{data.assignees}}}</td>' +
			'<td>{{{data.creator}}}</td>' +
			'<td>{{{data.status.name}}}</td>' +
			'<td>{{{dueDate}}}</td>'
		);
		
		
		var SearchResultView = Backbone.View.extend({
			tagName : "tr",
			
			events : {
				"click #goDetail" : "goDetail"
			},
			
			
			initialize : function() {
			},
			
			
			render : function() {
				var dueDate = this.model.get("dueDate");
				
				this.$el.addClass("classic");
				this.$el.html(ResultItemTpl.render({
					lang : lang,
					data : this.model.toJSON(),
					dueDate : dueDate ? GO.util.basicDate2(this.model.get("dueDate")) : "-"
				}));
				
				return this;
			},
			
			goDetail : function() {
				var search = this.serializeObj(GO.router.getSearch());
				var param = search ? "?" + search : "";
				App.router.navigate("task/" + this.model.id + "/detail" + param, true);
			},
			
			
			serializeObj : function(obj) {
				var str = [];
				for(var p in obj) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
				return str.join("&");
			}
		});
		
		return SearchResultView;
	});
}).call(this);