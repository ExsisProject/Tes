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
    	};
    	
    	var EventModel = Backbone.Model.extend({
    		initialize : function(options) {
    		}
    	});
    	
    	var Integration = Backbone.View.extend({ //View이지만 그려지는것은 IntegratorFunction에서 그려진다.
            initialize : function(options){
            	this.options = options || {};
            	this.docModel = this.options.docModel;
            	this.variables = this.options.variables;
            	this.config = config;
            	this.infoData = this.options.infoData;
            	this.formCode = this.infoData.formCode;
            	this.integratorFunction = new IntegratorFunction({
            		variables : this.variables,
            		config : this.config,
            		infoData : this.infoData
            	});
            	this.eventModel = new EventModel();
            	this.addEventToFormIntegrator();
            },
            render : function(){
            	this.integratorFunction.render();
            	this.unBindEvent();
            	this.bindEvent();
            },
            
            bindEvent : function(){
            },
            
            unBindEvent : function(){
            },
            getIntegrationData : function(){
            	_.extend(this.variables, $('#document_content').getDocVariables());
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
