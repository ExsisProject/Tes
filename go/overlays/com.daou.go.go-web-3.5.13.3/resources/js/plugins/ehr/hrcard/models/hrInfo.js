define([
        "backbone",
        "app"
        ],
function(
		Backbone,
		GO
){
	var instance = null;
	var BasicInfoModel = Backbone.Model.extend({
		
		initialize : function(options) {
			this.options = options || {};
       		this.userid = this.options.userid; 
       		this.method = this.options.method;
		},
		
		url : function() {
        	return [GO.contextRoot + "api/ehr/hrcard/info", this.userid].join('/');
        },
        
        setFromFormData: function(formData,tabType) {
        	var wrap = {};
        	var datas = {};
        	_.each(formData, function(v, k) {
        		datas[k] = (v == '') ? null : v;
        	});
        	
        	wrap[tabType] = datas;
        	this.set(wrap);
        },
        validate : function(attrs){
        	//신상탭에서 시작일자가 종료일자보다 작으면 경고창
        	if(attrs.detail){
        		var detailObj = attrs.detail;
				if(detailObj.startDt && detailObj.endDt){
					if(!GO.util.isAfter(detailObj.startDt,detailObj.endDt)){
						return "error";
					}
				}
        	}
        },
        isValidation : function(array,tabType){
        	//array로 받는 나머지 탭들에 대한 시작일 종료일 validation
        	if(tabType == 'duty'){
	        	if(array.beginDate && array.endDate){
	        		if(!GO.util.isAfterOrSameDate(array.beginDate,array.endDate)){
	        			return false;
	        		}
	        	}
        	}
        	
        	if(tabType == 'career' || tabType == 'edu'){ 
        		if(array.fromDate && array.toDate){ 
        			if(!GO.util.isAfterOrSameDate(array.fromDate,array.toDate)){ 
        				return false; 
        			} 
        		} 
        	} 
        	
        	if(tabType == 'license'){
	        	if(array.receiveDate && array.expirationDate){
	        		if(!GO.util.isAfterOrSameDate(array.receiveDate,array.expirationDate)){
	        			return false;
	        		}
	        	}
        	}
        	
        	if(tabType == 'military'){
	        	if(array.joinDate && array.dischargeDate){
	        		if(!GO.util.isAfterOrSameDate(array.joinDate,array.dischargeDate)){
	        			return false;
	        		}
	        	}
        	}
        	
        	
        	if(tabType == 'abroad'){
	        	if(array.startPeriod && array.endPeriod){
	        		if(!GO.util.isAfterOrSameDate(array.startPeriod,array.endPeriod)){
	        			return false;
	        		}
	        	}
        	}
        	
        	if(tabType == 'academic'){
	        	if(array.admissionDate && array.graduationDate){
	        		if(!GO.util.isAfter(array.admissionDate,array.graduationDate)){
	        			return false;
	        		}
	        	}
        	}
        	
        	return true;
        	
        }
	});
	
	return BasicInfoModel;
});