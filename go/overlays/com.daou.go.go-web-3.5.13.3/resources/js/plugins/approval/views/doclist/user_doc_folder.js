define([
    "jquery",
    "underscore",
    "backbone",
    "hgn!approval/templates/user_doc_folder",
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	UserDocFolderTpl,
    commonLang,
    approvalLang
) {
	var docIds;
	
	var UserFolderTree = Backbone.Collection.extend({
		model : Backbone.Model.extend(),
		url : function(){
			// 문서 이동
			return '/api/approval/userfolder/' + this.userId;
			// 문서 복사 
			//return '/api/approval/deptfolder';
		},
		setUserId: function(userId){
			this.userId = userId;
		}
	});
	
	var UserDocFolderView = Backbone.View.extend({
		
		el : ".layer_doc_type_select .content",
		
		initialize: function(options) {
		    this.options = options || {};
			this.userId = this.options.userId;
			//this.userName = this.options.userName;
		},
		events: {
			'click span.txt' : 'selectFolder'
		},
		render: function() {
			this.collection = new UserFolderTree();
			var userId = this.userId;
			//var userName = this.userName;
			this.collection.setUserId(userId);
			this.collection.fetch({async:false});
			
			var lang = {
				'문서 이동' : approvalLang['문서 이동'],
				'문서함이 없습니다' : approvalLang['문서함이 없습니다']
			};
			
			var dataset = this.collection.toJSON();
			
			var tpl = UserDocFolderTpl({
				lang: lang,
				dataset : dataset
				//userName : userName
			});
			
			this.$el.html(tpl);
		},
		
		selectFolder: function(e){
			var selectedEl = $(e.currentTarget).parents('p.folder');
			this.$el.find('.on').removeClass('on');
			selectedEl.addClass('on');
		},
		
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		},
		
		isEmptyDocFolder: function(){
			this.collection = new UserFolderTree();
			var userId = this.userId;
			this.collection.setUserId(userId);
			this.collection.fetch({async:false});
			return this.collection.length == 0 ? true : false;
		}
		
	});
	
	return UserDocFolderView;
});