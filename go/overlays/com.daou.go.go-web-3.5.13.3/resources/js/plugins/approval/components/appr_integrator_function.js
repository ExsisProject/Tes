    define([
            "jquery",
            "backbone",
            "app"
    ],
    function(
        $,
        Backbone,
        GO
    ){
    	                 
    	//양식에 쓰이는 함수객체 
    	var Formfunc = Backbone.Model.extend({
            c_select : null,
            c_check : null,
            c_radio : null,
            c_table : null,
            initialize : function(options){
            	this.options = options || {};
            	this.variables = this.options.variables;
            	this.config = this.options.config || {};
            	this.infoData = this.options.infoData;
            	this.setComponentData();
            },
            
            setComponentData : function(){
        		this.c_select = this.config.select || [];
        		this.c_check = this.config.check ||[];
        		this.c_radio = this.config.radio || [];
        		this.c_table = this.config.table || [];            	
            },
    		/***
    		 * 테이블을 그린다.
    		 */
    		render : function(){
    			// TODO : selectbox, check, radio, table data draw
    			var toRenderComponenets = [];
    			// 이 양식에는 radio , testRadio func_setradio(testRadio,variables.aaa, event)
    			if(this.c_select.length > 0){
    				toRenderComponenets.push({type : 'cSel'});
    			}
    			if(this.c_check.length > 0){
    				toRenderComponenets.push({type : 'check'});
    			}
    			if(this.c_radio.length > 0){
    				toRenderComponenets.push({type : 'radio'});
    			}
    			if(this.c_table.length > 0){
    				toRenderComponenets.push({type : 'table'});
    			}
    			this.renderComponent(toRenderComponenets);
    		},
    		
    		renderComponent : function(componentList){
    			var self = this;
    			_.each(componentList, function(base_compo){
    				switch(base_compo.type){
    					case 'cSel' :
    						self.renderSelect(base_compo);
    						break;
    					case 'check' :
    						self.renderCheck(base_compo);    						
    						break;
    					case 'radio' :
    						self.renderRadio(base_compo);
    						break;
    						
    					case 'table' :
    						self.renderTable();
    					}
    			}, this);
    		},
    		
    		renderSelect : function(base_compo){
    			var self = this;
				_.each(self.c_select, function(component){
					var list = [];
					var targetEl = $(component.el);
					_.each(JSON.parse(self.variables[component.key]), function(m, k){
						list.push({
							value : m[component.data_id],
							text : m[component.data_text]
						});
					});
					var dsl = self.makeDsl(list.slice(0), base_compo.type);
					_.each(list, function(m){
						var item = $('<option value="'+ m.text +'" data-id="'+m.value+'">'+ m.text +'</option>'); 
						targetEl.append(item);
						$(item).data('attr', m.attr)
					});
					targetEl.attr('data-dsl', dsl);    							
				});
    		},
    		
    		renderCheck : function(base_compo){
    			var self = this;
				_.each(self.c_check, function(component){
					var list = [];
					var targetEl = $(component.el);
					var parent = targetEl.closest('span');
					var elId = self.getBaseId(targetEl);

					_.each(JSON.parse(self.variables[component.key]), function(m, key){
						list.push({
							value : m[component.data_id],
							text : m[component.data_text],
							id : elId + '_' + component.data_id
						});
					});
					var dsl = self.makeDsl(list.slice(0), base_compo.type);
					_.each(list, function(m){
						$('<input>').attr({
							'data-dsl' : dsl,
							id : m.text,
							name : targetEl.attr('id'),
							"data-require" : false,
							type : 'checkbox',
							"class" : 'editor_opt',
							"data-label" : m.text
						}).val(m.value).appendTo(parent);
						$('<label>').attr({
							"class" : 'editor_label',
							"data-type" : 'removeSpan'
						}).text(m.text).appendTo(parent);
					});
					targetEl.remove();    							
				});
    		},
    		
    		renderRadio : function(base_compo){
    			var self = this;
				_.each(self.c_radio, function(component){
					var list = [];
					var targetEl = $(component.el);
					var parent = targetEl.closest('span');
					var elId = self.getBaseId(targetEl);
					_.each(JSON.parse(self.variables[component.key]), function(m, k){
						list.push({
							value : m[component.data_id],
							id : elId + '_' + m[component.data_id],
							text : m[component.data_text]
						});
					});
					var dsl = self.makeDsl(list.slice(0), base_compo.type);
					_.each(list, function(m, index){
						$('<input>').attr({
							'data-dsl' : dsl,
							name : targetEl.attr('name'),
							id : m.id,
							"data-require" : false,
							"checked" : index == 0 ? true : false,
							type : 'radio',
							"class" : 'editor_opt',
							"data-label" : m.text
						}).val(m.value).appendTo(parent);
						$('<label>').attr({
							"class" : 'editor_label',
							"data-type" : 'removeSpan'
						}).text(m.text).appendTo(parent);
					});
					targetEl.remove();
				});
    		},
    		
    		renderTable : function(){
    			var self = this;
				_.each(this.c_table, function(component){
					var list = [];
					var targetEl = $(component.el);
					var thTpl = targetEl.find('tr').eq(0).clone();
					var tdTpl = targetEl.find('tr').eq(1).length > 0 ? targetEl.find('tr').eq(1).clone() : targetEl.find('tr').eq(0).clone();
					var colLength = $(thTpl).find('td').length;
					targetEl.data('thTpl', thTpl);
					targetEl.data('tdTpl', tdTpl);
					targetEl.find('tbody').empty();
					_.each(JSON.parse(self.variables[component.key]), function(m, index){
						var tpl;
						tpl = index <= colLength - 1 ? thTpl.clone() : tdTpl.clone();
						_.each(_.range(colLength), function(colIndex){
							$(tpl).find('td').eq(colIndex).text(m[component.data_colums[colIndex]]);
							$(tpl).appendTo(targetEl);
						});
					});
				});
    		},
    		
    		renderTableByData : function(dataList, component){
    			var self = this;
				var list = [];
				var targetEl = $(component.el);
				var thTpl = targetEl.data('thTpl');
				var tdTpl = targetEl.data('tdTpl'); 
				var colLength = $(thTpl).find('td').length;
				targetEl.find('tbody').empty();
				_.each(dataList, function(m, index){
					var tpl;
					tpl = index <= colLength - 1 ? thTpl.clone() : tdTpl.clone();
					_.each(_.range(colLength), function(colIndex){
						$(tpl).find('td').eq(colIndex).text(m[component.data_colums[colIndex]]);
						$(tpl).appendTo(targetEl);
					});
				});
    		},
    		
    		getBaseId : function(targetEl){
    			var id;
    			if(targetEl.attr("name") && targetEl.attr("name").split('_').length > 2){
    				id = targetEl.attr("name").split('_')[0] + '_' + targetEl.attr("name").split('_')[1];
    			}else{
    				id = '';
    			}
    			return id;
    		},
    		
    		makeDsl : function(list, type){
    			
    			var dsl = '{{'+type; 
    			_.each(list, function(m){
    				if(type == 'cSel'){
    					dsl += '_' + m.text;
    				}else if(type == 'check'){
    					dsl += '_' + m.value;    					
    				}else{
    					dsl += '_' + m.value;
    				}
    			});
    			dsl += '}}';
    			return dsl;
    		}
    	}); //Formfunc end
    	
    	return Formfunc;
    });
