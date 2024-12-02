define(function(require) {
	var Backbone = require("backbone");
	var NameTagView = require("go-nametags");
	var LineRuleDetailItemTpl = require("hgn!admin/templates/appr_line_rule_detail_item");
	var LineRuleDetailItemRowTpl = require("hgn!admin/templates/appr_line_rule_detail_item_row");
	var LineRuleItemAreaTpl = require("hgn!admin/templates/appr_line_rule_item_area");
	var approvalLang = require("i18n!approval/nls/approval");
	var commonLang = require("i18n!nls/commons");
	var adminLang = require("i18n!admin/nls/admin");
	require("jquery.inputmask");
	require("jquery.go-orgslide");
	
	var lang = {
        "이름" : commonLang['이름'],
        "적용된 양식수" : adminLang['적용된 양식수'],
        "결재선" : approvalLang['결재선'],
        "자동결재선 설정" : adminLang['자동결재선 설정'],
        "순서바꾸기" : commonLang['순서바꾸기'],
        "순서바꾸기 완료" : commonLang['순서바꾸기 완료'],
        '추가' : commonLang['추가'],
        '삭제' : commonLang['삭제'],
        '저장' : commonLang['저장'],
        '취소' : commonLang['취소'],
        'empty_msg' : approvalLang['자료가 없습니다'],
        '결재선 설정' : approvalLang['결재선 설정'],
        '직책' : adminLang['직책'],
        '직급' : adminLang['직급'],
        '직위' : adminLang['직위'],
        '금액' : commonLang['금액'],
        '차상위자를 최종 결재자로 지정' : approvalLang['차상위자를 최종 결재자로 지정'],
        '금액에 대해 기안자가 전결권자인 경우, 차상위자의 결재를 받음' : approvalLang['금액에 대해 기안자가 전결권자인 경우, 차상위자의 결재를 받음'],
        '결재순서' : approvalLang['결재순서'],
        '추가' : commonLang['추가'],
        '순서' : commonLang['순서'],
        '타입' : approvalLang['타입'],
        '그룹명' : adminLang['그룹명'],
        '항목' : adminLang['항목'],
        '지정결재자' : approvalLang['지정결재자'],
        '최소 하나 이상의 결재선이 있어야 합니다' : approvalLang['최소 하나 이상의 결재선이 있어야 합니다'],
        '그룹명을 입력해 주세요' : approvalLang['그룹명을 입력해 주세요'],
        '항목에 하나 이상의 선택값이 필요합니다' : approvalLang['항목에 하나 이상의 선택값이 필요합니다'],
        '금액을 입력해 주세요' : approvalLang['금액을 입력해 주세요'],
        '금액 구간 설정 오류' : approvalLang['금액 구간 설정 오류'],
        '도메인 코드가 서로 다릅니다' : approvalLang['도메인 코드가 서로 다릅니다'],
        '중복된 금액이 있습니다' : approvalLang['중복된 금액이 있습니다'],
        '차상위자 보다 설정 값이 높은 결재자가 있습니다' : approvalLang['차상위자 보다 설정 값이 높은 결재자가 있습니다'],
        '이상' : commonLang['이상'],
        '미만' : adminLang['미만'],
        '동일한 항목이 있습니다' : approvalLang['동일한 항목이 있습니다'],
        "사용자 추가" : adminLang["사용자 추가"],
        //START DOCUSTOM-8699
        '결재자 추가' : approvalLang['결재자 추가'],
        '지정결재자 추가' : approvalLang['지정결재자 추가'],
        "전체 부서" : adminLang["전체 부서"],
        "일부 부서" : adminLang["일부 부서"],
        "추가" : commonLang["추가"],
        "부서 설정 추가" : adminLang["부서 설정 추가"],
        "부서명" : adminLang["부서명"],
        "하위부서포함" : commonLang["하위부서포함"],
        "부서를 추가하세요" : adminLang["부서를 추가하세요"],
        "결재자를 추가하세요" :adminLang["결재자를 추가하세요"],
        "우선순위" : adminLang["우선순위"],
        "최소 하나 이상의 부서가 있어야 합니다." : adminLang["최소 하나 이상의 부서가 있어야 합니다."],
        "적용 부서" : approvalLang["적용 부서"],
        "결재 기준" : approvalLang["결재 기준"],
        "결재선 생성시 금액별로 결재선을 다르게 생성해야할 때 사용합니다" : adminLang["결재선 생성시 금액별로 결재선을 다르게 생성해야할 때 사용합니다."],
        "부서별로 다른 결재선을 설정해야 할 때, '일부 부서'를 선택하여 부서를 지정할 수 있습니다" : adminLang["부서별로 다른 결재선을 설정해야 할 때, '일부 부서'를 선택하여 부서를 지정할 수 있습니다."],
        "기안자가 입력한 금액에 대해 권한이 있어도, 한단계 차상위자의 결재가 필요한 경우 사용합니다" : adminLang["기안자가 입력한 금액에 대해 권한이 있어도, 한단계 차상위자의 결재가 필요한 경우 사용합니다."],
        "기안자의 바로 다음 사람까지만 결재선으로 지정합니다" : adminLang["기안자의 바로 다음 사람까지만 결재선으로 지정합니다."]
    };
	
	var RowModel = Backbone.Model.extend({
		
	});
	var RowCollection = Backbone.Collection.extend({
        model : RowModel
    });
	
	var ApprLineRuleGroup = Backbone.Model.extend({
        defaults  :{
            useAccountRule : false,
            ruleTypeName : 'duty',
            apprLineRuleItemGroups : [],
            useAllDept : false
        }
    });
	
    var RowView = Backbone.View.extend({
        tagName : 'tr',
        className : 'disabled added_tr',
        initialize : function(options){
            this.options = options || {};
            this.rowModel = this.options.rowModel;
            this.companyIds = this.options.companyIds;
            this.codeTypeName = this.rowModel.get('codeTypeName');
            this.nameTag = NameTagView.create({}, {useAddButton : false});
            this.$el.data('instance', this);
        },
        
        events : {
            'click span[name="addDomain"]' : 'addDomain',
            'click span[name="removeRow"]' : 'removeRow'
        },
        
        render : function(){
            var self = this;
            this.$el.html(LineRuleDetailItemRowTpl({
            	lang : lang,
            	data : this.rowModel.toJSON(), 
            	cid : this.cid
        	}));
            this.renderNameTag();
            return this;
        },
        
        toggleAmount : function(flag){
            this.$('td[name="useAccountRuleTd"]').toggle(flag);
        },
        
        addDomain : function(){
            var self = this;
            if(this.rowModel.get('isUserType')){
            	var orgSlideOption = {
                    header: lang['사용자 추가'],
                    contextRoot : GO.config("contextRoot"),
                    type: 'node',
                    isAdmin: true,
                    desc : '',
                    callback : function(member) {
                        if(member.type == 'org'){
                            return false;
                        }
                        var displayName = member.position ? member.name + " " + member.position : member.name;
                        var result = true;
                        _.each(self.$el.parent().find('tr .name_tag .name'),function(name){
                            if($(name).text() == displayName){
                                $.goMessage(lang["동일한 항목이 있습니다"]);
                                result = false;
                                return false;
                            }
                        });
                        if(!result)return false;                            
                        
                        _.each(self.nameTag.getNameTagList(), function(m){
                            self.nameTag.removeTag(m.userId);
                        }, self);
                        self.nameTag.addTag(member.id, displayName, {"attrs": _.extend(member, {userId : member.id}), removable : true})
                    }
                };
            	if (_.isArray(self.companyIds)) {
                    orgSlideOption['companyIds'] = self.companyIds;
                }
                $.goOrgSlide(orgSlideOption);
            }else{
                var id = this.$('select[name="domainCodeId"]').val();
                var text = this.$('select[name="domainCodeId"] option:selected').text();
                var result = true;
                _.each(self.$el.parent().find('tr .name_tag .name'),function(name){
                    if($(name).text() == text){
                        $.goMessage(lang["동일한 항목이 있습니다"]);
                        result = false;
                        return false;
                    }
                });
                if(!result)return false;
                this.nameTag.addTag(id, text, {removable : true});                  
            }

        },

        renderNameTag : function(){
            this.$("div.name_tag_add").before(this.nameTag.el);
            
            _.each(this.rowModel.get('apprLineRuleItems'), function(m){
                if(m.userId){
                    this.nameTag.addTag(m.userId, m.displayName, {attrs : m, removable : true});
                }else if(m.domainCodeId){
                    this.nameTag.addTag(m.domainCodeId, m.domainCodeName, {removable : true});  
                }
                
            }, this);   
            
            this.$('input[name="moreAmount"]').inputmask({
	            'alias': 'decimal', 
	            'groupSeparator': ',', 
	            'autoGroup': true,
	            'digits' : '0',
	            'allowMinus' : false
            });
            this.$('input[name="underAmount"]').inputmask({
                'alias': 'decimal', 
                'groupSeparator': ',', 
                'autoGroup': true,
                'digits' : '0',
                'allowMinus' : false
            });
        },
        
        removeRow : function(){
            var targetTbody = this.$el.closest('tbody');
            this.remove();
            this.trigger('reSetSeq');
            this.trigger('reSetAcoountState');
            this.trigger('ruleTypeReopen');

            appendNullDataDesc(targetTbody, lang["결재자를 추가하세요"]);
        },
        getData : function(){
            var data = {
                    seq : this.rowModel.get('seq'),
                    activityTypeName : this.$('select[name="activityTypeName"]').val(),
                    name : this.$('input[name="groupName"]').val(),
                    moreAmount : this.$('input[name="moreAmount"]').inputmask('unmaskedvalue') || "0",
                    underAmount : this.$('input[name="underAmount"]').inputmask('unmaskedvalue'),
                    apprLineRuleItems : this.getLineRuleItems(),
                    isUserType : this.rowModel.get('isUserType')
            }
            return data;
        },
        validate: function(){
            var resultMessage = "true";
            if(_.isEmpty(this.$('[name=groupName]').val())){
                resultMessage = lang['그룹명을 입력해 주세요'];
                return resultMessage;
            }
            
            if(this.$('.name_tag li').length == 0){
                resultMessage = lang['항목에 하나 이상의 선택값이 필요합니다'];
                return resultMessage;
            }
            
            return resultMessage;
        },
        getLineRuleItems : function(){
            var datas = [];
            var data = {};
            _.each(this.nameTag.getNameTagList(), function(m, idx){
                if(this.rowModel.get('isUserType')){
                    data = {
                            seq : idx + 1,
                            userId : m['userId'],
                            displayName : m['displayName'],
                            deptId : m['deptId'],
                            approvalAssigned : m['approvalAssigned']
                        }
                }else{
                    data = {
                            seq : idx + 1,
                            domainCodeId : m['id'],
                            domainCodeName : m['name']
                        }                       
                }
                datas.push(data);
            }, this);
            return datas;
        }
    });
    //DOCUSTOM-8699
    var DeptRowTpl = ['<tr class="added_tr" data-nodeid={{data.nodeId}}>',
                      '<td class="name">',
                          '<span class="txt">{{data.name}}</span>',
                      '</td>',
                      '<td class="opt_check">',
                        '<span class="wrap_single_form">',
                            '<input type="checkbox" {{#data.cascade}}checked{{/data.cascade}}>',
                        '</span>',
                     '</td>',
                      '<td class="opt">',
                         '<span class="wrapBtn" name="removeDeptRow"><span class="ic ic_delete" title="삭제"></span></span>',
                      '</td>',
                  '</tr>'].join('');

    function appendNullDataDesc($tbodyEl, desc) {
        if($tbodyEl.find('tr.added_tr').length != 0) return;

        var colspan = $tbodyEl.closest('table').find('th').length;
        var nullDataTmpl = '<tr><td colspan="'+colspan+'" class="null_data">'+desc+'</td></tr>';
        $tbodyEl.append(Hogan.compile(nullDataTmpl).render());
    }

    //DOCUSTOM-8699
    var LineRuleItemAreaView = Backbone.View.extend({
        
        tagName: 'div',
        className : 'approvalLineConfig',
        initialize : function(options){
            this.options = options || {};
            this.apprConfig = this.options.apprConfig;
            this.domain = this.options.domain;
            this.companyIds = this.options.companyIds;
            this.model = this.options.model;
            this.maxLength = this.options.maxLength;
            this.unbindEvent();
            this.bindEvent();
            this.$el.data('instance', this);
            this.id="approvalLineConfig_"+this.cid;
            this.$el.attr('id',this.id);
        },
        bindEvent: function() {
            this.$el.on("change", 'input[name="useAccountRule"]', $.proxy(this.toggleView, this));
            this.$el.on("click", 'span[name="addGroup"]', $.proxy(this.addGroup, this));
            this.$el.on("click", 'span[name="addApprover"]', $.proxy(this.addApprover, this));
            this.$el.on("click", 'span[name="reorder"]', $.proxy(this.reorder, this));
            this.$el.on("click", 'span[name="reorderComplete"]', $.proxy(this._sortableComplete, this));
            this.$el.on('click', 'span[name="showDeptTree"]', $.proxy(this.showDeptTree, this)); //DOCUSTOM-8699
            this.$el.on('click', 'span[name="removeDeptRow"]', $.proxy(this.removeDeptRow, this)); //DOCUSTOM-8699
            this.$el.on('click', 'span[name="approvalLineConfigDelete"]', $.proxy(this.approvalLineConfigDelete, this)); //DOCUSTOM-8699
            this.$el.on('change', 'select[name="priorityType"]', $.proxy(this.changePriorityType, this)); //DOCUSTOM-8699
            this.$el.on('focus', 'select[name="priorityType"]', $.proxy(this.focusPriorityType, this)); //DOCUSTOM-8699
        },
        unbindEvent : function(){
            this.$el.off("change", 'input[name="useAccountRule"]');
            this.$el.off("click", 'span[name="addRow"]');
            this.$el.off("click", 'span[name="addApprover"]');
            this.$el.off("click", 'span[name="reorder"]');
            this.$el.off("click", 'span[name="reorderComplete"]');
            this.$el.off('click', 'span[name="showDeptTree"]'); //DOCUSTOM-8699
            this.$el.off('click', 'span[name="removeDeptRow"]'); //DOCUSTOM-8699
            this.$el.off('click', 'span[name="approvalLineConfigDelete"]'); //DOCUSTOM-8699
            this.$el.off('change', 'select[name="priorityType"]'); //DOCUSTOM-8699
            this.$el.off('focus', 'select[name="priorityType"]'); //DOCUSTOM-8699
        },
        
        render: function() {
            this.$el.html(LineRuleItemAreaTpl({
                cid : this.cid,
                lang: lang,
                data : this.model.toJSON(),
                isDutyType : this.model.get('ruleTypeName') == 'duty',
                isGradeType : this.model.get('ruleTypeName') == 'grade',
                isPositionType : this.model.get('ruleTypeName') == 'position',
                isSubDepartment : function () {
                    return function (value) {
                        var compileValue = Hogan.compile(value).render(this);
                        if(compileValue=='subdepartment'){
                            return 'checked';
                        }else{
                            return '';
                        }
                       
                    };
                }
            }));
          
            if(this.model.get('apprLineRuleItemGroups').length > 0){
                this.renderRows();
            }
            
            if(this.maxLength != undefined){
                this.setInitPriorityOption();
            }

            appendNullDataDesc(this.$el.find('tbody[name=deptListTbody]'), lang["부서를 추가하세요"]);
            appendNullDataDesc(this.$el.find('tbody[id=appr_line_tbody]'), lang["결재자를 추가하세요"]);
            this.deptConfigBindEvent(this.cid);
            return this;
        },

        setInitPriorityOption : function(){
            var optionHtml = '';
            
            for(var i=1;i<this.maxLength;i++){
                optionHtml += '<option value='+i+'>'+i+'</option>'
            }
            
            this.$el.find('select[name=priorityType]').html(optionHtml);
            this.$el.find('select[name=priorityType]').val(this.model.toJSON().subSeq);  
        },
        
        focusPriorityType : function(e){ //DOCUSTOM-8699
            this.previousPriorityValue = e.currentTarget.value;
        },
        
        changePriorityType : function(e){ //DOCUSTOM-8699
            var self = this;
            var currentPriorityValue = e.currentTarget.value;
            var currentSelectId = "priorityType_"+this.cid;
            var parentDivEl = $('#approvalLineConfig_'+this.cid).closest('div.tool_bar');
            var selectElList = parentDivEl.find('select[name=priorityType]');
            
            $.each(selectElList,function(i,select){
                if(currentSelectId == select.id){
                    return true;
                }
                var selectedEl = $(this).find('option:selected');

                if(selectedEl.val() == currentPriorityValue){
                    selectedEl.closest('select').val(self.previousPriorityValue).prop("selected", true);
                    return false;
                }
                
            });
            selectElList.blur().trigger('focusout');
        },
        
        approvalLineConfigDelete : function(e){//DOCUSTOM-8699
            var parentDivEl = $('#approvalLineConfig_'+this.cid).closest('div.tool_bar');
            this.$el.remove();
            
            var apprDeptConfigLength = parentDivEl.find('div.approvalLineConfig').length;
            if(apprDeptConfigLength <= 1) {
            	parentDivEl.find('span[name="approvalLineConfigDelete"]').hide();
            	parentDivEl.find('span[name="priorityTypeSpan"]').hide();
            }
            
            setPriorityOption(parentDivEl);
        },
            
        deptConfigBindEvent : function(cid){
                this.$el.off('click', 'input[name=deptTypeName_'+this.cid+']'); 
                this.$el.on('click', 'input[name=deptTypeName_'+this.cid+']', $.proxy(this.changeDeptConfig, this)); 
        },
        
        changeDeptConfig : function(e){
            var self = this;
            var parentEl = this.$el.parent();
            var deptType = e.currentTarget.value;
            var defaultLineItemView = null;
            
            var apprLineRuleGroup = new ApprLineRuleGroup();
            
            if(deptType  == 'all_depts'){ //전체부서
            	if(parentEl.find('div[name="useAllDeptContainer"]').length >= 1) {
            		$.goError("전체부서 설정은 하나 이상 설정이 불가능합니다.");
            		e.preventDefault();
            		return;
            	}
            	
            	apprLineRuleGroup.attributes.useAllDept = true;
            	defaultLineItemView = new LineRuleItemAreaView({
                    apprConfig : self.apprConfig,
                    domain : self.domain,
                    companyIds : self.companyIds,
                    model : apprLineRuleGroup
                });
            	if(parentEl.find('.approvalLineConfig').length >1) {
            		this.$el.remove();
                	parentEl.find('.approvalLineConfig').last().after(defaultLineItemView.render().$el);
            	}else{
            		this.$el.replaceWith(defaultLineItemView.render().$el);
            	}
            	
            	parentEl.find('.approvalLineConfig').last().find('#applyDeptTypes input:checked').focus();
            } else {
            	defaultLineItemView = new LineRuleItemAreaView({
                    apprConfig : self.apprConfig,
                    domain : self.domain,
                    companyIds : self.companyIds,
                    model : apprLineRuleGroup
                });
            	this.$el.replaceWith(defaultLineItemView.render().$el);
            }
            
            var apprDeptConfigLength = parentEl.find('.approvalLineConfig').length;
            if(apprDeptConfigLength == 1) {
            	parentEl.find('.approvalLineConfig span[name="approvalLineConfigDelete"]').hide();
            	parentEl.find('.approvalLineConfig span[name="priorityTypeSpan"]').hide();
            }
            setPriorityOption(parentEl);
        },
       
        showDeptTree : function(){ //DOCUSTOM-8699
            $.goOrgSlide({
                header : commonLang["부서 추가"],
                type : "department",
                isAdmin : true,
                contextRoot : GO.contextRoot,
                callback : $.proxy(function(info) {
                    if (info.type == "root") return;
                    this.addDept({
                        id : null,
                        nodeId : info.id,
                        name : info.name
                    });
                }, this)
            });
        },
        
        addDept : function(data) { //DOCUSTOM-8699
            var tbodyEl = this.$el.find('tbody[name=deptListTbody]');
            var nodeId = data.nodeId;
            var isDuplication = false; //중복여부
            $.each(tbodyEl.find('tr.added_tr'),function(i,tr){
                if($(tr).data('nodeid') == nodeId){
                    isDuplication= true;
                    return;
                }
            });
           
            if(isDuplication){
                return;
            }

            if(tbodyEl.find('.null_data').length != 0) {
                tbodyEl.empty();
            }
            
            tbodyEl.append(Hogan.compile(DeptRowTpl).render({data:data}));
        },
        
        removeDeptRow : function(e){//DOCUSTOM-8699
            var targetTbody = $(e.currentTarget).closest('tbody');
            $(e.currentTarget).closest('tr').remove();
            appendNullDataDesc(targetTbody, lang["부서를 추가하세요"]);
        },
        
        initSortable : function(){
            var self = this;
            this.$el.find('#detailTableItem').sortable({
                items: 'tbody tr',
                tolerance: 'pointer',
                cursor : 'move',
                opacity : '1',
                delay: 100,
                placeholder : 'ui-sortable-placeholder',
                start: function(event, ui) {
                    ui.item.disableSelection();
                },
                cancel : "select, input"
            }).filter('input').disableSelection();
            
        },
        
        reSetSeq : function(){
            this.$el.find('#detailTableItem tbody tr.added_tr').each(function(idx, view){
                $(view).find('td').eq(0).text(idx + 1);
            });
        },
        
        reSetAcoountState: function(){
            var length = this.$el.find('#detailTableItem tbody tr.added_tr').length;
            this.$el.find('#detailTableItem tbody tr.added_tr [name=useAccountRuleTd] [name=operatorName]').each(function(idx, state){
                if(idx+1 == length){
                    $(state).text(lang['이상']);
                }else{
                    $(state).text(lang['미만']);
                }
                
            });
        },
        
        ruleTypeReopen: function(){
            var self = this;
            var result = true;
            $.each(this.$('#appr_line_tbody tr.added_tr'), function(index, rowViewEl){
                if($(rowViewEl).find('select[name=domainCodeId]').length != "0"){
                    result = false;
                    return false;
                }
            });
            if(result){
                self.$('[name*=ruleTypeName_view]').attr('disabled',false);
            }
        },
        
        renderRows : function(){
            var self = this;
            var codeTypeName = this.model.get('ruleTypeName');
            var convertCodeTypeName = convertRuleType.call(this, codeTypeName);
            var domains = self.domain.get(convertCodeTypeName);
            var useAccountRule = this.model.get('useAccountRule');
            var apprLineRuleItemGroupsLength = this.model.get('apprLineRuleItemGroups').length;
            var index = 1;
            _.each(this.model.get('apprLineRuleItemGroups'), function(data){
                var rowModel = {
                        seq : self.$('#appr_line_tbody tr.added_tr').length + 1,
                        types : _.map(self.apprConfig.getTypes(), function(m){
                            return {
                                type : m.type,
                                name : m.name,
                                isSelected : m.type == data['activityTypeName']
                                }
                            }),
                        codeTypeName : codeTypeName,
                        domains : domains,
                        useAccountRule : useAccountRule,
                        isUserType : checkUserType.call(self, data),
                        name : data['name'],
                        moreAmount : data['moreAmount'],
                        underAmount : data['underAmount'],
                        apprLineRuleItems : data['apprLineRuleItems']                           
                } 
                self.addRow(new RowModel(rowModel));
                if(!checkUserType.call(self, data)){
                    self.$('[name*=ruleTypeName_view]').attr('disabled',true);
                }
                index++;
            }, this);               
        },
        
        addGroup : function(){
            if(this.$('#appr_line_tbody tr.added_tr').length == rowCount){
                $.goMessage(GO.i18n(approvalLang['{{number}}개 까지 추가 가능 합니다'], "number", rowCount));
                return false;
            }
            if(!this.validateGroup()){
                return false;
            }
            var tbodyEl = this.$el.find('tbody[id=appr_line_tbody]');
            if(tbodyEl.find('.null_data').length != 0) {
                tbodyEl.empty();
            }
            var codeTypeName = this.$('input[name*="ruleTypeName"]:checked').val();
            var convertCodeTypeName = convertRuleType.call(this, codeTypeName); 
            var domains = this.domain.get(convertCodeTypeName);
            var seq = this.$('#appr_line_tbody tr.added_tr').length + 1;
            var rowModel = new RowModel({
                seq : seq,
                types : this.apprConfig.getTypes(),
                codeTypeName : codeTypeName,
                domains : domains,
                useAccountRule : this.$('input[name*="useAccountRule"]').is(':checked'),
                isUserType : false,
                isMore : true,
                isUnder : false
            });
            this.addRow(rowModel);
            //ruleType 변경 disable
            this.$('[name*=ruleTypeName_view]').attr('disabled',true);
        },
        
        addApprover : function(){
            if(this.$('#appr_line_tbody tr.added_tr').length == rowCount){
                $.goMessage(GO.i18n(approvalLang['{{number}}개 까지 추가 가능 합니다'], "number", rowCount));
                return false;
            }
            var tbodyEl = this.$el.find('tbody[id=appr_line_tbody]');
            if(tbodyEl.find('.null_data').length != 0) {
                tbodyEl.empty();
            }
            var groupName = this.$('input[name="groupName"]').val();
            var seq = this.$('#appr_line_tbody tr.added_tr').length + 1;
            var rowModel = new RowModel({
                seq : seq,
                name : approvalLang['지정 결재자'],
                types : this.apprConfig.getTypes(),
                codeTypeName : 'USER',
                useAccountRule : this.$('input[name*="useAccountRule"]').is(':checked'),
                isUserType : true,
                isMore : true,
                isUnder : false
            });
            this.addRow(rowModel);
        },
        
        validateGroup : function(){
            var codeTypeName = this.$('input[name*="ruleTypeName"]:checked').val(),
                convertCodeTypeName = convertRuleType.call(this, codeTypeName),
                domains = this.domain.get(convertCodeTypeName),
                selectedGroupName;
            
            switch(codeTypeName){
                case 'grade' :
                    selectedGroupName = adminLang['직급'];
                    break;
                case 'position' :
                    selectedGroupName = adminLang['직위'];
                    break;
                default :
                    selectedGroupName = adminLang['직책']
            }
                
            if(domains.length == 0){
                $.goMessage(GO.i18n(approvalLang['{{name}}에 대한 도메인 코드가 없습니다'], "name", selectedGroupName));
                return false;
            }
            
            if(this.$('#appr_line_tbody tr.added_tr').length == 1){
                return true;
            };
            var selectedCodeTypeName = this.$('input[name*="ruleTypeName"]:checked').val();
            var result = true;
            $.each(this.$('#appr_line_tbody tr.added_tr'), function(index, rowViewEl){
                var codeTypeName = $(rowViewEl).data('instance').codeTypeName;
                if(codeTypeName != 'USER' && selectedCodeTypeName != codeTypeName){
                    $.goError(lang['도메인 코드가 서로 다릅니다']);
                    result = false;
                    return false;
                }
            });

            return result;
        },

        getData : function(isSave){
            var apprLineRuleItemGroups = [];
            $.each(this.$('#appr_line_tbody tr.added_tr'), function(index, rowViewEl){
                var rowView = $(rowViewEl).data('instance');
                apprLineRuleItemGroups.push(_.extend(rowView.getData(), {seq : index+1}));
            });
            
            var deptType = this.$('input[name=deptTypeName_'+this.cid+']:checked').val();
            var nodes = [];
            var useAllDept = true;
            if(deptType == 'part_depts'){
                useAllDept = false;
                $.each(this.$('tbody[name=deptListTbody] tr.added_tr'), function(idx, dept) {
                    nodes.push({
                        id : $(dept).data("nodeid"),
                        nodeId : $(dept).data("nodeid"),
                        nodeType : $(dept).find("input[type=checkbox]").is(":checked") ? "subdepartment" : "department",
                        nodeValue : $(dept).find("span.txt:first").text()
                    });
                });
            }
            
            var subSeq = this.$('select[name=priorityType]').val();
            
            var useAccountRule = this.$('input[name*="useAccountRule"]').is(':checked')
            var data = {
                    useAccountRule : useAccountRule,
                    assignArbitraryDecision : !useAccountRule && this.$('[name="assignArbitraryDecision"]').is(':checked'),
                    requireArbitaryDesision : useAccountRule && this.$('[name="requireArbitaryDesision"]').is(':checked'),
                    ruleTypeName : this.$('input[name*="ruleTypeName"]:checked').val(),
                    apprLineRuleItemGroups : apprLineRuleItemGroups,
                    deptCircle : {nodes:nodes},
                    subSeq : subSeq,
                    useAllDept : useAllDept
            }
            
            if(isSave){
                if(!useAccountRule){
                    _.each(apprLineRuleItemGroups, function(rowData){
                        delete rowData['moreAmount'];
                        delete rowData['underAmount'];
                    });
                }
            }            
            return data;
        },
        
        addRow : function(rowModel){
            var rowView = new RowView({
                rowModel : rowModel,
                companyIds : this.companyIds
            });
            rowView.on('reSetSeq', $.proxy(this.reSetSeq, this));
            rowView.on('reSetAcoountState', $.proxy(this.reSetAcoountState, this));
            rowView.on('ruleTypeReopen', $.proxy(this.ruleTypeReopen, this));
            this.$('#appr_line_tbody [name=useAccountRuleTd] [name=operatorName]').text(lang['미만']);
            this.$('#appr_line_tbody').append(rowView.render().$el);
        },
        
        reorder : function(){
            var result = this._renderForReorderView();
            if(result){
                this.$("[name=reorder]").hide();
                this.$("[name=reorderComplete]").show();
            }
        },
        
        _sortableComplete: function(){
            this.$("[name=reorder]").show();
            this.$("[name=reorderComplete]").hide();
            this._sortableSwitch('off');
            
            this.reSetSeq();
            this.reSetAcoountState();
        },
        
        _renderForReorderView: function() {
            if (this.$('#detailTableItem tbody tr.added_tr').length == 0) {
                $.goMessage(lang['empty_msg']);
                return false;
            }
            
            this.$('#detailTableItem tbody').sortable({
                opacity : '1',
                delay: 100,
                cursor : "move",
                items : "tr",
                containment : '.content_page',
                hoverClass: "ui-state-hover",
                helper : 'clone',
                placeholder : 'ui-sortable-placeholder',
                cancel: '.disabled',
                start : function (event, ui) {
                    ui.placeholder.html(ui.helper.html());
                    ui.placeholder.find('td').css('padding','5px 10px');
                }
            });
            this._sortableSwitch('on');
            return true;
        },
        
        _sortableSwitch: function(state){
            if(state == 'on'){
                this.$('#detailTableItem tbody').addClass("ui-sortable");
                this.$('#detailTableItem tbody tr').removeClass("disabled");
            }else if(state == 'off'){
                this.$('#detailTableItem tbody').removeClass("ui-sortable");
                this.$('#detailTableItem tbody tr').addClass("disabled");
            }
        },
        
        toggleView : function(e){
            var checked = $(e.currentTarget).is(':checked');
            var rowViews = [];
            
            $.each(this.$('#appr_line_tbody tr.added_tr'), function(index, rowViewEl){
                var rowView = $(rowViewEl).data('instance');
                rowView.toggleAmount(checked);
            });
            this.$('th.pay').toggle(checked);
            this.$('col.pay').toggle(checked);
            this.$('[name="assignArbitraryDecisionArea"]').toggle(!checked);
            this.$('[name="requireArbitaryDesisionArea"]').toggle(checked);
            this.$('[name="arbitaryDesisionAreaToolTip"]').text(checked ? 
                    lang["기안자가 입력한 금액에 대해 권한이 있어도, 한단계 차상위자의 결재가 필요한 경우 사용합니다"] 
                    : lang["기안자의 바로 다음 사람까지만 결재선으로 지정합니다"] )
        },
        
        validate : function(){
            var self = this;
            
            
            var resultMessage = "true";
            var payCriteria = this.$('#appr_line_tbody tr .pay');
            
            /*
             * validation : 일부부서일때 부서 추가가 하나 이상인지 확인
             */
            var deptType = this.$el.find('input[name=deptTypeName_'+this.cid+']:checked').val();
            var deptTr = this.$el.find('tbody[name=deptListTbody] tr.added_tr');
            if(deptType =='part_depts' && deptTr.length == 0){
                resultMessage = lang["최소 하나 이상의 부서가 있어야 합니다."];
                return resultMessage;
            }
            /*
             * validation : 최소 하나 이상의 결재선이 있어야 합니다
             */
            if(this.$('#appr_line_tbody tr.added_tr').length == 0){
                resultMessage = lang["최소 하나 이상의 결재선이 있어야 합니다"];
                return resultMessage;
            }
            
            /*
             * validation : rowViw check
             */
            $.each(this.$('#appr_line_tbody tr.added_tr'), function(index, rowViewEl){
                var rowView = $(rowViewEl).data('instance');
                resultMessage = rowView.validate();
                if(resultMessage != "true") return false;
            });
            if(resultMessage != "true") return resultMessage;
            
            if($("input[name='useAccountRule']").is(":checked")){
            	$.each(this.$('[name=useAccountRuleTd]'), function(index, pay) {
            		var moreAmount = $(pay).find('[name=moreAmount]').inputmask('unmaskedvalue');
            		var underAmount = $(pay).find('[name=underAmount]').inputmask('unmaskedvalue');
            		moreAmount = moreAmount == null ? 0 : parseFloat(moreAmount);
            		if(underAmount != null && moreAmount > underAmount) {
            			resultMessage = lang["금액 구간 설정 오류"];
            		} else if(moreAmount == 0 && underAmount == null){
            			resultMessage = lang["금액을 입력해 주세요"];
            		}
            		return resultMessage;
            	});
            }
            
            /*
             * validation: 동일한 항목이 있습니다
             */
            var addedDomains = [];
            $.each(this.$('#appr_line_tbody tr .name_tag .name'), function(idx, domain){
                addedDomains.push($(domain).text());
            });
            var result = _.uniq(addedDomains);
            if((addedDomains.length != result.length)){
                resultMessage = lang["동일한 항목이 있습니다"];
                return resultMessage;
            }
            
            return resultMessage;
        }
    });
        

    var rowCount = 9;
    var LineRuleDetailItemView = Backbone.View.extend({
        tagName: 'div',
        className : 'container',
        attributes : {
            name : 'lineRuleItemArea'
        },
        
        lineTableView : null,
        initialize: function(options) {
            this.options = options || {};
            this.apprConfig = this.options.apprConfig;
            this.domain = this.options.domain;
            this.companyIds = this.options.companyIds;
            this.model = this.options.model;
            this.unbindEvent();
            this.bindEvent();
            this.$el.data('instance', this);
        },
        
        bindEvent: function() {
            this.$el.on("click", '.btn_delete_option', $.proxy(this.deleteOption, this));
            this.$el.on("click", '#btn_add_dept_config', $.proxy(this.addDeptConfig, this));
        },
        
        unbindEvent : function(){
            this.$el.off("click", '.btn_delete_option');
            this.$el.off("click", '#btn_add_dept_config');
        },
        
        render: function() {
            var self = this;
        
            this.$el.html(LineRuleDetailItemTpl({
                lang: lang
             }));
            
            
            var lineRuleItemAreaView = new LineRuleItemAreaView(this.options);

            this.$('#appr_line_dept_config_wrap').append(lineRuleItemAreaView.render().$el);

            return this;
        },
        
        deleteOption : function(){
            if($('[name=lineRuleItemArea]').length <= 2){
            	$('.btn_delete_option').hide();
            } else {
            	$('.btn_delete_option').show();
            }
            
            this.remove();
        },
        
        addDeptConfig : function() {
        	var lineItemView = new LineRuleItemAreaView({
                apprConfig : this.apprConfig,
                domain : this.domain,
                companyIds : this.companyIds,
                model : new ApprLineRuleGroup()
            });
        	var addLineItemViewEl = lineItemView.render().$el;
        	
        	//부서 설정 추가 위치 지정, 전체부서가 존재할 경우와 미 존재할 경우
        	var lastApprLineConfigEl = this.$el.find('.approvalLineConfig').last();
        	if(lastApprLineConfigEl.find('#applyDeptTypes input:checked').val() == "all_depts"){
        		lastApprLineConfigEl.before(addLineItemViewEl);
        	} else{
        		lastApprLineConfigEl.after(addLineItemViewEl);
        	}
        	
        	this.$el.find('.approvalLineConfig span[name="priorityTypeSpan"]').show();
        	this.$el.find('.approvalLineConfig span[name="approvalLineConfigDelete"]').show();
        	
        	setPriorityOption(this.$el);
        	addLineItemViewEl.find('#applyDeptTypes input:checked').focus();
        },
        
        addLineRuleItemAreaView : function(options){
            var options = options || {};
            var lineItemView = new LineRuleItemAreaView({
                apprConfig : options.apprConfig,
                domain : options.domain,
                companyIds : options.companyIds,
                model : options.model,
                maxLength : options.maxLength
                });
            var parentDivEl = options.firstLineItemView.$el.find('.approvalLineConfig').closest('div.tool_bar');
            parentDivEl.append(lineItemView.render().$el);
            setPriorityOption(parentDivEl);
        }

    });
    return LineRuleDetailItemView;
    
    function setPriorityOption(targetApprLineRuleItemEl) {
    	var priorityOptionHtml = '';
    	for(var i=1; i<=targetApprLineRuleItemEl.find('[name="usePartDeptContainer"]').length; i++) {
    		priorityOptionHtml += '<option value='+i+'>'+i+'</option>'
    	}
    	
    	$.each(targetApprLineRuleItemEl.find('[name="usePartDeptContainer"]'), function(i, apprLineRuleItem) {
    		var priorityEl = $(apprLineRuleItem).find('select[name=priorityType]');
    		priorityEl.html(priorityOptionHtml);
			priorityEl.val(i+1);
    	});
    }

    //api에서 type이 duties, positions 같은걸로 넘어오므로 해당 값에 맞게 변경하여 셋팅.
    function convertRuleType(ruleType){
        return {
            'duty' : 'duties',
            'position' : 'positions',
            'grade' : 'grades'
        }[ruleType];
    }
    
    function checkUserType(data){
        //옵션 추가 버튼으로 왔을경우 isUserType이 있으므로 그 값으로 판단
        if(data['apprLineRuleItems'] && data.hasOwnProperty('isUserType')){
            return data.isUserType;
        }
        
        if(_.first(data['apprLineRuleItems']) && _.first(data['apprLineRuleItems']).hasOwnProperty('userId')){
            return true;
        }else{
            return false;
        }
    }
    
    /*
     * Deprecated
     */
    function findUserGroup(groups){
        //옵션 추가 버튼으로 왔을경우 isUserType이 있으므로 그 값으로 판단
        var grs = _.filter(groups, function(gr){
            return gr['apprLineRuleItems'] && (gr.hasOwnProperty('isUserType'));
        });
        if(grs.length > 0){
            return _.first(grs).isUserType;
        }
        //데이터를 api에서 받아와서 그리는 경우는 items의 userId값 존재여부로 판단.
        grs = _.filter(groups, function(gr){
            return gr['apprLineRuleItems'] && (gr['apprLineRuleItems'].length > 0);
        });
        if(grs.length < 1){
            return false;
        }
        var gr = _.first(grs);
        if(_.first(gr['apprLineRuleItems']).hasOwnProperty('userId')){
            return true;
        }else{
            return false;
        }
    }
});
