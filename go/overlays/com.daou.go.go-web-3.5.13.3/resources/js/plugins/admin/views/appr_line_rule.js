//자동결재선 설정
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    
    "hgn!admin/templates/appr_line_rule_list",
    "hgn!admin/templates/appr_line_rule_list_item",
    "hgn!approval/templates/doclist_empty",
    
    "i18n!approval/nls/approval",
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
    "jquery.ui",
    "jquery.go-sdk"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	
	LineRuleListTpl,
	LineRuleListItemTpl,
	LineRuleListEmptyTpl,
	
	approvalLang,
    commonLang,
    adminLang
) {	
	var baseApi = GO.contextRoot + 'ad/api/',
		lang = {
			"자동결재선 명" : approvalLang['자동결재선 명'],
			"적용된 양식수" : adminLang['적용된 양식수'],
			"결재선" : approvalLang['결재선'],
			"자동결재선 설정" : adminLang['자동결재선 설정'],
			"순서바꾸기" : commonLang['순서바꾸기'],
			"순서바꾸기 완료" : commonLang['순서바꾸기 완료'],
			'추가' : commonLang['추가'],
			'삭제' : commonLang['삭제'],
			'reorder_changed' : commonLang['변경되었습니다.'],
			'empty_msg' : approvalLang['자료가 없습니다'],
			'delete_success_msg' : commonLang['삭제하였습니다.'],
            'delete_fail_msg' : commonLang['삭제하지 못했습니다.']
	};

	var LineRuleModel = Backbone.Model.extend();
	var LineRuleList = Backbone.Collection.extend({
		model : LineRuleModel,
		url: function() {
			return GO.contextRoot + 'ad/api/approval/apprlinerule';
		}
	});
	
	var LineRuleListView = Backbone.View.extend({
		el: '#layoutContent',
		initialize: function() {
			this.collection = new LineRuleList();
			this.collection.bind('reset', this.resetList, this);
		},
		delegateEvents: function(events) {
            this.undelegateEvents();
            Backbone.View.prototype.delegateEvents.call(this, events);
            this.$el.on("click.addLineRule", "#btnAdd", $.proxy(this._addLineRule, this));
            this.$el.on("click.delLineRule", "#btnDelete", $.proxy(this._delLineRule, this));
            this.$el.on("click.changeOrder", "#btnReorder", $.proxy(this._changeOrder, this));
            this.$el.on("click.saveOrder", "#btnReorderSave", $.proxy(this._saveOrder, this));
            this.$el.on("click.viewLineRule", "td.name span.txt a", $.proxy(this._viewLineRule, this));
            
            this.$el.on("click.checkLineRull", "#check_all", $.proxy(this._checkLineRull, this));
        }, 
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.off();
            return this;
        },
        
        _checkLineRull : function(e){
        	var el = $(e.currentTarget),
            checkboxes = this.$el.find('input:checkbox');
	        if (el.is(':checked')) {
	            checkboxes.attr('checked', 'checked');
	        } else {
	            checkboxes.removeAttr('checked');
	        }
        },
        
        _viewLineRule : function(e){
        	var id = $(e.currentTarget).closest('tr').find('input:checkbox').val();
            GO.router.navigate('approval/apprlinerule/'+id, {trigger: true});
        },
        _addLineRule : function(){
            GO.router.navigate('approval/apprlinerule/create', {trigger: true});
            return false;
        },
        _delLineRule : function(){
        	var self = this,
        		formIds = [],
				isDocumnetsUsing = false,
				apprLineRules = this.$el.find('input[name=id]:checked');

        	// Validation 1 - 양식 선택 유무 체크
            if (apprLineRules.length == 0) {
                $.goMessage(approvalLang['양식을 선택해 주세요.']);
                return false;
            }

			// Validation 2 - 자동결재선 사용 유무 체크
            apprLineRules.each(function(idx, el) {
		        formIds.push($(this).val());
				if($(el).closest('tr').find('td:eq(2)').text() != '0'){
					isDocumnetsUsing = true;
				}
			});
            if (isDocumnetsUsing) {
				$.goMessage(approvalLang['이미 양식에 적용중인 자동결재선은 삭제할 수 없습니다']);
				return false;
			}

			$.goConfirm(adminLang['삭제하시겠습니까?'], "", function() {
				$.go(baseApi + 'approval/apprlinerule', JSON.stringify({ids: formIds}), {
					qryType : 'DELETE',
					contentType: 'application/json',
					async: false,
					responseFn : function(rs) {
						$.goMessage(lang['delete_success_msg']);
						self.render();
					},
					error : function(error) {
						$.goMessage(lang['delete_fail_msg']);
						self.render();
					}
				});
			});
        },
        _changeOrder : function(){
        	$("#btnReorder").hide();
        	$("#btnReorderSave").show();
        	this._renderForReorderView();
        },
        
        _renderForReorderView: function() {
            if (this.$('table tbody tr').length == 0) {
                $.goMessage(lang['empty_msg']);
                return false;
            }
            
            this.$('table tbody').sortable({
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
        },
        
        _saveOrder : function(){
        	var url = baseApi + 'approval/apprlinerule/sort',
            sortoderIds,
            ajaxCallback;

	        sortoderIds = this.$('table tbody tr').map(function(k,v) {
	            return $(v).find('input[name="id"]').val();
	        }).get();
	        
	        ajaxCallback = function(rs) {
	            if(rs.code == 200){
	                $.goMessage(lang['reorder_changed']);
	                $("#btnReorder").show();
	    			$("#btnReorderSave").hide();
	    			this._sortableSwitch('off');
	            }else if(rs.code != 200) {
	                $.goMessage(rs.message);
	                this.render();
	            }
	        };
	
	        $.go(url, JSON.stringify({ ids : sortoderIds }), {
	            async: false,
	            qryType : 'PUT',
	            contentType : 'application/json',
	            responseFn : $.proxy(ajaxCallback, this)
	        });
	        
        },
        
        _sortableSwitch: function(state){
        	if(state == 'on'){
        		this.$('table tbody').addClass("ui-sortable");
                this.$('table tbody tr').removeClass("disabled");
        	}else if(state == 'off'){
        		this.$('table tbody').removeClass("ui-sortable");
    			this.$('table tbody tr').addClass("disabled");
        	}
        },
        
		render: function() {
			this.$el.html(LineRuleListTpl({
				lang: lang
			}));
			$("#btnReorderSave").hide();
			this.collection.fetch({
				statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                },
                reset : true
			});
		},		

		
		resetList: function(list) {
			$('.chart.tb_admin_autoApproveLine > tbody').empty();
			if (list.length == 0) {
				$('.chart.tb_admin_approval > tbody').append(this._renderEmptyTmpl({
                    lang : lang
                }));
			}else{
				$(list.toJSON()).each(function(k, v){
					var data = {
							id : v.id,
							name : v.name,
							adjustedFormCount : v.adjustedFormCount,
							apprLineSummary : v.apprLineSummary
					};
					
					$('.chart.tb_admin_autoApproveLine > tbody').append(LineRuleListItemTpl({
						data : data
					}));
				});
			}
		},
		
        _renderEmptyTmpl: function(data) {
            var htmls = [];
            htmls.push('    <tr>');
            htmls.push('        <td colspan="4">');
            htmls.push('            <p class="data_null">');
            htmls.push('                <span class="ic_data_type ic_no_data"></span>');
            htmls.push('                <span class="txt">{{lang.empty_msg}}</span>');
            htmls.push('            </p>');
            htmls.push('        </td>');
            htmls.push('    </tr>');

            var compiled = Hogan.compile(htmls.join('\n'));
            return compiled.render(data);
        },
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	return LineRuleListView;
});