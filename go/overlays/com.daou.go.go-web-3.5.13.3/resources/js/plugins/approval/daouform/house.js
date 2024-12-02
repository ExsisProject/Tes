    define([
            "jquery",
            "backbone",
            "app",
            "approval/components/appr_integrator_function"
    ],
    function(
        $,
        Backbone,
        GO,
        IntegratorFunction
    ){
    	var config = {
    			select : [{
    				el : '#cseltest',		// 양식의 selectBox 엘리먼트 ID
    				key : 'selCond1',		// 연동 데이터중 selectBox에 들어갈 key값 셋팅 {selCon1:[{val2:값1,val3:이름1}{val2:값2,val3:이름2}}]
    				data_id : 'val2',		// key값에서 selectBox에 value로 들어갈 값
    				data_text : 'val3'		// key값에서 selectBox에 text로 들어갈 값
    			}],
    			check : [{					
    				el : '#checktest',		// 양식의 checkBox 엘리먼트 ID
    				key : 'rdoCond3',		// 연동 데이터중 checkBox에 들어갈 key값 셋팅 {selCon1:[{val2:값1,val3:이름1}{val2:값2,val3:이름2}}]
    				data_id : 'id',			// key값에서 checkBox에 value로 들어갈 값
    				data_text : 'val3'		// key값에서 checkBox에 text로 들어갈 값
    			}],
    			radio : [{  //radio가 2개인 경우 .
    				el : '#radiotest1',		// 양식의 Radio 엘리먼트 ID
    				key : 'rdoCond1',		// 연동 데이터중 Radio에 들어갈 key값 셋팅 {selCon1:[{val2:값1,val3:이름1}{val2:값2,val3:이름2}}]
    				data_id : 'id',			// key값에서 Radio에 value로 들어갈 값
    				data_text : 'val3'		// key값에서 Radio에 text로 들어갈 값
    			},{
    				el : '#radiotest2',		// 양식의 Radio 엘리먼트 ID                                                        
    				key : 'rdoCond2',       // 연동 데이터중 Radio에 들어갈 key값 셋팅 {selCon1:[{val2:값1,val3:이름1}{val2:값2,val3:이름2}]}
    				data_id : 'id',         // key값에서 Radio에 value로 들어갈 값                                               
    				data_text : 'val3'      // key값에서 Radio에 text로 들어갈 값                                                
    			}],
    		    table : [{
    		        el : '#testTable',		// 양식의 Table 엘리먼트 ID
    		        key : 'tData',			// 연동 데이터중 Table Row에  들어갈 key값 셋팅 {tData:[{id:값1,val1:이름1, val2 : 주소1},{id:값2,val1:이름2, val2 : 주소3}]}
    		        data_colums : ['id', 'val1', 'val2']// key값에서 테이블 로우에 들어갈 칼럼값
    		    }]

    	};
    	
    	var SampleModel = Backbone.Model.extend({ //셈플 모델
    		initialize : function(options) {

    		}
    	});
    	
    	var Integration = Backbone.View.extend({
            initialize : function(options){
            	this.options = options || {};
            	this.docModel = this.options.docModel;   // document 모델
            	this.variables = this.options.variables; //variables를  store를 통하지 않고 option으로 넘겨 받을수 있음.
            	this.config = config; //위에서 설정한 config옵션. 
            	this.formCode = this.infoData.formCode;  // formCode. formCode는  info데이터에 있음
            	this.integratorFunction = new IntegratorFunction({
            		variables : this.variables,
            		config : this.config,
            		infoData : this.infoData
            	});
            	
            	this.infoData = this.options.infoData; // docInfo 데이타
            	this.model = new SampleModel(); //샘플 모델 선언
            	this.addEventToFormIntegrator(); //jQuery객체에 이벤트 바인딩
            },
            render : function(){
            	this.integratorFunction.render();
            	this.unBindEvent();
            	this.bindEvent();
            	$('#cseltest').trigger('change')
            },
            
            bindEvent : function(){
            	$('#cseltest').on('change', $.proxy(this.changeSelect, this));
            },
            
            unBindEvent : function(){
            	$('#cseltest').off('change');
            },
            
            changeSelect : function(e){
            	var self = this;
            	var value = $(e.currentTarget).find('option:selected').attr('data-id');
            	this.model.fetch({
            		url : GO.contextRoot + 'api/approval/integration/eventinvoker/'+this.formCode+'/showDesc',
            		async : true,
            		data : {val2 : value},
            		success : function(model){
            			var data = model.toJSON();
            			self.renderTableByData(data.returnData.returnDesc);
            		}
            	});
            },
            
            renderTableByData : function(parsedList){
            	$('#testTable tbody td').empty();
        		$('#testTable tbody td').html(Hogan.compile('<span>{{#data}}{{{val3}}}<br>{{/data}}</span>').render({data : parsedList}))
            },
            
            getIntegrationData : function(){
            	this.variables['getDocNum'] = '1111';
            	this.variables['getStatus'] = '1111';
            	this.variables['selectValue1'] = $('input[name="radiotest1"]:checked').val();
            	this.variables['selectValue2'] = $('input[name="radiotest2"]:checked').val();
            	this.variables['selectValue3'] = $('input[name="radiotest1"]:checked').val();
            	this.variables['getId'] = '1111';            	
            	return this.variables;
            },
            
            validateIntegrationData : function(){
            	return true;
            },
            
            clearEmptyIntegrationData : function(){
            	
            },
            
            addEventToFormIntegrator : function(){
            	//외부에서 사용할수 있도록 jQuery 전역 객체에 함수를 바인딩. 
            	$.goIntegrationForm = { 
            			getIntegrationData : _.bind(this.getIntegrationData, this),
            			validateIntegrationData : _.bind(this.validateIntegrationData, this),
            			clearEmptyIntegrationData : _.bind(this.clearEmptyIntegrationData, this)
            	};
            }
    	});
    	
    	return Integration;
    });
