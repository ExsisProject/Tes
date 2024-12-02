define([
    "backbone",
    "admin/collections/approval/integration_query"
],
function(Backbone, IntegrationQueryCollection) {

	
	var IntegrationEventModel = Backbone.Model.extend({
		
	});
	
	var IntegrationEventCollection = Backbone.Collection.extend({
		model : IntegrationEventModel
	});	
	
	var InputModel = Backbone.Model.extend({
		
	});
	
	var OutputModel = Backbone.Model.extend({
		
	});
	
    /**
    *
    * 결재 연동 모델
    * IntegrationDetailModel.java
    */
    var IntegrationDetailModel = Backbone.Model.extend({

    	inputModel : null,
    	outputModel : null,
        initialize: function() {
        	
        },
        makeSubModel : function(){
        	this.inputModel = new InputModel({
        		useInput : this.get('useInput'),
        		inputDataSourceName : this.get('inputDataSourceName'),
        		inputDataType : this.get('inputDataType'),
        		usePublic : this.get('usePublic'),
        		inputKeyValueSeparator : this.get('inputKeyValueSeparator'),
        		inputElementSeparator : this.get('inputElementSeparator'),
        		htmlEditable : this.get('htmlEditable'),
        		validatorBeanName : this.get('validatorBeanName'),
        		inputQueries : new IntegrationQueryCollection(this.get('inputQueries')),
        		requiredParams : this.get('requiredParams'),
        		events : new IntegrationEventCollection(this.get('events'))
        	});
        	this.outputModel = new OutputModel({
        		useOutput : this.get('useOutput'),
        		outputDataSourceName : this.get('outputDataSourceName'),
        		outputDataType : this.get('outputDataType'),
        		returnAllVariables : this.get('returnAllVariables'),
        		customReturnedVariables : this.get('customReturnedVariables'),
        		outputKeyValueSeparator : this.get('outputKeyValueSeparator'),
        		outputElementSeparator : this.get('outputElementSeparator'),
        		outputQueries : new IntegrationQueryCollection(this.get('outputQueries'))
        	});
        },
        getInputModel : function(){
        	return this.inputModel;
        },
        getOutputModel : function(){
        	return this.outputModel;
        }
    });

    return IntegrationDetailModel;
});