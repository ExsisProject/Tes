define([
	"i18n!approval/nls/approval",
	"hgn!admin/templates/approval/appr_dept_folder_tree",
], 
function(
    approvalLang,
    Template
) {	
	
	var lang = {
		"기안 완료함" : approvalLang["기안 완료함"],
		"부서 참조함" : approvalLang["부서 참조함"],
		"부서 수신함" : approvalLang["부서 수신함"],
		'dept_official' : approvalLang['공문 발송함'],
	};
	
	
	var View = Backbone.View.extend({
		tagName : "ul",
		className : "side_depth",
		
		initialize : function(options) {
			var self = this;
			
			this.deptId = options.deptId;
			this.deptName = options.deptName;
			this.collection.on("sync", this.render, this);
			this.collection.fetch().done(function() {
				if (options.defaultType) self.$("li[data-navi='" + options.defaultType + "']").trigger("click");
			});
		},
		
		
		events : {
			"click li[data-navi]" : "_triggerRenderList",
			"click #manage" : "_triggerRenderManage"
		},
		
		
		render : function() {
			this.$el.html(Template({
				id : this.deptId,
				name : this.deptName,
				collection : this.collection.toJSON(),
				lang : lang
			}));
			
			return this;
		},
		
		/**
		 * 폴더 클릭시 trigger 
		 * @method _triggerRenderList
		 * @param {Object} 이벤트
		 */
		_triggerRenderList : function(e) {
//			this.$el.trigger("clickFolder", [e.currentTarget]);
			this.trigger("renderList", [e.currentTarget]);
		},
		
		/**
		 * 관리 버튼 클릭시 trigger 
		 * @method _triggerRenderManage
		 */
		_triggerRenderManage : function() {
//			this.$el.trigger("clickManageButton");
			this.trigger("renderManage");
		}
	});
	
	return View;
});