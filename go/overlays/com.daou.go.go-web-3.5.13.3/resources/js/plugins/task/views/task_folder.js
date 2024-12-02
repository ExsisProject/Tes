;(function() {
	define([
		    "backbone",
		    "app",
		    
		    "i18n!nls/commons",
		    "i18n!task/nls/task",
		    "hgn!task/templates/task_folder",
		    
		    "task/views/task_title",
		    "task/views/_tag",
		    "task/views/_field",
		    "task/views/_share_dept",
		    "task/views/_domain_code_label",
		    
		    "task/models/task_folder",
		    "task/models/domain_code",
		    "go-nametags",
		    
		    "jquery.go-sdk",
		    "jquery.go-orgslide",
		    "jquery.go-popup"
	], 
	function(
			Backbone,
			App,
			
			commonLang,
			taskLang,
			TaskFolderTmpl,
			
			TaskTitleView,
			TagItem,
			FieldItem,
			ShareDeptItem,
			DomainCodeLabelItem,
			
			TaskFolder,
			DomainCode,
			NameTagView
	) {
		var lang = {
			"add" : commonLang["추가"],
			"edit" : commonLang["수정"],
			"title" : commonLang["제목"],
			"department" : commonLang["위치"],
			"folder" : taskLang["업무 폴더"],
			"description" : taskLang["설명"],
			"assigneeDescription" : taskLang["업무 담당자를 추가하면 업무 등록시, 추가한 담당자로 자동 지정됩니다."],
			"approverDescription" : taskLang["승인자를 추가하면 승인 업무 등록시, 추가한 승인자로 자동 지정됩니다."],
//			"assigneeDescription" : "업무 담당자를 추가하면 업무 등록시, 추가한 담당자로 자동 지정됩니다.",
//			"approverDescription" : "승인자를 추가하면 승인 업무 등록시, 추가한 승인자로 자동 지정됩니다.",
			"taskType" : taskLang["유형"],
			"typeDesc" : taskLang["유형 설명"],
			"use" : taskLang["사용함"],
			"tag" : taskLang["분류"],
			"tagName" : taskLang["분류명"],
			"tagTooltip" : taskLang["분류 툴팁"],
			"inputTag" : taskLang["분류명 입력"],
			"addTag" : taskLang["분류명 추가"],
			"delete" : commonLang["삭제"],
			"addedField" : taskLang["추가 항목"],
			"field" : taskLang["사용 항목"],
			"typeSelect" : taskLang["타입 선택"],
			"fieldName" : taskLang["항목명"],
			"addFieldName" : taskLang["항목명 입력"],
			"type" : taskLang["타입"],
			"required" : taskLang["필수여부"],
			"input" : taskLang["입력값"],
			"default" : taskLang["기본값"],
			"taskPrivate" : taskLang["업무 비공개"],
			"taskPrivateTooltip" : taskLang["업무 비공개 툴팁"],
			"inputAddedField" : taskLang["추가항목입력"],
			"addedFieldTooltip" : taskLang["추가 항목 툴팁"],
			"shareSubDepartment" : taskLang["하위 부서까지 공유"],
			"tagRequired" : taskLang["업무 등록시 반드시 선택해야함"],
			"assgineeDesc" : taskLang["업무 등록자를 담당자로 지정"],
//			"assgineeDesc" : "업무 등록자를 담당자로 지정",
			"selectPrivate" : taskLang["업무 등록자가 비공개 여부 선택"],
			"always" : taskLang["항상 비공개"],
			"referer" : taskLang["참조자"],
			"setReferer" : taskLang["참조자 설정"],
			"refererDesc" : taskLang["참조자 설명"],
			"setShare" : taskLang["공유 설정"],
			"departmentShare" : taskLang["부서 공유"],
			"companyShare" : taskLang["전사 공유"],
			"limit" : taskLang["열람 제한"],
			"partiallyOpen" : taskLang["일부만 공개"],
			"regist" : commonLang["등록"],
			"departmentName" : commonLang["부서명"],
			"viewer" : taskLang["열람자"],
			"fullView" : taskLang["전체열람"],
			"partialView" : taskLang["부분열람"],
			"setAdmin" : taskLang["운영자 설정"],
			"ok" : commonLang["확인"],
			"cancel" : commonLang["취소"],
			"selectType" : taskLang["선택형"],
			"confirmType" : taskLang["확인형"],
			"textType" : taskLang["텍스트형"],
			"inputOption" : taskLang["입력옵션"],
			"detail" : taskLang["세부항목"],
			"management" : commonLang["관리"],
			"share" : taskLang["공유"],
			"shareDesc" : taskLang["공유 설명"],
			"addShareDept" : taskLang["공유 부서 추가"],
			"setShare" : taskLang["공유설정"],
			"read" : taskLang["열람"],
			"notUse" : commonLang["사용하지 않음"],
			"position" : taskLang["직위"],
			"grade" : taskLang["직급"],
			"duty" : taskLang["직책"],
			"usergroup" : taskLang["사용자그룹"],
			"admin" : taskLang["운영자"],
			"approver" : taskLang["승인자"],
			"assignee" : taskLang["담당자"],
			"letters" : taskLang["자"],
			"range" : taskLang["범위"],
			"tagDesc" : taskLang["태그 설명"],
			"select_default" : '** ' + commonLang["선택"] + ' **',
			"delete_success": commonLang["삭제되었습니다."]
			
		};
		var TaskFolderView = Backbone.View.extend({
			events : {
				"change #deptId" : "changeDept",
				"change input[name=taskType]" : "changeTaskType",
				"change input[name=tag]" : "toggleTagView",
				"change input[name=share]" : "toggleShareView",
				"change input[name=limit]" : "toggleLimitView",
				"change #changeDomainCode" : "changeDomainCode",
				"click #submit" : "submit",
				"click #goBackFolder" : "goBack",
				"click #delete" : "deleteConfirm",
				"click #addTag" : "addTag",
				"click #addField" : "addField",
				"click #addShareDept" : "showDeptTree",
				"click #addDomainCodeLabel" : "addDomainCodeLabel",
				"keyup input[data-type=lengthCheck]" : "lengthCheck"
			},
			
			
			initialize : function(data) {
				this.isCreate = data ? false : true;
				this.folder = new TaskFolder({id : data ? data.id : null});
            	this.domainCode = new DomainCode();
			},
			
			
			dataFetch : function() {
				var self = this;
				var deferred = $.Deferred();
				   
				var promise = this.folder.id ? 
					this.folder.fetch({
						statusCode: {
							400 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
							403 : function() { GO.util.error('403', { "msgCode": "400-common"}); }, 
							404 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
							500 : function() { GO.util.error('500'); }
						}
					}) : $.ajax({
		    			dataType : "json",
		    			url : GO.contextRoot+ "api/department/list/joined",
		    			success : function(resp) {
		    				self.joindDepartment = $(resp.data).map(function(key, dept) {
								return ['<option value="',dept.id,'">',dept.name,'</option>' ].join('');
							}).get();
		    			},
		    			error : function(resp) {
	            			$.goError(resp.responseJSON.message);
	            		}
					});
				
				var fetchDomainCode = this.domainCode.getList("position");
				var fetchTaskTypes = this.folder.getTaskType().done(function(types) {
					self.taskTypes = types;
				});
				
				$.when(promise, fetchDomainCode, fetchTaskTypes).done(function() {
					deferred.resolve(self);
				});
				
				return deferred;
			},
			
			
			render : function() {
				var self = this;
				var folderData = {
					lang : lang,
					departmentList : this.getDepartmentList(this.folder.get("deptId")),
					taskTypes : this.taskTypes,
					isCreate : this.isCreate,
					data : this.folder.toJSON(),
					domainCode : this.domainCode.toJSON(),
					isDomainCodeShare : this.folder.isDomainCodeShare(),
					isOrgServiceOn : GO.session("useOrgAccess")
				};
				
				this.$el.addClass("go_renew");
				this.$el.html(TaskFolderTmpl(folderData));
				
				var taskTitleView = new TaskTitleView({
					title : taskLang["업무 폴더"] + " " + (this.folder.id ? commonLang["수정"] : commonLang["추가"])
				});
				this.$el.find(".content_top").html(taskTitleView.el);
				taskTitleView.render();
				
				this.renderTagView();
				this.renderFieldView(this.folder.parsedFields());
				this.renderShareDeptView();
				this.renderDomainCodeLabel();
				this.renderAdminView();
				this.renderAssigneeView();
				this.renderApproverView();
				if($("input[data-type=taskType]:checked").attr('data-approver') == 'false') {
					$('#approverDiv').hide();
				}
				if (this.isCreate) {
					this.folder.getPredefinedField().done(function(resp) {
						self.renderFieldView(resp);
					});
					$("#delete").hide();
				}else{
					$("#delete").show();
				}
				
				if(folderData.taskTypes.length < 1){
					$.goAlert(taskLang['관리자 문의'],taskLang['업무유형없음'], '', commonLang['확인']);
				}
				
				return this;
			},
			changeDept : function() {
				_.each($("#shareDeptList").find("tr"), function(dept) {
					if ($("#deptId").val() == dept.getAttribute("id")) $(dept).remove();
				});
				$("#shareDeptList").find("tr:first").replaceWith(this.getDeptView(this.getCurrentDept(true)));
				this.renderAdminView();
					// IE11 에서 selectbox 를 변경하면 모든 input 이 작동하지 않는 문제가 있다.(GO-16528 업무 폴더 생성 -> 위치 콤보값 선택 버그)
				if(!!navigator.userAgent.match(/Trident.*rv[ :]*11\./)){
					var self = this;
					setTimeout(function() {
						var template = Hogan.compile(
								'<select id="deptId" name="" value="{{data.deptId}}" {{^isCreate}}disabled="disabled"{{/isCreate}}>' +
								'{{{departmentList}}}' +
								'</select>'
						);
						var deptId = self.$("#deptId").val();
						self.$("#deptId").remove();
						self.$("#deptSelectArea").html(template.render({
							departmentList : self.getDepartmentList(self.folder.get("deptId")),
							isCreate : self.isCreate,
							data : self.folder.toJSON()
						}));
						
						self.$("#deptId").val(deptId);
					}, 1);
				}
			},
			
			
			getDepartmentList : function(selectedId) {
				return this.folder.id ? 
					"<option value=" + this.folder.get("deptId") + ">" + this.folder.get("departmentName") + "</option>" 
					: this.joindDepartment.join("");
			},
			
			changeTaskType : function(e) {
				if ($(e.target).attr('data-approver') == "true") {
					$('#approverDiv').show();
				} else {
					$('#approverDiv').hide();
					$("#nameTag_approver").find("li[data-id]").first().remove();
				}
			},
			
			toggleTagView : function(e) {
				if ($(e.target).val() == "true") {
					$("#tagView").show();
					$("#tagRequired").show();
				} else {
					$("#tagView").hide();
					$("#tagRequired").hide().find("input").attr("checked", false);
				}
			},
			
//			toggleAssignee : function(e) {
//				var self = this;
//				if ($(e.target).prop('checked') == true) {
//					_.each($('#nameTag_assignee li'), function(nameTag) {
//						if ($(nameTag).attr('data-id') == self.getSessionUser().id.toString()) {
//							$.goError(taskLang["담당자가 이미 존재합니다."], $("#nameTag_assignee"), false, true);
//							$(e.target).prop('checked', false);
//						}
//					});
//				}
//			},
			
			addTag : function() {
				var errorArea = $("#tagError");
				errorArea.siblings(".go_error").remove();
				
				var tagName = $("#tagInput").val();
				if (tagName == "") return false;
				if (tagName.length > 40) {
					$.goError(GO.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."], {"arg1" : "40"}), errorArea, false);
					return;
				}
				if (_.contains(this.getTags(), tagName)) {
					$.goError(taskLang["분류명이 이미 존재합니다."], errorArea, false);
					return;
				}
				
				var tagItem = new TagItem({name : tagName});
				$("#tagList").append(tagItem.el);
				$("#tagInput").val("");
				$("#tagInputLength").text(0);
			},
			
			
			lengthCheck : function(e) {
				var context = $(e.currentTarget);
				var length = context.val().length;
				$("#" + context.attr("id") + "Length").text(length);
				if (length > 40) $.goError(GO.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."], {"arg1" : "40"}), context.parents("div.wrap"), false);
				else $(".go_error").remove();
			},
			
			
			renderTagView : function() {
				_.each(this.folder.get("tags"), function(tag){
					var tagItem = new TagItem({name : tag});
					$("#tagList").append(tagItem.el);
				});
			},
			
			
			addField : function() {
				var errorArea = $("#fieldError");
				errorArea.siblings(".go_error").remove();
				
				var fieldName = $("#fieldInput").val();
				if (fieldName == "") return;
				if (fieldName.length > 40) {
					$.goError(GO.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."], {"arg1" : "40"}), errorArea, false);
					return;
				}
				
				var fieldType = $("#fieldType").val();
				if (fieldType == "") {
					$.goError(taskLang["타입을 선택해 주세요."], errorArea, false, true);
					return false;
				};
				
				var data = {
						id : undefined,
						name : fieldName, 
						type : fieldType,
						required : fieldType == "SELECT" ? true : false,
						defaultValue : false,
						options : [],
						message : ""
				};
				
				var fieldItem = new FieldItem(data);
				fieldItem.$el.data("instance", data);
				fieldItem.fieldPopup();
				
				$("#fieldList").append(fieldItem.el);
				$("#fieldInput").val("");
				$("#fieldType").val("");
				$("#fieldInputLength").text(0);
			},
			
			
			renderFieldView : function(fields) {
				_.each(fields, function(field){
					var fieldItem = new FieldItem(field);
					fieldItem.$el.data("instance", field);
					$("#fieldList").append(fieldItem.el);
				});
			},
			
			
			toggleShareView : function(e) {
				if ($(e.target).val() == "true") {
					$("#department").hide();
					$("#company").show();
					this.revertDeptView();
				} else {
					var deptListEl = $("#shareDeptList");
					
					if (!deptListEl.find("tr[id=" + $("#deptId").val() + "]").length) {
						deptListEl.append(this.getDeptView(this.getCurrentDept(true)));
					}
					
					$("#department").show();
					$("#company").hide();
					this.revertCompanyView();
				}
			},
			
			
			revertDeptView : function() {
				var deptView = $("#shareDeptList");
				deptView.find("tr:not([id=" + $("#deptId").val() + "])").remove();
				deptView.find("input[type=checkbox]").attr("checked", false);
				deptView.find("input[value=all]").attr("checked", true);
				deptView.find("li[data-id]").remove();
			},
			
			
			revertCompanyView : function() {
				$("#limit-none").attr("checked", true);
				$("#domainCodeSelect").hide();
				$("#domainCodeView").find("li").remove();
			},
			
			
			getDeptView : function(data) {
				var shareDeptItem = new ShareDeptItem(data);
				
				return shareDeptItem.el;
			},
			
			
			renderShareDeptView : function() {
				if (this.isCreate) $("#shareDeptList").append(this.getDeptView(this.getCurrentDept(true)));
				
				_.each(this.folder.getDepartmentShares(), function(deptShare){
					this.addShareDept(this.deptShareModelParser(deptShare));
				}, this);
			},

			
			deptShareModelParser : function(data) {
				return {
					id : data.id,
					nodeId : data.nodeId,
					nodeType : data.nodeType,
					name : data.nodeValue,
					cascade : data.nodeType == "subdepartment",
					members : data.members,
					defaultFlag : this.folder.get("deptId") == data.nodeId
				};
			},
			
			
			showDeptTree : function() {
				$.goOrgSlide({
					header : taskLang["공유 부서 선택"],
					type : "department",
					contextRoot : GO.contextRoot,
					callback : $.proxy(function(info) {
						if (info.type == "root") return;
						this.addShareDept({
							id : null,
							nodeId : info.id,
							name : info.name
						});
					}, this)
				});
			},
			
			
			addShareDept : function(data) {
				if ($("#shareDeptList").find("tr#" + data.nodeId).length) return;
				
				$("#shareDeptList").append(this.getDeptView(data));
			},
			
			
			toggleLimitView : function(e) {
				if ($(e.target).val() == "true") {
					$("#domainCodeSelect").show();
					$("#domainCodeView").show();
				} else {
					$("#domainCodeSelect").hide();
					$("#domainCodeView").hide();
				}
			},
			
			
			changeDomainCode : function(e) {
				var self = this;
				var type = $(e.target).val();
				var domainCodeEl = [];
				
				domainCodeEl.push('<option value="">** ' + commonLang["선택"] + ' **</option>');
				
				this.domainCode.getList(type).done(function(domainCode) {
					var domainCodes = domainCode.toJSON();
					_.each(domainCodes, function(domainCode) {
						domainCodeEl.push(self.getDomainCodeItem(domainCode));
					});
					$("#domainCodes").html(domainCodeEl);
				});
			},
			
			
			getDomainCodeItem : function(data) {
				return "<option value="+ data.id + ">" + data.name + "</option>";
			},
			
			
			addDomainCodeLabel : function() {
				var codeType = $("#changeDomainCode").find("option:selected");
				var value = $("#domainCodes").find("option:selected");
				var id = value.val();
				var list = $("#domainCodeView"); 
								
				if (!id || list.find("li[data-id=" + id + "]").length) return;
				
				var item = new DomainCodeLabelItem({
					nodeId : id,
					nodeValue : value.text(),
					nodeType : codeType.val(),
					codeLabel : codeType.text()
				});
				list.append(item.el);
			},
			
			
			renderDomainCodeLabel : function() {
				if (!this.folder.get("publicShare")) return;
				
				var self = this;
				var list = $("#domainCodeView");
				
				_.each(this.folder.getDomainCodeShares(), function(domainCodeShare){
					var item = new DomainCodeLabelItem({
						id : domainCodeShare.id,
						nodeId : domainCodeShare.nodeId,
						nodeType : domainCodeShare.nodeType,
						nodeValue : domainCodeShare.nodeValue,
						codeLabel : self.getDomainCodeLabel(domainCodeShare.nodeType.toUpperCase())
					});
					list.append(item.el);
				});
			},
			
			
			renderAdminView : function() {
				var self = this;
				var nameTag = NameTagView.create({}, {useAddButton : true});
				
				$("#nameTag").html(nameTag.el);
				
				if (this.isCreate) this.renderDefaultAdmin(nameTag); 
				
				_.each(this.folder.get("admins"), function(admin){
					nameTag.addTag(admin.id, admin.name + " " + admin.position || "", {removable : true}, admin);
				}, this);
				
				nameTag.$el.on('nametag:clicked-add', function(e, nameTag) {
					$.goOrgSlide(self.getOrgOption(nameTag, 'admins'));
				});
			},
			
			renderApproverView : function() {
				var self = this;
				var nameTag = NameTagView.create({}, {useAddButton : true});
				$("#nameTag_approver").html(nameTag.el);
				nameTag.$el.on('nametag:clicked-add', function(e, nameTag) {
					$.goOrgSlide(self.getOrgOption(nameTag, 'approver'));
				});
				var approver = this.folder.get("approver");
				if (!approver) return;
//				if (this.isCreate) this.renderDefaultAdmin(nameTag); 
				nameTag.addTag(approver.id, approver.name + " " + approver.position || "", {removable : true}, approver);
				
			},
			
			renderAssigneeView : function() {
				var self = this;
				var nameTag = NameTagView.create({}, {useAddButton : true});
				$("#nameTag_assignee").html(nameTag.el);
				
				nameTag.$el.on('nametag:clicked-add', function(e, nameTag) {
					$.goOrgSlide(self.getOrgOption(nameTag, "assignees"));
				});
				var assignees = this.folder.get("assignees");
				if (!assignees) return;
				
				_.each(assignees, function(assignee){
					nameTag.addTag(assignee.id, assignee.name + " " + assignee.position || "", {removable : true}, assignee);
				}, this);				
				$('input[name=assignee]').prop('checked', this.folder.get('defaultAssignee'));
			},
			
			renderDefaultAdmin : function(nameTag) {
				var session = GO.session();
				nameTag.addTag(session.id, session.name + " " + session.position || "", {removable : true}, {deptId : $("#deptId").val()});
			},
			
			
			goBack : function() {
				window.history.back();
			},
			
			
			deleteConfirm : function() {
				var self = this;
				
				$.goConfirm(taskLang["폴더 삭제"],taskLang["폴더 삭제 설명"],
					function() {
		                $.ajax({
		                    type : "DELETE",
		                    dataType : "json",
		                    url : GO.contextRoot + "api/task/folder/" + self.id,
		                    success : function(resp) {
		                    	$.goMessage(commonLang["삭제되었습니다."]);
		                    	App.router.navigate("task", true);
		                    },
		                    error : function(resp) {
		                    	$.goAlert(commonLang['실패했습니다.']);
		                    }
		                });
					});
			},
						
			submit : function() {
				var folderData = {
					deptId : $("#deptId").val(),
					name : $("#name").val(),
					description : $("#description").val(),
					types : this.getTypes(),
					tags : this.getTags(),
					tagAllowed : this.getTagAllowed(), 
					tagRequired : this.getTagAllowed() ? $("#tag-required").is(":checked") : false,
					fields : this.getFields(),
					privateTask : GO.util.toBoolean(this.$el.find("input[name=private]:checked").val()),
					referersAllowed : GO.util.toBoolean(this.$el.find("input[name=referer]:checked").val()),
					share : this.getShare(),
					admins : this.getAdmins(),
					approver : this.getApprover(),
					assignees : this.getAssignees(),
					publicShare : this.isCompanyShare(),
					defaultAssignee : this.getDefaultAssignee()
				};
				
				if(!this.validate(folderData)) return;
				
				this.folder.set(folderData);
				this.folder.save({},{
					success : function(folder) {
						GO.util.store.set("taskFolderId", null, {type : "session"});
						$(document).scrollTop(0);
						App.router.navigate("task/folder/" + folder.id + "/task", true);
					},
	    			error : function(model, resp) {
	    				var errorName = resp.responseJSON.name;
	    				var errorMessage = resp.responseJSON.message;
	    				if (errorName == "task.not.accessable.admin") {
	    					$.goError(errorMessage, $("#nameTag"), false, true);
	    				} else if (errorName == "task.not.accessable.approver") {
	    					$.goError(errorMessage, $("#nameTag_approver"), false, true);
	    				} else if (errorName == "task.not.accessable.assignee") {
	    					$.goError(errorMessage, $("#nameTag_assignee"), false, true);
	    				} else if (errorName == "task.invalid.circle.member") {
	    					$.goError(errorMessage, $("#department"), false, true);
	    				} else {
	    					$.goError(errorMessage);
	    				}
            		}
				});
			},
			
			
			validate : function(folder) {
	    		if (folder.name.length > 64 || folder.name.length < 2) {
	    			$.goError(App.i18n(commonLang["0자이상 0이하 입력해야합니다."],{arg1 : 2, arg2 : 64}), $("#name"), false, true);
	    			$("#name").focus();
	    			return false;
	    		}
	    		
	    		if (folder.description.length > 2000) {
	    			$.goError(App.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."],{arg1 : 2000}), $("#description"), false, true);
	    			$("#description").focus();
	    			return false;
	    		}
	    		
	    		if (!folder.types.length) {
	    			$.goError(taskLang["유형을 선택해 주세요."], $("#typeError"), false, true);
	    			$(document).scrollTop(0);
	    			return false;
	    		}
	    		
	    		return true;
	    	},
	    	
			
			getOrgOption : function(nameTag, type) {
				var header = "";
				
				if (type == "assignees") {
					header = taskLang["담당자"];
				} else if (type == "approver") {
					header = taskLang["승인자"];
				} else if (type == "admins") {
					header = taskLang["운영자"];
				}
				
				var option = {
					header : header + " " + commonLang["선택"],
					memberTypeLabel : header,
					externalLang : commonLang,
					contextRoot : GO.contextRoot,
					callback : $.proxy(function(info) {
						var datas = _.isArray(info) ? info : [info];
						if (datas[0].type == "org") return;
						
						if (type == "approver") {
							var approver = $("#nameTag_approver").find("li[data-id]").first(); 
							if (approver.length) $.goMessage(commonLang["변경되었습니다."]);
							approver.remove();
						} 
						nameTag.addTags(datas, { removable : true, "attr": datas });
					}, this)	
				};
				
				if (type == "approver") option["isOnlyOneMember"] = true;
				
				if (this.isCompanyShare()) {
		 	 	 	var domainCodeShares = this.getDomainCodeShares();
		 	 	 	                                      
		 	 	 	if ($("#limit-partial").is(":checked") && domainCodeShares.length) {
			 	 	 	var includeLoadIds = _.pluck(domainCodeShares, "nodeId");
			 	 	 	
			 	 	 	option["type"] = "domaincode";
			 	 	 	option["includeLoadIds"] = includeLoadIds;
		 	 	 	} else {
		 	 	 		option["type"] = "list";
		 	 	 	}
		 	 	 	option["isBatchAdd"] = true;
	 	 	 	} else {
	 	 	 		option["circle"] = this.getShare();
	 	 	 		option["type"] = "circle";
	 	 	 		option["method"] = "POST";
	 	 	 	}
				
				return option;
			},
			
			
			getCurrentDept : function(defaultFlag) {
				return {
					id : $("#deptId").val(),
					name : $("#deptId").find("option:selected").text(),
					defaultFlag : defaultFlag
				};
			},
			
			
			getTypes : function() {
				var types = []; 
				$.each($("input[data-type=taskType]:checked"), function(idx, type){
					types.push({
						id : $(type).val(),
						name : $(type).parents("span").find("label").text()
					});
				});
				
				return types;
			},
			
			
			getTags : function() {
				var tags = [];
				if (!GO.util.toBoolean($("input[name=tag]:checked").val())) return tags;
				
				$.each($("#tagList").find("tr"), function(idx, tag) {
					var context = $(tag);
					tags.push(context.find("input").val());
				});
				return tags;
			},
			
			
			getTagAllowed : function() {
				return this.getTags().length ? true : false;
			},
			
			
			getFields : function() {
				var fields = [];
				$.each($("#fieldList").find("tr"), function(idx, field) {
					fields.push($(field).data().instance);
				});
				return fields;
			},
			
			
			isDomainCodeShare : function() {
	    		return this.getDomainCodeShares().length > 0;
	    	},
			
			
			isCompanyShare : function() {
				return GO.util.toBoolean(this.$el.find("input[name=share]:checked").val());
			},
			
			
			getShare : function() {
				return {
					id : this.folder.get("share").id || null,
					nodes : this.getNodes()
				};
			},
			
			
			getNodes : function() {
				if (this.isCompanyShare()) {
					return this.isDomainCodeShare() ? this.getDomainCodeShares() : this.getDefaultNode();
				} else {
					return this.getDepartmentShares();
				}
			},
			
			
			isLimit : function() {
				return GO.util.toBoolean(this.$el.find("input[name=limit]:checked").val());
			},
			
			
			getDomainCodeShares : function() {
				var domainCodes = [];
				
				if (!this.isLimit()) {
					return domainCodes;
				}
				
				$.each($("#domainCodeView").find("li"), function(idx, domainCode) {
					var node = $(domainCode).data().instance;
					domainCodes.push({
						nodeId : node.nodeId,
						nodeValue : node.nodeValue,
						nodeType : node.nodeType
					});
				});
				return domainCodes;
			},
			
			
			getDomainCodeLabel : function(type) {
				switch (type) {
				case "DUTY":
					return taskLang["직위"];
					break;
				case "GRADE":
					return taskLang["직급"];
					break;
				case "POSITION":
					return taskLang["직책"];
					break;
				case "USERGROUP":
					return taskLang["사용자그룹"];
					break;
				default:
					return "";
					break;
				}
			},
			
			
			getDepartmentShares : function() {
				var departments = [];
				$.each($("#shareDeptList").find("tr"), function(idx, dept) {
					departments.push({
						id : dept.getAttribute("data-circleId"),
						nodeId : dept.getAttribute("id"),
						nodeType : $(dept).find("input[type=checkbox]").is(":checked") ? "subdepartment" : "department",
						nodeValue : $(dept).find("span.txt:first").text(),
						members : $.map($(dept).find("li[data-id]"), function(member) {
							var namePosition = $(member).find("span.name").text().split(" ");
							return {
								id : member.getAttribute("data-id"),
								name : namePosition[0],
								email : "",
								position : namePosition[1],
								thumbnail : ""
							};
						})
					});
				});
				return departments;
			},
			
			
			getAdmins : function() {
				var admins = [];
				$.each($("#nameTag").find("li[data-id]"), function(idx, adminTag) {
					admins.push({
						id : adminTag.getAttribute("data-id"),
						name : "",
						email : "",
						position : adminTag.getAttribute("data-position"),
						thumbnail : ""
						
					});
				});
				return admins;
			},
			
			getApprover : function() {
				var approverTag = $("#nameTag_approver").find("li[data-id]");
				var approver = {
						id : approverTag.attr('data-id') || 0,
						name : "",
						email : "",
						position : approverTag.attr("data-position"),
						thumbnail : ""
				};
				return approver;
			},
			
			getAssignees : function() {
				var assignees = [];
				$.each($("#nameTag_assignee").find("li[data-id]"), function(idx, assigneeTag) {
					assignees.push({
						id : assigneeTag.getAttribute("data-id"),
						name : "",
						email : "",
						position : assigneeTag.getAttribute("data-position"),
						thumbnail : ""
						
					});
				});
				return assignees;
			},
			
			getDefaultAssignee : function() {
				return $('input[name=assignee]').prop('checked');
			},
			
			getDefaultNode : function() {
	    		return [{
	    			id : null,
	    			nodeId : GO.session().companyId,
	    			nodeType : "company",
	    			nodeValue : GO.session().companyName,
	    			members : []
	    		}];
	    	}
		});
		return TaskFolderView;
	});
}).call(this);