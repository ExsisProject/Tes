(function() {
	define([
		"jquery",
		"backbone",
		"app",
		"when",

	    "hgn!approval/templates/mobile/m_side",
	    "hgn!approval/templates/mobile/m_side_dept_folder",
	    "i18n!approval/nls/approval",

		'approval/views/mobile/base_approval'
	],
	function(
		$,
		Backbone,
		GO,
		when,
		
		sideMenuTpl,
		tplSideDeptFolder,
		approvalLang,

		BaseApprovalView
	) {

		var lang = {
				'appr_wait_doc' : approvalLang['결재 대기 문서'],
				'appr_wait_reception_doc' : approvalLang['결재 수신 문서'],
				'approval' : approvalLang['결재하기'],
				'base_docfolder' : approvalLang['기본 문서함'],
				'added_docfolder' : approvalLang['추가된 문서함'],
				'shared_docfolder' : approvalLang['공유된 문서함'],
				'user_docfolder' : approvalLang['개인 문서함'],
				'appr_sched_doc' : approvalLang['결재 예정 문서'],
				'draft_docfolder' : approvalLang['기안 문서함'],
				'appr_tempsave' : approvalLang['임시 저장함'],
				'appr_docfolder' : approvalLang['결재 문서함'],
				'viewer_docfolder' : approvalLang['참조/열람 문서함'],
				'reception_docfolder' : approvalLang['수신 문서함'],
				'send_docfolder' : approvalLang['발송 문서함'],
				'dept_draft' : approvalLang['기안 완료함'],
				'dept_ref' : approvalLang['부서 참조함'],
				'dept_rcpt' : approvalLang['부서 수신함'],
				'dept_official' : approvalLang['공문 발송함'],
				'dept_folder' : approvalLang['부서 문서함'],
				'sub_dept_folder' : approvalLang['하위 부서 문서함'],
				'user_official_docfolder' : approvalLang['공문 문서함'],
	            'official_todo_doc' : approvalLang['공문 대기 문서'],
				'appr_todoviewer_doc' : approvalLang['참조/열람 대기 문서']
			};

		var ApprSideModel = Backbone.Model.extend({
			url: '/api/approval/side'
		});
		
		var CountModel = Backbone.Model.extend({
			initialize : function(options) {
				this.options = options || {};
			},
			setType : function(type){
				if(_.isString(type)){this.type = type;}
			},
			url: function(){
				if(_.isString(this.type)) {
                    return '/api/approval/'+this.type+'/count'
                }
			}
		});

		var SideDeptFolderCollection = Backbone.Collection.extend({
			url: '/api/approval/deptfolder'
		});

		var SideView = BaseApprovalView.extend({
			id: 'approvalSideMenu',
			sideDeptFolderCollection : null,
			unBindEvent : function() {
				this.$el.off("vclick", "a[data-navi]");
			},
			bindEvent : function() {
				this.$el.on("vclick", "a[data-navi]", $.proxy(this.goDocList, this));
			},
			initialize : function(options) {
				BaseApprovalView.prototype.initialize.call(this);

				this.options = options || {};
				this.defer = $.Deferred();
				this.model = new ApprSideModel();
				$.when(this.model.fetch(), this.config.fetch()).then($.proxy(function() {
					this.defer.resolve();
				}, this));

				this.countModel = new CountModel();
                this.sideDeptFolderCollection = new SideDeptFolderCollection();
            },

			render : function() {
				var deferred = $.Deferred();
				this.defer.done($.proxy(function() {
                    GO.config("excludeExtension", this.config.get("excludeExtension") ? this.config.get("excludeExtension") : "");

                    this.packageName = this.options.packageName;

                    this.sideDeptFolderCollection.set(this.model.get('deptFolders'));

					var addedFolder = false;
					if(this.model.get('userFolders')){
						addedFolder = (this.model.get('userFolders').length > 0)? true : false;
					}
					var sharedFolder = false;
					if(this.model.get('sharedFoldersToUser')){
						sharedFolder = (this.model.get('sharedFoldersToUser').length > 0)? true : false;
					}

					var data = _.extend(this.model.toJSON(), {
						isOfficialDocMaster : this.model.get('isOfficialMaster'),
						useOfficialConfirm: this.config.get('useOfficialConfirm'),
						addedFolder: addedFolder,
						sharedFolder: sharedFolder
					});

					$.each(data.sharedFoldersToUser, function(i,v) {
						if (v.folderType == "USER") {
							v.isfolderTypeUser = true;
						} else {
							v.isfolderTypeUser = false;
						}
					});

					this.$el.html(sideMenuTpl({
						lang:lang,
						data : data
					}));
					this.sideDeptFolderRender();//부서 문서함
					this.drawApprovalCount(); //결재 대기문서, 결재 수신문서, 참조/열람대기문서, 결재 예정문서 카운트
					this.setSideApp();
					this.unBindEvent();
					this.bindEvent();

					deferred.resolveWith(this, [this]);
				}, this));
				return deferred;
			},
			drawApprovalCount : function() {
				var _this = this;
				var countList = ['todo', 'upcoming', 'todoreception','todoviewer'];
				countList.forEach(function(item){
					_this.setApprovalCount(item);
				});

			},
			setApprovalCount : function(type) {
				var _this = this;
				this.countModel.setType(type);
				this.countModel.fetch().done(function(result){
					var count = result.data.docCount;
					var selectedEl = _this.$el.find('a[data-navi="'+type+'"] .num');
					selectedEl.text(count ? count : '');
				});
			},
			goDocList : function(e) {
				var selectedEl = $(e.currentTarget);
				e.preventDefault();
				this.$el.find('.on').removeClass('on');
				selectedEl.parent().addClass('on');

				var url = "/approval/";
				switch (selectedEl.attr('data-navi')) {
    				case "todo":
    					url += selectedEl.attr('data-navi') + "/all";
    				    break;
    				case "todoreception":
    					url += selectedEl.attr('data-navi') + "/all";
    				    break;
    				case "officialtodo":
    					url += selectedEl.attr('data-navi');
    				    break;
    				case "todoviewer":
                        url += selectedEl.attr('data-navi') + "/all";
                        break;
    				case "upcoming":
    				    url += selectedEl.attr('data-navi');
    				    break;
    				case "userdoc":
    				    url += "userfolder/" + selectedEl.attr('data-id') + "/documents";
    				    break;
    				case "deptdoc":
    				    url += "deptfolder/" + selectedEl.attr('data-id') + "/documents";
    				    break;
    				case "shareuserdoc":
                    	if(selectedEl.attr('data-belong') == "indept"){
                    		url += "userfolder/" + selectedEl.attr('data-id') + "/share/" + selectedEl.attr('data-belong') + "/" + selectedEl.attr('data-deptid');
                    	}else{
                    		url += "userfolder/" + selectedEl.attr('data-id') + "/share/" + selectedEl.attr('data-belong');
                    	}
                        break;
                    case "sharedeptdoc":
                        url += "deptfolder/" + selectedEl.attr('data-id') + "/share/" + selectedEl.attr('data-belong') + "/" + selectedEl.attr('data-deptid');
                        break;
    				case "deptdraft":
    				    url += "deptfolder/draft/" + selectedEl.attr('data-deptid');
    				    break;
    				case "deptreference":
    				    url += "deptfolder/reference/" + selectedEl.attr('data-deptid');
    				    break;
    				case "deptreceive":
    				    url += "deptfolder/receive/" + selectedEl.attr('data-deptid') + '/all';
    				    break;
    				case "deptofficial":
    				    url += "deptfolder/official/" + selectedEl.attr('data-deptid');
    				    break;
    				case "reception":
    				    url += "doclist/reception/all";
    				    break;
    				case "send":
    				    url += "doclist/send/all";
    				    break;
    				default: // viewer
    				    url += "doclist/" + selectedEl.attr('data-navi') + "/all";
    				    break;
				}

				GO.router.navigate(url, {trigger: true});
			},

			sideDeptFolderRender : function(reload) {
				if (reload) {
					this.sideDeptFolderCollection = new SideDeptFolderCollection();
					this.sideDeptFolderCollection.fetch();
				}
				var dataset = this.sideDeptFolderCollection.toJSON(),
				containsSubDept = false;
				if (!dataset.length || !GO.session('useOrg')) {
				} else {
					$.each(dataset, function(k,v) {
						if (v.deptFolders.length > 0) {
                    		v.addedFolder = true;
                    	} else {
                    		v.addedFolder = false;
                    	}
                    	if (v.sharedDocFolders && v.sharedDocFolders.length > 0) {
                    		v.sharedFolder = true;
                    		$.each(v.sharedDocFolders, function(i, folder){
                    			folder.deptId = v.deptId;
                    			if (folder.folderType == "USER") {
                    				folder.isfolderTypeUser = true;
                            	} else {
                            		folder.isfolderTypeUser = false;
                            	}
                    		});
                    		
                    	} else {
                    		v.sharedFolder = false;
                    	}
                        if(v.managable && v.containsSubDept) {
                            containsSubDept = true;
                        }
					});
				}

				this.$el.append(tplSideDeptFolder({
					contextRoot : GO.contextRoot,
					dataset : dataset,
					lang : lang,
				}));

			},

			setSideApp : function() {
				$('body').data('sideApp', this.packageName);
			}
		}, {
            __instance__: null,
            create: function(packageName) {
                this.__instance__ = new this.prototype.constructor({'packageName':packageName});
                return this.__instance__;
            },
            getInstance: function() {
                if(this.__instance__ === null) {
                 	this.__instance__ = new this.prototype.constructor();
                }
                return this.__instance__;
             }
        });

		return SideView;
	});
}).call(this);