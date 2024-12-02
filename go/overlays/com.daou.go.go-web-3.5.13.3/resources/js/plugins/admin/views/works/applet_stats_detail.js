;(function() {
	define([
			"backbone",			
			"i18n!nls/commons",
			"i18n!admin/nls/admin",
			"i18n!works/nls/works",	
			"collections/paginated_collection",
			"hgn!admin/templates/works/applet_stats_detail",
			"admin/models/applet_stats_detail",
	        "go-nametags", 
	        "admin/views/works/applet_share_item",
	        "works/models/applet_baseconfig",
		    "jquery.go-orgslide",
		    "jquery.go-preloader"
	], 
	function(
			Backbone,		
			commonLang,
			adminLang,
			worksLang,
			PaginatedCollection,
			AppletStatsDetailTpl,
			AppletStatsDetail,
	        NameTagView, 
	        ShareItemView,
	        AppletBaseConfigModel
	) {
		var lang = {
			"저장" : commonLang["저장"],
			"취소" : commonLang["취소"],
			"목록으로 돌아가기" : adminLang["목록으로 돌아가기"],
			"삭제" : commonLang["삭제"],
			"count" : commonLang["개"],
			"삭제하기" : commonLang["삭제하기"],
			"기본정보" : adminLang["기본정보"],
			"생성일" : adminLang["생성일"],
			"운영자" : adminLang["운영자"],
			"운영자 추가" : adminLang["운영자 추가"],
			"데이터" : worksLang["데이터"],
			"데이터 등록 수" : worksLang["데이터 등록 수"],
			"생성자" : worksLang["생성자"],
			"앱명" : worksLang["앱명"],
			"총 앱 개수" : worksLang["총 앱 개수"],
			"총 데이터 수" : worksLang["총 데이터 수"],
			"공유 설정이 없습니다" : worksLang["공유 설정이 없습니다."],
			"공유 설정" : worksLang["공유 설정"],
			"공유 정보" : worksLang["공유 정보"],
			"클래스 구분" : worksLang["클래스 구분"]
		};	
		
		var _savingFlag = false;
		
		var AppletShareCollection = PaginatedCollection.extend({ 
			url : function(){
	    		return GO.config("contextRoot") + "api/works/applets/" + this.appletId + "/docs/export?" + this.makeParam();
	    	},
	    	
	    	setAppletId : function(appletId){
	    		this.appletId = appletId;
	    	}
		});
		
		var AppletStatsDetailView = Backbone.View.extend({
			
			events : {
				"click #btn-confirm": "_onConfirm",
	            "click #btn-goback": "_goBack",
	            "click #btn-cancel": "_cancel",
	            "click #btn-share-delete" : "shareDeleteItem",
	            "click #btn-app-delete" : "appleteDelete"
			},
			
			initialize : function(options) {
				this.options = options || {};
				this.appletId = options.id;
				this.statsDetail = new AppletStatsDetail({appletId : this.appletId});
				this.statsDetail.fetch({async : false});
			},
			
			render : function() {
				this.$el.html(AppletStatsDetailTpl({
					lang : lang,
					stats : this.statsDetail.toJSON(),
					createdAt : GO.util.shortDate(this.statsDetail.get("createdAt")),
					docCount : GO.util.numberWithCommas(this.statsDetail.get("docCount"))
				}));

				this.renderAdminList();
				this.renderShareList();
				
				return this;
			},
			
			renderAdminList : function() {
				var self = this;
				this.nameTagView = NameTagView.create({}, {useAddButton : true});
				this.$("ul.name_tag").html(this.nameTagView.el);
				this.nameTagView.$el.on('nametag:clicked-add', function(e, nameTag) {
					$.goOrgSlide(self._getOrgOption(nameTag));
				});
				
				_.each(this.statsDetail.get("admins"), function(admin) {
					this.nameTagView.addTags({
						id : admin.id,
						displayName : admin.name + (admin.position ? " " + admin.position : "")
					}, {removable : true, "attr" : admin});
				},this);
			}, 
			
			_getOrgOption : function(nameTag) {
				var option = {
					contextRoot : GO.contextRoot,
                    isAdmin : true,
                    header : adminLang["운영자 추가"],
					callback : $.proxy(function(info) {
						nameTag.addTags(info, { removable : true, "attr": info });
					}, this)
				};
				
				return option;
			},
			
			renderShareList : function() {
				var shareNodes = this.statsDetail.getShareNodes();
				if(shareNodes.length > 0) {
					this.$("#shareList").empty();
					_.each(shareNodes, function(shareNode){
						var shareItemView = new ShareItemView({
							item : shareNode
						});
						this.$("#shareList").append(shareItemView.render().el);
	        		}, this);
				} 
			},
			
			reload : function() {
				this.statsDetail.fetch({async : false});
				this.renderAdminList();
				this.renderShareList();
			},
            
            shareDeleteItem : function(e) {
            	console.log("shareDeleteItem");
                var $target = $(e.currentTarget).parent().parent().parent();
                var nodeId = $target.attr('data-nodeid');
                var nodeType = $target.attr('data-nodetype');
                var nodeDeptId = $target.attr('data-nodedeptid');
                
                var targetItem = this.getByNodeIdAndType(nodeId, nodeType, nodeDeptId);
                if (targetItem) {
                	this.$el.find('[data-nodeid="' + nodeId + '"]').remove();
                } 
            },
            
            getByNodeIdAndType: function(nodeId, nodeType, nodeDeptId) {
            	var targetItem;
            	_.each(this.statsDetail.getShareNodes(), function(shareItem){
            		var isSameId = (nodeId == shareItem.nodeId);
                    var isSameType = (nodeType == shareItem.nodeType);
                    
                    if (_.contains(['department', 'subdepartment'], nodeType) && this.statsDetail.isDeptType(nodeType, true)) {
                        isSameType = true;
                    }

                    if (this.statsDetail.isUserWithDeptType(nodeType, nodeDeptId)) {
                        isSameType = isSameId && (shareItem.nodeDeptId == nodeDeptId);
                    }

                    if(isSameId && isSameType) {
                    	targetItem = shareItem;
                    	return;
                    }
            	}, this);
            	
            	return targetItem;
            },
            
            getShareList : function() {
            	var self = this;
            	var result = [];
            	$("#shareList").find('tr').each(function(i, el) {
                    var $el = $(el);
                    _.each(self.statsDetail.getShareNodes(), function(item) {
                    	if($el.data('nodeid') == item.nodeId) {
                    		result.push(item);
                    	}
                    });
                });
                
                return result;
            },
            
            appleteDelete: function(e){
    			e.preventDefault();
    			var self = this;

    			$.goPopup({
    				"pclass" : 'layer_confim',
                    "modal" : true,
                    "contents" : '<p class="q">' + worksLang["앱을 삭제하시겠습니까?"] + '</p>' + '<p class="desc">' + worksLang["앱 삭제 설명"] + '</p>',  //'<p class="desc">' + lang['앱 검색 설명'] + '</p><hr>',
                    "buttons" : [{
                        'btext' : commonLang["삭제"],
                        'autoclose' : false,
                        'btype' : 'confirm',
                        'callback' : function(e){
                			$.ajax({
	            				type : "DELETE",
	            				dataType : "json",
	            				url : GO.contextRoot + "ad/api/works/applets/" + self.appletId,
	            				success : function(resp) {
	            					e.close();
	            					$.goMessage(commonLang["삭제되었습니다."]);
	            					GO.router.navigate('works/applets', {"pushState": true, "trigger": true});
	            				},
	            				error : function(resp) {
	            					$.goError(resp.message);
	            				}
	            			});
                        }
                    }, {
                        'btext' : commonLang["취소"],
                        'btype' : 'cancel'
                       }
                    ]
                })
    		},
            
            _onConfirm : function(e){
            	e.preventDefault();
            	
            	var admins = _.map($("ul.name_tag").find("li[data-id]"), function(el) {
					return {id : $(el).data("id")};
				});
            	
            	if(admins.length < 1){
            		$.goError(worksLang['운영자를 추가해 주세요']);
            		return;
            	}
            	
            	this.statsDetail.set("admins", admins);
            	
            	var shareModel = this.statsDetail.displayShareValue();
            	shareModel.circle.nodes = this.getShareList();
            	this.statsDetail.set("appletShareModel", shareModel);
            	
            	var preloader = null;
    		    if(_savingFlag) {
                    $.goSlideMessage(worksLang['저장중 메세지']);
                    return;
                }
            	this.statsDetail.save({},{
            		type : "PUT",
            		beforeSend: function() {
                        preloader = $.goPreloader();
                        _savingFlag = true;
                    },
            		success : function(){
            			$.goMessage(commonLang["저장되었습니다."]);
            		},
            		error : function(){
            			$.goMessage(commonLang["저장에 실패 하였습니다."]);
            		},
    				statusCode: {
    					400 : function() { GO.util.error('400', { "msgCode": "400-works"}); }, 
    					403 : function() { GO.util.error('403', { "msgCode": "400-works"}); }, 
    					404 : function() { GO.util.error('404', { "msgCode": "400-works"}); }, 
    					500 : function() { GO.util.error('500'); }
    				},
                    complete: function() {
                        preloader.release();
                        _savingFlag = false;
                    }
            	});        	
            },
            
            _cancel: function(e){
            	e.preventDefault();
            	this.reload();
            	$.goMessage(commonLang["취소되었습니다."]);
    		},
    		
    		_goBack : function(e){
                e.preventDefault();
                GO.router.navigate('works/applets', {"pushState": true, "trigger": true});
            },
            
		});
		
		return AppletStatsDetailView;
	});
}).call(this);