// 문서목록에서 개별 문서에 대한 View
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "approval/models/folderlist_item",
    "approval/views/doclist/docfolder_share",
    "approval/views/side",
    "hgn!approval/templates/folderlist_item",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function(
	$, 
	_, 
	Backbone, 
	GO,
	FolderListItemModel,
	ApprDocFolderShareView,
	SideView,
    FolderListItemTpl,
    commonLang,
    approvalLang
) {
	var lang = _.extend(commonLang,{
		"공유 설정" : approvalLang["공유 설정"],
		"공유" : approvalLang["공유"],
		"문서함 공유" : approvalLang["문서함 공유"]
	});
	
	var FolderListView = Backbone.View.extend({
		tagName: 'tr',
		events: {
            'click #subjectFolder' : 'moveDeptFolderDocList',
            "click #showArea" : "toggleEditForm",
            "click #editCancle" : "toggleEditForm",
            "click #editName" : "editName",
            "click [name=docFolderShare]" : "docFolderShare"
        },
		initialize: function(options) {
		    this.options = options || {};
			_.bindAll(this, 'render');
			this.deptId = this.options.deptId;
			this.columns = this.options.columns;
			this.type = this.options.type;
		},
		render: function() {
			var folder = {
				id: this.model.get('id'),
				deptName : this.model.get('deptName'),
				folderId : this.model.get('folderId'),
				folderName : this.model.get('folderName'),
				createdAt: this.model.getCreatedAt(),
				docCount: this.model.get('docCount'),
				shareCount: this.model.get('shareCount')
			};
			this.$el.html(FolderListItemTpl({
				folder: folder,
				columns: this.columns,
				lang : commonLang
			}));
			return this;
		},
		moveDeptFolderDocList: function() {
			// 부서 문서함일 경우 링크 금지
			if(this.type=='up_dept') { return false; }
			
			var folderId = this.model.get('folderId');
			var url = "/approval/deptfolder/" + folderId + "/documents";
			GO.router.navigate(url, true);
		},
		
		toggleEditForm : function(e) {
			var target = $(e.currentTarget);
			var type = target.attr("data-type");
			var isShow = type == "show";
			
			this.$("#showArea").toggle(!isShow);
			this.$("#editArea").toggle(isShow);
			
			if (!isShow) this.$("#name").val(this.model.get("folderName"));
		},
		
		editName : function() {
			var self = this;
			var folderName = this.$("#name").val();
			if(this.validate(folderName)){
				this.model.set("folderName", folderName);
				this.model.save().done(function() {
					self.render();
					SideView.reload(true);
				});
			}
		},
		validate: function(keyword) {
            var self = this;
            if(!keyword) {
                $.goMessage(approvalLang["부서 문서함 폴더명을 입력하세요."]);
                return false;
            }
            if(keyword.length < 2 || keyword.length > 20) {
            	$.goMessage(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"20"}));             
                return false;
            }
            return true;
        }, 
		docFolderShare : function(e){
			var self = this;
			var folderId = this.model.get('id');
			var popup = $.goPopup({
				'header' : lang['문서함 공유'],
				'modal' : false,
                'allowPrevPopup' : true,
                'forceClosePopup' : false,
                'closeCallback' : function(){
    				if(self.shareView.orgSlide){
    					self.shareView.orgSlide.close();
    				};
                },
				"width" : "424px",
				'pclass' : 'layer_normal layer_folder_share',
				'contents' : '',
				"buttons" : [{
			                    'btext' : commonLang['확인'],
			                    'btype' : 'confirm',
			                    'autoClose' : false,
			                    'callback': function(rs) {
			                    	self.shareView.trigger('docFolderSave');
			                    	return false;
			                    }
			                }, {
								btype : 'normal',
								btext : commonLang['취소'],
								autoclose : true
							}]
		    });
			self.shareView = new ApprDocFolderShareView({
				popupEl : popup,
				folderType : 'dept',
				folderId : folderId,
				deptId : this.deptId,
				folderName : this.model.get('folderName')
		    });
			self.shareView.render();
			self.shareView.on('successDocFolderSave', $.proxy(this.refreshShareCount, this));
		},
		refreshShareCount : function(count){
			this.model.set('shareCount', count);
			this.render();
		}
		
	});
	
	return FolderListView;
});