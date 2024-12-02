//복리 Point 신청서
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

    	var Integration = Backbone.View.extend({
            initialize : function(options){
            	////////////// 추가된 코드 (options에서 받아오는 값들. 선언하지 않아도 상관 없음.)////////////
            	this.options = options || {};
            	this.docModel = this.options.docModel; // document 모델
            	this.variables = this.options.variables; //variables를  store를 통하지 않고 option으로 넘겨 받을수 있음.
            	this.infoData = this.options.infoData; // docInfo 데이타
            	////////////// 추가된 코드  끝////////////
            },
            
            render : function(){ // docStatus가  'Create'or 'TempSave' 일때 불리는 함수. Edit모드  
                console.info("복리 Point 신청서 !!!!!");
                var variables = GO.util.store.get('document.variables'); ///// OR this.variables를 써도 됨
                var variablesData = {
                    restPoint : variables.restPoint, // 미사용 연차
                };
                //양식에 쓰이는 함수객체
                var Formfunc = (function(){
                    var _variable = {}; //variables 데이터를 가지고 있는 private변수
                    var docMode = '';

                    /***
                     * 테이블을 그린다.
                     */
                    function render(){
                        $("#rest_point").text(GO.util.numberWithCommas(Number(_variable.restPoint)));
                    }

                    /***
                     * Private 변수를 set한다.
                     */
                    function setData(data, mode){
                        _variable = data;
                        docMode = mode;
                    }


                    /***
                     * 서버로 전송하기 위한 데이터들을 만듬
                     */
                    function getVariablesData(){
                        if(docMode == "EDIT"){
                            var data = getData();
                            $.extend(_variable, data);
                        }
                        return _variable;
                    };

                    //validation check
                    function validateIntegrationData(){

                        if(docMode == "EDIT"){
                            var data = getData();

                            try{
                                if(data.eventDate == ""){
                                    throw new Error("사용일을 입력해 주세요.");
                                }

                                if(data.usedPoint == ""){
                                    throw new Error("사용포인트를 입력해 주세요.");
                                }

                                if(Number(_variable.restPoint) < Number(data.usedPoint)){
                                    throw new Error("사용가능한 포인트를 초과 하였습니다. 사용포인트를 확인해주세요.");
                                }
                            }catch(e){
                                $.goError(e.message);
                                return false;
                            }
                        }

                        return true;
                    }

                    // 화면 emptyData 삭제
                    function clearEmptyIntegrationData(){

                    }

                    // 화면에 있는 데이터 조회
                    function getData(){
                        return {
                            eventDate : $("td.welfare_event_date input").val().split("(")[0],
                            usedPoint : $("td.welfare_used_point input").val().replace(/\,/g,''),
                            title : $("td.welfare_title input:checked").val(),
                            description : $("td.welfare_description input").val()
                        }
                    }

                    return {
                        setData : setData,
                        validateIntegrationData : validateIntegrationData,
                        render : render,
                        getVariablesData : getVariablesData,
                        clearEmptyIntegrationData : clearEmptyIntegrationData
                    };
                })(); //Formfunc end

                Formfunc.setData(variablesData, GO.util.store.get('document.docMode'));
                Formfunc.render();

                //외부에서 사용할수 있도록 jQuery 전역 객체에 함수를 바인딩.
                $.goIntegrationForm = {
                    getIntegrationData : function(){
                        return Formfunc.getVariablesData();
                    },
                    validateIntegrationData : function() {
                        return Formfunc.validateIntegrationData();
                    },
                    clearEmptyIntegrationData : function() {
                        Formfunc.clearEmptyIntegrationData();
                    }
                };
            },
            
            renderViewMode : function(){ // 읽기모드에서 함수가 필요한 경우 여기에다 정의
            	console.log('아무런 renderViewMode 함수가 없음.')
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
            }
        });
    	return Integration;
	});
