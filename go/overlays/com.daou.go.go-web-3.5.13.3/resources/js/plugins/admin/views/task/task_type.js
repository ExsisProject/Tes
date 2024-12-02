;(function() {
	define([
			"backbone",
			
			"i18n!nls/commons",
			"i18n!admin/nls/admin",
			"i18n!task/nls/task",
			
			"hgn!admin/templates/task_type",
			"admin/views/task/task_state_item",
			"admin/views/task/task_flow_item",
			
			"admin/collections/task_states",
			"admin/collections/task_flows",
			"admin/models/task_state",
			"admin/models/task_flow",
			"admin/models/task_type",
			
			"jquery.go-validation"
	], 
	function(
			Backbone,
			
			commonLang,
			adminLang,
			taskLang,
			
			TaskTypeTpl,
			StateItemView,
			FlowItemView,
			
			States,
			Flows,
			State,
			Flow,
			Type
	) {
		var lang = {
			task : taskLang["업무"],
			"DUEDATE" : taskLang["기한"],
			"ASSIGNEE" : taskLang["담당자"],
			"ETC" : taskLang["나머지 항목"],
			"REGISTRANT" : taskLang["등록자"],
			"ADMIN" : taskLang["운영자"],
			"REFERER" : taskLang["참조자"],
			"APPROVER" : taskLang["승인자"],
			typeAdministration : adminLang["업무 유형 관리"],
			typeName : adminLang["유형명"],
			typeDescription : adminLang["유형 설명"],
			status : adminLang["상태"],
			add : commonLang["추가"],
			letter : taskLang["자"],
			statusName : adminLang["상태명"],
			completionStatus : adminLang["완료 상태"],
			destroy : commonLang["삭제"],
			workFlow : adminLang["상태흐름"],
			startStatus : adminLang["시작 상태"],
			nextStatus : adminLang["다음 상태"],
			statusModifierButton : adminLang["상태변경버튼"],
			statusModifiers : adminLang["상태 변경자"],
			notificationTarget : adminLang["상태 변경 알림대상"],
			administration : commonLang["관리"],
			modifyPermissions : adminLang["업무수정 권한"],
			deleteTaskPermissions : adminLang["업무삭제 권한"],
			item : adminLang["항목"],
			fixPermissions : adminLang["수정권한"],
			deletePermissions : adminLang["삭제권한"],
			revisedNotificationTargets : adminLang["수정 후 알림대상"],
			availability : adminLang["사용여부"],
			hide : adminLang["숨김"],
			normal : adminLang["정상"],
			confirm : commonLang["저장"],
			cancel : commonLang["취소"],
			statusModifyDescription : adminLang["상태 변경 알림"]
		};
		
		var EditPermissionTpl = Hogan.compile(
			'{{#attributes}}' +
			'<tr>' +
				'<td class="item">{{lang}}</td>' +
				'<td class="right" data-value="{{attr_value}}" data-type="Privileges">' +
					'{{#roles}}' +
					'<span class="option_wrap">' + 
						'<input type="checkbox" value="{{value}}" id="{{attr_value}}_auth_{{value}}">' +
						'<label for="{{attr_value}}_auth_{{value}}">{{lang}}</label>' + 
					'</span>' +
					'{{/roles}}' +
				'</td>' +
				'<td class="noti" data-value="{{attr_value}}" data-type="Pushes">' +
					'{{#roles}}' +
					'<span class="option_wrap">' + 
						'<input type="checkbox" value="{{value}}" id="{{attr_value}}_noti_{{value}}">' +
						'<label for="{{attr_value}}_noti_{{value}}">{{lang}}</label>' + 
					'</span>' +
					'{{/roles}}' +
				'</td>' +											
			'</tr>' +
			'{{/attributes}}'
		);
		
		var ATTRIBUTES = [{
			attr_value : "DUEDATE",
			lang : lang.DUEDATE
		}, {
			attr_value : "ASSIGNEE",
			lang : lang.ASSIGNEE
		}, {
			attr_value : "ETC",
			lang : lang.ETC
		}];
		
		
		var ROLES = [{
			value : "REGISTRANT",
			lang : lang.REGISTRANT
		}, {
			value : "ASSIGNEE",
			lang : lang.ASSIGNEE
		}, {
			value : "ADMIN",
			lang : lang.ADMIN
		}, {
			value : "REFERER",
			lang : lang.REFERER
		}, {
			value : "APPROVER",
			lang : lang.APPROVER
		}];
		
		
		var ETCS = ["APPROVER", "CONTENT", "FIELD", "NAME", "PRIVATETASK", "REFERER", "TAG"];
		
		var TaskTypeView = Backbone.View.extend({
			
			events : {
				"click #addState" : "addState",
				"keypress #stateName" : "enterEventHandler",
				"click #stateList span.ic_delete" : "deleteStateAction",
				"click #flowList span.ic_delete" : "deleteFlow",
				"click #flowList span.ic_row_add" : "addFlow",
				"click input[type=checkbox]" : "setRoles",
				"click #submit" : "submit",
				"click #cancel" : "cancel",
				"keyup #stateName" : "lengthCheck"
			},
			
			
			initialize : function(options) {
				this.options = options;
				this.type = new Type(options.id);
				if (this.type.id) this.type.fetch({async : false}); 
				if (options.copy) this.typeCopy();
				
				this.states = new States(this.type.get("taskStatuses"));
				this.flows = new Flows(this.type.get("transitions"));
				
				this.editable = this.type.id ? false : true;
				
				this.flows.addFirstFlow(this.states.firstFlow().get("name"), this.type.get("addPushes"));
			},
			
			
			render : function() {
				this.$el.html(TaskTypeTpl({
					lang : lang,
					model : this.type.toJSON(),
					isShow : this.type.isShow(),
					editable : this.editable
				}));
				
				this.addAllStates();
				this.addAllFlows();
				
				this.renderEditPermissionView();
				this.renderDeletePrivileges();
				
				
				return this;
			},
			
			
			typeCopy : function() {
				var taskStatuses = this.type.get("taskStatuses");
				var transitions = this.type.get("transitions");
				
				_.each(taskStatuses, function(taskStatus) {
					taskStatus.id = null;
				});
				_.each(transitions, function(transition) {
					transition.id = null;
				});
				
				this.type.id = null;
				this.type.set("id", null);
				this.type.set("appliedFolders", 0);
				this.type.set("taskStatuses", taskStatuses);
				this.type.set("transitions", transitions);
			},
			
			
			enterEventHandler : function(e) {
				if (e.which == 13) this.addState();
			},
			
			
			addState : function() {
				var name = this.$("#stateName").val().trim();
				if (!$.goValidation.isCheckLength(2, 10, name)) {
					$.goError(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"10"}), $("#stateName").siblings("br"), false, true);
					$("#stateName").focus();
					return;
				}
				
				if (this.states.findWhere({name : name})) {
					$.goError(GO.i18n(commonLang["이미 추가되어 있습니다."]), $("#stateName").siblings("br"), false, true);
					$("#stateName").focus();
					return;
				}
				
				var state = new State({name : name});
				this.$("#stateName").val("");
				this.states.add(state);
				this.StateAddOne(state);
				GO.EventEmitter.trigger("task", "change:states", this.states);
			},
			
			
			deleteStateAction : function(e) {
				var self = this;
				var target = $(e.currentTarget).parents("tr[data-type=state]");
				var state = this.states.get(target.data().instance);
				
				if (!state.id) {
					this.deleteState(state, target);
				} else {
					$.ajax({
						type : "GET",
						dataType : "json",
						url : GO.contextRoot + "ad/api/task/type/" + self.type.id + "/status/" + state.id,
						success : function(resp) {
							var isValid = resp.data.count > 0 ? false : true;
							if (!isValid) {
								self.showInvalidPopup(adminLang["삭제할 상태가 사용중"]);
							} else {
								self.deleteState(state, target);
							}
						},
						error : function(resp) {
							$.goError(resp.message);
						}
					});
				}
			},
			
			
			showInvalidPopup : function(message) {
				$.goPopup({
					title : adminLang["삭제 불가"], 
					message : message,
					buttons : [{
						btype : "confirm",
						btext : commonLang["확인"]
					}]
				});
			},
			
			
			deleteState : function(state, target) {
				this.states.remove(state);
				target.remove();
				GO.EventEmitter.trigger("task", "change:states", this.states);
			},
			
			
			addAllStates : function() {
				this.$("#stateList").find("tr").remove();
				this.states.each(function(state) {
					this.StateAddOne(state);
				}, this);
			},
			
			
			StateAddOne : function(state) {
				var stateItemView = new StateItemView({
					model : state,
					editable : this.editable
				});
				this.$("#stateList").append(stateItemView.render().el);
				stateItemView.$el.data("instance", state);
			},
			
			
			addFlow : function(e) {
				var target = $(e.currentTarget).parents("tr[data-type=flow]"),
					index = target.index();
				var flow = new Flow();
				this.flows.add(flow, {at: index + 1});
				this.addOneFlow(flow, target);
			},
			
			
			addAllFlows : function() {
				this.flows.each(function(flow) {
					this.addOneFlow(flow);
				}, this);
			},
			
			
			addOneFlow : function(flow, target) {
				var flowItemView = new FlowItemView({
					collection : this.states,
					model : flow,
					roles : ROLES
				});
				
				if (target) {
					target.after(flowItemView.render().el);
				} else {
					this.$("#flowList").append(flowItemView.render().el);
				}
				
				flowItemView.$el.data("instance", flow);
			},
			
			
			deleteFlow : function(e) {
				var flowItem = $(e.currentTarget).parents("tr[data-type=flow]");
				var flow = this.flows.get(flowItem.data().instance);
				this.flows.remove(flow);
				flowItem.remove();
			},
			
			
			renderEditPermissionView : function() {
				var permissionEl = this.$("#editPermissionList"); 
				permissionEl.html(EditPermissionTpl.render({
					lang : lang,
					attributes : ATTRIBUTES,
					roles : ROLES
				}));
				
				var registrantPrivilege = this.$("#editPermissionList").find("td[data-type=Privileges]").find("input[value=REGISTRANT]");
				registrantPrivilege.last().attr("disabled", true);
				
				this.type.id || this.options.copy ? this.markRoles() : this.markDefaultRole();
			},
			
			renderDeletePrivileges : function() {
				_.each(this.type.get('deletePrivileges'), function(value) {
					this.$('#deletePrivileges').find("input[value=" + value + "]").attr("checked", true);
				}, this);
			},
			
			getDeletePrivileges : function() {
				var deletePrivileges = [];
				_.each(this.$('#deletePrivileges').find("input:checked"), function(input) {
					deletePrivileges.push(input.value);
				}, this);

				return deletePrivileges;
			},
			
			markRoles : function() {
				var permissionEl = this.$("#editPermissionList");
				_.each(["Privileges", "Pushes"], function(type) {
					_.each(this.type.auths(type), function(auth) {
						if (auth.attribute == "NAME") auth.attribute = "ETC"; // ETC 는 NAME 을 참조
						var roleArea = permissionEl.find("td[data-type=" + type + "][data-value=" + auth.attribute + "]");
						_.each(auth.roles, function(role) {
							roleArea.find("input[value=" + role + "]").attr("checked", true);
						});
					});
				}, this);
			},
			
			markDefaultRole : function() {
				var roleArea = this.$("#editPermissionList");
				roleArea.find("input[value=REGISTRANT]").attr("checked", true);
				roleArea.find("input[value=ASSIGNEE]").attr("checked", true);
				roleArea.find("input[value=ADMIN]").attr("checked", true);
			},
			
			
			submit : function() {
				var self = this;
				var typeData = {
					name : this.$("#typeName").val(),
					description : this.$("#description").val(),
					approver : this.isApprover(),
					taskStatuses : this.getTaskStatuses(),
					addPushes : this.flows.firstNotiList(),
					editPrivileges : this.getRoles("Privileges"),
					editPushes : this.getRoles("Pushes"),
					deletePrivileges : this.getDeletePrivileges(),
					transitions : this.flows.transitions().toJSON(),
					status : this.getStatus()
				};
				
				if (!this.validate(typeData)) return;
				
				this.type.set(typeData);
				this.type.save({}, {
					success : function(e) {
						GO.router.navigate("task/types", {trigger : true, pushState : true});
					},
	    			error : function(model, resp) {
	    				if (resp.responseJSON.name == "task.failure.remove.taskstatus") {
	    					self.showInvalidPopup(resp.responseJSON.message);
	    				} else {
	    					$.goError(resp.responseJSON.message);
	    				}
            		}
				});
			},
			
			
			validate : function(data) {
				if (!$.goValidation.isCheckLength(2, 30, data.name)) {
					$.goError(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"30"}), $("#typeName"), false, true);
	    			$("#typeName").focus();
	    			return false;
				}
				
				if (!$.goValidation.isCheckLength(1, 200, data.description)) {
					$.goError(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"200"}), $("#description"), false, true);
					$("#description").focus();
					return false;
				}
				
				if (this.states.length < 1) {
					$.goError("상태는 1개 이상", $("#stateName").siblings("br"), false, true);
					$("#stateName").focus();
					return false;
				}
				
				if (!this.flowValidate()) {
					this.$("select.pause").first().focus();
					return false;
				} 
				
				return true;
			},
			
			
			flowValidate : function() {
				var isValid = true;
				
				_.each(this.$("#flowList").find("tr"), function(flow) {
					var flowEl = $(flow);
					var before = flowEl.find("select[data-type=before]");
					var after = flowEl.find("select[data-type=next]");
					var actionName = flowEl.find("input[type=text]");
					flowEl.find(".pause").removeClass("pause");
					
					if (before.length && !before.val()) {
						isValid = false;
						before.addClass("pause");
					}
					if (!after.val()) {
						isValid = false;
						after.addClass("pause");
					}
					if (actionName.length) {
						if (!actionName.val()) {
							isValid = false;
							actionName.addClass("pause");
						}
						if (actionName.val().length > 10 || actionName.val().length < 2) {
							$.goError(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"10"}), actionName, false, true);
							isValid = false;
							actionName.addClass("pause");
						}
					}
				}, this);
				
				return isValid;
			},
			
			
			getStatus : function() {
				return this.$("input[name=status]:checked").attr("id");
			},
			
			
			isApprover : function() {
				return this.$("input[value=APPROVER]:checked").length > 0;
			},
			
			
			getTaskStatuses : function() {
				var name = this.flows.at(0).get("nextStatus");
				if (!name) return;
				var states = this.states.clone();
				var state = states.findWhere({name : name});
				if (!state) return;
				state.set("start", true);
				return states.toJSON();
			},
			
			
			getRoles : function(type) {
				var lists = [];
				_.each(this.$("td[data-type=" + type + "]"), function(group) {
					var roles = [];
					_.each($(group).find("input[type=checkbox]:checked"), function(role) {
						roles.push(role.getAttribute("value"));
					});
					var attribute = group.getAttribute("data-value");
					var attributes = attribute == "ETC" ? ETCS : [attribute];
					_.each(attributes, function(attr) {
						lists.push({
							attribute : attr,
							roles : roles
						});
					});
				});
				
				return lists;
			},
			
			
			lengthCheck : function(e) {
				var context = $(e.currentTarget);
				var length = context.val().trim().length;
				$("#stateNameLength").text(length);
				if (length > 10) $.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1 : 2, arg2 : 10}), context.siblings("br"), false);
				else $(".go_error").remove();
			},
			
			
			cancel : function() {
				GO.router.navigate("task/types", {trigger : true, pushState : true});
			}
		});
		
		return TaskTypeView;
	});
}).call(this);