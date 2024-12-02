define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "when",
    "approval/views/side",
    "hgn!approval/templates/docfolder_share",
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    "i18n!admin/nls/admin",
    "jquery.go-orgslide"
],
function(
    $,
    _,
    Backbone,
    GO,
    when,
    SideView,
    ApprDocFolderShareTpl,
    commonLang,
    approvalLang,
    adminLang
) {
	var lang = {
		"하위 부서 포함" : adminLang['하위 부서 포함'],
		"삭제" : commonLang['삭제'],
		"폴더명" : commonLang['폴더명'],
		"공유 대상" : approvalLang['공유 대상'],
		"공유 추가" : approvalLang['공유 추가'],		
		
	};
	
	var UserTpl = ['<span class="user_info">',
                    '<span class="name">{{data.name}}</span>',
                    '<span class="bar"> / </span>',
                    '<span class="position">{{data.position}}</span>',
                    '<span class="bar"> / </span>',
                    '<span class="email">{{data.email}}</span>',
                    '<span class="btn_wrap btn_del" title="{{lang.삭제}}"><span class="ic_classic ic_del"></span></span>'
                   ].join('');
	
	var DeptTpl = ['<span class="user_info">',
                   '<span class="name">{{data.name}}</span>',
                   '<span class="bar"> / </span>',
                   '( <input type="checkbox" name="include_sub_dept" {{#data.includeSubDept}}checked="checked"{{/data.includeSubDept}}><label for="">{{lang.하위 부서 포함}}</label> )',
                   '<span class="btn_wrap btn_del" title="{{lang.삭제}}"><span class="ic_classic ic_del"></span></span>'
                  ].join('');

	
	var FolderShareModel = Backbone.Model.extend({
		
	});
	
	
	var FolderShareCollection = Backbone.Collection.extend({
		model : FolderShareModel,
		initialize: function(options) {
			this.folderId = options.folderId;
			this.folderType = options.folderType;
		},
		
		url : function(){
			if(this.folderType == 'user'){
	            return GO.contextRoot+'api/approval/userfolder/share/'+this.folderId;
			}else{
	            return GO.contextRoot+'api/approval/deptfolder/share/'+this.folderId;				
			}
		}
	});
	
	var FolderShareSaveModel = Backbone.Model.extend({
		initialize: function(options) {
			this.set('folderType', options.folderType);
			this.set('docFolderId', options.folderId);
		},
		
		url : function(){
			if(this.get('folderType') == 'user'){
	            return GO.contextRoot+'api/approval/userfolder/share/';
			}else{
	            return GO.contextRoot+'api/approval/deptfolder/share/';				
			}
		}
	});
	
	var ApprDocFolderShareItemView = Backbone.View.extend({
        initialize: function(options) {
        	this.type = options.type;
        	this.model = options.model;
			this.$el.data('instance', this);
        },
		tagName : 'li',
		events : {
			'click .ic_del' : 'deleteItem',
			'change input[name="include_sub_dept"]'  : 'changeIncludeSubDept'
		},
		
		changeIncludeSubDept : function(e){
			this.model.set('includeSubDept', $(e.currentTarget).is(':checked'));
		},
		deleteItem : function(e){
			this.remove();
		},
		render : function(){
			if(this.type == 'user'){
				this.$el.html(Hogan.compile(UserTpl).render({
					data : {
						position : this.model.get('targetUserPosition'),
						name : this.model.get('targetUserName'),
						email : this.model.get('targetUserEmail')
					},
					lang : lang
				}));
			}else{
				this.$el.html(Hogan.compile(DeptTpl).render({
					data : {
						name : this.model.get('targetDeptName'),
						includeSubDept : this.model.get('includeSubDept')
					},
					lang : lang
				}));
			}
			return this;
		}
	});
 

    var ApprDocFolderShareView = Backbone.View.extend({
    	
        initialize: function(options) {
        	this.options = options || {};
        	this.popupEl = this.options.popupEl;
            this.folderType = this.options.folderType; // user or dept
            if(this.folderType == 'dept'){
            	this.deptId = this.options.deptId;
            }
            this.folderId = this.options.folderId;
            this.folderName = this.options.folderName;
            this.collection = new FolderShareCollection({
            	folderId : this.folderId,
            	folderType : this.folderType            	
            });
			this.on('docFolderSave', _.bind(this.docFolderSave, this));
        },
        orgSlide : null,
		el : '.layer_folder_share .content',
        events : {
        	"click #btnAddShare" : "callOrgSlide",
        	"click .btn_del" : "deleteShare"
        },
        
        fetchData : function(){
        	var self = this;
        	var folderType = this.folderType;
			var deffered = when.defer();
            this.collection.fetch({
            	data : {
            		folderType : folderType
            	},
            	success : deffered.resolve,
            	error : deffered.reject
            });
			return deffered.promise;
        },

        render: function() {
        	var self = this;
        	when(this.fetchData())
        	.then(function renderMe(){
                self.$el.html(ApprDocFolderShareTpl({
                	lang: lang,
                	folderName : self.folderName
                }));
                self.renderList();
                self.popupEl.reoffset();
        	})
			.otherwise(function printError(err) {
                console.log(err.stack);
            });	
        },
        
        renderList : function(){
        	this.collection.each(function(model){
        		var type = !_.isUndefined(model.get('targetUserId')) ? 'user' : 'dept';
        		this.addShare(type, model);
        	}, this);
        },
        
        callOrgSlide : function(e){
        	e.preventDefault();
			var self = this;
			this.orgSlide = $.goOrgSlide({
				type : "node",
				autoClose : false,
				contextRoot : GO.contextRoot,
				useApprReference : true,
				useDisableNodeStyle : true,
				callback : $.proxy(function(info) {
					this.onAddShare(info);
				}, this)	
			});
        },
        
        onAddShare : function(info){
			var type = info.type != 'org' ? 'user' : 'dept';
			var model = new FolderShareModel();
			if(type == 'user'){
				model.set({
					targetUserId : info.id,
					targetUserPosition : info.position,
					targetUserName : info.name,
					targetUserEmail : info.email
				});
			}else{
				model.set({
					targetDeptId : info.id,
					targetDeptName : info.name,
					includeSubDept : false
				});						
			}
			
			if(type == 'dept' && !info.useReference){
				$.goError(approvalLang['선택된 대상을 추가 할 수 없습니다']);
				return false;
			}
			var flag = this.validate(type, model);
			if(!flag){
				$.goError(approvalLang['선택된 대상을 추가 할 수 없습니다']);
				return false;
			}
			this.addShare(type, model);
        },
        
        validate : function(type, model){
        	var isDupl = this.validateDupl(type, model);
        	if(type == 'user' && this.folderType == 'user'){
        		if(GO.session('id') == model.get('targetUserId')){
        			return false;
        		}
        	}else if(type == 'dept' && this.folderType == 'dept'){
        		if(this.deptId == model.get('targetDeptId')){
        			return false;
        		}
        	}
        	
        	if(isDupl){
        		return false;
        	}else{
        		return true;
        	}
			
        },
        
        validateDupl : function(type, model){
        	var isDupl;
			var matched = {};
			if(type == 'user'){
				matched = _.findWhere(this.getData(), {
					targetUserId : model.get('targetUserId')
				});
			}else{
				matched = _.findWhere(this.getData(), {
					targetDeptId : model.get('targetDeptId')					
				});
			}
			isDupl = matched ? true : false;
			return isDupl;
        },
        
        addShare : function(type, model){
			var itemView = new ApprDocFolderShareItemView({
				type : type,
				model : model
			});
			this.$el.find('#share_list_wrap').append(itemView.render().$el);
        },
        
        getData : function(){
        	var dataList = [];
        	var folderId = this.folderId;
        	var folderType = this.folderType;
        	_.each(this.$el.find('#share_list_wrap li'), function(liTag){
        		var itemView = $(liTag).data('instance');
        		if(itemView.type == 'user'){
            		dataList.push({
            			docFolderId : folderId,
            			folderType : folderType,
            			targetUserId : itemView.model.get('targetUserId')
            		});        			
        		}else{
            		dataList.push({
            			docFolderId : folderId,
            			folderType : folderType,
            			targetDeptId : itemView.model.get('targetDeptId'),
            			includeSubDept : itemView.model.get('includeSubDept')
            		});
        		}        		
        	}, this);
        	return dataList;
        },
        
        docFolderSave : function(){
        	var self = this;
        	var model = new FolderShareSaveModel({
        		folderType : this.folderType,
        		folderId : this.folderId
        	});
        	model.set('targets', this.getData());
        	model.save({},{
        		type : 'PUT'
        	}).done(function(){
        		$.goMessage(commonLang['저장되었습니다.']);
        		self.trigger('successDocFolderSave', model.get('targets').length);
				SideView.reload(true);
            }).fail(function(){
        		$.goError(commonLang['저장에 실패 하였습니다.']);
            });
        }
    });

    return ApprDocFolderShareView;
});