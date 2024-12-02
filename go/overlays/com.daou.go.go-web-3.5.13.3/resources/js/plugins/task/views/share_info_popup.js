;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        
	        "collections/circle_nodes",
	        
	        "jquery.go-grid"
	], 
	function(
			Backbone,
			Hogan,
			App,
			
			commonLang,
			taskLang,
			
			CircleNodes
	) {
		var lang = {
				"desc1" : taskLang["현재 업무 폴더의 공개/공유 현황을 알려드립니다"],
				"desc2" : taskLang["현재 업무 폴더의 공개 현황을 알려드립니다"],
				"dept" : taskLang["부서"],
				"deptShare" : taskLang["부서공개여부"],
				"member" : taskLang["멤버확인"],
				"confirm" : commonLang["확인"],
				"shareInfo" : taskLang["공개 현황"],
				"close" : commonLang["닫기"],
				"shareTarget" : taskLang["공개 대상"],
				"all" : taskLang["전체 열람"],
				"partial" : taskLang["부분 열람"],
				"show" : commonLang["보기"],
				"shareSubdept" : taskLang["하위부서공유"],
		};
		
		
		var shareTpl = Hogan.compile(
			'<p class="desc">{{lang.desc1}}</p>' +
			'<table id="shareList" class="type_normal">' +
				'<thead>' +
					'<tr>' +
						'<th class="sorting_desc"><span class="title_sort">{{lang.dept}}<ins class="ic"></ins><span class="selected"></span></span></th>' +
						'<th class="sorting"><span class="title_sort">{{lang.deptShare}}<ins class="ic"></ins></span></th>' +
						'<th class="sorting"><span class="title_sort">{{lang.shareSubdept}}<ins class="ic"></ins></span></th>' +
						'<th class="sorting"><span class="title_sort">{{lang.member}}<ins class="ic"></ins></span></th>' +
					'</tr>' +
				'</thead>' +
				'<tbody></tbody>' + 
			'</table>'
		);
		
		
		var publicTpl = Hogan.compile(
			'<p class="desc">{{lang.desc2}}</p>' +	
			'<table id="publicList" class="type_normal">' +	
				'<thead>' +
					'<tr>' +
						'<th class="sorting"><span class="title_sort">{{lang.shareTarget}}<ins class="ic"></ins></span></th>' +
					'</tr>' +
				'</thead>' +
				'<tbody></tbody>' + 
			'</table>'
		);
		
		
		var memberView = Hogan.compile(
			'<tr class="detail_info" data-id="{{id}}">' +
				'<td colspan="4">' +
					'<ul class="name_tag">' +
						'{{#members}}' +
						'<li class="default_option">{{.}}</li>' +
						'{{/members}}' +
					'</ul>' +
				'</td>' +
			'</tr>'
		);
		
		
		var ShareInfoPopup = Backbone.View.extend({
			el : "#sharePopupContent",
			
			
			events : {
				"click a[data-tag=showMembers]" : "showMembers",
				"click a[data-tag=editFolder]" : "goFolderEdit"
			},
			
			
			initialize : function(options) {
				this.options = options || {};
				this.parent = options.parent;
				this.folder = this.options.folder;
				this.circles = new CircleNodes({
					type : "tree"
				});
			},
			
			
			render : function() {
				if (this.folder.get("publicShare")) {
					this.$el.html(publicTpl.render({lang : lang}));
					this.renderList("public");
				} else {
					this.$el.html(shareTpl.render({lang : lang}));
					this.renderList("share");
				}
				this.renderButton();
				
				return this;
			},
			
			
			showMembers : function(e) {
				var self = this;
				var target = $(e.currentTarget);
				var id = $(e.currentTarget).attr("data-id");
				var memberArea = this.$("tr[data-id='" + id + "']");
				
				if (memberArea.length) {
					var isVisible = memberArea.is(":visible");
					var label = isVisible ? commonLang["보기"] : commonLang["접기"];
					memberArea.toggle(!isVisible);
					target.text(label);
					self.parent.reoffset();
				} else {
					this.circles.fetch({
						data : JSON.stringify(this.folder.get("share")),
						type : "POST",
						contentType: "application/json",
						success : function(circles) {
							var circle = circles.getCircle(id);
							var members = circle.getMemberNames();
							target.parents("tr").after(memberView.render({
								members : members,
								id : id
							}));
							target.text(commonLang["접기"]);
							self.parent.reoffset();
						}
					});
				}
			},
			
			
			getColumns : function(type) {
				if (type == "share") {
					return [{
						mData : null, sClass : "", bSortable : false, fnRender : function(obj) {
							return '<span>' + obj.aData.nodeValue + '</span>';
						}
					},{
						mData : null, sClass : "", bSortable : false, fnRender : function(obj) {
							var text = obj.aData.members.length ? taskLang["부분 열람"] : taskLang["전체 열람"];
							return '<span>' + text + '</span>';
						}
					}, {
						mData : null, sClass : "", bSortable : false, fnRender : function(obj) {
							var isSubShare = obj.aData.nodeType == "subdepartment" ? "O" : "X";
							return '<span>' + isSubShare + '</span>';
						}
					}, {
						mData : null, sClass : "", bSortable : false, fnRender : function(obj) {
							return '<a data-tag="showMembers" class="btn_fn7" data-id="' + obj.aData.nodeId + '">' + commonLang["보기"] + '</a>';
						}
					}];
				} else {
					return [{
						mData : null, sClass : "", bSortable : false, fnRender : function(obj) {
							return '<span>' + obj.aData.nodeValue + '</span>';
						}
					}];
				}
			},
			
			
			renderList : function(type) {
				var self = this;
				 $.goGrid({
				    el : "#" + type + "List",
				    url : GO.contextRoot + "api/task/folder/" + this.folder.get("id") + "/share",
				    displayLength : 5,
					displayLengthSelect : false,
				    emptyMessage : '',
				    defaultSorting : [],
				    sDomUse : true,
				    columns : self.getColumns(type),
				    fnDrawCallback : function(tables, oSettings, listParams) {
				    	self.parent.reoffset();
				    }
				});
			},
			
			
			renderButton : function() {
		    	var toolBar = 
		    		'<div class="tool_bar">' +
						'<div class="critical">' +						
							'<a class="btn_tool" data-role="button" data-tag="editFolder">' +
					            '<span class="ic_toolbar modify"></span>' +
								'<span class="txt">' + commonLang["편집"] + '</span>' +
							'</a>' +							
						'</div>' +
					'</div>';
		    	
		    	this.$el.find("table").after(toolBar);
			},
			
			
			goFolderEdit : function() {
				GO.util.store.set("taskFolderId", null, {type : "session"});
				App.router.navigate("task/folder/" + this.folder.id, true);
			}
		});
		return ShareInfoPopup;
	});
}).call(this);