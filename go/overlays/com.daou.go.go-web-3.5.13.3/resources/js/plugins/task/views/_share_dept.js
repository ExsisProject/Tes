;(function() {
	define([
			"backbone",
			
			"i18n!nls/commons",
			"i18n!task/nls/task",
	        "hgn!task/templates/_share_dept",
	        "go-nametags"
	], 
	function(
			Backbone,
			
			commonLang,
			taskLang,
			ShareDeptTmpl,
			NameTagView
	) {
		var lang = {
				"delete" : commonLang["삭제"],
				"all" : taskLang["전체"],
				"piece" : taskLang["일부"]
		};
		
		
		var ShareDeptView = Backbone.View.extend({
			tagName : "tr",
			
			
			events : {
				"click .add-btn" : "addNameTag",
				"click span.ic_basket_bx" : "destroy",
				"change input[data-type=readOption]" : "toggleShareView"
			},
			
			
			initialize : function(data) {
				this.dataSet = data;
				this.render();
			},
			
			
			render : function() {
				this.$el.html(ShareDeptTmpl({
					data : this.dataSet,
					lang : lang
				}));
				this.$el.attr("data-circleId", this.dataSet.id);
				this.$el.attr("id", this.dataSet.nodeId);
				this.renderNameTagView();
			},
			
			
			renderNameTagView : function() {
				this.nameTag = NameTagView.create({}, {useAddButton : true});
				
				this.$el.find("div.wrap_name_tag").html(this.nameTag.el);
				
				_.each(this.dataSet.members, function(member){
					this.nameTag.addTag(member.id, member.name + " " + member.position || "", {removable : true});
				}, this);
			},
			
			
			addNameTag : function() {
				var self = this;
				$.goOrgSlide({
					loadId : this.$el.attr("id"),
					hideOrg : !this.$el.find("input[type=checkbox]").is(":checked"),
					contextRoot : GO.contextRoot,
					isMyDeptOpened : false,
					callback : $.proxy(function(info) {
						var label = info.displayName || info.name;
						self.nameTag.addTag(info.id, label, { removable : true, "attr": info });
					})
				});
			},
			
			
			destroy : function() {
				this.$el.trigger("shareDept:destroy", [this]);
				this.$el.remove();
			},
			
			
			toggleShareView : function(e) {
				var nameTagView = this.$el.find("div.wrap_name_tag");
				if ($(e.target).val() == "all") {
					nameTagView.hide();
					nameTagView.find("li[data-id]").remove();
					
				} else {
					nameTagView.show();
				}
			}
		});
		return ShareDeptView;
	});
}).call(this);