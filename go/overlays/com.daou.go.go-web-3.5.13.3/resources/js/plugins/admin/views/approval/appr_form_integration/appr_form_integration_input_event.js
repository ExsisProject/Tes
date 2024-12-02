define([
    "app",
    
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
	"i18n!approval/nls/approval",
	
    "admin/collections/approval/integration_query",	
    "admin/models/approval/integration_query",
    
    "hgn!admin/templates/approval/appr_form_integration/appr_form_integration_input_event",
	"hgn!admin/templates/approval/appr_form_integration/appr_form_integration_input_event_query",
    "hgn!admin/templates/approval/appr_form_integration/appr_form_integration_input_event_query_item"
], 
function(
	GO,
		
    commonLang,
    adminLang,
    approvalLang,
    
    IntegrationQueryCollection,
    IntegrationQueryModel,
    
    InputEventTpl,
    InputEventQueryTpl,
    InputEventQueryItemTpl
    
) {	
	var lang = {
			"값을 입력해 주세요" : commonLang["값을 입력해 주세요"],
			"삭제 대상을 선택해 주세요" : commonLang["삭제 대상을 선택해 주세요"],
			"이미 동일한 이름의 이벤트가 있습니다" : approvalLang["이미 동일한 이름의 이벤트가 있습니다"],
			"input Event의 Query를 입력해 주세요" : approvalLang["input Event의 Query를 입력해 주세요."],
			"Event List" : "Event List",
			"추가" : commonLang["추가"],
			"삭제" : commonLang["삭제"],
			"Query" : "Query",
			"Parameters" : "Parameters",
			"Param type" : "Param type",
			"Return" : "Return",
			"STRING" : "STRING",
			"NUMBER" : "NUMBER",
			"BOOLEAN" : "BOOLEAN"
	}
	
	var EventRowView = Backbone.View.extend({
		tagName : "li",
		initialize : function(options) {
			this.options = options || {};
			this.model = this.options.model;
			this.$el.data('instance', this);
		},
		events : {
			'click [name="inputEvent"]' : '_renderInputEventConfig',
			'click .ic_del' : '_inputEventDelete'
		},
		render : function(){
			var addNameValue = $('#inputEventAddName').val();
			if(this.model.get('name') != undefined){
				addNameValue = this.model.get('name');
			}					
			var html = ['<span class="name" name="inputEvent" data-name="'+ addNameValue +'">' + addNameValue + '</span>',
	            		'<span class="btn_wrap"><span class="ic ic_del"></span></span>'];
			this.$el.html(html.join(''));
			return this;
		},
		_renderInputEventConfig : function(e){
			$('#inputEventList').find('li').removeClass('active');
			this.$el.addClass('active');
			this.trigger('_renderInputEventConfig', this.model);
		},
		
		_inputEventDelete: function(e){
			var self = this;
			var $target = $(e.target);
        	$($target).closest('li').remove();
        	var itemView = $('#inputEventQueryList tr:eq(0)').data('instance');
			if(itemView){
				var itemViewModel = itemView.model;
				if(itemViewModel == self.model){					
					this.trigger('_renderInputEventConfig');
				}
			}
		},
		
		getData: function(){
			var returnValue = {
				id: this.model.get('id'),
				name: this.model.get('name'),
				eventQueries: this.model.get('eventQueries').toJSON(),
				approvalStep: 'CREATE',
				multiRow: true
			}
			return returnValue;
		}
		
	});
	
	var QueryItemView = Backbone.View.extend({
		tagName : "tr",
		initialize : function(options) {
			this.options = options || {};
			this.model = this.options.model;
/*			var defaultModel = new IntegrationQueryModel({
				query : '',
				returnMethod : '',
				parameters : []
			}); */
			this.queryModel = this.options.queryModel;
			this.$el.data('instance', this);
		},
		events : {
			'keyup [name=inputEventQuery]' : '_saveQuery',
			'blur [name=inputEventQuery]' : '_paramSet',
			'keyup [name=returnMethod]' : '_saveReturnMethod',
			'keyup [name=parametersName]' : '_saveParametersName',
			'change [name=parametersType]' : '_saveParametersType'
				
		},
		
		render : function(){
			var self = this;
			var parameters = _.map(self.queryModel.get('parameters'), function(param){
				if(param.dataType == 'STRING'){
					param.isSTRING = true;
				}else if(param.dataType == 'NUMBER'){
					param.isNUMBER = true;
				}else if(param.dataType == 'BOOLEAN'){
					param.isBOOLEAN = true;
				}
				return param;
			});
			
			this.$el.empty();
			this.$el.append(InputEventQueryItemTpl({
				lang: lang,
				model: self.queryModel.toJSON(),
				parameters: parameters
			}));
			return this;
		},
		_paramSet: function(e){
			var orgParameters = this.queryModel.get('parameters') || [];
			var $target = $(e.currentTarget);
		    var re = new RegExp(/\?/g);
		    var resultArray = $target.val().match(re);
		    var quetionMarkCount = (resultArray && resultArray.length) || 0;
		    var diff = quetionMarkCount - orgParameters.length;
		    if(orgParameters.length < quetionMarkCount){ //?갯수가 늘어날 경우
		    	_.each(_.range(diff), function(index){
		    		orgParameters.push({
		    			dataType : 'STRING',
    					paramName : '',
    					paramType : 'VARIABLE',
    					seq : index
		    		});
		    	});
		    	this.queryModel.set('parameters', orgParameters);
		    }else if(orgParameters.length > quetionMarkCount){ //? 갯수가 줄었을경우
		    	_.each(_.range(-diff), function(index){
		    		orgParameters.pop();	    		
		    	});
		    	this.queryModel.set('parameters', orgParameters);
		    }
		    
		    var eventQueries = this.model.get('eventQueries');
		    var m = eventQueries.get(this.queryModel);
		    m.set(this.queryModel.toJSON());
		    
		    this.model.set('eventQueries', eventQueries);
		    this.render();
			
		},
		_saveQuery: function(e){
			var $target = $(e.currentTarget);
			this.queryModel.set('query', $target.val());
		},
		
		_saveReturnMethod: function(e){
			var $target = $(e.currentTarget);
			this.queryModel.set('returnMethod', $target.val());
		},
		
		_saveParametersName: function(e){
			var $target = $(e.currentTarget);
			var parameters = _.map(this.queryModel.get('parameters'), function(param){
				if(param.seq == $target.attr('data-seq')){
					param.paramName = $($target).val();
				}
				return param;
			});
			this.queryModel.set('parameters', parameters);
		}, 
		
		_saveParametersType: function(e){
			var $target = $(e.currentTarget);
			var parameters = _.map(this.queryModel.get('parameters'), function(param){
				if(param.seq == $target.attr('data-seq')){
					param.dataType = $($target).val();
				}
				return param;
			});
			this.queryModel.set('parameters', parameters);
		}
		
	});
	
	var InputEventView = Backbone.View.extend({
		el : "#inputEvent",
		eventListModel : null,
		initialize : function(options) {
			this.options = options || {};
			this.model = this.options.model;
		},
		
		events : {
			'click [name=inputEventAdd]' : '_clickBtnInputEventAdd',
			'click .btnRowAdd' : '_clickQueryItemAdd',
			'click .btnRowDelete' : '_queryItemDelete',
			'click #inputEventAllCheck' : '_inputEventAllCheck'
		},
		
		render : function() {
			var self = this;
			this.$el.html(InputEventTpl({
				lang: lang
			}));
			
			this.model.get('events').each(function(model){
				model.set('eventQueries', new IntegrationQueryCollection(model.get('eventQueries')));
				self._inputEventAdd(model);
			});
		},
		
		_inputEventAllCheck: function(e){
			if($(e.currentTarget).is(':checked')){
				_.each(this.$('#inputEventQueryList input[type=checkbox]'),function(checkbox){
					$(checkbox).attr("checked", true);
				});
			}else{
				_.each(this.$('#inputEventQueryList input[type=checkbox]'),function(checkbox){
					$(checkbox).attr("checked", false);
				});
			}
		},
		
		//eventList 추가 버튼 클릭
		_clickBtnInputEventAdd: function(e){
			var result = true;
			var name = this.$('#inputEventAddName').val();
			if(name == ''){
				$.goMessage(lang['값을 입력해 주세요']);
				return false;
			}
			var inputEventList = this.$('[name=inputEvent]');
			_.each(inputEventList, function(event){
				if($(event).attr('data-name') == this.$('#inputEventAddName').val()){
					result = false;
					return false;
				}
			});
			if(!result){
				$.goMessage(lang['이미 동일한 이름의 이벤트가 있습니다']);
				return false;
			}
			
			if(result){
				var model = new IntegrationQueryModel({
					name : name,
					eventQueries : new IntegrationQueryCollection()
				});
				this._inputEventAdd(model, 'new');
			}
		},
		
		_inputEventAdd: function(model, state){
			var eventRowView = new EventRowView({
				//events Collections의  하나의 model
				model : model
			});
			this.$('#inputEventList').append(eventRowView.render().$el);
			eventRowView.on('_renderInputEventConfig', _.bind(this._renderInputEventConfig, this));
			
			if(state == 'new'){
				$(eventRowView)[0].$el.find('[name=inputEvent]').click();
			}
			
			this.$('#inputEventAddName').val('');
		},
		
		_renderInputEventConfig: function(model){
			var self = this;
			this.eventListModel = model;
			this.$('#inputEventQuery').html(InputEventQueryTpl({
				lang: lang
			}))
			var eventQueries = (this.eventListModel != undefined) ? this.eventListModel.get('eventQueries') : null;
			if(eventQueries){
				eventQueries.each(function(queryModel){
					self._queryItemAdd(self.eventListModel, queryModel);
				});
			}
		},
		
		_clickQueryItemAdd: function(e){ // detail 테이블 추가버튼
			var self = this;
			/*var model = new IntegrationQueryModel({
				eventQueries : new IntegrationQueryCollection(new IntegrationQueryModel({
					query : '',
					returnMethod : '',
					parameters : []
				}).toJSON())
			});*/

			var toAddModel = new IntegrationQueryModel({
				query : '',
				returnMethod : '',
				parameters : []
			});
			
			var eventQueries = self.eventListModel.get('eventQueries');
			eventQueries.add(toAddModel);
			this._queryItemAdd(self.eventListModel, toAddModel);
		},
		
		_queryItemAdd: function(model, queryModel){
			var queryItemView = new QueryItemView({model : model, queryModel : queryModel});
			this.$('#inputEventQueryList').append(queryItemView.render().$el);
			
			/*//추가 버튼 클릭으로 빈 row 추가
			if(model == undefined){
				var itemView = this.$('#inputEventQueryList tr:eq(0)').data('instance');
				if(itemView){
					var itemViewModel = itemView.model;
					itemViewModel.get('eventQueries').add(new IntegrationQueryModel());
				}
			}*/
		},
		
		_queryItemDelete: function(e){
			var targets = this.$('#inputEventQueryList input[type="checkbox"]:checked');
			if(targets.length == 0){
				$.goMessage(lang['삭제 대상을 선택해 주세요']);
				return false;
			}
			
			_.each(targets, function(obj){
	        	var itemView = $(obj).closest('tr').data('instance');
	        	var itemViewModel = itemView.model; //왼쪽 리스트의 하나의 레코드 모델
	        	var itemViewQueryModel = itemView.queryModel; //itemViewModel안에 있는 eventQueries값. 콜렉션 형태이며 이 콜력선중에 하나의  모델.
	        	itemViewModel.get('eventQueries').remove(itemViewQueryModel); 
	        	itemView.$el.remove();
			},this);
			
			$('#inputEventAllCheck').attr("checked", false);
		},
		
		getData: function(){
			var rowViewData = [];
			this.$('#inputEventList li').each(function(idx, rowView){
				var instance = $(rowView).data('instance');
				rowViewData.push(instance.getData());
			});
			this.model.set('events',rowViewData);
			
			return _.extend({},{
				//events : new IntegrationQueryCollection(this.model.get('events'))
				events : this.model.get('events')
			});
		},
		
		validate: function(){
			var result = true;
			var rowViewData = [];
			this.$('#inputEventList li').each(function(idx, rowView){
				var instance = $(rowView).data('instance');
				rowViewData.push(instance.getData());
			});
			new IntegrationQueryCollection(rowViewData).each(function(eventRow){
				if(eventRow.get('eventQueries').length > 0){
					new IntegrationQueryCollection(eventRow.get('eventQueries')).each(function(queryRow){
						if(_.isEmpty(queryRow.get('query'))){
							$.goMessage(approvalLang['input Event의 Query를 입력해 주세요']);
							result = false;
							return false;
						}
					});
				}else if(eventRow.get('eventQueries').length == 0){
					$.goMessage(GO.i18n(adminLang['{{eventName}} event의 Query가 설정 되지 않았습니다'], "eventName", eventRow.get('name')));
					result = false;
					return false;
				}
			});
			return result;
		}
		
	});
			
	return InputEventView;
});