/**
 * 애플릿 폼 모델 애답터
 * 
 * 외부에서 주입된 데이터를 폼빌더 내부에서 사용되는 모델로 변환하는 작업을 담당.
 * 폼 빌더와 외부 시스템 사이의 의존성을 최소화하기 위해 개발됨. 초기 개발버전은 외부에서 사용하는 폼모델과
 * 폼 빌더에서 사용하는 폼모델을 동일하게 맞출 것이기 때문에 모델을 직접 생성시킨다.
 * 
 * 주입되는 데이터 구조가 달라질 경우 관련 변환작업을 여기서 수행해서 폼 빌더 자체의 수정은 최소화하도록 하는 것이 목적임.
 */

define('works/components/formbuilder/core/models/adapter', function(require) {
	
	var AppletFormModel = require('works/components/formbuilder/core/models/applet_form');
	
	return {
		toModel: function(appletFormData) {
			// 그냥 통과시킨다....
			return AppletFormModel.create(appletFormData);
		}
	}
});