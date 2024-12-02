/**
 * 양식명: 휴일근무 결과 보고서
 * 시스템연동: OverWorksIntegration
 * 스크립트편집
 */
var Integration = Backbone.View.extend({
	initialize : function(options){
		this.options = options || {};
		this.docModel = this.options.docModel;
		this.variables = this.options.variables;
		this.infoData = this.options.infoData;
	},
	render : function(){
		var self = this;
		/* docStatus == 'Create'or 'TempSave' 일때 불리는 함수. (2.0.0 이전의 쓰던 연동코드를  구현) */
		//console.log(this.options);
		
		//근무일자 계산
		$('.overwork_date input').on('change', function(e){
			var startDate = new Date($('.overwork_date input:eq(0)').val());
			var endDate = new Date($('.overwork_date input:eq(1)').val());
			if(startDate != 'Invalid Date' && endDate != 'Invalid Date') {
				var workingDay = endDate - startDate;
				var count;
				if(workingDay >= 0) {
					count = workingDay / (24 * 60 * 60 * 1000) + 1;
				} else {
					count = workingDay / (24 * 60 * 60 * 1000);
				}
				$('#overwork_day').text(count);
			}
		});
	},
	
	renderViewMode : function(){
		/* 읽기모드에서 함수가 필요한 경우 구현 */
	},
	
	onEditDocument : function(){
		/* '수정 ' 버튼을 눌렀을때 실행. */
	},
	
	beforeSave : function() {
	},
	
	afterSave : function() {
	},
	
	validate : function() {
		var self = this;
		var relationDocument = $('#refDocPart .item_file');
		if(relationDocument.length == 0){
			$.goMessage('관련문서를 선택해주세요.');
			return false;
		}
		if(relationDocument.length > 1){
			$.goMessage('관련문서는 하나만 선택해주세요.');
			return false;
		}
		
		return true;
	},
	
	makeDocVariables : function() {
    	var self = this;
    	var data = {};
    	var dataList = new Array();
    	var mapObj = {};
    	
    	var drafter = this.options.docModel.drafterName;
		var jobNo = $('.overwork_jobno input').val();
		var workStartDate = $('.overwork_date input:eq(0)').val();
		var workEndDate = $('.overwork_date input:eq(1)').val();
		var subject = '휴일근무 결과보고 / ' + drafter + ' / ' + jobNo + ' / ' + workStartDate + '~' + workEndDate;
		
		console.log(subject);
		$('#subject').val(subject);
    	
		//works 연동 variables
    	mapObj["subject"] = subject;
    	mapObj["department"] = $('#draftDept').val();
    	mapObj["position"] = $('#position').val();
    	mapObj["name"] = $('#draftUser').val();
    	mapObj["fromdate"] = $('.overwork_date input:eq(0)').val().split('(')[0];
    	mapObj["todate"] = $('.overwork_date input:eq(1)').val().split('(')[0];
    	mapObj["jobno"] = $('.overwork_jobno input').val();
    	mapObj["fromtime"] = $('#start_time select:eq(0)').val() + '시 ' + $('#start_time select:eq(1)').val() + '분';
    	mapObj["totime"] = $('#end_time select:eq(0)').val() + '시 ' + $('#end_time select:eq(1)').val() + '분';
    	mapObj["place"] = $('.overwork_place input').val();
    	mapObj["accompany"] = $('.overwork_accompany input').val();
    	mapObj["content"] = $('.overwork_content textarea').val();
    	
    	var relationDocument = $('#refDocPart .item_file');
		if(relationDocument.length > 0){
			mapObj["relationdoc"] = $('.item_file .name').text().split('[')[1].split(']')[0];
		}
    	
    	dataList.push(mapObj);
    	
    	return dataList;
    },
        
	getDocVariables : function() {
		var self = this;
		var dataList = self.makeDocVariables();
		var mapObjJson = JSON.stringify(dataList);
		
		return {
			appletData : mapObjJson,
			appletId : 10
		}
	}
});
return Integration;