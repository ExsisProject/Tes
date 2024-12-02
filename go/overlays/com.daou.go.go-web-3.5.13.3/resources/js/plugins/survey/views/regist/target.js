(function() {
    
    define([
        "jquery", 
        "underscore", 
        "backbone", 
        "app", 
        "helpers/form", 
        "i18n!nls/commons", 
        "i18n!survey/nls/survey", 
        "go-nametags", 
        "libraries/go-classcodepicker", 
    ], 
    
    function(
        $, 
        _, 
        Backbone,
        GO, 
        FormHelper,
        commonLang,
        SurveyLang, 
        NameTagListView, 
        ClassCodePicker
    ) {
                
        var
            tvars = {
                "label": {
                    "add_dept": SurveyLang["부서추가"], 
                    "dept_name": SurveyLang["부서명"], 
                    "include_child_dept": SurveyLang["하위 부서 포함하기"], 
                    "remove": SurveyLang["삭제"], 
                    "target_whole": SurveyLang["전사"], 
                    "target_part": SurveyLang["일부"], 
                    "select_dept": SurveyLang["부서 선택"], 
                    "select_class": SurveyLang["클래스 선택"], 
                    "select_user": SurveyLang["직접 선택"], 
                    "child_dept": SurveyLang["하위 부서"]
                }
            };
        
        var TargetView = Backbone.View.extend({
            initialize: function() {
                if(this.$el.data('targetview')) {
                    this.$el.data('targetview').release();
                }
                
                this.$el.data('targetview', this);
            }, 
            
            release: function() {
                this.$el.off();
                this.$el.empty();
                this.$el.data('targetview', null);
            }, 
            
            // interfaces
            getList: function() {
                return [];
            }
        });
        
        var UserView = (function() {
            
            return TargetView.extend({
                
                events: {
                    "click input[name=target]": "_toggleTargetUserList", 
                }, 
                
                render: function() {
                    var self = this;
                    $.ajax(GO.config('contextRoot') + 'api/department/list/joined').done(function(resp) {
                    	self.$el.append(makeTemplate(resp.data, tvars));
                    	
                    	if(GO.session("useOrg")){
                    	    initTargetOption(self);
                    	}else{
                    	    self.$el.find("span.wrap_option").hide();
                    	    createNameTag('#target-user-div', true, self.model.isCreator(GO.session("id")), self.model.getTargetNodes());
                    	}
                    });
                }, 
                
                isTargetAll: function() {
                    return false;
                }, 
                
                getList: function() {
                    var $target = $('input[name=target]:checked'), 
                    	targetId = $target.val(), 
                    	targetName = $target.data('name'), 
                        result = [];
                    
                    if($target.length > 0) {
                    	if(targetId === 'user') {
                            Array.prototype.push.apply(result, getTargetUserInfoList());
                        } else {
                            var isIncludeChild = $('input[name=target_child_' + targetId + ']:checked').length > 0;
                            addTargetList(result, targetId, (isIncludeChild ? 'sub': '') + 'department', targetName);
                        }
                    }
                    
                    return result;
                }, 
                
                _toggleTargetUserList: function(e) {
                	// 변경하면 하위부서 체크한 것을 모두 해제한다.
                	$('input[type=checkbox]').prop('checked', false);
                    toggleTargetUserList(e, this.model);
                }
                
            });
            
            function initTargetOption(view) {
        		var nodes = view.model.getTargetNodes();
        		
            	_.each(nodes, function(node) {
            		if(node.nodeType === 'user') {
            			if(!$('#radio-target-user').is(':checked')) {
            				$('#radio-target-user').trigger('click');
            			}
            		} else {
            			if(!$('#radio-target-' + node.nodeId).is(':checked')) {
            				$('#radio-target-' + node.nodeId).trigger('click');
            			}
            			
            			if(node.nodeType === 'subdepartment') {
            				$('input[name=target_child_' + node.nodeId + ']').trigger('click');
            			}
            		}
            	});
        	}
            
            function getTargetUserInfoList() {
                var instance = $('#target-user-div').data('instance'), 
                    tagList = instance.getNameTagList(), 
                    result = [];
                
                _.each(tagList, function(tag) {                        
                    addTargetList(result, tag.id, 'user', tag.displayName);
                });
                
                return result;
            }
            
            function makeTemplate(deptList, tvars) {
                var html = [];
                _.each(deptList, function(v, i) {
                	if(GO.session("useOrg")) {
	                    html.push(FormHelper.radio('target', v.id, { "label": v.name, "checked": (i === 0), "attrs": {"data-name": v.name, "data-type": 'department'} }));
	                    
	                    if(v.childrenCount > 0) {
	                        html.push('(');
	                        html.push(FormHelper.checkbox('target_child_' + v.id, 'Y', { "label": tvars.label.child_dept }));
	                        html.push(')');
	                    }
	                    
	                    html.push('<br />');
                	}
                });
                
                if(!GO.session("useOrg")){
                    html.push(FormHelper.radio('target', 'user', { "label": tvars.label.select_user, "attrs": {"data-type": 'user', "checked" : "checked"} }));
                    html.push("<div id='target-user-div' class='wrap_name_tag'>");
                    html.push("</div>");
                }else{
                    html.push(FormHelper.radio('target', 'user', { "label": tvars.label.select_user, "attrs": {"data-type": 'user'} }));
                }
                
                return html.join("\n");
            }
            
        })(TargetView);
        
        var AdminView = (function() {
            
            return TargetView.extend({
                events: {
                    "change select[name=target_type]": "_setTargetOption", 
                    "click #checkbox-targetpart-dept": "_toggleTargetDeptList", 
                    "click #checkbox-targetpart-class": "_toggleTargetClassList", 
                    "click #checkbox-targetpart-user": "_toggleTargetUserList", 
//                    "click #btn-add-dept": "_callOrgSlideForDept", 
                    "click #target-dept-table .btn-remove": "_removeTargetDept" 
                }, 
                
                initialize: function() {
                	TargetView.prototype.initialize.apply(this, arguments);
                	this.classCodePicker = new ClassCodePicker({"id": "target-class-div"});
                }, 
                
                render: function() {
                    this.$el.append(makeTemplate());
                    initSelectTargetOpt(this);
                }, 
                
                isTargetAll: function() {
                    return $('select[name=target_type]').val() === 'whole';
                }, 
                
                getList: function() {
                    var targetType = $('select[name=target_type]').val(), 
                        targetList = [];
                    
                    if(targetType === 'part') {
                        
                        if($('#checkbox-targetpart-dept').is(":checked")) {
                            Array.prototype.push.apply(targetList, this.getTargetDeptInfoList());
                        }
                        
                        if($('#checkbox-targetpart-class').is(":checked")) {
                            Array.prototype.push.apply(targetList, this.getTargetClassInfoList());
                        }
                        
                        if($('#checkbox-targetpart-user').is(":checked")) {
                            Array.prototype.push.apply(targetList, this.getTargetUserInfoList());
                        }
                    }
                    
                    return targetList;
                }, 
                
                getTargetDeptInfoList: function() {
                    var result = [];
                    $('#target-dept-table > tbody > tr').each(function(idx, el) {
                        var deptId = $(el).data('id'), 
                            deptName = $(el).data('name'), 
                            type = ($(el).find('input[name=target_dept_id]:checked').length > 0 ? 'sub' : '') + 'department';
                        
                        addTargetList(result, deptId, type, deptName);
                    });
                    
                    return result;
                }, 
                
                getTargetClassInfoList: function() {
                    var result = [];
                    $('#target-class-div ul.list_option li').each(function(idx, el) {
                        addTargetList(result, $(el).data('id'), $(el).data('type'), $(el).data('name'));
                    });
                    
                    return result;
                }, 
                
                getTargetUserInfoList: function() {
                    var instance = $('#target-user-div').data('instance'), 
                        tagList = instance.getNameTagList(), 
                        result = [];
                                        
                    _.each(tagList, function(tag) {
                        addTargetList(result, tag.id, 'user', tag.displayName);
                    });
                    
                    return result;
                },
                
                showTargetOption: function() {
                    $('#survey-target-option').show();
                }, 
                
                hideTargetOption: function() {
                    $('#survey-target-option').hide();
                },
                
                _setTargetOption: function(e) {
                    var selected = $(e.currentTarget).val();
                    
                    if(selected === 'part') {
                        this.showTargetOption();
                    } else {
                        this.hideTargetOption();
                    }
                }, 
                
                _toggleTargetDeptList: function(e) {
                    var $taget = $(e.currentTarget);
                    if($taget.is(':checked')) {
                        if($('#target-dept-div').length < 1) {
                            $taget.parent().after(makeDeptListDiv());
                        }
                        
                        $('#target-dept-div').show();
                    } else {
                        $('#target-dept-div').hide();
                    }
                }, 
                
                _toggleTargetClassList: function(e) {
                    var $taget = $(e.currentTarget);
                    if($taget.is(':checked')) {
                        if($('#target-class-div').length < 1) {
                            $taget.parent().after(this.classCodePicker.el);
                            this.classCodePicker.render();
                        }
                        
                        $('#target-class-div').show();
                    } else {
                        $('#target-class-div').hide();
                    }
                }, 
                
                _toggleTargetUserList: function(e) {
                    toggleTargetUserList(e, this.model);
                }, 
                
//                _callOrgSlideForDept: function(e) {
//                    $.goOrgSlide({
//                        header : SurveyLang["부서 추가"],
//                        type: 'department', 
//                        desc : SurveyLang["설문 대상 부서를 아래에서 선택하세요"],
//                        contextRoot : GO.config("contextRoot"),
//                        callback : $.proxy(function(info) {
//                            if(isNewTargetDept(info.id)) {
//                                $('#target-dept-table tbody').append(makeTargetDeptTableRow(info));
//                            }
//                        }, this)
//                    });
//                }, 
                
                _removeTargetDept: function(e) {
                    $(e.target).closest('tr').remove();
                }                
            });
            
            function initSelectTargetOpt(view) {
            	var $el = view.$el.find('select[name=target_type]');
            	
            	if(view.model.isTargetCompany()) {
            		$el.val('whole');
                } else {
                	$el.val('part');
                }
            	$el.trigger('change');
            	
            	initTargetPart(view);
            }
            
            function initTargetPart(view) {
            	if(view.model.isTargetCompany()) return;
            	
            	var nodes = view.model.getTargetNodes();

            	_.each(nodes, function(node, i) {
            		var nodeId = node.nodeId,
            			nodeType = node.nodeType, 
            			nodeValue = node.nodeValue;
            		
            		if(_.contains(['department', 'subdepartment'], nodeType)) {
            			if(!$('#checkbox-targetpart-dept').is(':checked')) {
            				$('#checkbox-targetpart-dept').trigger('click');
            			}
            			
            			$('#target-dept-table tbody').append(makeTargetDeptTableRow({
            				"id": node.nodeId, 
            				"name": node.nodeValue
            			}, nodeType === 'subdepartment'));
            		} else if(_.contains(['position', 'grade', 'duty', 'usergroup'], nodeType)) {
            			if(!$('#checkbox-targetpart-class').is(':checked')) {
            				$('#checkbox-targetpart-class').trigger('click');
            			}
            			
            			view.classCodePicker.addClassCode(nodeId, nodeType, nodeValue);
            		} else if(nodeType === 'user') {
            			if(!$('#checkbox-targetpart-user').is(':checked')) {
            				$('#checkbox-targetpart-user').trigger('click');
            			}
            		}
            	});
            }
            
            function makeTemplate(selectedType) {
                var html = [], 
                    typeList = [
                        {"value": 'whole', "label": tvars.label.target_whole}, 
                        {"value": 'part', "label": tvars.label.target_part}
                    ];
                
                html.push(FormHelper.select("target_type", typeList, selectedType || 'whole'));
                html.push('<div id="survey-target-option" style="display:none">');
                
                _.each({
                    "dept": tvars.label.select_dept, 
                    "class": tvars.label.select_class, 
                    "user": tvars.label.select_user
                }, function(v, k) {
	                if(k != 'dept'){
	                	html.push(FormHelper.checkbox( 'targetpart', k, { "label": v } ) + '<br />');
	                }
                });
                
                html.push('</div>');
                
                return html.join("\n");
            }
            
//            function isNewTargetDept(deptId) {
//                return $('#target-dept-table tr.target-dept-' + deptId).length < 1;
//            }
            
            function makeDeptListDiv() {
                var html = [];
                
                html.push('<div id="target-dept-div" class="option_display" style="display:none">');
                    html.push('<span id="btn-add-dept" class="btn_wrap"><span class="ic_form ic_addlist"></span><span class="txt">' + tvars.label.add_dept + '</span></span>');
                    html.push('<table id="target-dept-table" class="type_normal tb_list_sub list_survey002">');
                        html.push('<caption>' + tvars.label.add_dept + '</caption>');
                        html.push('<thead>');
                            html.push('<tr>');
                            _.each({
                                "name": tvars.label.add_dept,
                                "option": tvars.label.include_child_dept,
                                "action": tvars.label.remove,
                            }, function(label, classname) {
                                html.push('<th class="sorting_disabled ' + classname + '"><span class="title">' + label + '</span></th>');
                            });
                            html.push('</tr>');
                        html.push('</thead>');
                        html.push('<tbody></tbody>');
                    html.push('</table>');
                html.push('</div>');
                
                return html.join("\n");
            }
            
            function makeTargetDeptTableRow(info, isSubType) {
            	isSubType = isSubType || false;
            	
                var html = [];
                html.push('<tr class="target-dept-', info.id, '" data-id="' + info.id + '" data-name="' + info.name + '">', "\n");
                    html.push('<td class="name"><span class="txt">', info.name, '</span></td>', "\n");
                    html.push('<td class="option"><span class="wrap_single_form"><input type="checkbox" name="target_dept_id" value="', info.id, '"', (isSubType ? ' checked="checked"' : '') ,'></span></td>', "\n");
                    html.push('<td class="action"><span class="wrap_btn_m btn-remove"><span class="ic_side ic_basket_bx" title="', tvars.label.remove, '"></span></span></td>', "\n");
                html.push('</tr>');
                
                return html.join("");
            }

        })(TargetView);
        
        function createNameTag(selector, useAddButton, removable, nodes) {
            var nameTagListView, tags = [];
            
            _.each(nodes, function(node) {
            	if(node.nodeType === 'user') {
            		tags.push({"id": node.nodeId, "title": node.nodeValue, options: { "removable": removable }});
            	}
            });

            nameTagListView = NameTagListView.create(tags || [], { "useAddButton": useAddButton, "useRemoveAll": true });
            
            $(selector)
                .data('instance', nameTagListView)
                .append(nameTagListView.el);
            
            nameTagListView.$el.on("nametag:clicked-add", function(view) {
                $.goOrgSlide({
                    header : SurveyLang["설문 대상자 추가"],
                    type: 'node', 
                    desc : SurveyLang["설문 결과 열람 가능 안내 메시지"],
                    contextRoot : GO.config("contextRoot"),
                    memberTypeLabel : commonLang["대상자"],
                    externalLang : commonLang,
                    isBatchAdd : true,
                    callback : function(info) {
                    	var datas = _.isArray(info) ? info : [info]; 
            			_.each(datas, function(data) {
            				addNameTag(data, nameTagListView, removable);
            			});
                    }
                });
            });
            
            function addNameTag(info) {
            	var displayName = info.position ? info.name + " " + info.position : info.name;
            	nameTagListView.addTag( info.id, displayName, { "attrs": info, "removable": removable } );
            }
        }
        
        function toggleTargetUserList(e, model) {
            var $target = $(e.currentTarget), 
            	nodes = model.getTargetNodes(), 
            	// 라디오 버튼의 경우 trigger('click')을 통해 이벤트를 발생시킬 경우 .is(':checked') 로 체크여부가 체크가 안된다...(이유는 모르겠음)
            	// 그래서, 원인이 밝혀지기 전까지는 radio 버튼이 클릭되어 이 함수를 호출하게 되면 check 된걸로 무조건 간주!!
            	checked = true;
            
            if($target.attr('type') === 'checkbox') {
            	checked = $target.is(':checked');
            }
                        
            if(checked && $target.val() === 'user') {
                if($('#target-user-div').length < 1) {
                	$target.parent().after('<div id="target-user-div" class="option_display"></div>');
                    createNameTag('#target-user-div', true, model.isCreator(GO.session("id")), nodes);
                }
                
                $('#target-user-div').show();
            } else {
                $('#target-user-div').hide();
            }
        }
        
        function addTargetList(list, id, type, text) {
            list.push({
                "nodeId": id,
                "nodeType": type, 
                "nodeValue": text
            });
            
            return list;
        }
        
        return {
            create: function(container, model, isAdmin) {
                
                var viewOption = { "el": container, "model": model }, 
                    instance = isAdmin ? new AdminView(viewOption) : new UserView(viewOption);
                    
                instance.render();
                
                return instance;
            }
        };
    });
    
})();