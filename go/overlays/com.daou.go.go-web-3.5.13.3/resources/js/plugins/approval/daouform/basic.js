//기본 연동 샘플. require를 이용하여 필요한 모듈 사용
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

    	var Integration = Backbone.View.extend({ //
            initialize : function(options){
            	////////////// 추가된 코드 (options에서 받아오는 값들. 선언하지 않아도 상관 없음.)////////////
            	this.options = options || {};
            	this.docModel = this.options.docModel; // document 모델
            	this.variables = this.options.variables; //variables를  store를 통하지 않고 option으로 넘겨 받을수 있음.
            	this.infoData = this.options.infoData; // docInfo 데이타
            	////////////// 추가된 코드  끝////////////
            },
            render : function(){ // docStatus가  'Create'or 'TempSave' 일때 불리는 함수. 2.0.0 이전의 쓰던 연동코드를 여기에서 구현하면 됩니다
            	console.log('연동-render');
            },
            
            renderViewMode : function(){ // 읽기모드에서 함수가 필요한 경우 여기에다 정의. 필수값 아님
            	console.log('연동-renderVeiwMode');
            },
            
            beforeSave :function() {
            	console.log('연동-beforeSave');
            },
            
            afterSave :function() {
            	console.log('연동-afterSave');
            },
            
            validate :function() {
            	console.log('연동-validate');
            	return true;
            },
            
            getDocVariables : function(){
            	console.log('연동-getDocVariables');
            }
        });
    	return Integration;
	});
