define([
	"app",
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
	"i18n!approval/nls/approval",
	
    "admin/models/approval/integration_query",
    "admin/collections/approval/integration_query",
    "admin/views/approval/appr_form_integration/appr_form_parameter_layer",
    "admin/constants/integration_config",
	
], 
function(
	GO,
	commonLang,
    adminLang,
    approvalLang,
		
	IntegrationQueryModel,
	IntegrationQueryCollection,
	ParameterLayerView,
	IntegrationConfig
    
    
) {	
	var lang = {
			"Exucute Query" : "Exucute Query",
			"parameters" : "parameters",
			"Drafted" : approvalLang["기안완료"],
			"Cancel Drafted" : approvalLang["기안취소"],
			"Activity Complete" : approvalLang["중간결재완료"],
			"Document Return" : approvalLang["반려완료"],
			"Document Complete" : approvalLang["결재완료"],
			"추가" : commonLang["추가"],
			"삭제" : commonLang["삭제"]
	}
	
	var ParamTpl = ['<li name="param"><span data-id="paramWrap">',
	            '<span class="name" name="output_parameters" data-dataType="{{dataType}}" data-paramName = "{{paramName}}" data-paramType = "{{paramType}}">{{paramName}} ({{dataType}})</span>',
	       		'<span name="dataTypeParamDel" class="btn_wrap"><span class="ic ic_del" title="'+commonLang["삭제"]+'"></span></span></li>'].join('');
	
	var RowTpl = ['<td class="chk"><input type="checkbox"/></td><td><textarea data-id="query" class="w_full" row-id={{id}}>{{query}}</textarea></td>',
	              '<td name="parameterTd"><ul class="name_tag basic_tag">',
	              '<li class="creat"><span name="outputTabRowAdd" class="btn_wrap"><span class="ic ic_addlist"></span><span class="txt">'+ commonLang["추가"] +'</span></span></li></ul>',
	              '</td>'].join('')
	var RowView = Backbone.View.extend({
		tagName : 'tr',
		initialize : function(options) {
			this.options = options || {};
			this.observer = this.options.observer;
			this.model = this.options.model;
			this.approvalStep = this.options.approvalStep;
			this.$el.data('instance', this);
		},
		events : {
			'click .ic_del' : 'deleteParameter',
			'click span[name=outputTabRowAdd]' : 'popupAddParameterLayer'
		},
		
		getData : function(){
			var parameters = $.map(this.$('span[name="output_parameters"]'), function(element, i){
				return {
					dataType : $(element).attr('data-dataType'),
					paramName : $(element).attr('data-paramName'),
					paramType : $(element).attr('data-paramType'),
					seq : i
				};
			});
			return {
				id : this.$('textarea[data-id="query"]').attr('row-id'),
				query : this.$('textarea[data-id="query"]').val(),
				parameters : parameters,
				approvalStep : this.approvalStep
			}
		},
		
		deleteParameter : function(e){
			$(e.currentTarget).closest('span[data-id="paramWrap"]').remove();
		},
		
		addParameter : function(data){
			this.$('.creat').before(Hogan.compile(ParamTpl).render(data));
		},
		
		popupAddParameterLayer : function(){
            var parameterLayer = $.goPopup({
                "pclass" : "layer_normal parameter_popup",
                "header" : 'Parameter Config',
                "modal" : true,
                "width" : 600,
                "allowPrevPopup" : true,
                "contents" :  "",
                "buttons" : [
                    {
                        'btext' : commonLang["취소"],
                        'btype' : 'cancel'
                    }
                ]
            });
            
            //var layerParameters = [];
            /*var modelParam = this.model.get('parameters');
            if(modelParam){
            	//"DOCUMENT" 만 필터링
            	var modelParam = _.filter(modelParam, function(param){
    				return param.paramType == 'DOCUMENT'
    			});
            	_.each(modelParam, function(param){
            		parameters.push({
            			dataType: param.dataType,
            			isDocument: true,
            			paramName: param.paramName,
            			paramType: "DOCUMENT"
            		});
            	});
            }*/
            
            /*var tempDocumentData = [{
				dataType: "NUMBER",
				isDocument: true,
				paramName: "getId",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getEmployeeNumber",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getTitle",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getDocNum",
				paramType: "DOCUMENT"
			},{
				dataType: "NUMBER",
				isDocument: true,
				paramName: "getDrafterId",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getDrafterName",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getDrafterDeptName",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getStatus",
				paramType: "DOCUMENT"
			},{
				dataType: "NUMBER",
				isDocument: true,
				paramName: "getFormId",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getFormName",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getFormCode",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getBody",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getCurrEmpNo",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getCurrEmpName",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getCurrEmpDeptName",
				paramType: "DOCUMENT"
			}];
            
            _.each(tempDocumentData, function(param){
            	layerParameters.push({
        			dataType: param.dataType,
        			isDocument: param.isDocument,
        			paramName: param.paramName,
        			paramType: param.paramType
        		});
        	});
            
            
            var nodeParameters = this.$('[data-id=paramWrap] > [name=output_parameters]');
            _.each(nodeParameters, function(param){
            	if($(param).attr('data-paramtype') != 'DOCUMENT'){
        			layerParameters.push({
            			dataType: $(param).attr('data-datatype'),
            			isDocument: false,
            			paramName: $(param).attr('data-paramname'),
            			paramType: $(param).attr('data-paramtype')
            		});
            	}
            });*/
            
            var parameterLayerView = new ParameterLayerView({
            	model : this.model,
            	observer : this.observer
            	//parameters : layerParameters
            });
            
            parameterLayerView.render();
            parameterLayerView.on('addParameter', _.bind(this.addParameter, this));
            parameterLayer.reoffset();

		},
		
		render : function(){
			var self = this;
			this.$el.append(Hogan.compile(RowTpl).render(this.model.toJSON()));
			_.each(this.model.get('parameters'), function(m){
				this.$('.creat').before(Hogan.compile(ParamTpl).render(m));
			}, this);
			return this;
		}
	})
	
	var TabItemTpl = ['<table class="in_table direct_access_form" id="{{tabId}}">',
							'<thead>',
								'<tr>',
									'<th class="sorting_disable chk"><span class="txt"><input type="checkbox" id="outputDataTypeAllCheck"></span></th>',
									'<th class="sorting_disable"><span class="title_sort">'+ lang["Exucute Query"] +'</span></th>',
									'<th class="sorting_disable"><span class="title_sort">'+ lang["parameters"] +'</span></th>',
								'</tr>',
							'</thead>',
							'<tbody>',
					'</tbody></table>'].join('');
	
	var TabItemView = Backbone.View.extend({
//		el : '#outputDataTable',
		tagName : 'div',
		initialize : function(options) {
			this.options = options || {};
			this.collection = this.options.collection;
			this.observer = this.options.observer;
			this.approvalStep = this.options.approvalStep;
			this.tabId = this.options.tabId;
		},
		render : function(){
			var self = this;
			this.$el.append(Hogan.compile(TabItemTpl).render({tabId : this.tabId}));
			this.collection.each(function(m){
				var rowView = new RowView({model : m, observer : self.observer, approvalStep : self.approvalStep});
				self.$('tbody').append(rowView.render().$el);
			});
			this._itemsSortable(this.tabId);
			return this;
		},
		_itemsSortable : function(tabId) {
			this.$el.find('table#' + tabId + ' tbody ul.name_tag').sortable({
				opacity : "1",
				delay: 100,
				cursor : "move",
				items : "li:not('.creat')",
				//containment : ".name_tag",
				hoverClass: "ui-state-hover",
				forceHelperSize : "true",
				helper : "clone",
				placeholder : "ui-sortable-placeholder",
			    start : function (event, ui) {
			    	ui.placeholder.html(ui.helper.html());
			    	//ui.placeholder.html('<li name="param" style="display: block;"></li>');
			    }
			}).sortable('enable');
		},
		
		getData : function(){
			var data = [];
			this.$('tbody tr').each(function(idx, rowView){
				var instance = $(rowView).data('instance');
				data.push(instance.getData());
			});
			return data;
		},
		
		addRow : function(){
			var rowView = new RowView({
				observer : this.observer,
				approvalStep : this.approvalStep,
				model : new IntegrationQueryModel()
			});
			this.$('tbody').append(rowView.render().$el);
		},
		active : function(){
			this.$el.find('#'+this.tabId).show();
		},
		deactive : function(){
			this.$el.find('#'+this.tabId).hide();
		}
	});
	
	var DirectAccessTabTpl = ['<div class="tab_menu_wrap">',
					'<ul class="tab_menu" id="tabControll">',
						'<li class="active" data-type="ACTIVE" id="DRAFT"><span class="txt">'+lang["Drafted"]+'</span></li>',
						'<li data-type="CLOSED" id="CANCEL"><span class="txt">'+lang["Cancel Drafted"]+'</span></li>',
						'<li data-type="CLOSED" id="INPROGRESS"><span class="txt">'+lang["Activity Complete"]+'</span></li>',
						'<li data-type="CLOSED" id="RETURN"><span class="txt">'+lang["Document Return"]+'</span></li>',
						'<li data-type="CLOSED" id="APPROVAL"><span class="txt">'+lang["Document Complete"]+'</span></li>',
					'</ul>',
				'</div>',
				'<span class="btn_wrap">',
					'<span class="btn_s btnRowAdd">'+lang["추가"]+'</span>',
					'<span class="btn_s btnRowDelete">'+lang["삭제"]+'</span>',
				'</span>',
				'<div class="" id="outputDataTable">',
				'</div>'].join('');
	
	var DirectAccessTabView = Backbone.View.extend({
		el : '#outputDirectAccessDataTypeArea',
		tabViews : null,
		initialize : function(options) {
			this.collection = options.collection;
			this.observer = options.observer;
			this.tabViews = [];
		},
		
		events : {
			'click ul.tab_menu li' : 'toggleTab',
			'click .btnRowAdd' : 'addRow',
			'click .btnRowDelete' : 'deleteRow',
			'click #outputDataTypeAllCheck' : '_outputDataTypeAllCheck'
		},
		
		toggleTab : function(e){
			var target = $(e.currentTarget);
			var id = target.attr('id');
			this.$('.tab_menu li').removeClass('active');
			target.addClass('active');
			this.activeTab(id);
		},
		
		getData : function(){
			var outputQueries = [];
			_.each(this.tabViews, function(tabView){
				outputQueries.push(tabView.getData());
			});
			return {outputQueries : _.flatten(outputQueries, true)};
		},
		
		validate : function(){
			var self = this;
			var result = true;
			if($('#selectOutputDataType').val() == 'STRING') return result;
			_.each(IntegrationConfig.OUTPUT_DATATYPE_TAB, function(status){
				var queries = self.$('#'+status.tableID + ' > tbody [data-id=query]');
				if(queries.length > 0){
					queries.each(function(idx, query){
						var re = new RegExp(/\?/g);
					    var resultArray = $(query).val().match(re);
					    var quetionMarkCount = (resultArray && resultArray.length) || 0;
						if(_.isEmpty($(query).val())){
							$.goMessage(GO.i18n(adminLang['output {{tabName}}의 Query를 입력해 주세요'], "tabName", status.tabName));
							result = false;
						}else if($(query).closest('tr').find('[data-id=paramWrap]').length != quetionMarkCount){
							$.goMessage(GO.i18n(adminLang['output {{tabName}}의 Query/Parameter 설정이 잘못되었습니다'], "tabName", status.tabName));
							result = false;
						}
					});
				}
			}, this);
			return result;
		},
		
		addRow : function(){
			this.activeTabView.addRow();
		},
		
		deleteRow : function(e){
			var activedTab = this.$('#tabControll li.active').attr('id');
			this.$('table#'+activedTab+' tbody input[type="checkbox"]:checked').each(function(i, v){
				var rowView = $(v).closest('tr').data('instance');
				rowView.remove();
			});
			this.$('table#'+activedTab+' #outputDataTypeAllCheck').attr("checked", false);
		},
		
		activeTab : function(tabId){
			if(this.activeTabView){
				this.activeTabView.deactive();
			}
			var tabView = _.findWhere(this.tabViews, {tabId : tabId});
			tabView.active();
			this.activeTabView = tabView;
		},
		
		render : function() {
			this.$el.html(Hogan.compile(DirectAccessTabTpl).render({lang : lang}));
			this.addAllTabViews();
			this.activeTab('DRAFT');
		},
		
		addAllTabViews : function(){
			var apprStatusList = _.toArray(IntegrationConfig.APPR_STATUS);
			_.each(apprStatusList, function(status){
				var matches = _.where(this.collection.toJSON(), {approvalStep : status});
				var tabItemView = new TabItemView({
					collection : new IntegrationQueryCollection(matches),
					observer : this.observer,
					tabId : status,
					approvalStep : status
				});
				this.tabViews.push(tabItemView);
				this.$('#outputDataTable').append(tabItemView.render().$el);
				tabItemView.deactive();
			}, this);
		},
		
		_outputDataTypeAllCheck: function(e){
			if($(e.currentTarget).is(':checked')){
				_.each($(e.currentTarget).closest('table').find('input[type=checkbox]'),function(checkbox){
					$(checkbox).attr("checked", true);
				});
			}else{
				_.each($(e.currentTarget).closest('table').find('input[type=checkbox]'),function(checkbox){
					$(checkbox).attr("checked", false);
				});
			}
		}
	});
			
	return DirectAccessTabView;
});