(function() {
	define([
        "jquery",
	    "backbone",
	    "app",
	    
	    "hgn!admin/templates/mail/alias_tree",
	    "admin/views/mail/alias_create",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        
        "GO.util",
        "jquery.jstree.hotkeys",
        "jquery.jstree"
	],
	function(
        $,
	    Backbone,
	    App,
	    
	    AliasTreeTpl,
	    AliasCreateView,
        commonLang,
        adminLang
	) {
		var instance = null;
		var lang = {
				label_alias : adminLang["별칭 계정 관리"],
				label_add : commonLang['추가'],
				label_edit : commonLang['수정'],
				label_delete : adminLang['별칭 계정 삭제']
		};
		
		var AliasTreeView = Backbone.View.extend({
			el: "#layoutContent",
			
			events : {
				'click #aliasCreate' : 'addAlias',
				'click #aliasDelete' : 'deleteAlias',
				'click #moveTopAlias' : 'moveTopAlias'
			},
			
			initialize: function() {
				this.$el.off();
				GO.EventEmitter.on('admin', 'layout:renderAliasTree', this.renderTree, this);
			},
			
			render: function() {
				this.$el.append(AliasTreeTpl({
					lang : lang
				}));
				this.renderTree();
				return this;
			},
			
			renderTree : function() {
				var self = this;
				this.treeEl = this.$el.find('#aliasTree').jstree({
					'plugins' : [ 'themes', 'json_data', 'ui', 'crrm', 'cookies', 'dnd', 'types', 'hotkeys', 'contextmenu' ],
					'core' : { 'animation' : 120 }, 
					'json_data' : {
						'ajax' : {
							"url" : GO.contextRoot + 'ad/api/mail/alias/tree/list',
							"data" : function(n) {
								if(typeof n.data == 'function') var data = n.data();
								return { id : data ? data.mailUserSeq : self.loadId };
							},
							"cache" : true,
							"async" : true,
							"success" : function(data) {
								
								try {
									$.each(data, function(i,item){
										if(item.metadata.accountStatus == "disabled"){
											item.data.title = " (" + adminLang['중지'] + ") " + item.data.title;
										}
									});
									
									var target = self.$el.find('#aliasTree');
									if (data.length == 0 && target.find('ul>li').length <= 1) {
										var emptyHtml = ['<p class="data_null">'+
										                 '<span class="txt">'+adminLang['상단에']+'</span>'+
										                 ' <strong>'+adminLang['[추가]']+'</strong>'+
										                 '<span class="txt">'+adminLang['를 클릭해 주세요.']+'</span></p>',].join("");
										target.html(emptyHtml);
										target.css('margin', '185px 15px');
										self.selectedFirstAlias();
									}
								}catch(err){
									console.info(err);
								}
							}
						}
					},
					'core' : { 'animation' : 120 },
					'defaults ' : {
						'html_titles' : false,
						'move_node' : false,
						'ccp' : true,
						'width' : 200
					},
					'ui' : {
						'select_multiple_modifier' : false,
						'select_limit' : 1
					},
					'hotkeys' : {
						'del' : self._deleteDept,
						'f2' : function() {
							return false;
						},
						'space' : function() {
							return false;
						}
					},
					'types' : {
						'max_depth' : -1,
						"max_children" : -1,
						'valid_children' : [ "aliasroot" ],
						'start_drag' : true,
						'move_node' : true,
						'delete_node' : true,
						'remove' : true,
						'types' : {
							'alias' : {
								'max_depth' : -1,
								"max_children" : -1,
								'valid_children' : [ "alias" ],
								"start_drag" : true,
			                    "move_node" : true,
			                    "delete_node" : true,
			                    "remove" : true
							}
						}
					}
				})
				.bind("loaded.jstree", function(event, data) {
					self.selectedFirstAlias();
				})
				.bind("load_node.jstree", function( node , success_callback , error_callback ) {
					self.treeEl.find('a[href="#"]').attr('data-bypass',1);
				})
				.bind("move_node.jstree", self.moveAliasSave)
				.bind("select_node.jstree", self.selectAlias);		
				
			},
			
			selectedFirstAlias : function(){
				var firstNode = $("#aliasTree ul");
				if(!firstNode.length){
					var emptyHtml = '<p class="data_null">'+
											'<span class="ic_data_type ic_no_data"></span>'+
											'<span class="txt">'+adminLang['등록된 별칭 계정이 없습니다.']+'</span>'+
										'</p>';
					$('#aliasDetail').html(emptyHtml);
					$('#aliasDetail').css('margin', '230px 15px');
					return;
				}
				var nodeId = firstNode.find('li:first-child a').attr('nodeid');
				var aliasCreateView = new AliasCreateView({useLayout : false, aliasId : nodeId});
				$('#aliasDetail').html(aliasCreateView.render().el);
			},
			
			selectAlias : function(e, data) {
				$.goOrgSlide('close');
				var selectedData = $(data.rslt.obj[0]).data();
				var aliasCreateView = new AliasCreateView({useLayout : false, aliasId : selectedData.mailUserSeq});
				$('#aliasDetail').html(aliasCreateView.render().el);
				
				if($(data.rslt.obj[0]).find('a').attr('rel') != 'aliasroot'){
					$('#moveTopAlias').show();
				}else{
					$('#moveTopAlias').hide();
				}
			},
			
			addAlias : function() {
				var parentId = '';
				var selectedNode = this.getSelectedAliasNode();
				if(selectedNode.length) parentId = selectedNode.find('a').attr('nodeid');
				
	            var self = this;
	            var aliasCreateView = new AliasCreateView({useLayout : false, parentId : parentId});
				var popupEl = $.goPopup({
                    pclass: 'layer_normal',
					header : adminLang["별칭 계정 추가"],
                    modal : true, 
                    width : "500px",
                    contents : "",
                    allowPrevPopup : true,
                    buttons : [{ 
                    	btype : 'confirm', 
                    	btext: commonLang["확인"], 
                    	autoclose : false,
                    	callback: function(rs) {
                    		aliasCreateView.saveAlias();
                    	}
                    }, { 
                    	btype : 'close', btext: commonLang["취소"] 
                    }]
                });
				$('#gpopupLayer .content').html(aliasCreateView.render().el);
				
				popupEl.reoffset();
			},
			
			getSelectedAliasNode : function() {
				return this.treeEl.jstree('get_selected');
			},
			
			deleteAlias :function() {
				var self = this;
				var selectedData = this.getSelectedAliasNode();
				
				if(selectedData.length == 0) {
					$.goMessage(admin["삭제할 별칭 계정을 선택해주세요."]);
					return false;
				}
				var nodeId = selectedData.find('a').attr('nodeid');
				if(nodeId) {
					$.goCaution(adminLang["별칭 계정 삭제"], adminLang["별칭 계정을 삭제하면, 하위 별칭 계정이 최상위로 이동됩니다."], function() {
						$.go(GO.contextRoot + 'ad/api/mail/alias/'+nodeId, {}, {
							qryType : 'DELETE',
							contentType: 'application/json',
							responseFn : function(rs) {
								var selectedNode = self.getSelectedAliasNode();
								var parentNode = selectedNode.parents('li:eq(0)');
								var parentData = parentNode.data();
								    
								parentNode.find("a:first").addClass("jstree-clicked");
								//self.treeEl.jstree('refresh', parentNode);
								self.render();	//GO-14115 [사이트관리자] 별칭계정관리 - 삭제 후 상세보기부분에 삭제된 별칭계정의 정보가 그대로 보여짐.
							}
						});
					});
				}
			},
			moveTopAlias : function() {
				var self = this;
				var selectedData = this.getSelectedAliasNode();
				
				if(selectedData.length == 0) {
					$.goMessage("최상위로 이동할 별칭 계정을 선택해주세요.");
					return false;
				}
				var nodeId = selectedData.find('a').attr('nodeid');
				var parentId = selectedData.parent('ul').parent('li').find('a').attr('nodeid');
				if(nodeId) {
					$.go(GO.contextRoot + 'ad/api/mail/alias/'+nodeId+'/root?prevParentMailUserSeq='+parentId, {}, {
						qryType : 'PUT',
						contentType: 'application/json',
						responseFn : function(rs) {
								self.renderTree();
						}
					});
				}
				
			},
			moveAliasSave : function(e, data) {
				var aliasTree = $(this),
					targetParent = data.inst._get_parent(data.rslt.o);
				
				var targetNode = data.inst._get_node(data.rslt.o);
				var preParent = data.inst._get_node(data.rslt.op);
				var preParentId = '';
				if(preParent != -1){
					preParentId = preParent.data('mailUserSeq');
				}
				
				var url = GO.contextRoot + 'ad/api/mail/alias/'+targetNode.data('mailUserSeq')+'/move?prevParentMailUserSeq='+preParentId+'&targetParentMailUserSeq='+targetParent.data('mailUserSeq');
				
				$.go(url, {}, {
					qryType : 'PUT',
					contentType : 'application/json',
					responseFn : function(rs) {
						if(rs.code == 200) {
							aliasTree.jstree('refresh', targetParent);
						} else {
							$.jstree.rollback(data.rlbk);
						}
					}
				});
				
			},
			
			validationParentsNode : function(){
				
			}
		});

		return AliasTreeView;
	});
}).call(this);